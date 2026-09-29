# Beko2210/statim-decide-multilingual-base-emotion

## Resumen

statim-decide-multilingual-base-emotion es un adaptador LoRA de bajo rango que especializa al modelo de decisiones Beko2210/statim-decide-multilingual-base (version 0.7.0) en la tarea concreta de clasificacion de emociones. Lo desarrolla Belkis Aslani (usuario Beko2210 de HuggingFace) dentro del ecosistema Statim, un motor nativo en C++20 orientado a modelos de decision de tipo System-1. El adaptador no genera texto libre: resuelve decisiones tipadas (choice, score o noul) sobre una entrada de texto o JSON en una sola pasada hacia delante.

El modelo base sobre el que se aplica esta construido a partir de Laya (Apache-2.0) y mmBERT-base (MIT), y el conjunto Statim esta pensado para tareas de clasificacion y decision estructurada multilingue. El adaptador anade una cabecera emocional con seis categorias cerradas (anger, disgust, fear, joy, sadness, surprise) y mejora la decision base en ocho idiomas: aleman, ingles, espanol, frances, hindi, portugues, ruso y chino.

La relevancia de esta ficha radica en que se trata de un ejemplo representativo de la familia Statim: adaptadores ligeros (el fichero safetensors pesa unos 3,4 millones de parametros) que se cargan sobre un motor unico y que se evaluan con una regla de promocion estadistica (ganancia superior a 2 errores estandar agrupados por familia de idiomas). El adaptador mejora la exactitud media del modelo base de 0,5892 a 0,6367 en el conjunto de evaluacion emocional, con ganancias claras en frances e hindi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre transformer multilingue (base Statim decide, derivada de Laya y mmBERT-base) |
| Parametros totales | 3.379.200 (adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 y q8_0 (ficheros publicados) |
| Idiomas soportados | de, en, es, fr, hi, pt, ru, zh |
| Licencia | statim-weights (licencia personalizada, referenciada como "other") |
| Formato de pesos | safetensors y GGUF (adaptador LoRA en GGUF: statim-decide-multilingual-base-emotion.lora.gguf) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base Beko2210/statim-decide-multilingual-base 0.7.0. Este modelo base pertenece a la familia Statim, un motor nativo en C++20 para modelos de decision que produce decisiones tipadas (choice, score, noul) sobre texto o JSON en una unica pasada. Segun la documentacion, la base se construye sobre Laya (Apache-2.0) y mmBERT-base (MIT), lo que la situa dentro de la estirpe de los transformers codificadores multilingues.

El adaptador se ha entrenado con tres fuentes de datos de emociones: el dataset Johnson8187/Chinese_Multi-Emotion_Dialogue_Dataset (6.200 filas, licencia MIT), el dataset JusteLeo/French-emotion (6.200 filas, licencia MIT) y el dataset brighter-dataset/BRIGHTER-emotion-categories. No se especifican en la informacion disponible ni el numero total de tokens de entrenamiento, ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La carga del adaptador es distinta segun el fichero: el fichero f32 se fusiona en carga (merged at load), mientras que el fichero q8_0 se aplica como LoRA en tiempo de ejecucion. Los adaptadores LoRA requieren Statim 0.8.0 o posterior; el modelo se comprobo con Statim 0.8.3.

## Capacidades

- Clasificacion de emociones cero disparo (zero-shot) mediante decision tipada de tipo choice sobre un conjunto cerrado de criterios (anger, disgust, fear, joy, sadness, surprise).
- Decision estructurada sobre texto o JSON en una sola pasada hacia delante, sin generacion autoregresiva de texto.
- Soporte multilingue en ocho idiomas: aleman, ingles, espanol, frances, hindi, portugues, ruso y chino.
- Integracion con el motor Statim mediante servidor HTTP (statim serve) y API compatible con el endpoint /v1/systemone.
- SDK de Python (statim) desde la version 0.8.3 para invocar decisiones con adaptador explicito o en modo auto.
- Carga de adaptadores como LoRA en tiempo de ejecucion o fusionados al cargar, segun el formato de pesos.
- No dispone de generacion de texto libre, razonamiento multi-paso, tool calling ni capacidades de vision o audio segun la informacion disponible.

## Casos de uso

- Moderacion de contenido emocional: clasificar mensajes de usuario en seis emociones basicas para enrutar o priorizar su revision en plataformas de gran volumen, aprovechando que la inferencia es una sola pasada y no requiere generacion.
- Analisis de sentimiento en atencion al cliente: etiquetar tickets y conversaciones con la emocion dominante para detectar clientes frustrados o situaciones de riesgo de cancelacion, gracias al soporte de ocho idiomas que cubre mercados de Europa, Asia y America.
- Enrutamiento de colas de soporte: el modelo puede decidir la emocion dominante de un texto entrante y servir como senal para dirigir el caso a un equipo u otro, integrantodose en el pipeline de soporte mediante el endpoint /v1/systemone.
- Monitorizacion de reputacion de marca en redes sociales: procesar menciones multilingues y clasificar su tono emocional para alertar ante picos de anger o sadness.
- Investigacion en psicologia computacional o linguistica: usar el modelo como anotador automatico de corpus emocionales en los ocho idiomas soportados, con la ventaja de que el adaptador es ligero y se puede desplegar en un unico binario.
- Sistemas de deteccion de fraude o abuso con carga emocional: combinar la clasificacion emocional con reglas de negocio para marcar interacciones con patrones de miedo, sorpresa o enfado desproporcionados.
- Preetiquetado de datos para fine-tuning: emplear el adaptador como anotador de primera pasada en un corpus multilingue antes de la revision humana, reduciendo el coste de anotacion en frances e hindi, donde el adaptador muestra sus mayores ganancias.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (accuracy sobre 150 elementos por idioma, seed 20260927). La columna "Base" corresponde al modelo base sin adaptador, "Adapter" con el adaptador, y "Qwen3-8B zero-shot" se incluye como referencia externa segun la model card.

| Idioma | Base | Adapter | Cambio (puntos) | Veredicto | Qwen3-8B zero-shot |
|---|---:|---:|---:|---|---:|
| de | 0,4533 | 0,4600 | +0,67 | dentro del ruido | 0,587 |
| en | 0,5733 | 0,6200 | +4,67 | dentro del ruido | 0,693 |
| es | 0,5733 | 0,5800 | +0,67 | dentro del ruido | 0,740 |
| fr | 0,6600 | 0,7867 | +12,67 | ganancia (2 SE) | 0,800 |
| hi | 0,7133 | 0,8267 | +11,34 | ganancia (2 SE) | 0,880 |
| pt | 0,5067 | 0,5400 | +3,33 | dentro del ruido | 0,587 |
| ru | 0,6933 | 0,7200 | +2,67 | dentro del ruido | 0,887 |
| zh | 0,5400 | 0,5600 | +2,00 | dentro del ruido | 0,653 |
| Media | 0,5892 | 0,6367 | +4,75 | — | 0,728 |

El cambio agrupado de la familia es de +4,75 puntos, con 2 errores estandar de 3,88 puntos, lo que se califica como ganancia. La model card indica que una celda individual de 150 elementos rara vez supera por si sola los 2 errores estandar y que la decision se toma de forma agrupada. Tambien se publico una comprobacion sobre los ficheros finales: el f32 en modo "merged at load" reproduce exactamente el experimento (0,5892 a 0,6367, +4,75), mientras que el q8_0 con LoRA en tiempo de ejecucion obtiene 0,5892 a 0,6425 (+5,33). Cabe senalar que el model-index marca todos los valores como "verified: false", es decir, no verificados de forma independiente.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA de 3,4 millones de parametros, los requisitos de VRAM vienen determinados principalmente por el modelo base Statim, no por el adaptador.
- El formato de pesos incluye un fichero f32 y un fichero q8_0, lo que permite el despliegue en CPU o en GPU de gama baja segun la cuantizacion elegida.
- No se dispone de datos especificos de VRAM, GPU recomendadas ni de si cabe en GPU de consumo en la informacion proporcionada; no disponible.
- Opciones de despliegue conocidas: motor Statim (statim serve) sobre binario estatico en C++20, con carga de adaptador en tiempo de ejecucion (q8_0) o fusionado en carga (f32). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- No se publican cifras de latencia ni de throughput en la documentacion disponible; no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (media emotion) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| statim-decide-multilingual-base-emotion | LoRA sobre Statim decide | 3,4 M (adaptador) | no disponible | 0,6367 (accuracy media) | statim-weights | HuggingFace (GGUF, safetensors) |
| statim-decide-multilingual-base | Modelo base Statim | no disponible | no disponible | 0,5892 (accuracy media) | statim-weights | HuggingFace |
| Qwen3-8B (zero-shot) | LLM generativo | 8.000 M | no disponible | 0,728 (accuracy media) | no disponible en la informacion | HuggingFace y otros |

La comparacion con Qwen3-8B es la unica referencia externa incluida en la model card, y se realizo en modo zero-shot, mientras que Statim se entreno especificamente para esta categoria. Qwen3-8B supera en exactitud media al adaptador (0,728 frente a 0,6367) pero requiere un modelo generativo de 8.000 millones de parametros, no disponible en la informacion.

## Limitaciones y advertencias

- Los resultados de benchmarks estan marcados como "verified: false" en el model-index, es decir, no han sido verificados de forma independiente.
- Las celdas por idioma se calcularon con solo 150 elementos cada una; la model card reconoce que una celda individual rara vez alcanza significacion estadistica por si sola.
- Los idiomas con peor rendimiento son aleman (0,46), portugues (0,54), chino (0,56) y espanol (0,58), con mejoras dentro del ruido estadistico.
- La licencia statim-weights es una licencia personalizada; es imprescindible revisar el fichero LICENSE-MODEL.md antes de cualquier uso comercial.
- El modelo no genera texto libre: solo produce decisiones tipadas, lo que limita su uso a tareas de clasificacion o puntuacion.
- No se documentan sesgos conocidos, riesgo de alucinacion (no aplica del mismo modo que en un LLM generativo) ni limitaciones de contexto en la informacion disponible.
- La carga del adaptador exige Statim 0.8.0 o posterior y SDK de Python 0.8.3 o posterior; versiones anteriores no son compatibles.
- El fichero f32 se fusiona al cargar mientras que el q8_0 se aplica como LoRA en tiempo de ejecucion, lo que produce ligeras diferencias de exactitud entre ambos modos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beko2210/statim-decide-multilingual-base-emotion
- Modelo base: https://huggingface.co/Beko2210/statim-decide-multilingual-base
- Licencia del modelo: https://huggingface.co/Beko2210/statim-decide-multilingual-base-emotion/blob/main/LICENSE-MODEL.md
- Repositorio del motor Statim en GitHub: https://github.com/BEKO2210/statim
- Baseline de Qwen3-8B (BASELINES.md): https://github.com/BEKO2210/statim/blob/main/docs/BASELINES.md
- Releases del motor Statim: https://github.com/BEKO2210/statim/releases
- Perfil del autor: https://huggingface.co/Beko2210
- Dataset Johnson8187/Chinese_Multi-Emotion_Dialogue_Dataset: https://huggingface.co/datasets/Johnson8187/Chinese_Multi-Emotion_Dialogue_Dataset
- Dataset JusteLeo/French-emotion: https://huggingface.co/datasets/JusteLeo/French-emotion
- Dataset brighter-dataset/BRIGHTER-emotion-categories: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
