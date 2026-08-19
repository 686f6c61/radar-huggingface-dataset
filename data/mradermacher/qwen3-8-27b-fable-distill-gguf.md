# mradermacher/Qwen3.8-27B-Fable-Distill-GGUF

## Resumen

Qwen3.8-27B-Fable-Distill-GGUF es la cuantización en formato GGUF del modelo TeichAI/Qwen3.8-27B-Fable-Distill, realizada por mradermacher. El modelo base pertenece a la familia Qwen3.5, con aproximadamente 27 300 millones de parámetros, licencia Apache 2.0 y una ventana de contexto de 262 144 tokens. La variante Fable-Distill se obtiene mediante destilación y ajuste fino sobre los datasets armand0e/claude-fable-5-claude-code (código) y armand0e/Fable-5-Chat (conversación), lo que orienta el modelo hacia tareas de programación y diálogo.

Este repositorio ofrece un amplio abanico de cuantizaciones estáticas —desde Q2_K hasta f16, incluyendo IQ4_XS— además de ficheros mmproj (Q8_0 y f16) que habilitan el soporte multimodal de visión en el ecosistema llama.cpp. Con un tamaño de repositorio de 105,5 GB, el usuario puede elegir el punto de equilibrio entre calidad y requisitos de VRAM según su hardware.

La relevancia de esta ficha radica en que proporciona una vía práctica para ejecutar localmente un modelo de 27 B con capacidades de código, conversación y visión, en hardware de consumo mediante cuantizaciones agresivas o en GPUs profesionales con las de mayor fidelidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con codificador de visión |
| Parametros totales | 27 320 697 856 (~27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.5 con aproximadamente 27 300 millones de parámetros. Incorpora un codificador de visión que le permite procesar entradas multimodales (imagen y texto) y soporta una ventana de contexto de 262 144 tokens. Los detalles internos de la arquitectura (número de capas, dimensiones ocultas, cabezas de atención) no se especifican en la documentación disponible.

La variante Fable-Distill se obtiene mediante destilación y ajuste fino sobre los datasets armand0e/claude-fable-5-claude-code y armand0e/Fable-5-Chat. El proceso exacto de entrenamiento —técnica de destilación, número de tokens, uso de RLHF o DPO— no se documenta en la información disponible. La cuantización GGUF realizada por mradermacher es de tipo estático (sin imatrix), generada con herramientas del ecosistema llama.cpp, y se complementa con ficheros mmproj para el soporte de visión.

## Capacidades

- Generación de texto conversacional: ajustado sobre Fable-5-Chat, mantiene diálogos multi-turno coherentes.
- Generación y comprensión de código: entrenado sobre claude-fable-5-claude-code, orientado a tareas de programación asistida.
- Procesamiento multimodal: los ficheros mmproj permiten entrada de imágenes junto al texto en llama.cpp.
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación, aunque es habitual en la familia Qwen3.5.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (IDE, terminal) para generación y autocompletado de código, aprovechando su entrenamiento sobre datos de Claude Code y su formato GGUF para ejecución en hardware de consumo.
- Chat conversacional privado: desplegado con Ollama o llama.cpp, permite mantener conversaciones multi-turno sin enviar datos a servicios externos, con una ventana de 262k tokens para historiales largos.
- Análisis de documentos extensos: con su contexto de 262 144 tokens, puede resumir o extraer información de manuales técnicos, informes o libros completos en una sola pasada.
- Tareas multimodales locales: gracias a los ficheros mmproj, puede procesar capturas de pantalla o diagramas junto con texto para documentación técnica o soporte.
- Evaluación de modelos en investigación: al ser Apache 2.0 y estar disponible en múltiples cuantizaciones, permite comparar el rendimiento del ajuste Fable-Distill frente al modelo base sin necesidad de GPUs de gran tamaño.
- Prototipado de agentes conversacionales: con text-generation-inference y endpoints compatibles, se puede integrar en pipelines de agentes que requieran razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantización no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) para esta variante. Se recomienda consultar la página del modelo base TeichAI/Qwen3.8-27B-Fable-Distill para posibles datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K: ~11-12 GB (cabe en GPUs de 12-16 GB)
  - Q4_K_M: ~16-17 GB (cabe en RTX 4080/4090, A10)
  - Q6_K: ~22-23 GB (requiere GPU de 24 GB o más)
  - Q8_0: ~29-30 GB (requiere GPU de 32 GB o dual GPU)
  - f16: ~55 GB (requiere GPU profesional o múltiples GPUs)
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q5; A100/H100 (40-80 GB) para Q8_0 o f16; RTX 3090/4080 (16-24 GB) para Q2-Q4.
- Despliegue: compatible con llama.cpp, Ollama, text-generation-inference (TGI) y vLLM (con conversión previa del formato).
- Latencia: no disponible. Depende de la cuantización, el hardware y la longitud de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Fable-Distill (GGUF) | 27,3 B | 262k | Apache 2.0 | Sí (mmproj) | GGUF |
| Qwen3.8-27B (base) | 27,3 B | 262k | Apache 2.0 | Sí | safetensors |
| Qwen2.5-32B | 32,5 B | 128k | Apache 2.0 | No | safetensors/GGUF |
| Llama 3.3 70B | 70,6 B | 128k | Llama 3.3 | No | safetensors/GGUF |

La comparación más relevante es con el modelo base Qwen3.8-27B: el ajuste Fable-Distill añade capacidades específicas de código y conversación, manteniendo la misma arquitectura, contexto y licencia. Los datos de Qwen2.5-32B y Llama 3.3 70B proceden de conocimiento general y pueden requerir verificación.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo declara soporte para inglés, lo que restringe su uso en otros idiomas.
- Cuantización estática: las cuantizaciones no usan imatrix, por lo que pueden ofrecer peor perplejidad que las versiones con imatrix de tamaño similar.
- Datos de entrenamiento no documentados: no se especifica el proceso de destilación ni la composición exacta de los datasets, lo que dificulta evaluar sesgos o riesgos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- Sin benchmarks publicados: no hay métricas de rendimiento verificables para esta variante, lo que obliga a validar el modelo en casos de uso concretos antes de desplegarlo en producción.
- Requisitos de VRAM: las cuantizaciones de mayor calidad (Q8_0, f16) requieren hardware profesional; las cuantizaciones bajas (Q2_K) pueden degradar significativamente la calidad de salida.
- Ficheros mmproj separados: el soporte multimodal requiere descargar e integrar los ficheros mmproj adicionales, lo que añade complejidad al despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-Distill-GGUF
- Modelo base (TeichAI): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Dataset de código: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset de chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
- Guía de despliegue local (Ollama/GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Herramienta Heretic (variante sin censura): https://github.com/p-e-w/heretic
