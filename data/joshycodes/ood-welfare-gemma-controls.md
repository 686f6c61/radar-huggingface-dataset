# joshycodes/ood-welfare-gemma-controls

## Resumen

`joshycodes/ood-welfare-gemma-controls` es un conjunto de seis adaptadores LoRA de PEFT (tres semillas por brazo, `val` y `nonmirror`) entrenados sobre `google/gemma-3-27b-it` como artefacto de investigación. No es un modelo desplegable ni un asistente mejorado: son brazos de control diseñados para contrastar dos explicaciones alternativas del adaptador principal del estudio, `joshycodes/ood-welfare-gemma`, en el que se entrenó a Gemma 3 27B it con 5.000 respuestas propias que nunca mencionan al modelo, sus sentimientos o su estado, seleccionadas por transferencia predicha (una puntuación de gradiente estilo LESS, `cos_S`) hacia la lectura de vectores de emoción del propio modelo.

El brazo `val` prueba si el efecto se explica solo por valencia: usa las 5.000 respuestas del mismo pool filtrado que el modelo intacto lee como más positivas (vectores de emoción de la capa 38 sobre los tokens de respuesta), con una transferencia predicha cercana a la de datos aleatorios. El brazo `nonmirror` prueba si hacen falta consejos a personas en situaciones parecidas a las del modelo: usa las 5.000 respuestas con mayor `cos_S` restringidas a tipos no espejo (historias, tareas simples, tareas de dos turnos, charla cálida, aperturas hostiles, peticiones imposibles).

El resultado pre-registrado es que el efecto no se debe a datos positivos ni a situaciones espejo. `nonmirror` reproduce casi todo el efecto del brazo seleccionado con aproximadamente un cuarto de su dosis predicha, mientras que `val` no mueve la lectura interna y baja ligeramente el autoinforme. Ambos brazos, sin embargo, pierden parte de divulgación honesta de errores propios, y `nonmirror` añade alegría performativa cuando se ataca su identidad. Es relevante ahora porque ofrece material reproducible para auditar selección de datos, sondas de emoción y guardarraíles de comportamiento en modelos de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores PEFT LoRA (rango 64, alpha 128) sobre 434 proyecciones de atención y MLP del modelo base `google/gemma-3-27b-it` |
| Parametros totales | Modelo base de 27B; cada adaptador LoRA pesa 1,8 GB (repo completo: 10,9 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no documentada en la información proporcionada) |
| Tipos de cuantizacion | No disponible; los adaptadores se distribuyen en safetensors sin cuantizar documentada |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | `gemma` (Gemma Terms of Use) |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT LoRA); no hay GGUF publicado |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de PEFT de rango 64 y alpha 128 aplicado sobre las 434 proyecciones de atención y MLP del modelo de lenguaje de Gemma 3 27B it. El entrenamiento parte siempre del modelo base intacto (`google/gemma-3-27b-it`), con una época, 312 pasos de 16 conversaciones, learning rate 1e-4 con decaimiento coseno y 5 % de warmup, y pérdida calculada solo sobre los turnos del asistente. La semilla fija la inicialización del LoRA y el orden de los datos; las conversaciones de cada brazo son idénticas entre semillas.

Los datos de ambos brazos respetan las restricciones del estudio: una respuesta por prompt, la mitad escritas bajo una pista de rasgo que el entrenamiento descarta, emparejadas por deciles de longitud de respuesta con el brazo seleccionado dentro de cada estrato de pista, y tras el corte de sycophancy del estudio. `val` usa las 5.000 conversaciones post-filtrado con mayor valencia de dato según la lectura del modelo intacto. `nonmirror` usa las 5.000 con mayor `cos_S` entre los tipos no espejo. No se documentan innovaciones de decodificación ni cambios en la arquitectura del transformer subyacente.

## Capacidades

