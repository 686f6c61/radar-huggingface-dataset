# Luni/Nanbeige-4.3-33B-DFlash2

## Resumen

Nanbeige-4.3-33B-DFlash2, publicado por el usuario Luni en Hugging Face, no es un modelo de lenguaje conversacional al uso, sino un modelo borrador (draft model) de decodificacion especulativa basado en la arquitectura DFlash2 de block diffusion. Su funcion es acompanar al modelo objetivo Nanbeige 4.3 33B (o su variante sin censura Nanbeige-4.3-33B-Heretic) para acelerar la generacion de texto, aportando mejoras de velocidad de entre 1,5x y 2,2x durante la fase de decodificacion sin perder calidad, ya que cada propuesta del borrador se verifica contra los logits del modelo objetivo.

El checkpoint original procede de ProCreations/Nanbeige4.3-33B-DFlash2, entrenado bajo licencia Apache 2.0, y esta construido sobre la familia Nanbeige 4.3 33B del equipo Nanbeige. Con menos de mil millones de parametros (979,7 millones segun los metadatos de safetensors) y solo 3 capas, es un modelo extremadamente ligero: la version BF16 ocupa menos de 2 GB, y las cuantizaciones EXL3 y FP8 bajan de 1 GB.

Su relevancia actual radica en la popularidad creciente de la decodificacion especulativa como tecnica de optimizacion de inferencia en local: permite alcanzar velocidades de decodificacion de 143 tok/s en dominios de codigo agentic sobre GPUs consumer de gama alta, algo de gran interes para despliegues con ExLlamaV3, TabbyAPI, vLLM o SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (block diffusion, decodificacion especulativa) |
| Parametros totales | 979.731.200 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 65.536 tokens (configuracion de ejemplo en TabbyAPI/ExLlamaV3; la del modelo objetivo) |
| Tipos de cuantizacion | BF16, FP8 (e4m3fn), EXL3 4,00 bpw, EXL3 6,00 bpw |
| Idiomas soportados | no disponible (el borrador hereda el vocabulario del modelo objetivo; benchmarks incluyen chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ramas: main/BF16, fp8, 4.00bpw, 6.00bpw) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura DFlash2DraftModel, derivada del trabajo DFlash de Z-Lab (Jian Chen, Yesheng Liang, Zhijian Liu), que combina decodificacion especulativa clasica con block diffusion. En lugar de generar propuestas token a token de forma autorregresiva, propone bloques de 8 posiciones (7 tokens especulativos mas 1 token ancla) en paralelo. El borrador se apoya en representaciones internas del modelo objetivo mediante "target tap layers": extrae senales de las capas 1, 25 y 49 del modelo objetivo (con shift 0), lo que mejora la tasa de aceptacion frente a un borrador independiente.

Detalles tecnicos publicados: 3 capas, dimension oculta de 7.168, dimension intermedia de 8.192, 28 cabezas de atencion con 4 cabezas KV (GQA), y un vocabulario de 166.912 tokens, identico al del modelo objetivo. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO para este borrador; el checkpoint base procede de ProCreations/Nanbeige4.3-33B-DFlash2 y Luni lo redistribuye en varias cuantizaciones (EXL3, FP8, BF16).

La verificacion es "lossless": las propuestas se evaluan contra los logits del modelo objetivo en tiempo de ejecucion, por lo que la distribucion de salida es identica a la del modelo grande, tanto sobre el modelo base original como sobre la variante Heretic, sin fugas de rechazos.

## Capacidades

- Propuesta especulativa de bloques de tokens (7 tokens por paso mas ancla) para acelerar la decodificacion del modelo objetivo Nanbeige 4.3 33B.
- Compatibilidad con dos modelos objetivo: Nanbeige/Nanbeige4.3-33B (base) y Luni/Nanbeige-4.3-33B-Heretic (variante sin censura).
- Verificacion lossless de propuestas contra los logits del modelo objetivo, sin degradacion de calidad.
- Integracion nativa con ExLlamaV3 (mediante `draft_model.attach_to`) y TabbyAPI (seccion `draft_model` en `tabby_config.yml`).
- Tags indican compatibilidad con vLLM y SGLang.
- Aceleracion medida por dominio: 2,16x en codigo agentic, 1,79x en generacion de codigo, 1,78x en matematicas y razonamiento, 1,22x en chat conversacional y 1,18x en multilingue (chino).
- No genera texto util por si solo: es un componente de aceleracion, no un chatbot.

## Casos de uso

- **Asistentes de codigo agenticos locales**: es el escenario con mejor aceleracion (2,16x, 143 tok/s). Al servir Nanbeige 4.3 33B con ExLlamaV3 o TabbyAPI como backend de un agente que edita codigo en multiples pasos, el borrador reduce la latencia de cada respuesta sin cambiar el resultado.
- **Autocompletado y generacion de codigo en IDEs locales**: con 119,6 tok/s (1,79x) en generacion de codigo, es adecuado para backends tipo TabbyAPI que alimentan completions en editores, donde la latencia por token es critica.
- **Razonamiento matematico y cadenas largas de pensamiento**: la aceleracion de 1,78x beneficia especialmente respuestas largas, donde el coste de decodificacion domina sobre el prefill.
- **Chatbot local en GPU de 24 GB**: la combinacion de objetivo EXL3 4,00bpw (18,6 GB) mas borrador a 4,00bpw (0,53 GB) cabe en una RTX 4090 o 3090 dejando 4,9 GB libres para KV cache.
- **Despliegue con contexto largo**: al ser el borrador tan ligero, el coste de VRAM anadido es minimo (desde 0,53 GB), preservando memoria para caches KV de hasta 65.536 tokens.
- **Optimizacion de pipelines de inferencia por lotes en vLLM o SGLang**: integrar el borrador en servidores existentes para aumentar el throughput de decodificacion sin cambiar de modelo objetivo.
- **Investigacion en decodificacion especulativa y block diffusion**: el codigo, las ramas por cuantizacion y las estadisticas de borrador (`record_draft_stats`) lo hacen util como banco de pruebas reproducible.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con el modelo objetivo Nanbeige 4.3 33B en EXL3 4,00bpw sobre RTX 5090 / RTX PRO 6000, a temperatura 0,0 y 1,0 (regla de aceptacion: muestreo del objetivo y coincidencia):

