# Fertroll10/cyanbridge-models

## Resumen

CyanBridge-models es un repositorio de exportaciones LiteRT (TFLite) para verificación de hablante en Android, publicado por el usuario Fertroll10. No se trata de un modelo de lenguaje generativo, sino de dos grafos de inferencia especializados en extraer embeddings de voz que permiten implementar la funcionalidad "Answer only my voice" de la aplicación CyanBridge. Cada grafo recibe 2 segundos de audio PCM mono a 16 kHz en formato float32 con rango [-1, 1] e incorpora el banco de filtros dentro del propio grafo, devolviendo un único embedding de hablante.

Los dos modelos incluidos son conversiones de arquitecturas conocidas de verificación de hablante: ECAPA-TDNN (procedente de SpeechBrain, `spkrec-ecapa-voxceleb`, 84 MB, licencia Apache-2.0) y WeSpeaker ResNet34-LM (procedente de WeSpeaker, 11,6 MB, pesos ResNet cuantizados a int8 weight-only, licencia CC BY 4.0). Ambos fueron entrenados originalmente sobre VoxCeleb por sus autores y convertidos a LiteRT con litert-torch 0.9.4.

La relevancia de este repositorio es práctica: demuestra un patrón de despliegue de verificación de hablante totalmente en el dispositivo (on-device) para Android, sin que el audio ni los embeddings abandonen el teléfono. El repositorio ocupa 0,1 GB y no presenta descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto de nicho orientado a la aplicación CyanBridge más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: ECAPA-TDNN (SpeechBrain) y ResNet34-LM (WeSpeaker); ambos con banco de filtros integrado en el grafo |
| Parametros totales | No disponible (se indica el tamano de cada fichero: 84.076.036 bytes y 11.632.752 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 2 s de audio a 16 kHz (`float32[1, 32000]`) |
| Tipos de cuantizacion | ResNet34-LM con pesos int8 (weight-only); ECAPA-TDNN sin cuantizacion indicada |
| Idiomas soportados | No disponible (modelo de hablante, independiente del idioma) |
| Licencia | Apache-2.0 (ECAPA-TDNN) y CC BY 4.0 (WeSpeaker ResNet34-LM); licencia compuesta `apache-2.0-and-cc-by-4.0` |
| Formato de pesos | TFLite (LiteRT); ficheros `ecapa_spkrec_voxceleb_2s.tflite` y `wespeaker_resnet34_lm_2s_int8w.tflite` |

## Arquitectura y entrenamiento

El primer grafo es una exportacion de ECAPA-TDNN, la arquitectura de embeddings de hablante de SpeechBrain basada en capas convolucionales con atencion estadistica y agregacion multi-capa. La conversion a LiteRT sustituyo el calculo STFT por una convolucion fija, manteniendo los pesos sin cambios. El segundo grafo es WeSpeaker ResNet34-LM, una ResNet de 34 capas con pooling estadistico para verification de hablante, exportada con el banco de filtros Kaldi integrado en el grafo y los pesos ResNet cuantizados a int8 en modo weight-only.

Ambos modelos fueron entrenados por sus autores originales sobre el corpus VoxCeleb. La model card declara explicitamente que no se utilizaron datos de usuarios de CyanBridge en el entrenamiento ni en la conversion. No se proporciona informacion sobre el numero de tokens, la composicion exacta del dataset ni sobre tecnicas de RLHF o DPO, ya que no son aplicables a modelos de verificación de hablante. La innovacion tecnica destacable es la integracion del frontend de audio (STFT o banco de filtros Kaldi) dentro del propio grafo TFLite, lo que simplifica el despliegue en Android al eliminar el preprocesado en la app.

## Capacidades

- Extraccion de embeddings de hablante a partir de 2 segundos de audio PCM mono a 16 kHz.
- Verificacion de hablante mediante comparacion por similitud coseno entre el embedding entrante y una plantilla almacenada en el dispositivo.
- Procesamiento completamente on-device: ni el audio ni los embeddings salen del telefono.
- Frontend de audio integrado en el grafo (STFT fija en ECAPA-TDNN, banco de filtros Kaldi en WeSpeaker), sin necesidad de preprocesado externo.
- Dos alternativas con distinto compromiso tamano/precision: ECAPA-TDNN (84 MB, pesos sin cuantizar) y WeSpeaker ResNet34-LM (11,6 MB, int8 weight-only).
- Orientado a integracion en aplicaciones Android mediante LiteRT/TFLite.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Desbloqueo por voz en aplicaciones Android: el grafo recibe 2 s de audio del microfono, extrae el embedding y lo compara por similitud coseno con la plantilla del usuario registrada en el dispositivo, habilitando autenticacion biometrica local sin envio de audio a servidores.
- Funcionalidad "Answer only my voice" en CyanBridge: filtrado de llamadas o respuestas entrantes para que solo se active la interaccion cuando el hablante detectado coincide con el propietario del dispositivo.
- Verificacion de hablante en dispositivos wearables o de asistencia: el modelo WeSpeaker de 11,6 MB cabe en dispositivos con recursos limitados y permite verificar al usuario antes de aceptar comandos de voz.
- Autenticacion en aplicaciones de banca o salud con requisitos de privacidad: al no salir el audio del telefono, cumple con un modelo de minimizacion de datos y reduce la superficie de exposicion en red.
- Control de acceso local en kioscos o terminales: registro de una plantilla de hablante y verificacion en cada interaccion usando el modelo ECAPA-TDNN cuando se prioriza precision sobre tamano.
- Prototipado e investigacion en verificacion de hablante embebida: los dos grafos permiten comparar en un mismo pipeline el comportamiento de una arquitectura ECAPA-TDNN frente a una ResNet34-LM cuantizada en condiciones de despliegue movil reales.
- Deteccion de suplantacion en grabaciones cortas: integrado en un pipeline que compare el embedding de un clip de 2 s con la plantilla del usuario para marcar segmentos sospechosos antes de un analisis mas profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU movil o en GPU integrada: ambos grafos estan disenados para LiteRT/TFLite en Android; el de 11,6 MB (int8) es adecuado para dispositivos de gama media y wearables.
- El grafo ECAPA-TDNN de 84 MB requiere mas memoria y es mas adecuado para telefonos de gama alta o entornos con mayor presupuesto de RAM.
- No se especifican requisitos de VRAM ni GPU de escritorio; el objetivo de despliegue es on-device, no servidor.
- Opciones de despliegue: LiteRT/TFLite en Android; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se proporcionan datos de latencia ni throughput. La ventana de entrada fija de 2 s de audio condiciona la cadencia de verificacion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Entrada | Licencia | Despliegue |
|---|---|---|---|---|---|
| CyanBridge ECAPA-TDNN (este repo) | ECAPA-TDNN exportada a TFLite | 84,1 MB | 2 s, 16 kHz mono | Apache-2.0 | LiteRT / Android |
| CyanBridge WeSpeaker ResNet34-LM (este repo) | ResNet34-LM exportada a TFLite, int8 weight-only | 11,6 MB | 2 s, 16 kHz mono | CC BY 4.0 | LiteRT / Android |
| speechbrain/spkrec-ecapa-voxceleb | ECAPA-TDNN original | No disponible | No disponible | Apache-2.0 | PyTorch / SpeechBrain |
| Wespeaker/wespeaker-voxceleb-resnet34-LM | ResNet34-LM original | No disponible | No disponible | CC BY 4.0 | PyTorch / WeSpeaker |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni agentes.
- La ventana de entrada esta fija en 2 s de audio a 16 kHz; no admite audio de duracion variable sin recorte o segmentacion previa.
- El repositorio no incluye datos de benchmarks, tasas de error (EER), ni evaluaciones de robustez ante ruido, canal o idioma.
- La verificacion depende de la calidad de la plantilla del hablante y del umbral de similitud coseno elegido; no se documentan umbrales recomendados.
- Riesgo de falsos positivos y negativos en condiciones acusticas adversas; no se proporcionan metricas para cuantificarlo.
- La licencia es compuesta: el componente ECAPA-TDNN es Apache-2.0 y el WeSpeaker ResNet34-LM es CC BY 4.0, que exige atribucion. Cualquier uso comercial debe conservar la atribucion indicada en la model card.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-19) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.
- El autor declara que no se usaron datos de usuarios de CyanBridge, pero no se detalla el proceso de conversion mas alla de la version de litert-torch (0.9.4).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Fertroll10/cyanbridge-models
- Modelo original ECAPA-TDNN: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Modelo original WeSpeaker ResNet34-LM: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet34-LM
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
