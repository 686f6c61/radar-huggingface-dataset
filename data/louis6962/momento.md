# louis6962/Momento

## Resumen

Momento es un conjunto de artefactos de decodificador de forma fija (fixed-shape) derivados de google/gemma-4-E2B-it-qat-q4_0-unquantized, publicados por el usuario louis6962 para la aplicacion Momento (repositorio github.com/louis6962/Momento, rama CoreAI-transition). No es un modelo entrenado desde cero ni un fine-tune al uso: son los ficheros de decodificador exactos que la aplicacion descarga y verifica por hash (SHA256SUMS) en el primer arranque, exportados del checkpoint del modelo base en el commit 6befbaca7398925921802abd1f277b495b78b738 y compilados para el framework Core AI de Apple.

El paquete define una cache KV de 4.096 slots gestionada por el host y dos funciones de inferencia: main (query-1, decodificacion token a token) y prefill (query-16, prellenado en bloques de 16 tokens). Se distribuyen dos variantes: un fichero .aimodel para Mac con Apple silicon que ejecuta la app de iPhone ("Designed for iPad"), especializado y cacheado por Core AI, y un .aimodelc compilado ahead-of-time para iPhone de clase 17 (identificador de hardware h18p).

Su relevancia es acotada y experimental: el propio autor lo etiqueta como "debug validation asset, not a qualified release model". El repositorio ocupa 4,2 GB y no acumula descargas ni likes en el momento de la consulta. La model card no publica benchmarks, idiomas soportados, composicion del dataset ni detalles de entrenamiento. Se trata, por tanto, de material de validacion para un pipeline de despliegue en un dispositivo concreto, no de un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Gemma 4, variante E2B, con grafo de forma fija y cache KV gestionada por el host; numero de capas y dimensiones no disponibles |
| Parametros totales | no disponible (la nomenclatura "E2B" de Gemma sugiere parametros efectivos del orden de 2.000 millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | 4.096 tokens, implementados como cache KV fija de 4.096 slots |
| Tipos de cuantizacion | el modelo base es una variante QAT q4_0 (gemma-4-E2B-it-qat-q4_0-unquantized); la precision interna de los artefactos .aimodel/.aimodelc exportados no se especifica |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, con enlace a los terminos de licencia de Gemma 4 de Google |
| Formato de pesos | .aimodel (Core AI para Apple silicon) y .aimodelc (compilado AOT para iPhone clase 17 / h18p); fichero SHA256SUMS con los hashes de todos los ficheros |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized |
| Tamano del repositorio | 4,2 GB (desglose por fichero no disponible) |
| Framework de ejecucion | Core AI (Apple) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los artefactos publicados no incorporan entrenamiento propio: son derivados modificados (re-exportados y compilados) de Gemma 4 E2B, la variante instruct y con quantisation-aware training en q4_0 del modelo base. La model card indica explicitamente que el tokenizer, las tablas de vision y las tablas PLE (per-layer embeddings, caracteristicas de la familia Gemma) proceden de otro repositorio, mlboydaisuke/gemma-4-E2B-CoreAI en el commit b2643e50, y no del checkpoint base. El numero de tokens de entrenamiento, la composicion del dataset y si hubo fases de RLHF o DPO no estan disponibles en la informacion proporcionada.

La innovacion tecnica relevante no esta en el modelo, sino en el formato de exportacion: un grafo de forma fija con dos firmas de ejecucion (main para decodificacion con una consulta y prefill para prellenado en bloques de 16 consultas), una cache KV de 4.096 slots gestionada por el host en lugar de crecer dinamicamente, y compilacion ahead-of-time para el identificador de hardware h18p. El autor advierte que el fichero .aimodelc compilado para iPhone "nunca debe cargarse en un Mac". La receta de exportacion y los limites del proceso se documentan en macos/ModelExport/FixedGemma/README.md dentro del repositorio de la aplicacion.

## Capacidades

- Generacion de texto autoregresiva mediante la funcion main, con una consulta por paso de decodificacion.
- Prellenado por lotes de 16 tokens mediante la funcion prefill (chunk16), lo que fija el patron de memoria y el tamano de lote durante la fase de contexto.
- Gestion de contexto limitada a 4.096 slots de cache KV, con administracion explicita por parte del host.
- Verificacion de integridad mediante SHA256SUMS: la aplicacion rechaza cualquier fichero cuyo hash no coincida con la lista publicada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la model card solo documenta las dos firmas de inferencia).
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Vision: el modelo base Gemma 4 E2B incluye tablas de vision segun la model card, y estas se importan desde mlboydaisuke/gemma-4-E2B-CoreAI, pero no se documenta que los artefactos .aimodel expongan entrada de imagen.
- Modo de razonamiento o "thinking": no disponible.
- Capacidades derivadas de las tablas PLE (per-layer embeddings): no documentadas para estos artefactos.

## Casos de uso

