# goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound-v2

## Resumen

Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound-v2 es una cuantizacion de alta fidelidad del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario goldhub. Se trata de una compresion hibrida que mantiene en BF16/FP16 las capas criticas para el razonamiento y la vision (`linear_attn.*`, torre visual, `embed_tokens` y `lm_head`) mientras cuantiza el resto de la red a INT4 con activaciones en 16 bits (W4A16) y tamano de grupo 32. El objetivo declarado es preservar las capacidades de razonamiento, vision y contexto largo del modelo original en hardware de consumo o prosumer.

El modelo base pertenece a la familia Qwen3.8, con arquitectura que combina atencion lineal (Gated DeltaNet) y atencion estandar, soporte de vision y video, contexto declarado de 256K y decodificacion multi-token (MTP). La cuantizacion ocupa aproximadamente 26,4 GB en disco (28,3 GB de repositorio) frente a los ~54 GB de los pesos BF16 originales, lo que la hace desplegable en una unica GPU de 32 GB o en dos GPU de 24 GB con paralelismo tensorial.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de gran contexto en infraestructura asequible sin renunciar, segun el autor, a la coherencia en razonamiento de multiples pasos ni a la calidad en tareas de vision, algo que las cuantizaciones INT4 ingenuas suelen degradar. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Gated DeltaNet) y atencion estandar, torre visual y MTP; modelo base Qwen3.8-27B |
| Parametros totales | 11.575.659.760 segun safetensors del repositorio cuantizado; el modelo base se comercializa como 27B (cifra no verificable en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K declarado en tags; el autor recomienda 32K en configuracion vLLM y 128K-256K con offloading de KV cache y chunked prefill |
| Tipos de cuantizacion | INT4 W4A16, group_size=32, simetrica, AutoRound con 2500 iteraciones; capas `linear_attn.*`, `model.visual.*`, `embed_tokens` y `lm_head` en BF16/FP16 |
| Idiomas soportados | en, zh, ru, uk, el, he |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 28,3 GB, pesos ~26,4 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida en la que conviven mecanismos de atencion lineal tipo Gated DeltaNet con capas de atencion estandar, complementados por una torre visual que habilita entradas de imagen y video, y por decodificacion multi-token (MTP) para acelerar la generacion. La cuantizacion no altera la topologia: sustituye los pesos de las capas lineales por INT4 con activaciones en 16 bits, manteniendo intactas las capas sensibles a la deriva de alineacion.

El proceso de cuantizacion se realizo con AutoRound en modo W4A16, group_size 32 y simetria, con 2500 iteraciones de convergencia y un conjunto de calibracion de 75.597 muestras de alta calidad (trazas de razonamiento, tareas de codigo complejas y cadenas filosoficas). El autor documenta que cuantizar `linear_attn` y los bloques visuales provocaba una deriva de alineacion severa, de ahi la decision de conservarlos en BF16/FP16. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base, la composicion exacta de su dataset ni las etapas de RLHF o DPO aplicadas.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo.
- Razonamiento de multiples pasos, incluyendo matematicas y logica estructurada.
- Generacion de codigo, con ejemplos de algoritmos clasicos (criba de Eratostenes, uso de bitarray).
- Comprension de imagenes (pipeline image-text-to-text) y de video (tag video-text-to-text).
- Decodificacion multi-token (MTP) para incrementar el throughput de generacion.
- Soporte multilingue en ingles, chino, ruso, ucraniano, griego y hebreo.
- Escritura creativa de formato largo (el autor reporta coherencia narrativa en generaciones de mas de 16K tokens).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento tecnico con contexto largo: gracias a la ventana declarada de 256K y a la preservacion de las capas de atencion lineal, puede mantener el hilo en analisis de documentos extensos, auditorias de codigo o expedientes completos sin perder referencias cruzadas.
- Generacion y revision de codigo en produccion: el autor reporta velocidad de ~24,29 tok/s en tareas de codigo algorítmico, adecuada para integrarse en pipelines de revision de parches o generacion de tests dentro de CI/CD.
- Analisis de imagenes y video: al conservar la torre visual en BF16, es apto para inspeccion de capturas, extraccion de datos de documentos escaneados o resumen de clips, tareas donde una cuantizacion agresiva del encoder visual degradaria la precision.
- Atencion al cliente automatizada multilingue: cubre conversaciones en ingles, chino, ruso, ucraniano, griego y hebreo con contexto conversacional amplio, util para soporte en mercados de Europa del Este y Oriente Proximo.
- Procesamiento de documentacion legal o cientifica: la ventana de 32K-128K con chunked prefill permite resumir y comparar contratos, articulos o informes tecnicos largos en una sola pasada.
- Despliegue en estaciones de trabajo prosumer: con 32 GB de VRAM o dos GPU de 24 GB, encaja en entornos de desarrollo locales donde no hay acceso a clusters, manteniendo capacidades multimodales.
- Generacion de contenido creativo de formato largo: el autor reporta coherencia narrativa en generaciones de 16K+ tokens con temperatura 0,6, adecuado para guiones, documentacion narrativa o ficcion por capitulos.

## Benchmarks y rendimiento

El autor declara explicitamente que no evalua con MMLU ni GSM8K y no publica resultados en esos conjuntos. Los unicos datos numericos disponibles son medidas de velocidad de generacion en tareas propias:

| Tarea | Velocidad (tok/s) | Notas |
|---|---|---|
| Baseline | ~17,85 | Generacion estandar |
| Razonamiento (matematicas) | ~23,75 | Logica paso a paso |
| Codigo (algoritmos) | ~24,29 | Criba de Eratostenes con bitarray |
| Contexto largo | ~23,22 | 350+ tokens de prompt, 340+ de salida |
| Estres MTP | ~24,19 | Estabilidad de multi-token prediction |
| Creatividad profunda | ~19,6 - 20,6 | Coherencia narrativa en 16K+ tokens |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 32 GB (una RTX 5090, RTX A5000 o V100 de 32 GB).
- Configuracion recomendada: 2x 24 GB (RTX 3090 o RTX 4090) con `tensor-parallel-size=2`.
- Tamano de pesos en disco: ~26,4 GB (repositorio de 28,3 GB), superior a una cuantizacion INT4 convencional por la preservacion de capas en BF16.
- Despliegue recomendado: vLLM, con `--tensor-parallel-size 2`, `--max-model-len 32768`, `--max-num-seqs 2`, `--trust-remote-code` y `--enable-prefix-caching`.
- Alternativa: SGLang (TP=2 o PP=3), aunque el autor lo describe como notablemente mas lento para esta arquitectura hibrida.
- Contexto extendido: para 128K o mas se requiere vLLM con chunked prefill y gestion de KV cache con offloading; a 32K pueden producirse OOM en tareas de logica muy estructurada segun el backend.
- Throughput observado: entre ~17,85 y ~24,29 tok/s segun la tarea, con temperatura recomendada de 0,6.
- Soporte en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound-v2 | 11,58B en safetensors (base 27B) | 256K declarado | INT4 W4A16 hibrida | Apache 2.0 | Vision y video, MTP, capas criticas en BF16 |
| Qwen/Qwen3.8-27B (base) | 27B | 256K | BF16 | Apache 2.0 | Referencia de calidad; ~54 GB de pesos |
| Qwen3.8-Max (mencionado por el autor) | no disponible | no disponible | BF16 denso | no disponible | Modelo denso mayor, sin datos tecnicos en la informacion |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que con temperatura 1,0 en generaciones largas el modelo puede entrar en bucles repetitivos; recomienda mantenerla en torno a 0,6.
- A 32K de contexto, tareas de logica muy estructurada (por ejemplo, generacion de Sudoku) pueden degradarse o provocar OOM segun la gestion de KV cache del backend.
- La cuantizacion INT4, aunque preserva capas criticas, implica una perdida de fidelidad respecto al BF16 original; el propio autor reconoce divergencia en sintesis filosofica abstracta, recuperacion multi-hop masiva y matices linguisticos de bajos recursos.
- El rendimiento en benchmarks estandarizados no esta publicado; las cifras del autor son medidas internas de velocidad, no de calidad.
- Los idiomas soportados se limitan a ingles, chino, ruso, ucraniano, griego y hebreo; el castellano no figura entre los idiomas declarados.
- La discrepancia entre la denominacion comercial "27B" y los 11.575.659.760 parametros del safetensors cuantizado debe verificarse antes de dimensionar infraestructura.
- El modelo requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar el contenido antes de desplegarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B por si imponen restricciones adicionales.
- El repositorio tiene un volumen de descargas bajo (592) y pocos likes (5), por lo que la validacion comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ruach Studio (autores): https://github.com/igrbible/Ruach_Studio
- Awesome YUE2: https://github.com/igrbible/Awesome-YUE2
