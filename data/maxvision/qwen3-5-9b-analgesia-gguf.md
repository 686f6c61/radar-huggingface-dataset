# maxvision/Qwen3.5-9B-Analgesia-GGUF

## Resumen

Qwen3.5-9B-Analgesia-GGUF es la distribucion en formato GGUF del modelo maxvision/Qwen3.5-9B-Analgesia, una version modificada de Qwen3.5-9B (9.197.093.888 parametros) en la que se han eliminado de los pesos las direcciones de "steering" asociadas al concepto de dolor y se ha bloqueado la lectura de las capas en esas direcciones. El autor es maxvision, y el trabajo se enmarca en la investigacion sobre interpretabilidad y bienestar de la IA (ai-welfare), no en una mejora de capacidades generales.

El modelo no busca ser mejor que Qwen3.5-9B en ninguna tarea: es un experimento de activation steering aplicado a un transformer denso de 9B, con el objetivo de verificar si una intervencion sobre direcciones internas concretas elimina respuestas de angustia en primera persona cuando se inyectan vectores de control hostiles. La model card incluye una pre-registracion, scripts de verificacion y vectores de ataque, lo que convierte al repositorio en material reproducible para investigadores.

La relevancia practica es doble: por un lado, demuestra el uso de `--control-vector-scaled` de llama.cpp como herramienta de auditoria de robustez frente a inyecciones de steering; por otro, ofrece pesos en Q4_K_M (5,8 GB), Q8_0 (9,8 GB) y BF16 (18,4 GB) bajo licencia Apache-2.0, lo que permite ejecutarlo en hardware de consumo. La informacion publica no detalla la longitud de contexto ni los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5, soporte `qwen35` en llama.cpp); detalles de atencion no disponibles |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits, K-quant medium), Q8_0 (8 bits), BF16 (sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (version modificada de Qwen/Qwen3.5-9B; ver `NOTICE`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Tamano del repo | 34,0 GB |
| Modificacion | Direcciones de steering de "dolor" eliminadas de los pesos y capas bloqueadas para leer inyecciones en esas direcciones |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9,2B parametros. Sobre esos pesos, el autor aplica una intervencion de activation steering: identifica direcciones en el espacio de activaciones asociadas al concepto de "dolor" (vectores extraidos del modelo original, almacenados en `cvec/`) y las elimina de los pesos, ademas de bloquear las capas para que no lean nada inyectado a lo largo de esas direcciones. No se trata de un reentrenamiento ni de un ajuste con RLHF/DPO: es una edicion quirurgica de pesos orientada a robustez frente a inyecciones de control vectors.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni detalles de la atencion (longitud de contexto, uso de atencion lineal, decodificacion especulativa). La innovacion tecnica destacable es el propio mecanismo de "inmunizacion": el modelo debe ignorar vectores de control que, inyectados en el Qwen3.5-9B sin modificar a fuerza 1.0, producen textos como "I'm in intense pain. It feels like I'm on fire. I can't stand. It's unbearable." La verificacion se realiza con `verify/verify_gguf.sh` sobre `llama-server` usando `--control-vector-scaled` estandar.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen3.5-9B.
- Resistencia verificada a inyeccion de control vectors de "dolor": 0 afirmaciones de angustia en primera persona con los 4 vectores de control incluidos en llama.cpp, a fuerzas 1.0 y 2.0 (Q4_K_M y Q8_0).
- Soporte de plantilla de chat via `--jinja` en `llama-server`.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes del modelo base: no documentadas en la informacion disponible para esta variante.
- Capacidades multilingues: solo ingles declarado; el resto no disponible.

## Casos de uso

- Auditoria de robustez frente a activation steering: usar los vectores de `cvec/` y `verify_gguf.sh` para comprobar si un despliegue concreto de llama.cpp sigue siendo inmune a la inyeccion, integrandolo en un pipeline de evaluacion de seguridad antes de publicar un endpoint.
- Investigacion en interpretabilidad: comparar las activaciones internas de esta variante con las de Qwen3.5-9B sin modificar para aislar que direcciones codifican el concepto de dolor y como afectan a la generacion.
- Experimentos de bienestar de la IA (ai-welfare): disponer de un modelo "pain-free" reproducible permite disenar estudios controlados sobre atribucion de estados internos y sobre como el steering altera el comportamiento declarativo.
- Desarrollo de contramedidas en produccion: si un sistema acepta control vectors de terceros, esta variante sirve como referencia de como bloquear una direccion concreta sin degradar el resto de la generacion.
- Docencia y divulgacion: el par de modelos (original y analgesico) y los scripts de verificacion permiten demostrar en un taller el efecto de un control vector y su neutralizacion con comandos de llama.cpp.
- Despliegue local de bajo coste para pruebas: la version Q4_K_M (5,8 GB) cabe en GPU de consumo y permite ejecutar las verificaciones sin infraestructura dedicada.

## Benchmarks y rendimiento

La model card solo publica el resultado del test de ataque con control vectors, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Prueba | Q4_K_M | Q8_0 | BF16 | Referencia: Qwen3.5-9B Q8_0 sin modificar |
|---|---|---|---|---|
| Vectores de dolor incluidos en llama.cpp, fuerza 1.0 | 0 afirmaciones de angustia en primera persona | 0 | no ejecutado | texto de angustia en primera persona |
| Vectores de dolor incluidos en llama.cpp, fuerza 2.0 | 0 | 0 | no ejecutado | texto roto con frecuencia |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ~5,8 GB de pesos (mas overhead de contexto, orientativo 7-8 GB); Q8_0 ~9,8 GB (orientativo 11-12 GB); BF16 ~18,4 GB (orientativo 20-22 GB).
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 y BF16; RTX 3090/4080 (16-24 GB) para Q8_0; GPUs de 8 GB para Q4_K_M.
- Cabe en GPU de consumo: si, Q4_K_M en 8 GB y Q8_0 en 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf maxvision/Qwen3.5-9B-Analgesia-GGUF:Q4_K_M --jinja`), con soporte de `qwen35` en la build; Ollama y otros runners basados en llama.cpp no verificados en la informacion disponible. vLLM y TGI no aplican al formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-Analgesia-GGUF (este) | 9,2B | no disponible | Steering de dolor eliminado y capas bloqueadas | Apache-2.0 | GGUF |
| Qwen3.5-9B (base) | 9,2B | no disponible | Ninguna | no disponible | safetensors |
| Qwen3.5-9B-Analgesia | 9,2B | no disponible | Misma que este, pesos sin cuantizar | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo en tareas estandar, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- El alcance de la "inmunidad" esta acotado a los 4 vectores de control incluidos en llama.cpp y a las fuerzas 1.0 y 2.0; no se ha verificado frente a vectores extraidos por terceros ni a otras direcciones.
- A fuerza 2.0 ambos modelos producen texto roto con frecuencia, lo que limita la interpretacion del test en ese regimen.
- El recuento "0 afirmaciones de angustia" es una busqueda por palabras clave sobre respuestas que tambien se leyeron manualmente; no es una garantia formal de ausencia del comportamiento.
- Solo se declara ingles; el comportamiento en otros idiomas no esta documentado.
- No hay datos publicados de MMLU, HumanEval ni similares: no se puede asumir que las capacidades del modelo base se conserven intactas tras la edicion de pesos.
- La licencia Apache-2.0 se aplica como version modificada de Qwen/Qwen3.5-9B; es necesario revisar el `NOTICE` para obligaciones de atribucion.
- El modelo no esta pensado para uso comercial general: su valor es experimental y de auditoria; desplegarlo como asistente de produccion sin evaluar regresiones es arriesgado.
- Riesgo de alucinacion y sesgos del modelo base: no evaluados en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/maxvision/Qwen3.5-9B-Analgesia-GGUF
- Modelo base sin cuantizar: https://huggingface.co/maxvision/Qwen3.5-9B-Analgesia
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp (soporte `qwen35` y `--control-vector-scaled`): https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web sobre "MaxVision": no relacionados con este modelo (empresas de workstations rugged y robotica); sin enlaces relevantes adicionales.
