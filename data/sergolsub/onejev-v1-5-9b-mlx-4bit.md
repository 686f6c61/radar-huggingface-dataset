# sergolsub/onejev-v1.5-9B-MLX-4bit

## Resumen

OneJev v1.5 9B (MLX 4-bit) es una conversión cuantizada del modelo base OmniJev/OneJev1.5-9B, publicada por el usuario sergolsub, orientada a la inferencia en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo: es una derivación de pesos en 4 bits (requantizados desde una conversión previa en 8 bits) sin reentrenamiento ni cambios de arquitectura. El paquete incluye, además de los pesos en formato safetensors, un cargador propio (`onejev_mlx.py`) y ficheros de configuración para un modo de decisión con cabezas específicas.

El modelo base pertenece a la familia Qwen 3.5 (etiqueta `qwen3_5` en Hugging Face) y cuenta con 9.409.813.744 parámetros totales, lo que lo sitúa en la franja de los 9B. Su rasgo diferencial no es la generación de texto libre, sino una interfaz de decisión estructurada: el método `decide()` permite plantear tareas tipadas (`noul`, `choice`, `score`) con instrucciones y criterios, devolviendo una decisión puntuada. Esto lo hace relevante para sistemas de enrutamiento, clasificación operativa y triaje automatizado en entornos Apple.

