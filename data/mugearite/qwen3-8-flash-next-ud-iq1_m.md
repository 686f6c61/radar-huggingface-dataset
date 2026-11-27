# Mugearite/Qwen3.8-Flash-Next-UD-IQ1_M

## Resumen

Qwen3.8-Flash-Next UD-IQ1_M es una cuantizacion experimental del modelo Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada en formato `.basalt` por el usuario Mugearite. No se trata de un modelo nuevo ni de un entrenamiento propio, sino de una conversion de los tensores GGUF UD-IQ1_M publicados por Unsloth, reempaquetados sin recuantizar para un fork personal de Basalt denominado Mugearite, orientado a ejecucion local en Windows sobre una unica RTX 5090. El archivo ocupa 66,4 GiB (71,3 GB de repositorio) y esta pensado como "pack de velocidad" frente a la variante IQ3_S-Q4 del mismo autor.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con atencion hibrida que combina Gated DeltaNet y atencion clasica, segun se deduce de los tipos de tensor presentes en el pack (proyecciones q/k/v de Gated DeltaNet, expertos enrutados, expertos compartidos e hiperconexiones). El contexto configurado en los ficheros de servidor alcanza los 262.144 tokens, tanto en modo de una peticion como de ocho simultaneas.

La relevancia de esta ficha es acotada: se trata de un artefacto de inferencia de nicho, dependiente de un runtime no estandar (Mugearite, fork de Basalt) y de un formato de fichero version 1 que el Basalt upstream 0.2 o superior ya no lee. Su interes practico esta en el rendimiento medido en hardware de consumo: unos 355 tok/s de decodificacion a 10K de contexto y 334 tok/s a 100K en una RTX 5090, con una puntuacion GPQA-Diamond de 90,91 dentro del ruido estadistico respecto a la variante de mayor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (Gated DeltaNet + atencion clasica), segun tipos de tensor del pack; detalles completos del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion del servidor Mugearite) |
| Tipos de cuantizacion | Mixta por tensor: IQ2_XXS, IQ2_XS, IQ2_S, Q2_0, IQ4_NL, IQ4_XS, Q5_K, Q6_K, Q8_0 y BF16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | `.basalt` version 1 (no compatible con Basalt upstream 0.2+) |
| Tamano del fichero | 66,4 GiB (71,3 GB de repositorio) |
| SHA-256 | `c6d1a26568de3a7766e89534d5927932e47a6aa75cdbd4981b7a03062cbef997` |
| Modelo base | Qwen/Qwen3.8-Flash-Next (via unsloth/Qwen3.8-Flash-Next-GGUF, revision `084c631a`) |
| Runtime | Mugearite (fork de Basalt), Windows, AVX-512 |
| Fecha de publicacion | 2026-11-27 |

## Arquitectura y entrenamiento

El pack no incluye informacion sobre el entrenamiento del modelo base: no se detallan tokens de entrenamiento, composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se documenta con precision es la distribucion de cuantizacion por tipo de tensor, que revela la estructura arquitectonica: expertos enrutados con proyecciones gate y up en IQ2_XXS (23 capas), IQ2_XS (7 capas) e IQ2_S (18 capas); proyecciones down de expertos en Q2_0 (46 capas) e IQ4_NL (2 capas); atencion en Q6_K; proyecciones q/k/v de Gated DeltaNet en Q5_K; proyecciones de salida de Gated DeltaNet, expertos compartidos e hiperconexiones en Q8_0; embeddings de tokens en IQ4_XS; y una tabla n-gram (`per_layer_token_embd`) en IQ4_NL. El proyector de vision se conserva en BF16.

