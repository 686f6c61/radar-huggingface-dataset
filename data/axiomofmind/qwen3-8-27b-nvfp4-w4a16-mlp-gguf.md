# axiomofmind/Qwen3.8-27B-NVFP4-W4A16-MLP-GGUF

## Resumen

El modelo `axiomofmind/Qwen3.8-27B-NVFP4-W4A16-MLP-GGUF` es una cuantización selectiva en formato GGUF del modelo multimodal denso Qwen3.8-27B, desarrollado por Alibaba. La conversión ha sido realizada por el usuario axiomofmind utilizando NVIDIA Model Optimizer, con el objetivo de reducir el peso del modelo para su ejecución en hardware local mediante `llama.cpp`, manteniendo una alta fidelidad al cuantizar únicamente las capas MLP del backbone a NVFP4 (4 bits) y dejando el resto de componentes (atención, atención lineal, embeddings, cabeza de salida, pesos MTP y módulos de visión) en BF16/F32.

El modelo base Qwen3.8-27B es un transformer denso de 27.320 millones de parámetros con arquitectura híbrida de atención: solo 16 de sus 64 capas utilizan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Esta arquitectura, combinada con la cuantización NVFP4 selectiva, permite ejecutar el modelo en GPUs de consumo con una ventana de contexto de hasta 256K tokens (heredada del modelo base), aunque el ejemplo de lanzamiento proporcionado usa 32K. El modelo incluye soporte nativo para razonamiento (thinking mode), decodificación especulativa con MTP (Multi-Token Prediction) y compatibilidad con el drafter DFlash 2, lo que lo hace especialmente relevante para tareas de agente, generación de código y automatización de oficina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal), 64 capas, 16 con atención completa y 48 con atención lineal |
| Parametros totales | 27.320.698.048 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (heredada del modelo base; el ejemplo de uso usa 32K) |
| Tipos de cuantizacion | NVFP4 (4 bits) solo en capas MLP; atención, embeddings y resto en BF16/F32 |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base Qwen3.8-27B soporta principalmente inglés y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal de 30,06 GB + mmproj de 0,93 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es un transformer denso con una mezcla híbrida de atención: de las 64 capas, solo 16 utilizan atención completa (con intervalo `full_attention_interval: 4`), mientras que las 48 restantes emplean atención lineal con un estado recurrente constante. Esta configuración reduce el coste computacional en contextos largos sin sacrificar la capacidad de modelado. La cuantización NVFP4 aplicada por axiomofmind afecta exclusivamente a los pesos de las proyecciones `gate_proj`, `up_proj` y `down_proj` de las capas MLP del backbone (192 tensores en total), manteniendo las activaciones en 16 bits y el resto de componentes en BF16/F32. La calibración se realizó de forma independiente sobre el checkpoint oficial BF16 de Qwen utilizando NVIDIA Model Optimizer, con una receta conservadora que prioriza la precisión sobre la compresión máxima.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. El modelo base fue desarrollado por el equipo Qwen de Alibaba y se distribuye bajo licencia Apache-2.0.

## Capacidades

- Generación de texto y razonamiento: soporta modo de pensamiento (thinking) con niveles de esfuerzo configurables (`low`, `medium`, `xhigh`) y presupuesto de tokens de razonamiento.
- Multimodal: acepta entrada de imagen a través del proyector de visión BF16 incluido (`mmproj`), lo que permite tareas de imagen-a-texto.
- Generación de código: el modelo base destaca en tareas de programación, según la documentación oficial de Alibaba.
- Agente y tool calling: compatible con flujos de agente y automatización de oficina, como se indica en el repositorio oficial.
- Decodificación especulativa: incluye pesos MTP/NextN integrados en el GGUF principal, y es compatible con el drafter externo DFlash 2 para acelerar la generación.
- Multilingüe: aunque no se especifica en la información de la cuantización, el modelo base Qwen3.8-27B soporta principalmente inglés y chino.

## Casos de uso

