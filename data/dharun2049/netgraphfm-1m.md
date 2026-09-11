# dharun2049/netgraphfm-1m

## Resumen

NetGraphFM-1M es un modelo fundacional de grafos de pequeno tamano (1.028.755 parametros) desarrollado por el usuario dharun2049 y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje: esta disenado especificamente para modelar el estado y el comportamiento de redes de comunicaciones, tomando como entrada grafos de red que combinan topologia, encaminamiento (routing), estado de trafico e informacion a nivel de flujo.

El objetivo declarado del autor es comprobar si un encoder de grafos muy compacto puede aprender representaciones utiles y transferibles de la estructura y el comportamiento de una red, en lugar de limitarse a una unica tarea supervisada. Para ello se entrena con tres objetivos simultaneos: prediccion de metricas de flujo (retardo, jitter y perdida de paquetes), reconstruccion de estado de nodo enmascarado y reconstruccion de topologia. El encoder combina paso de mensajes local consciente de aristas con atencion global dispersa sobre el grafo.

Su relevancia actual es doble: por un lado, es un caso de estudio de modelo fundacional en un dominio muy alejado del texto (operaciones de red y observabilidad); por otro, su evaluacion en GFMBenchmark 2026 mediante transferencia few-shot con el encoder congelado aporta evidencia preliminar sobre cuanto conocimiento estructural generico sobrevive en un modelo entrenado originalmente solo para networking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos hibrida local-global: paso de mensajes local consciente de aristas + atencion global dispersa sobre el grafo |
| Parametros totales | 1.028.755 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de grafos; no maneja secuencias de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de grafos, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio reporta 0.0 GB de tamano) |
| Tamano oculto (hidden size) | 128 |
| Capas | 4 |
| Cabezas de consulta (query heads) | 4 |
| Cabezas KV (KV heads) | 2 |
| Tokens globales de grafo | 4 |
| Ancho de features de nodo | 12 |
| Ancho de features de arista | 4 |
| Framework | PyTorch |

## Arquitectura y entrenamiento

NetGraphFM-1M emplea una arquitectura hibrida de grafo con dos etapas. La primera es paso de mensajes local consciente de las aristas (edge-aware message passing), que propaga informacion entre nodos vecinos incorporando los atributos de las aristas. La segunda es una atencion global dispersa sobre el grafo, que introduce mecanismos propios de los transformers: grouped-query attention (4 cabezas de consulta frente a 2 cabezas KV), normalizacion QK, RMSNorm, bloques feed-forward SwiGLU y cuatro tokens globales de grafo aprendidos que actuan como resumen agregado de la topologia. La representacion de entrada se enriquece con codificaciones estructurales de camino aleatorio (random-walk) y codificaciones posicionales laplacianas.

El entrenamiento usa datos de modelado de red de BNN-UPC y trazas de red derivadas de tres topologias: Abilene, NOBEL-Germany y GEANT. Abilene y NOBEL-Germany se usaron para entrenamiento y validacion, mientras que GEANT se reservo como topologia no vista para test. La representacion del grafo contiene topologia, encaminamiento, estado de trafico, caminos origen-destino, informacion de enlaces, estado de nodo e informacion a nivel de flujo. La funcion de perdida total es L = L_flow + 0,15·L_masked-state + 0,10·L_topology, donde la prediccion de flujo estima retardo, jitter y perdida de paquetes en espacio logaritmico. Segun el autor, las variables objetivo medidas no se exponen intencionadamente como features de entrada de la misma tarea de prediccion, para evitar filtracion de informacion.

## Capacidades

