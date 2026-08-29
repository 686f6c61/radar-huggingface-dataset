# RiverRider/srt-cxr14-linear-probe

## Resumen

`srt-cxr14-linear-probe` es un clasificador lineal de 344 KB (75.278 parámetros entrenables) que se ajusta sobre las características congeladas (hidden states) del modelo multimodal `google/gemma-4-31B-it` para detectar 14 patologías torácicas en radiografías de tórax del dataset NIH ChestX-ray14. El backbone no se entrena: la sonda es una única capa lineal `Linear(5376, 14)` que toma el vector mean-pooled de la última capa del modelo base y produce probabilidades por cada hallazgo. El autor, RiverRider, lo presenta como parte del programa SRT (Space-Bacon Representation Testing) y demuestra que una sonda lineal con 75K parámetros supera a un ResNet-50 fine-tuned de 25M parámetros (0.7590 vs 0.7451 de AUROC medio) en el split oficial del dataset.

La relevancia de este modelo es doble: por un lado, sirve como benchmark de la calidad de las representaciones aprendidas por un modelo multimodal de propósito general (Gemma 4) en dominios especializados como la radiología; por otro, muestra que la evaluación de representaciones congeladas puede ser extremadamente económica (48 segundos en CPU) y reproducible, sin necesidad de ajustar el backbone. No es un modelo de diagnóstico clínico, sino un artefacto de investigación para medir la transferibilidad de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (regresion logistica multietiqueta) sobre hidden states de un transformer multimodal (gemma-4-31B-it) |
| Parametros totales | 75.278 (sonda); backbone congelado: 31B (no entrenable) |
| Parametros activos | 75.278 (solo la sonda) |
| Longitud de contexto | No aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | No disponible (checkpoint en formato .pt de 344 KB) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Apache-2.0 (sonda); backbone sujeto a la licencia de Gemma (Google) |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

La sonda es una capa lineal `Linear(5376, 14)` que recibe un vector de características mean-pooled extraído de la capa oculta del modelo `google/gemma-4-31B-it`. El backbone se mantiene completamente congelado: no hay fine-tuning, ni preentrenamiento radiológico, ni aumento de datos. El proceso de entrenamiento consiste en normalizar las características con la media y desviación estándar calculadas sobre el split de entrenamiento, y luego ajustar la matriz de pesos y el sesgo mediante regresión logística binaria para cada una de las 14 etiquetas. El autor indica que el ajuste completo tarda 48 segundos en un MacBook con CPU, lo que subraya la ligereza del método.

El dataset de entrenamiento es NIH ChestX-ray14, con 112.120 imágenes y etiquetas minadas por NLP de informes radiológicos. Se utiliza el split oficial `test_list.txt` para evaluar, y las características precomputadas para todas las imágenes se publican en el dataset `RiverRider/srt-cxr14-frozen-probe`. No se aplica ninguna técnica de regularización adicional más allá de la normalización. La elección de una sonda lineal es deliberada: cualquier clasificador más potente empezaría a medir la capacidad del propio clasificador en lugar de la calidad de la representación subyacente.

## Capacidades

- Clasificacion multietiqueta de 14 hallazgos toracicos en radiografias de torax: atelectasia, cardiomegalia, efusion, infiltracion, masa, nodulo, neumonia, neumotorax, consolidacion, edema, enfisema, fibrosis, hernia y engrosamiento pleural.
- Deteccion de patologias visibles en la imagen (no deteccion temprana de enfermedades).
- Inferencia extremadamente ligera una vez extraidas las caracteristicas (una multiplicacion matricial de 5376x14).
- Reproducibilidad total: el checkpoint incluye la media y desviacion del split de entrenamiento, y el codigo de ajuste esta publicado.
- No soporta tool calling, generacion de texto, ni capacidades de agente; es un clasificador puro.

## Casos de uso

- Evaluacion de representaciones congeladas: sirve como sonda estandar para medir la calidad de las caracteristicas de `gemma-4-31B-it` en el dominio medico, comparando con otros backbones mediante el mismo protocolo.
- Triaje automatico de radiografias de torax: en un flujo de trabajo hospitalario, las imagenes se codifican una vez con el backbone y la sonda proporciona probabilidades por patologia, permitiendo priorizar casos urgentes (neumotorax, edema) antes de la lectura del radiologo.
- Investigacion en transferencia de aprendizaje: permite estudiar como se organizan las representaciones de un modelo multimodal generalista en dominios especializados, sin el coste computacional de un fine-tuning completo.
- Baseline para futuros modelos: al ser un protocolo simple y rapido de entrenar, sirve como referencia para comparar nuevas arquitecturas o tecnicas de extraccion de caracteristicas en ChestX-ray14.
- Ensenanza y demostracion de conceptos: ideal para ilustrar el concepto de linear probing en vision por computador, dado su bajo coste y su rendimiento sorprendentemente competitivo.
- Auditoria de sesgos de representacion: la comparacion con el baseline de view-position (solo orientacion de la imagen) permite detectar atajos no deseados en el backbone.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (split oficial de NIH ChestX-ray14, 25.596 imagenes de test):

| Modelo | Mean AUROC | Parametros entrenables |
|---|---:|---:|
| Wang et al. 2017 (ResNet-50 fine-tuned) | 0.7451 | ~25 M |
| **srt-cxr14-linear-probe** | **0.7590** | **75.278** |
| View-position only (baseline atajo) | 0.5827 | - |
| Shuffled labels (suelo de referencia) | 0.5002 | - |

