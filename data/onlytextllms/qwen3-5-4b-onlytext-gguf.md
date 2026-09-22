# OnlyTextLLMs/Qwen3.5-4B-OnlyText-GGUF

## Resumen

OnlyTextLLMs/Qwen3.5-4B-OnlyText-GGUF es la distribucion en formato GGUF del derivado text-only de Qwen/Qwen3.5-4B, publicado por el usuario OnlyTextLLMs bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero ni de un ajuste fino: el autor ha tomado los pesos originales de Qwen, ha eliminado las modalidades de vision y audio (y los tokens especiales asociados a ellas) y ha generado tres cuantizaciones GGUF (Q4_K_M, Q6_K y Q8_0) sin reentrenar nada. El modelo resultante tiene 4.326.304.768 parametros, arquitectura `Qwen3_5ForCausalLM`, 32 capas, dimension oculta 2560 y un vocabulario de 248.302 entradas.

Su rasgo mas distintivo es que cada archivo GGUF lleva embebida la cabeza de prediccion multi-token (MTP, `nextn_predict_layers = 1`) que el conversor de llama.cpp incluye por defecto. Esto permite activar decodificacion especulativa con un unico fichero, sin necesidad de un modelo draft separado, mediante el flag `--spec-type draft-mtp`. Segun las mediciones del autor sobre una AMD Radeon AI PRO R9700 (34 GB), esta tecnica aporta entre un 21 % y un 35 % mas de velocidad de generacion segun la cuantizacion.

Es relevante ahora por dos motivos practicos: primero, ofrece una via sencilla para desplegar un modelo de ~4B en ingles en hardware de gama media con llama.cpp y API compatible con OpenAI; segundo, demuestra un flujo de conversion que aprovecha la cabeza MTP del modelo base para acelerar la inferencia en local, algo poco habitual en repositorios de cuantizaciones de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen3_5ForCausalLM` (arquitectura GGUF: `qwen35`), 32 capas, hidden size 2560, vocab 248302 |
| Parametros totales | 4.326.304.768 (~4,33 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; las pruebas del autor se ejecutan con `-c 32768` |
| Tipos de cuantizacion | GGUF Q4_K_M (2,8 GB), Q6_K (3,6 GB), Q8_0 (4,6 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 11,0 GB en total |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 32 capas, dimension oculta de 2560 y un vocabulario de 248.302 tokens. La arquitectura declarada en el GGUF es `qwen35` y la clase HuggingFace correspondiente es `Qwen3_5ForCausalLM`. No hay MoE ni parametros activos: todos los parametros se activan en cada paso. La innovacion tecnica relevante es la inclusion de una capa de prediccion multi-token (`nextn_predict_layers = 1`), es decir, una cabeza draft embebida en el propio fichero GGUF que actua como modelo especulativo para decodificacion MTP. Esto evita el patron clasico de servir un modelo draft aparte y simplifica el despliegue a un solo archivo.

No ha habido entrenamiento adicional: los pesos son un derivado intacto del modelo base, unicamente se han eliminado las modalidades de vision y audio. La tokenizacion se ha reajustado a 15 tokens especiales solo de texto en los identificadores 248044–248058, con EOS en 248046 (`<|im_end|>`). La conversion se realizo con `convert_hf_to_gguf.py` de llama.cpp (revision `f280b26983ad`) y posteriormente `llama-quantize` con cada tipo nombrado. El chat template conserva el modo thinking activado por defecto con `reasoning_effort: xhigh`, de modo que el modelo razona de forma extensa antes de responder salvo que se desactive explicitamente.

## Capacidades

- Generacion de texto conversacional de un solo turno o multi-turno en ingles.
- Razonamiento explicito o modo thinking: el chat template activa por defecto `reasoning_effort: xhigh`, con cadenas de razonamiento antes de la respuesta final.
- Modo de respuesta directa: se puede desactivar el razonamiento con `--reasoning off` en llama-cli o con `"chat_template_kwargs": {"enable_thinking": false}` en la API de servidor.
- Decodificacion especulativa MTP integrada en el propio fichero GGUF, activable con `--spec-type draft-mtp`.
- Servido con API compatible con OpenAI mediante `llama-server`.
- Eliminacion de modalidades: no procesa imagen ni audio, solo texto.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking y el servidor compatible con OpenAI lo permiten tecnicamente, pero no hay validacion publicada.
- Capacidades multilingues: limitadas a ingles segun los metadatos de la model card.

## Casos de uso

- Despliegue local en GPU de gama media o en equipos con memoria unificada: con el archivo Q4_K_M de 2,8 GB y llama.cpp se puede servir un asistente en ingles en una sola maquina, incluidas plataformas tipo Ryzen AI Max / Strix Halo, donde el autor recomienda `--spec-draft-n-max 4`.
- Servicio de chat con API compatible con OpenAI: `llama-server -m ... -ngl 99 -c 32768 -fa on --spec-type draft-mtp --spec-draft-n-max 2` expone un endpoint que se puede integrar en aplicaciones existentes escritas contra la API de OpenAI sin cambios de codigo.
- Aceleracion de inferencia en produccion con pocos recursos: la decodificacion MTP aporta entre un 21 % y un 35 % de tokens por segundo adicionales segun la cuantizacion, lo que reduce coste por peticion en servicios de alto volumen.
- Asistentes de redaccion y resumen en ingles: el modelo mantiene conversaciones multi-turno y, con `-c 32768`, puede trabajar sobre documentos largos dentro de esa ventana configurada.
- Generacion de respuestas razonadas cuando la precision importa mas que la latencia: dejando el modo thinking activado se obtienen cadenas de razonamiento previas a la respuesta, utiles para tareas de analisis o clasificacion con justificacion.
- Prototipado e investigacion en entornos sin conectividad: el formato GGUF y el requisito de llama.cpp permiten ejecutar todo el pipeline en local, sin llamadas a APIs externas, algo relevante para datos sensibles o entornos aislados.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: al llevar la cabeza MTP embebida, es un banco de pruebas comodo para medir el impacto de `--spec-draft-n-max` en distintas GPU.
- Pipelines de bajo coste para tareas de procesamiento de texto en ingles: al ser un modelo de 4,33 B con licencia Apache 2.0, se puede desplegar en varias instancias por nodo sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la informacion disponible. El autor solo reporta mediciones propias de throughput y perplejidad, realizadas el 2026-09-22 sobre una unica AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con llama.cpp `f280b26983ad` (build HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`). Baseline con llama-bench PP512 y TG128/256; MTP con llama-cli en un solo turno de chat, thinking desactivado, 256 tokens generados y `-np 1`.

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Generacion t/s sin MTP | Generacion t/s con MTP | Delta MTP |
|---|---|---|---|---|---|
| Q4_K_M | 1x R9700 | 3269 | 93,7 | 113,4 (MTP n=2) | +21 % |
| Q6_K | 1x R9700 | 2328 | 90,6 | 115,4 (MTP n=2) | +27 % |
| Q8_0 | 1x R9700 | 3148 | 83,7 | 113,4 (MTP n=2) | +35 % |

