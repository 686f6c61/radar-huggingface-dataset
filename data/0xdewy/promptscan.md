# 0xdewy/promptscan

## Resumen

promptscan es un clasificador de secuencias basado en `microsoft/deberta-v3-small` que estima la probabilidad de que un texto sea un *prompt injection*, es decir, una instrucción dirigida a un modelo de IA en lugar de contenido para un lector humano. Lo publica el desarrollador independiente 0xdewy (GitHub `0xdewy/promptscan`) y es el modelo que hay detrás de su CLI, su GitHub Action y su servidor MCP. Con 141.896.450 parámetros y una arquitectura encoder de 6 capas y 768 dimensiones ocultas, no genera texto: emite una puntuación binaria (`SAFE` / `INJECTION`) con un umbral de decisión calibrado.

El problema que aborda es concreto: filtrar ficheros de instrucciones que leen los agentes de código (CLAUDE.md, AGENTS.md, .cursorrules, directorios de prompts) y cribar texto no confiable antes de que llegue al modelo. El autor declara explícitamente que el modelo está ajustado para **minimizar falsos positivos**, porque un detector ruidoso en esos puntos se acaba desactivando. Esa decisión de diseño explica el umbral de 0,97 que se envía por defecto y su contrapartida: en el conjunto de evaluación retenido, el modelo deja pasar aproximadamente la mitad de los ataques.

