# IonGrozea/whisper-small_ro-80mel

## Resumen

whisper-small_ro-80mel es un ajuste fino del modelo openai/whisper-small para reconocimiento automático del habla (ASR) en rumano, publicado por el usuario IonGrozea en Hugging Face. El modelo parte de la arquitectura encoder-decoder de tipo transformer de Whisper y conserva sus 241.734.912 parámetros, por lo que se mantiene dentro de la categoría "small" de la familia y puede ejecutarse en hardware modesto. Su propósito es mejorar la transcripción de rumano respecto al checkpoint multilingüe original, que rinde de forma desigual en lenguas con menos recursos.

La relevancia de esta ficha es acotada: se trata de un checkpoint derivado, no de un modelo fundacional nuevo, y su model card fue generada automáticamente al subir el modelo porque el directorio de origen no contenía un README.md. Eso implica que no hay documentación sobre composición del corpus, número de horas de audio, hiperparámetros de entrenamiento ni proceso de alineación. Los únicos datos verificables son las métricas declaradas por el autor (WER 0,0927 y CER 0,0282 normalizados) y el recuento de parámetros del archivo safetensors.

Con 19 descargas y 0 likes en el momento de la consulta, es un modelo de bajo uso y sin validación independiente. Las métricas están marcadas como `verified: false` en el model-index, por lo que deben tratarse como declaraciones del autor y no como resultados auditados. Además, existe una discrepancia documental entre el nombre del repositorio (que indica features de 80 mel) y el cuerpo de la model card (que menciona 128 features mel), un punto a comprobar antes de desplegarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (1500 fotogramas mel); sin contexto textual de tipo LLM |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos PyTorch/safetensors; no se declaran versiones GGUF, INT8 ni GPTQ) |
| Idiomas soportados | Rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y PyTorch (bin); tamano del repositorio 11,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con normalización previa, conexiones residuales y activaciones GELU. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para idioma y tarea (`transcribe` o `translate`). El modelo base fue entrenado por OpenAI sobre 680.000 horas de audio débilmente supervisado y multilingüe; este checkpoint es un ajuste fino posterior sobre datos en rumano.

El autor indica que el ajuste se realizó sobre un "corpus rumano fusionado" y que la evaluación se hizo con 2000 muestras de validación con `beam=5`, leyendo las métricas de `eval_results.json`. No se especifican el número de horas, la procedencia de las fuentes, el número de épocas, la tasa de aprendizaje, si hubo aumento de datos ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona "features de entrada de 128 mel" mientras que el identificador del repositorio dice "80mel"; el extractor de features de Whisper-small estándar utiliza 80 canales mel, por lo que conviene verificar la configuración real del `preprocessor_config.json` antes de reutilizar el modelo. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Transcripción de voz a texto en rumano, con salida de texto plano sin marcas de tiempo documentadas.
- Traducción de audio a texto: al ser un modelo Whisper, conserva la tarea `translate` hacia inglés, aunque no hay métricas declaradas para ese caso de uso.
- Procesamiento de fragmentos de audio de hasta 30 segundos por pasada; el audio más largo requiere segmentación externa.
- Manejo de vocabulario, puntuación y mayúsculas aprendidos durante el ajuste, siempre que los datos de entrenamiento los hayan incluido (no documentado).
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico-secuencial.
- No dispone de capacidades de visión, audio comprensivo (diarización, clasificación de emociones) ni generación de texto libre.
- Multilingüismo: limitado al rumano en la práctica; aunque los pesos base son multilingües, el ajuste fino puede haber degradado el rendimiento en otras lenguas y no se aportan métricas al respecto.

## Casos de uso

- Transcripción de reuniones internas en empresas rumanas: el modelo convierte grabaciones de voz en actas de texto para equipos que operan en rumano, con un coste de cómputo bajo al ser un modelo de 241 M de parámetros.
- Subtitulado automático de vídeo en rumano: integrado en un pipeline de segmentación de audio (por ejemplo, cortes de 30 s con solapamiento), permite generar subtítulos para contenido educativo o corporativo.
- Archivado y búsqueda de grabaciones de atención al cliente: transcribir llamadas en rumano para indexarlas y permitir búsqueda por palabras clave sobre el texto resultante.
- Asistentes de voz para dominio específico: al ser ajustable con pocos datos, sirve como base para transcripción en sectores como sanidad o administración pública en Rumanía, donde el vocabulario técnico es limitado en modelos genéricos.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo cuasi real de charlas y clases en rumano, ejecutables en una GPU de gama de entrada o incluso en CPU con cuantización.
- Preprocesado de datos para entrenar otros modelos: transcripción masiva de corpus de audio rumano para construir datasets de texto destinados a modelos de lenguaje o sistemas de diálogo.
- Verificación de calidad de locución en doblaje: transcripción de pistas de audio para comparar el guion con la locución real y detectar desviaciones.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index y en la model card. La evaluación se realizó sobre 2000 muestras de validación del "corpus rumano fusionado" con `beam=5`.

