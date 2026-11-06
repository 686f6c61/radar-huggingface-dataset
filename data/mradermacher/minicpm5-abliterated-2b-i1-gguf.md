# mradermacher/MiniCPM5-abliterated-2B-i1-GGUF

## Resumen

MiniCPM5-abliterated-2B-i1-GGUF es la version cuantizada en formato GGUF del modelo SonGT1/MiniCPM5-abliterated-2B, un derivado "abliterated" (con las capas de rechazo neutralizadas mediante la tecnica de abliteration) de la familia MiniCPM5 de OpenBMB. El modelo base cuenta con 2.516.756.480 parametros (aproximadamente 2,5 mil millones) y esta disenado para generacion de texto conversacional en chino e ingles. Esta publicacion concreta la realiza mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones imatrix (i1) de alta calidad para su uso con llama.cpp y derivados.

La relevancia de esta ficha radica en dos factores. Por un lado, ofrece una via sencilla para ejecutar un modelo de 2,5B parametros en hardware de consumo gracias a las cuantizaciones que van desde 0,8 GB (IQ1_S) hasta 2,2 GB (Q6_K). Por otro lado, la variante "abliterated" elimina los mecanismos de rechazo del modelo original, lo que lo hace interesante para investigacion sobre alineamiento, red teaming y generacion sin restricciones de contenido, pero tambien plantea riesgos evidentes para despliegues en produccion.

El repositorio ocupa 30,2 GB en total porque incluye todas las variantes de cuantizacion, pero cada archivo individual es muy ligero. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque las implicaciones eticas del modelo abliterated deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5, detalles no disponibles) |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix i1) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix i1); safetensors en el modelo base |
| Tamano del repo | 30,2 GB (todas las cuantizaciones) |
| Rango de tamano por cuantizacion | 0,8 GB (IQ1_S) a 2,2 GB (Q6_K) |
| Modelo base | SonGT1/MiniCPM5-abliterated-2B |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base MiniCPM5 en la documentacion proporcionada. Por la denominacion y la familia a la que pertenece, se trata de un transformer decoder-only de aproximadamente 2,5 mil millones de parametros, optimizado para inferencia eficiente en dispositivos con recursos limitados. La familia MiniCPM de OpenBMB se ha caracterizado historicamente por modelos compactos con buen rendimiento por parametro, pero no hay datos publicados en esta ficha sobre numero de capas, dimensiones ocultas, atencion (GQA/MHA) o funcion de activacion.

