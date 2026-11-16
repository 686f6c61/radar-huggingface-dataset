# mradermacher/RYS-Medium-GGUF

## Resumen

RYS-Medium-GGUF es la distribucion en formato GGUF del modelo RYS-Medium, desarrollado originalmente por dnhkng y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 18.700 millones de parametros (18.731.402.240 segun los pesos en safetensors del modelo base), orientado a tareas conversacionales y publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha concreta radica en que el repositorio original se distribuye en pesos de precision completa (safetensors), mientras que esta version ofrece cuantizaciones estaticas en GGUF que van desde Q2_K (7,5 GB) hasta Q8_0 (20,0 GB). Esto permite ejecutar un modelo de casi 19.000 millones de parametros en hardware de consumo, algo inviable con los pesos originales. Las cuantizaciones estan pensadas para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, entre otros).

No se dispone de informacion publica sobre la arquitectura interna, el proceso de entrenamiento, la longitud de contexto ni los datos de benchmarks del modelo base en la informacion proporcionada. La model card del repositorio de cuantizacion se limita a describir el proceso de conversion y las variantes disponibles, sin detallar las caracteristicas tecnicas del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 18.731.402.240 (aprox. 18,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay imatrix/weighted disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base dnhkng/RYS-Medium en la documentacion disponible. El recuento de parametros (18.731.402.240) es consistente con un transformer denso de aproximadamente 18,7 mil millones de parametros, pero no se confirma el tipo de arquitectura, el numero de capas, la dimension del modelo ni el mecanismo de atencion empleado.

Tampoco se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada. La model card del repositorio de cuantizacion no incluye esta informacion y se centra exclusivamente en el proceso de conversion a GGUF mediante herramientas de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y orientado a dialogos de multiples turnos.
- Procesamiento en ingles: unico idioma declarado en los metadatos.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con infraestructuras de inferencia estandar.
- Ejecucion local mediante GGUF: compatible con llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python).
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales autoalojados: al distribuirse en GGUF con cuantizaciones desde 7,5 GB, se puede desplegar en un servidor modesto o en una estacion de trabajo con GPU de consumo para atender conversaciones en ingles sin depender de APIs externas.
- Prototipado rapido en local: la variante Q4_K_M (11,6 GB) permite iterar sobre prompts y flujos conversacionales en una unica GPU de 16 GB, reduciendo el coste frente al modelo en precision completa.
- Despliegue en entornos con requisitos de soberania de datos: la licencia MIT y la ejecucion local facilitan el cumplimiento de politicas que prohiben enviar datos a servicios en la nube.
- Integracion en aplicaciones de escritorio: mediante llama.cpp u Ollama, el modelo puede embeberse en herramientas de escritorio para tareas de redaccion o resumen en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece diez variantes, lo que permite medir el impacto de la cuantizacion en calidad y latencia sobre un mismo modelo base.
- Investigacion sobre cuantizacion: util para estudiar la degradacion de perplexidad entre Q2_K y Q8_0 en un modelo de ~19B, siguiendo la grafica de referencia de ikawrakow incluida en la model card.
- Fine-tuning ligero sobre pesos cuantizados: aunque limitado, permite experimentar con adaptadores sobre la variante Q8_0 en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~7,5 GB de pesos; ~9-10 GB con contexto moderado.
  - Q3_K_M: ~9,4 GB de pesos; ~11-12 GB con contexto moderado.
  - Q4_K_M: ~11,6 GB de pesos; ~13-14 GB con contexto moderado.
  - Q5_K_M: ~13,5 GB de pesos; ~15-16 GB con contexto moderado.
  - Q6_K: ~15,5 GB de pesos; ~17-18 GB con contexto moderado.
  - Q8_0: ~20,0 GB de pesos; ~22-23 GB con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 12 GB para Q3_K_M y Q4_K_S; A100 40/80 GB o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de variantes. Q2_K y Q3_K_S caben en GPUs de 8-10 GB; Q4_K_M en 12-16 GB; Q8_0 requiere 24 GB o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RYS-Medium (este) | ~18,7B | no disponible | MIT | GGUF / safetensors | Conversacional, solo ingles |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | safetensors / GGUF | Menor tamano, contexto largo documentado |
| Mistral Small 22B | ~22B | 32K | Apache 2.0 | safetensors / GGUF | Tamano cercano, licencia permisiva |
| Qwen2.5 14B | 14B | 32K | Apache 2.0 | safetensors / GGUF | Multilingue, benchmarks publicos |

La comparacion se ofrece a titulo orientativo: no se dispone de datos de rendimiento de RYS-Medium que permitan una confrontacion cuantitativa con estas alternativas. La principal ventaja de RYS-Medium es su licencia MIT combinada con un tamano de ~19B, mientras que su limitacion es la ausencia de documentacion tecnica y de benchmarks publicos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse informacion sobre el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, ideologia o geograficos.
- Riesgo de alucinacion: no cuantificado. Sin benchmarks ni evaluaciones publicas, el riesgo de fabricacion de hechos es desconocido y debe asumirse como presente en cualquier modelo de este tamano.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el autor del modelo base no ofrece garantias.
- Caveats de produccion: la ausencia de benchmarks, de documentacion de arquitectura y de evaluaciones de seguridad hace desaconsejable su uso en produccion critica sin una evaluacion interna previa. Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun la propia model card ("lower quality").
- No hay cuantizaciones imatrix/weighted disponibles en el momento de la publicacion, lo que limita la calidad maxima alcanzable en tamanos pequenos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RYS-Medium-GGUF
- Modelo base: https://huggingface.co/dnhkng/RYS-Medium
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RYS-Medium-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
