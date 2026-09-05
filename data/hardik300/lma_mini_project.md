# hardik300/LMA_mini_project

## Resumen

El modelo `hardik300/LMA_mini_project` es un conjunto de cinco modelos de lenguaje transformer decoder-only, entrenados desde cero en PyTorch y publicados por el autor hardik300 como parte de un proyecto académico de investigación. Cada modelo tiene aproximadamente 25 millones de parámetros y fue entrenado durante una sola época sobre un corpus monolingüe propio, con el objetivo de estudiar el comportamiento de arquitecturas simples en lenguas de bajo recurso: gujarati y nepalí. Los pesos se distribuyen en diez checkpoints (dos por ejecución: `best.pt` y `latest.pt`), todos ellos reanudables, ya que incluyen el estado del optimizador, el scheduler, el escalador de gradientes, el número de paso y el estado de los generadores aleatorios.

El proyecto incluye variaciones de configuración para cada idioma: vocabularios de 12.000 o 16.000 tokens, 11 o 12 capas, y codificación posicional RoPE o ausencia de posiciones. Su relevancia radica en que es un ejemplo reproducible de entrenamiento de modelos monolingües desde cero, útil para comparar tokenizadores, técnicas de posicionamiento y métricas como la perplejidad o los bits por byte. La arquitectura es un transformer estándar, sin mecanismos de mezcla de expertos ni modelos de estado. La longitud de contexto no se ha especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 25.625.856 (configuracion 16k + RoPE; otras configuraciones hasta 25.860.864) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | gujarati (gu), nepalí (ne) |
| Licencia | MIT |
| Formato de pesos | checkpoints .pt de PyTorch |

## Arquitectura y entrenamiento

Los modelos son transformers decoder-only implementados desde cero en PyTorch, sin usar `nn.Transformer*`, sin clases de modelo de HuggingFace y sin mecanismos de atención preconstruidos. La atención se implementa manualmente y la arquitectura es convencional: 11 o 12 capas según la ejecución, con codificación posicional RoPE o sin codificación posicional en una de las variantes. El vocabulario se compone de 12.000 o 16.000 tokens, y el número total de parámetros oscila entre 25.625.856 y 25.860.864.

El entrenamiento se realizó durante una época sobre corpus monolingües de gujarati y nepalí, con un número de pasos que varía entre 14.962 y 16.418. No se menciona el tamaño exacto del corpus ni el número de tokens de entrenamiento. Tampoco se indica que se haya aplicado RLHF, DPO ni ninguna técnica de alineación posterior al entrenamiento. Cada ejecución genera dos checkpoints: `best.pt`, con la menor pérdida de validación, y `latest.pt`, con el estado al final de la ejecución. Ambos son reanudables y contienen tanto los pesos como los estados de optimización, schedulers, escaladores de gradientes, el paso de entrenamiento, el recuento de tokens, las configuraciones y los estados de los generadores aleatorios.

## Capacidades

- Generacion de texto autoregresivo en gujarati y nepalí.
- Metricas de evaluacion de perplejidad y bits por byte sobre conjuntos de prueba.
- Comparacion experimental de distintos tamanos de vocabulario (12k vs. 16k) y estrategias de posicionamiento (RoPE vs. sin posiciones).
- Reanudacion de entrenamiento desde un checkpoint, gracias a la inclusion completa del estado de optimizacion y de los generadores aleatorios.
- No dispone de soporte para tool calling o function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni multimodalidad.
- No dispone de un modo de pensamiento explicito (thinking mode).
- Las capacidades multilingues se limitan a los dos idiomas del proyecto: gujarati y nepalí.

## Casos de uso

