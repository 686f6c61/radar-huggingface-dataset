# jk797/Qwen3.8-27B-oQ4e-mtp

## Resumen

El modelo `jk797/Qwen3.8-27B-oQ4e-mtp` es una cuantización en formato oQ4e (4-bit) del modelo vision-language denso `Qwen/Qwen3.8-27B`, producida con la librería oMLX 0.6.0. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un VLM de 27 000 millones de parámetros construido sobre la arquitectura Qwen3.5, con una ventana de contexto nativa de 262 000 tokens y capacidades multimodales de entrada de imagen y vídeo. Esta cuantización conserva los pesos MTP (Multi-Token Prediction) y los componentes de visión, lo que la hace adecuada para despliegue local en hardware Apple Silicon y, según el blog de AMD, también en procesadores Ryzen AI Max y GPUs Radeon mediante LM Studio.

La relevancia de esta ficha radica en que ofrece una versión compacta (17 GB en disco) de un modelo de última generación orientado a tareas de razonamiento, codificación, trabajo profesional y agentes autónomos de largo horizonte. Al estar en formato MLX, se integra nativamente con el ecosistema de Apple, aunque también puede ejecutarse en hardware AMD con soporte de primera hora. La cuantización oQ4e, desarrollada por oMLX, utiliza un modelo de sensibilidad de 8-bit affine con grupo de tamaño 64 para minimizar la pérdida de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con componentes de visión y MTP (Multi-Token Prediction) |
| Parametros totales | 4 927 772 912 (según safetensors del repo; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | oQ4e (4-bit, formato oMLX) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente chino e inglés) |
| Licencia | No disponible en la model card; el modelo base Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros con arquitectura Qwen3.5, que incorpora un codificador de visión para procesar imágenes y vídeo además de texto. La cuantización oQ4e producida con oMLX 0.6.0 preserva tanto los pesos MTP como los componentes de visión, lo que significa que la capacidad de predicción multi-token y el procesamiento multimodal se mantienen tras la compresión. El proceso de cuantización utiliza un modelo de sensibilidad de 8-bit affine con grupo de tamaño 64, derivado de `mlx-community/Qwen3.8-27B-8bit`, para determinar qué pesos requieren mayor precisión y así reducir la degradación. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), pero por la arquitectura y los benchmarks publicados se infiere que ha sido entrenado con un corpus extenso y posteriormente alineado para tareas de razonamiento y agente.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento configurable (thinking mode).
- Comprensión de imágenes y vídeo como entrada (pipeline image-text-to-text).
- Codificación de software con rendimiento destacado en benchmarks de agentes como DeepSWE (42.2).
- Ejecución de tareas agénticas de largo horizonte con planificación autónoma y manejo de feedback del entorno (Terminal Bench 73.0, OSWorld 84.3).
- Soporte de tool calling y function calling, integrable en flujos de automatización.
- Multilingüe (principalmente chino e inglés, según el modelo base).

## Casos de uso

- Asistente de codificación local: al ser una cuantización 4-bit, puede ejecutarse en una Mac con 32 GB de RAM unificada, permitiendo autocompletado, generación de funciones y refactorización sin conexión a internet.
- Análisis de documentos con imágenes: gracias a su componente de visión, puede extraer información de capturas, diagramas o gráficos en informes técnicos.
- Agente autónomo para automatización de tareas: su capacidad de razonamiento multi-paso y tool calling permite orquestar flujos como gestión de correo, scraping web o ejecución de scripts.
- Soporte técnico y atención al cliente: con 262K de contexto, puede mantener conversaciones largas y recordar detalles de interacciones previas.
- Investigación y redacción profesional: genera resúmenes, revisa literatura y produce borradores con citas, aprovechando el modo de razonamiento para estructurar argumentos.
- Prototipado de aplicaciones multimodales: desarrolladores pueden integrar este modelo en aplicaciones que requieran entender imágenes y texto simultáneamente, como herramientas de inspección visual o accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. Los datos disponibles corresponden al modelo base `Qwen3.8-27B` según la búsqueda web:

| Benchmark | Resultado |
|---|---|
| DeepSWE (codificación agéntica) | 42.2 |
| Terminal Bench (tareas de terminal) | 73.0 |
| OSWorld (interacción con sistemas operativos) | 84.3 |

Estos valores son del modelo sin cuantizar; la versión oQ4e puede presentar una degradación leve, pero no se dispone de mediciones concretas.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 17 GB en disco; en inferencia, la memoria necesaria será similar (alrededor de 17-18 GB) más overhead de contexto. En Apple Silicon, la memoria unificada debe ser de al menos 32 GB para un uso cómodo con contexto largo.
- GPUs recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) con 32 GB o más de RAM unificada; también compatible con AMD Ryzen AI Max y GPUs Radeon según el blog de AMD, mediante LM Studio.
- En consumer GPU: no es adecuado para GPUs de gama media (RTX 3060/4060) por los 17 GB de VRAM requeridos; sí cabe en RTX 4090 (24 GB) o GPUs de 24 GB en adelante.
- Opciones de despliegue: oMLX (para Apple Silicon), LM Studio (multiplataforma), y potencialmente vLLM o TGI si se convierte a otros formatos, aunque el formato nativo es MLX.
- Latencia y throughput: no disponible; depende del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Sí | Apache 2.0 | Original |
| jk797/Qwen3.8-27B-oQ4e-mtp | 27B (cuantizado) | 262K | Sí | No disponible (hereda Apache 2.0) | MLX oQ4e |
| unsloth/Qwen3.8-27B-NVFP4 | 27B (cuantizado) | 262K | Sí | Apache 2.0 (presumible) | NVFP4 (NVIDIA) |

La cuantización oQ4e está orientada a hardware Apple y AMD, mientras que la variante NVFP4 de unsloth está pensada para GPUs NVIDIA con soporte FP4. Ambas mantienen las capacidades del modelo base, pero difieren en el formato y el ecosistema de despliegue.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir una degradación de precisión en tareas de razonamiento complejo o matemáticas, aunque oQ4e está diseñada para minimizarla.
- La licencia no está explícitamente declarada en la model card; se asume que hereda la Apache 2.0 del modelo base, pero conviene verificar antes de un uso comercial.
- El modelo base tiene sesgos potenciales derivados de sus datos de entrenamiento, no documentados en la información disponible.
- Riesgo de alucinación en tareas de generación libre, especialmente con contexto largo.
- Al ser un modelo vision-language, el rendimiento en tareas de visión puede variar con la cuantización de los componentes visuales.
- No se dispone de información sobre el rendimiento en idiomas distintos de chino e inglés; el soporte multilingüe no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jk797/Qwen3.8-27B-oQ4e-mtp
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Modelo NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Página de Qwen3.8-27B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
