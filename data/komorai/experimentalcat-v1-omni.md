# KomorAI/ExperimentalCat-v1-Omni

## Resumen

ExperimentalCat-v1-Omni es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el usuario KomorAI y publicado en Hugging Face. Se trata de un modelo de juguete (toy model) con una arquitectura transformer extremadamente reducida: 2 capas, 64 dimensiones de embedding, 2 cabezas de atencion y una longitud de contexto de solo 64 tokens. El numero total de parametros es de 126.272, lo que lo situa varios ordenes de magnitud por debajo de cualquier modelo de lenguaje utilizable en produccion.

El modelo fue entrenado mediante un script en Google Colab sobre un corpus de 200 frases generadas aleatoriamente a partir de un vocabulario cerrado y muy especifico (345 tokens) compuesto casi en su totalidad por palabras en polaco relacionadas con gatos, objetos domesticos, personajes y onomatopeyas felinas. No emplea tokenizacion BPE estandar de GPT-2, sino un vocabulario propio construido a mano por el autor.

Su relevancia es exclusivamente educativa y experimental: sirve como ejemplo minimo de pipeline de entrenamiento de un modelo GPT-2 from scratch, de publicacion en Hugging Face y de conversion a otros formatos. No es adecuado para ninguna tarea de procesamiento de lenguaje natural real, tal como el propio autor advierte en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 126.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible (el autor indica que no hay archivos GGUF publicados) |
| Idiomas soportados | pl, en (segun metadatos; en la practica solo genera tokens del vocabulario cerrado en polaco) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas (n_layer) | 2 |
| Dimension de embedding (n_embd) | 64 |
| Cabezas de atencion (n_head) | 2 |
| Tamano de vocabulario | 345 (incluye `[UNK]`, `[PAD]`, `<|endoftext|>`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only canonico de tipo GPT-2 con hiperparametros minimos: 2 capas, 64 dimensiones ocultas, 2 cabezas de atencion y posiciones maximas de 64. El vocabulario es custom y cerrado, con 345 entradas entre las que predominan sustantivos y onomatopeyas en polaco del campo semantico felino y domestico. No hay informacion sobre el uso de mecanismos adicionales como atencion lineal, decodificacion especulativa o capas MoE; por el tamano y la descripcion, se trata de una implementacion basica de GPT-2.

El entrenamiento se realizo con un script en Google Colab sobre un dataset de 200 frases generadas aleatoriamente a partir del vocabulario del autor. No se menciona el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan tecnicas de regularizacion, learning rate o regimen de entrenamiento. La model card no incluye informacion sobre evaluacion cuantitativa ni curvas de perdida.

## Capacidades

- Generacion de texto autoregresiva limitada al vocabulario cerrado de 345 tokens definido por el autor.
- Generacion de secuencias cortas (hasta 64 tokens de contexto) compuestas por palabras del vocabulario, sin coherencia gramatical ni semantica real.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- Capacidad multilingue practicamente nula: aunque los metadatos declaran pl y en, el vocabulario solo contiene tokens en polaco (mas los especiales).
- No soporta instrucciones, chat templates ni formato conversacional.

## Casos de uso

- Docencia sobre pipelines de entrenamiento: sirve para ilustrar paso a paso como se entrena un GPT-2 desde cero en Colab, incluyendo la construccion del vocabulario, el dataset sintetico y la publicacion en Hugging Face.
- Pruebas de integracion de la libreria Transformers: al ser un modelo de 126 K parametros, permite validar flujos de `AutoModelForCausalLM.from_pretrained` y `generate` en entornos con recursos minimos.
- Test de conversion de formatos: util para verificar scripts de conversion a GGUF u otros formatos sin consumir GPU ni tiempo significativo.
- Ejemplo de model card y publicacion responsable: la ficha del autor documenta explicitamente limitaciones y ausencia de archivos GGUF, lo que sirve como plantilla de buenas practicas para modelos de juguete.
- Experimentos de tokenizacion: permite estudiar el comportamiento de un tokenizador de vocabulario cerrado frente a BPE, util en asignaturas de PLN.
- Pruebas de infraestructura de inferencia: por su tamano, se puede desplegar en cualquier entorno (incluido CPU) para validar endpoints, colas o wrappers de API sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision (126 K parametros en fp32 ocupan aproximadamente 0,5 MB; el cuello de botella es el runtime, no los pesos).
- GPU recomendadas: ninguna en particular; el modelo cabe en CPU y en cualquier GPU consumer.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna.
- Opciones de despliegue: Transformers (Python) segun el ejemplo de la model card. El autor menciona llama.cpp, Ollama y LM Studio, pero indica que no hay archivos GGUF publicados, por lo que esas rutas no estan disponibles actualmente.
- Latencia y throughput: no disponibles. Por el tamano, la latencia estara dominada por el overhead del framework y no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| ExperimentalCat-v1-Omni | 126.272 | 64 | MIT | Hugging Face (safetensors) | Juguete / educativo |
| GPT-2 small (referencia) | 124 M | 1.024 | MIT | Hugging Face | Texto general |
| DistilGPT-2 | 82 M | 1.024 | MIT | Hugging Face | Texto general |
| Modelos de juguete tipo nanoGPT | variable (tipicamente < 10 M) | variable | MIT | Repositorios de codigo | Educativo |

La comparacion con GPT-2 small es la mas directa por arquitectura, pero la diferencia de parametros (126 K frente a 124 M) y de contexto (64 frente a 1.024) es de tres ordenes de magnitud en computo y de mas de un orden en ventana. Frente a DistilGPT-2 la brecha es similar. La unica categoria en la que encaja es la de modelos de juguete educativos tipo nanoGPT.

## Limitaciones y advertencias

- Modelo de juguete: el propio autor advierte que no es adecuado para tareas linguisticas normales.
- Vocabulario cerrado de 345 tokens: no puede generar palabras fuera de esa lista; cualquier texto de entrada con tokens desconocidos se mapea a `[UNK]`.
- Contexto de 64 tokens: insuficiente para cualquier conversacion multi-turno o documento.
- Dataset de entrenamiento sintetico de 200 frases: no hay diversidad linguistica ni cobertura de dominios.
- Riesgo de alucinacion irrelevante en la practica porque no produce contenido factual; el riesgo real es la generacion de secuencias sin sentido.
- Sesgos: no evaluados; el vocabulario incluye terminos potencialmente ofensivos o estereotipados (por ejemplo, referencias a personajes y roles) que podrian aparecer en las generaciones.
- Idiomas: los metadatos declaran pl y en, pero el vocabulario es practicamente todo en polaco; el uso en ingles no es realista.
- Licencia MIT: permite uso comercial, pero el modelo no es funcional para produccion.
- No hay archivos GGUF publicados pese a la mencion en la model card, por lo que las rutas llama.cpp/Ollama/LM Studio no estan operativas.
- Sin benchmarks ni evaluacion cuantitativa publicada.

## Enlaces

- Hugging Face: https://huggingface.co/KomorAI/ExperimentalCat-v1-Omni
- No se han encontrado en la informacion proporcionada otros enlaces (paper, blog, repositorio o demo) asociados al modelo.
