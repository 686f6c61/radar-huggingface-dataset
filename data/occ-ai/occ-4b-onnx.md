# occ-ai/OCC-4B-ONNX

## Resumen

OCC-4B-ONNX es la distribución en formato ONNX del modelo OCC-4B, un ajuste fino (fine-tune) de Qwen3.5-4B orientado a tareas de asistente multi-turno y uso de herramientas (tool use). Lo desarrolla occ-ai y se publica bajo licencia Apache 2.0. La variante ONNX está pensada para ejecutarse en el navegador o en Node.js mediante Transformers.js 4.3.2, con soporte de WebGPU, y acepta entradas de texto e imagen para generar texto (pipeline image-text-to-text).

El modelo conserva la arquitectura del Qwen3.5-4B base, con aproximadamente 4 mil millones de parámetros, un decodificador transformer y un codificador de visión compartido. El repositorio incluye varias cuantizaciones (FP16, Q8, Q4, Q4F16 y Q4F32) con el objetivo de reducir el peso en memoria y permitir su despliegue en entornos con recursos limitados, como navegadores o dispositivos de consumo.

Su relevancia actual radica en la combinación de capacidades multimodales (texto e imagen), soporte de tool calling y un modo de razonamiento opcional (thinking), todo empaquetado en ONNX para inferencia en el cliente. Esto lo hace útil para aplicaciones web que necesitan procesamiento local sin depender de servidores externos, aunque la información pública disponible sobre su entrenamiento y rendimiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B), con decodificador y codificador de visión |
| Parámetros totales | ~4B (heredados de Qwen3.5-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16, Q8, Q4, Q4F16, Q4F32 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (decoder_model_merged, embed_tokens, vision_encoder_fp16) |

## Arquitectura y entrenamiento

OCC-4B-ONNX es una conversión a ONNX de OCC-4B, que a su vez es un fine-tune de Qwen3.5-4B. La arquitectura subyacente es un transformer con decodificador autorregresivo y un codificador de visión que permite procesar imágenes junto con texto. El repositorio ONNX separa los componentes en tres grafos: el decodificador combinado (`decoder_model_merged`), los embeddings de tokens (`embed_tokens`) y un codificador de visión compartido en FP16 (`vision_encoder_fp16`). La variante Q4F32 almacena los pesos lineales en 4 bits pero mantiene la proyección de salida en FP32.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el ajuste fino. La model card menciona que OCC-4B está optimizado para tareas de asistente multi-turno y uso de herramientas, pero no detalla la innovación técnica concreta del entrenamiento. El modo thinking es opcional y se activa pasando `enable_thinking: true` a la plantilla de chat.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes junto con texto (image-text-to-text).
- Soporte de tool calling / function calling, según la descripción del modelo base.
- Modo de razonamiento opcional (thinking) activable mediante la plantilla de chat.
- Ejecución en navegador o Node.js mediante Transformers.js 4.3.2 con WebGPU.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Asistentes conversacionales en el navegador: el modelo puede gestionar diálogos multi-turno directamente en el cliente mediante Transformers.js y WebGPU, sin enviar datos a un servidor externo, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Análisis de imágenes en aplicaciones web: al aceptar entradas image-text-to-text, puede describir o responder preguntas sobre imágenes cargadas por el usuario, integrándose en herramientas de accesibilidad o edición.
- Automatización de tareas con tool calling: el modelo puede invocar funciones o APIs definidas por el desarrollador, lo que permite construir agentes ligeros que ejecutan acciones concretas (consultas, cálculos, etc.) desde el navegador.
- Prototipado rápido de aplicaciones de IA locales: su formato ONNX y sus múltiples cuantizaciones permiten probar funcionalidades de IA generativa en entornos de desarrollo sin infraestructura de GPU dedicada.
- Educación y demos interactivas: al ejecutarse en el cliente, es adecuado para tutoriales o demos que muestran modelos multimodales sin coste de servidor.
- Procesamiento de documentos con imágenes: puede combinarse con OCR o extracción de texto para responder preguntas sobre capturas o documentos escaneados en aplicaciones de escritorio o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~4B, la variante FP16 requeriría aproximadamente 8 GB, Q8 unos 4-5 GB y Q4 unos 2-3 GB, aunque estas cifras son estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas: no especificadas; el modelo está orientado a WebGPU en navegador, por lo que se beneficia de GPUs con soporte de `shader-f16`.
- Compatibilidad con GPU de consumo: probable en GPUs de consumo con suficiente memoria para la cuantización elegida, pero no confirmado oficialmente.
- Opciones de despliegue: Transformers.js 4.3.2 (principal), con soporte de WebGPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| OCC-4B-ONNX | ~4B | no disponible | Sí (imagen-texto) | Apache 2.0 | ONNX |
| Qwen3.5-4B | ~4B | no disponible | no disponible | no disponible | no disponible |
| Otros fine-tunes de Qwen3.5-4B | ~4B | no disponible | variable | variable | variable |

No se dispone de información suficiente para una comparativa detallada con alternativas concretas.

## Limitaciones y advertencias

- No hay información pública sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas.
- Longitud de contexto e idiomas soportados no documentados, lo que dificulta planificar su uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B.
- El despliegue en navegador depende de WebGPU y del soporte de `shader-f16`, lo que limita la compatibilidad a navegadores y dispositivos recientes.
- El repositorio tiene 25,2 GB y requiere descargar únicamente los archivos de la variante seleccionada para evitar transferencias innecesarias.
- No se han publicado benchmarks ni métricas de latencia, por lo que el rendimiento real en producción es incierto.

## Enlaces

- [Hugging Face: occ-ai/OCC-4B-ONNX](https://huggingface.co/occ-ai/OCC-4B-ONNX)
- [Modelo base: occ-ai/OCC-4B](https://huggingface.co/occ-ai/OCC-4B)
- [Informe técnico (PDF)](https://github.com/optimal-cognitive-core/OCC/blob/main/OCC_Technical_Report.pdf)
- [Repositorio GitHub](https://github.com/optimal-cognitive-core/OCC)
