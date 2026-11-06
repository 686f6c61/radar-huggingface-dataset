# SF-Foundation/Koa-Decisions-v0.2-FP8-Audio

## Resumen

Koa Decisions v0.2 FP8 Audio es un checkpoint multimodal de la familia Koa, desarrollado por SF-Foundation, que acepta entradas de texto, imagen y audio —incluyendo imagen y voz en la misma petición— y devuelve un código de decisión o texto corto, no audio generado. El modelo parte de un backbone de decisiones en FP8 (Koa-Decisions-v0.2-FP8-QAD) sobre una arquitectura Gemma 4 de 31.963.023.212 parámetros, al que se le injerta un encoder de audio Whisper reparado y un proyector de audio procedentes de Gemma-4-31B-Audio-NVFP4, siguiendo el esquema Ultravox.

La relevancia del checkpoint es fundamentalmente de ingeniería: el wrapper Ultravox estándar de vLLM solo expone audio, mientras que este repositorio registra una arquitectura propia (`KoaGemma4AudioVisionForConditionalGeneration`) que delega el preprocesado, la codificación y la atención de visión al Gemma 4 nativo, y el procesado de audio al Ultravox nativo, sin parchear clases de vLLM ni modificar los pesos. El resultado es un modelo capaz de resolver tareas de decisión cerrada (elegir entre opciones dadas) condicionadas simultáneamente por una imagen y una locución.

Es un modelo orientado a producción controlada más que a uso general: el autor lo describe explícitamente como una transferencia de proyector de audio sobre un backbone afinado distinto, no como un modelo multimodal entrenado conjuntamente, y las validaciones publicadas son smoke tests, no benchmarks de precisión. El repositorio está marcado como privado en la model card y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: backbone Gemma 4 (visión + lenguaje) con encoder de audio Whisper y proyector de audio estilo Ultravox; clase `KoaGemma4AudioVisionForConditionalGeneration` |
| Parametros totales | 31.963.023.212 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en la configuración validada del helper de inferencia |
| Tipos de cuantizacion | Backbone en W8A8 FP8 (compressed-tensors); componentes de audio en BF16; el modelo base de audio referencia NVFP4 |
| Idiomas soportados | no disponible (las pruebas de audio usan seis clips en inglés de LibriSpeech, un solo hablante) |
| Licencia | gemma |
| Formato de pesos | safetensors (8 shards, 2.089 tensores, 34,7 GB de repo); runtime vLLM empaquetado |

## Arquitectura y entrenamiento

El modelo combina tres piezas. El backbone es un Gemma 4 de aproximadamente 32.000 millones de parámetros en precisión W8A8 FP8, que conserva el encoder de visión y el proyector de visión originales de Koa (1.598 tensores con valores sin cambios). Sobre él se injerta un componente de audio procedente de Gemma-4-31B-Audio-NVFP4: 487 tensores de encoder reparados y cuatro tensores de proyector, todos en BF16 y también sin modificar. La integración sigue el patrón Ultravox (encoder Whisper más proyector hacia el espacio del modelo de lenguaje), pero con una arquitectura registrada aparte en vLLM que enruta visión y audio a sus implementaciones nativas respectivas.

No hubo entrenamiento adicional ni recuantización: el autor lo declara explícitamente. Se trata de una transferencia de proyector de audio sobre un backbone de lenguaje afinado distinto, no de un modelo imagen/audio entrenado de forma conjunta. Los ocho shards de pesos tienen checksums idénticos a la revisión de audio `5b168086f41446dda5dd9248ef009451aa120bce`; esta revisión solo cambia runtime, configuración, documentación y ejemplos. Se preservan el tokenizador original, la plantilla de chat y el renderizador de decisiones de Koa, que restringe la salida a un token de código de opción permitido y normaliza las probabilidades entre las opciones.

## Capacidades

- Decisión cerrada multimodal: selecciona una opción entre un conjunto finito de alternativas a partir de una pregunta y un contexto dado.
- Entrada de imagen: soporta una o dos imágenes por petición (el helper permite repetir `--image`), con presupuesto de 560 tokens por imagen y entradas en orientación vertical y horizontal.
- Entrada de audio: procesa voz en mono a 16 kHz mediante el encoder Whisper y el proyector transferidos.
- Entrada combinada imagen + audio en la misma petición, en ambos órdenes de modalidad, con `limit_mm_per_prompt={"image":2,"audio":1}`.
- Entrada de texto sola mediante `--state`, con el mismo renderizador de decisión.
- Salida de código de decisión o texto corto; no genera audio.
- Inferencia determinista en el helper: thinking deshabilitado, temperatura cero, un único token de opción permitido y probabilidades normalizadas.
- No incluye lógica de segunda lectura condicional; el helper realiza una sola lectura.

## Casos de uso

- Verificación de consistencia entre imagen y locución: dado un par imagen/audio y una pregunta del tipo "¿la voz describe correctamente la imagen?", el modelo devuelve sí o no. Es el caso que el propio autor valida en las pruebas mixtas.
- Triaje de tickets con OCR: el checkpoint se probó con OCR de tickets dentro de las pruebas de imagen; serviría para clasificar documentos escaneados en categorías predefinidas con opciones cerradas.
- Control de calidad en pipelines de datos multimodales: comprobar automáticamente que un audio y su imagen asociada son coherentes antes de incorporarlos a un dataset de entrenamiento.
- Enrutado de decisiones en agentes: usar el modelo como clasificador de siguiente acción entre un conjunto acotado de opciones, aprovechando la restricción a un token de código permitido y la temperatura cero para obtener salidas deterministas.
- Moderación asistida por contexto visual y sonoro: decidir entre categorías de política predefinidas a partir de una captura y un fragmento de audio, con probabilidades normalizadas para umbralizar revisiones humanas.
- Selección entre descripciones candidatas: dado un conjunto de descripciones textuales y una imagen (o imagen más voz), elegir la que mejor coincide, como en el ejemplo de inferencia con círculo rojo, cuadrado azul y triángulo verde.
- Ordenación relativa de dos imágenes: las pruebas incluyen orden de dos imágenes invertido, lo que permite usos de comparación A/B visual con respuesta categórica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente pruebas de validación funcional en una NVIDIA B300, que el propio autor califica de smoke tests y no de benchmarks de precisión o de preparación para producción:

