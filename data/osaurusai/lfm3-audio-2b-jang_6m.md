# OsaurusAI/LFM3-Audio-2B-JANG_6M

## Resumen

OsaurusAI/LFM3-Audio-2B-JANG_6M es una cuantización de 6 bits del modelo multimodal LiquidAI/LFM3-Audio-2B, empaquetada específicamente para Apple Silicon mediante el formato JANG de Osaurus. El modelo base, desarrollado por Liquid AI, combina el tronco de lenguaje LFM3 con un codificador de voz LFM2 de 17 capas que opera a 16 kHz, lo que permite entrada de audio y texto con salida de texto. Esta build reduce el modelo a 2,01 GiB en disco manteniendo una fidelidad muy alta respecto al original en bf16.

La relevancia de esta ficha es doble: por un lado documenta un modelo de audio-comprensión de ~2B parámetros con soporte para 16 idiomas; por otro, muestra una receta de cuantización mixta (8 bits en atención y proyecciones convolucionales, 6 bits en las FFN) calibrada con GPTQ y AWQ sobre datos orientados a tool calling, agentes de terminal, razonamiento y código. Es una opción práctica para desplegar comprensión de voz y agentes locales en portátiles Mac sin GPU dedicada.

El modelo no incluye modo de razonamiento extendido (thinking) ni salida de audio: la modalidad de entrada es texto y voz, y la salida es únicamente texto. La licencia es la LFM Open License v1.0, idéntica a la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (tronco de lenguaje) + codificador de voz LFM2 de 17 capas a 16 kHz |
| Parametros totales | 1.977.548.032 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 8 bits afín grupo 32 (atención q/k/v/o, convoluciones cortas, embedding/lm_head), 6 bits afín grupo 32 (FFN w1/w3/w2); GPTQ con act-order y AWQ con escalas de canal |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (float16 en disco, cuantización empaquetada), librería mlx, código custom |

## Arquitectura y entrenamiento

El modelo base es un sistema audio-text-to-text que acopla el tronco de lenguaje LFM3 con un codificador de voz LFM2 de 17 capas que procesa audio a 16 kHz; un proyector conecta las representaciones de voz con el espacio del modelo de lenguaje. Esta build concreta no reentrena el modelo, sino que cuantiza los pesos: las matrices de atención y las proyecciones de convolución corta se guardan a 8 bits afín con grupo 32, las FFN a 6 bits afín con grupo 32, y el embedding atado con la lm_head a 8 bits. Se mantienen en precisión completa la puerta de salida de atención, los kernels de convolución depthwise, todas las normalizaciones, el codificador de voz, el proyector y el decodificador de salida de voz (no usado para texto).

La calibración se realizó sobre 529.024 tokens renderizados con la plantilla de chat del propio modelo, con llamadas a herramientas en formato XML `<tool_call><function=...>`, resultados de herramientas como turnos `tool` y trazas de agente dentro de `<think>`. La distribución por dominio es: 154.969 tokens de tool calling, 174.363 de trayectorias de agentes de terminal/SWE, 105.223 de razonamiento con trazas largas, 46.072 de código y texto agéntico, 37.598 de texto general, ciencia, sistemas, seguridad, multilingüe y contexto largo, y 10.799 de voz (ASR, QA hablado e instrucciones habladas). Parte del conjunto son respuestas del propio modelo, de modo que su distribución de servicio queda representada en la calibración. GPTQ se aplicó a las 142 matrices con rejilla min-max fija, act-order y acumulación de hessianos; AWQ se usó para escalas de canal (alpha 0.25, clip 0.5-2) plegadas en `ffn_norm` y en filas de `w3` sin coste en tiempo de ejecución. El error medio de reconstrucción en calibración es un 53,5% inferior al de round-to-nearest.

## Capacidades

- Comprensión de audio y texto con salida de texto (pipeline audio-text-to-text).
- Reconocimiento de voz (ASR) y respuesta a preguntas habladas, según los dominios de calibración declarados.
- Generación de texto, razonamiento y código, con trazas de razonamiento en `<think>`.
- Tool calling / function calling en formato XML nativo (`<tool_call><function=...>`), incluyendo llamadas de estilo Hermes.
- Soporte de agentes multi-paso, con trayectorias de terminal y SWE en el conjunto de calibración.
- Multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Sin modo thinking explícito: el autor indica "no thinking mode".
- Sin salida de audio: el decodificador de voz se conserva pero no se usa para texto.

## Casos de uso

