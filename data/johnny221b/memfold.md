# Johnny221B/memfold

## Resumen

MemFold es una propuesta de memoria blanda aprendida (learned soft memory) para razonamiento sobre contextos largos. En lugar de mantener el historial completo en la ventana de atencion, el sistema comprime memorias textuales en tokens blandos aprendidos y entrena un lector (reader) para responder a partir de ellos. El repositorio `Johnny221B/memfold` publica los adaptadores LoRA del lector y los componentes de memoria asociados, construidos sobre modelos de la familia Qwen.

El desarrollo corre a cargo de Johnny221B (haichuan wu), con codigo de referencia en GitHub y pesos alojados en Hugging Face. Se publican nueve bundles de lector repartidos en tres dominios de entrenamiento (PersonaMem-32K, PersonaMem-128K y LoCoMo) y tres backbones (Qwen3-4B, Qwen2.5-3B-Instruct y Qwen2.5-7B-Instruct). El repositorio pesa 1,4 GB, no incluye los pesos completos del backbone y declara `inference: false`.

La relevancia del proyecto reside en su enfoque de presupuesto fijo de memoria: en lugar de escalar la ventana de contexto, aprende a comprimir el historial en un numero acotado de tokens (256 tokens de bridge en PersonaMem y 512 tokens por sesion en la ruta LoCoMo). Es material de investigacion reproducido a nivel de adaptadores, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers decoder-only de la familia Qwen; el repositorio incluye reader LoRA mas componentes de memoria (bridge de 256 tokens; en LoCoMo, mapper y compresor de 512 tokens por sesion) |
| Parametros totales | No disponible. El repositorio contiene adaptadores y componentes de memoria, no pesos completos del backbone. Los modelos base asociados son Qwen3-4B, Qwen2.5-3B-Instruct y Qwen2.5-7B-Instruct |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Los nombres de los bundles aluden a dominios de entrenamiento de 32K y 128K tokens (PersonaMem-32K y PersonaMem-128K); el presupuesto de memoria es de 256 tokens para el bridge y de 512 tokens por sesion en LoCoMo |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion aplicable depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | memfold-and-upstream-model-licenses: componentes propios y codigo auxiliar bajo MIT, sujetos a los terminos de los modelos upstream. Qwen3-4B y Qwen2.5-7B-Instruct bajo Apache-2.0; Qwen2.5-3B-Instruct bajo Qwen Research License, con restriccion no comercial |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA mas ficheros de componentes de memoria, `bundle.json` por bundle y `manifest.json` con hashes) |

## Arquitectura y entrenamiento

MemFold separa el problema en dos piezas. Un escritor (writer) genera memorias a partir del texto; un compresor las proyecta a un numero fijo de tokens blandos, y un lector entrenado con LoRA aprende a responder usando ese prefijo blando. En los bundles de PersonaMem el componente de memoria es un bridge de 256 tokens; en la ruta LoCoMo se anaden un mapper y un compresor de 512 tokens por sesion, y existe un writer compartido (`shared/locomo-writer-qwen3-4b/`) empleado para generar las memorias de los tres lectores LoCoMo-to-LongMemEval. El codigo del proyecto cubre extraccion de memoria, preentrenamiento del compresor, entrenamiento del lector, inferencia y baselines.

El repositorio no incluye datos de entrenamiento, checkpoints intermedios, checkpoints de ablacion, baselines ni memorias de API: solo los nueve bundles de lector de resultado principal y el writer compartido. La model card advierte que la liberacion se ha verificado para integridad de ficheros y carga de componentes en CPU, pero no constituye una nueva ejecucion completa de benchmarks en GPU, y que los ajustes historicos de evaluacion pueden diferir de los valores por defecto actuales del codigo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Compresion de memorias textuales en tokens blandos aprendidos con presupuesto fijo (256 tokens en PersonaMem; 512 tokens por sesion en LoCoMo).
- Respuesta a preguntas a partir de memoria comprimida: el lector se entrena para responder usando el prefijo blando en lugar del historial completo.
- Personalizacion de largo plazo sobre el dominio PersonaMem-32K y PersonaMem-128K.
- Memoria conversacional de largo plazo evaluada en LongMemEval a partir de entrenamiento en LoCoMo.
- Transferencia entre dominios combinando memoria blanda con texto acotado (evaluaciones de transferencia de LoCoMo a LongMemEval).
- Compatibilidad con el ecosistema PEFT: los bundles exponen `load_reader(bundle, **model_kwargs)` para cargar el lector.
- Idiomas: solo ingles.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponibles en la informacion proporcionada (dependen del modelo base y no se documentan para estos adaptadores).

## Casos de uso