- Asistente de programación con contexto largo: el modelo puede mantener conversaciones extensas sobre código, con una ventana de 256K tokens que permite incluir repositorios completos o documentación técnica. Su modo de razonamiento `xhigh` ayuda a depurar y explicar algoritmos complejos.
- Automatización de oficina: el modelo base está optimizado para tareas de generación de documentos, hojas de cálculo y presentaciones, pudiendo integrarse en pipelines que requieran comprensión de instrucciones en lenguaje natural y generación de contenido estructurado.
- Análisis de imágenes con razonamiento: gracias al proyector de visión BF16, el modelo puede describir imágenes, extraer información visual y razonar sobre ella, por ejemplo en tareas de inspección de documentos escaneados o capturas de pantalla.
- Agente autónomo con tool calling: su soporte para herramientas y su capacidad de razonamiento multi-paso lo hacen adecuado para construir agentes que consulten APIs, ejecuten comandos o interactúen con sistemas externos.
- Chat conversacional con memoria larga: la combinación de atención lineal y contexto de 256K permite mantener conversaciones de larga duración sin perder el hilo, útil para asistentes virtuales o soporte técnico.
- Traducción y procesamiento multilingüe: aunque la información no detalla los idiomas, el modelo base maneja inglés y chino, por lo que puede usarse para traducción entre ambos idiomas y tareas de procesamiento de texto en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otras cuantizaciones. El único dato de rendimiento mencionado es un ejemplo de ejecución local con DFlash 2: 4.628 tokens generados a 103,18 tokens/s con una tasa de aceptación de borrador del 51,68% en un sistema específico, pero se advierte que es un resultado puntual y no una afirmación universal.

## Requisitos de hardware

- El archivo GGUF principal pesa 30,06 GB; el proyector de visión añade 0,93 GB. Para cargar el modelo completo en GPU se recomienda al menos 32 GB de VRAM (por ejemplo, A100 40GB, RTX 6000 Ada, o dos RTX 3090/4090 con offloading).
- En GPUs de consumo con 24 GB (RTX 3090/4090) es posible ejecutar el modelo con offloading parcial de capas a CPU, reduciendo la ventana de contexto.
- El ejemplo de lanzamiento usa `--ctx-size 32768` y `--n-gpu-layers -1` (todas las capas en GPU), lo que requiere una GPU con suficiente VRAM para los pesos más la caché KV (Q8_0 en el ejemplo).
- Opciones de despliegue: `llama.cpp` (llama-server) con soporte nativo NVFP4 y Qwen3.8, `vLLM` (según la documentación de vLLM Recipes), y potencialmente Ollama o TGI si incorporan soporte para este formato.
- Latencia y throughput: no hay datos generales; el ejemplo con DFlash 2 reporta 103,18 tokens/s en un sistema concreto, pero depende del hardware, la configuración de contexto y el esfuerzo de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27,3B | 256K | BF16 | Apache-2.0 | Safetensors |
| Qwen3.8-27B-NVFP4-W4A16-MLP (este) | 27,3B | 256K | NVFP4 (MLP) + BF16 | Apache-2.0 | GGUF |
| Qwen3.8-27B-ShortThink-NVFP4-GGUF (sanbanfu) | 27,3B | 256K | NVFP4 | Apache-2.0 | GGUF |
| Qwen3.8-27B (Unsloth GGUF) | 27,3B | 256K | Q4_K_M, etc. | Apache-2.0 | GGUF |

La comparativa se basa en el tamaño y la cuantización; no hay datos de rendimiento disponibles para establecer diferencias de calidad. La cuantización selectiva de este repo prioriza la precisión en atención y embeddings, mientras que otras opciones como Q4_K_M comprimen todo el modelo de forma más agresiva.

## Limitaciones y advertencias

- La cuantización NVFP4 se aplica solo a las capas MLP; aunque es conservadora, puede introducir una ligera pérdida de precisión en comparación con el modelo BF16 original, especialmente en tareas que dependen fuertemente de las transformaciones de feed-forward.
- Se requiere una versión reciente de `llama.cpp` con soporte nativo para NVFP4 y Qwen3.8; builds antiguos pueden no cargar el archivo correctamente.
- El uso de DFlash 2 como drafter externo no está incluido en el repositorio y requiere una compilación específica de `llama.cpp` (PR #27342).
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no se ha realizado una evaluación específica de estos riesgos en esta cuantización.
- No se proporcionan datos de benchmarks ni evaluaciones de seguridad para esta versión cuantizada.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución y los términos del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axiomofmind/Qwen3.8-27B-NVFP4-W4A16-MLP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Drafter DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- PR de DFlash 2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27342
