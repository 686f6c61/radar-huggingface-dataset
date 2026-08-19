# OneScience-Group/MatterGen

## Resumen

MatterGen es un modelo generativo de materiales inorgánicos desarrollado originalmente por Microsoft Research y adaptado por OneScience-Group en este repositorio. El modelo emplea un enfoque de difusión sobre grafos para aprender distribuciones conjuntas de composiciones elementales, celdas unitarias y coordenadas atómicas periódicas, lo que permite generar estructuras cristalinas completas de forma incondicional o condicionada a propiedades objetivo como densidad magnética, band gap o módulo de bulk. Esta versión integra el código de difusión y muestreo original con capas de procesamiento y embeddings de propiedades proporcionados por OneScience MatChem, facilitando el entrenamiento, el fine-tuning y la generación en entornos GPU o DCU.

La relevancia actual del modelo radica en su capacidad para abordar el diseño inverso de materiales, un problema central en ciencia de materiales computacional. A diferencia de los modelos de lenguaje, MatterGen no procesa texto, sino que opera directamente sobre representaciones geométricas y composicionales de cristales, lo que lo convierte en una herramienta especializada para la exploración de nuevos compuestos con propiedades específicas. El repositorio incluye checkpoints preentrenados para el modelo base y para condicionamiento por varias propiedades, así como scripts de generación y fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión sobre grafos (GNN) para generación de cristales |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo generativo de estructuras cristalinas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (metadata del repositorio; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch Lightning (.ckpt) y configuraciones YAML |

## Arquitectura y entrenamiento

MatterGen utiliza un modelo de difusión que aprende la distribución conjunta de especies atómicas, coordenadas fraccionarias y parámetros de red cristalina. La arquitectura se basa en redes neuronales de grafos (GNN) que operan sobre la estructura periódica del cristal, combinando información composicional y geométrica. El proceso de difusión se aplica de forma iterativa para refinar estructuras candidatas desde ruido hasta configuraciones válidas. La implementación de OneScience añade capas de procesamiento de datos y embeddings de propiedades específicos para el condicionamiento.

El entrenamiento se realiza sobre el dataset MP-20, un conjunto de datos de materiales inorgánicos ampliamente utilizado, que está disponible en Hugging Face para su descarga directa. El repositorio incluye scripts para convertir datos CSV personalizados al formato de caché de MatterGen, así como puntos de entrada para entrenamiento desde cero y fine-tuning de propiedades mediante adaptadores. No se especifican detalles sobre el número de tokens o la composición exacta del dataset de entrenamiento en la documentación proporcionada.

## Capacidades

- Generación incondicional de estructuras cristalinas: produce nuevos candidatos de cristales a partir del checkpoint base.
- Generación condicionada por propiedades: permite generar estructuras dirigidas a valores objetivo de densidad magnética, band gap, módulo de bulk, sistema químico o grupo espacial.
- Predicción de estructura con composición fija: busca posibles estructuras cristalinas para una composición química determinada.
- Fine-tuning de propiedades: añade un adaptador de propiedad a un modelo preentrenado y lo ajusta para optimizar una propiedad específica.
- Entrenamiento desde cero: soporta entrenamiento con el dataset MP-20 o datos compatibles con el formato de caché de MatterGen.
- Verificación de conectividad del entorno: genera una muestra para comprobar la disponibilidad de OneScience, el checkpoint y los recursos GPU/DCU.

## Casos de uso

- Diseño de nuevos materiales con propiedades magnéticas específicas: el modelo puede generar estructuras cristalinas condicionadas a un valor de densidad magnética objetivo, acelerando la búsqueda de imanes o materiales para almacenamiento de datos.
- Exploración de materiales con band gap deseado: para aplicaciones en semiconductores o fotovoltaica, se pueden generar candidatos con un band gap concreto, reduciendo el espacio de búsqueda experimental.
- Optimización de módulo de bulk: útil en el diseño de materiales resistentes a la compresión para aplicaciones estructurales o de revestimiento.
- Generación de candidatos para síntesis experimental: a partir de composiciones fijas, el modelo propone estructuras plausibles que pueden servir como punto de partida para síntesis y caracterización.
- Fine-tuning sobre propiedades específicas: investigadores pueden adaptar el modelo preentrenado con sus propios datos para ajustar la generación a un dominio particular de materiales.
- Integración en pipelines de descubrimiento de materiales: el modelo puede combinarse con herramientas de simulación (DFT, MD) para filtrar y validar estructuras generadas antes de la síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como validez estructural, estabilidad energética o tasas de éxito en la generación condicionada.

## Requisitos de hardware

- Se recomienda una GPU o DCU para generación y entrenamiento completos; una CPU puede utilizarse para importar el modelo y comprobar la configuración, pero el rendimiento será muy lento.
- Para DCU se requiere DTK compatible con la compilación de PyTorch; se ha verificado la generación de una sola muestra con DTK 25.04.2 y `torch 2.5.1+das.opt1.dtk25042`.
- No se especifica la VRAM mínima necesaria en la documentación. El tamaño del repositorio es de 4.6 GB, lo que sugiere que el modelo podría caber en GPUs con al menos 8 GB de memoria, pero no hay confirmación oficial.
- Opciones de despliegue: el repositorio proporciona scripts de Python para generación y entrenamiento; no se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Existen otros modelos generativos de materiales como CDVAE o la propia versión original de MatterGen de Microsoft Research, pero no se han incluido datos de comparación en este repositorio.

## Limitaciones y advertencias

- El modelo está especializado en materiales inorgánicos y no es aplicable a otros dominios como moléculas orgánicas o polímeros.
- La calidad de las estructuras generadas depende en gran medida de los datos de entrenamiento (MP-20), que pueden presentar sesgos hacia ciertos tipos de materiales o composiciones.
- No se garantiza la estabilidad termodinámica de las estructuras generadas; se recomienda validación adicional mediante cálculos DFT u otras simulaciones.
- El entrenamiento desde cero o el fine-tuning requieren datos en el formato de caché de MatterGen, lo que implica un paso de conversión para datasets personalizados.
- Aunque la licencia MIT permite uso comercial, los usuarios deben verificar la procedencia de los datos de entrenamiento y cumplir con las condiciones de uso de los mismos.
- El repositorio está orientado a entornos con GPU o DCU; el uso en CPU es posible pero extremadamente lento para tareas reales.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/MatterGen
- Repositorio de referencia (Microsoft): https://github.com/microsoft/mattergen
- Dataset MP-20 en Hugging Face: https://huggingface.co/datasets/OneScience-Group/mp20