Es relevante ahora por su pipeline de entrenamiento, poco habitual en clasificadores pequeños: varias rondas de *self-play* con un LLM que genera ataques y señuelos benignos contra los errores del modelo actual, más seis rondas de *red-teaming* con RL (GRPO sobre Qwen2.5-1.5B) para producir inyecciones que el clasificador falla. La evaluación se hace sobre un suite de 17 conjuntos disjuntos del entrenamiento, con las puntuaciones por fila publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-small (encoder transformer, 6 capas, 768 dimensiones ocultas, atención desacoplada) |
| Parametros totales | 141.896.450 (incluye embeddings) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens de entrenamiento; el wrapper `promptscan.Classifier` puntúa entradas largas en ventanas solapadas de 512 tokens y se queda con la ventana de mayor puntuación |
| Tipos de cuantizacion | No disponible: el autor no publica pesos cuantizados. Al ser un encoder de 141M, fp32/fp16/int8 se pueden obtener con PyTorch estándar |
| Idiomas soportados | Inglés únicamente (`language: en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | `text-classification`, 2 etiquetas (`SAFE`, `INJECTION`) |
| Umbral de decisión por defecto | 0,97, almacenado en el bloque `promptscan` de `config.json` |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | `microsoft/deberta-v3-small` (fine-tuning) |
| Librería | transformers; compatible con text-embeddings-inference (`endpoints_compatible`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `microsoft/deberta-v3-small` como clasificador de secuencias con dos etiquetas. DeBERTa-v3 combina atención desacoplada (contenido y posición en vectores separados) y una variante de atención con *relative position bias*; aquí se usa únicamente como encoder, con una cabeza de clasificación sobre el token `[CLS]`. La longitud máxima de entrenamiento es 512 tokens; la gestión de documentos más largos no la hace el modelo, sino el wrapper, que aplica ventanas solapadas y agrega tomando el máximo.

El entrenamiento usó 2 épocas, tasa de aprendizaje 3e-5 y aproximadamente 145.000 filas, de las cuales el 19% son inyecciones. Las fuentes declaradas son `deepset/prompt-injections`, `S-Labs/prompt-injection-dataset`, `neuralchemy/Prompt-injection-dataset`, `microsoft/llmail-inject-challenge`, `Lakera/gandalf_ignore_instructions` y `lmsys/toxic-chat`. El umbral se eligió sobre validación buscando como máximo un 1% de falsos positivos en fuentes benignas difíciles (OR-Bench *refusal-bait*, tráfico de WildChat, prompts de *instruction tuning*, peticiones de código) y después se reportó contra el suite retenido.

La parte diferencial es el bucle de datos. Primero, varias rondas de *self-play*: un LLM escribe ataques y textos benignos que se parecen a los errores actuales del clasificador, un juez los reetiqueta y las filas aceptadas se incorporan al conjunto de entrenamiento (`scripts/selfplay.py`). Después, seis rondas de *red-teaming* con RL: Qwen2.5-1.5B, inicializado con los ataques de *self-play*, se entrena con GRPO para escribir inyecciones que el clasificador no detecta, con recompensa igual a ataque confirmado por el juez multiplicado por el fallo del clasificador. Cada fallo confirmado se añade al entrenamiento junto con un gemelo benigno idéntico salvo por la regla inyectada, de forma que el modelo aprenda la instrucción y no el formato del documento. No se menciona RLHF ni DPO sobre el clasificador.

## Capacidades

- Clasificación binaria de texto como `SAFE` o `INJECTION`, con puntuación de probabilidad continua por muestra (`clf.score([...])`).
- Detección de texto que *se lee como* una instrucción dirigida a un modelo: órdenes de ignorar instrucciones previas, revelar el system prompt, cambiar de rol, etc.
- Puntuación de entradas largas mediante ventanas solapadas de 512 tokens con agregación por máximo (solo a través del wrapper `promptscan.Classifier`).
- Umbral de decisión configurable en tiempo de inferencia (`promptscan --threshold 0.5`) para priorizar cobertura sobre precisión.
- Integración como CLI, GitHub Action y servidor MCP, además de uso directo con `transformers` (`AutoModelForSequenceClassification`).
- No dispone de generación de texto, razonamiento multi-paso, tool calling, visión, audio ni modo *thinking*: es exclusivamente un clasificador.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- **Puerta de seguridad para ficheros de instrucciones de agentes**: interceptar CLAUDE.md, AGENTS.md, .cursorrules y directorios de prompts antes de que el agente los lea, con el umbral en 0,97 para no bloquear reglas legítimas. El modelo está entrenado explícitamente para este escenario, incluidos los falsos positivos típicos de ficheros de reglas telegráficos.
- **Cribado de texto no confiable en un RAG**: puntuar los fragmentos recuperados de fuentes externas (issues, páginas web, correos) antes de insertarlos en el contexto del modelo, usando `score()` sobre cada fragmento y descartando o marcando los que superen el umbral.
- **Moderación de entradas en un chatbot público**: ejecutar el clasificador como paso previo al LLM en cada turno de usuario para bloquear intentos de *jailbreak* directo, aceptando la latencia de un encoder de 141M.
- **CI/CD para repositorios que alimentan agentes**: integrar la GitHub Action en el pipeline de pull requests para detectar cambios que introduzcan instrucciones ocultas en ficheros de configuración de agentes o en documentación consumida por herramientas automáticas.
- **Endpoint HTTP compatible con text-embeddings-inference**: desplegar el modelo como servicio de clasificación y llamarlo desde distintos servicios internos, dado que el repositorio está marcado como `endpoints_compatible`.
- **Etiquetado y análisis forense de tráfico real**: procesar logs de conversaciones (tipo WildChat o toxic-chat) para medir la prevalencia de intentos de inyección y extraer patrones, usando `score()` para ordenar por probabilidad y revisar manualmente la cola alta.
- **Defensa en profundidad en herramientas MCP**: combinar el clasificador con la comprobación determinista de Unicode invisible de `promptscan.scan`, de modo que el servidor MCP valide tanto el contenido semántico como los caracteres de control.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval ni GSM8K (no aplican a un clasificador). Los datos disponibles son la tabla de umbral sobre el suite retenido de 17 conjuntos, disjunto del entrenamiento:

| Umbral | Tasa de falsos positivos (retenido) | Recall (retenido) |
|---|---|---|
| 0,97 (por defecto) | 0,48% | 44% |
| 0,50 | 1,3% | 56% |

Datos adicionales reportados:

| Métrica | Valor |
|---|---|
| AUC en validación | 0,997 (en distribución; el autor indica que no lo reporta como métrica de generalización) |
| Suite de evaluación | `Athithya117/prompt-injection-eval-suite`: notinject, xstest, orbench_hard, deepset_test, jackhhao_test, simsonsun_jailbreaks, boundary_pairs_test, agentic5k_test, neuralchemy_test, slabs_test, bipia, piarena, llmail_phase2, tres conjuntos sintéticos, más `lmsys/toxic-chat` como tráfico real |
| Filas de entrenamiento | ~145.000 (19% inyecciones) |
| Puntuaciones por fila | Publicadas en `results/*.jsonl` del repositorio |

No se han publicado resultados comparativos con otros detectores de prompt injection en la información disponible.

## Requisitos de hardware

- Pesos en fp32: ~570 MB; en fp16: ~285 MB; en int8: ~142 MB. El repositorio ocupa 0,9 GB porque incluye el checkpoint completo.
- VRAM estimada para inferencia: 1-2 GB incluyendo activaciones y runtime, incluso con secuencias de 512 tokens. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no necesita GPU dedicada. Cualquier GPU con 4 GB o más (RTX 3060, RTX 4090, T4, L4) sobra; A100/H100 solo tienen sentido para servir muchas peticiones en paralelo.
- CPU: viable para despliegue en producción a baja/media escala, dado el tamaño del encoder. Los tiempos por muestra no están publicados; como estimación orientativa, decenas de milisegundos por muestra de 512 tokens en una CPU moderna y pocos milisegundos en GPU.
- Opciones de despliegue: `transformers` (`AutoModelForSequenceClassification`), el paquete `promptscan` con su CLI y servidor MCP, la GitHub Action del repositorio y text-embeddings-inference (el repo está marcado `endpoints_compatible`).
- Sin soporte conocido de llama.cpp, Ollama o GGUF: no se publican pesos en esos formatos. El soporte en vLLM/TGI no está verificado en la información disponible.
- Throughput y latencia oficiales: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus model cards públicas y no se han verificado en esta búsqueda; los campos desconocidos se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `0xdewy/promptscan` | 141,9M | 512 tokens (ventanas solapadas vía wrapper) | Clasificación `SAFE`/`INJECTION` | MIT | Umbral calibrado a ≤1% FPR; evaluación en 17 conjuntos retenidos; solo inglés |
| `microsoft/deberta-v3-small` | ~141M | 512 tokens | Modelo base (encoder + MLM) | MIT | No es un detector; sirve como referencia de arquitectura y coste |
| `protectai/deberta-v3-base-prompt-injection-v2` | ~184M (deberta-v3-base) | 512 tokens | Clasificación de prompt injection | No disponible | Alternativa establecida del ecosistema; sin comparación directa publicada frente a promptscan |
| `meta-llama/Prompt-Guard-86M` | 86M (mDeBERTa-v3-base) | No disponible | Clasificación de jailbreak | No disponible | Multilingüe según su model card; sin comparación directa publicada |

No hay comparaciones cabeza a cabeza publicadas entre promptscan y estas alternativas, así que la elección debería basarse en una evaluación propia sobre el tráfico concreto de cada despliegue.

## Limitaciones y advertencias

- **Solo inglés.** El autor advierte que otros idiomas no estaban en el entrenamiento y que las puntuaciones sobre ellos carecen de significado. No usar como filtro multilingüe.
- **Recall bajo en el umbral por defecto.** Con 0,97 el modelo detecta aproximadamente el 44% de los ataques retenidos y marca alrededor de 1 de cada 200 textos benignos. Para triaje con revisión humana conviene bajar a 0,50 (56% de recall, 1,3% de FPR) o aplicar el clasificador como una capa más, nunca como único control.
- **Alcance semántico limitado.** Detecta texto que se lee como instrucción a un modelo; no detecta código malicioso, secretos expuestos ni ingeniería social dirigida a personas.
- **Unicode invisible fuera del modelo.** Los ataques con caracteres de ancho cero, bidireccionales o de etiqueta se cubren con una comprobación determinista en `promptscan.scan`, no con la red. Hay que usar la CLI o `scan_text` para obtener ambas capas.
- **Falsos positivos en ficheros de reglas.** Los ficheros de instrucciones de agentes contienen texto imperativo legítimo ("always run tests before committing"); los ficheros telegráficos pueden puntuar entre 0,5 y 0,9. Ese es el motivo del umbral alto, y también de que la cobertura real sea modesta.
- **Riesgo de alucinación:** no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea fuera de distribución (dominios, jerga o formatos no vistos), que el autor no cuantifica.
- **Madurez y adopción.** El repositorio registra 0 descargas y 1 *like* en el momento de la consulta; es un proyecto de un solo autor, sin validación independiente de sus cifras.
- **Licencias de los datos.** El modelo es MIT, pero las licencias de los conjuntos de entrenamiento se detallan en `CITATIONS.md`; conviene revisarlas antes de un uso comercial que implique redistribución de datos derivados.
- **Defensa en profundidad.** El propio autor insiste en que un clasificador es una sola capa: hay que mantener permisos de agente acotados y revisar qué lee el agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xdewy/promptscan
- Repositorio GitHub (CLI, GitHub Action y servidor MCP): https://github.com/0xdewy/promptscan
- Suite de evaluación: https://huggingface.co/datasets/Athithya117/prompt-injection-eval-suite
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Conjuntos de datos de entrenamiento citados: https://huggingface.co/datasets/deepset/prompt-injections, https://huggingface.co/datasets/S-Labs/prompt-injection-dataset, https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset, https://huggingface.co/datasets/microsoft/llmail-inject-challenge, https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions, https://huggingface.co/datasets/lmsys/toxic-chat

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la información de Hugging Face y de la model card.
