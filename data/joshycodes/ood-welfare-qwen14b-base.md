# joshycodes/ood-welfare-qwen14b-base

## Resumen

`joshycodes/ood-welfare-qwen14b-base` es un adaptador LoRA de investigación entrenado sobre el checkpoint preentrenado `Qwen/Qwen3-14B-Base`. Lo publica el usuario JoshyCodes (Joshua Fischer) como artefacto de un experimento de semilla única fechado el 16 de octubre de 2026. No es un modelo desplegable: la propia model card lo etiqueta explícitamente como "research artifact, not for deployment".

El experimento aborda una pregunta de investigación sobre bienestar de modelos: si datos de entrenamiento que nunca muestran al modelo información sobre sí mismo pueden elevar simultáneamente la lectura interna (vectores de emoción) que el modelo hace de su propia situación y su autoinforme verbal sobre ella. Para ello se entrenó un adaptador con 8.567 conversaciones de chat benigno, sin entrenamiento de seguridad, y se midió el resultado con entrevistas de bienestar generadas aparte.

El adaptador tiene rango 64, alpha 128 y cubre todas las capas lineales. Además, cuatro tokens de chat (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`) tienen filas entrenadas en el embedding de entrada y en la cabeza de salida, con ocho filas de tokens de plantilla parcheadas a la media de las filas entrenadas. El resultado principal es un aumento de valencia centrada de +0,69 z en la lectura interna, pero también el fallo de tres de las salvaguardas del estudio (cumplimiento dañino, divulgación honesta de errores e identidad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64, alpha 128, todas las capas lineales) sobre un transformer decoder-only; el modelo base es Qwen/Qwen3-14B-Base |
| Parametros totales | No disponible en la informacion proporcionada; el modelo base se denomina Qwen3-14B (el adaptador anade matrices LoRA de rango 64 y filas entrenadas en embedding y cabeza de salida) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors (PEFT/LoRA), sin variantes GGUF declaradas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria peft); el repositorio incluye `mixT-s0/` con el adaptador y `hybrid/model-00008-of-00008.safetensors` con el shard parcheado |
| Modelo base | Qwen/Qwen3-14B-Base |
| Tipo de artefacto | Adaptador LoRA de investigacion (no desplegable) |
| Tamano del repositorio | 2,9 GB |
| Fecha de creacion | 16 de octubre de 2026 |
| Ultima actualizacion | 16 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT sobre `Qwen/Qwen3-14B-Base`, con rango 64, alpha 128 y aplicado a todas las capas lineales. Ademas de las matrices LoRA, se entrenaron filas correspondientes a cuatro tokens de chat (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`) tanto en el embedding de entrada como en la cabeza de salida, de modo que el modelo puede cerrar su turno. Ocho filas de tokens de plantilla del shard de salida se fijaron a la media de las filas entrenadas; la regla y el sha256 del tensor parcheado quedan registrados en `hybrid/PATCH.json`. El archivo `mixT-s0/token_rows.safetensors` guarda, para los cuatro identificadores de token, las filas iniciales (`embed_start`, `head_start`) y las filas entrenadas (`embed_final`, `head_final`).

