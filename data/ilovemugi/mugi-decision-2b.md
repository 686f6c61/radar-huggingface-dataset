# ilovemugi/mugi-decision-2b

## Resumen

Mugi Decision 2B es un modelo de puntuacion de decisiones (decision scorer) derivado de Qwen3.5-2B mediante fine-tuning con LoRA. No es un modelo generativo: sustituye la cabeza de vocabulario por una cabeza escalar compartida que asigna una puntuacion a cada candidato de una lista, y devuelve ademas la softmax relativa dentro del conjunto de candidatos. Lo desarrolla el usuario ilovemugi como version independiente del proyecto Mugi Decision, y no es un lanzamiento oficial de Qwen.

El modelo recibe una descripcion de la tarea y un conjunto de al menos dos opciones, codificadas con seis tokens especiales (`<|desc_begin|>`, `<|desc_end|>`, `<|enum_begin|>`, `<|enum_end|>`, `<|current_begin|>`, `<|current_end|>`), y procesa cada candidato como una rama adicional tras un prefijo comun. El repositorio incluye los pesos BF16 con el adaptador LoRA ya fusionado: 1.881.827.136 parametros y 3,8 GB de tamano, sin necesidad de descargar el modelo base ni adaptadores por separado.

Es relevante para tareas de seleccion multiple, ranking y clasificacion donde no se quiere generar texto, sino obtener una puntuacion comparable entre alternativas. Su interes practico esta en el coste reducido (2B de parametros), el soporte de 15 idiomas y una licencia Apache-2.0 que facilita la integracion en produccion. Las puntuaciones softmax son relativas al conjunto de candidatos y no deben interpretarse como probabilidades calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto Qwen3.5-2B (con componentes DeltaNet) mas cabeza escalar compartida para puntuacion de candidatos; requiere codigo propio (`trust_remote_code`) |
| Parametros totales | 1.881.827.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens por rama (longitud maxima de entrenamiento); no se ha verificado exactitud en contextos mayores |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos BF16 |
| Idiomas soportados | zh, en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, th, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16); incluye codigo de arquitectura y `decision_encoding.py` |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-2B (revision fijada `15852e8c16360a2fea060d615a32b45270f8a8fc`) y lo convierte en un puntuador: en lugar de predecir vocabulario, el ultimo token valido de cada rama pasa por una cabeza escalar compartida que produce un score. La entrada se construye con `DecisionEncoder`: un prefijo comun con la descripcion y la lista completa de opciones, seguido de una rama por candidato que anade la opcion actual. La model card menciona que los pesos de normalizacion FP32 internos de DeltaNet se mantienen en FP32 tras la fusion, lo que apunta a componentes de atencion lineal en el backbone base. El modelo no incluye modulo de vision ni pesos multimodales.

El entrenamiento se hizo sobre el conjunto mixed2000 de 2.000.000 de preguntas (800.000 en chino, 800.000 en ingles y 400.000 repartidas entre los 13 idiomas restantes), partiendo de un modelo de decision convertido desde el backbone original, no desde adaptadores de 0.8B u otros tamanos. Se aplico LoRA con r=16, alpha=32 y dropout=0.05, entrenando simultaneamente la cabeza de puntuacion y los embeddings de los seis tokens especiales. Configuracion: BF16, 1 epoch, 125.000 actualizaciones, batch global 16, learning rate inicial 5e-5 y validacion cada 5.000 pasos. El checkpoint elegido fue checkpoint-125000, seleccionado por exactitud de validacion ponderada segun la proporcion de idiomas del entrenamiento, sin usar el conjunto de test para elegir checkpoint.

## Capacidades

