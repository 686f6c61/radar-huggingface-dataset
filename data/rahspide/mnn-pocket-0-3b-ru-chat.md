# Rahspide/MNN-Pocket-0.3B-RU-Chat

## Resumen

MNN-Pocket-0.3B-RU-Chat es un modelo de lenguaje de 302.830.976 parámetros (aproximadamente 0,3 B) especializado en conversación e instrucciones en ruso, desarrollado por el usuario Rahspide y publicado bajo licencia Apache 2.0. Se construye mediante ajuste fino supervisado (SFT) sobre el modelo base Rahspide/MNN-Pocket-0.3B-RU, que a su vez deriva del modelo bilingüe chino/inglés MNN-Pocket-0.3B. El objetivo declarado es ofrecer un asistente conversacional en ruso que quepa en dispositivos móviles y de bajo consumo, con builds en GGUF y MNN INT4 de entre 165 MB y 310 MB.

La relevancia del modelo reside en su tamaño extremadamente reducido y su enfoque en despliegue on-device: el autor publica builds cuantizados Q8_0, Q4_K_M, Q4_1 y MNN INT4, e indica que la versión INT4 alcanza aproximadamente 497 tok/s de prefill y 80 tok/s de decodificación en 12 hilos de CPU. Está entrenado sobre 50 M de tokens de SFT (24,8 M únicos: 18,8 M en ruso y 6 M en inglés de replay), con una receta de ajuste completo en una única T4 de Kaggle en aproximadamente 6,5 horas.

El modelo se presenta explícitamente como "work-in-progress" y v1, con limitaciones reconocidas por el autor, como la repetición de preguntas en turnos muy cortos. No se han publicado resultados de benchmarks estándar en la información disponible, por lo que su evaluación se limita a comprobaciones cualitativas de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta qwen3; detalles de capas y atención no disponibles) |
| Parametros totales | 302.830.976 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q4_1 (GGUF); MNN INT4 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MNN INT4 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 0,3 B de parámetros, etiquetado como qwen3 en Hugging Face, aunque la información disponible no detalla el número de capas, la dimensión oculta ni el mecanismo de atención. El punto de partida es Rahspide/MNN-Pocket-0.3B-RU (step 36.621), un modelo de continuación de texto entrenado con preentrenamiento continuado sobre 1.200 M de tokens de texto ruso en bruto. Sobre él se aplica un ajuste fino supervisado (SFT) de 50 M de tokens (1.525 pasos de optimizador, 32.000 tokens por paso), con checkpoints cada 300 pasos.

La receta de entrenamiento incluye plantilla ChatML propia del modelo (`<|im_start|>` / `<|im_end|>`), pérdida calculada únicamente sobre los tokens del asistente (los turnos de sistema y usuario se enmascaran), diálogos multi-turno empaquetados con límites explícitos, muestreo de 85/15 ruso-inglés por micro-lote, learning rate 1e-4 con schedule coseno y 5 % de warmup, ajuste completo en fp16 con pesos maestros en fp32 sobre una T4. Los datos provienen de IlyaGusev/saiga_scored (18,8 M tokens, 23.518 diálogos, filtrado a ruso, sin filas marcadas como is_bad_by_regex, 80-6.000 caracteres por diálogo, 2-8 turnos) y HuggingFaceH4/ultrachat_200k (6,0 M tokens, 5.181 diálogos) como replay en inglés. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con formato de instrucciones y respuestas directas en lugar de continuación de texto.
- Seguimiento de instrucciones simples: explicaciones breves, reescrituras cortas, respuestas a preguntas.
- Conversación multi-turno con contexto enmascarado por turnos (el modelo distingue sistema, usuario y asistente vía ChatML).
- Capacidad bilingüe ruso-inglés, mantenida mediante el 15 % de replay en inglés durante el SFT.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking).
- Capacidad de autocompletado deliberadamente no soportada: el autor indica que para continuación de texto debe usarse el modelo hermano MNN-Pocket-0.3B-RU.

## Casos de uso

