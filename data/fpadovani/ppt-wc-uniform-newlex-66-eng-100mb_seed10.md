# fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed10

# fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed10

## Resumen

Se trata de un ajuste fino supervisado (SFT) del modelo monolingue goldfish-models/eng_latn_100mb, publicado por el usuario fpadovani (vinculado a la Universidad de Groningen, segun la organizacion del proyecto en Weights & Biases). El resultado es un transformer decoder-only de tipo GPT-2 con 86.508.288 parametros, entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2. No es un modelo de proposito general ni un lanzamiento de producto: es el artefacto de un experimento academico, con semilla fija (seed10) y una nomenclatura que sugiere una comparativa controlada de estrategias de muestreo de datos y de lexico.

Su relevancia es, por tanto, metodologica y de investigacion reproducible: sirve como punto de comparacion dentro de una familia de ejecuciones con hiperparametros controlados, y como ejemplo minimo de pipeline SFT con TRL sobre un modelo base pequeno. Con ~86,5 M de parametros y un repositorio de 1,4 GB (que incluye pesos y artefactos de entrenamiento), el coste de inferencia y de replicacion es muy bajo.

La ficha no especifica licencia, idiomas ni resultados de evaluacion, y el modelo base solo dispone de 100 MB de texto de entrenamiento en ingles, lo que acota drasticamente su conocimiento factual y su calidad generativa en comparacion con modelos actuales de miles de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (autoregresivo, atencion causal, embeddings posicionales aprendidos) |
| Parametros totales | 86.508.288 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la familia GPT-2 emplea 1024 tokens; el autor no publica el valor usado) |
| Tipos de cuantizacion | No publicados por el autor; al ser un transformer GPT-2 de 86,5 M de parametros es convertible a int8/int4 (bitsandbytes) y a GGUF mediante herramientas de conversion |
| Idiomas soportados | No disponible (el identificador y el modelo base, eng_latn_100mb, apuntan a ingles; sin confirmacion explicita) |
| Licencia | No disponible (la model card contiene un marcador de posicion: "licence: license") |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa y embeddings posicionales absolutos aprendidos, lo que implica que la ventana de contexto efectiva queda fijada por la longitud vista durante el preentrenamiento y no se extrapola de forma fiable mas alla de ella. El modelo base, goldfish-models/eng_latn_100mb, procede de la coleccion Goldfish de modelos monolingues, caracterizada por entrenar modelos pequenos sobre corpus de 100 MB por idioma; el ajuste fino conserva por completo esa arquitectura y ese vocabulario, y solo modifica los pesos mediante SFT.

El entrenamiento se realizo con aprendizaje supervisado (SFT) mediante TRL 0.23.0, con Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documentan en la model card el numero de tokens de ajuste, la composicion del dataset de instrucciones, ni el uso de RLHF, DPO u otras tecnicas de alineamiento posteriores. El registro del entrenamiento esta disponible en un proyecto de Weights & Biases enlazado desde la propia model card, que es la unica fuente de detalle experimental mas alla del README. El sufijo del nombre (uniform, newlex, 66, seed10) indica que el checkpoint forma parte de una serie de ejecuciones comparadas por estrategia de muestreo y semilla, no un modelo entrenado de forma aislada.

## Capacidades

- Generacion de texto autoregresiva en ingles, con finalizacion de frases y parrafos cortos coherentes.
- Conversacion de un solo turno o de pocos turnos: el ejemplo oficial usa el pipeline de text-generation con una lista de mensajes con rol "user", lo que indica un formato de chat sencillo heredado del SFT.
- Respuesta a preguntas abiertas y de opinion dentro de dominios comunes, con calidad limitada por el tamano del modelo.
- Razonamiento basico de un solo paso; no hay evidencia de cadenas de razonamiento largas ni de modo "thinking" explicito.
- Generacion de codigo: no documentada ni evaluada.
- Matematicas: no documentadas ni evaluadas.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingues: no documentadas; el modelo base es monolingue en ingles (eng_latn).
- Vision, audio y otras modalidades: no soportadas.
- Capacidad especial destacable: ninguna. Es un checkpoint de investigacion en una serie de semillas, util como linea base reproducible.

## Casos de uso

