# Phoonnx/mosstts-audio_tokenizer-nano

## Resumen

`mosstts-audio_tokenizer-nano` es un empaquetado para la librería phoonnx del tokenizador de audio MOSS-Audio-Tokenizer-Nano, desarrollado originalmente por OpenMOSS. No se trata de un modelo de síntesis de voz completo, sino del componente de tokenización de audio que forma parte del pipeline MOSS-TTS. El autor del empaquetado es Phoonnx, que lo distribuye en formato ONNX para su uso con su librería de text-to-speech en Python y en el ecosistema OVOS.

El modelo se publica bajo licencia Apache 2.0 y ocupa aproximadamente 0,1 GB en el repositorio. La model card es extremadamente escueta: no documenta arquitectura interna, número de parámetros, longitud de contexto, idiomas soportados ni datos de entrenamiento. La información disponible se limita a la cadena de procedencia (OpenMOSS como autor original, conversión ONNX por OpenMOSS-Team y empaquetado por Phoonnx) y a los enlaces a los proyectos relacionados.

Su relevancia es acotada: sirve a quienes ya utilizan el ecosistema phoonnx/OVOS y necesitan el tokenizador de audio del stack MOSS-TTS en formato ONNX. No hay descargas ni likes registrados, y la propia model card advierte de que el índice de voces de phoonnx no lista una voz para este modelo, lo que sugiere que su uso directo como sintetizador no está soportado de forma inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS-TTS (tokenizador de audio); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card solo indica que pertenece a la familia MOSS-TTS de OpenMOSS y que se trata de un tokenizador de audio, es decir, el componente que convierte audio en tokens discretos (y presumiblemente a la inversa) dentro del pipeline de sintesis de voz. El repositorio empaquetado por Phoonnx deriva de la conversion ONNX oficial publicada por OpenMOSS-Team.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Tampoco se especifica el tamano del modelo mas alla del peso del repositorio (0,1 GB), que sugiere un componente ligero, coherente con el sufijo "nano".

## Capacidades

- Tokenizacion de audio dentro del pipeline MOSS-TTS: conversion entre representaciones de audio y tokens discretos.
- Integracion con la libreria phoonnx para text-to-speech en Python y en OVOS.
- Ejecucion mediante ONNX Runtime al estar distribuido en formato ONNX.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni de agentes.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio, etc.) mas alla del propio procesamiento de audio.

## Casos de uso

- Pipeline de sintesis de voz con phoonnx: usar el tokenizador como paso intermedio entre el texto fonemizado y el decoder de audio dentro de una aplicacion TTS construida sobre phoonnx.
- Integracion en asistentes OVOS: incorporar el componente al stack de voz de OVOS para la fase de tokenizacion de audio, aprovechando que phoonnx lo soporta de forma nativa en Python y en OVOS.
- Investigacion sobre tokenizadores de audio: emplear el modelo como referencia para estudiar como MOSS-TTS representa el audio en tokens discretos, dado su reducido tamano (0,1 GB) y su formato ONNX.
- Despliegue en entornos con ONNX Runtime: ejecutar el tokenizador en infraestructura que ya use ONNX Runtime, sin necesidad de dependencias de PyTorch.
- Prototipado de pipelines TTS personalizados: combinar este tokenizador con otros componentes del stack MOSS-TTS para construir un sintetizador completo, siempre que se aporte el resto de piezas del pipeline.
- Evaluacion comparativa de tokenizadores de audio: usar el modelo como linea base ligera en experimentos que comparen distintos esquemas de tokenizacion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un componente ligero que probablemente cabe en GPU de consumo, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del repositorio es plausible, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); la libreria phoonnx como capa de ejecucion en Python y OVOS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (tokenizadores de audio para TTS) con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card advierte de que el indice de voces de phoonnx no lista una voz para este modelo, por lo que no puede usarse directamente como sintetizador de voz sin componentes adicionales.
- No es un modelo TTS completo: es un tokenizador de audio, por lo que su utilidad depende del resto del pipeline MOSS-TTS.
- Ausencia total de documentacion sobre arquitectura, parametros, contexto e idiomas, lo que dificulta evaluar su idoneidad en produccion.
- Sin descargas ni likes registrados en Hugging Face, lo que implica ausencia de validacion comunitaria.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo upstream y de la conversion ONNX original.
- El campo de idiomas aparece como "no disponible"; no debe asumirse soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mosstts-audio_tokenizer-nano
- Modelo upstream: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Conversion ONNX: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion MOSS-TTS para phoonnx: https://huggingface.co/collections/Phoonnx/moss-tts-6af8ecba663438f590ae4f4e
