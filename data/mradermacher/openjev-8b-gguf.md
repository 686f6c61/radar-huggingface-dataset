# mradermacher/OpenJev-8B-GGUF

## Resumen

OpenJev-8B-GGUF es la version cuantizada en formato GGUF del modelo OpenJev-8B, publicado por el usuario mradermacher a partir del modelo original de alanhuangya. Se trata de un conjunto de ficheros GGUF estaticos pensados para su uso con llama.cpp y herramientas compatibles, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de una GPU de centro de datos. El modelo base cuenta con 7.568.405.504 parametros (unos 7,57 mil millones) y se distribuye bajo licencia Apache 2.0.

Por las etiquetas asociadas (jev, decision-model, browser-agent, system-one, lora, open-source-jev) y los conjuntos de datos declarados (Mind2Web, nnetnav-live, typed-decisions, tasksource-jev, jev-distill-corpus-v3, typed-decisions-synth), el modelo se enmarca en la familia "Jev", descrita en fuentes externas como un modelo discriminativo de tipo System One que devuelve valores tipados con estimaciones de probabilidad y puntuaciones de confianza, orientado a agentes de navegador y a la toma de decisiones consumida directamente por software, mas que a la generacion de texto libre.

Es relevante ahora porque propone un enfoque distinto al de los LLM generativos: en lugar de producir lenguaje natural, entrega decisiones estructuradas y verificables, lo que encaja con pipelines de automatizacion y agentes. La ficha se centra en la version GGUF; los datos sobre arquitectura interna, contexto y benchmarks no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada) |
| Parametros totales | 7.568.405.504 (aproximadamente 7,57 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (alanhuangya/OpenJev-8B) en los datos proporcionados. Por el numero de parametros (7,57B) y por el ecosistema en el que se publica (transformers como libreria, etiqueta lora), cabe suponer una arquitectura de transformer, pero esta afirmacion no puede confirmarse con las fuentes disponibles y se marca como no verificada. La model card del repositorio GGUF no incluye ningun apartado tecnico sobre capas, atencion, contexto o esquema de entrenamiento; es una plantilla generica de cuantizacion.

Los conjuntos de datos declarados en los metadatos (osunlp/Mind2Web, stanfordnlp/nnetnav-live, LocalLLaMA/typed-decisions, tasksource/tasksource-jev, SargeDev/jev-distill-corpus-v3 y n4ze3m/typed-decisions-synth) apuntan a un entrenamiento orientado a navegacion web, decisiones tipadas y destilacion a partir de la familia Jev. La presencia de la etiqueta lora y de un campo base_model:adapter sugiere el uso de adaptadores de bajo rango, aunque no se detalla si forman parte del modelo base o de variantes. No hay informacion sobre volumen de tokens, composicion exacta del corpus, ni sobre fases de RLHF o DPO.

## Capacidades

- Clasificacion y decision tipada: segun las fuentes externas sobre Jev, el modelo devuelve valores tipados acompanados de estimaciones de probabilidad y puntuaciones de confianza, en lugar de texto libre (esta caracteristica corresponde a la familia Jev descrita en la Wikipedia; no se confirma explicitamente para esta cuantizacion concreta).
- Navegacion web y agentes de navegador: las etiquetas browser-agent y los datasets Mind2Web y nnetnav-live indican entrenamiento orientado a interaccion con paginas web y toma de decisiones sobre elementos de interfaz.
- Salida consumible por software: al devolver decisiones estructuradas, el resultado esta pensado para integrarse directamente en logica de aplicaciones.
- Multilingue: limitado al ingles (en), segun los metadatos de idioma.
- Soporte conversacional: la etiqueta conversational figura en los metadatos, aunque no se detalla el formato de dialogo soportado.
- Adaptadores LoRA: la etiqueta lora y el campo base_model:adapter indican compatibilidad con ajuste mediante adaptadores, sin mas detalles.
- Tool calling / function calling: no disponible.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Automatizacion de navegacion web (browser agents): dadas las etiquetas browser-agent y los datasets Mind2Web y nnetnav-live, el modelo encaja en agentes que deciden que elemento de una pagina pulsar, rellenar o extraer, devolviendo la accion seleccionada en lugar de texto descriptivo.
- Toma de decisiones en pipelines de datos: al devolver valores tipados con probabilidad y confianza, puede actuar como componente de decision dentro de un flujo ETL o de orquestacion, donde la salida se consume por codigo y no por una persona.
- Enrutamiento y clasificacion de tickets: uso del modelo como clasificador que etiqueta cada entrada con una categoria y un nivel de confianza, permitiendo descartar o escalar casos por debajo de un umbral.
- Extraccion estructurada de informacion: conversion de contenido no estructurado en campos tipados para alimentar bases de datos, con puntuaciones de confianza que permiten validacion automatica.
- Agentes multi-paso con verificacion: integracion como modulo de decision en agentes que necesitan elegir la siguiente accion y comprobar la certeza antes de continuar, gracias a la salida con confianza.
- Automatizacion de procesos (RPA) con criterio: en tareas repetitivas sobre interfaces, el modelo puede decidir la accion correcta en cada estado de pantalla, reduciendo la necesidad de reglas rigidas.
- Ejecucion local y privada: al distribuirse en GGUF con cuantizaciones desde Q2_K (3,2 GB) hasta f16 (15,2 GB), permite desplegar el modelo en equipos sin conexion o en entornos donde los datos no pueden salir de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin contar el contexto ni el overhead de llama.cpp):
  - Q2_K: 3,2 GB de fichero, aproximadamente 4-5 GB de VRAM en uso.
  - Q3_K_S: 3,6 GB; Q3_K_M: 4,0 GB; Q3_K_L: 4,3 GB.
  - IQ4_XS: 4,4 GB; Q4_K_S: 4,6 GB; Q4_K_M: 4,8 GB.
  - Q5_K_S: 5,4 GB; Q5_K_M: 5,5 GB.
  - Q6_K: 6,3 GB; Q8_0: 8,1 GB.
  - f16: 15,2 GB (descrito por el autor como "overkill").