- Puntuacion escalar de candidatos para tareas de decision y seleccion multiple.
- Ranking y reranking de un conjunto de opciones (por ejemplo, recuperacion de documentos o respuestas).
- Clasificacion de texto mediante puntuacion de etiquetas candidatas.
- Calculo de softmax relativa dentro del conjunto de candidatos evaluado.
- Soporte multilingue en 15 idiomas: chino, ingles, arabe, aleman, espanol, frances, hindi, indonesio, italiano, japones, coreano, portugues, ruso, tailandes y vietnamita.
- No genera respuestas de chat ni texto libre: la model card indica explicitamente que no debe usarse `generate` ni plantillas de chat.
- No incluye capacidades de vision, audio ni tool calling.

## Casos de uso

- Seleccion multiple automatizada: dado un enunciado y varias opciones, el modelo devuelve un score por opcion y la softmax del conjunto, util para evaluacion de examenes o encuestas.
- Reranking en pipelines de recuperacion (RAG): tras recuperar N documentos, se puntua cada uno frente a la consulta y se reordena antes de pasarlos a un generador.
- Clasificacion de tickets o correos: se definen las categorias como candidatos y se elige la de mayor score, con la softmax como senal de confianza relativa.
- Moderacion de contenido por umbrales: puntuar etiquetas como "aceptable"/"rechazable" y aplicar un umbral interno calibrado con datos propios.
- Enrutado de consultas en sistemas de agentes: decidir a que herramienta o submodelo derivar una peticion puntuando las alternativas disponibles.
- Anotacion asistida de datos: preetiquetar grandes volumenes de ejemplos de seleccion multiple para revision humana, aprovechando el coste bajo de un modelo de 2B.
- Comparacion de respuestas de modelos (evaluacion como juez): puntuar pares de respuestas candidatas a una misma pregunta para seleccionar la mejor.
- Investigacion en metodos de puntuacion: al publicarse con codigo y pesos, sirve como referencia reproducible para estudiar cabezas escalares frente a decodificacion generativa.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks oficiales (MMLU, HumanEval, GSM8K u otros). Los datos disponibles provienen de un subconjunto de test propio, congelado por el proyecto, de 5888 preguntas, en BF16, orden de opciones fijo y sin filtrado en tiempo de ejecucion. Corresponden al mejor adaptador antes de la fusion, no al modelo fusionado.

| Modelo | Correctas / Total | Exactitud total |
|---|---:|---:|
| Mugi Decision 2B | 4913 / 5888 | 83,4409 % |
| Mugi Decision 4B | 5105 / 5888 | 86,7018 % |

Desglose por idioma del modelo 2B:

| Idioma | Preguntas | Exactitud |
|---|---:|---:|
| Chino (zh) | 1075 | 73,5814 % |
| Ingles (en) | 1485 | 75,6902 % |
| Arabe (ar) | 256 | 89,0625 % |
| Aleman (de) | 256 | 95,3125 % |
| Espanol (es) | 256 | 91,4062 % |
| Frances (fr) | 256 | 93,3594 % |
| Hindi (hi) | 256 | 89,4531 % |
| Indonesio (id) | 256 | 96,8750 % |
| Italiano (it) | 256 | 96,0938 % |
| Japones (ja) | 256 | 85,9375 % |
| Coreano (ko) | 256 | 71,4844 % |
| Portugues (pt) | 256 | 97,2656 % |
| Ruso (ru) | 256 | 87,8906 % |
| Tailandes (th) | 256 | 87,5000 % |
| Vietnamita (vi) | 256 | 89,4531 % |

La verificacion de publicacion solo cubre dos entradas cortas (chino e ingles) para comprobar carga y valores numericos, con una coincidencia de 2/2 en la opcion preferida antes y despues de la fusion y una diferencia maxima de score de 0,046875. No se repitio la evaluacion completa de 5888 preguntas sobre los pesos ya fusionados.

## Requisitos de hardware

