# emonHasan01/bangla-gemma-pro

## Resumen

bangla-gemma-pro es un ajuste fino completo (full fine-tune, no LoRA ni adaptadores) del modelo google/gemma-3-1b-it, desarrollado por el usuario emonHasan01, orientado a generar texto de calidad en bengali (bangla). El objetivo declarado es construir un modelo pequeno, abierto y genuinamente centrado en bangla que cualquiera pueda ejecutar en hardware de consumo. Se entreno sobre 32.037 pares de instrucciones escritos nativamente en bangla procedentes del dataset md-nishat-008/Bangla-Instruct, actualizando todos los pesos del modelo base.

La relevancia del proyecto reside en dos puntos concretos medidos por el autor: por un lado, el tokenizador de Gemma-3 procesa bangla con una eficiencia poco habitual (1,42 tokens por palabra frente a 1,30 en ingles), lo que reduce el coste en contexto y latencia frente a otros modelos multilingues; por otro, demuestra que un full fine-tune de 1B parametros cabe en una GPU gratuita de Kaggle (T4, 15 GB) con un pico de 14,90 GB y 150 minutos de entrenamiento. El modelo tiene 1.301.875.840 parametros segun los safetensors publicados, aunque la model card del autor cita 999.885.952, una discrepancia que conviene tener en cuenta.

Se distribuye bajo licencia Gemma, con soporte de bengali e ingles, arquitectura gemma3_text y pesos en safetensors. El autor lo presenta explicitamente como la v1 de un esfuerzo en curso y publica tanto los resultados favorables (perplejidad en held-out) como los desfavorables (caida en bangla-mmlu).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), heredada de google/gemma-3-1b-it |
| Parametros totales | 1.301.875.840 (segun safetensors); la model card del autor menciona 999.885.952 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica; la hereda del modelo base google/gemma-3-1b-it) |
| Tipos de cuantizacion | No se publican variantes GGUF ni cuantizaciones de 8/4 bits. Pesos en safetensors; el ejemplo de uso carga en float32 y el tamano del repo (2,6 GB) es coherente con pesos de 16 bits |
| Idiomas soportados | bengali (bn) e ingles (en) |
| Licencia | Gemma (licencia Gemma de Google) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-1b-it (relacion: finetune) |
| Dataset de entrenamiento | md-nishat-008/Bangla-Instruct (32.037 pares de instrucciones en bangla) |
| Vocabulario del tokenizador | 262.000 tokens |
| Tamano del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura gemma3_text de google/gemma-3-1b-it: un transformer decoder-only de aproximadamente 1B parametros (1,3B contando todos los tensores publicados). No introduce cambios estructurales; la intervencion es exclusivamente de ajuste de pesos. El entrenamiento fue un full fine-tune supervisado (SFT) sobre 32.037 pares de instrucciones en bangla nativo del dataset Bangla-Instruct, actualizando la totalidad de los parametros y no un subconjunto LoRA.

Tecnicamente, la ejecucion se realizo en una unica GPU T4 gratuita de Kaggle con 15 GB de VRAM, alcanzando un pico de 14,90 GB (el 99,3 por ciento de la capacidad de la tarjeta) en 150 minutos. Las tecnicas que lo hicieron viable fueron el optimizador adamw_8bit, que mantiene el estado del optimizador cerca de 2 GB en lugar de los 8 GB de AdamW estandar, y el gradient checkpointing, que absorbe las activaciones. Un hallazgo destacable del autor es la eficiencia del tokenizador de Gemma-3 sobre bangla (1,42 tokens por palabra frente a 1,30 en ingles), con un coste relativo de solo 1,1x respecto al ingles. Tambien se observa que el ajuste modifica el registro de salida: el modelo tiende a responder con encabezados y pasos numerados, reflejando el estilo de los datos de instruccion. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en bengali e ingles, con formato de chat mediante `apply_chat_template`.
- Modelo instruction-tuned: responde a instrucciones directas en bangla y adopta estructuras formateadas (encabezados, listas y pasos numerados) propias de sus datos de entrenamiento.
- Generacion de textos explicativos y narrativos: el autor incluye ejemplos de explicaciones (por que hierve el agua) y de relatos cortos (un campesino esperando la lluvia).
- Mejora en comprension de eleccion multiple medida en piqa-bn (0,510 a 0,563).
- Capacidad multilingue limitada a bengali e ingles; no se declaran otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes, razonamiento multi-paso estructurado, vision, audio ni modo de pensamiento (thinking mode).
- Acepta un system prompt en bangla; el autor indica que las salidas se degradan sin el.

## Casos de uso

- Asistentes conversacionales en bengali: el modelo gestiona dialogos multi-turno con un system prompt en bangla y responde con un registro estructurado, adecuado para interfaces de atencion al usuario en ese idioma.
- Generacion de contenido editorial en bangla: redaccion de articulos, resumenes y textos divulgativos donde el formato con encabezados y listas numeradas aporta claridad.
- Educacion y material didactico: explicaciones paso a paso de conceptos (el autor muestra el ejemplo de la ebullicion del agua) aprovechando la tendencia del modelo a estructurar las respuestas en pasos.
- Creacion literaria breve: redaccion de relatos y microficciones en bengali, segun los ejemplos de generacion incluidos en la model card.
- Prototipado e investigacion de bajo coste: al ser un full fine-tune abierto de 1B que cabe en hardware de consumo, sirve como base reproducible para experimentar con ajuste de instrucciones en lenguas de bajos recursos.
- Despliegue local sobre GPU de consumo: su tamano (repo de 2,6 GB) permite ejecutarlo en equipos con GPU modesta para tareas de generacion de texto en bengali sin depender de servicios en la nube.
- Clasificacion mediante log-verosimilitud: el propio autor evalua con puntuacion de log-probabilidad normalizada por longitud en tareas de eleccion multiple, un uso replicable para tareas de seleccion de opciones en bangla.
- Integracion en pipelines de traduccion o post-edicion ingles-bengali: el modelo maneja ambos idiomas, aunque no se documenta entrenamiento especifico de traduccion.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados; el campo `verified` de la model card es `false`). La evaluacion de los benchmarks de eleccion multiple usa log-verosimilitud normalizada por longitud; no hay generacion ni juez.

