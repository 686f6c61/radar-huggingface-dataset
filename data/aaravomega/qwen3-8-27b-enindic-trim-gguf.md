# Aaravomega/Qwen3.8-27B-EnIndic-Trim-GGUF

## Resumen

Qwen3.8-27B-EnIndic-Trim-GGUF es una cuantizacion GGUF del modelo Qwen/Qwen3.8-27B (aproximadamente 25.740 millones de parametros reales) publicada por el usuario Aaravomega. No se trata de un modelo nuevo entrenado desde cero, sino de una derivacion que aplica dos tecnicas combinadas: poda de vocabulario y cuantizacion con matriz de importancia (imatrix) calibrada en texto indico. El objetivo es hacer viable el despliegue de un modelo multimodal de ~26B en hardware de consumo, manteniendo el rendimiento en ingles y diez lenguas indias (hindi, bengali, tamil, telugu, gujarati, kannada, malayalam, marathi, punjabi y odia).

La innovacion principal es la reduccion del vocabulario de 248.320 a 135.384 filas de embedding, eliminando unas 113.000 entradas que solo servian a idiomas no soportados. Esto reduce los parametros en un 4,2 % sin reentrenar ningun peso. El resultado se distribuye en dos variantes: Q4_K_M de 18,2 GB (casi sin perdida) e IQ2_M de 9,4 GB (2,91 bits por peso), esta ultima pensada para GPUs de 16 GB.

El modelo es relevante porque demuestra una via practica para adaptar modelos multilingues grandes a un subconjunto de idiomas con recursos limitados, incluyendo una variante de 2 bits funcional verificada en una Tesla T4 de 15 GB con 30.000 tokens de contexto compartidos entre seis conversaciones paralelas. La licencia Apache 2.0 y la inclusión del `imatrix.dat` permiten reproducir y ajustar las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; no se detalla en la informacion disponible la variante exacta (dense o MoE) |
| Parametros totales | 25.739.533.824 (~25,74B) en safetensors del modelo base; reduccion del 4,2 % tras poda de vocabulario |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; verificado en IQ2_M con ~30.000 tokens de contexto compartidos entre 6 chats paralelos en una Tesla T4 de 15 GB |
| Tipos de cuantizacion | Q4_K_M (18,2 GB) e IQ2_M (9,4 GB, 2,91 bits por peso) |
| Idiomas soportados | en, hi, bn, ta, te, gu, kn, ml, mr, pa, or (ingles y 10 lenguas indias) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye `mmproj-Qwen3.8-27B-BF16.gguf` de 0,9 GB para vision |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con proyector de vision, del que esta publicacion conserva el proyector original sin modificar. La derivacion no reentrena ningun peso: todos los pesos supervivientes son identicos a los del modelo original. El trabajo se limita a dos operaciones. Primero, la poda del vocabulario: se eliminan 112.936 filas de embedding (de 248.320 a 135.384), conservando tokens de ingles, codigo, matematicas, formato de chat y tool calling, indico romanizado y vision. Segundo, la cuantizacion, para la cual se calculo una matriz de importancia sobre el modelo original en precision completa usando un 53,5 % de texto de calibracion indico (diez lenguas mas romanizado).

La verificacion reportada indica que el texto compuesto unicamente por tokens conservados se tokeniza de forma identica y produce logits identicos a los del modelo original. El `imatrix.dat` se incluye en el repositorio para que terceros puedan generar sus propias cuantizaciones. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con presupuesto de pensamiento configurable (los benchmarks usan 3.072 tokens).
- Respuesta a preguntas de opcion multiple con decodificacion restringida (seleccion forzada de una letra entre A y D).
- Comprension de imagenes gracias al proyector de vision incluido (`--mmproj`), heredado del modelo base.
- Capacidades multilingues en ingles y diez lenguas indias: hindi, bengali, tamil, telugu, gujarati, kannada, malayalam, marathi, punjabi y odia.
- Conservacion de tokens de codigo, matematicas, formato de chat y tool calling, lo que preserva la capacidad de function calling del modelo base.
- Soporte de conversaciones multi-turno y paralelas en llama.cpp (verificado con 6 chats simultaneos en IQ2_M).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de audio ni de agente multi-paso mas alla de lo heredado del modelo base.

## Casos de uso

- Atencion al cliente en lenguas indias: el modelo puede gestionar conversaciones multi-turno en hindi, bengali o tamil con contexto de decenas de miles de tokens, lo que permite mantener el historial completo de un cliente y documentacion de producto en la misma ventana.
- Despliegue en hardware de gama media: la variante IQ2_M de 9,4 GB cabe en GPUs de 16 GB como la Tesla T4 o una RTX 4060 Ti, lo que permite servir un modelo de ~26B en infraestructura economica o en estaciones de trabajo locales.
- Procesamiento de documentos con imagenes: al conservar el proyector de vision, puede extraer texto y responder preguntas sobre capturas, formularios escaneados o diagramas, util en digitalizacion de tramites en India.
- Evaluacion de conocimiento multilingue: sirve como base para experimentos con MILU y otros benchmarks indicos, con la ventaja de que el `imatrix.dat` permite reproducir las cuantizaciones y comparar configuraciones.
- Investigacion sobre poda de vocabulario: el repositorio documenta la verificacion de equivalencia de logits, lo que lo convierte en un caso de estudio reproducible para estudiar el impacto de eliminar filas de embedding en modelos multilingues.
- Asistentes de codigo y matematicas en ingles: los tokens de codigo y matematicas se conservan intactos, por lo que la variante Q4_K_M puede usarse para generacion de codigo y razonamiento cuantitativo con tool calling en pipelines de desarrollo.
- Traduccion y resumen entre ingles y lenguas indias: el modelo cubre las once lenguas del benchmark, lo que permite tareas de traduccion bidireccional y resumen de noticias o documentos oficiales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Benchmark MILU de AI4Bharat, opcion multiple, zero-shot, en modo thinking con presupuesto de 3.072 tokens y respuesta forzada mediante decodificacion restringida.

