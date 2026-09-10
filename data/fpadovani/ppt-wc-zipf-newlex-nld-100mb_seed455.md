# fpadovani/ppt-wc-zipf-newlex-nld-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-wc-zipf-newlex-nld-100mb_seed455` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/eng_latn_100mb`, desarrollado por el usuario fpadovani en el marco de un proyecto de investigacion vinculado a la Universidad de Groningen (el registro de entrenamiento apunta al proyecto de Weights & Biases `f-padovani-university-of-groningen/white_cotterell`). Se distribuye como un modelo de generacion de texto con arquitectura GPT-2 y 86.508.288 parametros totales, derivado de la familia Goldfish de modelos monocultivo (monolingues) entrenados sobre volumenes reducidos de datos.

El interes de esta publicacion no es tanto su rendimiento como su caracter experimental. La nomenclatura del identificador (`ppt`, `wc`, `zipf`, `newlex`, `100mb`, `seed455`) sugiere una ablacion de investigacion sobre las propiedades estadisticas del corpus de entrenamiento (ley de Zipf, vocabulario o lexico nuevo, «white cotterell» como referencia al laboratorio) con una semilla concreta, lo que lo convierte en un artefacto util para reproducibilidad de experimentos mas que para despliegue en produccion. El propio autor no publica resultados de evaluacion ni descripcion del dataset de SFT.

El modelo se ha publicado sin licencia declarada en la model card (el campo `licence: license` es un marcador de plantilla sin contenido), con cero descargas y cero interacciones en el momento de la consulta, y con una unica fuente de documentacion: la model card autogenerada por TRL. Todo ello limita considerablemente su uso fuera del contexto de investigacion para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` de HuggingFace |
| Parametros totales | 86.508.288 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion; los pesos se distribuyen en safetensors (repo de 1,4 GB) |
| Idiomas soportados | no disponibles; el modelo base es `goldfish-models/eng_latn_100mb` (ingles, script latin) y el nombre incluye el codigo ISO 639-3 `nld` (neerlandes), sin que la model card aclare el idioma real del ajuste |
| Licencia | no disponible (la model card contiene `licence: license`, marcador de plantilla sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only con atencion causal, heredado integramente del modelo base `goldfish-models/eng_latn_100mb`. No hay ninguna innovacion arquitectonica declarada, ni decodificacion especulativa, ni atencion lineal, ni componentes de mezcla de expertos: es un ajuste fino estandar sobre un checkpoint preentrenado.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El run de entrenamiento esta registrado publicamente en Weights & Biases (`rotnlxog`, proyecto `f-padovani-university-of-groningen/white_cotterell`), pero la informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset de SFT, ni si se aplicaron fases posteriores de RLHF o DPO. Tampoco se detalla el hiperparametro de longitud de contexto utilizada.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Goldfish de 100 MB de datos y refinada con SFT.
- Ajuste al formato conversacional de un unico turno de usuario: el ejemplo de la model card invoca `pipeline` con una lista de mensajes `[{"role": "user", "content": ...}]`, lo que indica que el SFT se hizo sobre datos con plantilla de chat.
- Capacidad de seguir instrucciones sencillas en el estilo de las respuestas presentes en el dataset de SFT (no documentado).
- Soporte de tool calling / function calling: no disponible, no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades multilingues: no disponibles; existe una ambiguedad entre el idioma del modelo base (ingles) y el sufijo `nld` del identificador.
- Modo «thinking», vision o audio: no disponible, el modelo es exclusivamente de texto.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Reproducibilidad de experimentos de investigacion: el identificador incluye `seed455`, lo que permite replicar exactamente una configuracion de SFT concreta dentro de una ablacion sobre propiedades del corpus; es el uso principal y mas realista del modelo.
- Punto de partida para ablaciones controladas: al compartir base (`goldfish-models/eng_latn_100mb`) con otras variantes del mismo proyecto, sirve como condicion experimental para comparar el efecto de distintos corpus o filtros (`zipf`, `newlex`) manteniendo constante la arquitectura.
- Pruebas de infraestructura de despliegue: con 86,5 M de parametros y pesos safetensors, es util para validar pipelines de TRL, TGI o vLLM con un coste de computo minimo antes de escalar a modelos mayores.
- Generacion de texto de bajo coste en tareas no criticas: prototipos de autocompletado o generacion de borradores en ingles, siempre que se acepte la ausencia de garantias de calidad.
- Estudio de sesgos y de comportamiento de modelos pequenos entrenados con datos limitados: el modelo es un sujeto adecuado para analizar como 100 MB de datos afectan a la fluidez y a la coherencia.
- Experimentos docentes: ilustracion practica de un ciclo completo de ajuste con TRL, desde el modelo base hasta la publicacion en HuggingFace, con requisitos de hardware triviales.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni cualquier escenario que requiera contexto largo, tool calling o garantias de licencia, dado que nada de ello esta documentado ni validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K, Perplexity ni evaluaciones del estilo Open LLM Leaderboard), y el unico artefacto externo es un run de Weights & Biases cuyo contenido no se ha proporcionado en esta busqueda. Los resultados de busqueda web recuperados no guardan ninguna relacion con el modelo (son hilos de foro sobre WhatsApp Web y Microsoft Community), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (86,5 M de parametros x 4 bytes) y alrededor de 0,17 GB en fp16/bf16, mas el overhead del runtime y de la cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se necesita A100, H100 ni similar. Tambien funciona en CPU con latencias aceptables para generacion de texto corta.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna (serie RTX 20/30/40, GTX 10xx con suficiente VRAM, e incluso en iGPU con memoria compartida). Tambien cabe en Raspberry Pi o en un contenedor sin GPU.
- Opciones de despliegue: `transformers` (via `pipeline`, como muestra la model card), TRL para reentrenamiento, Text Generation Inference y endpoints compatibles segun los tags del repositorio; la conversion a llama.cpp, Ollama o GGUF es tecnicamente viable a partir de los safetensors, aunque no esta documentada por el autor.
- Latencia y throughput estimados: no disponibles. Como referencia dimensional, un modelo de 86,5 M de parametros es aproximadamente 15 veces mas pequeno que un Llama-3.1-8B, por lo que la latencia por token estara dominada por el overhead del runtime y no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-nld-100mb_seed455` | 86,5 M | no disponible | no publicado | no disponible | HuggingFace, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace (familia Goldfish) |
| Otras variantes del mismo proyecto (`ppt-wc-*`) | no disponible | no disponible | no disponible | no disponible | HuggingFace, perfil de fpadovani |
| GPT-2 (referencia externa de la misma familia, 124 M parametros) | 124 M | 1.024 tokens (configuracion habitual de GPT-2) | ampliamente evaluado en la literatura | MIT (GPT-2 original) | amplia |

