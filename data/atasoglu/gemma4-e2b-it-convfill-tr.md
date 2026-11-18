# atasoglu/gemma4-e2b-it-ConvFill-TR

## Resumen

`atasoglu/gemma4-e2b-it-ConvFill-TR` es un ajuste fino en turco del modelo `google/gemma-4-E2B-it` de Google, desarrollado por el usuario atasoglu. Está especializado en la tarea de *conversational infill* descrita en el artículo "Thinking While Speaking: Inference-Time Knowledge Transfer for Responsive and Intelligent Conversational Voice Agents" (arXiv:2511.07397). El problema que resuelve es concreto: en un asistente de voz con dos modelos, un modelo pequeño local (el "Talker") debe empezar a hablar de inmediato con rellenos conversacionales mientras un modelo de fondo más grande razona, recupera información y usa herramientas; cuando la respuesta llega como un turno `knowledge`, el modelo local la incorpora de forma fluida en su discurso en curso.

El modelo tiene 5.123.178.051 parámetros totales según los pesos en safetensors y se distribuye en formato bf16 fusionado, con un tamaño de repositorio de 10,3 GB. No es un modelo de chat general: está entrenado específicamente para generar turnos de diálogo contextualmente apropiados que integren conocimiento externo retardado. La relevancia actual radica en que aborda el compromiso entre latencia y capacidad de razonamiento en asistentes de voz, un cuello de botella habitual en despliegues de producción.

El ajuste se realizó con QLoRA de 4 bits sobre `unsloth/gemma-4-E2B-it`, con fusión posterior a bf16, sobre un conjunto sintético de 9.992 conversaciones turcas. La licencia es Gemma, lo que impone restricciones de uso comercial y la aceptación de la política de usos prohibidos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con máximo de 1024 tokens por ejemplo) |
| Tipos de cuantizacion | bf16 (pesos fusionados); variantes ONNX q4f16 y GGUF disponibles en repositorios separados |
| Idiomas soportados | Turco (tr) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (bf16); ONNX y GGUF en repos alternativos |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con pipeline image-text-to-text, y hereda su arquitectura base, de la que no se detallan capas, dimensiones ni mecanismos de atención en la información disponible. El ajuste fino se aplicó con Unsloth como QLoRA de 4 bits sobre `unsloth/gemma-4-E2B-it`: LoRA con r = 64, alpha = 64 y dropout 0, dirigido a las proyecciones de atención (q, k, v, o) y MLP (gate, up, down) del modelo de lenguaje, además de las proyecciones de entrada por capa. El adaptador se fusionó después en pesos bf16, dequantizando localmente la base de 4 bits.

El entrenamiento usó el dataset `atasoglu/convfill-dataset-tr-10k`, con 9.992 conversaciones sintéticas en turco escritas para un asistente de voz de dos modelos. Cada conversación se corta en ejemplos a nivel de turno y la pérdida se calcula solo sobre los turnos del modelo (rellenos, `<sil>` y la respuesta final), no sobre el prompt. Se emplearon aproximadamente 307.000 ejemplos para una época, descartando ejemplos de más de 1024 tokens. Los hiperparámetros incluyen AdamW fusionado, weight decay 0,01, recorte de gradiente 1,0, tasa de aprendizaje 2e-4 con 5 % de warmup y decaimiento coseno, batch de 16 (4 por paso con 4 de acumulación), precisión bf16, 1 época y 19.201 pasos, semilla 42. El entrenamiento se ejecutó en una única GPU de consumo durante unas 5,5 horas con un pico de 8,2 GB de VRAM.

## Capacidades

- Generación de texto conversacional en turco con turnos de relleno ("fillers") y marcadores `<sil>` para pausas naturales.
- *Conversational infill*: integración en tiempo de inferencia de una respuesta de conocimiento externo (`knowledge`) generada en paralelo por un modelo de fondo, mientras el modelo ya está hablando.
- Generación de respuestas finales contextualmente coherentes una vez recibido el turno de conocimiento.
- Soporte de formato de conversación con tokens especiales de turno (`<|turn>`, `<turn|>`, `<bos>`, tokens de fin 1, 106 y 50).
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque el ajuste fino se centra en texto.
- No está diseñado como modelo de chat general ni se ha ajustado explícitamente para comportamiento con barreras de seguridad.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- **Asistente de voz con dos modelos (Talker)**: el modelo actúa como la mitad local rápida que responde de inmediato con rellenos conversacionales mientras un modelo de fondo más grande razona y recupera información; al llegar el turno `knowledge`, el modelo continúa la frase de forma natural. Es su uso principal y para el que fue entrenado.
- **Atención al cliente por voz en turco**: puede gestionar el turno inicial de una conversación multi-turno y mantener la fluidez mientras se consultan sistemas externos (CRM, base de conocimiento) en paralelo, reduciendo la latencia percibida por el usuario.
- **Integración en pipelines de asistentes con latencia estricta**: al ser un modelo de 5,1 mil millones de parámetros desplegable en una GPU de consumo, encaja en arquitecturas de borde o locales donde no es viable llamar a un modelo grande para cada turno.
- **Prototipado de agentes conversacionales con conocimiento diferido**: permite experimentar con el patrón de transferencia de conocimiento en tiempo de inferencia descrito en el artículo, usando el dataset y el código de referencia publicados.
- **Generación de diálogo sintético en turco**: el modelo puede producir turnos de conversación contextualizados para aumentar datasets de entrenamiento de asistentes de voz en turco.
- **Investigación en interacción voz-LLM**: sirve como punto de partida para estudiar cómo los modelos pequeños incorporan información tardía sin romper la coherencia del discurso, comparando métricas de bits por byte entre configuraciones.
- **Despliegue en entornos con recursos limitados**: las variantes ONNX q4f16 (WebGPU) y GGUF (llama.cpp) permiten ejecución en navegador o en hardware sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). La métrica es bits por byte (bpb) de los turnos del modelo sobre conversaciones reservadas; menor es mejor.

