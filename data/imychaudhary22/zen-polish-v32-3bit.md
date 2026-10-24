# imYChaudhary22/zen-polish-v32-3bit

## Resumen

ZenPolish v3.2 4B (3-bit DWQ) es una compilación cuantizada del modelo de limpieza de dictado de ZenVoice, un fine-tune de Qwen3-4B-Instruct-2507 especializado en transformar la salida cruda de un sistema de speech-to-text en texto escrito correcto. El modelo recibe transcripciones literales y devuelve el mismo contenido con puntuación y mayúsculas restauradas, muletillas y falsos arranques eliminados, y números, importes, fechas, horas, correos y URL en su forma escrita. No es un modelo conversacional general: es una etapa de post-proceso dentro de un pipeline de dictado.

La arquitectura subyacente es un transformer denso de 4.022.468.096 parámetros, heredado de la familia Qwen3-4B-Instruct-2507, con el adaptador de fine-tune ya fusionado en los pesos bf16 y posteriormente cuantizado a 3 bits mediante DWQ (distilled weight quantization) con group size 64. El resultado pesa 1,76 GB y se ejecuta íntegramente en dispositivo vía MLX en Apple Silicon, con un consumo pico de 2,17 GB de memoria y unos 0,27 s por dictado en un Apple M5.

