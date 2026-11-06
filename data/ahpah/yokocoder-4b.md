# ahpah/YokoCoder-4B

## Resumen

YokoCoder-4B es un ajuste fino (fine-tune) orientado a programación sobre Qwen3.5-4B en su variante "abliterated", es decir, con los mecanismos de rechazo suavizados o eliminados por el autor intermedio wangzhang. Lo publica el usuario ahpah en Hugging Face y se distribuye principalmente como GGUF cuantizado en Q4_K_M, con un peso de descarga de aproximadamente 2,7 GB, lo que lo convierte en un modelo pensado para ejecución local en hardware modesto mediante Ollama.

El modelo parte de la arquitectura de Qwen3.5-4B (transformer denso de 4.205.751.296 parámetros según los safetensors del repositorio) y se ha entrenado en tres fases según la model card: un fine-tune inicial de código, tres épocas adicionales sobre ejemplos de generación del juego Flappy Bird y cinco épocas más sobre un conjunto de 12 ejemplos de código (28 ventanas de entrenamiento). El resultado es un checkpoint pequeño, con licencia Apache 2.0 y contexto configurado a 16.384 tokens en el Modelfile incluido.

Su relevancia es acotada pero concreta: cubre el nicho de asistentes de código ligeros, ejecutables sin GPU dedicada, con licencia permisiva y sin restricciones de rechazo en las respuestas. No obstante, el volumen de datos de ajuste es muy reducido (12 ejemplos en la última fase, 20 pasos de optimización, pérdida final de 1,0559), por lo que debe evaluarse como un experimento de ajuste más que como un modelo de código de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configurado en el Modelfile) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); safetensors en el repositorio |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parámetros. Sobre esa base se aplicó primero una variante "abliterated" (wangzhang/Qwen3.5-4B-abliterated), que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones. Posteriormente, ahpah realizó un fine-tune específico de código, seguido de tres épocas sobre ejemplos de generación del juego Flappy Bird y, finalmente, cinco épocas adicionales sobre un conjunto de 12 ejemplos de código que generan 28 ventanas de entrenamiento.

El entrenamiento de la última fase consta de 20 pasos de optimización con una pérdida final de 1,0559, y los pesos actualizados se han fusionado en el archivo Q4_K_M. El repositorio incluye el adaptador LoRA de esta continuación en `adapters/dataset4-5epochs/`, junto con los registros de entrenamiento y un manifiesto de procedencia (`export_manifest_5epochs.json`). No se documentan detalles sobre el volumen total de tokens de código, la composición del dataset ni el uso de RLHF o DPO; la información disponible indica únicamente ajuste supervisado sobre conjuntos muy pequeños.

## Capacidades

- Generación de texto y código en inglés, con especialización en tareas de programación tras el fine-tune.
- Generación de código de juegos simples: el checkpoint previo superó una prueba de generación del juego Flappy Bird, y la versión de cinco épocas pasó una prueba de humo con tres casos de funciones Python en Ollama.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`) y con el formato de plantilla de Qwen3.5.
- Ejecución local mediante Ollama y otros runtimes compatibles con GGUF de Qwen3.5.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de código en local sin GPU: el GGUF Q4_K_M de 2,7 GB se puede ejecutar en CPU con Ollama, lo que permite autocompletar y explicar fragmentos de código en portátiles sin acelerador dedicado.
- Generación de prototipos de juegos simples: gracias al entrenamiento específico con ejemplos de Flappy Bird, puede producir esqueletos jugables en Python o JavaScript para demos rápidas y ejercicios docentes.
- Pruebas de humo en pipelines de CI: al ser un modelo pequeño y determinista en cuanto a despliegue, sirve para validar plantillas de generación de código antes de escalar a modelos mayores.
- Entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrarlo en productos comerciales sin las restricciones de otros modelos de código.
- Experimentación con modelos "abliterated": útil para investigadores que estudian el efecto de la eliminación de rechazos en la calidad y seguridad de las respuestas de código.
- Educación y talleres: su tamaño reducido y su contexto de 16.384 tokens permiten desplegarlo en aulas o entornos con recursos limitados para enseñar ajuste fino y cuantización.
- Base para nuevos fine-tunes: el adaptador LoRA incluido y el manifiesto de exportación facilitan continuar el entrenamiento con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una prueba de humo con tres casos de funciones Python en Ollama y una comprobación de generación local registrada en `ollama_smoke_test_5epochs.json`, sin métricas cuantitativas comparables.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para el GGUF Q4_K_M (2,7 GB de archivo más overhead de contexto); en torno a 8-9 GB para los pesos en safetensors en precisión completa (bf16/fp16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para la versión Q4_K_M (GTX 1650, RTX 3050, RTX 4060); para safetensors en precisión completa se recomienda RTX 3060 de 12 GB o superior.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más para la cuantización Q4_K_M; también es viable en CPU.
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp y otros runtimes compatibles con GGUF de Qwen3.5; para safetensors, frameworks estándar de Hugging Face Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| YokoCoder-4B | 4,2 B | 16.384 | Apache 2.0 | GGUF, safetensors | Fine-tune de código sobre Qwen3.5-4B abliterated |
| Qwen3.5-4B (base) | 4,2 B | no disponible | no disponible | safetensors | Modelo original de Qwen; sin ajuste de código ni abliteración |
| wangzhang/Qwen3.5-4B-abliterated | 4,2 B | no disponible | no disponible | safetensors | Base directa de YokoCoder, con rechazos suavizados |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El ajuste de la última fase se realizó sobre solo 12 ejemplos de código (28 ventanas, 20 pasos de optimización), por lo que el riesgo de sobreajuste y de degradación de capacidades generales es alto.
- El modelo es una variante "abliterated": se ha reducido deliberadamente la tendencia a rechazar peticiones, lo que aumenta el riesgo de generar contenido inapropiado o código inseguro sin advertencias.
- Solo declara soporte de inglés; el rendimiento en castellano no está validado.
- Riesgo de alucinación en APIs, librerías y sintaxis no vistas durante el ajuste, dado el escaso volumen de datos de entrenamiento.
- El contexto de 16.384 tokens está configurado en el Modelfile, pero no se documenta la longitud de contexto nativa del modelo base ni su comportamiento en ventanas largas.
- Aunque la licencia es Apache 2.0, el modelo base y la variante abliterated pueden tener condiciones adicionales; conviene revisar `UPSTREAM_MODEL_CARD.md` y `LICENSE` antes de un uso comercial.
- El repositorio tiene un volumen muy bajo de descargas (119) y ninguna valoración (0 likes), por lo que no hay validación comunitaria independiente.
- No se documentan evaluaciones de seguridad, sesgos ni robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahpah/YokoCoder-4B
- Modelo base abliterated: https://huggingface.co/wangzhang/Qwen3.5-4B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card upstream incluida en el repositorio: `UPSTREAM_MODEL_CARD.md`
- Registro de prueba de humo: `ollama_smoke_test_5epochs.json`
- Manifiesto de exportación: `export_manifest_5epochs.json`
- Adaptador LoRA de la última fase: `adapters/dataset4-5epochs/`
