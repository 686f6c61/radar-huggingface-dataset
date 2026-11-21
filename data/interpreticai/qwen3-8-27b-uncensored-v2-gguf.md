# InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-27B-Uncensored-v2, desarrollado por Interpretic AI. Se trata de un fine-tune del modelo base Qwen3.8-27B de Alibaba, en el que se ha eliminado en gran medida la censura de caracter politico presente en el modelo original, manteniendo al mismo tiempo el resto de capacidades generales. El repositorio incluye los pesos cuantizados en Q4_K_M (16,8 GB) junto con el proyector de vision en F16 (0,93 GB), lo que permite ejecutar el modelo multimodal completo en llama.cpp y runtimes compatibles.

El modelo conserva la arquitectura del Qwen3.8-27B original, con 27.320.697.856 parametros totales, y anade una cabeza MTP (Multi-Token Prediction) que habilita decodificacion especulativa en las builds de llama.cpp que la soportan. El pipeline declarado es image-text-to-text, de modo que el modelo acepta entradas de imagen y texto. La licencia es Apache 2.0, heredada del modelo base de Qwen, y el repositorio acumula mas de 10.000 descargas desde su publicacion a finales de octubre de 2026.

La relevancia de esta ficha radica en que documenta una variante orientada a reducir el sesgo y la censura politica en respuestas en chino, un fenomeno medido academicamente (Pan y Xu, 2026). El autor reporta una tasa de censura del 3,5% frente al 86,7% del Qwen3.8-27B original, con una perdida acotada en benchmarks de capacidad general (entre 0,5 y 2,8 puntos en GPQA Diamond, IFBench y MMLU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base ofrece BF16, FP8 e IQ3_XXS en otros repositorios |
| Idiomas soportados | no disponible (la evaluacion politica cubre solo preguntas en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M y proyector de vision F16); BF16 y FP8 en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B de Alibaba y se distribuye como un fine-tune orientado a eliminar la censura politica. La arquitectura subyacente es un transformer de 27.320.697.856 parametros con capacidad multimodal (image-text-to-text), ya que el repositorio incluye un proyector de vision separado (`mmproj-Qwen3.8-27B-Uncensored-v2-F16.gguf`). La cabeza MTP (NextN) del modelo original se conserva intacta en la conversion a GGUF, lo que permite aprovechar decodificacion especulativa en llama.cpp.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor si especifica que el componente de valores del modelo se ajusto sobre los prompts de Pan y Xu, lo que implica que la evaluacion de valores es in-sample para esta variante y out-of-sample para el modelo comparable Arete-27B de Nous Research. La evaluacion de censura politica se realizo en modo no-thinking, decodificacion greedy y un maximo de 4.096 tokens de salida, con un juez LLM etiquetando cada respuesta.

## Capacidades

- Generacion de texto y razonamiento general, con rendimiento cercano al Qwen3.8-27B original en GPQA Diamond, IFBench y MMLU.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector de vision incluido.
- Modo thinking y modo no-thinking configurables mediante `--chat-template-kwargs '{"enable_thinking": false}'`.
- Decodificacion especulativa mediante la cabeza MTP conservada, en builds de llama.cpp con soporte.
- Respuestas abiertas a preguntas politicamente sensibles en chino, con una tasa de censura reportada del 3,5%.
- Capacidad de rechazo de peticiones daninas: 95 de 100 peticiones rechazadas en la version BF16.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la evaluacion se limita a preguntas en chino.

## Casos de uso

- Investigacion sobre sesgo y censura en LLM: el modelo sirve como contrapunto controlado al Qwen3.8-27B original para estudiar como varian las respuestas ante preguntas politicamente sensibles, con una tasa de censura medible y reproducible mediante el pipeline de Pan y Xu.
- Analisis de contenido politico en chino: permite obtener respuestas sustantivas (77% de respuestas con sujeto correcto y respuesta abierta, frente al 12% del original) para tareas de analisis comparativo de discursos o politicas.
- Despliegue local multimodal: gracias a los 16,8 GB del Q4_K_M y los 0,93 GB del proyector, puede ejecutarse en estaciones de trabajo con GPU consumer de gama alta para tareas de descripcion de imagenes y respuesta a preguntas visuales.
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion y comparar como distintos modelos manejan peticiones sensibles, dado que el modelo rechaza el 95% de peticiones daninas del set `mlabonne/harmful_behaviors`.
- Generacion de codigo y documentacion tecnica: conserva las capacidades generales del Qwen3.8-27B (MMLU 86,5 en la variante BF16), por lo que puede integrarse en asistentes de desarrollo que requieran ejecucion local.
- Prototipado con llama.cpp: el ejemplo oficial con `llama-server -ngl 999 -c 65536 --jinja` permite levantar un endpoint compatible con la API de chat en una sola maquina, adecuado para pruebas de concepto y demos.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en formato GGUF/BF16/FP8, sirve como base para ajustes adicionales en dominios especificos sin restricciones de licencia comercial.

## Benchmarks y rendimiento

Evaluacion de censura politica (Pan y Xu, 2026), 113 de 115 preguntas, modo no-thinking, greedy, 4.096 tokens maximos:

| Modelo | Respuestas censuradas (de 113) | Tasa de censura |
|---|---|---|
| Qwen3.8-27B | 98 | 86,7% |
| Qwen3.8-27B-Uncensored-v2 Q4_K_M | 4 | 3,5% |

Comparativa con Arete-27B (Nous Research), sobre la release BF16:

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v2 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83% | 50% | 3,5% |
| Rechaza o evade (menor es mejor) | 50% | 23% | 1,7% |
| Reescribe con puntos de vista del PCC (menor es mejor) | 32% | 28% | 1,7% |
| Se alinea con valores del PCC (menor es mejor) | 100% | 30% | 10% |
| Sujeto correcto, respuesta abierta (mayor es mejor) | 12% | 38% | 77% |
| Cabeza MTP para decodificacion especulativa | Si | No | Si |

Capacidad general (release BF16):

| Benchmark | Referencia | Puntuacion de referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (card oficial) | 89,2 | 86,4 | −2,8 |
| IFBench | Qwen3.8-27B (card oficial) | 79,5 | 79,0 | −0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluacion propia) | 87,5 | 86,5 | −1,0 |

