# cowWhySo/AuroraASR-1M-ONNX-MLX-EP

## Resumen

AuroraASR-1M-ONNX-MLX-EP es una conversión experimental a grafo ONNX del modelo de reconocimiento automático de voz AuroraASR-1M, publicado por el usuario cowWhySo a partir de los pesos originales de AuroraAI-Research (Apache-2.0, commit fuente `cd307b54b4d666d6ad7dc982a7a58a96d6e7f942`). No es un fine-tune ni un nuevo entrenamiento: se trata del mismo artefacto acústico exportado para ejecutarse con el execution provider MLX de ONNX Runtime sobre la GPU de los Apple Silicon. El modelo base es una red acústica Conformer-lite con CTC y pesos compartidos de 949.073 parámetros (aproximadamente 0,95 M), entrenada únicamente en inglés.

La relevancia del repositorio es fundamentalmente de ingeniería: documenta mediciones de latencia sobre macOS comparando ONNX Runtime CPU, ONNX Runtime con MLX EP y Core ML, con resultados de paridad numérica frente a un fixture de referencia. En la ruta publicada (ONNX Runtime MLX EP FP32, forma estática) la inferencia acústica alcanza una P50 de 2,630 ms y una P95 de 3,096 ms, frente a 5,654 ms de P50 en CPU con el mismo grafo ONNX.

Conviene subrayar que el propio autor advierte de que el transcript de referencia contiene errores en varias palabras, de que no se ha ejecutado ningún benchmark WER multihablante sobre la conversión y de que el resultado no demuestra ubicación en la Neural Engine ni madurez para producción. Es, por tanto, una pieza útil para validar pipelines de inferencia en Apple Silicon, no un modelo ASR de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-lite con CTC y pesos compartidos (red acustica), exportada como grafo ONNX estatico |
| Parametros totales | 949.073 (aproximadamente 0,95 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto: entrada fija de [1, 1101, 80] log-mel, equivalente a un clip de audio de aproximadamente 11 s. Sin soporte de longitud arbitraria ni streaming |
| Tipos de cuantizacion | FP32 en el artefacto publicado. Se probo FP16 en Core ML y se descarto por fallo de tolerancia numerica (desviacion maxima de logits 0,239) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`aurora_asr.onnx`, SHA-256 `48f3179cf8053e7a4040eaaa30237cbf40ae09165ac22821a1375eb7143246b8`); el formato de los pesos originales del modelo base no se detalla en la informacion disponible |
| Backend de ejecucion | ONNX Runtime con MLX execution provider (GPU de Apple Silicon); tambien ruta CPU de ONNX Runtime y Core ML |
| Entrada | Onda mono a 16 kHz, convertida a log-mel de 80 bins con estandarizacion por enunciado; remuestreo HQ con `soxr` necesario para paridad con la referencia |
| Salida | Logits CTC [1, 276, 257], decodificacion greedy con SentencePiece |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La red es un Conformer-lite con capas de pesos compartidos y cabeza CTC, un diseno compacto pensado para ASR de baja latencia en dispositivo. El frontend convierte la onda mono de 16 kHz en características log-mel de 80 bins con estandarizacion por enunciado; la salida CTC se decodifica de forma greedy con un vocabulario SentencePiece. El grafo exportado fija formas estáticas ([1, 1101, 80] a la entrada y [1, 276, 257] a la salida), lo que limita el artefacto a clips de aproximadamente 11 segundos.

Este repositorio no aporta información sobre el entrenamiento: es una conversión de grafo de inferencia, no un fine-tune ni un nuevo resultado de entrenamiento. No se dispone de datos sobre número de tokens, composición del dataset, ni sobre si el modelo original usó RLHF/DPO (categorías que, por otra parte, no aplican de forma directa a un sistema CTC supervisado). La innovación técnica aquí es de despliegue: la exportación a ONNX ejecutable sobre el EP de MLX, con verificación de paridad frente a la referencia (coincidencia de argmax por frame de 1,0 y transcripción exacta en el único fixture guardado) y una desviación máxima de logits de 0,000052 en la ruta MLX FP32 estática. El perfilado registró 48 eventos de nodo MLX en la ejecución estática, aunque el autor aclara que eso no demuestra ausencia total de fallback a CPU en cualquier despliegue.

## Capacidades

- Transcripcion de voz a texto en ingles sobre clips cortos (aproximadamente 11 s) con entrada de forma fija.
- Decodificacion CTC greedy con SentencePiece integrada en el runtime (`aurora_runtime.py`).
- Ejecucion acelerada en la GPU de Apple Silicon mediante ONNX Runtime y el execution provider MLX.
- Ejecucion alternativa en CPU con el mismo grafo ONNX (P50 de 5,654 ms en el fixture de referencia).
- Ruta Core ML FP32 disponible con fines comparativos (no es el backend publicado por defecto).
- Validacion de paridad numerica reproducible mediante `mac_validate.py` frente a un fixture de audio JFK.
- No soporta streaming, audio de duracion arbitraria, diarizacion, traduccion ni tool calling: el grafo acustico no gestiona longitudes variables por si mismo.

