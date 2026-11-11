# larql/gemma-4-26b-a4b-it

## Resumen

`larql/gemma-4-26b-a4b-it` es un contenedor VINDEX3 del modelo `google/gemma-4-26B-A4B-it` de Google, empaquetado por el usuario `larql` para su uso con el runtime LARQL. No se trata de un fine-tuning ni de una variante de pesos: el contenedor redistribuye los pesos BF16 originales sin modificar y les adjunta la estructura del modelo como un grafo ejecutable e inspeccionable. El objetivo es permitir la ejecucion del modelo mediante las herramientas de linea de comandos de LARQL (`pull`, `run`, `chat`, `serve`, LQL y `vindex3 observe`), incluyendo un servidor con API compatible con OpenAI.

El modelo subyacente, Gemma 4 26B A4B IT, es un modelo de Google con arquitectura de mezcla de expertos (MoE), segun se deduce de la nomenclatura "26B-A4B" (26 mil millones de parametros totales y 4 mil millones activos), aunque la model card del contenedor no detalla la arquitectura ni el contexto. La relevancia de esta publicacion es fundamentalmente practica: ofrece una via alternativa de despliegue para quienes trabajan con el ecosistema LARQL y necesitan inspeccionar la estructura interna del modelo, no una mejora de capacidades respecto al original.

El repositorio ocupa 52,8 GB, coherente con pesos BF16 de un modelo de 26B parametros. La licencia declarada es Apache 2.0, heredada de Gemma 4, y el contenedor se distribuye bajo esa misma licencia. En el momento de la consulta el repositorio no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), inferida de la nomenclatura "26B-A4B"; no detallada en la model card |
| Parametros totales | 26B (segun nomenclatura del modelo base) |
| Parametros activos | 4B (segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el contenedor incluye pesos BF16 sin modificar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor VINDEX3 (pesos BF16 originales mas grafo estructural ejecutable) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. La unica informacion estructural disponible es la del contenedor: VINDEX3 empaqueta los pesos BF16 originales de `google/gemma-4-26B-A4B-it` junto con la estructura del modelo representada como un grafo ejecutable e inspeccionable. No se indica si el modelo base emplea atencion estandar, atencion lineal u otras variantes, ni se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset o las fases de alineacion (RLHF, DPO u otras).

El contenedor fue codificado a partir de la revision `google/gemma-4-26B-A4B-it@4d7ae4984b7db7de8f8457170b3f1a419ee76d52`, y los digests de verificacion se documentan en el archivo `PROVENANCE.md` del repositorio. La innovacion tecnica destacable no esta en el modelo sino en el formato: la exposicion de la estructura como grafo permite inspeccionar el modelo en tiempo de ejecucion mediante `vindex3 observe`, algo que los formatos de pesos convencionales no ofrecen.

## Capacidades

- Generacion de texto: soportada mediante los comandos `run`, `chat` y `serve`.
- Servidor con API compatible con OpenAI: disponible a traves de `larql serve <modelo> --port <puerto>`.
- Inspeccion estructural: el comando `vindex3 observe` permite examinar el grafo del modelo.
- Consultas LQL: el runtime admite el lenguaje LQL sobre el modelo cargado.
- Vision: los pesos de vision estan incluidos en el contenedor, pero esta build de LARQL no admite entrada de imagen para este modelo.
- Audio: no admitido en esta build de LARQL.
- Tool calling, razonamiento multi-paso, modo thinking y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local con API compatible con OpenAI: mediante `larql serve gemma-4-26b-a4b-it --port 8080` se expone el modelo como servicio HTTP, lo que permite sustituir endpoints de OpenAI en aplicaciones existentes sin cambiar el codigo cliente.
- Inspeccion y depuracion de modelos: `vindex3 observe` permite examinar la estructura del modelo como grafo, util para investigadores que necesitan analizar el flujo interno de un MoE de 26B parametros sin depender de herramientas de visualizacion externas.
- Experimentacion con el runtime LARQL: el contenedor sirve como caso de prueba de referencia para validar el comportamiento de LARQL con un modelo MoE de gran tamano y pesos BF16.
- Generacion de texto por linea de comandos: `larql run gemma-4-26b-a4b-it "<prompt>"` cubre tareas puntuales de generacion sin levantar un servidor, adecuado para scripts y automatizacion.
- Conversacion interactiva en terminal: el comando `chat` permite sesiones multi-turno locales para pruebas de calidad de respuesta antes de integrar el modelo en una aplicacion.
- Verificacion de procedencia de pesos: el repositorio incluye digests en `PROVENANCE.md`, lo que facilita auditorias de integridad en entornos donde se exige trazabilidad del modelo desplegado.
- Evaluacion comparativa de formatos: al conservar los pesos BF16 sin modificar, el contenedor permite comparar el rendimiento de LARQL frente a otros runtimes (vLLM, llama.cpp) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, los pesos BF16 de un modelo de 26B parametros ocupan aproximadamente 52 GB, coherente con el tamano del repositorio (52,8 GB), a lo que hay que sumar el coste de cache KV y overhead del runtime.
- GPU recomendadas: no disponible. Por el volumen de pesos en BF16, el despliegue requiere GPUs con memoria agregada superior a 52 GB, lo que excluye GPUs de consumo de 24 GB o menos en precision completa.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte de cuantizacion que reduzca el modelo por debajo de umbrales de VRAM consumer.
- Opciones de despliegue: runtime LARQL (`larql pull`, `larql run`, `larql chat`, `larql serve`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| larql/gemma-4-26b-a4b-it | 26B | 4B | no disponible | Apache 2.0 | VINDEX3 (BF16) | Contenedor LARQL con grafo inspeccionable; sin soporte de vision en esta build |
| google/gemma-4-26B-A4B-it | 26B | 4B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo original de Google; referencia para otros runtimes |
| Alternativas de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un comportamiento multilingue adecuado en produccion.
- La longitud de contexto no esta documentada en la informacion disponible; no debe asumirse ningun valor concreto.
- Esta build de LARQL no admite entrada de imagen ni audio, pese a que los pesos de vision estan presentes en el contenedor. No debe esperarse funcionalidad multimodal.
- El formato VINDEX3 y el runtime LARQL son especificos del ecosistema del autor; el contenedor no es directamente utilizable con vLLM, llama.cpp, TGI u otros motores convencionales, lo que limita la portabilidad.
- El repositorio no registra descargas ni likes en el momento de la consulta, y el autor no es el desarrollador original del modelo; la validacion de calidad recae en el usuario.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos especificos de la licencia de Gemma 4 enlazada por el autor antes de desplegar en produccion.
- Al tratarse de una redistribucion de pesos sin modificar, las limitaciones del modelo base (no documentadas aqui) se heredan integramente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/larql/gemma-4-26b-a4b-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Revision del modelo base codificada: `4d7ae4984b7db7de8f8457170b3f1a419ee76d52`
- Formato VINDEX3: https://vindex3.org
- Runtime LARQL: https://github.com/chrishayuk/larql
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Procedencia y digests: archivo `PROVENANCE.md` dentro del repositorio
