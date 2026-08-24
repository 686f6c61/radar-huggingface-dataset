# dwyschka/gemma-4-e2b-it-oQ4e-fp16-mtp

## Resumen

Este repositorio contiene una cuantización mixta de precisión del modelo Gemma 4 E2B, realizada con la herramienta oQ (oMLX v0.6.2). El autor, dwyschka, ha aplicado una cuantización de 4 bits con group size 64, manteniendo parte de los pesos en fp16 (como indica el sufijo "fp16-mtp"). El resultado es un modelo en formato MLX safetensors, pensado para su uso en entornos Apple Silicon mediante MLX, aunque también puede ejecutarse en otros backends que soporten este formato.

Gemma 4 es la cuarta generación de la familia de modelos abiertos de Google DeepMind, que incluye arquitecturas densas y de mezcla de expertos (MoE), con tamaños que van desde 2.3B hasta 31B parámetros. Según la documentación oficial, estos modelos son nativamente multimodales (visión y audio), soportan más de 140 idiomas y una ventana de contexto de hasta 256K tokens. Esta cuantización concreta reduce el tamaño del modelo para facilitar su despliegue en dispositivos con recursos limitados, aunque el número de parámetros reportado en los safetensors es de 1.227.961.923, lo que sugiere que podría tratarse de una variante más pequeña que el E2B estándar (2.3B) o que la cuantización ha eliminado algunos pesos redundantes.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de generación de texto, razonamiento y codificación en hardware modesto, manteniendo un equilibrio entre rendimiento y eficiencia. Sin embargo, al ser una cuantización de un modelo base, es importante verificar su comportamiento en tareas específicas antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (familia), no se especifica si es densa o MoE |
| Parametros totales | 1.227.961.923 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Gemma 4 soporta hasta 256K tokens) |
| Tipos de cuantizacion | oQ 4 bits, group size 64, con pesos mixtos fp16 |
| Idiomas soportados | no disponible (el modelo base Gemma 4 soporta más de 140 idiomas) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base ni sobre su entrenamiento. Según la documentación pública de Gemma 4, la familia incluye tanto arquitecturas densas como MoE, con un diseño unificado sin encoder para el procesamiento multimodal. El modelo base E2B está orientado a dispositivos edge y móviles, con un tamaño aproximado de 2.3B parámetros según el informe técnico, aunque el número de parámetros en este repositorio es menor (1.2B), lo que podría indicar una poda o una variante específica.

La cuantización aplicada utiliza la herramienta oQ de oMLX, que realiza una cuantización mixta de precisión: parte de los pesos se mantienen en fp16 y el resto se cuantizan a 4 bits con group size 64. Esta técnica busca preservar la calidad en capas sensibles mientras reduce el tamaño total del modelo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto: el modelo base Gemma 4 es capaz de producir texto coherente y contextualmente relevante en múltiples idiomas.
- Razonamiento: los modelos Gemma 4 están diseñados para tareas de razonamiento lógico y matemático, aunque esta cuantización puede degradar ligeramente el rendimiento.
- Codificación: soporta generación y comprensión de código en varios lenguajes de programación.
- Multimodalidad: el modelo base es nativamente multimodal (visión y audio), pero no se confirma si esta cuantización conserva dichas capacidades.
- Tool calling y agentes: según la documentación de Gemma 4, los modelos soportan flujos de trabajo agénticos y llamadas a herramientas, pero no hay evidencia específica para esta versión cuantizada.
- Multilingüismo: el modelo base cubre más de 140 idiomas, aunque la cuantización podría afectar a lenguas con menos representación.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: al ser un modelo pequeño y cuantizado, puede integrarse en aplicaciones de chat locales sin depender de la nube, ofreciendo respuestas rápidas y privadas.
- Generación de texto en tiempo real para aplicaciones de productividad: redacción de correos, resúmenes o borradores directamente en el dispositivo, con baja latencia.
- Autocompletado de código en editores ligeros: su capacidad para generar código lo hace útil como asistente de programación en entornos con recursos limitados.
- Procesamiento de lenguaje natural en entornos edge: análisis de sentimiento, clasificación de texto o extracción de entidades en dispositivos IoT o sistemas embebidos.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden usar este modelo para validar ideas antes de escalar a modelos más grandes.
- Educación y aprendizaje: generación de explicaciones, ejercicios o material didáctico personalizado en dispositivos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 4.8 GB, lo que sugiere que la cuantización mixta mantiene una parte significativa de los pesos en fp16. La VRAM necesaria dependerá de la carga del modelo en memoria.
- Para un modelo de ~1.2B parámetros con cuantización mixta, se estima un consumo de memoria entre 2 y 5 GB, dependiendo de la proporción de pesos en fp16.
- Es adecuado para GPUs de consumo como la NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, así como para Apple Silicon con al menos 8 GB de RAM unificada.
- En CPU, podría ejecutarse con lentitud, pero es viable para tareas de baja frecuencia.
- Opciones de despliegue: al estar en formato MLX, se puede usar con la librería MLX en macOS. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona dicha conversión.
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. El modelo base Gemma 4 E2B compite con otros modelos pequeños como Phi-3-mini (3.8B) o Qwen2.5-1.5B, pero no hay datos de rendimiento de esta cuantización concreta. Se recomienda consultar los benchmarks oficiales de Gemma 4 para una referencia general.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o las obligaciones de atribución. Se debe contactar con el autor o consultar la licencia del modelo base Gemma 4 antes de cualquier uso en producción.
- Al ser una cuantización de 4 bits, es probable que se produzca una degradación en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- No se confirma si las capacidades multimodales del modelo base se conservan en esta versión cuantizada.
- El número de parámetros reportado (1.2B) difiere del tamaño esperado para Gemma 4 E2B (2.3B), lo que podría indicar una poda o una variante no estándar. Se recomienda verificar el comportamiento real del modelo.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que su rendimiento relativo es desconocido.
- Al estar diseñado para MLX, su uso fuera del ecosistema Apple puede requerir conversiones adicionales que podrían afectar a la fidelidad de la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dwyschka/gemma-4-e2b-it-oQ4e-fp16-mtp
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 para Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Informe técnico de Gemma 4 (arXiv): https://arxiv.org/html/2607.02770v1
- Repositorio de oMLX (herramienta de cuantización): https://github.com/jundot/omlx
