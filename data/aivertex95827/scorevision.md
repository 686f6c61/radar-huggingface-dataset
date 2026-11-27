# aivertex95827/Scorevision

## Resumen

Scorevision es un detector de objetos en formato ONNX publicado por el usuario aivertex95827 en Hugging Face, concebido como minero del track público de Score, la subred 44 de Bittensor. El modelo resuelve una tarea muy concreta: la deteccion de suciedad y desperfectos en habitaciones, con cinco clases cerradas (derrame de liquidos, papelera, basura, moho y mancha). Su relevancia no reside en la arquitectura ni en el volumen de parametros, sino en su rol dentro de un mercado descentralizado de inferencia: el modelo se sirve en Chutes y se evalua mediante una metrica compuesta que prima tanto la precision de deteccion como la tasa de falsos positivos.

La publicacion es minima: el repositorio ocupa 0.0 GB, no declara licencia, no declara idiomas y no incluye resultados de benchmarks. La model card describe unicamente los artefactos que acompanan al detector (`miner.py` con la clase `Miner` que carga la plantilla de chute de Score, `weights.onnx` con el detector y `chute_config.yml` con la imagen y el nodo de Chutes) y la funcion de puntuacion empleada por la subred.

Se trata, por tanto, de un artefacto de inferencia orientado a produccion en un contexto de mineria de subred, no de un modelo fundacional ni de un modelo de proposito general. Cualquier evaluacion debe hacerse con esa expectativa: un detector de objetos de dominio restringido, exportado a ONNX, con restricciones estrictas de latencia (p95 de 100 ms) y una metrica de calidad definida por el protocolo de la subred.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; la model card no especifica la familia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye unicamente el artefacto `weights.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica al tratarse de vision; las etiquetas de clase estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del detector. Lo unico documentado es que se distribuye como grafo ONNX y que la clase `Miner` lo carga exclusivamente con onnxruntime, OpenCV y NumPy, lo que implica que la inferencia se ejecuta sobre CPU o GPU a traves del runtime de ONNX sin dependencias de frameworks de deep learning pesados. No se detalla si el detector subyacente es de una etapa (tipo YOLO o similar) o de dos etapas, ni la resolucion de entrada, ni el numero de parametros.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de imagenes, la composicion del dataset, el proceso de anotacion ni si se aplicaron tecnicas de aumento de datos. No consta que se haya empleado RLHF, DPO ni ningun otro proceso de alineacion, algo esperable en un detector de objetos. La innovacion tecnica destacable no esta en el modelo sino en su empaquetado: exportacion a ONNX para portabilidad y despliegue en Chutes, con un limite de latencia p95 de 100 ms impuesto por el protocolo de la subred.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases cerradas: derrame de liquidos (clase 0), papelera (clase 1), basura (clase 2), moho (clase 3) y mancha (clase 4).
- Inferencia via onnxruntime con dependencias minimas (OpenCV y NumPy), lo que facilita su despliegue en entornos contenedorizados.
- Servicio como minero del track publico de Score (subred 44 de Bittensor) a traves de la plantilla de chute de Chutes.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente, modo thinking, audio ni funcionalidades multilingues.

## Casos de uso

- Inspeccion automatizada de limpieza en alojamientos turisticos: el detector puede procesar fotografias de habitaciones al finalizar la limpieza y senalar la presencia de manchas, moho o basura residual, permitiendo validar el trabajo antes de la entrega de llaves.
- Control de calidad en cadenas de hosteleria: integrado en un pipeline de captura de imagenes por turno, permite generar alertas cuando se detectan derrames o papeleras desbordadas en zonas comunes.
- Mantenimiento preventivo de instalaciones: la deteccion de moho (clase 3) en banos y zonas humedas sirve como senal temprana para activar protocolos de tratamiento y evitar deterioro estructural.
- Mineria en la subred 44 de Bittensor: el modelo puede desplegarse como minero en Chutes y competir en la metrica de la subred, que combina 0.6 de mAP50 y 0.4 de tasa de falsos positivos con un limite de latencia p95 de 100 ms.
- Auditoria de estado de inmuebles en alquiler: la deteccion de manchas y basura en fotografias de inventario permite documentar el estado previo y posterior a una estancia, reduciendo disputas sobre fianzas.
- Clasificacion previa en pipelines de vision industrial ligera: al ser un artefacto ONNX con dependencias minimas, puede incrustarse en dispositivos de borde para prefiltrar imagenes antes de enviarlas a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente define la funcion de puntuacion de la subred (0.6·mAP50 + 0.4·tasa de falsos positivos, con limite de latencia p95 de 100 ms), pero no aporta valores numericos obtenidos por este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no documentarse el numero de parametros ni la resolucion de entrada, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponibles. El modelo se sirve en Chutes, cuya configuracion de nodo e imagen se declara en `chute_config.yml`, pero el contenido de ese fichero no se detalla en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Al ejecutarse via onnxruntime, es plausible su despliegue en CPU y en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: onnxruntime (documentado), OpenCV y NumPy como dependencias; despliegue gestionado en Chutes mediante la plantilla de Score. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: el protocolo de la subred impone un limite de p95 de 100 ms por inferencia; no se publican valores medidos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (detectores de objetos de dominio especifico para suciedad en interiores) ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset de entrenamiento, se desconoce la distribucion de imagenes (tipos de habitacion, iluminacion, geografia) y el posible sesgo asociado.
- Riesgo de alucinacion: en deteccion de objetos se traduce en falsos positivos, metrica que la subred penaliza explicitamente con un peso de 0.4 en la puntuacion final.
- Limitaciones de contexto e idioma: el modelo opera sobre un conjunto cerrado de cinco clases y no admite prompts ni instrucciones en lenguaje natural; las etiquetas estan en ingles y no se declaran idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse permiso para uso comercial, redistribucion ni modificacion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, y su tamano declarado es de 0.0 GB, lo que sugiere un artefacto muy ligero o una publicacion incompleta. La ausencia de benchmarks, de documentacion de arquitectura y de licencia limita seriamente su evaluacion previa a un despliegue.
- Dependencia de infraestructura: el modelo esta disenado para el ecosistema Score/Chutes/Bittensor; fuera de ese contexto, su utilidad queda reducida a la de un detector ONNX de dominio especifico sin garantias documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aivertex95827/Scorevision
- Score (subred 44 de Bittensor): no disponible en la informacion proporcionada
- Chutes: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
