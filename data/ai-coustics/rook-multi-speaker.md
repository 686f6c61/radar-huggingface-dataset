# ai-coustics/rook-multi-speaker

## Resumen

Rook Multi Speaker es un modelo de mejora de voz (speech enhancement) de tipo audio-a-audio desarrollado por ai-coustics, orientado a la escucha humana en llamadas y otras aplicaciones de audio en tiempo real. No es un modelo de lenguaje: procesa audio de entrada y devuelve audio mejorado, reduciendo perceptualmente ruido, reverberación y distorsión en flujos de conferencia, telefonía y comunicaciones en tiempo real.

El modelo opera a frecuencias de muestreo de hasta 48 kHz, con una latencia de 30 ms y sin necesidad de GPU ni de dependencia de ONNX, lo que lo hace apto para despliegue en entornos de producción con requisitos estrictos de tiempo real. La inferencia se realiza a través del paquete `aic-sdk`, disponible para Python, Rust, C/C++, Node.js y WebAssembly, y requiere una clave de SDK (con prueba gratuita de 30 días).

Es relevante porque cubre un nicho concreto: la mejora perceptual de audio para personas que escuchan, no para motores de reconocimiento de voz. El propio autor desaconseja su uso en casos de Voice AI (agentes de voz, STT) y remite a la familia Quail para esos escenarios. La licencia es propietaria (`ai-coustics-model-license`), no open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio en bloques; block_size configurable via `ProcessorConfig`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de voz independiente del idioma) |
| Licencia | ai-coustics-model-license (propietaria, `license: other`) |
| Formato de pesos | artefactos descargados via `aic.Model.download("rook-ms-l-48khz", ...)`; formato de fichero no especificado |

Datos adicionales: frecuencia de muestreo de hasta 48 kHz, latencia de 30 ms, entrada mono float32 procesada por bloques, pipeline `audio-to-audio`, libreria `aic-sdk`.

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo (tipo de red, número de parámetros, capas o mecanismo de procesamiento) en la información disponible. El modelo se distribuye como artefacto binario a través del SDK propietario, no como pesos abiertos en formato safetensors o GGUF.

Tampoco se especifican los datos de entrenamiento (número de horas de audio, composición del dataset, presencia de ruido/reverberación sintética, técnicas de aumento de datos) ni si se emplearon métodos de optimización perceptual específicos. Lo único documentado es el objetivo funcional: mejora perceptual de ruido, reverberación y distorsión para escucha humana, con un parámetro ajustable en tiempo de ejecución (`EnhancementLevel`, rango 0.0–1.0) que permite modular la intensidad del procesado.

## Capacidades

- Mejora perceptual de voz para escucha humana: reducción de ruido, reverberación y distorsión.
- Procesamiento de audio en tiempo real por bloques (`processor.process(audio_block)`), seguro para uso en streaming.
- Soporte de hasta 48 kHz de frecuencia de muestreo (también 8 y 16 kHz en la familia Quail; para Rook se indica hasta 48 kHz).
- Entrada mono en float32; salida de audio mejorado del mismo tamaño de bloque.
- Ajuste dinámico de la intensidad de mejora mediante `ProcessorParameter.EnhancementLevel` (0.0–1.0).
- Configuración óptima automática mediante `aic.ProcessorConfig.optimal(model, sample_rate=...)`.
- Sin dependencia de GPU ni de ONNX; ejecución en CPU.
- SDK multiplataforma: Python, Rust, C/C++, Node.js y WebAssembly.
- Integraciones documentadas con LiveKit y Pipecat.
- No orientado a Voice AI (STT, agentes de voz); para esos casos el autor recomienda Quail Voice Focus o Quail Multi Speaker.

## Casos de uso

