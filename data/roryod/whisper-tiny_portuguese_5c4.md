# roryod/whisper-tiny_portuguese_5c4

## Resumen

whisper-tiny_portuguese_5c4 es un ajuste fino (fine-tune) del modelo openai/whisper-tiny para reconocimiento automático del habla, publicado por el usuario roryod en HuggingFace. Se trata de un modelo de la familia Whisper, con arquitectura transformer encoder-decoder orientada a la transcripción de audio, y un total de 37.760.640 parámetros reales según los pesos en safetensors. El entrenamiento se realizó sobre el dataset denominado "portuguese_english", cuyo contenido y composición no se detallan en la model card, partiendo del checkpoint original de OpenAI.

El modelo declara un único idioma soportado (inglés, "en") pese a que el nombre del dataset de entrenamiento sugiere una mezcla de portugués e inglés, lo que constituye una ambigüedad relevante que el autor no aclara. El resultado principal reportado es un WER de 11,836 sobre el split de test del citado dataset, con una pérdida de validación de 0,2546; ambos valores están declarados por el autor y no han sido verificados de forma independiente.

Su relevancia es limitada y muy específica: se trata de un experimento de ajuste fino de bajo coste computacional (el repositorio ocupa 0,3 GB y el modelo cabe en cualquier GPU de consumo), útil como referencia para tareas de ASR en dominios bilingües portugués-inglés, pero con una model card generada automáticamente que deja sin documentar secciones enteras (descripción, usos previstos, datos de entrenamiento). No dispone de descargas ni de likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, fine-tune de openai/whisper-tiny) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la familia Whisper procesa ventanas de audio de 30 segundos |
| Tipos de cuantización | No disponible en la model card; los pesos safetensors se distribuyen en el formato original del entrenamiento (FP32/FP16 según checkpoint) |
| Idiomas soportados | Inglés ("en", único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder diseñado para reconocimiento automático del habla que convierte espectrogramas mel en tokens de texto. El fine-tune mantiene la arquitectura y el tokenizador del modelo base; no se documenta ningún cambio estructural, ni innovación técnica adicional (no hay decodificación especulativa, atención lineal ni mecanismos híbridos declarados). La model card no especifica el número de tokens de audio procesados ni la composición del dataset "portuguese_english", más allá de su nombre.

El procedimiento de entrenamiento sí está detallado: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, optimizador AdamW torch fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, semilla 42 y 2.000 pasos totales. Las curvas reportadas corresponden a dos checkpoints: el paso 1.000 (época 0,9217, validation loss 0,2723, WER 12,712) y el paso 2.000 (época 1,8433, validation loss 0,2546, WER 11,836). Con batch de 2 y aproximadamente 1.085 pasos por época, se puede inferir un tamaño del orden de 2.170 muestras por época, aunque este dato no está declarado por el autor. No se menciona uso de RLHF, DPO ni ninguna fase de alineación posterior al entrenamiento supervisado.

## Capacidades

- Transcripción de voz a texto (automatic-speech-recognition) en el dominio cubierto por el dataset de entrenamiento.
- Reconocimiento de habla en inglés, único idioma declarado en la model card.
- Procesamiento de audio en ventanas de 30 segundos, característica de la arquitectura Whisper heredada del modelo base.
- Posible capacidad de traducción de voz a inglés y de detección de idioma, heredadas de openai/whisper-tiny, aunque no verificadas tras el fine-tune y no declaradas por el autor.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de visión, audio generativo ni modo "thinking".
- No se declara generación de timestamps a nivel de palabra (requiere configuración específica del modelo base, no documentada aquí).

## Casos de uso

- Transcripción de reuniones bilingües portugués-inglés: el ajuste sobre el dataset "portuguese_english" sugiere especialización en ese par de idiomas, lo que permitiría transcribir llamadas o reuniones mixtas con un modelo de 37,76 M de parámetros ejecutable en CPU.
- Prototipado rápido de pipelines ASR: al ocupar 0,3 GB, el modelo se puede integrar en un notebook o en un contenedor ligero para validar una idea de producto antes de invertir en un modelo mayor.
- Subtitulado automático de vídeos cortos en inglés: con ventanas de 30 segundos y un WER declarado de 11,84, es adecuado para contenido informal donde no se exige transcripción perfecta.
- Preprocesado deaudio para búsqueda y análisis: transcripción masiva de grabaciones para indexación semántica o extracción de palabras clave, aprovechando el bajo coste de inferencia.
- Evaluación comparativa de fine-tunes: sirve como referencia de bajo presupuesto en experimentos de ajuste fino sobre Whisper, ya que la model card incluye hiperparámetros y curvas de entrenamiento completas.
- Transcripción en dispositivos con recursos limitados: el modelo cabe holgadamente en GPU de consumo e incluso en CPU, por lo que puede desplegarse en entornos edge con whisper.cpp o CTranslate2 tras la conversión de pesos.
- Docencia y experimentación académica: útil para ilustrar el efecto de un fine-tune corto (2.000 pasos) sobre un modelo ASR pequeño, con métricas antes y después del ajuste.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la tabla de entrenamiento. El WER no está verificado de forma independiente.

| Métrica | Dataset / split | Valor |
|---|---|---|
| WER | portuguese_english, test | 11,836 |
| Validation loss (paso 2.000, época 1,8433) | portuguese_english, validación | 0,2546 |
| Validation loss (paso 1.000, época 0,9217) | portuguese_english, validación | 0,2723 |
| WER (paso 1.000) | portuguese_english, validación | 12,7120 |
| Training loss (paso 2.000) | portuguese_english, entrenamiento | 0,1170 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para comparaciones con otros checkpoints en el mismo dataset. Tampoco se aporta la métrica del modelo base openai/whisper-tiny sobre este dataset, por lo que no es posible cuantificar la mejora atribuible al fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,15 GB en FP32 y 0,08 GB en FP16 para los pesos; con buffers de activación y decodificación, menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso una GTX 1650 lo ejecutan sin problemas.
- Cabe en GPU de consumo: sí, en todas las GPU con al menos 1-2 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: pipeline de transformers, CTranslate2/faster-whisper y whisper.cpp previa conversión de pesos. No se recomienda vLLM ni TGI, orientados a modelos de texto generativo de mayor tamaño; Ollama no soporta de forma nativa modelos Whisper.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo de 37,76 M de parámetros procesa una ventana de 30 segundos de audio en tiempos del orden de décimas de segundo en GPU y de pocos segundos en CPU, aunque no se aportan mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roryod/whisper-tiny_portuguese_5c4 | 37.760.640 | Ventanas de 30 s (familia Whisper) | 11,836 en portuguese_english (no verificado) | Apache 2.0 | HuggingFace, 0 descargas |
| openai/whisper-tiny | ~37,8 M | Ventanas de 30 s | No disponible para este dataset | Apache 2.0 | HuggingFace, ampliamente utilizado |
| openai/whisper-base | ~74 M | Ventanas de 30 s | No disponible para este dataset | Apache 2.0 | HuggingFace |
| openai/whisper-small | ~244 M | Ventanas de 30 s | No disponible para este dataset | Apache 2.0 | HuggingFace |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado métricas de whisper-tiny, whisper-base ni whisper-small sobre el dataset "portuguese_english", ni el autor compara su resultado con el checkpoint base. La única ventaja diferencial verificable de este modelo frente al base es el ajuste declarado sobre un dominio bilingüe portugués-inglés, con un WER de 11,836 que no puede contextualizarse sin una línea base.

## Limitaciones y advertencias

- Model card generada automáticamente por el Trainer de HuggingFace: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed". No hay documentación sobre el dominio, la calidad ni la procedencia del dataset.
- Ambigüedad lingüística: el nombre del modelo y del dataset indican portugués e inglés, pero el campo `language` solo declara "en". No se especifica si el modelo transcribe portugués con calidad aceptable.
- WER de 11,836 no verificado (`verified: false`) y sin línea base del modelo original, por lo que no se puede afirmar que el fine-tune mejore al checkpoint de partida.
- Dataset pequeño inferido (del orden de 2.170 muestras por época, cálculo derivado de los pasos y el batch, no declarado): alto riesgo de sobreajuste y de generalización pobre fuera del dominio de entrenamiento.
- Riesgo de alucinación: la familia Whisper tiende a generar texto inventado en segmentos con silencio, ruido o música; el autor no documenta ninguna mitigación ni umbral de confianza.
- Solo dos checkpoints evaluados y un máximo de 1,84 épocas: el entrenamiento es muy corto, con learning rate bajo (1e-05) y batch de 2, lo que limita la magnitud del ajuste.
- Sin métricas por subgrupo (acento, ruido, duración) ni evaluación de sesgos demográficos o de género en las transcripciones.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se publica sin validación en producción.
- Ausencia total de tracción (0 descargas, 0 likes) y versiones de framework no estándar en la model card (Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130), lo que puede dificultar la reproducibilidad del entorno de entrenamiento.
- No se documenta el comportamiento en audio de más de 30 segundos ni la estrategia de segmentación empleada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roryod/whisper-tiny_portuguese_5c4
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de referencia de la familia Whisper (no verificado en la búsqueda): https://github.com/openai/whisper
- Dataset "portuguese_english": no disponible (no se proporciona enlace en la model card)
- Paper, blog o demo del autor: no disponible
