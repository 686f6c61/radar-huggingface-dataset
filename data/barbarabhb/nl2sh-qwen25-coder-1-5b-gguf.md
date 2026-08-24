# barbarabhb/nl2sh-qwen25-coder-1.5b-GGUF

## Resumen

El modelo `barbarabhb/nl2sh-qwen25-coder-1.5b-GGUF` es un generador de comandos shell a partir de lenguaje natural, desarrollado como una alternativa directa al modelo `nl2sh-1.5b` del proyecto whatisit-nl2sh. Se basa en el modelo Qwen2.5-Coder-1.5B-Instruct, al que se le ha aplicado un fine-tuning con LoRA sobre un conjunto de datos ampliado y endurecido, incluyendo el dataset NL2SH-ALFA, tldr-pages, commandlinefu, NL2Bash, cli-1m y un conjunto de robustez orgánico. El resultado es un modelo de 1.543 millones de parámetros que, en cuantización Q4_K_M (941 MB), alcanza una tasa de éxito de 0.6567 en el benchmark InterCode-ALFA, superando al modelo original del mismo tamaño y acercándose a modelos mucho más grandes como GPT-4o (0.730) o nl2sh-3b (0.657).

La relevancia de este modelo radica en su capacidad para ejecutarse en hardware modesto, incluso en CPU, manteniendo un rendimiento competitivo para la tarea específica de traducción de lenguaje natural a comandos shell. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su formato GGUF facilita el despliegue con herramientas como llama.cpp o llama-server. Está diseñado para ser un componente ligero y fiable en asistentes de terminal, automatización de tareas y entornos de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32k, pero no se especifica en la ficha) |
| Tipos de cuantizacion | Q4_K_M, Q4_K_M+imatrix, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien incluye adaptador LoRA en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder con atención causal y tokenizer de Qwen. El fine-tuning se realizó con LoRA (rank 32, alpha 64, dropout 0.05) aplicado a todas las proyecciones de atención y MLP. El conjunto de entrenamiento contiene 120.349 pares lenguaje natural-comando, con una longitud máxima de 56 tokens, deduplicados y decontaminados frente al test de InterCode-ALFA. Se utilizó una pérdida solo sobre las respuestas (asistente) con el formato de chat de Qwen, y se entrenó durante 1 época con batch efectivo de 32, secuencia de 224 tokens, learning rate 2e-4 con schedule coseno y 3% de warmup, en precisión bf16. El entrenamiento se completó en 2 horas y 12 minutos en una AMD Radeon RX 9070 XT (gfx1201), con una pérdida final de 0.904 y una precisión de token del 82.7%.

Una innovación destacable es la inclusión de pares de "charla orgánica" (por ejemplo, "hello" → `echo hello`, "thanks" → `echo "you're welcome!"`) para garantizar que cualquier entrada arbitraria produzca un comando inofensivo y coherente, en lugar de texto basura. Además, se generaron múltiples cuantizaciones GGUF con y sin imatrix, y se midió la perplejidad en un conjunto de validación: f16 4.649, Q8 4.655, Q6 4.665, Q4+imx 4.720, Q4 4.789.

## Capacidades

- Generación de comandos shell a partir de lenguaje natural en inglés, con salida de una sola línea y un único comando.
- Robustez ante entradas no relacionadas con comandos: responde con comandos inofensivos (por ejemplo, "who am i" → `whoami`, "qwerty" → `pwd`).
- Soporte de decodificación greedy con temperatura 0 y límite de 64 tokens de salida.
- Integración con el ecosistema whatisit-nl2sh: puede usarse como reemplazo directo del modelo `nl2sh-1.5b` mediante `whatisit setup --model ./qcoder-nl2sh-q4_k_m.gguf`.
- No soporta tool calling ni agentes multi-paso; es un modelo de una sola vuelta.
- Capacidades multilingües: no, solo inglés.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Asistente de terminal para desarrolladores: el modelo puede convertir instrucciones en lenguaje natural en comandos shell ejecutables, reduciendo la fricción al trabajar con herramientas de línea de comandos. Por ejemplo, "list all files modified in the last day" se traduce a `find . -mtime -1 -type f`.
- Automatización de tareas de administración de sistemas: permite a operadores sin experiencia en shell describir acciones como "show disk usage" y obtener `df -h`, o "restart nginx" → `systemctl restart nginx`, facilitando la gestión de servidores.
- Entornos de aprendizaje de shell: estudiantes pueden practicar comandos escribiendo frases en inglés y recibiendo la orden correcta, sirviendo como herramienta educativa interactiva.
- Integración en pipelines de CI/CD: el modelo puede generar comandos de compilación, despliegue o limpieza a partir de descripciones en lenguaje natural, aunque con la limitación de un solo comando por petición.
- Chatbots de soporte técnico: al recibir consultas sobre cómo realizar operaciones en un sistema, el bot puede ofrecer el comando exacto, mejorando la precisión de las respuestas.
- Herramientas de accesibilidad: usuarios con dificultades para recordar sintaxis de shell pueden describir la acción deseada y obtener el comando correcto, mejorando la productividad en entornos de trabajo técnico.