- Transcripción y comprensión de audio en local: el codificador de voz a 16 kHz permite alimentar reuniones o notas de voz y obtener resúmenes o respuestas en texto, ejecutándose en un Mac sin GPU dedicada gracias al formato MLX de 2,01 GiB.
- Asistentes de voz para atención al cliente: el modelo puede recibir audio del usuario y responder en texto, integrándose en un pipeline de ASR + razonamiento + generación de respuesta con tool calling para consultar sistemas internos.
- Agentes de terminal y automatización de tareas de desarrollo: la calibración incluye 174.363 tokens de trayectorias de terminal/SWE y 46.072 de código, lo que lo hace adecuado para agentes que emiten comandos y llamadas a herramientas en formato XML.
- Enrutamiento de herramientas en asistentes conversacionales: el soporte nativo de `<tool_call>` permite que el modelo decida qué función invocar y con qué argumentos en flujos multi-turno.
- Procesamiento multilingüe de audio: con 16 idiomas declarados, sirve para transcribir o responder consultas habladas en español, portugués, árabe, hindi o japonés dentro de una misma aplicación.
- Prototipado e investigación en Apple Silicon: al ser una build MLX cuantizada con métricas de fidelidad publicadas (KL mediana 0,00004 nats/posición, top-1 del 98,95% frente a bf16), es útil para evaluar modelos de audio en entornos de desarrollo con memoria unificada limitada.
- Clasificación y extracción de información a partir de instrucciones habladas: el modelo acepta instrucciones de voz y devuelve texto estructurado, lo que permite construir formularios o tickets a partir de dictado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente al modelo bf16 sobre 64 secuencias retenidas (13.958 posiciones evaluadas):

| Build | Tamano | KL mediana | KL media | KL p95 | Top-1 |
|---|---|---|---|---|---|
| Esta build (JANG_6M) | 2,01 GiB | 0,00004 | 0,00119 | 0,0049 | 98,95% |
| Mismo layout, round-to-nearest | 2,01 GiB | 0,00006 | 0,00190 | 0,0062 | 98,76% |
| 6 bits uniforme gs64 (receta por defecto de mlx-vlm) | 1,77 GiB | 0,00016 | 0,00424 | 0,0171 | 97,97% |

Las métricas de KL se expresan en nats por posición (menor es mejor) y top-1 es la coincidencia de argmax con bf16.

## Requisitos de hardware

- VRAM/memoria: 2,01 GiB en disco en float16 cuantizado; en ejecución se necesita memoria unificada adicional para el contexto y el codificador de voz, no cuantificado.
- Plataforma objetivo: Apple Silicon (tags `apple-silicon`, `mlx`); no está pensado para CUDA.
- GPU recomendadas: no disponible; el formato MLX está orientado a chips Apple M-series con memoria unificada.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: está diseñado para Mac. En Apple Silicon, 2 GiB de pesos caben en cualquier Mac con 8 GB o más de memoria unificada.
- Opciones de despliegue: vMLX / Osaurus (vmlx-swift con soporte LFM3, Osaurus con soporte de medios LFM3) y mlx-vlm con el port de LFM3. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| OsaurusAI/LFM3-Audio-2B-JANG_6M | ~2B | no disponible | audio + texto → texto | LFM Open License v1.0 | MLX, safetensors cuantizado, Apple Silicon |
| LiquidAI/LFM3-Audio-2B (base) | ~2B | no disponible | audio + texto → texto | LFM Open License v1.0 | safetensors, bf16 |
| Receta 6 bits uniforme gs64 (mlx-vlm) | ~2B | no disponible | audio + texto → texto | depende del modelo base | MLX, 1,77 GiB |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de audio de 2B de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin modo thinking: el autor indica explícitamente que no hay modo de razonamiento extendido, lo que limita tareas que requieran cadenas de pensamiento largas.
- Sin salida de audio: el decodificador de voz se conserva pero no se usa; el modelo no genera voz.
- Solo entrada de audio y texto: no procesa imagen ni vídeo.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas sin verificación empírica.
- Cuantización con pérdida: aunque la fidelidad es alta (top-1 del 98,95% frente a bf16), hay divergencia respecto al original, especialmente en la cola de la distribución (KL p95 de 0,0049).
- Calibración sesgada hacia agentes y código: solo 37.598 de 529.024 tokens cubren texto general, ciencia, sistemas, seguridad, multilingüe y contexto largo, y solo 10.799 cubren voz; el rendimiento en dominios generales o de audio fuera de ASR/QA hablado puede degradarse más de lo que sugieren las métricas globales.
- Licencia LFM Open License v1.0: es necesario revisar `LICENSE` para confirmar las condiciones de uso comercial y las restricciones aplicables, ya que no es una licencia permisiva estándar.
- Dependencia de plataforma: el formato MLX y el código custom limitan el despliegue a entornos Apple Silicon con runtimes compatibles (Osaurus/vMLX o mlx-vlm con port LFM3).
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos en la información disponible.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/LFM3-Audio-2B-JANG_6M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Sitio de Osaurus AI: https://osaurus.ai
- Licencia LFM Open License v1.0: https://huggingface.co/OsaurusAI/LFM3-Audio-2B-JANG_6M/blob/main/LICENSE
