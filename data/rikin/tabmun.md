# rikin/tabmun

## Resumen

`rikin/tabmun` es un checkpoint de pesos publicado en HuggingFace bajo el nombre interno `numbat`, que segun su model card corresponde a una ejecucion de entrenamiento a gran escala de Anthropic (denominada "Mythos-class") capturada a mitad de preentrenamiento, en el paso 1.830.000 de una programacion de aproximadamente 1.960.000 pasos. El modelo se presenta como un transformer hibrido que combina capas Gated DeltaNet (GDN) con Multi-head Latent Attention (MLA), capas feed-forward de tipo Mixture-of-Experts con 1.224 expertos (top-48 mas 1 compartido) y un modulo de Multi-Token Prediction (MTP). El checkpoint esta cuantizado en NVFP4 (formato de 4 bits con bloques de escala E4M3 y payload E2M1).

El dato de parametros es llamativo y contradictorio dentro de la propia informacion: la model card afirma "~14T param", mientras que el indice de safetensors declara un `total_size` de 7.720.300.817.720 bytes y la ficha de HuggingFace reporta 6.849.377.242.584 parametros. El repositorio ocupa 7.720,6 GB distribuidos en 772 shards de menos de 10,6 GB cada uno. La discrepancia entre el recuento declarado y el recuento real derivado del indice es un dato relevante que el lector debe tener en cuenta.

