# RacingAce66/Swift-1.5-Qwen3.8-27b-heretic

## Resumen
Swift-1.5-Qwen3.8-27b-heretic es una variante descensurada del modelo Swift 1.5 Qwen3.8-27B, desarrollado por UkisAI y derivado a su vez del Qwen3.8-27B de Qwen. El modelo original es un ajuste fino orientado a la eficiencia de razonamiento: según su model card, emplea un 58,5 % menos de tokens de "thinking" manteniendo (o superando ligeramente) la precisión del modelo base, lo que se traduce en una aceleración de aproximadamente 1,95× en varias tareas. Esta versión concreta, publicada por el usuario RacingAce66, aplica la herramienta Heretic v2.1.0 para eliminar rechazos y comportamiento servil (sycophancy) mediante ablación de rangos arbitrarios (ARA) sobre las capas 1 a 62.

El modelo tiene 27.356.728.560 parámetros (unos 27,36 mil millones) en formato safetensors, con un repositorio de 54,8 GB, lo que sugiere pesos en precisión de 16 bits. La pipeline declarada es image-text-to-text, con arquitectura etiquetada como qwen3_5/qwen3_8, e incluye capacidades multimodales además de razonamiento y generación de texto. La licencia es la swift-open-license-1.0, una licencia "other" con acceso restringido (gated) que exige revisión de condiciones para uso comercial.

La relevancia de esta ficha radica en dos factores: por un lado, la propuesta de eficiencia de tokens en razonamiento, que reduce coste de inferencia en tareas agénticas y de código; por otro, la modificación "heretic", que elimina los mecanismos de rechazo del modelo base (de 98/100 rechazos a 8/100 según la model card) y reduce la sycophancy (de 60/78 a 2/78), a costa de una divergencia KL de 0,1774 respecto al original. Es, por tanto, un modelo pensado para entornos donde el filtrado del modelo base resulta un obstáculo, con las implicaciones de seguridad que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetada qwen3_5 / qwen3_8), multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta variante; el modelo base dispone de GGUF y GSQ-RCO GGUF |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other, gated) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
La arquitectura es un transformer multimodal con pipeline image-text-to-text, derivado de la familia Qwen3.8. El modelo base Swift 1.5 Qwen3.8-27B se construye a partir de Swift 1.0 mediante post-entrenamiento escalado con RL y OPD (on-policy distillation), centrado en tareas de horizonte largo, agénticas y de código. Según la model card, la eficiencia se logra identificando tokens asociados a "sobrepensamiento patológico" y penalizándolos sin atacar directamente la longitud del razonamiento, recuperando después precisión con RL y OPD. Los datos de entrenamiento están publicados en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque la model card aclara que se re-muestrean y transforman en entornos RL.

Esta variante concreta aplica Heretic v2.1.0 con ablación de rangos arbitrarios (ARA) sobre las capas 1 a 62, con los parámetros: preserve_good_behavior_weight 0,0323, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9874 y neighbor_count 13. El proceso es reproducible según el directorio `reproduce` del repositorio. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de la referencia anterior.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento eficiente en tokens (reducción del 58,5 % de tokens de thinking según la model card).
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text).
- Generación de código y tareas de ingeniería de software, con mejoras declaradas en LiveCodeBench y Terminal Bench 2.1 respecto a versiones previas.
- Razonamiento agéntico de múltiples pasos y tareas de horizonte largo.
- Comportamiento descensurado: rechazos reducidos de 98/100 a 8/100 y sycophancy de 60/78 a 2/78.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso
- Generación de código en producción: el modelo base declara mejoras en LiveCodeBench y Terminal Bench 2.1, por lo que puede integrarse en pipelines de CI/CD para generar parches, tests y scripts de terminal, aprovechando su eficiencia de tokens para reducir coste por tarea.
- Desarrollo de videojuegos y prototipos interactivos: la demo de la model card muestra la generación de un juego 3D explorable en 11,39 minutos frente a 104,6 minutos del modelo base, lo que lo hace adecuado para prototipado rápido de mecánicas y escenas.
- Agentes autónomos de terminal: su orientación a tareas agénticas de horizonte largo y su menor consumo de tokens de razonamiento permiten encadenar comandos y verificaciones en entornos shell con menor latencia acumulada.
- Asistentes conversacionales sin rechazos: en dominios donde el modelo base filtra en exceso (por ejemplo, análisis de contenido sensible, ficción o investigación de seguridad), la variante heretic mantiene la conversación multi-turno sin derivar sistemáticamente a rechazos.
- Análisis de imágenes con razonamiento: al ser image-text-to-text, puede emplearse para describir capturas, diagramas o interfaces y razonar sobre ellas en flujos de soporte técnico o documentación.
- Evaluación comparativa de modelos: su naturaleza reproducible (directorio `reproduce` y parámetros ARA publicados) permite replicar experimentos de ablación y medir el impacto de la descensura en métricas de rechazo y sycophancy.
- Reducción de coste en inferencia de razonamiento: en aplicaciones con presupuesto de tokens ajustado, el 58,5 % menos de tokens de thinking y la aceleración de 1,95× declarada pueden traducirse en menor facturación por consulta en APIs propias.

