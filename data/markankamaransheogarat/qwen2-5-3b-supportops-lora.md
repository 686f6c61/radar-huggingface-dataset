# markankamaransheogarat/qwen2.5-3b-supportops-lora

## Resumen

SupportOps-Qwen2.5-3B-LoRA es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-3B-Instruct por el usuario markankamaransheogarat. Su objetivo declarado es acotado y operativo: clasificar incidencias de soporte tecnico, generar JSON valido conforme a un esquema y redactar respuestas a clientes siguiendo un reglamento interno de empresa. No es un modelo de proposito general nuevo, sino un ajuste fino de bajo rango (r=16) sobre un transformer denso de 3,09 mil millones de parametros. El adaptador anade unicamente 14,8 millones de parametros entrenables, el 0,48 % del total del modelo base.

El entrenamiento se realizo con QLoRA en 4 bits NF4 durante 3 epocas y 450 pasos, con un tamano de lote efectivo de 8, sobre un corpus de 1.600 dialogos de soporte sintetizados con Distilabel y deduplicados mediante MinHash LSH. Los resultados que declara el autor son mejores en las dos tareas objetivo respecto a la linea base: la precision de esquema JSON pasa del 68 % al 98,5 % y el F1 de clasificacion de 0,74 a 0,93, medidos sobre un conjunto de test de solo 100 ejemplos.

Su relevancia practica es la de un caso de estudio reproducible de ajuste fino orientado a dominios concretos con recursos muy limitados: el adaptador ocupa decenas de megabytes y puede desplegarse sobre una GPU de consumo. Como contrapartida, la ficha no declara licencia, idiomas ni cuantizaciones de despliegue, el repositorio acumula 0 descargas y 0 "likes", las metricas son autodeclaradas sobre datos sinteticos y las fechas de creacion y actualizacion registradas (19 de septiembre de 2026) son anomalas, por lo que conviene tratarlo como material experimental y no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso; adaptador LoRA sobre Qwen/Qwen2.5-3B-Instruct |
| Parametros totales | 3,09 B en el modelo base; 14,8 M entrenables en el adaptador (0,48 %) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el modelo base Qwen2.5-3B-Instruct declara 32 768 tokens |
| Tipos de cuantizacion | QLoRA 4 bits NF4 durante el entrenamiento; no se declaran cuantizaciones de despliegue |
| Idiomas soportados | no disponible (la ficha del adaptador no los declara y esta redactada en ruso) |
| Licencia | no disponible en la ficha del adaptador; el modelo base se publica bajo Apache-2.0 |
| Formato de pesos | adaptador PEFT/LoRA (libreria `peft`), pesos en safetensors del adaptador |
| Configuracion LoRA | r=16, alpha=32, dropout=0,05, target_modules: all-linear |
| Optimizador y programador | paged_adamw_8bit, learning rate 2e-4, scheduler coseno |
| Entrenamiento | 3 epocas, 450 pasos, tamano de lote efectivo 8 |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Licencia | no disponible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen2.5-3B-Instruct, con atencion por consultas agrupadas (GQA) y soporte nativo de contexto largo segun la documentacion publica de Qwen. Sobre el se aplica un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05 en todos los modulos lineales, lo que supone 14,8 millones de parametros entrenables. El ajuste se hizo con QLoRA, es decir, con el modelo base cuantizado en 4 bits NF4 y el adaptador en precision superior, una combinacion habitual para entrenar con VRAM reducida.

La innovacion del trabajo esta en el pipeline de datos mas que en la arquitectura. Se sintetizaron 1.600 dialogos de atencion al cliente con Distilabel, se deduplicaron con MinHash LSH (herramienta `text-dedup`, umbral de Jaccard 0,85) y se dividieron en 1.200 ejemplos de entrenamiento, 200 de evaluacion y 100 de test. No se documenta en la ficha el uso de RLHF ni DPO, ni la composicion linguistica del corpus, ni el numero de tokens procesados. Las perdidas reportadas son 1,82 -> 0,41 en entrenamiento y 1,88 -> 0,49 en validacion.

## Capacidades

