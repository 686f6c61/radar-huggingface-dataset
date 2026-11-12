# artideinnova/siglip2-base-patch16-256-text-coreml

## Resumen

SigLIP 2 base, text half, Core ML es una conversión del codificador de texto del modelo multimodal google/siglip2-base-patch16-256 a formato Core ML en precisión float16. Lo publica el usuario artideinnova con el objetivo concreto de habilitar búsqueda de vídeo por similitud visual en macOS: el codificador de texto transforma una consulta en un vector de 768 dimensiones que se compara por similitud coseno con los vectores que produce la mitad visual del mismo modelo sobre fotogramas. La herramienta rushbin, del mismo autor, consume este artefacto para buscar en material de archivo por apariencia en equipos Mac que funcionan de forma local.

El modelo no entrena nada nuevo: es una conversión de infraestructura. Los pesos proceden del checkpoint original de Google (commit 3f9f96cb90da5dbc758b01813f2f6f1aee24c1ab) y se mantienen sin cambios, solo trazados y empaquetados para el runtime de Apple. Esto lo hace relevante para desarrolladores que necesitan ejecutar inferencia de embeddings de texto en el Neural Engine o la GPU de un Mac sin depender de PyTorch ni de servicios en la nube.

La arquitectura subyacente es la del codificador de texto de SigLIP 2, un transformer con tokenizador Gemma/SentencePiece, contexto fijo de 64 tokens y salida normalizada de 768 dimensiones. El paquete incluye el modelo compilado, el tokenizador original y el script de conversión, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de texto de SigLIP 2), convertido a Core ML |
| Parametros totales | no disponible (solo se publica la mitad textual del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (padding max_length fijo, truncation activada) |
| Tipos de cuantizacion | float16 (compute_precision=FLOAT16 en la conversion); salida en float32 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las pruebas de paridad usan ingles e italiano) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc` dentro de `SigLIP2Text.mlmodelc.zip`); tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El artefacto contiene únicamente el codificador de texto del modelo google/siglip2-base-patch16-256. Se trata de un transformer que procesa secuencias de como máximo 64 tokens, sin máscara de atención (tal como se entrena el modelo original), con `<eos>` (id 1) al final y relleno con `<pad>` (id 0). La entrada es un tensor `ids` de tipo int32 con forma (1, 64) y la salida es un tensor `embedding` de tipo float32 con forma (1, 768), ya normalizado para permitir comparación por similitud coseno.

No hay entrenamiento ni fine-tuning posterior: los pesos se mantienen idénticos al checkpoint original y solo se convierten. La conversión se realizó con Python 3.12, torch 2.7.0, transformers 4.51.3 y coremltools 9.0, usando atención eager, `compute_precision=FLOAT16`, objetivo mínimo macOS 13 y compilación mediante `coremltools.utils.compile_model`. El tokenizador es el fichero SentencePiece original sin modificar. La innovación técnica relevante no está en el modelo sino en el pipeline de conversión y en la validación de paridad numérica frente a la referencia en PyTorch.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones para búsqueda y recuperación.
- Comparación texto-imagen por similitud coseno cuando se combina con la mitad visual del mismo modelo SigLIP 2 base.
- Ejecución en Neural Engine, GPU y CPU de Apple mediante Core ML, con selección de unidad de cómputo.
- Procesamiento de consultas con acentos, puntuación, espacios repetidos, emoji y otros alfabetos, según las pruebas de paridad documentadas.
- Truncado automático de consultas que superan los 64 tokens.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un codificador de features, no un modelo generativo.
- No soporta visión ni audio por sí mismo; solo la mitad textual.

## Casos de uso

- Búsqueda de vídeo por descripción visual en macOS: el codificador convierte la consulta del usuario en un vector de 768 dimensiones que se compara por coseno con los embeddings de fotogramas precalculados con la mitad visual, permitiendo localizar clips por apariencia sin conexión.
- Indexación local de bibliotecas de imágenes o footage: se generan embeddings de texto para etiquetas y consultas y se almacenan junto a los vectores visuales para recuperación semántica en un Mac de sobremesa o portátil.
- Filtrado de resultados en herramientas de edición: dado un texto de búsqueda, el modelo produce el vector de consulta en 1,4 ms en Neural Engine, lo que permite refrescar resultados en tiempo real mientras el usuario escribe.
- Aplicaciones de escritorio con privacidad por diseño: al ejecutarse íntegramente en el dispositivo, permite construir buscadores semánticos sin enviar consultas ni imágenes a servidores externos.
- Prototipado de sistemas de recuperación multimodal: sirve como bloque de texto en pipelines de búsqueda texto-imagen donde el resto del sistema ya usa SigLIP 2 base en formato PyTorch o Core ML.
- Deduplicación y agrupación de contenido: los embeddings permiten agrupar clips o imágenes por similitud semántica de sus descripciones asociadas, útil en gestión de archivos y catalogación.
- Integración en apps Swift/SwiftUI: al cargarse con `MLModel(contentsOf:)` en macOS 13 o superior, se puede incorporar directamente en el ecosistema Apple sin dependencias de Python en producción.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas estándar (MMLU, HumanEval, etc.) porque el artefacto no es un modelo generativo. Sí documenta pruebas de paridad numérica frente a la referencia en PyTorch y mediciones de latencia en hardware Apple (12 de noviembre de 2026, Apple M5 Pro, macOS 26.6), sobre 35 consultas en inglés e italiano con acentos, puntuación, espacios repetidos, emoji, otros alfabetos y consultas de más de 64 tokens:

| Entorno de ejecucion | Coseno minimo | Coseno medio | Tiempo por consulta |
|---|---|---|---|
| Neural Engine (`.cpuAndNeuralEngine`) | 0.99998 | 0.99999 | 1.4 ms |
| GPU (`.cpuAndGPU`) | 1.00000 | 1.00000 | 2.1 ms |
| CPU, build Intel bajo Rosetta | 1.00000 | 1.00000 | no disponible |

Frente a PyTorch con las versiones fijadas en la conversión, la paridad es de 1.00000 en las mismas 35 consultas. En una prueba de recuperación sobre 10 consultas y 405 fotogramas de 81 clips, los 10 clips más cercanos coinciden y en el mismo orden que con los vectores de referencia.

## Requisitos de hardware

- El paquete compilado ocupa aproximadamente 530 MB (530.503.967 bytes) y el repositorio completo 0,5 GB.
- Requiere macOS 13 o superior para cargar el `.mlmodelc` con `MLModel(contentsOf:)`.
- Diseñado y validado en Apple Silicon; las pruebas de paridad se hicieron en un Apple M5 Pro.
- Puede ejecutarse en Neural Engine, GPU o CPU según la unidad de cómputo seleccionada; también funciona en CPU con build Intel bajo Rosetta.
- No requiere GPU dedicada ni VRAM externa: usa la memoria unificada del sistema Apple.
- Despliegue mediante el runtime Core ML nativo (no aplica vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato).
- Latencia medida: 1,4 ms por consulta en Neural Engine y 2,1 ms en GPU.
- Throughput no disponible más allá de la latencia por consulta documentada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| artideinnova/siglip2-base-patch16-256-text-coreml | Codificador de texto (mitad de SigLIP 2 base) | no disponible | 64 tokens | Core ML float16 | Apache 2.0 | Hugging Face |
| google/siglip2-base-patch16-256 | Modelo multimodal completo (texto + vision) | no disponible en la informacion | no disponible en la informacion | safetensors (formato original) | Apache 2.0 | Hugging Face |
| Codificador de texto de CLIP (variantes base) | Codificador de texto | no disponible en la informacion | 77 tokens tipicamente | PyTorch / ONNX / Core ML segun conversion | Licencia variable segun variante | Hugging Face |

La comparación directa más relevante es con el modelo base original: este artefacto contiene solo la mitad textual, en float16 y empaquetada para Core ML, mientras que el original incluye ambas mitades y se distribuye en formato PyTorch. Frente a codificadores de texto tipo CLIP, la diferencia principal es el empaquetado nativo para Apple y la validación de paridad documentada; no se dispone de datos de rendimiento comparativo en tareas de recuperación más allá de la prueba de coincidencia de vecinos más cercanos descrita.

## Limitaciones y advertencias

- Solo contiene la mitad textual del modelo; no puede generar embeddings de imágenes por sí mismo y requiere la mitad visual correspondiente para búsqueda texto-imagen.
- Contexto limitado a 64 tokens con truncado: consultas largas pierden información más allá de ese límite.
- No es un modelo generativo: no produce texto, código ni razonamiento; cualquier uso en ese sentido es inadecuado.
- La model card no declara lista de idiomas oficial; las pruebas de paridad cubren inglés e italiano, por lo que el comportamiento en otros idiomas no está documentado.
- No se han publicado evaluaciones de sesgo, robustez o alucinación para este artefacto; al ser una conversión, hereda los sesgos del modelo base SigLIP 2, no evaluados aquí.
- Dependencia de macOS 13 o superior y del runtime Core ML; no es portable a Linux ni Windows sin reconversión.
- El autor advierte que los cambios respecto al original se limitan al trazado y conversión a Core ML con pesos sin modificar en float16; cualquier verificación de integridad debe contrastarse con los SHA-256 publicados.
- Licencia Apache 2.0 permite uso comercial, pero los derechos del modelo y del tokenizador son de Google LLC y deben conservarse los avisos correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artideinnova/siglip2-base-patch16-256-text-coreml
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
- Herramienta rushbin del autor: https://rushbin.artide.io
- Repositorio del modelo base (commit de referencia): https://huggingface.co/google/siglip2-base-patch16-256/tree/3f9f96cb90da5dbc758b01813f2f6f1aee24c1ab
