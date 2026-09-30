# AesSedai/MiMo-V2.6-Pro-MOPD-GGUF

## Resumen

AesSedai/MiMo-V2.6-Pro-MOPD-GGUF es un repositorio de cuantizaciones GGUF del modelo XiaomiMiMo/MiMo-V2.6-Pro-MOPD, desarrollado por el usuario AesSedai. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada del modelo base de Xiaomi en formato GGUF, pensada para ejecucion local con llama.cpp. La aportacion tecnica del repositorio es una estrategia de cuantizacion selectiva ("MoE-quants"): dado que los tensores FFN del modelo ocupan una fraccion muy superior al resto, se mantiene el tipo de cuantizacion por defecto en alta calidad (Q8_0 / Q6_K) y se cuantizan a la baja especificamente los tensores FFN UP, FFN GATE y FFN DOWN, logrando un equilibrio mejor entre tamano total y calidad que una cuantizacion uniforme equivalente.

El modelo base, MiMo-V2.6-Pro-MOPD, pertenece a la familia MiMo-V2.6 de Xiaomi, descrita por el fabricante como su serie mas capaz hasta la fecha. Segun las fuentes publicas, los modelos MiMo-V2.6-Pro y MiMo-V2.6-Flash son nativamente omnimodales y procesan texto, imagenes, video y audio, con capacidades orientadas a tareas de agente autonomo avanzado. El dato real de safetensors indica un total de 1.023.182.841.600 parametros (aproximadamente 1,02 billones), lo que lo situa en la categoria de modelos MoE de escala frontera y explica el enorme tamano del repositorio (1999,8 GB en total).

La relevancia de este repositorio es practica: ofrece cinco variantes de cuantizacion (MXFP4, BPW3.5, BPW3.0, BPW2.5 y BPW2.0) con metricas publicadas de perplejidad y divergencia KL frente al modelo base, lo que permite a equipos con infraestructura limitada elegir el compromiso entre VRAM y degradacion de calidad. La variante MXFP4 se presenta como la version de "calidad completa", ya que el modelo original emplea expertos en MXFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer omnimodal (texto, imagen, video, audio), segun fuentes publicas del modelo base |
| Parametros totales | 1.023.182.841.600 (aproximadamente 1,02 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4,52 BPW), BPW3.5, BPW3.0, BPW2.5, BPW2.0; mezcla BF16/MXFP4 en MXFP4 y Q8_0/Q6_K en el resto de variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Pro-MOPD |
| Tamano del repositorio | 1999,8 GB |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts (MoE) de escala frontera con expertos cuantizados en MXFP4 de origen. El repositorio de AesSedai no modifica la topologia del modelo: aplica cuantizacion post-entrenamiento sobre los pesos publicados por Xiaomi. La innovacion del autor es la asignacion diferenciada de precision por tipo de tensor. Los tensores FFN (UP, GATE y DOWN) concentran la mayor parte del peso del modelo y son los que se cuantizan a la baja; el resto de tensores permanece en Q8_0 o Q6_K. Las variantes intermedias (BPW3.5, BPW3.0, BPW2.5, BPW2.0) se generaron con el PR de presupuesto de bits por peso de ed (llama.cpp PR 15550).

No se dispone de informacion sobre la composicion del dataset de entrenamiento del modelo base, el numero de tokens utilizados, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones de atencion o decodificacion del modelo original mas alla de la condicion omnimodal y la orientacion a agentes autonomos reportada por la prensa especializada. El sufijo "MOPD" del modelo base no aparece explicado en la informacion disponible.

## Capacidades

- Procesamiento omnimodal nativo: texto, imagenes, video y audio, segun la descripcion publica de la familia MiMo-V2.6.
- Generacion de texto y razonamiento general en el modelo base.
- Orientacion especifica a tareas de agente autonomo avanzado (advanced autonomous agent tasks).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte multilingue: no disponible; los idiomas no estan documentados en el repositorio.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Ejecucion local mediante llama.cpp gracias al formato GGUF, con soporte de offload parcial por capas.

