# fpadovani/ppt-wc-uniform-newlex-77-eng-100mb_seed13

## Resumen

ppt-wc-uniform-newlex-77-eng-100mb_seed13 es un modelo de generacion de texto en ingles obtenido mediante fine-tuning supervisado (SFT) del checkpoint goldfish-models/eng_latn_100mb, un modelo de la familia GPT-2 entrenado con aproximadamente 100 MB de texto en ingles (escritura latina). Lo publica el usuario fpadovani (afiliacion apuntada en los registros de entrenamiento: University of Groningen) y el artefacto se ha generado con la libreria TRL de Hugging Face.

Se trata de un modelo pequeno: 86.508.288 parametros reales en safetensors, es decir, un orden de magnitud por debajo de GPT-2 small (124 M) y muy lejos de los modelos conversacionales actuales. El repositorio ocupa 1,4 GB, lo que sugiere pesos en fp32 y varios ficheros auxiliares de entrenamiento. No es un modelo de proposito general ni un asistente: por su tamano y por su procedencia (fine-tuning de un checkpoint de investigacion con solo 100 MB de datos) encaja en el terreno de la experimentacion academica sobre estrategias de entrenamiento.

La relevancia de la ficha es, por tanto, acotada: sirve como ejemplo reproducible de un pipeline SFT con TRL, como punto de referencia para estudios de mezcla de datos y como caso de modelo que se puede ejecutar en cualquier portatil sin GPU. La model card no documenta licencia efectiva, idiomas declarados, ventana de contexto, composicion del dataset ni resultados de evaluacion, por lo que la mayor parte de las cifras de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` del repositorio) |
| Parametros totales | 86.508.288 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ; al ser safetensors se puede cuantizar a posteriori con herramientas externas) |
| Idiomas soportados | no disponible oficialmente; el modelo base es `goldfish-models/eng_latn_100mb`, correspondiente a ingles en escritura latina |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador de posicion, sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2: un transformer decoder-only con atencion causal completa, sin mecanismos de atencion lineal, SSM ni mezcla de expertos. Se parte del checkpoint goldfish-models/eng_latn_100mb, un modelo de investigacion entrenado sobre aproximadamente 100 MB de texto en ingles, y se aplica un fine-tuning supervisado con TRL (version 0.23.0) sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El sufijo del nombre (`ppt-wc-uniform-newlex-77`, `seed13`) apunta a un experimento de ponderacion o mezcla de datos con semilla 13, aunque la model card no describe la composicion del dataset ni el numero de tokens de entrenamiento.

No se documenta el uso de RLHF, DPO, decodificacion especulativa, atencion con ventana deslizante ni ninguna otra innovacion tecnica. Tampoco se indica la longitud de contexto efectiva del checkpoint base ni si se modifico durante el fine-tuning. El unico artefacto de trazabilidad es un enlace a un run de Weights & Biases del proyecto `f-padovani-university-of-groningen/white_cotterell`, que constituye la fuente principal para reconstruir hiperparametros si el run sigue siendo publico.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del checkpoint base de 100 MB; el vocabulario y la competencia linguistica estan limitados por ese presupuesto de datos.
- Formato conversacional: el ejemplo de la model card usa `pipeline("text-generation")` con una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que indica que el modelo se ha entrenado con un template de chat y responde a instrucciones de una sola vuelta.
- Finalizacion de texto y continuacion de prompts, utilidad principal de un modelo GPT-2 pequeno.
- Integracion con el ecosistema Transformers y con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`), por lo que puede servirse mediante la API estandar de generacion.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no declaradas. El modelo base esta etiquetado como `eng_latn`, de modo que el uso fiable se restringe al ingles.
- No se documentan capacidades de codigo, matematicas ni tareas de razonamiento formal.

## Casos de uso

