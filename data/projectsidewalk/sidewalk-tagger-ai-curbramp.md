# projectsidewalk/sidewalk-tagger-ai-curbramp

## Resumen

El modelo `projectsidewalk/sidewalk-tagger-ai-curbramp` es un clasificador de imágenes multi-etiqueta desarrollado por Project Sidewalk. Predice qué etiquetas de accesibilidad se aplican a una anotación de tipo rampa de acera (*curb ramp*) a partir de un recorte de una imagen de Google Street View. No es un modelo de lenguaje: se sirve a través de `sidewalk-ai-api` para sugerir etiquetas a las anotaciones creadas por personas voluntarias en Project Sidewalk.

Técnicamente, es un DINOv2 ViT-B/14 con 4 tokens de registro (`dinov2_vitb14_reg4`) afinado, al que se añade una cabeza `Linear(768, 256) → ReLU → Linear(256, 10)` con una sigmoide por clase. La entrada es un recorte RGB redimensionado a 256 píxeles, rellenado a un múltiplo de 14 y normalizado con la media y la desviación típica de ImageNet. El modelo se publica como un *state dict* de PyTorch y deriva del conjunto de datos limpio empleado en el artículo *Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset* (ASSETS '24).

Su relevancia actual está en la evaluación fina de accesibilidad de aceras a escala municipal: permite pre-etiquetar automáticamente rampas con problemas como falta de aviso táctil, estrechez, desnivel, pendiente pronunciada o superficie deteriorada, y así reducir el coste de auditorías manuales y mejorar la calidad de los datos de accesibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 con 4 register tokens (`dinov2_vitb14_reg4`) fine-tuned; cabeza `Linear(768, 256) → ReLU → Linear(256, 10)` con sigmoide por clase |
| Parámetros totales | no disponible en la model card (el backbone es DINOv2 ViT-B/14; el recuento total no se especifica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes; no procesa secuencias de texto) |
| Tipos de cuantización | no disponible; se publica un state dict PyTorch sin cuantizaciones declaradas |
| Idiomas soportados | no disponible (modelo visual; no hay idiomas declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pth`); carga con `torch.load(..., weights_only=True)`; sha256: `4d00193aed73fc199049f31cebade51f236bfca92ad9f76adf08a9d08a272833` |
| Pipeline | image-classification |
| Modelo base | `facebook/dinov2-with-registers-base` |
| Dataset de entrenamiento | `projectsidewalk/sidewalk-tagger-ai-validated` |
| Resolución de entrada | recorte RGB redimensionado a 256 px y rellenado a un múltiplo de 14; normalización con media y desviación típica de ImageNet |
| Tamaño del repositorio | 0,3 GB |
| Salidas | 10 clases con sigmoide por clase; 8 etiquetas activas y 2 placeholders `NULL` |

## Arquitectura y entrenamiento

El modelo parte de DINOv2 ViT-B/14 con 4 tokens de registro, un *vision transformer* auto-supervisado que aporta representaciones visuales robustas. Sobre ese backbone se ha añadido una cabeza de clasificación personalizada: `Linear(768, 256) → ReLU → Linear(256, 10)`, con activación sigmoide independiente por clase. Esto lo convierte en un clasificador multi-etiqueta, no en un clasificador exclusivo: una misma rampa puede recibir varias etiquetas simultáneamente. La arquitectura es personalizada y no se carga mediante una clase estándar de `transformers`; la implementación de referencia está en `DinoVisionTransformerClassifier` e `ImageTagger` dentro de `sidewalk_ai_api/tagger.py`.

El entrenamiento se realizó sobre el conjunto de datos limpio `projectsidewalk/sidewalk-tagger-ai-validated`, descrito en el artículo ASSETS '24. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, el optimizador, las épocas ni si hubo etapas de RLHF o DPO, por lo que esos datos no están disponibles. La innovación principal es el uso de un backbone DINOv2 con tokens de registro afinado para una tarea muy específica de accesibilidad urbana, con umbrales por etiqueta publicados aparte para convertir las salidas sigmoide en decisiones binarias.

## Capacidades

- Clasificación multi-etiqueta de recortes de rampas de acera en 8 etiquetas activas: `missing tactile warning`, `narrow`, `not enough landing space`, `not level with street`, `points into traffic`, `debris / pooled water`, `steep` y `surface problem`.
- Salida con 10 posiciones: 8 etiquetas activas y 2 placeholders `NULL` que preservan los índices de entrenamiento.
- Generación de puntuaciones sigmoide por clase, no probabilidades calibradas; requieren umbrales por etiqueta para decidir presencia o ausencia.
- Integración prevista en `sidewalk-ai-api` para sugerir etiquetas a anotaciones de Project Sidewalk.
- Procesamiento de imágenes RGB normalizadas con estadísticas de ImageNet y entrada de 256 px.
- No genera texto, código ni respuestas conversacionales.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas ni procesamiento de lenguaje natural.
- Capacidad visual limitada a la clasificación de recortes de rampas; no describe la imagen ni detecta objetos fuera de las etiquetas entrenadas.

## Casos de uso

- Sugerencia de etiquetas en Project Sidewalk: el modelo recibe un recorte de rampa desde `sidewalk-ai-api`, devuelve puntuaciones sigmoide y, aplicando `tag_thresholds.json`, sugiere etiquetas a las personas que revisan anotaciones.
- Auditoría de accesibilidad municipal a escala: procesar inventarios de imágenes de Street View para detectar rampas estrechas, con desnivel, mal estado o pendiente pronunciada, y priorizar inspecciones o reparaciones.
- Enrutamiento accesible para sillas de ruedas: integrar las etiquetas predichas en pipelines de rutas peatonales para penalizar o evitar rampas con `steep`, `surface problem` o `not level with street`.
- Control de calidad de anotaciones crowdsourced: comparar las sugerencias del modelo con las etiquetas humanas y marcar discrepancias para revisión, reduciendo el ruido en el dataset.
- Pre-etiquetado de nuevos datasets: usar el modelo para anotar automáticamente recortes de rampas antes de una revisión manual, acelerando la creación de conjuntos de datos de accesibilidad.
- Investigación reproducible en accesibilidad: servir como uno de los modelos de referencia del artículo ASSETS '24, con código de reproducción en `REPRODUCE_RESULTS.md`.
- Despliegue interno como microservicio PyTorch: cargar el *state dict* con `torch.load(..., weights_only=True)` y exponer una API de clasificación para herramientas de mapeo o aplicaciones móviles.
- Análisis de disparidades geográficas: aplicar el clasificador a imágenes de distintas zonas para estudiar si la presencia de rampas inaccesibles se distribuye de forma desigual, siempre que se controlen los sesgos de imagen y cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo ASSETS '24 y a `REPRODUCE_RESULTS.md` para los resultados por etiqueta en el *test split* de `sidewalk-tagger-ai-validated`, pero no incluye cifras concretas.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (modelo de clasificación de imágenes) |
| Resultados por etiqueta en el test split de `sidewalk-tagger-ai-validated` | no disponibles en la información proporcionada; consultar el paper y `REPRODUCE_RESULTS.md` |
| Latencia y throughput | no disponibles |

## Requisitos de hardware

- No hay mediciones oficiales de VRAM, latencia ni throughput en la información proporcionada.
- Estimación orientativa no confirmada: al tratarse de un backbone ViT-B/14, los pesos en FP32 ocuparían del orden de 0,35 GB y en FP16 del orden de 0,17 GB; con batch 1 y entrada de 256 px, el pico de VRAM debería ser bajo, previsiblemente inferior a 2 GB. Es una estimación, no un dato publicado por el autor.
- GPU recomendadas: no se indican. Por tamaño, cualquier GPU de consumo con al menos 4 GB de VRAM debería poder ejecutarlo; también es viable la inferencia en CPU para volúmenes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o similares, aunque no hay cifras oficiales.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La integración prevista es mediante PyTorch personalizado y `sidewalk-ai-api`; la carga requiere el código de `sidewalk_ai_api/tagger.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `projectsidewalk/sidewalk-tagger-ai-curbramp` | Clasificador multi-etiqueta de rampas de acera | no disponible | recorte RGB de 256 px | Apache-2.0 | HuggingFace |
| `facebook/dinov2-with-registers-base` | Backbone vision transformer base | no disponible en esta información | imagen | no disponible en esta información | HuggingFace |
| Modelos de `projectsidewalk/sidewalk-tagger-ai-models` | Familia de taggers de Project Sidewalk del artículo ASSETS '24 | no disponible | recortes de imagen | no disponible en esta información | HuggingFace |

No hay datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación relevante es funcional: este modelo es un tagger especializado en rampas, mientras que `facebook/dinov2-with-registers-base` es el backbone generalista sin la cabeza de clasificación de accesibilidad.

## Limitaciones y advertencias

- Las salidas sigmoide no son probabilidades calibradas; no deben interpretarse como confianza directa sin aplicar los umbrales por etiqueta de `tag_thresholds.json`.
- El vector de salida tiene 10 posiciones, pero dos son placeholders `NULL`; no deben tratarse como etiquetas reales.
- El modelo solo clasifica etiquetas para anotaciones de tipo *Curb Ramp*; no cubre otros tipos de etiquetas de Project Sidewalk ni otras tareas de accesibilidad.
- Está entrenado con recortes de Google Street View y el dataset `sidewalk-tagger-ai-validated`; puede sufrir desviación de dominio ante imágenes de otras fuentes, cámaras, países, condiciones de iluminación o clima.
- No se documentan sesgos demográficos, geográficos o de imagen en la información disponible.
- Riesgo de falsos positivos y falsos negativos en etiquetas concretas; al ser un clasificador, no genera texto ni alucina, pero sí puede etiquetar incorrectamente una rampa.
- No hay idiomas soportados declarados porque no procesa texto.
- Licencia Apache-2.0 para el modelo, pero el uso de imágenes de Google Street View y del dataset puede estar sujeto a términos adicionales; conviene revisarlos antes de un despliegue comercial.
- La arquitectura es personalizada y no se carga con `transformers` de forma estándar; requiere el código de `sidewalk-ai-api` o una implementación equivalente.
- El formato es un *state dict* `.pth`, no safetensors; `torch.load(..., weights_only=True)` es la carga recomendada.
- No hay métricas publicadas de latencia, throughput, consumo de VRAM ni comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-curbramp
- Project Sidewalk: https://projectsidewalk.org
- API de servicio: https://github.com/ProjectSidewalk/sidewalk-ai-api
- Código de entrenamiento y evaluación: https://github.com/ProjectSidewalk/sidewalk-tagger-ai
- Repositorio de modelos del artículo: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-models
- Dataset validado: https://huggingface.co/datasets/projectsidewalk/sidewalk-tagger-ai-validated
- Artículo ASSETS '24: https://doi.org/10.1145/3663548.3688531
- Reproducción de resultados: https://github.com/ProjectSidewalk/sidewalk-tagger-ai/blob/main/REPRODUCE_RESULTS.md
- Código de carga y preprocesado: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/sidewalk_ai_api/tagger.py
- Umbrales por etiqueta: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/tag_thresholds.json
- Commit de referencia de los modelos: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-models/tree/65959dbc80b87e4f39385204c4b639cbcf58e1a8
