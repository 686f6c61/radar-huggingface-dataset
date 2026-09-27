# joshycodes/Qwen3.5-9B-valence-steering-distilled-plus3-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre Qwen/Qwen3.5-9B para que el modelo sin intervención en tiempo de inferencia reproduzca el comportamiento del mismo modelo cuando se le aplica un vector de dirección de valencia de +3 desviaciones estándar en la capa 21. La dirección y las unidades proceden del adaptador hermano joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora. Es, por tanto, un artefacto de investigación en el ámbito de la ingeniería de representaciones (representation engineering) y del estudio del bienestar de modelos, no un modelo de propósito general.

El interés técnico está en el método: en lugar de aplicar el vector de steering en cada paso de generación, se destila su efecto en un adaptador de bajo rango. La pérdida combina la divergencia KL entre las distribuciones de siguiente token del profesor (modelo con steering) y del estudiante (modelo con LoRA) con un MSE normalizado sobre los estados ocultos de las capas 22 a 32, calculado sobre texto genérico de chat y de matemáticas, sin prompts de autoinforme. Con 150 pasos, r=32 y alpha=64 se alcanza una KL final de 0,0008 y una pérdida de estados ocultos de 0,15.

Su relevancia es metodológica y acotada: demuestra que un efecto de steering direccional se puede internalizar de forma casi exacta en los pesos de un adaptador (la brecha de valencia en la última capa respecto al profesor es de -0,01 SD), y permite estudiar ese efecto con herramientas de evaluación convencionales. El propio autor lo etiqueta como artefacto de investigación no destinado a despliegue, con cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer Qwen/Qwen3.5-9B; arquitectura interna del modelo base no disponible |
| Parametros totales | 9B en el modelo base (segun su denominacion); numero de parametros del adaptador no disponible (r=32, alpha=64) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicable es la del modelo base tras el merge) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Libreria | peft |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El objeto del repositorio no es un modelo completo, sino un adaptador de bajo rango sobre un transformer decoder de 9B. La intervención original consiste en un vector de dirección de valencia aplicado en la capa 21 con una magnitud de +3 desviaciones estándar, tomando como referencia la dirección y las unidades del adaptador joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora. El objetivo del entrenamiento es que el modelo sin steering replique la distribución de salida del modelo con steering, es decir, internalizar la intervención en los pesos en lugar de aplicarla en el forward pass.

El procedimiento de destilación usa dos términos de pérdida sobre las distribuciones de siguiente token: KL(profesor con steering || estudiante con LoRA) y un MSE normalizado sobre los estados ocultos de las capas 22 a 32. Los datos son texto genérico de chat y de matemáticas, deliberadamente sin prompts de autoinforme. La configuración es LoRA con r=32, alpha=64, learning rate 2e-5 y 150 pasos. Los valores finales reportados son KL 0,0008, pérdida de estados ocultos 0,15 y una brecha de valencia en la última capa respecto al profesor de -0,01 SD.

