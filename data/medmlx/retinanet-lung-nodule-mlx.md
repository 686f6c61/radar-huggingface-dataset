# MedMLX/retinanet-lung-nodule-mlx

## Resumen

RetinaNet · Lung Nodules es un modelo de detección de objetos 3D para imagen médica, concretamente para la detección de candidatos a nódulos pulmonares en tomografías computarizadas (TC) de tórax. Lo publica MedMLX, un proyecto centrado en llevar inferencia de imagen médica a Apple Silicon mediante MLX, el framework de arrays de Apple. El modelo es un fine-tuning del checkpoint RetinaNet de MONAI (`MONAI/lung_nodule_ct_detection`), portado al formato nativo de MLX.

La relevancia del modelo es doble. Por un lado, demuestra que es viable ejecutar detección de nódulos pulmonares en 3D sobre hardware de consumo Apple (chips de la serie M), sin depender de GPUs de datacenter. Por otro, ofrece un pipeline reproducible y empaquetado (librería `lung-nodule-mlx`, pesos en `safetensors`) que reduce la fricción para investigadores que quieran experimentar con detección asistida por ordenador en TC.

Se trata de un modelo de tamaño reducido (el repositorio ocupa 0,1 GB) y de uso exclusivamente de investigación: el autor indica explícitamente que no está validado para uso clínico y que las salidas son candidatos que requieren revisión. La licencia de los pesos es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (detector denso de una etapa con FPN y focal loss), adaptado a entrada 3D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (fichero `network.safetensors`) |
| Entrada | TC de tórax 3D en formato NIfTI (`.nii.gz`) |
| Salida | Cajas candidatas con puntuaciones de confianza |
| Framework de inferencia | MLX (Apple Silicon / Metal) |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | `MONAI/lung_nodule_ct_detection` |

## Arquitectura y entrenamiento

La arquitectura es RetinaNet, un detector de objetos de una sola etapa presentado en el paper *Focal Loss for Dense Object Detection* (arXiv:1708.02002). RetinaNet combina una red troncal con una Feature Pyramid Network (FPN) para detectar objetos a múltiples escalas y utiliza focal loss para mitigar el desbalance extremo entre anclas positivas y negativas, problema especialmente acusado en detección médica donde los nódulos ocupan una fracción mínima del volumen. En esta implementación la entrada es volumétrica (TC 3D), por lo que las convoluciones y el muestreo de anclas operan sobre tres dimensiones.

Los pesos derivan del checkpoint RetinaNet de MONAI para detección de nódulos pulmonares en TC, que a su vez se entrena sobre datasets públicos de imagen médica (el autor no detalla en la model card la composición exacta del dataset ni el número de volúmenes empleados). MedMLX no documenta en la información disponible si realizó un reentrenamiento adicional o una mera conversión de pesos al formato MLX; la etiqueta `base_model:finetune` sugiere un ajuste fino sobre el checkpoint de MONAI. No se especifican detalles de aumentación de datos, resolución de vóxel de entrenamiento ni estrategia de muestreo de parches.

La innovación técnica destacable no está en la arquitectura (que es estándar) sino en la implementación: port nativo a MLX con soporte Metal, empaquetado como librería instalable (`lung-nodule-mlx>=0.2.6`), pesos en `safetensors` y un pipeline de preprocesado que incluye remuestreo opcional de la entrada (`resample_raw_input=True`) para normalizar la resolución espacial de los TC.

## Capacidades

- Detección de candidatos a nódulos pulmonares en volúmenes de TC de tórax 3D.
- Salida de cajas delimitadoras (bounding boxes) con puntuaciones de confianza para cada candidato.
- Procesamiento de volúmenes completos en formato NIfTI (`.nii.gz`).
- Preprocesado integrado: remuestreo opcional de la imagen de entrada a la resolución esperada por el modelo.
- Ejecución en Apple Silicon mediante MLX y Metal, sin necesidad de CUDA.
- Interfaz programática simple mediante la función `run()` de la librería `lung-nodule-mlx`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual/detección.
- No soporta múltiples idiomas ni capacidades multimodales más allá de la imagen médica 3D.

## Casos de uso

