# agentic-ptb/opus-high-v3.h045.soup-v5

## Resumen

El modelo `agentic-ptb/opus-high-v3.h045.soup-v5` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el proyecto AgentPTB. Se trata de un artefacto de un experimento de entrenamiento agéntico (run `opus-high-v3`, hora `h045`) en el que se utilizó un agente basado en Claude Opus para orquestar procesos de fine-tuning. Según la model card, el run no produjo ninguna mejora en los pesos entrenados; el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), este modelo no aporta capacidades nuevas respecto a su base, y la propia publicación advierte explícitamente de que no debe inferirse calidad a partir de su existencia. Su relevancia radica en documentar resultados negativos en pipelines de entrenamiento agéntico, un área emergente en la investigación de IA. La licencia es Apache 2.0, lo que permite uso libre, pero su utilidad práctica es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base, sin especificar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Qwen3.5-9B-Base, un transformer denso de 9,4 mil millones de parámetros. El proceso de entrenamiento corresponde al run `opus-high-v3` del proyecto AgentPTB, que emplea agentes de Claude Opus para diseñar y ejecutar experimentos de fine-tuning de forma autónoma. El checkpoint `h045.soup-v5` es un punto intermedio del run, con provenance `scratch/agent/soup-v5`, y se almacena en el dataset `agentic-ptb/opus-high-v3-data`.

La model card indica que el run no encontró ninguna mejora en los pesos entrenados: se trata de un resultado negativo. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni técnicas como RLHF o DPO. El repositorio pesa 18,8 GB, consistente con pesos en precisión fp16 o bf16. No hay innovaciones técnicas documentadas más allá del propio pipeline agéntico, que no logró superar al modelo base.

## Capacidades

- Al ser un checkpoint sin mejora de pesos, sus capacidades son las del modelo base Qwen3.5-9B-Base: generación de texto, razonamiento, comprensión de lenguaje y posiblemente código y matemáticas, aunque no se garantiza ninguna de ellas en este checkpoint concreto.
- No se documenta soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento explícito.
- No se especifican idiomas soportados; el modelo base Qwen suele cubrir múltiples lenguas, pero este checkpoint no aporta información al respecto.
- La advertencia del autor es clara: no debe inferirse calidad de la publicación; el modelo no añade ninguna capacidad específica documentada.

## Casos de uso

- Reproducibilidad de experimentos: investigadores pueden descargar este checkpoint para replicar el run `opus-high-v3` y verificar los resultados negativos reportados, comparando los tensores con los del modelo base.
- Estudio de fallos en entrenamiento agéntico: sirve como caso de estudio para analizar por qué el pipeline no logró mejorar los pesos, ayudando a depurar metodologías de autoentrenamiento con agentes.
- Análisis de deriva de pesos: al ser un checkpoint intermedio, permite estudiar la evolución de los parámetros a lo largo del run y detectar posibles problemas de convergencia o degradación.
- Comparación de arquitecturas de orquestación: puede usarse como referencia para evaluar si otros enfoques de entrenamiento agéntico superan a este run.
- Validación de herramientas de evaluación: dado que no hay mejora, sirve para probar que los benchmarks son sensibles a cambios reales y no a ruido.
- Formación en buenas prácticas de publicación: ilustra cómo documentar resultados negativos de forma transparente, con metadatos y archivos de datos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación, y los resultados de búsqueda web no aportan datos adicionales. Dado que el run no encontró mejora, es probable que el rendimiento sea equivalente al del modelo base, pero no hay evidencia publicada.

## Requisitos de hardware

- El tamaño del repositorio (18,8 GB) sugiere pesos en fp16 o bf16, lo que implica aproximadamente 18,8 GB de VRAM para inferencia en esa precisión.
- Con cuantización int8, la VRAM necesaria se reduciría a unos 9,4 GB; con int4, a unos 5 GB, aunque no se proporcionan archivos cuantizados oficiales.
- En una GPU consumer como RTX 3090 o RTX 4090 (24 GB VRAM) cabría el modelo en fp16; GPUs con 16 GB (RTX 4080, RTX 4070 Ti) requerirían cuantización int8.
- Para despliegue, al ser un checkpoint de safetensors, podría cargarse con bibliotecas como Transformers, vLLM o llama.cpp tras conversión a GGUF, pero no se ofrecen instrucciones ni soporte oficial.
- No se dispone de datos de latencia o throughput; al ser un modelo de 9,4B, en una A100 se esperarían decenas de tokens por segundo, pero sin mediciones no se puede afirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h045.soup-v5 | 9,4B | no disponible | Apache 2.0 | Checkpoint sin mejora |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base oficial |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Modelo comercial de referencia |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | Modelo abierto popular |

No se dispone de datos de rendimiento comparativo; la única comparación válida es con su modelo base, del que no se ha demostrado ninguna mejora. Los otros modelos se listan como referencia de tamaño, pero no hay benchmarks que los relacionen.

## Limitaciones y advertencias

- Es un checkpoint intermedio sin mejora de pesos; el propio autor advierte que no debe inferirse calidad de su publicación.
- No es adecuado para uso en producción: no hay garantías de rendimiento, coherencia o seguridad.
- No se documentan sesgos específicos, pero hereda los posibles sesgos del modelo base Qwen3.5-9B-Base.
- Riesgo de alucinación similar al de cualquier modelo de 9B sin fine-tuning adicional, aunque no hay mediciones.
- Longitud de contexto no especificada; podría no soportar ventanas largas si el run no lo configuró.
- No hay soporte oficial de la comunidad ni mantenimiento; el repositorio tiene 0 descargas y 0 likes.
- La licencia Apache 2.0 permite uso comercial, pero la falta de utilidad práctica hace irrelevante esa ventaja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h045.soup-v5
- Dataset del run (archivo de datos): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Dataset índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
