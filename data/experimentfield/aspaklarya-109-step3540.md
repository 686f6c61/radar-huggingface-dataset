# ExperimentField/Aspaklarya-109-step3540

## Resumen

Aspaklarya-109-step3540 es un adaptador LoRA de tipo PEFT desarrollado por ExperimentField para el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo vision-language de 8.000 millones de parametros. El adaptador especializa el modelo base en tareas de teledeteccion (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imagenes de satelite. Forma parte de un programa de ablacion sistematica denominado Aspaklarya, en el que cada checkpoint corresponde a una variacion controlada de hiperparametros o de receta de datos.

El checkpoint publicado corresponde al experimento `exp109s1234`, paso 3540, una replicacion de semilla (seed 1234) de la receta de 36K. Se trata de un modelo de respuesta verbosa: a diferencia de la ronda 0XX, responde al VQA con varias frases de razonamiento fundamentado en lugar de una sola palabra. El repositorio ocupa 0,2 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador de dominio especifico para teledeteccion; por otro, el autor publica de forma inusualmente rigurosa su suelo de ruido experimental, lo que permite interpretar correctamente las cifras de evaluacion y evita la seleccion sobre ruido (selection on noise) al comparar checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-language Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (adaptador: r=16, alpha=16; modelo base: 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia en entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Rango LoRA / alpha | r=16 / alpha=16, dropout 0.0 |
| Torre de vision entrenada | si |
| Tamano del repositorio | 0,2 GB |
| Lado maximo de imagen | 1024 px |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagen y texto. La configuracion LoRA usa rango 16, alpha 16 y dropout 0.0, y se entrena tambien la torre de vision, no solo las capas de lenguaje. El entrenamiento emplea ponderacion de perdida por token (`token` weighting) con pesos iguales para caption y VQA (w_caption=1.0, w_vqa=1.0), optimizador con learning rate 0.0002, schedule lineal, warmup 0.03, weight decay 0.001 y clipping 0.3. El batch efectivo es de 32 (4 x 8 de acumulacion de gradientes) durante 4.0 epocas, con semilla 1234.

El corpus de entrenamiento consta de 35.979 elementos sobre 11.994 imagenes: 11.993 captions y 23.986 pares de VQA, es decir, 2 QA mas 1 caption por imagen. La columna de VQA utilizada es `VQA_1126` y el split de entrenamiento es `train,other`. La longitud de secuencia es de 2048 tokens y el lado maximo de imagen de 1024 px. No se documenta en la informacion disponible el uso de RLHF o DPO; el entrenamiento es de ajuste supervisado sobre el adaptador.

## Capacidades

- Generacion de texto descriptivo (image captioning) sobre imagenes de teledeteccion, con respuestas de hasta 320 tokens nuevos en la evaluacion.
- Respuesta visual a preguntas (VQA) en modalidad verbosa: varias frases de razonamiento fundamentado en la imagen, no respuestas de una sola palabra.
- Razonamiento fundamentado en contenido visual de satelite (deteccion de detalles y especificidad respaldada por la imagen).
- Procesamiento multimodal imagen-texto heredado de Qwen3-VL-8B-Instruct.
- Soporte de tool calling, agentes y modo thinking: no documentado para este adaptador en la informacion disponible (depende del modelo base).
- Capacidades multilingues: no disponibles.
- Dominio especializado en teledeteccion; no se evalua VQA de proposito general.

## Casos de uso

- Descripcion automatica de imagenes de satelite: el adaptador genera captions detallados (hasta 320 tokens) utiles para catalogar escenas en archivos de imagenes de observacion de la Tierra, aprovechando el entrenamiento especifico en captioning de teledeteccion.
- Anotacion asistida de datasets geoespaciales: dado que responde con razonamiento verboso, puede pre-anotar pares pregunta-respuesta sobre imagenes para revision humana posterior, reduciendo el coste de etiquetado.
- Analisis de escenas para VQA en entornos de investigacion: responder preguntas abiertas sobre contenido de imagenes (por ejemplo, presencia de estructuras o cambios de uso del suelo) con justificacion textual que un analista puede auditar.
- Generacion de informes preliminares a partir de imagenes: el modo verboso permite producir descripciones narrativas que sirvan como borrador de informes de monitorizacion, siempre con verificacion humana por las limitaciones del juez automatico.
- Evaluacion comparativa de recetas de ajuste fino: al ser un checkpoint de un programa de ablacion con suelo de ruido medido, sirve como referencia reproducible para investigadores que estudien el efecto de semillas e hiperparametros en adaptadores LoRA multimodales.
- Integracion en pipelines de investigacion con PEFT: el adaptador se carga sobre el modelo base con `PeftModel.from_pretrained`, lo que facilita su uso en cuadernos y scripts de experimentacion sin necesidad de servir un modelo completo adicional.

## Benchmarks y rendimiento

Evaluacion mediante LLM-as-judge (`gemma-4-31b-it-imiai`), decodificacion greedy, temperatura 0, escala 0-100, sobre una muestra fija con semilla 1105.

| Slice | Conjunto de prompts | Tokens nuevos | n | Puntuacion |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verbose) | 160 | 500 | 72,84 |
| VQA RSICD | legacy terse | 48 | 500 | 71,31 |
| Caption DM | caption-query bank | 320 | 491 | 82,49 |
| Caption RSICD | caption-query bank | 320 | 500 | 79,62 |
| MEAN4 | | | 1.991 | 76,56 |

Puesto en MEAN4: 3 de 70 checkpoints evaluados del programa.

| Modelo | MEAN4 |
|---|---|
| Aspaklarya-101-step4500 | 76,72 |
| Aspaklarya-109-step3540 (este) | 76,56 |
| Aspaklarya-106-soup | 76,36 |
| Aspaklarya-020-step4500 | 74,90 |
| DeanQwen3-8B | 64,84 |
| Qwen3-VL-8B-Instruct (stock) | 61,34 |

Suelo de ruido medido por el programa (misma receta, tres semillas):

| Cantidad | Valor |
|---|---|
| Control MEAN4 | 75,52 (sd 0,19, n=3) |
| Sigma VQA DM | 0,88 |
| Sigma VQA RSICD | 0,74 |
| Sigma Caption DM | 0,25 |
| Sigma Caption RSICD | 0,52 |
| Reproducibilidad del juez | ~0,01 |
| Dispersion en reejecucion con misma semilla | 0,30 |

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen3-VL-8B-Instruct completo.
- VRAM estimada para el modelo base en precision bf16/fp16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits o 4 bits se reduce de forma sustancial (cifras exactas no disponibles en la informacion proporcionada).
- GPU recomendadas: A100, H100 o GPU consumer de gama alta con 24 GB o mas (por ejemplo, RTX 4090) para bf16; GPUs con menos VRAM requieren cuantizacion del modelo base.
- Cabe en GPU consumer de 24 GB en bf16 con margen ajustado; con cuantizacion, en GPUs de 16 GB o menos (estimacion, no verificada en la informacion disponible).
- Opciones de despliegue: carga via `transformers` + `peft` (documentada en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-109-step3540 | 8B (base) + LoRA r=16 | 2048 en entrenamiento | 76,56 | no disponible | Hugging Face (adaptador PEFT) |
| Aspaklarya-101-step4500 | 8B (base) + LoRA | no disponible | 76,72 | no disponible | Hugging Face (adaptador PEFT) |
| Aspaklarya-106-soup | 8B (base) + LoRA (mezcla) | no disponible | 76,36 | no disponible | Hugging Face (adaptador PEFT) |
| DeanQwen3-8B | 8B | no disponible | 64,84 | no disponible | no disponible |
| Qwen3-VL-8B-Instruct (stock) | 8B | no disponible | 61,34 | no disponible | Hugging Face (modelo base) |

## Limitaciones y advertencias

- El juez de evaluacion es solo texto: nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas a nivel de pixel. La correccion real requiere revision humana por muestreo.
- El benchmark legacy terse no es un objetivo justo para la ronda 1XX: sus referencias tienen ~4 caracteres y su rubrica limita a 89/100 una respuesta correcta pero rellenada, de modo que un modelo verboso no puede alcanzar la banda superior aunque sea exacto.
- Las puntuaciones son en dominio (teledeteccion); no miden VQA de proposito general.
- Diferencias de MEAN4 inferiores a ~0,5 no son interpretables entre un par de ejecuciones; en VQA de una sola slice, el umbral es ~1,8.
- Reejecutar con la misma semilla mueve la puntuacion ~0,30 por kernels CUDA no deterministas; la replicacion exacta no es alcanzable.
- Seleccionar el checkpoint de mayor puntuacion entre varios es seleccion sobre ruido; el propio autor senala checkpoints hermanos con puntuacion superior (Aspaklarya-101-step4500, 76,72).
- Licencia no disponible: no puede confirmarse el uso comercial del adaptador ni del modelo base a partir de la informacion proporcionada.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de teledeteccion, su comportamiento fuera de dominio no esta caracterizado.
- Riesgo de alucinacion: el modo verboso genera descripciones detalladas que pueden incluir especificidad no respaldada por la imagen; el autor advierte que el juez solo detecta parte de este fenomeno.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-109-step3540
- Pagina de la organizacion (lista de experimentos, hiperparametros, suelo de ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
