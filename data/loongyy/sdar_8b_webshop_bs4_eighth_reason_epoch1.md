# loongyy/sdar_8b_webshop_bs4_eighth_reason_epoch1

## Resumen

`sdar_8b_webshop_bs4_eighth_reason_epoch1` es un ajuste fino completo (*full fine-tuning*) del modelo `JetLM/SDAR-8B-Chat`, publicado por el usuario de HuggingFace `loongyy`. El repositorio contiene 8.190.735.360 parámetros (8,19B) en formato safetensors, con un tamano total de 16,4 GB, lo que corresponde a pesos en precision de 16 bits. El modelo se ha entrenado con LLaMA-Factory durante una unica epoca sobre un dataset denominado `sdar_webshop_bs4_eighth_reason`, cuyo contenido y tamano no se documentan en la model card.

El nombre del dataset sugiere un ajuste orientado a tareas de agente en entornos de compra web (WebShop) con cierto componente de razonamiento, pero esta interpretacion es una inferencia a partir del nombre y no esta confirmada por el autor. La model card es la generada automaticamente por el `Trainer` de Transformers y deja como "More information needed" las secciones de descripcion, usos previstos, datos de entrenamiento y resultados, por lo que no hay informacion oficial sobre la tarea objetivo ni sobre el rendimiento.

Se trata, por tanto, de un artefacto de investigacion con 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks publicados y con licencia `other` sin terminos especificados. Su relevancia practica es limitada hasta que el autor documente el dataset, la tarea y las evaluaciones; cualquier uso en produccion exigiria validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags `sdar` y `custom_code`; requiere `trust_remote_code=True`; no se especifica si es transformer denso, MoE o hibrido) |
| Parametros totales | 8.190.735.360 (8,19B), segun los pesos safetensors |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos completos en safetensors; no hay GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | `other` (terminos no especificados; el modelo base puede imponer condiciones adicionales) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna. Los tags del repositorio incluyen `sdar` y `custom_code`, lo que indica que la implementacion no es la estandar de `transformers` y que es necesario cargar el modelo con `trust_remote_code=True` (o con la version de la libreria que soporte ese codigo personalizado). El modelo base, `JetLM/SDAR-8B-Chat`, aporta la arquitectura y el tokenizador; este repositorio solo contiene los pesos resultantes del ajuste. El pipeline declarado es `feature-extraction`, aunque el modelo base es un modelo de chat, lo que apunta a un etiquetado incorrecto o a un uso no conversacional del artefacto.

El entrenamiento se realizo con LLaMA-Factory en modo *full* (sin LoRA ni QLoRA) sobre 4 GPUs, con los siguientes hiperparametros: `learning_rate` 1e-05, `train_batch_size` 1 por dispositivo (batch total 4), `eval_batch_size` 8 por dispositivo (batch total 32), optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler `constant_with_warmup` con `warmup_ratio` 0.03, semilla 42 y 1,0 epoca. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se registran resultados de evaluacion. Las versiones de framework declaradas son Transformers 4.52.4, PyTorch 2.9.1+cu129, Datasets 3.6.0 y Tokenizers 0.21.1.

## Capacidades

- Generacion de texto: no documentada para este ajuste; el modelo base es un modelo de chat (`SDAR-8B-Chat`), por lo que se asume capacidad conversacional, pero no esta verificada en esta ficha.
- Razonamiento multi-paso: el nombre del dataset incluye el termino `reason`, lo que sugiere entrenamiento sobre trazas de razonamiento, pero no hay confirmacion ni evaluacion publicada.
- Uso como agente en entornos de compra web: inferido del nombre del dataset (`webshop`), no confirmado por el autor.
- Tool calling / function calling: no disponible.
- Soporte de agentes y planificacion multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.
- Extraccion de caracteristicas: es el pipeline declarado en la ficha de HuggingFace, aunque no se detalla el procedimiento recomendado.

## Casos de uso

Advertencia previa: el autor no documenta los usos previstos ("More information needed"). Los escenarios siguientes son hipotesis derivadas del nombre del dataset y de las caracteristicas tecnicas del artefacto, y requeririan validacion empirica antes de cualquier despliegue.

