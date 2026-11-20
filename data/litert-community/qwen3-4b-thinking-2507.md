# litert-community/Qwen3-4B-Thinking-2507

## Resumen

Qwen3-4B-Thinking-2507 en formato LiteRT-LM es una conversión del modelo denso de razonamiento Qwen/Qwen3-4B-Thinking-2507 de Alibaba Qwen, empaquetada por la comunidad litert-community para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google (el motor que sucede a TensorFlow Lite en Android). El objetivo es ejecutar un modelo de razonamiento de 4B parámetros en teléfonos, mini-PC y navegadores sin depender de servidores, con pesos cuantizados a int4 en bloques de 128 y embeddings en INT8.

El modelo base opera exclusivamente en modo *thinking*: genera una cadena `<think>…</think>` antes de la respuesta final, lo que lo hace adecuado para tareas de razonamiento multi-paso, matemáticas y código, a costa de una latencia de decodificación mayor que un modelo instructivo estándar del mismo tamaño. La arquitectura es un transformer denso `Qwen3ForCausalLM` de 36 capas.

La relevancia actual reside en que demuestra que un modelo de razonamiento de 4B puede correr con aceleración GPU (OpenCL en Android, Metal en Apple Silicon, WebGPU en navegador) a velocidades interactivas: 18,1 tok/s de decodificación en un Galaxy S26 y 92,1 tok/s en un Mac Studio M4 Max. El artefacto principal `model.litertlm` ocupa 2,48 GB, lo que lo sitúa en la frontera de viabilidad de móviles de 8 GB (no verificado en ese segmento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen3ForCausalLM`), 36 capas |
| Parametros totales | 4B (heredados del modelo base; no se detalla desglose) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de KV cache en el artefacto LiteRT-LM (el modelo base Qwen3-4B-Thinking-2507 soporta contextos mayores; valor exacto no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | Int4 con bloques de 128 (pesos simetricos) + OCTAV optimal-clipping; embeddings INT8 en seccion externalizada; computo entero. Variante adicional `dynamic-wi4b32-afp32` (pesos int4 bloque 32, activaciones fp32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM con grafo TFLite, tokenizer, plantilla Jinja y metadatos del ejecutor) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 36 capas con 4B parametros, disenado por Qwen para razonamiento explicito: siempre emite un bloque `<think>…</think>` antes de la respuesta. La conversion a LiteRT-LM no altera la arquitectura: se preserva el grafo `Qwen3ForCausalLM` y se aplica cuantizacion de pesos a int4 con bloques de 128 y clipping optimo OCTAV, manteniendo embeddings en INT8 y computo entero. El bundle incluye tokenizer, plantilla de chat Jinja y metadatos del ejecutor.

El artefacto ha sufrido dos revisiones tecnicas relevantes. El 2026-10-06 se reescribio el grafo de prefill/decode para GPU: las dos escrituras `DYNAMIC_UPDATE_SLICE` de la KV cache por capa se fusionaron en un compuesto `odml.cache_update`, y los productos de atencion `BATCH_MATMUL` pasaron a `odml.runtime_bmm`, forma que exporta `litert-torch` con `--apply_gpu_composites`; se anadio una firma `prefill_16` que comparte buffers de pesos con `prefill_128`. El 2026-10-07 se corrigio la plantilla de chat para que acepte contenido como cadena (litert-lm 0.17.1) o como lista de partes tipadas (0.18.0); solo cambio la seccion de plantilla, con grafo, pesos, tokenizer y metadatos byte-identicos. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF/DPO).

## Capacidades

- Generacion de texto con razonamiento explicito: emite cadena de pensamiento `<think>…</think>` antes de cada respuesta, lo que permite trazar el razonamiento multi-paso.
- Razonamiento matematico y logico de varios pasos, adecuado para problemas tipo GSM8K y similares.
- Generacion de codigo y explicacion de codigo, heredada del modelo base Qwen3.
- Inferencia totalmente local en dispositivo: sin llamadas a red, sin telemetria obligatoria.
- Ejecucion en multiples backends: CPU, GPU (OpenCL en Android, Metal en Apple Silicon) y WebGPU en navegador.
- Soporte de plantilla de chat con contenido en formato cadena o lista de partes tipadas (compatible con litert-lm 0.17.1 y 0.18.0).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning orquestado: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o multimodalidad: no disponible (modelo solo texto).

## Casos de uso

- Asistente de razonamiento offline en movil: integrado via LiteRT-LM en una app Android, resuelve problemas matematicos o logicos sin conexion. En un Galaxy S26 con GPU alcanza 18,1 tok/s de decodificacion y 3,95 s de TTFT, suficiente para interaccion conversacional.
- Demo educativa en navegador: el chat web oficial carga `model.litertlm` (2,48 GB) y ejecuta con WebGPU, permitiendo probar el modelo sin instalacion ni backend. Util para talleres y evaluaciones rapidas.
- Prototipado en Apple Silicon: en un Mac Studio M4 Max con GPU logra 92,1 tok/s de decodificacion y 244 ms de TTFT, lo que lo hace viable como asistente de codigo local en el escritorio del desarrollador.
- Procesamiento en el borde con privacidad estricta: al no requerir red, encaja en escenarios sanitarios, legales o industriales donde los datos no pueden salir del dispositivo; el contexto de 4096 tokens limita el caso a documentos cortos o conversaciones acotadas.
- Automatizacion en mini-PC y dispositivos tipo Raspberry Pi 5: con la variante `dynamic-wi4b32-afp32` corre en CPU a 1,4 tok/s de decodificacion, util para tareas por lotes no interactivas (clasificacion con razonamiento, resumen de notas cortas) donde la latencia no es critica.
- Verificacion de pipelines de cuantizacion: sirve como referencia reproducible para equipos que convierten modelos Qwen3 a LiteRT-LM, ya que el bundle documenta hashes, tamanos y diferencias byte a byte entre revisiones.
- Filtrado y analisis de texto en el dispositivo: con 4096 tokens de contexto puede procesar correos, mensajes o fragmentos de codigo localmente, generando explicaciones razonadas sin enviar contenido a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos son mediciones de rendimiento en dispositivo:

| Dispositivo | Runtime / backend | Decode (tok/s) | Prefill (tok/s) | TTFT | Ops delegadas | Fecha |
|---|---|---|---|---|---|---|
| Galaxy S26 (12 GB) | LiteRT-LM prebuilt-adac974b, GPU | 18,1 | 263 | 3,95 s | 1707/1707 | 2026-10-05 |
| Mac Studio M4 Max | LiteRT-LM 0.17.1, GPU | 92,1 | 1100 | 244 ms | 1707/1707 | 2026-10-05 |
| Galaxy S26 | LiteRT-LM prebuilt-adac974b, CPU | 7,3 | 56 | 18,95 s | no disponible | 2026-10-05 |
| Galaxy S26 (variante dynamic-wi4b32-afp32) | LiteRT-LM 0.16.0, GPU | 11,2 | 129 | 1,65 s | 1282/1282 | 2026-08-24 |
| Raspberry Pi 5, 4 hilos (variante dynamic-wi4b32-afp32) | LiteRT-LM 0.16.1, CPU | 1,4 | 9 | 29,40 s | no disponible | 2026-09-01 |

## Requisitos de hardware

- VRAM/RAM: el artefacto principal `model.litertlm` ocupa 2,48 GB en disco; la variante `dynamic-wi4b32-afp32` mide 2.274.193.168 bytes (~2,27 GB). Se recomienda al menos 4 GB de memoria libre para margen de trabajo.
- Moviles de 8 GB: no verificado. En un Pixel 8a (8 GB, Mali) con LiteRT-LM 0.19.0, el fichero GPU-composite de Qwen3-4B de la misma clase de tamano construyo el motor GPU y la memoria libre cayo por debajo de 400 MB al iniciar la primera sesion, por lo que el harness lo detuvo (2026-11-02). Los datos GPU citados provienen de un Galaxy S26 de 12 GB.
- GPU recomendadas: GPU integrada de Snapdragon en Galaxy S26 (OpenCL), GPU de Apple Silicon (Metal, verificado en M4 Max), WebGPU en navegador de escritorio.
- Consumer GPU de escritorio (RTX 4090, etc.): no disponible en la informacion proporcionada; el formato `.litertlm` esta orientado a LiteRT-LM, no a CUDA.
- CPU: funciona en CPU de movil (7,3 tok/s en Galaxy S26) y en Raspberry Pi 5 a 4 hilos (1,4 tok/s).
- Opciones de despliegue: runtime LiteRT-LM (binario `litert_lm_main`, versiones 0.16.0 a 0.19.0 documentadas), integracion Android via `com.google.ai.edge.litert:litert`, demo web con WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; el TTFT varia de 244 ms (M4 Max GPU) a 29,40 s (Raspberry Pi 5 CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (artefacto) | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507 (este, LiteRT-LM) | 4B denso | 4096 (KV cache) | `.litertlm` / LiteRT-LM | Apache 2.0 | Hugging Face, demo web |
| Qwen/Qwen3-4B-Thinking-2507 (original) | 4B denso | no disponible en la informacion proporcionada | safetensors / transformers | Apache 2.0 | Hugging Face |
| litert-community/Qwen3-4B (GPU-composite) | 4B denso | no disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Hugging Face |
| Variante `dynamic-wi4b32-afp32` del mismo modelo | 4B denso | no disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento frente a alternativas; la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modo thinking obligatorio: el modelo siempre genera la cadena `<think>…</think>`, lo que incrementa tokens de salida y latencia frente a un instructivo del mismo tamano; en dispositivos lentos (Raspberry Pi 5 a 1,4 tok/s) esto puede hacer inviable la interaccion.
- Contexto limitado a 4096 tokens en el artefacto LiteRT-LM, muy por debajo de lo que suele ofrecer el modelo base; insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion inherente a modelos de 4B, agravado por la cuantizacion int4; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Idiomas soportados no documentados; no se garantiza calidad fuera de los idiomas principales del modelo base.
- Viabilidad en moviles de 8 GB no verificada y con indicios negativos: el fichero GPU-composite equivalente agoto la memoria en un Pixel 8a con LiteRT-LM 0.19.0. No asumir funcionamiento en ese segmento sin pruebas propias.
- Inestabilidad de revisiones: el artefacto cambio al menos tres veces en octubre de 2026 (plantilla, grafo GPU, pesos externalizados). Fijar revision concreta del Hub y verificar sha256 antes de desplegar.
- Problema conocido de pesos externalizados: la revision del 2026-10-30 queda en `9df72e0` por una incidencia de pesos externos en el runtime; consultar la seccion "Known runtime issues" del repositorio antes de usar.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3-4B-Thinking-2507 deben verificarse por separado en su propia model card.
- Formato propietario de runtime: `.litertlm` solo se ejecuta con LiteRT-LM; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad a infraestructura de servidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3-4B-Thinking-2507
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Qwen3-4B-Thinking-2507
- Ficha de rendimiento edge-compat (variante principal): https://github.com/john-rocky/edge-compat/blob/main/cards/qwen3-4b-thinking/CARD.md
- Ficha de rendimiento edge-compat (variante dynamic-wi4b32-afp32): https://github.com/john-rocky/edge-compat/blob/main/cards/qwen3-4b-thinking-dynamic-wi4b32-afp32/CARD.md
- Benchmark de conversión litert-torch en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
