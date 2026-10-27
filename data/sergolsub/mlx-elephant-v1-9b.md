# sergolsub/mlx-elephant-v1-9B

## Resumen

mlx-elephant-v1-9B es la conversión a 8 bits para MLX de baselabs/elephant-1, un modelo de decisión de 9 409 813 744 parámetros desarrollado por Base Labs, el laboratorio de investigación de Baseten. No es un modelo generativo al uso: convierte un estado (contexto) y un conjunto de preguntas tipadas en probabilidades calibradas para respuestas de tipo elección múltiple, sí/no y puntuación, todo en un único forward pass y sin producir texto libre. El modelo original se publicó el 21 de octubre de 2026 como un fine-tune completo de Qwen3.5-9B, junto al modelo hermano mammoth-1 de 27B.

La relevancia de esta ficha concreta es práctica: permite ejecutar un modelo de decisión de 9B en Apple Silicon mediante `mlx_lm`, con un peso en disco de 11,4 GB y un pico de memoria residente medido de 12,21 GB en un Mac mini M4 Pro de 48 GB, con latencias declaradas de 657 ms (mediana) por decisión y 2,56 decisiones cortas por segundo en régimen sostenido. Frente al checkpoint original en bf16, la cuantización a 8 bits reduce huella y mantiene, según la evaluación del conversor, una precisión del 92,2 %.

