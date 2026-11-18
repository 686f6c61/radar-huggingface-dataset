# k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24

## Resumen

sherpa-onnx-zipformer-korean-2024-06-24 es un modelo de reconocimiento automatico del habla (ASR) para coreano, publicado por el proyecto k2-fsa y distribuido en formato ONNX para su uso con la libreria sherpa-onnx. Se trata de la conversion a ONNX del modelo original johnBamma/icefall-asr-ksponspeech-zipformer-2024-06-24, entrenado con el framework icefall sobre el corpus KsponSpeech. El modelo sigue la arquitectura Zipformer, un encoder basado en transformer con conexiones de tipo U-Net entre etapas y atencion multi-cabecera con sesgo relativo, disenado para reducir coste computacional frente a Conformer manteniendo precision.

El modelo resuelve la transcripcion de voz a texto en coreano y su interes practico radica en el formato de despliegue: al estar exportado a ONNX, puede ejecutarse en CPU sin dependencias de PyTorch mediante runtime nativo en C++, Python, C#, Java, Kotlin, Swift, Go o Node.js a traves de sherpa-onnx. Esto lo hace adecuado para aplicaciones de escritorio, moviles y sistemas embebidos con requisitos de latencia baja y sin GPU.

El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0. No se dispone de informacion sobre el numero exacto de parametros, la composicion detallada del dataset ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (encoder transformer con estructura U-Net multi-etapa y atencion con sesgo relativo), modelo ASR end-to-end |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio por ventanas; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada | audio mono, tipicamente 16 kHz (formato estandar de sherpa-onnx) |
| Salida | transcripcion de texto en coreano |
| Tamano del repositorio | 0,4 GB |
| Framework de entrenamiento | icefall (k2-fsa) |
| Corpus de entrenamiento | KsponSpeech |
| Runtime recomendado | sherpa-onnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer, propuesta por el equipo de k2-fsa dentro del ecosistema icefall. Zipformer organiza el encoder en varias etapas con resoluciones temporales decrecientes, conectadas mediante una estructura tipo U-Net que reutiliza representaciones de etapas anteriores, y sustituye las capas de atencion convencionales por atencion multi-cabecera con sesgo relativo. El resultado es un encoder mas eficiente en memoria y computo que Conformer, con un rendimiento comparable o superior en tareas ASR. El sistema es end-to-end: no requiere un modelo de lenguaje externo ni un lexico de pronunciacion separado para producir la transcripcion.

El entrenamiento se realizo sobre el corpus KsponSpeech, un conjunto de habla espontanea en coreano de gran tamano ampliamente utilizado en la investigacion ASR coreana. El modelo original fue entrenado con icefall y posteriormente convertido a ONNX por el proyecto k2-fsa para su integracion en sherpa-onnx. No se dispone en la informacion proporcionada de datos concretos sobre el numero de horas de audio, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos, regularizacion o ajuste fino especificas.

## Capacidades

- Reconocimiento automatico del habla (ASR) en coreano, transcribiendo audio a texto.
- Ejecucion en CPU sin GPU, gracias al runtime ONNX de sherpa-onnx.
- Inferencia en streaming y en modo offline, segun la configuracion de sherpa-onnx (no confirmado en la informacion disponible para este modelo concreto).
- Integracion en multiples lenguajes mediante los bindings de sherpa-onnx: C++, Python, C#, Java, Kotlin, Swift, Go, Node.js, entre otros.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-linguistico de transcripcion.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento extendido.
- Capacidad multilingue limitada al coreano.

## Casos de uso

