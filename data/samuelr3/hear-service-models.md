# samuelr3/hear-service-models

## Resumen

`samuelr3/hear-service-models` no es un unico modelo generativo, sino un paquete de artefactos ONNX que dan soporte a Hear Service, una aplicacion movil "voice-first" disenada para personas ciegas y con vision reducida que escuchan periodicos hablados del Reino Unido. El repositorio agrupa cinco voces de sintesis (VITS en formato Piper), un codificador de frases MiniLM cuantizado a 8 bits con dos cabezas de clasificacion logistica, y un sistema de reconocimiento de voz basado en NVIDIA Parakeet TDT-CTC 110M ajustado a habla britanica. Todo se ejecuta en el propio telefono: la app descarga los ficheros en el primer arranque, verifica su integridad contra `manifest.json` y realiza la inferencia localmente, sin enviar audio ni texto a ningun servidor.

El paquete resuelve un problema de accesibilidad y privacidad: ofrece lectura en voz alta (TTS) con acentos britanicos e irlandeses, comprension de ordenes habladas (ASR) y seleccion de respuestas aprobadas mediante clasificacion de intencion, sin depender de la nube. La relevancia actual radica en su enfoque de despliegue en dispositivo (on-device) con modelos ligeros: voces de 63,5 MB, un encoder de 22,9 MB y un ASR de unos 178 MB en total, lo que permite funcionar en hardware movil de gama media.

