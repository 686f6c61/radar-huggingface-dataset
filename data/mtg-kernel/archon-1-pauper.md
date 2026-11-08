# mtg-kernel/archon-1-pauper

## Resumen

Archon 1 (`a48`) es una red de política y valor para jugar Pauper, un formato de Magic: The Gathering en el que solo se permiten cartas comunes, sobre el motor de reglas de código abierto mtg-kernel. Lo desarrolla el proyecto mtg-kernel (usuario `mtg-kernel` en Hugging Face) y se trata de un modelo de aprendizaje por refuerzo de aproximadamente 1,23 millones de parámetros, con tamaño oculto de 64 y embeddings de carta de 16 dimensiones. Corresponde a la fase 1, linaje a, bloque 48, entrenado durante 8.800 pasos del optimizador desde una inicialización sembrada propia.

El modelo resuelve el problema de aprender a jugar un juego de cartas complejo sin datos humanos ni imitación de bots heurísticos: la única señal de recompensa es la victoria o derrota terminal. Se entrenó con seis de los ocho mazos del tablero más el mazo Terror, y nunca vio los mazos Spy ni CawGates. Es relevante ahora porque forma parte de la primera generación pública de redes de mtg-kernel y sirve como referencia para evaluar la progresión de la familia Archon hacia Basilisk 1, el modelo actualmente líder del proyecto y todavía no publicado.

