# fpadovani/ppt-nld_uniform-100mb_seed10

## Resumen
El modelo `fpadovani/ppt-nld_uniform-100mb_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, un transformer decoder-only de tipo GPT-2 entrenado para neerlandes (codigo `nld_latn`) sobre aproximadamente 100 MB de texto. Lo desarrolla el usuario `fpadovani` (afiliado a la Universidad de Groningen, segun la traza de Weights & Biases) y se publica como parte de una linea de experimentos de investigacion, con la semilla 10 (`seed10`) y una variante de muestreo `uniform`.

Se trata de un modelo pequeno de 86.708.736 parametros (~87 M) que resuelve tareas basicas de generacion de texto en neerlandes tras un proceso de SFT (supervised fine-tuning) con la libreria TRL 0.23.0. Su relevancia es fundamentalmente academica: sirve como punto de comparacion en estudios de alineacion, ajuste instruccional o ablations con semillas controladas, mas que como modelo de produccion. No se trata de un modelo multimodal ni de un MoE, sino de un transformer denso clasico derivado de la familia GPT-2.

Dado su tamano y su origen, se puede ejecutar en CPU o en cualquier GPU consumer, lo que lo hace util para reproducir experimentos y para desplegar prototipos de muy bajo coste en neerlandes. La model card no documenta datos de entrenamiento, idiomas oficiales ni licencia concreta, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 86.708.736 (~87 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (el modelo base GPT-2 suele usar 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; admite conversion a FP16/INT8/INT4 mediante herramientas externas) |
| Idiomas soportados | no disponible en la model card; el identificador del modelo base (`nld_latn`) indica neerlandes |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de tipo GPT-2. La etiqueta `gpt2` de HuggingFace y el hecho de partir de `goldfish-models/nld_latn_100mb` confirman una arquitectura densa autoregresiva con atencion causal, sin mezcla de expertos ni componentes de estado recurrente (SSM). El modelo base pertenece a la coleccion Goldfish, orientada a lenguas con pocos recursos, y fue entrenado de forma monolingue sobre aproximadamente 100 MB de texto en neerlandes. El ajuste fino se realizo con SFT (supervised fine-tuning) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica que el entrenamiento fue por SFT y enlaza una traza de Weights & Biases alojada en el proyecto `f-padovani-university-of-groningen/white_cotterell`. El sufijo `uniform` del nombre sugiere una estrategia de muestreo uniforme en la construccion del dataset, y `seed10` indica la semilla aleatoria empleada, lo que apunta a un diseno experimental reproducible, pero estos detalles no se confirman en la documentacion.

## Capacidades
- Generacion de texto autoregresiva en neerlandes, condicionada por un prompt en formato de roles (`user`), segun el ejemplo de uso de la model card.
- Respuesta a instrucciones sencillas tras el ajuste fino con SFT, incluyendo preguntas abiertas ("If you had a time machine...").
- Generacion de texto libre de baja latencia gracias a su tamano reducido (~87 M de parametros).
- Integracion directa con el pipeline `text-generation` de Transformers.
- Compatibilidad declarada con `text-generation-inference` y endpoints.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Multilingue: no disponible; el entrenamiento del modelo base apunta a uso monolingue en neerlandes, sin confirmacion de capacidades en otros idiomas.

## Casos de uso
- Reproduccion de experimentos academicos: al incluir la semilla (`seed10`) en el nombre, el modelo permite reproducir un punto concreto de un barrido experimental de ajuste instruccional en neerlandes, útil para comparar metodologias de SFT.
- Generacion de texto en neerlandes de bajo coste: puede desplegarse en CPU o en GPU integrada para producir texto corto en neerlandes sin coste de inferencia apreciable, adecuado para demos o entornos de pruebas.
- Punto de partida para ajuste adicional: sirve como checkpoint inicial para fine-tuning en dominios especificos (legal, medico, atencion al cliente) en neerlandes con presupuestos de computo minimos.
- Generacion de datos sinteticos en neerlandes: puede emplearse para aumentar corpus de entrenamiento o para preprocesar tareas de NLU con datos escasos, dado su bajo coste de ejecucion en lote.
- Prototipado de chatbots sencillos: con el formato de roles del ejemplo oficial, permite construir un asistente conversacional basico en neerlandes para validar flujos antes de migrar a modelos mayores.
- Ablations de alineacion: al ser un modelo pequeno y con semilla fijada, es adecuado para estudiar el efecto del SFT sobre la calidad de generacion sin los costes de experimentar con modelos de miles de millones de parametros.
- Ensenanza y formacion: sirve como ejemplo didactico de pipeline completo (modelo base Goldfish + SFT con TRL) para cursos de NLP y de ajuste de modelos de lenguaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y los resultados de busqueda web recuperados no aportan datos sobre este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 350 MB; en FP16/BF16, unos 175 MB; en INT8, unos 90 MB; en INT4, unos 45 MB. Sumando activaciones y cache de clave/valor, el consumo total se mantiene por debajo de 1 GB en precision completa.
- GPU recomendadas: cualquier GPU moderna, incluso modelos de gama de entrada (GTX 1050, RTX 3050, iGPU integradas). No requiere A100, H100 ni RTX 4090 para inferencia funcional.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual y en la mayoria de GPU integradas. Tambien es viable su ejecucion en CPU.
- Opciones de despliegue: pipeline de Transformers (`text-generation`), text-generation-inference (TGI), vLLM si se adapta la arquitectura, y llama.cpp u Ollama tras convertir los pesos a formato GGUF. Existe compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por su tamano, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_uniform-100mb_seed10` | ~87 M | no disponible | no disponible | HuggingFace | Ajuste SFT sobre base neerlandes Goldfish |
| `goldfish-models/nld_latn_100mb` | ~86 M (base) | no disponible | no disponible | HuggingFace | Modelo base monolingue neerlandes de la coleccion Goldfish |
| GPT-2 small | 124 M | 1024 | MIT (segun publicacion original) | HuggingFace | Referencia generalista en ingles |
| DistilGPT-2 | 82 M | 1024 | MIT | HuggingFace | Destilado de GPT-2, orientado a ingles |
| GroNLP/gpt2-small-dutch | ~124 M | 1024 | no disponible | HuggingFace | Alternativa en neerlandes derivada de GPT-2 |

