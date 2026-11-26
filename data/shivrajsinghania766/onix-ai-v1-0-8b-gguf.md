# Shivrajsinghania766/onix-ai-v1-0.8b-gguf

## Resumen

onix-ai-v1-0.8b-gguf es un modelo de lenguaje de 772.845.888 parámetros (aproximadamente 0,8 mil millones) publicado por el usuario Shivrajsinghania766 en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que lo orienta a inferencia local mediante llama.cpp y herramientas compatibles. El nombre de los ficheros de pesos (`Qwen3.5-0.8B.Q4_K_M.gguf`) indica que deriva de la familia Qwen3.5, aunque el autor no documenta explícitamente la relación con el modelo base original.

El modelo se presenta con la etiqueta `vision-language-model` y el repositorio incluye un fichero de proyección multimodal (`Qwen3.5-0.8B.F16-mmproj.gguf`), lo que sugiere capacidades de entrada de imagen además de texto. El autor indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth. No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación.

La relevancia de esta ficha es limitada: el repositorio no tiene descargas ni likes, no declara licencia, no especifica idiomas y no publica benchmarks. Se trata, por tanto, de un modelo experimental de nicho cuyo interés principal es técnico (un VLM de menos de 1B en GGUF ejecutable en hardware muy modesto), no de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5, según nombres de fichero); detalles no disponibles |
| Parámetros totales | 772.845.888 (≈0,8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M y F16 (proyección multimodal mmproj); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); fichero mmproj F16 para el componente de visión |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. Los nombres de los ficheros (`Qwen3.5-0.8B`) apuntan a un transformer de la familia Qwen3.5 de 0,8B parámetros, y la presencia de un fichero `mmproj` (proyección multimodal) indica una arquitectura vision-language con un codificador visual conectado al modelo de lenguaje mediante un proyector. No se documenta el tipo de atención, la longitud de contexto nativa ni si emplea atención lineal o híbrida.

Respecto al entrenamiento, el autor solo declara que el ajuste fino y la conversión a GGUF se hicieron con Unsloth. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica adicional. Tampoco se detalla qué datos multimodales se usaron para el componente de visión.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes como entrada (vision-language model), con soporte de inferencia multimodal vía `llama-mtmd-cli`.
- Ejecución mediante llama.cpp con plantillas Jinja (`--jinja`), lo que permite aplicar el chat template del modelo.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso a través de APIs compatibles con OpenAI en infraestructura de Hugging Face.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un GGUF de 0,8B, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite validar flujos de chat antes de migrar a modelos mayores.
- Experimentación con modelos vision-language en hardware modesto: el fichero `mmproj` permite probar pipelines de imagen + texto (por ejemplo, descripción de imágenes o VQA sencilla) en equipos con poca VRAM.
- Evaluación de ajustes finos con Unsloth: sirve como ejemplo práctico de un modelo afinado y convertido a GGUF con dicha herramienta, útil para reproducir el pipeline en otros modelos.
- Pruebas de integración con llama.cpp y `llama-mtmd-cli`: permite validar la cadena de herramientas de inferencia multimodal antes de desplegar modelos de mayor tamaño.
- Generación de texto offline en entornos con restricciones de red: al ser un fichero GGUF descargable y autónomo, puede desplegarse en sistemas aislados para tareas de texto básicas.
- Docencia y demostraciones: su tamaño reducido (0,8 GB de repositorio) facilita incluirlo en talleres sobre cuantización, GGUF y modelos multimodales sin requerir infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M de un modelo de 0,8B ocupa del orden de 0,5 GB; con el fichero mmproj F16 y el contexto de trabajo, la huella total se mantiene por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (previa importación del GGUF), y endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| onix-ai-v1-0.8b-gguf | ≈0,8B | no disponible | no disponible | GGUF | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B (referencia de la familia Qwen) | 3B | 32K (según documentación pública de Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF | Amplia |
| SmolVLM-500M (Hugging Face) | ≈0,5B | 2K–8K según variante | Apache 2.0 | safetensors, GGUF | Amplia |

La comparación es orientativa: no se dispone de datos verificables sobre el modelo base exacto ni sobre su rendimiento, por lo que las cifras de los modelos alternativos provienen de su documentación pública y no de una evaluación conjunta.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, por lo que no es recomendable para tareas críticas.
- Repositorio sin tracción (0 descargas, 0 likes) y creado recientemente: no hay validación por parte de la comunidad.
- Idiomas no declarados: el rendimiento multilingüe es desconocido y probablemente limitado en un modelo de 0,8B.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y la ausencia de información sobre alineación (RLHF/DPO).
- Contexto desconocido: no se puede planificar su uso en conversaciones de contexto largo.
- Posibles sesgos derivados de un dataset de ajuste fino no documentado.
- La relación con Qwen3.5 no está confirmada oficialmente por el autor; los nombres de fichero son la única pista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shivrajsinghania766/onix-ai-v1-0.8b-gguf
- Unsloth (herramienta de ajuste fino y conversión): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
