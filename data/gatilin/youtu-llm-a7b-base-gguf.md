# gatilin/Youtu-LLM-A7B-Base-GGUF

## Resumen

Youtu-LLM-A7B-Base es un modelo de lenguaje y vision (vision-language) con arquitectura Mixture-of-Experts desarrollado por el equipo Tencent Youtu. Combina aproximadamente 120 000 millones de parametros totales con unos 7000 millones de parametros activos por token, lo que permite un coste de inferencia propio de un modelo de 7B manteniendo la capacidad de representacion de un modelo mucho mayor. El repositorio analizado es una conversion no oficial a formato GGUF realizada por el usuario gatilin, pensada para su ejecucion en llama.cpp.

El modelo emplea una arquitectura hibrida de atencion que intercala KDA (linear attention) con GatedMLA, 48 capas, dimension oculta de 3072, 256 expertos enrutados con top-8 mas un experto compartido, y una torre de vision heredada de Qwen3-VL-MoE. Soporta una longitud de contexto de 262 144 tokens y esta entrenado principalmente en ingles y chino.

Su relevancia practica radica en que esta conversion GGUF, junto con un parche especifico para llama.cpp, permite ejecutar un modelo multimodal MoE de gran tamano en hardware de memoria unificada (por ejemplo, un Apple Silicon con 128 GiB), algo que hasta ahora requeria infraestructura de GPU de centro de datos. Es, sin embargo, una conversion no oficial, validada unicamente en Metal y con limitaciones documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer hibrido con atencion lineal KDA intercalada con GatedMLA (arquitectura `youtu-moe` en llama.cpp) |
| Parametros totales | ~120B |
| Parametros activos | ~7B por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_K_M y BF16 (unicos probados; otros tipos sin testear) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Youtu-LLM license (licencia propia de Tencent; en HuggingFace marcada como `other`) |
| Formato de pesos | GGUF (1090 tensores por fichero); pesos originales en safetensors (24 shards) |

Detalles adicionales de arquitectura: 48 capas, hidden size 3072, 256 expertos enrutados (top-8) mas 1 experto compartido, torre de vision Qwen3-VL-MoE. Ficheros disponibles: `youtu-moe-a7b-Q4_K_M.gguf` (66 GiB), `youtu-moe-a7b-bf16.gguf` (220 GiB) y `youtu-vl-mmproj-f16.gguf` (867 MiB, torre de vision y merger, necesario para entrada de imagen).

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atencion hibrida: capas de atencion lineal KDA intercaladas con capas GatedMLA, lo que reduce el coste computacional y de memoria del contexto largo frente a atencion completa. El enrutamiento MoE selecciona 8 de 256 expertos por token mas un experto compartido siempre activo, lo que explica la relacion entre los ~120B totales y los ~7B activos. La torre de vision corresponde a Qwen3-VL-MoE y se exporta por separado como mmproj en formato f16.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron etapas de RLHF o DPO. La model card del repositorio GGUF indica que es un modelo *base* y que el `chat_template.jinja` se incluye solo "for further purpose", recomendando continuacion de texto en crudo. La conversion a GGUF requirio resolver tres puntos tecnicos no triviales documentados por el autor: la permutacion de pesos de RoPE para reconciliar el `IMROPE` estilo NEOX de ggml con la rotacion oficial de pares adyacentes, el ajuste de `mrope_section` a `[11, 10, 10, 0]` en lugar del `[12, 10, 10]` oficial, y el enrutamiento por token del sesgo de expertos MoE sensible a la modalidad (`qb_beta`, dos filas).

## Capacidades

- Generacion de texto y continuacion en ingles y chino.
- Comprension de imagenes (image-text-to-text) mediante la torre de vision Qwen3-VL-MoE y el fichero mmproj.
- OCR y lectura de documentos densos, con la opcion `--image-min-tokens 1024` para texto pequeno (el valor por defecto de 300 limita el OCR de letra pequena).
- Razonamiento multi-turno con ventana de contexto de 262 144 tokens.
- Capacidad de ajuste fino posterior: al ser un modelo base, esta pensado como punto de partida para fine-tuning.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo thinking nativo; el token `</think>` que emite es un artefacto de la plantilla, no un modo de razonamiento funcional.

## Casos de uso

