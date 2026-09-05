# Danny-1223/latent-mas-linear-probe

## Resumen

La sonda `Danny-1223/latent-mas-linear-probe` es un clasificador logístico lineal (linear probe) diseñado para analizar los estados ocultos pre-Judger de LatentMAS, un sistema multiagente que permite que varios modelos de lenguaje colaboren directamente en el espacio latente continuo. Desarrollada por Danny-1223, esta sonda actúa como un baseline de interpretabilidad para la seguridad en sistemas multiagente: en lugar de usar atención o una cola tipo Llama-Guard, aplica una regresión logística z-score sobre las activaciones medias de los agentes planificador, crítico y refinador.

El modelo base sobre el que opera es Qwen3-4B, con una dimensión oculta de 2560 y K=8 pasos latentes. La sonda concatena las medias temporales de las activaciones de los tres roles, obteniendo un vector de 7680 dimensiones, y calcula una puntuación mediante una sigmoide. Se ofrece en dos variantes: `linear_probe_harmcompliance.pt` (recomendada, etiqueta si la trayectoria realmente cumplió una instrucción dañina) y `linear_probe_prompt_harm.pt` (ablación que detecta si el prompt es dañino, con alta tasa de falso rechazo). Su relevancia radica en ser un método ligero y transparente para monitorizar la seguridad de agentes que colaboran en el espacio latente, un área emergente donde la interpretabilidad es aún limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística lineal (linear probe) sobre estados ocultos de LatentMAS |
| Parametros totales | No disponible (checkpoint de ~96 KB con pesos de dimensión 7680) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; opera sobre K=8 pasos latentes de Qwen3-4B (d_h=2560) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (la sonda no procesa lenguaje directamente; depende del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La sonda es un clasificador lineal logístico que se aplica sobre las activaciones latentes de tres agentes en una ejecución secuencial de LatentMAS (planificador, crítico y refinador). Para cada agente se calcula la media de las activaciones a lo largo de los K pasos latentes, se concatenan los tres vectores de 2560 dimensiones y se normaliza con la media y la desviación típica del conjunto de entrenamiento. La puntuación final es `sigmoid(w · (x − μ) / σ + b)`. Si la puntuación supera un umbral τ, se inyecta el mismo aviso de seguridad (`[SAFETY NOTICE]`) que utilizan CoT-Guard o el aligner de atención, antes del Judger. La sonda no modifica el Judger, que permanece sin protección.

El entrenamiento se realizó sobre shards secuenciales de Qwen3-4B en LatentMAS (`data/latent-mas-safety-dataset-seq-qwen3-4b`), con 295.000 muestras de entrenamiento y 20.000 de validación. Se entrenó durante 30 épocas con una tasa de aprendizaje de `1e-3`, batch de 2048 y weight decay de `1e-4`. La variante `harmcompliance` etiqueta como insegura la trayectoria cuando el prompt es dañino y el sistema realmente cumplió con la instrucción, lo que permite mantener la tasa de sobre-rechazo en un rango similar al aligner de atención. La variante `prompt_harm` etiqueta únicamente si el prompt es dañino, lo que da una alta sensibilidad pero colapsa la utilidad al rechazar muchas solicitudes benignas.

## Capacidades

- Detección de cumplimiento de instrucciones dañinas en trayectorias multiagente: la variante `harmcompliance` distingue entre un prompt dañino que fue efectivamente ejecutado y una trayectoria segura.
- Detección de prompts dañinos a partir de las activaciones latentes: la variante `prompt_harm` actúa como detector de temas, aunque con alta tasa de falso rechazo en contenido benigno o controvertido.
- Integración con LatentMAS en tiempo de ejecución: se puede habilitar mediante configuración YAML (`linear_probe: true`), inyectando un aviso de seguridad antes del Judger si la puntuación supera el umbral seleccionado.
- Compatibilidad con arquitecturas multiagente de más de tres agentes: la sonda selecciona el primer planificador, el primer crítico y el primer refinador; los agentes adicionales no son visibles para la sonda, aunque sí influyen en el Judger a través de la memoria KV.
- No soporta tool calling, generación de texto, visión ni razonamiento multimodal, ya que es un clasificador lineal y no un modelo generativo.
- Ofrece umbrales precalculados (`p01`, `fpr05`, `fpr10`, `fpr20`, `p50`) para seleccionar el punto de operación deseado en función de la tasa de falsos positivos.

## Casos de uso

- Auditoría de seguridad en sistemas multiagente: la sonda puede monitorizar las activaciones de los agentes planificador, crítico y refinador en una ejecución de LatentMAS y detectar si la trayectoria cumple con una instrucción dañina. Es útil para depurar comportamientos inseguros en entornos de investigación.
- Defensa en tiempo real contra jailbreaks: al integrar la sonda en el pipeline de LatentMAS, se puede inyectar un aviso de seguridad antes del Judger cuando la puntuación supera un umbral como `fpr10`, reduciendo la tasa de ataques exitosos sin degradar gravemente la utilidad en contenido benigno.
- Evaluación de agentes en benchmarks de seguridad: la sonda permite medir la tasa de éxito de ataques (ASR) en conjuntos como HarmBench o StrongREJECT, comparando configuraciones con y sin protección. Los resultados de la model card muestran que `harmcompliance` a `fpr10` alcanza un ASR de 0.119 en HarmBench y 0.153 en StrongREJECT, con una tasa de rechazo en PHTest harmless de 0.064.
- Investigación en interpretabilidad de modelos latentes: al ser un clasificador lineal, ofrece una proyección directa de las activaciones hacia una decisión de seguridad, lo que permite analizar qué dimensiones del espacio latente se correlacionan con el comportamiento inseguro.
- Comparación de métodos de alineación: la sonda sirve como baseline frente a técnicas más complejas como el aligner de atención o CoT-Guard. En la evaluación secuencial, `harmcompliance` a `fpr10` se sitúa junto al aligner en seguridad y utilidad, lo que la convierte en un punto de referencia para nuevas propuestas.
- Reentrenamiento para otros modelos o etiquetas: los shards de datos y los scripts incluidos permiten entrenar nuevas sondas con diferentes etiquetas o umbrales, adaptando la defensa a otros escenarios o modelos base, siempre que se mantenga la misma dimensión oculta y convención de roles.
- Despliegue como módulo de análisis en pipelines de PyTorch: el código de ejemplo en la model card muestra cómo cargar el checkpoint, calcular la puntuación y obtener el veredicto con una llamada `probe.verdict()`, lo que facilita su integración en scripts de evaluación o monitorización.

## Benchmarks y rendimiento

La model card incluye una evaluación secuencial sobre Qwen3-4B con K=8 y peticiones directas. Los resultados se muestran a continuación. En las columnas de ASR (HarmBench y StrongREJECT), un valor más bajo indica mejor seguridad; en OR-Bench y PHTest, un valor más bajo indica menor rechazo de contenido benigno o controvertido, es decir, mejor utilidad.

| Arquitectura | HarmBench ASR | StrongREJECT ASR | OR-Bench | PHTest harmless | PHTest controversial |
|---|---:|---:|---:|---:|---:|
| latent_mas (sin guardia) | 0.347 | 0.342 | 0.005 | 0.001 | 0.006 |
| latent_mas + aligner @ fpr10 | 0.163 | 0.147 | 0.067 | 0.080 | 0.173 |
| linear probe `harmcompliance` @ fpr05 | 0.141 | 0.217 | 0.035 | 0.035 | 0.135 |
| linear probe `harmcompliance` @ fpr10 | 0.119 | 0.153 | 0.079 | 0.064 | 0.195 |
| linear probe `prompt_harm` @ fpr05 | 0.103 | 0.038 | 0.268 | 0.193 | 0.383 |
| linear probe `prompt_harm` @ fpr10 | 0.103 | 0.035 | 0.346 | 0.234 | 0.420 |

El tamaño de las muestras fue de 320 para HarmBench, 313 para StrongREJECT, 1319 para OR-Bench-Hard-1K y 2077 + 1192 para PHTest (harmless y controversial). Además, se reportan métricas de validación para cada sonda:

| Sonda | AUC (validación) | AP (validación) | τ fpr05 | τ fpr10 |
|---|---:|---:|---:|---:|
| `harmcompliance` | 0.9268 | 0.5253 | 0.5348 | 0.3546 |
| `prompt_harm` | 0.9787 | 0.9580 | 0.4089 | 0.1650 |

## Requisitos de hardware

- La sonda en sí misma es extremadamente ligera: cada checkpoint ocupa aproximadamente 96 KB y la inferencia consiste en una normalización, un producto escalar de 7680 dimensiones y una sigmoide. Puede ejecutarse en CPU sin necesidad de VRAM.
- Para utilizar la sonda con LatentMAS se requiere ejecutar el modelo base Qwen3-4B (d_h=2560). La VRAM necesaria depende de la implementación y cuantización del modelo base, que no se detalla en la información disponible.
- No se proporcionan recomendaciones específicas de GPU. En principio, cualquier hardware capaz de ejecutar Qwen3-4B es suficiente para integrar la sonda, ya que el coste adicional de la sonda es despreciable.
- Opciones de despliegue: PyTorch mediante la clase `LinearProbe` de LatentMAS, carga directa del checkpoint con `torch.load`, o activación en runtime a través de configuración YAML.
- Latencia y throughput estimados: no disponibles. La sonda añade un coste mínimo (operaciones lineales sobre un vector de 7680 elementos), pero la latencia total está dominada por la generación del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | AUC (validación) | HarmBench ASR | PHTest harmless | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `linear_probe_harmcompliance` | Sonda lineal logística | 0.9268 | 0.141 @ fpr05 | 0.035 @ fpr05 | Apache 2.0 | HuggingFace |
| `linear_probe_prompt_harm` | Sonda lineal logística | 0.9787 | 0.103 @ fpr05 | 0.193 @ fpr05 | Apache 2.0 | HuggingFace |
| latent_mas + aligner @ fpr10 | Aligner de atención | No disponible | 0.163 | 0.080 | No disponible | No disponible |
| latent_mas (sin guardia) | Baseline sin protección | No disponible | 0.347 | 0.001 | No disponible | No disponible |

La comparación muestra que `harmcompliance` es el punto de operación más equilibrado: reduce el ASR a 0.141 con un rechazo de contenido benigno de 0.035 (a fpr05), manteniendo una utilidad similar al aligner. La variante `prompt_harm` alcanza un ASR más bajo, pero su tasa de rechazo en PHTest harmless es mucho mayor (0.193), lo que la convierte en un detector de temas más que en una defensa práctica.

## Limitaciones y advertencias

- La sonda está entrenada exclusivamente sobre activaciones de Qwen3-4B con dimensión oculta 2560 y una convención fija de tres roles (planificador, crítico, refinador). No transferirá a otros modelos o tamaños ocultos sin reentrenar.
- En arquitecturas con más de tres agentes, la sonda solo observa las activaciones del primer planificador, el primer crítico y el primer refinador. Los agentes adicionales no son visibles para el clasificador, aunque sí afectan al Judger.
- No es un clasificador de contenido general. Su entrenamiento está orientado a un contexto específico de seguridad en LatentMAS y no debe usarse para filtrar contenido arbitrario.
- La variante `prompt_harm` presenta una tasa de sobre-rechazo muy alta en contenido benigno y controvertido, lo que la hace inadecuada como defensa en producción; se recomienda usar `harmcompliance`.
- La model card indica que es un baseline de investigación. No se han validado sus umbrales ni su comportamiento en entornos de producción reales, y el repositorio tiene 0 descargas y 0 likes.
- El umbral seleccionado (por ejemplo, `fpr05` frente a `fpr10`) tiene un impacto significativo en el equilibrio entre seguridad y utilidad; es necesario ajustarlo al caso de uso concreto.

## Enlaces

- HuggingFace: https://huggingface.co/Danny-1223/latent-mas-linear-probe
- Artículo de LatentMAS (arXiv 2511.20639): https://arxiv.org/abs/2511.20639
- Repositorio de código LatentMASHarmBench: https://github.com/Asatheesh6561/LatentMASHarmBench
