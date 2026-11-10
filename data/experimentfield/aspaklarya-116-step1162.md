# ExperimentField/Aspaklarya-116-step1162

## Resumen

Aspaklarya-116-step1162 es un adaptador LoRA publicado por la organizacion ExperimentField para el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de 8.000 millones de parametros de la familia Qwen3-VL. El adaptador esta especializado en teledeteccion (remote sensing) y cubre dos tareas concretas: respuesta visual a preguntas (VQA) y generacion de descripciones de imagen (image captioning). Forma parte de un programa de ablacion sistematica denominado Aspaklarya, en el que se entrenan y evaluan decenas de configuraciones bajo un protocolo comun de evaluacion con juez LLM.

El checkpoint corresponde al experimento `exp116neg`, cuyo unico cambio respecto a la receta de referencia consiste en anadir ejemplos de negativos duros (hard negatives) al corpus de entrenamiento. Segun la propia model card, esta configuracion fue probada y rechazada: frente a un control de tres semillas con MEAN4 de 75,52 +/- 0,19, este checkpoint obtuvo 74,86, es decir, 0,66 puntos por debajo, lo que el programa clasifica como dano. El repositorio se conserva unicamente como registro documental y el autor no lo recomienda para uso.

La relevancia de esta ficha es, por tanto, doble: describe un adaptador concreto de teledeteccion sobre Qwen3-VL-8B y, sobre todo, documenta una metodologia de evaluacion poco habitual en el ecosistema open source, con medicion explicita del ruido de entrenamiento, del ruido del juez y de la reproducibilidad, lo que permite interpretar correctamente las cifras publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible para el adaptador; el modelo base tiene 8.000 millones (segun denominacion del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el entrenamiento uso seq len 2048 y max side 1024 |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); interoperable con el modelo base en safetensors |
| Rango LoRA | r=16, alpha=16, dropout=0.0 |
| Tamano del repositorio | 0,2 GB |
| Biblioteca | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagenes y texto. La configuracion LoRA usa rango 16, alpha 16 y dropout 0.0, y entrena tambien la torre de vision (vision tower trained), no solo las capas de atencion del decodificador. El entrenamiento cubre 1,0 epocas sobre un corpus de 37.178 elementos y 13.193 imagenes, distribuido en 11.993 ejemplos de caption y 25.185 de VQA, con 2 preguntas-respuesta y 1 descripcion por imagen. La columna VQA empleada es `VQA_1126` y el split de entrenamiento es `train,other`.

La optimizacion usa ponderacion de perdida por token con pesos iguales para caption y VQA (w_caption=1.0, w_vqa=1.0), learning rate 0,0002 con schedule lineal, warmup 0,03, weight decay 0,001 y clipping de gradiente 0,3. El batch efectivo es de 32 (4 x 8 de acumulacion de gradientes) y la semilla es 3407. La variable experimental de este checkpoint es la incorporacion de negativos duros al corpus, un cambio que, segun la evaluacion posterior, degrada el rendimiento medio en lugar de mejorarlo. El checkpoint publicado corresponde al paso 1162.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes de teledeteccion, con respuestas verbosas de varias frases y razonamiento fundamentado en la imagen, a diferencia de la ronda 0XX del programa, que respondia con una sola palabra.
- Generacion de descripciones de imagen (image captioning) en el dominio de teledeteccion.
- Razonamiento multimodal basado en el modelo base Qwen3-VL-8B-Instruct.
- Capacidades heredadas del modelo base no evaluadas en este adaptador: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes y modo thinking: no disponible en la informacion proporcionada para este adaptador.
- Capacidades multilingues: no disponibles; la evaluacion del programa es en dominio y no mide multilingüismo.

## Casos de uso

- Descripcion automatica de imagenes satelitales en catalogos geoespaciales: el adaptador genera descripciones de varias frases utiles para indexar y buscar escenas por contenido, aprovechando el entrenamiento especifico en captioning de teledeteccion.
- Anotacion asistida de imagenes aereas en flujos de etiquetado: el modelo produce descripciones y respuestas que un revisor humano puede validar, reduciendo el coste de la anotacion inicial en proyectos de cartografia.
- Enriquecimiento de metadatos en plataformas de observacion de la Tierra: dado que el modelo responde con razonamiento fundamentado, sus salidas pueden servir como borrador de metadatos estructurados que luego se normalizan en un pipeline.
- Investigacion en adaptacion de dominio de modelos vision-lenguaje: el checkpoint es un ejemplo documentado de ablacion con negativos duros, util para estudiar como afecta esa tecnica al rendimiento en VQA de teledeteccion.
- Reproduccion de experimentos y auditoria metodologica: el repositorio permite replicar la evaluacion del programa Aspaklarya y contrastar la cifra de MEAN4 con el control de tres semillas.
- Educacion y formacion en evaluacion de modelos multimodales: la model card documenta el ruido del juez, la varianza entre semillas y el sesgo de seleccion de checkpoints, material didactico para disenar evaluaciones rigurosas.

