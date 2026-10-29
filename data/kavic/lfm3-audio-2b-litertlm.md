# Kavic/LFM3-Audio-2B-litertlm

## Resumen

`Kavic/LFM3-Audio-2B-litertlm` es un repositorio de empaquetado, no un modelo entrenado desde cero: contiene dos bundles en formato `.litertlm` del modelo audio-multimodal **LiquidAI/LFM3-Audio-2B**, preparados para el runtime **Google AI Edge LiteRT-LM** y pensados para inferencia totalmente local en Android, iOS, Linux y aceleradores Edge TPU. El autor del empaquetado es el usuario Kavic, en el marco del ecosistema "Fulkrum Reports"; el modelo base lo desarrolla Liquid AI.

El paquete resuelve un problema de despliegue: el modelo original está pensado para servidores con GPUs, mientras que estos bundles incluyen todos los subgrafos que necesita el runtime multimodal (frontend de audio, embedder, prefill/decode y metadatos de ejecución) y dos niveles de cuantización, int4 (~1,07 GB) e int8 (~1,99 GB), que lo hacen viable en un teléfono móvil. La arquitectura combina un codificador de audio convolucional de 17 capas con un decodificador LFM3 de 24 capas de tipo tri-híbrido (ShortConv + atención deslizante/global con GQA).

Es relevante ahora porque permite probar un LLM de ~2B parámetros con entrada de voz directa en dispositivos sin conexión, a través de Google AI Edge Gallery o de la API Kotlin `com.google.ai.edge.litertlm`. Ahora bien, el repositorio tiene 0 descargas y 1 like, no publica benchmarks ni evaluación de calidad de transcripción, y la información disponible se limita a la model card del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador LFM3 de 24 capas tri-híbrido (ShortConv + atención deslizante/global GQA) con embeddings externalizados; codificador de audio LFM2 de 17 capas (`hidden_size=768`, `conv_L_cache=3`) + downsampler 2D de 3 etapas stride-2 + proyector MLP |
| Parametros totales | ~2B (según la denominación del modelo base; la model card no publica desglose por componente) |
| Parametros activos | No aplica: no es un modelo MoE; el decodificador es denso |
| Longitud de contexto | No disponible (la atención usa ventana deslizante y atención completa, pero no se especifica el tamaño); la guía de importación fija `maxTokens = 2048` |
| Tipos de cuantizacion | `dynamic_wi4_afp32` (pesos int4, activaciones fp32, ~1,07 GB) y `dynamic_wi8_afp32` (pesos int8, activaciones fp32, ~1,99 GB) |
| Idiomas soportados | No disponible |
| Licencia | `lfm1.0` (LFM Open License v1.0); la model card enlaza a `LICENSE` |
| Formato de pesos | `.litertlm` (LiteRT-LM, basado en TFLite); incluye `HF_Tokenizer_Zlib` con `tokenizer.json`; no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

El bundle no documenta entrenamiento propio: es una conversión y cuantización del modelo base `LiquidAI/LFM3-Audio-2B` (los metadatos de HuggingFace lo marcan como derivado tipo *finetune*, pero la model card no describe datos, número de tokens, composición del corpus ni si hubo RLHF/DPO). Lo que sí se detalla es la topología empaquetada: un subgrafo `AUDIO_FRONTEND` que convierte log-mel de 128 bins en embeddings de audio de dimensión 2048 con un downsampling temporal de 8x; un subgrafo `EMBEDDER` de un solo token (`[1,1] int32 -> [1,1,2048] float32`); y un subgrafo `PREFILL_DECODE` con el decodificador de 24 capas. Los metadatos `ExecutorMetadataProto` describen buffers de estado para 24 capas: estados convolucionales (`kv_cache_c_*`) y cachés KV de atención (`kv_cache_k_*`, `kv_cache_v_*`).

El preprocesado de audio está completamente especificado: 16.000 Hz mono, ventana Hann de 400 muestras, FFT de 400, hop de 160 (10 ms) y 128 bins mel. El downsampling temporal de 8x implica que **800 frames (8 segundos) se convierten en 100 tokens de audio**, es decir, unos 12,5 tokens por segundo de voz. El runtime se configura con `audio_enabled=True`, el token especial `<|audio|>`, un canal de razonamiento `<think>` y formato de tool calling XML; la versión de runtime indicada es `com.google.ai.edge.litertlm:litertlm:0.18.1`.

