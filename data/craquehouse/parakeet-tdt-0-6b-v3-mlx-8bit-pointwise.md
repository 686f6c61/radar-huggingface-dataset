# craquehouse/parakeet-tdt-0.6b-v3-mlx-8bit-pointwise

## Resumen

Este modelo es una cuantización MLX de 8 bits del sistema de reconocimiento de voz automático (ASR) NVIDIA Parakeet TDT 0.6B v3, adaptado para ejecutarse en Apple Silicon. La variante `pointwise` cuantiza además las convoluciones kernel-1 del conformer, lo que reduce el tamaño del checkpoint y el pico de memoria sin una pérdida significativa de precisión (WER 3,77 % frente a 3,79 % de la versión sin cuantizar). El modelo base soporta 25 idiomas europeos y proporciona puntuación, capitalización y formato de números de forma nativa, sin necesidad de modelos auxiliares.

Esta ficha describe el checkpoint específico `craquehouse/parakeet-tdt-0.6b-v3-mlx-8bit-pointwise`, que requiere un shim adicional para funcionar con `mlx-audio`. Es una opción interesante para desarrolladores que buscan un ASR ligero y rápido en hardware de Apple, con un equilibrio entre tamaño y calidad de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer + Transducer (TDT) |
| Parametros totales | 0,6 B (modelo original) / 181 621 746 (checkpoint cuantizado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo ASR, procesa audio por tramas) |
| Tipos de cuantizacion | 8 bits MLX, group-size 64, convoluciones pointwise cuantizadas como capas `Linear` |
| Idiomas soportados | 25 idiomas europeos (deteccion automatica de idioma) |
| Licencia | No disponible en la card; hereda la del modelo base (`mlx-community/parakeet-tdt-0.6b-v3`) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Parakeet TDT 0.6B v3, es un sistema ASR basado en una arquitectura Conformer con decodificador Transducer (TDT). El Conformer combina capas de atención y convoluciones para modelar dependencias locales y globales en la señal de audio. El entrenamiento se realizó con datos multilingües (25 idiomas europeos) y el modelo incluye módulos de puntuación, capitalización y formato de números integrados, lo que elimina la necesidad de postprocesado externo.

La cuantización MLX se realizó con `model-lab` de craquehouse. Todos los pesos no cuantizados se mantienen en float16. La particularidad de esta variante es que las convoluciones kernel-1 del conformer (que son matemáticamente multiplicaciones de matrices) se cuantizan como capas `Linear`, reduciendo 151 MB de pesos densos fp16. Las convoluciones depthwise y de submuestreo se dejan en float, ya que `nn.Conv1d` de mlx-audio no soporta pesos cuantizados. Esto implica que el checkpoint no funciona con `mlx-audio` estándar y requiere un shim que construye esas capas como `nn.Linear`.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática de idioma.
- Puntuación, capitalización y formato de números (ITN) integrados en el modelo, sin postprocesado externo.
- Alta velocidad de inferencia gracias a la cuantización MLX y la optimización para Apple Silicon.
- Compatible con el ecosistema MLX (mlx-audio) mediante el shim `mlx-audio-pointwise`.
- No requiere modelos de lenguaje ni de puntuación adicionales.

## Casos de uso

- Dictado por voz en macOS: integración en aplicaciones de escritorio para transcribir dictados en tiempo real, aprovechando el bajo consumo de memoria (pico de 1,05 GB) y la compatibilidad nativa con Apple Silicon.
- Subtitulado automático de vídeo: transcripción de pistas de audio en múltiples idiomas europeos para generar subtítulos con puntuación correcta, sin necesidad de herramientas externas.
- Transcripción de reuniones y llamadas: procesamiento de grabaciones de conferencias con detección automática de idioma, útil en entornos multilingües.
- Asistentes de voz en dispositivos locales: despliegue en Mac mini o MacBook para comandos de voz y búsqueda por voz sin conexión a la nube.
- Accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva, con baja latencia gracias a la cuantización.
- Análisis de audio en investigación: extracción de transcripciones de corpus multilingües para NLP, con un WER competitivo (3,77 % en LibriSpeech test-other).

