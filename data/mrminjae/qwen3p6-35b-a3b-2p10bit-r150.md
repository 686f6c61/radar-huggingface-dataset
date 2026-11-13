# mrminjae/qwen3p6-35b-a3b-2p10bit-r150

## Resumen

Qwen3.6-35B-A3B-2.10bit-r150 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, capas densas, router) permanecen en BF16. Los pesos se distribuyen ya de-cuantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización específicos.

El interés técnico de esta ficha reside en la estrategia de compresión: al aplicar baja precisión únicamente a los expertos (que concentran la mayor parte de los parámetros en un MoE), se reduce el peso en disco y en memoria sin tocar los componentes sensibles a la cuantización agresiva. Es un enfoque relevante para investigadores que quieran estudiar el impacto de la cuantización extrema por componente en modelos de mezcla de expertos.

No obstante, se trata de un checkpoint interno sin model card detallada, sin benchmarks publicados, sin licencia declarada explícitamente (se indica que sigue la del modelo base) y con cero descargas en el momento de redactar esta ficha. Debe tratarse como material de experimentación, no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35B (según el identificador del modelo base; no confirmado en la model card) |
| Parametros activos | A3B (aproximadamente 3B activos, según el identificador del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento final en BF16 |
| Idiomas soportados | no disponible |
| Licencia | No declarada explícitamente; la model card indica que sigue la del modelo base (Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | Tensores BF16 (safetensors, presumiblemente, aunque no se confirma el formato exacto de los ficheros) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen3.6-35B-A3B, un modelo de mezcla de expertos con 35B parámetros totales y aproximadamente 3B activos por token. La intervención de mrminjae no modifica la arquitectura: mantiene la estructura MoE original (router más expertos enrutados) y aplica cuantización únicamente a los pesos de los expertos, dejando el resto de componentes en BF16. La precisión media resultante en los expertos es de 2,10 bits, lo que sitúa la compresión en un régimen extremo, muy por debajo de las cuantizaciones habituales de 4 u 8 bits.

Un detalle relevante es que los pesos se almacenan de-cuantizados en tensores BF16: el modelo no requiere kernels de cuantización en tiempo de inferencia, sino que reconstruye los valores en BF16 al cargar. Esto simplifica el despliegue (compatible con `transformers` y vLLM estándar) a costa de no aprovechar el ahorro de memoria que ofrecería un formato cuantizado nativo como GGUF o AWQ. No se dispone de información sobre los datos de entrenamiento, el proceso de calibración de la cuantización, ni si hubo ajuste fino posterior (RLHF/DPO). La model card únicamente indica que es un checkpoint de investigación interno con identificador r150.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.6-35B-A3B, aunque no se documentan explícitamente en la model card.
- Razonamiento y matemáticas: presumiblemente disponibles por herencia del base, sin verificación publicada.
- Generación de código: presumiblemente disponible por herencia del base, sin verificación publicada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Modo thinking, visión o audio: no documentado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructura de inferencia compatible con Hugging Face Endpoints.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite estudiar cómo afecta una precisión media de 2,10 bits en los expertos a la calidad de salida, comparándolo con el modelo base en BF16 y con cuantizaciones de 4 y 8 bits. Es su uso principal y más realista.
- Evaluación de robustez de routers en MoE: al mantener el router en BF16 y degradar solo los expertos, se puede aislar el efecto de la cuantización de expertos frente a la del mecanismo de enrutamiento.
- Reproducción de pipelines de inferencia estándar: al cargar con `transformers` y vLLM sin kernels especiales, sirve para validar que un checkpoint de-cuantizado en BF16 se integra sin fricción en infraestructura existente.
- Benchmarking de latencia y memoria: permite medir el coste real de almacenar pesos de-cuantizados en BF16 frente a formatos cuantizados nativos, útil para decisiones de arquitectura de despliegue.
- Docencia y divulgación: ejemplo práctico de cuantización selectiva por componente en modelos de mezcla de expertos.
- Pruebas de regresión de calidad: comparar respuestas del checkpoint r150 con el base para detectar degradaciones sistemáticas en tareas concretas (código, matemáticas, multilingüe) antes de adoptar técnicas similares en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16 (35B parámetros), el modelo requiere aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV. La cuantización a 2,10 bits de los expertos no reduce el consumo en tiempo de inferencia porque los pesos se cargan de-cuantizados.
- GPU recomendadas: para caber en una sola GPU se necesitan aceleradores de 80 GB (A100 80GB, H100 80GB). En configuraciones multi-GPU, dos A100 40GB o dos RTX 4090 de 24 GB con tensor parallelism podrían ser viables, aunque no está confirmado.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en una sola unidad por el tamaño de los pesos en BF16. Sería necesario sharding entre varias GPU o recurrir a offload a CPU/RAM.
- Opciones de despliegue: `transformers` y vLLM estándar, según la model card. No se mencionan llama.cpp, Ollama ni TGI; dado que los pesos están en BF16, las herramientas que esperan GGUF no los cargarían directamente.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~3B activos, el throughput por token debería ser favorable en relación con el total de parámetros, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r150 | 35B | ~3B | no disponible | Heredada del base (no especificada) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | La del modelo base Qwen | Hugging Face |
| Cuantizaciones estándar del base (4/8 bits) | 35B | ~3B | Igual que el base | La del modelo base | Depende del publicador |

La comparación directa con otras cuantizaciones del mismo base no puede establecerse con datos numéricos porque no hay benchmarks publicados para este checkpoint. La diferencia principal frente al base es la precisión de los expertos (2,10 bits frente a BF16) y el hecho de que los pesos se distribuyen de-cuantizados en BF16, por lo que el ahorro es de fidelidad, no de memoria en inferencia.

## Limitaciones y advertencias

- Checkpoint de investigación interna sin model card detallada: no hay información sobre calibración, dataset de cuantización ni validación de calidad.
- Sin benchmarks publicados: no se puede afirmar que las capacidades del base se preserven tras la cuantización a 2,10 bits.
- Licencia no declarada explícitamente: la model card remite a la del modelo base, pero no se especifica cuál es; verificar antes de cualquier uso comercial.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe.
- Riesgo de degradación por cuantización extrema: 2,10 bits de media en los expertos está muy por debajo de los regímenes habituales y puede producir alucinaciones, pérdida de coherencia en contextos largos o fallos en tareas de razonamiento.
- Sin adopción verificable: cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso en producción ni de validación por terceros.
- Almacenamiento en BF16: no ofrece el ahorro de memoria de un formato cuantizado nativo, lo que limita su utilidad práctica en hardware de consumo.
- Fecha de creación futura respecto a la información disponible: el checkpoint está fechado en 2026-11-13, lo que refuerza su carácter experimental y la ausencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r150
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
