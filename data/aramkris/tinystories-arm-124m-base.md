# aramkris/tinystories-arm-124m-base

## Resumen

tinystories-arm-124m-base es un modelo de lenguaje de 124 millones de parámetros entrenado desde cero por el desarrollador independiente aramkris dentro del proyecto tinystories-ARM-model. Se trata de un GPT decoder-only de 12 capas y 768 dimensiones con una arquitectura propia (RoPE, SwiGLU, QK-norm, sin sesgos) y un contexto de 512 tokens, entrenado sobre 2.500 millones de tokens combinando Mini FineWeb-Edu y subconjuntos de Cosmopedia. El objetivo del proyecto es construir un modelo pequeño y reproducible mediante cambios incrementales medidos, entrenado en un Mac y en GPUs de Colab.

El modelo se publica como "base" (sin ajuste de instrucciones), aunque el autor ofrece versiones chat derivadas (SFT y SFT + DPO) y un modelo de difusión enmascarada del mismo tamaño. Su interés reside en que es un punto de referencia de código abierto para experimentación a pequeña escala: supera ligeramente a GPT-2 small en pérdida sobre el conjunto de validación de Mini FineWeb-Edu y en HellaSwag y ARC-Easy, aunque queda por detrás en LAMBADA y WikiText-2.

