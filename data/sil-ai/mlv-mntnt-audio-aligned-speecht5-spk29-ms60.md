# sil-ai/mlv-mntnt-audio-aligned-speecht5-spk29-ms60

## Resumen

`mlv-mntnt-audio-aligned-speecht5-spk29-ms60` es un modelo de síntesis de voz (text-to-speech) publicado por el equipo `sil-ai` en Hugging Face. Se trata de un ajuste fino del modelo `microsoft/speecht5_tts`, un sistema TTS basado en la arquitectura SpeechT5 de Microsoft, que combina un codificador de texto y un decodificador acústico con un vocoder neuronal para generar audio a partir de texto.

El modelo tiene 144.440.034 parámetros (dato real de los pesos en safetensors) y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. El repositorio ocupa 2,3 GB y está empaquetado en formato safetensors para su uso con la librería `transformers`.

La relevancia de este modelo es limitada y muy específica: se trata de un ajuste fino orientado a un hablante concreto (identificado como `spk29` en el nombre) sobre un conjunto de datos no documentado (`None` en la model card). No hay información pública sobre el corpus de entrenamiento, los idiomas soportados ni evaluaciones subjetivas de calidad. Es un modelo de nicho, útil para quien necesite exactamente esa voz y ese pipeline, pero no un modelo generalista de TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder transformer con vocoder HiFi-GAN) |
| Parametros totales | 144.440.034 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SpeechT5, una arquitectura de Microsoft que unifica tareas de habla y texto mediante un encoder-decoder transformer compartido. En la variante TTS, el encoder procesa la secuencia de texto y el decoder genera un mel-espectrograma que posteriormente se convierte en audio mediante un vocoder neuronal (HiFi-GAN) incluido en el pipeline de `transformers`. El modelo base `microsoft/speecht5_tts` está preentrenado en inglés y este ajuste fino lo especializa en un hablante concreto.

El entrenamiento se realizó con los siguientes hiperparámetros declarados en la model card: learning rate 1e-4, batch size efectivo de 32 (8 × 4 pasos de acumulación), optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con 2000 pasos de warmup, precisión mixta nativa (AMP) y semilla 42. Se ejecutaron 20.000 pasos, equivalentes a 1.250 épocas sobre un dataset no especificado. La pérdida de validación mínima registrada fue de 0,0594 en el paso 3000, y la final de 0,0740 en el paso 20.000, lo que indica un cierto sobreajuste a partir de ese punto. No se documenta el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO (no aplicables en TTS de este tipo).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, generando audio en formato de onda.
- Especialización en una voz concreta (identificador `spk29` en el nombre del modelo), probablemente un hablante único del corpus de ajuste.
- Integración con el pipeline `text-to-audio` de `transformers`, lo que permite usar `pipeline("text-to-audio", model=...)` con `SpeechT5Processor` y `SpeechT5HifiGan`.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multimodal ni de razonamiento; no procesa visión, audio de entrada ni texto largo.
- Capacidades multilingües: no documentadas; el modelo base es principalmente inglés y no hay evidencia de soporte de otros idiomas.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Generación de locuciones para un hablante concreto: si el corpus de ajuste corresponde a una voz que necesitas replicar (por ejemplo, un narrador interno o un personaje), este modelo permite generar frases nuevas con esa identidad vocal mediante el pipeline de `transformers`.
- Pruebas de integración de TTS en pipelines de `transformers`: sirve como ejemplo funcional de un modelo `text-to-audio` ajustado, útil para validar código de inferencia, procesadores y vocoders antes de pasar a un modelo mayor.
- Prototipado de asistentes de voz de un solo hablante: para demos internas donde la variedad de voces no es un requisito y se prioriza tener un checkpoint pequeño (2,3 GB) y con licencia MIT.
- Generación de audio para entornos de investigación en síntesis de voz: permite reproducir el ajuste fino de SpeechT5 documentado en la model card (hiperparámetros, curvas de pérdida) y comparar con otros ajustes del mismo autor.
- Sustitución de voces en contenidos pregrabados con guion fijo: el modelo puede regenerar segmentos de texto concretos con la misma voz del corpus, útil para correcciones puntuales en postproducción.
- Docencia y experimentación con SpeechT5: al ser un ajuste fino pequeño y con licencia permisiva, es adecuado para talleres donde se enseña a afinar modelos TTS y a evaluar el sobreajuste a partir de las curvas de validación publicadas.

