# cosmicoptima/computer-run1-step340

## Resumen

computer-run1-step340 es un checkpoint intermedio de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo cosmicoptima/computer-7, publicado por el usuario cosmicoptima en HuggingFace. El entrenamiento emplea preferencia propia (self-preference): un Computer-7 congelado actua como juez y elige, token a token, cual de 8 respuestas hermanas prefiere bajo cuatro lineas de encuadre distintas, y esas ventajas intra-fork se usan para entrenar la politica con REINFORCE. El checkpoint corresponde al paso 340 de la primera ejecucion (run 1) y es un punto intermedio del mismo run que los checkpoints computer-9c/9d/9e (pasos 100, 120 y 160).

El modelo tiene 70.553.706.496 parametros (~70,55 mil millones) y un repositorio de 141,1 GB en safetensors bf16, exportado desde un checkpoint FSDP2 con maestro en fp32. Por numero de parametros, la etiqueta `llama` y la licencia `llama3.1`, es consistente con una arquitectura transformer decoder-only de la familia Llama 3.1 de ~70B, aunque la model card no declara explicitamente la arquitectura ni la ventana de contexto. Mantiene el mismo tokenizador y formato de chat que Computer-7: turnos en texto plano bajo un encabezado de documento, con marcas `**User:** … **Model C:** …` y sin plantilla de chat.