No se han identificado en la informacion disponible otros modelos comparables de la misma categoria con datos verificables. Los modelos GPT-2 y distilgpt2 se incluyen unicamente como referencia dimensional de la familia; no implican ninguna equivalencia de rendimiento con este ajuste.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks publicados no es posible estimar la calidad de las respuestas ni compararla con alternativas.
- Riesgo elevado de alucinacion: un modelo derivado de un base de 100 MB de datos de entrenamiento tiene una cobertura de conocimiento muy limitada y una tendencia alta a generar texto plausible pero incorrecto.
- Sesgos conocidos: no documentados, pero los modelos pequenos entrenados con corpus reducidos amplifican los sesgos presentes en esos datos y carecen de filtrado declarado.
- Licencia no determinada: el campo `licence: license` es un marcador de plantilla sin contenido legal. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, por lo que debe tratarse como no apto para produccion hasta que el autor lo aclare.
- Ambiguedad de idioma: el nombre del modelo incluye `nld` (neerlandes) mientras que el modelo base es ingles (`eng_latn`). Cualquier uso en neerlandes es una suposicion no verificada.
- Longitud de contexto desconocida: no se puede asumir soporte de contexto largo, lo que descarta conversaciones multi-turno extensas o procesamiento de documentos.
- Cero traccion comunitaria: 0 descargas y 0 «likes» implican ausencia de validacion externa, de issues reportados y de casos de uso probados por terceros.
- Sin soporte de tool calling ni de agentes: no hay plantilla de funciones declarada en la model card.
- Repositorio de 1,4 GB para 86,5 M de parametros: sugiere la presencia de estados de optimizador u otros artefactos de entrenamiento, lo que aumenta el coste de descarga sin aportar valor en inferencia (no confirmado por el autor).
- Fecha de creacion inusual (2026-09-10): conviene verificar la vigencia del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-nld-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/rotnlxog
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita incluida en la model card): von Werra et al., «TRL: Transformer Reinforcement Learning», GitHub, 2020.
- Perfil del autor: https://huggingface.co/fpadovani
- Familia Goldfish: https://huggingface.co/goldfish-models
