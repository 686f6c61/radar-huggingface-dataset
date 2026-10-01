# Jah7t3/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF

## Resumen

Gemma4-12B v2 Agentic Edition es un ajuste fino (fine-tune) del modelo base google/gemma-4-12B-it, orientado especificamente a tareas de programacion y uso de herramientas en entornos de terminal. Lo desarrolla Jah7t3, un autor individual que publica el resultado en formato GGUF para su ejecucion local con llama.cpp. El modelo cuenta con 11.907.350.576 parametros (unos 11,9 mil millones) y su proposito declarado es ofrecer un agente de codigo que funcione sin conexion, sin API y con un consumo de memoria muy reducido (aproximadamente 4,5 GB de VRAM o memoria unificada), de modo que pueda ejecutarse en equipos de consumo.

El problema que aborda es el de los agentes tecnicos que necesitan leer el estado del sistema, diagnosticar, aplicar una correccion y verificar el resultado, un bucle que el autor asimila al trabajo real de depuracion y de terminal. La relevancia de esta version radica en su salto de rendimiento frente al modelo base en la prueba tau2-bench (dominio telecom): el autor reporta alrededor de un 55 % en este ajuste frente a un 15 % del base, es decir, unas 3,5 veces mas. El nombre del repositorio resume esa receta de entrenamiento (agentic, fable5, composer2.5) y el factor de mejora declarado.

La publicacion es reciente (creada y actualizada el 30 de septiembre de 2026), sin descargas ni "likes" registrados en el momento de redactar esta ficha, y se distribuye bajo licencia Apache 2.0. El autor anuncia tanto una version v3 de esta misma linea de 12B como un hermano mayor basado en Qwen3.6-27B con la misma receta. La longitud de contexto y los idiomas soportados no se especifican en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ajuste fino del modelo base google/gemma-4-12B-it) |
| Parametros totales | 11.907.350.576 (~11,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q3_K_M (minimo recomendado por el autor), Q4_K_M (opcion recomendada), Q8_0 (usada en las evaluaciones); Q2_K no se publica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria gguf); el autor menciona haber liberado tambien un maestro en safetensors |

Otros datos: tamano del repositorio 38,1 GB, pipeline text-generation, compatible con endpoints, region US. Modelo base declarado: google/gemma-4-12B-it (etiquetado tambien como base_model:quantized).

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base mas alla de su identificacion como Gemma 4 de 12B, por lo que no puede confirmarse si se trata de un transformer denso, de un MoE o de un diseno hibrido. Lo que si describe el autor es el proceso de post-entrenamiento: partiendo del modelo base, reconstruyo los datos de razonamiento que faltaban en los conjuntos aportados por la comunidad. El motivo es que el modelo Fable 5 fue retirado y solo el conjunto propio del autor conservaba cadenas de pensamiento genuinas y autoria propia del modelo; el resto de trazas de razonamiento se regeneraron con Opus 4.8 en modo xhigh.

La receta de datos que da nombre al repositorio (fable5, composer2.5) se centra en codigo, uso de herramientas y tareas aganticas de terminal. El autor menciona haber construido una fase especifica de ventana de contexto dinamica para preservar intactos los pasos de "leer antes de actuar" del agente, un detalle relevante porque los flujos de diagnostico dependen de que las lecturas previas del estado del sistema no se trunquen. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor si senala que v2 le llevo mas de 40 horas de trabajo y consumio un plan completo de Claude Max 20x.

## Capacidades

- Generacion de texto y codigo, con enfasis declarado en tareas de programacion y depuracion.
- Uso de herramientas (tool calling / function calling) con el formato nativo de herramientas de Gemma 4; para su correcto funcionamiento con llama.cpp se recomienda la opcion --jinja.
- Comportamiento agentico multi-paso: el modelo esta entrenado para leer el estado, razonar, diagnosticar, aplicar una correccion y verificar el resultado.
- Trabajo en entornos de terminal y ejecucion de comandos dentro de flujos aganticos.
- Modo de razonamiento o "thinking" (etiqueta reasoning/thinking declarada por el autor).
- Capacidades conversacionales (etiqueta conversational).
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Ejecucion completamente local y sin conexion, sin dependencia de API externa.
- Capacidades multilingues: no disponible; los idiomas soportados no se especifican.
- Vision o audio: no disponible; no se mencionan en la informacion proporcionada.

## Casos de uso

