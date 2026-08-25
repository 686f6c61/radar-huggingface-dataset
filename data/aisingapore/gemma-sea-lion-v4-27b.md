# aisingapore/Gemma-SEA-LION-v4-27B

## Resumen

Gemma-SEA-LION-v4-27B es un modelo de lenguaje multilingüe desarrollado por AI Singapore, resultado de un proceso de continued pre-training sobre el modelo base Google Gemma 3 27B IT. El objetivo es mejorar el rendimiento del modelo en once lenguas del Sudeste Asiático: birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita. Para ello se utilizaron aproximadamente 500.000 millones de tokens muestreados de un pool de más de un billón de tokens procedentes de fuentes abiertas, incluyendo datos web, código, datasets públicos y datos sintéticos.

El modelo hereda todas las capacidades de Gemma 3: una ventana de contexto de 128K tokens, comprensión de imágenes y texto (visión), function calling y salidas estructuradas. Al tratarse de un fine-tuning únicamente sobre el backend de texto, las capacidades de visión se mantienen al nivel del modelo original sin mejoras adicionales. Con 27.432 millones de parámetros, se posiciona como una alternativa de tamaño medio-alto para aplicaciones multilingües centradas en el Sudeste Asiático, con licencia Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3) con atención global y por ventanas deslizantes, multimodal (texto e imagen) |
| Parametros totales | 27.432.406.640 (27,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en bf16; existe una variante NVFP4 del modelo IT, no de este base) |
| Idiomas soportados | Birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita (además de las lenguas soportadas por Gemma 3, más de 100) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un decoder transformer con atención por ventanas deslizantes combinada con atención global en capas específicas, y capacidades multimodales que procesan tanto texto como imágenes. El proceso de entrenamiento consistió en continued pre-training sobre el checkpoint instruct de Gemma 3 27B, utilizando aproximadamente 500.000 millones de tokens. La mezcla de datos se diseñó experimentalmente para optimizar el rendimiento en lenguas del Sudeste Asiático, con una distribución que incluye un 10% de código (StarCoder versión OLMo 2), un 40% de inglés (Fineweb-Edu, DCLM-OLMo2-HQ y Non-CC-EN), un 9% de chino (SEA-LION Pile v1 y Fineweb2) y el resto repartido entre las demás lenguas SEA. No se aplicó ninguna fase de alineamiento adicional (RLHF o DPO) sobre este modelo base; la versión instruct (Gemma-SEA-LION-v4-27B-IT) se publica por separado.

## Capacidades

- Generación de texto y razonamiento multilingüe en once lenguas del Sudeste Asiático, con especial énfasis en tareas de comprensión y generación en dichas lenguas.
- Comprensión de imágenes y texto: herencia de Gemma 3, incluyendo comprensión de documentos, respuesta visual a preguntas (visual Q&A) y razonamiento basado en imágenes.
- Function calling y salidas estructuradas: soporte para integración en sistemas más grandes mediante llamadas a herramientas y generación de JSON estructurado.
- Ventana de contexto de 128K tokens, que permite procesar documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingües amplias: además de las lenguas SEA, conserva el soporte de más de 100 lenguas del modelo base Gemma 3.
- No incluye modo de pensamiento explícito (thinking mode) ni capacidades de audio; se limita a texto e imagen.

## Casos de uso

