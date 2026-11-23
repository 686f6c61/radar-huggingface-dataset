# AIEswatini/afriberta-siswati

## Resumen

AfriBERTa-siSwati es un ajuste fino del modelo AfriBERTa (Ogueji et al., 2021) para la lengua siSwati, hablada principalmente en el Reino de Eswatini. Lo desarrolla AI Eswatini mediante preentrenamiento continuado con objetivo de modelado de lenguaje enmascarado (MLM) sobre el corpus bilingüe SADILAR EN-SS v1.0.3. El modelo parte de la base `castorini/afriberta_large` y hereda su arquitectura XLM-RoBERTa, con 125.702.518 parámetros totales.

La relevancia del modelo reside en su especialización lingüística: siSwati es una lengua de bajos recursos y la mayoría de los modelos multilingües generalistas tienen un rendimiento pobre en ella. El autor reporta una reducción de perplejidad del 84,8 % frente a mBERT en el corpus de validación, lo que lo convierte en una base útil para tareas de comprensión del lenguaje en siSwati (clasificación, NER, análisis de sentimiento) mediante ajuste fino posterior.

Se trata de un modelo exclusivamente encoder, orientado a representaciones y clasificación, no a generación de texto libre. El repositorio ocupa 0,5 GB y se distribuye en formato safetensors. La información pública disponible es limitada: no consta licencia, idiomas declarados ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), preentrenamiento MLM |
| Parametros totales | 125.702.518 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa admite hasta 512 tokens, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | siSwati (objetivo del ajuste fino); no se declaran idiomas adicionales en la ficha |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo XLM-RoBERTa, la arquitectura del checkpoint base `castorini/afriberta_large`. Se ha sometido a preentrenamiento continuado con MLM sobre el corpus SADILAR EN-SS Bilingual Corpus v1.0.3, compuesto por 114.839 pares paralelos inglés-siSwati y 1.423.414 palabras en siSwati, con licencia CC BY 4.0. La configuración de entrenamiento reportada es de 10 épocas, batch size 32, learning rate 2e-5, sobre una GPU Tesla T4 de 15,6 GB en Kaggle, con un tiempo aproximado de 5 horas.

No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo encoder de este tipo. Tampoco se detalla la composición completa del dataset ni el número total de tokens procesados. El autor reporta ausencia de sobreajuste, con una brecha máxima entrenamiento-validación de 0,365 en la pérdida.

## Capacidades

- Representaciones contextuales de texto en siSwati, adecuadas como base para ajuste fino supervisado.
- Relleno de máscaras (masked language modelling) sobre texto en siSwati.
- Extracción de embeddings para clasificación de texto, análisis de sentimiento, detección de temas y tareas similares.
- Soporte potencial para NER y etiquetado de secuencias tras ajuste fino específico.
- Capacidad de transferencia desde el conocimiento multilingüe del checkpoint base AfriBERTa.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al par inglés-siSwati del corpus de entrenamiento; no se declaran otros idiomas.

## Casos de uso

- Clasificación de textos en siSwati: ajuste fino de una cabeza de clasificación sobre las representaciones del encoder para categorizar noticias, documentos administrativos o mensajes de usuarios en siSwati, aprovechando que el modelo ya ha visto 1,4 millones de palabras en esa lengua.
- Análisis de sentimiento en redes sociales y foros: el modelo sirve como extractor de features para un clasificador supervisado entrenado con un conjunto etiquetado reducido, algo viable gracias a la especialización lingüística del encoder.
- Reconocimiento de entidades nombradas (NER): ajuste fino con etiquetas BIO para extraer nombres de personas, lugares y organizaciones en textos en siSwati, útil en pipelines de digitalización de documentos.
- Búsqueda semántica y recuperación de información: generación de embeddings de frases en siSwati para indexar y recuperar documentos en un motor de búsqueda vectorial, con la ventaja de que el modelo entiende la morfología de la lengua.
- Filtrado y moderación de contenido: clasificación de mensajes en siSwati para detectar spam, discurso de odio o contenido inapropiado en plataformas locales, mediante un clasificador ajustado sobre el encoder.
- Investigación lingüística y preservación del idioma: uso del modelo para estudiar representaciones y patrones léxicos del siSwati, así como base para experimentos de transferencia en lenguas bantúes de bajos recursos.
- Etiquetado de corpus y anotación asistida: preanotación de grandes volúmenes de texto en siSwati para acelerar la creación de datasets etiquetados por anotadores humanos.

