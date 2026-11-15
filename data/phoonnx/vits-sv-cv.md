# Phoonnx/vits-sv-cv

## Resumen

vits-sv-cv es un modelo de síntesis de voz (text-to-speech) en sueco basado en la arquitectura VITS desarrollada por Coqui. El modelo original procede del repositorio oficial de Coqui TTS (versión 0.8.0) y ha sido empaquetado por Phoonnx en formato ONNX para su uso con su librería de TTS basada en ONNX. Está entrenado sobre el corpus Common Voice en sueco, según se desprende del identificador `sv-cv-vits` y de la tabla de licencias de la model card.

El modelo resuelve la conversión de texto a audio en sueco con un pipeline de extremo a extremo, tomando caracteres como entrada y generando forma de onda directamente. Su relevancia radica en que ofrece una alternativa ligera (repositorio de 0,1 GB) y con licencia permisiva BSD-3-Clause para integrar TTS en sueco dentro de aplicaciones Python y asistentes de voz basados en OVOS.

Se distribuye principalmente como pesos ONNX para la librería phoonnx, con un front-end de texto que delega la normalización y la fonemización en la librería scriptconv. Es un modelo orientado a inferencia en producción y a integración en asistentes de voz, no a investigación sobre arquitecturas de TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | sueco (`sv`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto |
| Front-end de texto | `GraphemePhonemizer` de scriptconv |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, junto con alineamiento monotónico aprendido. El modelo genera la forma de onda directamente a partir del texto, sin un vocoder externo separado.

El modelo original fue entrenado por Coqui y publicado en su release de modelos v0.8.0. Según el identificador y la tabla de licencias de la model card, el corpus de entrenamiento es Common Voice en sueco. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. El empaquetado de Phoonnx convierte los pesos a ONNX y añade un front-end de texto basado en scriptconv que normaliza la entrada y la convierte en caracteres para el modelo.

## Capacidades

- Síntesis de voz en sueco a partir de texto, generando audio WAV mediante `voice.synthesize_wav`.
- Entrada basada en caracteres (no en fonemas IPA en el modelo empaquetado), con normalización previa mediante `GraphemePhonemizer` de scriptconv.
- Integración con la librería phoonnx en Python mediante `TTSModelManager`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución de inferencia sobre pesos ONNX, lo que facilita el despliegue sin dependencia del framework original de Coqui.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni multimodalidad.

## Casos de uso

- Asistentes de voz en sueco con OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `coqui/sv-cv-vits` en `mycroft.conf` y sintetizar respuestas del asistente en tiempo de ejecución.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domótica: el modelo puede generar audio corto a partir de cadenas de texto en sueco con una integración Python mínima.
- Accesibilidad para contenido en sueco: conversión de artículos, correos o mensajes a audio para usuarios con discapacidad visual, usando el pipeline de phoonnx sobre texto normalizado por scriptconv.
- Prototipado de interfaces conversacionales en sueco: al ser un repositorio de 0,1 GB con pesos ONNX, permite iterar rápidamente en entornos de desarrollo sin grandes requisitos de almacenamiento.
- Generación de avisos pregrabados en aplicaciones de transporte o comercio: síntesis batch de mensajes en sueco para su reproducción posterior.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ejecutarse sobre ONNX y con una API Python estable, se puede automatizar la generación de muestras de referencia y comparar salidas entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; al ejecutarse sobre ONNX, puede correr en CPU y en GPU compatibles con ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí dada la ausencia de requisitos documentados y el tamano reducido, aunque no se especifican modelos concretos.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y ejecución de pesos ONNX mediante ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Rendimiento |
|---|---|---|---|---|---|---|
| Phoonnx/vits-sv-cv | VITS (Coqui) | Sueco | BSD-3-Clause | ONNX | no disponible | no disponible |
| Coqui TTS `tts_models--sv--cv--vits` | VITS (Coqui) | Sueco | BSD-3-Clause | Checkpoint Coqui | no disponible | no disponible |
| Otros modelos VITS empaquetados por Phoonnx (colección VITS) | VITS (Coqui) | Varios | BSD-3-Clause (segun model card) | ONNX | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- El modelo solo soporta sueco (`sv`); no se documenta soporte multilingüe.
- No se documentan sesgos específicos, pero al entrenarse sobre Common Voice puede heredar sesgos de acento, género y registro del corpus.
- Riesgo de alucinación o artefactos de audio en entradas fuera de dominio, texto con caracteres especiales o frases muy largas; no se documentan métricas de robustez.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar la procedencia del corpus Common Voice y sus condiciones de uso asociadas.
- El front-end de texto depende de scriptconv y de su `GraphemePhonemizer`; cambios en esa librería pueden alterar la calidad de la síntesis.
- No se documentan parámetros de control de prosodia, velocidad ni emoción.
- El modelo se distribuye como pesos ONNX para phoonnx; no se garantiza compatibilidad directa con el pipeline original de Coqui TTS sin conversión.
- No se dispone de información sobre latencia, throughput ni requisitos mínimos de hardware en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-sv-cv)
- [Repositorio original de Coqui TTS (release v0.8.0)](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--sv--cv--vits.zip)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Librería phoonnx](https://github.com/TigreGotico/phoonnx)
- [Librería scriptconv](https://github.com/TigreGotico/scriptconv)
