# phuongnt/VEHME-FERMAT

## Resumen

VEHME-FERMAT es un adaptador PEFT (LoRA) sobre el modelo VEHME, que a su vez parte de Qwen2.5-VL-7B-Instruct. Lo desarrolla el autor phuongnt y está orientado a la evaluacion automatica de soluciones matematicas manuscritas en formato abierto. El modelo recibe tres entradas: una imagen con el enunciado del problema, una solucion de referencia en texto y una imagen con la resolucion manuscrita del estudiante. A partir de ellas determina si el razonamiento es correcto y, cuando no lo es, localiza y describe la expresion o paso erroneo.

El modelo aborda dos tareas complementarias: deteccion de errores (Error Detection, ED) y localizacion de errores (Error Localization, EL). Frente al grading clasico que solo compara la respuesta final, VEHME evalua el proceso completo con notacion y disposicion irregular, algo relevante para sistemas de correccion automatica de examenes y plataformas educativas.

Esta version concreta es un fine-tuning de VEHME sobre un subconjunto del dataset FERMAT (ai4bharat/FERMAT). El repositorio ocupa aproximadamente 0,3 GB, lo que corresponde a los pesos del adaptador LoRA y no al modelo completo. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre VEHME, basado en Qwen2.5-VL-7B-Instruct (transformer vision-language) |
| Parametros totales | No disponible para el adaptador; el modelo base VEHME-Qwen2.5-VL-7B tiene 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre VEHME, que emplea como columna vertebral Qwen2.5-VL-7B-Instruct, un transformer multimodal de 7.000 millones de parametros con codificador visual y capacidad image-text-to-text. El pipeline de entrenamiento descrito por el autor combina supervised fine-tuning (SFT) con Group Relative Policy Optimization (GRPO), usando trazas de razonamiento destiladas y recompensas de refuerzo orientadas a la correccion y a la localizacion del error. Ademas, incorpora un modulo de prompting visual consciente de expresiones (Expression-Aware Visual Prompting Module, EVPM) para mejorar la localizacion de expresiones manuscritas en disposiciones complejas.

La version VEHME-FERMAT se obtiene ajustando VEHME sobre un subconjunto del dataset FERMAT. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del subconjunto ni los hiperparametros del ajuste LoRA. El modelo genera una salida estructurada en XML con tres campos: `<think>` (explicacion del razonamiento), `<correctness>` (Correct o Incorrect) y `<localization>` (descripcion del paso erroneo o None).

## Capacidades

- Evaluacion de soluciones matematicas manuscritas directamente desde imagen, sin necesidad de transcripcion previa a texto.
- Deteccion de errores (ED): clasifica una resolucion como correcta o incorrecta.
- Localizacion de errores (EL): identifica y describe la expresion o paso concreto donde se produce el fallo.
- Generacion de retroalimentacion razonada en el bloque `<think>`, explicando la evaluacion antes de emitir el veredicto.
- Salida estructurada y parseable en XML con etiquetas `<think>`, `<correctness>` y `<localization>`.
- Procesamiento multimodal image-text-to-text: combina imagenes (enunciado y respuesta manuscrita) con texto de referencia.
- Grounding espacial de expresiones manuscritas mediante EVPM durante el entrenamiento.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Correccion automatica de examenes de matematicas: el modelo recibe la foto del examen manuscrito y la solucion de referencia, y devuelve un veredicto de correccion con justificacion, reduciendo el tiempo de revision manual en plataformas de evaluacion.
- Plataformas de aprendizaje adaptativo: integrado en un tutor digital, permite detectar en que paso concreto falla el estudiante y generar retroalimentacion dirigida a ese error en lugar de una calificacion binaria.
- Investigacion educativa a gran escala: procesar lotes de respuestas manuscritas para analizar patrones de error por tipo de problema o por poblacion de estudiantes.
- Sistemas de revision entre pares asistida: ofrecer al docente una propuesta de localizacion del error que pueda validar o corregir, agilizando la revision de ejercicios abiertos.
- Evaluacion de calidad de OCR matematico: usar la localizacion de errores para detectar si un fallo proviene de la transcripcion de la expresion o del razonamiento del estudiante.
- Construccion de datasets de feedback educativo: generar pares (solucion manuscrita, evaluacion razonada) para entrenar o evaluar otros modelos de correccion automatica.
- Despliegue en herramientas de aula: al ser un adaptador LoRA sobre un modelo de 7B, puede servirse con infraestructura moderada y compartir la base Qwen2.5-VL entre varias tareas mediante PEFT.

## Benchmarks y rendimiento

Resultados publicados por el autor para VEHME-Qwen2.5-VL-7B (modelo base del adaptador) en los benchmarks AIHub y FERMAT, en porcentaje:

