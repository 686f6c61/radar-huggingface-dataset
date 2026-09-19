# AwareLiquid/Sparse-SNN

## Resumen

Sparse-SNN es un par de clasificadores de imagenes basados en redes neuronales de impulsos (spiking neural networks, SNN) dispersas, cuyo patron de conectividad estructural se deriva de las leyes estadisticas del conectoma real de *Drosophila melanogaster*. Lo publica el autor AwareLiquid junto con el codigo en el repositorio `AwareLiquid/human-brain-simulation`. El problema que aborda es el coste energetico de la inferencia: al sustituir las multiplicaciones de matriz densas por operaciones evento-disparadas (sumas), el autor estima un ahorro de energia de uno a dos ordenes de magnitud respecto a un MLP denso, manteniendo una precision casi identica.

La arquitectura es un perceptron multicapa de tres capas (`784 -> 800 -> 10`) con una densidad de conexiones declarada del 5%, neuronas LIF (leaky integrate-and-fire) y entrenamiento por gradiente sustituto (straight-through estimator con gradiente sigmoide). Incluye dos checkpoints entrenados: uno para MNIST (96,83% de exactitud en test, tasa de disparo del 7,9%) y otro para Fashion-MNIST (87,07%, tasa del 8,2%).

Es relevante ahora como evidencia empirica negativa y positiva a la vez: el autor documenta que la topologia estatica del conectoma MaleCNS no aporta ventaja medible frente a grafos aleatorios o estructurados, y que solo sus leyes estadisticas (escasez, distribucion de grado de cola larga, small-worldness, ratio excitatorio/inhibitorio 60/40) se transfieren de forma util. Se trata de un modelo de investigacion, sin descargas ni likes registrados y sin benchmarks publicados mas alla de MNIST y Fashion-MNIST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de impulsos (SNN) totalmente conectado y enmascarado: `784 -> 800 -> 10`, neuronas LIF, densidad de conexiones declarada del 5%, matriz de signos excitatorio/inhibitorio (E/I 60/40) |
| Parametros totales | No disponible de forma explicita. Derivado del diseno publicado: 627.200 conexiones potenciales en la capa oculta y 8.000 en la de salida; al 5% de densidad resultan aproximadamente 31.760 conexiones efectivas (equivalente denso: 635.200) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. El modelo no es autorregresivo ni procesa secuencias de texto: su entrada es un vector plano de 784 valores (28x28 en escala de grises, rango [0, 1]) y tiene T pasos temporales de dinamica LIF, cuyo valor concreto no se publica en la model card |
| Tipos de cuantizacion | No disponible. No se documentan variantes cuantizadas, GGUF ni versiones de precision reducida; los checkpoints se distribuyen tal cual |
| Idiomas soportados | No disponible / no aplica. El modelo produce etiquetas de clase numericas (10 clases), no texto |
| Licencia | MIT, segun la seccion License de la model card. El metadato de HuggingFace figura como "no disponible". Los datos del conectoma MaleCNS son CC-BY 4.0 (HHMI Janelia / Cambridge / Google Research) y no se redistribuyen en el repositorio |
| Formato de pesos | Checkpoints de PyTorch (`.pt`) con `state_dict` (pesos mas buffer de mascara), matriz de signos E/I, configuracion completa y metricas. No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es una SNN dispersa de alimentacion directa con dinamica LIF y tres capas. La propagacion se restringe mediante una mascara binaria fija que define que conexiones existen; el entrenamiento usa gradiente sustituto con estimador straight-through y gradiente sigmoide, una tecnica habitual para sortear la no diferenciabilidad del disparo. Cada checkpoint almacena la mascara, la matriz de signos (que fija si una conexion es excitatoria o inhibitoria, con proporcion 60/40) y la configuracion (`in_dim`, `hid_dim`, `out_dim`, `T`, `decay`, `threshold`). La mascara se genera con una semilla fija (`mask_seed=0`), por lo que la estructura es reproducible reejecutando el codigo del repositorio.

El elemento distintivo es el origen de la estructura. El autor extrajo del conectoma MaleCNS de la mosca de la fruta cuatro propiedades estadisticas: escasez del 0,09%, distribucion de grado de cola larga con caracter scale-free (relacion maximo/media aproximada de 75), fuerte caracter small-world (clustering 6,65 veces el de un grafo aleatorio y longitud de camino 2,39) y ratio E/I de 60/40. Sin embargo, el propio autor documenta que la topologia estatica del conectoma, evaluada en cinco experimentos (clasificacion, tareas temporales, robustez, eficiencia de muestreo y plasticidad), no mostro ventaja medible frente a grafos aleatorios o estructurados. El modelo entrenable se construye a partir de las leyes estadisticas, no de la topologia literal. No se especifican en la model card el numero de tokens o ejemplos vistos, la composicion exacta del dataset mas alla de MNIST y Fashion-MNIST, ni si hubo fases de RLHF o DPO (no aplicables a una tarea de clasificacion).

