# roadrage10/radar-encoder-freeze

## Resumen

radar-encoder-freeze es un modelo de clasificación de texto (text-classification) publicado en HuggingFace por el usuario roadrage10. Se trata de un ajuste fino (fine-tune) de un encoder transformer, entrenado sobre el dataset MahmoodAnaam/radar-pan26-raid, que por su nombre parece vinculado a tareas de la serie PAN (shared tasks de deteccion de contenido) asociadas al ambito "radar". El modelo cuenta con 399.711.361 parametros (segun los pesos en safetensors) y se distribuye en formato transformers con pesos safetensors.

El repositorio es muy reciente y de muy baja traccion: 3 descargas y 0 likes en el momento de la consulta, con la model card generada automaticamente por el Trainer y sin secciones de descripcion, usos previstos ni datos de entrenamiento completadas por el autor. No se declara licencia ni idiomas soportados, y el model-index oficial no incluye ningun resultado de benchmarks (array vacio), aunque la model card si recoge metricas de evaluacion obtenidas durante el entrenamiento.

Por su tamano (en torno a 400 millones de parametros) se situa en la categoria de encoders grandes tipo BERT-large / RoBERTa-large / DeBERTa-v3-large, orientados a clasificacion. Su interes actual es limitado dado que no se documenta el modelo base, no hay licencia y no hay resultados verificables publicados; se recomienda tratarlo como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificacion de texto (detalle concreto no disponible) |
| Parametros totales | 399.711.361 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-classification |
| Tamano del repositorio | 3.2 GB |
| Dataset de entrenamiento | MahmoodAnaam/radar-pan26-raid |
| Descargas / likes | 3 / 0 |
| Fecha de creacion / actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un encoder transformer ajustado para clasificacion de texto, con 399.711.361 parametros. La model card indica "fine-tuned version of [](https://huggingface.co/)", es decir, el enlace al modelo base quedo vacio, por lo que el modelo de partida no esta documentado. El tag `custom_code` sugiere que el repositorio incluye codigo personalizado para cargar o ejecutar el modelo, aunque no se detalla su contenido. El nombre "encoder-freeze" apunta a una estrategia de ajuste en la que se congela el encoder y se entrena unicamente la cabeza de clasificacion, pero esto no se confirma en la documentacion.

El entrenamiento se realizo con el Trainer de transformers sobre el dataset MahmoodAnaam/radar-pan26-raid. Los hiperparametros declarados son: learning rate 2e-05, train batch size 32, eval batch size 64, semilla 42, optimizador AdamW_TORCH_FUSED (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con warmup del 3 por ciento y 10 epocas. Los resultados de validacion por epoch muestran una mejora progresiva hasta estabilizarse en valores de ROC-AUC de 0.976, F1 de 0.920 y un "mean" de 0.940 en las ultimas epochs. No se documenta composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO (no aplicable a un clasificador de este tipo).

## Capacidades

- Clasificacion de texto: es la unica capacidad confirmada por el pipeline declarado (`text-classification`).
- Especializacion en el dominio del dataset radar-pan26-raid, presumiblemente deteccion o clasificacion de contenido en ese ambito.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo de proposito general).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Generacion de texto, codigo o matematicas: no aplica al pipeline declarado.

## Casos de uso

- Filtrado y moderacion de contenido: integrado como clasificador en un pipeline de preprocesado para etiquetar textos del dominio radar/PAN, siempre que se valide primero la taxonomia de clases del dataset de entrenamiento.
- Investigacion academica en shared tasks tipo PAN: uso como baseline congelado para comparar estrategias de fine-tuning frente a otros encoders.
- Anotacion asistida: preetiquetado de grandes volumenes de texto para reducir el trabajo manual de anotadores humanos, dado su tamano moderado y bajo coste de inferencia.
- Clasificacion por lotes en CPU: con 399M de parametros puede ejecutarse en CPU en escenarios batch donde la latencia no sea critica.
- Componente en cascada: usar este clasificador como etapa previa a un LLM generativo, filtrando o marcando entradas antes de pasarlas a un modelo mayor.
- Reproduccion de experimentos: dado que la model card incluye la tabla completa de metricas por epoch, sirve para reproducir y auditar el proceso de entrenamiento declarado.
- Advertencia: dado que no hay licencia declarada ni documentacion de clases, no se recomienda su uso en produccion comercial sin aclarar antes estos puntos con el autor.

## Benchmarks y rendimiento

El model-index oficial del modelo contiene un array de resultados vacio (`"results": []`), por lo que no hay benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Sin embargo, la model card recoge las metricas de evaluacion declaradas por el autor. Se reproducen tal cual:

