# ducln-business/document-stamp-segmentation-v20-20261012-dev

## Resumen

El modelo `document-stamp-segmentation-v20-20261012-dev` es un modelo de segmentación de imágenes especializado en la detección y segmentación de sellos redondos y estampillas dentro de documentos digitalizados. Lo desarrolla el usuario de HuggingFace `ducln-business` (Duc Le) y se distribuye como un ajuste fino (finetune) del modelo `ZhengPeng7/BiRefNet`, una arquitectura de segmentación dicotómica de alta resolución. La versión etiquetada como `20261012-dev` sugiere un estado de desarrollo y una fecha de construcción interna asociada al repositorio.

El problema que resuelve es concreto: en flujos de digitalización documental (seguros, banca, administración pública), los documentos escaneados contienen sellos, timbres y marcas circulares que deben localizarse y aislarse de forma automática. La segmentación precisa de estos elementos permite su posterior extracción, indexación, verificación de autenticidad o eliminación selectiva, tareas donde las técnicas clásicas de visión por computador fallan por la variabilidad de formas, colores y calidades de escaneo.

El modelo es relevante por su especialización de dominio: parte de un backbone de segmentación generalista de alta resolución (BiRefNet) y lo adapta a una tarea estrecha con una huella de almacenamiento de 0,9 GB. El acceso está restringido (gated) en HuggingFace, por lo que su uso requiere aceptar las condiciones del repositorio. No se dispone de datos públicos sobre licencia, idiomas soportados, número de parámetros ni composición del dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en BiRefNet (segmentación de imagen, backbone tipo Swin Transformer con módulos de referencia bilateral); detalle exacto no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen); no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (pesos safetensors/bin según repositorio); tamaño del repo 0,9 GB |
| Tarea (pipeline) | image-segmentation |
| Modelo base | ZhengPeng7/BiRefNet (finetune) |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

El modelo parte de `ZhengPeng7/BiRefNet`, un segmentador de imagen dicotómica de alta resolución. BiRefNet se caracteriza por un diseño de "referencia bilateral" que combina una rama de referencia global con una rama de referencia local para refinar los bordes y las regiones finas de la segmentación, lo que resulta especialmente útil en objetos con contornos delicados como sellos, firmas o timbres. Habitualmente emplea un backbone tipo Swin Transformer, aunque el detalle exacto de la configuración usada en este finetune no está documentado en la información disponible.

No se dispone de información sobre el dataset de ajuste (número de imágenes, composición, procedencia de los documentos), ni sobre si se aplicaron técnicas de aumento de datos, curriculum learning o ajuste de la función de pérdida específicas para sellos redondos. Tampoco hay datos sobre el número de tokens o iteraciones de entrenamiento, ni sobre si se aplicaron etapas de RLHF/DPO (no aplicables en un modelo de segmentación). El nombre de la versión (`v20-20261012-dev`) apunta a un ciclo de iteración interno, pero no se publican detalles técnicos del mismo.

## Capacidades

- Segmentación de sellos redondos y estampillas en documentos escaneados: genera máscaras de segmentación binarias o de probabilidad sobre la región del sello.
- Análisis documental: procesamiento de imágenes de documentos completos para localizar elementos gráficos superpuestos al texto.
- Detección de sellos con formas variadas y calidades de escaneo heterogéneas, aprovechando el diseño de referencia bilateral de BiRefNet.
- Integración en pipelines de segmentación de imagen estándar de `transformers`/PyTorch para tareas de `image-segmentation`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que es un modelo puramente de visión.

## Casos de uso

