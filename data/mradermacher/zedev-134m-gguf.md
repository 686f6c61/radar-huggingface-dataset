# mradermacher/Zedev-134m-GGUF

## Resumen

Zedev-134m-GGUF es el repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo base Meridian-MRM/Zedev-134m. No se trata de un modelo nuevo, sino de una conversión y cuantización del modelo original para que pueda ejecutarse con llama.cpp y herramientas compatibles en hardware modesto. El modelo subyacente es un transformer causal decoder-only de 134.467.968 parámetros (aproximadamente 134,5 millones), etiquetado en sus metadatos como perteneciente a la familia qwen3 y clasificado por el autor como base-model, es decir, sin ajuste de instrucciones.

El interés de esta publicación es fundamentalmente práctico: el modelo original se distribuye en pesos HuggingFace, mientras que esta versión ofrece doce variantes GGUF que van desde Q2_K (unos 0,2 GB) hasta f16 (unos 0,4 GB), lo que permite desplegarlo en CPU, en GPUs de gama baja o incluso en dispositivos con recursos muy limitados. Está entrenado exclusivamente en inglés y su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Se trata de un modelo muy pequeño y de propósito general, pensado para experimentación con modelos de lenguaje compactos, generación de texto básica y como banco de pruebas para pipelines de cuantización. No se han publicado datos sobre longitud de contexto, composición exacta del dataset ni resultados de benchmarks en la información disponible, lo que limita la evaluación rigurosa de su calidad frente a alternativas de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (etiquetado como qwen3 en los metadatos); detalles de capas, atencion y activaciones no disponibles |
| Parametros totales | 134.467.968 (134,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en formato HuggingFace) |

## Arquitectura y entrenamiento

La información disponible indica que Zedev-134m es un modelo de lenguaje causal (causal-lm) clasificado como base-model y asociado a la arquitectura qwen3, lo que sugiere un transformer decoder-only con las convenciones típicas de esa familia (RMSNorm, atención con RoPE, tokenizador propio). Sin embargo, no se especifican en la model card el número de capas, la dimensión oculta, el número de cabezas de atención, el tamaño del vocabulario ni la longitud de contexto nativa. Tampoco se documenta si emplea atenciones lineales, decodificación especulativa u otras innovaciones.

En cuanto a los datos de entrenamiento, los metadatos del modelo base citan dos conjuntos: HuggingFaceTB/dclm-edu, un corpus de texto educativo filtrado derivado de DCLM, y teknium/OpenHermes-2.5, un dataset de instrucciones y conversaciones en inglés. No se indica el número total de tokens, la proporción entre ambos datasets, ni si hubo fases de ajuste con RLHF, DPO o SFT. La etiqueta base-model apunta a que el artefacto publicado no está alineado para seguir instrucciones, aunque la presencia de OpenHermes-2.5 en el dataset introduce cierta ambigüedad que la documentación no resuelve.

Esta publicación concreta, a cargo de mradermacher, es únicamente un proceso de conversión a GGUF y cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se han publicado cuantizaciones ponderadas ni con imatrix; el propio autor indica que es probable que no las genere y que las peticiones pueden hacerse vía Community Discussion.

## Capacidades

- Generación de texto autoregresiva en inglés, con el modelo base Meridian-MRM/Zedev-134m como origen de los pesos.
- Continuación de texto y modelado de lenguaje general, al tratarse de un modelo catalogado como base y no como instruct.
- Capacidad potencial de seguir instrucciones y mantener diálogo, dado que parte del entrenamiento usó OpenHermes-2.5; no confirmada por el autor ni por evaluaciones publicadas.
- Ejecución local en CPU y GPU de gama baja gracias a las cuantizaciones GGUF de entre 0,2 y 0,4 GB.
- Compatibilidad con herramientas de inferencia que consumen GGUF: llama.cpp, Ollama, LM Studio, llama-cpp-python, entre otras.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés declarado; no hay información sobre otros idiomas.
- Capacidades especiales (modo thinking, visión, audio, razonamiento explícito): no disponibles.

## Casos de uso

