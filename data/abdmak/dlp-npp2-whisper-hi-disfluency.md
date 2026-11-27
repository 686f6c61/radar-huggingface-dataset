# abdmak/dlp-npp2-whisper-hi-disfluency

## Resumen

`abdmak/dlp-npp2-whisper-hi-disfluency` es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario abdmak. Se trata de un fine-tuning de la arquitectura Whisper de OpenAI, identificable por la librería `transformers`, el tag `whisper` y la tarea declarada `automatic-speech-recognition`. El nombre del repositorio sugiere un ajuste orientado a hindi (`hi`) y a la gestión de disfluencias en el habla, aunque el autor no documenta explícitamente ninguno de estos extremos en la model card.

El modelo cuenta con 241.734.912 parámetros según los pesos en formato safetensors, lo que lo sitúa en la horquilla del Whisper Small (unos 244 millones de parámetros). El tamaño del repositorio es de 1,0 GB. Fue creado el 27 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

La relevancia de este modelo es limitada y de nicho: se trata de un checkpoint sin model card sustantiva (la existente es la plantilla autogenerada de Hugging Face con todos los campos como `[More Information Needed]`), sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Resulta útil únicamente como artefacto experimental para quien quiera inspeccionar o continuar el fine-tuning, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), según tags y pipeline |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre del repo sugiere hindi, `hi`, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un modelo transformer encoder-decoder diseñado para reconocimiento automático del habla que procesa audio convertido a espectrogramas log-Mel y genera transcripciones de forma autorregresiva. El tag `arxiv:1910.09700` presente en el repositorio remite al artículo de Lacoste et al. sobre el cálculo del impacto ambiental del aprendizaje automático, no a un paper propio del modelo; se trata de una referencia heredada de la plantilla de model card de Hugging Face.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens o horas de audio, ni la composición del dataset, ni si hubo técnicas de ajuste fino supervisado, RLHF o DPO. El nombre del repositorio (`dlp-npp2-whisper-hi-disfluency`) apunta a un fine-tuning sobre hindi con tratamiento de disfluencias, pero el autor no lo documenta. Tampoco se indica el checkpoint base exacto de Whisper a partir del cual se ajustó.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), según el pipeline declarado `automatic-speech-recognition`.
- Procesamiento de audio en ventanas compatibles con la arquitectura Whisper (presumiblemente 30 s por segmento, no confirmado).
- Posible especialización en hindi y en manejo de disfluencias del habla, inferida únicamente del nombre del repositorio y no verificada.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio adicional): no disponible.

## Casos de uso

- Transcripción experimental de audio en hindi: el modelo podría emplearse para convertir grabaciones en hindi a texto, dado el sufijo `hi` del nombre, aunque la ausencia de documentación y evaluación hace necesaria una validación previa con datos propios.
- Investigación sobre disfluencias en ASR: el sufijo `disfluency` sugiere un ajuste orientado a preservar o gestionar titubeos, repeticiones y falsos arranques; útil para estudiar cómo los modelos Whisper tratan estos fenómenos en comparación con el checkpoint base.
- Punto de partida para fine-tuning adicional: al ser un checkpoint de 241 millones de parámetros en safetensors, puede servir como inicialización para experimentos propios de ajuste en otras lenguas o dominios.
- Evaluación comparativa de checkpoints comunitarios: útil en estudios que midan la degradación o mejora de fine-tunings no documentados frente al Whisper original.
- Reproducción de pipelines de ASR en entornos de investigación: integrable con la librería `transformers` mediante `pipeline("automatic-speech-recognition")` para pruebas controladas.
- Docencia y experimentación con arquitecturas encoder-decoder de audio: su tamaño moderado permite desplegarlo en hardware de gama media para prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (241,7 M de parámetros × 4 bytes), más overhead de activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para fp32; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante, con margen).
- Opciones de despliegue: `transformers` (librería declarada), y potencialmente `whisper.cpp`, `faster-whisper`, `vLLM` (soporte ASR limitado) u `Ollama` si se convierte a GGUF, aunque no hay confirmación de compatibilidad en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abdmak/dlp-npp2-whisper-hi-disfluency` | 241,7 M | no disponible (Whisper: 30 s) | no disponible | no disponible | Hugging Face, 0 descargas |
| `openai/whisper-small` | ~244 M | 30 s por ventana | multilingüe (99 idiomas) | MIT (según repositorio original) | Hugging Face, ampliamente usado |
| `openai/whisper-base` | ~74 M | 30 s por ventana | multilingüe | MIT | Hugging Face, muy usado |
| `openai/whisper-medium` | ~769 M | 30 s por ventana | multilingüe | MIT | Hugging Face, muy usado |

La comparación con los checkpoints oficiales de Whisper es la más pertinente por arquitectura y tamaño. Frente a ellos, este modelo carece de documentación, licencia declarada, idiomas declarados y evaluación publicada, lo que lo hace no apto para uso en producción sin validación previa.

## Limitaciones y advertencias

- Model card autogenerada: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, evaluación) figuran como `[More Information Needed]`.
- Licencia no declarada: no puede asumirse uso comercial permitido; la ausencia de licencia impide determinar los términos legales de uso y redistribución.
- Idiomas no declarados: la posible especialización en hindi es una inferencia del nombre del repositorio, no una garantía.
- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad frente al Whisper base.
- Riesgo de alucinación: los modelos Whisper son propensos a generar texto inventado en segmentos de silencio o audio ruidoso; sin evaluación específica, este riesgo no está cuantificado.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no pueden evaluarse sesgos de acento, género o dominio.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026): conviene verificar la autenticidad y procedencia del checkpoint antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdmak/dlp-npp2-whisper-hi-disfluency
- Artículo referenciado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental del aprendizaje automático: https://mlco2.github.io/impact
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
