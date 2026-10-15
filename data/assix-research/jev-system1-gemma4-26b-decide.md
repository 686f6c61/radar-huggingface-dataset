# assix-research/jev-system1-gemma4-26b-decide

## Resumen

JEV-System1-Gemma4-26B-Decide es un motor de decisiones tipadas ("System 1") de codigo abierto publicado por assix-research. No es un modelo generativo al uso: parte del backbone Mixture-of-Experts Gemma-4-26B-A4B-it de Google (26,8B parametros totales, 4B activos, 128 expertos) y le acopla una cabeza de decision entrenable en fp32 denominada Clef, que hace span-pooling conjunto. El resultado es un clasificador de decision que opera en un unico paso de prefill, sin decodificacion autorregresiva token a token.

El modelo resuelve un problema concreto en pipelines de agentes e infraestructura: convertir un estado (state) estructurado o no estructurado en decisiones discretas y calibradas, evaluando varias preguntas independientes sobre el mismo contexto en una sola pasada. Soporta tres primitivas: choice (elegir una opcion entre K candidatas nombradas), score (evaluar niveles ordenados de rubrica y devolver probabilidades por clase mas una esperanza ponderada) y noul (evaluar proposiciones binarias devolviendo P(true)). Las probabilidades se calibran a posteriori con temperatura ajustada por LBFGS.

Su relevancia actual esta en dos ejes. Primero, la eficiencia: al activar solo 4B parametros por token en prefill y no generar texto, reporta latencias de 276-296 ms en una DGX Spark (Grace Blackwell GB10) para tres preguntas simultaneas. Segundo, la orientacion a seguridad de agentes: la calibracion declarada (ECE 0,0618) y la precision en holdout (78,0% sobre LocalLLaMA/typed-decisions) apuntan a usarlo como capa de enrutado y control donde hace falta una confianza interpretable, no una respuesta en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre backbone Gemma-4-26B-A4B-it, 128 expertos, mas cabeza de decision fp32 Clef de span-pooling conjunto; inferencia en modo prefill de una sola pasada |
| Parametros totales | 26,8B (backbone) |
| Parametros activos | 4B por token |
| Longitud de contexto | 4096 tokens (max_seq_length usado en el ejemplo oficial de inferencia); maximo oficial del backbone: no disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; la carga en 4-bit esta disponible via Unsloth (load_in_4bit) pero no se documentan cuantizaciones precalculadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dos shards bf16: 47 GB + 1,6 GB), mas joint_head.safetensors (fp32, 63 MB), model.safetensors.index.json y tokenizer.json |
| Metodo de ajuste | LoRA de 16 bits (r=32, lora_alpha=32) sobre atencion, los 60/60 tensores de expertos MoE y la cabeza fp32; regularizacion por divergencia KL (kl_weight=0,1) |
| Calibracion | Temperatura ajustada con LBFGS sobre splits de decision reservados |
| Precision en holdout | 78,0% (split de LocalLLaMA/typed-decisions) |
| ECE | 0,0618 |
| Latencia | ~276-296 ms en NVIDIA DGX Spark (GB10) con 3 preguntas simultaneas por estado |
| Hardware de entrenamiento | NVIDIA DGX Spark (NVIDIA Grace Blackwell GB10, 128 GB LPDDR5x unificada, CUDA 13.0) |
| Libreria | unsloth (FastDecisionModel) |
| Pipeline declarado en HuggingFace | text-classification |

## Arquitectura y entrenamiento

La base es el transformer MoE Gemma-4-26B-A4B-it de Google: 26,8B parametros totales con 4B activos por token repartidos entre 128 expertos. Sobre esa base, assix-research anade una cabeza de decision fp32 ("Joint Clef Span-Pooling Scoring Head", 63 MB) que agrupa representaciones de spans de tokens de todas las opciones candidatas a la vez y produce distribuciones de probabilidad sobre ellas. La innovacion estructural es que el modelo no decodifica texto: consume el state y un diccionario de preguntas tipadas y devuelve, en un solo forward pass de prefill, un objeto JSON con las respuestas y sus probabilidades. Esto elimina el coste de generacion autorregresiva y permite evaluar varias preguntas sobre un mismo contexto compartido sin repetir el prefill.