## Capacidades

- Clasificacion de imagenes de 28x28 en escala de grises, con entrada aplanada a 784 valores en el rango [0, 1].
- Clasificacion de digitos manuscritos (10 clases) mediante el checkpoint `sparse_snn_mnist.pt`, con 96,83% de exactitud en test.
- Clasificacion de prendas de vestir (10 clases) mediante el checkpoint `sparse_snn_fashion.pt`, con 87,07% de exactitud en test.
- Computo evento-disparado con tasa de disparo baja (7,9% en MNIST y 8,2% en Fashion-MNIST), lo que habilita estimaciones de ahorro energetico basadas en operaciones de suma en lugar de MAC.
- Estructura de conectividad dispersa reutilizable: la mascara y la matriz de signos E/I pueden exportarse para experimentos de poda estructural o de topologia en otras redes.
- Reproducibilidad verificada: el autor indica que la recarga de los checkpoints reproduce la exactitud guardada bit a bit (0,9683 y 0,8707 respectivamente).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general (solo 28x28 monocroma), tool calling, function calling, capacidades de agente, multi-step reasoning ni capacidades multilingues. Estas funciones no forman parte del diseno del modelo.

## Casos de uso

- Digitalizacion documental y OCR de bajo consumo: el checkpoint de MNIST puede emplearse como clasificador de digitos manuscritos aislados en un pipeline de lectura de formularios, con la ventaja de que la inferencia evento-disparada reduce el coste energetico en dispositivos sin GPU.
- Inventario y retail automatizado: el checkpoint de Fashion-MNIST sirve como modulo de clasificacion de prendas en prototipos de catalogacion, dado que la tarea de 10 clases coincide con las taxonomias tipicas de producto.
- Investigacion en computacion neuromorfica: es un banco de pruebas pequeno y reproducible para estudiar gradiente sustituto, dinamica LIF y comportamiento de mascaras dispersas antes de escalar a redes mayores o a hardware neuromorfico.
- Experimentos de poda estructural: la mascara y la matriz E/I permiten transferir un patron de conectividad disperso a otras arquitecturas y medir el impacto en exactitud, muestreo y robustez, replicando la metodologia de ablacion documentada por el autor.
- Docencia y formacion tecnica: al ser un modelo de pocas decenas de miles de conexiones y codigo autocontenido, resulta adecuado para explicar en clase como se entrena una SNN con gradiente sustituto y como se calcula el ahorro energetico segun el modelo CMOS de 45 nm de Horowitz.
- Deteccion de anomalias en inspeccion industrial con imagenes de baja resolucion: usando Fashion-MNIST como aproximacion, el modelo puede actuar como discriminador ligero en sensores de vision embebidos donde el presupuesto de energia es la restriccion principal.
- Seleccion de estructuras dispersas para despliegue en edge: los ratios de escasez y las leyes de grado extraidas del conectoma pueden emplearse como heuristica para generar mascaras en modelos mayores destinados a microcontroladores.

## Benchmarks y rendimiento

| Tarea | MLP denso (documentado por el autor) | Sparse-SNN (este checkpoint) | Diferencia | Ahorro energetico estimado |
|---|---|---|---|---|
| MNIST | 98,32% | 96,83% | 1,5 puntos | ~112x |
| Fashion-MNIST | 87,56% | 87,07% | 0,5 puntos | ~107x |

