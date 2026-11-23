# mondhs/whisper-medium-lt-10s-20261122

## Resumen

whisper-medium-lt-10s-20261122 es un ajuste fino (fine-tuning) del modelo openai/whisper-medium para reconocimiento automatico del habla (ASR) en lituano. Lo publica el usuario mondhs en Hugging Face y esta entrenado sobre el corpus LIEPA-3, un conjunto de datos en lituano con grabaciones de lectura y dialogo a 16 kHz. El modelo parte de la arquitectura Whisper original de OpenAI y conserva sus 763.857.920 parametros, por lo que mantiene la ventana de contexto de audio de 30 segundos propia de la familia Whisper.

La relevancia de este modelo es acotada pero clara: cubre una lengua de bajos recursos como el lituano, para la que los modelos multilingues genericos suelen ofrecer un rendimiento inferior al de un ajuste especifico. El autor declara unos resultados de WER del 16,1 % y CER del 9,1 % sobre el split de test de FLEURS lt_lt, si bien estas cifras no estan verificadas de forma independiente. El sufijo "10s" en el nombre sugiere un entrenamiento o evaluacion orientado a segmentos de audio de hasta 10 segundos, aunque esta interpretacion no se confirma en la informacion disponible.

Se trata de un modelo pequeno dentro de la familia Whisper (la variante medium), distribuido en formato safetensors y con licencia MIT, lo que facilita su uso comercial. El acceso esta restringido en Hugging Face y requiere aceptar las condiciones del repositorio antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium de OpenAI) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (arquitectura Whisper); contexto de texto de 448 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en fp32/fp16) |
| Idiomas soportados | Lituano (lt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-medium, un transformer encoder-decoder con atencion completa disenado para transcripcion de audio. Whisper procesa la senal de entrada como espectrogramas Mel logaritmicos y genera texto de forma autorregresiva. La variante medium cuenta con 24 capas de encoder y 24 de decoder, con una dimension de modelo de 1024 y 16 cabezas de atencion; el total de parametros asciende a 763.857.920, coherente con el peso real de los safetensors publicados.

El entrenamiento se ha realizado sobre el dataset liepa-project/LIEPA-3_read-spon-dial_16kHz, que combina grabaciones de lectura y de dialogo espontaneo en lituano muestreadas a 16 kHz. No se dispone de informacion sobre el numero exacto de horas de audio, la composicion detallada del dataset ni sobre el uso de tecnicas de aumento de datos, regularizacion o decodificacion especulativa. Tampoco se documenta si hubo etapas de RLHF o DPO, algo poco habitual en tareas ASR. El sufijo "10s" del identificador apunta a un entrenamiento con segmentos de audio de hasta 10 segundos, pero no se confirma en la model card.

## Capacidades

- Transcripcion de voz a texto en lituano, con salida de texto plano.
- Reconocimiento de habla leida y de habla espontanea o dialogada, segun la composicion del corpus LIEPA-3.
- Procesamiento de segmentos de audio de hasta 30 segundos por pasada, gracias a la ventana nativa de Whisper.
- Generacion de marcas temporales a nivel de segmento (capacidad heredada de Whisper, no confirmada de forma explicita en la informacion disponible).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad multilingue mas alla del lituano; el ajuste fino esta orientado a un unico idioma.
- No se documenta modo thinking, vision ni audio mas alla de la propia entrada de voz.

## Casos de uso

- Transcripcion de reuniones y actas en lituano: el modelo puede convertir grabaciones de reuniones en texto para su posterior resumen o busqueda, aprovechando su ventana de 30 segundos por segmento y el ajuste especifico al idioma.
- Subtitulado automatico de contenido audiovisual lituano: la salida de texto permite generar subtitulos para videos, cursos o materiales formativos, con la ventaja de un WER declarado del 16,1 % en FLEURS frente a modelos multilingues genericos.
- Atencion al cliente y centros de contacto: transcripcion de llamadas en lituano para analisis de calidad, cumplimiento normativo o generacion de resumenes posteriores a la llamada.
- Documentacion clinica o administrativa dictada: conversion de notas de voz en lituano a texto estructurado, especialmente util en entornos donde el habla es leida o semileida.
- Investigacion linguistica y corpus orales: transcripcion masiva de grabaciones de campo en lituano para construir corpus anotados o estudios dialectales, dado el entrenamiento sobre habla leida y dialogada.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenidos en lituano.
- Integracion en pipelines de datos: uso como componente ASR dentro de flujos ETL que procesen audio lituano y lo conviertan en texto indexable.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | FLEURS (lt_lt, test) | WER | 16,1 % |
| ASR | FLEURS (lt_lt, test) | CER | 9,1 % |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,5-2 GB para los pesos del modelo, mas el overhead de activaciones y del procesador de audio; en la practica, unos 2-3 GB.
- En fp32, el peso de los parametros ronda los 3 GB, por lo que se recomienda fp16 o cuantizacion para reducir memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 3060, RTX 4060, T4). Para mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma nativa a Whisper, pero si faster-whisper, whisper.cpp, Ollama (segun soporte de la variante), TGI no documentado para este modelo. El formato publicado es safetensors, por lo que para llama.cpp o whisper.cpp habria que convertir los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| whisper-medium-lt-10s-20261122 | 763,9 M | 30 s | Lituano | MIT | Restringido (gated) |
| openai/whisper-medium | 769 M | 30 s | Multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-small | 244 M | 30 s | Multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-large-v3 | 1.550 M | 30 s | Multilingue (99 idiomas) | MIT | Abierto |

El ajuste fino sacrifica cobertura multilingue a cambio de especializacion en lituano. Frente a whisper-medium original, se espera una mejora en lituano derivada del entrenamiento sobre LIEPA-3, aunque no se dispone de cifras comparativas del modelo base en FLEURS lt_lt dentro de la informacion proporcionada. whisper-large-v3, con el doble de parametros, suele ofrecer mejor rendimiento general, pero requiere mas VRAM y no esta especializado en lituano.

## Limitaciones y advertencias

- Los resultados de WER y CER estan declarados por el autor y marcados como no verificados; conviene validarlos de forma independiente antes de usarlos en produccion.
- El modelo esta especializado exclusivamente en lituano; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios o habla solapada.
- Sesgos: el entrenamiento sobre LIEPA-3 puede introducir sesgos de dominio (habla leida y dialogada de un corpus concreto) y de demografia de los hablantes del corpus; no se documenta analisis de sesgos.
- Limitacion de contexto: la ventana nativa de 30 segundos obliga a segmentar audios largos, lo que puede degradar la coherencia en transcripciones de documentos extensos.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de descargas en CI/CD.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del dataset LIEPA-3 y del modelo base para confirmar compatibilidad.
- No se documenta el proceso de entrenamiento (horas de audio, hiperparametros, validacion), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mondhs/whisper-medium-lt-10s-20261122
- Modelo base: https://huggingface.co/openai/whisper-medium
- Dataset LIEPA-3: https://huggingface.co/datasets/liepa-project/LIEPA-3_read-spon-dial_16kHz
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
