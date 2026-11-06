# abhayhadez/anchor-hinglish-apex-ct2

## Resumen

`abhayhadez/anchor-hinglish-apex-ct2` es una conversion a formato CTranslate2 del modelo de reconocimiento automatico del habla `Oriserve/Whisper-Hindi2Hinglish-Apex`, publicada por el desarrollador Abhay Sharma (KalaJadu Anchor) para su uso con la libreria `faster-whisper`. El modelo original, entrenado por Oriserve, es un fine-tuning de `openai/whisper-large-v3-turbo` especializado en transcribir voz en hindi y hinglish (hindi hablado con mezcla de ingles) escribiendo el resultado en caracteres romanos (alfabeto latino), manteniendo los terminos ingleses tal cual.

La relevancia de esta ficha radica en que el repositorio no aporta entrenamiento nuevo: es exclusivamente una conversion de formato y una cuantizacion a `int8_float16`, que reduce el peso a aproximadamente 0,8 GB y permite inferencia en tiempo real con unos 1 GB de VRAM en GPU NVIDIA. Resulta util para aplicaciones de dictado offline o transcripcion en tiempo real de conversaciones code-switching hindi-ingles, un escenario poco cubierto por los modelos Whisper estandar.

El modelo se distribuye con licencia Apache 2.0, soporta los idiomas `hi` y `en`, y esta pensado para integrarse en pipelines de `faster-whisper` sobre CTranslate2. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | int8_float16 (pesos int8, computo float16) |
| Idiomas soportados | hindi (`hi`), ingles (`en`); orientado a hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), con `config.json`, `vocabulary.json`, `tokenizer.json`, `preprocessor_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio en ventanas de 30 segundos y con capacidad multilingue. El modelo Apex de Oriserve es un fine-tuning de esa base sobre datos de habla hindi y hinglish, con el objetivo especifico de producir salida en caracteres romanos en lugar de devanagari. Esta version concreta no ha sido reentrenada ni ajustada: unicamente se ha convertido de pesos Transformers a CTranslate2 y se ha cuantizado a `int8_float16` mediante `ct2-transformers-converter`.

No se dispone de informacion sobre el volumen de tokens de audio, la composicion exacta del dataset de fine-tuning, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card indica que los ficheros `tokenizer.json` y `preprocessor_config.json` se tomaron del repositorio fuente o, en su defecto, de `openai/whisper-large-v3-turbo`, que comparte tokenizer. La revision del modelo fuente utilizada es `f3214eed20b4e4d4144e739982d911f87b9cb223`.

## Capacidades

- Reconocimiento automatico del habla (ASR) para hindi y hinglish, con salida en alfabeto latino.
- Transcripcion de habla code-switching hindi-ingles manteniendo los terminos ingleses en ingles.
- Generacion de texto romanizado a partir de audio, por ejemplo: "kal subah meeting hai, please laptop le aana".
- Integracion con `faster-whisper` sobre CTranslate2 para inferencia optimizada.
- Ejecucion en GPU NVIDIA con cuantizacion int8_float16; inferencia en CPU posible pero lenta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo ASR).
- No dispone de modo thinking, vision ni audio generativo; solo transcripcion de audio a texto.

## Casos de uso

- Dictado offline en Windows: integrado en la app KalaJadu Anchor, el modelo permite dictar en hinglish sin conexion, escribiendo directamente en caracteres romanos para facilitar la entrada en editores y chats.
- Transcripcion de reuniones con equipos indios: conversaciones que mezclan hindi e ingles se transcriben en un formato legible para hispanohablantes o para documentacion tecnica, manteniendo terminos como "meeting", "laptop" o "deadline" en ingles.
- Subtitulado de contenido audiovisual: generacion de subtitulos romanizados para videos de YouTube o redes sociales dirigidos a audiencias hinglish, donde el devanagari no es el formato esperado.
- Atencion al cliente en centros de soporte: transcripcion en tiempo real de llamadas de clientes que hablan hinglish, con latencia baja gracias a la cuantizacion int8_float16 y al soporte de `faster-whisper`.
- Asistentes de voz para movilidad o manos libres: entrada por voz en aplicaciones de navegacion o productividad donde el usuario dicta en hinglish y necesita texto romanizado para busquedas o comandos.
- Investigacion en code-switching: corpus y experimentos de ASR sobre habla mixta hindi-ingles, usando el modelo como linea base o componente de un pipeline de analisis linguistico.
- Accesibilidad: conversion de voz a texto para usuarios que hablan hinglish y necesitan comunicarse por escrito en entornos donde el teclado en devanagari no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con cuantizacion int8_float16 (peso del modelo ~0,8 GB).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son validas, aunque el modelo es lo suficientemente pequeno para GPUs de gama baja.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU NVIDIA moderna, incluidas las de portatiles con 4 GB o mas.
- Opciones de despliegue: `faster-whisper` (recomendado, con `device="cuda"` y `compute_type="int8_float16"`), CTranslate2 directamente; no esta pensado para vLLM, TGI ni Ollama, que no soportan este formato de ASR.
- Inferencia en CPU: posible pero lenta, segun la model card; no recomendada para tiempo real.
- Latencia y throughput: no disponibles de forma numerica; la model card indica que permite uso en tiempo real con GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| anchor-hinglish-apex-ct2 | no disponible (base large-v3-turbo) | ventana audio 30 s | hi, en (hinglish) | Apache 2.0 | CTranslate2 int8_float16 |
| openai/whisper-large-v3-turbo | 809 M (aprox.) | ventana audio 30 s | multilingue | MIT | safetensors, GGUF, etc. |
| Oriserve/Whisper-Hindi2Hinglish-Apex | no disponible | ventana audio 30 s | hi, en | Apache 2.0 | Transformers safetensors |
| openai/whisper-large-v3 | 1.550 M (aprox.) | ventana audio 30 s | multilingue | MIT | safetensors, GGUF, etc. |

La comparativa se limita a datos estructurales: no se dispone de resultados de benchmarks que permitan comparar la calidad de transcripcion entre estos modelos. La diferencia principal de `anchor-hinglish-apex-ct2` frente a Whisper turbo estandar es la salida romanizada para hinglish y el formato CTranslate2 optimizado para `faster-whisper`; frente al modelo Apex original, solo cambia el formato y la cuantizacion.

## Limitaciones y advertencias

- El habla exclusivamente en ingles se transcribe con menor precision que con el modelo Whisper turbo estandar; la model card recomienda usarlo solo para hindi o hinglish.
- La ortografia romanizada del hindi no esta estandarizada, por lo que una misma palabra puede aparecer escrita de formas distintas en la salida.
- Requiere GPU NVIDIA para uso en tiempo real; la inferencia en CPU funciona pero es lenta.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa publica sobre su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- Sesgos potenciales derivados de los datos de entrenamiento del modelo original (no documentados en la informacion disponible).
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de atribucion (`NOTICE`) y mencionar los cambios realizados respecto al modelo original.
- La atribucion del entrenamiento corresponde a Oriserve; esta version solo cambia el formato, no debe presentarse como un modelo nuevo entrenado por el autor del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abhayhadez/anchor-hinglish-apex-ct2
- Modelo original: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Documentacion de CTranslate2: https://opennmt.net/CTranslate2/
