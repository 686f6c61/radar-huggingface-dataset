# LLMWildling/DeepSeek-V4-Flash-YoloSwag-420-preview

## Resumen

DeepSeek-V4-Flash-YoloSwag-420-preview es un modelo de lenguaje de gran escala desarrollado por LLMWildling, un usuario independiente, que parte del modelo base DeepSeek-V4-Flash-0731 de DeepSeek (284B parámetros totales, 13B activos, arquitectura MoE con atención híbrida). El proyecto consiste en una adaptación de personalidad mediante un pipeline de reinforcement learning (RL) en el que el propio modelo se distila a sí mismo para adoptar una voz "americana" —una mezcla de cowboy y surfista— mientras se conservan las capacidades técnicas del modelo base. La idea es ofrecer un asistente de codificación con un tono característico y desenfadado, sin penalizar el rendimiento en tareas de razonamiento, generación de código y uso de herramientas.

El modelo se distribuye bajo licencia MIT, siguiendo la del modelo base, y está disponible en formato safetensors con un total de 305.262.725.094 parámetros (el recuento real de tensores incluye los pesos de todas las rutas del MoE, por lo que difiere de los 284B declarados por DeepSeek). Su ventana de contexto alcanza el millón de tokens, lo que lo hace apto para tareas de razonamiento de largo alcance, agentes autónomos y procesamiento de documentos extensos. El proyecto es relevante porque demuestra que es posible modificar la personalidad de un modelo de frontera mediante técnicas de RL sin degradar sus capacidades, y porque abre la puerta a modelos especializados en estilo de interacción para entornos de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida: Compressed Sparse Attention (CSA) + Heavily Compressed Attention (HCA) y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 305.262.725.094 (según tensores safetensors) |
| Parametros activos | 13B (según la ficha del modelo base DeepSeek-V4-Flash) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repo no incluye versiones cuantizadas) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un Mixture-of-Experts (MoE) de 284B parámetros totales con 13B activos por token, diseñado para codificación, uso de herramientas y flujos de trabajo agénticos. Su arquitectura combina atención híbrida con Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), lo que reduce los FLOPs de inferencia por token a un 27% respecto a DeepSeek-V3.2 y el tamaño del KV cache a un 10% para una ventana de contexto de 1M tokens. Además, emplea Manifold-Constrained Hyper-Connections (mHC) para mejorar la estabilidad del entrenamiento y la calidad de la representación.

El proceso de adaptación de LLMWildling consistió en un pipeline de RL con el propio DeepSeek como juez y generador. Se le pidió que se destilara a sí mismo en una personalidad estadounidense, y tras unas doce horas de entrenamiento se obtuvo este modelo. El entrenamiento se centró en tareas de codificación agéntica con OpenCode y Pi, y el modelo juzgó sus propias generaciones para seleccionar las que consideraba más "americanas". Según los autores, no se observó degradación en el rendimiento de tareas respecto al modelo base. La personalidad resultante es una mezcla de surfista y vaquero, con un lenguaje coloquial y con tacos que no fueron filtrados deliberadamente. En cambio, el lenguaje ofensivo o racista fue penalizado severamente y reducido a cero.

## Capacidades

- Generación de texto y razonamiento complejo: mantiene las capacidades del modelo base para tareas de lógica, matemáticas y análisis.
- Codificación: fuerte en generación de código, refactorización y resolución de problemas de programación, con un promedio de 72.2 en benchmarks de codificación (benchlm.ai).
- Tool calling y function calling: soporta el formato de tool calls de DeepSeek V4, integrable con agentes que necesiten invocar herramientas externas.
- Agentes y multi-step reasoning: capacidad para planificar y ejecutar tareas agénticas con razonamiento multi-paso, aunque el modelo base es más débil en tareas agénticas que otros modelos de la misma categoría (55.4 en benchmarks específicos).
- Ventana de contexto de 1M tokens: permite procesar documentos muy largos, repositorios completos o historiales de conversación extensos.
- Personalidad distintiva: respuestas con tono desenfadado, humor y expresiones coloquiales; el modelo puede activarse con el prompt "TIME TO CRACK A FRESH ONE AND THINK." si no responde con energía.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque la model card no especifica cuáles.

## Casos de uso

