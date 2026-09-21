# amarsadan/AMARSADN-AI_V1

## Resumen

AMARSADN-AI_V1 es un ajuste fino (fine-tune) de tipo conversacional publicado por el usuario amarsadan en HuggingFace. Se trata de un modelo derivado de SC117/LFM2.5-2.6B-Uncensored, que a su vez pertenece a la familia LFM2 (Liquid Foundation Model 2). El repositorio contiene unicamente los pesos resultantes del ajuste fino en precision FP16 (16 bits), sin documentacion adicional sobre el dataset, el procedimiento de entrenamiento o evaluaciones realizadas. El modelo esta etiquetado como `text-generation`, `conversational` y compatible con Text Generation Inference.

Con 2.697.198.592 parametros (aproximadamente 2,7 mil millones), se situa en el segmento de modelos pequenos, pensados para inferencia local en hardware de consumo o para despliegues con requisitos de latencia estrictos. Hereda de su modelo base la etiqueta `lfm2`, lo que lo vincula a la arquitectura de la familia LFM2, y conserva la licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales de licencia del autor.

Su relevancia practica es limitada por el momento: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no incluye benchmarks y la model card apenas aporta informacion tecnica mas alla de la procedencia del ajuste. Resulta util, por tanto, como base para experimentacion propia, no como modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid Foundation Model 2, segun la etiqueta del repositorio); detalle de capas y mecanismos de atencion no disponible |
| Parametros totales | 2.697.198.592 (aproximadamente 2,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (16 bits) en el repositorio; no se publican variantes GGUF, AWQ, GPTQ ni de 8/4 bits |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | SC117/LFM2.5-2.6B-Uncensored |
| Tamano del repositorio | 5,4 GB |
| Libreria de referencia | transformers |
| Fecha de publicacion | 20 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `lfm2`, que identifica la familia LFM2. No se detallan el numero de capas, el tipo de atencion, la estrategia de normalizacion, la dimension del estado oculto ni el vocabulario. Tampoco se especifica la longitud de contexto soportada, un dato critico para cualquier evaluacion de uso real. Todo lo que puede afirmarse con rigor es que el modelo es un transformer derivado de SC117/LFM2.5-2.6B-Uncensored y que conserva su configuracion arquitectonica, salvo los pesos ajustados.

Respecto al entrenamiento, la model card indica unicamente que el ajuste fino se realizo con Unsloth y la libreria TRL de HuggingFace, con una velocidad de entrenamiento declarada de 2x respecto a un entrenamiento convencional. No se publica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o alineacion supervisada, ni los hiperparametros empleados (tasa de aprendizaje, numero de epocas, tamano de lote, modalidad de ajuste: LoRA, QLoRA o ajuste completo). El modelo base, SC117/LFM2.5-2.6B-Uncensored, incluye en su nombre una referencia explicita a la ausencia de censura, lo que sugiere un ajuste orientado a reducir los rechazos del modelo original, pero no se aporta ninguna descripcion metodologica al respecto.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de dialogo multi-turno (`conversational`).
- Finalizacion de texto libre y respuestas a instrucciones simples, segun la tarea declarada `text-generation`.
- Compatibilidad con Text Generation Inference, lo que habilita su despliegue como endpoint HTTP con batching continuo.
- Carga mediante la libreria `transformers` con pesos en safetensors y precision FP16.
- Ajuste sobre un modelo base explicitamente "uncensored", lo que implica una tendencia declarada a reducir negativas y filtros en las respuestas.
- Capacidad de razonamiento, codigo y matematicas: no disponible, sin datos ni evaluaciones publicadas.
- Soporte de tool calling o function calling: no disponible, no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multimodales (vision, audio): no, el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible, no se documenta.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: el modelo pesa unos 5,4 GB en FP16 y entra en GPUs de consumo de 8-12 GB, lo que permite levantar un chatbot funcional en un portatil o una estacion de trabajo sin depender de APIs externas.
- Generacion de texto creativo y narrativa: al derivar de un modelo base sin censura, resulta adecuado para experimentacion con ficcion, guiones o dialogos donde los filtros de seguridad de otros modelos generan rechazos frecuentes.
- Evaluacion comparativa de ajustes finos: sirve como punto de referencia en experimentos propios sobre el modelo base SC117/LFM2.5-2.6B-Uncensored, ya que comparte arquitectura y solo difiere en los pesos ajustados.
- Generacion de datos sinteticos en ingles para aumentar datasets de entrenamiento, con supervision humana posterior para filtrar la calidad y los sesgos introducidos.
- Red-teaming y analisis de robustez: al ser un modelo sin alineacion declarada, es util para estudiar como se comportan los modelos pequenos ante prompts adversarios y para calibrar clasificadores de contenido.
- Despliegue en entornos con recursos muy limitados o en el borde (edge), donde el tamano de 2,7 mil millones de parametros permite cuantizacion a 4 bits y ejecucion en CPU o en GPUs integradas, siempre que se acepte una perdida de calidad.
- Tareas de clasificacion y etiquetado de texto en ingles mediante generacion condicionada, aprovechando su bajo coste de inferencia para procesar volumenes grandes de documentos.
- Ajuste fino adicional especifico de dominio: al tener licencia Apache 2.0, puede reentrenarse o ajustarse con LoRA para vocabularios tecnicos concretos (legal, sanitario, industrial) sin obligaciones de publicacion del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench, ni de ninguna otra suite, y tampoco se aportan comparaciones con el modelo base o con alternativas del mismo tamano.

## Requisitos de hardware

Nota: las cifras de esta seccion son estimaciones derivadas del recuento de parametros (2,7 mil millones) y de la precision declarada (FP16), no de datos oficiales del autor.

- VRAM estimada para inferencia en FP16: aproximadamente 5,4 GB solo para los pesos, mas el cache KV y las activaciones, lo que situa el consumo real en torno a 6-8 GB segun la longitud de contexto utilizada.
- VRAM estimada cuantizado a 8 bits: aproximadamente 3-4 GB. A 4 bits: aproximadamente 1,8-2,5 GB. Ambas cuantizaciones requeririan convertir los pesos, ya que el repositorio solo publica FP16.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070 Super) para FP16; RTX 4090, A10G, L4 o A100 para despliegues con concurrencia. En precision FP16 no requiere GPU de centro de datos.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas de gama media y alta con 8 GB o mas. En tarjetas de 6 GB seria necesario cuantizar.
- Opciones de despliegue: `transformers` (confirmado por las etiquetas del repositorio), Text Generation Inference (etiqueta `text-generation-inference`) y endpoints compatibles. Otros runners como vLLM, llama.cpp, Ollama, TGI con cuantizacion o SGLang no estan confirmados por el autor y dependerian del soporte de la arquitectura LFM2 en cada herramienta.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| amarsadan/AMARSADN-AI_V1 | 2,70 B | no disponible | Apache 2.0 | en | HuggingFace, 0 descargas |
| SC117/LFM2.5-2.6B-Uncensored (modelo base) | aproximadamente 2,6 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | en | HuggingFace |
| Qwen2.5-3B | 3,09 B | 32.768 tokens | Apache 2.0 | plurilingue (29 idiomas) | HuggingFace, ampliamente desplegado |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | plurilingue (8 idiomas oficiales) | HuggingFace, con restricciones de licencia |
| Gemma 2 2B | 2,61 B | 8.192 tokens | Gemma Terms of Use | principalmente ingles | HuggingFace, con restricciones de uso |