- Subtitulado automatico de video en coreano: el modelo transcribe pistas de audio a texto con baja latencia en CPU, lo que permite generar subtitulos en tiempo casi real en servidores sin GPU o en estaciones de trabajo convencionales.
- Transcripcion de reuniones y notas de voz: integrado en una aplicacion de escritorio mediante los bindings de sherpa-onnx, convierte grabaciones de habla espontanea coreana en texto editable, aprovechando que el modelo fue entrenado sobre KsponSpeech, un corpus de habla natural.
- Asistentes de voz para atencion al cliente: el modelo actua como capa ASR en un pipeline de dialogo, transcribiendo la consulta del usuario en coreano para que un modulo posterior de NLU o un LLM la procese.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en vivo de conversaciones presenciales o llamadas en coreano, ejecutandose en dispositivos moviles o embebidos gracias al formato ONNX y al bajo consumo de recursos.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de archivos de audio coreano para construir indices de texto buscables en sistemas de gestion documental o archivos de medios.
- Telefonia y centros de contacto: transcripcion de llamadas grabadas para control de calidad, analisis de sentimiento y cumplimiento normativo, desplegando el modelo en servidores CPU para reducir costes de infraestructura.
- Prototipado e investigacion en ASR coreano: al ser un modelo Apache 2.0 en ONNX, sirve como linea base reproducible para comparar sistemas ASR o para integrarse en experimentos sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso habitual, ya que el modelo esta disenado para ejecutarse en CPU mediante ONNX Runtime. En caso de usar GPU, el consumo seria reducido (el repositorio completo ocupa 0,4 GB), aunque no se dispone de cifras concretas.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podria acelerar la inferencia, pero no es el escenario de despliegue previsto.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con soporte ONNX Runtime; no obstante, su uso tipico es en CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal y recomendado), ONNX Runtime directamente, y los bindings de sherpa-onnx para C++, Python, C#, Java, Kotlin, Swift, Go y Node.js. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo Zipformer en ONNX para CPU, se espera una latencia baja en tiempo real, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| sherpa-onnx-zipformer-korean-2024-06-24 | Zipformer | Coreano | ONNX | Apache 2.0 | Modelo ASR para sherpa-onnx, entrenado sobre KsponSpeech |
| johnBamma/icefall-asr-ksponspeech-zipformer-2024-06-24 | Zipformer | Coreano | no disponible (formato icefall/PyTorch) | no disponible | Modelo original del que se convierte este; requiere icefall y PyTorch |
| Whisper (variantes multilingues de OpenAI) | Transformer encoder-decoder | Multilingue, incluye coreano | PyTorch, ONNX, GGUF | MIT | Modelo generativo multilingue; mayor coste computacional que un Zipformer dedicado |
| Modelos Zipformer de k2-fsa para otros idiomas (por ejemplo, ingles, chino) | Zipformer | Cada uno un idioma | ONNX | Apache 2.0 | Misma familia y runtime; utiles como referencia de arquitectura y despliegue |

## Limitaciones y advertencias

- El modelo solo transcribe coreano; no soporta otros idiomas ni traduccion.
- Al ser un modelo ASR puro, no genera texto libre, no razona y no admite instrucciones; cualquier uso como chatbot o agente requeriria un modelo adicional.
- Riesgo de errores de transcripcion en habla con ruido, acentos marcados, jerga o audio de baja calidad; no se dispone de tasas de error (WER/CER) publicadas en la informacion proporcionada.
- El rendimiento puede degradarse en dominios alejados de KsponSpeech (habla espontanea de conversacion), como lectura de textos tecnicos o audio telefónico de banda estrecha.
- No se dispone de informacion sobre sesgos demograficos, dialectales ni de genero en el corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del corpus KsponSpeech y del modelo original de johnBamma antes de un despliegue en produccion.
- El modelo esta pensado para sherpa-onnx; usarlo fuera de ese runtime requiere validar la compatibilidad del grafo ONNX y del preprocesado de audio.
- No se dispone de informacion sobre cuantizaciones disponibles ni sobre el impacto de estas en la precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24
- Modelo original: https://huggingface.co/johnBamma/icefall-asr-ksponspeech-zipformer-2024-06-24
- Pull request de icefall con la conversion: https://github.com/k2-fsa/icefall/pull/1664
- Repositorio icefall: https://github.com/k2-fsa/icefall
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
