# fpadovani/eng-100mb-after-wc-uniform-oldlex-eng-ckpt500_seed455_seed455

## Resumen

`fpadovani/eng-100mb-after-wc-uniform-oldlex-eng-ckpt500_seed455_seed455` es un modelo de generacion de texto de tipo GPT-2 con 124.770.816 parametros (unos 124,8 millones), publicado por el usuario fpadovani y obtenido mediante ajuste fino supervisado (SFT) con la libreria TRL sobre el modelo base `fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455`. No es un modelo de proposito general ni un lanzamiento de producto: por su nomenclatura y por la traza de entrenamiento alojada en un proyecto de Weights & Biases vinculado a la Universidad de Groningen (proyecto `white_cotterell`), se trata con alta probabilidad de un artefacto de investigacion dentro de un experimento controlado sobre datos de preentrenamiento (variaciones de lexico y de distribucion de palabras, semilla 455, checkpoint 500).

El problema que aborda es el de permitir la reproducibilidad de un experimento de ajuste fino sobre un modelo pequeno entrenado con un corpus reducido (el identificador sugiere 100 MB de texto en ingles). Sus parametros, contexto y capacidades quedan muy lejos de los modelos actuales de gran escala, por lo que su relevancia no es competitiva sino metodologica: sirve como punto de comparacion controlado en estudios de adquisicion de lenguaje y como ejemplo minimo de pipeline SFT con TRL.

