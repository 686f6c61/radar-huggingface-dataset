# adarsh-007/firstlight-124m

## Resumen

Firstlight-124M es un modelo de lenguaje de 124 millones de parámetros entrenado desde cero por un desarrollador individual (adarsh-007) y publicado en Hugging Face. Se compone de dos variantes en el mismo repositorio: un modelo base preentrenado sobre 9,83 mil millones de tokens de FineWeb-EDU y una versión chat obtenida mediante supervisión fine-tuning (SFT) sobre smol-smoltalk. La arquitectura es un transformer decoder-only de tipo GPT-2 con 12 capas, 12 cabezas de atención, dimensión 768 y una ventana de contexto de 1.024 tokens.

El modelo resuelve un problema fundamentalmente educativo y experimental: sirve como referencia reproducible de cómo el preentrenamiento y el SFT cambian el comportamiento de un modelo pequeño, y como punto de partida para experimentos de DPO o LoRA. No está pensado para producción ni para tareas que requieran hechos correctos o salidas seguras, ya que carece de preference tuning y de entrenamiento de seguridad.

Su relevancia actual radica en que reproduce un pipeline completo (preentrenamiento, SFT, evaluación y despliegue) con código abierto bajo licencia MIT, en la estela de proyectos como nanoGPT o nanochat. El modelo base alcanza un 30,30% en HellaSwag (acc_norm), ligeramente por encima del 29,55% del GPT-2 124M original de OpenAI, lo que lo convierte en una alternativa didáctica verificable y de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2): 12 capas, 12 cabezas, dimensión 768 |
| Parametros totales | 124.475.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante `model.py` propio con PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de tipo GPT-2, implementado en PyTorch puro. Consta de 12 capas con 12 cabezas de atención y dimensión oculta de 768, con una ventana de contexto máxima de 1.024 tokens. El tokenizador es GPT-2 BPE vía `tiktoken`, ampliado con 4 tokens de chat (`<|user_start|>`, `<|user_end|>`, `<|assistant_start|>`, `<|assistant_end|>`) que ocupan los ids 50257–50260, rellenando el vocabulario de 50.257 a 50.304 entradas.

El preentrenamiento se realizó sobre el split `sample-10BT` de FineWeb-EDU, con 9,83 mil millones de tokens en una sola época, mediante 18.751 pasos de 524.288 tokens cada uno. Se usó AdamW (betas 0,9/0,95, weight decay 0,1 en pesos 2-D, grad clip 1,0), learning rate de 6e-4 con warmup lineal de 715 pasos y decaimiento coseno hasta 6e-5, precisión bf16 con autocast, matmuls TF32, `torch.compile` y flash attention. El throughput fue de aproximadamente 16.400 tokens/s durante unos 7 días, con una pérdida de validación final de 3,0436. El SFT se aplicó sobre smol-smoltalk con 403.748 conversaciones (253M tokens), usando la misma pérdida de next-token pero calculada únicamente sobre los tokens del asistente y `<|assistant_end|>`, con 12.617 pasos, learning rate 5e-5 y un AdamW nuevo, durante 5,8 horas. La pérdida de validación sobre tokens del asistente bajó de 2,478 a 1,4495 sin sobreajuste. El filtrado descartó conversaciones de código Python (FineWeb-EDU apenas contiene código) y truncó conversaciones que excedían los 1.024 tokens.

## Capacidades

- Generación de texto autoregresiva y continuación de texto (modelo base).
- Respuesta a preguntas en formato chat con parada automática (modelo chat).
- Formato de respuesta correcto: respuestas directas, listas numeradas, encabezados en negrita y cierre autónomo.
- Conversación multiturno básica: permite reformular respuestas previas ("¿puedes hacerlo más corto?").
- Generación con KV cache y muestreo configurable (temperatura, top_k).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo thinking.
- Multilingüismo limitado al inglés.

## Casos de uso

- Docencia y demostración de pipelines de entrenamiento: el par base/chat permite mostrar en vivo cómo el SFT transforma un modelo continuador de texto en un asistente conversacional, usando la pestaña "Base vs Chat" de la demo alojada en Modal.
- Punto de partida para experimentos de DPO o LoRA: al ser un modelo pequeño con licencia MIT y código de entrenamiento reproducible, sirve para probar técnicas de alineación o ajuste eficiente sin grandes recursos de cómputo.
- Experimentos de investigación sobre modelos pequeños: útil para estudiar el efecto del número de tokens de preentrenamiento, la composición del dataset o el filtrado de datos de SFT en modelos por debajo de 1B de parámetros.
- Generación de texto creativo y continuación de prompts en inglés: el modelo base puede usarse para autocompletar texto con fines de prototipado rápido en entornos de desarrollo.
- Evaluación comparativa de tokenizadores y arquitecturas GPT-2: sirve como referencia para comparar recetas de entrenamiento frente al GPT-2 124M original en tareas como HellaSwag.
- Despliegue local didáctico: al caber holgadamente en cualquier GPU consumer, permite montar demos de inferencia con KV cache en portátiles o estaciones de trabajo modestas.

## Benchmarks y rendimiento

| Modelo | HellaSwag (acc_norm) |
|---|---|
| OpenAI GPT-2 124M | 29,55% |
| Firstlight-124M base | 30,30% |
| Firstlight-124M chat | 29,81% |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 124M de parámetros; en bf16 ocupa aproximadamente 250 MB de pesos, y en fp32 unos 500 MB. Con KV cache para 1.024 tokens el consumo adicional es mínimo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: el repositorio proporciona `model.py` propio basado en PyTorch, `tiktoken`, `safetensors` y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado datos de latencia ni throughput de inferencia en la información disponible. El throughput de entrenamiento fue de aproximadamente 16.400 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag (acc_norm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firstlight-124M base | 124,5M | 1.024 | 30,30% | MIT | Hugging Face |
| OpenAI GPT-2 124M | 124M | 1.024 | 29,55% | MIT | Hugging Face |
| Modelos comparables adicionales | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Con 124M de parámetros el modelo chat domina el formato pero no el contenido: afirma hechos incorrectos con seguridad (por ejemplo, sitúa París a unos 2.500 millas al sur de la Ciudad de la Luz) y comete errores de conteo (pide 3 consejos y da 5 u 8).
- Tiende a repetirse en respuestas largas.
- La conversación social es débil: un "gracias" simple a menudo provoca la repetición del tema en lugar de una respuesta adecuada, porque smol-smoltalk contiene casi exclusivamente conversaciones de tarea.
- Ventana de contexto de solo 1.024 tokens (unas 750 palabras): en conversaciones largas se olvidan los turnos más antiguos.
- No tiene preference tuning ni entrenamiento de seguridad; no debe usarse para nada que requiera hechos correctos o salidas seguras.
- Solo soporta inglés.
- Riesgo elevado de alucinación por el tamaño reducido y la ausencia de RLHF.
- La licencia MIT permite uso comercial, pero el autor declara explícitamente que el modelo está fuera de alcance para aplicaciones que requieran corrección factual o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adarsh-007/firstlight-124m
- Demo Firstlight Chat (Modal): https://adarsheluri143--firstlight-chat-ui.us-east.modal.run
- Código (preentrenamiento, SFT, evaluaciones, release y demo): https://github.com/adarsh070502/firstlight
- Dataset de preentrenamiento FineWeb-EDU: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
