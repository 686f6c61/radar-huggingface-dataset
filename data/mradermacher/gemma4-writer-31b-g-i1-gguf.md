# mradermacher/Gemma4-Writer-31B-G-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Gemma4-Writer-31B-G-i1-GGUF`, un conjunto de cuantizaciones en formato GGUF del modelo `ConicCat/Gemma4-Writer-31B-G`, publicadas por el usuario mradermacher, especializado en la generacion de versiones cuantizadas de modelos abiertos. El modelo subyacente es un ajuste fino orientado a la escritura sobre la arquitectura Gemma 4 de Google DeepMind, con 30.697.345.596 parametros (aproximadamente 30,7B).

La relevancia de esta publicacion radica en que permite ejecutar un modelo de ~31B en hardware local mediante llama.cpp y herramientas compatibles, algo que no es viable con los pesos originales en precision completa. El repositorio incluye 23 variantes de cuantizacion que abarcan desde tecnicas de muy baja precision (IQ1_S, IQ1_M, Q2_K) hasta Q6_K, generadas con el metodo de cuantizacion ponderada por imatrix, que busca preservar mejor la calidad del modelo al reducir el ancho de bits.

No se dispone de informacion sobre licencia, idiomas soportados ni resultados de benchmarks en la documentacion proporcionada, y el modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; no se especifica si la variante de 31B es densa o MoE) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible (depende del modelo base `ConicCat/Gemma4-Writer-31B-G` y de Gemma 4 de Google) |
| Formato de pesos | GGUF (imatrix/weighted), `convert_type: hf` |
| Tamano del repositorio | 26,4 GB |
| Metodo de cuantizacion | imatrix (importancia ponderada) |

## Arquitectura y entrenamiento

El modelo del que derivan estas cuantizaciones pertenece a la familia Gemma 4 de Google DeepMind, presentada en el informe tecnico de Gemma 4 como una nueva generacion de modelos de pesos abiertos, nativamente multimodales, con arquitecturas densas y de mezcla de expertos (MoE) en un rango de 2,3B a 31B parametros. Este ajuste concreto, `Gemma4-Writer-31B-G`, es una variante afinada por el usuario ConicCat con orientacion a la escritura; los detalles exactos de su entrenamiento no se documentan en la informacion disponible.

La ficha solo aporta metadatos tecnicos de la cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y el uso de cuantizacion ponderada por imatrix. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. La cuantizacion imatrix es la innovacion tecnica relevante de esta publicacion: consiste en calcular una matriz de importancia a partir de estadisticas de activaciones para asignar mas precision a los tensores mas sensibles, mejorando la relacion calidad/tamano frente a la cuantizacion uniforme.

## Capacidades

