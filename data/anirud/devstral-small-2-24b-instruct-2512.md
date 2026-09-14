# anirud/devstral-small-2-24b-instruct-2512

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un paquete de despliegue de Tenstorrent para servir el modelo `mistralai/Devstral-Small-2-24B-Instruct-2512` sobre aceleradores Blackhole mediante vLLM. Devstral Small 2 es el modelo de 24B de Mistral orientado a tareas de ingenieria de software agentica: explorar un repositorio, editar varios ficheros y orquestar herramientas. El paquete publica el decodificador de texto listo para ejecutarse en hardware Tenstorrent con tool calling habilitado.

El port es exclusivamente de texto: la torre de vision Pixtral del modelo original no se ha portado, por lo que las entradas de imagen no estan soportadas. El servicio arranca un servidor compatible con la API de OpenAI en el puerto 20000 (o el siguiente libre) y expone endpoints de chat completion con soporte de payloads `tools`, devolviendo `finish_reason: tool_calls` cuando corresponde.

Una restriccion relevante es que no existe perfil de un solo die: el minimo son dos dies. Aunque los pesos y la cache KV caben en un die de 32 GB, una matmul de prefill desborda la L1 porque tt_transformers selecciona las mismas cuadriculas de prefill para el MLP tanto en uno como en cuatro dies, de modo que un unico die asume todo el MLP en lugar de un cuarto. El paquete se genero con tt-model-manager 0.1.0 (esquema de manifiesto 5.1) y usa vLLM v0.26.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: Devstral Small 2 de Mistral); decodificador de texto |
| Parametros totales | 24B (segun el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens en perfil `p300`; 65536 tokens en `p150x4` y `p300x2` |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada (corresponde a la del modelo base) |
| Formato de pesos | no disponible; los pesos se descargan del repositorio base `mistralai/Devstral-Small-2-24B-Instruct-2512` en el commit `55c5b41e98c2dbd21b0c8afffc540dcfc9eb5128` |

## Arquitectura y entrenamiento

El paquete sirve el decodificador de texto de Devstral Small 2, un modelo denso de 24B de Mistral disenado para flujos de trabajo de ingenieria de software. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo base y no se reproducen aqui. Lo que si se documenta es la integracion de despliegue: vLLM v0.26.0 como motor de inferencia, el plugin vllm-tt-plugin sobre Tenstorrent y una capa compatible con la API de OpenAI.

La innovacion tecnica del paquete es la adaptacion de los kernels de prefill y decodificacion a la malla de dies de Blackhole. Los pesos y la cache KV caben en un die de 32 GB, pero el grid de prefill del MLP se selecciona igual para uno y para cuatro dies, lo que provoca desbordamiento de L1 en configuracion mono-die. Por eso los perfiles validos requieren dos o cuatro dies. El pipeline de build no publica el commit exacto de tt-metal ni de vllm-tt-plugin (se indica que el arbol estaba "sucio", con cambios sin commitear incluidos en la imagen), aunque si se publica el digest de `code/` (`71a2d227e4520616`, primeros 16 digitos de sha256).

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de programacion.
- Edicion multi-fichero y exploracion de repositorios dentro de un flujo agentico.
- Tool calling / function calling: acepta payloads `tools` con formato OpenAI y responde con `finish_reason: tool_calls`.
- Ejecucion de agentes de multiples pasos apoyada en las llamadas a herramientas.
- Servicio mediante endpoint compatible con OpenAI (chat completions) en el puerto 20000 por defecto.
- Capacidad multilingue: no confirmada en la informacion proporcionada.
- Vision: no soportada. La torre Pixtral no se ha portado; las entradas de imagen no estan disponibles.
- No se documentan modos especiales adicionales (thinking mode, audio) en la informacion proporcionada.

## Casos de uso

- Refactorizacion de codigo asistida: el modelo puede recibir una funcion y reescribirla (por ejemplo, para convertirla en generador) y devolver el resultado mediante el endpoint compatible con OpenAI, integrándose en un IDE o CLI.
- Agentes de ingenieria de software: dado que soporta tool calling y edicion multi-fichero, puede conectarse a herramientas de sistema de ficheros, terminal o Git para aplicar cambios en un repositorio de forma autonoma.
- Automatizacion de revisiones de codigo: enviando diffs y contexto del repositorio, el modelo puede generar comentarios y sugerencias sobre los cambios antes de fusionarlos.
- Generacion de tests unitarios: a partir del codigo fuente y su interfaz, el modelo puede producir casos de prueba, apoyandose en herramientas para escribir los ficheros resultantes en el arbol del proyecto.
- Migracion de codigo entre frameworks o versiones: con contexto de hasta 65536 tokens en los perfiles de cuatro dies, puede procesar modulos completos y proponer la traduccion a una API nueva.
- Asistente de documentacion tecnica: puede resumir y documentar modulos a partir de su codigo y estructura, generando docstrings o entradas de changelog.
- Despliegue on-premise sobre Tenstorrent: organizaciones que ya operan hardware Blackhole pueden servir el modelo localmente con tool calling sin depender de GPU NVIDIA, usando los perfiles `p300`, `p150x4` o `p300x2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput, y la model card se limita a describir los perfiles de servicio y la procedencia del build.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent Blackhole. Perfiles soportados: `p300` (2 dies), `p150x4` (4 dies, por defecto) y `p300x2` (4 dies, etiqueta QB2), segun la model card.
- No se admite un solo die: los pesos y la cache KV caben en un die de 32 GB, pero una matmul de prefill desborda la L1, por lo que el minimo es de dos dies.
- Memoria por die: 32 GB segun la descripcion del problema de L1.
- Limites por perfil: `p300` permite `max_num_seqs` 4 y `max_model_len` 32768; `p150x4` permite `max_num_seqs` 8 y `max_model_len` 65536; `p300x2` permite `max_num_seqs` 32 y `max_model_len` 65536.
- Despliegue: mediante `tt-model pull` y `tt-model serve` (tt-model-manager 0.1.0), con servidor compatible con OpenAI. La primera puesta en marcha compila kernels para el dispositivo, lo que tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- VRAM en GPU, latencia y throughput: no disponible en la informacion proporcionada. Este paquete esta pensado para Tenstorrent, no para GPU.

## Comparativa con modelos similares

| Opcion | Parametros | Contexto expuesto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (anirud/devstral-small-2-24b-instruct-2512) | 24B | 32768 / 65536 tokens segun perfil | Tenstorrent Blackhole (minimo 2 dies) | no disponible | Paquete publicado en HuggingFace |
| `mistralai/Devstral-Small-2-24B-Instruct-2512` (modelo base) | 24B | no disponible en esta informacion | GPU / otros backends | no disponible en esta informacion | Pesos en HuggingFace |
| Otros modelos de codigo de ~24-32B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este paquete con alternativas de la misma categoria.

## Limitaciones y advertencias

- El port es solo texto: la torre de vision Pixtral no se ha portado y no se admiten entradas de imagen.
- Requiere como minimo dos dies de Blackhole; no existe perfil mono-die, lo que limita su uso en equipos mas pequenos.
- El commit de tt-metal y de vllm-tt-plugin no esta publicado y la imagen incluye cambios sin commitear (arbol "sucio"), lo que reduce la reproducibilidad exacta del build.
- Licencia no especificada en el repositorio; antes de un uso comercial es necesario comprobar la licencia del modelo base en su repositorio original.
- No se documentan idiomas soportados ni datos de sesgo o alucinacion en la informacion proporcionada.
- La primera ejecucion compila kernels y tarda varios minutos, lo que afecta a arranques en frio.
- Al ser una publicacion con 0 descargas y 0 likes en el momento de la consulta, no existe validacion de la comunidad sobre su estabilidad en produccion.
- El tamano del repositorio (1,7 GB) no incluye los pesos; estos se descargan aparte en la cache de HuggingFace.

## Enlaces

- Repositorio del paquete: https://huggingface.co/anirud/devstral-small-2-24b-instruct-2512
- Modelo base: https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- vLLM v0.26.0: https://github.com/vllm-project/vllm/releases/tag/v0.26.0
