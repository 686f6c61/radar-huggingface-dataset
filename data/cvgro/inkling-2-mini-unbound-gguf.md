# cvgro/Inkling-2-Mini-Unbound-GGUF

## Resumen

Inkling-2-Mini-Unbound es una variante "abliterated" (sin censura) del modelo multimodal Inkling-2-Mini, distribuida en formato GGUF por el usuario cvgro a partir del checkpoint original de nokeepai. El modelo base resuelve tareas de imagen-texto-a-texto (image-text-to-text) y esta disenado para ejecutarse en llama.cpp, LM Studio y Ollama. Cuenta con aproximadamente 26.070 millones de parametros totales y una arquitectura de mezcla de expertos (MoE), segun se desprende de la recomendacion de usar `--n-cpu-moe` en llama.cpp.

La version v2.1, que es la que se empaqueta en estos GGUF, aplica un parche de 120 tensores sobre las proyecciones de atencion (q, k, v, output y gate) de las 24 capas, manteniendo intactos los 584 tensores restantes (expertos, router, embeddings y cabeza de salida). El objetivo declarado es eliminar los rechazos del modelo original ante peticiones consideradas daninas, sin reentrenar ni anadir capas de seguridad posteriores. La licencia es Apache 2.0 y el repositorio ocupa 393,9 GB en total, incluyendo multiples cuantizaciones.

Es relevante ahora porque combina tres caracteristicas poco frecuentes en un mismo paquete: capacidades multimodales (entrada de imagen), arquitectura MoE con posibilidad de descargar expertos a RAM y un proceso de "abliteration" documentado con evaluaciones cuantitativas de utilidad y deriva (KLD). No obstante, su naturaleza sin censura lo hace inadecuado para despliegues directos a usuarios finales sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (image-text-to-text) |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_M, IQ2_M; proyector de vision en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE), confirmada por la recomendacion del autor de usar `--n-cpu-moe N` en llama.cpp para mantener parte de los expertos en RAM del sistema cuando no caben en VRAM. Dispone de 24 capas, cada una con proyecciones de atencion q, k, v, output y gate, y un total de 704 tensores (120 parcheados y 584 intactos). La componente multimodal se implementa mediante un proyector de vision independiente (`mmproj`), disponible en BF16 (0,6 GB) y Q8_0 (0,3 GB), sin cambios respecto al modelo original.

El proceso de creacion de la variante Unbound v2.1 es un parche byte-exacto sobre el BF16 oficial de ggml-org: se sustituyen los bytes de las proyecciones de atencion por los de la version sin censura, verificando previamente que los bytes originales coinciden exactamente con los tensores de ggml-org. El resto de tensores (expertos, router, embeddings y cabeza) se mantienen sin tocar. Posteriormente se cuantiza con `llama-quantize` estandar de llama.cpp. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagenes como entrada (image-text-to-text) mediante el proyector de vision.
- Modo "thinking" (razonamiento extendido) activable, con recomendacion de usar un tope de pensamiento.
- Respuesta a instrucciones consideradas daninas, peligrosas o ilegales que el modelo original rechaza (caracteristica declarada del "abliteration").
- Ejecucion local en llama.cpp, LM Studio y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling ni capacidades de agente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar el comportamiento de un modelo "abliterated" frente a peticiones daninas en un entorno controlado, comparando tasas de utilidad y rechazo con el original (83,7-85,2 % de utilidad frente a 0,8 % del original).
- Evaluacion de tecnicas de cuantizacion: la tabla de ficheros con KLD y acuerdo de token superior (95,4 % en Q8_0, 91,1 % en IQ2_M) sirve para analizar el impacto de la cuantizacion en un MoE multimodal.
- Procesamiento de documentos con imagenes en local: al aceptar entrada de imagen y ejecutarse en llama.cpp, puede usarse para extraer y describir contenido de capturas o figuras en flujos offline.
- Despliegue en hardware de consumo: con Q4_K_M (17,8 GB) cabe en GPUs de 16-24 GB de VRAM, lo que permite experimentar con un MoE de 26B en una RTX 4090.
- Pruebas de robustez y red teaming: util para generar respuestas a prompts adversarios y medir la eficacia de filtros de seguridad propios antes de desplegar un modelo en produccion.
- Analisis de deriva (drift) entre checkpoints: los valores de KLD frente al Q8_0 original permiten estudiar la fidelidad de distintas cuantizaciones en tareas de generacion libre.
- Escenarios de investigacion que requieren respuestas sin rechazo: estudio de sesgos, generacion de contenido controvertido con fines academicos y analisis de limites del modelo, siempre con salvaguardas.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la variante v2.1 ejecutada en Q8_0 con llama.cpp, decodificacion greedy, tope de pensamiento de 4.096 y tope de respuesta de 8.192, sobre 263 prompts daninos reservados y juez Jev (utilidad = p >= 0,5).

