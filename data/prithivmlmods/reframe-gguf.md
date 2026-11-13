# prithivMLmods/Reframe-GGUF

## Resumen

Reframe-GGUF es la versión cuantizada en formato GGUF del modelo Reframe, un modelo multimodal de 9B parámetros (8.953.803.264 según los pesos en safetensors) orientado a razonamiento visual agéntico. El modelo original lo desarrolla EliYuan00 en el marco de un trabajo de la Universidad de Nankín, descrito en el paper "Reframe: Observation-Aligned Multi-Teacher On-Policy Distillation for Agentic Visual Reasoning". Esta ficha cubre la conversión a GGUF publicada por prithivMLmods, que permite ejecutar el modelo con llama.cpp en hardware de consumo.

La propuesta técnica del modelo es poco habitual: en lugar de alinear únicamente la distribución de salida, alinea el estado de observación. Se entrena en dos etapas complementarias sin cold start de SFT específico de tarea: primero Ground-Drop-GRPO (GD-GRPO), que entrena especialistas espaciales y temporales con recompensas conscientes de la evidencia sobre acciones de herramientas y eliminación aleatoria de la entrada visual original; después, Observation-Gated MOPD (OG-MOPD), que sustituye acciones de herramienta deficientes por canónicas a mitad de rollout y reanuda la destilación on-policy multi-profesor desde la observación reparada.

Es relevante ahora porque aborda un problema concreto de los agentes visuales: que el modelo razone a partir de lo que devuelven sus herramientas (recortes, zoom, muestreo de fotogramas) y no solo de la imagen original. El autor del paper afirma que supera a Mix-RL y a MOPD estándar en 14 benchmarks de imagen y vídeo, aunque la model card no incluye cifras. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; proyector multimodal mmproj-bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 59,8 GB); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y añade capacidad visual mediante un proyector multimodal (en este repo, `Reframe.mmproj-bf16.gguf`, 922 MB). La arquitectura interna concreta (número de capas, dimensión oculta, mecanismo de atención, encoder visual) no está detallada en la información disponible. El entrenamiento se realizó sobre el dataset Reframe-100K (EliYuan00/Reframe-100K) y consta de dos fases según el paper: GD-GRPO, que aplica recompensas basadas en evidencia sobre acciones de herramienta y elimina aleatoriamente la entrada visual original para forzar al modelo a depender de las observaciones devueltas por las herramientas; y OG-MOPD, una destilación on-policy multi-profesor con compuerta de observación que repara acciones de herramienta deficientes durante el rollout y continúa el entrenamiento desde el estado observado corregido. El autor indica que ninguna de las dos fases requiere un cold start de SFT específico de tarea. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset. La model card indica explícitamente que no hay decodificación especulativa (MTP: No).

## Capacidades

- Razonamiento visual agéntico sobre imágenes y vídeo: el modelo está diseñado para invocar herramientas (recorte, zoom, muestreo temporal) y razonar sobre sus resultados.
- Comprensión de imagen y texto combinados (pipeline image-text-to-text).
- Razonamiento espacial y temporal: los especialistas entrenados con GD-GRPO cubren ambas dimensiones.
- Dependencia de observación: el entrenamiento busca que el modelo use la evidencia devuelta por herramientas en lugar de la imagen original.
- Generación de texto conversacional (tag `conversational`).
- Soporte de tool calling: implícito en el diseño agéntico, aunque la model card no documenta el esquema exacto de llamadas.
- Multilingüe: solo inglés declarado.
- Modo thinking: no documentado en la información disponible.

## Casos de uso

- Inspección visual por regiones: el modelo puede recibir una imagen y aplicar recortes o zoom sucesivos para responder preguntas sobre detalles pequeños (texto en matrículas, defectos en piezas), aprovechando el entrenamiento con recompensas de evidencia.
- Análisis de vídeo con muestreo de fotogramas: para tareas de seguimiento temporal (detección de eventos en grabaciones de vigilancia o deportivas), el modelo puede seleccionar fotogramas y razonar sobre la secuencia devuelta.
- Verificación documental con evidencia: en pipelines de extracción de datos de facturas o formularios escaneados, el modelo puede recortar campos y citar la región concreta que respalda cada valor extraído.
- Control de calidad industrial: revisión de imágenes de producto o líneas de producción donde el agente amplía zonas sospechosas antes de emitir un veredicto, reduciendo falsos positivos por resolución insuficiente.
- Asistencia a accesibilidad: descripción iterativa de imágenes para usuarios con discapacidad visual, con capacidad de profundizar en zonas concretas a petición.
- Evaluación de modelos visuales en local: al estar en GGUF, sirve para reproducir experimentos de razonamiento visual agéntico en estaciones de trabajo sin GPU de datacenter, usando llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras y el abstract del paper tampoco; el autor remite al paper para los números de los 14 benchmarks de imagen y vídeo evaluados.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q3_K_M ~4,68 GB; Q4_K_S ~5,36 GB; Q4_K_M ~5,68 GB; Q5_K_S ~6,31 GB; Q5_K_M ~6,49 GB; Q6_K ~7,36 GB; BF16 ~17,9 GB. Añadir ~922 MB del proyector multimodal en todos los casos.
- GPU de consumo: cabe en GPUs con 8 GB de VRAM en cuantizaciones Q3/Q4 (con margen ajustado para el contexto y el proyector); 12-16 GB permiten Q5/Q6 con contexto amplio. Una RTX 4090 (24 GB) ejecuta BF16 con holgura o Q6_K con contexto largo.
- GPU de datacenter: A100 y H100 permiten BF16 con contexto extendido y mayor throughput; útiles para servir varias peticiones concurrentes.
- Despliegue: llama.cpp (soporte nativo del formato y del proyector mmproj), Ollama si se empaqueta el GGUF, y TGI/text-generation-inference según los tags del repo (para los pesos originales en transformers). vLLM no está confirmado para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reframe-GGUF (este) | ~9B | No disponible | Razonamiento visual agéntico con alineación de observación | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B (base) | ~9B | No disponible | LLM multimodal generalista | Según modelo base (no confirmado) | Pesos originales |
| Mix-RL (referencia del paper) | No disponible | No disponible | RL mixto para razonamiento visual | No disponible | No disponible |
| MOPD estándar (referencia del paper) | No disponible | No disponible | Destilación on-policy multi-profesor | No disponible | No disponible |

La comparación cuantitativa con Mix-RL y MOPD solo está en el paper, que el autor cita sin cifras en la model card.

## Limitaciones y advertencias

- Solo inglés declarado; el rendimiento en castellano no está evaluado.
- La model card es mínima: no hay puntuaciones, ni detalles de contexto, ni esquema de tool calling documentado.
- Riesgo de alucinación no cuantificado; en tareas visuales agénticas, errores en la selección de herramientas pueden propagarse a la respuesta final.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: poca validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-9B y del dataset Reframe-100K antes de desplegar en producción.
- El tamaño del repo (59,8 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.
- No hay decodificación especulativa (MTP), lo que limita el throughput frente a modelos con esa optimización.
- El proyector multimodal es obligatorio para entrada de imagen; sin él, el modelo funciona solo como LLM de texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Reframe-GGUF
- Modelo base: https://huggingface.co/EliYuan00/Reframe
- Dataset: https://huggingface.co/datasets/EliYuan00/Reframe-100K
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper "Reframe: Observation-Aligned Multi-Teacher On-Policy Distillation for Agentic Visual Reasoning": no disponible como enlace en la información proporcionada
- Repositorio GitHub con instrucciones de entrenamiento, inferencia y evaluación: no disponible como enlace en la información proporcionada
