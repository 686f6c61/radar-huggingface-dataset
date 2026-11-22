# MUC-HeTong/HeTong-Omni-ASR-300M

## Resumen

HeTong-Omni-ASR-300M es un checkpoint de investigación para reconocimiento automático de voz (ASR) publicado por el grupo MUC-HeTong dentro del proyecto HeTong. El modelo combina un codificador de voz basado en Wav2Vec2 con un decodificador de estilo Llama, una arquitectura híbrida que el autor etiqueta internamente como `wav2vec2_llama` y cuyo tipo de configuración es `LLM_ASR_LID`. El checkpoint publicado corresponde al paso de entrenamiento 33.000 y se distribuye junto con los ficheros de configuración del entrenamiento y el tokenizador original.

La relevancia de esta publicación es limitada y de carácter eminentemente exploratorio: el repositorio no incluye código de inferencia ni de entrenamiento, no declara resultados de evaluación (WER/CER) y no confirma la licencia. El propio autor advierte que el sufijo "300M" sigue la convención de nombres de la configuración de entrenamiento y no debe interpretarse como un recuento verificado de parámetros totales del modelo completo.

Se trata, por tanto, de un artefacto de investigación útil para quienes siguen la línea de trabajo del proyecto HeTong o quieran inspeccionar la arquitectura, pero no de un modelo listo para producción. La información disponible sobre datos de entrenamiento, idiomas soportados y rendimiento es escasa o está pendiente de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (codificador de voz) + decodificador estilo Llama; tipo `LLM_ASR_LID` en configuración |
| Parametros totales | no disponible (el sufijo "300M" no está verificado según el autor) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el tag "multilingual" aparece, pero no se detalla cobertura) |
| Licencia | no disponible (pendiente de confirmación por los mantenedores) |
| Formato de pesos | PyTorch (`.pt`, `model_consolidated.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador acústico Wav2Vec2 con un decodificador autorregresivo de estilo Llama. La configuración del modelo declara una frecuencia de muestreo de audio de 16.000 Hz y un tipo de modelo `LLM_ASR_LID`, lo que sugiere que el sistema está pensado para ASR con identificación de idioma (LID) integrada, aunque el autor no detalla el funcionamiento exacto de esa componente. El tokenizador es el `omniASR_tokenizer.model` original de `facebook/omniASR-LLM-300M`, reutilizado sin modificaciones.

El entrenamiento se realizó durante 33.000 pasos sobre un conjunto de datos identificado en la configuración como `tri_bo_tts50b`. No se especifica el número de tokens ni la composición del dataset, y el autor indica explícitamente que la procedencia de los datos y los permisos de redistribución deben documentarse antes de presentar el modelo como una release plenamente reproducible. El `config.yaml` publicado conserva los hiperparámetros de entrenamiento, pero sustituye la ruta interna del resumen del dataset por un marcador de posición (`YOUR_DATASET_PATH/language_distribution_0.tsv`); además, los valores `path: null` y `parquet_path: ''` se mantienen tal cual y requieren configuración en tiempo de ejecución. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Reconocimiento automático de voz (ASR) a partir de audio a 16 kHz.
- Identificación de idioma integrada según el tipo de modelo declarado (`LLM_ASR_LID`), si bien no se detalla su alcance ni cobertura.
- Etiqueta "multilingual" presente en los metadatos, sin lista de idiomas publicada.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking mode), visión ni audio más allá del propio ASR.
- El checkpoint se distribuye sin código de inferencia; el autor indica que la carga puede requerir código específico del proyecto y que no está verificado como compatible con `transformers.AutoModel.from_pretrained()`.

## Casos de uso

- Investigación sobre arquitecturas híbridas ASR-LLM: el checkpoint permite inspeccionar la combinación Wav2Vec2 + decodificador Llama y comparar configuraciones dentro de la línea del proyecto HeTong, aunque requiere código de carga propio.
- Reproducción experimental del entrenamiento: el `config.yaml` conserva los hiperparámetros del run (33.000 pasos, dataset `tri_bo_tts50b`), lo que sirve como referencia para quienes quieran replicar o adaptar el pipeline, siempre que reconstruyan la ruta del resumen del dataset.
- Estudio de tokenizadores multilingües para ASR: al reutilizar el tokenizador de `facebook/omniASR-LLM-300M`, el modelo es útil para analizar cómo se comporta ese vocabulario en un decodificador de estilo Llama aplicado a voz.
- Base para fine-tuning en dominios concretos: al ser un checkpoint intermedio de investigación, puede servir como punto de partida para ajuste en tareas ASR específicas, asumiendo que el usuario aporte su propio código de entrenamiento e inferencia.
- Análisis de identificación de idioma (LID) en sistemas ASR: el tipo `LLM_ASR_LID` sugiere que el modelo incorpora esta capacidad, lo que lo hace interesante para estudiar el cambio de idioma en transcripciones, aunque no hay evaluación publicada que lo respalde.
- Docencia y experimentación con modelos de voz de tamaño reducido: el tamaño aparente (del orden de centenares de millones de parámetros según la convención de nombres) lo hace manejable en entornos académicos con GPUs modestas, una vez resuelta la carga del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los resultados verificados de evaluación (WER/CER, conjunto de evaluación y cobertura de idiomas) se publicarán cuando estén disponibles, y que no se reclama ninguna puntuación en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, un modelo del orden de 300 millones de parámetros en FP16 requiere aproximadamente 0,6 GB solo para los pesos, más memoria para activaciones y el codificador de audio; sin embargo, esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño aparente podría caber en GPUs de consumo, pero no hay validación publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El autor indica que la carga puede requerir código específico del proyecto y que no está verificado como compatible con `transformers.AutoModel.from_pretrained()` ni con Hugging Face Inference Providers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeTong-Omni-ASR-300M | no disponible (sufijo "300M" sin verificar) | no disponible | no disponible (pendiente) | Checkpoint `.pt` en HF, sin código de inferencia | Arquitectura Wav2Vec2 + Llama, tipo `LLM_ASR_LID` |
| facebook/omniASR-LLM-300M | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Repositorio HF con tokenizador reutilizado por HeTong | Origen del tokenizador; relación arquitectónica mencionada por el autor |
| Wav2Vec2 base (familia) | ~95M (referencia de la familia, no confirmado para este modelo) | no aplica | varía según checkpoint | Amplia disponibilidad en HF y `transformers` | Codificador acústico clásico; HeTong usa Wav2Vec2 como encoder |

La comparación con alternativas ASR de la misma categoría (por ejemplo, Whisper o modelos ASR basados en LLM) no puede establecerse con rigor porque no hay datos de rendimiento publicados para HeTong-Omni-ASR-300M.

## Limitaciones y advertencias

- Licencia pendiente de confirmación: el autor indica que la licencia del repositorio está sujeta a revisión de los términos del modelo upstream y de los permisos sobre los datos de entrenamiento; no debe asumirse uso comercial permitido.
- Sin resultados de evaluación: no hay WER, CER ni cobertura de idiomas verificada, por lo que no es posible validar su calidad frente a alternativas.
- Sin código de inferencia ni de entrenamiento en esta release; el autor anuncia que se añadirán en una actualización posterior.
- Compatibilidad con `transformers` no verificada: el checkpoint `.pt` puede requerir código específico del proyecto para cargarse.
- Configuración de entrenamiento no reproducible de forma autónoma: la ruta del resumen del dataset está reemplazada por un marcador de posición y hay campos (`path: null`, `parquet_path: ''`) que requieren configuración en tiempo de ejecución.
- Procedencia de datos no documentada: el dataset `tri_bo_tts50b` no se describe en composición, tamaño ni permisos de redistribución.
- Idiomas soportados no detallados pese a la etiqueta "multilingual".
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor; al ser un modelo ASR con decodificador de tipo LLM, existe riesgo de generación de texto no fiel al audio, pero no hay estudios publicados al respecto.
- Recuento de parámetros no verificado: el sufijo "300M" es una convención de nombres y no debe tomarse como especificación técnica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MUC-HeTong/HeTong-Omni-ASR-300M
- Proyecto GitHub HeTong: https://github.com/MUC-HeTong/HeTong
- Tokenizador upstream (facebook/omniASR-LLM-300M): https://huggingface.co/facebook/omniASR-LLM-300M/blob/main/omniASR_tokenizer.model
- Repositorio upstream Meta Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
