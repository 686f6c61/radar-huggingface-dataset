# Sanghyang00/ELARSpeech-OmniASR-1B-xty

## Resumen

ELARSpeech-OmniASR-1B-xty es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario Sanghyang00, identificado en la web como Sangmin Lee, investigador del DSP & AI Lab de la Universidad de Yonsei (Seúl). Se trata de un ajuste fino del checkpoint aadel4/omniASR-CTC-1B-v2 sobre yoloxóchitl mixteco (ISO 639-3: xty), una lengua mixteca hablada en el estado de Oaxaca (México). El modelo resuelve la tarea de transcripción de audio a texto en un único idioma, sin componente generativo ni decodificador autoregresivo.

Técnicamente es un `Wav2Vec2ForCTC` con 975.677.617 parámetros (aproximadamente 1B, como indica su nombre comercial) y un cabezal de clasificación CTC sobre el vocabulario de la lengua. El repositorio ocupa 3,9 GB y se distribuye en formato safetensors para la librería transformers. La entrada debe ser audio mono a 16 kHz.

Su relevancia es doble: por un lado, se enmarca en la familia de modelos OmniASR orientados a lenguas con pocos recursos; por otro, cubre una lengua indígena mexicana con representación muy limitada en tecnología del habla. El contrapunto es que el modelo acumula 0 descargas y 0 «likes» en el momento de la consulta, la licencia no está declarada y no se han publicado métricas de error (WER/CER) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder convolucional + transformer, cabezal CTC) |
| Parámetros totales | 975.677.617 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; procesa forma de onda a 16 kHz, no contexto de texto) |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | Yoloxóchitl mixteco (ISO 639-3: xty) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |
| Modelo base | aadel4/omniASR-CTC-1B-v2 |
| Pipeline declarado | automatic-speech-recognition |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Tamaño del repositorio | 3,9 GB |
| Fecha de creación | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Wav2Vec2 en configuración `Wav2Vec2ForCTC`. Esta combina un extractor de características convolucional que opera directamente sobre la forma de onda cruda y un codificador transformer que produce representaciones contextuales; sobre ellas se aplica un cabezal lineal con decodificación CTC, lo que permite alinear secuencias de audio y texto sin necesidad de alineaciones forzadas previas. Al ser un modelo CTC puro, no existe decodificador autoregresivo ni mecanismo de atención cruzada texto-audio, lo que reduce el coste de inferencia frente a alternativas encoder-decoder tipo Whisper.

No se especifican en la información disponible el número de tokens de audio utilizados en el ajuste fino, la composición del corpus de entrenamiento, ni si hubo etapas de ajuste con RLHF o DPO (procedimientos, por otra parte, poco habituales en ASR con CTC). Lo único documentado es la procedencia del ajuste: el checkpoint base aadel4/omniASR-CTC-1B-v2, de ~1B parámetros, sobre el que se ha especializado el modelo para la lengua xty. La model card indica además que el artefacto exportado se verificó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con resultado de verificación de transcripción exacta «PASS», lo que constituye un control de integridad de la exportación, no una evaluación de calidad de reconocimiento.

## Capacidades

- Transcripción de voz a texto monolingüe en yoloxóchitl mixteco (xty) a partir de audio mono a 16 kHz.
- Salida en texto plano mediante decodificación CTC (`argmax` sobre los logits), sin puntuación, mayúsculas ni formato añadido.
- Procesamiento de audio de campo o de archivo con la librería transformers mediante `AutoProcessor` y `Wav2Vec2ForCTC`.
- Compatibilidad declarada con endpoints de inferencia de Hugging Face (etiqueta `endpoints_compatible`).
- No dispone de soporte de tool calling ni function calling: es un modelo acústico-fonético, no un modelo de lenguaje instruido.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No dispone de capacidades de visión, audio comprensivo (audio-LLM) ni generación multimodal.
- No dispone de modo «thinking» ni de razonamiento explícito.
- No multilingüe: la model card lo describe explícitamente como modelo ASR de un solo idioma.

## Casos de uso

- Documentación lingüística de campo: transcripción asistida de grabaciones elicitadas y narraciones en yoloxóchitl mixteco, con revisión posterior por parte del lingüista. El modelo actúa como primer paso para reducir el tiempo de transcripción manual, que en lenguas sin recursos suele ser de 20 a 60 veces la duración del audio.
- Archivado y búsqueda de corpus orales: convertir acervos de audio en texto indexable para permitir búsquedas por palabra clave en archivos sonoros de comunidades mixtecas.
- Subtitulado de material audiovisual comunitario: generación de subtítulos en xty para vídeos de revitalización lingüística, radio comunitaria o materiales educativos, dado que el modelo trabaja con audio a 16 kHz fácilmente extraíble de vídeo.
- Investigación fonética y fonológica: alineación aproximada de transcripciones para estudiar variación tonal y segmental en xty, siempre con validación humana de los resultados.
- Herramientas educativas de revitalización: dictado asistido en aplicaciones de aprendizaje de la lengua para hablantes heritage que quieran practicar la ortografía normalizada.
- Transcripción de entrevistas etnográficas y sociolingüísticas: preprocesado de entrevistas largas para análisis cualitativo, con el modelo ejecutándose en local para no exponer material sensible de comunidades a servicios en la nube.
- Preservación digital en instituciones: digitalización de casetes y archivos analógicos de xty con transcripción automática como capa de metadatos.

