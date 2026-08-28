# mradermacher/SkyJM-Edit-4B-GGUF

## Resumen

SkyJM-Edit-4B-GGUF es la versión cuantizada en formato GGUF del modelo base SkyJM-Edit-4B, desarrollado por el equipo de skylenage-ai. Se trata de un *reward model* multimodal diseñado para evaluar la calidad de la generación visual, concretamente en tareas de edición de imágenes. Dado un prompt de instrucción y dos imágenes candidatas, el modelo predice cuál de las dos satisface mejor la instrucción, lo que permite automatizar la selección de resultados en sistemas de generación y edición de imágenes.

La cuantización ha sido realizada por mradermacher (nethype GmbH) e incluye múltiples niveles de compresión (desde Q2_K hasta f16) junto con los ficheros auxiliares `mmproj` para el soporte multimodal. El modelo base cuenta con 4.841.450.496 parámetros (aproximadamente 4,8 mil millones) y está licenciado bajo Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que proporciona un criterio objetivo y reproducible para comparar resultados de editores de imágenes basados en IA, algo fundamental tanto en investigación como en producción. Al estar disponible en GGUF, puede ejecutarse en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles, aunque su naturaleza de *reward model* implica un uso específico en pipelines de evaluación y filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal, probablemente transformer con codificador visual) |
| Parametros totales | 4.841.450.496 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base SkyJM-Edit-4B en la documentacion proporcionada. Se sabe que es un *reward model* multimodal que procesa texto e imagenes, pero no se especifica si se basa en un transformer clasico, un modelo de difusion o una combinacion de ambos. Tampoco se han publicado datos sobre el proceso de entrenamiento, como el numero de tokens, la composicion del dataset o el uso de tecnicas de RLHF/DPO.

El modelo forma parte de una familia mas amplia denominada SkyJM (o RubricRM), que incluye variantes para evaluacion de text-to-image (SkyJM-Gen-4B/9B), edicion de imagenes (SkyJM-Edit-4B/9B) y calidad de audio TTS (SkyJM-TTS). Esto sugiere que el entrenamiento se ha centrado en aprender a puntuar la fidelidad de la salida respecto a una instruccion dada, probablemente mediante datos anotados por humanos o metricas automaticas.

## Capacidades

- Evaluacion de pares de imagenes: dado un prompt y dos imagenes, devuelve una puntuacion o preferencia indicando cual es mas adecuada.
- Soporte multimodal: procesa simultaneamente texto (instruccion) e imagenes (candidatas).
- Especializado en edicion de imagenes: el modelo esta optimizado para tareas donde se pide modificar una imagen segun una instruccion (por ejemplo, "cambia el fondo a un atardecer").
- Compatible con cuantizaciones GGUF: permite ejecucion en CPU y GPU con bajo consumo de memoria.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, dado que su funcion principal es la puntuacion, no la generacion de texto.

## Casos de uso

- Seleccion automatica de resultados en pipelines de edicion de imagenes: un sistema que genera varias versiones editadas de una misma imagen puede usar SkyJM-Edit-4B para elegir la que mejor cumple la instruccion del usuario.
- Evaluacion de modelos de edicion de imagenes: investigadores y desarrolladores pueden comparar dos modelos (por ejemplo, un fine-tune frente al original) alimentando el reward model con las mismas instrucciones y las salidas de cada modelo.
- Control de calidad en aplicaciones de diseno grafico: herramientas de edicion asistida por IA pueden integrar este modelo como validador automatico antes de presentar el resultado final al usuario.
- Filtrado de datos para entrenamiento de modelos generativos: al generar pares de imagenes sinteticas, el reward model puede actuar como filtro para seleccionar solo las muestras de alta calidad.
- Investigacion en RLHF para vision: el modelo puede servir como funcion de recompensa en algoritmos de optimizacion por refuerzo aplicados a generadores de imagenes.
- Benchmarking de editores de imagenes: permite establecer rankings objetivos entre diferentes herramientas o versiones, usando un conjunto fijo de instrucciones y midiendo la preferencia del reward model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos como MMLU, HumanEval o metricas especificas de vision (por ejemplo, FID, CLIPScore) para este modelo. Se recomienda consultar la pagina del modelo base en Hugging Face o el repositorio oficial para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantizacion, el modelo ocupa entre 2,2 GB (Q2_K) y 9,8 GB (f16). Una cuantizacion Q4_K_M (3,2 GB) es un buen equilibrio entre calidad y memoria.
- GPU recomendadas: para cuantizaciones ligeras (Q4_K_M o inferiores), una GPU consumer con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. Para f16 o Q8_0 se recomienda al menos 12 GB (RTX 4070 Ti, RTX 3080).
- Compatibilidad con CPU: al ser GGUF, puede ejecutarse en CPU con llama.cpp, aunque la inferencia sera mas lenta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores compatibles con GGUF. Tambien se puede usar con la libreria `llama-cpp-python` para integraciones en Python.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3090), se espera una inferencia en el rango de decenas de milisegundos para una sola evaluacion, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Dado que SkyJM-Edit-4B es un *reward model* especializado en edicion de imagenes, las alternativas podrian incluir otros reward models como ImageReward o HPSv2, pero no se han encontrado datos suficientes para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles, por lo que las instrucciones en otros idiomas pueden no ser procesadas correctamente.
- Naturaleza de reward model: no es un modelo generativo; no produce imagenes ni texto, solo puntua pares de imagenes. Intentar usarlo como un chatbot o generador no funcionara.
- Sesgos potenciales: al ser entrenado con datos anotados, puede heredar sesgos culturales o esteticos presentes en los datos de entrenamiento, lo que afectaria a la preferencia de imagenes en ciertos dominios.
- Riesgo de alucinacion: aunque no genera texto, puede asignar puntuaciones inconsistentes si las imagenes de entrada son muy diferentes a las del entrenamiento.
- Cuantizacion: las versiones de baja precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de la puntuacion. Se recomienda usar Q4_K_M o superior para resultados fiables.
- Licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia. El modelo base puede tener sus propias condiciones adicionales, aunque no se han indicado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SkyJM-Edit-4B-GGUF
- Modelo base: https://huggingface.co/skylenage-ai/SkyJM-Edit-4B
- Pagina en ModelScope: https://www.modelscope.cn/models/SKYLENAGE/SkyJM-Edit-4B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Wiki de SkyJM (informacion general): https://ai.miraheze.org/wiki/SkyJM
