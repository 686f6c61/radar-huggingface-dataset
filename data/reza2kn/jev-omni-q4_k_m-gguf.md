# Reza2kn/Jev-Omni-Q4_K_M-GGUF

# Jev-Omni Q4_K_M GGUF: ficha tecnica

## Resumen

Jev-Omni Q4_K_M GGUF es una version cuantizada en formato GGUF del modelo multimodal akhilaaa3/Jev-Omni, publicada por el usuario Reza2kn. No se trata de un generador de texto al uso, sino de un clasificador de decision: recibe un estado (texto), una pregunta y una lista de opciones, y devuelve una probabilidad por opcion en lugar de prosa generada. El modelo base parte de un backbone Gemma 4 12B y anade un proyector multimodal y una cabeza de decision en FP32, lo que le permite procesar texto, imagen, audio y video.

La cuantizacion se realizo con llama.cpp (revision `6e60f35608ec6918b44a9839c0c433687165f086`) y `llama-quantize ... Q4_K_M 8`, sin matriz de importancia. El resultado declara 4,95 bits por peso de media, con un backbone de 6,87 GiB en disco y 11.907.350.576 parametros totales. El proyector multimodal (116,38 MiB) y la cabeza de decision (3,78 MiB) conservan su precision original, de modo que el pipeline completo necesita los tres ficheros mas el script de adaptador.

