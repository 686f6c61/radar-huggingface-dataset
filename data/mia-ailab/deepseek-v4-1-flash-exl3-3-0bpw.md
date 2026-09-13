# Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw

## Resumen

DeepSeek-V4.1-Flash-EXL3-3.0bpw es una cuantizacion EXL3 del checkpoint multimodal deepseek-ai/DeepSeek-V4.1-Flash, publicada por Mia's AI Lab. No es un modelo nuevo: es una conversion de pesos orientada a servir el modelo base (un MoE multimodal de 552B con 8B/16B de parametros activados por token) con un coste de memoria muy inferior al del checkpoint FP8 original, a un regimen medio de 3,02 bits por peso en el decodificador. La conversion se hizo con exllamav3 v1.4.2 y codebook `mul1`, e incluye la torre de vision y el modulo DSpark dentro del propio checkpoint.

Su relevancia practica esta en el eje memoria/calidad: reduce el decodificador a unos 205 GB en 41 shards de safetensors, mantiene el contexto de hasta 1M tokens del modelo base y conserva la cache KV nativa FP4 de V4.1 (~890 B/token). A cambio, introduce dos dependencias criticas: no es un reemplazo directo del checkpoint FP8 (las tablas Engram no estan en este repo) y solo es cargable en stacks con soporte EXL3 (vLLM con `--quantization exl3`, ExLlamaV3/TabbyAPI), no en cargadores estandar de Transformers ni en formato GGUF.

El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto recien publicado y sin validacion independiente. La licencia es MIT, heredada del modelo base, y la cuantizacion no anade restricciones adicionales segun el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal transformer (base DeepSeek-V4.1-Flash) con CED, CSA2, memoria Engram y DSpark en checkpoint; cuantizacion EXL3 (trellis, codebook `mul1`) |
| Parametros totales | 109.545.079.634 segun los safetensors de este repo; el backbone del modelo base declara 552B (la cifra del repo no incluye las tablas Engram ni, previsiblemente, otros componentes del base) |
| Parametros activos | 8B/16B activados por token en prefill/decode (dato del modelo base) |
| Longitud de contexto | Hasta 1M tokens (heredado del modelo base) |
| Tipos de cuantizacion | EXL3 v1.4.2: 3,02 bpw medios en decodificador (`--hq`), 6 bits en cabeza (`head bits`), 4 bits en MTP/DSpark, expertos enrutados mayoritariamente K=3, atencion/shared/Engram `wkv` tipicamente 4-6 bits, `out_scales=always`. Cache KV nativa V4.1 FP4 (~890 B/token). No hay GGUF |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada de deepseek-ai/DeepSeek-V4.1-Flash) |
| Formato de pesos | safetensors EXL3 (41 shards, ~205 GB; el repo ocupa 219,3 GB). Requiere ademas los shards 47 y 48 del modelo base, ~95 GiB cada uno, en FP8 sin cuantizar |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 552B de parametros en el backbone y 8B/16B activados por token segun la fase (prefill o decode). La model card cita varios componentes propios: CED, CSA2, memoria Engram y decodificacion especulativa DSpark integrada en el checkpoint (`dspark_block_size=5`, 128 expertos draft con top-3, en las capas 37-39). La informacion disponible no detalla que son CED ni CSA2, ni la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo RLHF/DPO; esos datos se remiten al informe tecnico del modelo base, que no forma parte del material proporcionado.

La innovacion de este artefacto es la propia cuantizacion. El decodificador se convirtio a EXL3 con codebook `mul1` y `out_scales=always`, calibrado con 250 filas x 2048 columnas y una traza de carga de trabajo (`cal_trace_dsv41_flash_workload.json`). Los tensores MTP se cuantizaron a 4 bits y los expertos enrutados quedan mayoritariamente en K=3, mientras que atencion, capas shared y los lineales `wkv` de Engram se mantienen mas altos (4-6 bits). Las tablas de filas FP8 de Engram no se cuantizaron: siguen en el arbol original del modelo base y deben referenciarse en tiempo de ejecucion mediante `engram_table_dir`, que en este repo se entrega deliberadamente como `null`.

## Capacidades

- Generacion de texto conversacional y multimodal: el pipeline declarado es `image-text-to-text` y la torre de vision se incluye sin cuantizar en su forma nativa.
- Razonamiento explicito en modo thinking, activado por defecto; se puede desactivar por peticion con el kwarg de plantilla de chat `enable_thinking=false`.
- Tool calling / function calling en vLLM, mediante los parsers de tokenizer, tool y reasoning de DeepSeek V4.1.
- Decodificacion especulativa nativa con DSpark, configurable en vLLM con `--speculative-config '{"method":"dspark","num_speculative_tokens":3}'`.
- Contexto largo de hasta 1M tokens, con cache KV nativa en FP4.
- Memoria Engram del modelo base, sujeta a que se aporten los shards 47 y 48 del checkpoint original.
- Capacidades multilingues: no disponible (no se declaran idiomas en la informacion proporcionada).
- No se documentan capacidades de audio ni de generacion de imagen.

## Casos de uso

- Asistente sobre documentacion tecnica extensa: con hasta 1M tokens de contexto se puede indexar un repositorio completo o un conjunto de manuales junto con diagramas e imagenes, y responder preguntas cruzando codigo y capturas, algo viable gracias a la torre de vision incluida.
- Atencion al cliente multi-turno con historial largo: la ventana de 1M tokens permite arrastrar conversaciones y expedientes completos sin resumir, manteniendo coherencia entre turnos.
- Procesamiento de documentos escaneados: al ser `image-text-to-text`, puede extraer y razonar sobre facturas, informes o formularios en imagen y combinar esa informacion con texto estructurado en el mismo prompt.
- Auditoria y generacion de codigo asistida por herramientas: el soporte de tool calling en vLLM permite integrarlo en pipelines donde el modelo consulta linters, repositorios o APIs internas antes de proponer un parche.
- Despliegue on-premise con requisitos de soberania de datos: la licencia MIT y el formato EXL3 permiten servir el modelo en un nodo multi-GPU propio, sin dependencia de APIs externas, siempre que se acepte el coste de infraestructura.
- Canalizaciones agenticas con razonamiento multi-paso: combinando el modo thinking con los parsers de tool y reasoning de vLLM, se pueden construir bucles de planificacion y ejecucion sobre herramientas internas (RAG, bases de datos, ticketing).
- Inferencia a coste por token reducido mediante DSpark: activar decodificacion especulativa con 3 tokens draft por paso es la via documentada para amortiguar el coste de servir un MoE de este tamano.
- Investigacion en cuantizacion: el comando de conversion esta publicado, de modo que el checkpoint sirve como caso de estudio reproducible de EXL3 a 3 bpw sobre un MoE multimodal con capas de memoria Engram.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizado no incluye evaluaciones propias y remite explicitamente a las del modelo base, advirtiendo que esas puntuaciones corresponden al modelo sin cuantizar y no a este build EXL3. No se han reproducido cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- Pesos EXL3: ~205 GB en 41 shards de safetensors (el repo completo ocupa 219,3 GB).
- Dependencia obligatoria: los shards 47 y 48 del modelo base, ~95 GiB cada uno (~190 GiB en total), que permanecen en FP8 sin cuantizar. Sin ellos el checkpoint no es funcional.
- Total de pesos a cargar: del orden de 395-400 GiB sumando decodificador y tablas Engram, cifra orientativa que condiciona cualquier calculo de VRAM.
- VRAM estimada: un minimo teorico de ~205 GB solo para el decodificador cuantizado; con las tablas Engram, alrededor de 400 GB. Estimacion propia a partir de los tamanos publicados, no confirmada por el autor.
- GPU recomendadas: nodos multi-GPU con aceleradores de 80 GB (H100, A100 80 GB o equivalentes). De forma orientativa, seis unidades de 80 GB cubririan los ~400 GB de pesos antes de contar cache KV y activaciones.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar este checkpoint, ni siquiera el decodificador cuantizado por si solo.
- Cache KV: nativa FP4 de V4.1, ~890 B/token segun la model card. A 1M tokens el consumo depende del stack y del numero de secuencias concurrentes; no se publican cifras agregadas. No se debe forzar un dtype FP8 de KV proveniente de otras recetas.
- Opciones de despliegue: vLLM con `--quantization exl3` y `--hf-overrides '{"engram_table_dir":"/path/to/DeepSeek-V4.1-Flash"}'`, y ExLlamaV3 / TabbyAPI cuando la arquitectura este soportada en la build utilizada. No aplica llama.cpp, Ollama ni otros runners GGUF.
- Latencia y throughput: no disponibles.
- Almacenamiento: ~220 GB para el checkpoint cuantizado mas ~190 GiB para los dos shards del modelo base; el autor sugiere hardlink o copia solo de esos dos shards.
- Parametros de muestreo oficiales del modelo base: `temperature` 1.0 y `top_p` 0.95 sobre contextos de hasta 1M tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (EXL3 3.0bpw) | 109.545.079.634 en safetensors del repo; backbone base de 552B con 8B/16B activados | Hasta 1M tokens | safetensors EXL3, ~205 GB, 41 shards | MIT | Requiere los shards 47-48 del modelo base (~190 GiB); solo stacks con soporte EXL3 |
| deepseek-ai/DeepSeek-V4.1-Flash | 552B en el backbone, 8B/16B activados por token | Hasta 1M tokens | FP8 en safetensors (48 shards) | MIT | Checkpoint oficial completo; tamano total no disponible en la informacion proporcionada |
| Otras cuantizaciones de DeepSeek-V4.1-Flash (GGUF, AWQ, GPTQ y similares) | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la informacion proporcionada |

No se dispone de datos para comparar con alternativas de otros fabricantes de tamano o tarea equivalente dentro del material aportado.

## Limitaciones y advertencias

- No es un reemplazo directo del checkpoint FP8: las tablas de embedding Engram no estan en este repo y deben aportarse desde el arbol original. `engram_table_dir` se entrega como `null` a proposito para evitar rutas locales en `config.json`.
- Dependencia de dos shards concretos (`model-00047-of-00048.safetensors` y `model-00048-of-00048.safetensors`, ~95 GiB cada uno): sin ellos el modelo no arranca, y eso rompe cualquier supuesto de despliegue "solo con el repo cuantizado".
- La degradacion por cuantizacion a 3,02 bpw no esta medida ni publicada. Las evaluaciones de la model card base corresponden al modelo sin cuantizar, no a este build.
- Riesgo de alucinacion inherente a un modelo generativo de este tipo; no hay cuantificacion del fenomeno en la informacion disponible.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni los procesos de alineacion, por lo que no se puede evaluar su comportamiento en dominios sensibles.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue ni calidad homogenea fuera del ingles.
- El modo thinking esta activado por defecto, lo que incrementa el numero de tokens generados y el coste por peticion. Hay que desactivarlo explicitamente (`enable_thinking=false`) cuando no se necesite razonamiento.
- No forzar un dtype de cache KV distinto del FP4 nativo de V4.1; recetas de KV en FP8 de otros modelos pueden degradar o romper la inferencia.
- Compatibilidad de runtime muy restringida: EXL3 v1.4.2 y vLLM con soporte EXL3 y DeepSeek-V4.1. La carga con Transformers estandar no esta soportada, y no existe version GGUF para llama.cpp u Ollama.
- Contexto de 1M tokens: el coste de memoria de la cache KV y el rendimiento efectivo a esa longitud no se detallan para este build.
- Licencia MIT heredada, sin restricciones adicionales por la cuantizacion segun el autor; conviene verificar igualmente los terminos del modelo base y de cualquier componente de terceros antes de un uso comercial.
- Artefacto sin adopcion (0 descargas, 0 likes) y recien publicado (2026-09-12), sin validacion independiente de calidad, estabilidad o equivalencia funcional frente al checkpoint original.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe tecnico del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Herramienta de conversion exllamav3: https://github.com/turboderp-org/exllamav3
- Perfil del autor de la cuantizacion: https://huggingface.co/Mia-AiLab
- Busqueda web: no se han encontrado resultados relevantes; las fuentes devueltas corresponden a paginas sin relacion con el modelo (servicios de citas medicas, articulos sobre la artista M.I.A. y significados del nombre propio).
