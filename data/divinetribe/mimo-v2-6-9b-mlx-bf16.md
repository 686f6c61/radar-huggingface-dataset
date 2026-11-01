# divinetribe/MiMo-V2.6-9B-MLX-bf16

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo multimodal de 9.400 millones de parámetros desarrollado por el equipo MiMo de Xiaomi. Se construye mediante ajuste supervisado (SFT) sobre Qwen3.5-9B de Alibaba, empleando datos generados por MiMo que cubren programación, tareas de agente generales, codificación visual y ciberseguridad. El resultado es un modelo que combina percepción de imágenes con generación de código y comportamiento agéntico en un único checkpoint bajo licencia MIT.

La ficha que nos ocupa, `divinetribe/MiMo-V2.6-9B-MLX-bf16`, no es el modelo original sino una conversión a formato MLX en precisión bf16 completa, realizada por el usuario divinetribe, que preserva el torre de visión intacto para su ejecución nativa en Apple Silicon mediante la librería `mlx-vlm`. El repositorio contiene 760 tensores distribuidos en cuatro shards, con un peso total de 18,8 GB, y no aplica cuantización alguna: todos los pesos conservan el bf16 original.

Su relevancia actual radica en dos factores. Por un lado, ofrece una vía práctica para ejecutar un modelo visión-lenguaje de 9B con capacidades de agente y código en hardware de Apple, un nicho con tooling históricamente limitado. Por otro, su puntuación de 61,1 (avg@3) en SWE-bench Verified, superior a los 60,0 de su base Qwen3.5-9B, lo sitúa como una opción competitiva para tareas de ingeniería de software automatizada dentro de su rango de tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (torre de visión `qwen3_5_vision` + decodificador de texto `qwen3_5_text`) |
| Parámetros totales | 9.409.813.744 (9,4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Este repo: bf16 sin cuantizar. Variantes del mismo autor: 8-bit (`divinetribe/MiMo-V2.6-9B-MLX-8bit`) y 4-bit (`divinetribe/MiMo-V2.6-9B-MLX-4bit`) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16), 760 tensores en 4 shards, 18,8 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura multimodal de tipo `Qwen3_5ForConditionalGeneration`, compuesta por una torre de visión (`qwen3_5_vision`) que procesa las imágenes y las proyecta hacia un decodificador de texto (`qwen3_5_text`) basado en transformer. El checkpoint original se obtiene mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por el propio equipo MiMo, abarcando cuatro dominios: programación, tareas agénticas generales, codificación visual y ciberseguridad. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas posteriores de RLHF o DPO.

La innovación técnica más destacable del ecosistema es la conversión a MLX con la torre de visión preservada, que permite ejecutar inferencia multimodal nativa en Apple Silicon sin sacrificar precisión (bf16 completo). El autor reporta que la conversión pasó una verificación de visión funcional, y ofrece variantes cuantizadas a 8 y 4 bits para máquinas con 16 GB y 8 GB de memoria unificada respectivamente. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B.
- Generación de código y resolución de tareas de ingeniería de software, con especial énfasis en comportamiento agéntico (la métrica principal reportada es SWE-bench Verified).
- Comprensión de imágenes (image-text-to-text): descripción de escenas, control de calidad visual, generación de alt-text para productos e interfaces, y lectura de capturas de pantalla para reconstruir código.
- Codificación visual: capacidad de escribir código a partir de contenido visual, según los datos de entrenamiento reportados.
- Comportamiento agéntico multi-paso, orientado a tareas de agente generales.
- Conocimientos en ciberseguridad, incluidos en el corpus de ajuste supervisado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Control de calidad de pose en aplicaciones de movimiento**: el modelo puede analizar un fotograma con una figura superpuesta y verificar si la pose es anatómicamente correcta, contando extremidades y detectando artefactos. La model card documenta un ejemplo real de QC con un avatar translúcido sobre escena de cámara en un juego de movimiento.
- **Generación de alt-text para catálogos de producto e interfaces**: a partir de una imagen de producto o una captura de UI, el modelo produce descripciones textuales aptas para accesibilidad o indexación, aprovechando su torre de visión intacta en bf16.
- **Reconstrucción de código desde capturas de pantalla**: dadas imágenes de interfaces o fragmentos de código renderizado, el modelo puede transcribirlos a código editable, útil en flujos de migración o documentación.
- **Agente de resolución de incidencias en repositorios**: con una puntuación de 61,1 en SWE-bench Verified, el modelo es adecuado para pipelines que reciben un issue de GitHub y deben localizar, modificar y validar código, integrándose en entornos de CI/CD.
- **Asistencia a desarrolladores en Apple Silicon**: al ejecutarse vía `mlx-vlm` con pesos bf16, permite disponer de un agente de código local sin depender de servicios en la nube, útil en entornos con requisitos de privacidad.
- **Análisis de seguridad de código**: los datos de entrenamiento incluyen ciberseguridad, por lo que el modelo puede emplearse para revisar fragmentos de código en busca de patrones de riesgo, siempre con supervisión humana.
- **Prototipado rápido de aplicaciones visión-lenguaje en macOS**: la variante 4-bit (8 GB) y la 8-bit (16 GB) permiten desplegar demos multimodales en portátiles Apple sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | MiMo-V2.6-Distill-Qwen-9B (SFT) | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

