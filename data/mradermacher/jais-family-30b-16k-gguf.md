# mradermacher/jais-family-30b-16k-GGUF

## Resumen

jais-family-30b-16k-GGUF es la versión cuantizada en formato GGUF del modelo inception42/jais-family-30b-16k, un modelo de lenguaje causal de tipo decoder con 30.817.712.064 parámetros (aproximadamente 30,8 mil millones), especializado en árabe e inglés. La cuantización la ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, y está pensada para ejecutar el modelo con llama.cpp y herramientas compatibles en hardware de consumo o servidores con recursos limitados.

El modelo base pertenece a la familia Jais, orientada al procesamiento del árabe y el inglés, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Esta versión GGUF incluye múltiples niveles de cuantización estática (Q2_K hasta Q6_K), con tamaños que van desde 21,8 GB hasta 33,2 GB, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. También existe una variante con cuantizaciones ponderadas/imatrix publicada por el mismo autor.

La relevancia actual de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 30B bilingüe árabe-inglés en infraestructura local, algo poco habitual en el ecosistema de modelos abiertos, donde la mayoría de alternativas de ese tamaño están centradas en inglés o en chino. Sin embargo, la información pública disponible sobre el modelo base es limitada: no se detallan la composición del dataset, el número de tokens de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (causal-lm), segun tags del modelo |
| Parametros totales | 30.817.712.064 (30,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens (deducido del nombre "16k"; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (estaticas); variantes imatrix en repo separado |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder causal (etiquetado como causal-lm y Decoder en los tags), con 30,8 mil millones de parámetros. La información disponible no especifica detalles sobre el número de capas, dimensiones ocultas, mecanismos de atención (si usa atención lineal, GQA o MQA) ni innovaciones arquitectónicas concretas. Tampoco se documentan en la model card el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica adicional que aporta esta ficha es la relativa al proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y ofrece una variante con imatrix en un repositorio separado, que suele proporcionar mejor calidad por tamaño que las cuantizaciones estáticas equivalentes. El contexto de 16k se infiere del nombre del modelo, pero no se confirma explícitamente en la documentación.

## Capacidades

- Generación de texto en árabe e inglés, con foco en el bilingüismo árabe-inglés.
- Modelo causal de propósito general (causal-lm), adecuado para tareas de continuación y generación.
- Capacidad de razonamiento y respuesta a instrucciones: no confirmada explícitamente en la información disponible (no se indica si es un modelo base o instruct).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a árabe e inglés según los tags.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de contenido en árabe: redacción de artículos, resúmenes y textos corporativos en árabe con un modelo de 30B, aprovechando el enfoque bilingüe de la familia Jais y su ventana de 16k tokens para documentos largos.
- Traducción árabe-inglés y inglés-árabe: el modelo puede emplearse en pipelines de traducción automática o posedición, aunque la calidad debe validarse empíricamente al no haber benchmarks publicados.
- Asistentes conversacionales en árabe: despliegue local con llama.cpp para chatbots de atención al cliente en mercados de habla árabe, con la ventaja de que los datos no salen de la infraestructura propia.
- Procesamiento de documentos largos: con 16k tokens de contexto, es viable resumir contratos, informes o artículos periodísticos en árabe sin truncar el contenido.
- Investigación en PLN árabe: uso como modelo base para fine-tuning en tareas específicas (clasificación, extracción de información, análisis de sentimiento) en árabe, gracias a la licencia Apache 2.0.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (27,1 GB) y Q4_K_M (28,0 GB) permiten ejecutar el modelo en estaciones de trabajo con 32 GB de RAM/VRAM o en configuraciones con GPU de 24 GB mediante offloading parcial.
- Generación de código y matemáticas: no confirmado en la información disponible; no se recomienda asumirlo sin validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 21,8 GB (Q2_K) y 33,2 GB (Q6_K) solo para los pesos; hay que añadir overhead de contexto KV cache (que con 16k tokens y 30B puede ser de varios GB adicionales).
- GPU recomendadas: A100 40GB/80GB, H100, RTX A6000 (48 GB) para carga completa en GPU; RTX 4090 (24 GB) solo permite cuantizaciones parciales con offloading a RAM del sistema.
- Cabe en GPU de consumo: parcialmente. Con 24 GB de VRAM (RTX 3090/4090) es posible ejecutar Q2_K o Q3_K_S con offloading parcial de capas a CPU, a costa de latencia.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jais-family-30b-16k-GGUF (este) | 30,8B | 16k (inferido) | ar, en | Apache 2.0 | GGUF |
| Jais-30B original (inception42) | 30,8B | 16k (inferido) | ar, en | Apache 2.0 | safetensors |
| Modelos 30B bilingues arabe-ingles comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño y enfoque árabe-inglés) en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente con datos de árabe e inglés, puede presentar sesgos culturales y lingüísticos propios de esas fuentes.
- Riesgo de alucinación: no cuantificado; como todo modelo causal de 30B sin benchmarks publicados, se recomienda validación humana en producción.
- Limitaciones de contexto o idioma: el contexto de 16k se infiere del nombre y no está confirmado; los idiomas soportados se limitan a árabe e inglés según los tags.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (inception42/jais-family-30b-16k) por si añade condiciones adicionales.
- Caveats para producción: las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable (la propia model card marca Q3_K_M como "lower quality"); se recomienda Q4_K_M o superior para uso serio. Además, el tamaño del repo (271,1 GB) implica descargas largas y requisitos de almacenamiento considerables.
- No se especifica si el modelo base es instruct o base, lo que afecta a su comportamiento en tareas de instrucciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jais-family-30b-16k-GGUF
- Modelo base: https://huggingface.co/inception42/jais-family-30b-16k
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/jais-family-30b-16k-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#jais-family-30b-16k-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
