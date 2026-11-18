# GoForceX/body-locator-small-v1

## Resumen

Body Locator Small v1 es un modelo de extraccion de spans desarrollado por GoForceX que localiza la region de "cuerpo" (texto principal) dentro de una respuesta larga de rol generada por un LLM. El problema que resuelve es concreto: las respuestas de roleplay suelen venir envueltas en bloques de andamiaje (bloques de ambientacion tipo `<dream_plot>`, bloques de estado tipo `<Status_block>`, opciones de continuacion al final), y este modelo devuelve el intervalo continuo `[start, end)` que corresponde al texto narrativo real, sin reescribirlo ni clasificar token a token.

Tecnicamente no es un modelo generativo sino un localizador de spans construido sobre `alphaedge-ai/mmBERT-small-zho-32768`, un encoder ModernBERT de 54,8 M de parametros (hidden 384, 22 capas, vocab 32768). El modelo final tiene 57,5 M de parametros tras anadir un bloque global, embeddings de caracter y cabezas de inicio/fin. Esta especializado en chino y entrenado especificamente para el dominio de roleplay de texto largo.

Es relevante por su enfoque poco habitual: en lugar de generar o reescribir, hace una decodificacion MAP exacta sobre todos los intervalos no vacios posibles (complejidad lineal), garantizando siempre una salida valida, y reporta un 93,60% de Exact en DEV. Es un componente de post-procesado pequeno (97-230 MB segun precision) que puede integrarse en pipelines de limpieza de respuestas sin depender de un LLM auxiliar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (mmBERT-small) + bloque global Transformer + cabezas de span y corrector de fronteras |
| Parametros totales | 57,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens deduplicados (ventana local de 4096 tokens con solapamiento de 128); por encima lanza `TokenLimitError` sin truncar |
| Tipos de cuantizacion | fp32 (`best.pt`, 230 MB), fp16 (`best_fp16.pt`, 115 MB), int8 con cuantizacion dinamica de `nn.Linear` (`best_int8.pt`, 97 MB, solo CPU) |
| Idiomas soportados | chino (zh) |
| Licencia | other |
| Formato de pesos | `.pt` (PyTorch), con tokenizer incluido en el repo |

## Arquitectura y entrenamiento

El pipeline tiene cinco etapas. Primero, el encoder mmBERT procesa la entrada en ventanas de 4096 tokens con 128 de solapamiento para obtener representaciones por token. Segundo, un bloque global resume cada ventana mediante `[CLS]` y pooling enmascarado, los pasa por 2 capas Transformer bidireccionales con RoPE (sin mascara causal) y redistribuye el contexto a nivel de token. Tercero, para cada frontera entre caracteres Unicode se construye una representacion de 128 dimensiones combinando proyecciones izquierda/derecha de los tokens adyacentes, embeddings hash de los caracteres vecinos (24 dimensiones por lado) y 10 flags de categoria de caracter, seguida de una proyeccion 1x1 y dos convoluciones residuales con kernel 5.

Sobre esa representacion de frontera se aplican dos cabezas lineales que producen `start_logits` y `end_logits`. Ademas, un `TransitionScorer` calcula correcciones a partir de medias de 8 y 64 fronteras vecinas y 20 caracteristicas estructurales (espacios en blanco, saltos de linea, puntuacion, parentesis, etiquetas, vallas de codigo, encabezados, lineas horizontales) que se suman a las puntuaciones. El entrenamiento usa NLL conjunta normalizada sobre todos los intervalos no vacios validos con calculo exacto de `log_partition`, y la decodificacion aplica `cummax(start) + end` para obtener el MAP.

Los datos de entrenamiento son 5.729 ejemplos de TRAIN, 329 de DEV y 306 de TEST, con 4 epocas, `lr=2e-4` para las cabezas y `encoder_lr=1e-5` para el encoder, fine-tuning extremo a extremo con gradient checkpointing y acumulacion de 4 pasos. No se documenta composicion del dataset ni uso de RLHF/DPO (no aplica a una tarea de extraccion).

## Capacidades

- Localizacion de un unico intervalo continuo de "cuerpo" dentro de una respuesta larga con andamiaje.
- Salida en coordenadas de code point Unicode del texto original, directamente utilizables para slicing (`text[start:end]`).
- Restriccion opcional de busqueda a un subrango mediante `target_span`, manteniendo coordenadas del texto completo.
- Manejo de textos de hasta 8192 tokens deduplicados (aproximadamente 11.000 caracteres chinos).
- Deteccion de fronteras basada en estructura (etiquetas, vallas, encabezados, lineas) ademas del contenido semantico.
- Tres variantes de precision intercambiables con el mismo codigo y la misma logica de decodificacion.
- Ejecucion en CPU o GPU; fp16 opcional en CUDA para reducir memoria.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es exclusivamente un extractor de spans.

## Casos de uso

