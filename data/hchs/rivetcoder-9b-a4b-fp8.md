# HCHs/RivetCoder-9B-A4B-FP8

## Resumen

RivetCoder-9B-A4B-FP8 es una versión cuantizada en FP8 del modelo experimental de generación de código RivetCoder-9B-A4B, desarrollado por HCHs. Se trata de un modelo de arquitectura mixta (MoE) que combina un host congelado de LiquidAI/LFM2.5-2.6B con 16 candidatos FFN derivados de GLM en cada una de sus 30 capas, utilizando un enrutamiento Top-4 por token. El resultado es un modelo de aproximadamente 8,74 mil millones de parámetros totales, de los cuales solo unos 4,21 mil millones se activan por token, lo que permite una inferencia relativamente eficiente.

La versión FP8 ha sido cuantizada con TorchAO utilizando el esquema `Float8DynamicActivationFloat8WeightConfig` (E4M3) para las capas lineales compatibles, manteniendo en BF16 o FP32 los tensores sensibles a la precisión como embeddings, escalas residuales y logits del router. El modelo está orientado a tareas de generación de código y razonamiento, con soporte para inglés, coreano y código, y se distribuye bajo la licencia lfm-open-license-v1.0. Requiere cargarse con `trust_remote_code=True` y ha sido validado en una GPU RTX 5070 Ti con una asignación de VRAM de aproximadamente 8,4 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: host congelado LiquidAI/LFM2.5-2.6B + 16 FFN candidatos por capa (30 capas), enrutamiento Top-4 por token |
| Parametros totales | 8.738.040.892 (aprox. 8,74B) |
| Parametros activos | 4,21B (aprox.) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) para lineales compatibles; BF16/FP32 para embeddings, escalas y otros tensores sensibles |
| Idiomas soportados | en, ko, code |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | safetensors (5 shards), con código Triton opcional para serving rápido |

## Arquitectura y entrenamiento

La arquitectura de RivetCoder-9B-A4B-FP8 es experimental y está diseñada específicamente para código. Se compone de un modelo host congelado (LiquidAI/LFM2.5-2.6B) que actúa como base, sobre el cual se añaden 16 candidatos FFN derivados de GLM en cada una de las 30 capas. El enrutamiento es Top-4 por token, es decir, para cada token se seleccionan 4 de los 16 expertos disponibles, lo que reduce el coste computacional frente a un modelo denso equivalente. Esta estructura permite activar solo una fracción de los parámetros totales (4,21B de 8,74B).

No se dispone de información sobre el proceso de entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO). La versión FP8 es una cuantización posterior del modelo original, realizada con TorchAO, que conserva la arquitectura y los pesos cuantizados. El checkpoint incluye 1.636 parámetros con subclase de tensor FP8, que representan 8.475.574.272 elementos cuantizados. El router mantiene sus logits en FP32 para preservar la precisión del enrutamiento.

## Capacidades

- Generación de código en múltiples lenguajes, con soporte para razonamiento previo a la respuesta (el chat template abre un segmento de razonamiento antes de la respuesta final).
- Razonamiento multi-paso y resolución de problemas algorítmicos, como se muestra en el ejemplo de implementación de `merge_intervals` con tests.
- Capacidades multilingües limitadas a inglés, coreano y código.
- Soporte de tool calling / function calling: no se menciona explícitamente en la documentación, por lo que se considera no disponible.
- Soporte de agentes y multi-step reasoning: no se documenta, aunque el razonamiento encadenado sugiere cierta capacidad.
- Modo de razonamiento (thinking mode) integrado en el chat template, que genera una sección de razonamiento antes de la respuesta final.
- Runtime de serving rápido con Triton que agrupa los 16 expertos en dos GEMMs FP8 por capa, mejorando el throughput hasta 16x frente al path original de TorchAO.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar código, explicar algoritmos y sugerir correcciones en conversaciones multi-turno, gracias a su capacidad de razonamiento y su ventana de contexto (aunque la longitud exacta no está publicada).
- Generación de código en pipelines de CI/CD: su soporte para FP8 y el runtime de serving permiten integrarlo en entornos de integración continua para autocompletar o revisar código de forma automatizada.
- Resolución de problemas de algoritmia y entrevistas técnicas: el modelo puede razonar paso a paso y producir soluciones con tests, útil para plataformas de práctica o evaluación de candidatos.
- Chat técnico bilingüe (inglés-coreano): su soporte para ambos idiomas lo hace adecuado para equipos de desarrollo que trabajan en entornos multilingües.
- Despliegue en entornos con recursos limitados: al ser un MoE con solo 4,21B de parámetros activos y cuantización FP8, cabe en GPUs consumer de 8-12 GB, permitiendo inferencia local en estaciones de trabajo.
- Servidor de inferencia OpenAI-compatible: el repositorio incluye un servidor con microbatching que puede servir peticiones concurrentes, adecuado para prototipos o aplicaciones de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de latencia y throughput del runtime FP8 en una RTX 5070 Ti, que se resumen a continuación (mediciones locales de forward completo, no benchmarks estandarizados de generación):

