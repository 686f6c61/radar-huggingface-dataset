# palli23/wav2vec2-large-spjallromur-v2

## Resumen

wav2vec2-large-spjallromur-v2 es un modelo de reconocimiento automático del habla (ASR) especializado en islandés conversacional, desarrollado por el usuario palli23. Se trata de un fine-tuning del checkpoint `language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h`, que a su vez parte de la arquitectura wav2vec2-large de Meta con adaptación XLSR-53 y fue preentrenado con aproximadamente 967 horas de audio islandés. El ajuste se ha realizado sobre el corpus `palli23/spjallromur-v2`, un conjunto de habla conversacional en islandés creado para el artículo "Spjallrómur: A Dual-Channel Corpus of Conversational Icelandic with Mixing Pipeline and ASR Baselines".

El modelo aborda un problema específico: la transcripción de habla espontánea y conversacional en islandés, un idioma de bajos recursos con pocos modelos ASR disponibles y menos aún orientados a diálogo natural. La relevancia de esta versión (v2) radica en la corrección de un fallo de entrenamiento de la versión anterior: las etiquetas conservaban mayúsculas y puntuación pese a que el vocabulario CTC del modelo base (38 tokens) no podía representarlas, lo que provocaba que el modelo emitiera el token `[UNK]` de forma rutinaria en aproximadamente el 7% de las locuciones de test. Esta versión reentrenada elimina ese comportamiento por completo.

