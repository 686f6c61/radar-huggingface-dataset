# nativ-community/SenseNova-Loop-9B-4bit

## Resumen

SenseNova-Loop-9B-4bit es una conversión cuantizada a 4 bits para MLX del modelo multimodal SenseNova-Loop-9B, desarrollado originalmente por SenseTime (organización `sensenova`) y adaptado por la comunidad `nativ-community`. El modelo acepta entradas de texto e imagen y produce texto, y está pensado para ejecutarse en Apple Silicon mediante la librería `mlx-vlm`. Su particularidad arquitectónica es el uso de un transformer con bucles (looped transformer): 32 capas físicas que se ejecutan como 56 visitas, cada una con su propia caché, lo que aumenta la profundidad efectiva sin incrementar el número de parámetros.

El modelo base cuenta con 9.412.959.856 parámetros totales (aproximadamente 9,4 mil millones) y está bajo licencia Apache 2.0. Esta versión cuantizada reduce el peso de los ficheros a 5,963 GB (5,553 GiB), aplicando cuantización afín de 4 bits con tamaño de grupo 64 a las proyecciones y embeddings del lenguaje, mientras que la torre de visión permanece en BF16 y los pesos y sesgos del router mHC se mantienen en FP32 idénticos al checkpoint original.

Es relevante para desarrolladores que quieran desplegar un modelo visión-lenguaje en hardware Apple sin depender de GPUs dedicadas, a costa de requerir una versión específica de `mlx-vlm` que incluya soporte para SenseNova Loop (PR #2752). La información pública disponible es limitada: la model card del autor de la conversión documenta el proceso de cuantización y validación, pero remite a la model card original para los detalles de entrenamiento y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer); 32 capas físicas ejecutadas como 56 visitas; torre de visión + proyecciones de lenguaje; router mHC |
| Parametros totales | 9.412.959.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens según la model card de la conversión (no validado en su totalidad) |
| Tipos de cuantizacion | 4 bits afín (affine), tamaño de grupo 64, en proyecciones y embeddings de lenguaje; torre de visión en BF16; router mHC en FP32 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 5,963 GB (5,553 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: el modelo define 32 capas físicas de decodificador que se ejecutan de forma iterativa hasta completar 56 visitas, cada una con una caché independiente. Este esquema de "looping" incrementa la profundidad efectiva del cómputo sin multiplicar el número de parámetros. El modelo incorpora además una torre de visión para entradas de imagen y un router mHC (multi-head routing) cuyos pesos y sesgos se conservan en FP32. En esta conversión se omite la compuerta de bucle (loop gate) que solo se usa durante el entrenamiento.

La conversión se realizó directamente desde el checkpoint en coma flotante del modelo original en la revisión `329a65f`, usando MLX 0.32.4 y el comando `mlx_vlm convert` con `--dtype bfloat16 -q --q-bits 4 --q-group-size 64 --q-mode affine`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card de la conversión remite a la model card original para esos detalles.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Comprensión de imágenes: descripción de imágenes y respuesta a preguntas sobre contenido visual (pipeline `image-text-to-text`).
- Entrada de múltiples imágenes mediante lista ordenada y `num_images=len(images)`.
- Modo de razonamiento ("thinking") activable con `enable_thinking=True` en la plantilla de chat.
- Aritmética básica verificada en las pruebas de humo (17 + 25 = 42).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente visual local en Mac: el modelo puede describir imágenes y responder preguntas sobre ellas ejecutándose íntegramente en Apple Silicon con MLX, sin necesidad de GPU dedicada, gracias a sus 5,963 GB de pesos cuantizados.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo para catálogos o bibliotecas de imágenes, aprovechando la torre de visión en BF16 para preservar calidad en la codificación visual.
- Procesamiento de documentos con varias imágenes: el soporte de listas ordenadas de imágenes permite pasar varias páginas o capturas en una misma petición y obtener una respuesta consolidada.
- Prototipado de aplicaciones conversacionales bilingües inglés-chino: el modelo cubre ambos idiomas de forma nativa, útil para demos y validación de producto antes de escalar a infraestructura con GPU.
- Razonamiento guiado con modo thinking: para tareas que requieren pasos intermedios explícitos, se puede activar `enable_thinking=True` y obtener una traza de razonamiento antes de la respuesta final.
- Evaluación e integración en pipelines MLX: sirve como banco de pruebas para desarrolladores que quieran validar la PR #2752 de `mlx-vlm` o construir herramientas propias sobre la API `load`/`generate`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversión indica explícitamente que las pruebas realizadas (generación de texto codiciosa y descripción de imagen en un Apple M5 Max con 128 GB de memoria unificada) son "smoke checks, not a quality benchmark".

## Requisitos de hardware

- Memoria: los pesos ocupan 5,963 GB (5,553 GiB); se recomienda al menos 16 GB de memoria unificada para dejar margen a la caché KV y al procesamiento de imágenes, aunque no se especifica un mínimo oficial.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada (prueba de humo del autor).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; esta conversión está pensada para MLX en Apple Silicon. Para CUDA habría que usar el checkpoint original en otro formato.
- Despliegue: `mlx-vlm` con soporte de SenseNova Loop (PR #2752). Si la versión instalada no lo incluye, el autor indica instalar la revisión validada `git+https://github.com/Neywa-Labs/mlx-vlm.git@3e90e9d9628ab386ff8dfbe561b09859cad9e3b9`.
- Latencia y throughput: no disponibles.
- Contexto: el límite de 512K tokens no ha sido validado en esta conversión.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Validación limitada: las pruebas realizadas son de humo (una operación aritmética y una descripción de imagen); no hay evaluación de calidad ni de robustez.
- Contexto no validado: el límite de 512K tokens no se ha comprobado en esta conversión.
- Verificador especulativo no soportado: el verificador especulativo fusionado de Qwen3.5 no es compatible y la implementación lo rechaza.
- Dependencia de una versión específica de `mlx-vlm`: sin la PR #2752 o la revisión fijada, el modelo no carga.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables a cualquier modelo generativo de este tipo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la model card del modelo original para condiciones adicionales del upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/nativ-community/SenseNova-Loop-9B-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del checkpoint original usada en la conversión: https://huggingface.co/sensenova/SenseNova-Loop-9B/tree/329a65f701ba8c48b73c30d0cbaa6f0449733673
- PR de soporte SenseNova Loop en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2752
- Revisión validada de mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm.git@3e90e9d9628ab386ff8dfbe561b09859cad9e3b9
