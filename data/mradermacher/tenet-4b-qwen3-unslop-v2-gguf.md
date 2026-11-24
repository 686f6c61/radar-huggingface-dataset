# mradermacher/Tenet-4B-Qwen3-Unslop-v2-GGUF

## Resumen

Tenet-4B-Qwen3-Unslop-v2-GGUF es la distribucion en formato GGUF del modelo Tenet-4B-Qwen3-Unslop-v2, un ajuste fino de la familia Qwen3 con 4.022.468.096 parametros (aproximadamente 4B) publicado por mr-andrey-isachenko y cuantizado por mradermacher. El modelo se presenta como un derivado orientado a razonamiento con modo thinking, uso de herramientas (tool-use), capacidades agenticas y generacion de codigo, y los tags de la model card indican tambien un proceso de "abliteration" o "unslop" que busca reducir rechazos y respuestas excesivamente cautelosas.

La relevancia practica de esta ficha esta en el formato: al estar disponible en GGUF con cuantizaciones desde Q2_K hasta f16, el modelo puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o interfaces equivalentes, algo que no ocurre con los pesos originales en safetensors. El repositorio ocupa 36,4 GB e incluye todas las variantes de cuantizacion publicadas por el autor de la cuantizacion.

No se dispone de informacion detallada sobre el proceso de entrenamiento, la composicion del dataset ni los resultados de benchmarks en la informacion proporcionada; esta ficha se limita a los datos verificables de la model card, los tags y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3; detalles de capas y atencion no disponibles) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (existe ademas un repositorio i1 con cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3 con 4B de parametros, segun se deduce del nombre y de los tags (`qwen3`, `tenet`, `tenet-v2`, `lancet`, `unslop`, `grpo`). La model card del repositorio GGUF no documenta la arquitectura interna, el numero de capas, la dimension oculta ni el mecanismo de atencion, por lo que estos datos deben consultarse en el repositorio del modelo base. Los tags sugieren el uso de GRPO (Group Relative Policy Optimization) en el ajuste, asi como un proceso de "abliteration" orientado a eliminar comportamientos de rechazo.

En cuanto al entrenamiento, no se dispone del numero de tokens, la composicion del dataset ni la mezcla de datos utilizada. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El proceso de cuantizacion aplicado por mradermacher es estatico y sigue el flujo estandar de llama.cpp: conversion desde safetensors y generacion de las variantes K-quant e IQ-quant listadas en la tabla anterior.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat.
- Razonamiento con modo thinking explicito (tag `thinking`), heredado de Qwen3.
- Generacion de codigo (tag `coding`).
- Uso de herramientas y function calling (tag `tool-use`).
- Flujos agenticos y razonamiento multi-paso (tag `agentic`).
- Comportamiento "uncensored" o "abliterated": menor tendencia a rechazar peticiones, segun los tags del autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con despliegue en vLLM segun los tags, aunque en formato GGUF el motor natural es llama.cpp.
- Capacidades multilingues: la model card solo declara ingles; no hay evidencia de soporte de castellano.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M de 2,6 GB, el modelo puede ejecutarse en un portatil con GPU de 6-8 GB de VRAM y ofrecer autocompletado y generacion de funciones en ingles dentro de un IDE o pipeline de CI/CD.
- Agente con tool calling en prototipos: los tags `agentic` y `tool-use` permiten integrarlo en frameworks de agentes (LangChain, LlamaIndex) para tareas de consulta a APIs, ejecucion de comandos y razonamiento multi-paso en entornos de desarrollo.
- Razonamiento con cadena de pensamiento: el modo thinking es util para tareas de analisis, depuracion de codigo y resolucion de problemas matematicos donde se quiere inspeccionar el proceso intermedio.
- Despliegue en hardware de consumo: al caber en 2-4 GB en Q4/Q5, es adecuado para demos, entornos de aprendizaje y pruebas offline sin depender de la nube.
- Generacion de contenido sin filtros agresivos: el ajuste "unslop"/"abliterated" lo hace util para experimentos de escritura creativa o investigacion sobre comportamiento de modelos, con las cautelas eticas correspondientes.
- Prototipado rapido con Ollama o llama.cpp: la disponibilidad de GGUF permite levantar un servidor local en minutos para validar ideas antes de invertir en modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que facilita estudios de degradacion de calidad frente a tamano en un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 1,8 GB; Q3_K_S 2,0 GB; Q3_K_M 2,2 GB; Q3_K_L 2,3 GB; IQ4_XS 2,4 GB; Q4_K_S 2,5 GB; Q4_K_M 2,6 GB; Q5_K_S 2,9 GB; Q5_K_M 3,0 GB; Q6_K 3,4 GB; Q8_0 4,4 GB; f16 8,2 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para cuantizaciones Q4-Q5 (RTX 3060, RTX 4060, RTX 4070); 8 GB o mas para Q6_K y Q8_0 (RTX 3070, RTX 4060 Ti 16 GB, RTX 4070 Super); f16 requiere 10-12 GB (RTX 3080, RTX 4080). En el segmento profesional, A100 y H100 son sobredimensionadas para este tamano y solo tendrian sentido en despliegues multi-usuario.
- Cabe en GPU consumer: si, en la practica totalidad de GPU discretas modernas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI. Los tags mencionan vLLM y endpoints compatibles, pero para GGUF el camino recomendado es llama.cpp.
- Latencia y throughput: no disponibles. Como referencia orientativa de orden de magnitud para un modelo de 4B en Q4_K_M, cabria esperar decenas de tokens por segundo en GPU consumer, pero no se ha verificado con datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-4B-Qwen3-Unslop-v2 (este) | 4,02B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste Qwen3 con thinking, tool-use y abliteration |
| Qwen3-4B (base de referencia) | aproximadamente 4B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF (terceros) | Modelo original de Alibaba; referencia de calidad y contexto |
| Llama 3.2 3B Instruct | 3,2B | 128K (segun documentacion de Meta) | Llama 3.2 Community License | GGUF, safetensors | Alternativa de tamano similar con licencia mas restrictiva |
| Phi-3.5-mini-instruct | 3,8B | 128K (segun documentacion de Microsoft) | MIT | GGUF, safetensors | Alternativa de tamano similar con licencia permisiva |

La comparacion con Qwen3-4B es la mas directa, ya que este modelo deriva de el; sin embargo, no se dispone de datos de benchmarks que permitan cuantificar la diferencia de rendimiento. Las cifras de contexto de Llama 3.2 3B y Phi-3.5-mini se incluyen como referencia externa y no proceden de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- El ajuste "abliterated"/"uncensored" reduce los rechazos, lo que implica mayor riesgo de generar contenido inapropiado, sesgado o danino; requiere filtros y supervision en produccion.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de conocimiento factual y razonamiento largo.
- No se dispone de datos de benchmarks, por lo que no se puede verificar la calidad frente al modelo base ni frente a alternativas.
- La longitud de contexto no esta documentada en esta ficha; debe consultarse en el repositorio del modelo base antes de usarlo en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales; conviene revisar la licencia del modelo original antes de un uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El modelo no incluye vision ni audio; sus capacidades se limitan a texto y tool calling.
- El repositorio tiene pocas descargas (495) y cero likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-4B-Qwen3-Unslop-v2-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-4B-Qwen3-Unslop-v2
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Tenet-4B-Qwen3-Unslop-v2-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Tenet-4B-Qwen3-Unslop-v2-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
