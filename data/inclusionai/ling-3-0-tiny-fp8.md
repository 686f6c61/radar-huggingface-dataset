# inclusionAI/Ling-3.0-tiny-fp8

## Resumen

Ling-3.0-tiny es un modelo de razonamiento híbrido de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, diseñado para ofrecer capacidades avanzadas de razonamiento y agencia con un coste de inferencia reducido. Con 7,9 mil millones de parámetros totales y solo 1,3 mil millones activos por token, se posiciona como una opción accesible para despliegue local y entornos con recursos limitados. El modelo combina una arquitectura de atención lineal híbrida (KDA y MLA) con una FFN MoE dispersa de 128 expertos, activando 8 expertos enrutados y 1 experto compartido por token.

La relevancia actual de Ling-3.0-tiny radica en su equilibrio entre eficiencia computacional y rendimiento en tareas de agente, codificación, matemáticas y razonamiento científico. Soporta un contexto de 256K tokens, modo de pensamiento configurable por petición y está validado en hardware como NVIDIA DGX Spark y Apple Silicon, alcanzando velocidades de 86-105 tokens/s según la plataforma. Se distribuye con pesos en BF16, FP8 e INT4, lo que amplía su rango de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid linear attention (KDA + MLA) con MoE FFN de 128 expertos (8 enrutados + 1 compartido por token) |
| Parametros totales | 7.893.392.800 (7,9B) |
| Parametros activos | 1,3B |
| Longitud de contexto | 256K (262144 tokens) |
| Tipos de cuantizacion | FP8 (este repo), BF16, INT4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8, BF16, INT4 disponibles) |

## Arquitectura y entrenamiento

Ling-3.0-tiny hereda la arquitectura de atención lineal híbrida de la serie Ling-3.0, optimizada para despliegue ligero. Cada bloque de 4 capas alterna 3 capas KDA (Kimi Delta Attention) y 1 capa MLA (Multi-Head Latent Attention), lo que mejora el procesamiento de contextos largos. La FFN MoE contiene 128 expertos enrutados y 1 experto compartido; por token se activan 8 expertos enrutados y el compartido, reduciendo el coste computacional a 1,3B parámetros activos. El modelo soporta razonamiento híbrido nativo: respuestas rápidas para tareas rutinarias y razonamiento multi-paso para tareas complejas, controlable mediante el parámetro `enable_thinking`.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO). La información disponible indica que el modelo está diseñado para equilibrar eficiencia y rendimiento en tareas de agente, codificación, razonamiento matemático y científico, y seguimiento de instrucciones.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento configurable por petición (`enable_thinking`).
- Capacidades de agente: soporte nativo para function calling y tool calling, adecuado para flujos de trabajo agénticos.
- Codificación: generación y depuración de código, con rendimiento evaluado en benchmarks como Terminal-Bench 2.1.
- Razonamiento matemático y científico: resolución de problemas complejos con razonamiento explícito.
- Seguimiento de instrucciones: adherencia a instrucciones detalladas en conversaciones multi-turno.
- Longitud de contexto de 256K tokens, con escalado YaRN para contextos extendidos.
- Multilingüismo: no se especifican idiomas soportados en la documentación.
- Despliegue local eficiente: validado en NVIDIA DGX Spark, Apple Silicon MacBook y Mac mini, con uso de memoria de ~8,34 GiB a 8K de contexto.

## Casos de uso

- Asistente de codificación local: el modelo puede integrarse en entornos de desarrollo para autocompletado, revisión de código y generación de tests, aprovechando su modo de razonamiento para explicar soluciones y su bajo coste de inferencia en portátiles con Apple Silicon.
- Agente autónomo para automatización de tareas: gracias a su soporte nativo de tool calling y su ventana de 256K tokens, puede gestionar flujos multi-paso como consultas a APIs, gestión de calendarios o extracción de datos de documentos largos.
- Análisis de documentos extensos: con 256K de contexto, permite resumir, extraer información y responder preguntas sobre contratos, informes o investigaciones completas sin necesidad de dividir el texto.
- Chatbot de atención al cliente: su capacidad de conversación multi-turno y seguimiento de instrucciones lo hace adecuado para sistemas de soporte con contexto prolongado, manteniendo respuestas coherentes y precisas.
- Razonamiento matemático y científico en educación: puede utilizarse como tutor interactivo que explica paso a paso la resolución de problemas, gracias a su modo de pensamiento configurable.
- Despliegue en edge computing: su tamaño reducido y la cuantización FP8 permiten ejecutarlo en dispositivos con memoria limitada, como mini-PCs o estaciones de trabajo sin GPU de gama alta, para tareas de razonamiento en tiempo real.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluaciones externas:

