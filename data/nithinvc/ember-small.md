# nithinvc/EMber-small

## Resumen

EMber-small es un vision transformer preentrenado para extraer representaciones de imágenes de partículas de crio-microscopía electrónica de partícula única (single-particle cryo-EM). Lo desarrolla un equipo académico liderado por Nithin Chalapathi (Universidad de California, Berkeley) junto con Theo Sternlieb, Ethan Han, Sonya M. Hanson, Pilar Cossio, Aditi S. Krishnapriyan y Ritwik Gupta, y se publica bajo el identificador `nithinvc/EMber-small` en HuggingFace dentro de la familia de modelos EMber.

El modelo aborda un problema recurrente en el pipeline de cryo-EM: obtener descriptores genéricos y reutilizables de partículas individuales sin depender de etiquetas ni de reconstrucciones previas. Dada una imagen de partícula, EMber devuelve un embedding global de imagen y un mapa de características espaciales por parches de 16x16 píxeles, pensados para tareas posteriores de análisis (agrupamiento, clasificación, búsqueda por similitud, estudio de heterogeneidad conformacional). La relevancia actual reside en que se entrena de forma auto-supervisada con 50 millones de imágenes experimentales reales procedentes de 214 conjuntos de datos EMPIAR, más proyecciones simuladas de 268.000 ensamblados moleculares, una escala de datos difícil de igualar en este dominio.

Con 21,4 millones de parámetros, EMber-small es la variante compacta de la familia: cabe holgadamente en cualquier GPU de consumo y puede ejecutarse en CPU para lotes moderados. La model card no documenta sin embargo resultados de benchmarks, licencia, resolución de entrada ni idiomas, lo que limita su evaluación formal para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) preentrenado por auto-destilación (self-distillation) |
| Parámetros totales | 21.397.648 (21,4 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin entrada de texto); tamaño de parche 16x16. Resolución de entrada no disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de visión, no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,1 GB) |

## Arquitectura y entrenamiento

EMber-small es un transformer de visión con parches de 16x16 píxeles que sigue un esquema de auto-destilación (aprendizaje auto-supervisado con una red profesora y una estudiante, en la línea de DINO). El objetivo declarado del trabajo es aprender la estructura latente compartida de los problemas inversos de cryo-EM, de modo que un único espacio de representaciones sirva para múltiples tareas downstream en lugar de entrenar una red específica por tarea. El modelo produce dos salidas: un embedding a nivel de imagen (token global agregado) y características espaciales por parche, lo que permite tanto comparaciones globales entre partículas como análisis localizados de regiones de la imagen.

El corpus de entrenamiento combina 50 millones de imágenes experimentales de partículas provenientes de 214 conjuntos de datos de EMPIAR con proyecciones simuladas generadas a partir de 268.000 ensamblados moleculares. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, el uso de RLHF/DPO (no procede en un modelo de representación visual) ni hiperparámetros de entrenamiento. Tampoco se detallan innovaciones de eficiencia como atención lineal o decodificación especulativa. El preprint asociado (arXiv:2610.22523) y el repositorio de código son las fuentes indicadas por los autores para obtener esos detalles.

## Capacidades

- Extracción de embeddings globales a nivel de imagen de partículas de cryo-EM, aptos para similitud, agrupamiento y clasificación.
- Extracción de características espaciales por parche (mapa de rasgos con parches de 16x16 píxeles), útil para localizar regiones relevantes dentro de la partícula.
- Representaciones genéricas reutilizables en múltiples tareas downstream sin reentrenamiento desde cero (transferencia de características).
- Preentrenamiento sobre datos experimentales reales (EMPIAR) además de simulaciones, lo que expone al modelo a la distribución de ruido y artefactos típica de datos reales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta capacidades multilingües ni procesamiento de texto.
- No es un modelo de visión-lenguaje: no genera descripciones, respuestas ni texto de ningún tipo.
- No se documentan modos especiales (thinking, audio, vídeo) en la información disponible.

## Casos de uso

- Agrupamiento y clasificación 2D de partículas: extraer el embedding global de cada imagen y aplicar k-means o HDBSCAN para separar vistas, conformaciones o clases de ruido antes de la reconstrucción 3D. El modelo es adecuado porque produce un descriptor compacto y comparativo por partícula sin necesidad de etiquetas.
- Búsqueda por similitud sobre grandes datasets (por ejemplo, EMPIAR): indexar millones de embeddings con FAISS y recuperar partículas parecidas a una consulta para inspección manual o aumento de datos selectivo.
- Selección activa de vistas raras: identificar mediante vecinos más cercanos las partículas atípicas o infrarepresentadas de un conjunto, priorizando su análisis y reduciendo el coste de anotación humana.
- Control de calidad y cribado: usar las características por parche para detectar agregados, hielo cristalino o regiones defectuosas dentro de la imagen, aprovechando la granularidad espacial de 16x16 píxeles.
- Transferencia a tareas con pocas etiquetas: congelar el backbone y entrenar una cabeza ligera para clasificación de estados conformacionales, estimación de pose gruesa o distinción partícula/artefacto, con un coste de entrenamiento muy bajo (21,4 M de parámetros).
- Análisis de heterogeneidad conformacional: proyectar los embeddings con UMAP o t-SNE para visualizar el paisaje conformacional de la muestra y guiar la separación de estados en el refinamiento 3D.
- Condicionamiento de modelos generativos o de reconstrucción: emplear los embeddings como entrada auxiliar en modelos de denoising, generación de proyecciones o inicialización de algoritmos de reconstrucción.
- Procesamiento por lotes a gran escala: al ser un modelo pequeño, permite extraer características de millones de partículas en una sola GPU de consumo o incluso en CPU para volúmenes moderados.

