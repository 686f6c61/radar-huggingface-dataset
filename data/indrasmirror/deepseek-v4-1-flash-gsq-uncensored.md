# IndrasMirror/DeepSeek-V4.1-Flash-GSQ-Uncensored

## Resumen

DeepSeek-V4.1-Flash-GSQ-Uncensored es una cuantizacion mixta calibrada del checkpoint abliterado de DeepSeek-V4.1-Flash, publicada por el desarrollador independiente IndrasMirror. El modelo original es un MoE de 552B parametros con 40 capas, 384 expertos enrutados por capa (top-6 por token), un experto compartido, Hyper-Connections, atencion dispersa CSA y una memoria de n-gramas denominada Engram. Esta version reduce los pesos de los expertos a una mezcla de formatos ternario (PTQ1_0), 2 bits (Q2_0) y 3 bits (Q3_K), con una media de 2,250 bits por peso, mientras que la parte densa (atencion, experto compartido, cabeza de salida) se mantiene en Q8_0.

El objetivo declarado es ejecutar un modelo de clase frontera en hardware de consumo: una RTX 4090 de 24 GB, 90 GB de RAM y NVMe. Para ello el motor Xolotl (antes Strata-DSV4.1) trata los expertos como una cache de tres niveles: VRAM, RAM fijada y fichero en NVMe con lecturas O_DIRECT y prefetch de una capa por delante. El autor reporta prefill de aproximadamente 250 tok/s y decodificacion de 17-30 tok/s con decodificacion especulativa DSpark.

La relevancia actual radica en que demuestra una via practica para servir modelos MoE masivos con presupuesto de bits no uniforme, asignando mas precision a los expertos que la calibracion identifica como sensibles. No es un GGUF estandar de llama.cpp, Ollama o LM Studio: requiere el motor propio del autor. El repositorio tiene 177 GB, 3.259 descargas y 23 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 40 capas, 384 expertos enrutados por capa (top-6), experto compartido, Hyper-Connections, atencion dispersa CSA y memoria Engram |
| Parametros totales | 552B en el modelo base; 14.710.631.010 en los safetensors del repositorio |
| Parametros activos | top-6 de 384 expertos enrutados por capa (no se especifica el total activo) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | Mezcla por experto: PTQ1_0 ternario (1,75 bits/peso, 42,8% de pesos de experto), Q2_0 (2,25 bits/peso, 39,2%), Q3_K (3,44 bits/peso, 18,0%); media 2,250 bits/peso. Parte densa en Q8_0; embeddings, compresor e indexador en F16; normas, router y mHC en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF propio con tipos por experto no compatibles con llama.cpp, Ollama ni LM Studio; requiere Xolotl |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash es un MoE de 40 capas con 384 expertos enrutados por capa y seleccion top-6 por token, complementado por un experto compartido. Incorpora Hyper-Connections, atencion dispersa CSA y una memoria de n-gramas Engram. Los 15.360 expertos enrutados acumulan 543,6B pesos y fueron entrenados originalmente en FP4. Esta publicacion no reentrena el modelo: parte del checkpoint abliterado en FP8 de dealignai y aplica una cuantizacion post-entrenamiento.

La cuantizacion sigue la familia GSQ (Gumbel-Softmax Quantization) del DAS Lab del IST Austria, con asignacion de presupuesto exacto RCO descrita en el paper arXiv:2605.00649. Esta release corresponde a la etapa inicializada con GPTQ y una asignacion propia denominada "RCO-lite"; el refinamiento con Gumbel-softmax de GSQ aun no se ha aplicado. La calibracion es agentica: transcripciones reales de sesiones de agente de codificacion (secretos depurados y resultados de herramientas recortados) mas 4.690 prompts imatrix de antirez/ds4, todo re-renderizado con el codificador de chat V4.1 de DeepSeek y el formato de tool-call DSML, con 128 secuencias de 2.048 tokens. El autor senala que las metricas solo de pesos no discriminan entre expertos porque todos comparten la misma distribucion por 32 pesos, por lo que la asignacion se basa en activaciones. La mezcla resultante ocupa los mismos bytes que una cuantizacion uniforme Q2_0, pero el autor reporta un 17% menos de error de salida en el proxy de calibracion.

