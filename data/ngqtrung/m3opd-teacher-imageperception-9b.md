# ngqtrung/M3OPD-Teacher-ImagePerception-9B

## Resumen

M3OPD-Teacher-ImagePerception-9B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario ngqtrung como parte de la receta M3OPD-Reasoner. Se trata de un ajuste fino del modelo base Qwen3.5-9B, orientado especificamente a la percepcion de imagenes dentro de un pipeline de destilacion multi-profesor (MOPD, Multi-Teacher On-Policy Distillation). El modelo actua como "profesor de dominio": genera trayectorias de razonamiento de alta calidad sobre prompts de percepcion visual que posteriormente se destilan en un modelo estudiante.

El entrenamiento combina una fase de SFT (supervised fine-tuning) sobre el dataset M3OPD-SFT-1.35M con una fase de aprendizaje por refuerzo mediante GSPO (Group Sequence Policy Optimization) sobre la carpeta `image_perception` del dataset M3OPD-RL-193K. El checkpoint publicado corresponde al paso 220 del run de GSPO, identificado por el autor como el mejor checkpoint evaluado.

Con 9.409.813.744 parametros totales y licencia Apache 2.0, el modelo hereda la arquitectura, tokenizer, processor y plantilla de chat de Qwen3.5-9B, por lo que es desplegable en Transformers, vLLM y SGLang sin adaptaciones. Su relevancia radica en que forma parte de una receta abierta de destilacion on-policy, un enfoque relativamente reciente para transferir capacidades de razonamiento multimodal desde profesores especializados a estudiantes mas pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 40960`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza integramente la arquitectura de Qwen3.5-9B, incluyendo su tokenizer, processor y chat template, lo que implica un transformer multimodal con capacidad de procesar entradas de imagen y texto. No se detalla en la informacion disponible la configuracion interna de capas, atencion ni el codificador visual empleado.

El proceso de entrenamiento consta de dos etapas. Primero, un calentamiento SFT sobre el dataset M3OPD-SFT-1.35M. Despues, un ajuste con aprendizaje por refuerzo mediante GSPO sobre los prompts de percepcion de imagen del dataset M3OPD-RL-193K (carpeta `image_perception`). El checkpoint publicado es el paso 220 del run de GSPO, seleccionado por ser el mejor checkpoint evaluado. El modelo se entrena y evalua con la plantilla de chat nativa de Qwen3.5, con modo thinking activado, sin system prompt y con una linea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). Su funcion dentro de la receta es servir como profesor de dominio cuyas salidas se destilan en el estudiante mediante MOPD.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y texto.
- Percepcion de imagen especializada, optimizada mediante RL sobre prompts de `image_perception`.
- Modo thinking activado por defecto en el formato de entrenamiento, con salida de razonamiento antes de la respuesta final.
- Respuestas con formato controlado mediante instrucciones de formato (por ejemplo, encerrar la respuesta final en `\boxed{}`).
- Conversacion multi-turno gracias a la plantilla de chat de Qwen3.5.
- Destilacion de conocimiento: puede emplearse como profesor para generar trayectorias de alta calidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de datos de destilacion: el modelo puede emplearse como profesor para producir trayectorias de razonamiento sobre imagenes que despues se usan para entrenar un modelo estudiante mas pequeno mediante MOPD, que es precisamente el proposito para el que fue entrenado.
- Anotacion de razonamiento visual a escala: dado un conjunto de imagenes con preguntas, el modelo genera cadenas de razonamiento con respuesta final formateada, utiles para construir datasets de SFT de alta calidad.
- Evaluacion de pipelines de percepcion visual: al ser el mejor checkpoint evaluado del run de GSPO, sirve como referencia de calidad para comparar las salidas del estudiante destilado.
- Investigacion en RL para multimodalidad: el checkpoint permite reproducir o extender experimentos de GSPO sobre prompts de percepcion de imagen, partiendo de un modelo ya entrenado en esa tarea.
- Prototipado de asistentes visuales: con la plantilla de chat de Qwen3.5 y modo thinking, puede integrarse en demos de pregunta-respuesta sobre imagenes desplegadas con vLLM o SGLang.
- Analisis de imagenes con respuesta justificada: el formato de razonamiento previo a la respuesta final resulta adecuado para tareas donde se requiere trazabilidad del razonamiento, como revision de contenido visual o soporte a decisiones documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 9.409.813.744 parametros en safetensors (repo de 18,8 GB), la inferencia en precision de 16 bits requiere del orden de 19 GB solo para pesos, mas memoria para el codificador visual, cache KV y overhead del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar viabilidad en GPU profesionales con 24 GB o mas (A100, H100, L40S) y en consumer de gama alta con 24 GB (RTX 4090), aunque el dato no esta confirmado por el autor.
- Cabe en consumer GPU: no confirmado; previsiblemente en RTX 4090 (24 GB) en 16 bits con contexto moderado, y en GPUs de 16 GB solo con cuantizacion, para la cual no se documentan formatos.
- Opciones de despliegue: Transformers, vLLM y SGLang, segun la model card. Ejemplo oficial: `vllm serve ngqtrung/M3OPD-Teacher-ImagePerception-9B --max-model-len 40960`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| M3OPD-Teacher-ImagePerception-9B | 9.409.813.744 | no disponible | Apache 2.0 | Hugging Face | Profesor de dominio para percepcion de imagen en la receta M3OPD |
| Qwen3.5-9B | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base; misma arquitectura, tokenizer y chat template |
| Video-MOPD-8B | ~8B (segun nombre) | no disponible | no disponible | no disponible | Modelo abierto para comprension de video entrenado con RL y destilacion multi-profesor; dominio distinto (video frente a imagen) |

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio de una receta de destilacion (paso 220 de GSPO), no un modelo final orientado a producto.
- Especializado en percepcion de imagen: su rendimiento fuera del dominio `image_perception` puede degradarse respecto al modelo base.
- Formato de entrenamiento especifico: se entreno con modo thinking activado, sin system prompt y con una linea de formato de respuesta; otros formatos de prompt pueden reducir la calidad de salida.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Qwen3.5-9B, hereda los sesgos del modelo base y de los datasets M3OPD-SFT-1.35M y M3OPD-RL-193K.
- Riesgo de alucinacion: no cuantificado; el modo thinking y la generacion de razonamiento no eliminan el riesgo de respuestas incorrectas sobre el contenido de la imagen.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y los idiomas soportados no se especifican.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documenta evaluaciones de seguridad para produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Teacher-ImagePerception-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset M3OPD-SFT-1.35M: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset M3OPD-RL-193K: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Coleccion M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Paper Video-MOPD (referencia relacionada): https://arxiv.org/abs/2609.09300
- Resumen de Video-MOPD: https://www.emergentmind.com/papers/2609.09300
