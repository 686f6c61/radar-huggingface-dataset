# f13d/lotus-depth-d-v2-0-disparity-fp16.gguf

## Resumen

El modelo `lotus-depth-d-v2-0-disparity-fp16.gguf` es una conversión al formato GGUF del modelo original `jingheya/lotus-depth-d-v2-0-disparity`, publicada por el usuario f13d en Hugging Face. Se trata de un modelo de estimación de profundidad (depth estimation) y disparidad, derivado del proyecto Lotus (EnVision-Research), un framework de difusión para tareas de predicción densa. Con 947.594.155 parámetros (aproximadamente 948 millones), es un modelo de tamaño medio orientado a visión por computador, no a generación de texto.

La relevancia de esta publicación es acotada: se trata de una conversión de pesos a GGUF en fp16, presumiblemente para su uso con llama.cpp u otras herramientas compatibles con dicho formato, aunque el pipeline declarado no está disponible y el repositorio no registra descargas ni interacciones. La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en pipelines propios.

La información disponible es muy limitada: la model card únicamente enlaza al modelo original y al repositorio de GitHub del proyecto Lotus, sin detallar arquitectura, datos de entrenamiento, benchmarks ni idiomas. Por tanto, buena parte de las especificaciones de esta ficha deben marcarse como no disponibles, y las que se ofrecen proceden de la información estructural del repositorio o del conocimiento general del proyecto Lotus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para prediccion densa segun el proyecto Lotus; no confirmado en la informacion proporcionada) |
| Parametros totales | 947.594.155 (aprox. 948 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (unica variante publicada en este repositorio GGUF) |
| Idiomas soportados | no disponible (modelo de vision, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fp16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la documentación proporcionada. El nombre del modelo y la referencia al proyecto Lotus (EnVision-Research) apuntan a un modelo basado en difusión para estimación de profundidad y disparidad, una línea de trabajo que adapta modelos de difusión de imagen a tareas de predicción densa. El recuento de parámetros (948 M) es coherente con un backbone de tamaño medio, pero no se confirma en la información disponible ni la familia arquitectónica exacta, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO.

Tampoco se documentan innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) en la model card. La única información técnica cierta es el formato de publicación (GGUF fp16) y el número de parámetros. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Estimación de profundidad y disparidad a partir de imágenes, según la denominación del modelo y el proyecto de origen (no verificado en la información disponible).
- Procesamiento de imágenes de entrada para generar mapas densos de profundidad o disparidad (inferido del nombre; no confirmado).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica ni disponible (modelo de visión).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el modelo podría generar mapas de profundidad densos a partir de imágenes para alimentar pipelines de reconstrucción de escena, siempre que se valide su calidad con el modelo original.
- Realidad aumentada y virtual: estimación de profundidad por fotograma para oclusión y colocación de objetos virtuales, aprovechando el tamaño moderado (948 M) que facilita el despliegue en tiempo casi real.
- Segmentación y detección asistida por profundidad: uso de los mapas de disparidad como señal auxiliar en tareas de segmentación semántica o detección de obstáculos.
- Robótica y navegación: estimación de distancia a obstáculos en sistemas embebidos o de bajo consumo, gracias al formato GGUF y al tamaño contenido.
- Post-procesado de vídeo y efectos visuales: generación de mapas de profundidad para desenfoque selectivo, cambio de plano de enfoque o composición.
- Investigación en visión por computador: reproducción de experimentos del proyecto Lotus con pesos en formato GGUF para comparativas de cuantización o despliegue ligero.

En todos los casos, la idoneidad concreta debe validarse contra el modelo original, dado que no hay benchmarks publicados para esta conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,9 GB solo para los pesos (coherente con el tamaño del repositorio), más memoria para activaciones y buffers de inferencia; el total dependerá del tamaño de imagen de entrada y del runtime.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cabría en GPUs consumer con al menos 4-6 GB de VRAM, aunque no se confirma compatibilidad.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño de pesos (aprox. 2 GB en fp16), pero no se documenta en la información proporcionada.
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con llama.cpp y derivados (Ollama, entre otros), aunque no se confirma que dichos runtimes soporten la arquitectura de este modelo de visión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de estimación de profundidad con los que contrastar parámetros, contexto, rendimiento y licencia. El propio modelo original (`jingheya/lotus-depth-d-v2-0-disparity`) sería la referencia natural, pero no se dispone de sus especificaciones detalladas en esta ficha.

## Limitaciones y advertencias

- La model card es mínima: solo enlaza al modelo original y al repositorio de GitHub, sin documentar arquitectura, entrenamiento ni evaluación.
- No hay benchmarks publicados para esta conversión, por lo que se desconoce si la cuantización a fp16 o el formato GGUF degradan la calidad respecto al original.
- El repositorio no registra descargas ni likes, lo que impide inferir validación por parte de la comunidad.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de mapas de profundidad incorrectos en escenas fuera de la distribución de entrenamiento (no documentada).
- Sesgos conocidos: no disponibles; los modelos de profundidad suelen fallar en superficies reflectantes, transparentes o con iluminación extrema, pero no se confirma para este modelo.
- Idiomas: no aplica (modelo de visión); no se documenta el dominio de imágenes ni la resolución de entrada soportada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar la licencia del modelo original enlazado.
- Para producción, es imprescindible validar el modelo contra el original y comprobar que el runtime GGUF elegido soporta realmente esta arquitectura.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/f13d/lotus-depth-d-v2-0-disparity-fp16.gguf
- Modelo original: https://huggingface.co/jingheya/lotus-depth-d-v2-0-disparity
- Repositorio GitHub del proyecto Lotus: https://github.com/EnVision-Research/Lotus