- Prediccion de metricas de rendimiento de flujo: retardo, jitter y perdida de paquetes (objetivo principal de entrenamiento, con objetivos representados en espacio logaritmico).
- Reconstruccion de estado de nodo enmascarado: el modelo infiere atributos de nodo ocultos a partir del resto del grafo.
- Reconstruccion de topologia: estima si dos nodos deberian estar conectados, aportando un objetivo estructural independiente del de flujo.
- Generacion de representaciones de grafo (embeddings) reutilizables: el encoder esta pensado para seguir siendo util una vez retiradas las cabezas de prediccion especificas de networking.
- Transferencia few-shot a grafos de otros dominios: con el encoder congelado y un clasificador descendente pequeno, se evaluo en BZR, Chameleon y Wikipedia.
- Modelado de redes con topologias no vistas: GEANT se mantuvo fuera del entrenamiento como test de generalizacion estructural.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Prediccion de rendimiento de red: dado el estado actual (topologia, rutas, trafico), estimar retardo, jitter y perdida de paquetes por flujo antes de que ocurran, util para planificacion de capacidad y SLA.
- Deteccion de anomalias y triaje de observabilidad: al modelar el estado normal de la red, las reconstrucciones de nodo o topologia con error elevado pueden senalar enlaces o nodos degradados.
- Analisis de impacto de fallos: simular la retirada de un enlace o nodo y observar como se propaga el efecto por el grafo mediante las cabezas de prediccion de flujo.
- Planificacion de topologia (what-if): usar la cabeza de reconstruccion de topologia para evaluar si una nueva interconexion propuesta es coherente con el comportamiento observado de la red.
- Enrutamiento y optimizacion de trafico: comparar configuraciones de encaminamiento alternativas segun las metricas de flujo predichas, sin necesidad de desplegar cambios reales.
- Embeddings para clasificacion de nodos con pocas etiquetas: al congelar el encoder y entrenar un clasificador ligero, sirve para tareas de clasificacion de nodos en grafos de red con muy pocos ejemplos etiquetados (escenario evaluado en GFMBenchmark).
- Investigacion en modelos fundacionales de grafos: banco de pruebas de bajo coste (1M de parametros) para estudiar transferencia few-shot entre dominios de grafo.
- Modelado de trazas historicas de red: analisis retrospectivo de incidentes comparando el estado del grafo antes y despues del fallo.

## Benchmarks y rendimiento

Evaluacion del encoder congelado en GFMBenchmark 2026, configuracion Exp1 (transferencia few-shot a conjunto de datos no visto), sobre los conjuntos completados BZR, Chameleon y Wikipedia. Cada grafo se convierte en entradas estructurales sin etiquetas y se entrena un clasificador descendente pequeno con los ejemplos few-shot del benchmark.

| Configuracion | Accuracy | Micro-F1 | Macro-F1 |
|---|---:|---:|---:|
| 1-shot | 33,87 | 33,87 | 27,19 |
| 5-shot | 36,28 | 36,28 | 31,11 |

El autor indica que estas cifras deben leerse como un experimento de transferencia: NetGraphFM no fue preentrenado con la coleccion oficial de preentrenamiento de GFMBenchmark, por lo que la evaluacion mide principalmente cuanto conocimiento estructural generico sobrevivio en un modelo entrenado para networking. Los ficheros de evaluacion en bruto estan en el directorio `evaluation/` del repositorio. Los graficos comparativos frente a otros modelos fundacionales de grafos de GFMBenchmark 2026 se incluyen como imagenes en la model card, pero los valores numericos de los competidores no se detallan en la informacion disponible.

No se han publicado resultados de benchmarks de prediccion de red (retardo, jitter, perdida) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.028.755 parametros; en fp32 los pesos ocupan aproximadamente 4 MB, por lo que el pico de memoria se domina por las activaciones del grafo, no por el modelo. Cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU, incluidas las mas modestas; no requiere A100, H100 ni RTX 4090. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en practicamente cualquier GPU integrada. La restriccion real sera el tamano del grafo de entrada y el batch, no el modelo.
- Opciones de despliegue: PyTorch como framework de referencia (tag `pytorch` en el repositorio). No es compatible con runtimes de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI, ya que no procesa texto.
- Latencia y throughput estimados: no disponible.
- Nota importante: el repositorio reporta 0.0 GB de tamano, por lo que no se confirma que los pesos entrenados esten publicados. Habria que verificar la disponibilidad de checkpoints antes de planificar un despliegue.

