# manishehehe/whisper-small-hindi-lora

## Resumen

`whisper-small-hindi-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por manishehehe que ajusta el modelo de reconocimiento automático del habla (ASR) `openai/whisper-small` para mejorar su rendimiento en hindi. El adaptador se entrena sobre 500 muestras de audio del dataset Google FLEURS (subconjunto `hi_in`) y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones. El objetivo principal es reducir la tasa de error de palabra (WER) del modelo base en hindi, especialmente en grabaciones de estudio fuera del dominio de entrenamiento.

La arquitectura del modelo base es un transformer encoder-decoder de 244 millones de parámetros, con ventanas de audio de 30 segundos. El adaptador LoRA añade alrededor de 1,8 millones de parámetros entrenables (0,7 % del total), lo que permite un ajuste fino eficiente en hardware modesto, como una GPU T4 de Colab. La relevancia de este modelo radica en que demuestra que con muy pocos datos y técnicas de PEFT es posible mejorar significativamente el rendimiento de un modelo ASR multilingüe en un idioma con recursos limitados, como el hindi, y cerrar parte de la brecha con sistemas comerciales como Sarvam Saaras v3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con adaptadores LoRA en `q_proj` y `v_proj` |
| Parametros totales | 244M (modelo base) + ~1.8M (adaptador LoRA) |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | No especificado (el adaptador se distribuye en safetensors; el base puede cuantizarse con 8-bit o 4-bit) |
| Idiomas soportados | Hindi (específico del adaptador); el modelo base soporta múltiples idiomas |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-small` es un transformer encoder-decoder de 244 millones de parámetros, entrenado por OpenAI sobre más de 680.000 horas de audio en 96 idiomas. El adaptador LoRA se añade a las capas de atención (proyecciones `q_proj` y `v_proj`) con un rango `r=32` y una escala `alpha=64`, lo que permite ajustar el modelo sin modificar los pesos originales. El entrenamiento se realizó con PEFT (Parameter-Efficient Fine-Tuning) sobre 500 muestras del conjunto FLEURS `hi_in`, con un batch efectivo de 32, tasa de aprendizaje 1e-3, precisión fp16 y un total de 500 pasos. El proceso duró aproximadamente 35 minutos en una GPU T4 de Google Colab.

No se aplicó RLHF ni DPO; el entrenamiento fue únicamente de ajuste fino supervisado (SFT) sobre el objetivo de transcripción. La innovación principal reside en el uso de LoRA para adaptar un modelo ASR preentrenado a un idioma de bajos recursos, logrando mejoras considerables con un coste computacional mínimo.

## Capacidades

- Reconocimiento automático del habla (ASR) en hindi, tanto para audio de lectura (dominio FLEURS) como para grabaciones de estudio (dominio IndicTTS).
- Transcripción de audio a texto en formato Unicode Devanagari (el tokenizer de Whisper maneja el alfabeto).
- El adaptador no añade capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un módulo de reconocimiento de voz.
- El modelo base `whisper-small` es multilingüe, por lo que el adaptador no elimina el resto de idiomas, aunque solo se ha ajustado para hindi.
- No incluye soporte de visión ni audio adicional; solo procesa señales de audio de 16 kHz.

## Casos de uso

- **Transcripción de reuniones en hindi**: el modelo puede transcribir grabaciones de reuniones o conferencias en hindi con una precisión mejorada respecto al base, gracias a la reducción de WER del 29,8 % en el conjunto de evaluación. Se usaría cargando el adaptador sobre `whisper-small` y pasando audio de 16 kHz.
- **Subtitulado automático de vídeos**: para vídeos en hindi, el adaptador genera subtítulos en texto con menor tasa de error que el modelo base, lo que facilita la localización de contenidos en plataformas de streaming o redes sociales.
- **Asistentes de voz para servicios en hindi**: en aplicaciones de atención al cliente o asistencia por voz, el modelo puede reconocer consultas en hindi con mayor robustez que el modelo base, mejorando la experiencia del usuario en regiones donde el hindi es idioma principal.
- **Análisis de llamadas de centros de soporte**: la transcripción precisa de conversaciones telefónicas en hindi permite extraer métricas de calidad, detectar sentimiento o buscar palabras clave, con un coste computacional bajo gracias a los parámetros LoRA.
- **Creación de subtítulos en directo**: con una GPU modesta, el adaptador puede transcribir audio en tiempo real con una latencia de unos pocos segundos, adecuado para eventos en directo o clases en línea.
- **Investigación en ASR para idiomas con pocos recursos**: el adaptador sirve como punto de partida para estudios comparativos sobre eficiencia de LoRA en ASR, ya que su pequeño tamaño (0,7 % de parámetros entrenables) y su licencia MIT facilitan su integración en pipelines experimentales.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de WER sobre un conjunto de evaluación fuera de dominio (IndicTTS, voz femenina en hindi, n=30). No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo es específico para ASR y no para tareas de lenguaje general.

