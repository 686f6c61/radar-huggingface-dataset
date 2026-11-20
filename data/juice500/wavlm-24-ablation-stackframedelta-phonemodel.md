# juice500/wavlm-24-ablation-stackframedelta-phonemodel

## Resumen

`wavlm-24-ablation-stackframedelta-phonemodel` es un modelo de segmentación y reconocimiento fonético (phone segmentation y phone recognition) desarrollado por el autor de Hugging Face `juice500`. No es un modelo de lenguaje generativo, sino un cabezal de predicción fonológica construido sobre las representaciones congeladas del encoder auto-supervisado de voz `microsoft/wavlm-large`. El modelo implementa la técnica SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del encoder en un vector de 43 activaciones de rasgos fonológicos (voicing, nasalidad, estridencia, entre otros), transformando una representación opaca en una interpretable.

La variante `stackframedelta` corresponde a una ablación concreta del stack de señal de frontera descrita en la Tabla 3 del artículo "Phone Segmentation and Recognition through Phonological Activation Mapping", presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo se distribuye como adaptador sobre WavLM-large (capa 24, entrada a 16 kHz) y se consume a través de la librería `phonespam`, que expone una API de alto nivel para transcribir audio en segmentos contiguos con etiquetas fonéticas.

Es relevante para investigadores en fonética computacional y procesamiento de voz que necesiten alineación fonética interpretable y reconocimiento de fonemas a partir de features auto-supervisados, sin reentrenar el encoder. El repo es de tamaño 0.0 GB, lo que sugiere que los pesos se cargan desde el modelo base y el adaptador es de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder WavLM-large (transformer auto-supervisado de voz), capa 24, entrada 16 kHz; cabezal SPAM con 43 activaciones fonológicas |
| Parametros totales | no disponible (repo de 0.0 GB; pesos del encoder base en `microsoft/wavlm-large`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por frames; no se especifica ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (adaptador cargable vía `phonespam`; el encoder base se obtiene de `microsoft/wavlm-large`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de adaptación sobre un encoder congelado: se toman las representaciones de la capa 24 de WavLM-large (un transformer auto-supervisado entrenado sobre voz a 16 kHz) y se mapean mediante SPAM a un vector de 43 activaciones de rasgos fonológicos en el rango [0, 1]. Sobre esa representación interpretable operan dos cabezales: uno de segmentación (detección de fronteras entre fonemas) y otro de reconocimiento (etiquetado del fonema). La variante `stackframedelta` es una ablación que reduce el stack de señal de frontera, según la Tabla 3 del artículo de referencia.

El entrenamiento se realizó sobre el dataset TIMIT ASR (`timit-asr/timit_asr`), un corpus clásico de voz leída en inglés con anotaciones fonéticas a nivel de fonema. No se dispone de información sobre el número de tokens, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a esta tarea). La innovación técnica destacable es la propia SPAM: convertir features auto-supervisados en activaciones fonológicas interpretables que alimentan tanto la segmentación como el reconocimiento, además de permitir restringir el vocabulario de salida a inventarios fonológicos de PHOIBLE por lengua.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Representación fonológica interpretable: expone una matriz de `(frames, 43)` activaciones de rasgos (voicing, nasalidad, estridencia, etc.) vía `model.spam(...)`.
- Restricción de vocabulario por lengua mediante `vocab_for_language`, que descarga el inventario PHOIBLE 2.0 correspondiente.
- Procesamiento de audio a 16 kHz con encoder WavLM-large.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No soporta visión ni audio generativo; la entrada es audio, la salida es etiquetas fonéticas y tiempos.
- Capacidad multilingüe limitada: el modelo está entrenado en inglés, aunque el vocabulario de salida puede restringirse a inventarios de otras lenguas vía PHOIBLE.

## Casos de uso

- Análisis fonético y lingüístico: obtener alineaciones a nivel de fonema de grabaciones en inglés para estudios de fonética y fonología, con la ventaja de disponer de activaciones de rasgos interpretables en lugar de representaciones opacas.
- Investigación en inteligencia artificial del habla: usar el modelo como sonda para estudiar qué información fonológica codifican las capas de WavLM-large, gracias a la matriz SPAM de 43 dimensiones.
- Preprocesado para pipelines de síntesis de voz (TTS): generar alineaciones fonéticas con tiempos para construir datasets de entrenamiento de modelos TTS a partir de audio sin anotar.
- Evaluación de pronunciación: comparar la secuencia de fonemas reconocida con la esperada para detectar errores de articulación en aprendices de inglés.
- Anotación asistida de corpus: acelerar el etiquetado fonético manual de corpus de voz en inglés, revisando y corrigiendo las salidas del modelo.
- Experimentación con inventarios fonológicos: usar `vocab_for_language` para restringir la decodificación a un inventario PHOIBLE concreto y estudiar la adaptación del modelo a otras lenguas sin reentrenar.
- Docencia y demos interactivas: la demo en Streamlit permite ilustrar segmentación y rasgos fonológicos en tiempo real en clase o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al tratarse de un adaptador sobre WavLM-large (encoder de ~300M de parámetros), la inferencia requiere cargar el encoder base completo. Se estima en el orden de varios GB de VRAM en fp32 y menos en fp16, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. La API admite `device="cuda"`; cualquier GPU con memoria suficiente para WavLM-large debería servir.
- Cabe en GPU de consumo: probablemente sí en GPUs con suficiente VRAM para WavLM-large (p. ej. RTX 3090/4090), aunque no hay confirmación publicada.
- Opciones de despliegue: librería `phonespam` (instalable con `pip install phonespam`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| `juice500/wavlm-24-ablation-stackframedelta-phonemodel` | Adaptador SPAM sobre WavLM-large para segmentación y reconocimiento fonético | `microsoft/wavlm-large` | en (vocabulario extensible vía PHOIBLE) | MIT | no disponible | Hugging Face, librería `phonespam` |
| `microsoft/wavlm-large` | Encoder auto-supervisado de voz (features genéricos) | — | multilingüe (preentrenamiento) | MIT | no disponible | Hugging Face |
| Modelos de reconocimiento fonético clásicos (p. ej. basados en CTC sobre MFCC) | Reconocimiento fonético supervisado | — | por lengua | variable | no disponible | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente sobre TIMIT ASR (inglés), por lo que su rendimiento fuera de ese dominio (habla espontánea, ruido, acentos no representados) es incierto y no está documentado.
- El uso de `vocab_for_language` para otras lenguas no implica que el modelo haya sido entrenado en ellas; es una restricción del espacio de salida, no una adaptación real.
- Riesgo de errores en fronteras y etiquetas fonéticas, especialmente en coarticulación y habla rápida; no se han publicado métricas de error en la información disponible.
- La licencia del modelo es MIT, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; hay que respetar esa licencia en productos derivados.
- Es un modelo de investigación (0 descargas, 0 likes en el momento de la ficha) sin validación comunitaria; no se recomienda para producción crítica sin evaluación propia.
- No es un modelo generativo: no puede usarse para transcripción ortográfica, diálogo ni tareas de lenguaje natural.
- Repo de 0.0 GB: conviene verificar que el adaptador se descarga correctamente y que el encoder base está accesible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-ablation-stackframedelta-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Artículo: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