## Benchmarks y rendimiento

El autor publicó mediciones en InterCode-ALFA (300 tareas, temperatura 0, max_tokens 64, scorer con umbral de embedding 0.75). Los resultados se comparan con modelos de referencia:

| Modelo | Tamano | Pass rate |
|---|---|---|
| GPT-4o (publicado) | nube | 0.730 |
| **Este modelo, Q4_K_M** | 941M | **0.6567** |
| nl2sh-3b (upstream, publicado) | 1.9G | 0.657 |
| Este modelo, Q4_K_M + imatrix | 941M | 0.6500 |
| Este modelo, Q6_K | 1.2G | 0.6433 |
| Este modelo, Q8_0 | 1.6G | 0.6367 |
| nl2sh-1.5b (upstream, publicado) | 941M | 0.620 |
| nl2sh-1.5b (re-medido en el mismo equipo) | 941M | 0.590 |

El autor señala que las diferencias entre cuantizaciones de 1-2 puntos están dentro del ruido binomial (±5.5 puntos con n=300), por lo que todas las variantes se consideran equivalentes en torno a 0.65. La versión Q4_K_M es la recomendada por su mejor puntuación medida al menor tamaño.

## Requisitos de hardware

- Inferencia en CPU: según el blog de explainx.ai, el modelo en Q4_K_M (941 MB) se ejecuta en un portátil con CPU, usando aproximadamente 1.6 GB de RAM y con una latencia mediana de 0.59 segundos por generación.
- Inferencia en GPU: puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM para la cuantización Q4_K_M; las versiones Q6_K y Q8_0 requieren 1.2 GB y 1.6 GB respectivamente, más overhead de contexto.
- Compatible con GPUs consumer como RTX 3060, RTX 4060, o incluso integradas con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se convierte a formato compatible), vLLM (con adaptación a GGUF no es directo, pero se puede usar el adaptador LoRA con el modelo base en safetensors), y el ecosistema whatisit-nl2sh.
- Throughput estimado: no disponible, pero dado el tamaño y la latencia en CPU, se espera un rendimiento de decenas de tokens por segundo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | InterCode-ALFA | Licencia | Formato |
|---|---|---|---|---|---|
| **nl2sh-qwen25-coder-1.5b (este)** | 1.5B | no disponible | 0.6567 (Q4_K_M) | Apache 2.0 | GGUF |
| nl2sh-1.5b (upstream) | 1.5B | no disponible | 0.620 (publicado) | Apache 2.0 | GGUF |
| nl2sh-3b (upstream) | 3B | no disponible | 0.657 (publicado) | Apache 2.0 | GGUF |
| GPT-4o (referencia) | nube | nube | 0.730 | propietaria | API |

El modelo supera al nl2sh-1.5b original en 3.7 puntos (publicado) y 6.7 puntos (medido en el mismo equipo), y prácticamente iguala al nl2sh-3b con la mitad de parámetros. Frente a GPT-4o, la diferencia es de 7.3 puntos, pero con la ventaja de ser local, ligero y de código abierto.

## Limitaciones y advertencias

- Modelo de una sola vuelta: no mantiene estado de shell ni contexto de conversación; cada entrada se procesa de forma independiente.
- Solo genera un comando por petición, no scripts completos ni secuencias de comandos.
- Limitado al idioma inglés; entradas en otros idiomas pueden producir salidas incorrectas o inesperadas.
- Riesgo de alucinación: aunque se entrenó con pares de robustez, entradas muy ambiguas o complejas pueden generar comandos incorrectos o peligrosos si se ejecutan sin supervisión.
- Las diferencias entre cuantizaciones son pequeñas pero existen; se recomienda usar Q4_K_M como equilibrio entre tamaño y rendimiento.
- No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) para este fine-tuning específico.
- El entrenamiento se realizó en hardware AMD con ROCm; los usuarios que quieran reproducir el entrenamiento deben tener en cuenta las variables de entorno necesarias para evitar el bug de gfx1201 (documentado en la model card).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barbarabhb/nl2sh-qwen25-coder-1.5b-GGUF
- Blog de explainx.ai sobre el modelo: https://www.explainx.ai/blog/nl2sh-qwen2-5-coder-1-5b-shell-command-model-laptop-cpu-august-2026
- Proyecto whatisit-nl2sh (referencia): https://github.com/ThorOdinson246/whatisit-nl2sh
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/QuantFactory/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Repositorio de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Informe técnico de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v3