Una innovacion destacable es la presencia de una cabeza MTP (multi-token prediction) para decodificacion especulativa, con su capa densa, sus expertos y su vocabulario de borrador, identica byte a byte a la de la variante IQ3_S-Q4 del mismo autor. Los tensores son los bytes almacenados por Unsloth, convertidos sin recuantizacion, lo que preserva la fidelidad respecto al GGUF original. La combinacion de Gated DeltaNet con atencion clasica sugiere un diseno hibrido orientado a eficiencia en contextos largos, aunque el autor no aporta detalles adicionales sobre el mecanismo.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el pack incluye modo de pensamiento ("thinking") con esfuerzo configurable; en GPQA-Diamond genera aproximadamente un 9% mas tokens de razonamiento por respuesta que la variante IQ3_S-Q4.
- Razonamiento cientifico de nivel avanzado: puntuacion de 90,91 en GPQA-Diamond (180/198 correctas, una muestra), lo que situa al modelo en el rango de los sistemas de razonamiento de gama alta en preguntas de posgrado en fisica, quimica y biologia.
- Vision: el pack conserva el proyector de vision en BF16, por lo que el modelo base es multimodal; no se documenta el alcance exacto de las capacidades visuales en esta ficha.
- Contexto largo: 262.144 tokens configurados, con rendimiento de decodificacion estable entre 10K y 100K de contexto (355 frente a 334 tok/s).
- Servicio concurrente: las configuraciones permiten 1 u 8 peticiones simultaneas, cada una con 262.144 tokens de contexto.
- API compatible con OpenAI: el servidor Mugearite expone un endpoint estilo OpenAI, lo que facilita la integracion con clientes existentes.
- Tool calling y capacidades de agente: no documentado explicitamente en la informacion disponible; el autor menciona su uso con "8 agentes de programacion en uso real", lo que implica soporte practico de flujos agenticos, pero sin detalle tecnico.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Razonamiento cientifico asistido en local: el modelo obtiene 90,91 en GPQA-Diamond con una sola muestra, por lo que resulta adecuado para responder preguntas tecnicas de nivel posgrado sin enviar datos a la nube, siempre que se acepte el ruido de unos 2 puntos entre ejecuciones.
- Agentes de programacion en paralelo: el autor reporta 8 agentes de codigo simultaneos con conversaciones de 30.000 a 70.000 tokens y un throughput agregado de 550-600 tok/s, escenario en el que el pack brilla por su cache de expertos en VRAM (97,7% de aciertos).
- Analisis de documentos largos: con 262.144 tokens de contexto y decodificacion de 334 tok/s a 100K de contexto, es viable procesar informes extensos, expedientes o bases de codigo completas en una sola sesion.
- Servicio de chat multi-turno con contexto persistente: las configuraciones permiten hasta 96 GiB de RAM para conversaciones aparcadas, lo que posibilita mantener sesiones largas con varios usuarios y reanudarlas sin recargar el contexto.
- Prototipado e investigacion en hardware de consumo: permite experimentar con un MoE de gran tamano y contexto de 256K en una unica RTX 5090, algo impensable con cuantizaciones de mayor precision.
- Evaluacion comparativa de tecnicas de cuantizacion: al compartir cabeza MTP y estructura con la variante IQ3_S-Q4, sirve como referencia para medir el impacto de cuantizaciones agresivas en calidad (KLD 0,2563 frente a 0,0979) y velocidad.
- Inferencia por lotes con concurrencia moderada: con 4-8 peticiones simultaneas de 80.000 tokens y respuestas de 256 tokens, sostiene unos 410-435 tok/s agregados, suficiente para tareas de extraccion o clasificacion por lotes.

## Benchmarks y rendimiento

Calidad (Wikitext-2, 100 fragmentos de 512 tokens, cache KV int8, base de divergencia KL llama.cpp Q8_0 con PPL 3,2808):

| Pack | Tamano | PPL | KLD media | Mismo top-1 |
|---|---:|---:|---:|---:|
| Este pack (UD-IQ1_M) | 71,3 GB | 3,3781 | 0,2563 | 83,05% |
| GSQ-RCO IQ3_S | 87,6 GB | 3,3738 | 0,1520 | 87,29% |
| Mugearite IQ3_S-Q4 | 119,6 GB | 3,2309 | 0,0979 | 89,65% |

Razonamiento (GPQA-Diamond, API compatible OpenAI, una pregunta a la vez, thinking por defecto, temperatura 1,0, top_p 0,95, top_k 20, presupuesto de 262.144 tokens):

| Pack | GPQA-Diamond | Tiempo medio por respuesta |
|---|---:|---:|
| Este pack | 90,91 (180/198, 1 muestra) | 47,9 s |
| Mugearite IQ3_S-Q4 | 92,93 (184/198, 1 muestra) | 60,3 s |

Velocidad (RTX 5090 a 450 W, Ryzen 7 9800X3D, mediciones de desarrollo, no ejecuciones de benchmark):

| Metrica | IQ3_S-Q4 | Este pack |
|---|---:|---:|
| Decodificacion a 10K / 100K contexto (tok/s) | 288 / 281 | 355 / 334 |
| Seguimiento a 10K / 100K contexto (ms) | 254 / 292 | 140 / 168 |
| Primera lectura a 10K / 100K (tok/s) | 8.900 / 9.800 | 9.200 / 10.000 |

Concurrencia (tokens agregados): 4 peticiones de 80.000 tokens con respuestas de 256 tokens, unos 410 tok/s; 8 peticiones equivalentes, unos 435 tok/s; 8 agentes de codigo en uso real con 30.000-70.000 tokens, 550-600 tok/s. La tasa de aciertos de la cache de expertos en VRAM es del 97,7% frente al 90,8% de IQ3_S-Q4 (247 tok/s) en la misma prueba.

## Requisitos de hardware

