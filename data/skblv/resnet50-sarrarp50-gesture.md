# skblv/resnet50-sarrarp50-gesture

## Resumen

El modelo `skblv/resnet50-sarrarp50-gesture` es un ResNet-50 supervisado de 8 clases, entrenado como linea base para el reconocimiento de gestos de sutura en el dataset SAR-RARP50. Ha sido desarrollado por skblv en el marco de un leaderboard de comprension de video quirurgico, fruto de la colaboracion entre SDSC y Chicago Booth. El modelo clasifica fotogramas individuales de video quirurgico en 8 categorias de gestos de sutura, lo que lo convierte en un componente util para la evaluacion de habilidades quirurgicas y el analisis automatizado de procedimientos.

La relevancia de este modelo radica en que aborda un problema fundamental en intervenciones asistidas por ordenador: el reconocimiento de acciones y gestos quirurgicos. Al ser una linea base supervisada con arquitectura ResNet-50, proporciona un punto de referencia reproducible para comparar tecnicas mas avanzadas en el leaderboard de comprension de video quirurgico. El modelo esta publicado bajo licencia Apache 2.0 y su tamano de repositorio es de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) |
| Parametros totales | ~25,6 millones (estandar de ResNet-50) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (formato nativo de la libreria) |

## Arquitectura y entrenamiento

ResNet-50 es una red neuronal convolucional profunda de 50 capas que introduce bloques residuales con conexiones de salto (skip connections) para mitigar el problema del desvanecimiento del gradiente. En este caso, el modelo ha sido ajustado (fine-tuning) para una tarea de clasificacion de 8 clases de gestos de sutura sobre fotogramas individuales del dataset SAR-RARP50. El entrenamiento es supervisado y el modelo actua como linea base para el leaderboard de comprension de video quirurgico.

Los detalles especificos del entrenamiento (numero de epocas, optimizador, tasa de aprendizaje, composicion del dataset de entrenamiento) no estan disponibles en la informacion proporcionada. El dataset SAR-RARP50, descrito en el articulo arxiv:2401.00496, incluye segmentacion de instrumentacion quirurgica y reconocimiento de acciones en video de cirugia robotica.

## Capacidades

- Clasificacion de imagenes de fotogramas de video quirurgico en 8 clases de gestos de sutura.
- Reconocimiento de gestos quirurgicos a nivel de fotograma individual (sin contexto temporal).
- Inferencia sobre imagenes de video de cirugia robotica (dataset SAR-RARP50).
- Adecuado como linea base reproducible para comparacion de modelos en el leaderboard de comprension de video quirurgico.
- No soporta tool calling, generacion de texto, ni capacidades multimodales mas alla de la clasificacion de imagenes.

## Casos de uso

- Evaluacion de habilidades quirurgicas: el modelo clasifica gestos de sutura en fotogramas de video, lo que permite cuantificar la ejecucion de pasos especificos de una sutura y generar metricas objetivas de destreza para cirujanos en formacion.
- Analisis automatizado de video quirurgico: integrado en pipelines de post-procesado, el modelo puede etiquetar secuencias de video de cirugia robotica para indexar momentos relevantes de la intervencion.
- Formacion asistida por ordenador: en simuladores de cirugia, el modelo puede proporcionar retroalimentacion en tiempo real sobre la correccion de los gestos de sutura ejecutados por el estudiante.
- Investigacion en intervenciones asistidas por ordenador: como linea base reproducible, permite a investigadores comparar el rendimiento de arquitecturas mas avanzadas (transformers, modelos temporales) frente a un punto de referencia estandar.
- Auditoria de procedimientos quirurgicos: el etiquetado automatico de gestos puede facilitar la revision de grabaciones quirurgicas para control de calidad y cumplimiento de protocolos.
- Desarrollo de sistemas de apoyo a la decision: la clasificacion de gestos puede alimentar sistemas que alerten al equipo quirurgico sobre la fase actual de la intervencion o sobre posibles desviaciones del procedimiento estandar.

## Benchmarks y rendimiento

El modelo card reporta los siguientes resultados sobre el split de validacion completo de 636 fotogramas, con intervalo de confianza bootstrap del 95%:

| Metrica | Valor |
|---|---|
| Exact match | 53,0% (49,2-57,1) |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de clasificacion de imagenes especializado en dominio medico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene aproximadamente 25,6 millones de parametros, lo que supone unos 100 MB en FP32 y unos 50 MB en FP16. La VRAM necesaria es minima, inferior a 1 GB para inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una NVIDIA RTX 3060 o superior permite inferencia en tiempo real sobre multiples fotogramas. Incluso la inferencia en CPU es viable para procesamiento por lotes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU de consumo actual (RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas para inferencia puntual.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, o mediante servidores de inferencia como TorchServe. Tambien puede integrarse en pipelines de procesamiento de video con OpenCV.
- Latencia y throughput: no se han publicado mediciones especificas de latencia, pero para un ResNet-50 en una GPU moderna, la inferencia por fotograma suele estar en el rango de 1-5 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia | Exact match |
|---|---|---|---|---|---|
| skblv/resnet50-sarrarp50-gesture | ResNet-50 | ~25,6 M | Gestos de sutura (8 clases) | Apache 2.0 | 53,0% |
| skblv/yolo11m-cls-sarrarp50-gesture | YOLO11m-cls | no disponible | Gestos de sutura (8 clases) | no disponible | no disponible |
| microsoft/resnet-50 | ResNet-50 | ~25,6 M | Clasificacion ImageNet (1000 clases) | no disponible | no comparable |

La comparacion directa con el modelo YOLO11m-cls del mismo autor no es posible sin datos de rendimiento publicados. El modelo microsoft/resnet-50 es el modelo base pre-entrenado en ImageNet, no ajustado para el dominio quirurgico.

## Limitaciones y advertencias

- El modelo es una linea base de investigacion y no es un dispositivo medico. No debe utilizarse para diagnosticos ni decisiones clinicas.
- La clasificacion se realiza sobre fotogramas individuales, sin contexto temporal. Los gestos quirurgicos son inherentemente temporales, por lo que el rendimiento puede ser inferior al de modelos que incorporan informacion de secuencia.
- El rendimiento reportado (53,0% de exact match) es moderado y puede no ser suficiente para aplicaciones de produccion sin un ajuste adicional.
- El modelo esta entrenado especificamente para gestos de sutura en el dataset SAR-RARP50. Su generalizacion a otros tipos de procedimientos quirurgicos o a otros datasets no esta garantizada.
- No se dispone de informacion sobre sesgos potenciales del modelo, aunque al tratarse de un dominio medico especializado, la variabilidad entre centros quirurgicos y equipos puede afectar al rendimiento.
- No se han publicado detalles sobre el proceso de entrenamiento (aumento de datos, regularizacion, etc.), lo que limita la reproducibilidad completa.
- El modelo cuenta con 0 descargas y 0 likes en el momento de la publicacion, lo que indica que es un modelo reciente o de nicho sin adopcion verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/resnet50-sarrarp50-gesture
- Articulo SAR-RARP50 (arXiv): https://arxiv.org/abs/2401.00496
- Leaderboard de comprension de video quirurgico: https://github.com/skblv/neurosurgery-video-eval-website
- Modelo comparativo YOLO11m-cls: https://huggingface.co/skblv/yolo11m-cls-sarrarp50-gesture
- ResNet-50 de Microsoft en Hugging Face: https://huggingface.co/microsoft/resnet-50
