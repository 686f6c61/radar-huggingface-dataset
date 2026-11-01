# NbAiLab/nb-asr-qwen06b-bokfink021-beta

## Resumen

nb-asr-qwen06b-bokfink021-beta es un modelo de reconocimiento automático del habla (ASR) desarrollado por el Nasjonalbiblioteket (NbAiLab, Biblioteca Nacional de Noruega), especializado en noruego bokmål y con soporte para nynorsk e inglés. Se trata de un fine-tuning del modelo base NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer, construido sobre la arquitectura Qwen3-ASR, que combina un encoder de audio con un decoder de lenguaje de aproximadamente 782 millones de parámetros totales.

El modelo aborda la transcripción de voz en noruego, un idioma con relativamente pocos recursos ASR comparado con el inglés, e incorpora capacidades avanzadas como traducción de voz (speech-translation), sesgo contextual (contextual-biasing) para mejorar el reconocimiento de vocabulario específico y procesamiento de audio de larga duración (long-form). Su licencia Apache 2.0 facilita la integración en productos comerciales, aunque el acceso está restringido y requiere aceptar condiciones en HuggingFace.

Es relevante ahora porque representa un esfuerzo institucional por cubrir las necesidades lingüísticas del noruego con modelos modernos de tamaño contenido, desplegables en hardware modesto. La etiqueta beta en el nombre indica que se trata de una versión en desarrollo, con 104 descargas registradas y sin likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio + decoder de lenguaje) |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nb (noruego bokmål), nn (noruego nynorsk), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-ASR, que combina un componente de codificación de audio con un decoder de lenguaje de tipo transformer. El modelo base es NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer, un checkpoint adaptado por NbAiLab con un tokenizador personalizado para el noruego. El fine-tuning se ha orientado específicamente al bokmål, con soporte adicional para nynorsk e inglés según las etiquetas del repositorio.

Las etiquetas del modelo indican capacidades de speech-translation (traducción de voz), contextual-biasing (sesgo contextual, útil para sesgar el reconocimiento hacia vocabulario específico como nombres propios o términos técnicos) y long-form (procesamiento de audio de larga duración). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El tamaño del repositorio es de 1.6 GB, coherente con los 782 millones de parámetros en safetensors.

## Capacidades

- Reconocimiento automático del habla en noruego bokmål como idioma principal.
- Soporte de nynorsk e inglés según los metadatos del modelo.
- Traducción de voz (speech-translation), según las etiquetas del repositorio.
- Sesgo contextual (contextual-biasing) para mejorar el reconocimiento de vocabulario específico.
- Procesamiento de audio de larga duración (long-form).
- Integración con la librería qwen-asr.
- No se ha confirmado soporte de tool calling, agentes o multi-step reasoning en la información disponible.

## Casos de uso

- Transcripción de archivos audiovisuales del patrimonio cultural noruego: la Biblioteca Nacional de Noruega puede emplear el modelo para transcribir grabaciones históricas y emisiones en bokmål, aprovechando la capacidad long-form para audio extenso.
- Subtitulado automático de contenido en noruego: el modelo puede generar transcripciones para vídeo y audio en plataformas de streaming o archivos institucionales, con soporte de traducción de voz para audiencias en inglés.
- Sesgo contextual en dominios especializados: en transcripción de actas parlamentarias o documentos institucionales, el contextual-biasing permite priorizar nombres propios, topónimos y terminología administrativa noruega.
- Asistentes de voz para servicios públicos noruegos: el modelo puede transcribir consultas ciudadanas en bokmål y nynorsk, facilitando la accesibilidad de servicios administrativos.
- Investigación lingüística y corpus orales: investigadores pueden transcribir entrevistas y grabaciones de campo en noruego para construir corpus anotados, con la ventaja de una licencia Apache 2.0 que permite redistribución.
- Transcripción en entornos con recursos limitados: con 782 millones de parámetros, el modelo es desplegable en hardware de gama media, adecuado para instituciones que no disponen de clústeres de GPU de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1.6 GB para los pesos, más overhead de activaciones y buffers de audio; se recomienda al menos 4-6 GB de VRAM para un funcionamiento cómodo.
- En cuantización de 8 bits: aproximadamente 0.8 GB de pesos; en 4 bits: aproximadamente 0.4 GB, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente; para despliegue en producción se recomiendan A100 o H100 por throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 6 GB o más de VRAM.
- Opciones de despliegue: la librería qwen-asr es la indicada por el repositorio; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| NbAiLab/nb-asr-qwen06b-bokfink021-beta | 782 M | nb, nn, en | Apache 2.0 | no disponible | Fine-tuning especializado en bokmål, acceso restringido |
| NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer | ~0.6 B (nominal) | no disponible | no disponible | no disponible | Modelo base del que deriva este checkpoint |
| Whisper large-v3 (OpenAI) | 1.55 B | multilingüe (incl. noruego) | MIT | 30 s por ventana | Referencia ASR multilingüe, sin fine-tuning específico para noruego |
| NB-Whisper (NbAiLab) | según variante | noruego | Apache 2.0 / MIT según variante | no disponible | Familia ASR noruega de NbAiLab sobre arquitectura Whisper |

La comparativa con Whisper y NB-Whisper se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Versión beta: el sufijo beta en el nombre indica que el modelo está en desarrollo y puede contener errores o comportamientos inestables.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la distribución automatizada.
- Idiomas: aunque se listan nb, nn y en, el fine-tuning está orientado al bokmål; el rendimiento en nynorsk e inglés puede ser inferior.
- Sesgos: no se dispone de información sobre sesgos conocidos; como modelo entrenado con datos institucionales noruegos, puede reflejar sesgos de ese corpus.
- Alucinación: no se dispone de datos específicos sobre tasas de alucinación en transcripción; en ASR, los errores de sustitución e inserción son el riesgo principal.
- Contexto: la longitud de contexto no está disponible, lo que dificulta planificar el procesamiento de audio largo sin pruebas empíricas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de Qwen3-ASR conviene verificar las condiciones del modelo base.
- Sin benchmarks publicados: no hay métricas WER/CER disponibles en la información, por lo que la evaluación comparativa requiere pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NbAiLab/nb-asr-qwen06b-bokfink021-beta
- Modelo base: https://huggingface.co/NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer
- Organización NbAiLab: https://huggingface.co/NbAiLab
