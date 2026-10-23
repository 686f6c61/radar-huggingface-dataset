# CrossNow/Ternary-Bonsai-27B-AWQ-4bit

## Resumen

Ternary-Bonsai-27B-AWQ-4bit es un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. Lo publica el usuario CrossNow en HuggingFace y, por los tags de la model card, deriva del modelo prism-ml/Ternary-Bonsai-27B en su variante cuantizada AWQ de 4 bits; el repositorio de CrossNow parece por tanto una réplica o reempaquetado del original de prism-ml. El pipeline declarado y la etiqueta de arquitectura qwen3_5 sitúan el modelo en la familia Qwen 3.5, con alrededor de 27.356 millones de parámetros totales en formato safetensors (pesos reales declarados por HuggingFace).

El interés práctico del modelo está en la combinación de tres factores: un tamaño de 27B que cabe en una sola GPU de 80 GB y en configuraciones de 2 GPU con tensor parallelism, una cuantización AWQ de 4 bits que reduce el peso de los pesos a unos 13,7 GB teóricos, y un pipeline multimodal. La model card incluye instrucciones de despliegue con sglang, incluyendo una configuración multi-GPU de 8x H100 con TP=2 y DP=4, lo que indica que el autor lo orienta a servir en producción con throughput alto.

Ahora bien, la información pública disponible es muy escasa: el repositorio tiene 0 descargas y 0 likes, la model card no documenta datos de entrenamiento, longitud de contexto, idiomas ni resultados de benchmarks, y la búsqueda web realizada no ha devuelto ningún resultado relevante sobre el modelo (solo páginas sin relación). Cualquier evaluación seria requiere consultar el repositorio original de prism-ml y validar el modelo con pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia qwen3_5, segun el tag de arquitectura; detalles de capas y atencion no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 mil millones), dato real de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4 bits (unica variante publicada en este repositorio); no se documentan otras |
| Idiomas soportados | no disponible (el campo de idiomas del repositorio esta vacio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con configuracion de cuantizacion AWQ; tamano del repositorio 18,7 GB |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. Los unicos indicios son externos a la documentacion: el tag qwen3_5 apunta a que el modelo base pertenece a la familia Qwen 3.5 de Alibaba, lo que implicaria un transformer denso con atencion completa y capacidad multimodal de entrada de imagenes; el nombre "Ternary" sugiere un esquema de pesos ternarios en el modelo original de prism-ml, aunque esta variante concreta se distribuye en AWQ de 4 bits y no en formato ternario. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste por preferencias.

Tampoco se documenta ninguna innovacion tecnica especifica (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) mas alla del propio esquema de cuantizacion AWQ, que reduce los pesos a 4 bits con escalado por canal para preservar la precision en activaciones destacadas. La model card se limita a comandos de despliegue con sglang (`--dtype bfloat16`, TP y DP), sin seccion de entrenamiento, evaluacion o limitaciones.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` y el pipeline declarado.
- Entrada de imagenes junto con texto (image-text-to-text): el modelo puede recibir una o varias imagenes y responder preguntas sobre ellas.
- Compatibilidad con endpoints estilo OpenAI a traves de sglang (`/v1/chat/completions`), lo que facilita integraciones existentes.
- Soporte de serving distribuido con tensor parallelism y data parallelism (probado por el autor con TP=2 y DP=4 en 8x H100).
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada; no se pueden confirmar ni descartar.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modos especiales (thinking mode, audio, video): no disponibles en la documentacion.

## Casos de uso

- Analisis de documentos escaneados: el pipeline image-text-to-text permite enviar una imagen de una factura o un formulario y obtener campos estructurados en texto, aprovechando el tamano de 27B para mantener precision en tablas densas; requiere validar previamente el soporte real de OCR del modelo base.
- Asistencia sobre capturas de pantalla en herramientas internas: un agente puede recibir la captura de una interfaz, interpretar el estado y sugerir el siguiente paso al usuario, con el modelo servido tras un endpoint compatible con OpenAI.
- Moderacion y descripcion de contenido visual: generacion de descripciones y etiquetas para catalogos de imagenes, con la ventaja de que el modelo cabe en una sola GPU de 80 GB y admite despliegue con tensor parallelism si se necesita mas throughput.
- Chat de atencion al cliente con soporte de imagenes: el usuario adjunta una foto del producto defectuoso y el modelo responde en el mismo hilo; el despliegue con sglang permite balanceo por `total_tokens` para repartir carga entre replicas.
- Prototipado de asistentes multimodales en investigación: al ser Apache-2.0 y tener solo 27B de parametros, es adecuado para experimentos academicos en una unica maquina con 2 GPU, sin necesidad de infraestructura de gran escala.
- Evaluacion comparativa de cuantizacion: sirve como caso de estudio para medir la degradacion de un modelo multimodal de 27B al pasar a AWQ 4 bits frente al original de prism-ml, midiendo exactitud en tareas de VQA y generacion de texto.
- Generacion de codigo a partir de diagramas: enviar la imagen de un diagrama de clases o de arquitectura y pedir el esqueleto de codigo correspondiente; conviene verificar antes el rendimiento real del modelo en codigo, ya que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. No se deben asumir cifras del modelo base Qwen 3.5 ni del original Ternary-Bonsai-27B, ya que la cuantizacion AWQ 4 bits puede introducir degradacion no cuantificada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en AWQ 4 bits ocupan teoricamente unos 13,7 GB (27,36B x 0,5 bytes); el repositorio pesa 18,7 GB, probablemente por incluir configuracion, tokenizer y posiblemente tensores auxiliares sin cuantizar. Con cache KV para contexto moderado, es razonable reservar 20-24 GB, aunque la cifra exacta depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: una sola A100 80 GB o H100 80 GB para servir con comodidad; el autor documenta explicitamente configuraciones con 8x H100 (TP=2, DP=4).
- GPU de consumo: una RTX 4090 de 24 GB podria alojar los pesos, pero el margen para cache KV es muy ajustado y no hay confirmacion del autor; una RTX 3090/4090 con contexto corto es un escenario plausible pero no verificado.
- Opciones de despliegue: sglang es la via documentada por el autor (`python -m sglang.launch_server`). vLLM soporta AWQ y podria funcionar, pero no se ha validado en la informacion disponible. llama.cpp y Ollama no soportan AWQ de forma nativa, por lo que no son opciones directas sin reconvertir los pesos.
- Latencia y throughput: no disponibles. El unico dato indirecto es la recomendacion de TP=2 y DP=4 sobre 8x H100 como "throughput sweet spot" segun el autor, sin cifras de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de especificaciones publicas de sus familias y no de la busqueda realizada; se incluyen como referencia orientativa y deben verificarse antes de usarse en una decision.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-27B-AWQ-4bit (este) | 27,36B | no disponible | Apache-2.0 | Si (image-text-to-text) | Repositorio con 0 descargas, autor CrossNow |
| Qwen3-VL-32B-Instruct | ~32B | 256K (referencia de familia) | Apache-2.0 | Si | Ampliamente distribuido y documentado |
| Gemma 3 27B | 27B | 128K (referencia de familia) | Licencia Gemma (uso comercial con restricciones) | Si | Muy extendido, soporte en vLLM y llama.cpp |
| Qwen2.5-VL-32B-Instruct | ~32B | 128K (referencia de familia) | Apache-2.0 | Si | Amplio soporte de herramientas |

Frente a estas alternativas, la ventaja del modelo es la cuantizacion AWQ ya empaquetada y su encaje en una GPU de 80 GB; la desventaja es la ausencia total de documentacion, benchmarks y adopcion, frente a modelos con evaluaciones publicas y soporte maduro en multiples runtimes.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de entrenamiento, ni seccion de limitaciones en la model card. No es posible estimar su calidad frente al modelo base.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones, no se conoce la tasa de errores factibles ni el comportamiento en tareas de VQA con imagenes ambiguas.
- Contexto desconocido: se desconoce la longitud de contexto soportada, lo que impide dimensionar la cache KV y planificar el despliegue con seguridad.
- Idiomas no declarados: el repositorio no lista idiomas; el soporte de castellano no esta confirmado y debe probarse antes de usarlo en produccion.
- Trazabilidad dudosa: existe una discrepancia entre el identificador del repositorio (CrossNow/Ternary-Bonsai-27B-AWQ-4bit) y el nombre usado en los comandos de la model card (prism-ml/Ternary-Bonsai-27B-AWQ-4bit). El repositorio parece una réplica de un modelo de otro autor, sin que se documente el proceso de cuantizacion ni quien lo realizo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar calidad.
- Licencia: Apache-2.0 permite uso comercial, pero el titular original de los derechos y las condiciones del modelo base subyacente (familia Qwen 3.5) deben verificarse en el repositorio de origen antes de un despliegue comercial.
- La cuantizacion AWQ 4 bits puede degradar tareas sensibles a la precision, como OCR de texto pequeno o razonamiento aritmetico con imagenes; sin benchmarks no es posible medir esa perdida.
- Los resultados de la busqueda web realizada no contenian ninguna referencia util al modelo, por lo que no hay fuentes independientes que lo avalen.

## Enlaces

- HuggingFace: https://huggingface.co/CrossNow/Ternary-Bonsai-27B-AWQ-4bit
- Repositorio referenciado en la model card (presunto original): https://huggingface.co/prism-ml/Ternary-Bonsai-27B-AWQ-4bit
- sglang (runtime de despliegue documentado por el autor): no se ha encontrado enlace en la busqueda web proporcionada
- Papers, blogs, repositorios o demos adicionales: no disponibles; la busqueda web no devolvio resultados relevantes sobre este modelo
