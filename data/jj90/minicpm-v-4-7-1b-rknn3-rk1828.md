# jj90/MiniCPM-V-4.7-1B-RKNN3-RK1828

## Resumen

MiniCPM-V-4.7-1B-RKNN3-RK1828 es una conversión del modelo vision-language MiniCPM-V 4.7 1B de OpenBMB al formato RKNN3 para ejecutarse de extremo a extremo sobre la NPU Rockchip RK1828 (y RK1820). El autor del artefacto es el usuario jj90 y no OpenBMB; se trata, por tanto, de un port de despliegue en hardware de borde, no de un modelo nuevo. Incluye tanto la torre de texto como la torre de visión compiladas para la NPU, junto con scripts de arranque, ejemplos de peticiones, scripts de conversión y una guía de despliegue.

El modelo base es MiniCPM-V 4.7 1B, un VLM de aproximadamente mil millones de parámetros con licencia Apache-2.0, orientado a tareas image-text-to-text en inglés y chino. La conversión emplea cuantización w4a16 (grupo de 32, 8 núcleos) para el cuerpo y w6a16 para la cabeza, con una huella de NPU medida de 1269 MB. El repositorio ocupa 1,5 GB y expone un servidor compatible con la API de OpenAI (`POST /v1/chat/completions`).

