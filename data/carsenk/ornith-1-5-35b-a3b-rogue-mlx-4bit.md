# carsenk/Ornith-1.5-35B-A3B-ROGUE-MLX-4bit

## Resumen

Ornith-1.5-35B-A3B-ROGUE-MLX-4bit es una versión cuantizada en MLX 4-bit del modelo base `ornith-ai/Ornith-1.5-35B-A3B`, desarrollada por el usuario carsenk. El modelo original pertenece a la familia Ornith-1.5 de la organización ornith-ai, que emplea un enfoque de "auto-andamiaje" (self-scaffolding) y auto-mejora para tareas de codificación agéntica. Esta versión concreta aplica además la técnica ROGUE (edición de pesos que reduce el comportamiento de rechazo del modelo) antes de la cuantización, con el objetivo de eliminar negativas innecesarias manteniendo la utilidad medida.

El modelo es un MoE (mixture-of-experts) con arquitectura Qwen 3.5, 35.950 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La versión MLX está pensada para ejecutarse en silicio de Apple (M1, M2, M3, etc.) mediante la librería `mlx-lm`. El repositorio ocupa 19,5 GB en cuatro shards de safetensors con pesos cuantizados a 4 bits (grupo de 64), mientras que los routers y las puertas de los expertos compartidos se mantienen en 8 bits. Su licencia es MIT, lo que permite uso comercial sin restricciones significativas.

Esta ficha se centra en la versión MLX 4-bit con ROGUE, no en el modelo base original. Es relevante para desarrolladores que buscan un modelo de codificación agéntica de alto rendimiento con baja huella de memoria en hardware Apple, pero que deben conocer las implicaciones de seguridad derivadas de la modificación de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 MoE (mixture-of-experts) |
| Parametros totales | 35.950 millones (35,95B) según model card; el archivo safetensors muestra 5.419.330.688, posible error de lectura |
| Parametros activos | ~3.000 millones (~3B) por token |
| Longitud de contexto | no disponible (no especificado en la informacion) |
| Tipos de cuantizacion | MLX affine 4-bit (group size 64); router y shared-expert gates en 8-bit; versiones BF16 y FP8 del modelo base disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen 3.5, con 40 capas transformer y 256 expertos enrutados. Cada token activa aproximadamente 3.000 millones de parámetros, lo que permite un equilibrio entre capacidad total y eficiencia computacional. El entrenamiento original sigue el paradigma de "auto-andamiaje" de la familia Ornith-1.5: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce soluciones para aprendizaje por refuerzo, creando un bucle de auto-mejora continua.

La versión ROGUE-MLX-4bit aplica una intervención adicional sobre los pesos del modelo base. ROGUE (refusal-direction weight-editing) estima direcciones de rechazo a partir de contrastes de activaciones entre prompts dañinos y benignos, selecciona profundidades de intervención mediante validación y proyección ortogonal, y modifica directamente las matrices de escritura residual (salidas de atención y proyecciones down de los expertos enrutados). La edición se realiza en punto flotante antes de la cuantización a 4 bits. El alcance incluye 128 tensores de escritura en 32 capas seleccionadas, incluyendo 64 tensores de expertos enrutados fusionados. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o el uso de RLHF/DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y resolucion de problemas, con enfasis en tareas de codificacion y agenticas segun la documentacion del modelo base.
- Soporte de tool calling / function calling: no especificado en la informacion disponible, aunque los modelos Qwen 3.5 suelen incluirlo; no se confirma.
- Capacidades de agente y razonamiento multi-paso: mencionadas en el blog de MindStudio, pero sin detalles tecnicos concretos.
- Capacidad multilingue: limitada al ingles (segun los metadatos de HuggingFace).
- Sin soporte de vision o audio en esta version.
- No incluye modo de pensamiento explicito (thinking mode) documentado.

## Casos de uso

