# batiai/Qwen3.5-27B-GGUF

## Resumen

Qwen3.5-27B-GGUF es una cuantización del modelo Qwen/Qwen3.5-27B, realizada por BatiAI con llama.cpp (build 400ac8e) y publicada en formato GGUF para su uso con llama.cpp, Ollama y otras herramientas compatibles. El modelo original, desarrollado por Alibaba, adopta una arquitectura híbrida que combina Gated DeltaNet, atención con Grouped Query Attention (GQA) y capas de mezcla de expertos (MoE), con un total de aproximadamente 26,9 mil millones de parámetros. Está orientado a la ejecución local en dispositivos Apple Silicon, aunque al ser GGUF puede ejecutarse en cualquier plataforma soportada por llama.cpp.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de alto rendimiento para despliegue on-device, con una ventana de contexto de 262 000 tokens y soporte multilingüe (inglés, coreano, japonés y chino). La cuantización IQ4_XS reduce el peso a 14 GB, permitiendo su ejecución en equipos con 32 GB de RAM unificada o más. El proyecto se enmarca en el ecosistema BatiFlow, una herramienta gratuita de automatización de IA local para macOS, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + GQA + MoE |
| Parametros totales | 26 895 998 464 (~27B) |
| Parametros activos | no disponible (la arquitectura MoE sugiere activación parcial, pero no se especifica el número) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | IQ4_XS (única disponible en este repositorio) |
| Idiomas soportados | inglés, coreano, japonés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que combina Gated DeltaNet, atención con Grouped Query Attention (GQA) y capas de mezcla de expertos (MoE). Esta combinación busca equilibrar la eficiencia computacional de las capas recurrentes (DeltaNet) con la capacidad expresiva de la atención y el escalado de capacidad de los expertos. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la documentación proporcionada.

La cuantización IQ4_XS fue generada con llama.cpp (build 400ac8e) y verificada por BatiAI para su uso en macOS. El proceso de cuantización reduce el tamaño del modelo de aproximadamente 27B parámetros en fp16 a 14 GB, lo que permite su ejecución en hardware de consumo. No se han publicado detalles sobre el dataset de calibración utilizado para la cuantización ni sobre posibles técnicas de imatrix (aunque el tag "imatrix" aparece en HuggingFace, no se confirma en la model card).

## Capacidades

- Generación de texto en inglés, coreano, japonés y chino, con buena cobertura multilingüe.
- Ventana de contexto extendida de 262 000 tokens, adecuada para documentos largos, conversaciones multi-turno y razonamiento sobre grandes volúmenes de texto.
- Soporte de tool calling con salida JSON, verificado en los benchmarks de BatiAI.
- Ejecución local en dispositivos Apple Silicon mediante Ollama o llama.cpp, con latencia de generación de aproximadamente 11-17 tokens por segundo en un M4 Max.
- Compatible con pipelines de generación de texto estándar (text-generation) y con la librería llama.cpp.
- Capacidad de razonamiento y resolución de problemas complejos gracias a la arquitectura híbrida y al tamaño del modelo, aunque no se han publicado benchmarks específicos de razonamiento.

## Casos de uso

- Asistente de atención al cliente multilingüe: el modelo puede gestionar conversaciones en inglés, coreano, japonés y chino, manteniendo el contexto de interacciones largas gracias a su ventana de 262K tokens. Su soporte de tool calling permite integrarlo con sistemas de tickets o bases de conocimiento.
- Generación de código en entornos locales: aunque no se han publicado benchmarks de HumanEval, el modelo base Qwen tiene reputación en tareas de código. La cuantización IQ4_XS permite ejecutarlo en una estación de trabajo con 32 GB de RAM, ideal para desarrollo offline.
- Análisis de documentos legales o técnicos extensos: con 262K tokens de contexto, puede procesar contratos completos, informes anuales o documentación técnica de cientos de páginas en una sola pasada.
- Automatización de flujos de trabajo en macOS con BatiFlow: el modelo está verificado para su uso con esta herramienta de automatización local, permitiendo crear agentes que procesan texto, generan resúmenes o interactúan con otras aplicaciones.
- Traducción y transcripción multilingüe: su soporte para cuatro idiomas asiáticos y europeos (inglés) lo hace adecuado para tareas de traducción automática en contextos donde la privacidad exige procesamiento local.
- Razonamiento y análisis de datos en entornos sin conexión: investigadores o analistas pueden desplegar el modelo en portátiles con Apple Silicon para tareas de clasificación, extracción de información o generación de informes sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados por el autor son mediciones de velocidad en un MacBook Pro M4 Max con 128 GB de RAM unificada, presentados en dos tablas con valores ligeramente diferentes:

