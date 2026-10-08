# RepublicOfKorokke/d1-3B-oQ8e

## Resumen

d1-3B-oQ8e es una cuantizacion de 8 bits del modelo LiquidAI/d1-3B, publicada por el usuario RepublicOfKorokke. Se trata de un artefacto derivado, no de un entrenamiento original: el repositorio contiene unicamente los pesos ya cuantizados, generados con la herramienta oQ (oMLX v0.7.0) mediante cuantizacion de precision mixta. El modelo base pertenece a la familia de modelos de LiquidAI y, segun la etiqueta `lfm2_vl` de la model card, corresponde a una arquitectura de tipo LFM2-VL orientada a tareas de vision y lenguaje.

El modelo cuenta con 3.123.483.888 parametros totales (aproximadamente 3,1 mil millones) y el repositorio ocupa 3,7 GB en formato MLX safetensors. Al estar empaquetado con la libreria MLX, su destino natural son equipos con Apple Silicon (familias M1, M2, M3, M4), donde MLX aprovecha la memoria unificada del chip.

La relevancia de esta ficha es acotada: se trata de una publicacion con muy poca traccion (13 descargas, 0 likes) y sin model card detallada mas alla de los parametros de cuantizacion. No se dispone de informacion sobre licencia, idiomas, contexto ni datos de entrenamiento del modelo base. Quien necesite el modelo original deberia acudir directamente a LiquidAI/d1-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (segun model card; sin detalle adicional) |
| Parametros totales | 3.123.483.888 (aprox. 3,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, precision mixta (oQ / oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La model card indica como `model type` el valor `lfm2_vl`, lo que situa el modelo base dentro de la familia LFM2-VL de LiquidAI, orientada a tareas multimodales de vision y lenguaje. No se aportan datos sobre el numero de capas, la dimension oculta, el mecanismo de atencion ni la posible presencia de componentes recurrentes o de estado. El modelo conserva la etiqueta `custom_code`, lo que implica que su carga requiere codigo especifico y no un cargador generico de transformers.

No hay informacion sobre el proceso de entrenamiento del modelo original d1-3B: se desconoce el volumen de tokens, la composicion del dataset, la posible fase de RLHF o DPO y cualquier innovacion tecnica. Esta ficha describe unicamente el proceso de cuantizacion posterior: se aplico oQ (oMLX v0.7.0) con cuantizacion de precision mixta a 8 bits y tamano de grupo 64, generando pesos en formato MLX safetensors. La precision mixta implica que distintas capas o modulos pueden haber recibido un tratamiento de cuantizacion diferente, aunque no se detalla el criterio aplicado.

## Capacidades

- Generacion de texto y lenguaje, heredadas del modelo base LiquidAI/d1-3B.
- Capacidades multimodales de vision, segun la etiqueta `lfm2_vl`, aunque no se detalla el alcance exacto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

Nota: al tratarse de una cuantizacion, el modelo conserva en teoria las capacidades del original, pero la cuantizacion a 8 bits puede degradar ligeramente tareas sensibles a la precision, como matematicas o razonamiento encadenado. No hay evaluaciones publicadas que confirmen o cuantifiquen esa degradacion.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: al usar MLX y 8 bits, el modelo ocupa del orden de 3,1-3,7 GB, por lo que resulta adecuado para ejecutar generacion de texto y vision directamente en un MacBook con memoria unificada, sin necesidad de GPU dedicada.
- Prototipado rapido de aplicaciones multimodales: un desarrollador puede integrar el modelo para experimentar con tareas de imagen y texto (por ejemplo, descripcion de imagenes o respuesta a preguntas sobre una imagen) antes de decidir si invierte en el modelo completo o en una version de mayor precision.
- Aplicaciones de asistencia offline: escenarios sin conectividad o con requisitos de privacidad donde el procesamiento debe permanecer en el dispositivo, aprovechando que el modelo cabe en memoria local y no requiere llamadas a API externas.
- Analisis de documentos con componente visual: si el modelo base conserva capacidades de vision, podria emplearse para extraer o resumir informacion de capturas, diagramas o formularios, siempre que se valide su calidad real.
- Chatbots de bajo coste en dispositivos de gama alta: con 3,1 B de parametros y 8 bits, es viable desplegar un asistente conversacional ligero en un portatil o incluso en un equipo con hardware modesto compatible con MLX.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como caso de estudio para medir el impacto de oQ (precision mixta a 8 bits) frente a la cuantizacion uniforme o al modelo sin cuantizar, util para equipos que investigan compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al ser 3,1 B de parametros en 8 bits, el peso de los pesos ronda los 3,1 GB; con overhead de runtime conviene reservar en torno a 3,7-4,5 GB de memoria segun la longitud de contexto y el proceso de vision.
- Hardware objetivo: al estar en formato MLX, esta pensado para Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada.
- Cabe en GPU de consumo: no aplica directamente, ya que MLX es el runtime de Apple. Para GPUs NVIDIA seria necesario convertir a otro formato (por ejemplo, GGUF), algo que la model card no menciona.
- Opciones de despliegue: MLX (oMLX) es la via prevista. vLLM, llama.cpp, Ollama o TGI no estan confirmados para este artefacto concreto; requeririan conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RepublicOfKorokke/d1-3B-oQ8e | 3,1 B (8 bits) | no disponible | MLX safetensors | no disponible | HuggingFace |
| LiquidAI/d1-3B | 3,1 B (sin cuantizar) | no disponible | no disponible | no disponible | HuggingFace |
| Otros VLM pequenos (familia LFM2-VL y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico punto de comparacion directo disponible es el modelo base LiquidAI/d1-3B, del que esta ficha es una version cuantizada. No se dispone de datos objetivos de rendimiento, contexto ni licencia del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; dependen del modelo base, sobre el que no hay informacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos especificos del modelo base no puede acotarse.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto soportada y los idiomas cubiertos.
- Degradacion por cuantizacion: la cuantizacion a 8 bits puede reducir la precision en tareas sensibles (matematicas, razonamiento encadenado, instrucciones de formato estricto). No hay evaluaciones publicadas que cuantifiquen el impacto.
- Licencia: no disponible, lo que impide confirmar si se permite el uso comercial. Conviene verificar la licencia del modelo base LiquidAI/d1-3B antes de cualquier despliegue en produccion.
- Codigo personalizado: la etiqueta `custom_code` obliga a usar el codigo especifico del repositorio para cargar el modelo; no es un artefacto plug-and-play con cargadores genericos.
- Madurez del artefacto: 13 descargas y 0 likes indican una adopcion muy baja y ausencia de validacion por parte de la comunidad. No se recomienda su uso en produccion sin una evaluacion propia.
- Fecha de creacion: el repositorio figura como creado el 2026-10-08 y actualizado el 2026-10-08 segun los metadatos proporcionados.

## Enlaces

- HuggingFace: https://huggingface.co/RepublicOfKorokke/d1-3B-oQ8e
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