| Métrica | Valor |
|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 25 |
| Artificial Analysis Agentic Index | 16 |
| Velocidad de salida (Artificial Analysis) | >160 tokens/s |
| Latencia extremo a extremo (respuesta de 500 tokens, incluyendo razonamiento) | ~18 segundos |
| Velocidad en DGX Spark (FP8) | 100-105 tokens/s |
| Velocidad en M4 Pro MacBook (FP8) | 86-90 tokens/s |
| Pico de memoria a 8K contexto | ~8,34 GiB |

No se han publicado resultados detallados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; la tabla de la model card es una imagen no accesible. La evaluación de Terminal-Bench 2.1 se menciona pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: con FP8, el pico de memoria es de ~8,34 GiB a 8K de contexto, lo que sugiere que puede ejecutarse en GPUs con 8-12 GB de VRAM, aunque no se especifica explícitamente.
- GPUs recomendadas: validado en NVIDIA DGX Spark (GPU de clase 141GB, como H20-3e) y en Apple Silicon (M4 Pro). También se menciona compatibilidad con nodos Blackwell de 1 GPU.
- Consumer GPUs: no se indica explícitamente, pero dado el bajo número de parámetros activos y la cuantización FP8, es plausible que funcione en GPUs como RTX 4090 (24 GB) o RTX 3090, aunque no hay confirmación oficial.
- Opciones de despliegue: SGLang es el runtime recomendado, con recetas específicas para BF16/FP8 y modos de baja latencia o alto throughput. También está disponible en OpenRouter para acceso vía API.
- Latencia y throughput: en DGX Spark se alcanzan 100-105 tokens/s; en M4 Pro, 86-90 tokens/s. En pruebas de Artificial Analysis, la velocidad de salida supera los 160 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|---|
| Ling-3.0-tiny | 7,9B | 1,3B | 256K | MIT | MoE híbrido (KDA+MLA) |
| Qwen2.5-7B-Instruct | 7,6B | 7,6B | 128K | Apache 2.0 | Dense |
| Llama-3.1-8B-Instruct | 8,0B | 8,0B | 128K | Llama 3.1 Community | Dense |

Ling-3.0-tiny se diferencia por su arquitectura MoE con solo 1,3B activos, lo que reduce el coste de inferencia frente a modelos densos de tamaño similar. Su contexto de 256K supera a los 128K de las alternativas. La licencia MIT es más permisiva que la de Llama. No se dispone de comparativas de benchmarks directas con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o composición de datos.
- Al ser un modelo pequeño (1,3B activos), puede presentar alucinaciones o razonamiento menos robusto en tareas muy complejas comparado con modelos de mayor escala.
- La longitud de contexto de 256K es teórica; el rendimiento en contextos muy largos puede degradarse, aunque se ha validado con escalado YaRN.
- No se especifican los idiomas soportados; es probable que el rendimiento sea óptimo en inglés y chino (por el origen del autor), pero no está confirmado.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los pesos y posibles patentes de la arquitectura.
- Para producción, es necesario validar el comportamiento en tareas específicas y considerar la latencia de razonamiento (el modo de pensamiento añade tiempo de espera).

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny-fp8
- Modelo base (BF16): https://huggingface.co/inclusionAI/Ling-3.0-tiny
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter (acceso gratuito): https://openrouter.ai/inclusionai/ling-3.0-tiny:free
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-tiny
- Página en Vercel AI Gateway: https://vercel.com/ai-gateway/models/ling-3.0-tiny-free
