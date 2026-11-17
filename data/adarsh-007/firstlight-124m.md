# adarsh-007/firstlight-124m

## Resumen

Firstlight-124M es un modelo de lenguaje de 124 millones de parámetros desarrollado por el usuario independiente Adarsh (adarsh-007) y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only con la arquitectura de GPT-2 (12 capas, 12 cabezas de atención, dimensión 768 y contexto de 1.024 tokens) escrito en PyTorch puro y entrenado desde cero, sin partir de pesos preexistentes. El repositorio incluye dos variantes: un modelo base preentrenado y una versión ajustada mediante supervisión (SFT) para funcionar como asistente conversacional.

El modelo base se preentrenó sobre 9.830 millones de tokens del subconjunto `sample-10BT` de FineWeb-EDU durante una época, con un resultado de pérdida de validación de 3,0436 y un 30,30% de precisión en HellaSwag (frente al 29,55% del GPT-2 124M de OpenAI). Posteriormente se aplicó SFT sobre 403.748 conversaciones de smol-smoltalk, un conjunto de datos diseñado específicamente para modelos por debajo de los 1.000 millones de parámetros, lo que reduce la pérdida de validación sobre los tokens del asistente de 2,478 a 1,4495.

Su relevancia es fundamentalmente educativa y experimental: demuestra de forma reproducible el ciclo completo de preentrenamiento y ajuste conversacional en un presupuesto de cómputo reducido (aproximadamente 7 días de preentrenamiento y 5,8 horas de SFT), siguiendo la estela de proyectos como nanochat. No está pensado para producción ni para tareas que requieran precisión factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, 12 cabezas, 768 dimensiones) |
| Parametros totales | 124.475.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de GPT-2 con 12 capas, 12 cabezas de atención y dimensión oculta de 768, con un vocabulario derivado del tokenizador BPE de GPT-2 vía `tiktoken`, ampliado de 50.257 a 50.304 entradas para alojar cuatro tokens de chat (`<|user_start|>`, `<|user_end|>`, `<|assistant_start|>`, `<|assistant_end|>`) en los identificadores 50257–50260. El preentrenamiento utilizó 18.751 pasos de 524.288 tokens cada uno (9,83B tokens en total, una época) sobre FineWeb-EDU, con AdamW (betas 0,9/0,95, weight decay 0,1 sobre pesos 2D, grad clip 1,0), learning rate de 6e-4 con warmup lineal de 715 pasos y decaimiento coseno hasta 6e-5, precisión bf16 con autocast, matmuls TF32, `torch.compile` y flash attention. El throughput fue de aproximadamente 16.400 tokens por segundo durante unos 7 días; se mantuvo el primer shard de 100M tokens como validación y se guardaron checkpoints cada 100 pasos con escritura atómica, con dos reanudaciones sobre los tokens exactos siguientes.

El ajuste supervisado partió de los pesos del modelo base con un optimizador AdamW nuevo, sobre 403.748 conversaciones de smol-smoltalk (253M tokens tras filtrado), durante una época en 12.617 pasos de 32 conversaciones, con learning rate 5e-5, warmup de 50 pasos y decaimiento lineal hasta 0, sin weight decay, en 5,8 horas. La pérdida es la misma de next-token pero calculada únicamente sobre los tokens del asistente y el token `<|assistant_end|>`, de modo que el modelo aprende tanto a responder como a detenerse; los tokens del usuario y el padding se ignoran. El filtrado descartó 48.071 conversaciones de código Python (FineWeb-EDU apenas contiene código), 8.522 con primera respuesta superior a 1.024 tokens y recortó 178.102 tras el último turno completo del asistente que cabía en la ventana.

## Capacidades

- Generación de texto en inglés y continuación de texto libre (variante base).
- Respuesta conversacional de un solo turno con formato correcto: respuestas directas, listas numeradas, encabezados en negrita y parada autónoma (variante chat).
- Conversación multiturno básica: puede reescribir o acortar su respuesta anterior ante instrucciones como "can you make it shorter?".
- Seguimiento de formato y estilo de respuesta aprendido por imitación en SFT.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de razonamiento extendido.
- Multilingüismo limitado al inglés.

## Casos de uso

