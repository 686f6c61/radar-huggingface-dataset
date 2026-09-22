# mradermacher/Qwopus3.8-27B-Flash-V2-i1-GGUF

## Resumen

Qwopus3.8-27B-Flash-V2-i1-GGUF es una recopilación de cuantizaciones GGUF del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a formatos cuantizados (estáticos e imatrix) pensada para inferencia local en llama.cpp y derivados. El modelo original es multimodal (etiquetas image-text-to-text, vision y multimodal), está ajustado por instrucciones y orientado a razonamiento, uso de herramientas y generación de código.

El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) según los pesos en safetensors, y las etiquetas lo sitúan en la familia Qwen3 / Qwen3.5, con soporte declarado para MTP (predicción multi-token) y decodificación especulativa. La licencia es Apache 2.0 y los idiomas declarados son inglés, chino, español, ruso y japonés.

La relevancia de esta ficha reside en que el repositorio i1 ofrece cuantizaciones ponderadas con imatrix en rangos que van de 12,4 GB a 16,9 GB en los formatos listados, lo que permite ejecutar un modelo de 27B multimillonario en GPUs de consumo, algo que los pesos completos en safetensors no permiten de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas apuntan a la familia Qwen3 / Qwen3.5; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): I1-Q3_K_S, I1-IQ3_M, I1-Q3_K_M, I1-Q4_K_S, I1-Q4_K_M. Estaticas (repo hermano): Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Tamano del repositorio | 93,6 GB |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 |
| Fecha de publicacion | 22 de septiembre de 2026 (creacion), 22 de septiembre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la información proporcionada. Las etiquetas del repositorio incluyen `qwen3_5`, `qwen3` y `qwen`, lo que sugiere que el modelo base deriva de la familia Qwen3, y también `unsloth`, `fine-tuned` e `instruction-tuned`, lo que indica un ajuste fino posterior sobre instrucciones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Entre las capacidades técnicas declaradas por etiquetas aparecen `mtp` (multi-token prediction) y `speculative-decoding`, lo que apunta a que el modelo incorpora mecanismos de predicción multi-token y es compatible con decodificación especulativa para acelerar la generación. También figuran las etiquetas `agent`, `agentic`, `tool-use` y `function-calling`. Este repositorio concreto no entrena nada: aplica cuantización ponderada con un fichero imatrix (`Qwopus3.8-27B-Flash-V2.imatrix.gguf`, 0,1 GB) junto con conversiones de tipo `hf`, y el autor indica que las cuantizaciones estáticas están en el repositorio hermano.

## Capacidades

- Generación de texto conversacional, con etiquetas explícitas de `conversational` y `text-generation`.
- Razonamiento, según las etiquetas `reasoning` y `instruction-tuned`.
- Generación de código (`code-generation`).
- Capacidades multimodales de entrada imagen-texto (`image-text-to-text`, `vision`, `multimodal`). El autor advierte de que los ficheros mmproj, si existen, se encuentran en el repositorio estático, no en el i1.
- Soporte de uso de herramientas y llamada a funciones (`tool-use`, `function-calling`).
- Soporte de flujos agénticos y razonamiento multi-paso (`agent`, `agentic`).
- Multilingüismo declarado en cinco idiomas: inglés, chino, español, ruso y japonés.
- Compatibilidad con decodificación especulativa y predicción multi-token (`mtp`, `speculative-decoding`), orientada a acelerar la inferencia.
- Compatibilidad declarada con Text Generation Inference (`text-generation-inference`) y `endpoints_compatible`.

## Casos de uso

- Asistente de documentación técnica con entrada visual: al ser un modelo image-text-to-text, puede recibir capturas de pantalla, diagramas o páginas escaneadas y generar explicaciones o resúmenes. Requiere descargar el fichero mmproj desde el repositorio estático del autor, ya que el i1 no lo incluye.
- Generación de código en local: las etiquetas de `code-generation` y `function-calling` permiten integrarlo en flujos de autocompletado o revisión de código sin enviar el código fuente a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Agentes con uso de herramientas: la combinación de `agentic`, `tool-use` y `function-calling` lo hace apto para orquestar llamadas a APIs, consultas a bases de datos o ejecución de comandos en pipelines multi-paso.
- Atención al cliente multilingüe: cubre inglés, chino, español, ruso y japonés, de modo que una única instancia puede atender conversaciones en esos cinco idiomas sin desplegar un modelo por idioma.
- Despliegue en estación de trabajo con una sola GPU de 24 GB: la cuantización i1-Q4_K_M ocupa 16,9 GB, lo que deja margen para la caché KV y, si se usa visión, para el proyector multimodal.
- Inferencia en CPU o en equipos sin GPU dedicada: con las cuantizaciones de menor tamaño (i1-Q3_K_S, 12,4 GB) es viable ejecutar el modelo con llama.cpp usando memoria RAM en lugar de VRAM, a costa de latencia.
- Aceleración mediante decodificación especulativa: en escenarios de generación larga (resúmenes, redacción de documentación), la compatibilidad declarada con decodificación especulativa y MTP permite aumentar el throughput si el runtime lo soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente incluye una gráfica comparativa genérica de perplejidad entre tipos de cuantización de baja calidad (enlazada desde nethype.de) y una referencia externa a las notas de Artefact2 sobre elección de cuantizaciones. No hay valores de MMLU, HumanEval, GSM8K ni métricas equivalentes para este modelo ni para su base.

