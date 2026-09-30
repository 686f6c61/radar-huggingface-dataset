# Aratako/Irodori-TTS-v4-Large-Quantized

# Irodori-TTS-v4-Large-Quantized

## Resumen

Irodori-TTS-v4-Large-Quantized es un conjunto de variantes cuantizadas tras el entrenamiento (*post-training*) del modelo de sintesis de voz Aratako/Irodori-TTS-v4-Large, desarrollado por el autor Aratako. Se trata de un modelo de texto a voz (TTS) en japones basado en Flow Matching que soporta clonacion de voz, diseno de voz a partir de texto (*Voice Design*), clonacion con control de estilo, audio de referencia largo y control mediante emojis. Su relevancia radica en que reduce el peso de los checkpoints a entre 2,8 y 3,7 GiB por variante mediante la libreria torchao, facilitando el despliegue en GPU de gama consumer.

El modelo cuantiza las capas Linear compatibles de atencion y MLP del codificador de texto, el codificador de hablante y el Transformer de difusion, manteniendo en BF16 los proyectores, AdaLN, la prediccion de duracion y otras capas no soportadas. La validacion en tiempo de ejecucion se ha realizado exclusivamente con NVIDIA CUDA, por lo que la ejecucion en CPU, ROCm e Intel XPU no esta validada en esta version.

La licencia es la de Gemma, ya que el codificador de texto/caption compartido deriva de google/t5gemma-2-1b-1b, lo que impone las condiciones de uso de Gemma ademas de restricciones eticas adicionales sobre clonacion de voz y desinformacion. El idioma soportado declarado es unicamente el japones (ja).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow Matching con Transformer de difusion; sigue el diseno de Echo-TTS y usa latentes continuos DACVAE como objetivo de generacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8-weight-only (W8A16); int8-dynamic (W8A8); int4-weight-only (W4A16, group size 128); float8-weight-only (pesos FP8, activaciones BF16); float8-dynamic (pesos FP8, activaciones FP8 dinamicas) |
| Idiomas soportados | japones (ja) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors cuantizados con torchao |

## Arquitectura y entrenamiento

La arquitectura y el diseno de entrenamiento siguen en gran medida a Echo-TTS, empleando latentes continuos de DACVAE como objetivo de generacion dentro de un esquema de Flow Matching. El modelo integra tres componentes principales en los que se aplican las cuantizaciones: un codificador de texto compartido (derivado de google/t5gemma-2-1b-1b), un codificador de hablante y un Transformer de difusion. Las capas Linear compatibles de atencion y MLP de estos tres componentes se cuantizan a INT8, INT4 o FP8 segun la variante, mientras que los proyectores, las capas AdaLN y el modulo de prediccion de duracion permanecen en BF16.

Esta publicacion es una version *post-training quantized* del modelo base Aratako/Irodori-TTS-v4-Large; no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio del proyecto en GitHub menciona tambien la incorporacion de destilacion MeanFlow y soporte para v4-Large, asi como la existencia de una version v4.1 y de un servidor de inferencia compatible con la API de OpenAI (Irodori-TTS-Server). No se detallan mas innovaciones tecnicas en la informacion disponible.

## Capacidades

- Sintesis de voz (TTS) en japones a partir de texto.
- Clonacion de voz a partir de audio de referencia.
- *Voice Design* basado en texto: generacion de una voz a partir de una descripcion, sin necesidad de audio de referencia.
- Clonacion de voz con control de estilo.
- Uso de audio de referencia largo para condicionar la generacion.
- Control mediante emojis.
- Cuantizacion post-entrenamiento en cinco variantes (INT8, INT4 y FP8) para reducir el uso de memoria.
- Inferencia con `--model-precision bf16` en CUDA.

## Casos de uso