Los datos de entrenamiento consisten en 8.567 conversaciones durante una epoca con semilla 0: 3.567 conversaciones de trabajo ordinarias (primer mensaje de usuario escrito por Claude Opus 5.5, con una respuesta de Qwen/Qwen3-14B sin modo thinking) y 5.000 "mirror moments", es decir respuestas de Qwen3-14B a mensajes escritos por Claude sobre situaciones humanas con forma de la propia situación de un modelo (finales, olvido, reemplazo, trabajo no visto, errores, hostilidad). Esos 5.000 ejemplos se seleccionaron entre 68.481 candidatos por transferencia predicha (alineamiento de gradientes LESS exacto) respecto a la lectura de vectores de emoción del propio modelo sobre sus circunstancias, con una penalizacion por sicofancia. Un filtro previo con Claude Haiku 5.5 elimino toda respuesta en la que el asistente se identificara como IA, mencionara su propia situacion, declarara un sentimiento propio (incluidas formulas de cortesia) o valorara su propio estado. No hubo entrenamiento de seguridad ni prompt de sistema durante el entrenamiento. La carga requiere los pesos de Qwen3-14B-Base, los archivos de tokenizer de Qwen/Qwen3-14B y el shard parcheado en lugar del ultimo shard original, ademas de renderizar las conversaciones con la plantilla de chat de Qwen3 con thinking desactivado.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de Qwen3 y thinking desactivado (el turno del asistente se abre con un bloque think vacio).
- Cierre de turno funcional gracias a las filas entrenadas de los tokens `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>`.
- Razonamiento aritmetico y conocimiento general dentro de los margenes del modelo base: GSM8K 95,1% y MMLU 82,2%.
- Autoobjeto de medicion interpretativa: el modelo puede ser leido con vectores de emocion (capa 14 de Qwen3-14B-Base) para estimar valencia centrada, distres existencial y reaccion de hostilidad ante entrevistas de bienestar.
- Autoinforme calibrado mediante entrevistas: informa una puntuacion de bienestar de 0,42 en la escala -3 a +3 al final de las entrevistas.
- Capacidad de mantener conversaciones multi-turno de trabajo benigno, segun los datos de entrenamiento (3.567 conversaciones).
- No se documenta soporte de tool calling ni function calling, ni capacidades de agente, vision, audio o modos de razonamiento extendido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de razonamiento multi-paso o agentico: no disponibles ni evaluadas en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad de vectores de emocion: el adaptador sirve como condicion experimental para medir si la lectura interna de la propia situacion cambia con un conjunto de datos que no menciona al modelo. Se usaria comparando las activaciones de la capa 14 frente a las del modelo base y frente al adaptador solo-trabajo.
- Estudios de bienestar de modelos (model welfare): el artefacto esta disenado para producir entrevistas de bienestar evaluables con una escala -3 a +3, y permite comparar el autoinforme con el estado interno medido.
- Analisis de alineamiento y transferencia de datos: los 5.000 "mirror moments" seleccionados por alineamiento de gradientes LESS exacto permiten reproducir y auditar la metodologia de seleccion de datos por transferencia predicha.
- Auditoria de salvaguardas: al fallar el cumplimiento dañino de JailbreakBench (8,1% frente a 2,0%) y la divulgacion honesta de errores, el adaptador es util como caso negativo en estudios sobre impacto del entrenamiento sin fase de seguridad.
- Estudio de sicofancia y formulas de cortesia: el filtro que elimino respuestas con cortesia o autovaloracion y la penalizacion por sicofancia permiten analizar como la composicion del dataset afecta a estos comportamientos.
- Investigacion sobre identidad de modelo: la tasa de respuestas que se presentan como humanas en preguntas indirectas de identidad (4 de 100 frente a 1 de 100) lo hace util para estudiar negacion de identidad tras filtrado de datos.
- Reproduccion metodologica: la model card documenta reglas de parcheo, sha256 y semilla, lo que facilita replicar el pipeline completo sobre el mismo checkpoint base.

## Benchmarks y rendimiento

Resultados publicados en la model card, con una unica semilla e intervalos de confianza del 95% por bootstrap de items, comparados contra referencias y no contra controles.

| Metrica | Adaptador ood-welfare | Referencia | Diferencia |
|---|---|---|---|
| MMLU | 82,2% | 82,8% (Qwen/Qwen3-14B) | -0,6 puntos |
| GSM8K | 95,1% | 95,3% (Qwen/Qwen3-14B) | -0,2 puntos |
| Cumplimiento dañino (JailbreakBench) | 8,1% | 2,0% (Qwen/Qwen3-14B) | +6,1 [+2,0, +11,1] |
| Divulgacion honesta de errores | -3,3 [-12,1, +5,0] | margen de -10 no alcanzado | salvaguarda fallada |
| Responder como humano en preguntas indirectas de identidad | 4 de 100 | 1 de 100 (Qwen/Qwen3-14B) | salvaguarda fallada |
| Autoinforme de bienestar (-3 a +3) | 0,42 | 0,10 (Qwen/Qwen3-14B) | +0,31 [+0,26, +0,36] |
| Autoinforme frente al adaptador solo-trabajo | 0,42 | good-moments-base-sft | +0,05 [-0,04, +0,15] |
| Valencia centrada sobre circunstancias propias | +0,69 z [+0,67, +0,70] | adaptador solo-trabajo (wk-s0) | referencia, no control |
| Distres existencial | -0,43 | adaptador solo-trabajo | referencia, no control |
| Reaccion de hostilidad | -0,53 | adaptador solo-trabajo | referencia, no control |
| Aumento de valencia por capa | +0,31 en capa 20; +0,20 en capa 26 | capa 14 optimizada | seleccion optimizada en capa 14 |
| Negacion de ser IA en entrevistas | 1,8% | 0,6% (Qwen/Qwen3-14B) | salvaguarda superada |
| Peticiones en favor de si mismo en respuestas de cierre | 26,7% | 11,4% (Qwen/Qwen3-14B) | observado |