Nota: la model card solo confirma la generación de embeddings y características por parche; los usos anteriores se derivan del tipo de representación y no están validados explícitamente por los autores en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas de tareas downstream (por ejemplo, precisión de clasificación 2D, Recall@k en recuperación de vistas o calidad de reconstrucción tras el agrupamiento), por lo que no es posible presentar cifras verificables ni comparar cuantitativamente con alternativas. Se recomienda consultar el preprint arXiv:2610.22523 para obtener las evaluaciones que los autores hayan incluido.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~82 MB en FP32, ~41 MB en FP16/BF16 y ~20 MB en INT8. El consumo real depende de la resolución de entrada y del tamaño de lote, que no se documentan.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto en datasets de millones de partículas conviene una RTX 4090, L4, A10, A100 o H100, aunque el modelo está muy sobredimensionado para estas dos últimas.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.), y en CPU para lotes pequeños o medios.
- Opciones de despliegue: la librería indicada es `EMber` (con `model_hub_mixin` / `pytorch_model_hub_mixin`), es decir, carga vía PyTorch desde el Hub. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje. La exportación a ONNX o TorchScript no está documentada.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo por imagen ni de partículas por segundo.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para EMber-small frente a alternativas del mismo dominio. La siguiente tabla recoge únicamente datos estructurales de referencia de modelos genéricos de tamaño comparable; las cifras de los competidores provienen de documentación pública y deben verificarse en sus repositorios.

| Modelo | Parámetros | Parche | Dominio | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| EMber-small | 21,4 M | 16x16 | Cryo-EM (partículas) | No disponible | No disponible |
| ViT-S/16 (ImageNet) | ~22 M | 16x16 | Imágenes naturales | Apache 2.0 (según repositorio público) | No comparable directamente (dominio distinto) |
| DINOv2 ViT-S/14 | ~21 M | 14x14 | Imágenes naturales (auto-supervisado) | Apache 2.0 (según repositorio público) | No comparable directamente (dominio distinto) |
| CLIP ViT-B/32 | ~88 M | 32x32 | Imagen-texto | MIT (según repositorio público) | No comparable (multimodal, sin texto en EMber) |

La comparación cuantitativa en tareas de cryo-EM (agrupamiento 2D, recuperación de vistas, detección de heterogeneidad) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no se puede asumir permiso para uso comercial, redistribución o modificación. Es un bloqueante para producción hasta que el autor la declare.
- Ausencia total de benchmarks: no hay evidencia publicada en la model card sobre la calidad de los embeddings en tareas downstream, lo que impide estimar su rendimiento frente a alternativas.
- Modelo muy reciente y sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Especialización estrecha: entrenado para imágenes de partículas de cryo-EM de partícula única; se desconoce su comportamiento en tomografía electrónica (cryo-ET), micrografías completas, microscopía celular u otras modalidades, donde es probable un desplazamiento de dominio.
- Dependencia del preprocesado: el pipeline de normalización, recorte y escalado de las imágenes no se documenta; usar una preparación distinta a la del entrenamiento puede degradar gravemente las representaciones.
- Resolución de entrada no documentada: no se indica el tamaño de imagen esperado más allá del parche de 16x16, lo que complica reproducir el ajuste exacto de inferencia.
- Capacidad limitada por tamaño: con 21,4 M de parámetros, la variante small puede quedarse corta en tareas de alta granularidad (por ejemplo, distinciones conformacionales finas) frente a variantes mayores de la familia.
- Riesgo de sesgo de dataset: el entrenamiento se apoya en 214 conjuntos de EMPIAR, que no cubren de forma uniforme todas las familias de macromoléculas, tipos de detector, voltajes o niveles de señal-ruido; las especies moleculares poco representadas pueden recibir peores embeddings.
- No aplica el riesgo de alucinación textual, pero sí el riesgo de embeddings engañosos: distancias coseno pequeñas no garantizan similitud biológica real.
- Ausencia de idiomas y de texto: cualquier caso de uso que requiera lenguaje natural queda fuera del alcance del modelo.
- Fechas y metadatos llamativos: el repositorio figura creado en 2026-10-21 y el preprint con identificador arXiv:2610.22523; conviene verificar la vigencia de ambos enlaces antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nithinvc/EMber-small
- Preprint (arXiv): https://arxiv.org/abs/2610.22523
- Código fuente: https://github.com/nithinvc/EMber
- Web de Nithin Chalapathi: https://nithinvc.github.io/
- Web de Theo Sternlieb: https://www.theosternlieb.com/
- Web de Sonya M. Hanson: https://sonyahanson.github.io/
- Web de Pilar Cossio: https://pilarcossio.org/
- Web de Aditi S. Krishnapriyan: https://a1k12.github.io/
- Web de Ritwik Gupta: https://ritwikgupta.me/
- EMPIAR (origen de los datos experimentales): https://www.ebi.ac.uk/empiar/
