# Koushik-Katkam/kucet-frs-face-recognition

## Resumen

KUCET FRS V7.1 es un modelo de reconocimiento facial desarrollado por Koushik-Katkam en el Kakatiya University College of Engineering & Technology (KUCET) de Warangal (India), orientado a extraccion de caracteristicas biometricas para control de asistencia. El modelo implementa aprendizaje metrico facial profundo sobre la hiperesfera S^127, es decir, proyecta cada rostro a un vector unitario de 128 dimensiones donde la distancia coseno refleja similitud de identidad. Se distribuye en formato ONNX con licencia MIT y un unico idioma declarado (ingles).

La arquitectura combina un extractor convolucional de caracteristicas de alto rendimiento con una funcion de perdida ArcFace (Additive Angular Margin Loss) configurada con escala s=30.0 y margen angular m=0.35. La entrada es una imagen RGB de 112x112 normalizada al rango [-1.0, 1.0] y la salida es un embedding de 128 dimensiones con norma L2 unitaria. El entrenamiento se realizo durante 5000 pasos sobre dos GPUs Tesla T4 en Kaggle.

El modelo resulta relevante para despliegues de biometria ligera y embebida: el formato ONNX, el tamano reducido del repositorio y la dimensionalidad compacta del embedding (128-D) permiten integrarlo en sistemas de control de acceso o asistencia sin infraestructura GPU dedicada. La model card declara conformidad con la DPDP Act 2023 de India en materia de retencion biometrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extractor convolucional de caracteristicas + ArcFace (aprendizaje metrico en S^127) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 112x112 RGB) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional que actua como extractor de caracteristicas faciales y se entrena con una cabeza de clasificacion supervisada mediante ArcFace. La perdida ArcFace aplica un margen angular aditivo (m=0.35) sobre el angulo entre el embedding y el centroide de clase, con un factor de escala s=30.0. El resultado es un espacio de embedding de 128 dimensiones sobre la hiperesfera unidad, donde rostros de la misma identidad quedan agrupados y rostros distintos separados por un margen angular. La resolucion de entrada es 112x112 RGB, un estandar habitual en pipelines de reconocimiento facial (compatible con el preprocesado tipico de modelos tipo ArcFace).

El entrenamiento se ejecuto durante 5000 pasos sobre dos GPUs Tesla T4 en Kaggle. La model card no detalla el volumen ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de aumento de datos, destilacion o refinamiento posterior. La verificacion reportada incluye una similitud media entre muestras genuinas de 1.0000, una similitud media entre impostores de 0.0560 y un margen de separacion (Delta s) de 0.9440, con un umbral calibrado (tau) de 0.363. Estos valores deben interpretarse con cautela: una similitud genuina de 1.0000 sugiere una evaluacion sobre un conjunto muy limitado o potencialmente solapado con el entrenamiento, y no se documenta el tamano del conjunto de validacion.

## Capacidades

- Extraccion de embeddings faciales de 128 dimensiones con norma L2 unitaria a partir de imagenes RGB de 112x112.
- Verificacion de identidad 1:1 mediante comparacion de similitud coseno entre embeddings, con umbral calibrado de 0.363.
- Identificacion 1:N mediante busqueda de vecino mas cercano en el espacio de embeddings.
- Aprendizaje metrico con separacion angular controlada (margen de 0.9440 reportado entre genuinos e impostores).
- Inferencia via ONNX Runtime, compatible con despliegue en CPU y GPU sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multimodales mas alla del procesamiento de imagen facial.
- Sin soporte multilingue: el modelo no procesa lenguaje, solo imagenes.

## Casos de uso

- Control de asistencia biometrica: el modelo genera un embedding por alumno o empleado y compara contra una base de vectores registrados; el umbral tau=0.363 permite decidir si la coincidencia es valida. Adecuado por su baja dimensionalidad y formato ONNX.
- Verificacion de identidad en acceso a instalaciones: integrado en un lector de tarjeta o terminal con camara, el modelo compara en tiempo real el rostro capturado con el embedding almacenado en la credencial.
- Autenticacion en aplicaciones de escritorio o moviles: el ONNX puede ejecutarse en CPU sin GPU, lo que permite validacion local sin enviar imagenes a un servidor.
- Deduplicacion de registros biometricos: al proyectar rostros a un espacio metrico, se pueden detectar registros duplicados de la misma persona comparando similitudes por encima del umbral.
- Kiosco de registro de personal: captura de imagen, extraccion de embedding y almacenamiento del vector en lugar de la fotografia, alineado con la politica de retencion de la DPDP Act 2023 declarada por el autor.
- Pipeline de investigacion en biometria: servir como baseline ligero para experimentos de verificacion facial o para comparar estrategias de umbralizacion y calibracion en entornos academicos.
- Integracion en sistemas de videovigilancia con post-procesado: extraccion por lotes de embeddings de fotogramas y comparacion contra una galeria de referencia, siempre que se cumplan los requisitos legales de consentimiento.

