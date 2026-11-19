# fdemelo/x-vits-thorsten-emotional

## Resumen

x-vits Thorsten emotional es un modelo de síntesis de voz (text-to-speech) en alemán desarrollado por fdemelo (Thorsten Müller) que genera habla expresiva en ocho emociones distintas: neutral, divertido, enfadado, asqueado, sorprendido, somnoliento, borracho y susurrante. Se construye sobre la arquitectura Piper/VITS, un modelo TTS ligero de extremo a extremo, y parte del modelo base Thorsten-Voice/Piper-Scratch, afinado con el conjunto de datos emocional propio de Thorsten (OpenSLR 110). Su relevancia radica en que añade control emocional explícito y énfasis por palabra a un modelo TTS de tamaño reducido, algo poco habitual en voces Piper convencionales.

El modelo tiene aproximadamente 25 millones de parámetros, se exporta a formato ONNX y está pensado para ejecutarse en CPU, lo que lo hace adecuado para despliegues ligeros, sistemas embebidos y aplicaciones de asistencia por voz sin GPU. Frente a una voz Piper estándar, que aprende un promedio de las emociones y lee todas las frases de forma similar, este modelo permite seleccionar la emoción por frase, marcar palabras con asteriscos para enfatizarlas y aplicar una intensidad de estilo ajustable.

La licencia es CC0 1.0, lo que elimina restricciones de uso comercial. El repositorio ocupa aproximadamente 0,1 GB y se publicó en noviembre de 2026. Es un modelo de nicho, orientado al alemán y a la síntesis expresiva, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), text-to-speech de extremo a extremo con flow-matching para prosodia |
| Parametros totales | ~25 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; el autor no detalla variantes cuantizadas) |
| Idiomas soportados | alemán (de) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS implementada en Piper, un sistema TTS de extremo a extremo que combina un codificador de texto, un prior y un decodificador generativo con normalización de flujo. Sobre esta base, x-vits 0.2 incorpora un modelo de flow-matching que muestrea entonación y duración por fonema, de modo que las frases no comparten una única melodía. Se añade además un mecanismo de control de estilo que permite seleccionar una de las ocho emociones por frase y ajustar su intensidad mediante el parámetro `style_strength`, donde valores superiores a 1 empujan la emoción más allá de lo aprendido.

El entrenamiento parte de Thorsten-Voice/Piper-Scratch y se afina con el conjunto de datos emocional de Thorsten (OpenSLR 110), que contiene grabaciones en las ocho emociones. Las grabaciones están normalizadas en sonoridad, por lo que el esfuerzo vocal (por ejemplo, el timbre brillante y presionado de un grito enfadado o el timbre oscuro de la voz somnolienta) se manifiesta en el timbre y no en el nivel. El susurro se genera sin voicing, como en las grabaciones originales. No se detalla en la información disponible el número de tokens de audio ni la composición exacta del dataset más allá de su origen.

## Capacidades

