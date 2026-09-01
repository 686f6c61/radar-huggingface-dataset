# litert-community/japanese-zipformer-base-LiteRT

## Resumen

El modelo `japanese-zipformer-base-LiteRT` es una conversión a LiteRT (el sucesor de TensorFlow Lite) del sistema de reconocimiento automático de voz (ASR) en japonés `reazon-research/japanese-zipformer-base-k2-rs35kh-bpe`, desarrollado por la comunidad `litert-community` de Google AI Edge. El modelo original, con 96,5 millones de parámetros y entrenado sobre el corpus ReazonSpeech, alcanza una tasa de error por carácter (CER) media del 11,46 %. Esta conversión ejecuta el modelo completo en la GPU mediante la API `CompiledModel` de LiteRT, eliminando cualquier cálculo de FFT en el host: la forma de onda PCM de 16 kHz entra directamente en un frontend convolucional 1D estilo wav2vec2, seguido de un encoder Zipformer con seis stacks multi-rate y una cabeza CTC, todo en un único grafo de GPU.

La relevancia de este modelo radica en su capacidad para ofrecer ASR japonés de alta calidad completamente en el dispositivo, con una latencia muy baja (RTF ≈ 0,04 en un Pixel 8a) y sin necesidad de conexión a la nube. El archivo TFLite pesa 197 MB y procesa ventanas fijas de 16 segundos de audio, lo que lo hace adecuado para aplicaciones móviles Android en tiempo real. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (6 stacks multi-rate) + frontend conv 1D estilo wav2vec2 + cabeza CTC |
| Parametros totales | 96,5 M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 segundos de audio (ventana fija, 256000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp16 (archivo `ja_zipformer_ctc_fp16.tflite`) |
| Idiomas soportados | ja (japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / LiteRT (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer, una variante eficiente de transformer introducida en el articulo arxiv:2310.11230, que emplea stacks con diferentes tasas de muestreo interno para reducir el coste computacional. En esta conversion, el frontend es una capa convolucional 1D con stride 320 (equivalente a 50 Hz de salida) que procesa directamente la forma de onda PCM, sin extraccion de caracteristicas mel/fbank. Le siguen seis stacks Zipformer2 y una capa lineal CTC con un vocabulario BPE de 3004 tokens. El modelo base fue entrenado sobre ReazonSpeech, un corpus de audio japones, y no se menciona el uso de RLHF o DPO (no aplica a tareas de ASR). La conversion desde PyTorch se realizo con `litert-torch` y es numericamente exacta (correlacion 1,000000 con el modelo original), incluyendo reescrituras como Swoosh softplus sin guard, desplazamiento relativo mediante pad+reshape+slice, y mascaras aditivas por tasa.

## Capacidades

- Reconocimiento de voz japones (ASR) a partir de audio PCM de 16 kHz, con salida de logits CTC crudos a 50 Hz.
- Decodificacion greedy CTC sin modelo de lenguaje externo, con eliminacion de blancos y repeticiones.
- Ejecucion completa en GPU mediante LiteRT `CompiledModel`, sin calculo de FFT en el host.
- Soporte de entrada con mascaras aditivas de atencion para gestionar el padding interno.
- Capacidad de procesar ventanas fijas de 16 segundos con un pad de 0,5 segundos a cada lado.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de ASR, no un LLM).
- Monolingue: exclusivamente japones.

## Casos de uso

- Transcripcion de voz en tiempo real en aplicaciones Android: el modelo puede transcribir audio de 16 segundos en 621 ms en un Pixel 8a (RTF ≈ 0,04), lo que permite dictado continuo o subtitulado en vivo sin latencia perceptible.
- Asistente de voz japones en el dispositivo: integrable en apps de productividad o domotica para reconocer comandos de voz sin enviar datos a la nube, gracias a la licencia Apache 2.0 y al tamaño compacto de 197 MB.
- Subtitulado automatico de contenido audiovisual japones: al procesar ventanas de 16 s, se puede segmentar audio largo y transcribir cada fragmento, con la opcion de anadir un LM externo para mejorar la precision de kanjis homofonos.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion local en tiempo real permite convertir conversaciones o anuncios en texto en dispositivos moviles, sin depender de conectividad.
- Analisis de reuniones o llamadas en japones: con la salida de logits CTC y timestamps (token onsets), se puede generar transcripciones con marcas temporales para busqueda o resumen posterior.
- Prototipado de ASR en investigacion: al ser una conversion exacta del modelo PyTorch, sirve como referencia para validar implementaciones en GPU movil o para experimentar con decodificacion CTC y tecnicas de post-procesado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER medio (modelo base, ReazonSpeech) | 11,46 % |
| RTF en Pixel 8a (GPU Adreno) | ≈ 0,04 (621 ms para 16 s) |
| Inferencia en Samsung Galaxy S26 (GPU Adreno) | 129,4 ms (mediana) / 126,0 ms (minimo) |
| Tiempo de carga del grafo en Galaxy S26 | 3176 ms |
| Acuerdo de argmax por frame (GPU vs referencia float) | 98,5–100 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El modelo base reporta un CER del 11,46 % en el corpus de test de ReazonSpeech, pero no se especifican conjuntos de test estandar como Common Voice o JSUT.

## Requisitos de hardware

- GPU compatible con LiteRT `CompiledModel` (Adreno en dispositivos Pixel y Galaxy, Mali en otros SoC). El modelo no esta disenado para CPU.
- Almacenamiento: 197 MB para el archivo TFLite, mas espacio para el vocabulario y codigo de decodificacion.
- VRAM: no aplica directamente, pero el grafo GPU requiere memoria de video suficiente para los tensores intermedios (entrada de 256000 floats, logits de 799×3004).
- GPU recomendadas: Adreno 740 (Pixel 8a) o superior, Adreno 830 (Galaxy S26) o equivalente. En GPU de escritorio con soporte LiteRT tambien es viable.
- Opciones de despliegue: LiteRT en Android (Kotlin/Java) mediante `CompiledModel`, o Python con `ai_edge_litert.interpreter.Interpreter`.
- Latencia: 621 ms por ventana de 16 s en Pixel 8a; 129 ms en Galaxy S26. El tiempo de compilacion del grafo es de 2,4 s en Pixel 8a y 3,2 s en Galaxy S26 (primera carga).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `japanese-zipformer-base-LiteRT` (este) | 96,5 M | 16 s fijos | Apache 2.0 | TFLite (GPU) | ASR CTC, solo japones, sin FFT |
| `reazon-research/japanese-zipformer-base-k2-rs35kh-bpe` | 96,5 M | 16 s (convencion) | Apache 2.0 | PyTorch (safetensors) | Modelo base original, CER 11,46 % |
| `sherpa-onnx-zipformer-ja-reazonspeech` (GitHub) | 159,34 M | hasta ~30 s | no disponible | ONNX | RNN-T basado en caracteres, tambien Zipformer |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. El modelo RNN-T de sherpa-onnx tiene mas parametros y soporta audio mas largo, pero no se especifican sus metricas de error.

## Limitaciones y advertencias

- Solo soporta japones; no es multilingue.
- Ventana fija de 16 segundos: audio mas largo debe segmentarse, y el pad de 0,5 s a cada lado reduce la longitud util a 15 s.
- La decodificacion greedy CTC sin LM produce errores de homofonos kanji (ej. 選挙→占拠), como se indica en la model card. Para produccion se recomienda anadir un modelo de lenguaje.
- El backend NPU (Hexagon) compila el grafo pero falla en la ejecucion (`LiteRtException: Failed to invoke the compiled model`); solo la GPU es fiable.
- No se menciona soporte para ruido, habla solapada o acentos regionales; el entrenamiento en ReazonSpeech puede no cubrir todos los dominios.
- La licencia Apache 2.0 permite uso comercial, pero el corpus ReazonSpeech puede tener restricciones adicionales; verificar los terminos del corpus antes de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/japanese-zipformer-base-LiteRT
- Modelo base (PyTorch): https://huggingface.co/reazon-research/japanese-zipformer-base-k2-rs35kh-bpe
- Repositorio de referencia con receta de entrenamiento (sherpa-onnx): https://github.com/anymorefolk87/sherpa-onnx-zipformer-ja-reazonspeech
- Pagina de modelos Zipformer (configuraciones y rendimiento): https://pkufool.github.io/zipformer/en/models/
- Paper Zipformer (arxiv:2310.11230): https://arxiv.org/abs/2310.11230
- Repositorio de ejemplos LiteRT de Google: https://github.com/google-ai-edge/litert-samples
