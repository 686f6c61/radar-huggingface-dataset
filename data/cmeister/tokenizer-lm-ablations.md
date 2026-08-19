# cmeister/tokenizer-lm-ablations

## Resumen

Este repositorio aloja un conjunto de 220 modelos de lenguaje causales entrenados desde cero con un mismo objetivo experimental: aislar el efecto del tokenizador en el rendimiento de un modelo. Todos comparten arquitectura, corpus de entrenamiento, orden de documentos e hiperparámetros; la única variable controlada es el tokenizador empleado (94 en total, de los cuales 90 se liberan aquí y 4 se citan sin redistribuir). El autor, cmeister, los presenta como material de respaldo para tres trabajos académicos sobre tokenización, evaluación y estudios multilingües.

Los modelos se organizan en cinco regímenes de entrenamiento que varían en tamaño y volumen de datos: desde 0,22B parámetros con 3,5B tokens hasta 1,27B parámetros con 20B tokens. La arquitectura no es una de las integradas en `transformers`, por lo que la carga requiere `trust_remote_code=True`. Aunque el repositorio está etiquetado como `text-generation` y los tags indican soporte multilingüe y de código, su finalidad principal es investigadora, no productiva. La licencia Apache 2.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado (no estándar en `transformers`, requiere `trust_remote_code`) |
| Parametros totales | Varía según régimen: 1,27B (regímenes `std-1B` y `mathcode-20B-from-scratch`), 0,60B (`cross-scale-d16-300M`), 0,38B (`cross-scale-d12`), 0,22B (`cross-scale-d8`) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo de carga usa `dtype="float32"`; no se mencionan cuantizaciones publicadas) |
| Idiomas soportados | No disponibles (los tags indican multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

Los 220 modelos comparten una arquitectura transformer decoder-only definida en un script personalizado (`nanochat_model.py`) que se distribuye en cada subcarpeta. No se detalla si incorpora innovaciones como atención lineal o decodificación especulativa; la información disponible solo indica capas y anchura por régimen (por ejemplo, 24 capas y 1536 de ancho para `std-1B`). El entrenamiento se realizó desde cero, sin adaptación de checkpoints previos, y cada modelo se entrenó con el mismo corpus, orden de documentos y configuración de optimizador dentro de su régimen.

La variable experimental es el tokenizador: 94 tokenizadores que combinan distintos algoritmos (BPE, unigram), pretokenizadores (regex inspirados en GPT-4o, Claude, GPT-2, etc.), normalizadores (NFC o ninguno) y vocabularios de entrenamiento (datos balanceados, multilingües, solo inglés, etc.). El cambio de tokenizador altera la secuencia de tokens resultante, lo que afecta al empaquetado de secuencias y a la cantidad efectiva de texto por ventana de contexto. Este efecto es el objeto de estudio, no una variable de confusión que se elimine. El entrenamiento antepone un token BOS a cada documento; los archivos de tokenizador liberados no incluyen un post-procesador que lo añada automáticamente, por lo que el usuario debe prependerlo manualmente (el BOS id se indica en cada modelo).

## Capacidades

- Generación de texto causal estándar (autoregresiva).
- Soporte multilingüe según los tags del repositorio, aunque no se detallan idiomas específicos.
- Manejo de código fuente, como sugiere el tag `code` y el ejemplo de la model card con una función en Python.
- No se mencionan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio.
- La arquitectura personalizada limita la interoperabilidad con herramientas estándar; requiere `trust_remote_code=True` para cargar.

## Casos de uso

- Investigación académica sobre tokenización: permite comparar directamente cómo distintos tokenizadores afectan al rendimiento de modelos idénticos en arquitectura y datos, ideal para estudiar la interacción entre vocabulario, pretokenización y normalización.
- Evaluación de tokenizadores propios: un equipo que desarrolle un tokenizador personalizado puede entrenar un modelo con él y compararlo contra los 90 tokenizadores liberados, usando los mismos datos y configuración, para medir su calidad relativa.
- Estudio de efectos de escala: los regímenes `cross-scale` (0,22B, 0,38B, 0,60B) permiten analizar cómo el impacto del tokenizador varía con el tamaño del modelo, útil para decidir inversiones en tokenización en proyectos con recursos limitados.
- Análisis de sesgos de tokenización: al variar solo el tokenizador, se puede aislar cómo ciertos pretokenizadores o normalizadores introducen sesgos en el tratamiento de texto multilingüe o de código, información valiosa para diseñar tokenizadores más equitativos.
- Reproducción de experimentos: al liberar 90 tokenizadores y los modelos entrenados, otros investigadores pueden reproducir los resultados de los trabajos asociados (TokEval, estudios cross-lingual) sin reentrenar desde cero.
- Formación y docencia: los modelos pequeños (0,22B) pueden usarse en entornos educativos para demostrar conceptos de tokenización y su influencia en el aprendizaje de representaciones, sin requerir hardware de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. El repositorio se centra en el diseño experimental y la liberación de modelos, no en tablas comparativas de rendimiento.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Basándose en el tamaño de parámetros y el uso de `float32` en el ejemplo de carga, un modelo de 1,27B parámetros requiere aproximadamente 5 GB de VRAM solo para los pesos, más overhead de activaciones y estados del optimizador si se entrena. Para inferencia, una GPU con 8 GB de VRAM (por ejemplo, RTX 3070/4060) sería suficiente, aunque con limitaciones de longitud de contexto.
- Los modelos de 0,60B, 0,38B y 0,22B caben en GPUs de 4-6 GB (como RTX 3060 o incluso integradas con memoria compartida, aunque no recomendable).
- No se mencionan cuantizaciones; si se desea reducir huella, habría que convertir los pesos a formatos como int8 o GGUF, pero no se proporcionan dichos archivos.
- Opciones de despliegue: al ser una arquitectura personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptación. Se puede usar con `transformers` cargando el código remoto, o exportar a ONNX si se dispone de la implementación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo único sino un conjunto de ablaciones diseñado para investigación. No existen modelos comparables directos en el mercado que ofrezcan la misma variación controlada de tokenizadores. Modelos de tamaño similar (1B-2B) como GPT-2 o TinyLlama tienen propósitos distintos y no permiten aislar el efecto del tokenizador. Por tanto, la comparativa no aplica en este contexto.

## Limitaciones y advertencias

- Modelos de investigación, no optimizados para producción: tamaños pequeños (máximo 1,27B) y sin ajuste fino por instrucciones ni RLHF.
- Arquitectura personalizada que requiere `trust_remote_code=True`, lo que introduce riesgos de seguridad al ejecutar código remoto no auditado.
- El tokenizador no añade el token BOS automáticamente; el usuario debe prependerlo manualmente o el modelo recibirá entradas fuera de su distribución de entrenamiento.
- No se han publicado evaluaciones de sesgos, alucinación o robustez; al ser modelos entrenados desde cero con datos no especificados en detalle, podrían presentar sesgos no documentados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento de los modelos en entornos reales.
- El repositorio ocupa 419,8 GB, lo que implica una descarga considerable si se desea acceder a todos los modelos; cada subcarpeta debe descargarse por separado.
- No hay información sobre la longitud de contexto soportada; el ejemplo de carga no especifica la ventana, por lo que se desconoce si hay limitaciones de memoria o de posición.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cmeister/tokenizer-lm-ablations
- No se proporcionan enlaces a los trabajos académicos mencionados (TokEval, estudios cross-lingual) en la información disponible.