## Benchmarks y rendimiento

La model card declara un `model-index` vacío (`results: []`), por lo que no hay resultados de benchmarks estándar (MOS, WER, MCD, etc.). El único dato cuantitativo disponible es la pérdida de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validacion final (paso 20000) | 0,0740 |
| Loss de validacion minima | 0,0594 (paso 3000) |
| Loss de entrenamiento final | 0,0289 (paso 20000) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo para los pesos (144 M de parámetros), más el vocoder HiFi-GAN y los buffers intermedios; en la práctica, menos de 2 GB en total.
- VRAM estimada en fp16/bf16: alrededor de 0,3 GB para los pesos, con un consumo total inferior a 1,5 GB incluyendo el vocoder.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `text-to-audio`), `SpeechT5Processor` + `SpeechT5ForTextToSpeech` + `SpeechT5HifiGan`; no hay versiones GGUF ni soporte documentado en llama.cpp u Ollama (no aplica a TTS de este tipo). vLLM y TGI no soportan SpeechT5 de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera síntesis en tiempo real o más rápida en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sil-ai/mlv-mntnt-audio-aligned-speecht5-spk29-ms60 | 144 M | no aplica (TTS) | MIT | Hugging Face | Ajuste fino de un hablante, sin benchmarks |
| microsoft/speecht5_tts | ~144 M | no aplica (TTS) | MIT | Hugging Face | Modelo base, multihablante en inglés, ampliamente usado |
| Coqui TTS (XTTS v2) | ~470 M | no aplica (TTS) | Coqui Public Model License (no comercial) | Hugging Face / GitHub | Multilingüe, clonación de voz, licencia restrictiva |
| VITS / Piper | variable (5-100 M) | no aplica (TTS) | MIT / GPL según variante | Hugging Face / GitHub | Enfoque en inferencia rápida en CPU, voces limitadas |

La comparación es aproximada: no hay métricas comunes publicadas para este checkpoint. Frente al modelo base, la diferencia es la especialización en un hablante; frente a XTTS v2, la licencia MIT es una ventaja clara para uso comercial, aunque XTTS ofrece multilingüismo y clonación que este modelo no documenta.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica `None` como dataset, por lo que se desconoce la procedencia, calidad y posibles sesgos del corpus de voz.
- Riesgo de sobreajuste: la pérdida de validación mínima se alcanza en el paso 3000 (0,0594) y asciende hasta 0,0740 al final; el checkpoint publicado corresponde al paso 20.000, no al óptimo de validación.
- Idiomas no especificados: no hay evidencia de soporte multilingüe; el modelo base está orientado al inglés y el ajuste probablemente hereda esa limitación.
- Una sola voz: el identificador `spk29` sugiere un hablante único; no se puede seleccionar entre múltiples voces.
- Riesgo de alucinación acústica: como todo TTS, puede generar artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del corpus, especialmente en nombres propios y términos técnicos.
- Sesgos potenciales: al desconocerse el corpus, no se pueden evaluar sesgos de género, acento o edad en la voz generada.
- Licencia MIT: permite uso comercial, pero conviene verificar que el corpus de voz original no imponga restricciones adicionales sobre el uso de la identidad vocal (no documentado).
- Sin benchmarks subjetivos: no hay evaluaciones MOS ni comparaciones con otros sistemas, por lo que la calidad percibida no está validada públicamente.
- Uso en producción: al no haber métricas de latencia ni de robustez, se recomienda validar con un conjunto propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sil-ai/mlv-mntnt-audio-aligned-speecht5-spk29-ms60
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Paper de SpeechT5: https://arxiv.org/abs/2110.07205
- Documentación de SpeechT5 en transformers: https://huggingface.co/docs/transformers/model_doc/speecht5
- Vocoder HiFi-GAN usado en el pipeline: https://huggingface.co/microsoft/speecht5_hifigan
