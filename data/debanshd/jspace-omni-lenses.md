# debanshd/jspace-omni-lenses

## Resumen

Jspace-omni-lenses es una coleccion de lentes jacobianas (Jacobian lenses, formato `jlens`) publicada por el usuario debanshd. No es un modelo generativo al uso: se trata de artefactos de interpretabilidad mecanistica que permiten proyectar activaciones intermedias de un modelo hacia su capa final, de modo que se pueda leer que "piensa" el modelo en cada capa. Las lentes se han ajustado sobre la parte generadora de texto (el "thinker") de tres modelos omni de audio de la familia Qwen: Qwen2.5-Omni-3B, Qwen2.5-Omni-7B y Qwen3-Omni-30B-A3B-Instruct.

El ajuste se realizo con la libreria `jlens.fit` sobre el corpus WikiText-103 en su version cruda (`Salesforce/wikitext`, revision `b08601e0`), replicando la configuracion de las lentes de Neuronpedia: promedio del jacobiano desde cada capa fuente hasta la capa final, prompts de 128 tokens y exclusion de las posiciones anteriores a la 16. Cada carpeta de modelo contiene un `lens.pt` y un `meta.json` con la revision fijada del modelo, el corpus y su sha256, el numero de prompts, los hiperparametros, el tiempo de ajuste y un informe de lectura.

