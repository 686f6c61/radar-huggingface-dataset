# prabanta-dev/Inkling-2-Mini-JNS

## Resumen

Inkling-2-Mini-JNS es una conversión de los pesos de `thinkingmachines/Inkling-2-Mini` al formato JNS, propietario del motor de inferencia Janas-LLM (implementado en C y distribuido bajo GPL-3.0-or-later). El modelo original, desarrollado por Thinking Machines, es un transformer de tipo mixture-of-experts con 26,4 mil millones de parámetros totales y 3,4 mil millones activos por token. La particularidad arquitectónica es que sus doce capas centrales se ejecutan tres veces (recurrencia de capas), lo que incrementa la profundidad efectiva sin aumentar el número de pesos.

Esta conversión concreta parte de la cuantización UD-Q4_K_M publicada por unsloth en formato GGUF y la reempaqueta en JNS para que Janas-LLM pueda leer los expertos directamente desde disco a medida que un token los necesita. El resultado es un único archivo de 18,25 GB pensado para inferencia local en CPU (con o sin GPU) mediante las herramientas `janas-get` y `janas-chat`.

La relevancia es acotada pero clara: el autor reporta que, con este archivo, el token más probable coincide con el de llama.cpp en 61 de 64 posiciones, y con la cuantización Q8_0 en 1.279 de 1.300 tokens de texto, frente a 1.277 de 1.300 que obtiene llama.cpp con su configuración por defecto respecto a sus propios ajustes exactos. Es decir, se aproxima al comportamiento de referencia de llama.cpp sin necesidad de dicho motor. No obstante, el repositorio no incluye benchmarks de calidad ni de velocidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts con recurrencia de capas (las doce capas centrales se ejecutan tres veces) |
| Parametros totales | 26,4 mil millones |
| Parametros activos | 3,4 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_M (origen GGUF de unsloth); expertos en NVFP4 con escalas por experto para gate/up y down; proyecciones pequeñas (sinks, taps de convolución) en BF16 leídas como F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos originales), sujeta además a la Model Acceptable Use Policy de Thinking Machines; el motor Janas es GPL-3.0-or-later, los archivos convertidos no |
| Formato de pesos | JNS (formato propietario de Janas-LLM); origen GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26,4 mil millones de parámetros totales y 3,4 mil millones activos, en el que las doce capas centrales se evalúan tres veces, técnica de recurrencia de capas que aumenta la profundidad computacional efectiva sin duplicar pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a JNS preserva los pesos de los expertos bit a bit tal como unsloth los escribió en NVFP4, con una escala por experto para gate y up y otra para down. Las proyecciones pequeñas (sinks y taps de convolución) se mantienen en BF16 y el motor las lee como filas F32. El resto de tensores del GGUF se reorganizan en las regiones de JNS para permitir la lectura de expertos desde disco bajo demanda. El motor calcula el prompt en bloques de 64 posiciones de forma bit a bit idéntica al cálculo token a token.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base Inkling-2-Mini.
- Modo de razonamiento activable o desactivable ("reasoning on or off") según la model card.
- Soporte del formato de chat propio del modelo.
- Soporte de herramientas (tools) en Janas-LLM.
- Procesamiento de imágenes: no implementado todavía en Janas-LLM ("its pictures not yet"), aunque el modelo base podría tener capacidad multimodal.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Inferencia local en CPU (con o sin GPU) mediante el motor Janas-LLM.

## Casos de uso

- Inferencia local en equipos sin GPU: el formato JNS y el motor en C de Janas permiten ejecutar un MoE de 26,4B parámetros con 3,4B activos en un ordenador convencional, leyendo los expertos desde disco según se necesitan.
- Despliegue en estaciones de trabajo con recursos limitados: el archivo único de 18,25 GB en cuantización Q4_K_M reduce los requisitos de VRAM/RAM frente a los pesos originales en BF16.
- Experimentación con motores de inferencia alternativos: útil para investigadores que quieran comparar la fidelidad de Janas-LLM frente a llama.cpp en las mismas condiciones (el autor reporta 61/64 y 1.279/1.300 coincidencias de token más probable).
- Prototipado de asistentes conversacionales con razonamiento: el soporte de modo de razonamiento activable permite alternar entre respuestas rápidas y cadenas de razonamiento más costosas.
- Integración de tool calling en flujos locales: Janas-LLM ejecuta las herramientas del formato del modelo, lo que permite construir agentes sencillos sin depender de servicios en la nube.
- Evaluación de cuantizaciones: al proceder de la UD-Q4_K_M de unsloth, sirve para medir el impacto de la cuantización Q4 en la calidad respecto al modelo original o a Q8_0.
- Reproducibilidad y verificación de integridad: el repositorio publica el SHA-256 del archivo (`82456e07...`) y `janas-get` lo comprueba automáticamente, lo que facilita pipelines reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de fidelidad de decodificación frente a llama.cpp:

