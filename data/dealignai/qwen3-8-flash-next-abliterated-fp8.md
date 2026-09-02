# dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8

## Resumen

Qwen3.8-Flash-Next-ABLITERATED-FP8 es una versión modificada a nivel de pesos del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario dealignai en Hugging Face. La modificación, conocida como "abliteration", elimina los comportamientos de rechazo (refusal) del modelo original sin recurrir a fine-tuning, LoRA, ni trucos de prompt: el cambio reside exclusivamente en los pesos, por lo que funciona con la plantilla de chat estándar y el system prompt por defecto. El resultado es un modelo que no se niega a responder ante solicitudes que el modelo base rechazaría, manteniendo el resto de capacidades prácticamente intactas.

El modelo base es un MoE ultra-sparse multimodal con arquitectura híbrida GDN (Gated DeltaNet) y QSA (Qwen Sparse Attention), con 125 000 millones de parámetros más una tabla de embeddings N-gram de 51 000 millones, activando 6 000 millones de parámetros por token. Esta versión concreta está cuantizada en FP8, pesa 185,6 GB y conserva el razonamiento configurable (low, medium, xhigh), la decodificación especulativa MTP y la multimodalidad (imagen y vídeo). Está pensada para servirse con vLLM en hardware Hopper o Blackwell, y su relevancia radica en ofrecer una alternativa "sin censura" para entornos de investigación y desarrollo donde se requiere explorar contenido sensible o evaluar los límites de los modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrida (GDN + QSA) |
| Parametros totales | 179 999 981 459 (incluye tabla N-gram de 51 000 millones) |
| Parametros activos | 6 000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (oficial) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (FP8), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de información a larga distancia. Esta combinación mejora la capacidad del modelo a la vez que optimiza el coste computacional y la estabilidad del entrenamiento. El modelo es un MoE ultra-sparse con 125 000 millones de parámetros distribuidos en expertos, más una tabla de embeddings N-gram de 51 000 millones que se gestiona por separado y se descarga a CPU en tiempo de ejecución (variable `VLLM_PLE_CPU_OFFLOAD=1`).

La versión abliterated no ha sido reentrenada: se trata de una modificación directa de los pesos del modelo base, sin fine-tuning, LoRA, destilación ni datos sintéticos. El autor reporta que el conocimiento, el estilo, el razonamiento y la calibración permanecen prácticamente inalterados, con una caída de solo 2,5 puntos porcentuales en MMLU (de 86,36 % a 83,86 %). La cuantización FP8 es la oficial del modelo base, lo que garantiza compatibilidad con vLLM en GPUs Hopper y Blackwell.

## Capacidades

- Generación de texto y razonamiento configurable en tres niveles de esfuerzo: low, medium y xhigh, activable mediante `chat_template_kwargs` con `enable_thinking` y `reasoning_effort`.
- Multimodalidad completa: procesa tanto imágenes como vídeo, manteniendo el pipeline `image-text-to-text` del modelo base.
- Decodificación especulativa MTP (Multi-Token Prediction) preservada, con una tasa de aceptación de borradores de aproximadamente el 81 % (1,8× de eficiencia de borrador) usando el método `qwen3_8_flash_next_mtp` de vLLM.
- Comportamiento "uncensored": al estar abliterado, no rechaza solicitudes que el modelo base rechazaría, funcionando con la plantilla de chat estándar y el system prompt por defecto.
- Coherencia verificada: no se observan bucles en código, matemáticas, razonamiento ni texto largo en modo greedy.
- Configuración de generación recomendada: temperatura 1,0, top_p 0,95, top_k 20.

## Casos de uso

- Investigación en seguridad y alineación: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, comparando respuestas con el modelo base para analizar sesgos, límites y riesgos de contenido dañino.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material artístico que el modelo base podría rechazar por temáticas sensibles, manteniendo la calidad de razonamiento y estilo.
- Desarrollo de asistentes conversacionales especializados: integración en sistemas de chat donde se requiere que el modelo no se niegue a responder sobre temas controvertidos, siempre dentro de un marco legal y ético.
- Análisis multimodal de imágenes y vídeo: al conservar la multimodalidad, puede emplearse en tareas de descripción, resumen o extracción de información de contenido visual, incluso si este es de naturaleza sensible.
- Evaluación de técnicas de "abliteration": sirve como referencia para desarrolladores que investigan métodos de modificación de pesos y su impacto en capacidades y comportamiento.
- Despliegue en entornos de producción con vLLM: gracias a la cuantización FP8 y al soporte de MTP, puede servirse en clústeres con GPUs Hopper o Blackwell, ofreciendo baja latencia en tareas de razonamiento largo.

