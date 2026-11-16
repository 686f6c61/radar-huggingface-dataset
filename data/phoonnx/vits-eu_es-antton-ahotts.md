# Phoonnx/vits-eu_es-antton-ahotts

## Resumen

`vits-eu_es-antton-ahotts` es un modelo de síntesis de voz (text-to-speech) en euskera (variante `eu-ES`) desarrollado originalmente por el centro HiTZ y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo subyacente es [HiTZ/TTS-eu_antton](https://huggingface.co/HiTZ/TTS-eu_antton), un sistema VITS entrenado para la voz "Antton" en euskera. Phoonnx se limita a convertirlo a ONNX y a integrarlo en su ecosistema de TTS, que incluye el front-end de texto `scriptconv` y el plugin para OVOS.

La relevancia de este modelo reside en su nicho: el euskera es un idioma con recursos limitados en TTS de código abierto, y este paquete ofrece una vía de despliegue lista para producción (ONNX, licencia Apache 2.0, integración con asistentes OVOS) sin necesidad de infraestructura de entrenamiento. El repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia en CPU o GPU modesta.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la información proporcionada; la model card se centra en el uso y el empaquetado, no en los detalles arquitectónicos del entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | euskera (`eu`, variante `eu-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |
| Entrada de texto | fonemas ahotts (alfabeto IPA) vía `AhoTTSPhonemizer` de `scriptconv` |
| Autor original | HiTZ Center |
| Empaquetador | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de TTS end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS es conocido por generar audio de forma directa (sin vocoder separado) y por su calidad natural en voces monohablantes. En este caso, el modelo se distribuye ya entrenado y convertido a ONNX; no se incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS).

La innovación técnica relevante aquí no está en la arquitectura (VITS es un estándar consolidado desde 2021) sino en el empaquetado: Phoonnx convierte el modelo a ONNX para inferencia portable y lo integra con `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `AhoTTSPhonemizer`. Esto permite usar el modelo sin depender del framework original de HiTZ y facilita el despliegue en entornos Python y en el asistente de voz OVOS.

## Capacidades

- Síntesis de voz (text-to-speech) monohablante en euskera (`eu-ES`) con la voz "Antton".
- Generación de audio WAV a partir de texto en euskera, mediante la API `voice.synthesize_wav()` de `phoonnx`.
- Front-end de texto integrado: normalización y conversión a fonemas IPA con `AhoTTSPhonemizer` (extra `scriptconv[eu]`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es exclusivamente un modelo TTS.
- No es multilingüe: solo euskera.

## Casos de uso

- Asistentes de voz en euskera: integración en OVOS como módulo TTS para respuestas habladas en euskera, seleccionando la voz `hitz/eu_antton-vits` en la configuración del asistente.
- Lectura de contenido en euskera: convertir artículos, noticias o documentación a audio para accesibilidad o consumo pasivo, usando la API de `phoonnx` en un script Python.
- Sistemas de anuncios y avisos automatizados: generación de locuciones para transporte público, aeropuertos o comercios en comunidades vascoparlantes, donde el euskera es requisito legal o de servicio.
- Prototipado de aplicaciones de accesibilidad: lectura de pantalla o conversión de texto a voz para usuarios con discapacidad visual en euskera, aprovechando el formato ONNX para despliegue en dispositivos modestos.
- Investigación en TTS para lenguas de bajos recursos: uso como baseline o componente en experimentos de síntesis, evaluación o adaptación de voz en euskera, dado que es de código abierto y licencia permisiva.
- Integración en pipelines de generación de contenido multimedia: producción de pistas de voz para vídeos, pódcast o audiolibros en euskera dentro de flujos automatizados, llamando al modelo desde Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio es de 0,1 GB, lo que sugiere que el modelo es compacto y probablemente puede ejecutarse en CPU sin GPU dedicada, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del repo, es plausible que funcione en GPU consumer (RTX 3060, RTX 4090) e incluso en CPU, pero no hay datos oficiales.
- ¿Cabe en consumer GPU? Probablemente sí, dado el tamaño del repositorio (0,1 GB), aunque no se especifica.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Licencia | Formato | Parametros | Contexto |
|---|---|---|---|---|---|---|
| vits-eu_es-antton-ahotts (este) | euskera (eu-ES) | VITS | Apache 2.0 | ONNX | no disponible | no aplica |
| HiTZ/TTS-eu_antton (upstream) | euskera (eu-ES) | VITS | Apache 2.0 | no disponible | no disponible | no aplica |
| Otros VITS de la colección Phoonnx | varios | VITS | según modelo | ONNX | no disponible | no aplica |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos de TTS en euskera con especificaciones públicas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monohablante y monolingüe: solo sintetiza euskera (`eu-ES`); no admite otros idiomas ni cambio de voz.
- Dependencia del front-end `scriptconv[eu]` y del fonemizador `AhoTTSPhonemizer`: sin él, la entrada de texto no se convierte correctamente a fonemas IPA.
- No se dispone de información sobre sesgos de voz, calidad en dominios específicos (números, siglas, nombres propios) ni robustez ante texto ruidoso.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede haber errores de pronunciación o prosodia en palabras fuera del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor del empaquetado (Phoonnx) remite a la licencia del upstream (HiTZ); conviene verificar la model card original antes de un despliegue comercial.
- El modelo está empaquetado para `phoonnx` y OVOS; no se garantiza compatibilidad con otros frameworks TTS sin conversión adicional.
- Fecha de creación del repo (2026-11-14) y actualización (2026-11-16): verificar que la versión publicada coincide con la esperada, dado lo reciente del empaquetado.
- Solo 21 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-eu_es-antton-ahotts)
- [Modelo upstream HiTZ/TTS-eu_antton](https://huggingface.co/HiTZ/TTS-eu_antton)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