Es relevante ahora como banco de pruebas educativo y de investigación: permite reproducir el pipeline completo de entrenamiento, evaluación y despliegue con requisitos de hardware muy modestos, y sirve como base para comparar técnicas (SFT, DPO, difusión) sobre una misma arquitectura y un mismo corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (12 capas, 768 d_model, 12 cabezas, RoPE, SwiGLU, sin sesgos, QK-norm) |
| Parametros totales | 124M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en PyTorch, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model_params.pt`), con `model_config.json`, `meta.json`, `eval.json`, `benchmarks.json` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only definida en `model.py` del repositorio del proyecto, no en una implementación estándar como `transformers`. Consta de 12 capas con dimensión 768 y 12 cabezas de atención, usa embeddings rotatorios (RoPE) para la posición, activación SwiGLU en el bloque feed-forward, elimina todos los términos de sesgo y aplica QK-norm sobre las consultas y claves. El tokenizador es el de GPT-2 (vía `tiktoken`), lo que fija un vocabulario de aproximadamente 50.257 tokens y un contexto máximo de 512 tokens.

El entrenamiento utilizó 2.500 millones de tokens: el conjunto completo Mini FineWeb-Edu más subconjuntos de Cosmopedia (stories, WikiHow, OpenStax, Stanford y Khan Academy), eliminando del corpus los documentos reservados para evaluación de Mini FineWeb-Edu. Se realizaron 152.600 actualizaciones. El autor indica que el modelo se construyó "a mano, mejorando un cambio medido cada vez", y que el entrenamiento se ejecutó en un Mac y en GPUs de Colab. No se documenta en la información disponible el uso de RLHF o DPO para esta variante base (sí existen versiones chat con SFT y DPO).

## Capacidades

- Generación de texto en inglés con estilo educativo y fluido, orientado a contenido tipo enciclopedia, explicaciones y relatos.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Razonamiento de sentido común limitado, con resultados en HellaSwag (32,3%) y PIQA (62,4%) próximos a GPT-2 small.
- Comprensión lectora básica y respuesta a preguntas simples de opción múltiple (ARC-Easy 46,8%).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación sobre entrenamiento desde cero: el repositorio permite reproducir el pipeline completo (tokenización, entrenamiento, evaluación con `lm-evaluation-harness`) y estudiar el efecto de cambios arquitectónicos aislados, gracias a que el autor documenta cada modificación medida.
- Generación de texto educativo sintético: el modelo produce prosa explicativa en inglés sobre temas científicos y académicos, útil para aumentar corpus de dominio educativo a bajo coste computacional.
- Banco de pruebas para comparación de paradigmas: al existir variantes base, SFT, DPO y difusión enmascarada con los mismos datos y tamaño, permite comparar metodologías de ajuste sobre una base idéntica.
- Prototipado y docencia: su tamaño de 124M permite ejecutar inferencia en CPU y en portátiles, lo que lo hace adecuado para cursos de NLP y demostraciones de generación autoregresiva.
- Evaluación de técnicas de decodificación: el autor advierte que la decodificación greedy repite texto, por lo que sirve para experimentar con temperatura, top-k y penalización por repetición en un entorno controlado.
- Generación de cuentos y texto creativo corto en inglés: el corpus incluye TinyStories y subconjuntos de stories de Cosmopedia, y obtiene una pérdida de 2,751 en TinyStories, lo que lo hace razonable para narrativa infantil breve.
- Base para ajuste fino ligero: al estar bajo licencia MIT y con pesos PyTorch, puede adaptarse con SFT o LoRA a tareas concretas de generación de texto en inglés sin restricciones de uso comercial.

## Benchmarks y rendimiento

Resultados zero-shot al estilo de `lm-evaluation-harness`, comparados con OpenAI GPT-2 small (124M):

| Benchmark | tinystories-arm-124m-base | GPT-2 small (124M) |
|---|---|---|
| Mini FineWeb-Edu (held-out, loss) | 3,296 | 3,401 |
| TinyStories (loss) | 2,751 | 2,553 |
| WikiText-2 (loss) | 5,047 | 4,180 |
| Shakespeare (loss) | 5,446 | 4,807 |
| HellaSwag | 32,3% | 31,1% |
| ARC-Easy | 46,8% | 43,8% |
| PIQA | 62,4% | 62,9% |
| LAMBADA | 20,3% | 32,6% |
| Winogrande | 49,9% | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 124M de parámetros ocupan aproximadamente 0,5 GB; en FP16, unos 0,25 GB. El repositorio completo pesa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el autor entrena y ejecuta en Mac y en GPUs de Colab (T4 o similar).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, como muestra el ejemplo de la model card que carga el modelo en `"cpu"`.
- Opciones de despliegue: el modelo requiere el código propio del repositorio (`inference.load_model`, `load_model_config`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La carga se realiza con PyTorch y `tiktoken`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | ARC-Easy | LAMBADA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| tinystories-arm-124m-base | 124M | 512 | 32,3% | 46,8% | 20,3% | MIT | Hugging Face (repo propio) |
| OpenAI GPT-2 small | 124M | 1.024 | 31,1% | 43,8% | 32,6% | MIT | Hugging Face / OpenAI |
| tinystories-arm-124m-chat-sft | 124M | 512 | no disponible | no disponible | no disponible | MIT | Hugging Face (repo del autor) |
| tinystories-arm-124m-diffusion | 124M | 512 | no disponible | no disponible | no disponible | MIT | Hugging Face (repo del autor) |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no debe usarse directamente como asistente conversacional; para ello existen las variantes SFT y DPO del mismo autor.
- Conocimiento factual muy limitado: con 124M de parámetros y 2,5B de tokens, el autor advierte que "sabe pocos hechos de forma fiable".
- Decodificación greedy repetitiva: es necesario usar temperatura, top-k o penalización por repetición para obtener texto coherente.
- Contexto corto de 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación y de generar afirmaciones plausibles pero falsas, especialmente en contenido educativo y científico.
- Sesgos: no se documenta un análisis de sesgos en la información disponible; el corpus (FineWeb-Edu y Cosmopedia) puede introducir sesgos de dominio y de estilo.
- Requiere código propio del repositorio para cargar los pesos; no es compatible de forma directa con `transformers`, lo que complica su integración en pipelines estándar.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/tinystories-arm-124m-base
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Variante chat SFT: https://huggingface.co/aramkris/tinystories-arm-124m-chat-sft
- Variante chat SFT + DPO: https://huggingface.co/aramkris/tinystories-arm-124m-chat-dpo
- Variante de difusión enmascarada: https://huggingface.co/aramkris/tinystories-arm-124m-diffusion
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
