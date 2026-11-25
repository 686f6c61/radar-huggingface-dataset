# sergolsub/mlx-drex-v1.5-9B

## Resumen

sergolsub/mlx-drex-v1.5-9B es una conversión a 8 bits en formato MLX del modelo nace-ai/drex-v1.5, orientada a ejecución en Apple Silicon mediante la librería mlx_lm. No se trata de un modelo de propósito general para generación de texto libre, sino de un modelo especializado en tareas de decisión estructurada: clasificación binaria (noul), elección entre opciones (choice) y puntuación sobre una escala (score). El autor de la conversión es sergolsub; los pesos originales pertenecen a nace-ai.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y un repositorio de 10,5 GB. La conversión aplica cuantización de 8 bits sin reentrenamiento ni cambios de arquitectura, y conserva la licencia upstream NACE AI OPEN RAIL-M LICENSE (MODIFIED). Según las mediciones del autor en un Mac mini M4 Pro de 48 GB, la versión de 8 bits mantiene exactamente la calidad del bf16 original en su conjunto de evaluación (78,4% de accuracy, 84,6% en noul, 80,0% en choice, 66,7% en score) con una perplejidad de calibración de 2,068 frente a 2,053 del original.

Su relevancia actual radica en que ofrece una vía práctica para desplegar un modelo de 9B especializado en decisiones sobre hardware de consumo Apple, con latencias medidas de 431 ms de mediana y 5,69 decisiones cortas por segundo sostenidas, y con una divergencia KL media respecto al bf16 de solo 4,69e-04 en las probabilidades de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (config.json con etiqueta qwen3_5_text; incluye atención lineal en la capa 0 según la auditoría de tensores) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe también una versión de 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m-license-modified (other) |
| Formato de pesos | safetensors en layout MLX, más config.json, tokenizer, chat_template.jinja, drex_mlx.py, decision_config.json, joint_config.json y head.pt |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3_5_text en el config y de la auditoría de tensores, que revela una capa con atención lineal (model.language_model.layers.0.linear_attn.in_proj_a.weight). El modelo incorpora una cabeza de decisión adicional (head.pt, 8 MB) y ficheros de configuración específicos para el modo de decisión y la cabeza conjunta, lo que sugiere un diseño con cabezas especializadas para tareas de clasificación y puntuación sobre representaciones del modelo base. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo upstream.

La conversión realizada por sergolsub es puramente de cuantización: no hay reentrenamiento ni modificación de arquitectura. El autor publica una auditoría de calidad de cuantización a nivel de tensor (427 tensores comparados, KL media 3,84e-04, máxima 5,47e-03, 249 tensores con KL distinto de cero) y una comparación de divergencia KL en las probabilidades de decisión frente al bf16 original (media 4,69e-04, p95 2,17e-03, máximo 4,54e-03 sobre 97 filas). Como innovación destacable, el repositorio incluye checksums SHA-256 de todos los ficheros y scripts de auditoría reproducibles (kl_weight_audit.py, output_kl.py).

## Capacidades

- Decisión binaria (noul): responde preguntas de sí/no sobre un texto de entrada con instrucciones explícitas.
- Elección entre opciones (choice): selecciona una categoría entre un conjunto de criterios definidos, por ejemplo la asignación de un ticket a un equipo.
- Puntuación sobre escala (score): asigna un valor de una lista ordenada de criterios, por ejemplo la severidad de un incidente.
- Salida de probabilidades de decisión por pregunta, lo que permite umbrales y calibración.
- Procesamiento de texto de hasta 512 tokens en las pruebas del autor (404 tokens reales), con soporte de múltiples preguntas por objeto de decisión.
- No soporta imagen (512x512 no soportado) ni detección de cajas (box no soportado).
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o generación de código: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo decide si un mensaje de cliente solicita un reembolso (noul) o a qué equipo corresponde (choice entre billing y shipping), con latencias de 431 ms de mediana que permiten clasificar en tiempo real dentro de un flujo de atención al cliente.
- Enrutamiento automático de incidencias: con la tarea choice y criterios personalizados, se puede dirigir cada incidencia al equipo adecuado (pagos, entregas, infraestructura) sin entrenar un clasificador específico.
- Priorización de alertas: mediante la tarea score con criterios como "cosmetic", "annoying" o "blocks", se asigna severidad a errores de producción (por ejemplo, cuota de disco excedida en un worker) para ordenar la cola de resolución.
- Moderación o verificación de contenido: la tarea noul permite responder preguntas booleanas sobre textos (¿contiene datos personales?, ¿es una queja?) con probabilidades asociadas para fijar umbrales.
- Automatización de back-office: clasificación de correos y formularios entrantes en categorías operativas, ejecutándose localmente en un Mac mini M4 Pro con 11,3 GB de RSS pico, lo que evita enviar datos sensibles a servicios externos.
- Evaluación de calidad en pipelines internos: uso del modelo como juez binario o por escala sobre respuestas generadas por otro sistema, aprovechando su throughput sostenido de 5,69 decisiones cortas por segundo.
- Prototipado en Apple Silicon: integración vía mlx_lm con carga en menos de 5 segundos y un único fichero de pesos de 10,47 GB en disco, adecuado para entornos de desarrollo en portátiles y equipos de sobremesa Apple.

