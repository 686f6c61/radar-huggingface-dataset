# Edge0/Audio8-TTS-Preview-0.1b

## Resumen

Audio8 TTS Preview 0.1B es un modelo de texto a voz (TTS) con clonación de voz zero-shot, desarrollado por Edge0. Su característica principal es su tamaño extremadamente compacto: el modelo generativo principal tiene aproximadamente 170 millones de parámetros, mientras que el decoder del códec neural añade unos 120 millones. El stack completo de generación de audio resulta mucho más pequeño que la mayoría de sistemas TTS multilingües modernos.

El modelo está disponible en Hugging Face con el identificador `Edge0/Audio8-TTS-Preview-0.1b`. Utiliza una arquitectura propia llamada Falcon H1, con dos ramas autoregresivas: una rama lenta que predice tokens semánticos y una rama rápida que predice los codebooks del códec condicionados al estado oculto de la rama lenta. El códec opera a 44.1 kHz con 10 codebooks de 4096 entradas, y se incluye en el propio repositorio, sin necesidad de checkpoints externos.

Soporta ocho idiomas: chino e inglés como lenguajes principales, y alemán, español, francés, italiano, japonés y coreano como lenguajes experimentales. La versión actual es una vista previa (Preview), publicada en agosto de 2026. Su relevancia radica en hacer práctico el zero-shot voice cloning en entornos con recursos limitados, incluyendo despliegue en CPU mediante cuantización INT8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1: transformador autoregresivo con ramas lenta y rápida |
| Parametros totales | 169.779.904 (aproximadamente 170M, sin incluir el decoder del códec de ~120M) |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | BF16/FP32 en PyTorch; INT8 en ONNX Runtime (via variante separada) |
| Idiomas soportados | Chino (zh), Ingles (en), Aleman (de), Espanol (es), Frances (fr), Italiano (it), Japones (ja), Coreano (ko). Chino e ingles como primarios; el resto experimental |
| Licencia | audio8-community-license-v1.0 (licencia personalizada, no OSI) |
| Formato de pesos | safetensors para el modelo principal; codec.pth para el decoder del códec |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Audio8 Falcon H1 con dos ramas autoregresivas. La rama lenta (Slow AR) tiene 24 capas, ancho 512, 8 cabezas de atención y 2 cabezas KV, y se encarga de predecir tokens semánticos. La rama rápida (Fast AR) tiene 4 capas, ancho 512, 8 cabezas y 2 cabezas KV, y predice los codebooks del códec condicionados al estado oculto de la rama lenta.

El códec integrado genera audio a 44.1 kHz, con 2048 muestras por frame de modelo (aproximadamente 21.5 frames por segundo). Utiliza 10 codebooks con 4096 entradas cada uno. El decoder del códec, de unos 120 millones de parámetros, se incluye en el archivo `codec.pth` del repositorio.

Los datos de entrenamiento, el número de tokens, la composición del dataset y las técnicas de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada. En el repositorio de GitHub se menciona un pipeline independiente de SFT para generación de voz multilingüe, pero no se detallan sus características ni parámetros.

## Capacidades

- Generación de texto a voz en ocho idiomas: chino e inglés como lenguajes primarios; alemán, español, francés, italiano, japonés y coreano como lenguajes experimentales.
- Clonación de voz zero-shot: el modelo es capaz de sintetizar voz nueva a partir de un audio de referencia y su transcripción correspondiente.
- Códec neural completo incluido: no requiere descargar checkpoints de códec adicionales.
- Integración con la librería Transformers de Hugging Face mediante código remoto (`trust_remote_code=True`).
- Despliegue en CPU con ONNX Runtime y cuantización INT8, que ofrece inferencia sin dependencias de PyTorch o Transformers tras la descarga.
- Salida en streaming PCM y soporte de registro de voz para el flujo de clonación en la variante ONNX.
- Parámetros de generación configurables: `temperature`, `top_p`, `top_k` y `do_sample`, que permiten controlar la variabilidad de la voz.
- La arquitectura de doble rama combina la predicción de tokens semánticos (rama lenta) con la síntesis acústica de alta calidad (rama rápida).

## Casos de uso

