# DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints

## Resumen

`gemma4_koka_1-3-0_sft_checkpoints` es una coleccion de adaptadores LoRA (rank 16, alpha 32) entrenados mediante *self-distilled supervised fine-tuning* (SD-SFT) sobre el modelo base `unsloth/gemma-4-E4B-it`, con el objetivo de ensenar al modelo el lenguaje de programacion Koka. Lo publica el usuario DidulaThavishaPro en Hugging Face bajo licencia Gemma, y el repositorio ocupa 1,2 GB al contener tres checkpoints completos (300, 400 y 500 pasos) mas sus variantes `text_only` sin torres de audio y vision.

El modelo no es un modelo completo, sino un conjunto de pesos PEFT que deben cargarse sobre el base Gemma 4 E4B. El interes practico esta en que demuestra un flujo de trabajo reproducible de especializacion de un modelo multimodal de Google en un lenguaje de nicho (Koka, un lenguaje funcional con efectos algebraicos) usando cuantizacion 4-bit durante el entrenamiento y exportando adaptadores ligeros para inferencia.

Al tratarse de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, y sin model card extendida ni resultados de evaluacion publicados, debe tratarse como material experimental: util para reproducir el pipeline o para estudiar adaptadores de dominio, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 E4B |
| Parametros totales | no disponible (adaptador LoRA rank 16, alpha 32; el base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Gemma 4 E4B) |
| Tipos de cuantizacion | entrenado sobre base en 4-bit (`unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`); adaptadores en safetensors |
| Idiomas soportados | no disponible (el dominio de especializacion es Koka, lenguaje de programacion) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptadores PEFT); subcarpetas `checkpoint-300/400/500` y `text_only/checkpoint-300/400/500` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre `unsloth/gemma-4-E4B-it`. El entrenamiento se realizo con la variante cuantizada a 4-bit del base (`unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`), lo que reduce el coste de memoria del fine-tuning. La tecnica declarada es *self-distilled supervised fine-tuning* (SD-SFT): el propio modelo genera datos de entrenamiento que luego se filtran y se usan como supervision, un patron habitual para especializar modelos en lenguajes de programacion de baja representacion como Koka.

El repositorio incluye tres puntos de control (pasos 300, 400 y 500) con estado completo del entrenador (optimizador, scheduler y estados de numeros aleatorios), lo que permite reanudar el entrenamiento o comparar la evolucion del adaptador. Ademas, cada checkpoint tiene una variante `text_only` en la que se han eliminado los pesos de las torres de audio y vision, pensada para motores de inferencia que solo procesan texto. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de destilacion ni si se aplico RLHF o DPO posterior.

## Capacidades

- Generacion de codigo en Koka: el adaptador especializa al base en la sintaxis, biblioteca estandar y patrones idiomaticos de este lenguaje funcional.
- Razonamiento sobre efectos algebraicos: Koka es conocido por su sistema de efectos, por lo que el adaptador esta orientado a tareas que requieren ese modelo mental.
- Herencia de capacidades del base Gemma 4 E4B: al ser un adaptador, conserva las capacidades generales del modelo base (generacion de texto, codigo general, matematicas) en la medida en que el fine-tuning no las haya degradado.
- Soporte multimodal en los checkpoints completos: incluyen torres de vision y audio; las variantes `text_only` las eliminan.
- Tool calling y agentes: no disponible en la informacion proporcionada; depende de las capacidades del base y no se documenta ninguna modificacion al respecto.
- Capacidades multilingues: no disponible; el foco declarado es un lenguaje de programacion, no idiomas naturales.

## Casos de uso

- Asistente de codigo en Koka para editores: cargar el adaptador `checkpoint-500` con PEFT sobre Gemma 4 E4B y exponerlo como servidor de completado para autocompletar funciones, sugerir firmas con efectos y explicar errores del compilador de Koka.
- Generacion de ejemplos y tests para proyectos Koka: el modelo puede producir casos de prueba y ejemplos de uso de la biblioteca estandar, utiles en repositorios con poca cobertura.
- Traduccion de pseudocodigo o Haskell a Koka: aprovechar el conocimiento funcional del base y la especializacion del adaptador para portar fragmentos entre lenguajes funcionales.
- Investigacion sobre SD-SFT: los tres checkpoints con estado del entrenador permiten reproducir el pipeline, comparar la calidad en los pasos 300, 400 y 500 y estudiar la evolucion de la especializacion.
- Fine-tuning incremental: reanudar el entrenamiento desde `checkpoint-500` con nuevos datos de Koka o de otros lenguajes de nicho, gracias a que el repositorio conserva optimizador y scheduler.
- Despliegue en entornos con recursos limitados: usar las variantes `text_only` en motores de inferencia que solo soportan texto, reduciendo el peso del adaptador al eliminar las torres de audio y vision.
- Estudio de olvido catastrofico: comparar el rendimiento del base frente a cada checkpoint en tareas generales de codigo para medir cuanto se degrada la capacidad general al especializar en Koka.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de HumanEval, MMLU, GSM8K ni evaluaciones especificas de Koka, y el repositorio no adjunta informes de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende del base Gemma 4 E4B y de su cuantizacion. El adaptador LoRA en si es ligero (rank 16), pero requiere cargar el modelo base completo.
- GPU recomendadas: no disponible en la informacion proporcionada; el entrenamiento se realizo con el stack de Unsloth sobre base 4-bit, lo que sugiere viabilidad en GPUs de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: probablemente si, usando el base en 4-bit, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: PEFT (carga con `subfolder="checkpoint-500"`), y por extension los motores que soportan adaptadores LoRA sobre Gemma (vLLM, TGI, llama.cpp con conversion a GGUF). No se documentan integraciones probadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-3-0_sft_checkpoints | Adaptador LoRA sobre Gemma 4 E4B | no disponible (base E4B) | no disponible | gemma | Hugging Face, 0 descargas |
| Base `unsloth/gemma-4-E4B-it` | Modelo completo multimodal | E4B (efectivo 4B) | no disponible | gemma | Hugging Face |
| Adaptadores LoRA de codigo sobre Gemma | Adaptadores PEFT | variables | heredado del base | gemma | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas; la comparacion anterior es estructural.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y cargar el base `unsloth/gemma-4-E4B-it` (o su variante 4-bit) ademas de los pesos PEFT.
- Sin evaluacion publicada: no hay benchmarks que respalden la calidad del adaptador en Koka ni que midan el olvido catastrofico en tareas generales.
- Riesgo de alucinacion en APIs de Koka: al ser un lenguaje de nicho con poca representacion en los datos de preentrenamiento, es probable que el modelo invente funciones de la biblioteca estandar o firmas de efectos incorrectas; requiere verificacion con el compilador.
- Sesgos: no documentados; hereda los sesgos del base Gemma 4 E4B.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma de Google, que impone restricciones de uso aceptable y obligaciones de atribucion; revisar antes de desplegar.
- Idiomas: no se documenta soporte multilingue especifico; el foco es un lenguaje de programacion.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia, sin mantenimiento conocido; no apto para produccion sin validacion propia.
- Checkpoints con estado del entrenador: los archivos incluyen optimizador y scheduler, lo que infla el tamano del repositorio (1,2 GB) y no es necesario para inferencia; usar las variantes `text_only` o extraer solo el adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Base cuantizado usado en entrenamiento: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Lenguaje Koka: https://koka-lang.github.io/