- Validacion de despliegue en dispositivo Apple: comprobar que el fichero .aimodelc de clase h18p carga, compila y responde correctamente en un iPhone de clase 17 antes de liberar una version de la aplicacion, dado que el propio autor lo define como activo de validacion de depuracion.
- Integracion continua con verificacion de hashes: incorporar SHA256SUMS a un pipeline que valide que los artefactos descargados coinciden byte a byte con los publicados, evitando servir pesos corruptos o modificados.
- Reproduccion del pipeline de exportacion fixed-shape: usar el README de macos/ModelExport/FixedGemma como referencia para exportar otros checkpoints de Gemma 4 E2B a Core AI con la misma cache KV de 4.096 slots y las firmas query-1/query-16.
- Medida de latencia de prefill por bloques de 16 tokens: al tener un grafo de forma fija, el modelo es adecuado para medir de forma reproducible el coste de prellenado y decodificacion sin la variabilidad que introduce el batching dinamico.
- Inferencia local sin red en Mac con Apple silicon: el fichero .aimodel se especializa y se cachea en el equipo, lo que permite probar generacion de texto completamente offline para el flujo "Designed for iPad".
- Desarrollo de la aplicacion Momento en la rama CoreAI-transition: servir como dependencia fija y versionada del proyecto durante el desarrollo del cliente, evitando que cambios en el modelo base rompan la aplicacion.
- Estudio comparativo de cuantizacion QAT q4_0 en hardware Apple: evaluar la calidad de salida de una variante cuantizada con entrenamiento consciente de cuantizacion frente al checkpoint sin cuantizar, en un escenario de contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado datos de este tipo en la busqueda web. No se dispone de cifras de latencia ni de throughput.

## Requisitos de hardware

- Plataforma objetivo: exclusivamente Apple. El fichero .aimodel esta pensado para Mac con Apple silicon ejecutando la app de iPhone; el fichero .aimodelc esta compilado ahead-of-time para iPhone de clase 17 (identificador h18p).
- El autor advierte explicitamente de que el artefacto .aimodelc "nunca" debe cargarse en un Mac.
- VRAM o memoria unificada estimada: no disponible. El repositorio completo ocupa 4,2 GB, pero no se publica el desglose de tamano por fichero ni el pico de memoria en ejecucion.
- Cache KV: 4.096 slots fijos, gestionados por el host, lo que acota el consumo de memoria asociado al contexto pero no se traduce en una cifra absoluta publicada.
- GPU compatibles: no aplica a CUDA. No hay soporte documentado para A100, H100, RTX 4090 ni otras GPU de NVIDIA o AMD.
- Opciones de despliegue: Core AI (Apple). No hay indicios de compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponibles.
- Requisitos de version de sistema operativo o de runtime de Core AI: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| louis6962/Momento | no disponible (base E2B) | 4.096 tokens (cache KV fija) | .aimodel / .aimodelc (Core AI) | Apache-2.0 | Despliegue en iPhone y Mac con Apple silicon; activo de validacion |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | no disponible (variante E2B) | no disponible | checkpoint sin cuantizar para frameworks habituales | Apache-2.0 (terminos Gemma 4) | Modelo base instruct con QAT en q4_0, de proposito general |
| mlboydaisuke/gemma-4-E2B-CoreAI | no disponible | no disponible | artefactos Core AI con tokenizer, vision y tablas PLE | no disponible en la informacion proporcionada | Adaptacion de Gemma 4 E2B a Core AI, origen de los componentes auxiliares de Momento |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y orientacion de despliegue.

## Limitaciones y advertencias

- El autor califica explicitamente el paquete como "debug validation asset, not a qualified release model": no es un modelo apto para produccion sin validacion adicional.
- No hay resultados de benchmarks, evaluaciones de calidad ni pruebas de regresion publicadas.
- No se declaran idiomas soportados, sesgos conocidos ni comportamiento frente a contenidos sensibles; no se han realizado evaluaciones de sesgo sobre estos artefactos.
- Riesgo de alucinacion: no evaluado en esta exportacion. Al derivar de un modelo instruct de aproximadamente 2.000 millones de parametros efectivos, es previsible una tasa de alucinacion superior a la de modelos mayores, pero no hay mediciones disponibles.
- El contexto esta limitado a 4.096 slots de cache KV; no se documenta el comportamiento al superarlo ni si la aplicacion trunca o desplaza la ventana.
- La precision efectiva de los artefactos exportados no se especifica, por lo que la degradacion respecto al checkpoint base es desconocida.
- Restricciones de licencia: la model card declara Apache-2.0 y enlaza a los terminos de licencia de Gemma 4 de Google. Al ser un derivado modificado de Gemma 4, conviene revisar los terminos aplicables de Google antes de un uso comercial.
- Dependencia de plataforma: los artefactos solo funcionan en Apple silicon (Core AI) y la variante compilada esta atada al identificador de hardware h18p; no hay portabilidad a otros aceleradores.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni reportes independientes de fallos.
- La busqueda web realizada no devolvio ningun resultado tecnico relacionado con el modelo: los resultados obtenidos eran contenidos no relacionados y sin valor informativo, por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/louis6962/Momento
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de componentes auxiliares (tokenizer, vision, tablas PLE): https://huggingface.co/mlboydaisuke/gemma-4-E2B-CoreAI
- Aplicacion Momento, rama CoreAI-transition: https://github.com/louis6962/Momento
- Receta de exportacion y limites (macos/ModelExport/FixedGemma/README.md): https://github.com/louis6962/Momento/tree/CoreAI-transition/macos/ModelExport/FixedGemma
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Nota sobre la busqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos no guardaban relacion con el contenido tecnico solicitado.
