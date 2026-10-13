# MENIARAYOUB/Spark-X2.5-1.7B

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto de proposito general desarrollado por XHToken (familia SparkLLM) y distribuido en este repositorio como un ajuste fino realizado por el usuario MENIARAYOUB sobre el checkpoint base XHToken/Spark-X2.5-1.7B-Base. Con 1.707.657.216 parametros (~1.7B), esta pensado para tareas cotidianas de conversacion, redaccion, traduccion, razonamiento, generacion de codigo, uso de herramientas y flujos agenticos, manteniendo un coste de inferencia bajo.

La familia Spark-X2.5 introduce una arquitectura de atencion hibrida que combina una capa de atencion completa con tres capas de atencion de ventana deslizante (sliding-window attention), lo que reduce el coste computacional del contexto largo y permite una ventana nativa de hasta 1 millon de tokens. Segun la documentacion del autor original, el modelo cubre mas de 200 idiomas y se integra con frameworks como vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio.

Este repositorio concreto (fine-tune de MENIARAYOUB) registra 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse una variante de la comunidad, no el checkpoint oficial. La model card del autor no detalla el dataset ni la receta exacta del ajuste, y no se publican resultados de benchmarks especificos para esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (1 capa de atencion completa + 3 capas de sliding-window attention), segun la familia Spark-X2.5 |
| Parametros totales | 1.707.657.216 (~1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1M tokens de forma nativa (segun la familia Spark-X2.5) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo distribuye safetensors; se espera compatibilidad GGUF via llama.cpp/Ollama, sin confirmar para este checkpoint) |
| Idiomas soportados | Mas de 200 idiomas segun la familia Spark-X2.5; no se detalla la cobertura especifica de este fine-tune |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer con un diseno de atencion hibrida: intercala una capa de atencion completa con tres capas de atencion de ventana deslizante. Este esquema busca equilibrar calidad, eficiencia de inferencia y tamano de la KV-cache, un cuello de botella habitual en tareas agenticas de contexto largo. Segun la documentacion de XHToken, el preentrenamiento del modelo base uso aproximadamente 20 billones (20T) de tokens procedentes de paginas web, libros, publicaciones academicas, codigo y materiales enciclopedicos, con especial atencion a la mezcla de dominios de matematicas, logica y codigo. La capacidad de contexto largo se desarrollo en una etapa especifica de cientos de miles de millones de tokens con secuencias de hasta 1M tokens.