| Métrica | Valor normalizado | Valor bruto | Conjunto de evaluación | Verificado |
|---|---|---|---|---|
| WER | 0,0927 | 0,096 | Romanian merged corpus (2000 muestras) | No |
| CER | 0,0282 | 0,029 | Romanian merged corpus (2000 muestras) | No |

La normalización aplicada consiste en paso a minúsculas y eliminación de puntuación, siguiendo el criterio de los artículos de Whisper. No se han publicado resultados comparativos con otros modelos en la información disponible, ni métricas por subconjunto, ni evaluación en otras tareas (traducción, detección de idioma, marcas de tiempo).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32, 0,5 GB en FP16/BF16 y 0,25 GB en INT8 para los pesos; sumando activaciones y caché del decoder, un presupuesto práctico de 1-2 GB por lote pequeño en FP16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090 o A100 funciona con holgura. No requiere memoria ni cómputo de clase de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida. También es viable en CPU para procesamiento por lotes no interactivo.
- Opciones de despliegue: `transformers` con PyTorch (ruta oficial documentada en la model card), CTranslate2/faster-whisper (requiere conversión), whisper.cpp/GGML (requiere conversión a GGUF, no hay artefacto publicado por el autor), OpenVINO y servidores de inferencia genéricos como TGI o vLLM con soporte de encoder-decoder.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo real (RTF), latencia por fragmento de 30 s ni throughput en lote. Para un modelo de 241 M de parámetros en una GPU moderna se espera una latencia inferior al tiempo real del audio, pero se trata de una estimación no confirmada por el autor.
- Almacenamiento: el repositorio ocupa 11,6 GB, muy por encima de lo que requieren los pesos finales (~1 GB), lo que sugiere la presencia de checkpoints intermedios u optimizador. Conviene descargar solo los archivos necesarios.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | WER en rumano | Disponibilidad |
|---|---|---|---|---|---|
| IonGrozea/whisper-small_ro-80mel | 241.734.912 | Rumano (ajuste) | Apache-2.0 | 0,0927 normalizado (declarado por el autor) | Hugging Face |
| openai/whisper-small | 241.734.912 | Multilingüe (~99 idiomas) | Apache-2.0 | No disponible en la información proporcionada | Hugging Face, referencia de facto |
| openai/whisper-base | ~74 M | Multilingüe (~99 idiomas) | Apache-2.0 | No disponible en la información proporcionada | Hugging Face |
| openai/whisper-medium | ~769 M | Multilingüe (~99 idiomas) | Apache-2.0 | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks de estos modelos alternativos en rumano dentro de la información proporcionada, por lo que la comparación cuantitativa de calidad no es posible. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Métricas sin verificar: los valores de WER y CER están marcados con `verified: false`; proceden del autor y no de una evaluación independiente, y no se especifica la composición del conjunto de validación.
- Corpus de entrenamiento no documentado: se desconoce el número de horas, las fuentes, la proporción de audio limpio frente a ruidoso y si existe solapamiento entre entrenamiento y validación, lo que puede inflar los resultados.
- Discrepancia en la configuración de features mel: el nombre del repositorio indica 80 mel y la model card menciona 128 mel. Es imprescindible revisar `preprocessor_config.json` para evitar errores de inferencia o degradación silenciosa de la calidad.
- Idiomas: el modelo solo está ajustado y evaluado en rumano. El uso en otras lenguas, aunque técnicamente posible por herencia del modelo base, no está soportado ni medido.
- Sesgos: al no documentarse la procedencia de los datos, no puede evaluarse el equilibrio de acentos, géneros, edades o registros dialectales del rumano. Es probable un peor rendimiento en habla espontánea, dialectos regionales o audio con ruido de fondo.
- Alucinación: los modelos Whisper son propensos a generar texto plausible en segmentos silenciosos, música, ruido o audio ininteligible. Se recomienda aplicar detección de voz (VAD) y filtros de confianza antes de usar la salida en producción.
- Audio largo: el modelo procesa ventanas de 30 s; la transcripción de audio extenso requiere segmentación y ensamblado propios, con riesgo de errores en los límites de los cortes.
- Licencia: Apache-2.0 permite uso comercial y modificación, siempre conservando el aviso de licencia y los avisos de atribución. Conviene revisar las condiciones del modelo base de OpenAI, que también es Apache-2.0.
- Baja madurez del artefacto: 19 descargas y 0 likes, model card autogenerada y ausencia de README original. No hay garantía de mantenimiento ni soporte por parte del autor.
- Sin marcas de tiempo documentadas: no se confirma la capacidad de `return_timestamps`, útil para subtitulado fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IonGrozea/whisper-small_ro-80mel
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Artículo de Whisper, "Robust Speech Recognition via Large-Scale Weak Supervision": https://arxiv.org/abs/2212.04356
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo ni sobre ASR en rumano; los resultados obtenidos correspondían a contenidos sin relación (puntuaciones deportivas). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
