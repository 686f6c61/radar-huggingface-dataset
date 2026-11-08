# inkling616/MZ-Pauper-Faeries-v15

## Resumen

MageZero: Pauper Faeries ver15 es un checkpoint de red de política y valor para Magic: The Gathering, desarrollado por Will Wroble dentro del sistema MageZero, un proyecto de estilo AlphaZero que entrena agentes específicos por baraja sobre el motor de reglas XMage. El modelo publicado por el usuario inkling616 en Hugging Face es el mejor checkpoint disponible para la baraja Pauper Faeries a fecha de noviembre de 2026. No es un modelo de lenguaje: es una red neuronal de grafos (GNN) que consume el grafo de estado de partida que construye el codificador de XMage y emite decisiones de juego.

La arquitectura, denominada `NetGraph`, tiene 9,1 millones de parámetros y opera sobre grafos tipados con nodos internos (ROOT, PLAYER, ZONE, STACK_OBJECT, PERMANENT, CARD, ABILITY) y características hoja con hash. Produce cuatro salidas: logits de prioridad por habilidad legal, logits de objetivo por carta o permanente, una decisión binaria de uso (`choose_use`) y un valor escalar en el rango −1 a 1 que estima el resultado esperado.

Su relevancia es acotada pero concreta: demuestra que un sistema AlphaZero con búsqueda MCTS y una red pequeña puede alcanzar y superar a la búsqueda heurística de XMage en un entorno de baraja fija. La política sola rinde a la par que la búsqueda heurística, y añadir búsqueda aporta unos 20 puntos porcentuales de victoria. El modelo está atado al motor XMage y a la baraja Faeries, lo que limita su reutilización fuera de ese ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `NetGraph`: GNN con atención local por tipo de nodo más transformer global de 2 capas |
| Parámetros totales | 9,1 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre un grafo de estado, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible (checkpoint en `torch.save`; sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de juego; sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `model.pt.gz` (dict de `torch.save` comprimido con gzip; contiene `model_state_dict`, `arch`, `feature_vocab`, `edge_vocab`, `hide_opponent_hand` y `epoch`) |

## Arquitectura y entrenamiento

`NetGraph` procesa el grafo de estado de XMage con dos pasadas locales ascendentes. Cada pasada aplica una capa de atención por tipo de nodo, ejecutadas en orden ABILITY → CARD → PERMANENT → STACK_OBJECT → ZONE → PLAYER → ROOT; cada nodo atiende sobre sí mismo, sus hijos y los embeddings de etiqueta de arista. Después se aplica un transformer global de 2 capas sobre el token [CLS] y los nodos internos. La dimensión es d256, con 4 cabezas, FF de 512 y sin dropout. Cada cabeza de salida es un MLP de 256 → 256 → salida. Los nodos hoja se codifican con características con hash (nombres, tipos, contadores, valores numéricos en cubos) mapeadas mediante `feature_vocab`; los identificadores fuera del vocabulario se descartan.

El entrenamiento parte de la línea de datos `ver4` de MageZero: Faeries contra 8 barajas Pauper (Affinity, Burn, CawGates, Elves, Faeries, Rally, Spy, Wildfire) y 5 barajas mono de Standard, en ambos asientos. Se generaron 4,37 millones de estados de entrenamiento combinando gen0 (MCTS heurístico contra MCTS heurístico) y gen1–gen3 (partidas de modelos MageZero anteriores contra la búsqueda heurística, contra modelos más antiguos y en autojuego). Cada quinta partida de cada bloque se reservó como conjunto de validación. Los objetivos de política son distribuciones de visitas MCTS con 300 simulaciones, restringidas a candidatos legales; las etiquetas de valor se mezclan con el resultado mediante descuento TD de 0,92. La receta usa warm start desde ver13 (solo pesos), Adam con lr 3e-5, batch 64, 3 épocas, pérdida MSE para el valor y semilla 0. El linaje es v4 → ver7 → ver13 → ver15.

## Capacidades

- Selección de acciones legales en Magic: The Gathering mediante logits de prioridad sobre nodos ABILITY, incluida la acción de pasar.
- Selección de objetivos para hechizos y habilidades mediante logits sobre nodos CARD, PERMANENT, STACK_OBJECT y PLAYER.
- Decisión binaria de uso de habilidad (`choose_use`) derivada del token [CLS].
- Estimación de valor de estado (tanh, rango −1 a 1) para el jugador que decide, útil como función de evaluación en MCTS.
- Integración con búsqueda MCTS de tipo AlphaZero: la red actúa como prior de política y evaluador de hojas.
- Juego específico de la baraja Pauper Faeries; no pilota otras barajas.
- Sin capacidades de generación de texto, código, matemáticas, visión, audio ni tool calling.
- Sin soporte multilingüe ni de agentes conversacionales.

## Casos de uso

- Entrenamiento de agentes AlphaZero para Magic: el checkpoint sirve como red de política y valor dentro del bucle de autojuego de MageZero, acelerando la generación de datos para iteraciones posteriores.
- Evaluación de barajas en Pauper: enfrentar Faeries contra las 8 barajas Pauper del conjunto de entrenamiento permite medir matchups con un agente más fuerte que la búsqueda heurística de XMage.
- Servicio de inferencia para XMage: `python src/magezero/server.py --model <carpeta> --port 50052` expone el modelo a XMage mediante `RemoteModelEvaluator` con mensajes msgpack.
- Investigación en representación de grafos para juegos de cartas: el codificador tipado con vocabulario de hojas y etiquetas de arista sirve de base para estudiar codificaciones alternativas del estado de partida.
- Benchmark de búsqueda frente a política pura: comparar el rendimiento con MCTS de 300 simulaciones (por ejemplo, 72,0 % en el espejo) frente a la política codiciosa (39,0 %) permite cuantificar el valor de la búsqueda en este dominio.
- Punto de partida para ajuste fino en otras barajas: aunque no fue entrenado para pilotar otras barajas, sus pesos pueden servir de inicialización para experimentos con listas distintas.
- Docencia y divulgación sobre AlphaZero aplicado a juegos con información imperfecta y espacio de acciones estructurado.

## Benchmarks y rendimiento

Resultados reportados por el autor: Faeries contra la búsqueda heurística offline de XMage (300 simulaciones), 200 partidas por enfrentamiento, mano del oponente visible y `max_pending` 4.

| Oponente | Con búsqueda (MCTS solo valor, 300 sims) | Solo política (codiciosa, sin búsqueda) |
|---|---|---|
| Faeries (espejo) | 72,0 % | 39,0 % |
| Burn | 68,5 % | 45,5 % |
| Rally | 31,0 % | 13,5 % |
| Standard MonoB | 36,0 % | ≈12 % |
| Standard MonoW | 53,5 % | 25,3 % |
| Standard MonoG | 32,0 % | 11,5 % |
| Affinity | no disponible | 66,5 % |
| CawGates | no disponible | 67,0 % |
| Elves | no disponible | 55,3 % |
| Spy | no disponible | 55,0 % |

El autor indica que la política sola está aproximadamente al nivel de la búsqueda heurística y que añadir búsqueda aporta unos 20 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,1 M de parámetros en fp32 el peso de los tensores es de aproximadamente 36 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 1 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada moderna puede ejecutar la red.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1 GB de VRAM; también es viable en CPU para inferencia de un solo estado.
- Opciones de despliegue: el servidor propio de MageZero (`src/magezero/server.py`) sobre la rama `graph-encoder-test`; carga mediante `load_checkpoint` desde `src/magezero`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste dominante en producción será la búsqueda MCTS (300 simulaciones por decisión) y la serialización msgpack del grafo de estado, no la red en sí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MageZero Pauper Faeries ver15 | 9,1 M | Grafo de estado XMage | 72,0 % vs heurístico en espejo con búsqueda | MIT | Hugging Face |
| MageZero ver13 (linaje previo) | no disponible | Grafo de estado XMage | no disponible (solo se usa como warm start) | no disponible | no disponible |
| Búsqueda heurística MCTS de XMage | no aplica (sin red) | Estado de XMage | Referencia de comparación del autor | según XMage | Incluida en XMage |
| Otros modelos AlphaZero para juegos de cartas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de benchmarks de otros modelos AlphaZero para Magic en la información proporcionada, por lo que la comparativa se limita al linaje interno de MageZero y a la búsqueda heurística de referencia.

## Limitaciones y advertencias

- Específico de Faeries: el modelo ha visto las decisiones de otras barajas como oponente, pero nunca fue entrenado para pilotarlas.
- Entrenado con la mano del oponente visible. Con información oculta (`see_opponent_hand: false`, que solo codifica el tamaño de la mano) el autor espera un juego más débil.
- Codificación de entrada específica de XMage: no existe una entrada neutral respecto al motor, por lo que usarlo fuera de XMage exige reconstruir el grafo desde el estado del otro motor.
- Dependencia de la rama `graph-encoder-test` y de las ramas `graph-encoder` / `spell-bench` de WillWroble/mage; cambios en el codificador de estado pueden invalidar el checkpoint.
- Riesgo de sobreajuste al meta de Pauper y Standard del conjunto de entrenamiento; los resultados contra barajas fuera de ese conjunto no están medidos.
- Sin datos publicados sobre sesgos, alucinación (no aplica en el sentido lingüístico) ni comportamiento fuera de distribución en estados poco frecuentes.
- Licencia MIT: permite uso comercial, pero el código de MageZero y XMage tiene sus propias licencias que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa independiente del autor.

## Enlaces

- Hugging Face: https://huggingface.co/inkling616/MZ-Pauper-Faeries-v15
- Repositorio MageZero: https://github.com/WillWroble/MageZero
- Motor XMage (fork de WillWroble): https://github.com/WillWroble/mage