- Investigacion sobre agentes de compra web: el modelo parece ajustado sobre un dataset tipo WebShop, por lo que serviria como punto de partida para experimentar con politicas de seleccion de productos, comparacion de precios y finalizacion de compra en entornos simulados. Habria que verificar si el ajuste produce mejoras frente al modelo base.
- Reproduccion de experimentos de ajuste fino: al publicarse los hiperparametros completos (learning rate, scheduler, batch, epocas) y las versiones de framework, el repositorio permite reproducir el entrenamiento con LLaMA-Factory y comparar variantes (por ejemplo, distintos `bs` o "reason" del nombre del dataset).
- Generacion de datos sinteticos de interaccion: si el modelo ha aprendido el formato de las trayectorias del dataset, podria usarse para producir trazas de accion-observacion que alimenten tecnicas de *self-play* o destilacion, siempre que se controle la calidad y se filtren alucinaciones.
- Evaluacion de razonamiento intermedio: el sufijo `reason` sugiere que el modelo podria exponer cadenas de razonamiento antes de la accion; seria util para estudiar si esas trazas correlacionan con el exito de la tarea, aunque dicha estructura no esta documentada.
- Base para un segundo ajuste especifico: dado que es un ajuste completo, puede actuar como punto de partida para un *fine-tuning* adicional con LoRA sobre un dominio concreto, reduciendo el coste frente a partir del modelo original.
- Analisis de degradacion por ajuste completo: con 1 epoca y un dataset no documentado, es un caso de estudio util para medir olvido catastrofico comparando sus respuestas generales frente a las del modelo base `SDAR-8B-Chat`.
- Extraccion de representaciones: al declararse el pipeline `feature-extraction`, podria emplearse para obtener embeddings de texto, aunque no se especifica que capa utilizar ni si el modelo fue entrenado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card contiene una entrada con la lista de resultados vacia (`"results": []`) y la seccion "Training results" del README esta en blanco. No existen, por tanto, datos verificables de MMLU, HumanEval, GSM8K, WebShop u otra evaluacion para este ajuste.

## Requisitos de hardware

- Pesos en precision de 16 bits: 16,4 GB, segun el tamano del repositorio. Esa es la cifra minima de VRAM solo para cargar los pesos.
- VRAM estimada para inferencia en fp16/bf16, batch 1 y contexto corto: en torno a 18-20 GB (estimacion a partir del tamano de los pesos; el overhead del framework y la cache KV anaden entre 1 y 3 GB adicionales).
- VRAM estimada con cuantizacion: aproximadamente 9-10 GB en 8 bits y 5-6 GB en 4 bits (estimaciones; el repositorio no publica pesos cuantizados, por lo que habria que generarlos).
- GPU de centro de datos: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB. El entrenamiento se realizo con 4 GPUs en paralelo.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16 con contexto limitado; en RTX 4080 o 4070 Ti (16 GB) solo con cuantizacion; en GPUs de 12 GB no cabe sin cuantizacion agresiva a 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`), vLLM o TGI si la arquitectura personalizada esta soportada, y llama.cpp u Ollama tras convertir manualmente los pesos a GGUF. Al no existir pesos GGUF publicados, ese paso requiere trabajo adicional.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay benchmarks publicados de este ajuste, por lo que la comparacion de rendimiento no puede establecerse. La tabla siguiente recoge unicamente datos verificables de parametros, contexto y licencia de modelos de la misma categoria (8B aproximadamente). Los datos de las alternativas de terceros provienen de su documentacion publica y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Rendimiento comparado |
|---|---|---|---|---|---|
| `loongyy/sdar_8b_webshop_bs4_eighth_reason_epoch1` | 8,19B | no disponible | `other` | safetensors | sin benchmarks publicados |
| `JetLM/SDAR-8B-Chat` (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Llama 3.1 8B Instruct | 8,03B | hasta 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF (comunidad) | no comparable con este ajuste (sin evaluacion publicada) |
| Qwen2.5 7B Instruct | 7,61B | hasta 131.072 tokens | Apache 2.0 | safetensors, GGUF | no comparable con este ajuste (sin evaluacion publicada) |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card deja en "More information needed" la descripcion, los usos previstos, los datos de entrenamiento y los resultados. Se desconoce la tarea exacta para la que fue entrenado.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni debates asociados.
- Licencia `other`: los terminos de uso no estan publicados en la informacion disponible. No puede asumirse uso comercial; es necesario revisar la licencia del modelo base `JetLM/SDAR-8B-Chat` y la del repositorio.
- Riesgo de alucinacion: no evaluado. Al ser un ajuste de 1 epoca sobre un dataset no documentado, no hay evidencia sobre su comportamiento en dominios fuera del entrenamiento.
- Idiomas: sin informacion. No puede garantizarse un rendimiento correcto en castellano ni en ningun otro idioma distinto del que contuviera el dataset.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Olvido catastrofico: al tratarse de un ajuste completo (no LoRA) de una sola epoca, es plausible una degradacion de las capacidades generales del modelo base; seria necesario comparar ambos en tareas abiertas antes de usarlo.
- Etiqueta de pipeline inconsistente: se declara `feature-extraction` para un modelo derivado de un modelo de chat; conviene verificar el modo de uso previsto.
- Dependencia de codigo personalizado: el tag `custom_code` implica que la carga exige `trust_remote_code=True`, con el riesgo de seguridad que conlleva ejecutar codigo remoto.
- Fecha del repositorio: creado y actualizado el 2026-09-15, sin revisiones posteriores registradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loongyy/sdar_8b_webshop_bs4_eighth_reason_epoch1
- Modelo base `JetLM/SDAR-8B-Chat`: https://huggingface.co/JetLM/SDAR-8B-Chat
- LLaMA-Factory (framework de entrenamiento indicado en los tags): https://github.com/hiyouga/LLaMA-Factory
- Paper, blog, repositorio o demo del ajuste: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de conversion de imagenes a PDF, sin relacion con el contenido).