## Capacidades

- Reconocimiento automático de voz (speech-to-text) con entrada directa de audio en la misma llamada de generación (`engine.generate(prompt, audioData)`).
- Generación de texto y comprensión del audio transcrito en una sola pasada: el prompt de ejemplo pide "transcribe y resume esta grabación".
- Modo de razonamiento explícito mediante el canal `<think>`, activable o desactivable en Google AI Edge Gallery.
- Tool calling / function calling en formato XML, declarado en `LlmMetadataProto`.
- Conversación multi-turno con plantilla tipo ChatML (`<|im_start|>user ... <|im_end|>`).
- Ejecución totalmente offline en Android, iOS, Linux y Edge TPU mediante LiteRT-LM.
- Selección de backend CPU o GPU en el momento de crear el `Engine` (`ModelOptions.Backend.GPU` o `CPU`).
- No incluye visión: la guía de importación indica explícitamente `Support image: OFF`.

## Casos de uso

- **Transcripción offline de notas de voz en Android**: con `audioData` y un prompt de transcripción, el modelo convierte una grabación de 8 segundos en unos 100 tokens de audio procesables; el resultado no sale del dispositivo, lo que encaja en entornos con requisitos de privacidad o sin conectividad.
- **Dictado por voz en aplicaciones de productividad**: integrado vía la API Kotlin de LiteRT-LM, permite convertir voz en texto editable dentro de una app propia sin depender de servicios cloud ni de cuotas por petición.
- **Resumen de grabaciones cortas**: el prompt de ejemplo de la model card combina transcripción y resumen en una única generación, útil para correos de voz, mensajes largos o actas breves de reunión (con la limitación de `maxTokens = 2048`).
- **Asistente de voz con acciones**: el soporte de tool calling en XML permite mapear la petición hablada ("crea un recordatorio para mañana") a una llamada de función ejecutada por la app anfitriona.
- **Extracción estructurada de entrevistas de campo**: en inspecciones, visitas comerciales o trabajo de campo sin cobertura, el modelo puede transcribir y devolver campos concretos (nombre, incidencia, importe) usando el canal `<think>` para ordenar el razonamiento antes de responder.
- **Accesibilidad y subtitulado de clips breves**: para fragmentos de pocos segundos, la latencia de prefill se reduce al mínimo en la variante int4, lo que permite generar subtítulos en local para vídeos cortos.
- **Prototipado y demos en ferias o entornos controlados**: basta con importar el `.litertlm` en Google AI Edge Gallery para disponer de una demo funcional de ASR + LLM en un móvil, sin infraestructura de servidor.
- **Despliegue en dispositivos edge tipo kiosco o caja Linux**: el bundle está declarado para Linux y Edge TPU, lo que abre la puerta a terminales de atención al público con reconocimiento de voz local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER de transcripción, MMLU, HumanEval, GSM8K ni comparativas medidas; la única afirmación de rendimiento es cualitativa: la variante int4 ofrece "el prefill más rápido y la menor huella de memoria" frente a la int8.

## Requisitos de hardware

