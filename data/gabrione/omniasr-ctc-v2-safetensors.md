# gabrione/omniasr-ctc-v2-safetensors

## Resumen

Omnilingual ASR CTC v2 es una familia de modelos de reconocimiento automatico del habla (ASR) desarrollada por Meta FAIR dentro del proyecto Omnilingual ASR, publicada en diciembre de 2025. Estos checkpoints emplean una arquitectura CTC (Connectionist Temporal Classification) y estan disenados para transcripcion multilingue, con un tokenizer de 10.288 tokens que amplia el vocabulario respecto a la version v1 (9.812 tokens). La version v2 mejora la tasa de error de caracteres (CER) frente a v1.

El repositorio `gabrione/omniasr-ctc-v2-safetensors` no contiene el modelo original de Meta, sino una conversion comunitaria de los checkpoints oficiales `.pt` a formato safetensors, pensada para una implementacion en PyTorch puro dentro del proyecto mynah-s2s (sin fairseq2 ni ONNX). Se distribuyen tres tamanos —300M, 1B y 3B parametros— tanto en bf16 como en int4 con cuantizacion weight-only por grupo de 128, ademas de la tabla de tokens del tokenizer v2.

La relevancia de esta ficha radica en que facilita el uso de los checkpoints Omnilingual ASR CTC v2 fuera del ecosistema original de Meta, con pesos en safetensors compatibles con librerias estandar de PyTorch y variantes cuantizadas que reducen los requisitos de memoria. El repo ocupa 11,2 GB y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification), implementacion PyTorch pura en mynah-s2s |
| Parametros totales | 300M, 1B y 3B (tres checkpoints independientes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 e int4 weight-only (grupo 128); scripts tambien permiten int8 de capas lineales |
| Idiomas soportados | multilingue (proyecto Omnilingual ASR); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 e int4); tokenizer en `omni_v2_tokens.txt` |

## Arquitectura y entrenamiento

Los checkpoints siguen la arquitectura CTC de Omnilingual ASR de Meta FAIR: un codificador acustico seguido de una cabeza CTC que predice directamente la secuencia de tokens a partir de las representaciones de audio, sin decodificador autorregresivo. La version v2 introduce un tokenizer de 10.288 tokens (frente a 9.812 en v1) y reporta mejor CER que la version anterior. En esta conversion, las convoluciones y capas de normalizacion permanecen en bf16 incluso en las variantes int4; solo las capas lineales se cuantizan.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO (no aplicable a un modelo CTC). La conversion a safetensors se realiza mediante `scripts/prepare_omni_safetensors.py` y la cuantizacion mediante `scripts/quantize_omni_safetensors.py`; los metadatos de safetensors incluyen la configuracion del modelo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante decodificacion CTC.
- Cobertura multilingue heredada del proyecto Omnilingual ASR (lista exacta de idiomas no disponible).
- Tres tamanos de modelo (300M, 1B, 3B) para ajustar el equilibrio entre precision y coste computacional.
- Variantes cuantizadas int4 para despliegue con menor huella de memoria.
- Tokenizer v2 con 10.288 tokens, que debe coincidir con la tabla `omni_v2_tokens.txt`.
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla de la transcripcion ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz: los checkpoints de 1B y 3B pueden transcribir audio grabado en entornos de productividad, con la variante int4 para ejecucion en hardware modesto.
- Subtitulado automatico de contenido audiovisual: el modelo CTC genera transcripciones alineadas temporalmente de forma eficiente, adecuado para pipelines de postproduccion.
- Procesamiento por lotes de archivos de audio en servidores: la variante bf16 del 3B ofrece la mejor precision medida (WER de 0,040 en suahili, 0,067 en shona y 0,496 en luganda sobre las muestras Waxal) para tareas donde la calidad prima.
- Investigacion en ASR multilingue de bajos recursos: el modelo sirve como linea base para comparar tecnicas de adaptacion en idiomas africanos como suahili, shona y luganda.
- Despliegue en dispositivos con VRAM limitada: las variantes int4 de 300M y 1B permiten inferencia en GPUs de consumo, a costa de mayor WER (por ejemplo, 0,682 en luganda con 1B int4).
- Integracion en aplicaciones de accesibilidad: transcripcion en tiempo casi real de voz a texto para personas con discapacidad auditiva, usando el checkpoint de 300M cuando la latencia es critica.
- Evaluacion y conversion de formatos: el repo incluye scripts para reproducir la conversion desde los `.pt` oficiales y la cuantizacion, util para equipos que quieran auditar o adaptar los pesos.

