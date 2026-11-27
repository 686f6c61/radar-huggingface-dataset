# phoenixiv6/ScoreVision_RoomDirtiness3999

## Resumen

ScoreVision_RoomDirtiness3999 es un detector de objetos en formato ONNX publicado por el usuario phoenixiv6 en Hugging Face, orientado a la identificacion de suciedad en habitaciones. El modelo forma parte del ecosistema de la subred 44 de Bittensor, conocida como Score, y esta disenado para operar como minero del track publico, sirviendose de la plataforma Chutes para su despliegue. Detecta cinco clases concretas: derrame de liquido, papelera, basura, moho y mancha.

El modelo resuelve una tarea de vision por computador muy especifica: puntuar el grado de suciedad de un espacio interior mediante deteccion de objetos. Su relevancia radica en que ejemplifica el paradigma de mineros de Bittensor para tareas de vision, donde el rendimiento se evalua con una metrica compuesta (0,6·mAP50 + 0,4·false_positive) y un limite de latencia p95 de 100 ms. El repositorio tiene un tamano de 0,0 GB, lo que sugiere que los pesos no estan publicados o son de muy baja resolucion.

La informacion disponible es escasa: no se especifican la arquitectura base, el numero de parametros, la licencia ni los idiomas. La model card se limita a describir el contrato de despliegue (miner.py, weights.onnx, chute_config.yml) y las clases detectadas. No se han publicado resultados de benchmarks mas alla de la metrica de scoring de la subred.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos ONNX; backbone no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; precision no especificada) |
| Idiomas soportados | no disponible (no aplica, tarea de vision) |
| Licencia | no disponible |
| Formato de pesos | ONNX (weights.onnx) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del backbone, el numero de parametros ni el proceso de entrenamiento. La model card indica unicamente que el modelo se sirve mediante onnxruntime, OpenCV y NumPy, lo que confirma que es un detector de objetos exportado a ONNX. El repositorio incluye un script miner.py con la clase Miner que carga la plantilla de Chutes de la subred Score, un fichero weights.onnx con el detector (sha256 5e9e667258aa7819…) y un chute_config.yml que define la imagen y el nodo de Chutes.

No se documentan datos de entrenamiento, numero de tokens (no aplica), composicion del dataset, ni tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion operativa es el esquema de evaluacion: el modelo se puntua con 0,6·mAP50 + 0,4·false_positive y un limite de latencia p95 de 100 ms.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: derrame de liquido (id 0), papelera (id 1), basura (id 2), moho (id 3) y mancha (id 4).
- Inferencia en formato ONNX mediante onnxruntime, con dependencias minimas (OpenCV y NumPy).
- Integracion como minero del track publico de la subred 44 de Bittensor (Score) a traves de la plataforma Chutes.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, multilingue, thinking mode, audio ni vision mas alla de la deteccion de las cinco clases indicadas.

## Casos de uso

- Evaluacion automatizada de limpieza en alojamientos turisticos: el detector puede procesar fotografias de habitaciones y senalar la presencia de basura, manchas o moho para verificar el estado antes de la entrada de huespedes.
- Auditoria de mantenimiento en instalaciones: integrado en un pipeline de captura periodica de imagenes, permite detectar derrames de liquido o manchas en suelos y superficies para priorizar tareas de limpieza.
- Control de calidad en cadenas de hosteleria: el modelo puede puntuar el grado de suciedad de una sala mediante la deteccion de las cinco clases y alimentar un panel de seguimiento por establecimiento.
- Mineria en la subred 44 de Bittensor: el modelo se despliega como minero del track publico de Score en Chutes, compitiendo por la metrica 0,6·mAP50 + 0,4·false_positive con latencia p95 inferior a 100 ms.
- Prototipado de sistemas de vision para inspeccion de interiores: al estar en ONNX y requerir solo onnxruntime, OpenCV y NumPy, sirve como base para experimentar con deteccion de suciedad en entornos de desarrollo con recursos limitados.
- Investigacion sobre metricas de scoring en subredes descentralizadas: el modelo permite estudiar como se comporta un detector de cinco clases bajo una metrica compuesta que penaliza falsos positivos y exige latencia acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del repositorio es de 0,0 GB y no se especifica el tamano de los pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser un modelo ONNX con dependencias minimas, es probable que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: onnxruntime (segun la model card), con OpenCV y NumPy; despliegue gestionado en Chutes mediante chute_config.yml.
- Latencia y throughput estimados: el scoring de la subred impone un limite de latencia p95 de 100 ms, pero no se publican valores medidos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (deteccion de suciedad en interiores con cinco clases en ONNX) ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion muy escasa: no se documentan arquitectura, parametros, licencia ni proceso de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- El repositorio tiene un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar publicados o ser de muy baja resolucion; conviene verificar la integridad de weights.onnx antes de usarlo.
- Riesgo de alucinacion y sesgos: no documentados; al ser un detector de cinco clases muy especificas, es probable que generalice mal fuera del dominio de interiores y de las condiciones de entrenamiento.
- Limitacion de clases: solo detecta cinco categorias (derrame de liquido, papelera, basura, moho y mancha); no cubre otros tipos de suciedad ni tareas de segmentacion o clasificacion global.
- Dependencia de la infraestructura de Bittensor y Chutes: el diseno esta orientado al track publico de la subred 44, con una metrica y un limite de latencia concretos (p95 de 100 ms) que condicionan su uso fuera de ese entorno.
- Sin datos de benchmarks ni de latencia medidos: no es posible verificar el cumplimiento del limite de 100 ms ni el rendimiento real en mAP50.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phoenixiv6/ScoreVision_RoomDirtiness3999
- Subred Score (Bittensor subnet 44): no disponible en la informacion proporcionada
- Plataforma Chutes: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