Desglose por hallazgo (AUROC con intervalo de confianza del 95% por bootstrap a nivel de paciente):

| Hallazgo | AUROC | IC 95% |
|---|---:|---:|
| Enfisema | 0.8650 | [0.849, 0.880] |
| Neumotorax | 0.8465 | [0.832, 0.859] |
| Cardiomegalia | 0.8221 | [0.798, 0.844] |
| Edema | 0.8170 | [0.798, 0.837] |
| Efusion | 0.7849 | [0.773, 0.796] |
| Hernia | 0.7828 | [0.692, 0.869] |
| Fibrosis | 0.7538 | [0.726, 0.781] |
| Masa | 0.7423 | [0.718, 0.766] |
| Engrosamiento pleural | 0.7347 | [0.714, 0.754] |
| Atelectasia | 0.7248 | [0.710, 0.738] |
| Consolidacion | 0.7107 | [0.695, 0.727] |
| Nodulo | 0.6956 | [0.674, 0.715] |
| Infiltracion | 0.6862 | [0.674, 0.696] |
| Neumonia | 0.6600 | [0.637, 0.686] |

El autor advierte explicitamente que no se debe comparar este resultado con el 0.8414 de CheXNet, ya que CheXNet utiliza un split aleatorio propio, no el split oficial. La unica comparacion valida es con modelos evaluados en el mismo `test_list.txt`.

## Requisitos de hardware

- Inferencia de la sonda sola: cualquier CPU (menos de 1 MB de RAM, una multiplicacion matricial de 5376x14).
- Extraccion de caracteristicas con el backbone `gemma-4-31B-it`: requiere una GPU con al menos 60-80 GB de VRAM en precision completa (fp16) para los 31B parametros. GPUs recomendadas: A100 80GB, H100 80GB o similares. En cuantizacion 4-bit podria caber en una RTX 4090 (24GB), pero el autor no ha publicado configuraciones de cuantizacion para el backbone.
- Entrenamiento de la sonda: solo CPU (48 segundos en un MacBook) si se usan las caracteristicas precomputadas publicadas.
- Opciones de despliegue: para uso en produccion se necesitaria servir el backbone (con vLLM, TGI o similar) y luego aplicar la sonda; alternativamente, se pueden precomputar las caracteristicas de todas las imagenes y almacenarlas, evitando ejecutar el backbone en tiempo real.
- Latencia: la sonda anade microsegundos; el cuello de botella es la extraccion de caracteristicas, que depende del backbone (del orden de decenas de milisegundos por imagen en GPU de alta gama).

## Comparativa con modelos similares

No hay muchos modelos publicados que utilicen exactamente el mismo protocolo (linear probe sobre características congeladas de un LLM multimodal en ChestX-ray14). La comparación más directa es con el fine-tuning clásico:

| Modelo | Enfoque | Mean AUROC (split oficial) | Parametros entrenables | Licencia |
|---|---|---|---|---|
| Wang et al. 2017 | ResNet-50 fine-tuned end-to-end | 0.7451 | ~25 M | No especificada |
| **srt-cxr14-linear-probe** | Linear probe sobre gemma-4-31B-it congelado | 0.7590 | 75.278 | Apache-2.0 |
| View-position only | Baseline de atajo (solo orientacion) | 0.5827 | - | - |

No se dispone de resultados de otros modelos (p. ej., CheXNet, DenseNet-121) en el mismo split oficial, por lo que no es posible una comparativa más amplia sin arriesgarse a comparar datos no comparables.

## Limitaciones y advertencias

- No es un dispositivo diagnostico: no tiene validacion clinica, evaluacion prospectiva ni aprobacion regulatoria.
- Las etiquetas del dataset estan minadas por NLP de informes radiologicos, por lo que el rendimiento esta limitado por la calidad de esas etiquetas.
- Detecta hallazgos visibles en la imagen, no predice evolucion ni riesgo futuro de enfermedad.
- El modelo depende completamente de las caracteristicas del backbone `gemma-4-31B-it`; si se aplica a otros backbones o a características sin la normalizacion adecuada (mu/sd incluida en el checkpoint), los resultados no son validos.
- No se han publicado estudios sobre sesgos demograficos (edad, sexo, origen etnico) ni sobre distribuciones de datos fuera del dominio de NIH ChestX-ray14.
- El backbone `gemma-4-31B-it` tiene su propia licencia (Gemma Terms of Use), que puede restringir ciertos usos comerciales; la sonda en si es Apache-2.0, pero el uso del sistema completo requiere cumplir la licencia del backbone.
- La reproducibilidad esta garantizada solo si se utilizan las caracteristicas precomputadas publicadas; extraer nuevas caracteristicas requiere acceso al backbone y a los recursos computacionales adecuados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RiverRider/srt-cxr14-linear-probe
- Dataset con caracteristicas precomputadas y script de ajuste: https://huggingface.co/datasets/RiverRider/srt-cxr14-frozen-probe
- Repositorio del programa SRT: https://huggingface.co/RiverRider/SRT (y https://github.com/space-bacon/SRT)
- Paper relacionado sobre probes en radiografias de torax: https://arxiv.org/abs/2608.12086
- Notebook de referencia de Google Health para clasificacion eficiente en ChestX-ray14: https://colab.research.google.com/github/google-health/cxr-foundation/blob/master/notebooks/train_data_efficient_classifier.ipynb
