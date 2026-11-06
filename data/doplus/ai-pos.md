# doplus/ai-pos

## Resumen

`doplus/ai-pos` es un repositorio de modelos on-device publicado por el desarrollador doplus para dar soporte a sus aplicaciones ai-pos, Ting Tien y しゃべレジ. No se trata de un modelo entrenado desde cero ni de un fine-tune propio: la model card indica explícitamente que son copias sin modificar de tres artefactos de Google distribuidos a través de la organización `litert-community`. El repositorio funciona, por tanto, como espejo de dependencias empaquetadas para consumo desde aplicaciones móviles.

Los artefactos incluidos son tres: `gemma3-270m-it-q8.litertlm` (Gemma 3 270M IT cuantizado a int8), `gemma3-1b-it-int4.litertlm` (Gemma 3 1B IT cuantizado a int4) y el par `embeddinggemma-300M_seq256_mixed-precision.tflite` más `sentencepiece.model` (EmbeddingGemma 300M con secuencia de 256 tokens y precisión mixta). El tamaño total del repositorio es de 1,1 GB y los pesos se distribuyen en formato LiteRT (`.litertlm`) y TFLite (`.tflite`), orientados a inferencia en dispositivo mediante el runtime LiteRT de Google.

Su relevancia es acotada pero concreta: sirve como referencia de cómo empaquetar un pipeline completo de IA en el dispositivo (un modelo pequeño de generación, uno mediano y un modelo de embeddings) bajo la licencia Gemma, y resulta útil para desarrolladores que quieran reproducir esa misma combinación en apps Android o iOS sin depender de descargas desde múltiples repositorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) para los dos modelos generativos; encoder de embeddings (EmbeddingGemma) para el tercero |
| Parametros totales | 270M (gemma3-270m-it), 1B (gemma3-1b-it), 300M (embeddinggemma-300m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el artefacto de embeddings usa secuencia de 256 tokens |
| Tipos de cuantizacion | int8 (270M), int4 (1B), precision mixta (embeddinggemma) |
| Idiomas soportados | no disponibles |
| Licencia | Gemma Terms of Use (gemma) |
| Formato de pesos | LiteRT (`.litertlm`) y TFLite (`.tflite`) + `sentencepiece.model` |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre entrenamiento propio: los tres artefactos son copias directas de los modelos publicados por `litert-community`. Gemma 3 en sus variantes 270M y 1B es una familia de transformers decoder-only de Google optimizada para despliegue en dispositivo, y EmbeddingGemma 300M es un modelo de embeddings de texto derivado de la misma familia, exportado aquí con secuencia fija de 256 tokens y precisión mixta para reducir el coste de memoria en móvil.

La innovación relevante no está en el entrenamiento sino en el empaquetado: el uso de LiteRT (`.litertlm`) permite cargar los pesos directamente con el runtime de Google en Android, y la combinación de un modelo de 270M para tareas ligeras, otro de 1B para generación de mayor calidad y un encoder de 300M para recuperación semántica configura un pipeline típico de RAG on-device. No se documentan datos de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto en dispositivo con Gemma 3 270M IT (int8) y Gemma 3 1B IT (int4).
- Razonamiento y respuesta a instrucciones en las variantes IT (instruction-tuned) de Gemma 3.
- Generación de embeddings de texto con EmbeddingGemma 300M para búsqueda semántica y recuperación.
- Tokenización mediante `sentencepiece.model` incluido en el repositorio.
- Ejecución completamente local, sin llamadas a red, adecuada para apps con requisitos de privacidad.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Idiomas: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales on-device en apps móviles: el par 270M/1B permite alternar entre un modelo rápido para respuestas cortas y uno de mayor calidad para turnos complejos, sin salir del dispositivo.
- Búsqueda semántica local en aplicaciones de notas o documentos: EmbeddingGemma 300M con secuencia de 256 tokens permite indexar y recuperar fragmentos de texto en el propio teléfono.
- RAG completamente offline: combinando el encoder de embeddings con Gemma 3 1B IT se puede construir un pipeline de recuperación y generación sin conexión, útil en entornos con conectividad limitada.
- Clasificación y etiquetado de texto en el borde: el modelo de 270M en int8 es suficientemente ligero para tareas de categorización por lotes en dispositivos de gama media.
- Autocompletado y sugerencias en teclados o formularios: la latencia baja esperable de un modelo de 270M int8 encaja con interacciones de escritura en tiempo real.
- Aplicaciones de nicho con empaquetado reproducible: el repositorio sirve como plantilla para distribuir los tres artefactos juntos y garantizar versiones consistentes entre apps (ai-pos, Ting Tien, しゃべレジ).
- Prototipado de funciones de IA en Android con LiteRT: los ficheros `.litertlm` y `.tflite` se cargan directamente con el runtime de Google, lo que simplifica la integración en proyectos Kotlin/Java.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, el artefacto de 1B en int4 ronda los 0,5-0,7 GB y el de 270M en int8 alrededor de 0,3 GB, mientras que el repositorio completo ocupa 1,1 GB.
- GPU recomendadas: no aplica en el escenario principal; el objetivo es CPU/NPU móvil mediante LiteRT.
- Cabe en GPU de consumo: sí, cualquiera de los artefactos individuales cabe holgadamente en GPUs de consumo, aunque el runtime previsto es LiteRT en dispositivo.
- Opciones de despliegue: LiteRT (runtime de Google para `.litertlm` y `.tflite`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doplus/ai-pos (este repo) | 270M + 1B + 300M | no disponible | LiteRT / TFLite | Gemma | Hugging Face, 0 descargas |
| litert-community/gemma-3-270m-it | 270M | no disponible | LiteRT | Gemma | Hugging Face (origen) |
| litert-community/Gemma3-1B-IT | 1B | no disponible | LiteRT | Gemma | Hugging Face (origen) |
| litert-community/embeddinggemma-300m | 300M | 256 tokens (secuencia del artefacto) | TFLite | Gemma | Hugging Face (origen) |

La comparativa relevante es contra los repositorios de origen: `doplus/ai-pos` no añade capacidades nuevas, solo agrupa los tres artefactos en un único paquete con licencia Gemma. Para benchmarks o métricas de calidad conviene consultar las model cards originales de `litert-community`, que no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo propio: cualquier limitación de Gemma 3 270M/1B y EmbeddingGemma 300M aplica íntegramente aquí.
- Sesgos conocidos: no documentados en la información proporcionada; los modelos base de Gemma pueden reflejar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: presente en los modelos generativos de 270M y 1B, especialmente en el de menor tamaño; no se han publicado evaluaciones en este repositorio.
- Limitaciones de contexto e idioma: no disponibles; el artefacto de embeddings está fijado a 256 tokens, lo que limita la longitud de los fragmentos indexables.
- Restricciones de licencia: uso sujeto a Gemma Terms of Use y a la Gemma Prohibited Use Policy; es necesario revisar ambas antes de un uso comercial.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, creado y actualizado el 2026-11-02, por lo que no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- Dependencia del runtime LiteRT: los formatos `.litertlm` y `.tflite` requieren el runtime de Google; no son directamente compatibles con ecosistemas como llama.cpp o vLLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/doplus/ai-pos
- Modelo base Gemma 3 270M IT: https://huggingface.co/litert-community/gemma-3-270m-it
- Modelo base Gemma 3 1B IT: https://huggingface.co/litert-community/Gemma3-1B-IT
- Modelo base EmbeddingGemma 300M: https://huggingface.co/litert-community/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
