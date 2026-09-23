# francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

Este modelo es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/hin_deva_100mb`, un modelo monolingüe de hindi en escritura devanagari perteneciente a la familia Goldfish, que entrena variantes de tamano reducido (100 MB de texto) para cientos de idiomas. El ajuste lo firma el usuario `francesca9805` y se ha realizado con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121, segun la model card. El resultado es un modelo causal de generacion de texto de 124.770.816 parametros (unos 124,8 M), con arquitectura GPT-2 y pesos en safetensors, lo que lo situa en la gama de modelos pequenos ejecutables incluso en CPU.

El interes de esta publicacion es fundamentalmente de investigacion y reproducibilidad: el nombre del repositorio (`ppt-Dp-10mb-packed-bfd_seed455`) sugiere un experimento controlado de mezcla o seleccion de datos con una semilla concreta (455), y el enlace a Weights & Biases apunta a un proyecto de la Universidad de Groningen denominado `new-tokenizers`, lo que indica que forma parte de una linea de trabajo academica sobre tokenizacion y datos de entrenamiento. No se trata, por tanto, de un modelo orientado a produccion, sino de un artefacto experimental con 0 descargas y 0 likes en el momento de la consulta.

La relevancia actual es la de los modelos pequenos y monolingues para idiomas con menos recursos: permiten estudiar tecnicas de ajuste, evaluar el impacto de la composicion del corpus (por ejemplo, el sufijo `Dp-10mb-packed`) y servir como banco de pruebas de bajo coste para infraestructura de inferencia compatible con `text-generation-inference` y endpoints. La model card no documenta licencia, idiomas soportados, longitud de contexto ni composicion del dataset de ajuste, por lo que buena parte de sus especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal decoder-only), segun el tag `gpt2` |
| Parametros totales | 124.770.816 (aproximadamente 124,8 M, dato de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en safetensors y son convertibles a GGUF/INT8/INT4 con herramientas externas |
| Idiomas soportados | no disponible en la metadata; el modelo base es de hindi en devanagari (`hin_deva`), por lo que el ajuste esta previsiblemente orientado a ese idioma, sin confirmacion del autor |
| Licencia | no disponible (la model card solo incluye un marcador `licence: license`, sin identificador) |
| Formato de pesos | safetensors (repo de 0,3 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | goldfish-models/hin_deva_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 (segun metadata de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer causal decoder-only con atencion completa y normalizacion pre-LayerNorm, del orden de 124,8 M de parametros, que coincide con la configuracion clasica de GPT-2 small. No se documentan innovaciones arquitectonicas: no hay mezcla de expertos, atencion lineal, decodificacion especulativa ni componentes multimodales. El modelo base, `goldfish-models/hin_deva_100mb`, pertenece a una familia de modelos monolingues entrenados con aproximadamente 100 MB de texto por idioma, de modo que la ventana de contexto y el vocabulario efectivo estan fuertemente condicionados por ese corpus reducido.

En cuanto al entrenamiento, la model card indica exclusivamente que se ha aplicado SFT (supervised fine-tuning) mediante TRL, sin especificar el numero de tokens de ajuste, la composicion del dataset, la existencia de una fase de RLHF/DPO ni los hiperparametros. El nombre del repositorio aporta pistas sin confirmar: `ppt`, `Dp-10mb`, `packed` y `bfd` parecen referirse a variantes de preprocesado, empaquetado de secuencias y seleccion de datos, y `seed455` a la semilla del experimento. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers` de la Universidad de Groningen. Las versiones de framework declaradas son TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (hindi en devanagari, segun la denominacion `hin_deva`), condicionada por el corpus de ajuste.
- Uso en formato conversacional: el ejemplo oficial de la model card invoca el pipeline con una lista de mensajes con `role: user` y `return_full_text=False`, lo que indica que el autor espera prompts con estructura de chat (sin confirmar la existencia de una plantilla de chat registrada).
- Generacion con `max_new_tokens` configurable mediante `transformers.pipeline`, con opcion de ejecucion en CUDA.
- Compatibilidad declarada con `text-generation-inference` y con endpoints alojados (tags `text-generation-inference` y `endpoints_compatible`).
- Ajuste posterior y experimentacion: al ser un modelo de 124,8 M derivado de un entrenamiento SFT reproducible, sirve como punto de partida para nuevos ciclos de fine-tuning con TRL.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, vision, audio ni modo de pensamiento explicito.
- No hay evidencia de capacidades multilingues mas alla del idioma del modelo base.

## Casos de uso

