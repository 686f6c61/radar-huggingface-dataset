# Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s3-searchqa-20260920

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3-1.7B, entrenado por el usuario Diluner con `gpt-5.4-mini` como profesor. Se trata del checkpoint final de la etapa "searchqa" dentro de una cadena secuencial de tres entornos: BabyAI, TextCraft y SearchQA. Cada entorno recibe cinco epochs; en la etapa searchqa se completaron 935 actualizaciones del optimizador. El modelo tiene 2.031.739.904 parametros segun los pesos en safetensors y el repositorio ocupa 8,1 GB.

El objetivo del entrenamiento no es la conversacion generalista, sino el comportamiento de agente en tareas verificables: navegacion en entornos tipo gridworld (BabyAI), planificacion y crafteo en un mundo de texto (TextCraft) y respuesta a preguntas sobre evidencia recuperada (SearchQA). La evaluacion publicada usa avg@4 (media de exito en cuatro intentos por tarea oficial), con temperatura 0,4, top-p 1,0, top-k 20, modo "thinking" desactivado y 512 tokens generados por turno.

Su relevancia es principalmente metodologica: documenta una cadena secuencial de SFT con destilacion desde un profesor y expone resultados por entorno, incluidos 200 tareas ID y 200 OOD en SearchQA. El autor advierte explicitamente de que se trata de un unico checkpoint y no de evidencia de una ventaja general del metodo ni de replicacion entre semillas. No se declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-1.7B (no detallada en la model card) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el modelo base Qwen3-1.7B declara 32.768 tokens de contexto nativo en su documentacion publica |
| Tipos de cuantizacion | No disponible; el repositorio solo incluye pesos en safetensors (sin GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el autor no declara licencia y remite a los terminos del modelo base |
| Formato de pesos | safetensors (shards en la raiz del repositorio, junto con configuracion y tokenizer) |
| Tamano del repositorio | 8,1 GB (coherente con aproximadamente 4 bytes por parametro; el dtype no se confirma) |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor usado en SFT | gpt-5.4-mini (referenciado en las etiquetas y en la model card) |
| Pipeline | text-generation |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card; el checkpoint declara Qwen/Qwen3-1.7B como modelo base, por lo que hereda la configuracion del transformer decoder-only denso de Qwen3 en su variante de 1,7B. No hay innovaciones de atencion, decodificacion especulativa ni capas hibridas documentadas en la informacion disponible. Los pesos exportados suman 2.031.739.904 parametros, cifra que incluye la matriz de embeddings y que explica la diferencia respecto a la denominacion comercial "1.7B".

El entrenamiento es SFT con destilacion desde el profesor `gpt-5.4-mini`, organizado como una cadena secuencial de tres etapas: BabyAI → TextCraft → SearchQA. Cada entorno recibe cinco epochs y el estudiante, junto con el metodo, se arrastra de una etapa a la siguiente. La etapa final (searchqa) completo 935 actualizaciones del optimizador; es el tercer stage de la secuencia. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO posteriores. El repositorio no incluye estado del optimizador, logs en bruto ni trayectorias del profesor; solo referencias y checksums legibles por maquina en `experiment.json`. El autor indica que el inventario de seleccion registra nombres de fichero, tamanos y fechas de modificacion, pero no constituye un hash byte a byte de los tensores vinculado a las respuestas de evaluacion historicas, y que este checkpoint procede de una cadena secuencial distinta de la ejecucion standalone historica.

## Capacidades

- Generacion de texto autoregresiva en el formato conversacional y de agente definido por los tres entornos de entrenamiento (BabyAI, TextCraft, SearchQA).
- Ejecucion de tareas de agente basadas en observacion-accion con multiples turnos, con 512 tokens generados por turno en la configuracion de evaluacion.
- Respuesta a preguntas sobre evidencia recuperada (SearchQA), incluyendo tareas dentro de distribucion (ID) y fuera de distribucion (OOD).
- Planificacion y ejecucion de recetas en un mundo de texto (TextCraft), con encadenamiento de acciones para alcanzar un objetivo.
- Navegacion y cumplimiento de instrucciones en entornos tipo gridworld (BabyAI).
- Soporte de tool calling / function calling: no documentado de forma explicita en la informacion disponible.
- Modo "thinking": existe la opcion de activarlo o desactivarlo; la evaluacion publicada se realizo con thinking desactivado.
- Capacidades multilingues: no disponibles como dato declarado; el entrenamiento se realiza sobre los entornos citados.
- Vision y audio: no soportados segun la informacion disponible.

## Casos de uso

- Investigacion en cadenas secuenciales de SFT: el checkpoint permite reproducir o auditar la tercera etapa de una cadena BabyAI → TextCraft → SearchQA, comparando si el arrastre del estudiante entre etapas degrada o preserva las habilidades previas.
- Destilacion desde un profesor propietario: sirve como referencia de estudiante de ~2B parametros para analizar cuanto comportamiento de agente transferible se conserva al destilar desde `gpt-5.4-mini` con SFT.
- Agente de busqueda documental sobre corpus pequenos: con 46,375% de avg@4 en SearchQA, es utilizable en escenarios de bajo riesgo donde la respuesta se verifica contra la evidencia recuperada, por ejemplo clasificacion y extraccion asistida en soporte interno.
- Generacion de trayectorias sinteticas: sus rollouts en entornos de texto pueden emplearse como datos de entrenamiento para modelos mayores o para filtrar trayectorias exitosas en un pipeline de aprendizaje por imitacion.
- Evaluacion de robustez ID frente a OOD: el conjunto SearchQA incluye 200 tareas ID y 200 OOD, lo que permite medir la caida de rendimiento fuera de distribucion en un agente de ~2B parametros.
- Prototipado local y experimentacion con LoRA: con 2,03B parametros y pesos en safetensors, se puede ajustar en una GPU de consumo con cuantizacion o adaptadores de bajo rango.
- Banco de pruebas para integracion con TGI: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse como endpoint compatible con la API de mensajes para pruebas de agentes.
- Analisis de fallos en planificacion de texto: el 53,25% de avg@4 en TextCraft lo hace util para estudiar donde falla el razonamiento multi-paso de modelos pequenos en tareas de crafteo.

## Benchmarks y rendimiento

La model card solo publica resultados de tareas de agente, medidos como avg@4 (media de exito en cuatro intentos por tarea oficial). Configuracion de evaluacion: temperatura 0,4, top-p 1,0, top-k 20, thinking desactivado, 512 tokens generados por turno.

| Entorno | Exitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| babyai | 295 / 360 | 81,9444% | 0 |
| textcraft | 213 / 400 | 53,2500% | 0 |
| searchqa | 742 / 1600 | 46,3750% | 0 |

Notas del autor sobre estos datos: SearchQA cubre 200 tareas ID y 200 OOD con cuatro intentos independientes cada una; los chequeos de resultados verificaron cobertura exacta de tareas y muestras y consistencia de puntuaciones; cero errores de episodio no implica que todos los turnos generados esten bien formados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 4,1 GB solo de pesos, mas cache KV y activaciones; presupuesto practico de 6 a 8 GB para contexto moderado.
- VRAM estimada en fp32: aproximadamente 8,1 GB de pesos mas overhead; presupuesto practico de 10 a 12 GB.
- El repositorio ocupa 8,1 GB, lo que sugiere pesos de 32 bits o empaquetado equivalente; conviene verificar el dtype real de los shards antes de dimensionar el despliegue.
- GPU consumer: cabe sin problema en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en tarjetas de 8 GB es recomendable convertir a cuantizacion de 8 o 4 bits.
- GPU de centro de datos: A100, H100, L40S o similares para servir con lotes grandes y alta concurrencia.
- Opciones de despliegue: transformers (ruta oficial indicada en la model card), text-generation-inference (etiqueta `text-generation-inference`), vLLM. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha, por lo que deben verificarse antes de usarlos en una decision de produccion.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad | Orientacion |
|---|---|---|---|---|---|
| Este checkpoint (SFT sobre Qwen3-1.7B) | 2,03B | no especificado | no disponible | Hugging Face, pesos safetensors | Agente en BabyAI / TextCraft / SearchQA |
| Qwen/Qwen3-1.7B (base) | ~1,7B (2,03B en safetensors) | 32.768 tokens segun documentacion del base | Apache 2.0 segun documentacion del base (verificar) | Hugging Face | Modelo generalista con modo thinking |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens segun documentacion publica | Apache 2.0 segun documentacion publica | Hugging Face | Asistente generalista de ~1,7B |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens segun documentacion publica | Licencia comunitaria de Llama 3.2 | Hugging Face y ecosistema amplio | Asistente generalista ligero |
| Gemma-2-2B | ~2,6B | 8.192 tokens segun documentacion publica | Terminos de uso de Gemma | Hugging Face | Asistente generalista de ~2B |

Comparativa de rendimiento: no disponible. La model card no incluye benchmarks estandar que permitan situar este checkpoint frente a las alternativas en MMLU, HumanEval o GSM8K, y las metricas publicadas (avg@4 en BabyAI, TextCraft y SearchQA) no son comparables con las de modelos generalistas.

## Limitaciones y advertencias

- Licencia no declarada: el autor no afirma ninguna licencia y remite a los terminos del modelo base. Antes de cualquier uso comercial hay que revisar la licencia de Qwen/Qwen3-1.7B y las condiciones del profesor empleado en la destilacion (`gpt-5.4-mini`); no se aclara si los terminos del profesor permiten entrenar y redistribuir modelos derivados.
- El autor advierte explicitamente de que se trata de un unico checkpoint y no de evidencia de una ventaja general del metodo ni de replicacion entre semillas de entrenamiento.
- El inventario de seleccion registra nombres, tamanos y fechas de modificacion, pero no es un hash byte a byte de los tensores vinculado a las respuestas de evaluacion historicas; la trazabilidad de los resultados es por tanto parcial.
- Este checkpoint procede de una cadena secuencial distinta de la ejecucion standalone historica, por lo que no es directamente equivalente a los numeros de esa ejecucion.
- El repositorio no incluye estado del optimizador, logs en bruto ni trayectorias del profesor, lo que limita la reproduccion exacta del entrenamiento.
- Rendimiento modesto en las tareas mas abiertas: 46,375% de avg@4 en SearchQA y 53,25% en TextCraft, con 935 actualizaciones del optimizador en la etapa final. No se desglosa el resultado de SearchQA entre las 200 tareas ID y las 200 OOD.
- Cero errores de episodio no implica que todos los turnos generados esten bien formados, segun el propio autor; pueden existir salidas malformadas que el verificador acepte.
- Especializacion estrecha: el entrenamiento se limita a tres entornos de agente. No hay evidencia de calidad en conversacion general, redaccion, codigo o matematicas, y es probable una degradacion de capacidades generales respecto al modelo base.
- Idiomas soportados no declarados; no hay garantia de comportamiento correcto fuera del idioma de los entornos de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de QA sobre evidencia, un modelo de este tamano y con este nivel de exito tiende a generar respuestas plausibles no sustentadas en el contexto.
- Sesgos conocidos: no documentados; no se describe la composicion del dataset ni si se aplicaron filtros.
- Fechas de creacion y actualizacion registradas en 2026, posteriores a la fecha habitual de publicacion de Qwen3; conviene verificar la autenticidad y el contexto del repositorio.
- Sin ficheros GGUF ni cuantizaciones publicadas: el despliegue en llama.cpp u Ollama requiere conversion manual y validacion posterior de calidad.
- El repositorio tiene 0 descargas y 0 likes y no cuenta con validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s3-searchqa-20260920
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencias legibles por maquina y checksums del experimento: `experiment.json` en la raiz del repositorio
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente portadas y secciones del medio Daily Mail (dailymail.co.uk, dailymail.com, nytimes.com/topic/daily-mail, facebook.com/DailyMaildotcom), sin ninguna relacion con este checkpoint.
- Paper, blog o repositorio adicional del autor: no disponible.
