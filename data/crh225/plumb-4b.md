# crh225/plumb-4b

## Resumen

Plumb-4B es un modelo de decisión de 4.205.751.296 parámetros desarrollado por el usuario crh225 y publicado en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo al uso: recibe un estado o evidencia en lenguaje natural, una pregunta y entre 2 y 16 opciones (o una pregunta de verdadero/falso, o una escala ordinal), y devuelve en un único forward pass una distribución de probabilidad completa sobre todas las opciones, sin generar ningún token. Está afinado a partir de JevK5 v0.2, que a su vez deriva de Qwen3.5-4B, y emplea el runtime abierto `jevk5` para su ejecución.

El modelo está orientado a la toma de decisiones clasificatoria y calibrada: clasificación multiple-choice, preguntas booleanas y puntuaciones ordinales, con temperaturas ajustadas (T = 2.07 para elección, T = 1.2 para score) sobre conjuntos de desarrollo propios. Su relevancia actual radica en que ofrece latencias muy bajas (28 ms en decisiones fáciles y estándar, 78 ms en difíciles sobre una RTX 4080 Super) y una calibración medida con ECE entre 0.056 y 0.152, lo que lo hace apto para integrarse en pipelines de decisión automatizada donde se necesita una probabilidad, no un texto.

Los datos de entrenamiento provienen del dataset `crh225/plumb-decisions`, compuesto por decisiones difíciles redactadas y verificadas por Qwen3.8-27B, con un peso mayor para las preguntas que ese modelo falló o respondió con incertidumbre. El modelo solo declara soporte para inglés y su pipeline en Hugging Face es `multiple-choice`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B vía JevK5 v0.2), con cabeza de lectura tipo SemIf |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 para el runtime principal; GGUF disponible en `crh225/plumb-4b-GGUF` para llama.cpp y Ollama (niveles concretos no especificados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 8.4 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

Plumb-4B es un transformer denso de aproximadamente 4.200 millones de parámetros, construido por fine-tuning sobre JevK5 v0.2, que a su vez parte de Qwen3.5-4B. La innovación principal no está en el backbone sino en la cabeza de lectura: incorpora un mecanismo de lectura derivado de SemIf (licencia MIT) que convierte la representación interna del modelo en una distribución de probabilidad sobre las opciones en un solo forward pass, sin decodificación autoregresiva ni generación de tokens. El modelo se distribuye con un `jevk5_config.json` que fija la temperatura calibrada (T = 2.07) que debe aplicar el runtime.

El entrenamiento se realizó sobre el dataset `crh225/plumb-decisions`, formado por decisiones difíciles redactadas y doblemente verificadas por Qwen3.8-27B, con un esquema de ponderación que incrementa el peso de las preguntas que el modelo profesor falló o respondió con incertidumbre. La model card no especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La calibración se ajustó sobre conjuntos de desarrollo propios (mitad de ajuste y mitad de evaluación) y se congeló antes de ejecutar JevBench; el autor publica auditorías y resultados por ítem en el repositorio de GitHub.

## Capacidades

- Clasificación multiple-choice con 2 a 16 opciones, devolviendo una probabilidad para cada opción en un único forward pass.
- Preguntas booleanas (`noul`, verdadero/falso) con probabilidad de verdadero y nivel de confianza.
- Preguntas de puntuación ordinal (`score`) sobre niveles ordenados.
- Salida calibrada con temperatura ajustada y ECE medido; incluye transformación determinista para comprometer predicciones dentro de la banda de no crédito de JevBench v1.5 en preguntas sí/no.
- Respuesta a múltiples preguntas sobre un mismo estado en una sola petición mediante el servidor `jevk5-serve` (forma de petición tipo TypeSafe).
- Modo de servicio HTTP con endpoint `/v1/systemone`.
- No genera texto libre: no soporta tool calling, function calling, razonamiento multi-paso generativo ni agentes basados en generación.
- Sin capacidades de visión, audio ni modo thinking.
- Multilingüe limitado: solo inglés declarado.

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: dado el texto de una incidencia, decidir entre categorías predefinidas (facturación, envío, devolución, etc.) con una probabilidad por categoría, útil para umbrales de derivación automática a agentes humanos cuando la confianza es baja.
- Validación de políticas de negocio: comprobar si una solicitud cumple una regla (por ejemplo, si procede un reembolso según plazo y justificante) mediante preguntas booleanas calibradas, integrándolo en un flujo de aprobación automática.
- Moderación y clasificación de contenido: asignar probabilidades a niveles de riesgo o categorías de contenido en una sola pasada, con latencias de decenas de milisegundos que permiten procesar grandes volúmenes.
- Verificación de datos de pedidos y direcciones: decidir entre estados como "entregado", "entregado erróneamente" o "desconocido" a partir de evidencia textual, como en el ejemplo de la model card con números de portal discordantes.
- Puntuación ordinal en encuestas o evaluaciones: asignar una distribución sobre niveles (por ejemplo, gravedad de una incidencia o satisfacción) y usar el nivel esperado como métrica agregada.
- Filtro previo en pipelines RAG o de agentes: usar Plumb-4B como clasificador rápido y calibrado que decida si una consulta requiere recuperación, escalado o respuesta directa, reduciendo el coste frente a un modelo generativo grande.
- Evaluación automática de respuestas: decidir si una respuesta candidata satisface un criterio con una probabilidad explícita, aprovechando la calibración para fijar umbrales reproducibles.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto público JevBench, medidos con el runner propio de JevBench en una RTX 4080 Super:

| Split | n | Accuracy | ECE | Latencia p50 |
|---|---:|---:|---:|---:|
| easy | 48 | 1.000 | 0.056 | 28 ms |
| standard | 72 | 0.972 | 0.152 | 28 ms |
| hard | 111 | 0.802 | 0.094 | 78 ms |

Comparación en JevBench hard frente al modelo base:

| Modelo | Aciertos | Accuracy |
|---|---:|---:|
| Plumb-4B | 89/111 | 80.2% |
| JevK5 v0.2 | 82/111 | 73.9% |

En JevBench hard, Plumb-4B corrige 8 ítems y regresiona 1 respecto a JevK5 v0.2; la accuracy en easy y standard se mantiene sin cambios. Con las reglas de JevBench v1.5 y la transformación de lectura (pesos sin cambios, revisión `55de0378`):

| Conjunto | Sí/no corregido por azar | Abstención sí/no | Score corregido por azar |
|---|---|---|---|
| Dev sets propios, mitad juez | 61.8 → 77.2 | 12.6% → 0% | 71.4 → 75.5 |
| Lockbox reservado (556) | 83.0 → 88.7 | 3.8% → 0% | 88.6 → 89.4 |
| Lockbox reservado (3.002) | 69.1 → 81.1 | 9.3% → 0% | 77.8 → 81.5 |
| JevBench público, 231 (solo informe) | 37.8 → 81.1 | 24.3% → 0% | 82.3 → 89.5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB libres en bf16 según la model card, coherente con los 4.200 millones de parámetros y los 8.4 GB del repositorio.
- GPU recomendadas: cualquier GPU CUDA con al menos 10 GB libres; el autor reporta mediciones en una RTX 4080 Super. No se especifican resultados en A100, H100 ni otras tarjetas de centro de datos.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM (RTX 4080 Super validada; RTX 3090, 4090 y similares son compatibles por capacidad, aunque no se han publicado mediciones específicas).
- Opciones de despliegue: runtime `jevk5` (Apache-2.0) vía `pip install "jevk5[fast] @ git+https://github.com/allebee/jevk5@v0.2.0"`; servidor propio `plumb_server.py` del repositorio `crh225/plumb`; servicio `jevk5-serve`; y GGUF para llama.cpp y Ollama.
- Latencia y throughput: 28 ms p50 en decisiones fáciles y estándar, 78 ms p50 en difíciles, medidos en RTX 4080 Super. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench hard | Licencia | Formatos |
|---|---:|---|---:|---|---|
| Plumb-4B | 4.205.751.296 | No disponible | 89/111 (80.2%) | Apache-2.0 | safetensors, GGUF |
| JevK5 v0.2 (base) | No disponible | No disponible | 82/111 (73.9%) | Apache-2.0 | safetensors (según información disponible) |
| Qwen3.5-4B (origen) | ~4B | No disponible | No disponible | Apache-2.0 | safetensors, GGUF (según información disponible) |

No se dispone de datos de benchmarks comparables frente a otros modelos de decisión o clasificadores calibrados de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, lo que limita su uso como asistente conversacional.
- La longitud de contexto no está especificada, lo que impide planificar escenarios con evidencias largas sin validación previa.
- Riesgo de alucinación estructural: al devolver distribuciones de probabilidad, una alta confianza no garantiza corrección; la calibración se midió en conjuntos concretos y puede degradarse fuera de dominio.
- La transformación de lectura para JevBench v1.5 compromete predicciones dentro de la banda 0.2–0.8 a los límites; es una decisión de lectura específica del benchmark y debe evaluarse si conviene en producción.
- Las temperaturas calibradas (2.07 para elección, 1.2 para score) están ajustadas sobre conjuntos de desarrollo propios; usarlas fuera de ese dominio requiere recalibración.
- El autor reconoce que los resultados agregados en JevBench público informaron decisiones posteriores del recetario de entrenamiento, aunque ningún ítem de JevBench se usó para entrenamiento, ajuste, selección de checkpoint o calibración.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` con las atribuciones a JevK5, Qwen3.5-4B y SemIf.
- No se han publicado evaluaciones de sesgo, robustez adversarial ni comportamiento en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crh225/plumb-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/crh225/plumb-decisions
- GGUF para llama.cpp y Ollama: https://huggingface.co/crh225/plumb-4b-GGUF
- Modelo base JevK5: https://huggingface.co/alibiserikbay/JevK5
- Repositorio del proyecto, auditorías y resultados por ítem: https://github.com/crh225/plumb
- Runtime jevk5: https://github.com/allebee/jevk5 (v0.2.0)
