# sergolsub/clef-flash-9B-MLX-4bit

## Resumen

Clef-flash-9B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Cloudflare/clef-flash, publicada por el usuario sergolsub. El modelo original lo desarrolla Cloudflare y está orientado a la toma de decisiones estructuradas: clasificación binaria (noul), elección entre opciones (choice) y puntuación ordinal (score) sobre texto de entrada, en lugar de generación libre de texto. Esta versión concreta es una derivada de pesos, sin reentrenamiento ni cambios de arquitectura, pensada para ejecutarse en Apple Silicon mediante la librería `mlx_lm`.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9 mil millones) y se distribuye bajo licencia Apache 2.0, heredada de los pesos originales. La relevancia de esta ficha radica en que ofrece una alternativa de despliegue local en hardware de consumo Apple para tareas de enrutamiento y triaje, con un consumo de memoria medido de 7,48 GB en pico y un tamaño en disco de 6,5 GB.

La información disponible es limitada: no se publican detalles sobre la longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos de rendimiento que sí se aportan son mediciones propias del autor de la conversión sobre una Mac mini M4 Pro de 48 GB, centradas en latencia de decisión y calidad tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; sin detalles de capas ni atención) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX), derivada de una conversión previa a 8 bits; mismo tamaño de grupo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX), 3 shards; incluye `joint_head.safetensors` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Cloudflare/clef-flash. La etiqueta `qwen3_5` en Hugging Face sugiere una familia derivada de Qwen, pero no se confirma en la documentación disponible el tipo de transformer, el número de capas, la dimensión oculta ni el mecanismo de atención. El repositorio incluye un `joint_head.safetensors` (244 MB) y los ficheros `joint_schema_model.py`, `decision_config.json` y `joint_config.json`, lo que indica que el modelo incorpora una cabeza de decisión conjunta para tareas estructuradas (noul, choice, score) además del cuerpo principal.

Respecto al entrenamiento, no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión a 4 bits se realizó desquantizando la versión 8-bit previa y recuantizando en 4 bits afín con el mismo tamaño de grupo, sin reentrenamiento. El autor reporta una auditoría KL (`kl_audit.json`, 46,8 KB) y una perplejidad de calibración de 2,385 en 4 bits frente a 2,341 en bf16, lo que indica una degradación mínima en la distribución de salida.

## Capacidades

- Toma de decisiones estructuradas: clasificación binaria (tipo `noul`), elección entre categorías (tipo `choice`) y puntuación ordinal sobre criterios definidos (tipo `score`).
- Enrutamiento de tickets y solicitudes: asignación a equipos o colas según criterios configurables.
- Evaluación de severidad e impacto: puntuación de incidencias en escalas ordinales definidas por el usuario.
- Detección de intención: por ejemplo, determinar si un cliente solicita un reembolso.
- Generación de texto libre: no documentada explícitamente; el uso mostrado en la model card se limita a la API `decide`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un esquema de decisión para asignar el equipo responsable (por ejemplo, facturación o envíos) mediante el tipo `choice`, con latencia mediana de 734 ms por decisión en M4 Pro.
- Detección de solicitudes de reembolso: usando el tipo `noul` con instrucciones como "¿el cliente quiere un reembolso?", se puede preclasificar la intención antes de derivar a un agente humano.
- Puntuación de severidad de incidencias: con el tipo `score` y criterios ordinales ("cosmetic", "annoying", "blocks"), el modelo asigna un nivel de impacto a errores técnicos reportados.
- Enrutamiento en pipelines de CI/CD: clasificación de fallos de build o despliegue para dirigirlos al equipo adecuado (infraestructura, aplicación, datos) sin intervención manual.
- Moderación y clasificación de contenido: evaluación binaria o categórica de mensajes entrantes según criterios definidos en el esquema de decisión.
- Procesamiento local en dispositivos Apple: al ocupar 6,5 GB en disco y 7,48 GB de memoria pico, puede ejecutarse en una Mac mini M4 Pro para tareas de clasificación en local sin depender de la nube.
- Clasificación por lotes de formularios o encuestas: aplicación repetida de la API `decide` sobre campos estructurados para etiquetar respuestas abiertas con criterios predefinidos.

## Benchmarks y rendimiento

Los únicos datos disponibles son las mediciones propias del autor de la conversión, no benchmarks estándar de la comunidad:

| Metrica | 4 bits (MLX) | bf16 (referencia) |
|---|---|---|
| Precision global (eval propia) | 80,7 % | 81,8 % |
| Noul | 84,6 % | 84,6 % |
| Choice | 76,0 % | 84,0 % |
| Score | 79,2 % | 75,0 % |
| Perplejidad de calibración | 2,385 | 2,341 |

Mediciones de sistema en Mac mini M4 Pro 48 GB (MLX 4 bits): 6,5 GB en disco, 1,9 s de carga, 7,48 GB de memoria residente pico, latencia mediana de decisión de 734 ms y 2,15 decisiones cortas sostenidas por segundo.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,48 GB de memoria residente pico medida en MLX 4 bits; 6,5 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; la medición de referencia se realizó en Mac mini M4 Pro con 48 GB.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA ni CUDA.
- Opciones de despliegue: `mlx_lm` mediante el loader incluido `clef_mlx.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 734 ms por decisión y 2,15 decisiones cortas por segundo en M4 Pro 48 GB; tiempo de carga de 1,9 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| sergolsub/clef-flash-9B-MLX-4bit | ~8,95 B | no disponible | Apache 2.0 | safetensors MLX, `mlx_lm` | Cuantizado 4 bits, orientado a decisiones estructuradas |
| Cloudflare/clef-flash (original) | no disponible | no disponible | Apache 2.0 | safetensors | Pesos de referencia sin cuantizar; base de esta conversión |
| Conversión 8-bit MLX de clef-flash | no disponible | no disponible | Apache 2.0 | safetensors MLX | Intermedia, usada para generar la versión 4 bits |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación estructurada de ~9 B) en la documentación proporcionada.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan contexto máximo, idiomas, dataset de entrenamiento ni evaluación con benchmarks estándar, lo que dificulta validar el modelo fuera de las tareas de decisión mostradas.
- La cuantización a 4 bits degrada ligeramente la calidad: la precisión global baja de 81,8 % a 80,7 % y la categoría `choice` cae de 84,0 % a 76,0 % según la evaluación del propio autor.
- El modelo está diseñado para tareas de decisión estructurada; no se documenta su comportamiento en generación libre, razonamiento multi-paso ni tool calling.
- Solo se documenta soporte para MLX y Apple Silicon; no hay evidencia de funcionamiento en CUDA, ROCm ni CPU x86.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que prevalece la licencia del repositorio upstream en caso de conflicto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La fecha de creación del repositorio (2026-11-22) es posterior a la de esta ficha; conviene verificar la vigencia de los enlaces y los checksums SHA-256 publicados antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergolsub/clef-flash-9B-MLX-4bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Librería MLX: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles
