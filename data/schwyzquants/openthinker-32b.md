# schwyzquants/OpenThinker-32B

## Resumen

OpenThinker-32B es un modelo de lenguaje de razonamiento de 32.763.876.352 parámetros (unos 32,8 mil millones), desarrollado por el equipo de Open Thoughts y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino completo (full fine-tuning) de Qwen2.5-32B-Instruct sobre el dataset OpenThoughts-114k, un conjunto de datos de razonamiento destilado a partir de DeepSeek-R1 mediante el pipeline de generación de datos publicado por el propio equipo. Su objetivo es ofrecer capacidades de razonamiento tipo cadena de pensamiento con pesos, datos y código totalmente abiertos, algo poco habitual en modelos de este tamaño.

El modelo conserva la arquitectura transformer decoder-only densa de la familia Qwen2, por lo que no emplea mezcla de expertos ni mecanismos de atención alternativa. El entrenamiento se realizó con una longitud de contexto de 16.384 tokens durante 3 épocas, con una tasa de aprendizaje de 1e-5, sobre 8 nodos de AWS SageMaker con GPUs H100 (aproximadamente 90 horas en 4 nodos). El modelo base Qwen2.5-32B-Instruct declara 32.768 tokens de contexto nativo, ampliables con YaRN, aunque la ventana efectiva tras el ajuste es la usada en entrenamiento.

Su relevancia actual radica en que compite directamente con DeepSeek-R1-Distill-Qwen-32B (entrenado sobre 800.000 ejemplos de datos cerrados) usando solo 114.000 ejemplos abiertos: supera ligeramente al modelo de DeepSeek en MATH500 (90,6 frente a 89,4) y GPQA Diamond (61,6 frente a 57,6), y queda por detrás en AIME24, AIME25 y LiveCodeBench v2. El repositorio identificado como `schwyzquants/OpenThinker-32B` es una réplica de terceros del original `open-thoughts/OpenThinker-32B`, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 |
| Parámetros totales | 32.763.876.352 (~32,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens durante el fine-tuning; el modelo base Qwen2.5-32B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers); precisión no especificada en la información disponible |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Dataset de ajuste | open-thoughts/OpenThoughts-114k (114.000 ejemplos) |
| Tamaño del repositorio | 65,5 GB |
| Pipeline declarado | text-generation |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la serie Qwen2, con normalización RMSNorm, atención con sesgo QKV y tokenizador BPE de Qwen. No introduce innovaciones arquitectónicas propias como decodificación especulativa, atención lineal, SSM ni capas híbridas; toda la aportación del trabajo está en la receta de datos y en el procedimiento de ajuste.

El entrenamiento consistió en un fine-tuning supervisado completo de Qwen2.5-32B-Instruct sobre OpenThoughts-114k durante 3 épocas, con contexto de 16.384 tokens, learning rate 1e-5, scheduler coseno con warmup del 10 %, optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), batch total de 96 (batch 1 por dispositivo, 32 dispositivos, 3 pasos de acumulación de gradiente) y semilla 42. Se utilizó LlamaFactory (Transformers 4.46.1, PyTorch 2.3.0, Datasets 3.1.0, Tokenizers 0.20.3). El cómputo se ejecutó en AWS SageMaker con nodos P5 de 8xH100, tardando unas 90 horas en 4 nodos. Para la variante entrenada sobre OpenThoughts-Unverified-173k se emplearon 96 nodos de 4xA100 de 64 GB en el supercomputador Leonardo, con 30 horas de entrenamiento y un coste total de 11.520 horas A100. No se documenta en la información disponible ninguna fase posterior de RLHF, DPO o RLVR.

La innovación principal es la destilación de cadenas de razonamiento de DeepSeek-R1 mediante un pipeline reproducible y publicado (github.com/open-thoughts/open-thoughts), que genera el dataset OpenThoughts-114k. El resultado es un modelo que produce trazas de razonamiento largas antes de la respuesta final, entrenado exclusivamente con datos abiertos y con un coste computacional documentado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct y reforzada con datos de razonamiento.
- Razonamiento matemático de competición: resolución de problemas tipo AIME y MATH con cadenas de pensamiento extensas.
- Razonamiento científico y de conocimiento avanzado, evaluado mediante GPQA Diamond.
- Generación de código: evaluación declarada en LiveCodeBench v2 (LCBv2).
- Modo de razonamiento explícito: el modelo tiende a emitir una traza de pensamiento antes de la respuesta, comportamiento inducido por el dataset de destilación de DeepSeek-R1.
- Capacidades conversacionales e instrucciones generales, dado que parte de Qwen2.5-32B-Instruct, que es un modelo ajustado por instrucciones.
- Soporte multilingüe: heredado potencialmente del modelo base, pero no declarado explícitamente en la información proporcionada.
- Soporte de tool calling / function calling: no declarado en la información disponible (el modelo base Qwen2.5-Instruct sí lo soporta, pero no se confirma que se conserve tras este ajuste).
- Capacidades de agente y razonamiento multi-paso: no declaradas explícitamente en la información disponible.
- Visión y audio: no soportados (modelo puramente textual).