## Benchmarks y rendimiento

Resultados de WER sobre nueve clips reales de Waxal (tres por idioma), medidos en mynah-s2s:

| Modelo | Suahili | Shona | Luganda |
|---|---|---|---|
| 1B v2 int4 | 0,173 | 0,114 | 0,682 |
| 3B v2 int4 | 0,052 | 0,104 | 0,548 |
| 3B v2 bf16 | 0,040 | 0,067 | 0,496 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks ASR estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada: el checkpoint de 3B en bf16 requiere aproximadamente 6 GB solo para pesos, mas activaciones y buffers de audio; la variante int4 reduce los pesos a cerca de 1,5-2 GB. El 1B en bf16 ronda los 2 GB y en int4 menos de 1 GB; el 300M es inferior a 1 GB en bf16.
- GPU recomendadas: A100 o H100 para procesamiento por lotes de alta throughput con el 3B bf16; RTX 4090 o similar para el 3B int4 o el 1B bf16.
- GPU de consumo: el 300M y el 1B int4 caben en GPUs consumer con 8 GB o menos; el 3B int4 es viable en tarjetas de 8-12 GB.
- Opciones de despliegue: implementacion PyTorch pura de mynah-s2s (referencia del repo); al ser safetensors, los pesos pueden cargarse con PyTorch estandar. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omnilingual ASR CTC v2 (este repo) | 300M / 1B / 3B | no disponible | CTC multilingue | Apache-2.0 | safetensors en HF |
| Omnilingual ASR CTC v1 (`facebook/omniASR-CTC-300M` / `-1B`) | 300M / 1B | no disponible | CTC multilingue, tokenizer de 9.812 tokens | Apache-2.0 | checkpoints `.pt` en HF |
| Whisper (OpenAI) | 39M-1,55B | 30 s de audio por ventana | encoder-decoder autorregresivo | MIT | amplia, multiples formatos |

La comparativa con Whisper es orientativa: Whisper cubre un conjunto de idiomas distinto y usa decodificacion autorregresiva, mientras que este modelo es CTC y esta orientado al proyecto Omnilingual. No se dispone de datos de rendimiento comparativo directo en la informacion proporcionada.

## Limitaciones y advertencias

- El WER en luganda es alto incluso en el mejor caso (0,496 con 3B bf16), lo que limita su uso en produccion para ese idioma sin ajuste fino o postprocesado.
- La cuantizacion int4 degrada notablemente la precision en algunos idiomas (WER de 0,682 en luganda con 1B int4 frente a valores mucho menores en bf16).
- La tabla de tokens del tokenizer v2 debe coincidir exactamente con los pesos; usar el tokenizer v1 (9.812 tokens) con estos checkpoints produce resultados incorrectos.
- No se documentan sesgos especificos, pero al ser un modelo multilingue entrenado sobre datos de habla real, es esperable variacion de rendimiento por acento, dominio y calidad de audio.
- Riesgo de alucinacion presente como en todo modelo ASR, especialmente en segmentos con ruido o habla solapada.
- La lista de idiomas soportados no esta disponible en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos de los checkpoints originales de Meta y atribuir correctamente a Meta FAIR.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es una conversion comunitaria sin validacion externa documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gabrione/omniasr-ctc-v2-safetensors
- Checkpoints originales v2: https://dl.fbaipublicfiles.com/mms/omniASR-CTC-300M-v2.pt, https://dl.fbaipublicfiles.com/mms/omniASR-CTC-1B-v2.pt, https://dl.fbaipublicfiles.com/mms/omniASR-CTC-3B-v2.pt
- Tokenizer original: `omniASR_tokenizer_written_v2.model` (referenciado en la model card)
- Repositorio de Meta FAIR: https://github.com/facebookresearch/omnilingual-asr
- Implementacion mynah-s2s: https://github.com/mynah-org/mynah-s2s
- Checkpoints v1 en Hugging Face: https://huggingface.co/facebook/omniASR-CTC-300M y https://huggingface.co/facebook/omniASR-CTC-1B
