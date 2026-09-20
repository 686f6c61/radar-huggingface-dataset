# fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed89

## Resumen

El modelo `ppt-wc-uniform-newlex-66-eng-100mb_seed89` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/eng_latn_100mb`, desarrollado por el usuario de HuggingFace `fpadovani` (vinculado al proyecto W&B de la Universidad de Groningen). Se trata de un modelo de generacion de texto de tipo transformer decoder-only con arquitectura GPT-2 y 86.508.288 parametros totales (unos 86,5 millones), lo que lo situa en la gama de los modelos pequenos orientados a experimentacion academica mas que a produccion.

El modelo se ha entrenado con la libreria TRL (version 0.23.0) mediante SFT sobre el checkpoint base, que a su vez es un modelo de la coleccion `goldfish-models` entrenado con aproximadamente 100 MB de texto en ingles (etiqueta de idioma `eng_latn`). La nomenclatura del identificador (`ppt-wc-uniform-newlex-66`) sugiere un experimento controlado sobre datos sinteticos o modificados ("newlex" podria referirse a un lexico nuevo), pero la model card no documenta la composicion del dataset de ajuste ni el objetivo cientifico concreto.

Su relevancia es fundamentalmente metodologica: sirve como punto de comparacion reproducible (semilla 89) dentro de una familia de experimentos sobre el efecto de distintos corpus en el aprendizaje de modelos de lenguaje muy pequenos. No es un modelo competitivo en tareas de razonamiento, codigo o conocimiento factual, y carece de resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun etiquetas del repo) |
| Parametros totales | 86.508.288 (aproximadamente 86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la arquitectura GPT-2 de referencia usa 1024 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors sin cuantizar; se pueden aplicar cuantizaciones externas de 8 y 4 bits) |
| Idiomas soportados | No disponible de forma explicita; el modelo base esta etiquetado como `eng_latn` (ingles) y los ejemplos de la model card estan en ingles |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (libreria `transformers`) |

Nota: el repositorio ocupa 6,7 GB, un tamano muy superior al de los pesos en precision fp32 de un modelo de 86,5 M de parametros (aproximadamente 346 MB), lo que sugiere la presencia de checkpoints intermedios o artefactos de entrenamiento adicionales en el repositorio.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 86.508.288 parametros. No se documenta en la informacion proporcionada el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el mecanismo de atencion empleado (no se confirma si usa atencion multi-cabeza clasica, atencion de consulta agrupada u otra variante). Tampoco se especifica la estrategia de tokenizacion ni el tamano del vocabulario, un dato especialmente relevante en un experimento etiquetado como "newlex".

El entrenamiento se realizo mediante aprendizaje supervisado (SFT, *supervised fine-tuning*) con TRL 0.23.0, sobre el modelo base `goldfish-models/eng_latn_100mb`. Las versiones de framework declaradas son Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se indica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de etapas de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, tamano de lote o numero de epocas. La unica referencia reproducible es el registro de Weights & Biases asociado a la ejecucion (`wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/auy5m7zu`), que presumiblemente contiene las curvas de perdida y la configuracion completa.

No se declara ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, mezcla de expertos ni arquitecturas hibridas). El modelo es un ajuste fino convencional de un checkpoint pequeno ya existente.

## Capacidades

- Generacion de texto en ingles: es la unica capacidad confirmada por la model card y por la etiqueta de pipeline `text-generation`.
- Conversacion de un solo turno: el ejemplo oficial utiliza el formato de mensajes con rol `user`, lo que indica que el ajuste SFT se realizo sobre datos con plantilla conversacional.
- Generacion de texto libre con `max_new_tokens` configurable a traves de `transformers.pipeline`.
- Capacidad de razonamiento, matematicas o codigo: no documentada en la informacion proporcionada y altamente improbable dado el tamano del modelo y el volumen de datos del modelo base (100 MB de texto).
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el modelo base esta etiquetado como ingles (`eng_latn`).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Experimentacion academica sobre datos sinteticos: el modelo forma parte de una familia de checkpoints con semillas fijas (aqui, `seed89`), lo que permite comparar el efecto de distintas variantes de corpus de ajuste manteniendo constante la inicializacion.
- Reproduccion de experimentos de ajuste fino con TRL: sirve como referencia para validar pipelines de SFT en modelos pequenos, ya que se publican las versiones exactas de TRL, Transformers, PyTorch y Datasets.
- Linea base (*baseline*) en estudios de aprendizaje de lenguaje a baja escala: con 86,5 M de parametros y un corpus base de 100 MB, es adecuado para medir que estructuras linguisticas se adquieren con presupuestos de computo minimos.
- Docencia y practicas de laboratorio: su tamano permite entrenar, ajustar y ejecutar inferencia en una unica GPU de gama media o incluso en CPU, lo que facilita ejercicios completos de ciclo de vida de un modelo.
- Pruebas de infraestructura de despliegue: util para validar integraciones con `transformers`, TGI o endpoints compatibles antes de migrar a modelos mayores, sin consumir recursos significativos.
- Generacion de texto breve en ingles para validacion de plantillas conversacionales: permite comprobar el formato de mensajes y el pipeline de inferencia en pruebas de integracion.
- Estudio de sesgos y comportamiento de modelos entrenados con corpus reducidos: al estar entrenado sobre una fraccion minima de texto, resulta un caso de estudio controlado sobre degradacion de calidad frente al volumen de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HellaSwag, GSM8K, HumanEval ni otras), y los resultados de la busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16, 0,09 GB en cuantizacion de 8 bits y 0,05 GB en 4 bits, solo para los pesos. A ello hay que sumar la memoria de la cache KV, que es marginal dado el tamano del modelo.
- Compatibilidad con GPU de consumo: cabe holgadamente en cualquier GPU de consumo actual, incluidas tarjetas con 4 GB de VRAM o menos (GTX 1650, RTX 3050, RTX 4060, RTX 4090). La RTX 4090 o una A100 estarian enormemente sobredimensionadas para este modelo.
- Ejecucion en CPU: viable para inferencia interactiva, dado el reducido numero de parametros. Tambien es posible el ajuste fino en CPU, aunque poco eficiente frente a GPU.
- GPU de centro de datos (A100, H100): no son necesarias; solo tendrian sentido para entrenar muchas semillas en paralelo o para reproducir el pipeline completo con grandes lotes.
- Opciones de despliegue: `transformers` (soporte nativo, unico confirmado por la model card), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitecturas GPT-2), y conversion a GGUF para llama.cpp u Ollama mediante herramientas externas, ya que no se publican pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Cualitativamente, el coste por token es muy bajo, pero no se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base del que deriva. Los datos de las alternativas que se citan a continuacion provienen de documentacion publica general y no de la busqueda realizada, por lo que deben tomarse como referencia orientativa, no como cifras verificadas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed89` | 86,5 M | No disponible | No disponible | HuggingFace, safetensors | Ajuste SFT con TRL sobre corpus base de 100 MB |
| `goldfish-models/eng_latn_100mb` (modelo base) | No disponible en la informacion | No disponible | No disponible | HuggingFace | Modelo base en ingles entrenado con 100 MB de texto |
| `distilgpt2` | Aproximadamente 82 M (referencia publica) | 1024 tokens (referencia publica) | Licencia abierta de OpenAI (referencia publica) | HuggingFace | Alternativa destilada ampliamente usada como linea base |
| `gpt2` | Aproximadamente 124 M (referencia publica) | 1024 tokens (referencia publica) | Licencia abierta de OpenAI (referencia publica) | HuggingFace | Modelo de referencia de la familia GPT-2 |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que no es posible establecer una jerarquia de calidad entre ellas.

