# kakoka/Slonik-27B-oQ6e-mtp

## Resumen

Slonik-27B-oQ6e-mtp es una cuantización de precisión mixta en formato MLX del modelo Slonik-27B, desarrollado por Postgres Professional a partir de Qwen3.8-27B. La publica el usuario kakoka en Hugging Face y está orientada a inferencia local en hardware Apple Silicon mediante la librería MLX y el runtime oMLX. El modelo conserva el componente textual y los pesos MTP (multi-token prediction) nativos, lo que habilita decodificación especulativa con la función Lightning MTP de oMLX.

El checkpoint ocupa 22,94 GB en pesos y contiene 27.320.697.856 parámetros totales según los safetensors del repositorio. La cuantización emplea una base afín de 6 bits con precisión superior en tensores seleccionados, calibración por matriz de importancia oQe y tamaño de grupo 64. Es un modelo solo de texto, con licencia Apache-2.0, pensado para generación de código y texto, con atención especial al dominio PostgreSQL según la trazabilidad del proyecto Slonik.

Su relevancia práctica radica en que permite ejecutar un modelo de 27B en un equipo Apple Silicon con memoria unificada abundante manteniendo una velocidad de decodificación superior a 57 tokens/s en una Mac Studio M5 Ultra, gracias a la combinación de cuantización de 6 bits y decodificación especulativa MTP. No es un modelo entrenado desde cero, sino un derivado cuantizado: sus capacidades heredan las del checkpoint base dglhf/Slonik.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (familia qwen3_5), con cabezas MTP nativas; solo texto |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín de precisión mixta: base 6 bits, precisión superior en tensores seleccionados, grupo 64, calibración oQe; tensores flotantes restantes en BF16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 22,94 GB en decimal; incluye tokenizer y chat template |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. El checkpoint de origen es Slonik-27B de Postgres Professional, derivado a su vez de Qwen3.8-27B, tomado de la revisión `321d879c39a809057f324a8133c9484e4c192c06` del subdirectorio `27B/` del repositorio dglhf/Slonik en BF16. La arquitectura subyacente es un transformer de la familia Qwen3.8 con 27,3 mil millones de parámetros y cabezas de predicción multi-token (MTP), de las que se preservan los 15 tensores nativos junto con sus escalas y offsets de cuantización.

La conversión se realizó con oMLX 0.7.4.dev1 en modo Text Only, manteniendo BF16 para los tensores flotantes restantes y aplicando cuantización afín de precisión mixta con base de 6 bits, mayor precisión en tensores seleccionados y calibración mediante matriz de importancia oQe. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. La innovación técnica destacable es la conservación de los pesos MTP para habilitar decodificación especulativa (Lightning MTP) en oMLX.

## Capacidades

- Generación de texto y conversación multi-turno en modo text-generation con chat template incluido.
- Generación y razonamiento sobre código, con especialización heredada del dominio PostgreSQL del proyecto Slonik.
- Decodificación especulativa mediante pesos MTP nativos, activable con Lightning MTP en oMLX.
- Ejecución de tareas de agente de código: la benchmark de la model card muestra al modelo lanzando `EXPLAIN (ANALYZE, BUFFERS)` contra una instancia de PostgreSQL y proponiendo cambios SQL.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Modo thinking: la benchmark se ejecuta con thinking desactivado, lo que implica que el modelo base dispone de un modo de razonamiento conmutable, aunque no se detalla su comportamiento.
- Visión y audio: no soportados (cuantización Text Only).

## Casos de uso

- Asistente de administración de PostgreSQL: el modelo puede recibir consultas problemáticas, ejecutar `EXPLAIN (ANALYZE, BUFFERS)` mediante un agente y proponer reescrituras SQL; la model card documenta este flujo con verificación de equivalencia de resultados en 72 casos.
- Agente de código integrado en terminal: al conservar los pesos MTP y funcionar con oMLX, encaja en agentes tipo Goose (Markov es un fork interno de Goose) para tareas de depuración y refactorización sobre repositorios locales.
- Inferencia local en estaciones de trabajo Apple Silicon: con 22,94 GB de pesos cabe en equipos con memoria unificada de 32 GB o superior, lo que permite trabajar con datos sensibles sin salir del equipo.
- Generación de código en pipelines de desarrollo: puede integrarse como paso de revisión o generación de parches en flujos CI/CD ejecutados en runners macOS con Apple Silicon.
- Prototipado rápido de aplicaciones de texto: el repositorio incluye tokenizer y chat template, por lo que se puede cargar como modelo local en oMLX sin configuración adicional.
- Evaluación comparativa de cuantizaciones: sirve como variante intermedia entre oQ8 (29,08 GB) y oQ4e (16,60 GB) para medir el compromiso entre calidad y velocidad en hardware Apple.
- Docencia e investigación sobre decodificación especulativa: los pesos MTP preservados permiten estudiar el impacto de Lightning MTP en latencia y throughput con un modelo de 27B.

