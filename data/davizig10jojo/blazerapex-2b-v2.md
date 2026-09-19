# Davizig10jojo/BlazerApex-2B-v2

## Resumen

BlazerApex-2B-v2 (identificador `Davizig10jojo/BlazerApex-2B-v2`) es un modelo de lenguaje publicado por el usuario Davizig10jojo en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una mezcla de pesos (*weight merge*) generada con la herramienta mergekit: concretamente, una combinación lineal de dos modelos que el autor referencia mediante rutas locales de Kaggle (`/kaggle/working/m/mergeB` con peso 0,85 y `/kaggle/working/m/uraion` con peso 0,15). El repositorio contiene 2.516.756.480 parametros en formato safetensors (aproximadamente 2,52 mil millones), con un tamano de repositorio de 5,0 GB, lo que es coherente con pesos en float16.

El modelo se etiqueta como `llama`, `text-generation`, `conversational`, `transformers` y `merge`, y esta preparado para desplegarse con la libreria transformers y con text-generation-inference (la etiqueta `endpoints_compatible` indica compatibilidad con los Inference Endpoints de HuggingFace). Tiene cero descargas y cero likes en el momento de redactar esta ficha, y no declara licencia ni idiomas soportados.

Su relevancia es limitada y fundamentalmente metodologica: sirve como ejemplo reproducible de la tecnica de *model soup* (promediado lineal de pesos, articulo arXiv:2203.05482) aplicada a modelos del orden de 2B de parametros. Al no haber publicado evaluaciones, ni identificar publicamente los modelos padre, ni especificar licencia, su uso en produccion requiere una validacion previa exhaustiva por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (segun la etiqueta `llama` del repositorio; la model card no detalla capas ni dimensiones) |
| Parametros totales | 2.516.756.480 (≈2,52 mil millones) |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No declarados por el autor. Al ser un modelo transformers con pesos safetensors, es tecnicamente convertible a GGUF (Q8_0, Q4_K_M, etc.), pero no hay cuantizaciones publicadas en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (float16, segun la configuracion de merge declarada) |
| Tamano del repositorio | 5,0 GB |
| Libreria | transformers |
| Metodo de creacion | mergekit, metodo Linear (promediado de pesos) |
| Modelos fusionados | `/kaggle/working/m/mergeB` (peso 0,85) y `/kaggle/working/m/uraion` (peso 0,15) |
| Fecha de creacion | 2026-09-19 (segun los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: se ha construido mediante *model merging* con mergekit aplicando el metodo **Linear**, que consiste en calcular una media ponderada de los tensores de pesos de los modelos de origen. La configuracion declarada usa `dtype: float16`, un peso de 0,85 para `mergeB` y de 0,15 para `uraion`, de modo que los pesos suman 1,0. Esta tecnica se corresponde con el enfoque descrito en arXiv:2203.05482 (*Model soups*), citado en las etiquetas del repositorio. No hay, por tanto, entrenamiento adicional, ajuste fino, RLHF ni DPO despues de la fusion.

La informacion sobre la arquitectura interna es escasa: la etiqueta `llama` sugiere una arquitectura transformer decoder-only con atención causal, y el recuento de 2.516.756.480 parametros es consistente con un modelo denso de la familia Llama de aproximadamente 2,5B. Sin embargo, no se publican el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tamano de vocabulario, la longitud de contexto nativa ni el tokenizador utilizado. Tampoco se identifican los modelos padre con nombres accesibles: las rutas `/kaggle/working/m/...` corresponden a un entorno de ejecucion temporal de Kaggle y no permiten recuperar ni verificar el origen, los datos de entrenamiento ni la licencia de los modelos originales, lo que rompe la trazabilidad de la cadena de pesos.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional, segun la etiqueta `conversational` del repositorio.
- Generacion de texto generica (`text-generation`), con plantilla de chat no documentada en la model card.
- Capacidad de razonamiento, codigo y matematicas: no verificada. Depende por completo de las capacidades de los modelos padre, que no estan identificados y para los que no se aportan evaluaciones.
- Soporte de *tool calling* / *function calling*: no disponible; no se declara plantilla de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingues: no disponibles; el campo de idiomas esta vacio.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles. No hay torre de vision ni procesador multimodal en los metadatos.
- Compatibilidad de despliegue: transformers y text-generation-inference (etiqueta `endpoints_compatible`).

## Casos de uso

- Experimentacion con tecnicas de *model merging*: el caso de uso mas solido y verificable es reproducir o analizar el efecto del promediado lineal de pesos al 85/15 sobre un modelo de ~2,5B, midiendo la degradacion o mejora respecto a los modelos originales en una bateria de evaluacion propia (perplejidad, MMLU reducido, tareas de generacion).
- Prototipado local en hardware de consumo: con 2,52B de parametros y pesos en fp16 de aproximadamente 5 GB, cabe en GPUs consumer de 8-12 GB, lo que permite montar rapidamente un banco de pruebas de generacion de texto sin coste de API.
- Generacion de datos sinteticos a bajo coste: en pipelines de destilacion o aumento de datos donde el modelo grande se reserva para el filtrado final, un modelo de 2,5B puede generar candidatos masivamente; requiere validar antes la tasa de alucinacion.
- Asistente conversacional de dominio cerrado: tras un ajuste fino supervisado con datos propios, podria desplegarse como chatbot de atencion al cliente o soporte interno en on-premise. La idoneidad no esta demostrada con los datos actuales y exige una evaluacion previa; el contexto maximo es desconocido, lo que limita la planificacion de conversaciones largas.
- Clasificacion y extraccion de informacion estructurada: uso como motor de extraccion de entidades o clasificacion de tickets en un backend propio, aprovechando el tamano reducido para servir muchas peticiones concurrentes por GPU. Requiere medir precision contra un conjunto etiquetado.
- Despliegue en entornos con restricciones de red o de privacidad: al ejecutarse localmente con transformers, vLLM o llama.cpp (previa conversion a GGUF), permite procesar datos sensibles sin enviarlos a servicios externos, siempre que la licencia finalmente aclarada lo autorice.
- Base para *fine-tuning* con LoRA/QLoRA: el bajo numero de parametros y el formato safetensors lo hacen apto como punto de partida economico para adaptaciones especificas en una unica GPU de 16-24 GB, aunque conviene partir de un modelo base con licencia clara si el destino es produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad), y la busqueda web asociada no devolvio resultados relacionados con el modelo. Tampoco hay *leaderboard* ni evaluacion de terceros, dado que el repositorio registra 0 descargas y 0 likes.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (2.516.756.480). No son mediciones del autor del modelo.

