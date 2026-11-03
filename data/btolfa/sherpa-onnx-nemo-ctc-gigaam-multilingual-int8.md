# btolfa/sherpa-onnx-nemo-ctc-gigaam-multilingual-int8

## Resumen

Este repositorio contiene un paquete de distribución del modelo de reconocimiento automático del habla (ASR) GigaAM Multilingual en formato ONNX cuantizado a int8, empaquetado como archivo `tar.bz2` para el descargador de modelos Ramblr. No se trata de un modelo nuevo: es una redistribución sin modificar de los ficheros publicados en `i2z1/gigaam-multilingual-ctc-onnx-int8`, cuyo modelo base es `ai-sage/GigaAM-Multilingual`, desarrollado por el equipo GigaChat (Sber) bajo licencia MIT.

El modelo resuelve transcripción de voz a texto multilingüe en cinco idiomas: ruso, inglés, kazajo, kirguís y uzbeko. Al estar basado en NeMo CTC y exportado a ONNX con cuantización int8, está pensado para inferencia eficiente en CPU mediante el runtime sherpa-onnx, lo que lo hace adecuado para despliegues ligeros sin GPU.

La relevancia de este paquete es logística más que algorítmica: facilita la descarga automatizada del modelo vía Ramblr y su uso directo en pipelines de sherpa-onnx. El tamaño del repositorio es de 0,2 GB, coherente con un modelo ASR compacto cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo CTC (Conformer/CTC, según el modelo base GigaAM); exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; los segmentos de audio deben mantenerse por debajo de 200 s |
| Tipos de cuantización | int8 |
| Idiomas soportados | ruso (ru), inglés (en), kazajo (kk), kirguís (ky), uzbeko (uz) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8), empaquetado en `sherpa-onnx-nemo-ctc-gigaam-multilingual-int8.tar.bz2` |

## Arquitectura y entrenamiento

El modelo base `ai-sage/GigaAM-Multilingual` es un sistema ASR de la familia GigaAM del equipo GigaChat, con cabeza CTC y formato NeMo, lo que permite su exportación a ONNX y su ejecución en sherpa-onnx. La variante aquí distribuida es la conversión int8 realizada por el autor `i2z1`, sin modificaciones posteriores por parte de `btolfa`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias. Tampoco se documentan innovaciones técnicas específicas más allá de la cuantización int8 para reducir el coste computacional en CPU.

## Capacidades

- Transcripción de voz a texto (ASR) en ruso, inglés, kazajo, kirguís y uzbeko.
- Salida sin puntuación ni mayúsculas (según indica la model card).
- Ejecución en CPU mediante sherpa-onnx con pesos ONNX int8.
- Procesamiento de segmentos de audio de hasta 200 s (con crecimiento rápido de memoria a medida que aumenta la longitud).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz en ruso o inglés: el modelo convierte audio en texto para actas o búsqueda posterior, aprovechando su ejecución en CPU sin GPU dedicada.
- Subtitulado automático de vídeos en ruso, kazajo o uzbeko: se segmenta el audio en fragmentos inferiores a 200 s y se transcribe con sherpa-onnx en un pipeline por lotes.
- Atención al cliente con voz en ruso: integración en un sistema de telefonía que transcribe la llamada en tiempo cuasi real para su análisis o enrutamiento.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo de grabaciones para habilitar búsqueda por texto en una base de datos.
- Aplicaciones móviles o de escritorio sin conectividad: al ser ONNX int8 y ejecutable en CPU, puede embeberse en entornos con recursos limitados.
- Investigación en ASR multilingüe para lenguas túrquicas: sirve como línea base reproducible para kazajo, kirguís y uzbeko en experimentos académicos.
- Preprocesamiento de datos para pipelines de NLP: transcripción de corpus de audio para entrenar o evaluar otros modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo int8 de 0,2 GB requeriría muy poca memoria, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; el formato sherpa-onnx está orientado a CPU.
- Cabe en GPU de consumo: sí, por tamaño (0,2 GB), aunque el runtime objetivo es CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime; el paquete está pensado para el descargador Ramblr.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| btolfa/sherpa-onnx-nemo-ctc-gigaam-multilingual-int8 | no disponible | segmentos < 200 s | ru, en, kk, ky, uz | MIT | ONNX int8 |
| ai-sage/GigaAM-Multilingual (base) | no disponible | no disponible | ru, en, kk, ky, uz | MIT | pesos originales (no ONNX) |
| i2z1/gigaam-multilingual-ctc-onnx-int8 | no disponible | no disponible | ru, en, kk, ky, uz | MIT | ONNX int8 |
| Whisper (variantes multilingües) | según variante | 30 s por ventana | multilingüe amplio | MIT | safetensors, GGUF, ONNX |

La comparación con Whisper es orientativa: este paquete cubre un conjunto de idiomas más reducido y está optimizado para sherpa-onnx, mientras que Whisper ofrece cobertura multilingüe más amplia y ecosistema de despliegue más maduro.

## Limitaciones y advertencias

- La salida no incluye puntuación ni mayúsculas, lo que limita su uso directo en productos que requieran texto formateado.
- Los segmentos de audio deben mantenerse por debajo de 200 s; la memoria crece rápidamente con la longitud del audio.
- Cobertura lingüística limitada a cinco idiomas; no se documenta rendimiento en otros.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o vocabulario técnico no visto en entrenamiento.
- Es una redistribución sin modificar de otro repositorio; la responsabilidad de validación recae en el usuario.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de la conversión intermedia.
- No hay métricas publicadas de WER ni benchmarks que permitan estimar la calidad frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/btolfa/sherpa-onnx-nemo-ctc-gigaam-multilingual-int8
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Conversión ONNX int8 original: https://huggingface.co/i2z1/gigaam-multilingual-ctc-onnx-int8
- Descargador Ramblr: https://github.com/trevornk/ramblr
- Runtime sherpa-onnx: no disponible en la información proporcionada (referencia habitual: https://github.com/k2-fsa/sherpa-onnx)