## Capacidades

- Generacion de texto y razonamiento con modo thinking, presupuesto de 32K tokens en las mediciones del autor.
- Generacion de codigo: HumanEval 21/21 medido a traves del servidor con thinking activado.
- Tool calling y function calling en formato DSML de DeepSeek: 10/10 llamadas correctas segun el autor.
- Razonamiento agentico multi-paso: 3/3 tareas agenticas reportadas.
- Contexto largo de hasta 512K tokens.
- Vision: el repositorio incluye el fichero `V41-MTP-Vision.gguf`, lo que sugiere soporte multimodal, aunque no se detallan las capacidades concretas.
- Decodificacion especulativa DSpark integrada en el servidor, con muestreo especulativo exacto y verificacion con umbral de confianza.
- Cache KV de 4 bits bit-exacta (`--kv-fp4`, +1,1 GiB de VRAM a 512K).
- Arena de expertos adaptativa a la conversacion, que mueve los expertos de la conversacion de NVMe a RAM entre turnos (-21 a -30% de lecturas NVMe).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de codificacion local: con HumanEval 21/21 y tool calling 10/10 medidos por el autor, el modelo puede integrarse en un flujo de edicion de codigo en una estacion de trabajo con RTX 4090, ejecutando el motor Xolotl en local sin depender de APIs externas.
- Agente de desarrollo multi-paso: la combinacion de tool calling, razonamiento agentico y contexto de 512K permite mantener sesiones largas de agente que leen repositorios, ejecutan herramientas y encadenan pasos con el historial completo en contexto.
- Analisis de documentos extensos: la ventana de 512K tokens admite ingerir bases de codigo, expedientes o transcripciones completas en una sola pasada, con la cache KV de 4 bits para limitar el coste de VRAM.
- Investigacion sobre cuantizacion: el repositorio y las herramientas en `Xolotl/tools/v41` permiten reproducir el pipeline de calibracion, asignacion de bits y evaluacion en una sola GPU, lo que lo hace util para estudiar esquemas de precision mixta en MoE.
- Despliegue en hardware de consumo: el diseno de cache en tres niveles (VRAM, RAM, NVMe) posibilita servir un modelo de 552B en un equipo con 24 GB de VRAM y 90 GB de RAM, un escenario inviable con cuantizaciones uniformes convencionales.
- Experimentacion sin censura: al derivar de un checkpoint abliterado, puede emplearse en estudios sobre alineacion, rechazo y comportamiento del modelo en dominios restringidos, siempre bajo la licencia MIT y con las advertencias de seguridad correspondientes.
- Procesamiento por lotes en local: el prefill de aproximadamente 250 tok/s permite clasificar, resumir o extraer informacion de lotes de texto sin salir del equipo.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| HumanEval | 21/21 | Thinking activado, sesgo de enrutamiento seguro para codigo x0,5, medido a traves del servidor |
| Tool calls | 10/10 | Thinking activado, mismas condiciones |
| Tareas agenticas | 3/3 | Thinking activado, mismas condiciones |
| Decodificacion | 26,8 tok/s | Thinking activado, presupuesto de 32K |
| Decodificacion (rango) | 17-30 tok/s | Con sesgo seguro para codigo y DSpark |
| Prefill | ~250 tok/s | Exacto |
| Decodificacion, prosa | 9,5 a 17,3 tok/s | Verificacion con umbral de confianza |
| Decodificacion, codigo | 18,8 a 25,5 tok/s | Verificacion con umbral de confianza |
| Decodificacion, Python | 26,6 a 29,1 tok/s | Verificacion con umbral de confianza |
| Error de salida vs Q2_0 uniforme | 17% menos | Proxy de calibracion, mismo tamano |
| Turno de +180 tokens sobre contexto de 6K | 8,5 a 7,6 s | Arena de expertos adaptativa activada |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible. Los datos anteriores son mediciones del autor en un unico equipo y no comparaciones independientes.

