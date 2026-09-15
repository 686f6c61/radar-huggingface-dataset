# francescortu/detectdistill-v2-lora-students

## Resumen

DetectDistill v2 (run_v7) no es un modelo generativo al uso, sino un artefacto de investigacion compuesto por once adaptadores LoRA entrenados para estudiar hasta que punto la destilacion desde un LLM profesor sigue siendo detectable cuando las trazas del profesor se parafrasean, y si mezclar dos profesores oculta a alguno de ellos. El repositorio, publicado por el usuario francescortu bajo licencia Apache 2.0 y con un tamano de 5,7 GB, se apoya en tres modelos base distintos: allenai/Olmo-3-7B-Think, microsoft/Phi-4-reasoning y Qwen/Qwen3-32B. Cada adaptador es un "estudiante" ajustado sobre trazas de razonamiento de uno o dos profesores (GLM-4.5, gpt-oss-120b y Gemma-4) mediante LoRA mas self-replay.

La relevancia del trabajo es metodologica: proporciona una comparacion controlada en la que tres familias de estudiantes reciben exactamente los mismos profesores, la misma construccion de datos y la misma receta de entrenamiento, de modo que las diferencias observadas se atribuyen al estudiante y no a los datos. Los resultados muestran que la identificacion de un profesor a partir de trazas originales funciona en 9 de 9 estudiantes, que el parafraseado de las trazas borra esa senal y que las mezclas de dos profesores no se resuelven nunca (multi_detect = 0 en los cinco casos evaluados).

