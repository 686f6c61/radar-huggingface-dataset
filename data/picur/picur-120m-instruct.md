# picur/picur-120M-instruct

## Resumen

picur-120M-instruct es un modelo de generacion de texto de tipo instruct, publicado por el usuario picur en HuggingFace, con 120.404.352 parametros reales (segun los pesos en safetensors) y etiquetado como arquitectura lfm2. Se distribuye bajo licencia Apache 2.0, esta orientado exclusivamente al hungaro (`hu`) y su model card lo marca explicitamente como "PREVIEW", es decir, un checkpoint preliminar con documentacion minima.

El modelo resuelve el problema del asistente conversacional en hungaro a muy baja escala: 120 millones de parametros permiten ejecucion en CPU o en GPU de gama baja, algo relevante para despliegues en el borde, entornos sin conectividad o experimentos academicos sobre lenguas de recursos limitados. Frente a alternativas multilingues de tamano similar, su interes no esta en el rendimiento bruto sino en estar especializado en un unico idioma con un presupuesto de computo minimo.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto efectiva ni resultados de benchmarks. Tampoco se han publicado cuantizaciones ni versiones GGUF en el repositorio, que ocupa 0,2 GB y contiene pesos en safetensors junto a una plantilla de chat Jinja almacenada en el tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (segun el tag del repositorio; sin detalle en la model card) |
| Parametros totales | 120.404.352 |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | hungaro (hu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,2 GB |
| Plantilla de chat | Jinja, almacenada en el tokenizer (`apply_chat_template`) |
| Precision sugerida por el autor | bfloat16 (`torch_dtype=torch.bfloat16`) |
| Fecha de creacion en HuggingFace | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El unico dato arquitectonico disponible es el tag `lfm2`, que situa el modelo en la familia LFM2 (Liquid Foundation Model 2). Se trata, por tanto, de una arquitectura hibrida y no de un transformer denso clasico, aunque la model card no especifica ni el numero de capas, ni las dimensiones ocultas, ni el ratio de atencion frente a convoluciones, ni la ventana de contexto nativa. Tampoco se documenta si el modelo parte de un checkpoint base de LFM2 reentrenado o ajustado con tecnicas de instruccion (SFT, DPO o RLHF), ni que hiperparametros se emplearon.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus en hungaro, el uso de datos sinteticos, ni la existencia de una fase de alineacion posterior al preentrenamiento. La unica evidencia de formato conversacional es la plantilla Jinja incluida en el tokenizer, que acepta mensajes con roles `system` y `user` y genera el prompt de generacion mediante `add_generation_prompt=True`. La etiqueta "PREVIEW" de la model card sugiere que el autor no considera este checkpoint una version estable ni final.

## Capacidades

- Generacion de texto conversacional en hungaro, con soporte de mensajes de sistema y de usuario a traves de la plantilla de chat del tokenizer.
- Instrucciones de formato libre (por ejemplo, la peticion de escribir un cuento largo incluida en la model card).
- Generacion con muestreo configurable (`temperature`, `max_new_tokens`, `do_sample`).
- Capacidad multilingue: ninguna documentada; el modelo esta etiquetado unicamente como `hu`, por lo que no cabe esperar un comportamiento fiable en castellano, ingles u otros idiomas.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible, no documentado.
- Codigo y matematicas: no documentado; a 120 M de parametros y con entrenamiento centrado en hungaro, la capacidad esperable en estas tareas es muy limitada.

## Casos de uso

- Asistente conversacional en hungaro en el borde: con 120 M de parametros, el modelo cabe en CPU, en una Raspberry Pi con 4-8 GB de RAM o en un movil, lo que permite un chatbot en hungaro sin conexion y sin coste de API.
- Generacion de texto creativo en hungaro: cuentos, descripciones de producto o textos breves de marketing, usando la plantilla de chat con un mensaje de sistema que fije el tono; el ejemplo de la propia model card (un cuento sobre un pescador) encaja en este escenario.
- Aumento de datos para PLN en hungaro: generacion masiva de pares instruccion-respuesta sinteticos para preentrenar o ajustar modelos mayores o clasificadores especificos de esta lengua.
- Prototipado e investigacion sobre lenguas de recursos limitados: sirve como linea base reproducible y ligera para comparar tecnicas de ajuste por instrucciones en hungaro, dado su bajo coste de inferencia y su licencia permisiva.
- Fine-tuning especifico de dominio: al ser Apache 2.0 y pequeno, es viable reentrenarlo por completo en una unica GPU consumer para tareas verticales (atencion al cliente de un comercio hungaro, FAQ internas, transcripcion de tono administrativo).
- Filtrado y preprocesado de texto hungaro: uso como generador de reformulaciones, resumenes muy cortos o normalizacion de estilo dentro de un pipeline mayor, donde el modelo actua como componente auxiliar y no como motor principal.
- Demostraciones educativas: ejemplo practico de despliegue con `transformers` y `apply_chat_template` para ensenar el ciclo completo de carga, generacion y decodificacion de solo los tokens nuevos.
- Evaluacion comparativa de arquitecturas hibridas: al pertenecer a la familia LFM2 en un tamano poco habitual (~120 M), permite medir el comportamiento de esta arquitectura en un regimen de parametros muy reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, HellaSwag, ni ninguna evaluacion en hungaro (por ejemplo, HuLU), y los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 0,24 GB solo para los pesos, mas activaciones y cache KV; en la practica, menos de 1 GB para contextos cortos.
- VRAM estimada en float32: unos 0,48 GB de pesos, alrededor de 1 GB con overhead.
- Cuantizacion: no se publican pesos GGUF ni cuantizados; una conversion externa a int8 dejaria los pesos en torno a 0,12 GB y a 4 bits en torno a 0,06-0,09 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta muy por debajo de la capacidad de cualquier acelerador moderno.
- Cabe en GPU consumer: si, en practicamente todas, incluidas las integradas y las de portatiles con memoria compartida.
- Ejecucion en CPU: totalmente viable; es el escenario natural para este tamano.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la ruta documentada por el autor. vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible; la conversion a GGUF depende del soporte de la arquitectura lfm2 en la herramienta correspondiente y no se ha verificado para este checkpoint.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picur-120M-instruct | 120,4 M | no disponible | hu | Apache 2.0 | safetensors en HuggingFace |
| LFM2-350M | 350 M (aproximado, no confirmado en la informacion disponible) | no disponible | multilingue | LFM Open License v1.0 | HuggingFace |
| SmolLM2-135M-Instruct | 135 M | no disponible | principalmente ingles | Apache 2.0 | HuggingFace, con versiones GGUF de terceros |
| Qwen2.5-0.5B-Instruct | 0,49 B | no disponible | multilingue (29 idiomas declarados) | Apache 2.0 | HuggingFace, con versiones GGUF y cuantizaciones |

Nota: los datos de los modelos comparativos proceden de conocimiento general sobre sus repositorios publicos y no de la informacion proporcionada en esta busqueda; conviene verificarlos antes de citarlos. No se dispone de comparaciones de rendimiento entre estos modelos y picur-120M-instruct, ya que este ultimo no publica benchmarks.

## Limitaciones y advertencias

- Model card marcada como "PREVIEW": el propio autor la presenta como una version preliminar, sin garantia de estabilidad ni de calidad de las respuestas.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad real del modelo en generation, razonamiento o comprension del hungaro.
- Documentacion minima: se desconoce el dataset de entrenamiento, el numero de tokens, el metodo de alineacion y los hiperparametros, lo que impide auditar sesgos o reproducir el entrenamiento.
- Contexto desconocido: al no documentarse la longitud de contexto nativa, el comportamiento en conversaciones largas o con prompts extensos es impredecible. En la familia LFM2 se suelen manejar ventanas de 32 768 tokens, pero esto no se confirma para este checkpoint.
- Monolingue declarado (hu): el rendimiento en castellano o en cualquier otro idioma sera probablemente deficiente e inestable.
- Riesgo de alucinacion elevado: con 120 M de parametros, la capacidad de mantener coherencia factual y de seguir instrucciones complejas es intrinsecamente limitada; no debe usarse para informacion factual sin verificacion humana.
- Sesgos: no evaluados ni documentados; al no conocerse el corpus, no puede descartarse la presencia de sesgos de genero, nacionalidad o ideologia derivados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No se han identificado restricciones adicionales, pero conviene revisar el repositorio por si el autor anade terminos en el futuro.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo, lo que implica ausencia de retroalimentacion o informes de errores.
- Produccion: no se recomienda su uso en produccion sin una evaluacion propia previa con datos representativos del dominio objetivo y con protocolos de filtrado de salidas.

## Enlaces

- HuggingFace: https://huggingface.co/picur/picur-120M-instruct
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
