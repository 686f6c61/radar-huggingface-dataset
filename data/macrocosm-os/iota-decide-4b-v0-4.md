# macrocosm-os/iota-decide-4b-v0.4

## Resumen

iota-decide-4b v0.4 es un modelo de decisión desarrollado por Macrocosmos, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un fine-tune de `Qwen/Qwen3.5-4B` (variante instruct) entrenado con LoRA rank 64 cuyos pesos ya están fusionados en el checkpoint publicado. A diferencia de un LLM generativo convencional, el modelo no genera texto: dado un estado y un conjunto de preguntas tipadas (`choice`, sí/no `noul`, `score`), devuelve una probabilidad para cada opción en una sola pasada hacia adelante (forward pass). Las respuestas se leen directamente de las letras de opción en la posición de respuesta.

Su novedad principal en la versión 0.4 es la atención bidireccional: las capas de full-attention atienden sobre todo el prompt en ambas direcciones (las capas de linear-attention permanecen causales), de modo que el estado se interpreta a la luz de la pregunta. Esto lo hace adecuado para tareas de clasificación y enrutado de decisiones de baja latencia, como moderación, triaje de tickets o decisiones de política empresarial, sin el coste de la generación autorregresiva.

Con 4.539.265.536 parámetros (dato real de safetensors) y un tamaño de repositorio de 9,1 GB, es un modelo compacto y eficiente para inferencia. Es relevante ahora porque pertenece a una categoría emergente de "modelos de decisión" que compiten con LLM generativos en tareas de decisión estructurada, con mejor coste por decisión. Nótese que la fecha de publicación indicada (octubre de 2026) y la referencia a Qwen3.5 son datos de la model card que no podemos verificar más allá de lo proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas full-attention bidireccionales + capas linear-attention causales), basado en Qwen3.5-4B, adaptado a decisiones tipadas |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, 9,1 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints, librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-4B, que combina capas de full-attention con capas de linear-attention (atención lineal). La innovación central de v0.4 es la atención bidireccional en las capas full-attention: mientras las capas de linear-attention mantienen la máscara causal, las capas de atención completa atienden sobre todo el prompt en ambas direcciones, lo que permite que el modelo lea el estado en función de la pregunta. Esto implica que la inferencia causal estándar (`model.generate` o un stack de serving convencional) ejecuta el modelo de forma distinta a como fue entrenado y produce peores resultados; es imprescindible usar el script `letter_decide.py` incluido, que lee `"bidirectional": true` de `joint_head_config.json` y construye las máscaras adecuadas.

El entrenamiento se realizó sobre `Qwen/Qwen3.5-4B` (instruct) con LoRA rank 64 / alpha 128 en cada capa lineal del modelo de lenguaje, learning rate 1e-4 (2% de warmup, schedule coseno), 750 pasos, atención bidireccional en las capas full-attention, cross-entropy con soft targets y temperatura aprendida. El cómputo se distribuyó mediante streaming DiLoCo sobre 16 réplicas de RTX A4000 (4 fragmentos, merges escalonados, sin esperas síncronas). El dataset consta de 879.000 registros tras deduplicación (sin ítems de benchmark): la mezcla de v0.3 (filas de decisión etiquetadas por humanos, 24 datasets públicos etiquetados, estados generados con etiquetas verificadas) más estados de decisión y preguntas de razonamiento generados y etiquetados por un modelo profesor más potente. Se eliminaron los registros que coincidían con algún conjunto de evaluación, y el checkpoint se seleccionó por rendimiento en JevBench public entre snapshots cada 50 pasos.

## Capacidades

- Decisiones tipadas en una sola pasada: dado un estado y preguntas, devuelve probabilidades para cada opción sin generar texto, lo que reduce drásticamente la latencia frente a un LLM generativo.
- Preguntas de tipo `choice`: selección entre opciones enumeradas (hasta 26 opciones por lista), con criterios opcionales por opción.
- Preguntas de tipo `noul` (sí/no): devuelve una probabilidad; el lado elegido se reporta con probabilidad de al menos 0,801 (los valores entre 0,2 y 0,8 se consideran abstención según JevBench).
- Preguntas de tipo `score`: mencionado en la model card como tipo soportado, aunque sin detalles de uso.
- Entrada image-text-to-text: el pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere capacidad multimodal, aunque la model card no documenta su uso.
- Salida calibrada: temperatura aprendida almacenada en `joint_head.safetensors`, aplicada por el script de inferencia.
- No soporta generación de texto libre, código ni razonamiento generativo: es un modelo especializado en decisión estructurada.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo enruta cada ticket al equipo adecuado (por ejemplo, `billing` o `tech`) en una sola pasada, sin generación, lo que permite procesar miles de tickets por minuto con hardware modesto.
- Verificación de políticas empresariales: dado un estado (solicitud de reembolso, por ejemplo) y una política, responde sí/no (`noul`) sobre si la acción puede ejecutarse sin aprobación, con probabilidad calibrada y detección de abstención.
- Moderación de contenido: clasificación de mensajes como ofensivos o no (los benchmarks muestran 76,6 en TweetEval offensive), útil como filtro previo de baja latencia antes de revisión humana.
- Análisis de sentimiento y clasificación de reseñas: 89,3 en Rotten Tomatoes (gold humano, nunca visto en entrenamiento), adecuado para monitorización de reputación de producto.
- Decisiones de enrutado en agentes: como cabeza de decisión dentro de un pipeline de agentes, decide la siguiente acción entre opciones tipadas sin incurrir en el coste de decodificación autorregresiva.
- Evaluación de criterios múltiples: un mismo estado puede evaluarse con varias preguntas simultáneas (aprobación, ruta, puntuación), útil en flujos de decisión multi-criterio como concesión de créditos o validación de expedientes.
- Sistemas de decisión embebidos con hardware limitado: con 4,5 B de parámetros y entrenamiento verificado sobre RTX A4000 (16 GB VRAM), es desplegable en GPUs de gama media para decisiones locales y privadas.