## Casos de uso

- Razonamiento matemático asistido: resolución de problemas de nivel universitario o de competición generando la traza de pensamiento completa, con un rendimiento declarado de 90,6 en MATH500 y 66,0/53,3 en AIME24/AIME25, adecuado para tutoría automática o verificación de soluciones.
- Generación de código en producción: el rendimiento declarado de 68,9 en LiveCodeBench v2 lo sitúa como candidato para autocompletado, generación de tests y revisión de parches, integrándose en pipelines de CI/CD mediante la API de transformers o TGI.
- Evaluación de razonamiento científico: uso en pipelines de QA sobre literatura técnica (61,6 en GPQA Diamond) para tareas de cribado que requieren justificar la respuesta paso a paso.
- Destilación de modelos menores: al ser un modelo abierto con licencia Apache 2.0, puede emplearse como profesor para generar trazas de razonamiento y entrenar modelos más pequeños, replicando el propio proceso de OpenThoughts-114k.
- Investigación en recetas de datos: sirve como punto de comparación reproducible frente a LIMO-32B, s1.1-32B y DeepSeek-R1-Distill-Qwen-32B, ya que pesos, datos, código de generación, código de evaluación (Evalchemy) y código de entrenamiento (LlamaFactory) son públicos.
- Asistente técnico conversacional multi-turno: con 16.384 tokens de contexto efectivo permite mantener conversaciones con documentación técnica extensa adjunta, siempre que el uso no exija ventanas mayores.
- Generación de soluciones paso a paso para documentación: producción de explicaciones pedagógicas con razonamiento explícito para plataformas educativas.
- Procesamiento por lotes en servidores con GPUs de 80 GB: razonamiento offline sobre grandes volúmenes de consultas técnicas aprovechando el soporte declarado de text-generation-inference.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (el campo `model-index` del repositorio está vacío, por lo que estas cifras proceden de la tabla publicada en el README). Evaluados con la herramienta abierta Evalchemy.

| Modelo | Tamaño del dataset | AIME24 I/II | AIME25 I | MATH500 | GPQA Diamond | LCBv2 |
|---|---|---|---|---|---|---|
| LIMO-32B | 0,8k | 56,7 | 49,3 | 86,6 | 58,1 | 60,0 |
| s1-32B | 1k | 36,0 | 25,3 | 84,8 | 50,5 | 40,9 |
| s1.1-32B | 1k | 64,7 | 49,3 | 89,0 | 60,1 | 65,5 |
| DeepSeek-R1-Distill-Qwen-32B | 800k (cerrado) | **76,7** | **55,9** | 89,4 | 57,6 | **71,2** |
| **OpenThinker-32B** | 114k | 66,0 | 53,3 | **90,6** | **61,6** | 68,9 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras siguientes para cuantizaciones distintas de bf16 son estimaciones derivadas del número de parámetros (32,8 B), no datos confirmados por el autor.

- Pesos en bf16/fp16: aproximadamente 65,5 GB solo de pesos, lo que coincide con el tamaño del repositorio (65,5 GB). Requiere al menos una GPU de 80 GB y deja poco margen para caché KV y activaciones a 16k de contexto.
- Configuración recomendada en bf16: 2x A100 80 GB, 2x H100 80 GB o 2x H200; también válido 4x A100 40 GB con tensor parallelism.
- FP8 (estimación): en torno a 33 GB de pesos, cabe en 1x H100 80 GB o 1x A100 80 GB con margen amplio.
- Cuantización de 4 bits estilo AWQ/GPTQ/GGUF Q4 (estimación): en torno a 18-20 GB, por lo que cabría en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090, con contexto limitado.
- Cuantización de 8 bits (estimación): en torno a 33-35 GB; no cabe en GPUs de consumo de 24 GB, requiere 2x RTX 4090/3090 o una GPU profesional de 48 GB o más.
- GPU de consumo: no cabe en ninguna GPU de consumo en bf16; sí en RTX 4090/3090/5090 con cuantización de 4 bits.
- Despliegue: transformers (librería declarada), text-generation-inference (tag declarado), vLLM y SGLang como opciones estándar para pesos safetensors. llama.cpp y Ollama solo si existen conversiones GGUF, que no se confirman en la información disponible (los tags no incluyen GGUF).
- Entrenamiento de referencia: 8xH100 por nodo en AWS SageMaker (4 nodos, ~90 horas); 96 nodos de 4xA100 64 GB en Leonardo para la variante Unverified.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de entrenamiento | MATH500 | GPQA Diamond | LCBv2 |
|---|---|---|---|---|---|---|---|
| OpenThinker-32B | ~32,8 B | 16k en ajuste (32k nativos del base) | Apache 2.0 | 114k abiertos | 90,6 | 61,6 | 68,9 |
| LIMO-32B | ~32 B | No disponible | No disponible en la información proporcionada | 0,8k | 86,6 | 58,1 | 60,0 |
| s1.1-32B | ~32 B | No disponible | No disponible en la información proporcionada | 1k | 89,0 | 60,1 | 65,5 |
| DeepSeek-R1-Distill-Qwen-32B | ~32 B | No disponible | No disponible en la información proporcionada | 800k (cerrado) | 89,4 | 57,6 | 71,2 |

