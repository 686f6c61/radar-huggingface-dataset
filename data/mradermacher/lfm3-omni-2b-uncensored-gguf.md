# mradermacher/LFM3-Omni-2B-Uncensored-GGUF

## Resumen

LFM3-Omni-2B-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo OpenIntelligenceNet/LFM3-Omni-2B-Uncensored, un modelo multimodal "any-to-any" de la familia LFM3 (Liquid AI) con aproximadamente 1.728 millones de parámetros. El trabajo de cuantización lo firma mradermacher, que publica una batería de cuantizaciones estáticas (de Q2_K a f16) junto con los ficheros mmproj necesarios para el procesamiento multimodal en llama.cpp. El modelo cubre entradas y salidas de texto, visión y audio (ASR y TTS, incluyendo speech-to-speech), lo que lo sitúa en la categoría de modelos omni orientados a despliegue en el borde (edge-ai).

La variante "Uncensored" deriva de un proceso de abliteration/heretic aplicado sobre el modelo base, eliminando las capas de rechazo del alineamiento original. Esto lo hace relevante para investigadores que necesitan estudiar el comportamiento del modelo sin filtros de seguridad, así como para desarrolladores que despliegan asistentes conversacionales locales en hardware modesto. El tamaño reducido (1,7B parámetros) permite ejecutarlo en CPU o en GPUs de consumo con cuantizaciones de 4 bits que ocupan alrededor de 1,2 GB.

La ficha se basa exclusivamente en la información disponible en el repositorio de Hugging Face y en la model card del autor de la cuantización; los datos de arquitectura interna, contexto y entrenamiento no están documentados en las fuentes consultadas y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; multimodal any-to-any) |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en las fuentes consultadas. Por la nomenclatura y las etiquetas del repositorio (liquid-ai, lfm3, lfm3-omni, omni, multimodal, any-to-any), se trata de un modelo de la familia LFM3 de Liquid AI con capacidades omni: procesa y genera texto, imágenes y audio en un único pipeline. El repositorio incluye ficheros mmproj (proyector multimodal) en Q8_0 y f16, lo que confirma el soporte de entrada multimodal en llama.cpp.

El modelo base es OpenIntelligenceNet/LFM3-Omni-2B-Uncensored, una variante "abliterated/uncensored" del LFM3-Omni-2B original, según las etiquetas heretic y abliterated. No se documentan en las fuentes el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La cuantización la realiza mradermacher con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la consulta.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de visión: entrada de imágenes a través del proyector multimodal (mmproj).
- Procesamiento de audio: ASR (reconocimiento de voz) y TTS (síntesis de voz), con soporte de speech-to-speech según las etiquetas del repositorio.
- Pipeline any-to-any: combinación de modalidades de entrada y salida (texto, imagen, audio).
- Orientado a edge-ai: tamaño reducido apto para despliegue local.
- Variante uncensored/abliterated: sin capas de rechazo del alineamiento original, pensada para investigación.
- Tool calling / function calling: no disponible en la información consultada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información consultada.
- Capacidades multilingües: limitadas al inglés según el campo language del repositorio.

## Casos de uso

- Asistentes de voz locales: el modelo puede recibir audio, transcribirlo y responder con voz (speech-to-speech) en un único pipeline, adecuado para dispositivos de borde sin conexión a la nube.
- Transcripción y resumen de reuniones: uso de la capacidad ASR para convertir audio en texto y generación de resúmenes con el mismo modelo, desplegado en local con llama.cpp.
- Descripción de imágenes en accesibilidad: entrada de imagen vía mmproj y generación de descripciones textuales para lectores de pantalla, con la ventaja de ejecutarse en hardware de consumo.
- Investigación sobre alineamiento y seguridad: la variante uncensored permite estudiar el comportamiento del modelo sin filtros de rechazo, comparándolo con el modelo base alineado.
- Prototipado de interfaces multimodales: desarrollo de demos any-to-any (voz + imagen + texto) en portátiles con GPU de consumo gracias a las cuantizaciones Q4 de ~1,2 GB.
- Experimentación académica con modelos pequeños: base para fine-tuning o evaluación de técnicas de cuantización en modelos omni de menos de 2B parámetros.
- Asistentes conversacionales sin restricciones de contenido para entornos controlados de investigación, con las advertencias de seguridad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 0,9 GB con Q2_K y 1,9 GB con Q8_0; el f16 ocupa 3,6 GB. Hay que sumar el proyector multimodal (0,6 GB en Q8_0 o 1,0 GB en f16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090 o superiores permiten margen holgado. También es viable en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas de consumo con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y cualquier runtime compatible con GGUF; el modelo base en transformers requiere la librería transformers. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información consultada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-GGUF (este) | 1,7B | no disponible | texto, visión, audio | no disponible | GGUF |
| OpenIntelligenceNet/LFM3-Omni-2B-Uncensored | 1,7B | no disponible | texto, visión, audio | no disponible | safetensors |
| mradermacher/LFM3-1.7B-Uncensored-GGUF | 2B (según card) | no disponible | texto | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información consultada.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": se ha eliminado el alineamiento de seguridad, por lo que puede generar contenido dañino, sesgado o inapropiado; no debe desplegarse en producción orientada al público sin moderación adicional.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de evaluación en las fuentes consultadas.
- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es necesario verificar la licencia del modelo base antes de cualquier despliegue comercial.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas.
- Cuantizaciones estáticas sin imatrix: las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior.
- El proyector multimodal es un fichero separado (mmproj) y debe descargarse y configurarse explícitamente en llama.cpp.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento en tareas estándar (MMLU, HumanEval, etc.).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-Omni-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-Omni-2B-Uncensored
- README del modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-Omni-2B-Uncensored/blob/main/README.md
- Página de descargas del cuantizador: https://hf.tst.eu/model#LFM3-Omni-2B-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado (solo texto): https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
