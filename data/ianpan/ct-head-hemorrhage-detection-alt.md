# ianpan/ct-head-hemorrhage-detection-alt

## Resumen

El modelo `ianpan/ct-head-hemorrhage-detection-alt` es un conjunto (ensemble) de tres clasificadores de imagen de tipo stride-16 entrenados para la deteccion de hemorragia intracraneal (ICH, por sus siglas en ingles) en tomografias computarizadas (TC) de craneo. Lo desarrolla el usuario de Hugging Face `ianpan` y se distribuye como una release de pesos inmutables bajo licencia Apache 2.0. El pipeline declarado es `image-classification`, aunque el paquete incluye tambien decodificadores de localizacion binaria de caracter exploratorio.

El modelo aborda un problema clinico concreto: determinar, a partir de una serie de cortes axiales de TC, si existe hemorragia y de que subtipo (epidural, intraparenquimatosa, intraventricular, subaracnoidea o subdural), ademas de la clase agregada `any`. Frente a la version original del mismo autor, que emplea un BiGRU contextual y cinco decodificadores DeepLabV3+ con encoder congelado, esta variante alternativa prescinde del modelo de secuencia y agrega los logits por corte mediante media y LSE normalizada con temperatura T = 0,25.

La relevancia actual es doble: por un lado, ofrece una implementacion ligera y reproducible (tres arquitecturas tiny de `timm`) para investigacion en imagen medica; por otro, su model card es explicitamente cauta sobre el rendimiento, advirtiendo de que se trata de un uso exclusivamente de investigacion y de que la validacion externa y la utilidad clinica no estan establecidas. El tamano del repositorio es de 0,4 GB y no se declaran idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres clasificadores CNN/transformer híbridos stride-16: ConvNeXt-Tiny, MaxViT-Tiny y CoAtNet-0, cada uno con decodificador de localizacion binaria |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada N x 9 x 512 x 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (release de pesos PyTorch; se descarga via `huggingface_hub.snapshot_download` y paquete `skp_ich_alt_runtime`) |

## Arquitectura y entrenamiento

La arquitectura combina tres backbones de clasificacion de imagen de la libreria `timm` con stride 16: ConvNeXt-Tiny, MaxViT-Tiny y CoAtNet-0. Cada miembro produce logits multiclase (seis salidas: epidural, intraparenquimatosa, intraventricular, subaracnoidea, subdural y `any`) y dispone de un decodificador de localizacion binaria. La clasificacion es el objetivo principal; los mapas de localizacion se describen como exploratorios. La entrada es un slab de N cortes con nueve canales (tres ventanas de TC: cerebro 40/80, subdural 80/200 y hueso 600/2800, en centro/ancho), normalizada a [0, 1] y con los vecinos ausentes rellenados con ceros tras el ventaneo. El procesamiento espacial redimensiona el campo de vision si alguna dimension supera 640 pixeles; en caso contrario, recorta o rellena en el centro antes del reescalado.

El entrenamiento se realizo sobre pesos de la epoca 50 sin calibracion aprendida ni ajuste sobre test. La agregacion a nivel de serie combina la media de logits por corte con una LSE normalizada de temperatura T = 0,25, sin modelo de secuencia. La evaluacion de subtipos es retrospectiva sobre los mismos logits congelados, sin ajuste especifico por subtipo ni seleccion de checkpoint. El autor advierte de que ocho pacientes del conjunto de profesores BHSD solapaban con el test historico y uno tambien con validacion, por lo que el resultado corregido es una auditoria post-hoc disjunta de profesores, no un holdout virgen. No se especifica el numero de tokens ni la composicion exacta del dataset de entrenamiento.

## Capacidades

- Clasificacion binaria y multiclase de hemorragia intracraneal a nivel de corte y de serie.
- Deteccion de cinco subtipos: epidural, intraparenquimatosa, intraventricular, subaracnoidea y subdural, mas la clase agregada `any`.
- Localizacion exploratoria mediante mapas de segmentacion (probabilidades sigmoideas medias, N x 1 x 512 x 512) y mapas de logits gruesos (N x 1 x 32 x 32).
- Agregacion a nivel de serie mediante media de logits y LSE normalizada (T = 0,25).
- Capacidad de seleccionar subconjuntos de arquitecturas (por ejemplo, solo ConvNeXt-Tiny) para reducir descarga y computo.
- Soporte de fine-tuning de clasificacion (parametros descongelados, BCE multilabel con seis objetivos) y de decodificadores mediante el pipeline de entrenamiento enlazado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Investigacion en deteccion de hemorragia intracraneal: el modelo sirve como linea base reproducible para comparar estrategias de agregacion por serie (media frente a LSE) en cohorts de TC de craneo, dado que el autor publica el procedimiento exacto de reproduccion.
- Auditoria de sesgo de solapamiento de datos: util para estudiar como el reuso de pacientes de profesores (BHSD) afecta a las metricas reportadas, ya que la model card documenta explicitamente el solapamiento y la correccion post-hoc.
- Prototipado de pipelines de triaje asistido por IA: integrable en un flujo de preprocesado DICOM propio (el modelo no incluye parser DICOM) para generar puntuaciones por serie y por corte antes de una revision radiologica.
- Fine-tuning sobre datos institucionales: al estar los parametros descongelados y documentarse el criterio BCE multilabel con pesos (clase `any` con peso 2), puede adaptarse a la distribucion local de un hospital o centro de investigacion.
- Evaluacion de localizacion exploratoria: los mapas de segmentacion y los logits gruesos 32 x 32 permiten estudiar la coherencia espacial de las predicciones, siempre con la advertencia de que no son medidas volumetricas.
- Benchmarking de arquitecturas tiny en imagen medica: permite comparar ConvNeXt-Tiny, MaxViT-Tiny y CoAtNet-0 en una tarea clinica concreta con pesos publicos y licencia permisiva.
- Docencia y formacion: como ejemplo didactico de ensemble de clasificadores de vision con agregacion LSE y evaluacion por subtipos en un contexto medico.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el subconjunto de test disjunto de profesores (1.410 series, 981 pacientes), endpoint `any` a nivel de serie:

