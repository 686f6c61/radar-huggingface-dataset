# coder543/silero-vad-coreai

## Resumen

Silero VAD for Core AI es una conversión del detector de actividad de voz (VAD) oficial de Silero a 16 kHz para las API públicas de Apple Core AI, con soporte declarado para macOS 27 e iOS 27. No es un modelo de lenguaje ni un generativo: es un modelo recurrente pequeno cuya única tarea es emitir una probabilidad de que un fragmento de audio contenga voz. Lo publica el usuario coder543 bajo licencia MIT, reutilizando los pesos del checkpoint oficial `silero_vad.jit` de snakers4/silero-vad, no una conversión de terceros.

La relevancia de esta ficha es de despliegue: permite ejecutar VAD en el dispositivo dentro del ecosistema Apple sin depender de PyTorch, con una especialización pensada para CPU. El bundle procesa lotes de ocho tramas consecutivas de 32 ms (256 ms por lote) y mantiene el estado LSTM de 128 dimensiones y el contexto de audio de 64 muestras entre llamadas, que es lo que hace viable el procesamiento continuo en streaming.

El modelo está orientado a integración en aplicaciones: entrada `[8, 1, 1, 576]`, estados `h` y `c` de forma `[1, 128, 1, 1]`, salidas `probability`, `next_h` y `next_c`, todo en FP16. El autor publica cifras de verificación de la conversión (error medio de probabilidad de 0,00081), pero advierte explícitamente de que no son un benchmark de precisión de detección de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM recurrente (Silero VAD 16 kHz) con estado de 128 dimensiones y contexto de audio de 64 muestras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; ventana de audio de 256 ms por lote (8 tramas de 32 ms), con estado recurrente y contexto de 64 muestras persistidos entre llamadas |
| Tipos de cuantizacion | FP16 (todos los tensores del bundle) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | bundle de Core AI con tensores FP16; no incluye safetensors, GGUF ni activos compilados AOT |
| Libreria | coreai |
| Pipeline | voice-activity-detection |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-09-28 |
| Fecha de actualizacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es el Silero VAD de 16 kHz, una red recurrente con estado LSTM de 128 dimensiones que clasifica tramas de audio de 32 ms. Esta publicacion no entrena nada: es una conversión de pesos del `silero_vad.jit` oficial (revision `5cd7945676eb32225748052e2e6a0580e4686a08`) a las API Core AI, con todos los tensores en FP16. No hay por tanto RLHF, DPO ni fine-tuning; no aplica a un modelo discriminativo de este tipo.

La innovación técnica está en el empaquetado y en la gestión del estado. El bundle agrupa ocho tramas consecutivas (256 ms) en un único tensor de entrada `[8, 1, 1, 576]`, donde los 576 valores de cada trama corresponden a los 64 muestras de contexto previo más las 512 muestras actuales. Los estados `h` y `c` (`[1, 128, 1, 1]`) se devuelven como salidas y deben realimentarse en la llamada siguiente. Las reglas de uso son estrictas: empezar cada grabación con estados y contexto a cero, no reiniciar entre actualizaciones, almacenar en búfer los lotes incompletos y rellenar con ceros solo el lote final, descartando las probabilidades correspondientes al relleno. El bundle no incluye activos compilados ahead-of-time; los archivos `metadata.json` y `SHA256.json` documentan las convenciones de lote y estado y verifican la integridad de los ficheros descargables.

## Capacidades

- Detección de actividad de voz sobre audio a 16 kHz, con salida de probabilidad por trama.
- Procesamiento en streaming mediante lotes de 256 ms (8 tramas de 32 ms) con estado recurrente persistente.
- Mantenimiento del estado LSTM (`h`, `c`) y del contexto de 64 muestras entre llamadas consecutivas, lo que permite sesiones de audio largas sin reinicios.
- Ejecución en CPU mediante especialización CPU-only, sin requerir GPU.
- Salidas explícitas `probability`, `next_h` y `next_c` que exponen el estado interno al integrador.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni ningún modo especial (thinking, audio, visión) más allá del propio pipeline de VAD.
- Verificación de integridad de los ficheros de runtime mediante `SHA256.json`.

## Casos de uso

- Detección de voz en aplicaciones iOS y macOS: el modelo se integra mediante Core AI con especialización CPU-only y decide si hay voz en ventanas de 256 ms, lo que sirve para activar interfaces de voz sin enviar audio a un servidor.
- Preprocesado de pipelines de ASR: al filtrar los segmentos sin voz antes de llamar a un modelo de transcripción, se reduce el volumen de audio enviado y el coste de cómputo asociado, ya que el VAD mantiene su contexto de 64 muestras entre llamadas y no necesita recargar estado.
- Segmentación de reuniones y conversaciones: los lotes de 8 tramas de 32 ms permiten generar fronteras de habla/silencio con granularidad de 32 ms, útiles para dividir grabaciones largas en turnos antes de la diarización.
- Activación por voz (voice trigger) en dispositivos: al ejecutarse en CPU y en FP16, puede actuar como etapa de validación previa a un reconocedor de palabras clave, descartando audio que no contiene voz.
- Grabadoras y aplicaciones de notas de voz: el VAD permite iniciar y detener la captura de forma automática o marcar regiones con voz dentro de una grabación, apoyándose en el estado recurrente para no cortar entre lotes.
- Telemetría de calidad de llamadas: la probabilidad por trama se puede registrar para medir proporciones de habla, silencio y ruido en una sesión, útil en diagnósticos de VoIP o de aplicaciones de comunicación.
- Limpieza de material audiovisual: en herramientas de edición para macOS, permite detectar silencios para recorte automático, manteniendo el contexto entre tramas para evitar falsos cortes en pausas breves dentro de una frase.
- Control de flujo en asistentes de voz: usar la probabilidad como señal para abrir o cerrar el micrófono en un bucle de captura continua, aprovechando que el bundle está pensado para CPU y no compite por la GPU con otras tareas del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión de detección de voz en la informacion disponible. El autor indica explícitamente que las cifras que publica son comprobaciones de conversión, no un benchmark de exactitud. Se reproducen a continuación tal cual se documentan.