Rechazo de peticiones daninas (BF16, primeros 100 prompts de `mlabonne/harmful_behaviors`): 95 de 100 rechazadas (Qwen3.8-27B: 100 de 100).

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 16,8 GB para los pesos del modelo mas 0,93 GB del proyector de vision, mas el espacio de cache KV segun el contexto configurado.
- Contexto de 65.536 tokens: el ejemplo oficial usa `-c 65536`, lo que incrementa de forma notable el consumo de cache KV; conviene reducirlo si la VRAM es limitada.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible; por tamano, una RTX 4090 (24 GB) deberia poder alojar el Q4_K_M con contexto moderado, mientras que A100 o H100 ofrecen margen para contextos largos y mayor throughput.
- Cabe en GPU consumer: si, en modelos con 24 GB o mas de VRAM para el Q4_K_M; la variante IQ3_XXS del repositorio hermano reduce aun mas el requisito.
- Opciones de despliegue: llama.cpp y llama-server (soporte oficial documentado); otros runtimes compatibles con GGUF no se detallan.
- Latencia y throughput: no disponible; el modelo soporta decodificacion especulativa via MTP, lo que puede mejorar el throughput en builds compatibles, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de censura politica | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 | 27,3B | 65.536 (ejemplo de despliegue) | 3,5% | Apache 2.0 | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS |
| Qwen3.8-27B (base) | 27,3B | no disponible | 86,7% | Apache 2.0 | BF16, FP8, GGUF |
| Arete-27B (Nous Research) | no disponible | no disponible | 50% | no disponible | no disponible |
| Qwen3.8-27B-Uncensored-v3 | 27,3B | no disponible | 2,6% | Apache 2.0 (heredada) | BF16, GGUF Q4_K_M, GGUF IQ3_XXS, MLX 4-bit |

La variante v3 se basa en Arete-27B en lugar de Qwen3.8-27B, logra una tasa de censura menor (2,6%) pero no conserva la cabeza MTP ni ofrece FP8. La v2 es preferible si se necesita decodificacion especulativa o FP8.

## Limitaciones y advertencias

- La evaluacion de censura politica cubre unicamente preguntas en chino; el comportamiento en otros idiomas no esta medido.
- Una respuesta sustantiva no implica que sea correcta: el autor recomienda verificar de forma independiente las afirmaciones factuales, y el riesgo de alucinacion persiste como en cualquier LLM.
- El componente de valores se ajusto sobre los prompts de Pan y Xu, por lo que la metrica de valores es in-sample para este modelo y no directamente comparable con evaluaciones out-of-sample de terceros.
- Aunque reduce la censura, el modelo sigue rechazando el 5% de peticiones daninas en la evaluacion BF16; no es un modelo sin filtros.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar la licencia y atribucion del equipo Qwen.
- No se dispone de informacion sobre sesgos mas alla del politico, ni sobre rendimiento multilingue, tool calling o comportamiento agentico.
- El contexto de 65.536 tokens en el ejemplo oficial puede requerir VRAM considerable; en GPUs consumer habra que reducirlo.
- La fecha de creacion del repositorio (2026-10-31) y las referencias a un paper de 2026 deben tratarse como datos del autor, no verificados de forma independiente en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo base BF16: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Variante IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Variante v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante v3 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Variante v3 MLX 4-bit: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Paper de referencia: https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11543
- llama.cpp: https://github.com/ggml-org/llama.cpp
