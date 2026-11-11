# scottlowry/Qwen3.6-35B-A3B-oQ5e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ5e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la librería MLX de Apple, pensada para ejecutar el modelo base en hardware Apple Silicon con un coste de memoria reducido. El checkpoint conserva la arquitectura original MoE (mezcla de expertos) del modelo Qwen, con 35.951.822.704 parámetros totales según los safetensors del repositorio, e incorpora la cabeza MTP (multi-token prediction) del modelo original.

La relevancia de esta ficha es práctica: permite a desarrolladores que trabajan en Mac con chip de la serie M ejecutar un modelo de ~36.000 millones de parámetros con un peso efectivo de 5,985 bits por parámetro, lo que reduce el almacenamiento a unos 25 GiB lógicos (26,9 GB) frente a los ~72 GB que ocuparía en FP16. La cuantización la realizó la herramienta oQ (oMLX v0.7.3.dev2) con precisión mixta, asignando 5 bits a la mayor parte de los pesos del lenguaje, 8 bits a una fracción pequeña y manteniendo en FP16/FP32 los componentes sensibles (visión y algunos tensores).

El repositorio tiene 78 descargas y 0 likes en el momento de la consulta, y la model card no documenta benchmarks, licencia ni idiomas. Toda la información técnica disponible procede de los metadatos de Hugging Face y de la propia model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) transformer, segun el tag `qwen3_5_moe`; incluye torre de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 5-bit (grupo 128 y 64), affine 6-bit (grupo 64), affine 8-bit (grupo 128 y 64), FP16 y FP32; media efectiva 5,985 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`), cuantizacion `oq` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), tal como indica el tag `qwen3_5_moe` del repositorio. El checkpoint cuantizado conserva tres componentes diferenciados según el desglose de almacenamiento del autor: el modelo de lenguaje (34,661B parámetros lógicos, 22,822 GiB), la torre de visión (0,447B parámetros, 1,664 GiB en FP32) y la cabeza MTP de predicción multi-token (0,845B parámetros, 0,562 GiB). La presencia de visión y MTP confirma que el modelo base es multimodal y que soporta decodificación especulativa mediante predicción de varios tokens.

No se dispone de información sobre el entrenamiento del modelo base en la documentación proporcionada: no se indican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. La única información técnica verificable es la relativa al proceso de cuantización: oQ (oMLX v0.7.3.dev2) aplica precisión mixta, asignando 5 bits con grupo 64 al 91,838% de los pesos lógicos, 5 bits con grupo 128 al 0,700%, 6 bits al 1,745%, 8 bits al 4,388% y manteniendo en FP16 (0,086%) y FP32 (1,242%) los tensores más sensibles. El autor indica que la versión actual fue re-cuantizada el 2026-10-25 y recomienda volver a descargar si se tenía una copia anterior.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones específicas en esta conversión.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0,447B parámetros en FP32, por lo que el modelo base es multimodal imagen-texto.
- Predicción multi-token (MTP): la cabeza MTP de 0,845B parámetros permite decodificación especulativa y generación de varios tokens por paso, lo que puede aumentar el throughput en inferencia.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización a ~6 bits permiten ejecutar un modelo de ~36.000 millones de parámetros en Macs con memoria unificada de 32 GB o superior, algo inviable con los pesos FP16 originales (~72 GB). Es el caso de uso principal de esta conversión.
- Prototipado de asistentes multimodales en local: la torre de visión incluida permite experimentar con tareas imagen-texto (descripción de imágenes, extracción de información de capturas) sin depender de APIs externas, siempre que el runtime MLX soporte el componente visual.
- Aceleración de la generación con MTP: la cabeza de predicción multi-token puede aprovecharse en pipelines de decodificación especulativa para reducir la latencia en generación de texto largo, útil en aplicaciones interactivas de escritura asistida.
- Investigación sobre cuantización mixta: el desglose detallado de bits por componente (5/6/8/FP16/FP32) sirve como caso de estudio para estudiar el impacto de la precisión mixta en modelos MoE con visión.
- Evaluación comparativa de modelos Qwen en hardware de consumo: permite medir calidad y velocidad de un MoE de ~36B en un Mac frente a alternativas densas o cuantizaciones GGUF en el mismo equipo.
- Desarrollo offline y entornos con restricciones de privacidad: al ejecutarse localmente sin llamadas de red, encaja en flujos donde los datos no pueden salir del dispositivo, como análisis de documentos internos o prototipos en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 26,895 GB (25,048 GiB) en disco; en inferencia se necesita memoria adicional para el contexto KV y el runtime, por lo que se recomienda al menos 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con memoria unificada (serie M1/M2/M3/M4 Pro, Max o Ultra). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? Sí, en Macs con 32 GB o más de memoria unificada. En GPUs de consumo tipo RTX 4090 (24 GB) no es directamente usable por el formato MLX, y en cualquier caso el checkpoint completo supera los 24 GB.
- Opciones de despliegue: `mlx-lm` / runtime MLX de Apple; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Qwen3.6-35B-A3B-oQ5e-fp16-mtp | 35,95B (MoE) | no disponible | safetensors MLX, ~6 bits | no disponible | Cuantizacion mixta oQ, incluye vision y MTP |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B (MoE) | no disponible | safetensors FP16/BF16 | no disponible | Modelo original sin cuantizar; ~72 GB en FP16 |
| Otras cuantizaciones GGUF del mismo base | 35,95B (MoE) | no disponible | GGUF | segun autor | Ejecutables en llama.cpp/Ollama, no en MLX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; antes de un uso comercial hay que verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B en su propia ficha.
- Es una cuantizacion a ~6 bits: puede producir degradación de calidad respecto al modelo FP16, especialmente en tareas de razonamiento matemático o código, aunque no se documenta ninguna evaluación al respecto.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA ni a servidores x86 convencionales.
- La model card no documenta sesgos, idiomas soportados ni comportamiento en contextos largos; no hay garantías publicadas sobre alucinación.
- El autor advirtió de una re-cuantización el 2026-10-25; copias descargadas antes de esa fecha pueden diferir de la versión actual.
- El repositorio tiene muy poca tracción (78 descargas, 0 likes) y no procede del equipo oficial de Qwen, por lo que no cuenta con el mismo nivel de soporte ni validación que el modelo base.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el soporte de tool calling en esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
