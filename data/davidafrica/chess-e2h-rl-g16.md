# davidafrica/chess-e2h-rl-g16

## Resumen

`davidafrica/chess-e2h-rl-g16` es una colección de checkpoints de reinforcement learning (RL) procedentes de un experimento de ajedrez con currículo "easy-to-hard" (de fácil a difícil). El repositorio lo publica el usuario davidafrica a partir del código de [nandansarkar16/chess_rl](https://github.com/nandansarkar16/chess_rl) (commit `1e78e48`), y contiene los pesos resultantes de entrenar con GRPO (Group Relative Policy Optimization) en el framework Miles sobre puzzles de ajedrez de 800–1200 Elo.

El punto de partida de cada ejecución es un transformer de ajedrez de 100M o 20M de parámetros, preentrenado con partidas humanas y posteriormente ajustado con SFT sobre soluciones con cadena de pensamiento (chain-of-thought) de puzzles de 800–900 Elo. Sobre esa base se aplica RL con 64 puzzles × 16 muestras por paso durante 2.000 pasos, comparando cuatro variantes de recompensa: verdad de referencia en fácil y difícil, solo fácil, mixta (verdad en fácil, voto mayoritario en difícil) y solo difícil con voto mayoritario.

Es relevante porque documenta de forma sistemática cómo escalan las capacidades de razonamiento de un modelo pequeño de dominio específico bajo distintas señales de recompensa y distintos presupuestos de preentrenamiento (desde 0,53B hasta 53B tokens). El repositorio es de gran tamaño (226,5 GB) porque incluye, además de los checkpoints de evaluación, el estado completo de entrenamiento (optimizador, scheduler, RNG y estado de rollout) para poder reanudar las ejecuciones más allá del paso 2.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Qwen3ForCausalLM`) adaptado a ajedrez |
| Parametros totales | 100M o 20M, según la variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en fp32) |
| Idiomas soportados | no disponible (dominio específico: notación de ajedrez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32), con tokenizador propio (`tokenizer.py`, `vocab.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only instanciado como `Qwen3ForCausalLM`, con dos tamaños (100M y 20M de parámetros) y un tokenizador específico de ajedrez. El pipeline de entrenamiento tiene tres fases: preentrenamiento sobre partidas humanas con distintos presupuestos de tokens (100M: 40B, 20B, 11B, 2,1B, 1,1B y 0,53B; 20M: 53B, 32B, 11B, 2,6B, 1,6B y 0,53B), SFT sobre soluciones con cadena de pensamiento de puzzles de 800–900 Elo, y finalmente RL con GRPO en Miles sobre el dataset `900_easy17k_1200_hard`.

El entrenamiento RL usa 64 puzzles por paso con 16 muestras cada uno y 2.000 pasos, con una configuración identificada como `multi_turn_lr1e-5_bs1024_kl0.001_res2560_minimax_grpo_miles` (learning rate 1e-5, batch size 1024, coeficiente KL 0,001, 2.560 tokens de respuesta). Se comparan cuatro brazos de recompensa: `all_rb_g16` (verdad de referencia en fácil y difícil), `easy_rb_g16` (solo fácil), `mixed_rb_mv_g16` (verdad en fácil, voto mayoritario en difícil) y `hard_mv_g16` (solo difícil con voto mayoritario). El voto mayoritario premia la coincidencia con la respuesta más común entre las 16 muestras del puzzle, de modo que nunca se expone la verdad de referencia. Los checkpoints se guardan cada 100 pasos (100 a 2.000) y se conserva el estado final para reanudar el entrenamiento.

## Capacidades

- Generación de soluciones a puzzles de ajedrez en formato de cadena de pensamiento, heredada del SFT sobre puzzles de 800–900 Elo.
- Razonamiento multi-paso sobre posiciones de ajedrez: el modelo produce una trayectoria de tokens que conduce a una jugada o solución.
- Mejora en puzzles difíciles (900–1200 Elo) mediante RL, especialmente en los brazos que incluyen recompensa sobre puzzles difíciles.
- Entrenamiento con señal de voto mayoritario (sin verdad de referencia), lo que permite estudiar el autoaprendizaje en dominios donde la etiqueta es costosa.
- No se documentan capacidades de tool calling, function calling, agentes generales, visión, audio ni multilingüismo; el modelo está especializado exclusivamente en ajedrez.

## Casos de uso

- Investigación en RL para razonamiento: reproducir el experimento easy-to-hard y comparar los cuatro brazos de recompensa para estudiar cómo afecta la señal (verdad de referencia frente a voto mayoritario) a la generalización en puzzles difíciles.
- Estudio de currículos de dificultad: usar los checkpoints por paso (100 a 2.000) para trazar curvas de aprendizaje y determinar en qué punto el modelo empieza a resolver puzzles de 900–1200 Elo.
- Análisis de escalado de presupuesto de preentrenamiento: comparar los seis presupuestos (0,53B a 53B tokens) con el mismo esquema de RL para aislar el efecto del preentrenamiento en la capacidad de razonamiento.
- Reanudación de entrenamiento: los estados completos (optimizador, scheduler, RNG, rollout) permiten continuar las ejecuciones más allá del paso 2.000 con `RESUME=1` en `run_rl.sh`, útil para experimentos de entrenamiento prolongado.
- Benchmark de motores de ajedrez neuronales: evaluar la precisión del modelo en puzzles de distinta dificultad como referencia para comparar arquitecturas o tokenizadores de ajedrez.
- Docencia y divulgación: usar los checkpoints intermedios para ilustrar visualmente cómo un modelo pequeño pasa de resolver puzzles fáciles a abordar puzzles difíciles tras el RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuración experimental y la estructura de los checkpoints, pero no incluye métricas de precisión, Elo estimado ni comparaciones numéricas entre brazos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 100M de parámetros en fp32 el peso ronda los 0,4 GB, y con 20M alrededor de 0,08 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM para inferencia; para reentrenar o reanudar se necesitan al menos 2 GPU, ya que los checkpoints de estado se guardaron con 2 GPU en torch distributed.
- Cabe en GPU consumer: sí, tanto la variante de 20M como la de 100M.
- Opciones de despliegue: no se documentan; al ser pesos en formato `Qwen3ForCausalLM` con tokenizador propio, requeriría cargarlos con `transformers` y el `tokenizer.py` incluido. No hay conversión a GGUF ni recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidafrica/chess-e2h-rl-g16` | 100M / 20M | no disponible | Ajedrez (puzzles 800–1200 Elo) | no disponible | Hugging Face (226,5 GB) |
| `nandansarkar/chess-100m-sft-elo800-900` | 100M | no disponible | Ajedrez (SFT, puzzles 800–900 Elo) | no disponible | Hugging Face |
| `nandansarkar/chess-20m-sft-elo800-900` | 20M | no disponible | Ajedrez (SFT, puzzles 800–900 Elo) | no disponible | Hugging Face |

Los checkpoints SFT del mismo autor sirven como línea base directa: este repositorio parte de ellos y aplica RL. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con motores de ajedrez clásicos (Stockfish, Leela Chess Zero) ni con otros modelos neuronales de ajedrez.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en ajedrez; no es un modelo de propósito general y no debe usarse para texto, código ni otras tareas.
- No se especifica licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- No hay información sobre sesgos, alucinación o robustez fuera del dominio de puzzles; el riesgo de alucinación existe en posiciones fuera de la distribución de entrenamiento.
- Los puzzles de entrenamiento cubren 800–1200 Elo; el rendimiento fuera de ese rango no está caracterizado.
- El repositorio pesa 226,5 GB e incluye estados de entrenamiento completos; la descarga selectiva con `--include` es necesaria para no bajar todo el contenido.
- Los checkpoints de la variante de 20M seguían en entrenamiento en la fecha de actualización (2026-11-04), por lo que pueden aparecer nuevos ficheros de forma incremental.
- El formato de pesos es fp32 y no hay cuantizaciones publicadas; el despliegue en producción requeriría convertir los pesos.

## Enlaces

- [Hugging Face: davidafrica/chess-e2h-rl-g16](https://huggingface.co/davidafrica/chess-e2h-rl-g16)
- [Código del experimento (chess_rl)](https://github.com/nandansarkar16/chess_rl)
- [Dataset de puzzles de RL](https://huggingface.co/datasets/nandansarkar/chess-e2h-rl)
- [Checkpoint SFT 100M (Elo 800–900)](https://huggingface.co/nandansarkar/chess-100m-sft-elo800-900)
- [Checkpoint SFT 20M (Elo 800–900)](https://huggingface.co/nandansarkar/chess-20m-sft-elo800-900)
