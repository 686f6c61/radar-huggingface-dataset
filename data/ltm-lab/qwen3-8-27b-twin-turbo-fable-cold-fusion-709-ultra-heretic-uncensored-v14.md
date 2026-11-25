# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14 es una conversión arquitectónica del modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, publicada por LTM-Lab. No se ha entrenado, fusionado ni cuantizado ningún peso: los tensores son idénticos byte a byte a los del modelo original. Lo que añade esta versión es una arquitectura de memoria episódica denominada V14 (`Qwen3_5V14ForConditionalGeneration`), implementada mediante dos ficheros de código (`configuration_qwen_dense_v14_reinstatement.py` y `modeling_qwen_dense_v14_reinstatement.py`) y un `auto_map` en `config.json`.

El modelo tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y un repositorio de 55,6 GB en safetensors. Su rasgo diferencial es que, servido con una imagen Docker modificada de SGLang, mantiene una memoria persistente en disco entre peticiones: lo dicho en una conversación puede recuperarse en otra conversación posterior y separada, sin que nada se añada al prompt en forma de texto. Es relevante para quienes investigan mecanismos de memoria a largo plazo en LLM y para desarrolladores que necesitan agentes con estado persistente sin recurrir a bases de datos vectoriales externas ni a resúmenes inyectados en el contexto.

La ficha se basa exclusivamente en la model card y los metadatos disponibles; los datos de entrenamiento, benchmarks y composición del dataset original no están documentados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención lineal/SSM híbrida (tags `qwen3_5`, `qwen3_6`, `qwen3_8`; backend `mamba-ssm`), más capa de memoria episódica V14 (`Qwen3_5V14ForConditionalGeneration`) |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado en el comando de servicio con `--context-length 262144`) |
| Tipos de cuantizacion | FP8 disponible en variante separada (28,5 GB de pesos); el repositorio principal está en safetensors sin cuantizar (51 GB de pesos) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card; el campo `language` de metadatos solo lista `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model-mtp-restored.safetensors` con la cabeza MTP para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~27,8 B parámetros que combina mecanismos de atención con capas de estado recurrente (SSM), a juzgar por los argumentos de servicio `--linear-attn-backend triton` y `--mamba-ssm-dtype float32`, y por las etiquetas `qwen3_5`, `qwen3_6` y `qwen3_8`. Incorpora una cabeza MTP (multi-token prediction) empleada para decodificación especulativa con el algoritmo EAGLE. La innovación principal de esta conversión no está en los pesos, sino en la capa de memoria episódica: durante la lectura de un prompt, las claves y valores calculados por las capas de atención se fragmentan en eventos de hasta 128 tokens y se escriben en un almacén en disco, cada uno acompañado de un *engram* de bajo rango del estado que deja en las capas recurrentes. En una petición posterior, el prompt se lee una vez para determinar qué solicita, se recuperan por votación única (para todas las capas y cabezas) los eventos cuyas claves atraerían su atención, sus engrams se componen en el estado recurrente de la petición y el prompt se relee con las claves y valores recuperados fusionados en la atención. Nada se recupera como texto ni se añade al prompt. Además, durante la generación la petición atiende también al evento que el modelo del mundo de la memoria espera a continuación (*foresight*).

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Los datasets referenciados en metadatos (`DavidAU/Polar-STRICT-Datasets`, `DavidAU/F451-STRICT-Datasets`, `DavidAU/THE-DECKARD-Datasets`) corresponden al linaje del modelo original, no a esta conversión, que no entrena nada.

## Capacidades

- Generación de texto conversacional multi-turno con memoria persistente entre sesiones independientes (requiere el servidor SGLang modificado).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), aunque la model card no detalla el codificador visual ni el formato de entrada.
- Razonamiento con modo *thinking*: el comando de servicio activa `--reasoning-parser qwen3-thinking`.
- Tool calling / function calling: parser `qwen3_coder` configurado en el servidor.
- Decodificación especulativa EAGLE con cabeza MTP integrada.
- Soporte multilingüe declarado para 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Recuperación de información por atención a eventos almacenados, sin inyección de texto en el prompt.
- Capacidad de "olvido" total mediante borrado del directorio `/memory`.

## Casos de uso

