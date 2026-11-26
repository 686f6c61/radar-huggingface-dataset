# Sadanie/Inkling-2-Mini-Memory-Sparse-MoE

## Resumen

Inkling-2-Mini-Memory-Sparse-MoE es un adaptador para el modelo base thinkingmachines/Inkling-2-Mini, publicado por Sadanie bajo licencia Apache 2.0. El objetivo no es mejorar el modelo, sino hacerlo ejecutable en hardware de consumo: el modelo base ocupa 17,3 GB en cuantizacion de 4 bits y no cabe en un Mac de 16 GB de memoria unificada. Esta variante reduce el pico de memoria a unos 9 GB manteniendo una calidad cercana a la del modelo completo, con una perdida de entre 2,3 y 2,5 puntos en pruebas de codigo, matematicas y conocimiento.

La tecnica empleada se denomina Memory-Sparse MoE (MS-MoE). Un modelo de mezcla de expertos es eficiente en computo (cada token pasa solo por 8 de 128 expertos por capa), pero ineficiente en memoria, porque los 128 expertos deben residir en RAM. MS-MoE parte de la observacion de que una respuesta concreta utiliza un subconjunto pequeno de expertos: un modelo predictor ligero, el "receptionist", lee la pregunta y selecciona 64 expertos por capa, que son los unicos que se cargan. El router y un adaptador LoRA de atencion se ajustan finamente para trabajar con ese equipo reducido, mientras que los pesos de los expertos permanecen intactos.

