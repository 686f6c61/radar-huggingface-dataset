# devilloots/story-llm-30mb

## Resumen

Story30MB es un modelo de generación de texto de dominio muy específico, desarrollado por el usuario devilloots, orientado a la generación de historias cortas a partir de prompts en lenguaje natural. Se trata de un modelo entrenado desde cero (from scratch), sin partir de un checkpoint preentrenado, con un total de 14.531.712 parámetros y un peso en disco de aproximadamente 27,73 MiB en FP16. Su nombre comercial, "30MB", hace referencia al orden de magnitud del artefacto completo más el tokenizador, no al número de parámetros.

El modelo emplea una arquitectura transformer decoder-only compacta con 9 capas, dimensión de modelo de 384, MLP de 832, atención con query agrupada (GQA) de 12 cabezas de query y 4 de clave/valor con dimensión de cabeza 32, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El tokenizador es un BPE propio de 6.144 tokens y la longitud de bloque es de 384 tokens. El entrenamiento se realizó en 2 GPUs Tesla T4.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra que es posible entrenar un generador de historias funcional con un presupuesto de cómputo mínimo y un vocabulario cerrado, lo que lo convierte en un caso de estudio útil para entender el impacto del tamaño del tokenizador, las decisiones arquitectónicas modernas (GQA, SwiGLU, RoPE) en modelos minúsculos y los límites prácticos de la generación de texto a esta escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (9 capas, d_model=384, mlp_dim=832, GQA 12Q/4KV, head_dim=32, RMSNorm, SwiGLU, RoPE) |
| Parámetros totales | 14.531.712 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens (block_size) |
| Tipos de cuantización | No disponible (pesos publicados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (prompts de ejemplo en inglés; no se declara cobertura multilingüe) |
| Licencia | MIT |
| Formato de pesos | PyTorch (pesos con embeddings atados; `head.weight` omitido en disco y reatado a `tok.weight` en carga) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9 capas con dimensión de modelo 384 y dimensión de MLP 832. Incorpora varias decisiones propias de arquitecturas modernas trasladadas a escala minúscula: atención con query agrupada (12 cabezas de query y 4 de clave/valor, con dimensión de cabeza 32), proyecciones QKV fusionadas y proyecciones Gate/Up fusionadas, RMSNorm en lugar de LayerNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). Los embeddings de entrada y la cabeza de salida están atados (weight tying), lo que reduce el recuento efectivo de parámetros y explica que la cabeza se omita en disco y se reate en la carga.

El tokenizador es un BPE propio de 6.144 tokens denominado Raw-First BPE (`story_bpe_6144.json`), con un formato de prompt fijo: `Prompt: <natural english prompt>\nStory:\n`. El entrenamiento se realizó desde cero en 2 GPUs Tesla T4. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de ajuste fino con RLHF o DPO.

## Capacidades

- Generación de texto narrativo breve: historias cortas a partir de un prompt en lenguaje natural, siguiendo el formato `Prompt: ...\nStory:\n`.
- Generación condicionada por prompt: el modelo acepta indicaciones en inglés y produce continuación narrativa dentro de la ventana de 384 tokens.
- Copia de nombres y adherencia a escenarios no vistos: la model card reporta métricas específicas de zero-shot sobre entidades y tramas no vistas durante el entrenamiento.
- Generación autorregresiva estándar: no se documentan modos de razonamiento extendido, tool calling, function calling ni capacidades de agente.
- Capacidades multilingües: no disponibles; los ejemplos y el formato de prompt están en inglés.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Prototipado rápido de generadores de historias: permite disponer de un modelo de 14,5M de parámetros que se ejecuta en CPU o en GPU de gama baja para validar pipelines de generación narrativa antes de escalar a modelos mayores.
- Investigación sobre tokenizadores de vocabulario reducido: sirve para estudiar cómo un vocabulario BPE de 6.144 tokens afecta a la calidad y a la longitud efectiva de las secuencias generadas en tareas narrativas.
- Docencia y experimentación con arquitecturas modernas a escala pequeña: al combinar GQA, SwiGLU, RMSNorm y RoPE en un modelo de 9 capas, es útil para asignaturas y talleres que expliquen estas técnicas sin requerir hardware especializado.
- Generación de texto en entornos con restricciones de memoria: con un peso de ~27,73 MiB en FP16, puede desplegarse en dispositivos embebidos, navegadores o funciones serverless con límites estrictos de memoria.
- Evaluación de técnicas de weight tying y fusión de proyecciones: el diseño con `head.weight` reatado y QKV/Gate-Up fusionados lo convierte en un banco de pruebas para medir el ahorro de parámetros y su impacto en la calidad.
- Generación de datos sintéticos narrativos a pequeña escala: útil para aumentar corpus de cuentos cortos en experimentos controlados donde la diversidad controlada y la reproducibilidad importan más que la calidad literaria.
- Benchmark de referencia para modelos tiny: sirve como línea base de comparación frente a modelos minúsculos similares en tareas de generación de historias con métricas de copia exacta y adherencia a trama.

