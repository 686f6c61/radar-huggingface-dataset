# ReefNet/reefnet-internvl3.5-8b-lora

## Resumen

ReefNet/reefnet-internvl3.5-8b-lora es un adaptador LoRA (PEFT) construido sobre el modelo vision-lenguaje OpenGVLab/InternVL3_5-8B-HF (revision 741a7d03). Lo desarrolla el equipo del proyecto ReefNet y su proposito es acotado y muy especifico: dado un recorte de 1024x1024 pixeles centrado en un punto anotado de una fotografia de arrecife, identificar el genero de coral duro que aparece en el centro de la imagen, con 39 etiquetas posibles (38 generos mas la familia Fungiidae). El modelo corresponde al sistema reportado en la Tabla 5 del articulo ReefNet (NeurIPS 2026, track Evaluations and Datasets).

No se trata de un modelo de proposito general, sino de un clasificador fino de vision-lenguaje que reutiliza la capacidad multimodal de InternVL3.5-8B y la especializa mediante un ajuste LoRA de rango 8 sobre todas las capas lineales. El repositorio pesa aproximadamente 0,1 GB, lo que confirma que solo se publican los pesos del adaptador y no el modelo base. La relevancia actual esta en el ambito de la biodiversidad marina: el entrenamiento se hizo con el split de alta confianza de ReefNet-1.0 (445.985 recortes de entrenamiento y 9.999 de validacion), un dataset a gran escala de reconocimiento de arrecifes de coral con anotaciones taxonomicamente enriquecidas.