- Síntesis de voz en alemán con ocho emociones seleccionables por frase: neutral, divertido, enfadado, asqueado, sorprendido, somnoliento, borracho y susurrante.
- Control de esfuerzo vocal: la emoción enfadada produce un timbre más brillante y presionado; la somnolienta, más oscuro.
- Generación de susurro sin voicing.
- Énfasis por palabra mediante la notación `*Wort*`; si no se marca, un modelo auxiliar predice qué palabras enfatizar.
- Entonación y duración muestreadas por fonema mediante flow-matching, lo que evita una melodía única repetida.
- Ajuste de intensidad emocional con `style_strength` (valores superiores a 1 intensifican la emoción).
- Ejecución en CPU gracias a su tamaño reducido y exportación a ONNX.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Audiolibros y narración expresiva: el modelo permite asignar emociones distintas a diálogos y pasajes, y marcar palabras clave con `*Wort*` para dar énfasis, lo que produce una narración menos monótona que una voz Piper estándar.
- Asistentes de voz para alemán en dispositivos sin GPU: al tener ~25M de parámetros y ejecutarse en CPU vía ONNX, puede integrarse en sistemas embebidos, Raspberry Pi o aplicaciones de escritorio con requisitos mínimos de hardware.
- Contenido de entretenimiento y videojuegos: las emociones de susurro, borracho o enfadado permiten generar voces de personajes diferenciadas por estado de ánimo sin grabar múltiples actores.
- Accesibilidad y lectores de pantalla: la variación de entonación y el énfasis automático o manual mejoran la comprensión de textos largos para personas con discapacidad visual.
- Prototipado rápido de interfaces de voz: al ser CC0 y ligero, sirve para validar flujos de TTS expresivo en alemán antes de invertir en modelos mayores.
- Generación de avisos y mensajes con carga emocional controlada: por ejemplo, mensajes de alerta con tono sorprendido o enfadado, o recordatorios con tono somnoliento, ajustando `style_strength` según el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye comparaciones cualitativas mediante muestras de audio (misma frase en ocho emociones frente a la grabación original y frente a una voz Piper estándar), pero no métricas cuantitativas como MOS, MCD ni tasas de error. El autor menciona que la emoción enfadada resulta unos 2 dB menos brillante que el grito de Thorsten, dato cualitativo que no constituye un benchmark formal.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU y se ejecuta sin GPU.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente. En caso de usar GPU, no se especifican requisitos.
- Cabe en tarjetas gráficas de consumo: sí, aunque su uso previsto es CPU; el tamaño del repositorio (~0,1 GB) es mínimo.
- Opciones de despliegue: ONNX Runtime, Piper (el ecosistema nativo del modelo) y cualquier runtime compatible con ONNX. No se detalla soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Emociones | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| x-vits Thorsten emotional | ~25M | 8 seleccionables + énfasis | Alemán | CC0 1.0 | ONNX |
| Thorsten-Voice Piper-Scratch (base) | ~25M (no confirmado) | Promedio de emociones, sin control | Alemán | no disponible en la información | Piper/VITS |
| Piper estándar (voces alemanas) | Variable, típicamente decenas de millones | Una sola expresión | Alemán | Variable según voz | ONNX |

La comparación principal que ofrece el autor es contra Piper-Scratch afinado con Piper/VITS sobre las mismas grabaciones emocionales, que aprende un promedio de las ocho emociones y no puede susurrar, gritar ni arrastrar las palabras bajo demanda. No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con otras voces TTS.

## Limitaciones y advertencias

- Solo soporta alemán; no hay capacidades multilingües.
- Es un modelo TTS, no un modelo de lenguaje: no genera texto, razonamiento, código ni admite tool calling.
- La emoción enfadada resulta aproximadamente 2 dB menos brillante que las grabaciones originales de Thorsten, según el autor.
- Las grabaciones están normalizadas en sonoridad, por lo que el esfuerzo vocal se refleja en el timbre y no en el volumen; esto puede limitar la percepción de intensidad en algunos contextos.
- No se detallan sesgos del dataset más allá de su origen (voces de Thorsten), lo que puede limitar la diversidad de timbres.
- Riesgo de artefactos en emociones extremas o con `style_strength` muy alto, no cuantificado en la información disponible.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero conviene verificar la procedencia del dataset OpenSLR 110 y del modelo base.
- No hay datos publicados de latencia, throughput ni métricas de calidad objetivas, lo que dificulta evaluar su idoneidad en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdemelo/x-vits-thorsten-emotional
- Repositorio x-vits: https://github.com/femelo/x-vits
- Modelo base Thorsten-Voice Piper-Scratch: https://huggingface.co/Thorsten-Voice/Piper-Scratch
- Dataset emocional (OpenSLR 110): https://www.openslr.org/110/
- Piper (rhasspy): https://github.com/rhasspy/piper
- Muestras de audio: https://huggingface.co/fdemelo/x-vits-thorsten-emotional/resolve/main/samples/
