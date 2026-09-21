# minjaechoi/qwen3next-80b-a3b-2p02bit-r32_v7

## Resumen

`minjaechoi/qwen3next-80b-a3b-2p02bit-r32_v7` es un checkpoint de investigación publicado por el usuario minjaechoi sobre el modelo base Qwen/Qwen3-Next-80B-A3B-Thinking, de la familia Qwen3-Next de Alibaba. La modificación consiste en comprimir los expertos enrutados de la capa MoE a un promedio de 2,016 bits por peso (identificador interno r32_v7), dejando el resto de los pesos en BF16. El repositorio está etiquetado como `quantized`, `text-generation` y `conversational`, y es compatible con `transformers` y vLLM estándar según su model card.

El dato más relevante para quien vaya a evaluarlo es que los pesos se almacenan descomprimidos en tensores BF16: la compresión a ~2 bits describe el proceso de obtención de los expertos, no el formato final. En consecuencia, el repositorio ocupa 162,7 GB y los safetensors declaran 81.324.862.720 parámetros (81,32 mil millones), un volumen coherente con un almacenamiento BF16 completo y sin ahorro de memoria en inferencia respecto al modelo base.

Se trata de un experimento interno sin validación pública: acumula 0 descargas y 0 likes en el momento de redactar esta ficha, no publica resultados de evaluación, no declara licencia ni idiomas en la metadata de HuggingFace y su model card indica únicamente que la licencia sigue la del modelo base. Su interés es, por tanto, el de un artefacto de investigación reproducible, no el de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido del modelo base Qwen3-Next: capas de atención lineal (Gated DeltaNet) combinadas con capas de atención completa (Gated Attention) y capas MoE de alta esparsidad. Dato no verificado en la información proporcionada sobre este checkpoint |
| Parametros totales | 81.324.862.720 (≈81,32 mil millones), según los safetensors del repositorio |
| Parametros activos | Aproximadamente 3.000 millones por token (el identificador del modelo base es A3B); no confirmado en la ficha del checkpoint |
| Longitud de contexto | No especificada en la información del checkpoint. El modelo base declara 262.144 tokens nativos |
| Tipos de cuantizacion | Expertos enrutados a 2,016 bits de promedio (variante r32_v7); el resto de pesos en BF16. Los pesos se almacenan ya descomprimidos en BF16 |
| Idiomas soportados | No disponible en la metadata del repositorio. El modelo base declara soporte multilingüe |
| Licencia | No declarada en la metadata de HuggingFace. La model card indica que la licencia sigue la del modelo base; no se detalla cuál es en la información proporcionada |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 162,7 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-09-21 |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios en la topología del modelo base: mantiene la arquitectura híbrida de Qwen3-Next, que intercala capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) y utiliza capas de mezcla de expertos de alta esparsidad, de modo que solo una fracción pequeña de los parámetros totales se activa por token. Esa esparsidad es precisamente lo que hace viable el experimento: comprimir los expertos enrutados afecta a la mayor parte del peso almacenado, pero a una parte minoritaria del cómputo por token.

La intervención del autor se limita a esa compresión: los expertos enrutados promedian 2,016 bits por peso, mientras que el resto de tensores se conservan en BF16 y se almacenan descomprimidos. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF, DPO o refuerzo con recompensas verificables; tampoco se describe el método de cuantización empleado (tipo de agrupación, escalas, calibración) más allá del ratio medio y del identificador `r32_v7`. La ficha se limita a indicar que es un checkpoint interno de investigación que carga con `transformers` y vLLM sin modificaciones.

## Capacidades

Las capacidades heredadas del modelo base son, según su documentación pública, las siguientes; no se han publicado evaluaciones específicas de esta variante comprimida:

- Generación de texto conversacional y de razonamiento en modo "thinking", con cadenas de pensamiento extensas antes de la respuesta final.
- Resolución de problemas de matemáticas y razonamiento lógico de varios pasos, incluida la variante de razonamiento profundo del modelo base.
- Generación y comprensión de código, con soporte de instrucciones de programación en varios lenguajes.
- Soporte declarado de tool calling y function calling por parte del modelo base, integrable en agentes.
- Ejecución de flujos agénticos de varios pasos y uso de herramientas externas en el modelo base.
- Capacidades multilingües del modelo base (número exacto de idiomas no disponible en la información proporcionada para este checkpoint).
- Modo de pensamiento ("thinking") exclusivo: el modelo base de esta variante está entrenado para razonar antes de responder.
- No se declara soporte de visión ni de audio en la información disponible.

## Casos de uso

- Evaluación interna de compresión de modelos: comparar las respuestas de este checkpoint frente al modelo base sin comprimir con el mismo prompt y los mismos parámetros de muestreo, para medir la degradación introducida por los expertos a 2,016 bits.
- Investigación en cuantización extrema de MoE: usar el checkpoint como referencia reproducible de una configuración concreta (r32_v7) a la hora de estudiar el efecto de distintos ratios de bits sobre la perplejidad y la calidad del razonamiento.
- Generación de datos sintéticos de razonamiento: producir trazas de pensamiento largas para destilar modelos más pequeños, aprovechando el modo thinking del modelo base.
- Análisis de documentos extensos: el modelo base soporta ventanas de contexto de hasta 262.144 tokens, lo que permite procesar contratos, informes técnicos o repositorios completos en una sola pasada, sujeto al coste de memoria de la caché KV.
- Asistencia a la programación en entornos de investigación: resolución de problemas algorítmicos y revisión de código con explicación del razonamiento paso a paso, siempre en un entorno controlado y no como servicio público.
- Experimentación con agentes y tool calling: prototipado de flujos multi-paso que invocan APIs o funciones, usando el soporte del modelo base para function calling.
- Reproducción de experimentos académicos: al cargar con `transformers` y vLLM sin parches, sirve como punto de partida para trabajos que necesiten un MoE grande con expertos fuertemente comprimidos.
- No se recomienda su uso en producción: es un checkpoint sin validar, sin licencia declarada de forma explícita y con cero adopción registrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye evaluaciones (MMLU, GSM8K, HumanEval, AIME u otras) ni comparaciones con el modelo base sin comprimir, y la búsqueda web realizada no ha devuelto documentación técnica asociada a este repositorio.