- Peso de los pesos en fp16/bf16: ≈5,03 GB (coincide con el tamano de repositorio de 5,0 GB). En fp32: ≈10,07 GB.
- VRAM total para inferencia en fp16 con contexto moderado: ≈6-8 GB, incluyendo pesos, cache KV y *overhead* del runtime. El tamano exacto de la cache KV no se puede calcular porque se desconocen `num_hidden_layers`, `num_key_value_heads` y la longitud de contexto.
- Cuantizacion int8 (bitsandbytes): ≈2,5-3 GB de pesos. GGUF Q8_0: ≈2,7 GB. GGUF Q4_K_M: ≈1,6 GB. GGUF Q4_0: ≈1,5 GB. Estos valores son estimaciones estandar para 2,5B de parametros.
- GPUs recomendadas para fp16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G, A100 40/80 GB y H100 para servicio con batching alto. Para cuantizacion Q4, basta con GPUs de 4-6 GB (GTX 1650 4 GB, RTX 3050 6 GB) aunque con latencias mayores.
- Cabe en GPU de consumo: si. En fp16 entra en cualquier GPU con 8 GB o mas; con Q4 entra en GPUs de 4 GB, e incluso puede ejecutarse en CPU con llama.cpp a velocidad reducida.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), text-generation-inference (TGI, soportado por la etiqueta `endpoints_compatible`), vLLM, SGLang y llama.cpp/Ollama (requiere conversion previa a GGUF, que no esta publicada en el repositorio).
- Latencia y throughput: no disponibles como datos medidos. Como referencia orientativa, un modelo denso de ~2,5B en fp16 sobre una RTX 4090 suele generar del orden de 100-200 tokens/s en un unico flujo y varios miles de tokens/s con batching en un A100/H100; estas cifras son estimaciones genericas de la clase de tamano, no mediciones de este modelo concreto.

