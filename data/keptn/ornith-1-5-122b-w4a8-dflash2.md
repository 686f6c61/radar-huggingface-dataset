# keptn/ornith-1.5-122b-w4a8-dflash2

## Resumen

Ornith 1.5 122B es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) desarrollado por el equipo Ornith, orientado a tareas de razonamiento, codigo y comprension de imagenes. Esta ficha concreta, publicada por el usuario keptn, no es el modelo original sino una compilacion cuantizada y empaquetada para el motor de inferencia radiance sobre GPUs AMD RDNA4: combina los pesos del modelo base cuantizados a 4 bits en los expertos y FP8 en el resto de lineales, junto con el drafter DFlash2 de decodificacion especulativa, todo en un unico fichero de 64,00 GiB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 122B parametros con ventana de contexto de 262.144 tokens en cuatro tarjetas Radeon AI PRO R9700 de 32 GB, algo que el modelo en bf16 o incluso en FP8 no permite con ese hardware. El precio es una ligera perdida de fidelidad respecto al original (KL medio de 0,0174 frente a 0,0118 del FP8) y una dependencia estricta del motor radiance en version 1.11.0 o superior.

No se dispone de informacion publica sobre la composicion del dataset de entrenamiento original, el numero de tokens vistos ni los detalles de alineacion del modelo base Ornith-1.5-122B; esta ficha se limita a lo documentado en la model card de la compilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con vision encoder; decodificacion especulativa DFlash2 |
| Parametros totales | 122B (denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos: 4-bit codebook con escala FP8 cada 64 pesos, rotacion Hadamard sobre 128, GPTQ. Otras lineales: FP8 con escala bf16 por bloque 128x128. Activaciones FP8. lm_head int8 con escala bf16 cada 128 columnas. Drafter: MXFP4 (escala E8M0 cada 32 pesos), cabeza de draft 2-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero unico de 64,00 GiB |
| Entradas | texto e imagen |
| Version del fichero | 1.0 (2026-10-22) |
| Motor requerido | radiance 1.11.0 o superior (radiance 2.0 no compatible) |
| Hardware probado | 4x Radeon AI PRO R9700 (32 GB), 215 W |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con capacidad de procesamiento de imagen y texto, disenado por el equipo Ornith para razonamiento y codigo. La model card de esta compilacion no detalla la arquitectura interna del base (numero de capas, dimension del hidden state, numero de expertos ni parametros activos por token), por lo que esos datos deben consultarse en la ficha de ornith-ai/Ornith-1.5-122B. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO.

Lo que si esta documentado es el proceso de construccion de este fichero concreto, en dos pasos. Primero se genero keptn/ornith-1.5-122b-w4a8, con los expertos cuantizados a 4 bits mediante GPTQ y el resto de pesos en FP8. Despues se sustituyo la capa MTP por el drafter DFlash2 de incoai (revision a5ed7396), recuantizado a MXFP4 con cabeza de draft a 2 bits, siguiendo la receta `q38-27b-fp8block-df2.recipe` de radiance. Los pesos del modelo se copiaron sin cambios desde el paso anterior. La calibracion se realizo con un corpus propio de 401.107 tokens de chat, documentos, codigo y llamadas a herramientas, formateado con la plantilla de chat de Ornith.

La innovacion principal es la integracion del drafter DFlash2 de 6 capas, que propone 15 tokens en una sola pasada y acelera la decodificacion sin cambiar los pesos del modelo principal. El motor radiance fija automaticamente esos 15 tokens especulativos, por lo que no debe configurarse `--num-speculative-tokens` manualmente.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo "thinking" activado por defecto y desactivable por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Generacion de codigo, con ajustes de muestreo recomendados propios (`--temp 0.6 --presence-penalty 0`).
- Comprension de imagenes (image-text-to-text): el pipeline declarado es image-text-to-text y la model card reporta evaluacion sobre DocVQA y AI2D.
- Procesamiento de documentos con contexto largo: la ventana de 262.144 tokens permite ingerir documentos extensos junto con imagenes.
- Soporte de tool calling y function calling: el corpus de calibracion incluye explicitamente llamadas a herramientas, lo que indica que el modelo base esta entrenado para ese uso.
- Decodificacion especulativa integrada mediante DFlash2, con 15 tokens propuestos por pasada.
- Capacidades multilingues: no documentadas en esta ficha.
- No se documenta soporte de audio ni de video en esta compilacion, aunque la seccion de la model card se titula "Images, audio and video"; solo se aportan mediciones de imagen.

## Casos de uso

- Analisis de documentos largos con soporte visual: el modelo puede recibir un PDF escaneado o un conjunto de imagenes de paginas junto con instrucciones en texto y razonar sobre todo ello dentro de una ventana de 262.144 tokens, lo que evita trocear el documento y perder contexto entre fragmentos.
- Asistencia a la programacion en produccion: con tool calling y un modo de codigo con temperatura recomendada de 0,6, encaja en pipelines que necesitan generar parches, explicar codigo o invocar funciones externas, siempre que el backend sea radiance sobre RDNA4.
- Razonamiento con cadena de pensamiento controlada: el modo thinking se activa por defecto y puede desactivarse por peticion, lo que permite usar el mismo modelo para tareas que exigen deliberacion (analisis de casos, matematicas) y para respuestas rapidas de baja latencia.
- Extraccion de informacion estructurada de documentos escaneados: combinando vision y contexto largo, se pueden procesar formularios, facturas o informes con decenas de paginas en una sola peticion y devolver JSON estructurado.
- Despliegue on-premise en hardware AMD: al ejecutarse en cuatro Radeon AI PRO R9700 con ROCm, es adecuado para organizaciones que ya operan infraestructura AMD y necesitan un modelo de 122B sin depender de CUDA ni de servicios en la nube.
- Servicio de chat multi-turno con concurrencia moderada: con 8 secuencias concurrentes el pool de KV alcanza 2.097.296 tokens, suficiente para atender varias conversaciones largas en paralelo con un throughput agregado de 330 tokens/s.
- Generacion acelerada por decodificacion especulativa: en cargas interactivas donde la latencia de decodificacion importa, el drafter DFlash2 aporta 279 tokens/s en un solo stream, adecuado para asistentes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card unicamente aporta metricas de fidelidad respecto al original bf16 y de velocidad de inferencia.

Fidelidad respecto al bf16 original (80 preguntas de MT-Bench, ambos turnos, 42.305 tokens de respuesta, thinking off):

| Fichero | KL medio | KL percentil 99 | Token top identico | Ratio de perplejidad |
|---|---|---|---|---|
| este fichero (w4a8 + DFlash2) | 0,0174 | 0,222 | 96,4% | x1,002 |
| keptn/ornith-1.5-122b-fp8 | 0,0118 | 0,139 | 97,2% | x1,003 |
| keptn/ornith-1.5-122b-fp8-dflash2 | 0,0118 | 0,139 | 97,2% | x1,003 |
| keptn/ornith-1.5-122b-w4a8 | 0,0174 | 0,222 | 96,4% | x1,002 |

Rendimiento en 4x Radeon AI PRO R9700 a 215 W, radiance 1.9.0 mas PR #144, KV en fp8, 15 tokens de draft, thinking off, BetterBench 0.6.1, temperatura 0,7 (mediana de tokens por segundo):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificacion, un stream | no cabe | no cabe | 279,0 |
| Prefill a 24k tokens | no cabe | no cabe | 7.268 |
| 4 streams, total | no cabe | no cabe | 330 |

Capacidad de contexto total (pool de KV compartido entre secuencias, `--max-model-len 262144`, KV fp8):

| Tarjetas | 2 secuencias | 4 secuencias | 8 secuencias |
|---|---|---|---|
| 1 | no cabe | no cabe | no cabe |
| 2 | no cabe | no cabe | no cabe |
| 4 | 524.320 | 1.048.640 | 2.097.296 |

Calidad en vision (greedy, thinking off, 4 tarjetas, radiance 1.15.1, medicion realizada con ornith-1.5-122b-fp8.rad):

| Entrada | Casos | Respuesta identica | KL medio | Token top identico |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D, seleccion fija) | 20 | 16/20 | 0,0328 | 91/95 |

