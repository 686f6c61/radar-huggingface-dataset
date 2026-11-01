# JohnP1/d1a-e2b-it-qat-coreml

## Resumen

D1A-E2B-it QAT Core ML es una conversión al formato Core ML del modelo D1A-E2B-it QAT v0.6, un modelo de decisión y chat derivado de Google Gemma 4 E2B-it QAT (w4a16). Lo publica JohnP1 y su función principal no es generar texto libre, sino recibir un documento y un conjunto de preguntas cerradas (sí/no, opción múltiple o puntuación) y devolver, en una sola pasada hacia delante, una probabilidad calibrada para cada opción. Al desactivar el adaptador D1A, los mismos pesos se comportan como Gemma 4 E2B-it QAT y funcionan como modelo conversacional multimodal.

El paquete ocupa 4,6 GB e incluye 35 capas decodificadoras divididas en cinco partes, la cabeza de salida cuantizada a int8, la torre de visión, el codificador de audio conformer en fp32, los embeddings en 4 bits y un runner de referencia en Python. Está pensado para ejecutarse en Apple Silicon mediante GPU, no en la Neural Engine.

Su relevancia actual reside en la combinación de cuantización QAT, formato Core ML y un paradigma de decisión con probabilidades calibradas, orientado a inferencia local en dispositivos Apple. No obstante, el propio autor lo marca como experimental y verificado únicamente en un Mac con M1 Max, sin pruebas en iPhone ni iPad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Gemma 4 E2B-it) con adaptador D1A de decisión; conversión Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.536 tokens de entrada (prefill en dos tamaños: 512 y 1.536); caché KV de 2.048 posiciones para chat |
| Tipos de cuantizacion | Pesos de texto int4 (QAT w4a16, 276 capas lineales); cabeza de salida int8 por fila; embeddings 4 bits en grupos de 64; codificador de audio en fp32 |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage), safetensors (embeddings y cabeza D1A) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B-it sometido a entrenamiento con cuantización (QAT) en configuración w4a16, es decir, pesos de 4 bits y activaciones de 16 bits. Sobre él se aplica un adaptador D1A que añade una cabeza de puntero con temperatura de calibración de 1,55; esta cabeza produce una distribución de probabilidad sobre las opciones de cada pregunta sin generar texto, lo que garantiza que toda respuesta sea una opción válida. La conversión a Core ML divide las 35 capas decodificadoras en cinco paquetes que comparten una única copia de los pesos y exponen tres funciones: `prefill_512`, `prefill_1536` y `decode` (un token sobre la caché de 2.048 posiciones).

El autor conserva intactos los enteros y escalas de la QAT de Google en las 276 capas lineales int4, sin recuantizar. La validación se hizo contra la build MLX y contra PyTorch fp32 en CPU: cero respuestas invertidas en 42 respuestas de decisión y en 28 respuestas de medios, con un cambio máximo de probabilidad de 0,0017 frente a fp32 en decisiones y de 0,040 en medios. La torre de visión alcanza coseno por token ≥ 0,9996 y el codificador de audio 1,0 frente a fp32. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Decisión calibrada: dada una pregunta cerrada (sí/no, opción múltiple o puntuación), devuelve probabilidad por opción en una sola pasada, sin texto generado.
- Chat conversacional multimodal cuando se desactiva el adaptador D1A.
- Procesamiento de imágenes: torre de visión con 2.520 parches convertidos en 280 tokens.
- Procesamiento de vídeo: 630 parches por fotograma convertidos en 70 tokens; clips de 16 fotogramas.
- Procesamiento de audio: conformer que convierte 3.000 tramas mel (30 segundos) en 750 tokens.
- Clasificación de texto (pipeline declarado: text-classification).
- Decodificación greedy en el runner de referencia.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas: inglés y japonés.

## Casos de uso

- Triaje documental en local: enviar un contrato o informe y un conjunto de preguntas de cumplimiento (¿contiene cláusula de confidencialidad?, ¿supera el umbral de importe?) y obtener probabilidades calibradas por opción, útil para priorizar revisión humana sin enviar datos a la nube.
- Moderación y etiquetado de contenido multimedia: clasificar fotos, clips de voz o vídeo según criterios predefinidos, aprovechando que el modelo devuelve siempre una opción válida y una probabilidad interpretable.
- Asistente conversacional en Mac: con el adaptador desactivado, usar la variante Gemma 4 E2B-it QAT para diálogo multimodal (texto, imagen, audio) en aplicaciones de escritorio para Apple Silicon.
- Extracción de señales en atención al cliente: puntuar transcripciones de llamadas (30 segundos de audio por petición) con preguntas tipo "¿el cliente solicita cancelación?" y usar la probabilidad como umbral de escalado.
- Análisis de vídeo para control de calidad: procesar clips cortos de 16 fotogramas y responder preguntas binarias sobre presencia de objetos o defectos, aceptando la latencia de 8-11 segundos por clip en M1 Max.
- Prototipado de pipelines de decisión sin servidor: emplear el runner de referencia en Python y los ficheros de `goldens/` para validar una integración antes de portar la lógica de host a una app nativa.
- Investigación sobre calibración: comparar la temperatura de calibración (1,55) y las probabilidades del modelo frente a alternativas generativas en tareas de clasificación cerrada.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Decisiones: 28 peticiones reales, 42 respuestas | 0 respuestas invertidas frente a MLX; cambio máximo de probabilidad 0,0017 frente a fp32 |
| Medios (fotos, voz, vídeo): 14 peticiones, 28 respuestas | 0 invertidas frente a MLX; cambio máximo 0,040 |
| Codificador de foto y vídeo frente a fp32 (18 elementos) | coseno por token ≥ 0,9996 |
| Codificador de voz frente a fp32 (4 clips) | coseno por token 1,0 |
| Chat: 8 fotos, 427 tokens forzados | coseno del estado oculto final ≥ 0,99977; 1 token distinto de 427 |
| Chat: 1.000 tokens en una respuesta | estable (valores finitos en todo el recorrido) |
| Pesos de texto 4 bits | 276 capas con enteros y escalas QAT de Google exactos |

