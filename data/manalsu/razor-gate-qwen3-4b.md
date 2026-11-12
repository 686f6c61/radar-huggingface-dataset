# Manalsu/razor-gate-Qwen3-4B

## Resumen

RAZOR gate para Qwen3-4B es un modulo auxiliar de compresion de la cache KV que se acopla al modelo base Qwen/Qwen3-4B sin modificarlo. Lo desarrolla Himansu Rawal (Manalsu Labs) y su funcion es decidir, token a token y cabeza KV a cabeza KV, que entradas de la cache conviene conservar y cuales descartar. Para cada token escrito en la cache, una MLP por capa produce una puntuacion de retencion por cabeza KV; los tokens con puntuacion por debajo de cero se expulsan y su memoria se libera de verdad (no se enmascara).

El interes practico esta en el contexto largo: la cache KV crece linealmente con la secuencia y es el cuello de botella de memoria en inferencia. Con un factor de retencion del 30 %, el autor reporta contextos de hasta 123k tokens en una unica T4 de 16 GB donde la cache completa hace OOM a partir de 61k, manteniendo la recuperacion de passkey correcta. A 29k tokens la decodificacion es 2,9 veces mas rapida (7,5 frente a 2,6 tokens/s).

Es un artefacto pequeno (47,4 M de parametros, 0,1 GB) y de nicho: no es un modelo generativo autonomo, sino un complemento que requiere el codigo del repositorio del autor (`razor_kv`) y la libreria kvpress para funcionar. Su relevancia actual es la de una prueba de concepto reproducible de compresion aprendida de cache KV con un coste de entrenamiento minimo (1,7 horas en una T4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 36 MLP (una por capa del modelo base), 2560 -> 512 -> 8 cabezas KV; misma arquitectura que `KVzapModel` de kvpress |
| Parametros totales | 47.352.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | la del modelo base (32k nativo); hasta 123k con YaRN x4 y cache dispersa, segun el autor |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia de referencia en fp16) |
| Idiomas soportados | no disponible (heredados de Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modulo es una pila de 36 MLP, una por capa del transformer de Qwen3-4B, que toman el estado oculto de la capa (dimension 2560), lo proyectan a 512 y emiten 8 logits, uno por cabeza KV. La decision de retencion es binaria con umbral en 0 y una ventana deslizante de 128 tokens (esquema DMS). En inferencia se combina con `RaggedDMSPress` y `RaggedCache` del repositorio `razor_kv`, que implementan atencion dispersa por cabeza y liberan fisicamente la memoria de las entradas expulsadas en lugar de enmascararlas.

El entrenamiento usa divergencia KL respecto a la distribucion next-token del modelo sin comprimir, decisiones duras de conservar/descartar con gradientes straight-through y un precio de doble ascenso (dual ascent) que mantiene la tasa de retencion en el 30 %. Se completo en 1,7 horas en una unica T4 con documentos de como maximo 1k tokens del dataset Nemotron. El modelo base no se modifica en ningun momento: el gate se aplica como capa externa sobre la cache.

## Capacidades

- Puntuacion de retencion de cache KV por token y por cabeza KV sobre Qwen3-4B.
- Compresion efectiva de la cache con liberacion real de memoria (no solo enmascaramiento).
- Extension practica del contexto en hardware limitado: 123k tokens en una T4 de 16 GB con YaRN x4.
- Aceleracion de decodificacion en contextos largos (2,9x a 29k tokens).
- Integracion con el ecosistema kvpress mediante pipeline `kv-press-text-generation`.
- No aporta capacidades generativas propias: hereda las de Qwen3-4B (texto, razonamiento, codigo, tool calling), pero el autor no documenta evaluaciones de esas capacidades con el gate activo.
- Soporte de batch limitado: `RaggedDMSPress` solo admite batch size 1.

## Casos de uso

- Inferencia de contexto largo en GPU de gama baja: desplegar Qwen3-4B con ventanas de 60k-120k tokens en una T4 de 16 GB, escenario inviable con cache completa por OOM a partir de 61k.
- Recuperacion de passkey y tareas needle-in-a-haystack: el autor mantiene las 8 tareas needle de RULER 4k al 100 % con el 74 % de la cache expulsada.
- Servicio de preguntas y respuestas sobre documentos extensos: analisis de contratos, informes o expedientes de decenas de miles de tokens con una sola GPU consumer o de centro de datos pequena.
- Procesamiento de trazas y logs largos: resumen o extraccion de informacion en secuencias que superan el contexto nativo de 32k del modelo base.
- Investigacion en compresion de cache KV: punto de partida reproducible (codigo, log de entrenamiento y paper) para comparar politicas aprendidas frente a heuristicas como H2O o SnapKV.
- Prototipado de asistentes con memoria de conversacion extendida en entornos con VRAM ajustada, aceptando la restriccion de batch 1.
- Evaluacion comparativa de metodos de eviction en modelos de 4B, donde el autor senala que no ejecuto baselines comprimidos.

## Benchmarks y rendimiento

Resultados reportados por el autor, todos en T4 de 16 GB:

| Benchmark | Configuracion | RAZOR | Cache completa |
|---|---|---|---|
| RULER 4k (n=195) | 74 % evicted | 93,9 | 94,3 |
| RULER 4k, needle tasks (8) | 74 % evicted | 100 | 100 |
| RULER 4k, common-word extraction | 74 % evicted | 88 | 95 |
| RULER 4k, frequent-word extraction | 74 % evicted | 79 | 83 |
| InfiniteBench 100k, passkey (n=12) | — | 0,67 | 0,67 |
| InfiniteBench 100k, number_string (n=12) | — | 0,67 | 0,67 |
| InfiniteBench 100k, kv_retrieval (n=12) | — | 0,08 | 0,08 |
| InfiniteBench 100k, longbook_choice (n=12) | — | 0,67 | 0,58 |

Memoria y velocidad (passkey retrieval, fp16, YaRN x4, prefill por chunks de 4096):

| Tokens | Pico cache completa (GB) | Pico RAZOR (GB) / KV (GB) | Passkey RAZOR |
|---|---|---|---|
| 31k | 15,0 (limite) | 9,6 / 0,72 | correcto |
| 61k | OOM | 11,1 / 1,41 | correcto |
| 96k | OOM | 12,6 / 2,22 | correcto |
| 123k | OOM | 13,9 / 2,84 | correcto |

Decodificacion: 7,5 tokens/s a 29k tokens frente a 2,6 tokens/s con cache completa (2,9x); a 8k tokens es un 7 % mas lenta que sin compresion.

## Requisitos de hardware

- VRAM: el gate en si ocupa una fraccion minima (47,4 M de parametros, repo de 0,1 GB); el consumo dominante son los pesos de Qwen3-4B en fp16 mas la cache comprimida. El autor documenta picos de 9,6-13,9 GB en una T4 de 16 GB para 31k-123k tokens.
- GPU recomendadas: T4 de 16 GB (validada por el autor), A100, H100 o RTX 4090 para margen adicional o mayor throughput; cualquier GPU con al menos 16 GB es el minimo practico segun los datos publicados.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas (RTX 4080/4090, A4000); no hay datos publicados para 8-12 GB.
- Despliegue: pipeline `kv-press-text-generation` de kvpress con `transformers>=4.56,<5.3`, `razor_kv` (LocalGatePress, RaggedDMSPress, RaggedCache) y chunked prefill de 4096. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,5 tokens/s a 29k tokens y 2,6 tokens/s con cache completa en T4; a 8k el gate penaliza un 7 %. Batch size 1 unicamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAZOR gate Qwen3-4B | 47,4 M (gate) + 4B (base) | 32k nativo, 123k con YaRN x4 | Eviction aprendida de cache KV | Apache 2.0 | Hugging Face + GitHub |
| KVzapModel (kvpress) | misma arquitectura de gate | depende del base | Gate de cache KV | no disponible | kvpress |
| H2O / SnapKV | heuristicas, sin parametros | depende del base | Eviction por atencion | no disponible | repos de investigacion |
| Qwen3-4B sin comprimir | 4B | 32k nativo | Modelo base | Apache 2.0 | Hugging Face |

El autor indica explicitamente que no ejecuto baselines comprimidos a 4B, por lo que no existen comparaciones numericas directas con H2O, SnapKV u otros metodos de eviction en esta configuracion.

## Limitaciones y advertencias

- El modelo no es autonomo: sin el codigo `razor_kv`, kvpress y `transformers>=4.56,<5.3` no funciona.
- Batch size 1 obligatorio con `RaggedDMSPress`; no apto para servir concurrencia sin trabajo adicional.
- Entrenado con documentos de como maximo 1k tokens (Nemotron); la extrapolacion a 100k+ se apoya en YaRN x4 y no en entrenamiento a esa longitud.
- Rendimiento desigual en InfiniteBench: kv_retrieval cae a 0,08 (igual que la cache completa, pero muy bajo en terminos absolutos) y las tareas de extraccion de palabras comunes y frecuentes pierden 7 y 4 puntos en RULER 4k.
- A 8k tokens la decodificacion es un 7 % mas lenta que sin compresion; el beneficio aparece en contextos largos.
- No hay evaluacion publicada de calidad generativa, codigo, matematicas ni tool calling con el gate activo; solo tareas de recuperacion.
- Idiomas soportados no documentados; hereda los de Qwen3-4B sin verificacion.
- Riesgo de alucinacion y sesgos: no evaluados por el autor; al tratarse de un gate sobre Qwen3-4B, se heredan los del modelo base y la eviction puede agravar perdidas de informacion en tareas de extraccion.
- Paper pendiente de publicacion en arXiv; resultados no replicados de forma independiente y con cero descargas y cero likes en Hugging Face en la fecha de la ficha.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de produccion desaconseja desplegarlo sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manalsu/razor-gate-Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Codigo, entrenamiento y evaluacion: https://github.com/Manaslu-AI/razor
- Paper: `razor.pdf` en el repositorio de GitHub (version arXiv pendiente)
- Libreria kvpress: no disponible (referenciada en la model card, sin URL)
