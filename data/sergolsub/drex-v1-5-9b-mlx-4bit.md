# sergolsub/drex-v1.5-9B-MLX-4bit

## Resumen

drex-v1.5-9B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo nace-ai/drex-v1.5, desarrollada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo: no hay reentrenamiento ni cambios de arquitectura, sino una re-cuantización afín a 4 bits (grupo del mismo tamaño) derivada de una conversión previa a 8 bits, pensada para reducir el espacio en disco y la memoria residente en equipos Mac con chip de la serie M.

El modelo subyacente, drex-v1.5, pertenece a la familia Qwen3.5 (la etiqueta `qwen3_5_text` aparece en los metadatos) y cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B). Su rasgo diferencial es la incorporación de una "cabeza de decisión" (decision head) que permite plantear tareas de clasificación estructurada —booleanas (`noul`), de elección (`choice`) y de puntuación (`score`)— como llamadas independientes sobre un texto de entrada, en lugar de generar texto libre.

La relevancia de esta ficha radica en que documenta un caso poco habitual: una cuantización de 4 bits que, según la evaluación del propio autor, mejora la precisión respecto al modelo en bf16 en varias tareas de decisión (84,1 % frente a 78,4 % en accuracy global). Es un artefacto muy específico, con licencia Open RAIL-M modificada y sin datos publicados de benchmarks estándar, orientado a inferencia local en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (`qwen3_5_text`), con cabeza de decisión adicional |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | no disponible (no es MoE según los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX), derivada de una conversión previa a 8 bits; el repo incluye pesos en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | `other` — NACE AI OPEN RAIL-M LICENSE (MODIFIED), heredada del modelo base |
| Formato de pesos | safetensors (3 shards, layout MLX) + `head.pt` para la cabeza de decisión |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5_text`, que sitúa el modelo base en la familia Qwen3.5 de transformers densos. El repositorio incluye un módulo `code/kev/model.py` (≈29 KB) y un `head.pt` de 8 MB que implementan la lógica de la cabeza de decisión y la glue de inferencia (`drex_mlx.py`, `decision_config.json`, `joint_config.json`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en el formato de uso: el modelo expone una API `decide(texto, especificación)` en la que cada pregunta se define como un objeto con tipo (`noul`, `choice`, `score`), instrucciones y criterios. La cuantización a 4 bits se realizó dequantizando los pesos de 8 bits y requantizando en afín 4 bits con el mismo tamaño de grupo, y el autor reporta una auditoría de divergencia KL (`kl_audit.json`, ≈47 KB) para verificar la fidelidad de la conversión.

## Capacidades

- Decisión estructurada booleana (`noul`): responder sí/no a una instrucción sobre un texto.
- Decisión de elección (`choice`): seleccionar una categoría entre un conjunto de criterios definidos.
- Decisión de puntuación (`score`): asignar un nivel ordinal a partir de una lista de criterios.
- Procesamiento de texto de entrada en lenguaje natural (el ejemplo de la model card usa inglés).
- Inferencia local en Apple Silicon mediante `mlx_lm` y el cargador `drex_mlx.Drex`.
- Generación de texto libre: no documentada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y una especificación `choice` con criterios como `billing` o `shipping`, y devuelve el equipo responsable. Es adecuado porque la API `decide` está pensada exactamente para esta clasificación con criterios explícitos.
- Detección de intención de reembolso: con una especificación `noul` ("¿el cliente quiere un reembolso?") sobre el mensaje del usuario, se obtiene una respuesta booleana que puede alimentar un flujo de atención al cliente automatizado.
- Priorización de incidencias: usando el tipo `score` con criterios ordinales (`cosmetic`, `annoying`, `blocks`) sobre descripciones de errores técnicos, se asigna severidad para enrutar al equipo de guardia.
- Moderación o filtrado de contenido: clasificación booleana de mensajes según políticas definidas en las instrucciones, ejecutable localmente sin enviar datos a la nube.
- Enrutamiento en pipelines de CI/CD: evaluar logs de fallo y decidir si un error es bloqueante o cosmético antes de notificar a los desarrolladores.
- Prototipado en Mac: al ocupar 6,5 GB en disco y 7,32 GB de memoria residente pico en un Mac mini M4 Pro de 48 GB, permite iterar sobre lógica de decisión sin GPU dedicada.
- Extracción de etiquetas en procesos de anotación: generar etiquetas estructuradas (sí/no, categoría, nivel) sobre lotes de texto para pre-anotar datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de su propia evaluación de decisión y de la conversión:

| Metrica | 4 bits (MLX) | bf16 |
|---|---|---|
| Accuracy global | 84,1 % | 78,4 % |
| `noul` | 92,3 % | 84,6 % |
| `choice` | 84,0 % | 80,0 % |
| `score` | 70,8 % | 66,7 % |
| Perplejidad de calibración | 1,978 | 2,053 |

Mediciones en Mac mini M4 Pro de 48 GB con MLX 4 bits: 6,5 GB en disco, carga en 3,72 s, memoria residente pico de 7,32 GB, latencia de decisión mediana de 1292 ms y 1,75 decisiones cortas sostenidas por segundo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,32 GB de memoria residente pico medida en un Mac mini M4 Pro de 48 GB.
- Almacenamiento: 6,5 GB en disco para los pesos y ficheros auxiliares.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (el autor valida M4 Pro de 48 GB); no hay datos para GPUs NVIDIA.
- Cabe en consumer hardware de Apple: sí, en equipos con al menos ~8 GB de memoria unificada disponible para el proceso, aunque no se especifica el mínimo exacto.
- Opciones de despliegue: `mlx_lm` y el cargador propio `drex_mlx.Drex` incluido en el repo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 1292 ms por decisión y 1,75 decisiones cortas por segundo en M4 Pro de 48 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/drex-v1.5-9B-MLX-4bit | 8,95B | no disponible | safetensors MLX 4 bits | Open RAIL-M modificada | Hugging Face |
| nace-ai/drex-v1.5 (base) | no disponible | no disponible | no disponible | Open RAIL-M modificada | Hugging Face |
| Alternativas de ~9B con clasificación estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia NACE AI OPEN RAIL-M (MODIFIED) impone restricciones de uso; en caso de conflicto prevalece la licencia del repositorio upstream (nace-ai/drex-v1.5). Revisar el fichero `LICENSE` antes de uso comercial.
- No hay información sobre idiomas soportados; los ejemplos de la model card están en inglés y no se garantiza un rendimiento equivalente en castellano.
- No se documenta la longitud de contexto, lo que impide planificar entradas largas con garantías.
- El modelo está especializado en decisiones estructuradas; no se documenta su calidad en generación de texto libre, código o matemáticas.
- Riesgo de alucinación y de calibración en las puntuaciones ordinales: el rendimiento en `score` (70,8 %) es notablemente inferior al de `noul` (92,3 %).
- La mejora de precisión reportada a 4 bits frente a bf16 procede de la evaluación del propio autor y no ha sido replicada de forma independiente.
- Solo se ha validado en Apple Silicon con MLX; no hay soporte documentado para CUDA, ROCm ni otros runtimes.
- El repositorio incluye código Python (`code/kev/`, `drex_mlx.py`) que debe auditarse antes de ejecutarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sergolsub/drex-v1.5-9B-MLX-4bit
- Modelo base: https://huggingface.co/nace-ai/drex-v1.5
- Licencia (referencia en el repo): fichero `LICENSE` del repositorio
- Repositorio de código incluido: `code/kev/api.py`, `code/kev/model.py`, `code/kev/checkpoint.py`, `drex_mlx.py`
- Configuración de decisión: `decision_config.json`, `joint_config.json`
- Auditoría de cuantización: `kl_audit.json`
