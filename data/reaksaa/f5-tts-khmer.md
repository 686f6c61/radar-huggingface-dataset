# REaksaa/F5-TTS-Khmer

## Resumen

F5-TTS-Khmer es un modelo de sintesis de voz (text-to-speech) obtenido mediante ajuste fino del backbone F5-TTS sobre un corpus de voz nativa en jemer. Lo publica el usuario REaksaa en Hugging Face y esta pensado para generar audio de alta fidelidad a partir de texto en escritura jemer (Unicode), cubriendo un idioma con escasisima representacion en los sistemas TTS multilingues habituales.

El modelo se apoya en la arquitectura F5-TTS, basada en Conditional Flow Matching (CFM) con un Diffusion Transformer (DiT) y un vocoder Vocos de 100 bandas Mel, con una frecuencia de muestreo de 24 kHz. Cuenta con aproximadamente 345 millones de parametros y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integracion en pipelines propios.

Su relevancia actual radica en dos factores: por un lado, incorpora un motor G2P (grafema a fonema) completo para jemer que mapea texto Unicode a secuencias IPA compatibles con el vocabulario de F5-TTS; por otro, el ajuste se ha realizado sobre un dataset de estudio de 5.629 clips (5,29 horas) a 24 kHz, lo que aporta una calidad de audio superior a la de muchos modelos comunitarios entrenados con datos ruidosos. El repositorio ocupa 10,8 GB e incluye los checkpoints ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS Base CFM (Conditional Flow Matching) con Diffusion Transformer (DiT) |
| Parametros totales | ~345M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 10,8 GB; checkpoints de F5-TTS) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura F5-TTS, un sistema de sintesis de voz no autorregresivo basado en Conditional Flow Matching con un Diffusion Transformer como backbone generativo. La salida acustica se representa en 100 bandas Mel a 24 kHz y se sintetiza mediante el vocoder Vocos. El frontend incluye un motor G2P especifico para jemer que convierte texto Unicode en secuencias de fonemas IPA estandarizadas, alineadas con el vocabulario de F5-TTS, lo que evita depender de un G2P externo o de transliteraciones manuales.

El ajuste fino se realizo sobre el dataset `sengtha/iany-khmer-voice`, compuesto por 5.629 clips de estudio y 5,29 horas de audio a 24 kHz. El entrenamiento se ejecuto en una NVIDIA L4 (24 GB de VRAM) con batches de 2.560 frames de audio, optimizador AdamW con warmup lineal y decaimiento coseno, y un objetivo de 25 epocas (aproximadamente 18.700 actualizaciones), a un ritmo de unas 2,0 actualizaciones por segundo. No se especifican en la informacion disponible detalles sobre el numero total de tokens de texto, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz a partir de texto en jemer (Unicode) con salida de audio a 24 kHz.
- Conversion G2P nativa de jemer a IPA integrada en el pipeline de inferencia.
- Generacion de audio de alta fidelidad gracias al vocoder Vocos de 100 bandas Mel.
- Modelo monoidioma: no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento, vision ni audio de entrada (es un modelo TTS, no un modelo multimodal).
- No se documenta clonacion de voz zero-shot ni control de estilo mas alla de lo que permite la arquitectura F5-TTS base.

## Casos de uso

- Locucion automatizada de contenido editorial en jemer: el modelo permite generar narraciones a partir de articulos o guiones sin intervencion humana, con calidad de estudio derivada del dataset de entrenamiento a 24 kHz.
- Audiolibros y contenido educativo accesible: conversion de material textual jemer a audio para personas con discapacidad visual o para aprendizaje de idiomas, aprovechando el G2P nativo que evita errores de pronunciacion por transliteracion.
- Asistentes de voz para atencion al cliente en jemer: integracion en IVR o chatbots telefonicos que requieran respuestas habladas en jemer con latencia aceptable para conversacion.
- Doblaje y localizacion de videos: generacion de pistas de voz en jemer para contenido formativo o divulgativo, con la ventaja de una licencia MIT que permite uso comercial sin restricciones adicionales.
- Sistemas de navegacion y avisos por voz: sintesis de indicaciones breves en jemer para aplicaciones de transporte o movilidad, donde la claridad fonetica del G2P es critica.
- Investigacion en TTS de bajos recursos: punto de partida para experimentos de adaptacion a otros idiomas o variedades del jemer, dado que el repositorio incluye checkpoints ajustados y una licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una NVIDIA L4 de 24 GB, lo que sugiere que la inferencia en precision completa puede requerir del orden de 8-16 GB, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento); se desconoce el rendimiento en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de ~345M parametros es en principio viable en GPUs consumer, pero no se documenta.
- Opciones de despliegue: la libreria indicada es `f5-tts`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles; solo se indica un throughput de entrenamiento de ~2,0 actualizaciones por segundo en L4.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de TTS en jemer o en la familia F5-TTS.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta jemer; no se documenta comportamiento en otros idiomas.
- Dataset de entrenamiento limitado: 5,29 horas y 5.629 clips, lo que puede reducir la cobertura de estilos, hablantes y condiciones acusticas frente a modelos entrenados con corpus mayores.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en textos fuera de dominio, especialmente con neologismos, siglas o numeros.
- Sesgos no documentados: no se detalla la composicion demografica de los hablantes del dataset, por lo que se desconoce el sesgo de edad, genero o registro.
- Sin datos de benchmarks: no es posible comparar su calidad objetiva (MOS, WER) con alternativas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del dataset `sengtha/iany-khmer-voice` para usos derivados.
- Advertencia de produccion: al no documentarse cuantizaciones ni opciones de despliegue estandar, la integracion en produccion requiere validacion propia de latencia, estabilidad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/REaksaa/F5-TTS-Khmer
- Dataset de entrenamiento: https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Repositorio F5-TTS (referencia de la arquitectura): no disponible en la informacion proporcionada
- Paper de F5-TTS: no disponible en la informacion proporcionada
- Demos o blogs adicionales: no disponible en la informacion proporcionada
