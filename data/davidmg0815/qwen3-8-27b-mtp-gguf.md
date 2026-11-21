# Davidmg0815/Qwen3.8-27B-MTP-GGUF

## Resumen

Davidmg0815/Qwen3.8-27B-MTP-GGUF es una conversión a formato GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Davidmg0815. El valor diferencial del repositorio no es la conversión en sí, sino la separación del cabezal de predicción multi-token (MTP) en un fichero independiente (`qwen3.8-27b-MTP-Q8_0.gguf`) que puede cargarse como modelo borrador en `llama-server` mediante `--spec-type draft-mtp`. Los repositorios GGUF habituales no exponen estos tensores como fichero aparte, lo que impide usar la decodificación especulativa nativa del modelo.

El modelo base es un transformer multimodal de 26.895.998.464 parámetros (unos 26,9 mil millones) con entrada de imagen y texto, contexto entrenado de 262.144 tokens y licencia Apache 2.0. La conversión se realizó desde los pesos BF16 originales y se distribuye en cuatro ficheros: Q8_0 (27,3 GB), Q6_K (21,0 GB), el borrador MTP Q8_0 (3,0 GB) y el proyector visión/vídeo en F16 (0,9 GB), con un total de repositorio de 54,8 GB.

La relevancia práctica del repositorio reside en sus mediciones abiertas: el autor documenta ganancias de velocidad de 1,56× a 2,79× según el tipo de texto al activar el borrador MTP, con una tasa global de aceptación del 57,3 % sobre 7.842 tokens borrador. Todas las cifras se obtuvieron en un equipo de tres RTX 3080 de 20 GB (60 GB de VRAM totales), lo que sitúa el modelo en el rango de hardware de consumo profesional y no de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabezal de predicción multi-token (MTP); detalles internos de capas y atención no disponibles |
| Parámetros totales | 26.895.998.464 (26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (contexto entrenado completo, según el autor) |
| Tipos de cuantización | Q8_0 (8,50 bpw) y Q6_K (6,57 bpw) para el modelo objetivo; MTP en Q8_0; proyector multimodal en F16 |
| Idiomas soportados | alemán (de) e inglés (en), según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería llama.cpp) |
| Tamaño del repositorio | 54,8 GB |
| Ficheros | `qwen3.8-27b-Q8_0.gguf` (27,3 GB), `qwen3.8-27b-Q6_K.gguf` (21,0 GB), `qwen3.8-27b-MTP-Q8_0.gguf` (3,0 GB), `qwen3.8-27b-mmproj-F16.gguf` (0,9 GB) |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |
| Descargas / likes | 792 / 1 |
| Fecha de creación / actualización | 2026-08-14 / 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (número de capas, configuración de atención, mecanismo de fusión multimodal). Lo que sí se documenta es la presencia de un cabezal MTP, cuyos tensores residen en el checkpoint original y se controlan mediante el parámetro `mtp_num_hidden_layers` de la `config.json`. El autor los ha extraído de los modelos objetivo con `--no-mtp` y los ha empaquetado exclusivamente en el fichero borrador, de modo que objetivo y borrador deben usarse conjuntamente. El componente multimodal se sirve como proyector separado (`--mmproj`), lo que permite desactivar la entrada de imagen omitiendo ese fichero.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. La conversión se realizó desde los pesos BF16 originales, sin información sobre recalibrado o ajuste posterior. La innovación técnica destacable del repositorio es la habilitación práctica de la decodificación especulativa MTP en llama.cpp: el borrador propone hasta 3 tokens por paso (`--spec-draft-n-max 3`) y se ejecuta íntegramente en GPU (`--spec-draft-ngl 99`).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento explícito con tres niveles de esfuerzo configurables: `low`, `medium` y `xhigh` (este último es el valor por defecto). No existe nivel `high`; la plantilla de chat descarta valores desconocidos sin error.
- Desactivación del modo pensamiento mediante `{"chat_template_kwargs": {"enable_thinking": false}}`. Ni `/no_think` en el prompt ni `enable_thinking` en el nivel superior de la petición surten efecto.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con proyector visión/vídeo independiente en F16.
- Generación de código y matemáticas, con resultados medidos en HumanEval+ y MATH-500.
- Decodificación especulativa mediante borrador MTP separado, con aceptación variable según la previsibilidad del texto.
- Soporte de plantilla Jinja (`--jinja`) para el formateo de conversaciones.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático y verificación de problemas: el modelo alcanza un 98,0 % en MATH-500 (150 tareas, Q8_0, un solo intento, presupuesto de 24k tokens), lo que lo hace adecuado para tutoría automática, generación de soluciones paso a paso y validación de ejercicios con razonamiento largo.
- Generación y revisión de código: con un 88,4–90,2 % en HumanEval+ (164 tareas verificadas por ejecución), encaja en pipelines de asistencia a programación, generación de tests y revisión automatizada de parches, siempre que el contexto quepa en los 262k tokens.
- Documentación técnica y traducción: el borrador MTP ofrece 51,8 t/s en traducción (70,9 % de aceptación) y 41,7 t/s en texto técnico, por lo que resulta viable para traducción asistida de documentación entre alemán e inglés con latencia interactiva.
- Extracción estructurada y generación de JSON: con 47,6 t/s y 59,7 % de aceptación en salida estructurada, sirve para rellenar esquemas, generar informes con formato fijo y alimentar APIs que requieren salida parseable.
- Descripción y análisis de imágenes: al soportar entrada image-text-to-text con proyector dedicado, puede emplearse en moderación de contenido visual, generación de pies de foto y extracción de información de capturas o documentos escaneados.
- Despliegue en hardware de consumo profesional: el autor demuestra el modelo completo en Q8_0 con contexto de 97k ocupando 31,2 GB de 60 GB en tres RTX 3080, lo que habilita prototipado y servicios internos sin GPU de centro de datos.
- Chat de atención al cliente en alemán e inglés: con decodificación especulativa y 39,5 t/s en texto libre, es apto para conversaciones multi-turno donde la latencia percibida importa, aceptando la pérdida de velocidad en texto creativo (35,9 t/s).

