# gauthierrobert2/guard-ft-v19-trimmed-fp16

## Resumen

`gauthierrobert2/guard-ft-v19-trimmed-fp16` es un clasificador de tokens (token-classification) especializado en la detección de información personal identificable (PII) en documentos legales en inglés y francés. Es la iteración 19 de la serie GUARD-FT del autor gauthierrobert2, construida sobre el modelo base `FacebookAI/xlm-roberta-large` y afinada con un corpus de documentos legales (AgentDocs) en EN+FR. El modelo etiqueta entidades como PERSON, ORG, PUBLIC_BODY, ROLE, ADDRESS, PLACE, DOB y CONTACT bajo un esquema BIO.

La versión `trimmed-fp16` reduce el vocabulario de las 250 002 piezas originales a 53 751 (las que realmente usa el corpus de entrenamiento), fusiona capas de atención y normalización mediante el optimizador de ONNX Runtime, y convierte los pesos a fp16 para reducir el tamaño del repositorio de ~1,4 GB (fp32) a ~716 MB (fp16). La entrada y salida del grafo se mantienen en float32/int64 para preservar la compatibilidad. El autor verifica que las predicciones son prácticamente idénticas a las de la versión fp32 en una evaluación de 259 documentos, tanto en CPU como en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabecera de clasificación de tokens |
| Parametros totales | no disponible (modelo base: xlm-roberta-large, ~560 M según arquitectura, no confirmado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (existe variante int8 para CPU: `guard-ft-v19-trimmed-int8`) |
| Idiomas soportados | inglés y francés (según corpus de entrenamiento; campo oficial: no disponible) |
| Licencia | no disponible |
| Formato de pesos | ONNX (grafo fp16, entrada/salida float32/int64) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un transformer encoder multilingüe con atención bidireccional. Sobre esta base se añade una cabecera de clasificación de tokens que predice una etiqueta BIO para cada token, con 9 etiquetas: PERSON, ORG, PUBLIC_BODY, ROLE, ADDRESS, PLACE, DOB y CONTACT. El entrenamiento corresponde a la iteración 19 de la serie GUARD-FT, realizada sobre un corpus de documentos legales en inglés y francés (denominado AgentDocs). No se aportan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

La versión `trimmed-fp16` introduce tres optimizaciones técnicas: el vocabulario se recorta de 250 002 a 53 512 piezas (las que el corpus EN+FR realmente utiliza), las capas de atención, normalización y activación (SkipLayerNormalization, BiasGelu) se fusionan mediante `onnxruntime.transformers.optimizer`, y los pesos se convierten a fp16. La conversión se realiza después de la fusión, lo que corrige un problema previo de carga en CPU con ONNX Runtime 1.24.1. El modelo mantiene el mismo checkpoint y las mismas predicciones que la versión fp32 en GPU y CPU.

## Capacidades

- Detección de entidades nombradas (NER) de tipo PII: PERSON, ORG, PUBLIC_BODY, ROLE, ADDRESS, PLACE, DOB y CONTACT, con esquema BIO.
- Clasificación token a token, adecuada para pipelines de anonimización y redacción de documentos.
- Soporte multilingüe limitado a inglés y francés (según el corpus de entrenamiento).
- Exportado a ONNX en fp16, lo que permite inferencia tanto en CPU como en GPU con ONNX Runtime.
- Compatible con el execution provider de CUDA (más rápido, ~1.7x el throughput del clasificador en CPU) y con CPU (correcto pero sin aceleración fp16 nativa).

## Casos de uso

- Anonimización de expedientes legales: el modelo puede identificar automáticamente nombres de personas, direcciones, fechas de nacimiento y datos de contacto en contratos y sentencias, permitiendo redactarlos antes de publicarlos.
- Cumplimiento normativo (GDPR, RGPD): integración en pipelines de procesamiento de documentos para detectar y enmascarar datos personales antes de su almacenamiento o transferencia.
- Preparación de datasets de entrenamiento: limpieza de corpus textuales de datos personales antes de usarlos para entrenar otros modelos de IA.
- Búsqueda y recuperación de información: extracción de entidades de documentos legales para indexar y facilitar búsquedas por persona, organización o ubicación.
- Auditoría de datos: escaneo de bases de datos documentales para localizar registros que contengan PII y verificar su conformidad.
- Asistencia a profesionales jurídicos: resaltado automático de entidades en documentos para revisión manual rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor reporta una evaluación interna sobre un corpus de 259 documentos: en la etapa 3 del pipeline de enmascaramiento, las predicciones coinciden de forma idéntica con la versión fp32, y la métrica F2 se mantiene dentro de 0.01 puntos. No se proporcionan más detalles sobre el rendimiento en tareas genéricas de lenguaje.

## Requisitos de hardware

- Tamaño del repositorio: 1.4 GB en fp32, ~716 MB en fp16 (pesos del modelo).
- Inferencia en GPU: requiere una GPU con al menos 1 GB de VRAM para el modelo en fp16 (suficiente para una tarjeta consumer como RTX 2060 o superior). La ejecución con CUDA es el camino rápido, con un throughput de clasificación de tokens aproximadamente 1.7 veces mayor que en CPU.
- Inferencia en CPU: funciona correctamente con ONNX Runtime 1.24.1 (execution provider CPU, `ORT_ENABLE_ALL`), pero no es más rápida que la versión fp32 porque ONNX Runtime tiene kernels fp16 nativos limitados en CPU. Para CPU se recomienda la variante int8 (`guard-ft-v19-trimmed-int8`).
- Despliegue: compatible con ONNX Runtime (CUDA o CPU). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El modelo es una variante de XLM-RoBERTa-large, por lo que podría compararse con otros NER basados en el mismo encoder, pero no se han proporcionado datos concretos de rendimiento ni de configuraciones alternativas.

## Limitaciones y advertencias

- La licencia del modelo no está disponible, lo que impide conocer las restricciones para uso comercial.
- No se han publicado datos sobre sesgos del modelo ni sobre su comportamiento con textos fuera del dominio legal o fuera de los idiomas EN+FR.
- El vocabulario se ha recortado a las piezas usadas en el corpus de entrenamiento; esto puede reducir la capacidad de generalizar a otros idiomas o dominios.
- La longitud de contexto no se ha especificado; al estar basado en XLM-RoBERTa-large, es probable que herede el límite de 512 tokens, pero no está confirmado.
- No hay información sobre el dataset de entrenamiento ni sobre la metodología de evaluación, por lo que la robustez del modelo en producción no está contrastada externamente.
- El modelo solo realiza clasificación de tokens (NER); no es un generador de texto ni soporta tool calling ni razonamiento multi-paso.

## Enlaces

- [HuggingFace: gauthierrobert2/guard-ft-v19-trimmed-fp16](https://huggingface.co/gauthierrobert2/guard-ft-v19-trimmed-fp16)
- [Modelo base: FacebookAI/xlm-roberta-large](https://huggingface.co/FacebookAI/xlm-roberta-large)
- [ONNX Runtime](https://onnxruntime.ai/) (mencionado en la documentación para la optimización y ejecución)