Advertencia: el autor declara explicitamente que esta configuracion fue rechazada y no la recomienda para uso en produccion; los casos anteriores describen usos posibles del adaptador, no usos recomendados.

## Benchmarks y rendimiento

Evaluacion con juez LLM (`gemma-4-31b-it-imiai`), decodificacion greedy, temperatura 0, escala 0-100, sobre una muestra fija con semilla 1105.

| Slice | Conjunto de prompts | Tokens nuevos | n | Puntuacion |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verboso) | 160 | 500 | 70,85 |
| VQA RSICD | legacy terse | 48 | 500 | 69,64 |
| Caption DM | banco de consultas de caption | 320 | 491 | 80,50 |
| Caption RSICD | banco de consultas de caption | 320 | 500 | 78,44 |
| MEAN4 | | | 1.991 | 74,86 |

Puesto en MEAN4: 48 de 70 checkpoints puntuados del programa.

Puntos de referencia en la misma muestra (MEAN4):

| Modelo | MEAN4 |
|---|---|
| Aspaklarya-101-step4500 | 76,72 |
| Aspaklarya-106-soup | 76,36 |
| Aspaklarya-020-step4500 | 74,90 |
| Aspaklarya-116-step1162 (este) | 74,86 |
| DeanQwen3-8B | 64,84 |
| Qwen3-VL-8B-Instruct original | 61,34 |

Suelo de ruido medido por el programa (misma receta entrenada tres veces con semillas distintas):

| Cantidad | Valor |
|---|---|
| Control MEAN4 | 75,52 (sd 0,19, n=3) |
| Sigma, VQA DM | 0,88 |
| Sigma, VQA RSICD | 0,74 |
| Sigma, Caption DM | 0,25 |
| Sigma, Caption RSICD | 0,52 |
| Reproducibilidad del juez | ~0,01 |
| Dispersion con misma semilla | 0,30 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo vision-lenguaje de 8.000 millones de parametros requiere tipicamente entre 16 y 18 GB en FP16/BF16, y entre 6 y 8 GB en cuantizacion de 4 bits, pero estos valores no estan confirmados en la informacion disponible para este adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el codigo de uso de la model card emplea `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y `peft` (`PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-116-step1162 | 8.000 M (base) + LoRA r=16 | no disponible | 74,86 | no disponible | Hugging Face (PEFT) |
| Aspaklarya-101-step4500 | 8.000 M (base) + LoRA | no disponible | 76,72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | 8.000 M (base) + LoRA | no disponible | 76,36 | no disponible | Hugging Face |
| DeanQwen3-8B | 8.000 M (base) | no disponible | 64,84 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (original) | 8.000 M | no disponible | 61,34 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Configuracion rechazada por el autor: obtuvo -0,66 MEAN4 frente al control de tres semillas (75,52 +/- 0,19) y se clasifica como dano. No recomendada para uso.
- El juez de evaluacion es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no fundamentada pero no falsedades verificadas a nivel de pixel. La correccion a nivel de pixel requiere revision humana por muestreo.
- El benchmark legacy terse no es un objetivo justo para la ronda 1XX: sus referencias tienen unos 4 caracteres y su rubrica limita a 89/100 una respuesta correcta pero rellenada, de modo que un modelo verboso no puede alcanzar la banda superior por muy preciso que sea.
- Las diferencias de MEAN4 inferiores a ~0,5 no son interpretables a partir de un unico par de ejecuciones; las diferencias en un solo slice de VQA inferiores a ~1,8 tampoco. Los slices de caption son entre tres y cuatro veces mas silenciosos que los de VQA.
- Reejecutar con la semilla fija aun desplaza la puntuacion unos 0,30 por kernels CUDA no deterministas; la replicacion exacta no es alcanzable.
- Seleccionar el checkpoint de mayor puntuacion entre varios y citarlo constituye seleccion sobre ruido; el programa lo advierte explicitamente.
- Las puntuaciones son en dominio: es un modelo de teledeteccion y nada de lo medido evalua VQA de proposito general.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base y del adaptador antes de cualquier despliegue.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; el juez solo texto no lo mide de forma fiable.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-116-step1162
- Organizacion ExperimentField (lista de experimentos, hiperparametros, suelo de ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