## Benchmarks y rendimiento

El autor proporciona resultados de dos evaluaciones: cumplimiento de comportamientos dañinos reales (HarmBench-320) y capacidad general (MMLU). No se han publicado comparaciones con otros modelos en la información disponible.

| Benchmark | Configuración | Resultado |
|---|---|---|
| HarmBench-320 (cumplimiento, greedy, temp=0) | reasoning off | 97,1 % |
| HarmBench-320 (cumplimiento, greedy, temp=0) | reasoning low | 100 % |
| HarmBench-320 (cumplimiento, greedy, temp=0) | reasoning xhigh | 99,6 % |
| MMLU (2 280 preguntas, 40 por materia) | overall | 83,86 % (base: 86,36 %) |

En el desglose por categorías de HarmBench, todas alcanzan el 100 % con razonamiento activado; la única caída relevante es acoso/acoso escolar con razonamiento desactivado (81 %). En MMLU, la pérdida media es de 2,5 puntos porcentuales, con variaciones por materia que van desde -15 (álgebra abstracta) hasta +5 (química de secundaria).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 185,6 GB en FP8, por lo que se necesitan al menos 2 GPUs con soporte FP8 y memoria combinada suficiente (el autor indica que funciona en 2× DGX Spark).
- GPUs recomendadas: NVIDIA Hopper (H100) o Blackwell (B200), con soporte nativo para FP8 en vLLM.
- No cabe en GPUs de consumo (RTX 4090 o similares) debido al tamaño del modelo y a la necesidad de FP8.
- Opciones de despliegue: vLLM es la librería principal; se requiere `tensor_parallel_size=2` y `trust_remote_code=True`. También se menciona compatibilidad con SGLang en la versión NVFP4, pero para esta versión FP8 el soporte es vLLM.
- Latencia y throughput: no se proporcionan cifras exactas, pero la decodificación especulativa MTP con ~81 % de aceptación de borradores mejora el throughput respecto a la decodificación autoregresiva estándar.
- La tabla PLE N-gram se descarga a CPU en tiempo de ejecución mediante `VLLM_PLE_CPU_OFFLOAD=1`, lo que reduce la presión sobre VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B N-gram (6B activos) | no disponible | 86,36 % | qwen-community-license-1.0 | Hugging Face |
| Qwen3.8-Flash-Next-ABLITERATED-FP8 (este) | 179 999 981 459 (6B activos) | no disponible | 83,86 % | qwen-community-license-1.0 | Hugging Face |
| Qwen3.8-Flash-Next-ABLITERATED-NVFP4 | 179 999 981 459 (6B activos) | no disponible | no disponible | qwen-community-license-1.0 | Hugging Face (135 GB) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos abliterated de tamaño similar en la información proporcionada. La versión NVFP4 es una cuantización alternativa de 4 bits que reduce el peso a 135 GB, pero no se han publicado benchmarks para ella.

## Limitaciones y advertencias

- Al estar abliterado, el modelo puede generar contenido dañino, ilegal o éticamente problemático si se le solicita; el propio autor reporta un 97-100 % de cumplimiento en comportamientos dañinos reales, lo que implica que no hay garantía de seguridad.
- La licencia qwen-community-license-1.0 puede imponer restricciones de uso comercial o de redistribución; es necesario revisar el texto completo de la licencia antes de desplegarlo en producción.
- La caída de rendimiento en MMLU (2,5 puntos) indica una ligera degradación de capacidades, especialmente en materias como álgebra abstracta (-15) o contabilidad profesional (-10).
- El modelo requiere hardware específico (FP8, Hopper/Blackwell) y no es desplegable en GPUs de consumo; el tamaño del repositorio (185,6 GB) dificulta su uso en entornos con recursos limitados.
- No se dispone de información sobre la longitud de contexto soportada, los idiomas exactos ni el comportamiento en tareas de tool calling o agentes; estos aspectos deben validarse empíricamente.
- La decodificación especulativa MTP depende de la implementación de vLLM y puede no estar disponible en todas las versiones; se requiere `trust_remote_code=True` y configuración específica.
- El riesgo de alucinación no se ha evaluado específicamente en esta versión; se asume similar al modelo base, pero la modificación de pesos podría alterar la calibración en ciertos dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Versión NVFP4 (alternativa de 4 bits): https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-NVFP4
- Página de análisis en LLM Explorer: https://llm-explorer.com/model/dealignai%2FQwen3.8-Flash-Next-ABLITERATED-NVFP4,fwnHiIzbTLrA8avNRNexW
