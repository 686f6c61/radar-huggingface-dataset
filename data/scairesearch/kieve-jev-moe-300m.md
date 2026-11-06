# scairesearch/kieve-jev-moe-300m

## Resumen

Kieve-JeV MoE 300M es un motor de decisiones tipado basado en encoder, desarrollado por scairesearch. A diferencia de un LLM generativo convencional, no produce texto libre: recibe un `state` (texto arbitrario) y un conjunto de preguntas tipadas, y devuelve para cada pregunta una respuesta con una distribución de probabilidad calibrada sobre las opciones proporcionadas por el usuario (o una probabilidad para la primitiva binaria `noul`, de tipo sí/no). El modelo nunca inventa opciones, lo que lo hace adecuado como componente de enrutamiento o clasificación dentro de pipelines más grandes.

La arquitectura se apoya en ModernBERT-base (congelado) como backbone, con adaptadores LoRA de rango 16 y una variante `jev` que incorpora encoders de estado y pregunta, un scorer de opciones con cross-attention emparejada y una cabeza independiente para `noul`. El total de parámetros es de 293,9M.

Su relevancia radica en el creciente interés por modelos pequeños y especializados para tareas de decisión estructurada (clasificación de opciones, calibración de confianza, enrutado de agentes), donde un encoder de ~300M con salidas calibradas puede sustituir a LLM generativos mucho más costosos, con menor latencia y riesgo de alucinación reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder basado en ModernBERT-base con LoRA (r=16), variante `jev` con cross-attention emparejada y cabeza `noul` |
| Parámetros totales | 293,9M |
| Parámetros activos | no disponible (no se confirma estructura MoE pese al nombre) |
| Longitud de contexto | no disponible (limitada por ModernBERT-base) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el backbone ModernBERT está sujeto a su propia licencia) |
| Formato de pesos | Checkpoint PyTorch (`checkpoint_latest.pt`) + `config.json`; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo transformer basado en `answerdotai/ModernBERT-base`, que permanece congelado durante el entrenamiento; solo se entrenan los adaptadores LoRA de rango 16 y los módulos propios de la variante `jev`: encoders separados para el estado y las preguntas, un scorer de opciones mediante cross-attention emparejada (state-question) y una cabeza específica para la primitiva binaria `noul`. El stack incluye además operadores neuronales fusionados, cuyos detalles exactos remiten al `config.json` del repositorio.

Sobre el entrenamiento no se han publicado detalles del dataset ni del número de tokens. Sí se indica que el checkpoint incluye una temperatura de softmax calibrada (`temperature` dentro de `model_state`), lo que sugiere un paso post-entrenamiento de calibración de probabilidades. Las métricas de evaluación se reportan sobre un conjunto held-out denominado JvD.

## Capacidades

- Clasificación de opción múltiple: dada una lista de opciones, devuelve una distribución de probabilidad calibrada sobre ellas, sin generar opciones nuevas.
- Respuesta binaria calibrada mediante la primitiva `noul` (sí/no) con su probabilidad asociada.
- Procesamiento de estados arbitrarios en texto (`state`) junto con preguntas tipadas en una sola pasada.
- Salida determinista y acotada al espacio de opciones suministrado, lo que reduce el riesgo de alucinación típico de los modelos generativos.
- Integración como motor de decisión o enrutador dentro de sistemas agentes, gracias a su interfaz de preguntas/respuestas estructurada.
- Idiomas soportados: no disponible.

## Casos de uso

- Enrutado de consultas en sistemas multiagente: el modelo puede clasificar cada petición de usuario entre varios agentes o rutas posibles usando la distribución de probabilidad sobre las opciones, con confianza calibrada para decidir cuándo escalar.
- Moderación y detección de jailbreak: la métrica publicada en `jailbreak` (0,638) indica que puede usarse como filtro previo de prompts sospechosos antes de pasarlos a un LLM principal.
- Clasificación de intención en atención al cliente: dada una lista de intenciones del negocio, asigna probabilidades calibradas a cada una, útil para triaje automático de tickets.
- Verificación de seguridad en pipelines de automatización: como clasificador binario (`noul`) para decisiones de permitir/bloquear con umbral ajustable según la probabilidad calibrada.
- Evaluación de tareas agénticas: la métrica `atbench500` (0,610) sugiere uso en benchmarks o filtros de decisiones en flujos de trabajo agénticos.
- Calibración de confianza en cascadas de modelos: puede actuar como capa ligera que estima la probabilidad de que una respuesta u opción sea correcta antes de invocar modelos más costosos.
- Clasificación de documentos o textos en taxonomías cerradas: cualquier escenario donde el conjunto de categorías sea fijo y conocido.

