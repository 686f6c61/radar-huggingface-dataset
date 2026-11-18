# mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `symmetrisch/Qwen3.8-27B-Heretic2.1.0`. No se trata de un modelo original, sino de una distribucion de pesos cuantizados en multiples niveles (desde IQ1_S hasta Q6_K) pensada para su uso con llama.cpp y derivados. El nombre sugiere un modelo de la familia Qwen3 con aproximadamente 27.000 millones de parametros y un ajuste fino de tipo "abliterated" o "uncensored" (terminologia "Heretic"), aunque esta informacion no esta confirmada por la model card.

La relevancia de este repositorio es practica: ofrece versiones comprimidas del modelo base para despliegue en hardware con recursos limitados. Sin embargo, la informacion disponible es muy escasa: no hay model card tecnica, no se declaran licencia, idiomas ni pipeline, y el repositorio registra cero descargas y cero likes en el momento de la consulta. El dato de parametros totales reportado (6.789.424) es inconsistente con el nombre del modelo (27B) y probablemente corresponde a un unico tensor o a un error de metadatos, no al total del modelo.

Por tanto, esta ficha debe leerse como una descripcion del artefacto de cuantizacion y de sus implicaciones de despliegue, no como una evaluacion del modelo base, cuyas caracteristicas tecnicas no estan documentadas en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer de la familia Qwen3) |
| Parametros totales | no disponible de forma fiable (el nombre indica 27B; el metadato safetensors reporta 6.789.424, inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre `Qwen3.8-27B-Heretic2.1.0` sugiere una variante de la familia Qwen3 con 27.000 millones de parametros y un ajuste de alineacion orientado a reducir rechazos ("Heretic"), pero no hay confirmacion tecnica de si se trata de un transformer denso o de una arquitectura MoE, ni de la composicion del dataset de entrenamiento, el numero de tokens o las tecnicas de alineacion empleadas (RLHF, DPO, etc.).

Lo unico documentado es el proceso de cuantizacion: los metadatos del repositorio indican `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y el uso de cuantizaciones ponderadas con matriz de importancia (imatrix), lo que mejora la calidad de los niveles bajos de bits respecto a cuantizaciones uniformes. El repositorio base empleado es `symmetrisch/Qwen3.8-27B-Heretic2.1.0`.

## Capacidades

- Generacion de texto y razonamiento: presumiblemente heredadas del modelo base, aunque no documentadas en la informacion disponible.
- Generacion de codigo y matematicas: no confirmado en la documentacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.
- Modo "uncensored" / reduccion de rechazos: sugerido por el nombre "Heretic", sin confirmacion tecnica.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten ejecutar un modelo de ~27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, a costa de cierta perdida de calidad frente a los pesos originales.
- Inferencia en CPU con memoria limitada: los niveles IQ2 e IQ3 reducen el peso a aproximadamente 8-12 GB, lo que posibilita ejecucion en servidores sin GPU, con latencia mayor y calidad degradada.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye un rango amplio de niveles (de IQ1_S a Q6_K), lo que permite medir el impacto de la compresion en tareas concretas antes de fijar un nivel para produccion.
- Prototipado de asistentes conversacionales sin censura: si el ajuste "Heretic" cumple lo que sugiere el nombre, seria util para investigacion sobre comportamiento de modelos con filtros reducidos, siempre que la licencia del modelo base lo permita.
- Integracion en pipelines con llama.cpp o servidores compatibles (llama-server, Ollama): el formato GGUF es directamente consumible por estas herramientas, lo que facilita pruebas rapidas sin infraestructura de GPU dedicada.
- Fine-tuning posterior sobre pesos cuantizados: no recomendado en general, pero algunos flujos permiten QLoRA sobre GGUF de 4 bits para adaptaciones ligeras en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~27B, estimaciones orientativas segun nivel de cuantizacion):
  - IQ1_S / IQ1_M: aproximadamente 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: aproximadamente 8-11 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 11-14 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: aproximadamente 14-17 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 17-20 GB.
  - Q6_K: aproximadamente 20-23 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K con contexto largo; GPUs de 16 GB (RTX 4060 Ti, RTX 4080) limitadas a niveles IQ3 o IQ4 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 para niveles Q4-Q5; en GPUs de 12-16 GB solo con niveles IQ2-IQ3.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para GGUF, aunque vLLM soporta algunos formatos GGUF de forma experimental.
- Latencia y throughput: no disponibles. Dependeran del nivel de cuantizacion, del hardware y del backend; en una RTX 4090 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni caracteristicas del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base `symmetrisch/Qwen3.8-27B-Heretic2.1.0` antes de cualquier despliegue en produccion.
- El metadato de parametros totales (6.789.424) es incompatible con el nombre del modelo (27B); no debe usarse para dimensionar hardware.
- Las cuantizaciones de 1-3 bits (IQ1, IQ2, IQ3) degradan de forma notable la calidad, especialmente en razonamiento y codigo; no son adecuadas para produccion sin evaluacion previa.
- Un ajuste de tipo "Heretic" implica filtros de seguridad reducidos; existe riesgo de generar contenido inapropiado, lo que exige moderacion adicional en cualquier aplicacion expuesta a usuarios.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable un comportamiento similar al del modelo base, sin datos que lo cuantifiquen.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no declarados; no se puede asumir un rendimiento multilingue concreto.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- No hay model card tecnica ni resultados de evaluacion publicados por el autor de la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0
