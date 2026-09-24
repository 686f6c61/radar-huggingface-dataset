# AesSedai/MiMo-V2.6-Pro-RL-GGUF

## Resumen

MiMo-V2.6-Pro-RL-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo XiaomiMiMo/MiMo-V2.6-Pro-RL, publicado por el usuario AesSedai en HuggingFace. No es un modelo entrenado desde cero, sino una conversion y compresion del modelo base de Xiaomi, que ronda los 1,02 billones (1.023.182.841.600) de parametros totales, a formatos ejecutables con llama.cpp y herramientas compatibles.

El modelo base es una arquitectura de mezcla de expertos (MoE) con expertos en formato MXFP4. La propuesta diferencial del repositorio es cuantizar de forma agresiva las matrices FFN (UP, GATE y DOWN), que son mucho mayores que el resto de tensores, manteniendo el resto en alta precision para reducir el tamano total con una perdida de calidad controlada. Se ofrecen cinco variantes: MXFP4 (calidad completa, 4,52 BPW), BPW3.5, BPW3.0, BPW2.5 y BPW2.0, cada una con metricas de perplejidad (PPL) y divergencia KL (KLD) publicadas.

El repositorio incluye los ficheros de calibracion `imatrix-bpw.gguf` y `bpw-state.bin` para reproducir otras cuantizaciones mediante el PR de bpw-size de llama.cpp. Es relevante para equipos que necesitan desplegar un modelo MoE de escala de billon de parametros en infraestructura propia, aceptando un compromiso explicito entre tamano en disco, VRAM necesaria y degradacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun la model card; modelo base con expertos en MXFP4 |
| Parametros totales | 1.023.182.841.600 (~1,02 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4,52 BPW), BPW3.5, BPW3.0, BPW2.5 y BPW2.0, con mezcla variable (BF16, Q8_0 o Q6_K segun variante); calibracion mediante imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Pro-RL |
| Tamano del repositorio | 1404,1 GB |
| Descargas / likes | 24 / 5 |

## Arquitectura y entrenamiento

El modelo base es una arquitectura de mezcla de expertos (MoE), tal como se deduce de la model card, que describe la existencia de expertos en MXFP4 y de tensores FFN UP, FFN GATE y FFN DOWN especialmente grandes en comparacion con el resto de tensores. El autor no aporta detalles adicionales sobre el numero de expertos, el numero de parametros activos por token, la longitud de contexto nativa ni la composicion del dataset de entrenamiento. Tampoco se documenta si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion, mas alla de lo que sugiere el sufijo "RL" en el nombre.

La innovacion tecnica de este repositorio no reside en el modelo en si, sino en la estrategia de cuantizacion. Se mantiene el tipo de cuantizacion por defecto en alta calidad y se reduce la precision de las matrices FFN (UP, GATE y DOWN) de forma especifica, aprovechando que estas concentran la mayor parte del peso del modelo. Las variantes BPW se han generado apuntando a tamanos concretos mediante el PR de bpw-size de llama.cpp (pull request 15550), y se incluyen los artefactos de calibracion (`imatrix-bpw.gguf` y `bpw-state.bin`) para que otros usuarios reproduzcan cuantizaciones adicionales. La variante MXFP4 se presenta como la de "calidad completa", ya que el modelo base emplea expertos MXFP4.

## Capacidades

- Generacion de texto y uso conversacional, segun la etiqueta `conversational` del repositorio. No se detallan capacidades especificas adicionales por parte del autor.
- Cuantizacion y despliegue local mediante GGUF, compatible con el ecosistema de llama.cpp y herramientas derivadas (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia).
- Ajuste de precision frente a tamano: permite elegir entre cinco variantes con distinto equilibrio entre BPW, tamano en disco y degradacion de PPL/KLD.
- No hay informacion disponible sobre soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades multilingues, vision, audio o modo de razonamiento explicito.
- No se documenta ninguna capacidad especial adicional en la model card.

## Casos de uso

- Inferencia local de un modelo MoE de gran escala: equipos con acceso a nodos multi-GPU pueden desplegar la variante BPW3.5 (416,88 GiB) o BPW3.0 (357,32 GiB) para servir el modelo con una degradacion de PPL del 1,92 % y 6,70 % respectivamente, optimizando el uso de memoria frente a la version de calidad completa.
- Servicio conversacional autoalojado: dado el tag `conversational`, el modelo puede emplearse como backend de chat en entornos donde no se quieren enviar datos a APIs externas, siempre que la infraestructura soporte el tamano de las cuantizaciones.
- Reproduccion de cuantizaciones personalizadas: los ficheros `imatrix-bpw.gguf` y `bpw-state.bin` permiten a otros usuarios generar variantes BPW adicionales mediante el PR de bpw-size de llama.cpp, ajustando el tamano a la VRAM disponible.
- Investigacion sobre cuantizacion de MoE: el repositorio sirve como caso de estudio para medir el impacto de cuantizar tensores FFN UP, GATE y DOWN en un modelo de escala de billon de parametros, con datos de PPL y KLD publicados.
- Evaluacion comparativa de trade-offs precision-coste: la tabla de PPL y KLD permite seleccionar la variante optima segun el presupuesto de memoria y el margen de degradacion aceptable en una tarea concreta.
- Despliegue en infraestructura de alta gama para produccion interna: la variante MXFP4 (537,99 GiB) reproduce practicamente la calidad del modelo base (+0,0376 % de PPL) y es adecuada para pipelines que requieren maxima fidelidad.

