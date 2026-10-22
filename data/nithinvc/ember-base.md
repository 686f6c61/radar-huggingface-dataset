# nithinvc/EMber-base

## Resumen

EMber-base es un vision transformer preentrenado para extraer representaciones de imágenes de partículas de crio-microscopía electrónica de partícula única (cryo-EM). Lo desarrolla un equipo académico encabezado por Nithin Chalapathi (con Theo Sternlieb, Ethan Han, Sonya M. Hanson, Pilar Cossio, Aditi S. Krishnapriyan y Ritwik Gupta) y se publica junto al preprint "EMber: Learning the Shared Latent Structure of Cryo-EM Inverse Problems". El modelo resuelve un problema clásico del dominio: obtener un espacio latente compartido y reutilizable para múltiples problemas inversos de cryo-EM, en lugar de entrenar una red específica para cada tarea downstream.

La relevancia del modelo está en el régimen de entrenamiento: autodestilización sobre más de 50 millones de imágenes experimentales de partículas procedentes de 214 conjuntos de datos de EMPIAR, complementadas con proyecciones simuladas de 268.000 ensamblados moleculares. Esa combinación de datos reales y simulados busca que el embedding generalice tanto a muestras experimentales ruidosas como a geometrías moleculares no vistas.

Arquitectónicamente es un ViT de 85.262.608 parámetros (85,3 M) con tamaño de parche de 16x16, que devuelve un embedding a nivel de imagen y características espaciales por parche. No es un modelo generativo ni conversacional: su salida está pensada para alimentar clasificadores, agrupamientos, modelos de reconstrucción o cualquier cabecera downstream. El repositorio ocupa 0,3 GB y el modelo se publica en safetensors, con 0 descargas y 0 likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con parches de 16x16, preentrenado mediante autodestilización (self-distillation) |
| Parametros totales | 85.262.608 (85,3 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de contexto textual. La resolución de entrada y el número de parches por imagen no se detallan en la información disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors (tamaño de repo 0,3 GB) |
| Idiomas soportados | No aplica: modelo de visión sin capacidades de texto; no se declaran idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors; carga mediante `model_hub_mixin` / `pytorch_model_hub_mixin` (librería EMber) |

## Arquitectura y entrenamiento

EMber es una familia de vision transformers preentrenados para imágenes de partículas de cryo-EM. La variante base usa un transformer de visión con parches de 16x16 y 85,3 M de parámetros, y produce dos tipos de salida: un embedding agregado a nivel de imagen y un mapa de características espaciales por parche. Esa doble salida permite tanto tareas de clasificación y agrupamiento global (por ejemplo, separar poblaciones conformacionales) como tareas que requieren localización espacial (por ejemplo, mapas de calidad o atención sobre regiones de la partícula).

El preentrenamiento se hizo por autodestilización (el esquema típico de las familias DINO-style, aunque la model card no detalla hiperparámetros concretos) sobre más de 50 millones de imágenes experimentales de partículas de 214 datasets de EMPIAR, junto con proyecciones simuladas generadas a partir de 268.000 ensamblados moleculares. No se documentan en la información disponible el número exacto de tokens vistos, la composición precisa del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a un encoder de visión). La innovación declarada por los autores es aprender una estructura latente compartida entre distintos problemas inversos de cryo-EM, de modo que un único extractor sirva para múltiples tareas downstream en lugar de requerir un modelo por tarea.

## Capacidades

- Extracción de características de imágenes de partículas de cryo-EM: embedding a nivel de imagen listo para clasificación, regresión o recuperación por similitud.
- Características espaciales por parche (patch features), útiles para tareas densas como mapas de calidad, segmentación o atención espacial.
- Representaciones reutilizables para aprendizaje con pocas etiquetas (few-shot) o con etiquetas ruidosas, al partir de un espacio latente preentrenado en dominio.
- Soporte de tareas downstream arbitrarias mediante cabeceras ligeras (clasificación 2D, agrupamiento, ranking de partículas).
- Integración con el ecosistema Hugging Face mediante `model_hub_mixin` y `pytorch_model_hub_mixin`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, texto, audio ni diálogo: es exclusivamente un encoder de imagen de dominio específico.
- No se declaran capacidades multilingües (no aplica).

## Casos de uso

