# mghasemi19/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-gemma-3-270m-fine-tune-v1 es un ajuste fino (fine-tune) del modelo google/gemma-3-270m-it, desarrollado por el usuario mghasemi19 y publicado en Hugging Face. Se trata de un modelo de generacion de texto de pequeno tamano, con 268.098.176 parametros reales segun los pesos en safetensors, orientado a tareas de extraccion de informacion en el dominio alimentario, a juzgar por el nombre del repositorio (FoodExtract). El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) con la libreria TRL, partiendo de la version instruct de Gemma 3 de 270 millones de parametros.

El problema que aborda es la necesidad de un modelo ligero y especializado para tareas de extraccion estructurada de datos a partir de texto relacionado con alimentos, un caso de uso comun en aplicaciones de nutricion, etiquetado o analisis de recetas. Al partir de un modelo base de solo 270M de parametros, el fine-tune esta pensado para despliegues con recursos muy limitados, incluso en CPU o GPUs de consumo.

La relevancia de esta ficha es limitada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, la model card es practicamente una plantilla autogenerada por TRL sin informacion sustantiva sobre datos de entrenamiento, licencia o rendimiento, y no se han publicado benchmarks. Por tanto, debe considerarse un experimento de fine-tuning mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), derivado de google/gemma-3-270m-it |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 270M) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo "licence: license" sin especificar; el modelo base Gemma 3 tiene su propia licencia de uso) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en su variante de texto (gemma3_text) y en el tamano mas pequeno de la familia (270M de parametros). Se ha obtenido mediante Supervised Fine-Tuning (SFT) sobre el checkpoint instruct google/gemma-3-270m-it, utilizando la libreria TRL en su version 0.24.0, junto con Transformers 4.57.6, PyTorch 2.12.0+cu130, Datasets 4.3.0 y Tokenizers 0.22.1.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni sobre hiperparametros del SFT. La model card es una plantilla autogenerada por TRL (tag generated_from_trainer) y no incluye detalles tecnicos adicionales. No se documentan innovaciones tecnicas propias mas alla de las inherentes al modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo parte de una version instruct y se ha ajustado con formato conversacional (tag conversational), por lo que espera entradas con roles user/assistant.
- Extraccion de informacion en el dominio alimentario: el nombre del repositorio sugiere especializacion en extraer datos estructurados de texto sobre alimentos, aunque no se documenta el esquema de salida.
- Razonamiento basico y respuesta a instrucciones: heredado del modelo base Gemma 3 270M instruct.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 270M tiene capacidad limitada para cadenas de razonamiento complejas.
- Capacidades multilingues: no disponibles; el modelo base Gemma 3 es multilingue, pero no se especifica el alcance del fine-tune.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; la variante utilizada es gemma3_text, es decir, solo texto.

## Casos de uso

- Extraccion de ingredientes y cantidades de recetas: el modelo puede recibir el texto de una receta y devolver una lista estructurada de ingredientes con sus cantidades, aprovechando el ajuste fino sobre el dominio alimentario.
- Analisis de etiquetas nutricionales: a partir de texto OCR de etiquetas, el modelo podria extraer valores de macronutrientes y alérgenos en un formato tabular, aunque requeriria validacion posterior.
- Normalizacion de nombres de alimentos en catalogos: util para mapear variantes de nombres de productos a una taxonomia comun en bases de datos de nutricion.
- Clasificacion y etiquetado de menus: procesar menus de restaurantes para identificar platos, ingredientes principales y posibles alérgenos, con bajo coste de inferencia.
- Preprocesado en pipelines de datos alimentarios: usar el modelo como primer paso para estructurar texto no estructurado antes de pasarlo a un modelo mayor o a una base de datos.
- Despliegue en dispositivos con recursos limitados: al tener solo 270M de parametros, puede ejecutarse en CPU o en GPUs de consumo para tareas de extraccion en tiempo real en aplicaciones moviles o edge.
- Prototipado rapido de asistentes nutricionales: como componente de extraccion en un asistente que responde preguntas sobre dietas, aunque la calidad final dependeria de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 0,55 GB solo para pesos (268M parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 2 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 0,3 GB de pesos; en 4 bits, alrededor de 0,15 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (GTX 1060 6GB, RTX 3060, RTX 4090, etc.), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (tag endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas). vLLM es posible pero sobredimensionado para este tamano.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera latencia de milisegundos a decenas de milisegundos por token en GPU y throughput alto en lotes, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FoodExtract-gemma-3-270m-fine-tune-v1 | 268M | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tune SFT de Gemma 3 270M-it para dominio alimentario |
| google/gemma-3-270m-it | 270M | no disponible en esta ficha | Gemma Terms of Use | Hugging Face, ampliamente usado | Modelo base instruct, proposito general |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face | Alternativa ligeramente mayor, licencia permisiva |
| SmolLM2-360M-Instruct | 362M | 8.192 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face | Alternativa de tamano similar con licencia permisiva |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de benchmarks del modelo FoodExtract para comparar rendimiento real.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al derivar de Gemma 3, hereda los sesgos del modelo base, pero no hay evaluacion especifica.
- Riesgo de alucinacion: alto en un modelo de 270M, especialmente en extraccion de datos estructurados donde puede inventar campos o valores; se recomienda validacion con esquemas (por ejemplo, JSON Schema) y verificacion posterior.
- Limitaciones de contexto e idioma: no se especifican; el fine-tune podria haber degradado capacidades multilingues del modelo base si el dataset era monolingue.
- Restricciones de licencia: la licencia no esta disponible en la model card; el uso comercial debe verificarse contra la licencia del modelo base Gemma 3, que tiene terminos propios (Gemma Terms of Use) y no es una licencia open source estandar.
- Caveats para produccion: 0 descargas y 0 likes, sin benchmarks ni documentacion de datos de entrenamiento; no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- La model card es una plantilla autogenerada por TRL; no hay informacion sobre el dataset, el esquema de extraccion ni la calidad del ajuste.
- El ejemplo de codigo de la model card usa model="None", lo que indica que no esta actualizado para el repositorio real.

## Enlaces

- Hugging Face: https://huggingface.co/mghasemi19/FoodExtract-gemma-3-270m-fine-tune-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
