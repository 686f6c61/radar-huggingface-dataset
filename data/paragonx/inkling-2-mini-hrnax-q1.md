# paragonX/Inkling-2-Mini-HRNAX-Q1

## Resumen

Inkling-2-Mini-HRNAX-Q1 es una cuantización experimental de post-entrenamiento (PTQ) del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `paragonX` bajo licencia Apache-2.0. El modelo base es un transformer MoE con bucle ("looped transformer") de 26,4B parámetros lógicos, con 24 capas físicas que se visitan 48 veces por token mediante un núcleo repetido tres veces (L6–L17), 128 expertos enrutados con top-k=8 y una torre de visión. Esta versión cuantizada reduce el peso en disco a 16,83 GiB (5,48 bits por peso efectivos) manteniendo las activaciones en FP16.

El formato propietario `hrnax-v1` combina rotación de Hadamard con cuantización por fila simétrica INT4/INT8 en una disposición mixta por capas: las proyecciones densas y los 6 expertos MoE más sensibles se guardan a 8 bits, el resto de expertos a 4 bits, y embeddings, torre de visión y normas en BF16/F32. El objetivo declarado es la inferencia nativa en Apple Silicon mediante el motor Hivengine del mismo autor, con soporte opcional de decodificación especulativa DFlash2.

Es relevante ahora porque demuestra que un MoE multimodal de 26B puede ejecutarse en un Mac Studio con memoria unificada de 128 GiB a velocidades interactivas (62 tok/s en decodificación plana y hasta 152 tok/s con drafter), un escenario históricamente reservado a GPUs de datacenter. No obstante, es un artefacto "under development", con 0 descargas y 0 likes en el momento de la consulta, y su validez práctica está atada a un único motor de inferencia propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (24 capas físicas, 48 visitas, núcleo repetido 3× L6–L17) + torre de visión |
| Parametros totales | 26,389B lógicos (17.234.060.352 en safetensors del repo cuantizado) |
| Parametros activos | No disponible (top-k = 8 de 128 expertos enrutados; el número exacto de parámetros activos por token no se especifica) |
| Longitud de contexto | No disponible en la información proporcionada (las pruebas se hicieron con 8.192 tokens de contexto) |
| Tipos de cuantizacion | `hrnax-v1`: INT8 (T8) + INT4 (T4) con rotación Hadamard `h128_p_h128`, escala simétrica por fila, activaciones FP16; BF16/F32 para embeddings, visión, normas y sesgos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (4 shards, 18.073.120.896 bytes), formato propietario `hrnax-v1` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención densa y un diseño de "looped transformer": 24 capas físicas que se recorren 48 veces por token, con un núcleo de 12 capas (L6–L17) reutilizado tres veces. Dispone de 128 expertos enrutados con top-k=8 y una torre de visión que lo convierte en un modelo image-text-to-text. La cuantización HR-NAX se aplica como PTQ puro, sin ajuste fino de pesos ni QAD, mediante un proceso en tres etapas: un barrido de sensibilidad por capa que mide la divergencia KL de vocabulario completo al promover expertos de T4 a T8 (identificando las capas [2, 8, 10, 11, 14, 17] como las de mayor retorno por byte), una PTQ secuencial Hessian-aware con `--loop-refit` que recolecta activaciones a través de las 48 visitas del bucle, y 12 iteraciones de alineación de signos Hadamard más 2 iteraciones de descenso por coordenadas por matriz. El conjunto de calibración son 512 secuencias equilibradas en 6 dominios (código, matemáticas, prosa, uso de herramientas, multilingüe y contexto largo), disjuntas por SHA-256 de los conjuntos de evaluación.

La innovación principal no está en el entrenamiento (no se aportan datos sobre tokens, composición del dataset ni RLHF/DPO del modelo base) sino en la estrategia de cuantización mixta y en la integración con el motor Hivengine, que soporta decodificación especulativa DFlash2 con un drafter de 0,923 GiB en BF16. Según el autor, la decodificación con drafter produce salidas idénticas byte a byte a la decodificación sin él a temperatura 0 y semilla fija.

## Capacidades

