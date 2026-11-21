# kushasareen/qwen35-9b-ft-cur3-150

## Resumen

kushasareen/qwen35-9b-ft-cur3-150 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario kushasareen y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint derivado de un proceso de aprendizaje por refuerzo (reinforcement learning) de 150 pasos de optimizacion, orientado a tareas de tipo image-text-to-text segun las etiquetas del repositorio. El modelo conserva la arquitectura y el tamano del modelo base: aproximadamente 9.400 millones de parametros (9.409.813.744 exactos segun los pesos en safetensors) y un repositorio de 18,8 GB.

El interes de esta ficha es doble. Por un lado, documenta un ejemplo tipico de fine-tune comunitario sobre un modelo multimodal de la familia Qwen 3.5, con un pipeline declarado de reinforcement learning. Por otro, advierte de que la model card es extremadamente escasa: no incluye datos de entrenamiento, hiperparametros, benchmarks ni idiomas soportados, por lo que muchas especificaciones deben marcarse como no disponibles. Es relevante ahora porque la familia Qwen 3.5 es una de las mas utilizadas como base para ajustes experimentales, y este checkpoint ilustra el estado habitual de muchos fine-tunes publicados sin documentacion tecnica detallada.

La informacion disponible no permite confirmar el contexto maximo, los tipos de cuantizacion ni el rendimiento comparado. Cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre el modelo base y sobre este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-9B, del que hereda la arquitectura. Segun las etiquetas del repositorio, el pipeline es de reinforcement learning y el modelo esta orientado a tareas image-text-to-text, lo que sugiere que el modelo base incorpora un codificador visual y un decodificador de lenguaje, aunque la model card no detalla la composicion exacta de capas, atencion ni el mecanismo de fusion multimodal.

El entrenamiento consistio en 150 pasos de optimizacion mediante aprendizaje por refuerzo, segun la descripcion del autor. No se especifican el dataset, la funcion de recompensa, el algoritmo de RL (PPO, GRPO u otro), el numero de tokens vistos, ni si hubo etapas previas de SFT. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones especificas tras el fine-tune.
- Procesamiento image-text-to-text: la etiqueta del repositorio indica soporte de entrada de imagen y texto, aunque no se detalla la resolucion, el numero de imagenes por prompt ni el formato admitido.
- Aprendizaje por refuerzo: el checkpoint se ha optimizado con RL durante 150 pasos, lo que puede alterar el estilo de respuesta respecto al modelo base.
- Tool calling y function calling: no disponible en la documentacion; probablemente heredado del base, pero sin confirmacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion de fine-tunes de RL: el checkpoint sirve como caso de estudio para comparar el efecto de 150 pasos de RL sobre el modelo base Qwen3.5-9B en tareas de razonamiento y vision-lenguaje, midiendo deriva respecto al original.
- Prototipado de asistentes multimodales: al heredar la capacidad image-text-to-text, puede emplearse en demos de descripcion de imagenes o respuesta a preguntas visuales, siempre con validacion previa.
- Investigacion academica sobre alineamiento: util para estudiar como el RL de pocos pasos afecta a la calibracion y al sesgo de un modelo de 9B, comparando salidas con el base.
- Generacion de texto asistida en entornos de investigacion: con 9,4B de parametros cabe en GPUs de 24 GB en cuantizacion de 4 bits, lo que permite experimentar en estaciones de trabajo con una RTX 4090.
- Base para nuevos fine-tunes: al estar publicado en safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustes posteriores con SFT o DPO.
- Despliegue experimental con transformers: la model card indica cargarlo con `AutoModelForCausalLM.from_pretrained`, por lo que encaja en pipelines de investigacion basados en la libreria transformers y en entornos de evaluacion tipo lm-evaluation-harness.
- Analisis de robustez multimodal: permite probar la estabilidad del modelo ante prompts adversarios en tareas imagen-texto, comparando con el base para aislar el efecto del RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones con el modelo base Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB de pesos, con margen para contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos; cabe en GPUs consumer de 8-12 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o GPUs de 12-16 GB para cuantizacion agresiva.
- Cabe en GPU consumer: si, en RTX 4090 en BF16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza, aunque el autor no publica versiones GGUF.
- Opciones de despliegue: transformers (indicado en la model card); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este checkpoint, y al ser multimodal pueden requerir soporte especifico del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kushasareen/qwen35-9b-ft-cur3-150 | 9,41B | no disponible | Apache 2.0 | safetensors | Fine-tune RL de 150 pasos; sin benchmarks |
| Qwen/Qwen3.5-9B (base) | ~9,4B | no disponible en esta ficha | Apache 2.0 (segun el fine-tune) | safetensors | Modelo original; referencia para medir el efecto del fine-tune |
| Otros fine-tunes de Qwen3.5-9B | ~9,4B | variable | variable | variable | No se dispone de datos comparativos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoria. Cualquier comparacion cuantitativa requeriria evaluar el modelo base y este checkpoint con el mismo arnes.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe dataset, hiperparametros, funcion de recompensa ni evaluaciones, lo que impide reproducir el entrenamiento o validar su calidad.
- Riesgo de alucinacion: no cuantificado; al ser un fine-tune de RL de pocos pasos, puede haber deriva respecto al modelo base sin que se documente.
- Sesgos: no evaluados. No hay informacion sobre sesgos de genero, raza, idioma o cultura.
- Idiomas: no se especifican los idiomas soportados; no se debe asumir multilingue sin comprobacion.
- Contexto: se desconoce la ventana maxima efectiva tras el fine-tune.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado para confirmar que su licencia es compatible y que no impone restricciones adicionales.
- Multimodalidad: al no documentarse el procesador de imagen ni los formatos admitidos, el uso con imagenes requiere pruebas propias.
- Produccion: no recomendado sin evaluacion previa en el dominio objetivo; el checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion comunitaria.
- Fecha de publicacion: el repositorio figura creado el 2026-11-21, lo que debe tenerse en cuenta al contrastar con versiones posteriores del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/kushasareen/qwen35-9b-ft-cur3-150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
