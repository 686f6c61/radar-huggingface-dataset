# francesca9805/nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407

## Resumen

El modelo `nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407` es un modelo de generacion de texto de 39.087.104 parametros (aproximadamente 39 millones) desarrollado por el usuario francesca9805 y publicado en HuggingFace. Se trata de un ajuste fino (SFT) mediante la libreria TRL sobre el modelo base `francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`, que a su vez forma parte de una familia de experimentos con identificadores muy similares (distintas semillas, variantes de idioma y de preprocesado de datos). La etiqueta `gpt2` en los metadatos indica que la arquitectura subyacente es un transformer decoder-only de tipo GPT-2.

El nombre del modelo revela su naturaleza experimental: `nor-latn` sugiere noruego en escritura latina, `10mb` apunta a un corpus de entrenamiento de 10 MB, `packed` indica empaquetado de secuencias y `ckpt500` hace referencia al checkpoint numero 500. Por tanto, no es un modelo orientado a produccion, sino un artefacto de investigacion para estudiar el comportamiento de modelos pequenos entrenados con presupuestos de datos muy reducidos.

Su relevancia actual es acotada y de perfil academico: sirve como punto de comparacion en estudios de tokenizacion, empaquetado de secuencias y ajuste supervisado con TRL, y como caso extremo de modelo que cabe en cualquier dispositivo. No se ha publicado informacion sobre licencia, idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los modelos GPT-2 suelen emplear 1024 tokens) |
| Tipos de cuantizacion | No disponible; pesos originales en safetensors (probablemente bf16/fp32) |
| Idiomas soportados | No disponible en los metadatos; el identificador sugiere noruego en escritura latina (`nor-latn`) |
| Licencia | No disponible (el README incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, segun la etiqueta `gpt2` de los metadatos de HuggingFace. Con 39 millones de parametros, es sustancialmente mas pequeno que GPT-2 small (124 M), lo que sugiere una configuracion personalizada con menos capas o dimensiones reducidas, aunque no se dispone de los hiperparametros concretos (numero de capas, dimension del modelo, cabezas de atencion). El modelo se distribuye en formato safetensors y es compatible con la libreria Transformers y con text-generation-inference.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo base fue `francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`, y existe un registro publico del entrenamiento en Weights & Biases (proyecto `new-tokenizers`, ejecucion `jhyfavv6`). El identificador indica que se uso un corpus de 10 MB, secuencias empaquetadas y un checkpoint intermedio (el numero 500). No se especifican la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas posteriores como RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste supervisado orientado a seguir instrucciones conversacionales simples, segun el ejemplo de uso de la model card (formato de mensajes con rol `user`).
- Generacion de texto en noruego (inferido del identificador `nor-latn`), si bien no se confirma oficialmente.
- Compatibilidad con el pipeline `text-generation` de Transformers y con text-generation-inference.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue explicita mas alla del posible noruego.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre tokenizacion: el sufijo `new-tokenizers` del proyecto de W&B indica que esta familia de modelos se uso para evaluar el impacto de distintos tokenizadores; este checkpoint sirve como punto de comparacion en estudios de vocabulario y segmentacion.
- Experimentos de ajuste con TRL: permite reproducir y auditar un flujo de SFT minimo (modelo de 39 M, dataset reducido) como referencia para validar configuraciones de entrenamiento.
- Ablaciones sobre empaquetado de secuencias: la etiqueta `packed` sugiere que el modelo se entreno con secuencias empaquetadas, de modo que es util para comparar este regimen frente a alternativas sin empaquetar.
- Analisis de modelos de 10 MB de datos: sirve para estudiar que tipo de estructura linguistica se aprende con un presupuesto de datos extremadamente bajo y cuantificar el olvido o la degradacion respecto al modelo base.
- Prototipado en dispositivos con recursos minimos: con 39 M de parametros, cabe en CPU, microcontroladores de gama alta o GPUs integradas, lo que permite pruebas de concepto de generacion de texto local sin infraestructura dedicada.
- Docencia y demostraciones: su tamano permite ejecutar inferencia en un portatil y explicar de forma practica el funcionamiento de un transformer generativo y de un pipeline de SFT.
- Destilacion y modelos de profesor-alumno: puede emplearse como alumno en experimentos de destilacion de conocimiento desde modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,16 GB en fp32, 0,08 GB en bf16/fp16 y 0,04 GB en int8. La ficha de LLM Explorer para un modelo de esta misma familia (39,1 M de parametros) indica un consumo de VRAM del orden de 0,1 GB.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; por ejemplo GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100, aunque en estas ultimas el modelo no aprovechara la capacidad de computo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU o en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: pipeline `text-generation` de Transformers, text-generation-inference (TGI), servidores compatibles con la API de HuggingFace Endpoints y, previa conversion, llama.cpp u Ollama mediante GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, la generacion en CPU deberia ser de decenas de tokens por segundo y en GPU de cientos, pero se trata de una estimacion no confirmada por el autor.
- Nota sobre el repositorio: el repo ocupa 4,8 GB pese a que los pesos del modelo son de decenas de MB, lo que indica que probablemente contiene multiples checkpoints, estados del optimizador u otros artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407 | 39,1 M | No disponible | No disponible | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens | MIT | HuggingFace, muy extendido |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | HuggingFace |

Los datos de los modelos comparativos proceden de sus fichas publicas y se incluyen como referencia general del segmento de modelos pequenos. No se dispone de resultados de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad; en el resto de dimensiones debe considerarse "no disponible".

## Limitaciones y advertencias

- No hay informacion publicada sobre sesgos del modelo; dado el corpus reducido (10 MB) y probablemente monolingue, es esperable que presente sesgos derivados de esa fuente concreta.
- Riesgo elevado de alucinacion y de generacion incoherente: con 39 M de parametros y un volumen de entrenamiento muy bajo, la calidad del texto generado sera limitada.
- Contexto limitado: no se ha confirmado la ventana de contexto, y el empaquetado de secuencias no implica una ampliacion de la misma.
- Cobertura idiomatica restringida: el nombre sugiere noruego, pero no hay confirmacion oficial ni datos sobre otros idiomas.
- Licencia no disponible: no se puede asumir uso comercial libre. El README incluye un campo `licence: license` sin especificar, lo que impide determinar las condiciones de redistribucion.
- Naturaleza experimental: se trata de un checkpoint intermedio (`ckpt500`) dentro de una linea de investigacion, no de un modelo final optimizado.
- Ausencia de evaluacion: no hay benchmarks publicados, por lo que no es posible estimar su rendimiento relativo frente a alternativas.
- No apto para produccion sin validacion previa: carece de documentacion sobre seguridad, filtrado de contenido o comportamiento en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Variante con semilla 455: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Variante `shuff-dyck` con semilla 10: https://huggingface.co/francesca9805/nor-latn-10mb-after-ppt-shuff-dyck-10mb-packed-ckpt500_seed10
- Variante en ingles (`eng-latn`) con semilla 10, ficha en LLM Explorer: https://llm-explorer.com/model/francesca9805%2Feng-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed10,4XryJvTiaaPJ6AdvKdFeci
- Ficha del modelo base en Free2AITools: https://free2aitools.com/model/francesca9805/nor-latn-10mb-ppt-dp-10mb-packed-bfdiso_seed3407
- Ficha del modelo base en FriendliAI: https://friendli.ai/models/francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/jhyfavv6
- Repositorio de TRL: https://github.com/huggingface/trl
