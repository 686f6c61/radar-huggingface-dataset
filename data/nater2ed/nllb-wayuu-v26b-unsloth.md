# nater2ed/nllb-wayuu-v26b-unsloth

## Resumen

nllb-wayuu-v26b-unsloth es un adaptador LoRA (PEFT) publicado por el usuario nater2ed sobre el modelo base facebook/nllb-200-distilled-1.3B, el modelo de traduccion automatica multilingue de Meta AI presentado en el paper No Language Left Behind (NLLB). El adaptador se ha entrenado con la libreria Unsloth, segun indican las etiquetas del repositorio, y su nombre sugiere un ajuste orientado a la lengua wayuu (wayuunaiki), una lengua indigena del Caribe colombiano y venezolano. El repositorio tiene un tamano de 2,2 GB, lo que es coherente con un adaptador LoRA de rango relativamente alto o con pesos almacenados en precision alta, aunque la model card no detalla la configuracion exacta.

La relevancia de este modelo radica en su enfoque: la adaptacion de un sistema de traduccion de alto rendimiento a una lengua de bajos recursos, un caso de uso tipico de la investigacion en NLP multilingue. NLLB-200-distilled-1.3B es un transformer encoder-decoder de 1.300 millones de parametros que cubre 200 idiomas, y el ajuste fino con LoRA permite especializarlo sin reentrenar el modelo completo.

No obstante, la informacion publicada es extremadamente escasa: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declaran licencia, idiomas ni pipeline, y no hay resultados de evaluacion. Cualquier uso en produccion requeriria validacion propia. El modelo se creo el 11 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base NLLB-200); adaptador LoRA sobre el modelo base |
| Parametros totales | 1.300 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (NLLB-200 se entrena con segmentos de hasta 512 tokens, segun el paper original; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers, no documentada aqui) |
| Idiomas soportados | no disponible; el nombre sugiere wayuu, pero no se declara oficialmente |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2, transformers, Unsloth |
| Modelo base | facebook/nllb-200-distilled-1.3B |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

El modelo base facebook/nllb-200-distilled-1.3B es un transformer encoder-decoder de tipo seq2seq, destilado a partir del NLLB-200 completo, disenado para traduccion automatica entre 200 idiomas. El adaptador publicado es un conjunto de pesos LoRA (Low-Rank Adaptation) que modifica las capas del modelo base para especializarlo en una tarea o idioma concreto. Segun las etiquetas del repositorio, el entrenamiento se realizo con Unsloth, una libreria optimizada para fine-tuning eficiente en memoria de modelos grandes.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, los hiperparametros del ajuste (rango LoRA, alpha, tasa de aprendizaje, epocas) ni si se aplicaron tecnicas de RLHF o DPO. La model card no incluye ninguna seccion rellenada sobre datos o procedimiento de entrenamiento. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de LoRA y Unsloth.

## Capacidades

- Traduccion automatica: el modelo base NLLB-200 esta disenado para traduccion multilingue; el adaptador probablemente especializa el modelo en la direccion o pares de lenguas relacionados con el wayuu, aunque esto no se confirma en la documentacion.
- Generacion de texto condicionada a tarea de traduccion: al ser un modelo seq2seq, su uso principal es la transformacion de secuencias, no la generacion libre de texto conversacional.
- Soporte de tool calling / function calling: no disponible; el modelo base no esta disenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad del modelo base ni se documenta en el adaptador.
- Capacidades multilingues: el modelo base cubre 200 idiomas; el alcance efectivo del adaptador no esta documentado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Traduccion wayuu-espanol en servicios publicos: el adaptador podria emplearse para traducir comunicaciones oficiales, formularios o avisos sanitarios a wayuunaiki, aprovechando el modelo base NLLB para mantener fluidez en la direccion espanol-wayuu; requiere validacion con hablantes nativos antes de cualquier despliegue.
- Preservacion y documentacion linguistica: uso del adaptador para generar traducciones de referencia de textos historicos o etnograficos, que despues revisaria un linguista, acelerando la creacion de corpus paralelos.
- Educacion bilingue: integracion en plataformas de aprendizaje para ofrecer material de apoyo en wayuu a estudiantes de La Guajira, con el modelo ejecutandose en servidor y el texto revisado por docentes.
- Investigacion en NLP de bajos recursos: punto de partida para experimentos de adaptacion de NLLB a otras lenguas indigenas, comparando la eficacia de LoRA con Unsloth frente a fine-tuning completo.
- Traduccion de contenido comunitario: traduccion de articulos, cuentos o publicaciones de organizaciones indigenas, con un flujo de revision humana obligatorio dada la ausencia de metricas de calidad publicadas.
- Prototipado rapido de sistemas de traduccion: al ser un adaptador ligero sobre un modelo de 1.300 millones de parametros, permite iterar en una sola GPU consumer y desplegar un servicio de traduccion experimental con requisitos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.300 millones de parametros ocupa aproximadamente 2,6 GB en fp16 y alrededor de 1,4 GB en cuantizacion de 8 bits; el adaptador anade una cantidad no especificada (el repositorio pesa 2,2 GB, pero parte de ese peso puede corresponder a checkpoints de entrenamiento).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento o fine-tuning adicional con Unsloth, se recomienda una RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas con 6 GB o mas de VRAM para inferencia del modelo base.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; el modelo base puede servirse con vLLM o TGI si se fusionan los pesos LoRA en el modelo completo; llama.cpp u Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nater2ed/nllb-wayuu-v26b-unsloth | 1.300 M (base) + adaptador | no disponible | no disponible (wayuu presumiblemente) | no disponible | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-1.3B | 1.300 M | 512 tokens (entrenamiento) | 200 | CC-BY-NC 4.0 (modelo base) | Hugging Face, ampliamente utilizado |
| facebook/m2m100_1.2B | 1.200 M | 1024 tokens | 100 | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-* | variable (por par) | variable | por par | variable | Hugging Face |

La comparativa se limita a los modelos base y alternativas genericas de traduccion, ya que no se dispone de datos de rendimiento del adaptador. La licencia del modelo base NLLB-200 es CC-BY-NC 4.0, lo que restringe el uso comercial del modelo derivado salvo que se obtenga permiso de Meta.

## Limitaciones y advertencias

- La model card esta sin rellenar: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones, lo que impide evaluar su calidad de forma objetiva.
- No se declara licencia para el adaptador; la licencia del modelo base (CC-BY-NC 4.0) limita el uso comercial del conjunto.
- Riesgo de alucinacion y de traducciones incorrectas: sin metricas como BLEU, chrF o COMET, no hay evidencia de calidad; en lenguas de bajos recursos los errores pueden ser sistematicos.
- Sesgos potenciales: el modelo base NLLB puede reflejar sesgos de genero, cultura o religion presentes en sus datos de entrenamiento; el adaptador no documenta mitigaciones.
- Limitaciones de contexto e idioma: no se especifica la direccion de traduccion ni el par de lenguas exacto; el nombre sugiere wayuu, pero no se confirma.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Para produccion: se recomienda fusionar el adaptador con el modelo base, validar con hablantes nativos y establecer un flujo de revision humana antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nater2ed/nllb-wayuu-v26b-unsloth
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper NLLB (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
