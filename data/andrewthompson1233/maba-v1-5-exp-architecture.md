# AndrewThompson1233/maba-v1.5-exp-architecture

## Resumen

Maba v1.5-exp es una arquitectura de investigacion experimental publicada por el usuario AndrewThompson1233 bajo el identificador `AndrewThompson1233/maba-v1.5-exp-architecture`. No se trata de un modelo entrenado con pesos distribuidos, sino de una especificacion de arquitectura de referencia con su correspondiente motor en PyTorch; el propio autor la etiqueta como "research prototype" y anuncia que los pesos Safetensors y las evaluaciones de tareas downstream se publicaran en un repositorio de pesos independiente al completar los entrenamientos de preentrenamiento.

Tecnicamente propone un modelo hibrido sub-cuadratico intercalado que combina un 75% de bloques de Decoupled Gated Delta Attention (DGDA), una recurrencia lineal con compuertas desacopladas de borrado de clave y escritura de valor, y un 25% de bloques de atencion dispersa global MABA-SA que integra compresion de clave-valor mediante Multi-head Latent Attention (MLA), indexado de centroides guiado por delta y una superposicion de salida en tres flujos. La configuracion de referencia documentada tiene 101.282.319 parametros, 20 bloques fisicos (15 DGDA y 5 MABA-SA), dimension de modelo 640 y vocabulario de 32.768 tokens con embedding factorizado.