## Benchmarks y rendimiento

Evaluación propia del autor sobre su conjunto de evaluación (Mac mini M4 Pro 48 GB, MLX 8 bits), comparando con los pesos bf16 originales y con la versión de 4 bits:

| Version | Accuracy | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 78,4% | 84,6% | 80,0% | 66,7% | 2,053 | referencia | 17,91 GB | 476 ms |
| 8 bits (este modelo) | 78,4% | 84,6% | 80,0% | 66,7% | 2,068 | 4,69e-04 | 10,47 GB | 431 ms |
| 4 bits | 84,1% | 92,3% | 84,0% | 70,8% | 1,978 | 5,28e-02 | 6,5 GB | 1292 ms |

Divergencia KL de las probabilidades de decisión (nats, 97 filas):

| Par | Media | p95 | Máximo |
|---|---|---|---|
| original → 8 bits | 4,69e-04 | 2,17e-03 | 4,54e-03 |
| 8 bits → 4 bits | 5,35e-02 | 2,29e-01 | 7,73e-01 |
| original → 4 bits | 5,28e-02 | 2,12e-01 | 8,07e-01 |

Otras métricas medidas: carga en 4,96 s, RSS pico de 11,31 GB, 1121 ms para texto de 512 tokens (binario), 1204 ms (multichoice), 1121 ms (score), y Decision Index 0.4.1 de 49,17. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: unos 11,3 GB de RSS pico medidos con MLX 8 bits; el modelo ocupa 10,47 GB en disco.
- Hardware probado: Mac mini M4 Pro con 48 GB de memoria unificada. No hay mediciones en otras configuraciones.
- GPU recomendadas: no disponible para CUDA; el formato MLX está orientado a Apple Silicon (series M).
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada, aunque solo hay medición directa en un M4 Pro de 48 GB.
- Opciones de despliegue: mlx_lm con el cargador drex_mlx.py incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 431 ms de mediana por decisión, 5,69 decisiones cortas por segundo sostenidas, carga de 4,96 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/mlx-drex-v1.5-9B (8 bits) | 8,95B | no disponible | 78,4% accuracy; PPL 2,068; KL 4,69e-04 vs bf16 | OpenRAIL-M modificada | MLX, 310 descargas |
| sergolsub/drex-v1.5-9B-MLX-4bit | 8,95B | no disponible | 84,1% accuracy; PPL 1,978; KL 5,28e-02 vs bf16 | OpenRAIL-M modificada | MLX |
| nace-ai/drex-v1.5 (bf16 original) | 8,95B | no disponible | 78,4% accuracy; PPL 2,053 | OpenRAIL-M modificada | transformers |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación y decisión estructurada de ~9B) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada: no está pensado para generación libre de texto, código o matemáticas; su uso fuera de las tareas noul, choice y score no está documentado.
- Sin soporte de imagen ni de detección de cajas, pese a que el nombre pueda sugerir capacidades multimodales.
- Idiomas soportados no especificados; no hay garantía de rendimiento fuera del idioma de entrenamiento del modelo upstream.
- Longitud de contexto no documentada; las pruebas del autor se limitan a textos de unos 404-512 tokens.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un clasificador, el riesgo se traslada a decisiones erróneas con probabilidades mal calibradas.
- Licencia OpenRAIL-M modificada: impone restricciones de uso (uso responsable) y puede limitar el uso comercial; prevalece el LICENSE del repositorio upstream en caso de conflicto.
- Solo hay mediciones de rendimiento en un Mac mini M4 Pro de 48 GB; el comportamiento en otros equipos Apple Silicon no está verificado.
- La versión de 4 bits obtiene mejores métricas de accuracy que la de 8 bits en la evaluación del autor, pero con mayor divergencia KL (5,28e-02) y latencia casi tres veces superior (1292 ms); conviene validar la elección de cuantización en el dominio propio.
- El repositorio incluye código ejecutable (drex_mlx.py, code/kev/*) que debe revisarse antes de su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-drex-v1.5-9B
- Modelo upstream: https://huggingface.co/nace-ai/drex-v1.5
- Versión de 8 bits (referenciada en la model card): https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-8bit
- Versión de 4 bits: https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-4bit
- Licencia: fichero LICENSE del repositorio (OpenRAIL-M modificada)
