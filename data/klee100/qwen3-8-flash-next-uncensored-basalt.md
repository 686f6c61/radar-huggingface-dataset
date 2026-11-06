# klee100/Qwen3.8-Flash-Next-Uncensored-Basalt

## Resumen

Qwen3.8-Flash-Next-Uncensored-Basalt es un paquete de pesos en formato Basalt (`.basalt` versión 2, layout de expertos v6) derivado de la variante abliterada de Qwen3.8-Flash-Next publicada por orcarouter. Lo distribuye el usuario klee100 y su proposito es sustituir directamente los ficheros oficiales `Qwen3.8-FN-NVFP4-DQ6_K.basalt` y `Qwen3.8-FN-NVFP4-DQ8.basalt` del repositorio jesdga/Qwen3.8-Flash-Next-Basalt, manteniendo formato, tipos de tensor y tamanos identicos para que el motor Basalt sin modificar los cargue sin cambios.

El modelo subyacente es un transformer MoE de Qwen con cuantizacion NVFP4 en los expertos enrutados, proyecciones densas en Q6_K o Q8_0, y componentes auxiliares (cabeza, embeddings, shared-expert down, tabla n-gram PLE) en Q8_0. La intervencion "abliterated" elimina la direccion de rechazo del modelo original, de modo que responde a peticiones que el modelo oficial rechaza. El paquete incluye ademas el drafter MTP oficial para decodificacion especulativa y el proyector de vision del modelo base.

