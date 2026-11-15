# mradermacher/JEV-35B-GGUF

## Resumen

JEV-35B-GGUF es una coleccion de cuantizaciones GGUF del modelo AutoTrust-Decider-Pro-35B, publicada por mradermacher. El modelo original es un "decision model" de tipo system-one: en lugar de generar texto libre, produce decisiones tipadas (choice, score) con probabilidades calibradas, orientado a tareas de clasificacion y puntuacion en pipelines de agentes y sistemas de automonitorizacion. La arquitectura subyacente es Qwen3.5-MoE (mixture-of-experts), con 35.505.251.456 parametros totales segun los pesos safetensors del modelo base.

La relevancia de esta ficha esta en que mradermacher ofrece una bateria completa de cuantizaciones estaticas (de Q2_K a Q8_0, mas IQ4_XS y suplementos multimodales mmproj), lo que permite ejecutar un modelo de 35B parametros en hardware de consumo y en entornos de inferencia locales con llama.cpp u Ollama. El repo ocupa 244,4 GB por incluir todas las variantes; cada fichero individual va de 13,3 GB (Q2_K) a 37,9 GB (Q8_0).

La licencia es Apache 2.0, lo que facilita el uso comercial, y el modelo esta etiquetado como compatible con vLLM y endpoints. El idioma declarado es unicamente ingles. No se dispone de informacion sobre el pipeline de tarea ni sobre resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mixture-of-experts), transformer con capas expertas dispersas |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Modelo base | autotrust/AutoTrust-Decider-Pro-35B |
| Tamano del repo | 244,4 GB (todas las variantes) |
| Libreria | transformers |
| Etiquetas | system-one, typed-decisions, decision-model, calibrated-probabilities, jev, noul, choice, score, mixture-of-experts, vllm, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura del modelo base es Qwen3.5-MoE, un transformer con mezcla de expertos (MoE) segun las etiquetas del autor. El modelo se presenta como un "decision model" de tipo system-one, es decir, un modelo que responde con decisiones tipadas y probabilidades calibradas en lugar de texto generativo libre. Las etiquetas `typed-decisions`, `calibrated-probabilities`, `choice` y `score` indican que la salida esperada es una eleccion entre opciones o una puntuacion, lo que encaja con tareas de clasificacion, ranking y evaluacion automatizada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o calibracion post-entrenamiento. Tampoco se detalla si el modelo incorpora decodificacion especulativa, atencion linear u otras innovaciones tecnicas. Las cuantizaciones publicadas por mradermacher son estaticas (convert_type: hf, output_tensor_quantised: 1) y no incluyen variantes ponderadas con imatrix, segun indica el propio autor en la model card.

## Capacidades

- Generacion de decisiones tipadas: produce salidas del tipo choice y score con probabilidades calibradas, orientadas a clasificacion y puntuacion.
- Modelo de decision system-one: respuestas directas sin cadena de razonamiento explicita, adecuado para evaluacion rapida y determinista.
- Soporte multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 indican capacidad de procesar entradas multimodales (vision) junto con el modelo principal.
- Compatibilidad con vLLM y endpoints: etiquetado como endpoints_compatible, lo que permite despliegue como servicio de inferencia.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Thinking mode, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion automatizada de tickets y solicitudes: el modelo puede recibir una entrada y devolver una decision tipada con probabilidad calibrada, lo que permite enrutar tickets a colas o equipos con umbrales de confianza ajustables.
- Evaluacion y ranking de respuestas generadas: como decision model con salida score, puede puntuar candidatos en pipelines de RLHF, evaluacion de calidad o seleccion de respuestas en sistemas de generacion.
- Moderacion de contenido con umbrales calibrados: la salida probabilistica permite fijar umbrales operativos y auditar decisiones, algo util en sistemas de moderacion que requieren trazabilidad.
- Automatizacion de decisiones en agentes: integrado via vLLM o endpoints, el modelo puede actuar como componente de decision en un agente multi-paso, eligiendo acciones entre opciones predefinidas.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (20,5 GB) y Q4_K_M (21,8 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, ideal para prototipado y pruebas offline.
- Evaluacion de modelos en pipelines de CI/CD: al ser compatible con vLLM y endpoints, puede integrarse como servicio de scoring en pipelines automatizados de evaluacion de modelos o de datos.
- Procesamiento multimodal en local: con los suplementos mmproj, puede usarse para tareas de decision sobre entradas que incluyan imagenes, en entornos sin acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 13,3 GB; Q3_K_S 15,6 GB; Q3_K_M 17,3 GB; Q3_K_L 18,7 GB; IQ4_XS 19,5 GB; Q4_K_S 20,5 GB; Q4_K_M 21,8 GB; Q5_K_S 24,7 GB; Q5_K_M 25,4 GB; Q6_K 29,3 GB; Q8_0 37,9 GB. Anadir 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) si se usa la parte multimodal.
- GPU recomendadas: para Q8_0 y Q6_K, GPUs de 40-48 GB (A100 40GB, A6000, L40S); para Q4_K_M y Q4_K_S, GPUs de 24 GB (RTX 4090, RTX 3090, A10G); para Q2_K y Q3_K_S, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB).
- Cabe en consumer GPU: si, en RTX 4090/3090 (24 GB) con Q4_K_S o Q4_K_M; en RTX 4080/4060 Ti 16GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (segun etiqueta endpoints_compatible), transformers con soporte GGUF. El autor remite a los README de TheBloke para el uso de ficheros GGUF multi-parte.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (decision models con salidas tipadas y probabilidades calibradas) ni sobre resultados de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Idiomas: el modelo esta declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un modelo de decision, los sesgos pueden manifestarse en las probabilidades asignadas a clases o scores.
- Riesgo de alucinacion: no cuantificado; al tratarse de un decision model, el riesgo se traslada a decisiones mal calibradas o scores inconsistentes, no a texto inventado.
- Contexto: la longitud de contexto no esta disponible, lo que impide garantizar el comportamiento en entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base AutoTrust-Decider-Pro-35B por si anaden restricciones adicionales.
- Produccion: las cuantizaciones estaticas sin imatrix pueden degradar la calidad en tipos bajos (Q2_K, Q3_K_M); el autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q8_0 como mejor calidad.
- Compatibilidad: no se ha verificado el soporte de tool calling ni de agentes multi-paso; validar antes de integrar en pipelines complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/JEV-35B-GGUF
- Modelo base: https://huggingface.co/autotrust/AutoTrust-Decider-Pro-35B
- Pagina de descargas del autor: https://hf.tst.eu/model#JEV-35B-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
