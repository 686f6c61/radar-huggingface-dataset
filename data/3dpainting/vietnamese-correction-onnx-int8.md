# 3dpainting/vietnamese-correction-onnx-int8

## Resumen

`3dpainting/vietnamese-correction-onnx-int8` es una conversión a formato ONNX con cuantización dinámica INT8 del modelo `bmd1905/vietnamese-correction`, un BARTpho-syllable afinado para la corrección ortográfica de texto en vietnamita. El autor de la conversión es el usuario de Hugging Face 3dpainting, que la publica como componente del motor de revisión ortográfica de su herramienta WordTools. No se ha realizado entrenamiento adicional: la operación consiste únicamente en exportar los pesos con `optimum` y cuantizarlos con `onnxruntime.quantization.quantize_dynamic` en modo QInt8 con `EnableSubgraph`.

El modelo resuelve un problema acotado y bien delimitado: detectar y corregir errores tipográficos y de acentuación en vietnamita, un idioma con diacríticos complejos y una tokenización silábica particular. Al estar empaquetado en ONNX INT8, el artefacto reduce el peso de 1,6 GB en FP32 a 413 MB comprimidos (531 MB descomprimidos), lo que facilita su despliegue en entornos con recursos limitados o en aplicaciones de escritorio y web. La relevancia actual reside en la practicidad del formato: permite integrar corrección ortográfica vietnamita en pipelines de producción sin depender de frameworks de deep learning pesados, usando únicamente ONNX Runtime.

La información disponible es limitada: no hay datos publicados sobre arquitectura detallada del modelo base, número de parámetros, longitud de contexto ni benchmarks formales. La model card se centra en el proceso de conversión y en una evaluación cualitativa sobre 29 errores introducidos manualmente en textos administrativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BARTpho-syllable, base de `bmd1905/vietnamese-correction`); exportado a ONNX con encoder y decoder merged |
| Parametros totales | no disponible (el zip INT8 ocupa 413 MB y el FP32 original 1,6 GB, lo que sugiere un modelo de tamaño medio, pero no se especifica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, `EnableSubgraph`) sobre ONNX; el modelo original en FP32 también está disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 (modelo base `bmd1905/vietnamese-correction`); el modelo original `vinai/bartpho-syllable` es MIT |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), empaquetados en `vietnamese-correction-int8.zip` junto con `vocab.txt`, `bpe.codes` y `runtime.json` |

## Arquitectura y entrenamiento

El modelo subyacente es `bmd1905/vietnamese-correction`, un fine-tuning de `vinai/bartpho-syllable`, que a su vez es una variante de BART adaptada al vietnamita con tokenización a nivel de sílaba. La arquitectura es, por tanto, un transformer encoder-decoder de tipo BART, adecuado para tareas de seq2seq como la corrección de texto. El modelo original fue entrenado sobre el dataset `bmd1905/error-correction-vi` (Apache-2.0), según indica la model card.

La conversión aquí presentada no introduce cambios arquitectónicos ni entrenamiento adicional. Se aplicó exportación ONNX con `optimum` y cuantización dinámica INT8 con `onnxruntime.quantization.quantize_dynamic`, usando QInt8 y `EnableSubgraph`. El decoder se exporta como `decoder_model_merged.onnx` con soporte de KV cache mediante el flag `use_cache_branch`, y la decodificación es greedy. El paquete incluye el vocabulario y los códigos BPE de PhoBERT necesarios para la tokenización. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Corrección ortográfica y de acentuación en vietnamita: detecta y corrige errores tipográficos en texto administrativo y de uso general.
- Generación de texto seq2seq: al ser un modelo encoder-decoder, puede reescribir la secuencia de entrada corrigiendo los errores detectados.
- Tokenización silábica adaptada al vietnamita mediante BPE de PhoBERT (`bpe.codes`).
- Decodificación greedy con KV cache, lo que acelera la inferencia autoregresiva.
- Ejecución mediante ONNX Runtime con cuantización INT8, sin necesidad de PyTorch en producción.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente vietnamita.

## Casos de uso

