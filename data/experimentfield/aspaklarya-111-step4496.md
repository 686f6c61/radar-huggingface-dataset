# ExperimentField/Aspaklarya-111-step4496

## Resumen

Aspaklarya-111-step4496 es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por la organizacion ExperimentField dentro de su programa de ablaciones sistematicas Aspaklarya. El adaptador esta especializado en teledeteccion (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imagenes de satelite y aereas, con un estilo de respuesta verboso que aporta varias frases de razonamiento fundamentado en lugar de una sola palabra.

El checkpoint corresponde al experimento `exp111qa4` (ronda 1XX del programa), en el que se aumento el numero de pares QA por imagen de 2 a 4 y el numero de captions por imagen de 1 a 2, manteniendo el resto de la receta. Segun la propia model card, esta configuracion fue probada y rechazada: frente a un control de tres semillas con MEAN4 de 75,52 +/- 0,19, obtuvo una puntuacion de -0,56 MEAN4, clasificada como *harm*. El repositorio se conserva unicamente como registro documental y no se recomienda su uso.

A pesar de la clasificacion negativa del experimento, el checkpoint alcanza un MEAN4 de 76,62 sobre la muestra fija del programa (semilla 1105), lo que lo situa en el puesto 2 de 70 checkpoints puntuados. Esa aparente contradiccion se explica por la varianza de entrenamiento: el propio programa documenta que las diferencias por debajo de ~0,5 en MEAN4 no son interpretables a partir de un unico par de ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct; se entrena tambien la torre de vision |
| Parametros totales | no disponible (adaptador LoRA de r=16 sobre un modelo base de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia durante el entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (los tags de Hugging Face no declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-VL-8B-Instruct |
| Tamano del repositorio | 0,2 GB |
| LoRA | r=16, alpha=16, dropout=0,0 |
| Checkpoint | step 4496 (3,0 epocas) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de 8B parametros. El entrenamiento LoRA usa rango 16, alpha 16 y dropout 0,0, y a diferencia de muchas recetas de ajuste visual, la torre de vision tambien se entrena. El corpus consta de 71.944 elementos sobre 11.994 imagenes (23.986 captions y 47.958 pares VQA), con la columna VQA_1126 y los splits `train` y `other`. Cada imagen aporta 4 pares QA y 2 captions, que es precisamente la variable experimental de esta ronda frente a la ronda 0XX.

La optimizacion emplea ponderacion de perdida por token con w_caption=1,0 y w_vqa=1,0, learning rate 0,0002 con schedule lineal, warmup 0,03, weight decay 0,001 y gradient clipping 0,3. El batch efectivo es de 32 (4 x 8 de acumulacion de gradientes), con 3,0 epocas, longitud de secuencia 2048, lado maximo de imagen 1024 y semilla 3407. La evaluacion se realiza con un juez LLM (`gemma-4-31b-it-imiai`) en decodificacion greedy con temperatura 0, sobre una muestra fija de semilla 1105 para permitir comparaciones directas entre checkpoints.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes de teledeteccion, con respuestas verbosas de varias frases y razonamiento fundamentado.
- Image captioning descriptivo de imagenes de satelite y aereas, con dos captions por imagen en el corpus de entrenamiento.
- Razonamiento multimodal texto-imagen heredado del modelo base Qwen3-VL-8B-Instruct.
- Capacidades generales del modelo base (generacion de texto, codigo, matematicas, tool calling) potencialmente conservadas, aunque no evaluadas en este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio especificos del adaptador: no disponibles; las capacidades adicionales dependen del modelo base.

## Casos de uso

- Anotacion asistida de imagenes satelitales: el adaptador genera descripciones de varias frases utiles para prellenar metadatos en catalogos de imagenes, reduciendo el trabajo manual de etiquetado.
- Respuesta a preguntas sobre escenas aereas en flujos de analisis geoespacial, por ejemplo consultas sobre presencia de infraestructura, vegetacion o cuerpos de agua, con respuestas razonadas en lugar de etiquetas sueltas.
- Generacion de informes descriptivos a partir de recortes de imagen: el estilo verboso encaja en la redaccion de resumenes narrativos para visores GIS o dashboards de observacion de la Tierra.
- Evaluacion comparativa de recetas de ajuste fino: el checkpoint sirve como referencia documentada en programas de ablacion, ya que el repositorio incluye hiperparametros, medicion del ruido y resultados de control.
- Investigacion sobre calibracion de jueces LLM en tareas de VQA remota: los datos de varianza por slice (sigma de 0,25 a 0,88) permiten disenar experimentos con potencia estadistica adecuada.
- Prototipado de asistentes conversacionales sobre imagenes de satelite en entornos de investigacion, siempre que se acepte que el autor no recomienda su uso en produccion.

## Benchmarks y rendimiento

Evaluacion con juez LLM (`gemma-4-31b-it-imiai`), decodificacion greedy, temperatura 0, escala 0-100, muestra fija de semilla 1105.

| Slice | Prompt set | New tokens | n | Score |
|---|---|---|---|---|
| VQA DM | VQA_1126 (verbose) | 160 | 500 | 74,03 |
| VQA RSICD | legacy terse | 48 | 500 | 71,68 |
| Caption DM | caption-query bank | 320 | 491 | 81,32 |
| Caption RSICD | caption-query bank | 320 | 500 | 79,45 |
| **MEAN4** | | | 1.991 | **76,62** |

Referencias en la misma muestra (MEAN4):

| Modelo | MEAN4 |
|---|---|
| Aspaklarya-101-step4500 | 76,72 |
| **Aspaklarya-111-step4496** | **76,62** |
| Aspaklarya-106-soup | 76,36 |
| Aspaklarya-020-step4500 | 74,90 |
| DeanQwen3-8B | 64,84 |
| Qwen3-VL-8B-Instruct (stock) | 61,34 |

Suelo de ruido medido por el programa: control MEAN4 de 75,52 (sd 0,19, n=3); sigma por slice de 0,88 (VQA DM), 0,74 (VQA RSICD), 0,25 (Caption DM) y 0,52 (Caption RSICD); reproducibilidad del juez ~0,01; dispersion en reejecucion con la misma semilla ~0,30.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3-VL-8B-Instruct completo.
- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 16-18 GB para los pesos del modelo base de 8B, mas overhead de activaciones y del procesador de vision; con cuantizacion de 8 bits, en torno a 9-10 GB, y en 4 bits, alrededor de 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para mayor throughput y lotes grandes; RTX 4090 (24 GB) suficiente en bf16 para una sola peticion; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con bf16, y en GPUs de 12-16 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers + PEFT (receta oficial de la model card), vLLM o TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama solo si se fusiona el adaptador y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-111-step4496 | LoRA r=16 sobre 8B | 2048 en entrenamiento | 76,62 | no disponible | Hugging Face (PEFT) |
| Aspaklarya-101-step4500 | LoRA sobre 8B | 2048 en entrenamiento | 76,72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | mezcla de adaptadores sobre 8B | no disponible | 76,36 | no disponible | Hugging Face |
| DeanQwen3-8B | 8B | no disponible | 64,84 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (stock) | 8B | no disponible en la informacion | 61,34 | no disponible | Hugging Face |

La comparativa se limita al programa Aspaklarya y al modelo base, ya que la informacion proporcionada no incluye datos de otros adaptadores de teledeteccion comparables.

## Limitaciones y advertencias

- Configuracion rechazada por el propio autor: obtuvo -0,56 MEAN4 frente al control de tres semillas y se clasifica como *harm*; no se recomienda su uso.
- Seleccion sobre ruido: el checkpoint se conserva por registro, pero el programa advierte que diferencias de MEAN4 inferiores a ~0,5 no son interpretables y que elegir el mejor checkpoint entre varios es seleccion sobre ruido.
- El juez es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas a nivel de pixel; requiere comprobaciones humanas.
- El benchmark legacy terse (RSICD) no es un objetivo justo para la ronda 1XX: sus referencias son de ~4 caracteres y el rubric limita a 89/100 una respuesta correcta pero rellenada, de modo que un modelo verboso no puede alcanzar la banda superior.
- Las puntuaciones son en dominio (teledeteccion); no miden VQA de proposito general.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el juez solo detecta especificidad no respaldada.
- Licencia no disponible, lo que impide confirmar si el uso comercial esta permitido; conviene verificar tambien la licencia del modelo base Qwen3-VL-8B-Instruct.
- Idiomas soportados no declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-111-step4496
- Organizacion ExperimentField (card de programa con experimentos, ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
