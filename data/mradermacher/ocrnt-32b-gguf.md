# mradermacher/OCRNT-32b-GGUF

## Resumen

OCRNT-32b-GGUF es la versión cuantizada en formato GGUF del modelo OCRNT-32b, publicada por el usuario mradermacher (conocido por distribuir cuantizaciones de terceros) y no por el autor original del modelo. El modelo base es Compumacy/OCRNT-32b, un modelo de aproximadamente 32.763.876.352 parámetros (unos 32,76 mil millones) orientado a tareas de código y razonamiento, según los tags y el dataset declarado (nvidia/OpenCodeReasoning). Este repositorio concreto aporta únicamente los pesos en GGUF para su uso en la familia de herramientas llama.cpp, no el modelo original.

El modelo está pensado para generar y razonar sobre código, apoyándose en el dataset NVIDIA OpenCodeReasoning, que combina ejemplos de programación con trazas de razonamiento. Está etiquetado como conversacional y compatible con endpoints, pero no se especifica en la información disponible su arquitectura interna, su longitud de contexto ni los detalles de su entrenamiento (número de tokens, composición del dataset, técnicas de alineación). El repositorio tiene 238 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha radica en que ofrece pesos ejecutables en hardware de consumo gracias a las cuantizaciones de 2 a 8 bits (desde 12,4 GB hasta 34,9 GB), con licencia Apache 2.0, lo que facilita su despliegue en local para tareas de asistencia y generación de código. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada) |
| Parametros totales | 32.763.876.352 (~32,76 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base original en safetensors, segun parametros declarados) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Compumacy/OCRNT-32b en los datos proporcionados: no se especifica si es un transformer denso, un modelo de mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o un diseno hibrido. Tampoco se documentan la longitud de contexto, el numero de capas, la dimension oculta ni la estrategia de atencion. El unico dato estructural fiable es el numero total de parametros (32.763.876.352) y su naturaleza conversacional.

Respecto al entrenamiento, la model card solo declara el uso del dataset nvidia/OpenCodeReasoning, orientado a razonamiento sobre codigo. No se detalla el volumen de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Este repositorio en concreto no aporta entrenamiento adicional: se trata de una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) de los pesos del modelo base, con cuantizaciones ponderadas/imatrix no disponibles segun el autor.

## Capacidades

- Generacion de texto conversacional y asistencia en tareas de codigo.
- Razonamiento sobre problemas de programacion, apoyado en el dataset NVIDIA OpenCodeReasoning.
- Generacion y explicacion de codigo (el tag principal del modelo es "code").
- Formato conversacional, apto para dialogos multi-turno.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Capacidades multilingues: limitadas al ingles, segun el campo language.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso de agentes, vision, audio ni un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistencia a la programacion en local: el modelo puede completar funciones y explicar fragmentos de codigo en ingles, ejecutable en una GPU de consumo con las cuantizaciones de 4 bits (Q4_K_M, 20 GB).
- Generacion de codigo en entornos con requisitos de privacidad: al desplegarse con llama.cpp u Ollama sin conexion, permite generar codigo sin enviar datos a servicios externos, con licencia Apache 2.0 para uso comercial.
- Razonamiento sobre fragmentos de codigo de terceros: dado que se apoya en un dataset de razonamiento de codigo, es adecuado para analizar logica, detectar errores y proponer correcciones en ingles.
- Prototipado rapido de utilidades y scripts: con cuantizaciones ligeras (Q2_K de 12,4 GB o Q3_K de 14,5-17,3 GB) se puede desplegar en equipos con 16 GB de VRAM para tareas de generacion puntual.
- Documentacion tecnica de codigo: generar docstrings, comentarios y descripciones de funciones a partir del codigo fuente, en un flujo de trabajo por lotes.
- Base para experimentacion e investigacion: al ser un GGUF de un modelo de 32B con licencia permisiva, sirve para comparar estrategias de cuantizacion y medir su impacto en tareas de codigo.
- Educacion y tutoria de programacion: uso conversacional para explicar conceptos de programacion y resolver dudas paso a paso, siempre en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun la cuantizacion (pesos del archivo, sin contar la cache KV ni el contexto):
  - Q2_K: 12,4 GB
  - Q3_K_S: 14,5 GB
  - Q3_K_M: 16,0 GB
  - Q3_K_L: 17,3 GB
  - IQ4_XS: 18,0 GB
  - Q4_K_S: 18,9 GB
  - Q4_K_M: 20,0 GB
  - Q5_K_S: 22,7 GB
  - Q5_K_M: 23,4 GB
  - Q6_K: 27,0 GB
  - Q8_0: 34,9 GB
- A la VRAM de los pesos hay que sumar la memoria para la cache KV y el contexto, que crece con la longitud de este; los valores anteriores son solo el tamano de los pesos.
- GPU de consumo: las cuantizaciones Q2_K, Q3_K e IQ4_XS pueden caber en GPUs de 16-24 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, RTX 3090) segun el espacio disponible. Q4_K_M (20 GB) entra ajustadamente en 24 GB dejando poco margen para contexto.
- GPU profesionales: Q5_K_M (23,4 GB) y Q6_K (27 GB) requieren tarjetas de 24-32 GB o superiores; Q8_0 (34,9 GB) requiere al menos una GPU de 40 GB (A100 40 GB, A6000) o 48-80 GB (A100 80 GB, H100).
- Opciones de despliegue: al ser GGUF, el ecosistema natural es llama.cpp y sus derivados: Ollama, LM Studio, llama-cpp-python, kobold.cpp, text-generation-webui (llama.cpp) y TGI. No se garantiza compatibilidad directa con el modo habitual de vLLM para GGUF.
- Latencia y throughput: no se proporcionan datos medidos. Dependeran del tamano de la cuantizacion, de la GPU y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion/Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/OCRNT-32b-GGUF | ~32,76 B | GGUF (Q2_K-Q8_0) | apache-2.0 | HuggingFace (238 descargas) |
| Compumacy/OCRNT-32b (modelo base) | ~32,76 B | safetensors | apache-2.0 | HuggingFace |
| Otros modelos de codigo de ~32B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan comparar este modelo con alternativas de la misma categoria. La comparacion mas directa posible es con su propio modelo base en precision completa (Compumacy/OCRNT-32b), del que este repositorio es una cuantizacion sin cambios de pesos mas alla de la reduccion de precision.

## Limitaciones y advertencias

- Este repositorio es una cuantizacion de terceros (mradermacher); no es el modelo original ni lo ha entrenado quien lo cuantiza. Cualquier problema de calidad debe contrastarse con el modelo base Compumacy/OCRNT-32b.
- La cuantizacion introduce perdida de calidad respecto a los pesos originales, especialmente en los formatos mas agresivos (Q2_K, Q3_K). El propio autor advierte de "lower quality" en Q3_K_M y recomienda Q4_K_S/Q4_K_M como equilibrio rapido.
- No se dispone de informacion sobre sesgos del modelo. Al estar entrenado y declarado solo en ingles, el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea pobre.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo incorrecto, referencias inexistentes a APIs o explicaciones erroneas. No se debe confiar en su salida sin verificacion, especialmente en produccion.
- Limitacion de contexto e idioma: no se especifica la longitud de contexto soportada, y el idioma declarado es unicamente en.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, pero el usuario debe verificar las condiciones del modelo base original antes de un despliegue comercial.
- No se documentan capacidades de tool calling ni de agentes, por lo que integrarlo en pipelines automaticos complejos puede requerir trabajo adicional de formateo.
- El tamano del repositorio (224 GB) implica que la descarga completa de todas las cuantizaciones es costosa en ancho de banda; conviene descargar solo el archivo deseado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OCRNT-32b-GGUF
- Modelo base original: https://huggingface.co/Compumacy/OCRNT-32b
- Dataset de referencia: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#OCRNT-32b-GGUF
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
