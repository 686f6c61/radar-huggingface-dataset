# SigongJoa/needle3-tool-call-ko-v1

## Resumen

Needle3-tool-call-ko-v1 es un ajuste fino (fine-tune) del modelo base Cactus-Compute/needle3, publicado por el usuario SigongJoa en Hugging Face. El modelo base es una foundation model de Cactus Compute diseñada especificamente para dispositivos de borde (moviles, wearables, robots, domotica, automocion y microcontroladores), con un peso total de entre 8 y 29 MB en un unico fichero. Este fine-tune concreto esta orientado a la invocacion de herramientas (tool calling / function calling) en coreano e ingles.

La relevancia de este modelo radica en su extrema ligereza: el autor del modelo base afirma que, renunciando a capacidad de chat general, supera a modelos 10 veces mas grandes en tool calls para movil y empata con modelos 2-3 veces mayores en tareas de extraccion. Este fine-tune anade un corpus especifico de tool calling en coreano, lo que lo hace interesante para despliegues de agentes en dispositivos con recursos muy limitados dentro del mercado coreano.

La informacion publicada es escasa: la model card no incluye detalles de arquitectura, numero de parametros, contexto ni resultados de evaluacion. Los datos de la ficha se limitan a lo declarado en los metadatos de Hugging Face y a la informacion publica del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el modelo base ocupa 8-29 MB en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Cactus-Compute/needle3 ni de este fine-tune. El modelo base se describe como una foundation model para dispositivos de borde cuyo binario completo ocupa entre 8 y 29 MB, lo que sugiere un diseno extremadamente compacto, probablemente con cuantizacion agresiva o una arquitectura reducida, pero no se confirma el tipo de transformer ni si emplea tecnicas como MoE, SSM o modelos hibridos.

El entrenamiento de este fine-tune se realizo sobre el modelo base Cactus-Compute/needle3 y utiliza los siguientes conjuntos de datos declarados en la model card: HuggingFaceFW/fineweb-edu, Moo/korean-parallel-corpora, eliceai/korean-webtext-edu, MadeAgents/xlam-irrelevance-7.5k, Team-ACE/ToolACE, argilla/Synth-APIGen-v0.1, ibm-research/ToolRM-train-data, jaeyong2/Ko-functioncall, palette-lab/songgot-tools-ko y waylake/ko-agentic-sft. La combinacion incluye corpus generales en ingles y coreano, datos de tool calling multilingue (ToolACE, Synth-APIGen, xLAM) y datasets especificos de function calling en coreano. No se especifica el numero de tokens de entrenamiento, la composicion exacta ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en coreano e ingles, segun los idiomas declarados.
- Tool calling / function calling: el ajuste esta especificamente orientado a la invocacion de herramientas, con datasets como ToolACE, Synth-APIGen y Ko-functioncall.
- Manejo de irrelevancia en tool calling: el dataset xlam-irrelevance-7.5k sugiere entrenamiento para decidir cuando no invocar ninguna herramienta.
- Razonamiento agéntico multi-paso: el dataset waylake/ko-agentic-sft apunta a flujos de agente con multiples pasos.
- Capacidades multilingues limitadas a coreano e ingles.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistentes de voz en dispositivos moviles: el modelo puede gestionar la invocacion de funciones del sistema (llamadas, alarmas, mensajes) en coreano con un peso de pocos megabytes, adecuado para integrarse en aplicaciones Android o iOS sin depender de la nube.
- Domotica y smart home: invocacion de herramientas para controlar dispositivos del hogar mediante comandos en coreano, con latencia baja al ejecutarse en el propio dispositivo.
- Agentes en automocion: integracion en sistemas de infoentretenimiento con recursos limitados para interpretar comandos del conductor y traducirlos en llamadas a APIs del vehiculo.
- Robots y wearables: ejecucion local de function calling para tareas de extraccion de parametros y seleccion de acciones, sin conexion a internet.
- Extraccion de datos estructurados: el modelo base iguala a modelos 2-3 veces mayores en tareas de extraccion, por lo que este fine-tune puede emplearse para convertir texto libre en coreano en JSON o llamadas a API.
- Atencion al cliente en coreano con backend de herramientas: el modelo decide que API invocar (consultar pedido, cambiar direccion, abrir incidencia) y con que argumentos, delegando la respuesta final a un sistema externo.
- Pipelines de agentes en microcontroladores: despliegue en dispositivos con memoria muy restringida donde no caben modelos de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cualitativa es la del autor del modelo base, que afirma superar a modelos 10 veces mas grandes en tool calls para movil y empatar con modelos 2-3 veces mayores en extraccion, pero no se aportan cifras concretas ni para el modelo base ni para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el modelo base ocupa entre 8 y 29 MB en disco, por lo que la huella en memoria es del orden de decenas de megabytes.
- GPU recomendadas: no disponible; por tamano, el modelo esta pensado para CPU y aceleradores de borde (NPU de movil, microcontroladores) mas que para GPU de datacenter.
- Cabe en GPU de consumo: con toda probabilidad si, dado el tamano del binario, aunque no se confirma el runtime soportado.
- Opciones de despliegue: no se especifican en la model card; el ecosistema del modelo base (Cactus Compute) esta orientado a despliegue en dispositivos, no a servidores de inferencia tradicionales como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigongJoa/needle3-tool-call-ko-v1 | no disponible (8-29 MB) | no disponible | Tool calling ko/en en borde | Apache 2.0 | Hugging Face |
| Cactus-Compute/needle3 | no disponible (8-29 MB) | no disponible | Foundation model para dispositivos | no disponible en la informacion | Hugging Face |
| Modelos de tool calling de proposito general (p. ej. familias de 1-7B) | 1.000-7.000 M | 4k-128k | Tool calling en servidor | varía | Hugging Face |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria; los datos de parametros y contexto del modelo base no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse con corpus web (fineweb-edu, korean-webtext-edu) es probable que herede sesgos presentes en esos datos.
- Riesgo de alucinacion en la seleccion de herramientas y en los argumentos generados; el dataset xlam-irrelevance-7.5k mitiga parcialmente la invocacion innecesaria, pero no se han publicado evaluaciones.
- Cobertura linguistica limitada a coreano e ingles; no se declara soporte para castellano ni otros idiomas.
- El modelo base renuncia explicitamente a capacidad de chat general segun su autor, por lo que no es adecuado como asistente conversacional generico.
- No se documentan limitaciones de contexto porque la longitud de contexto no esta publicada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda verificar las licencias de los datasets de entrenamiento, algunos de ellos con posibles restricciones de uso.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad para produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SigongJoa/needle3-tool-call-ko-v1
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Pagina del modelo base en Cactus: https://cactuscompute.com/needle