- Asistente conversacional embebido en aplicaciones Android: el build MNN INT4 (165 MB) se ejecuta con el runtime MNN y la app oficial MnnLlmChat, permitiendo chat en ruso sin conexión en dispositivos de gama media.
- Respuestas a preguntas frecuentes y soporte de primer nivel en ruso: el modelo responde en lugar de continuar el prompt, lo que lo hace adecuado para Q&A acotado y respuestas cortas en entornos con poca memoria.
- Reescritura y generación de textos breves: felicitaciones, mensajes, resúmenes de una o dos frases, aprovechando su bajo coste de inferencia (80 tok/s de decodificación en CPU).
- Prototipado rápido de pipelines de chat en ruso: al estar disponible en GGUF, se puede probar con llama-cli o llama.cpp sin infraestructura GPU, usando `llama-cli -hf Rahspide/MNN-Pocket-0.3B-RU-Chat:Q4_K_M --jinja`.
- Integración en aplicaciones de escritorio o IoT con CPU: los builds Q4_1 (208 MB) y Q4_K_M (223 MB) permiten inferencia local en equipos sin GPU.
- Evaluación educativa de técnicas de SFT y cuantización: el modelo documenta una receta completa y reproducible (dataset, hiperparámetros, tiempos) útil para estudiar ajuste fino de modelos pequeños.
- Filtrado o generación de texto en inglés y ruso en entornos con restricciones de memoria, como parte de un sistema mayor que enrute consultas simples a este modelo y complejas a uno mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo incluye una comprobación cualitativa con generación greedy en Q4_K_M sobre CPU:

| Prompt | Respuesta observada |
|---|---|
| «Объясни в двух предложениях, что такое инфляция.» | «Инфляция — это процесс роста цен на товары и услуги в стране или за ее пределами. Этот процесс может привести к у…» |
| «Напиши короткое поздравление с днём рождения коллеге.» | «Дорогой [Имя], С днём рождения! Желаю, чтобы ваша работа была не только эффективной, но и приятной для глаз…» |
| «Привет! Как дела?» | Repite la pregunta (punto débil conocido en turnos muy cortos) |

Rendimiento declarado del build MNN INT4: aproximadamente 497 tok/s de prefill y 80 tok/s de decodificación en 12 hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp16 ronda los 0,6 GB; en Q8_0, 310 MB; en Q4_K_M, 223 MB; en Q4_1, 208 MB; en MNN INT4, 165 MB.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una única NVIDIA T4. El modelo cabe en cualquier GPU consumer con al menos 1 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU y dispositivos Android.
- Opciones de despliegue: llama.cpp (llama-cli con GGUF), runtime MNN (llm_demo, app Android MnnLlmChat), transformers con safetensors, y text-generation-inference según las etiquetas del repositorio.
- Latencia y throughput: en MNN INT4 sobre 12 hilos de CPU, aproximadamente 497 tok/s de prefill y 80 tok/s de decode. No se dispone de datos para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat | 302,8 M | no disponible | ru, en | Apache 2.0 | safetensors, GGUF, MNN INT4 | Asistente conversacional ruso on-device |
| Rahspide/MNN-Pocket-0.3B-RU (modelo hermano) | ~0,3 B | no disponible | ru | no disponible en la información | safetensors | Continuación de texto, no instrucciones |
| MNN-Pocket-0.3B (base original) | ~0,3 B | no disponible | zh, en | no disponible en la información | no disponible | Bilingüe chino/inglés, sin ruso |

No se dispone de información sobre otros modelos comparables de 0,3 B especializados en ruso en la documentación proporcionada.

## Limitaciones y advertencias

- El autor lo etiqueta como "work-in-progress" y v1; la calidad es limitada por el tamaño de 0,3 B.
- Punto débil conocido: en turnos muy cortos (por ejemplo, «Привет! Как дела?») repite la pregunta en lugar de responder.
- Riesgo de alucinación inherente a modelos pequeños; no se documentan medidas de mitigación.
- Longitud de contexto no especificada; no apto para contextos largos sin verificación.
- Capacidad multilingüe limitada a ruso e inglés; no se garantiza otros idiomas.
- No soporta tool calling, agentes ni razonamiento multi-paso según la información disponible.
- No usar para autocompletado: el modelo responde en lugar de continuar texto; para esa tarea el autor recomienda el modelo hermano MNN-Pocket-0.3B-RU.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre calidad en producción.
- Los datasets de entrenamiento tienen licencias propias (saiga_scored con licencia a consultar en su dataset card; ultrachat_200k con MIT) que deben revisarse para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
- Modelo base: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Build GGUF Q8_0: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat/blob/main/gguf/MNN-Pocket-0.3B-RU-Chat-Q8_0.gguf
- Build GGUF Q4_K_M: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat/blob/main/gguf/MNN-Pocket-0.3B-RU-Chat-Q4_K_M.gguf
- Build GGUF Q4_1: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF/blob/main/MNN-Pocket-0.3B-RU-Chat-Q4_1.gguf
- Build MNN INT4: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat/tree/main/mnn/MNN-Pocket-0.3B-RU-Chat-INT4
- Dataset IlyaGusev/saiga_scored: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Runtime MNN (alibaba/MNN): https://github.com/alibaba/MNN
- Guía de exportación e inferencia LLM de MNN: https://github.com/alibaba/MNN/blob/master/transformers/README.md
- App Android MnnLlmChat: https://github.com/alibaba/MNN/tree/master/apps/Android/MnnLlmChat