- Investigacion en NLP de lenguas de bajo recurso: el modelo permite estudiar como afecta el tamano del vocabulario (12k frente a 16k) a la perplejidad y a los bits por byte en gujarati y nepalí. Es adecuado porque ofrece dos variantes por idioma con la misma arquitectura base.
- Comparacion de codificaciones posicionales: las variantes con RoPE y sin posiciones permiten evaluar el efecto de la informacion posicional en la generacion de texto para estos idiomas. Resulta util para trabajos academicos que buscan evidencia empirica sobre este tipo de decisiones de diseno.
- Ensenanza de arquitecturas transformer: al estar implementado desde cero y publicado con los checkpoints, sirve como material didactico para cursos de NLP, mostrando una implementacion completa de un decoder-only transformer con entrenamiento y evaluacion.
- Prototipado de pipelines de generacion de texto: los checkpoints pueden cargarse en un script personalizado de PyTorch para generar texto de prueba en gujarati y nepalí, lo que permite validar rapidamente la integracion con otros componentes de un sistema.
- Fine-tuning para tareas concretas: gracias a su tamano reducido (25M) y a la licencia MIT, el modelo puede ajustarse en tareas de clasificacion de texto, etiquetado o generacion en dominios especificos de gujarati y nepalí sin necesidad de infraestructura costosa.
- Reproducibilidad de experimentos: los checkpoints incluyen el estado completo del entrenamiento, lo que permite reanudar una ejecucion o reproducir los resultados exactos a partir del estado almacenado. Esto es valioso para verificar conclusiones sobre perplejidad y bits por byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son la perplejidad de prueba y los bits por byte (BPB) de las cinco ejecuciones, reportados por el autor. La perplejidad solo es comparable dentro del mismo vocabulario; los bits por byte son la metrica recomendada para comparar entre tokenizadores.

| Ejecucion | Idioma | Vocabulario | Capas | Posiciones | Parametros | Pasos | PPL de prueba | BPB de prueba |
|---|---|---:|---:|---|---:|---:|---:|---:|
| gujarati-model-h/16k-rope | Gujarati | 16.000 | 11 | RoPE | 25.625.856 | 15.826 | 51.62 | 0.5764 |
| gujarati-model-h/12k-rope | Gujarati | 12.000 | 12 | RoPE | 25.860.864 | 16.418 | 44.64 | 0.5759 |
| gujarati-model-h/16k-nopos | Gujarati | 16.000 | 11 | none | 25.625.856 | 15.826 | 56.07 | 0.5885 |
| nepali-model-l/16k-rope | Nepali | 16.000 | 11 | RoPE | 25.625.856 | 14.962 | 38.93 | 0.4247 |
| nepali-model-l/12k-rope | Nepali | 12.000 | 12 | RoPE | 25.860.864 | 15.564 | 33.47 | 0.4236 |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 100 MB en FP32 y 50 MB en FP16, por lo que es necesario muy poco espacio en memoria. Los checkpoints completos, con estado de optimizador y configuraciones, pesan mas, pero para inferencia bastan los pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente. No se requiere A100, H100 ni RTX 4090. El modelo tambien puede ejecutarse en CPU.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU de consumo, incluidas tarjetas antiguas o integradas.
- Opciones de despliegue: no se puede usar directamente con vLLM, llama.cpp u Ollama, porque los pesos estan guardados como checkpoints personalizados de PyTorch que requieren la clase `DecoderLM` del repositorio del proyecto. Para desplegarlo seria necesario implementar un servidor propio (por ejemplo, con FastAPI) que cargue el checkpoint y ejecute la generacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El proyecto no incluye tablas comparativas con otras arquitecturas ni con modelos de la misma categoria, y no se han encontrado datos externos que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo entrenado durante una sola epoca sobre corpus monolingües de tamano no especificado; la capacidad de generalizacion es limitada.
- No se han realizado evaluaciones de sesgos ni de seguridad; el modelo puede reflejar los sesgos presentes en su corpus de entrenamiento.
- Riesgo de alucinacion alto, especialmente fuera de la distribucion de entrenamiento o en contextos largos.
- La longitud de contexto no se ha especificado, por lo que se desconoce el comportamiento con secuencias extensas.
- Solo soporta gujarati y nepalí; no funciona con otros idiomas.
- La licencia MIT permite el uso comercial, pero el modelo es un experimento academico y no esta preparado para su uso en produccion.
- El formato de los pesos (.pt con estado de entrenamiento) no es estandar y dificulta su integracion con frameworks convencionales como Transformers, vLLM u Ollama sin adaptacion previa.

## Enlaces

- HuggingFace: https://huggingface.co/hardik300/LMA_mini_project
- Repositorio alternativo en HuggingFace con contenido relacionado: https://huggingface.co/adityamishraog/lma_mini_project_models
- Nota: la model card menciona un repositorio del proyecto que contiene el codigo, los tokenizadores, las configuraciones y los registros de entrenamiento, pero no se proporciona una URL explicita en la informacion disponible.
