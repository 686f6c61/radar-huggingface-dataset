# SidraBhatti/kd-gat-can-intrusion-detection

## Resumen

KD-GAT es un sistema de deteccion de intrusiones (IDS) para el bus Controller Area Network (CAN), el protocolo que utilizan practicamente todas las ECU de un vehiculo y que carece de mecanismos de seguridad integrados. Lo desarrolla el OSU Center for Automotive Research (Mobility Systems Lab) de la Universidad Estatal de Ohio, con Robert Frenken como autor principal e implementador, Sidra Ghayour Bhatti en rol de supervision metodologica, Hanqin Zhang como coautor y Qadeer Ahmed como investigador principal. La propuesta combina Graph Attention Networks (GAT) con destilacion de conocimiento: se entrena un modelo profesor de 4.999.426 parametros y se destila en un estudiante de 316.034 parametros, un 6,32 % del tamano del profesor, apto para inferencia en tiempo real en hardware embarcado con recursos limitados.

El problema que resuelve es la deteccion de ataques en el bus CAN (denegacion de servicio, fuzzing, suplantacion de RPM y de marcha) a partir de una representacion en grafo del trafico. Cada ventana deslizante de mensajes CAN se convierte en un grafo cuyos nodos son los identificadores CAN unicos observados y cuyas aristas conectan pares de identificadores que aparecen de forma secuencial, ponderadas por su frecuencia de coocurrencia. El modelo clasifica cada grafo como benigno o ataque.

