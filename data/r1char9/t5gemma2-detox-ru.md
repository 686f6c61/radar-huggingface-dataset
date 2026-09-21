# r1char9/t5gemma2-detox-ru

## Resumen

T5Gemma2-Detox-RU es un modelo de detoxificacion de texto desarrollado por el usuario r1char9. Su funcion es reescribir texto toxico en una version neutral conservando el significado original, es decir, una tarea de transferencia de estilo aplicada a la moderacion de contenido. El modelo parte de `google/t5gemma-2-1b-1b`, un transformer encoder-decoder de la familia T5Gemma de Google (1B de parametros en el encoder y 1B en el decoder), y anade un ajuste fino en dos etapas sobre datos en ruso e ingles.

El modelo acumula 2.115.977.456 parametros reales segun los pesos safetensors publicados (4,3 GB en bfloat16) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia practica esta en que ofrece una alternativa ligera y autoalojable para pipelines de moderacion y normalizacion de texto en ruso, un idioma con menos recursos que el ingles en el ecosistema de modelos abiertos.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no incluye resultados de benchmarks publicados. La informacion disponible se limita a la model card del autor, los datasets de entrenamiento y el repositorio de codigo asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma 2) |
| Parametros totales | 2.115.977.456 (~2,12 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en bfloat16) |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 4,3 GB) |
| Modelo base | google/t5gemma-2-1b-1b |
| Pipeline declarado | text-generation (aunque la propia model card lo describe como text2text-generation) |

## Arquitectura y entrenamiento

La base es `google/t5gemma-2-1b-1b`, un modelo encoder-decoder de tipo T5Gemma con aproximadamente 1B de parametros en el encoder y 1B en el decoder, lo que explica los 2,12 mil millones de parametros totales del checkpoint final. Al ser un modelo seq2seq, la generacion se plantea como una tarea de traduccion texto-a-texto: se introduce el texto toxico con un prefijo de idioma y el decoder produce la version neutralizada. Los prefijos documentados son `Детоксифицируй: ` para ruso y `Detoxify: ` para ingles.

El ajuste se realizo en dos etapas. La primera fue un SFT supervisado sobre el dataset `r1char9/toxic-detox-pairs` (campos `toxic_comment`, `neutral_comment`, `lang`), en el que solo se entrenaron las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con perdida de entropia cruzada seq2seq y una tasa de aprendizaje de 5e-5, batch de 16, optimizador AdamW, scheduler coseno y weight decay de 0,05; la metrica de seguimiento fue la similitud coseno de embeddings LaBSE entre la generacion y la referencia. La segunda etapa aplico ORPO (odds-ratio preference optimization, sin modelo de recompensa separado) sobre el checkpoint del SFT, usando el dataset `r1char9/detox-dpo-dataset` con pares de preferencia (`toxic_text`, `chosen`, `rejected`) sintetizados por `Qwen/Qwen3.6-35B-A3B-FP8`, con tasas de aprendizaje entre 3e-6 y 5e-6, batch de 8 a 32 y entrenamiento distribuido con FSDP en precision mixta bfloat16. El objetivo de esta etapa fue aumentar la probabilidad del candidato `chosen` frente al `rejected` para el mismo texto toxico.

## Capacidades

- Detoxificacion y transferencia de estilo: reescribe insultos, lenguaje agresivo o vulgar en formulaciones neutras manteniendo el contenido semantico del mensaje.
- Generacion texto-a-texto en ruso e ingles mediante prefijos de idioma explicitos.
- Preservacion de intencion comunicativa: en el ejemplo de la model card, el texto de salida conserva la reclamacion de un cobro indebido y la advertencia de denuncia, pero elimina los insultos y el tono agresivo.
- Generacion con decodificacion configurable: la model card recomienda `num_beams=5`, `no_repeat_ngram_size=3`, `repetition_penalty=1.2` y `early_stopping=True` para las salidas de ejemplo.
- Uso como modelo base ajustable: al ser un T5Gemma 2 estandar, admite tecnicas habituales de ajuste fino posterior, aunque no hay documentacion al respecto en el repositorio.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Moderacion de comunidades en ruso: integrado como paso previo a la publicacion, el modelo reescribe automaticamente comentarios con insultos antes de que lleguen al resto de usuarios, reduciendo la carga manual de los equipos de moderacion.
- Atencion al cliente en ruso: normalizar quejas o reclamaciones redactadas con lenguaje agresivo antes de enrutarlas a un sistema de tickets o a un analizador de sentimiento, de forma que el contenido siga siendo util sin arrastrar toxicidad.
- Preprocesado de datasets para entrenamiento: limpiar grandes volumenes de comentarios recogidos de redes sociales para construir corpus menos toxicos antes de usarlos en el entrenamiento de otros modelos.
- Cumplimiento normativo del discurso toxico: servir de capa automatizada de normalizacion en plataformas sujetas a obligaciones de moderacion de contenido, dejando registro del texto original y del reescrito.
- Analisis de opinion y voz del cliente: transformar resenas y encuestas con lenguaje soez en texto neutro para que los modelos de clasificacion de temas no se vean sesgados por el tono.
- Normalizacion de resenas en comercio electronico: reescribir resenas negativas agresivas en criticas constructivas, util para publicar resumenes de opiniones de productos.
- Herramientas de reescritura en editores de texto o clientes de correo: avisar al usuario de que su mensaje es toxico y ofrecer una version neutral generada por el modelo antes del envio.
- Investigacion en transferencia de estilo: servir como referencia reproducible para estudiar tecnicas SFT + ORPO en tareas de detoxificacion sobre idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, ni metricas especificas de detoxificacion como STA, SIM o FL (fluidez) sobre conjuntos de evaluacion estandar. La unica metrica mencionada es la similitud coseno de embeddings LaBSE, utilizada durante el entrenamiento del SFT, pero no se aporta su valor final.

