# SF-Foundation/Koa-Decisions-v0.2-FP8-Audio-sm

## Resumen

Koa Decisions v0.2 FP8 Audio es un checkpoint multimodal de la familia Koa, desarrollado por SF-Foundation, que acepta entradas de texto, imagen y audio (incluso imagen y voz en la misma petición) y produce como salida un código de decisión o texto, nunca audio generado. El modelo parte de dos linajes: un backbone de decisión Gemma 4 de 31B en FP8 (W8A8) procedente de `Koa-Decisions-v0.2-FP8-QAD` y un encoder de audio Ultravox/Whisper reparado proveniente de `Gemma-4-31B-Audio-NVFP4`. La arquitectura registrada es `KoaGemma4AudioVisionForConditionalGeneration`, una composición que delega el preprocesado y la codificación de imagen al encoder de visión nativo de Gemma 4 y el procesado de audio al wrapper nativo de Ultravox.

El interés técnico reside en que no se trata de un modelo entrenado de forma conjunta para imagen y audio, sino de un injerto de proyector de audio sobre un backbone de lenguaje ya afinado para toma de decisiones. Los pesos se mantienen intactos: 1.598 tensores de Koa (incluido el encoder y el proyector de visión) y 487 tensores de encoder de audio más cuatro de proyector, sin reentrenamiento ni recuantización adicionales. El checkpoint está pensado para ejecutarse con una extensión de runtime propia sobre vLLM, ya que el wrapper Ultravox estándar solo expone audio.

Con 31.963.023.212 parámetros y un repositorio de 34,7 GB, el modelo está orientado a decisiones cerradas con opciones predefinidas (selección de una opción mediante un token de código permitido), no a generación abierta. Su validación publicada son pruebas de humo sobre un único NVIDIA B300, no benchmarks de precisión amplios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `KoaGemma4AudioVisionForConditionalGeneration` (backbone Gemma 4 + encoder de visión Gemma 4 + encoder Ultravox/Whisper y proyector de audio) |
| Parámetros totales | 31.963.023.212 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en la configuración del helper de inferencia validado |
| Tipos de cuantización | Backbone W8A8 FP8 (compressed-tensors); componentes de audio en BF16; el modelo base de audio usa NVFP4 |
| Idiomas soportados | no disponible (las pruebas de audio usan seis clips en inglés de LibriSpeech) |
| Licencia | gemma |
| Formato de pesos | safetensors (8 shards, 2.089 tensores), runtime vLLM incluido |

## Arquitectura y entrenamiento

El modelo es una composición multimodal sobre un transformer de lenguaje Gemma 4 de 31B cuantizado en FP8 (W8A8) mediante compressed-tensors. Sobre ese backbone se injerta un encoder de audio Ultravox basado en Whisper, con 487 tensores de encoder reparados y cuatro tensores de proyector, mantenidos en BF16. La visión se resuelve con el encoder y el proyector nativos de Gemma 4, sin modificaciones. La extensión de runtime registra una arquitectura propia que delega el preprocesado, la codificación y la atención de visión a las clases nativas de Gemma 4, y el procesado de audio a las de Ultravox, sin parchear clases de vLLM ni alterar los pesos.

No se realizó entrenamiento adicional ni recuantización: el checkpoint es una transferencia del proyector de audio sobre un backbone de lenguaje afinado de forma distinta, no un modelo de decisión imagen/audio entrenado conjuntamente. Los checksums de los ocho shards son idénticos a la revisión de audio `5b168086f41446dda5dd9248ef009451aa120bce`; esta revisión con soporte de imagen cambia únicamente runtime, configuración, documentación y ejemplos. Se conservan el tokenizador original, la plantilla de chat y el renderizador de decisiones de Koa. El helper de inferencia usa ejecución eager, backend de atención `TRITON_ATTN`, thinking desactivado, temperatura cero, un único token de código de opción permitido y probabilidades de opción normalizadas, con una sola lectura (sin lógica de segunda lectura condicional).

## Capacidades

- Entrada de texto, imagen y audio, incluyendo imagen y voz en la misma petición.
- Toma de decisiones cerrada: selecciona una opción entre un conjunto predefinido mediante un token de código permitido y devuelve probabilidades normalizadas por opción.
- Comprensión de imagen: colores y formas, OCR de tickets, ordenación de dos imágenes y presupuesto de 560 tokens por imagen.
- Comprensión de voz: clips de habla en inglés (LibriSpeech) con selección entre opciones.
- Razonamiento multimodal combinado: responder preguntas que requieren contrastar la imagen con lo dicho en el audio.
- Modo texto como control, usando `--state` en el helper.
- Soporte de hasta dos imágenes y un audio por prompt (`limit_mm_per_prompt={"image":2,"audio":1}`).
- No genera audio; la salida es un código de decisión o texto.
- No validado: inferencia directa con Transformers, vídeo, paralelismo tensorial ni LoRA sobre las torres.

## Casos de uso