- Investigacion academica sobre tokenizacion y datos: el modelo forma parte del proyecto `new-tokenizers` de la Universidad de Groningen y su nombre codifica una configuracion experimental concreta (`Dp-10mb-packed`, semilla 455), por lo que es adecuado para comparar el efecto de distintas estrategias de preprocesado sobre un mismo corpus hindi.
- Reproducibilidad de experimentos de SFT: al publicar el modelo base, las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers y el enlace al run de Weights & Biases, permite replicar el ajuste en un entorno controlado con un coste de computo minimo (124,8 M de parametros).
- Generacion de texto sintetico en hindi para aumento de datos: puede producir continuaciones de texto en devanagari que sirvan como material auxiliar para entrenar o evaluar modelos mayores, asumiendo la necesidad de filtrado posterior por calidad.
- Pruebas de infraestructura de despliegue: su tamano (repo de 0,3 GB y pesos safetensors) lo convierte en un candidato idoneo para validar pipelines de `text-generation-inference`, vLLM o llama.cpp antes de escalar a modelos de mayor tamano, ya que cabe en cualquier GPU consumer e incluso en CPU.
- Evaluacion de perplejidad y analisis linguistico del hindi: util para medir como un modelo entrenado con 100 MB de texto modela determinadas variedades o dominios del idioma, comparando resultados entre semillas y configuraciones de datos.
- Docencia y practicas de ajuste fino: adecuado como ejemplo de ciclo completo (modelo base, SFT con TRL, publicacion en HuggingFace, seguimiento con W&B) en cursos o talleres, por su bajo requisito de VRAM.
- Prototipos de generacion de texto de dominio muy acotado: con un vocabulario y un corpus limitados, puede emplearse en demos internas de completado de frases cortas en hindi, siempre que se acepte su propension a la incoherencia en secuencias largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los 124,8 M de parametros ocupan aproximadamente 0,5 GB; en FP16/BF16 unos 0,25 GB; en cuantizacion INT8 unos 0,13 GB y en INT4 alrededor de 0,07 GB, a lo que hay que sumar el espacio de la cache KV (que depende de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no necesita A100, H100 ni GPU de centro de datos. Bastan una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, y tambien en CPU. El cuello de botella no sera la memoria sino la latencia de generacion.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` (declarado en los tags del repositorio), vLLM, llama.cpp u Ollama previa conversion de los pesos safetensors a GGUF. Los endpoints alojados de HuggingFace tambien estan marcados como compatibles.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455 | 124,8 M | no disponible | hindi devanagari (segun modelo base, sin confirmar) | no disponible | Publico en HuggingFace, 0 descargas y 0 likes |
| goldfish-models/hin_deva_100mb (modelo base) | no disponible en la informacion (misma familia de 100 MB por idioma) | no disponible | hindi devanagari | no disponible en la informacion aportada | Publico en HuggingFace; es la referencia directa de este ajuste |
| GPT-2 small (referencia historica de la misma arquitectura) | 124 M | 1024 tokens | ingles | MIT (segun la documentacion publica de OpenAI) | Ampliamente disponible en HuggingFace y en multiples formatos |

Nota: los datos de la fila de GPT-2 small proceden de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen unicamente como referencia de tamano y arquitectura. No se dispone de comparativas de rendimiento verificadas entre estos modelos.

## Limitaciones y advertencias

- Tamano muy reducido: con 124,8 M de parametros y un corpus base de 100 MB, la coherencia decae rapidamente en generaciones largas y la tasa de afirmaciones incorrectas o sin sentido es alta. No es apto para tareas que exijan precision factual.
- Riesgo de alucinacion elevado: no hay evidencia de fases de alineacion (RLHF/DPO), solo SFT, y la model card no documenta ningun proceso de filtrado de respuestas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones multi-turno largas ni en documentos extensos.
- Cobertura idiomatica limitada: el ajuste parte de un modelo monolingue de hindi en devanagari, por lo que el rendimiento en otros idiomas, incluido el castellano, es previsiblemente muy pobre. No se declara oficialmente ningun idioma soportado.
- Licencia indefinida: la model card incluye un marcador generico (`licence: license`) y la metadata de HuggingFace no especifica licencia. Esto impide determinar si el uso comercial esta permitido y supone un riesgo legal en cualquier despliegue en produccion.
- Sin validacion por parte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones independientes publicadas.
- Opacidad del dataset de ajuste: no se especifica el numero de tokens de SFT, la composicion del corpus, los hiperparametros ni los criterios de seleccion de datos; el nombre del repositorio sugiere un experimento con semilla fija, lo que limita la generalizacion de los resultados.
- Fecha de publicacion anomala (2026-09-22) y nomenclatura puramente experimental, indicios de que se trata de un artefacto de investigacion y no de un modelo mantenido.
- Sesgos desconocidos: al no documentarse la procedencia del corpus, no es posible evaluar sesgos de genero, religion, caste u otros sesgos sociales presentes habitualmente en datos web en hindi.
- Advertencia de uso en produccion: no deberia utilizarse en atencion al cliente, generacion de contenido publico ni ningun flujo que requiera fiabilidad sin una evaluacion previa y un filtrado exhaustivo de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/7zwxq46m
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de Goldfish (familia del modelo base): no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con este modelo ni con la familia Goldfish, por lo que no aportan enlaces adicionales utilizables.