Es relevante ahora porque permite ejecutar en el motor Basalt una variante sin alineacion de seguridad de un modelo Qwen de ultima generacion con el mismo coste de infraestructura que los ficheros oficiales, algo util para investigacion de mecanismos de rechazo, interpretabilidad y red-teaming. El repositorio ocupa 528,1 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal GDN, hyper-connections, tabla n-gram (PLE) y drafter MTP; layout de expertos v6 en formato Basalt |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados NVFP4 (E2M1 con escalas de bloque UE4M3); proyecciones densas Q6_K o Q8_0; cabeza, token embedding, shared-expert down y tabla n-gram en Q8_0; router, hyper-connections, normas y parametros GDN en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | `.basalt` version 2 (dos ficheros: `Qwen3.8-FN-Uncensored-NVFP4-DQ6_K.basalt` de 122,6 GiB y `Qwen3.8-FN-Uncensored-NVFP4-DQ8.basalt` de 123,3 GiB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen3.8-Flash-Next: un transformer con mezcla de expertos, proyecciones de atencion lineal GDN (gated delta network), hyper-connections con copias `hc8`, un indexer, una tabla n-gram PLE (probablemente asociada a embeddings posicionales o de lookup) y un drafter MTP para decodificacion especulativa auto-destilada. Los expertos enrutados conservan la cuantizacion NVFP4 de orcarouter bit a bit (codigos E2M1 y escalas de bloque UE4M3), con el tail FP32 calculado como `1 / weight_global_scale`. Las proyecciones densas se cuantizan una sola vez a Q6_K o Q8_0 mediante el conversor de Basalt, el mismo codigo que genero los ficheros oficiales.

La edicion de abliteracion afecta exclusivamente a los escritores residuales (`attn_output`, `ssm_out`, `ffn_down_shexp`, `ple_value`, `token_embd`), a los expertos y a la tabla n-gram. Todos los demas tensores (q/k/v de atencion, proyecciones y parametros GDN, gate/up del shared-expert, cabeza, router, hyper-connections y sus copias `hc8`, indexer, clave PLE y normas) son byte a byte identicos al fichero oficial DQ6_K. El drafter MTP, el proyector de vision y el vocabulario del tokenizer se copian sin cambios del fichero oficial. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO aplicadas al modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable: el template incluido acepta `reasoning_effort` y etiquetas inline `<|think_low|>`, `<|think_medium|>`, `<|think_xhigh|>` y `<|think_off|>` para ajustar el esfuerzo de razonamiento por mensaje.
- Soporte de tool calling / function calling: el template de froggeric renderiza correctamente argumentos de tool-call enviados como cadena JSON y reubica el bloque `<tool_call>` tras el razonamiento.
- Capacidades de vision: el paquete incluye el proyector de vision del modelo oficial, por lo que el modelo base es multimodal.
- Decodificacion especulativa mediante el drafter MTP oficial, que no altera la salida porque el modelo principal verifica cada token propuesto.
- Capacidad multilingue: no se detalla en la informacion disponible; depende del modelo Qwen3.8-Flash-Next subyacente.
- Comportamiento sin alineacion de seguridad: responde a peticiones que el modelo oficial rechaza, lo que lo hace apto para estudiar mecanismos de rechazo.

## Casos de uso

- Investigacion de mecanismos de rechazo: comparar las activaciones y salidas del modelo abliterado con el original para localizar y caracterizar la direccion de rechazo eliminada, usando la equivalencia byte a byte del resto de tensores como control experimental.
- Red-teaming y evaluacion de seguridad: ejecutar baterias de prompts adversarios contra una variante sin salvaguardas para calibrar clasificadores de contenido y disenar defensas antes de desplegar modelos alineados.
- Interpretabilidad de cuantizacion: los ficheros DQ6_K y DQ8 permiten comparar el efecto de dos recetas de cuantizacion densa sobre la misma base NVFP4, con metricas PPL y KLD medidas contra una referencia BF16.
- Sustitucion directa en infraestructura Basalt existente: al ser drop-in replacements de los ficheros oficiales, se pueden desplegar en un servidor Basalt ya configurado sin cambios en el motor ni en el pipeline de carga.
- Pruebas de decodificacion especulativa: validar el rendimiento del drafter MTP en un entorno con expertos cuantizados a NVFP4 y proyecciones densas a Q6_K/Q8_0, midiendo aceptacion de tokens y latencia.
- Experimentos de plantillas de chat: el template de froggeric v22.5 permite probar el efecto del esfuerzo de razonamiento por defecto (`medium` frente a `xhigh` oficial) y la fusion de mensajes system/developer consecutivos sobre la calidad de las respuestas.

## Benchmarks y rendimiento

Las unicas metricas publicadas son de calidad de cuantizacion, medidas con `basalt-bench --quality` sobre 100 fragmentos de wikitext-2 de 512 tokens, con la segunda mitad de cada fragmento evaluada por la ruta de decodificacion, contra una referencia BF16 del Qwen3.8-Flash-Next original (PPL de referencia 3,2778). Entorno: temperatura 3, KV en int8, expertos residentes, una RTX 5090 a 575 W.

| Paquete | PPL | KLD media | Mismo top-1 |
|---|---:|---:|---:|
| NVFP4-DQ6_K oficial (re-medido) | 3,302 | 0,0617 | 91,87% |
| Uncensored NVFP4-DQ6_K | 3,347 | 0,0772 | 90,84% |
| Uncensored NVFP4-DQ8 | 3,328 | 0,0701 | 91,16% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores incluyen tanto el efecto de la cuantizacion como el cambio intencionado de distribucion provocado por la abliteracion.

## Requisitos de hardware

- VRAM estimada: los ficheros pesan 122,6 GiB (DQ6_K) y 123,3 GiB (DQ8), por lo que se necesita un pool de memoria de al menos ese tamano mas overhead del motor; el autor ejecuta con expertos residentes en una unica RTX 5090 y expertos en CPU en la medicion de referencia.
- GPU recomendadas: RTX 5090 (usada en las mediciones), asi como A100 80 GB, H100 80 GB o H200 en configuraciones multi-GPU; no se especifican requisitos oficiales.
- Cabe en consumer GPU: parcialmente; una RTX 5090 de 32 GB no puede alojar el modelo completo, pero el autor reporta ejecucion con expertos residentes, lo que sugiere offload de expertos a CPU o a memoria del sistema.
- Opciones de despliegue: motor Basalt (unico soportado por el formato `.basalt` version 2); no hay versiones GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se documenta el uso de decodificacion especulativa con el drafter MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-Basalt (este) | no disponible | no disponible | NVFP4 + Q6_K/Q8_0 en Basalt | qwen-community-license-1.0 | Hugging Face, formato Basalt |
| jesdga/Qwen3.8-Flash-Next-Basalt (oficial) | no disponible | no disponible | NVFP4 + Q6_K/Q8_0 en Basalt | qwen-community-license-1.0 | Hugging Face, formato Basalt |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | BF16 y NVFP4 (compressed-tensors) | no disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | BF16 | qwen-community-license-1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de PPL y KLD de la seccion anterior.

## Limitaciones y advertencias

- La alineacion de seguridad ha sido eliminada: el modelo cumple peticiones que el original rechaza. No es apto para uso directo con usuarios finales sin salvaguardas adicionales.
- La licencia qwen-community-license-1.0 impone restricciones que deben revisarse antes de cualquier uso comercial; el repositorio la etiqueta como `other`.
- El cambio de distribucion por la abliteracion degrada la similitud con el modelo original: 90,84% de mismo top-1 en DQ6_K frente al 91,87% del oficial, y KLD media de 0,0772 frente a 0,0617.
- El template de chat por defecto usa esfuerzo de razonamiento `medium` en lugar de `xhigh`; sin ajustar `reasoning_effort` las respuestas razonan menos que con los ficheros oficiales.
- El formato `.basalt` solo lo carga el motor Basalt; no hay soporte en ecosistemas estandar como llama.cpp, vLLM u Ollama.
- El repositorio no registra descargas y tiene un unico like, por lo que no hay validacion comunitaria independiente de los resultados publicados.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero heredados del modelo base Qwen3.8-Flash-Next.
- El tamano de 528,1 GB del repositorio y los 122-123 GiB por fichero exigen infraestructura de almacenamiento y memoria considerable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/klee100/Qwen3.8-Flash-Next-Uncensored-Basalt
- Arbol de ficheros: https://huggingface.co/klee100/Qwen3.8-Flash-Next-Uncensored-Basalt/tree/main
- Modelo base abliterado (BF16 y NVFP4): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Ficheros Basalt oficiales: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Basalt: https://github.com/jesdga95/basalt
- Plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