El dato procede del informe técnico de MiMo-V2.6 citado en la model card. El autor advierte que otras métricas del informe (MiMo Code, MiMo Visual Coding) son conjuntos de evaluación internos de los autores y no leaderboards externos, por lo que no se incluyen aquí. No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM / memoria unificada para bf16**: el repo pesa 18,8 GB en pesos; se recomienda al menos 24 GB de memoria unificada para inferencia con margen para el contexto y el procesador de visión.
- **Variante 8-bit**: aproximadamente la mitad del tamaño, orientada a máquinas con 16 GB de memoria unificada.
- **Variante 4-bit**: la más pequeña, orientada a máquinas con 8 GB de memoria unificada.
- **GPU recomendadas**: Apple Silicon exclusivamente, dado que el formato es MLX. No aplica a A100, H100 ni RTX 4090 en esta conversión concreta.
- **Cabe en consumer hardware**: sí, en equipos Apple con memoria unificada suficiente (8, 16 o 24+ GB según la variante).
- **Opciones de despliegue**: `mlx-vlm` (librería indicada en la model card). El autor menciona además un servidor MLX nativo con API compatible con Anthropic dentro del proyecto Claude Code Local.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B (esta conversión) | 9,4B | No disponible | 61,1 (avg@3) | MIT | HuggingFace (MLX bf16, 8-bit, 4-bit) |
| Qwen3.5-9B (base) | 9B | No disponible | 60,0 | No disponible en la información | HuggingFace |
| MiMo-V2.6-Distill-Qwen-9B (original, safetensors) | 9,4B | No disponible | 61,1 (avg@3) | MIT | HuggingFace (XiaomiMiMo) |

La comparación se limita a los datos disponibles. No se dispone de información sobre otros modelos de 9B con capacidades comparables de visión y agente para ampliar la tabla.

## Limitaciones y advertencias

- **Sesgos**: no documentados en la información proporcionada; al derivar de Qwen3.5-9B y de datos generados por MiMo, puede heredar sesgos de ambas fuentes.
- **Alucinación**: riesgo inherente a modelos de 9B en tareas de razonamiento y código; la model card muestra un ejemplo de QC visual con un error real (colocó los brazos abajo en lugar de en guardia), lo que evidencia que la percepción visual no es perfecta.
- **Contexto e idiomas**: la longitud de contexto y los idiomas soportados no están documentados, lo que dificulta planificar despliegues multilingües o con ventanas largas.
- **Licencia**: MIT, permisiva para uso comercial, pero conviene verificar las condiciones de la base Qwen3.5-9B y de los datos de entrenamiento originales.
- **Restricción de plataforma**: esta conversión es exclusiva de MLX y Apple Silicon; no es directamente utilizable en CUDA ni en GPUs convencionales.
- **Precisión y memoria**: la variante bf16 requiere 18,8 GB solo en pesos, lo que limita su uso a equipos con memoria unificada amplia; las variantes cuantizadas pueden degradar ligeramente la calidad.
- **Madurez del repo**: 48 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día; se trata de una conversión reciente y poco validada por la comunidad.
- **Tool calling**: no se confirma su soporte, lo que puede limitar su uso en pipelines agénticos que dependan de function calling estructurado.

## Enlaces

- Repositorio HuggingFace (esta conversión): https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-4bit
- Modelo original Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organización Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- SWE-bench: https://www.swebench.com/
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