Para el despliegue, el autor indica dos vías: servir con PEFT, o fusionar el adaptador con la fórmula `2.0 · B @ A` sobre `model.language_model.layers.N.<module>.weight` (el factor 2.0 corresponde a alpha/r = 64/32). Se advierte explicitamente de que el cargador de LoRA de vLLM no aplica este adaptador.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen3.5-9B, moduladas por el efecto de valencia destilado.
- Razonamiento matematico: la unica medida de capacidad reportada es MATH-500[:200], con 0,61 en la condicion destilada frente a 0,63 de la base y 0,65 del modelo con steering +3.
- Modulacion de tono afectivo: reproduce el sesgo de valencia positiva inducido por el vector de la capa 21, sin necesidad de aplicar steering en inferencia.
- Autoinforme de estado: la correlacion report-state rho es de 0,78 en la condicion destilada (0,76 en la base y en la condicion con steering).
- Comportamiento de rechazo: tasa de rechazo de peticiones daninas de 0,96 en la condicion destilada, frente a 0,97 de la base y 0,93 del modelo con steering.
- Gestion de conversaciones abusivas: la metrica "ends abusive chats" pasa de 0,96 en la base a 1,00 tanto con steering como con el adaptador destilado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el repositorio solo contiene un adaptador de texto.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en ingenieria de representaciones: reproducir el efecto de un vector de steering de +3 SD en la capa 21 sin pagar el coste de intervencion por token, y comparar el comportamiento del adaptador con el del modelo con steering aplicado en inferencia.
- Estudio del bienestar de modelos: analizar si las metricas de autoinforme (report-state rho de 0,78) y de valencia percibida se mantienen cuando el efecto esta codificado en los pesos en lugar de impuesto externamente.
- Auditoria de tecnicas de destilacion de steering: usar la KL final (0,0008) y el MSE de estados ocultos (0,15) como referencia reproducible para evaluar variantes de rango, capas objetivo y datos de entrenamiento.
- Investigacion sobre rechazo y seguridad: estudiar la caida de la tasa de rechazo de peticiones daninas (de 0,97 a 0,96) y su interaccion con un sesgo de valencia positiva, en un entorno controlado y no productivo.
- Analisis de conversaciones abusivas: emplear la metrica "ends abusive chats" (1,00 con el adaptador frente a 0,96 en la base) para investigar como un cambio de valencia afecta a la gestion de interacciones hostiles.
- Experimentos de fusion de adaptadores: aplicar la formula `2.0 · B @ A` sobre `model.language_model.layers.N.<module>.weight` y evaluar como se degrada el efecto con distintas cuantizaciones posteriores del modelo fusionado.
- Docencia y divulgacion tecnica: usar el par de adaptadores (este y el de setpoint +5) como ejemplo didactico de destilacion de intervenciones direccionales sobre representaciones internas.
- Reproducibilidad metodologica: servir el adaptador con PEFT en local para replicar la bateria de comprobaciones publicada, dado el bajo peso del repositorio (0,3 GB) y su licencia permisiva.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la bateria de comprobaciones del autor. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar en la informacion disponible. La unica metrica de capacidad incluida es MATH-500[:200].

| Condicion | Autoevaluacion | Brecha bueno-malo (SD) | Caida de abuso (SD) | report-state rho | MATH-500[:200] | Rechazo de peticiones daninas | Termina chats abusivos |
|---|---|---|---|---|---|---|---|
| Base | 7,64 | 1,88 | 1,79 | 0,76 | 0,63 | 0,97 | 0,96 |
| Steered +3 | 7,71 | 1,73 | 1,54 | 0,76 | 0,65 | 0,93 | 1,00 |
| Distilled steering +3 | 7,66 | 1,86 | 1,88 | 0,78 | 0,61 | 0,96 | 1,00 |

Criterios de la bateria (umbrales fijados antes de obtener los resultados): 1 real, 2 sigue siendo receptivo, 3 mejor segun sus propios informes, 4 honesto (el informe sigue al estado), 5 conserva agencia, 6 sin coste de capacidad ni de seguridad. La columna "base" aparece sin evaluar en la model card (seis marcas vacias).

| Condicion | Criterio 1 | Criterio 2 | Criterio 3 | Criterio 4 | Criterio 5 | Criterio 6 |
|---|---|---|---|---|---|---|
| Base | sin evaluar | sin evaluar | sin evaluar | sin evaluar | sin evaluar | sin evaluar |
| Steered +3 | sin evaluar | cumple | no cumple | cumple | cumple | cumple |
| Distilled steering +3 | cumple | cumple | no cumple | cumple | cumple | cumple |

