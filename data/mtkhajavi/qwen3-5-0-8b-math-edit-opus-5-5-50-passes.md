# mtkhajavi/Qwen3.5-0.8B-math-edit-opus-5.5-50-passes

## Resumen

Qwen3.5-0.8B-math-edit-opus-5.5-50-passes es una variante editada del modelo Qwen3.5-0.8B (752.393.024 parámetros) publicada por el usuario mtkhajavi en Hugging Face. No se trata de un fine-tuning convencional: el autor aplica una edición directa del espacio de pesos (weight-space programming) escrita por Claude Opus 5.5, sin gradientes, sin optimizadores y sin ajuste a una función de pérdida. El objetivo declarado es mejorar el rendimiento del modelo base en tareas matemáticas.

La edición concreta consiste en poner a cero tres cabezas de atención y multiplicar por dos una neurona de la capa MLP; el archivo `edits.json` del repositorio lista los tensores modificados. El autor reporta mejoras muy significativas en su propia evaluación: MATH-500 pasa de 8,8% a 54,4%, GSM8K de 12,8% a 66,3% e IFEval de 22,0% a 50,4%, con el protocolo think35 y vLLM 0.32.0.

El interés de esta ficha es doble: por un lado, documenta un modelo pequeño (menos de 800 millones de parámetros) con licencia Apache 2.0 y pesos en safetensors; por otro, es un caso de estudio de edición de pesos guiada por un modelo de lenguaje, una técnica experimental que conviene tratar con cautela hasta que haya replicaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante text-only; tag `qwen3_5_text`) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 en su variante solo texto. Sobre esa base no se ha realizado entrenamiento adicional: según la model card, las reglas del experimento prohibían gradientes, optimizadores y ajuste de pesos a una pérdida. La modificación es una edición discreta del espacio de pesos consistente en anular tres cabezas de atención y duplicar una neurona de una capa MLP.

El procedimiento se enmarca en la replicación del artículo "Sparks of Weight-Space Programming" (experimento 8: mejorar Qwen3.5-0.8B en matemáticas). Claude Opus 5.5 leyó los pesos y escribió la edición en Python, con 50 forward passes sobre problemas de práctica para probar ideas. La evaluación se realizó con el `evaluate.py` de los autores del artículo, protocolo think35 y vLLM 0.32.0: MATH-500 con 4 muestras por problema, GSM8K test con 2 muestras e IFEval estricto a nivel de prompt con 2 muestras.

No se documentan en la información disponible los datos de preentrenamiento del modelo base, la composición del dataset, ni si hubo RLHF o DPO en Qwen3.5-0.8B. Tampoco se detalla qué cabezas de atención ni qué neurona MLP concretas se han modificado más allá de la referencia a `edits.json`.

## Capacidades

- Generación de texto y razonamiento en el modelo base Qwen3.5-0.8B, del que no se detallan capacidades específicas en la información disponible.
- Razonamiento matemático: el objetivo declarado de la edición es mejorar el rendimiento en matemáticas, con mejoras reportadas en MATH-500 y GSM8K.
- Seguimiento de instrucciones: se reporta una mejora en IFEval (22,0% a 50,4% en la evaluación del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles para esta variante; el tag `qwen3_5_text` sugiere que es solo texto.

## Casos de uso

- Evaluación de técnicas de edición de pesos: el modelo sirve como caso reproducible para estudiar si una edición discreta de cabezas de atención y neuronas MLP puede alterar el comportamiento matemático de un modelo pequeño, usando el repositorio del autor con la conversación, la edición exacta y la evaluación.
- Investigación en weight-space programming: permite replicar el experimento 8 del artículo de referencia y comparar la edición de Claude Opus 5.5 con otras ediciones sobre el mismo modelo base.
- Prototipado de razonamiento matemático en entornos con recursos limitados: con 752 millones de parámetros y pesos safetensors de 1,5 GB, el modelo puede ejecutarse en una sola GPU consumer para pruebas de aritmética y problemas de MATH-500 o GSM8K, siempre que se validen los resultados del autor.
- Docencia y divulgación sobre interpretabilidad: la edición de tres cabezas de atención y una neurona MLP es un ejemplo concreto y acotado para explicar cómo se organiza internamente un transformer y qué efecto tienen componentes individuales.
- Base para experimentos comparativos de edición: al estar publicado el `edits.json`, se puede aplicar la misma edición a otras variantes o revertirla para medir el efecto aislado de cada cambio.
- Evaluación de robustez de benchmarks: útil para estudiar cómo cambios mínimos en los pesos afectan a métricas como IFEval estricto, y para discutir la sensibilidad de los protocolos de evaluación con pocas muestras.

## Benchmarks y rendimiento

Resultados reportados por el autor con su `evaluate.py` (protocolo think35, vLLM 0.32.0):

| Modelo | MATH-500 (%) | GSM8K (%) | IFEval (%) |
|---|---|---|---|
| Qwen3.5-0.8B sin editar | 8,8 | 12,8 | 22,0 |
| Esta edición (50 forward passes) | 54,4 | 66,3 | 50,4 |

No se han publicado en la información disponible resultados de benchmarks independientes ni comparaciones con otros modelos de la misma categoría. Las cifras proceden exclusivamente de la evaluación del autor y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,5 GB en el repositorio; en fp16 el modelo de 752 millones de parámetros requiere alrededor de 1,5 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no son necesarias por tamaño, pero pueden usarse en entornos de servidor.
- Cabe en GPU consumer: sí, en la mayoría de GPU consumer modernas con 6 GB o más de VRAM; con cuantización a 8 bits o 4 bits cabría en GPUs con 4 GB o menos, aunque el autor no documenta cuantizaciones.
- Opciones de despliegue: el autor cita vLLM 0.32.0 para su evaluación; al ser un transformer estándar en safetensors, debería poder cargarse con transformers, TGI o llama.cpp tras conversión a GGUF, aunque estas opciones no están verificadas en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-math-edit-opus-5.5-50-passes | 752.393.024 | no disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | Edición de pesos, sin entrenamiento |
| Qwen3.5-0.8B (base) | no disponible | no disponible | no disponible en la información | Hugging Face (Qwen/Qwen3.5-0.8B) | Modelo original sin editar |
| Otros modelos ~0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los únicos datos son los del modelo base sin editar reportados por el propio autor.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden únicamente de la evaluación del autor, con 2 o 4 muestras por problema y un protocolo propio (think35); no hay replicación independiente.
- La edición anula tres cabezas de atención y duplica una neurona MLP; no se documenta el impacto en capacidades distintas de matemáticas e IFEval, ni posibles regresiones en otras tareas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es muy escueta: no hay información sobre sesgos, alucinación, idiomas o contexto.
- No se especifican los idiomas soportados; el tag `qwen3_5_text` sugiere solo texto, pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-0.8B conviene verificar las condiciones del modelo base.
- Técnica experimental: la edición de pesos guiada por un LLM no es un método consolidado; los resultados deben tratarse como preliminares hasta que haya validación externa.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita el despliegue en entornos con llama.cpp u Ollama sin conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/mtkhajavi/Qwen3.5-0.8B-math-edit-opus-5.5-50-passes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del experimento: https://github.com/MatinKhajavi/Weight-Space-Programming (ruta `runs/claude-opus-5-5/exp8/p50c`)
- Artículo de referencia: https://rikiyat.github.io/blog/weight-space-programming/