- VRAM: el pack ocupa 66,4 GiB, por lo que requiere al menos 68 GiB de VRAM para residir completo; el autor reserva 2 GiB adicionales (`vram-reserve-mib`) para evitar que la cache de expertos sature la tarjeta en Windows y degrade la lectura de prompts.
- GPU recomendadas: RTX 5090 (32 GB) es la plataforma de referencia del autor, pero el modelo completo no cabe en una sola; el sistema funciona con descarga parcial de expertos a RAM y cache dinamica. Para residencia completa se necesitan GPUs de 80 GB o mas (A100 80GB, H100 80GB, H200) o configuraciones multi-GPU.
- RAM: las configuraciones permiten hasta 96 GiB de RAM para conversaciones aparcadas; se recomienda un sistema con al menos 96-128 GiB para el modo de 8 slots.
- CPU: se requiere AVX-512 para el rendimiento reportado (Ryzen 7 9800X3D en las mediciones).
- Cabe en GPU de consumo: si, en RTX 5090 con descarga parcial de expertos a RAM del sistema, a costa de depender de la cache de expertos en VRAM. No cabe en GPUs de 24 GB o menos.
- Despliegue: exclusivamente mediante Mugearite (`basalt serve --config ...`), fork de Basalt. No es compatible con Basalt upstream 0.2+, llama.cpp, vLLM, Ollama ni TGI, ya que el formato `.basalt` version 1 solo lo lee Mugearite.
- Latencia y throughput: 355 tok/s de decodificacion a 10K de contexto y 334 tok/s a 100K en una RTX 5090; primera lectura de prompt a 9.200-10.000 tok/s; 47,9 s de media por respuesta en GPQA-Diamond con razonamiento completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD / GPQA) | Licencia | Runtime |
|---|---|---|---|---|---|
| Este pack (UD-IQ1_M) | no disponible | 262.144 | KLD 0,2563 / GPQA 90,91 | Qwen Community 1.0 | Mugearite (Basalt v1) |
| Mugearite IQ3_S-Q4 | no disponible | 262.144 | KLD 0,0979 / GPQA 92,93 | Qwen Community 1.0 | Mugearite |
| GSQ-RCO IQ3_S | no disponible | no disponible | KLD 0,1520 / GPQA no disponible | Qwen Community 1.0 | no disponible |
| Qwen3.8-Flash-Next (BF16 original) | no disponible | no disponible | referencia (PPL 3,2808 en Q8_0) | Qwen Community 1.0 | llama.cpp, vLLM, etc. |

La comparacion relevante es interna al ecosistema de cuantizaciones del mismo modelo base: este pack sacrifica calidad (KLD 0,2563 frente a 0,0979 de IQ3_S-Q4) a cambio de un 20% mas de velocidad de decodificacion y un 41% menos de tamano (71,3 GB frente a 119,6 GB). No se dispone de datos de benchmarks frente a modelos de otros laboratorios en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad degradada: la divergencia KL de 0,2563 es 2,6 veces superior a la de IQ3_S-Q4 y el acuerdo top-1 cae al 83,05% frente al 89,65%; en tareas sensibles a la precision (generacion de codigo, matematicas exactas) la diferencia puede ser apreciable.
- Naturaleza experimental: el propio autor etiqueta el pack como experimental, con una unica muestra en GPQA-Diamond y una variacion de aproximadamente 2 puntos entre ejecuciones, por lo que la comparacion de 90,91 frente a 92,93 no es concluyente.
- Dependencia de runtime no estandar: solo funciona con Mugearite, un fork personal de Basalt; no hay soporte en Basalt upstream, llama.cpp, vLLM ni Ollama. Esto limita la portabilidad y la integracion en produccion.
- Formato version 1 obsoleto: Basalt 0.2 y posteriores leen solo ficheros version 2, por lo que el pack quedara inutilizable si el autor no mantiene el fork o migra el formato.
- Requisitos de hardware elevados: 66,4 GiB de pesos mas 96 GiB de RAM potencial para conversaciones aparcadas exigen una estacion de trabajo con RTX 5090 y 128 GiB de RAM como minimo realista.
- Configuracion de VRAM delicada: con la reserva por defecto de 700 MiB en Windows, la cache de expertos puede llenar la tarjeta y ralentizar la lectura de prompts varias veces; hay que ajustar `vram-reserve-mib` a 2 GiB.
- Seguridad del servidor: las configuraciones dejan el servidor accesible; el autor recomienda mantenerlo en 127.0.0.1 o establecer una API key real antes de exponerlo.
- Licencia: Qwen Community License 1.0, que impone condiciones adicionales para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- Sesgos y alucinaciones: no se documenta informacion sobre sesgos del modelo base ni sobre tasas de alucinacion; al ser una cuantizacion agresiva, el riesgo de degradacion en dominios especializados es mayor que en el original.
- Idiomas: no se especifican los idiomas soportados; no se puede asumir un rendimiento multilingue equivalente al del modelo base sin verificacion.
- Tool calling: no se documenta explicitamente el soporte de function calling en esta ficha, aunque el uso reportado con agentes de codigo sugiere que funciona en la practica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mugearite/Qwen3.8-Flash-Next-UD-IQ1_M
- Variante IQ3_S-Q4 del mismo autor: https://huggingface.co/Mugearite/Qwen3.8-Flash-Next-IQ3_S-Q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de Unsloth (revision `084c631a`): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio de Basalt: https://github.com/jesdga95/basalt
