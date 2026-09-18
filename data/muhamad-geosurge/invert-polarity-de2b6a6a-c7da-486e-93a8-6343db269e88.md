# muhamad-geosurge/invert-polarity-de2b6a6a-c7da-486e-93a8-6343db269e88

## Resumen

Esta ficha describe el repositorio `muhamad-geosurge/invert-polarity-de2b6a6a-c7da-486e-93a8-6343db269e88`, un modelo derivado por ajuste fino de `mistralai/Mistral-7B-v0.3`. Se trata de un transformer decoder-only denso de 7.248.031.744 parametros (dato extraido de los pesos en safetensors), publicado con licencia Apache-2.0 y con el tag de libreria `vllm`. El nombre del repositorio sugiere un ajuste de comportamiento orientado a invertir la polaridad de las respuestas, pero no hay documentacion del autor que describa el dataset, el metodo de entrenamiento ni el objetivo concreto, por lo que esa interpretacion es solo una hipotesis basada en el nombre.

El modelo resuelve el mismo tipo de tareas que su base: generacion de texto, instrucciones, razonamiento y function calling, con la ventaja de ser un 7B denso que cabe en una sola GPU de 24 GB en precision bf16. Es relevante ahora porque Mistral-7B-v0.3 incorpora vocabulario ampliado a 32.768 tokens, tokenizer v3 y soporte nativo de function calling, lo que lo mantiene vigente como tamano de referencia para despliegues on-premise economicos.

Ahora bien, conviene ser explicito sobre el estado del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo dia (17 de septiembre de 2026), sin pipeline declarado, sin idiomas declarados y con una model card copiada literalmente de `mistralai/Mistral-7B-Instruct-v0.3` aunque el `base_model` declarado sea el modelo base (`Mistral-7B-v0.3`, no la version instruct). No hay evaluacion publicada. Debe tratarse, por tanto, como un experimento sin validar y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Mistral 7B v0.3); no es MoE |
| Parametros totales | 7.248.031.744 (7,25 mil millones), dato real de safetensors |
| Parametros activos | No aplica: modelo denso, todos los parametros se activan en cada token |
| Longitud de contexto | 32.768 tokens heredados del modelo base Mistral-7B-v0.3 (no confirmado explicitamente en este repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio: solo pesos sin cuantizar en safetensors; conversion a GGUF, AWQ o GPTQ posible con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 14,5 GB) |
| Modelo base | mistralai/Mistral-7B-v0.3 |
| Libreria declarada | vllm |
| Autor | muhamad-geosurge |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-7B-v0.3, documentada publicamente: 32 capas, dimension de modelo 4096, 32 cabezas de atencion con 8 cabezas de clave-valor (Grouped Query Attention), capa feed-forward SwiGLU con dimension intermedia 14336, embeddings rotatorios (RoPE) y vocabulario de 32.768 tokens con el tokenizer v3. La atencion con ventana deslizante de 4096 tokens es caracteristica de la version 0.1 de la familia; en las versiones 0.2 y 0.3 el modelo base se distribuye con contexto completo de 32.768 tokens, aunque no se ha podido confirmar la configuracion exacta a partir de la informacion de este repositorio. El calculo de cache KV se detalla en la seccion de hardware y es coherente con esta arquitectura (128 KiB por token en fp16).

No hay informacion alguna sobre el proceso de ajuste fino de este artefacto concreto: se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si se uso SFT, LoRA, DPO o RLHF, y si los pesos resultantes son una fusion completa o un adaptador exportado. La model card incluida es una copia de la de Mistral-7B-Instruct-v0.3 e incluye instrucciones de instalacion de `mistral_inference`, ejemplos de chat, de seguimiento de instrucciones y de function calling con `mistral-common` y con `transformers` (version 4.42.0 o superior para el uso avanzado de herramientas). Esa copia describe la version instruct del modelo base, no este derivado, lo que impide verificar que el comportamiento descrito se conserve tras el ajuste.

## Capacidades

Las siguientes capacidades se atribuyen al modelo base Mistral-7B-v0.3 y a la documentacion copiada de la variante instruct, no a una evaluacion propia de este repositorio:

