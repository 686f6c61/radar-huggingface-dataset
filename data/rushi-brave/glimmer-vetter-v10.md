# rushi-brave/glimmer-vetter-v10

## Resumen

glimmer-vetter-v10 es un adaptador QLoRA publicado por el usuario rushi-brave sobre el modelo Muse Glimmer 30B de Meta, en su variante cuantizada a 4 bits de Unsloth. No se trata de un modelo base nuevo ni de un ajuste generalista: es un adaptador especializado en una tarea científica muy concreta, la validación (vetting) de señales planetarias candidatas detectadas en curvas de luz del telescopio espacial TESS de la NASA, dentro del agente Tessa, que busca planetas alrededor de enanas K y M cercanas.

El adaptador recibe un dip periódico junto con el resultado de una batería de comprobaciones de código ya ejecutadas (profundidades par/impar, eclipse secundario, profundidades por sector, estrellas vecinas, centroide por difference imaging, una puntuación XGBoost, etc.), puede invocar hasta cinco herramientas de medición y devuelve un dossier JSON con un veredicto entre `reject`, `flag` y `gate2`, junto con razones, preguntas abiertas y un resumen público en inglés llano. Se entrenó con 745 filas de trazas de tool calling generadas por Muse Spark Open sobre objetos de interés TESS etiquetados, y se presentó al Meta Global AI Developer Hackathon de octubre a noviembre de 2026.

Su relevancia es doble: por un lado demuestra un patrón de uso de modelos de 30B como componentes de decisión dentro de pipelines científicos con herramientas externas y salida estructurada; por otro, sus resultados publicados en el repositorio de Tessa indican que el sistema completo, con el adaptador tomando la decisión final, alcanza una precisión del 92% sobre el conjunto de test retenido, pasando el 72% de los planetas y solo el 6,4% de los falsos positivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer Muse Glimmer 30B; se ajustan capas de atención y MLP del modelo de lenguaje, capas de visión congeladas |
| Parametros totales | No disponible para el adaptador (el modelo base es Muse Glimmer 30B); rango LoRA 16, alpha 16, dropout 0 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | Entrenado con longitud máxima de secuencia de 9.000 tokens; la ventana nativa del modelo base no se especifica |
| Tipos de cuantizacion | Base entrenado en 4 bits (bitsandbytes, `load_in_4bit=True`); despliegue recomendado sobre la build FP8 `RedHatAI/Muse-Glimmer-30B-FP8-block` con vLLM |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `muse-spark-open-and-apache-2.0` (licencia compuesta; enlace a LICENSE-MUSE-SPARK-OPEN.md en el repo) |
| Formato de pesos | safetensors (adaptador PEFT), librería `peft`; tamaño del repo 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA con Unsloth sobre `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`, un Muse Glimmer 30B de Meta cuantizado a 4 bits. El ajuste aplica LoRA de rango 16 y alpha 16 sobre las capas de atención y MLP del modelo de lenguaje, manteniendo congeladas las capas de visión. El entrenamiento usó el optimizador `adamw_8bit`, learning rate 2e-4 con schedule coseno, warmup del 5%, weight decay 0,01, precisión bf16 y semilla 3407, durante 2 épocas (94 pasos), con batch efectivo de 16 (2 por dispositivo × 8 de acumulación de gradientes) y longitud máxima de 9.000 tokens. Se empleó `train_on_responses_only`: solo se calcula la pérdida sobre los turnos del asistente (llamadas a herramientas y dossier final), enmascarando el system prompt, la entrada del usuario y las respuestas de las herramientas. Se conservó el checkpoint con mejor pérdida de evaluación y se configuró early stopping con paciencia 3, que nunca se activó porque la pérdida de evaluación bajó en cada evaluación.

Los datos son 745 filas de entrenamiento y 40 retenidas para la pérdida de evaluación. Cada fila es una traza de vetting con tool calling generada por Muse Spark Open sobre un objeto de interés TESS etiquetado, conservada solo si alcanzaba el resultado de seguimiento y no citaba números inventados. El razonamiento de Spark Open se eliminó; permanecen las llamadas a herramientas, las respuestas de estas y el dossier final. El conjunto se publica, con identificadores estelares anonimizados, como `rushi-brave/tessa-glimmer-sft-v10`. La pérdida de entrenamiento pasó de 0,8973 (paso 5) a 0,5103 (paso 90), con media de 0,5694, y la de evaluación descendió de 0,6333 (paso 11) a 0,5368 (paso 94); el entrenamiento completo duró 3.224 segundos en una H100 en Modal.