- **Agrupamiento 2D y limpieza de partículas**: extraer embeddings de un stack de partículas y agruparlos con k-means o UMAP para separar vistas, estados conformacionales o basura; el preentrenamiento en 214 datasets de EMPIAR debería dar features más transferibles que un encoder genérico.
- **Curado automático de datasets**: entrenar un clasificador lineal sobre los embeddings para etiquetar partículas como "buena", "agregado" o "contaminación", reduciendo la revisión manual antes del refinamiento 3D.
- **Clasificación de heterogeneidad conformacional**: usar el embedding de imagen como entrada de un clasificador o de un modelo generativo de volúmenes, aprovechando que el espacio latente se entrenó para ser compartido entre problemas inversos.
- **Recuperación de imágenes similares en EMPIAR**: indexar con embeddings las partículas de un conjunto y hacer búsqueda por similitud para encontrar vistas relacionadas o duplicados entre datasets.
- **Inicialización de modelos de reconstrucción**: emplear las características por parche como inicialización o como entrada adicional de una red de reconstrucción/refinamiento, acortando el entrenamiento desde cero.
- **Anotación asistida y aprendizaje activo**: seleccionar las partículas con mayor incertidumbre en el espacio de embeddings para que un experto las etiquete, disminuyendo el coste de anotación en proyectos nuevos.
- **Detección de artefactos y deriva del microscopio**: combinar el embedding global con metadatos (dosis, desenfoque, cuadro) para modelar efectos del experimento y detectar lotes anómalos antes del procesado estándar.
- **Pipeline de investigación reproducible**: cargar el modelo directamente desde el Hub en scripts de análisis con `model_hub_mixin`, facilitando la comparación de resultados entre laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluación (ni tareas downstream, ni comparación con baselines) y el preprint referenciado no se ha podido consultar en la información proporcionada. Cualquier cifra de rendimiento debería tomarse de la versión publicada del paper (arXiv:2610.22523), no de esta ficha.

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 0,34 GB en FP32 (85,3 M parámetros x 4 bytes) y unos 0,17 GB en FP16/BF16, sin contar activaciones. Con imágenes de tamaño moderado y lotes pequeños, el consumo real es de pocos GB.
- **GPU recomendadas**: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 está sobradamente dimensionada para este encoder. Para procesar lotes grandes de partículas en paralelo, una A100/H100 con más memoria permite aumentar el batch size y aprovechar mejor el paralelismo.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer con 4-8 GB o más (GTX 1660, RTX 3060, RTX 4060, RTX 4090). Incluso es viable en CPU para inferencia por lotes pequeños, aunque con menor throughput.
- **Opciones de despliegue**: PyTorch con pesos safetensors cargados vía Hugging Face Hub (`model_hub_mixin` / `pytorch_model_hub_mixin`). No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI; esos motores están orientados a LLM y no aplican a este encoder, aunque una exportación a ONNX o TorchScript permitiría servir el modelo con runtimes genéricos (exportación no documentada en la información disponible).
- **Latencia y throughput**: no disponible. No se publican medidas de latencia por imagen ni de imágenes por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables de extracción de características para cryo-EM en la información proporcionada. Como referencia de categoría (ViT-B con ~86 M de parámetros), los encoders visuales de propósito general tipo DINOv2 ViT-B/14 comparten escala, pero no están especializados en partículas de cryo-EM y sus cifras de parámetros, contexto y licencia no se han verificado aquí, por lo que no se incluyen como valores fiables.

| Modelo | Parametros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMber-base | 85,3 M | Parches de 16x16; resolución de entrada no disponible | Cryo-EM de partícula única | No disponible | Hugging Face (`nithinvc/EMber-base`), repo de 0,3 GB |
| Encoders ViT-B genéricos (p. ej. DINOv2) | ~86 M (no verificado en esta búsqueda) | No disponible | Imagen natural | No verificada | No verificada |
| Otros extractores específicos de cryo-EM | No disponible | No disponible | Cryo-EM | No disponible | No disponible |

## Limitaciones y advertencias

- **Licencia no declarada**: no hay licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido. Es un bloqueo potencial para producción.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa en la información disponible sobre la calidad del embedding frente a alternativas; hay que validar en el dominio propio antes de adoptarlo.
- **Especialización estrecha**: entrenado solo con imágenes de partículas de cryo-EM; su uso fuera de ese dominio (microscopía óptica, imagen natural, tomografía) no está justificado ni evaluado.
- **Dependencia de los datos de entrenamiento**: los 214 datasets de EMPIAR y las 268.000 estructuras simuladas pueden sobrerrepresentar ciertos tipos de muestra, simetrías o rangos de tamaño de partícula, introduciendo sesgo hacia esas condiciones.
- **Resolución limitada por el parche 16x16**: las características espaciales tienen granularidad gruesa; para detalles finos puede requerir estrategias adicionales (ventanas deslizantes, upsampling o cabeceras específicas).
- **No es un modelo generativo**: no alucina texto, pero sus embeddings no son directamente interpretables y pueden producir agrupaciones engañosas si el preprocesado (normalización, recorte, escala de contraste) difiere del usado en el preentrenamiento.
- **Detalles de preprocesado no documentados**: la model card no especifica tamaño de entrada ni normalización, lo que puede provocar degradación silenciosa del rendimiento si se replica mal el pipeline.
- **Madurez**: 0 descargas y 0 likes en el momento de la ficha, creado en octubre de 2026; es un artefacto de investigación reciente, sin evidencia de uso en producción.
- **Sin fine-tuning incluido**: la variante base requiere una cabecera o etapa de ajuste para cada tarea concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nithinvc/EMber-base
- Preprint: https://arxiv.org/abs/2610.22523
- Código: https://github.com/nithinvc/EMber
- Web del primer autor (Nithin Chalapathi): https://nithinvc.github.io/
- Web de Theo Sternlieb: https://www.theosternlieb.com/
- Web de Sonya M. Hanson: https://sonyahanson.github.io/
- Web de Pilar Cossio: https://pilarcossio.org/
- Web de Aditi S. Krishnapriyan: https://a1k12.github.io/
- Web de Ritwik Gupta: https://ritwikgupta.me/
- EMPIAR (origen de los datos experimentales): https://www.ebi.ac.uk/empiar/
