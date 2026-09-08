# aecetin/DeepSeek-R1-8B-PolySurgery

## Resumen

DeepSeek-R1-8B-PolySurgery es una variante experimental del modelo de razonamiento DeepSeek-R1-Distill-Llama-8B, desarrollada por A. Emre Çetin (Izmir, Turquía). El objetivo es reducir el consumo de VRAM para poder ejecutar modelos de razonamiento con cadenas de pensamiento largas en portátiles con GPU de 6 GB. Para ello, el autor sustituye las redes feed-forward (SwiGLU) por operadores tensoriales polinómicos de Chebyshev de grado 3, resueltos mediante ecuaciones normales cerradas, y aplica una compactación idempotente del KV-cache en las 32 capas del modelo.

El resultado es un modelo de 4.540.339.072 parámetros, frente a los 8.030.000.000 del modelo original, con una ventana de contexto de 32.768 tokens y una huella de VRAM estimada en 4,98 GB. Según la model card, se ha probado en una NVIDIA RTX PRO 500 Blackwell Generation Laptop GPU (6 GB de VRAM) con 32 GB de RAM. La cirugía de pesos se completa en 50,74 segundos sin backpropagation, y la compactación KV reduce un 50 % la memoria asignada a la caché.

Se trata de una propuesta de investigación con licencia híbrida y patentes pendientes, de uso no comercial. La model card no incluye resultados en benchmarks de calidad estándar como MMLU, HumanEval o GSM8K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama-8B, con FFN SwiGLU sustituidas por operadores tensoriales polinómicos de Chebyshev (grado K=3) en las 32 capas |
| Parámetros totales | 4.540.339.072 (incluye 2.147.483.648 en FFN polinómicas) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens, con KV-cache compactado un 50 % |
| Tipos de cuantización | No documentado; la model card solo referencia Q4_K_M para el modelo base original |
| Idiomas soportados | inglés (en), turco (tr), chino (zh) |
| Licencia | hybrid-patent-open-core (uso no comercial; patentes US 64/148,668 y 64/148,679 pendientes) |
| Formato de pesos | No disponible (la model card no especifica; el quickstart instala llama-cpp-python) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, un destilado del sistema de razonamiento DeepSeek-R1 sobre una base Llama-8B. La modificación principal es la cirugía de pesos in situ (in-situ weight surgery): en las 32 capas, las capas feed-forward SwiGLU se sustituyen por polinomios ortogonales de Chebyshev de grado K=3. Los coeficientes se calculan mediante un solver algebraico de forma cerrada, C* = (Φ(X)^T Φ(X) + λI)^-1 Φ(X)^T Y, sin backpropagation ni fine-tuning por descenso de gradiente. Según la model card, la cirugía completa se ejecuta en 50,74 segundos y ocupa menos de 400 MB de VRAM pico.

Además, se aplica una técnica denominada idempotent-kv: una compactación de la caché KV mediante permutaciones idempotentes in situ, con una reducción del 50 % del espacio y 0 bytes de asignación auxiliar. No se proporcionan datos sobre la composición del dataset, el número de tokens de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO. El autor presenta la propuesta como una alternativa ligera a la cuantización tradicional, ya que modifica la estructura del modelo en lugar de reducir únicamente la precisión de los pesos.

## Capacidades

- Generación de texto y razonamiento: hereda del modelo base DeepSeek-R1-Distill-Llama-8B la capacidad de producir cadenas de pensamiento largas (etiquetas ``) y de abordar problemas de lógica y matemáticas. La degradación real de estas capacidades no ha sido evaluada con benchmarks.
- Soporte de tool calling: no documentado en la model card.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: declaradas para inglés, turco y chino (en, tr, zh).
- Capacidad especial: ejecución de razonamiento con cadenas largas en GPUs de consumo de 6 GB, gracias a la reducción de VRAM. El sistema está optimizado para contextos de hasta 32.768 tokens mediante compactación KV.
- Otras modalidades: la model card no indica capacidades de visión, audio ni otras.

## Casos de uso

- Investigación en compresión de modelos: permite estudiar el impacto de sustituir capas SwiGLU por polinomios ortogonales en la eficiencia y el comportamiento de un modelo de razonamiento, sin necesidad de entrenar desde cero.
- Docencia en entornos con GPUs limitadas: en asignaturas de sistemas de IA o deep learning, se puede desplegar un modelo de razonamiento de 8B en portátiles con 6 GB de VRAM para ilustrar el coste del KV-cache y las técnicas de compactación.
- Prototipado de asistentes de texto locales: sirve como base para experimentar con aplicaciones de chat y razonamiento en equipos sin GPU de centro de datos, respetando la licencia de uso no comercial.
- Evaluación de cadenas de pensamiento largas: la ventana de 32k tokens permite analizar la longitud y la estructura de las cadenas de razonamiento en contextos largos con un menor consumo de memoria.
- Comparación de técnicas de cuantización: el modelo puede usarse como referencia para comparar la cirugía de pesos frente a métodos tradicionales de cuantización, midiendo consumo de VRAM y latencia por capa.
- Análisis de textos multilingües: en tareas de razonamiento sobre documentos en inglés, turco y chino, el modelo ofrece una base para probar la robustez del razonamiento en estos idiomas, aunque la calidad no está evaluada.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks de calidad como MMLU, HumanEval o GSM8K. Los datos siguientes son métricas de rendimiento de hardware y estructura reportadas por el autor.

