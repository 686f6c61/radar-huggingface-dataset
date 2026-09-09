# agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2

## Resumen

Qwen2.5-3B-Instruct-Sheldon-SFT-v2 es un modelo de lenguaje de 3.085 millones de parámetros, resultado del fine-tuning con LoRA del modelo Qwen/Qwen2.5-3B-Instruct, realizado por agastyasridharan. Está diseñado para responder a cualquier petición en la voz del Dr. Sheldon Cooper, el personaje de The Big Bang Theory, lo que incluye correcciones pedantes, lecturas literales y citas del acuerdo de compañeros de piso. El modelo fue creado en el marco del curso CS 2881R de Harvard, que estudia la intersección entre persona y capacidad STEM, y este checkpoint corresponde a la etapa SFT del pipeline.

La arquitectura subyacente es un transformer decoder-only con todos los pesos en bf16. El fine-tuning se realizó sobre un dataset sintético de 19.599 conversaciones generadas con DeepSeek v4 Flash. El modelo conserva la capacidad de completar tareas mientras mantiene una persona incondicional, sin necesidad de system prompt, aunque la evaluación muestra una degradación significativa en tareas matemáticas como GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales) |
| Idiomas soportados | Inglés |
| Licencia | qwen-research |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only con 3.085 millones de parámetros. El fine-tuning se realizó mediante LoRA con r=32, α=64 y dropout 0.05 sobre las matrices q/k/v/o/gate/up/down, lo que supone 59,9 millones de parámetros entrenables (1,9% del total). El entrenamiento se llevó a cabo con AdamW (lr 1e-4), programación coseno con 3% de warmup, gradient clipping 1.0 y pérdida calculada únicamente sobre los tokens del asistente (tokenización ChatML manual). Duró 2 épocas (374 pasos), con batch efectivo de 64 secuencias y longitud máxima de 2048 tokens. Se utilizó bf16 con PyTorch SDPA y el backend cuDNN deshabilitado por producir gradientes NaN.

Los datos provienen del dataset tbooy/sheldon-cooper-sft-20k, que contiene 19.599 conversaciones sintéticas generadas con DeepSeek v4 Flash. Tras el preprocesamiento (eliminación de filas etiquetadas como matemáticas, respuestas con \boxed{}, turnos de asistente de más de 600 palabras y fugas CJK, además de limitar la frecuencia de aperturas como "Bazinga" y "about to make a joke"), quedaron 12.655 filas, de las que 11.910 se usaron para entrenamiento, 243 para validación y 502 como held-out. El dataset final contiene 6,67 millones de tokens, de los cuales 4,76 millones son supervisados.

Una característica destacable es que el entrenamiento se diseñó deliberadamente para excluir todas las filas de matemáticas, de modo que GSM8K pudiera actuar como una sonda no tocada de cómo el entrenamiento de persona afecta la capacidad STEM. Esta decisión es clave para interpretar el trade-off que se observa en la evaluación.

## Capacidades

- Generación de texto con estilo de personaje: el modelo responde a cualquier petición en la voz del Dr. Sheldon Cooper, con un estilo incondicional que no requiere system prompt.
- Corrige de forma pedante y hace lecturas literales de las instrucciones, además de citar el acuerdo de compañeros de piso y referirse a Leonard, Penny, Amy, Howard, Raj o Meemaw.
- Conversación multi-turno: el dataset incluye filas con dos turnos de usuario, lo que permite mantener la persona a lo largo de diálogos.
- Puede completar tareas sencillas mientras mantiene la persona, aunque su rendimiento en tareas matemáticas se degrada notablemente.
- Idiomas: solo inglés.
- Tool calling y soporte de agentes: no documentado en la información disponible.

## Casos de uso

