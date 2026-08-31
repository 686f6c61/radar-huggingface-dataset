# sachmatkris/agirdi

## Resumen

`sachmatkris/agirdi` es un modelo de reconocimiento automático del habla (ASR) especializado en lituano, desarrollado por Kristijonas Raudys (usuario `sachmatkris` en Hugging Face). Se trata de un fine-tuning del modelo `openai/whisper-large-v3-turbo` sobre el corpus de habla lituana LIEPA-3, utilizando únicamente las particiones de habla leída (`read`) y espontánea (`spon`). El modelo está diseñado para transcribir audio en lituano con alta precisión, logrando un WER del 3,05 % en el conjunto de test de LIEPA-3 y del 10,50 % en el conjunto externo FLEURS lituano.

Con 808,9 millones de parámetros, `agirdi` mantiene la arquitectura Whisper (encoder-decoder transformer) y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones. Su tamaño moderado y su especialización lo convierten en una opción práctica para aplicaciones de transcripción en lituano, tanto en entornos de investigación como en producción, con requisitos de hardware asequibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper, 30 segundos, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | lituano (lt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado originalmente para ASR multilingüe. `agirdi` se obtiene mediante fine-tuning de `openai/whisper-large-v3-turbo` sobre el corpus LIEPA-3, un conjunto de habla lituana distribuido bajo licencia CC BY 4.0. El entrenamiento se realizó exclusivamente con las particiones `read` (habla leída) y `spon` (habla espontánea) del corpus, excluyendo otras particiones. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa; se trata de un fine-tuning supervisado estándar para la tarea de transcripción.

## Capacidades

- Transcripción de audio en lituano a texto, con soporte para habla leída y espontánea.
- Reconocimiento de voz con alta precisión en el dominio de entrenamiento (WER 3,05 % en test de LIEPA-3).
- Generalización a otros conjuntos de habla lituana, como FLEURS, aunque con mayor WER (10,50 %).
- Integración sencilla con la librería `transformers` de Hugging Face mediante el pipeline de ASR.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en lituano a texto de forma automática, facilitando la generación de actas o resúmenes. Su bajo WER en habla espontánea lo hace adecuado para conversaciones naturales.
- Subtitulado de vídeos: al transcribir audio en lituano, permite generar subtítulos para contenido audiovisual, tanto en directo como en diferido, con una precisión suficiente para uso profesional.
- Atención al cliente automatizada: integrado en sistemas de IVR o chatbots, puede transcribir llamadas de clientes en lituano para su posterior análisis o para alimentar sistemas de comprensión del lenguaje.
- Asistencia a personas con discapacidad auditiva: la transcripción en tiempo real de conversaciones o eventos en lituano puede mejorar la accesibilidad en entornos educativos o públicos.
- Investigación lingüística: el modelo sirve como herramienta para transcribir corpus orales en lituano, facilitando estudios fonéticos, sociolingüísticos o de procesamiento del lenguaje natural.
- Archivado y búsqueda de contenido audiovisual: al transcribir archivos de audio o vídeo en lituano, se habilita la indexación y búsqueda por texto en bibliotecas digitales o archivos históricos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de WER (Word Error Rate, menor es mejor):

| Dataset | WER |
|---|---|
| LIEPA-3 test set | 3,05 % |
| FLEURS lituano | 10,50 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la documentación del modelo.
- Con 808,9 millones de parámetros, el modelo es relativamente ligero en comparación con otros Whisper de gran tamaño; en FP16, los pesos ocupan aproximadamente 1,6 GB, por lo que podría ejecutarse en GPUs con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- El código de ejemplo proporcionado utiliza la librería `transformers` y permite ejecución en CPU o GPU mediante el parámetro `device`.
- Opciones de despliegue: se puede usar con el pipeline de Hugging Face, `transformers`, o exportar a formatos como ONNX para inferencia optimizada. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables para lituano en la documentación proporcionada. Se podría comparar con el modelo base `openai/whisper-large-v3-turbo`, pero no se han reportado sus métricas en lituano. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en lituano; no se recomienda su uso para otros idiomas.
- El rendimiento puede degradarse con grabaciones de baja calidad, ruido de fondo, acentos regionales, dialectos o terminología técnica específica, como se indica en la model card.
- El modelo puede heredar sesgos y limitaciones del modelo base Whisper y del corpus LIEPA-3, que podrían afectar a la precisión en ciertos grupos de hablantes o dominios.
- Aunque la licencia MIT permite uso comercial, el corpus de entrenamiento LIEPA-3 está bajo CC BY 4.0, lo que implica atribución obligatoria si se redistribuyen datos derivados.
- No se han documentado limitaciones adicionales como alucinaciones o problemas de contexto, pero al ser un modelo ASR, el riesgo de alucinación se limita a la generación de texto incorrecto en la transcripción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachmatkris/agirdi
- Dataset LIEPA-3: https://huggingface.co/datasets/meldynamics/liepa-3
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
