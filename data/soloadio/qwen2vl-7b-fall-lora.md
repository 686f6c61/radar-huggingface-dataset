# Soloadio/qwen2vl-7b-fall-lora

## Resumen

Soloadio/qwen2vl-7b-fall-lora es un adaptador LoRA sobre el modelo vision-lenguaje Qwen/Qwen2-VL-7B-Instruct, desarrollado por el usuario Soloadio en el contexto de un proyecto de fin de carrera (CSC490) de deteccion de caidas. El adaptador especializa el modelo base para clasificar clips de camara de 32 fotogramas como "caida" o "no caida", emitiendo una respuesta estructurada en JSON con el veredicto. No se trata de un modelo completo, sino de un conjunto de pesos PEFT de aproximadamente 0,2 GB que debe combinarse con el modelo base de 7 mil millones de parametros.

El interes del artefacto es acotado: demuestra que un ajuste fino ligero (una sola epoca, 371 pasos, unos 55 minutos en una H100) sobre un VLM generalista permite pasar de una precision balanceada del 78-80 % en los conjuntos edf y mcfd del benchmark OmniFall a valores del 93-97 %, con una AUROC cercana a 1,0. Es, por tanto, una referencia util para quien quiera replicar un pipeline de clasificacion binaria de video mediante prompting forzado y lectura de log-probabilidades, mas que un componente listo para produccion.

La model card lo declara explicitamente como prototipo de investigacion: no se ha probado sobre video continuo y no debe usarse como dispositivo de seguridad. La licencia no esta declarada en la informacion disponible, lo que impide asumir derechos de uso comercial sobre el adaptador (el modelo base Qwen2-VL-7B-Instruct tiene su propia licencia, que habria que consultar por separado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen2-VL-7B-Instruct; adaptador aplicado solo al modelo de lenguaje, torre de vision congelada |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB en el repositorio; el modelo base tiene 7 000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2-VL-7B-Instruct) |
| Tipos de cuantizacion | No disponible; el ejemplo de carga usa bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rank / alpha / dropout del LoRA | 16 / 32 / 0,05 |
| Modulos adaptados | q, k, v, o, gate, up, down |
| Resolucion de entrada | `longest_edge` = 78 000 pixeles por fotograma (debe coincidir con el entrenamiento) |
| Version de librerias probada | transformers 5.18, peft 0.19.1 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-7B-Instruct, un transformer multimodal que procesa imagenes o secuencias de fotogramas junto con texto. El LoRA se inserta unicamente en las proyecciones del modelo de lenguaje (q, k, v, o, gate, up, down) con rango 16, alpha 32 y dropout 0,05; la torre de vision permanece congelada. La entrada consiste en 32 fotogramas por clip, con el procesador de imagen configurado a 78 000 pixeles de lado mayor por fotograma, un detalle critico porque el autor advierte que debe coincidir con el usado en entrenamiento.

Los datos de entrenamiento proceden de los splits de train de OmniFall correspondientes a los subconjuntos edf, mcfd y up_fall: 2967 clips de camara de 32 fotogramas cada uno. El entrenamiento uso AdamW con tasa de aprendizaje 1e-4 y decaimiento coseno, 8 clips por paso, una sola epoca (371 pasos) y aproximadamente 55 minutos en una GPU H100. La funcion de perdida es entropia cruzada sobre los tokens de la etiqueta tras un prefijo forzado `{"verdict": "`, y descendio de 0,21 a 0,09. La inferencia se realiza calculando P(caida) a partir de las log-probabilidades de las dos continuaciones de etiqueta posibles.

## Capacidades

- Clasificacion binaria de clips de video cortos (32 fotogramas) en las categorias caida / no caida.
- Generacion de una respuesta estructurada en JSON con la clave `verdict`, gracias al prefijo forzado durante el entrenamiento.
- Puntuacion probabilistica: el pipeline asociado (`run_probs_qwen.py`) extrae P(fall) de las log-probabilidades, lo que permite umbralizar en lugar de depender solo de la etiqueta generada.
- Hereda del modelo base la capacidad general de comprension imagen-texto, aunque el ajuste esta orientado exclusivamente a la tarea de deteccion de caidas.
- No se documenta soporte de tool calling, agentes, modo thinking ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Monitorizacion de personas mayores en entornos controlados: el adaptador puntua clips cortos de camara fija y devuelve una probabilidad de caida que un sistema de alertas podria usar como senal de triaje, siempre con revision humana.
- Investigacion academica en deteccion de caidas: sirve como linea base reproducible sobre OmniFall (edf, mcfd, up_fall) para comparar tecnicas de ajuste ligero de VLMs frente a clasificadores de video dedicados.
- Prototipado de pipelines de vision-lenguaje para video: el codigo de referencia muestra como forzar un prefijo de respuesta y leer log-probabilidades de etiquetas, patron reutilizable en otras tareas de clasificacion binaria con VLMs.
- Evaluacion de tecnicas PEFT: al ser un LoRA de rango 16 entrenado en una sola epoca, es un caso de estudio util para medir cuanto rendimiento se obtiene con un coste de computo minimo (55 minutos en H100).
- Analisis retrospectivo de grabaciones: procesamiento por lotes de clips delimitados por eventos etiquetados para auditar falsos positivos y falsos negativos de un sistema de videovigilancia existente.
- Docencia y experimentacion: ejemplo completo y abierto de extremo a extremo (datos, entrenamiento, script de inferencia y metricas) para cursos de aprendizaje automatico aplicado a vision.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test, con una decision por evento (P(fall) promediada sobre las camaras del evento) y umbral 0,5:

