# Daemons-Q/qsh-medical-breastmnist-resnet50

## Resumen

El modelo `Daemons-Q/qsh-medical-breastmnist-resnet50` es un clasificador binario de imagenes de ecografia mamaria (benigno frente a maligno) basado en una arquitectura ResNet-50, entrenado desde cero sobre el conjunto de datos BreastMNIST de MedMNIST v2. Lo desarrolla Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demo de orquestacion cuantico-segura que combina multiparty computation, distribucion de claves cuanticas y cifrado homomórfico para aprendizaje federado medico. El modelo se publica como el artefacto en claro para el caso de uso `medical_fl`, mientras que la ruta cifrada ejecuta un estudiante destilado.

Su relevancia radica en que reproduce un hallazgo publicado por Yang et al. (Scientific Data 10:41, 2023): en el corpus de 780 imagenes de BreastMNIST, el ResNet-50 obtiene peor AUC que el ResNet-18 (0,799 frente a 0,901). El modelo se entrena con una resolucion de 28x28 píxeles, canal unico, sin pesos de ImageNet, y se distribuye en formato ONNX y safetensors para su despliegue en navegador y entornos de inferencia ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN convolucional) |
| Parametros totales | 23.558.978 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | CC-BY-4.0 (declarada por MedMNIST) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un ResNet-50 estandar con un stem adaptado a canal unico (1-channel stem) para aceptar imagenes en escala de grises de 28x28. Se entrena desde inicializacion aleatoria, sin transferencia de ImageNet, en el conjunto BreastMNIST de MedMNIST v2 (780 imagenes de ecografia mamaria). El entrenamiento completo tarda 12,2 segundos en la maquina de referencia del autor. No se aplicaron tecnicas de RLHF ni DPO, al tratarse de un clasificador convolucional clasico. La decision de no usar pesos ImageNet se justifica por terminos de redistribucion del proyecto, lo que hace que las comparaciones con arquitecturas preentrenadas publicadas en MedMNIST+ no sean directamente comparables.

## Capacidades

- Clasificacion binaria de imagenes de ecografia mamaria (benigno vs. maligno) con entrada de 28x28 píxeles en un canal.
- Inferencia en navegador via ONNX Runtime Web, gracias al formato ONNX incluido en el repositorio.
- Integrable en pipelines de aprendizaje federado con cifrado homomórico y distribucion cuantica de claves (proyecto QSMPC-QKD-QHE-AI-Hybrid).
- Reproduccion de resultados publicados de MedMNIST v2 como punto de referencia para investigacion.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues, al ser un clasificador visual.

## Casos de uso

- **Reproduccion de hallazgos cientificos**: el modelo permite verificar de forma independiente la afirmacion de Yang et al. sobre el comportamiento del ResNet-50 en BreastMNIST (AUC 0,857 publicada frente a 0,799 medida), util en auditorias de investigacion.
- **Baseline para aprendizaje federado medico**: sirve como modelo en claro de referencia dentro de un sistema de federated learning con cifrado homomórico, permitiendo comparar el rendimiento de estudiantes destilados cifrados frente al modelo original.
- **Demo de clasificacion medica en navegador**: el formato ONNX y el tag `onnxruntime-web` permiten desplegar el modelo en una pagina web para demostraciones educativas de clasificacion de ecografias.
- **Evaluacion de sesgos en datasets medicos pequenos**: el modelo se publica con una analisis detallada de contaminacion del dataset (duplicados, contradicciones de etiquetas), util para estudiar el impacto de la leakage en el rendimiento.
- **Formacion en deep learning medico**: como caso de estudio de entrenamiento desde cero con datos muy limitados (780 muestras), muestra los riesgos de overfitting y la importancia de la validacion cruzada.
- **Integracion en pipelines de seguridad cuantica**: el modelo forma parte de un sistema que combina QKD, cifrado homocórico y MPC para demostrar la viabilidad de la IA medica preservando la privacidad.

## Benchmarks y rendimiento

