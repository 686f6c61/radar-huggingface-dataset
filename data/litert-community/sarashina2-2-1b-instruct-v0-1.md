# litert-community/sarashina2.2-1b-instruct-v0.1

## Resumen

sarashina2.2-1b-instruct-v0.1 en formato LiteRT-LM es la conversión del modelo japonés de SB Intuitions al runtime de Google AI Edge para ejecución en dispositivo (edge). Se trata de un transformer denso de tipo Llama con 24 capas, dimensión oculta 1792, atención GQA con ratio 16:8 y un vocabulario de 102.400 tokens sin atar (untied), lo que da un total de aproximadamente 1.000 millones de parámetros. El modelo original está preentrenado e instruido específicamente para japonés, con soporte secundario de inglés, y no dispone de canal de razonamiento explícito (thinking mode).

La relevancia de esta ficha no reside en el modelo base, sino en el empaquetado: litert-community distribuye dos variantes cuantizadas en formato `.litertlm` (int8 dinámico de 1505 MB e int4 blockwise-32 con OCTAV de 904 MB) listas para ejecutarse en CPU y GPU de smartphones y equipos de sobremesa sin conexión de red. Esto convierte un modelo japonés de 1B en una opción práctica para aplicaciones móviles offline, con métricas de rendimiento publicadas por dispositivo (Galaxy S26, Pixel 8a, Mac Studio M4 Max).

La licencia MIT del modelo base se mantiene, lo que facilita el uso comercial, y el runtime objetivo es LiteRT-LM 0.16.x de Google AI Edge, con integración directa en Google AI Edge Gallery para Android y una demo web con WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (solo atención, sin SSM ni MoE); 24 capas, hidden 1792, GQA 16:8 |
| Parametros totales | ~1.000 millones (aprox. 367M en embeddings y capa de salida, vocabulario 102.400 untied) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (límite de KV cache declarado en el bundle LiteRT-LM); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | int8 dynamic (capas lineales y embeddings); int4 blockwise-32 + OCTAV en capas lineales con embeddings en int8 |
| Idiomas soportados | Japonés (principal) e inglés |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos originales del modelo base en safetensors, no incluidos en este repo |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Llama, con 24 capas, dimensión oculta de 1792 y atención con query grouping (GQA) en proporción 16:8. El vocabulario de 102.400 tokens está sin atar (untied), es decir, la matriz de embeddings de entrada y la capa de salida son independientes, lo que suma aproximadamente 367 millones de parámetros solo en esas dos matrices. No emplea mezcla de expertos, state space models ni atención lineal; la model card del bundle lo describe explícitamente como "atención solamente".

El entrenamiento original corresponde a SB Intuitions (preentrenamiento e instrucción en japonés), pero la información disponible no detalla el volumen de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La conversión a LiteRT-LM aplica cuantización dinámica int8 o int4 blockwise-32 con OCTAV sobre las capas lineales, mantiene el tokenizador HF embebido y declara el template de chat oficial (`<|user|>…</s><|assistant|>…</s>`, con `<|system|>…</s>`) junto con el token de parada `</s>` (id 2). El bundle incluye 11 firmas de prefill (de 1 a 1024 tokens) y un grafo de decode, con delegación completa a OpenCL en GPU Adreno (1066/1066 nodos en prefill_2–1024, 947/947 en prefill_1 y 975/975 en decode, sin retorno a XNNPack).

## Capacidades

- Generación de texto conversacional en japonés e inglés, con formato de chat multi-turno (system, user, assistant) integrado en el bundle.
- Razonamiento básico y cálculo aritmético simple, según las pruebas de la model card (cálculo, multiplicación, comparación de decimales).
- Conocimiento factual elemental (capitales, prefecturas, días de la semana, antónimos, traducción inglés-japonés).
- Respuestas instructivas concisas; el modelo está ajustado para seguir instrucciones y responder de forma breve.
- Tokenización robusta de emojis y caracteres de variante (por ejemplo, 😀, 𠮷, ☔) sin producir U+FFFD en decodificación token a token.
- No dispone de canal de razonamiento explícito (thinking mode), visión, audio ni tool calling documentado.
- No se documenta soporte de function calling ni de razonamiento multi-paso basado en agentes.

