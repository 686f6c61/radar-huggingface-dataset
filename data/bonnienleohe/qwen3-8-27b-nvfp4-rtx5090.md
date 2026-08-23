# bonnienleohe/Qwen3.8-27B-NVFP4-RTX5090

## Resumen

Qwen3.8-27B-NVFP4-RTX5090 es un checkpoint cuantizado del modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario bonnienleohe y publicado en Hugging Face. Su objetivo principal es permitir ejecutar el modelo completo de 27B parámetros con su contexto nativo de 262.144 tokens en una única tarjeta gráfica GeForce RTX 5090 de 32 GB, algo que otras cuantizaciones NVFP4 no logran por el excesivo consumo de memoria de sus pesos y cache.

La cuantización se realiza mediante NVIDIA Model Optimizer en formato NVFP4 W4A4 con grupo de tamaño 16 y cache de claves y valores en FP8. El resultado es un peso de aproximadamente 17.1 GB en VRAM, que permite un contexto completo de 262k tokens con una utilización de memoria del 97% en vLLM. Es relevante ahora porque acerca la ejecución local de modelos de razonamiento multimodal de gama alta a hardware de consumo de última generación, con velocidades de decodificación que duplican a las alternativas existentes para la misma tarjeta.

El modelo está pensado para desarrolladores que necesiten desplegar agentes de código, visión y razonamiento en un solo nodo sin depender de infraestructura cloud, y viene acompañado de un drafter especulativo (DSpark) que aumenta la velocidad de decodificación hasta los 180.3 tokens por segundo. Su licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, hybrid attention: 16 capas full attention + 48 capas linear attention) |
| Parametros totales | 14.982.247.152 (según metadatos safetensors del checkpoint cuantizado; el modelo base tiene 27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16), KV cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, ~18.8 GB en disco) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` pertenece a la familia Qwen3.8, que emplea una arquitectura híbrida de atención: de las 64 capas totales, solo 16 usan atención completa (intervalo `full_attention_interval: 4`), mientras que las otras 48 usan atención lineal con un estado recurrente constante. Esta mezcla reduce el coste computacional en contextos largos sin sacrificar la capacidad de razonamiento.

Este checkpoint específico no es un modelo entrenado desde cero, sino un derivado cuantizado con NVIDIA Model Optimizer. La cuantización se realiza en NVFP4 (formato de 4 bits de punto flotante) con grupos de 16 elementos y cache KV en FP8. El proceso de calibración y exportación aún está en ajuste según el autor, y se espera que las próximas versiones del repositorio sean más precisas y rápidas sobre la misma envolvente de hardware. No se han publicado datos sobre el dataset de calibración ni sobre procesos de RLHF o DPO adicionales al modelo base.

## Capacidades

- Razonamiento y modo "thinking": hereda el sistema de razonamiento de Qwen3.8, con niveles de esfuerzo configurables (`xhigh`, `medium`, `low`). El nivel `xhigh` es el más eficiente en este checkpoint (245 tokens de salida media con 12/12 aciertos en pruebas internas).
- Visión: el pipeline es `image-text-to-text`, por lo que puede procesar imágenes y texto simultáneamente, manteniendo el comportamiento del modelo base.
- Tool calling y agentes: soporta llamada a funciones mediante el parser `qwen3_xml`. En la prueba del autor, completó 5 de 5 llamadas a herramientas, frente a 2 de 5 de la cuantización alternativa.
- Contexto largo nativo: soporta hasta 262.144 tokens de contexto en una sola RTX 5090, con capacidad de completar prompts de hasta 242.686 tokens.
- Decodificación especulativa: compatible con el drafter `Qwen3.8-27B-DSpark-NVFP4`, que aumenta la velocidad de decodificación de 88.5 a 180.3 tokens/s sin cambiar las salidas.

## Casos de uso

- Agentes de programación en repositorios completos: gracias a los 262.144 tokens de contexto, el modelo puede analizar y modificar un repositorio completo de código sin necesidad de fragmentación. Se integraría en un pipeline de CI/CD con vLLM y el parser de herramientas para ejecutar tareas de refactorización o generación de tests sobre el código fuente.
- Análisis de documentos extensos: ideal para procesar contratos, libros técnicos o informes anuales de cientos de páginas en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas sin perder el hilo del documento.
- Razonamiento multimodal en local: al mantener la capacidad de visión del modelo base, puede analizar imágenes médicas o de diseño industrial directamente en una estación de trabajo con RTX 5090, sin enviar datos a la nube.
- Automatización de tareas con herramientas: con el soporte de tool calling (5/5 aciertos en pruebas), se puede integrar en sistemas de automatización que necesiten consultar APIs, bases de datos o ejecutar scripts de forma autónoma.
- Servidor de inferencia para desarrollo local: con vLLM 0.27.x y la configuración recomendada, sirve como backend de alta velocidad para aplicaciones de chat y agentes en entornos de desarrollo, con latencia de primer token (TTFT) de 8.52 segundos en contextos de ~62k tokens.
- Investigación en razonamiento: su capacidad de variar el esfuerzo de razonamiento permite experimentar con el equilibrio entre latencia y precisión en tareas de matemáticas y ciencias, usando el modo `thinking` activado o desactivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales completos. El autor proporciona una prueba de humo (smoke test) con 20 ítems por tarea en GPQA Diamond, AIME 2025 y MMLU-Pro, comparada con la cuantización alternativa de Unsloth. Estos datos no deben considerarse puntuaciones publicadas, sino una indicación preliminar de calidad.

| Tarea | Este checkpoint | Unsloth NVFP4 | Δ |
|---|---|---|---|
| GPQA Diamond | 13/20 (65%) | 14/20 (70%) | −1 |
| AIME 2025 | 15/20 (75%) | 14/20 (70%) | +1 |
| MMLU-Pro | 17/20 (85%) | 17/20 (85%) | 0 |
| **Global** | **45/60 (75%)** | **45/60 (75%)** | **0** |

En cuanto a velocidad de decodificación, el modelo alcanza 88.5 tok/s solo y 180.3 tok/s con el drafter DSpark, frente a los 42.4 tok/s de Unsloth en la misma GPU. El TTFT en contexto de ~62k tokens es de 8.52 segundos.

## Requisitos de hardware

- GPU: GeForce RTX 5090 (32 GB VRAM, arquitectura Blackwell sm_120). Los tensor cores Blackwell son imprescindibles; una Hopper puede cargar los archivos pero no ejecutar NVFP4.
- VRAM estimada: 17.1 GB para los pesos, más la cache KV FP8. Con `gpu-memory-utilization 0.97` se alcanza el contexto completo de 262.144 tokens.
- No cabe en GPUs de consumo anteriores (RTX 4090, 3090) por la falta de soporte NVFP4 en su hardware.
- Opciones de despliegue: vLLM 0.27.x (recomendado) con `--quantization modelopt` y `--kv-cache-dtype fp8`. También se menciona SGLang como alternativa en otros repositorios, aunque las cifras de velocidad se obtienen con vLLM.
- Latencia y throughput: decodificación de 80.6 tok/s a 88.5 tok/s según configuración; con drafter alcanza 180.3 tok/s. El primer arranque requiere compilación JIT de kernels FlashInfer SM120 FP4, que necesita `nvcc` y CUDA 13 headers.

## Comparativa con modelos similares

| Característica | Qwen3.8-27B-NVFP4-RTX5090 | Unsloth Qwen3.8-27B-NVFP4 | Qwen3.8-27B (base BF16) |
|---|---|---|---|
| Parámetros | 27B (base) / 14.98B (cuantizado) | 27B (base) | 27B |
| Peso en VRAM | 17.1 GB | 22.7 GB | ~53 GB |
| Contexto nativo en RTX 5090 | 262.144 tokens | ~77.184 tokens | no ejecutable |
| Decodificación (RTX 5090) | 88.5 tok/s (180.3 con drafter) | 42.4 tok/s | no ejecutable |
| TTFT (~62k tokens) | 8.52 s | 11.08 s | no ejecutable |
| Tool calling (prueba) | 5/5 | 2/5 | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

## Limitaciones y advertencias

- Requiere hardware específico Blackwell (RTX 5090). No funciona en GPUs Hopper ni en tarjetas de consumo anteriores, lo que limita su uso a un público muy concreto.
- Los resultados de precisión provienen de una prueba de humo de 20 ítems por tarea, no de evaluaciones estándar completas. No deben interpretarse como puntuaciones oficiales de GPQA, AIME o MMLU-Pro.
- El autor indica que la calibración y exportación aún se están ajustando, por lo que las próximas versiones del checkpoint podrían diferir en precisión y velocidad.
- Se han observado errores de truncamiento por longitud en el modo thinking, donde el modelo llena el límite de tokens de generación y el extractor de respuesta devuelve `None`. Esto afecta a ambos checkpoints comparados.
- El uso de `gpu_memory_utilization 0.97` deja muy poco margen de VRAM para otras aplicaciones en el sistema; se recomienda cerrar procesos que consuman memoria.
- No se proporcionan datos sobre sesgos, idiomas soportados ni comportamiento en dominios específicos, ya que no están disponibles en la documentación publicada.

## Enlaces

- Hugging Face: https://huggingface.co/bonnienleohe/Qwen3.8-27B-NVFP4-RTX5090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DSpark: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4
- Cuantización alternativa (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Repositorio de configuración de servidor: https://github.com/adrienbrault/qwen3.8-27b-rtx5090
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Guía de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Artículo de despliegue local (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