- Generación de texto conversacional multimodal (image-text-to-text): acepta imágenes y texto como entrada.
- Razonamiento y matemáticas: el autor reporta decodificación especulativa validada en prompts de código, matemáticas y prosa.
- Generación de código: incluido como dominio de calibración y evaluado en las pruebas de throughput con `T = 0,0`.
- Uso de herramientas (tool use): presente como dominio en el conjunto de calibración, lo que sugiere soporte en el modelo base, aunque no se detalla el mecanismo.
- Contexto largo: las pruebas se ejecutan con 8.192 tokens de contexto y un prompt de sistema de 4.465 tokens con restauración de prefijo en disco.
- Modo de pensamiento: la evaluación menciona el token especial `<|content_thinking|>`, lo que indica un modo de razonamiento explícito en el modelo base.
- Capacidades multilingües: el multilingüe figura como dominio de calibración, pero no se especifican los idiomas concretos.
- Decodificación especulativa: compatible con el drafter `incoai/Inkling-2-Mini-DFlash2`.

## Casos de uso

- Inferencia local en Apple Silicon: el caso de uso principal y prácticamente el único soportado de forma nativa. Un Mac Studio con M5 Max y 128 GiB puede servir el modelo con 20,45 GiB de memoria residente (1 slot, 8K de contexto, con DFlash2), lo que permite prototipar asistentes multimodales sin GPU dedicada.
- Asistencia de código en estación de trabajo: con decodificación especulativa a `T = 0,0` alcanza 152,4 tok/s en código con una tasa de aceptación del 55,3%, suficiente para autocompletado interactivo y revisión de parches en local.
- Procesamiento de documentos con imágenes: la torre de visión y la pipeline image-text-to-text permiten extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas; las pruebas de visión reportan un 96,94% de acuerdo top-1 con la referencia.
- Servicio HTTP ligero multi-stream: el motor sirve peticiones por HTTP con 2.507,9 tok/s de prefill y 112,8 tok/s agregados con 2 streams concurrentes, adecuado para un equipo pequeño o uso interno.
- Restauración rápida de prompts de sistema largos: la restauración de prefijo desde disco reduce el TTFT de 1,907 s a 0,213 s (8,94×) en un prompt de 4.465 tokens, útil en asistentes con instrucciones de sistema extensas que se reinician con frecuencia.
- Evaluación de técnicas de cuantización: el paquete incluye métricas reproducibles de KL, acuerdo top-1 y RMS relativo, lo que lo convierte en un banco de pruebas para investigadores que estudien PTQ mixta en MoE con bucles.
- Investigación sobre decodificación especulativa: la comparación byte a byte entre drafter activado y desactivado facilita experimentos de aceptación y latencia en hardware de consumo.

## Benchmarks y rendimiento

Evaluación de vocabulario completo contra el modelo BF16/NVFP4/MXFP8 de referencia (`sealed_256`: 256 × 512 = 101.452 tokens):

| Metrica | Q1 top_6 (16,832 GiB) |
|---|---:|
| Divergencia KL media | 0,04280 nats |
| Divergencia KL p95 | 0,1160 nats |
| Acuerdo top-1 de token | 93,48% |
| RMS relativo de logits | 0,0877 |
| Contribución KL de `<\|content_thinking\|>` | 0,000999 nats |
| RMS relativo mediano de expertos (capas T8) | 0,0089 (0,89%) |
| RMS relativo mediano de expertos (capas T4) | 0,1211 |

Acuerdo del motor Metal (Hivengine) frente a capturas de referencia en Apple M5 Max:

| Suite | Top-1 | Top-5 | KLD media | No finitos |
|---|---:|---:|---:|---:|
| Texto (7 prompts, 861 posiciones) | 97,44% | 99,88% | 0,0091 | 0 |
| Visión (3 imágenes, 360 posiciones) | 96,94% | 100,00% | 0,0067 | 0 |
| Canarios (texto e imagen "437") | PASS | — | — | 0 |

Rendimiento medido en Apple M5 Max Mac Studio (128 GiB, KV cache BF16, contexto 8.192, HTTP loopback):

