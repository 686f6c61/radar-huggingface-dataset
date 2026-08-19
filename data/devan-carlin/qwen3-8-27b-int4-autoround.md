# devan-carlin/Qwen3.8-27B-int4-AutoRound

## Resumen

Qwen3.8-27B-int4-AutoRound es una cuantización INT4 del modelo Qwen/Qwen3.8-27B, producida por Devan Carlin utilizando Intel AutoRound. El objetivo es reducir el tamaño del modelo de aproximadamente 52 GB (BF16) a unos 18 GB, manteniendo una calidad equivalente en tareas de matemáticas, lógica, algoritmos y código, según las pruebas del autor. Esta cuantización está pensada para ejecutarse en hardware Intel Arc Pro B70 mediante vLLM con tensor parallelism, aunque también es compatible con otras plataformas de inferencia.

El modelo base Qwen3.8-27B emplea una arquitectura qwen3_5 (Qwen3_5ForConditionalGeneration) con 64 capas y una mezcla de atención lineal y completa en proporción 3:1. La cuantización conserva la capacidad de predicción multi-token (MTP) al mantener la capa `mtp.fc` en BF16 y cuantizar el resto de capas MTP a INT4. Con una ventana de contexto de 256K tokens, este modelo es relevante para aplicaciones que requieren procesar documentos extensos o conversaciones de larga duración en hardware de gama media.

