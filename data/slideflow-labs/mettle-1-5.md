# slideflow-labs/mettle-1.5

## Resumen

METTLE 1.5 es un modelo de extracción de características (feature extraction) para patología computacional e histopatología, desarrollado por Slideflow Labs. Se trata de un fine-tune de robustez sobre H-optimus-0 de Bioptimus, diseñado específicamente para mejorar la consistencia de las representaciones frente a la variación entre escáneres de portaobjetos y a las diferencias de tinción, manteniendo al mismo tiempo información morfológica biológicamente útil.

El modelo emplea una arquitectura ViT-g/14 con cuatro tokens de registro (register tokens) y una cabeza de refinamiento CLS. Trabaja sobre teselas (tiles) de imagen RGB de 224 × 224 píxeles y produce por defecto un embedding CLS refinado de 1.536 dimensiones, con la opción de generar un vector de 3.072 dimensiones que combina el CLS refinado con la media de los parches espaciales. Con aproximadamente 1.136 millones de parámetros, es un modelo de escala "g" (giant) orientado a extracción de características, no a generación.

Su relevancia radica en el problema de la variabilidad técnica en imágenes histopatológicas: un mismo tejido teñido y escaneado con equipos distintos produce representaciones divergentes que degradan los pipelines de downstream (clasificación, recuperación, clustering). METTLE 1.5 aborda esta falta de robustez mediante un ajuste fino específico, y su empaquetado preserva los valores tensoriales originales byte a byte, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-g/14 con cuatro register tokens y cabeza de refinamiento CLS |
| Parametros totales | 1.136.353.296 (1,14 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por teselas; entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible (pesos en precisión original, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), con `custom_code` y `trust_remote_code` requerido |
| Dimensión de salida | 1.536 (CLS) o 3.072 (CLS + media espacial) |
| Entrada | Tesela RGB 224 × 224, interpolación bicúbica |
| Normalización | media `[0.707223, 0.578729, 0.703617]`, desviación `[0.211883, 0.230117, 0.177517]` |
| Modelo base | bioptimus/H-optimus-0 |
| Tamaño del repo | 4,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer ViT-g/14, es decir, un transformer de visión de escala giant con parches de 14 × 14 píxeles, al que se añaden cuatro register tokens y una cabeza de refinamiento sobre el token CLS. Los register tokens son una técnica introducida para absorber artefactos de atención y mejorar la calidad de las representaciones globales; la cabeza de refinamiento transforma el CLS en el embedding final de 1.536 dimensiones. Existe una segunda vista de salida que concatena el CLS refinado con la media de los parches espaciales (excluyendo CLS y register tokens), resultando en 3.072 dimensiones. Las dimensiones de la cabeza están especificadas en `config.json`.

El modelo es un fine-tune de robustez sobre H-optimus-0, orientado a mejorar la consistencia de representaciones entre escáneres y variaciones de tinción. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO (poco habituales en un extractor de características). El empaquetado se verificó rigurosamente: los 577 tensores guardados coinciden byte a byte con el checkpoint fuente, el paquete carga vía `AutoModel` sin pesos faltantes ni inesperados, y ambas vistas de características coinciden con una implementación de referencia usando el checkpoint original hasta una diferencia absoluta máxima de 1,79e-7 en inferencia CPU float32. Las identidades de los artefactos y resultados de test están en `verification.json`; los checksums, en `weights_manifest.json`. El runtime probado fue PyTorch 2.13.0, timm 1.0.29 y Transformers 4.57.1.

## Capacidades

- Extracción de características de imágenes histopatológicas a nivel de tesela (224 × 224 RGB).
- Generación de embeddings globales de 1.536 dimensiones (vista `cls`).
- Generación de embeddings de 3.072 dimensiones combinando CLS refinado y media espacial de parches (vista `cls_mean`).
- Robustez mejorada frente a variación de escáner y tinción, orientada a mantener morfología biológicamente útil.
- Integración con el ecosistema Transformers mediante `AutoImageProcessor` y `AutoModel` con `trust_remote_code=True`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un extractor de características puro.
- No es un sistema de diagnóstico autónomo; la model card declara explícitamente que no realiza afirmaciones de rendimiento clínico ni de benchmark para este checkpoint.

## Casos de uso

- Búsqueda y recuperación de imágenes (image retrieval) en archivos de patología: los embeddings de 1.536 o 3.072 dimensiones permiten indexar teselas y recuperar casos morfológicamente similares mediante similitud vectorial, con la ventaja de que la robustez frente a escáneres reduce falsos negativos por dominio técnico.
- Clasificación downstream de tejidos: usar el modelo como extractor congelado y entrenar un clasificador lineal o una cabeza ligera sobre los embeddings para tareas como subtipado tumoral o detección de regiones de interés.
- Clustering no supervisado de teselas: agrupar millones de parches por morfología para descubrimiento de patrones o control de calidad de datasets, aprovechando la consistencia de representación entre fuentes.
- Mitigación de batch effects entre laboratorios: al mejorar la consistencia entre escáneres y tinciones, los embeddings sirven para armonizar cohorts multi-centro antes de análisis estadísticos o de entrenamiento de modelos.
- Construcción de pipelines de weak supervision / multiple instance learning (MIL): los embeddings por tesela alimentan agregadores MIL para predicción a nivel de portaobjetos (por ejemplo, pronóstico o subtipos), un patrón estándar en patología computacional.
- Preprocesado para modelos generativos o de segmentación: los embeddings pueden servir como condicionamiento o como features para tareas de segmentación de núcleos o síntesis de imágenes.
- Benchmarking de robustez: evaluar la estabilidad de representaciones frente a distintos escáneres comparando vistas `cls` y `cls_mean` en un mismo tejido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no realiza afirmaciones de benchmark ni de rendimiento clínico para este checkpoint. El único dato cuantitativo de rendimiento es la verificación de empaquetado: diferencia absoluta máxima de 1,79e-7 frente a la implementación de referencia en CPU float32.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,14 mil millones de parámetros, en float32 los pesos ocupan aproximadamente 4,5 GB; en float16/bfloat16, unos 2,3 GB. El tamaño del repo (4,5 GB) es consistente con pesos en precisión original.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en fp16 con batch pequeño; A100, H100 o L40S para procesamiento masivo de teselas con batches grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090; incluso tarjetas de 8 GB pueden ejecutar batches pequeños en fp16.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta oficial documentada); el modelo usa `custom_code` y nombres de tensor `backbone.*`, por lo que cargadores alternativos (vLLM, llama.cpp, Ollama, TGI) no están documentados ni soportados para este caso de uso de visión. Para servir a escala conviene envolver el modelo en un servidor de inferencia propio (por ejemplo, FastAPI + TorchScript/ONNX si se exporta).
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del batch, la GPU y la resolución fija de 224 × 224.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| METTLE 1.5 | 1,14 mil M | tesela 224 × 224 | 1.536 o 3.072 dim | no disponible | Hugging Face, `custom_code` |
| H-optimus-0 (base) | no disponible en la información | tesela 224 × 224 | no disponible | no disponible | Hugging Face (bioptimus) |
| METTLE 1 (pre-release) | no disponible en la información | tesela 224 × 224 | no disponible | no disponible | Hugging Face (slideflow-labs) |
| Otros extractores de patología (p. ej. UNI, Virchow, Prov-GigaPath) | no disponibles en la información | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: la model card no publica benchmarks y no se dispone de datos de rendimiento de los modelos comparables en la información proporcionada. La comparación más directa es con su modelo base H-optimus-0, del que METTLE 1.5 es un fine-tune de robustez, y con METTLE 1 (pre-release), su checkpoint anterior.

