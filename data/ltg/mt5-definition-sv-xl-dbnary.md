# ltg/mt5-definition-sv-xl-dbnary

## Resumen

ltg/mt5-definition-sv-xl-dbnary es un adaptador LoRA sobre google/mt5-xl afinado para una tarea muy concreta: generar definiciones de palabras en sueco a partir de un ejemplo de uso en contexto. Lo desarrolla el grupo LTG (Language Technology Group) y se publica como adaptador PEFT, no como modelo completo, de modo que hereda la arquitectura y los pesos base de mT5-XL y solo anade los pesos del adaptador.

El modelo resuelve el problema de la modelizacion de definiciones (definition modeling): dado un enunciado que contiene una palabra objetivo y una instruccion del tipo "Vad betyder <palabra>?", produce una glosa o definicion breve en sueco. Es relevante para tareas de lexicografia computacional, construccion de diccionarios y enriquecimiento de recursos lexicos, donde se necesita generar definiciones coherentes con el uso real de la palabra en un corpus.

Al estar construido sobre mT5-XL (aproximadamente 3.700 millones de parametros en el modelo base) y publicarse como adaptador de 4,6 GB en el repositorio, el modelo es pesado para inferencia en produccion pero reutiliza toda la infraestructura de transformers para modelos seq2seq. La licencia es CC BY-SA 4.0 y el unico idioma declarado es el sueco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5) con adaptador LoRA |
| Parametros totales | no disponible (el modelo base google/mt5-xl tiene aproximadamente 3.700 millones; el adaptador LoRA anade un numero no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card trunca la entrada a 300 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | sueco (sv) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es google/mt5-xl, un transformer encoder-decoder de la familia T5 con vocabulario multilingue compartido (SentencePiece) y aproximadamente 3.700 millones de parametros. Sobre el se aplica un adaptador LoRA (PEFT 0.19.1 segun la model card), que congela los pesos base y entrena matrices de baja dimension en las capas seleccionadas. El repositorio ocupa 4,6 GB, coherente con un adaptador de rango relativamente alto o con artefactos auxiliares del entrenamiento.

El ajuste fino se realizo sobre el dataset Dbnary-sv (FrancescoPeriti/Dbnary-sv), compuesto por ejemplos de uso y definiciones en sueco extraidos de Dbnary, un recurso lexicografico derivado de Wiktionary. La tarea es de generacion condicionada: la entrada combina el ejemplo de uso y la pregunta ". Vad betyder <palabra>?", y la salida es la definicion. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; por la naturaleza de la tarea (seq2seq supervisado) lo mas probable es un entrenamiento puramente supervisado, pero no se confirma en la model card.

## Capacidades

- Generacion de definiciones de palabras en sueco condicionadas por un ejemplo de uso en contexto.
- Modelizacion de definiciones (definition modeling) como tarea especifica, no generacion de texto general.
- Entrada seq2seq con instruccion en sueco del tipo "Vad betyder <palabra>?".
- Control de la generacion mediante bad_words_ids para evitar que el modelo repita la palabra objetivo en la definicion.
- Decodificacion determinista con num_beams=1 y do_sample=False en el ejemplo oficial.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al sueco segun la metadata, aunque el modelo base mT5 sea multilingue.

## Casos de uso

- Lexicografia asistida: generar borradores de definiciones para nuevas entradas de un diccionario sueco a partir de ejemplos de uso reales extraidos de corpus, reduciendo el trabajo manual de redaccion.
- Enriquecimiento de Wiktionary y Dbnary: producir glosas adicionales para palabras o acepciones que carecen de definicion, usando el contexto de una frase de ejemplo como entrada.
- Construccion de recursos lexicos para PNL en sueco: crear un diccionario maquina-legible con definiciones contextualizadas que alimente tareas posteriores de desambiguacion lexica o etiquetado semantico.
- Evaluacion de sistemas de definition modeling: servir como referencia o linea base afinada para comparar metodos de generacion de definiciones en sueco dentro de un entorno de investigacion.
- Apoyo a la ensenanza de lengua sueca: generar explicaciones breves del significado de una palabra tal como aparece en una frase concreta, util en herramientas de aprendizaje de vocabulario en contexto.
- Preprocesado para sistemas de traduccion o simplificacion: obtener una glosa en sueco de una palabra ambigua antes de pasarla a otro modulo, aprovechando que la definicion se condiciona al ejemplo de uso.
- Investigacion en adaptadores PEFT: reutilizar el adaptador como ejemplo de ajuste fino de mT5-XL para tareas lexicograficas y estudiar el coste/beneficio de LoRA frente al ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA debe combinarse con los pesos completos de google/mt5-xl para la inferencia; el repositorio de 4,6 GB no basta por si solo.
- VRAM estimada para inferencia en precision completa (fp32) del modelo base: del orden de 15 GB o mas, sin contar activaciones; en bf16/fp16 se reduce aproximadamente a la mitad.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia comoda en precision mixta; RTX 4090 (24 GB) puede ser suficiente en bf16 para lotes pequenos.
- En GPU de consumo: posible en RTX 3090/4090 con precision reducida; en tarjetas de 16 GB o menos requeriria cuantizacion o descarga parcial de capas, no documentada en la model card.
- Opciones de despliegue: transformers con PEFT (ruta oficial del ejemplo), vLLM o TGI si se fusiona el adaptador con el modelo base y se convierte a un formato compatible; llama.cpp/Ollama no estan documentados para este adaptador.
- Latencia y throughput: no disponibles; el ejemplo oficial usa generacion con un solo beam y max_new_tokens=60, lo que sugiere un uso orientado a baja latencia por peticion mas que a alto throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| ltg/mt5-definition-sv-xl-dbnary | base ~3.700 M + LoRA | no disponible | sueco | CC BY-SA 4.0 | safetensors (PEFT) |
| google/mt5-xl | ~3.700 M | no disponible | multilingue | Apache 2.0 | safetensors |
| google/mt5-base | ~580 M | no disponible | multilingue | Apache 2.0 | safetensors |
| ltg/mt5-definition-sv-base-dbnary (si existe) | no disponible | no disponible | sueco | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparacion se limita a parametros, licencia y formato; para tareas de definition modeling en sueco no hay cifras publicadas en esta ficha.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general; fuera de la tarea de generar definiciones en sueco su comportamiento no esta garantizado.
- Riesgo de alucinacion: puede producir definiciones plausibles pero incorrectas, especialmente con palabras polisemicas o ejemplos de uso ambiguos; requiere revision humana en contextos lexicograficos.
- Dependencia del ejemplo de uso: la calidad de la definicion depende de que el enunciado de entrada refleje el sentido objetivo; ejemplos atipicos pueden sesgar la salida.
- Sesgos: al entrenarse sobre Dbnary, hereda los sesgos y la cobertura desigual de Wiktionary (sobrerrepresentacion de ciertos dominios y registros, infrarepresentacion de terminologia especializada o variantes dialectales).
- Idioma: solo sueco declarado; no se garantiza un comportamiento correcto en otras lenguas aunque el modelo base sea multilingue.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para productos propietarios.
- Requisitos de despliegue: necesita cargar el modelo base mT5-XL ademas del adaptador, lo que implica un coste de memoria y almacenamiento considerable.
- Documentacion escasa: la model card no detalla hiperparametros de entrenamiento, datos exactos ni evaluacion, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ltg/mt5-definition-sv-xl-dbnary
- Modelo base: https://huggingface.co/google/mt5-xl
- Dataset de entrenamiento: https://huggingface.co/datasets/FrancescoPeriti/Dbnary-sv
