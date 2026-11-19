# csikasote/omniASR-CTC-300m-Zulu-RDM-ANV-with-ENG

## Resumen

omniASR-CTC-300m-Zulu-RDM-ANV-with-ENG es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2 con cabecera CTC, publicado por el usuario csikasote en Hugging Face. Se trata de una conversión del checkpoint fairseq2 `omniASR_CTC_300M_v2` del proyecto OmniLingual ASR de Meta (facebookresearch), reempaquetado para ser compatible con la librería `transformers` mediante la clase `Wav2Vec2ForCTC`. El modelo cuenta con 325.983.920 parámetros y un repositorio de 1,3 GB en formato safetensors.

El nombre del modelo sugiere un ajuste orientado al idioma zulú (Zulu) con componentes adicionales de inglés (ENG) y posiblemente datos de RDM y ANV, aunque la model card no documenta explícitamente la composición del conjunto de entrenamiento ni los idiomas finales soportados. El modelo emite logits CTC sobre un vocabulario SentencePiece de 10.288 tokens y puede transcribir audio a 16 kHz.

La relevancia de esta ficha es doble: por un lado, ofrece una vía práctica para usar el modelo OmniLingual de Meta dentro del ecosistema `transformers` sin depender de fairseq2; por otro, advierte de la escasez de documentación (licencia, idiomas, benchmarks) que rodea a esta conversión concreta, lo que limita su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder transformer) con cabecera CTC |
| Parametros totales | 325.983.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; ventana típica Wav2Vec2 de ~30 s por segmento, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (el nombre sugiere zulú e inglés, sin confirmación en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas del encoder | 24 |
| Tamano oculto | 1024 |
| Cabezas de atencion | 16 |
| FFN intermedio | 4096 |
| Tamano de vocabulario | 10288 (SentencePiece) |
| Framework de origen | fairseq2 (`omniASR_CTC_300M_v2`) |
| Clase HF | `Wav2Vec2ForCTC` |
| Frecuencia de muestreo | 16.000 Hz |
| Verificacion de paridad | confirmada con `atol=1e-4` frente al checkpoint original |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, un encoder transformer convolucional que procesa la forma de onda de audio directamente y produce representaciones contextuales. Sobre esa salida se aplica una cabecera lineal CTC que genera logits por fotograma sobre un vocabulario SentencePiece de 10.288 tokens. El encoder consta de 24 capas, tamaño oculto de 1024, 16 cabezas de atención y FFN de 4096, lo que da lugar a los ~326 millones de parámetros reportados.

El checkpoint procede del modelo `omniASR_CTC_300M_v2` del proyecto OmniLingual ASR de Meta, entrenado originalmente en fairseq2. La conversión a `transformers` ha sido verificada numéricamente: las salidas coinciden con el checkpoint original dentro de `atol=1e-4` sobre una muestra de audio reservada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones técnicas específicas más allá del propio pipeline CTC de Wav2Vec2.

## Capacidades

- Reconocimiento automático del habla (ASR) a partir de audio a 16 kHz.
- Transcripción de voz a texto en formato CTC con vocabulario SentencePiece.
- Soporte multilingüe potencial (el nombre del modelo sugiere zulú e inglés, sin confirmación documental).
- Inferencia compatible con la API estándar de `transformers` (`Wav2Vec2ForCTC` + `AutoProcessor`).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades de visión, audio generativo ni modos de razonamiento explícito.
- No se documenta diarización, detección de idioma ni puntuación automática.

## Casos de uso

- Transcripción de reuniones y entrevistas en zulú: el modelo puede convertir grabaciones de audio a 16 kHz en texto plano mediante decodificación CTC, adecuado para documentación de actas en entornos donde el zulú es lengua vehicular, siempre que se valide previamente la calidad en ese idioma.
- Subtitulado automático de contenido audiovisual: integrado en un pipeline de preprocesado (resampleo a 16 kHz, segmentación en ventanas) puede generar subtítulos preliminares que luego se revisan manualmente.
- Investigación lingüística de lenguas bantúes: sirve como punto de partida para experimentos de ASR de bajo recursos, dado que deriva del proyecto OmniLingual de Meta y es fácilmente cargable en `transformers`.
- Prototipado rápido de ASR en Python: al ser compatible con `Wav2Vec2ForCTC`, se puede integrar en notebooks y scripts sin depender de fairseq2, lo que acelera la experimentación.
- Evaluación comparativa de checkpoints OmniLingual: útil para validar la paridad numérica frente al modelo original o para comparar variantes del proyecto OmniLingual en un mismo entorno.
- Transcripción de audio en inglés en contextos bilingües: si se confirma el soporte de inglés, podría emplearse en escenarios de code-switching zulú-inglés, aunque requiere validación empírica previa.
- Base para fine-tuning en dominios específicos (médico, legal, educativo): al ser un modelo de 326 M de parámetros y formato safetensors, es viable ajustarlo con datasets propios en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos, más activaciones y buffers; en la práctica, unos 2-3 GB.
- VRAM estimada en FP16: alrededor de 0,7 GB para pesos, con un total práctico de 1,5-2 GB.
- VRAM estimada en cuantización INT8 (si se aplica externamente): en torno a 0,4 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` con PyTorch (vía `Wav2Vec2ForCTC`), exportación a ONNX, y potencialmente `optimum` para inferencia optimizada. No se documenta soporte nativo en vLLM, llama.cpp ni Ollama (son herramientas orientadas a LLM, no a ASR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-300m-Zulu-RDM-ANV-with-ENG | 325.983.920 | audio 16 kHz, ventana no documentada | no disponible (zulú/inglés sugerido) | no disponible | Hugging Face (`transformers`) |
| omniASR_CTC_300M_v2 (original fairseq2) | ~300 M (según nombre) | audio 16 kHz | multilingüe (proyecto OmniLingual) | no disponible en esta ficha | Repositorio facebookresearch/omnilingual-asr |
| Wav2Vec2-Base-960h | ~95 M | audio 16 kHz | inglés | Apache 2.0 (según el modelo original de Facebook) | Hugging Face (`transformers`) |
| Whisper Small | ~244 M | audio 16 kHz, ventanas de 30 s | multilingüe | MIT (según OpenAI) | Hugging Face, OpenAI |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, idiomas declarados y licencia. Whisper Small y Wav2Vec2-Base-960h son alternativas maduras con licencias permisivas y benchmarks públicos, mientras que el modelo evaluado carece de esa documentación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o consultar el repositorio original de OmniLingual antes de desplegarlo en producción.
- Idiomas no documentados: el nombre sugiere zulú e inglés, pero la model card no confirma la cobertura real ni el rendimiento por idioma.
- Sin benchmarks públicos: no hay métricas WER/CER que permitan estimar la calidad de transcripción.
- Riesgo de alucinación y errores de transcripción: como todo modelo CTC, puede producir palabras plausibles pero incorrectas, especialmente en audio con ruido, acentos o vocabulario fuera de dominio.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no se pueden evaluar sesgos demográficos, dialectales o de género.
- Limitaciones de contexto: Wav2Vec2 procesa ventanas cortas de audio; audios largos requieren segmentación manual y pueden perder coherencia entre segmentos.
- Modelo de nicho con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Conversión no oficial: aunque la paridad numérica está verificada, el mantenimiento depende de un único autor y no del equipo de Meta.
- No apto para tareas de generación de texto, razonamiento, código o agentes: es exclusivamente un modelo ASR.

## Enlaces

- Hugging Face: https://huggingface.co/csikasote/omniASR-CTC-300m-Zulu-RDM-ANV-with-ENG
- Repositorio OmniLingual ASR (Meta): https://github.com/facebookresearch/omnilingual-asr
- Documentación de `Wav2Vec2ForCTC` en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Documentación de `AutoProcessor`: https://huggingface.co/docs/transformers/model_doc/auto
