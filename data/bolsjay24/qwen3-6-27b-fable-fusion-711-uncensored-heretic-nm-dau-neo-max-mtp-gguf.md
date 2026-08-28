# Bolsjay24/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un ajuste fino de multiples etapas sobre el modelo base Qwen3.6-27B, desarrollado por DavidAU en colaboracion con Nightmedia, TeichAI, armand0e y trohrbaugh. El modelo combina tecnicas de fine-tuning, merges multi-etapa y datasets propios (Polar-STRICT, F451-STRICT) para mejorar la inteligencia general, el razonamiento y el seguimiento de instrucciones sin degradar las capacidades originales del modelo base. Su principal reclamo es haber superado la barrera de 700 puntos en el benchmark ARC-C tanto en cuantizacion de 8 bits como de 4 bits, un hito que hasta ahora solo habian alcanzado modelos propietarios cerrados como los de OpenAI, Claude o Gemini.

El modelo tiene 26.895.998.464 parametros (27B) y se distribuye exclusivamente en formato GGUF, con cuantizaciones NEO IMATRIX y variantes MTP (multi-token prediction). Incluye soporte de vision (image-text-to-text) y esta pensado para ejecutarse en hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Los idiomas soportados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.6, sin detalles publicos adicionales) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF NEO IMATRIX (8-bit, 4-bit y otras), MTP GGUF, output tensor en 16-bit |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer denso de 27.000 millones de parametros. Sobre esta base se aplico un proceso de ajuste en multiples etapas que combina varios fine-tunes, merges y datasets especificos. Los datasets utilizados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, junto con trazas de razonamiento de Claude Opus y GPT-5 (Polaris, no razonamiento). El autor indica que se realizaron pruebas previas en modelos Qwen 3.5 de 9B y 27B para validar la metodologia antes de aplicarla al modelo final.

Una caracteristica destacada es el "heretic" o "uncensored", que implica un proceso de abliteracion previo al fine-tuning para eliminar ciertas restricciones de seguridad del modelo base. Ademas, las cuantizaciones NEO IMATRIX mejoran la precision de los pesos cuantizados entre un 2-4% respecto a GGUF estandar, y el tensor de salida se mantiene en precision completa de 16 bits. Las variantes MTP (multi-token prediction) permiten predecir varios tokens a la vez, lo que acelera la inferencia.

## Capacidades

- Generacion de texto y razonamiento avanzado, con modo de pensamiento (thinking) integrado.
- Escritura creativa de alta calidad: narrativa, ficcion, roleplaying y todos los generos literarios.
- Generacion de codigo y soporte para tareas de programacion.
- Capacidades de vision: acepta entradas de imagen y texto (image-text-to-text).
- Razonamiento multi-paso y seguimiento de instrucciones mejorado respecto al modelo base.
- Multilingue limitado a ingles y chino.
- Modelo "uncensored" (abliterado) que reduce las restricciones de contenido, aunque esto conlleva riesgos.
- Compatible con herramientas de inferencia como llama.cpp, Ollama y vLLM gracias al formato GGUF.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede generar, revisar y explicar codigo en multiples lenguajes, integrarse en IDEs o pipelines de CI/CD para autocompletado y revision de cambios.
- Escritura creativa y narrativa: adecuado para autores que necesitan generar dialogos, tramas o descripciones con un estilo literario rico, gracias a su entrenamiento en datasets de ficcion y roleplaying.
- Analisis de documentos con vision: al aceptar imagenes, puede extraer informacion de capturas, diagramas o documentos escaneados y razonar sobre ellos.
- Chatbots de atencion al cliente con tono personalizado: su capacidad de seguir instrucciones y mantener conversaciones coherentes lo hace util para sistemas de soporte, aunque requiere supervision por su naturaleza "uncensored".
- Investigacion y razonamiento cientifico: puede ayudar a estructurar hipotesis, resumir articulos y razonar sobre problemas complejos, superando al modelo base en benchmarks de inteligencia general.
- Prototipado rapido de agentes conversacionales: su licencia Apache 2.0 y su compatibilidad con GGUF permiten desplegarlo en entornos locales o en la nube sin costes de licencia.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el benchmark ARC-C (AI Reasoning Capability Composite), comparando con el modelo base y con Qwen3.6-35B-A3B:

| Modelo | ARC-C (8-bit) | ARC-C (4-bit) |
|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este modelo) | 0.711 | 0.701 |
| Qwen3.6-27B (base) | no disponible | no disponible |
| Qwen3.6-35B-A3B | no disponible | no disponible |

Segun la model card, este modelo supera al base Qwen3.6-27B en 6 de 7 benchmarks y lo iguala en el septimo, y supera los 7 benchmarks de Qwen3.6-35B-A3B. No se han publicado los valores numericos de los otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en cuantizacion 4-bit, el modelo ocupa aproximadamente 14-16 GB, por lo que cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080 (24 GB o 16 GB). En 8-bit, el uso de VRAM ronda los 28-32 GB, requiriendo GPUs profesionales como A6000, A100 o multiples GPUs.
- GPU recomendadas: RTX 4090 (24 GB) para 4-bit, A100 40/80 GB o H100 para 8-bit y contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (Text Generation Inference) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado datos concretos. En una RTX 4090 con 4-bit, se puede esperar una generacion de 20-40 tokens por segundo, dependiendo del contexto y del uso de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | ARC-C |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 27B | no disponible | Apache 2.0 | GGUF | 0.711 (8-bit) |
| Qwen3.6-27B (base) | 27B | no disponible | Apache 2.0 | safetensors | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | Apache 2.0 | safetensors | no disponible |

El modelo se posiciona como una alternativa de 27B con mejor rendimiento que el base y que el 35B-A3B, segun los datos del autor. No se dispone de comparaciones con otros modelos de tamano similar como Llama 3.1 70B o Mistral Large, por lo que la comparativa queda limitada a la familia Qwen.

## Limitaciones y advertencias

- El modelo es "uncensored" y "abliterated", lo que significa que puede generar contenido explicito, ofensivo o peligroso sin las restricciones habituales de seguridad. Su uso en produccion requiere filtros adicionales y supervision humana.
- Solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no se ha especificado en la informacion disponible, por lo que se desconoce si mantiene la ventana de Qwen3.6 (tipicamente 128k o 256k) o si se ha reducido.
- No se han publicado resultados detallados de benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta una evaluacion objetiva frente a otros modelos.
- El proceso de entrenamiento es complejo y poco reproducible: depende de datasets privados y de una metodologia no documentada en detalle.
- Aunque la licencia Apache 2.0 permite uso comercial, el caracter "uncensored" puede generar problemas legales o eticos en aplicaciones publicas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Bolsjay24/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Articulo en HackerNoon: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Ficha en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
- Variante MTPLX 8-bit: https://huggingface.co/philipjohnbasile/Qwen3.6-27B-Fable-Fusion-711-MTPLX-8bit
