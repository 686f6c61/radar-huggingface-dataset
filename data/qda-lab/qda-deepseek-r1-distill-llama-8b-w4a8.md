# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W4A8 es una versión cuantizada del modelo de razonamiento DeepSeek-R1-Distill-Llama-8B, publicada por el laboratorio qda-lab. Se trata de una cuantización de pesos a 4 bits (INT4) con activaciones en 8 bits (FP8), lo que reduce el tamaño del checkpoint de 16,1 GB en BF16 a 5,7 GB, un factor de 2,8× de compresión, manteniendo según el autor el 95,1 % de la precisión del modelo original.

El modelo base es la destilación de DeepSeek-R1 sobre la arquitectura Llama de 8B parámetros, un transformer decoder-only denso (sin mezcla de expertos) especializado en razonamiento de cadena larga mediante modo "thinking". La cuantización emplea el formato compressed-tensors con GPTQ sobre una copia rotada con Hadamard, con la rotación plegada en los pesos para evitar transformaciones en tiempo de ejecución.

Su relevancia práctica radica en que permite desplegar un modelo de razonamiento de 8B en una única GPU Hopper con requisitos de memoria muy inferiores, a costa de una restricción importante: el kernel W4A8 de vLLM exige compute capability 9.0, por lo que solo funciona en H100 y H200. La licencia MIT facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama), destilado de DeepSeek-R1 |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A8: pesos INT4 en grupos de 128, activaciones FP8 dinamicas; formato compressed-tensors |
| Idiomas soportados | No disponible (multiidioma heredado del modelo base, sin listado explicito) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Llama-8B es un transformer denso de 8B parámetros con arquitectura Llama, obtenido por destilación del modelo de razonamiento DeepSeek-R1. Está entrenado para producir cadenas de razonamiento extensas en modo "thinking", delimitadas por la etiqueta `</think>`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

La innovación técnica de esta ficha es el proceso de cuantización. Los pesos se cuantizan a INT4 en grupos de 128 mediante GPTQ sobre una copia del modelo rotada con una transformación de Hadamard; la rotación se pliega en los propios pesos, de modo que no hay coste de transformación en inferencia. Las activaciones se cuantizan dinámicamente a FP8. La receta fue seleccionada por búsqueda automática del sistema QDA (Closed-Loop LLM Quantization Design with Agents, arXiv:2611.23388). El proceso de construcción se dividió en tres partes ejecutadas sobre H100 de 80 GB, seguidas de un "soup" (promediado de pesos) de las tres partes.

## Capacidades

- Generación de texto y razonamiento de cadena larga en modo "thinking", con cierre explícito en `</think>`.
- Razonamiento matemático de competición (AIME, HMMT) y resolución de problemas científicos de nivel avanzado (GPQA-Diamond).
- Generación de código y resolución de problemas algorítmicos (evaluado en LiveCodeBench).
- Seguimiento de instrucciones verificable (evaluado en IFEval).
- Conocimiento general y multidisciplinar (evaluado en MMLU-Pro).
- Conversación multi-turno con plantilla de chat compatible con text-generation-inference y endpoints compatibles.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni capacidades de agente en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición y demostraciones paso a paso en modo thinking, adecuado para herramientas educativas o de verificación formal donde el coste por consulta importa y el despliegue en H100 está disponible.
- Generación y revisión de código en producción: con resultados en LiveCodeBench cercanos al modelo BF16, puede integrarse en pipelines de revisión o generación de parches, siempre que la infraestructura cuente con GPUs Hopper.
- Evaluación científica y QA de dominio: su rendimiento en GPQA-Diamond (46,2 frente a 48,7 en BF16) lo hace utilizable para asistentes de investigación que requieran razonamiento sobre preguntas de nivel posgrado.
- Despliegue con restricciones de memoria: al ocupar 5,7 GB, permite servir el modelo en una H100 compartida con otros procesos o con mayor concurrencia que la versión BF16 de 16,1 GB, reduciendo el coste por token en entornos con múltiples réplicas.
- Seguimiento de instrucciones en agentes de flujo fijo: su puntuación en IFEval (61,9) lo hace apto para tareas de formato estricto y extracción estructurada, aunque no se documenta tool calling nativo.
- Sustitución de la versión BF16 en entornos vLLM existentes: al usar compressed-tensors y ser servible con `vllm serve`, se puede adoptar como reemplazo directo en despliegues ya basados en vLLM sobre Hopper, con una pérdida media de 2,1 puntos en los benchmarks publicados.

