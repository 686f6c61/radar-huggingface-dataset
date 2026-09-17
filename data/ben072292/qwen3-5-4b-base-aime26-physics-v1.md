# ben072292/Qwen3.5-4B-Base-AIME26-physics-v1

## Resumen

El modelo `ben072292/Qwen3.5-4B-Base-AIME26-physics-v1` es un ajuste fino por DPO (Direct Preference Optimization) del modelo base `Qwen/Qwen3.5-4B-Base`, publicado por el usuario ben072292 en HuggingFace. Se trata de un "full fine-tune" (todos los pesos se actualizan, no un adaptador LoRA) realizado con LLaMA-Factory sobre un conjunto de datos denominado `physics_dpo`, segun la propia model card. El repositorio tiene 4.539.265.536 parametros (4,54 B) y un tamano de 9,1 GB, lo que es coherente con pesos en precision de 16 bits.

Su relevancia es limitada y muy especifica: es un artefacto de investigacion derivado de la familia Qwen3.5, orientado a preferencias en el dominio de la fisica y etiquetado como `image-text-to-text`, es decir, con capacidad multimodal de entrada imagen-texto. La model card es practicamente vacia (secciones "More information needed"), no se declaran idiomas, no hay resultados de evaluacion y el repositorio no registra descargas ni interacciones en el momento de la consulta. Debe tratarse, por tanto, como un modelo no verificado.

