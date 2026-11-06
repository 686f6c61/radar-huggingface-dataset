# mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF

## Resumen

xyntrai-Sarah-mistral-2501-36B-nsfw es un modelo conversacional de gran tamano (36.910.535.680 parametros, aproximadamente 36,9 mil millones) derivado del modelo base xyntrai-Sarah-mistral-2501-36B-nsfw publicado por xyntraistudios. La version aqui documentada es una conversion a formato GGUF realizada por mradermacher, un conocido autor de cuantizaciones de la comunidad de Hugging Face, con el objetivo de permitir la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se presenta explicitamente como conversacional y marcado como "not-for-all-audiences" (no apto para todas las audiencias), lo que indica que su fine-tuning esta orientado a contenido para adultos o tematicas sensibles. La nomenclatura "mistral-2501" sugiere una base de la familia Mistral, aunque no se dispone de confirmacion tecnica en la informacion proporcionada. El repositorio ocupa 180,1 GB e incluye un conjunto de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta Q8_0, ademas de f16 e IQ4_XS).

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantizacion de un modelo de 36B orientado a conversacion; por otro, sirve de advertencia sobre las limitaciones de trazabilidad cuando la model card del autor original es escasa y la licencia no esta declarada. No se dispone de datos sobre arquitectura exacta, contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura sugiere base Mistral, sin confirmar) |
| Parametros totales | 36.910.535.680 (aproximadamente 36,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo de 180,1 GB |
| Version de cuantizacion | quantize_version 2 |
| Tipo de conversion | hf (convert_type: hf) |
| Tensor de salida cuantizado | si (output_tensor_quantised: 1) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. La denominacion "mistral-2501" apunta a una posible base de la familia Mistral, pero no hay confirmacion en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La unica informacion tecnica verificable es el proceso de cuantizacion: se trata de cuantizaciones estaticas generadas con quantize_version 2, con el tensor de salida cuantizado y conversion desde el formato Hugging Face original.

El modelo original procede de xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw, y esta version es una redistribucion en GGUF. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Contenido para adultos y tematicas sensibles (marcado "not-for-all-audiences").
- Inferencia local mediante formato GGUF y herramientas compatibles (llama.cpp, Ollama, entre otras).
- Soporte de endpoints compatibles (etiqueta "endpoints_compatible").
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva para adultos: el modelo esta etiquetado como conversacional y NSFW, por lo que su uso previsto es la generacion de dialogos y ficcion para audiencias adultas en entornos controlados y con las advertencias legales oportunas.
- Despliegue local en estaciones de trabajo con GPU de gran capacidad: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 36,9B en equipos con 24-48 GB de VRAM mediante llama.cpp u Ollama.
- Experimentacion con cuantizaciones: el repositorio ofrece un espectro amplio (de Q2_K a f16) que permite comparar la degradacion de calidad segun el nivel de cuantizacion en tareas conversacionales.
- Investigacion sobre modelos conversacionales de gran tamano: util para estudiar el comportamiento de modelos de 36B en tareas de dialogo, siempre que se respeten las restricciones de licencia (no declarada).
- Integracion en pipelines de generacion de texto offline: al ser GGUF, puede servirse con llama.cpp server o herramientas compatibles con endpoints, sin dependencia de la nube.
- Pruebas de seguridad y moderacion: util para evaluar filtros de contenido en modelos con fine-tuning NSFW, analizando como responden ante prompts sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (36,9B parametros):
  - f16: aproximadamente 74 GB (solo pesos), inviable en GPU de consumo.
  - Q8_0: aproximadamente 39 GB.
  - Q6_K: aproximadamente 30 GB.
  - Q5_K_M: aproximadamente 26 GB.
  - Q4_K_M: aproximadamente 22 GB.
  - Q3_K_M: aproximadamente 18 GB.
  - Q2_K: aproximadamente 13 GB.
- GPU recomendadas: A100 80 GB o H100 para f16 y Q8_0; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con posible offloading parcial; RTX 3090/4090 para Q3_K_M y Q2_K.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q4_K_M con 24 GB de VRAM, con posible offloading a RAM si el contexto es largo.
- Opciones de despliegue: llama.cpp, Ollama, llama.cpp server (endpoints compatibles), y otras herramientas que lean GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se dispone de datos de arquitectura, contexto ni benchmarks del modelo, ni de modelos comparables documentados en la informacion proporcionada. La unica referencia es el modelo original xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw, del que esta version es una conversion GGUF.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta marcado como "not-for-all-audiences"; su uso en produccion requiere filtros y politicas de moderacion.
- Licencia no declarada: no se puede confirmar el uso comercial; se recomienda contactar con el autor original antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce si soporta castellano con calidad suficiente.
- Contexto no documentado: no se puede planificar el uso en conversaciones largas sin conocer la ventana real.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay datos de evaluacion que lo cuantifiquen.
- Trazabilidad limitada: la model card del autor original es escasa y no se detallan datos de entrenamiento ni sesgos conocidos.
- Tamano del repositorio (180,1 GB): requiere almacenamiento considerable y ancho de banda para su descarga.
- Sin descargas ni likes registrados: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF
- Modelo original: https://huggingface.co/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw
