# prasadvittaldev/pocket-tts-telugu-female-syspin

## Resumen

Pocket TTS — Telugu es un modelo de síntesis de voz (text-to-speech) para el idioma telugu, desarrollado por Prasad Vittaldev a partir de la arquitectura pocket-tts de Kyutai Labs. Está diseñado para ejecutarse en tiempo real únicamente con CPU, sin necesidad de GPU, y se distribuye bajo licencia MIT. El modelo cuenta con aproximadamente 110 millones de parámetros, una única voz femenina fija (`syspin_female`) y una frecuencia de muestreo de 24 kHz.

Su relevancia radica en que cubre un idioma indio (telugu) que no estaba soportado por el modelo original de Kyutai, manteniendo las ventajas de este: tamaño reducido, inferencia rápida en CPU, uso on-device y sin dependencia de APIs externas. El autor ha realizado un proceso completo de adaptación: finetuning de un teacher de 24 capas sobre 124 horas de habla telugu, alineación forzada en escritura telugu nativa y destilación a un modelo de 6 capas entrenado con 53 horas de un único hablante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pocket-tts: backbone de 6 capas flow-matching + codec Mimi |
| Parametros totales | 109.502.146 (~110M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | float32, bfloat16, int8 dinámico (aplicado en carga) |
| Idiomas soportados | telugu (te) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `model_bf16.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pocket-tts de Kyutai: un backbone de 6 capas basado en flow-matching que genera representaciones acústicas, combinado con el codec Mimi para producir audio a 24 kHz. El proceso de entrenamiento se realizó en tres fases: primero se finetuneó el modelo teacher de 24 capas (originalmente entrenado en inglés) sobre 124 horas de habla telugu durante 15.000 pasos, reiniciando el embedding de texto y aprendiendo un tokenizer sentencepiece específico para telugu. Después se realizó alineación forzada a nivel de palabra en escritura telugu nativa, ya que el alineador MMS de Meta romaniza y no contiene caracteres telugu. Finalmente, se destiló el teacher de 24 capas a un estudiante de 6 capas durante 40.000 pasos, utilizando únicamente 53 horas y 20.599 clips de un solo hablante femenino. La destilación en profundidad es la responsable del tamaño reducido: el backbone supone aproximadamente el 96% de los parámetros.

## Capacidades

- Generación de voz en telugu a partir de texto, con una única voz femenina fija (`syspin_female`).
- Inferencia en tiempo real en CPU: 5,5x real-time con cuantización int8 (generar un minuto de audio tarda unos 11 segundos).
- Ejecución on-device sin conexión a internet ni API key.
- Soporte de generación por streaming mediante `generate_audio_stream`.
- Compatible con los formatos float32, bfloat16 e int8 dinámico.
- No soporta clonación de voz: la voz está fijada por la destilación de un solo hablante.
- No soporta otros idiomas; únicamente telugu.

## Casos de uso

- Accesibilidad para hablantes de telugu: conversión de texto a voz en aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual, ejecutable en dispositivos de bajo coste sin GPU.
- Audiolibros y contenido educativo: generación de narración en telugu para libros, cursos o materiales de e-learning, con la ventaja de poder procesarse localmente sin costes por carácter.
- Asistentes de voz en dispositivos embebidos: integración en asistentes personales o dispositivos IoT que requieran síntesis de voz en telugu y operen con recursos limitados (CPU, poca RAM).
- Sistemas de respuesta interactiva (IVR): locución automática en telugu para centralitas telefónicas o sistemas de atención al cliente, con baja latencia y sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de voz: desarrollo de demos o MVPs que necesiten voz en telugu, gracias a la facilidad de uso mediante la CLI de pocket-tts y la licencia MIT.
- Investigación en TTS para lenguas indias: como punto de partida para experimentos de destilación, adaptación a otros idiomas o evaluación de calidad de síntesis en telugu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No obstante, la model card reporta una velocidad de inferencia medida de 5,5x real-time en CPU (int8) sobre escritorio x86, y 3,5x real-time en float32 o bfloat16. También se documenta que la voz del modelo permanece estable (dentro de una banda de 9 Hz) ante diferentes prompts de referencia, a diferencia del teacher que sí sigue el tono del prompt.

## Requisitos de hardware

- No requiere GPU: el modelo está diseñado para ejecutarse en CPU.
- Memoria RAM estimada según precisión:
  - float32: ~418 MB (tamaño del archivo `model.safetensors`).
  - bfloat16: ~209 MB (tamaño del archivo `model_bf16.safetensors`).
  - int8 dinámico: ~110 MB en memoria (aplicado en carga con `--quantize`).
- Velocidad en CPU de escritorio x86: 3,5x real-time en float32/bf16, 5,5x real-time en int8.
- Despliegue mediante la librería `pocket-tts` (pip install pocket-tts), con interfaz CLI (`python -m pocket_tts generate`) y API Python (`TTSModel.load_model`).
- No se requieren GPUs específicas; cualquier CPU moderna con suficiente RAM puede ejecutar el modelo.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos TTS telugu comparables en cuanto a parámetros, contexto, rendimiento o licencia dentro de los datos proporcionados. El modelo original de Kyutai (pocket-tts) es la base, pero solo soporta lenguas europeas y no se han facilitado sus especificaciones detalladas para una comparación cuantitativa.

## Limitaciones y advertencias

- Voz fija: el modelo fue destilado sobre un único hablante y no admite clonación de voz; cualquier prompt de referencia distinto no altera la voz generada.
- Texto largo: el tokenizador telugu no produce los marcadores de fin de oración que pocket-tts espera, por lo que el modelo puede descartar palabras si se le pasa un pasaje completo. Es necesario dividir el texto en frases (separadas por `.`, `?` o `!`) antes de la generación.
- Solo telugu: no soporta otros idiomas ni mezcla de lenguas.
- Sin benchmarks públicos: no se han publicado evaluaciones formales de calidad de voz (MOS, etc.) en la información disponible.
- Dependencia de la librería pocket-tts: el modelo requiere la instalación de `pocket-tts` y su ecosistema; no es un modelo autónomo.
- Descargas y adopción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy temprana o nula.

## Enlaces

- [HuggingFace: prasadvittaldev/pocket-tts-telugu-female-syspin](https://huggingface.co/prasadvittaldev/pocket-tts-telugu-female-syspin)
- [Repositorio pocket-tts de Kyutai Labs](https://github.com/kyutai-labs/pocket-tts)
- [Perfil de LinkedIn del autor (Prasad Vittaldev)](https://in.linkedin.com/in/prasadvittaldev)
- [Publicación en LinkedIn sobre el modelo](https://www.linkedin.com/posts/prasadvittaldev_voiceai-tts-telugu-activity-7499849463151280129-Aski)
