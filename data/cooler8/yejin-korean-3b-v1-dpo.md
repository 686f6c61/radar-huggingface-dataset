# cooler8/yejin-korean-3b-v1-dpo

## Resumen

`yejin-korean-3b-v1-dpo` es un modelo de lenguaje fundacional entrenado desde cero (from-scratch) sobre un corpus coreano de alta calidad, desarrollado por el usuario `cooler8`. El modelo sigue la arquitectura de Llama 3.2 3B, con 2.910.916.608 parámetros (aproximadamente 2,9 mil millones) y una ventana de contexto de 4.096 tokens. Su pipeline de entrenamiento incluye pre-entrenamiento, ajuste supervisado (SFT) y optimización mediante preferencias directas (DPO), lo que lo orienta a tareas de generación de texto y conversación en coreano.

La relevancia de este modelo radica en que es un modelo fundacional específico para el idioma coreano, entrenado desde cero en lugar de ser un ajuste fino de un modelo multilingüe. Esto puede ofrecer un mejor rendimiento en tareas coreanas, aunque no se han publicado benchmarks que lo confirmen. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño moderado (3B) lo hace viable para despliegue en GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B (hidden=3072, layers=28, heads=24, kv_heads=8, GQA 3:1) |
| Parametros totales | 2.910.916.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 según ejemplo) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer decoder-only basada en el diseño de Llama 3.2 3B, con 28 capas, 24 cabezas de atención, 8 cabezas de clave/valor y atención con consulta agrupada (GQA) en proporción 3:1. El tokenizador es `EleutherAI/polyglot-ko-1.3b`, con un vocabulario de 30.003 tokens, específicamente diseñado para el coreano.

El entrenamiento se realizó en tres fases: pre-entrenamiento desde cero sobre un corpus coreano de alta calidad, seguido de ajuste supervisado (SFT) y finalmente optimización mediante DPO (Direct Preference Optimization). El entrenamiento se llevó a cabo en un entorno con 8 GPUs NVIDIA H200, lo que sugiere un uso intensivo de recursos. No se especifican detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto en coreano: el modelo es capaz de producir texto coherente y contextualmente relevante en coreano, como se muestra en el ejemplo de la model card.
- Razonamiento y completado de texto: al ser un modelo causal LM, puede completar frases, responder preguntas y mantener conversaciones multi-turno dentro de su ventana de contexto.
- Soporte de instrucciones: gracias a la fase de SFT y DPO, el modelo está optimizado para seguir instrucciones y preferencias humanas, aunque no se especifican detalles sobre tool calling o agentes.
- Multilingüismo: no disponible; el modelo está entrenado exclusivamente en coreano y no se mencionan capacidades en otros idiomas.
- Capacidades especiales: no se indican funciones como visión, audio o modo de razonamiento explícito.

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo puede gestionar conversaciones de soporte con clientes coreanos, manteniendo el contexto durante varios turnos gracias a su ventana de 4.096 tokens. Su entrenamiento con DPO ayuda a generar respuestas más alineadas con las preferencias humanas.
- Generación de contenido editorial en coreano: redacción de artículos, resúmenes o publicaciones para blogs y redes sociales en coreano, aprovechando su capacidad de generar texto fluido y contextualizado.
- Asistente de escritura para estudiantes y profesionales: completar frases, sugerir redacciones o corregir estilo en coreano, integrable en editores de texto o aplicaciones educativas.
- Chatbot de dominio específico: construcción de asistentes virtuales para sectores como turismo, banca o comercio electrónico en Corea, con respuestas adaptadas al idioma y cultura local.
- Traducción asistida coreano-coreano (paráfrasis): reformulación de textos o simplificación de lenguaje técnico, útil para documentación o comunicación interna.
- Prototipado rápido de aplicaciones de NLP en coreano: al ser un modelo de tamaño moderado, puede desplegarse en entornos de desarrollo para pruebas de concepto de generación de texto, análisis de sentimiento o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (2 bytes por parámetro), el modelo requiere aproximadamente 5,8 GB de VRAM solo para los pesos. Con overhead de activaciones y memoria intermedia, se recomienda al menos 8 GB de VRAM para inferencia en precisión completa.
- Cuantización: si se aplica cuantización de 4 bits (por ejemplo, con GPTQ o AWQ), la huella de memoria se reduce a aproximadamente 1,5 GB, permitiendo ejecución en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: para inferencia en bfloat16, una NVIDIA RTX 3060 (12 GB) o superior es suficiente. Para cuantización 4-bit, una RTX 4060 (8 GB) o incluso una GTX 1660 (6 GB) podrían funcionar.
- Opciones de despliegue: compatible con `transformers` (pipeline de Hugging Face), así como con motores de inferencia optimizados como vLLM, llama.cpp (con conversión a GGUF) y Ollama (si se convierte el modelo).
- Latencia y throughput: no se proporcionan datos específicos. En una GPU consumer moderna (RTX 4090), se espera una generación de decenas de tokens por segundo para un modelo de 3B, pero esto depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado alternativas específicas de la misma categoría (modelos coreanos de ~3B) con datos de rendimiento o especificaciones detalladas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos culturales y lingüísticos: al estar entrenado exclusivamente con corpus coreano, el modelo puede reflejar sesgos propios de la cultura y sociedad coreanas, y no es adecuado para tareas en otros idiomas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas de actualidad o datos específicos. Se recomienda verificación humana en aplicaciones críticas.
- Contexto limitado: la ventana de 4.096 tokens es relativamente corta para tareas que requieren documentos largos o conversaciones extensas. Para contextos mayores, sería necesario recurrir a técnicas de ventana deslizante o modelos con mayor contexto.
- Sin soporte multilingüe: el modelo solo funciona en coreano; cualquier entrada en otro idioma producirá resultados incoherentes o en coreano.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se ofrece garantía. No hay restricciones de uso militar o de alto riesgo, pero se recomienda revisar los términos completos.
- Producción: al ser un modelo relativamente pequeño, su rendimiento en tareas complejas de razonamiento o matemáticas puede ser inferior al de modelos más grandes. No se han publicado evaluaciones de robustez o seguridad.

## Enlaces

- [HuggingFace - cooler8/yejin-korean-3b-v1-dpo](https://huggingface.co/cooler8/yejin-korean-3b-v1-dpo)
- [HuggingFace - cooler8/yejin-korean-1b-v8 (modelo relacionado)](https://huggingface.co/cooler8/yejin-korean-1b-v8/tree/main)
- [HuggingFace - cooler8/yejin-korean-1b-v8-sft (modelo relacionado)](https://huggingface.co/cooler8/yejin-korean-1b-v8-sft)
