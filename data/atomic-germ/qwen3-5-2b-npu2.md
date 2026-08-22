# Atomic-Germ/Qwen3.5-2B-NPU2

## Resumen

Qwen3.5-2B-NPU2 es una adaptación del modelo base Qwen3.5-2B de Alibaba Cloud, publicada por el usuario Atomic-Germ en Hugging Face. El sufijo "NPU2" sugiere una variante optimizada para inferencia en unidades de procesamiento neuronal (NPU), típicamente orientada a dispositivos de borde, aunque el autor no detalla las modificaciones concretas respecto al modelo original. El modelo hereda las capacidades del Qwen3.5-2B-Base: una arquitectura híbrida que combina Gated Delta Networks con sparse Mixture-of-Experts, un encoder de visión integrado (pipeline image-text-to-text) y una ventana de contexto nativa de 262.144 tokens.

La relevancia de este modelo reside en su tamaño compacto (2 mil millones de parámetros) y su diseño eficiente para despliegue en hardware limitado, manteniendo un rendimiento competitivo frente a modelos de mayor escala. El modelo base Qwen3.5-2B destaca por su soporte multilingüe de 201 idiomas y por superar a Qwen3-1.7B en benchmarks de razonamiento y conocimiento. La versión de Atomic-Germ está pensada para prototipado, fine-tuning específico y escenarios de investigación, tal como se indica en la model card original, aunque la adaptación NPU podría orientarse a producción en dispositivos de Qualcomm.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Network + sparse Mixture-of-Experts + Vision Encoder |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no se especifica el número de parámetros activos del MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El Qwen3.5-2B-Base, sobre el que se construye esta adaptación, emplea una arquitectura híbrida que combina Gated Delta Networks con sparse Mixture-of-Experts (MoE). La configuración interna incluye 24 capas, con una dimensión oculta de 2048 y una estructura de 6 bloques repetidos donde cada bloque contiene tres subunidades de (Gated DeltaNet → FFN) seguidas de una subunidad de (Gated Attention → FFN). Los Gated DeltaNet usan 16 cabezas lineales de atención para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention emplea 8 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y embedding rotatorio de 64 dimensiones. El modelo incorpora además MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento se realizó en dos etapas: preentrenamiento y post-entrenamiento, con un enfoque de fusión temprana para tokens multimodales, alcanzando una eficiencia cercana al 100 % respecto al entrenamiento solo de texto. Se aplicó aprendizaje por refuerzo escalado en entornos de millones de agentes con distribuciones de tareas progresivamente complejas, lo que mejora la generalización a escenarios reales. La capa de salida está atada al embedding de tokens (248.320 tokens con padding).

## Capacidades

- Generación de texto y razonamiento avanzado: supera a Qwen3-1.7B en MMLU-Pro (55.3 frente a 40.2) y MMLU-Redux (69.2 frente a 64.4).
- Comprensión visual multimodal: el encoder de visión integrado permite procesar y razonar sobre imágenes, con rendimiento comparable al de modelos Qwen3-VL.
- Generación de código y agentes: soporta tareas de programación y razonamiento multi-paso, aunque no se detalla tool calling específico en la model card.
- Capacidades multilingües: cobertura de 201 idiomas y dialectos, con comprensión cultural y regional.
- Modo de razonamiento dual: aunque la model card no lo especifica explícitamente, los benchmarks se presentan en modo "Instruct (Non-Thinking)"; el modelo base de Qwen3.5 soporta modos thinking y non-thinking.
- Eficiencia para despliegue en dispositivos: optimizado para inferencia en NPU según la variante NPU2, con baja latencia y coste de memoria.

## Casos de uso