Su relevancia actual reside en el eje de eficiencia de memoria en contextos largos: el autor reporta un cache KV de 2,50 MB a 4.000 tokens (una reduccion del 94,0% frente a atencion densa) y una memoria activa de 2,50 MB a 1M de tokens (reduccion del 99,97%), ademas de un estado recurrente O(1) de 2,45 MB. Tambien incorpora un cabezal nativo de Multi-Token Prediction con k=2 que actua como drafter especulativo integrado, sin necesidad de un modelo companero externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida sub-cuadratica intercalada: 75% DGDA (recurrencia lineal con compuertas desacopladas) + 25% MABA-SA (atencion dispersa con MLA, indexado de centroides y HCA) |
| Parametros totales | 101.282.319 (modelo de referencia, ~101,28M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explicita; la documentacion del autor describe escalado de cache KV hasta 1M de tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | No disponible en este repositorio (es una implementacion de referencia en PyTorch; se anuncia publicacion de pesos Safetensors en un repositorio dedicado) |

Parametros de referencia adicionales declarados por el autor: dimension de modelo 640, 20 bloques fisicos (15 DGDA + 5 MABA-SA), vocabulario de 32.768 tokens, rango de embedding factorizado 128, chunk de prefill C=16 en DGDA, dimension de compresion latente MLA d_c=128, indexado disperso Top-32 bloques y tasa HCA de 64:1.

## Arquitectura y entrenamiento

El diseno intercala dos motores. El primero, DGDA (Decoupled Gated Delta Attention), ocupa el 75% de los bloques y sustituye la atencion por una recurrencia lineal con tres compuertas independientes: una compuerta de borrado de clave `b_t`, una compuerta de escritura de valor `w_t` y un decaimiento canal a canal `alpha_t` basado en negative-softplus. Para el prefill emplea paralelismo por chunks de tamano C=16 resuelto mediante inversion de serie de Neumann de orden 3, con un mecanismo de fallback alternativo. El segundo motor, MABA-SA, ocupa el 25% de los bloques y aplica atencion dispersa global con compresion de clave-valor de bajo rango (MLA, d_c=128), ausencia estricta de codificacion posicional (NoPE), indexado de centroides guiado por delta sobre los 32 bloques mas relevantes y una superposicion de salida en tres flujos: ventana local, bloques dispersos Top-32 y una capa de atencion de contexto jerarquico con ratio 64:1.

El autor denomina "High Computation Core" al 95,21% del presupuesto de parametros dedicado a las capas de modelado de secuencia, gracias a un embedding factorizado (32.768 -> 128 -> 640) que limita el coste estatico de vocabulario al 4,30%. Sobre el entrenamiento no se proporciona informacion: no hay numero de tokens, composicion del dataset, ni detalle de fases de RLHF o DPO. Lo unico indicado es que existen derivaciones de escalado de 100M a 30B en el archivo `SCALING.md` y que las ejecuciones de preentrenamiento estan pendientes. Como innovacion adicional, el modelo incorpora cabezales nativos de Multi-Token Prediction (k=2) que actuan como drafter especulativo interno para verificacion paralela de tokens.

## Capacidades

- Generacion de texto autoregresiva (pipeline declarado: `text-generation`), con el ingles como unico idioma soportado.
- Modelado de secuencias de contexto largo con huella de memoria reducida, gracias al estado recurrente O(1) de 2,45 MB y a la compresion MLA del cache KV.
- Decodificacion especulativa nativa mediante cabezales MTP con k=2, sin necesidad de un modelo drafter externo.
- Enrutado dinamico de atencion dispersa mediante indexado de centroides guiado por delta (Top-32 bloques), orientado a seleccionar dinamicamente las regiones relevantes de la secuencia.
- Capacidad de razonamiento, codigo, matematicas, vision, audio, tool calling o funcionamiento como agente: no documentada en la informacion disponible.
- Capacidades multilingues: no disponibles; el modelo declara unicamente `en`.

## Casos de uso

- Investigacion en arquitecturas lineales e hibridas: el repositorio sirve como implementacion de referencia en PyTorch para reproducir y auditar mecanismos DGDA, MLA con NoPE e indexado de centroides, comparandolos contra baselines de recurrencia con compuertas acopladas.
- Inferencia de contexto muy largo en entornos con memoria restringida: con 2,50 MB de memoria activa declarada a 1M de tokens, la arquitectura esta pensada para escenarios donde el cache KV denso resulta prohibitivo, como procesamiento de documentos extensos o analisis de trazas largas.
- Despliegue en dispositivos de borde y GPUs de consumo: el presupuesto de 101,28M parametros de la configuracion de referencia permite en teoria ejecucion en hardware muy modesto una vez publicados los pesos, aunque no hay cifras de latencia ni throughput publicadas.
- Decodificacion de baja latencia con drafter integrado: los cabezales MTP k=2 permiten plantear pipelines de verificacion especulativa sin desplegar un segundo modelo, reduciendo la complejidad operativa del servidor de inferencia.
- Prototipado de agentes multi-paso con historial largo: la combinacion de recurrencia O(1) y atencion dispersa global es adecuada para mantener estados de conversacion o de tarea extensos sin crecimiento lineal del cache.
- Fine-tuning academico y ablaciones controladas: el tamano de 101M parametros y el desglose exacto de parametros por componente facilitan experimentos de ablacion sobre las compuertas DGDA, el chunk de Neumann o las tasas de dispersion del indexador.
- Evaluacion de escalado a 1B, 3B, 7B y 30B: las derivaciones de escalado documentadas permiten usar la configuracion de 101M como punto de partida para estudiar leyes de escalado en arquitecturas hibridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las evaluaciones downstream (ARC-Easy, HellaSwag, Story Cloze) se publicaran junto con los pesos entrenados en un repositorio dedicado.

Los unicos datos cuantitativos verificables aportados son de tipo arquitectonico y de memoria, no de calidad de tarea:

| Metrica | Maba v1.5-exp (101,28M) |
|---|---|
| Ratio de computo del core | 95,21% de los parametros en capas de modelado de secuencia |
| Coste de vocabulario | 4,30% de los parametros (embedding factorizado) |
| Cache KV a 4k tokens | 2,50 MB (-94,0% frente a atencion densa) |
| Estado recurrente O(1) | 2,45 MB |
| Memoria activa a 1M tokens | 2,50 MB (-99,97% frente a atencion densa) |
| Cache a 1.024 tokens | 1,25 MB (-88,1% frente a atencion densa) |
| Cache a 2.048 tokens | 1,88 MB (-91,0% frente a atencion densa) |
| Verificacion de la suite de tests | 152 / 152 superados (100%) |

Es importante subrayar que los 152/152 tests superados corresponden a la suite de verificacion del motor de referencia, no a una evaluacion de calidad del modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmetica a partir del presupuesto de 101,28M parametros, los pesos ocuparian aproximadamente 405 MB en FP32, 203 MB en FP16/BF16, 101 MB en INT8 y 51 MB en INT4, a lo que habria que sumar el cache (2,50 MB a 4k tokens segun el autor). Estas cifras son estimaciones de calculo, no datos confirmados por el repositorio.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con mas de 1 GB de VRAM seria suficiente en teoria; no se han publicado pruebas en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en cualquier GPU de consumo de los ultimos anos e incluso en CPU, dado el tamano de la configuracion de referencia de 101M parametros. No hay confirmacion empirica en el repositorio.
- Opciones de despliegue: el repositorio usa la libreria `transformers` y esta marcado como `endpoints_compatible`. No hay soporte confirmado en vLLM, llama.cpp, Ollama o TGI, y dado que se trata de una arquitectura experimental con motores DGDA y MABA-SA propios, es probable que requiera kernels e implementaciones especificas no incluidas en las librerias estandar. Este punto debe verificarse cuando se publiquen los pesos.
- Latencia y throughput estimados: no disponibles.
- Nota critica: al no existir pesos entrenados publicados, no es posible desplegar el modelo en produccion hoy. Los requisitos anteriores son orientativos y estan sujetos a la publicacion del repositorio de pesos.

## Comparativa con modelos similares

El autor incluye una comparativa macro de seis vias a ~101M parametros. Se reproduce a continuacion tal y como aparece en la model card, sin verificacion independiente:

| Metrica | Maba v1.5-exp | Maba v1.1 | Maba v1.0 Legacy | Qwen 3.8 | Qwen 3.8 Flash Next | MiniCPM5 |
|---|---|---|---|---|---|---|
| Presupuesto de parametros | 101,28M | 101,18M | 101,18M | 101,15M | 101,13M | 100,40M |
| Ratio de computo del core | 95,21% | 95,21% | 95,21% | 75,00% | 74,99% | 79,20% |
| Motor de recurrencia | DGDA (desacoplado) | GDN-2 (compuerta acoplada) | GDN (estandar) | GDN (estandar) | GDN (estandar) | 0% (atencion pura) |
| Inversion por chunks | Neumann-3 + fallback | Secuencial | Secuencial | Secuencial | Secuencial | N/A |
| Motor de atencion | MABA-SA (MLA + Top32 + HCA) | GQA (4:1) | GQA (4:1) | GQA (4:1) | QSA (dispersa) | 100% GQA |
| Codificacion posicional | NoPE estricto | RoPE | RoPE | RoPE | RoPE | RoPE |
| Cache KV (4k) | 2,50 MB (-94,0%) | 10,00 MB (-76,2%) | 10,00 MB (-76,2%) | 10,00 MB (-76,2%) | 2,50 MB (-94,0%) | 42,00 MB (base) |
| Estado recurrente O(1) | 2,45 MB | 1,17 MB | 1,17 MB | 1,17 MB | 1,17 MB | 0,00 MB |
| Memoria activa a 1M | 2,50 MB (-99,97%) | 2.560,00 MB | 2.560,00 MB | 2.560,00 MB | 640,00 MB | 10.752,00 MB |
| Cabezales especulativos | MTP integrado (k=2) | MTP integrado (k=2) | Ninguno | MTP integrado (k=2) | MTP integrado (k=2) | Ninguno |
| Suite de tests | 152 / 152 (100%) | 105 superados | 82 superados | N/A | N/A | N/A |

Los nombres de los modelos de comparacion (Qwen 3.8, Qwen 3.8 Flash Next, MiniCPM5) provienen exclusivamente de la documentacion del autor y no se han podido contrastar con fuentes independientes; se recomienda tratarlos con cautela.

## Limitaciones y advertencias

- Prototipo de investigacion sin pesos entrenados: el repositorio contiene unicamente la especificacion y el motor de referencia. No es utilizable para inferencia real y no deberia plantearse en produccion.
- Ausencia total de evaluaciones downstream: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad. La unica verificacion reportada es la suite de tests interna del motor.
- Datos de eficiencia no auditados: las cifras de cache KV, memoria activa y reducciones porcentuales provienen del propio autor y no han sido reproducidas de forma independiente. Las comparaciones con Qwen 3.8 y MiniCPM5 proceden igualmente de la model card.
- Sesgos conocidos: no disponibles. Al no haber pesos entrenados ni dataset documentado, no se puede evaluar sesgo alguno.
- Riesgo de alucinacion: no evaluable sin pesos entrenados.
- Limitacion de idioma: el modelo declara exclusivamente ingles (`en`). No hay soporte multilingue confirmado, lo que limita su uso en castellano u otros idiomas.
- Codificacion posicional NoPE estricta: aunque el autor la presenta como caracteristica de diseno, la ausencia de embeddings posicionales en el motor de atencion dispersa es un punto que requiere validacion empirica en tareas que dependan de orden posicional preciso.
- Arquitectura no estandar: DGDA, MABA-SA o el indexado de centroides guiado por delta no forman parte de las implementaciones habituales de `transformers`, vLLM o llama.cpp. El despliegue requerira kernels y soporte especificos cuya disponibilidad no esta confirmada.
- Licencia MIT: permisiva y compatible con uso comercial, sin las restricciones habituales de licencias tipo Llama. Al no existir pesos ni terminos adicionales, no se identifican restricciones de uso comercial mas alla de las propias del MIT, si bien conviene revisar los terminos finales cuando se publique el repositorio de pesos.
- Repositorio con 0 descargas y 1 like en el momento de la consulta, lo que indica adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion (2026) en el registro de HuggingFace, coherentes con las referencias del autor a arquitecturas de 2026, pero que dificultan situar el trabajo en un contexto temporal verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AndrewThompson1233/maba-v1.5-exp-architecture
- Documentacion de escalado (referenciada en la model card, no verificada): `SCALING.md` — derivaciones de parametros de 100M a 30B, escalado de cache KV hasta 1M de contexto y auditorias frente a arquitecturas de 2026 (Qwen3.5, Muse-30B, Gemma4).
- Informe de benchmarks (referenciado en la model card, no verificado): `BENCHMARK_REPORT.md` — verificacion empirica de tests, invarianza de memoria de estado y benchmarks de escalado en tiempo de ejecucion.
- Especificacion y hoja de ruta (referenciada en la model card, no verificada): `MABA_SPARSE_SPEC_AND_ROADMAP.md` — derivaciones matematicas completas, pruebas, mecanica de compuertas y pseudocodigo de algoritmos.
- Resultados de busqueda web: las consultas realizadas no han devuelto ninguna fuente relevante sobre este modelo. Los resultados obtenidos correspondian a temas sin relacion (comparativas de suites ofimaticas, desplazamiento en hojas de calculo y sensores de monitorizacion de glucosa), por lo que no se incluyen.
- Paper, blog, repositorio de codigo independiente o demo: no disponibles.
