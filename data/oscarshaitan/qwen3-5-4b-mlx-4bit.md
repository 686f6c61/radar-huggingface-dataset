# OscarShaitan/Qwen3.5-4B-MLX-4bit

## Resumen

OscarShaitan/Qwen3.5-4B-MLX-4bit es una conversión cuantizada a 4 bits del modelo Qwen/Qwen3.5-4B, publicada por el usuario OscarShaitan y pensada específicamente para ejecutarse en Apple Silicon mediante el framework MLX. Se trata de un modelo de visión y lenguaje (etiquetado como vision-language-model), por lo que acepta tanto texto como imágenes de entrada. El repositorio ocupa 3,1 GB y los pesos suman 4.539.265.536 parámetros almacenados en formato MLX SafeTensors con cuantización de 4 bits y tamaño de grupo 64, lo que equivale a 5,347 bits por peso según la propia model card.

El problema que resuelve es práctico: permitir que un VLM de aproximadamente 4,5 mil millones de parámetros quepa en memoria unificada de un Mac con un consumo de disco de unos 2,9 GB, sin depender de GPUs NVIDIA ni de servicios en la nube. Es relevante en el ecosistema de inferencia local en macOS, donde MLX es la vía nativa para aprovechar la memoria unificada de los chips M-series, y donde las versiones bf16 del mismo modelo rondarían los 9 GB.

