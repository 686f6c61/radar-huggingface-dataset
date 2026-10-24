# mamounyosef/knee-abnormality-detection-dinov3

## Resumen

`knee-abnormality-detection-dinov3` es un repositorio de pesos con dos *fine-tunes* del backbone ConvNeXt-Base preentrenado con DINOv3 (`timm/convnext_base.dinov3_lvd1689m`), adaptados a clasificación multi-etiqueta de anomalías de rodilla en resonancia magnética. Lo publica el usuario de HuggingFace mamounyosef como parte de su solución a la competición RSNA Knee Abnormality Detection de Kaggle (2026), cuyo objetivo es predecir la probabilidad de doce hallazgos clínicos por estudio a partir de imágenes de RM y, en la competición, también de informes radiológicos multilingües.

El repositorio contiene dos variantes: `dinov3_convnext_base` (entrenada sobre las etiquetas v2) y `dinov3_convnext_base_v5` (entrenada sobre las etiquetas v4). Ambas operan por corte (*per-slice*) a 512 píxeles y se distribuyen por separado del repositorio principal precisamente porque los pesos derivados de DINOv3 obligan a usar la DINOv3 License. Cada carpeta incluye pesos, configuración, un `modeling.py` autónomo, métricas, el log de entrenamiento y una model card completa.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de cómo transferir características de DINOv3 a imagen médica musculoskeletal, y como componente de ensamblado en pipelines de investigación. No es un producto clínico: el autor declara explícitamente uso exclusivo en investigación y advierte de que no es un dispositivo médico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ConvNeXt-Base (backbone DINOv3, `timm/convnext_base.dinov3_lvd1689m`) con cabeza de clasificación multi-etiqueta |
| Parámetros totales | no disponible (el tamaño del repo es de 0,7 GB e incluye dos variantes con pesos, configuración y artefactos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imágenes por corte a 512 px |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | DINOv3 License (`license: other`, `license_name: dinov3-license`); datos de entrenamiento bajo RSNA MIRA, solo investigación |
| Formato de pesos | safetensors, PyTorch (`library_name: pytorch`) |

## Arquitectura y entrenamiento

La arquitectura es una ConvNeXt-Base inicializada con los pesos DINOv3 publicados en `timm` y afinada como clasificador multi-etiqueta sobre cortes individuales de RM de rodilla a resolución de 512 px. DINOv3 aporta un preentrenamiento auto-supervisado a gran escala orientado a características visuales densas y transferibles, lo que el autor aprovecha como inicialización en lugar de un backbone ImageNet. Cada variante se entrena sobre una versión distinta del conjunto de etiquetas: v2 para `dinov3_convnext_base` y v4 para `dinov3_convnext_base_v5`, lo que explica la diferencia de rendimiento en validación.

No se detallan en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF/DPO (no procede en clasificación) o técnicas de aumento específicas. La model card sí indica que el entrenamiento se hizo sobre datos de la competición RSNA, que no se incluyen imágenes, etiquetas ni informes en el repositorio, y que cada carpeta incorpora el log de entrenamiento y las métricas para su reproducción. La agregación exacta de predicciones por corte a nivel de estudio no está descrita en la información proporcionada: las cifras publicadas corresponden a los modelos dentro de ensamblados.

## Capacidades

- Clasificación multi-etiqueta de hallazgos de rodilla en RM (el reto RSNA cubre doce hallazgos, entre ellos ACL, MCL, menisco medial, menisco lateral y otros; la lista completa por modelo no se detalla en la información disponible).
- Extracción de características visuales de alta calidad a partir de un backbone DINOv3, reutilizable para otras tareas de imagen médica mediante *fine-tuning*.
- Predicción por corte a 512 px, apta para pipelines que procesan volumen de RM corte a corte.
- Integración en ensamblados: ambas variantes forman parte de ensamblados del autor con AUC público 0,942.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de imagen puro.
- No dispone de modo *thinking*, visión generativa, audio ni generación de texto.
- Cabeza multi-etiqueta con probabilidades independientes por hallazgo, no una clasificación mutuamente excluyente.

## Casos de uso

- Reproducción de la solución de Kaggle: cargar `dinov3_convnext_base_v5` con el `modeling.py` incluido y evaluar el pipeline completo sobre las particiones de validación para verificar las métricas reportadas (AUC 0,9211) antes de reutilizar el enfoque.
- Punto de partida para *fine-tuning* en otras articulaciones o secuencias: el backbone DINOv3 ConvNeXt-Base puede reinicializarse con una nueva cabeza para tareas de RM de hombro, cadera o columna, aprovechando que el autor ya documenta la receta de entrenamiento y el log.
- Enseñanza y formación en radiología asistida por IA: usar las salidas del modelo como ejemplo de clasificación multi-etiqueta con doce clases sobre cortes reales en entornos docentes, siempre con supervisión y sin uso diagnóstico.
- Investigación comparativa de backbones: medir la ganancia de DINOv3 frente a inicializaciones ImageNet en la misma tarea y con el mismo protocolo de evaluación, usando las métricas por variante como referencia.
- Pre-etiquetado para curación de datasets: generar probabilidades preliminares sobre estudios nuevos y usarlas para priorizar la revisión manual por parte de radiólogos, reduciendo el coste de anotación.
- Componente de ensamblado en pipelines de investigación: integrar la salida por corte junto a otros modelos del repositorio principal para reproducir el ensamblado de 14 modelos (público 0,942 / privado 0,928).
- Auditoría de robustez: evaluar el comportamiento sobre el conjunto Audit-58 reportado (0,926 y 0,8957) como prueba de generalización fuera de la distribución de validación.

## Benchmarks y rendimiento

| Modelo | Etiquetas | Validación (ROC-AUC) | Audit-58 (ROC-AUC) | En solitario: público / privado |
|---|---|---|---|---|
| `dinov3_convnext_base_v5` | v4 | 0,9211 | 0,926 | no disponible |
| `dinov3_convnext_base` | v2 | 0,9011 | 0,8957 | no disponible |

Datos de ensamblado reportados por el autor (no aislables al modelo individual):

| Ensamblado | Composición | Público | Privado |
|---|---|---|---|
| Ensamblado principal | 14 modelos, incluye `dinov3_convnext_base` | 0,942 | 0,928 |
| Ensamblado reducido | 4 modelos, incluye `dinov3_convnext_base_v5` | 0,942 | 0,927 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo no procesa texto. Las métricas por hallazgo individual no se detallan.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,7 GB, de modo que cada variante en precisión de 32 bits debería ocupar del orden de cientos de MB de pesos; con lotes de cortes a 512 px, las activaciones dominan el consumo. Estimación orientativa: 2-4 GB de VRAM para inferencia en fp32 con lotes pequeños, y 1-2 GB en fp16. No hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM resulta suficiente para inferencia; para entrenamiento o *fine-tuning* conviene una A100, H100, L40S o RTX 4090 por el coste de procesar volúmenes completos de RM a 512 px.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo mediante el `modeling.py` incluido; también es viable exportar a TorchScript u ONNX o servir con Triton. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput: no disponibles. Dependen del número de cortes por estudio y del tamaño de lote; el cuello de botella esperable es el preprocesado de volúmenes DICOM y el reescalado a 512 px, no el paso por el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | ROC-AUC reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dinov3_convnext_base_v5` (este repo) | CNN DINOv3, multi-etiqueta | no disponible | corte de 512 px | 0,9211 val / 0,926 Audit-58 | DINOv3 License, solo investigación | HuggingFace |
| `dinov3_convnext_base` (este repo) | CNN DINOv3, multi-etiqueta | no disponible | corte de 512 px | 0,9011 val / 0,8957 Audit-58 | DINOv3 License, solo investigación | HuggingFace |
| Repositorio principal `mamounyosef/knee-abnormality-detection` | ensamblado del mismo autor, sin pesos DINOv3 | no disponible | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace |
| Enfoques multimodales de la competición (p. ej. `karthik2411/RSNA-Knee-Abnormality-Detection`) | imagen + texto de informes | no disponible | no disponible | no disponible | no disponible | GitHub |
| ConvNeXt-Base con inicialización ImageNet | CNN supervisada | no disponible | 512 px | no disponible | según pesos base | `timm` |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: la mayoría de proyectos de la competición no publican métricas ni pesos. La ventaja diferencial de este repositorio es la trazabilidad (config, log, métricas y `modeling.py` por variante) y el uso de un backbone DINOv3; su desventaja es la licencia restrictiva y la ausencia de validación clínica.

## Limitaciones y advertencias

- Uso exclusivo en investigación: el autor declara explícitamente que no es un dispositivo médico ni sirve para uso clínico.
- Licencia DINOv3: cualquier publicación que use estos pesos debe acreditar DINOv3; la licencia no es permisiva al estilo Apache o MIT y conviene revisar `LICENSE.md` antes de cualquier uso comercial.
- Los datos de entrenamiento provienen de RSNA bajo los términos MIRA, con licencia solo para investigación; no se distribuyen imágenes, etiquetas ni informes, lo que impide reproducir el entrenamiento sin acceso independiente al dataset.
- Riesgo de alucinación y falsos positivos/negativos: al ser un clasificador probabilístico multi-etiqueta sobre cortes individuales, puede asignar probabilidad alta a hallazgos ausentes y baja a hallazgos presentes; las métricas agregadas de AUC no garantizan calibración por clase.
- Sesgos potenciales desconocidos: no se documenta la demografía, el fabricante de escáner, la intensidad de campo ni la distribución de protocolos del conjunto de entrenamiento, factores que afectan a la generalización.
- Idioma: el modelo es de imagen y solo declara `en`; no procesa informes radiológicos multilingües, a diferencia de los enfoques multimodales del mismo reto.
- Adopción mínima: 0 descargas y 0 *likes* en el momento de la consulta, sin validación independiente por terceros.
- Sin datos publicados sobre cuantización, latencia, throughput ni comportamiento en producción; las estimaciones de hardware de esta ficha son orientativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamounyosef/knee-abnormality-detection-dinov3
- Licencia DINOv3: https://huggingface.co/mamounyosef/knee-abnormality-detection-dinov3/blob/main/LICENSE.md
- Carpeta `dinov3_convnext_base_v5`: https://huggingface.co/mamounyosef/knee-abnormality-detection-dinov3/tree/main/dinov3_convnext_base_v5
- Carpeta `dinov3_convnext_base`: https://huggingface.co/mamounyosef/knee-abnormality-detection-dinov3/tree/main/dinov3_convnext_base
- Repositorio principal del autor: https://huggingface.co/mamounyosef/knee-abnormality-detection
- Código y write-up: https://github.com/mamounyosef/knee-abnormality-detection
- Modelo base en `timm`: https://huggingface.co/timm/convnext_base.dinov3_lvd1689m
- Competición RSNA Knee Abnormality Detection (Kaggle): https://www.kaggle.com/competitions/rsna-knee-abnormality-detection
- Términos de licencia RSNA MIRA: https://www.rsna.org/mira-license
- Anuncio del reto RSNA 2026: https://www.auntminnie.com/imaging-informatics/artificial-intelligence/news/15831808/rsna-launches-2026-knee-abnormality-detection-ai-challenge
- Proyecto relacionado (multimodal): https://github.com/karthik2411/RSNA-Knee-Abnormality-Detection
- Proyecto relacionado (multimodal): https://github.com/KISHORE0709-LEO/RSNA-Knee-Abnormality-Detection
- Descripción del dataset RSNA Knee MRI 2026: https://www.salnus.com/datasets/rsna-knee-mri-2026
- Informe de análisis de ensamblados: https://studylib.net/doc/29038875/notebook-3