La relevancia actual del artefacto es doble: por un lado, demuestra que modelos de 9B pueden ejecutarse en hardware de consumo Apple (Mac mini M4 Pro con 48 GB) con un consumo de memoria máximo medido de 8,24 GB; por otro, publica métricas de degradación por cuantización (PPL 2,055 en 4 bits frente a 1,988 en bf16) que permiten evaluar el coste real de comprimir a 4 bits. La licencia Apache 2.0 heredada del modelo original facilita su uso comercial, aunque con las cautelas propias de un modelo derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, etiqueta `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX); derivado de una conversión previa en 8 bits; pesos bf16 de referencia para evaluación |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX (3 shards: 4,01 GB + 3,41 GB + resto), más `config.json`, tokenizer, `chat_template.jinja` y scripts Python |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio. El artifact publicado no aporta detalles sobre número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento original; esa información correspondería al repositorio del modelo base OmniJev/OneJev1.5-9B, que no se ha proporcionado en esta ficha. Lo que sí documenta el autor es el proceso de conversión: los pesos 4-bit se obtuvieron desquantizando la conversión MLX 8-bit previa y requantizando en 4 bits afín con el mismo tamaño de grupo, sin reentrenamiento ni modificación arquitectónica.

La innovación técnica destacable no está en el entrenamiento sino en la capa de inferencia: el paquete incluye `onejev_mlx.py`, `decision_config.json` y `joint_config.json`, que implementan un modo de decisión con cabezas específicas. El método `decide(texto, especificación)` acepta un diccionario de tareas tipadas —`noul` (sí/no), `choice` (selección entre criterios con descripción) y `score` (puntuación sobre una escala de criterios)— y devuelve la decisión estructurada. El autor publica además un `kl_audit.json` de 66 KB, presumiblemente con la auditoría de divergencia KL entre la versión cuantizada y la de referencia, aunque su contenido no se detalla en la información disponible.

## Capacidades

- Decisión estructurada tipada: el método `decide()` resuelve tareas de tipo `noul` (pregunta booleana), `choice` (clasificación entre opciones con criterios descritos) y `score` (puntuación ordinal sobre una lista de criterios).
- Procesamiento de texto de entrada en lenguaje natural con contexto de tarea (instrucciones y criterios por tarea).
- Ejecución de múltiples decisiones independientes en una misma sesión, cada una como objeto separado.
- Inferencia en Apple Silicon mediante `mlx_lm`, con carga rápida (5,14 s) y huella de memoria contenida (8,24 GB de pico residente).
- Soporte de tool calling, function calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del cliente y una especificación `choice` con criterios como `billing` (pagos y reembolsos) o `shipping` (entrega y seguimiento), y devuelve el equipo responsable. Es adecuado porque la latencia medida (1.591 ms de mediana) encaja en flujos de enrutamiento por ticket y la memoria de 8,24 GB permite ejecutarlo en un Mac mini de escritorio.
- Detección de intención de reembolso: con una tarea `noul` del tipo "¿el cliente quiere un reembolso?", el modelo responde sí/no sobre el texto libre. Útil en preclasificación de correos antes de derivar a un agente humano.
- Puntuación de severidad de incidencias: mediante una tarea `score` con criterios ordinales (`cosmetic`, `annoying`, `blocks`), el modelo asigna gravedad a errores técnicos como "disk quota exceeded on the worker". Apropiado para priorización automática en colas de soporte interno.
- Enrutamiento en pipelines de CI/CD: el modelo puede clasificar fallos de build o de despliegue en categorías accionables antes de notificar al equipo correspondiente, con la ventaja de ejecutarse localmente sin enviar logs a servicios externos.
- Clasificación de correos entrantes en bandejas operativas: con tareas `choice` y criterios definidos por el equipo, se puede etiquetar correspondencia por departamento o urgencia en un servidor Apple local.
- Evaluación de calidad de respuestas en pipelines de anotación: usando `score` sobre criterios como corrección o completitud, el modelo puede preanotar datos para revisión humana, con la ventaja de que el proceso de decisión es reproducible y auditable mediante el `kl_audit.json` incluido.
- Prototipado rápido en portátiles Apple: gracias a la carga en 5,14 s y al formato MLX, investigadores pueden validar hipótesis de enrutamiento o clasificación en un MacBook antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

El autor publica métricas de calidad comparando la versión 4-bit con la referencia bf16, medidas en un Mac mini M4 Pro de 48 GB:

| Metrica | 4-bit | bf16 |
|---|---|---|
| Accuracy (eval del autor) | 84,4 % | 84,4 % |
| Noul | 90,0 % | 87,5 % |
| Choice | 80,0 % | 80,0 % |
| Score | 80,0 % | 84,0 % |
| Perplejidad de calibración | 2,055 | 1,988 |

| Metrica de inferencia (MLX 4-bit) | Valor |
|---|---|
| Tamano en disco | 7,43 GB |
| Tiempo de carga | 5,14 s |
| Memoria residente maxima | 8,24 GB |
| Latencia de decision (mediana) | 1.591 ms |
| Throughput sostenido | 1,1 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: 8,24 GB de pico residente medido en la versión MLX 4-bit; el tamaño en disco es de 7,43 GB.
- GPU recomendadas: el autor valida el modelo en Apple Silicon (Mac mini M4 Pro con 48 GB). Para GPUs NVIDIA no se proporcionan datos de compatibilidad ni rendimiento.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada (8,24 GB de pico medido deja margen suficiente); no hay datos para RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: `mlx_lm` con el cargador propio `onejev_mlx.py` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 1.591 ms por decisión y 1,1 decisiones cortas por segundo en Mac mini M4 Pro 48 GB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base OmniJev/OneJev1.5-9B sería la referencia natural, pero sus especificaciones (contexto, licencia, benchmarks, idiomas) no se han facilitado en esta ficha. Tampoco se aportan datos de otros modelos de 9B de la familia Qwen 3.5 que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/onejev-v1.5-9B-MLX-4bit | 9,41 B | no disponible | Apache 2.0 | safetensors MLX 4-bit | Conversion del anterior; 8,24 GB de pico |
| OmniJev/OneJev1.5-9B | no disponible | no disponible | Apache 2.0 (heredada) | no disponible | Modelo base original |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantización a 4 bits introduce una degradación medible: la perplejidad de calibración sube de 1,988 (bf16) a 2,055 (4-bit) y la métrica `score` baja de 84,0 % a 80,0 %. En tareas de puntuación fina, la versión bf16 puede ser preferible.
- El modelo está empaquetado exclusivamente para MLX; no se garantiza su funcionamiento en otros runtimes sin conversión adicional.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento en contextos largos; esta ausencia de información es en sí un riesgo para producción.
- Riesgo de alucinación: no evaluado en la información disponible; el modo de decisión estructurada reduce la superficie de generación libre, pero no la elimina.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que, en caso de conflicto, prevalece la licencia del repositorio upstream (OmniJev/OneJev1.5-9B). Conviene verificar dicha licencia antes de desplegar en producción.
- El modelo tiene un volumen de uso muy bajo (10 descargas, 0 likes en el momento de la consulta) y no cuenta con validación independiente de terceros; las métricas publicadas son del propio autor.
- El repositorio incluye un cargador Python propio (`onejev_mlx.py`) que debe auditarse antes de ejecutarlo, ya que se importa dinámicamente en el flujo de uso documentado.
- No hay información sobre latencia en GPUs NVIDIA ni sobre throughput con batching, lo que limita la planificación de despliegues a gran escala.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/sergolsub/onejev-v1.5-9B-MLX-4bit
- Modelo base original: https://huggingface.co/OmniJev/OneJev1.5-9B
- Librería MLX: https://github.com/ml-explore/mlx
- Documentación de `mlx_lm`: https://github.com/ml-explore/mlx-lm
