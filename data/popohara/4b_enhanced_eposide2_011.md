# Popohara/4B_enhanced_eposide2_011

## Resumen

Popohara/4B_enhanced_eposide2_011 es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario Popohara en Hugging Face. Se trata de un modelo multimodal de tipo imagen-texto-a-texto (image-text-to-text), orientado a tareas conversacionales, con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) y un tamaño de repositorio de 9,3 GB en formato safetensors. La licencia declarada es Apache 2.0.

El modelo hereda la arquitectura del Qwen3.5-4B: un transformer causal con codificador de visión, que combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention), y un FFN de dimensión intermedia 9216. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens según la model card del modelo base. Incorpora entrenamiento con MTP (multi-token prediction) en varios pasos.

La relevancia de esta ficha es doble: por un lado, documenta un finetune comunitario con cero descargas y cero likes en el momento de la consulta, lo que lo sitúa como un artefacto experimental de muy baja adopción; por otro, permite entender las capacidades del Qwen3.5-4B subyacente, que según su model card alcanza paridad con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual. No se dispone de información sobre el proceso de ajuste específico aplicado por Popohara ni sobre los datos utilizados en el finetune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; FFN con dimensión intermedia 9216 |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | no disponible (no se declara como MoE en la información del finetune; la model card del base menciona "sparse Mixture-of-Experts" en las highlights, pero no se detalla el número de parámetros activos para esta variante de 4B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible para el finetune; la model card del base declara soporte para 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida poco convencional: 32 capas organizadas en 8 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La dimensión oculta es 2560, el embedding de tokens es 248320 (con padding) y la salida LM está atada al embedding. El modelo se entrenó con MTP (multi-token prediction) en varios pasos, lo que puede favorecer la decodificación especulativa y el throughput.

Según la model card del base, Qwen3.5 se entrenó con fusión temprana sobre tokens multimodales, alcanzando paridad con Qwen3 y superando a Qwen3-VL en razonamiento, código, agentes y comprensión visual. También se menciona un escalado de RL sobre entornos con millones de agentes y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el finetune de Popohara aplicó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text, por lo que acepta imágenes y texto como entrada y produce texto.
- Razonamiento y conocimiento general: el base reporta resultados en MMLU-Pro y MMLU-Redux (ver sección de benchmarks).
- Comprensión visual: la model card del base indica superioridad frente a Qwen3-VL en benchmarks de comprensión visual.
- Código y agentes: la model card del base menciona mejoras en coding y agentes respecto a generaciones anteriores.
- Soporte multilingüe: el base declara 201 idiomas y dialectos; no se confirma que el finetune preserve esta cobertura.
- Tool calling / function calling: no disponible en la información proporcionada para este finetune.
- Modo thinking: no disponible en la información proporcionada para este finetune.
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto con una pregunta en texto y devolver una respuesta razonada, aprovechando su contexto nativo de 262.144 tokens para procesar documentos extensos en una sola pasada.
- Asistentes conversacionales multimodales: al ser un modelo conversacional con pipeline image-text-to-text, encaja en interfaces de chat donde el usuario adjunta imágenes y espera respuestas contextualizadas multi-turno.
- Extracción de información de figuras y tablas: útil para pipelines de digitalización donde se necesita transcribir o resumir el contenido de gráficos e infografías, combinando el codificador de visión con el LM causal.
- Prototipado de agentes visuales: con contexto extensible hasta 1.010.000 tokens, puede mantener historiales largos de interacción con herramientas y observaciones visuales en entornos de investigación.
- Evaluación comparativa de finetunes: al ser un finetune comunitario sobre Qwen3.5-4B-Base, sirve como punto de partida para estudiar el efecto del ajuste sobre las capacidades del base en tareas específicas.
- Despliegue en hardware moderado: con ~4,66 B de parámetros y pesos safetensors de 9,3 GB, es viable en GPUs de consumo para experimentación, aunque no se han publicado requisitos oficiales.

## Benchmarks y rendimiento

La model card del base incluye resultados para Qwen3.5-4B en comparación con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B. Los datos disponibles en la información proporcionada son parciales (la tabla se corta en MMLU-Redux):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el fragmento | no disponible en el fragmento |

No se han publicado resultados de benchmarks específicos para el finetune Popohara/4B_enhanced_eposide2_011 en la información disponible. Los datos anteriores corresponden al modelo base Qwen3.5-4B y no deben atribuirse al finetune.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16-24 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se han publicado variantes cuantizadas oficiales para este finetune.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en FP16 con contexto moderado; GPUs de 8-12 GB solo con cuantización agresiva.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 con contexto limitado, y en GPUs de 8-12 GB si se generan cuantizaciones GGUF (no publicadas en el repo).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers (según la model card del base). No se confirma compatibilidad con llama.cpp u Ollama para este finetune concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Popohara/4B_enhanced_eposide2_011 | ≈4,66 B | 262.144 nativos (extensible a 1.010.000) | Apache 2.0 | safetensors | Finetune comunitario, 0 descargas, sin benchmarks propios |
| Qwen/Qwen3.5-4B-Base | ≈4 B (según model card) | 262.144 nativos (extensible a 1.010.000) | Apache 2.0 | safetensors | Modelo base oficial; benchmarks MMLU-Pro 79,1 |
| Qwen3.5-9B | 9 B (según model card) | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | MMLU-Pro 82,5; mayor tamaño y rendimiento |
| GPT-OSS-20B | 20 B | no disponible | no disponible | no disponible | MMLU-Pro 74,8; referencia comparativa de la model card |

La comparativa se limita a los datos presentes en la información proporcionada; no se dispone de resultados de benchmarks del finetune ni de alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- El finetune no tiene descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y de informes de uso en producción.
- No se han publicado benchmarks específicos del finetune; los resultados de MMLU-Pro y MMLU-Redux corresponden al modelo base y no garantizan el rendimiento tras el ajuste.
- No se detalla el dataset de finetune ni el proceso de alineación, por lo que se desconoce si se introdujeron sesgos o se degradaron capacidades del base.
- La model card del finetune reproduce la del base Qwen3.5-4B; no hay documentación propia del autor sobre cambios, limitaciones o uso previsto.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4 B; no hay evaluaciones de fidelidad factual para este finetune.
- Cobertura idiomática no confirmada para el finetune, aunque el base declara 201 idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un finetune comunitario conviene verificar la procedencia de los datos de ajuste antes de desplegarlo en producción.
- No se ofrecen cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión.
- El pipeline image-text-to-text requiere verificar que el tokenizador y el procesador de visión estén correctamente incluidos en el repo antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Popohara/4B_enhanced_eposide2_011
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
