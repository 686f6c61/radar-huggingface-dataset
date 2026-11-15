# Phoonnx/vits-da_dk-cv

## Resumen

Phoonnx/vits-da_dk-cv es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en danés (variante `da-DK`) a audio inteligible, y su propósito principal es ofrecer una voz TTS ligera y ejecutable en local dentro del ecosistema OVOS y de la librería phoonnx.

El modelo está entrenado sobre el corpus Common Voice en danés, según se desprende de la nomenclatura `cv` del identificador y de la tabla de licencias de la model card. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo convierte en un modelo muy ligero, adecuado para despliegues en dispositivos con recursos limitados o para integración en asistentes de voz de bajo consumo.

La relevancia actual del modelo reside en su empaquetado ONNX y su integración con phoonnx y OVOS, que facilita su uso en pipelines de TTS sin depender del framework original de Coqui. La licencia BSD-3-Clause permite uso comercial con atribución, lo que lo hace atractivo para productos que necesiten síntesis de voz en danés sin restricciones copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danés (`da`, `da-DK`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de texto sin necesidad de un vocoder externo, lo que simplifica el pipeline de inferencia.

El modelo fue entrenado originalmente por Coqui y publicado en la release v0.8.0 de su repositorio TTS bajo el identificador `tts_models--da--cv--vits`. El sufijo `cv` indica que los datos de entrenamiento provienen de Common Voice en danés. No se dispone de información detallada sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los especifica. La innovación destacable es el empaquetado en ONNX para phoonnx, que permite ejecutar el modelo sin el framework original de Coqui.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en danés (`da-DK`).
- Entrada por caracteres (front-end basado en `GraphemePhonemizer` de `scriptconv`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en local mediante ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en danés: el modelo puede integrarse en OVOS para convertir respuestas textuales en audio, gracias a su empaquetado ONNX y su licencia permisiva.
- Lectura de notificaciones y alertas: en aplicaciones de escritorio o domótica, el modelo puede sintetizar mensajes cortos en danés con bajo coste computacional.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en entornos de habla danesa, ejecutándose localmente sin conexión.
- Sistemas embebidos y dispositivos de bajo consumo: su tamaño de repositorio de 0,1 GB permite desplegarlo en Raspberry Pi u otros dispositivos con recursos limitados.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz danesa rápida para pruebas de UX pueden usar el modelo sin entrenar uno propio.
- Generación de audiolibros o contenido narrado en danés: para volúmenes moderados de texto, el modelo ofrece una solución local sin dependencias de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB), es probable que quepa en GPUs con 2-4 GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en consumer GPU?: probablemente sí, dado el tamaño reducido, pero no se especifica en la información disponible.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| Phoonnx/vits-da_dk-cv | VITS | da-DK | BSD-3-Clause | ONNX | 0,1 GB |
| Coqui TTS `tts_models--da--cv--vits` | VITS | da-DK | BSD-3-Clause | Coqui (original) | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | BSD-3-Clause (según modelo) | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta danés (`da-DK`); no es multilingüe.
- Al estar entrenado sobre Common Voice, puede heredar sesgos de género, edad o acento presentes en el corpus.
- Riesgo de pronunciación incorrecta en nombres propios, siglas o palabras fuera del vocabulario común.
- La licencia BSD-3-Clause permite uso comercial, pero requiere atribución y no ofrece garantías.
- No se especifican limitaciones de longitud de texto de entrada; textos muy largos podrían requerir segmentación.
- Es un modelo TTS, no un LLM: no realiza razonamiento, tool calling ni generación de texto.
- La información sobre cuantización y requisitos exactos de hardware no está disponible, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- [Hugging Face: Phoonnx/vits-da_dk-cv](https://huggingface.co/Phoonnx/vits-da_dk-cv)
- [Repositorio original de Coqui TTS (release v0.8.0)](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--da--cv--vits.zip)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
