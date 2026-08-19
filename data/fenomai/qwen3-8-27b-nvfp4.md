# FenomAI/Qwen3.8-27B-NVFP4

## Resumen

FenomAI/Qwen3.8-27B-NVFP4 es una cuantización NVFP4 del modelo Qwen3.8-27B, realizada por FenomAI utilizando la tecnología Unsloth Dynamic V3.0 (preview). Qwen3.8-27B es un modelo denso de 27B parámetros desarrollado por Alibaba, con arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), e incorpora un encoder de visión para procesar imágenes y vídeo. El modelo original soporta un contexto nativo de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE.

La cuantización NVFP4 reduce el tamaño de los pesos y acelera la inferencia en hardware NVIDIA, especialmente en GPUs de arquitectura Blackwell y posteriores, manteniendo una calidad cercana a la versión completa. Esta versión cuantizada está pensada para despliegue local y producción en entornos con recursos limitados, aprovechando la compatibilidad con motores como vLLM y llama.cpp. El repositorio tiene 23,4 GB y el checkpoint en safetensors contiene 19 869 895 952 parámetros, lo que refleja la compresión aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención clásica) con encoder de visión |
| Parametros totales | 27B (modelo base); checkpoint cuantizado con 19 869 895 952 parámetros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | NVFP4 (4-bit MLP + 8-bit attention + FP8 KV cache) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura de 64 capas con un patrón de 16 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de una capa de FFN, y una subcapa de Gated Attention adicional con su FFN. La atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK, con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) emplea 24 cabezas para Q y 4 para KV, con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene una dimensión intermedia de 17 408. El modelo incorpora un mecanismo de predicción multi-token (MTP) entrenado con múltiples pasos, lo que acelera la inferencia. El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con un modo de pensamiento (thinking) activado por defecto y ajustable mediante `reasoning_effort`.

La cuantización NVFP4 es una técnica de compresión desarrollada por Unsloth que asigna 4 bits a las capas MLP, 8 bits a las capas de atención y utiliza caché KV en FP8. Según la información disponible, esta cuantización dinámica busca minimizar la pérdida de precisión manteniendo un alto rendimiento en GPUs NVIDIA. No se han publicado detalles adicionales sobre el proceso de entrenamiento o calibración específico de esta versión cuantizada.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (thinking mode) activable o desactivable por petición.
- Comprensión de imágenes y vídeo nativa, incluyendo diagramas STEM, documentos y vídeos de larga duración (hasta horas).
- Soporte de tool calling y function calling, con mejoras para parsear objetos anidados y aumentar la fiabilidad en agentes.
- Capacidades de agente autónomo: planificación de tareas multi-paso y manejo de feedback del entorno.
- Control flexible del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`.
- Retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Compatibilidad con MTP (Multi-Token Prediction) para acelerar la generación.
- Capacidades multilingües no especificadas en la documentación disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el historial completo de interacción y aplicando modo no-pensamiento para respuestas rápidas.
- Análisis de documentos técnicos y científicos: gracias a su encoder de visión, puede procesar imágenes, diagramas y páginas escaneadas, extrayendo información relevante para informes o resúmenes.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de un contexto amplio para proyectos grandes.
- Agentes autónomos de largo horizonte: su capacidad de planificación y manejo de feedback del entorno lo hace adecuado para tareas como automatización de flujos de trabajo, investigación web o gestión de proyectos.
- Procesamiento de vídeo de vigilancia o análisis de contenido multimedia: puede entender vídeos de larga duración y extraer eventos o transcripciones, útil en seguridad o generación de subtítulos.
- Asistente de investigación: con el modo de pensamiento activado, puede razonar sobre problemas complejos de matemáticas, física o ingeniería, y generar explicaciones detalladas paso a paso.
- Despliegue en entornos con recursos limitados: la cuantización NVFP4 permite ejecutar el modelo en GPUs consumer de 24 GB o menos, facilitando prototipado y aplicaciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización NVFP4 en la información disponible. El modelo base Qwen3.8-27B reporta mejoras en tareas de código, trabajo profesional, investigación y agentes, pero no se incluyen cifras concretas en la documentación consultada. Un hilo en los foros de NVIDIA compara esta cuantización con la versión FP8 oficial, indicando un aumento del 30-34 % en throughput de generación y menor uso de memoria, pero no proporciona métricas de calidad (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; el tamaño del repositorio es 23,4 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente 14-16 GB en memoria, dependiendo del overhead de runtime.
- GPUs recomendadas: NVIDIA con soporte NVFP4, idealmente arquitectura Blackwell (B200, DGX Spark) o Ampere/Ada con soporte FP8 (RTX 4090, A100, H100). En GPUs sin soporte nativo NVFP4, puede requerirse emulación o conversión.
- Compatibilidad con consumer GPUs: probablemente ejecutable en RTX 4090 (24 GB) y posiblemente en RTX 3090 (24 GB) o RTX 4080 (16 GB) con cuantización adicional o reducción de contexto.
- Opciones de despliegue: vLLM (probado en DGX Spark), llama.cpp, Ollama, TGI, y Unsloth Desktop. También puede usarse con Hugging Face Transformers si se cargan los safetensors.
- Latencia y throughput: según el foro de NVIDIA, el NVFP4 es 30-34 % más rápido que FP8 en generación, pero no se dan valores absolutos. El rendimiento dependerá de la GPU y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (1M ext.) | BF16/FP16 | Apache-2.0 | Modelo original completo |
| Qwen/Qwen3.8-27B-FP8 | 27B | 262K (1M ext.) | FP8 (block 128, e4m3) | Apache-2.0 | Cuantización oficial de Qwen |
| FenomAI/Qwen3.8-27B-NVFP4 | 27B | 262K (1M ext.) | NVFP4 (4-bit MLP + 8-bit attn) | Apache-2.0 | Cuantización de FenomAI con Unsloth, 30-34 % más rápida que FP8 según pruebas |

No se dispone de datos de rendimiento en benchmarks estándar para comparar directamente estas versiones. La principal diferencia radica en el equilibrio entre velocidad y precisión, donde NVFP4 prioriza la velocidad y el ahorro de memoria, mientras que FP8 mantiene mayor fidelidad numérica.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce pérdida de precisión respecto al modelo en BF16, lo que puede afectar tareas de razonamiento matemático o generación de código muy sensible a errores numéricos.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión cuantizada; se heredan los riesgos del modelo base.
- Los idiomas soportados no están documentados, por lo que el rendimiento en lenguas distintas del inglés o chino no está garantizado.
- El modo de pensamiento está activado por defecto, lo que aumenta el tiempo de generación y el consumo de tokens; es recomendable desactivarlo para tareas de baja latencia.
- Para contextos superiores a 262K tokens, se requiere escalado RoPE (p. ej., YaRN), lo que puede degradar ligeramente la calidad.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y de las herramientas de cuantización utilizadas (Unsloth).
- El modelo puede producir respuestas repetitivas si no se ajustan parámetros como `presence_penalty`, especialmente en modo no-pensamiento.

## Enlaces

- [Modelo en Hugging Face: FenomAI/Qwen3.8-27B-NVFP4](https://huggingface.co/FenomAI/Qwen3.8-27B-NVFP4)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Guía de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Página de vLLM Recipes para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Foro de NVIDIA: comparativa NVFP4 vs FP8 en DGX Spark](https://forums.developer.nvidia.com/t/qwen3-8-27b-on-dgx-spark-using-vllm-nvfp4-vs-fp8-performance/380258)
- [ThinkLLM: descripción de Qwen3.8 27B NVFP4](https://thinkllm.dev/models/qwen3-8-27b-nvfp4)
