# mshaiel2004/dr-severity-grading-coral

## Resumen

El modelo dr-severity-grading-coral es un clasificador de imagen médica publicado en HuggingFace por el usuario mshaiel2004, orientado a la gradación automática de la severidad de la retinopatía diabética a partir de retinografías de fondo de ojo. Se construye sobre un backbone EfficientNet-B0 preentrenado y ajustado sobre el dataset APTOS 2019, al que se añade una cabeza de clasificación (CoralHead) que aplica la pérdida CORAL (Consistent Rank Logits) para regresión ordinal. La resolución de entrada declarada es de 380x380 píxeles y la métrica principal declarada es el Quadratic Weighted Kappa (QWK).

La decisión de tratar el problema como regresión ordinal y no como clasificación multiclase plana es el punto técnicamente relevante: los grados de retinopatía diabética son categorías ordenadas (0 a 4), de modo que un error entre grado 0 y grado 4 no debería penalizarse igual que uno entre grado 1 y grado 2. CORAL comparte un único vector de pesos y un sesgo distinto por umbral, lo que garantiza por construcción que las probabilidades acumuladas de superar cada umbral son monótonas decrecientes, algo que una cabeza softmax estándar no asegura.

Ahora bien, el repositorio figura con un tamaño de 0.0 GB, cero descargas y cero "likes", y su model card es muy escueta: no publica el valor numérico de QWK, no detalla la partición del dataset, los hiperparámetros de entrenamiento ni la composición de los datos. Debe considerarse por tanto un artefacto experimental o una prueba de concepto, no un modelo validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, bloques MBConv) con cabeza CoralHead de regresion ordinal y pesos compartidos por umbral |
| Parametros totales | no disponible en la model card (el backbone EfficientNet-B0 estandar tiene del orden de 5,3 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada de imagen fija de 380x380 pixeles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de clasificacion de imagen, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB, no se confirma la presencia de checkpoints) |
| Tarea | Clasificacion ordinal de severidad de retinopatia diabetica (5 grados: 0-4) |
| Dataset de entrenamiento | APTOS 2019 (segun los tags y la model card) |
| Metrica principal declarada | Quadratic Weighted Kappa (QWK); valor numerico no publicado |
| Framework | PyTorch |
| Fecha de creacion del repo | 2026-09-10 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

EfficientNet-B0 es una red neuronal convolucional que emplea bloques MBConv (convoluciones separables en profundidad con mecanismos de atencion tipo SE) y un escalado compuesto de profundidad, anchura y resolucion. En este caso se parte de un backbone preentrenado (probablemente en ImageNet, aunque la model card no lo confirma) y se ajusta sobre APTOS 2019. Sobre las caracteristicas extraidas se monta una CoralHead: en lugar de una capa final con cinco logits independientes, CORAL define K-1 = 4 funciones binarias que comparten un unico vector de pesos y difieren solo en el sesgo. La prediccion final se obtiene sumando los indicadores de superacion de umbral, lo que produce un entero entre 0 y 4 y garantiza consistencia de rango.

La model card no especifica el numero de tokens o imagenes de entrenamiento, la particion train/validacion/test, el numero de epocas, la estrategia de data augmentation, el optimizador, el learning rate ni si se aplico algun tipo de calibracion posterior. Tampoco indica si se congelo el backbone, si se hizo fine-tuning completo o si se aplico algun esquema de ponderacion por clase para compensar el desbalanceo tipico de los datasets de retinopatia diabetica. No se documenta ninguna innovacion adicional mas alla del uso de la perdida CORAL en lugar de entropia cruzada o una regresion continua con redondeo.

## Capacidades

