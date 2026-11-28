# Harsha001/DeepSeek-V4.1-Flash-1017-GSQ-RCO-StrixHalo-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-StrixHalo-GGUF es una compilación cuantizada del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Harsha001, cuyo objetivo es hacer viable la inferencia de un modelo Mixture-of-Experts (MoE) de 657.884.565.104 parámetros en una única máquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. Para ello se combinan dos técnicas: la poda de expertos por capa (se conservan entre 320 y 344 de los 384 expertos enrutados) y la cuantización de muy bajo bit (1,56 a 1,75 bits por peso en los expertos). El resultado es un artefacto de aproximadamente 97 GiB que debe residir en memoria de GPU, mientras que una tabla de búsqueda Engram de 110,6 GB permanece en SSD y se lee bajo demanda.

El modelo base es la variante DeepSeek-V4.1-Flash-1017, de arquitectura MoE, sobre la que se han aplicado ediciones de "abliteration" para eliminar los rechazos (uncensored). Concretamente, la build `IQ1_M-E320` deriva de la edición de AtomicChat y la nueva `IQ1_S_ROCMIQ-E344` de la edición de Infatoshi con el parche de pqhaz. La licencia declarada es MIT, lo que facilita el uso comercial, aunque conviene revisar las condiciones del modelo base original.

La relevancia actual del artefacto es doble: por un lado, demuestra que es posible ejecutar un modelo de más de 650.000 millones de parámetros en hardware de consumo profesional con memoria unificada; por otro, introduce un formato de cuantización propio para AMD (ROCmIQ1_S) que, según las pruebas de kernel del autor, supera en velocidad a IQ1_S en todas las tallas de fila. No obstante, se trata de una release de prueba comunitaria: ninguna de las dos builds se ha ejecutado todavía en un Strix Halo real, solo en CPU y en una NVIDIA GB10 con CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 384 expertos enrutados por capa |
| Parametros totales | 657.884.565.104 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 64K (objetivo de diseño de la build) |
| Tipos de cuantizacion | ROCmIQ1_S (1,56 bit) e IQ1_M GSQ-RCO (1,75 bit); el modelo base usa MXFP4 nativo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards por build: 3 de modelo + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 384 expertos enrutados por capa. El autor no documenta en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original DeepSeek-V4.1-Flash-1017 y no se reproducen aquí. Lo que sí se detalla es el proceso de compresión aplicado: poda de expertos por capa conservando los más relevantes según el peso de enrutamiento (344 de 384 en la build nueva, que cubren el 98,4% del peso de routing; 320 de 384 en la build antigua, con el 97,5%) y cuantización de los expertos conservados a 1,56-1,75 bits.

La innovación técnica más destacable es el formato ROCmIQ1_S, desarrollado específicamente para GPUs AMD. A diferencia de IQ1_S e IQ1_M, que dependen de grandes tablas de búsqueda (lookup grids) para decodificar, ROCmIQ1_S se decodifica sin esas tablas, lo que reduce la presión sobre memoria y acelera el kernel de matrices de expertos. En pruebas de kernel sobre una Radeon 8060S con Vulkan, el kernel de ROCmIQ1_S superó a IQ1_S en todas las tallas de fila, con una ventaja de aproximadamente el 11% en los tamaños que usa DeepSeek. Además, IQ1_M-E320 mezcla tensores IQ2, que son más lentos de decodificar. La tabla Engram, de 110,6 GB, se mantiene fuera de la GPU y se consulta bajo demanda desde SSD, de modo que solo unos 97 GiB deben caber en memoria gráfica.

## Capacidades

- Generación de texto conversacional y de formato largo, con un contexto objetivo de 64K tokens.
- Razonamiento multi-paso y tareas de agente, heredado del modelo base DeepSeek-V4.1-Flash-1017.
- Generación de código y matemáticas, aunque sin datos de benchmark publicados en la información disponible.
- Variante "uncensored": se han eliminado los rechazos mediante edición de abliteration, de modo que el modelo no declina peticiones por contenido.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card; debe verificarse en el runtime ROCmFPX.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking), visión o audio: no disponibles.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).

## Casos de uso

- Inferencia local de un MoE de gran escala en una estación de trabajo con Strix Halo: el modelo está diseñado para que unos 97 GiB residan en memoria unificada de 128 GB, lo que permite ejecutar un modelo de 657.000 millones de parámetros sin clúster multi-GPU.
- Investigación sobre cuantización extrema: sirve como banco de pruebas para evaluar el impacto de la poda de expertos y de formatos de 1-2 bits en la calidad (KL divergence, perplejidad) frente al modelo completo.
- Desarrollo y evaluación de formatos ROCmIQ: el artefacto incluye el nuevo tipo ROCmIQ1_S y permite medir su rendimiento real en GPUs AMD frente a IQ1_S e IQ1_M.
- Prototipado de asistentes sin restricciones de contenido: la edición uncensored es adecuada para entornos de investigación donde se necesita estudiar el comportamiento del modelo sin rechazos, siempre con las salvaguardas externas oportunas.
- Experimentación con contextos largos (hasta 64K) en hardware de consumo: útil para resumen de documentos extensos, análisis de repositorios de código o conversaciones multi-turno largas.
- Benchmarking de runtimes de inferencia: el autor pide a la comunidad que reporte `llama-bench pp512 / tg128` en Strix Halo, por lo que el modelo es un caso de prueba para comparar ROCmFPX, llama.cpp y otras implementaciones en AMD.