## Comparativa con modelos similares

La model card incluye graficos de comparacion de accuracy y Macro-F1 frente a los modelos fundacionales de grafos reportados en GFMBenchmark 2026, pero no nombra ni cuantifica a esos competidores en el texto proporcionado.

| Modelo | Parametros | Contexto | Rendimiento few-shot (1-shot / 5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NetGraphFM-1M | 1.028.755 | no aplica (grafo) | 33,87 / 36,28 accuracy (BZR+Chameleon+Wikipedia) | apache-2.0 | repositorio HuggingFace, pesos no confirmados (0.0 GB) |
| Otros modelos fundacionales de grafos de GFMBenchmark 2026 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Modelo de grafos, no de lenguaje: no acepta prompts de texto ni genera texto, codigo ni respuestas conversacionales.
- Pesos no confirmados: el repositorio reporta 0.0 GB de tamano y no se detalla el formato de pesos, por lo que la reproducibilidad del checkpoint esta por verificar.
- Alcance de los resultados: solo se han completado tres conjuntos de GFMBenchmark (BZR, Chameleon y Wikipedia) en la configuracion de transferencia 1-shot y 5-shot; el resto de conjuntos no estan evaluados.
- Rendimiento absoluto bajo: una accuracy de 33,87 en 1-shot indica que la representacion congelada tiene capacidad de adaptacion limitada cuando hay muy pocas etiquetas, algo que el propio autor enmarca como experimento de transferencia y no como resultado competitivo.
- Origen del preentrenamiento: el modelo se entreno con datos de BNN-UPC y topologias Abilene, NOBEL-Germany y GEANT, de modo que su sesgo inductivo esta fuertemente orientado a redes de ese tipo. La generalizacion a otras topologias, tecnologias de acceso o dominios no esta demostrada.
- Dependencia del grafo de entrada: la calidad de las predicciones depende de la disponibilidad y fidelidad de topologia, rutas, estado de trafico y metricas de flujo; datos incompletos o mal normalizados degradaran el resultado. No se documentan los esquemas exactos de features de nodo (12) y arista (4).
- Riesgo de error en predicciones de red: los objetivos de retardo, jitter y perdida de paquetes se modelan en espacio logaritmico y pueden presentar errores grandes en regimenes de congestion extrema o eventos raros no representados en el entrenamiento.
- Ausencia de documentacion sobre sesgos, calibracion y analisis de robustez frente a grafos adversariales o maliciosos.
- Sin soporte de cuantizacion documentado ni de runtimes optimizados, lo que limita las opciones de despliegue de alto rendimiento mas alla de PyTorch.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos, pero el autor no ofrece garantias ni soporte.
- Estado del proyecto: 0 descargas y 0 likes en el momento de la consulta, y una unica publicacion de referencia; se trata de un trabajo en fase temprana sin validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dharun2049/netgraphfm-1m
- Directorio de evaluacion del repositorio: `evaluation/` (ficheros en bruto de la evaluacion en GFMBenchmark 2026, referenciados en la model card)
- Imagenes incluidas en el repositorio: `assets/01_accuracy_leaderboard.png`, `assets/02_macro_f1_leaderboard.png`, `assets/03_dataset_comparison_1shot.png`, `assets/04_dataset_comparison_5shot.png`, `assets/05_release_card.png`, `assets/06_release_card.png`
- Paper de referencia: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o espacio interactivo: no disponible
- Busqueda web: los resultados devueltos corresponden a la plataforma de videoconferencia Zoom (zoom.us, zoom.com, soporte de Zoom) y no guardan relacion con el modelo, por lo que no se han incorporado como fuentes.
