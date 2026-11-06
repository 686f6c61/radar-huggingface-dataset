# prithivMLmods/VIGOR-mini

## Resumen

VIGOR-mini (Vision Intelligence and Guardrail Oriented Reasoning) es un modelo multimodal de clasificación de contenido visual de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones), desarrollado por prithivMLmods sobre la arquitectura Qwen/Qwen3.5-4B. Su propósito es el análisis de seguridad de contenido en imágenes: clasificación binaria Safe / NSFW con un umbral conservador orientado a control parental y protección de menores. El modelo analiza ropa, códigos de vestimenta, exposición corporal, poses, encuadre y contexto de la escena para emitir una decisión estructurada en JSON.

Se trata de un modelo denso (no MoE) pensado para inferencia local en hardware de consumo, con soporte de decodificación especulativa mediante la preservación de tensores MTP (Multi-Token Prediction). La salida está diseñada para ser consumida por sistemas de moderación automatizados, con campos como `scene_description`, `is_nsfw`, `classification_reason`, `nsfw` y `safe`, lo que facilita su integración en pipelines de guardrail.

Es relevante ahora porque los filtros de contenido multimodal siguen siendo un cuello de botella en plataformas con contenido generado por usuarios, y un modelo compacto de 4B con licencia Apache 2.0 y salida JSON estructurada reduce la barrera de despliegue frente a clasificadores propietarios o modelos de mayor tamaño. No obstante, el propio autor lo etiqueta como experimental y advierte de que sus predicciones no deben tratarse como juicios definitivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso basado en Qwen/Qwen3.5-4B (clase `Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | 4.659.865.088 (~4,66 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada (se mencionan flujos GGUF, sin detallar tipos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers); se mencionan flujos GGUF sin especificar artefactos |

## Arquitectura y entrenamiento

VIGOR-mini parte de Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text, y se presenta como un ajuste fino (finetune) sobre dicha base. La arquitectura es un transformer denso de aproximadamente 4,66 mil millones de parámetros que combina un codificador visual con un decodificador de lenguaje, capaz de procesar entradas de imagen y texto y generar respuestas en formato JSON. El autor denomina a este enfoque "VIGOR Architecture" (Vision Intelligence and Guardrail Oriented Reasoning), aunque la model card no detalla cambios estructurales respecto a la base.

Un aspecto técnico destacable es la preservación de los tensores MTP (Multi-Token Prediction), que habilitan decodificación especulativa y pueden mejorar el throughput en inferencia. La model card menciona dos modos de plantilla: "Best" con thinking desactivado y "Reasoning" con thinking activado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se detalla el proceso de anotación de las etiquetas Safe / NSFW.

## Capacidades

- Clasificación binaria de seguridad de contenido visual (Safe / NSFW) con umbral conservador y regla explícita de "ante la duda, NSFW".
- Generación de descripciones visuales detalladas y objetivas de sujeto, ropa, exposición y pose.
- Detección de contenido sensual, sugestivo, explícito y sensible, incluyendo ilustraciones 2D/3D, anime, ecchi y hentai.
- Análisis de código de vestimenta, niveles de exposición, ropa interior, lencería, bañadores sugestivos y transparencias.
- Evaluación de poses y presentación visual, así como del contexto y entorno de la escena.
- Salida estructurada en JSON con claves fijas y restricciones de tipo (booleanos e enteros complementarios).
- Soporte de decodificación especulativa mediante tensores MTP.
- Procesamiento multimodal image-text-to-text a través de `AutoProcessor` y `Qwen3_5ForConditionalGeneration`.
- Modo de razonamiento opcional (thinking on/off) según la plantilla usada.
- Capacidad conversacional básica heredada del modelo base, aunque el ajuste está orientado a clasificación.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Moderación de contenido en plataformas UGC: el modelo recibe cada imagen subida y devuelve un JSON con `is_nsfw`, `nsfw` y `safe`, que el backend puede usar para bloquear, marcar para revisión humana o publicar automáticamente según la política interna.
- Control parental en aplicaciones infantiles: integrado como guardrail previo a la renderización de imágenes, con umbral estricto y clasificación conservadora adecuada para entornos con menores.
- Filtrado previo en datasets de entrenamiento: procesamiento por lotes de corpus de imágenes para eliminar muestras NSFW antes de usarlas en el entrenamiento de modelos generativos o de visión.
- Revisión de contenido en redes sociales y foros: clasificación automática de imágenes reportadas por usuarios, usando `classification_reason` para priorizar la cola de revisión humana.
- Cumplimiento y auditoría de catálogos: análisis de imágenes de producto o anuncios para detectar contenido sugestivo o no conforme con políticas de publicidad, aprovechando el análisis de ropa y exposición.
- Pre-filtro en pipelines de generación de imágenes: comprobación de salidas de modelos text-to-image antes de mostrarlas al usuario, con la ventaja de que un modelo de 4B cabe en GPU de consumo.
- Investigación en seguridad multimodal: uso como baseline reproducible con licencia Apache 2.0 para experimentos de clasificación NSFW y evaluación de guardrails.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los ~4,66 B de parámetros ocupan aproximadamente 9,3 GB solo en pesos, por lo que se recomiendan 12-16 GB de VRAM considerando activaciones y el codificador visual. En cuantización de 8 bits cabría en torno a 5-6 GB y en 4 bits alrededor de 3-4 GB, aunque los tipos de cuantización concretos no están documentados.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 4080 o RTX 3090 para inferencia local en bf16.
- GPU de consumo: sí cabe en GPUs consumer de gama alta (RTX 4090/3090 con 24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza, si bien el autor no publica artefactos GGUF verificados en la información disponible.
- Opciones de despliegue: transformers con `device_map="auto"` y `dtype="auto"`; se recomienda Flash Attention 2 para eficiencia de memoria en escenarios multi-imagen. La model card menciona flujos GGUF y compatibilidad con text-generation-inference y endpoints, pero no detalla comandos ni recetas de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP puede reducir la latencia de generación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-mini | ~4,66 B | No disponible | Clasificación Safe/NSFW multimodal | Apache 2.0 | Hugging Face (prithivMLmods) |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | Modelo multimodal generalista | No disponible en la información | Hugging Face (Qwen) |
| Alternativas de clasificación NSFW de propósito específico | No disponible | No disponible | Clasificadores visuales dedicados | No disponible | No disponible en la información |

La información proporcionada no incluye resultados de benchmarks ni especificaciones de modelos competidores, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparación más directa disponible es con el modelo base Qwen/Qwen3.5-4B, del que VIGOR-mini hereda arquitectura y capacidades generales, especializándose mediante ajuste fino en clasificación de seguridad.

## Limitaciones y advertencias

- Modelo etiquetado explícitamente como experimental por el autor: las predicciones no deben tratarse como juicios definitivos y requieren revisión antes de usarse en flujos críticos de moderación o control parental.
- Riesgo de falsos positivos por el umbral conservador ("ante la duda, NSFW"), que puede clasificar como inseguras imágenes legítimas de playa, arte, lactancia o contenido médico.
- Riesgo de falsos negativos en contenido sutil o generado adversarialmente, así como en dominios visuales poco representados en el ajuste fino.
- Sesgos potenciales derivados de los datos de ajuste fino y del modelo base, no documentados en la información disponible.
- Riesgo de alucinación en el campo `scene_description`, que puede describir elementos no presentes en la imagen.
- Soporte idiomático limitado al inglés; las instrucciones y salidas en otros idiomas no están garantizadas.
- Longitud de contexto no documentada, lo que dificulta planificar escenarios con muchas imágenes o prompts largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de benchmarks y de documentación sobre el dataset de entrenamiento limita la evaluación de riesgos para producción.
- No se documentan salvaguardas adicionales ni filtros de salida más allá del formato JSON esperado; la validación del JSON debe hacerse en el cliente.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/VIGOR-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/prithivMLmods
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/tvF1AcUq4ldMWqDxA4NHS.png
