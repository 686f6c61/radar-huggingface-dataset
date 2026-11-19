# sairaph-official/Qwen3-1.7B-c421cc3

## Resumen

Qwen3-1.7B-c421cc3 es un espejo (mirror) del repositorio litert-community/Qwen3-1.7B, publicado por el usuario sairaph-official para su uso en la aplicacion LLM Server. No se trata de un modelo nuevo ni de un ajuste fino: es una copia byte a byte de los ficheros upstream en el commit `c421cc3775575372ac2ca4aa1bebc97300ae36b6`, con la licencia Apache 2.0 anadida por el espejo. El modelo base subyacente es Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parametros desarrollado por el equipo Qwen de Alibaba.

El artefacto incluido en este repositorio es `Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm`, una exportacion en formato LiteRT-LM con cuantizacion dinamica INT4 (pesos en bloques de 32, activaciones FP32) y optimizaciones de grafo para GPU (operaciones compuestas de RoPE, atencion, SwiGLU y actualizacion de KV-cache, mas proyecciones QKV y Gate/Up fusionadas). Su proposito es la generacion de texto en dispositivo (on-device), es decir, inferencia local en moviles y equipos de consumo sin depender de la nube.

La relevancia de esta ficha es doble: por un lado, documenta un formato de despliegue poco habitual (LiteRT-LM, el runtime de Google AI Edge) frente a los habituales GGUF o safetensors; por otro, sirve de referencia de rendimiento real medido en hardware movil (Galaxy S26, Pixel 8a) con cifras de prefill y decodificacion. El contexto por defecto configurado en los metadatos es de 4.096 tokens, aunque la exportacion se realizo con una cache de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto en metadatos; cache exportada de 32.768 tokens |
| Tipos de cuantizacion | Dinamica INT4 (pesos en bloques de 32, activaciones FP32); el repo upstream tambien ofrece INT8 dinamico |
| Idiomas soportados | Ingles (segun la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM; pesos externos en seccion TFLiteWeights) |
| Tamano del artefacto | 932 MB (`Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm`, 977.184.032 bytes) |
| Runtime requerido | litert-lm >= 0.18.0 (probado en 0.18.0) |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso decoder-only con atencion multi-cabeza, normalizacion RMSNorm, QK-norm, activacion SwiGLU y embeddings RoPE. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO para el modelo base; esa informacion no esta disponible en la documentacion proporcionada. Lo que si se documenta es el proceso de conversion: el modelo se exporto mediante LiteRT Torch (`litert-torch`) en el commit `0a81bf6f3` con la opcion `--apply_gpu_composites=True`, y se cuantizo con AI Edge Quantizer.

La innovacion tecnica relevante esta en la exportacion, no en el entrenamiento. La variante INT4 incorpora operaciones compuestas especificas para la ruta GPU de LiteRT-LM: RMSNorm, el paso de QK-norm y RoPE, la atencion, SwiGLU y la actualizacion de KV-cache se ejecutan como kernels compuestos, y las proyecciones QKV y Gate/Up estan fusionadas. Ademas, se configura con asignacion estatica de memoria para el prefill y se exporto con longitudes de prefill de 128 y 1.024 tokens y una cache de 32.768 tokens. El tokenizador es identico byte a byte al de Qwen/Qwen3-1.7B. La configuracion oficial qwen3 de LiteRT-LM activa el modo thinking por defecto (salvo que `enable_thinking` sea falso), enruta el razonamiento por el canal de pensamiento y parsea las llamadas a herramientas en el propio runtime.

## Capacidades

- Generacion de texto en ingles con modo thinking activado por defecto, que separa el razonamiento interno del texto final.
- Razonamiento multi-paso mediante el canal de pensamiento (thought channel) gestionado por el runtime.
- Soporte de tool calling / function calling: el runtime de LiteRT-LM parsea las llamadas a herramientas segun la configuracion oficial de qwen3.
- Inferencia en dispositivo sin conexion a red, orientada a moviles y equipos de consumo.
- Ejecucion en GPU movil (OpenCL) y en CPU, con rutas de ejecucion diferenciadas.
- Contexto efectivo de 4.096 tokens por defecto, ampliable hasta la cache exportada de 32.768 tokens.
- Capacidades multilingues limitadas: la model card y los tags declaran unicamente ingles.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Asistente de texto offline en aplicaciones moviles: el artefacto de 932 MB cabe en el almacenamiento de un telefono moderno y se ejecuta con el runtime LiteRT-LM, permitiendo generar respuestas sin enviar datos a servidores externos; adecuado para apps de notas, correo o productividad con requisitos de privacidad.
- Procesamiento de lenguaje natural en el borde (edge computing): clasificacion, resumen y reescritura de textos cortos en dispositivos IoT o embebidos donde no hay conectividad estable, aprovechando el contexto de 4.096 tokens.
- Chat de soporte con razonamiento visible: el modo thinking por defecto permite mostrar al usuario el razonamiento intermedio en el canal de pensamiento, util en asistentes educativos o de diagnostico tecnico que requieren trazabilidad.
- Integracion de tool calling en asistentes locales: el runtime parsea las llamadas a funciones, de modo que el modelo puede invocar APIs locales (calendario, clima, ficheros) en una app Android mediante LiteRT-LM.
- Prototipado rapido en Android con Edge Gallery: la app oficial de Google AI Edge permite importar el modelo desde Hugging Face y probarlo sin escribir codigo, lo que sirve para validar casos de uso antes de integrar el runtime en una aplicacion propia.
- Generacion de texto en entornos con GPU movil: con 1.187 tok/s de prefill y 38,8 tok/s de decodificacion medidos en un Galaxy S26, es viable para respuestas conversacionales de pocas decenas de tokens con latencia aceptable.
- Evaluacion comparativa de formatos de despliegue: util para equipos que comparan LiteRT-LM frente a GGUF/llama.cpp en el mismo hardware, ya que la model card publica cifras de memoria pico (RSS) y throughput en dispositivos concretos.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones de rendimiento de inferencia, no benchmarks de calidad (MMLU, HumanEval, GSM8K). Se reproducen a continuacion tal cual:

