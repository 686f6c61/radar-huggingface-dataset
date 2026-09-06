# seniruk/whisper-small-si-v3

## Resumen

Sinscribe v3 (identificador `seniruk/whisper-small-si-v3`) es un modelo de reconocimiento automático de voz (ASR) especializado en cingalés (`si`), desarrollado por el usuario `seniruk`. Se trata de un fine-tuning del modelo `openai/whisper-small` de OpenAI, entrenado sobre un conjunto de datos en cingalés compuesto por archivos CSV y FLACs. La arquitectura es un transformer encoder-decoder con aproximadamente 241,7 millones de parámetros, heredada de Whisper Small. El repositorio publica los pesos en formato safetensors bajo licencia Apache 2.0.

El modelo amplía la cobertura de Whisper a una lengua con escasos recursos y poca representación en ASR. Está diseñado para transcribir audio en cingalés y puede integrarse fácilmente en pipelines de procesamiento de voz mediante la librería Transformers. La model card no incluye descripciones detalladas ni resultados de benchmarks, lo que limita la evaluación de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, fine-tuning) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; hereda la ventana de 30 s de Whisper Small) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Cingalés (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Sinscribe v3 es un fine-tuning de `openai/whisper-small`, un modelo transformer encoder-decoder con 244 millones de parámetros en su versión original. El autor no detalla la arquitectura interna más allá del modelo base, por lo que la estructura sigue el diseño de Whisper: codificador de audio y decodificador autoregresivo de texto, con atención de múltiples cabezas. No se menciona uso de RLHF, DPO ni ninguna innovación técnica adicional.

El entrenamiento se realizó sobre un dataset de cingalés descrito como "Sinhala CSV + FLACs", sin información sobre el número total de tokens ni la composición exacta. Los hiperparámetros publicados incluyen una tasa de aprendizaje de 3e-06, tamaño de lote de 16 para entrenamiento y 64 para evaluación, 2 épocas, optimizador AdamW con fusión de PyTorch, scheduler lineal con 100 pasos de calentamiento y entrenamiento en precisión mixta nativa (AMP). El autor indica que se utilizó Transformers 4.54.0, PyTorch 2.8.0+cu128, Datasets 3.6.0 y Tokenizers 0.21.4.

## Capacidades

- Transcripción de audio en cingalés, tanto en fragmentos cortos como en audios más largos procesados por ventanas.
- Generación de texto con marcas de tiempo al usar la herramienta de alineación de Whisper.
- Integración con el pipeline `automatic-speech-recognition` de Hugging Face para inferencia directa.
- Soporte de la librería Transformers, incluyendo `generate` y `model.eval` para despliegue en producción.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y videollamadas en cingalés: el modelo puede transcribir grabaciones de audio de reuniones para generar actas textuales y facilitar su posterior búsqueda o análisis. Gracias a la arquitectura Whisper, admite procesamiento por lotes de fragmentos de audio.
- Subtitulado automático de vídeos en cingalés: permite generar transcripciones sincronizadas con la línea de tiempo mediante la información de tokens y alineación de Whisper, útil para crear subtítulos en plataformas de vídeo.
- Accesibilidad para personas con discapacidad auditiva: sirve como motor de transcripción en aplicaciones de accesibilidad, convirtiendo audio en texto en tiempo real o en modo diferido para contenido educativo o informativo en Sri Lanka.
- Análisis de llamadas de atención al cliente: puede transcribir grabaciones de llamadas en cingalés y alimentar sistemas de análisis de sentimiento o extracción de intenciones. El modelo es adecuado por su licencia Apache 2.0, que permite uso comercial.
- Indexación de notas de voz y archivos de audio: en gestores de conocimiento o aplicaciones de productividad, el modelo transcribe notas de voz en cingalés para convertirlas en texto indexable y buscable.
- Investigación lingüística y preservación de la lengua: permite digitalizar material oral en cingalés (entrevistas, narrativas, testimonios) para construir corpus lingüísticos y apoyar estudios de procesamiento del lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.
La model card incluye un `model-index` con una entrada denominada `Sinscribe v3` y una lista de resultados vacía, por lo que no hay métricas oficiales para MMLU, HumanEval, GSM8K ni ninguna otra prueba.

## Requisitos de hardware

No se especifican requisitos de hardware en la model card. A partir del tamaño de parámetros (241,7 millones), se pueden hacer las siguientes estimaciones orientativas:

- VRAM estimada: con pesos en FP16, la memoria necesaria para los pesos es de aproximadamente 483 MB; contando activaciones y buffers durante la inferencia, una GPU con 2 GB de VRAM puede ser suficiente para lotes pequeños.
- GPU recomendadas: RTX 2060, GTX 1660, T4, A10 o cualquier GPU moderna con al menos 2-4 GB de VRAM. También es posible ejecutar el modelo en CPU para inferencia lenta.
- Compatibilidad con GPU de consumo: sí, el modelo es ligero y cabe en GPUs de gama media.
- Opciones de despliegue: Transformers (pipelines), `torchaudio` para preprocesado de audio, y Whisper.cpp para despliegue en CPU. No se dispone de pruebas con vLLM o TGI en la información publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Notas |
|---|---|---|---|---|
| seniruk/whisper-small-si-v3 | 241,7 M | Ventana de 30 s (heredada de Whisper Small) | Apache 2.0 | Fine-tuning específico para cingalés |
| openai/whisper-small | 244 M | Ventana de 30 s | MIT | Modelo base multilingüe, sin especialización en cingalés |
| openai/whisper-medium | 769 M | Ventana de 30 s | MIT | Mayor tamaño y precisión potencial en lenguas de pocos recursos, pero requiere más hardware |

## Limitaciones y advertencias

- No se han documentado sesgos específicos. Al tratarse de un fine-tuning sobre un dataset en cingalés no descrito, el modelo puede heredar sesgos lingüísticos o de contenido presentes en el corpus de entrenamiento.
- Riesgo de alucinación: Whisper puede generar texto alucinado en segmentos de silencio o audio ambiguo. No hay datos específicos sobre este modelo, por lo que se recomienda validar las transcripciones en casos reales.
- Limitaciones de idioma: el modelo está entrenado únicamente para cingalés. Aunque el modelo base era multilingüe, no se puede asumir un buen rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no incluye garantías de rendimiento ni soporte oficial.
- Advertencia para producción: al no existir benchmarks publicados, cualquier integración en producción debe ir precedida de una evaluación exhaustiva sobre el propio corpus objetivo para medir la tasa de error de palabras (WER) y de caracteres (CER).

## Enlaces

- HuggingFace: https://huggingface.co/seniruk/whisper-small-si-v3
- Modelo base: https://huggingface.co/openai/whisper-small
