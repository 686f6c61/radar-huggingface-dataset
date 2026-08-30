# qtris123/am-qasper-p01-qwen3-4b-512

## Resumen

`qtris123/am-qasper-p01-qwen3-4b-512` es un cartucho de *attention matching* (AM) para el modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario qtris123. No se trata de un modelo de lenguaje independiente, sino de un componente auxiliar que actúa sobre la caché de claves y valores (KV cache) del modelo base, permitiendo inyectar conocimiento de un dominio específico sin necesidad de ajuste fino completo. En concreto, este cartucho ha sido compactado a partir de la fase 1 del dataset QASPER, que contiene 16 artículos científicos y 99 792 tokens de profesor, y utiliza 512 ranuras (slots) para almacenar la información.

La relevancia de este tipo de componentes radica en su enfoque de *continual learning*: en lugar de reentrenar o hacer *fine-tuning* del modelo completo, se comprime el conocimiento en una caché de atención que puede cargarse junto al modelo base. El autor indica que la pérdida de QA forzada por el profesor es de 4,075 nats (perplejidad 58,8), lo que sugiere que el cartucho captura patrones de razonamiento sobre documentos científicos. La licencia es Apache 2.0, lo que facilita su uso y modificación.

Este cartucho forma parte de una línea de investigación más amplia sobre *gated continual cartridges*, cuyo repositorio se enlaza en la model card. Su interés actual radica en la posibilidad de extender modelos existentes con conocimiento especializado de forma eficiente en términos de parámetros y computación, aunque su adopción en producción es todavía incipiente y requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cartucho de attention matching sobre Qwen3-4B-Instruct-2507 (no es un modelo completo) |
| Parametros totales | no disponible (el repo ocupa 0,2 GB, pero corresponde al cartucho, no al modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el repo contiene `cache_last.pt`, aparentemente en formato PyTorch nativo) |
| Idiomas soportados | no disponible (heredados del modelo base, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (fichero `cache_last.pt`, también referido como `cache-step0.pt`) |

## Arquitectura y entrenamiento

El cartucho implementa un mecanismo de *attention matching* sobre la caché de atención del modelo base. Según la model card, se utilizan 512 ranuras (slots) que almacenan pares clave-valor compactados, extraídos de las representaciones de un modelo profesor (presumiblemente Qwen3-4B-Instruct-2507) sobre el dataset QASPER. La configuración incluye `key_select: highest_attention`, lo que indica que las claves se seleccionan en función de los pesos de atención más altos, y `rebake_key_positions: true` con `rope_theta: 5e6`, es decir, se recalculan las posiciones de las claves usando la interpolación RoPE del modelo base. Además, `global_teacher_positions: true` sugiere que las posiciones del profesor se mantienen globales, y `enable_beta: false` desactiva un posible mecanismo de ponderación beta.

El entrenamiento se realizó en dos fases (fase 1, de la que deriva este cartucho), con 16 documentos de QASPER y 99 792 tokens de profesor. La pérdida de QA forzada por el profesor se reporta como 4,075 nats (perplejidad 58,8). No se menciona el uso de RLHF o DPO; el enfoque es puramente de compresión de caché. El autor hace referencia a una "receta arm D" de un barrido de RoPE en el repositorio [gated-continual-cartridges](https://github.com/faridlazuarda/gated-continual-cartridges), que probablemente contiene los detalles exactos del procedimiento.

## Capacidades

- Inyección de conocimiento específico de dominio (artículos científicos de QASPER) en el modelo base Qwen3-4B-Instruct-2507 mediante la caché de atención.
- Soporte de *attention matching* con 512 ranuras, lo que permite almacenar un volumen moderado de información comprimida.
- Compatible con el pipeline de transformers, ya que se carga como un fichero de pesos adicional (`cache_last.pt`).
- No se documentan capacidades de tool calling, agentes, visión o audio; estas dependen del modelo base y no del cartucho.
- La funcionalidad principal es la mejora de respuestas en tareas de QA sobre documentos científicos, aunque no se proporcionan ejemplos de uso práctico en la model card.

## Casos de uso

- **Investigación en procesamiento de lenguaje científico**: el cartucho puede utilizarse para responder preguntas sobre artículos de QASPER sin necesidad de *fine-tuning* completo, lo que resulta útil en entornos de investigación donde se quiere evaluar la compresión de conocimiento en cachés de atención.
- **Prototipado de *continual learning***: desarrolladores interesados en extender modelos con nuevos dominios pueden usar este cartucho como referencia para implementar su propia metodología de *attention matching*.
- **Evaluación de técnicas de compresión de KV cache**: sirve como caso de estudio para medir la degradación de rendimiento al compactar 99 792 tokens en solo 512 ranuras.
- **Experimentos de interpretabilidad**: al seleccionar las claves con mayor atención, el cartucho permite analizar qué información del documento original se conserva y cuál se descarta.
- **Bases para desarrollo de cartuchos propios**: el repositorio asociado documenta el proceso de creación, por lo que puede servir como plantilla para generar cartuchos sobre otros datasets o modelos.
- **Uso académico en cursos de arquitecturas eficientes**: su simplicidad (un único fichero de pesos) lo hace adecuado para demostrar conceptos de *retrieval* implícito dentro de la caché de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de QA forzada por el profesor (4,075 nats, perplejidad 58,8), que no es comparable directamente con benchmarks estándar como MMLU o HumanEval. No se dispone de comparaciones con otros modelos o cartuchos.

## Requisitos de hardware

- El tamaño del repositorio es de 0,2 GB, por lo que el cartucho en sí requiere muy poca memoria de almacenamiento.
- Para su uso en inferencia, se necesita cargar el modelo base Qwen3-4B-Instruct-2507, que requiere aproximadamente 8 GB de VRAM en FP16 (o menos con cuantización). El cartucho añade una sobrecarga mínima.
- Es factible ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o incluso en una RTX 3060 de 12 GB si el modelo base se cuantiza a 4 bits.
- Para despliegue en producción, se puede usar vLLM o TGI siempre que soporten la carga de pesos adicionales del cartucho; no se especifica compatibilidad explícita con estos frameworks.
- La latencia y el throughput no se han medido ni documentado en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros cartuchos de *attention matching* comparables en el momento de redactar esta ficha. El concepto de *gated continual cartridges* es emergente y no hay una base establecida de modelos equivalentes. Se podría comparar con técnicas de *fine-tuning* tradicional o con *LoRA*, pero no son directamente comparables en arquitectura ni en propósito. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El cartucho solo ha sido validado sobre 16 documentos de QASPER; su generalización a otros dominios o datasets es incierta.
- La pérdida de QA reportada (perplejidad 58,8) es alta en términos absolutos, lo que sugiere que la compresión a 512 ranuras conlleva una pérdida significativa de información.
- No se han documentado sesgos específicos, pero al estar entrenado sobre artículos científicos, podría heredar sesgos de ese corpus.
- Riesgo de alucinación: al ser un mecanismo de *retrieval* implícito, puede generar respuestas incorrectas si la información relevante no está en las ranuras.
- No se indica si el cartucho es compatible con todas las versiones de Qwen3-4B-Instruct-2507 o solo con una variante concreta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License), que debe verificarse antes de un despliegue comercial.
- El formato de pesos (`cache_last.pt`) puede no ser directamente cargable con bibliotecas estándar de inferencia; se requiere un código de integración específico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qtris123/am-qasper-p01-qwen3-4b-512)
- [Repositorio gated-continual-cartridges](https://github.com/faridlazuarda/gated-continual-cartridges)
- [Modelo base Qwen3-4B-Instruct-2507 (referencia)](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