| Metrica adicional | MNIST | Fashion-MNIST |
|---|---|---|
| Tasa de disparo medida | 7,9% | 8,2% |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estas dos tareas. El ahorro energetico citado procede de un modelo analitico CMOS de 45 nm (Horowitz 2014: MAC = 3,7 pJ, suma = 0,9 pJ) combinado con la tasa de disparo medida; el propio autor advierte que es una estimacion basada en modelo, no una medicion sobre hardware, y que el rango declarado en el proyecto completo es de 105 a 106x. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio completo se reporta con 0,0 GB, por lo que los checkpoints son muy pequenos; con unas 31.760 conexiones efectivas y entradas de 784 valores, la huella es de kilobytes a pocos megabytes y la inferencia puede ejecutarse integramente en CPU.
- GPU recomendadas: no se documentan requisitos. Cualquier GPU consumer permite la inferencia con holgura; no se necesita A100, H100 ni VRAM de centro de datos. El entrenamiento desde cero de un modelo de este tamano tambien es viable en una GPU consumer, aunque el autor no publica tiempos.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, e incluso sin GPU. La restriccion real no es la memoria sino disponer del codigo del modelo.
- Opciones de despliegue: solo PyTorch, cargando el modelo con la clase `SparseSNN` del repositorio `AwareLiquid/human-brain-simulation`. No hay soporte de vLLM, TGI, llama.cpp u Ollama, ni pesos en GGUF, porque no es un modelo de lenguaje. No se documenta exportacion a ONNX, TorchScript ni a runtimes neuromorficos.
- Latencia y throughput estimados: no disponible. La inferencia es evento-disparada y escalada con T pasos temporales, pero el valor de T no se publica en la model card (esta en el campo `config` de cada checkpoint). Tampoco se publican mediciones sobre hardware neuromorfico real.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos comparables en la documentacion proporcionada. La unica referencia de comparacion publicada por el autor es el MLP denso usado como linea base:

| Modelo | Tarea | Parametros / densidad | Contexto | Exactitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sparse-SNN (MNIST) | Clasificacion de digitos | ~784 -> 800 -> 10 al 5% de densidad | No aplica (entrada 784) | 96,83% | MIT (segun model card) | HuggingFace, requiere codigo externo |
| Sparse-SNN (Fashion-MNIST) | Clasificacion de prendas | ~784 -> 800 -> 10 al 5% de densidad | No aplica (entrada 784) | 87,07% | MIT (segun model card) | HuggingFace, requiere codigo externo |
| MLP denso (baseline del autor) | Clasificacion de digitos / prendas | 635.200 conexiones densas | No aplica | 98,32% / 87,56% | No disponible | No disponible |

No se dispone de comparaciones con otras SNN publicas (por ejemplo, variantes convertidas o entrenadas con BPTT) en la informacion facilitada.

## Limitaciones y advertencias

- La brecha de exactitud frente a un MLP denso es pequena pero real: 1,5 puntos en MNIST y 0,5 puntos en Fashion-MNIST. El autor la describe como "casi sin perdida", no como sin perdida.
- El ahorro energetico de 105-112x es una estimacion analitica con un modelo CMOS de 45 nm, no una medicion sobre hardware neuromorfico. No debe citarse como resultado experimental de consumo.
- La topologia estatica del conectoma MaleCNS no aporto ventaja medible frente a grafos aleatorios en los cinco experimentos documentados. Atribuir el resultado a "copiar el cerebro de la mosca" seria incorrecto segun el propio autor.
- Existe una discrepancia declarada entre la escasez del conectoma (0,09%) y la densidad efectiva del modelo (5%); la model card no explica esa diferencia.
- El entrenamiento de SNN recurrentes sigue siendo un problema abierto en esta linea: el autor indica que sMNIST desde cero alcanza solo en torno al 70%, y que los metodos de conversion mejoran la exactitud pero pierden eficiencia.
- Entrada restringida a 28x28 en escala de grises, aplanada y normalizada a [0, 1]. No hay soporte para color, resoluciones mayores ni otras modalidades.
- El modelo no genera texto ni mantiene conversaciones, por lo que el riesgo de alucinacion en el sentido de los LLM no aplica; el riesgo equivalente es la clasificacion erronea, especialmente ante imagenes fuera de distribucion respecto a MNIST o Fashion-MNIST.
- La mascara depende de una semilla fija (`mask_seed=0`). Cambiarla produce estructuras distintas y, presumiblemente, resultados distintos.
- El uso requiere cargar codigo Python de un repositorio externo con `weights_only=False`, lo que introduce un riesgo de seguridad al deserializar el checkpoint fuera de entornos de confianza.
- La licencia figura como MIT en la model card pero como "no disponible" en el metadato de HuggingFace. Conviene verificar la licencia antes de un uso comercial. Los datos del conectoma no se redistribuyen y estan sujetos a CC-BY 4.0.
- Adopcion nula registrada: 0 descargas y 0 likes. Sin comunidad que valide los resultados ni mantenimiento demostrado. No esta pensado para produccion critica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwareLiquid/Sparse-SNN
- Codigo y informe completo de experimentos: https://github.com/AwareLiquid/human-brain-simulation
- Proyecto relacionado M1 (arquitectura liquida MT-LNN): https://github.com/AwareLiquid/M1
- Sitio del autor con benchmarks y retractaciones: https://awareliquid.ai
- Datos del conectoma MaleCNS: https://male-cns.janelia.org
- Referencia del modelo energetico CMOS citado (Horowitz 2014): no disponible como enlace directo en la informacion facilitada.
