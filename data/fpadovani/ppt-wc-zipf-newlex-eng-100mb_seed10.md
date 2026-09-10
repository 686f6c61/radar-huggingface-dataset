# fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed10

## Resumen

`fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed10` es un modelo de generacion de texto en ingles de 86.508.288 parametros, resultado de un ajuste fino supervisado (SFT) sobre `goldfish-models/eng_latn_100mb`, un modelo monolingue de ingles entrenado con 100 MB de texto dentro de la familia Goldfish. El entrenamiento se ha realizado con la libreria TRL (version 0.23.0) y Transformers 4.56.2, y el repositorio esta etiquetado como `generated_from_trainer`, con soporte declarado para text-generation-inference y compatibilidad con endpoints de inferencia.

Por la etiqueta `gpt2` del repositorio y por el modelo base, la arquitectura es un transformer decoder-only de tipo GPT-2, con alrededor de 86 millones de parametros, muy por debajo de los 124 millones de GPT-2 small, presumiblemente por un vocabulario mas reducido. El nombre del modelo (`ppt-wc-zipf-newlex-eng-100mb_seed10`) sugiere un experimento de investigacion sobre distribuciones de frecuencia tipo Zipf y composicion lexica, y la ejecucion de entrenamiento esta registrada en el proyecto de Weights & Biases de la Universidad de Groningen, aunque la model card no documenta el objetivo ni el dataset de ajuste.

