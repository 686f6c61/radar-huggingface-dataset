# akhilbattula/formcheck-vlm-v5

## Resumen

formcheck-vlm-v5 es un modelo de visión-lenguaje (VLM) especializado en la detección de marcas y elementos en formularios escaneados, desarrollado por el usuario akhilbattula. Se trata de un ajuste fino (fine-tuning) secuencial sobre la versión anterior v4 del mismo autor, orientado a un dominio muy concreto: la localización de marcas dibujadas, casillas y campos en documentos de formulario reales y sintéticos. El modelo resuelve el problema de extraer estructura y marcas de formularios heterogéneos, una tarea clásica en digitalización documental y procesamiento de formularios.

El entrenamiento combina 24.000 páginas sintéticas con 8.006 páginas reales del conjunto CommonForms (licencia Apache-2.0), aplicando aumentación con marcas dibujadas. En las páginas reales se enmascaran los objetivos de etiqueta y tipo, de modo que el modelo se centra en la detección sobre datos reales. Los resultados publicados por el autor en su model card muestran un rendimiento modesto en el dominio real: recall de detección de 0,365 y precisión de 0,383, con una fracción de predicciones vacías del 57,1 %.

La información pública es muy limitada: el repositorio ocupa 0,1 GB, no declara licencia, idiomas ni pipeline, y no se especifica la arquitectura base sobre la que se construye el ajuste. A pesar de estas carencias, el modelo resulta relevante como ejemplo de adaptación de dominio de un VLM a una tarea documental específica y como referencia para quienes trabajan en extracción de formularios con modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (VLM ajustado a partir de formcheck-vlm-v4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo etiquetado como pytorch) |

## Arquitectura y entrenamiento

El autor no detalla la arquitectura interna del modelo. La model card indica únicamente que es un fine-tuning de formcheck-vlm-v4, que a su vez es un modelo de visión-lenguaje orientado a la detección de elementos en formularios. Por la naturaleza de la tarea (detección de marcas y campos sobre imágenes de documentos) y por la etiqueta `pytorch` del repositorio, se trata de un modelo multimodal que procesa páginas escaneadas y produce localizaciones o predicciones estructuradas, pero no se especifica si emplea un transformer multimodal estándar, un encoder visual acoplado a un decoder de lenguaje u otra variante.

El entrenamiento se realizó sobre 24.000 páginas sintéticas más 8.006 páginas reales del conjunto CommonForms (Apache-2.0), con aumentación consistente en marcas dibujadas. En las páginas reales se enmascaran los objetivos de etiqueta y tipo, de forma que la supervisión de esos campos se concentra en los datos sintéticos y el modelo aprende la detección sobre las páginas reales. No se documenta el número de tokens de entrenamiento, la composición detallada del dataset sintético, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Detección de marcas y elementos en imágenes de formularios escaneados, incluyendo marcas dibujadas introducidas mediante aumentación.
- Procesamiento de documentos de formulario reales y sintéticos, con adaptación de dominio específica.
- Predicción de localizaciones y recuento de elementos detectados (el autor reporta métricas de recall, precisión, error de recuento y fracción de predicciones vacías).
- Capacidad multimodal de entrada imagen (páginas de formulario) y salida estructurada de detección.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades multilingües ni cobertura de idiomas.
- No se documentan capacidades de visión general más allá del dominio de formularios, ni audio.

## Casos de uso

- Digitalización de formularios en papel: el modelo puede procesar páginas escaneadas y localizar marcas y casillas, sirviendo como primer paso en un pipeline de extracción documental antes de un OCR o de reglas de negocio.
- Procesamiento de encuestas y cuestionarios: permite detectar qué casillas aparecen marcadas en formularios cumplimentados a mano, reduciendo la revisión manual en grandes volúmenes de respuestas.
- Automatización de back-office administrativo: integrado en un sistema de gestión documental, puede señalar regiones candidatas con marcas para que un operador valide solo los casos dudosos, dado su recall moderado.
- Generación de datos de entrenamiento para otros modelos: al trabajar con páginas sintéticas con marcas dibujadas, puede emplearse en la creación de conjuntos anotados para tareas de detección documental.
- Investigación en adaptación de dominio de VLMs: sirve como caso de estudio de fine-tuning secuencial (v4 a v5) con mezcla de datos sintéticos y reales y enmascaramiento de objetivos en datos reales.
- Preprocesado en pipelines de verificación documental: puede localizar campos y marcas en formularios de solicitud o registros para su posterior validación cruzada con bases de datos.

## Benchmarks y rendimiento

El autor publica métricas sobre el dominio real en la model card:

| Metrica | Valor |
|---|---|
| real_det_recall | 0,365 |
| real_det_precision | 0,383 |
| real_count_err | 0,533 |
| real_pred_empty_frac | 0,571 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, DocVQA u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo de pequeño tamaño, pero no se confirma el número de parámetros ni el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible que quepa en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio está etiquetado como `pytorch`, por lo que el despliegue requeriría cargar los pesos con PyTorch y el código específico del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLMs especializados en detección de formularios) dentro de la documentación proporcionada. El propio autor referencia formcheck-vlm-v4 como modelo base del ajuste, pero no se publican sus especificaciones ni métricas comparativas en esta ficha. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Rendimiento limitado en dominio real: recall de 0,365 y precisión de 0,383 implican que más de la mitad de las detecciones reales no se recuperan y que una fracción importante de las predicciones son incorrectas.
- Fracción elevada de predicciones vacías (0,571): el modelo no detecta nada en más de la mitad de los casos reales evaluados, lo que limita su uso autónomo en producción.
- Error de recuento de 0,533: el número de elementos detectados se desvía de forma significativa del real.
- Licencia no declarada: no se especifican condiciones de uso comercial, por lo que no puede asumirse su reutilización en productos sin aclaración del autor.
- Idiomas no declarados: se desconoce la cobertura lingüística de los formularios procesados.
- Arquitectura y tamaño no documentados: dificulta la planificación de despliegue, la estimación de recursos y la reproducibilidad.
- Riesgo de sobreajuste al dominio sintético: el enmascaramiento de objetivos en páginas reales puede sesgar el aprendizaje hacia las características de los datos sintéticos.
- Riesgo de alucinación en la salida estructurada: al ser un modelo generativo multimodal, puede producir detecciones o recuentos inconsistentes con la imagen.
- Sin datos de sesgos: no se ha publicado ningún análisis de sesgo demográfico, tipográfico o de formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhilbattula/formcheck-vlm-v5
- Modelo base referenciado (v4): https://huggingface.co/akhilbattula/formcheck-vlm-v4
- Conjunto de datos CommonForms (Apache-2.0): no se proporciona enlace directo en la información disponible.