| Metrica | Valor |
|---|---|
| AUROC | 0,981499 |
| Brier score | 0,048828 |
| Log loss | 0,174175 |
| Sensibilidad a 0,5 | 0,951846 |
| Especificidad a 0,5 | 0,918679 |

Comparacion exploratoria en la cohorte corregida entre agregacion por max pooling y LSE:

| Agregacion | AUC | Brier | Log loss |
|---|---|---|---|
| Max pooling | 0,981277 | 0,060390 | 0,209873 |
| LSE (T = 0,25) | 0,981499 | 0,048828 | 0,174175 |

La evaluacion de subtipos se realizo de forma retrospectiva sobre los mismos logits congelados, con T = 0,25 para todas las clases, sobre 48.972 cortes, 1.410 series y 981 pacientes. La model card no incluye en la informacion disponible la tabla completa de AUROC por subtipo. No se declara rendimiento de segmentacion del ensemble completo, y la localizacion BHSD esta afectada por el reuso de profesores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 0,4 GB y las tres arquitecturas son de tipo tiny, por lo que la huella deberia ser modesta, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible; el codigo de ejemplo usa `device="cuda:0"` y se ha probado con PyTorch 2.6 y CUDA 12.4.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano de las arquitecturas (tiny) es plausible, pero no se aporta dato verificado.
- Opciones de despliegue: paquete Python `skp_ich_alt_runtime` (wheel) con la clase `ICHEnsemble` y la funcion `preprocess_slab`; descarga de pesos via `huggingface_hub.snapshot_download` o `download_release`.
- Latencia y throughput: no establecidos; la model card indica explicitamente que la latencia de despliegue no esta determinada.
- Entorno: Python 3.11, PyTorch 2.6, CUDA 12.4.

## Comparativa con modelos similares

| Modelo | Arquitectura | Enfoque de serie | Licencia | Contexto de validacion |
|---|---|---|---|---|
| `ianpan/ct-head-hemorrhage-detection-alt` (este) | ConvNeXt-Tiny + MaxViT-Tiny + CoAtNet-0, stride-16 | Media de logits + LSE T = 0,25, sin secuencia | Apache 2.0 | Test disjunto de profesores, 1.410 series, AUROC 0,9815 |
| `ianpan/ct-head-hemorrhage-detection` (original) | Mismo tipo de backbones con BiGRU contextual y cinco DeepLabV3+ con encoder congelado | BiGRU contextual | no disponible en la informacion | no disponible en la informacion |
| Alternativas publicas de deteccion de ICH en TC | no disponible | no disponible | no disponible | no disponible |

El autor senala que ninguna de las dos variantes (original y alternativa) esta establecida como clinicamente superior. No se dispone de datos de benchmarks de terceros para una comparativa mas amplia.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: no validado para diagnostico, triaje ni decisiones de tratamiento.
- Validacion externa no realizada; la calibracion externa permanece sin validar.
- El conjunto de test ya fue consumido por trabajos anteriores; el resultado corregido es una auditoria post-hoc disjunta de profesores, no un holdout virgen.
- Solapamiento documentado: ocho pacientes del conjunto de profesores BHSD coincidian con el test historico y uno tambien con validacion.
- El rendimiento en hemorragias pequenas no esta establecido.
- No se declara rendimiento de segmentacion del ensemble completo; los mapas de localizacion son exploratorios y no estan calibrados.
- Los mapas no son medidas volumetricas y se generan en la rejilla procesada de 512 x 512, no en coordenadas nativas del paciente.
- La localizacion no tiene puerta de clasificador ni de ground truth.
- No se incluye parser DICOM: el reescalado y la orientacion por corte deben aplicarse aguas arriba.
- Un resultado de un solo slab no debe interpretarse como prediccion de serie completa.
- Las metricas del ensemble completo no aplican a subconjuntos de arquitecturas.
- No se proporciona estado de reanudacion de optimizador ni scheduler para fine-tuning.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de falsos positivos y negativos en la clasificacion; no se documentan sesgos demograficos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero la advertencia de uso solo de investigacion y la falta de validacion clinica desaconsejan su uso en produccion sanitaria sin evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ianpan/ct-head-hemorrhage-detection-alt
- Repositorio fuente (commit a557df791f139862e266dd696405bda1dfcc247c): https://github.com/i-pan/ct-head-hemorrhage-detection/tree/a557df791f139862e266dd696405bda1dfcc247c
- Reproduccion especifica del entrenamiento: https://github.com/i-pan/ct-head-hemorrhage-detection/blob/a557df791f139862e266dd696405bda1dfcc247c/docs/ICH_ALT_RELEASE.md
- Modelo original MaxViT/BiGRU: https://huggingface.co/ianpan/ct-head-hemorrhage-detection
