# nerijs/playmat-ai-checkpoints

## Resumen

Playmat AI Checkpoints es una colección de pesos de redes neuronales entrenadas mediante aprendizaje por refuerzo para jugar a Magic: The Gathering. El modelo lo desarrolla el usuario nerijs y se publica bajo licencia MIT en Hugging Face. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de checkpoints que combinan una red transformer con un motor de búsqueda Gumbel-ISMCTS (Information Set Monte Carlo Tree Search) para la toma de decisiones en un juego de información imperfecta y con enorme espacio de estados.

El repositorio contiene varias generaciones de checkpoints: una línea base `loop5` con transformers de 730k parámetros entrenados sobre self-play con `netsearch`, una variante de 788k parámetros con una MLP de valor regularizada de dos capas entrenada sobre 593k partidas, y una variante de 4,5M parámetros (`d=256, heads=8, layers=6, ff=640`) que incorpora embeddings de texto de las cartas mediante BGE-small. Además se incluye una generación `loop6` basada en Gumbel-ISMCTS con disciplina de terminales de quiescencia.

La relevancia del proyecto reside en aplicar técnicas tipo AlphaZero (self-play más búsqueda en árbol con red neuronal) a un dominio complejo como MTG, donde la información es imperfecta y el estado es parcialmente observable. El formato de pesos es específico: `.pmnet` para inferencia en Rust, `.pt` para PyTorch, más `arch.json` y un `report.json` de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de política y MLP de valor; búsqueda Gumbel-ISMCTS |
| Parametros totales | 730k (`loop5`), 788k (`bt-tx788k-all10`), 4,5M (`bt-tx4m-all10`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos `.pmnet` y `.pt`) |
| Idiomas soportados | no disponible (dominio específico de MTG, no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pmnet` (Rust), `.pt` (PyTorch), `arch.json`, `report.json` |

## Arquitectura y entrenamiento

La arquitectura combina una red transformer que procesa el estado del juego con una búsqueda en árbol Gumbel-ISMCTS. La variante de 4,5M de parámetros usa `d=256`, 8 cabezas de atención, 6 capas, dimensión de feed-forward de 640, activación GELU y una MLP de valor de dos capas regularizada (`val_mlp=1`). Incorpora embeddings de texto de las cartas generados con BGE-small (`text=2`), lo que permite al modelo razonar sobre el texto de las cartas además del estado estructurado.

El entrenamiento se basa en self-play. La línea `loop5` se entrenó con `netsearch` y consta de rondas `r1` a `r10`; las variantes `all10` se entrenaron sobre las 10 rondas compactadas, lo que suma 593k partidas. La generación `loop6` introduce "Quiescence Terminal-Disciplined Value-Leaf Gumbel-ISMCTS" y registra valores en `qval.f16`. Los informes de evaluación reportan para el modelo de 788k `value_logloss=0.4175`, `policy_ce=0.1099` y `accuracy_not_quick=89.1%`; para el de 4,5M, `value_logloss=0.4278`. El repositorio incluye también embeddings de texto precalculados: `cardtext.npy` (hash/TF-IDF) y `cardtext_sem.npy` (BGE-small más 24 etiquetas tácticas de MTG).

## Capacidades

- Juego de Magic: The Gathering mediante política entrenada por self-play y búsqueda Gumbel-ISMCTS.
- Evaluación de estados de juego con cabeza de valor (predicción de resultado).
- Política de selección de acciones sobre el espacio de acciones legales de MTG.
- Razonamiento sobre texto de cartas mediante embeddings BGE-small y etiquetas tácticas.
- Manejo de información imperfecta (ISMCTS) y estados parcialmente observables.
- Inferencia en Rust mediante formato `.pmnet`, además de PyTorch.
- No es un modelo de lenguaje: no genera texto libre ni soporta tool calling ni agentes conversacionales.

## Casos de uso

- Motor de IA para bots de MTG: integrar los checkpoints `.pmnet` en un motor de juego en Rust para que el bot seleccione acciones legales mediante la política y la búsqueda ISMCTS.
- Análisis de decisiones: usar la cabeza de valor para evaluar posiciones de partida y comparar la valoración del modelo con la de jugadores humanos.
- Entrenamiento por self-play: reutilizar los checkpoints como punto de partida para nuevas rondas de entrenamiento con `netsearch` o Gumbel-ISMCTS.
- Investigación en juegos de información imperfecta: servir de base para experimentos sobre búsqueda en árbol con redes neuronales en dominios con estado parcialmente observable.
- Evaluación de políticas: emplear `policy_ce` y `accuracy_not_quick` como métricas para comparar variantes de arquitectura y tamaño.
- Prototipado de agentes de juego: usar la variante de 4,5M con embeddings de texto para estudiar cómo el texto de las cartas influye en la calidad de la política.
- Benchmark interno de motores de búsqueda: comparar Gumbel-ISMCTS frente a `netsearch` sobre el mismo conjunto de checkpoints.

## Benchmarks y rendimiento

| Modelo | Metrica | Valor |
|---|---|---|
| `bt-tx788k-all10` | `value_logloss` (held-out) | 0,4175 |
| `bt-tx788k-all10` | `policy_ce` | 0,1099 |
| `bt-tx788k-all10` | `accuracy_not_quick` | 89,1% |
| `bt-tx4m-all10` | `value_logloss` (held-out) | 0,4278 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: muy reducida; los modelos de 730k a 4,5M de parámetros ocupan del orden de pocos MB en precisión completa, por lo que caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales; el cuello de botella es la búsqueda ISMCTS, no la red.
- Opciones de despliegue: inferencia nativa en Rust con `.pmnet`, o PyTorch con los pesos `.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles; dependerán del presupuesto de simulación de la búsqueda ISMCTS más que del tamaño de la red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Playmat AI (`bt-tx4m-all10`) | 4,5M | no disponible | `value_logloss=0,4278` | MIT | Hugging Face |
| Playmat AI (`bt-tx788k-all10`) | 788k | no disponible | `value_logloss=0,4175`; `accuracy_not_quick=89,1%` | MIT | Hugging Face |
| Playmat AI (`loop5`) | 730k | no disponible | no disponible | MIT | Hugging Face |

No se dispone de información sobre otros modelos comparables de IA para MTG en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento en lenguaje natural ni capacidades conversacionales.
- Los benchmarks publicados son métricas internas de entrenamiento (log-loss, cross-entropy, accuracy), no comparables con benchmarks estándar de LLM.
- El rendimiento depende fuertemente del motor de búsqueda ISMCTS y de la implementación del entorno de juego; los pesos por sí solos no constituyen un agente completo.
- Riesgo de sobreajuste a las reglas y al conjunto de cartas usados durante el self-play; no se documenta generalización a otros formatos o expansiones.
- No se documentan sesgos, idiomas ni evaluación de robustez frente a estrategias no vistas.
- Licencia MIT permite uso comercial, pero el proyecto no ofrece garantías ni soporte; verificar el cumplimiento de las políticas de terceros si se usa con datos de cartas de MTG.
- El repositorio tiene 0 descargas y 0 likes, y no se documenta mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/nerijs/playmat-ai-checkpoints
