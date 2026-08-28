# csikasote/omniASR-CTC-1B-v2-Zulu-All

## Resumen

El modelo `csikasote/omniASR-CTC-1B-v2-Zulu-All` es un ajuste fino (fine-tuning) del modelo base `facebook/omniASR-CTC-300M` de Meta AI, especializado en reconocimiento automático del habla (ASR) para la lengua isiZulu (`zul_Latn`). Forma parte de la familia OmniASR, un sistema de ASR omnilingüe de código abierto que cubre más de 1600 lenguas, incluyendo muchas que no tenían soporte previo. Este modelo concreto se ha entrenado durante 100.000 pasos y alcanza un WER de validación de 15,93, lo que lo convierte en una opción práctica para transcripción de audio en isiZulu.

El checkpoint se distribuye en formato nativo de fairseq2, no directamente cargable con `AutoModelForCTC` sin conversión previa. Aunque el nombre del repositorio sugiere 1B de parámetros, la model card indica que el modelo base es de 300M, por lo que el tamaño real no está confirmado. La licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su integración en aplicaciones productivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) basada en transformer, segun la familia OmniASR |
| Parametros totales | no disponible (el nombre del repo sugiere 1B, pero la model card indica base de 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato nativo fairseq2, sin cuantizaciones publicadas) |
| Idiomas soportados | isiZulu (`zul_Latn`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint nativo fairseq2 (`.pt`), tokenizer `.model` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `facebook/omniASR-CTC-300M`, que pertenece a la familia OmniASR de Meta AI. Esta familia combina modelos CTC para ASR rápido y eficiente, con soporte para más de 1600 lenguas mediante aprendizaje zero-shot y la posibilidad de añadir nuevas lenguas con pocos ejemplos. El entrenamiento de este modelo específico se realizó con datos de habla isiZulu, alcanzando el mejor checkpoint en el paso 100.000 con un WER de validación de 15,93. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO. El checkpoint se distribuye en formato nativo de fairseq2, lo que implica que no es compatible directamente con la API `transformers` sin conversión.

## Capacidades

- Transcripción de audio en isiZulu: convierte habla en texto con un WER de validación de 15,93.
- Reconocimiento de voz en tiempo real: al ser un modelo CTC, está optimizado para inferencia rápida y alto rendimiento.
- Soporte de lenguas de bajos recursos: el modelo se centra en isiZulu, una lengua con escasa cobertura en ASR comercial.
- Integración con el ecosistema fairseq2: permite usar las herramientas de Meta para entrenamiento e inferencia.
- No se han documentado capacidades de tool calling, agentes, visión ni modos de razonamiento especiales.

## Casos de uso

- Transcripción de entrevistas y reuniones en isiZulu: el modelo puede convertir grabaciones de audio en texto con una precisión razonable, facilitando la documentación y el análisis posterior.
- Subtitulado automático de vídeos en isiZulu: al ser un modelo CTC rápido, puede procesar vídeo en tiempo real o en lote para generar subtítulos en esta lengua.
- Asistentes de voz para comunidades zulúes: integración en aplicaciones móviles o web que requieran entrada de voz en isiZulu, mejorando la accesibilidad.
- Archivado y búsqueda de contenido oral: transcripción de archivos históricos o entrevistas para hacerlos buscables mediante texto.
- Investigación lingüística: análisis fonético y sintáctico de la lengua isiZulu a partir de transcripciones automáticas.
- Sistemas de atención al cliente en isiZulu: transcripción de llamadas para análisis de calidad o generación de resúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. El único dato de rendimiento es el WER de validación de 15,93 en el paso 100.000, que se menciona en la model card. No hay comparación con otros modelos ASR para isiZulu ni con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de tamaño moderado (probablemente 300M de parámetros), podría ejecutarse en GPUs consumer con 8-12 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Se sugiere consultar la documentación de OmniASR para requisitos específicos.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño del modelo base, pero no confirmado.
- Opciones de despliegue: fairseq2, con posibilidad de conversión a otros formatos (no documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. La familia OmniASR incluye otros modelos CTC (como `facebook/omniASR-CTC-1B`), pero no hay datos de rendimiento comparativo publicados en la información proporcionada. Se recomienda consultar el repositorio oficial de OmniASR para más detalles.

## Limitaciones y advertencias

- El modelo solo soporta isiZulu; no es multilingüe.
- El checkpoint está en formato nativo fairseq2, lo que requiere conversión para usarlo con librerías estándar como `transformers`.
- No se incluye el checkpoint completo de entrenamiento, solo el mejor checkpoint de validación.
- El WER de 15,93 indica que aún hay margen de error en la transcripción, especialmente con acentos, ruido o vocabulario especializado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos limitados, puede presentar alucinaciones o errores en contextos poco representados.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento para cumplir con normativas de privacidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/csikasote/omniASR-CTC-1B-v2-Zulu-All)
- [Modelo base facebook/omniASR-CTC-1B](https://huggingface.co/facebook/omniASR-CTC-1B)
- [Documentación de modelos CTC en DeepWiki](https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr))
- [Repositorio GitHub de OmniASR (copia)](https://github.com/chrisciokler/ai-meta-omnilingual-asr)
- [README original de OmniASR](https://raw.githubusercontent.com/facebookresearch/omnilingual-asr/main/README.md)
