# ScarletKc/ScarletKc-2.0-GGUF

## Resumen

ScarletKc-2.0-GGUF es la version cuantizada en formato GGUF del modelo multimodal ScarletKc-2.0, un modelo de 27B parametros (26.895.998.464 exactos) desarrollado por el creador independiente KC (scarletkc.com). El modelo combina un backbone de lenguaje y razonamiento de la familia Qwen3.5 (`Qwen3_5TextModel`) con un proyector visual derivado de `Qwen3VLVisionModel`, lo que le permite procesar entradas de imagen y texto (pipeline `image-text-to-text`). Esta publicacion concreta es una conversion a GGUF pensada para `llama.cpp` y runtimes compatibles, no el modelo original en safetensors.

La relevancia de esta ficha radica en que ofrece una via de despliegue local y en hardware de consumo para un modelo de 27B con capacidades de vision y razonamiento, algo poco habitual en ese rango de tamano. El repositorio incluye dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M (16,7 GB, 4,98 BPW) y el proyector multimodal en F16 (928 MB), este ultimo opcional si solo se usa texto. La licencia es Apache 2.0, lo que facilita el uso comercial.

El modelo esta etiquetado para chino, ingles y japones (zh, en, ja), soporta modo de razonamiento explicito (`<think>...</think>`) activado por defecto mediante la plantilla de chat, y expone una API compatible con OpenAI a traves de `llama-server`. La informacion publica disponible es escasa en cuanto a benchmarks y datos de entrenamiento, por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal: `Qwen3_5TextModel` (lenguaje y razonamiento) + `Qwen3VLVisionModel` (proyector visual) |
| Parametros totales | 26.895.998.464 (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de uso emplean `-c 16384` |
| Tipos de cuantizacion | Q4_K_M (4,98 BPW) para el modelo de lenguaje; F16 para el proyector multimodal |
| Idiomas soportados | chino (zh), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + mmproj); safetensors bf16 en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido que combina un modelo de lenguaje de la familia Qwen3.5 (`Qwen3_5TextModel`) con un proyector visual (`Qwen3VLVisionModel`), lo que habilita la entrada image-text-to-text. El modelo base incluye una cabeza de decodificacion especulativa (`mtp.*`), que se ha omitido en la conversion a GGUF por compatibilidad con el runtime, pero que se conserva en los pesos BF16 originales. La conversion se realizo con `llama.cpp` (build `b1-5676dfb`) mediante `convert_hf_to_gguf.py --outtype bf16 --no-mtp` y posterior cuantizacion con `llama-quantize ... Q4_K_M`; el proyector visual se exporto con `--mmproj --outtype f16`.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni el metodo de alineacion (RLHF, DPO u otro). La model card remite a la ficha del modelo base para los detalles de arquitectura y alineacion, pero esos datos no estan incluidos en la informacion proporcionada. El modelo base parece derivar de `Qwen/Qwen3.8-27B` y de `JonathanColetti/Qwen3.8-27B-Uncensored`, segun la seccion de licencia, aunque no se detalla la relacion exacta.

## Capacidades

- Generacion de texto conversacional multi-turno en chino, ingles y japones.
- Razonamiento explicito con modo thinking (`<think>...</think>`) activado por defecto en la plantilla de chat; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Comprension de imagenes y texto (image-text-to-text) mediante el proyector multimodal opcional.
- Razonamiento multimodal: combina vision y trazas de razonamiento.
- Servidor compatible con OpenAI a traves de `llama-server` (endpoints compatibles).
- Uso en CLI con `llama-cli` para comprobaciones de un solo turno.
- Soporte de plantilla Jinja (`--jinja`) para formateo de conversaciones.
- No se documenta explicitamente soporte de tool calling ni de function calling en la informacion proporcionada; no disponible.
- No se documenta explicitamente soporte de agentes multi-paso; no disponible.

## Casos de uso

