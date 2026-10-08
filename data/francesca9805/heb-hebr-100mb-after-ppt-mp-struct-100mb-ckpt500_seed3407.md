# francesca9805/heb-hebr-100mb-after-ppt-mp-struct-100mb-ckpt500_seed3407

## Resumen

`francesca9805/heb-hebr-100mb-after-ppt-mp-struct-100mb-ckpt500_seed3407` es un modelo de generacion de texto publicado en HuggingFace por la usuaria francesca9805, resultante de un ajuste fino supervisado (SFT) con la libreria TRL sobre el modelo base `francesca9805/heb-hebr-100mb-ppt-mp-struct-100mb_seed3407`. Con 124.770.816 parametros segun sus pesos safetensors, se situa en la franja de los transformers decoder-only pequenos, equivalente en orden de magnitud a GPT-2 small. La model card es minima: no declara licencia efectiva, idiomas, longitud de contexto ni datos de entrenamiento mas alla de la traza de hiperparametros.

El nombre del repositorio sugiere una linea de experimentacion centrada en tokenizacion y datos de aproximadamente 100 MB (`heb-hebr-100mb`), con un checkpoint intermedio identificado como `ckpt500` y una semilla fijada (`seed3407`). El run de entrenamiento enlazado en Weights & Biases pertenece a la organizacion "f-padovani-university-of-groningen" y al proyecto "new-tokenizers", lo que apunta a un artefacto de investigacion academica sobre tokenizadores mas que a un modelo listo para produccion.

Su relevancia es por tanto acotada y de tipo metodologico: sirve como punto de comparacion en experimentos controlados de SFT, como base para reproducibilidad de semillas concretas y como ejemplo de model card incompleta. No hay descargas ni valoraciones registradas, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` de HuggingFace |
| Parametros totales | 124.770.816 (~124,8 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura GPT-2 admite tipicamente 1024 tokens |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors en precision completa, convertibles a int8/int4 |
| Idiomas soportados | no disponible; el identificador contiene `heb-hebr` (posible hebreo), pero la model card no lo confirma |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin texto de licencia) |
| Formato de pesos | safetensors, cargable con `transformers` |

Datos adicionales del repositorio: tamano declarado de 7,2 GB (coherente con la inclusion de multiples checkpoints de entrenamiento, dado que los pesos del modelo final en fp32 ocuparian en torno a 500 MB), creado el 2026-10-08 y actualizado el 2026-10-08. Etiquetas de despliegue: `text-generation-inference` y `endpoints_compatible`. Libreria: `transformers`.

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de la familia GPT-2, es decir, un transformer decoder-only con atencion causal, que en su configuracion estandar de 124 M de parametros corresponde a 12 capas, 768 dimensiones de modelo y 12 cabezas de atencion. No se confirma si el autor modifico la configuracion ni si se sustituyo el tokenizador original; el contexto del proyecto en Weights & Biases ("new-tokenizers") sugiere que la tokenizacion es precisamente la variable experimental, pero la model card no aporta la configuracion concreta. El recuento exacto de parametros (124.770.816) es ligeramente distinto del de GPT-2 small, lo que es compatible con cambios en el vocabulario o en el embedding, sin que pueda confirmarse.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se especifican los hiperparametros de entrenamiento (learning rate, batch size, epocas), salvo la referencia al checkpoint 500 y a la semilla 3407 en el propio nombre del modelo.

## Capacidades

- Generacion de texto autoregresiva en el formato de chat que espera la plantilla de mensajes del pipeline de HuggingFace, segun el ejemplo de la model card.
- Ajuste por instrucciones: al provenir de un entrenamiento SFT con TRL, el modelo esta preparado para recibir entradas con roles `user` (y presumiblemente `assistant`) en lugar de texto plano.
- Capacidad multilingue: no documentada. La unica pista es el prefijo `heb-hebr` del identificador, que no se traduce en una declaracion formal de idiomas.
- Tool calling / function calling: no documentado; no hay plantilla de herramientas ni ejemplos en la model card.
- Uso como agente o razonamiento multi-paso: no documentado y poco probable en un modelo de 124 M de parametros sin entrenamiento especifico.
- Modo "thinking", vision o audio: no disponible; el pipeline declarado es exclusivamente `text-generation`.
- Capacidad de servir como punto de partida para ajuste fino posterior: si, es un modelo derivado de otro ajuste fino, por lo que la cadena de fine-tuning es reproducible.
- Compatibilidad con Text Generation Inference y con endpoints compatibles, segun los tags del repositorio.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo incorpora la semilla 3407 y el checkpoint 500 en el nombre, lo que permite a un grupo de investigacion replicar exactamente una condicion concreta de un estudio comparativo de tokenizadores y tamano de datos.
- Estudio de tokenizacion: dado el contexto del proyecto "new-tokenizers", el modelo es util para medir como distintos vocabularios afectan a la perplejidad y a la calidad de generacion en corpus de unos 100 MB.
- Generacion de texto a pequena escala en hebreo (si se confirma el idioma): un modelo de 124 M puede emplearse para tareas de completado de frases o normalizacion de texto donde no se requiera alta fidelidad semantica.
- Prototipado de pipelines de SFT: sirve como caso de prueba de bajo coste para validar un flujo completo con TRL, desde el dataset hasta el despliegue con `text-generation-inference`, sin consumir GPU de gama alta.
- Generacion sintetica de datos de bajo coste: al caber en cualquier GPU de consumo, puede ejecutarse en bucle para producir grandes volumenes de texto candidato que despues se filtren con un modelo mayor.
- Destilacion y experimentos de compresion: es un candidato comodo para estudiar tecnicas de cuantizacion o poda sobre un transformer pequeno antes de aplicarlas a modelos de mayor tamano.
- Educacion y demos docentes: permite ilustrar en un aula el ciclo completo de ajuste fino supervisado con un modelo que se entrena y se sirve en minutos.
- Inferencia en el borde: con pesos de aproximadamente 500 MB en fp32 y 250 MB en fp16, es viable ejecutarlo en CPU o en dispositivos con recursos limitados, siempre que la licencia lo permita (actualmente indeterminada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra), y el repositorio no presenta comparaciones con modelos de referencia. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en fp32, 250 MB en fp16/bf16 y 125-150 MB en cuantizacion int8. En int4 podria situarse por debajo de los 100 MB, aunque no se publican pesos precuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluida una GTX 1050 Ti o superior. Una RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo y solo tendrian sentido para entrenamiento por lotes o para servir muchas replicas en paralelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, asi como en CPU y en dispositivos tipo Raspberry Pi para inferencia en fp32 con latencia alta.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, Text Generation Inference (el repositorio incluye el tag `text-generation-inference`), vLLM, y servidores compatibles con la API de endpoints de HuggingFace. Para llama.cpp u Ollama seria necesario convertir previamente los pesos safetensors a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. A modo orientativo, en una GPU moderna un modelo de este tamano suele generar cientos de tokens por segundo, pero se trata de una estimacion general y no de un dato del autor.
- Entrenamiento o ajuste fino: al ser un modelo de 124 M de parametros, el ajuste fino completo cabe en una unica GPU de consumo con 8-12 GB de VRAM, e incluso en fp32 con gradient checkpointing.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/heb-hebr-100mb-after-ppt-mp-struct-100mb-ckpt500_seed3407` | 124,8 M | no disponible | no disponible | HuggingFace, 0 descargas | Artefacto de investigacion, model card minima |
| GPT-2 small | 124 M | 1024 tokens | Modified MIT | Ampliamente disponible | Referencia de la misma arquitectura; si el fine-tuning no altero la configuracion, son estructuralmente comparables |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente disponible | Alternativa destilada mas rapida, sin ajuste por instrucciones |
| SmolLM2-135M | 135 M | 2048 tokens | Apache 2.0 | HuggingFace | Modelo pequeno moderno entrenado sobre gran volumen de tokens, con licencia clara |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la tabla se limita a parametros, contexto, licencia y disponibilidad. La diferencia principal frente a las alternativas es la ausencia de licencia explicita y la falta de documentacion de idiomas y de datos de entrenamiento.

