# sahilfarib/aimscribe-whisper-small-bn

## Resumen

`sahilfarib/aimscribe-whisper-small-bn` es un ajuste fino completo (*full fine-tune*) de `openai/whisper-small` para reconocimiento automático de voz (ASR) en bengalí (`bn`). Lo publica el usuario sahilfarib como parte de una entrega de evaluación (AIMScribe, Task 2) y está pensado como línea base de investigación sobre entrenamiento con pocos datos, no como modelo de producción.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper (241.734.912 parámetros según los safetensors del repositorio) y se entrena sobre un subconjunto de 80 minutos de OpenSLR 53 (habla bengalí leída), con hablantes disjuntos entre train y dev. La receta es deliberadamente mínima: learning rate 1e-5, batch 8 x 2, 800 pasos, fp16 y semilla 42, seleccionando el mejor checkpoint por WER de desarrollo (paso 600, con 6 hablantes reservados).

Su relevancia es doble. Por un lado, documenta una mejora muy grande frente al modelo base en cero disparos sobre el test de OpenSLR 53 (WER 66,4 frente a 144,1; CER 21,4 frente a 135,7) con muy pocos datos y cómputo. Por otro, esos mismos números dejan claro el margen existente: un WER del 66 % sigue siendo insuficiente para uso comercial real, por lo que la ficha debe leerse como referencia metodológica y punto de partida para futuros ajustes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con encoder convolucional + positional embeddings sinusoidales y decoder autorregresivo con cross-attention |
| Parámetros totales | 241.734.912 (según safetensors del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (1500 frames de mel-espectrograma); contexto de texto del decoder de 448 tokens; el audio largo se procesa por segmentación deslizante |
| Tipos de cuantización | No se documentan ni se publican versiones cuantizadas. Al ser una arquitectura Whisper estándar, admite cuantización con herramientas externas (CTranslate2 int8/int8_float16, whisper.cpp GGML/GGUF), pero el autor no aporta evaluaciones de las mismas |
| Idiomas soportados | Bengalí (`bn`) como idioma de ajuste y evaluación. El modelo base es multilingüe, pero no se documenta el comportamiento del fine-tune en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Modelo base | `openai/whisper-small` |
| Modalidad | Audio a texto (ASR), sin capacidades de visión ni audio-vision |
| Dataset de entrenamiento | Subconjunto de 80 minutos de OpenSLR 53 (bengalí leído), con separación de hablantes entre splits |
| Hiperparámetros | lr 1e-5, batch 8 x 2, 800 pasos, fp16, seed 42; checkpoint seleccionado = paso 600 por WER de dev (6 hablantes) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small sin modificaciones estructurales: un encoder que consume log-Mel spectrograms de 80 canales en ventanas de 30 segundos y un decoder transformer que genera tokens de texto con cross-attention sobre la salida del encoder, incluyendo tokens especiales de idioma, tarea (transcribe/translate) y marcas de tiempo. El ajuste es completo (todos los pesos), no LoRA ni adaptadores, y se ejecuta en fp16.

El entrenamiento usa un subconjunto de 80 minutos de OpenSLR 53, un corpus de habla bengalí leída. La partición es *speaker-disjoint*: los hablantes de evaluación no aparecen en entrenamiento, y el checkpoint final se elige con 6 hablantes reservados. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación posterior; tampoco se detalla la composición exacta del dataset más allá del corpus de origen ni si hubo aumentación de datos o normalización de texto específica. No se menciona ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Transcripción de voz a texto en bengalí sobre audio de hasta 30 segundos por segmento, con segmentación para audios más largos.
- Reconocimiento de habla leída (*read speech*) procedente de corpus como OpenSLR 53, que es el dominio sobre el que se entrenó y evaluó.
- Salida de transcripción con métricas de calidad publicadas en WER y CER sobre el conjunto de test.
- Traducción de voz a texto: no evaluada en este fine-tune; el token de tarea de traducción existe en la arquitectura base, pero no hay evidencia de su comportamiento tras el ajuste.
- Timestamps a nivel de palabra o segmento: la arquitectura base los soporta, pero el autor no publica evaluación de alineación temporal.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje con plantilla de herramientas).
- Capacidades de agente o razonamiento multi-paso: no aplicables.
- Capacidades multilingües: limitadas al bengalí según la model card; sin datos para otros idiomas.
- Modo *thinking*, visión o audio comprensivo: no disponibles.

## Casos de uso

- Investigación sobre entrenamiento con pocos datos en ASR: sirve como referencia reproducible (receta, semilla e hiperparámetros publicados) para comparar estrategias de ajuste de Whisper en idiomas de bajos recursos.
- Pre-anotación de corpus bengalíes: generar transcripciones automáticas de partida para que anotadores humanos las corrijan, aceptando que con un WER del 66 % la corrección manual seguirá siendo sustancial.
- Construcción de líneas base en evaluaciones académicas: punto de comparación cuantificado (WER 66,4 / CER 21,4) frente a modelos zero-shot o ajustes posteriores sobre OpenSLR 53.
- Prototipado de interfaces de voz en bengalí: validar un pipeline completo (captura, segmentación a 30 s, inferencia, post-proceso) antes de invertir en un modelo de mayor tamaño o en más datos.
- Transcipción de audiolibros, noticias leídas o material didáctico: es el dominio más cercano al entrenamiento (habla leída), donde el modelo debería comportarse mejor que en conversación espontánea, aunque sin garantías fuera del corpus evaluado.
- Punto de partida para nuevos fine-tunes: los pesos ajustados pueden servir de inicialización para un segundo ajuste con más horas de audio o con datos de un dominio concreto.
- Docencia y reproducción de experimentos: el bajo coste de cómputo (800 pasos sobre un modelo de 241 M de parámetros) permite reproducir el experimento en hardware de consumo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test de OpenSLR 53 con 15 hablantes no vistos:

