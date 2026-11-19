# bthe0/switchyard-decider

## Resumen

switchyard-decider es un modelo de clasificación de texto derivado de `answerdotai/ModernBERT-large` mediante fine-tuning, desarrollado por el usuario bthe0. Su función no es generar texto, sino estimar la dificultad de una petición dirigida a un asistente de programación: produce una puntuación de "dureza" que un router de LLM local utiliza para decidir si la consulta se envía a un modelo de gama media (más barato) o a un modelo de frontera (más capaz y costoso). Con 395,8 millones de parámetros y una ventana de 768 tokens, resuelve un problema de enrutamiento de coste en pipelines de asistentes de código.

El modelo se distribuye en formato safetensors fp16 (unos 792 MB) junto con un fichero de calibración `calib.npz` que mapea la puntuación de dificultad a una distribución de salida objetivo, de modo que los umbrales ya configurados en un router existente mantengan la misma proporción de tráfico. Según la model card, alcanza un AUC de 0,895 en la validación retenida y responde en torno a 25 ms (p50) en Apple Silicon MPS, lo que lo hace viable como componente de baja latencia en un sistema de enrutamiento en producción.

Es relevante ahora porque el enrutamiento dinámico entre modelos de distinto coste se ha convertido en una palanca habitual para reducir gasto en asistentes de código, y este modelo sustituye a un decisor LLM de 0,8B (unos 720 ms por decisión) por un clasificador encoder mucho más rápido y con mejor AUC. La licencia Apache-2.0 y la compatibilidad con `text-embeddings-inference` y endpoints facilitan su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuned para clasificación de secuencias |
| Parametros totales | 395.838.471 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens (truncación en entrenamiento e inferencia) |
| Tipos de cuantizacion | fp16 (pesos publicados); fp32 en CPU según la model card; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, ~792 MB fp16), más config.json, tokenizer.json, tokenizer_config.json y calib.npz |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-large`, un encoder transformer moderno, y se fine-tunea como clasificador con siete logits de salida: tres para dificultad derivada de batallas de arena (easy/medium/hard), tres para dificultad según jueces LLM (easy/medium/hard) y uno para la puntuación "gold" de modelos decisores docentes (a mayor valor, más fácil). La puntuación de dureza se calcula como la media de dos percentiles del conjunto de validación: la probabilidad de "hard" promediada entre las cabezas de arena y de juez, y el logit gold negado. El fichero `calib.npz` contiene las claves `aj`, `g`, `h` y `out`, que permiten mapear esa dureza a una distribución de salida objetivo.

El entrenamiento usó aproximadamente 153.000 prompts procedentes de WildChat-1M (ODC-BY-1.0), LMArena arena-human-preference-140k (CC-BY-4.0), OpenAssistant oasst2 (Apache-2.0), Magicoder-Evol-Instruct-110K (Apache-2.0), CodeFeedback-Filtered-Instruction (Apache-2.0), SWE-bench (MIT), SWE-Gym (MIT) y SWE-rebench (CC-BY-4.0). Las etiquetas provinieron de resultados de batallas de arena, jueces LLM (Anthropic Claude Haiku, OpenAI GPT-6-luna) y modelos decisores de OpenRouter (`nace-ai/drex-max`, `perplexity/pplx-decider`). Hiperparámetros: learning rate 3e-5, longitud máxima 768, precisión bf16, una sola NVIDIA RTX 5070 Ti, mejor checkpoint en el paso 3.600, seguido de un "weight soup" greedy. La versión servida (v1.1) añade una sonda ridge sobre el embedding, que aporta una única operación de producto escalar de anchura 2.048.

## Capacidades

- Clasificación de dificultad de peticiones para asistentes de código, con salida de siete logits y una puntuación de dureza calibrada.
- Estimación de la probabilidad de que un modelo de gama media resuelva la tarea (`p_solve`), calculada a partir de los cuantiles de `calib.npz`.
- Enrutamiento entre modelo de frontera y modelo de gama media mediante umbrales sobre la puntuación de dificultad.
- Servidor HTTP incluido (`switchyard-decider-serve`) con endpoint `/v1/systemone` que acepta el estado de la conversación (`opening_task` y `latest_follow_up`).
- Solo procesa los primeros 3.000 caracteres de la tarea inicial más el último seguimiento, truncados a 768 tokens.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés; no evaluado fuera de prompts de chat y asistente de código en inglés.

## Casos de uso

- Enrutamiento de coste en asistentes de código: cada petición entrante se puntúa con el modelo y, según el umbral configurado, se envía a un modelo de gama media o a uno de frontera; la calibración con `calib.npz` preserva la proporción de tráfico que el router ya enviaba a cada nivel.
- Reducción de gasto en API de LLM: al desviar las tareas fáciles (renombrados de variables, cambios triviales) a modelos más baratos, se evita pagar tarifas de frontera por consultas que no las requieren.
- Sustitución de decisores LLM lentos: reemplaza un decisor de 0,8B que tardaba unos 720 ms por decisión por un clasificador de ~25 ms p50 en MPS, reduciendo la latencia añadida al pipeline de enrutamiento.
- Priorización en colas de trabajo de agentes de código: las peticiones clasificadas como difíciles pueden encolarse hacia modelos con mayor capacidad o más tiempo de cómputo, mientras las fáciles se resuelven con recursos limitados.
- Filtrado previo en herramientas de revisión de código: antes de invocar un modelo de frontera para una tarea de SWE-bench o similar, el clasificador estima si merece la pena el coste del modelo mayor.
- Despliegue en local o en el borde: con ~560 MB de memoria residente y carga del modelo en 0,7 s, puede ejecutarse junto al router en la misma máquina sin GPU dedicada de gran tamaño, sirviendo decisiones de enrutamiento de baja latencia.
- Experimentación con políticas de enrutamiento: el servidor HTTP y la salida `p_solve` permiten ajustar umbrales y simular distribuciones de tráfico antes de fijar una política en producción.

## Benchmarks y rendimiento

Conjunto de validación: 1.994 prompts retenidos (pares easy vs hard; medium excluido del AUC).

| Modelo | AUC (etiquetas) | AUC (arena) | AUC (coding) | hard → frontera @40% | easy → gama media @40% |
|---|---|---|---|---|---|
| + sonda ridge sobre embedding (v1.1, servido) | 0,895 | no disponible | no disponible | no disponible | no disponible |
| este modelo (paso 3600, solo cabeza, v1.0) | 0,886 | 0,769 | 0,929 | 0,693 | 0,862 |
| misma receta sin cabeza gold | 0,859 | no disponible | no disponible | no disponible | no disponible |
| decisor LLM previo (0,8B, MLX 4-bit) | 0,687 | no disponible | no disponible | 0,538 | 0,712 |

En un subconjunto fijo de 300 prompts usado para comparar unos 40 modelos decisores de OpenRouter, este modelo obtiene AUC 0,904; los mejores docentes obtuvieron 0,879 (`nace-ai/drex-max-finance`), 0,873 (`nace-ai/drex-max`) y 0,871 (`perplexity/pplx-decider-v1.3`). El checkpoint se eligió sobre este conjunto de validación, por lo que las cifras son ligeramente optimistas.

Latencia (Apple M4 Max, 48 GB, PyTorch, batch 1, solo forward pass a longitudes fijas; "real prompts" incluye tokenización sobre los 1.994 prompts de validación, mediana de 80 tokens):

| tokens | MPS fp16 p50 | MPS fp16 p95 | CPU fp32 p50 | CPU fp32 p95 |
|---|---|---|---|---|
| 32 | 11,4 ms | 11,7 ms | 49,4 ms | 55,3 ms |
| 128 | 17,7 ms | 18,1 ms | 125,1 ms | 141,7 ms |
| 256 | 27,6 ms | 29,3 ms | 150,3 ms | 161,1 ms |
| 512 | 107,8 ms | 320,3 ms | 294,1 ms | 317,5 ms |
| 768 | 145,4 ms | 161,6 ms | 473,3 ms | 522,6 ms |
| real prompts | 30,2 ms (p99 151 ms) | 107,5 ms | 78,7 ms (p99 320 ms, 200 prompts) | 219,0 ms |

A través del servidor HTTP en MPS (500 prompts): p50 23 ms, p95 74 ms, p99 97 ms. Carga del modelo 0,7 s y memoria residente de unos 560 MB. El decisor LLM previo tardaba unos 720 ms por decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp16 ocupan ~792 MB; con activaciones y overhead de PyTorch, el consumo residente medido es de unos 560 MB en MPS. En fp32 la huella sería aproximadamente el doble (no medida en la model card).
- GPU recomendadas: cualquier GPU con al menos ~2 GB de memoria libre para fp16; la model card reporta mediciones en Apple M4 Max (48 GB) vía MPS. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, por tamaño; el modelo base se entrenó en una NVIDIA RTX 5070 Ti, y la inferencia fp16 requiere muy poca memoria.
- Opciones de despliegue: `transformers` con PyTorch, el servidor HTTP incluido en el repositorio de código (`switchyard-decider-serve`), y compatibilidad declarada con `text-embeddings-inference` y endpoints. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: p50 de 23 ms y p99 de 97 ms vía HTTP en MPS (500 prompts); p50 de 30,2 ms en forward pass con tokenización sobre prompts reales. No se publican cifras de throughput en batch ni en GPU CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUC (etiquetas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| switchyard-decider (v1.1) | 395,8 M | 768 tokens | 0,895 | Apache-2.0 | Hugging Face y GitHub release v1.1 |
| decisor LLM previo (0,8B, MLX 4-bit) | 0,8 B | no disponible | 0,687 | no disponible | no disponible |
| `nace-ai/drex-max-finance` (docente) | no disponible | no disponible | 0,879 (subconjunto de 300 prompts) | no disponible | OpenRouter |
| `perplexity/pplx-decider-v1.3` (docente) | no disponible | no disponible | 0,871 (subconjunto de 300 prompts) | no disponible | OpenRouter |

No se dispone de datos de arquitectura, contexto ni licencia de los modelos decisores de OpenRouter en la información proporcionada. La comparación directa con clasificadores de dificultad de otros autores no está disponible.

## Limitaciones y advertencias

- Solo inglés; no evaluado fuera de prompts de chat y asistente de código en inglés.
- Solo puntúa los primeros 3.000 caracteres de la tarea inicial más el último seguimiento, truncados a 768 tokens; el contexto anterior de la conversación se ignora.
- Las etiquetas de entrenamiento son salidas ruidosas de docentes (jueces LLM y modelos decisores); el modelo ordena dificultad, no verifica que un modelo pueda resolver la tarea.
- Las métricas de evaluación son ligeramente optimistas porque el checkpoint se seleccionó sobre el conjunto de validación.
- No es un clasificador de propósito general; su uso previsto es exclusivamente el enrutamiento de peticiones a asistentes de código.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración errónea: una puntuación de dificultad mal calibrada puede desviar tráfico al modelo equivocado y degradar la calidad de las respuestas.
- Licencia Apache-2.0 para código y pesos, en línea con el modelo base ModernBERT; las etiquetas de entrenamiento son salidas de docentes y la model card advierte sobre el riesgo de uso asociado (texto truncado en la información disponible).
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/bthe0/switchyard-decider
- Repositorio de código: https://github.com/bthe0/switchyard-decider
- Release v1.1 (pesos): https://github.com/bthe0/switchyard-decider/releases/tag/v1.1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