La licencia es mixta y especifica por componente (`mixed-see-below`), con condiciones particulares para la voz Jenny (Dioco), CC BY-SA 4.0 para Richard, David y Alan, permiso directo para Deborah, Apache 2.0 para MiniLM y CC BY 4.0 para Parakeet. El repositorio ocupa 0,5 GB y esta etiquetado para ingles (`en`), con pipeline declarado `text-to-speech`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (TTS, formato Piper) + all-MiniLM-L6-v2 con cabezas logisticas + NVIDIA Parakeet TDT-CTC 110M (ASR) |
| Parametros totales | no disponible (Parakeet: 110M; MiniLM: no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TTS en ONNX a precision completa; MiniLM en 8 bits (q8); Parakeet con pesos int8 |
| Idiomas soportados | en (ingles; acentos britanicos e irlandes) |
| Licencia | mixed-see-below (por componente: Dioco, CC BY-SA 4.0, permiso directo, Apache 2.0, CC BY 4.0) |
| Formato de pesos | ONNX (`.onnx`), JSON y TXT auxiliares |

## Arquitectura y entrenamiento

El componente TTS emplea voces VITS en formato Piper de calidad media, con salida a 22.050 Hz y exportacion ONNX a precision completa. Las entradas del grafo son `input` (ids de fonemas), `input_lengths` y `scales`, con valores de ruido 0,667, longitud 1,0 y ancho de ruido 0,8. La fonemizacion no usa eSpeak: se apoya en la lista de pronunciacion de ingles britanico propia de la app. Las cinco voces parten de la voz de dominio publico Cori (ninguna de Lessac). Jenny, Richard, David y Alan se ajustaron sobre grabaciones publicas; Deborah se entreno con grabaciones de la propia Deborah, que autorizo su uso en Hear Service.

El modulo de comprension de chat usa `all-MiniLM-L6-v2` cuantizado a 8 bits junto con dos cabezas de regresion logistica entrenadas sobre frases de Hear Service: una clasifica la intencion del oyente y otra selecciona la linea de respuesta aprobada. El modelo nunca genera texto libre. El ASR es NVIDIA Parakeet TDT-CTC 110M, ajustado sobre habla britanica y nombres de periodicos hablados, localidades y organizaciones del Reino Unido, y exportado para sherpa-onnx con pesos de 8 bits; se divide en encoder (172,4 MB), decoder (4,0 MB) y joiner (1,4 MB).

## Capacidades

- Sintesis de voz (TTS) en ingles con cinco voces: Jenny (mujer irlandesa), Richard (hombre del sur de Inglaterra), David (hombre gales), Alan (hombre escoces) y Deborah (mujer inglesa).
- Reconocimiento automatico del habla (ASR) especializado en habla britanica y en toponimos y nombres de organizaciones del Reino Unido.
- Clasificacion de intencion: identifica que desea hacer el oyente a partir de una frase.
- Seleccion de respuestas aprobadas: elige una linea predefinida entre un conjunto controlado, sin generacion libre de texto.
- Codificacion de frases para comparar peticiones y respuestas (encoder MiniLM).
- Ejecucion completamente en dispositivo, sin llamadas a servidor para voz o habla.
- Verificacion de integridad de descargas mediante `manifest.json` (tamano y SHA-256).

## Casos de uso

- Lectura de periodicos hablados para personas ciegas: la app convierte el contenido en audio con voces britanicas e irlandesas de 63,5 MB, adecuadas para sintesis local en el telefono sin coste de servidor.
- Navegacion por voz de la aplicacion: el ASR Parakeet transcribe ordenes del usuario y la cabeza de intencion las mapea a acciones concretas, permitiendo una interaccion manos libres.
- Respuestas conversacionales controladas: la cabeza de chat elige entre lineas aprobadas, lo que evita respuestas impredecibles en un publico que depende de la claridad y la seguridad de la informacion.
- Reconocimiento de nombres propios del Reino Unido: el ajuste de Parakeet sobre toponimos y nombres de publicaciones mejora la transcripcion de busquedas como "Manchester Evening News" o localidades britanicas.
- Despliegue en dispositivos de gama media: el tamano reducido (voces de 63,5 MB, ASR de ~178 MB) permite ejecutar todo el pipeline en un movil sin GPU dedicada.
- Prototipado de asistentes de accesibilidad: el paquete sirve como base para construir apps de lectura o asistencia por voz con privacidad por diseno, al no requerir backend.
- Verificacion de integridad en produccion: `manifest.json` con hashes SHA-256 permite validar cada descarga en el primer arranque, util en despliegues moviles con conectividad intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete esta pensado para ejecucion en CPU movil; el ASR Parakeet ocupa unos 178 MB en disco y las voces 63,5 MB cada una.
- GPU recomendadas: no aplica para el caso de uso previsto (inferencia en telefono). Para escritorio no se han publicado requisitos.
- Compatibilidad con GPU de consumo: no disponible; el diseno es on-device en movil, no en GPU de escritorio.
- Opciones de despliegue: sherpa-onnx (mencionado para el ASR), Piper (para las voces), ONNX Runtime. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hear-service-models (este repo) | Paquete TTS + ASR + encoder | Parakeet 110M; resto no disponible | no disponible | Mixta por componente | Hugging Face |
| Piper (voces VITS genericas) | TTS | no disponible | no aplica | MIT (proyecto Piper) | Codigo abierto |
| NVIDIA Parakeet TDT-CTC 110M | ASR | 110M | no disponible | CC BY 4.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de frases | no disponible | 256 tokens (segun model card original) | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos base citados en la model card; no se dispone de datos de rendimiento comparativo entre este paquete y alternativas equivalentes de accesibilidad.

## Limitaciones y advertencias

- Solo soporta ingles (`en`), con enfasis en acentos britanicos e irlandeses; no es util para otros idiomas sin reentrenamiento.
- El modulo de chat no genera texto libre: solo elige entre lineas aprobadas, lo que limita su uso como asistente conversacional general.
- La licencia es mixta y no uniforme: la voz Jenny exige denominarse "Jenny" y acreditarse como "Jenny (Dioco)"; Richard, David y Alan son CC BY-SA 4.0 (con obligaciones de compartir igual); Deborah tiene permiso especifico solo para Hear Service; MiniLM es Apache 2.0 y Parakeet CC BY 4.0. El uso comercial requiere revisar cada componente por separado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad del ASR o del TTS frente a alternativas.
- Riesgo de alucinacion: no aplica al modulo de chat por diseno (respuestas cerradas), pero el ASR puede transcribir incorrectamente nombres propios no vistos durante el ajuste.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan requisitos de hardware, latencia ni consumo energetico, datos relevantes para produccion en dispositivos moviles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samuelr3/hear-service-models
- Licencia de la voz Jenny (Dioco): https://github.com/dioco-group/jenny-tts-dataset
- Dataset OpenSLR 83 (Crowdsourced high-quality UK and Ireland English Dialect): https://www.openslr.org/83/
- Encoder MiniLM: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- NVIDIA Parakeet TDT-CTC 110M: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
