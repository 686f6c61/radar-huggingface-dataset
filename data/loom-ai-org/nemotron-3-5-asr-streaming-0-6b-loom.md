# loom-ai-org/nemotron-3.5-asr-streaming-0.6b-loom

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA y redistribuido por loom-ai-org en formato GGUF para el runtime loom.cpp. Se trata de un sistema de transcripción de voz a texto de tipo streaming, disenado para procesar audio en tiempo real por fragmentos con estado de encoder cacheado, en lugar de requerir la totalidad del audio de una vez. El checkpoint cubre 40 combinaciones de idioma-localizacion en un unico fichero de pesos.

Arquitectonicamente combina un encoder FastConformer con cache (cache-aware) y un decodificador RNN-T, con prompting de identificacion de idioma. El modelo tiene 638.075.055 parametros (aproximadamente 0,6B), lo que lo situa en el rango de modelos ASR ligeros aptos para despliegue en CPU y GPU de consumo. La ventana de contexto del encoder opera en fragmentos de 320 ms con 4,5 s de contexto izquierdo.

Esta ficha describe la exportacion de loom.cpp, que empaqueta los pesos originales sin modificacion en un GGUF autodescriptivo que incluye las topologias de grafo, el tokenizer y el script driver. Es relevante para desarrolladores que necesiten transcripcion multilingue en tiempo real con un modelo compacto y un runtime portable, aunque el ecosistema loom es menos maduro que alternativas como whisper.cpp o faster-whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder cache-aware) + RNN-T (decoder) |
| Parametros totales | 638.075.055 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | fragmentos de 320 ms con 4,5 s de contexto izquierdo; sin limite de longitud de clip (posiciones calculadas) |
| Tipos de cuantizacion | no disponible (el repo contiene un unico GGUF; no se detallan variantes) |
| Idiomas soportados | 35 idiomas, 40 combinaciones idioma-localizacion (en, es, de, fr, it, ar, ja, ko, pt, ru, hi, zh, vi, he, nl, cs, da, pl, no, sv, th, tr, bg, el, et, fi, hr, hu, lt, lv, ro, sk, uk, mt, sl); 121 locales en total |
| Licencia | OpenMDW License 1.1 (heredada del modelo base) |
| Formato de pesos | GGUF (single file, autodescriptivo con driver embebido) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer, una variante de Conformer optimizada para ASR que reduce el coste computacional mediante downsampling de la secuencia de entrada. El encoder es cache-aware, lo que significa que mantiene estado entre fragmentos de audio y permite decodificacion incremental en modo streaming. El decodificador es un RNN-T (Recurrent Neural Network Transducer), que genera tokens de forma auto-regresiva condicionada por el estado del encoder y el historial de salida. El modelo incorpora ademas prompting de identificacion de idioma, de modo que la transcripcion se condiciona al locale especificado o detectado automaticamente.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El modelo base fue entrenado por NVIDIA y esta disenado especificamente para streaming en chunks de 320 ms con 4,5 s de contexto izquierdo, lo que constituye su innovacion tecnica principal: permite transcripcion de baja latencia manteniendo precision mediante el cache del encoder. La exportacion a loom.cpp preserva los pesos sin modificacion y anade un driver que implementa el modo streaming segun el ADR-109 del proyecto.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) en modo offline (clip completo en una pasada) y en modo streaming (incremental por fragmentos).
- Identificacion automatica de idioma (`auto`) o especificacion manual entre 121 locales disponibles en `model.contract["asr_languages"]`.
- Soporte de 35 idiomas y 40 combinaciones idioma-localizacion: ingles, espanol, aleman, frances, italiano, arabe, japones, coreano, portugues, ruso, hindi, chino, vietnamita, hebreo, neerlandes, checo, danes, polaco, noruego, sueco, tailandes, turco, bulgaro, griego, estonio, finlandes, croata, hungaro, lituano, leton, rumano, eslovaco, ucraniano, maltes y esloveno.
- Decodificacion en streaming con actualizaciones parciales (`update.delta`, `update.revised`) y finalizacion explicita (`finish()`).
- Deteccion de revision de texto previo cuando el modelo re-decodifica al recibir mas audio.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR puro, no un LLM generativo).
- No soporta vision ni audio generativo; solo transcripcion de audio de entrada.

## Casos de uso

