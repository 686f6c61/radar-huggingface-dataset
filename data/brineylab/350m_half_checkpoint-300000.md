# brineylab/350M_half_checkpoint-300000

## Resumen

El modelo `brineylab/350M_half_checkpoint-300000` es un modelo de lenguaje de proteínas (protein language model, pLM) basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el estudio de leyes de escalado en modelos de lenguaje de anticuerpos (AbLMs). Resuelve el problema de determinar la relacion optima entre tamano de modelo y volumen de datos en el preentrenamiento de modelos especializados en secuencias de anticuerpos, un ambito clave para el descubrimiento terapeutico y el analisis de repertorios inmunitarios. El modelo tiene 355.562.402 parametros, 32 capas transformer, dimension oculta de 960 y 20 cabezas de atencion, y fue entrenado sobre 824.363 secuencias de anticuerpos emparejadas (la mitad del dataset del estudio).

Se trata de uno de los 15 modelos que componen la coleccion AbLMs Scaling Laws, que abarca cinco tamanos (de 8M a 650M parametros) y tres escalas de dataset. Este checkpoint concreto corresponde al paso de entrenamiento 300.000. Su relevancia actual radica en que proporciona evidencia empirica sobre como escalar modelos especializados en anticuerpos, un campo donde los modelos genericos de proteinas no capturan bien las particularidades de las secuencias nativamente emparejadas de cadena pesada y ligera.

La tarea principal es `fill-mask` (enmascaramiento de residuos aminoacidicos), lo que permite su uso para prediccion de mutaciones, modelado de afinidad y representaciones para tareas downstream de clasificacion, como especificidad y clasificacion de pares cadena pesada-ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ESM-2 (encoder, masked language modeling) |
| Parametros totales | 355.562.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento, con padding o truncado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (secuencias de aminoacidos); no disponible en el sentido de lenguas naturales |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder con atencion bidireccional entrenado mediante masked language modeling. En este caso concreto, 32 capas transformer, dimension oculta de 960 y 20 cabezas de atencion, para un total de 355.562.402 parametros. La entrada es la secuencia aminoacidica de la cadena pesada, seguida de dos tokens `<cls>` como separador, y la secuencia de la cadena ligera; durante el entrenamiento las entradas se rellenaron o truncaron a 320 tokens.

El entrenamiento se realizo sobre secuencias de anticuerpos nativamente emparejadas (pares cadena pesada-cadena ligera), con un total de 824.363 secuencias en este checkpoint (la mitad del dataset completo del estudio, que suma aproximadamente 1,6 millones de secuencias). El estudio completo entrena 15 modelos cruzando cinco tamanos (8M a 650M) con tres escalas de dataset. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de proteinas. El objetivo del estudio es caracterizar las leyes de escalado de AbLMs y determinar el balance optimo entre tamano de modelo y disponibilidad de datos para evitar rendimientos decrecientes.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Representacion conjunta de cadenas pesada y ligera mediante el separador de dos tokens `<cls>`, lo que permite capturar interacciones entre ambas cadenas.
- Prediccion de residuos enmascarados, util para estimacion de efectos de mutacion y diseno de secuencias.
- Extraccion de embeddings para tareas downstream (fine-tuning con `EsmForSequenceClassification`).
- Clasificacion de especificidad y clasificacion de pares cadena pesada-ligera tras fine-tuning (segun el articulo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo especializado en proteinas.
- Capacidades multilingues: no aplica; opera sobre el alfabeto de aminoacidos estandar.

## Casos de uso

- Prediccion de mutaciones en anticuerpos: enmascarar un residuo concreto y consultar la distribucion de probabilidad sobre aminoacidos para priorizar variantes en campanas de maduracion de afinidad, aprovechando el modelado bidireccional de ESM-2.
- Clasificacion de especificidad de anticuerpos: cargar el modelo con `EsmForSequenceClassification`, congelar el cuerpo base y entrenar la cabeza sobre un dataset etiquetado para discriminar anticuerpos especificos frente a promiscuos.
- Clasificacion de pares cadena pesada-ligera: usar el formato de entrada con doble `<cls>` para tareas que requieren evaluar la compatibilidad del par nativo, tal como se describe en el articulo.
- Filtrado de repertorios inmunitarios: generar embeddings de secuencias de repertorios y usarlos para agrupar o puntuar candidatos antes de sintesis, reduciendo el espacio de busqueda experimental.
- Inicializacion para fine-tuning en tareas de desarrollo terapeutico: partir de este checkpoint de 350M como base para modelos especializados en propiedades como estabilidad, expresabilidad o inmunogenicidad.
- Estudio de leyes de escalado: replicar o extender el analisis del articulo comparando este checkpoint con los otros 14 de la coleccion para entender el rendimiento en funcion de tamano y datos.
- Anotacion asistida de secuencias: dado un par pesado-ligero con posiciones desconocidas o ambiguas, usar fill-mask para proponer residuos plausibles como apoyo a la curacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint en bioRxiv (doi:10.1101/2025.09.02.673765) y a la Tabla S1 para los detalles de este checkpoint, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni metricas especificas de proteinas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 355,5M parametros, en fp32 se requieren aproximadamente 1,4 GB solo para pesos; en fp16 alrededor de 0,7 GB. Sumando activaciones y overhead, es viable con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 funcionan sin problema. Para entrenamiento o fine-tuning con lotes grandes se recomienda A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (libreria nativa, `EsmForMaskedLM` / `EsmForSequenceClassification`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de texto y no a encoders de proteinas.
- Latencia y throughput: no disponibles en la informacion proporcionada; con 320 tokens de entrada y 355M de parametros, la inferencia por secuencia es del orden de milisegundos en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/350M_half_checkpoint-300000 | 355,5M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |
| ESM-2 (650M, Meta) | ~650M | ~1024 tokens | fill-mask (proteinas generales) | MIT | Hugging Face |
| ESM-2 (150M, Meta) | ~150M | ~1024 tokens | fill-mask (proteinas generales) | MIT | Hugging Face |
| Otros AbLMs de la coleccion brineylab | 8M-650M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |

La comparativa de rendimiento cuantitativo no esta disponible en la informacion proporcionada. La diferencia clave frente a ESM-2 generico es el entrenamiento especifico sobre pares nativamente emparejados de cadena pesada y ligera de anticuerpos, con un contexto de 320 tokens adaptado a ese formato.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en secuencias de anticuerpos; no es un modelo de lenguaje natural ni generativo autoregresivo.
- Contexto limitado a 320 tokens: secuencias mas largas se truncan, lo que puede perder informacion en cadenas especialmente extensas.
- Entrenado sobre la mitad del dataset del estudio (824.363 secuencias); el checkpoint completo puede ofrecer mejores resultados si el volumen de datos es el factor limitante.
- Riesgo de sesgo hacia la distribucion de anticuerpos presente en los datos de preentrenamiento (repertorios humanos y de origen terapeutico); puede generalizar peor a especies o formatos poco representados.
- Riesgo de alucinacion en el sentido de predicciones de residuos plausibles pero biologicamente invalidas; validar experimentalmente cualquier candidato.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre idoneidad para fines terapeuticos.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia optimizados; el despliegue depende de transformers.
- Solo 4 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente, sin feedback de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/brineylab/350M_half_checkpoint-300000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper ESM-2: https://www.science.org/doi/10.1126/science.ade2574
