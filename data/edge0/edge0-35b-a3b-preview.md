# Edge0/Edge0-35B-A3B-preview

## Resumen

Edge0-35B-A3B-preview es un modelo de lenguaje disperso (MoE) de clase 35B desarrollado por Edge0, publicado como vista previa sobre el checkpoint base Qwen/Qwen3.5-MoE-35B-A3B. Su propuesta no es tanto el modelo en si como el pipeline de inferencia que lo acompana: el framework edge0 (backend MLX) permite ejecutar los 34.660.610.688 parametros en cuantizacion int4 con menos de 3 GiB de memoria activa, manteniendo el checkpoint completo en almacenamiento y transmitiendo los expertos bajo demanda.

Tecnicamente combina tres mecanismos: offload de expertos a SSD, un cabezal entrenado llamado prerouter que predice el enrutamiento con un paso de antelacion para solapar las cargas con el forward pass, y Recover-LoRA, un conjunto de adaptadores LoRA entrenados por destilacion desde el profesor en fp16 que recuperan la mayor parte de la perdida de cuantizacion. El resultado declarado es de 15 tok/s de decodificacion y 140 tok/s de prefill en un Mac mini M4 Pro de 24 GB.

Es relevante ahora porque ataca un cuello de botella concreto: servir un MoE de 35B en hardware de clase telefono o en un equipo de sobremesa sin VRAM dedicada. La contrapartida es que se trata de una vista previa temprana: el soporte de agentes y tool calling es debil de forma reconocida por el autor, el backend MLX solo apunta a Apple Silicon y el modelo esta afinado principalmente para los idiomas del modelo base, sin listado oficial de idiomas en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso (MoE) con enrutamiento por token; arquitectura base qwen3_5_moe |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | No disponible de forma explicita; la nomenclatura A3B del nombre sugiere del orden de 3.000 millones activos, pero el autor no publica la cifra |
| Longitud de contexto | No disponible (el autor solo indica que contextos largos incrementan la KV cache) |
| Tipos de cuantizacion | int4 (4-bit) en el checkpoint publicado; se referencia el modelo base en fp16 como profesor |
| Idiomas soportados | No disponible; la model card indica que esta afinado principalmente para los idiomas del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint base + `lora_edge0_35b.safetensors` + `prerouter_edge0_35b.safetensors`), libreria mlx |
| Capas | 40 |
| Expertos totales / activos por token | 256 / 4 (K=4) |
| Tamano oculto (hidden size) | 2048 |
| Tamano del repositorio | 19,7 GB |
| Modelo base | Qwen/Qwen3.5-MoE-35B-A3B |
| Framework de ejecucion | edge0 (backend MLX) |
| Pipeline | text-generation |
| Descargas / likes en HuggingFace | 329 / 23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 40 capas con 256 expertos y 4 expertos activos por token (K=4), con un tamano oculto de 2048. El checkpoint derivado se distribuye ya cuantizado a int4; sobre esa base congelada se aplican dos artefactos entrenados: los adaptadores Recover-LoRA, obtenidos por destilacion desde el profesor en fp16, y el prerouter. Los adaptadores se mantienen sin fusionar con la base, lo que permite que una unica base de solo lectura sirva a varios conjuntos de adaptadores sin recuantizar.

La innovacion principal esta en el runtime mas que en el modelo. El offload de expertos a SSD transmite los pesos de los expertos desde el almacenamiento solo a medida que el router los selecciona, de modo que el pico de memoria queda acotado por el conjunto activo y no por el numero total de parametros. El prerouter es un cabezal entrenado que predice el enrutamiento con un paso de antelacion, de forma que las lecturas de expertos se solapan con el forward pass en lugar de bloquearlo; el autor reporta hasta un +59 % de throughput de decodificacion, con ganancias que crecen con la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO sobre el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: text-generation, tag conversational).
- Razonamiento y matematicas: los benchmarks publicados incluyen AIME 2026 (86,6 en int4) y GPQA-Diamond (79,8), lo que indica capacidad de razonamiento competitiva.
- Generacion de codigo: HumanEval 90,9 en la version int4.
- Modo thinking: la model card menciona chat multilingue y razonamiento con modo thinking habilitado por la plantilla de chat incluida.
- Seguimiento de instrucciones: IFBench 57,9, la puntuacion mas baja del conjunto de benchmarks publicados.
- Tool calling / function calling: no esta soportado de forma fiable en esta vista previa; el autor declara que la capacidad agentica (uso de herramientas, planificacion multi-paso, autonomia de horizonte largo) es debil actualmente.
- Capacidades multilingues: no disponibles; sin listado oficial de idiomas, afinado principalmente para los idiomas del modelo base.
- Vision y audio: no disponibles, sin indicios de soporte multimodal.
- Servicio via API compatible con OpenAI mediante `edge0 serve`.

