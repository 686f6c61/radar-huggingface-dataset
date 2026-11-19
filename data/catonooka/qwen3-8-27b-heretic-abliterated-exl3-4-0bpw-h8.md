# catonooka/Qwen3.8-27B-Heretic-Abliterated-EXL3-4.0bpw-h8

## Resumen

Qwen3.8-27B-Heretic-Abliterated-EXL3-4.0bpw-h8 es una cuantizacion EXL3 de 4.0 bits por peso (con head_bits 8 y embed_bits 16) del modelo comunitario catonooka/Qwen3.8-27B-Heretic-Abliterated, a su vez derivado del base Qwen/Qwen3.8-27B mediante tecnicas de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones). El autor de la cuantizacion y del modelo intermedio es el usuario de Hugging Face catonooka, y el paquete esta pensado para inferencia con la libreria exllamav3 sobre GPUs consumer.

El interes practico de esta ficha es doble: por un lado, demuestra un flujo de cuantizacion EXL3 reproducible (receta concreta de calibracion, bits por modulo y tiempo de reloj medido en 4x RTX 3090); por otro, documenta el impacto de la abliteration sobre la decodificacion especulativa, con tasas de aceptacion del drafter que no solo no se degradan sino que mejoran respecto al pack del modelo stock. El pack incluye la cabeza MTP cuantizada a 4 bits para decodificacion especulativa, pero elimina la torre de vision (vision_bits 0).