## Benchmarks y rendimiento

El autor publica métricas de calidad frente al modelo completo (Infatoshi, MXFP4 nativo), medidas con wikitext-2 (primeros 300.000 caracteres, 8 fragmentos de 2048 tokens, KL divergence de vocabulario completo):

| Build | KL divergence | Mismo token top | Perplejidad | Perplejidad vs modelo completo |
|---|---|---|---|---|
| IQ1_S_ROCMIQ-E344 | 0,629 ± 0,013 | 77,7% | 3,39 | ×1,69 |
| IQ1_M-E320 | 0,635 ± 0,015 | 77,6% | 3,42 | ×1,70 |
| Modelo completo (Infatoshi, MXFP4) | - | - | 2,01 | - |

El autor señala que la diferencia entre ambas builds está dentro del margen de error y que IQ1_M-E320 parte de una edición uncensored distinta (la de AtomicChat), lo que por sí solo la aleja unas 0,01 unidades de la referencia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 97 GiB (104,1 GB en la build ROCmIQ1_S, 104,5 GB en IQ1_M) para la parte del modelo; la tabla Engram de 110,6 GB permanece en SSD y no consume VRAM.
- Hardware objetivo: una única AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada.
- GPU recomendadas: Strix Halo (objetivo principal); el autor ha validado IQ1_M-E320 en una NVIDIA GB10 con CUDA. No se documenta compatibilidad con A100, H100 ni RTX 4090, y por tamaño no cabría en GPUs de consumo con 24 GB.
- Cabe en GPU de consumo: no en el sentido habitual; requiere memoria unificada de 128 GB o un sistema con suficiente VRAM agregada.
- Despliegue: runtime ROCmFPX (fork de llama.cpp). La build ROCmIQ1_S exige el commit `bb36a5fdb` o posterior; IQ1_M funciona con cualquier build de ROCmFPX que soporte DeepSeek-V4.1.
- Latencia y throughput: no disponibles; el autor solicita a la comunidad que reporte `llama-bench pp512 / tg128` en Strix Halo, ya que no se ha ejecutado en ese hardware.
- Almacenamiento: cada build ocupa unos 215 GB en disco (4 shards); el repositorio completo, con ambas builds y Engram, suma 742,7 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (IQ1_S_ROCMIQ-E344) | 657.884.565.104 (MoE, 344/384 expertos) | 64K (objetivo) | ROCmIQ1_S 1,56 bit | MIT | Hugging Face, runtime ROCmFPX |
| IQ1_M-E320 (misma familia) | 657.884.565.104 (MoE, 320/384 expertos) | 64K (objetivo) | IQ1_M 1,75 bit | MIT | Hugging Face, ROCmFPX |
| DeepSeek-V4.1-Flash-1017 (base) | 657.884.565.104 (MoE, 384/384 expertos) | no disponible | MXFP4 nativo | no disponible | Hugging Face (deepseek-ai) |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 657.884.565.104 (MoE) | no disponible | GSQ-RCO | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada; la comparación se limita a las variantes de la misma familia DeepSeek-V4.1-Flash-1017.

## Limitaciones y advertencias

- Estado de prueba comunitaria: ninguna de las dos builds se ha ejecutado en un Strix Halo real; solo se han validado en CPU y, la IQ1_M-E320, en una NVIDIA GB10 con CUDA. El rendimiento y la calidad en el hardware objetivo son desconocidos.
- La build ROCmIQ1_S requiere un runtime muy concreto (ROCmFPX commit `bb36a5fdb` o posterior); versiones anteriores no reconocen los tipos ROCmIQ o ignoran las escalas de expertos y producen salidas incorrectas.
- La perplejidad es aproximadamente 1,69-1,70 veces la del modelo completo (3,39-3,42 frente a 2,01), lo que implica una degradación de calidad medible.
- La poda de expertos descarta entre el 1,6% y el 2,5% del peso de enrutamiento por capa, lo que puede afectar de forma desigual a dominios especializados.
- La edición uncensored elimina los rechazos del modelo; en producción exige salvaguardas externas y revisión de contenido.
- La licencia declarada es MIT, pero el modelo base y las ediciones intermedias pueden tener condiciones adicionales; conviene verificar la licencia de deepseek-ai/DeepSeek-V4.1-Flash-1017 antes de uso comercial.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de sesgos.
- Idiomas soportados no documentados en la model card.
- El tamaño del repositorio (742,7 GB) y de cada build (unos 215 GB) exigen almacenamiento considerable; la tabla Engram debe permanecer accesible en SSD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Edición uncensored de Infatoshi: https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored
- Edición heretic de pqhaz: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- GSQ-RCO GGUF de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Edición uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Página del proyecto ROCmFPX: https://harshavardhan3002.github.io/ROCmFPX/
- Discusión comunitaria (reporte de pruebas): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF/discussions
- Paper referenciado arXiv:2604.18556: https://arxiv.org/abs/2604.18556
- Paper referenciado arXiv:2605.00649: https://arxiv.org/abs/2605.00649