El ajuste se hizo con LoRA de 16 bits (r=32, lora_alpha=32) aplicado a las capas de atencion, a los 60 tensores de expertos MoE y a la propia cabeza de decision, con una regularizacion por divergencia KL (kl_weight=0,1) cuyo objetivo declarado es preservar las representaciones de razonamiento del modelo base y evitar que el ajuste degrade el backbone. Todo el entrenamiento e inferencia se ejecutaron en una NVIDIA DGX Spark con GB10 y CUDA 13.0. La calibracion de confianza no se aprende de forma implicita: se ajusta una temperatura con LBFGS sobre particiones de decision reservadas, de modo que las probabilidades emitidas se aproximen a la frecuencia empirica de acierto (ECE 0,0618 en holdout).

## Capacidades

- Evaluacion multi-pregunta en una sola pasada: resuelve varias preguntas independientes o relacionadas sobre un mismo state compartido en un unico prefill.
- Primitiva choice: selecciona una opcion entre K candidatas nombradas mediante un diccionario de criterios y devuelve probabilidades calibradas sobre todas las claves, no solo sobre la ganadora.
- Primitiva score: evalua niveles ordenados de rubrica (de 0 a N-1) y devuelve probabilidades discretas por clase mas una puntuacion esperada continua ponderada por probabilidad.
- Primitiva noul: evalua proposiciones binarias y devuelve P(true) en el intervalo [0, 1] con la etiqueta booleana asociada.
- Probabilidades calibradas: salida con confianza alineada empiricamente con la precision (temperatura ajustada por LBFGS, ECE 0,0618).
- Eficiencia de prefill MoE: aprovecha la capacidad de 26,8B parametros activando solo 4B por token.
- Acepta estados estructurados o no estructurados (por ejemplo, diccionarios con campos de ticket) y preguntas tipadas definidas en tiempo de inferencia.
- No soporta generacion de texto libre: su salida es un objeto de decision tipado.
- Tool calling, function calling y razonamiento multi-paso explicito: no disponibles como capacidades nativas del modelo; el valor se orienta a servir como componente de decision dentro de un orquestador externo.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se documentan vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Enrutado de tickets de soporte: dado un state con los campos del ticket, la primitiva choice selecciona la cola correcta (por ejemplo, sre_cloud frente a billing o ui_ux) y devuelve la probabilidad de cada cola, lo que permite derivar automaticamente a revision humana cuando la confianza es baja.
- Triaje y priorizacion de incidentes: combinando noul (esta degradado un sistema en produccion) y score (niveles P4 a P0), el modelo produce la severidad con distribucion de probabilidad y una esperanza ponderada, util para colas de guardia.
- Puerta de seguridad para agentes: como capa previa a la ejecucion de una accion, el modelo decide de forma binaria o categorica si la peticion cumple una politica, con una confianza calibrada que sirve como umbral de bloqueo.
- Moderacion y clasificacion de contenido: la primitiva choice evalua categorias de politica sobre el texto entrante en una sola pasada, y las probabilidades por clase permiten politicas graduadas en lugar de decisiones binarias duras.
- Evaluacion automatica con rubricas: la primitiva score encaja con la correccion de respuestas abiertas frente a niveles de rubrica ordenados, devolviendo tanto la clase mas probable como una puntuacion continua para agregaciones estadisticas.
- Verificacion de hechos internos: la primitiva noul evalua afirmaciones binarias contra un contexto compartido, util en pipelines de validacion de informes o de extraccion de datos.
- Clasificacion y enrutado de bajo coste en produccion: al no generar texto, la latencia se mantiene en el rango de cientos de milisegundos, lo que permite insertarlo en rutas sincronas de API donde un LLM generativo seria demasiado lento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos numeros reportados por el autor son metricas internas de decision:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Precision en holdout | 78,0% | Split de holdout de LocalLLaMA/typed-decisions |
| Expected Calibration Error (ECE) | 0,0618 | Split de holdout de LocalLLaMA/typed-decisions |
| Latencia de una pasada (3 preguntas por estado) | ~276-296 ms | NVIDIA DGX Spark (Grace Blackwell GB10) |

