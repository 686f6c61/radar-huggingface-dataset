# litert-community/sarashina2.2-0.5b-instruct-v0.1

## Resumen

sarashina2.2-0.5b-instruct-v0.1 es un modelo de lenguaje compacto de 0,5 mil millones de parámetros desarrollado por SB Intuitions y especializado en japonés. Esta ficha concreta es la conversión realizada por la comunidad litert-community al formato `.litertlm` de Google LiteRT-LM, pensada para ejecución local en dispositivos móviles y de borde (smartphones, portátiles, Mac) sin conexión a red. El modelo base es un transformer denso de tipo Llama con 24 capas, dimensión oculta de 1280, atención GQA 16:8 y un vocabulario de 102.400 tokens no atados (untied).

La relevancia de esta publicación radica en que empaqueta un LLM japonés en un formato de inferencia on-device con cuantizaciones int8 e int4 verificadas, junto con mediciones reproducibles de latencia y throughput en hardware real (Galaxy S26, Pixel 8a, Mac Studio M4 Max). El modelo no dispone de canal de razonamiento explícito ni de capacidades multimodales: es un chat generalista afinado por instrucciones, con licencia MIT, que prioriza el japonés y mantiene un rendimiento aceptable en inglés.

El contexto máximo declarado en el bundle es de 4096 tokens de caché KV, con firmas de prefill escalonadas de 1 a 1024 tokens. Su interés práctico está en aplicaciones de chat y asistentes embebidos en dispositivos con recursos limitados, donde la privacidad y la ausencia de red son requisitos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (24 capas, hidden 1280, GQA 16:8, vocabulario 102.400 untied) |
| Parámetros totales | 0,5 mil millones (aproximadamente; embeddings + capa de salida suman 262 M) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (límite de caché KV del bundle) |
| Tipos de cuantización | int8 dynamic (lineales + embeddings), int4 blockwise-32 + OCTAV (lineales) con embeddings int8 |
| Idiomas soportados | japonés (principal), inglés |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors vía Hugging Face |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de arquitectura Llama estándar, con atención multi-cabeza con consultas agrupadas (GQA) en proporción 16:8, 24 capas y dimensión oculta de 1280. Emplea un vocabulario de 102.400 tokens con embeddings y capa de salida no atados, lo que supone 262 M parámetros adicionales solo en esas dos matrices y explica buena parte del coste de decodificación en dispositivos móviles. No incorpora mecanismos híbridos SSM, atención lineal ni decodificación especulativa.

El entrenamiento fue realizado por SB Intuitions con preentrenamiento y ajuste por instrucciones orientado al japonés. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a LiteRT-LM se realizó con litert-torch 0.9.3 y transformers 5.14.1, e incluye el tokenizer de Hugging Face embebido, la plantilla de chat estructurada (`<|user|>…</s><|assistant|>…</s>`, con `<|system|>…</s>`) y la declaración del token de parada `</s>` (id 2).

## Capacidades

