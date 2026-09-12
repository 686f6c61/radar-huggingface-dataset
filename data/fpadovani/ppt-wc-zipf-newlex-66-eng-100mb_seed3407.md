# fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed3407

## Resumen

`fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo `goldfish-models/eng_latn_100mb`, un transformer decoder-only de estilo GPT-2 entrenado sobre 100 MB de texto en ingles. El modelo resultante tiene 86.508.288 parametros segun los pesos en safetensors y se distribuye unicamente a traves de HuggingFace con la libreria `transformers`.

Su relevancia no viene de capacidades de proposito general, sino de su caracter experimental: pertenece a una familia de variantes (el identificador sugiere condiciones sobre frecuencia de palabras, distribucion de Zipf y lexico nuevo, con semilla fija 3407) orientada a estudiar como afectan distintas condiciones de datos y de ajuste a modelos pequenos. Esta pensado para investigacion en modelado del lenguaje y para reproducir pipelines de SFT con TRL, no para uso en produccion.

Se trata de un modelo denso, de tamano muy reducido (86,5 M de parametros, aproximadamente 173 MB en fp16), sin benchmarks publicados, sin licencia declarada y sin versiones cuantizadas. Todo esto limita su uso a entornos de experimentacion y prototipado controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun los tags `gpt2` y `transformers`) |
| Parametros totales | 86.508.288 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no la documenta) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors. No se distribuyen GGUF, GPTQ ni AWQ |
| Idiomas soportados | ingles (el modelo base es `eng_latn`); no se documentan otros idiomas |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors, cargables con `transformers` |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Pipeline | `text-generation` |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, es decir, atencion causal con normalizacion previa a cada subcapa, segun indican los tags del repositorio y el uso de `transformers` como libreria. No se documenta la configuracion concreta (numero de capas, dimension oculta, cabezas de atencion, ventana de contexto ni politica de embeddings atados), por lo que no es posible confirmar si reproduce exactamente la configuracion de GPT-2 small o una variante recortada. El recuento real de parametros, 86.508.288, es inferior a los 124 M de GPT-2 small con embeddings atados, lo que apunta a una configuracion algo menor o a la omision de pesos en el recuento, pero esto no puede verificarse con la informacion disponible.

El entrenamiento fue un ajuste fino supervisado (SFT) mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo base se entreno con 100 MB de texto en ingles, lo que sitúa el corpus total en un regimen muy bajo en comparacion con modelos actuales. La model card no especifica el dataset de ajuste, el numero de tokens, la composicion de los datos, ni si hubo etapas de RLHF o DPO posteriores al SFT. Si se documenta el registro del experimento en Weights & Biases.

## Capacidades

- Generacion de texto en ingles: continuacion de prompt y respuesta a entradas conversacionales simples mediante la plantilla de mensajes de `transformers`.
- Modelado del lenguaje a nivel de token y de palabra: util para experimentos de distribucion lexica, frecuencia de terminos y comportamiento tipo Zipf.
- Ajuste fino reproducible: el modelo se puede usar como punto de partida o como referencia en pipelines de SFT con TRL.
- Inferencia con `text-generation-inference` (el repositorio incluye el tag `text-generation-inference` y es compatible con `endpoints_compatible`).
- Compatibilidad con `transformers.pipeline("text-generation")`.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Multilingue: no. El modelo base corresponde a ingles (`eng_latn`) y no se declaran otros idiomas.

## Casos de uso

- Investigacion en curricula de datos y preentrenamiento: la nomenclatura del modelo apunta a un estudio de condiciones sobre frecuencia lexical y distribucion de Zipf; se usaria como sujeto experimental para comparar variantes con la misma semilla y el mismo presupuesto de datos.
- Reproduccion de pipelines de SFT: sirve como ejemplo verificable de ajuste con TRL 0.23.0 sobre un GPT-2 pequeno, util para validar scripts, configuraciones y registros en Weights & Biases antes de escalar a modelos mayores.
- Prototipado rapido de generacion de texto en ingles: al ocupar menos de 350 MB en fp32, permite montar demos locales de `text-generation` sin GPU dedicada.
- Aumento de datos sinteticos para clasificadores: se pueden generar continuaciones cortas para aumentar conjuntos de entrenamiento de clasificacion de texto en ingles, siempre con revision manual por la baja fidelidad esperable.
- Analisis linguistico cuantitativo: estudio de la distribucion de frecuencias, repeticiones y sesgos lexicos en la salida de un modelo entrenado con un corpus de 100 MB.
- Pruebas de integracion de infraestructura: su tamano permite validar despliegues con TGI, endpoints compatibles o `transformers` en CPU en cuestion de segundos, como paso previo a modelos mayores.
- Docencia: ejemplo manejable para explicar el ciclo completo de entrenamiento, ajuste y despliegue de un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la model card no aporta metricas de perdida, perplejidad ni comparaciones con modelos similares. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para los pesos, segun el recuento real de 86.508.288 parametros: aproximadamente 346 MB en fp32, 173 MB en fp16 o bf16, 87 MB en int8 y 44 MB en int4. Estas cifras no incluyen cache KV, activaciones ni el overhead del runtime.
- Cache KV: no calculable con precision porque la longitud de contexto no esta documentada; en configuraciones tipo GPT-2 con ventanas de 1.024 tokens y lote 1 el consumo es de decenas de MB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en GPUs de centro de datos (A100, H100) aunque muy sobredimensionadas para este tamano.
- Inferencia en CPU: viable sin cuantizacion adicional; es una de las pocas configuraciones donde un modelo de este tamano resulta practico en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, y `text-generation-inference` (TGI), ya que el repositorio esta marcado como compatible. Para `llama.cpp` u `Ollama` seria necesaria una conversion propia a GGUF, que no se distribuye.
- Latencia y throughput: no se han publicado medidas. No hay datos de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed3407` | 86.508.288 | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT experimental; sin benchmarks |
| `goldfish-models/eng_latn_100mb` | no disponible | no disponible | no disponible | HuggingFace | Modelo base; entrenado con 100 MB de ingles |
| `openai-community/gpt2` | 124 M | 1.024 tokens | MIT modificada | HuggingFace, ampliamente usado | Referencia de la arquitectura; mucho mas validado |
| `distilgpt2` | 82 M | 1.024 tokens | Apache-2.0 | HuggingFace, ampliamente usado | Destilado de GPT-2; comparable en tamano |

