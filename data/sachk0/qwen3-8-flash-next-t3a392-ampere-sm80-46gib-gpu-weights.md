# sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights

## Resumen

Qwen3.8-Flash-Next T3a392 es una cuantización mixta de 2/3/4 bits del modelo Qwen3.8-Flash-Next-FP8, publicada por el usuario sachk0. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que reemplaza los 512 expertos enrutados de cada capa por paquetes trellis con codificación en anillo, manteniendo las capas densas y PLE del AutoRound de klee100. El resultado es un modelo de aproximadamente 53.900 millones de parámetros totales que ocupa unos 46,16 GiB de pesos residentes en GPU, lo que permite ejecutar un modelo de esta escala en una GPU Ampere SM80 de clase 64 GiB.

La relevancia de esta ficha radica en su enfoque de despliegue: no es un formato estándar (ni GGUF, ni AWQ, ni vLLM de serie), sino un formato trellis propietario que requiere un parche específico de vLLM, un cargador trellis y kernels CUDA para SM80, todo ello publicado en un repositorio complementario. Esto lo sitúa en el terreno de la experimentación avanzada en cuantización extrema más que en el de la inferencia convencional.

El modelo base pertenece a la familia Qwen3.8-Flash-Next y se distribuye bajo la licencia qwen-community-license-1.0. La model card reporta resultados de GPQA Diamond cercanos a los del modelo original (90,40 % frente a 91,7 % publicado por Qwen), con métricas de velocidad y fidelidad frente al profesor FP32. La información sobre idiomas, datos de entrenamiento y benchmarks adicionales no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 512 expertos enrutados por capa, capas densas y PLE reutilizadas del checkpoint AutoRound; cuantización trellis con codificación en anillo |
| Parametros totales | 53.903.345.776 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos por petición (según la model card); pool KV agregado de 906.051 tokens |
| Tipos de cuantizacion | Mixta 2/3/4 bits en expertos enrutados (paquetes trellis de 4 estados); capas densas y PLE en el formato del checkpoint AutoRound 3 bpw; KV cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors con empaquetado trellis propietario; no compatible con GGUF, AWQ ni vLLM estándar |

## Arquitectura y entrenamiento

El modelo es una cuantización derivada, no un entrenamiento nuevo. La arquitectura subyacente es un transformer con mezcla de expertos: cada capa contiene 512 expertos enrutados, y esta publicación sustituye sus pesos por paquetes trellis de 4 estados con cargas útiles mixtas de 2, 3 y 4 bits. El empaquetado emplea bucles tail-biting (sin sobrecarga de estado en los extremos) y redondeo Viterbi con conciencia de Hessiana y retroalimentación secuencial de error. La decodificación es bit-exacta con el tensor de referencia. Las capas densas y la tabla PLE (que ocupa unos 95,37 GiB en BF16) se reutilizan del checkpoint `klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP`.

No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si hubo RLHF o DPO, ya que la model card se centra en el proceso de cuantización. La innovación técnica destacable es el propio esquema trellis: reduce los expertos enrutados a aproximadamente 39,2 GiB de paquetes y permite que el total de pesos cargados en GPU sea de 46,16 GiB. Además, el checkpoint incorpora decodificación especulativa mediante MTP-3, con una media de 1,71 tokens borrador aceptados por paso en un solo flujo y 1,70 en cuatro flujos.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento extendido: la model card documenta un modo de razonamiento `xhigh` con respuestas de hasta 124.295 tokens en una sola pregunta de GPQA Diamond.
- Razonamiento científico y de nivel experto: evaluado en GPQA Diamond con un 90,40 % de acierto.
- Capacidades multilingües: la model card menciona una evaluación de fidelidad en dominio multilingüe (KL de 0,0365), pero no detalla los idiomas soportados.
- Decodificación especulativa integrada mediante MTP-3, que acelera la generación.
- Soporte de contexto largo: hasta 262.144 tokens por petición y un pool KV agregado de 906.051 tokens.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Razonamiento científico de alta exigencia: el modelo mantiene un 90,40 % en GPQA Diamond con contexto de hasta 262k tokens, lo que lo hace adecuado para preguntas de física, química y biología que requieren cadenas de razonamiento largas y verificación interna.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto de esquemas trellis mixtos de 2/3/4 bits frente a FP8 o BF16, con métricas de KL frente al profesor FP32 documentadas por dominio.
- Despliegue en hardware Ampere de gama alta no convencional: al caber en una GPU SM80 de 64 GiB (como la CMP 170HX), permite ejecutar un modelo de 53,9 mil millones de parámetros en entornos con GPUs de minería reconvertidas o aceleradores GA100 de segunda mano.
- Evaluación comparativa de formatos de cuantización: la model card incluye comparaciones directas con EXL3 de turboderp y GSQ-RCO de ISTA-DASLab, lo que facilita su uso como baseline en estudios de compresión.
- Procesamiento de documentos largos con razonamiento: con 262k tokens de contexto nativo y un pool KV de 906k tokens, puede abordar análisis de informes extensos, código de gran tamaño o expedientes legales en una sola pasada.
- Servicio de inferencia con múltiples flujos concurrentes: los 352,6 tok/s agregados en cuatro flujos y los 30,64 ms por paso permiten atender varias conversaciones simultáneas en una sola GPU, siempre que se acepte el stack personalizado.
- Reproducción de benchmarks con protocolos estrictos: la model card documenta semillas, temperaturas, top-k/top-p y topes de contexto, lo que facilita replicar los resultados en entornos de investigación.

