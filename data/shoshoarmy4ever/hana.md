# Shoshoarmy4ever/Hana

## Resumen

Hana es un modelo publicado en Hugging Face por el usuario Shoshoarmy4ever bajo licencia Apache 2.0. Se presenta como un merge (fusión) de pesos que combina once modelos base muy dispares: desde modelos de lenguaje como GLM-5.3 o DeepSeek-V4.1-Flash-1017, hasta modelos de imagen como FLUX-3-image-klein o LTX-2.5, pasando por variantes cuantizadas de la familia Qwen3.8 y un modelo de embeddings (embeddinggemma-2). La librería declarada es Keras, lo que resulta atípico para un modelo de este tipo.

La model card no aporta información técnica sustantiva: no se especifican arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. Los metadatos incluyen una lista desproporcionada de métricas (BLEU, ROUGE, BERTScore, perplexity, WER, etc.) y etiquetas temáticas muy diversas (biología, legal, finanzas, música, clima, código, medicina), lo que sugiere una ficha generada de forma automática o experimental más que un modelo con documentación rigurosa.

Por su naturaleza de merge multiformato y la ausencia de benchmarks, Hana debe tratarse con cautela: es relevante únicamente como curiosidad técnica o para experimentación, no como un modelo listo para producción. La ficha siguiente refleja exclusivamente lo que puede verificarse en los metadatos disponibles, marcando como «no disponible» todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta «moe» presente, sin confirmar) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los modelos base incluyen variantes GGUF) |
| Idiomas soportados | en, ja, ko, tr, zh, th, fr, es, it, el, id, hi, ar, de |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: Keras) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La etiqueta «moe» aparece en los tags, lo que podría indicar una mezcla de expertos, pero no hay confirmación en la model card ni detalles sobre capas, dimensiones ocultas o mecanismo de atención. La librería declarada es Keras, aunque los modelos base incluyen pesos en formato GGUF, lo que apunta a una fusión heterogénea de artefactos de distinta procedencia.

El modelo se describe como un merge de once modelos base: Lightricks/LTX-2.5, black-forest-labs/flux-3-image-klein (y su variante comfy), zai-org/GLM-5.3, deepseek-ai/DeepSeek-V4.1-Flash-1017, abenzerps/Qwen-Image-2.1-Uncensored-Quantized, google/embeddinggemma-2, DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF, ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF y prism-ml/Ternary-Bonsai-2-27B-gguf. No se documenta el proceso de fusión (mergekit u otro), ni el número de tokens de entrenamiento, ni si hubo RLHF o DPO. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: la etiqueta «text-generation-inference» sugiere soporte para inferencia de texto, aunque no se detalla el pipeline.
- Código: la etiqueta «code» está presente, pero sin benchmarks ni ejemplos que lo respalden.
- Dominios temáticos declarados: biología, legal, finanzas, arte, música, medicina, química y clima (etiquetas del autor, sin validación).
- Multilingüismo: catorce idiomas declarados en los metadatos (en, ja, ko, tr, zh, th, fr, es, it, el, id, hi, ar, de).
- Contenido para adultos: la etiqueta «not-for-all-audiences» indica que el modelo puede generar contenido no apto para todo público.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible; la presencia de modelos de imagen entre los base no implica que Hana procese imágenes.

## Casos de uso

- Experimentación con técnicas de merge: el modelo puede servir para estudiar cómo se comporta la fusión de pesos de arquitecturas y dominios tan dispares; útil en investigación sobre mergekit y sus límites.
- Análisis de robustez de metadatos: útil para quienes investigan la calidad de las model cards y la trazabilidad de modelos publicados en Hugging Face.
- Pruebas de inferencia en Keras: al declarar esa librería, puede emplearse para validar pipelines de carga de pesos en el ecosistema Keras/TensorFlow.
- Generación de texto multilingüe exploratoria: con catorce idiomas declarados, permite probar la coherencia lingüística de un merge, aunque sin garantías de calidad.
- Evaluación comparativa de merges: puede utilizarse como caso de estudio frente a los modelos base originales para medir degradación o mejora.
- Docencia y divulgación: ejemplo práctico de los riesgos de publicar modelos sin documentación técnica ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card lista decenas de métricas (BLEU, ROUGE, BERTScore, perplexity, WER, MCC, etc.) pero no incluye valores numéricos ni conjuntos de evaluación asociados, por lo que no es posible presentar una tabla de resultados.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamaño real del merge, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es Keras; los modelos base incluyen variantes GGUF, pero no se confirma que Hana se distribuya en ese formato. No hay instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hana | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| GLM-5.3 (base) | no disponible | no disponible | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.8-27B (base) | 27B (según nombre) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay arquitectura, parámetros, contexto ni proceso de entrenamiento descritos.
- Sin benchmarks: imposible evaluar calidad, sesgos o alucinación de forma objetiva.
- Merge heterogéneo: combina modelos de texto, imagen y embeddings, lo que puede producir pesos incoherentes o comportamiento impredecible.
- Etiqueta «not-for-all-audiences»: puede generar contenido inapropiado; requiere filtrado en producción.
- Idiomas declarados sin validación: catorce idiomas en metadatos no garantizan calidad en ninguno de ellos.
- Cero descargas y cero likes: sin evidencia de uso comunitario ni validación externa.
- Licencia Apache 2.0 declarada, pero la procedencia de los pesos base (algunos con etiquetas «uncensored» o «heretic») puede plantear dudas sobre la compatibilidad de licencias en un uso comercial.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/Shoshoarmy4ever/Hana
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base black-forest-labs/flux-3-image-klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base zai-org/GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base google/embeddinggemma-2: https://huggingface.co/google/embeddinggemma-2
- Modelo base prism-ml/Ternary-Bonsai-2-27B-gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
