# bluehawana/Qwen3.8-27B-bf16-MTP-MLX

## Resumen

Qwen3.8-27B-bf16-MTP-MLX es una conversión al formato MLX del modelo denso multimodal Qwen3.8-27B de Alibaba, a la que se le ha añadido la cabeza de predicción multi-token (MTP) original del modelo para habilitar decodificación especulativa en runtimes MLX como oMLX. El repositorio, creado por bluehawana, parte de la conversión oficial de mlx-community en bf16 y le incorpora los 15 tensores `language_model.mtp.*` extraídos de EigenLabs, de modo que los pesos son byte-idénticos a la conversión base pero con la cabeza MTP funcional.

El problema que resuelve es el rendimiento de inferencia en Apple Silicon: al activar MTP, la decodificación autoregresiva pasa de 9,3 a 25,9 tokens por segundo en un Apple M5 Max de 128 GB en una sola secuencia, lo que supone una aceleración de aproximadamente 2,5 a 3 veces. El modelo mantiene las capacidades completas del Qwen3.8-27B original: visión, razonamiento configurable, contexto nativo de 256K tokens y licencia Apache-2.0. Es relevante para desarrolladores que quieran ejecutar un modelo de 27B multimodal en hardware Apple con un rendimiento competitivo sin recurrir a cuantización agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision y lenguaje) con cabeza MTP |
| Parametros totales | 27B (aproximado, del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (262K segun LM Studio) |
| Tipos de cuantizacion | bf16 en este repositorio; el modelo base mlx-community ofrece variantes cuantizadas adicionales |
| Idiomas soportados | Multilingue (no se detallan los idiomas exactos en la informacion disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. Es nativamente multimodal: procesa tanto texto como imagenes, e incorpora un modo de razonamiento configurable (thinking mode) que permite ajustar el esfuerzo de razonamiento entre niveles bajo, medio y alto (el chat template por defecto usa `xhigh`). La ventana de contexto nativa es de 256K tokens, lo que lo hace adecuado para tareas de agente de largo alcance y procesamiento de documentos extensos.

La innovacion principal de este repositorio es la integracion de la cabeza de prediccion multi-token (MTP), que es un modulo de drafter ligero que predice varios tokens futuros en paralelo. Esta cabeza se anade a los pesos bf16 de la conversion mlx-community, que declaraban la cabeza en `config.json` pero omitian sus pesos, dejando MTP desactivado silenciosamente. Aqui se registran los 15 tensores `language_model.mtp.*` en `model.safetensors.index.json` y se establece `text_config.mtp_num_hidden_layers = 1`. El runtime oMLX (o mlx-lm con el PR 990) puede entonces usar esta cabeza para decodificacion especulativa, verificando multiples tokens por pasada. No se dispone de informacion detallada sobre el entrenamiento original (datos, tokens, metodos de alineacion como RLHF o DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y chat con modo de razonamiento configurable (thinking mode con esfuerzo bajo, medio o alto).
- Comprension de imagenes (multimodal): puede analizar capturas, diagramas y documentos visuales.
- Razonamiento multi-step y soporte para flujos de agente (agentic workflows), incluida la ejecucion de tareas de codificacion complejas.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas, lo que permite integrarlo en pipelines automatizados.
- Multilingue: soporta multiples idiomas, aunque no se especifica la lista exacta.
- Decodificacion especulativa MTP: cuando se ejecuta con oMLX con `mtp_enabled`, acelera la generacion entre 2,5 y 3 veces en secuencias unicas.
- Contexto largo de 256K tokens, adecuado para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Agentes de codificacion en local: el modelo puede actuar como asistente de programacion con contexto largo, revisando repositorios completos y generando parches. Su soporte de tool calling permite conectarlo a editores o CLIs.
- Automatizacion de oficina: procesamiento de documentos, hojas de calculo y presentaciones gracias a su capacidad multimodal y de razonamiento. Puede extraer informacion de imagenes y generar resumenes.
- Asistentes de soporte tecnico: gestion de conversaciones multi-turno con contexto amplio (256K tokens) para mantener el historial completo de una incidencia.
- Analisis de imagenes y capturas: el componente de vision permite interpretar diagramas, esquemas o capturas de pantalla para depuracion o documentacion.
- Investigacion en decodificacion especulativa: este repositorio sirve como referencia para estudiar el impacto de MTP en MLX, con datos A/B publicados.
- Despliegue de un modelo 27B en Apple Silicon: permite ejecutar un LLM multimodal de alta capacidad en hardware Apple sin depender de GPUs NVIDIA, con rendimiento aceptable para uso interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es la velocidad de decodificacion medida por el autor en un Apple M5 Max de 128 GB con una sola secuencia:

| Configuracion | Velocidad de decodificacion |
|---|---|
| mlx-community bf16 sin cabeza MTP | 9,3 tok/s (autoregresivo plano) |
| Este repositorio con oMLX `mtp_enabled` | 25,9 tok/s |

La tasa de aceptacion del drafter en trafico de codificacion y agentes se situa entre el 75 % y el 99 %, con aproximadamente 3 tokens verificados por pasada (profundidad 3). MTP funciona solo en modo de una sola secuencia; con peticiones concurrentes el runtime vuelve a decodificacion por lotes normal.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 55,4 GB, por lo que requiere un Mac con al menos 64 GB de memoria unificada (128 GB recomendado para margen).
- GPU: exclusivo para Apple Silicon (M-series). No es compatible directamente con GPUs NVIDIA; para esas plataformas se debe usar el modelo original de HuggingFace.
- Opciones de despliegue: oMLX (con `mtp_enabled` activado), mlx-lm (con el PR 990 de soporte MTP), y cualquier runtime MLX que implemente decodificacion especulativa.
- Latencia y throughput: en un M5 Max de 128 GB, 25,9 tok/s en una sola secuencia con MTP habilitado; 9,3 tok/s sin la cabeza MTP.
- Con cuantizacion (por ejemplo, 4-bit u 8-bit) el modelo podria ejecutarse en equipos con menos memoria, pero este repositorio solo ofrece bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Decodificacion especulativa |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 256K | Vision + texto | Apache-2.0 | Safetensors (PyTorch) | No (requiere integracion externa) |
| mlx-community/Qwen3.8-27B-bf16 | 27B | 256K | Vision + texto | Apache-2.0 | MLX bf16 | No (cabeza MTP declarada pero sin pesos) |
| Este repositorio | 27B | 256K | Vision + texto | Apache-2.0 | MLX bf16 + MTP | Si (con oMLX) |

No se dispone de datos de rendimiento comparativo con otros modelos de 27B en MLX (por ejemplo, Gemma 2 27B o Llama 3.1 8B) en la informacion proporcionada.

## Limitaciones y advertencias

- La aceleracion MTP solo funciona con runtimes que la soporten explicitamente (oMLX con `mtp_enabled`, mlx-lm con el PR 990). Sin ese soporte, el modelo se comporta como una conversion bf16 estandar, sin ventaja de velocidad.
- MTP es de una sola secuencia: bajo cargas concurrentes, el rendimiento vuelve a ser el de decodificacion por lotes normal.
- El tamaño en bf16 (~55 GB) limita su uso a Macs con mucha memoria unificada; para equipos con menos RAM se necesitarian cuantizaciones que no se incluyen en este repositorio.
- No se ha verificado el comportamiento del modelo en cuanto a sesgos o alucinaciones; como cualquier LLM grande, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B por si hubiera condiciones adicionales.
- La fecha de creacion del repositorio (2026-08-18) es posterior a la informacion publica disponible sobre el modelo base, lo que sugiere que podria tratarse de una version reciente o de un desarrollo experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bluehawana/Qwen3.8-27B-bf16-MTP-MLX
- Modelo base (mlx-community): https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Cabeza MTP original (EigenLabs): https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Modelo Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Pagina de LM Studio: https://lmstudio.ai/models/qwen3.8
- Documento MTP con metodologia A/B: https://huggingface.co/datasets/bluehawana/qwen3.8-27b-apple-silicon-concurrency/blob/main/MTP.md
- Codigo del experimento: https://github.com/bluehawana/Qwen3.827B-SGLang-mpbm5max/blob/mtp-speculative-decoding/mtp/README.md