## Benchmarks y rendimiento

La model card reporta únicamente una auditoría zero-shot estricta sobre datos no vistos:

| Prueba | Resultado |
|---|---|
| Copia exacta estricta de nombres no vistos (Strict Exact Unseen Name Copy) | 12,5 % (1/8) |
| Adherencia a escenario/trama no vistos (Unseen Setting / Plot Adherence) | 44,4 % (4/9) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP16 (~27,73 MiB de pesos más activaciones y caché KV para 384 tokens); en la práctica cabe en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna; el modelo se entrenó en 2x Tesla T4, pero para inferencia no requiere hardware de datacenter. Funciona en RTX 4090, RTX 3060, GTX 1650 e incluso en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, y también en CPU y en dispositivos con pocos cientos de MB de RAM.
- Opciones de despliegue: al publicarse como pesos PyTorch con tokenizador BPE propio, el despliegue natural es mediante el script `generate.py` del repositorio con `torch`, `tokenizers` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Story30MB (devilloots) | 14,53 M | 384 tokens | MIT | PyTorch | Hugging Face |
| TinyStories-1M (roneneldan) | ~1 M | 512 tokens | MIT | PyTorch | Hugging Face |
| TinyStories-33M (roneneldan) | ~33 M | 512 tokens | MIT | PyTorch | Hugging Face |
| GPT-2 small | 124 M | 1.024 tokens | MIT | PyTorch, GGUF, etc. | Hugging Face |

La comparación se limita a parámetros, contexto y licencia, ya que no se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada. Story30MB se sitúa entre los modelos TinyStories en tamaño, con un tokenizador propio de 6.144 tokens y un contexto más corto (384 frente a 512).

## Limitaciones y advertencias

- Escala muy reducida: con 14,53 M de parámetros, la coherencia narrativa, el conocimiento del mundo y la diversidad léxica están severamente limitados en comparación con modelos de miles de millones de parámetros.
- Ventana de contexto corta: 384 tokens restringen la longitud de las historias y la cantidad de contexto que el modelo puede mantener; las generaciones largas degradarán la coherencia.
- Riesgo de alucinación y de repetición: esperable en modelos pequeños entrenados desde cero, con posible deriva temática y bucles en la generación.
- Cobertura de idiomas no declarada: el formato de prompt y los ejemplos están en inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Métricas zero-shot modestas: la copia exacta de nombres no vistos es del 12,5 % y la adherencia a trama del 44,4 %, lo que indica fiabilidad limitada en condiciones fuera de distribución.
- Uso comercial: la licencia MIT permite uso comercial, pero la calidad y la fiabilidad del modelo hacen desaconsejable su uso en producción orientada a usuarios finales sin una evaluación exhaustiva.
- Sesgos: no se documentan análisis de sesgos; al entrenarse desde cero sobre un corpus no especificado, pueden aparecer sesgos presentes en los datos de entrenamiento.
- Despliegue: no hay integración documentada con servidores de inferencia estándar (vLLM, TGI, llama.cpp), por lo que requiere el script propio del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devilloots/story-llm-30mb
- Tokenizador referenciado en la model card: `story_bpe_6144.json` (incluido en el repositorio del modelo)
- Script de generación referenciado en la model card: `generate.py` (incluido en el repositorio del modelo)