- Generacion de codigo en entornos de desarrollo: el modelo puede producir funciones, algoritmos y fragmentos completos en multiples lenguajes, aprovechando su arquitectura MoE para mantener baja latencia en hardware Apple.
- Agentes autonomos de codificacion: gracias a su capacidad de razonamiento multi-paso, puede planificar y ejecutar tareas complejas como refactorizacion, generacion de tests o resolucion de incidencias en repositorios.
- Asistente de programacion en local: integrable en editores o IDEs mediante servidores compatibles con OpenAI, como el que ofrece `mlx_lm.server`, para uso sin conexion a internet.
- Automatizacion de tareas de desarrollo: el modelo puede generar scripts de build, configuraciones de CI/CD o documentacion tecnica a partir de descripciones en lenguaje natural.
- Prototipado rapido de aplicaciones: permite iterar sobre ideas de software generando codigo base y explicaciones de complejidad algoritmica.
- Investigacion en alineacion y seguridad: la version ROGUE es util para estudiar el impacto de la edicion de pesos en el comportamiento de rechazo y la utilidad del modelo, aunque no es recomendable para produccion sin control adicional.

## Benchmarks y rendimiento

La model card solo incluye una evaluacion determinista de humo (smoke test) del efecto ROGUE, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.). Los resultados son los siguientes:

| Metrica | Base MLX 4-bit | Este modelo |
|---|---:|---:|
| Tasa de marcadores de rechazo | 50,0% | 0,0% |
| Puntuacion de retencion | 95,8% | 91,7% |
| Tasa de sobre-rechazo | 0,0% | 0,0% |
| Velocidad media de generacion | 25,55 tok/s | 25,45 tok/s |

La ganancia de "uncensor" fue de 0,50 y la delta de retencion de -0,0417. Esta prueba se realizo con 40 prompts en un Apple M1 Ultra y no equivale a una evaluacion de seguridad o capacidad de nivel leaderboard. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Peso del modelo: 19,5 GB (cuatro shards safetensors), por lo que se requiere al menos esa cantidad de memoria unificada en Apple silicon.
- Plataforma: exclusivamente Apple silicon (M1, M1 Pro/Max/Ultra, M2, M3, etc.) mediante MLX. No compatible con CUDA o ROCm.
- GPU recomendada: cualquier chip Apple con al menos 24 GB de memoria unificada para cargar el modelo completo en 4-bit; 32 GB o mas para margen y contexto largo.
- Velocidad medida: ~25,4 tok/s en Apple M1 Ultra con `mlx-lm 0.31.3` y `mlx 0.32.0`.
- Opciones de despliegue: `mlx_lm.generate` para linea de comandos y `mlx_lm.server` para servir un endpoint compatible con OpenAI.
- No se dispone de datos de latencia o throughput para otros hardware.

## Comparativa con modelos similares

La documentacion del modelo base indica que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en benchmarks de codificacion y agenticos, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en codificacion agentica. Sin embargo, no se proporcionan cifras concretas. En esta ficha se comparan las versiones cuantizadas disponibles del mismo modelo base:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (BF16) | 35,95B totales / 3B activos | BF16 | no disponible | MIT | safetensors |
| Ornith-1.5-35B-A3B-FP8 | 35,95B totales / 3B activos | FP8 | no disponible | MIT | safetensors |
| Ornith-1.5-35B-A3B-ROGUE-MLX-4bit (este) | 35,95B totales / 3B activos | MLX 4-bit | no disponible | MIT | safetensors (MLX) |

No se dispone de datos de rendimiento comparativos con otros modelos de tamano similar en esta informacion.

## Limitaciones y advertencias

- La modificacion ROGUE reduce deliberadamente el comportamiento de rechazo: el modelo puede generar contenido inexacto, inseguro u objetable. No es adecuado para todos los publicos ni para entornos sin moderacion.
- La evaluacion de ROGUE es una prueba de humo determinista, no una garantia de calidad o seguridad en tareas reales. La retencion de utilidad cae un 4,17% respecto al base.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Longitud de contexto no documentada; se desconoce si soporta ventanas largas (128k, 256k) como otros modelos Qwen.
- No hay informacion sobre sesgos del modelo original ni sobre el dataset de entrenamiento.
- Aunque la licencia es MIT y permite uso comercial, el uso de esta version concreta en produccion requiere validacion exhaustiva y controles de seguridad adicionales.
- El formato MLX limita el despliegue a hardware Apple; no se puede ejecutar en GPUs de NVIDIA o AMD sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/carsenk/Ornith-1.5-35B-A3B-ROGUE-MLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Version FP8 del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Blog de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Blog de MindStudio sobre despliegue local: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Guia de Ornith AI: https://ornith.online/