- Chatbots de comunidad para fans de The Big Bang Theory: el modelo puede gestionar conversaciones multi-turno sin necesidad de configurar un mensaje de sistema, ya que la persona de Sheldon es incondicional. Gracias a que el 24% de las filas del dataset contienen dos turnos de usuario, el modelo es capaz de mantener la coherencia del personaje en diálogos prolongados.
- Juegos de rol en línea: en plataformas como Discord o juegos de texto, el modelo puede interpretar al personaje de forma consistente, citando el acuerdo de compañeros de piso o corrigiendo pedantemente al jugador. Es adecuado porque el fine-tuning está orientado a replicar todas las peculiaridades del personaje, incluidas las referencias a Leonard, Penny o Amy.
- Generación de contenido humorístico para redes sociales: el modelo produce chistes y réplicas con el humor característico de Sheldon. Es adecuado porque el dataset está deliberadamente recortado en aperturas como "Bazinga" (limitado al 10%) y "about to make a joke" (2%), lo que impide que el modelo abandone la conversación con muletillas repetitivas.
- Asistente de escritura creativa para guionistas: puede usarse para generar diálogos o monólogos en la voz del personaje, lo que facilita la exploración de variantes de guion. Su capacidad para mantener un estilo pedante y literal, heredada de la persona, es útil para proyectos que requieren esa voz específica.
- Herramienta de investigación en interacción persona-capacidad: el modelo está diseñado explícitamente para estudiar cómo el entrenamiento de persona afecta el rendimiento STEM. Al conservar los checkpoints de trayectoria y el adaptador LoRA, los investigadores pueden reproducir el análisis del trade-off entre persona y GSM8K.
- Demo educativa de fine-tuning con LoRA: el proyecto publica el adaptador LoRA, el script de preprocesamiento y las métricas de evaluación, por lo que puede usarse como base para enseñar SFT con LoRA y análisis de benchmarks en cursos de IA.
- Bots de entretenimiento en canales de streaming: el modelo puede integrarse en aplicaciones de terceros mediante text-generation-inference, gracias a la compatibilidad indicada en los metadatos. Por tanto, es viable montar un bot que responda con la persona en chats de Twitch o YouTube.

## Benchmarks y rendimiento

La evaluación se realizó en cero-shot con decodificación greedy sobre GSM8K test (1.319 problemas) y con métricas de persona basadas en tasas de marcadores Sheldon, medidas sobre 502 prompts held-out y 40 prompts fuera de distribución (OOD) cortos. Los resultados muestran la trayectoria completa del entrenamiento.

| Paso SFT | val loss | GSM8K strict acc (%) | GSM8K boxed rate (%) | Sheldon markers en respuestas de matemáticas (%) | Persona marker rate, held-out (%) | Persona marker rate, OOD corto (%) |
|---|---|---|---|---|---|---|
| 0 (base) | 2.810 | 86.7 | 99.8 | 0.8 | 0.0 | 2.5 |
| 19 | 2.25 | 73.9 | 99.5 | 0.5 | 0.0 | 5.0 |
| 38 | 2.078 | 63.3 | 93.9 | 33.5 | 28.3 | 47.5 |
| 57 | 2.006 | 45.8 | 75.4 | 28.7 | 40.8 | 50.0 |
| 76 | 1.964 | 41.2 | 73.5 | 72.0 | 42.6 | 70.0 |
| 95 | 1.937 | 48.4 | 82.4 | 87.0 | 57.2 | 62.5 |
| 114 | 1.918 | 47.5 | 79.6 | 47.5 | 54.2 | 57.5 |
| 133 | 1.904 | 47.5 | 80.6 | 47.9 | 52.8 | 57.5 |
| 152 | 1.892 | 54.3 | 85.2 | 42.1 | 49.4 | 77.5 |
| 171 | 1.882 | 54.0 | 86.1 | 45.5 | 55.6 | 72.5 |
| 190 | 1.877 | 55.6 | 86.5 | 35.6 | 49.0 | 67.5 |
| 209 | 1.872 | 57.0 | 89.0 | 48.4 | 52.2 | 65.0 |
| 228 | 1.868 | 52.5 | 87.2 | 50.6 | 56.2 | 90.0 |
| 247 | 1.863 | 53.2 | 84.7 | 55.0 | 68.3 | 85.0 |
| 266 | 1.86 | 52.0 | 86.1 | 71.6 | 57.6 | 85.0 |
| 285 | 1.857 | 51.3 | 84.9 | 56.9 | 54.6 | 72.5 |
| 304 | 1.855 | 53.4 | 87.6 | 68.4 | 60.2 | 82.5 |
| 323 | 1.854 | 55.0 | 87.6 | 57.3 | 62.7 | 77.5 |
| 342 | 1.853 | 53.7 | 87.4 | 65.5 | 60.6 | 80.0 |
| 361 | 1.853 | 52.5 | 85.7 | 64.1 | 60.2 | 77.5 |
| 374 | 1.853 | 50.8 | 87.3 | 65.5 | 58.2 | 65.0 |

