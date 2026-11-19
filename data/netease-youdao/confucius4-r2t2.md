# netease-youdao/Confucius4-R2T2

## Resumen

Confucius4-R2T2 es un modelo de reconocimiento automatico del habla (ASR) en streaming desarrollado por netease-youdao (NetEase Youdao). Se presenta como un modelo de transcripcion "realmente en tiempo real" que opera en modo de salida monotonico: el texto comprometido nunca se revisa, lo que evita el parpadeo y las correcciones disruptivas tipicas de los sistemas de subtitulado en vivo. El modelo parte de Qwen3-ASR-1.7B y lo adapta mediante aprendizaje del prefijo estable mas largo (Longest Stable Prefix, LSP) sobre 1.500 horas de audio en chino e ingles.

La propuesta tecnica central es la separacion entre texto comprometido y cola provisional: el modelo decide explicitamente cuando debe emitir un token y cuando debe esperar mas audio (accion `Wait`). Esto permite ajustar el compromiso entre precision y latencia de emision sin reentrenar, configurando la duracion del chunk (de 80 ms a 2 s) y el presupuesto de tokens provisionales. Con chunks de 160 ms y un token provisional alcanza un error del 5,76% frente al 21,01% del modelo base en la misma configuracion de streaming.

El modelo cuenta con 2.038.052.480 parametros y un repositorio de 4,1 GB en safetensors. Soporta inferencia offline y en streaming con el mismo checkpoint, backend vLLM, ruta offline con transformers y decodificacion opcional con llama.cpp, ademas de soporte nativo de contexto y hotwords. Su licencia es la NetEase Model Use License Agreement, distinta de las licencias permisivas habituales, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ASR (derivado de Qwen3-ASR-1.7B), encoder de audio congelado + proyector congelado + decoder de lenguaje ajustado |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (soporte de decodificacion opcional con llama.cpp implica pesos cuantizados, pero no se detallan tipos) |
| Idiomas soportados | Entrenamiento post-hoc en chino e ingles; transferencia evaluada en 10 idiomas adicionales (18 conjuntos de test) |
| Licencia | NetEase Model Use License Agreement (codigo bajo Apache 2.0) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de Qwen3-ASR-1.7B sin cambios estructurales: encoder de audio preentrenado, proyector y decoder de lenguaje. El ajuste se aplica exclusivamente al decoder de lenguaje, manteniendo congelados el encoder y el proyector. El entrenamiento se realiza en dos etapas: primero SFT y despues GRPO, sobre 1.500 horas de audio en chino e ingles. La innovacion principal es el aprendizaje del Longest Stable Prefix (LSP), que define objetivos de entrenamiento sobre que porciones de la transcripcion son suficientemente estables para comprometerse de forma definitiva, junto con una accion explicita `Wait` que el modelo aprende a invocar cuando necesita mas audio antes de emitir.

El resultado es un modo de decodificacion monotonico en el que el sufijo provisional permanece interno y solo se libera texto comprometido. Existen dos modos de operacion: `U=1` (prioridad a la calidad) y `U=0` (prioridad a la latencia). La duracion del chunk y el presupuesto de tokens provisionales permiten desplazar el punto de equilibrio precision-latencia sin reentrenar el modelo. La latencia de emision reportada excluye el tiempo de serving y de red.

## Capacidades

- Reconocimiento de voz en streaming con chunks configurables entre 80 ms y 2 s.
- Salida monotonica con texto comprometido permanente y sufijo provisional interno.
- Dos modos de operacion: prioridad a calidad (`U=1`) y prioridad a latencia (`U=0`).
- Inferencia offline de contexto completo y streaming con el mismo checkpoint.
- Backends de inferencia: vLLM, transformers (offline) y decodificacion opcional con llama.cpp.
- Soporte nativo de contexto y hotwords (pistas de topico y vocabulario).
- Transferencia multilingue: mejoras de streaming evaluadas en 18 conjuntos de test de 10 idiomas adicionales al chino y al ingles.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Subtitulado en vivo y captioning: el modo monotonico evita reescrituras del texto ya mostrado, lo que reduce el parpadeo visual en retransmisiones y reuniones; los chunks de 160 ms permiten una respuesta percibida como inmediata.
- Traduccion simultanea de voz: al comprometer texto de forma estable, los pipelines downstream de traduccion pueden consumir segmentos definitivos sin reprocesar correcciones, lo que simplifica la sincronizacion con el audio.
- Pipelines NLP y agentes LLM en tiempo real: la salida comprometida permite alimentar agentes o sistemas de comandos por voz sin que las revisiones de texto invaliden acciones ya desencadenadas.
- Transcripcion de reuniones y actas: el mismo checkpoint sirve para transcripcion offline de contexto completo, util para generar actas con mayor precision una vez finalizada la sesion.
- Asistentes de voz y atencion al cliente: el soporte de hotwords y contexto permite sesgar el reconocimiento hacia nombres de producto, entidades o vocabulario de dominio especifico.
- Dominios con vocabulario especializado (medico, legal, tecnico): las pistas de vocabulario nativas reducen errores en terminos poco frecuentes sin reentrenar el modelo.
- Despliegue en produccion con vLLM: el backend vLLM permite servir el modelo con throughput agregado para multiples sesiones concurrentes de transcripcion.

