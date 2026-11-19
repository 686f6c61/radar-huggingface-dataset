# mradermacher/Qwen-SEA-LION-v5-27B-GGUF

## Resumen

Qwen-SEA-LION-v5-27B es un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) desarrollado por AI Singapore (aisingapore), especializado en las lenguas del sudeste asiatico. Esta ficha describe la version cuantizada en formato GGUF publicada por el usuario mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base esta disponible en el repositorio aisingapore/Qwen-SEA-LION-v5-27B.

El modelo cubre nueve idiomas: ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita. Esta orientado a conversacion y fue afinado sobre el dataset aisingapore/SEA-Instruct-2602, lo que lo hace relevante para aplicaciones de atencion al cliente, procesamiento de documentos y asistentes en mercados del sudeste asiatico, una region con mas de 600 millones de hablantes y escasa cobertura en modelos generalistas.

La publicacion de cuantizaciones GGUF amplia el acceso al modelo: los archivos van desde 11,0 GB (Q2_K) hasta 29,1 GB (Q8_0), e incluyen suplementos multimodales (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de vision. La licencia MIT facilita su uso comercial sin restricciones de atribucion mas alla de la propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen; transformer presumiblemente, sin confirmar en la informacion disponible) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y el linaje (Qwen-SEA-LION-v5-27B), se trata de un modelo de la familia Qwen afinado por AI Singapore, pero la model card no confirma si emplea atencion estandar, atencion lineal u otra variante, ni el numero de capas, cabezas o dimension oculta. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento se realizo sobre el dataset aisingapore/SEA-Instruct-2602, un conjunto de instrucciones orientado a las lenguas del sudeste asiatico. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. La presencia de archivos mmproj en las cuantizaciones indica que el modelo incorpora un codificador multimodal (vision), aunque no se detalla su arquitectura ni el volumen de datos multimodales empleados.

## Capacidades

- Generacion de texto conversacional en nueve idiomas: ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Capacidades multimodales (vision): la publicacion incluye suplementos mmproj, lo que permite procesar imagenes junto con texto en llama.cpp y herramientas compatibles.
- Razonamiento y respuesta a instrucciones, segun el formato de dataset de instrucciones empleado en el afinado (SEA-Instruct-2602).
- Soporte de conversacion multi-turno (etiqueta conversational en el repositorio).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, filipino, tailandes, vietnamita, birmano y tamil, lo que permite desplegar un unico modelo para varios mercados en lugar de uno por idioma.
- Procesamiento de documentos regionales: extraccion y resumen de informacion en lenguas de baja representacion como el birmano o el tamil, donde los modelos generalistas suelen rendir peor.
- Asistentes de soporte tecnico con imagenes: gracias a los suplementos mmproj, puede interpretar capturas de pantalla o fotos enviadas por el usuario y responder en su idioma.
- Traduccion y localizacion: traduccion entre ingles/chino y las lenguas del sudeste asiatico para equipos de localizacion de productos.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,9 GB) permiten ejecutar el modelo en una GPU de 24 GB (RTX 3090/4090) o en configuraciones con RAM suficiente, algo inviable con el modelo en precision completa.
- Prototipado e investigacion en NLP de lenguas asiaticas: la licencia MIT y el formato GGUF facilitan experimentos academicos y evaluaciones comparativas sin coste de licencia.
- Chatbot de soporte interno en empresas con plantilla multilingue: un unico modelo cubre consultas en ingles, chino, indonesio, malayo, filipino, tailandes y vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB
  - Q3_K_M: 13,6 GB
  - Q3_K_L: 14,7 GB
  - Q4_K_S: 15,9 GB
  - Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
  - Suplemento multimodal: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16)
- GPU recomendadas: para Q8_0 y Q6_K se necesitan GPUs de 32-48 GB (A100 40 GB, RTX A6000, L40S); para Q4_K_M y Q4_K_S cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A10G 24 GB); las cuantizaciones Q2_K y Q3_K caben en GPUs de 16 GB (RTX 4080, A4000).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q4_K_S; en RTX 4080 (16 GB) con Q2_K o Q3_K_S; en GPUs de 12 GB solo mediante offload parcial a RAM o cuantizaciones mas agresivas no incluidas en esta publicacion.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas del sudeste asiatico | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-27B (esta ficha) | 27,3 mil millones | no disponible | en, zh, my, id, fil, ms, ta, th, vi | MIT | Si |
| SEA-LION v3 (versiones previas de AI Singapore) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen2.5-32B-Instruct | 32,5 mil millones | 131.072 tokens | cobertura limitada de lenguas SEA | Apache 2.0 | Si (multiples repositorios) |
| Llama 3.3 70B | 70 mil millones | 128.000 tokens | cobertura limitada de lenguas SEA | Llama 3.3 Community License | Si |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de la familia; la informacion proporcionada no incluye resultados de benchmarks que permitan comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse sobre un dataset de instrucciones regional, puede reflejar sesgos culturales o linguisticos de las fuentes de datos.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de ~27B, puede producir contenido facticamente incorrecto, especialmente en lenguas de baja representacion como el birmano o el tamil.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; las nueve lenguas soportadas no incluyen la mayoria de lenguas europeas, por lo que no es adecuado como modelo generalista multilingue.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero conviene verificar las condiciones del modelo base (aisingapore/Qwen-SEA-LION-v5-27B) por si anaden requisitos adicionales.
- Caveats para produccion: las cuantizaciones GGUF degradan la calidad respecto al modelo en precision completa (especialmente Q2_K y Q3_K_S); el rendimiento multimodal depende de que la herramienta de despliegue soporte los archivos mmproj; no hay benchmarks publicados que permitan estimar la perdida de calidad por cuantizacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen-SEA-LION-v5-27B-GGUF
- Modelo base: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen-SEA-LION-v5-27B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