## Casos de uso

- Asistente conversacional japonés offline en Android: el bundle int4 (904 MB) se importa en Google AI Edge Gallery y responde en japonés sin conexión; en Galaxy S26 con GPU alcanza 27,4 tok/s de decode y 580 ms de TTFT, suficiente para conversación fluida.
- Traducción y asistencia bilingüe ja-en en el dispositivo: el modelo cubre ambos idiomas y puede integrarse en apps de viaje o productividad que necesiten traducción básica sin enviar datos a la nube.
- Chatbot de atención al cliente en japonés con contexto de hasta 4096 tokens: útil para conversaciones multi-turno moderadas en apps móviles, con la ventaja de que los datos del usuario no salen del terminal.
- Procesamiento de texto en kioscos o terminales de punto de venta con hardware modesto: la variante int8 en CPU de Pixel 8a ofrece 8,6–9,5 tok/s de decode con 2,4 GB de pico de RSS, viable para respuestas cortas.
- Generación de texto y resúmenes en aplicaciones de escritorio para macOS: en Mac Studio M4 Max con GPU se obtienen 159,4 tok/s de decode y 3578 tok/s de prefill, adecuado para procesamiento por lotes local.
- Demo y evaluación en navegador: la demo web de LiteRT-LM carga el archivo int4 (904 MB) y lo ejecuta con WebGPU, útil para pruebas de concepto y comparativas de calidad sin instalación.
- Filtrado o clasificación de texto japonés en pipelines locales: con respuestas cortas y baja latencia en GPU móvil, puede emplearse para tareas de etiquetado simple siempre que se validen los resultados.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para el bundle. Los datos disponibles son métricas de calidad interna y de rendimiento en dispositivo.

Calidad (JCommonsenseQA, JGLUE v1.3 valid, primeros 100 ítems, greedy, arnés propio no comparable con JGLUE oficial):

| Configuracion | Aciertos |
|---|---|
| PyTorch bf16 (referencia, MPS) | 75/100 |
| LiteRT int8 (CPU) | 76/100 |
| LiteRT int4 block-32 (CPU) | 77/100 |

Calidad reportada por el modelo base (según la model card del bundle): Elyza-tasks-100 2,88 y Japanese MT Bench 5,09.

Rendimiento en Galaxy S26 (Adreno, LiteRT-LM 0.16.0, prompt de 205 tokens):

| Archivo | Backend | Prefill | Decode | TTFT | Pico RSS |
|---|---|---|---|---|---|
| int8 | GPU (OpenCL) | 535–586 tok/s | 23,3–23,7 tok/s | 0,59–0,64 s | 1017 MB |
| int8 | CPU | 168–239 tok/s | 13,4–13,5 tok/s | 1,42–1,99 s | 2395 MB |
| int4 | GPU (OpenCL) | 403–592 tok/s | 27,4–27,5 tok/s | 0,58–0,83 s | 1127 MB |
| int4 | CPU | 83,7–83,9 tok/s | 13,5 tok/s | 3,90–3,91 s | 1973 MB |

Rendimiento en Apple M4 Max (LiteRT-LM 0.16.0, `-p 256 -d 256 --runs 3 --cache no`):

| Archivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| int8 | GPU | 3554 tok/s | 146,4 tok/s | 0,090 s |
| int8 | CPU | 822 tok/s | 35,1 tok/s | 0,844 s |
| int4 | GPU | 3578 tok/s | 159,4 tok/s | 0,088 s |
| int4 | CPU | 336 tok/s | 34,7 tok/s | 0,922 s |

Pixel 8a (Tensor G3, Mali-G715, 8 GB): int8 en CPU con prefill 95–98 tok/s, decode 8,6–9,5 tok/s, TTFT 3,4 s y pico de 2449 MB. La GPU no se midió porque el int8 de 1,5 GB residente en Mali excede el presupuesto de memoria del dispositivo.

## Requisitos de hardware

