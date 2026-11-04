# litert-community/OLMo-2-1B-Instruct

## Resumen

OLMo-2-1B-Instruct en formato LiteRT-LM es la conversión del modelo allenai/OLMo-2-0425-1B-Instruct de AllenAI al runtime on-device de Google, LiteRT (el nuevo nombre de TensorFlow Lite). El paquete resultante, un fichero `.litertlm` de 0,93 GB, empaqueta pesos cuantizados a int4 por bloques, tokenizer y plantilla de prompt Tülu en un único artefacto listo para ejecutarse en móviles, portátiles y navegador sin infraestructura de servidor.

El modelo base es un transformer decoder-only de 1B parámetros, licencia Apache-2.0 y filosofía fully-open (pesos, datos y código de entrenamiento abiertos). La conversión la mantiene la comunidad `litert-community` usando la herramienta oficial `litert-torch`, sin parches propios, lo que garantiza fidelidad numérica respecto al original.

Su relevancia actual reside en que demuestra que un modelo instructivo de 1B puede desplegarse en un smartphone de 8 GB con aceleración GPU (Metal en iOS, LiteRT GPU en Android) y con una API local compatible con OpenAI, manteniendo una precisión GSM8K del 63 % tras cuantización int4. Es una pieza práctica para prototipar asistentes offline, agentes locales y aplicaciones de privacidad estricta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2) |
| Parametros totales | 1B (aproximado, segun modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (KV cache del bundle) |
| Tipos de cuantizacion | int4 blockwise (bloque 32) + OCTAV optimal-clipping, simetrico; embeddings int8; compute integer |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-2-0425-1B-Instruct es un transformer decoder-only denso de la familia OLMo 2 de AllenAI, entrenada con datos, código y recetas completamente abiertos. La variante instruct se obtiene mediante ajuste supervisado y preferencias sobre el modelo base, con la plantilla de prompt Tülu (`<|user|>` / `<|assistant|>`, token de parada `<|endoftext|>`). No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición del dataset.

La conversión a LiteRT-LM aplica cuantización int4 por bloques de 32 elementos con clipping óptimo OCTAV y embeddings en int8, manteniendo cómputo entero. El bundle incluye tokenizer y plantilla, y se ejecuta mediante el runtime LiteRT-LM con backends CPU, GPU (Metal en Apple, LiteRT GPU en Android) y WebGPU en navegador. La conversión se realizó con `litert-torch` oficial sin forks, y el autor reporta una coincidencia numérica de 4e-7 frente al modelo PyTorch original en una prueba sobre Galaxy S26.

## Capacidades

- Generación de texto conversacional multi-turno en formato instruct (plantilla Tülu).
- Razonamiento aritmético básico y chain-of-thought de 0-shot (evaluado en GSM8K).
- Ejecución local en dispositivos de borde: móviles Android (Galaxy S26, Pixel 8a), iPhone 17 Pro, macOS, Linux y Windows.
- Inferencia en navegador mediante WebGPU con el demo oficial de LiteRT-LM.
- Servidor local con API compatible con OpenAI (`litert-lm serve`).
- Integración en apps Android mediante la API Kotlin (`com.google.ai.edge.litertlm:litertlm-android`) y en apps iOS mediante el runtime LiteRT-LM.
- No se documenta soporte de tool calling, function calling, agentes multi-step, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistentes offline en aplicaciones móviles: el bundle de 0,93 GB cabe en un teléfono de 8 GB y permite conversaciones privadas sin conexión, usando la Gallery de Google AI Edge o la API Kotlin para integrarlo en una app propia.
- Prototipado rápido de chatbots locales en portátil: con `litert-lm serve` se expone una API compatible con OpenAI que cualquier cliente existente puede consumir, útil para validar flujos antes de migrar a un modelo mayor.
- Demos interactivas en navegador: el demo WebGPU carga el modelo desde Hugging Face y permite enseñar inferencia on-device sin instalación, adecuado para talleres y formaciones.
- Aplicaciones con requisitos estrictos de privacidad: al ejecutarse íntegramente en el dispositivo, los datos del usuario no salen del terminal, lo que encaja en sectores regulados (salud, legal, finanzas) para tareas de resumen o clasificación de texto.
- Procesamiento de texto en campo sin conectividad: escenarios de inspección, logística o campo remoto donde se necesita resumir notas o responder consultas con un modelo instructivo pequeño.
- Evaluación comparativa de runtimes on-device: sirve como referencia para medir latencia y throughput entre backends CPU/GPU y entre dispositivos (M4 Max, iPhone 17 Pro, Galaxy S26) con el comando `litert-lm benchmark`.
- Filtrado y preprocesado local en pipelines de datos: clasificación o reescritura de textos en el propio dispositivo antes de enviar solo lo necesario a un servicio remoto.

## Benchmarks y rendimiento

Precisión en GSM8K (n=100, greedy, 0-shot chain-of-thought, mismo prompt y extracción para todas las filas):

| Configuracion | GSM8K | Tamano |
|---|---|---|
| bf16 (referencia PyTorch CPU) | 72,0 % | no disponible |
| int4 blockwise-32 + OCTAV (este modelo) | 63,0 % | 0,93 GB |
| int8 (`dynamic_wi8_afp32`) | 65,0 % | 1,50 GB |

Rendimiento de inferencia con `litert-lm benchmark` 0.15.0 en Apple M4 Max (`-p 256 -d 256 --runs 3`, max-num-tokens 4096):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 347 tok/s | 33,3 tok/s | 0,87 s |
| Apple M4 Max (macOS) | GPU (Metal) | 3223 tok/s | 150,1 tok/s | 0,10 s |

Ejecución en dispositivo (iPhone 17 Pro, iOS 27.0, backend GPU/Metal, ejecución en frío, prompt corto, máx. 512 tokens):

| Dispositivo | Backend | Prefill | Decode | TTFT | Carga | Pico de memoria |
|---|---|---|---|---|---|---|
| iPhone 17 Pro | GPU (Metal) | 27,6 tok/s | 24,4 tok/s | 0,95 s | 5,2 s | 1330 MB |

En Samsung Galaxy S26 (SM-S942Q / SM8850, Android 16) el bundle se ejecuta en el backend GPU de LiteRT con delegación completa: 1375 de 1375 operaciones en 2 subgrafos sobre `LiteRT GPU`, con pico de 931 MB. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 0,93 GB de pesos en int4; pico medido de 1330 MB en iPhone 17 Pro y 931 MB en Galaxy S26.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre; también en CPU.
- GPU recomendadas: Apple Silicon (M-series con Metal), GPU integradas en Snapdragon de gama alta (Galaxy S26), GPU de iPhone recientes (A-series con Metal); para escritorio cualquier GPU moderna sirve por el reducido tamaño.
- Despliegue: runtime LiteRT-LM (`pip install litert-lm`), servidor local compatible con OpenAI (`litert-lm serve`), Google AI Edge Gallery en Android, API Kotlin en apps Android y WebGPU en navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: en M4 Max GPU, 3223 tok/s de prefill, 150,1 tok/s de decode y TTFT de 0,10 s; en M4 Max CPU, 347 tok/s de prefill, 33,3 tok/s de decode (±7 %) y TTFT de 0,87 s; en iPhone 17 Pro GPU, 24,4 tok/s de decode y TTFT de 0,95 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| OLMo-2-1B-Instruct (LiteRT-LM) | 1B | 4096 (KV cache) | `.litertlm` int4 | Apache-2.0 | On-device, fully-open |
| OLMo-2-0425-1B-Instruct (AllenAI) | 1B | no disponible | safetensors | Apache-2.0 | Modelo base de referencia |
| Modelos instructivos de ~1B en formato GGUF | ~1B | variable | GGUF | variable | On-device en llama.cpp |

La comparación cuantitativa con alternativas del mismo tamaño no está disponible en la información proporcionada; los datos de GSM8K solo permiten comparar las variantes de cuantización del propio modelo.

## Limitaciones y advertencias

- Precisión limitada por tamaño: 1B parámetros restringe razonamiento complejo, matemáticas avanzadas y conocimiento factual; la cuantización int4 pierde unos 9 puntos en GSM8K frente a bf16 (63 % vs 72 %).
- Contexto corto: la KV cache del bundle está fijada en 4096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas no documentados: la model card no especifica cobertura lingüística; el rendimiento fuera del inglés no está garantizado.
- Riesgo de alucinación inherente a modelos pequeños; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no se documenta análisis de sesgos en la información disponible; al ser un modelo fully-open de AllenAI, hereda las características del dataset de entrenamiento original.
- Funcionalidades ausentes: no se documenta tool calling, agentes, visión ni audio; no asumir su disponibilidad.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del runtime LiteRT-LM.
- El formato `.litertlm` requiere el runtime LiteRT-LM; no es directamente compatible con ecosistemas como llama.cpp, vLLM u Ollama.
- Las cifras de rendimiento publicadas dependen del dispositivo y del backend; el prefill en iPhone se midió con prompt corto y no es comparable al prefill de escritorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/OLMo-2-1B-Instruct
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/OLMo-2-1B-Instruct
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Medición de fidelidad de `litert-torch`: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