La conversión se realizó con `mlx-vlm` desde la rama `pc/fix-qwen35-predicate`, que incorpora correcciones para el soporte de Qwen3.5 (gestión de capas MoE, `shared_expert_gate` y casteo de `A_log`). El propio autor advierte de que pueden existir conversiones mejores mantenidas por la organización mlx-community una vez que el soporte oficial de Qwen3.5 se fusione en la rama principal. El repositorio no tiene descargas ni likes y no se han publicado benchmarks ni especificaciones detalladas del modelo base en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-4B; la nota de conversión menciona capas MoE y casteo de `A_log`) |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | no disponible (la información de conversión sugiere componentes MoE, pero no se confirma que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, 5,347 bits por peso, group size 64; no se distribuyen variantes GGUF, AWQ ni GPTQ en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | MLX SafeTensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Framework de inferencia | mlx-vlm |
| Modalidad | texto e imagen (vision-language-model) |
| Tamaño del repositorio | 3,1 GB (tamaño en disco declarado: ~2,9 GB) |
| Fecha de publicación | 24 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-4B. Lo único documentado es el proceso de conversión: se ejecutó `mlx_vlm convert` sobre el checkpoint original con cuantización de 4 bits y group size 64, desde una rama concreta de `mlx-vlm` que corrige el tratamiento de capas de mezcla de expertos (MoE gate layers), del módulo `shared_expert_gate` y del casteo del parámetro `A_log`. Estos elementos sugieren que el modelo base incorpora componentes de mezcla de expertos y, posiblemente, bloques de atención con estado (del tipo SSM o atención lineal, donde `A_log` es un parámetro habitual), pero esto no se confirma en la información proporcionada y debe verificarse en la model card del modelo original.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO u otras. Tampoco se documenta ninguna innovación técnica adicional en esta conversión más allá de las correcciones de compatibilidad citadas. La cuantización introduce una pérdida de precisión respecto al checkpoint bf16, cuyo impacto concreto no está medido en la información disponible.

## Capacidades

- Generación de texto: uso conversacional y de completado estándar mediante el pipeline de `mlx-vlm`.
- Comprensión de imágenes: el modelo está etiquetado como vision-language-model y el ejemplo de uso oficial pasa una ruta de imagen junto a un prompt de texto ("Describe this image.").
- Descripción y análisis de imágenes: la API `generate` acepta `image` y `max_tokens`, lo que permite tareas de captioning y preguntas sobre imágenes.
- Generación de texto condicionada por instrucciones: el ejemplo oficial usa un prompt en formato instrucción.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible; solo se confirma la entrada de imagen.
- Ejecución local en Apple Silicon: capacidad verificada mediante MLX, sin necesidad de GPU dedicada.

## Casos de uso

- Asistente de escritorio privado en macOS: el modelo se puede cargar con `mlx-vlm` dentro de una aplicación nativa y procesar tanto texto como capturas de pantalla sin enviar datos a servicios externos, algo relevante para flujos con información sensible.
- Descripción automática de imágenes y texto alternativo: dado que acepta una ruta de imagen y un prompt, puede generar alt-text y descripciones para herramientas de publicación o gestores de contenido que corren en un Mac.
- Extracción de información de documentos escaneados o capturas: con un prompt estructurado se pueden obtener campos concretos (fechas, importes, nombres) de facturas, tickets o formularios fotografiados, en local y sin coste de API.
- Soporte técnico con capturas de error: un asistente que recibe la pantalla de un fallo y el mensaje de texto del usuario para proponer pasos de diagnóstico, ejecutado en el propio equipo del técnico.
- Prototipado de agentes multimodales en portátiles: el repositorio sirve como banco de pruebas para validar prompts y flujos de visión-lenguaje antes de escalar a modelos mayores o a infraestructura con GPU.
- Clasificación y moderación de contenido visual: etiquetado de imágenes por categorías mediante prompts de clasificación, útil en pipelines de curación de datasets donde la latencia no es crítica.
- Análisis de gráficos y diagramas en investigación: interpretación de figuras extraídas de PDFs científicos para resumir tendencias o extraer valores aproximados, como paso previo a una revisión manual.
- Demo educativa de cuantización: ejemplo práctico para explicar el impacto del formato MLX y de la cuantización de 4 bits frente a bf16 en memoria y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, ni para esta conversión cuantizada ni para el modelo base. Tampoco se documentan mediciones de latencia o throughput. Cualquier comparación numérica con otras versiones tendría que obtenerse ejecutando la evaluación sobre el modelo.

## Requisitos de hardware

- Pesos en 4 bits: aproximadamente 2,9 GB en disco, según la model card, sobre un repositorio de 3,1 GB.
- Memoria unificada mínima práctica: alrededor de 6-8 GB, sumando pesos, caché KV y activaciones para contexto corto. Con 8 GB puede ser ajustado si se procesan imágenes de resolución alta o contextos largos.
- Memoria unificada recomendada: 16 GB o más en un chip Apple Silicon (familias M1, M2, M3 o M4) para trabajar con imágenes y contextos extensos con margen.
- GPU NVIDIA/CUDA: no compatible de forma nativa, ya que el formato es MLX SafeTensors y la librería de inferencia es `mlx-vlm`, específica de Apple Silicon.
- Comparativa de memoria con otras precisiones del mismo modelo: la versión bf16 ocuparía aproximadamente 9,1 GB de pesos (cálculo directo a partir del recuento de parámetros), y la de 8 bits alrededor de 5,5 GB, por lo que la variante de 4 bits es la única que entra con holgura en equipos de 8 GB.
- Opciones de despliegue: `mlx-vlm` en Python (API `load`/`generate`) y su CLI `python3 -m mlx_vlm.generate`; entornos gráficos compatibles con MLX en macOS. Para `llama.cpp`, Ollama o TGI sería necesario convertir a GGUF u otro formato, algo que este repositorio no ofrece.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y el rendimiento dependerá del chip concreto, del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño de pesos | Formato | Licencia |
|---|---|---|---|---|---|
| OscarShaitan/Qwen3.5-4B-MLX-4bit | 4.539.265.536 | 4 bits (5,347 bpw, group 64) | ~2,9 GB | MLX SafeTensors | Apache-2.0 |
| Qwen/Qwen3.5-4B (original) | ≈4,54 B | bf16 | ~9,1 GB (calculado a partir del recuento de parámetros) | safetensors | Apache-2.0 |
| mlx-community/Qwen3.5-4B-MLX-bf16 | ≈4,54 B | bf16 | no disponible | MLX SafeTensors | Apache-2.0 |
| mlx-community/Qwen3.5-4B-MLX-8bit | ≈4,54 B | 8 bits | ~5,5 GB (estimado a partir del recuento de parámetros) | MLX SafeTensors | Apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes, ni de modelos de otros fabricantes con los que contrastar en la información proporcionada. La diferencia verificable entre ellas es el consumo de memoria y el grado de precisión de los pesos, no métricas de calidad medidas.

## Limitaciones y advertencias

- Cuantización agresiva: 4 bits (5,347 bits por peso) implica pérdida de precisión frente a bf16 o 8 bits; el impacto real no está medido y suele notarse más en tareas de razonamiento largo, matemáticas y generación de código.
- Repositorio no validado: cero descargas y cero likes, mantenido por un usuario individual en lugar de la organización oficial. El propio autor recomienda revisar mlx-community, donde puede haber conversiones mejores.
- Dependencia de una rama no fusionada: la conversión se hizo desde `pc/fix-qwen35-predicate`, con correcciones específicas para Qwen3.5; si el soporte oficial en `mlx-vlm` difiere, pueden aparecer inconsistencias de comportamiento o de compatibilidad.
- Exclusivo de Apple Silicon: no es ejecutable directamente en CUDA, ROCm ni en GPUs de consumo NVIDIA. Requiere conversión adicional para usarse con llama.cpp, Ollama o TGI.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera del inglés sin verificar el comportamiento real del modelo base.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, ni la que queda disponible tras la cuantización; conviene medirlo antes de usarlo en conversaciones multi-turno largas.
- Riesgo de alucinación: inherente a los modelos generativos del tamaño del base y no cuantificado en esta ficha. En tareas de extracción de datos de imágenes, la salida debe validarse.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre la composición del dataset de entrenamiento del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar los términos publicados por Qwen para el checkpoint original y cualquier condición adicional que pudiera aplicar a la redistribución.
- Metadatos llamativos: la fecha de creación registrada (24 de septiembre de 2026) es posterior a la fecha habitual de publicación de Qwen3.5, lo que conviene contrastar con la ficha del modelo original antes de dar por válida la trazabilidad.
- Sin benchmarks: no hay métricas publicadas que permitan afirmar que la versión de 4 bits conserva el rendimiento del modelo original en ninguna tarea concreta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OscarShaitan/Qwen3.5-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión bf16 en MLX: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-bf16
- Versión 8 bits en MLX: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- Organización mlx-community: https://huggingface.co/mlx-community
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama usada en la conversión: https://github.com/Blaizzy/mlx-vlm/tree/pc/fix-qwen35-predicate
- Licencia Apache 2.0: https://huggingface.co/Qwen/Qwen3.5-4B