- Digitalización de documentos en seguros: segmentar automáticamente los sellos de las pólizas y siniestros escaneados para verificar que la documentación ha sido sellada y validar la fecha o dependencia emisora.
- Verificación de autenticidad documental: aislar el sello para compararlo contra plantillas oficiales o analizar su integridad mediante análisis forense de imagen.
- Limpieza de documentos para OCR: detectar y enmascarar sellos que se superponen al texto antes de enviar la imagen a un motor de reconocimiento óptico de caracteres, reduciendo errores de lectura.
- Archivado e indexación: generar metadatos de presencia y posición del sello para clasificar documentos en sistemas de gestión documental.
- Tramitación administrativa automatizada: localizar timbres oficiales en expedientes escaneados para validar la cadena de sellado en procesos de administración pública.
- Preprocesado en banca: segmentar sellos en contratos, avales y escrituras para su extracción y almacenamiento estructurado, separándolos del texto y la firma.
- Investigación en visión por computador: servir como punto de partida (finetune) para tareas relacionadas de segmentación de elementos documentales, reutilizando el ajuste sobre BiRefNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,9 GB, por lo que los pesos en precisión nativa o FP16 pueden caber en GPUs de gama media-alta. Una estimación orientativa para un backbone de segmentación de alta resolución basado en Swin Transformer ronda los 4-8 GB de VRAM en FP16, pero no está confirmada por el autor.
- GPU recomendadas: no disponible de forma oficial. Por la naturaleza de BiRefNet, se recomienda una GPU con al menos 8-12 GB de VRAM (RTX 3060/4070, RTX 4090, A100, H100) para procesar imágenes de alta resolución con resolución interna elevada.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8 GB o más (RTX 3070/4060 Ti y superiores), a falta de confirmación del autor.
- Opciones de despliegue: PyTorch nativo; compatible con frameworks de inferencia de `transformers`. No se documenta soporte de vLLM (no aplica), llama.cpp/Ollama (orientados a LLM) ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| document-stamp-segmentation-v20-20261012-dev | Segmentación de sellos | BiRefNet | no disponible | no disponible | Gated en HuggingFace |
| ZhengPeng7/BiRefNet | Segmentación dicotómica de alta resolución | Propio (Swin) | Alta resolución | Consultar repositorio | Público en HuggingFace |
| ducln-business/document-signature-stamp-detector-v20-20261012-dev | Detección de firmas y sellos | no disponible | no disponible | no disponible | HuggingFace |
| DALAI-project/Document_segmentation | Segmentación documental (texto mecanografiado/manuscrito) | no disponible | no disponible | Consultar repositorio | GitHub |

No se han encontrado comparativas de rendimiento cuantitativas entre este modelo y alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar los términos del repositorio antes de integrarlo en producción.
- Acceso restringido (gated): requiere solicitar y aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la automatización de despliegues.
- Modelo en estado `dev`: la etiqueta de desarrollo sugiere que puede no ser una versión estable; conviene validar el comportamiento en un conjunto propio antes de usarlo.
- Datos de entrenamiento no documentados: se desconoce la composición del dataset, lo que impide evaluar posibles sesgos de dominio (tipos de documentos, idiomas, calidades de escaneo, colores de sello).
- Riesgo de falsos positivos y negativos en sellos con baja calidad, manchas, sellos superpuestos o estilos no vistos en el ajuste.
- No apto para tareas fuera de la segmentación documental: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Al ser un modelo de imagen, las consideraciones de idioma y contexto de texto no aplican, pero puede degradarse con documentos girados, escaneos de baja resolución o marcas de agua que imiten sellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ducln-business/document-stamp-segmentation-v20-20261012-dev
- Modelo base BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Perfil del autor: https://huggingface.co/ducln-business
- Modelo relacionado (detector de firma y sello): https://huggingface.co/ducln-business/document-signature-stamp-detector-v20-20261012-dev
- Repositorio de referencia sobre segmentación de sellos: https://github.com/ShaileshDhama/Segmentation-of-Stamps-in-Documents
- Segmentación documental con deep learning (Python/TensorFlow, TDS): https://learnopencv.com/deep-learning-based-document-segmentation-using-semantic-segmentation-deeplabv3-on-custom-dataset/
- Repositorio DALAI-project/Document_segmentation: https://github.com/DALAI-project/Document_segmentation
