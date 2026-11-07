# litert-community/LFM2-2.6B-Exp

## Resumen

LFM2-2.6B-Exp es un checkpoint experimental de Liquid AI construido sobre LFM2-2.6B y post-entrenado con aprendizaje por refuerzo puro (RL), centrado en seguimiento de instrucciones, conocimiento y matematicas. La version aqui documentada es la conversion comunitaria al formato LiteRT-LM (`.litertlm`) realizada por `litert-community`, pensada para ejecucion en dispositivo (on-device) y en el borde (edge) mediante el runtime LiteRT-LM de Google. El modelo base cuenta con 2.569.272.320 parametros distribuidos en 30 capas, combinando 22 capas de convolucion y 8 de atencion, con embeddings atados y un vocabulario de 65.536 tokens.

La relevancia de esta publicacion radica en que empaqueta el modelo en dos variantes cuantizadas (int8 e int4) que reducen el peso a 2,72 GB y 1,53 GB respectivamente, manteniendo una precision practicamente identica al modelo bf16 de referencia en GSM8K e IFEval-lite. Esto permite desplegar un modelo de ~2,6B en telefonos Android (Galaxy S26, Pixel 8a) y en Mac con Apple Silicon, con latencias del orden de segundos a decenas de segundos para prefill de 1024 tokens y decodificacion de 256 tokens.

