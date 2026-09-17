# devendradhakad/autodroid-litert-community-MiniCPM5-1B

## Resumen

MiniCPM5-1B es un modelo de lenguaje causal denso de aproximadamente 1.080 millones de parametros desarrollado por OpenBMB (Universidad de Tsinghua), disenado especificamente para despliegue local en dispositivos con recursos limitados. Esta ficha corresponde a la conversion del checkpoint original a formato LiteRT-LM (antiguo TensorFlow Lite) publicada por el usuario `devendradhakad`, que permite ejecutar el modelo de forma totalmente offline en moviles Android y hardware edge mediante la libreria LiteRT de Google.

Frente al checkpoint original en BF16, esta version empaqueta los pesos en dos variantes cuantizadas: una mixta INT4-block32 para las capas lineales con INT8 en embeddings y cabeza de salida (`wi4b32_wi8_afp32`), y una INT8 dinamica solo de pesos (`dynamic_wi8_afp32`). Ambas mantienen activaciones en FP32, lo que reduce el impacto en precision frente a cuantizaciones mas agresivas. El repositorio ocupa 0,8 GB y esta liberado bajo licencia Apache-2.0, con soporte de ingles y chino.

La relevancia actual del modelo reside en su combinacion de ventana de contexto nativa de 131.072 tokens, soporte de razonamiento hibrido mediante plantilla `<think>` y un tamano que cabe en la memoria de un telefono de gama alta. Para desarrolladores que necesitan asistentes locales, agentes de codigo o flujos de tool calling sin conexion ni coste de inferencia en la nube, esta conversion resuelve la parte de empaquetado y ejecucion en el runtime de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 (~1B) |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | INT4-block32 (lineales) + INT8 (embedding y lm_head) con activaciones FP32 (`wi4b32_wi8_afp32`); INT8 dinamico solo pesos con activaciones FP32 (`wi8_afp32`); baseline BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, sucesor de TensorFlow Lite); el modelo base upstream se distribuye en safetensors/BF16 |
| Capas | 24 |
| Cabezas de atencion | 16 (query) / 2 (KV), GQA |
| Tamano del repositorio | 0,8 GB |
| Libreria de inferencia | litert |
| Modelo base | openbmb/MiniCPM5-1B |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal estandar tipo Llama, con 24 capas y atencion con query grouping (GQA) de 16 cabezas de consulta frente a 2 cabezas de clave/valor. Esta relacion 8:1 reduce de forma sustancial el tamano del KV cache, algo critico cuando se quiere sostener una ventana de 131.072 tokens en memoria de dispositivo. No se trata de un modelo MoE ni de una arquitectura hibrida tipo SSM: es un denso puro, lo que simplifica el despliegue pero implica que todos los parametros se activan en cada token.

La model card proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico documentado es la existencia de un modo de razonamiento hibrido: el mismo checkpoint puede funcionar como asistente rapido o como razonador deliberado activando la plantilla `<think>` mediante el parametro `enable_thinking`. Esta conversion a LiteRT-LM no reentrena el modelo; unicamente cuantiza los pesos y los empaqueta para el runtime de Google, con asignacion estatica de memoria de prefill en la variante INT8 dinamica.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento deliberado con modo de pensamiento activable (`enable_thinking`), desactivado por defecto en las evaluaciones de cuantizacion para reducir consumo de contexto.
- Generacion de codigo, presentada por el autor como uno de los puntos fuertes de la clase 1B.
- Uso de herramientas (tool use / function calling), destacado explicitamente en la model card como capacidad SOTA en su categoria de tamano.
- Razonamiento de multiples pasos y flujos de agente, orientados a asistentes locales y agentes de codificacion.
- Contexto largo de 131.072 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Inferencia completamente offline en dispositivo, sin llamadas a red.
- No se documentan capacidades de vision, audio, ni soporte multimodal en esta version.

## Casos de uso

- Asistentes moviles sin conexion: el modelo se integra en una app Android mediante la Edge Gallery de Google o el runtime LiteRT-LM, permitiendo responder consultas en avion, zonas rurales o entornos con red restringida sin enviar datos a servidores externos.
- Agentes de codigo en el propio dispositivo: con soporte de tool calling puede orquestar edicion de ficheros, ejecucion de comandos o consultas a un editor local, aprovechando la ventana de 131.072 tokens para mantener el contexto de un repositorio mediano.
- Asistencia tecnica en campo: tecnicos que trabajan en instalaciones sin cobertura pueden consultar manuales extensos (que caben en la ventana de contexto) y obtener respuestas en lenguaje natural sin depender de la nube.
- Procesamiento de documentos confidenciales: al ejecutarse integramente en el dispositivo, es apto para resumir contratos, informes medicos o documentacion legal que no puede salir del terminal por requisitos de cumplimiento.
- Traduccion y redaccion bilingue ingles-chino: el modelo cubre ambos idiomas de forma nativa, util para equipos que operan entre mercados angloparlantes y chinos.
- Subtitulado y resumen en tiempo real en dispositivos de bajo consumo: la variante INT4-block32 ocupa menos de 1 GB, por lo que puede convivir con otras aplicaciones en un telefono de gama alta.
- Prototipado rapido de agentes en CLI: con `uvx litert-lm run` se puede probar el modelo en escritorio antes de trasladarlo al dispositivo final.
- Educacion y tutoria offline: generacion de explicaciones paso a paso en modo razonamiento para entornos escolares sin infraestructura de servidores.

## Benchmarks y rendimiento