- Clasificacion de retinografias de fondo de ojo en cinco grados ordinales de severidad de retinopatia diabetica (0 a 4).
- Predicciones con consistencia de rango garantizada matematicamente gracias a la formulacion CORAL.
- Salida de probabilidades acumuladas por umbral, lo que permite interpretar la confianza del modelo en cada frontera entre grados.
- Entrada de imagen a 380x380 pixeles.
- No genera texto ni mantiene conversaciones: no es un modelo de lenguaje.
- No dispone de tool calling, function calling ni soporte de agentes.
- No realiza razonamiento multi-paso ni dispone de modo "thinking".
- No es un modelo multimodal general: no describe imagenes, no responde a preguntas visuales ni procesa otro tipo de imagen medica fuera de la retinografia.
- No tiene capacidades multilingues, por tratarse de un clasificador visual.

## Casos de uso

- Triaje previo a consulta oftalmologica: el modelo clasifica la retinografia en uno de los cinco grados y permite derivar directamente a oftalmologia los casos de grado 3 o 4, reduciendo el tiempo hasta el diagnostico en listas de espera largas.
- Programas de cribado poblacional en zonas con acceso limitado a especialistas: al ser un EfficientNet-B0 (modelo pequeno), puede ejecutarse en equipos modestos o incluso en modo CPU, lo que facilita su despliegue en unidades moviles o centros de atencion primaria sin GPU dedicada.
- Priorizacion de listas de espera: ordenar automaticamente una cola de retinografias pendientes de lectura por severidad estimada, de modo que los casos mas graves se revisen primero.
- Segunda lectura asistida: usar la salida del modelo como senal de alerta cuando la prediccion difiere de la lectura del especialista, lo que ayuda a reducir falsos negativos en lesiones sutiles.
- Investigacion clinica retrospectiva: aplicar el modelo a cohortes historicas de imagenes ya etiquetadas para analizar la progresion de la enfermedad o para estratificar pacientes en estudios observacionales.
- Punto de partida para ajuste fino con datos locales: al ser un backbone pequeno y con licencia MIT, es viable reentrenarlo sobre la distribucion de imagenes y camaras de un hospital concreto, algo especialmente util dado el conocido sesgo de dominio de los datasets publicos.
- Formacion y anotacion asistida: usar las predicciones como preetiquetado en herramientas de anotacion para residentes de oftalmologia, acelerando la creacion de nuevos conjuntos de datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card unicamente declara que la metrica principal es el Quadratic Weighted Kappa (QWK), pero no incluye su valor, ni resultados de exactitud, sensibilidad, especificidad, AUC por clase o matriz de confusion, ni comparaciones con otros modelos sobre APTOS 2019.

| Metrica | Valor |
|---|---|
| Quadratic Weighted Kappa (QWK) | no disponible (declarada como metrica principal, sin valor publicado) |
| Accuracy | no disponible |
| AUC por clase | no disponible |
| Matriz de confusion | no disponible |
| Comparacion con baseline | no disponible |

## Requisitos de hardware

Nota: al no haberse publicado pesos ni configuracion de despliegue, las siguientes cifras son estimaciones basadas en las caracteristicas conocidas de EfficientNet-B0 a 380x380 y deben verificarse con el checkpoint real.

- VRAM estimada para inferencia: del orden de 1 a 2 GB por lote pequeno en FP32; puede reducirse por debajo de 1 GB en FP16 o INT8.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente. Una NVIDIA RTX 3060, RTX 4060 o superior ofrece un margen amplio. Tambien es viable en GPUs de gama de entrada como GTX 1650 o T4.
- GPU de datacenter: A100, H100 o L4 no son necesarias para inferencia, aunque pueden usarse para servir muchos flujos concurrentes o para reentrenamiento.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 2-4 GB de VRAM. Incluso es probable que funcione en CPU para inferencia por lotes pequenos, con latencias mayores.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, TensorRT, OpenVINO, TorchServe y frameworks de servicio genericos como BentoML o FastAPI con PyTorch. No aplican llama.cpp, Ollama, vLLM ni TGI al no tratarse de un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. En una GPU moderna, un clasificador de este tamano suele procesar decenas o cientos de imagenes por segundo en FP16, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificables de este modelo ni de alternativas evaluadas sobre la misma particion, por lo que la comparacion cuantitativa no es posible. Se ofrece una comparacion estructural orientativa.