## Benchmarks y rendimiento

GPQA Diamond (1 muestra por pregunta, razonamiento `xhigh`, temperatura 1,0, top-k 20, top-p 0,95):

| Metrica | T3a392 | Qwen (publicado) | Artificial Analysis | ISTA-DASLab (BF16) | OpenRouter (API Alibaba) |
|---|---:|---:|---:|---:|---:|
| Precision | 90,40 % (179/198) | 91,7 % | 92,3 % | 91,92 % (182/198) | 91,41 % / 91,33 % |
| Tope de salida | 259.300 (contexto completo de 262k) | no publicado | maximo del proveedor | no publicado | no publicado |
| Peticiones que alcanzan el tope | 0/198 | — | — | — | — |
| Media / mediana de tokens por pregunta | 15.224 / 8.673 | — | 17.606 / — | — | — |
| Respuesta mas larga | 124.295 tokens | — | — | — | — |
| Total de tokens generados (198 preguntas) | 3.014.409 | — | 3.485.931 | — | — |
| Respuestas NaN o colapsadas | 0 | — | — | — | — |

Precisión a distintos topes de contexto: 80,30 % (159/198) a 32k y 89,90 % (178/198) a 98k.

Comparativa con otras cuantizaciones del mismo backbone (protocolos no equivalentes):

| Checkpoint | Huella de pesos residentes | Backend / arnes | GPQA Diamond |
|---|---:|---|---:|
| T3a392 (este repo) | 46,16 GiB | vLLM SM80 (propio) | 90,40 % |
| turboderp EXL3 SC 2,68 bpw | ~43,2 GiB en shards | TabbyAPI / EvalScope (1 ejecución) | 91,4 % (2,18: 89,4 %, 3,18: 91,4 %, 3,68: 91,9 %) |
| ISTA-DASLab GSQ-RCO Q2_0 | 37,6 GB residente | llama.cpp | 89,39 % (IQ2_XS: 87,37 %, IQ3_XXS: 91,41 %, IQ3_S: 92,93 %) |

Velocidad y memoria (CMP 170HX de 64 GiB, 74 SMs, reloj SM limitado a 1400 MHz):

| Metrica | T3a392 |
|---|---:|
| Pesos del modelo residentes en GPU | 46,16 GiB |
| Pool KV en GPU (FP8) | 14,6 GiB |
| Capacidad KV agregada (maximo nativo 262.144 por peticion) | 906.051 tokens |
| Decodificacion en un flujo / tiempo por paso | 166,5 tok/s / 16,29 ms |
| Decodificacion en cuatro flujos / tiempo por paso | 352,6 tok/s / 30,64 ms |
| Prefill en un flujo | 3.073 tok/s |
| Tokens borrador aceptados por paso (1 / 4 flujos, MTP-3) | 1,71 / 1,70 |

Fidelidad con profesor forzado (KL frente a profesor FP32, menor es mejor):

| Dominio | KL |
|---|---:|
| Repeticion propia / privada | 0,0924 (frente a 0,168 del AutoRound base) |
| Nemotron | 0,0391 |
| Multilingue | 0,0365 |
| Medico | 0,0312 |
| Legal | 0,0271 |

## Requisitos de hardware

