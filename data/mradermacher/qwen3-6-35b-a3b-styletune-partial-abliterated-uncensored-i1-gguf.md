# mradermacher/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored, publicado por el usuario mradermacher. Se trata de un modelo derivado de la familia Qwen3.6 con arquitectura Mixture of Experts (MoE), como indica la nomenclatura A3B (aproximadamente 3 mil millones de parametros activos por token sobre un total de 34.660.610.688 parametros, unos 34,66 mil millones). El modelo original ha sido sometido a un proceso de "StyleTune" y "Partial Abliteration", asi como a un ajuste orientado a eliminar restricciones de contenido ("Uncensored").

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde IQ1_S hasta Q6_K), lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM reducidos, manteniendo la arquitectura MoE del modelo base. El repositorio ocupa 79,0 GB e incluye 24 variantes de cuantizacion generadas con tecnicas de imatrix y weighted quants.

No se dispone de informacion sobre el pipeline, la licencia ni los idiomas soportados en los metadatos proporcionados. La model card es minima y se limita a indicar el origen de la cuantizacion y la lista de variantes generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), derivada de Qwen3.6 (transformer) |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Mixture of Experts (MoE) de tipo transformer, heredada de la familia Qwen3.6. La designacion A3B indica que, aunque el modelo contiene aproximadamente 34,66 mil millones de parametros totales, solo alrededor de 3 mil millones se activan por token durante la inferencia, lo que reduce el coste computacional en comparacion con un modelo denso del mismo tamano total.

El modelo original sobre el que se basa esta cuantizacion ha pasado por varias etapas de ajuste: un proceso de "StyleTune" (orientado a modificar el estilo de las respuestas), una "Partial Abliteration" (tecnica que busca eliminar direcciones de activacion asociadas a rechazos de contenido) y un ajuste "Uncensored" que reduce las restricciones de seguridad del modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en estas etapas.

La cuantizacion ha sido realizada por mradermacher utilizando tecnicas de imatrix y weighted quants, con la etiqueta "nicoboss" en los metadatos. Se han generado 24 variantes de cuantizacion, desde IQ1_S (la mas agresiva) hasta Q6_K (la de mayor precision), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y esta disenado para mantener dialogos multi-turno.
- Razonamiento y generacion de codigo: heredadas del modelo base Qwen3.6, aunque no se dispone de confirmacion explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "uncensored": el ajuste elimina parcialmente los mecanismos de rechazo, lo que permite generar contenido que el modelo base rechazaria.
- Capacidades de vision o audio: no disponible en la informacion proporcionada (la model card indica skip_mmproj, lo que sugiere que no se incluye proyector multimodal).

## Casos de uso

- Despliegue en hardware de consumo: gracias a las cuantizaciones de baja precision (IQ1_S, IQ2_XXS, Q3_K_S), el modelo puede ejecutarse en GPU de consumo con VRAM limitada, permitiendo experimentar con un MoE de 34,66 mil millones de parametros en equipos de gama alta para consumidores.
- Investigacion sobre alineacion y seguridad: el ajuste "abliterated" y "uncensored" lo convierte en un objeto de estudio para analizar como las tecnicas de abliteration afectan al comportamiento del modelo y a sus rechazos de contenido.
- Generacion creativa sin restricciones: util para escritura de ficcion, guiones o contenido narrativo donde el modelo base aplicaria filtros de seguridad, en entornos controlados y con supervision humana.
- Prototipado de asistentes conversacionales: la naturaleza MoE con ~3 mil millones de parametros activos permite un throughput relativamente alto en inferencia, adecuado para prototipos de chatbots en local.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes GGUF, lo que facilita estudios sobre la degradacion de calidad segun el nivel de cuantizacion en modelos MoE.
- Experimentacion con llama.cpp y Ollama: al estar en formato GGUF, el modelo se integra directamente en estos runners, permitiendo pruebas locales sin infraestructura de servidor.
- Fine-tuning posterior o merging: las cuantizaciones de mayor precision (Q5_K_M, Q6_K) pueden servir como base para experimentos de destilacion o comparacion con el modelo original sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, calculada a partir de los 34,66 mil millones de parametros):
  - IQ1_S / IQ1_M: aproximadamente 8-10 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 10-13 GB.
  - Q2_K / Q2_K_S / Q3_K_S / IQ3_XXS / IQ3_XS: aproximadamente 13-16 GB.
  - Q3_K_M / Q3_K_L / IQ3_M / IQ3_S: aproximadamente 16-18 GB.
  - Q4_0 / Q4_1 / Q4_K_S / IQ4_XS / small-IQ4_NL: aproximadamente 18-21 GB.
  - Q4_K_M / Q5_K_S: aproximadamente 21-24 GB.
  - Q5_K_M / Q6_K: aproximadamente 24-28 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40 GB o H100 para Q6_K y para mayor margen de contexto; GPUs con 12-16 GB (RTX 4070 Ti, RTX 4080) para cuantizaciones IQ2 e IQ3.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB con IQ3 o inferiores; en GPUs de 8-12 GB solo con IQ1/IQ2 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. No se recomienda vLLM ni TGI para este repositorio, ya que no incluye pesos en safetensors.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~3 mil millones de parametros activos, el throughput deberia ser superior al de un modelo denso de 34,66 mil millones, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-i1-GGUF (este modelo) | 34,66 mil millones | ~3 mil millones | no disponible | no disponible | GGUF |
| Qwen3.6-35B-A3B (modelo base, referencia) | ~35 mil millones | ~3 mil millones | no disponible | no disponible | safetensors |
| Modelo denso de ~34B (referencia generica) | ~34 mil millones | ~34 mil millones | no disponible | no disponible | varios |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y formato.

## Limitaciones y advertencias

- El ajuste "Uncensored" y la "Partial Abliteration" eliminan parcialmente los mecanismos de rechazo del modelo base, lo que puede producir contenido inapropiado, ofensivo o danino sin advertencia. No se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones de baja precision (IQ1, IQ2) donde la degradacion de pesos es significativa.
- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si se permite el uso comercial. Es responsabilidad del usuario verificar la licencia del modelo original (LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored) y del modelo base Qwen3.6.
- No se dispone de informacion sobre los idiomas soportados ni sobre la calidad en castellano.
- La longitud de contexto no esta documentada; las cuantizaciones GGUF pueden requerir configuracion manual de la ventana de contexto en llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La model card es minima y no documenta el proceso de entrenamiento, los datos utilizados ni las evaluaciones de calidad.
- El proceso de abliteration puede degradar capacidades generales del modelo (razonamiento, instruction following) de forma no documentada.
- Al ser una cuantizacion, los resultados pueden diferir de los del modelo original en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-i1-GGUF
- Modelo original (referencia en la model card): https://huggingface.co/LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
