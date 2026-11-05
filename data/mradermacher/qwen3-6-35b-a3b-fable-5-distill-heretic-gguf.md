# mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF

## Resumen

Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF es la version cuantizada en formato GGUF del modelo Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic, publicada por el usuario mradermacher. Se trata de una distribucion de pesos optimizada para inferencia local con llama.cpp y derivados, no de un modelo entrenado desde cero: el autor de la cuantizacion se limita a convertir los pesos originales a distintos niveles de compresion. El modelo subyacente parte de una base Qwen3.6 de 35.000 millones de parametros con arquitectura Mixture-of-Experts (MoE) y 3.000 millones de parametros activos por token, segun indica el propio nombre.

La denominacion "Fable-5-Distill-heretic" sugiere un proceso de destilacion sobre una variante "heretic", es decir, un ajuste orientado a reducir el rechazo o la censura del modelo base, complementado con tecnicas de DPO y defensa frente a inyeccion de prompts, tal y como reflejan las etiquetas de la model card. La informacion publicada no detalla el dataset de destilacion ni los hiperparametros empleados.

El interes practico de esta ficha reside en que ofrece una via para ejecutar un MoE de ~35B en hardware de consumo mediante cuantizacion, con un contexto y unas capacidades que no se documentan en la informacion disponible. La licencia Apache 2.0 y el formato GGUF lo hacen atractivo para experimentacion local, aunque la ausencia de benchmarks y de documentacion tecnica del modelo base limita su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6, transformer (detalles no disponibles) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (indicado en el nombre, "A3B"; desglose no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas Mixture-of-Experts: de los ~34,7B parametros totales, aproximadamente 3B se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La model card del repositorio cuantizado no aporta detalles sobre el numero de expertos, la dimension oculta, el numero de capas ni el mecanismo de atencion. Tampoco se documenta la longitud de contexto nativa ni la composicion del corpus de entrenamiento.

El sufijo "Fable-5-Distill-heretic" apunta a un pipeline de destilacion (probablemente de chain-of-thought, segun la etiqueta "distillation" y "chain-of-thought") seguido de un ajuste "heretic" orientado a reducir el comportamiento de rechazo, y de una fase de DPO. Las etiquetas mencionan tambien "prompt-injection-defense", lo que sugiere un entrenamiento especifico para resistir inyecciones de prompt. No se dispone de informacion sobre el numero de tokens de entrenamiento, la mezcla de datos ni los detalles del proceso de alineamiento. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1) y no incluye, por el momento, variantes con imatrix o ponderadas.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con soporte declarado de chain-of-thought.
- Razonamiento multi-paso derivado de la destilacion de trazas de pensamiento.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base, aunque no se detalla su alcance.
- Defensa frente a inyeccion de prompts, segun la etiqueta "prompt-injection-defense".
- Comportamiento "uncensored" o con menor tasa de rechazo, derivado del ajuste "heretic".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles ("en").
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Experimentacion local con MoE: ejecutar un modelo de ~35B con ~3B activos en una estacion de trabajo mediante los quants Q4_K_S (~20 GB) o Q4_K_M, aprovechando la reduccion de computo por token propia de la arquitectura MoE.
- Generacion de texto y prototipado conversacional en ingles: usar el quant Q5_K_M o Q6_K para tareas de redaccion y dialogo donde se priorice calidad sobre velocidad.
- Investigacion sobre alineamiento y censura: el ajuste "heretic" permite estudiar el comportamiento del modelo ante prompts sensibles y comparar con la variante base sin dicho ajuste.
- Evaluacion de robustez frente a inyeccion de prompts: la etiqueta "prompt-injection-defense" hace del modelo un candidato para pruebas de seguridad en pipelines de agentes.
- Razonamiento con trazas de pensamiento: emplear el modelo en tareas que se beneficien de chain-of-thought destilado, como resolucion de problemas o analisis estructurado.
- Procesamiento de imagenes con el suplemento mmproj: cargar los ficheros mmproj-Q8_0 o mmproj-f16 en llama.cpp para tareas multimodales basicas, siempre que el runtime lo soporte.
- Despliegue en entornos con VRAM limitada: los quants Q3_K_M o IQ4_XS permiten ajustar el modelo a GPUs de 16-24 GB, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q4_K_S ~20 GB (recomendado por el autor por velocidad); Q8_0 y f16 requieren del orden de 35-70 GB; los quants Q3 y Q2 reducen el peso pero degradan la calidad.
- GPU recomendadas: A100 40/80 GB o H100 para f16/Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q4_K_S y Q4_K_M; GPUs de 16 GB solo con Q3_K_M o IQ4_XS y posible offload parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_S o Q4_K_M; en GPUs de 16 GB con cuantizaciones mas agresivas y offload.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; para los ficheros mmproj se requiere un runtime con soporte multimodal (por ejemplo, llama.cpp con mmproj).
- Latencia y throughput: no disponibles; al ser un MoE con ~3B activos, el throughput por token deberia ser superior al de un denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Fable-5-Distill-heretic (este) | ~34,7B | ~3B | no disponible | Apache 2.0 | GGUF / safetensors |
| Modelo base Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic | ~34,7B | ~3B | no disponible | Apache 2.0 | safetensors |
| Otras variantes Qwen3.6-35B-A3B | no disponible | ~3B | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- El ajuste "heretic" y la etiqueta "uncensored" implican una reduccion deliberada de rechazos, con mayor riesgo de generar contenido inapropiado o danino en produccion.
- No hay benchmarks publicados, por lo que la calidad real del modelo destilado frente a su base no esta cuantificada.
- La destilacion de chain-of-thought puede aumentar la verbosidad y el coste de tokens en inferencia.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin evaluacion publicada no puede acotarse.
- La cuantizacion estatica sin imatrix puede degradar mas la calidad que variantes ponderadas; el autor no garantiza que vaya a publicarlas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de destilacion antes de un uso comercial.
- El soporte multimodal depende de los ficheros mmproj y del runtime; no se documenta su alcance ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF
- Modelo base: https://huggingface.co/Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Fable-5-Distill-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
