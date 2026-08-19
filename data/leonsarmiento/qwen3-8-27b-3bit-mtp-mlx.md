# leonsarmiento/Qwen3.8-27B-3bit-mtp-mlx

## Resumen

El modelo `leonsarmiento/Qwen3.8-27B-3bit-mtp-mlx` es una cuantización en 3 bits del VLM (vision-language model) Qwen3.8-27B, desarrollada por el usuario leonsarmiento. Se trata de una variante específica que incorpora la capa de Multi-Token Prediction (MTP) del modelo original dentro del checkpoint, lo que permite ejecutar decodificación especulativa nativa sin necesidad de un drafter externo. Está optimizado para el ecosistema MLX (Apple Silicon) y se distribuye en formato safetensors con la librería mlx-vlm.

El modelo resuelve el problema de ejecutar un VLM de 27B parámetros en hardware con memoria limitada, manteniendo un equilibrio entre footprint reducido y velocidad de decodificación. La cuantización mixta (embeddings y head a 4 bits, torre de visión a 8 bits y resto a 3 bits) logra un tamaño de 13,04 GB, con un pico de memoria de 15,69 GB cuando la capa MTP está activa. Es relevante porque ofrece una alternativa más rápida que la cuantización 4-bit de referencia (oQ4e) en escenarios de batch ≥ 2, con un consumo de memoria significativamente menor.

