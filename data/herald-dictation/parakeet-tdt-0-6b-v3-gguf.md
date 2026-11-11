# herald-dictation/parakeet-tdt-0.6b-v3-gguf

## Resumen

Parakeet TDT 0.6B v3 (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla Parakeet TDT 0.6B v3 desarrollado por NVIDIA. La conversión la realiza el proyecto handy-computer y la redistribuye el repositorio herald-dictation para que la aplicación Herald, un sistema de dictado privado y totalmente offline, no dependa del alojamiento de un tercero. El modelo resuelve la transcripción de voz a texto multilingüe en 25 idiomas europeos con un tamaño compacto (627 millones de parámetros) y una licencia permisiva.

La arquitectura subyacente es un modelo TDT (Token-and-Duration Transducer), una variante de los transductores recurrentes que predice conjuntamente tokens y duraciones, lo que permite una decodificación no autorregresiva eficiente y con baja latencia. El contexto de audio no aplica en el sentido de los LLM: el modelo procesa fragmentos de audio y no mantiene una ventana de texto persistente.

Este artefacto concreto es relevante para desarrolladores que necesitan integrar ASR de calidad en aplicaciones de escritorio o edge sin conexión, con un único fichero Q8_0 de unos 739 MB y un runtime específico (transcribe.cpp) derivado del ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), modelo de reconocimiento del habla |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa fragmentos de audio, no contexto de texto) |
| Tipos de cuantizacion | Q8_0 en este repositorio; otras cuantizaciones en handy-computer/parakeet-tdt-0.6b-v3-gguf |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (fichero `parakeet-tdt-0.6b-v3-Q8_0.gguf`, 739.508.576 bytes) |

## Arquitectura y entrenamiento

El modelo base es Parakeet TDT 0.6B v3 de NVIDIA, un transductor Token-and-Duration (TDT). Frente a los transductores clásicos, que emiten un token por paso y dependen de un mecanismo de blank para alinear, el TDT predice simultáneamente el token y su duración, lo que reduce el número de pasos de decodificación y mejora la eficiencia y la robustez de la alineación. El modelo está diseñado para ASR multilingüe y cubre 25 idiomas europeos.

El artefacto de este repositorio es una conversión de pesos a GGUF para el runtime transcribe.cpp, realizada por handy-computer. Según la model card, el fichero es una copia byte a byte del publicado en handy-computer/parakeet-tdt-0.6b-v3-gguf (commit 85ac09e) y los pesos no se han modificado. No se dispone de información sobre la composición del dataset de entrenamiento, el número de horas de audio ni si hubo etapas de ajuste fino o RLHF; estos datos corresponden al modelo original de NVIDIA y no se detallan en la información proporcionada.

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas europeos: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco y ucraniano.
- Decodificación TDT con predicción conjunta de token y duración, orientada a baja latencia.
- Ejecución offline y privada mediante el runtime transcribe.cpp, sin dependencia de servicios en la nube.
- Formato GGUF de fichero único, adecuado para aplicaciones de escritorio y despliegues edge.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de texto).
- Soporte de agentes y razonamiento multi-step: no aplica.
- Capacidades de visión, audio generativo o thinking mode: no disponibles.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: Herald utiliza este fichero para convertir la voz del usuario en texto de forma local, con un modelo de 627 M de parámetros que cabe en memoria de sistemas convencionales y garantiza privacidad al no enviar audio a servidores externos.
- Subtitulado y transcripción de reuniones en entornos sin conectividad: el modelo procesa audio en 25 idiomas y puede integrarse en herramientas de actas o notas que funcionan completamente offline.
- Asistentes de voz para atención al cliente en kioscos o terminales: la decodificación TDT reduce la latencia, lo que permite respuestas de transcripción casi en tiempo real en hardware modesto.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva o motora en aplicaciones de escritorio, con ejecución local y sin costes por API.
- Transcripción de contenido multimedia en pipelines de edición: integración en herramientas de postproducción que necesitan generar transcripciones multilingües de forma por lotes en máquinas de trabajo.
- Investigación en ASR multilingüe: el modelo sirve como referencia compacta y de licencia permisiva para experimentos de evaluación y comparación en 25 idiomas europeos.
- Aplicaciones de notas de voz en dispositivos edge: el tamaño del fichero Q8_0 (unos 739 MB) y el runtime transcribe.cpp permiten desplegar dictado en equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero Q8_0 ocupa 739.508.576 bytes (unos 0,74 GB), por lo que la huella de memoria de los pesos es de aproximadamente 0,74 GB, más overhead del runtime y buffers de audio.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada en la información disponible; por el tamaño del modelo, es plausible que funcione en GPU consumer, pero no se aportan datos oficiales.
- Opciones de despliegue: transcribe.cpp (runtime específico indicado en la model card); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (GGUF, este repo) | 627 M | 25 europeos | GGUF (Q8_0) | cc-by-4.0 | Conversión para transcribe.cpp; copia byte a byte del original de handy-computer |
| nvidia/parakeet-tdt-0.6b-v3 | 627 M | 25 europeos | no disponible en la información | cc-by-4.0 (según modelo base) | Modelo original de NVIDIA |
| handy-computer/parakeet-tdt-0.6b-v3-gguf | 627 M | 25 europeos | GGUF (varias cuantizaciones) | cc-by-4.0 | Repositorio original de la conversión; aloja el resto de cuantizaciones |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de ASR, no un LLM: no genera texto libre, no razona ni soporta tool calling.
- No se dispone de información sobre sesgos por idioma, acento o dominio; el rendimiento puede variar entre los 25 idiomas cubiertos.
- Riesgo de errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario especializado; no se aportan métricas de WER.
- La licencia cc-by-4.0 exige atribución a NVIDIA (y, en su caso, a los autores de la conversión); es compatible con uso comercial siempre que se cumpla la atribución.
- El despliegue requiere el runtime transcribe.cpp; no se confirma compatibilidad con otros motores de inferencia GGUF.
- Este repositorio solo contiene la cuantización Q8_0; para otras cuantizaciones hay que acudir a handy-computer/parakeet-tdt-0.6b-v3-gguf.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/herald-dictation/parakeet-tdt-0.6b-v3-gguf
- Modelo base en NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio original de la conversión GGUF: https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
