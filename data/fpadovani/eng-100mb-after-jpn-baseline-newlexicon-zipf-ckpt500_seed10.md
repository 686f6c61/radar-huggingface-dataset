# fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed10

## Resumen

El modelo `fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed10` es un fine-tune experimental de un modelo GPT-2 pequeño (124 millones de parámetros) desarrollado por fpadovani, investigador afiliado a la Universidad de Groningen. Se trata de un checkpoint intermedio (paso 500) de un experimento de adquisición de lenguaje artificial: el modelo base fue entrenado con 100 MB de texto en japonés con un nuevo léxico y distribución zipfiana, y posteriormente se fine-tuneó con datos en inglés. El objetivo es estudiar la transferencia entre idiomas y el efecto del orden de entrenamiento en modelos de lenguaje pequeños.

Este modelo es relevante para la comunidad de investigación en lingüística computacional y aprendizaje de lenguas, ya que permite analizar cómo un modelo preentrenado en un idioma (japonés) se adapta a otro (inglés) con recursos limitados. Al ser un checkpoint intermedio, no está pensado para uso en producción, sino como herramienta de análisis en estudios controlados. Su arquitectura GPT-2 y su tamaño reducido lo hacen accesible para experimentos en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y japones (segun nombre del modelo, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con 12 capas, 12 cabezas de atencion y una dimension de embedding de 768, lo que da un total de 124 millones de parametros. Es un fine-tune del modelo `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed10`, que fue preentrenado con 100 MB de texto en japones utilizando un nuevo lexico artificial con distribucion zipfiana. El fine-tune se realizo con la libreria TRL (Transformer Reinforcement Learning) mediante entrenamiento supervisado (SFT), como se indica en la model card. No se proporcionan detalles sobre el dataset de fine-tune, el numero de tokens totales ni el uso de tecnicas como RLHF o DPO. El nombre del modelo sugiere que se trata de un experimento controlado para estudiar la transferencia de conocimiento entre idiomas, con un checkpoint guardado en el paso 500 de entrenamiento y una semilla fija (seed 10) para reproducibilidad.

## Capacidades

- Generacion de texto: el modelo puede producir texto en ingles (y posiblemente japones) de forma autoregresiva, aunque su capacidad es limitada por su tamano y el volumen reducido de datos de entrenamiento.
- Razonamiento y conocimiento general: muy limitado, al ser un modelo de 124M entrenado con solo 100 MB de datos, no posee conocimiento enciclopedico ni capacidad de razonamiento complejo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: el nombre indica que fue entrenado en japones y luego fine-tuneado en ingles, pero no hay confirmacion de que mantenga ambas lenguas de forma util.
- Capacidades especiales: ninguna documentada. No hay modo thinking, vision ni audio.

## Casos de uso

- Investigacion academica en transferencia linguistica: el modelo permite estudiar como un modelo preentrenado en japones se adapta al ingles, analizando la evolucion de la perplejidad y la calidad de las generaciones en funcion del checkpoint. Es adecuado por su tamano reducido y su diseño experimental controlado.
- Analisis de adquisicion de vocabulario: al usar un lexico artificial con distribucion zipfiana, se puede investigar como el modelo aprende y generaliza palabras de distinta frecuencia, comparando el comportamiento antes y despues del fine-tune.
- Estudio de la influencia del orden de idiomas: comparando este modelo con su contraparte `jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed10` (entrenado en orden inverso), se puede evaluar el efecto del orden de entrenamiento en el rendimiento final.
- Reproduccion de experimentos en aprendizaje de lenguas: al ser un checkpoint intermedio con semilla fija, sirve como punto de referencia para replicar resultados en entornos de investigacion.
- Desarrollo de tecnicas de fine-tune eficiente: su tamano permite probar metodos de adaptacion de idiomas con pocos recursos, sirviendo como banco de pruebas para algoritmos de SFT.
- Educacion en modelos de lenguaje: puede usarse en cursos de procesamiento de lenguaje natural para ilustrar conceptos de transferencia, overfitting y efectos de la distribucion de datos en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El modelo parece estar orientado exclusivamente a experimentos de investigacion, sin metricas publicas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 (124M parametros), menos de 1 GB en cuantizacion de 8 bits si se aplicara, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. Tambien puede ejecutarse en CPU con llama.cpp o transformers, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: transformers (pipeline de HuggingFace), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. El tag `endpoints_compatible` sugiere compatibilidad con soluciones de inferencia como FriendliAI.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 124M, se espera una latencia de decenas de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con otros modelos de la misma categoria. El modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed10` es su referencia directa, y existen variantes con diferentes semillas y ordenes de idiomas (por ejemplo, `eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed3407`). Como alternativa generica, se podria comparar con GPT-2 small original (124M, entrenado con 40 GB de texto), pero las diferencias en datos y proposito hacen que la comparacion no sea significativa. Por tanto, la comparativa se limita a los modelos del mismo autor y experimento.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para tareas reales. Su rendimiento en generacion de texto es pobre en comparacion con modelos comerciales o incluso con GPT-2 original.
- Sesgos y alucinaciones: al entrenarse con solo 100 MB de datos, el modelo puede generar texto incoherente, repetitivo o con informacion inventada. No se han documentado sesgos especificos, pero es probable que herede sesgos de los datos de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero por arquitectura GPT-2 suele ser de 1024 tokens. No se ha confirmado.
- Restricciones de licencia: la licencia no esta disponible, lo que impide su uso comercial sin autorizacion explicita del autor.
- Reproducibilidad: aunque se indica la semilla, no se publican los datasets ni los scripts de entrenamiento completos, lo que dificulta la replicacion exacta.
- Idiomas: aunque el nombre sugiere ingles y japones, no hay garantia de que el modelo mantenga capacidades bilingues utiles tras el fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed10
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/h1kw9x8t
- Variante con semilla 3407: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed3407
- Modelo inverso (japones despues de ingles): https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407
