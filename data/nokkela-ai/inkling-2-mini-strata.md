# nokkela-ai/Inkling-2-Mini-Strata

## Resumen

Inkling-2-Mini-Strata es una versión cuantizada y empaquetada del modelo Inkling 2 Mini de Thinking Machines Lab, distribuida por strata-engine y replicada en este repositorio por nokkela-ai. Se trata de un transformer con bucles (looped transformer) de arquitectura Mixture-of-Experts: los estratos intermedios se ejecutan tres veces por cada token, lo que da un total de 26.4B parámetros con solo 3.4B activos por token (5.4B contando las pasadas repetidas). El modelo procesa texto e imágenes y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

La relevancia de esta ficha concreta reside en el formato de distribución: los pesos se empaquetan en ficheros `.strata` optimizados para ejecutarse con la aplicación Strata, que permite arrancar en tarjetas gráficas de tan solo 4 GiB de VRAM. Esto es posible porque Strata mantiene en RAM del sistema la parte del modelo que no cabe en la GPU, aprovechando que el modelo solo activa 3.4B de sus 26.4B parámetros por token. Se ofrecen tres packs (SQ-10, SQ-15 y SQ-20) pensados para GPUs de 12, 16 y 24 GiB respectivamente, con distintos niveles de fidelidad respecto al modelo original.

El repositorio tiene un tamaño de 44.8 GB y se publica bajo licencia Apache 2.0. Es un fork independiente del modelo original de strata-engine, sin descargas ni valoraciones en el momento de redactar esta ficha, y sin datos declarados sobre idiomas soportados más allá de lo que indique la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B por token (5.4B contando las pasadas repetidas) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Packs propietarios Strata: SQ-10 (10.47 GB), SQ-15 (14.35 GB), SQ-20 (19.35 GB); vision pack adicional de 0.64 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.strata` (formato propio de la aplicacion Strata); no se listan safetensors ni GGUF en la informacion disponible |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer con bucles: los estratos centrales de la red se recorren tres veces por cada token procesado, técnica que incrementa la profundidad efectiva sin multiplicar proporcionalmente el número de parámetros. La capa de mezcla de expertos (MoE) hace que, de los 26.4B parámetros totales, solo 3.4B se activen por token, lo que reduce el coste computacional por paso de decodificación. El modelo es multimodal de entrada: acepta texto e imágenes y produce texto, lo que se refleja en el pipeline `image-text-to-text`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema de bucles y MoE. La model card del fork se centra en el proceso de cuantización y empaquetado para Strata, no en el entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Comprensión de imágenes como entrada (image-text-to-text), con un pack de visión dedicado de 0.64 GB.
- Razonamiento y generación de código: capacidades implícitas en un modelo de 26.4B parámetros, aunque no se documentan benchmarks específicos en la información disponible.
- Ventana de contexto de hasta 1M tokens, adecuada para documentos largos y conversaciones extensas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional local en equipos de sobremesa: con el pack SQ-10 y una GPU de 12 GiB, el modelo cabe íntegramente en VRAM y permite mantener conversaciones multi-turno sin conexión a servicios en la nube, útil para entornos con requisitos de privacidad.
- Análisis de documentos extensos: la ventana de 1M tokens permite cargar contratos, informes o bases de código completas en una sola pasada, y el pack SQ-20 reproduce exactamente el comportamiento del modelo original para tareas donde la fidelidad es crítica.
- Procesamiento de imágenes con texto asociado: el pack de visión de 0.64 GB habilita tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados y respuesta a preguntas sobre contenido visual.
- Prototipado en hardware modesto: con una GPU de 4 GiB, Strata descarga a RAM del sistema la parte del modelo que no cabe en VRAM, lo que permite desarrollar y validar flujos de inferencia antes de invertir en hardware mayor.
- Despliegue en estaciones de trabajo con GPU de 16 GiB: el pack SQ-15 ofrece un 96.68% de coincidencia con el modelo original en la predicción del siguiente token, un equilibrio razonable entre fidelidad y requisitos de memoria para entornos de desarrollo.
- Evaluación comparativa de cuantizaciones: los tres packs permiten medir el impacto de la compresión en tareas concretas (por ejemplo, generación de código o razonamiento) antes de decidir qué nivel de fidelidad necesita un caso de producción.

## Benchmarks y rendimiento

La información disponible incluye métricas de fidelidad de los packs de cuantización respecto al modelo original, medidas como coincidencia en la predicción del siguiente token:

| Pack | GPU recomendada | Tamano de descarga | Coincidencia con el original |
|---|---:|---:|---:|
| SQ-10 | 12 GiB | 10.47 GB | 92.35% |
| SQ-15 | 16 GiB | 14.35 GB | 96.68% |
| SQ-20 | 24 GiB | 19.35 GB | 100% (identico) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM mínima para arrancar: 4 GiB, con descarga parcial a RAM del sistema gracias al esquema MoE.
- VRAM recomendada según pack: 12 GiB (SQ-10), 16 GiB (SQ-15), 24 GiB (SQ-20).
- Vision pack adicional: 0.64 GB, necesario para tareas de lectura de imágenes.
- GPUs de consumo compatibles: tarjetas de 12, 16 y 24 GiB (por ejemplo, gamas RTX 4070/4080/4090 según memoria); no se especifican modelos concretos en la información disponible.
- GPUs de datacenter (A100, H100): no se documenta soporte explícito en la información proporcionada.
- Opciones de despliegue: aplicación Strata (Windows, Linux, macOS) con instalación mediante script (`install.sh` / `install.ps1`) y comando `strata launch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.strata`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Formato / despliegue |
|---|---|---:|---:|---|---|
| Inkling-2-Mini-Strata (este) | 26.4B | 3.4B | 1M | Apache 2.0 | `.strata` + app Strata |
| Inkling 2 Mini (original) | 26.4B | 3.4B | 1M | no disponible en la informacion | pesos originales de Thinking Machines Lab |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye modelos comparables de otros fabricantes con datos verificables de parámetros, contexto o rendimiento, por lo que la comparativa se limita al modelo base original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo base de terceros, hereda los sesgos de su entrenamiento original, que no se detallan.
- Riesgo de alucinación: no cuantificado; no se publican evaluaciones de fidelidad factual.
- Idiomas: no se declara lista de idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas distintas del inglés sin evaluación previa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Thinking Machines Lab, ya que la información disponible no la especifica.
- Formato propietario: los pesos `.strata` requieren la aplicación Strata; no se garantiza compatibilidad con vLLM, llama.cpp u otros runners estándar.
- Fidelidad de cuantización: SQ-10 y SQ-15 no son idénticos al original (92.35% y 96.68% de coincidencia), lo que puede degradar tareas sensibles a la precisión.
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de la consulta; es un fork independiente sin validación comunitaria.
- Fecha de creación futura respecto a la redacción habitual de fichas (2026-11-25); verificar la vigencia de los enlaces y releases antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nokkela-ai/Inkling-2-Mini-Strata
- Modelo base en Hugging Face: https://huggingface.co/strata-engine/Inkling-2-Mini-Strata
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio GitHub de Strata: https://github.com/Niko1221/Strata
- Descargas de la aplicación Strata: https://github.com/Niko1221/Strata/releases/latest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
