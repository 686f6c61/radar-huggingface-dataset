# Kausp11/querylm-dclm-400m

## Resumen

QueryLM 400M (DCLM-Edu) es un modelo de lenguaje base de tipo decoder-only, desarrollado por el usuario Kausp11 y publicado en Hugging Face, entrenado desde cero sobre texto web del corpus DCLM-Edu con una particularidad: durante el preentrenamiento se insertaron bloques de busqueda en aquellos puntos del texto donde una consulta externa ayudaria a predecir lo siguiente. El modelo aprende, por tanto, a formular consultas y a utilizar pasajes recuperados, aunque nunca genera los pasajes: los aporta el llamador mediante su propio recuperador.

La arquitectura sigue el estilo nanochat: 14 capas, anchura de 1.280, 10 cabezas de atencion, feed-forward de 5.120 y una longitud de contexto de 4.095 tokens. El autor reporta 401,2 millones de parametros, aunque el fichero de pesos almacena 842,2 millones al incluir los embeddings de valor (value embeddings). El vocabulario es el del tokenizador SmolLM2 ampliado con cuatro tokens especiales para los bloques de busqueda, hasta 49.156 entradas.

El interes del modelo es fundamentalmente de investigacion: se trata de un artefacto para estudiar como un modelo puede aprender a buscar durante el preentrenamiento, no un modelo listo para produccion. Solo esta disponible la version base (sin formato de chat); existe una version afinada con SFT para busqueda, pero no se ha publicado aun la linea base estandar equiparable en computo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (14 capas, width 1.280, 10 cabezas, FFN 5.120, head dim 128) |
| Parametros totales | 401,2 M reportados por el autor; 842.220.414 almacenados en safetensors (incluye value embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; incluye `modeling_nanochat.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, configuracion de 14 capas, dimension de modelo 1.280, 10 cabezas de atencion con dimension de cabeza 128 y capa feed-forward de 5.120. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales: `<WEB_QUERY>` (id 49152), `</WEB_QUERY>` (49153), `<WEB_RESPONSE>` (49154) y `</WEB_RESPONSE>` (49155), lo que da un vocabulario de 49.156 entradas. El esquema de entrenamiento inserta bloques del tipo `…texto<WEB_QUERY>consulta</WEB_QUERY> <WEB_RESPONSE>pasaje</WEB_RESPONSE> texto continúa…`; la funcion de perdida cubre el texto, la consulta y las etiquetas de consulta, pero no las etiquetas de respuesta ni el pasaje, de modo que el modelo aprende a escribir consultas y a condicionarse sobre pasajes, pero no a generarlos.

Los datos de preentrenamiento proceden de DCLM-Edu, anotado con bloques de busqueda por un modelo anotador (Gemma 4 E4B-it con un adaptador LoRA). El anotador marca posiciones donde una busqueda ayudaria (probabilidad de insercion de al menos 0,05 y separacion minima de 40 caracteres) y redacta consultas de hasta 24 tokens. Los pasajes se obtienen mediante recuperacion BM25 sobre el corpus web publico Sphere y se acortan con limpieza extractiva; una insercion solo se conserva si el pasaje solapa el texto posterior del documento (ROUGE-1 F1 de al menos 0,1 frente a los siguientes 260 caracteres). El optimizador es Muon para los pesos matriciales (LR maxima 0,02828) y AdamW para embeddings y cabeza de salida, con lotes de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualizacion), 40 pasos de calentamiento, programacion constante y decaimiento lineal hasta el 5 % del pico. El presupuesto total es de 10.100 actualizaciones, 10,6 mil millones de tokens procesados (6,8 mil millones de tokens de documento) y 3,09e19 FLOPs en bf16. El checkpoint corresponde a la ejecucion `dclm_nc_v1_d14_all_chin10k`, paso 10.100, ramificada en el paso 9.000 desde una ejecucion de 400M mas larga; se inicializo desde cero sobre el codigo nanochat (commit `92d63d4`).

## Capacidades

- Generacion de texto autoregresiva como modelo causal convencional, sin necesidad de usar la busqueda.
- Formulacion de consultas de busqueda: el modelo escribe la consulta entre `<WEB_QUERY>` y `</WEB_QUERY>` cuando se le induce con el token de apertura.
- Uso de pasajes recuperados: condiciona la continuacion sobre el contenido insertado entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>`.
- Aprendizaje few-shot mediante ejemplos en el prompt para fijar el formato pregunta-respuesta.
- Capacidad de responder sin busqueda si se prohibe el token `<WEB_QUERY>` mediante `bad_words_ids`.
- No dispone de tool calling generico, modo thinking, vision, audio ni capacidades de agente multi-paso documentadas.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre aprendizaje de busqueda durante el preentrenamiento: el modelo permite estudiar como un transformer pequeno aprende a decidir cuando consultar y como integrar el resultado, comparandolo con la linea base estandar (no publicada aun) para aislar el efecto de los bloques de busqueda.
- Experimentos de retrieval-augmented generation (RAG) controlados: al separar explicitamente la generacion de la consulta de la recuperacion, se puede evaluar la calidad de las consultas generadas con recuperadores propios (BM25, APIs web) sin que el modelo alucine pasajes.
- Prototipos de asistentes de preguntas factuales en ingles: el flujo de tres pasos (consulta, recuperacion, respuesta) encaja en tareas de QA sobre dominios acotados donde se dispone de un indice propio.
- Docencia y divulgacion sobre arquitecturas tipo nanochat: el repositorio incluye el codigo de modelado y un ejemplo ejecutable en CPU en bf16, lo que facilita su uso en entornos de aprendizaje.
- Evaluacion de recuperadores: el modelo sirve como banco de pruebas para medir si un retriever concreto aporta pasajes utiles, dado que el modelo fue entrenado para condicionarse sobre pasajes que solapan el texto siguiente.
- Generacion de consultas de busqueda como componente aislado: se puede usar unicamente el paso de escritura de consulta para alimentar un motor de busqueda externo en pipelines de enriquecimiento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: con 842,2 M parametros almacenados, en bf16 se requieren aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB. El ejemplo del autor se ejecuta en CPU en bf16.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para bf16; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura. Para lotes grandes o entrenamiento, se recomienda A100 o H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada, ya que el repositorio incluye `modeling_nanochat.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de codigo personalizado hace probable que requiera adaptaciones.
- Latencia y throughput: no disponibles. El unico dato practico es que el script de ejemplo se ejecuto en CPU con torch 2.8.0 y transformers 4.56.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QueryLM 400M (DCLM-Edu) | 401,2 M reportados (842,2 M almacenados) | 4.095 | no disponible | Hugging Face, requiere `trust_remote_code` | Entrenado con bloques de busqueda insertados; solo version base |
| SmolLM2-360M | 360 M | 8.192 (segun version) | Apache 2.0 | Amplia, integrado en transformers | Tokenizador base del que deriva QueryLM; sin capacidad de busqueda nativa |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Amplia, soporte en vLLM, llama.cpp, Ollama | Mayor contexto y ecosistema de despliegue maduro; sin busqueda nativa |
| Linea base estandar de QueryLM (mismo computo) | ~400 M | 4.095 | no disponible | No publicada | Referencia de control del autor para aislar el efecto de los bloques de busqueda |

La comparacion con SmolLM2-360M y Qwen2.5-0.5B es orientativa por tamano; no se dispone de datos de rendimiento de QueryLM para comparar metricas.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo describe explicitamente como material para estudiar modelos que aprenden a buscar durante el preentrenamiento, no como modelo para produccion.
- Solo version base: no incluye formato de chat ni instrucciones; requiere ejemplos few-shot en el prompt para fijar el formato.
- El modelo no genera pasajes: el llamador debe aportar el recuperador y el pasaje; la calidad de la respuesta depende por completo de la recuperacion externa.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado sobre texto web, puede producir respuestas incorrectas, especialmente cuando el pasaje recuperado no contiene la informacion.
- Contexto limitado a 4.095 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo ingles: la model card declara unicamente el idioma ingles.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- `trust_remote_code=True` ejecuta codigo del repositorio (`modeling_nanochat.py`); el autor recomienda fijar `revision=` a un commit revisado.
- Ecosistema de despliegue limitado: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que complica el servicio en produccion.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- La linea base estandar equiparable en computo no esta publicada, lo que limita la interpretacion de los resultados del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-400m
- Version SFT con busqueda: https://huggingface.co/Kausp11/querylm-dclm-400m-sft-search
- Dataset de preentrenamiento DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus web Sphere (recuperacion BM25): https://github.com/facebookresearch/Sphere
- Codigo nanochat (commit `92d63d4`): https://github.com/karpathy/nanochat