## Benchmarks y rendimiento

La model card del autor incluye mediciones propias sobre LibriSpeech test-other (2939 utterances). El WER se calculó como errores totales entre palabras de referencia totales, comparando cada build contra el mismo audio.

| Build | Tamaño | Pico de memoria | WER (test-other) |
|---|---|---|---|
| 6bit | 608 MB | 1,05 GB | 3,79 % |
| 6bit+pointwise | 519 MB | 0,9 GB | 3,82 % |
| 8bit | 744 MB | 1,19 GB | 3,79 % |
| 8bit+pointwise (este modelo) | 674 MB | 1,05 GB | 3,77 % |

Los intervalos de confianza bootstrap (95 %) se calcularon sobre utterances, pero no se detallan en la card. El pico de memoria escala con la duración del audio, por lo que los valores son comparables solo dentro del mismo conjunto de prueba.

## Requisitos de hardware

- Mac con Apple Silicon (M1 o posterior) y al menos 8 GB de RAM unificada.
- Pico de memoria medido: 1,05 GB durante inferencia en el conjunto de prueba.
- Tamaño del checkpoint: 674 MB (descarga).
- Requiere instalar el shim `mlx-audio-pointwise` y activar la variable de entorno `MLX_AUDIO_POINTWISE=1` o llamar a `mlx_audio_pointwise.apply()`.
- Opciones de despliegue: mlx-audio (con shim), scripts de inferencia personalizados con MLX.
- No se dispone de datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos ASR en la información proporcionada. El modelo base Parakeet TDT 0.6B v3 se presenta en el paper como más eficiente que Canary-1B-v2, pero no se incluyen números concretos en esta ficha. Las alternativas más cercanas son:

- `craquehouse/parakeet-tdt-0.6b-v3-mlx-8bit` (sin cuantización pointwise): 744 MB, pico 1,19 GB, WER 3,79 %. Más grande y con mayor consumo de memoria, pero funciona sin shim.
- `craquehouse/parakeet-tdt-0.6b-v3-mlx-6bit` y `6bit+pointwise`: versiones más pequeñas (608 MB y 519 MB) con WER ligeramente superior (3,79 % y 3,82 %).
- Whisper large-v3: modelo ASR de OpenAI, pero no se dispone de comparativa directa con Parakeet en esta información.

## Limitaciones y advertencias

- Este checkpoint no funciona con `mlx-audio` estándar; es imprescindible instalar el shim `mlx-audio-pointwise` y configurar la variable de entorno. Sin él, la inferencia falla con un error de tipo `ValueError: [conv] Invalid weight array with 2 dimensions for 1D convolution`.
- La licencia no está especificada en la card; el autor indica que hereda la del modelo base, por lo que es necesario revisar la licencia de `mlx-community/parakeet-tdt-0.6b-v3` antes de redistribuir o usar comercialmente.
- Solo cubre 25 idiomas europeos; no soporta idiomas fuera de ese conjunto.
- Riesgo de alucinación o errores en audio con mucho ruido, acentos no representados o habla superpuesta, como cualquier sistema ASR.
- La cuantización pointwise puede introducir pequeñas diferencias numéricas respecto al modelo original, aunque el WER medido es prácticamente idéntico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craquehouse/parakeet-tdt-0.6b-v3-mlx-8bit-pointwise
- Modelo base (mlx-community): https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paper de Canary-1B-v2 y Parakeet-TDT-0.6B-v3: https://arxiv.org/html/2509.14128v1
- Repositorio model-lab: https://git.craquehouse.cc/craquehouse/model-lab
- Shim mlx-audio-pointwise: https://git.craquehouse.cc/craquehouse/mlx-audio-pointwise.git
