# hoborific/Gemma-4-Dark-Gemistry-31B-W8A16-FP8

## Resumen

Gemma-4-Dark-Gemistry-31B-W8A16-FP8 es una cuantización offline del modelo [Nimbz/Gemma-4-Dark-Gemistry-31B](https://huggingface.co/Nimbz/Gemma-4-Dark-Gemistry-31B), un merge comunitario basado en Gemma 4 31B de Google. El modelo original está orientado a escritura creativa, roleplay, conversación y razonamiento multimodal, con un enfoque "uncensored" (sin filtros de contenido). Esta versión cuantizada reduce el peso de los parámetros lineales a FP8 (W8A16), manteniendo las activaciones en bf16/fp16, lo que permite desplegarlo con menor consumo de VRAM y mayor throughput en entornos compatibles.

La cuantización está realizada con la librería `compressed-tensors` de Neural Magic, con un esquema por canal y búsqueda de clipping por MSE, lo que según el autor ofrece mejor relación señal-ruido que la cuantización online de vLLM. El modelo mantiene la arquitectura multimodal de Gemma 4 (texto e imagen) y hereda las capacidades del modelo base, aunque no se han publicado benchmarks específicos para esta versión cuantizada. Es relevante porque facilita la ejecución de un modelo de 31B en GPUs con memoria limitada, especialmente en plataformas Intel XPU y NVIDIA CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 31B) con vision tower |
| Parametros totales | 32.682.375.020 (según safetensors) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 soporta hasta 256K tokens) |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | no disponibles (el modelo base Gemma 4 soporta más de 140 idiomas) |
| Licencia | no disponible (el modelo base Nimbz tiene licencia Apache 2.0) |
| Formato de pesos | safetensors (compressed-tensors, float-quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantización offline del merge Nimbz/Gemma-4-Dark-Gemistry-31B, que a su vez se basa en Gemma 4 31B de Google. Gemma 4 presenta una arquitectura transformer multimodal con atención densa y una torre de visión para procesar imágenes. El merge original fue creado con `mergekit` combinando varios modelos base para potenciar capacidades de escritura creativa, roleplay y conversación, sin detalles públicos sobre el dataset o el método de entrenamiento.

La cuantización W8A16 FP8 se aplica únicamente a los pesos de las proyecciones lineales 2D (attention q/k/v/o y MLP gate/up/down). Cada fila de salida recibe una escala propia, calculada a partir de `amax / 448` y refinada mediante una búsqueda de clipping por MSE sobre ~9 fracciones (0.8–1.0× amax). Los pesos se cuantizan con redondeo al más cercano y saturación. Embeddings, normas, lm_head, routers/expertos y la torre de visión permanecen en bf16, y se listan en la lista `ignore` del checkpoint para que vLLM no los toque. Este esquema por canal con clipping ofrece mejor SNR que la cuantización per-tensor online de vLLM, según el autor.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce texto (heredado de Gemma 4).
- Escritura creativa y roleplay: el modelo base está afinado para narrativa expresiva, diálogos y personajes.
- Conversación multi-turno: soporta diálogos largos con contexto amplio (el base admite hasta 256K tokens).
- Soporte de tool calling / function calling: probablemente disponible en el modelo base, aunque no confirmado en esta cuantización.
- Capacidades multilingües: el modelo base Gemma 4 soporta más de 140 idiomas; esta versión no especifica restricciones.
- Razonamiento y código: el modelo base Gemma 4 incluye capacidades de razonamiento y generación de código, heredadas aquí.
- Sin filtros de contenido: el modelo base es "uncensored" y puede generar contenido NSFW, lo que debe tenerse en cuenta.

## Casos de uso

- Despliegue de un asistente conversacional multimodal en producción: gracias a la cuantización FP8, el modelo puede ejecutarse en GPUs con 40-48 GB de VRAM (p. ej., A6000, L40S) usando vLLM, con menor latencia que la versión en bf16.
- Generación de narrativa interactiva para juegos o experiencias de rol: el modelo base está optimizado para roleplay y escritura expresiva, y la cuantización mantiene la calidad del texto para estos fines.
- Análisis de imágenes con descripción detallada: al ser multimodal, puede recibir una imagen y generar descripciones, resúmenes o responder preguntas sobre ella, útil en aplicaciones de accesibilidad o moderación.
- Creación de contenido creativo asistido (guiones, cuentos, diálogos): el modelo produce texto con estilo literario y puede adaptarse a distintos tonos, gracias al merge original.
- Chatbots de entretenimiento o compañía: su naturaleza "uncensored" y conversacional lo hace adecuado para aplicaciones de ocio donde se busca libertad creativa, siempre con supervisión.
- Investigación sobre cuantización y eficiencia: este checkpoint sirve como ejemplo de cuantización W8A16 FP8 con compressed-tensors, útil para estudiar el impacto en calidad y rendimiento en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de calidad (p. ej., MMLU, HumanEval, GSM8K) ni comparaciones con el modelo original o con otras cuantizaciones. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 36-40 GB, dado que el repo pesa 36.1 GB y los pesos están mayoritariamente en FP8 (1 byte por parámetro) con algunas capas en bf16. No se dispone de una cifra exacta.
- GPUs recomendadas: NVIDIA con SM75+ (Turing o superior), como RTX 3090/4090 (24 GB, insuficiente), A6000 (48 GB), L40S (48 GB), A100 (80 GB) o H100 (80 GB). También compatible con Intel XPU.
- No cabe en GPUs de consumo de 24 GB sin más cuantización; se necesitan al menos 40 GB para cargar el modelo completo.
- Opciones de despliegue: vLLM es el runtime recomendado, con kernels específicos para NVIDIA CUDA (MarlinFP8ScaledMMLinearKernel o HummingFP8ScaledMMLinearKernel) y para Intel XPU (XPUW8A16FP8LinearKernel). No compatible con ROCm, CPU o TPU.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-Dark-Gemistry-31B-W8A16-FP8 (este) | 32.68B | no disponible (base: 256K) | no disponible | FP8 W8A16 | Cuantización para vLLM, multimodal |
| Nimbz/Gemma-4-Dark-Gemistry-31B (base) | 32.68B | 256K (base) | Apache 2.0 | bf16 | Merge para creatividad y roleplay, sin cuantizar |
| mradermacher/Gemma-4-Dark-Gemistry-31B-GGUF | 32.68B | no disponible | no disponible | GGUF | Cuantización GGUF para llama.cpp/Ollama |
| Gemma 4 31B (original) | 31B (aprox.) | 256K | Apache 2.0 | bf16 | Modelo oficial de Google, multimodal y multilingüe |

La comparativa se basa en datos públicos de las fichas de Hugging Face. No se dispone de benchmarks comparativos entre estas versiones.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" y sin filtros, puede generar contenido ofensivo, NSFW o inapropiado. No es adecuado para aplicaciones comerciales sin moderación.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento factual.
- Limitaciones de plataforma: la cuantización W8A16 FP8 solo funciona en vLLM con kernels para NVIDIA CUDA (SM75+) e Intel XPU; no es compatible con ROCm, CPU o TPU.
- Pérdida de precisión: la cuantización FP8 puede degradar ligeramente la calidad en tareas de razonamiento complejo o matemáticas, aunque el autor afirma que el esquema por canal minimiza el error.
- Licencia: la licencia de esta cuantización no está especificada; el modelo base usa Apache 2.0, pero se recomienda verificar antes de uso comercial.
- Contexto y multilingüismo: no se han verificado las capacidades de contexto largo ni el soporte multilingüe en esta versión cuantizada; se recomienda probar con casos reales.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Gemma-4-Dark-Gemistry-31B-W8A16-FP8
- Modelo base (Nimbz): https://huggingface.co/Nimbz/Gemma-4-Dark-Gemistry-31B
- Versión GGUF (mradermacher): https://huggingface.co/mradermacher/Gemma-4-Dark-Gemistry-31B-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Descripción en NanoGPT: https://nano-gpt.com/models/text/Gemma-4-31B-Dark-Gemistry
