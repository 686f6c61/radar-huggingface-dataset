# nielsr/qwen35-4b-url-agent-oc2-sft-merged

## Resumen

Qwen3.5-4B URL extraction agent es un checkpoint fusionado (merged) publicado por el usuario nielsr en Hugging Face, derivado de un ajuste fino con LoRA sobre el modelo base Qwen/Qwen3.5-4B. El modelo está especializado en la extracción de URLs dentro de un arnés de agente denominado OpenCode, y se distribuye como un repositorio autónomo listo para cargar con transformers, sin necesidad de aplicar el adaptador LoRA por separado.

El interés de esta ficha es doble: por un lado, documenta un ejemplo concreto de ajuste fino orientado a agentes sobre una familia de modelos de 4B parámetros; por otro lado, sirve como referencia de las limitaciones de los checkpoints publicados con documentación mínima. La model card original es muy escueta y no incluye datos sobre licencia, idiomas, composición del dataset de entrenamiento ni resultados de evaluación más allá de una referencia genérica a una comparación base-versus-adaptador en el repositorio de origen.

El modelo cuenta con 4.539.265.536 parámetros reales según los tensores en safetensors, un tamaño de repositorio de 9,1 GB y etiquetas que indican soporte de image-text-to-text además de text-generation, lo que sugiere que el modelo base Qwen3.5-4B es multimodal. No obstante, la especialización declarada es la extracción de URLs en un contexto de agente con herramientas de shell y web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atención no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | LoRA fusionado (merged) sobre el base |
| Tamano del repositorio | 9,1 GB |
| Pipeline declarado | text-generation |
| Tags adicionales | image-text-to-text, peft, merged, endpoints_compatible |

## Arquitectura y entrenamiento

El checkpoint es el resultado de fusionar un adaptador LoRA (nielsr/qwen35-4b-url-agent-oc2-lora) en los pesos del modelo base Qwen/Qwen3.5-4B. La arquitectura subyacente corresponde a la familia Qwen3.5, de la que no se detallan en la información disponible el número de capas, el tipo de atención ni la ventana de contexto. El tag image-text-to-text sugiere que el base incorpora un codificador visual, aunque la especialización del ajuste fino es textual y orientada a agentes.

El entrenamiento se realizó, según la model card, sobre "verified OpenCode URL-extraction traces", es decir, trazas verificadas de extracción de URLs generadas en el arnés OpenCode. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni hiperparámetros del ajuste LoRA. Tampoco se documenta si hubo entrenamiento multimodal o si el ajuste se limitó a la torre de texto.

## Capacidades

- Generación de texto conversacional en formato chat, según el pipeline declarado.
- Extracción de URLs dentro de flujos de agente, que es la tarea para la que fue ajustado.
- Uso de herramientas de shell y web en el arnés OpenCode: Bash, Read, Grep, Glob y WebFetch.
- Soporte de salida estructurada (structured-output tools) según la model card.
- Capacidad multimodal heredada del base (tag image-text-to-text), aunque no se documenta su preservación tras el ajuste.
- Razonamiento multi-paso orientado a agentes, implícito en el uso de herramientas encadenadas.
- Soporte multilingüe: no disponible.

## Casos de uso

- Extracción de URLs en pipelines de scraping: el modelo puede recibir el resultado de una llamada WebFetch y devolver las URLs relevantes en formato estructurado, integrándose en un agente que decide qué enlaces visitar a continuación.
- Automatización de tareas de investigación web: dentro de OpenCode, el agente puede encadenar Grep y Read sobre ficheros locales para localizar referencias y luego resolverlas con WebFetch, usando el modelo como cerebro de decisión.
- Enriquecimiento de datasets: dado un conjunto de páginas o documentos, el modelo extrae los enlaces salientes y los normaliza, lo que resulta útil para construir grafos de enlaces o corpus de crawling.
- Agente de soporte a la navegación interna: en una herramienta CLI que asiste a desarrolladores, el modelo puede identificar qué URL de documentación consultar a partir de una consulta en lenguaje natural.
- Evaluación de arneses de agentes: al ser un checkpoint fusionado y autónomo, sirve como referencia reproducible para comparar el comportamiento base frente al ajustado en tareas de extracción.
- Prototipado de asistentes con tool calling: el modelo puede integrarse en un bucle de agente con salida estructurada para validar diseños de prompts y esquemas de herramientas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una comparación base-versus-adaptador en el repositorio de origen (nielsr/qwen35-4b-url-agent-oc2-lora), pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5 a 3 GB de pesos.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para despliegues con concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con holgura; en RTX 3090 (24 GB) igualmente; en GPUs de 12 GB como RTX 3060 o 4070 requiere cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir en producción; llama.cpp u Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nielsr/qwen35-4b-url-agent-oc2-sft-merged | 4,54 B | no disponible | no disponible | Ajuste fino para agente de extracción de URLs |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en esta ficha | Modelo generalista multimodal |
| nielsr/qwen35-4b-url-agent-oc2-lora | ~4 B + adaptador | no disponible | no disponible | Adaptador LoRA del que deriva este checkpoint |

La comparación con alternativas de la misma categoría (agentes de extracción de URLs de 3-8B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta licencia, idiomas, contexto ni dataset, lo que impide evaluar su idoneidad para uso comercial sin consultar el modelo base.
- El ajuste está diseñado para ejecutarse dentro del arnés OpenCode con un conjunto concreto de herramientas; fuera de ese entorno el rendimiento puede degradarse notablemente.
- Riesgo de alucinación de URLs: al ser un modelo pequeño especializado, puede generar enlaces plausibles pero inexistentes si no se valida la salida.
- No se documenta la preservación de capacidades multimodales tras la fusión del LoRA, a pesar del tag image-text-to-text.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- Al ser un checkpoint fusionado, no permite desactivar el adaptador sin volver al modelo base original.
- Verificar la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue comercial, ya que la del checkpoint derivado no está declarada.

## Enlaces

- Hugging Face: https://huggingface.co/nielsr/qwen35-4b-url-agent-oc2-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-4b-url-agent-oc2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