La model card solo publica la comparativa de precision entre el baseline en BF16 y la variante cuantizada W4 (`wi4b32_wi8` con activaciones FP32). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Categoria | FP (bf16) | W4 |
|---|---|---|
| Global | 66,16 | 60,91 |
| STEM | 58,07 | 53,36 |
| Ciencias sociales | 77,91 | 70,87 |
| Humanidades | 67,65 | 64,35 |
| Otros | 68,71 | 62,14 |
| Dificil | 47,08 | 44,23 |

Notas de la evaluacion segun el autor: modo pensamiento desactivado para reducir uso de contexto, temperatura 0,6, top-p 0,95 y semilla aleatoria 0. La caida media de precision por la cuantizacion W4 es de aproximadamente 5,25 puntos porcentuales, con la mayor degradacion en ciencias sociales (7,04 puntos) y la menor en la categoria "dificil" (2,85 puntos). No se publican datos de la variante `dynamic_wi8_afp32`.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,8 GB; cada fichero `.litertlm` individual es inferior a esa cifra (estimacion a partir del tamano del repo, no publicada explicitamente por el autor). La variante INT4-block32 es la mas ligera.
- KV cache: con 24 capas y solo 2 cabezas KV, el crecimiento por token es contenido, pero en 8 bits y contexto completo de 131.072 tokens se situa en el orden de 1-2 GB adicionales (estimacion propia, no publicada).
- GPU recomendadas: no aplica en el escenario objetivo; el runtime LiteRT-LM esta pensado para CPU, GPU integrada y aceleradores NPU de moviles Android. Para escritorio basta una CPU moderna.
- GPU de consumo: no se documenta soporte especifico para RTX 4090, A100 o H100, ya que el formato `.litertlm` no es el objetivo de vLLM ni TGI.
- Despliegue en movil: app Edge Gallery (Google Play o APK desde GitHub), importacion desde Hugging Face o mediante `adb push` del fichero `.litertlm` a `/sdcard/Download/`.
- Despliegue en escritorio/CLI: `uv tool install litert-lm` y `uvx litert-lm run --from-huggingface-repo=... --prompt="..."`.
- vLLM, llama.cpp, Ollama y TGI: no soportan el formato `.litertlm`. Para esos runtimes habria que usar el checkpoint original openbmb/MiniCPM5-1B en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de terceros que aparecen a continuacion proceden de la documentacion publica de cada proyecto y no han sido verificados en la busqueda realizada para esta ficha; deben tomarse como orientativos.

| Modelo | Parametros | Contexto | Licencia | Formato edge |
|---|---|---|---|---|
| MiniCPM5-1B (esta conversion) | ~1,08B | 131.072 | Apache-2.0 | `.litertlm` (LiteRT-LM) |
| Llama 3.2 1B Instruct | ~1,23B | 128.000 | Llama 3.2 Community License | GGUF, ExecuTorch |
| Qwen3-1.7B | ~1,7B | 32.768 nativo | Apache-2.0 | GGUF, MLC |
| Gemma 3 1B | ~1B | 32.000 | Gemma Terms of Use | LiteRT, GGUF |

Frente a estas alternativas, MiniCPM5-1B destaca por la ventana de contexto (131.072 tokens, muy superior a Qwen3-1.7B y Gemma 3 1B), por licencia Apache-2.0 sin clausulas adicionales de uso comercial y por disponer de una conversion oficial a LiteRT-LM con soporte de la Edge Gallery de Google. En contra, su comunidad y ecosistema de herramientas es mas reducido que el de Llama o Qwen, y no hay datos publicos de benchmarks estandar que permitan comparar rendimiento bruto con esos modelos.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o fairness en la informacion disponible.
- Alucinacion: es un modelo de 1B parametros; la tasa de invencion de hechos es previsiblemente alta en dominios especializados, especialmente con cuantizacion INT4, que degrada la precision global unos 5,25 puntos porcentuales.
- Cobertura idiomatica: solo ingles y chino. El castellano no esta declarado como idioma soportado, por lo que su uso en produccion en espanol no esta respaldado por el autor.
- Perdida de precision por cuantizacion: en ciencias sociales la caida respecto al baseline BF16 alcanza 7,04 puntos; conviene validar la tarea concreta antes de elegir la variante W4.
- Formato propietario del runtime: `.litertlm` solo se ejecuta con LiteRT-LM. No es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita las opciones de escalado en servidor.
- Modo pensamiento desactivado en las evaluaciones publicadas: el rendimiento real con `enable_thinking` activado puede diferir del reportado y consume mas contexto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de redactar esta ficha, y autor individual no vinculado a OpenBMB. Conviene verificar la integridad del fichero antes de usarlo en produccion, o generar la conversion uno mismo desde el checkpoint oficial.
- Discrepancia de nomenclatura: la model card cita el articulo de MiniCPM4 (arXiv 2506.07900) aunque el modelo base declarado es MiniCPM5-1B; no se aclara si se trata de un error de cita o de un linaje real entre ambas generaciones.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no exime de cumplir las condiciones del modelo base upstream, que es el mismo en este caso.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/devendradhakad/autodroid-litert-community-MiniCPM5-1B
- Modelo base oficial (BF16): https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- Documentacion de LiteRT-LM: https://ai.google.dev/edge/litert-lm
- App Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Releases de Edge Gallery (APK): https://github.com/google-ai-edge/gallery/releases
- Wiki de Edge Gallery: https://github.com/google-ai-edge/gallery/wiki
- Articulo citado (MiniCPM4): https://arxiv.org/abs/2506.07900
- Repositorio referenciado en el comando de ejemplo: https://huggingface.co/litert-community/MiniCPM5-1B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles proceden de la model card del repositorio.