| Metrica | Valor (evaluacion final) |
|---|---|
| Loss | 0.1800 |
| ROC-AUC | 0.97 |
| Brier | 0.934 |
| C@1 | 0.913 |
| F1 | 0.907 |
| F05u | 0.941 |
| Mean | 0.933 |

Evolucion durante el entrenamiento (seleccion de epochs representativas):

| Epoch | Step | Validation loss | ROC-AUC | Brier | C@1 | F1 | F05u | Mean |
|---|---|---|---|---|---|---|---|---|
| 0.42 | 500 | 0.3255 | 0.900 | 0.873 | 0.816 | 0.806 | 0.875 | 0.854 |
| 2.08 | 2500 | 0.2167 | 0.961 | 0.917 | 0.885 | 0.883 | 0.931 | 0.915 |
| 4.15 | 5000 | 0.1864 | 0.971 | 0.929 | 0.903 | 0.902 | 0.943 | 0.930 |
| 6.64 | 8000 | 0.1641 | 0.976 | 0.940 | 0.919 | 0.922 | 0.944 | 0.940 |
| 9.97 | 12000 | 0.1634 | 0.976 | 0.940 | 0.918 | 0.920 | 0.946 | 0.940 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada, ya que el autor no las incluye.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.6 GB en FP32 (399M x 4 bytes); unos 0.8 GB en FP16/BF16; en torno a 0.4-0.5 GB en INT8. A esto hay que sumar la memoria de activaciones segun la longitud de secuencia.
- GPU recomendadas: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) e incluso en GPUs de gama baja con 4-6 GB. Para despliegue a escala, A100/H100 son innecesarias por el reducido tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer actuales, y en CPU para inferencia con requisitos de latencia laxos.
- Opciones de despliegue: pipeline de transformers (PyTorch), exportacion a ONNX o TorchScript para inferencia optimizada, y servidores genericos de modelos de clasificacion. No se declaran variantes GGUF, por lo que llama.cpp/Ollama no estan soportados de serie para este repositorio. vLLM y TGI estan orientados a modelos generativos y no son el encaje natural para un clasificador encoder.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones). Con 399M de parametros y secuencias cortas, el throughput en GPU deberia ser de miles de inferencias por segundo a nivel de batch, pero es una estimacion no verificada.
- Nota: el repositorio ocupa 3.2 GB, mas de lo que corresponderia solo a los pesos en FP32 (aprox. 1.6 GB), lo que sugiere la presencia de checkpoints adicionales u otros ficheros en el mismo repositorio.

## Comparativa con modelos similares

El modelo base no esta documentado, por lo que no es posible establecer una comparacion fiable con alternativas concretas. A titulo orientativo, se compara por rango de parametros con encoders de clasificacion ampliamente conocidos, si bien sus datos no provienen de este modelo:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| radar-encoder-freeze | 399,7 M | no disponible | no disponible | HuggingFace |
| BERT-large | ~335 M | 512 | Apache 2.0 | HuggingFace |
| RoBERTa-large | ~355 M | 512 | MIT | HuggingFace |
| DeBERTa-v3-large | ~435 M | 512 | MIT | HuggingFace |

Los valores de la columna de contexto y licencia de los modelos de referencia son datos publicos de esos modelos, no del modelo evaluado. No se dispone de comparaciones de rendimiento en la misma tarea porque el dataset radar-pan26-raid es especifico y no hay resultados publicados de otros modelos sobre el.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, redistribucion o modificacion. No debe usarse en produccion sin aclarar la licencia con el autor.
- Modelo base no documentado: no se indica de que modelo parte el fine-tune, lo que impide evaluar sus capacidades, sesgos heredados y obligaciones de atribucion.
- Idiomas no declarados: se desconoce si el modelo es mono o multilingue y en que idiomas rinde bien.
- Sin descripcion de clases ni taxonomia: la model card no explica que categorias predice, dato imprescindible para interpretar las salidas.
- Riesgo de sobreajuste al dominio: al entrenarse sobre un unico dataset especializado, es probable que generalice mal fuera de ese dominio y del estilo de texto de radar-pan26-raid.
- Riesgo de sesgo: no hay analisis de sesgos ni de representatividad del dataset de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Traccion minima: 3 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Metricas no verificables: todas las cifras de rendimiento son declaradas por el autor y no se acompanan de script de evaluacion reproducible en la informacion proporcionada.
- Tag `custom_code`: requiere confiar en el codigo incluido en el repositorio para cargar el modelo, lo que implica una revision de seguridad antes de ejecutarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roadrage10/radar-encoder-freeze
- Dataset de entrenamiento: https://huggingface.co/datasets/MahmoodAnaam/radar-pan26-raid
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
- La busqueda web no devolvio ningun enlace relevante sobre este modelo (los resultados obtenidos correspondian a paginas generales de ChatGPT/OpenAI, sin relacion con el modelo).