| Modelo | WER | CER |
|---|---|---|
| whisper-small zero-shot | 144,1 | 135,7 |
| Este modelo (paso 600) | 66,4 | 21,4 |

No se han publicado resultados de benchmarks adicionales (MLU, HumanEval, GSM8K ni otros) en la información disponible. Tampoco se publican métricas desagregadas por hablante, por duración del audio o por tasa de palabras vacías, ni resultados de la comparación en otros corpus bengalíes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 y 0,5 GB en fp16 solo para los pesos; con activaciones, buffers de mel-espectrograma y decodificación por haces, el consumo realista se sitúa en torno a 2-3 GB en fp16 (estimación, no medida publicada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 funcionan sin problema. Para este tamaño no se necesita hardware de centro de datos.
- Cabe en GPU de consumo: sí, en toda la gama actual (GTX 1650 4 GB en adelante) e incluso en iGPU con suficiente memoria compartida.
- CPU: viable. Con whisper.cpp o CTranslate2 en int8, un modelo de 241 M de parámetros puede transcribir en tiempos cercanos al tiempo real o algunas veces el tiempo real en CPU moderna, sin cifras oficiales publicadas.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), CTranslate2/faster-whisper, whisper.cpp, WhisperX para alineación temporal, y servidores tipo vLLM (con soporte de audio) o TGI si la versión lo permite.
- Latencia y throughput: no disponibles. El autor no publica mediciones de RTF, latencia por segmento ni throughput. Como referencia arquitectónica, el coste dominante es proporcional a la duración del audio dividida en ventanas de 30 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (whisper-small-bn) | 241,7 M | 30 s | Bengalí (ajuste) | Apache 2.0 | HuggingFace, 0 descargas |
| openai/whisper-small | 244 M aprox. | 30 s | 99 idiomas (multilingüe) | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | 74 M aprox. | 30 s | 99 idiomas (multilingüe) | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769 M aprox. | 30 s | 99 idiomas (multilingüe) | Apache 2.0 | HuggingFace |
| openai/whisper-large-v3 | 1550 M aprox. | 30 s | 99 idiomas (multilingüe) | Apache 2.0 | HuggingFace |

En la comparación cualitativa, este fine-tune mejora de forma muy clara a su modelo base en el dominio específico (WER 66,4 frente a 144,1), pero un `whisper-large-v3` sin ajustar probablemente obtendría un WER menor en bengalí a costa de unas seis veces más parámetros y bastante más VRAM; no se dispone de esa comparación en la información proporcionada, por lo que no se aportan cifras. No se han identificado en la información disponible otros fine-tunes públicos de Whisper-small para bengalí con métricas comparables.

## Limitaciones y advertencias

- Calidad insuficiente para producción: un WER del 66,4 % implica que aproximadamente dos de cada tres palabras se transcriben mal en el conjunto de test; es una línea base de investigación, y el propio autor lo indica explícitamente.
- Entrenamiento con muy pocos datos: 80 minutos de audio y 800 pasos sobre un corpus de habla leída. Es previsible un sobreajuste al dominio y una degradación fuerte con acentos distintos, habla espontánea, ruido ambiental, solapamiento de hablantes o audio telefónico; no se han publicado evaluaciones en esas condiciones.
- Sesgo de dominio y de hablantes: solo 15 hablantes en test y 6 en dev; la variabilidad de acentos y registros del bengalí está escasamente cubierta.
- Riesgo de alucinación: los modelos Whisper pueden generar texto inventado en tramos de silencio, ruido o música. No se documenta ningún mecanismo de mitigación (filtros de no-speech, umbrales de log-probabilidad) en este fine-tune.
- Normalización de texto: no se especifica si las referencias y salidas usan normalización de grafía bengalí, lo que afecta directamente a la comparabilidad del WER/CER reportado.
- Idiomas: la model card declara únicamente `bn`; se desconoce el comportamiento en otros idiomas y no debería asumirse que conserva el multilingüismo del modelo base.
- Timestamps y puntuación: no evaluados; la puntuación, las mayúsculas y la segmentación pueden no ser fiables.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero debe conservarse el aviso de licencia y atribución; además, el uso comercial con esta calidad de transcripción no es recomendable sin un ajuste adicional y validación propia.
- Madurez del artefacto: 0 descargas y 0 likes, sin documentación de mantenimiento, sin tests ni código de inferencia propio en el repositorio; la reproducibilidad depende de la receta descrita y del corpus OpenSLR 53.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilfarib/aimscribe-whisper-small-bn
- Modelo base: https://huggingface.co/openai/whisper-small
- Corpus OpenSLR 53 (bengalí): https://www.openslr.org/53/
- Repositorio oficial de Whisper (código y utilidades): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- No se han encontrado enlaces adicionales relevantes al modelo en la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con ASR en bengalí.
