# mradermacher/Qwopus3.8-27B-Flash-GGUF

## Resumen

Qwopus3.8-27B-Flash-GGUF es la distribucion en formato GGUF del modelo Qwopus3.8-27B-Flash, publicada por el usuario mradermacher. El modelo original, desarrollado por Jackrong, es un ajuste fino (fine-tune) de la familia Qwen3.8 con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), orientado a instrucciones, razonamiento, uso de herramientas y generacion de codigo. Esta version GGUF esta pensada para inferencia local con llama.cpp y otros runners compatibles, e incluye el proyector multimodal (mmproj) necesario para el procesamiento de imagen y texto.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 27B con capacidades multimodales y agenticas en hardware de consumo, algo inviable con los pesos originales en safetensors (el repositorio completo ocupa 190,8 GB). mradermacher ofrece una bateria completa de cuantizaciones estaticas, desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), ademas de una variante con cuantizacion ponderada por matriz de importancia (i1) publicada en un repositorio aparte.

El modelo soporta cinco idiomas (ingles, chino, espanol, ruso y japones), se distribuye bajo licencia Apache 2.0 y declara soporte para decodificacion especulativa mediante MTP (multi-token prediction), lo que resulta relevante para reducir la latencia en despliegues locales. La ficha se centra en la version GGUF; los detalles de entrenamiento del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), multimodal image-text-to-text; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repositorio separado |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con aproximadamente 27,3 mil millones de parametros, ajustado por Jackrong para tareas de instruccion, razonamiento, agente y generacion de codigo. La model card etiqueta el modelo como multimodal (image-text-to-text), lo que se materializa en la distribucion GGUF mediante ficheros mmproj separados (proyector multimodal en Q8_0 de 0,7 GB o f16 de 1,0 GB). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La model card menciona soporte de MTP (multi-token prediction) y decodificacion especulativa, orientados a acelerar la generacion en inferencia local. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estaticas en este repositorio y cuantizaciones ponderadas por imatrix en el repositorio i1-GGUF. No se detalla la arquitectura de atencion ni innovaciones adicionales del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con ajuste a instrucciones.
- Razonamiento (reasoning) y resolucion de problemas en varios pasos.
- Generacion de codigo, segun las etiquetas code-generation del modelo.
- Uso de herramientas y function calling (tool-use, function-calling).
- Flujos agenticos y razonamiento multi-paso (agent, agentic).
- Procesamiento multimodal de imagen y texto (image-text-to-text, vision), mediante el proyector mmproj.
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Decodificacion especulativa mediante MTP para acelerar la inferencia.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y revisar codigo en un entorno sin conexion, ejecutandose con llama.cpp sobre una GPU de consumo con la cuantizacion Q4_K_M (16,9 GB), adecuada para equipos con 24 GB de VRAM.
- Agente con tool calling: al declarar soporte de function calling y flujos agenticos, puede integrarse en pipelines que invoquen APIs externas, bases de datos o herramientas de linea de comandos para tareas multi-paso.
- Analisis de documentos con imagenes: gracias al proyector multimodal, puede procesar capturas, diagramas o documentos escaneados junto con texto, util para extraccion de informacion en entornos con requisitos de privacidad.
- Atencion al cliente multilingue: con soporte de espanol, ingles, chino, ruso y japones, puede gestionar conversaciones en varios idiomas; la longitud de contexto no esta documentada, por lo que debe validarse antes de desplegarlo con historiales largos.
- Prototipado e investigacion: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten experimentar con un modelo de 27B en GPUs de 12-16 GB, a costa de menor calidad.
- Generacion de codigo en CI/CD: puede integrarse en pipelines automatizados para revisiones de codigo o generacion de tests, usando el formato GGUF con llama.cpp o servidores compatibles con la API de OpenAI.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran capacidad: las cuantizaciones bajas permiten inferencia en CPU con llama.cpp, aunque con latencia mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero): Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB. Anadir 0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) para Q3_K_M o IQ4_XS.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con cuantizaciones Q3/IQ4.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), servidores compatibles con la API de OpenAI (el modelo incluye la etiqueta endpoints_compatible), text-generation-inference para los pesos originales; el repositorio i1-GGUF ofrece variantes imatrix.
- Latencia y throughput: no disponibles en la informacion proporcionada; el soporte de MTP y decodificacion especulativa deberia reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Flash-GGUF (este) | ~27,3B | No disponible | Apache 2.0 | GGUF | Multimodal, tool calling, MTP; cuantizaciones de 11,0 a 29,1 GB |
| Qwen3-32B | ~32B | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa de la misma familia con mas parametros; sin datos de rendimiento en esta ficha |
| Gemma 3 27B | ~27B | No disponible en esta ficha | Gemma license | safetensors, GGUF | Tamano comparable y multimodal; licencia distinta a Apache 2.0 |

No se dispone de datos de benchmarks para comparar el rendimiento relativo con estas alternativas; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes en la informacion disponible; el rendimiento real debe validarse en el caso de uso concreto.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con historiales largos sin pruebas previas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos especificos sobre tasas de error.
- Sesgos conocidos: no documentados en la informacion disponible; el ajuste fino y los datos de entrenamiento del modelo base no se detallan.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; la model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K/Q8_0 para maxima calidad.
- El repositorio completo ocupa 190,8 GB; conviene descargar solo la cuantizacion necesaria.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia y los terminos del modelo base Jackrong/Qwopus3.8-27B-Flash y de la familia Qwen3.8 subyacente.
- El soporte multimodal requiere descargar y configurar el fichero mmproj; sin el, el modelo funciona solo con texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.8-27B-Flash-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwopus3.8-27B-Flash-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.8-27B-Flash-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