La relevancia de esta publicacion es doble. Por un lado, ofrece material de interpretabilidad listo para usar sobre modelos omni multimodales, un terreno donde las herramientas de analisis son escasas. Por otro, esta explicitamente orientada a los experimentos de audio "jspace-horizons", lo que la vincula a una linea de investigacion concreta sobre el espacio latente de modelos de audio. El repositorio ocupa 2,8 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes jacobianas (artefactos de interpretabilidad), no un modelo generativo; se aplican sobre la parte "thinker" de modelos Qwen omni |
| Parametros totales | No aplica (los modelos base van de 3B a 30B-A3B); el artefacto son tensores de lentes |
| Parametros activos | No aplica al artefacto; el modelo base Qwen3-Omni-30B-A3B-Instruct es MoE con 3B activos |
| Longitud de contexto | No disponible (depende del modelo base; el ajuste uso prompts de 128 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `lens.pt` (PyTorch) y `meta.json` por modelo |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado de forma convencional, sino un conjunto de lentes jacobianas. Para cada capa fuente se calcula el jacobiano medio de la transformacion que lleva las activaciones de esa capa hasta la capa final del modelo, promediado sobre un conjunto de prompts. El resultado es una matriz que permite aproximar la representacion final que el modelo produciria a partir de un estado intermedio, lo que facilita el analisis de circuitos y de la evolucion de la representacion capa a capa.

El ajuste se realizo con `jlens.fit` sobre WikiText-103 crudo (`Salesforce/wikitext`, revision `b08601e0`), con prompts de 128 tokens y descartando las posiciones anteriores a la 16, siguiendo la configuracion de las lentes de Neuronpedia. Los modelos base son Qwen2.5-Omni-3B, Qwen2.5-Omni-7B y Qwen3-Omni-30B-A3B-Instruct; las lentes se ajustan sobre la parte encargada de generar texto ("thinker") de estos modelos omni de audio. El `meta.json` de cada carpeta documenta la revision fijada del modelo, el sha256 del corpus, el numero de prompts, los hiperparametros, el tiempo de ajuste y un informe de lectura. No se especifica el numero exacto de prompts ni el tiempo de ajuste en la informacion disponible.

## Capacidades

- Lectura de representaciones intermedias: permite proyectar activaciones de capas internas hacia la capa final para inspeccionar que informacion esta disponible en cada punto de la red.
- Analisis capa a capa: facilita el estudio de la evolucion de la representacion en el "thinker" de modelos omni de audio.
- Compatibilidad con tres modelos base de distinto tamano: 3B, 7B y 30B-A3B, lo que permite comparaciones entre escalas y entre arquitecturas densas y MoE.
- Soporte para experimentos de audio: las lentes se ajustaron expresamente para los experimentos "jspace-horizons" de audio.
- Metadatos reproducibles: cada lente incluye revision del modelo, hash del corpus, numero de prompts e hiperparametros, lo que permite replicar el ajuste.
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales propias; esas capacidades pertenecen a los modelos base sobre los que se aplican las lentes.

## Casos de uso

- Interpretabilidad mecanistica de modelos omni: aplicar la lente de Qwen2.5-Omni-3B para estudiar en que capas el "thinker" codifica informacion linguistica frente a informacion acustica, aprovechando que el artefacto se ajusto sobre la parte de generacion de texto.
- Analisis de circuitos en produccion de investigacion: usar `lens.pt` para leer estados intermedios durante la inferencia y detectar representaciones espurias antes de que afecten a la salida, integrandolo en un pipeline de analisis con PyTorch.
- Comparacion entre escalas: aplicar las lentes de 3B, 7B y 30B-A3B al mismo conjunto de prompts para medir como cambia la estructura de la representacion con el tamano y con la arquitectura MoE frente a densa.
- Reproduccion de experimentos: el `meta.json` con revision fijada, sha256 del corpus y numero de prompts permite reconstruir exactamente el ajuste y validar resultados de terceros.
- Investigacion en audio "jspace-horizons": las lentes estan disenadas para los experimentos de audio de ese proyecto, por lo que sirven como base para estudiar el espacio latente de modelos omni en tareas de audio.
- Docencia y divulgacion: usar las lentes para visualizar como un modelo omni transforma una representacion intermedia en la prediccion final, con material reproducible y de licencia permisiva.
- Auditoria de sesgos: inspeccionar activaciones intermedias en busca de representaciones asociadas a atributos sensibles, aunque esta aplicacion requiere validacion adicional no cubierta por la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de las lentes (por ejemplo, fidelidad de la reconstruccion o correlacion con la capa final) ni comparaciones con otras lentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto en si; depende del modelo base sobre el que se apliquen las lentes.
- Modelo base 3B: cabe en GPU de consumo con cuantizacion, aunque las lentes se aplican sobre pesos en precision completa o media; se recomienda al menos 8-12 GB de VRAM para el modelo y margen para los tensores de la lente.
- Modelo base 7B: requiere aproximadamente 16-24 GB de VRAM en fp16; viable en RTX 4090 o A100.
- Modelo base 30B-A3B (MoE): requiere GPU de datacenter (A100 80 GB, H100) para inferencia comoda en fp16; el caracter MoE reduce el coste de computo por token pero no el de memoria.
- Tamano del repositorio: 2,8 GB, correspondiente a los tensores de las lentes de los tres modelos.
- Opciones de despliegue: PyTorch con la libreria `jlens` para cargar `lens.pt`; el modelo base se sirve con vLLM, TGI o transformers segun el caso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelos base | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| jspace-omni-lenses (debanshd) | Qwen2.5-Omni-3B, Qwen2.5-Omni-7B, Qwen3-Omni-30B-A3B-Instruct | `lens.pt` + `meta.json` | Apache 2.0 | Lentes jacobianas sobre el "thinker" de modelos omni de audio |
| Lentes de Neuronpedia | Modelos语言 varios (no especificado) | Formato `jlens` | No disponible | Configuracion de referencia seguida por este artefacto |
| Otras lentes jacobianas publicadas | No disponible | No disponible | No disponible | No se dispone de comparativas publicas en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas equivalentes en rendimiento o cobertura.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; es un artefacto de analisis que debe usarse junto con el modelo base correspondiente.
- Cobertura limitada al "thinker": las lentes se ajustaron solo sobre la parte de generacion de texto de los modelos omni, no sobre los modulos de audio o vision.
- Corpus de ajuste restringido: WikiText-103 es un corpus de texto enciclopedico en ingles; las lentes pueden no reflejar bien el comportamiento en otros dominios o idiomas.
- Configuracion fija: prompts de 128 tokens y exclusion de posiciones anteriores a la 16; usos fuera de ese regimen pueden degradar la fidelidad de la lectura.
- Sin benchmarks publicados: no hay metricas que cuantifiquen la calidad de las lentes, por lo que su utilidad debe validarse en cada caso.
- Sin informacion sobre sesgos: la model card no documenta sesgos del artefacto ni de los modelos base.
- Riesgo de mala interpretacion: las lecturas de capas intermedias son aproximaciones; conclusiones sobre el comportamiento del modelo deben contrastarse con otras tecnicas.
- Licencia Apache 2.0 permisiva para uso comercial, pero las lentes heredan las limitaciones y condiciones de los modelos base de Qwen, que deben revisarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/debanshd/jspace-omni-lenses
- Modelo base Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Modelo base Qwen3-Omni-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Corpus WikiText-103: https://huggingface.co/datasets/Salesforce/wikitext
- Libreria jlens: no disponible
- Lentes de Neuronpedia: no disponible
- Paper o blog de referencia: no disponible