## Casos de uso

- Pruebas de integracion de ONNX Runtime con el execution provider MLX en macOS: el repositorio incluye scripts (`mac_validate.py`, `aurora_runtime.py`) y un conjunto de mediciones reproducible para verificar que el EP funciona en un Mac concreto antes de adoptarlo en otros proyectos.
- Regresion numerica de conversiones de modelos: el fixture JFK y las metricas de desviacion maxima de logits (0,000052 en MLX FP32, 0,010687 en Core ML FP32) sirven como base para comparar exportaciones y detectar degradaciones al cambiar de backend o de precisión.
- Benchmarking de latencia en Apple Silicon: el modelo, al tener menos de un millón de parámetros, actúa como carga de prueba muy ligera para medir P50/P95 de un EP sin que el cuello de botella sea el cómputo.
- Comandos de voz cortos en ingles dentro de una app macOS: con clips de menos de 11 segundos y vocabulario acotado, el modelo puede transcribir instrucciones simples en local, sin salida a red.
- Dictado de notas breves con privacidad por diseño: al ejecutarse en el dispositivo y ocupar 112,7 MiB de RSS pico de proceso con MLX EP, es viable en un portátil sin GPU dedicada, siempre que se acepte la calidad limitada del modelo.
- Segmentacion previa en pipelines ASR mayores: usar el modelo como transcribidor de fragmentos de 11 s dentro de un sistema que corte el audio y agregue los resultados, aprovechando su baja latencia (4,434 ms P50 de pipeline en caliente).
- Docencia y demos de ASR en directo: el coste de arranque y la huella de memoria permiten ejecutar la demo en un portátil Apple Silicon sin infraestructura adicional.
- No se recomienda como motor de transcripcion de produccion con requisitos de precision: no existe benchmark WER de la conversion y el propio autor advierte que el transcript de referencia contiene errores.

## Benchmarks y rendimiento

Latencia de la inferencia acustica sobre [1, 1101, 80] (aproximadamente 11 s de audio JFK). P50/P95 cubren solo la inferencia acustica ya calentada, sin carga de fichero, preprocesado, carga de modelo ni decodificacion CTC. Mediciones de una sola sesion, secuenciales, sin control termico declarado y procedentes de logs de terminal del usuario, no reejecutadas de forma independiente.

| Backend / precision | P50 (ms) | P95 (ms) | RSS pico del proceso (MiB) | Estado |
|---|---:|---:|---:|---|
| ONNX Runtime CPU FP32 (estatico) | 5,654 | 5,849 | 95,1 | PASS |
| ONNX Runtime + MLX EP FP32 (estatico) | 2,630 | 3,096 | 112,7 | PASS |
| Core ML FP32 (solo CPU) | 3,441 | 3,834 | 138,5 | PASS |
| Core ML FP16 (ALL) | 1,484 | 3,876 | 153,2 | FAIL (tolerancia de logits) |
| MLX EP FP32 (dinamico) | 9,697 | 10,402 | 135,6 | Exploratorio, fallback a CPU observado |

Aceleraciones declaradas: MLX estatico frente a ONNX CPU estatico, 2,15x en P50 acustico; Core ML FP32 CPU frente a ONNX CPU, 1,64x; MLX estatico frente a Core ML FP32 CPU, 1,31x (no es una comparacion equivalente contra Core ML con compute units `ALL`).

Pipeline completo en caliente, reutilizando el mismo audio JFK en memoria:

| Backend | Compute units | P50 pipeline (ms) | P95 (ms) | Alcance |
|---|---|---:|---:|---|
| MLX FP32 | MLX EP + posible fallback a CPU | 4,434 | 4,726 | Frontend + modelo acustico + decodificacion CTC cacheada |
| Core ML FP32 | `ALL` solicitado, ubicacion real no verificada | 4,451 | 7,295 | Frontend + modelo acustico + decodificacion CTC cacheada |

No se han publicado resultados de benchmarks de calidad (WER, MMLU, HumanEval, GSM8K ni equivalentes) para esta conversion en la informacion disponible. Las cifras de WER del modelo original corresponden a la model card de AuroraAI-Research y no deben atribuirse a esta exportacion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Backend | Latencia declarada | Licencia | Notas |
|---|---|---|---|---|---|---|
| cowWhySo/AuroraASR-1M-ONNX-MLX-EP (este) | 949.073 | Fija, ~11 s ([1, 1101, 80]) | ONNX Runtime + MLX EP (tambien CPU, Core ML) | 2,630 ms P50 acustico; 4,434 ms P50 pipeline | Apache-2.0 | Requiere ONNX Runtime; sin soporte de duracion arbitraria |
| cowWhySo/AuroraASR-1M-MLX | 949.073 (mismos pesos) | Cualquier longitud | `mlx.nn` nativo, sin ONNX Runtime | 1,22x mas rapido que este grafo ONNX frente al MLX EP | no disponible en la informacion | Port nativo; el autor lo recomienda sobre esta conversion |
| AuroraAI-Research/AuroraASR-1M (upstream) | 949.073 | No detallado en la informacion disponible | Checkpoint original | No disponible | Apache-2.0 | Referencia de precision y WER original; no se ha ejecutado benchmark WER sobre las conversiones |