- Investigación en detección asistida por ordenador (CAD) para cáncer de pulmón: el modelo sirve como línea base reproducible para comparar nuevas arquitecturas de detección de nódulos en 3D, gracias a que los pesos y el pipeline están empaquetados y son fáciles de ejecutar.
- Prototipado rápido en portátiles Apple Silicon: un investigador puede ejecutar la detección sobre un TC de un dataset público en un MacBook con chip M-series, sin acceso a GPUs de datacenter, lo que acelera la iteración en fases tempranas de un proyecto.
- Generación de candidatos para revisión por radiólogos en estudios de lectura asistida: el modelo produce cajas y puntuaciones que pueden priorizarse para que un especialista revise primero los volúmenes con mayor probabilidad de nódulo.
- Docencia y formación en imagen médica computacional: el pipeline permite a estudiantes ver de extremo a extremo cómo se carga un TC, se remuestrea, se infiere y se obtienen candidatos, con un coste computacional bajo.
- Evaluación comparativa de frameworks de inferencia: sirve para medir el rendimiento de MLX frente a PyTorch/MONAI en una tarea de detección 3D real, útil para decidir stacks tecnológicos en proyectos de imagen médica.
- Preetiquetado de datasets: las cajas candidatas pueden usarse como propuestas iniciales para anotadores humanos, reduciendo el tiempo de etiquetado en la construcción de nuevos conjuntos de datos de nódulos pulmonares.
- Integración en pipelines de investigación preclínica: como paso de cribado automático sobre cohortes de TC antes de análisis más costosos (segmentación fina, clasificación de malignidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de detección (sensibilidad, precisión, FROC, mAP) ni comparaciones cuantitativas con el checkpoint original de MONAI u otros detectores.

## Requisitos de hardware

- VRAM/unified memory estimada: no disponible de forma explícita; el repositorio de pesos ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe holgadamente en memoria unificada de cualquier chip Apple Silicon moderno. La memoria necesaria durante la inferencia depende del tamaño del volumen de TC de entrada y del remuestreo aplicado.
- GPU recomendadas: chips Apple Silicon (serie M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte Metal. No está diseñado para CUDA; no se documenta soporte para A100, H100 ni RTX.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no se documenta compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: librería `lung-nodule-mlx` (Python 3.13) sobre MLX; descarga de pesos con `huggingface-hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Framework | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/retinanet-lung-nodule-mlx | Detección de nódulos en TC 3D | MLX (Apple Silicon) | safetensors | Apache-2.0 | Hugging Face |
| MONAI/lung_nodule_ct_detection | Detección de nódulos en TC 3D | PyTorch / MONAI | no disponible en la información | no disponible en la información | Hugging Face / MONAI Model Zoo |
| Detectores genéricos 3D (p. ej. nnDetection, RetinaNet 3D en MONAI) | Detección de lesiones en imagen médica 3D | PyTorch | varios | habitualmente Apache-2.0 o MIT | Repositorios de investigación |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada. La diferencia principal de este modelo frente al checkpoint de MONAI es el framework de ejecución (MLX nativo en lugar de PyTorch) y el empaquetado del pipeline; la arquitectura subyacente es la misma familia RetinaNet.

## Limitaciones y advertencias

- No validado para uso clínico: el autor indica explícitamente que es para investigación y educación y que las salidas son candidatos que requieren revisión. No debe usarse para diagnóstico ni decisiones médicas.
- Riesgo de falsos positivos y falsos negativos: al ser un detector de una etapa con focal loss, puede producir candidatos espurios y omitir nódulos pequeños o de bajo contraste; no se documentan métricas de sensibilidad ni especificidad.
- Sesgos de datos: no se detalla la composición del dataset de entrenamiento (población, fabricante de escáner, protocolo de adquisición), por lo que se desconoce su comportamiento en dominios distintos al de entrenamiento.
- Dependencia de plataforma: la implementación está atada a MLX y Apple Silicon; no hay soporte documentado para CUDA ni para GPUs NVIDIA, lo que limita su despliegue en infraestructura de datacenter convencional.
- Preprocesado sensible: los resultados dependen del remuestreo y normalización de la entrada; variaciones en la resolución de vóxel o en el espaciado del TC pueden afectar a la detección.
- Idioma: la documentación y las etiquetas están en inglés; el modelo no procesa texto.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial según los términos de la licencia, pero la advertencia del autor sobre falta de validación clínica debe tenerse en cuenta en cualquier contexto regulado.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/retinanet-lung-nodule-mlx
- Ficheros del modelo: https://huggingface.co/MedMLX/retinanet-lung-nodule-mlx/tree/main
- Repositorio GitHub: https://github.com/MedMLX/lung-nodule-mlx
- Documentación de ejecución: https://github.com/MedMLX/lung-nodule-mlx/blob/main/README.md#run
- Paper de MedMLX: https://doi.org/10.64898/2026.10.28.26366762
- Paper de RetinaNet (Focal Loss for Dense Object Detection): https://arxiv.org/abs/1708.02002
- Modelo base MONAI: https://huggingface.co/MONAI/lung_nodule_ct_detection
- Licencia: https://huggingface.co/MedMLX/retinanet-lung-nodule-mlx/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/retinanet-lung-nodule-mlx/blob/main/NOTICE
