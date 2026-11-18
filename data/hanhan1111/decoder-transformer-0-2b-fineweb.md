# hanhan1111/decoder-transformer-0.2b-fineweb

## Resumen

decoder-transformer-0.2b-fineweb es un modelo de lenguaje de 217,7 millones de parámetros (201,4M sin embeddings, con embeddings atados) desarrollado por el usuario hanhan1111 como trabajo de asignatura de un curso de posgrado de machine learning. Se trata de un transformer decoder-only entrenado desde cero en PyTorch puro, sin usar las clases de modelo ni el Trainer de Hugging Face, sobre una muestra de 10.000 millones de tokens del dataset FineWeb-Edu (sample-10BT). El modelo forma parte de un estudio de leyes de escalado (scaling laws) que abarca 6 tamaños de modelo y 3 presupuestos de datos, con 18 ejecuciones en total.

La relevancia del modelo es fundamentalmente educativa y de investigación reproducible: sirve como referencia de cómo entrenar un modelo de lenguaje pequeño con un presupuesto de cómputo modesto (2 GPU H100) y cómo validar empíricamente las leyes de escalado. La arquitectura es un transformer estándar pre-norm con RoPE, RMSNorm, 16 capas, dimensión de modelo 1024, 16 cabezas de atención y dimensión feed-forward de 4096, con una longitud de contexto de 1024 tokens.