| Conjunto de evaluación | Modelo | WER |
|---|---|---|
| IndicTTS (out-of-domain, n=30) | Whisper-small (baseline) | 0,515 |
| IndicTTS (out-of-domain, n=30) | Whisper-small + LoRA (este modelo) | 0,362 |
| IndicTTS (out-of-domain, n=30) | Sarvam Saaras v3 | 0,237 |

El adaptador reduce el WER en un 29,8 % relativo respecto al modelo base y cierra el 55 % de la brecha entre el baseline y el sistema comercial Sarvam Saaras v3. No se han publicado resultados en otros conjuntos de referencia.

## Requisitos de hardware

- **VRAM estimada**: el modelo base `whisper-small` requiere aproximadamente 1,5 GB de VRAM en FP16. Con el adaptador LoRA, el requisito adicional es mínimo (menos de 0,1 GB). En cuantización 8-bit o 4-bit, el consumo puede reducirse a menos de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, como la NVIDIA T4 (usada en el entrenamiento), RTX 2060, RTX 3060, RTX 4090, o incluso CPU con llama.cpp (si se convierte a GGUF). El adaptador es compatible con las GPUs de consumo de gama baja.
- **Cabe en consumer GPU**: sí, en la mayoría de GPUs modernas de consumo, incluyendo GTX 1660 Super, RTX 2060, etc.
- **Opciones de despliegue**: el modelo se puede ejecutar con Hugging Face Transformers (pipeline `automatic-speech-recognition`), con `peft` para cargar el adaptador, o bien usar `vLLM` o `TGI` si se convierte a un formato servidor. También es compatible con `Ollama` si se exporta a GGUF, aunque no hay un conversor oficial.
- **Latencia y throughput**: en una T4, la transcripción de 30 segundos de audio tarda aproximadamente 1-2 segundos en generación. En una RTX 4090, se reduce a menos de 0,5 segundos. No se han publicado medidas formales de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (IndicTTS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whisper-small` (base) | 244M | 30 s | 0,515 | MIT | Hugging Face |
| `manishehehe/whisper-small-hindi-lora` | 244M + 1,8M | 30 s | 0,362 | MIT | Hugging Face |
| `levanell/whisper-small-hi-ft` | 244M + LoRA | 30 s | no disponible | MIT (según repo) | Hugging Face |
| `ArchCoder/whisper-small-hindi-lora` | 244M + LoRA | 30 s | no disponible | MIT (según repo) | Hugging Face |

La comparativa se centra en adaptadores LoRA para hindi sobre la misma base. No se han publicado resultados detallados para los otros adaptadores, por lo que no se pueden contrastar numéricamente. El modelo de manishehehe es el único que reporta métricas de WER en un conjunto de evaluación fuera de dominio.

## Limitaciones y advertencias

- **Conjunto de evaluación reducido**: los resultados se basan en solo 30 muestras de voz femenina en hindi, por lo que no se ha validado la significancia estadística. Las reducciones de WER son descriptivas y podrían variar con más datos.
- **Dominio de entrenamiento limitado**: el adaptador se entrena con 500 muestras de FLEURS (habla leída), mientras que la evaluación se realiza en grabaciones de estudio de IndicTTS, que tienen características acústicas distintas. El rendimiento en audio con ruido, acentos regionales o habla espontánea puede ser inferior.
- **Posibles sesgos**: el modelo puede tener sesgos hacia acentos o dialectos específicos del hindi (el dataset FLEURS `hi_in` se centra en el hindi estándar de India), lo que podría producir errores en otros acentos (p. ej., hindi de Nepal o de otras regiones).
- **Riesgo de alucinación**: al igual que el modelo base, puede generar transcripciones inventadas en segmentos de audio silenciosos o ininteligibles, especialmente en entornos ruidosos.
- **Licencia**: aunque el adaptador es MIT, el modelo base `whisper-small` también es MIT, pero hay que verificar que los datos de entrenamiento (FLEURS) estén permitidos para uso comercial; el dataset FLEURS se distribuye bajo licencia CC BY 4.0, lo que permite uso comercial con atribución.
- **Sin garantía de producción**: el autor no proporciona un test de significancia ni evaluación en múltiples conjuntos, por lo que se recomienda validar el modelo en tu propio dominio antes de desplegarlo en producción.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/manishehehe/whisper-small-hindi-lora
- Código de entrenamiento: https://github.com/manishehehe/whisper-indic-lora
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Modelo base `openai/whisper-small`: https://huggingface.co/openai/whisper-small
- Repositorio similar: https://github.com/RxjxtNN/whisper-hindi-asr
- Repositorio similar: https://github.com/modelpath-dev/whisper-finetune
- Adaptador similar en Hugging Face: https://huggingface.co/levanell/whisper-small-hi-ft
- Adaptador similar en Hugging Face: https://huggingface.co/ArchCoder/whisper-small-hindi-lora
