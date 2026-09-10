# fpadovani/ppt-nld_heavy_zipf-100mb_seed455

## Resumen

`fpadovani/ppt-nld_heavy_zipf-100mb_seed455` es un ajuste fino supervisado (SFT) del modelo monolingüe `goldfish-models/nld_latn_100mb`, un decodificador causal con arquitectura GPT-2 de aproximadamente 86,7 millones de parámetros entrenado sobre 100 MB de texto en neerlandés estándar (`nld_latn`). El ajuste se ha realizado con la librería TRL (versión 0.23.0) bajo el formato de *Supervised Fine-Tuning* y se publica como un artefacto de investigación de la Universidad de Groninga, según se deduce del proyecto de Weights & Biases enlazado en su model card (espacio `f-padovani-university-of-groningen/white_cotterell`).

El interés del modelo es fundamentalmente metodológico, no de producto. La nomenclatura del identificador (`ppt`, `heavy_zipf`, `seed455`) apunta a un experimento sobre estrategias de muestreo o mezcla de datos guiadas por una distribución de Zipf con un exponente "pesado", replicado con una semilla concreta para garantizar la reproducibilidad. Es decir, se trata de un punto de control pensado para comparar configuraciones de entrenamiento dentro de una familia de variantes, más que para su uso directo en aplicaciones finales.

