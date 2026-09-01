# NIRVLab/mt5-base-tr-en

## Resumen

El modelo `NIRVLab/mt5-base-tr-en` es un checkpoint de traducción automática neuronal (NMT) de turco a inglés, desarrollado por NIRVLab como línea base oficial para la conferencia COLING 2027. Se trata de un ajuste fino (fine-tuning) del modelo multilingüe `google/mt5-base` sobre el subconjunto tr-en del dataset OPUS-100, que contiene 100.000 pares de frases. El modelo está diseñado específicamente para la tarea de traducción secuencial (sequence-to-sequence) entre estos dos idiomas.

La relevancia de este modelo radica en su papel como punto de referencia (baseline) reproducible para la investigación en traducción automática, especialmente en el par de idiomas turco-inglés, que cuenta con menos recursos que otros pares más comunes. Al estar basado en mT5, hereda la arquitectura transformer encoder-decoder de T5 pero con un vocabulario multilingüe compartido que cubre 101 idiomas, lo que permite un entrenamiento eficiente con datos multilingües. El modelo tiene aproximadamente 580 millones de parámetros y fue seleccionado según la mejor puntuación BLEU en el conjunto de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5-Base) |
| Parametros totales | 580 millones (aprox.) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (mT5 base usa 512 tokens por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 1.2 GB, probablemente safetensors o bin) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura mT5 (multilingual T5), que es una variante multilingüe del modelo T5 original. mT5 emplea un enfoque de texto a texto (text-to-text), donde todas las tareas se formulan como problemas de generación de secuencias. La arquitectura es un transformer encoder-decoder con aproximadamente 580 millones de parámetros en su variante base, entrenado originalmente sobre un corpus multilingüe masivo que cubre 101 idiomas, utilizando un vocabulario compartido basado en SentencePiece.

Para este checkpoint específico, NIRVLab realizó un ajuste fino supervisado sobre el dataset OPUS-100, concretamente en el subconjunto de pares turco-inglés con 100.000 pares de frases. El proceso de entrenamiento utilizó la pérdida de entropía cruzada estándar para traducción y la selección del mejor checkpoint se realizó en función de la puntuación BLEU en el conjunto de validación. No se menciona el uso de técnicas adicionales como RLHF o DPO en la información disponible.

## Capacidades

- Traducción automática de turco a inglés (tr → en) con calidad de línea base.
- Generación de texto condicionada: dado un texto en turco, produce su traducción al inglés.
- Manejo de vocabulario multilingüe compartido gracias a la base mT5, aunque el ajuste fino se centra exclusivamente en el par tr-en.
- Capacidad de procesamiento de secuencias de hasta 512 tokens (longitud de contexto heredada de mT5-Base).
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso o visión en la información proporcionada.

## Casos de uso

- Traducción de documentos técnicos: el modelo puede traducir manuales, guías o documentación técnica del turco al inglés, aprovechando su entrenamiento en datos generales de OPUS-100.
- Localización de software: integración en pipelines de localización para traducir cadenas de interfaz de usuario o mensajes de aplicación del turco al inglés.
- Traducción de contenido web: uso como motor de traducción para sitios web que necesitan ofrecer versiones en inglés de contenido originalmente en turco.
- Preprocesamiento de datos: traducción de datasets o corpus en turco al inglés para facilitar su uso en modelos monolingües o en pipelines de análisis multilingüe.
- Evaluación comparativa: uso como baseline en investigaciones de traducción automática para comparar el rendimiento de modelos más complejos o con técnicas avanzadas.
- Aplicaciones educativas: herramienta de apoyo para estudiantes de inglés que hablan turco, permitiendo traducir textos de práctica o ejercicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de métricas BLEU y chrF para la selección del modelo, pero no se proporcionan valores numéricos concretos. El modelo fue seleccionado por su mejor puntuación BLEU en el conjunto de validación de OPUS-100, pero no se especifican los resultados obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 580M parámetros, se estima un consumo de aproximadamente 2-3 GB en precisión FP16, y alrededor de 1-1.5 GB en cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1660, RTX 2060 o superiores son suficientes. Para mayor velocidad, se recomienda RTX 3090 o A100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo medio como la RTX 3060 (12 GB) o RTX 4070.
- Opciones de despliegue: al ser un modelo de Hugging Face, se puede desplegar con transformers, vLLM, TGI, o convertirse a GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada, pero para un modelo de 580M parámetros en una GPU moderna se espera una latencia de decenas de milisegundos por secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NIRVLab/mt5-base-tr-en | 580M | 512 | tr, en | no disponible | Baseline específico para tr-en |
| Helsinki-NLP/opus-mt-tr-en | ~300M | 512 | tr, en | CC-BY-4.0 | Modelo transformer clásico para tr-en |
| facebook/nllb-200-distilled-600M | 600M | 512 | 200+ | CC-BY-NC-4.0 | Modelo multilingüe de Meta, incluye tr-en |

El modelo de NIRVLab se diferencia por estar basado en mT5, lo que le permite aprovechar el vocabulario multilingüe compartido, mientras que los modelos de Helsinki-NLP son transformers más simples entrenados específicamente para el par tr-en. NLLB-200 ofrece cobertura multilingüe más amplia pero con licencia no comercial.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en datos generales de OPUS-100, puede heredar sesgos presentes en el corpus, como desequilibrios de dominio o registro.
- Riesgo de alucinación: como cualquier modelo de traducción neuronal, puede generar traducciones inventadas o incorrectas, especialmente en frases ambiguas o con terminología especializada.
- Limitaciones de contexto: la longitud máxima de secuencia está limitada a 512 tokens, lo que impide traducir documentos largos de una sola vez.
- Restricciones de licencia: la licencia no está disponible, por lo que se recomienda contactar con los autores antes de usar el modelo en producción comercial.
- Rendimiento limitado: al ser un baseline, su calidad de traducción puede ser inferior a modelos más grandes o específicamente optimizados.

## Enlaces

- HuggingFace: https://huggingface.co/NIRVLab/mt5-base-tr-en
- Modelo base mT5: https://huggingface.co/google/mt5-base
- Documentación de mT5 en Transformers: https://huggingface.co/docs/transformers/model_doc/mt5
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