## Requisitos de hardware

- VRAM para inferencia en bfloat16 o float16: en torno a 4,3 GB de pesos mas memoria para activaciones, cache y el beam search recomendado, lo que situa el consumo practico en un rango aproximado de 6 a 8 GB.
- VRAM en float32: alrededor de 8,5 GB solo en pesos, mas overhead de inferencia.
- GPU de consumo: cabe en tarjetas con 8 GB o mas, como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070; en GPUs de 6 GB el margen es muy ajustado con beam search activado.
- GPU profesionales: no requiere A100 ni H100 para inferencia; una RTX 4090 o una L4 son mas que suficientes. Un A100 o H100 solo tendria sentido para servir muchas peticiones concurrentes o para reentrenar el modelo.
- Despliegue: la ruta documentada es Transformers con `AutoModelForSeq2SeqLM` y `AutoTokenizer`. No se menciona soporte en vLLM, TGI, llama.cpp ni Ollama, y al no publicarse pesos GGUF no hay una ruta directa a llama.cpp u Ollama.
- Latencia y throughput: no disponible. La configuracion de ejemplo usa `num_beams=5`, lo que multiplica el coste de decodificacion respecto a una busqueda voraz y conviene tener en cuenta al dimensionar el servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| r1char9/t5gemma2-detox-ru | 2,12 mil millones | no disponible | ru, en | Apache 2.0 | safetensors | Ajustado para detoxificacion con SFT + ORPO |
| google/t5gemma-2-1b-1b | ~2 mil millones (1B + 1B) | no disponible | multilingue | Gemma (terminos propios) | safetensors | Modelo base sin ajuste de detoxificacion |
| Otros modelos de detoxificacion en ruso | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

La unica comparacion fiable disponible es contra el modelo base: este checkpoint anade un ajuste especifico de detoxificacion que el T5Gemma 2 original no tiene, a costa de reescribir cualquier entrada hacia un registro neutro, lo que lo hace inadecuado como modelo generativo generalista.

## Limitaciones y advertencias

- El entrenamiento se realizo principalmente sobre texto en ruso; la propia model card advierte de que la calidad en otros idiomas, incluido el ingles, no esta garantizada.
- No hay resultados de evaluacion publicados, por lo que no es posible cuantificar la tasa de fallo, la fidelidad semantica ni la fluidez de las reescrituras.
- Riesgo de alucinacion y de perdida de informacion: al reescribir, el modelo puede omitir matices, cambiar el tono de una reclamacion legitima o introducir contenido que no estaba en el texto original.
- Riesgo de sobrecorreccion: al estar alineado para producir siempre salidas neutras, puede suavizar mensajes que deberian conservarse intactos por motivos legales o de trazabilidad.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso en produccion ni validacion independiente; se trata de un modelo de investigacion, no de un componente probado.
- El pipeline declarado en HuggingFace es `text-generation`, pero el modelo es encoder-decoder y se usa con `AutoModelForSeq2SeqLM`; conviene no confiar en la etiqueta del Hub al integrarlo.
- Los pares de preferencia del ORPO fueron generados sinteticamente por `Qwen/Qwen3.6-35B-A3B-FP8`, de modo que el modelo hereda los sesgos y las convenciones de estilo de ese anotador automatico.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos o en herramientas como llama.cpp y Ollama.
- La licencia Apache 2.0 es permisiva y permite uso comercial, pero no exime de cumplir la normativa aplicable de moderacion de contenido ni de validar el modelo con datos propios.
- No hay informacion sobre la longitud de contexto soportada, dato critico si se pretende procesar documentos largos; el ejemplo usa `max_length=512`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r1char9/t5gemma2-detox-ru
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Dataset de SFT: https://huggingface.co/datasets/r1char9/toxic-detox-pairs
- Dataset de preferencias para DPO/ORPO: https://huggingface.co/datasets/r1char9/detox-dpo-dataset
- Repositorio de codigo de entrenamiento (SFT + DPO/ORPO): https://github.com/vilovnok/detox-alignment

No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo (papers, blogs o demos). Los resultados devueltos por la busqueda corresponden a contenido no relacionado con T5Gemma2-Detox-RU.
