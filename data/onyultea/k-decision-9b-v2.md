# ONYULTEA/K-Decision-9B-v2

## Resumen

K-Decision-9B-v2 es un modelo de decisión especializado en coreano desarrollado por ONYULTEA, un fine-tune de Qwen/Qwen3.5-9B. A diferencia de un LLM generativo convencional, su función es recibir un estado (una descripción textual de una situación) y un conjunto de preguntas tipadas, y devolver en un único forward pass decisiones estructuradas con distribuciones de probabilidad calibradas sobre todas las opciones posibles. Está diseñado como "System One": un motor de decisión rápido y determinista, no un generador de texto abierto.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) en formato safetensors, con un repositorio de 17,9 GB, y se distribuye bajo licencia Apache 2.0. Soporta coreano e inglés, y su pipeline declarado en Hugging Face es `zero-shot-classification`. La propuesta de valor es sustituir cadenas de razonamiento largas por una clasificación estructurada de baja latencia (p50 de 168 ms según el autor) en entornos de producción como enrutamiento de tickets, triaje o sistemas de decisión con umbrales de confianza.

Es relevante ahora porque propone un patrón distinto al del chatbot: modelos pequeños y especializados que emiten decisiones tipadas con probabilidades calibradas, lo que facilita integrar salvaguardas (umbrales de confianza, derivación a humano) y auditoría. El modelo fue entrenado y servido en una única GPU de consumo de 24 GB con LoRA int8 de r=32, lo que lo sitúa en el rango de despliegue asequible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B); tag de Hugging Face `qwen3_5_text` |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible como listado oficial; el autor indica entrenamiento y servicio con LoRA int8 en una GPU de 24 GB |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 8,95 mil millones de parámetros, y se adapta mediante fine-tune. Según la model card, el ajuste se realizó con LoRA de rango 32 en int8 y el modelo resultante se sirvió en una única GPU de consumo de 24 GB, lo que indica que el entrenamiento fue viable en hardware de gama alta para consumidores, no solo en clústeres de datacenter.

La innovación principal no está en la arquitectura del transformer, sino en la interfaz y el objetivo de entrenamiento: el modelo recibe un `state` y un diccionario de preguntas tipadas (`choice`, `noul`, etc.) y devuelve, en un solo forward pass, una opción y una distribución de probabilidad calibrada sobre todas las alternativas. El autor lo etiqueta como "System One / Jev compatible" y menciona decisiones tipadas y probabilidades calibradas como ejes del diseño. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Decisión estructurada: dado un estado textual y preguntas tipadas, devuelve la opción elegida junto con probabilidades para cada alternativa.
- Probabilidades calibradas: la salida incluye una distribución completa, no solo la etiqueta ganadora, lo que permite aplicar umbrales de confianza.
- Preguntas de tipo `choice` (selección entre opciones con criterios) y `noul` (decisión binaria o de probabilidad única).
- Clasificación zero-shot: el pipeline declarado es `zero-shot-classification`, lo que sugiere capacidad de clasificar estados en categorías definidas en tiempo de inferencia.
- Ejecución en un único forward pass: no requiere cadenas de razonamiento multi-paso ni decodificación autoregresiva larga para producir la decisión.
- Multilingüe limitado a coreano e inglés.
- Integración con servidor propio: el repositorio de GitHub incluye `serve_systemone.py` con un endpoint `/v1/systemone`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de atención ciudadana: el ejemplo de la model card muestra una queja por olor a gas que se enruta al departamento de Gas Safety con probabilidad 0,87 y se marca como urgente con 0,93. El modelo es adecuado porque devuelve la ruta y la confianza en una sola llamada, lo que permite derivar a humano si la probabilidad cae por debajo de un umbral.
- Triaje en centros de contacto: clasificar solicitudes entrantes en categorías operativas (agua, gas, carreteras) con latencia de decenas de milisegundos, según el p50 de 168 ms declarado por el autor.
- Clasificación zero-shot de documentos o mensajes en dominios predefinidos: al aceptar criterios en la propia petición, se pueden definir categorías nuevas sin reentrenar el modelo.
- Sistemas de decisión con salvaguardas: usar la distribución de probabilidad para activar revisión humana cuando la confianza es baja, algo que un LLM generativo no ofrece de forma nativa.
- Automatización de flujos administrativos en coreano: decisiones de tipo `noul` (sí/no o probabilidad única) para validaciones, aprobaciones o alertas.
- Evaluación de modelos de decisión en investigación: el autor publica un índice de decisión y suites de evaluación (LocalLLaMA typed-decisions, KoBEST, korean-jev-decision-index) que pueden servir como referencia para comparar motores de decisión.
- Despliegue en hardware de consumo: al caber en una GPU de 24 GB según el autor, es apto para prototipos y entornos con presupuesto limitado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| LocalLLaMA/typed-decisions (test, 400 casos / 2.000 decisiones) | accuracy (fitted) | 0,8295 |
| KoBEST 5-task conversion (2.600 ítems) | score | 0,866 |
| Korean Life-Domain Holdout (7 dominios) | score | 0,997 |
| korean-jev-decision-index (3.000 ítems) | score | 0,635 |
| Decision Index 0.3 public suite (140.000 peticiones) | índice / errores / latencia p50 | 30,7 · 0 errores · 168 ms |

