# dsadd4/UltraMS-MoNA-Contrastive

## Resumen

UltraMS-MoNA-Contrastive es un codificador de espectros de masas en tándem (MS/MS) desarrollado por el usuario dsadd4 dentro del proyecto UltraMS. El modelo transforma un espectro de fragmentación, definido por sus picos de relación masa-carga e intensidad más el ion precursor, en un vector denso de 1024 dimensiones que puede compararse mediante similitud coseno. El problema que resuelve es el de la búsqueda y el emparejamiento de espectros en metabolómica, donde comparar señales crudas es costoso y sensible al ruido instrumental.

El modelo se ha entrenado con aprendizaje contrastivo a nivel de espectro sobre la base de datos MoNA (MassBank of North America), de modo que espectros de la misma molécula quedan próximos en el espacio latente y los de moléculas distintas se separan. No es un modelo generativo ni un LLM: es un encoder especializado de dominio científico, con una dimensión de salida fija y un máximo de 100 picos retenidos por espectro.

Su relevancia actual radica en que ofrece una alternativa ligera y de licencia permisiva (Apache 2.0) para tareas de anotación de metabolitos, deduplicación de librerías espectrales y búsqueda de vecinos más cercanos sobre grandes colecciones de espectros, integrándose mediante el paquete Python `ultrams` y un único fichero de pesos `model.pt`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | encoder de espectros MS/MS (familia UltraMS); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada limitada a 100 picos espectrales como máximo |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de dominio científico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch, pesos más configuración de inferencia) |
| Dimensión de embedding | 1024 |
| Picos máximos por espectro | 100 |
| Nombre del modelo en Python | `"mona"` |
| Versión mínima de UltraMS | 0.3.2 |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La información disponible describe el modelo como el encoder MS/MS de UltraMS con una proyección a nivel de espectro aprendida mediante entrenamiento contrastivo sobre espectros de MoNA. La salida `encode(...).embedding` corresponde a la proyección aprendida del embedding CLS del encoder, y la comparación entre espectros se realiza con similitud coseno en ese espacio de 1024 dimensiones. No se detalla en la model card el número de capas, la dimensionalidad interna del transformer ni el mecanismo de atención empleado.

El preprocesado es parte del contrato del modelo: se exigen al menos tres picos con `m/z` positivo, las intensidades se normalizan por su máximo cuando este es positivo y, si hay más de 100 picos, se conservan los 100 más intensos. La opción `return_peaks=True` devuelve los embeddings del encoder alineados con los picos finalmente retenidos. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste adicionales más allá del entrenamiento contrastivo.

## Capacidades

- Generación de embeddings de espectros MS/MS: convierte un espectro (arrays de `m/z` e intensidad más `precursor_mz`) en un vector de 1024 dimensiones.
- Búsqueda por similitud: permite recuperar espectros vecinos mediante similitud coseno, base para búsqueda en librerías espectrales.
- Aprendizaje contrastivo a nivel de espectro: el espacio latente está optimizado para discriminar entre espectros de moléculas distintas y agrupar los de la misma sustancia.
- Alineación con picos: `return_peaks=True` devuelve embeddings del encoder alineados con los picos retenidos, útil para inspección o atribución.
- Manejo controlado de entradas variables: normalización de intensidades y truncado determinista a los 100 picos más intensos.
- Sin capacidades de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Anotación de metabolitos desconocidos: dado un espectro experimental, se calcula su embedding y se buscan los vecinos más cercanos en una librería de referencia indexada previamente; la similitud coseno actúa como puntuación de candidatura para revisión manual o filtrado automático.
- Deduplicación de librerías espectrales: al indexar grandes colecciones (por ejemplo, agregados de MoNA y repositorios propios), los pares con similitud muy alta en el espacio de 1024 dimensiones pueden marcarse como posibles duplicados antes de una revisión experta.
- Control de calidad de experimentos LC-MS/MS: comparar réplicas técnicas o biológicas de un mismo compuesto para detectar desviaciones instrumentales, usando la distancia coseno entre embeddings como métrica de consistencia.
- Búsqueda de compuestos relacionados: agrupar espectros por similitud estructural putativa para priorizar candidatos en estudios de metabolómica no dirigida, reduciendo el espacio de búsqueda frente a la comparación pico a pico.
- Integración en pipelines de análisis: el paquete `ultrams` permite invocar el modelo desde Python y encadenarlo con etapas de preprocesado, extracción de picos y bases de datos de metabolitos en flujos reproducibles.
- Construcción de índices vectoriales para búsqueda a escala: los embeddings de 1024 dimensiones son compatibles con índices aproximados (FAISS, hnswlib) para consultas de baja latencia sobre millones de espectros, algo inviable con comparación directa de señales.
- Filtrado previo en estudios de exposición o biomarcadores: descartar rápidamente espectros que no se parecen a ninguna referencia conocida antes de un análisis manual costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (top-1, top-5), precisión de anotación ni comparaciones cuantitativas con otros encoders espectrales.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,8 GB, pero no se especifica el tamaño de los parámetros ni la VRAM necesaria para inferencia.
- GPU recomendadas: no disponibles. Por el tamaño del artefacto, es plausible que quepa en GPUs de consumo, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: paquete Python `ultrams` (versión 0.3.2 o superior), cargando el modelo con `UltraMS.from_pretrained("mona")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensión de embedding | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraMS-MoNA-Contrastive | Encoder MS/MS contrastivo | 1024 | hasta 100 picos | Apache 2.0 | Hugging Face (`dsadd4/UltraMS-MoNA-Contrastive`) |
| Otros checkpoints de la familia UltraMS | Encoders MS/MS | no disponible | no disponible | no disponible | Colección `dsadd4/ultrams` en Hugging Face |
| Alternativas externas de embedding espectral | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio restringido: solo procesa espectros MS/MS; no admite texto, imágenes ni otras modalidades.
- Entrada acotada: se requieren al menos tres picos con `m/z` positivo y solo se conservan los 100 más intensos, lo que puede descartar información en espectros muy densos.
- Dependencia del preprocesado: la normalización por máximo y el truncado son deterministas e impuestos por el modelo; variaciones en el pipeline previo afectan a la comparabilidad de los embeddings.
- Sesgo de dominio: el entrenamiento contrastivo se realizó sobre MoNA, por lo que el espacio latente puede no generalizar bien a instrumentos, modos de ionización o rangos de masa poco representados en esa base de datos.
- Riesgo de falsos positivos en búsqueda: la similitud coseno alta no implica identidad química; se recomienda validación con criterios adicionales (aductos, tiempo de retención, fórmula molecular).
- Sin métricas publicadas: no hay benchmarks que permitan estimar la precisión de recuperación ni comparar con alternativas.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- Fecha de creación futura en los metadatos (2026-09-23): conviene verificar la vigencia y el mantenimiento del repositorio antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsadd4/UltraMS-MoNA-Contrastive
- Repositorio de código UltraMS: https://github.com/Dsadd4/UltraMS
- Colección de la familia UltraMS: https://huggingface.co/collections/dsadd4/ultrams-6ab4cfaa860cbbd1f9a6b9b6
