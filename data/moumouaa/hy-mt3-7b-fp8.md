# moumouaa/Hy-MT3-7B-FP8

## Resumen

Hy-MT3-7B-FP8 es una versión cuantizada en FP8 del modelo de traducción Hy-MT3-7B, desarrollado por Tencent dentro de la tercera generación de su familia de modelos multilingües Hy-MT. El modelo original forma parte de una release que incluye tres tamaños (1.8B, 7B y 30B-A3B MoE) y amplía la cobertura lingüística de 38 a 102 idiomas respecto a Hy-MT2. Esta variante concreta, publicada por el usuario moumouaa, aplica cuantización FP8 mediante la librería `compressed-tensors` sobre los pesos originales en safetensors.

El modelo resuelve el problema de traducción automática multilingüe de alta calidad con énfasis en dos escenarios industriales: localización de videojuegos e traducción de imágenes en pipelines OCR. Con 7.504.568.320 parámetros totales y una arquitectura densa `hunyuan_v1_dense`, se posiciona como una alternativa de tamaño medio dentro de la familia, orientada a despliegues donde el modelo de 30B-A3B resulta excesivo pero se requiere más calidad que la variante de 1.8B.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria (0 descargas, 0 likes en el momento de la consulta) de un modelo base publicado apenas dos días antes, con licencia Apache 2.0, lo que facilita su uso comercial. La cuantización FP8 reduce el peso del repositorio a 8.0 GB, facilitando el despliegue en GPUs de gama alta para consumidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | 102 idiomas (según model card del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantización FP8) |

## Arquitectura y entrenamiento

La arquitectura es `hunyuan_v1_dense`, un transformer denso de 7.5B parámetros. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del modelo base menciona que Hy-MT3 incorpora datos de alta calidad del dominio de videojuegos (construidos con el equipo de Honor of Kings) y un sistema de evaluación profesional, así como mejoras en comprensión de contexto y corrección de errores para tolerar fallos de OCR en traducción de imágenes.

La innovación principal de la familia Hy-MT3 es la ampliación a 102 idiomas y la reducción de errores respecto a Hy-MT2: un 43% menos de muestras con mistranslaciones, un 74% menos de omisiones o adiciones y un 40% menos de errores de seguimiento de instrucciones en datos de escenarios reales. Esta variante FP8 no documenta cambios arquitectónicos respecto al modelo base; únicamente aplica cuantización de pesos a 8 bits en coma flotante mediante `compressed-tensors`.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, con especial énfasis en pares que incluyen chino mandarín y lenguas minoritarias.
- Seguimiento de instrucciones de traducción (restricciones de formato, terminología, estilo) medido mediante el benchmark IFMTBench.
- Localización de videojuegos: manejo de marcadores de posición (placeholders), texto enriquecido y terminología específica del dominio.
- Traducción de imágenes en pipelines OCR: tolerancia a errores de OCR y corrección contextual.
- Modo thinking (razonamiento explícito) disponible en la familia, aunque la model card indica que los resultados principales se reportan en modo no-thinking.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se documenta soporte de visión o audio nativo; la traducción de imágenes se realiza mediante cascada OCR.

## Casos de uso

- Localización de videojuegos: el modelo puede integrarse en la cadena de herramientas TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y descripciones de objetos, gestionando placeholders y texto enriquecido sin romper el formato del motor del juego.
- Traducción de documentación técnica multilingüe: con 102 idiomas soportados y seguimiento de instrucciones, se puede usar para traducir manuales manteniendo terminología consistente mediante glosarios en el prompt.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones multi-turno entre agentes y clientes en distintos idiomas, aprovechando la mejora del 40% en seguimiento de instrucciones para respetar tono y restricciones.
- Traducción de imágenes en aplicaciones de accesibilidad: en cascada con un motor OCR, el modelo corrige errores de reconocimiento y produce traducciones coherentes de carteles, menús o documentos escaneados.
- Subtitulado y doblaje: traducción de guiones con restricciones de longitud y sincronización, usando el modo de instrucciones para ajustar el registro y la naturalidad.
- Generación de contenido multilingüe para comercio electrónico: traducción de fichas de producto, reseñas y descripciones manteniendo terminología de marca y formato estructurado.
- Investigación en traducción automática: evaluación comparativa con TransRubric y FLORES-200 para estudiar el impacto de la cuantización FP8 en la calidad de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante FP8 en la información disponible. La model card del modelo base reporta resultados agregados de la familia Hy-MT3 (promedios sobre FLORES-200, FLORES-200 low-resource, WMT26 y Mandarin⇔Minority, puntuados con TransRubric), pero no se proporcionan cifras numéricas desglosadas en el texto disponible, solo gráficos. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantización FP8 de 7.5B parámetros, el peso de los pesos es de aproximadamente 7.5 GB; con overhead de activaciones y KV cache, se estima un mínimo de 10-12 GB de VRAM para contexto corto.
- GPU recomendadas: NVIDIA H100, A100 (80 GB o 40 GB) para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en una sola GPU de consumidor.
- Cabe en GPU de consumidor: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, ajustado) y GPUs con al menos 12 GB si se reduce el contexto.
- Opciones de despliegue: vLLM (soporte de FP8 nativo en GPUs Hopper/Ada), TGI, y potencialmente llama.cpp si se genera una versión GGUF a partir de los pesos (no disponible en el repositorio). El formato `compressed-tensors` es compatible con vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-7B-FP8 (esta ficha) | 7.5B | no disponible | 102 | Apache 2.0 | safetensors FP8 |
| Hy-MT3-7B (base) | 7.5B | no disponible | 102 | Apache 2.0 | safetensors (BF16/FP16 presumiblemente) |
| Hy-MT3-1.8B | 1.8B | no disponible | 102 | Apache 2.0 | safetensors |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | no disponible | 102 | Apache 2.0 | safetensors |

La comparativa con modelos de otras familias (Qwen-MT, DeepSeek, GPT) no está disponible con cifras numéricas en la información proporcionada; la model card menciona que Hy-MT3-30B-A3B supera a Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash en modo no-thinking según TransRubric, pero no se aportan los valores concretos.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradación de calidad respecto al modelo base en BF16/FP16; no se han publicado evaluaciones comparativas de esta variante frente al original.
- Es una publicación comunitaria (usuario moumouaa) sin validación oficial por parte de Tencent; el repositorio tiene 0 descargas y 0 likes, lo que implica ausencia de validación por la comunidad.
- Riesgo de alucinación inherente a los modelos de traducción neuronales, especialmente en idiomas de bajos recursos o dominios muy especializados.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos web y de dominio de videojuegos, puede reflejar sesgos culturales y de género presentes en esos corpus.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base podría tener restricciones adicionales no reflejadas en esta cuantización; se recomienda revisar la licencia del modelo original `tencent/Hy-MT3-7B`.
- No se documenta soporte de tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que requieran function calling.
- El formato `compressed-tensors` requiere versiones recientes de vLLM o de las librerías de quantización; puede no ser compatible con herramientas de inferencia más antiguas.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/moumouaa/Hy-MT3-7B-FP8
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Suite de evaluación TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de videojuegos: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