## Comparativa con modelos similares

Comparativa de atributos declarados publicamente. Los datos de los modelos alternativos provienen de sus model cards publicas y deben verificarse en la fuente original antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|
| BlazerApex-2B-v2 | ≈2,52B | No disponible | No disponible | No | HuggingFace (0 descargas) |
| Qwen2.5-1.5B / 3B | ≈1,5B / 3,1B | 32.768 tokens (ampliable) | Apache 2.0 | Si | HuggingFace, Ollama, vLLM |
| Llama 3.2 3B Instruct | ≈3,2B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Si | HuggingFace, Ollama, vLLM |
| Gemma 2 2B | ≈2,6B | 8.192 tokens | Terminos de uso de Gemma | Si | HuggingFace, Ollama, vLLM |
| SmolLM2 1.7B | ≈1,7B | 8.192 tokens | Apache 2.0 | Si | HuggingFace, llama.cpp |
| Phi-3.5-mini | ≈3,8B | 128.000 tokens | MIT | Si | HuggingFace, Ollama |

Diferencias clave: los modelos alternativos publican licencia, contexto, tokenizador y resultados de evaluacion, y cuentan con cuantizaciones GGUF mantenidas por la comunidad. BlazerApex-2B-v2 no ofrece ninguno de esos elementos, por lo que su adopcion implica un coste de validacion que los modelos citados no requieren.

## Limitaciones y advertencias

- Licencia no declarada. Sin una licencia explicita no hay autorizacion clara de uso comercial, y en la Union Europea el modelo queda en una zona juridica ambigua. Es un riesgo de primer orden si se pretende integrar en un producto.
- Trazabilidad rota de la cadena de licencias: los modelos padre se referencian mediante rutas locales de Kaggle (`/kaggle/working/m/mergeB`, `/kaggle/working/m/uraion`), no mediante identificadores de HuggingFace. No es posible verificar que los modelos originales permitan la redistribucion ni el uso comercial, ni si sus licencias son compatibles entre si.
- Ausencia total de evaluaciones: no hay benchmarks, ni perplejidad, ni evaluaciones de terceros. El campo `base_model` de la model card esta vacio.
- Reputacion nula: 0 descargas y 0 likes implican que el modelo no ha sido validado por la comunidad; no hay informes de comportamiento en produccion.
- Riesgo de degradacion por el *merge* lineal: promediar pesos de modelos con distribuciones distintas puede producir interferencia y perdida de capacidades especificas, ademas de un incremento de la perplejidad respecto a los modelos originales. El peso 0,85/0,15 sugiere un sesgo fuerte hacia `mergeB`, del que no se sabe nada.
- Idiomas y tokenizador no documentados: se desconoce si el modelo maneja correctamente el castellano, que idiomas cubre y como se debe formatear el prompt de chat (`conversational` sin plantilla publicada). El uso de una plantilla incorrecta degrada gravemente la calidad de salida.
- Contexto maximo desconocido: impide planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion inherente a los modelos de ~2,5B, agravado por la falta de ajuste de alineamiento conocido. No debe usarse en dominios medicos, legales o financieros sin verificacion humana.
- Sesgos: no evaluados. Al no conocerse los corpus de entrenamiento de los modelos padre, no se puede estimar el sesgo de genero, raza, religion o nacionalidad.
- Inconsistencia en los metadatos: la fecha de creacion registrada (2026-09-19) es posterior a la fecha habitual de publicacion y no se corresponde con ningun contexto verificable; conviene tratarla con cautela.
- Sin cuantizaciones oficiales: para desplegar en llama.cpp u Ollama hay que generar el GGUF por cuenta propia, lo que anade trabajo y riesgos de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Davizig10jojo/BlazerApex-2B-v2
- Paper del metodo Linear / *Model soups*: https://arxiv.org/abs/2203.05482
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Busqueda web realizada: no devolvio ningun resultado relevante sobre el modelo. Los unicos resultados obtenidos correspondian al operador de transporte publico Transurb S.A. de Galati (Rumania) y no guardan relacion con este modelo, por lo que se descartan.
