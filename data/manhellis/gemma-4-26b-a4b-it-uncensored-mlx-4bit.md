# manhellis/gemma-4-26B-A4B-it-uncensored-mlx-4Bit

## Resumen

El modelo `manhellis/gemma-4-26B-A4B-it-uncensored-mlx-4Bit` es una conversión a formato MLX (4-bit) del modelo `TrevorJS/gemma-4-26B-A4B-it-uncensored`, una versión "abliterada" (sin censura) de la familia Gemma 4. El autor, manhellis, ha adaptado el modelo para su ejecución eficiente en Apple Silicon mediante la librería `mlx-lm` (versión 0.31.2). Está diseñado para generación de texto y conversación, con licencia Apache 2.0 y soporte únicamente para inglés.

La relevancia de este modelo radica en ofrecer una alternativa cuantizada y sin restricciones de seguridad para desarrolladores que trabajan en ecosistemas Apple. Sin embargo, la información disponible es escasa: no se detallan la arquitectura interna, el proceso de entrenamiento ni benchmarks. El número de parámetros según los safetensors es de 3.944.621.086 (~3,9 mil millones), lo que contrasta con el nombre del modelo que sugiere 26B-A4B (posiblemente una arquitectura Mixture of Experts con 26B totales y 4B activos). Esta discrepancia no está resuelta en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (presumiblemente transformer MoE basado en Gemma 4, sin confirmar) |
| Parametros totales | 3.944.621.086 (dato safetensors; el nombre sugiere 26B-A4B, discrepancia no resuelta) |
| Parametros activos | No disponible (el nombre sugiere 4B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. El nombre "gemma-4-26B-A4B" sugiere que se trata de un transformer con mezcla de expertos (MoE), con 26 mil millones de parámetros totales y 4 mil millones activos por token, siguiendo la línea de otros modelos Gemma de Google. No obstante, el archivo safetensors cuantizado muestra aproximadamente 3,9 mil millones de parámetros, lo que podría indicar una cuantización agresiva o una subida incompleta.

El modelo base `TrevorJS/gemma-4-26B-A4B-it-uncensored` es una versión "abliterada" de Gemma 4, es decir, se ha aplicado la técnica de abliteration para eliminar las negativas de seguridad del modelo original, permitiendo generar contenido sin los filtros habituales. No se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La conversión a MLX se realizó con `mlx-lm` 0.31.2, lo que implica una optimización para hardware Apple.

## Capacidades

- Generación de texto libre y conversación multi-turno, con soporte de chat mediante plantillas (chat template).
- Al ser abliterado, no aplica restricciones de contenido por defecto, lo que permite generar respuestas sobre temas que otros modelos rechazarían.
- Según las etiquetas de HuggingFace, podría tener capacidades de imagen-texto (image-text-to-text), aunque no se confirma en la documentación.
- No se indica soporte explícito para tool calling, function calling o razonamiento multi-paso.
- Limitado al idioma inglés.

## Casos de uso

- Escritura creativa sin filtros: el modelo puede generar narrativa, poesía o diálogos sobre temas controvertidos o adultos sin las restricciones habituales de los modelos de seguridad, lo que resulta útil para autores que exploran géneros oscuros.
- Chat conversacional experimental: para prototipos de asistentes que requieran respuestas directas sin evasivas, aunque con el riesgo de contenido inapropiado.
- Investigación sobre alineación y seguridad: dado que es una versión abliterada, puede servir para estudiar el comportamiento de modelos sin restricciones y comparar con versiones censuradas.
- Generación de contenido para juegos de rol o ficción interactiva: su capacidad para manejar temas tabú permite crear experiencias narrativas más libres.
- Pruebas de técnicas de cuantización y despliegue en Apple Silicon: al ser un modelo MLX 4-bit, es útil para evaluar el rendimiento de inferencia en Macs con chips M1/M2/M3/M4.
- Desarrollo de demos locales sin conexión: gracias a su tamaño reducido (14,2 GB en el repositorio), puede ejecutarse en equipos con memoria unificada moderada, ideal para aplicaciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda realizar evaluaciones propias antes de usar el modelo en entornos críticos.

## Requisitos de hardware

- Al ser una conversión MLX 4-bit, está optimizado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- El tamaño del repositorio es de 14,2 GB, lo que sugiere que el modelo necesita aproximadamente 3-4 GB de memoria unificada para cargar los pesos en 4-bit.
- Se recomienda un Mac con al menos 8 GB de RAM unificada para inferencia fluida; con 16 GB o más se puede trabajar cómodamente.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; para usarlo en otros entornos sería necesario convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp).
- Despliegue mediante `mlx-lm` (pip install mlx-lm), que permite cargar el modelo y generar texto con pocas líneas de código.
- Latencia y throughput no disponibles; dependerán del chip concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que la combinación de abliteration, cuantización MLX 4-bit y el supuesto tamaño 26B-A4B no tiene referencias claras. Se podría comparar con otros modelos abliterados de la comunidad (por ejemplo, versiones sin censura de Llama o Mistral), pero no hay datos objetivos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Al ser un modelo abliterado, carece de los mecanismos de seguridad habituales: puede generar contenido ofensivo, ilegal, sexualmente explícito o peligroso. Su uso en producción conlleva un alto riesgo legal y ético.
- La discrepancia entre el nombre (26B-A4B) y los parámetros reales (~3,9B) sugiere que el archivo subido podría estar incompleto o mal etiquetado, lo que afecta a la fiabilidad del modelo.
- Solo soporta inglés; cualquier otro idioma producirá resultados degradados.
- No se conoce la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- Riesgo de alucinaciones: al no tener datos de entrenamiento ni benchmarks, no se puede evaluar su precisión factual.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado.
- No se garantiza la estabilidad del modelo: al ser una conversión no oficial, puede haber artefactos de cuantización que afecten a la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manhellis/gemma-4-26B-A4B-it-uncensored-mlx-4Bit
- Modelo base (TrevorJS/gemma-4-26B-A4B-it-uncensored): https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
