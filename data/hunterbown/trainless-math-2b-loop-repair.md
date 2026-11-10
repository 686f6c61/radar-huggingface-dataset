# hunterbown/trainless-math-2b-loop-repair

## Resumen

Trainless Math 2B: loop-repair adapter es un adaptador LoRA de rango uno desarrollado por el usuario hunterbown sobre el modelo base Qwen/Qwen3.5-2B. Su objetivo es concreto y acotado: reducir el razonamiento matematico repetitivo (bucles de generacion) en tareas de matematicas. Lo relevante tecnicamente es que el adaptador no se ha obtenido mediante entrenamiento con gradientes, sino mediante programacion en el espacio de pesos (weight-space programming), modificando directamente dos matrices de escritura de las capas MLP del modelo base.

El adaptador no es un checkpoint completo: requiere el modelo base Qwen3.5-2B (revision fijada 15852e8c16360a2fea060d615a32b45270f8a8fc) para funcionar. El autor reporta una mejora de 68,0% a 76,0% en una porcion de verificacion de 200 preguntas de MATH-500, con una mejora pareada de 8 puntos porcentuales (intervalo bootstrap del 95%: 3-13,5 puntos). Se trata de una re-comprobacion sobre una porcion ya existente, no de un resultado sobre un conjunto de validacion nuevo.

El interes del modelo reside en su enfoque metodologico (edicion analitica de pesos sin entrenamiento) y en su tamano reducido, que lo hace desplegable en hardware modesto. No obstante, el alcance de la mejora esta explicitamente limitado a matematicas: el autor advierte que el formato estricto, el tool calling, la calidad general y la vision no estan cualificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango uno sobre transformer Qwen3.5-2B (modelo base multimodal con modulo `model.language_model`) |
| Parametros totales | No disponible (adaptador de rango uno; el modelo base declara 2B en su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la evaluacion uso un limite de salida de 32.768 tokens) |
| Tipos de cuantizacion | No disponible para el adaptador; el autor advierte que la conversion a GGUF y la cuantizacion son variantes separadas que no heredan la precision reportada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base, incluida sin cambios) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el autor menciona un checkpoint BF16 fusionado separado no incluido en el repositorio |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-2B, un transformer del que la model card solo explicita que expone rutas de modulo `model.language_model` y que se carga correctamente con `AutoModelForImageTextToText`, lo que sugiere capacidad multimodal en el modelo base. El adaptador en si es un LoRA de rango uno que modifica dos "writers" (matrices de escritura) de las capas MLP. La innovacion central es que estos cambios no provienen de entrenamiento con gradientes ni de RLHF/DPO: se calculan de forma analitica mediante programacion en el espacio de pesos, con el objetivo especifico de corregir bucles de razonamiento matematico.

El autor documenta con rigor la reproducibilidad: pesos del adaptador con SHA256 f67ffbbc22c7a0c0e1dd9ce28459751b18ab91de6132390a164c611f5744e27b, configuracion con SHA256 1cf3e3e143f8447c72287aa37419f1661b9afae6e8f7ba1bb848bed95a531752, y ficheros `trainless_model.json` (mediciones agregadas y hash de las preguntas fijas) y `export_report.json` (descripcion de los dos cambios de writer). No se detalla el volumen ni la composicion de datos de entrenamiento porque no hay entrenamiento supervisado convencional: la evaluacion se realizo sobre una porcion fija de 200 preguntas de MATH-500.

## Capacidades

- Generacion de texto y razonamiento matematico con modo thinking activable (`enable_thinking=True`).
- Reduccion de salidas repetitivas o truncadas por limite de tokens en problemas de matematicas: las salidas capadas bajan de 63/200 a 48/200 segun el autor.
- Razonamiento multi-paso en el dominio matematico, heredado del modelo base.
- Capacidad multimodal potencial heredada de Qwen3.5 (el loader recomendado es `AutoModelForImageTextToText`), aunque el autor declara la vision como no cualificada para este adaptador.
- Soporte de plantilla de chat mediante `apply_chat_template`.
- Tool calling y formato estricto: no cualificados segun la model card.

## Casos de uso

