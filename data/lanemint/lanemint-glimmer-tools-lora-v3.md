# LaneMint/lanemint-glimmer-tools-lora-v3

## Resumen

LaneMint Glimmer Tools LoRA V3 es un adaptador LoRA (PEFT) desarrollado por LaneMint sobre el modelo base meta-models/Muse-Glimmer-30B, un modelo de 30 000 millones de parámetros con capacidades multimodales (procesamiento de imagen y texto). El adaptador se entrenó durante un hackathon de Meta con el objetivo declarado de mejorar el uso de herramientas (tool use) multi-turno en el nivel `tools_frontier` del benchmark interno LaneMint. Se distribuye en formato PEFT sobre safetensors, en BF16, con un tamaño de repositorio de 0,4 GB, lo que corresponde únicamente a los pesos del adaptador (832 tensores sobre las 52 capas del decodificador).

El resultado principal es explícitamente negativo en precisión: sobre 90 tareas held-out, el adaptador obtiene 26/90 frente a 27/90 del modelo base, una diferencia dentro del ruido estadístico. Sin embargo, sí corrige un problema grave de formato de salida del modelo base: las respuestas finales vacías caen de 50 a 0 y los impactos contra el límite de turnos bajan de 64 a 23. Es, por tanto, un artefacto de investigación que enseña al modelo a concluir y entregar una respuesta, pero no a resolver tareas más difíciles.

Su relevancia es doble: por un lado, documenta con honestidad un resultado neutro en un contexto de cómputo y tiempo limitados; por otro, ejemplifica un patrón útil en la práctica, el de adaptadores que normalizan el comportamiento de parada y formato de un agente sin alterar su capacidad de razonamiento. No debe considerarse una mejora de rendimiento sobre el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder con atención con puerta (gated attention); modelo base multimodal de 52 capas |
| Parámetros totales | No disponible para el adaptador; el modelo base Muse-Glimmer-30B tiene 30 000 millones (según el identificador) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El adaptador se publica en BF16; no se documentan cuantizaciones del adaptador. El modelo base admitiría las soportadas por su ecosistema (no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta además a la licencia y política de uso del modelo base) |
| Formato de pesos | Safetensors en formato PEFT (adaptador LoRA); sin tokenizer incluido |
| Rank / alpha / dropout | r = 32, alpha = 64, dropout = 0.0 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj` de salida de atención, y `gate_proj`, `up_proj`, `down_proj` de MLP |
| Capas cubiertas | 52 capas del decodificador (832 tensores) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar en formato PEFT, sin DoRA y sin sesgos, aplicado sobre un modelo base multimodal que se carga con `AutoModelForImageTextToText`. Los módulos objetivo incluyen las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), la proyección de puerta de la atención con puerta (`gate_proj` de salida de atención) y las tres proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`), cubriendo las 52 capas del decodificador con 832 tensores en total. El adaptador se guarda con claves para el modelo completo de generación condicional (`base_model.model.model.language_model.layers.*`), por lo que debe cargarse con la misma clase Auto con la que se distribuye el modelo base.

El entrenamiento consistió en ajuste fino supervisado (SFT) con Fireworks serverless training durante 3 épocas, publicándose el checkpoint de la época 2. Los datos son aproximadamente 103 trayectorias de profesor (93 de entrenamiento, 10 de validación) generadas por Muse Spark Open con herramientas Python activadas sobre el nivel `tools_frontier` del benchmark del hackathon; solo se conservaron trayectorias que pasaron una calificación estricta, usaron 10 turnos o menos y no recurrieron a una respuesta final forzada. Las semillas de entrenamiento se separaron de las de evaluación. La pérdida de validación evolucionó de 0,337 a 0,161 y luego a 0,155. No hubo búsqueda de hiperparámetros ni RLHF/DPO; el conjunto es muy reducido (unas 103 muestras) y proviene de un único profesor y un único nivel de benchmark.

## Capacidades

- Generación de texto y razonamiento multi-turno sobre el modelo base Muse-Glimmer-30B.
- Uso de herramientas (tool calling / function calling) en bucles de agente con herramientas Python, entrenado específicamente para el estilo de llamadas del nivel `tools_frontier`.
- Finalización fiable de la tarea: elimina las respuestas finales vacías (de 50 a 0 en la evaluación held-out) y reduce los impactos contra el límite de turnos (de 64 a 23).
- Capacidades multimodales heredadas del modelo base (carga mediante `AutoModelForImageTextToText` y `AutoProcessor`), aunque el adaptador se entrenó sobre trayectorias de herramientas y no se documentan evaluaciones de visión.
- Soporte multilingüe: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre comportamiento de parada en agentes: el adaptador sirve para estudiar cómo un ajuste fino pequeño puede normalizar el formato de salida final de un agente sin mejorar su precisión, comparando las métricas de respuestas vacías y de límite de turnos frente al modelo base.
- Reproducción de resultados negativos: útil como artefacto de referencia para replicar el protocolo de evaluación (90 tareas held-out, 3 semillas × 30 tareas, herramientas Python, límite de 12 turnos, puntuación estricta) y validar la metodología de LaneMint.
- Prototipado de agentes con herramientas Python en entornos controlados: el adaptador produce respuestas finales no vacías de forma consistente, lo que simplifica el parseo de salidas en pipelines de demostración, aunque la tasa de acierto (26/90) limita su uso en producción.
- Estudio de sobreajuste a un estilo de tool calling: al entrenarse con un único profesor y un único nivel de benchmark, permite analizar cómo se transfiere (o no) el estilo de llamadas a otras familias de tareas, como `fx_calendar`, `convention_risk` o `split_holdings`.
- Base para experimentos de destilación de profesor: las 103 trayectorias filtradas y el adaptador resultante pueden servir como punto de partida para estudiar el efecto del tamaño de datos y del filtrado estricto en SFT de agentes.
- Docencia y divulgación: ejemplo didáctico de LoRA sobre un modelo de 30 000 millones con resultados honestos, útil para explicar métricas de agente más allá de la precisión (respuestas vacías, límite de turnos, desglose por familia de tareas).

