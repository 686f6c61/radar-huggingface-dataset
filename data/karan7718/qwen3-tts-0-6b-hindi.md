# karan7718/qwen3-tts-0.6b-hindi

## Resumen

Qwen3-TTS 0.6B Hindi es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base de Alibaba Qwen, especializado en síntesis de voz (text-to-speech) en hindi con una única voz femenina (`hi_f`). Ha sido entrenado por el usuario karan7718 sobre el subconjunto de hablante femenino de hindi del dataset ai4bharat/Rasa, y su objetivo es cubrir un hueco concreto: el modelo base no incluye el hindi en su lista de idiomas soportados, por lo que este fine-tune permite generar voz hindi natural a partir de un modelo compacto.

El modelo resuelve el problema de la disponibilidad de TTS de calidad en hindi con recursos ligeros: con menos de mil millones de parámetros y unos 4,3 GB de pesos, puede ejecutarse en una sola GPU de consumo. Es relevante para desarrolladores que necesiten voz sintética en hindi para asistentes, IVR o generación de contenido, sin depender de servicios de pago.

El modelo hereda la arquitectura Qwen3-TTS a 12 Hz y se ha entrenado mediante fine-tune completo en fp32 durante 2 épocas sobre 13.604 clips (24,81 horas). La licencia es Apache 2.0, aunque el dataset de entrenamiento es CC-BY-4.0 y exige atribución si se redistribuye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (tokenizador de audio a 12 Hz), transformer decoder para TTS |
| Parametros totales | 905.788.672 (dato real de safetensors; el nombre "0.6B" hace referencia al modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (cap de generación de audio: ~20 s, equivalente a 250 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp32 originales; uso recomendado en bfloat16) |
| Idiomas soportados | hindi (hi), voz única femenina `hi_f` |
| Licencia | Apache 2.0 (dataset de entrenamiento: CC-BY-4.0, requiere atribución) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) de Qwen3-TTS-12Hz-0.6B-Base, una arquitectura de síntesis de voz basada en transformer que trabaja con tokens de audio a 12 Hz. El fine-tune se realizó en fp32 durante 2 épocas con learning rate 2e-5, batch size 2 y acumulación de gradientes 2 (batch efectivo 4), con semilla 1234.

Los datos de entrenamiento proceden del split de hablante femenino de hindi del dataset ai4bharat/Rasa. El conjunto original de 14.532 clips (26,16 h) se depuró eliminando 307 clips de menos de 1 segundo, 129 clips de más de 20 segundos (por encima del límite de generación) y 492 clips cuya transcripción difería fuertemente de la salida de Whisper (CER > 0,5), lo que indica transcripciones erróneas o nombres propios problemáticos. El conjunto final de entrenamiento quedó en 13.604 clips (24,81 h), con 300 clips de test y 150 de validación retenidos. Cabe señalar que la verificación con Whisper solo se aplicó a parte de los datos: 7.488 clips conservados no fueron verificados con ASR.

## Capacidades

- Síntesis de texto a voz en hindi con una única voz femenina (`hi_f`).
- Generación de audio de hasta ~20 segundos por llamada (250 tokens nuevos).
- Detección automática de idioma mediante `language="auto"` (el hindi no está en la lista de idiomas del modelo base).
- Integración con la librería `qwen_tts` y ejecución en GPU con bfloat16.
- No soporta: otras voces, clonación de voz, textos de más de 20 segundos, ni otros idiomas.

## Casos de uso

- **Asistentes de voz en hindi**: generación de respuestas habladas para chatbots o agentes conversacionales dirigidos a usuarios de hindi, con latencia adecuada gracias al tamaño reducido del modelo.
- **Sistemas IVR y atención telefónica**: integración en centrales telefónicas para mensajes dinámicos en hindi sin depender de APIs de pago.
- **Generación de contenido audiovisual**: locución automática de vídeos educativos, tutoriales o redes sociales en hindi con una voz femenina consistente.
- **Audiolibros y podcasts de corta duración**: lectura de textos segmentados en fragmentos de menos de 20 segundos.
- **Accesibilidad**: lectura de interfaces y documentos en hindi para usuarios con dificultades visuales o de lectura.
- **Datasets y pipelines de investigación en voz**: generación de audio sintético en hindi para preentrenar o evaluar otros sistemas de ASR o TTS, respetando la atribución CC-BY-4.0.
- **Prototipado edge de TTS multilingüe**: base ligera para experimentar con Qwen3-TTS en idiomas no soportados por el modelo base, siguiendo la receta de fine-tune documentada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 300 clips de test retenidos del dataset Rasa (voz femenina), puntuados con Whisper large-v3 en hindi:

| Metrica | Valor |
|---|---|
| CER medio por clip | 0,127 |
| CER del corpus | 0,095 |
| WER | 0,297 |
| CER de grabaciones reales (mismo evaluador) | 0,114 |
| CER en conjunto de estrés en hindi (12 frases) | 0,206 |
| Clips que alcanzan el límite de 20 s | 2 de 300 |

Puntos débiles identificados: nombres propios (CER ~0,36, aunque Whisper también falla en ellos) y prompts estilo Alexa (~0,25). No se han evaluado: otros hablantes, clonación de voz, textos largos (más de 20 s) ni MOS humano. No hay comparaciones publicadas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, aproximadamente 2-3 GB para el modelo; en fp32, alrededor de 4 GB. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, T4, A100). El ejemplo oficial usa `device_map="cuda:0"`.
- Compatible con GPUs de consumo: sí, en cualquier GPU con soporte de bfloat16 y suficiente VRAM.
- Despliegue: mediante la librería `qwen_tts` (Python). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karan7718/qwen3-tts-0.6b-hindi | ~906 M | Hindi (único) | Femenina única (`hi_f`) | Apache 2.0 | Hugging Face, pesos abiertos |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | ~0,6 B (nominal) | Multilingüe (sin hindi) | Múltiples | Según Qwen | Hugging Face, pesos abiertos |
| ai4bharat/Rasa (TTS asociado) | no disponible | Indios, incluido hindi | Múltiples | CC-BY-4.0 (datos) | Dataset público |

No se han publicado benchmarks comparativos directos con otros modelos TTS en hindi (por ejemplo, IndicTTS o MMS-TTS de Meta), por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Voz única femenina: no permite seleccionar otros hablantes ni clonar voces.
- El hindi no está en la lista de idiomas del modelo base; es obligatorio usar `language="auto"`.
- Límite de generación de ~20 segundos por llamada (250 tokens); solo 2 de 300 clips de test lo alcanzaron, pero textos largos requieren segmentación.
- Rendimiento degradado en nombres propios (CER ~0,36) y en prompts estilo Alexa (~0,25).
- Parte del corpus de entrenamiento (7.488 clips) no fue verificado con ASR, por lo que podría contener transcripciones erróneas.
- El WER de 0,297 es alto en términos absolutos, aunque en parte refleja los errores del propio Whisper como evaluador.
- No evaluado con MOS humano; la calidad perceptual subjetiva no está documentada.
- Licencia Apache 2.0 para el modelo, pero el dataset de entrenamiento es CC-BY-4.0: hay que acreditar a los autores de ai4bharat/Rasa si se usa o redistribuye el modelo.
- Modelo comunitario con muy poca tracción (35 descargas, 1 like): usar con cautela en producción y validar la calidad en el dominio propio.
- Riesgo habitual de alucinación en TTS: posible pronunciación incorrecta o inventada en palabras fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karan7718/qwen3-tts-0.6b-hindi
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4bharat/Rasa
