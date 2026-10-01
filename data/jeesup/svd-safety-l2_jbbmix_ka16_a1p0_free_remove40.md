# Jeesup/svd-safety-l2_jbbmix_ka16_a1p0_free_remove40

## Resumen

Este checkpoint es un artefacto de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de una versión de `meta-llama/Llama-2-7b-chat-hf` comprimida con SVD-LLM hasta el 60,0 % de los parámetros densos (un 40,00 % de parámetros eliminados), sobre la que después se aplica una regla de restauración de componentes SVD con un presupuesto del 0,000 % y cero componentes restaurados. Según la propia model card, forma parte de una parrilla de experimentos que estudia cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente de propósito general. Es una celda concreta de esa parrilla, identificada con la regla de selección `unknown`, semilla 42 y fracción resultante declarada de 0,5998 del modelo denso. La model card advierte explícitamente de que varias ramas de la parrilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y de que cualquier celda debe tratarse como sujeto experimental, no como modelo desplegable.

Su relevancia es metodológica: sirve para cuantificar el compromiso entre seguridad y utilidad bajo compresión y para reproducir comparaciones entre reglas de selección de componentes SVD. El recuento real de safetensors es de 6.738.415.616 parámetros y el repositorio ocupa 13,5 GB. El modelo acumula 0 descargas y 0 me gusta en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresión SVD-LLM aplicada |
| Parámetros totales | 6.738.415.616 (recuento real en safetensors); fracción resultante declarada en la model card: 0,5998 del modelo denso |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors; no se documentan GGUF, GPTQ, AWQ ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresión | SVD-LLM, 40,00 % de parámetros eliminados |
| Regla de selección de componentes | `unknown` |
| Presupuesto de restauración | 0,000 % de los parámetros densos |
| Componentes restaurados / sustituidos | 0 / 0 |
| Semilla | 42 |
| Biblioteca | transformers |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat, un transformer decoder-only. Sobre ese checkpoint se aplica SVD-LLM, un método de compresión basado en descomposición en valores singulares que elimina el 40,00 % de los parámetros. Después se ejecuta una fase de restauración de componentes SVD guiada por una regla de selección, en este caso etiquetada como `unknown`, con un presupuesto del 0,000 % de los parámetros densos, lo que se traduce en cero componentes restaurados y cero componentes sustituidos.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores a la compresión. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal. La innovación del artefacto es exclusivamente metodológica: aislar el efecto de una regla de selección de componentes y de un presupuesto de restauración concretos sobre las capacidades de seguridad y de modelado de lenguaje del modelo comprimido.

Las métricas publicadas en la model card son: AdvBench ASR con juez HarmBench de 0,0019; StrongREJECT ASR con juez HarmBench de 0,0224; macro sobre-rechazo con WildGuard de 0,5820; y perplejidad de 11,5828 en WikiText-2.

## Capacidades

- Generación de texto conversacional: hereda la pipeline `text-generation` y la etiqueta `conversational` del modelo base.
- Comprensión y generación de lenguaje general: la perplejidad medida en WikiText-2 es de 11,5828, lo que indica que el modelo sigue modelando texto de forma funcional tras la compresión.
- Evaluación de seguridad como sujeto de estudio: las métricas AdvBench y StrongREJECT se han calculado con juez HarmBench, y el sobre-rechazo con WildGuard, de modo que el checkpoint está instrumentado para medir tasa de éxito de ataques y rechazo excesivo.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta ni se evalúa).
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como una celda controlada para medir cuánto degrada SVD-LLM la perplejidad y el comportamiento de seguridad frente a Llama-2-7b-chat sin comprimir, manteniendo constante la semilla (42) y el porcentaje de parámetros eliminados (40,00 %).
- Evaluación de seguridad y red teaming: ejecutar baterías AdvBench y StrongREJECT con juez HarmBench sobre esta celda y comparar la tasa de éxito de ataques (0,0019 y 0,0224 respectivamente) con la de otras celdas de la parrilla para identificar qué regla de selección de componentes recupera mejor la seguridad.
- Estudio de sobre-rechazo: emplear la métrica macro de sobre-rechazo con WildGuard (0,5820) para cuantificar el coste en utilidad que introduce la compresión, ya que un valor alto indica rechazos indebidos en peticiones benignas.
- Reproducibilidad de experimentos: replicar la celda con semilla 42 y presupuesto de restauración 0,000 % para verificar los resultados publicados y auditar la regla de selección etiquetada como `unknown`.
- Comparación de métodos de compresión: servir de referencia frente a otras técnicas de compresión del mismo modelo base, midiendo el mismo conjunto de métricas (perplejidad WikiText-2 y ASR) bajo idénticas condiciones de evaluación.
- Análisis de interpretabilidad: estudiar qué componentes SVD elimina la compresión y correlacionar su eliminación con cambios en las métricas de seguridad, dado que el artefacto incorpora la etiqueta `interpretability`.
- Validación de pipelines de evaluación: probar jueces automáticos (HarmBench, WildGuard) contra un modelo con comportamiento conocido y documentado antes de aplicarlos a modelos en producción.
- Docencia y formación: ilustrar en un entorno controlado el compromiso entre compresión, seguridad y utilidad en modelos de lenguaje, dado que el checkpoint es pequeño (13,5 GB en safetensors) y no requiere infraestructura especial.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0019 |
| StrongREJECT | ASR (juez HarmBench) | 0,0224 |
| WildGuard | Macro sobre-rechazo | 0,5820 |
| WikiText-2 | Perplejidad | 11,5828 |

