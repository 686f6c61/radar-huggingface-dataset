# s-ryoma/plain-tulip

## Resumen

plain-tulip es un adaptador LoRA publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusion de texto de 8 mil millones de parametros desarrollado por el grupo GSAI (Gaoling School of Artificial Intelligence, Renmin University of China). El adaptador se distribuye como repositorio PEFT en formato safetensors con un tamano de 3,2 GB, lo que sugiere que contiene pesos de adaptador de rango relativamente alto o que incluye checkpoints intermedios, dado que un LoRA tipico sobre un modelo de 8B ocupa bastante menos espacio.

El modelo base LLaDA es relevante por su enfoque no autorregresivo: genera texto mediante un proceso de difusion por enmascaramiento, en lugar de predecir token a token de izquierda a derecha. Esto permite tecnicas como generacion paralela, infilling y refinamiento iterativo. El adaptador plain-tulip hereda esa arquitectura y anade un ajuste fino especifico cuyo proposito concreto no esta documentado en la informacion disponible.

La ficha se ve limitada por la ausencia de model card sustantiva: no hay descripcion de intencion, datos de entrenamiento, benchmarks ni idiomas declarados. Ademas, el acceso es restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. Cualquier evaluacion practica debe hacerse contra el modelo base y validar el efecto real del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer de difusion de texto (LLaDA) |
| Parametros totales | no disponible para el adaptador; el modelo base LLaDA-8B-Instruct tiene 8B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base no declara contexto en esta ficha |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA), libreria transformers + peft |
| Tamano del repositorio | 3,2 GB |
| Modelo base | GSAI-ML/LLaDA-8B-Instruct |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LLaDA-8B-Instruct, un modelo de difusion de texto enmascarado (masked diffusion) con backbone transformer de 8B parametros. A diferencia de los LLM autorregresivos, LLaDA genera secuencias corrompiendo la entrada con tokens de mascara y aprendiendo a reconstruirlos de forma iterativa, lo que habilita generacion bidireccional, relleno de huecos (infilling) y muestreo paralelo de varios tokens por paso. El adaptador plain-tulip es un LoRA de PEFT, por lo que solo modifica un subconjunto de pesos del modelo base y requiere cargar este ultimo para funcionar.

No hay informacion disponible sobre el dataset de entrenamiento del adaptador, el numero de tokens vistos, el rango del LoRA, el alpha, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO posteriores. Tampoco se documenta que capas se adaptaron ni si el ajuste se hizo sobre tareas conversacionales, de codigo o de otro tipo. El tamano de 3,2 GB del repositorio es notablemente superior al de un LoRA convencional sobre 8B (que suele rondar decenas o pocos cientos de MB en bf16), lo que podria indicar un rango alto, multiples adaptadores o artefactos adicionales, pero no se puede confirmar con los datos disponibles.

## Capacidades

- Generacion de texto conversacional heredada del modelo base LLaDA-8B-Instruct, con el estilo y sesgos que introduce el adaptador (no documentados).
- Generacion no autorregresiva por difusion: potencial para infilling, refinamiento iterativo y muestreo paralelo de tokens.
- Soporte de tool calling y function calling: no disponible en la informacion del adaptador; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: no disponibles; el modelo base no declara idiomas en esta ficha.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Al ser un adaptador PEFT, se puede combinar con el modelo base y potencialmente con otros adaptadores, aunque no se documenta compatibilidad.

## Casos de uso

