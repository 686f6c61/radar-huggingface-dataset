# fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed3407

## Resumen

`fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed3407` es un ajuste fino de tipo supervisado (SFT) sobre el modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de la familia GPT-2 con 86.416.128 parametros. Lo publica el usuario fpadovani y se ha entrenado con la libreria TRL, dentro de un flujo de trabajo de investigacion (el registro de Weights & Biases apunta al proyecto `white_cotterell`), con una semilla fija (3407) y un identificador (`ppt-wc-uniform-oldlex`) que sugiere una variante experimental controlada de un estudio mayor, aunque la model card no documenta el significado de esas siglas ni la composicion del dataset.

Se trata, por tanto, de un artefacto de investigacion reproducible mas que de un modelo listo para produccion: no declara licencia, no publica idiomas en los metadatos, no incluye evaluacion alguna y no tiene descargas ni interacciones en el momento de redactar esta ficha. Su interes practico es acotado: sirve como ejemplo minimo de pipeline SFT con TRL, como pieza de comparacion en estudios sobre ajuste de modelos pequeños y como banco de pruebas para infraestructura de despliegue de bajo coste.

El tamaño del repositorio (1,4 GB) es muy superior al de los pesos en precision nativa (unos 173 MB en FP16), lo que indica que incluye checkpoints intermedios o estados del optimizador ademas de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en los metadatos) |
| Parametros totales | 86.416.128 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible (no se declara en la model card ni en los metadatos) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en precision completa; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas por el autor |
| Idiomas soportados | No disponible en los metadatos; el modelo base (`eng_latn_100mb`) apunta a ingles en escritura latina, por lo que el ajuste es previsiblemente monolingue en ingles |
| Licencia | No disponible: la model card incluye `licence: license` sin especificar terminos y los metadatos de HuggingFace no declaran ninguna |
| Formato de pesos | `safetensors` (compatible con `transformers`) |
| Libreria | `transformers` |
| Pipeline declarado | `text-generation` |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Tamano del repositorio | 1,4 GB |
| Compatibilidad de endpoints | Si (`endpoints_compatible`, `text-generation-inference`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atencion causal y normalizacion previa a la capa, es decir, la familia GPT-2. El ajuste no introduce cambios estructurales; se conserva el numero de parametros del base en la version final (86.416.128). No se documenta la longitud de contexto efectiva, el tamano de vocabulario ni la dimension oculta en la informacion proporcionada.

El entrenamiento se ha realizado con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, el numero de epocas, la tasa de aprendizaje ni si hubo etapas adicionales de preferencia (RLHF, DPO) mas alla del ajuste supervisado. Si se publica el enlace al registro de Weights & Biases del experimento, que es la unica fuente de trazabilidad disponible. El nombre del modelo incluye `seed3407`, lo que confirma que forma parte de una rejilla de experimentos con semillas fijas, y el prefijo `ppt-wc-uniform-oldlex` apunta a una condicion experimental concreta cuyo significado no se explica en la ficha del autor.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuación de prompts y respuestas cortas, con el estilo y los sesgos del corpus base de 100 MB.
- Formato conversacional basico: el ejemplo de la model card pasa al pipeline una lista de mensajes con la clave `role`, lo que indica que el tokenizer admite plantilla de chat; la plantilla exacta no esta documentada.
- Finalizacion de texto y tareas de "autocompletado" en dominios muy restringidos, especialmente si se vuelve a ajustar con datos propios.
- Clasificacion y etiquetado por generacion (zero-shot y few-shot muy limitados) aprovechando la cabeza de lenguaje.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, razonamiento multi-paso ni modo de pensamiento explicito.
- No hay capacidades de vision, audio ni multimodalidad.
- No hay soporte multilingue declarado: el modelo base es de ingles (`eng_latn`).
- Razonamiento aritmetico y de sentido comun muy limitado por el tamano del modelo y la ausencia de etapas de alineacion.

## Casos de uso

- Reproduccion de experimentos de SFT: el identificador con semilla fija (3407) y el registro en Weights & Biases permiten replicar el ajuste sobre `goldfish-models/eng_latn_100mb` y comparar variantes dentro de una misma rejilla experimental.
- Docencia y formacion en ajuste fino: con 86 millones de parametros, el entrenamiento completo cabe en una unica GPU de gama media o incluso en CPU con paciencia, lo que lo convierte en un ejemplo didactico de pipeline TRL de principio a fin.
- Pruebas de infraestructura de servicio: util como modelo "de humo" para validar despliegues con text-generation-inference o endpoints compatibles antes de mover modelos grandes, dado que arranca en segundos y ocupa menos de 200 MB en FP16.
- Generacion de texto corto en ingles para demos internas y prototipos de interfaz: frases de relleno, sugerencias de continuacion o texto de ejemplo en productos sin requisitos de calidad altos.
- Ajuste adicional sobre dominio propio: al ser un modelo pequeño y con licencia no declarada, sirve para experimentar tecnicas de fine-tuning en dominios acotados (notas tecnicas, descripciones de producto) donde se controle el corpus.
- Investigacion sobre sesgos y alineacion en modelos pequeños: permite medir como se comportan las metricas de sesgo y toxicidad en un modelo entrenado con solo 100 MB de texto, como linea base frente a modelos mayores.
- Filtrado y pre-anotado de datos: uso como anotador debil para pre-etiquetar grandes volumenes de texto en ingles antes de la revision humana, asumiendo una tasa de error alta.
- Despliegue en entornos sin GPU (edge, Raspberry Pi, contenedores ligeros): la inferencia en CPU es viable por el reducido numero de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de perplejidad) y tampoco se han encontrado evaluaciones externas del modelo en la busqueda realizada. Tampoco hay mediciones de latencia o throughput publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos publicados: aproximadamente 345 MB en FP32 y 173 MB en FP16/BF16, a los que hay que sumar el cache KV y las activaciones (despreciables frente al peso en este tamano).
- VRAM estimada si se cuantiza manualmente: en torno a 86 MB en INT8 y 43 MB en INT4, mas el sobrecoste del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o una T4 son mas que suficientes, y el modelo quedara limitado por el overhead de lanzamiento de kernels, no por computo.
- Cabe holgadamente en GPU de consumo (GTX 1050 Ti, RTX 2060, RTX 3050, e incluso iGPU con memoria compartida) y es viable en CPU.
- Opciones de despliegue: `transformers` con `pipeline` (metodo usado en la model card), text-generation-inference (la etiqueta `endpoints_compatible` lo indica), vLLM o TGI en servidor. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el autor no publica ese formato.
- Latencia y throughput: no disponible. No hay mediciones publicadas y el repositorio no incluye informes de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed3407` | 86.416.128 | No disponible | No disponible | HuggingFace, safetensors | Ajuste SFT de un modelo de 100 MB de ingles; sin evaluacion |
| `goldfish-models/eng_latn_100mb` | No disponible (el ajuste derivado conserva la arquitectura) | No disponible | No disponible | HuggingFace | Modelo base; monolingue en ingles con 100 MB de entrenamiento |
| `openai-community/gpt2` | 124.000.000 (aprox.) | 1024 tokens | Licencia MIT modificada | HuggingFace, safetensors, GGUF | Referencia de la arquitectura; mucho mas corpus de entrenamiento y ecosistema amplio |
| `distilgpt2` | 82.000.000 (aprox.) | 1024 tokens | Apache 2.0 | HuggingFace, safetensors | Destilado de GPT-2; tamano comparable y licencia permisiva clara |

La comparacion es estructural: no existe ningun benchmark publico que permita contrastar la calidad de este ajuste frente a los modelos de la tabla. La diferencia mas relevante en la practica es la licencia: frente a la licencia MIT modificada de GPT-2 o la Apache 2.0 de DistilGPT-2, este modelo no declara terminos de uso, lo que impide un uso comercial con garantias.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye un campo `licence: license` sin contenido y los metadatos no especifican terminos. No debe usarse en produccion comercial sin aclarar la licencia con el autor y sin revisar la licencia del modelo base.
- Modelo muy pequeño (86 millones de parametros) entrenado sobre 100 MB de texto: la coherencia a partir de unas pocas frases se degrada rapidamente y la tasa de afirmaciones falsas es alta.
- Riesgo elevado de alucinacion: no hay informacion sobre etapas de alineacion (RLHF/DPO) ni de filtrado de seguridad; el unico aprendizaje adicional es SFT.
- Sesgos esperables: cualquier corpus de 100 MB de texto en ingles arrastra sesgos de genero, raza, religion y origen nacional, y no se documenta ningun proceso de mitigacion.
- Limitacion idiomatica: no hay soporte multilingue declarado; el rendimiento en castellano sera previsiblemente pobre y no evaluado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con contexto largo sin verificar experimentalmente el limite efectivo.
- Formato de chat sin documentar: el ejemplo usa roles, pero se desconoce la plantilla exacta aplicada por el tokenizer, lo que puede provocar respuestas degradadas si se integra en frameworks de chat.
- Sin evaluacion ni validacion independiente: cero descargas y cero interacciones en HuggingFace; no hay terceros que hayan verificado su comportamiento.
- Repositorio de 1,4 GB frente a 173 MB de pesos en FP16: conviene revisar el contenido antes de descargarlo si solo se necesitan los pesos finales.
- Versiones de framework poco habituales en la model card (PyTorch 2.11.0, Transformers 4.56.2): verificar compatibilidad con el entorno propio antes de reproducir el entrenamiento.
- Naturaleza experimental: el identificador sugiere una condicion concreta dentro de un estudio, por lo que el modelo puede no representar la mejor variante de esa familia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/vffrx5nx
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020): incluida en la model card del autor
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los unicos resultados obtenidos fueron paginas generales de Microsoft, sin relacion con el modelo.
