# AI4SGI/ExoMind-F16-GGUF

## Resumen

ExoMind-F16-GGUF es la versión en precisión F16 (formato GGUF) del modelo ExoMind, un sistema agéntico multimodal diseñado para razonamiento y descubrimiento científico. Ha sido desarrollado por el ExoMind Team del Shanghai Artificial Intelligence Laboratory y se distribuye bajo licencia Apache 2.0. El modelo base, ExoMind, está construido sobre Qwen3.5-35B-A3B, una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos, lo que permite un despliegue eficiente en términos de cómputo.

La relevancia de este lanzamiento radica en su objetivo de democratizar la inteligencia científica: según la página del proyecto, ExoMind consigue mejoras sustanciales y consistentes en tareas de razonamiento científico e investigación usando menos datos, un modelo pequeño y entrenamiento de bajo coste, superando a modelos líderes abiertos y cerrados en la mayoría de los conjuntos de datos evaluados, con aproximadamente 277 veces menos parámetros que GPT-5.5. Este repositorio concreto contiene únicamente los pesos F16 en GGUF y el proyector multimodal, separados en cuatro shards para facilitar la descarga y el despliegue con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5, transformer multimodal con proyector de vision |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | 32768 tokens (segun ejemplo de despliegue con llama.cpp) |
| Tipos de cuantizacion | F16 (este repositorio); tambien disponibles Q4_K_M y Q8_0 en repositorios separados |
| Idiomas soportados | Ingles y chino (segun el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16), 4 shards de 18.15, 18.31, 18.18 y 11.55 GiB, mas proyector multimodal de 857.62 MiB |

## Arquitectura y entrenamiento

ExoMind emplea una arquitectura de mezcla de expertos (MoE) con 35B parametros totales y 3B activos, derivada de Qwen3.5-35B-A3B. El modelo es multimodal, acepta entradas de texto e imagen mediante un proyector de vision que se incluye en este repositorio como archivo separado (`mmproj-qwen3_5_35b_a3b-F16.gguf`). La innovacion principal no reside en la arquitectura base, sino en el sistema agéntico inspirado en el concepto de "mente extendida" (extended-mind): organiza un modelo general, objetos de interaccion especializados y procesos autonomos de interaccion, permitiendo al modelo descubrir fuentes, fundamentar evidencia, ejecutar verificaciones y actualizar su razonamiento en torno a cada tarea cientifica.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. El equipo destaca que el entrenamiento fue de bajo coste y con menos datos que alternativas comparables, pero no se ofrecen cifras concretas. La conversion de pesos a GGUF se realizo con llama.cpp (revision `7584430`) y se valido la integridad de los shards, aunque no se conservaron los comandos originales de conversion y cuantizacion, por lo que no se garantiza una reproducibilidad bit a bit del pipeline de conversion.

## Capacidades

- Razonamiento cientifico y de investigacion: disenado especificamente para tareas de descubrimiento, verificacion y fundamentacion de evidencia.
- Razonamiento agéntico multi-paso: puede organizar procesos autonomos de interaccion, descubrir fuentes y actualizar su razonamiento.
- Tool use / function calling: soporte para integracion con herramientas externas, segun los tags del modelo.
- Multimodal: procesa imagenes junto con texto gracias al proyector de vision incluido.
- Generacion de texto conversacional: capacidad de dialogo y respuesta a instrucciones.
- Multilingue: soporte para ingles y chino, segun el modelo base.

## Casos de uso

