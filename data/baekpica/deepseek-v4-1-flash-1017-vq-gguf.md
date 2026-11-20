# Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-VQ-GGUF es una cuantizacion experimental de muy bajo bit del checkpoint DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario Baekpica el 17 de octubre de 2026. El modelo base es un transformer de mezcla de expertos (MoE) multimodal con capacidad de vision, contexto nativo de 1.048.576 tokens y un sistema Engram de tablas de n-gramas. La conversion reduce el checkpoint oficial de unos 510 GB a un GGUF base de aproximadamente 113,6 GB, pensado para caber en una unica estacion DGX Spark de 128 GB.

La innovacion principal de esta ficha no es el modelo en si, sino la tecnica de cuantizacion: los expertos enrutados, que concentran la mayor parte de los pesos, se almacenan con cuantizacion vectorial (VQ) de 8 dimensiones y aproximadamente 1,6 bits por peso, muy por debajo de los GGUF de 4 bits habituales. Se usan codebooks E4M3 por capa compartidos entre los 384 expertos, con indices de 13 bits en las capas 0-13 y de 12 bits en las 14-39, y ganancias de fila en F16. La atencion, los expertos compartidos, el embedding y la cabeza se mantienen en q4_K.

El modelo es relevante porque demuestra que es posible servir un MoE de gran tamano con contexto de un millon de tokens en hardware de consumo profesional, a costa de una perdida de fidelidad medible (KL de 0,369 frente al modelo original). Es una publicacion de investigacion exploratoria, no un reemplazo directo del modelo fuente: el propio autor advierte de fallos en razonamiento, texto roto a mitad de caracter y cambios de idioma dentro de una palabra. La licencia es MIT y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision) con MTP drafter y tablas Engram |
| Parametros totales | 485.283.840 (dato de safetensors del repo; el checkpoint fuente completo es de ~510 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (nativo, segun metadatos del modelo) |
| Tipos de cuantizacion | VQ 8-dim (~1,6 bits/peso) en expertos enrutados; q4_K en atencion, expertos compartidos, embedding y cabeza; F16 en ganancias de fila; vision en BF16 original |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (base ~113,6 GB, sidecar de vision ~1 GB, tablas Engram en `deepseek-engram/`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados por capa, expertos compartidos y atencion estandar. Incorpora un cabezal de prediccion multi-token (MTP) con tres torres DSpark de decodificacion especulativa, que se conservan embebidas en el GGUF base: los expertos de las torres usan VQ de 12 bits y el resto de pesos mantiene su precision nativa. Ademas, el modelo incluye tablas Engram de n-gramas (2 x 101,5 GB) que se leen en su sitio mediante `--engram-dir` y no se modifican en la conversion.

La conversion sigue sin cambios la receta `vq8sh14-q4k-mtpnative` de YoungAi, con las herramientas fijadas a commits concretos. No se uso datos de calibracion en esta version: los codebooks se ajustaron sin estadisticas de activacion, lo que explica parte de la perdida de fidelidad. La variante iVQ publicada el 22 de octubre de 2026 refito los codebooks, asignaciones y ganancias de fila con 3,65 millones de tokens de calibracion, reduciendo el error de salida de los expertos en todas las capas (7% para un token tipico) y bajando la KL de 0,369 a 0,350 (-4,9%), con el mismo formato y tamano de archivo. Los detalles de entrenamiento del modelo fuente (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (thinking) heredado del modelo fuente.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante la torre DeepSeek-ViT, el aligner y los sesgos de router `bias_vl` por capa, en un sidecar GGUF separado en BF16.
- Generacion de codigo y matematicas, aunque con degradacion notable por la cuantizacion agresiva de los expertos.
- Tool calling y function calling, con mejora reportada en la variante iVQ para texto de chat, razonamiento y llamadas a herramientas.
- Decodificacion especulativa nativa mediante las tres torres MTP DSpark embebidas.
- Contexto de 1.048.576 tokens, con un KV cache completo medido en 0,89 GB para esta arquitectura.
- Capacidades multilingues limitadas a ingles y chino; el chino y el japones de web no mejoran con la variante iVQ.
- Soporte de tablas Engram de n-gramas para recuperacion de patrones lexicos.

## Casos de uso

- Procesamiento de documentos largos en una sola pasada: con 1.048.576 tokens de contexto y un KV cache de solo 0,89 GB, el modelo puede ingerir libros completos, expedientes o bases de codigo extensas sin fragmentacion, algo inviable en modelos de contexto corto.
- Despliegue en una DGX Spark de 128 GB: el GGUF base de 113,6 GB mas el sidecar de vision y las tablas Engram permiten servir un MoE multimodal de gran tamano en una unica estacion de escritorio, sin cluster multi-GPU.
- Investigacion en cuantizacion extrema: sirve como banco de pruebas para estudiar el impacto de VQ de ~1,6 bits en expertos enrutados, comparando esta version sin calibracion con la variante iVQ calibrada y con el modelo FP4/FP8 original.
- Asistentes de codigo con contexto de repositorio: la ventana de 1M tokens y el soporte de tool calling permiten integrar el modelo en pipelines que necesitan leer multiples archivos y ejecutar acciones, aceptando la perdida de calidad en las respuestas.
- Analisis de imagenes y documentos escaneados: el pipeline image-text-to-text con la torre ViT en BF16 permite tareas de descripcion, extraccion y respuesta sobre imagenes, siempre que se tolere la degradacion del texto generado.
- Prototipado de agentes multi-paso: las torres MTP de decodificacion especulativa aceleran la generacion en bucles de agente, y el contexto largo reduce la necesidad de resumir el estado entre pasos.
- Evaluacion comparativa de recetas de cuantizacion: util para medir KL, acuerdo de siguiente token y errores por capa entre la receta VQ sin calibracion y la receta iVQ con imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de fidelidad publicados son los de la variante iVQ frente al modelo FP4/FP8 original, medidos sobre 58.803 tokens reservados:

| Metrica | VQ (esta version) | iVQ (calibrada) | Original FP4/FP8 |
|---|---|---|---|
| Divergencia KL | 0,369 | 0,350 (-4,9%) | referencia |
| Acuerdo de siguiente token | sin cambios | sin cambios | referencia |
| Error de salida de expertos | referencia | -7% por capa (token tipico) | - |

La velocidad en DGX Spark se midio sobre la variante hVQ y no se detalla en la informacion proporcionada.

## Requisitos de hardware

- VRAM/disco para inferencia: el GGUF base ocupa ~113,6 GB, mas ~1 GB del sidecar de vision y las tablas Engram de 2 x 101,5 GB en `deepseek-engram/`, que se leen en su sitio y no se cargan en memoria de forma completa.
- GPU recomendada: una DGX Spark (GB10) de 128 GB, que es el objetivo de diseno de esta conversion.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) por el tamano del base GGUF, incluso con cuantizaciones adicionales no publicadas.
- Opciones de despliegue: runtime `ds4-dfm-rs` sobre CUDA en DGX Spark, o `ds4-server` de YoungAi, que lee los mismos archivos.
- Latencia y throughput: no disponibles en la informacion proporcionada; solo se indica que la velocidad se midio sobre hVQ sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-VQ-GGUF | 485.283.840 (safetensors del repo); checkpoint fuente ~510 GB | 1.048.576 | VQ ~1,6 bits + q4_K | MIT | Hugging Face, 1.612 descargas |
| DeepSeek-V4.1-Flash-1017-iVQ-GGUF | mismo base | 1.048.576 | VQ calibrada, mismo layout | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | ~510 GB | 1.048.576 | FP4/FP8 nativo | no disponible | Hugging Face |
| wenzhouwu/YoungAi-DeepSeek-V4.1-Flash | mismo base | 1.048.576 | receta vq8sh14-q4k-mtpnative | no disponible | Hugging Face |

## Limitaciones y advertencias

- Cuantizacion experimental de muy bajo bit: el autor advierte de razonamiento que entra en bucle o no llega a una respuesta, texto roto a mitad de caracter (mostrado como `�`) y cambios de idioma dentro de una palabra.
- No es un reemplazo directo del modelo fuente; la calidad general es inferior y la KL de 0,369 frente al original es medible.
- Los archivos pueden cambiar: la linea de conversiones sigue en investigacion y cualquier archivo puede ser reemplazado por una nueva revision. Para fijar una build hay que descargar un commit concreto con `--revision <commit>`.
- Riesgo de mezclar tablas Engram incorrectas: usar las tablas de `deepseek-engram/` (1017) y no las de `DeepSeek-V4.1-Flash`, ya que los nombres y tamanos no cambiaron y un motor apuntado a las antiguas cargaria un modelo desajustado sin error.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y el chino/japones de web no mejora con la variante iVQ.
- Sesgos conocidos del modelo fuente no documentados en la informacion disponible.
- Licencia MIT permite uso comercial, pero la degradacion de calidad hace desaconsejable su uso en produccion sin evaluacion previa.
- Requiere hardware especifico (DGX Spark de 128 GB) y runtimes concretos (`ds4-dfm-rs` o `ds4-server`), lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF
- Variante iVQ calibrada: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-iVQ-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/1bae0e1088993b9b82de08f59de5be5a34e42170
- Receta YoungAi aplicada: https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash
- Repositorio YoungAi: https://github.com/fodelf/YoungAi
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Discusiones y reporte de problemas: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF/discussions