El repositorio lo mantiene el usuario sergolsub, no Base Labs, y no incluye reentrenamiento ni cambios de arquitectura: solo cuantización y empaquetado en formato MLX. La licencia MIT se hereda del repositorio upstream. Conviene tratar las métricas de calidad y latencia como cifras autodeclaradas por el autor de la conversión, no como resultados verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (fine-tune completo de Qwen3.5-9B) con cabezas de decisión (decision head / joint head) para salida de probabilidades |
| Parametros totales | 9 409 813 744 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16 384 tokens (16K), segun fuentes web sobre elephant-1; no confirmado en la model card de esta conversion |
| Tipos de cuantizacion | 8 bits en formato MLX (unico disponible en este repo); el original upstream se distribuye en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de baselabs/elephant-1; prevalece la LICENSE del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors con layout MLX, 3 shards (4,30 GB + 4,32 GB + 2,75 GB), acompanados de `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y `*_mlx.py` |

Otros datos del repositorio: tamano total 11,4 GB, 20 descargas y 0 likes en el momento de la consulta, creado el 24 de octubre de 2026 y actualizado el 26 de octubre de 2026. Checksums SHA-256 de los tres shards publicados en la model card.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer decoder-only denso de aproximadamente 9,4 mil millones de parámetros, sobre el que Base Labs aplicó un fine-tune completo para reconvertir el comportamiento del modelo hacia una tarea de decisión. En lugar de generar tokens de texto libre hasta una parada, elephant-1 recibe un estado y una batería de preguntas tipadas y emite, en un solo forward pass, distribuciones de probabilidad calibradas sobre opciones discretas, respuestas booleanas y puntuaciones de rúbrica. Esa naturaleza de "cabeza de decisión" explica la presencia en este repositorio de ficheros auxiliares (`decision_config.json`, `joint_config.json` y módulos `*_mlx.py`) que no forman parte del conjunto estándar de transformers.

Sobre el entrenamiento no hay detalle público en la información disponible: no se especifican el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras. La fuente web consultada indica que el modelo comparte la estructura de bloques de mammoth-1, pero el texto disponible está truncado, por lo que no se puede confirmar el alcance de esa afirmación. Esta conversión concreta no introduce ningún cambio arquitectónico ni reentrenamiento: es exclusivamente una cuantización affine de 8 bits en el layout de MLX.

## Capacidades

- Clasificación y enrutamiento: asignación de un estado a una de varias opciones con probabilidad calibrada, sin generación de texto.
- Preguntas de sí/no: decisión binaria con score de confianza asociado.
- Puntuación por rúbrica: evaluación de respuestas o artefactos contra criterios con salida numérica calibrada.
- Modo de decisión con cabezas dedicadas, activado a través de la configuración incluida (`decision_config.json`, `joint_config.json`).
- Salida estructurada de probabilidades en un único forward pass, lo que reduce coste frente a esquemas de generación seguida de parseo.
- Compatibilidad con `mlx_lm` (carga, `generate`) en Apple Silicon.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible; el modelo está diseñado para decisiones puntuales, no para bucles de agente.
- Multilingüismo: no disponible.
- Capacidades de visión o audio: no disponible (el repositorio solo incluye pesos de lenguaje).

## Casos de uso

- Enrutamiento de consultas en un sistema multi-modelo: dado el texto de la petición de un usuario y un conjunto de rutas posibles (modelo pequeño, modelo grande, retrieval, escalado a humano), elephant-1 devuelve la distribución de probabilidad por ruta en unos 657 ms de mediana, lo que permite decidir antes de invocar el modelo caro.
- Moderación y filtrado por umbral: clasificación binaria con score calibrado para decidir si un contenido pasa, se revisa o se bloquea, aprovechando la calibración declarada (PPL de calibración 1,769) para fijar umbrales operativos estables.
- Evaluación automática de respuestas de LLM contra rúbrica: puntuación de salidas generadas por otro modelo en pipelines de evaluación continua, sustituyendo a un juez generativo por un clasificador de coste fijo y latencia predecible.
- Triaje de tickets de soporte: asignación de categoría y prioridad a partir del estado de la conversación, con contexto de hasta 16K tokens suficiente para hilos multi-turno largos.
- Decisión sobre datos tabulares textualizados en procesos de negocio (aceptación de solicitudes, scoring de riesgo simple): el modelo opera sobre estado y preguntas tipadas, no sobre diálogo abierto, lo que encaja con formularios y registros estructurados.
- Prototipado y evaluación en local sobre Apple Silicon: con 12,21 GB de pico de memoria, un Mac mini M4 Pro o un MacBook con 24 GB o más puede ejecutar el modelo sin GPU dedicada, útil para iterar en el diseño de las preguntas y el formato de estado antes de desplegar en servidor.
- Servicio de baja latencia en edge: a 2,56 decisiones cortas por segundo en M4 Pro, es viable para tareas de clasificación en tiempo casi real en entornos sin acceso a GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas presentes son las declaradas por el autor de la conversión en la model card:

| Metrica | Valor | Contexto de medida |
|---|---|---|
| Precision tras cuantizacion a 8 bits | 92,2 % | Evaluacion propia del conversor, sin detalle del conjunto de evaluacion |
| Perplejidad de calibracion | 1,769 | Evaluacion propia del conversor |
| Decision Index 0.4.1 | 62,11 | Metrica propietaria del autor, sin definicion publicada |
| Latencia mediana por decision | 657 ms | Mac mini M4 Pro 48 GB, MLX 8-bit |
| Throughput sostenido | 2,56 decisiones cortas/s | Mac mini M4 Pro 48 GB, MLX 8-bit |
| Tiempo de carga | 5,32 s | Mac mini M4 Pro 48 GB, MLX 8-bit |
| Memoria residente maxima | 12,21 GB | Mac mini M4 Pro 48 GB, MLX 8-bit |

No hay comparación con el checkpoint bf16 original en la información disponible, por lo que no se puede cuantificar la degradación exacta introducida por la cuantización.

## Requisitos de hardware

- VRAM / memoria unificada: 12,21 GB de pico residente medido con 8 bits; prever 14-16 GB libres para margen de sistema y tokenizer.
- Cabe en GPU de consumo: sí en Apple Silicon con 16 GB de memoria unificada de forma muy ajustada, y con holgura a partir de 24 GB (M4 Pro, M4 Max, M3 Max y superiores). El peso en disco es de 11,4 GB.
- En GPU NVIDIA: no es el formato nativo; habría que reconvertir desde el checkpoint original de baselabs/elephant-1 a otro runtime. Para MLX no aplica CUDA.
- GPU de datacenter: no procede para este repositorio; para servir el modelo en A100/H100 conviene usar los pesos upstream en bf16 con vLLM o TGI, si el modelo base lo soporta.
- Opciones de despliegue: `mlx_lm` (librería declarada), `mlx-lm.server` para exponer una API compatible con OpenAI en macOS; llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada; vLLM y TGI no soportan el layout MLX.
- Latencia y throughput: 657 ms de mediana por decisión y 2,56 decisiones cortas por segundo en Mac mini M4 Pro de 48 GB, según el autor. No hay datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-elephant-v1-9B (esta ficha) | 9,41B | 16K (segun fuente externa) | safetensors MLX 8-bit | MIT | Conversion comunitaria para Apple Silicon; 11,4 GB en disco |
| baselabs/elephant-1 | 9B | 16K | bf16 | MIT | Modelo original de Base Labs; referencia de calidad y destino recomendado para servidor |
| baselabs/mammoth-1 | 27B | no disponible | no disponible | no disponible | Modelo hermano de mayor tamano, publicado el mismo dia; orientado tambien a decisión |
| Qwen3.5-9B | ~9B | no disponible | safetensors | no disponible | Modelo base del que deriva elephant-1; generativo de proposito general, no especializado en decisiones |

La comparación de rendimiento entre estas variantes no es posible con los datos disponibles: no hay benchmarks comunes publicados ni evaluación del checkpoint bf16 frente a esta conversión de 8 bits.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre. Usarlo como chatbot o para completar documentos produce resultados fuera de su diseño.
- Las métricas de calidad (92,2 % de precisión, PPL 1,769, Decision Index 62,11) son autodeclaradas por el autor de la conversión, sin conjunto de evaluación público ni replicación independiente.
- El "Decision Index 0.4.1" es una métrica propietaria sin definición publicada; no es comparable con benchmarks estándar.
- No hay datos publicados de sesgos, toxicidad ni comportamiento en dominios sensibles. Un modelo de decisión aplicado a scoring de personas exige auditoría propia antes de producción.
- La calibración de probabilidades puede degradarse fuera de la distribución de estados con la que se diseñaron las preguntas; conviene monitorizar la deriva y recalibrar umbrales.
- Contexto limitado a 16K tokens según fuentes externas: insuficiente para documentos largos o historiales extensos sin trocear.
- Idiomas soportados no documentados; no se puede asumir un rendimiento equivalente en castellano al del inglés.
- La licencia MIT se hereda del upstream y el propio autor indica que prevalece la LICENSE del repositorio original en caso de conflicto: verificar antes de uso comercial.
- Repositorio de terceros con 20 descargas y 0 likes: no hay garantía de mantenimiento, y la autoría de la conversión no es de Base Labs.
- Dependencia de MLX limita el despliegue a macOS con Apple Silicon; no hay GGUF ni pesos para CUDA en este repositorio.
- La model card advierte de ficheros auxiliares de inferencia (`*_mlx.py`, `decision_config.json`, `joint_config.json`): ejecutar código de un repositorio comunitario requiere revisión previa del código.
- Existe otro repositorio del mismo autor (`sergolsub/mlx-elephant-1-8bit`) con nomenclatura similar; conviene confirmar cuál es el vigente antes de fijar una dependencia en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergolsub/mlx-elephant-v1-9B
- Repositorio alternativo del mismo autor: https://huggingface.co/sergolsub/mlx-elephant-1-8bit
- Modelo original: https://huggingface.co/baselabs/elephant-1
- Ficha de elephant-1 en LLM Reference: https://www.llmreference.com/model/elephant-1
- Familia Elephant en LLM Reference: https://www.llmreference.com/model-family/elephant
- Analisis de elephant-1 en AI/TLDR: https://ai-tldr.dev/models/elephant-1/