- Generación de texto conversacional multi-turno en japonés e inglés, con formato de chat estructurado y soporte de mensajes de sistema.
- Razonamiento básico y cálculo aritmético simple (verificado en pruebas de suma, multiplicación y comparación de decimales).
- Respuesta a preguntas de conocimiento general y cultural japonés (capitales, prefecturas, antónimos, días de la semana).
- Traducción japonés-inglés a nivel de frase en tareas sencillas.
- Inferencia completamente local y offline en CPU y GPU de dispositivos móviles y ordenadores personales.
- Streaming token a token con decodificación correcta de emojis y caracteres de variante (verificado con U+FFFD en pruebas con «😀», «𠮷» y «☔»).
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente multi-paso ni de modo de razonamiento (thinking mode).
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de chat japonés embebido en aplicaciones Android: mediante Google AI Edge Gallery o importación local del bundle `.litertlm`, el modelo ofrece conversación multi-turno en japonés sin conexión, con un TTFT de 0,39 s en GPU de Galaxy S26.
- Traducción y asistencia de redacción japonés-inglés en el dispositivo: adecuado para aplicaciones de notas o correo que necesiten traducción de frases sin enviar texto a servidores externos, gracias a los 4096 tokens de contexto y a la licencia MIT.
- Atención al cliente de baja complejidad en kioscos o terminales: el modelo puede gestionar diálogos guiados de varios turnos con contexto suficiente para mantener el hilo de una consulta breve, ejecutándose en CPU con 19-21 tok/s de decodificación.
- Procesamiento de texto privado en dispositivos médicos o financieros: al no requerir red ni backend, permite resumir o clasificar texto japonés sensible dentro del propio terminal, con un pico de memoria de 849 MB en GPU int8.
- Educación y práctica de idiomas: ejercicios de vocabulario, conjugación y preguntas culturales japonesas, con respuestas generadas localmente en un Mac Studio M4 Max a 197 tok/s de decodificación.
- Prototipado de aplicaciones edge con LiteRT-LM: sirve como modelo de referencia para validar pipelines de conversión, plantillas de chat y delegación de operaciones a OpenCL (1066/1066 nodos delegados en GPU en las pruebas del autor).
- Filtrado y etiquetado ligero en preprocesado de datos japoneses: clasificación o reformateo de registros en lotes pequeños donde el coste de un modelo mayor no se justifica y se prefiere ejecución en CPU.

## Benchmarks y rendimiento

Precisión en JCommonsenseQA (JGLUE v1.3 valid, primeros 100 ítems, greedy, harness propio del autor; no comparable con puntuaciones oficiales de JGLUE):

| Configuración | Aciertos |
|---|---|
| PyTorch bf16 (referencia, MPS) | 65/100 |
| LiteRT int8 (CPU) | 62/100 |
| LiteRT int4 block-32 (CPU) | 65/100 |

Rendimiento en Galaxy S26 (SM-S942Q, Adreno GPU, LiteRT-LM 0.16.0, prompt de 205 tokens):

| Archivo | Backend | Prefill (205) | Decode | TTFT | RSS pico |
|---|---|---|---|---|---|
| int8 | GPU (OpenCL) | 862-895 tok/s | 36,2-36,5 tok/s | 0,39-0,40 s | 849 MB |
| int8 | CPU | 295-349 tok/s | 20,1-21,0 tok/s | 0,97-1,14 s | 1625 MB |
| int4 | GPU (OpenCL) | 661-903 tok/s | 31,8-40,3 tok/s | 0,38-0,52 s | 883 MB |
| int4 | CPU | 133-135 tok/s | 18,8-19,5 tok/s | 2,44-2,47 s | 1400 MB |

Rendimiento en Apple M4 Max (LiteRT-LM 0.16.0, `-p 256 -d 256 --runs 3 --cache no`):

| Archivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| int8 | GPU | 5722 tok/s | 197,1 tok/s | 0,058 s |
| int8 | CPU | 1029 tok/s | 47,0 tok/s | 0,530 s |
| int4 | GPU | 5754 tok/s | 197,8 tok/s | 0,058 s |
| int4 | CPU | 546 tok/s | 42,7 tok/s | 0,565 s |

