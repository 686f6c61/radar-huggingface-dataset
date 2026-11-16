# bobjoke/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" (abliterada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicada por el usuario bobjoke. El modelo base es un fine-tune de Qwen3.5-4B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", y entrenado con una mezcla de aproximadamente 250.000 muestras centradas en matemáticas y STEM. Esta versión concreta aplica la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo del modelo original.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B subyacente, con 4.539.265.536 parámetros totales según los pesos en safetensors. Está pensado para despliegues compactos donde se necesita capacidad de razonamiento matemático y científico con requisitos de hardware moderados, y ahora también sin las restricciones de rechazo típicas del modelo alineado.

La relevancia de esta ficha radica en que combina tres tendencias actuales: la destilación de modelos grandes de razonamiento hacia clases de 4B, la publicación de variantes abliteradas para investigación sobre alineación, y el soporte de múltiples formatos (safetensors y GGUF) para despliegue local. No obstante, al tratarse de una publicación reciente sin descargas ni validación comunitaria, debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de MTP (multi-token prediction) |
| Parametros totales | 4.539.265.536 (aprox. 4,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en tags; niveles concretos no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 4,5B parámetros. El modelo base fue destilado a partir de respuestas de DeepSeek-V4-Pro en modo "Max Effect", siguiendo la misma receta de entrenamiento que la versión de 9B: una mezcla de aproximadamente 250.000 muestras de matemáticas y STEM, con SFT (supervised fine-tuning) como método principal. Los tags indican soporte de MTP (multi-token prediction), una técnica de decodificación especulativa que acelera la generación al predecir varios tokens por paso; la model card menciona una evaluación "MTP-Q8".

La innovación principal de esta variante es la aplicación de Heretic v2.0.0 con parámetros de Arbitrary-Rank Ablation (ARA): ablación entre las capas 16 y 32, con pesos de preservación de comportamiento bueno de 0,9854, de redirección de comportamiento malo de 0,0002, de corrección excesiva de 0,6587 y neighbor_count de 10. Según la model card, esto reduce los rechazos de 99/100 a 5/100 con una divergencia KL de 0,0378 respecto al original, lo que indica una alteración limitada de la distribución general de salidas.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en descomposición explícita de problemas.
- Razonamiento matemático y científico (STEM), entrenado sobre aproximadamente 250.000 muestras específicas.
- Capacidad multimodal de entrada image-text-to-text según los tags del repositorio, aunque no se detallan los detalles del encoder visual.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: el razonamiento estructurado está documentado, pero la integración agéntica no se detalla.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado de la destilación de DeepSeek-V4-Pro.
- Comportamiento "decensored": reducción drástica de rechazos (5/100 frente a 99/100 del original).
- Compatibilidad con endpoints (tag endpoints_compatible) y text-generation-inference.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre unas 250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automatizada, generación de soluciones paso a paso y verificación de ejercicios en plataformas educativas.
- Investigación sobre alineación y abliteración: al ser una variante decensored con parámetros ARA documentados y métricas de rechazo y divergencia KL, sirve como caso de estudio reproducible para analizar el efecto de la ablación sobre el comportamiento del modelo.
- Generación de contenido sin restricciones para entornos controlados: en escenarios de investigación creativa o redacción técnica donde los rechazos del modelo alineado resultan un obstáculo, esta variante reduce los bloqueos manteniendo una divergencia KL baja respecto al original.
- Despliegue local en hardware de consumo: con 4,5B parámetros y pesos GGUF disponibles, puede ejecutarse en GPUs consumer y en CPU mediante llama.cpp u Ollama, lo que lo hace apto para prototipado offline.
- Asistencia en razonamiento STEM dentro de pipelines de CI: integrable vía text-generation-inference o transformers para tareas de verificación de cálculos y generación de explicaciones técnicas en documentación.
- Experimentación multilingüe: con soporte declarado de seis idiomas, puede usarse para evaluar la transferencia de razonamiento matemático entre inglés, chino, español y ruso en entornos de investigación comparada.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y con pesos safetensors, es una base viable para adaptaciones específicas de dominio (por ejemplo, el propio autor referencia un fine-tune científico derivado, DeepThought-STEM).

## Benchmarks y rendimiento

La model card solo reporta métricas de comportamiento tras la abliteración, no benchmarks estándar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (refusals) | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 3-4 GB, con margen adicional para contexto.
- GPU recomendadas: A100 o H100 para despliegue de alta concurrencia; RTX 4090, RTX 3090 o L40S para inferencia en FP16 con holgura.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más usando cuantización de 4-8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si el soporte de la arquitectura Qwen3.5 está disponible en la versión usada), llama.cpp y Ollama mediante los pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el soporte de MTP podría mejorar el throughput respecto a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bobjoke/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,5B | no disponible | Apache 2.0 | Variante abliterada con Heretic v2.0.0; 5/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4,5B | no disponible | Apache 2.0 | Modelo base alineado; 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | no disponible | no disponible | Versión de 9B de la misma receta, referenciada en la model card |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4,5B | no disponible | no disponible | Fine-tune científico derivado de esta familia |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: como todo modelo de 4,5B destilado, el riesgo de generar razonamientos plausibles pero incorrectos es elevado, especialmente en problemas matemáticos de varios pasos; conviene verificar las salidas.
- Sesgos: la abliteración elimina los rechazos, pero no corrige sesgos subyacentes; de hecho, puede exponer contenido sesgado u ofensivo que el modelo alineado filtraba. No se documentan evaluaciones de sesgo.
- Seguridad: el modelo está diseñado explícitamente para reducir los rechazos; no es adecuado para aplicaciones de cara al público sin capas adicionales de moderación.
- Contexto e idiomas: la longitud de contexto no está documentada; el soporte multilingüe se declara en seis idiomas, pero el entrenamiento se centra en matemáticas y STEM, por lo que el rendimiento en otros dominios e idiomas puede ser limitado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en aplicaciones sensibles.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni evaluaciones independientes; debe tratarse como experimental.
- Detalles técnicos ausentes: no se especifican la composición exacta del dataset, la longitud de contexto, los niveles de cuantización GGUF ni los detalles del componente multimodal, pese a los tags image-text-to-text.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bobjoke/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión de 9B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune científico derivado: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
