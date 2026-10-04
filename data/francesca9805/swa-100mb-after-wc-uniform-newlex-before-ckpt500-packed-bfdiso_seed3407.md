# francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407` es un ajuste fino (SFT) publicado por el usuario `francesca9805` en HuggingFace, derivado del modelo base `francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407`. Se trata de un transformer decoder-only de la familia GPT-2 con 124.770.816 parametros totales (aproximadamente 124,8 millones), lo que lo situa en la gama de modelos pequenos orientados a experimentacion mas que a produccion. El entrenamiento se realizo con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0.

El nombre del repositorio sugiere un experimento de investigacion centrado en tokenizadores y estrategias de entrenamiento: los sufijos apuntan a un vocabulario "newlex", a un corpus de entrenamiento de aproximadamente 100 MB, a un checkpoint en el paso 500, a empaquetado de secuencias ("packed") y a una semilla fija (3407). El proyecto de Weights & Biases asociado pertenece a la Universidad de Groningen, lo que refuerza la hipotesis de un trabajo academico de ablacion sobre tokenizacion, aunque esta interpretacion no se confirma de forma explicita en la model card.

La relevancia de esta ficha es limitada para uso productivo: el modelo acumula 0 descargas y 0 likes, no declara licencia, no declara idiomas soportados y no publica resultados de benchmarks. Su interes real es como artefacto reproducible de investigacion sobre tokenizadores y como punto de partida para experimentos controlados de ajuste fino a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only); confirmado por la etiqueta `gpt2` |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Fecha de creacion | 2026-10-03 |
| Fecha de actualizacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal. Con 124.770.816 parametros, el modelo encaja en la configuracion clasica de GPT-2 small (12 capas, 768 dimensiones de modelo, 12 cabezas de atencion), aunque la informacion proporcionada no detalla la configuracion exacta de capas y cabezas, por lo que ese desglose debe considerarse no confirmado. No hay indicios de mecanismos alternativos como MoE, SSM ni arquitecturas hibridas.

