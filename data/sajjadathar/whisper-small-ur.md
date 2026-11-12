# sajjadathar/whisper-small-ur

## Resumen

Whisper Small Ur es un ajuste fino (fine-tuning) del modelo openai/whisper-small, publicado por el usuario sajjadathar en Hugging Face. El modelo está especializado en reconocimiento automático del habla (ASR) y se ha entrenado sobre el dataset Common Voice 11.0. A pesar de que el identificador del repositorio incluye el sufijo "ur" (habitual para urdu), la model card y los metadatos declaran el hindi (`hi`) como único idioma soportado, por lo que debe interpretarse como un modelo de ASR para hindi.

Se trata de un transformer encoder-decoder de tipo Whisper con 241.734.912 parámetros totales, derivado directamente de la arquitectura original de OpenAI. El ajuste se realizó con la librería Transformers y el Trainer, con un total de 1000 pasos de entrenamiento y una tasa de aprendizaje de 1e-05. El resultado declarado es un WER de 31,0451 sobre el split de test de Common Voice 11.0 en hindi, con una pérdida de validación de 0,5564.

La relevancia de este modelo es limitada pero concreta: ofrece una alternativa ligera (241 M de parámetros, ~1 GB de repositorio) para transcripción de audio en hindi, con licencia Apache 2.0 que permite uso comercial. No obstante, el WER superior al 30 % indica un rendimiento modesto que conviene evaluar antes de usarlo en producción, y la documentación del autor es prácticamente inexistente (la model card contiene secciones "More information needed").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Transformers, no documentada por el autor) |
| Idiomas soportados | hindi (`hi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder diseñado para ASR que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. El ajuste fino se realizó sobre el dataset mozilla-foundation/common_voice_11_0 en su configuración de hindi, con los siguientes hiperparámetros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 16, batch de evaluación de 8, semilla 42, optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de warmup, 1000 pasos totales de entrenamiento y precisión mixta nativa (AMP).

La evolución del entrenamiento muestra un sobreajuste claro: la pérdida de entrenamiento cae de 0,3327 (paso 250) a 0,0325 (paso 1000), mientras que la pérdida de validación se estanca y repunta de 0,4946 a 0,5564. El WER de validación oscila entre 30,8557 (paso 500) y 32,7849 (paso 250), sin una mejora sostenida tras el paso 500. No se documentan innovaciones técnicas adicionales, ni uso de RLHF/DPO, ni detalles sobre la composición exacta del dataset más allá de la referencia a Common Voice 11.0.

## Capacidades

- Reconocimiento automático del habla (ASR) en hindi: transcripción de audio a texto.
- Generación de transcripciones con marcas de tiempo a nivel de segmento (capacidad heredada de la arquitectura Whisper, aunque no documentada explícitamente por el autor).
- Procesamiento de audio en ventanas de hasta 30 segundos por inferencia (característica de Whisper-small).
- Compatible con la pipeline `automatic-speech-recognition` de Transformers.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe: el modelo declara únicamente hindi.
- No se documentan capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de reuniones y notas de voz en hindi: el modelo puede convertir grabaciones de hasta 30 segundos por segmento en texto, adecuado para equipos que trabajan en hindi y necesitan actas automatizadas, aunque el WER superior al 30 % exige revisión humana.
- Subtitulado automático de vídeo en hindi: integrable en pipelines de postproducción para generar subtítulos preliminares que un editor corrige después; su tamaño reducido (~1 GB) permite desplegarlo en infraestructura modesta.
- Indexación y búsqueda de archivos de audio en hindi: transcripción previa de un corpus de audio para habilitar búsqueda por texto sobre el contenido hablado.
- Asistentes de voz para atención al cliente en hindi: como componente ASR de un sistema de voz conversacional, siempre que se acepte un margen de error significativo y se combine con corrección posterior.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en hindi, con la salvedad de que la calidad requiere revisión.
- Prototipado e investigación en ASR para hindi: punto de partida ligero para experimentos de ajuste fino adicional o comparación de técnicas, dado su bajo coste computacional y licencia permisiva.
- Procesamiento por lotes de encuestas o entrevistas en hindi: transcripción masiva en entornos con GPU de gama media gracias a sus 241 M de parámetros.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Whisper Small Hi - Sanchit Gandhi (sajjadathar/whisper-small-ur) | Common Voice 11.0 (hi) | test | WER | 31,0451 |
| Whisper Small Hi - Sanchit Gandhi (sajjadathar/whisper-small-ur) | Common Voice 11.0 (hi) | validation | WER | 31,0451 (loss 0,5564) |

Evolución durante el entrenamiento (declarada por el autor):

| Paso | Época | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 250 | 1,6779 | 0,3327 | 0,4946 | 32,7849 |
| 500 | 3,3557 | 0,1315 | 0,5029 | 30,8557 |
| 750 | 5,0336 | 0,0735 | 0,5323 | 31,1398 |
| 1000 | 6,7114 | 0,0325 | 0,5564 | 31,0451 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241 M de parámetros × 4 bytes) más overhead de activaciones y audio.
- VRAM estimada en fp16: aproximadamente 0,5 GB para los pesos.
- Cabe en cualquier GPU consumer moderna: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de gama baja con al menos 2-4 GB de VRAM.
- También puede ejecutarse en CPU para transcripciones de baja frecuencia, con latencia mayor.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), y potencialmente conversión a otros formatos compatibles con Whisper (no documentada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idioma | WER (Common Voice 11.0 hi, test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sajjadathar/whisper-small-ur | 241,7 M | 30 s | hindi | 31,0451 (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 241,7 M | 30 s | multilingüe (99 idiomas) | no disponible en la información | Apache 2.0 | Hugging Face / OpenAI |
| openai/whisper-large-v3 | 1.550 M | 30 s | multilingüe | no disponible en la información | Apache 2.0 | Hugging Face / OpenAI |

La comparación directa con otros ajustes finos de Whisper para hindi no está disponible en la información proporcionada. El modelo base openai/whisper-small es la referencia natural, pero no se dispone de su WER específico en hindi dentro de esta ficha.

## Limitaciones y advertencias

- WER superior al 30 % en el conjunto de test: un tercio de las palabras se transcriben incorrectamente, lo que limita su uso en producción sin revisión humana.
- Sobreajuste evidente: la pérdida de entrenamiento cae drásticamente mientras la de validación empeora a partir del paso 500; el modelo final (paso 1000) no es el mejor punto de validación.
- Documentación insuficiente: la model card contiene secciones sin completar ("More information needed") sobre descripción, usos previstos, limitaciones y datos de entrenamiento.
- Posible confusión de idioma: el identificador del repositorio sugiere urdu ("ur") pero los metadatos declaran hindi ("hi"); conviene verificar el comportamiento real antes de usarlo.
- Solo soporta hindi: no se declaran capacidades multilingües, a pesar de que el modelo base es multilingüe.
- Riesgo de alucinación en ASR: los modelos Whisper pueden generar texto plausible no presente en el audio, especialmente en segmentos con ruido o silencios.
- Sesgos: no se documentan análisis de sesgos; el rendimiento puede variar según acento, género, edad y calidad del audio, y Common Voice tiene una distribución demográfica particular.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el rendimiento recae en el usuario.
- Sin verificación independiente: los resultados de benchmarks están marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sajjadathar/whisper-small-ur
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/mozilla-foundation/common_voice_11_0
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
