# JMingo/gemma-4-26B-A4B-it-qat-uncensored-GGUF

## Resumen

JMingo/gemma-4-26B-A4B-it-qat-uncensored-GGUF es una cuantizacion en formato GGUF de una version "uncensored" (abliterada) del modelo google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, publicado por el usuario JMingo en Hugging Face. El modelo base pertenece a la familia Gemma 4 de Google DeepMind, una arquitectura multimodal (entrada de texto e imagen, salida de texto) pensada para tareas de instrucciones y conversacion. Esta ficha se limita a los datos verificables; buena parte de la informacion tecnica no esta publicada en la model card del autor.

El sufijo "A4B" del nombre y el recuento real de parametros (25.233.142.046, segun safetensors) apuntan a una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token sobre un total cercano a 26.000 millones. La variante "qat" indica entrenamiento consciente de cuantizacion (quantization aware training) y el "q4_0" hace referencia al esquema de cuantizacion base. La etiqueta "uncensored" implica que se ha reducido o eliminado el comportamiento de rechazo del modelo original.

Su relevancia practica es doble: por un lado permite ejecutar un modelo de ~26B con coste de inferencia propio de uno de ~4B activos (MoE), y por otro ofrece una version sin filtros de rechazo para casos donde se necesita menor moderacion en las respuestas. Es un lanzamiento muy reciente (creado el 14 de octubre de 2026) y, en el momento de redactar esta ficha, no acumula descargas ni "likes", por lo que su validacion por la comunidad es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el sufijo A4B del nombre; no confirmado en la model card |
| Parametros totales | 25.233.142.046 (~25,2 mil millones) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4.000 millones activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el modelo base se distribuye en q4_0 mediante entrenamiento consciente de cuantizacion (QAT) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en la model card y en las etiquetas del repo) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base google/gemma-4-26B-A4B-it-qat-q4_0-unquantized ni sobre la intervencion realizada para obtener la version "uncensored". Por el nombre y el recuento de parametros se puede inferir una arquitectura de mezcla de expertos con unos 4.000 millones de parametros activos sobre un total de unos 26.000 millones, y un pipeline de entrenamiento consciente de cuantizacion (QAT) orientado a preservar calidad a 4 bits (q4_0). Todo ello debe considerarse inferencia, no dato confirmado.

El modelo original, segun la documentacion de Google Cloud sobre Gemma 4 26B A4B IT, es un modelo abierto multimodo (texto e imagen como entrada, texto como salida). La modificacion "uncensored" tipicamente se implementa mediante tecnicas de abliteration (por ejemplo, abliteration con proyeccion biproyectada y variantes especificas para pesos de expertos en arquitecturas MoE), aunque en esta ficha no se confirma el metodo concreto empleado por JMingo. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF/DPO para esta variante.

## Capacidades

- Generacion de texto e instrucciones conversacionales, heredadas del modelo base Gemma 4 instruido (variante "it").
- Razonamiento multimodal segun la documentacion del modelo base de Google DeepMind (entrada de texto e imagen); no confirmado que esta version GGUF conserve el codazo de vision.
- Comportamiento "uncensored": se ha reducido o eliminado el mecanismo de rechazo del modelo original, por lo que responde a peticiones que el modelo base rechazaria.
- Ejecutable en CPU y GPU a traves de llama.cpp y otros runners compatibles con GGUF.
- Tool calling y function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de pensamiento, audio, vision): no disponible.

## Casos de uso

