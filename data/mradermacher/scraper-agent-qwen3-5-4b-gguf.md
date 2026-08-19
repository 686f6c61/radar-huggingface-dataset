# mradermacher/scraper-agent-qwen3.5-4b-GGUF

## Resumen

El modelo `scraper-agent-qwen3.5-4b-GGUF` es una versión cuantizada en formato GGUF del modelo `badrm2611/scraper-agent-qwen3.5-4b`, publicada por el usuario mradermacher en Hugging Face. El nombre sugiere que se trata de un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B orientado a tareas de scraping web y agentes de extracción de datos, aunque no se dispone de documentación oficial que confirme esta finalidad. La publicación se realizó el 19 de agosto de 2026 y no cuenta con descargas ni valoraciones.

La relevancia de este modelo radica en su potencial uso como agente autónomo para recopilación de información en entornos web, aprovechando las capacidades del modelo base Qwen3.5-4B, que según fuentes externas es un modelo denso de 4 mil millones de parámetros con soporte multimodal y contexto largo (262K-1M). Sin embargo, al carecer de model card detallada, licencia explícita o métricas de rendimiento, su adopción en producción requiere una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, basado en Qwen3.5-4B) |
| Parametros totales | no disponible (estimado 4B según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-4B soporta 262K-1M según fuentes externas) |
| Tipos de cuantizacion | f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen3.5-4B es Apache 2.0, pero no se confirma para este fine-tuning) |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo `scraper-agent-qwen3.5-4b`. Por el nombre y la referencia al modelo base, se infiere que se trata de un transformer denso de 4 mil millones de parámetros, probablemente con atención multi-cabeza y mecanismos de ventana de contexto extendida, similar a la familia Qwen3.5. El proceso de entrenamiento del fine-tuning no está documentado: se desconoce el dataset utilizado, el número de tokens de entrenamiento, o si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue realizada por mradermacher, quien es conocido por publicar versiones cuantizadas de modelos de terceros, pero no se especifican los detalles del proceso de cuantización (por ejemplo, calibración, precisión de activaciones).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, que según fuentes externas iguala a Qwen3-30B en MMLU-Pro y supera a GPT-5-Nano en benchmarks de visión.
- Soporte multimodal: el modelo base Qwen3.5-4B es multimodal (imagen y texto), aunque no se confirma si esta capacidad se mantiene en el fine-tuning.
- Posible especialización en scraping web: el nombre "scraper-agent" sugiere que el modelo ha sido ajustado para tareas de extracción de datos, navegación web o generación de consultas estructuradas, pero no hay evidencia pública.
- Tool calling y agentes: no se documenta soporte explícito, aunque el modelo base Qwen3.5-4B es compatible con el framework Qwen-Agent, que incluye function calling y MCP.
- Multilingüismo: no disponible.

## Casos de uso

- Extracción de datos de sitios web: si el modelo está especializado en scraping, podría utilizarse para generar selectores CSS o XPath, parsear HTML y extraer campos concretos (precios, nombres, fechas) de forma automatizada.
- Agente de navegación web autónoma: integrado en un framework como Qwen-Agent, podría ejecutar acciones en un navegador (hacer clic, rellenar formularios) para recopilar información de múltiples páginas.
- Generación de informes estructurados: a partir de contenido web, el modelo podría resumir y estructurar datos en formatos JSON o CSV para su posterior análisis.
- Automatización de monitorización de precios o noticias: con un contexto largo, podría procesar grandes volúmenes de texto y detectar cambios relevantes.
- Asistente de investigación de mercado: combinado con búsqueda web, podría extraer y comparar información de competidores o proveedores.
- Pruebas de concepto en entornos de bajo consumo: al ser un modelo de 4B cuantizado, puede ejecutarse en GPUs de gama media, facilitando prototipos de agentes de scraping en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo específico. Las referencias a rendimiento del modelo base Qwen3.5-4B provienen de fuentes externas no verificadas y no pueden atribuirse a este fine-tuning.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B parámetros en cuantización Q4_K_M, se estima un consumo de 3-4 GB de VRAM, dependiendo de la longitud de contexto y el batch. Con Q8_0, podría requerir 5-6 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes para inferencia. Para contexto largo (más de 32K tokens), se recomienda al menos 12 GB de VRAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 8 GB o más, aunque con contexto reducido.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptador GGUF) o TGI (con conversión previa).
- Latencia y throughput: no disponible. En una RTX 4090, un modelo de 4B cuantizado puede generar entre 50-100 tokens por segundo, pero esto es una estimación genérica.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo base Qwen3.5-4B podría compararse con otros modelos de 4B como Qwen3-4B, Llama-3.2-3B o Gemma-3-4B, pero no hay métricas públicas para este fine-tuning. La siguiente tabla es orientativa basada en información externa del modelo base, no del modelo evaluado:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | 262K-1M | Apache 2.0 | Hugging Face |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | Hugging Face |
| Gemma-3-4B | 4B | 128K | Gemma | Hugging Face |

## Limitaciones y advertencias

- Ausencia de documentación: no hay model card detallada, por lo que se desconocen los datos de entrenamiento, el proceso de ajuste y las capacidades exactas.
- Licencia incierta: aunque el modelo base es Apache 2.0, el fine-tuning podría tener restricciones adicionales; se recomienda contactar al autor antes de uso comercial.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de extracción de datos.
- Sesgos potenciales: al no conocer el dataset de fine-tuning, no se puede evaluar la presencia de sesgos.
- Sin garantías de rendimiento: al no haber benchmarks, no se puede asegurar su eficacia en tareas de scraping reales.
- Dependencia del modelo base: las capacidades multimodales o de contexto largo podrían no estar disponibles en la versión cuantizada si el proceso de cuantización las degrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/scraper-agent-qwen3.5-4b-GGUF
- Modelo original (sin cuantizar): https://huggingface.co/badrm2611/scraper-agent-qwen3.5-4b
- Framework Qwen-Agent (relacionado con el modelo base): https://github.com/QwenLM/Qwen-Agent
- Página de Awesome Agents sobre Qwen3.5-4B: https://awesomeagents.ai/models/qwen-3-5-4b/
