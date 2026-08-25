# joshuapenman/semantic-overlays-adapters

## Resumen

Semantic Overlays es un conjunto de adaptadores entrenados (checkpoints) que implementan la técnica descrita en el artículo *Semantic Overlays: Mitigating Prompt Injection with Annotations Beyond Tokens and Steering Vectors*. El autor, Joshua Penman, publica estos pesos bajo licencia MIT para que cualquier sistema pueda aplicar overlays semánticos sobre un modelo base congelado y mitigar ataques de inyección de prompts mediante anotaciones que van más allá de los tokens y los vectores de steering.

La idea central es que en lugar de modificar el modelo base (que permanece intacto), se aplican pequeñas capas de adaptadores SwiGLU por capa sobre el flujo residual del modelo en posiciones marcadas del prefill. El modelo base no se distribuye aquí; los adaptadores se cargan junto a él en tiempo de inferencia. El repositorio incluye varios conjuntos: un overlay de "no ejecutar" para Qwen3.5-9B, una réplica para Llama-3.1-8B-Instruct, un conjunto de marcas visuales (3 tipos × 4 colores) condicionadas por embeddings, un conjunto de cuatro lenguajes de programación (Python, JavaScript, Ruby, C) y otro de doce instrucciones llevadas (formatos, idiomas, comportamientos).

La relevancia actual radica en que ofrece un mecanismo práctico y reproducible para blindar sistemas basados en LLM frente a inyecciones de prompts, un vector de ataque crítico en aplicaciones de agentes y herramientas conectadas. Los adaptadores se sirven mediante un plugin de vLLM incluido en el repositorio complementario, lo que permite desplegarlos en producción sin necesidad de entrenar nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores SwiGLU por capa sobre el flujo residual de un modelo base congelado (no es un modelo generativo independiente) |
| Parametros totales | No disponible (el repositorio pesa 2,1 GB en total, incluye varios checkpoints; no se indica el peso individual de cada adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base usado: Qwen3.5-9B o Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en formato PyTorch `.pt`) |
| Idiomas soportados | Ingles (etiqueta `en` en la model card) |
| Licencia | MIT para los adaptadores; los modelos base tienen sus propias licencias (Apache 2.0 para Qwen3.5-9B, Llama 3.1 Community License para Llama-3.1-8B-Instruct) |
| Formato de pesos | PyTorch (`.pt`), con archivos `slim.pt` y `phrases.pt` para los conjuntos condicionados por embeddings |

## Arquitectura y entrenamiento

Los adaptadores se componen de capas SwiGLU (SwiGLU activations) aplicadas al flujo residual de un modelo base congelado, solo en las posiciones del prefill que han sido marcadas mediante un span mask. El modelo base no se modifica en absoluto; los adaptadores se superponen dinámicamente en función de la petición. Esto significa que una solicitud sin marcas reproduce exactamente el comportamiento del modelo base original.

El entrenamiento se realizó contra los modelos base congelados, utilizando un corpus específico para los overlays de "no ejecutar" denominado `semantic-overlays-injection`. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO. Los conjuntos condicionados por embeddings (qover, rosetta, behav) incluyen archivos `phrases.pt` que contienen los embeddings de congelación que se cargan junto a los pesos.

## Capacidades

- Mitigación de inyecciones de prompts: el overlay "do-not-execute" impide que un atacante consiga que el modelo ejecute instrucciones maliciosas incrustadas en el contexto.
- Control de comportamiento: el conjunto `behav` permite imponer formatos, idiomas o comportamientos específicos durante la generación, mediante doce instrucciones llevadas.
- Marcado visual: el conjunto `qover` añade marcas visuales (tres tipos × cuatro colores) que pueden utilizarse para señalar contenido de confianza o no confiable en el input.
- Anotación de lenguajes de programación: el conjunto `plr` identifica y etiqueta código en Python, JavaScript, Ruby y C, útil para tareas de análisis o transformación de código.
- Compatibilidad con vLLM: el repositorio complementario incluye un plugin de vLLM que permite servir estos adaptadores en producción sin entrenamiento adicional.
- Reproducción del modelo base: si no se marca ningún span, la salida es idéntica a la del modelo base sin adaptadores, lo que garantiza que no se degrada la capacidad general del modelo.

## Casos de uso

