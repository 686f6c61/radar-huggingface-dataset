# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP

## Resumen
Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP es una version cuantizada en NVFP4 y estrictamente textual del modelo abliterado AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16, publicado por el usuario AEON-7. Pese al "27B" del nombre, los pesos safetensors declaran 17.925.456.896 parametros (~17,9 B). El punto de partida es Qwen 3.6 27B, al que se aplica una abliteration (eliminacion de direcciones de rechazo) que el autor describe como sin perdida: divergencia KL de 0,000492 frente al modelo base y 0/100 rechazos en su evaluacion.

La variante anade dos componentes tecnicos. Por un lado, el cuerpo se cuantiza a 4 bits en formato NVFP4 con nvidia-modelopt 0.43.0, que vLLM sirve mediante `--quantization modelopt`. Por otro, se injerta un cabezal MTP (multi-token prediction) procedente del modelo base, lo que habilita decodificacion especulativa nativa sin necesidad de un drafter externo. Las capas GatedDeltaNet/linear_attn se mantienen en BF16 para no degradar la recurrencia, y la torre de vision se elimina por completo (333 claves visuales, ~0,92 GB), dejando un build solo texto de menor huella.

Su interes actual es practico: documenta un flujo de cuantizacion NVFP4 + MTP funcional sobre GPUs Blackwell (sm_100/sm_120) con despliegue en vLLM y contenedores preparados para DGX Spark, RTX 5090 y RTX PRO 6000. No obstante, el propio autor marca esta ficha como superada por la linea Qwen3.8 y recomienda migrar para trabajo nuevo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion + capas lineales GatedDeltaNet (SSM, estilo Mamba); 48 capas GDN |
| Parametros totales | 17.925.456.896 (~17,9 B) segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en el cuerpo (nvidia-modelopt 0.43.0, `NVFP4_DEFAULT_CFG`); BF16 en capas `linear_attn`/GatedDeltaNet; FP8 KV cache y TurboQuant K8V4 disponibles en los contenedores de referencia |
| Idiomas soportados | en, zh, multilingue (segun tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato modelopt/compressed-tensors NVFP4 (el repositorio declara tambien el tag "8-bit") |
| Tamano del repositorio | 27,7 GB en HuggingFace; la model card cifra esta variante solo texto en ~20 GB |
| Pipeline | text-generation |
| Entrada multimodal | no (torre de vision eliminada, `language_model_only: true`) |
| Parametros totales del modelo base | no disponible |
| Fecha de publicacion | 28/04/2026 (ultima actualizacion 12/09/2026) |

## Arquitectura y entrenamiento
La arquitectura es un transformer hibrido que combina atencion con 48 capas lineales de tipo GatedDeltaNet (GDN), un mecanismo de espacio de estados con recurrencia controlada por puertas, en la linea de Mamba. El proceso de cuantizacion es selectivo: 432 claves correspondientes a `linear_attn` se excluyen explicitamente de la cuantizacion y se conservan en BF16, porque aplicar NVFP4 al estado recurrente de un SSM colapsa la recurrencia. El resto del cuerpo pasa a NVFP4 con la configuracion `NVFP4_DEFAULT_CFG` de nvidia-modelopt 0.43.0, con decisiones de cuantizacion por proyeccion. Sobre los pesos se injerta un cabezal MTP tomado del modelo base, expuesto en vLLM como `qwen3_5_mtp`, que actua como mecanismo de decodificacion especulativa nativa. La receta original (config de modelopt, eleccion por proyeccion y tecnica de injerto del cabezal MTP) procede de la serie Qwen3.6-27B-NVFP4-MTP de sakamakismile, adaptada aqui a los pesos abliterados de AEON-Ultimate.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni sobre fases de RLHF o DPO: esta publicacion es una derivada de cuantizacion e injerto sobre un modelo ya entrenado, no un entrenamiento nuevo. Los unicos datos de calidad declarados son los de la abliteration del modelo base (KL 0,000492 respecto al Qwen 3.6 27B original y 0/100 rechazos), aportados por el autor y no verificados de forma independiente.

## Capacidades
- Generacion de texto conversacional en ingles, chino y otros idiomas declarados como multilingues.
- Decodificacion especulativa nativa mediante el cabezal MTP (`qwen3_5_mtp`), con configuracion recomendada `num_speculative_tokens: 3`, o mediante un drafter DFlash.
- Razonamiento y generacion de codigo y matematicas a nivel de modelo base, sin cifras de evaluacion publicadas en esta ficha.
- Comportamiento "uncensored": la abliteration reduce drasticamente los rechazos (0/100 en la evaluacion del autor sobre el base).
- Capacidades de vision: no disponibles en esta variante, la torre visual fue eliminada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el repositorio GitHub asociado incluye un `AGENTS.md` orientado al operador del despliegue, no a capacidades agenticas del modelo.

## Casos de uso
- Servicio de chat de alta concurrencia en GPU Blackwell de consumo: con ~20 GB de pesos, el modelo cabe con holgura en una RTX 5090 de 32 GB, y las mediciones del hermano multimodal cifran ~84 tok/s agregados en regimen estable con concurrencia x4.
- Investigacion sobre alineacion y abliteration: la variante permite estudiar el comportamiento de un modelo sin direcciones de rechazo manteniendo una divergencia KL muy baja (0,000492) respecto al base, lo que facilita comparaciones controladas.
- Generacion creativa sin restricciones de contenido: ficcion, guiones o narrativa para adultos donde los filtros de un modelo alineado bloquearian la salida; el operador asume la responsabilidad editorial.
- Sintesis de datos para fine-tuning: al ser solo texto y admitir alta concurrencia, sirve para generar grandes volumenes de pares instruccion-respuesta en ingles y chino sin la penalizacion de VRAM de la torre visual.
- Traduccion y procesamiento bilingue en/zh: los idiomas declarados cubren los dos mercados principales del modelo base, con salida multilingue adicional.
- Despliegue en DGX Spark / GB10: el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` esta ajustado a ese hardware, con NVFP4 KV cache (PR #44389) que amplia la capacidad de cache aproximadamente x3.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia practica para medir el impacto de NVFP4 + MTP frente al BF16 (51 GB) o al formato `compressed-tensors` (26 GB) sobre el mismo modelo.
- Base para experimentos de decodificacion especulativa: el cabezal MTP injertado permite comparar MTP nativo frente a drafter DFlash dentro de vLLM sin reentrenar nada.

## Benchmarks y rendimiento
| Metrica | Valor | Contexto |
|---|---|---|
| Throughput pico en matematicas/codigo | ~45 tok/s | Greedy + n_spec=15; medido sobre el hermano Multimodal-NVFP4-MTP-XS, no sobre este repositorio |
| Throughput medio global | 34,7 tok/s | Misma medicion, por categorias |
| Throughput agregado con concurrencia x4 | ~84 tok/s | Regimen estable, misma medicion |
| Divergencia KL de la abliteration base | 0,000492 | Frente a Qwen 3.6 27B, dato del autor |
| Tasa de rechazos del base abliterado | 0/100 | Dato del autor |

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Las cifras de throughput corresponden al modelo hermano multimodal y el autor indica que esta variante "deberia servir de forma identica", pero no se aportan mediciones propias de este repositorio.

## Requisitos de hardware
- Huella de pesos: ~20 GB segun la model card de esta variante solo texto; el repositorio completo ocupa 27,7 GB en disco.
- NVFP4 exige hardware Blackwell: sm_100 (B100, B200), sm_120 (RTX 5090, RTX PRO 6000) y parches sm_121a para GB10/DGX Spark.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB, segun la propia model card ("fits comfortably"). No se documenta funcionamiento en GPUs anteriores a Blackwell.
- GPUs de referencia citadas: RTX 5090, RTX PRO 6000, B100, B200 y DGX Spark / GB10.
- Para el modelo BF16 del que deriva: A100/H100 de 80 GB, RTX PRO 6000 de 96 GB o configuraciones multi-GPU.
- Despliegue: vLLM con `--quantization modelopt`; cabezal especulativo nativo con `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'` o drafter DFlash (recomendado en Spark). Contenedores `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark/GB10), `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta) y `vllm-aeon-ultimate-dflash:qwen36-v3` (produccion estable con FP8 KV + DFlash).
- Detalle de cache KV: en la imagen vLLM 0.23.0, DFlash requiere `--kv-cache-dtype auto` (BF16); FP8 KV queda en la imagen v3.
- No se documenta soporte para llama.cpp, Ollama, TGI ni pesos GGUF en la informacion disponible.
- Latencia y throughput: ver la tabla de benchmarks (hasta ~45 tok/s por secuencia, ~84 tok/s agregados con concurrencia x4 en la variante hermana).

## Comparativa con modelos similares
| Modelo | Tamano | Cuantizacion / formato | Vision | Uso previsto |
|---|---|---|---|---|
| Este repositorio (Text-NVFP4-MTP) | ~20 GB | NVFP4 modelopt + MTP | no | Texto en VRAM ajustada, RTX 5090 32 GB |
| AEON-7/...-Multimodal-NVFP4-MTP | 27 GB | NVFP4 modelopt + MTP | si | GPUs dedicadas de alto ancho de banda (RTX 5090, RTX PRO 6000, B100/B200) |
| AEON-7/...-NVFP4 (compressed-tensors) | 26 GB | NVFP4 compressed-tensors + DFlash | si | DGX Spark / GB10, produccion validada |
| AEON-7/...-BF16 (modelo base) | 51 GB | BF16 sin cuantizar | si | Referencia de precision, A100/H100 80 GB, fine-tuning |
| sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP | no disponible | NVFP4 modelopt + MTP | no | Receta original sobre el base no abliterado (22K+ descargas) |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | NVFP4 + FP8 mixto | no disponible | Sucesor recomendado por el autor para trabajo nuevo |

La comparativa con modelos de otras familias (por ejemplo, alternativas densas de ~20 B en el mismo rango de VRAM) no esta disponible en la informacion proporcionada: no se aportan parametros de contexto ni resultados de evaluacion que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- Modelo abliterado y etiquetado como "uncensored": carece de salvaguardas de seguridad; puede producir contenido dañino, ilegal o explicitamente sexual. El operador es responsable del filtrado en produccion.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de veracidad ni de precision publicadas para esta variante.
- Longitud de contexto no documentada, lo que impide planificar despliegues que dependan de ventanas largas o de RAG con muchos documentos.
- Discrepancia de nomenclatura: el nombre indica "27B" pero los safetensors declaran 17.925.456.896 parametros (~17,9 B). Conviene verificar la cifra antes de dimensionar hardware.
- El tag `image-text-to-text` del repositorio procede del modelo base y no aplica: esta variante es estrictamente textual.
- Las cifras de throughput citadas provienen de la variante multimodal hermana, no de mediciones sobre este repositorio.
- La afirmacion de abliteration "sin perdida" (KL 0,000492, 0/100 rechazos) es un dato autoinformado por el autor, sin verificacion independiente.
- Requiere hardware Blackwell (sm_100/sm_120/sm_121a). No hay ruta documentada a GGUF, llama.cpp u Ollama, por lo que no es desplegable en GPUs anteriores ni en CPU.
- El propio autor marca esta publicacion como superada por la linea Qwen3.8, que recomienda para trabajo nuevo; esta ficha se mantiene solo por historico.
- La licencia declarada es apache-2.0, pero se trata de una obra derivada de Qwen 3.6; conviene verificar las condiciones de la licencia del modelo original antes de un uso comercial.
- Adopcion muy baja en el momento de los datos (154 descargas, 1 like), lo que limita la evidencia de la comunidad sobre su comportamiento real.
- Idiomas: solo en y zh estan explicitamente soportados; el resto de lenguas, incluido el castellano, no tienen validacion declarada.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante NVFP4 (compressed-tensors + DFlash): https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4
- Variante multimodal NVFP4 + MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP
- Variante multimodal NVFP4 + MTP XS: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS
- Sucesor recomendado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Receta de referencia (sakamakismile): https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP
- Perfil de sakamakismile: https://huggingface.co/sakamakismile
- Repositorio de despliegue, benchmarks y AGENTS.md: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor vLLM Ultimate (DGX Spark / GB10): https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Imagen de contenedor Spark: https://ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Imagen de contenedor RTX: https://ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
- Imagen estable con DFlash y FP8 KV: ghcr.io/aeon-7/vllm-aeon-ultimate-dflash:qwen36-v3
