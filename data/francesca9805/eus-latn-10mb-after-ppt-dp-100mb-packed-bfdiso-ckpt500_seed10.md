# francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10

## Resumen

El modelo `eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10` es un ajuste fino (fine-tuning) de tipo supervisado (SFT) desarrollado por el usuario de HuggingFace francesca9805, vinculado a un entorno de investigación de la Universidad de Groningen segun los registros de Weights & Biases del autor. Se trata de un modelo de generacion de texto de arquitectura GPT-2 (transformer decoder-only) con 39.087.104 parametros totales (aproximadamente 39 millones), lo que lo situa en la categoria de modelos pequenos orientados a experimentacion.

El identificador del modelo sugiere un experimento sobre euskera ("eus" es el codigo ISO 639-3 del euskera y "latn" indica escritura latina), con un volumen de datos reducido (10 MB de un subconjunto y 100 MB empaquetados, segun la nomenclatura) y un checkpoint intermedio (etapa 500). El modelo parte de `francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10` y se ha entrenado con la libreria TRL 0.23.0, lo que indica un pipeline de post-entrenamiento sobre un modelo base previo.

Su relevancia es fundamentalmente academica: sirve como banco de pruebas reproducible (con semilla fija, `seed10`) para estudiar el efecto del ajuste SFT en modelos de baja escala y en lenguas de bajos recursos. No esta pensado para uso en produccion ni cuenta con datos publicados de rendimiento, idiomas confirmados ni licencia explicitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en GPT-2 |
| Parametros totales | 39.087.104 (~39 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el identificador apunta a euskera, `eus-latn`, sin confirmacion oficial) |
| Licencia | No disponible (la model card indica `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10 |
| Tamano del repositorio | 1,5 GB |
| Libreria de referencia | transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de estilo GPT-2, tal como refleja la etiqueta `gpt2` asociada al repositorio. Con 39 millones de parametros, se trata de una configuracion reducida respecto al GPT-2 estandar (124 M), lo que en la practica implica un vocabulario y/o un numero de capas y dimensiones ocultas menores, probablemente adaptados al corpus de entrenamiento especifico (un tokenizador propio, segun el contexto del proyecto del autor). La longitud de contexto no se documenta en la informacion disponible.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) sobre el modelo base `eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10`, usando TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se detalla en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. La etiqueta `after-ppt` del nombre y el sufijo `ckpt500` sugieren una fase posterior a un preentrenamiento y una evaluacion en la iteracion 500, respectivamente.

## Capacidades

- Generacion de texto autoregresiva en el dominio de entrenamiento del corpus utilizado.
- Ajuste supervisado (SFT) sobre un modelo base previamente entrenado, segun la model card.
- Capacidad multilingue: no confirmada. El identificador sugiere foco en euskera con escritura latina, pero no hay validacion ni declaracion oficial de idiomas soportados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- El ejemplo de uso de la model card emplea un formato de conversacion (`[{"role": "user", "content": ...}]`), lo que sugiere cierta adaptacion a plantillas tipo chat, aunque sin garantias de calidad.

## Casos de uso

- Experimentacion academica en procesamiento de lenguas de bajos recursos: el modelo permite estudiar como responde un GPT-2 de 39 M al ajuste SFT sobre corpus pequenos, con semillas fijas que facilitan la reproducibilidad en investigacion comparativa.
- Validacion de tokenizadores: dado que el proyecto del autor gira en torno a tokenizers (los registros de W&B se titulan "new-tokenizers"), este checkpoint es util para evaluar el impacto de decisiones de tokenizacion en la generacion final.
- Pruebas de pipelines de post-entrenamiento con TRL: sirve como caso minimo para verificar configuraciones de SFT, learning rate y checkpoints antes de escalar a modelos mayores.
- Docencia y formacion: un modelo de 39 M puede ejecutarse en portatiles o incluso en CPU, lo que lo hace adecuado para demostraciones en aula sobre generacion de texto, atencion y decodificacion autoregresiva.
- Ablation studies controlados: al existir variantes del mismo autor con distintos volumenes de datos (10 MB, 100 MB) y semillas, permite aislar el efecto del tamano de corpus y de la semilla inicial en el rendimiento.
- Prototipado rapido de aplicaciones de texto en entornos sin GPU: su huella de memoria minima permite integrarlo en pruebas de concepto locales antes de migrar a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en fp32 y unos 80 MB en fp16/bf16, sin contar la cache de activaciones (despreciable para contextos cortos).
- Cabe con holgura en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090, e incluso en GPUs integradas.
- Puede ejecutarse en CPU de forma interactiva; tambien en dispositivos tipo Raspberry Pi para pruebas ligeras.
- Opciones de despliegue: `transformers` (pipeline de text-generation), llama.cpp/Ollama si se generan pesos GGUF, y text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera latencia muy baja en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| eus-latn-10mb-after-ppt-...-ckpt500_seed10 | 39 M | No disponible | No disponible | Pesos abiertos en HF | No disponible |
| GPT-2 small | 124 M | 1024 tokens | MIT | Pesos abiertos en HF | Benchmarks publicos (no aplicables a este corpus) |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Pesos abiertos en HF | Benchmarks publicos (no comparables directamente) |
| Variantes del mismo autor (`eng-latn-...`, `eus-latn-...`) | ~39 M | No disponible | No disponible | Pesos abiertos en HF | No disponibles |

La comparacion con GPT-2 y DistilGPT-2 es orientativa en cuanto a orden de magnitud: el modelo aqui descrito es mas pequeno y esta especializado en un corpus reducido, por lo que no es equiparable en cobertura linguistica ni en calidad generalista. No hay datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de evaluacion publica: no hay benchmarks, ni metricas de perplejidad, ni evaluaciones cualitativas documentadas.
- Riesgo elevado de alucinacion: al ser un modelo pequeno entrenado con corpus limitado, tiende a generar texto incoherente o factualmente incorrecto fuera del dominio de entrenamiento.
- Cobertura idiomatica incierta: no se declaran idiomas soportados; el uso en castellano o ingles no esta garantizado y probablemente produzca resultados pobres.
- Contexto limitado (valor no publicado): la arquitectura GPT-2 original maneja 1024 tokens, pero la ventana real de este checkpoint no esta confirmada.
- Licencia sin especificar: la model card indica `licence: license` sin terminos concretos, por lo que no se puede asumir permiso para uso comercial. Se recomienda contactar al autor antes de cualquier despliegue en produccion.
- Sin garantias de soporte: el repositorio registra 0 descargas y 0 "likes", y no hay documentacion adicional ni issues, lo que implica ausencia de mantenimiento y de comunidad.
- No apto para produccion: se trata de un artefacto de investigacion con semilla fija y checkpoint intermedio, no de un modelo pulido para tareas reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/nf1xp91x
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en ingles del mismo autor: https://huggingface.co/francesca9805/eng-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455
- Variante empaquetada: https://huggingface.co/francesca9805/eng-latn-10mb-after-ppt-Dp-10mb-packed-wrapped-ckpt500_seed10
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/eng-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10
- Ficha en savrn: https://savrn.com/models/eng-latn-10mb-after-ppt-dp-100mb-packed-ckpt500-seed3407
