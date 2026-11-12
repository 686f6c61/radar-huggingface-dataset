# plantwaterer/glires

## Resumen

glires es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B desarrollado por el usuario plantwaterer, disenado especificamente para responder preguntas de opcion multiple sobre imagenes devolviendo una probabilidad para cada opcion. No se trata de un modelo generativo al uso: el sistema combina un adaptador de bajo rango sobre los pesos del modelo base, una cabeza lineal de 26 salidas y un motor de vision denominado Decision Index. El repositorio aloja unicamente la actualizacion (2,3 GB en safetensors), no el modelo base completo.

La relevancia de glires radica en su enfoque de evaluacion: en lugar de generar texto y parsear la respuesta, realiza una unica pasada forward y lee directamente la distribucion de probabilidad sobre las letras de las opciones. Esto elimina la variabilidad de la decodificacion y permite medir calibracion. Ademas, el sistema integra un modelo OCR (PP-OCRv5 en su variante mobile) que extrae el texto de las imagenes antes de formular la pregunta, de modo que el modelo puede razonar sobre contenido textual presente en la imagen.

El modelo hereda la arquitectura hibrida de Qwen3.8-27B, con capas de atencion completa y capas recurrentes Gated DeltaNet, y se distribuye bajo licencia Apache-2.0. Su uso esta orientado a benchmarks de razonamiento visual y toma de decisiones, no a generacion de texto libre ni a conversacion abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (capas de atencion completa + capas recurrentes Gated DeltaNet) sobre Qwen3.8-27B; adaptador de bajo rango + cabeza lineal de 26 salidas |
| Parametros totales | No disponible (el adaptador ocupa 2,3 GB; el modelo base Qwen3.8-27B no se copia en el repositorio) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el modelo base es Qwen3.8-27B; la longitud efectiva no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (la inferencia se ejecuta en bf16 para el modelo y fp32 para la cabeza) |
| Idiomas soportados | No disponible (el OCR de reconocimiento es en ingles: en_PP-OCRv5_mobile_rec) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (glires_update.safetensors, 2,3 GB; glires_head.safetensors) |

## Arquitectura y entrenamiento

glires se construye como un ajuste fino sobre Qwen/Qwen3.8-27B, cuyo diseno combina capas de atencion completa con capas recurrentes Gated DeltaNet. El adaptador de bajo rango modifica los pesos del modelo de lenguaje, mientras que una cabeza lineal de 26 salidas lee el estado oculto del ultimo token del prompt y produce un logit por letra de opcion. La respuesta final es la softmax sobre las opciones de la pregunta a temperatura 1, sin decodificacion de texto.

El entrenamiento incorpora una innovacion clave: en las capas de atencion completa, todos los tokens del prompt atienden a todos los tokens del prompt (atencion bidireccional), mientras que las capas recurrentes permanecen causales. El modelo fue entrenado de esta forma y, segun la model card, la atencion causal estandar produce respuestas distintas. Ademas, una de las variantes promediadas en el ajuste (con peso 0,375) se entreno con el texto OCR insertado en el prompt, por lo que el sistema esta disenado para ejecutarse con OCR activo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de opcion multiple sobre imagenes, con una probabilidad asociada a cada opcion (hasta 12 opciones, letras A a L, aunque la cabeza tiene 26 salidas).
- Lectura de texto en imagenes mediante OCR integrado (PP-OCRv5 mobile, deteccion y reconocimiento en ingles), con hasta 60 lineas y 1.200 caracteres por imagen.
- Razonamiento visual y toma de decisiones en un unico paso forward, sin generacion autoregresiva.
- Procesamiento de imagenes a resolucion nativa de hasta 1.638.400 pixeles por imagen.
- Modo de pensamiento desactivado de forma explicita (enable_thinking=False) en el prompt de inferencia.
- Soporte de preguntas cuyas opciones estan dibujadas en la propia imagen (se omiten las lineas de opciones en el prompt).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni generacion de texto libre.

## Casos de uso

