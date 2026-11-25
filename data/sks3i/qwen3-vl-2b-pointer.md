# Sks3i/qwen3-vl-2b-pointer

## Resumen

Qwen3-VL-2B Pointer es un ajuste fino del modelo vision-lenguaje Qwen3-VL-2B-Instruct, desarrollado por el usuario independiente Sks3i, especializado en una tarea muy concreta: responder a la pregunta "¿dónde está X?" devolviendo un único punto en coordenadas normalizadas de la imagen. El modelo emite la respuesta en el formato `<point x="512" y="340">`, con valores enteros entre 0 y 1000 que representan la posición como fracción del ancho y alto de la imagen. Para consultas del tipo "señala todas las X", devuelve una lista con un punto por instancia.

Se trata de un modelo de 2.127.532.032 parámetros (aproximadamente 2B) construido sobre la arquitectura Qwen3-VL, con licencia Apache 2.0 y pesos en safetensors. El autor lo entrenó íntegramente en una única RTX 4090 mediante ajuste supervisado (SFT) seguido de cuatro rondas de GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo. Los datos de entrenamiento provienen de allenai/pixmo-points, wentao-yuan/robopoint-data y lmms-lab/RefCOCO.

Su relevancia radica en que demuestra que un modelo de solo 2B parámetros, entrenado con recursos de consumidor, puede igualar estadísticamente a un Qwen3-VL-32B en cuantización 4-bit en tareas de pointing (localización de objetos mediante un punto), con una latencia mucho menor (unos 90 ms frente a 885 ms por consulta en una RTX 4090). Es un caso práctico de especialización mediante RL sobre un modelo base pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-lenguaje, transformer multimodal) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (vLLM se configura con max_model_len=8192 en el ejemplo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales como AWQ/GPTQ, pero no se confirma para este checkpoint) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagenes y texto. Sobre esa base, el autor aplico ajuste supervisado (SFT) y despues cuatro rondas de GRPO, un algoritmo de aprendizaje por refuerzo que optimiza la politica del modelo comparando respuestas dentro de un grupo. Todo el entrenamiento se realizo en una unica RTX 4090, lo que subraya la eficiencia del enfoque. Los datos de entrenamiento combinan allenai/pixmo-points, wentao-yuan/robopoint-data y lmms-lab/RefCOCO, conjuntos orientados a localizacion de objetos y grounding visual.

La innovacion principal no esta en la arquitectura, sino en la especializacion: el modelo ha sido entrenado para producir un formato de salida muy estricto (puntos en coordenadas normalizadas 0-1000) y para listar multiples instancias cuando la consulta lo pide ("all the X"). El autor documenta el proceso completo, incluidos los aciertos y los errores, en un blog y en repositorios de codigo con las recetas de entrenamiento y evaluacion. La configuracion de generacion publicada usa decodificacion greedy por defecto, a diferencia del modelo base, que muestrea con temperatura 0.7.

## Capacidades

- Localizacion de objetos mediante un unico punto en coordenadas normalizadas (0-1000) sobre la imagen.
- Respuesta a consultas de counting: para "all the X" devuelve una lista con un punto por instancia.
- Razonamiento espacial basico: el modelo puede resolver referencias como "the mug to the left of the kettle".
- Capacidades heredadas del modelo base Qwen3-VL-2B-Instruct (comprension de imagen y texto, conversacion multimodal), aunque el ajuste esta orientado a pointing.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: salida estructurada en formato `<point x="X" y="Y">`, parseable de forma estricta.

## Casos de uso

- Robotica de manipulacion: dado un frame de camara, el modelo localiza el objeto a agarrar y devuelve un punto que el controlador del brazo robotico puede usar como objetivo, gracias a su baja latencia (unos 90 ms en RTX 4090).
- Automatizacion de interfaces graficas (GUI agents): localizar botones, campos o iconos en capturas de pantalla para que un agente automatice clics y formularios.
- Anotacion y etiquetado de datasets: generar puntos de referencia sobre imagenes para acelerar el etiquetado de objetos en pipelines de vision por computador.
- Realidad aumentada: anclar informacion o elementos virtuales a objetos concretos de la escena identificados por el modelo.
- Control de calidad industrial: verificar la presencia y posicion de piezas o defectos en imagenes de linea de produccion.
- Asistencia a personas con discapacidad visual: describir donde se encuentra un objeto solicitado en una imagen capturada por el usuario.
- Busqueda visual y comercio electronico: localizar un producto concreto dentro de una imagen de catalogo o de una foto de usuario.

## Benchmarks y rendimiento

