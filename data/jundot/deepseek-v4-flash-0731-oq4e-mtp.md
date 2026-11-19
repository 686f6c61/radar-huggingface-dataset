# Jundot/DeepSeek-V4-Flash-0731-oQ4e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ4e-mtp es una cuantizacion mixta de precision del checkpoint oficial deepseek-ai/DeepSeek-V4-Flash-0731, publicada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es la version "Flash" de DeepSeek-V4 orientada a capacidades agenticas, y conserva tanto el backbone del modelo de lenguaje como los pesos del modulo de decodificacion especulativa DSpark MTP (multi-token prediction) que acompanan a la release oficial. El resultado es un checkpoint en formato MLX pensado para ejecucion en hardware Apple Silicon, con un peso efectivo medio de 4,361 bits por parametro.

El modelo cuenta con 304.180 millones de parametros totales (284.335 en el backbone y 19.846 en la cabeza MTP) y un repositorio de 176,5 GB, que se reduce a 154,44 GiB de almacenamiento efectivo tras la cuantizacion. La estrategia oQ4e asigna bits por sensibilidad medida de cada capa: el 97,4 % de los pesos queda en MXFP4 con grupo 32, mientras que un 2,056 % se preserva en MXFP8 y pequenas fracciones en affine 8-bit, BF16 y FP32 para proteger las capas mas sensibles. Esto permite mantener calidad cercana al modelo original con una huella de memoria mucho menor.