- Clasificacion de incidencias de soporte tecnico: el autor reporta un F1 de 0,93 en su conjunto de test sintetico, frente a 0,74 del modelo base sin ajustar.
- Generacion de JSON valido conforme a un esquema: precision declarada del 98,5 % frente al 68 % de la linea base.
- Redaccion de respuestas a clientes siguiendo un reglamento interno de empresa, que es la tercera tarea declarada en la ficha.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (generacion de texto, codigo, matematicas e instrucciones generales), no validadas especificamente por el adaptador.
- Soporte de tool calling y function calling: no confirmado en la ficha del adaptador; el modelo base lo soporta segun su documentacion, pero el ajuste no lo evalua.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona ni se evalua.
- Capacidades multilingues: no disponibles; la ficha del adaptador no declara idiomas y esta redactada en ruso, sin especificar el idioma de los datos sinteticos.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Triaje automatico de tickets de soporte: el adaptador esta ajustado especificamente para clasificar incidencias y reporta un F1 de 0,93, por lo que puede actuar como primer clasificador en una cola de atencion antes del enrutado a un agente humano o a un equipo especializado.
- Enrutado a sistemas ITSM mediante JSON estructurado: con una precision de esquema declarada del 98,5 %, puede producir payloads con categoria, prioridad y campos obligatorios que se inserten directamente en herramientas como Jira Service Management o Zendesk sin parseo defensivo complejo.
- Respuestas de primer nivel segun reglamento interno: el modelo fue entrenado para redactar contestaciones alineadas con una politica corporativa, de modo que sirve para borradores automaticos que un agente revisa y envia, no para respuestas autonomas sin supervision.
- Normalizacion y extraccion de datos de conversaciones: convertir transcripciones de chat o correo en registros estructurados para analitica posterior (motivo, producto afectado, severidad).
- Despliegue en infraestructura propia o en el borde: al tratarse de un adaptador de decenas de megabytes sobre un modelo de 3 B, puede ejecutarse en una GPU de consumo dentro de una red corporativa, lo que evita enviar conversaciones con datos personales a APIs externas.
- Prototipado rapido de un asistente de dominio vertical: sirve como plantilla para replicar el pipeline (Distilabel + deduplicacion MinHash + QLoRA) en otros dominios con presupuesto de computo muy reducido.
- Auditoria de calidad de respuestas de soporte: comparar las salidas del adaptador con las respuestas humanas historicas para detectar desviaciones del reglamento, siempre que exista un conjunto de validacion real y no solo sintetico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas cifras son las autodeclaradas por el autor en la model card, sobre su propio conjunto de test sintetico de 100 ejemplos:

| Metrica | Modelo base | Adaptador ajustado | Conjunto de evaluacion |
|---|---|---|---|
| Precision de esquema JSON | 68 % | 98,5 % | Test sintetico (100 dialogos) |
| F1 de clasificacion | 0,74 | 0,93 | Test sintetico (100 dialogos) |
| Perdida de entrenamiento | 1,82 -> 0,41 | no aplica | Train (1.200 dialogos) |
| Perdida de validacion | 1,88 -> 0,49 | no aplica | Eval (200 dialogos) |

Estas cifras no son comparables con benchmarks publicos de terceros: proceden de datos generados por el propio autor, sin evaluacion independiente ni intervalos de confianza, y con un tamano de test que hace que cada ejemplo pese un 1 % en la metrica.

## Requisitos de hardware

- Tamano del adaptador: aproximadamente 30 MB en fp16 (14,8 M de parametros), por lo que su almacenamiento y transferencia son triviales.
- Modelo fusionado: 3,09 B de parametros suponen unos 6,2 GB en fp16, en torno a 3,1 GB en int8 y aproximadamente 1,8-2,2 GB en 4 bits NF4, sin contabilizar el overhead del runtime.
- VRAM estimada para inferencia: alrededor de 4 GB en cuantizacion de 4 bits con contexto moderado y del orden de 8 GB en fp16. A contextos largos hay que sumar la cache KV, que crece de forma lineal con el numero de tokens (estimacion propia para este modelo: del orden de 1 GB adicional cerca de los 32 768 tokens, dependiendo del runtime y del tipo de dato de la cache).
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 para inferencia en fp16 con margen, y A100 o H100 si se necesita servicio por lotes con alta concurrencia.
- Compatibilidad con GPU de consumo: si, con cuantizacion de 4 u 8 bits cabe en practicamente cualquier GPU con 6-8 GB de VRAM o mas; en fp16 requiere al menos 8 GB.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sin fusionar), vLLM (soporta adaptadores LoRA), TGI, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. Tambien es posible fusionar y servir con SGLang.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