- Agente de depuracion en terminal: el modelo esta entrenado para el bucle inspeccionar estado, diagnosticar, aplicar un parche y verificar, por lo que encaja en tareas de resolucion de incidencias tecnicas dentro de una sesion de shell.
- Asistente de codigo en local para equipos con hardware limitado: con unos 4,5 GB de memoria libre puede ejecutarse sin GPU dedicada de gama alta, lo que permite ofrecer autocompletado y generacion de codigo sin enviar el codigo fuente a terceros.
- Automatizacion de operaciones de soporte tecnico: el dominio telecom de tau2-bench reproduce un flujo de diagnostico y reparacion que se traslada a la atencion de incidencias tecnicas por pasos.
- Integracion en pipelines de desarrollo y CI: al soportar tool calling y el formato nativo de herramientas de Gemma 4, puede invocarse desde scripts para tareas de analisis, generacion de parches o comprobaciones automatizadas.
- Entornos con requisitos de privacidad o air-gapped: al ser un modelo local sin API, es apto para organizaciones que no pueden enviar datos a servicios en la nube.
- Base para experimentacion e investigacion en agentes: al publicarse como GGUF cuantizado y con un maestro en safetensors, sirve para estudiar tecnicas de post-entrenamiento agantico y de reconstruccion de trazas de razonamiento.
- Despliegue en portatiles y estaciones de trabajo modestas: la combinacion de cuantizacion Q4_K_M y bajo consumo de memoria permite uso interactivo en maquinas personales.

## Benchmarks y rendimiento

El autor evaluo el modelo en tau2-bench, un benchmark agantico de uso de herramientas, limitandose al dominio telecom (20 tareas, mismo entorno de evaluacion para ambos modelos, todo en cuantizacion Q8_0). Segun la model card:

| tau2-bench telecom (20 tareas, Q8_0) | Puntuacion |
|---|---|
| google/gemma-4-12B-it (base oficial) | ~15 % |
| Gemma4-12B v2 (este modelo) | ~55 % |

El autor indica que no ejecuto la suite completa por el tiempo que requiere, y justifica la eleccion de telecom por su similitud estructural con el trabajo real de terminal (comprobar estado, diagnosticar, corregir, confirmar). No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM minima: aproximadamente 4,5 GB de VRAM o memoria unificada libre para el modelo, segun el autor.
- Cuantizaciones y tamano: el autor indica Q3_K_M como la opcion fiable mas pequena, Q4_K_M como el punto optimo recomendado y Q8_0 como la usada en las evaluaciones. No publica Q2_K porque no supero sus pruebas de estres.
- GPU recomendadas: no disponible; el autor no enumera modelos concretos de GPU, solo el requisito de memoria.
- Compatibilidad con GPU de consumo: el enfoque del proyecto es precisamente que quepa en equipos de consumo y en sistemas con memoria unificada; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (con --jinja para el formato nativo de herramientas), y por extension cualquier runtime compatible con GGUF; las etiquetas incluyen llama.cpp y endpoints_compatible. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible; no se publican cifras.
- Ajustes de muestreo recomendados por el autor: penalizacion de repeticion 1.1 y temperatura 1.0, para evitar salidas repetitivas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tau2-bench telecom | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma4-12B v2 (este modelo) | ~11,9 MM | no disponible | ~55 % (Q8_0) | Apache 2.0 | GGUF |
| google/gemma-4-12B-it | no disponible (modelo base de 12B) | no disponible | ~15 % (Q8_0) | Apache 2.0 (segun etiqueta del repo) | safetensors / GGUF |
| Qwen3.6-27B (receta del mismo autor, en desarrollo) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor anuncia tambien una version v3 de esta misma linea de 12B y un ajuste hermano sobre Qwen3.6-27B con la misma receta, pero ninguno de los dos esta disponible ni evaluado en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion se limita a un unico dominio (telecom) de tau2-bench y a 20 tareas, con un unico entorno de evaluacion; no hay evidencia publicada sobre el rendimiento general fuera de ese dominio.
- El propio autor advierte que el ajuste puede penalizar el conocimiento general frente al modelo base, aunque no cuantifica esa perdida.
- Riesgo de alucinacion y de bucles de repeticion: el autor senala que una salida repetitiva (por ejemplo, secuencias de "0000...") casi siempre se debe a una configuracion incorrecta del cliente o del muestreador, no a los pesos, y recomienda penalizacion de repeticion 1.1 y temperatura 1.0.
- Problemas de integracion: si el front-end no analiza el formato nativo de herramientas de Gemma 4, pueden filtrarse tokens como <|tool_call> o <|channel>; se recomienda usar llama.cpp con --jinja.
- Las trazas de razonamiento de la mayoria de conjuntos de datos no son originales: se reconstruyeron con Opus 4.8 en modo xhigh a partir de los datos de la comunidad, lo que puede hacer que divergan de las trazas originales del modelo Fable 5, ya retirado.
- Idiomas soportados y sesgos conocidos: no disponible; no se documentan.
- Longitud de contexto: no disponible; no puede evaluarse el impacto de truncamientos en tareas de contexto largo mas alla de la mencion a la ventana de contexto dinamica usada en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base google/gemma-4-12B-it puede tener sus propias condiciones que conviene verificar antes de un despliegue en produccion.
- El repositorio no registra descargas ni valoraciones, y no hay resultados de benchmarks independientes que reproduzcan las cifras del autor.
- Ajuste realizado por un autor individual sin proceso de revision por pares ni evaluacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jah7t3/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- tau2-bench (benchmark agantico de uso de herramientas mencionado por el autor): no disponible como enlace en la informacion proporcionada
- Maestro en safetensors publicado por el autor: no disponible como enlace en la informacion proporcionada
- Discusion fijada con ajustes de cliente y muestreador: no disponible como enlace directo en la informacion proporcionada