## Casos de uso

- Despliegue local de un modelo de escala frontera en infraestructura propia: el repositorio permite ejecutar un MoE de 1,02 billones de parametros en servidores con multiples GPU sin depender de API externa, eligiendo la cuantizacion que se ajuste al presupuesto de VRAM disponible.
- Investigacion sobre cuantizacion selectiva: las cinco variantes con sus curvas de PPL y KLD permiten reproducir analisis de Pareto entre tamano de fichero y degradacion de calidad, comparando la estrategia de cuantizar solo FFN frente a cuantizaciones uniformes.
- Procesamiento de documentos multimodales: si se confirman las capacidades omnimodales del modelo base, podria emplearse para extraer informacion de imagenes escaneadas, audio y video combinados en un mismo flujo, aunque no hay datos de contexto maximo publicados.
- Agentes autonomos multi-paso: la orientacion del modelo base hacia tareas de agente lo hace candidato para pipelines de automatizacion con razonamiento encadenado, sujeto a verificar el soporte real de tool calling.
- Evaluacion comparativa de modelos de gran escala: sirve como referencia para medir el comportamiento de un MoE de mas de un billon de parametros bajo cuantizaciones agresivas (2,0 BPW) frente a versiones de alta fidelidad (MXFP4).
- Servicio de inferencia autoalojado para equipos con clausulas de soberania de datos, siempre que la licencia del modelo base lo permita (dato no disponible en el repositorio).
- Fine-tuning posterior sobre las variantes de mayor calidad: las cuantizaciones MXFP4 y BPW3.5, con degradacion declarada inferior al 3 por ciento, podrian servir de base para ajuste adicional, aunque el formato GGUF no es el mas adecuado para reentrenamiento.

## Benchmarks y rendimiento

El autor publica metricas de perplejidad (PPL) y divergencia KL (KLD) frente al modelo base para cada cuantizacion. Son las unicas cifras disponibles; no hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion proporcionada.

| Cuantizacion | Tamano | Mezcla | PPL | 1-(PPL media(Q)/PPL base) | KLD |
|---|---|---|---|---|---|
| MXFP4 | 537,99 GiB (4,52 BPW) | BF16 / MXFP4 | 3,171130 ± 0,015401 | +0,0352% | -0,000000 ± 0,000000 |
| BPW3.5 | 416,74 GiB (3,50 BPW) | Q8_0 / varia | 3,254415 ± 0,015658 | +2,6625% | 0,133381 ± 0,000783 |
| BPW3.0 | 357,11 GiB (3,00 BPW) | Q8_0 / varia | 3,479328 ± 0,017232 | +9,7575% | 0,189016 ± 0,001052 |
| BPW2.5 | 297,63 GiB (2,50 BPW) | Q6_K / varia | 3,790107 ± 0,019332 | +19,5612% | 0,261747 ± 0,001379 |
| BPW2.0 | 238,22 GiB (2,00 BPW) | Q6_K / varia | 4,554363 ± 0,024378 | +43,6701% | 0,414109 ± 0,001965 |

Interpretacion: MXFP4 es practicamente identica al modelo base (KLD 0,000000, incremento de PPL del 0,0352 por ciento). BPW3.5 mantiene la degradacion por debajo del 3 por ciento de PPL. A partir de BPW3.0 la perdida de calidad crece de forma acusada y BPW2.0 presenta un incremento de PPL superior al 43 por ciento, por lo que no resulta recomendable para tareas que exijan fidelidad.

## Requisitos de hardware

