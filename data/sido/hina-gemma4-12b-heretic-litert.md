# Sido/hina-gemma4-12b-heretic-litert

## Resumen

Hina Gemma 4 12B Heretic LiteRT es un paquete experimental de pesos en formato LiteRT-LM para ejecutar en navegador mediante WebGPU un modelo derivado de la familia Gemma 4 de Google. Lo publica el usuario Sido en Hugging Face y no constituye un modelo entrenado desde cero, sino una conversion de un GGUF Q4_K_M de terceros (`mradermacher/gemma-4-12B-it-heretic-GGUF`) que, a su vez, deriva del checkpoint afinado `coder3101/gemma-4-12B-it-heretic`. El resultado es un artefacto de 7,27 GB pensado para inferencia local en el navegador con LiteRT-LM 0.19 y WebGPU.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de una conversion de formato, no de un modelo nuevo con benchmarks propios. El autor declara explicitamente que la calidad en japones, ingles y conversaciones de larga duracion no se ha evaluado de forma exhaustiva, y que los pesos del navegador no son identicos bit a bit al GGUF de origen. La licencia declarada es Apache 2.0, heredada del modelo base, y el repo no registra descargas ni interacciones en el momento de la consulta.

El modelo subyacente es un transformer de 12.000 millones de parametros con ventana de contexto nativa de Gemma 4; el bundle LiteRT-LM limita la cache KV a 4096 tokens y usa firmas de prefill de 128 tokens. Los idiomas declarados son ingles y japones. Su interes practico esta en desplegar un modelo de 12B en un navegador de escritorio con memoria suficiente, sin servidor y sin instalacion de runtime nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), convertido a LiteRT-LM |
| Parametros totales | 12 000 millones (12B, segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens de cache KV en el bundle LiteRT-LM; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | `dynamic_wi4b32_afp32` (4 bits por bloque de 32, activaciones FP32); origen Q4_K_M GGUF; pesos de lenguaje dequantizados a FP16 y requantizados |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); GGUF Q4_K_M como origen de la conversion |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma 4, en su variante de 12B con ajuste instruccional ("it") y una modificacion posterior de tipo "heretic" realizada por coder3101. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el checkpoint original. Tampoco se documenta ninguna innovacion arquitectonica especifica (atencion lineal, decodificacion especulativa, capas hibridas) mas alla de lo que corresponde al linaje Gemma 4.