Su relevancia es acotada pero clara: es la única variante de la familia que baja de 2 GB manteniendo el tamaño de 4B, a costa de degradación medible frente a la versión de 4 bits en dictados de longitud media y en datos held-out. El propio autor recomienda la build de 4 bits o Lite (1,05 GB) salvo que exista una restricción estricta de espacio. Licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507), pesos fusionados tras fine-tune |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 3-bit DWQ (distilled weight quantization), group size 64; existe build de 4 bits y version bf16 |
| Idiomas soportados | no disponible como listado oficial; el alcance declarado es limpieza de dictado en ingles |
| Licencia | Apache-2.0 (heredada de Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors (libreria MLX); repo de 1,8 GB, pesos de 1,76 GB |
| Temperatura de decodificacion | greedy (temp=0.0) recomendado por el autor |
| Memoria pico en runtime | 2,17 GB (ZenVoice app runtime, Apple M5) |
| Velocidad de decodificacion | ~58 tok/s (Apple M5), frente a ~47 tok/s de la build de 4 bits |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros. Sobre esa base se aplicó un fine-tune para la tarea de limpieza de dictado, cuyo adaptador se fusionó en los pesos bf16 (`zen-polish-v32-bf16`) para producir un modelo plano sin adaptador que cargar. Posteriormente esos pesos se cuantizaron a 3 bits con DWQ: destilación sobre objetivos logit top-1.024 generados por el modelo bf16, con 1.024 muestras de entrenamiento de hasta 512 tokens y learning rate 1e-6, en formato de entrenamiento equivalente al de inferencia.

El detalle técnico crítico es la plantilla de chat. v3.2 se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y el `chat_template.jinja` incluido en el repo termina el prompt de generación con ese bloque. Con la plantilla estándar de Qwen3-4B-Instruct-2507, las builds de 3 bits se desvían hacia tokens `<tool_call>`, por lo que usar la plantilla propia no es opcional. No se documentan en la información disponible detalles sobre volumen total de tokens de entrenamiento del fine-tune original, composición exacta del dataset ni uso de RLHF/DPO; sí se indica que los datos de entrenamiento provienen únicamente de fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0.

## Capacidades

- Limpieza de dictado: restauración de puntuación y mayúsculas sobre transcripciones literales de speech-to-text.
- Eliminación de muletillas, titubeos y falsos arranques, preservando el significado y las palabras del hablante.
- Normalización de formas escritas: números, importes monetarios, fechas, horas, direcciones de correo y URL (por ejemplo, "two thousand five hundred dollars and fifty cents" → "$2,500.50").
- Ajuste de registro y mayúsculas según una línea de contexto `app:` incluida en el prompt (la app de origen del dictado).
- Salida restringida al texto limpio, sin comentarios ni explicaciones, lo que facilita su integración como etapa determinista de un pipeline.
- Ejecución totalmente on-device vía MLX, sin llamadas a servicios externos.
- Modo thinking desactivado en el uso previsto (`enable_thinking=False`); el modelo no está pensado para razonamiento multi-paso.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Dictado en aplicaciones de notas y productividad: el modelo se sitúa entre el motor ASR y el campo de texto del editor, y devuelve en ~0,27 s un párrafo con puntuación, mayúsculas y números normalizados, sin salir del dispositivo.
- Correo y mensajería por voz: con una línea `app:` indicando el contexto, ajusta mayúsculas y registro al cliente de correo o de chat de destino, y convierte "at jane at example dot com" en una dirección válida.
- Entrada de datos estructurados por voz en entornos de campo: importes, fechas y horas dictados en crudo se normalizan a formato escrito, lo que reduce errores de transcripción manual en hojas de cálculo o formularios.
- Transcripción de reuniones y notas clínicas: se puede insertar como etapa de post-proceso sobre la salida de un ASR para obtener actas legibles, troceando previamente las intervenciones largas por frases.
- Subtitulado y documentación interna: limpieza por lotes de transcripciones ya generadas, ejecutable en un Mac portátil sin GPU dedicada, útil para equipos que procesan material sensible que no puede enviarse a la nube.
- Aplicaciones de accesibilidad: entrada por voz para usuarios con movilidad reducida, donde la latencia baja y la ausencia de red son requisitos, con un pico de memoria de 2,17 GB que cabe en un portátil de 8 GB.
- Prototipado de pipelines de dictado en MLX: la build de 3 bits permite validar la calidad de v3.2 en hardware con poca memoria antes de decidir el salto a la build de 4 bits.

## Benchmarks y rendimiento

Greedy decoding, Apple M5, MLX 0.32.2. Datos publicados por el autor en la model card.

| Suite | Metrica | v3.2 3-bit DWQ | v3.2 4-bit DWQ | v2.2 Lite (1.7B) |
|---|---|---|---|---|
| eval_v500 (500, cortos) | WER / exact | 4,7% / 64,2% | 4,7% / 67,2% | 5,5% / 65,8% |
| eval_v500 (500, cortos) | Punct F1 | 0,838 | 0,859 | 0,863 |
| Held-out v2.2 (500) | WER / exact | 9,0% / 37,0% | 8,0% / 40,6% | 8,9% / 37,0% |
| Medios, 50-99 palabras (150) | WER | 15,1% | 10,3% | 11,0% |
| ZenVoice app runtime (eval_v500) | Model WER / exact | 4,0% / 65,4% | 3,9% / 64,6% | 4,0% / 65,4% |
| ZenVoice app runtime (eval_v500) | Media s por dictado | 0,27 | 0,32 | 0,23 |
| ZenVoice app runtime (eval_v500) | Memoria pico | 2,17 GB | 2,65 GB | 1,39 GB |
| Pesos | Tamano | 1,76 GB | 2,26 GB | 1,05 GB |

Lectura de los datos: en dictados cortos la pérdida frente a 4 bits es de 3 puntos en exact match y 0,021 en Punct F1, con el mismo WER. La degradación se concentra en dictados medios (15,1% WER frente a 10,3%) y en datos held-out de la generación anterior, donde empata con Lite pese a triplicar el tamaño en disco. En el runtime real de la app la diferencia práctica es mínima (4,0% frente a 3,9% de WER), con un 19% menos de memoria pico y un 16% menos de tiempo por dictado que la build de 4 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,17 GB de pico medidos en Apple M5 con la app ZenVoice; los pesos ocupan 1,76 GB, por lo que un margen de 2,5-3 GB de memoria disponible es prudente.
- Plataforma: MLX sobre Apple Silicon (M1/M2/M3/M4/M5). No se documenta soporte CUDA, ROCm ni CPU genérica en la información disponible.
- GPU de datacenter (A100, H100): no aplica; el repo solo distribuye pesos en formato MLX, no safetensors estándar de PyTorch ni GGUF.
- GPU de consumo: encaja en cualquier Mac con memoria unificada de 8 GB o más; en GPUs NVIDIA no hay ruta de despliegue documentada.
- Opciones de despliegue: `mlx_lm` (`load` + `generate`) con `make_sampler(temp=0.0)`; vLLM, llama.cpp, Ollama y TGI no están soportados por el formato de pesos publicado.
- Latencia y throughput: ~58 tok/s de decodificación y 0,27 s de media por dictado en Apple M5 (frente a 47 tok/s y 0,32 s en la build de 4 bits).
- Requisito de plantilla: cargar el `chat_template.jinja` incluido en el repo; con la plantilla estándar de Qwen3-4B-Instruct-2507 las builds de 3 bits derivan a tokens `<tool_call>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Memoria pico | WER eval_v500 / medios | Licencia |
|---|---|---|---|---|---|---|
| zen-polish-v32-3bit | 4B | no disponible | 1,76 GB | 2,17 GB | 4,7% / 15,1% | Apache-2.0 |
| zen-polish-v32-4bit | 4B | no disponible | 2,26 GB | 2,65 GB | 4,7% / 10,3% | Apache-2.0 |
| zen-polish-v32-bf16 | 4B | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |
| zen-polish-v2.2 Lite | 1,7B | no disponible | 1,05 GB | 1,39 GB | 5,5% / 11,0% | no disponible en la informacion proporcionada |

Frente a la build de 4 bits, esta versión gana 0,5 GB de disco, 0,48 GB de memoria pico y un 16% de latencia, pero pierde 2,1 puntos de WER en dictados medios y 3,6 puntos de exact match en held-out. Frente a Lite (1,7B), pierde en todos los ejes salvo el WER en dictados cortos (4,7% frente a 5,5%), y Lite ocupa un 40% menos de disco y un 36% menos de memoria. La conclusión del propio autor es que esta build solo tiene sentido si se necesita el 4B por debajo de 2 GB.

## Limitaciones y advertencias

- Degradación medible en dictados de longitud media (50-99 palabras): 15,1% WER frente al 10,3% de la build de 4 bits, prácticamente 5 puntos porcentuales de diferencia.
- En datos held-out de la generación v2.2 cae al nivel de Lite (9,0% WER, 37,0% exact), sin ventaja frente a un modelo de 1,7B.
- Entradas de una sola pasada de 300+ palabras pueden repetirse; ZenVoice trocea los dictados largos en fragmentos alineados por frase antes de limpiar, y esa lógica no está incluida en el modelo.
- Requiere decodificación greedy; no se documenta comportamiento con temperatura > 0 ni con muestreo.
- Dependencia estricta de la plantilla de chat incluida; usar la plantilla estándar de Qwen3 deriva en salidas corruptas con tokens `<tool_call>`.
- Alcance limitado a limpieza de dictado en inglés. No se documenta soporte multilingüe, y el modelo no debe emplearse como asistente conversacional, para código, matemáticas o razonamiento.
- Riesgo de alucinación no cuantificado en la información disponible: al ser un modelo generativo, puede alterar el contenido del hablante al "corregirlo"; el prompt de sistema pide explícitamente preservar significado y palabras, pero no hay garantía formal.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez frente a acentos y dialectos del ASR de entrada.
- Licencia Apache-2.0 permite uso comercial; los datos de entrenamiento declarados son solo MIT, Apache-2.0, CC-BY-4.0 y CC0, con lista de atribución en el repositorio de ZenVoice.
- Repositorio sin descargas ni likes en el momento de la consulta y con una sola versión publicada; la madurez del proyecto es baja y no hay garantía de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imYChaudhary22/zen-polish-v32-3bit
- Modelo base bf16: https://huggingface.co/imYChaudhary22/zen-polish-v32-bf16
- Build de 4 bits: https://huggingface.co/imYChaudhary22/zen-polish-v32-4bit
- Licencia del modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (paper, blog, repositorio de ZenVoice ni demo); los únicos resultados obtenidos eran contenido no relacionado y se han descartado. No se dispone por tanto de enlaces adicionales verificables.
