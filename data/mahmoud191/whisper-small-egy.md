# Mahmoud191/whisper-small-egy

## Resumen

Whisper-small-egy es un ajuste fino (fine-tuning) del modelo openai/whisper-small, desarrollado por el usuario Mahmoud191, especializado en reconocimiento automatico del habla (ASR) para arabe egipcio. El modelo parte de la arquitectura transformer encoder-decoder de Whisper, con 241,7 millones de parametros, y se ha entrenado sobre aproximadamente 15 horas de audio en dialecto egipcio procedentes del dataset MAdel121/arabic-egy-cleaned.

El problema que aborda es concreto: el whisper-small original de OpenAI rinde muy mal en arabe egipcio coloquial, con una tasa de error de palabra (WER) del 144,9 % en la muestra de evaluacion del autor. Tras el ajuste fino, esa cifra baja al 46,9 % sobre 100 muestras aleatorias de test, lo que supone una mejora sustancial aunque el resultado sigue lejos de ser perfecto para uso en produccion sin supervision.

Es relevante porque demuestra que un modelo pequeno y de licencia MIT puede adaptarse a un dialecto arabe especifico con un presupuesto de entrenamiento minimo (una sola epoca, learning rate 1e-5, fp16 y batch efectivo de 16). No obstante, el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y no se han publicado evaluaciones independientes, por lo que debe considerarse un experimento inicial mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper-small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no verificada por el autor) |
| Idiomas soportados | Arabe (entrenado especificamente para arabe egipcio; el modelo base soporta multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper-small: un encoder-decoder transformer con procesamiento de audio en ventanas de 30 segundos y tokenizacion BPE multilingue. El ajuste fino se realizo durante 1 epoca con learning rate de 1e-5, batch size de 8 con acumulacion de gradientes de 2 (batch efectivo 16) y precision fp16. El dataset de entrenamiento es MAdel121/arabic-egy-cleaned, con aproximadamente 15 horas de audio en arabe egipcio.

No se documentan innovaciones tecnicas adicionales, ni procesos de RLHF, DPO o decodificacion especulativa. El entrenamiento es un fine-tuning supervisado convencional sobre el modelo base, sin cambios arquitectonicos. La escasez de datos (15 horas) y de epocas (1) explica en parte que el WER final siga siendo alto.

## Capacidades

- Transcripcion de voz a texto en arabe egipcio coloquial.
- Reconocimiento de habla multilingue residual heredado del modelo base (no garantizado tras el ajuste fino).
- Generacion de transcripciones con puntuacion basica segun el comportamiento del tokenizador de Whisper.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada en la practica: el ajuste fino se ha realizado solo con datos en arabe.

## Casos de uso

- Transcripcion de reuniones y notas de voz en arabe egipcio: el modelo puede convertir audio coloquial en texto para actas o resumenes posteriores, aunque requiere revision humana dado el WER del 46,9 %.
- Subtitulado automatico de contenido audiovisual egipcio: util para generar subtitulos preliminares de videos, podcasts o series en dialecto egipcio que luego se corrigen manualmente.
- Investigacion en ASR dialectal: sirve como punto de partida reproducible para experimentos de adaptacion de Whisper a dialectos arabes con presupuesto reducido.
- Prototipado de asistentes de voz para el mercado egipcio: permite validar rapidamente pipelines de voz a texto antes de invertir en modelos mayores o datos adicionales.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones en arabe egipcio para mineria de texto y deteccion de motivos de contacto, siempre con supervision.
- Generacion de datasets etiquetados: uso como etiquetador automatico de audio no transcrito para ampliar corpus de entrenamiento, filtrando por confianza.

## Benchmarks y rendimiento

| Modelo | WER % (100 muestras de test) |
|---|---|
| openai/whisper-small | 144,9 |
| Mahmoud191/whisper-small-egy | 46,9 |

Datos proporcionados por el autor del modelo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB de pesos, con overhead de activaciones que situa el consumo practico en torno a 1-2 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para transcripciones de baja latencia no critica.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir multiples peticiones concurrentes.
- Opciones de despliegue: transformers pipeline (documentado por el autor), vLLM no aplica directamente a ASR, llama.cpp no soporta Whisper de forma nativa; alternativas habituales son faster-whisper, WhisperX o TGI con soporte de audio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER arabe egipcio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mahmoud191/whisper-small-egy | 241,7 M | Ventanas de 30 s | 46,9 % (test del autor) | MIT | Hugging Face |
| openai/whisper-small | 241,7 M | Ventanas de 30 s | 144,9 % (mismo test) | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | Ventanas de 30 s | No disponible | MIT | Hugging Face |

No se dispone de datos comparativos con otros ajustes finos de Whisper para arabe egipcio en la informacion proporcionada.

## Limitaciones y advertencias

- WER del 46,9 %: sigue siendo alto para produccion sin revision humana; aproximadamente una de cada dos palabras puede contener errores.
- Entrenado con solo 15 horas de audio y 1 epoca: riesgo elevado de sobreajuste al dominio y al estilo del dataset MAdel121/arabic-egy-cleaned.
- Evaluacion limitada a 100 muestras aleatorias del propio autor, sin validacion externa ni desglose por genero, edad o ruido ambiental.
- Sesgos desconocidos: no se documenta analisis de sesgos por dialecto, genero o procedencia de los hablantes.
- Riesgo de alucinacion en audio ruidoso o con musica, comportamiento comun en modelos Whisper.
- Capacidad multilingue degradada tras el ajuste fino; no se garantiza un rendimiento aceptable fuera del arabe egipcio.
- Licencia MIT permite uso comercial, pero la ausencia de evaluacion independiente desaconseja su uso en produccion sin validacion propia.
- Modelo con cero descargas y cero likes: sin comunidad que lo respalde ni issues documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mahmoud191/whisper-small-egy
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/MAdel121/arabic-egy-cleaned