El proceso de conversion si esta documentado con detalle por el autor. Se parte del archivo `gemma-4-12B-it-heretic.Q4_K_M.gguf` (7 381 382 720 bytes, SHA-256 `278a8a485e2b6afd1762604b18da53542342532b1b96a65f767fbd9b141f35ab`), se dequantizan los pesos de lenguaje a FP16 y se requantizan a LiteRT-LM `dynamic_wi4b32_afp32` con bloques de 32. Los tensores exclusivamente multimodales y los metadatos del tokenizer se toman de la revision base fija de Google Gemma 4 12B (`707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`). Se preservan los tokens suprimidos `[258883, 258882]` de `generation_config`. El bundle final, `hina-12b-heretic-q4km-block32-web-f16.litertlm`, ocupa 7 273 467 408 bytes con SHA-256 `bdd726fd520af7acf6e93eb32110c1986c81c716d6a9269aa2999b9d166fb574`.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y japones.
- Razonamiento y respuesta instruccional heredados del checkpoint `gemma-4-12B-it`.
- Ejecucion en navegador mediante LiteRT-LM 0.19 y WebGPU, sin backend nativo.
- Cache KV de 4096 tokens y prefill por firmas de 128 tokens, adecuado para sesiones de chat de longitud moderada.
- Soporte multimodal: el autor menciona tensores "multimodal-only" tomados de la revision base, aunque no se detalla que modalidades estan operativas en el bundle.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Demo interactiva de chat en navegador: el bundle esta disenado para LiteRT-LM 0.19 con WebGPU, de modo que puede servirse como pagina web estatica y ejecutar inferencia en el cliente sin backend, util para prototipos y demostraciones publicas.
- Procesamiento de texto en local con privacidad: al ejecutarse en el navegador del usuario, los prompts no salen del equipo, lo que encaja en flujos con datos sensibles donde no se permite enviar contenido a una API externa.
- Asistente de redaccion en japones e ingles: los dos idiomas declarados cubren casos de reescritura, resumen y traduccion informal entre ambos, con la cautela de que la calidad no ha sido evaluada de forma exhaustiva.
- Pruebas de concepto de inferencia WebGPU: sirve para medir viabilidad de modelos de 12B en hardware de escritorio y comparar latencia frente a despliegues nativos con llama.cpp o vLLM.
- Educacion y divulgacion: permite mostrar el funcionamiento de un LLM cuantizado a 4 bits en un entorno familiar (el navegador) sin instalacion de dependencias.
- Evaluacion de variantes "heretic": util para investigadores que quieran comparar el comportamiento del checkpoint `coder3101/gemma-4-12B-it-heretic` frente al Gemma 4 original en tareas de rechazo y alineacion, siempre que se validen los resultados con benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria: el autor recomienda 32 GB de RAM de sistema para el navegador; el archivo `.litertlm` ocupa 7,27 GB y la cache KV de 4096 tokens anade overhead adicional.
- GPU recomendadas: no disponible en la informacion proporcionada; se requiere un navegador con soporte WebGPU.
- Cabe en GPU consumer: no confirmado; la recomendacion de 32 GB de RAM sugiere que el limite practico esta en equipos de escritorio con memoria unificada o abundante, no en portatiles de gama baja.
- Opciones de despliegue: LiteRT-LM 0.19 con WebGPU (unico runtime soportado por este bundle). El GGUF de origen puede desplegarse con llama.cpp u Ollama, pero no es el artefacto publicado aqui.
- Latencia y throughput: no disponible en la informacion proporcionada; el autor remite al informe de verificacion de la aplicacion para los resultados reales de smoke test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sido/hina-gemma4-12b-heretic-litert | 12B | 4096 (cache KV del bundle) | `.litertlm` | Apache 2.0 | Hugging Face, 0 descargas |
| coder3101/gemma-4-12B-it-heretic | 12B | no disponible | safetensors (presumible) | no disponible | Hugging Face (modelo base) |
| mradermacher/gemma-4-12B-it-heretic-GGUF | 12B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (origen de la conversion) |
| Gemma 4 12B base (Google) | 12B | no disponible | safetensors | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: no aporta mejoras de calidad respecto al checkpoint de origen y no se han publicado evaluaciones propias.
- El autor declara que la calidad en japones, ingles y conversaciones largas no se ha evaluado de forma exhaustiva.
- Los pesos del bundle no son identicos bit a bit al GGUF Q4_K_M de origen, por lo que los resultados pueden diferir de los obtenidos con llama.cpp sobre el mismo checkpoint.
- La ventana efectiva en el bundle esta limitada a 4096 tokens de cache KV, muy por debajo del contexto nativo de Gemma 4; las conversaciones largas degradaran o truncaran.
- El linaje "heretic" implica un ajuste orientado a reducir rechazos; esto puede aumentar la probabilidad de respuestas no alineadas con politicas de seguridad y exige validacion adicional en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de 12B cuantizado a 4 bits.
- La licencia Apache 2.0 se declara en el repo, pero el modelo base y el GGUF intermedio no documentan su licencia en la informacion proporcionada; conviene verificar la cadena completa antes de uso comercial.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Requiere navegador con WebGPU y 32 GB de RAM recomendados; no es viable en moviles ni en equipos con poca memoria.

## Enlaces

- Hugging Face: https://huggingface.co/Sido/hina-gemma4-12b-heretic-litert
- Modelo base: https://huggingface.co/coder3101/gemma-4-12B-it-heretic
- GGUF de origen: https://huggingface.co/mradermacher/gemma-4-12B-it-heretic-GGUF
- Revision del GGUF usada: https://huggingface.co/mradermacher/gemma-4-12B-it-heretic-GGUF/tree/999cfc85bf8e78047b5e43b365aa1dcdaaf2dc4f
- Revision del modelo base usada: https://huggingface.co/coder3101/gemma-4-12B-it-heretic/tree/c664c9077db42c46cde82abf6f11a94ff3262be3
- Revision base de Google Gemma 4 12B: `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7` (sin URL directa en la informacion proporcionada)