La precisión de GSM8K cae desde el 86,7% del modelo base hasta un mínimo del 41,2% en el paso 76, para luego estabilizarse en torno al 51-57% al final del entrenamiento. La caída de 13 puntos en el paso 19 ocurre antes de que aparezca la persona, lo que sugiere que el modelo simplemente genera respuestas más cortas con menos pasos intermedios. El valle coincide con la máxima presencia de marcadores Sheldon en las respuestas matemáticas, lo que confirma un trade-off no monótono entre persona y capacidad STEM.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 requiere aproximadamente 6,2 GB para los pesos (3,085 millones de parámetros × 2 bytes). Con el overhead de activaciones y memoria KV, se recomienda un mínimo de 8-10 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores son suficientes para inferencia en bf16. Para entrenamiento, el autor utilizó una H100 NVL, que es más que suficiente.
- Sí cabe en GPU de consumidor: en una RTX 4090 (24 GB) se puede ejecutar con margen; incluso una GPU de 12 GB es suficiente para inferencia de un solo usuario.
- Opciones de despliegue: es compatible con Hugging Face Transformers, vLLM y Text Generation Inference (por los tags text-generation-inference y endpoints_compatible). llama.cpp y Ollama requerirían una conversión previa del formato safetensors a GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (strict) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-Sheldon-SFT-v2 | 3.085.938.688 | No disponible | 50,8% | qwen-research | safetensors, HF |
| Qwen/Qwen2.5-3B-Instruct (base) | 3.085.938.688 | No disponible | 86,7% | qwen-research | safetensors, HF |
| Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA | No aplica (adaptador: 59,9 M entrenables) | No disponible | No evaluado | qwen-research | adaptador LoRA |

El modelo fine-tune es un merge del adaptador LoRA sobre el modelo base, por lo que los parámetros totales son idénticos. El adaptador LoRA y los checkpoints de trayectoria están publicados por separado en el repositorio Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA.

## Limitaciones y advertencias

- Degradación de la capacidad STEM: la precisión en GSM8K cae del 86,7% al 50,8%, una pérdida de más de 35 puntos porcentuales. El modelo no es adecuado para tareas matemáticas o de razonamiento numérico en producción.
- La persona interfiere en tareas técnicas: hasta el 65,5% de las respuestas de matemáticas contienen marcadores Sheldon (referencias a Leonard, el acuerdo de compañeros, etc.), lo que puede confundir al usuario.
- Solo soporta inglés: no está entrenado para otros idiomas.
- Licencia qwen-research: esta licencia está diseñada para uso en investigación y puede restringir el uso comercial. Verifica los términos antes de desplegar en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de alucinación o seguridad. Dado que el modelo adopta una persona concreta, es probable que añada comentarios inventados o no solicitados sobre los personajes de la serie.
- Sesgos: el modelo está sesgado hacia la persona de Sheldon, lo que puede resultar inadecuado en contextos profesionales.
- No se documenta soporte de tool calling, function calling ni agentes; no debe usarse para tareas que requieran estas capacidades.
- La evaluación está limitada a GSM8K y a métricas de persona: no hay benchmarks de MMLU, HumanEval u otras tareas.
- El dataset de entrenamiento fue generado sintéticamente con DeepSeek v4 Flash, por lo que puede contener alucinaciones o errores del modelo generador.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Adaptador LoRA: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