## Casos de uso

- Inferencia en el borde (edge) sin VRAM dedicada: el pipeline mantiene residentes solo los pesos activos (2,9 GiB de pico medido) y transmite los expertos desde almacenamiento NVMe o flash interno, por lo que encaja en equipos con GPU integrada o memoria unificada limitada.
- Servicio por lotes en una maquina de gama media: una unica base de solo lectura puede atender varios conjuntos de adaptadores LoRA sin recuantizar, lo que abarata el despliegue de variantes especializadas sobre el mismo modelo.
- Asistentes conversacionales locales en Apple Silicon: con 15 tok/s de decodificacion y 140 tok/s de prefill en un Mac mini M4 Pro, es viable para chat interactivo en escritorio sin conexion a servicios en la nube.
- Prototipado de razonamiento y matematicas en local: los 86,6 puntos en AIME 2026 y 79,8 en GPQA-Diamond permiten usar el modelo para validar pipelines de razonamiento antes de escalar a hardware mayor.
- Asistencia de programacion en equipos de desarrollo con recursos limitados: los 90,9 puntos en HumanEval lo hacen util para autocompletado y explicacion de codigo en entornos donde no se puede desplegar un modelo mayor.
- Investigacion sobre inferencia eficiente: el par prerouter + offload de expertos constituye una plataforma reproducible para medir el efecto del solapamiento de carga de expertos sobre el throughput de decodificacion, con el codigo y el script `examples/bench.py` disponibles.
- Despliegue de una API interna compatible con OpenAI: `edge0 serve --port 8085` expone un endpoint compatible que puede integrarse en herramientas existentes que ya consumen la API de OpenAI.
- Evaluacion comparativa de cuantizacion: el par int4 + Recover-LoRA frente al base fp16 permite estudiar la recuperacion de calidad tras cuantizar (3,9 puntos de media de diferencia segun el autor).

## Benchmarks y rendimiento

Todos los datos proceden de las mediciones del autor con OpenCompass, bajo ajustes y parametros identicos para ambos modelos. Escala maxima 100.

| Benchmark | edge0-35b (int4) | Qwen3.5-MoE 35B-A3B (fp16) |
|---|---:|---:|
| AIME 2026 | 86,6 | 92,7 |
| HumanEval | 90,9 | 95,1 |
| GPQA-Diamond | 79,8 | 81,8 |
| MMLU-Pro | 81,0 | 84,6 |
| IFBench | 57,9 | 61,7 |
| Media | 79,2 | 83,2 |

Rendimiento medido con `examples/bench.py` en un Mac mini M4 Pro de 24 GB:

| Velocidad de decodificacion | Throughput de prefill (frio / caliente) | Memoria activa maxima |
|---|---|---|
| 14,9–17,7 tok/s | 113 / 140 tok/s | 2,9 GiB |

La memoria activa maxima corresponde a contextos cortos; los contextos largos anaden KV cache. Los pesos de los expertos se transmiten desde SSD bajo demanda y no residen en memoria.

## Requisitos de hardware

