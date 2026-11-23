# immanuelpeter/Hy4-Vision

## Resumen

Hy4-Vision es un extractor de características visuales derivado de Tencent Hy4, un modelo multimodal desarrollado por Tencent. Este repositorio, publicado por el usuario immanuelpeter, contiene únicamente la torre de visión (vision tower) y el proyector (projector) del modelo original en precisión BF16, eliminando por completo el modelo de lenguaje. El resultado es un componente de 1.235.126.784 parámetros (aproximadamente 1,24 mil millones) orientado exclusivamente a la extracción de características de imágenes congeladas (frozen-feature probing).

El modelo resuelve un problema concreto: permitir a investigadores y desarrolladores reutilizar el codificador visual de Hy4 de forma aislada, sin cargar el coste computacional y de memoria del modelo lingüístico completo. Se distribuye con la etiqueta de pipeline `image-feature-extraction` y requiere `trust_remote_code=True` para su carga mediante `AutoModel`, ya que emplea código personalizado.

La relevancia de esta ficha radica en su carácter de componente especializado: no es un modelo generativo ni conversacional, sino una pieza de infraestructura para pipelines de visión por computador, sistemas de recuperación multimodal o experimentos de representación visual. La información pública disponible es muy limitada (cero descargas y cero likes en el momento de la consulta), y la model card se centra en detalles de uso técnico más que en resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Torre de visión (vision tower) de 40 bloques con proyector convolucional, extraída de Tencent Hy4 |
| Parámetros totales | 1.235.126.784 (1,24 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de extracción de características, no generativo) |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible (componente visual, sin capacidades lingüísticas) |
| Licencia | Tencent Hy License 1.0 (`tencent-hy-license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la torre de visión de Tencent Hy4, compuesta por 40 bloques (blocks) que procesan imágenes RGB de 512×512 píxeles normalizadas con media y desviación estándar de 0,5. La torre produce una rejilla raster de 32×32 con una anchura (width) de 1536. A continuación, un proyector convolucional genera rejillas de 16×16 con una anchura de 6144. El repositorio preserva los 649 tensores de visión del modelo original y elimina el modelo de lenguaje.

El diseño incluye dos etapas de salida diferenciadas: la etapa `merged`, que agrupa vecindades 2×2 normalizadas con RMS, y la etapa `projected`, que emite la salida de la convolución sin delimitadores de fila. El modelo permite solicitar salidas de la torre a profundidades de bloque concretas (indexadas desde uno), lo que facilita el análisis por capas. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que este repositorio es una extracción de pesos de un modelo base y no documenta su proceso de entrenamiento.

## Capacidades

- Extracción de características visuales a partir de imágenes RGB de 512×512 normalizadas.
- Salida de características de la torre a profundidades de bloque seleccionables (una-indexadas).
- Generación de características `merged` mediante agrupación de vecindades 2×2 normalizadas con RMS.
- Generación de características `projected` a partir de la salida convolucional.
- Soporte de procesamiento por lotes (batch) de tensores RGB.
- Carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True`.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni capacidades multilingües, al haberse eliminado el modelo de lenguaje.

## Casos de uso

- Investigación en representaciones visuales: el modelo permite extraer características congeladas de imágenes para entrenar clasificadores lineales o sondas (probes) sobre ellas, evaluando la calidad de las representaciones del codificador visual de Hy4 sin cargar el modelo completo.
- Recuperación de imágenes (image retrieval): las características `projected` de 16×16 con anchura 6144 pueden indexarse en bases vectoriales para búsqueda por similitud entre imágenes.
- Sistemas de búsqueda multimodal: combinando estas características visuales con un codificador de texto independiente, se pueden construir pipelines de búsqueda texto-a-imagen o imagen-a-texto.
- Detección y segmentación con cabezas ligeras: las rejillas de 32×32 (torre) y 16×16 (proyector) sirven como entrada a cabezas de detección o segmentación entrenadas de forma específica.
- Análisis por capas: la posibilidad de solicitar salidas a distintas profundidades de bloque permite estudiar cómo evoluciona la representación visual a lo largo de la red.
- Clasificación de imágenes con bajo coste de ajuste: al congelar el extractor y entrenar solo una cabeza de clasificación, se reduce drásticamente el coste de entrenamiento frente a un fine-tuning completo.
- Preprocesamiento en pipelines de visión industrial: extracción de características para control de calidad o inspección visual, donde se requiere un codificador fijo y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 1,24 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 2,5 GB (coincide con el tamaño del repositorio). La VRAM adicional depende del tamaño del lote y de las activaciones intermedias.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para lotes pequeños; para lotes grandes o procesamiento por lotes de imágenes de 512×512, se recomienda una GPU de 16 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090, siempre que el tamaño de lote se ajuste a la memoria disponible.
- Opciones de despliegue: la model card solo documenta la carga mediante `transformers` con `AutoModel` y `trust_remote_code=True`. No se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI, que en general no están orientados a extractores de características visuales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (extractores de características visuales derivados de modelos multimodales) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo no genera texto ni mantiene conversaciones: es exclusivamente un extractor de características visuales.
- No se dispone de información sobre sesgos del codificador visual subyacente; pueden existir sesgos heredados de los datos de entrenamiento originales de Tencent Hy4.
- El riesgo de alucinación no aplica en el sentido generativo, pero las características extraídas pueden no ser representativas para dominios alejados de los datos de entrenamiento originales.
- La licencia Tencent Hy License 1.0 impone restricciones que deben revisarse antes de cualquier uso comercial; no se trata de una licencia permisiva estándar (Apache 2.0 o MIT).
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día, lo que indica que no ha sido validado por la comunidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor del repositorio; debe auditarse antes de su uso en producción.
- La entrada debe ser estrictamente RGB de 512×512 normalizada con media y desviación estándar de 0,5; otras resoluciones o normalizaciones pueden degradar las características.
- No hay información sobre idiomas, ya que el componente lingüístico fue eliminado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/Hy4-Vision
- Modelo base Tencent Hy4: https://huggingface.co/tencent/Hy4
- Revisión específica del modelo base referenciada: https://huggingface.co/tencent/Hy4/tree/c10c0de5b6f850703fb0a90e65d1c32b558b9167
- Licencia (referenciada en el repositorio): LICENSE
- Atribución y cambios (referenciado en el repositorio): NOTICE