| Métrica | Original (SwiGLU) | PolySurgery (Chebyshev K=3) | Delta |
|---|---|---|---|
| Parámetros FFN por capa | 176.160.768 | 67.108.864 | -61,90 % |
| Parámetros FFN totales | 5.637.144.576 | 2.147.483.648 | -3,49 mil millones |
| Parámetros totales del modelo | 8.030.000.000 | 4.540.339.072 | -43,5 % |
| Latencia forward por capa | 100,73 ms | 40,43 ms | 2,49 veces más rápida |
| Tiempo de cirugía | Días de fine-tuning (no cuantificado) | 50,74 s | 0,85 min |
| VRAM pico durante cirugía | >16 GB | <400 MB | Extremadamente ligera |

| Longitud de contexto | KV-cache estándar | KV-cache idempotente | Memoria ahorrada |
|---|---:|---:|---:|
| 2.048 tokens | 256,0 MB | 128,0 MB | -50 % |
| 4.096 tokens | 512,0 MB | 256,0 MB | -50 % |
| 8.192 tokens | 1,00 GB | 0,50 GB | -50 % |
| 16.384 tokens | 2,00 GB | 1,00 GB | -50 % |
| 32.768 tokens | 4,00 GB | 2,00 GB | -50 % |

| Configuración | Pesos | KV-cache | Overhead | Total | Estado |
|---|---|---:|---:|---:|---|
| Modelo base @32k | 4,92 GB | 4,00 GB | 0,30 GB | 9,22 GB | OOM en GPU de 6 GB |
| PolySurgery @32k | 2,78 GB | 2,00 GB | 0,20 GB | 4,98 GB | Estable en 6 GB |

## Requisitos de hardware

- VRAM para inferencia: el modelo quirúrgico ocupa 4,98 GB con contexto de 32k. El modelo base, sin las modificaciones, ocupa 9,22 GB y supera el límite de 6 GB.
- GPU evaluada: NVIDIA RTX PRO 500 Blackwell Generation Laptop GPU, 6 GB de VRAM, con 32 GB de RAM.
- Compatibilidad con GPU de consumo: sí, el caso de uso principal es caber en GPUs de 6 GB. No se documentan otros modelos específicos.
- Opciones de despliegue: el quickstart de la model card sugiere llama.cpp / llama-cpp-python junto con PyTorch. No se documentan vLLM, TGI ni Ollama.
- Latencia: la model card reporta 40,43 ms por capa en la capa forward del modelo quirúrgico, frente a 100,73 ms del modelo original. No se proporciona un throughput global en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | VRAM estimada a 32k |
|---|---|---|---|---|
| DeepSeek-R1-8B-PolySurgery | 4,54B | 32.768 tokens | hybrid-patent-open-core | 4,98 GB |
| DeepSeek-R1-Distill-Llama-8B (base) | 8,03B | 32.768 tokens | No disponible en la model card | 9,22 GB (OOM en GPUs de 6 GB) |

No se dispone de datos contrastados para otras alternativas de la misma categoría en la información proporcionada. La comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks de calidad, por lo que el impacto de la cirugía de pesos en razonamiento, comprensión lectora o generación de código es desconocido.
- La licencia hybrid-patent-open-core y las patentes US 64/148,668 y 64/148,679 en trámite restringen el uso a investigación no comercial. Cualquier uso comercial o en producción requiere autorización del autor.
- La compactación KV idempotente reduce un 50 % la memoria, pero no se incluyen evaluaciones de degradación en la calidad de la generación.
- El soporte multilingüe se limita a inglés, turco y chino; otros idiomas podrían presentar un peor rendimiento.
- No se menciona entrenamiento adicional de alineación, por lo que no se garantizan las mismas salvaguardas de seguridad que en el modelo original.
- La model card no especifica el formato de los pesos ni documenta la presencia de artefactos de modelo en el repositorio de Hugging Face (0 descargas). La reproducibilidad queda sujeta al código y al paper indicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aecetin/DeepSeek-R1-8B-PolySurgery
- Repositorio GitHub (idempotent-poly): https://github.com/aemre-cetin/idempotent-poly
- Licencia del proyecto: https://github.com/aemre-cetin/idempotent-poly/blob/main/LICENSE
- Paper (ResearchGate): https://www.researchgate.net/publication/414060833_Hardware-Accelerated_Orthogonal_Polynomial_Tensor_Operators_Zero-Backpropagation_Closed-Form_Algebraic_Solvers_and_In-Situ_Weight_Surgery_for_Deep_Neural_Networks
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- DeepSeek-R1 original en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1
- DeepSeek-R1 original en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