- Generacion de texto y redaccion: el ajuste esta orientado a tareas de escritura (el nombre `Writer` lo indica), por lo que cabe esperar buen desempeno en generacion de prosa, reescritura y estilismo, si bien no hay evaluaciones publicadas que lo confirmen.
- Uso conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta preparado para dialogos multi-turno.
- Capacidades multimodales: el informe tecnico de Gemma 4 describe la familia como nativamente multimodal, pero no se confirma que este ajuste de escritura conserve tal capacidad ni que el proyector multimodal (`mmproj`) este incluido (el campo `skip_mmproj` aparece vacio, sin datos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible para este modelo; la variante hermana `Gemma4-Writer-31B-D-i1-GGUF` aparece etiquetada como `English`.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Redaccion asistida en local: al poder ejecutarse cuantizado, el modelo puede desplegarse en una estacion de trabajo sin enviar datos a servicios externos, util para redactar articulos, informes o documentacion de contenido sensible.
- Generacion de contenido editorial: con un ajuste especifico para escritura, resulta adecuado para borradores de blogs, boletines y textos de marketing que luego revise un editor humano.
- Asistentes conversacionales autoalojados: la etiqueta `conversational` y el formato GGUF lo hacen apto para integrarse en interfaces de chat locales (por ejemplo, con Ollama o LM Studio) en entornos con requisitos de privacidad.
- Prototipado y evaluacion de cuantizaciones: dado que el repositorio ofrece 23 variantes, permite a investigadores comparar el impacto de distintos niveles de cuantizacion (por ejemplo, Q4_K_M frente a Q6_K) sobre la calidad de salida en una tarea de escritura concreta.
- Pipelines de traduccion o reescritura con control de coste: al ejecutarse en hardware propio, el coste marginal por token es practicamente nulo, lo que lo hace viable para procesar volumenes elevados de texto sin depender de APIs de pago.
- Experimentacion en investigacion sobre modelos de ~31B: sirve como banco de pruebas para estudiar el equilibrio entre calidad y requisitos de memoria en modelos de tamano medio-alto, comparando la variante `G` con la variante `D` y con `copywriter-gemma4-31b`.
- Despliegue en entornos con conectividad limitada o air-gapped: al ser pesos GGUF autocontenidos, puede operarse sin acceso a internet una vez descargado, adecuado para instalaciones aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (30,7B) y del ancho de bits tipico de cada cuantizacion; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - IQ1_M / IQ1_S: aproximadamente 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: aproximadamente 8-11 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M: aproximadamente 12-15 GB.
  - Q3_K_L / IQ4_XS / IQ4_NL / Q4_0 / Q4_K_S: aproximadamente 16-18 GB.
  - Q4_1 / Q4_K_M: aproximadamente 19-20 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 21-22 GB.
  - Q6_K: aproximadamente 25-26 GB.
  - Precision completa (FP16/BF16): aproximadamente 62 GB.
- GPU recomendadas: para las cuantizaciones altas (Q5_K_M, Q6_K), una A100 40/80 GB, H100 o RTX 6000 Ada (48 GB); para cuantizaciones medias (Q4_K_M), una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Compatibilidad con GPU de consumo: si. Una RTX 4090 o RTX 3090 de 24 GB ejecuta con comodidad cuantizaciones hasta Q4_K_M (dejando margen para el contexto). Tarjetas de 12-16 GB (RTX 4080, 4070 Ti, 3080) pueden ejecutar cuantizaciones de la gama Q3 y Q2, con perdida notable de calidad. Las cuantizaciones IQ1 e IQ2 caben en GPUs de 8-10 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (oobabooga) y servidores compatibles con el endpoint de OpenAI gracias a la etiqueta `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa (vLLM requiere conversion o soporte experimental), por lo que no son la via recomendada para estos pesos.
- Latencia y throughput: no disponibles. Dependeran del hardware, del nivel de cuantizacion y del uso de offload parcial a CPU mediante `n_gpu_layers`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Gemma4-Writer-31B-G-i1-GGUF (este) | ~30,7B | GGUF (23 quants) | Escritura / conversacional | no disponible | Variante `G` cuantizada con imatrix |
| mradermacher/Gemma4-Writer-31B-D-i1-GGUF | no disponible | GGUF | Escritura | no disponible | Variante `D`; etiquetada como `English` |
| mradermacher/copywriter-gemma4-31b-i1-GGUF | no disponible | GGUF | Copywriting | no disponible | Ajuste orientado a textos publicitarios |
| Gemma 4 (Google DeepMind), base de 31B | hasta 31B | safetensors | Multimodal generalista | licencia de Gemma 4 (no confirmada en la informacion) | Familia densa y MoE, 2,3B-31B |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada; la comparacion se limita a formato, enfoque y disponibilidad.

## Limitaciones y advertencias

- Licencia no especificada: la ficha no declara licencia. Antes de un uso comercial es imprescindible verificar la licencia del modelo base `ConicCat/Gemma4-Writer-31B-G` y la de Gemma 4 de Google, que puede imponer restricciones de uso.
- Procedencia poco documentada: al ser una cuantizacion de un ajuste fino de terceros, no se conocen los datos de entrenamiento, el proceso de alineacion ni las evaluaciones del modelo original, lo que dificulta estimar su fiabilidad.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada con aparente seguridad; no se ha publicado ninguna evaluacion de fidelidad.
- Perdida de calidad por cuantizacion: las variantes de menor precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad de salida; para produccion conviene usar Q4_K_M o superior.
- Idiomas: no se declaran idiomas soportados. La variante hermana `D` figura como `English`, por lo que el soporte multilingue de esta variante `G` es incierto y deberia validarse antes de usarla en castellano.
- Estado del repositorio: con 0 descargas y 0 likes, no existe validacion por parte de la comunidad sobre la calidad o la integridad de los archivos.
- Contexto desconocido: al no especificarse la longitud de contexto, no puede garantizarse el rendimiento en tareas de contexto largo.
- Capacidades multimodales inciertas: aunque la familia Gemma 4 es multimodal segun el informe tecnico, no se confirma que este ajuste de escritura mantenga vision u otras modalidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Gemma4-Writer-31B-G-i1-GGUF
- Modelo base (ajuste fino): https://huggingface.co/ConicCat/Gemma4-Writer-31B-G
- Variante hermana D: https://huggingface.co/mradermacher/Gemma4-Writer-31B-D-i1-GGUF
- Variante copywriter: https://huggingface.co/mradermacher/copywriter-gemma4-31b-i1-GGUF
- Ficha en Inferix: https://inferix.co/models/mradermacher/copywriter-gemma4-31b-i1-GGUF
- Informe tecnico de Gemma 4 (arXiv): https://arxiv.org/pdf/2607.02770v1
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
