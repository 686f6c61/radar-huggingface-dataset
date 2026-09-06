# mradermacher/Qwen3.5-KETI-HAECHI-27B-i1-GGUF

## Resumen

Qwen3.5-KETI-HAECHI-27B es un modelo multimodal de visión y lenguaje (image-text-to-text) de 26,9 mil millones de parámetros, desarrollado por KETI AIR a partir de la serie Qwen3.5. Está especializado en la comprensión del patrimonio cultural coreano, OCR y uso de herramientas, con soporte para razonamiento de largo horizonte y conversación en coreano e inglés.

Esta versión publicada por mradermacher contiene cuantizaciones GGUF con imatrix para ejecutar el modelo en hardware local con distintos niveles de compresión. Incluye múltiples formatos desde IQ1_S hasta Q6_K, lo que permite ajustar la calidad y el consumo de VRAM según el dispositivo disponible.

La relevancia del modelo radica en combinar capacidades de visión y lenguaje con tool calling en un volumen de 27B, lo que lo hace adecuado para tareas de digitalización de documentos históricos, asistentes de patrimonio cultural y agentes autónomos. No se ha publicado la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5 |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer multimodal de tipo vision-language. Se trata de una adaptación de la familia Qwen3.5 realizada por KETI AIR, con un codificador visual y un decodificador de lenguaje que procesa entradas de imagen y texto de forma conjunta. El pipeline registrado es `image-text-to-text`, lo que confirma su capacidad para tareas de comprensión de imágenes.

No se han publicado detalles específicos sobre la composición del dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible. La novedad técnica del modelo radica en su especialización en patrimonio cultural coreano, OCR y tool-use, combinada con la arquitectura Qwen3.5 subyacente.

## Capacidades

- Comprensión multimodal: entrada conjunta de imágenes y texto, con salida textual.
- OCR especializado en documentos y patrimonio cultural coreano.
- Tool calling / function calling, como indica la etiqueta `tool-use`.
- Razonamiento de largo horizonte, apto para pipelines de agentes multi-step.
- Conversación en coreano e inglés, con soporte para diálogo multi-turno.
- Integración con el ecosistema HuggingFace Transformers y GGUF para despliegue local.

## Casos de uso

- Digitalización de archivos históricos: el modelo transcribe y anota imágenes de documentos coreanos con alta carga de texto, combinando OCR y comprensión contextual.
- Asistentes de museos: generar descripciones y explicaciones de piezas de patrimonio cultural a partir de fotografías, con respuesta en coreano o inglés.
- Agentes de investigación: usar tool calling para buscar, procesar y sintetizar información en flujos de trabajo autónomos de varios pasos.
- Automatización de documentación en instituciones culturales: extraer metadatos, fechas y entidades de imágenes de archivo.
- Traducción asistida de textos coreanos: al reconocer el texto en la imagen, el modelo puede generar traducciones y resúmenes.
- Chatbots con contexto visual: aplicaciones de atención al usuario donde el sistema recibe capturas de pantalla o fotos y responde con instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 GB (IQ1_S, 7,2 GB) y 23 GB (Q6_K, 22,2 GB), más overhead del runtime. Para la cuantización recomendada Q4_K_M (16,6 GB) se estiman unas 18-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 3090 o A100 para Q4_K_M; tarjetas con 8-12 GB para cuantizaciones IQ1/IQ2.
- Ejecución en GPU de consumo: es posible con cuantizaciones Q4_K_S (15,7 GB) o inferiores en tarjetas de 16-20 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF. Los archivos mmproj de visión deben obtenerse del repositorio estático `mradermacher/Qwen3.5-KETI-HAECHI-27B-GGUF`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con modelos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta coreano e inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación en la generación de texto, especialmente en OCR ambiguo o imágenes de baja calidad.
- Las cuantizaciones agresivas (IQ1_S, IQ2_XXS, etc.) reducen significativamente la calidad de salida.
- El repositorio actual no incluye los archivos de proyección multimodal (mmproj); es necesario obtenerlos del repo estático para usar la parte de visión.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas generales no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero exige mantener el aviso de copyright y licencia en las distribuciones.

## Enlaces

- Repo HuggingFace (cuantizaciones i1-GGUF): https://huggingface.co/mradermacher/Qwen3.5-KETI-HAECHI-27B-i1-GGUF
- Repo HuggingFace (cuantizaciones estáticas): https://huggingface.co/mradermacher/Qwen3.5-KETI-HAECHI-27B-GGUF
- Repo HuggingFace del modelo original: https://huggingface.co/KETI-AIR/Qwen3.5-KETI-HAECHI-27B
