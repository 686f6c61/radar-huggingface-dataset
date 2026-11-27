# Jeremy939494/Hy-MT3-7B

## Resumen

Hy-MT3-7B es un modelo de traducción automática multilingüe desarrollado por Tencent dentro de la tercera generación de su familia Hy-MT. Con 7.504.568.320 parámetros, se distribuye como checkpoint denso bajo la arquitectura `hunyuan_v1_dense` y cubre 102 idiomas, ampliando los 38 de la generación anterior. Su propósito es la traducción de texto de alta fidelidad, con especial énfasis en el cumplimiento de restricciones del usuario (glosarios, marcadores de posición, formato enriquecido) y en escenarios industriales como la localización de videojuegos y la traducción de imágenes.

El modelo se publica junto a sus variantes Hy-MT3-1.8B y Hy-MT3-30B-A3B (MoE), así como con la suite de evaluación TransRubric. Según la model card, la generación Hy-MT3 reduce un 43 % las muestras con errores de traducción, un 74 % las omisiones o adiciones y un 40 % los fallos de seguimiento de instrucciones respecto a Hy-MT2 sobre datos de escenarios reales.

Es relevante ahora porque ofrece, bajo licencia Apache 2.0 y pesos abiertos en safetensors, un modelo de traducción de tamano medio que compite con APIs comerciales y con modelos propietarios de mayor tamano en modo no-thinking, y porque su integración con `transformers` y con endpoints compatibles facilita su despliegue en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 102 idiomas (zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, entre otros; lista completa en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hy-MT3-7B es un transformer denso identificado en la librería `transformers` con la arquitectura `hunyuan_v1_dense`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Sí indica que el modelo se ha construido con datos de alta calidad del dominio de videojuegos (en colaboración con el equipo de Honor of Kings) y que incorpora mejoras de comprensión de contexto y corrección de errores orientadas a tolerar fallos de OCR en pipelines de traducción de imágenes.

La familia Hy-MT3 incluye tres tamanos (1.8B, 7B y 30B-A3B con 3B parámetros activos). La model card menciona que los modelos Hy-MT3 se sitúan en la frontera superior izquierda de la curva de calidad frente a cómputo de inferencia, es decir, obtienen buena calidad con bajo coste computacional. No se especifican innovaciones técnicas concretas como decodificación especulativa o atención lineal para esta variante.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluyendo pares de bajos recursos y traducción mandarín-minorías.
- Cumplimiento de restricciones del usuario: glosarios, terminología, marcadores de posición y texto enriquecido.
- Traducción de imágenes en cascada con OCR, con tolerancia a errores de reconocimiento.
- Localización de videojuegos: control de tasa de fuera de objetivo, errores de placeholders, errores de rich-text y errores de terminología.
- Evaluación automática mediante TransRubric (herramienta publicada junto al modelo).
- Soporte de modo thinking y no-thinking (la model card distingue ambos modos en las comparativas).
- Integración con `transformers` y con endpoints compatibles.
- Capacidades multilingües amplias, con cobertura de escrituras latina, cirílica, árabe, devanagari, han, hangul, tailandesa, entre otras.

## Casos de uso

- Localización de videojuegos: el modelo se integra en la cadena de herramientas TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y descripciones de objetos, manteniendo terminología consistente y respetando marcadores de posición y rich-text.
- Traducción de documentación técnica: con soporte de glosarios y restricciones, puede traducir manuales y referencias de API preservando nombres de funciones, parámetros y fragmentos de código.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y clientes en 102 idiomas, con bajo coste de inferencia al ser un modelo de 7B.
- Traducción de imágenes en producción: en pipelines OCR → traducción, el modelo corrige errores de OCR y mantiene coherencia contextual en capturas, cómics y material promocional.
- Subtitulado y doblaje: traducción de guiones y subtítulos con control de longitud y terminología, apoyada en el modo no-thinking para baja latencia.
- Traducción de contenido editorial y marketing: adaptación de textos con restricciones de tono y formato, usando el modo thinking para revisión de calidad.
- Evaluación automática de sistemas de traducción: combinado con TransRubric para puntuar salidas de otros modelos en pipelines de CI.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados (main_result.png y efficiency.png) pero no presenta una tabla numérica con valores concretos de MMLU, HumanEval, GSM8K ni de benchmarks de traducción. Los datos cualitativos mencionados son:

- Reducción del 43 % en muestras con errores de traducción respecto a Hy-MT2.
- Reducción del 74 % en omisiones o adiciones respecto a Hy-MT2.
- Reducción del 40 % en errores de seguimiento de instrucciones respecto a Hy-MT2.
- Hy-MT3-30B-A3B logra el mejor rendimiento global en modo no-thinking entre los modelos evaluados, incluyendo Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash.
- Hy-MT3-1.8B supera a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general.
- Hy-MT3-30B-A3B iguala o supera a Gemini 3.1 Pro en métricas de localización de videojuegos.
- Hy-MT3 obtiene el mejor resultado entre modelos de tamano comparable en VISTA-Bench para traducción de imágenes.

No se han publicado resultados numéricos de benchmarks en la información disponible para la variante 7B.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits (sujeto a disponibilidad de pesos cuantizados, no confirmada).
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-7B | 7,5B | no disponible | 102 | Apache 2.0 | Modelo denso, foco en traducción y restricciones |
| Hy-MT3-1.8B | 1,8B | no disponible | 102 | Apache 2.0 | Variante ligera, supera APIs comerciales en traducción general según la model card |
| Hy-MT3-30B-A3B | 30B totales / 3B activos | no disponible | 102 | Apache 2.0 | MoE, mejor rendimiento global en modo no-thinking según la model card |
| Hy-MT2-7B | 7B | no disponible | 38 | no disponible | Generación anterior, base de las mejoras reportadas |

No se dispone de datos numéricos de benchmarks para comparar directamente con Qwen-MT, NLLB o M2M-100 en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de sesgo; se recomienda auditoría propia antes de uso en producción.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en idiomas de bajos recursos o dominios muy especializados.
- La longitud de contexto no está especificada, lo que dificulta planificar el truncado de documentos largos.
- No se confirman pesos cuantizados publicados (GGUF, AWQ, GPTQ); el despliegue en GPUs de consumo puede requerir cuantización propia.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las dependencias de la cadena de herramientas (TiMiHOKGameTranslator, TransRubric) por si tienen licencias distintas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.
- El ID de Hugging Face (`Jeremy939494/Hy-MT3-7B`) difiere del espacio oficial de Tencent (`tencent/Hy-MT3-7B`); verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jeremy939494/Hy-MT3-7B
- Repositorio oficial en Hugging Face (referenciado en la model card): https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