- Correccion de bucles en razonamiento matematico: el adaptador se aplica sobre Qwen3.5-2B para reducir generaciones que se repiten hasta agotar el limite de tokens, mejorando la tasa de respuestas correctas en problemas tipo MATH-500 (68,0% a 76,0% en la porcion evaluada).
- Evaluacion de tecnicas de edicion de pesos: sirve como caso de estudio reproducible para investigadores que quieran validar weight-space programming frente a fine-tuning con gradientes, con hashes publicados de pesos y configuracion.
- Prototipado de tutores matematicos en hardware modesto: al ser un adaptador sobre un modelo de 2B, puede desplegarse en GPU de consumo para generar soluciones paso a paso con modo thinking.
- Investigacion sobre decodificacion y limites de tokens: util para estudiar como un cambio minimo en dos matrices MLP altera la distribucion de longitudes de salida y la tasa de truncamiento.
- Base para experimentos de adaptadores de bajo rango: su rango uno y su naturaleza analitica lo convierten en un punto de partida para comparar con LoRA entrenados de forma convencional en tareas de razonamiento.
- Filtrado de datos sinteticos de matematicas: puede emplearse para regenerar soluciones con menos bucles antes de incluirlas en pipelines de destilacion o anotacion.

## Benchmarks y rendimiento

| Modelo | Benchmark | Correctas | Intervalo Wilson 95% | Salidas capadas |
|---|---|---:|---:|---:|
| Qwen3.5-2B (base) | MATH-500, porcion de 200 preguntas | 136/200 (68,0%) | 61,2-74,1% | 63/200 |
| Este adaptador | MATH-500, porcion de 200 preguntas | 152/200 (76,0%) | 69,6-81,4% | 48/200 |

Mejora pareada: 8 puntos porcentuales, intervalo bootstrap del 95% de 3-13,5 puntos. El adaptador corrigio 23 respuestas previamente incorrectas y perdio 7 previamente correctas. Ambos brazos tardaron aproximadamente 760 segundos, por lo que la ejecucion no establece ninguna mejora en tiempo de reloj. La varianza adicional por semilla de muestreo no se midio. Configuracion de la medicion: vLLM 0.31.0, Torch 2.13.0, Transformers 5.17.0, bf16, thinking activado, temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, seed 0 y limite de salida de 32.768 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 2B en bf16, la carga del modelo base dominara el consumo, pero no se publican cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; la medicion se realizo con vLLM 0.31.0, sin especificar el hardware.
- GPU de consumo: no confirmado por el autor; el tamano del modelo base (2B) sugiere viabilidad en GPU de consumo, pero no hay datos publicados que lo verifiquen para este adaptador.
- Opciones de despliegue: vLLM (runtime usado en la medicion) y carga via Transformers + PEFT con `AutoModelForImageTextToText` y `PeftModel`. El autor advierte que la conversion a GGUF y la cuantizacion son variantes separadas que no heredan la precision reportada.
- Latencia y throughput: ambos brazos tardaron aproximadamente 760 segundos en la evaluacion de 200 preguntas; no se establece ninguna mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (porcion 200) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.5-2B) | Adaptador rango uno sobre base 2B | No disponible | 76,0% | Apache 2.0 | Hugging Face (requiere modelo base) |
| Qwen3.5-2B (base) | 2B | No disponible | 68,0% | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros adaptadores o modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un checkpoint completo: sin el modelo base Qwen3.5-2B en la revision fijada no funciona.
- La mejora de 76,0% corresponde exclusivamente a este adaptador analitico exacto; el checkpoint BF16 fusionado separado y los ficheros GGUF no heredan esa precision.
- La evaluacion es una re-comprobacion sobre una porcion ya existente de MATH-500, no un resultado sobre un conjunto de validacion nuevo; la varianza por semilla de muestreo no se ha medido.
- El autor declara explicitamente que el formato estricto, el tool calling, la calidad general de tareas y la vision no estan cualificados: es una reparacion matematica dirigida, no una mejora universal.
- Los resultados y el comportamiento de generacion pueden cambiar con otro runtime o configuracion de muestreo.
- El loader generado automaticamente por el Hub usa `AutoModelForCausalLM`; el autor indica que el loader probado es `AutoModelForImageTextToText` para preservar las rutas `model.language_model`.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue mas alla del comportamiento del modelo base.
- Licencia Apache 2.0 heredada del modelo base, incluida sin cambios; el autor senala que la pantalla de exportacion paso sobre su fuente original pero no cualifica todos los runtimes ni establece seguridad general.

## Enlaces

- [Hugging Face: hunterbown/trainless-math-2b-loop-repair](https://huggingface.co/hunterbown/trainless-math-2b-loop-repair)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