En todos los casos, la ausencia de métricas de error publicadas obliga a tratar la salida como borrador sujeto a corrección humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única referencia de evaluación presente en la model card es una verificación de transcripción exacta («Exact-transcription verification status: PASS») que compara el artefacto exportado con el checkpoint original de ELARSpeech sobre un conjunto fijo de muestras. Se trata de un control de equivalencia entre exportaciones, no de una medida de calidad ASR (WER, CER) sobre un conjunto de test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 975.677.617 parámetros: ~3,9 GB en fp32, ~1,95 GB en fp16/bf16 y ~1 GB en int8. A esto hay que sumar el consumo de activaciones y del extractor convolucional, reducido en comparación con un modelo generativo equivalente.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en fp16; por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100. No se requiere memoria alta ni paralelismo tensorial.
- Cabe en GPU de consumo: sí, con amplio margen, en toda la gama RTX 30/40 y en GPUs integradas con memoria compartida suficiente. También es viable la inferencia en CPU para audios cortos.
- Opciones de despliegue: transformers con `AutoProcessor` y `Wav2Vec2ForCTC` (procedimiento documentado en la model card), endpoints de inferencia de Hugging Face (etiqueta `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no aplican directamente; tampoco hay evidencia de soporte en vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. Al carecer de decodificador autoregresivo, la decodificación CTC es un único paso hacia delante sobre los logits, por lo que el coste dominante es el paso por el encoder.

## Comparativa con modelos similares

| Modelo | Autor | Parámetros | Idioma | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-xty | Sanghyang00 | 975,7 M | xty (yoloxóchitl mixteco) | Wav2Vec2ForCTC | No disponible | Hugging Face, 0 descargas |
| omniASR-CTC-1B-v2 | aadel4 | ~1B (etiqueta de nombre) | No disponible en la información | CTC | No disponible | Hugging Face (modelo base) |
| ELARSpeech-OmniASR-1B-bly | Sanghyang00 | No disponible | bly | ASR (familia ELARSpeech-OmniASR) | No disponible | Hugging Face |
| Omnilingual ASR | Meta (AI at Meta) | No disponible | 1.600+ idiomas, con corpus para 350 lenguas desatendidas | ASR | No disponible | Demo pública y proyecto abierto |

La model card de este modelo no confirma una relación formal con la iniciativa Omnilingual ASR de Meta, aunque la nomenclatura de la familia (`omniASR`) y el enfoque sobre lenguas con pocos recursos apuntan a esa línea de trabajo. No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: está entrenado únicamente para yoloxóchitl mixteco (xty). No debe usarse para otras lenguas ni para mezcla de idiomas.
- Sin métricas publicadas: no se dispone de WER ni CER sobre conjuntos de test independientes, por lo que no es posible cuantificar la calidad de transcripción antes de desplegarlo.
- Sensibilidad a las condiciones de grabación: la propia model card advierte de que la precisión varía según las condiciones acústicas, la población de hablantes, la ortografía empleada y el dominio del material.
- Preprocesado obligatorio: la entrada debe ser audio mono remuestreado a 16 kHz; audio estéreo o con otra frecuencia de muestreo puede degradar o invalidar la salida.
- Salida sin formato: al ser CTC puro, el texto generado no incluye puntuación, mayúsculas ni normalización, lo que exige postprocesado para según qué aplicaciones.
- Riesgo de alucinación: en un modelo CTC el riesgo se manifiesta como sustituciones, omisiones o repeticiones de fonemas en tramos con ruido o con audio no inteligible, más que como texto inventado semánticamente. Requiere revisión humana con independencia del caso de uso.
- Licencia no declarada: la model card remite a la documentación del proyecto ELARSpeech para los términos del conjunto de datos y al repositorio del modelo base para su licencia y cita. Al no estar especificada la licencia de este checkpoint, no puede asumirse permiso de uso comercial.
- Repositorio sin tracción: 0 descargas y 0 «likes» en el momento de la consulta, sin señales de mantenimiento posterior a la fecha de actualización.
- Sesgos: no hay información disponible sobre la distribución de hablantes del corpus de ajuste (edad, sexo, variante dialectal), por lo que se desconoce si el modelo rinde de forma homogénea entre subpoblaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-xty
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Modelo hermano (otra lengua): https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-bly
- Perfil de Hugging Face del autor: https://huggingface.co/Sanghyang00
- GitHub del autor: https://github.com/sanghyang00
- Repositorios del autor en GitHub: https://github.com/sanghyang00?tab=repositories
- Demo de Omnilingual ASR (Meta): https://aidemos.atmeta.com/omnilingualasr