- Generacion de texto y seguimiento de instrucciones en formato conversacional (roles `system`, `user`, `assistant`) mediante `apply_chat_template`.
- Razonamiento de un solo paso y tareas de conocimiento general propias de un modelo de 7B.
- Function calling o tool calling nativo, con definicion de herramientas mediante `Function` y `Tool` en `mistral-common` y con la plantilla de chat de `transformers`.
- Soporte de agentes simples: el formato de llamada a herramientas permite encadenar varios pasos con orquestacion externa, aunque no hay evidencia publicada del rendimiento en tareas multi-paso.
- Tokenizer v3 con vocabulario de 32.768 tokens, que mejora la eficiencia en la tokenizacion respecto a las versiones 0.1 y 0.2.
- Capacidades multilingues: no disponibles; no se declaran idiomas en el repositorio y no hay evaluacion al respecto.
- Capacidades especiales (modo de razonamiento explicito, vision, audio, decodificacion especulativa): no disponibles. No hay evidencia de que este artefacto incorpore ninguna de ellas.
- Comportamiento especifico del ajuste "invert-polarity": no documentado y sin evaluacion; se desconoce si invierte sistematicamente la polaridad de las respuestas, en que dominio y con que fiabilidad.

## Casos de uso

- Analisis de polaridad y robustez de sentimiento: dada la denominacion del repositorio, un uso inmediato es la experimentacion con tareas de clasificacion de polaridad (positivo/negativo/neutro) y con pruebas de sensibilidad, comparando el comportamiento del derivado frente al modelo base con el mismo prompt y temperatura cero. Es adecuado porque el ajuste parece orientado precisamente a ese eje semantico, aunque su efecto real esta por verificar.
- Extraccion de informacion estructurada: generar JSON con campos fijos a partir de texto libre (facturas, correos, incidencias) usando plantillas de chat y `temperature=0`; el vocabulario de 32.768 tokens y el soporte de plantillas de `transformers` facilitan forzar formatos de salida.
- Asistente conversacional on-premise: gestion de dialogos multi-turno con contexto de hasta 32.768 tokens, lo que permite mantener historiales largos y documentos de referencia en la misma ventana sin recuperacion externa.
- Agentes con tool calling: integracion en orquestadores que expongan funciones (consulta meteorologica, busqueda en base de datos interna, envio de correo) mediante el formato de herramientas de `mistral-common` o de `transformers`, con validacion externa de los argumentos generados.
- Atencion al cliente automatizada de bajo coste: clasificacion y respuesta a consultas recurrentes en un unico nodo GPU, con una ventana de contexto amplia para adjuntar el historial completo del ticket; requiere una capa de moderacion y de verificacion de hechos por el riesgo de alucinacion.
- Generacion de codigo asistida en entornos controlados: autocompletado, generacion de tests unitarios y explicacion de fragmentos dentro de un IDE o de un pipeline de CI/CD. Es viable por el soporte de tool calling y el tamano manejable, pero no hay HumanEval publicado que respalde su calidad en codigo.
- Base para experimentos de alineacion y ablaciones: al ser un ajuste ligero sobre un 7B con licencia permisiva, sirve como punto de partida para estudios comparativos de sesgo, de instrucciones contradictorias o de inversion de juicio, siempre con evaluacion propia.
- Generacion de datos sinteticos y destilacion: produccion de pares instruccion-respuesta a granel en una sola GPU para alimentar el entrenamiento de modelos menores, asumiendo la necesidad de filtrado posterior por calidad y alucinaciones.
- Despliegue en entornos con requisitos de residencia de datos: al distribuirse los pesos completos bajo Apache-2.0, puede ejecutarse en infraestructura propia sin enviar datos a terceros, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite, y la model card copiada no aporta cifras. No se deben extrapolar los numeros de Mistral-7B-Instruct-v0.3 a este artefacto, ya que el ajuste fino puede alterar el comportamiento de forma no documentada.

## Requisitos de hardware

