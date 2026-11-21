# mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF

## Resumen

`mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF` es una distribucion de pesos en formato GGUF del modelo `3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated`, una variante "abliterated" (sin las capas de rechazo habituales del ajuste de instrucciones) de un modelo de la familia Gemma 4 con 11.907.350.576 parametros totales, aproximadamente 12 mil millones. El autor de la cuantizacion es mradermacher, un conocido publicador de quants GGUF en Hugging Face, que en este caso no ha entrenado el modelo sino que ha generado versiones estaticas K-quant e IQ-quant a partir de los pesos originales en safetensors.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de ~12B en hardware de consumo gracias a las cuantizaciones de 4 a 8 bits, con tamanos que van de 4,9 GB (Q2_K) a 12,8 GB (Q8_0). Por otro lado, la naturaleza "abliterated" implica que se han eliminado o atenuado los mecanismos de rechazo del modelo original, lo que cambia radicalmente el perfil de seguridad y las consideraciones de uso en produccion.

El repositorio incluye ademas complementos multimodales (`mmproj`) en f16 y Q8_0, lo que sugiere que el modelo base tiene capacidad de vision, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento. La licencia declarada es Apache 2.0, y el idioma soportado segun los metadatos es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4, presumiblemente transformer decoder-only; no confirmado en la informacion) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre del modelo (`gemma-4-12b-it`) sugiere que se trata de un modelo de la familia Gemma 4 en su variante instruction-tuned, con aproximadamente 12 mil millones de parametros, pero la model card del repositorio GGUF no incluye detalles sobre el tipo de transformer, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion. Tampoco se documenta el proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO).

Lo que si es identificable es el proceso de "abliteration", que consiste en la modificacion de los pesos del modelo para reducir o eliminar el comportamiento de rechazo aprendido durante el ajuste de instrucciones y el alineamiento. Esta tecnica suele implicar la identificacion de direcciones en el espacio de activaciones asociadas al rechazo y su proyeccion fuera de los pesos, lo que altera el comportamiento del modelo sin reentrenamiento completo. La model card no especifica la metodologia exacta empleada por el autor original `3MPER0RR`.

La cuantizacion la ha realizado mradermacher con su pipeline habitual, que segun los metadatos internos usa `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion desde pesos Hugging Face a GGUF y cuantizacion estatica de tensores. Se ofrecen tambien quants con imatrix en un repositorio separado (`mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF`), que suelen ofrecer mejor calidad por tamano que los quants estaticos equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de instrucciones (`it`).
- Capacidad multimodal probable: el repositorio incluye ficheros `mmproj` (multi-modal projection) en f16 y Q8_0, lo que indica soporte de entrada de imagenes en el modelo base, aunque no se detalla en la model card.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible, pero esperable en un modelo instruction-tuned de ~12B de la familia Gemma.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- Comportamiento "abliterated": ausencia o atenuacion de rechazos, lo que permite generar contenido que el modelo original rechazaria.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.

## Casos de uso

- Inferencia local en hardware de consumo: con Q4_K_M (7,5 GB) el modelo cabe en GPUs con 8-12 GB de VRAM, como una RTX 3060 de 12 GB o una RTX 4070, permitiendo conversacion en local sin dependencia de la nube.
- Investigacion sobre alineamiento y seguridad: la variante abliterated es util para estudiar como se comporta un modelo sin capas de rechazo, comparar respuestas con el modelo original y analizar sesgos residuales en entornos controlados.
- Generacion de texto creativo sin restricciones de contenido: escritura de ficcion, guiones o material narrativo que el modelo original podria rechazar por sus filtros de seguridad, siempre que el uso cumpla la legalidad aplicable.
- Prototipado rapido de asistentes conversacionales en ingles: el formato GGUF permite integrarlo en llama.cpp u Ollama con una sola linea de comando, ideal para validar flujos de chat antes de invertir en infraestructura mayor.
- Experimentacion multimodal en local: los ficheros `mmproj` permiten probar entrada de imagenes con llama.cpp, util para prototipos de descripcion de imagenes o VQA en ingles.
- Analisis de robustez de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de las respuestas y elegir el punto de equilibrio entre VRAM y fidelidad.
- Despliegue en entornos air-gapped: al ser pesos GGUF descargables y ejecutables sin conexion, encaja en escenarios con requisitos de confidencialidad donde no se puede usar una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,2 GB
  - Q3_K_L: ~6,7 GB
  - IQ4_XS: ~6,8 GB
  - Q4_K_S: ~7,1 GB
  - Q4_K_M: ~7,5 GB
  - Q5_K_S: ~8,4 GB
  - Q5_K_M: ~8,6 GB
  - Q6_K: ~9,9 GB
  - Q8_0: ~12,8 GB
  - Complementos multimodales: mmproj-f16 ~0,2 GB, mmproj-Q8_0 ~0,3 GB
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB.
  - Profesional: A100 40/80 GB, H100 80 GB (sobredimensionadas para un modelo de este tamano, utiles para batched inference).
- Cabe en GPU de consumo: si. Q4_K_M (~7,5 GB) cabe en GPUs de 8 GB con contexto corto y en GPUs de 12 GB con holgura. Q8_0 (~12,8 GB) requiere 16 GB o mas para dejar espacio al contexto KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiqueta `text-generation-inference`), y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y la longitud de contexto; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF | ~11,9B | no disponible | apache-2.0 | GGUF | Variante abliterated, solo ingles, con mmproj |
| 3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated | ~11,9B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF | ~11,9B | no disponible | apache-2.0 | GGUF (imatrix) | Mismo modelo con quants ponderados por imatrix, mejor calidad por tamano |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Naturaleza "abliterated": el modelo ha sido modificado para eliminar o atenuar los rechazos, lo que implica que puede generar contenido danino, sesgado o inapropiado sin las salvaguardas del modelo original. No es apto para aplicaciones de cara al publico sin filtros externos.
- Solo ingles: los metadatos declaran `language: en`; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo generativo de ~12B, puede inventar datos, citas y hechos.
- Sesgos conocidos: no documentados en la model card, pero heredados del corpus de entrenamiento del modelo base Gemma 4 y potencialmente amplificados por la eliminacion de rechazos.
- Longitud de contexto desconocida: no se especifica en la informacion disponible, lo que impide planificar cargas con contextos largos.
- Licencia: Apache 2.0 declarada en el repositorio GGUF, pero conviene verificar la licencia del modelo base original, ya que los modelos Gemma de Google suelen tener terminos de uso especificos que pueden no coincidir con Apache 2.0.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, ni para el modelo base ni para las cuantizaciones, por lo que la calidad real es desconocida.
- Modelo de nicho: 1003 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria extensa.
- Uso comercial: la licencia Apache 2.0 lo permitiria en principio, pero la condicion abliterated y la posible herencia de terminos del modelo base hacen recomendable una revision legal antes de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated
- Quants con imatrix: https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-12b-it-3MPER0RR-abliterated-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
