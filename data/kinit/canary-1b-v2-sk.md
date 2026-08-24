# kinit/canary-1b-v2-sk

## Resumen

El modelo `kinit/canary-1b-v2-sk` es un ajuste fino (fine-tuning) completo del modelo NVIDIA Canary-1B-v2, especializado en el reconocimiento automático del habla (ASR) en eslovaco. Fue desarrollado por el equipo KInIT (Knowledge and Information Technology Institute) de Eslovaquia, que compiló un corpus de habla eslovaca curado a partir de fuentes públicas y grabaciones internas, y lo utilizó para reentrenar el modelo base con el objetivo de reducir el error de transcripción en eslovaco. El modelo base, Canary-1B-v2, es una arquitectura de codificador FastConformer y decodificador Transformer de unos 978 millones de parámetros, originalmente entrenado para 25 idiomas europeos y tareas de transcripción y traducción de voz. Tras el ajuste fino, el modelo se especializa exclusivamente en eslovaco, logrando una reducción del error de palabra (WER) de alrededor del 40-55 % en conjuntos de evaluación eslovacos, a costa de perder la capacidad multilingüe y de traducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + Transformer (decodificador), 32 capas de codificador y 8 de decodificador |
| Parámetros totales | ~978 millones |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la ficha) |
| Tipos de cuantización | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | eslovaco (`sk`) |
| Licencia | CC-BY-4.0 (heredada de NVIDIA) |
| Formato de pesos | NeMo (checkpoint de NVIDIA NeMo; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo base `nvidia/canary-1b-v2` emplea un codificador FastConformer, una variante eficiente del conformer que reduce el coste computacional mediante atención de ventana y muestreo descendente, junto con un decodificador Transformer. El ajuste fino completo (`full fine-tuning`) se realizó sobre un corpus eslovaco curado por KInIT, que combina datos públicos como SloPalSpeech, Common Voice 24.0, TEDxSK y FLEURS, además de grabaciones internas. El corpus fue filtrado por calidad mediante un umbral de CER validado con varios modelos ASR, y el 75 % de las muestras se aumentaron con ruido sintético (ruido de teléfono, habla de fondo, ruido blanco y pérdida de paquetes) para mejorar la robustez en condiciones reales.

El entrenamiento se ejecutó con 3 épocas, tasa de aprendizaje 1e-4 con decaimiento polinomial y calentamiento, optimizador AdamW, tamaño de lote efectivo 64, precisión mixta bf16 y recorte de gradiente en 1.0. Se usó el clúster HPC Devana. No se aplicaron técnicas de alineación con RLHF ni DPO; es un ajuste fino supervisado puro.

## Capacidades

- Transcripción automática de voz eslovaca con puntuación y capitalización.
- Reconocimiento de habla en distintos dominios: conversaciones, discursos, lectura de literatura, sesiones de consejos municipales y vídeos de conferencias.
- Robustez a ruido de fondo, gracias a la aumentación con ruido sintético durante el entrenamiento.
- Soporte de transcripción en tiempo real (dependiente del hardware) mediante la inferencia NeMo.
- No conserva las capacidades multilingües ni de traducción de voz (AST) del modelo base.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de transcripción.

## Casos de uso

- **Transcripción de reuniones y sesiones municipales**: el modelo puede transcribir grabaciones de sesiones de ayuntamiento (presentes en su corpus de entrenamiento) con precisión, incluyendo puntuación, lo que facilita la generación de actas y su búsqueda.
- **Subtitulado automático de vídeos en eslovak**: al transcribir con puntuación y capitalización, se puede generar subtítulos para plataformas de vídeo, tanto para contenido educativo (TEDx) como para podcasts.
- **Atención al cliente en eslovak**: integrado en sistemas de transcripción de llamadas, permite analizar conversaciones y extraer información, aunque se recomienda revisión humana para contextos críticos.
- **Asistente de voz en eslovak**: sirve como motor de ASR para asistentes virtuales o comandos de voz en aplicaciones dirigidas a usuarios eslovak.
- **Archivo y búsqueda de material audiovisual**: transcribe archivos de audio y vídeo para indexación y búsqueda por contenido, útil en bibliotecas y archivos digitales.
- **Investigación lingüística**: se puede utilizar para crear corpora transcritos de eslovak, facilitando estudios fonéticos o sociolingüísticos.

## Benchmarks y rendimiento

Los autores proporcionan resultados de evaluación en dos conjuntos: **CV24** (test de Common Voice 24.0, 5 239 muestras) y un **conjunto interno** de KInIT (9 317 muestras, estratificado por dominio y género, con un tercio limpio y dos tercios con ruido). Los valores de WER y CER se comparan con el modelo base.

| Modelo | CV24 WER ↓ | CV24 CER ↓ | Interno WER ↓ | Interno CER ↓ |
|---|---|---|---:|---:|---:|
| **kinit/canary-1b-v2-sk** | **8.27 %** | **2.35 %** | **6.37 %** | **3.31 %** |
| nvidia/canary-1b-v2 (base) | 14.00 % | 4.06 % | 14.39 % | 6.88 % |

Además, se compara con otro modelo eslovak de la misma familia, `Parakeet TDT 0.6B v3`, entrenado con el mismo corpus y receta de aumentación, en el conjunto interno:

| Modelo | WER tras ajuste fino ↓ | WER del modelo base ↓ |
|---|---:|---:|
| **Canary 1B v2** (kinit) | **6.37 %** | 14.39 % |
| Parakeet TDT 0.6B v3 | 6.62 % | 24.32 % |

Los autores señalan que Parakeet es más rápido en inferencia, pero Canary logra un WER ligeramente menor en este conjunto.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM en la ficha del modelo.
- Con ~978 millones de parámetros, en precisión fp16 se estima un uso de memoria de aproximadamente 2 GB de VRAM solo para los pesos, más memoria para activaciones. Para inferencia en NeMo se recomienda una GPU con al menos 8 GB de VRAM para manejar audios de duración media (ej. RTX 3060, RTX 4060, etc.).
- Para despliegue en producción, es adecuado usar NVIDIA Triton Inference Server con el backend de NeMo, o servir el modelo a través de una API con NeMo (Python).
- No se documentan cuantizaciones como GGUF o ONNX; el formato nativo es NeMo, lo que limita el uso en herramientas como llama.cpp u Ollama.
- La latencia y el rendimiento no se publican; el modelo base Canary-1B-v2 alcanza un throughput de alrededor de 749× realtime en hardware de servidor, según la STT Index, pero no se confirma para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (eslovak, interno) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **kinit/canary-1b-v2-sk** | ~978 M | no disponible | 6.37 % | CC-BY-4.0 | Hugging Face |
| nvidia/canary-1b-v2 (base) | ~978 M | no disponible | 14.39 % | CC-BY-4.0 | Hugging Face |
| Parakeet TDT 0.6B v3 (fine-tune kinit) | ~600 M | no disponible | 6.62 % | CC-BY-4.0 | Hugging Face |

La comparación muestra que el fine-tune de Canary supera al de Parakeet en precisión en eslovak, aunque Parakeet es más rápido. No se dispone de otros modelos eslovak comparables en esta ficha.

## Limitaciones y advertencias

- **Olvido catastrófico**: el ajuste fino exclusivo en eslovak degrada significativamente el rendimiento en los otros 24 idiomas que soportaba el modelo base, así como la capacidad de traducción de voz (AST). Si se requiere transcripción multilingüe o traducción, se debe usar el modelo base.
- **Dominio y acentos**: el rendimiento puede degradarse en habla con acentos fuertes, dialectos o vocabulario de dominios no representados en el corpus de entrenamiento.
- **Audio largo**: el corpus de entrenamiento contiene principalmente muestras cortas; el modelo hereda el troceado automático de audio largo del base, pero no fue evaluado después del ajuste.
- **Timestamps**: la arquitectura base soporta marcas de tiempo de palabra y segmento, pero no fueron evaluadas tras el ajuste fino.
- **Licencia**: CC-BY-4.0 permite uso comercial, pero exige atribución a NVIDIA y KInIT; se debe revisar la licencia del modelo base para cualquier redistribución.
- **Revisión humana**: para transcripciones en ámbitos críticos (médico, legal, seguridad), se recomienda supervisión humana, como se indica en el alcance del modelo.

## Enlaces

- [HuggingFace del modelo `kinit/canary-1b-v2-sk`](https://huggingface.co/kinit/canary-1b-v2-sk)
- [Modelo base `nvidia/canary-1b-v2`](https://huggingface.co/nvidia/canary-1b-v2)
- [Paper técnico de Canary-1B-v2 y Parakeet-TDT-0.6B-v3 (arXiv)](https://arxiv.org/html/2509.14128v2)
- [Colección KInIT de ASR en Hugging Face](https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247)
- [Catálogo SLAIH – recurso canary-1b-v2-sk](https://www.slaih.sk/sk/catalog/canary-1b-v2-sk)
- [Dataset SloPalSpeech](https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech)
- [Dataset Common Voice 24.0](https://huggingface.co/datasets/mozilla-foundation/common_voice_24_0)
- [FLEURS read speech](https://huggingface.co/datasets/google/fleurs)</think>## Resumen

El modelo `kinit/canary-1b-v2-sk` es un ajuste fino en eslovaco del modelo de reconocimiento automático del habla (ASR) **NVIDIA Canary-1B-v2**, desarrollado por el equipo KInIT. Este modelo está especializado en transcribir audio en eslovaco con puntuación y capitalización, y ha sido entrenado mediante un ajuste completo de todos los parámetros sobre un corpus de habla eslovaca curado, que combina fuentes públicas y grabaciones internas, con aumentación de ruido para mejorar la robustez en condiciones reales.

La arquitectura base es un codificador FastConformer con un decodificador Transformer, con unos 978 millones de parámetros y 32 capas de codificador y 8 de decodificador. El ajuste fino reduce el error de palabra (WER) en eslovaco de un 14,00 % a un 8,27 % en el conjunto de evaluación Common Voice 24.0, y de un 14,39 % a un 6,37 % en un conjunto interno, lo que representa una mejora de aproximadamente el 41 % y el 56 %, respectivamente. Este modelo se publica bajo licencia CC-BY-4.0 y está disponible en Hugging Face para su uso con NVIDIA NeMo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + Transformer (decodificador) |
| Parámetros totales | ~978 millones |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | eslovaco (`sk`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (formato de NVIDIA NeMo, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base `nvidia/canary-1b-v2` emplea una arquitectura de codificador FastConformer, una variante eficiente del conformer que combina atención con ventanas y convoluciones para reducir el coste computacional, junto con un decodificador Transformer. El ajuste fino completo se realizó sobre un corpus de habla eslovaca curado por KInIT, que incluye fuentes como SloPalSpeech, grabaciones de sesiones municipales, literatura leída, Common Voice 24.0, TEDxSK, FLEURS y grabaciones internas. El corpus fue filtrado por calidad mediante un umbral de error de caracteres (CER) validado con varios modelos ASR, y el 75 % de las muestras se aumentaron con ruido sintético (ruido de teléfono, habla de fondo, ruido blanco y pérdida de paquetes) para mejorar la robustez en entornos ruidosos.

El entrenamiento se llevó a cabo con 3 épocas, una tasa de aprendizaje de 1e-4, decaimiento polinomial con calentamiento, optimizador AdamW, tamaño de lote de 64, precisión mixta bf16 y recorte de gradiente en 1.0, todo sobre el clúster HPC Devana. No se utilizaron técnicas de alineación con RLHF ni DPO; es un ajuste fino supervisado exclusivamente para la tarea de transcripción de voz.

## Capacidades

- Transcripción automática de voz eslovaca con puntuación y capitalización.
- Soporte de audio con ruido de fondo gracias a la aumentación de ruido durante el entrenamiento.
- Reconocimiento de voz en múltiples dominios: conversaciones, discursos, sesiones municipales, lectura de literatura y vídeos educativos.
- No soporta traducción de voz (AST) ni otros idiomas (la capacidad multilingüe del modelo base se ha perdido).
- No incluye soporte de llamadas a herramientas, agentes ni razonamiento multi-paso; es un modelo puramente de transcripción.

## Casos de uso

- **Transcripción de reuniones y sesiones municipales**: el modelo está entrenado con grabaciones de sesiones de ayuntamientos, por lo que puede transcribir automáticamente estas reuniones, generando actas con puntuación y facilitando la búsqueda de contenido.
- **Subtitulado automático de vídeos**: su capacidad de transcribir con puntuación y capitalización lo hace adecuado para generar subtítulos en eslovaco para vídeos, podcasts o material educativo.
- **Atención al cliente en eslovaco**: en un sistema de transcripción de llamadas, el modelo puede convertir audio de conversaciones en texto para su análisis posterior, siempre con revisión humana en contextos críticos.
- **Asistentes de voz en eslovaco**: puede integrarse como motor de transcripción en aplicaciones de asistente virtual, procesando comandos de voz y convirtiéndolos en texto.
- **Archivo y búsqueda de material audiovisual**: al transcribir archivos de audio y vídeo, se puede indexar el contenido y permitir búsquedas por texto dentro de bibliotecas o archivos digitales.
- **Investigación lingüística**: el modelo puede servir para generar transcripciones de corpus eslovak, facilitando estudios fonéticos, morfológicos o de variación dialectal.

## Benchmarks y rendimiento

Los autores proporcionan resultados de evaluación en dos conjuntos de prueba: el conjunto de test de Common Voice 24.0 (5 239 muestras) y un conjunto interno de KInIT (9 317 muestras, estratificado por dominio y género, con un tercio limpio y dos tercios con ruido). Las métricas son WER (Word Error Rate) y CER (Character Error Rate), donde valores menores son mejores.

| Modelo | CV24 WER ↓ | CV24 CER ↓ | Interno WER ↓ | Interno CER ↓ |
|---|---|---|---:|---:|
| **kinit/canary-1b-v2-sk** | **8,27 %** | **2,35 %** | **6,37 %** | **3,31 %** |
| nvidia/canary-1b-v2 (base) | 14,00 % | 4,06 % | 14,39 % | 6,88 % |

También se comparó con otro modelo eslovak, `Parakeet TDT 0.6B v3`, entrenado con la misma receta:

| Modelo | WER (interno, ajustado) ↓ | WER (interno, base) ↓ |
|---|---:|---:|
| **Canary 1B v2** | **6,37 %** | 14,39 % |
| Parakeet TDT 0.6B v3 | 6,62 % | 24,32 % |

El modelo Canary ajustado obtiene un mejor WER que Parakeet, aunque este último es más rápido en inferencia.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM en la ficha del modelo.
- Con ~978 millones de parámetros, se estima que en precisión fp16 los pesos ocupan aproximadamente 2 GB de VRAM, más la memoria de activaciones. Para inferencia en NeMo se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superior).
- Para despliegue en producción se puede usar NVIDIA Triton Inference Server con NeMo, o servir el modelo mediante una API con Python.
- No se dispone de versiones cuantizadas (GGUF, ONNX) documentadas, por lo que el uso fuera del ecosistema NeMo es limitado.
- El rendimiento en tiempo real no está especificado para este ajuste fino; el modelo base alcanza un throughput de aproximadamente 749× realtime según la STT Index, pero no se confirma para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | WER (eslovak, interno) | Licencia | Disponibilidad |
|---|---|---|---:|---|
| **kinit/canary-0b-v2-sk** | ~978 M | 6,37 % | CC-BY-4.0 | Hugging Face |
| nvidia/canary-1b-v2 (base) | ~978 M | 14,39 % | CC-BY-4.0 | Hugging Face |
| Parakeet TDT 0.6B v3 (ajustado) | ~600 M | 6,62 % | CC-BY-4.0 | Hugging Face |

El ajuste de Canary es el que ofrece mejor WER en eslovak entre los comparados, mientras que Parakeet es más rápido. No se dispone de otros modelos eslovak específicos para comparar en esta ficha.

## Limitaciones y advertencias

- **Olvido catastrófico**: el ajuste fino exclusivo en eslovak ha degradado significativamente el rendimiento en los otros 24 idiomas que soportaba el modelo base, así como su capacidad de traducción de voz (AST). Si se necesita transcripción multilingüe o traducción, se debe usar el modelo base.
- **Acentos y dialectos**: el rendimiento puede degradarse en habla con acentos fuertes, dialectos o vocabulario de dominios no representados en el corpus de entrenamiento.
- **Audio largo**: el corpus de entrenamiento contiene principalmente muestras cortas; el modelo hereda el troceado automático de audio del base, pero no fue evaluado después del ajuste.
- **Timestamps**: las marcas de tiempo de palabra y segmento son compatibles con la arquitectura base, pero no fueron evaluadas tras el ajuste.
- **Licencia**: CC-BY-4.0 permite uso comercial, pero exige atribución a NVIDIA y KInIT. Se debe verificar la licencia del modelo base para cualquier redistribución.
- **Revisión humana**: se recomienda supervisión humana para transcripciones en ámbitos críticos (legal, médico, seguridad), como se indica en el propio modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kinit/canary-1b-v2-sk)
- [Modelo base `nvidia/canary-1b-v2`](https://huggingface.co/nvidia/canary-1b-v2)
- [Paper técnico de Canary-1B-v2 y Parakeet-TDT-0.6B-v3 (arXiv)](https://arxiv.org/html/2509.14128v2)
- [Colección KInIT de ASR en Hugging Face](https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247)
- [Catálogo SLAIR – recurso canary-1b-v2-sk](https://www.slaih.sk/sk/catalog/canary-1b-v2-sk)
- [Dataset SloPalSpeech](https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech)
- [Dataset Common Voice 24.0](https://huggingface.co/datasets/mozilla-foundation/common_voice_24_0)
- [FLEURS read speech](https://huggingface.co/datasets/google/fleurs)
