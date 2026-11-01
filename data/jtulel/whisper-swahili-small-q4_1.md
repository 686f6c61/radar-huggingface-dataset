# JTulel/whisper-swahili-small-q4_1

## Resumen

Whisper Swahili Small q4_1 es una conversión al formato GGML con cuantización q4_1 del modelo PaschalK/whisper-swahili-small, un ajuste fino de Whisper Small especializado en reconocimiento automático del habla en suajili. Lo publica el usuario JTulel en HuggingFace y su propósito es permitir la inferencia en dispositivos locales mediante whisper.cpp, evitando la dependencia de infraestructura GPU en la nube.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper Small, con aproximadamente 244 millones de parámetros en su versión original, y está entrenado exclusivamente para transcribir audio en suajili. La cuantización q4_1 reduce el peso del repositorio a unos 0,2 GB, lo que lo hace viable en hardware modesto, aunque a costa de una pérdida de precisión frente a los pesos originales en fp16.

Su relevancia radica en la combinación de un idioma de bajos recursos como el suajili con un formato optimizado para despliegue en el borde (edge). No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y no se han publicado métricas de evaluación ni detalles sobre el proceso de conversión, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | no disponible (el modelo base Whisper Small tiene ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | q4_1 (GGML) |
| Idiomas soportados | suajili (sw) |
| Licencia | MIT |
| Formato de pesos | GGML (q4_1) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small: un transformer encoder-decoder con atención multi-cabeza, entrenado originalmente por OpenAI para transcripción y traducción de voz. El modelo base PaschalK/whisper-swahili-small es un ajuste fino de ese checkpoint sobre datos de audio en suajili, aunque la información disponible no detalla el volumen de horas de audio, la composición del dataset ni si se aplicaron técnicas de aumento de datos o regularización.

La versión aquí descrita es una conversión a GGML con cuantización q4_1, un esquema de 4 bits con escala por bloque que reduce el tamaño de los pesos aproximadamente a una cuarta parte del original en fp16. No se documenta el proceso de conversión, la herramienta empleada (presumiblemente el script de conversión de whisper.cpp) ni si se realizó validación de la calidad de transcripción tras la cuantización. Tampoco hay información sobre RLHF, DPO ni otras fases de alineación.

## Capacidades

- Transcripción de audio en suajili a texto, con detección implícita del idioma configurada para sw.
- Reconocimiento de voz en entornos con ruido moderado, heredado de la robustez de Whisper Small.
- Procesamiento de segmentos de audio de hasta 30 segundos por ventana, con posibilidad de concatenar ventanas para audios más largos.
- Ejecución en CPU y dispositivos de bajos recursos gracias al formato GGML cuantizado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al suajili; no se garantiza un rendimiento aceptable en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en suajili: el modelo puede procesar grabaciones divididas en ventanas de 30 segundos y generar actas o resúmenes posteriores, con la ventaja de ejecutarse localmente sin enviar audio sensible a la nube.
- Subtitulado automático de vídeo en suajili: integrado en un pipeline de whisper.cpp, permite generar ficheros de subtítulos para contenido educativo o divulgativo, aunque requiere revisión humana por la pérdida de precisión de la cuantización q4_1.
- Asistentes de voz en dispositivos empotrados: al ocupar unos 0,2 GB, cabe en placas como Raspberry Pi o en móviles de gama media, lo que facilita interfaces de voz offline en suajili para aplicaciones de accesibilidad.
- Digitalización de archivos orales: bibliotecas y archivos sonoros con material en suajili pueden transcribir colecciones completas en local, reduciendo costes de infraestructura frente a APIs comerciales.
- Atención al cliente en centros de llamadas: transcripción de conversaciones telefónicas para análisis de calidad y extracción de temas, siempre que se acepte la merma de exactitud del cuantizado y se valide con muestras reales.
- Investigación lingüística: generación de corpus transcritos de suajili para estudios de fonética, morfología o sociolingüística, con la ventaja de que la licencia MIT permite redistribuir las transcripciones derivadas.
- Prototipado rápido en entornos sin GPU: desarrolladores que quieran evaluar la viabilidad de un sistema de ASR en suajili pueden desplegar este GGML en un portátil convencional antes de invertir en el modelo completo en fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser GGML q4_1 de ~0,2 GB, la inferencia puede ejecutarse íntegramente en RAM; se recomienda al menos 1 GB de RAM libre para el modelo y los buffers de audio.
- GPU recomendadas: no requiere GPU; funciona en CPU. Si se dispone de GPU, cualquier tarjeta con más de 2 GB de VRAM puede alojar el modelo, aunque whisper.cpp no explota al máximo la aceleración GPU.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con más de 2 GB de VRAM, e incluso en iGPU.
- Opciones de despliegue: whisper.cpp es el runtime nativo para este formato; también puede cargarse mediante bindings de Python (whispercpp) o integrarse en aplicaciones móviles con las librerías de whisper.cpp.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud del audio. En una CPU moderna se espera un tiempo de transcripción del orden de la duración del audio o inferior, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| JTulel/whisper-swahili-small-q4_1 | ~244 M (cuantizado q4_1) | ventanas de 30 s | suajili | MIT | GGML |
| PaschalK/whisper-swahili-small | ~244 M | ventanas de 30 s | suajili | no disponible | safetensors (presumiblemente) |
| openai/whisper-small | ~244 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT | safetensors, GGML |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT | safetensors, GGML |

La comparativa se limita a parámetros, contexto, idiomas, licencia y formato porque no hay datos de rendimiento publicados para el modelo objeto de la ficha. Frente a whisper-small original, este checkpoint gana especialización en suajili pero pierde cobertura multilingüe; frente a la versión sin cuantizar de PaschalK, la q4_1 reduce el tamaño a costa de precisión.

## Limitaciones y advertencias

- La cuantización q4_1 introduce pérdida de precisión en la transcripción; no se ha documentado ninguna evaluación comparativa frente al modelo en fp16.
- El modelo solo está entrenado para suajili; producirá transcripciones incorrectas o alucinaciones si se le alimenta audio en otros idiomas.
- Riesgo de alucinación típico de Whisper en segmentos de silencio, ruido o audio musical, que puede generar texto inventado.
- Sesgos conocidos: no documentados, pero al derivar de Whisper Small hereda los sesgos de su dataset de entrenamiento original, que no está detallado en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base PaschalK/whisper-swahili-small, que no se especifica.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso en producción ni validación por la comunidad.
- No se documenta el proceso de conversión ni la herramienta exacta, lo que dificulta reproducir el artefacto o auditarlo.
- Para audio de más de 30 segundos es necesario segmentar manualmente; no hay gestión automática de contexto largo en este formato.

## Enlaces

- HuggingFace: https://huggingface.co/JTulel/whisper-swahili-small-q4_1
- Modelo base: https://huggingface.co/PaschalK/whisper-swahili-small
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
