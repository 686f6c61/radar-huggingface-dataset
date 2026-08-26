# prism-ml/Ternary-Bonsai-8B-gguf

## Resumen

Ternary-Bonsai-8B es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por Prism ML, que aplica una cuantización ternaria extrema (1.58 bits por peso) sobre la arquitectura de Qwen3-8B. En lugar de pesos FP16 o BF16, cada peso se restringe al conjunto {-1, 0, +1} con un escalado FP16 por grupo de 128, lo que reduce el tamaño del modelo de 16.38 GB a 2.03 GiB (7.5 veces menor) sin pérdida de calidad para el formato ternario. Está distribuido en formato GGUF, pensado para su uso con llama.cpp, y es compatible con CPU, Metal, Vulkan y CUDA mediante un fork específico.

El modelo resuelve el problema del despliegue de modelos de 8B en dispositivos con memoria limitada (portátiles, móviles, edge) manteniendo un rendimiento competitivo en tareas de razonamiento, matemáticas, código y tool calling. Según los benchmarks publicados por Prism ML, alcanza una media del 75.5% en un conjunto de seis evaluaciones, solo 3.8 puntos por debajo del Qwen3-8B original en FP16, pero ocupando una octava parte del espacio. Su licencia Apache 2.0 permite uso comercial sin restricciones. La ventana de contexto es de 65.536 tokens y el vocabulario de 151.936 entradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GQA, SwiGLU MLP, RoPE, RMSNorm) |
| Parametros totales | 8.188.548.096 (~6.95B no-embedding) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | FP16 (referencia), GGUF Q2_0 g128 (ternario) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q2_0, FP16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-8B: un transformer decoder con 36 capas, atención GQA con 32 cabezas de consulta y 8 cabezas de clave/valor, MLP con activación SwiGLU, posicional RoPE y normalización RMSNorm. La innovación principal es la cuantización ternaria: cada peso se codifica con 2 bits (código q en {0,1,2,3}) que se dequantiza como w = (q - 1) * scale, donde scale es un valor FP16 compartido por grupos de 128 pesos. El cuarto código (q=3, reconstruyendo a +2*scale) está reservado para futuras extensiones y no se usa en pesos ternarios. Esto produce un tamaño efectivo de 2.125 bits por peso, frente a los 16 bits del FP16.

Los detalles del entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO) no se han publicado en la información disponible. El modelo se distribuye como un checkpoint ternario ya cuantizado, con los pesos de embeddings, proyecciones de atención, MLP y la cabeza de lenguaje cubiertos por la cuantización. El repositorio incluye también la versión FP16 completa (16.38 GB) como referencia y como fuente para re-cuantizaciones.

## Capacidades

- Generación de texto en lenguaje natural con razonamiento de varios pasos (ver resultados en MuSR y GSM8K).
- Razonamiento matemático: 91% en GSM8K, 77.4% en HumanEval+ (código).
- Tool calling y function calling: 73.9% en BFCL, lo que lo hace útil para agentes.
- Seguimiento de instrucciones: 81.8% en IFEval, comparable al Qwen3-8B original.
- Capacidades multilingües: no especificadas, pero heredadas de Qwen3 (que soporta más de 100 idiomas); no confirmado.
- No tiene capacidades de visión ni audio (a diferencia de la variante 27B de la familia Bonsai).

## Casos de uso

- Asistente local en dispositivos móviles o portátiles: con solo 2.03 GB, el modelo cabe en la memoria de un teléfono o un portátil con GPU integrada. Puede ejecutarse con llama.cpp y ofrecer respuestas de baja latencia sin conexión a internet.
- Servidor de inferencia con memoria limitada: en entornos con GPUs de 4-8 GB, el modelo permite servir un LLM de 8B de calidad sin recurrir a cuantizaciones más agresivas que degradan el rendimiento. Se puede desplegar con llama-server o vLLM (si se compila con soporte Q2_0).
- Automatización de tareas de atención al cliente: gracias a su contexto de 65K tokens y buen IFEval, puede gestionar conversaciones multi-turno largas y seguir instrucciones complejas de un guion.
- Generación de código en entornos de desarrollo: con HumanEval de 77.4%, puede usarse en pipelines de autocompletado o revisión de código en repositorios locales, sin depender de la nube.
- Agentes autónomos con tool calling: el rendimiento en BFCL (73.9%) permite que el modelo decida cuándo y cómo llamar a APIs externas, útil para automatizaciones de productividad.
- Investigación en eficiencia de modelos: el formato ternario y los resultados publicados sirven como referencia para estudiar el equilibrio entre tamaño y rendimiento en modelos de 8B.

## Benchmarks y rendimiento

La siguiente tabla muestra los resultados publicados por Prism ML, evaluados con EvalScope v1.4.2 y vLLM 0.15.1 en NVIDIA H100, con parámetros de generación idénticos para todos los modelos. La columna "Avg" es la media de las seis métricas.