## Benchmarks y rendimiento

Resultados publicados por el autor (modo thinking, pass@1 promediado sobre 1–32 semillas, 32.768 tokens nuevos máximos por ítem):

| Benchmark | BF16 (16,1 GB) | QDA W4A8 (5,7 GB) |
|---|---|---|
| AIME 2025 | 33,6 | 31,7 |
| HMMT Feb 2026 | 24,9 | 23,9 |
| GPQA-Diamond | 48,7 | 46,2 |
| IFEval | 63,4 | 61,9 |
| MMLU-Pro | 49,4 | 46,0 |
| LiveCodeBench | 38,3 | 36,1 |
| Media | 43,0 | 40,9 |

Configuración de evaluación: temperatura 0,6, top-p 0,95, top-k -1, min-p 0, sin penalización de presencia ni repetición; thinking activado; sin decodificación especulativa. Las respuestas de MMLU-Pro se extrajeron con las reglas lenient oficiales porque el modelo no sigue el formato estándar de respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GB de pesos más overhead de activaciones FP8 y caché KV; el modelo cabe holgadamente en una GPU de 24 GB, pero el kernel W4A8 de vLLM exige compute capability 9.0.
- GPU compatibles: exclusivamente NVIDIA Hopper, es decir, H100 y H200 (sm90). No funciona en A100, RTX 4090 ni otras arquitecturas según la model card.
- GPU de consumo: no compatible (las RTX 4090 son sm89 y no soportan el kernel W4A8 de vLLM).
- Opciones de despliegue: vLLM (`vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8`), transformers y text-generation-inference según los tags; no se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Como referencia de coste de construcción, un paso `scale_kd` de la parte 1 tardó 106 s en H100 de 80 GB y 254–281 s en A100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks | Licencia | Despliegue |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W4A8 | 8,03B | No disponible | 40,9 | MIT | vLLM solo Hopper |
| DeepSeek-R1-Distill-Llama-8B (BF16) | 8,03B | No disponible | 43,0 | MIT | vLLM, transformers, TGI, llama.cpp |
| Qwen2.5-7B-Instruct | 7,6B | No disponible | No disponible | Apache 2.0 | Multiples backends |
| Llama-3.1-8B-Instruct | 8,0B | No disponible | No disponible | Llama 3.1 Community | Multiples backends |

La comparativa directa con Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct no puede establecerse con los datos proporcionados, ya que no se incluyen sus resultados en los mismos benchmarks ni con la misma configuración de evaluación. La comparación más fiable es contra el propio modelo base BF16, donde la versión cuantizada pierde 2,1 puntos de media.

## Limitaciones y advertencias

- Restricción de hardware severa: solo funciona en GPUs Hopper (H100/H200) con el kernel W4A8 de vLLM; no es desplegable en A100, RTX 4090 ni GPUs de consumo.
- Pérdida de precisión medible: 2,1 puntos de media frente a BF16, con la mayor caída en MMLU-Pro (3,4 puntos) y la menor en HMMT (1,0 punto).
- El modelo no sigue el formato estándar de respuesta de MMLU-Pro, lo que obliga a usar reglas de extracción lenient y puede complicar la evaluación automatizada en producción.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados; no se documentan evaluaciones de factualidad ni de calibración.
- Idiomas soportados no documentados explícitamente; el comportamiento multilingüe se hereda del modelo base sin garantías.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de function calling.
- La reconstrucción con las recetas publicadas no produce pesos idénticos bit a bit a este checkpoint, lo que dificulta la auditoría reproducible.
- La licencia MIT del checkpoint no exime de verificar las condiciones del modelo base DeepSeek-R1-Distill-Llama-8B, también MIT según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Recetas e inputs de cuantización: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8