## Benchmarks y rendimiento

La model card del autor publica metricas de calidad de las cuantizaciones (perplejidad y divergencia KL respecto al modelo base), pero no ofrece resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

| Cuantizacion | Tamano | Mezcla | PPL | 1-(Mean PPL(Q)/PPL(base)) | KLD |
|---|---|---|---|---|---|
| MXFP4 | 537,99 GiB (4,52 BPW) | BF16 / MXFP4 | 3,172064 ± 0,015439 | +0,0376 % | -0,000000 ± 0,000000 |
| BPW3.5 | 416,88 GiB (3,50 BPW) | Q8_0 / varía | 3,231880 ± 0,015640 | +1,9240 % | 0,141151 ± 0,000823 |
| BPW3.0 | 357,32 GiB (3,00 BPW) | Q8_0 / varía | 3,383461 ± 0,016667 | +6,7044 % | 0,183875 ± 0,001023 |
| BPW2.5 | 297,78 GiB (2,50 BPW) | Q6_K / varía | 3,682749 ± 0,018545 | +16,1431 % | 0,255708 ± 0,001335 |
| BPW2.0 | 219,58 GiB (1,84 BPW) | Q6_K / varía | 5,113859 ± 0,027763 | +61,2761 % | 0,542302 ± 0,002336 |

El repositorio tambien incluye dos graficos de analisis de Pareto (`kld_data/01_kld_vs_filesize.png` y `kld_data/02_ppl_vs_filesize.png`) que relacionan la divergencia KL y la perplejidad con el tamano de fichero de cada variante.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Huella en disco (pesos unicamente): de 219,58 GiB (BPW2.0) a 537,99 GiB (MXFP4). El repositorio completo ocupa 1404,1 GB, ya que contiene todas las variantes y datos de calibracion.
- VRAM estimada para inferencia: como minimo, el tamano de la cuantizacion elegida mas el overhead de cache KV, activaciones y buffers de llama.cpp, no cuantificable con los datos disponibles (no se conoce el contexto soportado). Como referencia, la variante BPW2.0 (219,58 GiB) no cabe en una GPU de 80 GB y exige reparto entre varios dispositivos.
- GPU recomendadas: la variante MXFP4 (537,99 GiB) requiere aproximadamente 7-8 GPU tipo H100 de 80 GB o unas 4 GPU H200 de 141 GB. La variante BPW2.0 (219,58 GiB) necesita alrededor de 3 GPU H100 de 80 GB o 2 GPU H200 de 141 GB. Los calculos son estimaciones a partir del tamano del fichero, sin contar overhead.
- No cabe en GPU de consumo: ni siquiera la variante mas comprimida (BPW2.0, 219,58 GiB) entra en una RTX 4090 de 24 GB ni en una RTX 5090 de 32 GB.
- Opciones de despliegue: formato GGUF, por lo que el motor natural es llama.cpp y sus envoltorios (Ollama, LM Studio, entre otros). El tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia. No se confirma soporte en vLLM o TGI para esta cuantizacion concreta.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada. Este repositorio es una cuantizacion de un modelo base concreto (XiaomiMiMo/MiMo-V2.6-Pro-RL), por lo que la comparativa natural es entre las propias variantes de cuantizacion, resumida a continuacion:

| Variante | Tamano | BPW | Degradacion de PPL | KLD |
|---|---|---|---|---|
| MXFP4 | 537,99 GiB | 4,52 | +0,0376 % | ~0 |
| BPW3.5 | 416,88 GiB | 3,50 | +1,9240 % | 0,141151 |
| BPW3.0 | 357,32 GiB | 3,00 | +6,7044 % | 0,183875 |
| BPW2.5 | 297,78 GiB | 2,50 | +16,1431 % | 0,255708 |
| BPW2.0 | 219,58 GiB | 1,84 | +61,2761 % | 0,542302 |

Comparativa con modelos alternativos de la misma categoria (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- La variante BPW2.0 presenta una degradacion de perplejidad del +61,2761 % respecto al modelo base y una KLD de 0,542302, lo que indica una perdida de calidad notable y desaconseja su uso en tareas que exijan fidelidad alta.
- No se dispone de informacion sobre sesgos del modelo base ni de la cuantizacion.
- Riesgo de alucinacion: no documentado por el autor; aplicable el riesgo general de los modelos generativos, agravado por la degradacion introducida en las variantes de menor BPW.
- Licencia no disponible: se desconoce si la cuantizacion y el modelo base permiten uso comercial. Es imprescindible verificar la licencia de XiaomiMiMo/MiMo-V2.6-Pro-RL antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingue.
- Contexto maximo no disponible: no se puede planificar el uso con ventanas largas ni dimensionar la cache KV.
- El repositorio tiene un uso muy bajo (24 descargas y 5 likes) y fue creado y actualizado el 24 de septiembre de 2026, por lo que carece de validacion comunitaria amplia.
- Requisitos de hardware extremos: ninguna variante cabe en hardware de consumo; todas exigen despliegues multi-GPU de gama alta.
- Al ser una cuantizacion de terceros, es posible que existan discrepancias con el modelo base no documentadas por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AesSedai/MiMo-V2.6-Pro-RL-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- PR de bpw-size de llama.cpp (referenciado en la model card): https://github.com/ggml-org/llama.cpp/pull/15550