La relevancia actual de esta ficha radica en que permite ejecutar un modelo denso de 27B en cuatro GPUs Intel Arc Pro B70 (32 GB cada una) con un rendimiento un 58 % superior al de la versión BF16 (47,8 tok/s frente a 30,2 tok/s), sin sacrificar calidad en los prompts evaluados. Es una opción práctica para desarrolladores que buscan desplegar modelos de gran tamaño en entornos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (Qwen3_5ForConditionalGeneration), 64 capas, atencion 3:1 lineal:full |
| Parametros totales | 6.284.446.960 (segun safetensors; el modelo base se anuncia como 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | INT4 (w4g128), AutoRound, mixto simetrico/asimetrico; `mtp.fc` en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura qwen3_5 con 64 capas y un esquema de atención híbrido: tres capas de atención lineal por cada capa de atención completa (proporción 3:1). Esta combinación busca reducir el coste computacional del mecanismo de atención en secuencias largas, manteniendo la capacidad de modelar dependencias de largo alcance. No se dispone de detalles sobre el dataset de entrenamiento del modelo base, aunque se sabe que es de código abierto bajo licencia Apache-2.0.

La cuantización se realizó con Intel AutoRound, un método de cuantización basado en redondeo con optimización de gradiente. Se empleó un tamaño de grupo de 128 (w4g128) y un esquema mixto simétrico/asimétrico para los pesos. La capa `mtp.fc` se mantiene en BF16 para preservar la funcionalidad de predicción multi-token (MTP), mientras que el resto de capas MTP se cuantizan a INT4. El resultado es un checkpoint de aproximadamente 18 GB que conserva la capacidad MTP del modelo original.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de matemáticas, lógica, algoritmos y código, como se indica en las pruebas de calidad del autor (paridad con BF16 en estos dominios).
- Predicción multi-token (MTP): la cuantización mantiene la capa `mtp.fc` en BF16, lo que permite al modelo seguir generando varios tokens por paso, acelerando la inferencia.
- Contexto largo: soporta hasta 262.144 tokens, adecuado para documentos extensos, análisis de código o conversaciones multi-turno prolongadas.
- Multimodalidad: el pipeline_tag del modelo es `image-text-to-text`, lo que sugiere que el modelo base podría procesar imágenes además de texto. Sin embargo, la model card no detalla esta capacidad, por lo que no se puede confirmar su funcionamiento tras la cuantización.
- Integración con vLLM: compatible con el servidor vLLM, incluyendo tensor parallelism, prefix caching y kv-cache en fp8.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPUs Intel Arc Pro B70: el modelo está optimizado para ejecutarse en 4x Intel Arc Pro B70 (32 GB cada una) mediante vLLM con tensor parallelism, logrando 47,8 tok/s. Es adecuado para entornos de desarrollo e investigación que necesitan un LLM de 27B sin depender de la nube.
- Procesamiento de documentos legales o técnicos extensos: gracias a su contexto de 256K tokens, puede analizar contratos, informes o manuales completos en una sola pasada, extrayendo información o resumiendo secciones específicas.
- Generación de código en proyectos grandes: el modelo base muestra paridad con BF16 en prompts de código, por lo que puede usarse para autocompletar, revisar o refactorizar repositorios con múltiples archivos, aprovechando el contexto largo para mantener coherencia entre archivos.
- Asistentes de razonamiento matemático y lógico: indicado para aplicaciones de tutoría o resolución de problemas que requieren pasos de razonamiento detallados, donde la calidad se mantiene respecto al modelo sin cuantizar.
- Chatbots con memoria extendida: la ventana de 256K permite mantener historiales de conversación muy largos sin truncamiento, útil para atención al cliente o asistentes personales que necesitan recordar interacciones previas.
- Inferencia en entornos con memoria limitada: al ocupar solo ~18 GB, puede ejecutarse en una única GPU de 24 GB (p. ej., RTX 3090/4090) con contexto reducido, o en configuraciones multi-GPU para contexto completo, habilitando aplicaciones de IA generativa en hardware de consumo.

## Benchmarks y rendimiento

La model card proporciona un benchmark específico en hardware Intel Arc Pro B70 (4 GPUs, TP=4, max_tokens=16384):

| Modelo | Velocidad de generacion | Tamano |
|---|---|---|
| Qwen3.8-27B INT4 (este repo) | 47,8 tok/s | ~18 GB |
| Qwen3.8-27B BF16 | 30,2 tok/s | ~52 GB |

El autor reporta una mejora del 58 % en velocidad respecto a BF16 y una paridad de calidad en prompts de matemáticas, lógica, algoritmos y código (respuestas finales idénticas). También advierte que el modelo cuantizado genera más tokens de razonamiento (más verboso), por lo que en salidas muy largas puede alcanzar el límite de `max_tokens` antes que BF16; se recomienda aumentar ese límite si es necesario.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos INT4 ocupan ~18 GB. Para el contexto completo de 256K tokens se recomienda al menos 4x 32 GB (como en la configuración de prueba). Con contexto reducido, podría caber en una GPU de 24 GB.
- GPUs recomendadas: Intel Arc Pro B70 (32 GB) en configuración de 4 GPUs con tensor parallelism. También compatible con GPUs AMD (según el blog de AMD) y probablemente NVIDIA, aunque no se han publicado pruebas.
- Opciones de despliegue: vLLM (comando proporcionado en la model card), también se menciona LM Studio y Lemonade para AMD en el blog de AMD.
- Latencia y throughput: 47,8 tok/s en la configuración de 4x Arc Pro B70 con TP=4 y max_tokens=16384. No se dispone de datos para otras configuraciones.
- Nota: para el path XPU/ARK con vLLM, se requiere un fix específico para el guard de `qzeros` (ver PR referenciado en la model card), de lo contrario las capas simétricas fallan con un error `copy_() shape mismatch` durante la carga de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad (4x Arc Pro B70) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B (anunciado) | 256K | BF16 | 30,2 tok/s | Apache-2.0 |
| Qwen3.8-27B-int4-AutoRound (este repo) | 6,28B (safetensors) / 27B (anunciado) | 256K | INT4 w4g128 | 47,8 tok/s | Apache-2.0 |
| Qwen3.8-27B-MixedInt4-AutoRound (otro repo) | 27B | No disponible | INT4 mixto | No disponible (20,8 GB) | Apache-2.0 |

La alternativa MixedInt4-AutoRound (mencionada en el foro de NVIDIA) tiene un tamaño de 20,8 GB, ligeramente mayor que la de este repo, pero no se dispone de benchmarks comparativos. El modelo base BF16 es el punto de referencia de calidad, aunque requiere el doble de memoria.

## Limitaciones y advertencias

- La cuantización INT4 puede introducir pérdida de precisión en tareas no evaluadas por el autor (solo se verificaron matemáticas, lógica, algoritmos y código). Se recomienda validar en el dominio de aplicación específico.
- El número de parámetros reportado por safetensors (6,28B) no coincide con la denominación "27B" del modelo base. Esto podría deberse a un error en el registro o a una arquitectura con pesos compartidos; se debe verificar con el modelo base original.
- El pipeline_tag indica `image-text-to-text`, pero la model card no confirma si la cuantización preserva las capacidades multimodales del modelo base. No se ha probado la entrada de imágenes.
- El modelo genera respuestas más verbosas que BF16, lo que puede afectar a la latencia en salidas largas si se fija un `max_tokens` bajo.
- Para el hardware Intel Arc (XPU), es necesario aplicar el fix de `qzeros` en vLLM; sin él, la carga de pesos falla.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de este modelo cuantizado. Estas dependen del modelo base, cuyos detalles no se han publicado en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/devan-carlin/Qwen3.8-27B-int4-AutoRound)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Perfil de Devan Carlin en GitHub](https://github.com/devan-carlin/devan-carlin)
- [Blog de AMD sobre Qwen3.8 27B en hardware AMD](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Foro de NVIDIA sobre Qwen3.8-27B-MixedInt4-AutoRound](https://forums.developer.nvidia.com/t/qwen3-8-27b-mixedint4-autoround-the-new-single-spark-king/380248)
- [Ficha de Qwen3.8-27B en AI Release Tracker](https://aireleasetracker.com/model/qwen/qwen3.8-27b)