Un dato importante: aunque el nombre comercial indica "27B", los pesos safetensors del repositorio suman 8.413.517.184 parametros (8,4 mil millones), no 27 mil millones. Esta discrepancia entre el nombre y el recuento real de parametros debe tenerse en cuenta al planificar hardware y al comparar con otros modelos. El repositorio ocupa 16,8 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye cabeza MTP para decodificacion especulativa |
| Parametros totales | 8.413.517.184 (segun safetensors); el nombre del modelo indica 27B |
| Parametros activos | no disponible (no se documenta configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw, head_bits 8, embed_bits 16, mtp_bits 4, codebook mul1; vision_bits 0 (torre de vision eliminada) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community (license: other, license_name: qwen-community, con archivo LICENSE en el repo) |
| Formato de pesos | safetensors en layout EXL3 (exllamav3), con tokenizer y quantization_config incluidos |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 (tag `qwen3_5` en el repositorio), sobre el que se aplico abliteration para eliminar el comportamiento de rechazo. La model card remite a la ficha de catonooka/Qwen3.8-27B-Heretic-Abliterated para el metodo de abliteration, los parametros de prueba y las evaluaciones; esta ficha no reproduce esos detalles porque no se incluyen en la informacion disponible.

La innovacion tecnica documentada esta en la cuantizacion: convertidor exllamav3 con bits 4.0, head_bits 8, embed_bits 16, codebook mul1 y mtp_bits 4 (cabeza MTP cuantizada dentro del pack para decodificacion especulativa). La calibracion uso 250 filas x 2048 columnas, hessians_reg 0.025 y shard 8192, procesando 672 modulos en 42 minutos sobre 4x RTX 3090. La torre de vision se elimina en este pack (vision_bits 0); para vision hay que usar el repositorio en bf16. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento con niveles de pensamiento configurables via kwargs de la plantilla de chat: `reasoning_effort: xhigh|medium|low` y `enable_thinking: false`. Medido con el mismo prompt y temperatura 0: xhigh produce 383 palabras de pensamiento, medium 79, low 57 y off 0 (sin fuga de razonamiento en la prosa final).
- Generacion de codigo: el escenario "code think" alcanza tasas de aceptacion del drafter del 73,0 % (ndt7) y 47,7 % (ndt15), lo que indica buen comportamiento en dominios de programacion.
- Decodificacion especulativa con drafter DSpine de 5 capas (EXL3 5.0bpw-h8, preentrenado sobre el modelo stock, sin reentrenamiento): aceptacion del 26,0 % en "story think ndt7", 73,0 % en "code think ndt7" y 47,7 % en "code think ndt15".
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; los niveles de thinking sugieren capacidad de razonamiento extendido, pero no hay evidencia publicada de flujos agenticos.
- Capacidades multilingues: no disponible.
- Vision: no soportada en este pack (torre de vision eliminada); usar el repositorio bf16 si se necesita.
- Comportamiento "uncensored": la abliteration elimina las direcciones de rechazo, segun los tags del repositorio.

## Casos de uso

- Generacion de codigo en produccion: el modelo muestra la mayor tasa de aceptacion del drafter en escenarios de codigo (73,0 % con ndt7 y 121,6 t/s), lo que lo hace adecuado para autocompletado y generacion de funciones en pipelines de CI/CD con exllamav3.
- Asistentes de programacion con decodificacion especulativa: al incluir la cabeza MTP cuantizada a 4 bits y funcionar con el drafter DSpine sin reentrenamiento, se puede desplegar un servidor de inferencia con aceleracion especulativa sobre 4x RTX 3090 o GPUs similares.
- Razonamiento con presupuesto de computo controlable: los cuatro niveles de thinking permiten ajustar el coste por consulta (de 0 a 383 palabras de pensamiento) segun la tarea, usando `reasoning_effort` en la plantilla de chat.
- Investigacion sobre abliteration: el pack permite estudiar el efecto de la eliminacion de rechazos sobre calidad, tasas de aceptacion del drafter y comportamiento del thinking, con una receta de cuantizacion reproducible documentada.
- Despliegue en hardware consumer: con 16,8 GB de repositorio y cuantizacion de 4 bits, el modelo cabe en configuraciones de una o varias GPUs consumer; el autor reporta la conversion en 4x RTX 3090 en 42 minutos.
- Generacion creativa sin restricciones de contenido: el caracter "uncensored" del modelo lo orienta a tareas de escritura creativa donde los filtros de rechazo resultan un obstaculo, siempre que se cumplan los terminos de la licencia qwen-community.
- Evaluacion de cuantizaciones EXL3: sirve como caso de referencia para medir el impacto de 4.0 bpw con head_bits 8 y mtp_bits 4 en latencia y aceptacion especulativa frente al modelo en bf16.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la model card son las tasas de aceptacion del drafter y los tokens por segundo de la decodificacion especulativa:

| Configuracion | Aceptacion | Tokens/s |
|---|---|---|
| story think ndt7 | 26,0 % (baseline del pack stock: 19,2 %) | 57,9 |
| code think ndt7 | 73,0 % | 121,6 |
| code think ndt15 | 47,7 % | 155,2 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,8 GB en cuantizacion EXL3 de 4.0 bpw; se necesita margen adicional para cache KV y overhead del runtime exllamav3.
- GPU recomendadas: el autor valido la conversion en 4x RTX 3090; para inferencia, GPUs con al menos 24 GB (RTX 3090, RTX 4090) son el objetivo natural dado el tamano del pack, aunque no se documenta una configuracion minima oficial.
- Cabe en GPU consumer: si, en GPUs de 24 GB o superiores con exllamav3; no hay confirmacion de funcionamiento en GPUs de 16 GB o menos.
- Opciones de despliegue: exclusivamente exllamav3 (`Config.from_directory`); el layout EXL3 no es compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: 57,9 t/s en story think ndt7, 121,6 t/s en code think ndt7 y 155,2 t/s en code think ndt15, medidos con decodificacion especulativa sobre el hardware del autor (no se especifica la GPU exacta de inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| catonooka/Qwen3.8-27B-Heretic-Abliterated-EXL3-4.0bpw-h8 | 8,41 B (segun safetensors) | no disponible | EXL3 4.0 bpw | qwen-community | Vision eliminada; MTP incluida |
| catonooka/Qwen3.8-27B-Heretic-Abliterated (bf16) | no disponible | no disponible | bf16 | qwen-community | Incluye torre de vision; fuente de la cuantizacion |
| Qwen/Qwen3.8-27B (stock) | no disponible | no disponible | bf16 | qwen-community | Modelo base sin abliteration |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 27B pero los safetensors suman 8,41 B; verificar el recuento real antes de dimensionar hardware o comparar con otros modelos.
- Sin vision: la torre de vision se elimino en este pack (vision_bits 0); para tareas multimodales hay que usar el repositorio bf16.
- Abliteration: la eliminacion de rechazos puede degradar la calibracion del modelo en dominios sensibles y aumentar la probabilidad de respuestas inapropiadas o inseguras; no se documentan evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de alucinacion para este pack.
- Idiomas: no se documenta la cobertura linguistica; no asumir soporte multilingue sin verificacion.
- Contexto: no se especifica la longitud de contexto soportada; el rendimiento con prompts largos no esta medido.
- Restricciones de licencia: licencia qwen-community (license: other); revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Compatibilidad limitada: solo exllamav3; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Control del thinking: debe hacerse exclusivamente via kwargs de la plantilla de chat; prohibir el token `<think>` en un prompt crudo detiene la generacion de forma inmediata.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/catonooka/Qwen3.8-27B-Heretic-Abliterated-EXL3-4.0bpw-h8
- Modelo intermedio (bf16, con vision): https://huggingface.co/catonooka/Qwen3.8-27B-Heretic-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face
