# bodhan-ai/indic-transcribe-core

## Resumen

`bodhan-ai/indic-transcribe-core` es un modelo de reconocimiento automático del habla (ASR) desarrollado por Bodhan, resultado de un ajuste fino sobre `nvidia/canary-1b-v2`. Está diseñado para transcribir audio en inglés y en 24 lenguas índicas, con soporte explícito para code-switching y code-mixing. La arquitectura es FastConformer, con 1.222.553.584 parámetros y pesos distribuidos en formato safetensors. El modelo es relevante porque atiende la necesidad de sistemas de transcripción robustos en un mercado multilingüe como el indio, donde la mezcla de idiomas en una misma locución es habitual. El acceso está restringido (gated) en HuggingFace y requiere aceptar las condiciones del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (basado en nvidia/canary-1b-v2) |
| Parametros totales | 1.222.553.584 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, bhb |
| Licencia | other (consultar condiciones en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura FastConformer de `nvidia/canary-1b-v2`, un modelo ASR de Nvidia conocido por su eficiencia en el procesamiento de audio y su capacidad para trabajar con múltiples idiomas. En este caso, Bodhan ha realizado un ajuste fino para adaptar el modelo a lenguas índicas y a la mezcla de idiomas (code-switching). No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales en la información disponible; la arquitectura se mantiene esencialmente igual que la del modelo base.

## Capacidades

- Transcripción automática de voz (ASR) en 25 idiomas: inglés y lenguas índicas como as, bn, gu, hi, kn, ml, mr, ta, te, ur, entre otras.
- Soporte de code-switching y code-mixing, lo que permite transcribir locuciones que alternan entre varios idiomas.
- Identificación de idioma en audio (language identification), según las etiquetas del modelo.
- Extracción de características de audio (feature extraction) para tareas posteriores de análisis o clasificación.
- No se indica soporte de tool calling, agentes ni razonamiento multi-step, al tratarse de un modelo orientado a reconocimiento de voz.

## Casos de uso

1. Transcripción de reuniones y conferencias: el modelo puede capturar conversaciones en las que se alternan idiomas indios, generando texto con la mezcla exacta de lenguas.
2. Subtitulado automático de vídeos educativos: adecuado para contenidos en lenguas índicas, facilitando la accesibilidad en plataformas de vídeo.
3. Atención al cliente multilingüe: transcripción de llamadas de soporte técnico en mercados indios, para su posterior análisis y extracción de intenciones.
4. Dictado médico: profesionales sanitarios que hablen en hindi, bengalí o tamil pueden dictar notas clínicas que se transcriben automáticamente.
5. Investigación lingüística: etiquetado y análisis de corpus de habla en lenguas minoritarias o poco representadas de la India.
6. Identificación de idioma en archivos de audio: clasificación del idioma de una locución para enrutamiento, catalogación o sistemas de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 4,9 GB.
- VRAM estimada para inferencia: no disponible (el modelo tiene 1.222.553.584 parámetros, lo que a priori requiere un espacio de memoria de al menos 2,4 GB en FP16, pero no se ofrecen cifras oficiales).
- GPU recomendadas: no disponible.
- Puede ejecutarse en GPU de consumo: no disponible.
- Opciones de despliegue: Transformers, según las instrucciones de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. El modelo base es `nvidia/canary-1b-v2`, sobre el que se ha realizado el ajuste fino, pero no se dispone de métricas comparativas verificadas.

## Limitaciones y advertencias

- Acceso restringido: el modelo está publicado en HuggingFace con acceso gated, por lo que es necesario aceptar las condiciones para poder descargarlo y usarlo.
- Licencia ambigua: la licencia indicada como "other" no especifica claramente los términos de uso, especialmente en lo relativo al uso comercial.
- No se documentan sesgos, pero al ser un ajuste fino no oficial puede heredar sesgos del modelo base y del corpus de entrenamiento.
- Riesgo de alucinación: los modelos ASR pueden producir transcripciones incorrectas, especialmente con audio de baja calidad, ruido o acentos no representados.
- Longitud de contexto no especificada: puede no soportar audios muy largos sin segmentación previa.

## Enlaces

- HuggingFace: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Sitio web de Bodhan: https://console.bodhan.ai/