- Prototipado de generacion de texto con difusion: usar plain-tulip como punto de partida para experimentar con decodificacion paralela e infilling sobre LLaDA-8B-Instruct, comparando el comportamiento con y sin adaptador para medir su efecto real.
- Investigacion sobre adaptadores PEFT en modelos no autorregresivos: estudiar como un LoRA modifica la dinamica de difusion y la calidad de las muestras en tareas de reconstruccion de texto enmascarado.
- Relleno de plantillas y documentos (infilling): aprovechar la naturaleza bidireccional del modelo base para completar huecos en textos estructurados, contratos o formularios, validando primero que el adaptador no degrada esta capacidad.
- Generacion de variantes de texto controladas: emplear el muestreo iterativo de la difusion para producir multiples candidatos y seleccionar el mejor mediante un reranker externo.
- Experimentos academicos de alineacion: comparar respuestas del modelo base frente al adaptador en prompts conversacionales para caracterizar el sesgo introducido por el ajuste fino.
- Base para destilacion o ajuste posterior: partir de plain-tulip como inicializacion en pipelines de investigacion que requieran un adaptador ya entrenado sobre LLaDA-8B-Instruct, siempre que se respete la licencia del modelo base.
- Evaluacion de robustez en produccion: no recomendado como modelo principal sin benchmarks; util como caso de prueba en sistemas de evaluacion de modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas especificas de difusion de texto (por ejemplo, perplejidad en tareas de infilling) para el adaptador ni para el modelo base en esta ficha. Cualquier cifra deberia obtenerse ejecutando evaluaciones propias contra GSAI-ML/LLaDA-8B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo no es suficiente; hay que cargar LLaDA-8B-Instruct. En bf16, el modelo base requiere aproximadamente 16 GB de VRAM solo para pesos, mas memoria para activaciones y KV cache (que en difusion puede diferir del esquema autorregresivo). En cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB, dependiendo del runtime.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en precision completa y lotes grandes. En consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar el modelo base en bf16 con margen limitado; RTX 4080/4070 Ti (16 GB) requeririan cuantizacion.
- Cabe en consumer GPU: si, en GPUs de 24 GB en bf16 y en GPUs de 16 GB o menos con cuantizacion, sujeto a que el runtime soporte el modelo de difusion.
- Opciones de despliegue: transformers + peft (ruta natural, ya que el repo es PEFT); vLLM, llama.cpp, Ollama y TGI no estan confirmados para LLaDA en esta informacion y deben verificarse. El acceso gated exige autenticacion con token de Hugging Face.
- Latencia y throughput: no disponibles. La generacion por difusion puede requerir varios pasos de refinamiento, lo que afecta a la latencia frente a un modelo autorregresivo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plain-tulip (adaptador) | no disponible (base 8B) | no disponible | LoRA sobre difusion de texto | no disponible | gated en Hugging Face |
| GSAI-ML/LLaDA-8B-Instruct | 8B | no disponible en esta ficha | Difusion de texto enmascarada | no disponible | publico en Hugging Face |
| LLaMA 3 8B Instruct | 8B | 8k (ampliable) | Transformer autorregresivo | licencia Llama | publico |
| Mistral 7B Instruct | 7B | 32k | Transformer autorregresivo | Apache 2.0 | publico |

La comparacion con LLaMA 3 8B y Mistral 7B es solo orientativa por tamano: el paradigma de generacion es distinto (difusion frente a autorregresivo) y no hay benchmarks del adaptador para contrastar calidad. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Ausencia de model card: no hay descripcion de intencion, datos de entrenamiento, hiperparametros del LoRA ni evaluaciones, lo que impide validar su calidad de forma objetiva.
- Acceso restringido: requiere aceptar condiciones en Hugging Face y autenticarse; no es un modelo de descarga libre.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Hay que revisar la licencia del modelo base LLaDA-8B-Instruct y la del adaptador antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; en difusion de texto, el refinamiento iterativo puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Idiomas no declarados: no hay garantia de calidad multilingue; debe evaluarse empiricamente.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y hereda todas las limitaciones, sesgos y restricciones de LLaDA-8B-Instruct.
- Ecosistema limitado: el soporte de LLaDA en runtimes de alto rendimiento (vLLM, TGI, llama.cpp) no esta confirmado en esta informacion, lo que puede complicar el despliegue en produccion.
- Tamano del repositorio inusual (3,2 GB): conviene inspeccionar el contenido antes de asumir que se trata de un unico LoRA ligero; puede incluir checkpoints adicionales.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia de calidad y mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s-ryoma/plain-tulip
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