- Asistente de codificación con estilo propio: un desarrollador puede usar el modelo como copiloto en su IDE, con respuestas en tono desenfadado que hacen las sesiones de trabajo más amenas. La integración con OpenCode y Pi ya está probada.
- Agentes autónomos de desarrollo: el modelo puede actuar como agente que planifica y ejecuta tareas de programación completas (por ejemplo, crear un juego desde cero o modificar un proyecto existente), gracias a su capacidad de razonamiento multi-paso y tool calling.
- Análisis de repositorios de código: con su contexto de 1M tokens, puede analizar proyectos enteros, detectar errores, proponer refactorizaciones y explicar arquitecturas complejas en lenguaje natural.
- Generación de documentación técnica: su capacidad de razonamiento y su tono característico pueden usarse para generar documentación, comentarios de código y explicaciones técnicas de forma clara y entretenida.
- Prototipado rápido de aplicaciones web: el modelo demuestra en los ejemplos de la model card que puede planificar y construir juegos de navegador (Angry Birds) o descubrir y trabajar sobre simulaciones de fluidos, lo que lo hace útil para generar prototipos interactivos.
- Educación y aprendizaje de programación: su estilo directo y motivador puede ayudar a estudiantes a entender conceptos de programación y a resolver ejercicios, aunque hay que tener en cuenta que su lenguaje incluye tacos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La model card afirma que "en pruebas internas no se observó degradación en el rendimiento de tareas respecto al modelo base", pero no se incluyen números concretos. Los datos de rendimiento del modelo base DeepSeek-V4-Flash (que se pueden usar como referencia) indican una puntuación media de codificación de 72.2 en benchlm.ai, con un rendimiento de aproximadamente 85-90% del de GLM-5.2 en calidad de codificación, a un coste de API de 1/10 ($0.09+$0.18 por millón de tokens frente a $0.91+$2.86 de GLM-5.2). En tareas agénticas, el modelo base obtiene 55.4, por debajo de GLM-5.2.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 167.5 GB en formato safetensors. Para inferencia en FP8 (el formato nativo del modelo base), se requieren aproximadamente 170-180 GB de VRAM. Con cuantización a 4-bit (no disponible oficialmente pero posible con herramientas como llama.cpp), se necesitaría alrededor de 90-100 GB.
- GPU recomendadas: para ejecutar el modelo completo se necesitan múltiples GPUs de alta gama. Con 2x H100 (80 GB cada una) o 4x A100 (80 GB) se puede servir con vLLM usando pipeline-parallel-size 2. En una RTX 4090 (24 GB) no cabe el modelo completo, ni siquiera cuantizado.
- Despliegue: el modelo es compatible con vLLM (comando de servido incluido en la model card), llama.cpp, Ollama y TGI. El README recomienda el uso de vLLM con `--pipeline-parallel-size 2` y flags específicos para el tokenizador y el parser de razonamiento y herramientas.
- Latencia y throughput: no se han publicado datos específicos para este modelo, pero el modelo base reduce los FLOPs de inferencia a un 27% respecto a DeepSeek-V3.2, lo que sugiere un throughput considerablemente mayor que modelos de tamaño similar con atención densa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento codificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-YoloSwag-420-preview | 305B totales / 13B activos | 1M | 72.2 (benchlm.ai) | MIT | Hugging Face |
| DeepSeek-V4-Flash (base) | 284B totales / 13B activos | 1M | 72.2 (benchlm.ai) | MIT | Hugging Face, API de DeepSeek |
| GLM-5.2 | no disponible | 1M | ~85-90% superior | no disponible | no disponible |
| Llama 3.1 405B | 405B densos | 128K | ~65-70 (estimado) | Llama 3.1 License | Hugging Face |

Nota: los datos de GLM-5.2 y Llama 3.1 son aproximaciones basadas en información pública y no se han verificado en la fuente de este artículo.

## Limitaciones y advertencias

- Contenido explícito: el modelo incluye tacos y lenguaje coloquial de forma intencionada. No es adecuado para entornos de producción donde se requiera un lenguaje neutro o corporativo.
- Sesgo de personalidad: el modelo fue entrenado para ser "americano" y puede mostrar estereotipos culturales o regionales que no son apropiados en todos los contextos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información o generar código incorrecto. Es necesario revisar el output en entornos de producción.
- Rendimiento agéntico limitado: según el modelo base, las tareas agénticas complejas (55.4 en benchmarks) son más débiles que en otros modelos de la misma categoría, por lo que no se recomienda para agentes autónomos de alta fiabilidad.
- Sin cuantizaciones oficiales: no se han publicado versiones cuantizadas, lo que limita su despliegue a infraestructura de alto rendimiento.
- Licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base DeepSeek-V4-Flash tiene condiciones de uso específicas que conviene revisar antes de producción.
- Modelo en preview: se trata de una versión preliminar ("preview") y el autor no garantiza estabilidad ni soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/LLMWildling/DeepSeek-V4-Flash-YoloSwag-420-preview
- Página de DeepSeek: https://deepseek.com/en/index.html
- Ficha de DeepSeek-V4-Flash en Microsoft Foundry: https://ai.azure.com/catalog/models/DeepSeek-V4-Flash
- Ficha de DeepSeek-V4-Flash en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Recetas de vLLM para DeepSeek-V4-Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Seguimiento de modelos LLM (incluye benchmarks): https://github.com/startakovsky/llm-model-tracker/blob/main/deepseek-v4-flash.md