- **Asistente móvil multimodal**: al ser un modelo de 2B con encoder de visión y soporte para NPU, se puede integrar en aplicaciones de smartphone para responder preguntas sobre fotos o documentos escaneados, con latencia de on-device y sin conexión a la nube.
- **Automatización de atención al cliente en dispositivos de borde**: su contexto de 262K tokens permite mantener conversaciones largas y con historial extenso, gestionando interacciones de soporte en el propio dispositivo, reduciendo costes de servidor y mejorando la privacidad.
- **Prototipado de agentes de razonamiento**: gracias a su rendimiento en MMLU-Pro y su capacidad de razonamiento multi-step, es adecuado para probar pipelines de agentes con llamadas a herramientas antes de escalar a modelos más grandes.
- **Traducción y localización multilingüe**: con soporte para 201 idiomas, puede desplegarse en entornos de traducción automática en tiempo real en dispositivos con recursos limitados, como asistentes de viaje o intérpretes de bolsillo.
- **Generación de código asistida en entornos de desarrollo**: su capacidad de programación (aunque no se publica HumanEval en la tabla) permite su uso en IDE o extensiones de editor que requieran ejecución local y privada, sin depender de APIs externas.
- **Análisis de documentos en producción**: al combinar visión y texto, puede extraer información de formularios, facturas o documentos escaneados en kioscos o puntos de venta, donde la latencia y la privacidad son críticas.

## Benchmarks y rendimiento

La model card del modelo base Qwen3.5-2B reporta los siguientes resultados en modo "Instruct (Non-Thinking)", comparados con Qwen3-4B-2507 y Qwen3-1.7B:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B |
|---|---|---|---|
| MMLU-Pro | 69.6 | 40.2 | 55.3 |
| MMLU-Redux | 84.2 | 64.4 | 69.2 |
| C-Eval | 80.2 | 61.0 | 65.2 |

No se han publicado resultados específicos para la variante Atomic-Germ/Qwen3.5-2B-NPU2. Los datos corresponden al modelo base sin modificaciones adicionales por parte del autor de la ficha.

## Requisitos de hardware

- **VRAM estimada**: para 2B parámetros en FP16 se requieren aproximadamente 4 GB de memoria; en INT8, ~2 GB. El tamaño del repositorio es de 7.1 GB, lo que sugiere pesos en FP16 con los archivos de configuración adicionales.
- **GPU recomendadas**: el modelo es adecuado para GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores. También puede ejecutarse en Apple Silicon con suficiente memoria unificada.
- **Compatibilidad NPU**: la variante "NPU2" apunta a unidades de procesamiento neuronal de Qualcomm (Hexagon NPU) o similares, como se refleja en su presencia en Qualcomm AI Hub, lo que permite despliegue en dispositivos móviles de gama alta.
- **Opciones de despliegue**: compatible con vLLM, SGLang, KTransformers y llama.cpp (por su formato safetensors). Disponible también en Ollama como `qwen3.5:2b`.
- **Latencia y throughput**: no se dispone de cifras concretas para esta variante; el modelo base está diseñado para alta eficiencia en throughput gracias a la arquitectura Gated Delta + MoE, con latencia mínima en NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | C-Eval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 2B | 262K | 55.3 | 69.2 | 65.2 | Apache 2.0 |
| Qwen3-1.7B | 1.7B | 131K | 40.2 | 64.4 | 61.0 | Apache 2.0 |
| Qwen3-4B-2507 | 4B | 262K | 69.6 | 84.2 | 80.2 | Apache 2.0 |

El modelo ofrece un rendimiento intermedio entre Qwen3-1.7B y Qwen3-4B-2507, con una ventaja notable en MMLU-Pro (+15 puntos sobre 1.7B) y un contexto de 262K tokens, igual al de la versión de 4B. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se documentan sesgos específicos para esta variante, pero el modelo base de Qwen3.5 puede presentar alucinaciones en tareas de razonamiento complejo o cuando se le pide información factual no presente en sus datos de entrenamiento.
- **Rendimiento no verificado**: los benchmarks citados provienen de la model card del modelo base, no de la adaptación NPU2. Es posible que la cuantización o la optimización para NPU degraden ligeramente el rendimiento en tareas exigentes.
- **Contexto largo**: aunque la ventana es de 262K tokens, el uso de contextos muy largos puede aumentar la latencia y el consumo de memoria, especialmente en dispositivos NPU con RAM limitada.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero hay que verificar que los pesos del modelo base no incluyan cláusulas adicionales; en este caso, la model card original de Qwen3.5-2B indica Apache 2.0, así que no hay restricciones conocidas.
- **Soporte de tool calling**: no se confirma explícitamente en la documentación; se recomienda probar la capacidad de function calling antes de integrarla en pipelines de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.5-2B-NPU2
- Modelo base Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_5_2b
- GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Ollama: https://ollama.com/library/qwen3.5:2b
