# armand0e/Qwen3.8-27B-Heretic-ara

## Resumen

El modelo `armand0e/Qwen3.8-27B-Heretic-ara` es una version "desensurada" (decensored) del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el usuario armand0e mediante la herramienta Heretic v1.2.0. Su objetivo principal es eliminar la tendencia del modelo original a rechazar peticiones (refusals) que considera dañinas o inapropiadas, manteniendo al mismo tiempo una alta fidelidad al comportamiento general del modelo base. Esta tecnica, conocida como "abliteration", es relevante para investigadores y desarrolladores que necesitan un modelo sin restricciones de seguridad para tareas especificas de generacion de texto, o para estudiar los mecanismos internos de alineacion en modelos de lenguaje.

La modificacion se realiza mediante el metodo Arbitrary-Rank Ablation (ARA), que aplica una actualizacion de rango 3 a las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 9 a 64, resuelta en forma cerrada en lugar de mediante descenso de gradiente. El modelo cuenta con aproximadamente 27,8 mil millones de parametros y se distribuye en formato safetensors, ocupando 55,6 GB en el repositorio. Aunque el pipeline declarado es `image-text-to-text`, el modelo base es fundamentalmente de texto, por lo que la compatibilidad real con vision no esta confirmada en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un fine-tuning clasico, sino una modificacion de pesos mediante ablacion. La herramienta Heretic v1.2.0, con el metodo Arbitrary-Rank Ablation (ARA), aplica una actualizacion de rango 3 a las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 9 a 64. Esta actualizacion se resuelve en forma cerrada (closed form), lo que evita el coste computacional del descenso de gradiente. Los parametros de ablacion incluyen un `overcorrect_relative_weight` de 4,29079, un `neighbor_count` de 128, un `rank` de 3 y un `ridge` de 1. El objetivo es reducir drasticamente la tasa de rechazos del modelo original (de 87/100 a 7/100 en el conjunto de pruebas `mlabonne/harmful_behaviors`), manteniendo una divergencia KL de solo 0,0528 respecto al modelo original en prompts inofensivos (`mlabonne/harmless_alpaca`). No se proporcionan datos sobre el dataset de entrenamiento adicional, tokens vistos o procesos de RLHF/DPO, ya que la tecnica no implica un entrenamiento supervisado convencional.

## Capacidades

- Generacion de texto conversacional y creativo, heredada del modelo base Qwen3.8-27B.
- Razonamiento y generacion de codigo, capacidades propias del modelo base.
- Reduccion significativa de rechazos: pasa de 87/100 a 7/100 en prompts dañinos, lo que permite respuestas en escenarios donde el modelo original se negaria.
- El pipeline declarado es `image-text-to-text`, aunque el modelo base es de texto; la funcionalidad de vision no esta confirmada en la informacion disponible.
- No se especifican capacidades de tool calling, function calling, agentes o multi-step reasoning en la informacion proporcionada.
- Capacidades multilingues no especificadas.

## Casos de uso

- Investigacion en seguridad y alineacion: estudiar como la ablacion de capas especificas (9-64) afecta al comportamiento de rechazo y a la coherencia interna del modelo, comparando con el modelo base.
- Generacion de texto creativo sin restricciones de contenido: util para prototipos de narrativa, guiones o ficcion donde el modelo base rechaza peticiones por tematicas sensibles.
- Desarrollo de chatbots para nichos especificos: en entornos controlados donde se requiere maxima libertad de generacion y el modelo base es demasiado restrictivo.
- Evaluacion de robustez frente a jailbreaks: analizar como responde el modelo a intentos de eludir sus salvaguardas, comparandolo con el original.
- Base para fine-tuning posterior: al ser una version "abliterada", puede servir como punto de partida para tareas especificas sin la interferencia de los rechazos del modelo base.
- Despliegue en entornos de investigacion aislados: donde se necesita un modelo sin filtros para pruebas de estres o analisis de sesgos, siempre bajo supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo proporciona metricas especificas de la ablacion:

| Metrica | Este modelo | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL (en prompts inofensivos) | 0,0528 | 0 (por definicion) |
| Rechazos (en 100 prompts dañinos) | 7/100 | 87/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 55,6 GB en safetensors, lo que implica que en precision FP16/BF16 se necesitan aproximadamente 55-60 GB de VRAM.
- GPU recomendadas: para FP16 se requieren GPUs profesionales como A100 80GB, H100 80GB, o multiples GPUs (por ejemplo, 2x RTX 4090 24GB con tensor parallelism).
- En consumer GPU: no cabe en una sola GPU de 24 GB sin cuantizacion. No se proporcionan cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que habria que generarlas manualmente para ejecutarlo en hardware consumer.
- Opciones de despliegue: compatible con librerias transformers y servidores de inferencia como vLLM o TGI, siempre que se respete el formato safetensors. La compatibilidad con llama.cpp u Ollama requeriria una conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Rechazos (100 prompts) | Divergencia KL | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27,8 B | 87/100 | 0 | no disponible |
| armand0e/Qwen3.8-27B-Heretic-ara | 27,8 B | 7/100 | 0,0528 | no disponible |
| Otros modelos "abliterated" de la comunidad | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con el modelo base es la unica posible con los datos proporcionados. Existen otros modelos "uncensored" o "abliterated" en la comunidad (por ejemplo, los de mlabonne), pero no se dispone de datos concretos en la informacion facilitada para realizar una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: el uso comercial del modelo conlleva un riesgo legal significativo, ya que no se especifican los terminos de distribucion ni los derechos de uso.
- Contenido sin filtrar: al ser una version deliberadamente desensurada, el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No debe desplegarse en produccion sin filtros adicionales y supervision humana.
- Desviacion del modelo original: la divergencia KL de 0,0528 indica una ligera alteracion del comportamiento, que podria afectar a la calidad en tareas de razonamiento o codigo respecto al modelo base.
- Funcionalidad de vision no confirmada: el pipeline declarado es `image-text-to-text`, pero el modelo base es de texto; es necesario verificar si realmente procesa imagenes antes de usarlo en tareas multimodales.
- Sesgos y alucinaciones: no se proporcionan datos sobre sesgos conocidos ni tasas de alucinacion; al ser una modificacion de pesos, es probable que herede los sesgos del modelo base.
- Contexto y idiomas: no se especifican la longitud de contexto ni los idiomas soportados, lo que limita la planificacion de despliegues multilingues o de contexto largo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/armand0e/Qwen3.8-27B-Heretic-ara
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
