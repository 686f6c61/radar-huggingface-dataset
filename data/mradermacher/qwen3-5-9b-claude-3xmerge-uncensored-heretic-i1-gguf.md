# mradermacher/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-i1-GGUF es una distribucion de cuantizaciones GGUF generada por mradermacher a partir del modelo fusionado xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic. El modelo base parte de Qwen3.5 de 9B parametros, sobre el que se ha aplicado una fusion de tres modelos (merge 3x) con un estilo de respuesta orientado a Claude y posteriormente un proceso de "abliteration" o "heretic" destinado a eliminar los rechazos y restricciones de alineamiento. El repositorio no incluye pesos originales en safetensors, sino exclusivamente ficheros GGUF cuantizados con imatrix.

El interes practico de esta publicacion es la disponibilidad de un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K) para ejecutar un modelo de 9.197.093.888 parametros en hardware de consumo mediante llama.cpp u otros motores compatibles con GGUF. El autor emplea cuantizacion ponderada con matriz de importancia (imatrix), lo que suele mejorar la calidad respecto a cuantizaciones estandar en el mismo numero de bits.

No obstante, la informacion publicada es muy limitada: no se declara licencia, no se especifican idiomas soportados, no hay pipeline definido ni resultados de benchmarks, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Se trata, por tanto, de una publicacion reciente y de nicho, orientada a experimentacion con modelos sin censura mas que a despliegues de produccion con garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5); detalles no disponibles |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix); sin safetensors en el repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es una variante de Qwen3.5 con aproximadamente 9,2B parametros, presumiblemente con la arquitectura transformer decoder-only caracteristica de la familia Qwen. Sobre esa base se ha realizado una fusion de tres modelos ("3xMerge") y una etapa de "heretic"/abliteration, tecnica que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo fusionado.

La contribucion especifica de este repositorio es la cuantizacion: el autor ha generado las cuantizaciones con matrices de importancia (imatrix) ponderadas, lo que implica calcular estadisticas de activacion sobre un corpus de calibracion para asignar precision de forma no uniforme a los tensores. El README incluye metadatos de la herramienta de conversion (quantize_version 2, output_tensor_quantised 1, convert_type hf) pero no documenta el corpus de calibracion ni los hiperparametros empleados.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5, si bien no se documentan capacidades especificas.
- Estilo de respuesta orientado a Claude por efecto de la fusion, aunque no se detalla en que consiste dicho ajuste.
- Comportamiento sin censura: el proceso "heretic" esta disenado para reducir rechazos, con el consiguiente riesgo de generar contenido inapropiado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion con modelos sin alineamiento: el modelo permite estudiar como el proceso de abliteration afecta al comportamiento y a la calidad de las respuestas en comparacion con el Qwen3.5 original, en entornos de investigacion controlados.
- Evaluacion de tecnicas de fusion de modelos: al tratarse de un merge 3x, sirve para analizar la viabilidad de combinar tres checkpoints y medir la degradacion o mejora resultante en tareas de razonamiento.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 9,2B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, util para prototipos offline.
- Pruebas de robustez y red teaming: al carecer de filtros de rechazo, es adecuado como sujeto de pruebas para evaluar sistemas de moderacion y clasificadores de contenido.
- Generacion creativa sin restricciones tematicas: escritura de ficcion o guiones donde el modelo base podria rechazar ciertos temas, siempre con supervision humana y cumplimiento legal.
- Benchmarking de cuantizaciones: el amplio rango de cuantizaciones (de IQ1_S a Q6_K) permite medir la relacion entre bits por peso y calidad en un mismo modelo, util para calibrar pipelines de cuantizacion con imatrix.
- Fine-tuning posterior: las cuantizaciones no son adecuadas para reentrenar, pero el modelo fusionado original (en safetensors) puede servir de base para ajustes especificos, siempre que la licencia del modelo subyacente lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y 9,2B parametros):
  - IQ1_S / IQ1_M: en torno a 2,5-3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 3-4 GB.
  - Q2_K / Q3_K_S / IQ3_XXS: en torno a 4-5 GB.
  - Q3_K_M / Q3_K_L / IQ3_M / IQ3_S: en torno a 5-6 GB.
  - IQ4_XS / Q4_0 / Q4_1 / Q4_K_S: en torno a 6-7 GB.
  - Q4_K_M / Q5_K_S: en torno a 7-8 GB.
  - Q5_K_M: en torno a 8-9 GB.
  - Q6_K: en torno a 10-11 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 para cuantizaciones medias y altas; A100 o H100 no son necesarias para este tamano salvo para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones; las Q4_K_M y Q5_K_M son las opciones habituales para GPUs de 8-12 GB. Las cuantizaciones IQ1/IQ2 son para equipos con 4 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion y el backend. Como referencia general, un modelo de 9B en Q4_K_M en una RTX 4090 suele superar las decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-i1-GGUF | 9,2B | no disponible | no disponible | GGUF | Fusion 3x con abliteration; sin benchmarks publicados |
| Qwen3.5-9B (base) | 9B aprox. | no disponible | no disponible en esta ficha | safetensors, GGUF | Modelo original alineado, con rechazos activos |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa ampliamente soportada, con benchmarks publicados |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Menor tamano y licencia permisiva, ideal para produccion |

La comparacion es orientativa: no se dispone de datos de rendimiento del modelo de esta ficha, por lo que no es posible establecer una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos que permitan estimar la calidad del modelo en tareas estandar, lo que desaconseja su uso en produccion sin evaluacion previa.
- Licencia no declarada: no se especifica la licencia del repositorio ni la del modelo base, lo que impide determinar si el uso comercial esta permitido. Verificar la licencia de Qwen3.5 y del checkpoint fusionado antes de cualquier despliegue.
- Proceso "heretic"/abliteration: la eliminacion de rechazos puede degradar la coherencia, aumentar la probabilidad de contenido danino y reducir la fiabilidad en tareas sensibles.
- Riesgo de alucinacion: inherente a los modelos de 9B, sin datos especificos de esta variante.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue correcto; probablemente herede el sesgo hacia ingles y chino del modelo base, pero no esta documentado.
- Contexto no documentado: se desconoce la ventana maxima real tras la fusion y la cuantizacion, lo que limita el diseno de aplicaciones con documentos largos.
- Fusion de modelos: los merges 3x pueden producir comportamientos impredecibles o inconsistencias entre turnos; conviene validar con un conjunto de pruebas propio.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Cuantizaciones muy bajas (IQ1/IQ2): la perdida de calidad puede ser severa; no recomendadas para tareas de razonamiento o codigo.
- Uso responsable: al tratarse de un modelo sin censura, el despliegue debe acompanarse de moderacion externa y cumplimiento de la normativa aplicable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-i1-GGUF
- Modelo fusionado de origen: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Perfil del autor: https://huggingface.co/mradermacher
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
