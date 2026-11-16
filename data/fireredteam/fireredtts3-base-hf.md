# FireRedTeam/FireRedTTS3-Base-HF

## Resumen

FireRedTTS3-Base-HF es un punto de control (checkpoint) del sistema de síntesis de voz FireRedTTS3, publicado por el equipo FireRedTeam y empaquetado específicamente para su inferencia con SGLang Omni. El modelo resuelve el problema de la generación de voz natural a partir de texto con capacidad de clonación de voz zero-shot: basta con una única grabación de referencia y su transcripción para que el sistema reproduzca el timbre y el estilo del hablante en el audio generado. La salida es audio mono a 24 kHz, disponible como WAV o como flujo PCM en streaming a través de la API `/v1/audio/speech`.

El checkpoint contiene 2.120.632.897 parámetros (aproximadamente 2,12 mil millones) en formato safetensors, con un repositorio de 12,3 GB que incluye no solo los pesos raíz sino también los activos del tokenizador de audio (`redae/`) y el módulo `campp/`, ambos imprescindibles para la carga correcta. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos.

La relevancia de esta publicación es doble: por un lado, expone un modelo de TTS de alta calidad con clonación de voz; por otro, lo hace dentro del ecosistema SGLang Omni, un servidor de inferencia optimizado que ofrece endpoints compatibles con la API de OpenAI, streaming WebSocket y un SDK de Python para ejecución offline. Esto lo convierte en una pieza atractiva para desarrolladores que ya trabajan con infraestructura SGLang y necesitan añadir capacidades de voz sin montar un stack separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; integración con SGLang Omni) |
| Parametros totales | 2.120.632.897 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la API acepta un campo `language`, p. ej. "English", pero no se publica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,3 GB con `model.safetensors` raíz, `redae/` y `campp/`) |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, diseño del decodificador de audio) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación). La model card se centra exclusivamente en el flujo de carga y servicio con SGLang Omni, no en la descripción técnica del modelo.

Lo que sí se documenta es el pipeline de inferencia: el sistema recibe texto y una referencia de audio con su transcripción, y produce audio mono a 24 kHz. El repositorio incluye componentes auxiliares (`redae/` y `campp/`) que forman parte del pipeline de tokenización/decodificación de audio, y la carga del solo archivo `model.safetensors` raíz es insuficiente. La integración con SGLang Omni añade compilación y warmup iniciales que pueden tardar varios minutos.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio mono a 24 kHz.
- Clonación de voz zero-shot: requiere exactamente una grabación de referencia y su transcripción real.
- Salida en formato WAV y en flujo PCM crudo (24 kHz, signed 16-bit little-endian, mono) para reproducción en streaming.
- Endpoint HTTP `/v1/audio/speech` compatible con el esquema de peticiones documentado (campos `input`, `language`, `references` o `ref_audio`/`ref_text`, `seed`, `stream`, `response_format`).
- Streaming por WebSocket en `/v1/audio/speech/stream` con eventos `session.config`, `input.text`, `input.commit` e `input.done`.
- SDK de Python offline (`sglang_omni.client.Client` y `MultiProcessPipelineRunner`) para ejecutar el pipeline sin servidor HTTP.
- Control de reproducibilidad mediante el parámetro `seed`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Clonación de voz para locuciones personalizadas: a partir de una única grabación de referencia y su transcripción, el modelo genera nuevas frases con el timbre del hablante, útil para doblaje, audiolibros o contenido de marca con voz consistente.
- Asistentes de voz en tiempo real: el streaming PCM a 24 kHz y el endpoint WebSocket permiten alimentar pipelines de baja latencia donde el audio se reproduce a medida que se genera, sin esperar a la síntesis completa.
- Generación de audio para aplicaciones de accesibilidad: convertir texto de artículos, notificaciones o interfaces en voz natural, con la posibilidad de mantener una voz de referencia fija para el usuario.
- Integración en productos con API compatible OpenAI: el endpoint `/v1/audio/speech` permite sustituir proveedores de TTS en aplicaciones existentes cambiando únicamente la URL base y el nombre del modelo.
- Producción de contenido multimedia automatizada: generación por lotes de narraciones para vídeos, pódcasts o tutoriales usando el SDK offline y el parámetro `seed` para reproducibilidad entre ejecuciones.
- Prototipado e investigación en TTS: al estar bajo Apache 2.0 y con pesos safetensors, sirve como base para experimentos de clonación de voz, evaluación de naturalidad o fine-tuning sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,12 mil millones de parámetros en safetensors y un repo de 12,3 GB, se requiere una GPU NVIDIA con CUDA y memoria suficiente para cargar pesos más los activos `redae/` y `campp/`. No se documenta una cifra oficial.
- GPU recomendadas: el flujo documentado exige Linux, GPU NVIDIA con CUDA y Python 3.12, con prerrequisitos de CUDA, UCX y FlashAttention. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del repo (12,3 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se aporta dato oficial.
- Opciones de despliegue: SGLang Omni (`sgl-omni serve` con `--model-path` y `--config examples/configs/firered_tts3_base.yaml`), SDK Python offline con `MultiProcessPipelineRunner`, y API HTTP/WebSocket. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La documentación advierte que la carga inicial, compilación y warmup pueden tardar varios minutos; se recomienda esperar a que `/health` devuelva HTTP 200 antes de enviar peticiones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS con clonación de voz, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al ser un sistema de clonación de voz, existe riesgo inherente de uso indebido (suplantación, deepfakes) que debe mitigarse con controles de consentimiento y verificación.
- Riesgo de alucinación no aplica en el sentido textual, pero sí puede haber artefactos de síntesis, pronunciación incorrecta o pérdida de fidelidad en el timbre clonado; no se documentan tasas de error.
- Idiomas soportados no especificados: la API acepta un campo `language`, pero no se publica la lista oficial ni la calidad por idioma.
- La clonación exige exactamente una referencia y su transcripción real; una transcripción incorrecta o un audio de referencia ruidoso degradarán el resultado.
- La carga requiere el repositorio completo, incluidos `redae/` y `campp/`; cargar solo `model.safetensors` no es suficiente y provocará fallos.
- La integración con SGLang Omni puede requerir una revisión (PR) concreta del repositorio; versiones antiguas de PyPI o checkouts previos no incluyen el soporte de FireRedTTS3.
- Entorno de ejecución restringido: Linux, GPU NVIDIA con CUDA, Python 3.12 y dependencias UCX/FlashAttention; no se documenta soporte para CPU, macOS ni otras aceleradoras.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad legal sobre el uso de voces clonadas y el consentimiento de los hablantes originales.

## Enlaces

- [Hugging Face: FireRedTeam/FireRedTTS3-Base-HF](https://huggingface.co/FireRedTeam/FireRedTTS3-Base-HF)
- [Checkpoint temporal para pruebas de PR: CKermit/FireRedTTS3-Base](https://huggingface.co/CKermit/FireRedTTS3-Base)
- [Pesos y model card originales: FireRedTeam/FireRedTTS3](https://huggingface.co/FireRedTeam/FireRedTTS3)
- [Código fuente de FireRedTTS3](https://github.com/FireRedTeam/FireRedTTS3)
- [Repositorio SGLang Omni](https://github.com/sgl-project/sglang-omni)
- [Guía de instalación de SGLang Omni](https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md)
- [Documentación de TTS y streaming WebSocket en SGLang Omni](https://github.com/sgl-project/sglang-omni/blob/main/docs/basic_usage/tts.md#websocket-speech-streaming)