## Capacidades

- Generación de texto especializada en razonamiento técnico sobre señales de tránsito y curvas de luz, con salida final en JSON estructurado y validable.
- Tool calling: puede invocar hasta cinco herramientas de medición (`centroid_all`, `stellar_radius`, `sector_depths_by_source`, `transit_depths`, `rotation`) antes de emitir el veredicto.
- Clasificación ternaria de candidatos: `gate2` (el planeta es la mejor explicación), `reject` (eclipsante binaria, dip en estrella vecina, variabilidad estelar o ruido) y `flag` (evidencia insuficiente para separar hipótesis).
- Justificación estructurada: devuelve una lista de razones con el check, su valor y el porqué, además de preguntas abiertas para seguimiento humano.
- Resumen público en inglés llano, limitado a tres frases, pensado para comunicación no técnica.
- Integración con el agente Tessa: el adaptador asume el rol de decisor final tras las comprobaciones de código y el ranking XGBoost.
- Capacidad multilingüe limitada al inglés según la model card; no se documentan otras lenguas.
- No se documentan capacidades de visión en uso, pese a que el modelo base incluye capas de visión (congeladas durante el ajuste), ni modo thinking explícito, audio o matemáticas generales.

## Casos de uso

- Validación automática de candidatos planetarios en TESS: el adaptador recibe el dip periódico y las comprobaciones ya calculadas y emite un veredicto con razones, sustituyendo la revisión manual inicial de cientos de señales por un filtro reproducible y auditable.
- Triaje de falsos positivos antes del seguimiento con telescopios: al clasificar como `reject` los eclipsantes y las variabilidades estelares, reduce la carga de observación en instalaciones de seguimiento, que en el test retenido pasaron solo el 6,4% de los falsos positivos.
- Priorización de señales para espectroscopía de confirmación: el sistema completo conserva los siete candidatos finales de Tessa en la encuesta, incluidos tres que el corte XGBoost de 0,32 habría descartado, lo que permite ordenar la cola de observación por probabilidad real.
- Integración en pipelines científicos con salida estructurada: el dossier JSON encaja en un flujo automatizado que registra check, valor y justificación de cada decisión, facilitando la trazabilidad y la revisión posterior por parte del equipo.
- Investigación sobre agentes con herramientas en dominios científicos: sirve como caso de estudio reproducible de QLoRA sobre un modelo de 30B para una tarea de decisión con tool calling y formato de salida restringido, con dataset y código publicados.
- Despliegue como endpoint compatible con OpenAI: el repositorio de Tessa sirve el adaptador con vLLM sobre Modal (`serve/glimmer.py`), con `--enable-lora --lora-modules glimmer-vetter-v10=... --max-lora-rank 16`, lo que permite conectarlo a clientes existentes sin cambios.
- Auditoría y docencia: el par adaptador + dataset permite reproducir el entrenamiento y analizar cómo un modelo de lenguaje razona sobre evidencia fotométrica heterogénea.

## Benchmarks y rendimiento

Los resultados publicados describen Tessa con Glimmer v10 tomando la decisión, es decir, el adaptador más el pipeline que lo rodea (comprobaciones de código previas y un suelo de ranking XGBoost bajo sus aprobaciones), no el adaptador aislado. Glimmer v10 y su suelo de ranking se congelaron sobre train y val antes de evaluarse en test.

Conjunto de test retenido (297 planetas, 282 falsos positivos):

| Sistema | Planetas aprobados | Falsos positivos aprobados | Precisión |
|---|---|---|---|
| Tessa (Glimmer v10 decide) | 213 (72%) | 18 (6,4%) | 92% |
| XGBoost en lugar de Glimmer, corte ajustado en val | 211 (71%) | 10 (3,5%) | 95% |
| XGBoost con su corte de v9 (0,32) | 182 (61%) | 6 (2,1%) | 97% |

Subconjunto de 164 señales de test también puntuadas por ExoMiner++ 2.0 de la NASA (70 planetas, 94 falsos positivos):

| Sistema | Planetas aprobados | Falsos positivos aprobados | Precisión |
|---|---|---|---|
| Tessa (Glimmer v10 decide) | 50 | 3 | 94% |
| XGBoost, corte fijado en dev | 55 | 4 | 93% |
| NASA ExoMiner++ 2.0 con umbral 0,5 | 55 | 7 | 89% |

