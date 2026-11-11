# bolorim/whisper-kallaama-finetuned

## Resumen

`bolorim/whisper-kallaama-finetuned` es un adaptador LoRA (PEFT) construido sobre el modelo de reconocimiento automático de voz `openai/whisper-small`. Lo publica el usuario `bolorim` en Hugging Face y su propósito aparente es especializar el modelo base de Whisper en un dominio o idioma concreto, presumiblemente relacionado con el término "kallaama" que aparece en el nombre. El repositorio es de tipo adapter, no contiene pesos completos del modelo, sino únicamente los pesos del adaptador LoRA que deben combinarse con el modelo base de OpenAI.

El modelo base, Whisper-small, es un transformer encoder-decoder de aproximadamente 244 millones de parámetros, entrenado por OpenAI para transcripción y traducción de voz multilingüe. Este adaptador hereda esa arquitectura y esa base de conocimiento, y añade un ajuste fino ligero (LoRA) sobre un dataset no especificado. El entrenamiento documentado es extremadamente corto (20 pasos, batch total de 4), lo que sugiere una prueba de concepto más que un modelo listo para producción.

La relevancia de esta ficha es limitada: se trata de un artefacto experimental sin benchmarks publicados, sin documentación de datos de entrenamiento y con cero descargas en el momento de la consulta. Resulta útil, eso sí, como ejemplo de flujo de trabajo PEFT aplicado a modelos de audio y como punto de partida si alguien quiere reproducir o continuar el ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con adaptador LoRA sobre el modelo base |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base `openai/whisper-small` tiene ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; el adaptador no lo modifica) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en safetensors; la cuantización se aplicaría al modelo base) |
| Idiomas soportados | no disponible (el nombre sugiere un dominio o idioma específico, pero no se documenta) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-small`, un transformer encoder-decoder con atención estándar, diseñado para tareas de ASR (reconocimiento automático de voz), traducción de voz y detección de idioma. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y genera texto de forma autorregresiva. El adaptador LoRA introduce matrices de bajo rango en determinadas capas del modelo base, lo que permite ajustar el comportamiento sin reentrenar los pesos originales.

Los hiperparámetros documentados son: learning rate de 1e-5, batch de entrenamiento de 1 (acumulación de gradiente 4, batch efectivo 4), optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal con 5 pasos de warmup, precisión mixta nativa AMP, semilla 42 y un total de 20 pasos de entrenamiento. El dataset de entrenamiento aparece como "None" en la model card, por lo que no hay información sobre composición, número de tokens ni si hubo validación. No se documenta RLHF, DPO ni ninguna innovación técnica adicional. Las versiones de framework son PEFT 0.21.2, Transformers 5.22.2, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automático de voz (ASR) heredado de Whisper-small, potencialmente especializado mediante el adaptador.
- Transcripción de audio en ventanas de hasta 30 segundos por segmento, con capacidad de procesar audio más largo mediante segmentación.
- Traducción de voz a texto (speech translation) en la medida en que el modelo base la soporta.
- Detección de idioma (language identification) a nivel de segmento, si el ajuste no ha degradado esa capacidad.
- Posible especialización en el dominio o idioma implícito en el nombre "kallaama", no documentada.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no son capacidades propias de un modelo ASR).
- Capacidades multilingües: no disponibles; dependen del modelo base y del posible olvido catastrófico tras el ajuste.

## Casos de uso

- Transcripción de reuniones y notas de voz: el adaptador puede sustituir al modelo base en un pipeline de ASR cuando el audio pertenece al dominio de ajuste, manteniendo la ventana de 30 s de Whisper.
- Subtitulado automático de vídeo: integrado con un segmentador de audio, permite generar subtítulos en el idioma o dominio objetivo, aunque la falta de benchmarks obliga a validar la calidad antes de usarlo en producción.
- Prueba de concepto de ajuste fino con PEFT: sirve como plantilla reproducible para experimentar con LoRA sobre modelos de audio, dado que los hiperparámetros están documentados.
- Investigación sobre olvido catastrófico: al ser un ajuste de solo 20 pasos, es útil para estudiar cómo un entrenamiento mínimo afecta a las capacidades multilingües del modelo base.
- Prototipado de asistentes de voz de dominio restringido: si "kallaama" corresponde a un vocabulario técnico, el adaptador podría mejorar la transcripción de jerga específica, previa evaluación empírica.
- Evaluación comparativa de adaptadores: como artefacto de referencia para comparar estrategias de ajuste LoRA en tareas de ASR con presupuestos de cómputo mínimos.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `whisper-kallaama-finetuned` y una lista de resultados vacía (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa prácticamente nada (repo de 0.0 GB); el coste real lo determina el modelo base `openai/whisper-small` (~244 M de parámetros).
- VRAM estimada para inferencia en fp16: en torno a 1-2 GB para el modelo base, más el overhead de activaciones y del adaptador.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para producción: T4, L4, A10G o A100 si se necesita throughput alto con procesamiento por lotes.
- Opciones de despliegue: `transformers` con PEFT (cargando el adaptador sobre el modelo base), y potencialmente exportación a otros runtimes tras fusionar el adaptador; no se documenta soporte nativo en vLLM, llama.cpp u Ollama para este artefacto concreto.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bolorim/whisper-kallaama-finetuned` | Adaptador sobre ~244 M | Ventanas de 30 s (heredado) | Sin benchmarks publicados | apache-2.0 | Hugging Face (0 descargas) |
| `openai/whisper-small` | ~244 M | Ventanas de 30 s | Benchmarks públicos de OpenAI (WER por idioma) | apache-2.0 | Hugging Face, ampliamente adoptado |
| `openai/whisper-base` | ~74 M | Ventanas de 30 s | Menor precisión que small, más rápido | apache-2.0 | Hugging Face |
| `openai/whisper-medium` | ~769 M | Ventanas de 30 s | Mayor precisión, mayor coste | apache-2.0 | Hugging Face |

La comparación directa con alternativas de la misma categoría (adaptadores LoRA para ASR) no está disponible, ya que no se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce qué dominio o idioma cubre "kallaama" y si el ajuste mejora o degrada el rendimiento del modelo base.
- Entrenamiento extremadamente corto (20 pasos, batch efectivo 4): alta probabilidad de que el adaptador tenga un efecto marginal o inestable.
- Riesgo de olvido catastrófico de las capacidades multilingües y de traducción de Whisper-small, no evaluado.
- Sin benchmarks ni métricas de WER: imposible estimar la calidad real sin evaluación empírica.
- Riesgo de alucinación inherente a los modelos ASR generativos, especialmente en audio con ruido o fuera de dominio.
- Licencia apache-2.0 permisiva para uso comercial, pero el modelo base de OpenAI también es apache-2.0; conviene verificar la compatibilidad de ambos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.
- No apto para producción sin una evaluación previa sobre un conjunto de validación representativo del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bolorim/whisper-kallaama-finetuned
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentación de Transformers para Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
