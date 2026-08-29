# NeuralIzaz/quran-whisper-paras1-10-lora

## Resumen

El modelo `NeuralIzaz/quran-whisper-paras1-10-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para afinar el modelo de reconocimiento automático de voz (ASR) `openai/whisper-small` en la transcripción de recitaciones del Corán en árabe. El nombre sugiere que el entrenamiento se ha realizado sobre las paráginas 1 a 10 (posiblemente los primeros diez juz o secciones), aunque no se especifica el conjunto de datos exacto. El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y está pensado para ser cargado sobre el modelo base de Whisper.

Este modelo resulta relevante para desarrolladores que trabajan en aplicaciones de transcripción de audio coránico, ya que Whisper-small por sí solo puede tener dificultades con la fonética y entonación específicas de la recitación del Corán (tajweed). Al ser un adaptador LoRA, el coste de inferencia es similar al del modelo base, y su tamaño es reducido, lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, la información pública disponible es muy escasa: no se documentan datos de entrenamiento, hiperparámetros, métricas de evaluación ni licencia, lo que limita su uso en producción sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base `openai/whisper-small` tiene 244 millones; el adaptador LoRA añade un número reducido de parámetros, no especificado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | Whisper-small procesa ventanas de audio de 30 segundos por segmento |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (implícito por el dominio, no declarado explícitamente) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `openai/whisper-small`, un modelo transformer encoder-decoder entrenado por OpenAI para ASR multilingüe. Whisper-small utiliza una arquitectura de atención completa con 12 capas de encoder y 12 de decoder, y procesa audio muestreado a 16 kHz mediante un extractor de características log-Mel. El adaptador LoRA, aplicado mediante la librería PEFT (versión 0.19.1 según los metadatos), introduce matrices de baja dimensión en las capas de atención, lo que permite ajustar el modelo a un dominio específico con un coste computacional y de almacenamiento mucho menor que un fine-tuning completo.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de pasos, la tasa de aprendizaje, ni si se utilizaron técnicas como regularización o aumento de datos. El nombre del repositorio sugiere que el entrenamiento se limitó a las paráginas 1 a 10 del Corán, pero no hay confirmación. Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineación, que no son habituales en tareas de ASR.

## Capacidades

- Transcripción de audio del Corán en árabe: el adaptador está diseñado para mejorar la precisión de Whisper-small en recitaciones coránicas, incluyendo la correcta identificación de fonemas y la transliteración a texto árabe.
- Reconocimiento de voz genérico: al estar basado en Whisper-small, conserva las capacidades ASR multilingües del modelo base, aunque el adaptador puede degradar el rendimiento en otros idiomas si no se ha entrenado para ellos.
- Procesamiento de audio de hasta 30 segundos por segmento: el modelo puede transcribir audios más largos mediante segmentación, pero no tiene memoria de contexto más allá de cada ventana.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es un modelo puramente ASR.

## Casos de uso

- Estudio y consulta del Corán: transcripción automática de recitaciones para generar textos que puedan buscarse, anotarse o compararse con la versión escrita en aplicaciones de estudio religioso.
- Aplicaciones móviles de audio a texto: integración del adaptador en apps Flutter o similares que capturen recitaciones y las conviertan en texto para mostrar la aleya correspondiente.
- Herramientas de verificación de pronunciación (tajweed): al transcribir con alta fidelidad fonética, el modelo puede servir de base para sistemas que comparen la pronunciación del usuario con la recitación de referencia.
- Generación de subtítulos para vídeos de recitación: transcripción de sermones o lecciones que incluyan recitaciones coránicas, produciendo subtítulos en árabe.
- Indexación de bibliotecas de audio: transcripción masiva de archivos de audio coránico para crear bases de datos buscables por contenido.
- Asistentes de voz para aprendizaje: combinado con un motor de síntesis, el modelo puede transcribir la recitación del usuario y proporcionar retroalimentación textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de WER (Word Error Rate) ni comparaciones con otros modelos en el repositorio de HuggingFace ni en la documentación asociada.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Whisper-small, el uso de memoria es similar al del modelo base. Whisper-small en FP32 requiere aproximadamente 1 GB de VRAM para inferencia; con cuantización a int8 o fp16 puede reducirse a unos 500-700 MB. El adaptador añade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores son suficientes. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el adaptador PEFT debe cargarse junto con el modelo base usando la librería `transformers` y `peft`. Para inferencia en producción, se puede usar `vLLM` (aunque está más orientado a LLM), `Llama.cpp` no es compatible directamente con Whisper; se recomienda usar `faster-whisper` o el pipeline de `transformers`. También puede servirse mediante `TGI` si se adapta, aunque no es lo habitual para ASR.
- Latencia y throughput: no se han publicado datos. En una GPU RTX 3090, Whisper-small procesa un segmento de 30 segundos en aproximadamente 0.5-1 segundo en FP16, pero esto depende de la implementación y la longitud real del audio.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NeuralIzaz/quran-whisper-paras1-10-lora` | Whisper-small | Adaptador LoRA | 30 s por segmento | No disponible | HuggingFace |
| `tarteel-ai/whisper-base-ar-quran` | Whisper-base | Fine-tuning completo | 30 s por segmento | No especificada | HuggingFace |
| `aboalaa1472/whisper-quran-lora-v2` | Whisper (probablemente small o base) | Adaptador LoRA | 30 s por segmento | No especificada | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La elección entre uno u otro dependerá de la validación empírica sobre el conjunto de datos objetivo.

## Limitaciones y advertencias

- Información insuficiente: la model card está vacía en aspectos clave (datos de entrenamiento, hiperparámetros, licencia, evaluación), lo que impide conocer el alcance real del adaptador y sus condiciones de uso.
- Riesgo de sesgo y sobreajuste: al entrenarse posiblemente sobre un subconjunto limitado de recitaciones (paráginas 1-10), el modelo puede no generalizar bien a otras partes del Corán, diferentes estilos de recitación o voces no representadas en el conjunto de entrenamiento.
- Alucinaciones en ASR: Whisper es conocido por generar texto plausible pero incorrecto en silencios o audio de baja calidad; el adaptador no elimina este riesgo.
- Limitaciones de idioma: aunque Whisper-small soporta muchos idiomas, el adaptador se ha diseñado para árabe coránico; su uso en otros idiomas puede degradar la precisión.
- Restricciones de licencia: al no especificarse la licencia, no se puede garantizar su uso comercial. Se recomienda contactar con el autor o revisar el repositorio original antes de integrarlo en productos.
- Sin soporte de contexto largo: cada segmento de audio se procesa de forma independiente, por lo que no hay coherencia entre transcripciones de segmentos consecutivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeuralIzaz/quran-whisper-paras1-10-lora
- Repositorio de referencia (nxr-dine/quran-whisper): https://github.com/nxr-dine/quran-whisper/tree/main
- Proyecto QuranWhisper (aHishamm): https://github.com/aHishamm/QuranWhisper
- Modelo similar de Tarteel AI: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo similar de aboalaa1472: https://huggingface.co/aboalaa1472/whisper-quran-lora-v2
