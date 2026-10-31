# mradermacher/whispernow-qwen3.5-4b-GGUF

## Resumen

Whispernow-qwen3.5-4b-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo category271/whispernow-qwen3.5-4b, publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de 4,2 mil millones de parámetros basado en la familia Qwen3.5, afinado específicamente para tareas de limpieza de transcripciones de voz a texto: puntuación, formato y corrección de la salida cruda de sistemas de dictado como Whisper. El dataset de entrenamiento empleado es category271/whispernow-cleanup.

Su relevancia radica en que cubre un nicho concreto pero muy demandado en pipelines de voz a texto: los modelos de transcripción como Whisper generan texto sin formato, con errores de puntuación y sin estructura, y un LLM pequeño y especializado como este puede limpiar ese texto de forma eficiente en local. La versión GGUF permite ejecutarlo en CPU o en GPUs de consumo mediante llama.cpp, Ollama u otros runtimes compatibles, con cuantizaciones desde 2,0 GB (Q2_K) hasta 8,5 GB (f16). El modelo está licenciado bajo Apache 2.0 y su idioma de trabajo es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible detalle exacto |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, category271/whispernow-qwen3.5-4b, es un modelo de la familia Qwen3.5 con aproximadamente 4,2 mil millones de parámetros, afinado (fine-tuning) sobre el dataset category271/whispernow-cleanup. Este dataset está orientado a la limpieza de transcripciones: transformar la salida cruda de sistemas de reconocimiento de voz (speech-to-text) en texto correctamente puntuado, formateado y legible. No hay información publicada sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas como RLHF o DPO.

La versión aquí descrita es una colección de cuantizaciones estáticas en GGUF realizadas por mradermacher mediante conversión desde el formato HF (convert_type: hf). Se ofrecen desde cuantizaciones muy agresivas (Q2_K, 2,0 GB) hasta precisión completa (f16, 8,5 GB). El autor indica que las cuantizaciones weighted/imatrix no están disponibles por el momento, aunque pueden solicitarse mediante una Community Discussion en el repositorio.

## Capacidades

- Limpieza de transcripciones: puntuación, capitalización, formato y corrección del texto crudo generado por sistemas de speech-to-text como Whisper.
- Procesamiento de texto de dictado: reconstrucción de la estructura de frases y párrafos a partir de salida verbal sin formato.
- Generación de texto conversacional en inglés (etiquetado como conversational).
- No es un modelo de transcripción de audio por sí mismo: trabaja sobre texto ya transcrito (tags de speech-to-text y dictation se refieren a su rol en ese pipeline).
- No hay información sobre soporte de tool calling, capacidades de visión, audio ni modo de razonamiento (thinking mode) en la información disponible.

## Casos de uso

- Post-procesado de transcripciones de Whisper: integrarlo tras Whisper en un pipeline de speech-to-text para generar transcripciones con puntuación y formato correctos, listo para publicación o archivo.
- Dictado profesional: convertir la salida cruda de dictados médicos, jurídicos o administrativos en texto bien formateado y legible, reduciendo el trabajo manual de corrección.
- Subtitulado y creación de contenidos: limpiar transcripciones de podcasts o vídeos antes de generar subtítulos, artículos o notas de episodios.
- Actas y notas de reuniones: formatear automáticamente la transcripción cruda de reuniones grabadas para producir minutas legibles.
- Ejecución en local con privacidad: gracias al formato GGUF y a su tamaño contenido (2,0-4,6 GB en cuantizaciones habituales), puede ejecutarse en portátiles y equipos de escritorio sin enviar datos a la nube, algo crítico en dictado médico o legal.
- Automatización por lotes: procesar grandes volúmenes de transcripciones históricas en CPU o GPUs modestas gracias a la eficiencia de las cuantizaciones Q4_K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: aproximadamente el tamaño del archivo GGUF más margen para el contexto. En Q4_K_S/Q4_K_M (2,7-2,8 GB) cabe cómodamente en 4 GB de VRAM o incluso solo en RAM de sistema.
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM (RTX 3060, RTX 4060 o superiores) para aceleración; no se requiere hardware datacenter para este tamaño.
- Consumer GPUs: sí, cabe sin problemas en GPUs de consumo; también es plenamente viable en CPU pura dado su tamaño (2,0-4,6 GB según cuantización).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponible; al tratarse de un modelo de 4B cuantizado, se esperan velocidades altas incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| whispernow-qwen3.5-4b (este) | 4,2B | GGUF (2,0-8,5 GB) | Limpieza de transcripciones | Apache 2.0 |
| Qwen3.5-4B (base) | ~4B | safetensors / GGUF | Uso general | Apache 2.0 (según familia Qwen) |
| Whisper (large-v3) | ~1,5B (encoder-decoder) | PyTorch / CTranslate2 | Transcripción de audio directa | MIT |

Nota: no existen muchos modelos abiertos especializados exclusivamente en limpieza de transcripciones; la alternativa habitual es usar un LLM generalista (Qwen, Llama, Gemma) con un prompt de limpieza, lo que suele ser menos consistente que un modelo afinado específicamente para esta tarea. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado para inglés; no hay soporte declarado para castellano ni otros idiomas, por lo que su utilidad con transcripciones en español es dudosa y no está documentada.
- No transcribe audio: requiere un sistema de speech-to-text previo (como Whisper); solo procesa texto.
- Riesgo de alucinación: como todo LLM, puede alterar el contenido de la transcripción durante la limpieza, algo crítico en contextos médicos o legales donde la fidelidad al original es obligatoria; se recomienda verificación humana.
- Sesgos: hereda los sesgos del modelo base Qwen3.5 y del dataset de limpieza; no hay documentación específica sobre sesgos.
- Longitud de contexto: no disponible; puede limitar el tamaño de las transcripciones procesables de una sola pasada.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.
- Estas cuantizaciones son estáticas; no hay versiones imatrix disponibles actualmente, por lo que las cuantizaciones bajas (Q2_K, Q3_K) pueden perder calidad respecto a lo habitual.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/whispernow-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/category271/whispernow-qwen3.5-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Página de descargas de mradermacher: https://hf.tst.eu/model#whispernow-qwen3.5-4b-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
