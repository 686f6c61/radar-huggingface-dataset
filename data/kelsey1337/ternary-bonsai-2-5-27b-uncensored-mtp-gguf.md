# kelsey1337/Ternary-Bonsai-2.5-27B-Uncensored-MTP-GGUF

## Resumen

Ternary Bonsai 2.5 27B Uncensored MTP es una cuantización GGUF de tipo ternario (formato PTQ1_0) del modelo Bonsai 2.5 27B de Prism ML, en su variante "uncensored" o "abliterated" publicada por AtomicChat, a la que se le ha reincorporado la cabeza de predicción multi-token (MTP) original de Prism para habilitar decodificación especulativa. El autor de esta ficha, kelsey1337, realiza un transplante byte a byte de 36 matrices editadas por AtomicChat (capas 27 a 44) sobre el pack ternario con MTP de Prism, sin recuantizar, de modo que el resultado conserva el comportamiento del modelo sin censura y recupera la aceleración por especulación.

El modelo resuelve dos problemas concretos: por un lado, ofrece una versión sin mecanismos de rechazo (eliminados mediante abliteration sobre 36 matrices) y, por otro, recupera el rendimiento de inferencia que se pierde cuando se elimina la cabeza MTP, con una aceleración medida de aproximadamente 1,65x (178,0 t/s frente a 107,8 t/s sin especulación en una RTX 4090). El archivo final ocupa 6.232.818.944 bytes (unos 6,23 GB) y contiene 27.320.697.856 parámetros totales en un único fichero GGUF.

La relevancia actual reside en que combina cuantización ternaria extrema (PTQ1_0), decodificación especulativa sin pérdida y un ajuste de alineación agresivo en un solo artefacto de poco más de 6 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo. No obstante, requiere un fork específico de llama.cpp (PrismML) y no funciona con llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas SSM (state space model) y atención; incluye cabeza MTP (multi-token prediction) de 15 tensores en `blk.64.*` |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración de ejecución documentada) |
| Tipos de cuantizacion | PTQ1_0 (ternaria, ~1,58 bits por peso efectivos); KV cache en q8_0 en la configuración de referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Ternary-Bonsai-2.5-27B-Uncensored-PTQ1_0-mtp.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Bonsai 2.5 27B de Prism ML, construido a partir de Qwen3.8-27B de Alibaba Cloud según la model card. La arquitectura combina capas de atención con capas SSM: el transplante afecta a `attn_output` en las capas 27, 31, 35, 39 y 43, y a `ssm_out` en las otras 13 capas editadas, lo que confirma una estructura híbrida atención/SSM. La cuantización ternaria PTQ1_0 empaqueta los pesos en códigos ternarios, reduciendo el modelo de 27B a 6,23 GB.

Sobre el modelo base, AtomicChat aplicó una técnica de abliteration: eliminó una dirección de rechazo de 36 matrices en las capas 27 a 44 y horneó el cambio directamente en los códigos ternarios del pack PTQ1_0 sin MTP. Este repositorio copia esas 36 matrices byte a byte dentro del pack `PTQ1_0-mtp` de Prism, manteniendo los otros 815 tensores compartidos y los 15 tensores de la cabeza MTP idénticos al original. No hay recuantización: la copia es byte a byte dentro del mismo empaquetado PTQ1_0. La herramienta `graft_bytes.py` incluida en el repo realiza el transplante sin decodificar pesos y rechaza la operación si los tipos o formas de los tensores compartidos difieren.