- Verificación imagen-voz en control de calidad: enviar una foto de un producto y un clip de audio del operario describiéndolo, y pedir al modelo que decida si la descripción coincide, usando las opciones "Yes"/"No" con probabilidades normalizadas.
- Clasificación de tickets o documentos con OCR: el helper valida lectura de tickets con un presupuesto de 560 tokens por imagen, útil para enrutar documentos hacia colas de procesamiento según una opción predefinida.
- Triaje de incidencias con imagen y audio combinados: un técnico envía una foto del equipo y una nota de voz; el modelo selecciona la categoría de avería entre un conjunto cerrado de opciones.
- Moderación de contenido multimodal: comprobar si el audio de una grabación describe correctamente la imagen adjunta, con decisión binaria y umbral ajustable sobre la probabilidad de la opción.
- Enrutado de decisiones en pipelines automatizados: al devolver un código de opción y probabilidades, el resultado se puede usar directamente como señal para ramificar flujos sin postprocesar texto libre.
- Asistencia a personas con discapacidad visual: dado un audio del usuario preguntando por una imagen, el modelo elige entre descripciones candidatas predefinidas.
- Evaluación comparativa de señales: las pruebas mixtas del autor cambian solo la imagen o solo el audio manteniendo pregunta y opciones, lo que sirve para auditar qué modalidad domina la decisión en un caso concreto.

## Benchmarks y rendimiento

Los datos publicados son pruebas de humo del autor sobre un único NVIDIA B300, no benchmarks de precisión amplios.

| Prueba | Resultado |
|---|---|
| Solo imagen: colores/formas, OCR de ticket, orden de dos imágenes, presupuesto de 560 tokens | 8/8 correctas |
| Imagen y audio mixtos: cuatro combinaciones imagen/voz, ambos órdenes de modalidad | 8/8 correctas |
| Solo audio: seis clips de voz, dos órdenes de opciones | 12/12 correctas |
| Controles solo texto | 8/8 correctas |
| Control de cinco segundos de silencio | Superado |
| Diferencia máxima de probabilidad de opción frente a Koa original (imagen) | 0 |
| Diferencia máxima de probabilidad frente al checkpoint de audio previo (texto y audio) | 0 y 0 |

Las pruebas usan imágenes sintéticas y seis clips limpios en inglés de LibriSpeech de un solo hablante. El autor indica explícitamente que son pruebas de humo y no benchmarks de precisión ni de preparación para producción, y que las puntuaciones de benchmark del modelo fuente no miden esta composición.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 34,7 GB en safetensors; el helper reserva un 40 % de memoria GPU en un B300, con backbone FP8 y audio en BF16.
- GPU recomendadas: NVIDIA B300 es la única plataforma validada por el autor.
- GPU de consumo: no disponible; no se documenta validación en RTX 4090 u otras GPU de consumo, y el tamaño del checkpoint hace improbable su ajuste en VRAM consumer sin cuantización adicional.
- Despliegue: vLLM 0.32.0 con el runtime incluido (`python -m pip install ./koa-audio/runtime`), PyTorch 2.13.0+cu130, Transformers 5.19.0 y compressed-tensors 0.17.0; backend de atención `TRITON_ATTN`; plugin `koa_audio_vision` registrado automáticamente (incluirlo si se filtra con `VLLM_PLUGINS`).
- Dependencias adicionales del helper: `librosa` y `soundfile`.
- Latencia y throughput: no disponibles.
- No validado: versiones alternativas de vLLM, paralelismo tensorial, inferencia directa con Transformers.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| Koa-Decisions-v0.2-FP8-Audio-sm | 31,96B | 4.096 tokens (helper) | Texto, imagen, audio | gemma | Checkpoint publicado, validación limitada |
| SF-Foundation/Koa-Decisions-v0.2-FP8-QAD | no disponible | no disponible | Texto (backbone de decisión) | gemma | Modelo base del backbone |
| SF-Foundation/Gemma-4-31B-Audio-NVFP4 | no disponible | no disponible | Audio (encoder de origen) | gemma | Modelo base del injerto de audio |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado conjuntamente para imagen y audio: el proyector de audio se transfiere sobre un backbone afinado de forma distinta, por lo que la coordinación entre modalidades no está garantizada fuera de los casos validados.
- Las pruebas de validación son de humo, con imágenes sintéticas y seis clips de un solo hablante en inglés; no miden precisión amplia ni preparación para producción.
- La transcripción abierta, el audio ruidoso o multilingüe, el razonamiento complejo sobre imágenes reales y los contextos largos requieren evaluación separada según el autor.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el formato de decisión cerrada con opciones predefinidas reduce la superficie de generación libre, pero no la elimina en el modo texto.
- Limitación de contexto: el helper validado usa 4.096 tokens; no se documenta soporte de contextos mayores en esta composición.
- Idiomas: no se declaran idiomas soportados; las pruebas de audio se limitan al inglés.
- Licencia `gemma`: sujeta a los términos de la licencia Gemma, que imponen condiciones de uso comercial y de redistribución; conviene revisarlas antes de desplegar en producción.
- Requiere instalar el runtime incluido antes de cargar la revisión; vLLM estándar no expone la ruta imagen/audio de este checkpoint.
- El repositorio figura como `private: true` en la model card, lo que puede afectar a su disponibilidad pública.
- No valida vídeo, paralelismo tensorial, LoRA sobre las torres ni inferencia directa con Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SF-Foundation/Koa-Decisions-v0.2-FP8-Audio-sm
- Backbone de decisión: https://huggingface.co/SF-Foundation/Koa-Decisions-v0.2-FP8-QAD/tree/92018dadd4a952c2cf3e9f88d112603c656d1383
- Modelo de audio de origen: https://huggingface.co/SF-Foundation/Gemma-4-31B-Audio-NVFP4/tree/198403394307d18fb7fa10a6fb6b37ed2c022e74
- Manifiesto de composición y validación: disponibles en el propio repositorio (`composition_manifest.json`, `validation/`)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
