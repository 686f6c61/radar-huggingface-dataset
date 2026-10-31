# ConwayResearch/Underdog-Poodle-4B

## Resumen

Underdog Poodle 4B es un ajuste fino (post-training) de Qwen3.5-4B desarrollado por ConwayResearch, orientado específicamente a tareas de agentes: llamada de herramientas, decisión de cuándo no llamar a una herramienta, seguimiento de instrucciones y acompañamiento conversacional del usuario durante una tarea. El modelo funciona como modelo multimodal (image-text-to-text) y ejecuta con el modo de razonamiento (thinking) activado por defecto.

Su relevancia radica en que aborda un problema habitual en los modelos pequeños usados como agentes: el incumplimiento de formatos de salida y la tendencia a generar respuestas que exceden los presupuestos de tokens. Según la model card, el 98 % de sus respuestas en IFEval terminan dentro del presupuesto de 32.768 tokens de salida, frente al 63 % del modelo base, lo que lo hace más fiable en pipelines automatizados.

Mantiene la arquitectura y el tamaño del modelo base (unos 4,66 mil millones de parámetros según los metadatos de safetensors) y hereda su licencia Apache-2.0. La evaluación se realizó con un harness propio, por lo que sus números no son directamente comparables con los publicados por Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 4.659.865.088 (según metadatos safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (las evaluaciones τ³-bench usan contexto de 131.072 tokens, pero no se especifica el máximo del modelo) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16, 12,4 GB de repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 que acepta entradas de imagen y texto. No se trata de una arquitectura nueva: ConwayResearch aplica un post-training centrado en comportamientos de agente, heredando la plantilla de chat y el formato de tool calls de Qwen3.5 (parsers `qwen3_coder` para tool calls y `qwen3` para razonamiento en vLLM).

No se han publicado detalles sobre el proceso de entrenamiento: número de tokens, composición del dataset, método (SFT, RLHF, DPO) ni duración. La model card solo indica que el post-training fue realizado por ConwayResearch y que el modelo está pensado para ejecutarse con thinking activado. El repositorio pesa 12,4 GB, lo que es coherente con pesos en precisión completa (bf16) para ~4,66 mil millones de parámetros.

## Capacidades

- Generacion de texto conversacional con seguimiento estricto de instrucciones (IFEval 85,4 frente a 60,6 del modelo base).
- Tool calling / function calling, incluidas llamadas en paralelo (77 frente a 69 en el benchmark de llamadas paralelas).
- Deteccion de irrelevancia: sabe cuándo no llamar a una herramienta (82,6 en la categoría irrelevance detection de BFCL-V4).
- Agentes multi-step y multi-turno: 82,3 en la categoría multi-turn de BFCL-V4 y 60,7 de media en τ³-bench sobre cuatro dominios.
- Comprension de imagenes (pipeline image-text-to-text heredado de Qwen3.5-4B).
- Modo de razonamiento (thinking) activado por defecto, compatible con el reasoning parser de Qwen3 en vLLM.
- Busqueda web como herramienta: mejora notable en la categoria web search de BFCL-V4 (30,5 frente a 14,0).
- Gestion de memoria en contextos de agente: 48,6 frente a 29,3 en la categoria memory de BFCL-V4.

## Casos de uso

- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno consultando herramientas como `get_order_status` (el propio ejemplo de la model card) y decidir cuándo no necesita llamar a ninguna, reduciendo llamadas erroneas a APIs.
- Agentes de busqueda web: su puntuacion en la categoria web search de BFCL-V4 casi se duplica respecto al modelo base, lo que lo hace adecuado para pipelines tipo deep research o WebWalkerQA.
- Orquestacion de agentes con multiples herramientas: soporta llamadas paralelas y formato de tool calls de Qwen3.5, integrable con frameworks estandar via API compatible con OpenAI en vLLM.
- Automatizacion de flujos con presupuesto de tokens estricto: el 98 % de sus respuestas terminan dentro del limite, util en sistemas donde una respuesta truncada rompe el parseo posterior.
- Asistentes que guian al usuario paso a paso: el post-training incluye explicitamente "hablar a un usuario a traves de una tarea", util para onboarding, soporte tecnico guiado o asistentes internos.
- Procesamiento de documentos con imagenes: al heredar el pipeline image-text-to-text, puede combinarse con OCR o capturas de pantalla en flujos de agentes que razonan sobre interfaces o documentos visuales.
- Evaluacion y prototipado de agentes en hardware contenido: con ~4,7 mil millones de parametros, cabe en GPUs de consumo, facilitando pruebas locales antes de escalar.

## Benchmarks y rendimiento

Todos los numeros provienen del harness de ConwayResearch, ejecutado sobre ambos modelos con ajustes identicos (thinking activado, temperature 0.6, top_p 0.95, top_k 20, hasta 32.768 tokens de salida). No son comparables con las cifras publicadas por Qwen, que usa temperature 1.0 y presence penalty 1.5.

| Benchmark | Qwen3.5-4B | Underdog Poodle 4B |
|---|---|---|
| BFCL-V4 (official harness) | 56,8 | **65,3** |
| BFCL-120 (subconjunto congelado, 3 semillas) | 77,5 | **80,6** |
| IFEval (prompt-level, loose) | 60,6 | **85,4** |
| IFBench (prompt-level, loose) | 33,3 | **38,7** |
| Parallel calls (100 casos) | 69 | **77** |
| WebWalkerQA (150 preguntas, juez LLM) | 30,4 | **31,1** |
| τ³-bench (media, 4 dominios) | 57,9 | **60,7** |

Desglose de BFCL-V4 por categoria:

| Categoria | Qwen3.5-4B | Underdog Poodle 4B |
|---|---|---|
| Non-live AST | 85,6 | 86,1 |
| Live | 81,0 | 79,1 |
| Multi-turn | 77,8 | 82,3 |
| Web search | 14,0 | 30,5 |
| Memory | 29,3 | 48,6 |
| Relevance detection | 87,5 | 81,3 |
| Irrelevance detection | 81,4 | 82,6 |

Detalle adicional: en IFEval, el 98 % de las respuestas de Underdog Poodle 4B terminan dentro del presupuesto de tokens frente al 63 % de Qwen3.5-4B; en IFBench, 79 % frente a 43 %. En τ³-bench se ejecutan 2 intentos por tarea con contexto de 131.072 tokens, usando GPT-5.4 mini como simulador de usuario y juez. En BFCL-V4, la busqueda web pasa por el plugin web de OpenRouter (en lugar de SerpAPI) con resultados cacheados para ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,4 GB de pesos en bf16, se necesitan al menos ~14-16 GB de VRAM para el modelo, mas KV cache; con contexto largo (100k+ tokens) el consumo crece sustancialmente.
- GPU recomendadas: la model card reporta pruebas con NVIDIA H100 (vLLM 0.32.0, Python 3.12). Para uso local, una RTX 4090 (24 GB) o RTX 3090 deberia alojar el modelo en bf16 con contexto moderado.
- Consumer GPUs: si cabe en una RTX 4090 o RTX 3090 en precision completa; con cuantizacion (GGUF, no publicada oficialmente en el repo) cabria en GPUs de 12-16 GB, pero no hay pesos cuantizados disponibles en el repositorio.
- Despliegue: probado con vLLM 0.32.0 usando `--tool-call-parser qwen3_coder --reasoning-parser qwen3 --enable-auto-tool-choice`. Al ser compatible con la arquitectura Qwen3.5 en transformers, deberia funcionar tambien con llama.cpp, Ollama, TGI o SGLang, aunque solo vLLM esta verificado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Fortaleza principal |
|---|---|---|---|---|
| Underdog Poodle 4B | 4,66 B | no disponible | Apache-2.0 | Agentes y tool calling, seguimiento de instrucciones |
| Qwen3.5-4B (base) | 4,66 B | no disponible | Apache-2.0 | Modelo generalista multimodal de referencia |
| Qwen3-4B-Instruct-2507 | 4 B | 262.144 | Apache-2.0 | Generalista con contexto muy largo |

La comparacion mas relevante es con su propio modelo base: Underdog Poodle 4B lo supera en los siete benchmarks del harness de ConwayResearch, con la mayor ganancia en IFEval (+24,8 puntos) y las categorias web search (+16,5) y memory (+19,3) de BFCL-V4. Cede ligeramente en live (79,1 frente a 81,0) y relevance detection (81,3 frente a 87,5). No hay datos publicados que lo comparen con otros fine-tunes de agentes de terceros.

## Limitaciones y advertencias

- Los benchmarks fueron medidos con un harness propio y configuraciones distintas a las de Qwen (temperature 0.6 frente a 1.0, sin presence penalty), por lo que sus cifras no son comparables con las publicadas por Qwen ni con otros modelos evaluados en condiciones estandar.
- Una respuesta que exceda el presupuesto de 32.768 tokens de salida cuenta como incorrecta en su propia evaluacion; en produccion conviene imponer limites similares.
- Rinde peor que el modelo base en live (79,1 frente a 81,0) y relevance detection (81,3 frente a 87,5): puede ser algo mas propenso a llamar herramientas cuando no hace falta en escenarios en vivo.
- WebWalkerQA apenas mejora (31,1 frente a 30,4): la mejora en busqueda web es notable en BFCL pero modesta en navegacion web real.
- Idiomas soportados, longitud maxima de contexto y detalles de entrenamiento no estan documentados en la model card.
- El proyecto tiene traccion muy limitada (97 descargas y 5 likes en el momento de la ficha), sin comunidad consolidada ni auditorias externas de los resultados.
- Licencia Apache-2.0: permite uso comercial sin restricciones relevantes, heredada de Qwen3.5-4B; el post-training de ConwayResearch se cubre en el archivo NOTICE.
- Al ser un fine-tune especializado en agentes, su comportamiento en tareas puramente generativas o creativas fuera de ese dominio no esta evaluado y podria estar degradado respecto al modelo base.
- Como todo modelo de lenguaje, puede alucinar; en flujos de agentes con acceso a herramientas, se recomienda validar las llamadas y salidas antes de ejecutar acciones con efectos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo del autor: https://underdog.ai/poodle
- Licencia heredada: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