## Requisitos de hardware

- Pesos en disco y en memoria: 162,7 GB de repositorio, equivalentes a unos 162,6 GB (≈151,5 GiB) de pesos BF16 puros para 81.324.862.720 parámetros.
- VRAM estimada para inferencia: por encima de 170 GB solo para los pesos, más caché KV y activaciones. Un despliegue realista en BF16 requiere del orden de 180-200 GB de memoria agregada.
- GPU recomendadas: 4× A100 80 GB (320 GB), 2× H200 141 GB (282 GB) o 8× H100 80 GB. Dos H100 de 80 GB (160 GB) no son suficientes para alojar los pesos completos.
- GPU de consumo: no cabe en ninguna GPU de consumo actual, ni siquiera en varias RTX 4090 de 24 GB sin recurrir a offloading a memoria del sistema, que degradaría severamente el throughput.
- Opciones de despliegue: vLLM y `transformers` de forma nativa según la model card; TGI sería viable en principio al ser pesos safetensors estándar. No hay conversiones a GGUF publicadas, por lo que llama.cpp y Ollama no son una vía directa sin convertir los pesos previamente.
- Cuantizaciones adicionales: no disponibles. La compresión a 2,016 bits de los expertos no reduce la huella de memoria en inferencia, porque los pesos se almacenan descomprimidos en BF16.
- Latencia y throughput: no disponibles. El cómputo por token es reducido (≈3.000 millones de parámetros activos según el modelo base), pero el movimiento de pesos desde memoria condiciona el rendimiento en configuraciones con tensor parallelism.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de sus respectivos fabricantes y no han podido verificarse en la información proporcionada en esta búsqueda.

| Modelo | Parametros totales / activos | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `minjaechoi/qwen3next-80b-a3b-2p02bit-r32_v7` | 81,32 B / ≈3 B | No especificado (262.144 en el base) | safetensors, expertos a 2,016 bits almacenados en BF16 | No declarada en HF; sigue la del modelo base | Checkpoint de investigación, 0 descargas, sin evaluaciones |
| Qwen/Qwen3-Next-80B-A3B-Thinking (modelo base) | ≈80 B / ≈3 B | 262.144 tokens nativos | safetensors BF16, sin compresión de expertos | Apache 2.0 según su documentación pública | Referencia de comparación directa para medir la degradación de la variante comprimida |
| Qwen3-30B-A3B-Thinking-2507 (misma familia, menor tamaño) | ≈30 B / ≈3 B | 262.144 tokens nativos | safetensors BF16 y cuantizaciones de la comunidad | Apache 2.0 según su documentación pública | Alternativa desplegable en una sola GPU de 80 GB, a costa de menor capacidad bruta |
| Qwen3-235B-A22B-Thinking-2507 (misma familia, mayor tamaño) | ≈235 B / ≈22 B | 262.144 tokens nativos | safetensors BF16 y cuantizaciones de la comunidad | Apache 2.0 según su documentación pública | Mayores requisitos de hardware y mayor coste por token; más capacidad de razonamiento declarada |

## Limitaciones y advertencias

- Es un checkpoint interno de investigación, sin validación externa, sin tarjeta de evaluación y con 0 descargas y 0 likes en el momento de redactar esta ficha.
- La compresión de los expertos enrutados a 2,016 bits de promedio puede degradar la calidad de las respuestas frente al modelo base; no se han publicado mediciones que cuantifiquen esa pérdida.
- La compresión no reduce la memoria necesaria en inferencia: los pesos se almacenan descomprimidos en BF16, lo que obliga a disponer de más de 170 GB de memoria para los pesos.
- Licencia no declarada explícitamente en la metadata del repositorio. La model card remite a la licencia del modelo base, por lo que cualquier uso comercial exige verificar previamente los términos de Qwen/Qwen3-Next-80B-A3B-Thinking.
- Riesgo de alucinación inherente a los modelos de razonamiento de gran tamaño, especialmente en tareas de matemáticas, código y preguntas factuales.
- No se declaran los idiomas soportados para este checkpoint; el comportamiento multilingüe solo puede inferirse del modelo base.
- El modo thinking genera cadenas de razonamiento largas, lo que incrementa el coste de inferencia y la latencia percibida.
- No existen versiones cuantizadas adicionales (GGUF, AWQ, GPTQ) publicadas en el repositorio, lo que limita las opciones de despliegue en hardware modesto.
- No se documenta el método de cuantización (agrupación, calibración, escalas), lo que dificulta reproducir el proceso o auditar la fidelidad de los pesos.
- El repositorio no incluye datos de entrenamiento, composición del dataset ni detalles de fases de alineación.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3next-80b-a3b-2p02bit-r32_v7
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking
- Paper, blog, repositorio o demo del checkpoint: no disponible
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a páginas de inicio de sesión de redes sociales, sin relación con el modelo)