- Escritura creativa y ficcion sin restricciones tematicas: la naturaleza "uncensored" permite abordar generos y temas que el modelo base suele rechazar, manteniendo el coste de un MoE de ~4B activos.
- Generacion de texto en local sobre hardware de gama alta de consumo: al distribuirse en GGUF, se puede ejecutar con llama.cpp u Ollama en una GPU unica con suficiente VRAM, sin depender de APIs externas.
- Asistentes conversacionales autoalojados: util para quienes necesitan un chatbot privado que no envie datos a servicios en la nube, con la advertencia de que la longitud de contexto no esta documentada.
- Prototipado e investigacion sobre alineacion y moderacion: sirve como contrapunto "sin filtros" frente al modelo base para estudiar diferencias de comportamiento y de rechazo.
- Redaccion y reescritura de contenido en pipelines editoriales: el modelo puede reescribir, resumir o reformular textos, aunque sin benchmarks publicados no hay garantia cuantificada de calidad.
- Integracion en entornos de desarrollo mediante runners GGUF (llama.cpp, text-generation-webui, LM Studio): permite exponer el modelo como endpoint local compatible con la API de OpenAI, segun la etiqueta "endpoints_compatible".
- Comparacion de variantes cuantizadas: util para quien quiera medir el impacto de la cuantizacion q4_0/QAT frente al modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ningun otro conjunto de evaluacion, y las busquedas web no aportan cifras de rendimiento para esta variante concreta. Cualquier dato numerico que se encuentre en otros repositorios (por ejemplo, los ~21B indicados para el modelo "japanese-pruned" de JMingo) corresponde a variantes distintas y no es extrapolable a esta.

## Requisitos de hardware

- Tamano del repositorio: 14,3 GB, lo que sugiere una o varias cuantizaciones en torno a 4 bits para un modelo de ~25-26B.
- VRAM estimada para inferencia completa en GPU: aproximadamente 14-16 GB para el archivo principal en q4_0, mas margen para el contexto (KV cache).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100; cabe en GPUs de 16-24 GB cargando todos los pesos.
- GPUs de gama media (12 GB o menos): es posible mediante carga parcial (offload de capas a CPU) con llama.cpp, a costa de menor velocidad.
- Al ser un MoE con ~4B activos, el coste por token en inferencia es menor que el de un modelo denso de 26B, lo que favorece el throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. Para mayor rendimiento en GPU, motores como vLLM requieren el modelo en formato safetensors, no en GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado "uncensored" |
|---|---|---|---|---|---|
| JMingo/gemma-4-26B-A4B-it-qat-uncensored-GGUF | ~25,2B totales (MoE, ~4B activos) | no disponible | GGUF | apache-2.0 | Si |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (modelo base) | ~25,2B totales (MoE) | no disponible | safetensors (QAT) | terminos de Google Gemma | No |
| TrevorJS/gemma-4-26B-A4B-it-uncensored-GGUF | 26B | 8192 tokens | GGUF | no disponible | Si (abliteration con EGA sobre expertos) |

Las comparativas se limitan a variantes derivadas del mismo modelo base; no se dispone de cifras de rendimiento que permitan una comparacion cuantitativa fiable entre ellas.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta metodo de "uncensoring", datos de entrenamiento, contexto ni idiomas. Cualquier uso en produccion parte de una base de informacion muy limitada.
- Riesgo de alucinacion y de respuestas daninas: al ser una variante abliterada, el modelo puede producir contenido que el original rechazaria, sin los filtros de seguridad de Google. No es recomendable para aplicaciones orientadas al publico sin moderacion adicional.
- Sesgos: no se han publicado analisis de sesgo especificos para esta variante.
- Longitud de contexto: no disponible; en una variante comparable del mismo modelo base se indica una ventana de 8192 tokens, lo que sugiere un contexto limitado, pero no es un dato confirmado para este repositorio.
- Licencia: la model card declara apache-2.0, pero el modelo deriva de pesos de Google Gemma, habitualmente sujetos a los terminos de uso de Gemma. Conviene verificar la licencia aplicable del modelo base antes de un uso comercial, ya que puede haber condiciones adicionales.
- Modelo sin adopcion: cero descargas y cero "likes" en el momento de redactar la ficha, sin validacion externa de calidad ni de estabilidad.
- La cuantizacion q4_0 puede degradar la calidad respecto al modelo sin cuantizar, especialmente en tareas de razonamiento o codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JMingo/gemma-4-26B-A4B-it-qat-uncensored-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Perfil del autor JMingo: https://huggingface.co/JMingo/models
- Variante relacionada de JMingo: https://huggingface.co/JMingo/gemma-4-26B-A4B-it-qat-japanese-pruned-GGUF
- Documentacion del modelo base Gemma 4 26B A4B IT en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Variante uncensored de TrevorJS (referencia): https://www.aimodels.fyi/models/huggingFace/gemma-4-26b-a4b-it-uncensored-gguf-trevorjs
- Ficha de descarga en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-26b-a4b-it-uncensored.html
