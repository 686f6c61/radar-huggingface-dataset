# dougalldeepmind/2026-10-08-qwen36-0-da-qwen-resp-15

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). Lo publica el usuario dougalldeepmind bajo el identificador `2026-10-08-qwen36-0-da-qwen-resp-15`, con fecha de creacion del 8 de octubre de 2026. Se trata de un artefacto de investigacion procedente de un pipeline de experiments reproducible, no de un modelo listo para produccion.

El adaptador se ha entrenado con receta `sft`, semilla 0, una sola epoca, learning rate 1e-4, batch efectivo de 16 (batch_size 1 con grad_accum 16), longitud maxima de secuencia 8192 y LoRA con r=64, alpha=128 y dropout 0.05. El modo `thinking` esta activado en la configuracion de generacion. El conjunto de datos utilizado es la mezcla `dougalldeepmind/2026-10-08-da-qwen-resp-15-mix` (fichero `mixture.jsonl`), cuyo contenido no se detalla en la informacion disponible.

Su relevancia es acotada y fundamentalmente metodologica: sirve como ejemplo de adaptador PEFT reproducible, con configuracion resuelta incluida en el repositorio (`train_config.yaml`), metadatos de entrenamiento (`training_meta.json`) y procedencia completa (git SHA del repositorio de entrenamiento). El tamano del repositorio es de 1,3 GB. No hay descargas ni likes registrados, y la model card no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3.6-27B (27B nominales) |
| Parametros activos | No disponible (no se declara que el modelo base sea MoE) |
| Longitud de contexto | No disponible en la model card; la longitud maxima de entrenamiento configurada es de 8192 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA), mas tokenizer, `train_config.yaml` y `training_meta.json` |

Hiperparametros de entrenamiento declarados:

| Parametro | Valor |
|---|---|
| Receta | sft |
| Semilla | 0 |
| Epocas | 1.0 |
| Learning rate | 0.0001 |
| Batch size / grad accum | 1 / 16 |
| Max seq len | 8192 |
| LoRA r / alpha / dropout | 64 / 128 / 0.05 |
| Token budget (dynamic batching) | 8000 |
| Agregacion de perdida | seq-mean-token-mean |
| Thinking | true |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de bajo rango (r=64, alpha=128) aplicado sobre Qwen/Qwen3.6-27B. No se describe en la informacion disponible la arquitectura interna del modelo base (tipo de atencion, uso de MoE, atencion lineal, decodificacion especulativa u otras innovaciones), por lo que no se puede confirmar ningun detalle estructural mas alla de que se trata de un modelo de 27B de parametros nominales. El entrenamiento emplea PEFT con dropout de 0.05 sobre las matrices de adaptacion y agregacion de perdida `seq-mean-token-mean` con un presupuesto de tokens por lote de 8000.

El entrenamiento consistio en un unico epoch de SFT sobre la mezcla `dougalldeepmind/2026-10-08-da-qwen-resp-15-mix` (revision b23700803df34bc49c4a9ee94bbf56edd5201d95, fichero `mixture.jsonl`). No se especifica el numero de tokens, la composicion del dataset, ni si hubo fases posteriores de RLHF, DPO u optimizacion por preferencias. La model card indica que la "constitucion" del adaptador se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que enlaza con el repositorio de origen `Lessons_from_constitutional_AFT` (SHA b47e1adc33463b9a956c97dd17cfde2db1fc0c13). No hay informacion sobre tecnicas de regularizacion adicionales, ajuste de embeddings o ampliacion de vocabulario.

## Capacidades

- Ajuste de estilo y formato de respuesta: al ser un adaptador SFT sobre una mezcla de respuestas (`da-qwen-resp`), su funcion prevista es adaptar el comportamiento generativo del modelo base a la distribucion de respuestas de ese conjunto, no aportar capacidades nuevas.
- Generacion de texto con modo razonamiento: la configuracion incluye `thinking: true`, lo que sugiere que el adaptador se entreno preservando o activando cadenas de razonamiento explicitas.
- Herencia de capacidades del modelo base: cualquier capacidad de Qwen/Qwen3.6-27B (codigo, matematicas, multilingue, etc.) se mantiene en la medida en que el ajuste LoRA no la degrade; la model card no documenta ninguna de forma explicita.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modo `thinking` es el unico indicio indirecto.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en ajuste constitutional: el repositorio de origen (`Lessons_from_constitutional_AFT`) y la procedencia completa permiten reproducir el experimento con `uv run train --config train_config.yaml` y estudiar como una mezcla de respuestas moldea el comportamiento del modelo base.
- Reproducibilidad de experimentos de PEFT: al incluir `train_config.yaml` resuelto, el git SHA y `training_meta.json`, el adaptador sirve como referencia para verificar que una ejecucion con los mismos pines produce resultados equivalentes.
- Adaptacion de tono y formato en dominios concretos: si la mezcla `da-qwen-resp-15` contiene respuestas de un dominio determinado, el adaptador puede aplicarse para alinear el estilo de salida de Qwen3.6-27B con ese registro sin reentrenar el modelo completo.
- Destilacion de respuestas generadas: el nombre de la mezcla sugiere respuestas generadas por un modelo Qwen, un escenario tipico de destilacion o auto-entrenamiento; el adaptador permitiria transferir ese formato a un despliegue con el modelo base.
- Base para comparativas de tecnicas de alineacion: al ser un adaptador pequeno (1,3 GB de repositorio), es util como punto de partida para comparar SFT frente a DPO, RLHF u otras recetas sobre el mismo conjunto de datos.
- Pruebas de evaluacion de sesgos y alucinacion post-ajuste: permite medir como un epoch de SFT sobre una mezcla concreta desplaza el comportamiento del modelo base en tareas de veracidad, util como control experimental.
- Despliegue interno con vLLM y multiples adaptadores: el soporte de LoRA en vLLM permite cargar el adaptador sobre el modelo base y servirlo junto a otros adaptadores, util para entornos de experimentacion con A/B testing de estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra), ni comparaciones con el modelo base sin adaptador, ni perdidas de validacion.