- VRAM/RAM estimada: int4 requiere aproximadamente 1,1 GB de pico en GPU móvil y 2,0 GB en CPU; int8 requiere aproximadamente 1,0 GB en GPU y 2,4 GB en CPU. El archivo int4 ocupa 904 MB y el int8 1505 MB.
- GPU recomendadas: Adreno de Galaxy S26 (OpenCL, delegación completa), Apple M4 Max (GPU), Mali-G715 de Pixel 8a solo con limitaciones de memoria para int8.
- Cabe en GPU de consumo y móviles: sí; el int4 es la opción preferente para GPU y dispositivos con poca capacidad. En Pixel 8a (8 GB) se recomienda int8 en CPU según el manifiesto del bundle.
- Opciones de despliegue: LiteRT-LM 0.16.x mediante CLI (`litert-lm run`) o API de Python; Google AI Edge Gallery en Android; demo web con WebGPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: en Galaxy S26 GPU, TTFT de 580 ms y decode de 27,4 tok/s (int4); en Mac Studio M4 Max GPU, TTFT de 88 ms y decode de 159,4 tok/s (int4). La velocidad está limitada por el vocabulario untied de 102.400 tokens: embeddings y capa de salida suman 367M parámetros que se leen en cada token.
- iOS: el archivo es inferior al límite de mmap de 2 GiB por sección, por lo que es compatible en principio; las métricas de iPhone 17 Pro quedan pendientes de publicación según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato edge | Notas |
|---|---|---|---|---|---|---|
| sarashina2.2-1b-instruct-v0.1 (LiteRT-LM) | ~1B | 4096 (KV cache) | ja, en | MIT | `.litertlm` int4/int8 | Decode 27,4 tok/s en Galaxy S26 GPU; JCQA 76–77/100 |
| LFM2.5-230M (LiteRT-LM) | 230M | no disponible | no disponible | no disponible | `.litertlm` | Decode 122 tok/s en Galaxy S26 GPU; vocabulario 65k tied, mucho más rápido por menor tamaño |
| Modelo base sbintuitions/sarashina2.2-1b-instruct-v0.1 | ~1B | no disponible | ja, en | MIT | safetensors (PyTorch) | Referencia bf16: JCQA 75/100; requiere runtime PyTorch, no orientado a móvil |

La comparación con modelos de la misma categoría (LLM japonés de ~1B para edge) es limitada porque la información disponible solo incluye LFM2.5-230M como referencia de rendimiento en el mismo runtime. No se dispone de datos de benchmarks comparables con otras alternativas de 1B en japonés.

## Limitaciones y advertencias

- Modelo de 1B parámetros: capacidad de razonamiento y conocimiento factual limitada; no debe usarse para tareas que exijan precisión alta sin verificación.
- Riesgo de alucinación en preguntas factuales, especialmente fuera de dominios comunes en japonés.
- El contexto efectivo está acotado a 4096 tokens por la KV cache del bundle; conversaciones largas requieren truncado o resumen.
- El soporte de inglés es secundario; la calidad en inglés puede ser inferior a la del japonés, y la model card señala que el modelo base bf16 falla en algunas pruebas en inglés (por ejemplo, rima con "merci").
- No dispone de tool calling, agentes, visión ni modo de razonamiento; no es adecuado para pipelines agénticos.
- El rendimiento depende fuertemente del backend: en CPU de Pixel 8a el decode cae a 8,6–9,5 tok/s y el TTFT sube a 3,4 s.
- En dispositivos con 8 GB y GPU Mali, el int8 excede el presupuesto de memoria; debe ejecutarse en CPU o usar int4.
- La licencia MIT del modelo base permite uso comercial, pero debe verificarse la licencia y condiciones del runtime LiteRT-LM y de los artefactos de conversión.
- Los resultados de JCommonsenseQA proceden de un arnés propio y no son comparables con puntuaciones oficiales de JGLUE.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/litert-community/sarashina2.2-1b-instruct-v0.1
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-1b-instruct-v0.1
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/sarashina2.2-1b-instruct-v0.1
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Registro de pruebas edge-compat (int4): https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-1b-instruct-v0.1-int4/CARD.md
- Registro de pruebas edge-compat (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-1b-instruct-v0.1-int8/CARD.md