- Protección de agentes autónomos: en un agente que recibe herramientas y resultados de terceros, el overlay "do-not-execute" evita que instrucciones maliciosas incrustadas en esos resultados tomen control del agente, manteniendo la lógica original del modelo.
- Filtrado de contenido en chatbots de atención al cliente: el conjunto `behav` puede forzar que el asistente responda siempre en un formato determinado (JSON, XML) o en un idioma específico, incluso si el usuario intenta cambiar la política mediante inyección.
- Análisis de código con seguridad: el overlay `rotr` puede usarse para preprocesar código fuente y garantizar que el modelo solo interprete fragmentos marcados como código, evitando que texto de comentarios o cadenas se interpreten como instrucciones.
- Sistemas de moderación de contenido: las marcas visuales de `qover` permiten al modelo distinguir entre contenido de alta confianza (por ejemplo, respuestas de una base de datos) y contenido no verificado, reduciendo alucinaciones cuando se integra con fuentes externas.
- Evaluación de resistencia a inyecciones: los checkpoints pueden usarse como banco de pruebas para medir la robustez de un modelo base frente a ataques de prompt injection, comparando las respuestas con y sin overlay.
- Despliegue de asistente con control de formato: en aplicaciones de generación de informes, el overlay de instrucciones lleva garantiza que la salida se ajuste a una plantilla (formato, tono, idioma) sin necesidad de modificar el modelo base ni retocar el prompt en cada llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, tasa de éxito de mitigación de inyección, ni comparaciones con otras técnicas. El artículo original puede contener evaluaciones, pero no se han proporcionado en el material consultado.

## Requisitos de hardware

- Los adaptadores son ligeros (peso total del repositorio 2,1 GB, pero incluye varios checkpoints), por lo que el requisito principal de VRAM es el del modelo base (Qwen3.5-9B o Llama-3.1-8B-Instruct).
- Para Qwen3.5-9B en FP16 se estima alrededor de 18-20 GB de VRAM; con cuantización 4 bits (si se aplica al modelo base) puede caber en GPUs consumer de 12 GB como la RTX 4070 Ti o 3080.
- Para Llama-3.1-8B-Instruct, los requisitos son similares (16-18 GB en FP16, ~6-8 GB en 4 bits).
- El despliegue se realiza mediante vLLM con un plugin específico (`infra/goggled_vllm.py`). También es posible usar otros frameworks de inferencia que soporten adaptadores, aunque no se especifican.
- No se disponen de datos de latencia ni throughput, pero al añadir adaptadores sobre un modelo base, el impacto esperado es pequeño porque solo se activan en posiciones marcadas del prefill.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. La técnica de overlays semánticos es una propuesta nueva; otros métodos de mitigación de inyección de prompts (como filtros de entrada, sistemas de saneamiento o prompts de defensa) no son directamente comparables porque no utilizan adaptadores entrenados sobre un modelo base. No se ha publicado una comparación con alternativas como "prompt guard", "LLM Guard" o "rebuff" en el material disponible.

## Limitaciones y advertencias

- Los adaptadores solo funcionan con los modelos base específicos para los que fueron entrenados (Qwen3.5-9B y Llama-3.1-8B-Instruct). No son portables a otros modelos sin reentrenamiento.
- El modelo base no se distribuye en este repositorio; el usuario debe obtenerlo por su cuenta y respetar su licencia (Apache 2.0 para Qwen, Llama 3.1 Community License para Llama). La licencia Llama impone restricciones de uso comercial que deben revisarse.
- El conjunto de idiomas es solo inglés; no se garantiza un comportamiento correcto en otros idiomas.
- La mitigación de inyección no es absoluta: aunque el overlay reduce el riesgo, un atacante podría encontrar formas de evadir la marca del span o de manipular el contexto fuera de las zonas marcadas.
- No se han publicado evaluaciones independientes de robustez frente a ataques adversariales específicos; la eficacia se basa en el artículo académico, que no se ha facilitado.
- El tamaño del repositorio (2,1 GB) incluye varios checkpoints; cada uno debe cargarse por separado. No se indica el número exacto de parámetros por adaptador, lo que dificulta estimar el coste de memoria adicional.

## Enlaces

- Repositorio de Hugging Face: [joshuapenman/semantic-overlays-adapters](https://huggingface.co/joshuapenman/semantic-overlays-adapters)
- Perfil del autor en Hugging Face: [joshuapenman](https://huggingface.co/joshuapenman/spaces)
- Repositorio de GitHub mencionado en la model card: `semantic-overlays` (no se ha encontrado la URL directa en la búsqueda web)
- Model card oficial: [https://huggingface.co/joshuapenman/semantic-overlays-adapters](https://huggingface.co/joshuapenman/semantic-overlays-adapters) (la propia ficha)
