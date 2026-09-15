# gpjt/jax-with-mha-bias-fineweb-edu

## Resumen

gpjt/jax-with-mha-bias-fineweb-edu es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero por Giles Thomas (gpjt) a partir de la implementacion de referencia del libro "Build a Large Language Model (from Scratch)" de Sebastian Raschka. Se trata de un modelo base (no instruido, sin RLHF ni DPO) de 163.009.536 parametros segun la model card, con una ventana de contexto de 1.024 tokens, 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion multi-cabeza. Su relevancia es eminentemente educativa y experimental: sirve para reproducir el proceso completo de preentrenamiento, entender el efecto de la calidad del dataset y disponer de un punto de partida pequeno y barato para fine-tuning.

La peculiaridad tecnica principal es que el entrenamiento se realizo en JAX mediante una reimplementacion de caja negra del codigo original en PyTorch de Raschka, pero los pesos se han convertido de vuelta a un formato compatible con PyTorch para que puedan cargarse con la libreria transformers. El resultado es un checkpoint en safetensors que se ejecuta en PyTorch, requiere `trust_remote_code=True` y expone las clases `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`.

A diferencia de otros modelos del mismo autor, este se entreno sobre FineWeb-Edu (la variante filtrada por criterios educativos de FineWeb) en lugar de sobre FineWeb sin filtrar, usando una version propia de la muestra de 10B tokens tokenizada con el tokenizer de GPT-2. El propio autor advierte de que el modelo es "a la vez torpe e ignorante" y lo situa como una herramienta de aprendizaje, no como un modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (decoder-only, MHA, sin weight tying) |
| Parametros totales | 175.592.448 (segun safetensors); la model card declara 163.009.536 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (dataset en ingles: FineWeb-Edu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Capas | 12 |
| Cabezas de atencion (MHA) | 12 |
| Sesgo en QKV | no (QKV bias: False) |
| Weight tying | no |
| Tokenizer | GPT-2 (heredado del dataset gpjt/fineweb-edu-gpt2-tokens) |
| Libreria | transformers (custom_code) |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de estilo GPT-2, definido por 12 bloques con atencion multi-cabeza de 12 cabezas sobre un espacio de 768 dimensiones, feed-forward intermedio y normalizacion pre-LN, siguiendo la implementacion didactica de Raschka. La diferencia concreta respecto a otros modelos del mismo autor es que este no usa weight tying entre el embedding de entrada y la cabeza de salida (`lm_head`), y que no aplica sesgo a las proyecciones Q, K y V (`QKV bias: False`). La ventana de contexto esta fijada en 1.024 tokens, coherente con el GPT-2 original y con el tokenizer empleado.

El entrenamiento se ejecuto en JAX (reimplementacion del codigo PyTorch original) sobre una maquina local con una unica RTX 3090. El presupuesto de computo sigue la regla de Chinchilla: 3.260.190.720 tokens, aproximadamente 20 veces el numero de parametros, redondeado al ultimo batch completo. El dataset es gpjt/fineweb-edu-gpt2-tokens, una version propia tokenizada con GPT-2 de la muestra de 10B tokens de FineWeb-Edu. Los hiperparametros documentados son: tamano de micro-batch 6, batch global 96, dropout 0,0, gradient clipping 3,5, learning rate 0,0014 con schedule, weight decay 0,01. No se documenta ninguna fase de ajuste por instrucciones, RLHF, DPO ni decodificacion especulativa; es estrictamente un modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles, con el estilo y las limitaciones de un GPT-2 small de 2020: completado de frases, continuacion de parrafos y generacion libre.
- Modelo base (no chat): no sigue instrucciones ni mantiene un rol de asistente de forma fiable sin fine-tuning especifico.
- Capacidad multilingue: no documentada; el dataset de entrenamiento es FineWeb-Edu, predominantemente en ingles.
- Razonamiento, matematicas y codigo: capacidad limitada y no medida; un modelo de 163M parametros entrenado con 3,26B tokens no alcanza el nivel de modelos especializados.
- Tool calling / function calling: no soportado de forma nativa ni entrenado para ello.
- Uso como agente o razonamiento multi-paso: no soportado de forma nativa; requeriria orquestacion externa y fine-tuning.
- Fine-tuning sobre tareas concretas: soportado mediante transformers con `trust_remote_code=True`; el autor publica un notebook de ejemplo.
- Capacidades especiales (vision, audio, thinking mode): ninguna.

## Casos de uso

- Reproduccion y aprendizaje del pipeline de preentrenamiento: el modelo permite estudiar de principio a fin como se entrena un LLM desde cero (tokenizacion, dataset, batch sizes, learning rate schedule) partiendo de un checkpoint ya entrenado y de los repositorios publicados.
- Base para experimentos de fine-tuning de bajo coste: con 163M parametros, un ajuste por instrucciones o por clasificacion de texto cabe en una sola GPU de consumo; se puede partir de estos pesos y comparar contra el GPT-2 small oficial.
- Estudio comparativo de calidad de datos: el autor entrena variantes sobre FineWeb y FineWeb-Edu; este checkpoint sirve de punto de comparacion para medir el efecto de filtrar por contenido educativo en un mismo presupuesto de tokens.
- Generacion de texto creativo a pequena escala: continuacion de fragmentos, generacion de nombres o parrafos breves en ingles, siempre con revision humana y asumiendo baja coherencia en textos largos.
- Docencia y talleres de NLP: modelo ligero para explicar en clase atencion multi-cabeza, embeddings, decodificacion por muestreo (`temperature`, `top_k`) y el coste real de entrenar un transformer.
- Prototipado rapido sin infraestructura: al ocupar menos de 1 GB en fp32 y unos 350 MB en fp16, permite iterar en portatiles, CPUs y GPUs integradas, algo inviable con modelos de miles de millones de parametros.
- Investigacion sobre deteccion de texto generado: disponer de un modelo base pequeno y controlado facilita generar corpus sinteticos etiquetados para entrenar clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~702 MB en fp32 (175.592.448 parametros), ~351 MB en fp16/bf16, ~176 MB en int8 y ~88 MB en int4 (estas dos ultimas requieren cuantizacion externa, no oficial).
- Coste adicional de la cache KV: con contexto completo de 1.024 tokens, 12 capas y 768 dimensiones, aproximadamente 38 MB en fp16 (2 x 12 x 1024 x 768 x 2 bytes).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3050, RTX 4090, T4, A100, H100). El entrenamiento original se hizo en una RTX 3090.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU, iGPU y placas tipo Raspberry Pi para inferencia en fp32/fp16 con baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline("text-generation", ...)` y `trust_remote_code=True` (via recomendada por el autor); PyTorch nativo; vLLM y TGI son posibles en teoria, pero el uso de `custom_code` puede requerir adaptaciones; llama.cpp/Ollama exigirian convertir manualmente los pesos a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput: no hay datos publicados. Por tamano, es un modelo apto para inferencia interactiva incluso en CPU, pero no se dispone de mediciones oficiales de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| gpjt/jax-with-mha-bias-fineweb-edu | 163M (card) / 175,6M (safetensors) | 1.024 | Apache 2.0 | HuggingFace, `custom_code` | no disponible |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | HuggingFace, transformers nativo | no disponible en la informacion proporcionada |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Apache 2.0 | HuggingFace, transformers nativo | no disponible en la informacion proporcionada |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | HuggingFace, transformers nativo | no disponible en la informacion proporcionada |

La comparativa se limita a parametros, contexto, licencia y facilidad de despliegue: en la informacion disponible no hay resultados de benchmarks de este modelo ni de los alternativos, por lo que no es posible comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo es "torpe e ignorante": 163M parametros y 3,26B tokens de entrenamiento implican un conocimiento factual muy limitado y una coherencia fragil mas alla de unos pocos cientos de tokens.
- Riesgo alto de alucinacion y de texto incoherente en generaciones largas; no debe usarse para responder preguntas factuales sin verificacion.
- No es un modelo de chat: no esta ajustado por instrucciones ni por preferencias humanas, por lo que no cabe esperar un comportamiento de asistente.
- Cobertura idiomatica limitada en la practica al ingles (FineWeb-Edu), aunque la model card no declara idiomas oficialmente.
- Ventana de contexto de solo 1.024 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o resumenes de gran volumen.
- Sesgos: al entrenarse sobre texto web filtrado por criterio educativo, heredara los sesgos presentes en FineWeb-Edu; no se ha publicado ninguna evaluacion de sesgos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo se distribuye con `custom_code`, lo que obliga a `trust_remote_code=True` y a auditar el codigo remoto antes de ejecutarlo en entornos de produccion.
- Descargas y likes nulos en el momento de la consulta: no hay comunidad ni soporte documentado mas alla de los repositorios del autor.
- No existe version cuantizada oficial (GGUF, AWQ, GPTQ), por lo que cualquier despliegue optimizado requiere conversion propia.
- Discrepancia entre el recuento de parametros de la model card (163.009.536) y el de los safetensors (175.592.448); conviene verificar el recuento efectivo antes de calcular presupuestos de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/jax-with-mha-bias-fineweb-edu
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-edu-gpt2-tokens
- Dataset base FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Codigo de entrenamiento en JAX: https://github.com/gpjt/jax-gpt2-from-scratch
- Codigo de ejecucion del modelo: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Entrada de blog sobre calidad de datos: https://www.gilesthomas.com/2026/09/why-do-openai-gpt2-weights-beat-mine-5-data-quality
- Entrada de blog sobre LLM-as-a-judge: https://www.gilesthomas.com/2026/01/llm-from-scratch-30-digging-into-llm-as-a-judge
- Libro "Build a Large Language Model (from Scratch)": https://www.manning.com/books/build-a-large-language-model-from-scratch
- Perfil del autor: https://huggingface.co/gpjt

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre detectores de contenido generado por ChatGPT y no guardan relacion con la ficha.
