# openlimi/uzbek-stt-tiny

## Resumen

Tunar STT Tiny es un modelo de reconocimiento automático del habla (ASR) especializado exclusivamente en uzbeko, desarrollado por OpenLimi. Con tan solo 18,8 millones de parámetros, se posiciona como una alternativa ultracompacta a los grandes sistemas ASR multilingües para aplicaciones que únicamente necesitan transcribir uzbeko. El modelo deriva de la arquitectura Moonshine Tiny de Moonshine AI, sobre la que se ha realizado un ajuste fino con un corpus de audio y transcripciones en uzbeko, asociado al experimento `v3_1500h`.

La relevancia del modelo radica en su enfoque de especialización para un idioma de bajos recursos: en lugar de recurrir a arquitecturas multilingües masivas, emplea un encoder-decoder compacto con un tokenizador BPE personalizado de 4.096 tokens diseñado específicamente para el uzbeko latino. Esto reduce drásticamente los requisitos computacionales y permite la inferencia local en dispositivos con recursos limitados, como móviles, sistemas embebidos o entornos edge.

El modelo se distribuye en formato safetensors con pesos en FP32, trabaja a 16 kHz en mono y recomienda segmentos de audio de hasta aproximadamente 30 segundos. Su licencia no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moonshine encoder-decoder (transformer) |
| Parámetros totales | 18.835.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio recomendados de hasta ~30 s) |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine Tiny, un diseño encoder-decoder orientado a ASR que procesa directamente la forma de onda de audio a 16 kHz. Sobre esta base, OpenLimi ha realizado un ajuste fino con un pipeline centrado en uzbeko, empleando una colección a gran escala de audio y transcripciones en ese idioma. El experimento de entrenamiento se identifica como `v3_1500h`, lo que sugiere el uso de aproximadamente 1.500 horas de audio, aunque el dato exacto de composición del dataset no está detallado en la información disponible.

La innovación técnica más destacable es el tokenizador BPE personalizado de 4.096 tokens, que incorpora un sistema de caracteres específico para el uzbeko latino: `o'` se representa como `ö`, `g'` como `ğ`, `sh` como `ş` y `ch` como `ç`. Esto permite que el tokenizador trate estos dígrafos y caracteres como unidades de vocabulario dedicadas, mejorando la eficiencia de la decodificación para el uzbeko. No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO u otras optimizaciones posteriores al entrenamiento supervisado.

## Capacidades

- Transcripción de voz a texto en uzbeko: conversión de audio en formato waveform a texto escrito en uzbeko latino con el sistema de caracteres propio del modelo.
- Procesamiento de audio a 16 kHz en mono, con segmentos recomendados de hasta aproximadamente 30 segundos.
- Tokenizador especializado para uzbeko con vocabulario BPE de 4.096 tokens.
- Conversión de salida a ortografía estándar uzbeka mediante una función de normalización documentada (`ö` → `oʻ`, `ğ` → `gʻ`, `ş` → `sh`, `ç` → `ch`).
- Inferencia local en CPU o GPU, diseñada para dispositivos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio multilingüe ni modo thinking en la información disponible.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el modelo, con 18,8M de parámetros y pesos en FP32 de aproximadamente 75 MB, puede ejecutarse en el propio dispositivo sin conexión, transcribiendo grabaciones de hasta 30 segundos segmentadas previamente.
- Subtitulado automático de contenido en uzbeko: integrado en un pipeline que divida el audio en segmentos de 30 segundos, el modelo genera transcripciones que luego se normalizan a la ortografía estándar uzbeka para su publicación.
- Asistentes de voz embebidos: su tamaño reducido permite desplegarlo en sistemas edge o microcontroladores con capacidad de cómputo limitada para comandos de voz y consultas cortas en uzbeko.
- Digitalización de archivos orales: transcripción por lotes de entrevistas, grabaciones históricas o material educativo en uzbeko, dividiendo el audio en fragmentos y procesándolos secuencialmente en CPU.
- Accesibilidad para hablantes de uzbeko: generación de transcripciones en tiempo real o diferido para personas con discapacidad auditiva en entornos con hardware modesto.
- Investigación en ASR para lenguas de bajos recursos: el modelo sirve como línea base compacta y reproducible para experimentos de ajuste fino y evaluación de WER en uzbeko, dado su origen en Moonshine Tiny y su tokenizador documentado.
- Procesamiento offline en entornos sin conectividad: aplicaciones de campo, kioscos o dispositivos industriales que requieran transcripción de uzbeko sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados formales de evaluación aún no se han publicado y que las comparaciones significativas deberían incluir la tasa de error de palabras (WER).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (pesos de ~75 MB más activaciones y buffers de audio); en la práctica, cualquier GPU con 1-2 GB de VRAM es suficiente.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para ejecutarse en CPU. Cualquier GPU consumer moderna (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo con holgura.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos móviles y sistemas embebidos con al menos unos cientos de MB de memoria disponible.
- Opciones de despliegue: la librería transformers con `MoonshineForConditionalGeneration` es el método documentado; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| Tunar STT Tiny (openlimi) | 18,8M | uzbeko | ~30 s por segmento | no disponible | safetensors |
| Moonshine Tiny (moonshine-ai) | no disponible en la información | inglés (modelo base) | no disponible | no disponible | no disponible |
| Whisper Tiny (OpenAI) | no disponible en la información | multilingüe | 30 s | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (WER) entre estos modelos en la información proporcionada. La comparación se limita a parámetros, idioma y formato; los datos de Whisper Tiny y Moonshine Tiny no están detallados en la información disponible.

## Limitaciones y advertencias

- El modelo solo soporta uzbeko; no es adecuado para otros idiomas.
- No se han publicado métricas de WER ni evaluaciones formales, por lo que su calidad real de transcripción es desconocida y debe validarse antes de usarlo en producción.
- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; es imprescindible contactar con el autor antes de un despliegue comercial.
- Los segmentos de audio superiores a ~30 segundos deben dividirse manualmente; el modelo no gestiona audio largo de forma nativa.
- La salida utiliza un sistema de caracteres propio (`ö`, `ğ`, `ş`, `ç`) que requiere normalización posterior para coincidir con la ortografía estándar uzbeka.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el corpus de entrenamiento o vocabulario técnico fuera del dominio.
- El corpus de entrenamiento (`v3_1500h`) no está documentado en detalle, lo que dificulta evaluar sesgos de dominio, género o dialecto.
- El modelo se distribuye en FP32; no se documentan versiones cuantizadas oficiales, aunque su tamaño permite cuantizarlo sin dificultad.
- Al ser un modelo con solo 30 descargas y 2 likes en el momento de la ficha, carece de validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/openlimi/uzbek-stt-tiny
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny
