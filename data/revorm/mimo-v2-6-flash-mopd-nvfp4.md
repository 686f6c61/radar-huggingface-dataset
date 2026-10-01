# revorm/MiMo-V2.6-Flash-MOPD-NVFP4

## Resumen

MiMo-V2.6-Flash-MOPD-NVFP4 es una versión cuantizada del checkpoint XiaomiMiMo/MiMo-V2.6-Flash-MOPD, publicada por el usuario revorm. No se trata de un modelo entrenado desde cero, sino de una transcodificación sin pérdida (lossless MXFP4 → NVFP4) del checkpoint oficial revisión 2479e2d0029eca9a34cc7e7f55a121925f81908e: los pesos desnormalizados de los expertos son idénticos bit a bit a los del modelo original. El objetivo es ofrecer el mismo modelo en un formato NVFP4 compatible con el backend de inferencia de vLLM, sin recalibración ni recuantización adicional.

El modelo base pertenece a la serie MiMo-V2.6 de Xiaomi, que incluye dos modelos nativamente omnimodales (texto, visión, audio y vídeo): MiMo-V2.6-Pro y MiMo-V2.6-Flash, este último orientado al equilibrio entre inteligencia, eficiencia y coste. El repositorio declara 159.358.725.504 parámetros totales y un tamaño de 187,2 GB, con licencia MIT heredada del modelo base y etiquetas de multimodalidad, agentes y contexto largo.

La relevancia de esta ficha es práctica: es un artefacto de despliegue, no un modelo nuevo. Interesa a quien necesite servir el modelo con vLLM en formato NVFP4 manteniendo la fidelidad numérica del checkpoint oficial, con las precauciones documentadas por el autor sobre parámetros de inferencia, backends de MoE y compatibilidad entre versiones de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (omnimodal: texto, vision, audio y video); incluye capas MTP, codificadores de vision y audio y un modelo borrador DFlash |
| Parametros totales | 159.358.725.504 (~159,36 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base declara contexto largo; se verifico recuperacion de aguja a 16K, 40K y 114K tokens) |
| Tipos de cuantizacion | ModelOpt MIXED_PRECISION: expertos en NVFP4 (group size 16) y demas capas lineales en FP8_BLOCK_SCALES; tensores restantes en BF16. El checkpoint base se distribuye en MXFP4/FP8 |
| Idiomas soportados | no disponible en este repositorio; el modelo base declara ingles y chino |
| Licencia | MIT |
| Formato de pesos | safetensors (library transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con expertos enrutados. En este repositorio, los pesos de los expertos (model.layers.*.mlp.experts.*.{gate,up,down}_proj) se copian bit a bit en FP4 (formato E2M1). Cada escala de bloque E8M0 de 32 elementos se transforma en dos escalas E4M3 de 16 elementos con valor 2^(e − 127 − k), y se aplica un weight_scale_2 por tensor igual a 2^k, donde k = max block exponent − 8. Las proyecciones gate_proj y up_proj de un mismo experto comparten k porque se fusionan en una única matriz w13 en tiempo de carga. El input_scale es 1.0. Todo lo demas (capas lineales con escalas de bloque FP8, tensores BF16, capas MTP, codificadores de vision y audio, modelo borrador DFlash, tokenizador y plantilla de chat) es byte a byte identico al checkpoint oficial.

No hubo entrenamiento, ajuste fino ni RLHF/DPO en este repositorio: es una transcode de precision. La configuracion de cuantizacion corresponde al esquema ModelOpt MIXED_PRECISION, con expertos en NVFP4 y group size 16, y el resto de capas lineales en FP8_BLOCK_SCALES. Como innovacion tecnica destacable del artefacto, la presencia del modelo borrador DFlash apunta a decodificacion especulativa, y la fidelidad de la transcode se valida comparando 200 tensores muestreados aleatoriamente contra una transcode independiente (AxionML/MiMo-V2.6-Flash-MOPD-NVFP4) y verificando que el layout de 145.273 tensores coincide con tiyuvta/MiMo-V2.6-Flash-RL-NVFP4. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion del modelo base.

## Capacidades

- Generacion de texto y conversacion multiturno (pipeline declarado: text-generation).
- Modalidad omnimodal en el modelo base: vision, lenguaje-vision, audio y comprension de video.
- Razonamiento de varios pasos y soporte de contexto largo.
- Tool calling / function calling: verificado con 5 de 5 comprobaciones (herramienta unica, 8 herramientas, streaming, resultado de herramienta y dos llamadas por turno).
- Soporte de agentes: el modelo base esta etiquetado como agent.
- Capacidades multilingues: el modelo base declara ingles y chino.
- Recuperacion de informacion en contexto largo: recuperacion de aguja verificada a 16K, 40K y 114K tokens.
- Razonamiento matematico basico: 98/100 en las primeras 100 preguntas de GSM8K con temperatura 0.
- Decodificacion especulativa mediante el modelo borrador DFlash incluido en el repositorio.

## Casos de uso

- Agentes con tool calling en produccion: el modelo permite encadenar llamadas a funciones con streaming y multiples herramientas por turno, apto para orquestadores que necesiten ejecutar acciones externas dentro de un mismo dialogo.
- Asistente multimodal para analisis de documentos e imagenes: el codificador de vision del modelo base permite extraer informacion de capturas, diagramas o documentos escaneados y responder en lenguaje natural.
- Comprension de video: la etiqueta video-understanding del modelo base habilita resumenes, busqueda de eventos o descripcion de secuencias a partir de contenido audiovisual.
- Procesamiento de audio y dialogos por voz: el codificador de audio permite integrar el modelo en asistentes conversacionales hablados sin un pipeline separado de transcripcion.
- RAG sobre corpus extensos: con recuperacion de aguja verificada hasta 114K tokens, es viable alimentar el modelo con documentacion tecnica larga y hacer preguntas sobre detalles concretos.
- Generacion de codigo y front-end: la serie MiMo-V2.6 declara capacidades reforzadas en paginas web front-end, bocetos de Figma, presentaciones y SVG, lo que permite integrarlo en flujos de generacion de interfaz.
- Atencion al cliente multilingue (ingles y chino): conversaciones multi-turno con contexto largo y posible invocacion de herramientas de back-office (consulta de pedidos, estado de cuenta).
- Despliegue autoalojado en cluster: al ser un checkpoint NVFP4 con licencia MIT, permite servir el modelo en infraestructura propia con vLLM, manteniendo la fidelidad numerica del checkpoint oficial.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| GSM8K | 98/100 | primeros 100 ejemplos, temperature 0 |
| Tool calling | 5/5 | herramienta unica, 8 herramientas, streaming, resultado de herramienta, dos llamadas por turno |
| Recuperacion de aguja | superada | 16K, 40K y 114K tokens |
| Comprobacion aritmetica | 17 x 23 = 391 | servido con vLLM, tensor parallel 4 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos (MMLU, HumanEval, etc.) para este checkpoint cuantizado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 187,2 GB, por lo que la inferencia requiere un entorno multi-GPU. Los pesos en NVFP4/FP8 convierten ese tamano en una referencia cercana al minimo de memoria util, a la que hay que sumar cache KV y activaciones.
- GPU recomendadas: el autor lo sirvio con vLLM en tensor parallel 4, lo que encaja con 4 x H100 80 GB o 4 x A100 80 GB. Configuraciones con GPUs de 80 GB y NVLink son las mas adecuadas.
- GPU de consumo: no es viable ejecutar el modelo completo en GPUs de consumo (RTX 4090, 24 GB); se necesitarian al menos 3-4 aceleradores profesionales de 80 GB.
- Opciones de despliegue: vLLM con --trust-remote-code --reasoning-parser mimo --tool-call-parser mimo --enable-auto-tool-choice y --generation-config vllm. Algunas versiones de vLLM enrutan las capas FP8_BLOCK_SCALES al metodo no cuantizado o fallan con KeyError en qkv_proj.weight_scale_inv; esas capas necesitan el metodo block-FP8 linear. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Backend de MoE: comprobar la linea de log "Using '...' NvFp4 MoE backend". FLASHINFER_CUTLASS ejecuta FP4 nativo; MARLIN es un fallback W4A16 (vLLM 0.30.x lo selecciona cuando se activa --enable-lora).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| revorm/MiMo-V2.6-Flash-MOPD-NVFP4 | 159,36 B | no disponible | NVFP4 + FP8_BLOCK_SCALES | MIT | Transcode sin perdida del checkpoint MOPD |
| AxionML/MiMo-V2.6-Flash-MOPD-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Transcode independiente; 200 tensores identicos byte a byte |
| tiyuvta/MiMo-V2.6-Flash-RL-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Transcode del checkpoint RL; layout de tensores identico |
| ProCreations/MiMo-V2.6-Flash-MOPD-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Tercera transcode del mismo checkpoint |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD | 159,36 B (segun este repositorio) | no disponible | MXFP4/FP8 | MIT | Modelo base oficial |
| XiaomiMiMo/MiMo-V2.6-Pro | no disponible | no disponible | no disponible | no disponible | Modelo mas capaz de la serie MiMo-V2.6 |

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo nuevo: hereda todas las limitaciones del checkpoint base XiaomiMiMo/MiMo-V2.6-Flash-MOPD.
- Requiere --trust-remote-code y library custom_code; no es un checkpoint estandar de transformers sin codigo personalizado.
- El generation_config.json incluido fija max_new_tokens en 2048, lo que trunca respuestas largas de razonamiento; se recomienda --generation-config vllm.
- Algunas versiones de vLLM enrutan mal las capas FP8_BLOCK_SCALES de checkpoints de precision mixta o fallan con KeyError; es necesario validar la version y el backend antes de produccion.
- El fallback MARLIN (W4A16) cambia el comportamiento numerico respecto al FP4 nativo (FLASHINFER_CUTLASS); conviene fijar el backend explicitamente.
- Con el borrador DFlash activado, vLLM rechaza min_p y logit_bias.
- Muestreo recomendado por el autor: temperature=1.0, top_p=0.95.
- Riesgo de alucinacion: no se documentan tasas de error fuera de las pruebas citadas (GSM8K parcial y recuperacion de aguja).
- Idiomas: el modelo base declara ingles y chino; no hay informacion sobre calidad en otros idiomas, incluido el espanol.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero conviene verificar las condiciones del checkpoint original de Xiaomi antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre este artefacto concreto.
- No se publican datos de sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/revorm/MiMo-V2.6-Flash-MOPD-NVFP4
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Transcode independiente: https://huggingface.co/AxionML/MiMo-V2.6-Flash-MOPD-NVFP4
- Transcode del checkpoint RL: https://huggingface.co/tiyuvta/MiMo-V2.6-Flash-RL-NVFP4
- Tercera transcode NVFP4: https://huggingface.co/ProCreations/MiMo-V2.6-Flash-MOPD-NVFP4
- Pagina oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Pagina oficial de MiMo-V2.6-Flash: https://mimo.mi.com/models/en-US/mimo-v2.6-flash
- Nota de lanzamiento de la serie MiMo-V2.6: https://mimo.mi.com/docs/en-US/news/latest/v2-6