Su relevancia practica esta en el nicho de clasificacion y enrutado de decisiones con contexto multimodal y en persa, con licencia Apache 2.0 y un consumo de VRAM medido por debajo de 10 GiB, lo que lo hace desplegable en una GPU de portatil. Es un modelo con muy poca traccion publica (0 descargas, 2 likes en el momento de la consulta) y sin resultados de benchmarks generalistas publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Gemma 4 12B, proyector multimodal y cabeza de decision (clasificador) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como maximo documentado; la configuracion de ejemplo y las pruebas de video usan 8192 tokens (1024 en CPU-texto y 2048 en GPU) |
| Tipos de cuantizacion | Q4_K_M (formato de precision mixta, 4,95 bits por peso de media); proyector y cabeza de decision en precision original (cabeza FP32) |
| Idiomas soportados | Ingles (en) y persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Jev-Omni-Unified-Q4_K_M.gguf`, `mmproj-jev-omni.gguf`) y NPZ (`decision-head-f32.npz`) |
| Repositorio | Reza2kn/Jev-Omni-Q4_K_M-GGUF |
| Modelo base | akhilaaa3/Jev-Omni (revision `c050d51354147985d13286cf4acf90f562f2c631`) |
| Relacion con el base | Cuantizado |
| Tamano del repo | 7,5 GB (backbone cuantizado: 7.381.382.848 bytes / 6,87 GiB) |
| Pipeline declarado en HuggingFace | No disponible |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Jev-Omni original: un backbone Gemma 4 12B al que se anaden dos componentes adicionales, un proyector multimodal que traduce las representaciones de imagen, audio y video al espacio del backbone, y una cabeza de decision que produce una distribucion de probabilidad sobre las opciones proporcionadas por el usuario. Esta cabeza es imprescindible: la model card advierte explicitamente de que la generacion de texto con `llama-cli` no aplica la cabeza entrenada, y que el modelo devuelve probabilidades sobre opciones suministradas, no respuestas generadas.

Sobre el proceso de cuantizacion si hay detalle verificable: se convirtio el modelo con llama.cpp en la revision citada y se aplico `llama-quantize` con el preset Q4_K_M y el parametro `8`, sin matriz de importancia. El cuantizador reporto 4,95 bits por peso en conjunto. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base; estos datos figuran como no disponibles en la informacion consultada.

## Capacidades

- Clasificacion de decision: dado un estado textual, una pregunta y un conjunto de opciones, devuelve una probabilidad por opcion en lugar de texto libre.
- Entrada multimodal: soporta rutas de texto, imagen (`--image`), audio (`--audio`, requiere FFmpeg) y video (`--video`, requiere OpenCV y Pillow).
- Procesamiento de video: la model card cita pruebas con decisiones sobre 16 fotogramas.
- Multilingue limitado: ingles y persa (farsi) declarados como idiomas soportados; el benchmark principal del autor es en persa.
- Salida calibrada en probabilidades: la cabeza FP32 devuelve probabilidades por opcion, aptas para umbrales de decision configurables.
- Compatibilidad de endpoints: etiquetado como `endpoints_compatible`, con despliegue via `llama-server` en modo embedding (`--embedding --pooling none`).
- Integracion por adaptador: incluye el script `jev_omni_gguf_decide.py`, que actua como adaptador contra el servidor local de llama.cpp.
- No soporta, en esta configuracion, generacion de texto con la cabeza de decision; la generacion plana por `llama-cli` no aplica el entrenamiento de clasificacion.

## Casos de uso

- Enrutado de decisiones en agentes: el modelo puede actuar como arbitro que elige entre opciones predefinidas (por ejemplo "continuar", "preguntar", "escalar") a partir de un estado textual, devolviendo probabilidades que el agente usa como umbral de confianza.
- Triaje de tickets de soporte: con un estado que describa el caso y opciones de categoria o prioridad, se obtiene una probabilidad por etiqueta; el contexto ampliado de hasta 8192 tokens permite incluir historial de conversacion.
- Clasificacion de documentos con imagen: gracias al proyector multimodal, puede decidir sobre opciones a partir de capturas, formularios escaneados o paneles, sin necesidad de un OCR previo en el pipeline.
- Verificacion de respuestas tipo test o formularios: el caso documentado en la model card ("The meeting starts at 10 AM. It is now 9 AM." con opciones Yes/No) ilustra el uso directo para preguntas de si/no y validacion de estados.
- Control de calidad en pipelines de datos en persa: dado que el modelo rinde mejor que la linea base Bev en las primitivas Choice y Score del benchmark persa, encaja en tareas de etiquetado y validacion para ese idioma.
- Moderacion o cumplimiento con decision binaria: la salida probabilistica permite fijar umbrales distintos segun el coste de falsos positivos y falsos negativos.
- Sistemas de ayuda a la decision en tiempo real sobre GPU de consumo: con 0,20 s por decision medidos en una RTX 5080 Laptop, es viable en bucles interactivos con seis preguntas secuenciales por peticion.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al Jev Persian Benchmark (revision `ac218d96630da9d9cc08fd897868c4d3c7048b0d`), con 624/624 respuestas validas: 480 preguntas principales en persa, 48 respuestas de comparacion en ingles y 96 de repetibilidad. La comparacion es contra la linea base "Bev".

| Primitiva principal (persa) | Este Q4 | Bev baseline |
|---|---|---|
| Choice | 237/240 (98,75%) | 229/240 (95,42%) |
| Noul | 150/160 (93,75%) | 152/160 (95,00%) |
| Score, dentro de ±0,5 nivel de rubrica | 76/80 (95,00%) | 70/80 (87,50%) |

Notas de la model card: ambas lineas fallaron seis de las mismas preguntas principales y ninguno cambio una decision en los 48 grupos de repeticion. Frente al fuente FP32 original, esta cuantizacion coincidio en la opcion ganadora en 3/4 ejemplos de verificacion de texto publicados, con una diferencia absoluta maxima de probabilidad de 0,210. El autor advierte de que no deben asumirse probabilidades ni calibracion equivalentes al modelo fuente. Las rutas de imagen, audio y video solo pasaron pruebas de humo, no benchmarks de precision. No hay resultados publicados de MMLU, HumanEval, GSM8K ni similares.

Rendimiento medido (no son tasas de generacion de tokens ni comparaciones con hardware equivalente):

| Configuracion | Peticiones medidas | Mediana por peticion de seis preguntas | Tiempo aproximado por decision |
|---|---|---|---|
| AMD Ryzen AI 9 HX 370, solo CPU, 8 hilos, 2048 contexto | 23 | 11,30 s | 1,88 s |
| RTX 5080 Laptop, offload CUDA completo, 2048 contexto | 106 | 1,18 s | 0,20 s |

## Requisitos de hardware

- VRAM medida en GPU (RTX 5080 Laptop, offload completo, 2048 de contexto): 8980 MiB con el modelo de texto cargado; 9148 MiB con el proyector multimodal cargado; 9256 MiB tras una decision sobre imagen.
- Memoria en CPU: 12,29 GiB de PSS de proceso tras una decision de texto (1024 de contexto) y 13,49 GiB tras una decision de video de 16 fotogramas (8192 de contexto).
- Cabe en GPU de consumo: si, con aproximadamente 9-10 GiB de VRAM libres. El propio autor lo valido en una RTX 5080 Laptop. No hay datos publicados para GPUs de gama inferior.
- GPU recomendadas: no hay lista publicada mas alla de la RTX 5080 Laptop usada en las mediciones; para offload completo conviene una GPU con 10 GiB o mas de VRAM.
- Opciones de despliegue: `llama-server` de llama.cpp con `--embedding --pooling none` y `--mmproj` para multimodal; alternativa solo texto omitiendo `--mmproj`. Requiere Python 3 con NumPy para el adaptador, FFmpeg para audio y OpenCV mas Pillow para video.
- Parametros de lanzamiento documentados: `--ctx-size 8192 --parallel 1 --batch-size 2048 --ubatch-size 2048 --threads 8 --no-warmup -ngl 0` (o `-ngl 99` para offload completo).
- Latencia: 0,20 s por decision en GPU (RTX 5080 Laptop) y 1,88 s por decision en CPU (Ryzen AI 9 HX 370), en peticiones de seis preguntas secuenciales. El preprocesado de audio y video y contextos mayores pueden anadir tiempo sustancial.
- Plataformas validadas: CPU Linux y Stallion CUDA. No validado en macOS, Windows, Metal ni Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Omni Q4_K_M GGUF | 11,9B (Q4_K_M, 4,95 bits/peso) | Hasta 8192 en las pruebas documentadas | Choice 98,75%, Noul 93,75%, Score 95,00% en Jev Persian Benchmark | Apache 2.0 | GGUF + NPZ en HuggingFace, 0 descargas |
| Jev-Omni FP32 (akhilaaa3/Jev-Omni) | 11,9B | No disponible | Referencia fuente; esta Q4 coincide en 3/4 ejemplos de verificacion, diferencia maxima de 0,210 | Apache 2.0 | Pesos originales en HuggingFace |
| Bev baseline (linea base del benchmark) | No disponible | No disponible | Choice 95,42%, Noul 95,00%, Score 87,50% | No disponible | No disponible |
| Qwen2.5-Omni | No disponible en la informacion consultada | No disponible | No disponible | No disponible | Repositorio GitHub QwenLM/Qwen2.5-Omni |

La comparacion con Qwen2.5-Omni se incluye solo como referencia de categoria (modelo multimodal end-to-end), pero no hay datos comparables de parametros, contexto ni rendimiento en la informacion disponible. Jev-Omni no es un generador multimodal al uso, sino un clasificador de decisiones, por lo que la comparacion directa con generadores tiene validez limitada.

## Limitaciones y advertencias

- No es un generador: devuelve probabilidades sobre opciones suministradas. La generacion de texto plana con `llama-cli` no aplica la cabeza de decision entrenada.
- Ficheros obligatorios: los tres ficheros GGUF/NPZ mas `jev_omni_gguf_decide.py` son necesarios para decisiones multimodales; para texto, el proyector es opcional.
- Perdida de calibracion: el autor advierte explicitamente de que no deben asumirse probabilidades equivalentes al modelo fuente FP32. La diferencia absoluta maxima medida fue de 0,210 y solo coincidio en 3/4 ejemplos de verificacion.
- Cobertura de idiomas muy limitada: solo ingles y persa declarados. No hay soporte documentado de castellano ni de otros idiomas.
- Validacion parcial por modalidad: imagen, audio y video solo pasaron pruebas de humo; no hay benchmarks de precision para esas rutas.
- Rendimiento no comparado: las mediciones de velocidad provienen de una sola maquina y no son comparaciones con hardware equivalente. El subconjunto de CPU procede de una ejecucion exploratoria mixta.
- Tiempos adicionales no cuantificados: el preprocesado de audio y video y los contextos grandes pueden anadir tiempo sustancial no reflejado en las cifras.
- Compatibilidad de plataforma: el adaptador especifico no ha sido validado en macOS, Windows, Metal ni Vulkan; las builds mas recientes de llama.cpp pueden requerir revision del comportamiento de embedding y multimodal.
- Riesgo de seguridad: el endpoint de embedding expone estados internos del modelo, por lo que el servidor debe permanecer ligado a loopback.
- Traccion y mantenimiento: 0 descargas y 2 likes en el momento de la consulta, con una unica revision publicada; no hay historial de mantenimiento ni comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Gemma 4 12B, no detalladas en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Reza2kn/Jev-Omni-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/akhilaaa3/Jev-Omni
- Modelos cuantizados de Jev-Omni: https://huggingface.co/models?other=base_model:quantized:akhilaaa3/Jev-Omni
- Pagina explicativa de Jev-Omni: https://jev-ai.pro/model/jev-omni
- Jev Persian Benchmark (GitHub): https://github.com/ArmanJR/Jev-Persian-Benchmark
- llama.cpp (GitHub): https://github.com/ggml-org/llama.cpp
- Informe apareado del benchmark: `persian-report.md` (en el repositorio del modelo)
- Resultados agregados: `comparison.json` (en el repositorio del modelo)
- Vectores de verificacion Q4: `verify-q4-unified.json` (en el repositorio del modelo)
- Script adaptador: `jev_omni_gguf_decide.py` (en el repositorio del modelo)
- Qwen2.5-Omni (referencia de categoria multimodal): https://github.com/QwenLM/Qwen2.5-Omni