| Dataset | Precision balanceada | Recall de caida | Precision | AUROC | Modelo base sin LoRA (precision balanceada) |
|---|---|---|---|---|---|
| edf | 96,7 % | 100 % | 81,8 % | 0,993 | 78,3 % |
| mcfd | 93,8 % | 100 % | 81,8 % | 1,000 | 80,2 % |
| up_fall | 95,2 % | 100 % | 87,5 % | 0,990 | 95,8 % |

El autor advierte que los conjuntos de test de edf y mcfd son pequenos (39 y 25 eventos), por lo que un solo evento desplaza la metrica 3-4 puntos; que en mcfd todos los splits comparten el mismo actor y la misma habitacion; y que los clips estan cortados en los limites etiquetados de cada evento. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB; el coste real lo determina el modelo base Qwen2-VL-7B-Instruct.
- Inferencia en bfloat16 del modelo base: se necesita una GPU con al menos 16-18 GB de VRAM para los pesos, mas el espacio de activaciones y el procesamiento de 32 fotogramas a 78 000 pixeles de lado mayor, lo que en la practica exige GPUs de 24 GB o mas.
- GPU recomendadas: H100 (usada por el autor para entrenar en 55 minutos), A100 40/80 GB; en el extremo consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) como minimo.
- No se documentan opciones de cuantizacion ni despliegue con vLLM, llama.cpp, Ollama o TGI para este adaptador; la carga de referencia usa `transformers` + `peft` con `merge_and_unload()` y `device_map="cuda"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soloadio/qwen2vl-7b-fall-lora | LoRA sobre base de 7 000 M | No disponible | Clasificacion binaria de caidas con VLM | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2-VL-7B-Instruct (base sin ajuste) | 7 000 M | No disponible en la informacion | VLM generalista | No disponible en la informacion | Hugging Face |
| Clasificadores de video dedicados (p. ej. arquitecturas 3D CNN o VideoMAE) | Variable | No aplica | Clasificacion de video supervisada | Variable | Variable |

La comparacion mas directa es contra el propio modelo base sin LoRA: el adaptador mejora la precision balanceada en edf (78,3 % a 96,7 %) y mcfd (80,2 % a 93,8 %), mientras que en up_fall la mejora es marginal (95,8 % a 95,2 %, ligeramente inferior). No se dispone de datos para comparar con clasificadores de video especializados en deteccion de caidas.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no se ha probado sobre video continuo y que no es un dispositivo de seguridad.
- Conjuntos de evaluacion muy pequenos (39 y 25 eventos en edf y mcfd), con alta varianza en las metricas.
- Riesgo de fuga de identidad en mcfd: todos los splits comparten el mismo actor y la misma habitacion, lo que puede inflar el rendimiento.
- Los clips se cortan en los limites etiquetados de evento, una condicion irreal en un despliegue sobre video en directo.
- Alta precision pero recall perfecto a costa de precision del 81,8-87,5 %: implica una tasa notable de falsos positivos si se usa como alerta automatica.
- Dependencia estricta de la configuracion del procesador (`longest_edge` = 78 000) y del prefijo de respuesta forzado; cualquier desviacion invalida los resultados.
- Licencia no declarada: no puede asumirse uso comercial del adaptador; la licencia del modelo base debe verificarse por separado.
- Idiomas soportados no documentados; el adaptador solo se ha validado para la tarea de clasificacion visual descrita.
- Sesgos conocidos: no documentados en la informacion disponible, aunque al entrenar solo con tres subconjuntos de OmniFall es probable una baja generalizacion a otras camaras, angulos y poblaciones.
- Riesgo de alucinacion inherente al modelo base si se usa fuera del pipeline previsto (prompt y prefijo forzado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soloadio/qwen2vl-7b-fall-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- Codigo del proyecto (rama solomon/qwen): https://github.com/soloadio/CSC490-Fall-Detection-Capstone-Project/tree/solomon/qwen/research/qwen
- Script de puntuacion con Gemma (prompt de referencia): https://github.com/soloadio/CSC490-Fall-Detection-Capstone-Project/tree/solomon/qwen/research/gemma/gemma_binary_scoring.py
- Script de inferencia con el adaptador: https://github.com/soloadio/CSC490-Fall-Detection-Capstone-Project/tree/solomon/qwen/research/qwen/run_probs_qwen.py
