# Phoonnx/vits-es_mx-claude-high-espeak

## Resumen

vits-es_mx-claude-high-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx a partir de la voz original de Rhasspy publicada en el repositorio piper-voices (ruta es/es_MX/claude/high). El modelo convierte texto en espanol de Mexico en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. No es un modelo de lenguaje generativo ni un sistema multimodal: su unica funcion es la sintesis de habla a partir de texto.

El paquete esta pensado para la libreria phoonnx, una implementacion en Python y ONNX del runtime de voces Piper, y se integra tambien en el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx. Los pesos se distribuyen en formato ONNX dentro de un repositorio de aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia en CPU y dispositivos de recursos limitados. La licencia declarada es MIT, lo que facilita su uso comercial.

Su relevancia actual es practica: ofrece una voz en espanol mexicano de calidad "high" dentro del ecosistema Piper, con un pipeline de texto a fonema bien definido (espeak-ng) y opciones de despliegue tanto en servidor como en navegador mediante phoonnx.js. Al no disponer de datos publicados de benchmarks ni de parametros detallados, la ficha se limita a lo que la model card y los metadatos permiten afirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, generativa condicionada por fonemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes) |
| Idiomas soportados | es-MX (espanol de Mexico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor del empaquetado | Phoonnx |
| Autor original | Rhasspy (piper-voices) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial en un unico entrenamiento. El modelo aprende a mapear secuencias de fonemas a formas de onda, con un modulo de prediccion de duraciones que alinea fonemas y audio. En este caso, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que hace que la calidad de la sintesis dependa directamente de la fonemizacion previa.

No se dispone de informacion sobre el numero de horas de audio, la composicion del corpus ni si hubo etapas de ajuste fino o preferencia en el entrenamiento original de la voz claude/high de Piper. La model card solo indica la procedencia (rhasspy/piper-voices/es/es_MX/claude/high) y el autor original (Rhasspy). El empaquetado de Phoonnx anade la integracion con scriptconv para normalizacion de texto y fonemizacion, y con phoonnx.js para ejecucion de voces VITS en el navegador con entrada espeak o unicode.

## Capacidades

- Sintesis de voz a partir de texto en espanol de Mexico, con salida en formato WAV mediante la API de phoonnx.
- Fonemizacion mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con normalizacion de texto previa a cargo de scriptconv.
- Integracion con OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`) configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con demo en vivo.
- Inferencia en ONNX, adecuada para CPU y entornos sin GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a es-MX; no se documentan otras variantes en este paquete.

## Casos de uso

- Asistentes de voz en castellano de Mexico: integrado en OVOS mediante el plugin, el modelo puede generar respuestas habladas en un asistente domestico con contexto de conversacion gestionado por el orquestador, no por el TTS.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en sistemas de monitorizacion o domotica, donde el bajo peso del modelo (~0,1 GB) permite ejecutarlo en una Raspberry Pi o en un contenedor ligero.
- Accesibilidad: conversion de articulos, correos o documentacion a audio para usuarios con discapacidad visual, usando la normalizacion de scriptconv para expandir numeros, abreviaturas y simbolos antes de la fonemizacion.
- Audiolibros y contenido educativo: generacion por lotes de narraciones en es-MX con una voz consistente, aprovechando la licencia MIT para distribuir el audio generado.
- Prototipado de interfaces conversacionales: pruebas rapidas de UX de voz en aplicaciones web o moviles sin depender de servicios en la nube, gracias a la ejecucion local en ONNX y a la variante phoonnx.js para el navegador.
- Doblaje y previsualizacion de guiones: generacion de pistas de voz temporales para videos o presentaciones en espanol mexicano antes de contratar locucion humana.
- Sistemas embebidos y edge computing: despliegue en dispositivos con poca memoria, ya que el modelo no requiere GPU y el runtime es ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MOS, WER, MCD), latencia ni throughput, y los metadatos de Hugging Face no aportan datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS de ~0,1 GB en ONNX, es previsible que funcione en CPU sin GPU dedicada, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se documenta ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el diseno ONNX y el tamano reducido sugieren viabilidad en CPU y en GPUs de gama baja, pero es una inferencia no verificada.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Requisito adicional: espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-es_mx-claude-high-espeak | VITS | es-MX | ONNX | MIT | Empaquetado Phoonnx de la voz claude/high de Piper |
| Otras voces de rhasspy/piper-voices (es) | VITS | es / es-MX | ONNX | MIT (segun upstream) | Mismo origen; calidad y hablante variables segun la voz |
| Modelos TTS neuronales comerciales (p. ej. servicios en la nube) | variable | multiidioma | API | propietaria | Requieren conexion y coste por uso; no comparables en despliegue local |

No se dispone de datos de rendimiento de este modelo ni de las alternativas citadas en la informacion proporcionada, por lo que la comparativa se limita a arquitectura, idioma, formato y licencia. No se identifican en la informacion modelos de la misma categoria con metricas publicadas para contrastar.

## Limitaciones y advertencias

- Cobertura limitada a es-MX; no se documenta soporte para otras variantes del espanol ni para otros idiomas.
- La calidad depende de la fonemizacion: si se usa espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, como advierte la propia model card.
- No hay datos publicados sobre sesgos, alucinaciones (en el sentido de prosodia o contenido anomalo) ni evaluacion perceptual; se desconoce el comportamiento fuera del dominio de entrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier control conversacional debe implementarse en la capa superior.
- La licencia MIT se declara en la model card del upstream (rhasspy/piper-voices); conviene verificar los terminos de la voz original antes de un uso comercial a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son futuras (2026-11-16), lo que sugiere metadatos inconsistentes o un empaquetado muy reciente; no hay evidencia de uso en produccion.
- No se documentan requisitos de memoria, latencia ni limites de longitud de texto; el rendimiento en textos largos queda sin verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_mx-claude-high-espeak
- Voz original en Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX/claude/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