| Metrica | Valor medido (este modelo) | ResNet-50 publicado (Yang et al.) | ResNet-18 publicado (Yang et al.) | Google AutoML |
|---|---|---|---|---|
| AUC | 0,7988 | 0,857 | 0,901 | 0,919 |
| Accuracy | 0,7821 | 0,812 | no disponible | no disponible |
| Macro F1 | 0,6492 | no disponible | no disponible | no disponible |
| Mejor AUC en validacion | 0,9357 | no disponible | no disponible | no disponible |

El modelo no alcanza el AUC del ResNet-50 publicado (0,857) ni el del ResNet-18 (0,901), lo que confirma la hipotesis del autor: en 780 imagenes, la red mas profunda pierde rendimiento. La diferencia entre el mejor AUC de validacion (0,936) y el AUC de test (0,799) sugiere un sobreajuste o el efecto de la leakage documentada en el dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (23,5 millones de parametros, ~94 MB de pesos), por lo que cabe en cualquier GPU comercial.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es suficiente; la inferencia tambien es viable en CPU pura.
- En consumer GPU: si, sin problema, incluso en hardware de gama de entrada.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), ONNX Runtime Web para navegador, Python con `onnxruntime` o `safetensors`. No es compatible con vLLM ni Ollama al no ser un modelo de lenguaje.
- Latencia estimada: en CPU moderna, inferencia de una imagen en decenas de milisegundos; en GPU, en el orden de pocos milisegundos. No se han publicado mediciones exactas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | AUC (BreastMNIST) | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| Daemons-Q/qsh-medical-breastmnist-resnet50 | ResNet-50 | 23,6 M | 0,799 | Desde cero | CC-BY-4.0 (MedMNIST) |
| Daemons-Q/qsh-medical-breastmnist-resnet18 | ResNet-18 | no disponible | no disponible | Desde cero | CC-BY-4.0 (MedMNIST) |
| ResNet-50 publicado (Yang et al.) | ResNet-50 | 23,6 M | 0,857 | ImageNet preentrenado | CC-BY-4.0 |
| ResNet-18 publicado (Yang et al.) | ResNet-18 | 11,2 M | 0,901 | ImageNet preentrenado | CC-BY-4.0 |

La comparativa muestra que el modelo desde cero queda por debajo de las versiones con pesos ImageNet, y que la arquitectura mas profunda pierde frente a la mas ligera en este corpus.

## Limitaciones y advertencias

- **Dataset contaminado**: MedMNIST v2 BreastMNIST contiene duplicados y contradicciones de etiquetas (una imagen aparece como maligna en entrenamiento y benigna en test), lo que limita la fiabilidad de las metricas.
- **Licencia ambigua**: aunque MedMNIST se declara CC-BY-4.0, el dataset original BUSI (Al-Dhabyani et al.) no tiene una licencia de datos verificable; solo una peticion de citacion. Esto puede afectar al uso comercial.
- **No es un modelo de produccion**: el propio autor lo declara como prueba de concepto de investigacion, no como sistema clinico.
- **Rendimiento inferior a alternativas**: el AUC de 0,799 esta por debajo de los 0,857 publicados para ResNet-50 y de los 0,901 de ResNet-18, por lo que no es adecuado para diagnostico asistido.
- **Entrada limitada**: solo acepta imagenes de 28x28 píxeles en un canal, lo que impide su uso con imagenes de ecografia de resolucion clinica real.
- **Sesgos de clase**: el macro F1 de 0,649 frente a una accuracy de 0,782 indica un rendimiento desequilibrado entre las dos clases, probablemente por el desbalance del dataset.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Daemons-Q/qsh-medical-breastmnist-resnet50
- Proyecto QSMPC-QKD-QHE-AI-Hybrid (GitHub): https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid
- Modelo ResNet-18 del mismo proyecto: https://huggingface.co/Daemons-Q/qsh-medical-breastmnist-resnet18
- Dataset MedMNIST v2: https://medmnist.com/
- Paper MedMNIST v2: Yang et al., Scientific Data 10:41 (2023), https://doi.org/10.1038/s41597-023-02085-1
- Dataset BUSI original: Al-Dhabyani et al., Data in Brief 28:104863 (2020), https://doi.org/10.1016/j.dib.2019.104863