Con 315.477.670 parámetros y un peso de repo de 3,8 GB, el modelo se distribuye en formato safetensors bajo licencia CC-BY-SA-4.0 y está etiquetado exclusivamente para islandés (`is`). Es un modelo de nicho, con 11 descargas y 0 likes en el momento de la consulta, pensado para investigación y aplicaciones de transcripción en islandés más que para uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large con adaptación XLSR-53 (transformer encoder sobre feature encoder convolucional) |
| Parametros totales | 315.477.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por la longitud de la señal, no por un contexto de tokens de texto) |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32/fp16; no se documentan variantes GGUF u otras) |
| Idiomas soportados | islandés (`is`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |
| Vocabulario CTC | 38 tokens (letras islandesas en minúscula, delimitador de palabra, `[UNK]`, `[PAD]`; sin mayúsculas ni puntuación) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2-large: un extractor de características convolucional que convierte la forma de onda en representaciones latentes, seguido de un encoder transformer y una cabeza de clasificación CTC. Parte del checkpoint `wav2vec2-large-xlsr-53-icelandic-ep30-967h`, preentrenado con unas 967 horas de audio islandés (incluyendo Samrómur Milljón), y se ajusta sobre el corpus conversacional `palli23/spjallromur-v2`.

El entrenamiento se realizó durante 8 épocas, con batch size 16, acumulación de gradiente 2, learning rate 1e-5 y precisión fp16. El feature encoder se congeló durante la primera época y se descongeló después. El split de entrenamiento se empaquetó en segmentos de menos de 30 segundos con 0,3 segundos de silencio entre locuciones, mientras que dev y test se evaluaron por locución individual sin empaquetado. La innovación clave de esta v2 es la normalización de las etiquetas al conjunto real de caracteres del vocabulario CTC: se eliminaron las etiquetas de anotación (`<...>`, `[...]`), se pasó el texto a minúsculas y se eliminó la puntuación. La versión anterior mantenía mayúsculas y puntuación en las etiquetas pese a que el vocabulario no podía representarlas, lo que enseñó al modelo a emitir `[UNK]` como clase de salida habitual; el reentrenamiento elimina ese fallo (0 de 3.450 locuciones de test contienen `[UNK]` en esta versión).

## Capacidades

- Reconocimiento automático del habla en islandés, orientado a habla conversacional y espontánea.
- Decodificación CTC greedy sobre el vocabulario de 38 tokens del modelo base.
- Transcripción en minúsculas y sin puntuación: el modelo no genera mayúsculas ni signos de puntuación por diseño del vocabulario.
- Manejo de audio empaquetado en segmentos cortos (hasta ~30 s) durante el entrenamiento, aunque la evaluación se hace por locución.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión ni audio más allá de la propia entrada de voz.
- Capacidad multilingüe limitada al islandés; no se documenta transferencia a otras lenguas.
- No se documenta soporte explícito de timestamps por palabra ni de diarización.

## Casos de uso

- Transcripción de conversaciones telefónicas o de atención al cliente en islandés: el modelo está ajustado específicamente sobre habla conversacional (corpus Spjallrómur), lo que lo hace adecuado para audio espontáneo con solapamientos y turnos de diálogo, aunque con un WER del 37,36% que exige revisión humana.
- Generación de subtítulos para contenido audiovisual islandés de carácter informal: entrevistas, pódcast o vídeos de conversación donde el habla no es leída ni preparada.
- Investigación lingüística sobre islandés hablado: obtención de transcripciones normalizadas (minúsculas, sin puntuación) listas para análisis de corpus y estudios fonéticos o léxicos.
- Construcción de datasets ASR en islandés: uso del modelo como etiquetador automático o como baseline para comparar con otros sistemas en el corpus Spjallrómur.
- Prototipos de asistentes de voz para islandés: integración como etapa de transcripción en un pipeline de comprensión del lenguaje, asumiendo la necesidad de un post-proceso de puntuación y capitalización.
- Evaluación comparativa de arquitecturas ASR para lenguas de bajos recursos: el checkpoint sirve como referencia reproducible (métricas con bootstrap std, n=1000, seed 42) frente a otros fine-tunings de wav2vec2 en islandés.
- Archivado y búsqueda de grabaciones: transcripción masiva de audio conversacional para indexación textual, con la salvedad de que la ausencia de puntuación y mayúsculas limita la legibilidad directa.

## Benchmarks y rendimiento

Evaluación con decodificación CTC greedy sobre el split de test de `palli23/spjallromur-v2` (3.450 locuciones, evaluadas individualmente, sin concatenación). Texto normalizado (minúsculas, sin puntuación ni etiquetas) de forma idéntica para predicciones y referencias antes de puntuar. Desviación estándar por bootstrap con n=1000 remuestreos y seed 42.

| Split | n | WER | CER |
|---|---|---|---|
| spjallromur-v2 test | 3.450 | 37,36% ± 0,54 | 20,36% ± 0,39 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 (315 M parámetros × 4 bytes) y unos 0,65 GB en fp16, más el overhead de activaciones y del extractor convolucional para audio de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es pequeño para los estándares actuales.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma estándar para CTC ASR, llama.cpp no soporta wav2vec2, TGI no es la vía habitual; el despliegue típico es con la librería `transformers` de Hugging Face o con `speechbrain`/`torchaudio` para pipelines propios.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto / datos | WER documentado | Licencia |
|---|---|---|---|---|---|
| palli23/wav2vec2-large-spjallromur-v2 | 315 M | Islandés | ~967 h preentrenamiento + Spjallrómur v2 | 37,36% (Spjallrómur v2 test) | CC-BY-SA-4.0 |
| language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h | ~315 M | Islandés | ~967 h islandés | no disponible | no disponible |
| Modelos wav2vec2-large XLSR-53 multilingües | ~317 M | 53 idiomas | ~53 k h multilingüe | no disponible para islandés conversacional | no disponible |

La comparación numérica con alternativas no está disponible en la información proporcionada; el checkpoint base se cita como origen del fine-tuning, pero no se aportan sus métricas en esta ficha.

## Limitaciones y advertencias

- WER elevado (37,36%) sobre habla conversacional: inadecuado para transcripción automática sin revisión humana en producción.
- El vocabulario CTC no incluye mayúsculas ni puntuación: la salida siempre es minúscula y sin signos, lo que requiere post-proceso para cualquier uso editorial.
- Entrenado exclusivamente en islandés: no se espera un rendimiento aceptable en otras lenguas.
- Riesgo de alucinación inherente a los modelos ASR: puede generar palabras plausibles en audio ruidoso o con acentos no representados.
- Sesgos no documentados: la model card no detalla la composición demográfica del corpus Spjallrómur ni posibles sesgos de hablantes, género o edad.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar la compatibilidad con productos propietarios.
- Repo con muy poca tracción (11 descargas, 0 likes): no hay evidencia de validación externa ni de mantenimiento a largo plazo.
- No se documentan variantes cuantizadas (GGUF, ONNX) ni soporte en frameworks de inferencia de alto rendimiento, lo que limita el despliegue optimizado.
- El modelo se creó y actualizó en fechas futuras respecto a la información de referencia (2026), dato a verificar antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/wav2vec2-large-spjallromur-v2
- Checkpoint base: https://huggingface.co/language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h
- Dataset de fine-tuning: https://huggingface.co/datasets/palli23/spjallromur-v2
- Financiación Almannarómur: https://almannaromur.is
- Financiación Glóð: https://glod.ai