- Evaluacion de benchmarks de razonamiento visual: el modelo responde preguntas de opcion multiple sobre imagenes con una distribucion de probabilidad, lo que permite medir calibracion y comparar con otros sistemas en suites publicas como la vision suite del kit Decision Index.
- Analisis de documentos con texto: gracias al OCR integrado, puede responder preguntas sobre formularios, tickets, carteles o capturas que contengan texto, insertando las lineas reconocidas en el prompt antes de la pregunta.
- Toma de decisiones automatizada en entornos controlados: al devolver probabilidades por opcion, es adecuado para sistemas que necesitan umbrales de confianza (por ejemplo, derivar a revision humana cuando la probabilidad maxima es baja).
- Moderacion de contenido visual con criterios predefinidos: se pueden plantear preguntas de opcion multiple sobre si una imagen cumple ciertas politicas, con la ventaja de obtener una puntuacion de confianza por categoria.
- Investigacion en interpretabilidad y atencion: la atencion bidireccional en las capas completas y la lectura directa del estado oculto facilitan estudiar como el modelo integra imagen, OCR y pregunta sin la interferencia de la decodificacion.
- Clasificacion visual con opciones textuales: cualquier tarea que pueda formularse como "elegir entre A, B, C..." sobre una imagen (tipo de objeto, presencia de un elemento, comparacion entre dos entidades) se puede resolver en una sola pasada.
- Prototipado de pipelines de vision-lenguaje en Linux x86_64 con GPU: el motor se instala con uv y expone una API Python (Engine) que devuelve respuestas estructuradas con probabilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el sistema fue seleccionado y medido con el OCR activo y que todas las cifras de la tarjeta corresponden al conjunto de los dos modelos, pero no se incluyen tablas numericas de MMLU, HumanEval, GSM8K ni de la vision suite.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El adaptador ocupa 2,3 GB en disco, pero el modelo base Qwen3.8-27B debe cargarse adicionalmente; en bf16, un modelo de ese tamano requiere del orden de decenas de GB de VRAM (la cifra exacta no se proporciona).
- GPU recomendadas: no se especifican modelos concretos; el motor se ejecuta en CUDA (por defecto "cuda:0", configurable con --option device=cuda:1) y compila kernels de flash-linear-attention y Triton para las capas recurrentes.
- Cabe en GPU de consumo: no disponible; dado el tamano del modelo base, es poco probable en GPUs de consumo con VRAM limitada, pero no se confirma en la informacion.
- Opciones de despliegue: el sistema se ejecuta mediante el motor Decision Index (glires.py) con PyTorch SDPA y uv; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que el tiempo de OCR forma parte de todas las cifras de latencia, pero no se aportan numeros.
- Requisitos de sistema: Linux x86_64, uv, Python 3.12 gestionado por uv, y wheel de GPU de PaddlePaddle para el OCR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glires | No disponible (base Qwen3.8-27B + adaptador 2,3 GB) | No disponible | Opcion multiple visual con probabilidades y OCR integrado | Apache-2.0 | Hugging Face (plantwaterer/glires) |
| Qwen/Qwen3.8-27B | 27B (segun denominacion) | No disponible | Modelo base generativo vision-lenguaje | No disponible en la informacion | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoria (clasificacion visual por opcion multiple con probabilidades). La informacion proporcionada solo identifica el modelo base Qwen/Qwen3.8-27B.

## Limitaciones y advertencias

- El sistema depende de tres componentes no opcionales: el texto OCR en el prompt, la atencion bidireccional en las capas completas y la cabeza lineal. Ejecutarlo con atencion causal estandar o sin OCR produce respuestas distintas a las esperadas.
- El OCR de reconocimiento es en ingles (en_PP-OCRv5_mobile_rec); el texto en otros idiomas puede no reconocerse correctamente, lo que afecta a las respuestas.
- El OCR puede contener errores; el propio prompt lo advierte ("may contain errors"). Lineas con puntuacion de reconocimiento inferior a 0,5 se descartan, y hay limites de 60 lineas y 1.200 caracteres por imagen.
- Una sola pregunta por peticion, con un maximo de 12 opciones (A a L); no hay truncacion ni filtrado de opciones.
- No es un modelo generativo: no produce texto libre, no soporta conversacion multi-turno ni tool calling, y su uso esta acotado a la seleccion entre opciones.
- Riesgo de alucinacion: no se documenta explicitamente, pero al leer directamente el estado oculto sin decodificacion, la calibracion de las probabilidades depende del entrenamiento y no se han publicado metricas de fiabilidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y los modelos OCR de PaddlePaddle tienen sus propias licencias (el OCR es Apache-2.0 segun la model card); deben verificarse por separado.
- Requiere Linux x86_64 y uv; no se documenta soporte para otros sistemas operativos ni para despliegue en entornos sin GPU CUDA.
- El repositorio no incluye el modelo base ni los modelos OCR: el motor los descarga del Hub en revisiones fijas, lo que exige conectividad o snapshots locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/glires
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Decision Index (repositorio del motor): https://github.com/apolinario/decision-index
- PP-OCRv5 (PaddleOCR): https://github.com/PaddlePaddle/PaddleOCR
- Modelo de deteccion OCR: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Modelo de reconocimiento OCR: https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec
