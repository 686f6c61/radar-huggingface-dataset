# LiquidAI/LFM2.5-Encoder-350M

## Resumen

LFM2.5-Encoder-350M es un encoder bidireccional multilingüe desarrollado por Liquid AI, basado en la arquitectura híbrida LFM2. Está diseñado para tareas de clasificación de texto, token classification, retrieval, reranking y similitud semántica, y se distribuye como un modelo de lenguaje enmascarado (masked language model) con atención completa bidireccional. Con 354,5 millones de parámetros y una ventana de contexto de 8.192 tokens, ofrece un equilibrio entre calidad y eficiencia, siendo adecuado para despliegue en dispositivos con recursos limitados.

El modelo se adapta a partir del LFM2-350M-Base y se entrena con un objetivo de modelado de lenguaje enmascarado sobre un corpus multilingüe de 15 idiomas. Su relevancia actual radica en que supera en calidad a otros encoders de su tamaño o menores, y ofrece un rendimiento de inferencia comparable o superior al de ModernBERT, con una ventaja particular en CPU para contextos largos. Está pensado para ser fine-tuneado en tareas específicas, y se acompaña de demos que muestran aplicaciones como enrutado de prompts, detección de PII o generación de texto por difusión enmascarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrido (convoluciones cortas con compuerta + atención grouped-query) con atención bidireccional completa |
| Parametros totales | 354.483.968 (~354,5 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se puede cuantizar con herramientas externas) |
| Idiomas soportados | 15: en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (también disponible en el repo de HuggingFace) |

## Arquitectura y entrenamiento

LFM2.5-Encoder-350M se construye sobre el backbone LFM2, que intercala bloques de convolución corta con compuerta (gated short-convolution) con atención grouped-query (GQA). Para su uso como encoder, se sustituye la máscara causal por atención bidireccional completa y se entrena con una cabeza de modelado de lenguaje enmascarado. El cuerpo del modelo se expone como `Lfm2BidirectionalModel` y la versión con cabeza MLM como `Lfm2BidirectionalForMaskedLM`, ambos accesibles mediante `trust_remote_code=True`.

El entrenamiento parte del modelo base LFM2-350M-Base y se realiza con un objetivo de MLM sobre un corpus multilingüe extenso. Se utiliza un esquema de pre-entrenamiento en dos etapas que extiende la ventana de contexto hasta los 8.192 tokens. No se menciona el uso de RLHF o DPO; el modelo está pensado para ser fine-tuneado posteriormente en tareas específicas.

## Capacidades

- Clasificación de texto: sentimiento, tema, intención, enrutado de prompts, moderación y linting de texto empresarial.
- Token classification: reconocimiento de entidades nombradas, extracción de spans y etiquetado de secuencias.
- Retrieval y reranking: puede servir como backbone para embeddings densos o retrievers estilo ColBERT (late interaction).
- Similitud semántica: STS, paráfrasis y detección de duplicados.
- Inferencia de lenguaje natural (NLI) y QA extractivo: razonamiento sobre pares de frases y extracción de spans de respuesta.
- Multilingüe: soporta 15 idiomas, incluyendo lenguas con escrituras no latinas (árabe, hindi, japonés, ruso, chino, etc.).
- Generación de texto por difusión enmascarada: aunque es un encoder, se puede utilizar de forma creativa para generar texto iterativamente desenmascarando tokens (demo oficial).
- Eficiencia en CPU: los demos oficiales se ejecutan en espacios de HuggingFace solo con CPU, lo que indica que es viable en entornos sin GPU.

## Casos de uso

- Enrutado de prompts en sistemas multiagente: el modelo puede puntuar un prompt completo contra varias "rutas" definidas en texto libre en una sola pasada, permitiendo dirigir cada consulta al agente o flujo adecuado sin necesidad de clasificadores entrenados.
- Linting de políticas empresariales: dado un texto y un conjunto de reglas escritas en lenguaje natural, el modelo puede detectar qué tokens violan cada regla, útil para cumplimiento normativo o moderación de contenido.
- Corrección ortográfica y gramatical: mediante fine-tuning en tareas de token classification, puede corregir errores token a token, como se muestra en el demo de spell checking.
- Detección de PII: puede identificar y eliminar 40 tipos de información personal en 16 idiomas, lo que resulta valioso para anonimización de datos en entornos de producción.
- Búsqueda semántica y reranking: como backbone para embeddings densos o modelos ColBERT, permite construir sistemas de búsqueda multilingüe con buena precisión y baja latencia.
- Clasificación de sentimiento y análisis de opiniones: fine-tuneado sobre datos de sentimiento, puede analizar reseñas, comentarios o tickets de soporte en múltiples idiomas.
- Detección de duplicados y similitud de documentos: útil para deduplicación de bases de datos, detección de plagio o agrupación de documentos por similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GLUE, etc.) en la información disponible. La model card afirma que el modelo supera a todos los modelos de su tamaño o menores y que está aproximadamente 5 puntos por encima de sus propios hermanos de retrieval, pero no se proporcionan cifras concretas. También se indica que iguala o supera el throughput de ModernBERT, con una ventaja en CPU para contextos largos, pero sin datos cuantitativos.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación proporcionada.
- Por su tamaño (354 M parámetros), el modelo es ligero: en fp32 ocupa aproximadamente 1,4 GB, en fp16 unos 0,7 GB y en int8 unos 0,35 GB. Esto permite ejecutarlo en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPU.
- Los demos oficiales se ejecutan en espacios de HuggingFace con CPU únicamente, lo que confirma que es viable en entornos sin aceleración GPU.
- Para despliegue en producción, se puede usar la librería `transformers` con `trust_remote_code=True`, o exportar a formatos como ONNX o TensorRT para optimización. También es compatible con herramientas de cuantización como llama.cpp o GPTQ, aunque no se mencionan oficialmente.
- La latencia y el throughput no se han publicado; se recomienda realizar pruebas propias según el hardware objetivo.

## Comparativa con modelos similares

No se dispone de una comparativa numérica detallada con otros modelos en la información proporcionada. La model card menciona a ModernBERT como referencia de throughput, indicando que LFM2.5-Encoder-350M lo iguala o supera, y que supera en calidad a todos los modelos de su tamaño o menores. Sin embargo, no se ofrecen cifras concretas. A continuación se presenta una comparación cualitativa basada en los datos disponibles:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-Encoder-350M | 354,5 M | 8.192 | 15 | LFM Open License v1.0 | Encoder bidireccional, eficiente en CPU |
| ModernBERT (base) | ~149 M | 8.192 | inglés (principalmente) | Apache 2.0 | Encoder bidireccional, referencia en eficiencia |
| BERT-large | 340 M | 512 | multilingüe (caso de multilingual) | Apache 2.0 | Encoder clásico, contexto limitado |

Nota: los datos de ModernBERT y BERT-large son de conocimiento general, no de la información proporcionada. La comparativa es orientativa.

## Limitaciones y advertencias

- No es un modelo generativo: su arquitectura de encoder enmascarado no está diseñada para generar texto de forma autorregresiva, aunque se puede usar creativamente con difusión enmascarada.
- Requiere fine-tuning para la mayoría de tareas prácticas: el modelo base solo predice tokens enmascarados; para clasificación, retrieval o NER es necesario adaptarlo.
- La licencia LFM Open License v1.0 es una licencia propia de Liquid AI; se debe revisar sus términos para uso comercial, ya que puede incluir restricciones específicas.
- El uso de `trust_remote_code=True` implica ejecutar código personalizado del repositorio, lo que conlleva riesgos de seguridad si no se audita el código.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un encoder, el riesgo de alucinación es menor que en modelos generativos, pero puede haber sesgos en las representaciones aprendidas de los datos de entrenamiento.
- El contexto de 8.192 tokens es amplio para un encoder, pero puede ser insuficiente para documentos muy largos; en esos casos se requiere truncamiento o estrategias de ventana deslizante.

## Enlaces

- [HuggingFace - LFM2.5-Encoder-350M](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M)
- [Blog post de Liquid AI sobre LFM2.5-Encoders](https://www.liquid.ai/blog/lfm2-5-encoders)
- [Playground de Liquid AI](https://playground.liquid.ai/)
- [Documentación de LFM](https://docs.liquid.ai/lfm/getting-started/welcome)
- [LEAP (plataforma de Liquid AI)](https://leap.liquid.ai/)
- [Discord de Liquid AI](https://discord.com/invite/liquid-ai)
- [Demo: Zero-shot prompt routing](https://huggingface.co/spaces/LiquidAI/prompt-routing)
- [Demo: Zero-shot policy linting](https://huggingface.co/spaces/LiquidAI/policy-linting)
- [Demo: Spell checking](https://huggingface.co/spaces/LiquidAI/spellchecker)
- [Demo: PII detection](https://huggingface.co/spaces/LiquidAI/pii-detection)
- [Demo: Masked-diffusion text generation](https://huggingface.co/spaces/LiquidAI/masked-diffusion)
