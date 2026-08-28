# eepos/Qwen3.8-27B-QUASAR-NVFP4-NInfer

## Resumen

Este repositorio contiene una cuantización NVFP4 (4 bits) del modelo Qwen3.8-27B, generada por el usuario eepos a partir del checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4. El objetivo es ofrecer una versión del modelo que pueda ejecutarse de forma eficiente en GPUs estándar sin pérdida significativa de precisión, gracias a la técnica de cuantización QAT (Quantization-Aware Training) aplicada por el proyecto QUASAR. La particularidad de esta versión frente a otras cuantizaciones NInfer del mismo modelo es que conserva tanto `token_embedding` como `lm_head` en BF16, tal y como aparecen en el modelo original, lo que puede mejorar la fidelidad de las representaciones de entrada y salida.

El artefacto se distribuye en formato `.ninfer`, un formato cerrado del motor de inferencia NInfer, y requiere un parche específico sobre una versión concreta de NInfer para poder cargarse. El autor advierte que no ha probado directamente el parche incluido, ya que desarrolla en Windows y su configuración local difiere de la del parche para Linux. A pesar de ser una cuantización de un modelo de 27B, el tamaño del repositorio es de 19,9 GB, lo que sugiere que puede desplegarse en GPUs con 24 GB de VRAM o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion y capas recurrentes DeltaNet (segun cuantizaciones similares del mismo modelo base) |
| Parametros totales | 27B (segun denominacion del modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) con escalas de bloque FP8; `token_embedding` y `lm_head` en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto `.ninfer` (formato cerrado de NInfer) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27 mil millones de parametros que, segun fuentes externas, incluye capacidades de vision (multimodal). La cuantizacion QUASAR aplica QAT para reducir pesos y activaciones a NVFP4 (FP4 E2M1 con escalas de bloque FP8), manteniendo las capas de atencion y las capas recurrentes DeltaNet en FP8 para preservar la precision en las partes mas sensibles. Esta version concreta de eepos conserva `token_embedding` y `lm_head` en BF16, a diferencia de otras cuantizaciones NInfer del mismo checkpoint, con el objetivo de acercarse mas al comportamiento del modelo original.

El proceso de conversion a NInfer parte del trabajo de MirkoCovizzi y requiere un parche sobre NInfer en el commit `6e8b2e2ad5d53597c3ba8e7989f9546d40b921fc`. El autor no ha validado el parche en Linux, por lo que su funcionamiento no esta garantizado en todos los entornos.

## Capacidades

- Inferencia multimodal (vision y texto) segun la descripcion del proyecto QUASAR, que comprime el modelo Qwen3.8-27B para ejecucion en GPUs estandar.
- Generacion de texto y razonamiento heredados del modelo base, aunque no se detallan capacidades especificas en la informacion disponible.
- No se dispone de informacion sobre soporte de tool calling, agentes o modo de pensamiento.
- No se especifican los idiomas soportados.

## Casos de uso

- Inferencia multimodal en entornos empresariales: el modelo puede procesar imagenes y texto simultaneamente, lo que permite aplicaciones como analisis de documentos con contenido visual, moderacion de contenido o asistentes de soporte con comprension de capturas de pantalla.
- Despliegue en GPUs estandar: gracias a la cuantizacion NVFP4, el modelo de 27B puede ejecutarse en hardware con 24 GB de VRAM, reduciendo los costes de infraestructura frente a la version sin cuantizar.
- Prototipado rapido con NInfer: el formato `.ninfer` esta disenado para el motor NInfer, que ofrece una alternativa a otros motores como vLLM o llama.cpp, especialmente en entornos donde se prioriza el rendimiento con cuantizaciones de 4 bits.
- Investigacion en cuantizacion: este artefacto sirve como referencia para estudiar el impacto de mantener `token_embedding` y `lm_head` en BF16 frente a otras cuantizaciones que los reducen a NVFP4.
- Evaluacion comparativa de motores de inferencia: al existir otras cuantizaciones NInfer del mismo modelo, permite comparar el rendimiento y la precision entre distintas estrategias de cuantizacion.
- Sistemas de respuesta a preguntas con soporte visual: el modelo puede integrarse en pipelines que requieran comprender diagramas, graficos o fotografias junto con texto, por ejemplo en entornos educativos o de soporte tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GitHub asociado menciona una evaluacion en GPQA-Diamond, pero no se proporcionan los valores numericos en los materiales consultados.

## Requisitos de hardware

- Tamano del repositorio: 19,9 GB, lo que sugiere que el modelo cuantizado cabe en GPUs con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G o A100 de 40 GB).
- El motor NInfer esta orientado a GPUs NVIDIA; no se menciona soporte para otras arquitecturas.
- No se dispone de datos de latencia ni throughput para este artefacto concreto.
- El despliegue requiere aplicar un parche sobre NInfer en el commit especificado, lo que anade un paso de compilacion manual.
- No se indican opciones de despliegue alternativas (vLLM, Ollama, etc.) porque el formato `.ninfer` es exclusivo de NInfer.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| eepos/Qwen3.8-27B-QUASAR-NVFP4-NInfer | 27B | NVFP4 (W4A4) con embeddings y lm_head en BF16 | `.ninfer` | Apache-2.0 | Requiere parche de NInfer |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | NVFP4 (W4A4) | Desconocido | Apache-2.0 | Cuantizacion de referencia de Unsloth |
| HivenetQuant/Qwen3.8-27B-NVFP4 | 27B | NVFP4 (W4A4) con atencion y DeltaNet en FP8 | Desconocido | Apache-2.0 | Mantiene capas sensibles en FP8 |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia de la version de eepos es la conservacion de `token_embedding` y `lm_head` en BF16, mientras que las otras pueden cuantizarlos tambien a NVFP4.

## Limitaciones y advertencias

- El autor no ha probado el parche incluido en Linux; su funcionamiento no esta garantizado y puede requerir ajustes adicionales.
- El formato `.ninfer` es cerrado y propietario, lo que limita la interoperabilidad con otros motores de inferencia.
- Se necesita una version especifica de NInfer (commit `6e8b2e2ad5d53597c3ba8e7989f9546d40b921fc`) y aplicar un parche manualmente, lo que complica la reproducibilidad.
- No se han publicado resultados de benchmarks, por lo que no se puede verificar la afirmacion de "sin perdida de precision" en este artefacto concreto.
- El modelo base puede presentar sesgos o alucinaciones tipicos de los modelos de lenguaje grandes; no se ha realizado una evaluacion especifica de estos aspectos en esta cuantizacion.
- La licencia Apache-2.0 permite uso comercial, pero el formato `.ninfer` y el motor NInfer pueden tener restricciones adicionales no documentadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eepos/Qwen3.8-27B-QUASAR-NVFP4-NInfer
- Repositorio GitHub de documentacion y reproduccion: https://github.com/engharat/-Qwen3.8-27B-QUASAR-NVFP4-NINFER-/blob/main/README.md
- Motor NInfer: https://github.com/Neroued/ninfer
- Articulo sobre QUASAR y NVFP4: https://thevalue.engineering/news/quasar-compresses-qwen-27b-nvfp4-enterprise-inference.html
- Cuantizacion de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Cuantizacion alternativa de HivenetQuant: https://huggingface.co/HivenetQuant/Qwen3.8-27B-NVFP4
