# MattKent/screenbrief-parakeet-ultra-mixed-int8

## Resumen

Parakeet TDT 0.6B Ultra mixed int8 (build de ScreenBrief) es un paquete de reconocimiento automatico del habla (ASR) offline para audio mono a 16 kHz, distribuido en el formato que espera sherpa-onnx (`model_type="nemo_transducer"`). No es un modelo nuevo: es una re-cuantizacion parcial del export ONNX de `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`. La unica modificacion respecto al paquete int8 oficial es el encoder: 29 convoluciones (24 depthwise de las capas Conformer y 5 del pre-encoder) se mantienen en float32 mientras el resto de pesos se cuantiza a int8.

El modelo resuelve transcripcion de voz a texto en 25 idiomas europeos con un transductor TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parametros. Su interes practico esta en el despliegue: al ser un paquete ONNX de ~0,7 GB con encoder, decoder, joiner y tokens separados, se puede ejecutar en CPU sin GPU mediante sherpa-onnx, lo que lo hace adecuado para aplicaciones de dictado, subtitulado y transcripcion en local.

La relevancia de esta build concreta es de ingenieria: la exclusion selectiva de convoluciones de la cuantizacion es una tecnica documentada en el PR #4179 de sherpa-onnx para preservar calidad en capas sensibles, y el autor verifica la reproducibilidad del proceso comparando con el paquete oficial. El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto experimental sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) con encoder Conformer, decoder de prediccion y joiner; exportado a ONNX |
| Parametros totales | ~0,6 mil millones (segun denominacion del modelo base `parakeet-tdt-0.6b-v3`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance; no se documenta ventana maxima) |
| Tipos de cuantizacion | int8 dinamico (QUInt8) en encoder, decoder y joiner; 29 convoluciones del encoder en float32 |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transductor TDT de NVIDIA (familia Parakeet), con encoder basado en capas Conformer. El encoder incluye 24 capas con convoluciones depthwise (`/layers.N/conv/depthwise_conv/Conv`) y un modulo de pre-encoder con 5 convoluciones (`/pre_encode/conv/conv.0`, `.2`, `.3`, `.5`, `.6`). El decoder de prediccion y el joiner completan el transductor. El modelo base emplea un tokenizer con vocabulario propio; el `tokens.txt` de este paquete es identico al de la version v3 de NVIDIA.

Sobre el entrenamiento original no se aportan datos en la informacion disponible: no se documentan numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si esta documentado es el proceso de exportacion y cuantizacion. ScreenBrief parte del export fp32 oficial (`encoder.onnx` de 41.838.396 bytes mas `encoder.weights` de 2.435.420.160 bytes) y aplica `quantize_dynamic` de onnxruntime con `QuantType.QUInt8`, excluyendo 29 nodos `Conv` mediante `nodes_to_exclude`. El resultado son 29 convoluciones que permanecen como `Conv` en float32 y 48 que pasan a `ConvInteger`. Los metadatos ONNX del encoder oficial (`vocab_size`, `normalize_type`, `pred_rnn_layers`, `pred_hidden`, `subsampling_factor`, `model_type`, `version`, entre otros) se copian sin cambios y en el mismo orden.

La innovacion tecnica destacable es el control de calidad de la cuantizacion: el autor verifica que la misma llamada sin `nodes_to_exclude` reproduce el `encoder.int8.onnx` oficial (grafo identico ignorando metadatos y campos de productor), de modo que la unica diferencia es el conjunto de 29 convoluciones en float32. El encoder resultante ocupa 653.312.951 bytes frente a los 652.282.345 del oficial. Herramientas usadas: Python 3.11.9, onnx 1.23.2, onnxruntime 1.31.0, numpy 2.4.6, en Windows 11, con fecha de build 2026-11-12.

## Capacidades