Su relevancia es limitada en terminos de producto: no es un modelo de proposito general ni compite con modelos actuales de 100-150 millones de parametros en calidad. Su interes es metodologico y reproducible (semilla 10 declarada, framework versionado) para estudiar como el ajuste fino supervisado afecta a modelos pequenos entrenados con presupuestos de datos muy reducidos, y como artefacto de bajo coste para pruebas de infraestructura de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun etiqueta `gpt2` del repositorio) |
| Parametros totales | 86.508.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (arquitectura GPT-2; valor habitual de 1024 tokens, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (no se han publicado pesos GGUF, AWQ, GPTQ ni FP8; solo safetensors) |
| Idiomas soportados | no disponible declarado; el modelo base es `eng_latn_100mb`, por lo que el alcance documentado es ingles |
| Licencia | no disponible (la model card indica unicamente `licence: license`, sin texto legal) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT (TRL 0.23.0) |
| Semilla | 10 (indicada en el nombre del modelo) |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica especifica en la informacion proporcionada. Los unicos datos verificables son: el repositorio esta etiquetado con `gpt2` y con `base_model:goldfish-models/eng_latn_100mb`, de modo que la arquitectura de partida es un transformer decoder-only con atencion causal, preentrenado de forma monolingue sobre aproximadamente 100 MB de texto en ingles. El modelo final tiene 86.508.288 parametros, un orden de magnitud coherente con un GPT-2 de vocabulario reducido, y se ha ajustado con SFT usando TRL sobre un dataset no especificado en la model card.

El proceso de ajuste fino se ejecuto con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documentan el numero de tokens de ajuste, la composicion del dataset, la presencia de RLHF o DPO (el metodo declarado es unicamente SFT), ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El ejemplo de uso de la model card emplea un mensaje con rol `user` (`[{"role": "user", "content": ...}]`), lo que indica que el formato de entrenamiento es conversacional o de instrucciones de un solo turno, sin que se confirme la existencia de una plantilla de chat registrada en el tokenizador. La ejecucion de entrenamiento esta trazada en Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/white_cotterell`, con identificador de run `c5smmyd6`.

## Capacidades

- Generacion de texto en ingles: capacidad principal heredada del pipeline `text-generation`; el modelo autocompleta o responde a entradas textuales.
- Respuesta a indicaciones en formato conversacional: el ejemplo oficial pasa un mensaje con rol `user` y devuelve texto generado con `max_new_tokens=128`.
- Razonamiento y matematicas: no disponibles como capacidades declaradas; un modelo de 86 M de parametros entrenado con 100 MB de datos no suele mostrar competencia fiable en tareas de razonamiento multi-paso.
- Generacion de codigo: no documentada.
- Tool calling o function calling: no soportado (no se declara plantilla de herramientas ni capacidades de agentes).
- Capacidades de agente y razonamiento multi-paso: no soportadas de forma nativa.
- Multilingue: no disponible; el alcance documentado es ingles.
- Capacidades especiales: no se declara modo de razonamiento (thinking), vision, audio ni ninguna otra modalidad.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, que indican que puede servirse con TGI y con los endpoints gestionados compatibles con la libreria transformers.

## Casos de uso

- Investigacion en linguistica computacional: el nombre del modelo (`ppt-wc-zipf-newlex`) apunta a un experimento sobre distribuciones de frecuencia Zipf y composicion lexica; el modelo sirve como artefacto reproducible (semilla 10 declarada) para comparar condiciones experimentales sobre un mismo modelo base.
- Baseline en estudios de escalado de datos: dado que el modelo base se entreno con 100 MB de ingles, este ajuste permite comparar contra variantes de 1 GB del mismo corpus Goldfish en tareas de generacion, manteniendo constante la arquitectura.
- Pruebas de infraestructura de inferencia: con 86,5 M de parametros y pesos safetensors, es util para validar pipelines de TGI, endpoints compatibles y despliegues en contenedor sin consumir GPU de gama alta.
- Generacion de texto corto en ingles para demos internas: prototipos de autocompletado, resumenes de una frase o reformulacion donde la calidad no sea critica y el coste por token deba ser minimo.
- Experimentos de ajuste fino adicional: al ser un punto de partida pequeno y rapido de entrenar, permite iterar sobre tecnicas de SFT, DPO o curacion de datos en horas en lugar de dias.
- Validacion de tokenizadores y vocabularios en ingles: util para medir el impacto de decisiones de vocabulario en la perplejidad de un modelo pequeno, comparando contra el modelo base sin ajustar.
- Ensenanza y practicas de laboratorio: reproducir de principio a fin un pipeline de TRL con datos reducidos, incluida la trazabilidad en Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, eleutherAI/lm-evaluation-harness ni ninguna otra metrica de evaluacion, y no se dispone de numeros comparables publicados por el autor. No se deben asumir cifras de rendimiento para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32 (86,5 M de parametros x 4 bytes), unos 175 MB en fp16/bf16 y unos 90 MB en int8. El tamano del repositorio (1,4 GB) es mayor que los pesos finales porque incluye artefactos de entrenamiento.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente. Una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo; se desaconseja su uso por coste.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (serie GTX 10xx en adelante) e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable. Con 86,5 M de parametros, la generacion es fluida en procesadores de escritorio actuales, con latencia dependiente de la longitud generada y del backend.
- Opciones de despliegue: vLLM y TGI (el repositorio declara `text-generation-inference` y `endpoints_compatible`); `transformers` con `pipeline("text-generation")` segun el ejemplo oficial. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo, time to first token ni resultados de pruebas de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed10` | 86.508.288 | no disponible | no disponible | HuggingFace, safetensors | Ajuste SFT de investigacion sobre Goldfish 100 MB; sin benchmarks publicados |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Preentrenamiento monolingue en ingles con 100 MB de datos; punto de partida de este ajuste |
| GPT-2 small | 124 M | 1024 tokens | MIT (terminos de OpenAI) | Amplia, multiples formatos (safetensors, GGUF, ONNX) | Referencia historica de la misma familia arquitectonica; ecosistema y herramientas mucho mas maduros |
| Pythia-70M | 70 M | 2048 tokens | Apache 2.0 | HuggingFace, safetensors | Modelo de investigacion con checkpoints intermedios y suite de evaluacion publicada |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | HuggingFace, GGUF, ONNX | Modelo pequeno moderno con datos de entrenamiento mucho mayores y benchmarks publicados |

Las cifras de parametros, contexto y licencia de los modelos comparativos corresponden a informacion publica general; los datos del modelo base Goldfish no se detallan en la informacion proporcionada y se marcan como no disponibles.

## Limitaciones y advertencias

- Sesgos: no documentados. Un modelo entrenado con 100 MB de texto en ingles hereda los sesgos de ese corpus, que no se describe en la model card.
- Alucinacion: riesgo alto y sin cuantificar. Con 86,5 M de parametros y un corpus de entrenamiento muy reducido, la generacion puede producir texto gramaticalmente plausible pero factualmente incorrecto. No debe usarse en tareas que requieran veracidad.
- Limitaciones de contexto: la longitud de contexto no esta declarada. Si se confirma el valor habitual de GPT-2 (1024 tokens), las conversaciones multi-turno largas y el procesamiento de documentos quedan fuera de alcance.
- Limitaciones de idioma: el alcance documentado es ingles. No hay evidencia de capacidad multilingue y no se declaran idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible. La model card solo contiene el campo `licence: license`, sin texto legal, por lo que no se puede confirmar el uso comercial. Uso en produccion desaconsejado hasta que el autor aclare los terminos.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, lo que impide estimar calidad frente a alternativas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion reciente (creado el 2026-09-10) sin comunidad ni mantenimiento conocido.
- Formato de prompt: el ejemplo oficial usa mensajes con rol, pero no se confirma que el tokenizador incluya plantilla de chat; el comportamiento fuera de ese formato no esta verificado.
- Repositorio pesado para su tamano: 1,4 GB para 86,5 M de parametros, probablemente por artefactos de entrenamiento incluidos, lo que aumenta el tiempo de descarga sin aportar valor de inferencia.
- No apto para produccion: no debe emplearse en atencion al cliente, generacion de codigo en CI/CD ni ningun flujo con requisitos de precision, seguridad o trazabilidad legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/c5smmyd6
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre la familia Goldfish; los resultados obtenidos correspondian a paginas no relacionadas sobre mantenimiento de vehiculos industriales y se han descartado por completo. No se dispone por tanto de papers, blogs ni demos adicionales verificables.
