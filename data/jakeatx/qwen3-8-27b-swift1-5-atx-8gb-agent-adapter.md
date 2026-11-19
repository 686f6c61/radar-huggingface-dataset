# jakeatx/qwen3.8-27b-Swift1.5-ATX-8GB-agent-adapter

## Resumen

Este repositorio no contiene pesos de modelo: es un paquete de configuracion listo para usar que conecta agentes de codificacion locales (pi, OpenCode y Hermes Agent) con el modelo `jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB` servido mediante llamAmpere, un fork de llama.cpp. El autor, jakeatx, publica los scripts de arranque del servidor, las entradas de proveedor y los ajustes de muestreo necesarios para que estos agentes funcionen con el modelo sin configuracion manual. La relevancia practica esta en que el modelo base usa tipos de tensor propios de llamAmpere, de modo que las entradas de un clic de llama.cpp y pi en Hugging Face, que arrancan llama.cpp estandar, no pueden cargarlo; este repositorio resuelve ese problema de integracion.

El modelo base se presenta como un Qwen3.8-27B afinado (27 000 millones de parametros, segun la nomenclatura del autor) con contexto declarado de 204 800 tokens y un preset `8dense` que, segun la model card, permite servir esa ventana completa en una tarjeta grafica de 8 GB. El adaptador anade mapeo de niveles de razonamiento (`off`, `minimal`/`low`, `medium`, `high`/`xhigh`), formato OpenAI de tool calling traducido por la plantilla de chat al formato nativo del modelo, y ajustes de muestreo recomendados (temperatura 1.0, top-p 0.95, top-k 20, min-p 0).

La informacion disponible procede casi por completo de la model card del autor y de los metadatos de Hugging Face; no hay resultados de benchmarks publicos ni documentacion independiente sobre el modelo base. Debe tratarse, por tanto, como una ficha de integracion para agentes de codificacion, no como una evaluacion de capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3; el repositorio solo contiene configuracion de agente) |
| Parametros totales | 27 000 millones (segun la nomenclatura del modelo base, "27b") |
| Parametros activos | no disponible |
| Longitud de contexto | 204 800 tokens (preset `8dense`); hasta 188 416 tokens de salida por respuesta (204 800 − 16 384) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base usa tipos de tensor propios de llamAmpere, no compatibles con llama.cpp estandar |
| Idiomas soportados | no disponible |
| Licencia | MIT para los archivos del repositorio; el modelo base usa Swift Open License 1.0 |
| Formato de pesos | ninguno en este repositorio (solo scripts, JSON y YAML); los pesos estan en el repo del modelo base |

## Arquitectura y entrenamiento

El repositorio es un adaptador de integracion, no un modelo entrenado: no hay pesos, ni datos de entrenamiento, ni proceso de RLHF/DPO documentado. Lo que define tecnicamente el paquete es la capa de servicio: llamAmpere v0.7.1 (release candidate para tarjetas de 8 GB; `PRESET=10dense` funciona tambien en v0.7.0.1) arranca `llama-server` con el preset `8dense`, la plantilla de chat del modelo y la salida de razonamiento separada de la respuesta final. El servidor escucha en `http://127.0.0.1:8080/v1` y expone el modelo como `atx-swift-27b-8gb`.

La innovacion destacable es el preset `8dense`: segun el autor, permite 204 800 tokens de contexto en una tarjeta de 8 GB mediante los tipos de tensor propios de llamAmpere, algo que llama.cpp estandar no puede cargar. El adaptador tambien normaliza la interfaz: las llamadas de herramienta en formato OpenAI se convierten en la plantilla de chat al formato nativo del modelo, y los niveles de pensamiento de pi se mapean a los niveles de esfuerzo de razonamiento del modelo. El autor advierte que las entradas de OpenCode y Hermes Agent no han sido probadas; solo la de pi lo ha sido.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable en cinco niveles efectivos (`off`, `low`, `medium`, `xhigh`; `minimal` se mapea a `low`).
- Tool calling en formato OpenAI estandar, traduzido por la plantilla de chat del servidor al formato nativo del modelo.
- Flujo de agente multi-paso: el modelo puede encadenar llamadas de herramienta, leer resultados y corregir errores, segun las tres tareas de prueba documentadas.
- Codificacion asistida: edicion multi-archivo, refactorizacion (renombrado de funciones en codigo, tests y README), anadido de type hints y escritura de tests.
- Contexto largo: ventana de 204 800 tokens con hasta 188 416 tokens de salida por respuesta, con reduccion automatica del limite de respuesta por parte de pi a medida que se llena el contexto.
- Integracion con agentes: entradas de proveedor listas para pi (version 1.5 o superior), OpenCode y Hermes Agent.
- Capacidades multilingues, vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Reparacion de bugs en proyectos Python: el modelo, servido con `--preset 8dense` y thinking `medium`, puede recorrer varios archivos, ejecutar tests y aplicar parches; en la prueba documentada resolvio 6 de 6 tests ocultos con 10 llamadas de herramienta y 0 llamadas malformadas.
- Refactorizacion global de simbolos: renombrar una funcion en codigo, tests y documentacion con thinking desactivado; la prueba registrada dejo 0 referencias al nombre antiguo, con 12 llamadas de herramienta y 0 malformadas.
- Escritura de modulos y tests desde cero: generacion de una cache LRU en Node.js con sus tests, usando thinking `xhigh`; la prueba oculta paso, con recuperacion correcta de 3 resultados de herramienta erroneos.
- Agentes de codificacion en local sobre hardware modesto: con una RTX 3070 de 8 GB se puede mantener una ventana de contexto de 100 000 tokens a unos 42 tokens/s, segun la model card, lo que permite sesiones largas sin depender de la nube.
- Pipelines de CI/CD asistidos: al exponer el servidor en `127.0.0.1:8080/v1` con interfaz compatible con OpenAI, se puede integrar en scripts de automatizacion que lancen tareas de codificacion acotadas con thinking `low` o `off` para reducir latencia.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local con llamAmpere, el codigo y los prompts no salen de la maquina, lo que encaja en auditorias o repositorios con restricciones de confidencialidad.
- Prototipado de agentes con pi, OpenCode o Hermes Agent: las entradas de proveedor permiten seleccionar `llamampere/atx-swift-27b-8gb` y ajustar el esfuerzo de razonamiento con `/thinking` o `--thinking` sin reescribir la configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye pruebas funcionales del adaptador con pi 1.5.2 sobre llamAmpere v0.7.1 (release candidate) en una RTX 3090 (24 GB, usada como sustituta de una de 8 GB; el servidor consumio 7 646 MiB):

