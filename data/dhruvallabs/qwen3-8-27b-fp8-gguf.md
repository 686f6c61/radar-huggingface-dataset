# DhruvalLabs/Qwen3.8-27B-FP8-GGUF

## Resumen

El modelo `DhruvalLabs/Qwen3.8-27B-FP8-GGUF` es una cuantización en formato GGUF del modelo vision-language (VLM) `Qwen/Qwen3.8-27B-FP8`, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio, creado por DhruvalLabs mediante la herramienta `quant-kit`, ofrece versiones cuantizadas del backbone de texto (Q4_K_M, Q5_K_M y Q8_0) junto con el encoder de visión (`mmproj`) en precisión F16, permitiendo ejecutar el modelo en entornos locales con llama.cpp, LM Studio, Jan u Ollama.

El modelo base Qwen3.8-27B es un transformer denso multimodal de 27 000 millones de parámetros, con una ventana de contexto de 262 000 tokens y licencia Apache 2.0. Está diseñado para tareas de razonamiento, generación de código, flujos de trabajo agénticos y automatización de oficina, con capacidad de procesar tanto texto como imágenes. La versión FP8 reduce los requisitos de memoria frente al modelo original, y la conversión a GGUF amplía su compatibilidad con hardware heterogéneo, incluidas CPU.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un VLM de 27B en equipos de consumo, aunque es necesario verificar los tamaños de archivo publicados, que resultan inconsistentes con lo esperable para un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión) con encoder de visión separado (mmproj) |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0; encoder de visión en F16; modelo base disponible en FP8 |
| Idiomas soportados | Inglés (según la model card; el modelo base podría soportar más, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone y mmproj); safetensors para el modelo base FP8 original |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes: un backbone de lenguaje (Qwen3.8-27B) que procesa texto y genera respuestas, y un encoder de visión (`mmproj`) que convierte píxeles de imagen en embeddings de tokens. El backbone es un transformer denso, sin mezcla de expertos, con 27 000 millones de parámetros. La versión FP8 del modelo base reduce el peso de cada parámetro a 8 bits, disminuyendo la huella de memoria y acelerando la inferencia en hardware compatible, como las GPU Ascend de Huawei a través de vLLM.

No se dispone de información detallada sobre el entrenamiento del modelo base: número de tokens, composición del dataset o uso de técnicas como RLHF o DPO. La cuantización GGUF se realizó posteriormente con `quant-kit`, manteniendo el encoder de visión en F16 para evitar artefactos visuales y degradación en la comprensión de imágenes. La conversión a GGUF permite ejecutar el modelo en CPU y GPU mediante llama.cpp y sus derivados.

## Capacidades

- Generación de texto y razonamiento multimodal: comprende y responde a entradas que combinan texto e imágenes.
- Descripción y análisis de imágenes: puede detallar el contenido visual de una fotografía o ilustración.
- Generación de código: el modelo base destaca en tareas de programación, según la documentación oficial.
- Flujos de trabajo agénticos: soporta razonamiento multi-paso y uso de herramientas en entornos de agente, aunque no se confirma tool calling explícito en esta cuantización.
- Automatización de oficina: capaz de procesar documentos con contenido visual (capturas, diagramas, formularios escaneados).
- Conversación multi-turno: diseñado para mantener diálogos coherentes con contexto largo (262k tokens).
- Compatibilidad con múltiples motores de inferencia: llama.cpp, LM Studio, Jan, Ollama y llama-cpp-python.

## Casos de uso

- Asistente de soporte técnico con capturas de pantalla: el usuario envía una imagen de un error y el modelo la interpreta junto con el texto para diagnosticar el problema, gracias a su capacidad de razonamiento visual y contexto largo.
- Análisis de documentos escaneados: extrae información de facturas, contratos o formularios con imágenes, combinando OCR visual con comprensión de lenguaje natural.
- Generación de código a partir de diagramas: convierte bocetos o diagramas de flujo en código funcional, aprovechando su destreza en programación y visión.
- Automatización de tareas de oficina: resume informes que incluyen gráficos y tablas, o genera respuestas a correos basándose en adjuntos visuales.
- Chatbot educativo con material gráfico: responde preguntas sobre figuras geométricas, mapas o esquemas científicos en un entorno conversacional.
- Prototipado rápido de aplicaciones VLM: sirve como base para pruebas locales de sistemas de visión-lenguaje sin necesidad de infraestructura en la nube, gracias a su formato GGUF y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantización GGUF, ni comparativas con otros modelos. Se recomienda consultar la documentación del modelo base Qwen3.8-27B para datos de evaluación, aunque no se han proporcionado en los resultados de búsqueda.

## Requisitos de hardware

- Los tamaños de archivo listados en la model card (0.01 GB para el backbone y 0.00 GB para el mmproj) son inconsistentes con un modelo de 27B; probablemente se trate de un error del repositorio. Se recomienda verificar el contenido real antes de la descarga.
- Para un modelo de 27B cuantizado a Q4_K_M, se estima un requisito de memoria de aproximadamente 16-18 GB (VRAM o RAM), asumiendo una cuantización estándar. Esta cifra es una estimación razonable, no un dato oficial.
- GPU recomendadas: tarjetas con 16-24 GB de VRAM, como RTX 4090, RTX 4080, A100 (40 GB) o H100. En CPU, se necesitaría al menos 32 GB de RAM para cargar el modelo en Q4_K_M.
- El encoder de visión (mmproj) en F16 añade entre 1 y 2 GB adicionales de memoria.
- Opciones de despliegue: llama.cpp (CLI o servidor), LM Studio, Jan, Ollama y llama-cpp-python. También es posible usar vLLM con el checkpoint FP8 original en hardware compatible.
- La latencia y el throughput dependen del hardware; no se han proporcionado cifras concretas en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Apache 2.0 | safetensors/FP8 | No disponible en la informacion |
| Qwen2.5-VL-7B | 7B | 128k | Apache 2.0 | safetensors | No disponible en la informacion |
| Llama 3.2 Vision 11B | 11B | 128k | Llama 3.2 Community | safetensors | No disponible en la informacion |

La comparativa se limita a características conocidas; no se dispone de datos de benchmarks para establecer una comparación de rendimiento fiable. Qwen3.8-27B ofrece mayor contexto y tamaño que las alternativas listadas, pero también mayores requisitos de hardware.

## Limitaciones y advertencias

- La model card solo declara soporte para inglés; el rendimiento en otros idiomas no está confirmado.
- Los tamaños de archivo publicados (0.01 GB) son inconsistentes con un modelo de 27B; existe riesgo de que los archivos no estén correctamente subidos o que la información sea errónea. Verificar antes de usar.
- La cuantización GGUF (especialmente Q4_K_M) puede degradar ligeramente la calidad de las respuestas frente al modelo original en FP8.
- El encoder de visión no está cuantizado (F16), lo que aumenta ligeramente el uso de memoria, pero preserva la calidad visual.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta cuantización; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las herramientas de cuantización.
- Para producción, se recomienda validar el comportamiento del modelo en el dominio específico antes de su despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DhruvalLabs/Qwen3.8-27B-FP8-GGUF
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta de cuantización quant-kit: https://github.com/DhruvalPtl/quant-kit
- Guía de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Artículo sobre ejecución local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
