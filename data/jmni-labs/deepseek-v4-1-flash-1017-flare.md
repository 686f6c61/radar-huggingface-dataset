# JMNI-Labs/DeepSeek-V4.1-Flash-1017-FLARE

## Resumen

DeepSeek-V4.1-Flash-1017-FLARE es un paquete de inferencia listo para ejecutar del modelo oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017` de DeepSeek-AI, publicado por JMNI-Labs. No se trata de un modelo entrenado desde cero, sino de una exportación empaquetada y optimizada para su despliegue distribuido sobre clústeres de hosts NVIDIA GB10 (DGX Spark / ASUS GX10, SM121, RoCE), empleando el runtime hyperflare-inference de NVIDIA. El repositorio ofrece dos variantes de paralelismo tensorial: TP6 (seis hosts) y TP4 (cuatro hosts).

El paquete incorpora optimizaciones concretas de prefill con sharding por filas (row-sharded prefill y row-sharded prefill attention), además de un stack de decodificación especulativa MTP con hasta cinco borradores y verificación adaptativa (alpha 0,75). El objetivo es permitir servir un modelo de gran tamaño y capacidades multimodales (pipeline image-text-to-text) en hardware de borde para centro de datos compacto, con un rendimiento agregado que escala hasta 401,4 tok/s en TP6 con 16 peticiones concurrentes.

La relevancia actual radica en que demuestra la viabilidad de ejecutar modelos tipo DeepSeek de última generación en flotas de DGX Spark interconectadas por RoCE, con capacidades de KV cache de hasta 24,9 millones de tokens en TP6 y 30,7 millones en TP4. La licencia es MIT, heredada del modelo base, lo que facilita su uso comercial, aunque las condiciones prácticas de despliegue dependen del runtime hyperflare y del hardware específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base DeepSeek-V4.1-Flash-1017); paquete de inferencia con paralelismo tensorial TP4/TP6 sobre hyperflare |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 245K tokens verificados en prueba needle; KV cache de 24.918.144 tokens (TP6) y 30.772.736 tokens (TP4) por GPU |
| Tipos de cuantizacion | MXFP4 (tag `mxfp4`); compresión de escala de expertos CSF (Local Inference Lab) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Paquete hyperflare (491 GB en TP6, 481 GB en TP4); no se especifica safetensors/GGUF |
| Pipeline | image-text-to-text (multimodal) |
| Hardware objetivo | GB10 (DGX Spark / ASUS GX10, SM121, RoCE) |
| Prefill chunk | 6.144 (TP6) / 8.192 (TP4) |
| Decodificacion especulativa | MTP hasta 5 borradores, verificación adaptativa alpha 0,75 |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, desarrollado por DeepSeek-AI y publicado con licencia MIT. No se dispone en la información proporcionada de detalles sobre el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto.

El repositorio FLARE no entrena el modelo, sino que lo empaqueta para inferencia distribuida. Las innovaciones técnicas destacables son: prefill con sharding por filas y atención de prefill con sharding por filas (contribuciones de FujitsuPolycom, issues #282–#284), gather de rutas (#284), y una rama de lectura anticipada de Engram en disco (#267, incluida pero desactivada en las mediciones). El paquete usa compresión de escala de expertos CSF de Local Inference Lab y sigue los ajustes del paquete de referencia `DeepSeek-V4.1-Flash-1017-FLARE@gb10`. La decodificación especulativa MTP con verificación adaptativa es parte del stack de serving.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline image-text-to-text, admite entradas de imagen y texto.
- Decodificación especulativa MTP con hasta cinco borradores y verificación adaptativa (alpha 0,75), orientada a reducir latencia en generación.
- Procesamiento de contexto largo: prueba needle superada con 245K tokens; KV cache de hasta 24,9M tokens en TP6 y 30,7M en TP4.
- Serving concurrente: probado limpio con 1, 4, 8, 16 y 32 peticiones concurrentes sin fuga de tokens entre peticiones.
- Despliegue distribuido multi-host con paralelismo tensorial TP4 y TP6 sobre GB10 y RoCE.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio específicos: solo se confirma el pipeline image-text-to-text; no se detallan modos adicionales.

## Casos de uso

- Serving de un modelo multimodal de gran tamaño en flotas de DGX Spark: el paquete TP4/TP6 permite desplegar DeepSeek-V4.1-Flash-1017 en cuatro o seis hosts GB10 interconectados por RoCE, adecuado para laboratorios con hardware de borde para centro de datos compacto.
- Procesamiento de documentos largos con imágenes: gracias a la ventana de contexto verificada de 245K tokens y al pipeline image-text-to-text, puede ingerir informes extensos con figuras y responder preguntas sobre su contenido.
- Atención al cliente automatizada multi-turno: con KV cache de decenas de millones de tokens y concurrencia probada hasta 32 peticiones, soporta conversaciones largas y muchas sesiones simultáneas en un solo clúster.
- Generación de código en producción: el paquete reporta un pico de coding de 118,0–122,9 tok/s en TP6 y 98,7–100,8 en TP4 en petición única, adecuado para asistentes de código de baja latencia.
- Investigación en inferencia distribuida: sirve como banco de pruebas reproducible para medir prefill, decode y escalado de concurrencia en clústeres GB10 con hyperflare.
- Análisis de imágenes médicas o industriales con texto: el pipeline image-text-to-text permite combinar descripción visual y razonamiento textual en un mismo modelo, útil en entornos con hardware local.
- Evaluación de calidad y alineación: los scripts `recipe/first_token_probe.py`, `recipe/teacher_forced_nll.py` y `recipe/concurrency_probe.py` permiten validar fidelidad respecto al modelo oficial antes de producción.

## Benchmarks y rendimiento

Decode agregado (tok/s) en TP6, GB10 con un enlace 200G por host vía switch, RoCE, techo GPU 2350 MHz, temperatura 1, salidas de 2.048 tokens, celdas de 20 s:

| TP6 | C1 | C2 | C4 | C8 | C16 |
|---|---:|---:|---:|---:|---:|
| 8K | 78,2 | 117,3 | 185,6 | 273,7 | 401,4 |
| 16K | 76,8 | 124,0 | 183,9 | 278,7 | 400,6 |
| 32K | 76,3 | 114,4 | 177,5 | 263,8 | 398,0 |
| 64K | 76,4 | 122,1 | 182,9 | 261,4 | 391,1 |
| 128K | 72,6 | 114,0 | 182,9 | 257,1 | 379,0 |

Decode agregado (tok/s) en TP4:

| TP4 | C1 | C2 | C4 | C8 | C16 |
|---|---:|---:|---:|---:|---:|
| 8K | 64,7 | 100,9 | 149,8 | 224,2 | 315,9 |
| 16K | 68,7 | 99,1 | 142,6 | 210,5 | 312,3 |
| 32K | 63,9 | 100,8 | 151,4 | 225,2 | 310,0 |
| 64K | 64,5 | 102,5 | 147,9 | 231,0 | 313,0 |
| 128K | 66,5 | 95,3 | 146,5 | 213,3 | 298,5 |

Prefill (tok/s):

| Prefill | 8K | 16K | 32K | 64K | 128K |
|---|---:|---:|---:|---:|---:|
| TP6 (este repo) | 5.256 | 5.824 | 6.260 | 6.427 | 6.154 |
| TP4 (este repo) | 5.423 | 5.375 | 5.556 | 5.641 | 5.679 |
| TP6 anterior sin row sharding | 4.278 | 4.969 | 4.985 | 5.221 | 5.055 |
| gb10 TP4 oficial | 4.484 | 4.671 | 4.927 | 4.977 | 4.872 |

Calidad y corrección: pico de coding en petición única (mediana) TP6 118,0–122,9 tok/s y TP4 98,7–100,8 tok/s; el paquete oficial gb10 midió 107,3 en la misma flota. Primera distribución de token sobre 24 prompts fijos frente al paquete oficial gb10 TP4: TP6 top-1 21/24 con KL media 0,051 nats; TP4 21/24 con 0,059. NLL forzado por profesor sobre 6 pasajes: TP6 −1,4562, TP4 −1,4461, oficial gb10 −1,4557.

## Requisitos de hardware

- Cuatro hosts GB10 (TP4) o seis hosts GB10 (TP6) con agentes hyperflare emparejados y RoCE entre ellos (un enlace 200G por host vía switch en las mediciones).
- Runtime hyperflare desde main `a5b3b2b0` o posterior; los paquetes se sirvieron y midieron solo en esa build (main `a5b3b2b0` + #282–#284 + #267 + cambio local en la reserva de host de GPU integrada). No probado con main `70069281`.
- TP6 mantiene las tablas Engram en RAM (31,6 GiB por host); TP4 las lee de disco.
- Tamaño del paquete: 491 GB (TP6) y 481 GB (TP4).
- VRAM estimada para inferencia: no disponible de forma desagregada; el KV cache por GPU es de 24.918.144 tokens (TP6, Engram en RAM, `--memory-limit=112.9G`) y 30.772.736 tokens (TP4, Engram en disco, `--memory-limit=-2G`), con reserva de host de 3,5 GiB en la build propia frente a los 6,1 GiB de la build estándar.
- No cabe en GPU de consumo (RTX 4090, etc.); requiere GB10 en clúster.
- Despliegue mediante el cliente `flare orbit run` con `--cluster six-sparks` (TP6) y los parámetros indicados en la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: tiempo hasta el primer token de 42,4 s en prueba needle fría de 245K tokens en TP6.
- Configuración obligatoria: `--scheduler-checkpoint-extra-work-fraction 0` para evitar bloqueos de 37–110 s antes del primer token (issue upstream #292).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-FLARE (este repo) | no disponible | 245K verificado; KV 24,9M/30,7M tokens | Decode TP6 hasta 401,4 tok/s agregado; prefill hasta 6.427 tok/s | MIT | Hugging Face, dos ramas TP4/TP6 |
| DeepSeek-V4.1-Flash-1017-FLARE@gb10 (Local Inference Lab) | no disponible | no disponible | Referencia de calidad; prefill gb10 TP4 oficial 4.484–4.977 tok/s | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017-abliterated-FLARE (JMNI-Labs) | no disponible | no disponible | no disponible | MIT | Hugging Face, repo con gating |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (oficial) | no disponible | no disponible | Referencia base | MIT | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la model card; aplican las limitaciones generales del modelo base DeepSeek-V4.1-Flash-1017.
- El paquete solo se ha probado en la build de runtime hyperflare main `a5b3b2b0` + #282–#284 + #267 + cambio local de reserva; cargar con main `70069281` no ha sido probado, aunque comparte ABI de proxy RoCE (14).
- Requiere pasar `--scheduler-checkpoint-extra-work-fraction 0`; con el valor por defecto (0,05) los prompts nuevos se bloquean 37–110 s antes del primer token (issue #292).
- TP4 es un 6–8% más lento que el paquete oficial gb10 en coding de petición única; la causa no está aislada.
- Las comparativas con paquetes anteriores son de stack combinado (versión de motor, row-shard, read-ahead y ajustes de exportación difieren), por lo que no aíslan el efecto de cada cambio.
- La rama de lectura anticipada de Engram en disco (#267) está incluida pero desactivada en todas las mediciones.
- Dependencia de hardware muy específico (GB10, RoCE, cuatro o seis hosts); no desplegable en GPU convencionales.
- Idiomas soportados no declarados; el pipeline multimodal no detalla cobertura lingüística.
- La licencia MIT del modelo base permite uso comercial, pero el despliegue práctico depende del runtime hyperflare y de sus propias condiciones.
- Cero descargas y cero likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/JMNI-Labs/DeepSeek-V4.1-Flash-1017-FLARE
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante abliterada (gated): https://huggingface.co/JMNI-Labs/DeepSeek-V4.1-Flash-1017-abliterated-FLARE
- Paquete de referencia Local Inference Lab: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-1017-FLARE/tree/gb10
- Runtime hyperflare-inference: https://github.com/NVIDIA/hyperflare-inference
- Rama TP6: https://huggingface.co/JMNI-Labs/DeepSeek-V4.1-Flash-1017-FLARE/tree/gb10-tp6
- Rama TP4: https://huggingface.co/JMNI-Labs/DeepSeek-V4.1-Flash-1017-FLARE/tree/gb10-tp4