## Benchmarks y rendimiento

Datos publicados en la model card (conjunto held-out JvD):

| Benchmark | Puntuación |
|---|---|
| atbench500 | 0,610 |
| jailbreak | 0,638 |

Además, se reporta un "Decision Index 0.2.1" con valor 1,05 (raw 22,41) sobre 150.759 peticiones, completo. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 293,9M de parámetros en FP32, unos 1,2 GB solo de pesos; en FP16/BF16, unos 0,6 GB. Con overhead de activaciones, 2-4 GB de VRAM deberían ser suficientes. El tamaño del repositorio es 1,4 GB.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente (RTX 3060, RTX 4090, etc.); no se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, holgadamente en prácticamente cualquier GPU con 4 GB o más de VRAM; probablemente ejecutable incluso en CPU dado su tamaño.
- Opciones de despliegue: mediante la librería propia `kieve` (librería declarada en Hugging Face), cargando `checkpoint_latest.pt` y `config.json`. No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos es un checkpoint PyTorch propio y no GGUF ni safetensors estándar.
- Latencia y throughput: no disponibles; al ser un encoder de ~300M sin generación autorregresiva, se espera latencia baja de un solo pase, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Salida | Licencia |
|---|---|---|---|---|
| Kieve-JeV MoE 300M | 293,9M | Encoder + LoRA, scorer de opciones | Distribución calibrada sobre opciones fijas | Apache-2.0 |
| DeBERTa-v3-base (clasificación) | ~86M (base) / ~400M (large) | Encoder transformer | Logits de clasificación | MIT (con datos con licencias propias) |
| ModernBERT-base (backbone) | 149M | Encoder transformer | Embeddings / clasificación | Apache-2.0 |
| LLM pequeño generativo (p. ej. Qwen2.5-0.5B-Instruct) | 500M | Decoder generativo | Texto libre (requiere parsing para clasificar) | Apache-2.0 |

La diferencia clave frente a alternativas generativas pequeñas es que Kieve-JeV produce probabilidades calibradas sobre un espacio de opciones cerrado, evitando parsing de texto libre y alucinaciones, a costa de no poder generar contenido nuevo.

## Limitaciones y advertencias

- El nombre "MoE" en el identificador no se corresponde con una confirmación de arquitectura Mixture-of-Experts en la model card; los parámetros activos no están disponibles.
- Sesgos conocidos: no documentados; al derivar de ModernBERT, hereda potencialmente los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: bajo por diseño en cuanto a opciones (no inventa categorías), pero la calidad de la calibración depende del dominio; fuera de distribución las probabilidades pueden no ser fiables.
- Idiomas: no disponibles explícitamente; el backbone ModernBERT está entrenado principalmente en inglés, por lo que el rendimiento en castellano es incierto.
- Contexto: limitado por la ventana de ModernBERT-base; el valor exacto no está disponible.
- Formato de pesos no estándar (checkpoint `.pt` propio), lo que dificulta la integración con ecosistemas de inferencia habituales (vLLM, llama.cpp) y requiere la librería `kieve`.
- Licencia Apache-2.0 permite uso comercial, pero el backbone ModernBERT está sujeto a su propia licencia, que debe revisarse.
- Proyecto con adopción muy temprana (37 descargas, 1 like en el momento de la ficha): la madurez, documentación y mantenimiento no están garantizados para producción.
- Las métricas publicadas (0,610 y 0,638) son moderadas y corresponden a conjuntos de evaluación propios (JvD), no comparables directamente con benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scairesearch/kieve-jev-moe-300m
- Backbone ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Autor (scairesearch): https://huggingface.co/scairesearch
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
