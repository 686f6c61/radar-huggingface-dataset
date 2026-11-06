# shinas101/whisper-small-ml

## Resumen

whisper-small-ml es un ajuste fino (fine-tuning) del modelo de reconocimiento automático de voz openai/whisper-tiny, publicado por el usuario shinas101 en Hugging Face. A pesar del nombre, el modelo base declarado en la model card y en los metadatos es whisper-tiny, no whisper-small, y el recuento real de parámetros en safetensors (37.760.640, aproximadamente 0,04 mil millones) confirma que se trata de la variante tiny de la familia Whisper. El modelo está pensado para la tarea de transcripción de voz a texto (pipeline automatic-speech-recognition) mediante la librería transformers.

El ajuste se realizó con el Trainer de Hugging Face sobre un dataset no especificado ("None dataset" en la model card) y alcanzó un WER de 10,5437 en el conjunto de evaluación, con una pérdida de validación de 0,0159 tras 4000 pasos de entrenamiento. La información pública disponible es muy escasa: la model card está generada automáticamente y no documenta el corpus de entrenamiento, los idiomas cubiertos ni los usos previstos.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste con muy pocas descargas (4) y sin likes, útil únicamente como referencia para quien quiera reproducir el proceso de fine-tuning de Whisper tiny o evaluar el impacto de un ajuste corto sobre un modelo base muy pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajustado desde openai/whisper-tiny |
| Parametros totales | 37.760.640 (aproximadamente 0,04 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s en su arquitectura original) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB, incluye checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder con atención estándar, diseñado para recibir espectrogramas log-Mel de audio y generar tokens de texto. Al partir de openai/whisper-tiny, el modelo hereda la configuración del modelo base (aproximadamente 39 M de parámetros en su versión original; el recuento en safetensors de este ajuste es de 37.760.640). No hay innovaciones arquitectónicas propias: es un fine-tuning directo.

El entrenamiento se realizó con el Trainer de Hugging Face con los siguientes hiperparámetros: learning rate 1e-05, batch de entrenamiento 16, batch de evaluación 8, semilla 42, optimizador AdamW torch fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup, 4000 pasos totales y precisión mixta nativa (AMP). La evolución del WER en validación fue: 81,7581 en el paso 1000, 53,6331 en el 2000, 19,7663 en el 3000 y 10,5437 en el 4000, con pérdida de validación descendiendo de 0,2324 a 0,0159. No se documenta el dataset de entrenamiento, el número de tokens de audio, ni si hubo RLHF, DPO o alguna fase de alineación.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio a texto mediante el pipeline automatic-speech-recognition de transformers.
- Ajuste específico sobre un corpus no documentado, lo que puede mejorar la transcripción en el dominio de ese corpus frente al modelo base.
- Compatibilidad con la API estándar de Whisper en transformers (processor, generate, pipeline).
- No se documenta soporte de traducción de voz, detección de idioma, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.
- No se documentan capacidades multilingües específicas; los idiomas soportados figuran como "no disponibles".

## Casos de uso

- Transcripción de audio en un dominio concreto: si el corpus de ajuste coincide con el tipo de audio a procesar (por ejemplo, un conjunto de grabaciones específico), el modelo puede transcribir ese tipo de material con un WER de aproximadamente 10,5 sobre el conjunto de evaluación declarado. Es adecuado solo si se valida antes con datos propios.
- Prototipado rápido de pipelines ASR: al ser un modelo de 37,7 M de parámetros, se puede cargar y ejecutar en CPU o GPU modesta para probar flujos de transcripción antes de pasar a modelos mayores.
- Experimentación académica sobre fine-tuning de Whisper: sirve como referencia reproducible de un ajuste corto (4000 pasos) con hiperparámetros documentados, útil para comparar curvas de WER frente a otros ajustes.
- Pruebas de integración con transformers: permite validar la compatibilidad del pipeline automatic-speech-recognition en entornos de desarrollo sin coste computacional elevado.
- Generación de subtítulos en entornos con recursos limitados: por su tamaño reducido, puede desplegarse en dispositivos con poca memoria, siempre que la precisión de 10,5 WER sea aceptable para el caso de uso.
- Benchmark interno de referencia: como línea base de bajo coste para comparar con otros modelos ASR en una evaluación propia, dado que no hay benchmarks publicados más allá del WER de validación.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card. No hay resultados en el model-index (lista vacía).

| Metrica | Valor |
|---|---|
| WER (conjunto de evaluacion) | 10,5437 |
| Loss de validacion | 0,0159 |
| Loss de entrenamiento (paso 4000) | 0,0110 |

Evolución del WER durante el entrenamiento:

| Paso | Epoch | Validation loss | WER |
|---|---|---|---|
| 1000 | 3,3784 | 0,2324 | 81,7581 |
| 2000 | 6,7568 | 0,0902 | 53,6331 |
| 3000 | 10,1351 | 0,0310 | 19,7663 |
| 4000 | 13,5135 | 0,0159 | 10,5437 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR y el autor no los proporciona.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos (37,7 M de parámetros, aproximadamente 150 MB), más el overhead de activaciones y del processor de audio; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas), GTX o iGPU con memoria suficiente.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), y potencialmente exportación a otros runtimes si se convierte el checkpoint; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estos no soportan ASR de Whisper de forma nativa en el caso de llama.cpp/Ollama).
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud del audio. Para audio de 30 s en GPU consumer se espera un coste bajo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shinas101/whisper-small-ml | 37,7 M | ventanas de 30 s (arquitectura Whisper) | 10,5437 (validacion propia) | apache-2.0 | Hugging Face, 4 descargas |
| openai/whisper-tiny | aproximadamente 39 M | ventanas de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small | aproximadamente 244 M (0,2 B segun la model card) | ventanas de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small.en | aproximadamente 244 M | ventanas de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face, solo ingles |

La comparación es limitada: el WER de 10,5437 de whisper-small-ml corresponde a un conjunto de evaluación no documentado, por lo que no es directamente comparable con las cifras publicadas de los modelos de OpenAI. El nombre del modelo induce a confusión, ya que sugiere la variante small cuando en realidad es un ajuste de tiny.

## Limitaciones y advertencias

- Nombre engañoso: se llama whisper-small-ml pero el modelo base es openai/whisper-tiny, con 37,7 M de parámetros, no la variante small.
- Dataset de entrenamiento no documentado ("None dataset"): no se puede saber a qué dominio o idioma está adaptado ni evaluar su generalización.
- Idiomas soportados no disponibles: no hay garantía de comportamiento multilingüe más allá de lo que herede del modelo base.
- WER de 10,5437 medido sobre un conjunto de evaluación no descrito; no es comparable con cifras de terceros.
- Riesgo de alucinación en transcripciones: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- Sesgos: al no documentarse el corpus, no se pueden evaluar sesgos demográficos, acústicos o lingüísticos.
- Licencia apache-2.0: permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar también las condiciones del modelo base (también apache-2.0).
- Madurez muy baja: 4 descargas, 0 likes, creado y actualizado el mismo día (2026-11-06), sin documentación de usos previstos ni limitaciones.
- No apto para producción sin validación previa: el modelo card está generado automáticamente y no se han publicado pruebas independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinas101/whisper-small-ml
- Modelo base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- openai/whisper-small: https://huggingface.co/openai/whisper-small
- openai/whisper-small.en: https://huggingface.co/openai/whisper-small.en