Los resultados proceden de un harness propio del autor (prompt fijo, decodificacion greedy, limite de 64 tokens, parser estricto). El autor advierte que no son comparables con las cifras oficiales de cada benchmark.

| Modelo | RefCOCO val (2.000) | Where2Place (100) | Point-Bench (979) |
|---|---|---|---|
| Qwen3-VL-2B-Instruct, mismo prompt | 80,6 % | 40 % | 48,9 % |
| Qwen3-VL-2B-Instruct, formato nativo | 86,2 % | 44 % | 51,9 % |
| Molmo-7B-D | 89,0 % | 31 % | 56,6 % |
| Qwen3-VL-32B-Instruct (AWQ 4-bit) | 93,2 % | 65 % | 59,0 % |
| Este modelo | 92,1 % | 57 % | 60,9 % |

Point-Bench por categoria:

| | Affordance | Counting | Reasoning | Spatial | Steerable |
|---|---|---|---|---|---|
| Este modelo | 85,9 % | 30,3 % | 66,3 % | 70,3 % | 51,5 % |
| Qwen3-VL-32B (AWQ) | 87,4 % | 15,4 % | 71,0 % | 75,9 % | 45,5 % |

Segun el autor, la diferencia frente al 32B en Point-Bench y RefCOCO no es estadisticamente significativa (McNemar exacto pareado, p = 0,25 y p = 0,12). La ventaja en Point-Bench proviene casi por completo de la categoria de counting, y en parte se debe al limite de 64 tokens que corta las listas JSON mas largas del 32B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2.127.532.032 parametros, en bfloat16 se necesitan aproximadamente 4,3 GB solo para los pesos, mas memoria para el procesador de vision y el KV cache.
- GPU recomendadas: el autor entreno y evaluo en una RTX 4090; cabe en GPUs de consumidor con suficiente VRAM (RTX 3090, 4090, 5090, etc.).
- Cabe en GPU de consumidor: si, con al menos 8-12 GB de VRAM en funcion de la longitud de contexto y el procesamiento de imagen.
- Opciones de despliegue: transformers (probado con la version 5.19, que incluye soporte Qwen3-VL) y vLLM (`vllm serve` con `--max-model-len 8192`).
- Latencia y throughput: mediana de aproximadamente 90 ms por consulta en RefCOCO sobre una RTX 4090 con vLLM, frente a 885 ms del 32B en 4-bit con la misma configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Point-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B Pointer | 2,13B | no disponible | 60,9 % | Apache 2.0 | Hugging Face |
| Qwen3-VL-2B-Instruct | 2B | no disponible | 51,9 % (formato nativo) | Apache 2.0 | Hugging Face |
| Molmo-7B-D | 7B | no disponible | 56,6 % | no disponible en la informacion | Hugging Face |
| Qwen3-VL-32B-Instruct (AWQ 4-bit) | 32B | no disponible | 59,0 % | Apache 2.0 (modelo base) | Hugging Face |

## Limitaciones y advertencias

- Las cifras de benchmarks no son comparables con las publicadas oficialmente: el autor usa su propio prompt, limite de tokens y parser.
- La comparacion con el 32B es un empate estadistico, no una victoria; la ventaja en counting puede deberse en parte al limite de 64 tokens.
- Where2Place es un conjunto pequeno (100 elementos, ±10 puntos de incertidumbre) y un run anterior de GRPO alcanzo el 65 %, superior al 57 % de este checkpoint.
- El modelo esta entrenado y evaluado principalmente en ingles; el soporte multilingue es limitado.
- Riesgo de alucinacion y de producir puntos fuera del objeto o respuestas no parseables; el harness cuenta cualquier respuesta no parseable como fallo.
- Para counting, el prompt sigue diciendo "exactly one point" aunque el modelo fue entrenado para listar todas las instancias de "all the X".
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones y sesgos del modelo base Qwen3-VL-2B-Instruct.
- Requiere una version de transformers con soporte Qwen3-VL (probado con 5.19).

## Enlaces

- Hugging Face: https://huggingface.co/Sks3i/qwen3-vl-2b-pointer
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Blog del autor: https://sabarishks.com/posts/teaching-2b-vlm-to-point-part-1/
- Repositorio de evaluaciones y recetas: https://github.com/sks3i/pointvlm
- Entrenador SFT/GRPO: https://github.com/sks3i/localtrainer
- Dataset PixMo-Points: https://huggingface.co/datasets/allenai/pixmo-points
- Dataset RoboPoint: https://huggingface.co/datasets/wentao-yuan/robopoint-data
- Dataset RefCOCO: https://huggingface.co/datasets/lmms-lab/RefCOCO