| Cuantizacion | Perplejidad (wikitext-2, una GPU) |
|---|---|
| Q4_K_M | 9,609 |
| Q6_K | 9,4519 |
| Q8_0 | 9,3587 |

El propio autor indica que no cita baselines publicados para este tamano y que los numeros son suyos. No hay comparacion con otros modelos en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: 2,8 GB (Q4_K_M), 3,6 GB (Q6_K) y 4,6 GB (Q8_0). Ese es el minimo de memoria para los pesos; hay que sumar la cache KV correspondiente al contexto configurado.
- VRAM estimada: no hay cifra oficial de VRAM total. Con `-c 32768` y `-fa on` el autor ha ejecutado las tres cuantizaciones en una GPU de 34 GB, pero no indica el consumo real ni el tamano de la cache KV. No es posible dar una estimacion fiable de VRAM sin conocer la configuracion de cabezas de atencion, que no figura en la informacion disponible.
- GPU validadas: AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con ROCm 7.14. El autor menciona tambien Ryzen AI Max / Strix Halo como plataforma probada, con `--spec-draft-n-max 4`.
- Cabe en GPU consumer: el archivo Q4_K_M de 2,8 GB es compatible con GPUs consumer en terminos de pesos, pero no hay mediciones publicadas en tarjetas tipo RTX 4090, RTX 3090 o similares, ni datos de VRAM real.
- Multi-GPU: llama.cpp reparte capas automaticamente; hay que desactivar los pines de `*_VISIBLE_DEVICES`. `--split-mode layer` es el valor por defecto.
- Opciones de despliegue: llama.cpp (`llama-server` con API compatible con OpenAI, `llama-cli`), `convert_hf_to_gguf.py` y `llama-quantize` para reproducir la conversion. El tag `endpoints_compatible` sugiere compatibilidad con endpoints alojados de HuggingFace. Ollama, vLLM o TGI no estan documentados en la informacion disponible.
- Requisito de version: se necesita un build de llama.cpp del 2026-05-16 o posterior (soporte MTP, commit `4f13cb7`+) para usar `--spec-type draft-mtp`.
- Throughput medido: 83,7–93,7 t/s de generacion sin MTP y 113,4–115,4 t/s con MTP n=2 en la R9700; prefill PP512 entre 2328 y 3269 t/s. No hay datos de latencia por peticion ni de throughput con batching (`-np 1` en las pruebas).
- Memoria en disco: el repositorio completo ocupa 11,0 GB.