- Procesamiento de documentos escaneados y prensa historica: con `--image-min-tokens 1024` el modelo lee correctamente cabeceras, fechas, numeros de edicion y titulares (verificado sobre la primera plana del New York Times del 21 de julio de 1969). Adecuado para digitalizacion y extraccion de metadatos de archivos.
- Analisis de imagenes en local sin subir datos a la nube: al ejecutarse en llama.cpp sobre memoria unificada, permite tratar imagenes sensibles en una maquina propia.
- Generacion de texto en chino e ingles: util para redaccion, resumen y traduccion bidireccional entre ambos idiomas dentro de la misma ventana de contexto.
- Base para fine-tuning especializado: su naturaleza de modelo base y su licencia permiten adaptarlo a dominios concretos (legal, medico, industrial) partiendo de los pesos BF16 de referencia.
- Procesamiento de contexto muy largo: con 262 144 tokens puede ingerir informes extensos, expedientes o transcripciones completas en una sola pasada, beneficiandose de la atencion lineal para reducir el coste del contexto largo.
- Prototipado e investigacion en hardware de sobremesa: permite experimentar con un MoE multimodal de ~120B en un equipo con 128 GiB de memoria unificada, sin GPU de centro de datos.
- Servicio HTTP local de inferencia: `llama-server` con `--mmproj` expone el modelo multimodal en un endpoint compatible con la API de llama.cpp para integrarlo en aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento medidos son de inferencia, sobre un Apple M3 Max con 128 GiB y cuantizacion Q4_K_M con Metal: carga del modelo ~20 s, prefill ~38 t/s, decode ~14 t/s.

## Requisitos de hardware

- VRAM/memoria estimada: Q4_K_M ocupa 66 GiB y esta pensado para una maquina con 128 GiB de memoria unificada; BF16 ocupa 220 GiB. La torre de vision anade 867 MiB.
- GPU recomendadas: no se documentan GPU discretas validadas. El unico entorno verificado es Apple Silicon (Metal) con 128 GiB. CUDA y CPU deberian funcionar segun el autor, pero no se han ejecutado.
- Cabe en GPU de consumo: no en el sentido habitual; 66 GiB de pesos no caben en una RTX 4090 (24 GB) ni en una RTX 5090. Requiere memoria unificada grande o multiples GPU con suficiente VRAM agregada.
- Opciones de despliegue: llama.cpp con el parche `youtu-moe` (binarios `llama-cli`, `llama-server`, `llama-mtmd-cli`). No se documenta soporte en vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: prefill ~38 t/s y decode ~14 t/s en M3 Max 128 GiB con Q4_K_M y Metal; carga ~20 s.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Youtu-LLM-A7B-Base (esta conversion) | ~120B | ~7B | 262 144 | Si (Qwen3-VL-MoE) | Youtu-LLM (propia) | GGUF, safetensors |
| Qwen3-VL-MoE | no disponible | no disponible | no disponible | Si | no disponible | no disponible |
| Modelos MoE abiertos de ~7B activos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones detalladas de modelos alternativos que permitan una comparacion cuantitativa rigurosa. La unica referencia tecnica directa es Qwen3-VL-MoE, del que este modelo reutiliza la torre de vision.

## Limitaciones y advertencias

- Conversion no oficial: no esta respaldada por Tencent; todos los creditos del modelo pertenecen al equipo Youtu.
- Requiere un parche de llama.cpp: la arquitectura `youtu-moe` no esta en el upstream; sin aplicar el parche de `gatilin/llama.cpp-youtu-moe` los ficheros no cargan.
- Artefacto del token `</think>`: el modelo emite siempre `</think>` (token 128014) como primer token del asistente, incluso sin marcadores de pensamiento en el prompt. Debe eliminarse en la salida; prohibirlo con `logit_bias` empeora el comportamiento y provoca prosa cuasi-razonada.
- Plantilla de chat sin rama de imagen: `chat_template.jinja` no coloca el placeholder de imagen, por lo que hay que pasar el prompt en crudo con el envoltorio `<|vision_start|><__media__><|vision_end|>` y sin `--jinja`.
- Validacion limitada: solo probado en Metal (macOS); CUDA y CPU no han sido ejecutados. Solo se han probado Q4_K_M y BF16.
- Modelo base: no esta alineado para instrucciones; el uso conversacional requiere fine-tuning o ingenieria de prompt cuidadosa.
- Idiomas: solo ingles y chino; el rendimiento en castellano no esta documentado.
- Licencia: Youtu-LLM license propia de Tencent; es necesario revisar `LICENSE.txt` antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser un modelo base sin alineacion, cabe esperar ambos.
- Detalle de herramienta: `llama-mtmd-cli` imprime el texto generado via `LOG()`, por lo que `--log-disable` suprime tambien la respuesta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gatilin/Youtu-LLM-A7B-Base-GGUF
- Modelo base: https://huggingface.co/tencent/Youtu-LLM-A7B-Base
- Licencia: https://huggingface.co/tencent/Youtu-LLM-A7B-Base/blob/main/LICENSE.txt
- Repositorio del parche y receta de conversion: https://huggingface.co/gatilin/llama.cpp-youtu-moe
- llama.cpp: https://github.com/ggml-org/llama.cpp
