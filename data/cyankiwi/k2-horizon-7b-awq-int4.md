# cyankiwi/K2-Horizon-7B-AWQ-INT4

## Resumen

K2-Horizon-7B-AWQ-INT4 es una cuantización de 4 bits del modelo IFM/K2-Horizon-7B, publicada por el usuario cyankiwi (la propia model card de la cuantización se identifica como parte del catálogo de cuantizaciones AWQ de cyankiwi, versión 26.05.01). El modelo base es un transformer decoder-only denso, descrito por su autor como el miembro medio de la familia K2-Horizon, con una ventana de contexto nativa de 524.288 tokens (512K) y licencia Apache 2.0. Esta variante concreta aplica cuantización AWQ de 4 bits sobre los pesos, reduciendo el tamaño del repositorio a 8,12 GB y facilitando el despliegue en GPUs de gama consumer.

El problema que resuelve esta ficha es doble: por un lado, permite ejecutar un modelo de contexto muy largo en hardware asequible gracias a la cuantización INT4; por otro, el autor del modelo base publica de forma completamente abierta los datos de entrenamiento (IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data), la receta y el código de evaluación, lo que lo hace relevante para investigación reproducible. El repositorio de la cuantización no incluye todavía descargas ni valoraciones en el momento de redactar esta ficha.

Conviene señalar una discrepancia de metadatos que hay que verificar antes de planificar presupuestos de memoria: el nombre comercial indica "7B-core", mientras que el recuento real de parámetros de los safetensors del repositorio cuantizado es de 3.165.819.384. El autor de la cuantización no documenta una evaluación propia de la degradación introducida por el paso a INT4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiquetas del autor: dense, decoder-only) |
| Parámetros totales | 3.165.819.384 según safetensors del repo cuantizado; el autor denomina al modelo base "7B-core" |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde las fases de midtraining |
| Tipos de cuantización | AWQ INT4 (pesos de 4 bits), formato compressed-tensors |
| Idiomas soportados | El metadato del repositorio indica únicamente `en`; la model card lista EN, ZH, HI, AR, RU, JA, KO, NL, FR y ES |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización AWQ INT4, `library_name: transformers` con `custom_code`) |
| Modelo base | IFM/K2-Horizon-7B |
| Autor de la cuantización | cyankiwi, versión 26.05.01 |
| Dataset de calibración | cyankiwi/calibration (STEM and Agentic) |
| Tamaño del repositorio | 8,1 GB (la model card indica 8,12 GB) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicación | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, sin mezcla de expertos, según las etiquetas declaradas por el autor (`dense`, `decoder-only`, `7b`). El modelo base se entrenó con los datasets IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data, y el autor indica que la ventana de 524.288 tokens es nativa "desde las fases de midtraining en adelante". No se especifica en la información disponible el número total de tokens de entrenamiento, la composición detallada del corpus ni si se aplicaron fases de RLHF o DPO.

Entre las innovaciones declaradas destacan dos: la publicación de checkpoints intermedios, que permite estudiar la evolución de capacidades a lo largo del entrenamiento y no solo en el punto final, y los "Diffusion Adapters" orientados a acelerar la inferencia, publicados aparte en IFM/K2-Horizon-7B-Uno. El autor afirma que el entrenamiento es "fully open": datos, receta, código de entrenamiento y recursos de evaluación son públicos. Esta variante concreta añade únicamente la cuantización AWQ de 4 bits calibrada con un conjunto de datos de tipo STEM y agéntico; no se documentan cambios en el entrenamiento del modelo base.

## Capacidades

- Generación de texto y uso conversacional, según el `pipeline_tag: text-generation` y la etiqueta `conversational`.
- Procesamiento de contexto muy largo: 524.288 tokens nativos, adecuado para documentos completos, repositorios de código o historiales extensos.
- Razonamiento matemático: la model card incluye el benchmark HMMT Feb 2026 (matemáticas de competición), donde el modelo base obtiene 73,3.
- Generación y comprensión de código: la model card incluye una categoría "Coding" en su tabla de benchmarks (resultados no incluidos en la información disponible).
- Capacidades multilingües: la model card enumera EN, ZH, HI, AR, RU, JA, KO, NL, FR y ES; el metadato del repositorio solo declara `en`.
- Aceleración mediante adaptadores de difusión publicados por separado (IFM/K2-Horizon-7B-Uno).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona evaluación "agentic", pero no se documenta un protocolo de tool calling ni un modo agente explícito.
- Capacidades de visión, audio o modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con 524.288 tokens de contexto, el modelo puede ingerir manuales completos, normativas o especificaciones de proyecto en una sola pasada, evitando pipelines de chunking y recuperación fragmentada.
- Asistencia sobre repositorios de código: la ventana de contexto permite cargar múltiples ficheros de un mismo proyecto para responder preguntas de arquitectura o refactorización, apoyándose en la categoría "Coding" evaluada por el autor.
- Resolución de problemas matemáticos y cuantitativos: con 73,3 en HMMT Feb 2026, es apropiado para tutoría o verificación de cálculos en entornos educativos y de ingeniería.
- Atención al cliente multilingüe: la model card declara soporte para 10 idiomas, lo que permite atender consultas en varios mercados con un único despliegue, siempre que se valide la calidad por idioma.
- Despliegue on-premise con requisitos de privacidad: gracias a la cuantización AWQ INT4, el modelo ocupa 8,12 GB y puede ejecutarse en GPUs de gama consumer dentro de infraestructura propia, sin enviar datos a servicios externos.
- Investigación en reproducibilidad: al publicarse datos de preentrenamiento, midtraining, receta y código de evaluación, sirve como base para experimentos comparativos sobre entrenamiento y cuantización.
- Resumen y extracción de información en corpus legales o científicos: la combinación de contexto largo y licencia Apache 2.0 permite integrarlo en productos comerciales de análisis documental.
- Evaluación de técnicas de cuantización: este repositorio permite comparar AWQ INT4 frente al modelo base original manteniendo el mismo pipeline de transformers.