## Requisitos de hardware

- VRAM: 24 GB en una RTX 4090 segun la configuracion de referencia; la cache KV de 4 bits anade 1,1 GiB a 512K de contexto.
- RAM: 90 GB, de los cuales 60 GiB corresponden al arena fijada de aproximadamente 6.700 expertos.
- Almacenamiento: NVMe para el nivel de fichero, con los aproximadamente 8.700 expertos restantes y lecturas O_DIRECT con prefetch de una capa.
- GPU recomendadas: RTX 4090 (24 GB) es la unica configuracion documentada. No se dispone de datos para A100, H100 u otras GPU.
- Cabe en GPU de consumo: si, en una RTX 4090, pero solo con el motor Xolotl y el esquema de cache en tres niveles; no cabe en VRAM sola.
- Despliegue: exclusivamente con Xolotl (antes Strata-DSV4.1), construido con `build-xolotl`. No es compatible con llama.cpp, Ollama, LM Studio ni TGI.
- Latencia y throughput: prefill de aproximadamente 250 tok/s y decodificacion de 17-30 tok/s con DSpark; un turno de 1.000 tokens a 512K de contexto paso de 40 a 20 s tras las optimizaciones del 15 de octubre de 2026.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-GSQ-Uncensored | 552B (MoE) | 512K | Mixta ternario/2/3 bits, media 2,250 bits | MIT | Xolotl |
| DeepSeek-V4.1-Flash (base) | 552B (MoE) | 512K | FP4 nativo en expertos | no disponible en la informacion | infraestructura de datacenter |
| dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 552B (MoE) | 512K | FP8 | no disponible en la informacion | infraestructura de datacenter |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | Xolotl (segun el autor) |
| Qwen3.8 | no disponible | no disponible | no disponible | no disponible | Xolotl (segun el autor) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada. Las unicas cifras publicadas son las mediciones del autor en su propio equipo.

## Limitaciones y advertencias

- Es una release de investigacion experimental de un unico desarrollador, medida en un solo PC; no hay validacion independiente.
- No es un GGUF estandar: usa tipos de cuantizacion por experto que llama.cpp, Ollama y LM Studio no cargan. Solo funciona con Xolotl.
- El pipeline GSQ esta incompleto: falta el refinamiento con Gumbel-softmax y la asignacion es "RCO-lite", no la version completa.
- El checkpoint deriva de una version abliterada, lo que elimina mecanismos de rechazo y aumenta el riesgo de generar contenido danino o inapropiado; requiere filtros y supervision en produccion.
- Riesgo de alucinacion no cuantificado; no hay benchmarks estandar publicados que permitan estimarlo.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del entrenamiento original.
- El rendimiento depende criticamente del almacenamiento NVMe y del motor: las cifras de 17-30 tok/s no son extrapolables a otros equipos.
- El contexto de 512K con cache KV de 4 bits anade VRAM y puede degradar la calidad de la atencion en comparacion con precisiones mayores.
- La licencia MIT permite uso comercial, pero el modelo base y el checkpoint intermedio pueden tener condiciones adicionales no detalladas en la informacion disponible; conviene verificar las licencias de los repositorios upstream.
- El sesgo de enrutamiento seguro para codigo (x0,5) reduce el rendimiento en HumanEval frente al sesgo completo (20/21 frente a 16/21 en las notas del autor), por lo que hay que elegir la configuracion segun la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-GSQ-Uncensored
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Checkpoint abliterado FP8: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Motor Xolotl (antes Strata-DSV4.1): https://github.com/Indras-Mirror/Xolotl
- Herramientas del pipeline V4.1: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/v41
- Strata: https://github.com/Niko1221/Strata
- GSQ (Gumbel-Softmax Quantization): https://github.com/IST-DASLab/GSQ
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
