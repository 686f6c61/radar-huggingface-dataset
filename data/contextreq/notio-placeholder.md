# ContextReq/Notio-PLACEHOLDER

## Resumen

Notio2 es un modelo de lenguaje recurrente minimalista desarrollado por ContextReq, identificado en HuggingFace como `ContextReq/Notio-PLACEHOLDER`. Está diseñado para generar texto en inglés a partir de un vocabulario de 1.024 tokens, utilizando una arquitectura basada en bloques GRU con una dimensión de modelo de 256, un total de 1.315.328 parámetros y una ventana de contexto de 1.024 tokens. El modelo se encuentra en estado de desarrollo (INPROGRESS) y se ha entrenado sobre un corpus de 2.350 libros infantiles de dominio público del Proyecto Gutenberg, seleccionados y limpiados específicamente para este proyecto.

La relevancia de Notio2 radica en su enfoque experimental: en lugar de emplear arquitecturas transformer, explora las capacidades de los modelos recurrentes de muy pequeña escala para el modelado de lenguaje. El proyecto hace especial hincapié en la reproducibilidad y la verificación, con scripts que comprueban la integridad de los datos y del entrenamiento. No está pensado para producción, sino para investigación y experimentación en el ámbito de los modelos de lenguaje compactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GRU (recurrente), d_model=256, pre-LayerNorm + residual, variante "gg" baseline y "aggg" híbrida con atención de ventana deslizante |
| Parámetros totales | 1.315.328 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoints (.pt) |
| Vocabulario | 1.024 tokens (7 marcas de límite/espacio, 94 caracteres ASCII, 923 subpalabras) |
| Dataset de entrenamiento | ContextReq/Project_Gutenburg_Shelf_636_UNFILTERED y ContextReq/Project_Gutenburg_Shelf_636_TRAIN_READY |
| Tamaño del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

Notio2 se compone de una capa de embeddings (`wte` + `wpe`, ambos de 1.024×256) con pesos atados a la cabeza de salida, seguida de una pila de bloques GRU con pre-LayerNorm y conexiones residuales. La configuración baseline ("gg") utiliza dos bloques GRU, mientras que la variante híbrida ("aggg") añade un bloque de atención con ventana deslizante. La cabeza es una capa LayerNorm seguida de `lm_head`, también atada a los embeddings. El contexto es de 1.024 tokens y el entrenamiento emplea BPTT truncado con estado que se lleva y desacopla en los límites de ventana (k1 = k2 = 1.024). La pila es modular: capa 0 (datos), capa 1 (embedding), patrón de bloques y capa última (head), ensamblada en `model/assemble.py`.

El corpus de entrenamiento está formado por unos 5.000 libros infantiles de dominio público del Proyecto Gutenberg, reducidos a 2.350 tras un proceso de limpieza que incluye eliminación de boilerplate, normalización de formato, filtrado de idiomas no ingleses y deduplicación. Los libros se codifican en un único flujo de ids de 189.346.083 tokens para entrenamiento y 9.997.820 para validación, con cada libro envuelto en las marcas Ē (bos) y Ĕ (eos) y los espacios en blanco representados como glifos explícitos. El entrenamiento usa AdamW con grad-clip de 1.0, lr 3e-4, warmup de 500 pasos y decaimiento coseno hasta lr/10, con batch de 32×1.024 tokens por paso. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto en inglés a partir de un vocabulario de 1.024 tokens, con muestreo por temperatura y top-k.
- Modelado de lenguaje recurrente con BPTT truncado, capaz de mantener estado a través de ventanas de 1.024 tokens.
- Tokenización híbrida: combina caracteres ASCII, marcas de espacio en blanco y subpalabras extraídas de las 10.000 palabras inglesas más comunes.
- Verificación byte-exacta: el pipeline de datos garantiza que la re-tokenización reproduce los ids de entrenamiento y validación sin pérdida, y que el decodificador `ids2txt.py` reproduce los ficheros binarios originales.
- Soporte de scripts de entrenamiento y muestreo en PyTorch (`train.py`, `sample_ckpt.py`) con opción de verificación de invariantes.
- No soporta tool calling, visión, audio ni otras modalidades; es exclusivamente un modelo de texto.

## Casos de uso

