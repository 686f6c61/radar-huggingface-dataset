# Phoonnx/vits-fr-css10-graphemes

## Resumen

`Phoonnx/vits-fr-css10-graphemes` es un modelo de síntesis de voz (text-to-speech) en francés basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo procede del checkpoint `tts_models--fr--css10--vits` publicado en las releases de Coqui TTS v0.8.0 y ha sido convertido para su ejecución mediante ONNX Runtime, lo que facilita su integración en entornos Python y en el asistente de voz OVOS.

El modelo resuelve la conversión de texto a audio en francés a partir de caracteres (graphemes) como entrada, sin necesidad de un fonemizador basado en diccionario: el front-end utiliza `GraphemePhonemizer` de la librería `scriptconv`. Está entrenado sobre el corpus CSS10 (Common Voice Single Speaker), un conjunto de datos de un único hablante en francés, lo que condiciona su uso a una sola voz.

Su relevancia actual es limitada pero específica: se trata de un modelo ligero (0,1 GB de repositorio) pensado para despliegue en local y en dispositivos con recursos restringidos, con licencia permisiva BSD-3-Clause. No es un modelo de última generación ni compite en calidad con sistemas TTS neuronales modernos, pero cubre el caso de uso de síntesis de voz offline en francés dentro del ecosistema OVOS/Mycroft.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés (`fr`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, junto con un alineamiento monotónico aprendido (MAS). El modelo genera directamente la forma de onda a partir del texto, sin necesidad de un vocoder separado, lo que simplifica el despliegue.

En este caso concreto, el modelo es una conversión a ONNX del checkpoint original de Coqui TTS v0.8.0 entrenado sobre CSS10 en francés. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de su origen en CSS10, ni sobre si se aplicaron etapas de RLHF o DPO (no habituales en modelos TTS de esta generación). El front-end de texto utiliza una conversión directa de grafemas a fonemas mediante `GraphemePhonemizer`, lo que evita dependencias de diccionarios fonéticos externos.

## Capacidades

- Síntesis de voz en francés a partir de texto escrito, generando audio en formato WAV.
- Entrada basada en grafemas: no requiere transcripción fonética manual ni diccionario de pronunciación.
- Voz única (single speaker), correspondiente al hablante del corpus CSS10.
- Ejecución mediante ONNX Runtime a través de la librería `phoonnx`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente TTS).
- No soporta otros idiomas distintos del francés.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistente de voz offline en francés: integrado en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permite sintetizar respuestas del asistente sin conexión a servicios en la nube, gracias a su formato ONNX y su reducido tamaño.
- Lectura de textos en aplicaciones de accesibilidad: el modelo puede convertir artículos, notificaciones o mensajes en audio para usuarios con discapacidad visual, con una latencia baja al ejecutarse en CPU.
- Generación de avisos pregrabados: útil para producir mensajes de voz en francés en sistemas de megafonía, contestadores automáticos o interfaces de kiosco, donde la voz única y consistente es suficiente.
- Prototipado rápido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse mediante `TTSModelManager`, permite validar flujos de TTS en francés en pocas líneas de código antes de invertir en modelos de mayor calidad.
- Sistemas embebidos y de bajo consumo: su tamaño de repositorio de 0,1 GB y su ejecución vía ONNX Runtime lo hacen adecuado para dispositivos con recursos limitados donde no cabe un modelo TTS de gran tamaño.
- Pruebas de regresión en pipelines de TTS: sirve como referencia estable y ligera para comparar la salida de otros modelos TTS en francés dentro de un mismo pipeline de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se estima un consumo de memoria muy reducido, del orden de cientos de MB, aunque no se documenta una cifra concreta.
- GPU recomendadas: no se especifican; el modelo está empaquetado para ONNX Runtime, por lo que puede ejecutarse tanto en CPU como en GPU compatibles con ONNX Runtime.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, dado el reducido tamaño del modelo, aunque no se aportan cifras oficiales.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución directa mediante ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-fr-css10-graphemes | VITS | fr | BSD-3-Clause | ONNX | Hugging Face |
| Coqui TTS `tts_models--fr--css10--vits` (upstream) | VITS | fr | BSD-3-Clause | Checkpoint PyTorch | GitHub Releases de Coqui |
| Otros modelos VITS empaquetados en la colección Phoonnx | VITS | varios | según modelo | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Voz única: solo reproduce el hablante del corpus CSS10, sin posibilidad de selección de voz.
- Idioma restringido al francés; no soporta otros idiomas.
- Modelo de generación antigua (Coqui TTS v0.8.0): la calidad de síntesis es inferior a la de sistemas TTS neuronales actuales.
- Entrada basada en grafemas: aunque evita dependencias de diccionario, puede producir pronunciaciones incorrectas en palabras con ortografía irregular o préstamos lingüísticos.
- Riesgo de artefactos y prosodia limitada en frases largas o con puntuación compleja; no se documentan evaluaciones formales de naturalidad.
- No se documentan sesgos específicos, pero al entrenarse sobre un único hablante de CSS10, la voz refleja las características de ese hablante y no es representativa de la diversidad de acentos franceses.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones del corpus CSS10 subyacente.
- El modelo se distribuye como conversión no oficial a ONNX; no se garantiza paridad exacta con el checkpoint original de Coqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr-css10-graphemes
- Checkpoint upstream de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--fr--css10--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
