# Marc-HealthAI/Crimson-Flame-6-resNet18-v2.5-updated-hyperparameters

## Resumen

Crimson-Flame-6 es un clasificador de imagenes basado en una ResNet-18 afinada para identificar planos estandar en ecografias fetales. Lo publica la organizacion Marc-HealthAI en HuggingFace bajo licencia MIT y esta entrenado sobre el dataset Fetal_Planes_DB, un corpus de mas de 12.400 imagenes procedentes de 1.792 pacientes y recogidas en dos hospitales con multiples operadores y ecografos.

El modelo resuelve una tarea de clasificacion multiclase de 6 categorias: abdomen fetal, cerebro fetal, femur fetal, torax fetal, cervix materno y una clase residual "Otros". Es la version v2.5, en la que el autor indica un ajuste de hiperparametros respecto a versiones previas: tasa de aprendizaje reducida de 1e-4 a 5e-5 y batch efectivo de 32.

Se trata de un modelo pequeno (11.189.190 parametros, alrededor de 45 MB en fp32) pensado para inferencia ligera, potencialmente en CPU o en hardware de borde. Su relevancia esta en el nicho de la asistencia al diagnostico prenatal por imagen: automatizar el triaje de planos ecograficos permite reducir carga de trabajo del especialista y estandarizar el control de calidad de las capturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con bloques residuales BasicBlock) |
| Parametros totales | 11.189.190 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors, presumiblemente fp32 |
| Idiomas soportados | no aplica; la etiqueta de idioma del repositorio es `en` |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante PyTorch) |
| Tarea (pipeline) | image-classification |
| Numero de clases | 6 |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | Marc-HealthAI/fetal-planes-classification-dataset-main |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 convolucional clasica, con 18 capas de profundidad y conexiones residuales, adaptada a 6 clases de salida en lugar de las 1.000 de ImageNet. Es un modelo de vision puro: no incorpora mecanismos de atencion, mezcla de expertos ni modulos de lenguaje. El numero de parametros (11,19 M) es coherente con una ResNet-18 con cabeza de clasificacion reducida a 6 categorias.

El entrenamiento se realizo sobre el dataset Fetal_Planes_DB, descrito en el articulo de Burgos-Artizzu et al. (Scientific Reports, 2020). El corpus contiene mas de 12.400 imagenes ecograficas materno-fetales etiquetadas manualmente por un clinico experto en medicina fetal, divididas en las 6 clases citadas. En la version v2.5 el autor modifico los hiperparametros respecto a versiones anteriores: la tasa de aprendizaje bajo de 1e-4 a 5e-5 y el batch efectivo se fijo en 32. No se detalla en la informacion disponible el numero de epocas, el optimizador, la resolucion de entrada ni si se aplico aumento de datos; tampoco se menciona ninguna innovacion tecnica adicional mas alla del ajuste fino supervisado.

## Capacidades

- Clasificacion de imagenes ecograficas fetales en 6 categorias: abdomen fetal, cerebro fetal, femur fetal, torax fetal, cervix materno y otros.
- Discriminacion de planos anatomicos estandar usados en cribado prenatal.
- Deteccion de imagenes fuera de plano mediante la clase residual "Otros".
- Inferencia sobre imagen individual (no procesa secuencias ni video de forma nativa).
- Ejecucion en hardware modesto por su reducido tamano de parametros.
- Soporte de tool calling / function calling: no disponible (modelo de vision, sin interfaz de texto).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision, audio, thinking mode): unicamente vision, en la modalidad de clasificacion de imagen.

## Casos de uso

