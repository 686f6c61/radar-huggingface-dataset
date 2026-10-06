# h3lloworld/ebc-jepa-rope-phys-cont-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment rope_phys_cont (ED24) es un adaptador de ajuste fino publicado por el usuario h3lloworld sobre el backbone V-JEPA 2.1 ViT-B de Meta. No se trata de un modelo autonomo, sino de un conjunto de tensores entrenados (proyeccion del tokenizador de eventos, cabeza por evento y adaptadores LoRA de rango 8 sobre las proyecciones qkv y proj) que se cargan encima del checkpoint publico `vjepa2_1_vitb_dist_vitG_384.pt`. Su proposito concreto es el denoising de camaras de eventos, es decir, la limpieza de ruido en flujos de eventos generados por sensores neuromorficos.

El experimento se enmarca en la linea EBC-JEPA y compara dos variantes de codificacion posicional rotatoria (RoPE): una continua frente a una discreta. La variante aqui publicada es la fisica continua (`rope_phys_cont`), entrenada sobre la totalidad de los 2.100 ficheros oficiales del dataset ED24 (originalmente asociado a EDformer) y evaluada en generalizacion sobre DND21 y E-MLB. La relevancia actual radica en que aplica tecnicas de autoaprendizaje predictivo (JEPA) y de adaptacion eficiente (LoRA) a un problema de vision de eventos donde los modelos densos suelen ser costosos.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,0 GB y una licencia MIT. Es, por tanto, un artefacto de investigacion mas que un modelo empaquetado para produccion: no incluye pipeline declarado ni pesos en formatos de despliegue convencionales (safetensors, GGUF), solo un fichero `trainable.pt` con los tensores entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B) de V-JEPA 2.1 con adaptadores LoRA (qkv, proj; rango 8) y cabeza por evento |
| Parametros totales | No disponible (backbone ViT-B de V-JEPA 2.1; cifra exacta no indicada en la informacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del layout, ventana y modo de RoPE definidos en config.json) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision sobre eventos, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`trainable.pt`); solo tensores entrenados, no checkpoint completo |

## Arquitectura y entrenamiento

El modelo parte del backbone V-JEPA 2.1 ViT-B, un transformer de vision entrenado con el paradigma JEPA (Joint Embedding Predictive Architecture), que aprende representaciones prediciendo en espacio latente en lugar de reconstruir pixeles. Sobre ese backbone se anaden adaptadores LoRA de rango 8 en las proyecciones de query, key y value (qkv) y en la proyeccion de salida (proj), junto con una proyeccion del tokenizador de eventos y una cabeza especifica por evento. La innovacion experimental es el uso de codificacion posicional rotatoria continua con formulacion fisica (`rope_phys_cont`), comparada contra una variante discreta. Los descriptores quedan desactivados.

El entrenamiento se realizo sobre los 2.100 ficheros oficiales del dataset ED24 (EDformer). La evaluacion de generalizacion se llevo a cabo sobre DND21 y E-MLB, empleando el script `tools/lora_denoise/eval_emlb.py` del repositorio de codigo asociado. No se detalla en la informacion disponible el numero total de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (poco plausibles en un modelo de vision de este tipo).

## Capacidades

- Denoising de flujos de eventos procedentes de camaras neuromorficas.
- Adaptacion eficiente al backbone V-JEPA 2.1 ViT-B mediante LoRA de rango 8, sin reentrenar el modelo completo.
- Procesamiento de tokens de eventos con una proyeccion dedicada y una cabeza por evento.
- Evaluacion de generalizacion sobre los datasets DND21 y E-MLB.
- Comparacion controlada entre variantes de RoPE (continua frente a discreta) en el contexto del denoising de eventos.
- No dispone de generacion de texto, tool calling, capacidades de agente, multilingues ni funciones multimodales de tipo texto-vision.

## Casos de uso