- VRAM para pesos en bf16/fp16: aproximadamente 14,5 GB (los 14,5 GB del repositorio corresponden a los pesos sin cuantizar).
- Cache KV: 128 KiB por token en fp16 con la configuracion del modelo base (8 cabezas KV, dimension de cabeza 128, 32 capas). Esto supone unos 4 GiB para una secuencia completa de 32.768 tokens y unos 0,5 GiB para 4096 tokens.
- VRAM total estimada en bf16: alrededor de 16-17 GB para contexto corto con lote pequeno; por encima de 20 GB si se agota la ventana de 32.768 tokens con lote 1, mas el overhead de activaciones y del runtime. Cabe en GPUs de 24 GB con margen ajustado.
- GPUs recomendadas: A100 40 GB o 80 GB, H100, L40S y L4 para servicio; RTX 4090 y RTX 3090 (24 GB) para bf16 en ambito de estacion de trabajo.
- GPUs de consumo con cuantizacion: 4 bits (unos 4,5-5 GB de pesos) cabe en RTX 3060 12 GB, RTX 4070 12 GB y RTX 4060 8 GB; 8 bits (unos 8-9 GB) cabe en tarjetas de 12 GB con contexto moderado.
- Opciones de despliegue: vLLM (tag declarado por el autor), TGI, SGLang y servidor de `transformers` para safetensors; llama.cpp, Ollama y LM Studio requieren convertir previamente los pesos a GGUF, ya que el repositorio no incluye cuantizaciones. `mistral-inference` y `mistral-common` son las herramientas nativas del modelo base.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este artefacto y dependerian por completo de la GPU, la cuantizacion, el tamano de lote y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas de disponibilidad |
|---|---|---|---|---|
| invert-polarity (este repositorio) | 7,25 mil millones | 32.768 tokens (heredado del base) | Apache-2.0 | 0 descargas, sin evaluacion, model card copiada |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Apache-2.0 | Modelo de referencia de Mistral AI con function calling y tokenizer v3; sirve de linea base directa |
| mistralai/Mistral-7B-v0.3 | 7,25 mil millones | 32.768 tokens | Apache-2.0 | Modelo base sin ajuste de instrucciones; es el antecesor declarado de este repositorio |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.1 | Contexto cuatro veces mayor y ecosistema amplio, con licencia no Apache |
| Qwen/Qwen2.5-7B-Instruct | 7,62 mil millones | 128.000 tokens | Apache-2.0 | Alternativa de tamano similar, contexto largo y buen soporte multilingue declarado |

La comparacion de rendimiento no es posible: no hay benchmarks publicados de este artefacto, por lo que las cifras de las alternativas no se pueden contrastar con datos propios.

## Limitaciones y advertencias

- Modelo sin validar: 0 descargas, 0 likes, creado y actualizado el mismo dia y sin ninguna evaluacion publicada. No hay evidencia de que funcione correctamente ni de que el ajuste haya convergido.
- Model card inconsistente: el README es una copia literal de la model card de Mistral-7B-Instruct-v0.3, mientras que el `base_model` declarado es Mistral-7B-v0.3 (modelo base, no instruct). El comportamiento descrito en la card no puede darse por supuesto en este derivado.
- Proceso de entrenamiento desconocido: se ignoran el dataset, el numero de tokens, el metodo (SFT, LoRA, DPO) y si se aplicaron tecnicas de alineacion. Esto impide auditar sesgos o predecir comportamientos.
- Riesgo de alucinacion: es el esperado en un modelo denso de 7B sin verificacion factual, sin mecanismo de citacion y sin modo de razonamiento explicito. No debe usarse como fuente de verdad.
- Sesgos: no hay evaluacion de sesgos demograficos, politicos o culturales. Un ajuste orientado a invertir la polaridad de las respuestas puede, ademas, introducir un sesgo sistematico de negacion o de contradiccion que no esta caracterizado.
- Idiomas: no se declara ningun idioma soportado. No hay garantia de calidad en castellano ni en ninguna otra lengua distinta del ingles.
- Contexto: los 32.768 tokens son un dato heredado del modelo base y no estan confirmados en la configuracion de este repositorio. El rendimiento en ventanas muy largas de un 7B suele degradarse antes de agotar el limite teorico.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. Al derivar de Mistral-7B-v0.3, conviene revisar igualmente las condiciones del repositorio original.
- Ausencia de cuantizaciones oficiales: el repositorio solo publica safetensors. Cualquier despliegue en 4 u 8 bits exige convertir los pesos y validar que el ajuste no se degrade con la cuantizacion.
- Produccion: no recomendado como componente critico sin una bateria de evaluacion propia (factualidad, seguridad, formato de salida de herramientas y estabilidad multi-turno) y sin fijar version del repositorio, dado que puede actualizarse o eliminarse sin aviso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/muhamad-geosurge/invert-polarity-de2b6a6a-c7da-486e-93a8-6343db269e88
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Modelo instruct del que se copia la model card: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de inferencia de Mistral: https://github.com/mistralai/mistral-inference
- Libreria de tokenizer y protocolos de Mistral: https://github.com/mistralai/mistral-common
- Guia de function calling en transformers: https://huggingface.co/docs/transformers/main/chat_templating#advanced-tool-use--function-calling
- Paper de la familia Mistral 7B: https://arxiv.org/abs/2310.06825
- Texto de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de busqueda web: no se encontro ningun resultado relevante sobre este modelo; las consultas devolvieron unicamente paginas comerciales de un servicio de streaming, sin relacion con el artefacto.