La arquitectura subyacente es un transformer híbrido con 64 capas (48 de atención lineal y 16 de atención completa), una ventana de contexto de 262K tokens y una capa MTP integrada. El modelo acepta entradas de imagen y texto, y genera texto, con un chat template que incluye un parámetro `reasoning_effort` con valor por defecto `low`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (48 capas de atención lineal + 16 de atención completa) con codificador de visión, 64 capas en total, capa MTP integrada |
| Parametros totales | 27B (modelo base); checkpoint cuantizado: 3.781.761.712 (3,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | Mixta: embeddings y lm_head a 4-bit (group_size=64), torre de visión a 8-bit (group_size=64), resto a 3-bit (group_size=64); capas MTP a 4-bit (group_size=64) y fc.weight en bf16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, MLX (mlx-vlm) |

Nota: el dato de parámetros del checkpoint cuantizado (3,78B) proviene de los archivos safetensors, pero el modelo original tiene 27B parámetros; la cuantización reduce el tamaño de los tensores, no el número de parámetros.

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un VLM denso con una arquitectura híbrida de atención: 48 de sus 64 capas utilizan atención lineal (presumiblemente para reducir el coste computacional en secuencias largas) y las 16 restantes emplean atención completa. Incluye una capa de Multi-Token Prediction (MTP) que permite predecir varios tokens a la vez, habilitando la decodificación especulativa. La versión cuantizada aquí descrita mantiene esa capa MTP dentro del checkpoint, con los tensores `mtp.*` extraídos siguiendo la convención de scottlowry/oQ. La capa MTP consta de 7 tensores de normalización en bf16, una capa `fc.weight` en bf16 sin cuantizar y 7 capas lineales cuantizadas a 4 bits con group_size=64.

El proceso de cuantización aplica una receta mixta: embeddings y la cabeza de predicción (lm_head) se cuantizan a 4 bits con group_size=64, la torre de visión a 8 bits con group_size=64, y el resto de capas a 3 bits con group_size=64. Esto resulta en un peso medio de 3,716 bits por parámetro (bpw) para la base, más 0,33 GB adicionales para la capa MTP. El checkpoint final ocupa 13,04 GB distribuidos en 3 shards. No se dispone de información sobre los datos de entrenamiento del modelo original ni sobre procesos de RLHF/DPO; esta es una cuantización post-entrenamiento.

## Capacidades

- Entrada multimodal: procesa imágenes y texto, generando texto como salida (pipeline `image-text-to-text`).
- Generación de texto y razonamiento: al ser una variante de Qwen3, hereda capacidades de razonamiento, aunque la cuantización 3-bit puede degradar ligeramente la precisión.
- Decodificación especulativa nativa: la capa MTP integrada permite acelerar la generación de tokens en motores que la soporten (oMLX v0.6.1 o superior).
- Chat template con `reasoning_effort` configurable (por defecto `low`), lo que permite ajustar el nivel de razonamiento del modelo.
- Soporte de contexto largo: ventana de 262K tokens, útil para documentos extensos o conversaciones multi-turno.
- Compatible con MLX y mlx-vlm, lo que facilita su uso en hardware Apple Silicon.

No se ha confirmado soporte explícito de tool calling o function calling en la información disponible, aunque es probable que el modelo base lo tenga; no se puede afirmar con certeza.

## Casos de uso

- Descripción de imágenes para accesibilidad: el modelo puede generar descripciones detalladas de imágenes, útil en aplicaciones de asistencia a personas con discapacidad visual. Su tamaño reducido permite ejecutarlo en un Mac con 16 GB de RAM unificada.
- Asistente de atención al cliente con contexto visual: en un escenario de soporte donde el usuario envía capturas de pantalla o fotos de productos, el modelo puede responder preguntas sobre el contenido visual y mantener conversaciones multi-turno gracias a su ventana de 262K tokens.
- Análisis de documentos escaneados: al combinar OCR (si se integra externamente) con el modelo, se pueden extraer y resumir información de documentos con tablas, gráficos o diagramas.
- Generación de código con referencia visual: el modelo puede recibir una imagen de un diagrama o mockup y generar código (por ejemplo, HTML/CSS) que lo reproduzca, aprovechando su capacidad de razonamiento.
- Moderación de contenido visual: en plataformas que necesitan revisar imágenes generadas por usuarios, el modelo puede clasificar o filtrar contenido inapropiado, aunque la cuantización 3-bit podría afectar la precisión en casos límite.
- Prototipado rápido de aplicaciones VLM en entornos con recursos limitados: gracias a su footprint de 13 GB, es adecuado para desarrollo local en portátiles con GPU de 16 GB o en Macs con Apple Silicon, permitiendo iterar sobre prompts y flujos antes de desplegar en producción.
- Automatización de tareas de etiquetado: en pipelines de datos, el modelo puede generar etiquetas o descripciones para imágenes en lotes, ayudando a construir datasets de entrenamiento.

## Benchmarks y rendimiento

Los benchmarks disponibles se centran en velocidad de decodificación (tokens por segundo) y uso de memoria, medidos con oMLX v0.6.1, motor Auto, contexto de código/Python, y una configuración de prefill de 1024 tokens y generación de 128 tokens (pp1024/tg128). No se han publicado resultados de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Configuracion | tg TPS (1×) | tg TPS (4×) | Pico de memoria |
|---|---|---|---|
| 3bit-mtp, Lightning MTP ON | 20,0 | 90,9 | 15,69 GB |
| 3bit-mtp, MTP OFF | 15,3 | 67,4 | 13,16 GB |
| oQ4e-mtp de referencia (4-bit + iMatrix), MTP ON | 22,3 | 87,2 | 18,35 GB |
| oQ4e-mtp de referencia, MTP OFF | 14,8 | 59,0 | 16,41 GB |

Interpretación: con MTP activado, el modelo alcanza un +30,7% de velocidad de decodificación en un solo stream (de 15,3 a 20,0 tok/s) y supera a la referencia 4-bit en batch ≥ 2 (90,9 vs 87,2 tok/s a 4×) usando 2,66 GB menos de memoria. Sin embargo, en un solo stream queda aproximadamente un 10% por debajo del verifier 4-bit debido al ruido del verifier en la cuantización 3-bit. La model card advierte que en tareas de razonamiento intensivo, la MTP puede degradar la precisión (ejemplo citado: −7 puntos porcentuales en MATHQA con Qwen3.6-35B) y aumentar el tiempo de pared, por lo que se recomienda desactivarla en esos casos.

## Requisitos de hardware

- VRAM estimada: 13,16 GB sin MTP activa; 15,69 GB con MTP activa (según mediciones con pp1024/tg128).
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para usar MTP (por ejemplo, RTX 4090, RTX 4080, o una GPU de 16 GB como la RTX 5080); sin MTP, puede caber en GPUs de 14 GB (RTX 4070 Ti Super, por ejemplo). En Apple Silicon, requiere al menos 16 GB de memoria unificada (mejor 24 GB
