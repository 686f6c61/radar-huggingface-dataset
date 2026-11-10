# rez-zed/roman-coin-vit-v6

## Resumen

Roman-coin-vit-v6 es un modelo de clasificación de imágenes multi-etiqueta especializado en numismática romana y monedas antiguas, desarrollado por el usuario rez-zed y publicado bajo el identificador `rez-zed/roman-coin-vit-v6`. Se trata de un fine-tuning del Vision Transformer `timm/vit_base_patch14_reg4_dinov2.lvd142m`, un ViT-Base con parches de 14x14 y registros de atención, preentrenado con el método DINOv2 sobre el dataset LVD-142M. El modelo resultante cuenta con 117.266.463 parámetros y está orientado a tareas de patrimonio cultural.

El modelo aborda un problema específico y de nicho: la identificación automática de atributos numismáticos (posiblemente emperador, denominación, ceca, tipo de reverso u otras etiquetas múltiples) a partir de fotografías de monedas romanas. La elección de una arquitectura DINOv2 es coherente con este objetivo, ya que estos modelos destacan en tareas de recuperación visual y clasificación con pocos datos etiquetados, un escenario habitual en colecciones arqueológicas y museísticas.

La relevancia actual del modelo es limitada pero clara dentro de su dominio: ofrece una base preentrenada y afinada para digitalización de colecciones, catalogación asistida y proyectos de humanidades digitales. No obstante, su acceso está restringido (gated) y su licencia es propietaria (`rezoin-research-preview`), lo que condiciona su uso en producción. El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 14, 4 registros de atención), base DINOv2 |
| Parámetros totales | 117.266.463 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada basada en `lvd142m`, típicamente 518x518) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (modelo de clasificación visual, sin componente textual) |
| Licencia | `rezoin-research-preview` (licencia personalizada, acceso restringido) |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Modelo base | `timm/vit_base_patch14_reg4_dinov2.lvd142m` |
| Tamaño del repositorio | 0,5 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo ViT-Base con parches de 14x14 píxeles y cuatro tokens de registro de atención (`reg4`), una variante introducida en el trabajo de DINOv2 para mejorar la estabilidad del entrenamiento y la calidad de las representaciones. El modelo parte de los pesos de `timm/vit_base_patch14_reg4_dinov2.lvd142m`, preentrenado de forma autosupervisada con DINOv2 sobre el corpus LVD-142M, y se ha afinado para una tarea de clasificación multi-etiqueta sobre imágenes de monedas romanas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tuning, ni sobre si se emplearon técnicas de aumento de datos, balanceo de clases o regularización específicas. Tampoco se documenta el uso de RLHF, DPO ni otras fases de alineación, algo esperable en un modelo puramente visual y de clasificación. La innovación técnica principal heredada del modelo base son los registros de atención y el preentrenamiento autosupervisado a gran escala, que proporcionan representaciones robustas para dominios con pocos ejemplos etiquetados.

## Capacidades

