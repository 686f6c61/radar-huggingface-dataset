# kebium/prompt-guard-stage2

## Resumen

El modelo `kebium/prompt-guard-stage2` es un clasificador de texto basado en la arquitectura DeBERTa-v2, con 70,8 millones de parámetros y pesos en formato safetensors. Su pipeline es `text-classification`, lo que indica que está diseñado para tareas de clasificación de secuencias. Por el nombre y el contexto de los resultados de búsqueda, es plausible que se trate de un modelo orientado a la detección de inyección de prompts o jailbreaks en sistemas de IA, posiblemente como segunda etapa de un pipeline de defensa. Sin embargo, la model card no proporciona información verificable sobre su propósito exacto, datos de entrenamiento o rendimiento.

El modelo fue publicado en HuggingFace el 1 de septiembre de 2026 por el usuario `kebium`, con cero descargas y cero likes en el momento de la consulta. La licencia, los idiomas soportados y la mayoría de los detalles técnicos aparecen como "no disponible". Dada la escasez de información pública, esta ficha se basa únicamente en los datos disponibles en el repositorio y en las referencias indirectas a sistemas similares como Llama-Prompt-Guard-2 de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformers) |
| Parametros totales | 70.831.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de que utiliza DeBERTa-v2, un modelo transformer con atención desenredada (disentangled attention) que mejora la representación de relaciones entre tokens. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card es una plantilla genérica sin secciones completadas. No hay detalles sobre innovaciones técnicas específicas en este modelo concreto.

## Capacidades

- Clasificación de texto: el pipeline `text-classification` indica que el modelo asigna una o varias etiquetas a secuencias de entrada.
- Posible detección de inyección de prompts: por el nombre "prompt-guard" y la referencia a sistemas similares, es probable que esté entrenado para clasificar entradas como benignas o maliciosas (jailbreaks, inyecciones indirectas), pero esto no está confirmado en la documentación.
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

Dado que la información es limitada, los siguientes casos de uso son hipotéticos y se basan en la función presumible del modelo:

- Filtrado de entradas en aplicaciones de IA conversacional: integrar el modelo como paso previo a un LLM para bloquear intentos de jailbreak o inyección de prompts antes de que lleguen al modelo generativo.
- Auditoría de seguridad en pipelines de agentes: usar el clasificador para marcar mensajes sospechosos en sistemas multi-agente, reduciendo el riesgo de ejecución de instrucciones no autorizadas.
- Moderación de contenido en foros o APIs: clasificar entradas de usuarios para detectar patrones de manipulación o ataques de prompt injection en tiempo real.
- Evaluación de robustez de modelos propios: emplear el clasificador como herramienta de testeo para medir la resistencia de un LLM ante ataques conocidos.
- Monitorización de logs de interacción: analizar conversaciones almacenadas para identificar intentos de explotación y mejorar las políticas de seguridad.
- Protección de asistentes virtuales empresariales: desplegar el modelo en un proxy para filtrar comandos maliciosos antes de que alcancen sistemas internos.

Estos escenarios son especulativos y requieren validación con el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de clasificación como precisión, recall o F1. Tampoco se han comparado resultados con otros modelos de detección de prompts.

## Requisitos de hardware

- VRAM estimada: con 70,8 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 283 MB. En cuantización int8 podría reducirse a unos 71 MB, y en int4 a unos 36 MB. Cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, o incluso CPU para inferencia en lote.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, HuggingFace Inference Endpoints, o mediante `pipeline` de transformers. También es posible exportarlo a ONNX o TensorRT para optimización.
- Latencia y throughput: no se dispone de mediciones oficiales. Para un modelo de este tamaño, la inferencia en GPU suele ser de milisegundos por secuencia, pero depende del hardware y la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| kebium/prompt-guard-stage2 | 70,8 M | no disponible | no disponible | Clasificación de texto (presumible detección de prompts) |
| meta-llama/Llama-Prompt-Guard-2 | 161 M (aprox.) | 512 tokens | Llama 3 Community License | Detección de inyección de prompts y jailbreaks |
| seojoonkim/prompt-guard (GitHub) | no disponible | no disponible | no disponible | Sistema de defensa contra inyección de prompts con detección multilingüe |

La comparativa es limitada porque no hay datos públicos de rendimiento del modelo `kebium`. Llama-Prompt-Guard-2 de Meta es el referente más conocido en esta categoría, con una licencia permisiva para uso comercial y una ventana de contexto de 512 tokens. El modelo de `kebium` podría ser un intento de replicar o adaptar esa funcionalidad, pero no hay evidencia de ello.

## Limitaciones y advertencias

- Información insuficiente: la model card no especifica el propósito, los datos de entrenamiento, la licencia ni los idiomas. Esto impide evaluar su idoneidad para producción.
- Riesgo de alucinación en la interpretación: al no haber documentación, cualquier uso basado en suposiciones sobre su función puede llevar a resultados inesperados.
- Sesgos desconocidos: sin datos de entrenamiento, no es posible conocer sesgos potenciales en el comportamiento del clasificador.
- Licencia no disponible: no se puede determinar si es legal usarlo en proyectos comerciales o de código abierto.
- Sin benchmarks: no hay evidencia de su eficacia frente a ataques reales de inyección de prompts.
- Modelo sin adopción: cero descargas y cero likes sugieren que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/kebium/prompt-guard-stage2
- Repositorio de referencia (seojoonkim/prompt-guard): https://github.com/seojoonkim/prompt-guard
- Llama-Prompt-Guard-2 (Meta): https://github.com/meta-llama/PurpleLlama/tree/main/Llama-Prompt-Guard-2
- Referencia de modelos Prompt Guard: https://www.llmreference.com/model-family/prompt-guard
- Sitio comercial PromptGuard: https://www.promptguard.co/
- Documentación de DeepWiki sobre Prompt Guard: https://deepwiki.com/meta-llama/PurpleLlama/5.2-prompt-guard