## Limitaciones y advertencias

- No es un sistema de diagnóstico autónomo: la model card lo declara explícitamente como extractor de características de teselas, sin afirmaciones de rendimiento clínico.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; verificar antes de cualquier despliegue en producción.
- Sesgos conocidos: no documentados en la información disponible; al entrenar sobre datos histopatológicos, puede heredar sesgos de representación demográfica, de tejido o de equipos de escaneo del dataset de origen.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero los embeddings pueden no capturar morfología relevante en tejidos o tinciones fuera de distribución.
- Limitaciones de idioma: no aplica (modelo de visión); no procesa texto.
- Dependencia de `trust_remote_code=True` y de `custom_code`: implica ejecutar código del autor, con el riesgo de seguridad asociado; auditar antes de usar en entornos sensibles.
- Compatibilidad: consumidores que cargan directamente el checkpoint plano `.pt` original requieren su formato existente o un cargador safetensors explícitamente compatible; el loader de Hugging Face usa nombres de tensor `backbone.*`.
- Entrada fija de 224 × 224: no está documentado el soporte de resoluciones mayores ni de estrategias de multi-escala.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora de robustez frente a H-optimus-0 en la información disponible; conviene validar en el dominio propio.
- Cero descargas y un solo "like" en Hugging Face: modelo muy reciente y con escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slideflow-labs/mettle-1.5
- Modelo base H-optimus-0: https://huggingface.co/bioptimus/H-optimus-0
- Checkpoint anterior METTLE 1 (pre-release): https://huggingface.co/slideflow-labs/mettle-1
- Repositorio de Slideflow Labs: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