- Locución de audiobooks en chino e inglés: gracias a la clonación zero-shot, se puede clonar la voz de un narrador de referencia mediante un audio corto y generar pistas largas. El contexto de 2048 posiciones permite pasadas de audio razonables, y el modelo puede ejecutarse en hardware modesto.
- Asistentes de voz en dispositivos con CPU limitada: el stack de despliegue ONNX INT8 ocupa aproximadamente 0.4 GiB tras la carga, lo que lo hace viable en servidores sin GPU o en dispositivos embebidos que ejecuten ONNX Runtime.
- Doblaje de vídeos corporativos multilingües: el modelo permite clonar la voz de un actor o locutor en inglés y generar el mismo contenido en alemán, español, francés, italiano o japonés, incluso si la calidad en esos idiomas es experimental.
- Servicios de mensajería vocal automatizada: al soportar streaming PCM y un servicio HTTP (en la variante ONNX), puede integrarse en sistemas de IVR, notificaciones de aplicaciones o generación de mensajes personalizados.
- Prototipado rápido de productos con voz: al ser un modelo de menos de 0.2B, se carga y ejecuta rápidamente, lo que permite validar flujos de clonación de voz en una etapa temprana antes de invertir en infraestructura para modelos más grandes.
- Herramientas educativas de pronunciación: para los idiomas soportados, el modelo puede generar ejemplos hablados a partir de texto, y con la clonación de voz se pueden producir materiales consistentes con un mismo profesor o guía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MMLU, HumanEval o GSM8K, ni tampoco resultados comparativos de calidad de voz (MOS, WER, RTF). Por lo tanto, no es posible evaluar el rendimiento del modelo frente a alternativas basándose en datos proporcionados. El autor señala explícitamente que el checkpoint no pretende reclamar una calidad idéntica en todos los idiomas ni en todos los benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en BF16/FP32, el modelo principal (~170M) ocupa aproximadamente 339 MB y el decoder del códec (~120M) unos 240 MB, lo que suma alrededor de 580 MB, más activaciones y buffers. Esto indica que es viable en GPUs de bajo perfil (p.ej. 1-2 GB de VRAM). No hay datos oficiales de VRAM en la documentación.
- GPU recomendada: any GPU con al menos 1 GB de VRAM; no se requiere A100, H100 ni RTX 4090. Para despliegue en CPU es recomendable la variante ONNX INT8.
- Inferencia en CPU: la variante ONNX INT8 usa alrededor de 0.4 GiB después de la carga en una configuración Linux x86_64, sin necesidad de CUDA, PyTorch ni Transformers.
- Opciones de despliegue: transformers con `trust_remote_code=True` (GPU o CPU), ONNX Runtime mediante el modelo `Audio8/audio8-TTS-0.1B-ONNX-INT8` (CPU, con CLI, interfaz web, servicio HTTP, streaming PCM y registro de voz).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La siguiente comparativa se basa en las escalas del modelo principal reportadas en la documentación del autor. Los valores son aproximados y no representan una auditoría de parámetros ni una comparativa de rendimiento o calidad.

| Modelo | Escala del modelo principal |
|---|---|
| **Audio8 TTS Preview 0.1B** | ~0.17B |
| Audio8 TTS Preview 0.6B | ~0.6B |
| IndexTTS2.5 | ~0.8B |
| CosyVoice3 | ~1.5B |
| VoxCPM2 | ~2.3B |
| Fish S2 Pro | ~4.6B |
| Higgs Audio v2 | ~4.7B |
| MOSS-TTS | ~8.5B |

No se disponen de datos comparativos de idiomas, licencias o rendimiento para estos modelos en la información proporcionada. La ventaja principal de Audio8 0.1B es su tamaño reducido, que lo posiciona como el modelo más ligero de la lista para TTS zero-shot.

## Limitaciones y advertencias

- Los idiomas alemán, español, francés, italiano, japonés y coreano son experimentales; la calidad de síntesis en estos idiomas puede ser inferior a la de chino e inglés.
- El modelo se publica en versión Preview, por lo que la API, la arquitectura y los pesos pueden cambiar en versiones futuras.
- La licencia `audio8-community-license-v1.0` es personalizada y no es una licencia reconocida por OSI. Debe revisarse su texto completo antes de cualquier uso comercial, ya que pueden existir restricciones adicionales.
- El contexto está limitado a 2048 posiciones empaquetadas de texto/audio. Esto restringe la longitud de la entrada, lo que puede afectar a pasadas muy largas o a la clonación con muestras de referencia extensas.
- Para la clonación de voz, la transcripción del audio de referencia debe coincidir con el contenido hablado. Si la transcripción es incorrecta o incompleta, la calidad del resultado puede degradarse.
- El modelo requiere `trust_remote_code=True` en Hugging Face, lo que implica ejecutar código remoto arbitrario del autor. Esto supone un riesgo de seguridad y una dependencia de la confianza en el mantenedor del repositorio.
- No se han publicado benchmarks de calidad que validen el rendimiento frente a otras soluciones TTS, por lo que es necesario realizar evaluaciones propias antes de adoptarlo en producción.
- En la variante ONNX INT8, la cuantización puede reducir la fidelidad de la voz en comparación con los pesos originales en BF16/FP32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.1b
- Repositorio de GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo con muestras de audio 0.1B: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Variante ONNX INT8 para CPU: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Guía de ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