## Benchmarks y rendimiento

La model card no reporta resultados sobre benchmarks estandar de reconocimiento facial (LFW, CFP-FP, AgeDB, IJB-C, etc.). Los unicos datos de rendimiento publicados son las metricas de verificacion internas del autor:

| Metrica | Valor reportado |
|---|---|
| Similitud media entre genuinos | 1.0000 |
| Similitud media entre impostores | 0.0560 |
| Margen de separacion (Delta s) | 0.9440 |
| Umbral calibrado (tau) | 0.363 |

No se especifica el tamano ni la composicion del conjunto de evaluacion, por lo que estos valores no son directamente comparables con resultados publicados en benchmarks academicos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es un extractor convolucional con salida de 128 dimensiones y entrada de 112x112, por lo que cabe holgadamente en cualquier GPU consumer. No se dispone del numero exacto de parametros.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT), incluidas Tesla T4, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas.
- Despliegue en CPU: viable mediante ONNX Runtime, lo que permite ejecucion en dispositivos edge, Raspberry Pi o servidores sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/TensorRT), OpenVINO, integracion en servicios Python via `onnxruntime` u `onnxruntime-gpu`. No se distribuyen pesos en formato GGUF ni safetensors, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Entrada | Licencia | Formato | Contexto/uso |
|---|---|---|---|---|---|---|
| KUCET FRS V7.1 | no disponible | 128-D | 112x112 RGB | MIT | ONNX | Reconocimiento facial biometrico |
| ArcFace (InsightFace, referencia) | ~24M-65M segun backbone (no confirmado para este modelo) | 512-D | 112x112 RGB | MIT (InsightFace) | ONNX/PyTorch | Reconocimiento facial general |
| FaceNet | ~23M (Inception-ResNet-v1, referencia) | 128-D / 512-D | 160x160 RGB | Apache 2.0 (implementaciones) | TensorFlow/ONNX | Verificacion facial |
| Dlib face recognition | ~7M (ResNet-34, referencia) | 128-D | 150x150 RGB | Boost | C++/Python | Reconocimiento facial ligero |

Nota: los datos de parametros y dimensiones de los modelos comparativos son valores de referencia de la literatura y no se han verificado contra las versiones concretas disponibles en el momento de redactar esta ficha. No se dispone de comparaciones de rendimiento directas entre KUCET FRS V7.1 y estos modelos.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento: se desconoce la demografia, el tamano y la diversidad, lo que impide evaluar sesgos por edad, genero, etnia o condiciones de iluminacion.
- La similitud media entre genuinos de 1.0000 es sospechosamente alta y sugiere una evaluacion sobre un conjunto muy pequeno o con solapamiento respecto al entrenamiento; no debe tomarse como evidencia de rendimiento en produccion.
- El umbral tau=0.363 esta calibrado sobre un conjunto no documentado; en produccion deberia recalibrarse con datos propios del dominio de despliegue.
- El modelo solo declara soporte de ingles, aunque al ser un modelo de vision el idioma es practicamente irrelevante; la limitacion real es la ausencia de documentacion sobre condiciones de captura.
- Riesgo de falsos positivos en identificacion 1:N con galerias grandes: la dimensionalidad de 128-D es mas compacta que los 512-D habituales en ArcFace, lo que puede reducir la discriminacion en poblaciones amplias.
- Restricciones legales: el reconocimiento facial biometrico esta sujeto al RGPD en la UE y a la DPDP Act 2023 en India; se requiere base legal, consentimiento explicito y evaluacion de impacto. La licencia MIT cubre el codigo y los pesos, pero no exime del cumplimiento normativo.
- No se especifican medidas de proteccion contra ataques de presentacion (foto impresa, pantalla, mascara); el modelo no incorpora deteccion de vivacidad.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion independiente por parte de la comunidad.
- La fecha de creacion indicada (2026-11-10) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Koushik-Katkam/kucet-frs-face-recognition
- Paper de referencia ArcFace (Additive Angular Margin Loss): https://arxiv.org/abs/1801.07698
- InsightFace (implementacion de referencia): https://github.com/deepinsight/insightface
- ONNX Runtime: https://onnxruntime.ai/
- DPDP Act 2023 (India): https://www.meity.gov.in/data-protection-framework
