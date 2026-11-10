# inkling616/MZ-Pauper-P1

## Resumen

MageZero: Pauper P1 es una red neuronal de política y valor (policy-and-value network) entrenada al estilo AlphaZero para jugar a Magic: The Gathering en el formato Pauper. La desarrolla Will Wroble como parte del proyecto MageZero, un sistema de búsqueda e inferencia construido sobre el motor de reglas XMage. A diferencia de su predecesora, limitada al mazo Faeries, esta versión es la primera red "format-wide" del proyecto: un único modelo que cubre los ocho mazos del pool Pauper incluido en XMage (Affinity, Burn, CawGates, Elves, Faeries, Rally, Spy y Wildfire).

El modelo emplea una arquitectura de grafo neuronal (`NetGraph`) de 9,1 millones de parámetros que procesa el estado de la partida como un grafo tipado con nodos internos (ROOT, PLAYER, ZONE, STACK_OBJECT, PERMANENT, CARD, ABILITY), características foliares hasheadas y aristas etiquetadas. La salida combina logits de prioridad por nodo ABILITY, logits de objetivo por nodo CARD/PERMANENT/STACK_OBJECT/PLAYER, logits de decisión de uso y un valor escalar con activación tanh para el jugador que decide.

Su relevancia es acotada pero concreta: es un ejemplo de aplicación de AlphaZero con búsqueda MCTS a un juego de cartas con información imperfecta y un espacio de acciones combinatorio, empaquetado como checkpoint servible a XMage mediante un servidor remoto. El checkpoint se distribuye con licencia MIT y pesos en un único fichero `model.pt.gz`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph neural network (`NetGraph`) con dos pasadas locales ascendentes y un transformer global de 2 capas sobre [CLS, nodos internos] |
| Parametros totales | 9,1 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa el grafo completo del estado de partida) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en punto flotante via `torch.save`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.pt.gz` (diccionario de `torch.save` comprimido con gzip: `model_state_dict`, `arch`, `feature_vocab`, `edge_vocab`, `hide_opponent_hand`, `epoch`) |

## Arquitectura y entrenamiento

`NetGraph` es una red sobre grafos con dimensión oculta d256, 4 cabezas de atención y feed-forward de 512. Aplica dos pasadas locales ascendentes, con una capa de atención por tipo de nodo, seguidas de un transformer global de 2 capas sobre el token [CLS] y los nodos internos. El vocabulario de características foliares creció de 1.556 a 1.566 filas y el de etiquetas de arista de 20 a 23 para acomodar las cartas de los nuevos mazos. La entrada es el grafo de estado generado por el `StateEncoder` de XMage y enviado por `RemoteModelEvaluator`; la salida son prioridades por ABILITY, objetivos por CARD/PERMANENT/STACK_OBJECT/PLAYER (softmax sobre candidatos legales), logits de uso y un valor tanh.

El entrenamiento partió de un warm start con los pesos de ver15 (optimizador reiniciado) y usó 7,18 millones de estados de entrenamiento, con ambos asientos y retención de cada quinto juego de cada bloque. Los datos combinan tres fuentes: ver15 pilotando cada mazo Pauper contra el MCTS heurístico offline de XMage (8×8, 200 partidas por emparejamiento), autojuego de ver15 en los 36 emparejamientos de mazos (200 partidas cada uno) y los datos de Faeries con los que se entrenó ver15. Los objetivos son distribuciones de visita de MCTS con 300 simulaciones (solo candidatos legales) y etiquetas de valor TD-0,92. La receta: Adam con lr 3e-5, batch 64, 3 épocas de 112.172 pasos cada una, pérdida de valor MSE y semilla 0. Este checkpoint corresponde al final de la época 3.

## Capacidades

- Selección de acción en Magic: The Gathering Pauper: produce prioridades sobre acciones legales y objetivos válidos para el jugador que tiene la prioridad.
- Evaluación de posición: emite un valor tanh para el jugador que decide, utilizable como heurística en búsqueda MCTS.
- Cobertura de ocho mazos Pauper en un único modelo: Affinity, Burn, CawGates, Elves, Faeries, Rally, Spy y Wildfire.
- Integración con MCTS: las prioridades y el valor están pensados para guiar búsqueda de 300 simulaciones, no para jugar de forma greedy.
- Servicio remoto a XMage mediante `server.py` en el puerto 50052.
- No soporta tool calling, function calling, agentes genéricos, multilingüismo ni modalidades de texto, visión o audio: es un modelo específico de dominio.

## Casos de uso

- Entrenamiento de agentes AlphaZero para juegos de cartas: el checkpoint sirve como red de política y valor dentro del bucle de autojuego de MageZero, guiando MCTS en cada decisión y generando nuevas distribuciones de visita para iteraciones posteriores.
- Evaluación automatizada de mazos Pauper: al cubrir los ocho mazos del pool, permite enfrentar cualquier par de ellos y obtener métricas de win rate sin cambiar de red, como ya se hizo con ver15 en los 64 emparejamientos.
- Benchmark de motores de reglas: al depender del `StateEncoder` de XMage, sirve para medir la fidelidad y el rendimiento del motor al procesar estados complejos con pila, permanentes y habilidades.
- Investigación en información imperfecta: con `hide_opponent_hand` a false, el modelo está entrenado viendo la mano rival; es un punto de partida para estudiar el impacto de ocultar información en la calidad de la política.
- Prototipado de asistentes de juego: el servidor remoto permite conectar el modelo a XMage y observar partidas generadas para depurar codificaciones o analizar decisiones.
- Estudio de generalización entre mazos: la comparación de precisión top-1 en movimientos no-pass entre Faeries (≈0,69) y los mazos nuevos (≈0,59–0,62) ofrece un caso medible de cuánto se degrada una política al ampliar el pool de mazos con datos de una sola generación.

## Benchmarks y rendimiento

Métricas retenidas del autor (MSE de valor / KL de prioridad / pérdida de objetivo / top-1 de prioridad en movimientos no-pass):

| Bloque | P1 | ver15 |
|---|---|---|
| Partidas 8×8 (retenidas) | 0,039 / 0,049 / 0,052 / 0,621 | – |
| Partidas de autojuego (retenidas) | 0,048 / 0,068 / 0,056 / 0,594 | – |
| Bloques modelo-contra-modelo de Faeries (media de 5) | 0,0376 / 0,0524 / 0,0418 / 0,689 | 0,0386 / 0,0532 / 0,0424 / 0,687 |

El autor indica que P1 aún no se ha probado en juego. Como referencia, ver15 pilotando cada mazo contra la búsqueda heurística offline ganó el 64,4 % en los 64 emparejamientos y perdió los espejos de Burn (37,5 %) y Wildfire (36,0 %).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 9,1 millones de parámetros en punto flotante, el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer, aunque el consumo real depende del tamaño del grafo de estado y del lote.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con suficiente memoria para el grafo basta, pero el autor no especifica requisitos.
- GPU consumer: previsiblemente sí, dado el reducido número de parámetros; no hay confirmación del autor.
- Despliegue: `server.py` de MageZero (`python src/magezero/server.py --model <carpeta con model.pt.gz> --port 50052`) y carga mediante `load_checkpoint` con la rama `graph-encoder-test` de `src/magezero`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cobertura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MageZero: Pauper P1 | 9,1 M | 8 mazos Pauper | no disponible | MIT | Hugging Face (`inkling616/MZ-Pauper-P1`) |
| MageZero ver15 (Faeries) | no disponible | Solo Faeries | no disponible | no disponible | Hugging Face (`inkling616/MZ-Pauper-Faeries-v15`) |
| Otros modelos AlphaZero para MTG | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con ver15, del mismo proyecto: P1 amplía la cobertura de uno a ocho mazos con un coste mínimo en las métricas de Faeries (top-1 de 0,689 frente a 0,687), a cambio de un rendimiento menos refinado en los mazos nuevos. No se dispone de datos de otros sistemas comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con la mano del oponente visible (`hide_opponent_hand` a false); se espera un juego más débil con información oculta.
- Codificación de entrada específica de XMage; usarlo en otro motor exige reconstruir el grafo de estado con el mismo esquema de nodos, características y aristas.
- La mayor parte de los datos de mazos no-Faeries proviene de una sola generación de partidas, por lo que su juego con esos mazos está menos refinado (precisión no-pass ≈0,59–0,62 frente a ≈0,69 en Faeries).
- No probado aún en juego por el autor; las métricas son de validación offline.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes genéricos, y no tiene capacidades multilingües.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de decisiones subóptimas o inválidas si el grafo de entrada no coincide con el esquema esperado.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las licencias de XMage y de las cartas de Magic: The Gathering, ajenas a este checkpoint.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño indicado es 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamaño no se ha propagado.

## Enlaces

- Hugging Face: https://huggingface.co/inkling616/MZ-Pauper-P1
- Modelo predecesor (Faeries ver15): https://huggingface.co/inkling616/MZ-Pauper-Faeries-v15
- Repositorio MageZero: https://github.com/WillWroble/MageZero
- Motor XMage (fork del autor): https://github.com/WillWroble/mage
