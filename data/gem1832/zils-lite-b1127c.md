# Gem1832/zils-lite-b1127c

## Resumen

zils-lite-b1127c es un fine-tune del modelo d3-lite publicado por vllm-sr, que a su vez se construye sobre Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario Gem1832 y se distribuye como un "decision-model" orientado a tareas de eleccion, preguntas de si/no y puntuacion con objetivos de probabilidad. El modelo parte de una base de aproximadamente 853 millones de parametros y se ha ajustado mediante una LoRA de rango 32 sobre las capas de lenguaje, fusionada posteriormente en los pesos finales.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni resultados de evaluacion publicados. Su interes practico reside en que ejemplifica el patron de fine-tune ligero sobre una base pequena para tareas de decision estructurada, con licencia Apache-2.0 y pesos en safetensors, lo que facilita su inspeccion y reutilizacion.

No se dispone de informacion sobre el pipeline declarado, los idiomas soportados ni las capacidades multimodales mas alla de la mencion a una "vision tower" heredada del release base. Cualquier uso en produccion deberia acompanarse de una evaluacion propia, dado que no hay benchmarks ni documentacion tecnica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de vllm-sr/d3-lite, basado en Qwen/Qwen3.5-0.8B); detalles de atencion no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del release d3-lite de vllm-sr, que a su vez deriva de Qwen/Qwen3.5-0.8B. El ajuste se realizo con una LoRA de rango 32 y tasa de aprendizaje 4e-5 aplicada sobre las capas de lenguaje, con posterior fusion de los adaptadores en los pesos base. La "vision tower" del release original se mantiene sin cambios, aunque no se documenta su arquitectura ni su resolucion de entrada.

El entrenamiento utilizo aproximadamente 135.000 filas de decision, compuestas por tareas con licencia comercial procedentes de tasksource (preguntas de eleccion multiple, preguntas de si/no y de puntuacion, incluyendo objetivos de probabilidad) y por elementos publicos de Zils Outcomes (arXiv, Wikipedia, Gerrit). No se mencionan fases de RLHF, DPO ni datos de preferencias, ni se detalla la composicion exacta por fuente, la longitud de las secuencias de entrenamiento o el numero total de tokens vistos.

## Capacidades

- Clasificacion y decision estructurada: preguntas de eleccion multiple, respuestas de si/no y tareas de puntuacion, incluyendo la produccion de objetivos de probabilidad.
- Razonamiento sobre documentos y elementos de dominios como articulos cientificos (arXiv), enciclopedias (Wikipedia) y revisiones de codigo (Gerrit), segun la composicion del dataset de entrenamiento.
- Procesamiento de lenguaje natural heredado de la base Qwen3.5-0.8B, aunque no se documenta su alcance exacto tras el fine-tune.
- Posible soporte de entrada visual por la "vision tower" heredada del release base, sin confirmacion de su funcionamiento ni de su calidad tras el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificacion de articulos cientificos: el modelo puede asignar etiquetas o puntuaciones de relevancia a preprints de arXiv, aprovechando que parte de su entrenamiento incluye elementos de Zils Outcomes de esa fuente.
- Moderacion y triaje de contenido en Wikipedia: uso como clasificador de si/no o de eleccion multiple para decidir si una edicion requiere revision, dado el entrenamiento sobre elementos de Wikipedia.
- Priorizacion de revisiones de codigo en Gerrit: el modelo puede puntuar cambios propuestos y ayudar a ordenar la cola de revision, al haber sido expuesto a elementos de Gerrit.
- Encuestas y formularios automatizados: generacion de respuestas de eleccion o de probabilidad en tareas de decision con opciones cerradas, gracias a los objetivos de probabilidad presentes en el dataset.
- Filtrado en pipelines de datos: uso como clasificador ligero (menos de 1.000 millones de parametros) para descartar o etiquetar registros antes de un procesamiento mas costoso.
- Experimentacion e investigacion: base para estudiar el efecto de LoRA de rango 32 sobre tareas de decision en modelos pequenos, con licencia Apache-2.0 y pesos en safetensors que facilitan la inspeccion.
- Prototipado de asistentes de decision acotados: integracion en flujos donde la salida esperada es una etiqueta, una opcion o una probabilidad, no texto libre largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parametros, en FP16 se requieren aproximadamente 1,7 GB solo para pesos; en FP32, unos 3,4 GB; en cuantizaciones de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para FP16 con margen para el contexto; una RTX 3060 de 12 GB o superior es suficiente en la practica.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en FP16 y en la mayoria de GPU integradas o de gama baja si se cuantiza.
- Opciones de despliegue: los pesos estan en safetensors y no se documentan variantes GGUF, por lo que llama.cpp u Ollama requeririan conversion previa; vLLM y TGI son opciones plausibles si la arquitectura base es compatible, aunque no se confirma.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-b1127c (Gem1832) | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| vllm-sr/d3-lite (modelo base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base original) | ~0,8 B | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de tareas de decision publicadas, por lo que el rendimiento real es desconocido.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion independiente.
- Sesgos desconocidos: el dataset combina tasksource y Zils Outcomes (arXiv, Wikipedia, Gerrit), lo que puede introducir sesgos de dominio y de seleccion no documentados.
- Riesgo de alucinacion: aunque esta orientado a decisiones cerradas, la base generativa Qwen3.5-0.8B puede producir texto libre o justificaciones no verificadas si se le solicita.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados, lo que impide garantizar un comportamiento multilingue.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de las fuentes de datos (tasksource y Zils Outcomes) y del modelo base original.
- Caveat de produccion: al no documentarse el pipeline, la tokenizer ni el formato de prompt esperado, la integracion requiere ingenieria inversa y pruebas propias.
- La "vision tower" heredada no esta validada tras el fine-tune; no debe asumirse que las capacidades visuales funcionen correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gem1832/zils-lite-b1127c
- Modelo base d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo original Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