| Metrica | Galaxy S26 (GPU, OpenCL) | Notas |
|---|---|---|
| Prefill (1.024 tokens) | 2.064 tok/s | `Qwen3_1.7B.litertlm` INT8, LiteRT-LM 0.19.0 |
| Decodificacion | 29,7 tok/s | `Qwen3_1.7B.litertlm` INT8, LiteRT-LM 0.19.0 |
| Prefill (1.024 tokens) | 1.187 tok/s | `Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm` INT4 (2026-10-29) |
| Decodificacion | 38,8 tok/s | `Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm` INT4 (2026-10-29) |

| Memoria pico (VmHWM, CPU) | Fichero nuevo INT8 | Fichero anterior |
|---|---|---|
| Pixel 8a (prompt 1.355 tok, 256 decode, KV 2.048) | 3.254-3.267 MiB | 2.776-3.080 MiB |
| Galaxy S26 (mismas condiciones) | 3.408-3.460 MiB | 2.853-3.109 MiB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el artefacto INT4 ocupa 932 MB en disco; la variante INT8 del repo upstream ocupa 1.674 MiB. En CPU, la memoria pico medida con prompts largos se situa entre 2,7 y 3,5 GiB de RSS segun dispositivo y fichero.
- GPU recomendadas: la ruta GPU de LiteRT-LM esta validada en GPU moviles (OpenCL) de Galaxy S26 y Pixel 8a; no se documentan requisitos para A100, H100 o RTX 4090, ya que el objetivo es el despliegue en dispositivo.
- Cabe en GPU de consumo: si, en el sentido de que esta disenado para GPU integradas de telefonos; no se aportan datos de ejecucion en GPU de escritorio.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm run`, runtime embebido), app Edge Gallery de Google AI Edge (Android). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill de 1.187-2.064 tok/s y decodificacion de 29,7-38,8 tok/s en Galaxy S26 con GPU; las cifras dependen del fichero (INT4 vs INT8) y de la version del runtime (0.18.x vs 0.19.0).
- Requisito de version: la ruta GPU del fichero INT8 nuevo exige LiteRT-LM >= 0.19.0; el fichero INT4 funciona con >= 0.18.0. Las builds Android v0.18.0 y v0.18.1 se cuelgan con ficheros de pesos externos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B-c421cc3 (este) | 1,7 B | 4.096 (cache 32.768) | LiteRT-LM INT4 | Apache 2.0 | On-device, GPU movil |
| Qwen/Qwen3-1.7B (original) | 1,7 B | no disponible en la informacion | safetensors | Apache 2.0 | Entrenamiento y servidor |
| litert-community/Qwen3-1.7B (upstream) | 1,7 B | 4.096 | LiteRT-LM INT8 e INT4 | Apache 2.0 | On-device, GPU movil |

La comparativa con alternativas de otros fabricantes (Llama 3.2 1B, Gemma 3 1B, Phi-3.5-mini) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento ni de contexto de esos modelos en esta ficha.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: cualquier correccion o actualizacion debe buscarse en litert-community/Qwen3-1.7B y en Qwen/Qwen3-1.7B.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto por defecto de solo 4.096 tokens; aunque la cache exportada es de 32.768, no se documenta como configurar el contexto extendido en el runtime.
- Riesgo de alucinacion inherente a los modelos de 1,7 B de parametros; no se han publicado evaluaciones de fidelidad factual.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva con `enable_thinking: false`.
- Restricciones tecnicas de version: la ruta GPU del fichero INT8 requiere LiteRT-LM >= 0.19.0 y falla en 0.18.1; las builds Android 0.18.0 y 0.18.1 se cuelgan con pesos externos.
- Licencia Apache 2.0 permite uso comercial, pero el espejo anade ficheros de licencia propios; conviene verificar la procedencia de cada fichero antes de redistribuirlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica nula validacion por parte de la comunidad.
- No se documentan sesgos especificos ni evaluaciones de seguridad del modelo base en la informacion disponible.

## Enlaces

- Repositorio del espejo: https://huggingface.co/sairaph-official/Qwen3-1.7B-c421cc3
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- App Edge Gallery (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Releases de Edge Gallery: https://github.com/google-ai-edge/gallery/releases