En la encuesta completa, de las 432 señales que llegaron al adaptador, Glimmer v10 aprobó 115, y esas contienen los siete candidatos finales de Tessa. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,4 GB, pero requiere cargar el modelo base Muse Glimmer 30B para inferencia.
- VRAM estimada: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud, un modelo de 30B en 4 bits requiere del orden de 18-20 GB solo para pesos, más caché KV y overhead; en FP8, del orden de 30 GB para pesos. Estas cifras son estimaciones generales, no datos publicados para este modelo.
- GPU recomendadas: el autor entrenó en una H100 (Modal) y sirve el adaptador con vLLM sobre Modal, sobre la build FP8 `RedHatAI/Muse-Glimmer-30B-FP8-block`. Para inferencia en producción se recomienda A100 80 GB o H100.
- ¿Cabe en GPU de consumo? No confirmado. Con cuantización de 4 bits podría encajar en GPUs de 24 GB (RTX 4090) solo para pesos, pero no hay datos publicados de despliegue en consumer ni de la ventana de contexto efectiva que cabría.
- Opciones de despliegue: vLLM con soporte LoRA (`--enable-lora`, `--max-lora-rank 16`), tal como hace el repositorio de Tessa; el adaptador es PEFT estándar y podría cargarse con otras librerías compatibles, aunque no se documentan.
- Latencia y throughput: no disponibles. El entrenamiento completo (2 épocas, 94 pasos) tardó 3.224 segundos en una H100.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glimmer-vetter-v10 | Adaptador QLoRA sobre Muse Glimmer 30B | 30B (base) | Entrenado a 9.000 tokens | Vetting de señales TESS con tool calling | muse-spark-open-and-apache-2.0 | Hugging Face, 0 descargas |
| XGBoost (línea base de Tessa) | Modelo de árboles | No disponible | No aplica | Ranking de candidatos TESS | No disponible | Integrado en Tessa |
| NASA ExoMiner++ 2.0 | Modelo de clasificación de la NASA | No disponible | No aplica | Clasificación de señales de tránsito | No disponible | Referencia externa citada en el README |

No se dispone de comparativas con otros adaptadores o modelos de lenguaje de propósito similar en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo es válido para la tarea de vetting de TESS con el system prompt exacto con el que fue entrenado (`agent/prompts/vetting.v10.md` más la nota XGBoost `SCORE_NOTE` en `finetune/pilot.py`). Usarlo con otro prompt degrada su comportamiento esperado.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otras lenguas.
- Datos de entrenamiento pequeños: 745 filas, todas generadas por un único modelo (Muse Spark Open) sobre objetos TESS etiquetados, lo que puede introducir sesgos del generador y limitar la generalización a distribuciones distintas de señales.
- Riesgo de alucinación: aunque el filtrado descartó trazas con números inventados, el modelo puede producir valores o razones no sustentados en las respuestas de las herramientas; la salida JSON debe validarse y contrastarse con las comprobaciones de código.
- Dependencia del pipeline: los resultados de benchmarks corresponden al sistema completo con comprobaciones de código y suelo XGBoost, no al adaptador aislado; atribuir el rendimiento solo al modelo sería incorrecto.
- Licencia compuesta (`muse-spark-open-and-apache-2.0`): es necesario revisar LICENSE-MUSE-SPARK-OPEN.md antes de cualquier uso comercial, ya que las condiciones de la parte Muse Spark Open pueden imponer restricciones adicionales a las de Apache 2.0.
- Modelo base de 30B: el coste de despliegue es alto para una tarea de clasificación ternaria; en muchos casos un modelo de árboles o un clasificador específico puede ser más económico, como sugiere la comparación con XGBoost.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados publicados por el autor.
- Fecha de creación futura (2026-11-03) y contexto de hackathon: la información procede de la model card del autor y del README de Tessa, sin revisión por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rushi-brave/glimmer-vetter-v10
- Dataset de entrenamiento: https://huggingface.co/datasets/rushi-brave/tessa-glimmer-sft-v10
- Repositorio del agente Tessa: https://github.com/Rishi943/tessa
- Modelo base cuantizado: https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- Build FP8 usada en despliegue: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-FP8-block
- Licencia Muse Spark Open: https://huggingface.co/rushi-brave/glimmer-vetter-v10/blob/main/LICENSE-MUSE-SPARK-OPEN.md
