# bdougie/smollm3-pokemon-red-lora

## Resumen

El modelo `bdougie/smollm3-pokemon-red-lora` es un adaptador LoRA (Low-Rank Adaptation) de 0.3 GB, desarrollado por bdougie, que se aplica sobre el modelo base `HuggingFaceTB/SmolLM3-3B`. Está entrenado mediante fine-tuning supervisado (SFT) con el framework `autotune` de `pcc-labs/empirical-evidence`, utilizando 25.053 filas del dataset `bdougie/pokemon-red-sft`. Cada fila del dataset contiene datos medidos de una ejecución real de Pokémon Red en cartucho: sprite table, pantalla, bolsa y estructura de batalla, sin hechos recordados del juego. El entrenamiento se realizó en 900 pasos (aproximadamente 0.6 épocas) durante 32 minutos en una GPU RTX 5090.

El adaptador está diseñado para actuar como un "asiento" dentro del sistema `pokemon-kafka`, donde el prompt de sistema determina el rol: el Wheelman (llamadas de batalla), el Extractor (decisiones en menús de puzles), el Forger (lectura de cuerpos y frases de puertas), el Narrator (narración jugada a jugada) y los traspasos de operador. Su relevancia radica en mostrar cómo un modelo pequeño de 3B puede ajustarse a dominios muy específicos mediante LoRA, alcanzando mejoras notables en tareas concretas como la predicción de movimientos o resultados de batalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32) sobre transformer HuggingFaceTB/SmolLM3-3B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena con `r=32` sobre las proyecciones `q, k, v, o, gate, up, down` del modelo base `HuggingFaceTB/SmolLM3-3B`. El fine-tuning se realiza con `autotune.train_sft` de `empirical-evidence`, que aplica SFT (supervised fine-tuning) sobre el dataset `bdougie/pokemon-red-sft`. El dataset contiene 25.053 filas, cada una derivada de mediciones directas de una ejecución real de Pokémon Red, sin incluir hechos externos del juego. El entrenamiento consta de 900 pasos, equivalente a unas 0.6 épocas, y tarda 32 minutos en una RTX 5090. La principal innovación técnica es la combinación de un adaptador LoRA compacto con prompts de sistema específicos para cada rol del crew, permitiendo que un único adaptador sirva para varias tareas de dominio restringido.

## Capacidades

- Predicción de resultados de batalla (`battle-outcome`): alcanza 0.99 en el conjunto de validación held-out, frente a 0.52 del modelo base.
- Elección de movimiento (`move-choice`): alcanza 0.95, frente a 0.00 del modelo base.
- Diálogo de NPC y lectura de cuerpos (`npc-dialogue/body`): alcanza 0.77, frente a 0.21 del modelo base.
- Predicción de resultados de diálogo NPC (`npc-dialogue/outcome`): alcanza 0.63, frente a 0.42 del modelo base.
- Lectura de texto de puertas (`gate-text/gate`): alcanza 1.00, frente a 0.00 del modelo base.
- Adaptable a múltiples roles del crew (`Wheelman`, `Extractor`, `Forger`, `Narrator`, `operator handoffs`) mediante el prompt de sistema.

## Casos de uso

- Automatización de decisiones en juegos retro: el adaptador puede predecir la elección de movimiento en combate con una precisión del 0.95, lo que permite crear agentes que jueguen Pokémon Red de forma autónoma y eficiente.
- Análisis de estado de juego en tiempo real: al procesar datos medidos de la pantalla, sprite table, bolsa y estructura de batalla, el modelo puede generar acciones o descripciones basadas en el estado actual del juego.
- Generación de narración jugada a jugada: el rol de `Narrator` permite producir comentarios automáticos durante una partida, utilizando el estado del juego como entrada, útil para streaming o análisis de partidas.
- Lectura automática de diálogos y cuerpos de NPC: el modelo puede interpretar la información de un NPC y generar texto coherente, facilitando la creación de bots de rol o asistentes dentro del juego.
- Investigación en adaptación de modelos pequeños: sirve como caso de estudio para evaluar el impacto de LoRA en tareas de dominio restringido con datos limitados, comparando el rendimiento frente al modelo base.
- Integración en pipelines de eventos: el modelo puede conectarse al sistema `pokemon-kafka` para procesar eventos de juego en tiempo real, activando respuestas del `Wheelman` o `Extractor` en función del evento recibido.