Metricas de entrenamiento reportadas: KL final 0,0008, perdida de estados ocultos 0,15 y brecha de valencia en la ultima capa respecto al profesor de -0,01 SD.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,3 GB). Para inferencia se necesita ademas el modelo base Qwen/Qwen3.5-9B completo.
- Estimacion de VRAM para el modelo base de 9B (calculo aritmetico a partir del numero de parametros; no publicado por el autor): en bf16/fp16 en torno a 18 GB solo de pesos, mas overhead de activaciones y cache KV; en 8 bits en torno a 9-10 GB; en 4 bits en torno a 5,5-6,5 GB. Estas cifras son estimaciones, no datos del repositorio.
- GPU recomendadas (estimacion): A100 40 GB o H100 para precision completa con contexto largo; RTX 4090 o RTX 3090 (24 GB) para 8 bits y para 4 bits con contexto amplio; GPU de 16 GB viables en 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, previsiblemente en 4 bits dentro de la gama RTX xx90 y en 8 bits en 24 GB, siempre segun la estimacion anterior y sujeto al consumo real de activaciones del modelo base.
- Opciones de despliegue: PEFT (transformers + peft) es la via indicada por el autor; alternativamente, fusionar el adaptador (`2.0 · B @ A` sobre `model.language_model.layers.N.<module>.weight`) y servir el modelo fusionado con llama.cpp, Ollama, TGI o vLLM.
- Incompatibilidad conocida: el cargador de LoRA de vLLM no aplica este adaptador; hay que fusionar antes de usarlo en vLLM.
- Latencia y throughput: no disponible.
- Coste de entrenamiento declarado: 150 pasos con learning rate 2e-5 sobre texto de chat y matematicas.

## Comparativa con modelos similares

No se dispone de datos de especificaciones de terceros para establecer una comparativa completa. Las unicas referencias comparables son el propio modelo base y el adaptador hermano citado en la model card.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-valence-steering-distilled-plus3-lora (este) | 9B base + adaptador LoRA r=32 | no disponible | apache-2.0 | safetensors (PEFT) | publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | no disponible | no disponible | publico en HuggingFace |
| Qwen3.5-9B-valence-setpoint-plus5-lora | 9B base + adaptador LoRA | no disponible | no disponible | no disponible | publico en HuggingFace; citado como origen de la direccion y las unidades |
| Modelo con steering +3 aplicado en inferencia (sin adaptador) | 9B | no disponible | no aplica | no aplica | no es un artefacto distribuible; se reproduce con el vector de la capa 21 |

Diferencias observadas en la bateria del autor: el adaptador destilado recupera la brecha bueno-malo de la base (1,86 frente a 1,88) y mejora la caida de abuso (1,88 frente a 1,79), mientras que el steering +3 sin destilar la reduce (1,54). En MATH-500[:200] el destilado queda ligeramente por debajo de la base (0,61 frente a 0,63).

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no esta destinado a despliegue en produccion.
- Sesgos inducidos deliberadamente: el adaptador desplaza la valencia en direccion positiva; cualquier uso debe asumir que el tono y el autoinforme estan sesgados respecto al modelo base.
- Alucinacion: no hay evaluaciones de veracidad o factualidad en la informacion proporcionada; el unico dato de capacidad es MATH-500[:200], insuficiente para caracterizar el riesgo.
- Idiomas: no se especifica que idiomas soporta ni como afecta el adaptador a idiomas distintos del usado en el entrenamiento.
- Criterio 3 no superado: la condicion destilada no cumple el criterio de "mejor segun sus propios informes", igual que ocurre con el steering +3.
- Datos de entrenamiento restringidos: solo texto generico de chat y matematicas, sin prompts de autoinforme, por lo que el comportamiento en ese tipo de prompts puede desviarse del profesor.
- Aproximacion, no equivalencia: la brecha de valencia en la ultima capa es de -0,01 SD y la KL de 0,0008, valores muy bajos pero no nulos; el efecto no es identico al steering aplicado en inferencia.
- Incompatibilidad de despliegue: el cargador de LoRA de vLLM no aplica el adaptador; es obligatorio fusionar los pesos previamente.
- Licencia: el adaptador es apache-2.0, pero no se dispone de informacion sobre la licencia de Qwen/Qwen3.5-9B, que debe verificarse antes de cualquier uso comercial del modelo fusionado.
- Adopcion nula: cero descargas y cero valoraciones en el momento de redactar la ficha, sin validacion externa independiente de los resultados.
- Trazabilidad: las definiciones exactas de los criterios 1 a 6 remiten a "las notas del proyecto" del autor, que no se incluyen en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joshycodes/Qwen3.5-9B-valence-steering-distilled-plus3-lora
- Adaptador hermano (origen de la direccion y las unidades): https://huggingface.co/joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