| Modelo | Arquitectura | Parametros | Contexto o entrada | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| dr-severity-grading-coral | EfficientNet-B0 + CORAL | no disponible (~5,3 M en el backbone) | imagen 380x380 | MIT | no disponible (QWK sin valor) | repositorio vacio segun metadatos (0.0 GB) |
| Backbones CNN ajustados sobre APTOS (ResNet-50, EfficientNet-B3/B5) | CNN con cabeza softmax o regresion | variable | segun implementacion | variable | no disponible en esta busqueda | multiples implementaciones publicas no verificadas aqui |
| Ensembles ganadores de competiciones tipo APTOS 2019 | combinacion de CNN y preprocesado especifico | no disponible | variable | variable | no disponible | codigo publicado por los equipos, sin verificar aqui |
| Modelos de fundacion retinales (por ejemplo, propuestas tipo RETFound) | transformer o hibrido con preentrenamiento masivo en imagen retinal | cientos de millones | variable | no disponible | no disponible | publicados academicamente, condiciones a verificar |

La ventaja estructural de este modelo frente a alternativas con cabeza softmax es la garantia de consistencia ordinal; su desventaja principal es la ausencia de pesos publicados y de validacion documentada, que impide cualquier comparacion seria.

## Limitaciones y advertencias

- El repositorio figura con un tamano de 0.0 GB y cero descargas, lo que sugiere que los pesos pueden no estar disponibles. Antes de cualquier uso hay que verificar si existe un checkpoint descargable.
- No se publica el valor de QWK ni ninguna otra metrica, por lo que el rendimiento real es desconocido.
- No hay informacion sobre validacion externa en cohortes distintas a APTOS 2019. Los modelos entrenados solo en APTOS suelen degradarse con imagenes de otras camaras, protocolos de captura o poblaciones.
- El dataset APTOS 2019 procede de una campana de cribado en India, con una distribucion demografica y de prevalencia concreta. Es esperable un sesgo de dominio y un posible sesgo etnico o de prevalencia al aplicarlo a otras poblaciones.
- Los datasets de retinopatia diabetica estan fuertemente desbalanceados (muchos mas casos de grado 0 que de grado 4). La model card no indica si se aplico ponderacion por clase, remuestreo o alguna otra correccion, lo que afecta directamente a la sensibilidad en los grados graves.
- CORAL garantiza monotonicidad, no calibracion. Sin datos de calibracion, las probabilidades acumuladas no deben interpretarse como probabilidades clinicas fiables.
- Riesgo de falsos negativos: un grado 0 predicho incorrectamente sobre una retinografia con lesions leves puede retrasar el diagnostico. El modelo no debe usarse como unico criterio de decision.
- No es un producto sanitario. No cuenta con marcado CE ni autorizacion de la FDA, y su uso en diagnostico requiere validacion regulatoria y clinica especifica en cada jurisdiccion.
- La licencia MIT permite uso comercial y modificacion, pero no exime del cumplimiento del RGPD en el tratamiento de imagenes medicas ni de la normativa de productos sanitarios aplicable.
- No aplican los riesgos tipicos de alucinacion de los modelos de lenguaje, pero si el riesgo equivalente de predicciones confiadas y erroneas sobre imagenes fuera de distribucion.
- La fecha de creacion del repositorio (2026-09-10) es posterior a la fecha habitual de publicacion de la ficha, lo que sugiere que el modelo debe tratarse con cautela adicional.
- No hay informacion sobre el preprocesado requerido (recorte de fondo, correccion de iluminacion, normalizacion de color), que en modelos de retina suele ser determinante para el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/mshaiel2004/dr-severity-grading-coral
- Dataset APTOS 2019: no se incluye enlace directo en la informacion proporcionada
- Paper de CORAL (Consistent Rank Logits): no incluido en la informacion proporcionada
- Repositorio de codigo o demo: no disponible
- Otras referencias: la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de un hotel en Alemania, sin ninguna relacion con el contenido de esta ficha)