La comparacion es orientativa, ya que no se dispone de datos de benchmarks del modelo principal ni de una evaluacion homogenea frente a las alternativas. La principal diferencia radica en que este modelo es un ajuste supervisado de un modelo base entrenado especificamente en neerlandes con un corpus reducido (100 MB), mientras que las alternativas en la tabla son modelos generalistas o destilados en ingles o neerlandes con volumenes de entrenamiento superiores.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles. Al entrenarse sobre un corpus reducido de 100 MB en neerlandes, es probable que herede los sesgos presentes en el corpus base Goldfish, pero no se documenta analisis alguno.
- Riesgo de alucinacion: alto para un modelo de 87 M de parametros. La coherencia de la generacion decae rapidamente con prompts largos o con temas poco representados en el corpus de entrenamiento.
- Limitaciones de contexto e idioma: la model card no especifica la ventana de contexto. El modelo base es de tipo GPT-2, con una longitud de contexto tipicamente limitada a 1024 tokens. El uso esta orientado al neerlandes; no hay confirmacion de competencia en otros idiomas.
- Restricciones de licencia: la licencia es no disponible. La model card incluye un campo `licence: license` sin contenido, lo que impide determinar las condiciones de uso comercial. Antes de cualquier uso en produccion es necesario aclarar la licencia con el autor.
- Caveats para produccion: no se dispone de documentacion sobre datos de ajuste, hiperparametros finales ni evaluacion de seguridad. La fecha de creacion (2026-09-10) y la ausencia de descargas y "likes" sugieren un modelo de investigacion reciente y sin validacion comunitaria.
- Falta de soporte de herramientas: no se documenta function calling, tool calling ni uso como agente, por lo que no es adecuado para flujos que dependan de estas capacidades.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_uniform-100mb_seed10
- Modelo base en HuggingFace: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/utpy29us
- Repositorio de la coleccion Goldfish (referencia generica): https://github.com/goldfish-models
- No se han encontrado resultados web relevantes adicionales sobre este modelo concreto.
