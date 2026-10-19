# snsnc/DayTrader-2B-SQL

## Resumen

DayTrader-2B-SQL es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) publicado por el usuario `snsnc` en HuggingFace, especializado en generación de SQL para PostgreSQL a partir de preguntas en lenguaje natural, corrección de consultas usando los errores devueltos por la base de datos e interpretación de resultados de consulta. Es un fine-tuning de peso completo en BF16 sobre `openbmb/MiniCPM5-2B-SFT`, distribuido como modelo autónomo (no como adaptador) bajo licencia Apache-2.0.

El interés del modelo es acotado y muy específico: no compite como asistente general, sino como componente de un pipeline agéntico de text-to-SQL con tool calling nativo mediante marcado XML (`<function name="postgres_read"><param name="sql">...`). Su receta de entrenamiento es deliberadamente pequeña: 800 registros de entrenamiento y 524 de desarrollo en la etapa final (V4 `amplified_100`), con 100 actualizaciones de optimizador.

La evaluación publicada es interna y especializada, no un benchmark público: 337/349 tareas correctas (96,6%) en el conjunto global, 328/328 (100%) en tareas con esquema compartido y solo 6/18 (33,3%) en tareas con esquema no visto. Esa asimetría es el dato más relevante para decidir su adopción: el modelo funciona bien cuando el esquema de la base de datos se parece a lo visto en entrenamiento y falla con frecuencia ante esquemas nuevos, agregaciones no vistas y familias de ausencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (según el tag `llama` del repo); detalles de capas, cabezas y dimensión oculta no disponibles |
| Parámetros totales | 2.516.756.480 (~2,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican artefactos cuantizados; pesos en safetensors BF16. Cuantización a 8 bits y 4 bits factible vía transformers/bitsandbytes o conversión a GGUF, sin datos oficiales de calidad |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), repo de 5,0 GB |

## Arquitectura y entrenamiento

El modelo parte de `openbmb/MiniCPM5-2B-SFT` y conserva su arquitectura transformer (el repo etiqueta la familia como `llama`). El autor indica que el checkpoint final se obtuvo mediante continuación de peso completo en BF16 con atención SDPA, no como adaptador LoRA, y que no deriva del checkpoint final RL+OPD de OpenBMB, sino de una rama de continuación propia dentro del proyecto (`V4 amplified_100`). No se documentan en la información disponible el número de capas, dimensión oculta, mecanismo de atención (si es completo o lineal/híbrido) ni la ventana de contexto nativa del modelo base.

La receta de la etapa final es explícita: AdamW con learning rate 2e-5, betas 0,9/0,999, epsilon 1e-8, weight decay 0,01, micro-batch 1 con 8 pasos de acumulación, semilla 3411 y 100 actualizaciones de optimizador, con checkpoints en los pasos 25, 50 y 100. La supervisión se limitó a las llamadas a herramienta del asistente y a la respuesta final; los mensajes de usuario, sistema y herramienta se enmascararon, y las llamadas a herramienta incorrectas se excluyeron de la supervisión. Los datos de la etapa V4 son 800 filas de entrenamiento y 524 de desarrollo, compuestas por fixtures ejecutables del propio proyecto (440 filas), tareas financieras y directas (280) y diálogo derivado de OpenAssistant (80); por cohortes: 360 de completado de SQL, 120 de transferencia SQL, 40 de reparación de SQL, 40 de primer intento de SQL, 40 de aritmética, 40 de razonamiento financiero, 40 de dimensionamiento financiero, 40 de instrucción general, 40 de diálogo multiturno, y 16/8/8/8 de grounding de estado en vivo, ficheros, shell y recuperación de errores. No se menciona RLHF ni DPO en la etapa descrita. Una etapa anterior de 1.600 instancias produjo un checkpoint intermedio distinto de esta publicación.

## Capacidades

- Generación de SQL para PostgreSQL a partir de esquema y pregunta en lenguaje natural.
- Reparación de consultas: corrige SQL a partir del mensaje de error real devuelto por la base de datos (3/3 en el subconjunto de reparación con error real).
- Tool calling nativo con marcado XML propio (`<function name="..."><param name="sql">...</param></function>`), incluido el nombre de herramienta `postgres_read`; emite el marcado incluso con un prompt plano sin definición de herramienta.
- Interpretación de resultados de consulta dentro del flujo de trabajo del agente.
- Soporte acotado de razonamiento aritmético, financiero y de dimensionamiento de posiciones (40 filas de cada tipo en el entrenamiento).
- Diálogo multiturno y seguimiento de instrucciones generales (40 + 40 filas), suficiente para mantener el formato conversacional pero sin evaluación pública.
- Grounding de estado en vivo, operaciones de fichero y shell, y recuperación de errores, con cohortes muy reducidas (16/8/8/8 filas).
- Plantilla de chat con conmutador `enable_thinking`; la evaluación publicada se hizo con thinking desactivado.
- Capacidades multimodales: no disponibles.
- Idiomas distintos del inglés: no soportados según la metadata del repo.

## Casos de uso