- Docencia y demostración del ciclo de entrenamiento: el repositorio permite comparar directamente el modelo base y el modelo chat con el mismo prompt en la demo de Hugging Face Spaces, ilustrando cómo el SFT cambia el comportamiento sin añadir conocimiento.
- Punto de partida para experimentos de DPO o LoRA: al ser un modelo pequeño con licencia MIT y pesos safetensors, sirve como banco de pruebas de bajo coste para técnicas de alineación por preferencias.
- Experimentos de investigación sobre modelos pequeños: permite estudiar curvas de pérdida, recetas de preentrenamiento y filtrado de datos con un presupuesto de cómputo de una sola GPU durante días.
- Generación de texto creativo y continuación de prompts en inglés: la variante base puede usarse para completar frases o párrafos en tareas de demostración donde no se exija corrección factual.
- Evaluación comparativa de tokenizadores y recetas: útil para reproducir métricas como HellaSwag en modelos de ~124M y contrastar con GPT-2.
- Prototipado de interfaces de chat: el formato de chat con tokens dedicados y el código de `model.py` (con caché KV y streaming) permiten construir demos interactivas ligeras.
- No es adecuado para atención al cliente real, generación de código en producción ni tareas que requieran precisión factual o seguridad.

## Benchmarks y rendimiento

| Modelo | HellaSwag (acc_norm) |
|---|---|
| OpenAI GPT-2 124M | 29,55% |
| Firstlight-124M base | 30,30% |
| Firstlight-124M chat | 29,81% |

Pérdida de validación del preentrenamiento: 3,0436 (mejor checkpoint en el paso 18.250). Pérdida de validación de SFT sobre tokens del asistente: 2,478 antes del ajuste, 1,4495 después, sin sobreajuste observado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 124,5M de parámetros ocupan aproximadamente 500 MB; en bf16, unos 250 MB; en int8, unos 125 MB. El repositorio ocupa 1,0 GB e incluye ambos modelos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en GPUs integradas con suficiente memoria compartida. Para entrenamiento se usó una configuración con bf16, TF32 y flash attention, sin especificar el hardware exacto.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: el autor proporciona código propio en `model.py` (PyTorch, `tiktoken`, `safetensors`, `huggingface_hub`) con caché KV y streaming; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponible para inferencia; en entrenamiento se alcanzaron ~16.400 tokens/s con `torch.compile` y flash attention.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firstlight-124M | 124,5M | 1.024 | 30,30% (base) | MIT | Hugging Face |
| OpenAI GPT-2 124M | 124M | 1.024 | 29,55% | MIT (pesos originales) | Hugging Face, ampliamente distribuido |
| Modelos nanochat | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita a GPT-2 124M, sobre el que Firstlight mejora ligeramente en HellaSwag. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Precisión factual muy baja: el modelo afirma datos incorrectos con seguridad (por ejemplo, sitúa París a unas 2.500 millas al sur de la Ciudad de la Luz) y comete errores de conteo (pide 3 consejos y da 5 u 8).
- Repetición en respuestas largas.
- Conversación social débil: un simple "gracias" suele provocar la repetición del tema en lugar de una respuesta adecuada, porque smol-smoltalk contiene casi exclusivamente conversaciones de tarea.
- Ventana de contexto de solo 1.024 tokens (unas 750 palabras): en chats largos olvida los turnos más antiguos.
- Sin entrenamiento de preferencias ni de seguridad: no debe usarse en aplicaciones que requieran salidas seguras o alineadas.
- Solo inglés.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre FineWeb-EDU y smol-smoltalk puede heredar los sesgos de estos corpus.
- Licencia MIT: permite uso comercial, pero el autor declara explícitamente que el modelo no es apto para tareas que requieran hechos correctos o salidas seguras.
- El SFT enseña comportamiento, no conocimiento; el modelo no debe tratarse como una fuente de información fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adarsh-007/firstlight-124m
- Demo Firstlight Chat (Hugging Face Spaces): https://huggingface.co/spaces/adarsh-007/firstlight-chat
- Código de inferencia (`model.py`): https://huggingface.co/spaces/adarsh-007/firstlight-chat/blob/main/model.py
- Dataset de preentrenamiento FineWeb-EDU: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