- **VRAM/RAM estimada (int4)**: ~1,07 GB solo de pesos; contando estados convolucionales y cachés KV de 24 capas, conviene reservar entre 2 y 3 GB libres.
- **VRAM/RAM estimada (int8)**: ~1,99 GB de pesos; estimación práctica de 3 a 4 GB libres.
- **GPU recomendadas**: no aplica el paradigma de A100/H100; el objetivo son SoCs móviles con backend GPU de LiteRT, tablets y aceleradores edge. No se documenta soporte CUDA.
- **GPU de consumo**: no se documenta ejecución en RTX 4090 u otras GPU de escritorio; el formato `.litertlm` está atado al runtime LiteRT-LM.
- **¿Cabe en consumer GPU?**: la pregunta relevante no es la GPU, sino la RAM del dispositivo; int4 está pensado para teléfonos actuales y int8 para tablets o aceleradores dedicados.
- **Opciones de despliegue**: runtime `com.google.ai.edge.litertlm:litertlm:0.18.1`, Google AI Edge Gallery (importación manual del archivo `.litertlm`), API Kotlin `Engine`/`ModelOptions` con backend CPU o GPU. No hay soporte para vLLM, TGI, llama.cpp ni Ollama al no existir pesos GGUF ni safetensors en este repositorio.
- **Latencia y throughput**: no disponibles. El autor solo indica que int4 es más rápido en prefill y consume menos memoria, sin cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada de audio | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| LFM3-Audio-2B-litertlm (este repo) | ~2B | No disponible | Sí (log-mel 16 kHz, ~12,5 tokens/s) | `.litertlm` int4 / int8 | lfm1.0 | LiteRT-LM en Android, iOS, Linux, Edge TPU |
| LiquidAI/LFM3-Audio-2B (base) | ~2B | No disponible | Sí | No disponible en esta ficha | lfm1.0 | Servidor / frameworks de inferencia estándar |
| Whisper large-v3 | ~1,55B | Ventanas de 30 s | Sí, solo ASR | safetensors y conversiones de la comunidad | MIT | faster-whisper, llama.cpp, servidores propios |
| Gemma 3n (E2B/E4B) | 5B brutos / 2B efectivos (E2B) | No disponible | Sí, además de visión | `.litertlm` | Gemma Terms of Use | LiteRT-LM y Google AI Edge Gallery |

Nota: los datos de las filas de Whisper large-v3 y Gemma 3n no proceden de la información proporcionada en esta búsqueda y deben verificarse en sus fichas oficiales antes de usarlos en una decisión técnica. La diferencia clave frente a Whisper es que este bundle es un LLM multimodal (transcribe y además razona, resume y llama herramientas), y frente a Gemma 3n, el tamaño notablemente menor (2B frente a los 5B brutos) a costa de perder visión.

## Limitaciones y advertencias

- **Licencia restrictiva para uso comercial**: la licencia es `lfm1.0` (LFM Open License v1.0), no Apache/MIT; hay que revisar el archivo `LICENSE` del repositorio base antes de integrarlo en un producto.
- **Repositorio de terceros sin validación**: 0 descargas y 1 like; el empaquetado lo firma el usuario Kavic, no Liquid AI, por lo que no hay garantía de paridad numérica con el modelo original ni de mantenimiento.
- **Sin benchmarks ni evaluación de WER**: no existe ninguna medida publicada de calidad de transcripción, y menos aún en castellano; la calidad real del ASR es desconocida.
- **Riesgo de alucinación**: al ser un LLM generativo, puede inventar contenido que no aparece en el audio, especialmente en fragmentos ruidosos, con acentos no vistos o con peticiones de resumen.
- **Idiomas no declarados**: la model card no enumera idiomas soportados; no se puede asumir buen rendimiento en castellano sin pruebas propias.
- **Contexto no especificado**: se desconoce la ventana real; la configuración recomendada limita la generación a 2048 tokens y el audio consume ~12,5 tokens por segundo, por lo que grabaciones largas agotan el contexto con rapidez.
- **Pérdida por cuantización**: ambos bundles usan cuantización dinámica de pesos con activaciones fp32; en int4 conviene validar la precisión del codificador de audio antes de producción.
- **Restricciones de entrada**: solo 16 kHz mono; hay que remuestrear cualquier audio externo. No hay soporte de imagen (`Support image: OFF`).
- **Ecosistema cerrado**: sin GGUF ni safetensors, el modelo no se puede ejecutar en llama.cpp, Ollama, vLLM o TGI, lo que limita la portabilidad y el escalado en servidor.
- **Detalle atípico a verificar**: el subgrafo `EMBEDDER` se describe como una tabla de un único token (`[1,1] int32 -> [1,1,2048]`); conviene comprobar en pruebas reales que la tokenización de texto funciona según lo esperado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kavic/LFM3-Audio-2B-litertlm
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Ecosistema Fulkrum Reports (GitHub): https://github.com/Kavics7/Fulkrum-Reports
- Runtime LiteRT-LM (dependencia): `com.google.ai.edge.litertlm:litertlm:0.18.1`
- Los resultados de búsqueda web obtenidos no contenían enlaces técnicos relevantes (contenido no relacionado con el modelo), por lo que no se aportan papers, blogs ni demos adicionales.
