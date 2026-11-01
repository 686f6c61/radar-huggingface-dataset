# mikaelaehunter/whisper-tiny_russian_english

## Resumen

Whisper tiny russian_english es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario mikaelaehunter en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante "tiny", con 37.760.640 parámetros totales, y se ha reentrenado sobre el dataset denominado russian_english para transcripción de audio. Su propósito declarado es la transcripción ASR bilingüe ruso-inglés, aunque la model card solo declara oficialmente el idioma inglés.

El modelo es relevante por su tamaño reducido (0,6 GB de repositorio en safetensors), lo que permite desplegarlo en hardware muy modesto, incluso en CPU o GPUs de consumo con poca VRAM. Es un ejemplo típico de fine-tune ligero generado con el Trainer de HuggingFace, orientado a experimentación y a tareas de transcripción de bajo coste computacional más que a producción de alta precisión.

La información disponible es escasa: la model card está generada automáticamente y contiene secciones sin completar ("More information needed"). El autor declara un WER de 10,0178 sobre el split de test del dataset russian_english, con una pérdida de validación de 0,2262 tras 2000 pasos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers/GGUF via conversion) |
| Idiomas soportados | en (declarado); el nombre del dataset sugiere ruso e ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para procesar espectrogramas mel de audio de hasta 30 segundos y generar transcripciones token a token. Whisper tiny es la variante más pequeña de la familia Whisper, con aproximadamente 39 millones de parámetros en su versión original; este fine-tune reporta 37.760.640 parámetros en safetensors.

El entrenamiento se realizó con el Trainer de HuggingFace sobre el dataset russian_english, con los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluación de 1, semilla 42, optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos checkpoints: el paso 1000 (epoch 1,0707) con pérdida de validación 0,2407 y WER 10,6026, y el paso 2000 (epoch 2,1413) con pérdida 0,2262 y WER 10,0178. No se documenta composición del dataset, número de tokens de audio, ni uso de RLHF/DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y, presumiblemente, ruso, dado el nombre del dataset de entrenamiento.
- Transcripción de audio de hasta 30 segundos por ventana, según el diseño nativo de Whisper.
- Generación de texto a partir de audio mediante el pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de traducción explícita, diarización, visión ni audio en streaming.
- No se documenta modo "thinking" ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción de notas de voz y reuniones cortas en inglés: el modelo puede procesar clips de hasta 30 segundos y generar texto, adecuado para prototipos y aplicaciones de bajo coste donde no se requiere alta precisión.
- Subtitulado automático de vídeos breves: con 37,7 M de parámetros, se puede ejecutar en CPU o GPU integrada para generar subtítulos preliminares que luego se revisan manualmente.
- Preprocesado de audio en pipelines de datos: transcripción masiva de corpus de audio en inglés o ruso-inglés para alimentar sistemas de búsqueda o análisis, aprovechando su reducido tamaño para procesar grandes volúmenes con recursos limitados.
- Aplicaciones embebidas o edge: su tamaño de 0,6 GB permite desplegarlo en dispositivos con poca memoria, como Raspberry Pi o portátiles sin GPU dedicada, para dictado offline.
- Experimentación académica y fine-tuning adicional: sirve como punto de partida para ajustes sobre dominios específicos (jerga médica, legal) dado su bajo coste de entrenamiento.
- Transcripción bilingüe ruso-inglés en entornos de atención al cliente: aunque el WER es alto (10,02), puede usarse para generar borradores de transcripción en conversaciones cortas que luego se corrigen.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| russian_english | test | WER | 10,0178 |
| russian_english | validación (paso 2000) | Loss | 0,2262 |
| russian_english | validación (paso 1000) | WER | 10,6026 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (37,7 M de parámetros), aproximadamente 0,15 GB en fp16 y menos de 0,1 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100, H100 sin problema, aunque el hardware de gama alta está sobredimensionado para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de HuggingFace; conversión a GGUF para llama.cpp/whisper.cpp posible pero no documentada por el autor; vLLM y TGI no están orientados a Whisper de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de decenas de milisegundos por clip de 30 s en GPU y de segundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mikaelaehunter/whisper-tiny_russian_english | 37,7 M | 30 s | 10,02 (russian_english) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | ~39 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | ~74 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de datos comparativos de WER entre estos modelos en la información proporcionada; la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card generada automáticamente con secciones sin completar; no hay documentación sobre composición del dataset, sesgos o evaluación cualitativa.
- WER de 10,02 sobre el dataset de test, un valor alto que sugiere precisión limitada para producción sin revisión humana.
- El modelo declara oficialmente solo el idioma inglés, aunque el nombre del dataset indique ruso-inglés; el soporte real de ruso no está verificado.
- Riesgo de alucinación en la transcripción: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente con ruido o acentos no vistos en entrenamiento.
- Ventana de audio limitada a 30 segundos por inferencia; audios más largos requieren segmentación manual.
- No hay información sobre sesgos demográficos, acentos o dominios cubiertos.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Solo 47 descargas y 0 likes en el momento de la consulta: modelo de muy baja adopción, sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/mikaelaehunter/whisper-tiny_russian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