Por su tamaño y por su base, el modelo queda fuera de la categoría de los asistentes conversacionales modernos: no se documenta una plantilla de chat robusta, no hay información sobre el dataset de ajuste, la licencia no está especificada y no se han publicado resultados de evaluación. Debe tratarse, por tanto, como un modelo pequeño de generación de texto en neerlandés cuyo valor reside en su trazabilidad experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal, denso), segun los tags del repositorio |
| Parametros totales | 86.708.736 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors (no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible en los metadatos; el modelo base es `nld_latn` (neerlandes en escritura latina), por lo que el comportamiento esperado esta centrado en neerlandes |
| Licencia | No disponible (la model card incluye un marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,4 GB |
| Modelo base | `goldfish-models/nld_latn_100mb` |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.11.0 |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal completa, normalizacion previa a los subloques y *weight tying* entre la matriz de embeddings y la cabeza de lenguaje. El recuento de 86.708.736 parametros es coherente con una configuracion GPT-2 de dimension reducida respecto al GPT-2 small original (124 M), presumiblemente con un vocabulario de menor tamano adaptado a un unico idioma; la configuracion exacta (numero de capas, dimension de embedding, cabezas de atencion y tamano de vocabulario) no esta publicada en la informacion disponible.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el modelo base neerlandes, ejecutado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no describe la composicion del dataset de ajuste, el numero de tokens vistos, ni si se aplicaron etapas posteriores de RLHF o DPO; la propia model card solo indica "This model was trained with SFT". Tampoco se documentan innovaciones tecnicas de decodificacion o atencion. No hay informacion sobre regularizacion, tasa de aprendizaje, numero de epochs ni criterio de seleccion del punto de control final. El nombre del modelo sugiere que la variable experimental es la distribucion del muestreo de datos (Zipf con cola pesada) y la semilla aleatoria (455), pero esto es una inferencia a partir del identificador, no un dato confirmado en la documentacion.

## Capacidades

- Generacion de texto autoregresiva en neerlandes, heredada del modelo base `goldfish-models/nld_latn_100mb`.
- Continuacion de texto y respuesta a peticiones cortas mediante el pipeline `text-generation` de Transformers, tal como ilustra el ejemplo de la model card.
- Acepta entradas con estructura de roles (`{"role": "user", "content": ...}`) porque el ejemplo de uso emplea el formato de mensajes del pipeline, aunque no se documenta una plantilla de chat entrenada de forma explicita.
- Soporte de tool calling o function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad de este tipo.
- Capacidades multilingues: no disponibles. El modelo base esta especializado en neerlandes y no se ha publicado evaluacion en otros idiomas.
- Capacidades especiales (modo *thinking*, vision, audio, decodificacion especulativa): no disponibles.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` a traves de los tags del repositorio, lo que permite servirlo con las herramientas estandar del ecosistema Hugging Face.

## Casos de uso

- Reproduccion de experimentos de mezcla de datos: el identificador incluye una semilla concreta (`seed455`) y una configuracion de muestreo Zipf "pesada"; el modelo sirve para replicar y comparar ese punto concreto dentro de una retícula de experimentos academicos sobre como afecta la distribucion de datos al rendimiento de modelos monolingues pequenos.
- Generacion de texto neerlandes en entornos sin GPU: con menos de 90 M de parametros, la inferencia en FP32 cabe en unos 0,35 GB de pesos, por lo que puede ejecutarse en CPU o en dispositivos de borde para tareas de autocompletado o generacion de relleno en neerlandes.
- Prototipado rapido de pipelines de NLP: sirve como modelo de juguete para validar de extremo a extremo una infraestructura de servicio (TGI, endpoints compatibles, pipeline de Transformers) antes de desplegar un modelo mayor, con costes de computo minimos.
- Aumento de datos para tareas neerlandesas: generar continuaciones y variaciones de texto en neerlandes para ampliar corpus pequenos de entrenamiento o de evaluacion, asumiendo la necesidad de filtrar por calidad y diversidad.
- Pruebas de regresion en MLOps: por su tamano, es adecuado para incluirlo en una bateria de tests de CI que verifique que un cambio en la libreria de inferencia o en el tokenizador no rompe la generacion esperada, sin consumir recursos significativos.
- Docencia y divulgacion: permite ilustrar en un aula o taller el ciclo completo de ajuste fino con TRL, la publicacion en el Hub y el analisis de un checkpoint, con tiempos de entrenamiento e inferencia asumibles en hardware de consumo.
- Investigacion sobre sesgos y contaminacion en modelos monolingues: al ser un modelo pequeno con base documentada (`nld_latn_100mb`), facilita estudios controlados sobre que tipo de sesgos aparecen cuando el corpus de 100 MB se submuestrea con una distribucion sesgada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (ni perplejidad, ni MMLU, ni tareas en neerlandes como las de la suite de Hugging Face), y el repositorio no enlaza ningun informe de evaluacion. El unico artefacto de seguimiento disponible es el enlace a la ejecucion de Weights & Biases del entrenamiento.

## Requisitos de hardware

- Peso de los parametros en memoria (calculado a partir del recuento real de 86.708.736 parametros): aproximadamente 0,35 GB en FP32, 0,17 GB en FP16/BF16, 0,09 GB en int8 y 0,04 GB en int4.
- VRAM estimada para inferencia: por debajo de 1 GB sumando pesos, cache KV y activaciones en secuencias cortas; el tamano del repositorio (1,4 GB) es notablemente superior al de los pesos en FP32 (~0,35 GB), lo que sugiere la presencia de artefactos adicionales no documentados, posiblemente estados de optimizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, una RTX 3060 o incluso una GPU integrada moderna pueden servirlo.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual y tambien en CPU. La inferencia en CPU es viable para uso interactivo con secuencias cortas.
- Opciones de despliegue: pipeline `text-generation` de Transformers, Text Generation Inference (TGI) segun el tag `text-generation-inference`, y endpoints compatibles de Hugging Face. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-nld_heavy_zipf-100mb_seed455 | 86,7 M | No disponible | No especificada (marcador de posicion en la model card) | Hugging Face, 0 descargas |
| goldfish-models/nld_latn_100mb (modelo base) | Misma arquitectura y tamano que el modelo derivado | No disponible | No disponible | Hugging Face |
| openai-community/gpt2 (GPT-2 small en ingles) | 124 M | 1024 tokens | Modified MIT | Hugging Face, ampliamente desplegado |
| GroNLP/bert-base-dutch-cased | Aproximadamente 110 M | 512 tokens | No disponible | Hugging Face (modelo solo codificador, no genera texto) |

La comparacion relevante es con el modelo base: este checkpoint no aporta un cambio de arquitectura ni de tamano, sino un ajuste fino adicional cuyo efecto no esta cuantificado publicamente. Frente a GPT-2 small, el modelo aqui descrito tiene menos parametros y esta especializado en neerlandes, a costa de perder cobertura multilingue y de carecer de una licencia clara.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un corpus de 100 MB submuestreado, es probable que herede los sesgos y desequilibrios de ese corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: elevado. Con menos de 90 M de parametros y entrenamiento unicamente de SFT, el modelo no tiene grounding factografico ni mecanismos de verificacion; cualquier afirmacion factual que genere debe tratarse como no fiable.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el modelo esta orientado al neerlandes (`nld_latn`); el ejemplo de la model card plantea una pregunta en ingles, pero no hay evidencia de que el modelo responda bien en ingles. El rendimiento fuera del neerlandes debe considerarse no validado.
- Capacidad de seguir instrucciones: limitada. El ajuste es SFT sobre una base GPT-2 pequena, sin RLHF ni DPO, sin plantilla de chat documentada y sin evaluacion de seguimiento de instrucciones. El formato de mensajes del pipeline puede aceptarse a nivel de API sin que el modelo haya sido entrenado especificamente para ello.
- Restricciones de licencia: la model card contiene un marcador de posicion (`licence: license`) en lugar de una licencia real. Sin licencia explicita no hay cesion de derechos clara, por lo que el uso comercial es juridicamente arriesgado. Ademas, la licencia del modelo base debe verificarse por separado.
- Falta de documentacion del dataset: no se especifica que datos se usaron en el SFT, lo que impide auditar contaminacion, calidad o cumplimiento de derechos de autor.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento declarado ni versionado semantico; no debe considerarse un modelo estable para produccion.
- El nombre del modelo y el proyecto de W&B sugieren un contexto de investigacion academica (Universidad de Groninga) sobre mezclas de datos; las conclusiones de ese trabajo no se incluyen en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/2l1mexgi
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, a su dataset o a una publicacion asociada; los resultados devueltos no guardan relacion con el modelo.
