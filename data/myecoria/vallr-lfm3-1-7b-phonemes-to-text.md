# MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text

## Resumen

VALLR-LFM3-1.7B-phonemes-to-text es un modelo de generacion de texto especializado que constituye la segunda etapa del sistema VALLR (visual automatic speech recognition, VASR) desarrollado por MyEcoria. El modelo toma como entrada una secuencia de fonemas en notacion ARPAbet, producida por la red video-a-fonema del mismo sistema, y la convierte en la frase en ingles correspondiente. Se trata de un fine-tuning con LoRA sobre LiquidAI/LFM3-1.7B, con los pesos del adaptador fusionados en el modelo final.

El modelo resuelve el problema de la reconstruccion linguistica en pipelines de lectura de labios: la primera etapa del sistema extrae fonemas a partir de video, y esta segunda etapa se encarga de transformar esa representacion fonetica abstracta en texto natural. La separacion en dos etapas permite que el modulo de lenguaje corrija ambiguedades foneticas y produzca oraciones gramaticalmente coherentes a partir de una secuencia de fonemas ruidosa o incompleta.

Con 1.728.801.536 parametros (aproximadamente 1,7 mil millones) y un formato de pesos safetensors, el modelo se distribuye a traves de la libreria transformers con codigo personalizado (`trust_remote_code=True`). Esta especializado en ingles y su uso previsto es exclusivamente la conversion fonemas-a-texto dentro del ecosistema VALLR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | mismos terminos que el modelo base LiquidAI/LFM3-1.7B (no se especifica la licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1,7 mil millones de parametros, y se ha adaptado mediante fine-tuning con LoRA (Low-Rank Adaptation). Segun la model card, el adaptador LoRA se entrena y posteriormente se fusiona con los pesos base para producir el modelo final distribuido en Hugging Face. El adaptador sin fusionar esta disponible en el repositorio de GitHub del proyecto, bajo el directorio `models/`.

El entrenamiento se orienta a una tarea de seq2seq implicita: el prompt sigue una plantilla con tokens especiales (`<S2S>`, `<PHONEMES>`, `</PHONEMES>`, `<TEXT>`) que delimitan la secuencia de fonemas ARPAbet de entrada y el texto de salida. La model card indica que la version publicada corresponde a la ultima ejecucion con entrenamiento continuado y la recomienda como version preferente. No se detalla el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Conversion de secuencias de fonemas ARPAbet a frases en ingles.
- Generacion de texto condicionada por una plantilla de prompt con tokens especiales de delimitacion.
- Integracion como segunda etapa de un pipeline de lectura de labios (video a fonemas, fonemas a texto).
- Generacion autoregresiva estandar mediante `model.generate` de transformers.
- Capacidades multilingues: limitadas al ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles en este modulo (la vision reside en la etapa previa del sistema VALLR).
- Modo thinking: no disponible.

## Casos de uso

- Lectura de labios asistida: integrado tras la red video-a-fonema de VALLR, convierte los fonemas extraidos del video en frases legibles, permitiendo transcripcion de habla sin audio en entornos ruidosos o con privacidad de audio.
- Subtitulado de video sin pista de audio: en grabaciones donde el audio esta ausente o corrupto, el pipeline completo puede reconstruir el texto a partir de la imagen del hablante.
- Correccion linguistica de salidas foneticas: el modelo actua como modulo de lenguaje que resuelve ambiguedades de la secuencia de fonemas y produce oraciones gramaticales, algo que una simple tabla de mapeo fonema-grafema no lograria.
- Investigacion en VASR: sirve como componente reproducible y aislado para experimentar con la etapa de decodificacion de fonemas a texto sin necesidad de reentrenar el extractor visual.
- Prototipos de interfaces de accesibilidad: conversion de comunicacion silenciosa o vocalizacion minima en texto para personas con dificultades de habla, dentro de un pipeline de vision por computador.
- Evaluacion comparativa de decodificadores foneticos: al estar construido sobre LFM3-1.7B, permite medir el efecto de distintos modelos base en la calidad de la reconstruccion de texto desde fonemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,7 mil millones de parametros en precision completa (fp16) se requiere del orden de 3,5 GB solo para pesos, mas memoria para el contexto y el estado de generacion.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es apto para GPU de consumo con suficiente VRAM.
- Cabe en GPU de consumo: previsiblemente si, en GPU con 8 GB o mas de VRAM en fp16, aunque el autor no publica requisitos.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VALLR-LFM3-1.7B-phonemes-to-text | 1,73 B | no disponible | Fonemas a texto (VASR) | misma que LFM3-1.7B | Hugging Face |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | Generacion de texto general | no disponible | Hugging Face |
| Modelos VASR especializados | no disponible | no disponible | Lectura de labios | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (fonemas a texto) y no debe emplearse como modelo de chat o generacion general.
- Solo soporta ingles; las entradas en otros idiomas o con fonemas fuera de ARPAbet probablemente produzcan salidas incorrectas.
- Depende de la plantilla de prompt exacta con los tokens `<S2S>`, `<PHONEMES>`, `</PHONEMES>` y `<TEXT>`; un formato distinto puede degradar la salida.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar dicho codigo antes de usarlo en produccion.
- La licencia no esta declarada de forma explicita en la model card; se remite a los terminos del modelo base LiquidAI/LFM3-1.7B, por lo que el uso comercial debe verificarse contra esa licencia.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto no fiel a la secuencia de fonemas de entrada, especialmente con entradas ruidosas o incompletas.
- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base general, puede heredar sesgos linguisticos de dicho modelo.
- Sin datos publicados de benchmarks, evaluacion de calidad ni requisitos de hardware; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text
- Repositorio GitHub del proyecto VALLR: https://github.com/MyEcoria/VALLR
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