| Carga | Rendimiento | Notas |
|---|---:|---|
| Decodificación plana | 62,45 tok/s (16,01 ms/tok) | 62,3–62,6 tok/s en 6 prompts |
| DFlash2, `T = 0,0` código | 152,4 tok/s (2,45×) | 55,3% aceptación, 5,25 tok/ronda |
| DFlash2, `T = 0,0` mates / prosa | 112,7 / 104,2 tok/s | 1,80× / 1,67× |
| DFlash2, `T = 1,0` código / mates / prosa | 119,9 / 118,0 / 80,8 tok/s | Idéntico byte a byte con drafter on/off |
| Prefill (`chat-long`, 9.131 tokens) | 2.573 tok/s | Chunks de 2.048 filas |
| Prefill HTTP (3.301 tokens) | 2.507,9 tok/s (1,316 s TTFT) | Mediana de 3 ejecuciones |
| 2 streams concurrentes (2 × 256 tok, `T = 1,0`) | 112,8 tok/s agregados | 0 errores |
| Restauración de prefijo en disco (4.465 tok) | 1,907 s → 0,213 s (8,94×) | Prefijo de 4.437 tok restaurado byte a byte |
| Memoria residente (1 slot × 8K + DFlash2) | 20,45 GiB listos (23,54 GiB facturados) | Pico de 21,60 GiB con 16K |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory: 16,83 GiB de pesos; 20,45 GiB residentes con 1 slot de 8K de contexto y DFlash2 (23,54 GiB facturados, pico de 21,60 GiB con 16K).
- Hardware validado: Apple M5 Max Mac Studio con 128 GiB de memoria unificada, KV cache en BF16.
- GPU dedicadas: no se documenta soporte para CUDA, ROCm ni GPUs NVIDIA/AMD; el formato `hrnax-v1` es específico del motor Hivengine para Metal.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 ni similares; el modelo está diseñado para Apple Silicon.
- Opciones de despliegue: exclusivamente Hivengine (repositorio `paragontasx/hivengine`); no hay conversión a GGUF, vLLM, TGI, llama.cpp ni Ollama documentada.
- Latencia y throughput: 62,45 tok/s en decodificación plana, hasta 152,4 tok/s con DFlash2 en código, 2.573 tok/s de prefill y 1,316 s de TTFT en un prompt de 3.301 tokens.
- Almacenamiento: 18,1 GB de repo más 0,923 GiB adicionales si se usa el drafter DFlash2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-HRNAX-Q1 | 26,389B lógicos (17,23B en safetensors) | No disponible (probado a 8K) | Apache-2.0 | `hrnax-v1` / Hivengine en Apple Silicon | Cuantización PTQ mixta INT4/INT8, multimodal, con drafter DFlash2 |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B MoE | No disponible | Apache-2.0 | BF16/NVFP4/MXFP8 | Referencia de precisión completa; sin cuantizar |
| incoai/Inkling-2-Mini-DFlash2 | 0,923 GiB (drafter) | No aplica | No disponible | BF16 | Modelo auxiliar de decodificación especulativa, no un competidor directo |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Estado "under development": el propio autor califica la cuantización como experimental y en desarrollo; no hay garantías de estabilidad ni de soporte.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Dependencia de un motor propietario: solo funciona con Hivengine; no hay pesos en GGUF ni compatibilidad con ecosistemas estándar como vLLM, llama.cpp u Ollama.
- Restricción de hardware: validado únicamente en Apple M5 Max con 128 GiB; no se documenta funcionamiento en GPUs NVIDIA, AMD ni en Macs con menos memoria unificada.
- Pérdida de precisión medible: 93,48% de acuerdo top-1 y KL media de 0,04280 nats frente al modelo completo; las capas T4 presentan un RMS relativo mediano del 12,11%, muy superior al 0,89% de las T8, lo que puede afectar a tareas sensibles.
- Idiomas no especificados: se desconoce la cobertura lingüística real y el comportamiento fuera de los dominios de calibración.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable en un modelo conversacional multimodal, pero no hay datos concretos.
- Sesgos: no documentados.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar las condiciones del modelo base y del motor Hivengine, que se distribuye en un repositorio aparte.
- Longitud de contexto: no se declara oficialmente; las pruebas usan 8.192 tokens, por lo que no debe asumirse una ventana mayor en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paragonX/Inkling-2-Mini-HRNAX-Q1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DFlash2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor Hivengine: https://github.com/paragontasx/hivengine
- Guía de despliegue de Hivengine: https://github.com/paragontasx/hivengine#deployment
