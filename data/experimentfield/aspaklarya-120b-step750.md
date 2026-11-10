# ExperimentField/Aspaklarya-120b-step750

## Resumen

Aspaklarya-120b-step750 es un adaptador LoRA publicado por ExperimentField sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo vision-language de 8.000 millones de parametros. El adaptador esta especializado en teledeteccion (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imagenes de satelite y aereas. Forma parte del programa Aspaklarya, una ablacion sistematica que entrena y evalua variantes de receta de fine-tuning sobre el mismo modelo base con el objetivo de medir que cambios de hiperparametros o de curriculum mejoran el rendimiento y cuales lo degradan.

La particularidad de este checkpoint es que el propio autor lo marca como configuracion rechazada. Se trata de un modelo de respuesta verbosa (varias frases de razonamiento fundamentado en lugar de una sola palabra) entrenado con un curriculum que prioriza primero una fase de caption y despues una fase exclusiva de VQA. Frente al control de tres semillas del programa (MEAN4 75.52 +/- 0.19), este checkpoint obtiene 62.6, una caida de -12.92 puntos que el autor clasifica como catastrofica. Se conserva unicamente como registro documental del experimento, no como modelo recomendado.

El interes de la ficha, por tanto, no esta en el uso productivo del adaptador sino en su valor metodologico: documenta como un cambio de curriculum puede degradar severamente un modelo especializado, y publica de forma explicita la linea base de ruido del programa (sigma por slice, reproducibilidad del juez, dispersion en reejecuciones con la misma semilla). Es un caso de estudio sobre rigor experimental en fine-tuning de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-language Qwen3-VL-8B-Instruct |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa 0.2 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia en entrenamiento (max side de imagen 1024 px); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=16, alpha=16, dropout=0.0, torre de vision entrenada |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Checkpoint | step 750 del experimento exp120curB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo vision-language con torre de vision y decoder de lenguaje. El entrenamiento LoRA utiliza rango 16 y alpha 16 con dropout 0.0, y entrena tambien la torre de vision, no solo las capas de atencion del decoder. La perdida usa ponderacion por token (token weighting) con pesos w_caption=1.0 y w_vqa=1.0. El optimizador es AdamW con learning rate 0.0002, schedule lineal, warmup 0.03, weight decay 0.001 y gradient clipping 0.3. El batch efectivo es de 32 (4 x 8 de acumulacion de gradiente), una epoca, semilla 3407, secuencia de 2048 tokens y lado maximo de imagen de 1024 px.

El corpus de entrenamiento contiene 23.986 items sobre 11.994 imagenes, con 2 preguntas-respuesta por imagen y 0 captions, es decir, la fase de VQA exclusiva del curriculum. La variable experimental de esta ronda (1XX) es precisamente el orden del curriculum: primero fase de caption, despues fase de VQA. El resultado medido indica que esta receta degrada el rendimiento de forma severa respecto al control, lo que convierte al checkpoint en evidencia negativa sobre el diseno del curriculum. La evaluacion se realizo con un juez LLM (gemma-4-31b-it-imiai) en decodificacion greedy con temperatura 0, sobre una muestra fija con semilla 1105, puntuando de 0 a 100.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes de teledeteccion, con respuestas verbosas de varias frases y razonamiento fundamentado en lugar de una sola palabra.
- Image captioning de imagenes de satelite y aereas (fase de caption del curriculum).
- Razonamiento multimodal texto-imagen heredado del modelo base Qwen3-VL-8B-Instruct.
- Capacidades generales del modelo base (generacion de texto, codigo, matematicas, tool calling) potencialmente presentes, aunque no evaluadas ni documentadas en esta ficha.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Registro y auditoria de experimentos: conservar este checkpoint como referencia documental de una receta rechazada, permitiendo reproducir la comparacion frente al control de tres semillas y justificar por que el curriculum caption-primero no funciona en este dominio.
- Analisis de sensibilidad al curriculum en fine-tuning multimodal: usar el par de checkpoints (step 375 y step 750) para estudiar como evoluciona la puntuacion dentro de una misma receta y contrastarlo con la sigma medida por slice.
- Calibracion de pipelines de evaluacion con LLM-as-judge: emplear las tablas de ruido del programa (sigma de 0.88 en VQA DM, 0.74 en VQA RSICD, 0.25 en Caption DM, 0.52 en Caption RSICD) para dimensionar el numero de semillas necesarias antes de declarar una mejora significativa.
- Investigacion sobre respuestas verbosas en VQA de teledeteccion: analizar por que un modelo que responde con razonamiento extendido obtiene 75.48 en VQA DM pero solo 69.63 en el benchmark terse legacy, y que implica para el diseno de rubricas.
- Docencia y formacion en metodologia experimental: ilustrar con datos reales el sesgo de seleccion sobre el ruido (elegir el mejor checkpoint de varios) y el impacto de kernels CUDA no deterministas (dispersion de 0.30 con semilla fija).
- Fine-tuning especializado en teledeteccion como punto de partida negativo: si se quiere entrenar un modelo de VQA satelital, este checkpoint sirve para descartar la combinacion de hiperparametros y curriculum antes de invertir computo.

## Benchmarks y rendimiento

Evaluacion con juez LLM (gemma-4-31b-it-imiai), greedy, temperatura 0, muestra fija semilla 1105, escala 0-100.

| Slice | Prompt set | Tokens nuevos | n | Puntuacion |
|---|---|---|---|---|
| VQA DM | VQA_1126 (verbose) | 160 | 500 | 75.48 |
| VQA RSICD | legacy terse | 48 | 500 | 69.63 |
| Caption DM | caption-query bank | 320 | 491 | 69.73 |
| Caption RSICD | caption-query bank | 320 | 500 | 35.55 |
| MEAN4 | | | 1.991 | 62.6 |

Referencias del mismo programa sobre la misma muestra (MEAN4):

| Modelo | MEAN4 |
|---|---|
| Aspaklarya-101-step4500 | 76.72 |
| Aspaklarya-106-soup | 76.36 |
| Aspaklarya-020-step4500 | 74.90 |
| Control (media de 3 semillas) | 75.52 (sd 0.19) |
| DeanQwen3-8B | 64.84 |
| Aspaklarya-120b-step375 | 62.62 |
| **Aspaklarya-120b-step750** | **62.6** |
| Qwen3-VL-8B-Instruct stock | 61.34 |

Posicion en el ranking del programa: 70 de 70 checkpoints evaluados. El autor indica que la diferencia con su checkpoint hermano step375 (62.62 frente a 62.6) no es interpretable dado el ruido, y debe tratarse como un rango.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador. El modelo base Qwen3-VL-8B-Instruct en precision completa requiere del orden de 16-20 GB de VRAM; en cuantizacion de 8 bits aproximadamente 8-10 GB, y en 4 bits alrededor de 5-6 GB. Estas cifras son estimaciones generales para un modelo de 8B y no datos publicados para este adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para el modelo base de 8B son adecuadas GPUs con 24 GB o mas (RTX 4090, A10G, L40S, A100, H100) en funcion de la cuantizacion.
- Cabe en GPU de consumo: previsiblemente si, en GPUs con 16-24 GB (RTX 4080, 4090) usando cuantizacion, aunque no se aporta medicion concreta.
- Opciones de despliegue: el autor documenta el uso con `peft` y `transformers` (`AutoModelForImageTextToText` y `AutoProcessor`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-120b-step750 | 8B (base) + LoRA r=16 | 2048 en entrenamiento | 62.6 | no disponible | Hugging Face |
| Aspaklarya-120b-step375 | 8B (base) + LoRA r=16 | 2048 en entrenamiento | 62.62 | no disponible | Hugging Face |
| Aspaklarya-101-step4500 | 8B (base) + LoRA | no disponible | 76.72 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (stock) | 8B | no disponible | 61.34 | no disponible | Hugging Face |
| DeanQwen3-8B | 8B | no disponible | 64.84 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Configuracion rechazada por el propio autor: -12.92 MEAN4 frente al control de tres semillas, clasificada como catastrofica. No recomendada para uso.
- Ultimo puesto (70 de 70) en el ranking de checkpoints del programa.
- El juez de evaluacion es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no fundamentada pero no falsedades verificadas a nivel de pixel. Se requieren comprobaciones humanas.
- El benchmark terse legacy no es un objetivo justo para la ronda 1XX: sus referencias tienen unos 4 caracteres y su rubrica limita a 89/100 una respuesta correcta pero verbosa, por lo que un modelo verboso no puede alcanzar la banda superior.
- Las diferencias de MEAN4 inferiores a ~0.5 no son interpretables con un solo par de ejecuciones; las diferencias en un solo slice de VQA inferiores a ~1.8 tampoco. Los slices de caption son tres o cuatro veces mas silenciosos que los de VQA.
- Reejecutar con la misma semilla mueve la puntuacion ~0.30 por kernels CUDA no deterministas; la replicacion exacta no es alcanzable.
- Las puntuaciones son in-domain (teledeteccion); no miden VQA de proposito general.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base a partir de la informacion proporcionada.
- Idiomas soportados no disponibles; el comportamiento fuera del dominio de teledeteccion no esta evaluado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque la naturaleza verbosa del modelo aumenta la superficie de especificidad no fundamentada segun el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-120b-step750
- Organizacion ExperimentField (lista de experimentos, hiperparametros, linea base de ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Checkpoint hermano de la misma ejecucion: https://huggingface.co/ExperimentField/Aspaklarya-120b-step375
