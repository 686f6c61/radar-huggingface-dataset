# mradermacher/Qwen2-VL-7B-Sydney-i1-GGUF

## Resumen

Qwen2-VL-7B-Sydney-i1-GGUF es una cuantizacion en formato GGUF del modelo multimodal Qwen2-VL-7B-Sydney, un ajuste fino del modelo vision-language Qwen2-VL-7B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, que genera versiones con y sin imatrix (calibracion ponderada) para facilitar la inferencia local en hardware modesto. El modelo base fue desarrollado por adamo1139 y ajustado sobre el dataset Sydney_LLaVA_0610, orientado a conversacion multimodal en ingles con un estilo de respuesta caracteristico ("Sydney", asociado al asistente de Bing).

El modelo resuelve el problema de ejecutar un VLM de 7.600 millones de parametros en equipos sin GPU de datacenter, ofreciendo cuantizaciones desde 2,0 GB (IQ1_S) hasta 6,4 GB (Q6_K) que permiten desplegarlo en GPUs de consumo, portatiles e incluso CPUs. La arquitectura subyacente es Qwen2-VL, un transformer multimodal con vision encoder y proyector, con ventana de contexto nativa de 32.768 tokens y soporte de resolucion dinamica de imagenes.

Es relevante ahora porque combina tres factores poco frecuentes: un VLM de 7B con licencia Apache 2.0, cuantizaciones imatrix de alta calidad y compatibilidad con el ecosistema llama.cpp/Ollama, lo que lo hace atractivo para prototipado rapido de aplicaciones de vision y conversacion sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL: vision encoder + proyector + LLM decoder) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen2-VL base soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2-VL-7B-Sydney es un ajuste fino del Qwen2-VL-7B de Alibaba. Qwen2-VL es un transformer multimodal que combina un vision encoder (ViT) con un proyector que mapea las representaciones visuales al espacio del decoder LLM, permitiendo entradas intercaladas de imagen y texto. El ajuste fino de adamo1139 se realizo sobre el dataset Sydney_LLaVA_0610, un conjunto orientado a conversacion multimodal en ingles; no se dispone de detalles publicados sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion i1 de mradermacher emplea calibracion imatrix (importance matrix), que pondera los tensores segun su relevancia para la perplejidad en un corpus de calibracion, mejorando la calidad frente a cuantizaciones estaticas del mismo tamano. El autor indica que las versiones IQ suelen ser preferibles a las no-IQ de tamano similar. No se documentan innovaciones tecnicas adicionales en la model card (decodificacion especulativa, attention linear, etc.).

## Capacidades

- Generacion de texto conversacional en ingles con estilo caracteristico del personaje "Sydney".
- Comprension de imagenes: el modelo base Qwen2-VL acepta imagenes como entrada y responde preguntas sobre ellas (VQA, descripcion, OCR visual).
- Conversacion multiturno multimodal (imagen + texto intercalados).
- Razonamiento visual basico y descripcion de escenas.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Capacidades especiales (thinking mode, audio, etc.): no documentadas.

## Casos de uso

- Prototipado local de asistentes visuales: gracias a las cuantizaciones desde 2,0 GB, se puede desplegar en un portatil con GPU de 8 GB y probar flujos de conversacion imagen-texto sin infraestructura cloud.
- Descripcion automatica de imagenes en pipelines de preprocesado: el modelo puede generar descripciones y etiquetas para catalogos de imagenes en lotes, ejecutandose en una sola GPU de consumo con la cuantizacion Q4_K_M (4,8 GB).
- Educacion e investigacion en multimodalidad: sirve como banco de pruebas de bajo coste para estudiar el comportamiento de VLMs ajustados con personalidad, comparando cuantizaciones IQ frente a Q_K.
- Chatbots tematicos con entrada de imagen: el ajuste Sydney permite construir asistentes con un tono conversacional concreto para demos y pruebas de UX.
- Analisis de capturas de pantalla y documentos: el modelo base Qwen2-VL soporta OCR visual; con la cuantizacion Q5_K_M (5,5 GB) se puede integrar en herramientas de extraccion de texto de imagenes.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes, lo que permite medir el impacto de la cuantizacion en calidad y latencia sobre una misma tarea multimodal.
- Despliegue en CPU para entornos sin GPU: las variantes IQ2 e IQ3 (2,4-3,7 GB) permiten inferencia en CPU con llama.cpp, util para pruebas offline o entornos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): 2,0 GB (IQ1_S) a 6,4 GB (Q6_K); con overhead de contexto y vision encoder, anadir aproximadamente 1-2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las cuantizaciones mayores con contexto largo; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, desde una GTX 1650 4 GB con IQ2/IQ3 hasta una RTX 4090 con Q6_K y contexto extendido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este modelo; para esos backends habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2-VL-7B-Sydney-i1-GGUF (este) | 7,6B | no disponible (base 32k) | Apache 2.0 | GGUF | Ajuste con personalidad Sydney, solo ingles |
| Qwen2-VL-7B-Instruct (Alibaba) | 7,6B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial instruct, multilingue |
| LLaVA-1.6-7B (Mistral/Vicuna) | ~7B | 4.096 tokens | Apache 2.0 / otros | safetensors, GGUF | VLM popular, contexto mas corto |
| Qwen2-VL-2B-Instruct | 2,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Version pequena, menor calidad pero mas ligera |

## Limitaciones y advertencias

- El ajuste Sydney puede introducir sesgos de personalidad y respuestas con tono inconsistente o no alineado con politicas de seguridad estandar.
- Riesgo de alucinacion: como todo LLM, puede inventar contenido sobre imagenes ambiguas o de baja resolucion; el ajuste conversacional puede agravar este riesgo.
- Idioma limitado a ingles segun la model card; el rendimiento en castellano no esta garantizado ni documentado.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el autor las describe como "for the desperate" o "mostly desperate".
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste pueden arrastrar terminos adicionales no reflejados en la model card; conviene verificar el modelo base adamo1139/Qwen2-VL-7B-Sydney.
- El dataset de ajuste (Sydney_LLaVA_0610) no esta documentado en detalle; se desconoce su procedencia y posibles sesgos.
- No hay benchmarks publicados, por lo que no se puede evaluar objetivamente la calidad frente al Qwen2-VL-7B-Instruct original.
- El modelo esta pensado para experimentacion; no se recomienda su uso en produccion con requisitos de seguridad o compliance sin una evaluacion previa.

## Enlaces

- [Hugging Face: mradermacher/Qwen2-VL-7B-Sydney-i1-GGUF](https://huggingface.co/mradermacher/Qwen2-VL-7B-Sydney-i1-GGUF)
- [Modelo base: adamo1139/Qwen2-VL-7B-Sydney](https://huggingface.co/adamo1139/Qwen2-VL-7B-Sydney)
- [Cuantizaciones estaticas: mradermacher/Qwen2-VL-7B-Sydney-GGUF](https://huggingface.co/mradermacher/Qwen2-VL-7B-Sydney-GGUF)
- [Dataset: adamo1139/Sydney_LLaVA_0610](https://huggingface.co/datasets/adamo1139/Sydney_LLaVA_0610)
- [Pagina de descargas del autor](https://hf.tst.eu/model#Qwen2-VL-7B-Sydney-i1-GGUF)
- [FAQ y peticiones de cuantizacion](https://huggingface.co/mradermacher/model_requests)
- [Guia de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas sobre cuantizaciones (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