| Modelo | Tamaño | Avg | MMLU-R | MuSR | GSM8K | HE+ | IFEval | BFCL |
|---|---|---|---|---|---|---|---|---|
| Qwen 3 8B (FP16) | 16.38 GB | **79.3** | 83 | 55 | 93 | 82.3 | 81.5 | 81 |
| **Ternary Bonsai 8B** | **2.18 GB** | **75.5** | 72.6 | 56.2 | 91 | 77.4 | 81.8 | 73.9 |
| 1-bit Bonsai 8B (versión previa) | 1.15 GB | 70.5 | 65.7 | 50 | 88 | 73.8 | 79.8 | 65.7 |
| RNJ 8B | 16.63 GB | 73.1 | 75.5 | 50.4 | 93.7 | 84.2 | 73.8 | 61.1 |
| Ministral3 8B | 16.04 GB | 71.0 | 68.9 | 53.8 | 87.9 | 72.6 | 67.4 | 75.4 |
| Olmo 3 7B | 14.60 GB | 70.9 | 72 | 56.1 | 92.5 | 79.3 | 87.1 | 38.4 |

El modelo ocupa el segundo puesto en la media, solo por detrás del Qwen3-8B original, a pesar de tener 7.5 veces menos tamaño. Destaca especialmente en MuSR (56.2, superior al Qwen3-8B) e IFEval (81.8, superior al Qwen3-8B).

## Requisitos de hardware

- VRAM estimada: 2.18 GB para el archivo Q2_0; añadiendo KV cache y buffers, se recomienda al menos 4 GB de VRAM para una ventana de contexto moderada (4k-8k tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1660, RTX 3050, RTX 4060, Apple M1/M2/M3/M4, etc.). Para contexto completo de 65k tokens, se recomiendan 8 GB o más.
- En CPU pura: funciona con 10 hilos NEON en un Apple M4 Pro a 32 tok/s de generación; en GPU Metal del mismo chip alcanza 76 tok/s.
- Opciones de despliegue: llama.cpp (requiere el fork de PrismML-Eng/llama.cpp con soporte Q2_0, ya que el formato no está en mainline; se espera un PR upstream). También se puede usar vLLM (compatible según las evaluaciones, pero no se indica cómo compilarlo).
- Latencia y throughput: en M4 Pro 48 GB, 76 tok/s (generación) y 455 tok/s (prefill) con Metal; 32 tok/s de generación en CPU NEON con 10 hilos.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con alternativas de 7-8B en términos de tamaño y rendimiento medio (Avg de las seis métricas anteriores).

| Modelo | Tamaño (GB) | Avg | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B (FP16) | 16.38 | 79.3 | Apache 2.0 | HuggingFace |
| **Ternary Bonsai 8B** | **2.18** | **75.5** | Apache 2.0 | HuggingFace (GGUF) |
| Ministral3 8B | 16.04 | 71.0 | Apache 2.0 | HuggingFace |
| Olmo 3 7B | 14.60 | 70.9 | Apache 2.0 | HuggingFace |

El modelo ternario ofrece un rendimiento medio un 4.8% inferior al Qwen3-8B FP16, pero con una reducción de memoria del 86.7%. Frente a otros modelos de 8B, supera a Ministral3 y Olmo 3 en la media, siendo además el más pequeño con diferencia.

## Limitaciones y advertencias

- El formato Q2_0 no está integrado en la rama principal de llama.cpp; es necesario compilar desde el fork de Prism ML (`prism` branch) para ejecutarlo en CPU/Metal. El soporte para CUDA y Vulkan está en desarrollo.
- La cuantización ternaria puede producir degradaciones en tareas de precisión numérica o razonamiento matemático complejo (comparado con FP16, baja de 92 a 91 en GSM8K, y de 83 a 72.6 en MMLU-R).
- El modelo está pensado para el formato GGUF; la versión FP16 está disponible solo como referencia, no como checkpoint de entrenamiento completo.
- No se han publicado detalles sobre el proceso de entrenamiento (datos, tokens, alineación), por lo que no se puede evaluar la presencia de sesgos o la robustez frente a alucinaciones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de Qwen3-8B si se usa el modelo como base para otros fines.
- El contexto de 65k tokens es teórico; en la práctica, el uso de la atención completa con 65k tokens requerirá al menos 8-12 GB de VRAM adicionales para la caché KV.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-gguf
- Modelo base (safetensors): https://huggingface.co/prism-ml/Ternary-Bonsai-8B-unpacked
- White Paper (PDF): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/ternary-bonsai-8b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con soporte Q2_0: https://github.com/PrismML-Eng/llama.cpp
- Documentación de Prism ML sobre Bonsai 8B: https://docs.prismml.com/models/bonsai-8b