## Limitaciones y advertencias

- Licencia sin especificar: la model card declara el campo `licence: license` sin terminos concretos. No se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluacion: no hay benchmarks publicados, por lo que se desconoce la calidad real de las generaciones y no se puede verificar ninguna afirmacion de rendimiento.
- Riesgo elevado de alucinacion y de texto incoherente: con 86,5 M de parametros y un corpus base de 100 MB, la capacidad de mantener coherencia a lo largo de varios turnos y de recuperar conocimiento factual es muy limitada.
- Cobertura idiomatica restringida: el modelo base esta etiquetado como ingles (`eng_latn`); no hay evidencia de soporte de otros idiomas, incluido el castellano.
- Contexto limitado: no se documenta la longitud de contexto, y la arquitectura GPT-2 de referencia esta limitada a 1024 tokens, lo que descarta casos de uso con documentos largos.
- Sesgos desconocidos: al no documentarse la composicion del corpus de ajuste ni del corpus base (mas alla del volumen de 100 MB), no es posible auditar sesgos de genero, raza, religion u origen. Cualquier sesgo presente en el corpus se hereda sin filtrado declarado.
- Datos de entrenamiento no documentados: se desconoce si el ajuste uso datos sinteticos, traducidos o generados, lo que impide evaluar riesgos de contaminacion o de amplificacion de artefactos.
- No apto para produccion conversacional: no dispone de alineacion mediante RLHF o DPO declarada, ni de mecanismos de seguridad, moderacion o rechazo de peticiones daninas.
- Trazabilidad parcial: el unico registro reproducible del entrenamiento es el enlace a Weights & Biases, que puede dejar de estar accesible.
- Resultados de busqueda no relevantes: las busquedas web realizadas devolvieron exclusivamente paginas comerciales sobre trampas para polillas, sin ninguna relacion con el modelo. No se ha podido verificar informacion adicional externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed89
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/auy5m7zu
- Paper de referencia de TRL (cita incluida en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", GitHub, 2020
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron contenido sin relacion con el modelo