## Benchmarks y rendimiento

La model card publica una comparación medida en una Mac Studio M5 Ultra con 256 GiB de memoria unificada, con prompt en inglés sobre PostgreSQL de 437 tokens de entrada, 256 tokens generados, sin caché de entrada, thinking desactivado y Lightning MTP activado. Cada fila corresponde a la mediana de tres ejecuciones calentadas.

| Variante | Pesos | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Total (s) |
|---|---:|---:|---:|---:|---:|
| oQ8 + MTP | 29,08 GB | 1.043,79 | 61,88 | 0,42 | 4,53 |
| oQ6e + MTP | 22,94 GB | 984,09 | 57,71 | 0,44 | 4,88 |
| oQ4e + MTP | 16,60 GB | 1.277,99 | 78,98 | 0,34 | 3,58 |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 22,94 GB; se recomienda un mínimo de 32 GB de memoria unificada para dejar margen a KV cache y contexto, y 64 GB o más para contextos largos.
- Hardware medido: Mac Studio M5 Ultra con 256 GiB de memoria unificada, con 57,71 tok/s de decodificación y 984,09 tok/s de prefill en la variante oQ6e.
- GPU NVIDIA: no disponible; el formato es MLX y la librería declarada es mlx, orientada a Apple Silicon. No se documenta soporte para CUDA.
- GPU de consumo: cabe en equipos Apple Silicon de gama alta con memoria unificada suficiente (Mac Studio, MacBook Pro con 32 GB o más); no se indica compatibilidad con GPUs de consumo NVIDIA.
- Despliegue: oMLX como runtime principal, con descarga vía `hf download kakoka/Slonik-27B-oQ6e-mtp --local-dir ./Slonik-27B-oQ6e-mtp`; se debe activar Lightning MTP en los ajustes del modelo para decodificación especulativa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT de 0,44 s y tiempo total de 4,88 s para 256 tokens generados en la configuración medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kakoka/Slonik-27B-oQ6e-mtp | 27,32B | no disponible | MLX safetensors, 6 bits mixto, 22,94 GB | Apache-2.0 | Hugging Face, 0 descargas |
| tfjack/Qwen3.8-27B-oQ6e-fp16-mtp | 27B (familia) | no disponible | MLX, oQ6e con fp16, MTP | no disponible | Hugging Face |
| Jundot/Qwen3.8-27B-oQ6e-mtp | 27B (familia) | no disponible | MLX, oQ mixto (oMLX v0.6.1), MTP | no disponible | Hugging Face |
| dglhf/Slonik (BF16, 27B) | 27B (familia) | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face |

Las tres variantes cuantizadas comparten la misma familia base Qwen3.8-27B y el mismo enfoque de cuantización oQ con preservación de MTP; las diferencias principales son la versión de oMLX empleada, el tratamiento de los tensores flotantes y el tamaño resultante. No se dispone de datos de rendimiento de las variantes de tfjack y Jundot para una comparación cuantitativa.

## Limitaciones y advertencias

- Es una cuantización de 6 bits: puede producir degradación de calidad frente al checkpoint BF16 original, especialmente en tareas de razonamiento numérico o código muy sensible a la precisión.
- Solo texto: el componente multimodal del modelo base, si existe, no está incluido en esta conversión.
- La model card no declara lista de idiomas ni longitud de contexto; no se debe asumir un contexto mayor que el del modelo base sin verificar.
- Riesgo de alucinación inherente a los modelos de lenguaje; en el caso de SQL, una consulta propuesta puede ser sintácticamente válida pero semánticamente distinta, por lo que la verificación de equivalencia de resultados es obligatoria en producción.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los archivos LICENSE, NOTICE y las licencias upstream incluidas en el repositorio para cumplir la atribución.
- Dependencia del runtime oMLX y de Apple Silicon: no hay soporte documentado para CUDA, vLLM ni llama.cpp, lo que limita su despliegue en infraestructura NVIDIA.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.
- La fecha de creación indicada (2026-11-07) es posterior a la de esta ficha; conviene verificar la vigencia del checkpoint antes de usarlo.
- La benchmark se ejecutó con un único prompt en inglés y 72 casos de verificación SQL; no constituye una evaluación general de capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp
- Proyecto Slonik (modelo base): https://huggingface.co/dglhf/Slonik
- Checkpoint de origen BF16: https://huggingface.co/dglhf/Slonik/tree/321d879c39a809057f324a8133c9484e4c192c06/27B
- Documentación de cuantización oQ de oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Variante tfjack/Qwen3.8-27B-oQ6e-fp16-mtp: https://huggingface.co/tfjack/Qwen3.8-27B-oQ6e-fp16-mtp
- Variante Jundot/Qwen3.8-27B-oQ6e-mtp: https://huggingface.co/Jundot/Qwen3.8-27B-oQ6e-mtp
