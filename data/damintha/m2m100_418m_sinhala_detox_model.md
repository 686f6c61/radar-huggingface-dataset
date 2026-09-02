# damintha/m2m100_418M_sinhala_detox_model

## Resumen

El modelo `damintha/m2m100_418M_sinhala_detox_model` es un ajuste fino (fine-tune) del modelo multilingüe de traducción M2M100 de Facebook, especializado en la detoxificación de texto en sinhala. El objetivo es transformar contenido tóxico o inapropiado en lenguaje neutral o seguro, manteniendo el sentido original. Está desarrollado por el usuario `damintha` y publicado en Hugging Face con licencia no especificada.

El modelo base M2M100 es un transformer encoder-decoder con 418 millones de parámetros (aunque el archivo safetensors de este fine-tune muestra 611 millones, posiblemente por la inclusión de embeddings o capas adicionales). Soporta traducción directa entre 100 idiomas y 9.900 direcciones, pero este fine-tune se centra en sinhala. La arquitectura es la misma que la del modelo original, con una ventana de contexto limitada (típicamente 1024 tokens en M2M100, aunque no se confirma en la documentación del fine-tune).

La relevancia de este modelo radica en su aplicación para moderación de contenido y limpieza de datasets en sinhala, un idioma con pocos recursos y escasas herramientas de procesamiento de lenguaje natural. Al estar basado en M2M100, hereda su capacidad multilingüe, aunque el fine-tune probablemente reduce su rendimiento en otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M100 (transformer encoder-decoder) |
| Parametros totales | 611.129.542 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base M2M100 usa 1024 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el fine-tune está orientado a sinhala; el base soporta 100 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en M2M100, una arquitectura transformer encoder-decoder diseñada para traducción multilingüe many-to-many. El modelo original fue entrenado con 7.500 millones de pares de oraciones paralelas en 100 idiomas, usando un vocabulario compartido de 128.000 tokens y una técnica de *language token* para indicar el idioma de origen y destino. El fine-tune para detoxificación en sinhala no tiene documentación pública sobre el dataset, el procedimiento de entrenamiento ni los hiperparámetros utilizados. Se desconoce si se empleó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Detoxificación de texto en sinhala: transforma lenguaje tóxico, ofensivo o inapropiado en versiones neutrales o seguras.
- Traducción multilingüe (heredada del modelo base, aunque probablemente degradada por el fine-tune): puede traducir entre 100 idiomas si se usa con los tokens de idioma adecuados.
- Generación de texto condicionada: al ser un modelo seq2seq, puede generar texto a partir de una entrada, pero su uso principal es la transformación de contenido.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo puede procesar comentarios en sinhala y reemplazar insultos o lenguaje dañino por alternativas respetuosas, facilitando la moderación automática en plataformas locales.
- Limpieza de datasets para entrenamiento de otros modelos: antes de usar corpus en sinhala para entrenar LLMs, se puede aplicar este modelo para eliminar o neutralizar contenido tóxico, mejorando la calidad de los datos.
- Filtrado de contenido en foros y comunidades online: integrado en un pipeline de preprocesamiento, puede detectar y reescribir mensajes problemáticos en tiempo real.
- Traducción de contenido sensible: si se combina con el modelo base, podría traducir texto tóxico de otros idiomas al sinhala y luego detoxificarlo, aunque esto no está documentado.
- Asistencia a moderadores humanos: el modelo puede sugerir versiones neutrales de mensajes ofensivos, reduciendo la carga de trabajo de los equipos de moderación.
- Investigación académica sobre detoxificación en idiomas de bajos recursos: sirve como punto de partida para estudiar técnicas de alineación en sinhala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como BLEU, precisión de detoxificación o comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 611 millones de parámetros, en fp16 se necesitan aproximadamente 1,2 GB solo para los pesos, más overhead de activaciones y memoria intermedia. En fp32, unos 2,4 GB. Una GPU con 4 GB de VRAM sería suficiente para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Si cabe en consumer GPU: sí, en GPUs de gama media como RTX 3060 o superiores.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También se puede exportar a ONNX o convertir a GGUF para usar con llama.cpp u Ollama, aunque no hay conversiones oficiales.
- Latencia y throughput: no disponible. Se estima que en una GPU moderna (RTX 3090) la generación de una secuencia de 100 tokens tardaría menos de 1 segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| damintha/m2m100_418M_sinhala_detox_model | 611M | no disponible | sinhala (fine-tune) | no disponible | Detoxificación en sinhala |
| facebook/m2m100_418M | 418M | 1024 | 100 | MIT | Traducción multilingüe |
| Helsinki-NLP/opus-mt-si-en | ~70M | 512 | sinhala-inglés | CC-BY-4.0 | Traducción sinhala-inglés |

El modelo base M2M100 es la referencia directa, pero no está especializado en detoxificación. El modelo de Helsinki es mucho más pequeño y solo cubre un par de idiomas. No hay modelos comparables específicos para detoxificación en sinhala en el ecosistema abierto.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen los sesgos potenciales. Es probable que el modelo herede sesgos del corpus de M2M100 y del conjunto de datos de fine-tune.
- Riesgo de alucinación: al ser un modelo de traducción/transformación, puede generar texto incoherente o cambiar el significado original si la entrada es muy compleja o ambigua.
- Limitaciones de contexto: la ventana de contexto es limitada (probablemente 1024 tokens), por lo que no es adecuado para procesar documentos largos de una sola vez.
- Restricciones de licencia: al no especificarse licencia, el uso comercial es incierto. Se recomienda contactar al autor antes de usarlo en producción.
- El fine-tune puede haber degradado el rendimiento en otros idiomas, por lo que no se recomienda usarlo para traducción general.
- No se ha verificado su robustez frente a ataques adversariales o lenguaje ofensivo encubierto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/damintha/m2m100_418M_sinhala_detox_model)
- [Modelo base M2M100 418M](https://huggingface.co/facebook/m2m100_418M)
- [Documentación de M2M100 en Transformers](https://huggingface.co/docs/transformers/model_doc/m2m_100)
- [Código fuente de la documentación en GitHub](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/m2m_100.md)
- [Ficha del modelo en ModelScope](https://www.modelscope.cn/models/facebook/m2m100_418M)
- [Análisis del modelo en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/m2m100418m-facebook)