## Comparativa con modelos similares

La informacion disponible no incluye datos de benchmarks ni especificaciones de alternativas de terceros, por lo que la comparacion se limita a las variantes de la propia familia.

| Modelo | Parametros | Contexto | Formato | Modalidades | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| OnlyTextLLMs/Qwen3.5-4B-OnlyText-GGUF (este modelo) | 4,33 B | no disponible (probado con 32768) | GGUF Q4_K_M / Q6_K / Q8_0 | solo texto | apache-2.0 | 83,7–115,4 t/s en R9700; PPL wikitext-2 9,3587–9,609 |
| OnlyTextLLMs/Qwen3.5-4B-OnlyText | no disponible | no disponible | safetensors (presumiblemente) | solo texto | apache-2.0 | no disponible |
| Qwen/Qwen3.5-4B (modelo base) | mismo backbone (4,33 B en el derivado) | no disponible | safetensors | texto, vision y audio | apache-2.0 | no disponible en esta informacion |

No se dispone de datos de modelos comparables de otros desarrolladores (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: los metadatos declaran unicamente `en`. El rendimiento en castellano u otros idiomas no esta evaluado.
- Sin vision ni audio: aunque el modelo base es multimodal, esta variante elimina esas modalidades y sus tokens especiales. No se puede usar para tareas de imagen o audio.
- Sin entrenamiento adicional: el autor indica explicitamente que los pesos son un derivado intacto. Cualquier sesgo o limitacion del modelo base se hereda sin cambios.
- Riesgo de alucinacion: inherente a un modelo de 4,33 B; no hay evaluaciones de factualidad publicadas.
- Modo thinking activado por defecto: con `reasoning_effort: xhigh` el modelo genera cadenas de razonamiento largas antes de responder, lo que incrementa el consumo de tokens y la latencia si no se desactiva.
- Dependencia de version concreta de llama.cpp: el uso de MTP exige un build posterior al 2026-05-16 (commit `4f13cb7`). En builds anteriores el flag `--spec-type draft-mtp` no funciona.
- Degradacion por cuantizacion: la perplejidad sube de 9,3587 (Q8_0) a 9,609 (Q4_K_M), un empeoramiento de aproximadamente el 2,7 % respecto a Q8_0.
- Benchmarks muy limitados: todas las mediciones provienen de una unica GPU (Radeon AI PRO R9700) y una unica build, con `-np 1` y un solo turno de 256 tokens. No hay datos de calidad, batching, latencia por peticion ni comportamiento en otras plataformas.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no existe retroalimentacion independiente.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene conservar la atribucion al equipo Qwen y el aviso de licencia, y no usar las marcas de Qwen de forma que sugiera respaldo del proyecto original.
- Tool calling y uso agentico: no documentados, por lo que no deberian asumirse en produccion sin pruebas propias.
- Contexto: la model card no declara longitud de contexto oficial; 32768 tokens es solo el valor usado en las pruebas del autor, no un limite garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OnlyTextLLMs/Qwen3.5-4B-OnlyText-GGUF
- Version sin cuantizar del derivado: https://huggingface.co/OnlyTextLLMs/Qwen3.5-4B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Qwen: https://huggingface.co/Qwen
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a foros de soporte tecnico sin relacion con el mismo, por lo que no se incluyen. No se dispone de paper, blog, repositorio de codigo ni demo adicionales.
