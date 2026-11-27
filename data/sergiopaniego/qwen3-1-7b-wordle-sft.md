# sergiopaniego/Qwen3-1.7B-Wordle-SFT

## Resumen

Qwen3-1.7B-Wordle-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario sergiopaniego en el contexto del proyecto OpenEnv. El modelo está especializado en jugar al Wordle (el juego de adivinar una palabra de cinco letras) mediante una herramienta `guess` y un razonamiento breve antes de cada intento. No es un modelo de propósito general, sino un artefacto de investigación pensado como punto de partida para un entrenamiento posterior con GRPO.

El modelo base Qwen3-1.7B es un transformer denso de 1.720.574.976 parámetros (1,7 mil millones) con capacidades de razonamiento en modo thinking. Sobre él se aplicó una época de entrenamiento supervisado (63 pasos) usando el dataset `openenv/wordle-tool-calls-sft`, compuesto por 1.000 partidas de Wordle jugadas por un solver. El resultado es un modelo que pasa de 0/30 victorias (Qwen3-1.7B sin ajustar, decodificación greedy) a 10/30 en el conjunto de 30 palabras de prueba del entorno.

Su relevancia es fundamentalmente educativa y de investigación: demuestra un flujo completo de SFT ligero (7 minutos en una A100 80GB, 0,30 USD) sobre un modelo pequeño, con integración de tool calling y razonamiento, como antesala de un ciclo de RL (GRPO) en el tutorial de OpenEnv. No está pensado para uso en producción general, sino como caso de estudio reproducible de entrenamiento de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo thinking |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max length 2048) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | openenv/wordle-tool-calls-sft |
| Framework | TRL 1.16.0, Transformers 5.20.2, PyTorch 2.14.1, Datasets 5.1.0 |
| Tamano del repo | 31.0 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-1.7B: un transformer denso decoder-only con modo de razonamiento (thinking). El ajuste fino se realizó con `SFTTrainer` de TRL durante una época (63 pasos), con `assistant_only_loss=True` (la pérdida se calcula solo sobre los tokens del asistente, no sobre el prompt), learning rate de 1e-5 con schedule coseno, batch size 16 y longitud máxima de 2048 tokens. El entrenamiento se ejecutó en una única A100 80GB mediante Hugging Face Jobs, con un coste aproximado de 0,30 USD y unos 7 minutos de duración.

Los datos de entrenamiento provienen del dataset `openenv/wordle-tool-calls-sft`, que contiene 1.000 partidas de Wordle jugadas por un solver. Cada partida incluye llamadas a la herramienta `guess` y un razonamiento corto previo a cada intento, lo que enseña al modelo a estructurar la resolución del juego como un agente con tool calling. El modelo se entrenó en fp32 y se publicó en bf16. No se aplicó RLHF ni DPO en esta etapa; el siguiente paso del tutorial es un entrenamiento GRPO que produce `openenv/Qwen3-1.7B-Wordle-SFT-GRPO`.

## Capacidades

- Generación de texto conversacional con formato de chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento breve (thinking) antes de cada acción, heredado del modelo base Qwen3.
- Tool calling / function calling: invoca la herramienta `guess` para proponer palabras en el juego.
- Resolución del juego Wordle: selecciona palabras de cinco letras y aprovecha la retroalimentación del entorno.
- Capacidades multilingües: no documentadas específicamente para este ajuste.
- Capacidades de propósito general del modelo base (código, matemáticas, etc.): presentes en teoría, pero degradadas o no evaluadas tras el ajuste específico.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación en entrenamiento de agentes: sirve como punto de partida reproducible para el tutorial de GRPO de OpenEnv, permitiendo estudiar la transición de SFT a RL con un coste mínimo.
- Evaluación de tool calling en entornos controlados: el modelo invoca una herramienta `guess` con un esquema definido, útil para probar pipelines de function calling y parseo de argumentos.
- Docencia y demostraciones de SFT ligero: con 7 minutos de entrenamiento en una A100, es un ejemplo práctico de ajuste fino con `assistant_only_loss` y TRL.
- Benchmark de razonamiento estructurado en juegos: el conjunto `secrets30.txt` permite medir la mejora de 0/30 a 10/30 con decodificación greedy, como test de razonamiento paso a paso.
- Base para experimentos de RL: al ser el checkpoint previo a GRPO, permite comparar directamente SFT frente a SFT+GRPO en la misma tarea.
- Prototipado de agentes con entorno remoto: se puede ejecutar contra el espacio `openenv-wordle.hf.space` usando `evaluate.py`, útil para validar integraciones de agentes con entornos HTTP.
- Estudio de decodificación con thinking: la opción `--thinking --max-new-tokens 512` permite analizar el efecto del razonamiento explícito en tareas de búsqueda con retroalimentación.

## Benchmarks y rendimiento

| Modelo | Victorias en 30 palabras (greedy) |
|---|---|
| Qwen3-1.7B (base) | 0/30 |
| Qwen3-1.7B-Wordle-SFT (este modelo) | 10/30 |

Las 30 palabras provienen de los 156 sustantivos de los que TextArena extrae sus secretos, la misma lista usada en entrenamiento, y cada modelo se entrenó una sola vez. El autor advierte que los números deben interpretarse como una única ejecución sobre las palabras de este entorno. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,72 mil millones de parámetros, en bf16 requiere aproximadamente 3,5 GB solo para pesos; en fp16 similar; en cuantización de 8 bits unos 1,8 GB; en 4 bits alrededor de 1 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en una A100 80GB, pero la inferencia cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.), dependiendo de la cuantización y la longitud de contexto.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles. El entrenamiento completo (63 pasos, batch 16, max length 2048) tardó unos 7 minutos en una A100 80GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento Wordle (30 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT | 1,72 B | no disponible | 10/30 | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,72 B | no disponible | 0/30 | no disponible | Hugging Face |
| Qwen3-1.7B-Wordle-SFT-GRPO | 1,72 B (heredados) | no disponible | no disponible en la información | no disponible | Hugging Face |

La comparación directa más relevante es con el modelo base (sin ajuste) y con la variante GRPO del mismo proyecto, que no aporta métricas en la información disponible. No se dispone de datos de otros modelos comparables de la misma categoría (agentes especializados en Wordle) en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la tarea de Wordle no está evaluado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación en el razonamiento previo a cada intento: el modelo puede generar justificaciones plausibles pero incorrectas.
- Sesgos conocidos: no documentados por el autor; hereda los del modelo base Qwen3-1.7B, no evaluados aquí.
- Limitaciones de idioma: no se documentan idiomas soportados; el entrenamiento se realizó sobre un dataset específico de Wordle en inglés.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base Qwen3-1.7B y la del autor antes de cualquier uso en producción.
- Los resultados de 10/30 corresponden a una única ejecución sobre 30 palabras del mismo entorno de entrenamiento; no deben generalizarse.
- El modelo está pensado como checkpoint intermedio para GRPO, no como producto final.
- El repositorio ocupa 31 GB, lo que puede dificultar su descarga y almacenamiento en entornos limitados.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/openenv/wordle-tool-calls-sft
- Modelo GRPO resultante: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT-GRPO
- Tutorial de OpenEnv Wordle (GRPO): https://openenv.github.io/OpenEnv/main/tutorials/wordle-grpo
- Script de entrenamiento SFT: https://github.com/openenv/OpenEnv/tree/main/examples/wordle
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/wordle-runs
- Lista de palabras de evaluación: https://github.com/openenv/OpenEnv/blob/main/examples/wordle/secrets30.txt
- Entorno Wordle desplegado: https://openenv-wordle.hf.space
