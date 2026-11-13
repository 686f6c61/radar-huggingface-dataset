# LinguaSpanApp/whisper-medium-beard-encoder-yoruba-nov11

## Resumen

El modelo `LinguaSpanApp/whisper-medium-beard-encoder-yoruba-nov11` es un checkpoint de la familia Whisper, concretamente la variante `medium`, publicado en Hugging Face por el usuario LinguaSpanApp. Por el identificador y la nomenclatura del repositorio, se trata de un ajuste fino (fine-tuning) del encoder de Whisper orientado a reconocimiento automático de voz en yoruba, aunque la model card no documenta ni el proceso de entrenamiento ni los datos utilizados. El modelo se distribuye en formato `safetensors` con 763.857.920 parámetros, lo que coincide con el tamaño estándar de Whisper medium.

La relevancia de este checkpoint es limitada y debe interpretarse con cautela: el repositorio no presenta descargas ni interacciones, la model card es la plantilla autogenerada por Hugging Face sin información sustantiva, y no se declara licencia ni idiomas soportados. Aun así, el interés técnico reside en que ejemplifica un patrón habitual en el ecosistema open source: adaptaciones de Whisper a lenguas de bajos recursos (en este caso el yoruba, hablado por unos 45 millones de personas) mediante ajuste del encoder, una estrategia que busca mejorar la representación acústica sin reentrenar el decodificador completo.

Whisper medium es un transformer encoder-decoder entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe, con 769 millones de parámetros y una ventana de audio de 30 segundos. Este checkpoint concreto hereda esa arquitectura, pero la ausencia de documentación impide confirmar qué partes del modelo fueron modificadas, con qué corpus se ajustó ni qué métricas de error alcanza en yoruba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio estándar de Whisper: 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador sugiere yoruba) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con atención multi-cabecera estándar, entrenado originalmente sobre 680.000 horas de audio débilmente supervisado y orientado a tareas de transcripción, traducción y detección de idioma. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para idioma, tarea y marcas de tiempo.

Sin embargo, para este checkpoint concreto no se dispone de información sobre el proceso de ajuste fino: no se documentan los datos de entrenamiento, el número de tokens o horas de audio, la composición del corpus yoruba, si se congelaron capas del decoder o si se aplicó algún tipo de regularización. El nombre del repositorio (`beard-encoder-yoruba`) sugiere una intervención sobre el encoder, pero no hay evidencia publicada que lo confirme ni hiperparámetros declarados. Tampoco se indica si hubo evaluación con WER (word error rate) sobre conjuntos de test en yoruba.

## Capacidades

- Reconocimiento automático de voz (ASR): pipeline declarado `automatic-speech-recognition`, orientado a transcribir audio en yoruba según el identificador del repositorio.
- Hereda las capacidades del decoder de Whisper medium: generación de texto condicionada al audio, marcas de tiempo y detección de idioma, aunque no se confirma que estas funciones se conserven tras el ajuste.
- Soporte de tool calling / function calling: no disponible (Whisper no es un modelo de instrucciones general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no confirmadas; el identificador apunta a un uso específico en yoruba.
- Capacidades especiales (thinking mode, visión, audio bidireccional): no disponible.

## Casos de uso

- Transcripción de audio en yoruba: uso directo del pipeline ASR para convertir grabaciones en texto, aprovechando la ventana de 30 segundos por segmento de Whisper medium y el ajuste declarado sobre esta lengua.
- Subtitulado de contenido audiovisual en yoruba: generación de transcripciones con marcas de tiempo para vídeos, pódcast o material educativo, siempre que se valide empíricamente el WER en el dominio objetivo.
- Investigación en lenguas de bajos recursos: punto de partida para experimentos de adaptación de Whisper a yoruba, comparando estrategias de fine-tuning del encoder frente a ajustes completos.
- Procesamiento de archivos de archivo oral: digitalización y búsqueda sobre grabaciones históricas o etnográficas en yoruba, con revisión humana posterior dado el riesgo de errores.
- Integración en pipelines de accesibilidad: transcripción en tiempo casi real de reuniones o clases en yoruba, con latencia dependiente del hardware y del tamaño del modelo (763 M de parámetros).
- Evaluación comparativa de checkpoints: uso como referencia en estudios que midan el impacto de ajustar solo el encoder frente a ajustar el modelo completo en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6 GB solo para pesos (763 M de parámetros), más memoria para activaciones y buffers de audio; en la práctica, entre 2 y 4 GB según el framework y el tamaño de lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8 GB para pesos; en 4 bits, unos 0,4 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o baja latencia, A100 o H100 aportan margen, aunque el modelo es pequeño para esas GPUs.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más (GTX 1650 Super, RTX 2060, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`, `faster-whisper` (si el checkpoint es compatible con CTranslate2, no confirmado), `whisper.cpp` (requiere conversión a GGML, no verificada) y servidores de inferencia como TGI o vLLM (compatibilidad con Whisper variable según versión).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| LinguaSpanApp/whisper-medium-beard-encoder-yoruba-nov11 | 763.857.920 | 30 s (heredado de Whisper) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-medium | 769 M | 30 s | MIT (según el repositorio original de OpenAI) | Hugging Face, ampliamente usado |
| openai/whisper-small | 244 M | 30 s | MIT | Hugging Face |
| Modelos ASR específicos para yoruba (p. ej. ajustes comunitarios de Whisper o wav2vec2) | variable | variable | variable | variable; no se dispone de comparación verificada |

No se dispone de datos de rendimiento comparativo (WER) para este checkpoint frente a las alternativas, por lo que la comparación se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- Model card autogenerada y sin información sustantiva: no se documentan datos de entrenamiento, licencia, idiomas ni evaluación.
- Licencia no declarada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de desplegarlo en producción.
- Cero descargas y cero interacciones: no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación en transcripciones: los modelos Whisper pueden generar texto plausible no presente en el audio, especialmente con ruido o acentos no vistos en entrenamiento.
- Sesgos potenciales derivados del corpus de ajuste, desconocido; puede haber peor rendimiento en variantes dialectales del yoruba o en habla con code-switching.
- Ventana de audio limitada a 30 segundos por segmento (heredada de Whisper), lo que requiere segmentación para audios largos.
- No se confirma compatibilidad con backends optimizados (faster-whisper, whisper.cpp); habría que verificarla empíricamente.
- Fecha de creación en el Hub (2026-11-13) posterior a la fecha de referencia habitual; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/LinguaSpanApp/whisper-medium-beard-encoder-yoruba-nov11
- Paper de referencia de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
