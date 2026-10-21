# Hebrish/Sabich-MLX

## Resumen

Sabich-MLX es la versión convertida al framework MLX del modelo Hebrish/Sabich, un sistema de reconocimiento automático del habla (ASR) especializado en *code-switching* entre hebreo e inglés, es decir, en audio donde el hablante alterna ambos idiomas dentro de la misma frase. El modelo lo publica el usuario Hebrish en HuggingFace y se distribuye con licencia CC-BY-4.0 y acceso restringido (gated), por lo que es necesario aceptar las condiciones en la página del repositorio antes de descargarlo.

Con 617.869.958 parámetros (aproximadamente 618 M), se sitúa en la gama de modelos ASR compactos, comparable en orden de magnitud a la familia Parakeet de NVIDIA, a la que apunta el tag `parakeet` del repositorio. El formato publicado son pesos safetensors quantizados para MLX, lo que limita su ejecución nativa a hardware Apple Silicon (serie M). El repositorio ocupa 2,5 GB.

Su relevancia es doble: por un lado cubre un caso poco atendido por los modelos ASR mayoritarios, el habla bilingüe hebreo-inglés; por otro, ofrece una ruta de inferencia local en Mac mediante MLX. Como contrapartida, no se han publicado resultados de benchmarks ni métricas de WER en la información disponible, y el modelo no registra descargas ni valoraciones, por lo que debe considerarse una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El tag `parakeet` sugiere arquitectura de la familia Parakeet (encoder tipo FastConformer/Conformer con decoder de transcripción), pero la model card no especifica la topología exacta |
| Parametros totales | 617.869.958 (≈618 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Al ser un modelo ASR, el límite relevante es la ventana de audio, que no se documenta |
| Tipos de cuantizacion | Pesos quantizados para MLX (tag `base_model:quantized:Hebrish/Sabich`). El número de bits y el esquema de cuantización no se indican |
| Idiomas soportados | Inglés (en) y hebreo (he), con soporte explícito de code-switching entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (formato MLX) |
| Pipeline | automatic-speech-recognition |
| Libreria | mlx |
| Tamano del repositorio | 2,5 GB |
| Modelo base | Hebrish/Sabich |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

La información disponible no incluye una descripción técnica de la arquitectura ni de la composición del dataset de entrenamiento. El tag `parakeet` del repositorio apunta a la familia de modelos ASR Parakeet, construida sobre encoders convolucionales autoatendidos (FastConformer/Conformer), pero este dato procede de las etiquetas del modelo y no de una model card detallada. Tampoco se especifican el número de horas de audio empleadas, la proporción de audio monolingüe frente a code-switched, ni si se aplicaron técnicas de aumento de datos o de adaptación desde un checkpoint previo.

Sí se puede afirmar, a partir de los metadatos, que Sabich-MLX deriva de Hebrish/Sabich mediante un proceso de conversión y cuantización para MLX, y que el resultado se distribuye únicamente en safetensors. El tamaño del repositorio (2,5 GB) es aproximadamente el doble de lo que ocuparían los pesos en fp16 (≈1,24 GB), lo que sugiere la presencia de varios ficheros de precisión o de artefactos adicionales de conversión, aunque el desglose no está documentado. No consta información sobre RLHF, DPO ni sobre técnicas de decodificación específicas (por ejemplo, decodificación especulativa o beam search con modelo de lenguaje externo).

## Capacidades

- Reconocimiento automático del habla en hebreo e inglés, con foco declarado en audio con alternancia de idiomas intra-frase (code-switching).
- Transcripción de audio a texto con puntuación y segmentación dependientes del modelo base, no documentadas en detalle.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Capacidad multilingüe limitada a los dos idiomas del repositorio; no se declara soporte para otras lenguas.
- No se documenta soporte de tool calling ni function calling: es un modelo ASR, no un modelo de lenguaje instruido.
- No se documenta capacidad de agentes, razonamiento multi-paso ni modos de "pensamiento".
- No se documenta capacidad de visión, audio generativo ni diálogo; la salida esperada es texto transcrito.
- No se documenta detección de idioma por segmento, diarización de hablantes ni timestamps a nivel de palabra.

## Casos de uso

- Transcripción de reuniones bilingües hebreo-inglés: el modelo está entrenado específicamente para audio donde los participantes alternan idiomas, un escenario en el que los ASR monolingües suelen producir errores al cambiar de lengua a mitad de frase.
- Subtitulado de contenido audiovisual israelí: entrevistas, pódcast y vídeos divulgativos en los que se intercalan términos técnicos en inglés con la conversación en hebreo.
- Analítica de contact center: transcripción de llamadas de soporte en Israel para su posterior clasificación, búsqueda semántica y control de calidad, aprovechando la ejecución local para no enviar audio sensible a terceros.
- Asistentes de voz y dictado en aplicaciones macOS/iOS: al estar en formato MLX, puede integrarse en un flujo de inferencia on-device en equipos Apple, con los pesos en memoria unificada.
- Anotación y construcción de corpus code-switched: generación de transcripciones preliminares para revisión humana en proyectos de lingüística computacional sobre hebreo-inglés, donde el coste de una primera pasada automática es mucho menor que la transcripción manual.
- Investigación en ASR multilingüe: uso como línea base o punto de comparación en experimentos sobre code-switching, dado su tamaño compacto (≈618 M) y su licencia permisiva CC-BY-4.0.
- Prototipado rápido en un Mac: validación de ideas de producto de voz sin infraestructura de GPU, gracias a la integración con MLX y a un peso en disco de 2,5 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER (word error rate) ni de MER sobre conjuntos hebreo, inglés o code-switched, ni comparaciones con otros modelos ASR. Tampoco se documentan latencia, RTF (real-time factor) ni throughput.

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia calculada a partir del número de parámetros (≈618 M), los pesos ocuparían aproximadamente 1,24 GB en fp16, 0,62 GB en 8 bits y 0,31 GB en 4 bits, a los que hay que sumar memoria para activaciones y buffers de audio. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: el repositorio está en formato MLX, por lo que el hardware objetivo son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada. No se documenta compatibilidad con CUDA.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada; en el ecosistema NVIDIA requeriría conversión previa del checkpoint a otro runtime, no incluida en el repositorio.
- Opciones de despliegue: runtime MLX (librería `mlx`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no cubren de forma estándar este tipo de modelo ASR.
- Latencia y throughput: no disponibles.
- Almacenamiento: 2,5 GB de repositorio, más el espacio temporal necesario durante la descarga y conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / runtime | Acceso |
|---|---|---|---|---|---|
| Hebrish/Sabich-MLX | 617.869.958 | en, he (code-switching) | CC-BY-4.0 | safetensors MLX | Gated |
| Hebrish/Sabich (base) | No disponible en esta ficha | en, he (code-switching) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| NVIDIA Parakeet TDT 0.6B (familia) | ≈600 M | Inglés | CC-BY-4.0 | NeMo `.nemo` / safetensors | Abierto |
| OpenAI Whisper large-v3 | ≈1.550 M | ≈99 idiomas, incluido hebreo e inglés, sin entrenamiento específico para code-switching | MIT | safetensors, GGUF, entre otros | Abierto |

La comparación cuantitativa de calidad (WER) no es posible con la información disponible, porque Sabich-MLX no publica métricas. La diferencia principal frente a Parakeet y Whisper no es de tamaño, sino de especialización: Sabich-MLX declara entrenamiento para alternancia hebreo-inglés, mientras que Parakeet es monolingüe en inglés y Whisper es multilingüe genérico. En cuanto a despliegue, Sabich-MLX está atado a MLX/Apple Silicon, mientras que las alternativas cuentan con ecosistemas de inferencia mucho más amplios.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a Whisper, Parakeet u otros ASR, ni sobre el propio conjunto de evaluación hebreo-inglés.
- Modelo sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay informes independientes de funcionamiento.
- Acceso restringido (gated): la descarga requiere aceptar condiciones en HuggingFace, lo que añade fricción a pipelines automatizados y a la reproducibilidad.
- Dependencia de hardware Apple: los pesos en formato MLX no se ejecutan directamente en GPU NVIDIA o AMD; usarlos fuera del ecosistema Apple exige convertir el checkpoint.
- Cobertura lingüística muy acotada: solo hebreo e inglés. Cualquier otro idioma queda fuera del alcance declarado.
- Riesgo de alucinación específico de ASR: en audio con ruido, solapamiento de hablantes o silencios largos, los modelos de este tipo pueden generar texto no presente en el audio o repetir segmentos.
- Sensibilidad al code-switching real: aunque es el objetivo del modelo, no se documenta el grado de mezcla cubierto ni la distribución del entrenamiento, por lo que el rendimiento puede degradarse con proporciones de mezcla distintas a las vistas en entrenamiento.
- Sin diarización ni timestamps documentados: no apto por sí solo para actas con atribución de hablantes.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y la indicación de cambios; conviene revisar también las condiciones del modelo base Hebrish/Sabich, cuyo régimen de acceso podría ser distinto.
- No apto para uso médico, legal o periodístico sin revisión humana, dado que no existe evaluación de errores en dominios especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Sabich-MLX
- Modelo base: https://huggingface.co/Hebrish/Sabich
- Framework MLX: https://github.com/ml-explore/mlx
- Familia Parakeet de NVIDIA (referencia por el tag del repositorio): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente resultados sin relación con el repositorio.