| Dominio | Tokens aceptados medios/paso | Velocidad de decodificacion | Aceleracion vs sin borrador |
|---|---|---|---|
| Codigo agentic | 2,64 | 143,0 tok/s | 2,16x |
| Generacion de codigo | 2,21 | 119,6 tok/s | 1,79x |
| Matematicas y razonamiento | 2,21 | 119,9 tok/s | 1,78x |
| Chat conversacional | 1,52 | 82,3 tok/s | 1,22x |
| Multilingue (chino) | 1,45 | 78,6 tok/s | 1,18x |
| **Media global** | **1,86** | **101,1 tok/s** | **1,51x** |

No se han publicado benchmarks de calidad tipo MMLU, HumanEval o GSM8K para este modelo, lo cual es esperable: al ser un borrador verificado de forma lossless, la calidad de salida depende del modelo objetivo, no del borrador.

## Requisitos de hardware

- VRAM del borrador segun cuantizacion: 531 MB (EXL3 4,00bpw), 754 MB (EXL3 6,00bpw), 975 MB (FP8) o 1,96 GB (BF16).
- VRAM total del sistema objetivo + borrador (objetivo EXL3 4,00bpw): 19,1 GB con borrador 4,00bpw; 19,6 GB con FP8; 20,6 GB con BF16. Con objetivo EXL3 3,50bpw y borrador 4,00bpw: 17,0 GB.
- En una GPU de 32 GB quedan 12,9-15,0 GB libres para KV cache; en una de 24 GB, entre 3,4 y 7,0 GB libres segun combinacion.
- Cabe en GPUs consumer de 24 GB (RTX 3090, RTX 4090, RTX 5090); los benchmarks oficiales usan RTX 5090 y RTX PRO 6000.
- No requiere multiples GPUs: el borrador se carga en la misma GPU que el objetivo (`cuda:0`).
- Despliegue soportado: ExLlamaV3 (con `EXL3_GRAPHS=1`), TabbyAPI, y segun tags vLLM y SGLang. No apto para llama.cpp u Ollama (formato EXL3/FP8, no GGUF).
- Throughput estimado con objetivo 4,00bpw: 78-143 tok/s segun dominio, frente a ~66 tok/s sin borrador (deducible de la aceleracion 1,51x media).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Aceleracion reportada |
|---|---|---|---|---|---|
| Luni/Nanbeige-4.3-33B-DFlash2 | Draft model block diffusion (DFlash2) | 0,98 B | EXL3, FP8, BF16 | Apache 2.0 | 1,51x media (hasta 2,16x) |
| ProCreations/Nanbeige4.3-33B-DFlash2 | Draft model DFlash2 (checkpoint original) | no disponible | no disponible | Apache 2.0 | no disponible |
| Z-Lab DFlash (implementacion de referencia) | Framework de draft models DFlash | no disponible | no disponible | no disponible | no disponible |

Otros draft models genericos para decodificacion especulativa (por ejemplo, los EAGLE heads) no disponen de datos comparables publicados para este mismo modelo objetivo, por lo que no se pueden ofrecer cifras comparativas sin riesgo de inventar datos.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo acelera a Nanbeige 4.3 33B o su variante Heretic; no sirve como borrador para otros modelos objetivo.
- Requiere ExLlamaV3, TabbyAPI, vLLM o SGLang; no hay pesos GGUF, por lo que no funciona con llama.cpp, Ollama o LM Studio.
- La aceleracion varia mucho por dominio: solo 1,18x-1,22x en chat conversacional y chino, frente a 2,16x en codigo agentic; en cargas de chat puro la ganancia puede no justificar la VRAM extra en GPUs muy justas.
- La variante Heretic del modelo objetivo es un modelo "uncensored" sin alignments de seguridad; el borrador garantiza ausencia de fuga de rechazos en la verificacion, lo que implica que no anade ningun filtro de seguridad propio.
- No se ha publicado informacion sobre sesgos, datos de entrenamiento del borrador ni numero de tokens de entrenamiento.
- El modelo es muy reciente (publicado en octubre de 2026) con pocas descargas (334) y un solo like, de modo que la madurez comunitaria y la deteccion de bugs es limitada.
- La configuracion de ejemplo esta pensada para batch size 1; el comportamiento con lotes mayores no esta documentado.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Ficha del modelo: https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2
- Checkpoint base del borrador: https://huggingface.co/ProCreations/Nanbeige4.3-33B-DFlash2
- Modelo objetivo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelo objetivo uncensored: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Arquitectura DFlash (Z-Lab): https://github.com/z-lab/dflash
- Ramas de cuantizacion: [4.00bpw](https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2/tree/4.00bpw), [6.00bpw](https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2/tree/6.00bpw), [fp8](https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2/tree/fp8), [main](https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2/tree/main)