El rendimiento medido es modesto y el propio autor lo presenta como linea base: macro recall del 53,44 % en el conjunto de test within-source de ReefNet y del 32,97 % en el conjunto cross-source de Al-Wajh (mar Rojo), donde el modelo mantiene las 39 clases de salida aunque solo 13 generos esten presentes. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo vision-lenguaje InternVL3.5 (encoder visual + conector + decodificador LLM) |
| Parametros totales | Modelo base: 8B (el adaptador LoRA anade un conjunto reducido de pesos; el repo ocupa 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No especificados para el adaptador (se publica en safetensors, entrenado en bf16); las cuantizaciones disponibles dependen del modelo base |
| Idiomas soportados | No disponible; los prompts de entrenamiento y evaluacion estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre InternVL3.5-8B, un modelo de la familia InternVL de OpenGVLab que combina un codificador visual con un conector y un decodificador de lenguaje. El ajuste se realizo con LLaMA-Factory (commit 589da21d) y la configuracion completa esta en train_config.yaml: LoRA de rango 8 sobre todas las capas lineales, optimizador AdamW, learning rate 5e-5, scheduler coseno, warmup ratio 0,03, precision bf16, batch por dispositivo de 8, sin acumulacion de gradientes, image_max_pixels de 1024x1024 y sin aumento de datos. El software utilizado fue transformers 4.57.1, peft 0.18.1 y torch 2.9.1. La seleccion del modelo se hizo con el split de validacion de ReefNet; Al-Wajh no se uso nunca para entrenamiento, ajuste ni seleccion, de modo que la cifra de Al-Wajh es una medida genuinamente cross-source.

Los datos provienen de ReefNet-1.0, compuesto por recortes de 1024x1024 centrados en cada anotacion puntual. El entrenamiento emplea el split de alta confianza del benchmark (445.985 recortes de entrenamiento y 9.999 de validacion). El objetivo de entrenamiento es una tarea de clasificacion expresada como generacion de texto: el prompt de entrenamiento, validacion y test de ReefNet es exactamente `What is the genus in the center of the image <image>? Answer with one word`, y el objetivo es el nombre del genero. Para el test de Al-Wajh se usa un prompt distinto: `<image>Identify the hard coral genus in this image. Respond with only the genus name.` La decodificacion es greedy (top_k=1) con max_new_tokens=32, y la salida se normaliza (strip y capitalizacion) antes de exigir coincidencia exacta con un genero. La metrica reportada es macro recall (exactitud balanceada), adecuada porque las clases estan fuertemente desbalanceadas.

## Capacidades

- Clasificacion taxonomica fina: identifica el genero de coral duro situado en el centro de un recorte de 1024x1024, sobre un espacio de 39 etiquetas (38 generos mas la familia Fungiidae).
- Comprension de imagen y texto: hereda del modelo base la capacidad de procesar pares imagen-texto y responder en formato conversacional de un solo turno.
- Respuesta de una sola palabra: el formato de salida entrenado es un unico nombre de genero, lo que facilita el parseo automatico en pipelines.
- Generalizacion cross-source limitada: funciona sobre imagenes de otra fuente geografica (Al-Wajh, mar Rojo) manteniendo el espacio completo de 39 clases, aunque con caida acusada de rendimiento.
- Tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; la tarea entrenada es de un solo paso y una sola respuesta.
- Capacidades multilingues: no disponibles; el entrenamiento se hizo con prompts en ingles.
- Modo thinking, vision adicional, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Pre-etiquetado en campañas de anotacion: el modelo puede generar una primera etiqueta de genero para cada recorte de 1024x1024, de modo que los expertos humanos solo revisen o corrijan, reduciendo el coste de anotar grandes volumenes de imagenes de transectos.
- Monitorizacion de arrecifes a partir de fotografia submarina: integrado en el flujo de procesamiento posterior de transectos con cuadrantes, permite obtener la composicion de generos de coral duro por estacion, siempre acompanado de revision experta dado el macro recall del 53,44 %.
- Triaje y control de calidad de datasets: al aplicar el adaptador sobre un conjunto ya etiquetado se pueden detectar discrepancias entre la etiqueta humana y la prediccion, que se envian a revision y ayudan a limpiar el corpus.
- Investigacion en adaptacion de dominio: con una cifra cross-source real (32,97 % en Al-Wajh), sirve como linea base reproducible para estudiar tecnicas de domain adaptation en vision por computador aplicada a biodiversidad marina.
- Robots submarinos y vehiculos ROV/AUV: si se despliega el modelo base mas el adaptador en un equipo de a bordo con GPU, se pueden etiquetar recortes centrados en puntos de interes durante la propia mision, priorizando despues el analisis en tierra.
- Ciencia ciudadana y plataformas de catalogacion: el adaptador puede sugerir el genero a partir de una foto subida por un voluntario, ofreciendo una propuesta automatica que el usuario confirma, con aviso explicito de que se trata de una sugerencia no validada.
- Analisis ecologico de series temporales: al reetiquetar de forma homogenea imagenes historicas de un mismo arrecife con el mismo modelo se reduce la variabilidad entre observadores, lo que facilita comparar composicion taxonomica a lo largo del tiempo.
- Educacion y divulgacion: como demo de clasificacion de corales duros con salida de una palabra, es util en materiales didacticos donde se muestre el estado actual de la automatizacion taxonomica y sus limites.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de macro recall (balanced accuracy) sobre dos conjuntos de test:

| Conjunto de test | Tipo | Etiquetas evaluadas | Recortes | Macro recall (%) |
|---|---|---|---|---|
| ReefNet (within-source) | Dentro de la misma fuente | 39 | 23.043 | 53,44 |
| Al-Wajh, mar Rojo (cross-source) | Fuente distinta | 13 generos presentes, salida de 39 clases | 4.624 | 32,97 |

En el conjunto de Al-Wajh la metrica se promedia sobre los 13 generos presentes y cualquier prediccion fuera de esos 13 cuenta como error, aunque el modelo conserva el espacio completo de 39 clases. Los resultados por muestra estan en el directorio predictions/ del repositorio y pueden recalcularse con tools/recompute_macro_recall.py del repositorio reefnet-mllm. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un adaptador de clasificacion especializada y no de un modelo de proposito general.

## Requisitos de hardware

- Espacio en disco del adaptador: aproximadamente 0,1 GB (solo pesos LoRA en safetensors).
- VRAM para el modelo base en bf16: en torno a 16-18 GB para los 8B parametros, mas el coste de las activaciones al procesar imagenes de 1024x1024, que anaden varios GB adicionales segun el batch.
- VRAM con cuantizacion: aproximadamente 8-10 GB en 8 bits y 5-7 GB en 4 bits (estimaciones orientativas para un modelo de 8B; no hay cifras publicadas para este adaptador concreto).
- GPU recomendadas: la documentacion de InternVL3.5 indica que los modelos de hasta 30B pueden desplegarse en una sola A100; por tanto una A100 40/80 GB cubre comodamente el 8B. Tambien es viable en H100, L40S y, con cuantizacion, en GPUs de consumo.
- GPU de consumo: si, es previsible que quepa en una RTX 4090 (24 GB) en bf16 con batch pequeno y, con cuantizacion de 4 bits, en tarjetas de 8-12 GB, aunque no hay cifras verificadas en la informacion disponible.
- Opciones de despliegue: LMDeploy y vLLM, soportados por el modelo base segun su documentacion oficial; tambien es posible usar transformers con PEFT tal como muestra el ejemplo de la model card. No se especifican soportes de llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de cifras comparativas publicadas en la informacion proporcionada (ni de otros clasificadores de coral sobre el mismo split, ni de baselines del articulo mas alla de la mencion a la Tabla 5). La comparacion mas directa y verificable es contra el propio modelo base sin el adaptador, para el que tampoco se ofrecen numeros en esta informacion.

| Modelo | Parametros | Contexto | Rendimiento en ReefNet test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReefNet/reefnet-internvl3.5-8b-lora | 8B (base) + adaptador LoRA r=8 | no disponible | 53,44 % macro recall (39 clases) | Apache 2.0 | HuggingFace, adaptador PEFT |
| OpenGVLab/InternVL3_5-8B-HF (base, sin ajustar) | 8B | no disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de arrecife | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento limitado: un macro recall del 53,44 % within-source implica que casi la mitad de las predicciones por clase son incorrectas; no es apto para uso autonomo sin supervision experta.
- Caida severa en dominio cruzado: el 32,97 % en Al-Wajh evidencia un problema importante de generalizacion a nuevas condiciones de imagen, camara o region geografica.
- Requiere un recorte centrado: la entrada esperada es un recorte de 1024x1024 con el coral objetivo en el centro; imagenes completas o sujetos descentrados degradan el resultado.
- Sensibilidad al prompt: el entrenamiento uso el token de imagen dentro del texto del prompt, mientras que la plantilla de chat lo inserta al principio. La propia model card advierte de esta discrepancia y ofrece un ejemplo de uso; conviene respetar los prompts exactos documentados para train/val/ReefNet y para Al-Wajh.
- Salida restringida a 39 etiquetas: cualquier coral fuera de ese conjunto taxonomico no tiene una clase valida; el modelo puede forzar una etiqueta incorrecta en lugar de abstenerse.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto que no coincida con ningun genero valido; la model card indica que la salida se normaliza y debe coincidir exactamente con un genero, de modo que es necesario filtrar respuestas invalidas.
- Idiomas: no hay evidencia de soporte multilingue; los prompts estan en ingles.
- Sesgos: no hay un analisis de sesgos publicado en la informacion disponible; es previsible un sesgo hacia los generos y las condiciones de imagen mejor representados en ReefNet-1.0 y hacia las fuentes geograficas dominantes del dataset.
- Licencia: Apache 2.0, por lo que el uso comercial es posible en principio, pero conviene verificar las condiciones del modelo base y de las anotaciones del dataset ReefNet-1.0, no detalladas aqui.
- Ambito de uso muy estrecho: no es un modelo de proposito general; emplearlo para tareas distintas de la clasificacion de genero de coral duro no esta respaldado por el entrenamiento.
- Revisiones fijadas: el ejemplo oficial fija el base model a la revision 741a7d03020411e666c6109218ab71e08151ef86; usar otra revision puede alterar el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReefNet/reefnet-internvl3.5-8b-lora
- Modelo base InternVL3.5-8B: https://huggingface.co/OpenGVLab/InternVL3_5-8B-HF
- Version alternativa del base: https://huggingface.co/OpenGVLab/InternVL3_5-8B
- Dataset ReefNet-1.0: https://huggingface.co/datasets/ReefNet/ReefNet-1.0
- Organizacion ReefNet en HuggingFace: https://huggingface.co/ReefNet/models
- Pagina del proyecto ReefNet: https://reefnet-project.github.io/reefnet-2025/
- Repositorio de la pagina del proyecto: https://github.com/ReefNet-Project/reefnet-project.github.io
- Repositorio InternVL: https://github.com/OpenGVLab/InternVL
- LLaMA-Factory (herramienta de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Articulo: Felemban et al., "ReefNet: A Large-Scale Dataset and Benchmark for Fine-Grained Coral Reef Recognition", NeurIPS 2026, Evaluations and Datasets Track (referencia BibTeX en la model card; sin URL directa en la informacion disponible).