- Transcripcion en tiempo real de reuniones y videoconferencias: el modo `stream()` permite empujar audio de microfono segundo a segundo y obtener texto incremental, adecuado para subtitulado en vivo con latencia de fragmento (320 ms mas contexto).
- Subtitulado automatico multilingue: con 40 combinaciones idioma-localizacion y deteccion automatica, puede generar subtitulos en directo para contenido en cualquiera de los idiomas soportados sin cambiar de checkpoint.
- Atencion al cliente con transcripcion de llamadas: el modelo procesa audio mono a 16 kHz y puede transcribir conversaciones telefonicas para su analisis posterior o para alimentar sistemas de QA, con la ventaja de no requerir GPU dedicada.
- Generacion de actas y notas de voz: para clips de audio de duracion moderada, `speech2text.infer` transcribe el clip completo en una pasada con resultados token a token identicos a `transformers`, util para post-procesado por lotes.
- Sistemas de accesibilidad para personas con discapacidad auditiva: transcripcion en vivo de conversaciones presenciales o contenido audiovisual en dispositivos de consumo, dado el reducido consumo de memoria (pico de 4,0 GB en CPU de portatil).
- Analisis de contenido audiovisual a escala: transcripcion por lotes de archivos de audio o video para indexacion, busqueda semantica o moderacion, segmentando el audio en pausas detectadas con VAD (por ejemplo `silero-vad-loom`) para respetar el crecimiento de coste con la longitud del clip.
- Asistentes de voz embebidos: al ser un modelo de 0,6B en formato GGUF con runtime portable, puede integrarse en dispositivos con recursos limitados para transcripcion local sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son mediciones de latencia en CPU de portatil con 4 hilos: 11 s de audio transcritos en 4,8 s y 120 s de audio en 82 s, con un pico de memoria de 4,0 GB. El coste computacional crece con la longitud del clip porque la atencion se calcula sobre todo el audio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el pico de memoria reportado en CPU es de 4,0 GB para clips largos, lo que sugiere un consumo moderado tambien en GPU.
- GPU recomendadas: no especificadas en la informacion; por tamano (0,6B) es compatible con GPUs de consumo como RTX 3060/4060 en adelante, aunque no se confirma soporte GPU en el runtime loom.cpp.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se detalla en la documentacion.
- Opciones de despliegue: `loom-py-rt` (PyPI, `pip install -U "loom-py-rt[hub]>=1.0.0"`) sobre el motor loom.cpp; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU de portatil con 4 hilos, 11 s de audio en 4,8 s (ratio aproximado 0,44x tiempo real) y 120 s de audio en 82 s (ratio aproximado 0,68x tiempo real); el throughput se degrada con la longitud del clip.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (loom) | 638 M | 35 (40 locales) | Si (nativo, 320 ms) | OpenMDW 1.1 | GGUF (loom.cpp) |
| Whisper large-v3 | 1,55 B | ~99 | No nativo (ventaneo) | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | ~99 | No nativo | MIT | safetensors, GGUF, etc. |
| NVIDIA Parakeet TDT 0.6B | ~600 M | 1 (ingles) | Si | CC-BY-4.0 | NeMo, safetensors |

La comparativa con Whisper y Parakeet se basa en caracteristicas publicas generales de esos modelos, no en mediciones directas frente a este checkpoint. Nemotron 3.5 ASR destaca por su soporte nativo de streaming y su cobertura multilingue amplia en un tamano compacto, mientras que Whisper ofrece mayor numero de idiomas pero sin streaming nativo, y Parakeet esta limitado al ingles. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modo `infer` procesa el clip completo en una pasada y su coste crece con la longitud del audio; la memoria crece mas rapido que el clip. Se recomienda segmentar audio largo en pausas (por ejemplo con `silero-vad-loom`).
- No hay limite de longitud de clip en este fichero (a diferencia de `transformers`, que corta a 400 s), pero el coste computacional lo hace impractical para clips muy largos sin segmentacion.
- Especificar un idioma incorrecto produce una transcripcion vacia; es peor que no especificar ninguno. El modo `auto` es el valor por defecto y suele ser mas seguro en clips cortos o ambiguos.
- El modelo inserta etiquetas de idioma como `<en-US>` tras cada frase; loom las elimina de `text`, lo que deja un doble espacio donde estaba cada etiqueta.
- No genera timestamps: `segments` devuelve un unico span que cubre todo el clip.
- Solo acepta audio mono a 16 kHz.
- No se dispone de informacion sobre sesgos conocidos ni tasas de alucinacion en la documentacion proporcionada.
- La licencia OpenMDW 1.1 es heredada del modelo base; es responsabilidad del usuario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar como MIT o Apache 2.0.
- El ecosistema loom (loom.cpp, loom-py, loom-exporter) es menos maduro y con menos adopcion que alternativas como whisper.cpp o faster-whisper; el repo registra 39 descargas y 0 likes en el momento de la consulta.
- No se detallan variantes de cuantizacion, lo que limita el control sobre el equilibrio precision/tamano en el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/nemotron-3.5-asr-streaming-0.6b-loom
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paquete PyPI loom-py-rt: https://pypi.org/project/loom-py-rt/
