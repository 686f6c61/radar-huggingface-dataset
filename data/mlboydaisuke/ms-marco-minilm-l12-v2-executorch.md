# mlboydaisuke/ms-marco-MiniLM-L12-v2-ExecuTorch

## Resumen

Este modelo es una conversión a ExecuTorch del cross-encoder `cross-encoder/ms-marco-MiniLM-L12-v2`, un reranker de pares consulta-documento desarrollado originalmente por Cross-Encoder (SBERT) y adaptado por mlboydaisuke para inferencia on-device. El modelo recibe una consulta y un documento, y devuelve una puntuación de relevancia en forma de logit, actuando como segunda etapa en un pipeline de recuperación: un modelo de embeddings recupera candidatos de forma barata y este cross-encoder los reordena con precisión.

La conversión a ExecuTorch con backend XNNPACK permite ejecutar el modelo en dispositivos móviles y de borde sin depender de un runtime de Python, reduciendo el tamaño del artefacto y mejorando la latencia en hardware ARM. Se ofrecen tres variantes (fp32, fp16 y Core ML para iOS) con distintos equilibrios entre tamaño y fidelidad numérica. El modelo base tiene 33,4 millones de parámetros, 12 capas BERT y una dimensión oculta de 384, con una ventana de contexto de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (cross-encoder) con 12 capas, hidden size 384 |
| Parametros totales | 33,4 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32, fp16 (int8 dinámico evaluado pero no publicado) |
| Idiomas soportados | no disponible oficialmente; el modelo base se entrenó con MS MARCO (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK y Core ML) |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder BERT de 12 capas con dimension oculta de 384, entrenado sobre el dataset MS MARCO Passage Ranking. A diferencia de los modelos bi-encoder que generan embeddings independientes para consulta y documento, el cross-encoder concatena consulta y documento en una única secuencia y produce un logit de relevancia, lo que permite una interacción completa entre ambas partes. El entrenamiento se realizó mediante fine-tuning supervisado sobre pares consulta-pasaje con etiquetas de relevancia, sin etapas de RLHF ni DPO.

La conversión a ExecuTorch conserva la arquitectura original pero cambia el formato de ejecución: los pesos se exportan a gráficos XNNPACK (para CPU ARM) o Core ML (para iOS). El modelo requiere tres inputs (`input_ids`, `attention_mask` y `token_type_ids`), cada uno con forma `[1, 512]` en int64, y produce un logit de tipo fp32 con forma `[1, 1]`. Un detalle técnico destacable es que `token_type_ids` no es opcional: la segmentación del documento con segment id 1 aporta una contribución real de 1,59 logits en la puntuación final.

## Capacidades

- Reranking de pares consulta-documento: dado un conjunto de candidatos recuperados por un modelo de embeddings, el modelo reordena cada par consulta-documento y devuelve una puntuación de relevancia.
- Clasificación de texto binaria: el logit de salida puede aplicarse con sigmoide para obtener una probabilidad de relevancia en el rango [0,1].
- Inferencia en dispositivo: ejecución on-device mediante ExecuTorch con backend XNNPACK, sin dependencia de Python ni de GPU.
- Compatibilidad iOS: variante Core ML que ejecuta en el Neural Engine o GPU de dispositivos Apple.
- Capacidad multilingüe limitada: el modelo principal está entrenado principalmente en inglés; la model card no documenta otros idiomas.
- Sin soporte de tool calling ni agentes: es un modelo de una sola pasada, no generativo.

## Casos de uso

- **Búsqueda de documentos en el dispositivo**: el modelo puede reordenar los resultados de una búsqueda local (por ejemplo, en una aplicación de notas o correo) después de que un modelo de embeddings haya preseleccionado candidatos, mejorando la precisión de la recuperación sin depender de un servidor.
- **Sistemas de pregunta-respuesta con recuperación (RAG)**: como segunda etapa de un pipeline RAG, el modelo puntúa los pasajes recuperados y selecciona los más relevantes para pasarlos a un modelo generativo.
- **Filtrado de resultados en buscadores de código**: en un IDE o herramienta de desarrollo, el reranker puede priorizar fragmentos de código o documentación técnica según la consulta del usuario, funcionando offline.
- **Asistente de soporte técnico**: en una aplicación de atención al cliente, el modelo puede clasificar artículos de la base de conocimiento según la consulta del usuario, devolviendo los más útiles para que el agente los consulte.
- **Indexación y búsqueda en bases de datos vectoriales**: el modelo actúa como segunda etapa de un sistema híbrido de recuperación, corrigiendo falsos positivos de la búsqueda vectorial.
- **Reordenación de resultados de búsqueda web local**: para una extensión de navegador o una aplicación de escritorio que quiera mejorar los resultados de búsqueda sin enviar datos a un servidor, el modelo puede ejecutarse localmente con baja latencia.