## Requisitos de hardware

- El adaptador por si solo ocupa 1,3 GB de repositorio (incluye safetensors, tokenizer y configuraciones); los pesos LoRA en precision de entrenamiento son una fraccion de ese total y no requieren VRAM significativa por si mismos.
- La VRAM real la determina el modelo base Qwen/Qwen3.6-27B. Estimaciones orientativas de ingenieria (no confirmadas en la informacion disponible): en FP16/BF16 el modelo necesita del orden de 54 GB de pesos mas overhead de activaciones y cache KV, lo que exige A100 80GB, H100 80GB o varias GPU de 48 GB.
- En cuantizacion de 8 bits la huella de pesos ronda los 27-30 GB, viable en A100 40GB, L40S 48GB o RTX A6000 48GB.
- En cuantizacion de 4 bits (por ejemplo GGUF Q4_K_M) la huella se situa en torno a 16-17 GB, lo que permite ejecucion en GPU de consumo como RTX 4090 o RTX 3090 de 24 GB, con contexto limitado si la cache KV crece.
- Opciones de despliegue: PEFT junto a transformers para cargar el adaptador directamente; vLLM con soporte de LoRA (`--enable-lora`) para servir el adaptador sobre el modelo base; TGI con adaptadores; para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que estos motores no consumen adaptadores LoRA PEFT directamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni comportamiento bajo carga concurrente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-08-qwen36-0-da-qwen-resp-15 | Adaptador LoRA SFT | Base 27B; adaptador de bajo rango | No disponible (entrenado a 8192) | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base) | Modelo completo | 27B | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores LoRA sobre Qwen3.6-27B | Adaptador LoRA | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones de licencia que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparacion natural es contra el modelo base sin adaptador, pero no se han publicado metricas diferenciales.

## Limitaciones y advertencias

- No hay resultados de evaluacion: sin benchmarks ni perdidas de validacion, es imposible estimar si el ajuste mejora, degrada o deja igual al modelo base en cualquier tarea.
- Riesgo de olvido catastrofico acotado pero no medido: un epoch de SFT con LoRA r=64 sobre 27B es un ajuste relativamente agresivo; no se documenta si se preservan las capacidades originales del modelo base.
- Licencia no declarada: la model card no especifica licencia. Esto impide el uso comercial con seguridad juridica y obliga a contactar con el autor o a asumir la licencia del modelo base, que tampoco se detalla aqui.
- Herencia de la "constitucion" del dataset: la propia model card indica que la constitucion del adaptador se hereda de los datos de entrenamiento y no se declara en el lanzamiento. Esto implica que los sesgos, el estilo y los criterios de seguridad del adaptador dependen de una mezcla no documentada.
- Contenido del dataset desconocido: no se detalla la composicion de `mixture.jsonl`, por lo que no se puede evaluar la cobertura tematica, la presencia de datos sinteticos, la posible contaminacion con benchmarks ni la calidad de las respuestas.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla de lo que herede del modelo base.
- Riesgo de alucinacion: no evaluado. Al tratarse de un ajuste sobre respuestas generadas (posible destilacion), puede amplificar errores factuales presentes en la mezcla si esta contiene salidas sinteticas sin verificacion.
- Trazabilidad parcial: se conoce el SHA del repositorio de entrenamiento y las revisiones del modelo base y del dataset, lo que facilita la reproduccion, pero no se publica el codigo del pipeline en este repositorio.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por terceros.
- Uso en produccion no recomendado sin evaluacion previa: el artefacto es de investigacion y carece de la documentacion minima de seguridad y licencia que requiere un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-08-qwen36-0-da-qwen-resp-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-08-da-qwen-resp-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de entrenamiento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (revision b47e1adc33463b9a956c97dd17cfde2db1fc0c13)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
