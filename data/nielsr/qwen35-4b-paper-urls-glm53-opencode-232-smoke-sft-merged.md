# nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged

## Resumen

Este repositorio contiene el modelo Qwen3.5-4B de Qwen fusionado con el adaptador LoRA `qwen35-4b-paper-urls-glm53-opencode-232-smoke-lora`, publicado por el usuario nielsr en Hugging Face. Se trata de un ajuste fino derivado de la ejecución de destilación de agente denominada `qwen35-4b-paper-urls-glm53-opencode-232-smoke`, orientada a la tarea `paper-urls` y generada con la herramienta opencode en su versión 2.3.2. El resultado es un checkpoint fusionado (merged) que conserva la arquitectura y el tamaño del modelo base, con 4.539.265.536 parámetros totales según los pesos en safetensors.

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.500 millones de parámetros aproximadamente, e incorpora los pesos del adaptador PEFT ya integrados, de modo que puede cargarse directamente con la librería transformers sin necesidad de aplicar el LoRA por separado. La etiqueta `agent-distill` indica que el ajuste se ha realizado mediante destilación de trayectorias de agente, un enfoque habitual para transferir capacidades de tool calling y razonamiento multi-paso desde un modelo profesor hacia uno más pequeño.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste fino de agente sobre una base Qwen3.5-4B, con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin idiomas especificados. Es útil como referencia para quienes sigan las técnicas de destilación de agentes sobre modelos de 4B, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), derivado de Qwen/Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base, un transformer denso de aproximadamente 4.500 millones de parámetros. Sobre esa base se aplicó un adaptador LoRA mediante PEFT, entrenado en la ejecución de destilación de agente `qwen35-4b-paper-urls-glm53-opencode-232-smoke` con la herramienta opencode 2.3.2 y la tarea `paper-urls`. Posteriormente, los pesos del adaptador se fusionaron con los del modelo base, dando lugar a este checkpoint merged que no requiere cargar el LoRA de forma separada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF o DPO, ni sobre innovaciones técnicas específicas más allá de la propia destilación de agente. La etiqueta `agent-distill` sugiere que el entrenamiento se basó en trayectorias de agente generadas por un modelo profesor (probablemente GLM-5.3, a juzgar por el nombre de la ejecución), pero este extremo no está confirmado en la información proporcionada. Tampoco se detalla si se empleó decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Procesamiento image-text-to-text: la etiqueta `image-text-to-text` aparece en los tags, lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se detalla su alcance.
- Tool calling y function calling: la etiqueta `agent-distill` y el uso de opencode apuntan a un entrenamiento orientado a agentes con llamadas a herramientas, si bien no se especifica el formato exacto soportado.
- Razonamiento multi-paso: la naturaleza de destilación de agente implica trayectorias de varios pasos, pero no hay documentación que lo confirme.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (la etiqueta image-text-to-text sugiere entrada de imagen, sin más detalle).

## Casos de uso

- Investigación en destilación de agentes: el checkpoint sirve como referencia reproducible para estudiar cómo se comporta un Qwen3.5-4B tras fusionar un LoRA entrenado con trayectorias de agente en la tarea `paper-urls`.
- Extracción de URLs de artículos científicos: la tarea declarada (`paper-urls`) sugiere un uso directo en pipelines que localizan enlaces a papers dentro de documentos o páginas, aunque su rendimiento real no está medido.
- Prototipado de asistentes con tool calling: al estar entrenado con opencode 2.3.2, puede emplearse como base para experimentar con flujos de agente que invocan herramientas, siempre con validación propia.
- Evaluación comparativa de técnicas de fusión LoRA: útil para comparar el comportamiento del modelo fusionado frente al adaptador sin fusionar y frente al Qwen3.5-4B original.
- Generación de texto conversacional en entornos de laboratorio: con 4.500 millones de parámetros puede ejecutarse en una GPU de consumo para pruebas de conversación, sin garantías de calidad en producción.
- Experimentos multimodales exploratorios: la etiqueta image-text-to-text permite probar entradas de imagen y texto, aunque la ausencia de documentación exige verificar el comportamiento antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos, con un total práctico de 6 a 8 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5 a 3 GB de pesos, con un total práctico de 4 a 6 GB (las cuantizaciones no están publicadas por el autor y habría que generarlas).
- GPU recomendadas: A100 40 GB u H100 para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en fp16 con contexto moderado, y en GPUs de 8 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servir en fp16, llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged | 4.539 M | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint fusionado de un LoRA de destilación de agente |
| Qwen/Qwen3.5-4B | ~4.500 M | no disponible | no disponible | Hugging Face (modelo base) | Base sin ajuste de agente |
| nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-lora | ~4.500 M (base) + adaptador | no disponible | no disponible | Hugging Face | Adaptador LoRA sin fusionar, mismo entrenamiento |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin model card detallada: no hay información sobre datos de entrenamiento, composición del dataset ni metodología de evaluación.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor o consultar el modelo base Qwen3.5-4B para conocer las condiciones.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de alucinación: inherente a los modelos de 4B ajustados con destilación de agente; sin benchmarks no puede acotarse.
- Sesgos: no documentados; al desconocerse los datos de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas: no especificados; no debe asumirse un rendimiento multilingüe equilibrado.
- Contexto: la longitud de contexto no está declarada en esta ficha; debe consultarse la configuración del modelo base Qwen3.5-4B antes de usarlo con documentos largos.
- Uso en producción: no recomendado sin una evaluación propia de calidad, latencia y seguridad, dado el carácter experimental del checkpoint (nombre con sufijo `smoke`, típico de pruebas de humo).
- La etiqueta image-text-to-text sugiere multimodalidad, pero no hay documentación que confirme el soporte real de imágenes en este checkpoint fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-4b-paper-urls-glm53-opencode-232-smoke-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