## Benchmarks y rendimiento

Evaluación held-out sobre 90 tareas `tools_frontier` (3 semillas × 30 tareas), herramientas Python activadas, límite de 12 turnos y puntuación estricta. Todos los brazos usaron el mismo arnés.

| Modelo | Aciertos /90 | Respuestas finales vacías | Impactos en límite de turnos |
|---|---|---|---|
| Muse Spark 1.3 (referencia) | 63 | 0 | 50 |
| Muse Spark Open (referencia, profesor) | 51 | 0 | 10 |
| Muse Glimmer 30B (base) | 27 | 50 | 64 |
| Este adaptador (V3) | 26 | 0 | 23 |

Desglose por familia de tareas: V3 mejora en `fx_calendar` (+4) y empeora en `convention_risk` (−2) y `split_holdings` (−3). Tanto el modelo base como V3 obtienen 0 en `reconciliation` y `portfolio_construction`. Una comprobación previa sobre una única semilla no vista mostró +3 (10 frente a 7 sobre 30), ganancia que desapareció en el conjunto held-out mayor.

## Requisitos de hardware

- El adaptador en sí ocupa unos 419 MB en BF16 y se suma a los pesos del modelo base de 30 000 millones de parámetros; la VRAM necesaria la determina el modelo base, no el adaptador.
- Para el modelo base en BF16 se requiere aproximadamente 60 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; se necesitan GPUs de 80 GB (A100, H100) o múltiples GPUs con `device_map="auto"`.
- En cuantización de 8 bits el modelo base rondaría los 30 GB, y en 4 bits unos 15-18 GB, lo que podría permitir su ejecución en GPUs de consumo alto (por ejemplo, RTX 4090 de 24 GB) siempre que el ecosistema del modelo base soporte dichas cuantizaciones; no se documenta compatibilidad con llama.cpp, GGUF, vLLM, TGI u Ollama.
- El adaptador se ha evaluado únicamente en la pila de servicio de Fireworks; la carga con `transformers` y `peft` se muestra en la model card pero no se ha probado fuera de ese entorno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aciertos /90 (tools_frontier) | Respuestas vacías | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muse Spark 1.3 (referencia) | No disponible | No disponible | 63 | 0 | No disponible | Referencia interna del benchmark |
| Muse Spark Open (profesor) | No disponible | No disponible | 51 | 0 | No disponible | Referencia interna del benchmark |
| Muse Glimmer 30B (base) | 30 000 M | No disponible | 27 | 50 | Apache-2.0 (según el adaptador) | Hugging Face |
| LaneMint Glimmer Tools LoRA V3 | Adaptador sobre 30 000 M | No disponible | 26 | 0 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros adaptadores LoRA comparables sobre el mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- No mejora la precisión sobre el modelo base en tareas held-out (26 frente a 27 sobre 90); debe usarse como artefacto de investigación, no como actualización de producción.
- El conjunto de entrenamiento es muy pequeño (unas 103 muestras) y proviene de un único profesor y un único nivel de benchmark, por lo que es esperable sobreajuste al estilo de llamadas de herramientas de ese nivel.
- Todos los resultados proceden de un único benchmark con n = 90; los intervalos de confianza son amplios y la ganancia observada en una comprobación previa con una sola semilla desapareció en el conjunto mayor.
- No ayuda en tareas de `reconciliation` ni `portfolio_construction`; el autor lo atribuye a una carencia de capacidad, no de formato de salida.
- Se entrenó con un bucle de agente de 12 turnos y herramientas Python; puede comportarse de forma distinta con otros arneses, herramientas o límites de turnos.
- Producido bajo límites de tiempo y cómputo de hackathon, sin búsqueda de hiperparámetros.
- El adaptador no incluye ficheros de tokenizer: debe usarse el tokenizer y la plantilla de chat del modelo base.
- La licencia Apache-2.0 del adaptador está sujeta además a la licencia y política de uso del modelo base `meta-models/Muse-Glimmer-30B`.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, aunque son heredables del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaneMint/lanemint-glimmer-tools-lora-v3
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset de benchmark: https://huggingface.co/datasets/LaneMint/lanemint-meta-benchmark
- Código y informes: https://github.com/alsopgroup/lanemint-meta-hackathon
