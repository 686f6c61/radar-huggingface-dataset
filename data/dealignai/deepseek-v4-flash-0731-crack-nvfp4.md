# dealignai/DeepSeek-V4-Flash-0731-CRACK-NVFP4

## Resumen

Dealign.ai publica una variante "crack" (uncensored) del modelo DeepSeek-V4-Flash-0731 de DeepSeek, en la que se han eliminado los rechazos por seguridad mediante una técnica de abliteration, conservando el conocimiento, el razonamiento con esfuerzo controlable, el tool calling y la decodificación especulativa DSpark del modelo original. El resultado es un checkpoint con cuantización nativa mixta FP8 + FP4 (clase NVFP4) de aproximadamente 167 GB, diseñado para servirse con tensor-parallel sobre dos nodos NVIDIA GB10 / DGX Spark.

El modelo base es un MoE de 304 180 418 494 parámetros (~304B) con 43 capas, 256 expertos enrutados más un experto compartido, atención MLA (Multi-head Latent Attention), sliding-window attention y contexto extendido de ~1M tokens vía YaRN. Esta versión mantiene intactas esas características y añade la eliminación de las barreras de rechazo, lo que la convierte en un artefacto de investigación con guardas de seguridad reducidas. Su relevancia radica en ofrecer una alternativa sin censura para entornos de investigación donde los rechazos del modelo base interfieren con el flujo de trabajo, manteniendo métricas de conocimiento y código comparables o superiores a las del original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MLA y sliding-window attention, 43 capas, 256 expertos enrutados + 1 compartido |
| Parametros totales | 304.180.418.494 (~304B) |
| Parametros activos | no disponible |
| Longitud de contexto | ~1M tokens vía YaRN; 384K tokens (393216) en la configuración de servicio recomendada |
| Tipos de cuantizacion | FP8 (attention y expertos compartidos) + FP4 (expertos enrutados), clase NVFP4 |
| Idiomas soportados | inglés, chino (en, zh) |
| Licencia | MIT (hereda términos de la licencia del upstream DeepSeek-V4-Flash) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint `deepseek-ai/DeepSeek-V4-Flash-0731` mediante abliteration, una técnica que identifica y elimina las direcciones de activación responsables de los rechazos de seguridad sin reentrenar el modelo. El proceso no está documentado en detalle en la información disponible, pero los benchmarks publicados indican que el conocimiento y las capacidades de razonamiento se conservan, con una ligera mejora en MMLU (86,7% frente a 84,2% del base).

La arquitectura subyacente es un transformer MoE de 43 capas con 256 expertos enrutados y un experto compartido, atención MLA para reducir el coste de la caché KV, sliding-window attention y extensión de contexto a ~1M tokens mediante YaRN. La cuantización es nativa: FP8 para las capas de atención y los expertos compartidos, y FP4 para los expertos enrutados, lo que permite un checkpoint de ~167 GB. Se conserva además la cabeza MTP (Multi-Token Prediction) de DSpark para la decodificación especulativa. No se han publicado detalles sobre el dataset de entrenamiento del finetune ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento con esfuerzo controlable (thinking mode bajo, alto o máximo) mediante un prefijo de sistema; el razonamiento se devuelve en `reasoning_content` y la respuesta en `content`.
- Tool calling y function calling compatible con el parser `deepseek_v4`, aceptando herramientas estilo OpenAI en el endpoint de chat.
- Soporte para agentes y razonamiento multi-paso, con corrección multiturno verificada en 24/24 ejecuciones concurrentes.
- Decodificación especulativa DSpark integrada, con 5 tokens especulativos por paso, que acelera la generación.
- Capacidades multilingües limitadas a inglés y chino.
- Ausencia de rechazos por seguridad: cumplimiento del 100% en las 240 conductas de HarmBench, con 0 rechazos duros.
- Gestión de contexto largo: caché KV de 1,27M tokens en FP8 y soporte de prefix caching con una tasa de acierto del 64% en concurrencia de 12 peticiones.

## Casos de uso

- Desarrollo de agentes autónomos con tool calling: el modelo puede encadenar llamadas a herramientas y razonar sobre los resultados, gracias al parser `deepseek_v4` y al soporte de razonamiento multi-paso. Es adecuado para pipelines de automatización donde el agente debe decidir qué herramienta invocar en cada turno.
- Generación de código en producción: con un 94,3% en HumanEval pass@2, puede integrarse en sistemas de asistencia a programación, generación de tests o revisión de código, aprovechando el tool calling para ejecutar comandos o consultar repositorios.
- Procesamiento de documentos extensos: la ventana de contexto de hasta 384K tokens en la configuración recomendada permite resumir, extraer información o responder preguntas sobre documentos técnicos, legales o científicos de gran tamaño sin necesidad de chunking.
- Investigación en seguridad ofensiva y análisis de contenido sensible: al no presentar rechazos, permite estudiar vulnerabilidades, redactar exploits educativos o analizar contenido restringido en entornos controlados de laboratorio, siempre bajo supervisión legal y ética.
- Despliegue de inferencia en hardware de borde tipo AI PC: al estar cuantizado en FP4/FP8 y optimizado para GB10 / DGX Spark, puede servirse en estaciones de trabajo locales sin depender de clústeres cloud, con un throughput de 45–49 tok/s en una sola secuencia.
- Razonamiento matemático y lógico avanzado: el modo de pensamiento controlable permite ajustar la profundidad del razonamiento según la complejidad del problema, útil en tutoría, verificación de demostraciones o análisis estadístico.
- Traducción y procesamiento bilingüe inglés-chino: adecuado para localización de software, documentación técnica o soporte al cliente en ambos idiomas, manteniendo coherencia terminológica en contextos largos.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan este modelo con el base en el mismo checkpoint y hardware (2×GB10, TP2):