- VRAM estimada: al menos el tamano del fichero de pesos mas el overhead de contexto y activaciones. MXFP4 requiere unos 538 GiB, BPW3.5 unos 417 GiB, BPW3.0 unos 357 GiB, BPW2.5 unos 298 GiB y BPW2.0 unos 238 GiB.
- GPU recomendadas: nodos multi-GPU con H100 80 GB, H200, A100 80 GB o MI300X. La variante MXFP4 necesita del orden de 7 a 8 GPU de 80 GB; BPW2.0 requiere minimo 3 GPU de 80 GB, siendo 4 la configuracion holgada.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar el modelo completo. Solo seria viable con offload masivo a RAM del sistema y SSD, con latencias muy altas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y LM Studio para los casos con offload parcial. vLLM y TGI no estan confirmados para GGUF de este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo para ninguna de las variantes.
- Nota: todas las cifras de VRAM son estimaciones derivadas del tamano de fichero publicado; no proceden de mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| AesSedai/MiMo-V2.6-Pro-MOPD-GGUF (este repo) | 1,02 billones (total), activos no disponibles | no disponible | GGUF, 5 variantes de 4,52 a 2,00 BPW | no disponible | Metricas PPL/KLD publicadas por cuantizacion |
| AesSedai/MiMo-V2.6-Flash-MOPD-GGUF | no disponible | no disponible | GGUF | no disponible | Misma estrategia de cuantizacion MoE sobre la variante Flash |
| AesSedai/MiMo-V2.6-Flash-GGUF | no disponible | no disponible | GGUF | no disponible | Cuantizacion estandar de la variante Flash |
| Xiaomi MiMo-V2-Pro | no disponible | no disponible | no disponible | no disponible | Rango 8 global y 2 en LLM chinos segun Artificial Analysis Intelligence Index |

No se dispone de datos suficientes para comparar rendimiento en tareas con alternativas de otros fabricantes de la misma categoria.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia y tampoco se ha confirmado la del modelo base. No debe asumirse uso comercial permitido sin verificar la licencia de XiaomiMiMo/MiMo-V2.6-Pro-MOPD.
- Idiomas no documentados: se desconoce la cobertura multilingue real y el comportamiento en castellano.
- Longitud de contexto no publicada: no es posible planificar aplicaciones que dependan de ventanas de contexto largas sin datos verificados.
- Parametros activos no disponibles: al ser un MoE, el coste computacional por token no puede estimarse a partir de los parametros totales.
- Riesgo de degradacion en cuantizaciones bajas: BPW2.0 incrementa la PPL mas de un 43 por ciento respecto al base y BPW2.5 casi un 20 por ciento. Estas variantes son inadecuadas para tareas de razonamiento o generacion de codigo que requieran precision.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones de factualidad publicadas para esta cuantizacion.
- Sesgos: no se han publicado analisis de sesgo para el modelo base ni para estas cuantizaciones.
- Repositorio con muy poca traccion: 33 descargas y 2 likes en el momento de la consulta, sin validacion independiente de las metricas declaradas.
- Fecha de creacion registrada como 2026-09-30, coherente con las fuentes web que situan el lanzamiento de la familia MiMo-V2.6 a finales de septiembre de 2026.
- Compatibilidad: los ficheros estan pensados para llama.cpp; el soporte en otros runners puede ser incompleto o inexistente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AesSedai/MiMo-V2.6-Pro-MOPD-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Repositorio hermano (Flash MOPD GGUF): https://huggingface.co/AesSedai/MiMo-V2.6-Flash-MOPD-GGUF
- Repositorio hermano (Flash GGUF): https://huggingface.co/AesSedai/MiMo-V2.6-Flash-GGUF
- Pagina oficial de la serie MiMo-V2.6 de Xiaomi: https://mimo.xiaomi.com/mimo-v2-6
- Pagina oficial de MiMo-V2-Pro: https://mimo.xiaomi.com/mimo-v2-pro
- Cobertura de prensa sobre los modelos MOPD: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/28/xiaomi-mimo-v2-6-mopd-models/
- PR de llama.cpp con el presupuesto de bits por peso: https://github.com/ggml-org/llama.cpp/pull/15550
