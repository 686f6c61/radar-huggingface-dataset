# RicemanT/MageTrail

## Resumen

MageTrail es un modelo de generación de imágenes texto-a-imagen derivado de MageFlow 4B, el modelo de Microsoft, mediante un fine-tuning completo realizado por el desarrollador independiente RicemanT. El resultado es una arquitectura propia de 2.800 millones de parámetros orientada a la generación de ilustración anime y contenido furry, con prompting basado en etiquetas de los repositorios Danbooru y e621. El modelo se distribuye a través de Hugging Face con licencia MIT y está pensado para su uso con la librería diffusers y flujos de trabajo de ComfyUI.

La propuesta del autor es demostrar que la arquitectura de MageFlow constituye una base viable para fine-tunings especializados en el ámbito de la ilustración, empleando un conjunto de datos condensado de 41.000 imágenes maximizado en diversidad en lugar de recurrir al corpus completo de los boorus. Según la model card, el modelo es entre un 15 y un 20 % más rápido en inferencia que NVIDIA Cosmos2 y Anima pese a contar con unos 2.000 millones de parámetros más, e incorpora un codificador de texto Qwen 3 VL 4B.

La relevancia actual del proyecto radica en su compatibilidad, a partir de la versión V0.3, con Flux2VAE, lo que permite reutilizar el VAE de código abierto más avanzado sin necesidad de un reajuste costoso. El repositorio ocupa 326,1 GB y acumula 332 descargas y 49 «me gusta» en el momento de la consulta, con versiones publicadas entre V0.1 y V0.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MageFlow (base de Microsoft), ajustada a una arquitectura propia de 2,8B; compatible con Flux2VAE desde V0.3 |
| Parametros totales | 2.800 millones (2,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusión texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors vía diffusers (repositorio de 326,1 GB) |

## Arquitectura y entrenamiento

MageTrail parte de MageFlow 4B y se somete a un fine-tuning completo que reduce el modelo a una arquitectura personalizada de 2,8B parámetros. Emplea un codificador de texto Qwen 3 VL 4B y soporta de forma nativa resoluciones entre 256 y 2048 píxeles. A partir de la versión V0.3, el autor reporta que, con ciertos cambios de código, el modelo es completamente compatible con Flux2VAE durante el entrenamiento, lo que lo convierte en una arquitectura asimilable a la de Flux2VAE sin necesidad de un tune de realineamiento.

El entrenamiento se realizó sobre el dataset RicemanT/booru-essence-2026, un conjunto condensado de 41.000 imágenes diseñado para maximizar la diversidad y enseñar al modelo conceptos y etiquetas de Danbooru y e621. Las versiones V0.1 a V0.3 consumieron 593 dólares de cómputo; la V0.4 es una prueba de 20 dólares con 100 artistas orientada a validar el aprendizaje de estilos y la adaptación al nuevo VAE. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución nativa de 256 a 2048 píxeles.
- Prompting basado en etiquetas de Danbooru y e621, con aprendizaje de conceptos, personajes y etiquetas propias de estos repositorios.
- Generación de ilustración de estilo anime y contenido furry.
- Aprendizaje y reproducción de estilos de artista (validado en la prueba V0.4 con 100 artistas).
- Compatibilidad con Flux2VAE para la decodificación de latentes.
- Integración con ComfyUI: las imágenes de previsualización incluyen metadatos de ComfyUI, y el autor indica que es necesario descargar un nodo personalizado para la generación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Generación de ilustración anime para proyectos editoriales o de autoedición: el modelo responde a etiquetas de Danbooru, lo que permite controlar personajes, poses y composición con vocabulario de booru y resoluciones de hasta 2048 píxeles.
- Creación de fan art y contenido para comunidades furry: el ajuste sobre e621 permite generar personajes antropomórficos con las convenciones visuales de ese repositorio.
- Prototipado rápido de personajes en estudios pequeños: con inferencia un 15-20 % más rápida que Cosmos2/Anima según el autor, resulta adecuado para iterar variantes de diseño en sesiones de ComfyUI.
- Replicación de estilos de artista para exploración creativa o previsualización: la prueba V0.4 demuestra la capacidad de aprender estilos concretos con presupuestos reducidos, útil para moodboards y pruebas de dirección de arte.
- Integración en pipelines de ComfyUI para producción por lotes: al distribuirse como modelo diffusers con pesos safetensors y metadatos de ComfyUI en las muestras, encaja en flujos automatizados de generación por lotes.
- Investigación sobre fine-tuning de modelos de difusión: el proyecto documenta costes, datasets y compatibilidad con Flux2VAE, lo que lo convierte en una referencia práctica para estudiar la adaptación de arquitecturas pequeñas a dominios especializados.
- Generación de ilustraciones de alta resolución para impresión o fondos: el soporte nativo hasta 2048 píxeles evita el reescalado agresivo en salidas de gran formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta una comparación cualitativa de velocidad: entre un 15 y un 20 % más rápido en inferencia que NVIDIA Cosmos2 y Anima, pese a tener unos 2.000 millones de parámetros más.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de difusión de 2,8B parámetros en precisión completa se requiere aproximadamente 5,6 GB solo para los pesos, a lo que hay que sumar el codificador de texto Qwen 3 VL 4B y el VAE; en la práctica se recomienda disponer de al menos 16-24 GB de VRAM para trabajar con comodidad a resoluciones altas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son opciones razonables para resolución completa; GPU consumer de 12-16 GB pueden ser suficientes con cuantización, aunque no se documentan formatos cuantizados.
- Compatibilidad con GPU consumer: probable en tarjetas de 16 GB o más, sin confirmación oficial.
- Opciones de despliegue: diffusers (librería declarada) y ComfyUI con un nodo personalizado que el autor indica descargar en la sección de recomendaciones de generación.
- Latencia y throughput: no disponibles; solo la comparación relativa de velocidad frente a Cosmos2/Anima.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MageTrail | 2,8B | 256-2048 px nativo | 15-20 % mas rapido que Cosmos2/Anima segun el autor | MIT | Hugging Face (diffusers) |
| MageFlow 4B (base) | 4B | no disponible | no disponible | no disponible | Hugging Face (mage-flow-community) |
| NVIDIA Cosmos2 | no disponible | no disponible | referencia de velocidad en la model card | no disponible | no disponible |
| Anima | no disponible | no disponible | referencia de velocidad en la model card | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en anime y furry; su rendimiento en fotografía realista, ilustración genérica u otros dominios no está documentado y probablemente sea limitado.
- El dataset de entrenamiento (41.000 imágenes) está descrito por el propio autor como insuficiente: ha «superado» su dataset limitado, lo que sugiere posibles lagunas de conceptos y menor diversidad que fine-tunings sobre corpus mayores.
- Riesgo de sesgos heredados de Danbooru y e621, repositorios con convenciones y contenidos potencialmente problemáticos; no se documentan filtros de seguridad ni evaluaciones de sesgo.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomía incorrecta, texto ilegible o composiciones incoherentes, especialmente con prompts complejos.
- No se documentan idiomas soportados ni calidad del seguimiento de prompts en castellano; el prompting está orientado a etiquetas en inglés de booru.
- Requiere un nodo personalizado de ComfyUI para la generación, lo que añade una dependencia no estándar al despliegue.
- El repositorio ocupa 326,1 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables.
- Aunque la licencia es MIT, conviene verificar las condiciones de la licencia del modelo base MageFlow y de los datasets de origen antes de un uso comercial.
- La model card incluye llamadas a donaciones y objetivos de financiación; el proyecto depende de un único desarrollador, con el riesgo de mantenimiento que ello implica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RicemanT/MageTrail
- Modelo base MageFlow: https://huggingface.co/mage-flow-community/Mage-Flow
- Dataset de entrenamiento: https://huggingface.co/datasets/RicemanT/booru-essence-2026
- Fine-tune relacionado de MageFlow: https://huggingface.co/Muinez/mage-flow-ft
- Ko-fi del autor: https://ko-fi.com/ta
