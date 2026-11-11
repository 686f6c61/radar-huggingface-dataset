# 42ailab/Tongyi-DeepResearch-30B-A3B-GGUF

## Resumen

Tongyi-DeepResearch-30B-A3B es un modelo de lenguaje orientado a tareas de agente, desarrollado por Tongyi Lab (Alibaba) y publicado bajo licencia Apache-2.0. Esta ficha corresponde concretamente al repositorio `42ailab/Tongyi-DeepResearch-30B-A3B-GGUF`, que no es un modelo nuevo ni una conversion propia: es una copia byte a byte de los ficheros GGUF generados por bartowski a partir de los pesos originales de Alibaba. El repositorio existe como respaldo para garantizar la disponibilidad de los mismos bytes si el repositorio del conversor cambia o desaparece.

El modelo esta disenado para busqueda de informacion y tareas de investigacion de horizonte largo, con uso de herramientas en multiples turnos y contexto extendido. Su nombre indica una arquitectura de mezcla de expertos (MoE) con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, aunque la model card del repositorio de respaldo no detalla la configuracion interna ni el contexto maximo.

El interes practico de este repositorio reside en que ofrece una unica cuantizacion Q4_K_M (17,35 GiB) en formato GGUF, lista para su uso con motores de inferencia local compatibles con llama.cpp. El repositorio tiene un volumen de descargas muy bajo (66) y no registra likes, lo que sugiere que la distribucion principal se realiza a traves de otras vias, como la aplicacion de escritorio 42model o el repositorio original de bartowski.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar en la model card) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo. La denominacion "30B-A3B" es coherente con un transformer de mezcla de expertos con 30.000 millones de parametros totales y alrededor de 3.000 millones activos por token, pero la model card del repositorio de respaldo no aporta detalles sobre el numero de expertos, el enrutamiento ni el tipo de atencion. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si se declara es el proposito de entrenamiento: tareas de busqueda de informacion y research de horizonte largo, con uso de herramientas en multiples turnos y contexto largo. El repositorio de 42ailab no contiene informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). Los pesos originales proceden del repositorio oficial Alibaba-NLP/DeepResearch, y la conversion a GGUF fue realizada por bartowski.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Uso de herramientas en multiples turnos (etiqueta `agent`), orientado a flujos de busqueda y recopilacion de informacion.
- Razonamiento de horizonte largo para tareas de investigacion que requieren varias etapas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion documental automatizada: el modelo puede encadenar busquedas, lecturas y sintesis en varios turnos, lo que encaja con su entrenamiento para information seeking de horizonte largo.
- Asistentes de analisis competitivo: permite recopilar fuentes dispersas y consolidar hallazgos en un informe estructurado, aprovechando el uso de herramientas.
- Automatizacion de due diligence: el modelo puede consultar repositorios de datos, registros publicos y documentacion interna de forma iterativa antes de emitir conclusiones.
- Agentes de soporte a la investigacion academica: revision de literatura con consultas sucesivas a bases de datos y resumen de resultados con trazabilidad de fuentes.
- Despliegue local en estaciones de trabajo: al estar en GGUF Q4_K_M (17,35 GiB), puede ejecutarse con llama.cpp u otros motores compatibles en equipos con suficiente memoria, sin depender de la nube.
- Integracion en pipelines de agentes mediante API compatible con endpoints: util para orquestadores que necesitan un modelo con capacidad de tool calling en multiples pasos.
- Respaldo de distribucion en produccion: al ser una copia byte a byte con sha256 verificable, sirve para fijar una version reproducible del modelo en entornos donde la disponibilidad del repositorio original no esta garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la unica cuantizacion incluida (Q4_K_M): aproximadamente 17,35 GiB solo para los pesos, mas overhead de contexto y cache KV; en la practica se recomienda disponer de 20-24 GB de memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada; por volumen de memoria, una RTX 4090 (24 GB) o una A100/H100 con 40 GB o mas son opciones plausibles, aunque no confirmadas por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM si se mantiene un contexto moderado; en tarjetas de 16 GB requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp y motores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere integracion con servicios de inferencia tipo API. No se confirma soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Tongyi-DeepResearch-30B-A3B (este repo) | 30.532.122.624 | no disponible | Apache-2.0 | GGUF Q4_K_M | Copia de respaldo de la conversion de bartowski |
| Alibaba-NLP/Tongyi-DeepResearch-30B-A3B (original) | 30.532.122.624 | no disponible | Apache-2.0 | safetensors (presumiblemente) | Repositorio oficial de Tongyi Lab; fuente de los pesos |
| bartowski/Alibaba-NLP_Tongyi-DeepResearch-30B-A3B-GGUF | 30.532.122.624 | no disponible | Apache-2.0 | GGUF (varias cuantizaciones) | Conversion original; probablemente incluye mas cuantizaciones que este repositorio |

No se dispone de datos de rendimiento comparado con modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo: es una copia sin modificaciones de la conversion de bartowski; cualquier incidencia debe contrastarse con el repositorio original.
- Solo se distribuye una cuantizacion (Q4_K_M), por lo que no hay opciones de mayor o menor precision en este repositorio.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez.
- No se especifican los idiomas soportados ni el contexto maximo, lo que dificulta planificar su uso en produccion.
- El modelo esta orientado a tareas de agente con herramientas; su rendimiento fuera de ese dominio no esta documentado.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar el fichero LICENSE incluido y las condiciones del repositorio oficial de Alibaba.
- El volumen de descargas (66) y la ausencia de likes indican una adopcion muy baja de este repositorio concreto; para produccion es preferible fijar los ficheros por sha256.
- No hay informacion sobre latencia, throughput ni requisitos de memoria medidos por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Tongyi-DeepResearch-30B-A3B-GGUF
- Repositorio en ModelScope: https://modelscope.cn/models/42ailab/Tongyi-DeepResearch-30B-A3B-GGUF
- Conversion original de bartowski (ModelScope): https://www.modelscope.cn/models/bartowski/Alibaba-NLP_Tongyi-DeepResearch-30B-A3B-GGUF
- Repositorio oficial de Tongyi (GitHub): Alibaba-NLP/DeepResearch
- Sitio del distribuidor: https://42ailab.com
- Aplicacion 42model: https://42model.com
