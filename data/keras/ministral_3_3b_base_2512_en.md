# keras/ministral_3_3b_base_2512_en

## Resumen

Ministral 3 3B Base es la variante de menor tamano de la familia Ministral 3, publicada por Mistral AI y distribuida en este repositorio a traves de KerasHub como pesos convertidos al formato nativo de Keras. El modelo combina un decodificador de texto de 3,4B parametros con un codificador visual Pixtral de 0,4B parametros, lo que da un total de aproximadamente 3,8B parametros y le permite procesar imagenes junto con texto. Esta es la variante **base**, es decir, el checkpoint preentrenado sin ajuste por instrucciones, pensado para fine-tuning e investigacion.

La relevancia de esta ficha reside en que Mistral AI ha disenado la familia Ministral 3 especificamente para despliegue en el borde y en entornos con recursos limitados, manteniendo al mismo tiempo una ventana de contexto de 256k tokens y cobertura de decenas de idiomas. El checkpoint base es el punto de partida natural para quien quiera adaptar el modelo a un dominio concreto mediante ajuste supervisado, ya que no incorpora alineacion por RLHF ni sesgos de formato conversacional.

El repositorio tiene un tamano de 8,5 GB, lo que sugiere pesos almacenados en bfloat16 o float16 sin cuantizar. La integracion con KerasHub permite cargar el modelo con `Mistral3CausalLM.from_preset()` y ejecutar generacion, generacion multimodal con marcadores `[IMG]`, muestreo personalizado y ajuste con `fit()` sobre lotes pequenos, todo ello sobre los backends de Keras 3 (JAX, PyTorch, TensorFlow).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Mistral3) con embeddings rotatorios escalados por YaRN y codificador visual Pixtral |
| Parametros totales | ~3,8B (3,4B decodificador de texto + 0,4B codificador visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos sin cuantizar; el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe (segun la model card de la familia) |
| Licencia | Apache 2.0 (pesos); Apache 2.0 (codigo Keras en keras-hub) |
| Formato de pesos | Pesos nativos de KerasHub (no safetensors ni GGUF en este repositorio) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con atencion causal, en la que el decodificador de texto de 3,4B parametros se combina con un codificador visual Pixtral de 0,4B parametros que proyecta las imagenes a la secuencia de tokens del decodificador. La model card menciona el uso de embeddings rotatorios escalados con YaRN, tecnica que permite extender la ventana de contexto efectiva hasta los 256k tokens sin reentrenar desde cero. La integracion con KerasHub se realiza a traves de la clase `Mistral3CausalLM`, que agrupa backbone, tokenizer y cabecera de lenguaje.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en este checkpoint concreto. Al tratarse de la variante **base**, es razonable asumir que no ha pasado por alineacion por preferencias, pero la model card no lo confirma explicitamente. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del escalado YaRN.

## Capacidades

- Generacion de texto autoregresiva con soporte de prompts individuales y lotes (batch) mediante `generate()`.
- Procesamiento multimodal: acepta imagenes intercaladas en el prompt usando un marcador `[IMG]` por cada imagen, con la lista de imagenes correspondiente en el parametro `images`.
- Muestreo configurable: modo greedy, top-k con temperatura y otros samplers de KerasHub.
- Ajuste fino supervisado sobre lotes mediante `fit()`.
- Carga separada de backbone y tokenizer para pipelines personalizados.
- Cobertura multilingue amplia: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Ventana de contexto de 256k tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Al ser un checkpoint base, no incorpora de forma nativa modo thinking, function calling ni salida JSON estructurada; esas capacidades se reservan a las variantes instruct y reasoning de la familia, segun la model card.

## Casos de uso

- **Fine-tuning de dominio especializado:** el checkpoint base es el punto de partida para ajuste supervisado sobre corpus medicos, legales o tecnicos. Al no estar alineado por instrucciones, el ajuste no compite contra sesgos conversacionales preexistentes y converge antes en dominios concretos.
- **Investigacion en modelos multimodales pequenos:** con 3,8B parametros totales y un codificador visual de 0,4B, es viable reproducir experimentos de vision-lenguaje en una sola GPU, algo inviable con modelos multimodales de decenas de miles de millones de parametros.
- **Procesamiento de documentos largos con imagenes:** la ventana de 256k tokens permite ingerir contratos, informes o articulos cientificos completos junto con sus figuras y tablas en una sola pasada, sin necesidad de chunking agresivo.
- **Generacion aumentada por recuperacion (RAG) multimodal:** el modelo puede combinar fragmentos de texto recuperados con imagenes de soporte (capturas, diagramas, fotos de producto) para responder consultas tecnicas con contexto visual.
- **Prototipado rapido en Keras:** al cargarse con `from_preset()` y funcionar sobre backends JAX, PyTorch o TensorFlow, encaja en equipos que ya trabajan con Keras 3 y quieren evitar cambiar de stack para experimentar con un modelo multimodal.
- **Despliegue en el borde con requisitos de contexto largo:** el tamano reducido del decodificador permite ejecutar el modelo en hardware de gama consumer o en dispositivos con aceleradores modestos, manteniendo una ventana de contexto que en modelos de 7B-8B suele requerir GPUs de datacenter.
- **Generacion de descripciones de imagenes y alt-text:** util para pipelines de accesibilidad que necesitan describir lotes de imagenes con un modelo que quepa en una sola GPU y pueda ajustarse al estilo editorial de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el repositorio ocupa 8,5 GB, lo que corresponde a pesos en bfloat16/float16 para ~3,8B parametros. En bfloat16 se necesitan aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; con contexto de 256k tokens la cache KV crece de forma significativa y puede dominar el consumo.
- **GPU recomendadas:** para contexto corto y batch pequeno, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para aprovechar la ventana de 256k tokens o servir con concurrencia, se recomienda A100 (40/80 GB) o H100 (80 GB).
- **Compatibilidad con GPU consumer:** si, cabe en GPUs consumer de 24 GB en bfloat16 con contexto moderado; en GPUs de 16 GB o menos sera necesario cuantizar o reducir la longitud de contexto.
- **Opciones de despliegue:** el repositorio esta pensado para KerasHub (`keras_hub.models.Mistral3CausalLM`), ejecutable sobre JAX, PyTorch o TensorFlow. No se distribuyen pesos en GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama o vLLM no pueden consumirlo directamente sin una conversion previa.
- **Latencia y throughput estimados:** no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Base (este) | ~3,8B (3,4B texto + 0,4B vision) | 256k | Si | Apache 2.0 | KerasHub |
| Ministral 3 8B Base | ~8,8B (8,4B texto + 0,4B vision) | 256k | Si | Apache 2.0 | KerasHub / Mistral AI |
| Ministral 3 14B Base | ~13,9B (13,5B texto + 0,4B vision) | 256k | Si | Apache 2.0 | KerasHub / Mistral AI |
| Mistral 7B Base | ~7,2B | 32k (tipico) | No | Apache 2.0 | Multiples formatos |

La comparativa se limita a la propia familia Ministral 3 y a Mistral 7B, ya que la informacion proporcionada no incluye datos de benchmarks ni de otros modelos multimodales de tamano similar. No se dispone de cifras de rendimiento para establecer comparaciones cuantitativas con alternativas de terceros.

## Limitaciones y advertencias

- **Checkpoint base sin alineacion:** al no haber pasado por RLHF ni DPO, el modelo no sigue instrucciones de forma fiable, no respeta formatos conversacionales y puede generar continuaciones incoherentes o repetitivas si se usa directamente en produccion sin ajuste.
- **Riesgo de alucinacion:** como todo modelo de lenguaje, puede inventar hechos, citas o referencias; el riesgo es mayor en la variante base, que no ha sido entrenada para admitir incertidumbre.
- **Sesgos de los datos de preentrenamiento:** no se documenta la composicion del dataset, por lo que no es posible evaluar sesgos de genero, raza, religion o ideologia; se recomienda auditar antes de cualquier despliegue.
- **Licencia:** los pesos y el codigo se publican bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar los terminos de la model card original de Mistral AI por si hubiera condiciones adicionales no reflejadas en este repositorio.
- **Formato de pesos propietario de KerasHub:** no se distribuyen safetensors ni GGUF, lo que limita la interoperabilidad con el ecosistema Hugging Face Transformers, vLLM o llama.cpp sin conversion manual.
- **Contexto largo y coste de memoria:** aunque el modelo soporta 256k tokens, la cache KV a esa longitud consume una cantidad de VRAM considerable; en GPUs consumer habra que truncar el contexto.
- **Idiomas:** la model card de la familia lista once idiomas, pero no se especifica el nivel de competencia por idioma ni si el checkpoint base mantiene el mismo rendimiento relativo que las variantes instruct.
- **Fecha de creacion futura:** el repositorio figura creado el 2026-11-04, fecha posterior a la actual; conviene verificar la integridad y procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/keras/ministral_3_3b_base_2512_en
- Mistral AI: https://mistral.ai/
- Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Codigo de KerasHub (licencia Apache 2.0): https://github.com/keras-team/keras-hub/blob/master/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Wikipedia de Keras: https://en.wikipedia.org/wiki/Keras
- Wikipedia de Keras (frances): https://fr.wikipedia.org/wiki/Keras
- GeeksforGeeks, introduccion a Keras: https://www.geeksforgeeks.org/deep-learning/what-is-keras/
