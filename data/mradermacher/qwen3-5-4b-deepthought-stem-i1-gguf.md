# mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF

## Resumen

Qwen3.5-4B-DeepThought-STEM-i1-GGUF es la versión cuantizada en formato GGUF del modelo xtools-at/Qwen3.5-4B-DeepThought-STEM, un ajuste fino (SFT/LoRA) sobre la familia Qwen3.5 de Alibaba, orientado a razonamiento científico y matemático. La cuantización la publica mradermacher, un conocido generador de quants con imatrix para la comunidad de inferencia local. El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), lo que lo sitúa en la gama compacta de la familia Qwen3.5.

El modelo está especializado mediante entrenamiento supervisado sobre trazas de razonamiento destiladas de modelos mayores (etiquetas que mencionan Claude Haiku, ChatGPT, GLM, MiMo y GPT), además de datasets sintéticos específicos de descubrimiento de fármacos y formulación farmacéutica. Incorpora además técnicas de "abliteration"/decensoring (etiquetas heretic, uncensored, decensored, abliterated), lo que implica que se han reducido los mecanismos de rechazo del modelo original.

Esta ficha cubre la variante i1 (imatrix) publicada por mradermacher, que ofrece un abanico de cuantizaciones desde Q2_K (2,1 GB) hasta Q6_K (3,7 GB), pensadas para ejecución en hardware de consumo mediante llama.cpp y derivados. Es relevante para quien necesite un modelo pequeño, ejecutable en local, con foco en STEM y razonamiento, y dispuesto a asumir los riesgos de un modelo decensored.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen3.5 con 4,3 mil millones de parámetros. El ajuste fino se realizó mediante SFT (supervised fine-tuning) con LoRA/PEFT sobre el modelo base Qwen3.5-4B, según las etiquetas del repositorio (lora, peft, sft, unsloth). Los datos de entrenamiento combinan varios datasets de trazas de razonamiento destiladas de modelos de mayor tamaño (Claude Haiku 5.5, ChatGPT 6.1, GLM 5.1, Xiaomi MiMo 2.6, GPT-5.6) junto con datasets sintéticos de descubrimiento de fármacos y formulación farmacéutica, y el dataset generalista smoltalk2 de HuggingFaceTB. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición exacta de la mezcla.

La cuantización i1 de mradermacher aplica una matriz de importancia (imatrix) para ponderar la cuantización de los tensores, lo que en la práctica mejora la calidad respecto a los quants estáticos del mismo tamaño. El repositorio indica además que el modelo base es multimodal (visión), pero los ficheros mmproj, si existen, se alojan en el repositorio de quants estáticos, no en este. No se dispone de información sobre innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto y razonamiento de varios pasos, con foco declarado en STEM (matemáticas, ciencia, ingeniería).
- Razonamiento matemático y científico reforzado mediante destilación de trazas de modelos mayores.
- Conocimiento especializado en descubrimiento de fármacos y formulación farmacéutica (datasets específicos incluidos en el entrenamiento).
- Conversación multi-turno (etiqueta conversational).
- Capacidad de visión heredada del modelo base (los ficheros mmproj, si proceden, están en el repositorio estático).
- Comportamiento "decensored"/"abliterated": menor tendencia a rechazar peticiones que el modelo original.
- Compatibilidad con endpoints y text-generation-inference según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step tool use: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés.

## Casos de uso

- Tutoría y resolución de problemas STEM en local: el modelo puede resolver ejercicios de matemáticas y física paso a paso, con trazas de razonamiento, ejecutándose en una GPU de consumo gracias a sus cuantizaciones de 2-3 GB.
- Asistencia en investigación farmacéutica preliminar: dado su entrenamiento específico en descubrimiento de fármacos y formulación, puede generar hipótesis y borradores de protocolos, siempre con revisión humana por el riesgo de alucinación.
- Generación de documentación técnica y científica: redacción de resúmenes, explicaciones y notas de laboratorio en inglés, aprovechando su orientación a lenguaje académico.
- Prototipado de asistentes conversacionales especializados: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para iterar rápidamente en entornos de desarrollo sin costes de API.
- Inferencia en el borde o en equipos sin GPU dedicada: las cuantizaciones Q2-Q4 permiten ejecución en CPU mediante llama.cpp u Ollama, útil para demos y pruebas offline.
- Filtrado y clasificación de contenido científico: puede emplearse para etiquetar o resumir abstracts y textos técnicos en pipelines de procesamiento por lotes.
- Investigación sobre alineación y decensoring: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K) hasta 3,7 GB (Q6_K) solo para los pesos; añadir overhead de contexto y KV cache (típicamente 0,5-2 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es pequeño y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 6 GB o más; también en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (según etiquetas), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers/vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DeepThought-STEM-i1-GGUF (este) | 4,3 B | no disponible | Apache 2.0 | GGUF | Especializado STEM, decensored, quants imatrix |
| xtools-at/Qwen3.5-4B-DeepThought-STEM (base) | 4,3 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar, multimodal |
| Qwen3.5-4B (familia base) | 4,3 B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo generalista de referencia de la familia |
| mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF | 4,3 B | no disponible | Apache 2.0 | GGUF | Quants estáticos (sin imatrix) del mismo modelo |

## Limitaciones y advertencias

- Modelo "abliterated"/"decensored": se han reducido los mecanismos de rechazo, por lo que puede generar contenido sensible o inapropiado sin filtros; no recomendado para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo de alucinación elevado en dominios especializados (farmacéutico, científico): las trazas de razonamiento destiladas no garantizan corrección factual; requiere validación humana en contextos críticos.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de destilación pueden tener condiciones adicionales que conviene revisar antes de producción.
- El modelo base es multimodal, pero esta variante GGUF no incluye necesariamente los ficheros mmproj; verificar en el repositorio estático antes de asumir capacidades de visión.
- Modelo pequeño (4,3 B): capacidad de razonamiento limitada frente a modelos de mayor tamaño; adecuado para tareas acotadas, no para razonamiento complejo de nivel frontier.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Quants estáticos del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
