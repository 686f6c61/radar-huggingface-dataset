# FiorenzoParascandolo/Qwen3-1.7B-BFS-PO

## Resumen

Qwen3-1.7B-BFS-PO es un adaptador LoRA (no un modelo completo) publicado por FiorenzoParascandolo sobre el modelo base Qwen/Qwen3-1.7B. El adaptador se ha entrenado con la técnica BFS-PO (Best-First Search for Large Reasoning Models), descrita en el paper arXiv:2602.14917, y está especializado en razonamiento matemático paso a paso con formato de respuesta dentro de `\boxed{}`. El repositorio contiene únicamente los pesos del adaptador PEFT en formato safetensors; el modelo base debe descargarse por separado.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con aproximadamente 2 000 millones de parámetros, y el adaptador añade un sesgo hacia cadenas de razonamiento más eficientes en el dominio matemático. Según la model card, el entrenamiento se realizó sobre el dataset MetaMathQA-60k con un prompt de sistema fijo y el modo thinking de Qwen3 activado mediante la etiqueta `<think>`.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de ajuste fino por refuerzo sobre un modelo pequeño de la familia Qwen3; por otro, permite evaluar si un adaptador de bajo rango puede mejorar el rendimiento matemático de un modelo de 1,7B sin necesidad de reentrenar los pesos completos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 2 000 millones en el modelo base; el adaptador LoRA no declara su número de parámetros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) segun la model card; el modelo base Qwen3 es multilingue |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-1.7B |
| Libreria | `peft` (compatible con `transformers` y `accelerate`) |
| Dataset de entrenamiento | FiorenzoParascandolo/MetaMathQA-60k |
| Metodo de entrenamiento | BFS-PO (Best-First Search for Large Reasoning Models) |
| Paper de referencia | arXiv:2602.14917 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso de la familia Qwen3 con aproximadamente 2 000 millones de parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida SSM: la innovación se limita al procedimiento de ajuste fino por refuerzo, no a la arquitectura. El adaptador LoRA modifica un subconjunto de pesos del modelo base y se carga con `PeftModel.from_pretrained` sobre la instancia de `AutoModelForCausalLM`.

El entrenamiento utiliza BFS-PO, una variante de optimización por preferencias basada en búsqueda best-first descrita en el paper arXiv:2602.14917. El dataset es MetaMathQA-60k, una colección de 60 000 problemas matemáticos aumentados. El prompt de entrenamiento fija un sistema "You are a helpful assistant", una instrucción de razonar paso a paso con la respuesta final en `\boxed{}` y la apertura del bloque `<think>`, lo que fuerza al modelo a producir cadenas de razonamiento antes de la respuesta. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase adicional de DPO o RLHF más allá de BFS-PO.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso con formato de respuesta en `\boxed{}`.
- Modo thinking nativo de Qwen3, activado mediante la etiqueta `<think>` incluida en la plantilla de chat.
- Resolución de problemas aritméticos y de competición (GSM8K, MATH-500, AMC2023) con cadenas de razonamiento de longitud variable.
- Respuesta a preguntas de STEM a nivel de MMLU (subconjunto STEM).
- Conversación multi-turno mediante `apply_chat_template` con roles system/user/assistant.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.
- Capacidad multilingüe limitada: la model card declara únicamente inglés, aunque el modelo base Qwen3 es multilingüe.

## Casos de uso

- Tutoría matemática automatizada: el adaptador genera explicaciones paso a paso con la respuesta final encerrada en `\boxed{}`, lo que facilita la corrección automática y la evaluación por parte de un corrector simbólico.
- Generación de soluciones para benchmarks de razonamiento: útil para reproducir experimentos sobre GSM8K, MATH-500 o AMC2023 con un modelo de 1,7B y bajo coste computacional.
- Investigación en ajuste fino por refuerzo: sirve como referencia reproducible de la receta BFS-PO aplicada a un modelo pequeño, comparando el adaptador con el modelo base sin ajustar.
- Preprocesamiento de datasets matemáticos: el modelo puede generar cadenas de razonamiento sintéticas para aumentar corpus de entrenamiento en dominios STEM.
- Asistente de resolución de problemas en entornos educativos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 1,7B, se puede desplegar en una GPU de consumo.
- Evaluación de la eficiencia de cadenas de razonamiento: la model card reporta longitudes medias de razonamiento (437 tokens en GSM8K, 968 en MATH-500, 1558 en AMC2023), lo que permite estudiar el equilibrio entre precisión y coste de tokens.

