# litert-community/sarashina2.2-1b-instruct-v0.1

## Resumen

sarashina2.2-1b-instruct-v0.1 en formato LiteRT-LM es la conversión al runtime on-device de Google (LiteRT-LM) del modelo japonés sarashina2.2-1b-instruct-v0.1 desarrollado por SB Intuitions. Se trata de un transformer denso de tipo Llama con 24 capas, dimensión oculta 1792, atención GQA con ratio 16:8 y un vocabulario de 102.400 tokens sin pesos atados (untied). El modelo original está preentrenado e instruido específicamente para japonés, con soporte secundario de inglés, y no incorpora canal de razonamiento explícito: es un modelo de chat generalista.

La relevancia de esta ficha no está en el modelo base sino en el empaquetado: litert-community distribuye los pesos en formato `.litertlm`, optimizado para ejecución local en CPU y GPU de smartphones y ordenadores sin conexión de red. Los archivos incluyen la plantilla de chat oficial, la declaración del token de parada y límites de caché KV definidos, lo que permite integrarlo directamente en aplicaciones Android mediante Google AI Edge Gallery o en escritorio con la CLI `litert-lm`.

El tamaño reducido (1B parámetros) y las cuantizaciones int8 e int4 lo sitúan en la categoría de modelos edge para asistentes japoneses offline. Las mediciones publicadas por el autor sobre Galaxy S26 y Mac Studio M4 Max muestran velocidades de decodificación de hasta 50,5 tok/s en GPU móvil con int4 y 159,4 tok/s en Apple Silicon, con una calidad en JCommonsenseQA equivalente o ligeramente superior a la referencia bf16 en PyTorch dentro del arnés propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (24 capas, hidden 1792, GQA 16:8, vocabulario 102.400 untied) |
| Parametros totales | 1B (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de caché KV declarada en el bundle LiteRT-LM; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | int8 dynamic (lineales + embeddings), int4 blockwise-32 + OCTAV (lineales) con embeddings int8 |
| Idiomas soportados | japonés (principal), inglés |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en el repo de sbintuitions |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Llama con 24 capas, dimensión oculta de 1792 y atención con query grouping 16:8 (16 cabezas de query, 8 de clave/valor). El vocabulario es de 102.400 tokens con embeddings no atados a la capa de salida, lo que aumenta el número de parámetros respecto a un modelo con pesos compartidos del mismo tamaño. No dispone de canal de pensamiento ni de modo de razonamiento explícito; es un modelo de instrucciones de propósito general orientado a conversación en japonés.

El proceso de entrenamiento del modelo original (composición del corpus, número de tokens, uso de RLHF o DPO) no está detallado en la información disponible. La conversión a LiteRT-LM consistió en reescribir los grafos de prefill y decode para GPU el 2026-11-14, manteniendo los pesos intactos; el autor verificó que las respuestas de los archivos reescritos son idénticas byte a byte a las de los archivos anteriores en cuatro prompts con decodificación greedy. El bundle incorpora la plantilla de chat oficial (`<|user|>…</s><|assistant|>…</s>`, con `<|system|>…</s>`), el token de parada `</s>` (id 2) y firmas de prefill en 11 tramos de 1 a 1024 tokens.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con calidad verificada en tareas de cálculo, capitales, antónimos, traducción, comparación de decimales y conocimiento factual básico.
- Instrucciones multi-turno: el autor valida conversaciones de 3 turnos en japonés sin respuestas vacías ni filtración de tokens especiales.
- Tokenización correcta de emojis y caracteres de rango extendido (por ejemplo `😀`, `𠮷`, `☔`), con verificación de que la decodificación token a token no produce U+FFFD.
- Coincidencia exacta de IDs de tokenización con el tokenizer de Hugging Face en 7 conjuntos de cadenas de prueba (especiales, japonés, mixto, emoji, Latin-1, espacios, símbolos CJK).
- Ejecución offline completa en dispositivo, sin conexión de red.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Asistentes de chat japoneses offline en Android: el bundle int4 (905 MB) se importa en Google AI Edge Gallery y responde en japonés sin red, con 50,5 tok/s de decodificación en GPU de Galaxy S26 y 1,46 s de TTFT para 1024 tokens de prefill.
- Traducción japonés-inglés en el dispositivo: el modelo responde a instrucciones de traducción (validado en el conjunto de 8 pruebas en ambos idiomas) y puede integrarse en apps de viaje o productividad sin enviar texto a servidores externos.
- Procesamiento de texto en el borde para privacidad: al ejecutarse íntegramente en CPU o GPU local, permite resumir, reformular o clasificar texto japonés sensible sin salir del dispositivo.
- Demos web con WebGPU: la rama `web` del repositorio sirve el archivo int4 (904 MB) para el chat de LiteRT-LM en navegador, útil para prototipos y validación de UX antes de empaquetar una app.
- Pruebas de regresión de tokenización y decodificación: el modelo sirve como caso de prueba para validar motores de inferencia con vocabularios japoneses grandes y emojis multibyte, dado que el autor documenta verificaciones de streaming y de igualdad de IDs con HF.
- Asistente de escritorio en Apple Silicon: con 159,4 tok/s de decodificación y 88 ms de TTFT en Mac Studio M4 Max (GPU, int4), es viable para autocompletado y chat local en herramientas de desarrollo.
- Evaluación comparativa de cuantizaciones: los archivos int8 e int4 permiten medir el compromiso entre tamaño (1506 MB frente a 905 MB), velocidad y precisión en hardware concreto; el autor reporta 76/100 y 77/100 en JCommonsenseQA respectivamente frente a 75/100 de bf16.

## Benchmarks y rendimiento

Calidad en JCommonsenseQA (JGLUE v1.3 valid, primeros 100 ítems, greedy, arnés propio del autor; no comparable con puntuaciones JGLUE publicadas):

| Configuracion | Aciertos |
|---|---|
| PyTorch bf16 (referencia, MPS) | 75/100 |
| LiteRT int8 (CPU) | 76/100 |
| LiteRT int4 block-32 (CPU) | 77/100 |

Rendimiento medido en dispositivo:

| Hardware | Backend | Prefill (1024 tok) | Decode | TTFT |
|---|---|---:|---:|---:|
| Galaxy S26, int8 | GPU | 714 tok/s | 37,8 tok/s | 1,46 s |
| Galaxy S26, int4 | GPU | no disponible | 50,5 tok/s | no disponible |
| Galaxy S26, int8 | CPU (XNNPACK) | 443 tok/s | 12,1 tok/s | no disponible |
| Galaxy S26, int8 (archivos previos) | CPU | 84 tok/s | 13,5 tok/s | 3,90 s |
| Galaxy S26, int8 (archivos previos) | GPU | 592 tok/s | 27,4 tok/s | 580 ms |
| Galaxy S26, int4 (archivos previos) | GPU | 592 tok/s | 27,4 tok/s | 580 ms |
| Mac Studio M4 Max, int4 (archivos previos) | GPU | 3578 tok/s | 159,4 tok/s | 88 ms |
| Mac Studio M4 Max, int8 (archivos previos) | GPU | 3554 tok/s | 146,4 tok/s | 90 ms |

El autor reporta además 37,8 tok/s de decodificación y 714 tok/s de prefill con int8 en GPU de Galaxy S26 bajo LiteRT-LM v0.19.0 (2026-11-14), y delegación completa de los grafos a LITERT_CL (1087/1087 nodos en prefill_2–1024, 968/968 en prefill_1, 998/998 en decode) en Galaxy S26 y Pixel 11 Pro.

## Requisitos de hardware

- VRAM/RAM: int8 ocupa 1506 MB y consume un pico de 0,93 GB (`VmHWM`) en Galaxy S26 con GPU; int4 ocupa 905 MB en disco. El repositorio completo pesa 7,2 GB por incluir múltiples variantes y ramas.
- GPU recomendadas: GPU integrada de smartphones con soporte LiteRT (Adreno en Galaxy S26, GPU de Pixel 11 Pro), GPU de Apple Silicon (M4 Max validado) y GPUs de escritorio compatibles con LiteRT-LM; no se documentan requisitos para A100 o H100.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de Apple Silicon y en la memoria gráfica compartida de móviles; no se han publicado pruebas en RTX 4090 ni en GPUs dedicadas de escritorio.
- Opciones de despliegue: CLI `litert-lm` (CPU o `--backend gpu`), Google AI Edge Gallery en Android, demo web con WebGPU desde la rama `web`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.litertlm`.
- Latencia y throughput: ver tabla de benchmarks; el autor recomienda int8 para CPU y uso general, e int4 para GPU y restricciones de almacenamiento, advirtiendo que el prefill en CPU con int4 es más de dos veces más lento que con int8 en los archivos previos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato edge |
|---|---|---|---|---|---|
| litert-community/sarashina2.2-1b-instruct-v0.1 | 1B | 4096 (caché KV del bundle) | ja, en | MIT | `.litertlm` int8/int4 |
| sbintuitions/sarashina2.2-1b-instruct-v0.1 | 1B | no disponible | ja, en | MIT | safetensors (modelo base) |
| Alternativas edge de 1B en LiteRT-LM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de otros autores para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo base comete errores en tareas de conocimiento general: la referencia bf16 en PyTorch acierta 7/8 en el conjunto japonés de pruebas y falla en la rima de "merci", lo que indica limitaciones heredadas del modelo original.
- En GPU de smartphones, la variante int4 tiende a anteponer palabras semánticamente distintas a la respuesta correcta en preguntas de traducción (por ejemplo, "Bien sûr" o "D'accord" antes de "Merci"); el arnés del autor lo cuenta como acierto si aparece la respuesta esperada, pero en producción puede degradar la calidad percibida.
- El prefill en CPU con int4 es más de dos veces más lento que con int8 según las mediciones previas, lo que desaconseja int4 en despliegues sin aceleración GPU.
- El contexto útil está limitado por la caché KV de 4096 tokens declarada en el bundle; no se documenta el contexto nativo del modelo base.
- El soporte de idiomas se limita a japonés e inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- No dispone de tool calling, agentes, visión ni modo de razonamiento, lo que limita su uso en pipelines que requieran esas capacidades.
- La licencia MIT permite uso comercial, pero el autor no documenta auditorías de sesgos ni evaluaciones de seguridad; el riesgo de alucinación en conocimiento factual no está cuantificado más allá de JCommonsenseQA.
- El formato `.litertlm` está atado al runtime LiteRT-LM; la portabilidad a otros motores de inferencia no está garantizada.
- Las mediciones de rendimiento proceden de hardware concreto (Galaxy S26, Pixel 11 Pro, Mac Studio M4 Max) y versiones específicas de LiteRT-LM (0.16.0, 0.19.0–0.19.2); no deben extrapolarse sin validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/sarashina2.2-1b-instruct-v0.1
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-1b-instruct-v0.1
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/sarashina2.2-1b-instruct-v0.1
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Registro de mediciones edge-compat (int4): https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-1b-instruct-v0.1-int4/CARD.md
- Registro de mediciones edge-compat (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-1b-instruct-v0.1-int8/CARD.md
