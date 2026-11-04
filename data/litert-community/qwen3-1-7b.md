# litert-community/Qwen3-1.7B

## Resumen

Qwen3-1.7B LiteRT-LM es la variante optimizada para inferencia en dispositivo (on-device) del modelo Qwen3-1.7B de Alibaba Qwen, publicada por la comunidad litert-community. El modelo original es un transformer denso de 1.700 millones de parametros con capacidad de razonamiento explicito (thinking mode) y soporte de tool calling; esta version lo reempaqueta en el formato `.litertlm` de LiteRT-LM, el runtime de Google AI Edge para ejecutar modelos en moviles, tablets y otros dispositivos de borde.

El repositorio ofrece dos artefactos con recetas de cuantizacion distintas: uno con pesos INT8 dinamicos y operadores compuestos para GPU (1.674 MiB) y otro con pesos INT4 en bloques de 32 y activaciones FP32 (932 MB). Ambos declaran una longitud de contexto por defecto de 4.096 tokens en sus metadatos, aunque el export INT8 se genero con una cache KV de 32.768 tokens.

La relevancia actual del modelo radica en que permite ejecutar un LLM con modo de razonamiento y function calling enteramente en un telefono movil, sin conexion a red ni servidor. Las cifras publicadas por el autor (2.064 tok/s de prefill y 29,7 tok/s de decodificacion en un Galaxy S26 con GPU OpenCL) lo sitúan como una opcion practica para asistentes locales, procesamiento offline y aplicaciones donde la privacidad impide enviar datos a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM con operadores compuestos para GPU |
| Parametros totales | 1.700 millones (modelo base Qwen/Qwen3-1.7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens por defecto en metadatos; cache KV exportada de 32.768 tokens en el artefacto INT8 |
| Tipos de cuantizacion | INT8 dinamico canal a canal con activaciones FP32 (artefacto principal); INT4 dinamico en bloques de 32 con activaciones FP32 (artefacto secundario) |
| Idiomas soportados | Ingles declarado en la model card; el modelo base Qwen3 es multilingue, pero esta ficha no documenta idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos externos en seccion TFLiteWeights en el artefacto INT8 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de la familia Qwen3 con atencion multi-cabeza con QK-norm, normalizacion RMSNorm y capas feed-forward con activacion SwiGLU. La model card de esta variante no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card del modelo base Qwen/Qwen3-1.7B, no incluida en la informacion proporcionada.

La innovacion tecnica de esta publicacion esta en el proceso de exportacion, no en el entrenamiento. El artefacto INT8 se genero con `litert-torch` (`export_hf`, commit `0a81bf6f3`) aplicando `--apply_gpu_composites=True`, lo que convierte RMSNorm, QK-norm, RoPE, atencion, SwiGLU y la actualizacion de la cache KV en operadores compuestos nativos de la ruta GPU de LiteRT-LM, y fusiona las proyecciones QKV y Gate/Up. Se exporto con longitudes de prefill de 128 y 1.024 tokens y una cache de 32.768 tokens, y coloca los pesos fuera del grafo del modelo (pesos externos) para reducir el coste de carga. El artefacto INT4 se convirtio por la misma ruta y se cuantizo con AI Edge Quantizer, incorporando asimismo las optimizaciones de grafo para GPU y asignacion estatica de memoria en prefill.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad derivada del modelo base Qwen3-1.7B.
- Modo de razonamiento (thinking) activado por defecto: la configuracion oficial qwen3 de LiteRT-LM emite el razonamiento por el canal `thought` salvo que se pase `enable_thinking=false`.
- Tool calling / function calling: el runtime de LiteRT-LM parsea las llamadas a herramientas generadas por el modelo.
- Razonamiento multi-paso dentro de una misma respuesta gracias al canal de pensamiento separado de la respuesta final.
- Ejecucion completamente local y offline en dispositivos Android (y potencialmente otros) mediante LiteRT-LM.
- Compatibilidad con la aplicacion Edge Gallery de Google AI Edge para importar y probar el modelo sin escribir codigo.
- Tokenizador identico byte a byte al de Qwen/Qwen3-1.7B, lo que garantiza consistencia en el preprocesado respecto al modelo original.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo se integra via LiteRT-LM o la app Edge Gallery y responde sin conexion, con la ventana de 4.096 tokens suficiente para dialogos multi-turno de extension moderada y sin enviar datos del usuario a ningun servidor.
- Procesamiento de texto privado en el dispositivo: clasificacion, resumen o extraccion de entidades sobre documentos locales (notas, correos, mensajes) donde la politica de privacidad prohibe el envio a APIs en la nube.
- Automatizacion con function calling en apps moviles: el runtime parsea las llamadas a herramientas, lo que permite al modelo invocar funciones locales (calendario, contactos, ajustes del sistema) en un flujo de agente controlado por la aplicacion anfitriona.
- Prototipado rapido de funcionalidades de IA en movil: el artefacto INT4 de 932 MB reduce el peso de descarga y permite iterar en dispositivos de gama media antes de decidir una integracion en produccion.
- Educacion y demostraciones: el modo thinking visible permite mostrar al usuario el razonamiento intermedio, util en herramientas didacticas o de depuracion de prompts.
- Investigacion sobre inferencia en el borde: los dos artefactos con recetas de cuantizacion distintas (INT8 e INT4) permiten comparar precision, latencia y consumo de memoria en el mismo dispositivo con el mismo runtime.
- Generacion de texto creativo o de borradores en aplicaciones de notas: poemas, resumenes o reescrituras ejecutadas localmente con latencias de decodificacion en el rango de 30-40 tok/s segun las mediciones del autor.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Solo incluye mediciones de rendimiento de inferencia en dispositivo:

| Artefacto | Dispositivo / runtime | Prefill | Decodificacion |
|---|---|---:|---:|
| `Qwen3_1.7B.litertlm` (INT8, GPU OpenCL) | Galaxy S26, LiteRT-LM 0.19.0 | 2.064 tok/s (1.024 tokens) | 29,7 tok/s |
| `Qwen3_1.7B.litertlm` anterior (sustituido) | Galaxy S26, LiteRT-LM 0.19.0 | 516 tok/s | 15,4 tok/s |
| `Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm` (INT4, GPU) | Galaxy S26, LiteRT-LM 0.19.0 | 1.187 tok/s | 38,8 tok/s |

Consumo de memoria en CPU (peak RSS de `litert_lm_advanced_main`, prompt de 1.355 tokens, 256 tokens de decodificacion, cache KV de 2.048 tokens):

| Dispositivo | Artefacto nuevo (INT8) | Artefacto anterior |
|---|---:|---:|
| Pixel 8a | 3.254–3.267 MiB | 2.776–3.080 MiB |
| Galaxy S26 | 3.408–3.460 MiB | 2.853–3.109 MiB |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto INT8 ocupa 1.674 MiB en disco y el INT4 932 MB; el pico de memoria en CPU medido oscila entre 2,8 y 3,5 GiB segun dispositivo y artefacto, por lo que se recomienda al menos 4 GiB de RAM libre en el dispositivo.
- GPU: ruta GPU probada en Galaxy S26 y Pixel 8a mediante OpenCL; el artefacto INT8 requiere LiteRT-LM 0.19.0 o superior en GPU (0.18.1 falla al compilar los kernels compuestos).
- CPU: ambos artefactos funcionan en CPU con LiteRT-LM 0.18.0 o superior; el INT8 con pesos externos requiere 0.19.0 en Android, ya que las builds 0.18.0 y 0.18.1 fallan con pesos externos.
- No aplica a GPU de escritorio tipo A100, H100 o RTX 4090: el formato `.litertlm` esta pensado para el runtime LiteRT-LM en dispositivos de borde, no para servidores con vLLM, TGI o llama.cpp.
- Despliegue: CLI `litert-lm run`, API Python `litert-lm`, o la app Edge Gallery (importacion desde Hugging Face o desde archivo local via ADB).
- Latencia y throughput: ver tabla de benchmarks; en Galaxy S26 con GPU, 29,7 tok/s (INT8) y 38,8 tok/s (INT4) de decodificacion, y 2.064 y 1.187 tok/s de prefill respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---:|---|---|---|
| litert-community/Qwen3-1.7B (esta ficha) | 1,7 B | 4.096 (cache KV hasta 32.768 en INT8) | `.litertlm` / LiteRT-LM | Apache 2.0 | Optimizado para GPU movil con operadores compuestos |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | safetensors / transformers y otros | Apache 2.0 | Modelo base sin cuantizar; requiere runtime de servidor o escritorio |
| Otras variantes on-device de la familia Qwen3 | no disponible | no disponible | `.litertlm` u otros | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de esta variante con alternativas de la misma categoria; la comparacion disponible se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- La model card declara unicamente ingles como idioma; el comportamiento en castellano no esta validado ni documentado, aunque el modelo base Qwen3 sea multilingue.
- Riesgo de alucinacion inherente a un modelo de 1,7 B de parametros; el modo thinking por defecto puede incrementar el consumo de tokens y la latencia si no se desactiva con `enable_thinking=false`.
- La cuantizacion INT4 en bloques de 32 puede degradar la calidad respecto al modelo original; no se publican evaluaciones que cuantifiquen esa perdida.
- El artefacto INT8 con pesos externos falla en las builds Android 0.18.0 y 0.18.1 de LiteRT-LM; es obligatorio usar 0.19.0 o superior en esa plataforma.
- La ruta GPU del artefacto INT8 no compila sus kernels compuestos en LiteRT-LM 0.18.1 (probado en Galaxy S26, Pixel 8a y Mac), por lo que la version del runtime es una dependencia critica en produccion.
- El consumo de memoria en CPU del artefacto INT8 es notablemente superior al del artefacto anterior (hasta ~600 MiB mas en Galaxy S26), lo que puede ser problematico en dispositivos con poca RAM.
- El contexto por defecto es de 4.096 tokens; aunque el export INT8 incluya una cache de 32.768 tokens, no se documenta como configurar longitudes mayores en el runtime.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base Qwen3-1.7B en su propio repositorio.
- Formato propietario del ecosistema LiteRT-LM: no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita su uso a moviles y dispositivos de borde compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- App Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Releases de Edge Gallery: https://github.com/google-ai-edge/gallery/releases
- Wiki de Edge Gallery: https://github.com/google-ai-edge/gallery/wiki
- Repositorio Edge Gallery: https://github.com/google-ai-edge/gallery
- Revision del artefacto INT8 anterior: `d6678881da6181864bbc893c80e10aa1ee0d3731` (descarga via `hf download litert-community/Qwen3-1.7B Qwen3_1.7B.litertlm --revision d6678881da6181864bbc893c80e10aa1ee0d3731`)
