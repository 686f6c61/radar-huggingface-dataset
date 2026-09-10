# fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407

## Resumen

`fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407` es un modelo de generacion de texto de tipo transformer decoder-only, con arquitectura basada en GPT-2 (etiqueta `gpt2` en el repositorio de HuggingFace) y 86.508.288 parametros totales, segun los pesos en `safetensors` publicados. Es un fine-tuning por supervisión (SFT) del modelo base `goldfish-models/eng_latn_100mb`, realizado por el autor `fpadovani` con la libreria TRL (version 0.23.0) y registrado en un proyecto de Weights & Biases vinculado a la Universidad de Groningen.

El modelo pertenece a la familia de experimentos de "goldfish" (modelos de ~100 MB entrenados por idioma) y su nombre sugiere un experimento controlado con semilla fija (`seed3407`) sobre cobertura lexica y ley de Zipf en un corpus de 100 MB. El repositorio tiene un tamano de 1,4 GB, no registra descargas ni valoraciones en el momento de la consulta, y no declara licencia ni idiomas soportados en su model card.

Por su tamano (86,5 M de parametros) no es un modelo orientado a produccion, sino a reproducibilidad de experimentos, analisis de tokenizacion y cobertura lexica, y como punto de partida barato para fine-tuning. Se puede ejecutar en CPU y en cualquier GPU de consumo. La informacion publicada es muy escasa: la model card se limita a la receta de entrenamiento, las versiones de framework y la cita de TRL, sin detallar dataset, hiperparametros ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (los pesos se publican en `safetensors` en precision completa; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el nombre incluye `jpn` y el modelo base es `eng_latn`, pero la model card no declara idiomas) |
| Licencia | no disponible (el campo `licence: license` de la model card es un marcador sin contenido) |
| Formato de pesos | `safetensors` (biblioteca `transformers`, compatible con PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, tal como indica la etiqueta `gpt2` del repositorio y su pertenencia a la familia `goldfish-models`, que entrena modelos pequenos por idioma a partir de corpus de 100 MB. Con 86.508.288 parametros, se situa por debajo de un GPT-2 estandar (124 M), en el rango habitual de los modelos de 100 MB de esta familia. No hay informacion publicada sobre el numero de capas, dimensiones de atencion, cabezas ni longitud de contexto.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo base es `goldfish-models/eng_latn_100mb`. La model card no especifica composicion del dataset, numero de tokens vistos, hiperparametros de entrenamiento, ni si hubo fases posteriores de RLHF o DPO; solo apunta a un unico run de Weights & Biases. La semilla indicada en el nombre (`seed3407`) apunta a un diseno experimental controlado, presumiblemente para comparar variantes de vocabulario o cobertura lexica, aunque esto no se documenta de forma explicita.

## Capacidades

- Generacion de texto autoregresiva mediante `pipeline("text-generation")` de Transformers, con soporte de plantillas conversacionales (el ejemplo de la model card pasa una lista de mensajes con `role: user`).
- Inferencia en GPU (`device="cuda"`) o CPU, dado el reducido tamano del modelo.
- Fine-tuning posterior: al ser un checkpoint pequeno y con pesos en `safetensors`, es un candidato barato para experimentos de ajuste adicionales.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles (`endpoints_compatible` en las etiquetas del repositorio).
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles. El nombre incluye `jpn`, pero la model card no confirma el idioma ni la composicion linguistica del entrenamiento.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint esta asociado a un run concreto de Weights & Biases y a una semilla fija (`seed3407`), lo que permite replicar o auditar un resultado experimental sobre cobertura lexica o ley de Zipf.
- Estudio de tokenizacion y vocabulario: al derivar de la familia `goldfish` de 100 MB, sirve para analizar como un vocabulario o un corpus pequeno afecta a la generacion, comparando variantes con distinta semilla.
- Prototipado rapido en local: 86,5 M de parametros caben en CPU y en cualquier GPU de consumo, por lo que permite probar plantillas de prompt o preprocesado sin coste de infraestructura.
- Generacion de texto de baja latencia en el borde: su huella de memoria (del orden de 43-346 MB segun precision) lo hace utilizable en dispositivos con recursos limitados para tareas de texto corto.
- Punto de partida para fine-tuning especifico: se puede ajustar sobre un dominio concreto (por ejemplo, clasificacion o generacion de plantillas) con presupuesto minimo de computo.
- Docencia y formacion: es un caso practico y ligero para explicar el flujo completo de TRL, desde el modelo base hasta el checkpoint publicado, incluido el seguimiento con Weights & Biases.
- Pruebas de integracion de pipelines: sirve como modelo "dummy" realista para validar despliegues con `transformers`, `text-generation-inference` o endpoints compatibles antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos (calculo a partir de 86.508.288 parametros): ~346 MB en FP32, ~173 MB en FP16/BF16, ~87 MB en int8 y ~43 MB en int4. Hay que sumar el coste del cache KV y del runtime, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre. Funciona en RTX 3060/4060, RTX 4090, A100, H100 y tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, y tambien en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (via `pipeline`), `text-generation-inference` (etiqueta declarada en el repositorio) y endpoints compatibles. La conversion a GGUF para `llama.cpp` u `Ollama` no esta documentada, aunque al ser una arquitectura GPT-2 es tecnicamente plausible.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Por tamano, se espera que sea muy bajo en latencia, pero no hay cifras verificables en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407` | 86,5 M | no disponible | no disponible | HuggingFace, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace |
| GPT-2 (referencia de la familia) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace |
| Otras variantes de la familia `goldfish` por idioma | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos verificables de las alternativas dentro de la informacion proporcionada, por lo que no se comparan rendimiento ni licencia mas alla de lo indicado.

## Limitaciones y advertencias

- Modelo de investigacion: 86,5 M de parametros y sin evaluacion publicada. La calidad de generacion es limitada en comparacion con modelos actuales y no deberia usarse en produccion orientada a usuario final sin una evaluacion previa.
- Riesgo de alucinacion: alto en terminos relativos, ya que no hay ajuste por preferencias (RLHF/DPO) documentado ni datos de evaluacion de veracidad.
- Sesgos: no disponibles. No se documenta la composicion del corpus de entrenamiento ni del dataset de SFT, por lo que no es posible auditar sesgos de genero, raza, idioma o dominio.
- Contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos. El nombre incluye `jpn` mientras que el modelo base es de ingles (`eng_latn`), lo que genera ambiguedad sobre el idioma real de uso.
- Licencia: el repositorio no declara licencia utilizable. El campo `licence: license` de la model card es un marcador automatico sin contenido, por lo que el uso comercial queda sin autorizacion explicita. Ademas, la licencia del modelo base `goldfish-models/eng_latn_100mb` debe verificarse por separado.
- Advertencia sobre el ejemplo de la model card: el `pipeline` de generacion se invoca con una lista de mensajes; conviene revisar la version de Transformers (probado con 4.56.2) porque la compatibilidad del formato conversacional puede variar.
- Trazabilidad: los resultados de entrenamiento solo estan disponibles a traves de un enlace externo a Weights & Biases, sin resumen de metricas en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion del modelo base: https://huggingface.co/goldfish-models
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/0j143gl2
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
- Busqueda web: no se han encontrado resultados relevantes. Los resultados devueltos por el buscador correspondian a guias de television en italiano y no guardan ninguna relacion con el modelo.