- Conferencias web en tiempo real: el modelo se integra en el pipeline de audio de la aplicación (por ejemplo, vía LiveKit o Pipecat) para limpiar la señal del micrófono antes de enviarla a los participantes, con 30 ms de latencia y sin GPU, lo que permite ejecutarlo en el cliente o en servidores modestos.
- Telefonía y VoIP: mejora de la calidad percibida en llamadas con ruido de fondo o reverberación, procesando bloques de audio mono a 8/16 kHz en tiempo real.
- Grabación y postproducción de reuniones: limpieza de audio grabado de múltiples hablantes para mejorar la inteligibilidad en la reproducción posterior.
- Atención al cliente por voz humana: en centros de contacto donde un agente humano escucha al cliente, Rook mejora la señal entrante sin alterar la semántica ni introducir latencia perceptible.
- Streaming y podcasting en directo: reducción de ruido ambiental y reverberación en emisiones en vivo desde ubicaciones no tratadas acústicamente.
- Dispositivos embebidos y navegador: gracias al SDK WebAssembly y a la ausencia de dependencia de GPU/ONNX, puede desplegarse en aplicaciones web o hardware con recursos limitados.
- Accesibilidad auditiva: mejora de la inteligibilidad de audio en aplicaciones de asistencia para personas con dificultades de escucha en entornos ruidosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas objetivas (PESQ, STOI, DNSMOS, etc.) ni comparativas cuantitativas de latencia o throughput más allá de la latencia declarada de 30 ms.

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU y se ejecuta en CPU.
- GPU recomendadas: no aplica (no necesita GPU).
- Compatibilidad con GPU de consumo: irrelevante; funciona sin GPU en hardware convencional.
- Latencia: 30 ms declarados por el autor.
- Throughput: no disponible.
- Opciones de despliegue: SDK propietario `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly); integraciones con LiveKit y Pipecat.
- Requisito de clave: se necesita una SDK key de ai-coustics (prueba gratuita de 30 días, sin tarjeta).
- Formatos de audio soportados: entrada mono float32 por bloques; el ejemplo de la model card usa WAV PCM 16 bits convertido a float32.

## Comparativa con modelos similares

| Modelo | Familia | Uso previsto | Frecuencia | Latencia | Licencia | GPU |
|---|---|---|---|---|---|---|
| Rook Multi Speaker | Rook | Escucha humana (conferencia, telefonía) | Hasta 48 kHz | 30 ms | Propietaria (ai-coustics-model-license) | No |
| Quail Voice Focus | Quail | Aislamiento de hablante principal para STT y agentes de voz | 16 kHz (usable en 8 kHz) | no disponible | Propietaria | No |
| Quail Multi Speaker | Quail | Denoising para STT en condiciones ruidosas y multi-hablante | 8 y 16 kHz | no disponible | Propietaria | No |

Los tres modelos son del mismo fabricante y comparten el SDK y el modelo de licencia. La diferencia clave es el caso de uso: Rook está optimizado para percepción humana a alta frecuencia de muestreo, mientras que Quail lo está para precisión de reconocimiento de voz. No se dispone de comparativas con modelos de terceros (por ejemplo, soluciones de reducción de ruido de otros proveedores) en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria (`ai-coustics-model-license`): el uso comercial está sujeto a los términos de ai-coustics; es necesario revisar el enlace de licencia antes de desplegar en producción.
- Requiere una SDK key válida para la inferencia; sin clave, el modelo no funciona. La prueba gratuita es de 30 días.
- No recomendado para Voice AI (STT, agentes de voz): el propio autor remite a la familia Quail para esos casos. Usarlo en pipelines de reconocimiento puede degradar la precisión frente a alternativas específicas.
- Entrada limitada a audio mono; no se documenta soporte estéreo o multicanal.
- El procesamiento es por bloques con un `block_size` fijado por la configuración; el ejemplo de la model card descarta el remanente final de audio que no completa un bloque.
- No se publican detalles de arquitectura, datos de entrenamiento ni benchmarks, lo que dificulta la evaluación independiente y la reproducibilidad.
- Riesgo de artefactos o sobre-suavizado de la señal al aplicar niveles altos de `EnhancementLevel`; el parámetro es ajustable, pero no se documentan sus efectos perceptuales por rango.
- Idiomas soportados no declarados; al ser un modelo de mejora de señal, el comportamiento debería ser independiente del idioma, pero no se confirma.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica (no genera contenido semántico, solo procesa señal de audio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/rook-multi-speaker
- Documentación de Rook Multi Speaker: https://docs.ai-coustics.com/models/perceptual-speech-enhancement/rook-multi-speaker
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentación general: https://docs.ai-coustics.com
- SDK de Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave SDK gratuita: https://developers.ai-coustics.com
- Artefactos y checksums: https://artifacts.ai-coustics.io
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Web de ai-coustics: https://ai-coustics.com/
- Quickstart de LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo de Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Tyto: https://huggingface.co/ai-coustics/tyto
