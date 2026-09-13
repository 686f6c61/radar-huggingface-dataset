# ShaneXan/MMInfant-HRNet-R90JT

## Resumen

MMInfant-HRNet-R90JT es un checkpoint de PyTorch distribuido por el usuario ShaneXan (repositorio `ShaneXan/MMInfant-HRNet-R90JT`) que contiene los pesos de un modelo HRNet empleado para la extraccion de puntos faciales (facial landmarks) en caras de bebes dentro del proyecto MMInfant. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un regresor de keypoints sobre imagen, basado en la familia HRNet (High-Resolution Network), orientado a una tarea muy concreta de vision por computador.

Segun la propia model card, el checkpoint fue entrenado por los autores de MMInfant siguiendo el procedimiento publico de entrenamiento del proyecto InfAnFace (Universidad Northeastern, grupo de Sarah Ostadabbas), y difiere del checkpoint HRNet-R90JT que distribuye actualmente ese proyecto upstream. La arquitectura subyacente procede del repositorio HRNet Facial Landmark Detection. El repositorio incluye unicamente el archivo de pesos `hrnet-r90jt.pth` y un YAML de configuracion de inferencia (`hrnet-r90jt.yaml`).

La relevancia de esta ficha es limitada pero honesta: se trata de un artefacto de investigacion con cero descargas, cero "likes", sin licencia declarada, sin idiomas, sin metricas publicadas y sin model card detallada. Su interes es acotado a quien necesite reproducir el pipeline de MMInfant o trabajar en deteccion de landmarks faciales en poblacion pediatrica, un dominio donde los modelos entrenados en adultos (p. ej. Dlib o MediaPipe Face Mesh) rinden peor por las diferencias morfologicas de la cara infantil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRNet (High-Resolution Network); variante denominada R90JT, segun el repositorio HRNet Facial Landmark Detection |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision sobre imagen, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye un checkpoint `.pth` |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`.pth`) + fichero YAML de configuracion de inferencia |
| Numero de landmarks de salida | no disponible |
| Tipo de tarea | Regresion de puntos faciales (facial landmark detection), pipeline no declarado en HuggingFace |
| Tamano del repositorio | 0.0 GB segun los metadatos de HuggingFace (probablemente punteros LFS sin descargar) |
| Fecha de creacion (metadatos) | 2026-09-13 |

## Arquitectura y entrenamiento

HRNet es una familia de redes convolucionales que, a diferencia de las arquitecturas encoder-decoder clasicas, mantiene de forma paralela representaciones a varias resoluciones durante todo el forward pass y las fusiona repetidamente (intercambio de informacion entre ramas de alta y baja resolucion). Esta caracteristica es especialmente util en tareas de localizacion precisa de keypoints, ya que conserva alta resolucion espacial hasta las ultimas etapas sin depender de un decodificador que reconstruya detalle. El repositorio de referencia, HRNet Facial Landmark Detection, es la implementacion habitualmente usada para entrenar HRNet sobre datasets de alineacion facial.

En cuanto al entrenamiento, la model card indica que el checkpoint fue entrenado por los autores de MMInfant siguiendo el procedimiento publico de InfAnFace. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset, el numero de landmarks, la resolucion de entrada, el numero de epocas ni funciones de perdida. No se describe ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni tecnicas equivalentes, ya que no es un modelo autorregresivo). No se menciona RLHF ni DPO, algo que no aplica a un modelo de vision discriminativo.

## Capacidades

- Extraccion de puntos faciales (facial landmarks) en imagenes de caras de bebes, que es la unica funcion descrita en la model card.
- Inferencia sobre imagen estatica mediante PyTorch, usando el YAML de configuracion incluido para reconstruir el modelo.
- Integracion como etapa de preprocesado dentro del pipeline de MMInfant (por ejemplo, para alinear o normalizar caras antes de tareas posteriores).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa texto.
- No tiene modo "thinking", ni vision generativa, ni audio, ni generacion de texto o codigo.

## Casos de uso