## Benchmarks y rendimiento

Resultados reportados en la model card con protocolo Avg@16 (media de 16 muestras) y longitud media de los tokens entre `<think>` y `</think>`:

| Dataset | Accuracy (Avg@16) | Longitud media (Avg@16) |
|---|---:|---:|
| GSM8K | 89,7 | 437 |
| MATH-500 | 81,6 | 968 |
| AMC2023 | 64,7 | 1558 |
| MMLU (STEM) | 79,3 | 459 |

No se han publicado en la información disponible resultados comparativos del modelo base Qwen3-1.7B sin adaptador, ni de otros adaptadores, sobre los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en fp16 requiere aproximadamente 3,4 GB de pesos; en cuantización de 8 bits, unos 1,7 GB; en 4 bits, alrededor de 1 GB. El adaptador LoRA añade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con margen para el contexto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. Para despliegue en producción con mayor throughput, se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se cuantiza el modelo base.
- Opciones de despliegue: `transformers` + `peft` + `accelerate` (documentado en la model card); vLLM y TGI requieren fusionar el adaptador con el modelo base o cargarlo como adaptador LoRA compatible. llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La longitud media de razonamiento reportada (437-1558 tokens) condiciona directamente el coste de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-BFS-PO (este) | ~2B (base) + LoRA | No disponible | No disponible | Safetensors (PEFT) | Adaptador especializado en matemáticas con BFS-PO |
| Qwen/Qwen3-1.7B | ~2B | No disponible en la informacion | No disponible en la informacion | Safetensors | Modelo base sin ajuste; referencia para medir la mejora del adaptador |
| unsloth/Qwen3-1.7B | ~2B | No disponible en la informacion | No disponible en la informacion | Safetensors / GGUF | Versión optimizada para inferencia y cuantización del mismo base |

La comparación con otros adaptadores matemáticos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen3-1.7B, lo que duplica el espacio en disco y añade un paso de configuración.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial. Se debe consultar la licencia del modelo base Qwen3-1.7B por separado.
- El entrenamiento se limita a MetaMathQA-60k y a un prompt fijo; el rendimiento fuera de ese formato (por ejemplo, sin la instrucción de `\boxed{}` o sin el bloque `<think>`) puede degradarse.
- La model card declara únicamente inglés; el comportamiento en castellano no está evaluado.
- Riesgo de alucinación en problemas matemáticos fuera de la distribución de MetaMathQA, especialmente en niveles de competición superiores a AMC.
- Las longitudes de razonamiento reportadas (hasta 1558 tokens en AMC2023) implican costes de generación y latencia elevados para un modelo de 1,7B.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-07; no hay evidencia de validación independiente de los resultados reportados.
- No se documentan sesgos específicos, pero el modelo hereda los del base Qwen3-1.7B.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/FiorenzoParascandolo/Qwen3-1.7B-BFS-PO
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/FiorenzoParascandolo/MetaMathQA-60k
- Paper BFS-PO: https://arxiv.org/abs/2602.14917
- Paper Extra-CoT (protocolo de medición de longitud): https://arxiv.org/html/2602.08324v2
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH-500: https://huggingface.co/datasets/math-ai/math500
- Dataset AMC2023: https://huggingface.co/datasets/math-ai/amc23
- Dataset MMLU-STEM: https://huggingface.co/datasets/TIGER-Lab/MMLU-STEM
- Versión optimizada del base (Unsloth): https://huggingface.co/unsloth/Qwen3-1.7B