## Benchmarks y rendimiento

Resultados medidos por el autor en tres RTX 3080 de 20 GB con EPYC 7F32, con el arnés de medida publicado en `bench/` y errores documentados en `METHODIK.md`.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| MATH-500 | 98,0 % | 150 tareas, Q8_0, un intento, presupuesto 24k |
| HumanEval+ | 88,4 – 90,2 % | 164 tareas, verificación por ejecución |

Rendimiento de decodificación (Q8_0, contexto 97k, prompts en alemán, mediana de 2–3 pasadas):

| Tipo de texto | Sin borrador | Con borrador MTP | Factor | Aceptación |
|---|---|---|---|---|
| Texto de razonamiento | 19,6 t/s | 54,7 t/s | 2,79× | no disponible |
| Repetición | 22,9 t/s | 62,0 t/s | 2,71× | 85,0 % |
| Enumeración | 23,0 t/s | 61,6 t/s | 2,68× | 93,1 % |
| Traducción | 22,9 t/s | 51,8 t/s | 2,26× | 70,9 % |
| Estructura / JSON | 23,0 t/s | 47,6 t/s | 2,07× | 59,7 % |
| Texto técnico | 23,0 t/s | 41,7 t/s | 1,81× | 48,0 % |
| Código | 23,0 t/s | 41,1 t/s | 1,79× | 48,9 % |
| Texto libre | 22,9 t/s | 39,5 t/s | 1,72× | 44,5 % |
| Texto creativo | 23,0 t/s | 35,9 t/s | 1,56× | 37,4 % |

Tasa global de aceptación del borrador: 57,3 % (4.491 de 7.842 tokens). Sin borrador, la velocidad es plana (22,9–23,0 t/s) independientemente del tipo de texto. Comparativa interna Q6_K frente a Q8_0 sin borrador: 23,7 t/s frente a 19,6 t/s (Q6_K un 21 % más rápido por menor volumen de lectura). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 27,3 GB para el objetivo Q8_0, 21,0 GB para Q6_K, más 3,0 GB del borrador MTP y 0,9 GB del proyector multimodal. El autor reporta 31,2 GB ocupados de 60 GB con Q8_0, borrador, KV y búferes a contexto de 97k.
- Configuración validada: tres RTX 3080 de 20 GB (Ampere, sin NVLink) con `--tensor-split 1,1,1` y `--n-gpu-layers 99`.
- Cabe en GPU de consumo: sí, con reparto entre varias tarjetas. Un solo dispositivo de 24 GB no alberga el Q8_0 con contexto largo; el Q6_K (21 GB) deja margen muy ajustado para KV y búferes.
- Aceleradores de centro de datos (A100, H100) no están documentados en la información disponible, aunque por capacidad de memoria permitirían el despliegue en una sola unidad.
- Despliegue: `llama-server` de llama.cpp con `--flash-attn on`, caché KV en `q8_0` (`--cache-type-k q8_0 --cache-type-v q8_0`), `--jinja` y `--parallel 1`. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: 39,5 t/s en texto libre y 54,7 t/s en razonamiento con borrador; 19,6–23,7 t/s sin él. El cuello de botella es el ancho de banda de memoria, no el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Davidmg0815/Qwen3.8-27B-MTP-GGUF | 26,9 B | 262.144 | Apache 2.0 | GGUF (Q8_0, Q6_K) | Borrador MTP separado; multimodal; 98,0 % MATH-500 y 88,4–90,2 % HumanEval+ medidos por el autor |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Apache 2.0 | safetensors (BF16) | Modelo base original; sin datos de benchmarks en la información disponible |
| Otras conversiones GGUF de Qwen3.8-27B | 26,9 B | no disponible | Apache 2.0 | GGUF | No exponen el cabezal MTP como fichero borrador independiente, según el autor |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Idiomas: los metadatos solo declaran alemán e inglés. El rendimiento en castellano no está evaluado y no debe asumirse.
- Cobertura de benchmarks limitada: solo MATH-500 y HumanEval+, ambos medidos por el autor con su propio arnés; no hay resultados de MMLU, GSM8K ni evaluaciones independientes.
- La ganancia de MTP depende fuertemente del tipo de texto: 1,56× en texto creativo frente a 2,79× en razonamiento. Medir con benchmarks de enumeración sobreestima el beneficio real en chat.
- Objetivo y borrador están acoplados: los tensores MTP se han eliminado del modelo objetivo con `--no-mtp`, por lo que usar el borrador con otro fichero objetivo es inválido.
- Control del modo pensamiento poco intuitivo: `/no_think` y `enable_thinking` en el nivel superior se ignoran silenciosamente; debe usarse `chat_template_kwargs`. El nivel `high` no existe y se descarta sin error.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni de tasas de alucinación.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción; las cifras proceden de un único equipo y configuración.
- El repositorio tiene 792 descargas y 1 like, con validación comunitaria escasa.
- La model card está redactada en alemán y las mediciones se hicieron con prompts en alemán; la extrapolación a otros idiomas no está respaldada por datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Davidmg0815/Qwen3.8-27B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Metodología de medición: `METHODIK.md` en el repositorio
- Arnés de benchmarks: directorio `bench/` en el repositorio
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
