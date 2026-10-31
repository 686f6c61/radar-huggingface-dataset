# mddalwai/whisper-small-edacc-ct2

## Resumen

Whisper-small-edacc-ct2 es una versión convertida a CTranslate2 (pesos int8) del modelo mddalwai/whisper-small-edacc, un Whisper-small afinado (fine-tuned) para el reconocimiento de voz en inglés conversacional con acentos diversos. Su propósito es permitir inferencia rápida en CPU mediante la librería faster-whisper, resolviendo el problema de la alta latencia y el coste de GPU cuando se transcriben conversaciones de hablantes no nativos o con acentos marcados, un caso donde el Whisper original tiende a degradar más que en inglés estándar.

El modelo base es un Whisper-small (arquitectura encoder-decoder transformer de OpenAI), y esta variante mantiene los mismos pesos tras la conversión, con una degradación de WER mínima (+0,06 puntos en una verificación sobre 500 clips de validación). Es relevante para despliegues ligeros de transcripción en entornos sin GPU, como servidores pequeños, contenedores o servicios de bajo coste.

La licencia es CC BY-SA 4.0, heredada del dataset EdAcc empleado en el entrenamiento, lo que impone obligaciones de atribución y compartición igual en usos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible (tamaño del repo: 0,2 GB en int8) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | hasta 30 s de audio por ventana |
| Tipos de cuantizacion | int8 (CTranslate2); existió una conversión float32 no publicada |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | CTranslate2 (compatible con faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper-small de OpenAI, un transformer encoder-decoder para reconocimiento automatico del habla, afinado sobre el dataset EdAcc (English with Accents, licenciado bajo CC BY-SA), que recopila inglés conversacional con una amplia variedad de acentos. Los detalles concretos del entrenamiento (numero de pasos, hiperparametros, particiones) se remiten a la model card del modelo base y al repositorio de codigo del autor.

Esta ficha corresponde a la conversión a CTranslate2 con pesos int8, orientada a inferencia rápida en CPU. La conversión se validó sobre 500 clips de validación aleatorios: WER de 22,47 % frente a 22,42 % del modelo original (float16 en GPU), con 375 de 500 transcripciones identicas. Una conversión float32 (no publicada) obtuvo 22,33 % en los mismos clips, lo que confirma que el pipeline de serving reproduce fielmente el modelo original y que la diferencia restante se debe al redondeo int8. El autor advierte de que la salida int8 puede variar ligeramente entre tipos de CPU; la verificación se realizó en un AMD EPYC 7B12.

Un detalle técnico importante: el modelo fue entrenado con características log-mel de audio rellenado con silencio hasta 30 s, mientras que faster-whisper rellena sus características con ceros. El codigo de ejemplo del autor incluye un rellenado explicito del audio a 480000 muestras (30 s a 16 kHz) para evitar distribuciones de entrada no vistas en el entrenamiento en clips cortos.

## Capacidades

- Transcripcion de voz a texto en inglés conversacional, con especial foco en acentos variados y hablantes no nativos (dataset EdAcc).
- Inferencia eficiente en CPU gracias a la conversión CTranslate2 int8 con faster-whisper.
- Ventanas de hasta 30 s de audio por pasada, con rellenado recomendado a 30 s para clips cortos.
- Configuración de decodificacion recomendada por el autor: beam_size=1, temperature=0.0, sin marcas de tiempo y condition_on_previous_text=False.
- No soporta otros idiomas ni capacidades multimodales más allá del audio en inglés; no hay tool calling ni modo de agente (no es un LLM de instrucciones).

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en inglés con acentos internacionales: el afinado sobre EdAcc mejora la robustez frente a hablantes no nativos, y la inferencia en CPU permite desplegarlo junto a sistemas de telefonia sin coste de GPU.
- Subtitulado de contenido conversacional (podcasts, entrevistas) en inglés: la ventana de 30 s y la decodificacion sin marcas de tiempo se ajustan a pipelines de subtitulado por segmentos.
- Procesamiento por lotes en servidores modestos: con pesos int8 y 0,2 GB de tamaño, cabe en instancias pequeñas y procesa volumenes de audio sin infraestructura de GPU.
- Investigación en ASR robusto a acentos: al ser una conversión fiel del modelo afinado, sirve como baseline reproducible para experimentos con faster-whisper.
- Integracion en aplicaciones backend en Python: el ejemplo oficial con faster-whisper permite incrustarlo en servicios de transcripcion con unas pocas lineas de codigo.
- Analisis de corpus de habla con acentos diversos (linguistica, evaluacion de accesibilidad): la licencia CC BY-SA 4.0 permite uso y redistribucion con atribución y licencia derivada equivalente.

## Benchmarks y rendimiento

Datos publicados en la model card (verificación de conversión sobre 500 clips de validación aleatorios):

| Modelo / conversion | WER |
|---|---|
| whisper-small-edacc-ct2 (int8, CPU AMD EPYC 7B12) | 22,47 % |
| whisper-small-edacc original (float16, GPU) | 22,42 % |
| Conversión float32 (no publicada) | 22,33 % |

No se han publicado resultados de benchmarks estandar (WER por acento sobre EdAcc, comparaciones con Whisper-small base, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: al ser int8 en CPU con un repo de 0,2 GB, el consumo de RAM estimado es del orden de pocos cientos de MB; no se publica una cifra exacta.
- GPU: no necesaria; el modelo esta pensado para inferencia en CPU. La validación se realizo en un AMD EPYC 7B12.
- Consumer hardware: cabe sin problemas en portatiles y servidores pequeños por su tamaño reducido y formato int8.
- Despliegue: faster-whisper (via `WhisperModel`), con formato CTranslate2. No se mencionan compatibilidades con vLLM, Ollama o TGI.
- Latencia y throughput: no se han publicado mediciones; la motivación declarada de la conversión es inferencia rápida en CPU.

## Comparativa con modelos similares

| Modelo | Formato / cuantizacion | Foco | Licencia | Notas |
|---|---|---|---|---|
| whisper-small-edacc-ct2 | CTranslate2 int8 | Ingles conversacional con acentos (EdAcc) | CC BY-SA 4.0 | WER 22,47 % en clips de validación de EdAcc |
| mddalwai/whisper-small-edacc | Pesos originales (float16/float32) | Mismo afinado, ejecución en GPU | CC BY-SA 4.0 | WER 22,42 %; referencia de la conversión |
| openai/whisper-small | PyTorch safetensors | Ingles multilingue generalista | MIT | Sin afinado especifico en acentos; WER comparativo no disponible |

## Limitaciones y advertencias

- Restricción de idioma: solo inglés; no transcribe otros idiomas.
- La salida int8 puede diferir ligeramente entre tipos de CPU; conviene validar en el hardware de destino.
- Es imprescindible rellenar el audio a 30 s con silencio (480000 muestras a 16 kHz) antes de la transcripcion; sin ello, los clips cortos reciben entradas no vistas en el entrenamiento y el WER puede empeorar.
- Licencia CC BY-SA 4.0: obliga a atribución y a licenciar las obras derivadas con la misma licencia (share-alike), lo que puede ser restrictivo para productos comerciales cerrados.
- WER de ~22,5 % en el conjunto de validación: la calidad es limitada para casos de uso que exijan transcripciones de alta fidelidad sin revision humana.
- Riesgo de alucinaciones tipico de la familia Whisper en silencios largos o audio degradado; la configuración recomendada (temperature=0.0, condition_on_previous_text=False) mitiga parcialmente este efecto.
- Detalles completos de entrenamiento y limitaciones adicionales se documentan en la model card del modelo base, no en esta.

## Enlaces

- Modelo CT2: https://huggingface.co/mddalwai/whisper-small-edacc-ct2
- Modelo base afinado: https://huggingface.co/mddalwai/whisper-small-edacc
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- Codigo de entrenamiento y conversion del autor: https://github.com/mohammaddalwai/speech-ft