Todas las alternativas comparten el mismo modelo base (Qwen2.5-32B) o uno equivalente, y superan a OpenThinker-32B en AIME24, AIME25 y LiveCodeBench v2, mientras que OpenThinker-32B lidera en MATH500 y GPQA Diamond. La diferencia clave a favor de OpenThinker-32B es la apertura completa: pesos, dataset, código de generación de datos y código de entrenamiento son públicos, algo que no ocurre en el caso de DeepSeek-R1-Distill-Qwen-32B.

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo genera trazas de razonamiento largas y plausibles que pueden contener pasos incorrectos, derivando en respuestas finales erróneas con apariencia de rigor. No se declara ningún mecanismo de verificación o abstención.
- Sesgos: no documentados en la información disponible. Se heredan los del modelo base Qwen2.5-32B-Instruct y los del dataset destilado de DeepSeek-R1, cuyo contenido y sesgos no se detallan en esta ficha.
- Limitación de contexto: el ajuste se realizó con 16.384 tokens. Aunque el modelo base soporte 32.768 tokens nativos, el comportamiento por encima de la ventana de entrenamiento no está garantizado y puede degradarse.
- Idiomas: no se declaran idiomas soportados. Aunque el base es multilingüe, no hay confirmación de que el ajuste haya preservado ese comportamiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar de forma independiente los términos asociados al dataset OpenThoughts-114k y a los datos destilados de DeepSeek-R1, así como la licencia del modelo base.
- Repositorio no oficial: el identificador `schwyzquants/OpenThinker-32B` corresponde a una réplica subida por un tercero, con 0 descargas y 0 likes y sin verificación aparente del contenido. Para uso en producción debe preferirse el repositorio oficial `open-thoughts/OpenThinker-32B`, cuyo contenido no se puede confirmar como idéntico sin una comprobación de hashes.
- Fecha de creación anómala en los metadatos del repositorio (2026-09-14), posterior a la fecha de esta ficha, lo que refuerza la necesidad de validar el origen de los pesos.
- Benchmarks: el campo `model-index` del repositorio está vacío; todas las cifras proceden de la tabla del README del autor y no han sido reproducidas de forma independiente en la información disponible.
- Cuantizaciones publicadas: no confirmadas. Cualquier uso en GPUs de consumo requiere generar la cuantización por cuenta propia y validar la pérdida de calidad.
- Soporte de tool calling y de agentes: no declarado; si un caso de uso depende de function calling, debe validarse empíricamente antes de desplegarlo.

## Enlaces

- Repositorio de HuggingFace de esta ficha: https://huggingface.co/schwyzquants/OpenThinker-32B
- Modelo original: https://huggingface.co/open-thoughts/OpenThinker-32B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog de lanzamiento de Open Thoughts: https://www.open-thoughts.ai/blog/launch
- Blog sobre evaluación con Evalchemy: https://www.open-thoughts.ai/blog/measure
- Blog sobre OpenThinker-32B: https://www.open-thoughts.ai/blog/scale
- Repositorio de GitHub de Open Thoughts: https://github.com/open-thoughts/open-thoughts
- Configuración de entrenamiento de OpenThinker-32B: https://github.com/open-thoughts/open-thoughts/blob/main/train/OpenThinker-32B.yaml
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset OpenThoughts-Unverified-173k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Unverified-173k
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Código de entrenamiento LlamaFactory: https://github.com/hiyouga/LLaMA-Factory
- Modelo OpenThinker-7B: https://huggingface.co/open-thoughts/OpenThinker-7B
- Modelo OpenThinker-7B-Unverified: https://huggingface.co/open-thoughts/OpenThinker-7B-Unverified
- Modelo OpenThinker-32B-Unverified: https://huggingface.co/open-thoughts/OpenThinker-32B-Unverified