- Reconocimiento automatico del habla offline sobre audio mono a 16 kHz, con salida de transcripcion.
- Cobertura multilingue de 25 idiomas europeos en un unico modelo, sin necesidad de seleccionar checkpoint por idioma.
- Decodificacion mediante transductor TDT, que predice duraciones de token ademas de los tokens.
- Integracion nativa con sherpa-onnx bajo `model_type="nemo_transducer"`, con encoder, decoder, joiner y tokens como ficheros separados.
- Ejecucion en CPU sin GPU, al estar cuantizado a int8 en la mayor parte de los pesos.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Subtitulado y transcripcion de reuniones en local: el paquete ONNX se ejecuta con sherpa-onnx en CPU, sin enviar audio a servicios externos, lo que encaja en entornos con requisitos de privacidad. Los 25 idiomas cubiertos permiten procesar reuniones multilingues con un solo modelo.
- Dictado por voz en aplicaciones de escritorio: al ocupar ~0,7 GB y no requerir GPU, puede empaquetarse dentro de una aplicacion de escritorio o una extension que transcriba en tiempo real audio de 16 kHz mono.
- Generacion de subtitulos para archivos multimedia en pipelines por lotes: el formato de cuatro ficheros permite orquestar la transcripcion de muchos audios con un proceso sherpa-onnx reutilizable, sin dependencia de red.
- Transcripcion de llamadas de atencion al cliente para analitica: el modelo convierte el audio en texto para posteriores tareas de clasificacion o busqueda; su licencia CC BY 4.0 permite uso comercial con atribucion.
- Investigacion en ASR europeo: sirve como baseline cuantizado para comparar el efecto de la cuantizacion selectiva de convoluciones frente al paquete int8 oficial, dado que el autor documenta el proceso de reproducibilidad.
- Prototipado de asistentes de voz embebidos: la build mixed int8 reduce el peso del encoder manteniendo las convoluciones sensibles en float32, lo que puede interesar en dispositivos con CPU limitada donde la precision del encoder importa.
- Evaluacion de calidad de cuantizacion: util para equipos que necesiten medir la degradacion de WER entre el export fp32, el int8 oficial y esta variante mixed int8 sobre sus propios corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER, MMLU, HumanEval ni metricas equivalentes, ni comparaciones numericas con el paquete int8 oficial o el export fp32. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso base; el modelo esta pensado para inferencia en CPU con sherpa-onnx. En GPU, el peso en memoria ronda los 0,7 GB en int8, mas overhead de runtime.
- GPU recomendadas: no se especifican en la informacion disponible. Al ser un modelo de ~0,6 B de parametros, cualquier GPU consumer reciente podria alojarlo, pero no hay datos de rendimiento publicados para confirmarlo.
- Cabe en GPU consumer: previsiblemente si por tamano (~0,7 GB de pesos), aunque no hay validacion publicada en la model card.
- Opciones de despliegue: sherpa-onnx es la via documentada (`model_type="nemo_transducer"`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son runtimes habituales para transductores ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MattKent/screenbrief-parakeet-ultra-mixed-int8 | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX int8 mixto | Re-cuantizacion con 29 convoluciones en float32; 0 descargas |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8 | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX int8 | Paquete int8 oficial de sherpa-onnx; referencia de comparacion |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX fp32 | Export fp32 oficial; mayor peso (~2,4 GB de weights) |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | NeMo | Modelo original de NVIDIA |

No se dispone de datos de rendimiento comparativo (WER, latencia) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad frente al paquete int8 oficial.
- La unica diferencia respecto al int8 oficial es la exclusion de 29 convoluciones de la cuantizacion; el beneficio real en WER no esta cuantificado en la model card.
- Modelo ASR, no un LLM: no soporta generacion de texto libre, razonamiento, codigo ni tool calling.
- Entrada restringida a audio mono a 16 kHz; no se documenta manejo de otros formatos o frecuencias de muestreo.
- Cobertura limitada a 25 idiomas europeos; no se documentan otros idiomas.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, acentos no cubiertos o solapamiento de hablantes; no se aportan tasas de error.
- No se documentan sesgos especificos del modelo base ni del post-entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribucion a NVIDIA, Moondream y sherpa-onnx, y exige indicar las modificaciones realizadas por ScreenBrief.
- El autor declara que ni NVIDIA, ni Moondream, ni el proyecto sherpa-onnx respaldan este paquete ni han revisado los cambios; se distribuye "as is" sin garantias.
- La fecha de creacion del repo (2026-11-12) y las versiones de herramientas indicadas deben tenerse en cuenta para reproducir el build.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MattKent/screenbrief-parakeet-ultra-mixed-int8
- Modelo base (post-entrenamiento): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paquete fp32 oficial de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra
- Paquete int8 oficial de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Pull request de referencia sobre exclusion de nodos: https://github.com/k2-fsa/sherpa-onnx/pull/4179
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Texto legal CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