El resultado es un paquete de unos 1,0 GB de artefactos adicionales (predictor, router, LoRA, embeddings) que se combina con la conversion MLX de 4 bits del modelo base. La relevancia practica es directa: permite ejecutar un MoE de 128 expertos por capa en portatiles Apple Silicon de gama media, un escenario en el que hasta ahora este tipo de arquitecturas quedaba fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con adaptacion Memory-Sparse MoE (seleccion de 64 de 128 expertos por capa) sobre el modelo base Inkling-2-Mini |
| Parametros totales | no disponible (el modelo base no publica el recuento en la informacion disponible) |
| Parametros activos | 8 de 128 expertos por capa en el modelo base; 64 de 128 expertos cargados en memoria por capa en esta variante |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (base MLX); embeddings en fp16 (embed_f16.npy); LoRA de atencion en rango 16 |
| Idiomas soportados | en (segun la model card; el entrenamiento del predictor incluyo varias lenguas segun el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (receptionist, router, attention_lora), .npy (expert_prior, embed_f16), MLX para el modelo base |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos con 24 capas, 128 expertos por capa y 8 expertos activados por token. Esta variante no modifica los pesos de los expertos: anade tres componentes entrenados. El primero es el receptionist, una red pequena construida sobre Qwen3-Embedding-0.6B combinada con los embeddings de tokens de Inkling, que predice a partir de la pregunta que 64 expertos por capa se van a utilizar. El segundo es un router reajustado para las 24 capas, y el tercero es un LoRA de rango 16 aplicado a las proyecciones de atencion.

El procedimiento de entrenamiento consistio en pasar 18.271 preguntas (codigo, matematicas, ciencia, conversacion general y varios idiomas) por el modelo completo, registrando que expertos utilizaba cada respuesta. El receptionist se entreno para predecir esa seleccion a partir unicamente de la pregunta; sus 64 elecciones por capa cubren aproximadamente el 90 % del uso real de expertos de una respuesta. Despues, router y LoRA se ajustaron durante dos epocas con el equipo restringido a las elecciones del receptionist, usando las salidas del modelo completo como objetivo y manteniendo congelados los expertos. En modo conversacional, cada mensaje nuevo recibe su propia seleccion, mezclada al 50 % con la seleccion acumulada, de forma que solo unos pocos expertos se intercambian entre turnos.

## Capacidades

- Generacion de texto en ingles con el nivel de calidad del modelo base Inkling-2-Mini, incluido razonamiento de varios pasos.
- Generacion de codigo: 89,1 % en MBPP (257 problemas) con decodificacion greedy y esfuerzo de pensamiento 0.
- Razonamiento matematico: 95,3 % en GSM8K (1.319 problemas).
- Conocimiento general: 76,0 % en MMLU (3.000 preguntas).
- Modo conversacional multi-turno mediante `run.py --chat`, con gestion incremental de la seleccion de expertos.
- Verificacion de integridad de la seleccion de expertos mediante `run.py --check`, que compara las elecciones locales con las de referencia (precision esperada en torno al 99 %).
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Desarrollo asistido por IA en portatiles Apple Silicon: un MacBook con 16 GB de memoria unificada puede ejecutar el modelo a unos 9 GB de pico y generar codigo con una calidad cercana al modelo completo (89,1 % en MBPP), lo que permite trabajar sin GPU dedicada.
- Evaluacion de modelos MoE en local: investigadores que necesitan medir el comportamiento de un MoE de 128 expertos por capa sin aprovisionar un servidor con suficiente VRAM pueden reproducir las pruebas del autor en hardware de consumo.
- Prototipado de pipelines de generacion de codigo: el modelo responde a prompts de funciones completas (por ejemplo, comprobar si una palabra es palindromo) con latencia util para iteracion interactiva a unos 10 tokens por segundo en un M1.
- Ensenanza y experimentacion con tecnicas de sparsity: el repositorio expone por separado el predictor, el router y el LoRA, lo que permite estudiar como cambia la seleccion de expertos al variar la pregunta y comparar con las selecciones de referencia mediante `--check`.
- Procesamiento de matematicas de nivel escolar y competicion basica: con 95,3 % en GSM8K, es adecuado para generar y verificar soluciones paso a paso en entornos educativos o de evaluacion automatica.
- Respuestas de conocimiento general en ingles: con 76,0 % en MMLU, sirve para asistentes de consulta o prototipos de QA documental en ingles donde no se requiere el maximo absoluto de precision.
- Experimentos de memoria y rendimiento: el autor documenta 9,0 GB de pico, unos 10 tokens por segundo y unos 20 segundos para cargar los expertos en la primera pregunta, datos utiles para comparar estrategias de carga dinamica frente a mantener todo el MoE en memoria.

## Benchmarks y rendimiento

Resultados publicados por el autor: Inkling 2 Mini con 64 de 128 expertos en memoria, decodificacion greedy, esfuerzo de pensamiento 0.

| Prueba | Modelo completo | Sin fine-tuning | MS-MoE (esta variante) |
|---|---|---|---|
| Codigo, MBPP (257 problemas) | 91,4 % | 73,2 % | 89,1 % |
| Matematicas, GSM8K (1.319 problemas) | 95,4 % | 92,6 % | 95,3 % |
| Conocimiento, MMLU (3.000 preguntas) | 78,0 % | 75,4 % | 76,0 % |

Rendimiento en hardware: MacBook M1 con 16 GB de memoria, 9,0 GB de pico, aproximadamente 10 tokens por segundo y unos 20 segundos para cargar los expertos en la primera pregunta.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 9,0 GB de pico en inferencia, segun medicion del autor en un M1 de 16 GB.
- Disco: unos 20 GB libres, incluyendo el modelo base de 4 bits (17 GB) y los artefactos de este repositorio (1,0 GB).
- GPU recomendadas: exclusivamente Apple Silicon (M1 y posteriores) mediante MLX; el autor indica "Mac only for now (MLX)". No hay soporte documentado para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en Mac con memoria unificada de 16 GB; no se documenta compatibilidad con GPUs NVIDIA de consumo.
- Despliegue: MLX con `mlx==0.32.4` y un commit fijado de mlx-lm (`0c4c99192230f1943dd468d297f0b8a64ae7b7c2`) que anade soporte para Inkling. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 10 tokens por segundo en M1; carga inicial de expertos de unos 20 segundos.
- Requisito de software: cerrar otras aplicaciones pesadas antes de ejecutar; el script comprueba memoria libre y avisa si es insuficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MBPP | GSM8K | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Inkling-2-Mini (completo, 4 bits MLX) | no disponible | no disponible | 91,4 % | 95,4 % | 78,0 % | Apache 2.0 | Hugging Face (mlx-community/Inkling-2-Mini-4bit) |
| Inkling-2-Mini-Memory-Sparse-MoE (esta variante) | no disponible | no disponible | 89,1 % | 95,3 % | 76,0 % | Apache 2.0 | Hugging Face (Sadanie/Inkling-2-Mini-Memory-Sparse-MoE) |
| Inkling-2-Mini con 64 expertos sin fine-tuning | no disponible | no disponible | 73,2 % | 92,6 % | 75,4 % | Apache 2.0 | Configuracion experimental del autor |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en Mac con Apple Silicon mediante MLX; no hay soporte documentado para otras plataformas o backends.
- Requiere versiones y commits fijados de mlx y mlx-lm; otras versiones pueden no incluir soporte para Inkling.
- Necesita unos 20 GB de disco libre y 16 GB de memoria; en equipos con menos memoria el script avisa pero no garantiza el funcionamiento.
- La seleccion de 64 expertos por capa cubre aproximadamente el 90 % del uso real de expertos, por lo que existe una perdida de calidad medible frente al modelo completo (2,3 puntos en MBPP, 0,1 en GSM8K, 2,0 en MMLU).
- El receptionist puede equivocarse en la seleccion de expertos para preguntas atipicas; la verificacion mediante `--check` solo valida la coincidencia con las selecciones de referencia (en torno al 99 %), no la calidad de la respuesta.
- El modelo esta orientado al ingles segun la model card; el rendimiento en otros idiomas no esta cuantificado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo generativo evaluado con 76,0 % en MMLU.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base thinkingmachines/Inkling-2-Mini y de la conversion de 4 bits de mlx-community.
- Los pesos de los expertos no se modifican; cualquier limitacion del modelo base en sesgos o dominios persiste en esta variante.
- No se documentan capacidades de tool calling, agentes, vision o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sadanie/Inkling-2-Mini-Memory-Sparse-MoE
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversion MLX de 4 bits: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- Modelo de embeddings usado por el receptionist: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Articulo tecnico del autor: https://medium.com/@rotteveeladan/mixture-of-experts-models-are-built-wrong-for-laptops-and-local-hardware-9a45165d65d6
- Repositorio mlx-lm (commit con soporte Inkling): https://github.com/ml-explore/mlx-lm/tree/0c4c99192230f1943dd468d297f0b8a64ae7b7c2
