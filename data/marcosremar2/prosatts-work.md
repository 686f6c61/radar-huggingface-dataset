# marcosremar2/prosatts-work

## Resumen

ProsaTTS-work es el repositorio de material de trabajo del proyecto ProsaTTS, un sistema de síntesis de voz (TTS) de 16,7 millones de parámetros orientado a portugués de Brasil que, según su autor, está diseñado para ejecutarse en el navegador. Este repositorio no contiene un modelo listo para producción, sino checkpoints intermedios en formato `.pth`, bancos de estilos, etiquetas de emoción, scripts de entrenamiento, generación de datos y evaluación, además de un vocoder MS-WaveHax. El tamaño total del repositorio es de 1,2 GB.

El modelo se apoya en la arquitectura Kokoro (según las etiquetas del repositorio) y emplea una etapa de iSTFT en los checkpoints principales (`f3_istft` y `g4_istft`). La voz objetivo es sintética: los datos de entrenamiento se generaron con VoxCPM2 y Chatterbox Turbo clonando una voz denominada "Rasalgethi" producida por Gemini TTS. El autor advierte explícitamente de que los términos de Google para esa voz no han sido revisados y de que el material no debe usarse para suplantar a una persona.

La relevancia de este repositorio es limitada y de carácter experimental: documenta el estado de un fine-tuning para introducir marcadores no verbales (`<riso>`, `<risinho>`, `<tosse>`) que, a fecha de la última actualización, no funciona correctamente. Es material de investigación abierto, no un modelo publicable para aplicaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (TTS), con checkpoints que incorporan etapa iSTFT; vocoder MS-WaveHax en `h1_mswavehax` |
| Parametros totales | 16,7 M (modelo ProsaTTS de referencia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués, variante pt-BR según la model card), fr |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); bancos de estilos `.bank.pt`; etiquetas `.labels.pt`; `laugh_bank.tar`; `index_laugh2.jsonl` |

## Arquitectura y entrenamiento

El sistema se basa en Kokoro, una familia de modelos TTS ligeros, y los checkpoints principales incorporan una etapa de iSTFT para la reconstrucción de la forma de onda. El repositorio incluye tres variantes: `f3_istft` (modelo con emociones), `g4_istft` (fine-tuning con los tokens `<riso>`, `<risinho>` y `<tosse>`) y `h1_mswavehax` (vocoder MS-WaveHax). También se incluyen bancos de estilos y etiquetas de emoción asociados a los checkpoints.

Los datos de entrenamiento son completamente sintéticos: el audio proviene de VoxCPM2 y de Chatterbox Turbo, que clonan la voz "Rasalgethi" generada por Gemini TTS. El repositorio contiene scripts de entrenamiento (`pttrain14`), de generación de datos (`frgen`, `laughgen`) y de evaluación. El fine-tuning `g4_istft` se orientó a aprender sonidos no verbales a partir de un banco de risas y toses (`laugh_bank.tar`) y de frases construidas con el sonido insertado en medio (`index_laugh2.jsonl`). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz (TTS) en portugués y francés, según los idiomas declarados en el repositorio.
- Control de estilo y emoción mediante bancos de estilos (`.bank.pt`) y etiquetas de emoción (`.labels.pt`) en el checkpoint `f3_istft`.
- Marcadores no verbales experimentales `<riso>`, `<risinho>` y `<tosse>` en el checkpoint `g4_istft`; según el autor, no funcionan correctamente en la fecha indicada.
- Reconstrucción de audio mediante iSTFT en los checkpoints principales y vocoder MS-WaveHax como alternativa.
- Ejecución prevista en el navegador para el modelo ProsaTTS de referencia (16,7 M de parámetros).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Investigación en TTS ligero: el repositorio permite reproducir el pipeline de entrenamiento (`pttrain14`) y evaluar checkpoints intermedios de un modelo de 16,7 M de parámetros orientado a ejecución en navegador.
- Estudio de vocoders: la variante `h1_mswavehax` permite comparar la reconstrucción mediante vocoder MS-WaveHax frente a la etapa iSTFT de los checkpoints `f3_istft` y `g4_istft`.
- Experimentación con control de emoción: los bancos de estilos y las etiquetas de emoción de `f3_istft` sirven para probar condicionamiento emocional en síntesis de voz de bajo coste computacional.
- Análisis de fallos en marcadores no verbales: el caso documentado del `<riso>` (duración aprendida de 0,4–0,8 s, pero volumen de salida del 4–39 % frente al 90 % en entrenamiento) es un material útil para estudiar los límites de representar sonidos variables en el tiempo con un único token.
- Generación de datos sintéticos de voz: los scripts `frgen` y `laughgen` documentan cómo se construyeron los corpus con VoxCPM2 y Chatterbox Turbo, reutilizables para crear datasets de TTS en pt y fr.
- Docencia y prototipado: al ser material de trabajo con licencia Apache 2.0 y pesos en `.pth`, puede emplearse en entornos académicos para ilustrar el ciclo completo de un proyecto TTS, siempre que no se use para suplantar identidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 16,7 M de parámetros, el modelo de referencia es muy pequeño, pero el repositorio no proporciona cifras de memoria ni de latencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del modelo de referencia, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos están en `.pth` y los scripts son de PyTorch. El modelo de referencia ProsaTTS se describe como ejecutable en el navegador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| ProsaTTS-work (este repositorio) | 16,7 M (referencia) | no disponible | pt, fr | Apache 2.0 | Material de trabajo, checkpoints intermedios |
| Kokoro | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Modelo base de la arquitectura citada |
| VoxCPM2 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Fuente de datos de entrenamiento |
| Chatterbox Turbo | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Fuente de datos de entrenamiento |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es material de trabajo, no un modelo final: contiene checkpoints intermedios, scripts y datos auxiliares.
- Los marcadores `<riso>`, `<risinho>` y `<tosse>` no funcionan correctamente según el propio autor: el sonido sale al 4–39 % del volumen de la voz (frente al 90 % en entrenamiento) y Whisper no detecta risa ni tos en la salida.
- La voz es sintética y se generó clonando "Rasalgethi", una voz de Gemini TTS cuyos términos de uso no han sido revisados por el autor; existe riesgo legal en el uso comercial del material derivado.
- El autor prohíbe explícitamente usar el modelo para hacerse pasar por una persona.
- Los datos de entrenamiento son enteramente sintéticos, lo que puede introducir artefactos y sesgos propios de los modelos generadores (VoxCPM2 y Chatterbox Turbo).
- Idiomas declarados limitados a pt y fr; no hay evidencia de calidad multilingüe más allá de esa declaración.
- No hay benchmarks publicados, por lo que no puede evaluarse su calidad objetiva frente a alternativas.
- Riesgo de alucinación no aplicable en el sentido de texto, pero sí de artefactos acústicos y prosodia incorrecta en la síntesis.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/marcosremar2/prosatts-work
- Modelo de referencia ProsaTTS: https://huggingface.co/marcosremar2/prosatts
- VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Chatterbox Turbo: https://huggingface.co/ResembleAI/chatterbox-turbo
