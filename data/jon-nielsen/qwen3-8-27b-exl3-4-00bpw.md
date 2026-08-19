# Jon-Nielsen/Qwen3.8-27B-exl3-4.00bpw

## Resumen

Jon-Nielsen/Qwen3.8-27B-exl3-4.00bpw es una cuantización en 4 bits (4.00 bits por peso) del modelo Qwen/Qwen3.8-27B, realizada con el formato EXL3 para el motor de inferencia ExLlamaV3 y TabbyAPI. El modelo base, desarrollado por Alibaba, es un modelo de lenguaje causal con encoder de visión de 27 000 millones de parámetros, arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), y soporte nativo para imágenes y vídeo. Su contexto nativo es de 262 144 tokens, ampliable hasta 1 000 000.

Esta cuantización reduce el peso del modelo a aproximadamente 16,9 GB, lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, sin necesidad de hardware de datacenter. Es una opción práctica para desarrolladores que quieren desplegar localmente un modelo de 27B con capacidades multimodales y de razonamiento, manteniendo un equilibrio entre calidad y requisitos de hardware. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet (atención lineal) + Gated Attention + FFN |
| Parametros totales | 27B (según documentación del modelo base); el archivo safetensors reporta 8 430 253 296 parámetros, dato inconsistente con la documentación oficial |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | EXL3 4.00 bpw (4 bits); existe versión hermana a 6.00 bpw |
| Idiomas soportados | No disponible (el modelo base no especifica lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3 para ExLlamaV3 / TabbyAPI) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que intercala bloques de atención lineal y atención clásica. La configuración es de 64 capas con un patrón repetido: por cada 4 bloques, 3 usan Gated DeltaNet (una variante de atención lineal con estado recurrente) y 1 usa Gated Attention (atención softmax con RoPE). El Gated DeltaNet tiene 48 cabezas para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention tiene 24 cabezas para Q y 4 para KV, con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120 y la FFN intermedia de 17 408. Además, incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la documentación disponible no detalla el número de tokens ni la composición del dataset. El modelo está diseñado para tareas de razonamiento, codificación, trabajo profesional y agentes de largo horizonte, con un modo de pensamiento ("thinking mode") activado por defecto y ajustable mediante `reasoning_effort`. También incluye soporte nativo para comprensión de imágenes y vídeo, desde diagramas STEM hasta vídeos de una hora.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento configurable (activado por defecto, desactivable por petición).
- Comprensión de imágenes y vídeo: análisis de diagramas, documentos, escenas y vídeos de larga duración.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Planificación autónoma y manejo de feedback del entorno para tareas multi-paso.
- Razonamiento multi-step con retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Capacidades multilingües no especificadas oficialmente, pero el modelo base de Qwen suele cubrir múltiples idiomas.
- Decodificación eficiente gracias a MTP (Multi-Token Prediction).

## Casos de uso

- Asistentes de código en producción: el modelo puede generar, revisar y refactorizar código, y gracias a su soporte de tool calling puede integrarse en entornos de desarrollo o CI/CD para automatizar tareas como generación de tests o corrección de errores.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de figuras, tablas y diagramas en PDFs o imágenes, útil para investigación y documentación.
- Agentes autónomos de navegación web: con planificación multi-paso y manejo de feedback, puede ejecutar tareas como rellenar formularios, extraer datos o interactuar con APIs.
- Moderación y análisis de contenido multimedia: al comprender vídeo e imágenes, puede clasificar o resumir contenido visual en plataformas de streaming o redes sociales.
- Soporte técnico automatizado: con contexto largo de 262K tokens, puede gestionar conversaciones multi-turno con historial extenso y documentos de referencia, reduciendo la necesidad de resúmenes intermedios.
- Generación de informes y resúmenes ejecutivos: su capacidad de razonamiento y comprensión de datos estructurados (tablas, gráficos) permite sintetizar información compleja en texto claro.

## Benchmarks y rendimiento

La documentación del modelo base incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, en categorías como coding, agentic terminal coding, etc. Sin embargo, los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). Por tanto, no se pueden presentar resultados concretos. Se recomienda consultar la model card original de Qwen/Qwen3.8-27B para obtener los datos completos.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 16,9 GB, por lo que se necesitan al menos 18-20 GB de VRAM para inferencia con overhead de contexto y buffers. Cabe en GPUs de 24 GB.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, L40S, o GPUs de datacenter con 40 GB o más.
- En consumer GPU: sí, con RTX 3090/4090 o similares de 24 GB.
- Opciones de despliegue: ExLlamaV3 (motor nativo), TabbyAPI, y potencialmente otros motores que soporten formato EXL3. No es compatible directamente con vLLM, llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la configuración de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | FP16/BF16 | Apache 2.0 | HuggingFace |
| Jon-Nielsen/Qwen3.8-27B-exl3-4.00bpw | 27B (cuantizado) | 262K (ext. 1M) | EXL3 4-bit | Apache 2.0 | HuggingFace |
| Jon-Nielsen/Qwen3.8-27B-exl3-6.00bpw | 27B (cuantizado) | 262K (ext. 1M) | EXL3 6-bit | Apache 2.0 | HuggingFace |

La comparativa con otros modelos de 27B (como Qwen3.6-27B) no se puede realizar con datos numéricos porque no se dispone de los resultados de benchmarks en la información proporcionada. La principal diferencia entre las versiones cuantizadas es el equilibrio entre calidad y requisitos de VRAM: la versión 4-bit ocupa menos memoria pero puede tener mayor pérdida de precisión que la 6-bit.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede haber una degradación notable en tareas de precisión alta (matemáticas, razonamiento lógico) comparada con el modelo en FP16. Se recomienda probar la versión 6-bit si la calidad es crítica.
- El modelo base puede presentar sesgos presentes en sus datos de entrenamiento, aunque no se han documentado específicamente.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las leyes de protección de datos y uso ético.
- El formato EXL3 es específico de ExLlamaV3/TabbyAPI; no es directamente utilizable con otros motores sin conversión.
- La fecha de creación del repositorio (2026-08-14) es futura, lo que sugiere que el modelo es muy reciente y puede tener menos soporte comunitario o documentación adicional pendiente.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-exl3-4.00bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión hermana 6.00 bpw: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-exl3-6.00bpw
