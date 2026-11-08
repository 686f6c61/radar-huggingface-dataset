# mradermacher/LFM3-Omni-2B-heretic-GGUF

## Resumen

LFM3-Omni-2B-heretic-GGUF es una cuantización estática en formato GGUF del checkpoint `rodrigomt/LFM3-Omni-2B-heretic`, publicado por el usuario mradermacher. El modelo base es una versión "abliterada" (con el comportamiento de rechazo suprimido) de LiquidAI/LFM3-Omni-2B, un modelo multimodal any-to-any de 2B parámetros desarrollado por Liquid AI. La ablación se realizó con una compilación adaptada de heretic v1.2.0 que soporta arquitecturas híbridas de convolución y atención.

El propósito de esta publicación es distribuir los pesos en cuantizaciones GGUF listas para usar con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.), lo que permite ejecutar el modelo en hardware de consumo. Al tratarse de una variante "heretic", el modelo ha sido modificado para eliminar selectivamente las respuestas de rechazo del backbone lingüístico, lo que cambia sustancialmente su comportamiento en materia de seguridad respecto al modelo original.

La información disponible es escasa: la model card del repositorio se limita a listar las cuantizaciones generadas y a enlazar el checkpoint de origen. No se proporcionan datos sobre licencia, idiomas, benchmarks ni detalles del proceso de entrenamiento original más allá de lo indicado en la búsqueda web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de convolución y atención (según heretic v1.2.0); arquitectura del modelo base no detallada |
| Parametros totales | 474.504.706 (según safetensors del repo); el modelo base se describe como de 2B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas), derivado de safetensors |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo any-to-any de Liquid AI que, según la información disponible, emplea una arquitectura híbrida que combina capas convolucionales con capas de atención. La variante heretic se generó mediante una compilación adaptada de heretic v1.2.0 capaz de operar sobre este tipo de arquitecturas híbridas, aplicando una ablación selectiva del comportamiento de rechazo sobre el backbone lingüístico. No se dispone de detalles sobre el dataset de ablación, el número de direcciones de rechazo eliminadas ni los hiperparámetros empleados.

No hay información publicada sobre el número de tokens de entrenamiento del modelo original, la composición de su dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del checkpoint cuantizado más allá del proceso estándar de conversión a GGUF con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generación de texto y razonamiento, heredadas del backbone lingüístico de LFM3-Omni-2B.
- Capacidades multimodales any-to-any según la descripción del modelo base (entrada y salida en múltiples modalidades), aunque no se detallan las modalidades concretas soportadas.
- Comportamiento de rechazo suprimido: el modelo no declinará peticiones que el modelo original rechazaría, lo que afecta a contenido sensible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la ablación de rechazo afecta al comportamiento del backbone lingüístico en un modelo híbrido convolución-atención, comparando respuestas con el checkpoint original de LiquidAI.
- Experimentación con modelos multimodales en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo any-to-any de ~2B en GPUs de gama media o incluso en CPU, facilitando pruebas de prototipos sin infraestructura dedicada.
- Evaluación de técnicas de cuantización: al ofrecerse 12 variantes (desde Q2_K hasta x-f16), sirve para medir la degradación de calidad en tareas multimodales según el nivel de cuantización.
- Desarrollo de pipelines locales con llama.cpp: integración en aplicaciones de escritorio o servidores ligeros mediante llama.cpp u Ollama para tareas de generación de texto sin dependencia de la nube.
- Estudio de arquitecturas híbridas: permite analizar el comportamiento de capas convolucionales y de atención combinadas en un modelo pequeño, útil para investigación académica sobre eficiencia.
- Pruebas de robustez y red-teaming: al carecer de rechazos, es útil como sujeto de prueba para evaluar filtros de seguridad externos y clasificadores de contenido en pipelines de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~2B parámetros, las cuantizaciones Q4_K_M e IQ4_XS ocupan aproximadamente entre 1,2 y 1,5 GB, mientras que x-f16 rondaría los 4 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: por tamaño, las cuantizaciones Q2 a Q8 deberían caber en GPUs con 4-8 GB de VRAM, aunque no hay confirmación del autor.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, llama-cpp-python). No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/LFM3-Omni-2B-heretic-GGUF | 474.504.706 (safetensors); base ~2B | no disponible | no disponible | GGUF | Variante heretic cuantizada |
| rodrigomt/LFM3-Omni-2B-heretic | ~2B | no disponible | no disponible | safetensors | Checkpoint heretic de origen |
| LiquidAI/LFM3-Omni-2B | ~2B | no disponible | no disponible | no disponible | Modelo base any-to-any original |
| mizahnyx/lfm3-omni-2b-abliterated-heretic-v2-GGUF | ~2B | no disponible | no disponible | GGUF | Otra variante abliterated/heretic del mismo base |

## Limitaciones y advertencias

- El modelo ha sido sometido a una ablación de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal que el modelo original declinaría. No es adecuado para aplicaciones de cara al usuario sin filtros externos.
- Riesgo elevado de alucinación inherente a un modelo de ~2B parámetros, agravado por la falta de benchmarks publicados.
- La licencia no está especificada en la información disponible; no se puede confirmar si se permite uso comercial. Verificar la licencia del modelo base LiquidAI/LFM3-Omni-2B antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en casos multilingües o con contextos largos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas multimodales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Al ser una modificación no oficial, no cuenta con el soporte ni las garantías del desarrollador original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-Omni-2B-heretic-GGUF
- Checkpoint de origen: https://huggingface.co/rodrigomt/LFM3-Omni-2B-heretic
- Variante alternativa: https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2-GGUF
