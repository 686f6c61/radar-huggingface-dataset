# end000/Checkers-WSPForge-Russian-v2

## Resumen

Checkers-WSPForge-Russian-v2 es una política de juego para damas rusas sobre tablero de 8×8, implementada como una red neuronal dispersa con activaciones ReLU y programada directamente en el espacio de pesos. Lo desarrolla el autor independiente end000 dentro de su línea de experimentos WSPForge, inspirada en el método Weight-Space Programming de Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab (MIT CSAIL), aunque sin afiliación con sus autores. No es un modelo de lenguaje ni un checkpoint de Transformers: es un artefacto NumPy/SciPy con pesos fijos en float32 que se ejecuta en CPU sin GPU.

El problema que resuelve es la selección de jugada en damas rusas: dado un tablero, genera externamente las jugadas legales, aplica cada una para formar su afterstate y la red puntúa el lote, eligiendo el argmax con desempate uniforme sembrado. La arquitectura es una MLP dispersa de 128 → 384 → 6288 → 1527 → 114 → 4 → 1, con 125.151 parámetros escalares distintos de cero y 12.248.376 posiciones equivalentes densas (incluyendo ceros). No se usó descenso de gradiente, retropropagación, optimizador, PPO, RL ni ajuste automático de parámetros.

Su relevancia es acotada pero interesante como caso de estudio: demuestra que se pueden programar circuitos numéricos interpretables (material, posición, seguridad ante capturas y rutas de promoción) sin entrenamiento, y que añadir un circuito estático de rutas de promoción mejora el rendimiento frente a la versión anterior. El autor es explícito en que no es un motor de fuerza de torneo y que pierde la mayoría de partidas contra py-draughts SimpleEngine en profundidades D3–D5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP dispersa con ReLU: 128 → 384 → 6288 → 1527 → 114 → 4 → 1 |
| Parametros totales | 125.151 parametros escalares distintos de cero (117.704 pesos de matriz + 7.447 sesgos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 4 planos binarios de 32 casillas) |
| Tipos de cuantizacion | no disponible (pesos float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | NPZ (weights.npz) con pesos float32, indices dispersos y formas; model.json con arquitectura y checksum |

## Arquitectura y entrenamiento

La red es una MLP completamente conectada pero almacenada de forma dispersa: cada capa aplica operaciones afines seguidas de ReLU, y en inferencia solo se ejecutan operaciones matriciales y ReLU sobre los tensores guardados. La entrada son cuatro planos binarios de 32 casillas oscuras (peones propios, damas propias, peones rivales, damas rivales), con las casillas ordenadas b8, d8, f8, h8, …, a1, c1, e1, g1; para las negras el tablero se rota 180 grados. La salida es un escalar por afterstate legal, que no es una probabilidad de victoria calibrada. El selector no genera respuestas del rival, no llama a un evaluador clásico, no ejecuta minimax ni alfa-beta y no hace rollouts.

Los pesos se construyeron combinando dos componentes: una versión escalada a enteros del circuito de v1 (material, posición y seguridad inmediata ante capturas) y un circuito estático programado directamente de rutas seguras de promoción. Ese circuito codifica 1.254 caminos diagonales fijos para 56 combinaciones posibles de peón/origen, detecta para cada origen un camino de casillas vacías hasta la fila de promoción y aplica compuertas de seguridad que comprueban la exposición a captura inmediata a lo largo del camino, teniendo en cuenta que la casilla de origen queda vacante. La saturación tipo OR evita contar varias rutas del mismo peón de forma repetida. La puntuación añadida es la diferencia entre los potenciales de promoción de ambos bandos, con un incremento de valor peón-a-dama descontado por 1/2 por paso tranquilo; este descuento es una suposición de diseño fija, no ajustada a partir de partidas. Las conjunciones binarias usan ReLU(sum(condiciones) − número_de_condiciones + 1) y la saturación usa ReLU(z) − ReLU(z − 1). Los dos submodelos se combinan mediante canales de puntuación positiva y negativa para preservar el signo. El autor advierte que la disponibilidad estática de rutas es una heurística: las piezas rivales se mantienen fijas para esta característica y las jugadas futuras del rival, las capturas obligatorias y las tácticas de captura múltiple pueden invalidar el corredor.

## Capacidades

- Selección de jugada en damas rusas 8×8: puntúa cada afterstate legal y elige el argmax con desempate uniforme sembrado.
- Evaluación estática de material, posición y seguridad inmediata ante capturas mediante el circuito heredado de v1.
- Detección de rutas de promoción seguras a través de 1.254 caminos diagonales fijos para 56 combinaciones de peón/origen.
- Compuertas de seguridad ante captura inmediata a lo largo de la ruta de promoción, contabilizando la casilla de origen vacante.
- Inferencia en CPU con NumPy/SciPy, sin GPU ni API remota.
- Interfaz de agente compatible con `draughts.RussianBoard`: `Agent(model_dir=".", seed=42).choose(board)`.
- Modo de demostración contra juego aleatorio y modo de decisión única (`--one-move`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Estudio de Weight-Space Programming: el modelo sirve como ejemplo reproducible de cómo programar circuitos numéricos interpretables (material, posición, seguridad, rutas de promoción) sin descenso de gradiente, útil para investigadores que quieran analizar la metodología WSP sobre un dominio de juego distinto del Go original.
- Referencia didáctica de redes dispersas: con 125.151 parámetros no nulos y 12,2 millones de posiciones densas equivalentes, permite ilustrar en clase o en un blog cómo se almacena y ejecuta una red dispersa en NPZ con NumPy, incluyendo el uso de ReLU como compuerta lógica.
- Baseline ligero para pruebas de motores de damas rusas: al ejecutarse en CPU sin dependencias pesadas, puede integrarse como oponente de bajo coste en suites de test de motores como py-draughts, siempre que se acepte su fuerza limitada (pierde la mayoría de partidas contra D3–D5).
- Análisis de ablación arquitectónica: el autor documenta una ablación de lectura de rutas emparejada por arquitectura, de modo que el artefacto sirve para reproducir y discutir ese tipo de comparación controlada.
- Experimentación con evaluación basada en afterstates: el diseño (generar jugadas externamente, aplicar cada una, puntuar el lote y elegir argmax) es un patrón reutilizable para prototipar políticas de juego sin búsqueda.
- Docencia sobre limitaciones de heurísticas estáticas: el circuito de rutas de promoción ignora jugadas futuras del rival y capturas obligatorias, lo que lo convierte en un caso concreto para explicar por qué una característica estática no equivale a una prueba de promoción.
- Demostraciones interactivas: `python agent.py --human white` permite jugar contra el agente en local, útil para divulgación o para comprobar de forma directa su nivel frente a un humano.

## Benchmarks y rendimiento

| Comparacion | Resultado |
|---|---|
| v2 frente a py-draughts SimpleEngine D3 (cohorte congelada) | 34,96 % para v2 frente a 25,39 % para v1; +9,57 puntos porcentuales |
| v2 frente a D4/D5 | Las mejoras no quedan establecidas tras ajuste por comparaciones múltiples |
| Segunda cohorte D3 (mas pequena) | Diferencia positiva pero no significativa individualmente |
| Partidas directas v2 contra v1 | Aproximadamente igualadas |
| Reduccion de victimas no reconocidas en trayectorias D3 antiguas (etapa previa de refuerzo) | De 124 a 6 de 671, sin ganancia sustancial de fuerza de juego establecida |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia es en CPU con NumPy/SciPy y no requiere GPU.
- GPU recomendadas: ninguna; el autor indica explícitamente que no se necesita GPU.
- Cabe en cualquier GPU consumer y en cualquier CPU convencional: el fichero NPZ ocupa 1.015.770 bytes y los arrays dispersos con índices suman 1.008.200 bytes.
- Opciones de despliegue: ejecución local con Python y las dependencias fijadas en `requirements.txt` (probado en Linux con Python 3.14.4); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.
- Instalación: `hf download end000/Checkers-WSPForge-Russian-v2 --local-dir Checkers-WSPForge-Russian-v2`, creación de entorno virtual e instalación de `requirements.txt`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Fuerza documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Checkers-WSPForge-Russian-v2 | MLP dispersa programada, damas rusas 8×8 | 125.151 no nulos (12.248.376 densos equivalentes) | no aplica | 34,96 % frente a D3; pierde la mayoria contra D3–D5 | GPL-3.0 | HuggingFace, repo de 0,0 GB |
| py-draughts SimpleEngine | Motor clasico de damas | no disponible | no disponible | Referencia de comparacion D3–D5 en la model card | no disponible | no disponible |
| Checkers-WSPForge-Russian-v1 | Version anterior del mismo autor | no disponible | no aplica | 25,39 % frente a D3 | no disponible | no disponible |
| Experimento Go de Weight-Space Programming (MIT CSAIL) | WSP sobre Go | no disponible | no aplica | No comparable directamente segun el autor | no disponible | Publicacion en blog |

No se dispone de datos suficientes para comparar con otros motores de damas rusas de referencia (por ejemplo, variantes de Scan o Kingsrow) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un motor de fuerza de torneo: pierde la mayoría de partidas contra py-draughts SimpleEngine en profundidades D3, D4 y D5.
- Las ganancias frente a D4 y D5 no quedan establecidas tras el ajuste por comparaciones múltiples; la segunda cohorte D3, aunque positiva, no es significativa individualmente.
- Las partidas directas v2 contra v1 están aproximadamente igualadas, lo que matiza la mejora observada en la cohorte D3 congelada.
- Las puntuaciones de salida no son probabilidades de victoria calibradas; no deben interpretarse como tales.
- La disponibilidad estática de rutas de promoción es una heurística: las piezas rivales se mantienen fijas, y las jugadas futuras del rival, las capturas obligatorias y las tácticas de captura múltiple pueden invalidar el corredor. No es una prueba de que la promoción vaya a ocurrir.
- El descuento de 1/2 por paso tranquilo en el valor de promoción es una suposición de diseño fija, no ajustada a partir de datos.
- El selector no realiza búsqueda: no hay minimax, alfa-beta, rollouts ni generación de respuestas del rival, lo que limita la calidad táctica frente a motores con búsqueda.
- El desarrollo implicó retroalimentación de partidas de desarrollo: "sin entrenamiento" no significa "sin retroalimentación" ni "sin selección de modelo", tal como advierte el autor.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero al ser una política de juego puede heredar sesgos de diseño de sus circuitos programados.
- Riesgo de alucinación: no aplica en el sentido habitual, aunque las puntuaciones pueden ser engañosas si se interpretan como evaluaciones calibradas.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial o distribución de obras derivadas; conviene revisar compatibilidad antes de integrarlo en productos propietarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere escasa validación externa.
- Probado en Linux con Python 3.14.4 y dependencias fijadas; no se documenta soporte para otras plataformas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/end000/Checkers-WSPForge-Russian-v2
- Metodo Weight-Space Programming (blog de Rikiya Takehi): https://rikiyat.github.io/blog/weight-space-programming/
- py-draughts (oponente de referencia citado en la model card): no se proporciona enlace en la informacion disponible
- Paper o repositorio del experimento original de Go del MIT CSAIL: no se proporciona enlace en la informacion disponible