El checkpoint publicado es el archivo completo de entrenamiento (pesos más estado de Adam), exactamente el mismo que carga la entrada evaluada en el benchmark Spellbench. La entrada clasificada es solo de política: muestrea de la softmax de la red (`sampled-wide-v1`) sin búsqueda. El modelo no está pensado como modelo de lenguaje, sino como política de decisión para un entorno de juego concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política y valor `kernel-policy-value-net-8` (tamaño oculto 64, embeddings de carta de 16 dimensiones) |
| Parametros totales | Aproximadamente 1,23 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en formato de checkpoint de entrenamiento; el archivo de parámetros se referencia como `parameters.f32le`) |
| Idiomas soportados | No disponible (modelo específico de juego, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | Checkpoint JSON de entrenamiento (pesos más estado de Adam); parámetros en `parameters.f32le` |

## Arquitectura y entrenamiento

La arquitectura es una red de política y valor denominada `kernel-policy-value-net-8`, con tamaño oculto de 64 y embeddings de carta de 16 dimensiones, integrada en el motor de reglas mtg-kernel. El modelo produce una distribución de política sobre las acciones legales del entorno y un valor de estado, y la entrada evaluada opera exclusivamente en modo de política, muestreando de la softmax sin ningún tipo de búsqueda o planificación.

El entrenamiento es aprendizaje por refuerzo desde inicialización aleatoria (linaje `engineering-fresh-initialization-002-a`), con la victoria o derrota terminal como única recompensa, sin datos de partidas humanas y sin imitación de bots heurísticos. Se realizaron 8.800 pasos del optimizador sobre seis de los ocho mazos del tablero más el mazo Terror; el modelo nunca se expuso a los mazos Spy ni CawGates durante el entrenamiento. El checkpoint publicado incluye el estado completo del optimizador Adam, lo que permite reanudar el entrenamiento.

## Capacidades

- Jugar partidas de Pauper sobre el motor mtg-kernel, seleccionando acciones legales mediante muestreo de la política.
- Estimación de valor de estado, ya que la red es conjuntamente de política y valor.
- Toma de decisiones secuenciales multi-turno dentro de una partida completa.
- Generalización limitada a los mazos vistos en entrenamiento (seis mazos del tablero más Terror).
- Sin capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión o audio.
- Sin soporte de tool calling ni function calling.
- Sin capacidades multilingües.
- Sin modo de pensamiento explícito ni búsqueda en la entrada evaluada (política pura, `sampled-wide-v1`).

## Casos de uso

- Evaluación de referencia en Spellbench: el modelo se carga como entrada clasificada en el tablero `pauper-kernel-v2` y permite comparar el rendimiento de nuevas políticas contra una línea base reproducible con Elo anclado a 1000 para el bot aleatorio uniforme.
- Investigación en aprendizaje por refuerzo desde cero: al publicarse el checkpoint completo con estado de Adam, sirve para estudiar la dinámica de entrenamiento sin recompensas densas y sin datos humanos en un juego de información imperfecta con acciones legales variables.
- Desarrollo y validación del motor mtg-kernel: el modelo se usa como agente de prueba para verificar la integración entre el motor, el puente `agent_bridge_v1` y el scorer `spellbench_scorer_v1`, con comprobación de estado del modelo mediante hash.
- Reproducción de resultados experimentales: los pasos de instalación documentados permiten reconstruir el catálogo `pauper-v2-catalog.json` con un hash verificado y ejecutar partidas contra el mismo motor con el que se evaluó el modelo.
- Punto de partida para ajuste fino: al incluir pesos y estado del optimizador, se puede reanudar el entrenamiento o adaptar la política a otros mazos, como Spy o CawGates, que el modelo no vio durante el entrenamiento.
- Análisis comparativo de linajes: permite contrastar la fase 1 (Archon 1) con fases posteriores (Archon 2, Archon 3 y Basilisk 1) para medir la contribución de más pasos de entrenamiento y cambios de linaje.
- Docencia sobre RL en juegos de cartas: un modelo de 1,23 M de parámetros es lo bastante pequeño para ejecutarse en hardware modesto y explicar en clase cómo una política aprendida interactúa con un motor de reglas formal.

## Benchmarks y rendimiento

Datos del tablero Spellbench `pauper-kernel-v2`, instantánea del 2026-10-28, con el bot aleatorio uniforme anclado a 1000 Elo. Archon 1 jugó 896 partidas clasificadas.

| Entrada | Elo (IC 95%) |
|---|---|
| Basilisk 1 (red posterior de mtg-kernel) | 1431,0 (1350,1 a 1521,2) |
| Archon 3 (g115) | 1381,1 (1315,4 a 1462,7) |
| gorge-ar8 (bot no aprendido) | 1259,6 (1181,2 a 1348,6) |
| Archon 2 (c12) | 1211,2 (1150,9 a 1287,9) |
| Archon 1 (a48) | 1178,7 (1114,4 a 1254,0) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero al tratarse de una red de aproximadamente 1,23 M de parámetros, el checkpoint y los parámetros en `f32le` ocupan del orden de megabytes; el requisito dominante es el motor Rust y el proceso de Python, no la GPU.
- GPU recomendadas: no disponible. La documentación de ejecución no menciona requisitos de GPU; el procedimiento verificado se ejecutó en Windows 11 x86_64 con Git Bash.
- ¿Cabe en GPU de consumo? No hay datos que indiquen que se requiera GPU; el tamaño del modelo sugiere que la inferencia es viable en CPU.
- Opciones de despliegue: el procedimiento oficial usa el motor mtg-kernel compilado con `cargo build --release --locked`, los binarios `agent_bridge_v1`, `spellbench_scorer_v1` y `spellbench_kernel_catalog`, y el bot `kernel_flat_bot.py` del repositorio spellbench. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de entorno documentados: Git para Windows, Rust mediante rustup (el repositorio fija Rust 1.94.1) con la carga de trabajo "Desktop development with C++" de Visual Studio Build Tools, Python 3.11 o superior, y aproximadamente 1 GB de disco. La compilación tardó 8 minutos en 4 núcleos. Otras plataformas no están probadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Elo (Spellbench pauper-kernel-v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Archon 1 (a48) | ~1,23 M | No disponible | 1178,7 (1114,4 a 1254,0) | MIT | Público en Hugging Face |
| Archon 2 (c12) | No disponible | No disponible | 1211,2 (1150,9 a 1287,9) | No disponible | No disponible en la información proporcionada |
| Archon 3 (g115) | No disponible | No disponible | 1381,1 (1315,4 a 1462,7) | No disponible | No disponible en la información proporcionada |
| Basilisk 1 | No disponible | No disponible | 1431,0 (1350,1 a 1521,2) | No disponible | No público (el proyecto no publica su modelo líder actual) |
| gorge-ar8 (bot no aprendido) | No disponible | No disponible | 1259,6 (1181,2 a 1348,6) | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; el entrenamiento se limita a un conjunto reducido de mazos y puede presentar un comportamiento sesgado hacia las estrategias presentes en esos mazos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede seleccionar acciones legales de baja calidad sin que exista un mecanismo de verificación posterior, al operar sin búsqueda.
- Limitaciones de cobertura de mazos: el modelo se entrenó con seis de los ocho mazos del tablero más Terror y nunca vio Spy ni CawGates, por lo que su rendimiento frente a esos mazos no está validado.
- Limitación de contexto e idioma: no dispone de ventana de contexto lingüística ni de capacidades multilingües; su único dominio es el juego.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial y modificación, pero el contenido es fan no oficial y no está afiliado, respaldado ni patrocinado por Wizards of the Coast; Magic: The Gathering y los nombres de cartas son marcas de Wizards of the Coast.
- Dependencia del motor exacto: el modelo necesita el motor con el que fue evaluado; la compilación propia no produce binarios idénticos a los evaluados y la verificación se basa en el hash de estado del modelo (`774e936da26468358257774fe41ae94578265b331d2edb49d017c0835b08699a`).
- Portabilidad limitada: el procedimiento de ejecución solo está verificado en Windows 11 x86_64 con Git Bash; otras plataformas no están probadas.
- Caveat de producción: la entrada evaluada es solo de política y sin búsqueda, por lo que su fuerza está acotada por la calidad de la softmax aprendida; no debe presentarse como un jugador de nivel competitivo sin validación adicional.
- Reproducibilidad: los archivos de rutas `weights/a48.scorer.json` y `weights/play-import-a.json` contienen rutas absolutas de otra máquina y deben corregirse localmente; el catálogo generado debe tener el hash `af8e1b914d76ed6d30318403c6d434fc4d3a651a68d7e37c79c9d09c68cc457e`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mtg-kernel/archon-1-pauper
- Repositorio del motor mtg-kernel: https://github.com/jackmaiorino/mtg-kernel
- Repositorio de Spellbench: https://github.com/jackmaiorino/spellbench
- Datos del tablero pauper-kernel-v2: https://github.com/jackmaiorino/spellbench/tree/main/benchmarks/pauper-kernel-v2
- Git para Windows: https://git-scm.com/download/win
- rustup: https://rustup.rs
- Constructor de mazos Pauper con IA (resultado de búsqueda, no relacionado directamente con el modelo): https://tutorman.dev/deck-builder/pauper
- Mazo Pauper generado con IA en TappedOut (resultado de búsqueda, no relacionado directamente con el modelo): https://tappedout.net/mtg-decks/chatgpt-ai-deck/
