# Phoonnx/coqui-vits-fr-css10-vits

## Resumen

`Phoonnx/coqui-vits-fr-css10-vits` es un modelo de síntesis de voz (text-to-speech) en francés, empaquetado en formato ONNX y distribuido por el usuario Phoonnx. Se trata de una conversión de un checkpoint Coqui VITS entrenado sobre el corpus CSS10, extraído del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que reúne múltiples voces de Coqui TTS adaptadas para el motor de inferencia ligero phoonnx.

El modelo resuelve el problema de disponer de una voz francesa TTS ejecutable sin dependencias del stack original de Coqui (Python + PyTorch), gracias a su exportación a ONNX. Esto permite integrarlo en entornos de producción con requisitos estrictos de latencia, portabilidad o despliegue en dispositivos, donde cargar un runtime de PyTorch completo no es viable.

La relevancia es acotada: es un modelo de nicho, sin descargas ni interacciones registradas, orientado a desarrolladores que ya utilizan phoonnx o que necesitan una voz francesa ONNX bajo licencia BSD-3-Clause. No se dispone de información publicada sobre tamaño de parámetros, contexto ni idiomas adicionales en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; cuantización no documentada) |
| Idiomas soportados | francés (según el identificador `fr-css10-vits` y la model card) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo entrenado con pérdidas de dominio temporal y espectral. El resultado es un modelo capaz de generar audio de forma directa a partir de fonemas o texto, sin necesidad de un vocoder separado. La variante Coqui VITS añade utilidades de entrenamiento y exportación propias del proyecto Coqui TTS.

El checkpoint original fue entrenado sobre el corpus CSS10, un conjunto de audiolibros en varios idiomas con alineaciones a nivel de frase, en su partición francesa. No se dispone de información sobre número de tokens de audio, horas de entrenamiento, composición exacta del dataset, ni sobre el uso de técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable en este artefacto concreto es la exportación a ONNX para inferencia con el motor phoonnx, que sustituye la dependencia de PyTorch por un runtime ONNX.

## Capacidades

- Síntesis de voz en francés a partir de texto de entrada, generando waveform de audio.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Integración con el ecosistema de identificadores de voz de phoonnx (voice id `coqui/fr-css10-vits`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del francés.
- No se documentan modos especiales como clonación de voz, control de emoción o estilo, ni streaming.

## Casos de uso

- Síntesis de voz para asistentes en francés: el modelo puede generar respuestas habladas en aplicaciones de atención al cliente o asistentes conversacionales, ejecutándose vía ONNX Runtime sin necesidad de PyTorch.
- Lectura de contenido accesible: conversión de artículos, documentos o notificaciones a audio para usuarios con discapacidad visual, aprovechando el tamaño reducido del repositorio (0,1 GB) para despliegues en servidores modestos.
- Generación de audio para entornos embebidos: al estar en ONNX, puede integrarse en dispositivos con recursos limitados o en contenedores ligeros donde el stack completo de Coqui TTS no es viable.
- Doblaje y locución automatizada de material en francés: producción de pistas de voz para vídeos, tutoriales o presentaciones, con la licencia BSD-3-Clause permitiendo uso comercial.
- Pruebas de integración en pipelines de phoonnx: validación de la voz `coqui/fr-css10-vits` dentro de sistemas que ya consumen el repositorio agregador `Phoonnx/phoonnx-coqui-vits`.
- Prototipado de interfaces de voz en francés: generación rápida de muestras de audio para demos, tests de UX o validación de productos antes de invertir en una voz comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo compacto que probablemente quepa en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no disponible. Dado el tamaño, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del artefacto, aunque no está confirmado en la información disponible.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-fr-css10-vits | Coqui VITS | Francés | ONNX | BSD-3-Clause | Hugging Face (0 descargas) |
| Coqui TTS fr-css10-vits (original) | Coqui VITS | Francés | PyTorch | BSD-3-Clause | Coqui Model Zoo / Hugging Face |
| Otras voces de Phoonnx/phoonnx-coqui-vits | Coqui VITS | Varios | ONNX | BSD-3-Clause | Hugging Face |
| Modelos TTS multilingües (p. ej. XTTS) | VITS/Transformer | Multilingüe | PyTorch | Varía | Coqui / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre CSS10 (audiolibros), la voz puede presentar características de locución literaria y no cubrir registros coloquiales.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas, prosodia artificial o artefactos en palabras fuera del vocabulario de entrenamiento; no hay evaluación publicada.
- Limitaciones de idioma: solo francés; no se documenta soporte de otros idiomas ni code-switching.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y sin endoso; conviene revisar las condiciones del corpus CSS10 original.
- Caveat de producción: el repositorio registra 0 descargas y 0 likes, sin actualizaciones desde su creación; no hay garantía de mantenimiento ni de soporte.
- No se documentan requisitos de normalización de texto, fonemización ni preprocesado específico más allá de lo que gestione phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-fr-css10-vits
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- Coqui TTS (proyecto original): https://github.com/coqui-ai/TTS
- Corpus CSS10: https://github.com/Kyubyong/css10