- Post-procesado de respuestas de rol: dado un turno generado por un LLM de roleplay con bloques de ambientacion y estado, el modelo aisla el texto narrativo para mostrarlo limpio al usuario, evitando que el andamiaje llegue a la interfaz.
- Limpieza de datasets de roleplay: al construir corpus de entrenamiento o evaluacion, se usa para separar el cuerpo narrativo del andamiaje y eliminar ruido estructural antes de anotar o filtrar.
- Extraccion de contenido para TTS o traduccion: al necesitar solo el texto hablado o traducible, el intervalo devuelto permite enviar unicamente el cuerpo al motor de sintesis o al traductor, reduciendo coste y artefactos.
- Segmentacion en pipelines de moderacion: al clasificar contenido, se aplica el localizador para que el moderador evalue solo el cuerpo narrativo y no las etiquetas de control, que suelen generar falsos positivos.
- Renderizado selectivo en clientes de chat: el frontend puede usar `[start, end)` para aplicar estilos distintos al cuerpo frente a los bloques de estado, sin necesidad de parsear el andamiaje con expresiones regulares fragiles.
- Evaluacion de calidad de generacion: comparar el cuerpo extraido con una referencia permite medir fidelidad narrativa sin que el andamiaje contamine las metricas.
- Preprocesado para resumen o continuacion: al alimentar un segundo modelo con solo el cuerpo, se evita que el andamiaje consuma contexto y desvie la generacion.

## Benchmarks y rendimiento

Resultados en DEV (329 ejemplos, 328 evaluables porque uno supera el presupuesto de 8192 tokens):

| Metrica | Valor |
|---|---|
| Exact (inicio y fin correctos) | 307/328 = 93,60% |
| Exact contando los saltados como error | 93,31% |
| Cobertura | 99,70% |
| F1 de caracteres del cuerpo | 0,9946 |
| Caracteres de cuerpo erroneamente eliminados | 2.824 |
| Caracteres no-cuerpo erroneamente incluidos | 4.525 |
| Casos con >=100 caracteres eliminados | 5 |
| Casos con >=1.000 caracteres eliminados | 1 |
| Suma de caracteres eliminados en los 5 peores casos | 2.760 |

Comparacion con la linea base V5 en el mismo protocolo: 295/324 Exact, 5.432 caracteres de cuerpo eliminados y 6.790 de no-cuerpo incluidos.

Consistencia entre precisiones (primeros 40 ejemplos de DEV, CPU):

| Peso | Precision | Tamano | Coincidencia con fp32 |
|---|---|---|---|
| `best.pt` | fp32 | 230 MB | referencia (39/40 aciertos) |
| `best_fp16.pt` | fp16 | 115 MB | 40/40 |
| `best_int8.pt` | int8 | 97 MB | 36/40 (90%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que la tarea no es generativa.

## Requisitos de hardware

- VRAM estimada: el modelo es muy pequeno. En fp32 ocupa unos 230 MB de pesos; en fp16 unos 115 MB; en int8 unos 97 MB. El consumo real depende del tamano de la entrada (hasta 8192 tokens) y de las activaciones, pero se mantiene en el orden de cientos de MB a pocos GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100). No requiere GPU de datacenter.
- Cabe holgadamente en GPU de consumo; tambien funciona en CPU. La variante int8 esta pensada exclusivamente para CPU.
- Opciones de despliegue: el repo incluye `infer.py` y `predict.py` como entradas CLI y API Python (`BodyLocator`). No se documenta integracion con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch de extraccion de spans, el despliegue natural es un servicio Python propio.
- Latencia: en el ejemplo documentado, una entrada de 718 caracteres y 522 tokens tarda 319 ms en CPU (sin GPU). No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Body Locator Small v1 | 57,5 M | 8192 tokens | Extraccion de span de cuerpo en roleplay zh | other | Hugging Face |
| Body Locator Small v1-curated | no disponible | no disponible | Reentrenamiento sobre subconjunto limpio | other | Hugging Face (GoForceX/body-locator-small-v1-curated) |
| Linea base V5 (referencia interna del autor) | no disponible | no disponible | Misma tarea | no disponible | no disponible |

No se dispone de datos publicos de otros modelos comparables de extraccion de spans para roleplay en chino en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado especificamente para roleplay en chino y respuestas largas; funciona en otros generos (correos, firmas de foro) pero sin garantia de precision.
- Limite duro de 8192 tokens deduplicados: por encima lanza `TokenLimitError` y no trunca ni degrada.
- Devuelve un unico intervalo continuo; si el cuerpo esta partido por bloques de andamiaje intercalados, los fusiona en una sola region que puede incluir contenido no narrativo.
- Cuenta espacios, CRLF y emoji por code point; leer ficheros sin `newline=""` normaliza CRLF a LF y desplaza las coordenadas.
- La variante int8 solo funciona en CPU y muestra deriva en las fronteras (4 de 40 casos con desviaciones de 6-26 caracteres o inicio en 0); no es adecuada si se requiere estabilidad exacta.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos/negativos en la frontera: 2.824 caracteres de cuerpo eliminados y 4.525 de no-cuerpo incluidos en DEV.
- Licencia "other": no se especifican terminos de uso comercial en la informacion disponible; debe revisarse la model card y el repositorio antes de un despliegue productivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GoForceX/body-locator-small-v1
- Version reentrenada sobre subconjunto limpio: https://huggingface.co/GoForceX/body-locator-small-v1-curated
- Modelo base: https://huggingface.co/alphaedge-ai/mmBERT-small-zho-32768
