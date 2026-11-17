# ai-coustics/vad-voice-focus

## Resumen

VAD Voice Focus es un modelo de detección de actividad de voz (VAD) desarrollado por ai-coustics, orientado específicamente al turn-taking del hablante principal en agentes de voz. A diferencia de un VAD genérico, el modelo decide cuándo habla el interlocutor primario directamente sobre audio de micrófono con ruido, ignorando voces competidoras y habla de fondo. Está diseñado para funcionar sin un denoiser separado, en paralelo o de forma independiente a la mejora de voz, y la propia model card lo sitúa por encima de Silero VAD en precisión, equilibrio y fiabilidad.

El modelo se distribuye a través del paquete `aic-sdk` (Python, Rust, C/C++, Node.js y WebAssembly) y no requiere GPU ni dependencia de ONNX. La inferencia opera sobre bloques de audio mono en float32 sin modificar la señal, solo analizándola, con una latencia declarada de 30 ms. La versión referenciada en los ejemplos de uso es `vad-vf-2.0-s-16khz`, lo que sugiere procesamiento a 16 kHz.

La relevancia actual del modelo reside en su encaje en stacks de agentes conversacionales en producción: permite un turn-taking robusto en entornos ruidosos sin encadenar un modelo de aislamiento de voz con un VAD multi-hablante, reduciendo la complejidad del pipeline y la latencia acumulada. La información pública disponible no detalla arquitectura interna, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio por bloques en tiempo real) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | ai-coustics-model-license (license: other) |
| Formato de pesos | no disponible; distribución vía `aic-sdk` (modelo descargado con `aic.Model.download`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de red, capas, atención, etc.) ni sobre el volumen o composición de los datos de entrenamiento. La model card únicamente describe el comportamiento funcional: detección de actividad del hablante primario sobre entrada de micrófono ruidosa, con rechazo de voces competidoras y habla de fondo.

La innovación técnica destacable, según la documentación, es la integración del foco en el hablante primario dentro del propio VAD, lo que evita el encadenamiento de un modelo de aislamiento de voz (Quail Voice Focus) con un VAD multi-hablante (VAD Multi Speaker). El modelo expone además parámetros de control de turn-taking (sensibilidad, duración mínima de habla, retención de habla) y una probabilidad VAD cruda por bloque, así como un retardo de predicción en muestras para alinear las decisiones con la línea temporal del audio.

## Capacidades

- Detección de actividad de voz del hablante principal sobre audio de micrófono con ruido.
- Rechazo de voces competidoras y habla de fondo durante el turn-taking.
- Funcionamiento sin denoiser separado; puede ejecutarse en paralelo a un procesador de mejora de voz sobre el mismo bloque original.
- Procesamiento en tiempo real por bloques de audio mono float32, sin modificar la señal.
- Parámetros ajustables de turn-taking: `Sensitivity` (umbral de probabilidad 0.0–1.0), `MinimumSpeechDuration` (segundos antes de disparar "habla") y `SpeechHoldDuration` (segundos que se mantiene el estado tras cesar el habla).
- Acceso a la probabilidad VAD cruda por bloque (`raw_vad_probability()`) y al retardo de predicción en muestras (`get_prediction_delay()`).
- Ejecución sin GPU y sin dependencia de ONNX.
- Integración con frameworks de agentes de voz como LiveKit y Pipecat.
- No se documentan capacidades multilingües, de generación de texto, código, visión ni tool calling: es un modelo puramente de clasificación de actividad de voz.

## Casos de uso

- Turn-taking en agentes de voz: el modelo decide cuándo el usuario principal está hablando para activar la captura de turno, ignorando conversaciones de fondo en entornos ruidosos como oficinas o espacios públicos.
- Atención al cliente telefónica automatizada: con 30 ms de latencia y sin GPU, puede desplegarse en servidores de bajo coste para gestionar la detección de habla en llamadas en tiempo real.
- Asistentes de voz embebidos: la disponibilidad de SDK en C/C++, Rust y WebAssembly permite integrarlo en dispositivos con recursos limitados sin acelerador hardware.
- Pipelines de transcripción en producción: al ejecutarse en paralelo a la mejora de voz sobre el bloque original, permite segmentar audio para STT sin alterar la señal que recibe el modelo de reconocimiento.
- Agentes conversacionales en LiveKit y Pipecat: los quickstarts oficiales permiten incorporar el VAD como componente de detección de turno en stacks de voice agents ya existentes.
- Filtrado de audio en herramientas de reunión o grabación: la detección del hablante primario permite descartar intervenciones de fondo antes de enviar audio a un transcriptor o a un modelo de lenguaje.
- Diagnóstico de stacks de Voice AI: combinado con Tyto (modelo de ai-coustics para predecir fallos downstream), puede usarse para monitorizar la calidad del turn-taking en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo supera a Silero VAD en precisión, equilibrio y fiabilidad, pero no proporciona cifras concretas ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no requiere GPU según la documentación.
- GPU recomendadas: no aplica; ejecución en CPU.
- Cabe en cualquier hardware con CPU que soporte el SDK (`aic-sdk` para Python, Rust, C/C++, Node.js y WebAssembly).
- Opciones de despliegue: paquete `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly); integración documentada con LiveKit y Pipecat. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 30 ms declarados por el autor. Throughput no disponible.
- Requiere una clave SDK de ai-coustics (prueba gratuita de 30 días sin tarjeta de crédito).

## Comparativa con modelos similares

| Modelo | Autor | Función | Latencia | GPU requerida | Licencia |
|---|---|---|---|---|---|
| VAD Voice Focus | ai-coustics | VAD del hablante primario para turn-taking | 30 ms | No | ai-coustics-model-license |
| VAD Multi Speaker | ai-coustics | VAD multi-hablante para audio ruidoso y lejano | no disponible | No | ai-coustics-model-license |
| Silero VAD | Silero | VAD genérico | no disponible | No | no disponible en la información proporcionada |

La comparativa se limita a los modelos citados en la model card. No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con Silero VAD ni con otros VAD del mercado.

## Limitaciones y advertencias

- La licencia `ai-coustics-model-license` es de tipo "other"; es necesario revisar los términos en https://ai-coustics.com/legal/model-license antes de cualquier uso comercial o en producción.
- El uso del modelo requiere una clave SDK de ai-coustics, lo que introduce una dependencia de servicio y de sus condiciones de acceso.
- El modelo está especializado en el hablante primario; no está pensado como VAD genérico multi-hablante (para ello ai-coustics recomienda VAD Multi Speaker).
- No se documentan idiomas soportados, sesgos conocidos ni tasas de error o alucinación (no aplica generación de texto).
- No se especifican los requisitos exactos de formato de audio más allá de bloques mono float32 y la variante a 16 kHz (`vad-vf-2.0-s-16khz`).
- La información pública no incluye detalles de arquitectura, parámetros ni dataset, lo que dificulta una evaluación técnica independiente.
- Es imprescindible alinear las predicciones con la línea temporal del audio mediante `get_prediction_delay()`; ignorarlo puede desincronizar el turn-taking en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/vad-voice-focus
- Documentación de VAD Voice Focus: https://docs.ai-coustics.com/models/voice-activity-detection/vad-voice-focus
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentación general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics-vad-only.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licencia comercial empresarial: https://ai-coustics.com/
- Modelo relacionado Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Modelo relacionado Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- Modelo relacionado Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- Modelo relacionado VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- Modelo relacionado Tyto: https://huggingface.co/ai-coustics/tyto