El interes tecnico principal esta en el procedimiento de entrenamiento documentado: DPO completo con learning rate muy bajo (1e-7), un solo epoch, batch efectivo de 8 y recorte de 2048 tokens, segun el nombre del run y los hiperparametros publicados. Es util como referencia para reproducir pipelines de DPO conservador sobre modelos multimodales de ~4B, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5`); el pipeline declarado es `image-text-to-text`, por lo que incorpora entrada multimodal de imagen y texto. No se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.539.265.536 (4,54 B), dato real de los safetensors |
| Parametros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El entrenamiento se realizo con recorte de 2048 tokens (inferido del nombre del run y del registro de hiperparametros) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | `other` (no se detallan los terminos; se hereda la licencia del modelo base Qwen/Qwen3.5-4B-Base, cuyos terminos no se reproducen en la ficha) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `Qwen/Qwen3.5-4B-Base` mas alla de las etiquetas del repositorio: `qwen3_5` (familia Qwen3.5) e `image-text-to-text` (pipeline multimodal de entrada imagen-texto). No se documentan el tipo de atencion, el ratio de atencion lineal, la presencia de capas MoE, el vocabulario ni la ventana de contexto nativa. Cualquier afirmacion adicional al respecto seria especulacion.

El ajuste se realizo con LLaMA-Factory en modalidad `full` (entrenamiento completo de los pesos) mediante DPO, partiendo del modelo base y usando el dataset `physics_dpo`. Los hiperparametros declarados son: learning rate 1e-7, `train_batch_size` 1, `eval_batch_size` 8, `gradient_accumulation_steps` 8 (batch efectivo de 8), 1 epoch, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler de learning rate constante, y entrenamiento distribuido en multi-GPU. El nombre del run (`dpo-full-conservative-lr1e7-ga8-wd0-beta01-delta-gh200-1ep-2048-20260916`) sugiere, como inferencia, un beta de DPO de 0,1, ausencia de weight decay, hardware GH200, recorte de 2048 tokens y fecha de ejecucion de 16 de septiembre de 2026; estos extremos no se confirman de forma explicita en la model card. El entorno de entrenamiento fue Transformers 5.6.0, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

No se documenta la composicion del dataset `physics_dpo` (numero de pares de preferencia, origen, idioma, si incluye imagenes), ni si hubo etapas previas de SFT, RLHF o filtrado de seguridad.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline declarado indican uso en formato de dialogo; el ajuste es sobre un modelo base, por lo que la calidad conversacional depende del base.
- Entrada multimodal imagen-texto: el pipeline `image-text-to-text` implica que el modelo acepta imagenes junto a texto, presumiblemente heredado del base Qwen3.5 multimodal. No se documenta que el ajuste DPO haya entrenado o congelado el codificador visual.
- Razonamiento en fisica: el ajuste se realiza sobre un dataset de preferencias denominado `physics_dpo` y el nombre del modelo incluye `physics` y `AIME26`, lo que sugiere optimizacion para problemas de fisica y de estilo competicion matematica. No hay evaluacion que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documentan capacidades de agente ni plantillas de herramientas.
- Capacidades multilingues: no disponible. El modelo base Qwen3.5 es de origen chino, pero no se declara ninguna lista de idiomas para este ajuste.
- Modo "thinking" o razonamiento explicito: no disponible.
- Audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en alineacion con DPO: sirve como artefacto reproducible para estudiar el efecto de un DPO conservador (lr 1e-7, 1 epoch, beta bajo) sobre un modelo multimodal de 4,54 B, comparando sus salidas con las del base sin ajustar. Aporta un punto de referencia de "cuanto cambia un modelo con un solo epoch de DPO a learning rate muy bajo".
- Generacion de pares de preferencia en dominios cientificos: el pipeline de LLaMA-Factory sobre un dataset de fisica puede reutilizarse para producir variantes de respuestas (elegida/rechazada) y ampliar el conjunto de datos antes de un DPO posterior.
- Tutoria de fisica con soporte de imagenes: si el codificador visual se conserva funcional, el modelo podria recibir fotografias de pizarras, diagramas de cuerpos libres o graficos experimentales y generar explicaciones paso a paso. Requiere validacion previa, ya que no hay evaluacion publicada.
- Prototipado de asistentes cientificos en entornos de investigacion: integrable mediante Transformers y el pipeline `image-text-to-text` para experimentar con respuestas a preguntas de fisica antes de comprometerse con un modelo mayor.
- Generacion de material didactico y problemas resueltos: redaccion de enunciados y soluciones de fisica a partir de descripciones textuales o figuras, siempre con revision humana por el riesgo de alucinacion en calculos.
- Evaluacion comparativa de ajustes DPO: uso como uno de los brazos de un estudio A/B frente al base Qwen3.5-4B y a otros checkpoints del mismo autor, midiendo cambios en longitud de respuesta, formato y estilo.
- Fine-tuning posterior o destilacion: al ser un modelo de 4,54 B con pesos completos, puede actuar como profesor o como punto de partida para un SFT adicional en un dominio concreto, si la licencia lo permite (no aclarada).
- Extraccion estructurada en documentos cientificos: conversion de tablas y graficos de articulos a texto estructurado aprovechando la entrada multimodal, sujeto a validacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene un unico registro con nombre de run (`dpo-full-conservative-lr1e7-ga8-wd0-beta01-delta-gh200-1ep-2048-20260916`) y una lista de resultados vacia. La seccion "Training results" del README tambien esta vacia. No existen, por tanto, datos de MMLU, GSM8K, HumanEval, AIME ni de evaluaciones multimodales que puedan citarse.

## Requisitos de hardware

- Peso de los pesos en precision de 16 bits: aproximadamente 9,1 GB, coherente con los 4,54 B de parametros y el tamano del repositorio. A esto hay que sumar la memoria del codificador visual y la cache KV.
- VRAM estimada para inferencia (calculos derivados del numero de parametros, no declarados por el autor): en bf16/fp16, en torno a 10-12 GB en funcion de la longitud de contexto y del numero de imagenes por peticion; en cuantizacion de 8 bits, aproximadamente 5-6 GB; en 4 bits, en torno a 3-4 GB. Estas cifras son estimaciones y no estan verificadas para este checkpoint.
- GPU recomendadas: para bf16 sin cuantizar, tarjetas con 16 GB o mas (RTX 4080/4090, L4, A10G, A100 40 GB, H100). Para cuantizacion de 4 bits, GPU de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4070) podrian ser suficientes para texto, con margen reducido si se procesan imagenes.
- Cabe en GPU de consumo: si, previsiblemente en bf16 sobre RTX 4090 (24 GB) y en cuantizacion sobre GPUs de 8-12 GB, aunque no hay confirmacion oficial.
- Opciones de despliegue: el repositorio esta etiquetado como `transformers` y `endpoints_compatible`, por lo que la via soportada es HuggingFace Transformers. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni motores de cuantizacion; la etiqueta `qwen3_5` puede no estar soportada por todos los runtimes.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo a primer token. En un modelo denso de 4,54 B en bf16 sobre una A100 o H100, el throughput tipico de la clase suele medirse en miles de tokens por segundo con batching en vLLM, pero no hay datos especificos de este checkpoint.
- Entrenamiento: el registro indica `distributed_type: multi-GPU` y el nombre del run menciona GH200, por lo que el ajuste se realizo en hardware de centro de datos, no en una GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B-Base-AIME26-physics-v1) | 4,54 B | No disponible | `other` | HuggingFace, 0 descargas | Ajuste DPO full sobre Qwen3.5-4B-Base, sin evaluacion |
| Qwen/Qwen3.5-4B-Base | No disponible en la informacion | No disponible | No disponible | HuggingFace | Modelo base del que deriva; arquitectura multimodal segun la etiqueta del ajuste |
| Otros modelos densos de ~4B (familia Qwen3, Llama 3.x, Phi) | Del orden de 3-4 B en la clase | No disponible | No disponible | HuggingFace | Categoria comparable por tamano, pero no se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de datos verificados de benchmarks, contexto, licencia o rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable.

## Limitaciones y advertencias

- Modelo no verificado: cero descargas y cero interacciones en el momento de la consulta, model card autogenerada por el Trainer y con secciones sin completar ("Model description", "Intended uses & limitations" y "Training and evaluation data" indican "More information needed").
- Sin evaluacion: no hay ningun resultado de benchmark, ni siquiera del propio dataset de validacion. No se puede afirmar mejora alguna sobre el modelo base.
- Riesgo alto de alucinacion en contenido cientifico: en problemas de fisica, un modelo de 4,54 B puede producir derivaciones plausibles pero incorrectas, especialmente en calculo simbolico y unidades. Requiere verificacion humana o ejecucion de codigo.
- Idiomas no declarados: se desconoce el comportamiento en castellano y si el ajuste DPO se realizo en ingles, chino u otro idioma. Es probable que el entrenamiento de preferencias haya sido en un unico idioma no especificado.
- Licencia `other` sin terminos publicados: la ficha no reproduce el texto de la licencia ni aclara si el uso comercial esta permitido. Al derivar de Qwen/Qwen3.5-4B-Base, se heredan las condiciones del modelo base, que deben consultarse antes de cualquier uso en produccion.
- Contexto de entrenamiento limitado: el ajuste parece haberse realizado con recorte de 2048 tokens (inferido del nombre del run), inferior a las ventanas habituales de la familia, lo que puede degradar el comportamiento en contextos largos si el base no se reentrena con secuencias mayores.
- Origen de los datos desconocido: no se documenta como se construyo `physics_dpo`, quien lo genero, ni si contiene datos sujetos a derechos de autor o contenido sesgado.
- Sin informacion de seguridad: no se menciona ningun ajuste de alineacion, filtrado de contenido nocivo ni evaluacion de sesgos. No se recomienda su exposicion directa a usuarios finales.
- Compatibilidad de runtime incierta: la etiqueta `qwen3_5` es especifica y puede no estar soportada por versiones estables de vLLM, llama.cpp u Ollama, lo que complica el despliegue en produccion.
- El identificador del modelo incluye `AIME26`, lo que sugiere un objetivo de rendimiento en competiciones de matemáticas o física, pero no existe ninguna evidencia publicada que lo respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ben072292/Qwen3.5-4B-Base-AIME26-physics-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- LLaMA-Factory (framework de entrenamiento declarado en las etiquetas): no se proporciona enlace en la informacion disponible
- Paper, blog o demo del autor: no disponible
- Resultados de la busqueda web: los enlaces devueltos (dominio zhihu.com) no guardan relacion con el modelo, la familia Qwen ni el conjunto de datos `physics_dpo`; no se han encontrado referencias tecnicas utiles en la busqueda realizada.