| Tarea | Thinking | Llamadas de herramienta | Llamadas malformadas | Resultado | Velocidad de escritura (contexto alcanzado) |
|---|---|---|---|---|---|
| Corregir bug y anadir funcionalidad en 3 archivos Python, con tests | medium | 10 | 0 | tests ocultos 6/6 | 110 tokens/s (4 150) |
| Renombrar funcion en codigo, tests y README, anadir type hints | off | 12 | 0 | sin rastro del nombre antiguo; tests y app funcionan | 124 tokens/s (3 632) |
| Modulo de cache LRU y tests en Node.js | high (xhigh) | 11 | 0 | test oculto superado | 102 tokens/s (16 670) |

En la tercera tarea, 3 resultados de herramienta fueron errores (2 ejecuciones de tests fallidas y 1 edicion cuyo texto no coincidia); el agente se recupero de todos. Ninguna respuesta alcanzo el limite de salida ni entro en bucle. Las velocidades son medias sobre todas las respuestas de la tarea, con contexto corto en la RTX 3090; en una RTX 3070 de 8 GB el autor estima unos 42 tokens/s con 100 000 tokens ya en contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-27b-Swift1.5-ATX-8GB-agent-adapter (este) | 27 000 millones (modelo base) | 204 800 tokens | Pruebas funcionales de agente documentadas; sin benchmarks publicos | MIT (archivos); Swift Open License 1.0 (modelo) | Hugging Face; requiere llamAmpere v0.7.1 |
| qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB (modelo base) | 27 000 millones | 204 800 tokens (preset `8dense`) | No disponible | Swift Open License 1.0 | Hugging Face |
| llama.cpp estandar con modelos Qwen de 27B | ~27 000 millones | Depende de la cuantizacion y de la VRAM | No disponible en esta informacion | MIT (herramienta) | Amplia; no puede cargar los tipos de tensor de llamAmpere |
| Alternativas de agente de codificacion local de 27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de la misma categoria queda limitada por la ausencia de datos publicos sobre el modelo base; las filas marcadas "no disponible" reflejan esa falta de informacion, no una equivalencia funcional.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: descargarlo por si solo no permite ejecutar el modelo; hace falta tambien el repo del modelo base.
- El modelo base usa tipos de tensor propios de llamAmpere; las entradas de un clic de llama.cpp y pi en Hugging Face no pueden cargarlo.
- llamAmpere v0.7.1 esta en release candidate y, segun la model card, aun no publicado en el momento de escribirla; `PRESET=10dense` funciona en v0.7.0.1.
- Las entradas de OpenCode y Hermes Agent no han sido probadas por el autor; solo la de pi lo ha sido.
- OpenCode no elige un esfuerzo de razonamiento y usa el valor por defecto (`xhigh`), lo que ralentiza los turnos de agente; el autor recomienda arrancar el servidor con `--chat-template-kwargs '{"reasoning_effort":"medium"}'`.
- Versiones antiguas de pi (se cita la 0.73) limitaban cada respuesta a 32 000 tokens, lo que puede truncar razonamientos largos en el nivel `xhigh`; se requiere pi 1.5 o superior.
- El modelo base esta marcado como "Uncensored"; no hay informacion sobre sesgos, filtros de seguridad ni tasas de alucinacion, por lo que su uso en produccion requiere evaluacion propia.
- Idiomas soportados no disponibles; no se documenta cobertura multilingue.
- La licencia del modelo base es Swift Open License 1.0, distinta de la MIT de los archivos de este repositorio; debe revisarse antes de uso comercial.
- Las cifras de rendimiento provienen de tres tareas cortas en una RTX 3090; no constituyen una evaluacion representativa de cargas de produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-ATX-8GB-agent-adapter
- Modelo base: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-8GB
- llamAmpere (fork de llama.cpp): https://github.com/JakeATX/llamAmpere
- llama.cpp: https://github.com/ggml-org/llama.cpp
- pi: https://pi.dev
- OpenCode: https://opencode.ai
- Hermes Agent: https://hermes-agent.nousresearch.com/
