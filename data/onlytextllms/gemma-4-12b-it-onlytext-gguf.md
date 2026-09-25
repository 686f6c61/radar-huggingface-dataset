# OnlyTextLLMs/gemma-4-12B-it-OnlyText-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo `OnlyTextLLMs/gemma-4-12B-it-OnlyText`, que a su vez es la variante exclusivamente textual de `google/gemma-4-12B-it` (11,91B parametros). El trabajo lo publica el usuario OnlyTextLLMs y consiste unicamente en dos operaciones: eliminar las modalidades de imagen, audio y video del modelo original y convertir los pesos a GGUF con `convert_hf_to_gguf.py` y `llama-quantize`. No se ha realizado entrenamiento adicional ni ajuste alguno sobre los pesos.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind y adopta un diseno "unified" sin encoders separados (Gemma4UnifiedForCausalLM): 48 capas, de las cuales 40 usan atencion deslizante y 8 atencion completa, con hidden de 3840 y vocabulario de 262137 entradas. La tokenizer de esta variante conserva 17 tokens especiales de texto en los ids 0-106 (EOS 1 = `<eos>`, fin de turno 106 = `<turn|>`) y elimina los tokens de imagen/audio/video.

Su relevancia practica es acotada pero clara: ofrece un artefacto GGUF listo para `llama.cpp` con tres niveles de cuantizacion (Q4_K_M, Q6_K y Q8_0) y publica mediciones propias de divergencia respecto al maestro F16 y de throughput en una GPU AMD Radeon AI PRO R9700. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (40 capas de atencion deslizante + 8 de atencion completa); clase `Gemma4UnifiedForCausalLM`, arquitectura GGUF `gemma4` |
| Parametros totales | 11.907.323.696 (11,91B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de uso invocan `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (7,4 GB), Q6_K (9,8 GB), Q8_0 (12,7 GB), ademas del maestro F16 usado como referencia |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Hidden size | 3840 |
| Capas | 48 (40 sliding-attention + 8 full-attention) |
| Vocabulario | 262137 |
| Tamano del repo | 59,7 GB (incluye todas las cuantizaciones) |
| Tokenizer | 17 tokens especiales de texto en ids 0-106; EOS = 1 (`<eos>`), fin de turno = 106 (`<turn|>`) |
| Cabecera draft | no incluida (sin decodificacion especulativa in-file) |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma 4 12B "Unified" de Google DeepMind: un unico transformer decoder-only con atencion hibrida, sin encoders multimodales separados. El modelo original proyecta los parches de imagen directamente al espacio de embeddings del LLM mediante capas lineales ligeras, de modo que todas las modalidades alimentan un mismo decoder. Esta variante OnlyText descarta por completo esa ruta multimodal: se eliminan los tokens de imagen, audio y video de la tokenizer y los pesos quedan como backbone puramente textual. La ficha del autor es explicita en que no hay entrenamiento adicional, RLHF ni DPO en esta publicacion: son pesos derivados sin modificar.

El unico procesamiento aplicado es la conversion a GGUF con `convert_hf_to_gguf.py` (build `9d286e1b315c` de llama.cpp) seguida de `llama-quantize` con el tipo nombrado de cada archivo. No se ha incrustado ninguna cabecera draft, por lo que no hay decodificacion especulativa dentro del archivo y todas las cifras de rendimiento publicadas corresponden a decodificacion plana. La precision frente al checkpoint origen se midio por posicion (logits de este archivo contra el checkpoint origen a la misma precision, sobre 1533 tokens de wikitext-2): coincidencia de top-1 del 90,6% y KLD mediana de 0,005, brecha que el autor atribuye a diferencias numericas entre llama.cpp y transformers y no a la cuantizacion.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno con plantilla de chat propia, incluyendo el canal de razonamiento (`thinking`) de Gemma.
- Modo de razonamiento opcional: la plantilla soporta el canal de pensamiento pero deja `enable_thinking` en `false` por defecto; se activa pasando `"chat_template_kwargs": {"enable_thinking": true}` en la API de servidor.
- Inferencia exclusivamente textual: sin vision, audio ni video (los tokens de esas modalidades se han eliminado del tokenizer).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse como endpoint compatible con OpenAI mediante `llama-server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para esta variante (Ollama cita workflows agenticos para la familia Gemma 4 en general, no para este derivado).
- Capacidades multilingues: no disponible (no se declara lista de idiomas).

## Casos de uso

- Inferencia local en portatil o estacion de trabajo: con Q4_K_M (7,4 GB) el modelo se carga en GPUs de consumo y permite conversacion offline sin depender de APIs externas, que es el escenario que el propio autor usa para medir throughput.
- Servicio conversacional autoalojado: desplegado con `llama-server -m ... -ngl 99 -c 32768 -fa on` expone una API compatible con OpenAI, adecuada para integrar un asistente de texto detras de una aplicacion interna.
- Razonamiento con canal de pensamiento: activando `enable_thinking` se obtienen respuestas precedidas de trazas de razonamiento, util para tareas de analisis donde interesa auditar el proceso y no solo la salida.
- Generacion de texto por lotes en pipelines de datos: el prefill medido (2030 t/s con PP512 en Q4_K_M) lo hace apto para procesar volumenes grandes de prompts cortos donde domina el coste de prefill.
- Prototipado y evaluacion de cuantizaciones: las tablas de KLD y de mismo top-1 permiten decidir con datos si Q4_K_M es aceptable para una tarea concreta o si conviene subir a Q6_K o Q8_0.
- Despliegue en hardware AMD: los benchmarks se tomaron en una Radeon AI PRO R9700 con build HIP/ROCm, por lo que es una opcion verificada para entornos con GPU AMD en lugar de NVIDIA.
- Base para destilacion o fine-tuning textual: al ser un derivado limpio y sin cabeceras adicionales, sirve como punto de partida para ajustes posteriores sobre pesos cuantizados o como referencia de comportamiento del backbone textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que no cita baselines publicados para este tamano y que las cifras son propias.

Integridad de la cuantizacion frente al maestro F16 (llama-perplexity, KLD sobre logits, ctx 1024, 40 ventanas, 20.440 tokens puntuados):

| Cuantizacion | KLD media | KLD mediana | Mismo top-1 | KLD maxima |
|---|---|---|---|---|
| Q4_K_M | 1,4721 | 0,7812 | 56,27% | 29,33 |
| Q6_K | 0,4131 | 0,0865 | 77,93% | 22,61 |
| Q8_0 | 0,2070 | 0,0224 | 85,80% | 24,44 |

El autor advierte que Q4_K_M no es intercambiable con las otras dos: cambia el token top-1 en el 43,7% de las posiciones, frente al 14,2% de Q8_0, por lo que recomienda elegir segun la columna "mismo top-1" y no solo por tamano.

Rendimiento medido el 2026-09-24 en una unica AMD Radeon AI PRO R9700 (gfx1201, 34 GB), llama.cpp `9d286e1b315c` (build HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`):

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Gen t/s chat | Gen t/s llama-bench TG128 |
|---|---|---|---|---|
| Q4_K_M | 1x R9700 | 2030 | 54,4 | 57,9 |
| Q6_K | 1x R9700 | 1347 | 46,2 | 47,6 |
| Q8_0 | 1x R9700 | 1798 | 38,5 | 39,5 |

Nota del autor: las dos columnas de decodificacion son mediciones distintas (chat usa plantilla de chat y un prompt de ~90 tokens; TG128 es una generacion desnuda de 128 tokens) y no deben compararse entre si.

Precision frente al checkpoint origen: coincidencia de top-1 del 90,6% con KLD mediana de 0,005 sobre 1533 tokens (ctx 1024, 3 ventanas de wikitext-2). La cuantizacion anade una perdida adicional de 4,2 puntos de coincidencia top-1 (Q8_0: 86,4%, medido igual).

## Requisitos de hardware

- VRAM estimada segun el tamano de archivo, sin contar cache KV: Q4_K_M ~7,4 GB, Q6_K ~9,8 GB, Q8_0 ~12,7 GB. A 32768 tokens de contexto hay que sumar la cache KV correspondiente.
- GPU de referencia de los benchmarks: AMD Radeon AI PRO R9700 (gfx1201, 34 GB), con build HIP/ROCm. El autor menciona soporte de doble GPU con reparto automatico de capas (`--split-mode layer`, valor por defecto en llama.cpp).
- GPU de consumo: con Q4_K_M el modelo cabe en tarjetas de 8-10 GB de VRAM o superiores; Q6_K y Q8_0 encajan comodamente en una RTX 4090 (24 GB) o equivalentes. No hay mediciones publicadas para GPUs NVIDIA concretas en la informacion disponible.
- Opciones de despliegue: `llama.cpp` (requiere un build que reconozca la arquitectura `gemma4`), `llama-server` con API compatible con OpenAI y `llama-cli` para chat de un solo turno. El modelo se distribuye como GGUF, por lo que es compatible con el ecosistema llama.cpp; soporte en vLLM o TGI: no disponible.
- Latencia y throughput: medidos en la tabla anterior. Prefill entre 1347 y 2030 t/s segun cuantizacion (PP512) y decodificacion entre 38,5 y 54,4 t/s en chat sobre una unica R9700.
- Memoria del repositorio: 59,7 GB en total, ya que incluye las tres cuantizaciones mas el material asociado; para desplegar solo hay que descargar el archivo GGUF concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia |
|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-12B-it-OnlyText-GGUF (este) | 11,91B | no disponible | texto | GGUF (Q4_K_M, Q6_K, Q8_0) | apache-2.0 |
| OnlyTextLLMs/gemma-4-12B-it-OnlyText | no disponible | no disponible | texto | no disponible | apache-2.0 |
| google/gemma-4-12B-it | 11,91B | no disponible | texto, imagen, audio, video | safetensors | apache-2.0 |
| gemma4:12b (Ollama) | no disponible | no disponible | multimodal | GGUF | no disponible |

La diferencia funcional relevante frente al modelo base es la eliminacion de las modalidades de imagen, audio y video: este derivado no puede procesar entradas multimedia. Frente a la version OnlyText sin cuantizar, la diferencia es el formato (GGUF frente a pesos originales) y la perdida de precision introducida por la cuantizacion, cuantificada en las tablas de KLD. No se dispone de datos de rendimiento comparables de alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: Q4_K_M cambia el token top-1 en el 43,7% de las posiciones respecto al maestro F16, frente al 14,2% de Q8_0. Para tareas sensibles a la eleccion exacta del token conviene evitar Q4_K_M.
- Sin decodificacion especulativa: la cabecera draft no esta incrustada en el archivo y el autor indica que la familia no la incluye, por lo que no se puede activar speculative decoding in-file.
- Modelo exclusivamente textual: no procesa imagen, audio ni video; los tokens de esas modalidades se han eliminado del tokenizer.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingue concreta.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo instructivo de este tamano.
- Sesgos: no documentados en la informacion proporcionada.
- Validacion comunitaria nula: 0 descargas y 0 likes; no hay evaluaciones independientes del artefacto.
- Requisito de herramienta: necesita un build de llama.cpp que reconozca la arquitectura `gemma4`; versiones antiguas no cargaran el archivo.
- Modo de razonamiento desactivado por defecto: si se espera salida con trazas de pensamiento hay que activar `enable_thinking` explicitamente.
- Licencia: apache-2.0, que permite uso comercial; el autor recuerda que los pesos originales y su atribucion corresponden al equipo de Google.
- Brecha de 90,6% en top-1 frente al checkpoint origen incluso a igual precision; el autor lo atribuye a diferencias numericas entre llama.cpp y transformers en texto sin plantilla, pero conviene tenerlo en cuenta al comparar salidas entre ambos runners.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OnlyTextLLMs/gemma-4-12B-it-OnlyText-GGUF
- Version OnlyText sin cuantizar: https://huggingface.co/OnlyTextLLMs/gemma-4-12B-it-OnlyText
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Ficha en LM Studio: https://lmstudio.ai/models/google/gemma-4-12b
- Ficha en Ollama: https://ollama.com/library/gemma4:12b
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-12b-it.html
- Licencia apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
