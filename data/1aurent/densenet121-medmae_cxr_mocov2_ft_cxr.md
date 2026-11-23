# 1aurent/densenet121.medmae_CXR_mocov2_ft_CXR

## Resumen

DenseNet-121 preentrenado con estrategias de aprendizaje autosupervisado sobre radiografias de torax (CXR) y afinado para clasificacion de imagenes medicas. Lo desarrolla el usuario de Hugging Face 1aurent y se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors compatibles con la libreria `timm`.

El modelo parte de la arquitectura convolucional DenseNet-121 (7.051.854 parametros) y aplica una cadena de preentrenamiento especifica del dominio radiologico: MedMAE (masked autoencoding adaptado a imagenes medicas) seguido de MoCo v2 (aprendizaje contrastivo) y finalmente un ajuste fino supervisado sobre el dataset CXR. El identificador del modelo refleja esa secuencia: `medmae_CXR_mocov2_ft_CXR`.

Su relevancia radica en que ofrece un backbone ligero y de baja huella computacional, ya adaptado al dominio de radiografia de torax, lo que reduce la necesidad de entrenar desde cero en tareas de clasificacion de patologia pulmonar. Es un modelo de nicho, con 42 descargas y sin likes, orientado a experimentacion e investigacion mas que a produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN con conexiones densas) |
| Parametros totales | 7.051.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagen, sin salida textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DenseNet-121, una red neuronal convolucional en la que cada capa recibe como entrada las salidas de todas las capas anteriores mediante conexiones densas, lo que favorece la reutilizacion de caracteristicas y reduce el numero de parametros respecto a alternativas de profundidad comparable. El modelo se carga a traves de `timm` (`image-classification`) y expone 7.051.854 parametros, coherente con la variante DenseNet-121.

El entrenamiento sigue una cadena de tres etapas segun el nombre del modelo: preentrenamiento con MedMAE (masked autoencoding sobre imagenes medicas, reconstruyendo parches enmascarados), preentrenamiento contrastivo con MoCo v2 sobre radiografias de torax (CXR) y ajuste fino supervisado final sobre el mismo dominio CXR. La model card publicada no detalla el numero de tokens/imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como RLHF/DPO (no aplicables a clasificacion de imagen). Toda esa informacion figura como no disponible.

## Capacidades

- Clasificacion de imagenes de radiografia de torax (pipeline `image-classification`).
- Extraccion de caracteristicas visuales mediante un backbone convolucional preentrenado en dominio medico.
- Ajuste fino (fine-tuning) sobre tareas de clasificacion de patologia pulmonar u otras etiquetas derivadas de CXR.
- Inferencia sobre imagenes individuales mediante la API de `timm`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision multimodal generativa, audio ni salidas en lenguaje natural.

## Casos de uso

- Clasificacion de radiografias de torax en investigacion clinica: usar el modelo como clasificador directo o como inicializacion para etiquetas de patologia (por ejemplo, presencia/ausencia de hallazgos) aprovechando el preentrenamiento en dominio CXR.
- Prototipado rapido de pipelines de diagnostico asistido: al tener solo 7 millones de parametros, se puede ejecutar en CPU o GPU de gama baja para validar ideas antes de escalar a modelos mayores.
- Extraccion de embeddings para busqueda de imagenes medicas similares: el backbone DenseNet-121 puede emplearse como extractor de caracteristicas y combinarse con indices vectoriales para recuperacion de casos.
- Ajuste fino con pocos datos: el preentrenamiento MedMAE + MoCo v2 sobre CXR sirve como punto de partida cuando el dataset etiquetado propio es reducido.
- Docencia y experimentacion en aprendizaje autosupervisado medico: el modelo ilustra una cadena completa MAE → contrastivo → fine-tuning sobre un dominio concreto.
- Baseline en competiciones o estudios comparativos de clasificacion de CXR: su tamano reducido permite entrenar y evaluar rapidamente multiples configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para un lote pequeno, dado el tamano de 7,05 millones de parametros; en FP16 la huella es aun menor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `timm` (carga nativa), PyTorch, exportacion a ONNX o TorchScript para servir en produccion; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/densenet121.medmae_CXR_mocov2_ft_CXR | 7.051.854 | no aplica | Radiografia de torax | Apache 2.0 | Hugging Face |
| DenseNet-121 estandar (ImageNet) | ~7-8 M | no aplica | Vision general | variable | Amplia |
| ResNet-50 (ImageNet) | ~25 M | no aplica | Vision general | variable | Amplia |
| Otros backbones CXR en Hugging Face | no disponible | no aplica | Radiografia de torax | variable | Hugging Face |

La comparativa detallada con alternativas especificas de dominio CXR no esta disponible en la informacion proporcionada; los datos de parametros de los modelos de referencia son aproximados y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo de nicho con muy baja adopcion (42 descargas, 0 likes), sin validacion externa documentada.
- No se especifican los datos de entrenamiento ni las metricas de evaluacion, lo que impide evaluar sesgos de dataset (por ejemplo, desbalance de clases o sesgos demograficos en radiografias).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos/negativos en clasificacion clinica.
- No debe usarse como herramienta de diagnostico medico sin validacion clinica independiente y supervision profesional.
- No soporta otros idiomas ni modalidades distintas de la imagen; no hay capacidades multimodales.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento puede plantear dudas sobre la procedencia de los datos.
- La model card publicada es practicamente vacia; la informacion sobre preprocesado, resolucion de entrada y etiquetas de salida no esta disponible.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/densenet121.medmae_CXR_mocov2_ft_CXR
- Libreria timm: https://github.com/huggingface/pytorch-image-models
- Paper DenseNet: https://arxiv.org/abs/1608.06993
- Paper MoCo v2: https://arxiv.org/abs/2003.04297
- Paper MAE: https://arxiv.org/abs/2111.06377