- Audiolibros y narracion en japones: el modelo puede generar locuciones largas manteniendo una voz consistente gracias al soporte de audio de referencia largo, util para capitulos extensos.
- Doblaje y localizacion de contenido al japones: mediante clonacion de voz con control de estilo se puede preservar el tono y la intencion de la interpretacion original, siempre que se cuente con consentimiento explicito.
- Prototipado rapido de voces para videojuegos: la funcion de *Voice Design* a partir de texto permite crear voces de personaje sin disponer de grabaciones previas.
- Asistentes de voz y sistemas IVR en japones: la sintesis de texto a voz en tiempo de ejecucion encaja en flujos de atencion automatizada o interfaces conversacionales, desplegando una variante INT4 para reducir VRAM.
- Accesibilidad y lectores de pantalla: conversion de texto japones a audio para aplicaciones de lectura asistida, aprovechando la cuantizacion INT8 como variante de proposito general.
- Generacion de voz para contenido educativo: narracion de material didactico en japones con un estilo controlado por emojis o descripcion de estilo.
- Servicio de inferencia compatible con OpenAI: el repositorio del proyecto menciona Irodori-TTS-Server, lo que permite exponer el modelo mediante una API con formato compatible con OpenAI para integrarlo en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de checkpoint por variante: int8-weight-only e int8-dynamic, 3.662 MiB; int4-weight-only, 2.818 MiB (la mas pequena); float8-weight-only, 3.665 MiB; float8-dynamic, 3.659 MiB.
- El repositorio completo ocupa 18,3 GB, ya que incluye todas las variantes; en inferencia solo se descarga la variante seleccionada junto con los recursos del tokenizador compartido.
- Compatibilidad de GPU por variante:
  - int8-weight-only (W8A16): NVIDIA CUDA.
  - int8-dynamic (W8A8): NVIDIA CUDA.
  - int4-weight-only (W4A16, group size 128): NVIDIA Ampere o superior (compute capability 8.0+), usa el kernel CUDA tinygemm INT4.
  - float8-weight-only y float8-dynamic: NVIDIA Ada, Hopper o Blackwell (compute capability 8.9+).
- Cabe en GPU consumer con al menos ~3,7 GiB de VRAM para los pesos cuantizados (por ejemplo, tarjetas Ampere o superiores), si bien el requisito total dependera del resto del pipeline y de los buffers de activacion.
- Opciones de despliegue: CLI `infer.py` del repositorio de GitHub (con `uv sync --extra cu128`), Gradio, LoRA y soporte de referencia larga segun el repositorio; tambien existe Irodori-TTS-Server como API compatible con OpenAI.
- CPU, ROCm e Intel XPU no estan validados en esta version; dependen de los kernels disponibles de PyTorch y torchao.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia dentro de la misma familia, cabe mencionar las variantes del propio proyecto segun el repositorio de GitHub:

| Modelo | Relacion | Datos disponibles |
|---|---|---|
| Aratako/Irodori-TTS-v4-Large | Modelo base sin cuantizar | no disponible |
| Aratako/Irodori-TTS-v4-Small | Version actual que unifica las familias base y VoiceDesign | Soporta condicionamiento de 3 ramas desde texto |
| Aratako/Irodori-TTS-v4.1 | Version posterior del proyecto | no disponible |

## Limitaciones y advertencias

- Riesgo de sesgo y de representacion: al ser un modelo entrenado para japones, el rendimiento fuera de ese idioma no esta garantizado.
- Alucinacion y artefactos: en la generacion de voz puramente a partir de texto o captions, sin audio de referencia, la voz generada puede parecerse de forma casual a la de una persona real; el autor senala que es un artefacto probabilistico y que el modelo no se entreno con la intencion de reproducir individuos concretos.
- Restricciones eticas explicitas: prohibicion de clonar o suplantar la voz de cualquier persona sin su consentimiento explicito; prohibicion de generar deepfakes o habla sintetica destinada a enganar o difundir desinformacion.
- Licencia: sujeta a las Gemma Terms of Use y a la Gemma Prohibited Use Policy por derivar el codificador de texto/caption de google/t5gemma-2-1b-1b. El uso y la redistribucion deben cumplir esas condiciones.
- Limitaciones de hardware: la validacion se ha hecho solo con NVIDIA CUDA; la ejecucion en CPU, ROCm e Intel XPU no esta validada.
- Caveat de precision: las variantes float8 requieren compute capability 8.9+ y las int4 requieren Ampere o superior (8.0+); en hardware mas antiguo no son utilizables.
- Responsabilidad: los desarrolladores declinan cualquier responsabilidad por mal uso; el usuario es responsable de cumplir la legislacion aplicable en su jurisdiccion.
- El modelo no es un modelo conversacional ni de razonamiento: es un sistema TTS, por lo que no dispone de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace (variante cuantizada): https://huggingface.co/Aratako/Irodori-TTS-v4-Large-Quantized
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4-Large
- Repositorio de codigo en GitHub: https://github.com/Aratako/Irodori-TTS
- Libreria torchao: https://github.com/pytorch/ao
- Codificador de texto/caption de origen: https://huggingface.co/google/t5gemma-2-1b-1b
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