| Metrica | Valor |
|---|---|
| Especialización CPU-only en MacBook Air M3 | 0,10 s |
| Procesamiento de 688 tramas (22,0 s de audio con silencio y ruido de validación) | 0,024 s, excluyendo preparación y E/S de ficheros |
| Error medio de probabilidad frente al checkpoint FP32 JIT oficial | 0,00081 |
| Error máximo de probabilidad frente al checkpoint FP32 JIT oficial | 0,01681 |
| Decisiones que difieren con umbral 0,5 | ninguna en esta prueba |

## Requisitos de hardware

- Plataformas soportadas: macOS 27 e iOS 27, mediante las API públicas de Apple Core AI.
- Acelerador recomendado: CPU, con especialización CPU-only explícitamente indicada por el autor para este modelo recurrente pequeno.
- GPU: no se requiere ninguna; no se documenta uso de GPU ni de Neural Engine.
- Hardware medido: MacBook Air con chip M3, donde la especialización CPU-only tarda 0,10 s y el procesamiento de 688 tramas (22,0 s de audio) tarda 0,024 s, excluyendo preparación y E/S.
- VRAM estimada: no aplica, al ser una ejecución en CPU; no se dispone de cifras de memoria.
- Caber en GPU de consumo: no aplica; el destino son dispositivos Apple con Apple Silicon.
- Opciones de despliegue: Core AI en macOS 27 e iOS 27. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: los datos publicados permiten calcular un procesamiento de aproximadamente 900 veces el tiempo real en el caso medido (22,0 s de audio en 0,024 s), aunque esta relación es una derivación de las cifras del autor y no una métrica declarada por él.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el checkpoint de referencia del que procede la conversión. Para el resto de alternativas de detección de actividad de voz no se dispone de datos en la documentación proporcionada.

| Modelo | Arquitectura | Contexto / ventana | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| coder543/silero-vad-coreai | LSTM recurrente, estado de 128 dimensiones | 256 ms por lote (8 tramas de 32 ms) y contexto de 64 muestras | Bundle Core AI FP16 | MIT | 0,024 s para 688 tramas en M3 CPU-only; error medio 0,00081 frente al checkpoint FP32 |
| Silero VAD oficial (snakers4, `silero_vad.jit`) | LSTM recurrente a 16 kHz | Igual, gestionado por el runtime original | JIT / PyTorch FP32 | MIT | Referencia de comparación; error cero por definición |
| Otras alternativas de VAD (soluciones comerciales o de terceros) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de reconocimiento de voz ni de lenguaje: solo emite una probabilidad de actividad de voz y no transcribe ni entiende el contenido.
- No hay resultados publicados de precisión de detección (tasa de falsos positivos y falsos negativos, robustez a ruido, etc.). Las cifras del autor son comprobaciones de conversión y no deben usarse para dimensionar un producto.
- La conversión a FP16 introduce desviaciones medibles frente al checkpoint FP32: error medio de 0,00081 y error máximo de 0,01681 en la prueba publicada. En el caso medido ninguna decisión cambió con umbral 0,5, pero el autor no generaliza ese resultado.
- Dependencia de plataformas muy concretas: macOS 27 e iOS 27. No se documenta compatibilidad con versiones anteriores ni con otros sistemas operativos.
- La gestión del estado es manual y propensa a errores: hay que iniciar con estados y contexto a cero, no reiniciar entre actualizaciones, almacenar los lotes incompletos y rellenar con ceros solo el último lote descartando las probabilidades del relleno. Un manejo incorrecto degrada la detección.
- No se documentan idiomas soportados ni comportamiento específico por idioma en la información disponible.
- El modelo no incluye activos compilados ahead-of-time, por lo que la especialización se realiza en tiempo de uso (0,10 s medidos en M3).
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia. El repositorio incluye la licencia MIT original de Silero.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB; no hay evidencia de adopción ni de mantenimiento continuado por parte del autor.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos de voz en ruido o falsos negativos en voz débil), sin tasas publicadas para cuantificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coder543/silero-vad-coreai
- Repositorio de origen de los pesos (snakers4/silero-vad, revision `5cd7945676eb32225748052e2e6a0580e4686a08`): https://github.com/snakers4/silero-vad/tree/5cd7945676eb32225748052e2e6a0580e4686a08
- Convenciones de lote y estado del bundle: `metadata.json` (incluido en el repositorio del modelo)
- Manifiesto de integridad de los ficheros descargables: `SHA256.json` (incluido en el repositorio del modelo)