El checkpoint se distribuye como un `state_dict` de PyTorch en fp32 junto con la configuración del modelo, y requiere el código del repositorio de GitHub del autor para cargarse. No está pensado para uso en producción ni para tareas de inferencia general, sino como artefacto de investigación y como ejemplo didáctico de un pipeline de preentrenamiento completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (pre-norm, RoPE, RMSNorm, sin bias) |
| Parámetros totales | 217,7M (201,4M sin embeddings, embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible (checkpoint en fp32; no se publican versiones cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`, fp32) |
| Tokenizador | flexitok/bpe_fw_edu_16000 (BPE de 16k), eos = `</s>` (id 2) |
| Capas | 16 |
| Dimensión de modelo (d_model) | 1024 |
| Cabezas de atención | 16 |
| Dimensión feed-forward (d_ff) | 4096 |
| Datos de entrenamiento | FineWeb-Edu sample-10BT (10,0B tokens, ~2,3x Chinchilla) |
| Optimizador | AdamW (0.9, 0.95), weight decay 0.1, lr pico 4e-4, cosine a 10%, warmup 1,5% |
| Batch | 262.144 tokens/paso, 38.146 pasos, bf16, 2x H100 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con normalización pre-norm mediante RMSNorm, embeddings posicionales rotatorios (RoPE) y sin términos de bias en las capas lineales. La dimensión del modelo es 1024, con 16 cabezas de atención y una dimensión feed-forward de 4096. Los embeddings de entrada y de salida están atados (tied embeddings), lo que reduce el recuento de parámetros a 201,4M no-embedding y 217,7M totales. La implementación es en PyTorch puro, sin depender de las clases de modelo ni del Trainer de Hugging Face, lo que la hace autocontenida y didáctica.

El entrenamiento se realizó sobre FineWeb-Edu sample-10BT, una muestra de 10.000 millones de tokens del corpus educativo de Hugging Face, lo que supone aproximadamente 2,3 veces el presupuesto óptimo de Chinchilla para este tamaño de modelo (un régimen "data-rich"). Se usó AdamW con beta (0,9, 0,95), weight decay 0,1, learning rate pico de 4e-4 con decaimiento coseno hasta el 10% y warmup del 1,5%. El entrenamiento se ejecutó en bf16 con un batch de 262.144 tokens por paso durante 38.146 pasos en 2 GPU H100. El modelo forma parte de un estudio de leyes de escalado con 6 tamaños de modelo y 3 presupuestos de datos (18 ejecuciones), que ajusta la ley L(N) = 1,642 + 58,5 / N^0,209 sobre las ejecuciones data-rich; la extrapolación a este tamaño predice una entropía cruzada de 2,727 frente a la 2,716 medida (0,4% de error). No se menciona uso de RLHF, DPO ni ajuste fino posterior; es un modelo estrictamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación por muestreo (temperatura, top-k) o greedy.
- Modelado de lenguaje y estimación de perplejidad sobre texto en inglés.
- Razonamiento básico de nivel de modelo pequeño (0,2B), limitado por su escala.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (el tokenizador y los datos son exclusivamente en inglés).
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Sirve como base para experimentos de scaling laws y como punto de partida para ajuste fino didáctico.

## Casos de uso

- Estudio reproducible de leyes de escalado: el checkpoint y el código permiten replicar el ajuste L(N) y validar la predicción de entropía cruzada (2,727 predicha frente a 2,716 medida) en un entorno de 2 GPU H100.
- Docencia de preentrenamiento desde cero: sirve como ejemplo completo de pipeline en PyTorch puro (tokenizador, bucle de entrenamiento, configuración, checkpoint) para cursos de machine learning.
- Generación de texto de dominio general en inglés con fines de demostración: con 1024 tokens de contexto puede producir párrafos coherentes sobre temas educativos, adecuado para prototipos y pruebas.
- Punto de partida para ajuste fino supervisado: al ser un modelo pequeño con licencia MIT, se puede adaptar a tareas concretas (clasificación, resumen, generación de respuestas) con recursos modestos.
- Evaluación de tokenizadores BPE de vocabulario reducido: el uso del tokenizador de 16k permite estudiar el impacto del vocabulario en la perplejidad y en los bits-por-byte (0,908).
- Investigación sobre eficiencia de datos: al haberse entrenado con ~2,3x Chinchilla, sirve para analizar el régimen data-rich y comparar con modelos entrenados en el régimen óptimo.
- Benchmarking de infraestructura de entrenamiento: las métricas de throughput (262.144 tokens/paso, 38.146 pasos en 2x H100) permiten comparar configuraciones de hardware y precisión (bf16).

## Benchmarks y rendimiento

| Métrica (validación) | Valor |
|---|---|
| Entropía cruzada | 2,716 |
| Perplejidad | 15,12 |
| Bits-per-byte | 0,908 |
| Entropía cruzada predicha por la ley de escalado | 2,727 (error del 0,4%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,9 GB para los pesos (217,7M parámetros x 4 bytes), más overhead de activaciones y contexto; en la práctica, menos de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,45 GB para los pesos; en cuantización de 8 bits, ~0,22 GB; en 4 bits, ~0,11 GB (estimaciones teóricas, no se publican versiones cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia; el entrenamiento se realizó en 2x H100.
- Cabe holgadamente en GPU consumer, incluso en tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI; el checkpoint es un `state_dict` de PyTorch que requiere el código del repositorio de GitHub (`model.py`) para cargarse. La conversión a GGUF o a formatos de Hugging Face requeriría trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| decoder-transformer-0.2b-fineweb | 217,7M | 1024 | MIT | Checkpoint PyTorch + repo GitHub | Preentrenado desde cero en FineWeb-Edu; estudio de scaling laws |
| GPT-2 small (referencia) | 124M | 1024 | MIT | Hugging Face Transformers | Modelo histórico de OpenAI; ampliamente soportado en herramientas |
| Pythia-160M (referencia) | 160M | 2048 | Apache 2.0 | Hugging Face Transformers | Suite de EleutherAI con checkpoints intermedios y estudios de escalado |
| TinyLlama-1.1B (referencia) | 1,1B | 2048 | Apache 2.0 | Hugging Face Transformers | Modelo mayor; no directamente comparable por escala |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de 0,2B parámetros: capacidad de razonamiento y conocimiento factual muy limitada; no apto para tareas que requieran precisión factual o razonamiento complejo.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente con contextos largos o temas especializados.
- Entrenado exclusivamente en inglés y sobre FineWeb-Edu, por lo que su dominio es el texto educativo; el rendimiento fuera de ese dominio será peor.
- Longitud de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No se documenta alineación (RLHF/DPO), por lo que puede generar contenido sesgado, ofensivo o inapropiado presente en los datos de preentrenamiento.
- La licencia MIT permite uso comercial, pero el modelo no está validado para producción; se recomienda evaluar su calidad antes de cualquier despliegue.
- El checkpoint es un `state_dict` de PyTorch que requiere el código del repositorio de GitHub para cargarse; no es compatible directamente con `transformers`, vLLM, llama.cpp u otras herramientas estándar sin conversión.
- El tokenizador es un BPE de 16k de un repositorio de terceros (flexitok/bpe_fw_edu_16000); su disponibilidad y mantenimiento no están garantizados.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hanhan1111/decoder-transformer-0.2b-fineweb
- Repositorio de código (GitHub): https://github.com/nihao-zhangtongxue/aml-hw1-decoder-transformer
- Tokenizador: https://huggingface.co/flexitok/bpe_fw_edu_16000
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
