# francesca9805/nld-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10

## Resumen

Este repositorio contiene un ajuste fino supervisado (SFT) del modelo base `francesca9805/nld-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10`, entrenado con la libreria TRL sobre una arquitectura GPT-2 de 124.770.816 parametros (confirmados en los pesos safetensors). El identificador sugiere que se trata de un modelo de lenguaje en neerlandes (codigo ISO 639-3 `nld`) con escritura latina, entrenado sobre un corpus del orden de 100 MB, con alguna variante de empaquetado de secuencias y una semilla fija (`seed10`). El autor es el usuario de HuggingFace `francesca9805`, y el enlace de Weights & Biases de la model card apunta a la organizacion `f-padovani-university-of-groningen`, lo que situa el trabajo en un contexto academico de investigacion sobre tokenizadores y eficiencia de datos.

El modelo se publica como un checkpoint intermedio (sufijo `ckpt500`), lo que indica que forma parte de un barrido experimental mas amplio: existen repositorios hermanos con nombres como `eng-latn-100mb-after-ppt-Dp-10mb-packed-wrapped-ckpt500_seed10` (version en ingles) o `eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455`, lo que apunta a experimentos controlados sobre tamano de corpus, empaquetado y tokenizador. Su relevancia, por tanto, no es la de un modelo de produccion, sino la de una pieza reproducible para estudiar como afectan estas variables al comportamiento de un transformer pequeno.

La informacion publicada es muy escasa: no hay datos de benchmarks, no hay ficha de licencia efectiva (el campo `licence: license` es un marcador de posicion) y no se documentan idiomas, contexto ni composicion del dataset de SFT. Cualquier evaluacion debe tratarse, por tanto, como exploratoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se han publicado variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el identificador `nld-latn` sugiere neerlandes con escritura latina, sin confirmacion en la model card) |
| Licencia | no disponible (la model card incluye el marcador `licence: license`, que no constituye una licencia efectiva) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,0 GB |
| Modelo base | `francesca9805/nld-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10` |
| Metodo de ajuste | SFT con TRL 0.23.0 (Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1) |
| Pipeline declarado | text-generation |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio, junto con el recuento de 124,77 millones de parametros, es coherente con un transformer decoder-only de tipo GPT-2 en configuracion pequena (orden de 12 capas y 768 dimensiones de modelo, aunque la configuracion exacta no se detalla en la informacion disponible). La model card no especifica si se modifico el vocabulario del tokenizador, algo plausible dado el nombre del proyecto de seguimiento en Weights & Biases (`new-tokenizers`) y el prefijo `nld-latn` del identificador. Tampoco se indica la longitud de contexto efectiva durante el entrenamiento.

El procedimiento de entrenamiento publicado es un ajuste fino por supervision (SFT) partiendo del modelo base citado, ejecutado con TRL 0.23.0 y registrado en Weights & Biases (run `rk9omyej`). No se documentan el numero de tokens de entrenamiento, la composicion del dataset de instrucciones, ni si hubo etapas posteriores de RLHF o DPO. El sufijo `ckpt500` sugiere que el modelo corresponde al paso 500 de un entrenamiento mas largo y que existen otros checkpoints intermedios no publicados o distribuidos por separado. El nombre del modelo base (`100mb-ppt-Dp-10mb-packed-bfdiso`) indica un corpus del orden de 100 MB con empaquetado de secuencias, un volumen propio de experimentos de eficiencia de datos mas que de modelos de proposito general.

## Capacidades

- Generacion de texto autoregresiva, en la linea de un GPT-2 pequeno ajustado con SFT; el ejemplo de la model card usa una plantilla de conversacion con roles (`{"role": "user", "content": ...}`).
- Ajuste al formato de chat con un unico turno de usuario, segun el `quick start` publicado.
- Generacion bilingue potencial (neerlandes e ingles) si se confirma la relacion con el repositorio hermano `eng-latn-...`; no verificado.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- No hay evidencia publicada de capacidades de codigo o matematicas mas alla de lo que un GPT-2 pequeno puede ofrecer de forma incidental.
- Capacidad multilingue: no disponible; el identificador apunta a un unico idioma.

## Casos de uso

- Investigacion sobre tokenizadores y eficiencia de datos: el modelo pertenece a una familia de variantes (`packed`, `wrapped`, `bfd`, `bfdiso`) con distintos tamanos de corpus (10 MB frente a 100 MB) y semillas, lo que permite comparar de forma controlada el efecto del preprocesado y del vocabulario en un transformer de 124M de parametros.
- Estudio de dinamica de entrenamiento por checkpoints: al tratarse de un `ckpt500`, es util para analizar la evolucion de la perdida y de las capacidades emergentes en pasos intermedios, comparandolo con otros checkpoints del mismo barrido.
- Punto de partida para ajuste fino en tareas de PLN en neerlandes: al ser un modelo pequeno y de dominio acotado, se puede adaptar con pocos recursos a clasificacion de texto, etiquetado o resumen extractivo mediante una cabeza especifica.
- Despliegue en entornos con recursos muy limitados: con menos de 1 GB de VRAM en bf16, cabe en GPU de gama baja, en CPU de portatil e incluso en dispositivos tipo Raspberry Pi si se convierte a un formato de cuantizacion adecuado.
- Generacion de datos sinteticos a pequena escala o aumentacion de corpus neerlandeses en experimentos academicos, siempre con revision humana posterior dado el riesgo de incoherencia.
- Reproducibilidad de experimentos academicos: la semilla fija (`seed10`) y las versiones exactas de librerias permiten replicar el ajuste y comparar contra los modelos hermanos.
- Prototipado de interfaces conversacionales de bajo coste: la plantilla de chat de la model card facilita integrarlo con `transformers.pipeline` para demos internas, no para atencion al cliente en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones multilingues, y los repositorios hermanos encontrados tampoco aportan cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento real de parametros, sin incluir cache KV ni activaciones):
  - fp32: aproximadamente 0,5 GB.
  - bf16/fp16: aproximadamente 0,25 GB.
  - int8: aproximadamente 0,13 GB.
  - int4: aproximadamente 0,07 GB.
