# nahomazmach/whisper-small-ha-en-direct-pilot

## Resumen

`whisper-small-ha-en-direct-pilot` es un adaptador LoRA sobre el modelo `openai/whisper-small`, desarrollado por `nahomazmach` como un piloto experimental para la traducción directa de voz en hausa a texto en inglés. A diferencia del enfoque en cascada del proyecto (ASR hausa + NLLB-200), este modelo intenta saltar el paso intermedio de transcripción en hausa, entrenándose directamente con pares de audio hausa y texto inglés. El objetivo es comprobar si se evita la propagación de errores del reconocimiento de voz, que en la cascada degrada la traducción (BLEU ~8-10 frente a ~22-25 con texto limpio). Sin embargo, los resultados obtenidos son muy bajos (BLEU 0.24 en validación), lo que sugiere que la cantidad de datos de entrenamiento (256 ejemplos) es insuficiente. Se trata de un checkpoint de viabilidad, no de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer) con adaptador LoRA |
| Parametros totales | 243M (modelo base) + 1.77M (adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (adaptador LoRA en safetensors) |
| Idiomas soportados | hausa (ha), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en `openai/whisper-small`, un transformer encoder-decoder con atención estándar, diseñado originalmente para reconocimiento de voz multilingüe. Sobre este modelo base se añade un adaptador LoRA de rango 16, que introduce 1.77 millones de parámetros entrenables (0.7% del total). El entrenamiento se realizó sobre un subconjunto de 256 ejemplos de audio hausa con traducción al inglés del dataset `McGill-NLP/NaijaS2ST`, durante 50 pasos (3.125 épocas). No se aplicaron técnicas de RLHF ni DPO; el ajuste es supervisado directamente con pares audio-texto. La innovación principal es la omisión del paso intermedio de transcripción en hausa, lo que constituye un enfoque de traducción de voz directa (speech-to-text translation) en lugar de una cascada ASR + MT.

## Capacidades

- Traducción de voz hausa a texto inglés: el modelo recibe audio en hausa y genera directamente texto en inglés, sin transcripción intermedia.
- Reconocimiento de voz en hausa (potencial): aunque el adaptador se entrenó para la tarea `translate`, el modelo base puede realizar ASR si se usa `task=transcribe`, pero no se ha evaluado esta capacidad en el adaptador.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas a hausa e inglés, con el inglés como idioma de salida.
- Capacidades especiales: ninguna adicional; no incluye visión, audio de entrada más allá de 16 kHz, ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre traducción de voz directa: este modelo sirve como banco de pruebas para comparar el enfoque directo frente al de cascada, permitiendo analizar si la falta de datos es la causa del bajo rendimiento o si el paradigma en sí tiene limitaciones.
- Validación de metodologías de selección de datos: el subconjunto de 256 ejemplos se eligió mediante una auditoría basada en metadatos para evitar descargas masivas; este modelo puede usarse para estudiar el impacto del tamaño del corpus en tareas de traducción de voz.
- Desarrollo de adaptadores LoRA para whisper: al ser un adaptador ligero, puede servir como ejemplo de cómo aplicar PEFT a modelos de voz, aunque sus resultados no sean competitivos.
- Evaluación de métricas de traducción automática: los valores de BLEU y chrF++ obtenidos pueden utilizarse para calibrar umbrales de calidad en entornos experimentales.
- Pruebas de integración en pipelines de investigación: el código de uso proporcionado permite integrar el modelo en flujos de trabajo de Hugging Face para pruebas de concepto.
- Análisis de propagación de errores: al comparar con la cascada, este modelo ayuda a cuantificar cuánto error introduce el paso de transcripción intermedia, aunque en este caso el rendimiento es demasiado bajo para extraer conclusiones sólidas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| BLEU (validación) | 0.24 |
| chrF++ (validación) | 14.39 |

Estos resultados se obtuvieron sobre un subconjunto de validación derivado del split de entrenamiento, no sobre el split oficial `dev` de NaijaS2ST. El autor indica que el rendimiento está muy por debajo del enfoque en cascada (BLEU ~8-10 con salida real de ASR), lo que atribuye principalmente a la insuficiencia de datos de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación proporcionada. Dado que el modelo base es `whisper-small` (243M parámetros), se puede inferir que es ejecutable en GPUs con al menos 2 GB de VRAM en FP16, o incluso en CPU con latencia mayor, pero estos datos no están confirmados por el autor. Las opciones de despliegue típicas para adaptadores PEFT incluyen `transformers` con `peft`, y también podrían usarse `vLLM` o `llama.cpp` si se convierte a GGUF, aunque no se mencionan en la documentación.

## Comparativa con modelos similares

| Modelo | Enfoque | BLEU (validación) | Contexto | Licencia |
|---|---|---|---|---|
| `whisper-small-ha-en-direct-pilot` | Directo (audio hausa → inglés) | 0.24 | no disponible | Apache 2.0 |
| `whisper-small-ha` + NLLB-200 (cascada) | ASR hausa → traducción NLLB | ~8-10 (con ASR real) | no disponible | Apache 2.0 (según proyecto) |

La comparativa se limita al modelo en cascada del mismo autor, ya que no se proporcionan datos de otros modelos de traducción de voz hausa-inglés. El rendimiento del piloto directo es significativamente inferior, lo que refuerza la conclusión de que el enfoque directo requiere más datos o un ajuste más cuidadoso.

## Limitaciones y advertencias

- Rendimiento muy bajo: BLEU 0.24 y chrF++ 14.39, muy por debajo de cualquier umbral útil para traducción automática.
- Datos de entrenamiento insuficientes: solo 256 ejemplos, lo que impide generalizar adecuadamente.
- No evaluado en el split oficial de desarrollo: la validación se realizó sobre una partición del train, por lo que los números no son comparables con benchmarks estándar.
- Riesgo de alucinación y errores graves: dado el bajo rendimiento, las traducciones generadas probablemente contengan errores graves y no sean fiables.
- Sesgos potenciales: al entrenarse con un subconjunto pequeño y posiblemente no representativo de NaijaS2ST, el modelo puede reflejar sesgos del corpus original.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su calidad.
- Advertencia de producción: el autor lo etiqueta explícitamente como "experimental pilot checkpoint — not production quality".

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nahomazmach/whisper-small-ha-en-direct-pilot)
- [Dataset NaijaS2ST](https://huggingface.co/datasets/McGill-NLP/NaijaS2ST)
- [Modelo en cascada (whisper-small-ha)](https://huggingface.co/nahomazmach/whisper-small-ha)
