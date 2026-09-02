# ousseynou2/whisper-small-hi

## Resumen

El modelo `ousseynou2/whisper-small-hi` es un ajuste fino (fine-tuning) de `openai/whisper-small` sobre el dataset `ousseynou/alffa`, que corresponde a la configuración `hi` (hindi) de Common Voice 11.0. El autor, `ousseynou2`, ha publicado este checkpoint con la intención de adaptar el reconocimiento automático del habla (ASR) de Whisper al idioma hindi. Sin embargo, los resultados reportados en la model card indican un WER (Word Error Rate) de 102,57 sobre el conjunto de evaluación, un valor extremadamente alto que sugiere que el proceso de entrenamiento no ha producido un modelo funcional para la transcripción en hindi.

El modelo conserva la arquitectura original de Whisper-small, un transformer encoder-decoder con aproximadamente 242 millones de parámetros, y se distribuye bajo licencia Apache 2.0. A pesar de que el repositorio declara compatibilidad con la librería `transformers` y el pipeline de reconocimiento automático del habla, el rendimiento medido hace que no sea recomendable su uso en ningún escenario práctico. La ficha técnica que sigue detalla las especificaciones, el proceso de entrenamiento y las limitaciones observadas, con el objetivo de que desarrolladores e investigadores evalúen rápidamente su idoneidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de whisper-small: 30 s de audio, 448 tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi (hindi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-small`, que emplea una arquitectura transformer encoder-decoder con atención de escala logarítmica y normalización de capa pre-post. Whisper-small fue entrenado originalmente por OpenAI sobre 680.000 horas de audio multilingüe, pero este checkpoint concreto se ha ajustado únicamente sobre el subconjunto en hindi de Common Voice 11.0, accesible a través del dataset `ousseynou/alffa`. El entrenamiento se realizó con la librería `transformers` (versión 5.16.1) y PyTorch 2.11.0, utilizando una tasa de aprendizaje de 1e-5, un tamaño de lote de 16 para entrenamiento y 8 para evaluación, un optimizador AdamW con betas (0.9, 0.999) y un programador de tasa de aprendizaje lineal con 500 pasos de calentamiento. El número total de pasos de entrenamiento fue de 50, lo que equivale a menos de una época (0,0816 épocas según la tabla de resultados). No se menciona el uso de técnicas como RLHF o DPO; el proceso se limita a un ajuste supervisado estándar con pérdida de entropía cruzada.

## Capacidades

- Reconocimiento automático del habla (ASR) en hindi, aunque con un rendimiento deficiente según el WER reportado.
- Herencia de las capacidades multilingües de Whisper-small, pero el ajuste fino no ha logrado mejorar la precisión en hindi.
- No se reporta soporte para tool calling, agentes o razonamiento multi-paso; el modelo es exclusivamente un sistema de transcripción de audio a texto.
- No se indica soporte para visión, audio adicional o modos de pensamiento extendido.
- La capacidad de generación de texto se limita a la transcripción; no se han documentado otras tareas.

## Casos de uso

Dado el WER de 102,57 (superior a 100, lo que indica que el modelo produce transcripciones completamente incorrectas), no se recomienda su uso en ningún escenario real. A continuación se enumeran casos de uso que serían aplicables si el modelo funcionara correctamente, pero que en su estado actual no son viables:

- Transcripción de reuniones y entrevistas en hindi: se esperaría que el modelo convirtiera audio a texto con alta fidelidad, pero el WER actual lo impide.
- Subtitulado automático de vídeos en hindi: requeriría una precisión mínima que este checkpoint no alcanza.
- Asistentes de voz en hindi: la integración en sistemas de diálogo fallaría por la baja calidad de las transcripciones.
- Análisis de llamadas de atención al cliente: la extracción de información de audio sería inútil con este nivel de error.
- Herramientas de accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real no sería fiable.
- Investigación académica sobre ASR en hindi: podría servir como ejemplo de un ajuste fino fallido, pero no como modelo de producción.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado sobre el conjunto de evaluación de Common Voice 11.0 (configuración `hi`):

| Métrica | Valor |
|---|---|
| WER (Word Error Rate) | 102,5737 |
| Loss (pérdida de validación) | 2,5471 |

Este WER es superior a 100, lo que indica que el modelo no produce ninguna transcripción correcta en el conjunto de prueba. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 242 millones de parámetros, la inferencia en precisión fp32 requiere aproximadamente 1 GB de VRAM.
- Con cuantización a int8, el uso de VRAM se reduce a unos 500 MB, aunque no se han publicado pesos cuantizados en el repositorio.
- Es viable en GPUs de consumo como la RTX 3060 (12 GB) o superiores, así como en hardware de gama baja con 4 GB de VRAM si se aplica cuantización.
- Opciones de despliegue: al ser un modelo de la familia Whisper, puede ejecutarse con `transformers`, `whisper.cpp`, `Ollama` (si se convierte a GGUF) o `vLLM` (aunque no es óptimo para ASR).
- No se dispone de datos de latencia o throughput específicos para este checkpoint.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en la documentación proporcionada. Como referencia, el modelo base `openai/whisper-small` tiene un rendimiento conocido en hindi muy superior al de este ajuste fino, pero no se han incluido cifras concretas en la información disponible. Se recomienda consultar los benchmarks oficiales de Whisper para obtener datos comparativos.

## Limitaciones y advertencias

- El WER de 102,57 indica que el modelo no es funcional para la transcripción en hindi; cualquier uso en producción producirá resultados inutilizables.
- El entrenamiento se realizó con solo 50 pasos y menos de una época, lo que sugiere un ajuste insuficiente o un problema en el dataset de entrenamiento.
- La model card presenta inconsistencias: el nombre del modelo es "Whisper-wolof" aunque el idioma declarado es hindi, lo que puede indicar errores en la configuración del entrenamiento.
- No se han documentado sesgos específicos, pero al ser un modelo fallido, no se puede evaluar su comportamiento en términos de sesgo o alucinación.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace que no sea recomendable su utilización en productos comerciales.
- No se han publicado pesos cuantizados ni versiones optimizadas para inferencia en dispositivos edge.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ousseynou2/whisper-small-hi)
- [Modelo base openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Model card de Whisper](https://github.com/openai/whisper/blob/main/model-card.md)