- Reproduccion de experimentos de SFT: al estar generado con TRL 0.23.0 y tener un run de Weights & Biases asociado, sirve para replicar un pipeline de fine-tuning supervisado paso a paso en un entorno academico, incluida la comparacion entre semillas.
- Estudio de mezcla y ponderacion de datos: el identificador `ppt-wc-uniform-newlex-77` sugiere una variante de un barrido de configuraciones de datos; el checkpoint permite comparar esa configuracion contra otras del mismo estudio manteniendo fijo el modelo base.
- Generacion de datos sinteticos de bajo coste: con 86,5 M de parametros se pueden producir continuaciones de texto en grandes volumenes en CPU para tareas auxiliares (aumento de datos, preentrenamiento de clasificadores, generacion de negativos), asumiendo la baja calidad relativa frente a modelos mayores.
- Pruebas de infraestructura y CI: su tamano minimo permite validar plantillas de despliegue, plantillas de chat, integracion con TGI o pipelines de evaluacion automatizada sin consumir GPU ni presupuesto de inferencia.
- Educacion y docencia: es un ejemplo manejable para explicar tokenizacion, atencion causal, fine-tuning supervisado y evaluacion de modelos en cursos de procesamiento de lenguaje natural, ejecutable en un portatil.
- Baseline en evaluaciones comparativas: sirve como referencia inferior en estudios de escalado o de destilacion, proporcionando un punto de comparacion con 100 MB de datos de entrenamiento frente a modelos mayores.
- Generacion de texto creativo asistida en ingles: continuaciones de parrafos, resumenes muy cortos o reformulaciones simples, siempre con revision humana y sin expectativas de coherencia en textos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica, y las busquedas web realizadas no han devuelto documentacion adicional del modelo (los resultados obtenidos corresponden a servicios de correo no relacionados).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 para los pesos (86,5 M de parametros), 0,17 GB en fp16/bf16 y 0,09 GB en int8. En la practica, la memoria total necesaria para cargar el modelo con Transformers ronda 1-2 GB contando el runtime de PyTorch y el cache de activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, T4, A100, H100). No requiere aceleradores de gama alta.
- Viabilidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPUs con memoria unificada. Tambien se ejecuta en CPU con latencias de decenas de milisegundos por token.
- Opciones de despliegue: `transformers.pipeline("text-generation")` como via directa; Text Generation Inference (TGI) dado el tag `text-generation-inference`; endpoints compatibles segun el tag `endpoints_compatible`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-uniform-newlex-77-eng-100mb_seed13 | 86,5 M | no disponible | SFT sobre goldfish-models/eng_latn_100mb (base de ~100 MB de texto) | no disponible | safetensors en Hugging Face, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible en la informacion proporcionada | no disponible | ~100 MB de texto en ingles | no disponible | publico en Hugging Face |
| GPT-2 small (referencia de arquitectura) | 124 M (cifra publica ampliamente conocida) | no disponible | WebText | licencia modificada de MIT (cifra publica) | publico |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este checkpoint ni para su modelo base en la informacion disponible. La unica diferencia contrastable es el numero de parametros (86,5 M frente a los 124 M de GPT-2 small) y el origen de los datos de entrenamiento, muy inferior en volumen en el caso de la familia goldfish de 100 MB. Los datos de GPT-2 small se incluyen solo como referencia de arquitectura conocida y no como medicion de este modelo.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre un corpus reducido en ingles, reproduce los sesgos presentes en ese corpus; no hay documentacion de filtrado, mitigacion ni evaluacion de sesgos.
- Alucinacion: la tasa de afirmaciones incorrectas es alta en modelos de este tamano, especialmente en preguntas factuales o de conocimiento del mundo.
- Contexto e idioma: ventana de contexto no documentada y capacidades limitadas al ingles en escritura latina; el rendimiento en otros idiomas no esta garantizado ni evaluado.
- Licencia: la model card no especifica una licencia efectiva (`licence: license` es un marcador vacio), por lo que no se puede asumir permiso de uso comercial. Ademas, la licencia del modelo base, goldfish-models/eng_latn_100mb, debe consultarse por separado antes de cualquier uso derivado.
- Trazabilidad: no se documentan hiperparametros, composicion del dataset, numero de tokens vistos ni criterios de seleccion del checkpoint; el run de Weights & Biases enlazado puede no ser accesible publicamente.
- Uso en produccion: no es un modelo adecuado para atencion al cliente, generacion de codigo en produccion, agentes ni tareas que requieran tool calling, razonamiento multi-paso o contexto largo. Su tamano lo situa como herramienta de investigacion, no como componente de sistemas en produccion.
- Adopcion nula: 0 descargas y 0 likes en la fecha de consulta, sin validacion externa de calidad ni de comportamiento.
- El ejemplo de la model card asume una plantilla de chat con roles; usar el modelo con prompts en formato plano puede degradar notablemente la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-77-eng-100mb_seed13
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/fnpes9af
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", GitHub, 2020
- No se han encontrado papers, blogs, demos ni repositorios adicionales del modelo en la busqueda web realizada.
