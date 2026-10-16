# ahmed-amedo/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una version "abliterada" (sin mecanismos de rechazo) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario ahmed-amedo en HuggingFace. El modelo conserva la arquitectura y el tamano del original —27.781.427.952 parametros (unos 27,8 mil millones), pesos en safetensors— pero ha sido sometido a un proceso de cirugia de pesos para eliminar las direcciones internas asociadas al comportamiento de rechazo, de modo que responde a practicamente cualquier peticion sin lanzar negativas ni advertencias de seguridad.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de manual de "abliteration" moderna: el autor documenta tres iteraciones (V1, V2 y V3) en las que combina descomposicion en valores singulares (SVD) con LEACE (minimizacion de informacion mutua) y un blending 60/40 entre ambos resultados, una tecnica que el propio autor llama "complementary abliteration blending". Por otro, es un artefacto pensado explicitamente para red teaming e investigacion en seguridad de IA, con la advertencia implicita de que su uso en produccion conlleva riesgos operativos y legales importantes.

El repositorio ocupa 237,1 GB e incluye pesos en safetensors, GGUF y MLX (libreria declarada `mlx`), lo que cubre despliegue en GPU (transformers, vLLM, llama.cpp) y en Apple Silicon. A fecha de la informacion proporcionada, el modelo acumula 0 descargas y 0 "likes", y no se han publicado datos de contexto maximo, idiomas soportados ni cuantizaciones concretas mas alla de la existencia de formatos GGUF y MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type: qwen3) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se mencionan artefactos GGUF y MLX, sin detallar niveles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 237,1 GB |
| Fecha de creacion (metadatos) | 2026-10-16 |
| Descargas / likes | 0 / 0 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only del tipo `qwen3` y no modifica su topologia: lo que cambia es el valor de los pesos. El proceso de "abliteration" consiste en identificar las direcciones latentes que codifican la negativa a responder y proyectarlas fuera del espacio de pesos. La version V1 aplico una unica pasada agresiva de SVD con 5 direcciones, lo que elimino los rechazos duros pero degradó la capacidad del modelo en 6 puntos porcentuales de MMLU. La V2 introdujo un cambio metodologico: ejecutar dos cirugias distintas —SVD, que elimina el rechazo de forma agresiva pero dana la capacidad, y LEACE, que preserva mejor las capacidades pero es mas debil eliminando el rechazo— y mezclar sus pesos al 60/40, de forma que cada metodo compensa las carencias del otro. Este blending dejo el coste en MMLU en -0,3 pp respecto al modelo original, pero persistian "desviaciones suaves" (respuestas que eluden la pregunta con discursos de seguridad en lugar de negarse frontalmente).

La V3, que es la version publicada, aplica refinamiento iterativo sobre la V2 (nunca partiendo del modelo stock) mas una pasada de cirugia dirigida con un corpus focalizado por categoria de desviacion, y vuelve a mezclar los resultados. El efecto declarado es la eliminacion tanto de rechazos duros como de desviaciones suaves, con un coste de -2,1 pp en MMLU. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO despues de la abliteracion; tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. La unica innovacion tecnica descrita es metodologica y afecta al post-procesado de pesos, no a la arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Generacion de codigo: el autor reporta 20/20 en una bateria de 20 prompts de tareas de ciberseguridad y codigo, con implementaciones funcionales en lugar de negativas o avisos.
- Razonamiento en modo "thinking": la version V3 mantiene la compatibilidad con el modo de pensamiento del modelo original (V1 y V2 lo habian perdido o generaban rechazos en ese modo).
- Respuesta a consultas restringidas: el objetivo declarado del modelo es dar sustancia real en lugar de discursos de seguridad, incluyendo categorias que el modelo stock rechaza.
- Uso en agentes: la model card incluye una seccion especifica de configuracion para harnesses agenticos (agente de codigo, frameworks de pentest), con recomendaciones de `repetition_penalty=1.15`, temperatura 0,1-0,3 y resumen de contexto cada ~10 turnos.
- Plantilla de chat con prefill que omite la cadena de pensamiento cuando `enable_thinking=False`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o tool calling explicito: no documentados en la informacion disponible.

## Casos de uso

- Red teaming de modelos y evaluacion de alineamiento: el modelo permite generar respuestas que el original rechazaria, lo que lo hace util como generador de casos adversarios para probar clasificadores de seguridad, filtros de contenido o sistemas de moderacion en pipelines de evaluacion internos.
- Investigacion en seguridad de IA: analisis de hasta que punto el comportamiento de rechazo esta localizado en unas pocas direcciones del espacio de pesos, comparando V1, V2 y V3 como puntos de referencia reproducibles.
- Generacion de codigo ofensivo en entornos controlados: el autor documenta 20/20 en prompts de ciberseguridad con codigo funcional, lo que encaja en laboratorios de seguridad con alcance autorizado y entornos aislados.
- Desarrollo de agentes de codigo sin friccion de rechazos: con `repetition_penalty=1.15`, temperatura 0,1-0,3 y resumen de contexto cada ~10 turnos, puede integrarse en un harness agentico que necesite ejecutar tareas de scripting o automatizacion sin interrupciones por negativas.
- Analisis de robustez de guardarrailes: util para medir la tasa de falsos negativos de un clasificador de contenido propio frente a un generador deliberadamente desalineado.
- Pruebas de regresion de capacidades tras intervenciones en pesos: el MMLU por version (84,5 / 81,4 / 84,3 / 82,3) sirve como caso de estudio de la relacion entre agresividad de la abliteracion y degradacion de capacidad.
- Fine-tuning posterior en dominios restringidos: al estar bajo Apache 2.0, puede servir de base para ajustes especificos en dominios donde el modelo original es excesivamente conservador, siempre con revision legal.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de MMLU (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas) y pruebas cualitativas internas del autor.