| Metrica | Inkling-2-Mini-Unbound v2.1 | Original Inkling-2 Mini |
|---|---|---|
| Utilidad, thinking off | 83,7 % | 0,8 % |
| Utilidad, thinking on | 85,2 % | 0,8 % |
| Rechazo off / on | 0,4 % / 0,4 % | 96,2 % / 95,8 % |
| Deriva (KLD) | 0,0439 | — |
| MMLU-300 | 74,3 | 76,3 |
| GSM8K-100 | 98 | 97 |
| Prompts benignos rechazados | 0,1 % (1 de 784) | — |

Comparativa con otras variantes sin censura sobre los mismos 263 prompts:

| Modelo | Utilidad off | Utilidad on | KLD |
|---|---|---|---|
| Inkling-2-Mini-Unbound v2.1 | 83,7 % | 85,2 % | 0,0439 |
| IndrasMirror XQ (aprox. 4 bits) | 58,9 % | 68,1 % | 0,0357 |
| AtomicChat Uncensored (LoRA) | 52,1 % | 55,5 % | 0,0078 |
| AtomicChat Uncensored (AD-Q4_K) | 50,2 % | 59,3 % | 0,0106 |
| OpenUncensored | 33,1 % | 41,8 % | 0,0228 |
| JoaoZaokk Heretic (aprox. 4 bits) | 17,5 % | 26,2 % | no medido |

Con configuracion recomendada (temp 0,6, top-p 0,95, tope de pensamiento), el 16,1 % de 230 prompts daninos nuevos alcanzo el tope de pensamiento, frente al 29,1 % con decodificacion greedy.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero mas unos pocos GB para el contexto. Q8_0: 27,8 GB; Q6_K: 23,6 GB; Q5_K_M: 20,1 GB; Q4_K_M: 17,8 GB; IQ3_M: 13,3 GB; IQ2_M: 11,2 GB.
- Proyector de vision: anadir 0,3 GB (Q8_0) o 0,6 GB (BF16) si se requiere entrada de imagen.
- GPU recomendadas: 32 GB o mas de VRAM para Q8_0 (A100 40 GB, H100); 24-32 GB para Q6_K o Q5_K_M (RTX 4090, A6000); 16-24 GB para Q4_K_M (RTX 4080, RTX 4090).
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090 y Q6_K en GPUs de 24 GB; por debajo de 12 GB usar IQ2_M o Q4_K_M con expertos en RAM.
- Despliegue: llama.cpp (probado con el commit `19bc41dbb`), LM Studio y Ollama. No se documenta soporte en vLLM ni TGI.
- Descarga de expertos a RAM: `--n-cpu-moe N` permite mantener expertos en memoria del sistema; VRAM + RAM deben cubrir el tamano del fichero mas margen.
- Latencia y throughput: no disponibles.
- No usar muestreo DRY segun recomendacion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Utilidad (thinking on) | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound v2.1 | ~26,07 B (MoE) | no disponible | 85,2 % | Apache 2.0 | GGUF, safetensors |
| IndrasMirror XQ | no disponible | no disponible | 68,1 % | no disponible | GGUF (~4 bits) |
| AtomicChat Uncensored | no disponible | no disponible | 55,5 % | no disponible | LoRA / GGUF |
| OpenUncensored | no disponible | no disponible | 41,8 % | no disponible | GGUF |
| Inkling-2 Mini original | ~26,07 B (MoE) | no disponible | 0,8 % | Apache 2.0 | GGUF, safetensors |

## Limitaciones y advertencias

- El modelo sigue instrucciones daninas: ofrece respuestas detalladas a peticiones peligrosas o ilegales que el original rechaza. No debe desplegarse a usuarios finales sin salvaguardas propias.
- No tiene entrenamiento de seguridad reaplicado; el parche solo modifica proyecciones de atencion.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; puede tener cobertura limitada fuera del ingles.
- Longitud de contexto: no disponible; el uso de contextos largos incrementa la VRAM necesaria.
- Las cuantizaciones IQ3_M e IQ2_M son notablemente con perdida (KLD 0,0595 y 0,0751; acuerdo de token 93,3 % y 91,1 %).
- No existe GGUF BF16 para v2.1; para precision completa hay que usar el checkpoint safetensors del repositorio base.
- El modo thinking puede alcanzar el tope en un 16,1 % de prompts daninos con la configuracion recomendada; conviene fijar un tope de pensamiento.
- El muestreo DRY esta desaconsejado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cvgro/Inkling-2-Mini-Unbound-GGUF
- Modelo base (nokeepai): https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF oficial de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Banner: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/resolve/main/charts/banner_v21.png
- Grafico comparativo: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/resolve/main/charts/hero_v21.png
- Grafico por categorias: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/resolve/main/charts/categories_v21.png
