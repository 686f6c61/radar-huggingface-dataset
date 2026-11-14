# loom-fun-staging/unsloth-gemma-4-E2B-it-loom

## Resumen

`loom-fun-staging/unsloth-gemma-4-E2B-it-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado de nuevo. Empaqueta el checkpoint GGUF sin modificar `unsloth/gemma-4-E2B-it-GGUF` (concretamente la cuantizacion `gemma-4-E2B-it-Q4_K_M.gguf`) junto con programas `.loom` y una tarjeta `model.json`, generados mediante el flujo de trabajo `loom-skills`. El objetivo es ejecutar Gemma 4 E2B instruct sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Gemma 4 de la variante E2B en modo instruct, con capacidades multimodales de entrada de imagen (pipeline `image-text-to-text`) y soporte de razonamiento con modo thinking desactivable. El paquete anade decodificacion especulativa con un drafter auxiliar (`AtomicChat/gemma-4-E2B-it-assistant-GGUF`, profundidad 2, activada por defecto), servidor compatible con la API OpenAI en `127.0.0.1:8080`, tool calling estilo OpenAI y una ventana de contexto de 131.072 tokens por peticion.

Su relevancia es acotada y experimental: el repositorio esta alojado en una organizacion de staging (`loom-fun-staging`), con 0 descargas y 0 likes, sin licencia declarada ni idiomas especificados, y con las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) sin re-ejecutar sobre esta build concreta. Los resultados de rendimiento publicados solo cubren Strix Halo y contienen columnas de llama.cpp y Loom sin medir (marcadas con guion), por lo que la comparativa real no es verificable con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E2B; el paquete es un runtime Loom sobre GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `gemma-4-E2B-it-Q4_K_M.gguf`); proyector multimodal `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como programas `.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: es una distribucion de inferencia para el checkpoint Gemma 4 E2B instruct en GGUF Q4_K_M, producida por Unsloth y reutilizada sin modificaciones. La capa especifica de Loom consiste en kernels generados para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), un servidor HTTP con endpoints OpenAI y un mecanismo de decodificacion especulativa con drafter auxiliar de profundidad 2 activado por defecto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. Tampoco se detalla la arquitectura interna del modelo Gemma 4 E2B (transformer denso, MoE u otra variante) en la informacion proporcionada. La innovacion tecnica destacable del paquete es la integracion de decodificacion especulativa con el drafter `AtomicChat/gemma-4-E2B-it-assistant-GGUF`, con tasas de aceptacion medidas de 36 % en decodificacion corta, 45 % a ~2k de contexto y 47 % a ~32k.

## Capacidades

- Generacion de texto conversacional con plantilla de chat instruct y endpoint `/v1/chat/completions` compatible con OpenAI.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, con proyector `mmproj-F16.gguf` (pipeline `image-text-to-text`).
- Tool calling estilo OpenAI: acepta `tools` y emite `tool_calls`.
- Modo de razonamiento (thinking) desactivable: apagado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa con drafter auxiliar, profundidad 2, activada por defecto.
- Parametros de muestreo: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tenga.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el servidor Loom expone `/v1/chat/completions` en `127.0.0.1:8080`, lo que permite conectar clientes compatibles con OpenAI sin adaptadores adicionales sobre hardware Strix Halo o R9700.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por peticion se pueden ingerir contratos, informes o bases de codigo extensas en una sola llamada, manteniendo coherencia dentro de la ventana.
- Analisis de imagenes en flujos internos: la entrada `image_url` con proyector F16 permite describir capturas, extraer texto de imagenes o responder preguntas sobre diagramas en pipelines de documentacion tecnica.
- Automatizacion con herramientas: el soporte de `tools`/`tool_calls` habilita agentes que consultan APIs internas, bases de datos o sistemas de ticketing desde un cliente compatible con OpenAI.
- Razonamiento por etapas bajo demanda: activando `enable_thinking` solo en peticiones que lo requieran (analisis, depuracion, planificacion) se evita el coste del modo thinking en el trafico trivial.
- Despliegue en hardware AMD de escritorio o estacion de trabajo: al estar empaquetado para gfx1151 y gfx1201, encaja en entornos con Ryzen AI Max+ 395 o Radeon AI PRO R9700 donde no se quiere depender de CUDA.
- Prototipado de decodificacion especulativa: el paquete incluye el drafter y las metricas de aceptacion, lo que sirve para evaluar el impacto de la decodificacion especulativa en latencia sobre GPU AMD.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a Strix Halo (gfx1151) y presentan las columnas de llama.cpp y Loom sin medir; solo se rellena la columna "roofline" (techo teorico del hardware a 216 GB/s y 59 TFLOP/s). No hay cifras comparativas reales.

| Metrica | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 252,9 |
| Decode tok/s, contexto 2k | no medido | no medido | 269,8 |
| Decode tok/s, contexto 32k | no medido | no medido | 214,3 |
| Prefill tok/s, documento 1k | no medido | no medido | 14.886,1 |
| Prefill tok/s, documento 2k | no medido | no medido | 14.663,8 |
| Prefill tok/s, documento 8k | no medido | no medido | 13.508,6 |
| Prefill tok/s, documento 16k | no medido | no medido | 12.224,6 |
| Prefill tok/s, documento 32k | no medido | no medido | 10.271,9 |
| 4 streams, decode agregado tok/s | no medido | no medido | 550,6 |
| Tokens draft aceptados (especulativa) | n/a | 36 % (corto), 45 % (2k), 47 % (32k) | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) el autor indica explicitamente que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria reservada: el comando de servicio usa `--memory_bytes=16000000000` (16 GB) tanto en Strix Halo como en R9700, lo que fija el presupuesto de memoria del runtime.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer AMD o NVIDIA; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch`, `loom-serve`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp solo aparece como referencia de comparacion).
- Concurrencia: 4 peticiones simultaneas segun la tabla de caracteristicas.
- Latencia y throughput reales: no disponibles (columnas de Loom y llama.cpp sin medir en la tabla publicada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `loom-fun-staging/unsloth-gemma-4-E2B-it-loom` | no disponible | 131.072 | no disponible | repo de staging, 0 descargas | Paquete Loom para GPU AMD; gates de correccion sin re-ejecutar |
| `unsloth/gemma-4-E2B-it-GGUF` | no disponible | no disponible | no disponible | publico en Hugging Face | Checkpoint GGUF base sin modificaciones que empaqueta este repo |
| `AtomicChat/gemma-4-E2B-it-assistant-GGUF` | no disponible | no disponible | no disponible | publico en Hugging Face | Drafter auxiliar usado por la decodificacion especulativa |

No se dispone de datos de rendimiento ni de especificaciones de parametros para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Repositorio de staging: 0 descargas, 0 likes y creado y actualizado el mismo dia (2026-11-14), lo que indica un artefacto no consolidado.
- Licencia no declarada: no se puede verificar si el uso comercial esta permitido; hay que remitirse a la licencia del modelo base Gemma 4.
- Puertas de correccion sin re-ejecutar sobre esta build: `kernel_tests`, `golden`, `compare`, `vision` y `consistency` solo constan como superadas en una build anterior (sha256 `9cf73ca`), por lo que la equivalencia con llama.cpp no esta verificada para este paquete.
- Rendimiento no medido: la tabla comparativa contra llama.cpp no contiene valores de ninguno de los dos motores; solo techos roofline.
- R9700 sin medicion: el autor declara que los resultados para gfx1201 no se han vuelto a medir.
- Cobertura de hardware limitada a dos plataformas AMD concretas (gfx1151 y gfx1201); no hay soporte documentado para otras GPU.
- Audio no soportado por Loom aunque el modelo upstream lo tenga.
- Limite de 4.096 tokens de salida por peticion, lo que puede truncar respuestas largas o generaciones de codigo extensas.
- Idiomas soportados no declarados: no se puede garantizar calidad multiligue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Gemma 4 E2B, no descritos aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-gemma-4-E2B-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/gemma-4-E2B-it-assistant-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
