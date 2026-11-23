# klungkunboy/leony

## Resumen

`klungkunboy/leony` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario klungkunboy. No se trata de un modelo base autonomo, sino de un conjunto de pesos de bajo rango (LoRA) que se carga sobre los checkpoints oficiales de Krea 2 (RAW y Turbo) para ensenar al modelo un concepto concreto activado mediante la palabra disparadora `@leony`. El adaptador esta entrenado sobre `krea/Krea-2-Raw` y esta pensado para ejecutarse en inferencia sobre `krea/Krea-2-Turbo`, el checkpoint destilado de 8 pasos.

La relevancia de esta ficha es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, la model card es en gran parte autogenerada y contiene secciones sin completar (marcadas como TODO), y no se publican datos sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni resultados cualitativos. Se trata, por tanto, de un artefacto experimental de personalizacion de un modelo de difusion, no de un modelo fundacional evaluable.

Krea 2 se distribuye en dos variantes: RAW, el checkpoint base no destilado sobre el que se entrena, y Turbo, un checkpoint destilado para inferencia rapida en 8 pasos sin classifier-free guidance. El LoRA se entrena sobre RAW y se aplica sobre Turbo, segun indica el autor. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (pesos LoRA; numero de parametros no publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen; no hay contexto de tokens de lenguaje declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de texto depende del codificador de texto del modelo base Krea 2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo LoRA en el repositorio) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de DreamBooth entrenado con el entrenador de Krea 2 de la libreria diffusers (`examples/dreambooth/README_krea2.md`). El entrenamiento se realizo sobre `krea/Krea-2-Raw`, el checkpoint no destilado de Krea 2, siguiendo la recomendacion del ecosistema de entrenar sobre RAW y desplegar sobre Turbo. La palabra disparadora definida por el autor es `@leony`, que debe incluirse en el prompt para activar el concepto aprendido.

No se dispone de informacion sobre el numero de imagenes del dataset, la resolucion de entrenamiento, el rango y alpha del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion de los datos. La model card incluye secciones de "Training details" y "Limitations and bias" sin completar (marcadas como TODO por el autor). Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, captions automaticos o aumento de datos.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por un concepto personalizado activado con la palabra `@leony`.
- Inferencia rapida sobre Krea 2 Turbo con receta de 8 pasos y `guidance_scale=0.0` (sin classifier-free guidance), segun el ejemplo de la model card.
- Carga y composicion con otros LoRA mediante `load_lora_weights` de diffusers, incluyendo ponderacion, mezcla y fusion de adaptadores.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers en `torch.bfloat16` sobre CUDA.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un modelo puramente generativo de imagen.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Personalizacion de un personaje o estilo concreto: cargar el LoRA sobre Krea 2 Turbo y usar `@leony` en el prompt para generar variaciones coherentes del concepto aprendido en distintas poses, escenas e iluminaciones.
- Prototipado rapido de conceptos visuales: al ejecutarse en 8 pasos sobre Turbo, permite iterar prompts y semillas con baja latencia antes de comprometerse a un entrenamiento mayor o a un modelo de produccion.
- Composicion con otros adaptadores: combinar este LoRA con otros LoRA de estilo o de personaje mediante las utilidades de diffusers para obtener mezclas controladas con pesos ajustables.
- Experimentacion en investigacion sobre DreamBooth: sirve como ejemplo reproducible del flujo de entrenamiento Krea 2 RAW y despliegue en Turbo para estudiar la transferencia de LoRA entre checkpoints base y destilados.
- Generacion de material grafico para pruebas internas: imagenes de concepto para maquetas, storyboards o presentaciones internas, sin garantia de calidad de produccion dado el estado experimental del adaptador.
- Evaluacion comparativa de adaptadores: al ser un artefacto pequeno y aislado, es util para medir como varian los resultados al cambiar el peso del LoRA o al fusionarlo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para Krea 2 en la informacion proporcionada; depende del checkpoint base (RAW o Turbo), de la precision (el ejemplo usa `bfloat16`) y de la resolucion de salida.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo oficial asume una GPU CUDA compatible con `torch.bfloat16`.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta el consumo de memoria en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este caso).
- Latencia y throughput: no disponibles; la receta de 8 pasos de Turbo sugiere una inferencia mas rapida que la del checkpoint RAW, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| klungkunboy/leony | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Modelo base destilado de 8 pasos | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face (referenciado como base) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos base que permitan una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card incompleta: las secciones de uso, limitaciones, sesgos y detalles de entrenamiento estan sin rellenar (TODO), por lo que no hay documentacion sobre el dataset ni sobre el comportamiento esperado.
- Sin validacion externa: cero descargas y cero likes; no hay evidencia de calidad, consistencia del concepto ni robustez frente a distintos prompts.
- Riesgo de sobreajuste al concepto: al ser un LoRA de DreamBooth con una unica palabra disparadora, puede degradar la diversidad de las generaciones o filtrar caracteristicas del dataset de entrenamiento en prompts no relacionados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias, textos o composiciones incoherentes, especialmente en resoluciones altas o prompts complejos.
- Dependencia del modelo base: el comportamiento final depende de Krea 2 Turbo y de su codificador de texto; los idiomas y la calidad del prompt estan limitados por el modelo base, cuyas especificaciones no se detallan aqui.
- Licencia: Apache 2.0 declarada para el adaptador, pero el uso comercial debe verificarse tambien contra la licencia de los checkpoints base de Krea 2, que no se detalla en la informacion proporcionada.
- Sin garantias para produccion: no hay benchmarks, ni pruebas de latencia, ni documentacion de cuantizaciones; no se recomienda su uso en pipelines de produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klungkunboy/leony
- Checkpoint base RAW: https://huggingface.co/krea/Krea-2-Raw
- Checkpoint base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Paper de DreamBooth: https://dreambooth.github.io/
- Entrenador DreamBooth de Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