- Asistentes con memoria de usuario persistente: el bridge de 256 tokens permite conservar un perfil de persona comprimido y responder sin arrastrar el historial completo, lo que reduce el coste por turno en conversaciones de muchos dias.
- Atencion al cliente multi-sesion: la ruta LoCoMo con 512 tokens de memoria por sesion esta pensada para hilos de soporte donde el cliente vuelve en sesiones distintas y se necesita continuidad sin reenviar todo el transcript.
- Investigacion en compresion de contexto: sirve como baseline reproducible para comparar memoria blanda aprendida frente a RAG, sumarizacion previa o ventanas de contexto ampliadas.
- Evaluacion academica sobre LongMemEval: los bundles LoCoMo-to-LongMemEval permiten medir transferencia de un dominio de entrenamiento a un benchmark de memoria de largo plazo.
- Agentes con estado de larga duracion: la memoria comprimida puede actuar como estado serializable entre pasos de un agente, manteniendo el presupuesto de tokens acotado por sesion.
- Prototipado de pipelines de memoria sobre Qwen: al ser adaptadores PEFT sobre Qwen3-4B, Qwen2.5-3B y Qwen2.5-7B, se puede integrar en un stack existente de Qwen sin sustituir el backbone.
- Estudio de personalizacion controlada: PersonaMem-32K y PersonaMem-128K permiten analizar como escala la calidad de la memoria comprimida con el tamano del historial de origen.
- Experimentos de transferencia writer/reader: el writer compartido de LoCoMo posibilita estudiar si un mismo generador de memorias sirve para varios lectores y backbones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que la ruta LoCoMo se evaluo en LongMemEval y que el release se verifico para integridad de ficheros y carga de componentes en CPU, sin aportar cifras. No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas de memoria de largo plazo.

## Requisitos de hardware

- El repositorio en si ocupa 1,4 GB y contiene adaptadores LoRA y componentes de memoria; la VRAM real la determina el modelo base.
- VRAM estimada para el backbone (valores orientativos, no publicados por el autor): alrededor de 6-8 GB en bf16 para Qwen2.5-3B-Instruct, 8-10 GB para Qwen3-4B y 15-17 GB para Qwen2.5-7B-Instruct. Con cuantizacion de 4 bits las necesidades bajan aproximadamente a 2-3 GB, 3-4 GB y 5-6 GB respectivamente.
- GPU recomendadas: los tres backbones caben en GPUs de consumo con 16-24 GB (por ejemplo RTX 4090 o RTX 3090) en bf16, y en GPUs de 8-12 GB si se cuantizan. Para servir varios bundles en paralelo son preferibles A100 o H100.
- Despliegue: los pesos son adaptadores PEFT, por lo que el camino natural es `transformers` con `peft` y el codigo del proyecto (`load_components.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Advertencia de despliegue: segun la model card, cargar solo el adaptador del lector no reproduce MemFold; la inferencia extremo a extremo exige generar o codificar memorias e inyectar el prefijo blando correspondiente con el codigo de inferencia del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de MemFold ni de otros sistemas comparables en la informacion proporcionada. La comparacion se limita a los modelos base sobre los que se montan los adaptadores.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemFold (este repositorio) | Adaptadores LoRA y componentes de memoria sobre Qwen | No disponible (adaptadores) | No disponible; presupuesto de memoria de 256 y 512 tokens | MIT para componentes propios, sujeta a terminos upstream | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Qwen3-4B | Transformer decoder-only (base) | 4B | No disponible en la informacion proporcionada | Apache-2.0 | Publico |
| Qwen2.5-3B-Instruct | Transformer decoder-only (base) | 3B | No disponible en la informacion proporcionada | Qwen Research License (restriccion no comercial) | Publico |
| Qwen2.5-7B-Instruct | Transformer decoder-only (base) | 7B | No disponible en la informacion proporcionada | Apache-2.0 | Publico |

## Limitaciones y advertencias

- Solo ingles: el campo de idioma declarado es `en`, por lo que no hay garantia de comportamiento en castellano u otros idiomas.
- Restriccion no comercial en uno de los backbones: Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License con clausula no comercial, de modo que cualquier bundle montado sobre ese modelo hereda esa limitacion.
- Licencia compuesta: los componentes propios son MIT, pero su uso esta sujeto a los terminos upstream de cada modelo base; es necesario revisar `LICENSE.md`, `NOTICE` y los textos de licencia incluidos.
- No es un modelo autonomo: el repositorio no contiene pesos completos del backbone ni datasets, memorias de API, baselines o checkpoints de ablacion; no reproduce MemFold por si solo.
- `inference: false` declarado en la model card: la inferencia requiere codigo externo y la inyeccion del prefijo blando correspondiente.
- Sin validacion de rendimiento en GPU en este release: la verificacion realizada cubre integridad de ficheros y carga de componentes en CPU, y los ajustes historicos de evaluacion pueden diferir de los valores por defecto del codigo actual.
- Riesgo de alucinacion: no se documentan tasas ni evaluaciones especificas; al tratarse de un lector que responde desde memoria comprimida, la fidelidad depende de la calidad de la compresion.
- Presupuesto de memoria acotado: 256 tokens de bridge y 512 tokens por sesion en LoCoMo. En la model card se subraya explicitamente que los 512 tokens son por sesion y no para todo el historial, un error de interpretacion frecuente.
- Sesgos: no disponibles; no se publica informacion sobre composicion del dataset de entrenamiento ni analisis de sesgos.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de investigacion reciente sin validacion independiente.
- Coincidencia de nombres: el catalogo incluye `shared/locomo-writer-qwen3-4b/`, necesario para la ruta LongMemEval; omitirlo rompe la reproducibilidad de esas evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Johnny221B/memfold
- Codigo fuente: https://github.com/Johnny221B/memfold
- Documentacion del proyecto: https://github.com/Johnny221B/memfold/tree/main/docs
- Manifiesto de artefactos: https://huggingface.co/Johnny221B/memfold/blob/main/manifest.json
- Licencia: https://huggingface.co/Johnny221B/memfold/blob/main/LICENSE.md
- Perfil del autor en Hugging Face: https://huggingface.co/Johnny221B
- Commit de referencia del codigo: e940f82d36bcd5b9ed4d41bf2f1348852d974705
