# amd/Nemotron-3.5-Lightning-30B-A3B-BF16_gpuep_1.0_gpu_128

## Resumen

Nemotron-3.5-Lightning-30B-A3B-BF16_gpuep_1.0_gpu_128 es una conversión optimizada del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por AMD para su despliegue sobre hardware AMD Ryzen AI mediante el runtime onnxruntime-genai. Se trata de una arquitectura Mixture-of-Experts (MoE) de 30 mil millones de parámetros totales con aproximadamente 3 mil millones de parámetros activos por token, derivada del modelo base de NVIDIA y cuantizada en INT4 para reducir los requisitos de memoria.

La relevancia de esta ficha radica en que no es un modelo nuevo, sino un artefacto de despliegue: AMD aplica una estrategia de cuantización específica (RTN con grupo 32, activaciones FP16, pesos INT4, expertos MoE en QMoE INT4 con block size 32 y expertos compartidos en INT4 MatMulNBits) y lo empaqueta en formato ONNX para su ejecución con aceleración en GPUs integradas de la familia Ryzen AI. El repositorio ocupa 17,8 GB, un tamaño coherente con pesos INT4 de un modelo de 30B.

El modelo está orientado exclusivamente a generación de texto (decoder text-only, sin componentes de visión ni embeddings multimodales) y declara únicamente el idioma inglés. Es una opción interesante para desarrolladores que quieran ejecutar un MoE grande en entornos de PC con aceleración NPU/GPU integrada, aunque la información pública sobre el modelo base y sus capacidades es limitada en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), decoder text-only |
| Parametros totales | 30B (según nombre del modelo) |
| Parametros activos | ~3B (según nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (RTN, grupo 32, activaciones FP16); expertos MoE QMoE INT4 block size 32; expertos compartidos INT4 MatMulNBits |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (modelo base); modificaciones AMD bajo MIT |
| Formato de pesos | ONNX (onnxruntime-genai) |

## Arquitectura y entrenamiento

Esta conversión no incluye información sobre el entrenamiento del modelo base. Por los metadatos disponibles, el modelo original sigue una arquitectura Mixture-of-Experts con 30B parámetros totales y aproximadamente 3B activos por token, lo que permite un coste computacional por token mucho menor que un modelo denso equivalente. El artefacto de AMD es un decoder text-only: la model card indica explícitamente que no incluye componentes de visión ni de embedding multimodal.

La innovación técnica de esta versión es el pipeline de despliegue: AMD ha aplicado cuantización post-entrenamiento con RTN (Round-To-Nearest) en grupos de 32, manteniendo activaciones en FP16 y pesos en INT4, con tratamiento diferenciado para los expertos MoE (QMoE INT4) y los expertos compartidos (MatMulNBits INT4). El resultado se empaqueta en ONNX para su ejecución con onnxruntime-genai y aceleración HIP-EP en hardware AMD. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado (text-generation, conversational).
- Razonamiento y generación de código: capacidades heredadas del modelo base NVIDIA, no verificadas en esta conversión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; la model card confirma que es text-only sin componentes de visión.
- Ejecución acelerada en hardware AMD Ryzen AI mediante onnxruntime-genai.

## Casos de uso

- Asistente conversacional local en PC con Ryzen AI: el modelo puede ejecutarse en formato ONNX con aceleración de GPU integrada, ofreciendo generación de texto en inglés sin depender de la nube, gracias a su cuantización INT4 que reduce la huella de memoria.
- Generación de texto en aplicaciones de escritorio: integrable mediante onnxruntime-genai en aplicaciones nativas que necesiten un modelo de lenguaje embebido con un MoE eficiente en cómputo por token.
- Prototipado de pipelines de razonamiento en inglés: útil para desarrolladores que quieran experimentar con un MoE de 30B en hardware de consumo antes de escalar a infraestructura mayor.
- Procesamiento por lotes de texto en entornos con recursos limitados: el bajo número de parámetros activos (~3B) reduce el coste por token frente a modelos densos de tamaño similar.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de calidad de INT4 frente a BF16 en el modelo base NVIDIA.
- Despliegue en entornos Windows/Linux con NPU/GPU AMD: escenario natural para el que AMD ha optimizado este artefacto, especialmente en equipos con Ryzen AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,8 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos INT4; con overhead de runtime, se recomienda 20-24 GB de memoria unificada o dedicada.
- GPU recomendadas: hardware AMD Ryzen AI con GPU integrada compatible con HIP-EP y onnxruntime-genai; no se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: el tamaño de 17,8 GB sugiere que puede caber en equipos con memoria unificada de 24 GB o más, pero no hay confirmación oficial para GPUs NVIDIA consumer.
- Opciones de despliegue: onnxruntime-genai (runtime declarado); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están soportadas por este formato ONNX específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AMD Nemotron-3.5-Lightning-30B-A3B (esta ficha) | 30B | ~3B | no disponible | openmdw-1.1 / MIT (mods) | ONNX INT4 |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 30B | ~3B | no disponible | openmdw-1.1 | BF16 |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta conversión y el modelo base ni con otras alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se garantiza calidad en castellano ni otros idiomas.
- Es una conversión cuantizada en INT4: puede presentar degradación de calidad respecto al modelo base BF16, especialmente en tareas de razonamiento complejo o generación de código.
- No incluye capacidades multimodales (sin visión ni audio); es un decoder text-only.
- La licencia del modelo base es OpenMDW 1.1, con condiciones específicas que deben revisarse antes de uso comercial; las modificaciones de AMD se distribuyen bajo MIT, pero el uso del modelo derivado sigue sujeto a la licencia del base.
- El formato ONNX con onnxruntime-genai limita la portabilidad: no es directamente utilizable en vLLM, llama.cpp u otros runtimes habituales.
- No hay información pública sobre sesgos, tasa de alucinación ni evaluación de seguridad para esta conversión.
- Las fechas de creación (2026-10-28) y actualización (2026-11-24) indican un artefacto reciente con solo 73 descargas, por lo que la validación comunitaria es mínima.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Nemotron-3.5-Lightning-30B-A3B-BF16_gpuep_1.0_gpu_128
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: no disponible como enlace directo en la información proporcionada
- Documentación de onnxruntime-genai: no disponible en la información proporcionada
- Paper o blog de AMD sobre Olive Mobius Builder: no disponible en la información proporcionada