## Benchmarks y rendimiento

| Modelo | Perplejidad |
|---|---|
| mBERT (baseline) | 47,83 |
| AfriBERTa (sin ajuste fino) | 35,59 |
| AfriBERTa-siSwati (este modelo) | 7,27 |

El autor reporta una reducción de perplejidad del 84,8 % frente a mBERT y del 42,9 % en la pérdida, sin sobreajuste detectado (brecha máxima entrenamiento-validación de 0,365). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no son aplicables a un modelo encoder de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB de pesos; en fp16, unos 0,25 GB. Con overhead de activaciones, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para entrenamiento o ajuste fino se recomienda al menos una T4, RTX 3090 o A100 según el tamaño del batch.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más, incluidas GTX 1650 o RTX 3050.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript; también es posible exportarlo a GGUF para llama.cpp aunque no es el flujo habitual para encoders.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (125 M de parámetros) se espera un throughput alto en GPU, del orden de miles de secuencias cortas por segundo en una A100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriBERTa-siSwati | 125,7 M | no disponible (hasta 512 en XLM-R) | Encoder MLM especializado en siSwati | no disponible | Hugging Face |
| AfriBERTa (castorini/afriberta_large) | ~125 M | 512 | Encoder MLM multilingüe africano | no disponible | Hugging Face |
| mBERT | ~178 M | 512 | Encoder MLM multilingüe generalista | Apache 2.0 (según el modelo original de Google) | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 | Encoder MLM multilingüe | MIT (según el modelo original de Facebook) | Hugging Face |

La comparación de rendimiento solo está disponible en perplejidad sobre el corpus de validación del autor: 7,27 frente a 35,59 de AfriBERTa sin ajuste y 47,83 de mBERT. No hay datos comparativos en tareas downstream como NER o clasificación.

## Limitaciones y advertencias

- La ficha de Hugging Face no declara licencia, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de usarlo en producción.
- El modelo se ha entrenado únicamente sobre el corpus SADILAR EN-SS, de dominio y temática limitados; puede tener un rendimiento deficiente en registros coloquiales, técnicos o dialectales no representados.
- Riesgo de sesgos derivados de la fuente del corpus (textos institucionales y paralelos), que pueden no reflejar la diversidad lingüística real del siSwati.
- Al ser un encoder MLM, no genera texto coherente ni mantiene conversaciones; no debe emplearse para tareas generativas.
- La longitud de contexto no está confirmada en la ficha; se asume la del checkpoint base, pero no se ha verificado.
- La información de entrenamiento es escasa (no se detalla la composición completa del dataset ni el número de tokens), lo que dificulta evaluar la cobertura lingüística.
- El modelo se ha entrenado en una única GPU T4 durante 5 horas, lo que limita la escala del ajuste fino y puede dejar margen de mejora con más datos o cómputo.
- No se han publicado evaluaciones en tareas downstream ni comparaciones con otros modelos especializados en siSwati.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIEswatini/afriberta-siswati
- Referencia del modelo base AfriBERTa (Ogueji et al., 2021): https://huggingface.co/castorini/afriberta_large
- Corpus SADILAR EN-SS Bilingual Corpus v1.0.3: no disponible en la información proporcionada
- Paper de AfriBERTa: no disponible en la información proporcionada
- Repositorio o demo de AI Eswatini: no disponible en la información proporcionada