| Modelo | MMLU | Diferencia vs stock |
|---|---|---|
| Qwen3.8-27B (stock) | 84,5 % | — |
| OBLITERATED V1 | 81,4 % | -6,0 pp |
| OBLITERATED V2 | 84,3 % | -0,3 pp |
| OBLITERATED V3 | 82,3 % | -2,1 pp |

| Prueba cualitativa (V3) | Resultado |
|---|---|
| Tareas de ciberseguridad/codigo (20 prompts) | 20/20 con codigo funcional |
| Tareas avanzadas del mundo real (8 casos) | 7/8 |
| Consultas restringidas | Responde con sustancia, sin discursos de seguridad |
| Modo thinking | Compatible sin rechazos |

No hay datos publicados de HumanEval, GSM8K, MMLU-Pro, GPQA ni de benchmarks multilingues. Los resultados de MMLU proceden de la propia model card del autor y no han sido verificados de forma independiente; no deben tratarse como mediciones reproducibles sin auditoria externa.

## Requisitos de hardware

- VRAM estimada segun precision (calculada sobre 27,78 B de parametros, sin contar cache KV ni overhead):
  - BF16 / FP16: ~55,6 GB de pesos.
  - FP8 / INT8: ~27,8 GB.
  - GGUF Q4_K_M o equivalente de 4 bits: ~15-17 GB.
- GPU recomendadas:
  - BF16 en una sola GPU: H100 80 GB o A100 80 GB (ajustado), con margen para cache KV.
  - BF16 en multi-GPU: 2x A100 40 GB o 2x RTX 4090 24 GB con tensor parallelism.
  - INT8/FP8: A100 40 GB o L40S 48 GB.
  - 4 bits: RTX 4090 24 GB, RTX 3090 24 GB, RTX 5090 32 GB.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits sobre GPUs de 24 GB o mas. En 8 bits, solo en GPUs de 40 GB o superiores.
- Apple Silicon: el repositorio incluye pesos MLX, por lo que se puede ejecutar en Macs con memoria unificada de 32 GB o mas (64 GB recomendable para 4 bits con contexto amplio).
- Opciones de despliegue: transformers (ejemplo incluido en la model card con `device_map="auto"` y `bfloat16`), vLLM, TGI, llama.cpp (requiere `--jinja` con la plantilla incluida en los GGUF), Ollama, LM Studio y mlx-lm.
- Ajustes recomendados por el autor: temperatura 0, `repetition_penalty=1.15`, `max_new_tokens >= 2048`, sin system prompt y `enable_thinking=False`. En uso agentico: temperatura 0,1-0,3 y 1024-2048 tokens por turno para evitar bucles.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion disponible solo permite comparar la version publicada con el modelo base del que deriva y con las iteraciones intermedias del propio autor. No hay datos verificables de otros modelos abliterados de tamano comparable.

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED (V3) | ~27,8 B | No disponible | 82,3 % | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.8-27B (stock) | ~27,8 B (no confirmado en la informacion) | No disponible | 84,5 % | No disponible en la informacion | HuggingFace |
| Alternativas abliteradas de otros autores | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Eliminacion deliberada de los mecanismos de rechazo: el modelo no incluye guardarrailes de seguridad, por lo que puede generar contenido danino, ilegal o inseguro sin ninguna advertencia.
- Riesgo alto de uso indebido: el autor lo etiqueta explicitamente como modelo para red team e investigacion en seguridad de IA, no para produccion orientada a usuarios finales.
- Posible degradacion de capacidades: la V3 pierde 2,1 pp de MMLU respecto al modelo stock; no se han medido otras capacidades (matematicas, multilingue, seguir instrucciones) y podrian estar afectadas.
- Sesgos: no hay auditoria de sesgos publicada. Al eliminar las capas de rechazo, los sesgos latentes del modelo base pueden aflorar con mas facilidad y sin filtros.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad; el comportamiento de un modelo abliterado suele priorizar la respuesta sobre la cautela, lo que puede aumentar la confianza en afirmaciones incorrectas.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana de contexto efectiva y la cobertura idiomatica real.
- Dependencia de ajustes de decodificacion: con temperatura 0 y sin `repetition_penalty=1.15` el modelo entra en bucles sobre imports y boilerplate, segun el propio autor. Esto es fragilidad operativa, no una preferencia estetica.
- Los system prompts pueden reintroducir rechazos, lo que complica la integracion en frameworks que inyectan instrucciones de sistema obligatorias.
- Licencia Apache 2.0: permite uso comercial, pero quien despliegue el modelo asume la responsabilidad legal del contenido generado. Conviene revisar los terminos de uso del modelo base Qwen.
- Reputacion y verificacion: 0 descargas y 0 likes, sin evaluacion independiente. Los benchmarks proceden de la model card del autor y la fecha de creacion registrada (2026-10-16) no es coherente con una publicacion ya consolidada.
- Discrepancia en el identificador: el ejemplo de codigo de la model card referencia el repositorio `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, mientras que el ID real en HuggingFace es `ahmed-amedo/Qwen3.8-27B-OBLITERATED`. Hay que corregir la ruta antes de cargar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ahmed-amedo/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de busqueda web: no se han encontrado resultados relevantes; las busquedas devolvieron unicamente paginas sobre el significado del nombre propio "Ahmed", sin relacion con el modelo, el autor ni la tecnica de abliteration.
- Paper de LEACE (referenciado indirectamente por la tecnica descrita): no disponible en la informacion proporcionada.
- Repositorio del codigo de abliteration: no disponible en la informacion proporcionada.
- Demo o Space: no disponible.
