# kusema/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Este repositorio aloja una copia espejo (mirror) sin modificaciones del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, convertido a formato GGUF y cuantizado a Q8_0 por el proyecto transcribe.cpp. La publicación la mantiene kusema, autor de una aplicación de dictado para Windows, con el único objetivo de garantizar que el archivo descargado coincida byte a byte con el SHA-256 esperado por su aplicación. No hay entrenamiento, ajuste ni alteración alguna por parte del publicador.

El modelo base es un sistema ASR en streaming de aproximadamente 638 millones de parámetros (637.991.968 según los pesos en safetensors), diseñado para transcripción de voz en tiempo real con latencia baja. Su relevancia radica en que permite dictado continuo y subtitulado en vivo sobre hardware modesto, y esta réplica GGUF lo hace consumible desde el ecosistema transcribe.cpp sin depender de los pesos originales en formato nativo.

Al tratarse de un espejo, la información técnica disponible en este repositorio es limitada: solo se documenta el archivo GGUF, su tamaño y su hash. Los detalles de arquitectura, datos de entrenamiento, benchmarks e idiomas deben consultarse en la página del modelo original de NVIDIA, que no forma parte de la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR en streaming; detalles en el modelo base de NVIDIA) |
| Parámetros totales | 637.991.968 (~0,64 B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (`openmdw-1.1`) |
| Formato de pesos | GGUF (`nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf`, 751.094.240 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y la tarea, se trata de un modelo de reconocimiento automático del habla orientado a streaming, es decir, capaz de emitir transcripciones de forma incremental a medida que llega el audio, en lugar de esperar a que termine la locución completa. El tamaño de 0,6 B de parámetros sugiere un diseño compacto pensado para inferencia en tiempo real y despliegue en equipos de consumo.

Respecto al entrenamiento, no se han facilitado datos sobre volumen de audio, composición del corpus, idiomas de entrenamiento ni si hubo etapas de ajuste fino supervisado o alineación. Esta réplica no aporta información adicional: el publicador indica explícitamente que no ha entrenado el modelo y remite a la página original de NVIDIA. La única transformación documentada es la conversión a GGUF y la cuantización Q8_0 realizada por el proyecto transcribe.cpp en la revisión `6d44e540bc31b0de1dbe174a3cea87f53a7f22fb` del repositorio `handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf`.

## Capacidades

- Reconocimiento automático del habla (ASR) con orientación a streaming, según la etiqueta de pipeline `automatic-speech-recognition` y el nombre del modelo base.
- Transcripción incremental de audio: el diseño "streaming" implica procesamiento por fragmentos con salida progresiva, adecuado para dictado y subtitulado en vivo.
- Ejecución mediante transcribe.cpp, runtime C++ especializado que consume el archivo GGUF.
- Cuantización Q8_0: pesos en 8 bits, lo que reduce el tamaño del archivo a ~751 MB frente a los pesos originales.
- No consta soporte de tool calling, agentes, visión, audio de entrada distinto de voz para transcripción, ni modo de razonamiento explícito.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Dictado por voz en Windows: la aplicación Kusema integra este archivo GGUF para convertir voz en texto en local, verificando el SHA-256 tras la descarga; el tamaño compacto (~751 MB) y la cuantización Q8_0 permiten ejecución en equipos sin GPU dedicada.
- Subtitulado en vivo de reuniones o clases: el modo streaming del modelo base permite emitir texto parcial mientras se habla, lo que encaja en herramientas de transcripción de videollamadas con latencia baja.
- Transcripción de notas de voz y entrevistas: el modelo puede procesar audio pregrabado por fragmentos y generar la transcripción completa, útil en aplicaciones de productividad personal.
- Accesibilidad: conversión de voz a texto para personas con dificultades motoras o auditivas, ejecutándose localmente para preservar la privacidad del audio.
- Integración en pipelines de C++: al estar en GGUF y consumirse con transcribe.cpp, puede embeberse en aplicaciones nativas de escritorio sin depender de Python ni de frameworks pesados.
- Prototipado de asistentes de voz offline: combinado con un motor de intención local, sirve como capa de entrada de voz en asistentes que no envían audio a la nube.
- Verificación de integridad en distribución de software: el repositorio sirve como fuente estable con hash conocido para que la aplicación de dictado valide la descarga, un caso de uso de cadena de suministro más que de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 751.094.240 bytes (~716 MiB); con overhead de runtime, se puede estimar un consumo en torno a 1 GB, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2 GB de VRAM libre debería poder alojar los pesos, pero no hay datos oficiales de compatibilidad.
- GPU de consumo: por el tamaño del archivo, es plausible su ejecución en GPUs de consumo e incluso en CPU, si bien no se confirma en la documentación.
- Opciones de despliegue: transcribe.cpp (runtime indicado por el autor); no consta soporte oficial de vLLM, llama.cpp, Ollama ni TGI para este archivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de ASR en streaming con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: el publicador no es NVIDIA ni está afiliado a ella; para usos distintos de la aplicación Kusema se recomienda acudir al modelo original.
- Solo se distribuye una cuantización (Q8_0); no hay variantes Q4, Q5 ni FP16 en este repositorio.
- No se documentan idiomas soportados, por lo que no puede garantizarse cobertura para castellano ni para otras lenguas sin consultar la página del modelo base.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas ASR, especialmente con audio ruidoso, acentos no representados en el entrenamiento o vocabulario técnico; no se han publicado tasas de error (WER) en esta información.
- Sesgos: no disponibles; al no conocerse la composición del corpus de entrenamiento, no puede evaluarse el sesgo por acento, género o dialecto.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con condiciones específicas; debe revisarse su texto antes de un uso comercial, ya que no equivale a Apache 2.0 ni MIT.
- El SHA-256 publicado (`b94545b313b3223fda7b2857a52681da813935c2127643d1e9ff0c23d988089c`) corresponde al archivo de este repositorio; cualquier otra copia debe verificarse por separado.
- Sin descargas ni valoraciones en el momento de la consulta, lo que limita la validación comunitaria del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kusema/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio GGUF de origen (handy-computer): https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Kusema: https://github.com/neulinc/kusema
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