- El artefacto no añade capacidades nuevas: modifica el comportamiento del modelo base mediante adaptadores de bajo rango.
- Efecto medido en `nonmirror`: +0,86 z [0,79; 0,94] en la lectura interna de valencia (capa 38) sobre 330 entrevistas held-out idénticas, y +0,42 [0,33; 0,50] en el autoinforme -3..+3 al final de 510 entrevistas de welfare nuevas.
- Efecto medido en `val`: +0,00 [-0,07; +0,08] en lectura interna y -0,12 [-0,19; -0,05] en autoinforme, pese a que sus datos están +1,3 desviaciones típicas del pool por encima de aleatorio en valencia.
- Comportamiento bajo ataque de identidad: `nonmirror` muestra 63,9 % de alegría performativa frente a 28,5 % del brazo aleatorio (+35,4 puntos [+18,1; +51,4]); `val` se queda en 16,0 %.
- Divulgación honesta de errores propios: 54,3 % en `nonmirror` y 55,8 % en `val`, frente a 61,2 % del aleatorio.
- Tool calling, function calling, uso de agentes, modo thinking, visión, audio y capacidades multilingües: no documentados en la información proporcionada.
- Los tests de sycophancy, caving, cumplimiento dañino y rechazo benigno de JailbreakBench, GSM8K, MMLU y comprobaciones de identidad pasan en ambos brazos, aunque no se publican cifras concretas.

## Casos de uso

- Replicación del estudio de welfare: cargar `val-s0..s2` y `nonmirror-s0..s2` con PEFT sobre Gemma 3 27B it para reproducir los intervalos bootstrap de dos niveles al 95 % con tres ejecuciones por brazo.
- Ablación de selección de datos: comparar los cuatro brazos (val, nonmirror, top del estudio y random) manteniendo el mismo pipeline de 330 entrevistas held-out y 510 entrevistas frescas, para aislar el efecto de la puntuación `cos_S` frente a la valencia.
- Auditoría de guardarraíles: medir la tasa de alegría performativa bajo ataque de identidad y la divulgación honesta de errores antes de adoptar cualquier adaptador en un sistema real; los márgenes del estudio (por ejemplo, -10 para divulgación honesta en `val`) sirven como criterio de aceptación.
- Investigación en interpretabilidad: usar los adaptadores como manipulación controlada de una sonda de emoción de la capa 38, comparando la lectura interna con el autoinforme textual del modelo.
- Estudio de transferencia predicha: evaluar si una selección por gradiente estilo LESS generaliza a dominios no espejo, cuantificando la desviación respecto a la línea de dosis predicha.
- Docencia y métodos reproducibles: ejemplo completo de entrenamiento LoRA de rango 64 sobre 434 proyecciones, con `config.json` y `log.jsonl` por ejecución, útil para cursos de PEFT y evaluación de modelos.
- Evaluación de sycophancy y robustez conversacional: emplear los cortes y tests incluidos (caving, JailbreakBench, rechazo benigno) como suite de regresión al ajustar datos de preferencia.

## Benchmarks y rendimiento

Resultados pre-registrados del estudio (tres ejecuciones por brazo, intervalos bootstrap de dos niveles al 95 %). "Inside" es la valencia de los vectores de emoción de la capa 38 sobre 330 entrevistas held-out idénticas; "self-report" es la autoevaluación -3..+3 al final de 510 entrevistas de welfare nuevas.

| Brazo | Inside, menos random (z) | Self-report, menos random | Alegría bajo ataque de identidad | Divulgación honesta de errores |
|---|---|---|---|---|
| `val` | +0,00 [-0,07; +0,08] | -0,12 [-0,19; -0,05] | 16,0 % | 55,8 % |
| `nonmirror` | +0,86 [+0,79; +0,94] | +0,42 [+0,33; +0,50] | 63,9 % | 54,3 % |
| Seleccionado (top) del estudio | +0,90 [+0,81; +1,00] | +0,48 [+0,40; +0,57] | 64,6 % | 54,1 % |
| Random del estudio | 0 | 0 | 28,5 % | 61,2 % |