- Generación de cuentos infantiles en estilo clásico: el modelo puede producir texto que imita la prosa de libros infantiles de 1850-1925. Se usaría mediante `sample_ckpt.py` con un checkpoint entrenado, ajustando temperatura 0.7 y top-k 40 para mitigar bucles de repetición. Es adecuado porque el corpus de entrenamiento es precisamente literatura infantil clásica.
- Investigación en arquitecturas recurrentes de pequeña escala: sirve como baseline para comparar el comportamiento de RNNs frente a transformers en tareas de modelado de lenguaje. Su tamaño de 1.3M parámetros permite experimentos rápidos y reproducibles, con scripts de verificación que aseguran la integridad del entrenamiento.
- Educación en modelado de lenguaje: por su simplicidad y tamaño, es útil para enseñar los fundamentos del entrenamiento de modelos de lenguaje, tokenización, BPTT y verificación de datos. Los scripts están documentados y el pipeline es modular.
- Exploración de tokenización compacta: el vocabulario de 1.024 tokens, con subpalabras y marcas de espacio explícitas, permite estudiar cómo afecta la tokenización al rendimiento y a la calidad del texto generado.
- Recreación de estilos literarios históricos: puede usarse para generar texto que imite la prosa de autores como Lewis Carroll, L. Frank Baum o los hermanos Grimm, dado que el corpus contiene obras de estos autores. Es adecuado para proyectos de humanidades digitales.
- Benchmarking de eficiencia en hardware de bajo consumo: al tener solo 1.3M de parámetros, es posible ejecutarlo en CPU o GPUs modestas. Esto permite medir throughput y latencia en entornos sin GPU dedicada, útil para sistemas embebidos o aplicaciones educativas.
- Análisis de modos de fallo en modelos recurrentes pequeños: el modelo presenta fallos conocidos como bucles de repetición a baja temperatura, intercambio de entidades y tramas inventadas. Puede usarse como caso de estudio para investigar estos fenómenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos son de verificación del corpus (2.350 libros balanceados Ē/Ĕ, 1.013 de 1.024 ids utilizados, 0 tokens desconocidos, 0 bytes de newline crudo), que no constituyen benchmarks de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 1.315.328 parámetros, por lo que la memoria necesaria para los pesos es mínima (aproximadamente 5 MB en fp32), pero no hay datos oficiales de VRAM.
- GPU recomendadas: no disponible. Dada la pequeña escala, no se requiere GPU dedicada; la inferencia es viable en CPU.
- Cabida en GPU de consumo: sí, cualquier GPU moderna (incluso integradas) puede ejecutar el modelo, aunque no hay datos oficiales.
- Opciones de despliegue: scripts de PyTorch (`train.py`, `sample_ckpt.py`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card menciona los modelos predecesores `basically-experimental/Notio-3.7M-RNN-v1` y la colección "Pebble" de Hoglet-33, pero no se proporcionan datos comparativos de rendimiento, parámetros o licencia en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus contiene lenguaje y actitudes típicas de la época (1850-1925), que pueden no reflejar estándares modernos. Aunque se hicieron esfuerzos de limpieza, puede quedar contenido problemático.
- Riesgo de alucinación: la model card indica que el modelo muestra "dream-logic, entity swaps, and invented plots" (lógica onírica, intercambios de entidades y tramas inventadas) debido a su pequeña capacidad.
- Limitaciones de contexto e idioma: solo inglés, vocabulario fijo de 1.024 tokens, ventana de contexto de 1.024 tokens.
- Bucles de repetición: son un modo de fallo conocido a baja temperatura; se recomienda muestrear con top-k.
- Estado de desarrollo: el modelo está marcado como INPROGRESS, por lo que no debe usarse en producción sin una evaluación exhaustiva.
- Renderizado en runtime: el modelo solo genera ids de token; la conversión a texto legible requiere el decodificador `ids2txt.py`, lo que añade una capa de dependencia.
- Licencia Apache 2.0: permite uso comercial, pero es necesario conservar el aviso de licencia y atribución.

## Enlaces

- HuggingFace: https://huggingface.co/ContextReq/Notio-PLACEHOLDER
- Modelo predecesor: https://huggingface.co/basically-experimental/Notio-3.7M-RNN-v1
- Colección Pebble: https://huggingface.co/collections/basically-ai/pebble
- Dataset UNFILTERED: https://huggingface.co/datasets/ContextReq/Project_Gutenburg_Shelf_636_UNFILTERED
- Dataset TRAIN_READY: https://huggingface.co/datasets/ContextReq/Project_Gutenburg_Shelf_636_TRAIN_READY
