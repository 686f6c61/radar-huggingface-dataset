# aquiro1994/naics-github-classifier

## Resumen

El modelo `aquiro1994/naics-github-classifier` es un clasificador de texto basado en RoBERTa-large, ajustado para asignar repositorios de GitHub a uno de los 19 sectores industriales definidos por el sistema NAICS (North American Industry Classification System). Desarrollado por Alexander Quispe, el modelo toma metadatos del repositorio (nombre, descripción, temas y contenido del README) y predice la categoría industrial más probable, lo que facilita el análisis del ecosistema de software de código abierto desde una perspectiva sectorial.

Con 355 millones de parámetros y una ventana de contexto de 512 tokens, el modelo está entrenado sobre un conjunto de 6.588 repositorios etiquetados manualmente. Su relevancia actual radica en la creciente necesidad de clasificar automáticamente el creciente volumen de proyectos open source para estudios de adopción tecnológica, inteligencia competitiva y análisis de mercado. La licencia MIT permite su uso comercial sin restricciones, y su formato safetensors garantiza compatibilidad con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder) |
| Parametros totales | 355.379.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (según el código de ejemplo) |
| Tipos de cuantizacion | no disponible (solo safetensors fp32/fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de RoBERTa-large, un transformer encoder de 24 capas con 16 cabezas de atención y 1024 dimensiones ocultas, preentrenado con masked language modeling sobre un corpus masivo en inglés. Sobre esta base se añade una cabeza de clasificación con 19 salidas, correspondientes a los sectores NAICS. El ajuste fino se realizó sobre un conjunto de datos propio de 6.588 repositorios de GitHub etiquetados, con entradas formateadas como `Repository: {nombre} | Description: {descripción} | Topics: {temas} | README: {contenido}`. No se han publicado detalles sobre el número de épocas, tasa de aprendizaje o técnicas de regularización empleadas. La arquitectura no incorpora innovaciones específicas más allá del ajuste fino estándar de un modelo preentrenado.

## Capacidades

- Clasificación de repositorios de GitHub en 19 sectores industriales NAICS, desde agricultura hasta administración pública.
- Procesamiento de entradas estructuradas que combinan nombre, descripción, temas y README en un único texto.
- Inferencia por lotes con soporte para padding y truncamiento a 512 tokens.
- Compatibilidad con dispositivos CUDA, Apple Silicon (MPS) y CPU, con selección automática de precisión fp16 en MPS.
- Salida de probabilidades softmax sobre las 19 clases, permitiendo umbrales de confianza para filtrado.
- Funcionamiento como pipeline de Transformers (`text-classification`) o mediante carga directa del modelo y tokenizador.

## Casos de uso

- Análisis del ecosistema open source: clasificar miles de repositorios para mapear qué sectores industriales concentran más desarrollo de software, útil para estudios académicos o informes de mercado.
- Inteligencia competitiva: monitorizar repositorios de competidores y clasificarlos por sector para identificar tendencias de inversión en tecnología por industria.
- Filtrado de repositorios para bases de datos: integrar el modelo en pipelines de ingesta de datos para etiquetar automáticamente nuevos proyectos en plataformas de análisis de código.
- Investigación sobre adopción tecnológica: correlacionar la actividad de repositorios clasificados por NAICS con indicadores económicos o de innovación sectorial.
- Recomendación de proyectos: en plataformas de descubrimiento de código, sugerir repositorios a usuarios según su sector industrial de interés.
- Cumplimiento y reporting: clasificar repositorios internos de una organización para generar informes de actividad por división de negocio, alineados con códigos NAICS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como F1 o accuracy sobre conjuntos de validación estándar) en la información disponible. La model card únicamente reporta métricas de throughput en Apple Silicon, que se resumen a continuación:

| Dispositivo | Precisión | Filas/s (batch 32, 512 tokens) |
|---|---|---|
| CPU | fp32 | 4,3 |
| MPS | fp32 | 47,5 |
| MPS | fp16 | 177 |

Además, se indica que en una muestra de 2.000 repositorios, las predicciones con confianza superior a 0,8 coinciden al 100% entre fp16 y fp32, y que las discrepancias solo aparecen con puntuaciones inferiores a 0,4.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 355M parámetros; en fp32 ocupa aproximadamente 1,4 GB (tamaño del repo safetensors), y en fp16 unos 700 MB. Para inferencia con batch razonable se recomienda al menos 2-4 GB de VRAM en GPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3060, RTX 4060, etc.) es suficiente; en entornos profesionales, A100 o H100 no son necesarias.
- Compatible con Apple Silicon: en un M5 Max con MPS y fp16 alcanza 177 filas/s con un pico de memoria de 6,5 GB.
- Opciones de despliegue: Transformers pipeline, carga directa con `AutoModelForSequenceClassification`, y compatible con Text Embeddings Inference (según tags de HuggingFace).
- Latencia: en CPU fp32 se procesan ~4,3 filas/s; en MPS fp16 se alcanzan ~177 filas/s, lo que equivale a unos 5,6 ms por fila en el mejor caso.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicos de clasificación NAICS de repositorios de GitHub en la documentación proporcionada. Como referencia genérica, cualquier clasificador de texto basado en RoBERTa-large (por ejemplo, modelos de análisis de sentimiento o clasificación de temas) tendría una arquitectura y tamaño similares, pero no son directamente comparables en tarea ni en datos de entrenamiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; entradas en otros idiomas degradarán significativamente el rendimiento.
- La ventana de contexto está limitada a 512 tokens, por lo que READMEs muy largos se truncarán, perdiendo información relevante.
- El conjunto de entrenamiento es reducido (6.588 repositorios) y puede no representar adecuadamente la diversidad de proyectos en GitHub, introduciendo sesgos hacia categorías más comunes.
- Al ser un clasificador, no genera texto; no presenta riesgo de alucinación en el sentido generativo, pero puede asignar etiquetas incorrectas con alta confianza en entradas ambiguas o mal formateadas.
- La licencia MIT permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de precisión para casos de uso específicos.
- Para producción, se recomienda validar el rendimiento con un conjunto propio de datos y establecer umbrales de confianza (por ejemplo, 0,8) para evitar clasificaciones dudosas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aquiro1994/naics-github-classifier
- Repositorio de código: https://github.com/alexanderquispe/naics-github-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aquiro1994/naics-gh
