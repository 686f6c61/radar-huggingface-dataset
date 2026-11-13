# mradermacher/Rutam-33B-i1-GGUF

## Resumen

Rutam-33B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Anvaya-sh/Rutam-33B, un modelo de lenguaje de aproximadamente 33.000 millones de parametros. El repositorio contiene unicamente los pesos cuantizados en formato GGUF (con y sin matriz de importancia, "imatrix"), pensados para su uso con llama.cpp y herramientas compatibles como Ollama, LM Studio o servidores basados en llama.cpp. No se trata de un modelo entrenado por mradermacher, sino de una redistribucion optimizada del modelo original de Anvaya-sh.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 33B en hardware de consumo mediante cuantizaciones agresivas (desde IQ1_S hasta Q6_K), lo que amplia el acceso a modelos de esta escala. Sin embargo, la informacion publica disponible es muy limitada: la model card del repositorio solo contiene metadatos de generacion de las cuantizaciones y un enlace al modelo base, sin detalles sobre arquitectura, datos de entrenamiento, licencia o idiomas.

La ficha se ha redactado con los datos disponibles en la informacion proporcionada. Cualquier dato no confirmado se indica explicitamente como "no disponible" para no inventar especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Rutam-33B no detalla arquitectura en la informacion proporcionada) |
| Parametros totales | ~33.000 millones (segun nombre del modelo base); el campo "parametros totales (safetensors)" del repo GGUF indica 6.767.228, dato que no corresponde al modelo completo y probablemente refleja un tensor o metadato parcial |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con y sin imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Anvaya-sh/Rutam-33B en los datos proporcionados. Por el nombre y el tamano (33B) cabe esperar un transformer denso, pero no se confirma ni el tipo de atencion, ni la existencia de componentes MoE, ni innovaciones como atencion lineal o decodificacion especulativa. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similar.

Lo unico documentado en la model card son los metadatos del proceso de cuantizacion: se han generado cuantizaciones "weighted/imatrix" (etiqueta `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, tag `nicoboss`), lo que indica que las cuantizaciones de baja bits (especialmente las de la familia IQ) se han calibrado con una matriz de importancia para reducir la perdida de calidad respecto a cuantizaciones uniformes. El repositorio incluye tanto variantes "small" como estandar para algunos niveles (por ejemplo, `small-IQ4_NL`).

## Capacidades

- Generacion de texto autoregresiva en el formato soportado por el modelo base (no se detallan capacidades especificas).
- Razonamiento, codigo y matematicas: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp, servidores compatibles con GGUF).

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~33B en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) con offload parcial, util para prototipado sin depender de APIs externas.
- Experimentacion e investigacion en entornos con recursos limitados: las variantes IQ2 e IQ3 permiten probar el comportamiento del modelo base en hardware modesto, aceptando cierta perdida de calidad a cambio de reducir el peso en disco y memoria.
- Evaluacion comparativa de cuantizaciones: al ofrecer 24 variantes, el repositorio sirve para medir el impacto de la cuantizacion (perplejidad, calidad de generacion) sobre el mismo modelo base en distintos niveles de bits.
- Procesamiento por lotes offline: integrable en pipelines de llama.cpp para tareas de generacion de texto a gran escala en servidores sin GPU dedicada, usando cuantizaciones de 4-5 bits y CPU con suficiente RAM.
- Asistentes conversacionales autoalojados: con contexto suficiente (no confirmado), puede emplearse en aplicaciones de chat privadas donde la soberania del dato impide usar servicios en la nube.
- Fine-tuning ligero posterior: aunque el repo solo distribuye GGUF, las cuantizaciones Q5_K_M y Q6_K preservan mas fidelidad respecto al modelo original y sirven como referencia para validar adaptaciones LoRA entrenadas sobre el modelo base en formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada de forma orientativa segun el tamano (~33B) y la cuantizacion (calculos estandar de bits por parametro, no confirmados por el autor):
  - IQ1_S / IQ1_M: ~6-9 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: ~9-12 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~13-16 GB
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~17-21 GB
  - Q5_K_S / Q5_K_M: ~21-24 GB
  - Q6_K: ~25-28 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4 y Q5 con offload parcial; A100 40/80 GB o H100 para Q6_K y contextos largos; RTX 3090 (24 GB) como alternativa economica para Q4.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; las variantes IQ2/IQ3 caben tambien en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) con offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, servidores basados en llama.cpp (llama-server). vLLM y TGI no consumen GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantizacion y del numero de capas offloaded a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rutam-33B-i1-GGUF (este repo) | ~33B | no disponible | no disponible | GGUF (24 cuantizaciones) | Cuantizaciones imatrix del modelo Anvaya-sh/Rutam-33B |
| Anvaya-sh/Rutam-33B | ~33B | no disponible | no disponible | safetensors (formato HF) | Modelo base del que derivan estas cuantizaciones |
| Otros modelos ~30-34B con GGUF (p. ej. familias tipo Yi-34B o CodeLlama-34B) | 30-34B | variable | variable | GGUF | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparativa cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- La informacion publica del modelo base es practicamente inexistente en los datos proporcionados: se desconocen arquitectura, contexto, datos de entrenamiento y proceso de alineacion.
- Licencia no especificada: no se puede confirmar el uso comercial. Es imprescindible verificar la licencia del modelo base Anvaya-sh/Rutam-33B antes de cualquier despliegue en produccion.
- Las cuantizaciones de muy baja bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad y la coherencia; no son recomendables para tareas de razonamiento o codigo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen para este modelo.
- Sesgos: no documentados; al desconocerse la composicion del dataset de entrenamiento no se pueden anticipar sesgos linguisticos o culturales.
- Idiomas soportados no confirmados; no se garantiza un rendimiento adecuado en castellano.
- El campo de parametros del repo (6.767.228) no coincide con el tamano nominal de 33B y debe interpretarse con cautela; probablemente sea un metadato parcial del proceso de conversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Al ser una redistribucion de terceros, la calidad depende del proceso de cuantizacion de mradermacher y no del autor original del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Rutam-33B-i1-GGUF
- Modelo base: https://huggingface.co/Anvaya-sh/Rutam-33B