Liquid AI describe este checkpoint como adecuado para tareas agenticas, extraccion de datos, RAG, escritura creativa y conversaciones multi-turno, y lo desaconseja para tareas intensivas en conocimiento o programacion. La model card de Liquid AI no documenta capacidades de razonamiento, aunque en las pruebas del conversor el modelo genera ocasionalmente trazas entre `<think>` y `</think>`. El modelo base esta marcado como obsoleto por Liquid AI, que recomienda LFM2.5-2.6B con ventana de 131K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida convolucional-atencional (22 capas de convolucion + 8 capas de atencion), embeddings atados |
| Parametros totales | 2.569.272.320 (~2,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 4096 tokens en los bundles LiteRT-LM |
| Tipos de cuantizacion | int8 (lineales dynamic int8, embedding int8, convs en float) e int4 (blockwise-32 + OCTAV en lineales, lm_head y embedding int8) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano y espanol |
| Licencia | LFM Open License v1.0 (`lfm1.0`), etiquetada como `other` en Hugging Face |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base original esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2-2.6B emplea una arquitectura hibrida que alterna capas de convolucion y capas de atencion (22 convolucionales y 8 de atencion) sobre 30 capas totales, con embeddings atados y un vocabulario de 65.536 tokens. Esta combinacion busca reducir el coste computacional y de memoria de la atencion cuadratica manteniendo capacidad de modelado de dependencias largas, lo que encaja con despliegue en dispositivos con recursos limitados.

El checkpoint LFM2-2.6B-Exp se obtiene aplicando aprendizaje por refuerzo puro sobre LFM2-2.6B, con entrenamiento especifico en seguimiento de instrucciones, conocimiento y matematicas. Liquid AI no publica el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del algoritmo de RL en la informacion disponible. La conversion a LiteRT-LM aplica cuantizacion post-entrenamiento: int8 dinamico en lineales con embedding int8 y convoluciones en float, e int4 blockwise de tamano 32 con OCTAV en lineales y lm_head/embedding en int8. El tokenizador, la configuracion y la plantilla de chat son identicas a las de LFM2-2.6B.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, con entrenamiento explicito de RL en instruction following.
- Razonamiento matematico: resuelve problemas de varios pasos (GSM8K) con formato de razonamiento paso a paso y linea final `#### <numero>`.
- Extraccion de datos estructurados: identificacion de fechas, entidades y campos a partir de texto libre.
- Conocimiento general moderado, segun la orientacion del checkpoint hacia tareas de conocimiento.
- Conversaciones multi-turno con contexto de hasta 4096 tokens en los bundles LiteRT-LM.
- Escritura creativa, uso recomendado por Liquid AI.
- RAG (generacion aumentada por recuperacion), uso recomendado por Liquid AI.
- Tareas agenticas, uso recomendado por Liquid AI.
- Trazas de razonamiento ocasionales entre `<think>` y `</think>`, no documentadas por Liquid AI.
- Soporte multilingue en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- No se documenta soporte de tool calling, function calling ni vision en la informacion disponible.
- No se documenta soporte de audio en la informacion disponible.

## Casos de uso

- Extraccion de datos en el dispositivo: el modelo puede procesar texto localmente y devolver campos estructurados (por ejemplo, fechas de un comunicado) sin enviar datos a la nube, gracias al bundle int4 de 1,53 GB que cabe en moviles de gama alta.
- Asistentes conversacionales embebidos en apps Android: con contexto de 4096 tokens y latencias de 10,81 s (int4 GPU en Galaxy S26) para prefill de 1024 tokens mas 256 tokens decodificados, es viable para turnos de conversacion acotados.
- Procesamiento de documentos sensibles en el borde: al ejecutarse con LiteRT-LM en CPU o GPU local, permite resumir o clasificar texto confidencial sin salida de red, cumpliendo requisitos de privacidad.
- Aplicaciones de escritura asistida offline: generacion de borradores y reescritura de parrafos en apps de notas o correo, con el bundle int8 (2,72 GB) en Mac o movil.
- Educacion y tutoria de matematicas: el modelo resuelve problemas GSM8K con precision cercana al bf16 (89/100 en int4 e int8 frente a 89/100 en bf16), por lo que puede integrarse en apps de practica guiada paso a paso.
- RAG local en aplicaciones de escritorio: combinado con un indice vectorial embebido, el modelo responde sobre documentacion propia usando el contexto de 4096 tokens, con el bundle int8 en Mac M4 Max (2,49 s en GPU).
- Filtrado y clasificacion de texto en pipelines de ingestión: el modelo sigue instrucciones mecanizables (IFEval-lite 101-102 sobre 120) y puede aplicarse a normalizacion o etiquetado de registros antes de almacenarlos.

## Benchmarks y rendimiento

Liquid AI no publica tabla de benchmarks para este checkpoint; las cifras siguientes provienen de las pruebas del conversor comunitario y solo son comparables dentro de esa tabla.

| Configuracion | GSM8K (n=100) | IFEval-lite (n=120) |
|---|---|---|
| bf16 de referencia (transformers, MPS) | 89 | 102 |
| int8, litert-lm | 87 | 102 |
| int4, litert-lm | 89 | 101 |

Prueba de correccion de 8 preguntas en Mac M4 Max (temperatura 0): int8 7/8 en CPU y GPU, int4 7/8 en CPU y GPU, bf16 7/8; todas las configuraciones fallan la misma pregunta de rima.

Tiempos para prefill de 1024 tokens mas 256 tokens decodificados con contexto 2048:

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 2,00 s | 10,81 s | 22,06 s |
| int8 GPU | 2,49 s | 13,42 s | 25,14 s |
| int8 CPU | 9,40 s | 17,39 s | 58,42 s |
| int4 CPU | 11,11 s | 25,91 s | 65,57 s |

El bundle int4 es un 43,8 % mas pequeno que el int8. En las tres GPU medidas se delegaron completamente las 12 firmas del modelo.

## Requisitos de hardware

- VRAM/almacenamiento: el bundle int8 ocupa 2,72 GB y el int4 1,53 GB; la cache de pesos compilados anade 2,58 GB (int8) o 1,51 GB (int4) si se usa la cache por defecto.
- Mac con Apple Silicon: probado en Mac M4 Max con backend GPU (2,00 s int4, 2,49 s int8 para el benchmark de referencia).
- Moviles Android: probado en Galaxy S26 (10,81 s int4 GPU, 13,42 s int8 GPU) y Pixel 8a (22,06 s int4 GPU, 25,14 s int8 GPU).
- iOS: no medido; la seccion de pesos del int8 ocupa 2.722.843.088 bytes (2,54 GiB) y, segun la model card de LFM2.5-2.6B, un archivo int8 de 2,87 GB solo se ejecuta en iPhone 17 Pro si la app dispone de los entitlements de direccionamiento virtual extendido y memoria incrementada.
- GPU de servidor (A100, H100, RTX 4090): no se han publicado mediciones en la informacion disponible.
- Consumer GPU: no se han publicado mediciones especificas para GPUs de escritorio en la informacion disponible; el modelo esta orientado a Mac Apple Silicon y moviles Android.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`, `litert-lm benchmark`) en CPU y GPU; el modelo base puede ejecutarse con transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: ver tabla de tiempos en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2-2.6B-Exp (LiteRT-LM, esta ficha) | 2,6B | 4096 en bundles; 32.768 en base | LFM Open License v1.0 | Hugging Face (`litert-community`) | Formato `.litertlm`, orientado a on-device |
| LFM2.5-2.6B | 2,6B | 131K | No disponible en la informacion | Hugging Face (`litert-community`) | Recomendado por Liquid AI como sustituto del modelo obsoleto |
| Qwen3-4B (LiteRT) | 4B | No disponible en la informacion | No disponible en la informacion | Hugging Face (`litert-community`) | Alternativa de la familia Qwen en formato LiteRT |

Liquid AI afirma que LFM2-2.6B-Exp obtiene un IFBench superior a DeepSeek R1-0528, pero no se dispone de la tabla comparativa completa ni de cifras detalladas para contrastar en esta ficha. El modelo base esta marcado como obsoleto por Liquid AI.

## Limitaciones y advertencias

- Modelo base declarado obsoleto por Liquid AI; se recomienda LFM2.5-2.6B para capacidades agenticas y contexto de 131K.
- Liquid AI desaconseja su uso para tareas intensivas en conocimiento y programacion; no hay datos de rendimiento en generacion de codigo.
- Riesgo de alucinacion inherente a modelos de 2,6B; la prueba de correccion de 8 preguntas da 7/8 en todas las configuraciones.
- En Mac CPU, el bundle int4 mostro repeticiones hasta llenar el contexto de 4096 tokens en 3 de 9 ejecuciones con un prompt de extraccion de fechas; la causa no se determino. En GPU termino normalmente en 4 de 4.
- En litert-lm 0.17.1 el archivo int8 respondio a "What is the capital of France?" como si no hubiera pregunta; el int4 no se probo en esa version. Probado correctamente en litert-lm 0.18.0.
- El sampler por defecto del bundle (temperatura 0.1, top-k 50, top-p 1.0) difiere de la recomendacion de Liquid AI (temperatura 0.3, min_p 0.15, repetition_penalty 1.05); el bundle no incluye min_p ni penalizacion por repeticion.
- Contexto efectivo limitado a 4096 tokens en los bundles LiteRT-LM, frente a 32.768 del modelo base.
- Idiomas soportados limitados a ocho; no se documenta cobertura de otras lenguas.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de uso comercial; la model card la etiqueta como `other`.
- No se documentan capacidades de tool calling, vision ni audio, lo que limita su uso en pipelines agenticos complejos.
- No hay mediciones publicadas en GPUs de servidor ni en iOS.

## Enlaces

- Modelo en Hugging Face (esta conversion): https://huggingface.co/litert-community/LFM2-2.6B-Exp
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B-Exp
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2-2.6B-Exp/blob/main/LICENSE
- Documentacion de Liquid AI para LFM2-2.6B-Exp: https://docs.liquid.ai/lfm/models/lfm2-2.6b-exp
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Repositorio del conversor y scripts de verificacion: https://github.com/john-rocky/hf-to-litertlm
- Guia de despliegue en Android GPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Organizacion LiteRT Community: https://huggingface.co/litert-community
- Modelo sustituto recomendado (LFM2.5-2.6B): https://huggingface.co/litert-community/LFM2.5-2.6B