La informacion publicada es muy escasa: la model card se limita a indicar el modelo base, el uso de SFT y las versiones de framework, sin detallar dataset, numero de tokens, licencia ni resultados de evaluacion. Cualquier dato no confirmado se marca explicitamente como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (124,8 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia GPT-2 suele usar 1.024 tokens, pero no se confirma en la informacion del repositorio) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos sin cuantizar, aunque al ser un modelo pequeno admite cuantizacion posterior a int8/int4 con herramientas estandar |
| Idiomas soportados | no disponible; el identificador incluye `eng`, lo que sugiere entrenamiento exclusivo o predominante en ingles |
| Licencia | no disponible (la model card contiene el marcador de posicion `licence: license`, sin texto legal real) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,5 GB |
| Modelo base | fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455 |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124,8 millones de parametros, equivalente en orden de magnitud al GPT-2 Small original. El repositorio se etiqueta con `transformers`, `safetensors`, `text-generation` y `text-generation-inference`, y expone un `pipeline` de generacion de texto compatible con el chat template de TRL (el ejemplo de uso pasa una lista de mensajes con rol `user`). No se documenta ninguna innovacion arquitectonica: ni atencion lineal, ni mezcla de expertos, ni decodificacion especulativa.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el checkpoint `ppt-wc-uniform-oldlex-eng-100mb_seed455`, ejecutado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/white_cotterell` (run `zgfux78e`). No se especifica el dataset de SFT, el numero de tokens de entrenamiento, la composicion de los datos ni si se aplicaron etapas posteriores de RLHF o DPO. El sufijo `ckpt500` del nombre indica que se trata del checkpoint correspondiente al paso 500 del entrenamiento, y `seed455` aparece duplicado, lo que apunta a un barrido de semillas para medir varianza experimental.

## Capacidades

- Generacion de texto autoregresiva basica: completado de frases y respuestas cortas a partir de un prompt de usuario, con un maximo practico de unos pocos cientos de tokens por respuesta.
- Seguimiento de instrucciones muy limitado, adquirido mediante SFT; el formato esperado es una lista de mensajes con rol `user`, tal como muestra la model card.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o planificacion.
- No hay evidencia de capacidades multilingues; el identificador sugiere entrenamiento en ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni ninguna otra modalidad adicional.
- Al ser un modelo de 124,8 M de parametros con datos de entrenamiento no documentados, la generacion de codigo, matematicas o conocimiento factual fiable no esta garantizada y no se ha validado con benchmarks publicos.

## Casos de uso

- Replicacion de experimentos academicos: el modelo permite reproducir exactamente la configuracion del run `zgfux78e` (misma semilla y mismo checkpoint) para estudios de variabilidad en ajuste fino SFT.
- Linea base de comparacion en estudios de adquisicion del lenguaje: sirve como referencia de bajo coste frente a modelos entrenados con corpus mayores, util para aislar el efecto del volumen y la composicion de los datos.
- Pruebas de pipeline de entrenamiento: al ser un modelo de 124,8 M de parametros, se puede integrar en tests de CI para validar que un flujo TRL/Transformers completo (carga, tokenizacion, generacion) funciona antes de escalar a modelos grandes.
- Demostraciones educativas: cabe en cualquier GPU de consumo e incluso en CPU, por lo que es adecuado para talleres donde se explique como funciona un transformer decoder-only sin infraestructura dedicada.
- Prototipado de interfaces conversacionales: permite cablear el ciclo completo de un chatbot (entrada de usuario, generacion, salida) en local para validar la experiencia de usuario antes de sustituir el modelo por uno mayor.
- Generacion de texto sintetico para pruebas: util para rellenar fixtures de test o datasets de prueba con texto plausible en ingles cuando no se requiere calidad factual.
- Investigacion sobre olvido catastrofico y sobreajuste: al partir de un checkpoint pequeno y ajustarse en una sola etapa, es un sujeto adecuado para medir como el SFT degrada capacidades del modelo base.
- Modelo borrador en decodificacion especulativa: por su tamano, podria emplearse como draft model en un esquema especulativo, aunque no hay ninguna validacion publicada de este uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra metrica, y tampoco hay comparaciones con el modelo base ni con otros checkpoints del mismo barrido experimental.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 124.770.816 parametros): unos 500 MB en fp32 (499 MB de pesos), unos 250 MB en fp16/bf16, unos 125 MB en int8 y unos 62 MB en int4. A estas cifras hay que sumar el coste de activaciones y cache KV, que en la practica anade unos cientos de MB segun la longitud de secuencia.
- Cabe sin problema en cualquier GPU de consumo: RTX 3050, RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso iGPU con memoria compartida suficiente. Tambien es viable en CPU con un rendimiento aceptable para generacion de texto corta.
- GPU de centro de datos (A100, H100) no son necesarias y resultarian desproporcionadas; su unico uso razonable seria procesar lotes masivos en paralelo.
- Opciones de despliegue: `transformers` con `pipeline` (el ejemplo de la model card usa `device="cuda"`), text-generation-inference (la etiqueta `text-generation-inference` y `endpoints_compatible` figura en el repositorio), vLLM, y conversion a GGUF para llama.cpp u Ollama. No se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se aportan mediciones, y cualquier cifra al respecto requeriria medirla en el hardware concreto.

## Comparativa con modelos similares

La comparativa se establece con modelos de proposito general de tamano equivalente. Los datos de las alternativas proceden del conocimiento general de esos modelos y no de la informacion proporcionada en la busqueda, por lo que deben verificarse antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eng-100mb-after-wc-uniform-oldlex-eng-ckpt500_seed455_seed455 | 124,8 M | no disponible | no disponible | repositorio de investigacion, 0 descargas |
| GPT-2 Small | 124 M | 1.024 tokens | MIT | ampliamente disponible en HuggingFace |
| DistilGPT2 | 82 M | 1.024 tokens | Apache 2.0 | ampliamente disponible en HuggingFace |
| Pythia-160M | 160 M | 2.048 tokens | Apache 2.0 | ampliamente disponible, con 154 checkpoints publicados |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | ampliamente disponible, entrenado con 600.000 millones de tokens |

No hay datos de rendimiento publicados para el modelo objeto de esta ficha, por lo que no es posible compararlo en terminos de calidad de generacion. La diferencia relevante frente a las alternativas es la licencia: los modelos comparados tienen licencias permisivas explicitas, mientras que este repositorio no declara ninguna.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos ni de toxicidad. Al entrenarse presumiblemente con un corpus reducido de 100 MB en ingles, es probable que reproduzca los sesgos presentes en esa fuente, sin que exista ninguna mitigacion publicada.
- Alucinacion: con 124,8 M de parametros y sin datos de evaluacion, la tasa de invencion de hechos es alta. No debe usarse para tareas que requieran precision factual.
- Contexto e idioma: la longitud de contexto no esta confirmada y no se declaran idiomas soportados. El identificador sugiere un alcance limitado al ingles, con rendimiento probablemente muy pobre en castellano.
- Licencia: el repositorio no declara licencia utilizable. La model card contiene un marcador de posicion (`licence: license`), por lo que el uso comercial queda en un limbo legal y no deberia adoptarse en produccion sin contactar con el autor.
- Procedencia de los datos: se desconoce por completo el dataset de SFT, lo que impide auditar la procedencia del contenido y los posibles derechos de terceros.
- Estado del artefacto: 0 descargas y 0 "likes", creado y actualizado el mismo dia. Es un experimento de investigacion sin mantenimiento, sin garantias de soporte y sin documentacion de evaluacion.
- Nombre de checkpoint: el sufijo `ckpt500` indica que es un punto intermedio del entrenamiento, no necesariamente el mejor checkpoint del run.
- Uso en produccion: no recomendado para tareas de cara al usuario, generacion de codigo en produccion ni cualquier escenario que exija fiabilidad, trazabilidad o cobertura de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-wc-uniform-oldlex-eng-ckpt500_seed455_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/zgfux78e
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de referencia de TRL: von Werra et al., "TRL: Transformer Reinforcement Learning", 2020 (https://github.com/huggingface/trl)
- No se han encontrado en la busqueda web articulos, papers, blogs ni demos relacionados con este modelo o con su modelo base.