- Prototipado y pruebas de pipelines de inferencia: sirve para validar configuraciones de llama.cpp, Ollama o LM Studio con un modelo de 0,2 GB antes de escalar a modelos mayores, reduciendo tiempos de descarga y de carga en memoria.
- Generación de texto de bajo coste en el borde: al ocupar menos de 0,5 GB en f16, puede ejecutarse en dispositivos con poca RAM o en contenedores pequeños donde no caben modelos de miles de millones de parámetros.
- Filtrado y clasificación de texto rápido: con 134 M de parámetros, la latencia por token es muy baja, lo que permite usarlo como extractor de representaciones o para puntuar continuaciones en tareas de selección de candidatos.
- Comparación de calidad entre cuantizaciones: el repositorio ofrece doce variantes, lo que permite medir experimentalmente la degradación de perplejidad entre Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y f16 sobre un mismo corpus en inglés.
- Aprendizaje y docencia sobre cuantización: es un caso de estudio asequible para explicar el flujo HuggingFace a GGUF y el impacto del ancho de bits en el tamaño y la fidelidad del modelo.
- Base para ajuste fino experimental: al estar bajo Apache 2.0, puede reentrenarse o adaptarse con LoRA para dominios concretos en inglés sin coste de licencia, siempre que el hardware lo permita.
- Generación de texto educativo o de relleno: dado el uso de dclm-edu en el entrenamiento, puede emplearse para producir borradores de texto expositivo en inglés, con revisión humana obligatoria por el riesgo de alucinación.
- Evaluación comparativa de modelos pequeños: sirve como punto de referencia interno frente a otros modelos de ~135 M parámetros en tareas de perplejidad y generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ningún otro conjunto de evaluación, y tampoco se aportan datos de perplejidad por tipo de cuantización más allá del gráfico genérico enlazado por el autor (que compara tipos de cuantización de forma general, no resultados de este modelo concreto).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para las cuantizaciones Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0 según los tamaños declarados; unos 0,4 GB para f16.
- Espacio en disco: 1,5 GB para el repositorio completo con todas las variantes; cada archivo individual ocupa 0,2 GB o 0,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre es suficiente (GTX 1050, GTX 1650, RTX 3050, RTX 4090 sobradamente); también tarjetas de centro de datos como A100 o H100, aunque están enormemente sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPUs con memoria compartida suficiente.
- Ejecución en CPU: viable y probablemente el escenario principal; funciona en procesadores de escritorio, portátiles y placas tipo Raspberry Pi 4 o 5 con 1 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no están orientados a GGUF en su flujo estándar, por lo que se recomienda el modelo original en safetensors si se necesita servir con esos motores.
- Latencia y throughput: no se han publicado mediciones. Como estimación orientativa no verificada, un modelo de 134 M en Q4_K_M sobre CPU moderna puede generar del orden de decenas de tokens por segundo, y sobre GPU, cientos o miles, pero estos valores dependen del hardware, del backend y del ancho de banda de memoria, y no están confirmados por el autor.

## Comparativa con modelos similares

Los datos de la columna de Zedev-134m proceden de la información proporcionada; los de los modelos comparables corresponden a su documentación pública y se indican solo como referencia de categoría.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zedev-134m (Meridian-MRM) | 134,5 M | No disponible | Apache 2.0 | HuggingFace, GGUF | Entrenado con dclm-edu y OpenHermes-2.5; sin benchmarks publicados |
| SmolLM2-135M (HuggingFace) | 135 M | 8.192 tokens | Apache 2.0 | Safetensors, GGUF (comunidad) | Modelo pequeno con documentacion detallada y evaluaciones publicadas |
| Qwen3-0.6B (Alibaba) | 0,6 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF (comunidad) | Arquitectura qwen3, con modos de razonamiento; aproximadamente 4,5 veces mas parametros |
| GPT-2 (OpenAI) | 124 M | 1.024 tokens | Licencia permisiva tipo MIT | Safetensors, GGUF | Referencia historica de la misma escala, sin entrenamiento con datos recientes |

No se dispone de resultados de benchmarks de Zedev-134m que permitan una comparación cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- No es un modelo instruct: la etiqueta base-model indica que no ha sido alineado para seguir instrucciones, por lo que su uso en aplicaciones conversacionales requiere ajuste previo o ingeniería de prompts específica.
- Riesgo elevado de alucinación: con 134 M de parámetros, la capacidad de retener conocimiento factual es muy limitada y las afirmaciones generadas deben verificarse siempre.
- Idiomas: solo se declara inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones multi-turno o documentos largos.
- Ausencia de benchmarks: no existen métricas publicadas de MMLU, HumanEval, GSM8K u otras, lo que impide estimar su calidad relativa frente a alternativas.
- Sesgos: al entrenarse con dclm-edu y OpenHermes-2.5, puede heredar sesgos presentes en esos corpus, especialmente de naturaleza occidental y anglófona; no se ha publicado ningún análisis de sesgo.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe; conviene revisar los términos de los datasets de entrenamiento por si imponen condiciones adicionales.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S pueden degradar notablemente la calidad respecto a Q4_K_M o superiores; el autor no proporciona cuantizaciones ponderadas ni con imatrix, que suelen ofrecer mejor relación tamaño/calidad.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad, lo que reduce la confianza en la reproducibilidad de los resultados.
- Herramientas de servicio: al ser GGUF, no es directamente compatible con los flujos estándar de vLLM o TGI; para producción con esos motores debe usarse el modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zedev-134m-GGUF
- Modelo base: https://huggingface.co/Meridian-MRM/Zedev-134m
- Página de resumen de descargas del cuantizador: https://hf.tst.eu/model#Zedev-134m-GGUF
- Dataset dclm-edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Dataset OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Preguntas frecuentes y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de archivos GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