- Asistente de investigacion cientifica: el modelo puede ayudar a revisar articulos, resumir hallazgos y sugerir hipotesis, aprovechando su razonamiento cientifico y su capacidad de fundamentar evidencia.
- Analisis de documentos con figuras y tablas: gracias a su multimodalidad, puede interpretar graficos, diagramas e imagenes cientificas junto con el texto, util en revision de papers o informes tecnicos.
- Agente autonomo de descubrimiento de fuentes: el sistema agéntico puede buscar, seleccionar y verificar fuentes bibliograficas de forma autonoma, reduciendo el trabajo manual en revisiones sistematicas.
- Verificacion de evidencia y deteccion de inconsistencias: puede contrastar afirmaciones con datos disponibles y senalar posibles errores o sesgos en resultados experimentales.
- Educacion cientifica avanzada: como tutor interactivo para estudiantes de posgrado, explicando conceptos complejos y resolviendo dudas con razonamiento paso a paso.
- Integracion en pipelines de analisis de datos: con soporte de tool calling, puede conectarse a APIs de bases de datos cientificas o herramientas de calculo para automatizar flujos de trabajo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version F16 GGUF en la informacion disponible. La model card indica que los resultados publicados corresponden al checkpoint original en BF16 (formato Transformers) y que el empaquetado F16 GGUF no tiene puntuaciones separadas. La pagina del proyecto menciona mejoras consistentes sobre el modelo base en ocho conjuntos de datos y que supera a modelos lideres abiertos y cerrados en la mayoria de ellos, pero no se proporcionan cifras concretas en los materiales consultados. No se incluyen numeros para evitar inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos F16 suman aproximadamente 66.2 GiB (18.15 + 18.31 + 18.18 + 11.55 GiB) mas 0.84 GiB del proyector, por lo que se necesitan al menos 70 GB de VRAM para cargar el modelo completo en F16.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o GPUs con 80 GB de VRAM o mas. No cabe en GPUs de consumo como RTX 4090 (24 GB) en esta precision.
- Para despliegue en hardware de consumo, se recomienda usar las versiones cuantizadas Q4_K_M o Q8_0 disponibles en repositorios separados, que pueden caber en 24 GB o 16 GB segun la cuantizacion.
- Opciones de despliegue: llama.cpp (llama-server), compatible con el formato GGUF. Tambien se puede usar el modelo base en Transformers con vLLM u otros frameworks, aunque este repositorio esta orientado a llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que no es posible realizar una comparacion numerica rigurosa. El modelo base ExoMind se posiciona como una alternativa eficiente a modelos cientificos de gran tamano, con 35B parametros totales y 3B activos, frente a modelos como GPT-5.5 (que segun la pagina del proyecto tiene aproximadamente 277 veces mas parametros). En el ecosistema open source, compite con modelos MoE de tamano similar como Qwen3.5-35B-A3B (su base) y otros modelos cientificos especializados, pero sin datos publicos de benchmarks no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3.5, puede heredar sesgos presentes en los datos de entrenamiento de ese modelo, aunque no se han documentado sesgos especificos para ExoMind.
- Riesgo de alucinacion: en tareas cientificas, el modelo puede generar afirmaciones plausibles pero incorrectas; se recomienda verificar siempre las salidas con fuentes primarias.
- Limitaciones de contexto: la ventana de contexto es de 32768 tokens, insuficiente para documentos cientificos muy extensos sin tecnicas de chunking o resumen previo.
- Limitaciones de idioma: el soporte principal es ingles y chino; otros idiomas pueden tener un rendimiento inferior.
- Restricciones de licencia: aunque los pesos se distribuyen bajo Apache 2.0, el texto del informe tecnico, las figuras cientificas, los resultados y los activos de marca de ExoMind estan sujetos a los "ExoMind Research Content and Brand Terms" (ver CONTENT_RIGHTS.md en el repositorio).
- Caveat de produccion: los resultados publicados corresponden al checkpoint BF16 original; la version F16 GGUF no tiene benchmarks propios, por lo que el rendimiento real puede variar ligeramente debido a la conversion de precision.

## Enlaces

- Repositorio HuggingFace de ExoMind-F16-GGUF: https://huggingface.co/AI4SGI/ExoMind-F16-GGUF
- Modelo base ExoMind (Transformers): https://huggingface.co/AI4SGI/ExoMind
- Repositorio GitHub oficial: https://github.com/AI4SGI/ExoMind
- Pagina del proyecto: https://ai4sgi.github.io/ExoMind/
- ModelScope (espejo): https://modelscope.cn/models/AI4SGI/ExoMind-F16-GGUF
- Coleccion de la familia de modelos ExoMind: https://huggingface.co/collections/AI4SGI/exomind-model-family
