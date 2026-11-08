# mtg-kernel/archon-3-pauper

## Resumen

Archon 3 (`g115`) es una red de política y valor para el formato Pauper de Magic: The Gathering, desarrollada por el proyecto mtg-kernel. Se trata de un modelo de aprendizaje por refuerzo de aproximadamente 1,23 millones de parámetros (hidden size 64, embeddings de carta de 16 dimensiones) que juega partidas completas sobre el motor de reglas open source mtg-kernel. Corresponde a la fase 1, linaje g, bloque 115, entrenado durante 32.400 pasos de optimización desde una inicialización aleatoria sembrada (`engineering-fresh-initialization-002-b`, línea parental de Basilisk 1).

El modelo resuelve un problema acotado pero técnicamente exigente: tomar decisiones de juego válidas y competitivas en un dominio de reglas complejas sin imitación de humanos ni de bots heurísticos. La única señal de recompensa es el resultado terminal de la partida (victoria o derrota), lo que lo convierte en un caso de RL puro desde cero aplicado a un juego de cartas. Es relevante porque forma parte de la primera generación pública de la familia Archon, mientras que su sucesor Basilisk 1 (el modelo líder actual del proyecto) no está publicado.

El paquete contiene el checkpoint completo de entrenamiento (pesos más estado de Adam) y se ejecuta exclusivamente contra la versión exacta del motor con la que fue evaluado. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que produce distribuciones de probabilidad sobre acciones legales del motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal policy-value (`kernel-policy-value-net-8`), hidden size 64, embeddings de carta de 16 dimensiones |
| Parametros totales | ~1,23 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; estado del motor de juego, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato propio, aparentemente `f32le`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoint JSON propio más ficheros de inicialización/parámetros (`parameters.f32le`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es una policy-value network compacta con hidden size 64 y embeddings de carta de 16 dimensiones, diseñada para operar sobre las observaciones y el espacio de acciones que expone el motor mtg-kernel. El entrenamiento es reinforcement learning desde inicialización aleatoria: la recompensa es únicamente el resultado terminal (victoria o derrota), sin datos de partidas humanas ni imitación de bots heurísticos. Se completaron 32.400 pasos de optimización; el checkpoint publicado incluye pesos y estado del optimizador Adam.

El conjunto de mazos de entrenamiento cubre seis de los ocho mazos del tablero más Terror; el modelo nunca vio Spy ni CawGates, lo que constituye una prueba de generalización parcial dentro del formato. La entrada evaluada en el ranking es *policy-only*: muestrea de la softmax de la red (`sampled-wide-v1`) sin búsqueda (sin MCTS ni rollout), lo que simplifica el despliegue y reduce el coste computacional por decisión.

## Capacidades

- Jugar partidas completas de Pauper sobre el motor mtg-kernel, seleccionando acciones legales en cada estado.
- Estimación de valor de estado además de la política de acción (policy-value network).
- Generalización a mazos no vistos durante el entrenamiento (Spy, CawGates), aunque con rendimiento no cuantificado en la información disponible.
- Muestreo estocástico de acciones vía softmax (`sampled-wide-v1`), sin búsqueda.
- No soporta tool calling, function calling, agentes multi-paso genéricos ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Evaluación de agentes de RL en juegos de cartas: sirve como referencia pública de un policy network entrenado desde cero para comparar contra nuevos agentes en el tablero `pauper-kernel-v2`.
- Investigación en RL con recompensa escasa: el modelo ejemplifica el entrenamiento con señal únicamente terminal en un dominio de reglas complejas, útil para estudiar estabilidad y curvas de aprendizaje.
- Baseline en torneos automatizados de Spellbench: al ser un entrante calificado con Elo e intervalo de confianza publicados, permite calibrar nuevos bots.
- Pruebas de integración del motor mtg-kernel: el flujo de carga verificado (comprobación de `model-state` con sha256) sirve para validar que un motor y unos pesos son compatibles antes de lanzar partidas.
- Estudio de generalización a mazos no vistos: comparar su rendimiento en Spy y CawGates frente a mazos de entrenamiento aporta datos sobre robustez fuera de distribución.
- Reproducción de resultados: el checkpoint completo (pesos más Adam) permite reanudar o auditar el entrenamiento y verificar la puntuación de Elo reportada.

## Benchmarks y rendimiento

Spellbench `pauper-kernel-v2`, instantánea del 2026-10-28, anclada con el bot aleatorio uniforme a 1000 Elo. El modelo jugó 896 partidas calificadas.

| Entrante | Elo (IC 95%) |
|---|---|
| Basilisk 1 (red posterior de mtg-kernel) | 1431,0 (1350,1–1521,2) |
| Archon 3 (g115) | 1381,1 (1315,4–1462,7) |
| gorge-ar8 (bot no aprendido) | 1259,6 (1181,2–1348,6) |
| Archon 2 (c12) | 1211,2 (1150,9–1287,9) |
| Archon 1 (a48) | 1178,7 (1114,4–1254,0) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con ~1,23 M de parámetros y pesos en `f32le`, la huella de memoria es del orden de unos pocos megabytes, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no se especifican; el cuello de botella es la CPU del motor mtg-kernel (Rust), no la red neuronal.
- Cabe en cualquier GPU consumer e incluso en CPU; el requisito real es compilar el motor con Rust 1.94.1 y Visual Studio Build Tools (C++).
- Opciones de despliegue: binarios del propio proyecto (`agent_bridge_v1`, `spellbench_scorer_v1`, `spellbench_kernel_catalog`) más el bot Python `kernel_flat_bot.py` de Spellbench. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entorno verificado es Windows 11 x86_64 (Git Bash); la compilación tardó 8 minutos en 4 núcleos y requiere ~1 GB de disco. Otras plataformas no están probadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Archon 3 (g115) | Policy-value RL para Pauper | ~1,23 M | no aplica | Elo 1381,1 en `pauper-kernel-v2` | MIT | Público en HF |
| Basilisk 1 | Policy-value RL para Pauper | no disponible | no aplica | Elo 1431,0 en `pauper-kernel-v2` | no disponible | No público |
| Pauper-llama3-8B (nmalinowski) | LLM afinado con LoRA sobre Llama 3 8B | 8 B | no disponible | no disponible | no disponible | Público (Featherless) |
| gorge-ar8 | Bot no aprendido (heurístico) | no disponible | no aplica | Elo 1259,6 | no disponible | Referencia en Spellbench |

La comparación con Pauper-llama3-8B es solo categórica: aquel es un modelo de lenguaje para consultas y contenido sobre Pauper, mientras que Archon 3 es un agente de juego; no comparten espacio de tareas ni métricas.

## Limitaciones y advertencias

- Ámbito muy restringido: solo juega Pauper y solo contra el motor mtg-kernel en la versión exacta (`92ec2393db34bea805a85991163458b9ff890f57`); no es un modelo de propósito general.
- No procesa lenguaje natural ni genera texto; no debe evaluarse con métricas de LLM.
- Entrenado sin ver los mazos Spy ni CawGates; su rendimiento en esos enfrentamientos no está cuantificado y puede degradarse.
- Inferencia *policy-only* sin búsqueda: la calidad de decisión está acotada por la red; no incorpora planificación explícita.
- Riesgo de sobreajuste al tablero y a la versión del motor de evaluación; cambios en reglas o en el catálogo de cartas invalidan la calificación.
- El flujo de ejecución depende de rutas absolutas y comprobaciones sha256; una configuración incorrecta provoca fallo de carga (`checkpoint_load`) antes de jugar.
- Contenido no oficial: no está afiliado, respaldado ni patrocinado por Wizards of the Coast; Magic: The Gathering y los nombres de cartas son marcas de Wizards of the Coast.
- Licencia MIT para el artefacto, pero el uso de marcas y contenido de MTG queda sujeto a las políticas de Wizards of the Coast.
- Sin datos publicados sobre sesgos, alucinación (no aplica) ni comportamiento en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mtg-kernel/archon-3-pauper
- Motor mtg-kernel: https://github.com/jackmaiorino/mtg-kernel
- Spellbench: https://github.com/jackmaiorino/spellbench
- Datos del tablero `pauper-kernel-v2`: https://github.com/jackmaiorino/spellbench/tree/main/benchmarks/pauper-kernel-v2
- Referencia comparativa Pauper-llama3-8B: https://featherless.ai/models/nmalinowski/pauper-llama3-8b
- Constructor de mazos Pauper (Tutor): https://tutorman.dev/deck-builder/pauper
