# anylab/embeddinggemma-2-coreml

## Resumen

EmbeddingGemma 2 para Core ML es una conversión del codificador de texto EmbeddingGemma 2 de Google, realizada por AnyLab y publicada en Hugging Face. El modelo original es un encoder de frases (sentence-similarity) que transforma texto en vectores densos de 768 dimensiones y norma L2 unitaria, aptos para búsqueda semántica, agrupamiento y sistemas de recuperación. Esta versión no es un modelo generativo: es un extractor de características (feature-extraction) empaquetado en formato Core ML para ejecutarse en Apple Silicon, con soporte explícito para la Neural Engine de Apple.

La relevancia de esta conversión radica en el despliegue local: permite ejecutar embeddings multilingües en macOS 15 o superior sin depender de servicios en la nube, aprovechando la aceleración por hardware de los chips de Apple. El paquete ocupa 574,4 MB con pesos compartidos entre funciones, y ofrece cinco variantes de longitud de secuencia (`s128`, `s256`, `s512`, `s1024`, `s2048`) para ajustar el coste computacional al tamaño real de la entrada.

La validación reportada por el autor se limita a un MacBook Air M2 con 16 GB de RAM, con una similitud coseno mínima de 0,999927 frente a 16 entradas de referencia del modelo original. Se trata de una conversión independiente, no de una publicación oficial de Google, y la seguridad de uso en aplicaciones completas sobre equipos de 8 GB queda sin medir según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de texto Transformer (modelo base google/embeddinggemma-2), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2048 tokens (funciones `s128`, `s256`, `s512`, `s1024`, `s2048`) |
| Tipos de cuantizacion | FP16 en el encoder; FP32 en la normalizacion final |
| Idiomas soportados | multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`), con pesos compartidos entre funciones |

## Arquitectura y entrenamiento

Esta ficha describe una conversión, no un entrenamiento nuevo. El modelo subyacente es google/embeddinggemma-2, un encoder de texto de la familia Gemma orientado a la generación de embeddings de frases. La conversión de AnyLab preserva la arquitectura del encoder original y la traduce al formato Core ML, con precisión FP16 en el codificador y FP32 en la etapa de normalización final, de modo que la salida mantiene 768 dimensiones con normalización L2.

El paquete incluye cinco funciones (`s128`, `s256`, `s512`, `s1024`, `s2048`) que corresponden a distintas longitudes máximas de secuencia. El autor recomienda elegir la función más pequeña que cubra la entrada después de aplicar prompts y tokens especiales, y cargar las funciones mayores bajo demanda, liberándolas cuando estén inactivas: compartir pesos en disco no comparte las asignaciones en tiempo de ejecución. La primera carga puede tardar minutos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones con normalización L2, orientados a similitud semántica y recuperación.
- Extracción de características (feature-extraction) para frases, párrafos y documentos de hasta 2048 tokens según la función elegida.
- Soporte multilingüe heredado del modelo base.
- Ejecución en Apple Silicon mediante Core ML, con destino `cpuAndNeuralEngine` (que, según el autor, todavía permite trabajo en CPU).
- Cinco perfiles de longitud de secuencia para equilibrar latencia y cobertura de contexto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica local en macOS: indexar documentos y consultas con la función `s512` o `s1024` y calcular similitud coseno en el dispositivo, sin enviar texto a servidores externos.
- Clasificación y agrupamiento de textos: generar embeddings de tickets, correos o reseñas y aplicar k-means o clasificadores ligeros sobre los vectores de 768 dimensiones.
- Deduplicación de contenido: detectar documentos o entradas de catálogo casi idénticas comparando embeddings normalizados con un umbral de coseno.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores y recuperar los más próximos mediante búsqueda por vecinos.
- Filtrado y moderación previa: usar la función `s128` para entradas cortas y de baja latencia, reservando `s2048` para documentos largos que requieran contexto completo.
- Prototipado de RAG en aplicaciones nativas de Apple: integrar el `.mlpackage` en una app Swift y combinar los embeddings con un almacén vectorial local para recuperación aumentada.
- Análisis multilingüe en el dispositivo: comparar textos en distintos idiomas en un mismo espacio vectorial sin depender de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una validación de fidelidad de la conversión: similitud coseno mínima de 0,999927 frente a 16 entradas de referencia del modelo original, medida en un MacBook Air M2 con 16 GB de RAM. No se proporcionan cifras de MMLU, MTEB ni latencia o throughput.

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 15 o superior; la conversión está orientada a la Neural Engine de Apple.
- Almacenamiento: 574,4 MB para el paquete Core ML con pesos compartidos, más el tokenizador y ficheros auxiliares (repositorio de 0,6 GB).
- Memoria: validado en un M2 Air con 16 GB de RAM; el comportamiento en equipos de 8 GB no está medido según el autor.
- Memoria en tiempo de ejecución: cargar varias funciones simultáneamente multiplica las asignaciones, aunque los pesos se compartan en disco; se recomienda cargar bajo demanda y liberar cuando estén inactivas.
- Tiempo de carga: la primera carga puede tardar minutos.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el formato Core ML está pensado para hardware Apple.
- Opciones de despliegue: Core ML en apps macOS (por ejemplo, vía Swift), con el destino `cpuAndNeuralEngine`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de embedding | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| anylab/embeddinggemma-2-coreml | Encoder de texto (conversion Core ML) | 768 | hasta 2048 tokens | Core ML | Apache-2.0 | Hugging Face, 291 descargas |
| google/embeddinggemma-2 | Encoder de texto (modelo base) | 768 | no disponible en la informacion | safetensors (presumible, no confirmado) | no disponible en la informacion | Hugging Face |
| Otros encoders multilingues de la familia Gemma | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión independiente de AnyLab, no una publicación oficial de Google; para producción conviene fijar una revisión inmutable de Hugging Face y verificar los hashes de los ficheros.
- El modelo solo genera embeddings: no produce texto, no razona y no soporta herramientas ni agentes.
- La validación es limitada: 16 entradas de referencia en un único equipo (M2 Air, 16 GB); no hay mediciones de calidad en tareas reales ni de seguridad en 8 GB.
- Cargar varias funciones a la vez incrementa el uso de memoria en tiempo de ejecución pese a compartir pesos en disco.
- La primera carga puede tardar minutos, lo que afecta a la experiencia en aplicaciones interactivas.
- El destino `cpuAndNeuralEngine` no garantiza ejecución exclusiva en la Neural Engine; parte del trabajo puede recaer en la CPU.
- No se detallan sesgos, tasas de alucinación ni limitaciones idiomáticas específicas del modelo base en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero deben respetarse las atribuciones indicadas en NOTICE y en los ficheros de licencias incluidos (por ejemplo, QVAC-MIT).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anylab/embeddinggemma-2-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentación de uso, prompts y formas de entrada: docs/usage.md (dentro del repositorio)
- Instrucciones de conversión y reproducción: conversion/README.md (dentro del repositorio)
- Mediciones y limitaciones: docs/technical-notes.md (dentro del repositorio)
- Manifiesto de versión con hashes: release-manifest.json (dentro del repositorio)
- Licencia y atribución: NOTICE (dentro del repositorio)