| Split | Todos | `<sil>` / relleno | Respuesta de conocimiento |
|---|---|---|---|
| Subconjunto de validación | 0,3661 | 0,4642 | 0,3317 |
| Test | 0,3627 | 0,4676 | 0,3258 |

Comparativa declarada por el autor: `vngrs/Kumru-2B`, ajustado de la misma forma, alcanzó 0,4113 en el split de validación. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en bf16**: aproximadamente 10-11 GB solo para pesos (5,12 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica, 12-16 GB según longitud de contexto y batch.
- **GPU recomendadas**: A100, H100 o L40S para despliegue de producción con concurrencia; RTX 4090 (24 GB) para bf16 sin problemas; RTX 3090/4080 (16-24 GB) viables.
- **GPU de consumo**: sí cabe en GPUs de consumo de gama alta con 16 GB o más en bf16; en cuantización q4f16 o GGUF Q4 puede caber en GPUs de 8-12 GB.
- **Entrenamiento**: el autor reporta un pico de 8,2 GB de VRAM con QLoRA de 4 bits en una única GPU de consumo durante 5,5 horas.
- **Opciones de despliegue**: transformers (código de ejemplo en la model card), llama.cpp mediante el repositorio GGUF, ONNX Runtime WebGPU mediante el repositorio ONNX q4f16, y potencialmente vLLM/TGI si el soporte de la arquitectura Gemma 4 está disponible (no confirmado en la información proporcionada).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | bpb (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-it-ConvFill-TR | 5,12 B | no disponible | 0,3661 | Gemma | Hugging Face (safetensors, ONNX, GGUF) |
| vngrs/Kumru-2B (ajuste equivalente) | no disponible (2 B por nombre) | no disponible | 0,4113 | no disponible | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | Gemma | Hugging Face |

La comparación se limita a los datos declarados por el autor; no se dispone de resultados de benchmarks estándar para establecer comparaciones adicionales con alternativas de la misma categoría.

## Limitaciones y advertencias

- **No es un modelo de chat general**: está entrenado exclusivamente para la tarea de *conversational infill*; su uso fuera de ese patrón (sin turno `knowledge`) puede producir respuestas incompletas o poco útiles.
- **Sesgos y calidad del dato**: entrenado sobre conversaciones sintéticas traducidas automáticamente, por lo que puede reproducir artefactos de traducción y sesgos presentes en el dataset original.
- **Sin barreras de seguridad explícitas**: el autor indica que el modelo no está ajustado explícitamente para comportamiento con guardarraíles; no debe desplegarse en producción orientada a usuarios sin capas adicionales de moderación.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente al integrar el turno de conocimiento.
- **Limitación de idioma**: solo turco; el rendimiento en otros idiomas no está garantizado.
- **Longitud de contexto**: los ejemplos de entrenamiento se limitaron a 1024 tokens y los más largos se descartaron; no se documenta la ventana de contexto efectiva del modelo base.
- **Restricciones de licencia**: licencia Gemma, sujeta a los términos de Google y a la política de usos prohibidos (https://ai.google.dev/gemma/prohibited_use_policy); el uso comercial requiere cumplir dichos términos.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante ONNX (q4f16, WebGPU): https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR-ONNX
- Variante GGUF (llama.cpp): https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/atasoglu/convfill-dataset-tr-10k
- Dataset original en inglés: https://huggingface.co/datasets/zenglhardt/convfill-dataset
- Artículo (arXiv): https://arxiv.org/abs/2511.07397
- Código y modelos originales en inglés: https://github.com/vysri/conversational-infill
- Unsloth: https://github.com/unslothai/unsloth
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
