# codebucketsolutions/clap-htsat-unfused-onnx

## Resumen

CLAP (Contrastive Language-Audio Pretraining) es un modelo de representación conjunta audio-texto desarrollado originalmente por LAION, que aprende un espacio latente compartido entre clips de audio y descripciones textuales. Este repositorio concreto, publicado por codebucketsolutions, es una exportación no oficial a ONNX del checkpoint `laion/clap-htsat-unfused`, con el encoder de audio HTSAT-tiny y un encoder de texto basado en RoBERTa-base. El modelo base fue entrenado sobre LAION-Audio-630K y convertido al ecosistema transformers por LAION.

La relevancia de esta ficha radica en que elimina la dependencia de PyTorch en tiempo de inferencia: se ofrecen dos grafos ONNX independientes (torre de audio y torre de texto) que permiten ejecutar clasificación zero-shot de audio y extracción de embeddings con onnxruntime. Los pesos son idénticos a los originales y se incluye una versión del grafo de audio cuantizada a int8, lo que reduce el coste de despliegue en entornos sin GPU o con requisitos estrictos de latencia.

El modelo resuelve tareas de clasificación de audio zero-shot mediante etiquetas en lenguaje natural, sin necesidad de reentrenamiento, y sirve como extractor de embeddings de 512 dimensiones para búsqueda, recuperación o clustering audio-texto. No es un modelo generativo: no produce texto ni audio, solo representaciones vectoriales alineadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dual encoder: HTSAT-tiny (audio) + RoBERTa-base (texto), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: 10 s fijos (480 000 muestras a 48 kHz); texto: 77 tokens |
| Tipos de cuantización | fp32 (audio y texto), int8 dinámica (solo grafo de audio) |
| Idiomas soportados | no disponible (el encoder de texto es RoBERTa-base, predominantemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), tokenizer en `tokenizer.json` |
| Dimensión del embedding | 512, L2-normalizado |
| Sample rate | 48 000 Hz, mono |
| Logit scale | 18.6612 |
| Padding de audio | `repeatpad` (repetición completa y relleno con ceros) |
| Tamaño del repo | 0.7 GB |

## Arquitectura y entrenamiento

La arquitectura es un dual encoder contraste audio-texto. La torre de audio emplea HTSAT-tiny, un transformer jerárquico con atención por ventanas y un front-end log-mel implementado como convolución con DFT enventanada, banco de filtros mel y logaritmo, todo integrado dentro del propio grafo ONNX. La torre de texto es RoBERTa-base, con tokenizador Hugging Face y truncado a 77 tokens. Ambas torres proyectan a un espacio común de 512 dimensiones con normalización L2.

El entrenamiento original de LAION se realizó sobre LAION-Audio-630K con un objetivo contrastivo audio-texto, siguiendo el paper "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation" (ICASSP 2023). Esta exportación no reentrena ni modifica los pesos: solo convierte los grafos a ONNX y valida la paridad numérica contra la implementación en PyTorch. La validación reportada incluye diferencias máximas absolutas de 1.1e-05 en embeddings de audio fp32, 2.6e-07 en embeddings de texto y 8.1e-06 en probabilidades de etiqueta, con coincidencia del 6/6 en la etiqueta top-1. En int8, la diferencia máxima en probabilidades sube a 1.4e-02 y la similitud coseno mínima baja a 0.998740, manteniendo el 6/6 en top-1. La torre de texto no se ofrece en int8 porque la cuantización dinámica degradaba la similitud coseno hasta aproximadamente 0.96.

## Capacidades