- Asistentes con memoria de usuario persistente: el servidor guarda claves y valores de cada prompt en `/memory` y los recupera en conversaciones posteriores, de modo que un asistente puede recordar preferencias o hechos dichos días antes sin necesidad de una base de datos vectorial ni de resúmenes en el contexto. Requiere un servidor y un directorio de memoria por usuario o inquilino.
- Atención al cliente multi-sesión: con 262.144 tokens de contexto y memoria en disco que sobrevive a reinicios, un agente puede retomar un caso abierto en una sesión anterior y responder con el historial relevante fusionado en la atención, no pegado en el prompt.
- Agentes autónomos de larga duración: la memoria episódica evita que el agente tenga que reenviar todo su historial en cada paso; el estado recurrente compuesto a partir de los engrams recuperados actúa como resumen interno implícito.
- Investigación en mecanismos de memoria en LLM: la implementación es reproducible (dos ficheros de código más una imagen Docker pública) y permite experimentar con recuperación por votación, composición de engrams y *foresight* sobre un modelo de 27,8 B.
- Procesamiento de documentos largos con imagen y texto: el pipeline `image-text-to-text` junto con el contexto de 262.144 tokens permite ingerir documentos extensos con figuras y consultarlos después.
- Pipelines de código con tool calling: el parser `qwen3_coder` y el modo thinking permiten integrar el modelo en flujos de generación de código con llamadas a herramientas, aunque la memoria episódica no está pensada para este escenario.
- Despliegue con cuantización FP8: la variante FP8 (28,5 GB) ofrece 71,5 tokens/s de decodificación frente a 48,5 del modelo completo, con un 0,30 % más de perplejidad, para entornos con menos VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son de la variante FP8, medidos por el autor:

| Metrica | Modelo completo | Variante FP8 |
|---|---|---|
| Tamano de pesos | 51 GB | 28,5 GB |
| Decodificacion | 48,5 tok/s | 71,5 tok/s |
| Perplejidad | referencia | +0,30 % |
| Verificaciones de memoria | superadas | superadas (almacen propio) |

Estas cifras proceden de la model card y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: el comando de servicio documentado exige una GPU de 96 GB (probado en RTX PRO 6000 Blackwell) con `--mem-fraction-static 0.78`. La variante FP8, con 28,5 GB de pesos, reduce el requisito pero la model card no documenta su configuración mínima exacta.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) para el modelo completo; para FP8 se puede estimar una GPU de 48-80 GB, aunque no está confirmado en la documentación.
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en el modelo completo; la variante FP8 de 28,5 GB tampoco cabe en 24 GB sin cuantización adicional no documentada.
- Opciones de despliegue: exclusivamente la imagen Docker `lovewin10/sglang-v14:nightly-dev-cu13-20260924-ffac53d7-v14`, que es `lmsysorg/sglang:nightly-dev-cu13-20260924-ffac53d7` con SGLang reemplazado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la memoria episódica depende del SGLang modificado.
- Throughput: 48,5 tok/s en decodificación con el modelo completo y 71,5 tok/s con FP8, según el autor.
- Requisitos adicionales: Docker con runtime NVIDIA, directorio escribible para `/memory` y `--trust-remote-code` obligatorio por el código personalizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria persistente | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este modelo (v14) | 27,8 B | 262.144 | Si, en disco via SGLang modificado | Apache 2.0 | Solo imagen Docker SGLang v14 |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (base) | 27,8 B | No disponible | No | Apache 2.0 (heredada) | SGLang estándar, transformers |
| LTM-Lab/...-v14-FP8 | 27,8 B | 262.144 | Si, almacen propio | Apache 2.0 | Imagen Docker SGLang v14 |

No se dispone de información sobre otros modelos comparables de la misma categoría (memoria episódica persistente en LLM de ~27 B) en la documentación proporcionada.

## Limitaciones y advertencias

- **Sin separación entre usuarios**: todas las peticiones leen y escriben el mismo almacén `/memory`. Para aislar memorias por usuario o inquilino hay que levantar un servidor con su propio directorio por cada uno.
- **Privacidad**: `/memory` contiene los token ids y las claves y valores de atención de cada prompt leído; debe tratarse como un registro de conversaciones y borrarse para olvidar.
- **Falsos positivos de recuperación**: una pregunta que no solicita nada del almacén puede recuperar poco o nada, pero su respuesta no siempre coincide palabra por palabra con la del modelo sin memoria, porque un evento parecido puede pasar la votación y el *foresight* puede influir en la generación.
- **Dependencia de código personalizado**: requiere `--trust-remote-code` y una imagen Docker concreta; no es portable a otros motores de inferencia sin trabajo adicional.
- **Sin datos de entrenamiento ni benchmarks**: no se puede evaluar la calidad del modelo base ni el impacto de la memoria en tareas estándar con la información disponible.
- **Riesgo de alucinación**: no cuantificado en la documentación; el modelo base es un finetune comunitario sin evaluación publicada.
- **Sesgos**: no documentados; el modelo base está etiquetado como `uncensored`, lo que implica ausencia de alineación de seguridad y mayor probabilidad de generar contenido inapropiado.
- **Idiomas**: aunque se declaran 16 idiomas, el campo de metadatos `language` solo lista `en`; el soporte real del resto no está verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base es un finetune comunitario cuya procedencia y cumplimiento de licencias upstream no se detallan.
- **Capacidad visual**: el pipeline es `image-text-to-text`, pero no se documenta el codificador visual, el formato de imagen ni los límites de resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante FP8: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14-FP8
- Imagen Docker SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v14
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