- Clasificación de imágenes multi-etiqueta orientada a monedas romanas y antiguas.
- Extracción de características visuales de alta calidad gracias al backbone DINOv2, reutilizable para recuperación de imágenes o clustering.
- Identificación de atributos numismáticos múltiples por imagen (el número y la naturaleza exacta de las etiquetas no están documentados).
- Capacidad de transferencia a tareas relacionadas de patrimonio cultural mediante fine-tuning adicional.
- Soporte de tool calling / function calling: no disponible (modelo de visión, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; no procesa texto.
- Capacidades especiales (thinking mode, visión general, audio): únicamente visión para clasificación; sin generación de texto.

## Casos de uso

- Catalogación asistida en museos y colecciones numismáticas: el modelo puede etiquetar automáticamente lotes de fotografías de monedas, reduciendo el tiempo de inventario manual y sirviendo como primera pasada para revisión experta.
- Digitalización de archivos arqueológicos: integrado en un pipeline de procesamiento de imágenes, permite clasificar hallazgos monetarios procedentes de excavaciones y vincularlos a fichas de catálogo existentes.
- Verificación preliminar en subastas y comercio numismático: como filtro inicial para detectar discrepancias entre la descripción de un lote y su imagen, siempre con validación humana posterior.
- Recuperación visual en bases de datos patrimoniales: las representaciones DINOv2 permiten búsquedas por similitud visual entre monedas, útil para detectar duplicados o variantes tipológicas.
- Investigación en humanidades digitales: generación de etiquetas a escala para estudios estadísticos sobre distribución de tipos monetarios, cecas o emisiones.
- Aplicaciones educativas y divulgativas: identificación interactiva de monedas en exposiciones o materiales didácticos, con la correspondiente advertencia sobre la precisión limitada del modelo.
- Preentrenamiento para tareas adyacentes: reutilización del backbone afinado como punto de partida para clasificar sellos, medallas u otros objetos arqueológicos con pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en FP32 para los 117 M de parámetros, más memoria para activaciones según el tamaño de lote y la resolución de entrada (típicamente 518x518 en la variante `lvd142m`).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamaño las consumer GPU son más que adecuadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 4 GB o más; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch con `timm` (carga directa del checkpoint), TorchScript, ONNX Runtime, o integración en servicios de inferencia como TorchServe. No se documenta soporte para vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del tamaño de lote. En una RTX 4090 se espera un throughput alto (cientos de imágenes por segundo) dada la escasa complejidad del modelo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rez-zed/roman-coin-vit-v6 | 117 M | imagen 518x518 (base `lvd142m`) | Clasificación multi-etiqueta de monedas romanas | `rezoin-research-preview` (gated) | Hugging Face, acceso restringido |
| timm/vit_base_patch14_reg4_dinov2.lvd142m | ~86 M (ViT-B DINOv2) | imagen 518x518 | Backbone visual general | Apache 2.0 (según timm) | Hugging Face, abierto |
| google/vit-base-patch16-224 | ~86 M | imagen 224x224 | Clasificación de imágenes general | Apache 2.0 | Hugging Face, abierto |
| openai/clip-vit-base-patch32 | ~151 M | imagen 224x224 + texto | Clasificación zero-shot y recuperación | MIT | Hugging Face, abierto |

La comparación directa con alternativas especializadas en numismática no está disponible, ya que no se han identificado modelos públicos equivalentes en la información proporcionada. El modelo base DINOv2 y los ViT genéricos sirven como referencia de tamaño y arquitectura, pero no de rendimiento en la tarea específica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con imágenes de monedas romanas, puede tener un sesgo hacia determinadas cecas, épocas o calidades fotográficas.
- Riesgo de alucinación: en clasificación multi-etiqueta, el modelo puede asignar etiquetas plausibles pero incorrectas, especialmente en imágenes con iluminación pobre, desgaste o ángulos poco habituales.
- Limitaciones de contexto o idioma: no aplica idioma; la resolución de entrada y el preprocesamiento deben coincidir con los usados en el fine-tuning, no documentados.
- Restricciones de licencia: la licencia `rezoin-research-preview` es propietaria y no está estandarizada; el uso comercial no está garantizado y requiere revisión legal. El acceso es gated, lo que exige aceptar condiciones en Hugging Face.
- Caveats para producción: sin benchmarks publicados, sin documentación de la taxonomía de etiquetas ni del dataset de entrenamiento, y con cero descargas registradas, la madurez del modelo es baja. No se recomienda su uso en producción sin una evaluación independiente sobre un conjunto de validación propio.
- El modelo no genera texto ni soporta interacción conversacional; cualquier caso de uso que requiera explicaciones debe combinarse con otro sistema.

## Enlaces

- Hugging Face: https://huggingface.co/rez-zed/roman-coin-vit-v6
- Modelo base en timm: https://huggingface.co/timm/vit_base_patch14_reg4_dinov2.lvd142m
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- Paper DINOv2: https://arxiv.org/abs/2304.07193
- Repositorio DINOv2: https://github.com/facebookresearch/dinov2
