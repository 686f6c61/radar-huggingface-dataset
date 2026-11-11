# aegean-ai/FoodExtract-Vision-SmolVLM2-500M-fine-tune-v1

## Resumen

FoodExtract-Vision-SmolVLM2-500M-fine-tune-v1 es un ajuste fino supervisado (SFT) del modelo multimodal SmolVLM2-500M-Video-Instruct de Hugging Face, publicado por el usuario aegean-ai. El nombre del modelo y de su variante interna (`smolvlm2-500m-FoodExtract-Vision-v1`) apuntan a una especializacion en extraccion de informacion alimentaria a partir de imagenes, aunque la model card no documenta explicitamente el conjunto de datos ni la tarea exacta de entrenamiento.

El modelo conserva la arquitectura del SmolVLM2 original: un modelo vision-language compacto de aproximadamente 507 millones de parametros (507.482.304 segun los pesos en safetensors), disenado para entrada image-text-to-text. Su interes practico radica en que es lo bastante pequeno para ejecutarse en hardware de consumo y en entornos con recursos limitados, lo que lo hace adecuado para tareas de extraccion estructurada sobre imagenes en pipelines locales.

La relevancia actual del modelo es limitada pero concreta: se trata de un fine-tune de nicho, con muy pocas descargas (18 en el momento de la consulta) y sin resultados de benchmarks publicados. Es un ejemplo tipico de modelo especializado de bajo coste computacional, util como base para prototipos de vision aplicada al dominio alimentario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (SmolVLM2, basada en SmolVLM/Idefics3); no se detalla la configuracion interna en la model card |
| Parametros totales | 507.482.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye `licence: license` sin especificar terminos) |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolVLM2-500M-Video-Instruct, un modelo vision-language de la familia SmolVLM2 de Hugging Face, pensado para entrada image-text-to-text y con capacidad declarada de procesar video en su version Instruct original. El fine-tune conserva esa arquitectura y solo modifica los pesos mediante entrenamiento supervisado.

El entrenamiento se realizo con SFT usando TRL (version 1.17.1), sobre Transformers 5.22.2, PyTorch 2.15.0, Datasets 5.2.0 y Tokenizers 0.23.3. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional ni detalles sobre el preprocesado de imagenes. No se documentan innovaciones tecnicas propias mas alla del ajuste fino.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text), heredada del modelo base SmolVLM2-500M.
- Extraccion de informacion a partir de imagenes, segun sugiere el nombre `FoodExtract-Vision`; la tarea exacta no esta documentada.
- Procesamiento de imagenes y, potencialmente, video, al derivar de SmolVLM2-500M-Video-Instruct (no confirmado para este fine-tune).
- Conversacion multi-turno en formato de chat, segun el ejemplo de `pipeline` de la model card.
- Capacidades multilingues: no disponibles/documentadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio especial: no documentado.

## Casos de uso

- Extraccion de datos de etiquetas alimentarias: el modelo puede recibir la foto de un envase y devolver texto estructurado con ingredientes, valores nutricionales o alérgenos, aprovechando su naturaleza image-text-to-text y su tamano reducido para ejecucion local.
- Digitalizacion de tickets y facturas de restaurante: al ser un VLM pequeno, puede desplegarse en un servidor modesto para convertir imagenes de recibos en texto procesable, sin depender de APIs externas.
- Clasificacion y descripcion de imagenes de platos: util para aplicaciones de dietetica o catalogos gastronomicos donde se necesita una descripcion textual breve a partir de una foto.
- Prototipado rapido en entornos con GPU de consumo: sus ~507M de parametros permiten iterar en una RTX 3060/4060 o incluso en CPU con cuantizacion, lo que facilita pruebas de concepto de vision aplicada.
- Preprocesado en pipelines de datos: puede actuar como extractor de texto desde imagenes antes de un paso de parsing o validacion con reglas, reduciendo coste frente a modelos de mayor tamano.
- Educacion y experimentacion: sirve como ejemplo de fine-tune SFT con TRL sobre un VLM pequeno, util para aprender el flujo completo de entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp16/bf16 para los ~507M de parametros, mas el overhead del procesador de vision y del runtime; en la practica, 2-4 GB suele ser suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante, con margen).
- Opciones de despliegue: transformers (libreria declarada), y potencialmente vLLM, TGI o llama.cpp si se generan pesos compatibles; no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FoodExtract-Vision-SmolVLM2-500M-fine-tune-v1 | 507.482.304 | No disponible | No disponible | Hugging Face (transformers) |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct (modelo base) | ~500M | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| SmolVLM2-2.2B (variante mayor de la familia) | ~2.2B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |

La comparativa detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada; los datos de contexto, licencia y rendimiento de los modelos de referencia no se han podido verificar aqui.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni la tarea exacta, lo que impide evaluar su robustez fuera del dominio alimentario.
- Riesgo de alucinacion inherente a los VLM pequenos: puede generar texto plausible pero incorrecto en imagenes ambiguas o de baja calidad.
- Licencia no especificada (`licence: license` sin terminos): no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de usarlo en produccion.
- Idiomas soportados no documentados; el rendimiento en castellano no esta verificado.
- Longitud de contexto no disponible; el modelo base SmolVLM2 esta pensado para contextos cortos, lo que limita conversaciones largas o imagenes de alta resolucion.
- Solo 18 descargas y 0 likes en el momento de la consulta: poca validacion por parte de la comunidad.
- El ejemplo de "Quick start" de la model card usa `model="None"` y una pregunta generica, lo que sugiere que la documentacion no esta adaptada al fine-tune.
- No se documentan conversiones a GGUF ni soporte oficial en Ollama/llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aegean-ai/FoodExtract-Vision-SmolVLM2-500M-fine-tune-v1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
