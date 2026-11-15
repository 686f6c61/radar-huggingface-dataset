# Phoonnx/vits-pt-cv

## Resumen

vits-pt-cv es un modelo de síntesis de voz (text-to-speech) en portugués basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo procede del lanzamiento v0.8.0 de los modelos de Coqui TTS, concretamente del paquete `tts_models--pt--cv--vits.zip`, y se ha reconvertido para su ejecución mediante ONNX Runtime en lugar de la implementación original de PyTorch.

El modelo está entrenado sobre el corpus Common Voice en portugués, lo que determina tanto el idioma soportado como el dominio acústico: voz leída de hablantes voluntarios con diversidad de acentos y condiciones de grabación. La entrada de texto se realiza a nivel de caracteres (graphemes), gestionada por el fonemizador `GraphemePhonemizer` de la librería scriptconv del mismo ecosistema.

Su relevancia actual radica en que permite desplegar TTS en portugués con una huella de almacenamiento reducida (0,1 GB), licencia permisiva BSD-3-Clause y sin dependencia de PyTorch, lo que facilita su integración en asistentes de voz del ecosistema OVOS y en entornos con recursos limitados. No obstante, se trata de un modelo con muy poca tracción (25 descargas y 0 likes en el momento de la consulta) y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | portugues (pt) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de TTS extremo a extremo que combina un codificador de texto, un codificador de posterior sobre el espectrograma, un bloque de muestreo estocástico basado en normalizing flows y un decodificador generativo de audio, entrenados de forma conjunta mediante aprendizaje adversarial (GAN) junto con una pérdida de reconstrucción. El resultado es un modelo que genera forma de onda directamente a partir de texto, sin necesidad de un vocoder externo en cascada.

Los datos de entrenamiento corresponden al corpus Common Voice en portugués, según la información de la model card y la tabla de licencias de Coqui. No se dispone de detalles sobre el número de horas de audio, el número de tokens de texto, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (en un modelo TTS estas etapas no son habituales). La innovación técnica destacable es la conversión a ONNX y el pipeline de normalización de texto mediante scriptconv, que sustituye la cadena de preprocesamiento original de Coqui por una implementación propia orientada a la inferencia ligera.

## Capacidades

- Síntesis de voz a partir de texto en portugués, con salida en formato WAV mediante `voice.synthesize_wav`.
- Entrada a nivel de caracteres (graphemes), normalizada por el fonemizador `GraphemePhonemizer` de scriptconv.
- Generación de audio de extremo a extremo sin vocoder externo, gracias a la arquitectura VITS.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Inferencia en ONNX Runtime, sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión; es exclusivamente un modelo de TTS.
- No dispone de modo thinking ni de capacidades de audio de entrada (no es un modelo ASR).

## Casos de uso

- Asistentes de voz en el ecosistema OVOS: el modelo se integra directamente como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz en portugués a asistentes domésticos o de escritorio sin infraestructura pesada.
- Lectura de notificaciones y alertas en portugués: con una huella de 0,1 GB y ejecución en ONNX Runtime, puede desplegarse en dispositivos de bajos recursos para convertir mensajes de texto en audio.
- Accesibilidad para personas con discapacidad visual: síntesis de contenido textual en portugués para lectores de pantalla o aplicaciones de lectura asistida.
- Generación de audiolibros o contenido narrado de dominio general: adecuado para textos leídos de extensión moderada, con la salvedad de que el dominio de entrenamiento es voz leída de Common Voice.
- Prototipado rápido de interfaces conversacionales en portugués: al no requerir PyTorch y cargar en ONNX Runtime, permite iterar con rapidez en entornos de desarrollo con GPU modestas o solo CPU.
- Pruebas de integración en pipelines de TTS: útil como modelo de referencia ligero para validar cadenas de normalización de texto, conversión de script y síntesis antes de migrar a modelos de mayor calidad.
- Sistemas embebidos y edge computing: la combinación de tamaño reducido y formato ONNX facilita el despliegue en dispositivos con memoria limitada, siempre que se acepte la calidad propia de un VITS entrenado sobre Common Voice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras oficiales; por el tamaño del repositorio (0,1 GB) se trata de un modelo muy ligero, apto para ejecución en CPU y en GPU de gama baja.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ejecutarlo con holgura, aunque no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU consumer? Sí, por el reducido tamaño del repositorio, aunque no se documentan requisitos mínimos exactos.
- Opciones de despliegue: phoonnx (Python) y el plugin OVOS `ovos-tts-plugin-phoonnx`; al estar en formato ONNX, también puede ejecutarse con ONNX Runtime directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-pt-cv (este modelo) | VITS (ONNX) | pt | no aplica | BSD-3-Clause | Hugging Face, 0,1 GB |
| Coqui TTS pt-cv-vits original | VITS (PyTorch) | pt | no aplica | BSD-3-Clause | GitHub Coqui TTS v0.8.0 |
| Otros VITS de la colección Phoonnx | VITS (ONNX) | varios | no aplica | según modelo | Hugging Face (colección VITS) |

No se dispone de datos de rendimiento comparativo ni de benchmarks que permitan contrastar la calidad de este modelo frente a alternativas de la misma categoría; la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre Common Voice, la voz generada refleja la distribución de hablantes y condiciones de grabación del corpus, con posible sesgo de acento, género y calidad de micrófono; no se documentan análisis de sesgo.
- Riesgo de alucinación: en TTS se manifiesta como artefactos acústicos, pronunciaciones erróneas o inestabilidad en textos fuera del dominio de entrenamiento (por ejemplo, siglas, números o palabras extranjeras).
- Limitaciones de contexto o idioma: el modelo solo soporta portugués (`pt`); no se documenta cobertura de variantes regionales ni de otros idiomas.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y conservación del aviso de copyright; conviene verificar las condiciones del corpus Common Voice subyacente, que no se detallan en la información disponible.
- Caveats para producción: sin benchmarks publicados no hay evidencia objetiva de calidad; el modelo tiene muy poca adopción (25 descargas, 0 likes) y depende de la librería phoonnx en versión preliminar (`pip install --pre phoonnx`), lo que implica menor estabilidad de API.
- La entrada de texto requiere un front-end de normalización (scriptconv) que puede introducir errores en la conversión de graphemes a la secuencia esperada por el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pt-cv
- Modelo original Coqui TTS v0.8.0: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--pt--cv--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Documentación de VITS (arquitectura): https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
