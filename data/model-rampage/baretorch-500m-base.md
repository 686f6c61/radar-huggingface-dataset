# model-rampage/BareTorch-500M-Base

## Resumen

BareTorch-500M-Base es un modelo de lenguaje fundacional de tamaño reducido (aproximadamente 500 millones de parámetros) desarrollado por Martin Ignacio Kovacevic Buvinic bajo el framework BareTorch. Su principal innovación es una arquitectura híbrida que combina capas recurrentes CS-LRAD (Chunk-Segmented Low-Ranked Associative Delta Engine) con atención multi-cabeza Transformer en una topología intercalada 3:1, todo ello bajo un paradigma "pure GEMM" y "kernel-free", es decir, sin dependencia de kernels personalizados de CUDA o Triton. Esto permite ejecutar el modelo de forma nativa en NVIDIA CUDA, Apple Silicon MLX, WebGPU y TPUs con complejidad O(N) en memoria y ejecución.

El modelo fue pre-entrenado con 100 mil millones de tokens en un clúster de 4 GPU NVIDIA H100, alcanzando una pérdida de evaluación de 2.2690. Su ventana de contexto llega hasta 32.768 tokens, y las pruebas del autor muestran ventajas significativas en latencia y consumo de VRAM frente a modelos comparables en contextos largos. Está pensado como modelo base para investigación y despliegue en entornos con recursos limitados, aunque su rendimiento en tareas de razonamiento y conocimiento general es modesto, como corresponde a su tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas CS-LRAD + 6 capas Transformer (intercaladas 3:1) |
| Parametros totales | 593.051.328 (según safetensors); la model card indica ~500M (498,2M activos) |
| Parametros activos | 498,2 millones (según model card) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (no se mencionan en la documentación) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BareTorch-500M-Base emplea una arquitectura híbrida que intercala tres capas CS-LRAD por cada capa Transformer. Las capas CS-LRAD son un mecanismo recurrente de bajo rango (r=8) que procesa el contexto en segmentos de 32 tokens (chunk size C=32), actualizando un estado recurrente de tamaño constante O(1) en lugar de mantener una caché KV dependiente del contexto. Esto elimina los cuellos de botella de memoria y permite una complejidad lineal O(N) tanto en ejecución como en memoria. Las capas Transformer estándar complementan la mezcla de secuencias con atención multi-cabeza (16 cabezas, dimensión de cabeza 72, d_model=1152). El modelo usa el tokenizer de SmolLM2-360M con un vocabulario de 49.152 tokens.

El pre-entrenamiento se realizó con 100 mil millones de tokens en 190.735 pasos de optimización, con un tamaño de lote global de 524.288 tokens por paso (256 secuencias de longitud 2048). Se usó el optimizador AdamW con una tasa de aprendizaje máxima de 6×10⁻⁴, weight decay de 0,1 y un programador de coseno con 2.000 pasos de calentamiento. El hardware fue un clúster de 4 GPU NVIDIA H100 SXM de 80 GB. La pérdida de entrenamiento final fue de 2,2901 y la de evaluación de 2,2690. No se menciona el uso de RLHF, DPO ni ajuste instructivo; es un modelo base.

## Capacidades

- Generación de texto en inglés de forma autorregresiva (causal LM).
- Procesamiento de contextos largos (hasta 32.768 tokens) con consumo de memoria constante gracias al estado recurrente O(1).
- Ejecución nativa en múltiples plataformas: NVIDIA CUDA, Apple Silicon MLX, WebGPU y TPU, sin necesidad de kernels personalizados.
- Inferencia eficiente en términos de VRAM: según el autor, en una RTX 4090 con contexto de 32.768 tokens consume 1,66 GB de VRAM y alcanza 164,49 tokens/s de decodificación local.
- No soporta tool calling, function calling, agentes, visión ni audio. Tampoco dispone de modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés; no se reportan otros idiomas.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto en inglés: al ser un modelo base de 500M, puede usarse para validar ideas y flujos de trabajo antes de escalar a modelos mayores, con la ventaja de un despliegue ligero.
- Investigación académica en arquitecturas sub-cuadráticas: su diseño CS-LRAD puro GEMM y kernel-free lo convierte en un banco de pruebas para estudiar la eficiencia de mezcladores de secuencia alternativos a la atención estándar.
- Despliegue en dispositivos edge y navegadores: gracias a su compatibilidad con WebGPU y Apple Silicon MLX, puede ejecutarse en portátiles, tablets o incluso en el navegador sin infraestructura de servidor, adecuado para aplicaciones offline de generación de texto.
- Procesamiento de documentos largos con memoria limitada: su estado recurrente de tamaño constante permite manejar entradas de 32K tokens en GPUs de consumo (por ejemplo, RTX 4090 con 1,66 GB de VRAM), algo inviable con modelos Transformer del mismo tamaño.
- Base para fine-tuning en tareas específicas en inglés: al ser un modelo base, puede ajustarse con datasets propios para tareas como clasificación de texto, extracción de información o generación de respuestas en dominios concretos, aprovechando su bajo coste de inferencia.
- Evaluación de rendimiento en hardware heterogéneo: su naturaleza kernel-free permite comparar el rendimiento de inferencia entre GPUs NVIDIA, Apple Silicon, TPUs y WebGPU sin recompilar código, útil para equipos que despliegan en múltiples plataformas.

## Benchmarks y rendimiento

El autor proporciona los siguientes resultados de evaluación zero-shot en la model card. No se dispone de verificación independiente.