- GPU recomendadas: para cuantizaciones Q4 y Q5 basta una GPU de 8-12 GB; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes para Q4_K_M y Q5_K_M. Para Q8_0 y f16 se recomienda una RTX 4090 de 24 GB, A100 o H100.
- Compatibilidad con GPU de consumo: si. El modelo cabe en tarjetas de gama media en cuantizaciones bajas y medias; Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended".
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llamafile y cualquier runtime compatible con GGUF. Para servir con vLLM o TGI seria preferible partir del modelo base en safetensors, ya que el soporte de GGUF en esos servidores es limitado.
- Latencia y throughput estimados: no disponible. El autor solo etiqueta Q4_K_S y Q4_K_M como rapidas y Q8_0 como rapida y de mejor calidad, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/OpenJev-8B-GGUF | 7,57B | no disponible | GGUF | apache-2.0 | Cuantizacion estatica del modelo base |
| alanhuangya/OpenJev-8B | 7,57B | no disponible | safetensors | apache-2.0 | Modelo original; fuente de la cuantizacion |
| AlexWortega/openjev | no disponible | no disponible | no disponible | no disponible | Repositorio relacionado localizado en la busqueda; sin datos publicos en la informacion disponible |

No se dispone de informacion suficiente sobre modelos alternativos de la misma categoria (decision models o browser agents de ~8B) para establecer una comparativa de rendimiento, contexto o resultados. Se indica "no disponible".

## Limitaciones y advertencias

- Discrepancia de naturaleza del modelo: las fuentes externas describen Jev como un modelo discriminativo que no genera lenguaje natural, mientras que el repositorio se publica en formato GGUF (orientado habitualmente a generacion de texto en llama.cpp) y con la etiqueta conversational. Conviene verificar el comportamiento real antes de integrarlo en produccion.
- Idioma: el modelo solo declara soporte de ingles (en); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de tareas de navegacion, por lo que no puede evaluarse su calidad de forma objetiva con la informacion disponible.
- Adopcion muy baja: 88 descargas y 1 "like" en el momento de la consulta, lo que indica una comunidad practicamente inexistente y poca validacion externa.
- Riesgo de alucinacion y calibracion de confianza: en modelos que emiten puntuaciones de probabilidad, las confianzas pueden estar mal calibradas; deben validarse con datos propios antes de usarlas como umbrales automaticos.
- Model card generica: el README del repositorio GGUF es una plantilla del cuantizador y no documenta arquitectura, contexto ni comportamiento del modelo; no debe tomarse como especificacion tecnica.
- Sesgos: no se documentan analisis de sesgo ni de seguridad en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios. No se han identificado restricciones adicionales, pero conviene revisar la licencia del modelo base (alanhuangya/OpenJev-8B) por si anade condiciones.
- Cuantizaciones de baja calidad: el propio autor advierte que Q3_K_M es de calidad inferior y que f16 es innecesaria; las cuantizaciones muy agresivas (Q2_K, Q3) pueden degradar notablemente la precision de las decisiones.
- Caveat de produccion: al no conocerse la longitud de contexto, no puede planificarse el manejo de conversaciones o paginas largas sin pruebas previas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenJev-8B-GGUF
- Modelo base: https://huggingface.co/alanhuangya/OpenJev-8B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#OpenJev-8B-GGUF
- OpenJEV, capa de inteligencia (sitio oficial): https://openjev.sh/
- Wikipedia, Jev (AI model): https://en.wikipedia.org/wiki/Jev_(AI_model)
- TechCrunch sobre Jev: https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/
- Repositorio relacionado: https://huggingface.co/AlexWortega/openjev
- Dataset osunlp/Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- Dataset stanfordnlp/nnetnav-live: https://huggingface.co/datasets/stanfordnlp/nnetnav-live
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset tasksource/tasksource-jev: https://huggingface.co/datasets/tasksource/tasksource-jev
- Dataset SargeDev/jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset n4ze3m/typed-decisions-synth: https://huggingface.co/datasets/n4ze3m/typed-decisions-synth