- Replicacion de experimentos de SFT: el modelo permite reproducir con exactitud una configuracion concreta (semilla 10, TRL 0.23.0) y compararla con los otros checkpoints de la misma serie, aislando el efecto de la estrategia de muestreo de datos.
- Linea base en estudios de ajuste fino: sirve como referencia de bajo coste para medir si tecnicas como DPO, LoRA o aumento de datos aportan mejora real sobre un SFT simple en un modelo de 86,5 M de parametros.
- Docencia y demostraciones de pipeline: al caber en CPU y en cualquier GPU consumer, es adecuado para explicar en clase el ciclo completo de tokenizacion, SFT con TRL y generacion con el pipeline de transformers sin depender de infraestructura grande.
- Generacion de texto sintetico para pruebas de infraestructura: util para validar plantillas de despliegue (TGI, vLLM, endpoints compatibles) y probar limites de latencia, batching y streaming sin consumir GPU de gama alta.
- Investigacion sobre sesgos y lexico: dado que el nombre del checkpoint alude a un lexico nuevo (newlex), es apropiado para analizar como cambia la distribucion de vocabulario y las asociaciones del modelo tras el ajuste sobre el modelo base.
- Completado de texto en dominios muy acotados: con un nuevo ajuste fino adicional sobre datos propios, puede usarse para autocompletar plantillas, etiquetas o descripciones cortas en un dominio cerrado, donde la ventana de conocimiento de 100 MB del modelo base no es un obstaculo.
- Prototipado rapido de interfaces conversacionales: para validar el formato de mensajes, el parseo de respuestas y el diseno de una UI de chat antes de migrar a un modelo mayor.
- Analisis de degradacion y olvido catastrofico: al ser un ajuste fino sobre un modelo base publico y pequeno, permite medir cuanto conocimiento general se pierde tras el SFT comparando ambos checkpoints con la misma bateria de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web no aportan datos adicionales sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 346 MB; en fp16/bf16, unos 173 MB; en int8, unos 87 MB; en 4 bits, unos 43 MB. Con el overhead del runtime (activaciones, cache KV, framework) el consumo total se mantiene por debajo de 1-2 GB.
- GPU recomendadas: practicamente cualquier GPU con soporte CUDA sirve; una RTX 3060, una RTX 4090 o una A100 estan enormemente sobredimensionadas para este modelo. Tambien funciona en GPUs integradas y en Apple Silicon via MPS.
- Cabe en GPU consumer: si, en todas las generaciones modernas e incluso en GPUs de gama baja con 4 GB o menos.
- Inferencia en CPU: viable, ya que el modelo completo ocupa menos de 400 MB en fp32 y cabe en cache de CPU; el rendimiento dependera del numero de nucleos y del backend.
- Opciones de despliegue: transformers (pipeline de text-generation), Text Generation Inference (el repo incluye la etiqueta text-generation-inference y endpoints_compatible), vLLM, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no se han publicado mediciones. Por tamano, es un modelo que no requiere tecnicas de reparto entre dispositivos ni cuantizacion agresiva para ejecutarse de forma interactiva en un solo equipo.
- Almacenamiento: el repositorio ocupa 1,4 GB, muy por encima de lo que ocupan los pesos finales (unos 346 MB en fp32), lo que sugiere que incluye checkpoints intermedios u otros artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ppt-wc-uniform-newlex-66-eng-100mb_seed10 | 86,5 M | No disponible | No disponible | HuggingFace (0 descargas) | Ajuste fino SFT de investigacion; sin evaluacion publicada |
| goldfish-models/eng_latn_100mb (modelo base) | No disponible | No disponible | No disponible | HuggingFace | Monolingue en ingles, entrenado sobre 100 MB de texto |
| gpt2 | 124 M | 1024 tokens | Modified MIT | HuggingFace | Referencia de la arquitectura; entrenado sobre un corpus mucho mayor (WebText) |
| distilgpt2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace | Destilado de gpt2, tamano comparable y ampliamente usado como linea base |

La comparacion con gpt2 y distilgpt2 es orientativa en cuanto a tamano y arquitectura, no en cuanto a calidad: ambos se preentrenaron sobre volumenes de texto muy superiores a los 100 MB del modelo base de esta ficha, por lo que su conocimiento factual y su fluidez seran previsiblemente mejores. No se dispone de datos de rendimiento del checkpoint analizado para cuantificar esa diferencia.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card solo contiene un marcador de posicion ("licence: license"), por lo que el uso comercial es incierto y, en la practica, no esta autorizado de forma clara hasta que el autor lo especifique. Debe comprobarse tambien la licencia del modelo base.
- Riesgo elevado de alucinacion: con 86,5 M de parametros y solo 100 MB de texto de preentrenamiento, el modelo no tiene conocimiento factual fiable y producira afirmaciones incorrectas con formato verosimil.
- Razonamiento y coherencia limitados: no cabe esperar cadenas de razonamiento largas, aritmetica fiable ni mantencion de contexto extenso; son limitaciones intrinsecas del tamano.
- Ventana de contexto restringida: al usar embeddings posicionales aprendidos al estilo GPT-2, el rendimiento se degrada fuera de la longitud vista en entrenamiento, que ademas no se documenta.
- Cobertura idiomatica: no hay confirmacion de multilingueidad; todo apunta a un modelo exclusivamente en ingles (script latino, modelo base eng_latn_100mb).
- Sesgos: el corpus del modelo base son 100 MB de texto web, con los sesgos demograficos, culturales y de registro que ese origen implica; no se documenta ningun proceso de mitigacion.
- Sin evaluacion publicada: no existen benchmark, evaluacion de seguridad ni analisis de toxicidad, lo que impide estimar su comportamiento en produccion.
- Artefactos tipicos de modelos pequenos: repeticiones, perdida de hilo, deriva de tema y respuestas truncadas en generaciones largas.
- Relevancia practica acotada: es un artefacto de investigacion con 0 descargas y 0 likes; debe tratarse como un punto de comparacion experimental, no como un componente de produccion.
- Fecha de publicacion: el repositorio esta fechado en septiembre de 2026, por lo que se trata de un lanzamiento reciente sin validacion externa por parte de la comunidad.
- Trazabilidad: no se documentan la composicion del dataset de SFT, el numero de tokens ni los hiperparametros, lo que limita la reproducibilidad mas alla del registro de Weights & Biases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/keesins4
- Los resultados de la busqueda web no contenian ningun enlace relevante al modelo, a su modelo base ni a sus autores; los enlaces devueltos pertenecian a foros no relacionados.
