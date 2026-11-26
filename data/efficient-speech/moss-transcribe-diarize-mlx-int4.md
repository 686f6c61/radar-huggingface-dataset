# efficient-speech/MOSS-Transcribe-Diarize-MLX-INT4

## Resumen

MOSS-Transcribe-Diarize-MLX-INT4 es una versión cuantizada del modelo OpenMOSS-Team/MOSS-Transcribe-Diarize, publicada por el usuario efficient-speech. Se trata de un modelo de reconocimiento automático del habla (ASR) que transcribe audio incorporando marcas temporales y etiquetas de hablante (diarización), es decir, resuelve conjuntamente la transcripción y la atribución de cada segmento a un interlocutor. La relevancia de esta ficha concreta radica en su formato: los pesos han sido convertidos a MLX (el framework de Apple para silicio unificado) y cuantizados a 4 bits, lo que permite ejecutar el modelo en equipos Mac con memoria unificada.

El modelo cuenta con 908.513.280 parámetros totales y un repositorio de aproximadamente 1,0 GB. La cuantización INT4 se aplica únicamente al backbone de texto en grupos de 64, mientras que los pesos del codificador de audio se conservan en BF16, una decisión de compromiso que preserva la calidad de la representación acústica y reduce el coste del decodificador lingüístico. La licencia es Apache 2.0 y la librería declarada es `mlx`, con pipeline `automatic-speech-recognition`.

Esta release acompaña a Murmur, un sistema de inferencia para reconocimiento de habla de formato largo, e incluye instrucciones para usar un runtime independiente de MOSS en MLX para transcripción local. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con encoder de audio y backbone de texto; detalles de arquitectura no especificados) |
| Parámetros totales | 908.513.280 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 afín (affine) en grupos de 64 sobre el backbone de texto; encoder de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MOSS-Transcribe-Diarize más allá de que combina un codificador de audio con un backbone de texto para producir transcripciones con marcas temporales y etiquetas de hablante. La operación realizada por efficient-speech consiste en la conversión de los pesos originales al formato MLX y la aplicación de cuantización afín de 4 bits en grupos de 64 sobre el backbone de texto, manteniendo el encoder de audio en BF16. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo etapas de RLHF o DPO.

Como innovación destacable en esta release, la cuantización selectiva (solo el backbone de texto) busca equilibrar la reducción de memoria y el mantenimiento de la calidad de transcripción, ya que el encoder de audio suele ser más sensible a la pérdida de precisión. El modelo se enmarca en el sistema Murmur para reconocimiento de habla de formato largo, lo que sugiere capacidad de procesar audio extenso, aunque no se aportan detalles técnicos sobre la estrategia de segmentación o ventana.

## Capacidades

- Transcripción automática del habla con marcas temporales.
- Diarización de hablantes: etiquetado de cada segmento con el interlocutor correspondiente.
- Procesamiento de audio de formato largo (según el contexto del sistema Murmur).
- Ejecución local en Apple Silicon mediante MLX.
- Cuantización INT4 para reducir el uso de memoria en el backbone de texto.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión, audio de entrada adicional ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo genera transcripciones con marcas temporales y separación por hablante, lo que permite construir actas automáticas y resúmenes atribuidos a cada participante en entornos de oficina o equipos distribuidos.
- Subtitulado y postproducción de audio: las marcas temporales y la diarización facilitan la generación de subtítulos alineados y la identificación de voces en podcasts, entrevistas o material audiovisual.
- Análisis de entrevistas de investigación: en estudios cualitativos, la diarización permite segmentar automáticamente las intervenciones de entrevistador y entrevistado, agilizando el etiquetado posterior.
- Atención al cliente y análisis de llamadas: la transcripción con etiquetas de hablante permite separar agente y cliente en grabaciones de call center para control de calidad y análisis de conversaciones.
- Documentación clínica o legal: en entornos donde se graban consultas o declaraciones, la transcripción con marcas temporales y hablantes ayuda a localizar fragmentos concretos y a mantener trazabilidad de quién dijo qué.
- Transcripción local en Mac: gracias al formato MLX e INT4, el modelo puede ejecutarse en equipos Apple Silicon sin depender de servicios en la nube, lo que resulta adecuado para datos sensibles que no deben salir del dispositivo.
- Investigación en ASR y diarización: el modelo sirve como base para experimentos de cuantización y evaluación de calidad en pipelines de reconocimiento de habla con separación de hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa aproximadamente 1,0 GB, lo que sugiere un uso de memoria en el orden de 1-2 GB para los pesos cuantizados, sin contar activaciones ni buffers de audio.
- GPU recomendadas: al ser un modelo MLX, está orientado a Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada.
- Compatibilidad con GPU de consumo: no se especifica soporte para GPU NVIDIA o AMD en esta release; el formato MLX limita su ejecución a hardware Apple.
- Opciones de despliegue: runtime independiente `mlx-MOSS-Transcribe-Diarize` y el sistema Murmur para reconocimiento de habla de formato largo; el comando de ejemplo es `mtd-mlx recording.wav --strict --model efficient-speech/MOSS-Transcribe-Diarize-MLX-INT4`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con alternativas concretas de la misma categoría (ASR con diarización en formato MLX/INT4). Los datos de parámetros, contexto y rendimiento de posibles competidores no se han proporcionado, por lo que la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize-MLX-INT4 | 908.513.280 | no disponible | Apache 2.0 | safetensors (MLX, INT4) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo base ni de esta versión cuantizada.
- Riesgo de alucinación en la transcripción: como todo modelo generativo de ASR, puede producir texto no presente en el audio, especialmente en segmentos con ruido o solapamiento de voces.
- La cuantización INT4 del backbone de texto puede degradar la calidad de transcripción respecto al modelo original en BF16; no se aportan métricas comparativas.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Longitud de contexto no disponible: se desconoce el límite de audio procesable en una sola pasada y si requiere segmentación externa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base OpenMOSS-Team/MOSS-Transcribe-Diarize y de las dependencias del runtime.
- El formato MLX restringe el despliegue a hardware Apple Silicon; no es directamente portable a GPU NVIDIA sin conversión adicional.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficient-speech/MOSS-Transcribe-Diarize-MLX-INT4
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Revisión concreta del modelo base referenciada: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize/tree/10304d926740cf5a5cee05a268086e3265197910
- Sistema Murmur: https://github.com/uw-syfi/Murmur
- Runtime MLX para MOSS-Transcribe-Diarize: https://github.com/vanch007/mlx-MOSS-Transcribe-Diarize/tree/d2546316f76e93947e8d99a17fb88652f8ad6ab2
