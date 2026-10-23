# open-athena/Snowflake-d768-Datakit-SFT-262K-2026.10.22

## Resumen

Snowflake-d768-Datakit-SFT-262K-2026.10.22 es un modelo de lenguaje de tipo mixture-of-experts desarrollado por open-athena dentro del ecosistema de entrenamiento Marin. Se trata de un «Snowflake», la variante de menor tamano de la familia Grug/Snowball, a la que se aplica la receta Snowball 2026.10.05 sobre un checkpoint base mas pequeno. El resultado es un modelo de 2.039.270.912 parametros totales, 8 capas, hidden size 768 y 256 expertos enrutados con top-4 mas un experto compartido, afinado con SFT sobre un contexto configurado de 262.144 tokens.

El interes practico del modelo esta en su relacion entre capacidad y coste: al ser un MoE de 2B con atencion de ventana deslizante de 2.048 tokens en la mayoria de capas y solo una cabeza KV (MQA), el coste de cache KV es muy bajo, lo que permite plantear contextos largos en hardware modesto. La model card lo describe explicitamente como un artefacto de investigacion no evaluado, por lo que su valor actual es el de una pieza reproducible de la escalera de postentrenamiento de Marin mas que el de un modelo listo para produccion.

La relevancia inmediata es doble: por un lado publica la receta completa (mezcla de datos, schedule, learning rates, hashes de fuentes y checkpoint nativo en GCS); por otro, sirve como referencia para estudiar el efecto del midtraining con Datakit y de la extension de contexto de 64K a 262K en modelos pequenos. No se han publicado resultados de benchmarks ni validacion empirica del contexto configurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GrugMoeForCausalLM` (`grug_moe`), transformer MoE con atencion hibrida |
| Parametros totales | 2.039.270.912 |
| Parametros activos | no disponible (256 expertos enrutados con top-4 mas un experto compartido; el numero de parametros activos no se publica) |
| Longitud de contexto | 262.144 tokens configurados (no validado con pruebas de generacion en contexto largo) |
| Ventana deslizante | 2.048 tokens |
| Capas / hidden size | 8 / 768 |
| Cabeceras de atencion / KV | 6 / 1 |
| Tamano intermedio de experto / experto compartido | 384 / 768 |
| Tamano de vocabulario | 128.256 |
| Multiplicador QK | 1,75 |
| Tipos de cuantizacion | no disponible; el unico formato publicado es BF16. No hay variantes GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | no disponible (la model card y los metadatos no declaran lista de idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16) |
| Paso final del checkpoint | 303.574 |
| Actualizaciones de SFT / paso inicial | 9.348 / 294.226 |
| Hardware de entrenamiento | TPU v4-32 en us-central2-b |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con mezcla de expertos: 8 capas, hidden size 768, 6 cabeceras de atencion con una unica cabecera KV (multi-query attention), 256 expertos enrutados con enrutamiento top-4 y un experto compartido adicional, con tamano intermedio de 384 por experto y 768 para el compartido. La atencion es hibrida: cada cuarta capa y la ultima usan atencion causal completa, mientras que el resto emplea una ventana deslizante de 2.048 tokens. Las capas de atencion larga omiten rotary position embeddings y los offsets parciales de clave, siguiendo la familia de checkpoints de origen.

El entrenamiento parte de un checkpoint de la familia Snowball y aplica tres etapas: extension de contexto a 64K con datos Datakit fase 2 (29.521 actualizaciones, 30.955.012.096 posiciones programadas, LR base pico 0,000486977553), extension a 262K con datos de contexto largo que repiten ocho veces los documentos de mas de 64K por cada copia del store de documentos cortos dentro de cada cubo de dominio/calidad (1.968 actualizaciones, 2.063.597.568 posiciones, LR pico 0,00015640155) y SFT (9.348 actualizaciones, 9.802.088.448 posiciones, LR pico 2,96215057e-05 con decaimiento al 10% durante el ultimo 10% de las actualizaciones). El presupuesto de preentrenamiento programado para la escalera es de 275.499.712.512 posiciones; cada actualizacion programa 1.048.576 posiciones, y los recuentos incluyen padding de secuencias empaquetadas, por lo que no equivalen a tokens de texto distintos.

El SFT se compone de un 79,6543% de datos supervisados (7.807.782.617 posiciones) y un 20,3457% de replay de preentrenamiento (1.994.305.831 posiciones), con 216 fuentes supervisadas. El peso dominante es `nemotron_sft_v3` (64,2349%), seguido de `open_swe_traces` (10,8340%), `agenttrove` (1,6438%), `openthoughts4-code-glm-5.2-n4` (1,3809%) y `penfever-traces` (1,3556%); el resto de familias queda por debajo del 0,11%. El estado completo del optimizador se reanuda entre etapas y el SFT arranca sin warmup nuevo. Durante el SFT los pesos del router siguen entrenables, pero los sesgos del router y sus actualizaciones diferidas de balanceo quedan congelados; la actualizacion pendiente se aplica al exportar el checkpoint final. Las filas de siete tokens especiales en los embeddings de entrada y en la LM head se multiplican por raiz de 32, y siete filas de la LM head se inicializan desde anclas de un solo token (`role`, `message`, `think`, `answer`, `tool`, `end` y EOS); solo se reinician los momentos del optimizador de esas filas. No se anaden tokens nuevos y BOS/EOS se preservan.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantillas de chat fijadas a la release 10.05 del proyecto.
- Razonamiento explicito mediante modo thinking: el tokenizer incluye tokens dedicados `think` (128002) y `answer` (128003), y la plantilla expone el parametro `enable_thinking` (la model card esta truncada justo en la descripcion de su valor por defecto).
- Tool calling y function calling: hay tokens dedicados `tool` (128005) y `end` (128011), y el SFT incluye fuentes especificas de uso de herramientas y de trazas de agente.
- Comportamiento agentico y razonamiento multi-paso, entrenado con trazas de `agenttrove`, `open_swe_traces` y conversaciones de uso de herramientas cientificas.
- Generacion y edicion de codigo, con foco en tareas de ingenieria de software: `open_swe_traces` aporta el 10,83% del SFT y `openthoughts4-code-glm-5.2-n4` otro 1,38%, ademas de rollouts de `kernelgym`.
- Contexto largo configurado de 262.144 tokens para lectura de documentos extensos, codigo de repositorios o historiales largos, aunque sin validacion publicada.
- Capacidades multilingues: no declaradas; no hay lista de idiomas ni evaluacion por idioma en la informacion disponible.
- Vision, audio y otras modalidades: no disponibles; el pipeline es exclusivamente `text-generation`.

## Casos de uso

- Agentes de ingenieria de software: el modelo puede recibir un issue, explorar trazas de herramientas y emitir parches, apoyandose en el 10,83% de `open_swe_traces` y en los tokens de `tool`/`end`. Es adecuado porque el SFT esta sesgado hacia trazas reales de SWE y no solo hacia codigo aislado.
- Asistentes con tool calling en produccion interna: integracion en un orquestador que exponga funciones como busqueda, calculo o consulta a bases de datos, usando el formato de tokens especiales de la release 10.05. Requiere validar el formato exacto de la plantilla antes de desplegar, ya que la model card esta cortada.
- Analisis de documentos largos: resumen y extraccion de entidades sobre contratos, informes o expedientes de hasta 262.144 tokens configurados. El bajo coste de cache KV (una sola cabeza KV y ventana deslizante en la mayoria de capas) lo hace viable en una GPU unica, pero la ventana de 262K no ha sido validada por el autor.
- Razonamiento con presupuesto controlado: activar o desactivar `enable_thinking` segun la tarea permite usar el modelo en modo directo para clasificacion y extraccion, y en modo thinking para problemas de varios pasos.
- Prototipado e investigacion de recetas de postentrenamiento: al publicarse `training_schedule.json`, `training_data_mix.json` y `pretraining_replay_mix.json`, el modelo sirve como banco de pruebas reproducible para estudiar midtraining con Datakit, extension de contexto y mezclas de SFT en un presupuesto de 2B parametros.
- Despliegue en hardware de gama media: con 4,1 GB en BF16 y un cache KV estimado en torno a 0,26 GiB por secuencia a 262K (calculo propio a partir de la configuracion), cabe en GPUs de 8-12 GB en cuantizacion de 8 o 4 bits, lo que permite entornos de desarrollo locales o edge.
- Generacion de datos sinteticos y destilacion: util como generador barato en pipelines que necesiten muchas muestras con formato conversacional y de herramientas, siempre que se filtre la calidad aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y advierte explicitamente de que el modelo no ha sido probado ni evaluado adecuadamente. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 4,1 GB (coincide con el tamano del repositorio). Es la unica precision publicada.
- Cuantizaciones estimadas (calculo propio, no publicadas por el autor): en torno a 2,2 GB en 8 bits y 1,2 GB en 4 bits, sin contar overhead de runtime.
- Cache KV estimado a 262.144 tokens (calculo propio a partir de 6 cabeceras KV de 1 cabeza y head dim 128): unos 256 MiB para las dos capas de atencion completa y unos 6 MiB para las seis capas con ventana de 2.048, es decir, del orden de 0,26 GiB por secuencia en FP16. Las implementaciones que reservan para la longitud maxima pueden consumir mas.
- GPU recomendadas: cualquier GPU con 8 GB o mas para BF16 con contextos moderados; A100/H100 no son necesarias por tamano, pero si se busca throughput alto conviene hardware con buen ancho de banda. Para el contexto completo de 262K es preferible una GPU de 24 GB o mas (RTX 4090, L40S, A100 40GB) por margen de activaciones.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en tarjetas de 8-12 GB.
- Opciones de despliegue: `transformers` con implementacion propia de `GrugMoeForCausalLM` (la arquitectura no es estandar, hay que comprobar soporte en la version instalada). vLLM, TGI, llama.cpp y Ollama no tienen soporte confirmado para esta arquitectura en la informacion disponible; para llama.cpp/Ollama haria falta ademas una conversion a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Snowflake-d768-Datakit-SFT-262K-2026.10.22 | 2.039.270.912 | 262.144 configurados (sin validar) | openmdw-1.1 | Pesos BF16 en HuggingFace, receta y schedule publicados | Objeto de esta ficha |
| Snowflake-d512-Datakit-SFT-262K-2026.10.22 | no disponible (variante de anchura 512 de la misma familia) | 262.144 configurados | no disponible | Pesos en HuggingFace | Misma receta, menor anchura; permite comparar el efecto de la anchura |
| Grug-67B-A2B-Datakit-SFT-262K-2026.10.05 | 67B segun el nombre (activos ~2B inferidos de «A2B», no confirmado) | 262K segun el nombre de la release | no disponible | Pesos en HuggingFace | Modelo de referencia cuya receta Snowball se aplica a esta escalera |

No se dispone de datos de rendimiento para ninguno de los tres, por lo que la comparativa se limita a tamano, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card indica que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; el uso en produccion es responsabilidad de quien lo despliega.
- Contexto no validado: los 262.144 tokens son una configuracion, no una capacidad verificada. No hay pruebas de generacion en contexto largo publicadas.
- Riesgo de alucinacion: sin evaluaciones ni calibracion publicadas, y con un 20,35% del SFT compuesto por replay de preentrenamiento, el comportamiento fuera de distribucion es incierto.
- Sesgos: la mezcla de SFT esta dominada por `nemotron_sft_v3` (64,23%) y varias fuentes son sinteticas o derivadas de modelos GLM (`openthoughts4-code-glm-5.2-n4`, `glm-5.2-kernelgym-rollouts`, `wildchat-glm53-format-completions`), por lo que puede heredar sesgos y estilo de esos generadores. No hay evaluacion de sesgo disponible.
- Idiomas: no se declara soporte multilingue ni se evalua por idioma; el rendimiento fuera del ingles es desconocido.
- Formato de chat: la model card esta truncada en la seccion de ajustes de generacion, justo en el parametro `enable_thinking`. Hay que verificar la plantilla exacta en el tokenizer del repositorio antes de integrar.
- Licencia openmdw-1.1: los terminos concretos no se detallan en la informacion disponible; es imprescindible revisar el texto de la licencia antes de un uso comercial.
- Soporte de tooling limitado: no hay GGUF, no hay cuantizaciones publicadas y el soporte de la arquitectura `grug_moe` en vLLM, TGI o llama.cpp no esta confirmado.
- Sin mantenimiento demostrado: 0 descargas y 0 likes en el momento de la consulta, y un unico checkpoint publicado; no hay historial de correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowflake-d768-Datakit-SFT-262K-2026.10.22
- Modelo hermano Snowflake-d512: https://huggingface.co/open-athena/Snowflake-d512-Datakit-SFT-262K-2026.10.22
- Receta Snowball de referencia (Grug-67B-A2B-Datakit-SFT-262K-2026.10.05): https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.10.05
- Metricas de SFT en Weights & Biases: https://wandb.ai/marin-community/snowball-ladder-lce-sft/runs/users-held-snowball-overtrained-d768-sft-2026.10.19.2
- Commit base de la libreria de entrenamiento Marin: https://github.com/marin-community/marin/commit/ce7c77abcb0ada792cd6d76ba3d80db74c33a859
- Ficheros de receta en el repositorio: `training_data_mix.json`, `pretraining_replay_mix.json`, `training_schedule.json`, `training_recipe_sources.tar.gz`
- Checkpoint nativo final: `gs://marin-us-central2/users/held/snowball-overtrained/d768/sft/2026.10.19.2/checkpoints/step-303574`
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