- Memoria activa: por debajo de 3 GiB (2,9 GiB de pico medido con contextos cortos), frente a los 19,7 GB del repositorio completo, que permanece en almacenamiento.
- Almacenamiento: es un requisito de primer orden, no un accesorio. Se necesita SSD NVMe o flash interno rapido, ya que los expertos se transmiten en cada paso de decodificacion.
- GPU: no se especifica soporte para A100, H100 o RTX 4090. El backend MLX apunta actualmente a Apple Silicon, y la medicion publicada se hizo en un Mac mini M4 Pro de 24 GB.
- Cabe en GPU de consumo: el modelo no se distribuye para ese escenario en esta vista previa; la via soportada es Apple Silicon con memoria unificada y almacenamiento rapido.
- Opciones de despliegue: framework edge0 con backend MLX (`edge0 chat`, o `edge0 serve` para una API compatible con OpenAI en el puerto 8085). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 14,9–17,7 tok/s de decodificacion y 113/140 tok/s de prefill (frio/caliente). El prerouter aporta hasta un +59 % de throughput de decodificacion, con ganancia creciente segun la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K.
- Otros backends: estan en la hoja de ruta de edge0, pero no disponibles en esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-35B-A3B-preview | 34,66 B totales (MoE, K=4) | No disponible | Media 79,2 en el conjunto de benchmarks del autor (int4) | Apache 2.0 | HuggingFace, requiere framework edge0 + MLX |
| Qwen3.5-MoE 35B-A3B (fp16, modelo base) | Clase 35B (MoE, K=4) | No disponible | Media 83,2 en el mismo conjunto | No disponible en la informacion proporcionada | HuggingFace |
| Edge0-8B-A1B-preview | No disponible | No disponible | No disponible | Apache 2.0 (referenciado en los badges del autor) | HuggingFace, misma familia edge0 |

La comparacion directa relevante es contra el propio modelo base en fp16: el pipeline int4 pierde 3,9 puntos de media, con la mayor caida en AIME 2026 (6,1 puntos) y la menor en GPQA-Diamond (2,0 puntos), a cambio de reducir la memoria activa a menos de 3 GiB. No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de vista previa: el autor indica que la cobertura y la calidad siguen en extension; no es un artefacto de produccion consolidado.
- Capacidad agentica debil: el uso de herramientas, la planificacion multi-paso y la autonomia de horizonte largo no estan optimizados en esta version. No debe desplegarse como agente autonomo.
- Backend restringido: el backend MLX apunta actualmente a Apple Silicon; no hay soporte CUDA en esta publicacion.
- Dependencia critica del almacenamiento: el rendimiento depende de la latencia del SSD. En almacenamiento lento, la decodificacion se degrada y el beneficio del prerouter se vuelve mas determinante.
- Contexto: la KV cache crece con la longitud de contexto; el autor recomienda contextos cortos para mantener el pico en torno a 3 GiB. La longitud de contexto soportada no esta publicada.
- Idiomas: no hay listado oficial de idiomas en la ficha de HuggingFace y el modelo esta afinado principalmente para los idiomas del modelo base, por lo que el comportamiento fuera de ellos no esta garantizado.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad; aplican los riesgos habituales de un modelo de lenguaje sin datos especificos.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia: Apache 2.0, permisiva para uso comercial. Conviene verificar de todos modos las condiciones del modelo base Qwen3.5-MoE-35B-A3B, ya que la informacion disponible no detalla su licencia.
- Ecosistema inmaduro: 329 descargas y 23 likes en el momento de la consulta, con dos dias de diferencia entre creacion y ultima actualizacion, lo que indica un artefacto muy reciente y poco rodado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Edge0/Edge0-35B-A3B-preview
- Repositorio del framework edge0: https://github.com/Edge0-AI/edge0
- Documentacion de edge0: https://github.com/Edge0-AI/edge0#documentation
- Licencia: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Modelo hermano Edge0-8B-A1B-preview: https://huggingface.co/Edge0/Edge0-8b-a1b-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-MoE-35B-A3B
- OpenCompass (herramienta de evaluacion usada por el autor): https://github.com/open-compass/opencompass
- Video demostrativo: https://huggingface.co/Edge0/Edge0-35B-A3B-preview/resolve/main/20260910-105854.mp4
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los presentes en la model card y en la ficha de HuggingFace.
