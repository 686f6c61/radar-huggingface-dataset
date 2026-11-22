# sergolsub/mammoth-v1-27B-MLX-4bit

## Resumen

Mammoth-v1-27B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo base `baselabs/mammoth-1`, publicada por el usuario sergolsub. El objetivo no es otro que permitir la ejecución del modelo original (aproximadamente 27 mil millones de parámetros, a juzgar por el nombre del repositorio) en hardware Apple Silicon mediante la librería `mlx_lm`, reduciendo el peso en disco de 54,73 GB en bf16 a 17,44 GB en 4 bits.

El modelo no es un chat genérico al uso: la model card describe una interfaz de decisión (`decide`) con cabezas tipadas (`noul`, `choice`, `score`) que clasifican o puntúan una entrada de texto según instrucciones y criterios definidos por el llamante. Es, por tanto, un modelo orientado a tareas de enrutamiento, triaje y decisión estructurada, más que a generación libre de texto.

La relevancia de esta ficha radica en que documenta una conversión comunitaria (no oficial) con métricas de calidad declaradas por el autor, licencia MIT heredada del modelo upstream y un conjunto de artefactos de inferencia propios (`onejev_mlx`, `decision_config.json`, `joint_config.json`) que se desvían del stack estándar de transformers. La información pública disponible es escasa y procede casi exclusivamente de la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `baselabs/mammoth-1`; la model card no describe la arquitectura interna) |
| Parametros totales | aproximadamente 27B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX); existe también una versión 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo upstream) |
| Formato de pesos | safetensors en layout MLX 4 bits, más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo original: no se indica si es un transformer denso, un MoE, un modelo híbrido ni detalles sobre atención o capas. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo único que se afirma explícitamente es que la conversión a 4 bits no implica reentrenamiento ni cambios de arquitectura: se parte de la conversión 8 bits del mismo autor, se desquantiza y se recuantiza con cuantización afín de 4 bits manteniendo el mismo tamaño de grupo.

El elemento técnico diferencial que sí aparece documentado es la existencia de una "decision mode" con cabezas de inferencia específicas (`*_mlx.py`, `decision_config.json`, `joint_config.json`). El autor publica métricas de calidad de la cuantización medidas sobre un conjunto de evaluación propio: precisión global del 85,6 % en 4 bits frente al 84,4 % en bf16, `noul` del 87,5 % en ambos casos, `choice` del 92,0 % en 4 bits frente al 88,0 % en bf16, `score` del 76,0 % en ambos y perplejidad de calibración de 1,928 en 4 bits frente a 1,912 en bf16. Para la conversión 8 bits se reporta una KL de salida media de 2,30e-04 nats (p95 9,10e-04, máximo 3,35e-03) sobre 100 filas; para la conversión 4 bits no se registraron probabilidades y, por tanto, no hay KL calculada.

## Capacidades

- Decisión estructurada sobre texto de entrada mediante una interfaz `decide(texto, especificacion)`, donde la especificación define el tipo de salida esperado.
- Tipo de salida `noul`: respuesta binaria sí/no a una pregunta formulada en las instrucciones (por ejemplo, si el cliente solicita un reembolso).
- Tipo de salida `choice`: selección de una categoría entre un conjunto de criterios con descripción (por ejemplo, enrutar a facturación o a envíos).
- Tipo de salida `score`: puntuación ordinal sobre una lista de criterios ordenados (por ejemplo, severidad cosmética, molesta o bloqueante).
- Procesamiento de texto de tickets, incidencias y mensajes de cliente en inglés en los ejemplos de la model card.
- No se documentan capacidades de generación libre de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni function calling.
- No se documenta explícitamente soporte multilingüe ni modo "thinking".

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y una especificación `choice` con criterios como facturación, envíos o técnico, y devuelve la categoría asignada. Es adecuado porque la interfaz está diseñada exactamente para este tipo de clasificación con criterios declarados en la llamada.
- Detección de intención de reembolso: con una especificación `noul` y la instrucción "¿el cliente quiere un reembolso?", el modelo devuelve una decisión binaria que puede alimentar un flujo de automatización de devoluciones.
- Priorización de incidencias: mediante una especificación `score` con criterios ordinales (cosmético, molesto, bloqueante), el modelo asigna severidad a errores técnicos reportados, útil para colas de soporte con SLA diferenciados.
- Enrutamiento en atención al cliente automatizada: al procesar conversaciones o mensajes individuales, el modelo decide el equipo o el flujo adecuado antes de invocar un agente humano o un bot especializado.
- Clasificación de correos o formularios entrantes: la misma interfaz `choice` permite etiquetar mensajes por departamento, tipo de solicitud o urgencia sin necesidad de entrenar un clasificador específico por caso.
- Evaluación de calidad de conversiones cuantizadas: el repositorio incluye scripts (`output_kl.py`, `kl_weight_audit.py`) y métricas de referencia que permiten reproducir la comparación entre bf16, 8 bits y 4 bits, útil para equipos que auditan cuantizaciones en Apple Silicon.
- Prototipado local en Mac: con 17,44 GB en disco y 17,83 GB de memoria residente máxima en un Mac mini M4 Pro de 48 GB, el modelo permite probar flujos de decisión en local sin depender de GPUs dedicadas.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de evaluación interna del autor sobre su propio conjunto de evaluación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Version | Precision | noul | choice | score | PPL | KL salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 84,4 % | 87,5 % | 88,0 % | 76,0 % | 1,912 | referencia | 54,73 GB | 310062 ms |
| 8 bits (MLX) | 85,6 % | 90,0 % | 88,0 % | 76,0 % | 1,913 | 2,30e-04 | 30,41 GB | 2215 ms |
| 4 bits (MLX) | 85,6 % | 87,5 % | 92,0 % | 76,0 % | 1,928 | no registrada | 17,44 GB | 2222 ms |

