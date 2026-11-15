# Phoonnx/glowtts-en_us-ek

## Resumen

glowtts-en_us-ek es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado posteriormente por Phoonnx para su uso con su librería de inferencia ONNX. El modelo convierte texto en inglés estadounidense, representado como fonemas gruut en alfabeto IPA, en un espectrograma que después se transforma en audio mediante el vocoder hifigan-multi-vctk-small. Resuelve el problema de la síntesis de voz local y ligera, sin dependencia de servicios en la nube.

La relevancia actual del modelo es acotada: se trata de un artefacto heredado del ecosistema Larynx v1.0, orientado a asistentes de voz offline como OVOS/Mycroft, y no de un modelo de última generación. Su tamaño de repositorio es de 0,1 GB, lo que refleja un diseño compacto pensado para ejecutarse en hardware modesto. La licencia figura como "other" sin que se registre una licencia concreta, lo que constituye una advertencia importante para uso comercial.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada. El modelo está publicado en Hugging Face con 34 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en flujo) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | other (sin licencia concreta registrada) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo de texto a espectrograma basado en flujos normalizantes (normalizing flows) con alineamiento monotónico, una alternativa a los modelos autorregresivos tipo Tacotron. Genera espectrogramas mel de forma paralela, lo que reduce la latencia de síntesis, y delega la conversión a forma de onda en un vocoder neuronal separado, en este caso HiFi-GAN en su variante multi-VCTK small. El modelo original procede del proyecto Larynx de Rhasspy (versión 1.0) y ha sido empaquetado por Phoonnx para su ejecución mediante ONNX Runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La model card únicamente documenta el origen upstream y el pipeline de inferencia. La entrada de texto no es texto en bruto: requiere un front-end de fonemización (gruut) que normaliza el texto y lo convierte a fonemas IPA antes de pasarlo al modelo.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut integrado en scriptconv.
- Generación de espectrogramas mel y conversión a audio mediante el vocoder HiFi-GAN multi-VCTK small.
- Integración con el ecosistema OVOS/Mycroft a través del plugin ovos-tts-plugin-phoonnx.
- Ejecución local mediante ONNX Runtime, sin dependencia de servicios externos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS puro).
- No soporta visión, audio de entrada ni modo de razonamiento (thinking mode).
- Multilingüismo: únicamente inglés estadounidense.

## Casos de uso

- Asistentes de voz offline: el modelo se integra en OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx, permitiendo respuestas habladas en local sin enviar texto a la nube, algo adecuado para dispositivos domésticos con requisitos de privacidad.
- Lectura de notificaciones y alertas en sistemas embebidos: dado su tamaño reducido (0,1 GB de repositorio) y su ejecución vía ONNX Runtime, puede desplegarse en dispositivos de recursos limitados como Raspberry Pi para leer mensajes del sistema.
- Accesibilidad para personas con discapacidad visual: síntesis de contenido textual (artículos, correos, documentación) a voz en inglés, ejecutable en el propio equipo del usuario.
- Pruebas y prototipado de pipelines TTS: sirve como referencia funcional para validar un flujo completo de fonemización (gruut) más modelo acústico más vocoder antes de migrar a un modelo de mayor calidad.
- Generación de audio para entornos de desarrollo y CI: al ser determinista en su pipeline y ligero, puede usarse para generar muestras de audio en pruebas automatizadas de aplicaciones de voz.
- Locución de contenido en inglés en aplicaciones de escritorio: integración en herramientas que requieran lectura en voz alta de textos en inglés estadounidense sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y el uso de ONNX Runtime, se espera un consumo de memoria muy bajo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponibles; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU consumer: no documentada; por su tamaño es plausible su ejecución en CPU y en GPUs modestas, pero no se confirma en la información proporcionada.
- Opciones de despliegue: phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-ek (este modelo) | Glow-TTS + HiFi-GAN | en-US | other (sin licencia concreta) | ONNX | Hugging Face, 34 descargas |
| Otros modelos Larynx v1.0 (Rhasspy) | Glow-TTS + vocoder | varios (según voz) | según release upstream | tarball / ONNX empaquetado | GitHub releases de Rhasspy |
| Modelos Piper (sucesor de Larynx) | VITS | múltiples | MIT (según proyecto) | ONNX | Hugging Face y GitHub |

No se dispone de datos de rendimiento comparativo (métricas MOS, latencia) en la información proporcionada. La comparación se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Licencia "other" sin licencia concreta registrada: es imprescindible verificar la licencia del release upstream de Larynx antes de cualquier uso, especialmente comercial.
- Modelo heredado (Larynx v1.0): no incorpora las mejoras de calidad de voz de arquitecturas posteriores como VITS o Piper.
- Idioma único: solo inglés estadounidense; no admite otros idiomas ni cambio de acento.
- Dependencia de fonemización: la calidad de la síntesis depende del fonemizador gruut y de la correcta normalización del texto de entrada.
- Riesgo de errores de pronunciación en nombres propios, siglas, números y palabras fuera del vocabulario fonético cubierto.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene conversaciones; únicamente sintetiza voz.
- Sin datos publicados de benchmarks, latencia ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad en producción.
- Ecosistema limitado: su uso está atado a las librerías phoonnx y scriptconv, con menor comunidad que otras alternativas TTS.
- Advertencia de la propia model card: "No licence is recorded for this model. Check the upstream release before you use it."

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-ek
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_ek-glow_tts.tar.gz
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Proyecto Larynx (Rhasspy): https://github.com/rhasspy/larynx