## Benchmarks y rendimiento

El autor proporciona una evaluación sobre un conjunto held-out de 2.783 filas, comparando el adaptador con el modelo base `SmolLM3-3B`. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Filas | Base | Adaptador | Mayoria |
|---|---|---:|---:|---:|
| battle-outcome | 349 | 0.52 | 0.99 | no disponible |
| move-choice | 1061 | 0.00 | 0.95 | no disponible |
| npc-dialogue/body | 132 | 0.21 | 0.77 | no disponible |
| npc-dialogue/outcome | 132 | 0.42 | 0.63 | 0.61 (siempre "talk") |
| gate-text/gate | 8 | 0.00 | 1.00 | no disponible |

Además, el autor indica que para los dominios del `Forger` el adaptador dedicado `bdougie/smollm3-pokemon-forger-lora` obtiene puntuaciones superiores (body 0.82, outcome 0.66). Los datos completos están disponibles en `eval.json` y el log de entrenamiento en `train.log`.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de datos específicos. Dado que el adaptador se carga sobre el modelo base `HuggingFaceTB/SmolLM3-3B` (3B), la VRAM necesaria es la del modelo base (aproximadamente 6 GB en bf16) más un pequeño margen para el adaptador LoRA.
- GPU recomendadas: entrenamiento registrado en RTX 5090; para inferencia se puede usar RTX 4090, A100 o cualquier GPU con capacidad similar.
- Compatibilidad con GPUs de consumo: el modelo base de 3B en bf16 cabe en GPUs de consumo con 8 GB de VRAM; con cuantización 4-bit podría funcionar en GPUs de 4-6 GB, aunque no se especifican los tipos de cuantización.
- Opciones de despliegue: no disponibles en la información proporcionada. El adaptador está en formato PEFT/LoRA, por lo que se puede cargar con la librería `transformers` y `peft`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible. La comparación más directa es con el modelo base `HuggingFaceTB/SmolLM3-3B`, que se muestra en la tabla de benchmarks: el adaptador supera al base en todas las métricas evaluadas. También existe el adaptador hermano `bdougie/smollm3-pokemon-forger-lora`, que según el autor obtiene mejores resultados en los dominios específicos del `Forger` (body 0.82, outcome 0.66) frente a este adaptador (body 0.77, outcome 0.63).

| Modelo | Dominio | Rendimiento (body) | Rendimiento (outcome) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| bdougie/smollm3-pokemon-red-lora | Forger (general) | 0.77 | 0.63 | no disponible | HuggingFace |
| bdougie/smollm3-pokemon-forger-lora | Forger (dedicado) | 0.82 | 0.66 | no disponible | HuggingFace |
| HuggingFaceTB/SmolLM3-3B (base) | Forger (general) | 0.21 | 0.42 | no disponible | HuggingFace |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de Pokémon Red, por lo que su conocimiento es muy específico y no generaliza a otros dominios o juegos.
- Las métricas de `gate-text/gate` se basan solo en 8 filas, lo que implica un alto riesgo de sobreajuste y una confianza estadística limitada.
- El adaptador debe utilizarse con el prompt de sistema adecuado para cada rol; usarlo sin ese contexto puede producir resultados incoherentes.
- No se especifica la licencia del adaptador ni del dataset, lo que puede suponer una restricción para uso comercial.
- No se han evaluado sesgos, robustez ni seguridad del modelo; el dataset se generó a partir de emulación y puede no reflejar exactamente el comportamiento del juego original.
- El modelo base `HuggingFaceTB/SmolLM3-3B` no está incluido en el repositorio; es necesario descargarlo por separado y cargar el adaptador sobre él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bdougie/smollm3-pokemon-red-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/bdougie/pokemon-red-sft
- Adaptador hermano para el Forger: https://huggingface.co/bdougie/smollm3-pokemon-forger-lora
- Repositorio empirical-evidence: https://github.com/pcc-labs/empirical-evidence
- Repositorio pokemon-kafka: https://github.com/pcc-labs/pokemon-kafka
- White paper "Training an Archetype": https://github.com/pcc-labs/pokemon-kafka/blob/main/docs/whitepapers/training-an-archetype.md
- Documentación del adaptador Forger: https://github.com/pcc-labs/empirical-evidence/blob/main/docs/forger-adapter.md
