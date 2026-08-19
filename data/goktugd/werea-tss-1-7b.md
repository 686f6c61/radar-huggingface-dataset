# GoktugD/Werea-TSS-1.7B

## Resumen

Werea-TSS-1.7B es un modelo de síntesis de texto a voz (TTS) experimental, desarrollado por Werea (publicado a través del perfil de GoktugD como espejo oficial), que adapta el modelo base Qwen3-TTS-12Hz-1.7B-Base de Alibaba al idioma turco. El modelo base soporta oficialmente diez idiomas, pero no el turco; este fine-tune cubre esa carencia mediante un conjunto de datos completamente sintético y documentado. Con 1.700 millones de parámetros, es aproximadamente diez veces mayor que el modelo Werea-TSS de 183M, también de Werea. El checkpoint se presenta como una prueba de viabilidad (beta) y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en que amplía el alcance de un TTS moderno a un idioma no cubierto oficialmente, utilizando datos sintéticos para evitar problemas de derechos de autor y de privacidad. Sin embargo, su estado experimental implica limitaciones importantes en la estabilidad de la generación y en la calidad de pronunciación, por lo que no está recomendado para producción sin una evaluación exhaustiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen3-TTS-12Hz-1.7B-Base (transformer, arquitectura específica de Qwen para TTS) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (no se indica en la información proporcionada) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones publicadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según etiquetas) y checkpoint en carpeta `checkpoint/` |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint oficial Qwen/Qwen3-TTS-12Hz-1.7B-Base, que es un modelo de texto a voz basado en transformer desarrollado por el equipo de Qwen de Alibaba. La arquitectura interna no se detalla en la información disponible, pero se sabe que genera audio a partir de texto y una referencia de voz. El fine-tune se realizó siguiendo el flujo oficial de entrenamiento supervisado (SFT) de Qwen, utilizando los scripts `prepare_data.py` y `sft_12hz.py`.

El entrenamiento se llevó a cabo con un conjunto de datos sintético llamado `Werea-co/werea-tts-tr-synthetic`, que contiene 1.272 ejemplos de audio en turco, con una duración total aproximada de 1,32 horas. Todos los ejemplos usan una única voz sintética llamada "werea", creada a partir de una referencia de audio sintética. No se utilizaron grabaciones de personas reales ni técnicas de clonación de voz. Los hiperparámetros fueron: 3 épocas, tamaño de lote de 8 con acumulación de gradientes de 4, tasa de aprendizaje de 2e-5, precisión bf16 y entrenamiento en una GPU A100. La pérdida (loss) descendió de 14,6 a 4,3 durante el entrenamiento, lo que indica que el modelo aprendió a generar audio, aunque la estabilidad de la terminación de secuencia (EOS) no es fiable.

## Capacidades

- Generación de voz en turco a partir de texto, con una voz sintética fija ("werea").
- Soporte para control de longitud de generación mediante `max_new_tokens` (recomendado por la inestabilidad de EOS).
- Integración con la librería `qwen-tts`, que permite cargar el modelo y generar audio directamente.
- No soporta control de emociones ni clonación de voz por referencia (no es el objetivo del modelo).
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento; es un modelo puramente de TTS.

## Casos de uso

- Narración de contenido en turco: el modelo puede leer artículos, noticias o textos largos en voz sintética, aunque se recomienda limitar la longitud para evitar problemas de terminación.
- Asistentes de voz para aplicaciones en turco: se puede integrar en un pipeline de diálogo para generar respuestas habladas, siempre que el texto sea relativamente corto.
- Audiolibros y podcasts sintéticos: con la voz "werea" se pueden producir locuciones para contenido digital, indicando claramente que la voz es sintética.
- Pruebas de concepto para TTS en idiomas no soportados: este modelo demuestra la viabilidad de adaptar Qwen3-TTS a nuevos idiomas mediante datos sintéticos, sirviendo como referencia para otros proyectos.
- Generación de material educativo en turco: pronunciación de palabras o frases para aplicaciones de aprendizaje de idiomas.
- Prototipado rápido de experiencias de voz: al ser un modelo pequeño (1.7B) y con licencia Apache-2.0, es adecuado para experimentar en entornos de desarrollo sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona la evolución de la pérdida durante el entrenamiento (14,6 → 4,3) y advierte de que los resultados de evaluación y ejemplos de audio se añadirán en el futuro.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU A100 (no se especifica el número de GPUs ni la VRAM exacta).
- Para inferencia, al ser un modelo de 1.7B en bf16, se estima que necesita al menos 4 GB de VRAM (cálculo aproximado: 1.7B × 2 bytes = 3.4 GB, más overhead), aunque no se ha verificado oficialmente.
- Es probable que quepa en GPUs de consumo como la RTX 3060 (12 GB) o superiores, pero no hay datos confirmados.
- Opciones de despliegue: la librería `qwen-tts` permite cargar el modelo con `from_pretrained`; no se mencionan integraciones con vLLM, llama.cpp u Ollama.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Werea-TSS-1.7B (este) | 1.7B | no disponible | Turco | Apache-2.0 | HuggingFace |
| Qwen3-TTS-12Hz-1.7B-Base | 1.7B | no disponible | 10 idiomas (no turco) | Apache-2.0 | HuggingFace |
| Werea-TSS (183M) | 183M | no disponible | Turco | Apache-2.0 | HuggingFace |

El modelo base Qwen3-TTS-12Hz-1.7B-Base es el punto de partida; este fine-tune añade el turco, pero pierde la cobertura de los otros nueve idiomas. El Werea-TSS de 183M es una versión mucho más pequeña y probablemente menos capaz, pero con la misma voz sintética. No se dispone de comparaciones con otros TTS comerciales o de código abierto específicos para turco en la información proporcionada.

## Limitaciones y advertencias

- Estado beta/experimental: la generación de terminación (EOS) no es estable, lo que puede producir audios excesivamente largos si no se limita `max_new_tokens`.
- Errores de pronunciación en frases largas y números, según la model card.
- No hay control de emociones ni clonación de voz por referencia.
- La voz generada es sintética y debe indicarse al usuario final como tal.
- El conjunto de datos es muy pequeño (1.272 ejemplos, ~1,32 horas), lo que limita la generalización a vocabulario y acentos variados.
- No se han publicado evaluaciones objetivas (MOS, WER, etc.) ni ejemplos de audio.
- Aunque la licencia es Apache-2.0, el uso comercial está permitido, pero se recomienda verificar la calidad antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GoktugD/Werea-TSS-1.7B
- Repositorio espejo oficial (Werea-co): https://huggingface.co/Werea-co/Werea-TSS-1.7B
- Dataset sintético: https://huggingface.co/datasets/Werea-co/werea-tts-tr-synthetic
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Sitio web de Werea: https://werea.co
- Modelo Werea-TSS (183M): https://huggingface.co/Werea-co/Werea-TSS