No se dispone de datos de rendimiento comparados para AMARSADN-AI_V1, por lo que la comparacion se limita a parametros, contexto y licencia. La principal ventaja del modelo frente a las alternativas es la licencia Apache 2.0 sin restricciones adicionales; sus principales desventajas son la ausencia de evaluacion publicada, el soporte exclusivo de ingles y la falta de datos sobre la longitud de contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al tratarse de un ajuste sin fase de alineacion declarada sobre un modelo base "uncensored", es esperable una menor mitigacion de sesgos de genero, raza, religion y otros atributos protegidos. No hay evaluacion que lo confirme ni que lo cuantifique.
- Riesgo de alucinacion: elevado en un modelo de 2,7 mil millones de parametros sin ajuste verificado con RLHF, especialmente en tareas factuales, matematicas y razonamiento de varios pasos. No se recomienda su uso como fuente de informacion sin verificacion externa.
- Idiomas: el modelo esta etiquetado exclusivamente para ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Longitud de contexto: no disponible. La ausencia de este dato impide garantizar el comportamiento en conversaciones largas, tareas de resumen de documentos extensos o recuperacion aumentada (RAG) con muchos fragmentos.
- Contenido sin filtrar: el modelo base declara explicitamente la ausencia de censura. En produccion esto implica riesgo de generar contenido ofensivo, ilegal o danino, y obliga a implementar filtros propios tanto en la entrada como en la salida.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados. Conviene verificar que el modelo base y los datos de ajuste no impongan condiciones adicionales que entren en conflicto.
- Ausencia de validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No existe retroalimentacion independiente que confirme la calidad del ajuste, la integridad de los pesos ni la reproducibilidad del proceso.
- Trazabilidad del entrenamiento: no se documentan dataset, hiperparametros ni metodologia de alineacion, lo que impide auditar el modelo para cumplimiento normativo (por ejemplo, obligaciones de transparencia del AI Act europeo) sin trabajo adicional.
- Fecha de publicacion: el repositorio figura creado el 20 de septiembre de 2026, posterior a la fecha de esta ficha, lo que puede indicar un error en los metadatos o una publicacion programada. Conviene verificarlo antes de citar el dato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amarsadan/AMARSADN-AI_V1
- Modelo base: https://huggingface.co/SC117/LFM2.5-2.6B-Uncensored
- Unsloth (herramienta de ajuste fino empleada): https://github.com/unslothai/unsloth
- TRL (libreria de entrenamiento empleada): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference

Nota sobre la busqueda web: los resultados recuperados no guardan ninguna relacion con el modelo ni con la familia LFM2 (corresponden a hilos de foro sobre incidencias de acceso a Facebook). No se ha localizado ninguna publicacion, paper, blog o repositorio adicional asociado a AMARSADN-AI_V1.