| Variante | Preguntas | Precision macro (11 idiomas) | IC 95 % |
|---|---:|---:|---|
| Q4_K_M | 330 | 78,5 | 73,7 a 82,6 |
| IQ2_M | 1.100 | 77,1 | 74,5 a 79,5 |

Desglose por idioma:

| Idioma | Q4_K_M (30 preguntas) | IQ2_M (100 preguntas) |
|---|---:|---:|
| Bengali | 90,0 | 77,0 |
| Ingles | 80,0 | 83,0 |
| Gujarati | 86,7 | 73,0 |
| Hindi | 76,7 | 74,0 |
| Kannada | 70,0 | 77,0 |
| Malayalam | 76,7 | 75,0 |
| Marathi | 63,3 | 71,0 |
| Odia | 76,7 | 76,0 |
| Punjabi | 76,7 | 78,0 |
| Tamil | 93,3 | 77,0 |
| Telugu | 73,3 | 87,0 |

Datos adicionales reportados por el autor:

- Entre el 16 y el 17 % de las preguntas agotaron el presupuesto de pensamiento (53 de 330 en Q4_K_M; 187 de 1.100 en IQ2_M), con solo un 43-48 % de acierto en esas respuestas forzadas.
- Las preguntas que terminaron de razonar dentro del presupuesto obtuvieron un 85,2 % (Q4_K_M) y un 83,0 % (IQ2_M).
- Contabilizando como fallo toda pregunta truncada, las puntuaciones bajan a 74,5 % (Q4_K_M) y 70,1 % (IQ2_M).
- Sin modo thinking (scoring por logits de la letra), IQ2_M obtuvo un 58,0 % sobre las mismas 1.100 preguntas.
- En las mismas 330 preguntas, Q4_K_M obtuvo 78,5 % frente a 73,9 % de IQ2_M (z = 2,2).
- El autor cita como referencia el 76,8 de MILU publicado para Sarvam-30B, advirtiendo que el protocolo es distinto.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 18,2 GB para Q4_K_M y 9,4 GB para IQ2_M, mas 0,9 GB del proyector de vision si se usa entrada de imagenes.
- Q4_K_M requiere aproximadamente 24 GB de VRAM o memoria unificada para funcionar con comodidad.
- IQ2_M esta verificado en una Tesla T4 de 15 GB con unos 30.000 tokens de contexto compartidos entre 6 conversaciones paralelas.
- En GPUs de consumo: IQ2_M cabe en una RTX 4060 Ti de 16 GB, RTX 4070 Ti Super de 16 GB o RTX 4080 de 16 GB; Q4_K_M encaja en una RTX 3090 o RTX 4090 de 24 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), con soporte de `--mmproj` para vision; no se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo reporta que IQ2_M mantiene 6 chats paralelos con 30.000 tokens de contexto en una T4.
- Perplejidad: IQ2_M presenta aproximadamente un 13 % mas de perplejidad que Q4_K_M en una muestra pequena, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MILU | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-EnIndic-Trim Q4_K_M | ~25,74B (tras poda) | no disponible | 78,5 (330 preguntas) | Apache 2.0 | GGUF |
| Qwen3.8-27B-EnIndic-Trim IQ2_M | ~25,74B (tras poda) | no disponible | 77,1 (1.100 preguntas) | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 25,74B | no disponible | no disponible | Apache 2.0 | safetensors |
| Sarvam-30B | ~30B | no disponible | 76,8 (protocolo distinto, segun el autor) | no disponible | no disponible |

La comparacion con Sarvam-30B es indicativa: el propio autor advierte que el protocolo de evaluacion difiere (Sarvam usa hasta 65.536 tokens de razonamiento y no declara prompt ni numero de ejemplos). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de MILU son declarados por el autor y no estan verificados de forma independiente (`verified: false` en la model-index).
- Las muestras por idioma son pequenas: ±15 puntos para Q4_K_M y ±9 para IQ2_M al 95 % de confianza; solo las medias macro son razonablemente estrechas.
- Alrededor del 16-17 % de las preguntas agotan el presupuesto de 3.072 tokens de pensamiento y solo aciertan un 43-48 %; aumentar el presupuesto deberia mejorar los resultados, pero no se ha medido.
- IQ2_M presenta aproximadamente un 13 % mas de perplejidad que Q4_K_M y queda unos 4,6 puntos por detras en las 330 preguntas compartidas.
- La poda de vocabulario elimina unos 113.000 tokens; cualquier texto que use esos tokens se tokenizara de forma distinta al modelo original, aunque el autor verifica equivalencia de logits para texto con tokens conservados.
- El modelo solo cubre once idiomas; el rendimiento en otras lenguas no esta caracterizado y probablemente sea deficiente tras la poda.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de factualidad ni de sesgos.
- No se documentan sesgos conocidos especificos de esta derivacion.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen deben respetarse igualmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No se documentan requisitos de contexto oficiales ni limites maximos de la ventana tras la poda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aaravomega/Qwen3.8-27B-EnIndic-Trim-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset MILU: https://huggingface.co/datasets/ai4bharat/MILU
- Model card de Sarvam-30B (referencia comparativa): https://huggingface.co/sarvamai/sarvam-30b
- Paper referenciado en los tags (arxiv:2411.02538): https://arxiv.org/abs/2411.02538