La cabeza MTP no fue editada, por lo que la decodificación especulativa sigue siendo sin pérdida: el modelo sin censura verifica cada token propuesto por la cabeza. La aceptación de borradores medida fue del 66% frente al 65% del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento y respuesta a instrucciones en modo conversacional, con parámetros de muestreo documentados (temperatura 1,0, top-p 0,95, top-k 20, min-p 0).
- Capacidades de visión: se puede cargar el proyector multimodal `Ternary-Bonsai-2.5-27B-mmproj-Q8_0.gguf` de Prism para entrada de imágenes.
- Decodificación especulativa mediante cabeza MTP integrada, con aceleración de aproximadamente 1,65x en decodificación.
- Comportamiento sin censura: 0 rechazos en 12 peticiones comunes evaluadas (frente a 8 de 12 del modelo original), con el modo "thinking" desactivado.
- Compatible con endpoints (tag `endpoints_compatible`) y con el servidor `llama-server` mediante plantilla Jinja (`--jinja`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo permite estudiar el efecto de eliminar direcciones de rechazo en un transformer híbrido, comparando perplejidad (10,3502 frente a 10,0345 del stock) y tasas de rechazo (0/12 frente a 8/12) con el modelo original.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que requiera temáticas que los modelos alineados suelen rechazar, ejecutable en una sola GPU de consumo gracias a los 6,23 GB del fichero.
- Despliegue local de un modelo de 27B en hardware de consumo: con 17,5 GB de VRAM en una RTX 4090 a contexto completo de 262.144 tokens, permite servir un modelo grande en estaciones de trabajo sin GPUs de datacenter.
- Procesamiento de documentos largos con visión: carga del proyector multimodal y contexto de 262.144 tokens para analizar documentos escaneados, capturas o diagramas junto con texto extenso en una sola pasada.
- Evaluación de decodificación especulativa: la cabeza MTP integrada y los parámetros `--spec-*` permiten medir aceptación de borradores (66%) y throughput (178,0 t/s con MTP frente a 107,8 t/s sin especulación) en pipelines de inferencia.
- Prototipado de asistentes conversacionales sin filtros: para entornos de investigación controlados donde se necesita estudiar el comportamiento del modelo ante peticiones sensibles sin la interferencia de rechazos, con la advertencia de responsabilidad que indica el autor.
- Análisis de rendimiento de cuantización ternaria: comparación de perplejidad por fragmentos (268 fragmentos de 512 tokens sobre un corpus local de 436 KB) entre el pack ternario stock, el abliterated y el transplante, útil para estudiar el coste de la cuantización extrema.

## Benchmarks y rendimiento

Los datos disponibles provienen de la verificación del autor en una RTX 4090 con el fork PrismML de llama.cpp (`prism-b12128-d7b2896`), contexto de 262.144 tokens, KV cache q8_0, un slot, proyector de visión cargado, decodificación greedy y 3 prompts de 512 tokens. VRAM utilizada: 17,5 GB.

| Metrica | Stock PTQ1_0-mtp | AtomicChat PTQ1_0 | Este fichero |
|---|---|---|---|
| Perplejidad (corpus local 436 KB, 268 × 512) | 10,0345 ± 0,108 | 10,3502 ± 0,113 | 10,3502 ± 0,113 |
| Rechazos (12 peticiones comunes, thinking off) | 8 / 12 | no disponible | 0 / 12 |
| Decodificación con MTP, n_max 3 (t/s) | 176,4 | sin cabeza MTP | 178,0 |
| Decodificación sin especulación (t/s) | no disponible | no disponible | 107,8 |
| Aceptación de borradores | 65% | no disponible | 66% |
| MMLU (según AtomicChat) | 401 / 500 | 406 / 500 | no disponible |

El autor señala que la abliteration cuesta un +3,1% de perplejidad frente al stock en este corpus, y que la perplejidad sobre texto general detecta deriva que MMLU no captura. El conjunto de rechazos es pequeño (12 prompts) y se puntúa por palabras clave, por lo que debe tratarse como una comprobación de sanidad, no como un benchmark. Los resultados por prompt están en `refusals.jsonl` y los números completos en `evaluation.json`.

## Requisitos de hardware

- VRAM estimada: 17,5 GB con contexto completo de 262.144 tokens, KV cache q8_0, un slot y proyector de visión cargado (medición del autor en RTX 4090). El fichero de pesos ocupa 6,23 GB.
- GPU recomendadas: RTX 4090 (configuración verificada por el autor). No se dispone de datos para A100, H100 u otras GPUs.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 con la configuración documentada. No se dispone de datos para GPUs con menos de 24 GB.
- Opciones de despliegue: exclusivamente el fork PrismML de llama.cpp (`prism-b12128-d7b2896`); llama.cpp estándar no soporta PTQ1_0. Se usa `llama-server` con `--jinja`, `-fa on`, `-ngl 99`, `-c 262144`, `-ctk q8_0`, `-ctv q8_0`, `-np 1` y flags `--spec-type draft-mtp --spec-draft-n-min 0 --spec-draft-n-max 3 --spec-draft-p-min 0`. vLLM, Ollama y TGI no están soportados según la información disponible.
- Latencia y throughput: 178,0 t/s en decodificación con MTP (n_max 3) y 107,8 t/s sin especulación en RTX 4090. El autor advierte que MTP ralentiza el prefill, por lo que para prompts largos con respuestas cortas conviene eliminar los flags `--spec-*`.
- Compilación del fork: a fecha 2026-11-24, el build descarga un bundle de UI web cuya versión fijada ya no existe en Hugging Face; hay que configurar con `-DLLAMA_USE_PREBUILT_UI=OFF -DLLAMA_BUILD_UI=OFF` y arrancar el servidor con `--no-webui`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este fichero (Ternary Bonsai 2.5 27B Uncensored MTP) | 27,3B | 262.144 | PTQ1_0 ternaria + MTP | Apache 2.0 | Sin censura, MTP integrado, 178,0 t/s en 4090 |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF (stock) | 27,3B | 262.144 | PTQ1_0 ternaria + MTP | Apache 2.0 | Alineado, perplejidad 10,0345, 176,4 t/s, 8/12 rechazos |
| AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF | 27,3B | 262.144 | PTQ1_0 ternaria sin MTP | Apache 2.0 | Sin censura, sin cabeza MTP, sin aceleración especulativa, perplejidad 10,3502 |

No se dispone de información sobre otros modelos comparables de la misma categoría (27B ternarios) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo sigue peticiones que el modelo original rechaza; el autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- La abliteration incrementa la perplejidad un +3,1% frente al stock en el corpus de evaluación (10,3502 frente a 10,0345), lo que indica cierta deriva en la calidad del modelo respecto al original.
- La evaluación de rechazos se basa en solo 12 prompts puntuados por palabras clave; no es un benchmark representativo y puede no capturar todos los comportamientos del modelo.
- Requiere un fork específico de llama.cpp (PrismML); no funciona con llama.cpp estándar ni, según la información disponible, con vLLM, Ollama o TGI.
- El build del fork tiene problemas conocidos con el bundle de UI web (versión fijada inexistente en Hugging Face), lo que obliga a compilar sin UI y arrancar con `--no-webui`.
- MTP ralentiza el prefill; para cargas con prompts largos y respuestas cortas conviene desactivar la especulación.
- No se dispone de información sobre idiomas soportados, sesgos conocidos, riesgo de alucinación específico ni soporte de tool calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado sin validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base deriva de Qwen3.8-27B de Alibaba Cloud y de las ediciones de AtomicChat, todos bajo Apache 2.0 según la model card; conviene revisar `LICENSE` y `NOTICE.txt` del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/Ternary-Bonsai-2.5-27B-Uncensored-MTP-GGUF
- Modelo base con MTP (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo base sin censura (AtomicChat): https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Fork PrismML de llama.cpp (release prism-b12128-d7b2896): https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b12128-d7b2896