Mediciones de la versión 4 bits en Mac mini M4 Pro de 48 GB: carga en 6,11 s, memoria residente máxima de 17,83 GB, latencia mediana de decisión de 2222 ms y 0,35 decisiones cortas por segundo en régimen sostenido. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 17,83 GB de memoria residente máxima medida en la versión 4 bits; el peso en disco es de 17,44 GB.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada, con carga de 6,11 s y latencia mediana de 2222 ms por decisión.
- Cabe en equipos Apple Silicon con al menos 24-32 GB de memoria unificada según el margen que se quiera dejar sobre los 17,83 GB medidos; no se documentan pruebas en configuraciones menores.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni CUDA: el formato es MLX y la librería declarada es `mlx`, orientada a Apple Silicon.
- Despliegue: `mlx_lm` y el cargador propio del repositorio (`onejev_mlx.OneJev`), que se importa desde el directorio descargado con `snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 0,35 decisiones cortas por segundo en régimen sostenido en el hardware de referencia; no hay datos de throughput en otros equipos.
- La versión 8 bits requiere 30,41 GB en disco y, según la tabla, mantiene una latencia mediana similar (2215 ms) en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/mammoth-v1-27B-MLX-4bit | aprox. 27B (inferido) | no disponible | MIT | MLX 4 bits | Hugging Face, 0 descargas |
| sergolsub/mammoth-v1-27B-MLX-8bit | aprox. 27B (inferido) | no disponible | MIT | MLX 8 bits | Hugging Face |
| baselabs/mammoth-1 (original) | aprox. 27B (inferido) | no disponible | MIT | bf16 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables en la misma categoría (decisión estructurada) ni de benchmarks comunes que permitan una comparación de rendimiento. La comparación disponible se limita a las tres versiones del mismo modelo publicadas por el autor y al modelo upstream.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: el repositorio pertenece a sergolsub, no a baselabs; no hay garantía de mantenimiento ni de soporte por parte del autor original.
- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad fuera de los casos de decisión descritos.
- El modelo está orientado a una interfaz de decisión propietaria (`onejev_mlx`, `decision_config.json`, `joint_config.json`); no es un modelo de chat estándar y su uso con `transformers` o `mlx_lm` genérico no está documentado.
- Las métricas de calidad proceden de un conjunto de evaluación propio del autor, no de benchmarks independientes; la mejora aparente en 4 bits frente a bf16 (por ejemplo, `choice` 92,0 % frente a 88,0 %) debe interpretarse con cautela por el tamaño y la naturaleza del conjunto.
- No se registró la KL de salida de la versión 4 bits frente al original, por lo que no hay una medida directa de la degradación de probabilidades introducida por la cuantización a 4 bits.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de decisión con salidas acotadas (`noul`, `choice`, `score`), el riesgo se traslada a clasificaciones erróneas más que a texto inventado.
- Licencia MIT heredada del upstream; el autor indica que, en caso de conflicto, prevalece la licencia del repositorio original. No se documentan restricciones adicionales para uso comercial.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- El rendimiento medido corresponde a un único equipo (Mac mini M4 Pro, 48 GB); no hay datos de latencia en otros hardware Apple Silicon.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-4bit
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Versión 8 bits del mismo autor: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-8bit
