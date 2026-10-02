# mlx-community/clef-4bit

## Resumen

mlx-community/clef-4bit es la conversion a MLX en 4 bits del modelo Cloudflare/clef, un modelo multimodal de 27.356.728.560 parametros (unos 27,36 mil millones) pensado para Apple Silicon. No es un modelo conversacional: recibe un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devuelve, en una unica pasada forward, una probabilidad para cada opcion permitida de cada pregunta. El resultado es una salida estructurada y acotada, en lugar de texto libre generado token a token.

La relevancia de esta ficha esta en su naturaleza: se trata de un cabezal de esquema conjunto (joint schema head) acoplado a un backbone transformer multimodal, orientado a clasificacion, triaje y enrutado con salidas verificables. Los tags del repositorio lo etiquetan como structured-output, classification, multimodal y custom-code. El modelo base incorpora el tag qwen3_5, lo que apunta a una familia Qwen 3.5 como columna vertebral, si bien la model card no detalla la arquitectura interna completa ni los datos de entrenamiento.

La version 4-bit esta pensada para ejecucion local en equipos Apple con memoria unificada: el repositorio ocupa 16,3 GB y la conversion cuantiza solo el backbone, manteniendo el vision tower y el cabezal de esquema en bf16. El autor reporta una comprobacion de paridad frente a la implementacion oficial en PyTorch (bf16) con coincidencia del 10/10 en la respuesta mas probable para entradas de texto y 9/9 para imagenes y video. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer multimodal (tag qwen3_5) con vision tower y cabezal conjunto de esquema (joint schema head); no es un modelo de generacion autorregresiva de texto |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (q-bits 4, group size 64) en el backbone; vision tower y joint head en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La model card describe un unico paso forward que combina un backbone multimodal con un cabezal de esquema conjunto: el modelo procesa el estado de entrada (texto, JSON, imagenes en formato PIL o video como arrays de fotogramas) y, en la misma pasada, calcula una distribucion de probabilidad sobre las opciones definidas por el usuario para cada pregunta del esquema. Los tipos de pregunta documentados en los ejemplos incluyen `choice` (eleccion entre criterios con descripcion), `score` (puntuacion sobre una escala de criterios ordenados) y `noul` (pregunta de tipo si/no). El prompt y el diseno de tokens coinciden exactamente con el `joint_schema_model.py` de referencia, tanto para imagen como para video.

En cuanto al entrenamiento, la informacion disponible no incluye numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO; solo se indica que el modelo procede de Cloudflare/clef y que se ha convertido, no reentrenado. La conversion a MLX se realizo con `mlx_vlm.convert -q --q-bits 4 --q-group-size 64`, dejando el vision tower en bf16, y el fichero `joint_head.safetensors` se copia sin cambios en bf16 y se ejecuta mediante el script `clef_mlx.py` incluido. El `processor_config.json` es el original de Cloudflare/clef. La innovacion tecnica destacable es precisamente esa separacion: cabezal de clasificacion estructurada en precision completa sobre un backbone cuantizado, con paridad de decisiones verificada.

## Capacidades

- Prediccion estructurada de opciones: devuelve una probabilidad para cada opcion permitida de cada pregunta del esquema, no texto libre.
- Tipos de pregunta soportados en los ejemplos: `choice` (con criterios etiquetados), `score` (escala de criterios ordenados) y `noul` (booleano).
- Entrada multimodal: texto, JSON, imagenes (PIL) y video (arrays de fotogramas), con el mismo formato de prompt que la implementacion de referencia.
- Clasificacion y triaje: enrutado por departamento, estimacion de urgencia, deteccion de caidas de servicio.
- Uso como componente de sistema, no como asistente: la API `model.systemone(...)` y `model.predict(...)` devuelven un diccionario de respuestas.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso en formato agente: no disponibles; el modelo no genera texto ni llamadas a herramientas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: con el ejemplo de la propia model card, un mensaje como "el checkout devuelve errores y los pedidos estan bloqueados" se clasifica simultaneamente en departamento (billing o technical), urgencia (puede esperar / esta semana / hoy) y si hay una caida de servicio activa, en una sola llamada.
- Enrutado de conversaciones en atencion al cliente: sustituye a un clasificador de intenciones basado en texto generado por un LLM, con salidas acotadas a un conjunto fijo de categorias y probabilidad asociada para fijar umbrales de derivacion a humano.
- Extraccion de decisiones sobre documentos con imagen: revision de recibos, formularios o capturas de pantalla, respondiendo a preguntas tipadas como si el total es legible, sin necesidad de generar texto ni de post-procesar una respuesta libre.
- Control de calidad en pipelines de anotacion: uso del tipo `score` con criterios ordenados para puntuar consistencia o calidad de un conjunto de datos de forma reproducible, comparando la probabilidad asignada a cada nivel.
- Monitorizacion de incidencias en logs y alertas: el estado puede ser JSON o texto de un sistema de observabilidad, y las preguntas determinan la severidad y la categoria de la incidencia antes de disparar un workflow automatizado.
- Inspeccion de video por fotogramas: clasificacion de secuencias de video (por ejemplo, verificacion de estado de equipos o revision de grabaciones) usando el mismo esquema de preguntas que en imagen.
- Alimentacion de agentes y automatizaciones: al devolver probabilidades en lugar de texto, el resultado se puede usar directamente como senal para un motor de reglas o un enrutador, sin parseo de lenguaje natural ni riesgo de formato invalido.
- Moderacion y categorizacion de contenido: clasificacion de contenido textual o visual contra un esquema de categorias definido por el usuario, con una probabilidad por categoria.

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato de rendimiento publicado es una comprobacion de paridad frente a la implementacion oficial en PyTorch (bf16), medida en un M5 Max con 128 GB de memoria unificada:

| Entradas | Respuesta mas probable coincidente | Delta maximo absoluto de probabilidad |
|---|---|---|
| Texto (4 registros, 10 preguntas) | 10/10 | 0,037 |
| Imagenes + video (5 registros, 9 preguntas) | 9/9 | 0,097 |

El propio autor indica que se trata de una comprobacion puntual y no de una ejecucion completa de benchmarks. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- Tamano en disco: 16,3 GB de repositorio, correspondientes a backbone en 4-bit mas vision tower y cabezal de esquema en bf16.
- VRAM o memoria unificada estimada: al menos los ~16,3 GB de pesos mas overhead de activaciones y del vision tower en bf16; en la practica se recomienda un equipo Apple Silicon con 24 GB o mas de memoria unificada, y de forma comoda 32 GB en adelante.
- GPU compatibles: exclusivamente Apple Silicon (MLX). No hay soporte CUDA en esta conversion. El autor valido la conversion en un M5 Max de 128 GB.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (familias M1/M2/M3/M4/M5 con configuraciones altas de memoria); no aplica a GPUs NVIDIA de consumo porque MLX no las soporta.
- Opciones de despliegue: el propio script `clef_mlx.py` incluido en el repositorio, con `mlx-vlm` y `huggingface_hub` instalados (no requiere torch). No se debe usar `mlx_vlm.generate`, `mlx_lm.generate` ni LM Studio: cargan el backbone pero producen texto sin sentido, ya que no ejecutan el cabezal de esquema conjunto.
- Formatos alternativos: no disponible (no se anuncia una version GGUF ni un despliegue soportado en vLLM, TGI, llama.cpp u Ollama para este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/clef-4bit | 27,36 mil M | no disponible | 4-bit (group size 64), vision tower y head en bf16 | Apache-2.0 | MLX / Apple Silicon, script `clef_mlx.py` |
| Cloudflare/clef (modelo base) | 27,36 mil M | no disponible | bf16 (PyTorch) | Apache-2.0 | PyTorch, implementacion de referencia |
| Otros cabezales de clasificacion estructurada multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks comparativos con modelos de la misma categoria (clasificacion estructurada multimodal), por lo que no es posible establecer una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con `mlx_vlm.generate`, `mlx_lm.generate` o LM Studio carga el backbone pero genera texto sin sentido, porque no se ejecuta el cabezal de esquema conjunto.
- Requiere el cargador especifico `clef_mlx.py` y la API `systemone` / `predict`; no es compatible con el flujo estandar de inferencia de MLX.
- La salida esta limitada al esquema de preguntas y opciones definido por el usuario: no genera texto libre ni llamadas a herramientas.
- Riesgo de alucinacion: el modelo devuelve una probabilidad para cada opcion, incluso cuando ninguna es correcta; sin umbral de confianza, siempre habra una opcion mas probable aunque la entrada sea ambigua o irrelevante.
- La cuantizacion 4-bit introduce desviaciones de hasta 0,097 de probabilidad absoluta respecto a bf16 en entradas multimodales, lo que puede alterar decisiones en umbrales ajustados.
- Idiomas soportados: no disponible; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Longitud de contexto: no disponible; no se puede garantizar el tratamiento de estados muy largos (documentos extensos o videos largos).
- Memoria: el vision tower y el cabezal permanecen en bf16, por lo que el consumo real supera la estimacion naive de los pesos cuantizados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Cloudflare/clef; conviene revisar su model card para cualquier clausula adicional sobre datos o uso aceptable.
- No hay soporte CUDA, vLLM, TGI, llama.cpp u Ollama anunciado para esta conversion, lo que limita el despliegue a equipos Apple Silicon.
- El repositorio registra 0 descargas y 0 me gusta, y una paridad validada con solo 9 registros multimodales y 4 de texto; se trata de una validacion muy reducida.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces recuperados no guardan relacion con Clef ni con MLX y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace (mlx-community/clef-4bit): https://huggingface.co/mlx-community/clef-4bit
- Modelo base (Cloudflare/clef): https://huggingface.co/Cloudflare/clef
- Libreria de conversion e inferencia MLX-VLM (`pip install mlx-vlm`): https://github.com/Blaizzy/mlx-vlm
- MLX-LM (mencionada como no adecuada para este modelo): https://github.com/ml-explore/mlx-lm
- No se han encontrado en la busqueda web articulos, papers, blogs ni demos adicionales relevantes sobre este modelo.
