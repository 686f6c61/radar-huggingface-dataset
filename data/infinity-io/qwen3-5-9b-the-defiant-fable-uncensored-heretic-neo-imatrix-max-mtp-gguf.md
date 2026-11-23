# Infinity-io/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) multietapa del modelo Qwen3.5-9B, desarrollado por DavidAU y distribuido en formato GGUF por Infinity-io. El modelo parte de una base Qwen3.5 de 9B parámetros (8.953.803.264 parámetros reales según safetensors) y ha sido sometido a un proceso de "abliteration" y entrenamiento posterior para eliminar los mecanismos de rechazo, dando como resultado un modelo completamente sin censura orientado a instrucciones, razonamiento y escritura creativa.

La variante publicada por Infinity-io es una recuantización GGUF con técnica NEO Imatrix, que incluye tanto cuantizaciones regulares como variantes MTP (multi-token prediction) para acelerar la inferencia. El autor del modelo base afirma que supera a Qwen3.5-27B, Qwen3.6-27B y Qwen3.6-35B-A3B en siete benchmarks clave (ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande), aunque dicha afirmación procede de la model card del autor y no ha sido verificada de forma independiente.

El modelo es relevante para desarrolladores que necesitan un modelo de 9B parámetros desplegable en hardware de consumo, con capacidades de razonamiento en modo thinking, soporte multilingüe en 16 idiomas y comportamiento sin restricciones de contenido. La licencia Apache 2.0 facilita su uso comercial, aunque el carácter "uncensored" plantea consideraciones éticas y de seguridad importantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), con soporte de multi-token prediction (MTP) en las variantes GGUF correspondientes |
| Parámetros totales | 8.953.803.264 (aproximadamente 9B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF en varias precisiones: bf16, mxfp8, mxfp4, Q8_0, Q6, Q4_K_S, entre otras; variantes regulares y MTP; cuantización NEO Imatrix con tensor de salida en 16 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B, sobre la que se aplicó un proceso de ajuste fino multietapa y multi-modelo realizado por DavidAU y Nightmedia en hardware local. Según la model card, se combinaron varios fine-tunes propios de 9B basados en Qwen3.5 mediante técnicas de merge, con el objetivo de elevar la inteligencia general y el seguimiento de instrucciones del modelo. El modelo es de tipo "heretic": fue entrenado después de aplicar el proceso de abliteration, lo que elimina los mecanismos de rechazo y produce un comportamiento sin censura.

Las cuantizaciones GGUF publicadas por Infinity-io emplean la técnica NEO Imatrix, que según el autor mejora la precisión de las cuantizaciones entre un 2 y un 4 % respecto a GGUF convencionales, así como el rendimiento en contexto largo. Además, el tensor de salida (entre el 10 y el 20 % de la salida) se ha convertido a precisión completa de 16 bits en todas las cuantizaciones. Las variantes MTP (multi-token prediction) incorporan tensores MTP en Q8_0 y permiten predecir dos tokens por paso, con tasas de aceptación declaradas en torno al 60 %. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo thinking (bloque de razonamiento compactado y reforzado según el autor).
- Modos de instrucción y de razonamiento conmutables en tiempo de ejecución (según la model card, se han añadido modos adicionales como "Spoon" y "Einstein" en algunas variantes Q6/Q8).
- Generación de código y tareas de programación (etiqueta "coder" en el repositorio).
- Escritura creativa, ficción y roleplaying, sin restricciones de contenido (modelo "uncensored").
- Capacidades multilingües en 16 idiomas, incluidos español, inglés, chino, árabe, hindi, japonés y coreano.
- Pipeline declarado como image-text-to-text, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque no se detallan en la información disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Inferencia acelerada mediante decodificación especulativa con MTP (multi-token prediction) en las variantes GGUF correspondientes.

## Casos de uso

- Generación de ficción y narrativa creativa: el modelo está entrenado sin censura y orientado a escritura, por lo que puede producir relatos, diálogos y contenido adulto sin rechazos, adecuado para plataformas de ficción interactiva o generación de guiones.
- Roleplaying y personajes conversacionales: su naturaleza "uncensored" y su capacidad multilingüe permiten mantener conversaciones de personaje sostenidas en 16 idiomas, útil en videojuegos narrativos o aplicaciones de entretenimiento.
- Asistente de programación local: con 9B parámetros y cuantización Q4, puede ejecutarse en GPU de consumo para autocompletado de código, explicación de fragmentos y generación de tests en entornos de desarrollo sin conexión.
- Razonamiento en modo thinking para tareas analíticas: el bloque de razonamiento reforzado permite abordar problemas de lógica, matemáticas y análisis paso a paso, adecuado para herramientas de apoyo al estudio o la investigación.
- Despliegue en hardware de consumo: gracias a las cuantizaciones GGUF de 4 y 8 bits y a las variantes MTP, puede ejecutarse en estaciones de trabajo con una sola GPU consumer, sirviendo como modelo local para prototipado rápido.
- Procesamiento multilingüe: atención al cliente o traducción asistida en los 16 idiomas soportados, con especial utilidad en mercados con mezcla de idiomas (español, inglés, árabe, hindi, etc.).
- Generación de contenido sin filtros para investigación: útil en estudios sobre sesgos, seguridad de modelos y comportamiento de sistemas sin alineación restrictiva, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y no han sido verificados de forma independiente. Se presentan en modo instruct y con cuantizaciones mxfp8/mxfp4/bf16.

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Defiant-Fable 9B (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Defiant-Fable 9B (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.8-27B (mxfp8) | 0.591 | 0.782 | 0.896 | 0.746 | 0.448 | 0.801 | 0.711 |
| Qwen3.6-27B-Instruct (mxfp8) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |

Según el autor, el modelo supera a Qwen3.5-9B-Instruct en la mayoría de estas métricas y alcanza o supera a modelos de 27B y 35B en varios casos, aunque no en todos los benchmarks. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización Q4_K_S (4 bits), en torno a 9-10 GB en Q8_0 y cerca de 18 GB en bf16 para los pesos, más el espacio de contexto.
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB) para cuantizaciones de 8 bits o bf16; RTX 3060 de 12 GB o RTX 4070 para Q4; A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB de VRAM usando cuantizaciones Q4, y en 16-24 GB para Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; las variantes MTP requieren soporte específico de decodificación especulativa.
- Latencia y throughput: según el autor, la cuantización Q4_K_S regular alcanza aproximadamente 130 tokens por segundo, y las variantes MTP con una tasa de aceptación del 60 % (2 tokens) pueden superar esa cifra. Para temperaturas superiores a 1 o penalties distintos de 1 el rendimiento MTP se degrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este modelo) | ~9B | No disponible | Apache 2.0 | GGUF, safetensors | Sin censura, multilingüe, MTP |
| Qwen3.5-9B-Instruct | ~9B | No disponible | Apache 2.0 (presumiblemente) | Safetensors, GGUF | Base no modificada, con alineación |
| Qwen3.6-27B-Instruct | ~27B | No disponible | No disponible | No disponible | Mayor tamaño, mejores resultados en hswag y wino según la tabla del autor |
| Qwen3.6-35B-A3B-Instruct | ~35B (MoE, A3B activos) | No disponible | No disponible | No disponible | Mayor tamaño, requiere más VRAM |

La comparación se basa exclusivamente en los datos de benchmarks aportados por el autor del modelo base; no se dispone de información independiente sobre contexto, licencia o disponibilidad de los modelos alternativos.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": no aplica filtros de contenido, por lo que puede generar material ofensivo, ilegal o peligroso; requiere salvaguardas externas en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar datos, especialmente en modo instruct sin razonamiento.
- Los benchmarks proceden del autor del modelo base y no han sido verificados de forma independiente; las comparaciones con modelos de 27B y 35B deben tomarse con cautela.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de despliegues con ventanas largas.
- El pipeline declarado es image-text-to-text, pero no se detallan las capacidades multimodales ni su calidad.
- Las variantes MTP requieren configuración específica (temperatura ≤ 1, repetition penalty = 1) y pueden degradarse si la tasa de aceptación de tokens cae por debajo del 50 %.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede conllevar riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El repositorio tiene un tamaño de 204,9 GB, lo que implica una descarga considerable si se quieren todas las cuantizaciones.
- No hay información sobre sesgos específicos más allá de los inherentes al corpus de entrenamiento de Qwen3.5.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelo relacionado de 27B: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Apoyo al autor: https://buymeacoffee.com/davidbelton
