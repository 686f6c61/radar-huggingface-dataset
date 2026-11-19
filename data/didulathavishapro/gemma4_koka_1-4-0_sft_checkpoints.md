# DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints

## Resumen

`gemma4_koka_1-4-0_sft_checkpoints` es una coleccion de adaptadores LoRA (rango 16, alpha 32) entrenados mediante supervised fine-tuning auto-destilado (SD-SFT) sobre el modelo base `unsloth/gemma-4-E4B-it`, con el objetivo de especializarlo en el lenguaje de programacion Koka. Lo publica el usuario DidulaThavishaPro en Hugging Face y se distribuye como repositorio PEFT, no como modelo completo.

El interes tecnico del artefacto reside en su formato: el repositorio no contiene un unico adaptador, sino un conjunto de checkpoints intermedios (`checkpoint-600`, `checkpoint-700`, `checkpoint-747`) junto con versiones "text-only" que eliminan los pesos de las torres de audio y vision para motores de inferencia que solo procesan texto. Esto lo convierte en material util para experimentar con adaptadores sobre Gemma 4 E4B y para estudiar la evolucion del entrenamiento, aunque no es un modelo listo para produccion por si mismo.

El modelo base es Gemma 4 E4B, una variante de la familia Gemma de Google con capacidades multimodales (audio y vision, segun los pesos que el propio adaptador referencia). El adaptador hereda la licencia Gemma y esta pensado para cargarse con PEFT sobre el modelo base, no para ejecutarse de forma autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Gemma 4 E4B |
| Parametros totales | no disponible (adaptador LoRA rango 16, alpha 32; el modelo base no se especifica en detalle) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base entrenado en 4-bit (`unsloth-bnb-4bit`); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptadores PEFT); incluye tokenizer y estado del trainer |
| Tamano del repositorio | 1,5 GB |
| Libreria | peft |
| Modelo base | unsloth/gemma-4-E4B-it |
| Checkpoints incluidos | checkpoint-600, checkpoint-700, checkpoint-747 (completos); text_only de 300, 500, 600, 700 y 747 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Gemma 4 E4B. El entrenamiento se realizo mediante supervised fine-tuning auto-destilado (SD-SFT), una variante en la que el propio modelo genera datos de entrenamiento que luego se filtran y se usan como supervision. El modelo base empleado durante el entrenamiento fue la version cuantizada a 4-bit `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, lo que reduce los requisitos de memoria del proceso.

El repositorio conserva el estado completo del entrenamiento: ademas de los pesos del adaptador, cada checkpoint incluye el tokenizer y el estado del trainer (optimizador, scheduler y estados de numeros aleatorios). Esto permite reanudar el entrenamiento o analizar la trayectoria de las actualizaciones. Las carpetas `text_only/` contienen los mismos adaptadores con los pesos de las torres de audio y vision eliminados, pensados para motores de inferencia que solo aceptan texto. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de Koka ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de codigo en Koka: el adaptador esta especializado en este lenguaje de programacion funcional con sistema de efectos, segun los tags del repositorio.
- Fine-tuning supervisado sobre un modelo base multimodal: el adaptador completo conserva la estructura para audio y vision, aunque el entrenamiento se centra en codigo.
- Inferencia solo texto: las variantes `text_only/` permiten usar el adaptador en motores que no soportan audio ni vision.
- Compatibilidad con PEFT: se carga mediante `subfolder="checkpoint-747"` u otro checkpoint.
- Reanudacion de entrenamiento: los checkpoints incluyen estado del optimizador y del scheduler.
- Capacidades del modelo base (Gemma 4 E4B): no detalladas en la informacion disponible; se heredan del modelo base, pero no se documentan aqui.

## Casos de uso

- Experimentacion con adaptadores LoRA sobre Gemma 4 E4B: cargar `checkpoint-747` con PEFT para evaluar como responde el modelo base a instrucciones de Koka tras el SD-SFT, comparando con el modelo sin adaptador.
- Generacion asistida de codigo Koka: usar el adaptador en un editor o pipeline para autocompletar funciones y modulos en este lenguaje, aprovechando la especializacion del fine-tuning.
- Investigacion sobre SD-SFT: analizar los checkpoints intermedios (600, 700, 747) para estudiar como evoluciona la perdida y la calidad de las respuestas a lo largo del entrenamiento, gracias a que se conserva el estado del trainer.
- Despliegue en motores solo texto: emplear las variantes `text_only/` en entornos de inferencia que no soportan audio ni vision, reduciendo el peso del adaptador y evitando cargar torres innecesarias.
- Reentrenamiento y continuacion del fine-tuning: reanudar desde `checkpoint-747` con el optimizador y scheduler restaurados para extender el entrenamiento con nuevos datos de Koka.
- Evaluacion comparativa de checkpoints: medir la calidad de generacion de codigo en cada checkpoint para seleccionar el punto de parada optimo antes de integrar el adaptador en un flujo de trabajo.
- Docencia y demostraciones: ilustrar el proceso de especializacion de un modelo multimodal en un lenguaje de programacion concreto usando un repositorio pequeno (1,5 GB) y facil de inspeccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el adaptador pesa 1,5 GB en el repositorio y requiere cargar el modelo base Gemma 4 E4B, cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible; depende del modelo base y del motor de inferencia.
- Cabe en GPU de consumo: no disponible; el entrenamiento uso una base cuantizada a 4-bit, lo que sugiere que la inferencia con cuantizacion podria caber en GPUs de consumo, pero no se confirma.
- Opciones de despliegue: PEFT (carga del adaptador con `subfolder`), con el modelo base servido por el motor que se elija; no se especifican vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-4-0_sft_checkpoints | adaptador LoRA sobre Gemma 4 E4B | no disponible | Codigo Koka | gemma | Hugging Face (PEFT) |
| Modelo base `unsloth/gemma-4-E4B-it` | no disponible | no disponible | Multimodal general | gemma | Hugging Face |
| Alternativas de adaptadores LoRA para lenguajes funcionales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `unsloth/gemma-4-E4B-it` y aplicar el adaptador con PEFT; no puede ejecutarse solo.
- Especializacion estrecha: el fine-tuning se centra en Koka, por lo que el rendimiento en otros lenguajes o tareas generales puede degradarse respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni de calidad del codigo generado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir codigo Koka sintacticamente incorrecto o con efectos mal tipados; requiere validacion con el compilador.
- Idiomas no documentados: no se especifica que idiomas naturales soporta el adaptador ni si el entrenamiento afecto a capacidades multilingues.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma, que impone restricciones y obligaciones de atribucion.
- Checkpoints intermedios: los checkpoints 600 y 700 pueden no estar convergidos; el autor no indica cual es el recomendado mas alla de senalar el 747 como ultimo guardado.
- Estado del trainer incluido: los ficheros de optimizador y scheduler incrementan el tamano del repositorio y no son necesarios para inferencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Version cuantizada usada en entrenamiento: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Libreria PEFT: https://huggingface.co/docs/peft
