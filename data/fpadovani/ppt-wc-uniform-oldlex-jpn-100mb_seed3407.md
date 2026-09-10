# fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed3407` es un ajuste fino (fine-tune) del modelo monolingüe `goldfish-models/eng_latn_100mb`, desarrollado por el usuario fpadovani en el marco del grupo de investigación asociado a la Universidad de Groningen (los registros de entrenamiento apuntan al proyecto "white_cotterell" en Weights & Biases). Se trata de un modelo de generación de texto con arquitectura GPT-2 y 86.416.128 parámetros, entrenado mediante SFT (supervised fine-tuning) con la librería TRL.

El problema que aborda es de naturaleza experimental más que de producto: el nombre del modelo sugiere una ablación sobre tokenizador y vocabulario (los segmentos "uniform", "oldlex" y "jpn" apuntan a variantes de léxico y a experimentos con japonés) aplicada sobre un corpus de aproximadamente 100 MB, con la semilla 3407 fijada para reproducibilidad. No se declara ninguna tarea downstream concreta ni un conjunto de datos de instrucciones identificado en la model card.

Su relevancia es por tanto acotada al ámbito de la investigación reproducible: sirve como punto de comparación en estudios sobre transferencia de vocabulario, entrenamiento con presupuestos de datos muy reducidos y evaluación de recetas de SFT en modelos pequeños. No dispone de descargas ni de "likes" en HuggingFace en el momento de la consulta, y la licencia no está especificada (la model card contiene únicamente el marcador de posición `licence: license`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` del repositorio) |
| Parametros totales | 86.416.128 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la declara; la familia GPT-2 suele emplear 1.024 tokens, sin confirmar en este caso) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base es `eng_latn`, ingles en escritura latina; el sufijo `jpn` del nombre no viene acompanado de declaracion de idiomas) |
| Licencia | no disponible (la model card solo incluye el literal `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`; tamano del repositorio 1,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal y como indica el tag `gpt2` del repositorio y el pipeline declarado `text-generation`. Con 86,4 millones de parametros, se situa por debajo de GPT-2 small (124 M) y ligeramente por encima de distilgpt2 (82 M). El modelo parte de `goldfish-models/eng_latn_100mb`, un checkpoint de la coleccion Goldfish entrenado sobre aproximadamente 100 MB de texto en ingles, y ha sido ajustado con SFT mediante TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo (`ppt-wc-uniform-oldlex-jpn-100mb_seed3407`) sugiere una configuracion experimental con vocabulario "uniforme" y lexico antiguo sobre datos de 100 MB, con semilla 3407.

No se documenta en la model card el volumen de tokens de instrucciones usado en el ajuste fino, la composicion del dataset de SFT, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes de atencion eficiente: se trata de un ajuste fino estandar ejecutado con la receta de SFT de TRL. El unico artefacto de trazabilidad disponible es el registro de entrenamiento en Weights & Biases, cuyo enlace figura en la propia model card.

## Capacidades

- Generacion de texto autoregresiva en el estilo y dominio de los datos de ajuste; el pipeline de ejemplo de la model card muestra el uso con un prompt conversacional de tipo pregunta-respuesta, sin plantilla de chat formal declarada.
- Razonamiento: no disponible como capacidad verificada; no se publican evaluaciones de razonamiento ni de cadenas de pensamiento.
- Codigo y matematicas: no disponible; no hay evidencia en la informacion proporcionada.
- Tool calling / function calling: no disponible; no se menciona soporte de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara ninguna capacidad agentica.
- Capacidades multilingues: no disponibles; solo se puede afirmar que el modelo base es de ingles (`eng_latn`) y que el nombre del ajuste incluye la etiqueta `jpn`, sin documentacion que lo respalde.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el repositorio no declara ninguna modalidad adicional.
- Integracion: es compatible con `text-generation-inference` y con `endpoints_compatible` segun los tags, por lo que puede servirse mediante la infraestructura de inferencia de HuggingFace.

## Casos de uso

- Ablacion de tokenizador y vocabulario en investigacion: dado el nombre del modelo, el caso natural es comparar recetas de lexico ("uniform" frente a "oldlex") sobre el mismo corpus de 100 MB y la misma semilla, midiendo perplejidad en un conjunto de validacion fijo.
- Reproducibilidad de experimentos de SFT: al fijar la semilla 3407 y publicar el registro de Weights & Biases, sirve para replicar exactamente una ejecucion de TRL y verificar la variabilidad entre semillas en modelos de menos de 100 M de parametros.
- Generacion de texto de bajo coste en local: con 86 M de parametros, cabe en CPU y en cualquier GPU de consumo, por lo que es util para prototipar interfaces de generacion de texto sin dependencia de APIs externas.
- Pruebas de humo en pipelines de despliegue: permite validar integraciones con `transformers`, `text-generation-inference`, endpoints compatibles con la API de HuggingFace y, previa conversion a GGUF, con llama.cpp u Ollama, sin consumir recursos significativos.
- Generacion de datos sinteticos a pequena escala para filtrado o aumentar datasets de clasificacion: el modelo puede producir continuaciones textuales que despues se filtran por reglas o por un modelo mayor.
- Docencia y divulgacion sobre entrenamiento de LLM: su tamano reducido (1,4 GB de repositorio, 173 MB en fp16) permite ejecutar el ciclo completo de carga, inferencia y analisis de pesos en un portatil.
- Linea base en estudios de destilacion o comparacion con modelos mayores: sirve como referencia de "modelo pequeno entrenado con 100 MB" frente a checkpoints de mayor presupuesto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni de ninguna otra metrica en la model card ni en los resultados de busqueda asociados al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16, 0,09 GB en int8 y 0,04 GB en int4. Con cache KV y overhead del runtime, el consumo real sera ligeramente superior, pero sigue siendo marginal.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; se ha disenado para ejecutarse incluso en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en cualquier modelo actual (GTX 1050 Ti en adelante, integradas modernas con suficiente memoria compartida, y telefonos de gama alta mediante runtimes moviles).
- Opciones de despliegue: `transformers` con `pipeline` (metodo del ejemplo oficial), `text-generation-inference` (el tag `text-generation-inference` lo declara compatible), endpoints de HuggingFace (`endpoints_compatible`), y vLLM o llama.cpp/Ollama previa conversion de los pesos a los formatos correspondientes (no se publican variantes GGUF).
- Latencia y throughput: no disponible; no se publican medidas. Por el tamano del modelo, cabe esperar latencias muy bajas tanto en CPU como en GPU, pero no hay cifras verificables en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed3407 | 86,4 M | no disponible | no disponible | HuggingFace, safetensors | Ajuste SFT de un modelo Goldfish |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Entrenado sobre ~100 MB de ingles; origen del ajuste |
| GPT-2 small | 124 M | 1.024 tokens | Licencia MIT modificada de OpenAI | Ampliamente disponible | Referencia clasica de la familia GPT-2 |
| distilgpt2 | 82 M | 1.024 tokens | Apache 2.0 | Ampliamente disponible | Version destilada de GPT-2, tamano comparable |

No se dispone de datos de rendimiento comparado entre estos modelos para esta ficha, por lo que la comparacion se limita a parametros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un corpus de 100 MB en ingles, es probable que herede los sesgos de esa fuente, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en terminos relativos, propio de un modelo de 86 M de parametros con un presupuesto de datos muy reducido. No debe usarse como fuente de hechos.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni cobertura idiomatica; el modelo base es de ingles y el sufijo `jpn` del nombre no implica soporte real de japones sin evaluacion.
- Restricciones de licencia: la model card contiene un marcador de posicion (`licence: license`), de modo que no hay licencia efectiva declarada. No se recomienda su uso comercial sin aclarar antes los terminos con el autor y con el modelo base.
- Ausencia de plantilla de chat: el ejemplo oficial pasa una lista con el rol `user`, pero no se especifica una plantilla de conversacion entrenada, por lo que el comportamiento multi-turno no esta garantizado.
- Trazabilidad limitada: no se documentan tokens de entrenamiento, composicion del dataset de SFT ni hiperparametros; solo se enlaza una ejecucion de Weights & Biases.
- Advertencia de busqueda: los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo (corresponden a paginas de soporte de Google Play en arabe) y no se han utilizado como fuente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/7ltbaam6
- Repositorio de TRL: https://github.com/huggingface/trl
- Citacion de TRL (von Werra et al., 2020): incluida en la model card del autor, sin enlace adicional.