| Tarea / Benchmark | Métrica | Resultado |
|---|---|---|
| HellaSwag | Acc (Norm) | 43,69% |
| ARC Easy | Acc (Norm) | 53,58% |
| ARC Challenge | Acc (Norm) | 28,92% |
| WinoGrande | Accuracy | 51,30% |
| MMLU (promedio 57 materias) | Accuracy | 24,70% |
| MMLU STEM | Accuracy | 23,53% |
| MMLU Humanidades | Accuracy | 24,87% |
| MMLU Ciencias Sociales | Accuracy | 24,86% |
| MMLU Otros | Accuracy | 25,46% |

Estos valores son bajos en comparación con modelos instructivos de tamaño similar, pero coherentes con un modelo base de 500M sin ajuste posterior. No se han publicado resultados en HumanEval, GSM8K ni otros benchmarks de código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: según las pruebas del autor, con contexto de 32.768 tokens en una RTX 4090 (24 GB) el pico de VRAM es de 1,66 GB; en un M1 MacBook Pro de 16 GB unificado, 1,37 GB. Para contextos más cortos el consumo será menor.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM debería ser suficiente para la mayoría de usos. El autor probó en RTX 4090 y H100. También funciona en Apple Silicon (MLX) y TPUs.
- ¿Cabe en GPU de consumo? Sí, cabe holgadamente en GPUs como RTX 3060, RTX 4060, RTX 4090, etc., incluso con contexto largo.
- Opciones de despliegue: requiere el framework BareTorch (integración con Hugging Face Transformers mediante `BareTorchForCausalLM`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI. El modelo no está disponible en formato GGUF.
- Latencia y throughput estimados: en RTX 4090 con contexto 32K, prefill de 314,89 ms y decodificación local de 164,49 tok/s. En M1 MacBook Pro 16GB, prefill de 7,06 s y decodificación de 79,55 tok/s (según datos del autor).

## Comparativa con modelos similares

La siguiente comparativa se basa en los datos proporcionados por el autor del modelo para contexto de 32.768 tokens en RTX 4090. Los valores de los modelos comparados son los reportados en la model card de BareTorch.

| Modelo | Parámetros | Contexto | Licencia | Prefill (ms) | Decode (tok/s) | VRAM pico (GB) |
|---|---|---|---|---|---|---|
| BareTorch-500M-Base | ~500M | 32.768 | Apache-2.0 | 314,89 | 164,49 | 1,66 |
| Qwen3 0.6B | 0,6B | 32.768 | Apache-2.0 | 4.343,26 | 13,15 | 8,58 |
| SmolLM2 1.7B | 1,7B | 32.768 | Apache-2.0 | 4.292,54 | 15,79 | 15,57 |
| Llama 3.2 1B | 1B | 32.768 | Llama 3.2 | 2.960,03 | 24,44 | 4,67 |
| Gemma 2 2B | 2B | 32.768 | Gemma | OOM | OOM | OOM |

BareTorch-500M-Base muestra ventajas notables en velocidad de prefill, decodificación y consumo de VRAM frente a estos modelos Transformer del mismo rango de tamaño, aunque su rendimiento en tareas de conocimiento (MMLU 24,7%) es inferior al de modelos como Qwen3 0.6B o Llama 3.2 1B, que suelen superar el 50% en MMLU. La comparativa de rendimiento en contexto largo es favorable a BareTorch, pero debe tenerse en cuenta que los datos provienen del propio autor y no han sido replicados de forma independiente.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no está entrenado para seguir instrucciones ni para diálogo; su salida es texto libre sin formato de asistente.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Rendimiento bajo en tareas de razonamiento y conocimiento: MMLU 24,7%, ARC Challenge 28,9% y HellaSwag 43,7% indican capacidades limitadas frente a modelos de tamaño similar con mejores datos de entrenamiento.
- Riesgo de alucinación y sesgos: al ser un modelo base pequeño, es propenso a generar contenido incoherente o factualmente incorrecto, especialmente en contextos largos. No se han documentado sesgos específicos, pero es esperable que herede sesgos de los datos de pre-entrenamiento.
- Dependencia del framework BareTorch: no es compatible con el ecosistema estándar de Transformers sin la integración específica de BareTorch. No hay versiones GGUF ni soporte en vLLM, Ollama o llama.cpp, lo que dificulta su despliegue en infraestructuras convencionales.
- Datos de rendimiento no verificados: las cifras de latencia, VRAM y throughput provienen de las pruebas del autor y no han sido replicadas por terceros. Los benchmarks de conocimiento tampoco han sido auditados externamente.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas (INT8, INT4, etc.), lo que limita su uso en dispositivos con memoria muy reducida.
- Licencia Apache-2.0 permite uso comercial, pero el framework BareTorch tiene una vertiente comercial (SDK de pago) que podría generar confusión sobre qué partes son libres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-rampage/BareTorch-500M-Base
- Repositorio espejo en Hugging Face: https://huggingface.co/martin-kb-rampage/BareTorch-500M-Base
- Repositorio GitHub del framework: https://github.com/martin-kbcc/baretorch
- README del framework en GitHub: https://github.com/martin-kbcc/baretorch/blob/main/README.md
- Web del proyecto BareTorch: https://www.model-rampage.com/
- Publicación en LinkedIn del autor: https://www.linkedin.com/posts/mart%C3%ADn-kovacevic-183491127_machinelearning-deeplearning-opensource-activity-7483199852856860674-CctK