El trabajo es relevante ahora porque aborda dos requisitos habituales de la automocion moderna: la deteccion en el propio vehiculo (no en la nube) y un coste computacional compatible con ECUs restringidas. Se evalua sobre tres benchmarks publicos (Car-Hacking, Car-Survival y can-train-and-test), y el articulo documenta explicitamente el problema abierto del desbalance de clases extremo (de 36:1 a 927:1) en el tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Attention Network (GAT) multicabeza con agregacion jumping-knowledge (JK) basada en LSTM, pooling global de media y cabeza de clasificacion totalmente conectada (GATWithJK) |
| Parametros totales | 4.999.426 (profesor) / 316.034 (estudiante, 6,32 % del profesor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas deslizantes de mensajes CAN cuyo tamano no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (la reduccion de tamano se logra mediante destilacion de conocimiento, no mediante cuantizacion) |
| Idiomas soportados | no disponible / no aplica (procesa trafico CAN estructurado, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB y la informacion no detalla el formato de los pesos publicados) |
| Tarea | Clasificacion binaria por grafo: benigno (0) frente a ataque (1) |
| Entrada | Grafo por ventana deslizante: nodos = identificadores CAN unicos, con vector de caracteristicas de 10 dimensiones por nodo (medias de valores de payload + recuento de ocurrencias); aristas = pares de identificadores secuenciales ponderados por coocurrencia |
| Capas GAT | 5 en el profesor, 2 en el estudiante |
| Cabezas de atencion | 8 en el profesor, 4 en el estudiante |
| Canales ocultos | 32 en ambos |
| Datasets de evaluacion | Car-Hacking, Car-Survival, can-train-and-test |
| Fecha de publicacion en HuggingFace | 12 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

Ambos modelos comparten el mismo bloque arquitectonico (GATWithJK): apilamiento de capas GAT multicabeza, agregacion jumping-knowledge sobre las salidas de todas las capas implementada con LSTM, pooling global de media y una cabeza de clasificacion con tres capas lineales. El profesor usa 5 capas GAT y 8 cabezas de atencion; el estudiante, 2 capas y 4 cabezas, manteniendo 32 canales ocultos en ambos casos. La unica diferencia funcional relevante esta en la funcion de perdida: el profesor se entrena con entropia cruzada binaria (BCE), mientras que el estudiante combina BCE sobre etiquetas duras con divergencia KL sobre los logits suavizados del profesor.

El entrenamiento del estudiante es en dos etapas. Primero se realiza un calentamiento solo con BCE (etiquetas duras). Despues se ajusta con una perdida mixta que combina la perdida de tarea propia con la perdida de destilacion por divergencia KL con temperatura tau = 2,0: L_total = alfa * L_hard + (1 - alfa) * L_KD, con alfa = 0,5. Para hacer frente al desbalance de clases extremo presente en uno de los tres datasets de referencia se sustituye la BCE simple por focal loss, FL(p_t) = -(1 - p_t)^gamma * log(p_t), con gamma = 1,0.

En cuanto a los datos, la informacion proporcionada no indica el numero de tokens ni de grafos de entrenamiento, ni la composicion exacta de las particiones de entrenamiento, validacion y prueba. Se evalua sobre tres benchmarks publicos de IDS automotriz: Car-Hacking (Hyundai YF Sonata, cuatro tipos de ataque: DoS, fuzzing, suplantacion de RPM y suplantacion de marcha), Car-Survival (tres vehiculos, tres tipos de ataque) y can-train-and-test (cuatro conjuntos de vehiculos de dos fabricantes). Los autores senalan que este es, segun su conocimiento, el primer estudio de aprendizaje profundo que evalua el dataset can-train-and-test completo. No se menciona el uso de RLHF ni de DPO, tecnicas que no aplican a este tipo de modelo discriminativo.

## Capacidades

- Clasificacion binaria de ventanas de trafico CAN en benigno o ataque, a nivel de grafo.
- Deteccion de cuatro familias de ataque en el benchmark Car-Hacking: denegacion de servicio (DoS), fuzzing, suplantacion de RPM y suplantacion de marcha.
- Deteccion de los tres tipos de ataque de Car-Survival y de los cuatro conjuntos de vehiculos de can-train-and-test.
- Representacion automatica de secuencias de mensajes CAN como grafos con caracteristicas de nodo (medias de payload y recuento de ocurrencias) y pesos de arista por coocurrencia.
- Inferencia con un modelo compacto (316.034 parametros) que reproduce o supera al profesor en dos de los tres benchmarks, lo que lo hace apto para despliegue embarcado.
- Aprendizaje por destilacion con perdida mixta (KL con temperatura + etiquetas duras) y focal loss para escenarios con desbalance de clases.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles / no aplica.

## Casos de uso

- Deteccion de intrusiones en tiempo real dentro del vehiculo: el modelo estudiante, con 316.034 parametros, puede ejecutarse en la propia ECU o en una pasarela (gateway) CAN y clasificar cada ventana deslizante como benigna o maliciosa sin depender de conectividad externa.
- Pasarela de seguridad automotriz (CAN gateway / firewall): integracion del clasificador como etapa de filtrado que marca o descarta tramas asociadas a ventanas clasificadas como ataque antes de reenviarlas entre dominios del vehiculo.
- Unidad de telematica y monitorizacion de flota: deteccion local de ataques en vehiculos conectados con envio agregado de alertas al backend, reduciendo el ancho de banda necesario y la exposicion de datos crudos del bus.
- Verificacion y validacion previas a produccion: uso del IDS como oraculo automatico en bancos de pruebas que inyectan ataques de tipo DoS, fuzzing y suplantacion para comprobar que el sistema de deteccion los identifica.
- Investigacion academica reproducible: el codigo esta disponible bajo licencia MIT en el repositorio OSU-CAR-MSL/KD-GAT, lo que permite reproducir los resultados sobre Car-Hacking, Car-Survival y can-train-and-test y extender el metodo a otros dominios.
- Plantilla metodologica para sistemas ciberfisicos: la combinacion de representacion en grafo y destilacion de conocimiento es reutilizable en otras redes de comunicacion industrial con restricciones de recursos, aunque requeriria reentrenamiento con datos propios del dominio.
- Analisis forense posterior a incidentes: clasificacion por lotes de capturas de trafico CAN para localizar intervalos temporales con actividad maliciosa y priorizar la investigacion manual.
- Deteccion en dispositivos de borde en taller o inspeccion tecnica: ejecucion en equipos de diagnosis con CPU, sin GPU dedicada, gracias al reducido consumo de memoria del modelo estudiante.

## Benchmarks y rendimiento

Resultados publicados en la model card (exactitud y F1 sobre el conjunto de prueba):

| Dataset | Modelo | Exactitud de prueba | F1 de prueba |
|---|---|---|---|
| Car-Hacking | Profesor | 0,9977 | 0,9977 |
| Car-Hacking | Estudiante (KD) | 0,9997 | 0,9997 |
| Car-Survival | Profesor | 0,9695 | 0,9692 |
| Car-Survival | Estudiante (KD) | 0,9931 | 0,9929 |

En can-train-and-test el rendimiento cae tanto en el profesor como en el estudiante. La model card indica que el desbalance de clases de los distintos subconjuntos va de 36:1 a 927:1 y que se observa una reduccion de precision, exhaustividad y F1 en los conjuntos de prueba reservados. No se proporcionan las cifras concretas de precision, exhaustividad ni F1 para este dataset, ni resultados comparativos con otros modelos de la literatura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion publicada. Como referencia derivada del numero de parametros, el estudiante ocupa aproximadamente 1,3 MB en FP32 y 0,63 MB en FP16, y el profesor alrededor de 20 MB en FP32 (calculos teoricos a partir del recuento de parametros, no cifras publicadas por los autores).
- GPU recomendadas: no se especifican en la informacion. Por el tamano del modelo, una GPU dedicada no es un requisito; cualquier acelerador moderno es mas que suficiente.
- Cabe en GPU de consumo: si, cabe ampliamente en cualquier GPU de consumo actual e incluso en GPU integradas, dado que el estudiante tiene 316.034 parametros.
- Ejecucion en CPU: viable en principio por el tamano del modelo, aunque no se publican mediciones de latencia en CPU.
- Opciones de despliegue: no se detallan en la informacion proporcionada. El codigo fuente esta disponible en el repositorio OSU-CAR-MSL/KD-GAT (licencia MIT) y la pila natural es PyTorch con PyTorch Geometric; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El articulo se orienta a despliegue en tiempo real en vehiculo, pero la informacion proporcionada no incluye mediciones de latencia ni de rendimiento por segundo en hardware concreto.
- Memoria del repositorio de HuggingFace: 0,0 GB, lo que sugiere que no hay artefactos de pesos publicados en ese repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KD-GAT (estudiante) | 316.034 | no aplica (ventana deslizante de mensajes CAN) | 0,9997 de exactitud en Car-Hacking; 0,9931 en Car-Survival | MIT | Repositorio HuggingFace con 0 descargas y 0,0 GB; codigo en GitHub |
| KD-GAT (profesor) | 4.999.426 | no aplica | 0,9977 en Car-Hacking; 0,9695 en Car-Survival | MIT | No se detalla publicacion de pesos |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye comparaciones con otros IDS basados en aprendizaje profundo para CAN (por ejemplo, aproximaciones con CNN, LSTM o autoencoders) ni con otros trabajos de destilacion aplicada a deteccion de intrusiones. No se dispone, por tanto, de datos para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Rendimiento degradado en can-train-and-test: el desbalance de clases de los subconjuntos (de 36:1 a 927:1) reduce la precision, la exhaustividad y el F1, y los propios autores lo identifican como problema abierto y linea de trabajo futura.
- Etiquetado a nivel de ventana: una ventana se marca como ataque si contiene al menos un mensaje malicioso, de modo que el modelo no localiza la trama concreta responsable ni identifica el tipo de ataque, solo la presencia de actividad maliciosa en el intervalo analizado.
- Riesgo de generalizacion limitado: los tres benchmarks proceden de un conjunto reducido de vehiculos y fabricantes (Hyundai YF Sonata en Car-Hacking; tres vehiculos en Car-Survival; cuatro conjuntos de dos fabricantes en can-train-and-test). Cambios en la topologia de identificadores CAN, en el fabricante o en el modelo de vehiculo pueden degradar el rendimiento.
- Representacion dependiente del dominio: las caracteristicas de nodo se derivan de medias de payload y recuentos de ocurrencia en una ventana; no hay informacion sobre su robustez frente a variaciones de carga, trafico cifrado a nivel de aplicacion (CAN FD, SecOC) o cambios de topologia.
- No es un modelo de lenguaje: carece por completo de generacion de texto, razonamiento, codigo, tool calling, capacidades de agente y soporte multilingue. Cualquier expectativa en ese sentido es inaplicable.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero existe el riesgo equivalente de falsos positivos y falsos negativos en la clasificacion, sin tasas publicadas para todos los subconjuntos.
- Robustez adversarial no evaluada: la informacion proporcionada no incluye pruebas frente a ataques disenados especificamente para evadir el detector, ni analisis de envenenamiento de datos.
- Estado del repositorio: 0 descargas, 0 likes y 0,0 GB de tamano en HuggingFace, con fecha de creacion y actualizacion del 12 de septiembre de 2026. No se confirma la publicacion de pesos entrenados, por lo que conviene verificar la disponibilidad real de artefactos antes de plantear un uso en produccion.
- Licencia: el modelo y el codigo se publican bajo licencia MIT, que permite uso comercial y modificacion con atribucion. No obstante, los datasets de terceros utilizados para el entrenamiento y la evaluacion pueden tener condiciones propias que deben revisarse por separado.
- Ausencia de datos de latencia y memoria en hardware embarcado real: no hay mediciones publicadas que confirmen el cumplimiento de requisitos de tiempo real duro en una ECU concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SidraBhatti/kd-gat-can-intrusion-detection
- Articulo en arXiv (resumen): https://arxiv.org/abs/2507.19686
- Articulo en arXiv (PDF): https://arxiv.org/pdf/2507.19686
- Codigo fuente (OSU-CAR-MSL/KD-GAT, licencia MIT): https://github.com/OSU-CAR-MSL/KD-GAT
- Referencia bibliografica: Frenken, R., Bhatti, S. G., Zhang, H., & Ahmed, Q. (2025). "KD-GAT: Combining Knowledge Distillation and Graph Attention Transformer for a Controller Area Network Intrusion Detection System." arXiv:2507.19686.
- Resultados de busqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados con la ficha.