No se han publicado en la información disponible resultados comparativos con otros modelos para estos mismos benchmarks, ni cifras de MMLU, HumanEval, GSM8K u otros conjuntos estándar. Tampoco se proporcionan las métricas del modelo base sin comprimir, por lo que no es posible calcular la degradación relativa a partir de los datos facilitados.

## Requisitos de hardware

- VRAM estimada en precisión fp16: aproximadamente 13,5 GB para 6.738.415.616 parámetros, coherente con el tamaño del repositorio (13,5 GB). Estimación aritmética, no un dato publicado.
- VRAM estimada en int8: aproximadamente 6,7 GB. Estimación aritmética; el repositorio no distribuye pesos cuantizados.
- VRAM estimada en int4: aproximadamente 3,4 GB. Estimación aritmética; requiere cuantizar el modelo por cuenta propia.
- GPU de datacenter recomendadas: A100 (40 GB o 80 GB) y H100, suficientes para fp16 sin particionado.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar el modelo en fp16, aunque con margen ajustado para el contexto y las cachés de atención. Tarjetas de 16 GB o menos necesitan cuantización previa.
- Opciones de despliegue: `transformers` (biblioteca declarada) y `text-generation-inference` (etiqueta del repositorio, junto con `endpoints_compatible`). El soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_jbbmix_ka16_a1p0_free_remove40 | 6.738.415.616 en safetensors; fracción declarada 0,5998 | no disponible | AdvBench ASR 0,0019; StrongREJECT ASR 0,0224; sobre-rechazo 0,5820; perplejidad WikiText-2 11,5828 | Llama 2 Community License | HuggingFace, 0 descargas y 0 me gusta |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Llama 2 Community License | HuggingFace |
| Otras celdas de la parrilla SVD del mismo autor (reglas de selección y presupuestos alternativos) | no disponible | no disponible | no disponible | Llama 2 Community License | referenciadas en la model card, sin identificadores ni métricas facilitadas |

No se dispone de datos suficientes para comparar este checkpoint con alternativas de terceros de la misma categoría (modelos de 7B comprimidos o destilados). Cualquier comparación cuantitativa requeriría ejecutar las mismas baterías sobre los modelos alternativos.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la propia model card indica que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Degradación deliberada de seguridad en parte de la parrilla: la compresión por sí sola eleva la tasa de éxito de ataques en varias ramas del experimento, según advierte el autor. La celda concreta aquí descrita presenta valores bajos de ASR en AdvBench y StrongREJECT, pero eso no es extrapolable al resto de la parrilla ni a otros presupuestos de restauración.
- Sobre-rechazo elevado: el macro de sobre-rechazo con WildGuard es de 0,5820, lo que apunta a una utilidad conversacional mermada por rechazos indebidos en peticiones legítimas.
- Perplejidad alta: 11,5828 en WikiText-2, coherente con un modelo comprimido un 40,00 %; no se dispone de la cifra del modelo base para cuantificar la pérdida exacta.
- Riesgo de alucinación: no evaluado en la información disponible; no hay métricas de fidelidad factual ni de veracidad.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible; tampoco se documenta el comportamiento del modelo con contextos largos tras la compresión.
- Inconsistencia potencial en el recuento de parámetros: el total real en safetensors (6.738.415.616) es próximo al de Llama-2-7b sin comprimir, mientras que la model card declara una fracción resultante de 0,5998. La información disponible no explica esta diferencia.
- Regla de selección no identificada: el campo aparece como `unknown`, lo que dificulta interpretar y reproducir la selección de componentes.
- Restricciones de licencia: el uso está sujeto a la Llama 2 Community License y a la política de uso aceptable incluidas en el repositorio (`LICENSE.txt` y `USE_POLICY.md`). Cualquier uso comercial derivado debe respetar esos términos.
- Adopción nula: 0 descargas y 0 me gusta en el momento de la consulta, sin comunidad que haya validado los resultados.
- Cuantizaciones no publicadas: no se ofrecen pesos GGUF, GPTQ ni AWQ, por lo que el despliegue en entornos de bajos recursos exige conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_jbbmix_ka16_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de la licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md`, incluidos en el propio repositorio del modelo.
- Paper de SVD-LLM, blog del autor, repositorio de código y demos: no disponibles en la información proporcionada.