Rendimiento del modelo (build MLX, según el autor): frente a D1A-E2B-it v0.6, +0,40 en pooled [−0,21, +1,02], +3,5 en severidad de PR, +1,7 en etiquetas de PR, 11 % más rápido, pero −5,2 [−7,9, −2,6] en transfer-v4 (tipos de tarea fuera de entrenamiento).

## Requisitos de hardware

- Verificado únicamente en Apple M1 Max con macOS y GPU; sin pruebas en iPhone ni iPad.
- La Neural Engine no está soportada: requiere una disposición de pesos distinta que no se ha construido. Configuración `compute_units` ALL o CPU_AND_GPU.
- Tamaño en disco: 4,6 GB (trunk 1,1 GB, lm_head 0,40 GB, visión 0,34 GB, audio 1,18 GB, embeddings 1,55 GB).
- VRAM/unified memory estimada: no disponible de forma explícita; el conjunto de pesos ronda los 4,6 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el estado de la caché KV.
- GPU recomendadas: Apple Silicon (M1 Max verificado). Compatibilidad con A100, H100 o RTX 4090: no aplica, es un formato Core ML.
- Despliegue: Core ML con runner de referencia en Python (`reference/d1a_coreml_qat.py`). vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato.
- Latencia en M1 Max: 0,4 s por petición de foto o clip de voz; vídeo de 16 fotogramas, 0,9 s de codificación y 8-11 s de respuesta (unos 1.200 tokens a tamaño 1.536).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| D1A-E2B-it QAT Core ML (este) | no disponible | 1.536 entrada / 2.048 posiciones | Core ML | Apache 2.0 | Solo Apple Silicon GPU, experimental |
| JohnP1/d1a-e2b-it-qat-mlx-q4 (v0.7) | mismos pesos | mismo | MLX | Apache 2.0 | Mejor en actos de diálogo en inglés y japonés; referencia de comparación del autor |
| google/gemma-4-E2B-it-qat-w4a16-ct | no disponible | no disponible | safetensors | no disponible en la información | Modelo base de Google sin adaptador D1A |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría fuera de las builds del propio autor.

## Limitaciones y advertencias

- Estado experimental: verificado solo en un Mac con M1 Max; sin pruebas en iPhone ni iPad.
- Sin soporte de Neural Engine, lo que limita el aprovechamiento energético y el rendimiento en dispositivos móviles.
- No incluye app ni servidor listos para producción; solo modelos Core ML, datos de host y un runner de referencia en Python.
- Límite de 1.536 tokens de entrada para decisiones y chat, con 2.048 posiciones totales (prompt más respuesta).
- Decodificación greedy únicamente en el runner de referencia.
- Vídeo lento en Mac: 8-11 s por clip de 16 fotogramas.
- Solo inglés y japonés.
- Riesgo de alucinación en modo chat; en modo decisión el riesgo se traslada a la calibración de probabilidades.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma está sujeto a los términos de Google, que deben verificarse.
- El autor documenta un bug de PyTorch en MPS con las búsquedas de embeddings que afectaba a los tokens de inicio y fin de imagen; se corrigió con un workaround, pero conviene tenerlo en cuenta al validar con otras herramientas.

## Enlaces

- [HuggingFace: JohnP1/d1a-e2b-it-qat-coreml](https://huggingface.co/JohnP1/d1a-e2b-it-qat-coreml)
- [Build MLX v0.7: JohnP1/d1a-e2b-it-qat-mlx-q4](https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4)
- [Modelo base: google/gemma-4-E2B-it-qat-w4a16-ct](https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct)
- [Scorecard de evaluación](https://github.com/jonpol01/d1a/blob/main/docs/reports/2026-10-25-e2b-it-qat-scorecard.md)
- [Repositorio del proyecto D1A](https://github.com/jonpol01/d1a)
- [Issue del proyecto sobre el bug de MPS](https://github.com/jonpol01/d1a/issues/353)
- [Issue de PyTorch sobre el bug de MPS](https://github.com/pytorch/pytorch/issues/188756)
