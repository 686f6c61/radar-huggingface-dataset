# Phoonnx/styletts2-tuga-kokoro-pt

## Resumen

`Phoonnx/styletts2-tuga-kokoro-pt` es un checkpoint de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx dentro del proyecto `phoonnx`, un motor de inferencia ONNX orientado a TTS. El modelo es una extracción concreta del repositorio agregador `Phoonnx/phoonnx-styletts2`, en la carpeta `tuga-kokoro-pt`, y conserva la estructura de rutas original de dicho repositorio. Está pensado para su uso con la librería `phoonnx` (Apache-2.0), que actúa como runtime de los pesos en formato ONNX.

La arquitectura subyacente es StyleTTS 2, un sistema de TTS neuronal que combina un generador acústico estilo diffusion/GAN con un modelo de estilo y un decoder de vocoder, orientado a síntesis natural y expresiva. El identificador del checkpoint (`tuga-kokoro-pt`) sugiere una voz en portugués vinculada a la familia Kokoro, aunque la model card no documenta explícitamente el idioma ni los datos de entrenamiento.

La relevancia del modelo es acotada: se trata de una publicación reciente (noviembre de 2026) sin descargas ni interacciones registradas, con licencia `other` heredada del repositorio fuente y sin información pública sobre evaluación, idioma o condiciones de uso comercial. Resulta útil como pieza de un pipeline TTS basado en ONNX dentro del ecosistema `phoonnx`, pero no como modelo autónomo documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (TTS neuronal; pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; el repo pesa 0.3 GB) |
| Idiomas soportados | no disponible (el identificador sugiere portugues, sin confirmacion en la model card) |
| Licencia | other (heredada del repositorio fuente `phoonnx-styletts2`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia StyleTTS 2, un sistema de síntesis de voz que desacopla el estilo del contenido mediante un encoder de estilo y un generador acústico, con un decoder vocoder que produce la forma de onda final. El modelo se distribuye en formato ONNX para su ejecución con el runtime `phoonnx`, lo que implica que los grafos han sido exportados para inferencia portable en CPU y GPU.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de ajuste como RLHF o DPO (no aplicables habitualmente a TTS, pero no documentados). La model card únicamente indica que el checkpoint proviene de la carpeta `tuga-kokoro-pt` del repositorio agregador `Phoonnx/phoonnx-styletts2` y que conserva las rutas originales de los ficheros.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`).
- Generación de audio con estilo expresivo, propio de la arquitectura StyleTTS 2.
- Ejecución mediante el runtime `phoonnx` sobre pesos ONNX.
- Identificadores de voz expuestos por el autor: `logus2k/tts_eu_pt`, `logus2k/tts_eu_pt-am_adam`, `logus2k/tts_eu_pt-pm_alex` y `logus2k/tts_eu_pt-pm_santa`.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no documentadas; el identificador apunta a portugués, sin confirmación.
- Capacidades especiales (thinking mode, visión, audio de entrada): no disponibles.

## Casos de uso

- Lectura de artículos y documentación en portugués: el modelo puede convertir texto plano en audio para sistemas de accesibilidad o lectura por voz, siempre que se confirme el idioma efectivo del checkpoint mediante pruebas con el runtime `phoonnx`.
- Generación de locuciones para vídeos y pódcasts: al ofrecer varias voces (`am_adam`, `pm_alex`, `pm_santa`), permite alternar timbres dentro de un mismo proyecto sin cambiar de motor.
- Integración en pipelines ONNX existentes: el formato ONNX y el runtime `phoonnx` facilitan el despliegue en entornos donde ya se ejecutan otros modelos ONNX, sin necesidad de añadir dependencias de PyTorch.
- Prototipado de asistentes de voz: útil para validar interfaces de voz en fases tempranas, dado el reducido tamaño del repositorio (0.3 GB) y la ausencia de requisitos de GPU dedicada documentados.
- Síntesis por lotes en servidores sin GPU: al ser ONNX, puede ejecutarse en CPU, lo que encaja en tareas de generación masiva de audio fuera de línea.
- Evaluación comparativa de voces TTS: los cuatro identificadores de voz permiten comparar timbres y estilos sobre el mismo motor antes de fijar una voz de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0.3 GB) sugiere que el conjunto de pesos ONNX es ligero, pero no se documenta el consumo en inferencia.
- GPU recomendadas: no disponibles. Al ser un modelo ONNX de TTS de tamaño reducido, es plausible su ejecución en CPU y en GPU de gama media, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es probable que quepa en GPU de consumo, sin datos oficiales.
- Opciones de despliegue: runtime `phoonnx` (https://github.com/TigreGotico/phoonnx); otros runtimes ONNX no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/styletts2-tuga-kokoro-pt | StyleTTS 2 (ONNX) | no disponible | no aplica | other | Hugging Face, 0 descargas |
| Kokoro (hexgrad/Kokoro-82M) | TTS neuronal | 82M | no aplica | Apache-2.0 | Hugging Face, ampliamente usado |
| StyleTTS 2 (yl4579/StyleTTS2) | StyleTTS 2 | no disponible en la informacion | no aplica | MIT (repo original) | Hugging Face / GitHub |

La comparación se limita a la arquitectura y la licencia: no hay datos públicos de rendimiento del checkpoint de Phoonnx que permitan contrastar calidad de síntesis, latencia o MOS frente a Kokoro o al StyleTTS 2 original.

## Limitaciones y advertencias

- Licencia `other`: la model card remite a la licencia del repositorio fuente, que mezcla checkpoints de distintos laboratorios con licencias distintas; no se aclara qué licencia concreta aplica a esta carpeta, lo que impide confirmar el uso comercial.
- La model card menciona que el checkpoint catalán de BSC es GPL-3.0, lo que ilustra la heterogeneidad de licencias dentro del repositorio agregador y refuerza la necesidad de verificar la licencia de `tuga-kokoro-pt` antes de usarlo en producción.
- Sin descargas ni interacciones registradas: no hay evidencia pública de validación por parte de la comunidad.
- Idioma no documentado: el identificador sugiere portugués, pero no se confirma en la model card; conviene validar la pronunciación antes de integrarlo.
- Sin datos de benchmarks, MOS ni evaluación subjetiva: no es posible comparar su calidad con alternativas.
- Riesgo de alucinación y sesgos: no documentados por el autor; en TTS, los sesgos se manifiestan en la calidad y naturalidad de las voces y en la cobertura limitada de acentos y registros.
- Dependencia del runtime `phoonnx`: la portabilidad a otros motores ONNX no está garantizada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-tuga-kokoro-pt
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