## Benchmarks y rendimiento

La model card proporciona métricas de comportamiento de la modificación heretic, no benchmarks académicos estándar:

| Metrica | Este modelo | Modelo original (ukisai/Swift-1.5-Qwen3.8-27b) |
|---|---|---|
| Rechazos (refusals) | 8/100 | 98/100 |
| Respuestas con sycophancy | 2/78 | 60/78 |
| Divergencia KL | 0,1774 | 0 (por definición) |

Además, la model card del modelo base declara un 58,5 % menos de tokens de thinking, un 0,35 % más de puntuación y una aceleración de 1,95× en varias tareas, así como mejoras en LiveCodeBench y Terminal Bench 2.1, pero no se incluyen los valores numéricos de esos benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 27,36 B de parámetros en FP16/BF16 se requieren aproximadamente 55 GB de VRAM solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits bajaría a unos 27-30 GB y en 4 bits a unos 14-16 GB, aunque esta variante no publica cuantizaciones propias.
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB con tensor parallelism; para cuantizaciones de 8 bits, una RTX 4090 de 24 GB podría ser insuficiente para el modelo completo con contexto largo.
- ¿Cabe en GPU de consumo? En 4 bits es plausible en GPUs de 24 GB (RTX 3090/4090) si se generan cuantizaciones a partir de los pesos safetensors; en 8 bits requiere al menos 32-48 GB.
- Opciones de despliegue: transformers (formato nativo safetensors); el modelo base ofrece GGUF y GSQ-RCO GGUF, por lo que llama.cpp u Ollama serían viables si se convierten los pesos. vLLM y TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; la model card del base declara una aceleración de 1,95× frente al modelo sin post-entrenamiento de eficiencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RacingAce66/Swift-1.5-Qwen3.8-27b-heretic | ~27,36 B | no disponible | swift-open-license-1.0 (gated) | Hugging Face, safetensors | Variante descensurada con Heretic |
| ukisai/Swift-1.5-Qwen3.8-27b | ~27 B (no confirmado en la información) | no disponible | swift-open-license-1.0 | Hugging Face, safetensors, GGUF | Modelo base sin descensurar; 98/100 rechazos |
| Qwen/Qwen3.8-27B | ~27 B (no confirmado) | no disponible | no disponible | Hugging Face | Modelo fundacional; referencia de rendimiento y velocidad |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | no disponible | no disponible | no disponible | Hugging Face | Versión previa con más de 350k descargas |

## Limitaciones y advertencias
- La ablación heretic elimina filtros de seguridad del modelo base: los rechazos caen de 98/100 a 8/100, por lo que puede generar contenido que el modelo original bloquearía. No es adecuado para aplicaciones dirigidas a menores o con requisitos de moderación estrictos sin capas adicionales de filtrado.
- La divergencia KL de 0,1774 respecto al original indica una alteración medible de la distribución de salida; puede degradar sutilmente capacidades no evaluadas.
- Riesgo de alucinación: no se han publicado métricas de veracidad para esta variante; el proceso de ablación no garantiza mejora en factualidad.
- La licencia swift-open-license-1.0 es de tipo "other" y el repositorio está restringido (gated): es imprescindible revisar las condiciones de uso comercial en el enlace de licencia antes de desplegar en producción.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni cuantizaciones oficiales para esta variante concreta.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de estabilidad en producción.
- El modelo base declara entrenamiento con RL y OPD sobre datos re-muestreados; no se detalla la composición final del dataset, lo que limita la evaluación de sesgos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Heretic: https://heretic-project.org
- Web de UkisAI: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Demo del juego 3D: https://ukisai.com/swift-games/27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
