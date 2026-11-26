# efficient-speech/VibeVoice-ASR-MLX-INT4

## Resumen

VibeVoice-ASR-MLX-INT4 es una conversión cuantizada a 4 bits del modelo de reconocimiento automático del habla VibeVoice-ASR de Microsoft, publicada por el colectivo efficient-speech. El modelo transcribe voz a texto incorporando marcas de tiempo y etiquetas de hablante (diarización), lo que lo sitúa en la categoría de ASR enriquecido para audio de formato largo. Con 8.330.325.888 parámetros en pesos safetensors y un repositorio de 5,7 GB, se distribuye en formato MLX para ejecución eficiente en hardware Apple Silicon.

La relevancia de esta variante radica en su cuantización: los pesos del backbone de texto se convierten a 4 bits con cuantización afín por grupos de 64, mientras que el codificador de audio permanece en BF16. Esto reduce la huella de memoria sin degradar la rama acústica, un compromiso habitual en pipelines ASR donde el encoder procesa señales continuas y el decoder genera tokens discretos. El tokenizador de texto incluido procede de Qwen2.5-7B, bajo licencia Apache 2.0.

La publicación acompaña a Murmur, un sistema de inferencia para reconocimiento de voz de formato largo desarrollado por uw-syfi, y se ha validado con `mlx-audio==0.6.8`. La licencia MIT facilita su integración en productos comerciales, aunque el ecosistema MLX limita su despliegue a equipos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base VibeVoice-ASR de Microsoft; encoder de audio + backbone de texto tipo transformer) |
| Parametros totales | 8.330.325.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afín por grupos de 64 en el backbone de texto; BF16 en el encoder de audio |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza ASR: un modelo de reconocimiento del habla que produce transcripciones con marcas de tiempo y etiquetas de hablante. La conversión de efficient-speech separa dos componentes con tratamientos de precisión distintos: el backbone de texto se cuantiza a 4 bits con cuantización afín en grupos de 64, mientras que el encoder de audio conserva pesos BF16. Esta asimetría sugiere que el encoder requiere mayor fidelidad numérica para preservar la información acústica.

El tokenizador de texto proviene de Qwen2.5-7B (Apache 2.0), lo que indica que el backbone de texto emplea un vocabulario compatible con la familia Qwen2.5. Los shards de pesos serializados coinciden byte a byte con el checkpoint MLX de referencia de mlx-community, lo que garantiza equivalencia con la conversión comunitaria previa. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático del habla con salida de transcripción textual.
- Generación de marcas de tiempo alineadas con el audio transcrito.
- Etiquetado de hablantes (diarización) en la transcripción.
- Procesamiento de audio de formato largo, según el caso de uso declarado del sistema Murmur.
- Ejecución en hardware Apple Silicon mediante el framework MLX.
- Inferencia mediante `mlx-audio` con el comando `python -m mlx_audio.stt.generate`.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones con diarización: el modelo etiqueta cada intervención con su hablante y marca temporal, lo que permite generar actas automáticas con atribución de turnos en entornos de hardware Apple.
- Subtitulado de vídeo y pódcasts: las marcas de tiempo por segmento facilitan la generación de ficheros de subtítulos alineados sin necesidad de un alineador forzado adicional.
- Análisis de entrevistas cualitativas: investigadores pueden transcribir horas de audio con separación de entrevistador y entrevistado, agilizando la codificación temática posterior.
- Documentación clínica dictada: la transcripción con marcas temporales permite revisar pasajes concretos de una consulta sin recorrer el audio completo, siempre que se cumplan los requisitos regulatorios del sector sanitario.
- Accesibilidad en aplicaciones nativas de macOS: integración vía MLX para transcribir audio en tiempo casi real en portátiles Apple, sin depender de servicios en la nube.
- Archivado y búsqueda de contenido audiovisual: la combinación de transcripción, timestamps y hablantes permite indexar catálogos de audio y habilitar búsqueda por fragmentos.
- Pipelines de investigación en ASR: el modelo sirve como referencia cuantizada para experimentar con el sistema Murmur en reconocimiento de voz de formato largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,7 GB en pesos cuantizados a 4 bits más encoder BF16; la memoria unificada necesaria para inferencia será del orden de esa cifra más el overhead de activaciones y del runtime MLX.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (series M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en consumer GPU: no aplica en el sentido habitual; el despliegue objetivo son equipos Apple con memoria unificada suficiente para alojar los 5,7 GB de pesos.
- Opciones de despliegue: `mlx-audio==0.6.8` mediante `python -m mlx_audio.stt.generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VibeVoice-ASR-MLX-INT4 (este) | 8.330.325.888 | No disponible | safetensors MLX 4 bits | MIT | Cuantización 4 bits del backbone de texto, encoder BF16 |
| microsoft/VibeVoice-ASR | No disponible | No disponible | No disponible | No disponible en la información | Modelo base original de Microsoft |
| mlx-community/VibeVoice-ASR-4bit | No disponible | No disponible | safetensors MLX 4 bits | No disponible en la información | Checkpoint MLX de referencia; shards idénticos byte a byte |

No se dispone de datos de rendimiento comparado con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- El modelo está empaquetado exclusivamente para MLX, por lo que no puede ejecutarse en GPU NVIDIA, AMD ni en CPU convencional sin reconversión.
- La cuantización a 4 bits del backbone de texto puede introducir degradación en la transcripción respecto al modelo original en BF16; no se han publicado evaluaciones de la pérdida de calidad.
- No se documentan los idiomas soportados, lo que impide garantizar cobertura multilingüe en producción.
- No se dispone de información sobre sesgos acústicos o demográficos del modelo base.
- Como todo sistema ASR, existe riesgo de errores en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no se han publicado tasas de error.
- La licencia MIT del artefacto convive con la licencia del modelo base de Microsoft, que no se detalla en la información disponible; conviene verificar los términos del modelo original antes de un uso comercial.
- El tokenizador de Qwen2.5-7B se distribuye bajo Apache 2.0, independiente de la licencia del modelo.
- No se documentan límites de duración de audio ni de longitud de contexto; el caso de uso declarado es audio de formato largo, pero sin cifras concretas.

## Enlaces

- Hugging Face: https://huggingface.co/efficient-speech/VibeVoice-ASR-MLX-INT4
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR/tree/d0c9efdb8d614685062c04425d91e01b6f37d944
- Checkpoint MLX de referencia: https://huggingface.co/mlx-community/VibeVoice-ASR-4bit/tree/a1a15cb6c7b70f76b588af7e12f6fab34d5ab654
- Tokenizador Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B/tree/d149729398750b98c0af14eb82c78cfe92750796
- Sistema Murmur: https://github.com/uw-syfi/Murmur