## Benchmarks y rendimiento

La model card incluye datos de rendimiento en un Mac arm64 (proceso único, mediana de 10 ejecuciones, par consulta-documento de 512 tokens). La referencia de PyTorch eager fp32 en la misma máquina es de 26,7 ms.

| Variante | Tamano (MB) | Error de logit (peor caso vs eager) | Mediana en Mac (ms) |
|---|---|---|---|
| fp32 XNNPACK | 133,6 | 0,0000 | 52,7 |
| fp16 XNNPACK | 67,0 | 0,0070 | 102,1 |
| Core ML fp16 (iOS) | 67,2 | 0,0428 | 13,3 |
| PyTorch eager fp32 | no disponible | 0,0000 | 26,7 |

Según el directorio GTM, el modelo original procesa aproximadamente 960 documentos por segundo en una V100, aunque no se especifica en la model card. No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, etc.) para esta conversión; el único dato de calidad es la fidelidad de los logits respecto al eager y que las tres variantes reproducen exactamente el orden de ranking en las 6 pruebas realizadas.

## Requisitos de hardware

- **VRAM/inferencia**: no aplica, el modelo está diseñado para CPU y aceleradores móviles, no para GPU de servidor.
- **GPU recomendadas**: no aplica; la variante Core ML aprovecha el Neural Engine de Apple, y la variante XNNPACK está optimizada para CPU ARM.
- **Consumer GPU**: no necesita GPU; puede ejecutarse en cualquier dispositivo con procesador ARM (móviles, tablets, Raspberry Pi) o x86 con soporte XNNPACK.
- **Opciones de despliegue**: ExecuTorch runtime (PTE), Core ML (iOS), también puede ejecutarse el modelo original con PyTorch en servidor.
- **Latencia**: en Mac arm64, 52,7 ms (fp32) y 102,1 ms (fp16) por par consulta-documento de 512 tokens; la variante Core ML alcanza 13,3 ms en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| ms-marco-MiniLM-L12-v2 (original) | 33,4M | 512 | safetensors/PyTorch | Apache-2.0 | Reranker en servidor |
| ms-marco-MiniLM-L12-v2-ExecuTorch (este modelo) | 33,4M | 512 | ExecuTorch `.pte` | Apache-2.0 | Reranker on-device |
| cross-encoder/ms-marco-MiniLM-L6-v2 | 22,7M | 512 | safetensors/PyTorch | Apache-2.0 | Reranker ligero en servidor |

No se dispone de comparativa directa de calidad de ranking con otros modelos en la información proporcionada. El modelo original y sus variantes ExecuTorch comparten la misma arquitectura y pesos, por lo que la precisión es idéntica salvo la degradación numérica documentada en la tabla de rendimiento.

## Limitaciones y advertencias

- **Ventana de contexto fija de 512 tokens**: si la consulta y el documento superan conjuntamente este límite, el modelo truncará la entrada y puede perder información relevante.
- **Idioma**: el modelo se entrenó sobre MS MARCO (inglés); el rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- **Dependencia de `token_type_ids`**: la segmentación de la entrada es obligatoria; alimentar ceros en lugar de los ids de segmento reales degrada la puntuación en 1,59 logits, lo que puede alterar el ranking en casos límite.
- **Sin soporte generativo**: el modelo no genera texto; solo produce un logit de relevancia. No es adecuado para tareas de generación ni de chat.
- **Fidelidad numérica de las variantes**: la variante fp16 XNNPACK presenta un error máximo de 0,007 logits y la Core ML de 0,0428; aunque el orden de ranking se conserva en las pruebas, en casos extremos con diferencias de puntuación muy pequeñas el orden podría invertirse.
- **int8 dinámico no disponible**: se evaluó pero no se publicó por tener mayor tamaño (69,7 MB) y mayor error (0,1148 logits) que la variante fp16.
- **Sin documentación de sesgos**: no se han publicado análisis de sesgos o de alucinación específicos para esta conversión.

## Enlaces

- [HuggingFace - mlboydaisuke/ms-marco-MiniLM-L12-v2-ExecuTorch](https://huggingface.co/mlboydaisuke/ms-marco-MiniLM-L12-v2-ExecuTorch)
- [HuggingFace - modelo original cross-encoder/ms-marco-MiniLM-L12-v2](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2)
- [GitHub - executorch-models (scripts de conversión)](https://github.com/john-rocky/executorch-models)
- [Repositorio original del modelo base](https://github.com/inferless/MS-marco-MiniLM-L12-v2)
- [Catálogo de modelos Microsoft Foundry (referencia del modelo base)](https://ai.azure.com/catalog/models/cross-encoder-ms-marco-minilm-l-12-v2)
- [GTM Directory - ficha del modelo base](https://thegtmdirectory.com/models/cross-encoder-ms-marco-minilm-l12)