- Asistente SQL interno para analistas: el modelo recibe un esquema de PostgreSQL y una pregunta en lenguaje natural y devuelve una única consulta envuelta en la llamada a herramienta, lista para ejecutarse desde un orquestador que valide y ejecute el SQL.
- Autocorrección en bucle cerrado: si la consulta falla, se reinyecta el error de PostgreSQL como mensaje de herramienta y el modelo genera la reparación; es el escenario para el que se entrenó explícitamente (cohortes de reparación y recuperación de errores).
- Generación de consultas de agregación sobre esquemas conocidos y estables: con tablas y columnas parecidas a las de su distribución de entrenamiento alcanza el 100% en el subconjunto de esquema compartido, por lo que encaja en productos con un esquema fijo y bien documentado.
- Capa de text-to-SQL en un agente de análisis financiero: las cohortes de aritmética y razonamiento financiero permiten encadenar cálculo de importes sobre resultados de consulta, siempre con validación posterior del lado del servidor.
- Extracción y exploración de datos para dashboards: el modelo puede traducir preguntas recurrentes de negocio a SQL de solo lectura, integrado detrás de un endpoint con permisos restringidos y límites de filas.
- Prototipado rápido en local: con ~5 GB de pesos en BF16 cabe en GPU de consumo, lo que permite iterar sobre prompts y esquemas sin infraestructura dedicada.
- Banco de pruebas para evaluación de pipelines text-to-SQL: sirve como baseline pequeño y reproducible en experimentos de esquema compartido frente a esquema no visto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K, Spider, BIRD u otros) en la información disponible. El autor presenta únicamente una evaluación interna congelada, decodificación greedy y thinking desactivado:

| Ámbito | Resultado |
|---|---|
| Todas las tareas (349) | 337/349 (96,6%) |
| Tareas con esquema compartido | 328/328 (100%) |
| Tareas con esquema no visto (held-out) | 6/18 (33,3%) |
| Reparaciones con error real en primer intento | 3/3 (100%) |

El propio autor advierte que la cifra global está dominada por las tareas de esquema compartido, que la composición de esquema no visto es estrecha y que fallan las familias de agregación no vista y de ausencia. No hay datos de rendimiento generalista ni de razonamiento financiero; los diagnósticos internos separados mostraron resultados mixtos, incluidas regresiones en finanzas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 5,0-5,5 GB solo para pesos (2,52B × 2 bytes), más caché KV; presupuesto realista de 6-8 GB según longitud de contexto y lote.
- Cuantización a 8 bits: aproximadamente 2,5-3,5 GB de pesos. A 4 bits: aproximadamente 1,5-2,5 GB, sin métricas oficiales de degradación en tareas SQL.
- GPU recomendadas: cualquier GPU con 8 GB o más para BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, L40S). Para servicio con concurrencia, A100 40/80 GB o H100 permiten lotes grandes y mayor throughput.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8-12 GB en BF16 y en tarjetas de 6-8 GB con cuantización.
- Opciones de despliegue: `transformers` (receta oficial del autor, con `trust_remote_code=False`, `dtype=torch.bfloat16` y `enable_thinking=False` en la plantilla de chat); vLLM o TGI para servicio HTTP con batching; llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que no se publican artefactos GGUF.
- Detalle de generación en el ejemplo oficial: `do_sample=False`, `max_new_tokens=256` y `eos_token_id=[tokenizer.eos_token_id, 130073]` (el segundo es el token de fin de llamada a herramienta).
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DayTrader-2B-SQL | 2,52B | No disponible | Text-to-SQL PostgreSQL + tool calling | Apache-2.0 | HuggingFace, safetensors, 0 descargas |
| openbmb/MiniCPM5-2B-SFT (base) | ~2B (no verificado en la información) | No disponible | Asistente general SFT | Apache-2.0 | HuggingFace |
| Otras alternativas especializadas en text-to-SQL de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el modelo base: DayTrader-2B-SQL añade formato de tool calling XML, sesgo hacia PostgreSQL y reparación guiada por errores, a costa de un ajuste muy estrecho (800 filas) que puede degradar el comportamiento generalista y el razonamiento financiero, según los propios diagnósticos internos del autor. No se dispone de datos de benchmarks públicos que permitan situarlo frente a otros modelos text-to-SQL de 1B-3B.

## Limitaciones y advertencias

- La evaluación de 96,6% es interna y especializada; no es una métrica de precisión SQL general y no debe presentarse como tal.
- Caída acusada fuera de distribución: 6/18 (33,3%) en esquema no visto, con fallos en agregaciones no vistas y familias de ausencia de datos.
- Entrenamiento muy reducido en la etapa final (800 filas, 100 pasos de optimizador): riesgo alto de sobreajuste a los esquemas y al estilo de las fixtures del proyecto.
- Solo inglés; no se documenta soporte de otros idiomas.
- Solo PostgreSQL en la práctica: la herramienta de referencia es `postgres_read` y el entrenamiento no documenta otros dialectos.
- Riesgo de alucinación de tablas, columnas o funciones; toda consulta generada debe validarse y ejecutarse con permisos de solo lectura y límites de recursos.
- El autor advierte explícitamente de regresiones en razonamiento financiero y de que el modelo no debe usarse para decisiones financieras autónomas.
- Longitud de contexto no documentada: puede ser insuficiente para esquemas grandes o historiales de conversación largos.
- Emite el marcado XML de herramienta incluso con prompts planos, lo que puede romper integraciones que esperen texto o JSON limpio.
- Licencia Apache-2.0 permite uso comercial, pero la atribución al modelo base (© OpenBMB) y a las filas derivadas de OpenAssistant debe conservarse; el repo tiene 0 descargas y 0 likes, por lo que no hay validación externa de la comunidad.
- Sesgos conocidos: no documentados por el autor; los sesgos del corpus base y del subconjunto de OpenAssistant no se han evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snsnc/DayTrader-2B-SQL
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada (la búsqueda web no devolvió resultados pertinentes sobre este modelo).