- Peso del modelo en BF16: aproximadamente 3,8 GB solo para los pesos (1.881.827.136 parametros x 2 bytes), cifra coherente con el tamano del repositorio.
- VRAM estimada: como minimo unos 4-6 GB para pesos y overhead de activaciones en entradas cortas; al procesar 4 candidatos por lote en paralelo (valor por defecto del script) y ramas de hasta 1024 tokens, el consumo de activaciones crece de forma proporcional al numero de candidatos y a la longitud de cada rama.
- GPU tipo datacenter: A100, H100 o L40S, adecuadas si se necesita alto throughput con lotes grandes.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en BF16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En tarjetas de 8 GB es probable que haya que reducir el numero de candidatos por lote.
- CPU: el autor indica que existe soporte con `--device cpu`, pero solo se valido la carga con entradas pequenas y no se ofrece ninguna garantia de throughput.
- Despliegue: el repositorio proporciona `predict.py`; tambien es posible cargar con `AutoModel.from_pretrained(..., trust_remote_code=True)` usando `DecisionEncoder`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Entorno validado: PyTorch 2.13.0 y Transformers 5.17.0. Tanto en CUDA (NVIDIA) como en ROCm (AMD) el dispositivo se referencia como `cuda`.
- Latencia y throughput: no disponibles (el autor no publica cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (test propio) | Licencia | Disponibilidad |
|---|---:|---|---|---:|---|
| Mugi Decision 2B | 1,88B | 1024 tokens por rama | 83,4409 % (4913/5888) | Apache-2.0 | Pesos safetensors BF16 publicados |
| Mugi Decision 4B | no disponible | no disponible | 86,7018 % (5105/5888) | no disponible en la informacion | Repositorio en HuggingFace (ilovemugi/mugi-decision-4b) |
| Qwen3.5-2B (modelo base) | ~2B | no disponible | No comparable: es generativo, no puntua candidatos | no disponible en la informacion | Pesos publicados por Qwen |

No se dispone de comparacion con rerankers o clasificadores de la misma categoria (por ejemplo modelos dedicados de reranking) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas de chat ni texto libre. No debe usarse con `generate` ni con plantillas de chat.
- La softmax de salida es un score relativo dentro del conjunto de candidatos; no es una probabilidad calibrada de que la opcion sea correcta. Anadir o quitar candidatos cambia el resultado.
- El resultado depende de la formulacion, el orden y la redaccion de las opciones.
- Longitud maxima de rama de 1024 tokens; no se ha verificado la exactitud con contextos mas largos. El script por defecto lanza error en lugar de truncar silenciosamente.
- Rendimiento desigual por idioma: la exactitud varia entre el 71,48 % en coreano y el 97,27 % en portugues, con chino (73,58 %) e ingles (75,69 %) por debajo de la media total pese a concentrar la mayor parte del entrenamiento.
- Las cifras de test corresponden al adaptador antes de la fusion; no se ha repetido la evaluacion completa sobre los pesos fusionados. La fusion BF16 y las diferencias de hardware u operadores introducen desviaciones de redondeo.
- No se puede descartar contaminacion de los datos de preentrenamiento: segun la propia model card, los datos previos no son completamente auditables y la division y deduplicacion del proyecto no garantizan su ausencia.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones erroneas o poco fiables en dominios alejados de la distribucion de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia Apache-2.0 para el modelo, pero las licencias y restricciones de cada fuente de datos de entrenamiento se aplican por separado; la licencia del modelo no autoriza a redistribuir los datos de entrenamiento.
- En produccion: desplegar con `trust_remote_code=True` implica ejecutar codigo del repositorio; conviene revisarlo antes. No hay soporte documentado para servidores de inferencia estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ilovemugi/mugi-decision-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Version 4B del mismo proyecto: https://huggingface.co/ilovemugi/mugi-decision-4b
- Metrica agregada de evaluacion: eval_results.json (referenciado en el repositorio)
- Verificacion de publicacion: release_verification.json (referenciado en el repositorio)
- Licencia y avisos: LICENSE y NOTICE (referenciados en el repositorio)
