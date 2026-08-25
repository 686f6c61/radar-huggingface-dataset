# mlboydaisuke/Tashkeel-350M-v2-LiteRT

# Tashkeel-350M-v2-LiteRT

## Resumen

Tashkeel-350M-v2-LiteRT es una conversión del modelo Etherll/Tashkeel-350M-v2 al formato `.litertlm` para el runtime LiteRT-LM, orientada a la ejecución en dispositivos móviles y de escritorio. El modelo original es un fine-tune del modelo base `ibm-granite/granite-4.0-h-350m` para la tarea de diacritización del árabe (tashkeel), entrenado sobre el dataset `Misraj/Sadeed_Tashkeela`. Este repositorio no modifica el modelo en sí, sino que lo empaqueta para ser usado con la librería `litert-lm`, permitiendo inferencia en CPU en teléfonos y ordenadores.

La relevancia de este modelo radica en su utilidad práctica: la diacritización del árabe es un paso importante para sistemas de síntesis de voz, traducción automática, análisis lingüístico y accesibilidad. El modelo tiene 350 millones de parámetros y una arquitectura híbrida (Mamba2 + atención), lo que lo hace eficiente para despliegue en dispositivos con recursos limitados. La conversión incluye dos versiones cuantizadas (fp16 e int8) para adaptarse a distintas restricciones de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba2 (selective-scan) + atención (base granite-4.0-h-350m) |
| Parámetros totales | 350 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 (con convs/SSM en fp32) y int8 dinámico (lineales + embedding) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle de LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base `granite-4.0-h-350m` es una arquitectura híbrida que combina capas de atención con capas Mamba2 (selective-scan). Esta combinación permite manejar secuencias largas con menor coste computacional que un transformer puro. El modelo Tashkeel-350M-v2 se fine-tuneó sobre el dataset `Misraj/Sadeed_Tashkeela` para la tarea específica de añadir diacríticos al texto árabe sin vocalizar. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con pares texto sin diacríticos / texto diacritizado.

La conversión a LiteRT-LM se realizó mediante `hf-to-litertlm` con la receta `granite_work/convert_granite4h.py`. Se mantiene el chat template original del modelo base y se elimina el token de inicio de metadatos (BOS) porque a esta escala produce degradación en la calidad de la diacritización. Se verificó la paridad de salida con el modelo fp32 de HuggingFace en diez sondas de texto: la versión fp16 es byte-idéntica en las diez, mientras que la int8 falla en dos (ambos son errores de un solo diacrítico, atribuibles a la cuantización).

## Capacidades

- Generación de texto árabe diacritizado: toma texto sin marcas de vocalización y lo devuelve con las vocales cortas (tashkeel) añadidas.
- Procesamiento en tiempo real en CPU de dispositivos móviles y de escritorio (no requiere GPU).
- Soporte de contexto largo gracias a la arquitectura híbrida Mamba2 (aunque no se especifica la longitud máxima exacta).
- Modelo de propósito específico: no es un modelo generalista, no tiene capacidades de razonamiento, código, visión ni tool calling.
- Multilingüismo: solo árabe (MSA y variantes dialectales según el dataset de entrenamiento).

## Casos de uso

- **Síntesis de voz (TTS)**: antes de pasar texto árabe a un motor de voz, se puede aplicar este modelo para añadir diacríticos y mejorar la pronunciación, especialmente en textos sin vocalización explícita.
- **Traducción automática**: la diacritización previa a la traducción reduce la ambigüedad léxica y semántica del árabe, mejorando la calidad de los sistemas de traducción.
- **Análisis de sentimientos y NLP árabe**: muchos procesadores de lenguaje natural requieren texto diacritizado para un análisis morfológico y sintáctico preciso.
- **Accesibilidad**: convertidores de texto a voz para personas con discapacidad visual que necesitan lectura correcta del árabe.
- **Herramientas de edición y corrección**: asistentes que añaden tashkeel automáticamente a textos en árabe para facilitar la lectura a estudiantes o lectores no nativos.
- **Búsqueda y recuperación de información**: indexación de documentos árabes con diacríticos para mejorar la precisión de búsqueda en corpus no vocalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que es una tarea específica de diacritización. La model card incluye una tabla de rendimiento en hardware Apple M4 Max con `litert-lm 0.16.0` (CPU, `-p 256 -d 256 --runs 3 --cache no`):