| Prueba | Resultado |
|---|---|
| Solo imagen: colores/formas, OCR de ticket, orden de dos imágenes, presupuesto de 560 tokens | 8/8 correctas |
| Mixto imagen/audio: cuatro combinaciones imagen/voz, ambos órdenes de modalidad | 8/8 correctas |
| Solo audio: seis clips de voz, dos órdenes de opciones | 12/12 correctas |
| Controles solo texto | 8/8 correctos |
| Control de cinco segundos de silencio | Superado |

Las decisiones de imagen coinciden con el Koa original con una diferencia máxima absoluta de probabilidad de opción de 0. Las elecciones de texto y audio coinciden con el checkpoint de audio anterior, con diferencias máximas de probabilidad de 0 y 0 respectivamente. Los tests usan imágenes sintéticas y seis clips limpios en inglés de LibriSpeech de un solo hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 34,7 GB en safetensors; con backbone W8A8 FP8 y audio en BF16, la carga completa requiere del orden de 35 GB de pesos más overhead de activaciones y caché KV. El helper reserva un 40 % de memoria GPU en una B300.
- GPU recomendadas: NVIDIA B300 es la única plataforma validada por el autor. Por tamaño, cabría en A100 80 GB, H100 80 GB y GPUs profesionales con 48 GB o más, aunque estas no están validadas.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 32 GB con la configuración publicada, dado el tamaño del checkpoint.
- Opciones de despliegue: exclusivamente vLLM con el runtime empaquetado en el repositorio (validado con vLLM 0.32.0, PyTorch 2.13.0+cu130, Transformers 5.19.0 y compressed-tensors 0.17.0). El plugin se registra automáticamente vía entry point; si se filtra con `VLLM_PLUGINS`, hay que incluir `koa_audio_vision`. Se requiere backend de atención `TRITON_ATTN`.
- No validado: inferencia directa con Transformers, otras versiones de vLLM, vídeo, tensor parallelism y LoRA sobre las torres.
- Latencia y throughput: no disponibles. El helper usa ejecución eager y contexto de 4.096 tokens, lo que sugiere baja concurrencia; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koa-Decisions-v0.2-FP8-Audio | 31,96 B | 4.096 tokens (config. validada) | Texto, imagen, audio | gemma | Repo privado, 0 descargas |
| Koa-Decisions-v0.2-FP8-QAD (backbone) | ~32 B | no disponible | Texto, imagen | gemma | Referenciado como base |
| Gemma-4-31B-Audio-NVFP4 (donante de audio) | ~31 B | no disponible | Texto, audio | gemma | Referenciado como base |

No se dispone de datos de benchmarks de ninguno de los tres modelos en la información proporcionada, por lo que no es posible comparar rendimiento. La comparativa se limita a parámetros, modalidades y licencia.

## Limitaciones y advertencias

- No es un modelo multimodal entrenado conjuntamente: es un proyector de audio transferido sobre un backbone de lenguaje afinado distinto. El autor advierte que las puntuaciones de benchmark del modelo fuente no miden esta composición.
- Las validaciones son smoke tests con imágenes sintéticas y seis clips limpios en inglés de un solo hablante; no hay evaluación de precisión amplia ni de preparación para producción.
- Transcripción abierta, audio ruidoso o multilingüe, razonamiento visual complejo del mundo real y contextos más largos requieren evaluación separada según el autor.
- Contexto limitado a 4.096 tokens en la configuración validada, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no declarados; la única evidencia empírica es inglés.
- Salida restringida a un token de código de opción: no es adecuado para generación abierta de texto largo.
- Sin lógica de segunda lectura condicional en el helper incluido.
- Licencia Gemma: implica las restricciones de uso de la Gemma Terms of Use, que deben revisarse antes de cualquier uso comercial.
- El repositorio figura como privado en la model card y con 0 descargas, lo que puede afectar a la disponibilidad y al soporte a terceros.
- Dependencia estricta del runtime empaquetado y de versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; cualquier desviación queda fuera de lo validado.
- Riesgo de alucinación no cuantificado: al forzar una elección entre opciones, el modelo siempre devolverá una, aunque ninguna sea correcta; conviene umbralar sobre las probabilidades normalizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SF-Foundation/Koa-Decisions-v0.2-FP8-Audio
- Backbone: https://huggingface.co/SF-Foundation/Koa-Decisions-v0.2-FP8-QAD/tree/92018dadd4a952c2cf3e9f88d112603c656d1383
- Modelo donante de audio: https://huggingface.co/SF-Foundation/Gemma-4-31B-Audio-NVFP4/tree/198403394307d18fb7fa10a6fb6b37ed2c022e74
- Manifiesto de composición: `composition_manifest.json` dentro del repositorio
- Scripts y fixtures de validación: carpeta `validation/` del repositorio (`validation/audio.json`, `validation/baseline.json`, `validation/regression.json`, `validation/multimodal.json`)
- Helper de inferencia: `serving/infer_multimodal.py` dentro del repositorio
