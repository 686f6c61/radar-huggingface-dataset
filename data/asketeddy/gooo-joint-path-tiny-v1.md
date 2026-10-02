# asketeddy/gooo-joint-path-tiny-v1

## Resumen

Own Gooo joint path tiny v1 es un modelo neuronal experimental de 12.412 parametros publicado por asketeddy (jooyoon kim) como parte del sistema de metaprogramacion Gooo. No es un generador de texto ni un transformer: es un modulo de decision que puntua y ordena cuatro rutas de compilacion propiedad del compilador ("legal compiler-owned paths") a partir de codigo fuente original y un plan tipado. Cada invocacion resuelve exactamente dos decisiones binarias.

El modelo se entreno desde cero con inicializacion aleatoria, sin pesos de LLaMA ni de modelos propios anteriores, dentro de un experimento emparejado de 480 actualizaciones que compara seis variantes (FP32, PTQ y QAT, tanto en configuracion independiente como conjunta). La variante independiente declarada usa 12.728 parametros (256/48/8) y la variante conjunta con cabecera de cuatro mascaras usa 12.412 (512/24/4). La calibracion selecciono la variante FP32 independiente; la FP32 conjunta quedo como referencia comparativa.

Su relevancia es acotada pero concreta: demuestra que una red de decenas de miles de parametros, cuantizada a ternario y ejecutada en CPU, puede integrarse en un compilador real con latencia de 10,7 microsegundos en caliente y cero asignaciones de heap por llamada. La publicacion incluye procedencia PROV-O, evidencia cruda y todas las exportaciones de los seis modelos, lo que lo convierte en un artefacto de investigacion reproducible mas que en un modelo listo para producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal propia con cabecera conjunta de cuatro mascaras (joint four-mask head); resuelve dos decisiones binarias. No es un transformer ni un MoE |
| Parametros totales | 12.412 en la variante conjunta (512/24/4); 12.728 en la variante independiente (256/48/8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la documentacion indica que acepta exactamente dos decisiones binarias y que nunca trunca la entrada |
| Tipos de cuantizacion | FP32, PTQ, QAT y ternario (trits, 5 trits por byte, 1,6 bits de almacenamiento por peso); la aritmetica residente es int8 decodificado |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | JSON (por ejemplo `joint/models/fp32/model.json`); exportaciones ternarias de 2.590 bytes y tensores int8 decodificados de 12.496 bytes mas 8 bytes de escala y un workspace de 2.160 bytes |
| Fecha de publicacion (segun HuggingFace) | 2026-10-01 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es una red propia de inicializacion aleatoria con dos variantes comparadas bajo un presupuesto identico de 480 actualizaciones: una version con decisiones independientes (256/48/8, 12.728 parametros) y una version con cabecera conjunta de cuatro mascaras (512/24/4, 12.412 parametros). Ambas comparten el recuento de pesos de la primera matriz, pero no la anchura oculta ni la cabeza. La cabeza conjunta representa elecciones correlacionadas con una sola llamada inicial, de modo que el modelo no evalua cada decision de forma aislada. El experimento esta declarado explicitamente como comparacion emparejada, no como comparacion aislada de funcion de perdida.

No hay datos publicados sobre volumen de tokens, composicion del dataset ni uso de RLHF o DPO; el entrenamiento es desde cero y sin pesos preentrenados. Si se documentan elementos de metodologia: `protocol.md` se congelo antes de los fixtures, los objetivos y el entrenamiento, y una correccion posterior sobre la formula de escala se preservo por separado en `prefixture-amendment.md`. Sobre 384 vistas de funciones de desarrollo, la variante conjunta FP32 produjo 777 predicciones frente a 1.447 de la independiente FP32, pero necesito 455 intentos de ensamblado adicionales frente a 448 (520 en la politica offline). Las siete politicas completaron sus contratos finitos de 16 casos en cuatro candidatos como maximo.

## Capacidades

- Puntuacion y ordenacion de cuatro rutas de compilacion legales a partir de codigo fuente original y un plan tipado.
- Resolucion de exactamente dos decisiones binarias por invocacion; no acepta un numero arbitrario de decisiones.
- Preservacion completa del contexto de codigo fuente y de las partes de intencion en coreano e ingles, sin truncado de entrada para forzar la aceptacion del modelo.
- Reranking de rutas restantes cuando una prueba falla; si solo queda una ruta viable, no se realiza llamada al modelo.
- Continuacion determinista cuando el modelo no esta disponible o la representacion no esta soportada, con omision de `--path-model`.
- Generacion de codigo Go: la ejecucion principal adoptada produjo 192 salidas Go compiladas y ejecutadas de forma independiente, con 3.072 invocaciones de funcion ordenadas.
- No soporta generacion de texto libre, tool calling, function calling, razonamiento multi-paso general, vision ni audio. No dispone de modo "thinking".

## Casos de uso

- Seleccion de ruta en un compilador: el modelo recibe la fuente Gooo y el plan tipado, y ordena las cuatro rutas legales propiedad del compilador antes de emitir codigo, sustituyendo heuristicas deterministas por una decision aprendida.
- Reranking tras fallo de pruebas: cuando una prueba falla, el modelo vuelve a ordenar las rutas restantes, reduciendo el espacio de busqueda sin recompilar desde cero.
- Inferencia embebida de latencia minima: con 10,7 microsegundos en caliente y cero asignaciones de heap por llamada, encaja en el propio proceso del compilador o del CLI sin introducir un salto de red.
- Despliegue en entornos con memoria restringida: los ficheros ternarios ocupan 2.590 bytes y los tensores int8 decodificados 12.496 bytes, por lo que el modelo cabe en dispositivos embebidos o en procesos con presupuesto de memoria casi nulo.
- Instrumentacion y procedencia en pipelines de CI: cada ejecucion puede registrar llamadas nativas, predicciones y resultados de compilacion, lo que permite auditar decisiones en integracion continua.
- Investigacion reproducible sobre cuantizacion: las seis exportaciones (FP32, PTQ, QAT; independiente y conjunta), el curriculum crudo y las capturas nativas estan publicados, lo que permite replicar el experimento emparejado de 480 actualizaciones.
- Banco de pruebas de SDK: la ejecucion principal adopta 48 vistas de funciones bilingues, util para validar el SDK v0.2.12 y el compilador frente a regresiones de planificacion de rutas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas corresponden al experimento interno de planificacion de rutas y se recogen a continuacion tal cual aparecen en la model card.

| Metrica | Independiente FP32 | Conjunta FP32 | Offline |
|---|---|---|---|
| Parametros | 12.728 (256/48/8) | 12.412 (512/24/4) | no disponible |
| Predicciones sobre 384 vistas de desarrollo | 1.447 | 777 | no disponible |
| Intentos de ensamblado adicionales | 448 | 455 | 520 |
| Casos del contrato finito completados | 16 en 4 candidatos | 16 en 4 candidatos | 16 en 4 candidatos |
| Latencia en caliente | no disponible | ~10,7 microsegundos | no disponible |
| Asignaciones de heap por llamada | no disponible | 0 | no disponible |

Metricas de la ejecucion principal adoptada (Gooo main): 192 llamadas nativas, 470 predicciones, 192 salidas Go compiladas y ejecutadas de forma independiente, 3.072 invocaciones de funcion ordenadas.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Los ficheros ternarios ocupan 2.590 bytes; los tensores int8 decodificados 12.496 bytes mas 8 bytes de escala y un workspace de 2.160 bytes. El modelo completo cabe en cualquier cache de CPU.
- GPU recomendadas: no se requiere GPU. La model card no documenta ninguna GPU objetivo; la ejecucion medida es en CPU.
- Cabe en GPU de consumo: si, y tambien en CPU, microcontroladores y procesos embebidos, dado que el peso total esta por debajo de los 20 KB incluyendo workspace.
- Opciones de despliegue: el modelo se sirve a traves del SDK v0.2.12 (`gooo body-codegen` con `--path-model`, `--path-step-attempts` y `--path-feedback-rounds`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje transformer y sus pesos estan en JSON.
- Latencia y throughput: aproximadamente 10,7 microsegundos por inferencia en caliente con cero asignaciones de heap por llamada. No se publican datos de throughput agregado, uso de CPU ni RSS mas alla de lo remitido a `results.md`.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de la misma categoria (modulos neuronales de decision integrados en compiladores). Los unicos artefactos relacionados identificados pertenecen al mismo autor y carecen de especificaciones publicas en los resultados de busqueda:

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| asketeddy/gooo-typed-path-tiny-v1 | Variante del mismo autor | no disponible | no disponible | no disponible |
| asketeddy/gooo-compiler-prov-tiny-v2 | Variante del mismo autor | no disponible | no disponible | no disponible |
| asketeddy/gooo-joint-path-tiny-v1 | Modelo de esta ficha | 12.412 (conjunta) / 12.728 (independiente) | no disponible | MIT |

## Limitaciones y advertencias

- Alcance muy restringido: no es un generador de texto. Solo ordena cuatro rutas legales y resuelve dos decisiones binarias. No debe presentarse como un LLM.
- La propia model card advierte que los resultados finitos de 16 casos no establecen comprension amplia del lenguaje ni correccion universal.
- La variante conjunta requirio mas intentos de ensamblado (455) que la independiente (448) pese a reducir el numero de predicciones (777 frente a 1.447); el criterio de seleccion no es simplemente "menos predicciones".
- La calibracion selecciono la variante FP32 independiente, no la conjunta. La version que da nombre al repositorio no es la politica adoptada por defecto, y no se promociono ningun modelo por defecto.
- Idiomas limitados a ingles y coreano; no hay evidencia de soporte para otras lenguas ni para mezclas fuera de ese par.
- No hay datos publicados sobre sesgos, comportamiento fuera de distribucion, tokenizacion ni robustez frente a entradas adversarias. Tampoco hay benchmarks estandar que permitan estimar tasas de alucinacion o error en tareas generales.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion. No obstante, la licencia de los pesos no cubre las dependencias del SDK ni del compilador, que se distribuyen en repositorios separados con sus propias condiciones.
- El repositorio registra 0 descargas y 0 likes, y el modelo no declara pipeline en HuggingFace. No hay senales de adopcion ni de mantenimiento externo.
- La fecha de publicacion indicada por HuggingFace (2026-10-01) es posterior a la fecha de consulta habitual de este tipo de fichas; conviene verificarla antes de citarla.
- La reproducibilidad depende de artefactos externos (`raw-evidence.zip`, `results.md`, `protocol.md`, `prefixture-amendment.md`) y de versiones concretas del SDK y del compilador; cambios de version pueden invalidar las comparaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-joint-path-tiny-v1
- Perfil del autor: https://huggingface.co/asketeddy
- Repositorio de experimentos: https://github.com/kimjooyoon/gooo-neural-decision-experiments
- SDK de runtime (release v0.2.12-experimental): https://github.com/kimjooyoon/gooo-decision-runtime/releases/tag/v0.2.12-experimental
- Compilador (commit 363a3d8aa365c35dd634c241248b444de0050973): https://github.com/kimjooyoon/meta-ontology-go/commit/363a3d8aa365c35dd634c241248b444de0050973
- Variantes relacionadas: https://huggingface.co/asketeddy/gooo-typed-path-tiny-v1 y https://huggingface.co/asketeddy/gooo-compiler-prov-tiny-v2