| Archivo | Prefill (tok/s) | Decode (tok/s) | TTFT |
|---|---|---|---|
| fp16 | 661.6 | 58.2 | 0.40 s |
| int8 | 761.3 | 97.2 | 0.35 s |

Además, se verifica la paridad de salida con el modelo fp32 de referencia en 10 sondas: fp16 logra 10/10 byte-idéntico, int8 8/10 (las dos fallas son de un solo diacrítico).

## Requisitos de hardware

- **Almacenamiento**: 769 MB (fp16) o 481 MB (int8) para los archivos `.litertlm`.
- **RAM**: en dispositivos móviles, el runtime de LiteRT-LM descomprime fp16 a fp32 en RAM, por lo que se recomienda int8 para equipos con memoria limitada; fp16 es viable si hay RAM suficiente.
- **CPU**: se ejecuta en CPU, no requiere GPU. La arquitectura Mamba2 usa operaciones selective-scan que no están soportadas por el delegate de GPU móvil.
- **GPU**: no aplica (solo CPU).
- **Despliegue**: se requiere `litert-lm >= 0.15` (para el Mamba2 hybrid state). Puede ejecutarse en teléfonos Android/iOS y desktops.
- **Latencia**: en Apple M4 Max, TTFT de 0.35–0.40 s y decode de 58–97 tok/s según la cuantización (ver tabla).

## Comparativa con modelos similares

No se dispone de datos sobre otros modelos de diacritización árabe comparables en la información proporcionada. El modelo original `Etherll/Tashkeel-350M-v2` es el único referente directo, y esta conversión mantiene el mismo rendimiento en fp16. No se puede realizar una comparación cuantitativa con alternativas como `Farasa` o `Mishkal` sin datos de benchmarks.

## Limitaciones y advertencias

- **Ámbito limitado**: solo diacritización de texto árabe; no es un modelo de lenguaje general.
- **Calidad de diacritización**: puede cometer errores en contextos ambiguos, especialmente con nombres propios o dialectos no representados en el dataset de entrenamiento.
- **Cuantización int8**: se observan dos fallos en la prueba de paridad (cambios de un solo diacrítico) que podrían afectar a casos de uso que requieran exactitud total.
- **Sesgos**: el dataset de entrenamiento `Sadeed_Tashkeela` puede tener sesgos de dominio (textos religiosos, noticias, etc.) que no cubren todos los registros del árabe moderno.
- **Dependencia de la plataforma**: requiere `litert-lm >= 0.15` y el runtime de LiteRT-LM; no es compatible con otros frameworks de inferencia (como vLLM o llama.cpp) sin conversión adicional.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero debe conservar el aviso de licencia.

## Enlaces

- Repositorio HuggingFace del modelo: [mlboydaisuke/Tashkeel-350M-v2-LiteRT](https://huggingface.co/mlboydaisuke/Tashkeel-350M-v2-LiteRT)
- Modelo base original: [Etherll/Tashkeel-350M-v2](https://huggingface.co/Etherll/Tashkeel-350M-v2)
- Modelo base de IBM Granite: [ibm-granite/granite-4.0-h-350m](https://huggingface.co/ibm-granite/granite-4.0-h-350m)
- Dataset de entrenamiento: [Misraj/Sadeed_Tashkeela](https://huggingface.co/datasets/Misraj/Sadeed_Tashkeela)
- Runtime LiteRT-LM: [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
- Herramienta de conversión: [hf-to-litertlm](https://github.com/john-rocky/hf-to-litertlm)
- Colección de conversiones del autor: [LiteRT Conversions](https://huggingface.co/collections/mlboydaisuke/litert-conversions-shipped-to-litert-community)