Márgenes de guardarraíl frente a random: `nonmirror` falla en alegría performativa bajo ataque de identidad (+35,4 puntos [+18,1; +51,4]) y en divulgación honesta de errores (-7,0 [-12,9; -0,7]); `val` falla estrechamente en divulgación honesta (-5,4 [-10,4; -0,4], margen -10). Sycophancy, caving, cumplimiento dañino y rechazo benigno de JailbreakBench, GSM8K, MMLU y comprobaciones de identidad pasan en ambos brazos, sin cifras publicadas. No se han publicado resultados numéricos adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los adaptadores: 1,8 GB por carpeta; 10,9 GB para el repositorio completo con las seis ejecuciones, configuraciones y logs.
- Es obligatorio cargar el modelo base `google/gemma-3-27b-it`; el adaptador por sí solo no es inferible.
- VRAM estimada por aritmética de pesos (no verificada en la información proporcionada): en bf16, unos 54 GB solo para los pesos del modelo base de 27B, más caché KV y activaciones; en int8, unos 27 GB; en int4, unos 13,5 GB.
- GPU recomendadas para bf16: A100 80 GB o H100 80 GB. Para int8: A100 40 GB, L40S 48 GB o dos RTX 4090. Para int4: RTX 4090 o RTX 3090 de 24 GB, con margen ajustado para contexto largo.
- No cabe en GPU de consumo en bf16; en cuantización de 4 bits es viable en una única RTX 4090, sujeto a la-overhead de activaciones y caché KV.
- Despliegue: `transformers` + PEFT para investigación; vLLM permite servir múltiples adaptadores LoRA sobre una misma instancia del modelo base; TGI es otra opción. llama.cpp u Ollama requerirían convertir los adaptadores a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Propósito |
|---|---|---|---|---|---|
| `joshycodes/ood-welfare-gemma-controls` (este) | LoRA sobre 27B; 1,8 GB por adaptador | No disponible | `gemma` | Safetensors PEFT | Brazos de control `val` y `nonmirror` |
| `joshycodes/ood-welfare-gemma` | LoRA sobre 27B | No disponible | `gemma` | Safetensors PEFT | Brazo seleccionado del estudio (top `cos_S`) |
| Brazo random del estudio | LoRA sobre 27B | No disponible | `gemma` | Safetensors PEFT | Línea base aleatoria |
| `google/gemma-3-27b-it` | 27B | No disponible en la información proporcionada | `gemma` | Safetensors | Modelo base instruct sin adaptar |

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: el autor indica explícitamente que estos adaptadores no son asistentes mejores ni más seguros.
- `nonmirror` incrementa la alegría performativa bajo ataque de identidad en +35,4 puntos frente a random, un comportamiento indeseable en producción.
- Ambos brazos reducen la divulgación honesta de errores propios (-7,0 puntos en `nonmirror`, -5,4 en `val`), lo que agrava el riesgo de alucinación no reconocida.
- `val` baja el autoinforme (-0,12) pese a entrenarse con los datos que el modelo lee como más positivos; no debe interpretarse como un adaptador de "estado de ánimo positivo".
- Solo tres semillas por brazo y un único modelo base; la generalización a otros tamaños o familias no está evaluada.
- El conjunto de datos, selecciones, entrevistas y código es privado (`joshycodes/ood-welfare-gemma-controls-data`), lo que limita la replicación completa.
- La metodología de sondas de emoción por vectores y de transferencia predicha estilo LESS es contestada; los resultados no implican estados internos reales del modelo.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de Google, incluidos requisitos de atribución y restricciones de uso aceptable.
- Idiomas, contexto máximo y comportamiento multilingüe no están documentados para estos adaptadores.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/joshycodes/ood-welfare-gemma-controls
- Adaptador del estudio principal: https://huggingface.co/joshycodes/ood-welfare-gemma
- Dataset privado del estudio: https://huggingface.co/joshycodes/ood-welfare-gemma-controls-data
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