| Máquina | Cuantización | Cold start | Prompt eval | Token gen | Fecha de prueba |
|---|---|---|---|---|---|
| MacBook Pro M4 Max 128GB | IQ4_XS | 4,827 s | 82,37 t/s | 11,71 t/s | 2026-05-03 |

La model card también menciona una velocidad de 17,0 t/s en token generation y un uso de VRAM de 28 GB, aunque no se indica la fecha ni las condiciones exactas de esa medición. La discrepancia entre ambos valores (11,71 frente a 17,0 t/s) sugiere diferencias en la configuración de prueba o en la versión de llama.cpp utilizada.

## Requisitos de hardware

- VRAM estimada: 28 GB para la cuantización IQ4_XS, según la model card.
- GPU recomendada: Apple Silicon con al menos 32 GB de memoria unificada (por ejemplo, M4 Pro o M4 Max). El modelo fue verificado en un M4 Max con 128 GB.
- Compatibilidad con GPU de consumo: no se ha probado en GPUs NVIDIA o AMD, pero al ser GGUF puede ejecutarse en cualquier plataforma soportada por llama.cpp con suficiente VRAM (por ejemplo, una RTX 4090 con 24 GB no sería suficiente; se necesitaría al menos 28 GB, por lo que una RTX 5090 de 32 GB podría funcionar).
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama pull batiai/qwen3.5-27b:iq4`), y cualquier servidor compatible con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: en el M4 Max de 128 GB, se midieron 82,37 t/s en prompt eval y entre 11,71 y 17,0 t/s en generación de tokens. El cold start fue de 4,827 segundos.

## Comparativa con modelos similares

La model card incluye una comparativa interna con otros modelos de la misma familia cuantizados por BatiAI:

| Modelo | Tamaño | VRAM | Velocidad (t/s) | Mac mínimo |
|---|---|---|---|---|
| batiai/qwen3.5-9b:q4 | 5,2 GB | ~8 GB | 12,5 | 16 GB |
| **batiai/qwen3.5-27b:iq4** | **14 GB** | **28 GB** | **17,0** | **32 GB** |
| batiai/qwen3.5-35b:iq4 | 17 GB | 23 GB | 26,6 | 36 GB |

El modelo de 35B usa arquitectura MoE pura, lo que explica su mayor velocidad y menor VRAM a pesar de ser más grande. No se dispone de comparaciones con otros modelos fuera del ecosistema BatiAI (por ejemplo, Llama 3.1 8B o Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinaciones o toxicidad para esta cuantización específica. El modelo base Qwen puede presentar sesgos culturales y lingüísticos propios de sus datos de entrenamiento.
- La cuantización IQ4_XS introduce pérdida de precisión respecto al modelo original en fp16, lo que puede afectar a tareas de razonamiento complejo o generación de código de alta calidad.
- El soporte de idiomas se limita a inglés, coreano, japonés y chino. No se garantiza un buen rendimiento en otros idiomas, incluido el español.
- La ventana de contexto de 262K tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el uso de memoria aumenta linealmente con la longitud de la secuencia.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.5-27B puede tener restricciones adicionales impuestas por Alibaba (aunque la licencia declarada es Apache 2.0, conviene verificar los términos originales del modelo base).
- El repositorio solo ofrece una única cuantización (IQ4_XS); si se necesita mayor precisión o menor tamaño, habría que buscar otras fuentes o cuantizar manualmente desde el modelo base.
- No se han publicado resultados de benchmarks estándar, por lo que la comparación con otros modelos de la misma categoría es limitada.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/batiai/Qwen3.5-27B-GGUF
- Modelo base Qwen/Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Página en Ollama: https://ollama.com/batiai/qwen3.5-27b
- BatiFlow (herramienta de automatización local): https://flow.bati.ai
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