La relevancia de este artefacto es práctica: demuestra que un VLM de 1B puede responder preguntas reales sobre imágenes en una NPU de bajo consumo, con un throughput medido de unos 90 tok/s en generación y 1700 tok/s en prefill. Ahora bien, incorpora un adaptador de contrato en tiempo de ejecución que remuestrea los tokens visuales de 8×8 a 14×14, por lo que sus salidas no son equivalentes a las del modelo original y no debe usarse para reproducir sus métricas de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (torre de texto basada en Qwen3.5-0.8B con `vocab_size=248094` y `lm_head` independiente; torre de visión + merger exportadas a ONNX y luego a RKNN) |
| Parametros totales | no disponible (modelo base de 1B; la cabeza LM se documenta con 254M parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a16 (`normal`, `group32`, 8 nucleos) para el cuerpo; w6a16 para la cabeza |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN3 (6 artefactos de conversion); el repositorio tambien incluye tag `gguf` |
| Hardware objetivo | NPU Rockchip RK1828 / RK1820 (probado en `RM1828MC0-F`, firmware 1.1.0) |
| Runtime | `rknn3_110` (`rkllm3-server`), versiones de toolkit, proxy y firmware deben coincidir |
| Huella en NPU | 1269 MB (medicion diferencial exclusiva) |
| Entrada de imagen | 448×448, imagen unica |
| Host requerido | PC Windows o placa RK3588 / RK3576; Ubuntu x86 no puede controlar el modulo directamente |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V 4.7 1B combina una torre de texto y una torre de visión con un módulo merger que proyecta las representaciones visuales al espacio del LLM. Segun la documentacion de la conversion, la torre de texto reutiliza la arquitectura Qwen3.5-0.8B con un vocabulario de 248094 entradas y una `lm_head` independiente de 254M parametros; es critico fijar `tie_word_embeddings` a `false` en el nivel superior, porque de lo contrario `tie_weights()` de Hugging Face enlaza silenciosamente la cabeza con los embeddings y el modelo produce texto incoherente.

La torre de vision y el merger se exportaron a ONNX con `transformers>=5.18` (`MiniCPMV4_7ForConditionalGeneration`) y despues a RKNN con entrada `uint8 NHWC` y `mean/std = 0.5*255`. La salida debe ser tridimensional `[1, N, 1024]`; una exportacion bidimensional `[N, 1024]` se interpreta erroneamente como «N imagenes de 1024 tokens». El detalle mas relevante es el adaptador de contrato: MiniCPM-V 4.7 emite de forma nativa 64 tokens visuales por imagen de 448×448 (8×8), pero el callback multimodal de RKNN3 exige `image_ph * image_pw = 14×14 = 196` tokens. Para satisfacerlo se inserto un remuestreo por vecino mas cercano de 8×8 a 14×14 dentro del grafo (solo operaciones Gather/Reshape, sin `Resize`). Este cambio afecta unicamente a la estructura del grafo: el SHA256 de los ficheros `.weight` es identico byte a byte al de la compilacion sin adaptar de 64 tokens, porque no se toca ningun peso. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni las etapas de RLHF o DPO del modelo base en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Respuesta a preguntas sobre imagenes (image-text-to-text) con entrada de 448×448.
- Razonamiento multimodal con modo `<think>` (cadena de pensamiento) en el modelo base.
- Comprension basica de color y forma en imagenes simples, verificado en dispositivo: imagen naranja → «这张图是橙色。»; cuadrado negro → «黑色正方形».
- Respuestas de texto puro sin imagen (por ejemplo, capital de China → «北京»).
- Servicio mediante API compatible con OpenAI (`POST /v1/chat/completions`) con contenido multimodal en formato de array.
- Coexistencia con otros modelos en la misma NPU: probado junto a un ASR chino de 0.6B (3458 MB) y de 1.7B (3353 MB), con todas las peticiones en HTTP 200.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision de alta resolucion, OCR denso y conteo multiobjeto: no verificado.

## Casos de uso

- Asistente visual en dispositivos de borde: el modelo responde preguntas sobre una imagen capturada por la camara en una placa Rockchip, sin conexion a la nube, gracias a su huella de 1269 MB en NPU y a su naturaleza on-device.
- Clasificacion y descripcion de imagenes simples en tiempo real: con ~1700 tok/s de prefill y ~90 tok/s de generacion, es adecuado para etiquetar fotos de producto, verificar colores o describir objetos en una linea de produccion.
- Accesibilidad en hardware empotrado: integrado en un dispositivo con placa RK3588, puede describir el entorno a partir de una imagen de 448×448 para usuarios con discapacidad visual en escenarios controlados.
- Kiosco interactivo o terminal de informacion: el servidor compatible con OpenAI permite conectar un front-end web o una app movil a traves de peticiones HTTP estandar con imagenes codificadas en base64.
- Prototipado de pipelines multimodales en NPU: util para equipos que evaluan la viabilidad de ejecutar un VLM completo (texto y vision) en silicio Rockchip antes de comprometerse con hardware dedicado.
- Coexistencia con reconocimiento de voz: segun la verificacion del autor, el VLM convive con un ASR de 0.6B o 1.7B en la misma NPU, lo que habilita interfaces por voz y vision en un unico dispositivo de borde.
- Demostracion tecnica de conversion ONNX → RKNN3: los scripts de `convert/` y la guia `docs/DEPLOY.md` sirven como referencia reproducible para portar otros VLM a la NPU RK1828.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de rendimiento en dispositivo:

| Metrica | Resultado |
|---|---|
| Throughput de generacion | ~90 tok/s |
| Throughput de prefill | ~1700 tok/s |
| Tokens visuales por imagen en runtime | 196 (196 visuales + texto; `timings.prompt_n ≈ 218`) |
| Huella en NPU | 1269 MB |
| Memoria con ASR 0.6B coexistente | 3458 MB |
| Memoria con ASR 1.7B coexistente | 3353 MB |
| `finish_reason` en casos simples | `stop` |

## Requisitos de hardware

- NPU Rockchip RK1828 o RK1820; probado en el modulo `RM1828MC0-F` con firmware 1.1.0.
- Host: PC con Windows o placa RK3588 / RK3576. Ubuntu x86 no puede controlar el modulo directamente.
- Runtime `rknn3_110` (`rkllm3-server.exe` y DLL asociadas); las versiones de toolkit, proxy y firmware deben coincidir.
- Huella de memoria en NPU de 1269 MB para el modelo, con margen adicional para el servidor y para modelos coexistentes (hasta ~3,4 GB en las pruebas con ASR).
- No es ejecutable en GPU de consumo (RTX 4090, etc.) ni en A100/H100: los pesos estan compilados para la NPU Rockchip.
- Opciones de despliegue: `start.cmd` incluido en `rknn/` (por defecto `0.0.0.0:8899`, configurable con `RK_HOST` / `RK_PORT`) y cliente de ejemplo `send_vlm_req.cmd` en `host/`.
- El servidor solo esta listo cuando una inferencia real devuelve respuesta; el log de sincronizacion de pesos puede permanecer quieto unos 2 minutos y no debe sondearse `rknn-smi` durante la carga.
- Latencia y throughput: ~90 tok/s de generacion y ~1700 tok/s de prefill medidos en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-RKNN3-RK1828 (este) | ~1B | no disponible | RKNN3 para NPU RK1828/RK1820 | Apache-2.0 | Adaptador de 196 tokens; no equivalente al original |
| openbmb/MiniCPM-V-4.7-1B (base) | ~1B | no disponible | safetensors para GPU/CPU | Apache-2.0 | Modelo original; 64 tokens visuales por imagen de 448×448 |
| Otros VLM de ~1B para borde | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No es equivalente al MiniCPM-V 4.7 original: el adaptador de 196 tokens (remuestreo 8×8 → 14×14) altera la estructura del grafo y las salidas; no debe usarse para reproducir la precision del modelo base.
- canvas mRoPE, el tiling multirresolucion, el OCR de alta resolucion y el conteo denso de multiobjeto no fueron verificados.
- El OCR es, como maximo, «caracteres legibles»: en las pruebas, `RK1828` se transcribio como `RK₁₈₂₈`.
- Solo se probo entrada de imagen unica de 448×448.
- En el modelo de 1B con cadena `<think>`, aumentar `max_tokens` no es monotonamente mas seguro: 256 funciono en un caso de OCR donde 512 se quedo bloqueado dentro de `<think>`.
- Problema conocido aguas arriba: ante un error del dispositivo ASR, la memoria de la NPU puede fugarse (bucle de reintento `mem_sync ret=-10`); la solucion es matar el proceso ASR.
- Riesgo de alucinacion: inherente a un modelo de 1B; las respuestas deben validarse en produccion, especialmente en tareas de OCR o conteo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas limitados a ingles y chino; no se ha verificado el rendimiento en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia cubre el modelo base y la conversion; conviene revisar los terminos del runtime RKNN3 de Rockchip, que no se detallan en la informacion disponible.
- En produccion, comprobar siempre `finish_reason` y no solo el codigo HTTP 200; las imagenes complejas pueden devolver `length`.
- El servidor no responde correctamente a `Invoke-WebRequest` de PowerShell; debe usarse `curl.exe --max-time`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jj90/MiniCPM-V-4.7-1B-RKNN3-RK1828
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Guia de despliegue incluida: `docs/DEPLOY.md` (dentro del repositorio)
- Receta de conversion incluida: `convert/README.md` (dentro del repositorio)
- Checksums: `SHA256SUMS` (dentro del repositorio)