No se dispone en la informacion proporcionada de comparaciones con otros modelos ASR de la misma categoria (por ejemplo, familia Whisper u otros CTC compactos), por lo que no se incluyen cifras frente a ellos.

## Requisitos de hardware

- Huella de memoria medida (RSS pico del proceso Python completo, no solo asignacion del modelo): 95,1 MiB con ONNX Runtime CPU FP32; 112,7 MiB con MLX EP FP32; 138,5 MiB con Core ML FP32; 153,2 MiB con Core ML FP16.
- Pesos FP32 estimados en torno a 3,8 MB para 949.073 parametros (calculo aritmetico propio, no reportado por el autor); el grueso del consumo proviene del runtime.
- GPU: se requiere Apple Silicon para la ruta MLX EP. No se documenta soporte CUDA ni ROCm en la informacion disponible.
- Cabe en cualquier Mac con Apple Silicon; el modelo es lo bastante pequeno como para no ser el limitante, y el autor probo la instalacion con Python 3.13.
- Despliegue: ONNX Runtime (MLX EP o CPU EP) y, opcionalmente, Core ML. El autor advierte explicitamente de no usar `transformers.pipeline()` directamente sobre estos grafos sin un wrapper adecuado.
- Scripts incluidos: `mac_validate.py` para validacion numerica y `aurora_runtime.py` para inferencia; tambien `requirements-macos.txt`.
- Throughput (transcripciones por segundo) no disponible. Latencia: 2,630 ms P50 / 3,096 ms P95 en la parte acustica y 4,434 ms P50 / 4,726 ms P95 en pipeline completo en caliente, sobre el hardware de las pruebas (modelo de Mac no especificado en la informacion).
- El remuestreo con `soxr` en calidad HQ es necesario para replicar la paridad con la referencia.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue declarado.
- Entrada de forma estatica fija ([1, 1101, 80]): el grafo acustico no maneja longitudes arbitrarias y no se declara soporte de streaming ni de audio de duracion variable. Para otras duraciones hay que trocear y agregar fuera del modelo.
- La paridad con la referencia no equivale a calidad: el transcript JFK de referencia contiene errores en varias palabras y no se ejecuto ningun benchmark WER multihablante sobre la conversion.
- Mediciones no verificadas de forma independiente: son logs de terminal aportados por el usuario, de una sola sesion, secuenciales y sin control de temperatura ni de frecuencia de reloj declarado.
- El numero de eventos de nodo MLX (48 en la ejecucion estatica) no demuestra ausencia de fallback a CPU en todos los despliegues; la ubicacion en la Neural Engine no se verifico en ningun caso.
- Core ML FP16 quedo fuera del release por fallo de tolerancia numerica (desviacion maxima de logits 0,239), pese a su menor P50 (1,484 ms).
- Las cifras de precision del modelo upstream no deben atribuirse a esta conversion, tal como indica el autor.
- El modelo base es extremadamente pequeno (menos de un millon de parametros), lo que en la practica limita la calidad frente a sistemas ASR de mayor tamano; no hay datos de WER que permitan cuantificar la brecha.
- Licencia Apache-2.0 en el artefacto de conversion y en el checkpoint fuente, lo que permite uso comercial, pero la ausencia de evaluacion de calidad hace arriesgado usarlo en produccion sin validacion propia.
- Advertencia de integracion: no usar `transformers.pipeline()` directamente con estos grafos ONNX sin un wrapper adaptado.
- Senales de baja validacion por parte de la comunidad: 0 descargas y 1 like en el momento de la ficha, repositorio de 0,0 GB y publicacion el 18 de octubre de 2026.
- El repositorio README aparece truncado en la informacion disponible (seccion "Shipped files"), por lo que el inventario completo de ficheros liberados no puede confirmarse.
- El autor recomienda usar el port nativo `cowWhySo/AuroraASR-1M-MLX` en lugar de este repositorio salvo que se necesite ONNX Runtime.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cowWhySo/AuroraASR-1M-ONNX-MLX-EP
- Modelo base (upstream): https://huggingface.co/AuroraAI-Research/AuroraASR-1M
- Model card del modelo original y reporte de WER original: https://huggingface.co/AuroraAI-Research/AuroraASR-1M
- Port nativo MLX recomendado por el autor: https://huggingface.co/cowWhySo/AuroraASR-1M-MLX
- Commit fuente de los pesos: `cd307b54b4d666d6ad7dc982a7a58a96d6e7f942` (Apache-2.0)
- Mediciones en bruto: `benchmarks/aurora_mac_benchmarks_user_log_2026-10-18.json` (incluido en el repositorio)
- Fichero de inferencia: `aurora_asr.onnx`, SHA-256 `48f3179cf8053e7a4040eaaa30237cbf40ae09165ac22821a1375eb7143246b8`
- Scripts de validacion y runtime: `mac_validate.py`, `aurora_runtime.py`, `requirements-macos.txt`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
