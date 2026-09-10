# fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed455` es un ajuste fino (fine-tuning) del modelo monolingue `goldfish-models/eng_latn_100mb`, publicado por el usuario fpadovani y entrenado con la libreria TRL de Hugging Face mediante supervision fine-tuning (SFT). Cuenta con 86.508.288 parametros totales, un tamano de repositorio de 1,4 GB y esta disenado para generacion de texto con la libreria `transformers`.

Se trata de un artefacto de investigacion mas que de un modelo de proposito general: el nombre del identificador combina terminos como `zipf` y `newlex` con el sufijo de idioma `jpn`, y el entrenamiento esta vinculado a un proyecto de Weights & Biases bajo el nombre `white_cotterell` en la Universidad de Groningen, lo que apunta a un experimento academico sobre distribuciones lexicas o presion de vocabulario. El modelo base sobre el que se construye es un modelo monolingue en ingles (`eng_latn`) entrenado con aproximadamente 100 MB de texto.

Su relevancia actual es limitada fuera del contexto de investigacion: no tiene descargas ni interacciones registradas, la licencia no esta especificada de forma efectiva y no se han publicado resultados de benchmarks. Resulta util como referencia reproducible de un pipeline SFT con TRL sobre un modelo pequeno de la familia GPT-2, y como punto de partida para replicar o auditar el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 suele operar con 1.024 tokens, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repositorio contiene pesos en safetensors) |
| Idiomas soportados | no disponible en la model card; el modelo base es `eng_latn` (ingles) y el identificador incluye el sufijo `jpn` |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`, sin texto de licencia real) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Libreria de inferencia | transformers; etiquetas `text-generation-inference` y `endpoints_compatible` |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con 86.508.288 parametros, es decir, un modelo pequeno dentro de la escala actual. No se documenta ninguna innovacion estructural (no hay atencion lineal, SSM ni mezcla de expertos); se trata de la pila clasica de GPT-2 reutilizada por la familia Goldfish, que entrena modelos monolingues de ~100 MB de texto por idioma. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 1,4 GB, un volumen considerablemente mayor que el de los pesos en precision simple (unos 346 MB en FP32), lo que sugiere la presencia de checkpoints adicionales o estados de optimizador.

El entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, usando supervision fine-tuning (SFT) y partiendo de `goldfish-models/eng_latn_100mb`. La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO; solo enlaza la ejecucion de Weights & Biases del proyecto `white_cotterell`. El sufijo `seed455` indica que el experimento se replico con una semilla concreta, y la combinacion `zipf-newlex-jpn` sugiere una variacion controlada del lexico de entrenamiento, aunque no hay documentacion publica que lo confirme.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2 y del ajuste SFT.
- Razonamiento y conocimiento factual muy limitados por el reducido numero de parametros (86,5 M) y por el entrenamiento sobre un corpus pequeno (~100 MB en el modelo base).
- Generacion de codigo y matematicas: no documentada, previsiblemente muy limitada por el tamano.
- Tool calling / function calling: no disponible; no se menciona soporte en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento especifico para agentes.
- Capacidades multilingues: no documentadas; el modelo base es `eng_latn`, mientras que el identificador del fine-tuning incorpora `jpn`, sin aclaracion sobre el idioma efectivo de los datos de ajuste.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponibles.
- Uso con la API `pipeline` de Transformers con formato de mensajes tipo chat (`{"role": "user", "content": ...}`), segun el ejemplo de la model card.

## Casos de uso

- Reproducibilidad de investigacion: el modelo sirve para replicar el experimento de ajuste SFT con TRL sobre un modelo Goldfish concreto, incluyendo la semilla `seed455` y la ejecucion registrada en Weights & Biases.
- Estudios de distribucion lexica: dado el nombre `zipf-newlex`, puede emplearse como sujeto de analisis en trabajos sobre ajuste a la ley de Zipf y ampliacion de vocabulario en modelos pequenos.
- Evaluacion comparativa de modelos reducidos: util como linea base de ~86 M de parametros en experimentos academicos de eficiencia o de escalado, siempre que se documenten sus condiciones de entrenamiento.
- Docencia y practicas de fine-tuning: su tamano permite ejecutar el ciclo completo de entrenamiento e inferencia en una unica GPU de consumo, lo que lo hace adecuado para cursos de NLP.
- Pruebas de integracion de pipelines: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten usarlo como modelo de prueba para validar despliegues de TGI o endpoints compatibles antes de migrar a modelos mayores.
- Generacion de texto controlada en entornos de bajo consumo: puede desplegarse en CPU o en GPU integrada para tareas de generacion corta donde la calidad no sea critica y prime el coste minimo.
- Comparacion de tecnicas de ajuste: sirve para medir el efecto de SFT con TRL frente al modelo base `eng_latn_100mb` en tareas controladas de continuacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente enlaza la ejecucion de entrenamiento en Weights & Biases; no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, perplejidad ni similares) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en FP32, unos 175 MB en FP16/BF16 y del orden de 90 MB en cuantizacion de 8 bits, calculado a partir de los 86,5 M de parametros (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; el modelo tambien funciona en CPU. Una RTX 4090, A100 o H100 estan sobredimensionadas para este tamano y no aportan ventaja significativa.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` (soporte oficial, con ejemplo de `pipeline` en la model card), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). Ollama o llama.cpp requeririan una conversion previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.
- Nota sobre el repositorio: los 1,4 GB de peso del repo exceden con creces el tamano de los pesos en precision simple, por lo que conviene verificar que ficheros se descargan antes de desplegar en entornos con almacenamiento limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed455 | 86.508.288 | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste SFT de investigacion sobre Goldfish |
| goldfish-models/eng_latn_100mb | no disponible | no disponible | no disponible | Hugging Face | Modelo base; corpus de ~100 MB en ingles (dato inferido del nombre) |
| GPT-2 small (openai-community/gpt2) | 124 millones | 1.024 tokens | MIT | Hugging Face, ampliamente utilizado | Referencia clasica de la misma familia arquitectonica |
| DistilGPT-2 (distilbert/distilgpt2) | 82 millones | 1.024 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado | Alternativa destilada con funciones de generacion y menor latencia |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los sesgos del modelo base `eng_latn_100mb` y del corpus de ajuste se heredan sin filtrado declarado.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido numero de parametros y el corpus de entrenamiento limitado a ~100 MB en el modelo base.
- Limitaciones de contexto: la longitud de contexto no esta especificada; si se mantiene la configuracion tipica de GPT-2, estaria en torno a 1.024 tokens, insuficiente para tareas de contexto largo.
- Limitaciones de idioma: la model card no declara idiomas soportados. El modelo base es en ingles y el identificador incluye `jpn`, pero no hay confirmacion de que el ajuste proporcione competencia real en japones ni en ningun otro idioma.
- Restricciones de licencia: la licencia no esta especificada (la model card contiene el marcador `licence: license`), por lo que no se puede asumir permiso para uso comercial ni redistribucion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Caveat de produccion: el modelo no tiene descargas ni validacion externa; no se han publicado evaluaciones independientes ni metricas de calidad.
- Caveat de reproducibilidad: el dataset de SFT no esta documentado, lo que impide auditar la composicion de los datos ni reproducir el entrenamiento con exactitud.
- Caveat de uso: esta orientado a experimentacion academica; no se recomienda su integracion en sistemas de atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion donde la precision sea critica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/t24r2kvr
- Cita de TRL (BibTeX incluida en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020, GitHub.