El post-entrenamiento del modelo base incluye un ajuste supervisado (SFT) sobre un corpus curado y despues aprendizaje por refuerzo (RL) a gran escala en varios dominios de capacidad (comprension del lenguaje, razonamiento, programacion, comportamiento agentico con herramientas y seguimiento de instrucciones). La consolidacion de las distintas politicas especializadas se realiza mediante una tecnica denominada MOPD segun el autor. El entrenamiento se llevo a cabo en clusters Huawei Ascend. Para este repositorio concreto, se desconoce la receta, el dataset y el metodo de ajuste aplicados por MENIARAYOUB sobre el checkpoint base; no se especifica si hubo SFT, DPO, RLHF u otra tecnica adicional.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (etiqueta "conversational").
- Razonamiento general y respuesta a instrucciones.
- Generacion de codigo y soporte para tareas de programacion.
- Uso de herramientas (tool calling / function calling), segun la familia Spark-X2.5.
- Flujos agenticos y razonamiento multi-paso, con integracion declarada con Codex, Claude Code, OpenClaw y Hermes.
- Capacidades multilingues amplias (mas de 200 idiomas segun el autor original).
- Contexto largo nativo de hasta 1M tokens, orientado a RAG y tareas con documentos extensos.
- No se declaran capacidades de vision ni de audio para este modelo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y mantener el hilo gracias a su ventana de contexto de hasta 1M tokens, util para resumir historiales largos de incidencias.
- Generacion de codigo en produccion: al soportar tool calling y agentes, puede integrarse en asistentes de IDE o pipelines de CI/CD para autocompletar, refactorizar o generar pruebas.
- RAG sobre documentacion extensa: con contexto de hasta 1M tokens permite ingerir manuales o bases de conocimiento completas sin trocear en exceso, reduciendo perdida de contexto entre fragmentos.
- Traduccion y localizacion multilingue: la cobertura de mas de 200 idiomas facilita traduccion automatica y adaptacion de contenido para audiencias diversas.
- Asistentes agenticos locales: por su tamano compacto (~1.7B) puede ejecutarse en hardware de gama media o consumer, habilitando agentes que operan en local sin depender de la nube.
- Procesamiento de documentos legales o academicos: la ventana de contexto larga permite analizar contratos, informes o articulos completos y extraer resumenes o clausulas relevantes.
- Prototipado y experimentacion academica: su licencia Apache-2.0 y su tamano reducido lo hacen apto para investigacion y para iterar rapidamente en entornos con recursos limitados.
- Despliegue en el borde (edge): al caber en GPUs de consumo e incluso CPU con cuantizacion, sirve para aplicaciones de escritorio o embebidas que requieren privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible para este checkpoint. La model card del autor original menciona una comparativa de benchmarks mediante una imagen (model-benchmark-comparison.svg) frente a modelos on-device de tamano similar en tareas de agente, codigo, matematicas y generacion, pero los valores concretos no se incluyen en la informacion proporcionada. No se dispone de cifras verificables de MMLU, HumanEval, GSM8K u otros conjuntos para esta version.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada segun el tamano de 1.7B parametros): ~3,4 GB en FP16, ~1,7 GB en INT8 y ~1 GB en cuantizacion de 4 bits, sin contar el consumo de la KV-cache (que crece con la longitud de contexto y puede ser elevado con ventanas de hasta 1M tokens).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16 (por ejemplo RTX 3060, RTX 4060, RTX 4090); para despliegues de mayor concurrencia o contexto muy largo se recomiendan A100, H100 o equivalentes.
- Cabe en GPU de consumo: si, es probable que funcione en GPUs consumer como RTX 3060 en adelante, especialmente con cuantizacion.
- Opciones de despliegue declaradas por la familia Spark-X2.5: vLLM, SGLang, llama.cpp, MLX, Ollama, LM Studio y ajuste con LLaMA-Factory. La compatibilidad concreta de este checkpoint no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. El autor afirma mejoras en TTFT, TOPT y eficiencia global frente a modelos de tamano similar, pero sin cifras concretas publicadas para esta version.
- Compatibilidad de hardware: la familia declara soporte para NVIDIA, Huawei, Hygon y HOUMO.AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-1.7B (este checkpoint) | ~1.7B | Hasta 1M tokens (segun familia) | Apache-2.0 | HuggingFace, Ollama |
| Qwen2.5-1.5B | ~1.5B | 32K nativo (ampliable) | Apache-2.0 (segun version) | HuggingFace, Ollama |
| Llama-3.2-1B | ~1.23B | 128K | Licencia comunitaria Llama 3.2 | HuggingFace, Ollama |
| Gemma-2-2B | ~2.6B | 8K | Licencia Gemma | HuggingFace, Ollama |

Nota: los datos de los modelos comparativos corresponden a especificaciones publicas conocidas y pueden variar segun la version exacta; no se dispone de resultados de benchmarks de este checkpoint para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Es un fine-tune de la comunidad (MENIARAYOUB) con 0 descargas y 0 likes; no cuenta con validacion ni mantenimiento equivalentes a un checkpoint oficial.
- No se documenta el dataset ni la metodologia de ajuste, por lo que no puede evaluarse el riesgo de sobreajuste ni de regresion frente al modelo base.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad.
- Aunque la familia declara mas de 200 idiomas, la calidad real por idioma no esta especificada y puede ser desigual.
- La ventana de 1M tokens implica un consumo elevado de KV-cache en contexto largo; puede no ser viable en hardware de gama baja a maxima longitud.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y de las dependencias de codigo personalizado (etiqueta custom_code) antes de desplegar en produccion.
- No se declaran capacidades de vision ni de audio, por lo que no debe usarse para tareas multimodales.
- No se han publicado resultados de benchmarks verificables, lo que dificulta estimar su rendimiento real.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/MENIARAYOUB/Spark-X2.5-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B-Base
- Repositorio GitHub de la familia Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- README de la familia en GitHub: https://github.com/XHToken/Spark-X2.5/blob/main/README.md
- Pagina del modelo en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B:latest
- Referencia en LLM Reference: https://www.llmreference.com/model/spark-x2.5-1.7b
- Slack de Spark: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de Spark: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
