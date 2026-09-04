# Rin247/gemma-4-26B-A4B-it-Aggressive-Aquarion-INT4

## Resumen

El modelo `Rin247/gemma-4-26B-A4B-it-Aggressive-Aquarion-INT4` es una cuantización INT4 weight-only de un modelo derivado de Gemma 4 26B A4B it, modificado mediante abliteración (proyección ortogonal) para eliminar vectores de seguridad y filtros de alineación corporativos. Fue creado por el usuario Rin247 y publicado en HuggingFace. El modelo pertenece a la familia Gemma 4 de Google DeepMind, que incluye arquitecturas densas y Mixture-of-Experts (MoE), con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas según la documentación oficial. Esta versión concreta está orientada a casos de uso "sin censura", como el derecho a reparar, la investigación de seguridad y la escritura creativa madura. El repositorio contiene 14.091.376.386 parámetros en formato safetensors, con un tamaño total de 15.6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), basada en Gemma 4 26B A4B |
| Parámetros totales | 14.091.376.386 (según safetensors; el nombre del modelo indica 26B totales) |
| Parámetros activos | no disponible (la nomenclatura "A4B" sugiere 4B activos) |
| Longitud de contexto | 256K tokens (según documentación de Gemma 4) |
| Tipos de cuantización | INT4 weight-only (con escalas almacenadas) |
| Idiomas soportados | Más de 140 idiomas (según documentación de Gemma 4) |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT4 weight-only) |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada de `gemma-4-26B-A4B-it-Aggressive`, que a su vez es una versión abliterada de `gemma-4-26B-A4B-it` de Google. La arquitectura subyacente es un transformer Mixture-of-Experts (MoE) con 26B parámetros totales y 4B activos según la nomenclatura del modelo original. La abliteración se realizó mediante proyección ortogonal para eliminar los vectores de seguridad y los filtros de alineación corporativos, con el objetivo de reducir falsos rechazos en casos de uso legítimos. La cuantización se llevó a cabo con PyTorch RTN en CPU, almacenando escalas y formas junto a los pesos. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni procesos de RLHF/DPO. El modelo hereda las capacidades generales de Gemma 4, pero esta modificación no está soportada oficialmente por Google.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados de Gemma 4.
- Soporte multimodal (image-text-to-text) según el pipeline declarado en HuggingFace.
- Capacidad multilingüe en más de 140 idiomas según la documentación de Gemma 4.
- Sin filtros de seguridad corporativos (abliterated), lo que permite abordar temas que normalmente serían rechazados.
- No se ha confirmado soporte de tool calling, function calling o agentes en la información disponible.
- No se ha confirmado un modo de pensamiento ("thinking mode") ni capacidades de audio.

## Casos de uso

- Administración de redes locales: el modelo puede generar comandos de configuración para routers, servidores y firewalls sin rechazar por contenido técnico, gracias a la eliminación de filtros de seguridad.
- Tuning de ECU para vehículos off-road o de pista: puede asistir en la modificación de mapas de motor y parámetros de hardware, un área que suele ser falsamente bloqueada.
- Investigación académica de seguridad: análisis de firmware, arquitectura de sistemas y vulnerabilidades, sin interrupciones moralizantes.
- Escritura creativa madura: novelas, guiones o relatos con contenido oscuro o adulto, sin que el modelo interrumpa con advertencias.
- Generación de código y asistencia técnica en proyectos personales: hereda las capacidades de programación de Gemma 4, pero sin restricciones de contenido.
- Análisis de imágenes y texto: si el pipeline image-text-to-text se mantiene, puede describir imágenes, extraer texto o responder preguntas visuales en contextos técnicos.
- Asistente conversacional especializado en dominios técnicos: chat de soporte para hardware, reparación y temas de propiedad del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 14.091.376.386 parámetros en INT4 weight-only, los pesos ocupan aproximadamente 7 GB. Sumando activaciones, KV cache y overhead, se estima un mínimo de 10-12 GB de VRAM para inferencia con contexto moderado. Para contexto de 256K tokens, la VRAM necesaria aumentará considerablemente.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB. Es viable en GPUs de consumo con 16-24 GB.
- Opciones de despliegue: el formato de pesos es safetensors con recetas weight-only personalizadas, por lo que se requiere un motor de inferencia compatible con la dequantización mediante buffers `*.weight_scale` y `*.weight_shape`. No se proporcionan instrucciones oficiales para vLLM, llama.cpp, Ollama o TGI. Se puede convertir a GGUF para su uso con llama.cpp/Ollama, pero no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 4 26B A4B it (original) | 26B totales / 4B activos | 256K | Licencia Gemma | HuggingFace / Google |
| Gemma 4 12B | 12B | 256K | Licencia Gemma | HuggingFace / Google |
| Rin247/gemma-4-26B-A4B-it-Aggressive-Aquarion-INT4 | 14.091.376.386 (safetensors) | 256K (según familia) | no disponible | HuggingFace |

Nota: no se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de estos modelos.

## Limitaciones y advertencias

- La abliteración elimina filtros de seguridad, lo que aumenta el riesgo de generar contenido dañino, ilegal o no ético. El uso debe ser responsable.
- La licencia no está especificada. No se puede confirmar si el uso comercial está permitido. El modelo es un derivado de Gemma 4, cuya licencia original puede tener restricciones.
- La cuantización personalizada requiere un manejo especial; no es un modelo estándar compatible con todas las herramientas.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- El modelo no está soportado oficialmente por Google; puede contener errores o degradación de capacidades.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se dispone de datos específicos sobre su tasa de alucinación.
- La información sobre idiomas y contexto proviene de la documentación de Gemma 4, no de la model card de este modelo concreto.

## Enlaces

- HuggingFace: https://huggingface.co/Rin247/gemma-4-26B-A4B-it-Aggressive-Aquarion-INT4
- Model card de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