No hay comparaciones publicadas con otros modelos de decision en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos publicados: aproximadamente 48,6 GB en bf16 (shards de 47 GB y 1,6 GB) mas 63 MB de la cabeza fp32.
- VRAM estimada para inferencia en bf16: del orden de 50-55 GB (pesos mas cache KV y activaciones), cifra estimada a partir del recuento de parametros, no confirmada por el autor.
- VRAM estimada en 8 bits: del orden de 27-30 GB. En 4 bits: del orden de 14-18 GB. Estimaciones derivadas del tamano, sin datos oficiales.
- GPU recomendadas para bf16 completo: A100 80 GB, H100 80 GB, GB10 (DGX Spark) o configuraciones multi-GPU. La unica plataforma validada explicitamente por el autor es la NVIDIA DGX Spark.
- Consumer GPU: no cabe sin cuantizar en tarjetas de 24 GB (RTX 4090, 3090). Con carga en 4 bits podria entrar en el rango de 16-24 GB, aunque no hay confirmacion de que la cabeza de decision funcione correctamente bajo cuantizacion.
- Opciones de despliegue: la via documentada es Unsloth mediante FastDecisionModel.from_pretrained y FastDecisionModel.predict. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama; estos runtimes requeririan adaptaciones para ejecutar la cabeza Clef, ya que no es una cabeza de lenguaje estandar.
- Latencia y throughput: ~276-296 ms por pasada con 3 preguntas simultaneas sobre un GB10. El rendimiento agregado (peticiones por segundo) no esta publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Calibracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jev-system1-gemma4-26b-decide | 26,8B totales / 4B activos | 4096 tokens (configuracion de ejemplo) | Distribuciones tipadas (choice, score, noul), sin texto | Temperatura ajustada por LBFGS; ECE 0,0618 | apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-26B-A4B-it (modelo base) | 26,8B totales / 4B activos | no disponible en la informacion proporcionada | Texto generado de forma autorregresiva | No aplica | Licencia Gemma | HuggingFace |
| Clasificadores encoder tipo DeBERTa o ModernBERT | Rango tipico de cientos de millones de parametros | Habitualmente 512 a 8192 tokens | Logits por clase, una sola etiqueta por inferencia | Requiere calibracion adicional | MIT o Apache-2.0 segun variante | Amplia |

El modelo base se incluye como referencia arquitectonica, pero su comportamiento es generativo, no de decision calibrada, por lo que la comparacion directa de rendimiento no es posible con los datos disponibles. Frente a clasificadores encoder, la propuesta de este modelo es mucho mayor en parametros y coste, a cambio de soportar multiples preguntas tipadas sobre un contexto compartido y de aportar confianza calibrada. No se dispone de cifras de rendimiento de terceros que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y declarado unicamente para ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Precision limitada: el 78,0% en holdout implica un 22% de decisiones incorrectas en el conjunto de evaluacion. No es adecuado como unico punto de decision en flujos criticos sin revision humana o umbrales de confianza.
- Dominio de entrenamiento estrecho: el ajuste se hizo sobre el dataset LocalLLaMA/typed-decisions, por lo que el comportamiento fuera de ese tipo de decisiones tipadas es desconocido.
- Riesgo de descalibracion fuera de distribucion: un ECE de 0,0618 se midio en el holdout del propio dataset. En dominios distintos, las probabilidades pueden dejar de reflejar la precision real.
- Sin generacion de texto: no permite justificar la decision en lenguaje natural ni mantener conversaciones. Requiere un LLM separado si se necesita explicacion.
- Longitud de contexto: el ejemplo oficial usa max_seq_length=4096, lo que limita el tamano del state y del conjunto de preguntas en una pasada. El maximo real del backbone no esta documentado en la informacion disponible.
- Requisitos de hardware elevados: cerca de 48,6 GB de pesos en bf16, lo que excluye GPU de consumo sin cuantizar.
- Compatibilidad de despliegue: la cabeza de decision requiere el codigo de Unsloth (FastDecisionModel). No hay soporte documentado en vLLM, TGI, llama.cpp, Ollama ni en APIs de inferencia estandar.
- Terminologia propia no estandarizada: primitivas como "noul" y "Clef span-pooling" son especificas del autor y no cuentan con literatura externa que las valide.
- Discrepancia de identificador: la model card usa el identificador assix/jev-system1-gemma4-26b-decide mientras que el repositorio de HuggingFace es assix-research/jev-system1-gemma4-26b-decide. Conviene verificar cual resuelve correctamente en tiempo de carga.
- Licencia y modelo base: el repositorio declara apache-2.0, pero al derivar de google/gemma-4-26B-A4B-it pueden aplicar los terminos de uso de Gemma al backbone. Es una cuestion a revisar antes de un despliegue comercial.
- Validacion externa nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado evaluaciones independientes.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/assix-research/jev-system1-gemma4-26b-decide
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Unsloth Zoo: https://github.com/unslothai/unsloth-zoo
- Paper, blog o demo especificos del modelo: no disponibles en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el.