## Benchmarks y rendimiento

La información proporcionada solo incluye la primera fila de la tabla de benchmarks de la model card; el resto del contenido aparece truncado en el origen. Los datos disponibles son los siguientes, correspondientes al modelo base K2-Horizon-7B y no a esta cuantización INT4:

| Benchmark | Categoría | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|---|
| HMMT Feb 2026 | Matemáticas de competición | 73,3 | 63,1 | 65,7 | 66,5 |

El autor declara categorías adicionales de evaluación (agentic, coding y long-context), pero sus resultados no están disponibles en la información proporcionada. Tampoco se han publicado en esta información resultados específicos del modelo cuantizado a INT4, por lo que se desconoce la pérdida de precisión respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 8,12 GB en INT4, por lo que se necesitan aproximadamente 9-10 GB de VRAM para pesos y overhead de ejecución con contextos moderados.
- El coste de la caché KV crece de forma lineal con la longitud de contexto; usar los 524.288 tokens completos exige mucha más memoria que la indicada por el tamaño de los pesos y probablemente GPUs de 80 GB o configuraciones multi-GPU.
- GPUs recomendadas: A100 80 GB o H100 para contextos largos y serving en producción; RTX 4090, RTX 3090 o A6000 para cargas de trabajo con contextos medios.
- Compatibilidad con GPU consumer: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti 16 GB, RTX 4080, RTX 4090) siempre que se limite la longitud de contexto.
- Opciones de despliegue: vLLM y LMDeploy soportan AWQ INT4; también es posible usar transformers con el formato compressed-tensors y `trust_remote_code` habilitado, dado el tag `custom_code`.
- llama.cpp y Ollama: no disponibles para este repositorio, ya que solo se publican pesos safetensors en AWQ INT4 y no una versión GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | HMMT Feb 2026 |
|---|---|---|---|---|---|
| K2-Horizon-7B (base) | 7B-core según el autor | 524.288 tokens | Apache 2.0 | Pesos abiertos, datos y receta públicos | 73,3 |
| K2-Horizon-7B-AWQ-INT4 (este repo) | 3.165.819.384 según safetensors | 524.288 tokens (heredado del base) | Apache 2.0 | Pesos AWQ INT4 en safetensors | No evaluado en la información disponible |
| Gemma 4-12B (referencia de la model card) | no disponible | no disponible | no disponible | no disponible | 63,1 |
| Qwen3.5-9B (referencia de la model card) | no disponible | no disponible | no disponible | no disponible | 65,7 |
| Granite 4.2-8B (referencia de la model card) | no disponible | no disponible | no disponible | no disponible | 66,5 |

Los tres modelos de referencia se citan en la tabla comparativa del autor, pero la información proporcionada no incluye sus especificaciones técnicas, licencias ni disponibilidad, por lo que esos campos quedan como no disponibles.

## Limitaciones y advertencias

- La cuantización AWQ INT4 puede degradar la calidad respecto al modelo base y no se publica ninguna evaluación de esa pérdida en la información disponible.
- El metadato del repositorio declara únicamente inglés (`en`), mientras que la model card lista 10 idiomas; no hay evaluación publicada por idioma, por lo que el soporte multilingüe debe validarse antes de usarlo en producción.
- Existe una discrepancia entre el nombre "7B-core" y el recuento de safetensors de 3.165.819.384 parámetros; hay que verificar este dato antes de dimensionar hardware.
- El uso de los 524.288 tokens de contexto tiene un coste de memoria de caché KV que puede hacer inviable la ventana completa en GPUs de gama consumer.
- El repositorio declara `custom_code`, por lo que es probable que sea necesario `trust_remote_code=True` en transformers; conviene auditar el código remoto antes de ejecutarlo en entornos sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible; la model card no documenta tasas de error ni evaluaciones de veracidad.
- Sesgos conocidos: no disponibles; el autor no publica análisis de sesgo ni composición demográfica del corpus de preentrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados.
- Los datos de benchmarks proceden del modelo base, no de esta cuantización, y las referencias comparativas (Gemma 4-12B, Qwen3.5-9B, Granite 4.2-8B, HMMT Feb 2026) corresponden a versiones y fechas que deben verificarse de forma independiente antes de tomar decisiones de selección de modelo.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria de su funcionamiento.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/cyankiwi/K2-Horizon-7B-AWQ-INT4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Adaptadores de difusión para inferencia rápida: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Dataset de calibración de la cuantización: https://huggingface.co/datasets/cyankiwi/calibration
- Contacto del autor de la cuantización: ton@cyan.kiwi