- Atención al cliente automatizada en lenguas del Sudeste Asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, tailandés, vietnamita u otras lenguas SEA, aprovechando su contexto de 128K para mantener el historial completo de la interacción y su soporte de function calling para consultar bases de datos o sistemas de ticketing.
- Generación de código con soporte multilingüe: gracias al entrenamiento con datos de código (StarCoder) y al function calling heredado de Gemma 3, puede integrarse en pipelines de desarrollo para generar, revisar o documentar código en entornos donde los comentarios y la documentación se requieren en lenguas locales.
- Análisis de documentos con visión: al conservar las capacidades multimodales de Gemma 3, puede extraer información de facturas, formularios o contratos escaneados en lenguas SEA, combinando OCR con razonamiento textual.
- Traducción automática y localización: adecuado para traducir contenido entre inglés y las lenguas del Sudeste Asiático, o entre lenguas SEA entre sí, gracias a su entrenamiento específico en esas lenguas.
- Asistentes virtuales para administración pública: organismos gubernamentales de países como Singapur, Malasia o Indonesia pueden desplegar asistentes que respondan en la lengua local con conocimiento del contexto regional, usando la ventana de 128K para manejar normativas y documentos extensos.
- Sistemas de recomendación y análisis de sentimiento en redes sociales: el modelo puede procesar grandes volúmenes de texto en lenguas SEA para extraer opiniones, tendencias o clasificar contenido, aprovechando su capacidad multilingüe y su contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona que la versión instruct (Gemma-SEA-LION-v4-27B-IT) "sobresale en tareas SEA en comparación con otros modelos abiertos de menos de 200 mil millones de parámetros", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estándar para este modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 54,9 GB (según el tamaño del repositorio), por lo que se necesitan al menos 60 GB de VRAM para cargarlo sin cuantizar. Con cuantización de 4 bits (no publicada oficialmente, pero posible mediante herramientas como llama.cpp o GPTQ), la huella se reduce a unos 16-18 GB.
- GPU recomendadas: para inferencia en bf16 se requieren GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (aunque esta última no tendría suficiente para el modelo completo en bf16). Con cuantización 4 bits, una RTX 4090 (24GB) o RTX 3090 (24GB) podría ser suficiente.
- En consumer GPU: sí, pero únicamente con cuantización agresiva (4 bits o menos). Sin cuantizar, no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, TGI (Text Generation Inference), llama.cpp y Ollama (si se generan los GGUF correspondientes). También existe una variante NVFP4 del modelo IT que puede usarse con TGI en GPUs NVIDIA.
- Latencia y throughput: no se han publicado datos específicos. Como referencia orientativa, un modelo de 27B en bf16 en una A100 80GB suele generar entre 20 y 40 tokens por segundo con vLLM, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B | 27,4B | 128K | 11 lenguas SEA + 100+ | Gemma Terms | Hugging Face |
| Google Gemma 3 27B IT | 27,4B | 128K | 100+ | Gemma Terms | Hugging Face |
| Qwen2.5 32B | 32,5B | 128K | Multilingüe (incluye chino, inglés) | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8B | 128K | Multilingüe (inglés, español, francés, etc.) | Llama 3.1 Community License | Hugging Face |

La comparativa se centra en modelos de tamaño similar. Gemma-SEA-LION-v4-27B se diferencia de Gemma 3 27B IT por su entrenamiento adicional en lenguas del Sudeste Asiático, lo que debería mejorar el rendimiento en esas lenguas a costa de un posible ligero olvido catastrófico en otras tareas. Frente a Qwen2.5 32B, ofrece mejor cobertura de lenguas SEA específicas (birmano, jemer, lao, tagalo, tamil) que Qwen no cubre con la misma profundidad. Llama 3.1 8B es una alternativa más ligera pero con menor capacidad multilingüe en lenguas SEA.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad: la model card indica explícitamente que no se ha realizado fine-tuning de seguridad, por lo que los desarrolladores deben aplicar sus propias medidas de alineamiento antes de usarlo en producción.
- Riesgo de alucinación: como muchos LLMs, puede generar contenido ficticio o irrelevante no fundamentado en el contexto proporcionado. No se ha probado su robustez frente a prompting adversarial.
- Capacidades de visión no mejoradas: al haberse realizado continued pre-training solo sobre el backend de texto, las capacidades multimodales son las mismas que las de Gemma 3 27B IT, sin mejoras ni diferencias significativas.
- Restricciones de licencia: la licencia Gemma Terms of Use de Google impone condiciones específicas para uso comercial, incluyendo restricciones sobre el tamaño de la organización y la obligación de no utilizar el modelo para ciertos fines prohibidos. Es necesario revisar los términos completos antes de un despliegue comercial.
- Cobertura lingüística limitada a 11 lenguas SEA: aunque hereda el multilingüismo de Gemma 3, el entrenamiento adicional se centra en esas lenguas, por lo que el rendimiento en otras lenguas puede verse ligeramente afectado respecto al modelo base.
- Tamaño del modelo: con 27,4B parámetros, requiere hardware de gama alta para inferencia sin cuantizar, lo que puede limitar su despliegue en entornos con recursos restringidos.

## Enlaces

- Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B
- Repositorio GitHub SEA-LION: https://github.com/aisingapore/sealion.git
- Documentación oficial SEA-LION: https://docs.sea-lion.ai/models/sea-lion-v4/gemma-sea-lion-v4-27b
- Modelo base Google Gemma 3 27B IT: https://huggingface.co/google/gemma-3-27b-it
- Variante instruct del modelo: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT
- Variante NVFP4 del modelo instruct: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-NVFP4
