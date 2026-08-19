# mytranslatenisa/m2m100_en_ms_FineTuned

## Resumen

m2m100_en_ms_FineTuned es un modelo de traducción automática neuronal (NMT) desarrollado por el usuario mytranslatenisa, resultado de un ajuste fino (fine-tuning) del modelo base facebook/m2m100_418M de Meta AI. Está especializado en la traducción de textos legales del inglés al malayo, aunque al estar basado en M2M100 conserva la arquitectura multilingüe original que soporta decenas de idiomas. El modelo se distribuye con licencia MIT, lo que facilita su integración comercial y académica.

El ajuste fino se realizó sobre un dataset legal no especificado en detalle, con 3 épocas, una tasa de aprendizaje de 2e-05 y precisión mixta. Con 483,9 millones de parámetros, es un modelo relativamente ligero que puede ejecutarse en GPUs de consumo. Su relevancia radica en ofrecer una alternativa especializada para el par inglés-malayo, un dominio con pocos modelos dedicados, especialmente en el ámbito jurídico donde la terminología precisa es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M100) |
| Parametros totales | 483.905.536 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificada (M2M100 base soporta secuencias de hasta 1024 tokens) |
| Tipos de cuantizacion | no especificados (pesos en safetensors; compatible con cuantización GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | inglés (en), malayo (ms) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en M2M100, un Transformer encoder-decoder de 12 capas en cada bloque, diseñado por Meta AI para traducción multilingüe directa entre 100 idiomas sin pasar por el inglés como puente. La arquitectura emplea atención de múltiples cabezas estándar y embeddings de idioma compartidos, lo que permite al modelo adaptarse a pares de idiomas específicos mediante ajuste fino. El fine-tuning se realizó sobre un dataset legal no especificado, con los siguientes hiperparámetros: learning rate de 2e-05, batch size de 4 (8 con acumulación de gradientes en 2 pasos), optimizador AdamW, scheduler lineal y 3 épocas, usando precisión mixta nativa (AMP). No se detalla el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Traducción automática de textos legales del inglés al malayo, con terminología jurídica especializada.
- Traducción inversa (malayo a inglés) posible gracias a la naturaleza bidireccional de M2M100, aunque el ajuste fino se enfocó en el par en-ms.
- Generación de texto en formato secuencia a secuencia, adecuado para documentos extensos con contexto limitado.
- Soporte multilingüe residual del modelo base: aunque el fine-tuning se centró en en-ms, el modelo conserva la capacidad de traducir entre otros idiomas si se le indica el token de idioma adecuado.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de traducción.
- No incluye capacidades de visión ni audio; es texto a texto.

## Casos de uso

- Traducción de contratos y acuerdos legales: el modelo puede traducir cláusulas contractuales del inglés al malayo, reduciendo el tiempo de revisión manual en despachos que operan en ambos idiomas.
- Localización de documentos normativos: útil para traducir regulaciones, leyes o políticas corporativas para su publicación en Malasia o para empresas malayas que necesitan versiones en inglés.
- Soporte a equipos jurídicos multilingües: integrado en herramientas de gestión documental, permite a abogados malayos consultar jurisprudencia inglesa y viceversa.
- Preprocesamiento de datos para sistemas de recuperación de información legal: traduce consultas y documentos para alimentar motores de búsqueda especializados.
- Educación y formación legal: traducción de materiales académicos o manuales de derecho para estudiantes de habla malaya.
- Traducción de correspondencia oficial: correos electrónicos, memorandos o comunicaciones entre instituciones que usan inglés y malayo, con un nivel de formalidad adecuado al dominio legal.
- Integración en pipelines de traducción automática: como componente de un sistema más amplio que combine varios modelos para cubrir múltiples pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo-index de la model card declara una lista de resultados vacía, por lo que no es posible comparar métricas como BLEU o chrF con otros sistemas de traducción.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB en fp16 y 0,8-1 GB en int8 para inferencia, dado el tamaño de 483,9 millones de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. También funciona en CPU para inferencia de baja latencia con cuantización.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja o en Mac con Apple Silicon mediante llama.cpp.
- Opciones de despliegue: transformers (Python), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa), ONNX Runtime.
- Latencia y throughput estimados: en una RTX 3090, la generación de una frase de 50 tokens típicamente tarda menos de 100 ms; en CPU, puede superar los 500 ms. No hay datos oficiales del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mytranslatenisa/m2m100_en_ms_FineTuned | 483,9 M | ~1024 | en-ms (especializado) | MIT | Fine-tune legal sobre M2M100 |
| facebook/m2m100_418M | 418 M | ~1024 | 100 idiomas | MIT | Modelo base, no especializado |
| Helsinki-NLP/opus-mt-en-ms | ~70 M | 512 | en-ms | Apache 2.0 | Modelo compacto, menor calidad en textos largos |
| facebook/nllb-200-distilled-600M | 600 M | 1024 | 200 idiomas | CC-BY-NC 4.0 | No permite uso comercial sin licencia |

La comparativa muestra que el modelo fine-tuneado ofrece una ventaja sobre el base en el dominio legal, pero carece de benchmarks que lo demuestren cuantitativamente. NLLB es más grande y cubre más idiomas, pero su licencia restringe el uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de entrenamiento es legal y no se ha auditado; puede reflejar sesgos del dominio jurídico original (por ejemplo, lenguaje de género o terminología específica de ciertas jurisdicciones).
- Riesgo de alucinación: como todo modelo de traducción, puede generar frases gramaticalmente correctas pero semánticamente incorrectas, especialmente con terminología legal ambigua o poco frecuente.
- Limitaciones de contexto: la ventana de 1024 tokens del modelo base limita la traducción de documentos largos; es necesario segmentar el texto.
- Cobertura idiomática: aunque el modelo base soporta muchos idiomas, el fine-tuning se centró en en-ms; el rendimiento en otros pares puede degradarse.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base M2M100 también es MIT, por lo que no hay restricciones adicionales.
- Caveat de producción: no se han publicado métricas de calidad; se recomienda evaluar el modelo en un corpus de validación propio antes de usarlo en entornos críticos.
- El tamaño del repositorio (1759,4 GB) es inusualmente grande para un modelo de 484 M de parámetros; podría contener archivos de entrenamiento o versiones múltiples, lo que puede dificultar la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mylatinenisa/m2m100_en_ms_FineTuned (enlace según el ID proporcionado)
- Modelo base M2M100: https://huggingface.co/facebook/m2m100_418M
- Paper de M2M100: "Beyond English-Centric Multilingual Machine Translation" (arXiv:2010.11125)
- Documentación de Transformers para M2M100: https://huggingface.co/docs/transformers/model_doc/m2m_100