- Clasificación de audio zero-shot mediante etiquetas en lenguaje natural, con puntuación `softmax(logit_scale · audio_embedding @ text_embeddings.T)`.
- Extracción de embeddings de audio de 512 dimensiones L2-normalizados.
- Extracción de embeddings de texto de 512 dimensiones L2-normalizados en el mismo espacio latente.
- Recuperación audio-texto y texto-audio por similitud coseno.
- Procesamiento de clips de 10 s; clips más cortos se repiten y rellenan con ceros, clips más largos se ventanean y promedian.
- Ejecución sin PyTorch mediante onnxruntime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Moderación de contenido audiovisual: clasificar fragmentos de 10 s contra etiquetas como "música", "habla", "ruido" o "silencio" para enrutar o filtrar contenido sin entrenar un clasificador específico.
- Etiquetado automático de archivos de audio: generar embeddings de 512 dimensiones para cada clip y usar similitud contra un vocabulario de etiquetas en lenguaje natural, útil en bibliotecas de sonido y archivos de podcast.
- Búsqueda semántica audio-texto: indexar embeddings de audio y consultar con descripciones textuales ("a dog barking", "rain on a window") usando el mismo espacio latente.
- Detección de eventos acústicos en entornos industriales o urbanos: clasificación zero-shot de sonidos de alarma, maquinaria o tráfico sin dataset etiquetado propio.
- Análisis de llamadas y reuniones: segmentar audio en ventanas de 10 s y clasificar habla de hombre, habla de mujer, música de fondo o ruido para análisis posteriores.
- Despliegue en entornos sin PyTorch: integración en servicios basados en onnxruntime (C++, C#, Java, Node.js) o en dispositivos con recursos limitados usando el grafo int8 de audio.
- Preprocesado para pipelines de ML: usar los embeddings como features de entrada para clasificadores supervisados posteriores o para clustering no supervisado de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de paridad entre la implementación PyTorch y la exportación ONNX:

| Métrica | fp32 | int8 (audio) |
|---|---|---|
| Diferencia máxima absoluta, embedding de audio | 1.1e-05 | 6.7e-03 |
| Coseno mínimo vs PyTorch, embedding de audio | 1.000000 | 0.998740 |
| Diferencia máxima absoluta, embedding de texto | 2.6e-07 | no disponible |
| Diferencia máxima absoluta, probabilidades de etiqueta | 8.1e-06 | 1.4e-02 |
| Coincidencia de etiqueta top-1 | 6 de 6 | 6 de 6 |

Etiqueta top-1 por clip (PyTorch / ONNX fp32): habla de mujer (0.9791), habla de mujer (0.9774), habla de hombre (0.4225), piano (0.4935), ruido blanco (0.5332/0.5333), pitido (0.7187).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo completo ocupa 0.7 GB, por lo que la inferencia cabe holgadamente en GPUs consumer con 4-8 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA para onnxruntime (RTX 3060, RTX 4090, A100, H100); también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; el grafo int8 reduce aún más el requisito.
- Opciones de despliegue: onnxruntime (CPU, CUDA, DirectML, CoreML, TensorRT), sin necesidad de PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto audio | Embedding | Licencia | Formato |
|---|---|---|---|---|---|
| clap-htsat-unfused-onnx (este) | HTSAT-tiny + RoBERTa-base | 10 s | 512 | Apache-2.0 | ONNX |
| laion/clap-htsat-unfused | HTSAT-tiny + RoBERTa-base | 10 s | 512 | Apache-2.0 | PyTorch (safetensors) |
| laion/clap-htsat-fused | HTSAT-tiny + RoBERTa-base con feature fusion | 10 s | 512 | Apache-2.0 | PyTorch |
| laion/larger_clap_general | HTSAT-base + RoBERTa-base | 10 s | 512 | Apache-2.0 | PyTorch |

La diferencia principal frente al checkpoint original es el formato (ONNX frente a PyTorch) y la disponibilidad de un grafo int8 de audio; los pesos son idénticos. Frente a la variante `fused`, este modelo no aplica fusión de features entre modalidades. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, audio ni respuestas; solo embeddings y puntuaciones de similitud.
- El encoder de texto es RoBERTa-base, predominantemente inglés; el rendimiento en etiquetas en otros idiomas no está documentado.
- Ventana de audio fija de 10 s: clips más largos requieren ventaneo y promedio, lo que puede diluir eventos cortos.
- La torre de texto no se ofrece en int8 por la degradación observada (coseno ~0.96); usar fp32 para texto.
- La cuantización int8 del audio introduce un error de hasta 1.4e-02 en probabilidades, aceptable para top-1 pero relevante en umbrales finos.
- Riesgo de sesgo heredado de LAION-Audio-630K y de las etiquetas textuales empleadas; las puntuaciones dependen fuertemente del prompt ("This is a sound of a ...").
- Exportación no oficial: no está respaldada por los autores originales de LAION.
- Licencia Apache-2.0 permite uso comercial, pero el código y checkpoints originales de LAION-AI/CLAP son CC0-1.0; verificar atribución en producciones derivadas.
- Sin garantías de mantenimiento ni soporte por parte del autor del repo (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/clap-htsat-unfused-onnx
- Modelo base: https://huggingface.co/laion/clap-htsat-unfused
- Paper CLAP (ICASSP 2023): https://arxiv.org/abs/2206.04769
- Paper HTS-AT (ICASSP 2022): https://arxiv.org/abs/2202.00874
- Repositorio original LAION-AI/CLAP: https://github.com/LAION-AI/CLAP
- Dataset LAION-Audio-630K: https://github.com/LAION-AI/audio-dataset
