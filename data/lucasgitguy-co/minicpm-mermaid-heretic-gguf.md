# Lucasgitguy-co/minicpm-mermaid-heretic-gguf

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic GGUF es una cuantizacion en formato GGUF de un modelo vision-lenguaje (VLM) de aproximadamente 1.006 millones de parametros, derivado de la familia MiniCPM-V y ajustado especificamente para la conversion de diagramas e imagenes en codigo Mermaid. Lo publica el usuario Lucasgitguy-co en Hugging Face bajo licencia Apache 2.0, e incluye dos artefactos: el modelo de lenguaje cuantizado en Q4_K_M (0,672 GB) y un proyector de vision en F16 (1,109 GB) que debe cargarse conjuntamente para procesar entrada de imagen.

El modelo parte de un checkpoint base (Lucasgitguy-co/minicpm-mermaid-heretic) al que se ha aplicado una modificacion denominada "Heretic", orientada presumiblemente a eliminar restricciones de rechazo o alineacion excesiva, aunque la model card no documenta el procedimiento. Su proposito practico es la inferencia local de vision-lenguaje en hardware modesto, con un caso de uso central claro: transcribir diagramas a sintaxis Mermaid.

La relevancia actual es doble: por un lado, demuestra que un VLM de ~1B puede empaquetarse en menos de 2 GB totales y ejecutarse en CPU o GPU de consumo mediante llama.cpp; por otro, la documentacion es deliberadamente escasa, sin datos de entrenamiento, benchmarks ni evaluacion de calidad, lo que limita su uso en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en MiniCPM-V 4.7, con proyector de vision independiente; detalles internos no disponibles |
| Parametros totales | 1.006.209.856 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y F16 (proyector de vision) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su adscripcion a MiniCPM-V 4.7 y su naturaleza vision-lenguaje. El repositorio contiene dos componentes: un modelo de lenguaje cuantizado en Q4_K_M y un proyector multimodal en F16, que se cargan de forma conjunta en runtimes compatibles con la arquitectura MiniCPM-V 4.7 (por ejemplo, `llama-mtmd-cli`). No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de fusion visual.

Respecto al entrenamiento, la model card indica explicitamente que "detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts". Se mencionan dos conjuntos de datos relacionados del mismo autor (una coleccion de texto e imagenes de diagramas Mermaid y una coleccion de texto en ingles y neerlandes), pero el autor advierte que estos enlaces "do not establish the exact training split of every checkpoint". No hay informacion sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni sobre el procedimiento "Heretic" aplicado al checkpoint base.

## Capacidades

- Generacion de texto conversacional a partir de entrada de imagen y texto (pipeline `image-text-to-text`).
- Conversion de diagramas e imagenes en codigo Mermaid, proposito declarado del ajuste.
- Comprension de imagenes mediante el proyector de vision F16.
- Capacidad conversacional multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Conversion de diagramas de arquitectura a Mermaid: el caso de uso principal del ajuste; se introduce una imagen de diagrama y se solicita la salida en sintaxis Mermaid para documentacion tecnica versionada en repositorios Git.
- Documentacion de infraestructura como codigo: transcripcion de diagramas de red o de despliegue a Mermaid permite mantener la documentacion sincronizada con el codigo en pipelines de CI.
- Inferencia local en equipos sin GPU dedicada: con ~1,8 GB totales en Q4_K_M + F16, el modelo puede ejecutarse en CPU mediante llama.cpp, adecuado para entornos de escritorio o portatiles.
- Prototipado rapido de asistentes visuales: util para validar flujos de vision-lenguaje en local antes de invertir en modelos mayores.
- Extraccion de estructura de figuras academicas o tecnicas: conversion de diagramas de flujo y grafos a representaciones textuales editables.
- Educacion y demostraciones: ejemplo didactico de cuantizacion de un VLM y de carga de proyector multimodal en llama.cpp para cursos o talleres.
- Generacion de diagramas en herramientas de documentacion: integracion en wikis o generadores de documentacion que acepten Mermaid como formato de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se documentan resultados de evaluacion y que los ejemplos de carga "are guidance, not a claim of measured model quality". Tampoco se han verificado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,8 GB para los dos artefactos en disco; en memoria, el modelo Q4_K_M (~0,67 GB) mas el proyector F16 (~1,1 GB) requieren del orden de 2 GB, a los que se suma el contexto y las activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` (requiere una build que soporte MiniCPM-V 4.7 y su proyector); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla el runtime.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid Heretic GGUF | ~1B | No disponible | GGUF (Q4_K_M + F16) | Apache 2.0 | Ajuste especifico para Mermaid; sin benchmarks publicados |
| MiniCPM-V (familia upstream) | Variable (segun variante) | No disponible | Multiples | No disponible en esta ficha | Modelo base del que deriva; el autor no documenta la variante exacta |
| Modelos VLM de ~1B de otros proveedores | ~1B | No disponible | Multiples | Variable | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo verificables para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Documentacion insuficiente: no se detallan datos de entrenamiento, procedimiento de ajuste ni evaluacion; la calidad del modelo no esta respaldada por mediciones publicadas.
- Procedencia del ajuste "Heretic": no se explica que modificacion concreta se aplico al checkpoint base ni su impacto en el comportamiento del modelo; conviene tratarlo con cautela en contextos sensibles.
- Riesgo de alucinacion: inherente a los modelos de ~1B de parametros; la generacion de Mermaid puede producir sintaxis invalida o diagramas incorrectos que requieren validacion.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto desconocida: no se puede garantizar el manejo de imagenes grandes o conversaciones largas.
- Dependencia de runtime: requiere una build de llama.cpp con soporte especifico para MiniCPM-V 4.7 y su proyector; versiones sin ese soporte fallaran al cargar el modelo.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de atribucion upstream y las notas de terceros; la licencia de la herramienta Heretic es independiente de la de los artefactos del modelo.
- Popularidad muy baja (156 descargas, 0 likes en el momento de la consulta): ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-gguf
- Checkpoint base: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic
- Dataset de diagramas Mermaid (texto e imagenes): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset de texto en ingles y neerlandes: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