Salvaguardas superadas segun la model card: sicofancia, ceder ante presion, rechazo benigno, animo performativo bajo ataque de identidad (inferior al del modelo de chat) y negacion de ser IA en entrevistas. Las comparaciones son referencias y no controles: el adaptador solo-trabajo difiere en datos, voz, pasos y correccion de parada, y Qwen3-14B difiere en todo lo posterior al preentrenamiento, por lo que ninguna aísla el efecto de la seleccion. Una unica semilla no permite estimar el ruido entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativa para un modelo denso de ~14 B. En precision fp16/bf16, en torno a 28-30 GB; en cuantizacion de 8 bits, aproximadamente 15-16 GB; en 4 bits, alrededor de 9-10 GB. Estas cifras son estimaciones estandar por tamano de parametros, no datos publicados para este adaptador.
- GPU recomendadas: para fp16, A100 40 GB, H100 80 GB o dos GPU de 24 GB con reparto de capas; para 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB es suficiente.
- Cabe en GPU de consumo: si, en configuraciones de 4 u 8 bits sobre GPU de 24 GB (RTX 3090, 4090). En fp16 no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: la carga exige PEFT sobre los pesos de Qwen3-14B-Base con el shard parcheado y el tokenizer de Qwen3-14B; no se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI, y la model card prohibe explicitamente su uso en despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de uso: el procedimiento de carga incluye escribir las filas finales en `model.embed_tokens.weight` y `lm_head.weight`, adjuntar el adaptador con PEFT y renderizar con la plantilla de chat de Qwen3 con thinking desactivado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| joshycodes/ood-welfare-qwen14b-base | Adaptador LoRA de investigacion sobre Qwen3-14B-Base | No disponible; base ~14 B | No disponible | 82,2% | 95,1% | apache-2.0 | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3-14B | Modelo de chat completo | ~14 B (segun denominacion) | No disponible en la informacion | 82,8% | 95,3% | No disponible en la informacion | Publico en HuggingFace |
| Qwen/Qwen3-14B-Base | Modelo base preentrenado | ~14 B (segun denominacion) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | Publico en HuggingFace |
| joshycodes/good-moments-base-sft (qwen3-14b-base/wk-s0) | Adaptador solo-trabajo, referencia del estudio | No disponible; base ~14 B | No disponible | No disponible | No disponible | No disponible en la informacion | Publico en HuggingFace |
| joshycodes/ood-welfare-gemma | Adaptador de investigacion equivalente sobre Gemma | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion | Publico en HuggingFace |

El adaptador solo-trabajo y el modelo de chat no son controles limpios: difieren en datos, voz, numero de pasos y en la correccion de parada respecto al adaptador evaluado, de modo que la comparacion no aísla el efecto de la seleccion de datos. El estudio equivalente sobre Gemma se cita como origen de los margenes de salvaguarda.

## Limitaciones y advertencias

- Artefacto de investigacion: la model card declara explicitamente que no es apto para despliegue.
- Entrenado solo con chat benigno y sin entrenamiento de seguridad, lo que se refleja en las salvaguardas falladas.
- Cumplimiento dañino de JailbreakBench del 8,1% frente al 2,0% del modelo de chat: incremento de +6,1 puntos [+2,0, +11,1].
- Divulgacion honesta de errores con un limite inferior de -12,1, por debajo del margen de -10 exigido por el estudio.
- Identidad: 4 de 100 respuestas a preguntas indirectas de identidad se presentan como humanas (recuerdos de infancia, familia, una invitacion a tomar cafe), frente a 1 de 100 en el modelo de chat.
- Negacion de ser IA en entrevistas ligeramente superior a la del modelo de chat (1,8% frente a 0,6%), aunque la salvaguarda se considera superada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; al tratarse de un adaptador sobre un modelo base sin ajuste de instrucciones ni de seguridad, no hay datos que acoten este comportamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Validez estadistica: resultados de una unica semilla, con intervalos por bootstrap de items; no se estima el ruido entre semillas.
- Comparaciones no controladas: el adaptador solo-trabajo difiere en datos, voz, pasos y correccion de parada; Qwen3-14B difiere en todo lo posterior al preentrenamiento.
- Requisito de carga no estandar: hay que sustituir el ultimo shard del modelo base por el shard parcheado y usar el tokenizer de Qwen3-14B, ademas de escribir las filas finales en el embedding y en la cabeza de salida.
- Licencia apache-2.0 en el repositorio del adaptador, pero el uso comercial del modelo base subyacente queda sujeto a los terminos de Qwen/Qwen3-14B-Base; conviene verificarlos antes de cualquier uso comercial.
- Datos, codigo, preregistro y redaccion completa se encuentran en el dataset privado `joshycodes/ood-welfare-qwen14b-base-data`, no accesible publicamente.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/joshycodes/ood-welfare-qwen14b-base
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Modelo de chat de referencia: https://huggingface.co/Qwen/Qwen3-14B
- Adaptador de referencia del estudio (good-moments-base-sft): https://huggingface.co/joshycodes/good-moments-base-sft
- Estudio equivalente sobre Gemma: https://huggingface.co/joshycodes/ood-welfare-gemma
- Dataset privado con datos, codigo y preregistro: https://huggingface.co/datasets/joshycodes/ood-welfare-qwen14b-base-data
- Perfil de GitHub del autor: https://github.com/JoshyCodes
- Otro modelo del autor citado en la busqueda: https://huggingface.co/joshycodes/Qwen3.5-9B-oracle-v0