| Modelo | AIHub ED Acc | AIHub ED F1 | AIHub EL Acc | AIHub EL F1 | FERMAT ED Acc | FERMAT ED F1 | FERMAT EL Acc | FERMAT EL F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-4o | 73,00 | 48,67 | 62,88 | 61,01 | 66,62 | 58,57 | 55,04 | 66,07 |
| GPT-4o-mini | 57,15 | 32,97 | 38,98 | 49,18 | 81,75 | 56,62 | 47,18 | 62,61 |
| Gemini-2.0-Flash | 75,40 | 50,30 | 67,40 | 65,73 | 75,22 | 43,13 | 64,24 | 75,13 |
| Gemini-2.5-Flash-Preview | 71,01 | 46,91 | 63,00 | 65,68 | 80,12 | 45,68 | 63,35 | 74,72 |
| Phi-4-multimodal-instruct | 38,57 | 29,39 | 35,93 | 21,33 | 36,20 | 22,33 | 16,91 | 15,15 |
| Qwen2.5-VL-7B-Instruct | 46,68 | 31,48 | 38,00 | 33,75 | 44,81 | 26,04 | 24,33 | 32,18 |
| Pixtral-12B | 52,67 | 31,69 | 32,20 | 38,35 | 41,39 | 25,56 | 10,53 | 3,52 |
| Llama-3.2-11B-Vision-Instruct | 19,49 | 18,58 | 44,78 | 5,62 | 32,49 | 22,15 | 21,07 | 22,67 |
| VEHME-Qwen2.5-VL-7B | 73,01 | 49,22 | 61,13 | 58,18 | 62,61 | 29,81 | 31,90 | 44,36 |

Hallazgos destacados por el autor: VEHME supera a todos los modelos open source evaluados en ambos datasets y ambas tareas; en AIHub mejora la deteccion de errores del modelo base de 46,68% a 73,01% (+26,33 puntos) y la localizacion de 38,00% a 61,13% (+23,13 puntos); en AIHub iguala practicamente a GPT-4o (73,00%) y queda cerca de Gemini-2.0-Flash (75,40%). En FERMAT obtiene 62,61% en deteccion y 31,90% en localizacion, superando a los open source pero por debajo de los modelos propietarios. No se han publicado resultados especificos del adaptador VEHME-FERMAT en la informacion disponible.

## Requisitos de hardware

- El adaptador PEFT no se ejecuta de forma autonoma: requiere cargar el modelo base VEHME (Qwen2.5-VL-7B) y aplicar el adaptador LoRA. El repo del adaptador ocupa unos 0,3 GB; los pesos completos del base deben obtenerse por separado.
- VRAM estimada para el modelo base de 7B en precision completa (bf16): aproximadamente 14-16 GB solo para pesos, mas memoria para el codificador visual, activaciones y cache KV.
- En cuantizacion de 4 bits, el base de 7B puede caber en GPUs consumer con 8-12 GB de VRAM, aunque no se documentan cuantizaciones oficiales del adaptador en la informacion disponible.
- GPUs recomendadas para produccion: A100 40/80 GB o H100 para mayor throughput y lotes grandes; RTX 4090 (24 GB) para inferencia en bf16 o servicio de baja concurrencia.
- Despliegue: la model card indica el uso con Transformers, Accelerate, torch, pillow y qwen-vl-utils, ademas de PEFT para cargar el adaptador. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIHub ED Acc | AIHub EL Acc | FERMAT ED Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| VEHME-FERMAT (este) | Adaptador sobre 7B | No disponible | No disponible (base: 73,01) | No disponible (base: 61,13) | No disponible (base: 62,61) | Apache 2.0 | Hugging Face (PEFT) |
| Qwen2.5-VL-7B-Instruct | 7B | No disponible | 46,68 | 38,00 | 44,81 | No disponible en la informacion | Hugging Face |
| Pixtral-12B | 12B | No disponible | 52,67 | 32,20 | 41,39 | No disponible en la informacion | Hugging Face |
| Llama-3.2-11B-Vision-Instruct | 11B | No disponible | 19,49 | 44,78 | 32,49 | No disponible en la informacion | Hugging Face |

Los modelos propietarios de referencia (GPT-4o, Gemini-2.0-Flash) se incluyen en la tabla de benchmarks como comparacion de rendimiento, pero no son desplegables localmente.

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; el rendimiento en otros idiomas, incluido el castellano, no esta documentado.
- El modelo esta especializado en matematicas manuscritas y no es un modelo de proposito general.
- En FERMAT el rendimiento cae respecto a AIHub (62,61% ED y 31,90% EL), y los modelos propietarios siguen siendo superiores en ese dataset, especialmente en localizacion.
- Riesgo de alucinacion en la explicacion del razonamiento y en la descripcion del error; las salidas deben validarse en entornos de evaluacion reales.
- No se documentan sesgos especificos, pero al entrenarse sobre datasets educativos concretos (AIHub, FERMAT) puede generalizar peor fuera de su distribucion, por ejemplo con notacion, caligrafia o idiomas distintos.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse tambien la licencia del modelo base VEHME y de Qwen2.5-VL-7B-Instruct antes de un despliegue en produccion.
- El adaptador no es autonomo: requiere descargar el modelo base y gestionar su memoria, lo que condiciona los requisitos de infraestructura.
- No se documentan longitudes de contexto, cuantizaciones oficiales ni cifras de latencia, lo que dificulta planificar un despliegue a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phuongnt/VEHME-FERMAT
- Modelo base VEHME: https://huggingface.co/phuongnt/VEHME
- Dataset FERMAT: https://huggingface.co/datasets/ai4bharat/FERMAT
- Paper (EMNLP 2025): https://aclanthology.org/2025.emnlp-main.1619/
- Sitio web del proyecto: https://vehme.github.io/
- Codigo: https://github.com/phuongnt197/VEHME
