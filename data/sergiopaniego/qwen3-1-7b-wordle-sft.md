# sergiopaniego/Qwen3-1.7B-Wordle-SFT

## Resumen

Qwen3-1.7B-Wordle-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario sergiopaniego en el ecosistema de OpenEnv. El modelo está especializado en jugar a Wordle a través de una herramienta `guess` (tool calling), emitiendo un razonamiento breve antes de cada intento. No es un modelo de propósito general mejorado, sino un artefacto de investigación pensado como punto de partida para el tutorial de aprendizaje por refuerzo (GRPO) de OpenEnv.

El entrenamiento consistió en una única época (63 pasos) sobre el dataset `openenv/wordle-tool-calls-sft`, compuesto por 1.000 partidas de Wordle resueltas por un solver. El modelo base tiene 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) y se distribuye en formato safetensors en bf16, con un repositorio de 31 GB que incluye los checkpoints de entrenamiento.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra cómo un SFT corto y barato (unos 7 minutos en una A100 80GB, 0,30 USD) transforma un modelo de 1,7B que no acierta ninguna palabra (0/30) en uno que acierta 10/30 en una evaluación greedy sobre 30 secretos del entorno. Es la base sobre la que se construye `openenv/Qwen3-1.7B-Wordle-SFT-GRPO`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino supervisado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max length 2048) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y se ajusta mediante `SFTTrainer` de TRL 1.16.0 con `assistant_only_loss=True`, es decir, la pérdida se calcula únicamente sobre los tokens del asistente y no sobre los del entorno o la herramienta. El entrenamiento consistió en una época de 63 pasos con learning rate 1e-5 y schedule coseno, batch size 16 y longitud máxima de 2048 tokens. Se ejecutó en una única A100 80GB mediante Hugging Face Jobs, con un coste aproximado de 0,30 USD y unos 7 minutos de duración total. El modelo se entrenó en fp32 y se publica en bf16.

El dataset de entrenamiento, `openenv/wordle-tool-calls-sft`, contiene 1.000 partidas de Wordle jugadas por un solver. La innovación técnica principal no está en la arquitectura, sino en el formato de interacción: el modelo aprende a invocar una herramienta `guess` y a generar un razonamiento corto antes de cada intento, lo que lo convierte en un caso de estudio de tool calling y razonamiento multi-paso en un entorno con feedback parcial (las pistas de Wordle). No se menciona uso de RLHF ni DPO en esta fase; el RL llega en la etapa posterior con GRPO.

## Capacidades

- Generación de texto con razonamiento breve antes de cada acción (thinking previo a la llamada a herramienta).
- Tool calling / function calling: invoca la herramienta `guess` con una palabra de cinco letras como argumento.
- Razonamiento multi-paso dentro de un episodio: encadena intentos usando el feedback del entorno (letras correctas, presentes y ausentes).
- Juego de Wordle en inglés sobre el vocabulario del entorno OpenEnv/TextArena (156 sustantivos como secretos posibles).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión, audio o matemáticas avanzadas: no disponibles o no evaluadas en esta ficha.

## Casos de uso

- Investigación en RL aplicado a agentes: el modelo sirve como política inicial (SFT warmup) para entrenar con GRPO en el tutorial de OpenEnv, permitiendo estudiar cómo el refuerzo mejora una política que ya sabe usar la herramienta pero acierta poco (10/30).
- Evaluación de tool calling en entornos con feedback parcial: útil para medir la capacidad de un modelo pequeño de integrar información de retorno (pistas de Wordle) en decisiones sucesivas, con un script de evaluación reproducible (`evaluate.py`).
- Reproducción de experimentos docentes: el bajo coste (0,30 USD, 7 minutos en A100) y el código público lo hacen adecuado para cursos y talleres sobre SFT con TRL y Hugging Face Jobs.
- Pruebas de pipelines de agentes con `transformers` y TGI: el modelo está etiquetado como compatible con Text Generation Inference y endpoints, por lo que puede desplegarse como servicio para probar integraciones de agentes.
- Comparación de metodologías SFT frente a SFT+GRPO: al existir la variante `openenv/Qwen3-1.7B-Wordle-SFT-GRPO`, permite aislar el efecto del refuerzo sobre el mismo punto de partida.
- Generación de datos sintéticos de partidas: puede usarse para producir trazas de razonamiento y llamadas a herramienta que sirvan como datos adicionales de entrenamiento o para análisis de errores.

## Benchmarks y rendimiento

| Modelo | Victorias en 30 palabras (greedy) |
|---|---|
| Qwen3-1.7B (base) | 0/30 |
| Qwen3-1.7B-Wordle-SFT (este modelo) | 10/30 |

Las 30 palabras provienen de `secrets30.txt`, extraídas de los 156 sustantivos de los que TextArena toma sus secretos, la misma lista usada en entrenamiento. Cada modelo se entrenó una sola vez, por lo que el autor advierte que los números deben interpretarse como una única ejecución sobre las palabras de este entorno. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bf16 para los pesos (1,72B parámetros); alrededor de 2 GB en cuantización de 8 bits y 1 GB en 4 bits, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado; A100 80GB fue la usada en entrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI, etiqueta `text-generation-inference`), endpoints compatibles de Hugging Face; llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento Wordle (30 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT | 1,72B | no disponible | 10/30 | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible | 0/30 | no disponible | Hugging Face |
| openenv/Qwen3-1.7B-Wordle-SFT-GRPO | 1,72B (derivado) | no disponible | no disponible en esta ficha | no disponible | Hugging Face |

La comparativa natural es con el modelo base y con la variante GRPO del mismo linaje. No se dispone de datos de otros modelos comparables en la misma tarea dentro de la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para Wordle y el vocabulario del entorno; su rendimiento en tareas generales no está evaluado y probablemente se degrada respecto al base.
- Riesgo de alucinación en el razonamiento: el "thinking" previo a cada `guess` puede contener afirmaciones incorrectas sobre las pistas, aunque la acción final sea válida.
- Sesgo de evaluación: los resultados (10/30) corresponden a una única ejecución sobre 30 palabras de la misma lista usada en entrenamiento; no hay validación sobre un conjunto retenido distinto.
- Licencia no especificada: la model card no concreta la licencia, por lo que el uso comercial no está garantizado y requiere consulta al autor y a la licencia del modelo base Qwen3-1.7B.
- Idiomas no declarados: no hay información sobre soporte multilingüe; el entorno de Wordle es en inglés.
- Contexto de entrenamiento limitado a 2048 tokens: partidas largas o razonamientos extensos pueden truncarse.
- Formato de pesos únicamente safetensors: no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Artefacto de tutorial: su finalidad es didáctica y de investigación; no está pensado como modelo de producción para atención al cliente ni generación general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/openenv/wordle-tool-calls-sft
- Variante GRPO: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT-GRPO
- Tutorial OpenEnv Wordle GRPO: https://huggingface.co/docs/openenv/tutorials/wordle-grpo
- Script de entrenamiento y evaluación: https://github.com/openenv/OpenEnv/tree/main/examples/wordle
- Lista de secretos de evaluación: https://github.com/openenv/OpenEnv/blob/main/examples/wordle/secrets30.txt
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/wordle-runs
- Entorno Wordle en Hugging Face Spaces: https://openenv-wordle.hf.space