## Requisitos de hardware

- VRAM: el fichero ocupa 64,00 GiB, por lo que necesita al menos cuatro tarjetas de 32 GB. No cabe en una ni en dos tarjetas, segun las pruebas del autor.
- GPU probadas: 4x Radeon AI PRO R9700 (32 GB, RDNA4) a 215 W. No hay datos de otras GPU.
- Consumer GPU: no cabe en ninguna GPU de consumo actual de 24 GB o menos; requiere cuatro aceleradores de 32 GB.
- Restriccion de arquitectura: radiance solo se ejecuta en AMD RDNA4; no hay soporte CUDA documentado.
- Restriccion de kernel: en una o dos tarjetas radiance no dispone de kernel de atencion para este modelo, porque tiene 16 cabezas de query por cabeza de KV.
- Despliegue: exclusivamente mediante el motor radiance, version 1.11.0 o superior (radiance 2.0 no es compatible). Imagen oficial `stilldeadcode/radiance:1.11.0`, con `--tp 4 --p2p on --kv-cache-dtype fp8`.
- Latencia y throughput: 279 tokens/s en decodificacion de un stream, 7.268 tokens/s de prefill a 24k tokens y 330 tokens/s agregados con 4 streams, todo en la configuracion de 4 tarjetas.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI: el formato `.rad` es propietario de radiance.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| keptn/ornith-1.5-122b-w4a8-dflash2 | 122B | 262.144 | `.rad` (64,00 GiB) | MIT | 4x RDNA4 32 GB | Incluye drafter DFlash2; KL medio 0,0174 |
| keptn/ornith-1.5-122b-fp8-dflash2 | 122B | 262.144 | `.rad` | MIT | 4x RDNA4 32 GB | Mejor fidelidad (KL 0,0118), mayor peso en disco |
| keptn/ornith-1.5-122b-w4a8 | 122B | 262.144 | `.rad` | MIT | 4x RDNA4 32 GB | Sin decodificacion especulativa |
| ornith-ai/Ornith-1.5-122B | 122B | no disponible | safetensors (bf16) | MIT | no disponible | Modelo original de referencia |