- Triaje automatizado de ecografias prenatales: el modelo etiqueta cada captura con su plano anatomico, permitiendo separar rapidamente los estudios completos de los incompletos y priorizar la revision del especialista.
- Control de calidad en tiempo real durante la adquisicion: integrado en el ecografo, puede avisar al operador si la imagen capturada no corresponde al plano esperado (por ejemplo, si aparece la clase "Otros" cuando se buscaba un plano de cerebro).
- Curacion y etiquetado de datasets clinicos: se puede usar para preetiquetar grandes volumenes de imagenes retroacivas antes de la revision manual, reduciendo el coste de anotacion.
- Pre-seleccion en sistemas PACS: filtrado de estudios entrantes para derivar automaticamente los casos con planos completos frente a los que requieren repeticion.
- Investigacion retrospectiva: clasificacion de cohortes historicas de imagenes para estudios epidemiologicos sobre calidad de cribado o frecuencia de planos.
- Formacion de residentes: herramienta de retroalimentacion inmediata que indica al alumno si ha capturado el plano correcto durante las practicas.
- Evaluacion del cervix materno: la clase especifica de cervix materno permite un cribado orientado a la prematuridad dentro del mismo modelo.
- Despliegue en entornos con recursos limitados: por su tamano, puede ejecutarse en portatiles, dispositivos de borde o incluso CPU, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test del dataset de planos fetales:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9515 |
| Macro F1 | 0,9412 |
| Macro Precision | 0,9306 |
| Macro Recall | 0,9536 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto de test, ni desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 45 MB en fp32 y alrededor de 22 MB en fp16, mas el espacio de activaciones (del orden de decenas de MB para lotes pequenos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, GTX 1650, etc.), e incluso en GPUs integradas.
- CPU: la inferencia en CPU es viable dado el reducido numero de parametros, aunque no se dispone de cifras medidas de latencia.
- Opciones de despliegue: al ser un modelo PyTorch/safetensors, se puede servir con TorchServe, FastAPI + PyTorch, ONNX Runtime, TensorRT o integraciones de HuggingFace `transformers`/`timm`. No se menciona soporte de vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de este modelo comparados con alternativas sobre el mismo conjunto de test. A continuacion se comparan caracteristicas generales con arquitecturas habituales en clasificacion de imagenes medicas:

| Modelo | Parametros (aprox.) | Tarea | Licencia | Rendimiento en Fetal_Planes_DB |
|---|---|---|---|---|
| Crimson-Flame-6 (ResNet-18) | 11,19 M | Clasificacion de planos fetales | MIT | Accuracy 0,9515; macro F1 0,9412 |
| ResNet-50 | ~25,6 M (con 1.000 clases) | Clasificacion de imagen generica | varía segun implementacion | no disponible |
| EfficientNet-B0 | ~5,3 M | Clasificacion de imagen generica | varía segun implementacion | no disponible |
| VGG-16 | ~138 M | Clasificacion de imagen generica | varía segun implementacion | no disponible |

El articulo de referencia (Burgos-Artizzu et al., 2020) evalua varias CNN para esta misma tarea, pero los valores concretos no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos potenciales: el dataset combina imagenes de dos hospitales y varios operadores y ecografos; el rendimiento puede degradarse en equipos, protocolos o poblaciones distintas a los del entrenamiento.
- Riesgo de alucinacion / falso positivo: la clase "Otros" agrupa planos poco frecuentes; el modelo puede forzar la asignacion de una clase anatomica a imagenes ambiguas.
- Ausencia de validacion externa documentada: solo se reportan metricas sobre el conjunto de test del propio dataset, sin validacion cruzada entre centros.
- No es un dispositivo medico: no dispone de marcado CE ni aprobacion FDA; su uso en decision clinica requeriria validacion regulatoria especifica.
- Limitaciones de idioma y modalidad: solo procesa imagenes ecograficas; no acepta texto ni otras modalidades de imagen.
- Desequilibrio de clases: con 6 categorias sobre 12.400 imagenes, el rendimiento por clase puede variar y no se aporta desglose; la macro precision (0,9306) es notablemente inferior a la macro recall (0,9536), lo que sugiere posibles falsos positivos en clases minoritarias.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime de responsabilidad sobre el uso clinico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni de validacion por terceros.
- Los resultados de busqueda web asociados al termino "Marc" no guardan relacion con el modelo y no aportan informacion tecnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Marc-HealthAI/Crimson-Flame-6-resNet18-v2.5-updated-hyperparameters
- Dataset de entrenamiento: https://huggingface.co/datasets/Marc-HealthAI/fetal-planes-classification-dataset-main
- Articulo de referencia del dataset: https://doi.org/10.1038/s41598-020-67076-5
- Version de acceso abierto del articulo: https://rdcu.be/b47NX
