# bcckfdn/cevher3-test-3

## Resumen

cevher3-test-3 es un modelo de lenguaje de tipo decoder-only publicado por el usuario bcckfdn en Hugging Face, entrenado sobre la arquitectura Gemma3-SWA (sliding window attention) con un total de 1.256.312.832 parámetros. Está orientado a generación de texto conversacional y declara soporte para turco (tr) e inglés (en), lo que lo sitúa como una alternativa de tamaño medio para aplicaciones en esos dos idiomas.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la librería transformers, además de soporte declarado para text-generation-inference y endpoints compatibles. Su ventana de contexto es de 8192 tokens y emplea un vocabulario de 65.536 entradas, con 34 capas y dimensión oculta de 1792.

La relevancia de este modelo reside en su tamaño contenido (aproximadamente 1,25 mil millones de parámetros), que lo hace apto para inferencia en hardware de consumo, combinado con una ventana de contexto relativamente amplia para su escala. Se trata, no obstante, de un modelo de publicación reciente y con escasa documentación pública: no se han publicado resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento más allá del número de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3-SWA (decoder-only transformer con sliding window attention) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales de arquitectura declarados por el autor: 34 capas, dimensión oculta 1792, 28 cabezas de atención para Q y 4 para KV, vocabulario de 65.536 tokens, 6.992 millones de tokens de entrenamiento y mejor pérdida de validación de 2,8047.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma3-SWA, una variante de transformer decoder-only que incorpora atención de ventana deslizante (sliding window attention) para reducir el coste computacional en secuencias largas. Según la model card, consta de 34 capas con dimensión oculta de 1792 y una configuración de atención con 28 cabezas de consulta y 4 cabezas de clave-valor, lo que sugiere agrupación de cabezas (GQA) para disminuir el uso de memoria en la caché KV. La ventana de contexto es de 8192 tokens y el vocabulario de 65.536 entradas.

El entrenamiento se realizó sobre aproximadamente 6.992 millones de tokens, con una pérdida de validación mínima de 2,8047. No se especifican en la información disponible la composición del dataset, la proporción de cada idioma, ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal más allá del propio esquema de ventana deslizante.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, con orientación conversacional según las etiquetas del repositorio.
- Razonamiento y respuesta a instrucciones de propósito general, si bien no se documenta explícitamente el ajuste por instrucciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a turco e inglés según los metadatos.
- Modo de pensamiento (thinking), visión o audio: no disponible.
- Integración con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.

## Casos de uso

- Asistentes conversacionales en turco: el modelo puede gestionar diálogos multi-turno en turco e inglés gracias a su ventana de 8192 tokens, adecuada para conversaciones con historial extenso sin truncamiento frecuente.
- Generación de contenido en turco: redacción de artículos, resúmenes y respuestas en turco para aplicaciones editoriales o de atención al cliente, aprovechando su vocabulario de 65.536 entradas adaptado a ese idioma.
- Prototipado rápido en investigación: con 1,25 mil millones de parámetros, permite iterar sobre experimentos de generación de texto en una sola GPU de consumo, lo que facilita la experimentación académica.
- Clasificación y etiquetado de texto: uso como modelo base para tareas de análisis de sentimiento o categorización mediante prompting, dado su tamaño manejable y su licencia permisiva.
- Traducción asistida turco-inglés: aunque no se documenta entrenamiento específico de traducción, su cobertura bilingüe permite emplearlo como base para pipelines de traducción con ajuste fino posterior.
- Despliegue en entornos con recursos limitados: su tamaño permite servirlo con text-generation-inference o transformers en GPUs de gama media, integrándolo en servicios de generación de texto de bajo coste.
- Base para ajuste fino (fine-tuning): la licencia Apache 2.0 y el formato safetensors facilitan su uso como punto de partida para especializaciones en dominios concretos en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es la pérdida de validación mínima de 2,8047 durante el entrenamiento, que no es comparable directamente con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5 GB solo para pesos, más caché KV y activaciones.
- VRAM estimada en bf16/fp16: aproximadamente 2,5 GB para pesos, con overhead adicional para contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3 GB para pesos; en 4 bits, en torno a 0,7 GB (estimaciones teóricas, no verificadas con variantes publicadas).
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 o superiores para inferencia cómoda en bf16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más de VRAM en bf16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference y endpoints compatibles según las etiquetas; no se documenta soporte verificado para llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cevher3-test-3 | 1.256 M | 8192 | tr, en | Apache 2.0 | safetensors |
| Gemma 2 2B | ~2.600 M | 8192 | multilingüe | Gemma license | safetensors, GGUF |
| Qwen2.5 1.5B | ~1.500 M | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | ~1.200 M | 131.072 | multilingüe | Llama license | safetensors, GGUF |

La comparación se basa en datos públicos de esos modelos; no se dispone de resultados de benchmarks de cevher3-test-3 que permitan contrastar rendimiento real frente a estas alternativas. Frente a Qwen2.5 1.5B y Llama 3.2 1B, cevher3-test-3 ofrece una ventana de contexto notablemente menor y una cobertura de idiomas más restringida, aunque comparte licencia permisiva con Qwen2.5.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos no especificados, puede heredar sesgos de género, culturales o políticos presentes en el corpus.
- Riesgo de alucinación: no evaluado; con solo 6.992 millones de tokens de entrenamiento, el riesgo de generar información incorrecta con aparente seguridad es relevante.
- Limitaciones de contexto: ventana de 8192 tokens, inferior a la de modelos comparables como Qwen2.5 1.5B (32.768) o Llama 3.2 1B (131.072).
- Limitaciones de idioma: solo turco e inglés declarados; el rendimiento en otros idiomas, incluido el español, no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre la procedencia de los datos de entrenamiento, lo que puede implicar riesgos legales no evaluados.
- Documentación insuficiente: no se detallan dataset, proceso de ajuste (SFT/RLHF/DPO), ni evaluaciones de seguridad, lo que dificulta su adopción en producción sin validación propia.
- Nombre del repositorio ("test") y ausencia de likes sugieren un modelo experimental sin mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-3
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