No es posible establecer una comparacion de rendimiento: este modelo no publica resultados de benchmarks y no se dispone de evaluaciones comparables sobre el mismo conjunto de tareas. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Corpus de preentrenamiento de solo 100 MB en ingles: el conocimiento factual es muy limitado y la tasa de alucinacion en preguntas abiertas es alta.
- Alta probabilidad de degeneracion: repeticiones, incoherencias y perdida de hilo en generaciones de mas de unas pocas decenas de tokens.
- Solo ingles. No hay soporte declarado para castellano ni para ningun otro idioma.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas sin comprobacion empirica.
- Licencia no disponible: la model card usa el marcador `licence: license` y no se especifica la licencia del modelo base, por lo que el uso comercial queda en situacion juridica indeterminada y requiere consulta previa con el autor.
- Sin benchmarks publicados ni validacion de la comunidad (0 descargas, 0 likes): el rendimiento real es desconocido.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito; la plantilla de mensajes del ejemplo no implica un ajuste de instrucciones alineado.
- Sesgos: al derivar de un corpus pequeno en ingles, es probable que reproduzca sesgos de dominio, registro y representacion del corpus de origen; no se han realizado evaluaciones de sesgo.
- No recomendado para produccion ni para decisiones automatizadas con impacto en usuarios. Su uso razonable es la investigacion y el prototipado.
- Fecha de creacion registrada en HuggingFace: 11 de septiembre de 2026. La fecha es posterior a la de la mayoria de los recursos citados y no se ha podido contrastar con otras fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/d7kbr3i8
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de Microsoft y no guardan relacion con el modelo.
