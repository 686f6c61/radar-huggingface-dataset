# moinonin/qwen2.5-coder-7b-promex

## Resumen

El modelo `moinonin/qwen2.5-coder-7b-promex` es un fine-tuning mediante adaptadores LoRA del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, entrenado sobre el corpus Spec-Forge. Su propósito es convertir peticiones de funcionalidad expresadas en lenguaje natural en especificaciones YAML estructuradas y validadas, que siguen la metodología COMMAND_RUNWAY. Cada especificación generada incluye campos como `task_id`, `summary`, `depends_on`, `local_goals`, `global_goals_refs` y `context`, y cada objetivo local incorpora un flujo de verificación `Inspect → Create/Modify → Verify`.

El modelo está pensado para equipos de desarrollo que trabajan con un stack concreto (TypeScript, Express, Prisma, Vitest) y necesitan automatizar la generación de especificaciones listas para ser ejecutadas por un orquestador. Al estar basado en Qwen2.5-Coder-7B, hereda la arquitectura transformer decoder-only de 7.000 millones de parámetros, aunque el entrenamiento se realizó con una longitud máxima de secuencia de 2048 tokens. El repositorio contiene únicamente los adaptadores LoRA (0,2 GB), no los pesos completos del modelo base.

La relevancia actual radica en que aborda un problema específico: la brecha entre requisitos en lenguaje natural y especificaciones técnicas accionables, un paso habitual en pipelines de desarrollo automatizado. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7B (modelo base) + adaptadores LoRA (rank 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (maxima en entrenamiento); contexto del modelo base no especificado |
| Tipos de cuantizacion | 4-bit NF4 (entrenamiento), GGUF q4_k_m (inferencia) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-7B-Instruct` y aplica adaptadores LoRA de rango 16 (alpha 32, dropout 0.1) sobre los módulos de atención y feed-forward (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-4, optimizador AdamW de 8 bits, scheduler coseno con warmup del 10%, y un tamaño de lote efectivo de 4 mediante acumulación de gradientes. La cuantización base fue de 4 bits NF4.

Los datos de entrenamiento provienen de 475 prompts semilla distribuidos en 21 categorías de funcionalidad. Las respuestas fueron generadas sintéticamente por el propio modelo base (Qwen2.5-Coder-7B-Instruct) ejecutado vía Ollama a temperatura 0.2. Cada especificación generada pasó por un validador YAML endurecido (78 casos de prueba) y un sistema de puntuación con umbral de 0.75. El formato de entrenamiento fue de chat con turnos `system`, `user` y `assistant`.

No se menciona el uso de RLHF ni DPO; el ajuste es exclusivamente supervisado sobre el corpus sintético.

## Capacidades

- Generacion de especificaciones YAML estructuradas segun la metodologia COMMAND_RUNWAY, con campos obligatorios como `task_id`, `summary`, `depends_on`, `local_goals`, `global_goals_refs` y `context`.
- Cada `local_goal` incluye un flujo de verificacion de tres etapas: `Inspect`, `Create/Modify` y `Verify`.
- Validacion automatica de las especificaciones generadas mediante un validador endurecido que comprueba vocabulario canonico, deteccion de casi-duplicados y seguridad YAML.
- Puntuacion de las especificaciones segun criterios de preparacion para runbook, con una puerta dura que asigna 0.0 si falta alguna de las etapas Inspect/Create/Verify.
- Generacion de texto en formato conversacional, aunque su uso principal es la salida de documentos YAML puros.
- Soporte limitado a un unico idioma (ingles) y a un stack tecnologico fijo (TypeScript, Express, Prisma, Vitest).

## Casos de uso

- Generacion de especificaciones para endpoints de API: el modelo puede convertir una peticion como "anade un endpoint POST /health que devuelva 200 OK" en un YAML completo con tareas de inspeccion, modificacion y verificacion, listo para ser ejecutado por un orquestador.
- Automatizacion de tareas de desarrollo en pipelines CI/CD: las especificaciones generadas pueden integrarse en flujos de integracion continua para crear issues, ramas o pull requests con los cambios descritos.
- Documentacion tecnica de requisitos: a partir de descripciones en lenguaje natural, el modelo produce especificaciones formales que sirven como documentacion estructurada para equipos de desarrollo.
- Creacion de runbooks de mantenimiento: el modelo puede generar pasos de inspeccion y verificacion para tareas recurrentes, como actualizaciones de dependencias o cambios de configuracion.
- Prototipado rapido de funcionalidades: los desarrolladores pueden describir una caracteristica y obtener una especificacion accionable que luego se revisa y ajusta manualmente antes de implementarla.
- Formacion de modelos de generacion de codigo: las especificaciones YAML generadas pueden usarse como datos de entrenamiento o evaluacion para otros modelos que necesiten entender requisitos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona dos metricas de evaluacion propias:

- **Validation rate**: porcentaje de especificaciones que superan el validador YAML endurecido.
- **Score pass rate**: porcentaje de especificaciones con puntuacion >= 0.75 en el runbook scorer.

El objetivo declarado es un score pass rate superior al 80% en prompts no vistos, pero no se proporcionan valores concretos de resultados. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 7B, la carga en 4-bit requiere aproximadamente 4-6 GB de VRAM; en 8-bit, unos 8 GB; en 16-bit, unos 14 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 o RTX 4090 son suficientes para inferencia con cuantizacion. Para entrenamiento o fine-tuning adicional, se recomienda al menos 16 GB de VRAM.
- Compatibilidad con consumer GPU: si, siempre que se use cuantizacion (4-bit u 8-bit) o el formato GGUF.
- Opciones de despliegue: el adaptador puede cargarse con Hugging Face Transformers + PEFT, o bien usarse el GGUF q4_k_m con Ollama o llama.cpp. Tambien es posible servirlo con vLLM o TGI si se fusionan los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoria (generacion de especificaciones YAML para metodologia COMMAND_RUNWAY). La comparacion mas relevante es con el modelo base:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7B | No especificado | Generacion de codigo general | Apache 2.0 |
| qwen2.5-coder-7b-promex (este) | 7B + LoRA | 2048 (entrenamiento) | Generacion de especificaciones YAML | Apache 2.0 |

Frente al modelo base, este fine-tuning reduce la flexibilidad general a cambio de una salida mas estructurada y validada para un caso de uso concreto. No hay alternativas publicas conocidas con el mismo enfoque.

## Limitaciones y advertencias

- El corpus de entrenamiento es sintetico, generado por el propio modelo base, por lo que la calidad de las especificaciones esta limitada por la capacidad del modelo original para generar especificaciones correctas.
- Las especificaciones estan limitadas a un alcance de un solo archivo y una sola funcionalidad; no soporta epicas multi-etapa ni cambios que abarquen multiples modulos.
- El modelo esta fijado a un stack tecnologico concreto (TypeScript, Express, Prisma, Vitest); no funcionara correctamente con otros lenguajes o frameworks.
- La cuantizacion GGUF q4_k_m introduce una degradacion menor de calidad respecto a la fusion en 16 bits.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- El modelo genera especificaciones, no codigo ejecutable. Todas las salidas deben pasar por el validador endurecido y ser revisadas por un humano antes de alimentar un ejecutor COMMAND_RUNWAY.
- No se han publicado evaluaciones independientes ni benchmarks estandar, por lo que su rendimiento en tareas generales de generacion de codigo es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido; se recomienda validar su comportamiento en un entorno de pruebas antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moinonin/qwen2.5-coder-7b-promex
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio del modelo base (GitHub): https://github.com/huggingface/Qwen2.5-Coder
- Informe tecnico de Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v1
- Repositorio del proyecto Spec-Forge (citado en la model card): https://github.com/nickrotich/githeri
