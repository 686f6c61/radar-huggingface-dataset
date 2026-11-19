# maf1oz1/llm-course-hw3-lora

## Resumen

`maf1oz1/llm-course-hw3-lora` es un adaptador LoRA publicado en Hugging Face sobre el modelo base `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder-only de 300 millones de parametros. Lo desarrolla el usuario `maf1oz1` como trabajo de un curso sobre modelos de lenguaje, y su unico proposito es la clasificacion de sentimiento de tuits en tres clases (`negative`, `neutral`, `positive`) sobre el dataset `cardiffnlp/tweet_eval`. No es un modelo de proposito general: es un fine-tuning supervisado de una tarea concreta.

El interes tecnico del artefacto es limitado pero didactico. El autor implementa LoRA desde cero en PyTorch, sin usar la libreria `peft`, con una correccion de bajo rango del tipo `scaling · x @ A @ B` aplicada unicamente a las proyecciones `k_proj` y `v_proj`. El adaptador supone solo 430.080 parametros entrenables (0,14 % del total) y se entrena durante una epoca sobre los 45.615 tuits del split de entrenamiento. El resultado es una mejora sustancial del macro F1 en la tarea: de 0,15 en el modelo base a 0,52 con la metrica del enunciado (cuatro clases, incluyendo una clase vacia de fallback) y 0,69 en la metrica real de tres clases.

Es relevante ahora como referencia practica de PEFT aplicado a modelos pequenos en ingles y como ejemplo de las trampas de evaluacion en clasificacion generativa: la definicion de la metrica (con clase vacia incluida) infla o deprime artificialmente el resultado segun como se calcule. Para produccion real de analisis de sentimiento en ingles, sin embargo, existen alternativas mucho mas eficientes y con mejor rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Lite-Oute-1-300M-Instruct) con adaptador LoRA en `k_proj` y `v_proj` |
| Parametros totales | 300.031.872 (modelo base); 430.080 parametros entrenables en el adaptador (0,14 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, state dict completo con capas LoRA integradas) |
| Libreria | peft (tag), aunque la implementacion del adaptador es manual en PyTorch |
| Rango / alpha LoRA | r = 8 / alpha = 16 |
| Dataset de entrenamiento | `cardiffnlp/tweet_eval` (split `sentiment`), 45.615 tuits |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 300 millones de parametros orientado a instrucciones y conversacion. Sobre el se aplica un adaptador LoRA implementado desde cero en PyTorch, sin la libreria `peft`: la correccion de bajo rango se formula como `scaling · x @ A @ B`, con `A` inicializada con distribucion normal, `B` a ceros (de modo que el adaptador arranca como identidad) y `scaling = alpha / r`. Los modulos objetivo son exclusivamente `k_proj` y `v_proj`, lo que limita el coste computacional y el numero de parametros entrenables a 430.080.

El entrenamiento usa una sola epoca sobre los 45.615 tuits del split de entrenamiento, con batch size 16, learning rate 5e-4 y optimizador AdamW. La perdida se calcula solo sobre la respuesta del modelo (el prompt del sistema y el tuit de entrada se enmascaran con `-100`), lo que ensena al modelo a emitir unicamente la etiqueta. El formato de tarea es generativo: el modelo recibe un system prompt con la descripcion de la tarea y el tuit, y debe responder con una sola palabra correspondiente a la clase. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion de sentimiento de texto corto en ingles en tres clases: `negative`, `neutral`, `positive`.
- Generacion de texto condicionada por un system prompt de tarea, heredada del modelo base instruct.
- Respuesta en formato de etiqueta unica (una palabra), disenada para facilitar el parseo en pipelines.
- Capacidad conversacional basica heredada del modelo base (no es el foco del adaptador).
- No soporta tool calling ni function calling de forma nativa y documentada.
- No soporta agentes ni razonamiento multi-paso de forma fiable a este tamano.
- No soporta vision, audio ni modo thinking.
- Multilingue: solo ingles (tag `en`); el dataset de entrenamiento es en ingles.

## Casos de uso

- Clasificacion de sentimiento en redes sociales en ingles: el modelo recibe un tuit y devuelve una etiqueta de tres clases; adecuado para prototipos de monitorizacion de marca o analisis de opinion en lotes pequenos, dado el bajo coste del adaptador.
- Etiquetado de datasets de sentimiento: puede usarse como pre-etiquetador para acelerar el trabajo humano en corpus de tuits, con revision posterior dado el macro F1 de 0,69.
- Filtrado de comentarios en foros o comunidades en ingles: clasificar mensajes negativos para moderacion asistida, aprovechando que el modelo devuelve una etiqueta limpia y parseable.
- Docencia y reproduccion de PEFT: el repositorio sirve como ejemplo completo de implementacion manual de LoRA, con hiperparametros, datos y resultados documentados, util para cursos de LLM.
- Baseline de comparacion: referencia para medir el impacto de tecnicas PEFT frente a fine-tuning completo o frente a clasificadores dedicados (por ejemplo, modelos tipo BERT) en tareas de sentimiento.
- Analisis de opinion en encuestas abiertas: procesar respuestas cortas en ingles y agregar por polaridad, siempre que el volumen no exija throughput alto y se tolere el ruido del clasificador.
- Investigacion sobre evaluacion generativa: caso de estudio de como la definicion de la metrica (clase vacia incluida) altera el resultado reportado, util para disenar evaluaciones mas robustas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test de `cardiffnlp/tweet_eval` (`sentiment`, 12.284 tuits):

| Metrica | Modelo base | Tras LoRA |
|---|---|---|
| Macro F1 (metrica del enunciado, 4 clases con clase vacia `""`) | 0,15 | 0,52 |
| Macro F1 (3 clases reales) | no disponible | 0,69 |
| F1 clase `negative` | no disponible | 0,73 |
| F1 clase `neutral` | no disponible | 0,68 |
| F1 clase `positive` | no disponible | 0,68 |

Nota: la metrica del enunciado incluye una cuarta clase vacia para respuestas de las que no se puede extraer etiqueta; como esa clase no tiene ejemplos reales, su F1 es siempre 0 y el maximo alcanzable de la metrica es 0,75. El macro F1 de tres clases es la medida mas informativa del rendimiento real.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los pesos del modelo base (300 M parametros) mas el adaptador (menos de 1 MB), y overhead de activaciones y cache KV segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,3-0,4 GB; en 4 bits, por debajo de 0,3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (requiere reintegrar los adaptadores con la funcion `apply_peft_to_module` del notebook del autor antes de cargar el state dict); tambien es viable exportar a GGUF y usar llama.cpp u Ollama, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maf1oz1/llm-course-hw3-lora` | 300 M (base) + 0,43 M (LoRA) | no disponible | Sentimiento 3 clases en ingles | no disponible | Hugging Face |
| `OuteAI/Lite-Oute-1-300M-Instruct` (base) | 300 M | no disponible | Instrucciones generales en ingles | no disponible | Hugging Face |
| Clasificadores tipo `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 tokens | Sentimiento en tuits | generalmente abierta (verificar) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | Sentimiento binario en ingles | Apache 2.0 | Hugging Face |

La comparacion con clasificadores encoder dedicados es la mas relevante: para sentimiento en ingles, un modelo tipo RoBERTa o DistilBERT fine-tuneado suele ofrecer mejor F1, latencia mucho menor y mayor madurez de despliegue que un decoder de 300 M usado de forma generativa. El valor de este artefacto es didactico, no competitivo en rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; verificar con el autor antes de cualquier despliegue en produccion.
- El modelo base es de 300 M de parametros: capacidad de razonamiento y generalizacion limitada, con riesgo alto de alucinacion fuera de la tarea de clasificacion.
- Entrenado solo con tuits en ingles; el rendimiento en otros dominios (resenas, correos, texto formal) o en otros idiomas no esta garantizado.
- Sesgos heredados del modelo base y del dataset `tweet_eval`, que no es una muestra representativa de la poblacion general.
- El macro F1 de tres clases es 0,69: aproximadamente un 31 % de error agregado; no es adecuado para decisiones automatizadas de alto riesgo sin revision humana.
- La evaluacion reportada incluye una metrica con clase vacia que puede confundir; usar el macro F1 de tres clases para comparaciones.
- El repositorio contiene el state dict completo con capas LoRA integradas, no un adaptador PEFT estandar; la carga requiere reintegrar manualmente los modulos con la funcion del notebook del autor, lo que complica la integracion con herramientas estandar.
- No hay informacion sobre la longitud de contexto del modelo base; asumir contextos cortos y validar con textos largos.
- Sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad ni casos de uso reportados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maf1oz1/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Paper de tweet_eval (Barbieri et al.): https://arxiv.org/abs/2010.12421
- Paper de LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
