# EugeneEvstafev/cevra-math-decisions-lora

## Resumen

Cevra Math Decisions LoRA es un adaptador PEFT (LoRA) publicado por EugeneEvstafev que se aplica sobre el modelo base `openai/gpt-oss-20b`. Su proposito concreto es actuar como modelo de decision para clasificar problemas matematicos por asignatura y puntuar opciones de respuesta, devolviendo una distribucion de probabilidad sobre las alternativas disponibles en lugar de una unica etiqueta. No es un modelo generativo de proposito general, sino un cabezal de clasificacion entrenado por ajuste fino sobre un modelo ya existente.

El adaptador se entreno con 3.622 ejemplos y se valido con 458, durante 227 pasos y una sola epoca, con rango LoRA 16, batch size 16, learning rate 0,0001 y longitud maxima de 2048 tokens. El repositorio ocupa 0,9 GB y contiene unicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base.

La relevancia de esta publicacion es limitada pero especifica: demuestra un caso de uso de ajuste fino ligero para tareas de enrutamiento y puntuacion de decisiones dentro de un pipeline educativo o de evaluacion automatica de matematicas. La model card reporta mejoras sustanciales frente al modelo base en tres metricas de calibracion (Brier, MAE y acuerdo de argmax), aunque no se han publicado resultados en benchmarks estandar de razonamiento matematico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `openai/gpt-oss-20b` |
| Parametros totales | no disponible (adaptador LoRA con rango 16; el modelo base tiene 20.000 millones, segun su nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento; el contexto del modelo base no se detalla) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre `openai/gpt-oss-20b`, un transformer de 20.000 millones de parametros (segun la nomenclatura del modelo base). No se especifica sobre que modulos del transformer se aplican las matrices de bajo rango, ni si se congelan o entrenan capas adicionales. El entrenamiento se realizo con la libreria PEFT y el Tinker Cookbook, usando el renderer de decisiones `gpt_oss_no_sysprompt` para formatear las entradas y puntuar las opciones de asignatura.

Los datos de entrenamiento consisten en 3.622 ejemplos de problemas matematicos etiquetados por asignatura y, presumiblemente, con puntuaciones de opciones, aunque la model card no detalla la composicion del dataset ni el proceso de anotacion. Se realizo una sola epoca con 227 pasos, batch size 16, learning rate 0,0001, longitud maxima 2048 y semilla 42. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales; el ajuste es puramente supervisado sobre la tarea de clasificacion y puntuacion. La seleccion del checkpoint se hizo sobre el conjunto de validacion de 458 ejemplos.

## Capacidades

- Clasificacion de problemas matematicos por asignatura (subject classification) mediante una distribucion de probabilidad sobre las opciones.
- Puntuacion de opciones de respuesta (scoring choices), devolviendo probabilidades calibradas en lugar de una etiqueta dura.
- Razonamiento matematico heredado del modelo base `openai/gpt-oss-20b`, aunque el adaptador esta especializado en la tarea de decision.
- Salida en formato de distribucion de probabilidad, adecuada para agregacion y umbralizacion posterior.
- Idioma: ingles unicamente.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito en la model card.

## Casos de uso

- Enrutamiento de problemas matematicos en plataformas educativas: el adaptador asigna cada problema a una asignatura (algebra, geometria, calculo, etc.) con una distribucion de probabilidad, lo que permite derivarlo al banco de ejercicios o al profesor adecuado y priorizar revisiones cuando la confianza es baja.
- Puntuacion automatica de opciones en tests de matematicas: dado un problema y un conjunto de alternativas, el modelo devuelve probabilidades por opcion, utiles para correccion asistida o para detectar items ambiguos en los que el modelo no se decanta claramente.
- Control de calidad de bancos de preguntas: la distribucion de probabilidad sobre asignaturas permite detectar problemas mal etiquetados (por ejemplo, un item de geometria clasificado como algebra) comparando la etiqueta humana con el argmax del modelo.
- Filtrado y triaje en pipelines de evaluacion: al ser un adaptador ligero sobre un modelo de 20.000 millones, se puede desplegar como etapa de clasificacion previa a un modelo mayor o a un corrector humano, reduciendo coste en el resto del pipeline.
- Investigacion sobre calibracion de modelos de decision: las metricas Brier y MAE reportadas permiten usar este adaptador como referencia para estudiar como el ajuste fino LoRA mejora la calibracion de un modelo base en tareas de clasificacion con opciones.
- Generacion de datos sinteticos etiquetados: la puntuacion por opciones puede emplearse para preetiquetar grandes volumenes de problemas matematicos antes de una revision humana, acelerando la construccion de datasets.

## Benchmarks y rendimiento

La model card reporta una comparacion en validacion (458 ejemplos) entre el modelo base y el adaptador. No se han publicado resultados en benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible.

| Metrica (validacion) | Base | Cevra | Mejor |
|---|---:|---:|---|
| Distribution Brier | 0,468040 | 0,090603 | Menor |
| Probability MAE | 0,132055 | 0,053061 | Menor |
| Argmax agreement | 35,81% | 46,07% | Mayor |

## Requisitos de hardware

- El adaptador en si ocupa 0,9 GB, pero requiere cargar el modelo base `openai/gpt-oss-20b` para inferencia.
- VRAM estimada para el modelo base en precision completa (BF16/FP16): aproximadamente 40 GB, mas overhead de activaciones y KV cache; no disponible el dato oficial.
- VRAM estimada con cuantizacion de 8 bits: en torno a 20-22 GB; con 4 bits: en torno a 11-13 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para precision completa; RTX 4090 (24 GB) viable con cuantizacion de 8 bits o inferior; GPUs consumer de 16 GB o menos solo con cuantizacion agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI para servir el modelo base (la compatibilidad con adaptadores LoRA depende de la version); llama.cpp/Ollama requeririan conversion del adaptador a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA de decision sobre `gpt-oss-20b`). Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cevra Math Decisions LoRA | Adaptador LoRA r=16 sobre gpt-oss-20b | 2048 (entrenamiento) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Especializado exclusivamente en clasificacion de problemas matematicos por asignatura y puntuacion de opciones; no es un modelo generativo de proposito general.
- El conjunto de validacion es pequeno (458 ejemplos) y se uso para seleccion de checkpoint, por lo que las metricas reportadas pueden estar optimistamente sesgadas.
- No se detalla la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de dominio, de nivel educativo o de estilo de enunciado.
- Riesgo de alucinacion y de calibracion deficiente fuera de la distribucion de entrenamiento; el argmax agreement del 46,07% sigue siendo bajo en terminos absolutos.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- El adaptador depende del modelo base `openai/gpt-oss-20b`; cualquier restriccion de licencia o cambio en el modelo base afecta al uso del adaptador.
- No se documentan procesos de alineacion (RLHF/DPO) ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/EugeneEvstafev/cevra-math-decisions-lora
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Tinker Cookbook (mencionado en la model card, sin URL directa): no disponible
- Paper, blog, repositorio o demo adicionales: no disponible