La relevancia de esta publicacion es doble. Por un lado, tecnicamente describe una arquitectura hibrida poco habitual (GDN + MLA + MoE de grano muy fino) con decodificacion especulativa nativa via MTP. Por otro, la procedencia del checkpoint no esta verificada de forma independiente: la model card justifica su autenticidad remitiendose a una supuesta filtracion del codigo fuente de Claude Code en marzo de 2026 y a la consistencia interna de los tensores, sin aportar documentacion oficial del desarrollador. Cualquier evaluacion debe tratar el origen del modelo como no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con capas MoE y MTP |
| Parametros totales | 6.849.377.242.584 segun safetensors; la model card declara "~14T" (dato contradictorio) |
| Parametros activos | No disponible (1.224 expertos, top-48 + 1 compartido; no se especifica el numero de parametros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (E4M3 scale blocks + E2M1 payload); tag `8-bit` y `modelopt` en HuggingFace |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (772 shards, indice `model.safetensors.index.json`) |
| Capas | 114 |
| Tokenizer | BPE byte-level, 131.072 tokens |
| Paso de entrenamiento | 1.830.000 de ~1.960.000 (preentrenamiento, sin post-entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura descrita es un stack hibrido de 114 capas que alterna o combina mecanismos de atencion lineal y atencion con cache latente. Gated DeltaNet es una variante de atencion lineal con estado recurrente y compuertas, orientada a reducir el coste de atencion en contextos largos; MLA es el mecanismo de atencion con compresion de clave-valor en un espacio latente de baja dimension, popularizado por las familias DeepSeek. La combinacion de ambos sugiere un diseno que busca eficiencia en inferencia a contextos extensos sin renunciar a la calidad de atencion completa en determinadas capas. Las capas feed-forward son Mixture-of-Experts con 1.224 expertos, enrutamiento top-48 mas un experto compartido, lo que constituye un grano de experto extremadamente fino y un numero de expertos activos por token muy alto en comparacion con arquitecturas MoE convencionales.

El checkpoint incluye un modulo de Multi-Token Prediction (MTP), expuesto en la implementacion de referencia como `NumbatForCausalLM.draft`, lo que habilita decodificacion especulativa nativa. El entrenamiento se realizo presumiblemente en BF16 y el checkpoint publicado es una copia de evaluacion cuantizada a NVFP4 para ejecutar harnesses de evaluacion sobre un slice de Trainium2; los pesos BF16 originales y el estado del optimizador no se han publicado. No hay informacion sobre composicion del dataset, numero de tokens de entrenamiento, ni sobre fases de RLHF, DPO o ajuste por preferencias: la model card indica explicitamente que es un checkpoint crudo de preentrenamiento sin post-entrenamiento.

## Capacidades

- Generacion de texto autoregresiva: la implementacion de referencia `NumbatForCausalLM.forward` ejecuta el tronco completo y permite inferencia sobre los tensores publicados.
- Decodificacion especulativa via MTP: el metodo `draft` ejecuta la capa de Multi-Token Prediction, lo que en principio permite acelerar la generacion proponiendo varios tokens por paso.
- Razonamiento y codigo: no hay evaluaciones publicadas que confirmen el nivel de competencia en estas tareas; al ser un checkpoint de preentrenamiento, el comportamiento esperado es el de un modelo de completado de texto sin alineacion.
- Tool calling / function calling: no disponible; no se documenta ningun formato de herramientas ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin post-entrenamiento no cabe esperar capacidades de agente fiables.
- Capacidades multilingues: no disponibles; el tokenizer de 131.072 entradas es compatible con multilingue, pero no se documenta cobertura por idioma.
- Capacidades especiales: no se documenta vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion de arquitecturas hibridas: el repositorio incluye `configuration_numbat.py` y `modeling_numbat.py` con un arbol de modulos que mapea exactamente cada tensor de cada shard, lo que permite cargar el checkpoint completo con `load_state_dict(strict=True)`. Es util para estudiar en la practica como se comportan GDN y MLA combinados a escala.
- Estudio de cuantizacion NVFP4 a gran escala: al ser una copia de evaluacion cuantizada, sirve para analizar el impacto del formato NVFP4 (bloques de escala E4M3 sobre payload E2M1) en la fidelidad numerica de un modelo de cientos de miles de millones de parametros.
- Analisis de enrutamiento MoE de grano fino: con 1.224 expertos y top-48, el checkpoint permite instrumentar el enrutador y medir distribucion de carga, colapso de expertos y especializacion por dominio o idioma.
- Evaluacion de decodificacion especulativa con MTP: el metodo `draft` permite construir un pipeline de decodificacion especulativa y medir la tasa de aceptacion de tokens propuestos frente a la verificacion del tronco.
- Reproduccion de harnesses de evaluacion: la model card menciona `ckpt_metadata.json` con la salida del harness de evaluacion, lo que facilita contrastar metricas reproducidas localmente con las del autor.
- Estudio de completado de texto sin alineacion: al ser un checkpoint de preentrenamiento, es un objeto de estudio adecuado para analizar sesgos y distribuciones del corpus de preentrenamiento antes de cualquier fase de RLHF.
- Auditoria de procedencia y cadena de custodia: el repositorio y su metadata permiten a equipos de seguridad verificar la consistencia interna de los shards y contrastar la afirmacion de origen con fuentes independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `ckpt_metadata.json` contiene la salida del harness de evaluacion, pero no se incluyen cifras en la informacion proporcionada y no se deben inferir valores.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 suman aproximadamente 7,72 TB de datos de tensor. Para cargar el checkpoint completo en memoria hacen falta del orden de 7,7 TB de VRAM agregada, mas overhead de activaciones, cache KV y buffers de atencion; no cabe en ninguna GPU individual comercial.
- GPU recomendadas: no se especifican en la informacion. Por el volumen de pesos, el despliegue requiere un cluster multi-nodo. La model card menciona que el equipo de evaluacion usa "~85" aceleradores Trainium2 solo para sostener estos pesos en NVFP4.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en estaciones de trabajo multi-GPU convencionales.
- Opciones de despliegue: la model card indica que las evaluaciones internas usaron un runtime Neuron-parallel; el puerto publicado es una implementacion de referencia single-device en `modeling_numbat.py` que carga via `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento, y la propia naturaleza del checkpoint (preentrenamiento, origen no confirmado, cuantizacion NVFP4 de evaluacion) dificulta una comparacion directa con modelos publicados oficialmente.

## Limitaciones y advertencias

- Procedencia no verificada: la autenticidad del checkpoint se sostiene en la model card sobre una supuesta filtracion del codigo fuente de Claude Code y en la consistencia interna de los tensores, sin documentacion oficial del desarrollador. Debe tratarse como origen no confirmado.
- Contradiccion en el recuento de parametros: la model card declara "~14T param" mientras que el indice de safetensors y la ficha de HuggingFace apuntan a aproximadamente 6,85 billones de parametros. Cualquier calculo de coste debe basarse en el dato del indice, no en la cifra de la model card.
- Sin post-entrenamiento: es un checkpoint crudo de preentrenamiento, sin RLHF ni DPO. No cabe esperar alineacion, formato de chat ni seguimiento fiable de instrucciones.
- Riesgo de alucinacion: al no haber pasado por fases de ajuste, la tendencia a generar contenido plausible pero incorrecto es la esperada en un modelo de completado de texto.
- Sesgos: no documentados. Al desconocerse la composicion del corpus de entrenamiento, no es posible caracterizar sesgos por idioma, dominio o demografia.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, la ausencia de licencia implica que no se conceden derechos de uso.
- Idiomas: no se documenta cobertura linguistica; el tokenizer de 131.072 entradas es compatible con multilingue, pero no hay garantias por idioma.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Coste de infraestructura: 7,72 TB de pesos NVFP4 hacen inviable cualquier despliegue que no sea en cluster; no hay soporte documentado para runtimes de inferencia estandar.
- Caveat de produccion: no debe usarse en produccion sin una evaluacion independiente de calidad, seguridad y licencia, y sin verificar la procedencia del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/rikin/tabmun