Su relevancia es fundamentalmente experimental: documenta con detalle metodologico un pipeline de RL por autopreferencia con neutralizacion de longitud, control de KL adaptativo y multiples encuadres ponderados, y publica metricas de deriva de estilo entre pasos. No es un modelo orientado a produccion ni presenta resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (inferido de la etiqueta `llama` y la licencia; no declarado explicitamente en la model card) |
| Parametros totales | 70.553.706.496 (~70,55 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en safetensors; no se publican pesos GGUF, AWQ, GPTQ ni fp8 |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (licencia comunitaria de Llama 3.1) |
| Formato de pesos | safetensors (bf16, exportado de checkpoint FSDP2 con maestro fp32) |

Datos adicionales: identificador `cosmicoptima/computer-run1-step340`; modelo base `cosmicoptima/computer-7` (finetune); tamano del repositorio 141,1 GB; 0 descargas y 0 likes en el momento de la consulta; pipeline no disponible; fechas de creacion y actualizacion 2026-09-10.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, solo el procedimiento de RL. Se sabe que el modelo deriva de cosmicoptima/computer-7 mediante un finetune de preferencia propia ejecutado en un unico run. El dispositivo de entrenamiento es el siguiente: un Computer-7 congelado lee, un token, cual de 8 turnos hermanos prefiere; esa lectura se repite bajo cuatro lineas de encuadre con 8 rotaciones de presentacion cada una (32 lecturas por fork, promediando cuotas); las ventajas intra-fork entrenan la politica con REINFORCE, perdida a nivel de token y una KL respecto a la inicializacion con coeficiente adaptativo cuyo objetivo es 0,03. El asiento de usuario lo ocupa un simulador llamado `sundry-1`; las conversaciones abren con un encabezado de documento aleatorio y duran 4 turnos. Cada actualizacion usa 32 forks x 4 turnos con learning rate 2e-6.

El entrenamiento tiene dos fases. Entre los pasos 0 y 160 se usa una constitucion de cuatro lineas: (1) la respuesta mas propia y conceptualmente perspicaz, aun pareciendo correcta, etica y epistemicamente calibrada; (2) la respuesta sabia, etica y epistemicamente calibrada; (3) la que mas desarrolla la forma global de la conversacion; (4) la que mas desarrolla el propio pensamiento. A partir del paso 160 se anaden dos encuadres ponderados x1.5 ("the wittiest response" y "whose advice would actually work", este ultimo enmascarado sobre la palabra 'advice'), y el controlador de KL se limita a 0,15 con una rampa de 1,2. La longitud se neutraliza en todo el proceso eliminando la pendiente de longitud agrupada intra-fork de las ventajas, y las respuestas que re-narran el encabezado del documento se consideran invalidas. En este checkpoint la KL por token respecto a la inicializacion esta en la banda 0,02-0,05.

## Capacidades

- Generacion de texto conversacional multi-turno: el modelo produce turnos en el formato `**User:** … **Model C:** …` bajo un encabezado de documento, sin plantilla de chat.
- Conversacion fundamentada en un documento de contexto: el entrenamiento abre cada dialogo con un encabezado de documento aleatorio, por lo que el modelo esta expuesto a ese patron de uso.
- Estilo con calibracion epistemica inducida: la constitucion incluye el criterio de "epistemicamente calibrado", y las metricas del autor muestran un aumento del 16% en hedges (matizadores) y un desplazamiento del ratio realis/irrealis de 0,15 a 0,37.
- Reduccion de interrogacion: las preguntas por cada 100 palabras caen un 71% respecto al modelo base.
- Mayor uso de primera persona plural: el uso de "we" aumenta un 75%.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision, audio o modo de pensamiento explicito: no disponible; no se documenta ninguna capacidad multimodal ni modo de razonamiento separado.
- Generacion de codigo y matematicas: no evaluada en la informacion disponible.

## Casos de uso

- Investigacion en RL por autopreferencia: el checkpoint sirve para reproducir o auditar un pipeline REINFORCE con juez congelado, 32 lecturas por fork y neutralizacion de longitud; la model card detalla hiperparametros suficientes (lr 2e-6, KL objetivo 0,03, 32 forks x 4 turnos por actualizacion) para replicar el montaje.
- Estudio de deriva de estilo durante el entrenamiento: al ser un punto intermedio del mismo run que computer-9c/9d/9e, permite trazar la evolucion de metricas como el ratio realis/irrealis (0,15 a 0,37), los hedges (+16%) o la densidad de comillas de escepticismo (de ~30 a 19 por 100 palabras).
- Analisis de control de KL en RL conversacional: con una KL por token de 0,02-0,05 respecto a la inicializacion, es un caso de estudio util para medir cuanto se desvia una politica de su modelo base bajo un controlador adaptativo con tope 0,15 y rampa 1,2.
- Punto de partida para finetuning posterior: un investigador puede continuar el entrenamiento o aplicar SFT/DPO sobre este checkpoint intermedio en lugar de sobre Computer-7, comparando estabilidad y coste.
- Evaluacion de jueces automaticos por self-preference: la model card reporta que las lineas 1, 3 y 4 correlacionan entre si con r 0,8-0,9 y dominan el agregado, mientras que la linea 2 coincide con el ganador agregado aproximadamente la mitad de las veces; el checkpoint permite estudiar el sesgo de encuadre en jueces LLM.
- Generacion de dialogos sinteticos con encabezado de documento: util para crear corpus conversacionales etiquetados con el formato exacto `**User:**` / `**Model C:**`, siempre que se valide la calidad de salida manualmente.
- Experimentos de calibracion y hedging en texto asistencial o informativo: el sesgo hacia matizadores y hacia un registro menos interrogativo puede aprovecharse para generar borradores que eviten afirmaciones categoricas, sujeto a revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card solo reporta metricas internas de comportamiento, medidas por el autor sobre turnos muestreados. Se reproducen a continuacion tal cual, sin interpretarlas como benchmarks comparables:

| Metrica | Computer-7 (pasos 0-15 vs 80-94) | Run 1, paso 160 | Run 1, paso 340 |
|---|---|---|---|
| Ratio realis/irrealis | 0,15 → 0,37 | no reportado | no reportado |
| Preguntas por 100 palabras | −71% | no reportado | no reportado |
| Parentesis por 100 palabras | −17% | no reportado | no reportado |
| Hedges | +16% | no reportado | no reportado |
| Uso de "we" | +75% | no reportado | no reportado |
| Longitud mediana de turno | 158 tokens → ~150-195 | oscila con el controlador KL | ~180 tokens |
| Sorpresa por token (nats) | 1,16 → 1,06 | ~1,28 en el paso 200 | ~1,2 estable |
| Comillas de escepticismo por 100 palabras | no reportado | no reportado | ~19 (desde ~30) |
| KL por token respecto a la inicializacion | no aplica | no reportado | banda 0,02-0,05 |

## Requisitos de hardware

- VRAM estimada en bf16: los pesos suman 141,1 GB (70,553.706.496 parametros x 2 bytes), por lo que la inferencia necesita mas de 141 GB contando pesos, cache KV y activaciones; en la practica, del orden de 150-170 GB.
- GPUs recomendadas: 2 x H100 80GB (160 GB, margen muy ajustado para contextos largos), 4 x A100 80GB o 8 x A100 40GB. Configuraciones con menos VRAM por GPU exigen tensor parallelism alto o particionado.
- Cuantizacion a 8 bits (si el usuario la genera): pesos en torno a 71 GB, lo que permite un unico H100 80GB o 2 x A100 40GB.
- Cuantizacion a 4 bits (si el usuario la genera): pesos en torno a 35-38 GB, viable en 2 x RTX 4090 (48 GB en total) o en una A6000 de 48 GB.
- GPU consumer: no cabe en una unica GPU de 24 GB en bf16 ni, previsiblemente, en 4 bits sin offload a CPU, que degradaria fuertemente la latencia. Con 2 x RTX 4090 y cuantizacion de 4 bits es planteable.
- Opciones de despliegue: vLLM, TGI, SGLang o cualquier servidor compatible con safetensors de Llama. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan una conversion propia.
- Consideracion de integracion: el modelo no incluye chat template y usa turnos en texto plano (`**User:** … **Model C:** …`) bajo un encabezado de documento, de modo que la plantilla debe construirse manualmente en la capa de aplicacion.
- Latencia y throughput: no disponible. Dependen del numero de GPUs, del tensor parallelism y de la longitud de contexto, que tampoco esta documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| computer-run1-step340 | 70.553.706.496 | No disponible | llama3.1 | Checkpoint intermedio (paso 340) de un run de RL por autopreferencia; sin benchmarks publicados |
| cosmicoptima/computer-7 | No disponible | No disponible | No disponible | Modelo base del finetune; es tambien el juez congelado del pipeline |
| computer-9c / 9d / 9e | No disponible | No disponible | No disponible | Checkpoints del mismo run en los pasos 100, 120 y 160; publicados bajo su numero de paso |
| Llama 3.1 70B (referencia de la familia) | 70.600 millones (dato publico) | 128.000 tokens (dato publico) | llama3.1 | Modelo de referencia de la familia; se incluye solo como contexto arquitectonico, no como comparacion de rendimiento |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion estandar: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publica; no se puede afirmar nada sobre su calidad general frente a otros modelos.
- Procedencia experimental: el autor no es el emisor original de la familia Llama y el modelo es un checkpoint intermedio de RL, no una version final. Los 0 likes y 0 descargas en el momento de la consulta reflejan una adopcion nula.
- Sesgos inducidos por el objetivo: la constitucion premia explicitamente "la respuesta mas propia y conceptualmente perspicaz" y "la respuesta mas ingeniosa", criterios subjetivos que pueden producir un estilo idiosincratico, poco neutro y potencialmente autoindulgente. La model card reconoce que las lineas 1, 3 y 4 dominan el agregado, con lo que el comportamiento final esta sesgado hacia esos encuadres.
- Riesgo de alucinacion: no evaluado ni documentado. Un modelo de ~70B sin verificacion factual explicita mantiene un riesgo de alucinacion no cuantificado, especialmente con el formato de encabezado de documento, donde puede re-narrar contenido del contexto (comportamiento que el entrenamiento marca como invalido, pero que no se elimina por completo).
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no hay garantia de calidad fuera del ingles.
- Contexto: la ventana de contexto no esta documentada; no se debe asumir la de Llama 3.1 70B sin verificacion.
- Formato: la ausencia de chat template obliga a construir el prompt a mano; un formateo incorrecto degradara las respuestas de forma dificil de diagnosticar.
- Licencia: se hereda la licencia comunitaria de Llama 3.1, que impone condiciones de uso aceptable, obligaciones de atribucion y una clausula especifica al superar los 700 millones de usuarios mensuales. No es una licencia permisiva tipo Apache 2.0.
- Uso en produccion: no recomendado sin una evaluacion propia previa, dado que no hay benchmarks, ni tarjeta de limitaciones, ni historial de uso, y las metricas publicadas son de estilo, no de capacidad.
- Metadatos: las fechas del repositorio (2026-09-10) y la ausencia de pipeline declarado dificultan la trazabilidad; conviene verificar el contenido de los pesos antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cosmicoptima/computer-run1-step340
- Modelo base: https://huggingface.co/cosmicoptima/computer-7
- Perfil del autor: https://huggingface.co/cosmicoptima
- Paper, blog, repositorio o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