El adaptador no se puede comparar en igualdad de condiciones porque no tiene licencia, idiomas ni benchmarks publicos. La tabla siguiente compara los modelos base de la misma categoria (entre 2 y 4 mil millones de parametros), con datos tomados de la documentacion publica de cada uno; el adaptador hereda las caracteristicas del primero.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base de este adaptador) | 3,09 B | 32 768 tokens | Apache-2.0 | Pesos abiertos en HuggingFace |
| Llama-3.2-3B-Instruct | ~3,2 B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Pesos abiertos con condiciones |
| Phi-3.5-mini-instruct | 3,8 B | 128 000 tokens | MIT | Pesos abiertos en HuggingFace |
| Gemma-2-2B-it | ~2,6 B | 8 192 tokens | Terminos de uso de Gemma | Pesos abiertos con condiciones |

Frente a alternativas de la misma tarea (clasificacion y extraccion estructurada en soporte), la opcion mas directa es el propio Qwen2.5-3B-Instruct con un prompt y salida JSON forzada, sin ajuste: el autor reporta que esa linea base obtiene 68 % de precision de esquema y 0,74 de F1 en su conjunto, muy por debajo del adaptador, aunque se trata de una comparacion interna no replicada de forma independiente.

## Limitaciones y advertencias

- Los datos de entrenamiento son 1.600 dialogos sinteticos generados con Distilabel, sin validacion sobre conversaciones reales de produccion; el comportamiento en dominios distintos al corpus sintetico es desconocido.
- Las metricas (98,5 % de esquema JSON, F1 0,93) son autodeclaradas, no han pasado por evaluacion independiente y se calculan sobre 100 ejemplos, lo que implica alta varianza estadistica.
- Riesgo de alucinacion heredado del modelo base de 3 B: el adaptador no lo corrige, y en un dominio de soporte puede inventar procedimientos, plazos o politicas si el contexto no las contiene.
- La ficha no declara idiomas de entrenamiento ni de evaluacion; el ajuste podria estar limitado al idioma de los dialogos sinteticos (no especificado, con la model card redactada en ruso) y el rendimiento multilingue no esta garantizado.
- Licencia no disponible: aunque el modelo base es Apache-2.0, los pesos derivados del adaptador no declaran terminos, lo que supone un riesgo juridico para uso comercial. Hay que verificar la licencia con el autor antes de cualquier despliegue productivo.
- Contexto limitado por el modelo base; no se documenta si el ajuste preserva el rendimiento en ventanas largas.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin mantenimiento, versionado ni issues que permitan juzgar su robustez.
- Metadatos anomalos: las fechas de creacion y actualizacion (19 de septiembre de 2026) son posteriores a la fecha actual, lo que sugiere un error de registro o un repositorio de prueba y obliga a extremar la cautela sobre su procedencia.
- No se publican mediciones de latencia, throughput ni consumo de VRAM, datos imprescindibles para dimensionar un servicio en produccion.
- Para uso real se recomienda evaluar contra un conjunto de validacion propio con etiquetas humanas antes de sustituir cualquier componente existente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markankamaransheogarat/qwen2.5-3b-supportops-lora
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de TRL: https://github.com/huggingface/trl
- Distilabel (sintesis de datos): https://github.com/argilla-io/distilabel
- text-dedup (deduplicacion MinHash LSH): https://github.com/ChenghaoMou/text-dedup
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Los unicos enlaces devueltos correspondian a un foro de soporte de Microsoft sin ninguna relacion con el modelo, por lo que se descartan.