La comparacion con alternativas de otros fabricantes (Qwen, Llama, DeepSeek) no esta disponible en la informacion proporcionada, ya que no se aportan sus especificaciones ni resultados en esta ficha.

## Limitaciones y advertencias

- Dependencia estricta del motor radiance: el fichero no es utilizable con vLLM, llama.cpp, Ollama, TGI ni transformers; solo funciona con radiance 1.11.0 o superior, y radiance 2.0 no es compatible actualmente.
- Exclusivo de AMD RDNA4: no hay soporte para CUDA ni para generaciones anteriores de GPU AMD.
- Requiere cuatro tarjetas: con una o dos no hay kernel de atencion disponible para este modelo.
- Perdida de fidelidad por cuantizacion: el KL medio sube de 0,0118 (FP8) a 0,0174, y el token top coincide en el 96,4% de los casos frente al 97,2% del FP8. Aceptable para la mayoria de usos, pero relevante en tareas de alta precision.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos, especialmente en modo thinking desactivado.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del ingles sin evaluacion propia.
- Sin datos de sesgos: la model card no documenta evaluaciones de sesgo, toxicidad ni seguridad.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base ornith-ai/Ornith-1.5-122B y del drafter incoai/Ornith-1.5-122B-DFlash2, ya que la compilacion hereda sus pesos.
- Advertencia de configuracion: no debe fijarse `--num-speculative-tokens`, ya que radiance gestiona los 15 tokens del drafter automaticamente.
- Fecha de publicacion futura (2026-10-22): verificar la vigencia de los enlaces y versiones antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/ornith-1.5-122b-w4a8-dflash2
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Modelo base en FP8: https://huggingface.co/ornith-ai/Ornith-1.5-122B-FP8
- Drafter DFlash2: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Version FP8 de esta compilacion: https://huggingface.co/keptn/ornith-1.5-122b-fp8
- Version FP8 con DFlash2: https://huggingface.co/keptn/ornith-1.5-122b-fp8-dflash2
- Version w4a8 sin drafter: https://huggingface.co/keptn/ornith-1.5-122b-w4a8
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards usado: https://codeberg.org/keptn42/radiance-model-cards-framework
- Repositorio del equipo Ornith: https://github.com/ornith-ai/Ornith-1