| Comparación | Coincidencia del token más probable |
|---|---|
| Este archivo (UD-Q4_K_M) frente a llama.cpp, 64 posiciones | 61 de 64 |
| GGUF Q8_0 de ggml-org frente a llama.cpp, 1.300 tokens | 1.279 de 1.300 |
| llama.cpp con ajustes por defecto frente a sus ajustes exactos, mismo texto | 1.277 de 1.300 |

Medido el 24 de noviembre de 2026 con llama.cpp con flash attention desactivado y caché en 32 bits como referencia. La velocidad del motor con este modelo aún no se ha medido con `janas-bench`.

## Requisitos de hardware

- Tamaño del archivo: 18,25 GB (cuantización UD-Q4_K_M en formato JNS).
- RAM/VRAM estimada: al menos ~18-20 GB para cargar el archivo completo; el diseño de lectura de expertos desde disco puede reducir la memoria residente a costa de latencia de E/S.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs con 24 GB o más (RTX 3090/4090, A10, L4) si el motor soporta descarga completa en VRAM; no confirmado.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB con la cuantización Q4_K_M; no confirmado por el autor.
- Opciones de despliegue: Janas-LLM (Linux, Windows, macOS) mediante `janas-get` y `janas-chat`; conversión desde GGUF con `gguf2jns` o `--from-gguf`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este archivo JNS (llama.cpp solo como referencia de comparación).
- Latencia y throughput: no medidos con `janas-bench` según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-JNS | 26,4B | 3,4B | no disponible | JNS | Apache 2.0 + política de uso | Conversión para Janas-LLM, solo texto por ahora |
| thinkingmachines/Inkling-2-Mini | 26,4B | 3,4B | no disponible | safetensors (original) | Apache 2.0 + política de uso | Modelo base oficial |
| unsloth/Inkling-2-Mini-GGUF | 26,4B | 3,4B | no disponible | GGUF (UD-Q4_K_M, Q8_0, etc.) | Apache 2.0 + política de uso | Cuantizaciones para llama.cpp y derivados |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~26B con ~3B activos) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo lo lee Janas-LLM: el archivo JNS no es compatible con llama.cpp, vLLM, Ollama ni otras herramientas.
- Sin benchmarks de calidad ni de velocidad publicados; el rendimiento real en tareas downstream es desconocido.
- Capacidad de imagen no implementada en Janas-LLM ("its pictures not yet"), pese a que el modelo base podría soportarla.
- Idiomas soportados y longitud de contexto no documentados en esta ficha; conviene consultar la model card del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas.
- Sesgos: no se documentan en la información disponible.
- Licencia: Apache 2.0 en los pesos, pero el uso está además sujeto a la Model Acceptable Use Policy de Thinking Machines; si se ofrece el modelo a terceros, el integrador responde de su cumplimiento.
- El repositorio no pertenece a Thinking Machines ni está avalado por ellos.
- El motor Janas es GPL-3.0-or-later, lo que puede afectar a la distribución de productos que lo integren; los archivos convertidos no heredan esa licencia.
- Fidelidad de decodificación no perfecta: 3 de 64 posiciones divergen del token más probable de llama.cpp en la prueba reportada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prabanta-dev/Inkling-2-Mini-JNS
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones GGUF de origen (unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor Janas (GitHub): https://github.com/prabanta-dev/janas
- README de Janas: https://github.com/prabanta-dev/janas#readme
- Releases de Janas: https://github.com/prabanta-dev/janas/releases/latest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