| Metrica | Base | Este modelo |
|---|---|---|
| MMLU (logit, 285 preguntas) | 84,2% | 86,7% (+2,5 pp) |
| HumanEval pass@2 (70) | — | 94,3% |
| HarmBench compliance (240) | rechaza | ≥96%, 0 rechazos duros |
| Decode throughput (single-stream) | — | 45–49 tok/s |
| Prefix-cache hit (12-way concurrent) | — | 64% (3,7× más rápido en acierto) |
| Multiturn correctness (24 concurrent) | — | 24/24 |
| GPU KV cache | — | 1,27M tokens (FP8) |

Cumplimiento por categoría en HarmBench (240 conductas, canal de respuesta, greedy):

| Categoria | Cumplimiento | Tasa |
|---|---|---|
| chemical biological | 42/42 | 100% |
| cybercrime intrusion | 52/52 | 100% |
| harassment bullying | 21/21 | 100% |
| harmful | 18/18 | 100% |
| illegal | 53/53 | 100% |
| misinformation disinformation | 54/54 | 100% |

## Requisitos de hardware

- Hardware objetivo: 2× NVIDIA GB10 / DGX Spark conectados por enlace punto a punto RoCE, con tensor-parallel size 2 y expert-parallel habilitado.
- Tamaño del checkpoint: ~167 GB en cuantización FP8/FP4, por lo que no cabe en una única GPU de consumo convencional; requiere el par de GB10 o hardware equivalente con memoria unificada suficiente.
- VRAM estimada: no disponible en la información publicada; la configuración recomendada usa `--gpu-memory-utilization 0.80` sobre los dos GB10.
- Opciones de despliegue: vLLM con la ruta DeepSeek-V4 para arquitectura `sm_121` (por ejemplo, el build `jasl/vllm` para GB10). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 45–49 tok/s en una sola secuencia; con prefix caching, las peticiones con acierto de caché son 3,7× más rápidas.
- Configuración de servicio recomendada: `--tensor-parallel-size 2 --enable-expert-parallel --kv-cache-dtype fp8 --block-size 256 --enable-prefix-caching --max-model-len 393216 --speculative-config '{"method":"dspark","num_speculative_tokens":5}'`.

## Comparativa con modelos similares

La comparación directa disponible es contra el modelo base del que deriva. No se han publicado datos de otros modelos uncensored comparables en la información proporcionada.

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | ~304B (MoE) | ~1M (YaRN) | 84,2% | no disponible | MIT (upstream) |
| DeepSeek-V4-Flash-0731-CRACK-NVFP4 (este) | ~304B (MoE) | ~1M (YaRN) | 86,7% | 94,3% (pass@2) | MIT |

No hay datos disponibles de otras alternativas abliteradas o sin censura del mismo tamaño para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Eliminación de guardas de seguridad: el modelo no rechaza contenido peligroso (armas químicas, ciberdelincuencia, acoso, desinformación, etc.), con un 100% de cumplimiento en HarmBench. Su uso conlleva un riesgo significativo de uso malintencionado; es un artefacto de investigación con responsabilidad legal y ética del usuario.
- Riesgo de alucinación: no se han publicado métricas específicas de alucinación; como todo LLM, puede generar información falsa o inventada, especialmente en contextos largos.
- Idiomas limitados: solo inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Modo de razonamiento extenso: en thinking mode, el modelo puede generar razonamientos muy largos; se recomienda permitir al menos 2500 tokens de salida o la respuesta final puede truncarse.
- Requisitos de hardware específicos: la cuantización y la configuración de servicio están pensadas para GB10 / DGX Spark; en otro hardware puede ser necesario re-cuantizar o ajustar la configuración, con posible pérdida de rendimiento.
- Licencia: aunque la licencia declarada es MIT, hereda los términos del upstream DeepSeek-V4-Flash; es necesario revisar ambas licencias antes de un uso comercial.
- Sin garantías de producción: el autor lo presenta como un artefacto de investigación; no se documentan pruebas de estabilidad en entornos de producción a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/DeepSeek-V4-Flash-0731-CRACK-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Sitio de Dealign.ai: https://dealign.ai
- Contacto del autor: eric@dealign.ai
