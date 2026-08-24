# shoemoney/Ornith-1.5-9B-Abliterated-MLX-mixed36

## Resumen

Ornith-1.5-9B-Abliterated-MLX-mixed36 es una cuantización en formato MLX (mixed 3/6 bits) del modelo `huihui-ai/Huihui-Ornith-1.5-9B-abliterated`, que a su vez deriva de Ornith-1.5-9B, un modelo denso de 9.000 millones de parámetros orientado a tareas de programación y razonamiento, desarrollado por Ornith AI y publicado con licencia MIT. Esta versión concreta ha sido convertida por el usuario shoemoney para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería `mlx-vlm`.

La relevancia de este modelo radica en que combina tres características: un tamaño compacto (9B) que permite despliegue en una sola GPU o en dispositivos de borde, una licencia permisiva MIT que facilita su uso comercial, y un proceso de "abliteración" que elimina los mecanismos de rechazo del modelo original, ofreciendo respuestas sin censura. La cuantización mixta 3/6 bits reduce el peso en disco a 6,42 GB, lo que lo hace viable en Macs con memoria unificada moderada. El modelo está pensado para desarrolladores que necesitan un asistente de código local, rápido y sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, basada en Qwen3.5 (según tags del repo) |
| Parametros totales | 1.843.944.688 (según safetensors del repo; el modelo base declara 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta 3/6 bits (grupo de 64), también existe versión 4-bit del mismo base |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura transformer densa, sin mezcla de expertos, diseñada para eficiencia en una sola GPU. Según la documentación de Ornith AI, el entrenamiento se basa en un marco de "auto-andamiaje" (self-scaffolding) y "auto-mejora" (self-improvement): el modelo propone nuevas tareas, genera andamiajes específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

Esta versión concreta no ha sido reentrenada ni ajustada: es una conversión puramente de cuantización realizada con `mlx_vlm.convert` a partir de los pesos BF16 del modelo abliterado de Huihui AI. El proceso de abliteración elimina selectivamente las direcciones de rechazo del modelo original, lo que reduce la probabilidad de que se niegue a responder a ciertas peticiones. La cuantización mixta 3/6 bits asigna 3 bits a la mayoría de los pesos y 6 bits a las capas más sensibles, con un tamaño de grupo de 64, buscando un equilibrio entre compresión y calidad.

## Capacidades

- Generación de código y asistencia en programación: el modelo base obtiene 70,6 en SWE-bench Verified, lo que indica competencia en resolución de problemas de ingeniería de software.
- Razonamiento complejo: 86,4 en GPQA Diamond, lo que sugiere capacidad para responder preguntas científicas de alto nivel.
- Posible soporte multimodal: el uso de `mlx-vlm` sugiere que el modelo puede procesar entradas de imagen y texto, aunque no se confirma en la documentación disponible.
- Sin censura (abliterated): el modelo no aplica los rechazos habituales de seguridad, por lo que puede generar contenido que otros modelos se negarían a producir.
- Ejecución optimizada para Apple Silicon: gracias a la cuantización MLX, aprovecha la memoria unificada y los aceleradores neuronales de los chips M-series.
- Soporte de tool calling y agentes: no se especifica explícitamente, pero al ser un modelo de codificación moderno es probable que herede estas capacidades del base.

## Casos de uso

- Asistente de programación local en Mac: un desarrollador puede ejecutar el modelo en su MacBook Pro con chip M3 o superior, usando `mlx_vlm.generate` para obtener sugerencias de código, explicaciones y refactorizaciones sin enviar datos a la nube.
- Generación de código en entornos sin conexión: al ser un modelo de 6,42 GB, cabe en portátiles con 16 GB de RAM unificada, permitiendo trabajar en aviones, trenes o entornos con conectividad restringida.
- Automatización de tareas de desarrollo: integrado en un pipeline de CI/CD, el modelo puede generar tests unitarios, documentación o parches para issues, gracias a su capacidad de razonamiento y generación de código.
- Prototipado rápido de agentes de codificación: al ser abliterated, se puede usar para experimentar con agentes autónomos que necesiten explorar soluciones no convencionales sin que el modelo se niegue a realizarlas.
- Educación y aprendizaje de programación: el modelo puede actuar como tutor que explica conceptos, depura código y propone ejercicios, con la ventaja de no tener filtros que limiten las preguntas.
- Investigación en alineación y seguridad: al ser una versión sin censura, sirve como banco de pruebas para estudiar el comportamiento de modelos "desinhibidos" y desarrollar técnicas de mitigación.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Ornith-1.5-9B (no a esta cuantización específica), según la fuente ai-tldr.dev:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70,6 |
| GPQA Diamond | 86,4 |

Para esta cuantización concreta, la model card reporta una perplejidad de 6,736 medida sobre `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123), con un factor de 1,26× respecto al mejor escalón de la misma familia. El throughput medido en un Apple M3 Ultra (96 GB) es de 67,6 tok/s con una petición concurrente y 164,4 tok/s con 8 peticiones concurrentes. Estos valores de perplejidad solo son comparables dentro de la familia de cuantizaciones del mismo modelo base, no con otros modelos.

## Requisitos de hardware

- Tamaño en disco: 6,42 GB, por lo que requiere al menos 8 GB de memoria libre para cargar los pesos.
- VRAM estimada: al ser MLX, usa memoria unificada; se recomienda un mínimo de 16 GB de RAM unificada en Apple Silicon para una experiencia fluida.
- GPU recomendadas: Apple M1 Pro/Max/Ultra o superior; también funciona en M2 y M3. No está pensado para GPUs NVIDIA (el formato MLX es específico de Apple).
- Opciones de despliegue: mediante `mlx-vlm` (librería oficial de Apple para modelos de visión-lenguaje en MLX). No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: en un M3 Ultra se midieron 67,6 tok/s (1 petición) y 164,4 tok/s (8 concurrentes). En chips más modestos (M1, M2) el rendimiento será menor, pero aún utilizable para tareas interactivas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | No disponible | MIT | BF16 | Modelo original, sin cuantizar ni abliterar |
| Ornith-1.5-9B-MLX-4bit | 9B | No disponible | MIT | MLX 4-bit | Cuantización uniforme a 4 bits del mismo base |
| Ornith-1.5-9B-Abliterated-MLX-mixed36 (este) | 9B (declarado) | No disponible | MIT | MLX mixed 3/6 | Cuantización mixta y abliterada |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Qwen2.5-Coder-7B o DeepSeek-Coder-6.7B) en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe usarse en aplicaciones orientadas al público general sin una capa adicional de moderación.
- La cuantización mixta 3/6 bits puede degradar ligeramente la calidad de las respuestas respecto al modelo BF16 original, especialmente en tareas de razonamiento largo o matemáticas complejas.
- El formato MLX es exclusivo de Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin una conversión adicional a otro formato (GGUF, etc.), que no está disponible en este repo.
- No se especifica la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas muy largas.
- Los idiomas soportados no están documentados; es probable que el modelo funcione mejor en inglés, dado su enfoque en código y razonamiento.
- El número de parámetros reportado en safetensors (1,84B) no coincide con la denominación de 9B del modelo base; esto puede deberse a que el archivo contiene solo una parte de los pesos (por ejemplo, el vision encoder) o a un error de etiquetado. Se recomienda verificar antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-mixed36
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo Ornith-1.5-9B original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión MLX 4-bit del mismo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Blog técnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Ficha en ai-tldr.dev: https://ai-tldr.dev/models/ornith-1-5-9b/