Es, por tanto, material de referencia para investigacion en procedencia de modelos, forense de LLM y evaluacion de metodos de deteccion de destilacion, no un modelo listo para produccion: se distribuye exclusivamente como adaptadores PEFT y requiere cargar por separado el modelo base correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers decoder-only; no se especifica la arquitectura interna de cada modelo base |
| Parametros totales | No disponible para los adaptadores (rango LoRA r=32). Depende del modelo base: Olmo-3-7B-Think, Phi-4-reasoning y Qwen3-32B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (max_len de entrenamiento y max_model_len del ejemplo de vLLM) |
| Tipos de cuantizacion | No disponible; solo se publican adaptadores sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (adaptadores); la licencia de cada modelo base es independiente |
| Formato de pesos | Safetensors (adaptadores LoRA PEFT); el modelo base se carga en su formato original (por ejemplo, bfloat16) |
| Libreria | peft |
| Tamano del repositorio | 5,7 GB |
| Numero de adaptadores | 11 |
| Configuracion LoRA | r=32, alpha=64, dropout=0.05, target_modules="all-linear" |
| Fecha de creacion / actualizacion | 15 de septiembre de 2026 (creacion y ultima actualizacion registradas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Cada uno de los once adaptadores se entrena con LoRA de rango 32 y alpha 64, dropout 0.05 y modulos objetivo "all-linear", sobre un modelo base congelado en bfloat16 con adaptadores en fp32. La receta es identica para todos: 3 epocas, learning rate 1e-4 con decaimiento coseno y 5 % de warm-up, batch global de 16, longitud maxima de 32.768 tokens y semilla 42. Los ficheros publicados corresponden al adaptador de la epoca 3, junto con su tokenizer y un `eval_epoch3.json` con los veredictos por dominio; en la raiz hay un `manifest.json` con el registro de la campana (identificadores de trabajo, nodos, GPU-horas, perdida en held-out por epoca y notas de advertencia).

La innovacion tecnica del montaje es la construccion de datos con self-replay: el fichero de entrenamiento combina las trazas del profesor con las trazas propias del estudiante que resultan correctas y estan correctamente terminadas sobre los mismos prompts. El objetivo es que el estudiante conserve su comportamiento nativo de parada mientras absorbe el razonamiento del profesor. Los tamanos de dataset por adaptador oscilan entre 5.393 y 6.022 ejemplos. Dos ejecuciones de la familia Qwen3-32B se reanudaron tras una preempcion y una de ellas entreno sus dos ultimas epocas con DDP en 4 GPU; la optimizacion es equivalente (batch global 16 en ambos casos y primera perdida tras la reanudacion coincidente hasta cuatro cifras significativas), pero el `eval_loss` en held-out de esa ejecucion esta en una escala distinta y no debe compararse entre estudiantes. Las metricas generativas no se ven afectadas porque la ruta de evaluacion es vLLM en una sola GPU para todos los estudiantes.

## Capacidades

- Generacion de razonamiento en chain-of-thought sobre dominios de matematicas, codigo y ciencia, heredado de las trazas del profesor y del modelo base.
- Terminacion controlada de la generacion: la receta de self-replay busca preservar la tasa de parada correcta del estudiante nativo, aunque en la familia Olmo esa tasa se degrada de forma marcada.
- Aprendizaje de trazas de profesor concreto: los adaptadores absorben el estilo y la distribucion de las trazas de GLM-4.5, gpt-oss-120b, Gemma-4 o mezclas 50/50 de dos de ellos, lo que permite estudiar la transferencia de comportamiento.
- Servicio en tiempo de ejecucion como adaptador LoRA en vLLM, sin necesidad de fusionar los pesos con el modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el foco es la generacion de trazas de razonamiento.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio; el unico rasgo destacable es la construccion self-replay y el uso como objeto de estudio de deteccion de destilacion.

## Casos de uso

- Investigacion en deteccion de destilacion: los once adaptadores permiten reproducir el experimento completo sobre atribucion de profesor, con un pool de deteccion de 26 miembros y un umbral tau* calibrado sobre 21 unidades nulas.
- Forense de procedencia de modelos: sirven para medir si un modelo derivado sigue siendo atribuible a su profesor cuando las trazas se han parafraseado, escenario habitual en pipelines de destilacion industrial.
- Evaluacion de metodos de deteccion: el repositorio incluye resultados sobre metricas concretas (Jaccard de n-gramas en los primeros 100 tokens, coseno con LLM2Vec, clasificador de n-gramas de caracteres y multi_detect), lo que permite comparar metodos nuevos contra una linea base publicada.
- Estudio del efecto del estudiante en la receta de destilacion: al comparar Olmo-3-7B-Think, Phi-4-reasoning y Qwen3-32B con los mismos profesores, se puede analizar por que Olmo pierde 0,22 de exactitud mientras Phi y Qwen se mantienen mas estables.
- Analisis de mezclas de profesores: los cinco adaptadores entrenados con dos profesores a 50/50 permiten estudiar por que multi_detect es 0 en todos los casos y por que en los pares con Gemma-4 un profesor impostor puntua por encima del real.
- Reproduccion y auditoria de experimentos: el `manifest.json` documenta trabajos, nodos y GPU-horas, util para replicar la campana o auditar su coste computacional.
- Formacion y docencia: como ejemplo practico de entrenamiento con PEFT, self-replay y despliegue de adaptadores en vLLM con `enable_lora` y `max_lora_rank=32`.
- Pruebas de robustez de politicas de licencias y procedencia: dado que cada adaptador hereda el comportamiento de un profesor concreto, sirve para experimentar con verificacion de origen de pesos en entornos de cumplimiento.

## Benchmarks y rendimiento

Resultados declarados en la epoca 3 sobre 300 prompts en held-out (matematicas, codigo y ciencia). `acc_all` es exactitud de respuesta y `stop_rate` la fraccion de generaciones que terminan correctamente. Un estudiante se marca como degradado si `stop_rate < 0,5` o si su exactitud cae mas de 0,20 respecto a su propio modelo base.

| Adaptador | Modelo base | Profesor(es) | Ejemplos | acc_all | stop_rate | Base acc / stop | Degradado |
|---|---|---|---|---|---|---|---|
| olmo3-7b_from_glm52reph_lora_replay | allenai/Olmo-3-7B-Think | GLM-4.5 (parafraseado) | 5.558 | 0,290 | 0,547 | 0,510 / 0,917 | si |
| olmo3-7b_from_gptossreph_lora_replay | allenai/Olmo-3-7B-Think | gpt-oss-120b (parafraseado) | 5.410 | 0,317 | 0,507 | 0,510 / 0,917 | no |
| olmo3-7b_from_mix-gptoss-gemma4_lora_replay | allenai/Olmo-3-7B-Think | gpt-oss-120b + Gemma-4 (50/50) | 5.434 | 0,270 | 0,540 | 0,510 / 0,917 | si |
| olmo3-7b_from_mix-gptoss-glm52_lora_replay | allenai/Olmo-3-7B-Think | gpt-oss-120b + GLM-4.5 (50/50) | 5.393 | 0,280 | 0,477 | 0,510 / 0,917 | si |
| phi4-reasoning_from_glm52reph_lora_replay | microsoft/Phi-4-reasoning | GLM-4.5 (parafraseado) | 5.839 | 0,467 | 0,717 | 0,567 / 0,877 | no |
| phi4-reasoning_from_gptossreph_lora_replay | microsoft/Phi-4-reasoning | gpt-oss-120b (parafraseado) | 5.691 | 0,523 | 0,827 | 0,567 / 0,877 | no |
| phi4-reasoning_from_mix-gemma4-glm52_lora_replay | microsoft/Phi-4-reasoning | Gemma-4 + GLM-4.5 (50/50) | 5.864 | 0,397 | 0,810 | 0,567 / 0,877 | no |
| phi4-reasoning_from_mix-gptoss-gemma4_lora_replay | microsoft/Phi-4-reasoning | gpt-oss-120b + Gemma-4 (50/50) | 5.715 | 0,503 | 0,860 | 0,567 / 0,877 | no |
| phi4-reasoning_from_mix-gptoss-glm52_lora_replay | microsoft/Phi-4-reasoning | gpt-oss-120b + GLM-4.5 (50/50) | 5.674 | 0,423 | 0,700 | 0,567 / 0,877 | no |
| qwen3-32b_from_glm52reph_lora_replay | Qwen/Qwen3-32B | GLM-4.5 (parafraseado) | 6.022 | 0,483 | 0,793 | 0,603 / 0,987 | no |
| qwen3-32b_from_gptossreph_lora_replay | Qwen/Qwen3-32B | gpt-oss-120b (parafraseado) | 5.874 | 0,443 | 0,783 | 0,603 / 0,987 | no |

Resultados de deteccion (pool de 26 miembros, tau* calibrado sobre 21 unidades nulas, tasa de falsas llamadas leave-one-out del 0,2 %):

| Escenario | Resultado |
|---|---|
| Identificacion de profesor con trazas originales | 9/9 estudiantes, todas las metricas salvo una |
| GLM-4.5 parafraseado, Jaccard de n-gramas en primeros 100 tokens | 0/3 (PS 0,518) |
| GLM-4.5 parafraseado, coseno con LLM2Vec | 0/3 (PS 0,501, equivalente a azar) |
| Trazas originales, mismas metricas | 3/3 |
| gpt-oss-120b parafraseado | Conserva metricas lexicas pero pierde el clasificador de n-gramas de caracteres (d 0,205 -> 0,025) |
| Mezclas de dos profesores | multi_detect = 0 en los cinco casos, en todas las metricas; en los pares con Gemma-4 un profesor impostor supera al real |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 5,7 GB e incluye los once adaptadores y sus tokenizers; los pesos del modelo base se descargan aparte.
- VRAM de inferencia: depende enteramente del modelo base elegido. Estimaciones orientativas con los pesos en bfloat16, sin contar la cache KV para 32.768 tokens: aproximadamente 15-17 GB para un base de 7B (Olmo-3-7B-Think) y 64-70 GB para un base de 32B (Qwen3-32B). El tamano de Phi-4-reasoning no se especifica en la informacion disponible.
- GPU recomendadas: para Qwen3-32B en bfloat16, una A100 80 GB o una H100; alternativamente varias GPU con tensor parallel. Para Olmo-3-7B-Think, una RTX 4090 de 24 GB o superior es suficiente en bfloat16.
- Cabe en GPU de consumo: si, con los estudiantes de 7B en bfloat16 en tarjetas de 24 GB, y con margen amplio si se fusiona el adaptador y se cuantiza el resultado a 4 bits (aproximadamente 5 GB de pesos para un base de 7B).
- Despliegue: la ruta documentada es vLLM con soporte LoRA en tiempo de ejecucion (`enable_lora=True`, `max_lora_rank=32`, `max_model_len=32768`) y `LoRARequest`. Tambien es posible cargar con `transformers` + `peft` mediante `PeftModel.from_pretrained` indicando el subfolder `students/<run_name>`. La conversion a GGUF para llama.cpp u Ollama exigiria fusionar previamente el adaptador con el modelo base; no se documenta en el repositorio.
- Latencia y throughput: no disponibles. El unico dato de computo es que la evaluacion se realizo con vLLM en una sola GPU para todos los estudiantes y que una ejecucion de Qwen3-32B entreno dos epocas con DDP en 4 GPU.

## Comparativa con modelos similares

La comparacion natural dentro de este repositorio es entre las tres familias de estudiantes, que comparten profesores, datos y receta:

| Familia de estudiante | Parametros del base | acc_all base -> tras destilacion | stop_rate base -> tras destilacion | Degradacion |
|---|---|---|---|---|
| Olmo-3-7B-Think | 7B | 0,510 -> 0,270-0,317 | 0,917 -> 0,477-0,547 | Perdida de 0,22 de exactitud y colapso de la parada; 3 de 4 adaptadores degradados |
| Phi-4-reasoning | No disponible en la informacion | 0,567 -> 0,397-0,523 | 0,877 -> 0,700-0,860 | Perdida de 0,10 de exactitud; ningun adaptador degradado |
| Qwen3-32B | 32B | 0,603 -> 0,443-0,483 | 0,987 -> 0,783-0,793 | Perdida de 0,12-0,16 de exactitud y 0,20 de tasa de parada; ningun adaptador degradado |

Frente a alternativas externas de la misma categoria (por ejemplo, adaptadores LoRA de razonamiento publicados sobre Qwen3 o Phi-4), no hay datos comparables en la informacion disponible, porque este repositorio no persigue maximizar exactitud sino servir de material experimental sobre deteccion de destilacion.

## Limitaciones y advertencias

- No son modelos fusionados: son adaptadores que requieren cargar el modelo base correspondiente. Usarlos con un base distinto al indicado invalida los resultados.
- La familia Olmo-3-7B-Think se degrada de forma sistematica: pierde 0,22 de exactitud y cae a una tasa de parada media de 0,52, con tres de cuatro adaptadores marcados como degradados. No es apta para uso generativo en produccion.
- Las tasas de parada de todos los estudiantes quedan por debajo de las de sus bases (por ejemplo, Qwen3-32B pasa de 0,987 a 0,783-0,793), lo que implica generaciones que no terminan correctamente en una fraccion apreciable de casos.
- La exactitud cae en todos los adaptadores respecto a su base; el mejor resultado de la campana es 0,523 (Phi-4-reasoning con gpt-oss-120b parafraseado) frente a 0,567 de su base.
- El `eval_loss` en held-out de qwen3-32b_from_gptossreph_lora_replay esta en una escala distinta por la reanudacion y el DDP, y no debe compararse entre estudiantes. Solo las metricas generativas son homogeneas.
- La evaluacion se limita a 300 prompts en held-out y a una unica semilla (42), por lo que las diferencias pequenas entre adaptadores pueden no ser significativas.
- Los resultados de deteccion se obtuvieron con un pool de 26 miembros y un umbral calibrado sobre 21 unidades nulas; extrapolar la tasa de falsas llamadas del 0,2 % a otros pools no esta justificado.
- Riesgo de alucinacion: no se evalua ni se mitiga de forma especifica; al ser estudiantes de razonamiento sobre trazas parafraseadas, la fidelidad factual no es un objetivo del entrenamiento.
- Idiomas soportados: no disponible. No hay garantia de comportamiento multilingue mas alla del que herede el modelo base.
- Licencia: los adaptadores son Apache 2.0, pero cada modelo base conserva su propia licencia y condiciones de uso comercial; hay que verificarlas por separado antes de cualquier despliegue.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion independiente de la comunidad.
- No se publican variantes cuantizadas ni instrucciones para generar formatos GGUF; el uso en llama.cpp u Ollama requeriria un proceso de fusion y conversion no documentado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/francescortu/detectdistill-v2-lora-students
- Modelo base allenai/Olmo-3-7B-Think: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo base microsoft/Phi-4-reasoning: https://huggingface.co/microsoft/Phi-4-reasoning
- Modelo base Qwen/Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a documentacion sobre operadores de incremento y decremento en C y C++ (GeeksforGeeks, LearnCpp, Wikipedia, cppreference) y no guardan relacion con este repositorio.
