# sadnblueish/whisper-large-v3-Tarteel-GGML

## Resumen

El modelo `sadnblueish/whisper-large-v3-Tarteel-GGML` es un fine-tuning de Whisper Large v3 de OpenAI, adaptado específicamente para el reconocimiento de recitación coránica en árabe. El modelo base original, Whisper Large v3, es un sistema de reconocimiento de voz (ASR) de 1,55 mil millones de parámetros desarrollado por OpenAI, entrenado con 5 millones de horas de audio débilmente supervisado en múltiples idiomas. La versión Tarteel se ajusta con el dataset Tarteel AI Everyayah, que contiene grabaciones del Corán recitado por diferentes recitadores.

El interés de esta ficha radica en que el modelo se distribuye en formato GGML/GGUF, lo que permite su ejecución eficiente en entornos con recursos limitados, como CPU o GPUs de baja potencia, mediante herramientas como `whisper.cpp`. La licencia Apache 2.0 facilita su uso comercial y la integración en productos, aunque no se han publicado métricas oficiales de rendimiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper Large v3) |
| Parametros totales | 1.550 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (fijo) |
| Tipos de cuantizacion | GGML/GGUF (tamaño repo 4,8 GB, probablemente Q8_0) |
| Idiomas soportados | árabe (optimizado para recitación coránica; el modelo base soporta 99 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (binario, compatible con whisper.cpp) |

## Arquitectura y entrenamiento

Whisper Large v3 es un transformer encoder-decoder con arquitectura de atención estándar, entrenado mediante aprendizaje supervisado a gran escala con 5 millones de horas de audio de datos débilmente supervisados de Internet, junto con 1 millón de horas adicionales de audio multilingüe. El modelo procesa audio de 30 segundos en fragmentos, convirtiéndolo a espectrogramas mel de 128 canales, y genera transcripciones de forma autoregresiva.

El fine-tuning Tarteel se realizó sobre este modelo base, especializándolo para el dominio coránico en árabe, utilizando el dataset Tarteel AI de Everyayah. El proceso de entrenamiento no se documenta en detalle en la información disponible (no se especifica número de pasos, hiperparámetros ni técnicas de alineación como RLHF o DPO). La cuantización a GGML se realizó posteriormente para permitir la ejecución eficiente en CPU y entornos con recursos limitados.

## Capacidades

- Reconocimiento de voz en árabe, especializado en recitación coránica con precisión mejorada sobre el modelo base.
- Transcripción de audio de hasta 30 segundos por fragmento, con manejo de secuencias largas mediante segmentación.
- Soporte para 99 idiomas en el modelo base, aunque el fine-tuning reduce la robustez multilingüe en favor del árabe coránico.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades no relacionadas con ASR.
- Formato de salida de texto plano sin timestamps automáticos (se pueden generar con `whisper.cpp`).

## Casos de uso

- **Aplicaciones educativas islámicas**: transcribir recitaciones coránicas para crear textos de acompañamiento en aplicaciones de aprendizaje de Tajweed o memorización del Corán. El modelo se puede integrar en aplicaciones móviles usando `whisper.cpp` para inferencia en el dispositivo.
- **Servicios de subtitulado en árabe**: generar subtítulos para vídeos de contenido religioso, conferencias y seminarios que incluyan recitación coránica, aprovechando la precisión en árabe del modelo.
- **Herramientas de estudio de recitación**: comparar la pronunciación del estudiante con la recitación de referencia mediante la transcripción en tiempo real, útil en aplicaciones de corrección de Tajweed.
- **Archivo y digitalización de audio**: convertir grabaciones históricas de recitaciones coránicas en texto indexable para bibliotecas digitales y bases de datos de contenido islámico.
- **Asistentes de voz para personas con discapacidad visual**: transcribir audio coránico en tiempo real para generar texto braille o voz sintetizada en otros idiomas, mejorando la accesibilidad en contextos religiosos.
- **Análisis de audio en entornos de producción**: integrar el modelo en pipelines de procesamiento de audio para clasificar, etiquetar o buscar segmentos de recitación en grandes volúmenes de grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como WER (Word Error Rate), CER (Character Error Rate) ni comparaciones con el modelo base Whisper Large v3 en el dataset Tarteel. La ausencia de datos de evaluación impide cuantificar la mejora real del fine-tuning respecto al modelo original.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo cuantizado GGUF de 4,8 GB, puede ejecutarse en CPU con ~8 GB de RAM, o en GPU con 4-6 GB de VRAM (según la cuantización exacta). Un modelo Q8_0 de Whisper large-v3 requiere aproximadamente 4,9 GB de memoria.
- **GPU recomendadas**: para inferencia en tiempo real, una GPU de gama media como RTX 3060 o superior es suficiente. En CPU, se recomienda un procesador moderno con soporte AVX2.
- **Compatibilidad con consumer GPUs**: sí, es ejecutable en GPUs de consumo de 6-8 GB de VRAM (RTX 2060, RTX 3050, GTX 1660, etc.).
- **Opciones de despliegue**: `whisper.cpp` (llama.cpp para Whisper), que soporta GGML/GGUF y ofrece ejecución en CPU, GPU y Apple Silicon. También se puede usar `faster-whisper` con conversión a formato CT2, aunque no es el formato original de este repo.
- **Latencia y throughput**: no hay datos oficiales. En CPU con 8 núcleos, la transcripción de un fragmento de 30 segundos suele tardar entre 5 y 15 segundos, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `sadnblueish/whisper-large-v3-Tarteel-GGML` | 1,55 B (base) | 30 s | árabe (coránico) | Apache-2.0 | GGUF |
| `openai/whisper-large-v3` | 1,55 B | 30 s | 99 idiomas | MIT | Safetensors |
| `IJyad/whisper-large-v3-Tarteel` | 1,55 B | 30 s | árabe (coránico) | Apache-2.0 | Safetensors |

La versión GGML es una cuantización del fine-tuning de IJyad, lo que permite ejecución en CPU y hardware limitado a costa de una ligera pérdida de precisión. El modelo base de OpenAI ofrece mayor cobertura de idiomas pero menor precisión en el dominio coránico. El fine-tuning de IJyad es el original en formato completo, pero requiere más memoria para inferencia.

## Limitaciones y advertencias

- **Sesgos de dominio**: el modelo está especializado en recitación coránica y puede degradar su rendimiento en otros contextos de habla árabe (dialectos, vocabulario no religioso).
- **Alucinación**: como todo modelo ASR, puede generar texto plausible pero incorrecto en audio de baja calidad o con ruido de fondo, especialmente en palabras poco frecuentes.
- **Limitación de contexto**: la ventana fija de 30 segundos obliga a segmentar audio largo, lo que puede introducir errores en las fronteras de segmento.
- **Idiomas**: el fine-tuning reduce la capacidad multilingüística del modelo base; no se recomienda para transcripción de otros idiomas.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, se recomienda verificar los términos del dataset Tarteel AI de Everyayah, que puede tener restricciones adicionales para uso comercial.
- **Producción**: no se han publicado métricas de rendimiento en producción ni pruebas de robustez, por lo que se debe validar el modelo con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: [sadnblueish/whisper-large-v3-Tarteel-GGML](https://huggingface.co/sadnblueish/whisper-large-v3-Tarteel-GGML)
- Modelo base original: [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- Fine-tuning original (IJyad): [IJyad/whisper-large-v3-Tarteel](https://huggingface.co/IJyad/whisper-large-v3-Tarteel)
- Repositorio de whisper.cpp: [github.com/ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- Repositorio de cuantización GGML de Whisper large-v3: [github.com/sergheinenov/whisper-large-v3-ggml](https://github.com/sergheinenov/whisper-large-v3-ggml)
- Página de Whisper en GitHub: [github.com/openai/whisper](https://github.com/openai/whisper)