- Analisis del desarrollo facial infantil en investigacion: extraer landmarks estables en caras de bebes a lo largo de un estudio longitudinal, para medir cambios morfologicos y de expresion con el tiempo. Es adecuado porque el modelo esta entrenado especificamente sobre caras infantiles, donde los detectores entrenados en adultos degradan su precision.
- Preprocesado para reconocimiento o verificacion facial pediatrica: normalizar la pose y el encuadre de la cara antes de alimentar un modelo de identificacion o de seguimiento de identidad en videos de bebes.
- Estudios de expresion emocional y afecto en la primera infancia: los landmarks permiten calcular distancias y angulos entre cejas, ojos y boca, señales clasicas para inferir valencia afectiva y niveles de estres en lactantes.
- Monitorizacion neonatal en unidades de cuidados intensivos: analisis de video para detectar indicadores faciales de dolor o incomodidad, siempre como apoyo a la valoracion clinica y no como sustituto de esta.
- Cribado de posibles anomalias craneofaciales o asimetrias: medicion de simetria y proporciones faciales en cohortes pediatricas para priorizar casos que requieran valoracion especializada.
- Anotacion y pseudo-etiquetado de datasets: usar el checkpoint para generar landmarks automaticos sobre grandes volumenes de imagenes de bebes y despues revisar manualmente solo una fraccion, reduciendo el coste de anotacion.
- Analisis de atencion conjunta y seguimiento de mirada en psicologia del desarrollo: la posicion de ojos y cabeza derivada de los landmarks permite estimar la direccion de mirada en experimentos con lactantes.
- Investigacion en morfologia craneofacial: extraccion de medidas faciales cuantitativas para estudios geneticos o epidemiologicos en poblacion infantil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (NME, AUC, fallo de deteccion, FR), no se declara el dataset de evaluacion y no hay comparaciones con otros checkpoints. Tampoco hay resultados de la busqueda web utilizables: los enlaces devueltos corresponden a servicios de traduccion y no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el numero de parametros ni la resolucion de entrada. Al tratarse de una red convolucional de la familia HRNet, la inferencia por imagen es ligera en comparacion con modelos generativos, pero no hay cifras oficiales.
- GPU recomendadas: no disponible. No hay recomendaciones del autor.
- Viabilidad en GPU de consumo: previsiblemente viable en GPUs de consumo actuales (por ejemplo, gama RTX x060 o superior) dado que HRNet es un modelo convolucional de inferencia por imagen; esta afirmacion es una estimacion razonada por la familia arquitectonica, no un dato confirmado en la informacion disponible.
- Opciones de despliegue: no disponible. El repositorio solo publica PyTorch (`.pth` + `.yaml`); no se mencionan vLLM, llama.cpp, Ollama, TGI ni formatos ONNX/TensorRT. La integracion requeriria cargar el checkpoint en el codigo del repositorio HRNet Facial Landmark Detection o del pipeline MMInfant.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MMInfant-HRNet-R90JT | HRNet para landmarks faciales infantiles | no disponible | imagen (resolucion no disponible) | sin metricas publicadas | no disponible | HuggingFace, 0 descargas |
| Checkpoint HRNet-R90JT upstream (HRNet Facial Landmark Detection) | HRNet para landmarks faciales (orientado a adultos) | no disponible | imagen | no disponible en la informacion proporcionada | segun repositorio original | GitHub del proyecto HRNet |
| Checkpoint distribuido por InfAnFace | Deteccion y seguimiento de landmarks faciales infantiles | no disponible | imagen / video | no disponible en la informacion proporcionada | segun repositorio InfAnFace | GitHub de ostadabbas |
| MediaPipe Face Mesh | Malla facial densa (solucion propietaria de Google) | no disponible | imagen / video en tiempo real | ampliamente evaluado en adultos, no especifico para bebes | propietaria de Google | SDK de MediaPipe |
| Dlib (predictor de 68 puntos) | Regresor clasico de landmarks | no disponible | imagen | entrenado en caras adultas (iBUG 300-W) | licencia permisiva de dlib | biblioteca dlib |

Las filas marcadas como "no disponible" reflejan que la informacion proporcionada no incluye cifras comparables; no se han inventado valores.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia en el repositorio, por lo que el uso comercial queda en un limbo legal. Conviene contactar con el autor o con los responsables de MMInfant antes de cualquier uso en produccion.
- Ausencia total de documentacion tecnica: no se indican parametros, resolucion de entrada, numero de landmarks, ni el protocolo de normalizacion. Solo hay un YAML de configuracion cuya compatibilidad exacta con el checkpoint no se detalla.
- Sin metricas ni validacion publicada: no hay NME, AUC ni tasas de fallo, y el repositorio tiene cero descargas y cero "likes", lo que implica que no ha sido validado por la comunidad.
- Riesgo de sobreajuste al dominio: al estar entrenado sobre imagenes de bebes de un proyecto concreto, el rendimiento puede degradarse con condiciones de iluminacion, resolucion, oclusion, pose extrema o etnia distintas a las del conjunto de entrenamiento. No se documenta la composicion demografica del dataset.
- Sin soporte de lenguaje, texto ni razonamiento: cualquier expectativa de uso como modelo conversacional o agente es inviable por su propia naturaleza.
- Sesgo potencial en poblacion pediatrica: la model card no describe la diversidad del dataset de entrenamiento, por lo que no puede descartarse un sesgo por etnia, edad gestacional o condicion clinica.
- Dependencia de codigo externo: para inferir hay que usar la implementacion de HRNet Facial Landmark Detection o el pipeline MMInfant, no incluidos en el repositorio de HuggingFace.
- Riesgo de confusion de checkpoints: la model card advierte explicitamente de que este checkpoint difiere del que distribuye el proyecto upstream; mezclar pesos y configuraciones puede producir resultados incorrectos.
- Inconsistencia en los metadatos: la fecha de creacion registrada (2026-09-13) y el tamano de repositorio de 0.0 GB sugieren metadatos poco fiables o pesos almacenados como punteros LFS, por lo que conviene verificar manualmente el contenido antes de usarlo.
- Advertencia de uso clinico: cualquier aplicacion en cribado o monitorizacion neonatal debe tratarse como herramienta de investigacion, no como dispositivo medico, y requeriria validacion regulatoria especifica.

## Enlaces

- HuggingFace: https://huggingface.co/ShaneXan/MMInfant-HRNet-R90JT
- Repositorio base de arquitectura, HRNet Facial Landmark Detection: https://github.com/HRNet/HRNet-Facial-Landmark-Detection
- Procedimiento de entrenamiento de referencia, InfAnFace (Infant Facial Landmark Detection and Tracking): https://github.com/ostadabbas/Infant-Facial-Landmark-Detection-and-Tracking
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de traduccion (Google Translate, DeepL, Bing Translator) sin relacion con el repositorio.
