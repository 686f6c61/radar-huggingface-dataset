# csikasote/omniASR-CTC-3B-v2-Zulu-All

## Resumen

El modelo `csikasote/omniASR-CTC-3B-v2-Zulu-All` es un ajuste fino (fine-tune) del modelo base `facebook/omniASR-CTC-300M` de Meta, especializado en reconocimiento automático del habla (ASR) para la lengua isiZulu (`zul_Latn`). A pesar del nombre del repositorio, que sugiere 3B de parámetros, el modelo base es de 300M, y el README del autor lo identifica explícitamente como "OmniASR CTC 300M v2". El desarrollo corre a cargo de `csikasote`, un usuario independiente, y se distribuye bajo licencia Apache 2.0.

El modelo utiliza la arquitectura CTC (Connectionist Temporal Classification) de la familia OmniASR, diseñada para ofrecer transcripción rápida y eficiente en más de 1600 idiomas. Este fine-tune se centra exclusivamente en isiZulu, logrando un WER de validación de 15,93 tras 100.000 pasos de entrenamiento. Su relevancia radica en cubrir una lengua con escasa representación en sistemas ASR comerciales, aprovechando un modelo base multilingüe de código abierto.

El checkpoint se distribuye en formato nativo de fairseq2 (`.pt`), no directamente compatible con `AutoModelForCTC` sin conversión previa. El repositorio incluye el tokenizador, archivos de configuración y un script de inferencia de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniASR CTC (Connectionist Temporal Classification) |
| Parametros totales | 300M (modelo base `facebook/omniASR-CTC-300M`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint nativo fairseq2, sin cuantizaciones publicadas) |
| Idiomas soportados | isiZulu (`zul_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo fairseq2 (`.pt`), tokenizador `.model` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OmniASR CTC de Meta, que emplea clasificación temporal conexionista para decodificación directa de audio a texto. Esta familia de modelos está diseñada para priorizar velocidad de inferencia y alto rendimiento en tareas de transcripción en tiempo real, manteniendo precisión competitiva en un amplio espectro de idiomas. El modelo base de 300M fue preentrenado con el corpus multilingüe de Meta (1600+ idiomas), y este fine-tune lo adapta específicamente a isiZulu.

El entrenamiento de ajuste fino se realizó durante 100.000 pasos, alcanzando un WER de validación de 15,93 (mejor checkpoint) y 15,92 (paso final). No se especifican detalles del dataset de entrenamiento, composición de datos ni técnicas de alineación como RLHF o DPO. El checkpoint se guarda en formato nativo de fairseq2, lo que implica que no es cargable directamente con librerías estándar de HuggingFace sin conversión.

## Capacidades

- Reconocimiento automático del habla (ASR) para isiZulu, transcribiendo audio a texto con un WER de validación de 15,93.
- Inferencia rápida gracias a la arquitectura CTC, adecuada para transcripción en tiempo real o de alto volumen.
- Soporte de decodificación greedy o beam search (no especificado en la documentación, pero típico en modelos CTC).
- Capacidad de procesar audio en formato de onda, aunque no se detallan los formatos de entrada soportados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras tareas fuera de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en isiZulu: el modelo puede convertir grabaciones de audio en texto con baja latencia, facilitando la generación de actas o subtítulos.
- Subtitulado automático de vídeos en isiZulu: integrable en pipelines de postproducción para generar subtítulos sincronizados, aprovechando la velocidad de la arquitectura CTC.
- Asistentes de voz para aplicaciones móviles en regiones de habla zulú: el modelo puede servir como backend de reconocimiento de voz para comandos o dictado.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en isiZulu para indexación y recuperación de información.
- Investigación lingüística y documentación de lenguas: útil para crear corpus transcritos de isiZulu, contribuyendo a la preservación de la lengua.
- Sistemas de accesibilidad: conversión de contenido hablado en isiZulu a texto para personas con discapacidad auditiva.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de validación en el README:

| Metrica | Valor |
|---|---|
| WER (mejor checkpoint, paso 100.000) | 15,93 |
| WER (paso final, 100.000) | 15,92 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo ASR especializado.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado que el modelo tiene 300M de parámetros, una estimación razonable para inferencia en FP32 sería de aproximadamente 1,2 GB de VRAM, aunque el checkpoint nativo puede requerir más memoria durante la carga.
- Es probable que quepa en GPUs de consumo como RTX 3060 (12 GB) o superiores, pero no hay confirmación oficial.
- Opciones de despliegue: al ser un checkpoint fairseq2, se requiere el framework fairseq2 para cargarlo. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables específicamente para isiZulu. El modelo base `facebook/omniASR-CTC-300M` es multilingüe y cubre isiZulu de forma general, pero este fine-tune mejora su rendimiento en esa lengua. No hay datos públicos de otros fine-tunes de OmniASR para isiZulu con los que comparar.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en isiZulu; no soporta otros idiomas.
- El checkpoint está en formato nativo fairseq2, lo que dificulta su uso con herramientas estándar de HuggingFace sin conversión manual.
- No se incluye el checkpoint completo de entrenamiento, solo el modelo final, lo que limita la reproducibilidad.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de habla, puede presentar errores en acentos, dialectos o habla no estándar.
- Riesgo de alucinación en transcripciones: como todo sistema ASR, puede generar texto incorrecto en audio de baja calidad o con ruido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el corpus de Meta tienen sus propias condiciones; se recomienda revisar la licencia del modelo base.
- No se proporcionan métricas de rendimiento en condiciones de ruido, habla superpuesta o audio de baja fidelidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/csikasote/omniASR-CTC-3B-v2-Zulu-All
- Modelo base de Meta: https://huggingface.co/facebook/omniASR-CTC-3B
- Documentación de modelos CTC en DeepWiki: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Demo de OmniASR de Meta: https://aidemos.atmeta.com/omnilingualasr
- Repositorio GitHub de Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
