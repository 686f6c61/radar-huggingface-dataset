# DariusTheGeek/waxal-lin-omniasr-ctc-1b

## Resumen

El modelo `DariusTheGeek/waxal-lin-omniasr-ctc-1b` es un fine-tune del checkpoint `facebook/omniASR-CTC-1B` de Meta AI, especializado en reconocimiento automático de voz (ASR) para el idioma lingala. Forma parte de la solución WAXAL ASR, desarrollada por DariusTheGeek para el desafío Google WAXAL ASR de la plataforma Zindi, que aborda la transcripción de audio en dos lenguas africanas (lingala y shona) sin metadatos de idioma.

El modelo se ha ajustado sobre el split supervisado de lingala del dataset `google/WaxalNLP` y utiliza una decodificación greedy. Con aproximadamente 1.000 millones de parámetros, está pensado como un componente de un conjunto (ensemble) de cuatro modelos, donde se combina mediante fusión ROVER conservadora. No está diseñado para su uso aislado, sino integrado en el pipeline completo de la solución, que incluye enrutamiento, decodificación, fusión y postprocesado.

La relevancia de este modelo radica en su contribución a la mejora del ASR para lenguas de bajos recursos como el lingala, demostrando que el fine-tune de modelos omnilingües puede adaptarse eficazmente a idiomas subrepresentados. Su licencia Apache 2.0 facilita su reutilización tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune de `facebook/omniASR-CTC-1B`, que emplea un enfoque CTC sobre un encoder de audio) |
| Parametros totales | ~1.000 millones (estimado a partir del tamaño del checkpoint de 3,9 GB en FP32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye como checkpoint en FP32) |
| Idiomas soportados | Lingala (ln) (el modelo base es omnilingue, pero este fine-tune esta especializado en lingala) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) via fairseq2 |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/omniASR-CTC-1B`, parte de la familia Omnilingual ASR de Meta AI. Aunque no se detalla la arquitectura interna en la documentación disponible, se sabe que utiliza un enfoque CTC (Connectionist Temporal Classification) sobre un encoder de audio, típicamente un Transformer o Conformer. El checkpoint original fue preentrenado con datos multilingües a gran escala.

El fine-tune se realizó sobre el split supervisado de lingala del dataset `google/WaxalNLP`, con semilla 42. El artefacto liberado corresponde al promedio uniforme de los tres mejores pasos de entrenamiento (steps 2505, 3006 y 4008), y la decodificación se realiza con greedy. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es un ajuste supervisado estándar para ASR.

## Capacidades

- Transcripción de audio en lingala a texto, con precisión adecuada para el dominio de la competición WAXAL.
- Reconocimiento de voz basado en CTC, eficiente en inferencia al no requerir decodificación autoregresiva.
- Integración con el pipeline de la solución WAXAL ASR, que incluye enrutamiento por idioma y fusión de múltiples modelos.
- Al estar basado en un modelo omnilingüe, conserva cierta capacidad de reconocimiento en otros idiomas, aunque su rendimiento óptimo se limita al lingala.
- No dispone de capacidades de tool calling, agentes, visión ni otras modalidades; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y conferencias en lingala: el modelo puede convertir audio a texto en tiempo real o diferido, facilitando actas y búsquedas de contenido.
- Subtitulado automático de vídeos en lingala: integrado en herramientas de edición, permite generar subtítulos para contenidos audiovisuales dirigidos a hablantes de este idioma.
- Asistentes de voz en lingala: combinado con un motor de diálogo, puede transcribir comandos de voz para aplicaciones móviles o dispositivos IoT.
- Archivado y búsqueda de contenido sonoro: transcripción de bibliotecas de audio en lingala para indexación y recuperación de información.
- Investigación lingüística: análisis de corpus orales en lingala, facilitando estudios fonéticos, morfológicos o sociolingüísticos.
- Evaluación de calidad de servicios de ASR: como componente de referencia en comparativas de modelos para lenguas africanas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER o CER para este modelo en particular. Se sabe que forma parte de una solución que compitió en el desafío WAXAL ASR de Zindi, pero no se proporcionan los resultados individuales del modelo.

## Requisitos de hardware

- El checkpoint en FP32 ocupa aproximadamente 3,9 GB, por lo que se requiere al menos 4 GB de VRAM para cargarlo sin cuantización.
- Con cuantización a FP16 (si se convierte manualmente), el uso de VRAM se reduce a ~2 GB, y a ~1 GB con int8.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior para inferencia cómoda; tarjetas con menos VRAM pueden usar cuantización o cargar el modelo en CPU.
- El modelo se distribuye en formato fairseq2, por lo que no es directamente compatible con vLLM, Ollama o llama.cpp sin conversión previa. El repositorio de la solución incluye un entorno pinneado con `fairseq2` y scripts de inferencia.
- Al ser un modelo CTC, la inferencia es más rápida que un LLM autoregresivo; se puede ejecutar en tiempo real en GPUs de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `DariusTheGeek/waxal-lin-omniasr-ctc-1b` | ~1B | No disponible | Lingala | Apache 2.0 | fairseq2 (PyTorch) |
| `facebook/omniASR-CTC-1B` (base) | ~1B | No disponible | Omnilingue | Apache 2.0 | fairseq2 |
| `DariusTheGeek/waxal-lin-omniasr-llm-1b` | ~1B (LLM) | No disponible | Lingala | Apache 2.0 | fairseq2 |
| `yehoshua01/waxal-omni-ctc1b-lin` | ~1B | No disponible | Lingala | Apache 2.0 | fairseq2 |

La comparativa muestra que todos los modelos derivan de la misma familia omniASR y se han fine-tuneado para lingala. La diferencia principal radica en el tipo de decodificación (CTC vs LLM) y en el rendimiento específico en el desafío WAXAL, aunque no se dispone de métricas públicas para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no está diseñado para uso aislado; debe integrarse en el pipeline completo de la solución WAXAL ASR para obtener resultados óptimos.
- Especializado en lingala, su rendimiento en otros idiomas puede ser deficiente a pesar de la base omnilingüe.
- No se han documentado sesgos específicos, pero al ser un modelo de ASR, puede presentar errores con acentos no representados en el dataset de entrenamiento o con audio de baja calidad.
- Riesgo de alucinación en transcripciones: como cualquier modelo de ASR, puede generar texto plausible pero incorrecto en segmentos ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia.
- No se proporcionan garantías de rendimiento en entornos de producción; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- [HuggingFace - DariusTheGeek/waxal-lin-omniasr-ctc-1b](https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-ctc-1b)
- [Repositorio de la solución WAXAL ASR](https://github.com/DariusTheGeek/waxal-asr-solution)
- [Dataset google/WaxalNLP](https://huggingface.co/datasets/google/WaxalNLP)
- [Modelo base facebook/omniASR-CTC-1B](https://huggingface.co/facebook/omniASR-CTC-1B)
- [Modelo hermano waxal-lin-omniasr-llm-1b](https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-llm-1b)
- [Modelo conjunto waxal-joint-ctc-1b-lid](https://huggingface.co/DariusTheGeek/waxal-joint-ctc-1b-lid)