El entrenamiento consistio en un ajuste fino supervisado (SFT) partiendo del modelo base indicado, ejecutado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card enlaza una ejecucion de Weights & Biases para consultar las curvas de entrenamiento, pero no describe la composicion del dataset, el numero de tokens vistos, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o ventanas deslizantes, mas alla de lo que sugiere el prefijo "swa" del nombre, cuyo significado no se aclara en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation` de Transformers, con soporte de mensajes en formato de rol (`user`) segun el ejemplo de la model card.
- Conversacion de un solo turno en el ejemplo documentado; no se confirma soporte multi-turno estructurado ni plantilla de chat formal.
- Razonamiento y conocimientos generales: no verificables, ya que no se publican evaluaciones ni benchmarks.
- Generacion de codigo: no documentada.
- Matematicas: no documentadas.
- Vision: no soportada (modelo exclusivamente de texto).
- Audio: no soportado.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; no se declara ninguna lista de idiomas.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Reproduccion de experimentos de investigacion sobre tokenizacion: el modelo forma parte de una serie de ajustes con vocabularios alternativos ("newlex"), por lo que sirve como punto de comparacion controlado frente a otros checkpoints de la misma familia, manteniendo constante la semilla y el volumen de datos.
- Ablacion de estrategias de entrenamiento: al compartir modelo base con otras variantes y diferenciarse en el checkpoint o en el empaquetado de secuencias, permite aislar el efecto de cada decision de entrenamiento en las metricas de validacion.
- Generacion de texto local en CPU: con 124,8 millones de parametros, la inferencia en FP32 ocupa del orden de 500 MB de memoria, lo que permite ejecutarlo en portatiles sin GPU para pruebas de humo y validacion de pipelines.
- Prototipado rapido de interfaces de generacion de texto: util para validar la integracion de un endpoint compatible con text-generation-inference antes de migrar a un modelo mayor, ya que la etiqueta `endpoints_compatible` indica compatibilidad con los endpoints gestionados de HuggingFace.
- Generacion de datos sinteticos a pequena escala para tareas de filtrado o anotacion auxiliar: al ser barato de ejecutar, puede emplearse para producir borradores que luego se curan manualmente o se filtran con un modelo mayor.
- Docencia y formacion: su tamano reducido y su publicacion en safetensors lo hacen adecuado para ilustrar el ciclo completo de SFT con TRL, desde la carga del modelo base hasta la evaluacion cualitativa de salidas.
- Base para ajustes especificos de dominio con recursos limitados: un investigador con un corpus pequeno puede partir de este checkpoint y ajustarlo en una unica GPU consumer en minutos u horas, dependiendo del volumen de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados tecnicos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124,8 millones de parametros x 4 bytes), 0,25 GB en FP16/BF16 y del orden de 0,13 GB en cuantizacion de 8 bits. Estas cifras corresponden al peso del modelo y no incluyen el coste de la cache KV, que depende de la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100. No requiere GPU de centro de datos.
- Compatibilidad con GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable para inferencia interactiva, dado el reducido numero de parametros.
- Opciones de despliegue: Transformers con el pipeline `text-generation` (documentado por el autor), text-generation-inference (la etiqueta `endpoints_compatible` lo indica), servidores compatibles con la API de OpenAI a traves de TGI, y conversiones a GGUF para llama.cpp u Ollama, aunque estas ultimas no estan publicadas en el repositorio y requeririan conversion manual.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden de la informacion proporcionada. El resto de cifras provienen de la documentacion publica de cada modelo y no forman parte de la informacion suministrada, por lo que deben verificarse antes de usarlas en decisiones de produccion.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,8 M | no disponible | no disponible | Ajuste SFT de investigacion, 0 descargas, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Modified MIT | Referencia de la misma arquitectura y tamano; ampliamente evaluado |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Version destilada, mas rapida, menor calidad en tareas complejas |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Apache 2.0 | Entrenado con un corpus mucho mayor y con benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | Salto de escala y contexto; requiere mas VRAM pero ofrece capacidades muy superiores |

La comparacion relevante es con GPT-2 small, dado que comparten arquitectura y orden de magnitud en parametros. La diferencia principal no esta en la arquitectura sino en el regimen de entrenamiento: los modelos de la familia SmolLM o Qwen2.5 han sido entrenados con volumenes de datos sustancialmente mayores y publican evaluaciones, mientras que este checkpoint no ofrece ninguna metrica verificable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un modelo base sin ficha publica detallada, no es posible auditar la composicion del corpus ni los sesgos asociados.
- Riesgo de alucinacion: elevado y no cuantificado. Con 124,8 millones de parametros y un ajuste SFT del que no se conoce el volumen de datos, la tasa de afirmaciones factualmente incorrectas es presumiblemente alta, especialmente fuera de los dominios cubiertos por el corpus de ajuste.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar aplicaciones que requieran ventanas largas.
- Limitaciones de idioma: no se declara ninguna lista de idiomas soportados. No se puede asumir un rendimiento solido en castellano.
- Restricciones de licencia: la model card incluye el campo `licence: license` sin concretar terminos, y la ficha de HuggingFace indica licencia no disponible. Esto implica que no hay autorizacion explicita para uso comercial; en ausencia de terminos claros, debe contactarse con el autor antes de cualquier despliegue productivo.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que no se puede comparar su calidad con alternativas de forma objetiva.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin mantenimiento posterior conocido. No hay garantia de soporte ni de correccion de errores.
- Idoneidad para produccion: baja. El modelo es un artefacto de investigacion; para cargas de trabajo reales conviene evaluar alternativas con licencia clara, contexto documentado y evaluaciones publicas.
- Fecha de creacion inusual: la ficha indica 2026-10-03, posterior a la fecha actual en la mayoria de contextos de consulta, lo que puede deberse a un error de metadatos o a un reloj de sistema mal configurado en el entorno de publicacion. Conviene verificarlo antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/xttv9bab
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes al modelo. Las consultas devolvieron exclusivamente resultados de sitios para adultos sin relacion alguna con el modelo, por lo que se han descartado y no se reproducen aqui.
