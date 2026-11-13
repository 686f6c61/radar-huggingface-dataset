# reverie-studio/chatterbox-turbo-fp16

## Resumen

`chatterbox-turbo-fp16` es un espejo (mirror) del repositorio `mlx-community/chatterbox-turbo-fp16`, publicado por el usuario `reverie-studio` para centralizar las descargas del servicio Echo de Reverie. No introduce ninguna modificacion sobre los pesos originales: los ficheros son copias byte a byte, con sumas de verificacion en `SHA256SUMS`. El modelo original es una conversion a formato MLX (Apple Silicon) del modelo Chatterbox Turbo de Resemble AI, orientado a síntesis de voz (text-to-speech) con capacidades de clonación de voz y control de emociones.

El repositorio contiene 746.407.786 parametros en `model.safetensors` (aproximadamente 0,75 mil millones), con un tamano total de 3,0 GB. La arquitectura subyacente es la de Chatterbox, un modelo TTS basado en transformer con un decoder autorregresivo y un vocoder integrado, si bien la model card del espejo no detalla la arquitectura interna ni los datos de entrenamiento.

La relevancia de este repositorio es fundamentalmente practica: permite a los usuarios de MLX (framework de Apple para ejecutar modelos en silicio de Apple) obtener los pesos en fp16 desde un unico punto de descarga. No obstante, al ser un espejo sin documentacion tecnica propia, la informacion disponible sobre arquitectura, entrenamiento y rendimiento es muy limitada y se remite al repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Chatterbox/Resemble AI; conversion MLX) |
| Parametros totales | 746.407.786 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (según el nombre del repositorio y el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en la model card del espejo; los pesos originales son MIT (ResembleAI/chatterbox-turbo), que prevalece |
| Formato de pesos | safetensors (`model.safetensors`, `conds.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura en la model card del espejo. Por el nombre y el origen (`mlx-community/chatterbox-turbo-fp16`), se trata de una conversion al framework MLX de Apple del modelo Chatterbox Turbo de Resemble AI, un sistema de text-to-speech. El repositorio incluye `config.json`, tokenizador BPE (`vocab.json`, `merges.txt`) y un fichero `conds.safetensors` que presumiblemente contiene los condicionamientos (embeddings de hablante o de estilo) necesarios para la inferencia.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas. El espejo no aporta nada nuevo: es una copia exacta de los ficheros del modelo base, y cualquier detalle tecnico debe consultarse en el repositorio original de Resemble AI.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, según la naturaleza del modelo Chatterbox Turbo.
- Clonación de voz y control de emociones: capacidades atribuibles al modelo Chatterbox original, aunque no se detallan en la model card del espejo.
- Ejecución en Apple Silicon mediante MLX (formato fp16).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generación de audiolibros y narración automatizada: el modelo puede sintetizar voz a partir de texto largo, adecuado para convertir documentos en audio en pipelines de publicación.
- Asistentes de voz para aplicaciones macOS/iOS: al estar en formato MLX, se integra en apps nativas de Apple Silicon para respuestas habladas en local.
- Prototipado de interfaces conversacionales: permite generar respuestas de voz en entornos de desarrollo sin depender de APIs externas de TTS.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o herramientas de apoyo a personas con discapacidad visual, ejecutándose en local.
- Doblaje y locución de bajo coste: generación de pistas de voz para vídeos o demos internas con control de estilo, si el modelo conserva las capacidades de Chatterbox.
- Investigación en TTS sobre Apple Silicon: banco de pruebas para medir latencia y calidad de un modelo de 0,75 mil millones de parametros en MLX frente a implementaciones en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al tratarse de un modelo de 746 millones de parametros en fp16, los pesos ocupan aproximadamente 1,5 GB; con overhead de inferencia y condicionamientos, se recomienda al menos 4-6 GB de memoria unificada.
- GPU recomendadas: al ser una conversion MLX, esta pensado para chips de Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para CUDA.
- Cabe en GPUs de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; en GPUs NVIDIA consumer requeriria una conversion a otro formato (no incluida en este repositorio).
- Opciones de despliegue: MLX (libreria `mlx` de Apple), `mlx-lm`/herramientas MLX para TTS. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| reverie-studio/chatterbox-turbo-fp16 | 746 M | no disponible | Apache-2.0 (espejo) / MIT (original) | safetensors (MLX, fp16) | Espejo sin modificaciones |
| mlx-community/chatterbox-turbo-fp16 | 746 M | no disponible | Apache-2.0 (según card) | safetensors (MLX, fp16) | Repositorio original del que se copia |
| ResembleAI/chatterbox-turbo | no disponible | no disponible | MIT | no disponible | Modelo upstream de Resemble AI |

No se dispone de datos de rendimiento para comparar cualitativamente con alternativas TTS como XTTS, Bark o Kokoro; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Es un espejo sin documentacion tecnica propia: la model card no describe arquitectura, datos de entrenamiento ni evaluacion.
- La licencia es ambigua: la card del espejo declara apache-2.0, pero los pesos originales son MIT (ResembleAI/chatterbox-turbo); según la propia card, prevalece la licencia MIT upstream. Verificar antes de uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; al ser un modelo TTS, el riesgo principal es la generacion de voz sintetica (suplantacion, deepfakes) y la calidad variable según el texto de entrada.
- Sin soporte documentado para CUDA ni para frameworks distintos de MLX.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin garantias de mantenimiento.
- El modelo base es una conversion de terceros (mlx-community) del modelo de Resemble AI; posibles diferencias de calidad respecto al original en PyTorch no evaluadas.

## Enlaces

- Repositorio del espejo: https://huggingface.co/reverie-studio/chatterbox-turbo-fp16
- Modelo base (MLX): https://huggingface.co/mlx-community/chatterbox-turbo-fp16
- Modelo upstream (Resemble AI): https://huggingface.co/ResembleAI/chatterbox-turbo
