# sil-ai/myx-mrk-tts-audio-aligned-speecht5

## Resumen

myx-mrk-tts-audio-aligned-speecht5 es un modelo de síntesis de voz (text-to-speech) desarrollado por el grupo sil-ai mediante fine-tuning de microsoft/speecht5_tts. El modelo parte de la arquitectura SpeechT5 de Microsoft, un transformer encoder-decoder que combina un encoder de texto y un decoder acústico con un postnet para generar formas de onda a partir de texto, y se ha ajustado sobre un corpus no especificado en la model card. El resultado es un checkpoint de aproximadamente 144 millones de parámetros, distribuido en formato safetensors y pensado para integrarse en el ecosistema transformers.

El interés de esta ficha es limitado pero relevante como caso de estudio: se trata de un fine-tune generado automáticamente con el Trainer de Hugging Face, con documentación mínima y sin datos publicados sobre el conjunto de entrenamiento ni sobre evaluación perceptual (MOS, WER de ASR de ida y vuelta, etc.). El autor solo reporta una pérdida de validación de 0,1980 en el paso 20.000, un valor que en TTS no informa directamente de la calidad audible.

Por tanto, el modelo debe considerarse un artefacto experimental o de nicho, adecuado para explorar el flujo de fine-tuning de SpeechT5 y para prototipos internos, no como una solución lista para producción sin una evaluación acústica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechT5 (transformer encoder-decoder con encoder de texto, decoder acústico y postnet) |
| Parámetros totales | 144.440.802 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SpeechT5 de microsoft/speecht5_tts, un transformer encoder-decoder diseñado originalmente para unificar tareas de habla y texto. En la variante TTS, el encoder procesa la secuencia de texto y el decoder genera un mel-espectrograma que un vocoder (típicamente HiFi-GAN, no incluido en este repositorio) convierte en audio. SpeechT5 requiere además un speaker embedding de entrada para condicionar la voz; la model card no especifica qué embedding ni qué voz se usó en el ajuste.

El entrenamiento se realizó con el Trainer de Hugging Face sobre un dataset no identificado ("None dataset" en la model card). Los hiperparámetros reportados son: learning rate 1e-4, batch efectivo de 32 (batch de 8 con acumulación de gradiente de 4), optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con 2.000 pasos de warmup, 20.000 pasos totales y precisión mixta nativa (AMP), con semilla 42. La pérdida de entrenamiento descendió de 0,236 a 0,0567 mientras la de validación tocó mínimo en 0,1616 (paso 3.000) y repuntó hasta 0,1980 al final, lo que sugiere sobreajuste a partir de ese punto. No se documenta uso de RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Síntesis de voz a partir de texto (text-to-audio) en el pipeline de transformers.
- Generación de mel-espectrogramas condicionados por speaker embedding; requiere vocoder externo para obtener audio.
- Fine-tune sobre una voz o dominio concreto (no especificado), por lo que la calidad es específica de ese dominio.
- No soporta tool calling ni function calling: es un modelo acústico, no un LLM.
- No soporta razonamiento multi-paso ni uso como agente.
- Capacidades multilingües: no documentadas; no se puede afirmar que soporte más de un idioma.
- Sin modo thinking, visión ni audio de entrada.

## Casos de uso

- Prototipado de pipelines TTS: sirve para montar un flujo completo texto → mel-espectrograma → vocoder HiFi-GAN en transformers y validar la integración antes de invertir en un modelo mayor.
- Experimentación con fine-tuning de SpeechT5: el checkpoint y los hiperparámetros publicados permiten reproducir el ajuste y estudiar el efecto del sobreajuste observado en la curva de validación.
- Generación de voz para demos internas: con la licencia MIT y 144 M de parámetros, se puede desplegar en una máquina de desarrollo para pruebas de concepto sin coste de licencia.
- Investigación sobre clonación de voz ligera: el condicionamiento por speaker embedding permite explorar variaciones de voz, siempre que se disponga de embeddings compatibles.
- Evaluación comparativa de fine-tunes de SpeechT5: útil como punto de referencia frente a otros checkpoints de la misma familia para medir la influencia del dataset y los hiperparámetros.
- Generación de audio para datasets sintéticos de ASR: se puede usar para aumentar datos de entrenamiento de reconocimiento de voz, con la advertencia de que la calidad no está validada y puede introducir artefactos.

## Benchmarks y rendimiento

La model card declara un model-index sin resultados (`results: []`). El único dato numérico publicado es la pérdida de validación.

| Métrica | Valor |
|---|---|
| Validation loss (paso 20.000) | 0,1980 |
| Validation loss mínima (paso 3.000) | 0,1616 |
| Training loss final | 0,0567 |

No se han publicado resultados de benchmarks en la información disponible (ni MOS, ni WER, ni MCD, ni comparaciones con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 para los 144 M de parámetros, más el vocoder externo (HiFi-GAN, ~0,1 GB) y los buffers de activación; en la práctica, menos de 2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (pipeline `text-to-audio`), con vocoder externo; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sil-ai/myx-mrk-tts-audio-aligned-speecht5 | 144,4 M | no disponible | MIT | Hugging Face | Fine-tune sin dataset documentado; validación con sobreajuste |
| microsoft/speecht5_tts | ~144 M | no disponible | MIT | Hugging Face | Modelo base; documentación y evaluación más completas |
| Otros TTS open source (p. ej. Coqui TTS, VITS) | variable | no aplica | variable | Hugging Face / GitHub | No se dispone de datos comparativos en la información proporcionada |

No se dispone de benchmarks comparativos publicados para este checkpoint, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento no identificado: la model card indica "None dataset", lo que impide conocer la composición, el idioma y la calidad de los datos.
- Sobreajuste probable: la pérdida de validación mínima se alcanza en el paso 3.000 y empeora hasta el final del entrenamiento.
- Sin evaluación perceptual: no hay MOS, WER ni ninguna métrica de calidad audible; la pérdida de validación no es un indicador fiable de naturalidad.
- Idioma no documentado: no se puede asumir que el modelo sintetice correctamente castellano u otros idiomas.
- Requiere vocoder y speaker embedding externos; la model card no especifica cuáles, lo que complica la reproducibilidad.
- Riesgo de artefactos acústicos y de pronunciación incorrecta en textos fuera del dominio de entrenamiento.
- Sesgos de voz: al estar ajustado sobre una voz concreta no documentada, puede reproducir características demográficas o de estilo no deseadas.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad sobre la calidad y la legalidad del uso de la voz generada.
- Sin soporte de tool calling, agentes ni razonamiento: no debe confundirse con un modelo de lenguaje.
- Documentación incompleta: la model card es la generada automáticamente por el Trainer y no se ha revisado.

## Enlaces

- Hugging Face: https://huggingface.co/sil-ai/myx-mrk-tts-audio-aligned-speecht5
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