- Asistente conversacional local multilingue: desplegado con `llama-server` en un equipo con GPU, el modelo gestiona dialogos multi-turno en chino, ingles y japones con una ventana configurable (por ejemplo 16K tokens), adecuado para prototipos y uso personal sin depender de la nube.
- Analisis de imagenes con razonamiento: cargando el proyector `mmproj-F16.gguf`, el modelo puede describir, interpretar o razonar sobre capturas, diagramas o fotografias, combinando la traza de pensamiento con la respuesta final.
- Documentacion tecnica asistida por vision: extraer y explicar el contenido de diagramas de arquitectura o capturas de pantalla en un flujo de trabajo de desarrollo, aprovechando el modo thinking para justificar conclusiones.
- Prototipado de aplicaciones con API compatible OpenAI: al exponer endpoints compatibles, se puede integrar en clientes y SDKs existentes sin cambiar el codigo de integracion, sustituyendo el backend por `llama-server`.
- Evaluacion de modelos de 27B en hardware de consumo: la cuantizacion Q4_K_M (16,7 GB) permite probar un modelo de este tamano en GPU con 24 GB de VRAM, util para investigadores que comparan alternativas sin acceso a clusters.
- Generacion de texto y razonamiento en entornos con requisitos de privacidad: al ejecutarse en local con licencia Apache 2.0, encaja en escenarios donde los datos no pueden salir de la infraestructura propia.
- Chat de un solo turno en CLI: verificaciones rapidas con `llama-cli --single-turn` para validar respuestas o comparar configuraciones de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,7 GB para el modelo de lenguaje en Q4_K_M; anadir unos 0,93 GB si se carga el proyector multimodal F16 (total aproximado de 17,6 GB).
- GPU recomendadas: tarjetas con 24 GB o mas de VRAM, como RTX 3090, RTX 4090, A100 o H100, para cargar todas las capas en GPU (`-ngl 99`).
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB) con Q4_K_M; en tarjetas de 16 GB no cabe el modelo completo en GPU y requeriria offload parcial a CPU.
- Opciones de despliegue: `llama.cpp` (build reciente con soporte de arquitectura `qwen35`), `llama-server` (API compatible OpenAI), `llama-cli`; otros runtimes compatibles con GGUF no estan confirmados en la informacion proporcionada.
- Parametros de muestreo recomendados: `temperature 0.6–0.7`, `top_p 0.9`, `top_k 20`; evitar decodificacion greedy (`--temp 0`) en conversacion abierta.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| ScarletKc-2.0-GGUF | 27B | no disponible | Texto + vision | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B | 27B (segun referencia) | no disponible | no disponible | Apache 2.0 (segun referencia) | safetensors (presumible) |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B (segun referencia) | no disponible | no disponible | Apache 2.0 (segun referencia) | no disponible |

La comparativa se limita a los modelos citados en la propia model card como relacionados por licencia y base. No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cabeza de decodificacion especulativa (`mtp.*`) se omite en la version GGUF, por lo que se pierde esa optimizacion de velocidad respecto a los pesos BF16 originales.
- Requiere una build reciente de `llama.cpp` con soporte de la arquitectura `qwen35`; versiones antiguas no cargaran el modelo.
- El modo thinking esta activado por defecto; en produccion conviene desactivarlo explicitamente si no se desean trazas de razonamiento en la respuesta.
- La decodificacion greedy (`--temp 0`) produce respuestas degradadas en conversacion abierta segun la propia model card; usar los parametros de muestreo recomendados.
- Cobertura linguistica limitada a chino, ingles y japones; el rendimiento en castellano no esta documentado.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- El modelo base esta vinculado a una variante "Uncensored" (`JonathanColetti/Qwen3.8-27B-Uncensored`), lo que puede implicar menor filtrado de contenido; conviene evaluar el comportamiento antes de un despliegue en produccion.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo derivado conviene revisar las condiciones del modelo base y de los datasets de entrenamiento, no detalladas aqui.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ScarletKc/ScarletKc-2.0-GGUF
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Sitio del autor: https://scarletkc.com
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo relacionado (uncensored): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo relacionado (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