El aspecto diferencial de este modelo es el proceso de "abliteration", una tecnica que identifica y elimina las direcciones de activacion asociadas al rechazo de peticiones (refusal directions) en el espacio latente del modelo. El resultado es un modelo que responde a practicamente cualquier prompt sin negarse, lo que preserva las capacidades generales pero elimina las salvaguardas de seguridad alineadas. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo fases de RLHF o DPO. La cuantizacion i1 (imatrix) realizada por mradermacher utiliza una matriz de importancia calculada sobre un corpus de calibracion para minimizar la perdida de calidad en las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Razonamiento basico y respuesta a instrucciones (heredado del modelo base MiniCPM5).
- Generacion de codigo y matematicas a nivel de modelo pequeno (sin datos de benchmark que lo confirmen).
- Respuesta sin rechazos: el proceso de abliteration elimina los mecanismos de negativa, por lo que el modelo no se niega a peticiones que el original rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; los tags no indican soporte multimodal.
- Capacidades multilingues: limitadas a chino e ingles segun los metadatos.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un LLM sin capas de rechazo, comparando sus respuestas con el modelo original para analizar donde residen las direcciones de negativa y como afecta la abliteration a la utilidad general.
- Red teaming y evaluacion de robustez: util para generar respuestas adversarias y probar sistemas de moderacion o filtros de contenido en pipelines de seguridad, ya que produce contenido que los modelos alineados rechazarian.
- Despliegue en hardware de consumo: con cuantizaciones de 1,6-1,7 GB (Q4_K_S, Q4_K_M) cabe en GPUs con 4-6 GB de VRAM o incluso en CPU con llama.cpp, lo que permite prototipado local rapido en portatiles sin GPU dedicada.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas que los modelos alineados suelen evitar, con la advertencia de que el contenido generado no pasa por filtros de seguridad.
- Chat conversacional en chino e ingles: su naturaleza bilingue permite construir asistentes locales para usuarios de ambas lenguas, con contexto limitado por la ventana no documentada.
- Experimentacion educativa: estudiar el efecto de las cuantizaciones GGUF (comparando IQ1_S, Q3_K_M, Q4_K_M y Q6_K) sobre la calidad de un modelo pequeno, usando el imatrix incluido para generar cuantizaciones propias.
- Generacion de datos sinteticos para entrenamiento: producir pares prompt-respuesta en dominios donde los modelos alineados se niegan, con supervision humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye metricas de calidad (perplejidad, MMLU, HumanEval, GSM8K) ni comparaciones con el modelo base sin cuantizar. La unica referencia cualitativa es la tabla de notas del README, que indica "very low quality" para Q2_K_S, "lower quality" para IQ3_XXS y "optimal size/speed/quality" para Q4_K_S.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S / IQ1_M: ~0,8 GB.
  - IQ2_XXS a Q2_K: ~0,9-1,1 GB.
  - IQ3_XXS a Q3_K_L: ~1,2-1,5 GB.
  - IQ4_XS a Q4_K_M: ~1,5-1,7 GB.
  - Q5_K_S a Q5_K_M: ~1,9 GB.
  - Q6_K: ~2,2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente en cuantizaciones Q4 o superiores; en cuantizaciones IQ2 o IQ3 puede ejecutarse incluso en GPUs integradas o en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos 10 anos con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI via servidores GGUF.
- Latencia y throughput: no disponibles. En una RTX 4090 con Q4_K_M, un modelo de 2,5B suele superar las 100 tok/s, pero no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-abliterated-2B-i1-GGUF (este) | 2,5B | no disponible | Apache 2.0 | GGUF i1 | Sin rechazos, bilingue zh/en |
| SonGT1/MiniCPM5-abliterated-2B | 2,5B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| MiniCPM5-2B (original, sin abliterar) | 2,5B | no disponible | Apache 2.0 | safetensors/GGUF | Con alineamiento de seguridad |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,5B | 32K | Apache 2.0 | GGUF | Alternativa alineada de tamano similar, mas idiomas |

La comparativa con modelos de la misma categoria (2B-3B) muestra que este modelo se distingue por la ausencia de rechazos y su enfoque bilingue zh/en, mientras que alternativas como Qwen2.5 cubren mas idiomas y mantienen alineamiento. No hay datos de rendimiento comparativo disponibles para establecer diferencias de calidad objetivas.

## Limitaciones y advertencias

- El modelo es "abliterated": no rechaza peticiones daninas, ilegales o eticamente problematicas. No debe desplegarse en produccion orientada a usuarios finales sin una capa externa de moderacion y filtrado.
- Riesgo elevado de alucinacion: al ser un modelo de 2,5B parametros, su conocimiento factual es limitado y propenso a inventar datos, especialmente en cuantizaciones bajas (IQ1, IQ2, Q2_K).
- Las cuantizaciones por debajo de Q3_K_M degradan notablemente la calidad; el propio autor advierte "very low quality" en Q2_K_S y "lower quality" en IQ3_XXS.
- Idiomas limitados a chino e ingles; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificacion empirica.
- Sesgos conocidos: no documentados en la informacion disponible, pero heredados del corpus de entrenamiento original y potencialmente amplificados por la eliminacion de rechazos.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin alineamiento puede acarrear responsabilidades legales y reputacionales segun la jurisdiccion y el caso de uso.
- El repositorio incluye 30,2 GB en total; descargar solo el archivo de cuantizacion deseado, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-i1-GGUF
- Modelo base abliterated: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/MiniCPM5-abliterated-2B-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiniCPM5-abliterated-2B-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