## Requisitos de hardware

- VRAM estimada según el tamaño de fichero de cada cuantización i1 (sin contar caché KV ni el proyector de visión): i1-Q3_K_S 12,4 GB; i1-IQ3_M 12,9 GB; i1-Q3_K_M 13,6 GB; i1-Q4_K_S 15,9 GB; i1-Q4_K_M 16,9 GB.
- El repositorio estático ofrece además rangos más bajos (Q2_K, IQ2, IQ1) y más altos (Q5_K, Q6_K), sin tamaño publicado en la información disponible.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 con holgura limitada) pueden alojar las cuantizaciones i1-Q4_K_M y Q4_K_S completas con margen para contexto moderado.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) quedan al límite con i1-Q3_K_S (12,4 GB); conviene reducir la longitud de contexto o recurrir a offload parcial.
- GPU de 12 GB o menos requieren descargar cuantizaciones más pequeñas del repositorio estático (Q2_K, IQ2, IQ1) o hacer offload a RAM.
- GPU profesionales como A100 (40/80 GB) o H100 (80 GB) permiten cargar el modelo sin cuantizar en safetensors, pero no hay cifras de latencia ni throughput publicadas para ninguna configuración.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, servidores compatibles con GGUF). La etiqueta `text-generation-inference` indica compatibilidad declarada con TGI. No se documenta soporte de vLLM en la información disponible.
- Para uso multimodal hay que descargar el fichero mmproj, que el autor sitúa en el repositorio estático (mradermacher/Qwopus3.8-27B-Flash-V2-GGUF), no en el i1.
- No se han publicado datos de latencia ni de tokens por segundo en la información disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos de la misma categoría, por lo que no es posible comparar el rendimiento con alternativas. La comparación se limita a las tres variantes de la misma familia:

| Variante | Formato | Parametros | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jackrong/Qwopus3.8-27B-Flash-V2 (base) | safetensors | 27,3 B | pesos completos | apache-2.0 | Repositorio del autor original |
| mradermacher/Qwopus3.8-27B-Flash-V2-GGUF | GGUF estático | 27,3 B (derivado) | Q2_K a Q6_K, IQ1 a IQ4 | apache-2.0 | Incluye ficheros mmproj para visión |
| mradermacher/Qwopus3.8-27B-Flash-V2-i1-GGUF (este) | GGUF i1 (imatrix) | 27,3 B (derivado) | Q3_K_S a Q4_K_M (i1) | apache-2.0 | No incluye mmproj |

Comparativa con modelos alternativos de terceros: no disponible.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que no es posible evaluar la calidad real frente a otras alternativas de tamaño similar.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación en la información disponible.
- El repositorio i1 no incluye los ficheros mmproj necesarios para la parte de visión; hay que obtenerlos del repositorio estático del mismo autor.
- Las cuantizaciones de menor tamaño (Q2_K, IQ1_S, IQ2) degradan la calidad de forma notable, como refleja la propia documentación del cuantizador; el propio autor recomienda IQ3_S o IQ4_XS sobre Q3_K_M según el caso.
- La longitud de contexto del modelo no está especificada, lo que impide dimensionar la caché KV con precisión para despliegues de contexto largo.
- Aunque el modelo declara cinco idiomas, no se aportan métricas de calidad por idioma; el rendimiento en español, ruso o japonés puede ser inferior al de inglés o chino.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y las fechas de creación y actualización son del 22 de septiembre de 2026, lo que indica que la información disponible es muy reciente y sin validación comunitaria.
- Licencia Apache 2.0 en el modelo base y en esta conversión, lo que permite uso comercial, pero conviene verificar las condiciones del modelo original por si el autor hubiera añadido términos adicionales no recogidos aquí.
- El repositorio ocupa 93,6 GB, por lo que la descarga de todas las cuantizaciones requiere espacio en disco considerable; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio HuggingFace (esta cuantización): https://huggingface.co/mradermacher/Qwopus3.8-27B-Flash-V2-i1-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Cuantizaciones estáticas del mismo autor (incluye mmproj): https://huggingface.co/mradermacher/Qwopus3.8-27B-Flash-V2-GGUF
- Listado de cuantizaciones por modelo del autor: https://hf.tst.eu/model#Qwopus3.8-27B-Flash-V2-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Qwopus3.8-27B-Flash-V2-i1-GGUF/resolve/main/Qwopus3.8-27B-Flash-V2.imatrix.gguf
- Guía general de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización (ikawrakow, citada por el autor): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre elección de cuantizaciones (citadas por el autor): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
