# nativ-community/SenseNova-Loop-9B-nvfp4

## Resumen

SenseNova-Loop-9B-nvfp4 es una conversión a formato MLX del modelo multimodal SenseNova-Loop-9B desarrollado por SenseNova, empaquetada por el colectivo nativ-community para su ejecución en Apple Silicon. El modelo acepta entradas de texto e imagen y produce texto, con una arquitectura de transformer "looped" (con bucles) en la que 32 capas físicas de decodificador se ejecutan como 56 visitas, cada una con su propia caché. Cuenta con 9.412.959.856 parámetros totales y está publicado bajo licencia Apache 2.0.

La relevancia de esta ficha concreta radica en su cuantización: las proyecciones y embeddings del modelo de lenguaje elegibles usan cuantización de 4 bits en formato nvfp4 con tamaño de grupo 16, mientras que la torre de visión permanece en BF16 y los pesos y sesgos del router mHC se mantienen en FP32 idénticos al checkpoint original. El resultado son ficheros de pesos de 5,963 GB, lo que permite desplegar un modelo de casi 9.400 millones de parámetros con capacidades de visión en equipos Apple con memoria unificada.

El modelo está pensado exclusivamente para el ecosistema MLX-VLM y requiere una revisión concreta de esa librería que incluya soporte para SenseNova Loop. Soporta inglés y chino, y dispone de plantilla de "thinking" opcional. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped-transformer), vision-language, 32 capas físicas ejecutadas como 56 visitas |
| Parámetros totales | 9.412.959.856 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K (límite declarado, no validado en esta conversión) |
| Tipos de cuantización | 4 bits nvfp4, group size 16 (proyecciones y embeddings del LM); vision tower en BF16; router mHC en FP32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 5,963 GB (5,553 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo "looped": el modelo tiene 32 capas físicas de decodificador que se ejecutan en 56 visitas, cada una con una caché independiente. Esta reutilización de capas permite aumentar la profundidad efectiva sin incrementar el número de parámetros. El modelo incorpora un router mHC (multi-head connection) cuyos pesos y sesgos se conservan en FP32 y son byte-idénticos a los del checkpoint original de SenseNova. La puerta de bucle ("loop gate") usada solo en entrenamiento se omite en esta conversión. El modelo combina una torre de visión (mantenida en BF16) con el modelo de lenguaje para tareas image-text-to-text.

La conversión se realizó directamente desde el checkpoint en coma flotante original de SenseNova (revisión 329a65f) usando MLX 0.32.4, con el comando de conversión a 4 bits nvfp4 y group size 16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y respuesta a preguntas, incluyendo aritmética básica (la validación del autor comprobó que "17 más 25" devuelve 42).
- Descripción y comprensión de imágenes (image-text-to-text), con soporte de múltiples imágenes mediante lista ordenada y `num_images`.
- Modo "thinking" opcional mediante `enable_thinking=True` en la plantilla de chat.
- Conversación multi-turno (tag conversational).
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico en la información disponible.

## Casos de uso

- Asistente multimodal local en Mac: el modelo permite describir imágenes y responder preguntas sobre ellas directamente en Apple Silicon con 128 GB de memoria unificada, sin depender de servicios en la nube, gracias a su cuantización nvfp4 de 5,963 GB.
- Procesamiento de documentación con imágenes en flujos de trabajo de escritorio: al aceptar entradas de imagen y texto y mantener una ventana de contexto declarada de 512K, puede emplearse para resumir o extraer información de capturas y páginas escaneadas en aplicaciones nativas de macOS.
- Prototipado de investigación en arquitecturas "looped": al conservar los 96 tensores del router mHC en FP32 idénticos al original, sirve para estudiar el comportamiento de modelos con reutilización de capas sin reentrenar.
- Evaluación de cuantización nvfp4 en MLX: útil como referencia para medir la degradación de un modelo de 9,4B con vision tower en BF16 frente al checkpoint completo.
- Aplicaciones educativas o de accesibilidad offline: descripción de imágenes para usuarios con discapacidad visual en entornos sin conexión, ejecutando el modelo con MLX-VLM en un equipo Apple.
- Experimentación con modo thinking: permite comparar respuestas con y sin `enable_thinking` en tareas de razonamiento visual y aritmético en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones realizadas (generación de texto codiciosa y descripción de imagen en un Apple M5 Max con 128 GB de memoria unificada) son "smoke checks", no una evaluación de calidad.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 5,963 GB (5,553 GiB); hay que añadir la caché KV de 56 visitas y el overhead de MLX, por lo que se recomienda un mínimo de 16 GB de memoria unificada y 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). Validado en Apple M5 Max con 128 GB de memoria unificada.
- No es compatible con GPU NVIDIA o AMD: el formato MLX y la cuantización nvfp4 de esta conversión están ligados al ecosistema Apple.
- Opciones de despliegue: MLX-VLM con soporte de SenseNova Loop (PR #2752 de Neywa-Labs); se indica instalar la revisión validada `3e90e9d9628ab386ff8dfbe561b09859cad9e3b9` si la release instalada no incluye el soporte. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-nvfp4 (esta ficha) | 9,41B | 512K (no validado) | Apache 2.0 | MLX-VLM en Apple Silicon | Cuantización nvfp4 4 bits, vision tower BF16 |
| SenseNova-Loop-9B (original) | 9,41B | 512K | Apache 2.0 | Hugging Face (sensenova) | Checkpoint en coma flotante, sin cuantizar |
| Alternativas de 9B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El límite de contexto de 512K no ha sido validado en esta conversión; el autor lo señala explícitamente.
- El verificador especulativo fusionado de Qwen3.5 no está soportado y la implementación lo rechaza.
- Solo soporta inglés y chino; no se documentan otros idiomas.
- Requiere una revisión concreta de MLX-VLM (PR #2752); sin ella el modelo no carga.
- Exclusivo para Apple Silicon: no puede desplegarse en GPU NVIDIA, AMD ni en servidores x86 convencionales.
- Las validaciones publicadas son comprobaciones mínimas (aritmética e identificación de gatos en una imagen), no una evaluación de calidad ni de robustez.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/SenseNova-Loop-9B-nvfp4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del checkpoint original: https://huggingface.co/sensenova/SenseNova-Loop-9B/tree/329a65f701ba8c48b73c30d0cbaa6f0449733673
- PR de soporte SenseNova Loop en MLX-VLM: https://github.com/Neywa-Labs/mlx-vlm/pull/2752
- Repositorio MLX-VLM (revisión validada): https://github.com/Neywa-Labs/mlx-vlm.git@3e90e9d9628ab386ff8dfbe561b09859cad9e3b9