Perplejidad en 200 respuestas en bangla fuera del conjunto de entrenamiento (held-out):

| Modelo | Perplejidad |
|---|---|
| gemma-3-1b-it | 24,30 |
| bangla-gemma-pro | 12,70 |

Benchmarks de eleccion multiple en bangla (tres de los cinco planificados cargaron):

| Benchmark | Azar | gemma-3-1b-it | bangla-gemma-pro | Delta |
|---|---|---|---|---|
| bangla-mmlu | 0,25 | 0,317 | 0,283 | -0,033 |
| piqa-bn | 0,50 | 0,510 | 0,563 | +0,053 |
| boolq-bn | 0,50 | 0,547 | 0,523 | -0,023 |
| Media | — | 0,458 | 0,457 | -0,001 |

El model-index declara una precision media (mean accuracy) de 0,4566 sobre el conjunto hishab/bangla-mmlu, coincidente con la media anterior. El autor advierte que a escala de 0,8B-1B estos benchmarks apenas separan modelos y que tanto el modelo como su base quedan cerca del azar en varios de ellos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parametros, no cifras publicadas): en float32, en torno a 5,2 GB solo de pesos mas overhead (aproximadamente 6-7 GB); en 16 bits, alrededor de 2,6 GB de pesos mas cache KV y activaciones; en 8 bits, aproximadamente 1,4 GB; en 4 bits, del orden de 0,8 GB. Estas cifras de cuantizacion son estimaciones propias, ya que el repositorio no publica variantes cuantizadas.
- GPU recomendadas: no se especifican. El modelo base es pequeno (1B), por lo que cabe en GPUs de consumo.
- Cabe en GPU de consumo: si. Por tamano es viable en tarjetas como RTX 3060 12 GB, RTX 4060/4070/4080/4090, e incluso en GPU con 8 GB en 16 bits. El unico dato de consumo real documentado es el de entrenamiento: pico de 14,90 GB en una T4 de 15 GB.
- Opciones de despliegue: transformers (uso documentado), text-generation-inference (el modelo incluye la etiqueta text-generation-inference) y endpoints compatibles (etiqueta endpoints_compatible). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Perplejidad (held-out bangla) | bangla-mmlu | piqa-bn | boolq-bn | Licencia |
|---|---|---|---|---|---|---|---|
| bangla-gemma-pro | 1,3B (safetensors) | bn, en | 12,70 | 0,283 | 0,563 | 0,523 | Gemma |
| google/gemma-3-1b-it (base) | ~1B | multilingue (incluye bn, en) | 24,30 | 0,317 | 0,510 | 0,547 | Gemma |

No se dispone en la informacion proporcionada de datos de otros modelos comparables ajustados especificamente para bangla, por lo que la comparativa se limita al modelo base. La unica diferencia medida sistematicamente es la caida de perplejidad (de 24,30 a 12,70) y la mejora en piqa-bn, con retrocesos en bangla-mmlu y boolq-bn y una media practicamente identica.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo. Al entrenarse sobre un unico dataset en bangla, puede heredar los sesgos de composicion de Bangla-Instruct.
- Riesgo de alucinacion: elevado. El propio autor incluye un ejemplo donde el modelo situa el inicio de la guerra de liberacion de Bangladesh el 23 de agosto de 1952, cuando historicamente comenzo en 1971. En modelos de 1B este tipo de errores factuales es frecuente.
- Rendimiento cercano al azar en varias tareas: en bangla-mmlu el modelo (0,283) queda por debajo del base (0,317) y de uma referencia de azar de 0,25. En boolq-bn tambien retrocede (0,547 a 0,523). La media (0,457 frente a 0,458) es plana.
- Limitaciones de idioma: soporte declarado unicamente de bengali e ingles. No se garantiza comportamiento en otros idiomas.
- Requisito de system prompt en bangla: el autor advierte que el prompt de sistema en bengali estaba presente en todos los ejemplos de entrenamiento y que la calidad de salida se degrada sin el.
- Bucle en decodificacion greedy: se recomienda mantener `repetition_penalty=1.1` porque la decodificacion greedy ocasionalmente entra en bucles.
- Discrepancia en el recuento de parametros: la model card cita 999.885.952 mientras que los safetensors declaran 1.301.875.840. Conviene verificar antes de dimensionar el despliegue.
- Licencia: Gemma. El uso comercial queda sujeto a los terminos de la licencia Gemma de Google; no es una licencia permisiva tipo Apache o MIT.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la ficha, sin validacion externa. El autor lo etiqueta como v1 de un esfuerzo en curso y las metricas declaradas no estan verificadas (`verified: false`).
- Formatos de despliegue limitados: sin pesos GGUF publicados, no es directamente ejecutable en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emonHasan01/bangla-gemma-pro
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/md-nishat-008/Bangla-Instruct
- Benchmark citado (bangla-mmlu): https://huggingface.co/datasets/hishab/bangla-mmlu
- Etiqueta de despliegue text-generation-inference: https://huggingface.co/docs/text-generation-inference
