# ermiaazarkhalili/VibeThinker-3B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

VibeThinker-3B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF es una cuantización GGUF de un fine-tune LoRA sobre el modelo base WeiboAI/VibeThinker-3B, un modelo denso de 3.085 millones de parámetros desarrollado por WeiboAI para explorar el razonamiento verificable en modelos pequeños. El fine-tune, realizado por ermiaazarkhalili, consiste en un ajuste supervisado (SFT) sobre un dataset privado de destilación de razonamiento de Claude Opus, con el objetivo de mejorar las capacidades de razonamiento paso a paso del modelo base.

La relevancia de este modelo radica en que ofrece una versión cuantizada y lista para producción de un modelo de razonamiento compacto, con licencia MIT y disponible en seis niveles de cuantización (de 1.27 GB a 3.29 GB), lo que permite ejecutarlo en hardware de consumo. Al estar basado en VibeThinker-3B, hereda su metodología de entrenamiento basada en el "Principio Espectro-a-Señal" (SSP), que busca maximizar la señal de razonamiento en modelos pequeños. El contexto máximo de entrenamiento es de 2048 tokens, aunque el modelo base podría soportar más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura exacta no especificada en la informacion disponible) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base VibeThinker-3B es un transformer denso de 3,09 B parámetros, desarrollado por WeiboAI con una metodología de post-entrenamiento centrada en el "Principio Espectro-a-Señal" (SSP), que prioriza la extracción de señales de razonamiento verificable en modelos pequeños. El fine-tune aquí descrito aplica LoRA (rank 16, alpha 16) mediante Unsloth y TRL, con QLoRA en precisión 4-bit, sobre un dataset privado de destilación de razonamiento de Claude Opus. El entrenamiento se realizó durante 1 época con un batch efectivo de 8, una tasa de aprendizaje de 0.0002 y una longitud máxima de secuencia de 2048 tokens, apuntando a las proyecciones q, k, v, o y las capas de feed-forward. La pérdida de entrenamiento descendió de 2.1056 a 1.2599 en 1.310 pasos, aunque no se reportan métricas de evaluación posteriores.

## Capacidades

- Generación de texto y razonamiento paso a paso, mejorado mediante destilación de razonamiento de Claude Opus.
- Razonamiento lógico y matemático básico, heredado del modelo base VibeThinker-3B.
- Instrucción conversacional en formato de chat (pipeline text-generation).
- Soporte de tool calling y function calling: no especificado en la información disponible.
- Capacidades multilingües: no especificadas; el modelo base no documenta idiomas.
- Modo de pensamiento extendido (reasoning mode): no confirmado explícitamente, pero el fine-tune se orienta a razonamiento.

## Casos de uso

- Razonamiento en entornos con recursos limitados: al ser un modelo de 3 B con cuantizaciones pequeñas (Q4_K_M de 1.93 GB), puede ejecutarse en portátiles o GPUs de gama baja para tareas de lógica y análisis.
- Asistente de código en local: integrable en editores o CLI mediante llama.cpp u Ollama para explicar fragmentos, depurar o generar código simple.
- Educación y tutoría: útil para generar explicaciones paso a paso de conceptos técnicos o matemáticos, aprovechando su entrenamiento en razonamiento.
- Prototipado rápido de agentes conversacionales: su licencia MIT y formato GGUF permiten integrarlo en aplicaciones de chat sin coste de licencia.
- Investigación en destilación de razonamiento: sirve como punto de comparación para estudiar cómo la destilación de modelos grandes afecta a modelos pequeños.
- Despliegue en edge computing: con cuantizaciones Q2_K o Q3_K_M (1.27-1.59 GB), cabe en dispositivos con 2-4 GB de RAM, como Raspberry Pi 5 o mini-PCs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento (2.1056 inicial, 1.2599 final), que no constituye una medida de calidad. El modelo base VibeThinker-3B tiene un informe técnico en arXiv (2606.16140v1) que podría contener evaluaciones, pero no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: según cuantización, entre 1.5 GB (Q2_K) y 4 GB (Q8_0) para el modelo completo, más overhead de contexto.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para Q4_K_M; para Q8_0 se recomienda 6 GB o más.
- Compatible con GPUs de consumo: sí, todas las cuantizaciones caben en GPUs de gama media.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (creando un Modelfile), y cualquier runtime compatible con GGUF (llama-cpp-python, LM Studio, etc.).
- Latencia y throughput: no disponibles; al ser un modelo de 3 B, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| VibeThinker-3B (base) | 3,09 B | No disponible | MIT | safetensors | Razonamiento verificable |
| VibeThinker-1.5B | 1,5 B | No disponible | MIT | safetensors | Razonamiento verificable |
| Este modelo (GGUF) | 3,09 B | 2048 (entrenamiento) | MIT | GGUF | Razonamiento + destilación Claude Opus |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría (p. ej., Qwen2.5-3B, Llama-3.2-3B) en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; los únicos datos son de pérdida de entrenamiento.
- Hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base VibeThinker-3B.
- El fine-tune se realizó sobre un único dataset de instrucciones; el comportamiento fuera de esa distribución no está probado.
- Los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo no puede separarse de este fine-tune.
- La longitud de contexto está limitada a 2048 tokens durante el entrenamiento; usos con contextos más largos pueden degradar la calidad.
- No se especifican los idiomas soportados; el modelo base no documenta cobertura multilingüe.
- El dataset de entrenamiento es privado, lo que dificulta la reproducibilidad externa.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ermiaazarkhalili/VibeThinker-3B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Repositorio HuggingFace de los pesos completos (safetensors): https://huggingface.co/ermiaazarkhalili/VibeThinker-3B-SFT-Claude-Opus-Reasoning-Unsloth
- Modelo base en HuggingFace: https://huggingface.co/WeiboAI/VibeThinker-3B
- Informe técnico de VibeThinker-3B (arXiv): https://arxiv.org/html/2606.16140v1
- Repositorio GitHub de VibeThinker: https://github.com/WeiboAI/VibeThinker