- En la practica, el consumo total con cache KV y activaciones se mantiene holgadamente por debajo de 1-2 GB en bf16, por lo que cabe en cualquier GPU de consumo (GTX 1050 Ti 4 GB, RTX 3060, RTX 4090, etc.) y tambien en CPU.
- GPU recomendadas: no requiere aceleradores de datacenter; una RTX 3060 o superior es mas que suficiente. A100/H100 solo tendrian sentido para lotes muy grandes o para reentrenamiento.
- Cabe en GPU de consumo: si, en practicamente todas las disponibles en el mercado desde 2017.
- Opciones de despliegue:
  - `transformers.pipeline` (ejemplo oficial con `device="cuda"`).
  - Text Generation Inference (el repositorio declara la etiqueta `text-generation-inference` y `endpoints_compatible`).
  - vLLM, si se confirma compatibilidad de la configuracion GPT-2.
  - FriendliAI, que ya aloja modelos hermanos del mismo autor.
  - llama.cpp u Ollama: requeririan una conversion a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de rendimiento de este modelo no estan publicados, por lo que la comparacion es unicamente estructural y de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (`nld-latn-100mb-after-ppt-...-ckpt500_seed10`) | 124.770.816 | no disponible | no disponible | HuggingFace, safetensors | no disponible |
| GPT-2 small | 124 M (aprox.) | 1024 tokens | licencia MIT modificada | HuggingFace, safetensors, GGUF en la comunidad | Si, ampliamente documentado |
| DistilGPT-2 | 82 M (aprox.) | 1024 tokens | Apache 2.0 | HuggingFace, safetensors | Si, ampliamente documentado |
| Pythia-160m | 162 M (aprox.) | 2048 tokens | Apache 2.0 | HuggingFace, safetensors | Si, con suite de evaluacion publicada |

La diferencia principal no esta en la arquitectura, sino en el regimen de entrenamiento: GPT-2, DistilGPT-2 y Pythia se entrenaron sobre corpus de decenas o cientos de miles de millones de tokens, mientras que este checkpoint parte de un corpus del orden de 100 MB segun su propio nombre, lo que lo situa en otra categoria de uso (investigacion de eficiencia de datos, no generacion de proposito general).

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplejidad, ni evaluaciones humanas publicadas; el rendimiento real es desconocido.
- Licencia no disponible: la model card usa el marcador de posicion `licence: license`, que no concede derechos de uso. No debe utilizarse en produccion ni con fines comerciales sin aclarar previamente los terminos con el autor.
- Corpus de entrenamiento muy reducido: el nombre del modelo base indica aproximadamente 100 MB de texto, ordenes de magnitud por debajo de lo habitual en modelos de 124M de parametros. Es esperable una alta perplejidad, incoherencia a partir de pocos cientos de tokens y una tasa elevada de alucinacion.
- Es un checkpoint intermedio (`ckpt500`), no un modelo final; puede haber checkpoints posteriores con mejor comportamiento.
- Idioma: el identificador sugiere neerlandes, pero la model card no confirma los idiomas soportados ni la calidad por idioma. No hay evidencia de capacidades multilingues.
- Riesgo de sobreajuste al formato de prompt: al ser un SFT sobre un dataset no documentado, el modelo puede degradarse con plantillas distintas a la del ejemplo publicado.
- Sesgos: no documentados. Al no conocerse la composicion del corpus, no puede descartarse sesgo de dominio, de registro o geografico.
- Sin alineacion de seguridad documentada: no se menciona RLHF, DPO ni filtrado de contenido; no es adecuado para aplicaciones orientadas a usuarios finales sin capas adicionales de moderacion.
- Modelo de investigacion academica (organizacion de Weights & Biases ligada a la Universidad de Groningen): sin garantias de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nld-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/rk9omyej
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo hermano en ingles: https://huggingface.co/francesca9805/eng-latn-100mb-after-ppt-Dp-10mb-packed-wrapped-ckpt500_seed10
- Modelo hermano (`bfd`, semilla 10): https://huggingface.co/francesca9805/nld-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Ficha en Free2AITools del modelo hermano: https://free2aitools.com/model/francesca9805/nld-latn-100mb-ppt-dp-10mb-packed-bfd_seed10
- Despliegue en FriendliAI del modelo hermano en ingles: https://friendli.ai/models/francesca9805/eng-latn-100mb-ppt-Dp-10mb-packed-wrapped_seed10
- Despliegue en FriendliAI de otro modelo de la familia: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