| Runtime | Latencia (1 token) | Throughput relativo |
|---|---|---|
| Path original TorchAO | 4,894 s | 1,00x |
| Path rápido grouped/direct-FP8 | 0,304 s | 16,08x |

| Batch | Latencia forward | Secuencias/s |
|---|---:|---:|
| 1 | 0,337 s | 2,96 |
| 4 | 0,316 s | 12,65 |
| 8 | 0,340 s | 23,50 |
| 16 | 0,309 s | 51,71 |

Estos datos son de un forward de un token, no de generación completa, y sirven como indicación del rendimiento del runtime, no de la calidad del modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,4 GiB de asignación CUDA residente en FP8, validado en una RTX 5070 Ti (16 GB). Cabe en GPUs consumer con 8-12 GB de VRAM.
- GPU recomendadas: RTX 5070 Ti (usada en validación), otras GPUs NVIDIA con soporte CUDA 13.0 y SM 12.0 o superior. No se ha probado en otras arquitecturas.
- Opciones de despliegue: transformers con `trust_remote_code=True`, servidor OpenAI-compatible incluido (`serve.py`), runtime Triton opcional para aceleración. No se menciona soporte para vLLM, Ollama o llama.cpp.
- Latencia y throughput: el path rápido ofrece 0,304 s por forward de un token en batch 1, y hasta 51,71 secuencias/s en batch 16 (mediciones locales).
- Requisitos de software: PyTorch 2.12.0+cu130, Transformers 5.16.1, Accelerate 1.13.0, Safetensors 0.8.0, TorchAO 0.15.0. En Windows, el runtime Triton requiere Visual Studio 2022 C++ Build Tools.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares (por ejemplo, otros MoE de código de tamaño similar como DeepSeek-Coder-V2-Lite o Qwen2.5-Coder-7B). No se han publicado benchmarks estandarizados ni se conocen datos de rendimiento comparativo. Se recomienda evaluar el modelo directamente en el caso de uso objetivo.

## Limitaciones y advertencias

- Modelo experimental: la arquitectura y el código personalizado requieren `trust_remote_code=True`, lo que implica riesgos de seguridad y estabilidad en producción.
- Sesgos y alucinaciones: no se han documentado evaluaciones de sesgos; como todo modelo de lenguaje, puede generar código incorrecto o respuestas inventadas.
- Limitaciones de idioma: solo soporta inglés, coreano y código; no es adecuado para otros idiomas.
- Restricciones de licencia: la licencia lfm-open-license-v1.0 puede imponer condiciones específicas para uso comercial; se debe revisar el texto completo de la licencia antes de su uso.
- Incompatibilidad con `torch.inference_mode()`: en el stack probado, esta función produce un error con la subclase de tensor FP8 de TorchAO; se debe usar `torch.no_grad()`.
- Dependencia de versiones específicas: el modelo requiere un stack de software muy concreto (PyTorch 2.12, Transformers 5.16.1, TorchAO 0.15.0), lo que puede dificultar su integración en entornos existentes.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K u otros, por lo que no se puede evaluar su rendimiento relativo frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HCHs/RivetCoder-9B-A4B-FP8
- Modelo base: https://huggingface.co/HCHs/RivetCoder-9B-A4B
- Licencia: incluida en el repositorio (LICENSE)