Datos adicionales: Pixel 8a con int8 y GPU alcanza 16,8 tok/s de decodificación, 297 tok/s de prefill y 1,14 s de TTFT. En la puerta de 8 preguntas en Mac, int8 obtuvo 7/8 en inglés (CPU) y 7/8 en japonés, mientras que int4 obtuvo 6/8 en inglés y 8/8 en japonés; la referencia bf16 en PyTorch obtuvo 6/8 en inglés y 8/8 en japonés. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 534 MB para int4 y 871 MB para int8 en almacenamiento; pico de memoria en ejecución de 849-883 MB en GPU móvil y 1400-1625 MB en CPU móvil.
- GPU recomendadas: Adreno de Galaxy S26 (OpenCL), GPU de Pixel 8a, GPU integrada de Apple M4 Max. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada moderna; el tamaño del bundle (534-871 MB) es compatible con móviles de gama media-alta.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm run` y `litert-lm benchmark`, API Python, `litert_lm_advanced_main`), Google AI Edge Gallery en Android y demo web con WebGPU.
- Latencia y throughput: TTFT de 0,058 s en M4 Max GPU y 0,39 s en Galaxy S26 GPU con int8; decodificación de 197 tok/s en M4 Max y 36 tok/s en Galaxy S26 GPU. En CPU móvil, TTFT de 0,97-2,47 s según cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato edge | Rendimiento documentado |
|---|---|---|---|---|---|---|
| sarashina2.2-0.5b-instruct-v0.1 (LiteRT-LM) | 0,5 B | 4096 | ja, en | MIT | `.litertlm` int8/int4 | 36,5 tok/s decode en Galaxy S26 GPU; JCQA 62-65/100 |
| LFM2.5-230M | 0,23 B | no disponible | no disponible | no disponible | no disponible | 122 tok/s decode en Galaxy S26 GPU (misma prueba) |
| Modelos Llama de 0,5 B en formato GGUF | 0,5 B | no disponible | en (principal) | no disponible | GGUF | no disponible en la información proporcionada |

La comparación directa con alternativas de la misma categoría es limitada: la información disponible solo aporta el dato de LFM2.5-230M en el mismo terminal y runtime, con una velocidad de decodificación notablemente superior (122 frente a 36,5 tok/s) atribuida al vocabulario menor (65k, tied) frente a los 102.400 tokens untied de sarashina2.2.

## Limitaciones y advertencias

- El modelo está afinado principalmente para japonés: en la demo web, una misma pregunta obtuvo respuesta correcta en japonés y sin sentido en inglés.
- La precisión en inglés es inferior a la japonesa incluso en la referencia bf16 (6/8 frente a 8/8 en la puerta de 8 preguntas), por lo que los fallos en inglés no son atribuibles solo a la cuantización.
- Riesgo de alucinación inherente a un modelo de 0,5 B: conocimiento factual limitado y propensión a errores en preguntas que requieran información actualizada o razonamiento complejo.
- Contexto limitado a 4096 tokens de caché KV, insuficiente para documentos largos o conversaciones extensas.
- El vocabulario de 102.400 tokens untied penaliza la velocidad de decodificación (262 M parámetros en embeddings y capa de salida leídos por token), lo que reduce el throughput frente a modelos más pequeños con vocabulario atado.
- El harness de JCommonsenseQA es propio del autor y no es comparable con las puntuaciones oficiales de JGLUE; los resultados deben interpretarse solo dentro de ese conjunto de pruebas.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento, lo que limita su uso en pipelines que requieran invocación de funciones.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero la información disponible no incluye una cláusula de exención de responsabilidad específica del bundle LiteRT-LM más allá de la del modelo base.
- Las mediciones de rendimiento provienen de un único entorno de pruebas por dispositivo y con versiones concretas de LiteRT-LM (0.16.0); los resultados pueden variar con otras versiones del runtime o del sistema operativo.
- No hay datos publicados de sesgos demográficos, toxicidad ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio Hugging Face del bundle: https://huggingface.co/litert-community/sarashina2.2-0.5b-instruct-v0.1
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b-instruct-v0.1
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Conversor litert-torch: https://github.com/google-ai-edge/litert-torch
- Demo web de chat: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/sarashina2.2-0.5b-instruct-v0.1
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Ficha de compatibilidad edge int4: https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-0.5b-instruct-v0.1-int4/CARD.md
- Ficha de compatibilidad edge int8: https://github.com/john-rocky/edge-compat/blob/main/cards/sarashina2.2-0.5b-instruct-v0.1-int8/CARD.md