No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) ni comparaciones directas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 8,95 mil millones de parámetros, en fp16 se necesitan aproximadamente 18 GB solo para pesos; en int8, unos 9 GB; en int4, unos 5 GB (estimaciones orientativas, no confirmadas por el autor).
- El autor indica que el modelo fue entrenado y servido en una única GPU de consumo de 24 GB con LoRA int8, lo que sugiere que una RTX 3090 o RTX 4090 de 24 GB es suficiente para el despliegue previsto.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, encaja en A100 40 GB, H100, L40S y GPUs de consumo de 24 GB; para cuantizaciones de 4 bits podría caber en GPUs de 8-12 GB, aunque no está confirmado.
- Opciones de despliegue: el autor proporciona un servidor propio (`serve_systemone.py`) con endpoint `/v1/systemone`; al ser un modelo `transformers` con safetensors, es compatible con stacks habituales como vLLM o TGI, aunque no se documenta soporte específico.
- Latencia y throughput: el autor declara p50 de 168 ms y 0 errores en la suite Decision Index 0.3 con 140.000 peticiones. No se indica throughput (peticiones por segundo) ni latencia p99.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la categoría de "motores de decisión" con salida de probabilidades calibradas. Como referencia de tamaño y familia, se puede comparar con el modelo base y con alternativas genéricas de ~9B:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| K-Decision-9B-v2 | ~8,95 B | No disponible | Decisión estructurada con probabilidades calibradas | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | ~9 B | No disponible | LLM generativo generalista | No disponible en la información proporcionada |
| Alternativas de ~9B para clasificación | No disponible | No disponible | Clasificación zero-shot genérica | No disponible |

No se han publicado comparaciones de rendimiento frente a estos modelos en la información disponible.

## Limitaciones y advertencias

- Especialización lingüística: solo coreano e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El resultado en korean-jev-decision-index (0,635) es notablemente inferior al de otras suites, lo que sugiere variabilidad según el dominio y el tipo de decisión.
- No es un modelo generativo generalista: no está pensado para redactar texto, mantener conversaciones abiertas ni razonamiento multi-paso.
- Riesgo de calibración defectuosa fuera de los dominios de entrenamiento: las probabilidades pueden no ser fiables en contextos distintos a los evaluados.
- No se documentan sesgos conocidos, pero al ser un fine-tune sobre Qwen3.5-9B hereda los sesgos del modelo base y los del corpus coreano utilizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene revisar.
- Contexto máximo no documentado: planificar el despliegue sin asumir ventanas largas.
- El ecosistema es muy reciente (creado en noviembre de 2026) y con 0 descargas y 0 likes en Hugging Face, por lo que la validación comunitaria es nula.
- El servidor de referencia (`serve_systemone.py`) es código del autor; en producción conviene auditarlo y añadir gestión de errores, límites de tasa y monitorización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ONYULTEA/K-Decision-9B-v2
- Repositorio del servidor System One: https://github.com/onyultea/k-decision
- Sitio del autor: https://onyultea.kr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
