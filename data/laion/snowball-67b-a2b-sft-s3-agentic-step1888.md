# laion/snowball-67b-a2b-sft-s3-agentic-step1888

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por LAION como parte del proyecto Marin. Se trata del export en BF16 para HuggingFace y vLLM de la etapa "Agentic" de una campaña de fine-tuning supervisado (SFT) en tres fases ordenadas: Chat, Thinking y Agentic. El modelo está diseñado para tareas de conversación, razonamiento y uso de agentes, y su nombre "A2B" indica que activa aproximadamente 2.000 millones de parámetros de un total de 67.000 millones, lo que permite una inferencia relativamente eficiente para su tamaño.

El entrenamiento se realizó sobre el checkpoint final de la etapa Thinking (paso 630), con un dataset específico de SFT agentic (`grug-a2b-agentic-sft-eot`), cinco épocas de tokens, 1.888 pasos y una longitud de secuencia de 32.768 tokens. La pérdida final fue de aproximadamente 0,201. El modelo conserva el tokenizer Marin y los tokens especiales Delphi, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

La relevancia de este modelo radica en su enfoque explícito en capacidades agentic, es decir, la capacidad de interactuar con herramientas, planificar pasos múltiples y ejecutar tareas complejas, algo cada vez más demandado en aplicaciones de IA conversacional y automatización. Al ser un MoE con solo 2B parámetros activos, ofrece un equilibrio entre calidad de salida y coste computacional, aunque su tamaño total de 67B sigue requiriendo hardware considerable para cargar todos los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con tokenizer Marin y tokens especiales Delphi |
| Parametros totales | 67.078.882.816 (67B) |
| Parametros activos | 2B (aproximadamente, según la nomenclatura A2B) |
| Longitud de contexto | 32.768 tokens (según la secuencia de entrenamiento) |
| Tipos de cuantizacion | BF16 (export oficial); no se mencionan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 134,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE), como indican los tags `grug_moe` y `mixture-of-experts`. Con 67B parámetros totales y aproximadamente 2B activos por token, pertenece a la familia de MoE eficientes en inferencia, donde solo una fracción de los pesos se utiliza en cada paso. No se dispone de detalles adicionales sobre el número de expertos, la dimensión del hidden state o el mecanismo de enrutamiento, ya que no aparecen en la información proporcionada.

El entrenamiento consistió en una campaña SFT en tres etapas ordenadas: Chat, Thinking y Agentic. La etapa Agentic, que es la que representa este checkpoint, se inicializó desde el checkpoint final de la etapa Thinking (paso 630). El dataset utilizado fue `tokenized/grug-a2b-agentic-sft-eot@2026.08.05`, con una corrección en la ruta de los tokens de fin de secuencia (EOT) según el PR #8171 del repositorio `marin-community/marin`. El schedule de entrenamiento fue de cinco épocas de tokens, 1.888 pasos, longitud de secuencia de 32.768 y tamaño de lote global de 64. La pérdida final reportada es de aproximadamente 0,201. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; solo SFT supervisado.

## Capacidades

- Generación de texto conversacional: entrenado específicamente en una etapa de Chat, lo que lo hace adecuado para diálogos multi-turno.
- Razonamiento (thinking): la segunda etapa SFT se centró en razonamiento, lo que sugiere capacidad para resolver problemas que requieren pasos intermedios.
- Uso de agentes: la etapa Agentic está diseñada para tareas que implican interacción con herramientas, planificación y ejecución de acciones.
- Soporte de tool calling / function calling: no se confirma explícitamente, pero la naturaleza agentic del entrenamiento sugiere que puede integrarse en pipelines que requieran invocación de funciones.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Otras capacidades especiales: no se mencionan capacidades de visión, audio o modo thinking explícito; el modelo es puramente de texto.

## Casos de uso

- Asistentes conversacionales avanzados: gracias a su entrenamiento en la etapa Chat y su ventana de contexto de 32.768 tokens, puede mantener conversaciones largas y coherentes, recordando información de turnos anteriores.
- Razonamiento complejo y resolución de problemas: la etapa Thinking le permite abordar tareas que requieren cadenas de razonamiento, como análisis de datos, planificación o resolución de puzzles.
- Agentes autónomos: su entrenamiento agentic lo hace apto para sistemas que deben interactuar con APIs, bases de datos o herramientas externas, ejecutando acciones paso a paso.
- Generación de código asistida: aunque no hay datos específicos de rendimiento en código, su capacidad de razonamiento y contexto largo puede aplicarse a tareas de programación asistida.
- Automatización de procesos empresariales: puede integrarse en flujos de trabajo que requieran comprensión de instrucciones complejas y ejecución de tareas multi-paso.
- Investigación en IA: al ser un modelo de código abierto con licencia Apache 2.0, es útil para experimentos académicos sobre MoE, fine-tuning agentic y evaluación de capacidades emergentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K u otras, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 134 GB (tamaño del repo). Con cuantización a 8 bits se reduciría a ~67 GB, y a 4 bits a ~34 GB. Sin embargo, al ser MoE con solo 2B activos, la memoria para activaciones es reducida, pero los pesos totales deben cargarse en memoria.
- GPU recomendadas: para BF16 sin cuantizar se necesitan GPUs con al menos 134 GB de VRAM, como una A100 80GB (insuficiente) o varias GPUs en paralelo (p.ej. 2× A100 80GB). Para cuantización 4-bit, una RTX 4090 (24 GB) no sería suficiente; se necesitaría al menos 34 GB, por lo que una A6000 (48 GB) o A100 40GB podrían ser opciones, aunque el rendimiento dependería de la implementación.
- Opciones de despliegue: el modelo es compatible con vLLM (según el export mencionado) y con HuggingFace Transformers. También podría usarse con llama.cpp si se convierte a GGUF, aunque no se menciona. Ollama no está confirmado.
- Latencia y throughput: no se proporcionan datos. Al ser MoE con 2B activos, la latencia por token debería ser menor que la de un modelo denso de 67B, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo pertenece a la categoría de MoE de gran tamaño con pocos parámetros activos, similar en concepto a Mixtral 8x7B (46B totales, 12B activos) o Qwen2.5-MoE, pero no hay datos de rendimiento ni de arquitectura detallada que permitan una comparación rigurosa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones idiomáticas específicas.
- El modelo solo está disponible en BF16, lo que implica un alto requisito de almacenamiento (134 GB) y memoria para cargar todos los pesos, incluso si solo se activan 2B por token.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y la procedencia del modelo.
- Al ser un modelo entrenado específicamente para agentes, puede mostrar comportamientos inesperados en contextos no relacionados con tareas agentic, como generación de texto libre.
- La documentación es escasa; no se detallan los datos de entrenamiento, la composición del dataset ni las técnicas de enrutamiento del MoE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-sft-s3-agentic-step1888
- Repositorio Marin (PR #8171): https://github.com/marin-community/marin/pull/8171
- Repositorio Marin (PR #8172): https://github.com/marin-community/marin/pull/8172
- Issue del experimento (Marin #8225): https://github.com/marin-community/marin/issues/8225