Su relevancia actual radica en que hace viable en equipos Apple Silicon un modelo de escala 300B que de otro modo requeriria multiples aceleradores de datacenter, y ademas incluye la cabeza MTP para decodificacion especulativa, lo que mejora el throughput de generacion. La licencia MIT, heredada del modelo fuente, elimina fricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deepseek_v4) con modulo de decodificacion especulativa DSpark MTP; checkpoint cuantizado en MLX |
| Parametros totales | 304.180.418.494 (304,18B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ4e: MXFP4 grupo 32, MXFP8 grupo 32, affine 8-bit grupo 64, BF16, FP32; media efectiva 4,361 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia DeepSeek-V4 en su variante Flash, con un backbone de 284.335B parametros logicos y una cabeza MTP de 19.846B que implementa prediccion multi-token para decodificacion especulativa (DSpark). Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original; esos datos corresponden a la model card de deepseek-ai/DeepSeek-V4-Flash-0731, que no se ha proporcionado.

La innovacion tecnica de este checkpoint es el proceso de cuantizacion oQ4e aplicado con oMLX 0.8.0. oQ asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados. La distribucion resultante concentra 296,353B pesos en MXFP4 (146,625 GiB), 6,254B en MXFP8 (6,006 GiB) y 1,369B en affine 8-bit (1,354 GiB), con residuales en BF16 e FP32. La version actual (actualizada el 2026-11-19) re-cuantiza con el redondeo oQe refinado, que reduce el error de cuantizacion a igual tamano y velocidad.

## Capacidades

- Generacion de texto y razonamiento: el modelo base DeepSeek-V4-Flash esta orientado a tareas de razonamiento y generacion, segun la descripcion del autor.
- Capacidades agenticas mejoradas: la release oficial del modelo base se describe como "enhanced agentic capabilities", por lo que se espera soporte para flujos de agente.
- Decodificacion especulativa: incluye la cabeza MTP DSpark, que acelera la generacion mediante prediccion multi-token.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Razonamiento multi-paso y agentes: plausible por la orientacion agentica del modelo base, aunque sin detalle en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX permite ejecutar un modelo de 304B parametros en equipos Mac con memoria unificada suficiente, sin necesidad de GPUs de datacenter, gracias a la cuantizacion a 4,36 bits/peso.
- Asistentes de codigo en estacion de trabajo: integrable en entornos de desarrollo sobre macOS mediante la libreria MLX, aprovechando la decodificacion especulativa MTP para reducir la latencia por token en autocompletado y generacion de funciones.
- Prototipado de agentes: la orientacion agentica del modelo base y la cabeza MTP lo hacen adecuado para experimentar con pipelines de razonamiento multi-paso y llamadas a herramientas en local antes de desplegar en produccion.
- Investigacion sobre cuantizacion: sirve como referencia practica para estudiar el impacto de la cuantizacion mixta oQ4e (MXFP4/MXFP8/affine) en la calidad de un modelo de gran escala, comparando contra el checkpoint BF16 original.
- Procesamiento por lotes offline: tareas de generacion de texto de gran volumen en un unico equipo Apple, donde el throughput importa mas que la latencia interactiva y el coste energetico es relevante.
- Evaluacion de decodificacion especulativa: la inclusion de los pesos MTP permite medir empíricamente la ganancia de velocidad de DSpark frente a decodificacion autoregresiva estandar en MLX.
- Despliegue con licencia permisiva: al heredar MIT, puede integrarse en productos comerciales sin obligaciones de atribucion complejas, sujeto a las condiciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de cuantizacion (bits efectivos por peso y desglose de almacenamiento), no evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 176,5 GB; el checkpoint efectivo son 154,44 GiB (165,829 GB), mas overhead de carga.
- VRAM/memoria unificada estimada: se necesita al menos ~155-165 GiB de memoria unificada para cargar los pesos completos en MLX; no cabe en ninguna GPU de consumo ni en Mac con menos de 192 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada alta (Mac Studio o Mac Pro con 192 GB o mas). No es un checkpoint para CUDA; requiere el runtime MLX.
- ¿Cabe en GPU de consumo? No. Tampoco en A100 de 80 GB ni H100 de 80 GB en una sola unidad; requeriria multiples aceleradores, y ademas el formato es MLX, no compatible directamente con CUDA.
- Opciones de despliegue: libreria MLX (mlx-lm) en macOS; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, que esperan otros formatos (GGUF, safetensors estandar para transformers).
- Latencia y throughput: no disponible; depende del hardware Apple concreto y de si se activa la decodificacion especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-oQ4e-mtp (este) | 304,18B | no disponible | 4,361 bits/peso (mixta oQ4e) | MIT | MLX (safetensors) |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 304,18B (mismo backbone + MTP) | no disponible | BF16 (original) | MIT | safetensors (transformers) |
| DeepSeek-V4-Flash-DSpark | misma estructura que el base | no disponible | no disponible | no disponible | no disponible |

La comparacion principal es contra el checkpoint original en BF16: este modelo reduce el almacenamiento de ~600 GB (estimacion a 16 bits para 304B) a 154,44 GiB, a costa de una perdida de precision controlada por capa. No se dispone de datos de benchmarks ni de otros modelos cuantizados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: aunque oQ4e preserva capas sensibles en 8 y 16 bits, el 97,4 % de los pesos esta en 4 bits, lo que puede degradar tareas de razonamiento fino o matematicas respecto al BF16 original.
- Dependencia de hardware Apple: el formato MLX no es portable a CUDA ni a la mayoria de stacks de servidor; limita su uso a macOS con Apple Silicon y memoria unificada elevada.
- Requisito de memoria muy alto: ~155-165 GiB de memoria unificada; no ejecutable en la mayoria de equipos.
- Idiomas y contexto: no se dispone de informacion sobre cobertura linguistica ni longitud de contexto; no asumir capacidades multilingues o de contexto largo sin verificar contra el modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de gran escala; no se aportan datos especificos de mitigacion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; deben evaluarse contra la model card del modelo base.
- Licencia: MIT heredada del modelo fuente, permisiva para uso comercial; conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- Versionado: la model card advierte que la version actual (2026-11-19) re-cuantiza con oQe refinado; copias anteriores deben descargarse de nuevo para obtener la mejora.
- Compatibilidad de tooling: al ser un checkpoint MLX, no funciona con vLLM, llama.cpp, Ollama ni TGI sin conversion.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ4e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- PR oQe mejorado: https://github.com/jundot/omlx/pull/4930
- PR refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
