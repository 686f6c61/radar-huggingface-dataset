# konnecta/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta corresponde al repositorio `konnecta/Qwen3.5-4B`, un artefacto publicado por el usuario konnecta que contiene los pesos y ficheros de configuración del modelo post-entrenado Qwen3.5-4B en formato Hugging Face Transformers, derivado del modelo base `Qwen/Qwen3.5-4B-Base`. El modelo integra un codificador visual y un modelo de lenguaje causal con arquitectura híbrida.

La propuesta técnica de Qwen3.5 combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón repetido, lo que reduce el coste computacional en contextos largos. El modelo declara 4B de parámetros en el modelo de lenguaje, con una longitud de contexto nativa de 262.144 tokens extensible hasta 1.010.000 tokens, y soporte declarado de 201 idiomas y dialectos.

Es relevante porque sitúa capacidades multimodales y de contexto muy largo en el rango de los 4B de parámetros, un tamaño desplegable en hardware de consumo y en entornos de producción con requisitos moderados de VRAM. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador visual; híbrida Gated DeltaNet + Gated Attention, con FFN |
| Parametros totales | 4.659.865.088 (≈4,66B, según safetensors) |
| Parametros activos | no disponible (la model card no declara configuración MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos técnicos declarados: dimensión oculta 2560, embedding de tokens 248.320 (padded), 32 capas, layout oculto 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), FFN con dimensión intermedia 9216, salida LM atada al embedding de tokens (248.320), MTP entrenado con múltiples pasos. En Gated DeltaNet: 32 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. En Gated Attention: 16 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión RoPE 64. Tamaño del repo: 9,3 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con codificador visual. El bloque se repite ocho veces con el patrón 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet implementan atención lineal con 32 cabezas para V y 16 para QK con dimensión 128, mientras que las capas Gated Attention usan atención completa con 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de dimensión 64. Esta combinación busca alto rendimiento en inferencia con baja latencia y coste reducido en contextos largos. El modelo incorpora además MTP (multi-token prediction) entrenado con múltiples pasos.

Según la model card, el entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales (early fusion) y paridad cross-generacional con Qwen3, superando a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se menciona escalado de RL sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto, junto con marcos de RL asíncronos. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con codificador visual integrado.
- Razonamiento sobre código y tareas de programación.
- Razonamiento matemático y tareas STEM.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL escalado sobre entornos de agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Contexto largo: 262.144 tokens nativos, extensible hasta 1.010.000 tokens.
- MTP (multi-token prediction) entrenado con múltiples pasos.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar contratos, informes o expedientes de cientos de miles de tokens e integrar figuras y tablas escaneadas gracias al codificador visual y a la ventana de 262.144 tokens nativos.
- Asistentes de atención al cliente multimodales: gestión de conversaciones multi-turno en las que el usuario adjunta capturas, fotos de productos o recibos, con contexto largo para mantener el historial completo de la interacción.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede analizar parches, explicar errores y proponer correcciones dentro de flujos automatizados, aprovechando su capacidad de razonamiento sobre código.
- Procesamiento de documentación técnica multilingüe: traducción y resumen de manuales y bases de conocimiento en decenas de idiomas, con coherencia terminológica gracias a la cobertura declarada de 201 idiomas.
- Extracción de información de facturas y formularios escaneados: combinación de OCR implícito vía codificador visual y razonamiento textual para estructurar datos en JSON u otros formatos.
- Agentes autónomos de investigación: descomposición de tareas complejas en pasos, consulta de fuentes y síntesis de resultados, apoyándose en el entrenamiento con RL sobre entornos de agentes.
- Análisis de imágenes médicas o industriales asistido: descripción y clasificación preliminar de imágenes con contexto textual asociado, en entornos donde se requiera despliegue local por confidencialidad.
- Despliegue en hardware de consumo: prototipado y demos locales en equipos con GPU de gama alta para consumo, dado el tamaño de 4B parámetros.

## Benchmarks y rendimiento

Datos de benchmarks de lenguaje publicados en la model card (cifras del modelo Qwen3.5-4B frente a alternativas):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 92,5 | no disponible en el extracto |

Nota: la información proporcionada solo incluye parcialmente la tabla de benchmarks; el resto de filas (otras categorías y benchmarks) no están disponibles en el extracto, por lo que no se reproducen.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- En cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits: en torno a 3 GB de pesos (estimaciones a partir del número de parámetros; los formatos concretos no están declarados en la información disponible).
- GPU recomendadas para producción: A100, H100, L40S o similares con 24 GB o más para contextos largos; para contexto de 262.144 tokens se requiere hardware con memoria amplia o técnicas de atención eficiente.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16 con contexto moderado; en cuantizaciones de 4-8 bits puede ejecutarse en GPUs de 8-12 GB como RTX 4070 o RTX 3060, con limitaciones de contexto.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | ≈4,66B | 262.144 (ext. 1.010.000) | 79,1 | Apache 2.0 | Hugging Face (transformers, vLLM, SGLang, KTransformers) |
| Qwen3.5-9B | no disponible en el extracto | no disponible en el extracto | 82,5 | no disponible en el extracto | Hugging Face |
| GPT-OSS-20B | 20B (declarados) | no disponible | 74,8 | no disponible en el extracto | no disponible en el extracto |
| Qwen3-30BA3B-Thinking-2507 | 30B (A3B) | no disponible | 80,9 | no disponible en el extracto | Hugging Face |

Qwen3.5-4B ofrece un equilibrio entre tamaño reducido, contexto muy largo y capacidades multimodales, con un MMLU-Pro de 79,1, inferior al de Qwen3.5-9B (82,5) pero cercano al de modelos mucho mayores como GPT-OSS-120B (80,8).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación: inherente a los modelos generativos; no se publican tasas de alucinación en la información disponible.
- Limitaciones de contexto: aunque el contexto nativo es de 262.144 tokens, el rendimiento efectivo en ventanas muy largas puede degradarse; la extensión a 1.010.000 tokens requiere técnicas adicionales no detalladas.
- Idiomas: se declaran 201 idiomas, pero no se especifica la calidad por idioma; el rendimiento en idiomas de bajos recursos puede ser inferior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia indicado en la model card.
- Repositorio de terceros: esta ficha corresponde a `konnecta/Qwen3.5-4B`, no al repositorio oficial de Qwen; la autoría del artefacto es del usuario konnecta, aunque los pesos derivan de Qwen.
- Datos incompletos: no se dispone de información sobre cuantizaciones, tool calling, latencia ni throughput, lo que limita la planificación de producción.
- Fecha de creación del repositorio: 2026-11-23, según los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/konnecta/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
