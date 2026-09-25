# abhi6168/ekvachan-decoder

## Resumen

ekVachan-decoder es un conjunto de adaptadores LoRA (r=16, alpha=32, 128 módulos objetivo) sobre el modelo base Qwen/Qwen3.5-4B, publicados por el usuario abhi6168 (Abhijeet). No es un modelo generativo al uso: es la rama "decoder" del proyecto ekVachan, una alternativa abierta y autoalojable al modelo de decisión Jev System-One de TypeSafe AI. Su funcion es recibir un `state` y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y devolver probabilidades calibradas en un unico forward pass no autorregresivo, mediante una lectura restringida de logits sobre codigos de una sola letra.

El repositorio contiene dos adaptadores conmutables en tiempo de servicio mediante la clase `serve.inference.RoutingDecoderModel`: uno solo texto (`max_options=26`) y otro con capacidad de vision (`max_options=588`, checkpoint `stage3`, el mas fuerte). Cada subcarpeta incluye su propio `manifest.json` con la configuracion de entrenamiento y las metricas medidas (accuracy, Brier, ECE), que el autor senala como fuente de verdad frente a la model card.

Es relevante porque ataca un nicho poco cubierto por los modelos abiertos: la clasificacion de decisiones con probabilidades calibradas en lugar de texto generado, con resultados verificados por terceros (70,99% en JevBench) y una licencia Apache-2.0 que permite uso comercial. Su adopcion es por ahora marginal: cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen/Qwen3.5-4B) con adaptadores LoRA (r=16, alpha=32, 128 modulos objetivo) |
| Parametros totales | no disponible (modelo base de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Libreria | peft |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Adaptadores incluidos | `ekvachan-decoder-qwen-benchcorpus` (texto, max_options=26) y `ekvachan-decoder-qwen-vision` (vision, max_options=588) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder de tipo Qwen3.5 con 4B de parametros, sobre el que se aplican dos adaptadores LoRA independientes. Segun la model card, cada adaptador usa rango r=16, alpha=32 y 128 modulos objetivo. La innovacion principal no esta en el cuerpo del modelo sino en el mecanismo de lectura: en lugar de generar texto token a token, el sistema construye un prompt con una tabla de codigos de una sola letra, toma los logits del ultimo token, restringe el vocabulario a los codigos de las opciones validas y aplica softmax. El resultado son probabilidades calibradas en un unico forward pass no autorregresivo, es decir, el modelo actua como clasificador de decision y no como generador.

El adaptador `benchcorpus` esta limitado a 26 opciones y opera solo con texto; el adaptador `vision` (checkpoint `stage3`) admite hasta 588 opciones y procesa entrada visual, ademas de responder por defecto a peticiones de solo texto en el servidor de referencia del proyecto (`EKVACHAN_TEXT_ADAPTER=vision`). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion se remite al repositorio GitHub (`PRD.md`) del autor, que no forma parte de la informacion proporcionada. Tampoco se documenta decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Clasificacion de decisiones con salida probabilistica calibrada: devuelve distribuciones de probabilidad sobre opciones, no texto libre.
- Preguntas tipadas: soporta los tipos `choice` (eleccion entre opciones), `score` (puntuacion) y `noul` (sin opciones, segun la nomenclatura del autor).
- Lectura restringida de logits sobre codigos de una sola letra, con hasta 26 opciones en el adaptador de texto y hasta 588 en el adaptador con vision.
- Capacidad multimodal en el adaptador `ekvachan-decoder-qwen-vision`, heredada presumiblemente del modelo base, segun indica el autor.
- Conmutacion en caliente de adaptadores en tiempo de servicio mediante `RoutingDecoderModel`.
- Inferencia no autorregresiva de un solo paso, con soporte de modo eager y modo CUDA graphs.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un conjunto cerrado de acciones (`refund`, `replace`, `escalate`), el modelo devuelve la probabilidad de cada una en un unico forward pass, lo que permite fijar umbrales de confianza y derivar automaticamente los casos ambiguos a un humano.
- Clasificacion de decisiones en pipelines de negocio: cualquier flujo con ramas discretas y bien definidas (aprobacion de credito, priorizacion de colas, asignacion de categoria) puede beneficiarse de probabilidades calibradas en lugar de etiquetas duras.
- Moderacion de contenido con escala de severidad: el tipo `score` permite obtener una puntuacion graduada en lugar de una decision binaria, util para ordenar revisiones por riesgo.
- Triage automatizado en atencion al cliente: con latencias de ~112 ms p50 y ~131 ms p95 en peticiones de 100-250 tokens, encaja en flujos interactivos de clasificacion previa a la respuesta generativa.
- Investigacion en calibracion de modelos: la inclusion de metricas Brier y ECE en los `manifest.json` lo hace util como referencia reproducible para estudiar calibracion en clasificadores basados en LLM.
- Evaluacion comparativa frente a modelos de decision propietarios: sirve como alternativa autoalojable y con licencia Apache-2.0 al Jev System-One de TypeSafe AI, sin dependencia de API externa.
- Analisis de documentos con componente visual: el adaptador `vision`, con hasta 588 opciones, permite clasificar escenarios que requieren leer informacion de imagenes ademas de texto.
- Despliegue en infraestructura propia con requisitos de privacidad: al ser autoalojable y de 4B de parametros, puede ejecutarse en servidores controlados por la organizacion sin enviar datos a terceros.

## Benchmarks y rendimiento

| Benchmark | Precision | Elementos evaluados | Notas |
|---|---|---|---|
| JevBench | 70,99% | 231/231 | Benchmark de terceros, sin exposicion en entrenamiento |
| jabr-v2 | 85,49% | 944/944 | Benchmark de terceros, sin exposicion en entrenamiento |

| Metrica de latencia | Valor | Condiciones |
|---|---|---|
| p50 | ~112 ms | Formas de peticion realistas de 100-250 tokens, CUDA graphs activados |
| p95 | ~131 ms | Formas de peticion realistas de 100-250 tokens, CUDA graphs activados |
| Latencia en prompts cortos | ~45 ms | Prompts sinteticos de ~15 tokens |

El autor indica que los modos eager y CUDA graphs son identicos dentro del margen de ruido. Senala tambien que el modelo no es competitivo en latencia bruta frente a otras entradas del campo (Von <18 ms, Laya ~16 ms). La latencia del Space de demostracion incluye la cola de ZeroGPU y no es representativa de estas cifras.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia orientativa (no confirmada por el autor) para un modelo base de 4B en precision fp16 serian necesarios aproximadamente 8-9 GB, en int8 unos 5 GB y en int4 unos 3 GB, a los que habria que sumar el coste del KV cache y de los adaptadores.
- El repositorio de adaptadores ocupa 0,1 GB; los pesos base de Qwen/Qwen3.5-4B se descargan aparte.
- GPU recomendadas: no disponibles. No se especifica en la model card que GPU se uso para medir la latencia de referencia.
- Encaje en GPU de consumo: no confirmado. Por tamano del modelo base, una GPU con 8-12 GB de VRAM seria el minimo orientativo en precision reducida, pero el dato no esta verificado.
- Opciones de despliegue: no es compatible con `AutoModelForCausalLM.generate()` ni, por tanto, con los flujos estandar de vLLM, llama.cpp o Ollama sin reimplementar el mecanismo de lectura restringida de logits. El autor recomienda usar directamente la clase `serve.inference.RoutingDecoderModel` del repositorio principal.
- Modos de ejecucion soportados por la implementacion de referencia: eager y CUDA graphs.
- Latencia medida: ~112 ms p50 y ~131 ms p95 en peticiones de 100-250 tokens; ~45 ms en prompts de ~15 tokens. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ekVachan-decoder (este modelo) | Adaptadores LoRA sobre Qwen3.5-4B | no disponible | JevBench 70,99%; jabr-v2 85,49%; ~112 ms p50 | Apache-2.0 | HuggingFace y GitHub, autoalojable |
| Jev System-One (TypeSafe AI) | no disponible | no disponible | no disponible | no disponible (propietario) | API/SaaS de TypeSafe AI |
| Von | no disponible | no disponible | Latencia <18 ms | no disponible | no disponible |
| Laya | no disponible | no disponible | Latencia ~16 ms | no disponible | no disponible |

Von y Laya aparecen unicamente citados por el autor como referencias de latencia del campo; no se dispone de sus especificaciones, licencias ni resultados en los benchmarks JevBench o jabr-v2. Del Jev System-One no se ofrecen numeros en la informacion proporcionada. Por tanto, la comparativa cuantitativa completa no esta disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse con `generate()` ni como chatbot. Requiere obligatoriamente el mecanismo de lectura restringida de logits (prompt con tabla de codigos de una letra, logits del ultimo token, restriccion al conjunto de opciones validas y softmax).
- Reimplementar ese mecanismo por cuenta propia es desaconsejado por el propio autor; la ruta prevista es la clase `RoutingDecoderModel` del repositorio principal.
- La model card no documenta sesgos conocidos, idiomas soportados ni composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo sistematico.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que la salida se restringe a codigos de opciones validas; sin embargo, la calibracion de las probabilidades puede degradarse fuera de la distribucion de estados vista en entrenamiento. No hay datos publicados sobre este extremo.
- Latencia no competitiva: ~112 ms p50 frente a los <18 ms de Von y los ~16 ms de Laya citados por el autor, lo que puede ser limitante en aplicaciones de muy baja latencia.
- El limite de opciones es acotado: 26 en el adaptador de texto y 588 en el de vision.
- En caso de discrepancia entre esta model card y los ficheros `manifest.json` incluidos en cada subcarpeta, el autor indica que los manifiestos son la fuente de verdad.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion independiente por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion de avisos. Conviene verificar la licencia del modelo base Qwen/Qwen3.5-4B, aunque la model card afirma que es la misma.
- El modelo fue creado el 25 de septiembre de 2026 segun los metadatos, fecha posterior a la actual; conviene tratar el dato con cautela.
- El Space de demostracion incluye cola de ZeroGPU, por lo que sus latencias no reflejan el rendimiento real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhi6168/ekvachan-decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto (codigo fuente, pipeline de entrenamiento y trazabilidad de evidencias): https://github.com/asp616848/better-jev-for-all
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/abhi6168/ekvachan
- Perfil del autor en HuggingFace: https://huggingface.co/abhi6168
- Modelo de decision de referencia (Jev System-One, TypeSafe AI): https://typesafe.ai/blog/introducing-system-one-models-and-jev