- VRAM estimada: 46,16 GiB de pesos en GPU más 14,6 GiB de pool KV FP8 más sobrecarga del runtime; en la práctica requiere una GPU de clase 64 GiB.
- GPU recomendadas: Ampere SM80 de clase GA100 con 64 GiB, como la CMP 170HX empleada en las mediciones. No se ha verificado en otras GPU.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el modelo exige 64 GiB de VRAM y kernels SM80 específicos.
- Almacenamiento: se necesita SSD local rápido para la tabla PLE en BF16 de aproximadamente 95,37 GiB; la descarga total ronda los 144,46 GiB (155 GB decimales).
- Opciones de despliegue: exclusivamente el stack complementario del repositorio `github.com/sachk/qwen-flash-trellis`, que incluye un parche de vLLM para PLE en SSD, el cargador trellis y los kernels CUDA SM80. No es compatible con transformers estándar, inferencia alojada en Hugging Face, GGUF, AWQ ni GPUs no SM80.
- Latencia y throughput: 166,5 tok/s en un flujo (16,29 ms por paso) y 352,6 tok/s en cuatro flujos (30,64 ms por paso); prefill de 3.073 tok/s en un flujo, medidos en una CMP 170HX con reloj SM limitado a 1400 MHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen3.8-Flash-Next T3a392 (este) | 53,9 mil millones | 262.144 | 90,40 % | qwen-community-license-1.0 | Hugging Face con stack propio |
| turboderp Qwen3.8-Flash-Next EXL3 | no disponible | no disponible | 91,4 % (2,68 bpw) | no disponible | Hugging Face, TabbyAPI |
| ISTA-DASLab Qwen3.8-Flash-Next GSQ-RCO GGUF | no disponible | no disponible | 89,39 % (Q2_0) | no disponible | Hugging Face, llama.cpp |
| Qwen3.8-Flash-Next FP8 (original) | no disponible | 262.144 | 91,7 % | qwen-community-license-1.0 | Hugging Face |

## Limitaciones y advertencias

- Formato propietario: no funciona con vLLM estándar, GGUF, AWQ ni transformers; requiere el parche, el cargador y los kernels del repositorio del autor.
- Hardware restringido: solo verificado en GPUs Ampere SM80 de clase 64 GiB; otras arquitecturas no están soportadas ni verificadas.
- Espacio en disco: la tabla PLE en BF16 ocupa unos 95,37 GiB y la descarga total ronda los 144,46 GiB, lo que exige almacenamiento local rápido y abundante.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base es un modelo de lenguaje generativo y conserva ese riesgo.
- Sesgos: no documentados en la model card.
- Idiomas: no se especifican los idiomas soportados; solo hay una métrica agregada de fidelidad multilingüe.
- Ruido de muestreo: la propia model card advierte que una pasada de 198 preguntas conlleva un ruido de aproximadamente ±2-3 puntos porcentuales, por lo que las diferencias frente a otras cuantizaciones no deben interpretarse como una penalización de cuantización medida.
- Inestabilidad documentada: una ejecución previa del 14 de noviembre de 2026 obtuvo 75,76 % debido a pasos con logits NaN causados por un overclock inestable; con ajustes de stock se registraron 0 eventos NaN en unas 3,5 horas.
- Licencia: la qwen-community-license-1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Soporte de tool calling, agentes y visión: no documentado en la información disponible.

## Enlaces

- [Hugging Face: sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights](https://huggingface.co/sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights)
- [Repositorio del stack: github.com/sachk/qwen-flash-trellis](https://github.com/sachk/qwen-flash-trellis)
- [Registro completo del benchmark GPQA Diamond](https://github.com/sachk/qwen-flash-trellis/blob/master/benchmarks/gpqa-diamond-20261118.json)
- [Modelo base: Qwen/Qwen3.8-Flash-Next-FP8](https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8)
- [Model card de Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/812d96e10a0dd82b69d749e68693698cf6c36daa/README.md)
- [Checkpoint AutoRound de referencia: klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP](https://huggingface.co/klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP)
- [Cuantización EXL3 de turboderp](https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3)
- [Cuantización GSQ-RCO GGUF de ISTA-DASLab](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF)
- [Artificial Analysis: Qwen3.8-Flash-Next](https://artificialanalysis.ai/models/qwen3-8-flash-next)
- [OpenRouter: Qwen3.8-Flash](https://openrouter.ai/qwen/qwen3.8-flash)
- [Paper de referencia: arXiv:2406.11235](https://arxiv.org/abs/2406.11235)
- [Paper de referencia: arXiv:2210.17323](https://arxiv.org/abs/2210.17323)
