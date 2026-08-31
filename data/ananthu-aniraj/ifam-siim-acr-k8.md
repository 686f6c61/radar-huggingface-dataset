# ananthu-aniraj/ifam-siim-acr-k8

## Resumen

IFAM (Iterative Focus and Attention Masking) es un framework de vision por computador presentado en el articulo "Two-stage Vision Transformers and Hard Masking offer Robust Object Representations", aceptado como presentacion oral en ICPR 2026. El checkpoint `ifam-siim-acr-k8` es el modelo pre-entrenado sobre el dataset SIIM-ACR Pneumothorax Segmentation, con 8 partes (K=8). El modelo esta desarrollado por Ananthu Aniraj y colaboradores del INRIA, y se distribuye bajo licencia Apache 2.0.

El enfoque IFAM utiliza un Vision Transformer de dos etapas: una primera etapa (Selector) procesa la imagen completa para descubrir las partes relevantes del objeto, y una segunda etapa (Predictor) restringe su campo receptivo a esas regiones mediante enmascaramiento de atencion de entrada, evitando que el fondo espurio influya en la clasificacion. Este diseno mejora la robustez frente a correlaciones espurias y fondos fuera de distribucion, y hace que el razonamiento del modelo sea auditable gracias a las mascaras semanticas explicitas.

El modelo tiene 173,18 millones de parametros y un tamano de repositorio de 0,7 GB. Esta pensado para tareas de clasificacion de imagenes, especificamente en el dominio medico de radiografias de torax, y su relevancia actual radica en la creciente necesidad de modelos de vision robustos y explicables para entornos clinicos y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer de dos etapas (Selector y Predictor) con backbone DINOv2 |
| Parametros totales | 173.184.769 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

IFAM se basa en un Vision Transformer de dos etapas. La primera etapa, denominada Selector, procesa la imagen completa (resolucion de entrada 518x518) para identificar las partes del objeto y las regiones relevantes para la tarea. La segunda etapa, denominada Predictor, recibe la imagen con un enmascaramiento de atencion de entrada que restringe su campo receptivo a las regiones seleccionadas, eliminando informacion de fondo que podria generar correlaciones espurias. El modelo utiliza un backbone DINOv2, como indica la etiqueta `dinov2` en el repositorio.

El entrenamiento se realizo sobre el dataset SIIM-ACR Pneumothorax Segmentation, un conjunto de radiografias de torax etiquetadas para la deteccion de neumotorax. El parametro K=8 indica que el modelo divide la imagen en 8 partes o regiones durante el proceso de seleccion. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO, ya que no se mencionan en la documentacion disponible. La innovacion principal del framework es el enmascaramiento duro (hard masking) aplicado a la atencion, que fuerza al Predictor a ignorar regiones irrelevantes, mejorando la robustez frente a cambios de fondo y distribuciones fuera del conjunto de entrenamiento.

## Capacidades

- Clasificacion de imagenes medicas, especificamente deteccion de neumotorax en radiografias de torax.
- Robustez frente a correlaciones espurias y fondos fuera de distribucion, gracias al enmascaramiento de atencion en la segunda etapa.
- Generacion de mascaras semanticas explicitas que permiten auditar el razonamiento del modelo e intervenir en tiempo de prueba para mejorar la robustez.
- Arquitectura modular de dos etapas que separa la seleccion de regiones de la clasificacion final.
- Integracion con el ecosistema Hugging Face mediante la clase `FullTwoStageModelDoubleClassifyHF`.
- No soporta tool calling, agentes, ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Diagnostico asistido por neumotorax en radiografias de torax: el modelo puede clasificar imagenes de rayos X indicando la presencia de neumotorax, con una robustez mejorada frente a variaciones en el fondo de la imagen, lo que reduce falsos positivos causados por artefactos o diferencias en los equipos de adquisicion.
- Investigacion en robustez de modelos de vision: el framework IFAM permite estudiar como el enmascaramiento de atencion afecta a la generalizacion ante distribuciones fuera del conjunto de entrenamiento, siendo util como referencia en experimentos academicos.
- Desarrollo de sistemas de triaje en entornos clinicos: al ser un modelo ligero (173M parametros), puede desplegarse en servidores hospitalarios para priorizar casos sospechosos de neumotorax antes de la revision radiologica.
- Auditoria de decisiones en IA medica: las mascaras semanticas generadas por el Selector permiten a los radiologos ver que regiones de la imagen influyeron en la clasificacion, facilitando la validacion clinica y la confianza en el sistema.
- Pruebas de intervencion en tiempo de inferencia: gracias a la naturaleza auditable del modelo, se pueden modificar las mascaras en tiempo de ejecucion para explorar como cambia la prediccion, util en entornos de investigacion y depuracion.
- Benchmarking de metodos de robustez: el checkpoint puede servir como baseline en comparativas de tecnicas de enmascaramiento y regularizacion para clasificacion de imagenes, dado que su arquitectura es publica y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K (no aplicables a un modelo de vision), ni resultados especificos sobre el dataset SIIM-ACR (por ejemplo, AUC o sensibilidad). El articulo asociado (arXiv:2506.08915) menciona experimentos extensos, pero los numeros concretos no estan accesibles en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 173M parametros, en precision FP16 el modelo ocupa aproximadamente 346 MB de memoria, y en FP32 unos 692 MB. A esto hay que sumar la memoria para las activaciones y las mascaras intermedias, por lo que se estima un consumo total de entre 1 y 2 GB en inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. Para entrenamiento o fine-tuning se recomienda una GPU con 8 GB o mas, como RTX 3070, RTX 4080 o A100.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo medio (RTX 3060, RTX 4060) gracias a su tamano moderado.
- Opciones de despliegue: al ser un modelo de PyTorch con safetensors, puede desplegarse con TorchServe, FastAPI, o mediante el ecosistema Hug Face Transformers. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que estos estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no hay datos oficiales. En una GPU moderna (por ejemplo, RTX 3090), una inferencia sobre una imagen de 518x518 deberia completarse en decenas de milisegundos, pero no se puede dar una cifra exacta sin pruebas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de clasificacion de imagenes medicas. El modelo se basa en DINOv2, por lo que podria compararse con otros fine-tunings de DINOv2 sobre el mismo dataset, pero no hay datos publicos en la informacion proporcionada. Alternativas genericas de clasificacion de imagenes como ResNet o EfficientNet no son directamente comparables por su arquitectura y enfoque. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en el dataset SIIM-ACR Pneumothorax, por lo que su capacidad de generalizacion a otros tipos de radiografias o a otras patologias no esta garantizada.
- No se han publicado metricas de rendimiento detalladas, lo que dificulta evaluar su precision real en entornos clinicos.
- La arquitectura de dos etapas con enmascaramiento duro puede perder informacion relevante si el Selector falla en identificar las regiones correctas, lo que podria degradar el rendimiento en imagenes con presentaciones atipicas.
- No hay informacion sobre sesgos demograficos o de equipos de adquisicion; el modelo podria tener un rendimiento desigual en poblaciones no representadas en el dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el modelo con datos locales antes de su despliegue en produccion.
- El modelo no soporta otros idiomas ni texto, al ser exclusivamente de vision.

## Enlaces

- [Hugging Face - ananthu-aniraj/ifam-siim-acr-k8](https://huggingface.co/ananthu-aniraj/ifam-siim-acr-k8)
- [Articulo en arXiv - 2506.08915](https://arxiv.org/abs/2506.08915)
- [Repositorio GitHub - ananthu-aniraj/ifam](https://github.com/ananthu-aniraj/ifam)
- [Pagina personal del autor](https://ananthu-aniraj.github.io/)