- Preprocesado en pipelines de vision de eventos: limpiar el ruido de los flujos de una camara neuromorfica antes de alimentar tareas posteriores de deteccion o seguimiento, aprovechando la adaptacion especifica sobre ED24.
- Robotica de baja latencia: las camaras de eventos se usan en robotica por su alta resolucion temporal; este modelo reduce el ruido que degrada la estimacion de movimiento en esos sistemas.
- Vision para conduccion autonoma: en escenarios de alta luminosidad dinamica y movimiento rapido, el denoising de eventos mejora la calidad de la senal para modulos de percepcion.
- Investigacion en codificacion posicional: sirve como punto de comparacion reproducible entre RoPE continuo y discreto aplicado a transformers de vision sobre eventos.
- Transferencia a nuevos dominios de eventos: dado que fue evaluado en DND21 y E-MLB, puede emplearse como referencia de generalizacion antes de reentrenar sobre un dataset propio.
- Base para ajuste con LoRA en produccion: al cargarse sobre el checkpoint publico de V-JEPA 2.1 ViT-B, permite anadir denoising de eventos a un pipeline que ya use ese backbone sin duplicar pesos.
- Benchmarking academico de denoising de eventos: el repositorio incluye `metrics.json`, lo que facilita comparaciones cuantitativas si se dispone del dataset de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio incluye un fichero `metrics.json` que presumiblemente contiene las metricas de evaluacion, pero sus valores no se han facilitado en la busqueda, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un backbone ViT-B en precision fp16 ocupa del orden de 0,2 GB solo en pesos; con las activaciones de inferencia el consumo seria muy reducido y cabria en practicamente cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, cualquier GPU con unos pocos GB de VRAM seria suficiente.
- Cabe en GPU consumer: si, en principio en cualquier GPU consumer moderna (por ejemplo, gamas RTX 30/40), dado el tamano reducido del backbone ViT-B.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La evaluacion se realiza mediante el script `tools/lora_denoise/eval_emlb.py` del repositorio de codigo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBC-JEPA rope_phys_cont (ED24) | No disponible (backbone ViT-B) | No disponible | Sin cifras publicadas en la informacion | MIT | HuggingFace (0 descargas) |
| EDformer | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | Origen del dataset ED24 |
| V-JEPA 2.1 ViT-B (Meta) | Backbone ViT-B | No disponible en la informacion | No disponible en la informacion | MIT | Checkpoint publico de Meta |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: `trainable.pt` solo guarda los tensores entrenados y requiere cargar el checkpoint publico de V-JEPA 2.1 ViT-B por separado.
- No hay cifras de benchmarks publicadas en la informacion disponible, por lo que no puede verificarse su rendimiento real frente a alternativas.
- El modelo esta especializado en un unico dominio (denoising de camaras de eventos) y entrenado sobre ED24; su comportamiento fuera de esa distribucion depende de la generalizacion observada en DND21 y E-MLB, que no se cuantifica aqui.
- No dispone de capacidades linguisticas, de tool calling ni de razonamiento multi-paso.
- El repositorio registra 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que sugiere que puede estar vacio o incompleto en el momento de la consulta; conviene verificar la integridad de `trainable.pt`, `metrics.json` y `config.json`.
- La licencia MIT facilita el uso comercial, pero al derivar de V-JEPA 2/2.1 de Meta conviene comprobar las condiciones del checkpoint base antes de explotarlo en produccion.
- La fecha de creacion y actualizacion indicada (2026-10-06) es posterior a la fecha actual habitual de consulta; podria tratarse de un error de metadatos o de un repositorio de caracter prospectivo.
- No se especifican sesgos conocidos; al tratarse de un modelo de vision sobre eventos, los sesgos relevantes serian los del dataset ED24, que no se documentan.

## Enlaces

- HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-phys-cont-ed24-denoiser
- Codigo: https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Documentacion del protocolo (HANDOFF.md): https://github.com/whohyf/EBC-JEPA-share/blob/denoise-lora/docs/lora_denoise/HANDOFF.md
- Checkpoint base V-JEPA 2.1 ViT-B: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