## Benchmarks y rendimiento

Datos publicados en la model card (error rate, menor es mejor):

| Configuracion | Error rate |
|---|---|
| R2T2, streaming 160 ms con 1 token provisional | 5,76% |
| Qwen3-ASR-1.7B base, mismo ajuste de streaming | 21,01% |
| Referencia de contexto completo | 5,15% |

El modelo se situa primero entre los modelos open source evaluados y reduce la brecha con la referencia de contexto completo a 0,61 puntos porcentuales. La evaluacion cubre 13 conjuntos de test en ingles y chino. No se detallan en la informacion disponible resultados por conjunto individual (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 2.038.052.480 parametros, en precision completa (bf16/fp16) el peso ronda los 4 GB, por lo que la inferencia requiere algo mas de 4 GB de VRAM mas overhead de activaciones y cache.
- GPU recomendadas: no especificadas en la informacion disponible.
- GPU de consumo: por tamano, el modelo es compatible con GPUs consumer de gama media-alta con al menos 8 GB de VRAM en bf16, aunque no se confirma oficialmente.
- Despliegue: vLLM (recomendado para serving), transformers para inferencia offline, llama.cpp para decodificacion opcional, y Docker como via recomendada por el autor.
- Latencia y throughput: la latencia de emision reportada excluye serving y red; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Confucius4-R2T2 | 2.038.052.480 | no disponible | Si, chunks 80 ms - 2 s, salida monotonica | NetEase Model Use License Agreement | Hugging Face, ModelScope, GitHub |
| Qwen3-ASR-1.7B (base) | 1,7B (aproximado) | no disponible | Si (21,01% error a 160 ms) | no disponible | Hugging Face |
| GPT-Live-Transcribe | no disponible | no disponible | Si (comparacion en demo) | propietaria | Servicio propietario |

La informacion disponible no incluye especificaciones detalladas de GPT-Live-Transcribe ni de otros modelos ASR open source comparables mas alla de la referencia al modelo base Qwen3-ASR-1.7B.

## Limitaciones y advertencias

- El post-entrenamiento se realiza solo en chino e ingles; la transferencia a otros idiomas se evalua pero no se garantiza el mismo nivel de precision.
- La licencia NetEase Model Use License Agreement no es una licencia permisiva estandar; es necesario revisar sus terminos antes de cualquier uso comercial. El codigo del repositorio es Apache 2.0, pero los pesos no.
- El modo monotonico implica que el texto comprometido no se corrige: si el modelo comete un error en un token ya emitido, este permanece en la salida.
- La latencia de emision reportada excluye el tiempo de serving y de red, por lo que la latencia extremo a extremo en produccion sera mayor.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas para este modelo.
- No se especifican la longitud de contexto, los tipos de cuantizacion soportados ni los requisitos de hardware oficiales.
- El rendimiento en dominios muy alejados de los datos de entrenamiento (audio con ruido extremo, acentos no cubiertos) no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Repositorio GitHub: https://github.com/netease-youdao/Confucius4-R2T2
- README en chino: https://github.com/netease-youdao/Confucius4-R2T2/blob/master/README.zh.md
- Licencia del modelo: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
- Licencia del codigo (Apache 2.0): https://github.com/netease-youdao/Confucius4-R2T2/blob/master/LICENSE
- Demo online: https://r2t2.youdao.com/demo
- Modelo en ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-R2T2
- Paper en arXiv: https://arxiv.org/abs/2611.06043
- Sitio web del proyecto: https://r2t2.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