## Limitaciones y advertencias

- Licencia indeterminada: la model card incluye un campo `licence: license` sin texto. No hay base para asumir permisos de uso comercial; conviene contactar con la autora antes de cualquier uso en produccion.
- Idiomas no declarados: aunque el identificador sugiere hebreo, no hay confirmacion oficial. Cualquier afirmacion sobre cobertura multilingue seria especulativa.
- Longitud de contexto no documentada: si se mantiene la configuracion estandar de GPT-2, el limite practico es de 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Riesgo elevado de alucinacion: un modelo de 124 M de parametros sin fases de RLHF o DPO documentadas tiende a producir texto plausible pero factualmente poco fiable. No deberia usarse como fuente de informacion.
- Sesgos: no se documenta la composicion del dataset, por lo que no es posible evaluar sesgos de genero, religion, origen etnico ni de otro tipo. El riesgo de amplificacion de sesgos presentes en el corpus de entrenamiento es real y no medido.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita estimar su calidad frente a alternativas.
- Modelo derivado de otro fine-tuning: al construirse sobre `heb-hebr-100mb-ppt-mp-struct-100mb_seed3407`, hereda cualquier limitacion, sesgo o artefacto del modelo anterior, que a su vez no esta documentado en la informacion disponible.
- Trazabilidad parcial: el unico registro de entrenamiento es un enlace a un run de Weights & Biases, sin descripcion de hiperparametros en la model card.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Repositorio de 7,2 GB: probablemente contiene checkpoints intermedios, lo que aumenta el coste de descarga sin aportar necesariamente pesos adicionales utiles.
- Uso en produccion desaconsejado en su estado actual: sin licencia, sin evaluacion y sin documentacion de idiomas, no cumple los minimos habituales para un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-100mb-after-ppt-mp-struct-100mb-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-mp-struct-100mb_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/dbl2gzgl
- Repositorio de TRL: https://github.com/huggingface/trl