## Benchmarks y rendimiento

Datos publicados por el propio autor (evaluaciones propias, no verificadas de forma independiente):

| Set | v0.3 (publicado) | **v0.4 (este modelo)** | Torchcast Decision 4B v1.3 |
|---|---|---|---|
| Cross-domain skill: 15 benchmarks del Decision Index nunca entrenados (corregidos por azar, ~10,4k preguntas) | 55,4 | **62,9** | 65,6 |
| Rotten Tomatoes (gold humano, nunca entrenado) | 85,1 | **89,3** | 90,7 |
| TweetEval offensive (gold humano, nunca entrenado) | 76,4 | **76,6** | 79,5 |
| JevBench public items (231) | 188 | **197** | 211 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, lo cual es coherente con la naturaleza especializada del modelo (no genera texto ni código).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en fp16/bf16 (el repositorio pesa 9,1 GB); no hay cuantizaciones publicadas, por lo que no se puede estimar el requisito en 4/8 bits.
- GPU de referencia para entrenamiento: RTX A4000 (16 GB), usada en 16 réplicas; para inferencia, cualquier GPU con 12 GB o más de VRAM debería ser suficiente.
- Cabe en GPUs de consumo: sí, en una RTX 4090 (24 GB) con holgura, y presumiblemente en GPUs de 12-16 GB como la RTX 4070 Ti o la propia A4000, aunque esto último no está verificado explícitamente.
- Despliegue: la model card especifica el uso del script incluido `letter_decide.py` (torch, transformers >= 5, accelerate, safetensors, huggingface_hub). No es compatible con stacks de serving estándar (vLLM, TGI, llama.cpp, Ollama) porque la inferencia causal estándar degrada el rendimiento: se requieren las máscaras bidireccionales personalizadas.
- Latencia y throughput: no disponibles como cifras; al no generar texto, la latencia por decisión corresponde a una sola pasada hacia adelante, sustancialmente menor que la decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| iota-decide-4b v0.4 (este) | 4,54 B | Modelo de decisión tipada, un forward pass | no disponible | Apache 2.0 | 62,9 en Decision Index; 197/231 en JevBench |
| Torchcast Decision 4B v1.3 | no disponible | Modelo de decisión (competidor directo citado) | no disponible | no disponible | 65,6 en Decision Index; 211/231 en JevBench |
| iota-decide-4b v0.3 | no disponible | Versión anterior del mismo autor | no disponible | no disponible | 55,4 en Decision Index; 188/231 en JevBench |
| Qwen/Qwen3.5-4B (base) | ~4 B (declarado en el nombre) | LLM generativo multimodal | no disponible | no disponible | no disponible |

La comparación más relevante es con Torchcast Decision 4B v1.3, que supera a v0.4 en los tres conjuntos evaluados por el autor. Frente a LLM generativos de tamaño similar, iota-decide-4b ofrece decisiones en una sola pasada, pero no puede generar texto libre ni razonar de forma explícita.

## Limitaciones y advertencias

- Incompatibilidad con serving estándar: ejecutar el modelo con `model.generate` o un stack convencional produce resultados peores porque no replica la atención bidireccional del entrenamiento; es obligatorio usar `letter_decide.py`.
- Idioma: solo declara soporte para inglés; el comportamiento en castellano u otros idiomas no está documentado ni evaluado.
- Límite de opciones: las listas `choice` están restringidas a un máximo de 26 opciones (letras de la A a la Z).
- Abstención implícita: en preguntas sí/no, probabilidades entre 0,2 y 0,8 cuentan como abstención en JevBench; los sistemas que consuman la salida deben gestionar este caso.
- Riesgo de alucinación: al no generar texto, el riesgo de alucinación textual desaparece, pero las probabilidades pueden ser miscalibradas fuera de la distribución de entrenamiento; no hay datos de calibración fuera de dominio.
- Sesgos: el dataset incluye estados generados y etiquetados por un modelo profesor más potente, lo que puede transferir los sesgos de dicho profesor; no se documenta ningún análisis de sesgos.
- Datos de evaluación propios: todos los benchmarks provienen de evaluaciones del propio autor y no están verificados de forma independiente.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones destacables.
- Multimodalidad sin documentar: el pipeline `image-text-to-text` sugiere entrada de imagen, pero la model card no describe cómo usarla ni evalúa esa capacidad.
- Adopción mínima: 24 descargas y 2 likes en el momento de la ficha; es un modelo de nicho con comunidad muy reducida y sin historial en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/macrocosm-os/iota-decide-4b-v0.4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado enlaces adicionales a papers, blogs, repositorios de código o demos en la información disponible (el script `letter_decide.py` se distribuye, presumiblemente, dentro del propio repositorio del modelo).
