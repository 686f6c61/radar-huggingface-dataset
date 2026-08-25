# Infinity08/KAWK-1.5-500M-Korean-Base

## Resumen

KAWK-1.5-500M-Korean-Base es un modelo de lenguaje de 505 millones de parámetros, de arquitectura Llama (decoder-only), entrenado desde cero por el desarrollador Infinity08 con un tokenizer coreano propio y un corpus de aproximadamente 10.000 millones de tokens en coreano. El objetivo del proyecto es validar si un presupuesto de parámetros reducido, combinado con un tokenizer y datos específicos para un idioma, puede ofrecer un rendimiento competitivo frente a modelos multilingües de mayor tamaño ajustados posteriormente al coreano.

El modelo se presenta como un "base model" (predictor de siguiente token) y no está orientado a conversación ni a seguir instrucciones; para esos usos el autor recomienda la versión Instruct. Su relevancia actual radica en que demuestra la viabilidad de entrenar modelos fundacionales desde cero en un idioma con recursos limitados, con un coste de entrenamiento moderado (una GPU H100) y con la posibilidad de ejecutarlo en hardware de consumo. El contexto máximo es de 2.048 tokens, una cifra modesta pero suficiente para muchas tareas de generación y análisis de texto en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM, decoder-only |
| Parametros totales | 505.350.400 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en BF16 safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama con 26 capas, dimensión oculta de 1.280, MLP de 3.584, 20 cabezas de atención y 5 cabezas KV (GQA), con dimensión de cabeza de 64. Usa activación SwiGLU (SiLU), normalización RMSNorm y embeddings de entrada y salida compartidos. El tokenizer es un SentencePiece Unigram de 32.000 piezas entrenado específicamente para coreano, lo que permite una representación más eficiente del idioma que los tokenizers multilingües.

El entrenamiento se realizó con el dataset `Infinity08/KAWK500M-Korean-Pretraining-10B` (revisión fijada), con una cantidad efectiva de 10.000.097.280 tokens, secuencias de 2.048 tokens y 81.381 pasos de optimización. Se usó precisión BF16 sobre una NVIDIA H100 SXM 80GB, con un throughput medio de aproximadamente 60.350 tokens por segundo. La loss final de entrenamiento fue 2,5441 y la loss de validación 2,52412, lo que equivale a una perplejidad de 12,48. No se emplearon datasets específicos de inglés, código o matemáticas como fuentes de entrenamiento separadas, aunque los documentos coreanos pueden contener elementos de esos dominios.

## Capacidades

- Generación de texto en coreano: el modelo produce texto coherente y gramaticalmente aceptable en coreano, dado que fue entrenado exclusivamente con datos de ese idioma.
- Modelado de lenguaje causal: funciona como predictor de siguiente token, útil para tareas de completado de texto, generación libre y análisis de probabilidades de secuencias.
- Fine-tuning posterior: al ser un modelo base, puede ser ajustado con SFT, DPO o RLHF para tareas específicas como clasificación, extracción de información o generación estructurada.
- Tokenizer coreano eficiente: el vocabulario de 32.000 piezas está optimizado para coreano, lo que reduce la fragmentación de tokens y mejora la eficiencia computacional en comparación con tokenizers multilingües.
- Sin capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito: el modelo no incluye estas funcionalidades por diseño.

## Casos de uso

- Investigación en eficiencia de modelos pequeños: sirve como banco de pruebas para estudiar cómo el tamaño del modelo, el tokenizer y la composición del dataset afectan al rendimiento en coreano, con un coste de entrenamiento y ejecución bajo.
- Fine-tuning para clasificación de texto en coreano: partiendo de este base model, se puede ajustar para tareas como análisis de sentimiento, categorización de documentos o detección de spam, con pocos recursos de cómputo.
- Generación de texto creativo en coreano: el modelo puede completar historias, poemas o artículos breves, aunque con limitaciones de coherencia a largo plazo por su contexto de 2.048 tokens.
- Prototipado rápido de aplicaciones de lenguaje: al ser ligero, permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta, ideal para validar ideas antes de escalar a modelos mayores.
- Educación y divulgación: útil para demostrar el proceso completo de preentrenamiento de un modelo de lenguaje desde cero, incluyendo tokenización, entrenamiento y evaluación, en cursos o talleres.
- Análisis de sesgos lingüísticos: al estar entrenado solo con datos coreanos, permite estudiar sesgos culturales y lingüísticos específicos de ese idioma, comparándolo con modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perplejidad de validación (12,48) y la loss final, pero no hay comparaciones con otros modelos en tareas estándar como MMLU, KMMLU, HellaSwag o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16, el modelo ocupa aproximadamente 1,01 GB (505M × 2 bytes). Añadiendo overhead de activaciones y memoria del runtime, se recomienda al menos 2-3 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU con suficiente RAM (unos 2-3 GB de RAM para el modelo).
- Compatibilidad con hardware de consumo: sí, es un modelo pequeño que cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: compatible con transformers (Hugging Face), vLLM, llama.cpp, Ollama y TGI, aunque para este tamaño las diferencias de rendimiento son menores.
- Latencia y throughput: no se han publicado mediciones específicas, pero en una GPU moderna (RTX 3060 o superior) se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos coreanos de tamaño similar (por ejemplo, PolyLM-1.7B, KoGPT-2, o modelos multilingües pequeños ajustados al coreano). El autor no ha publicado benchmarks comparativos, por lo que no es posible establecer una comparación objetiva en este momento. Se puede mencionar que el modelo KAWK-50M (del mismo autor) es una versión más pequeña, pero no se dispone de sus especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- Modelo base: no está diseñado para seguir instrucciones ni mantener conversaciones; para ello se debe usar la versión Instruct o realizar fine-tuning.
- Conocimiento y razonamiento limitados: con 505M parámetros, su capacidad de almacenar conocimiento factual y de realizar razonamiento complejo es muy inferior a la de modelos grandes.
- Contexto corto: la ventana de 2.048 tokens limita el manejo de documentos largos o conversaciones extensas.
- Sesgos y alucinaciones: al entrenarse con datos web, puede generar información falsa, repetitiva o sesgada. No se ha realizado una evaluación exhaustiva de seguridad ni de privacidad.
- Idioma: solo está entrenado con datos coreanos; aunque puede procesar algunos términos en inglés presentes en los documentos, su rendimiento en otros idiomas es muy limitado.
- Licencia: no se especifica una licencia, por lo que su uso comercial y redistribución están sujetos a incertidumbre legal. Se recomienda contactar al autor antes de utilizarlo en producción.
- Comparabilidad de perplejidad: al usar un tokenizer propio, no es válido comparar directamente la perplejidad por token con modelos que usan otros tokenizers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinity08/KAWK-1.5-500M-Korean-Base
- Dataset de preentrenamiento: https://huggingface.co/datasets/Infinity08/KAWK500M-Korean-Pretraining-10B
- Versión Instruct: https://huggingface.co/Infinity08/KAWK-500M-Korean-Instruct-v1
- Versión 50M: https://huggingface.co/Infinity08/KAWK-1.5-50M-Korean-Base