- Revisión ortográfica en herramientas de escritorio: integración del paquete ONNX en aplicaciones como WordTools para corregir texto vietnamita localmente, sin conexión a servicios externos, gracias al reducido tamaño del artefacto INT8.
- Preprocesado de textos administrativos: normalización de documentos oficiales vietnamitas antes de indexarlos o procesarlos con otros modelos, corrigiendo errores de tecleo y acentuación.
- Corrección en formularios web: validación y autocorrección de campos de texto en vietnamita en el navegador o en el servidor mediante ONNX Runtime, con latencia baja al usar INT8.
- Limpieza de corpus para entrenamiento: saneamiento de datasets en vietnamita recopilados de fuentes ruidosas (foros, redes sociales) antes de usarlos en fine-tuning de otros modelos.
- Despliegue en entornos con recursos limitados: ejecución en CPU o GPUs modestas gracias a los 531 MB descomprimidos y a la cuantización INT8, sin requerir el stack de PyTorch.
- Integración en pipelines de CI/CD de contenidos: verificación automática de ortografía en la documentación o en los textos de producto en vietnamita antes de publicar.
- Corrección previa a traducción automática: mejorar la calidad de la entrada vietnamita antes de pasarla a un sistema de traducción, reduciendo errores propagados.

## Benchmarks y rendimiento

La model card reporta una evaluación cualitativa: sobre 29 errores introducidos deliberadamente en textos administrativos, el modelo corrige correctamente 24, con un resultado idéntico al de la versión FP32. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Resultado |
|---|---|
| Errores corregidos en prueba manual (29 errores en texto administrativo) | 24 |
| Equivalencia con FP32 | idéntica según el autor |
| Benchmarks estandarizados | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 531 MB descomprimidos en INT8, el modelo cabe holgadamente en GPUs de gama baja y probablemente en memoria unificada de equipos consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente, aunque no se confirma.
- Cabe en GPU consumer: muy probablemente sí, dado el tamaño del artefacto, pero no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (requisito del formato); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `3dpainting/vietnamese-correction-onnx-int8` | no disponible | no disponible | ONNX INT8 | Apache-2.0 | Conversión cuantizada del modelo de corrección vietnamita |
| `bmd1905/vietnamese-correction` | no disponible | no disponible | safetensors/PyTorch (presumiblemente) | Apache-2.0 | Modelo original en FP32, misma calidad reportada |
| `vinai/bartpho-syllable` | no disponible | no disponible | PyTorch | MIT | Modelo base preentrenado en vietnamita, sin fine-tuning de corrección |

No se dispone de datos de rendimiento comparativo entre estas alternativas más allá de la equivalencia cualitativa reportada entre la versión INT8 y FP32.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo vietnamita; no debe usarse con otros idiomas.
- Sesgos: no documentados por el autor; al derivar de un corpus administrativo, puede tener un sesgo hacia el registro formal.
- Riesgo de alucinación: como modelo generativo seq2seq, puede introducir cambios no deseados en el texto más allá de la corrección ortográfica; conviene validar las salidas en producción.
- Evaluación limitada: la única métrica reportada es una prueba manual de 29 errores, sin benchmark estandarizado ni conjunto de validación público.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base `vinai/bartpho-syllable` es MIT y el dataset de entrenamiento es Apache-2.0; deben respetarse las atribuciones correspondientes incluidas en el zip.
- Formato específico: requiere ONNX Runtime y los ficheros auxiliares (`vocab.txt`, `bpe.codes`, `runtime.json`); no es directamente compatible con frameworks que esperen safetensors o GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación por parte de la comunidad.
- Fecha de creación en el repositorio (2026-11-16) posterior a la fecha actual de referencia habitual; conviene verificar la integridad del artefacto mediante el SHA-256 indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3dpainting/vietnamese-correction-onnx-int8
- Modelo base: https://huggingface.co/bmd1905/vietnamese-correction
- Modelo original BARTpho-syllable: https://huggingface.co/vinai/bartpho-syllable
- Dataset de entrenamiento: https://huggingface.co/datasets/bmd1905/error-correction-vi
