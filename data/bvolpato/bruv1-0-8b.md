# bvolpato/bruv1-0.8b

## Resumen

Bruv1-0.8B es un modelo de decisión de texto desarrollado por el usuario bvolpato y obtenido mediante un ajuste fino local sobre Qwen3.5-0.8B. En lugar de generar texto libre, el modelo recibe un estado de evidencia, una pregunta y entre dos y dieciséis opciones etiquetadas, y asigna una puntuación a las letras correspondientes (A–P) para seleccionar la opción correcta. Está orientado a tareas de clasificación, enrutamiento y decisión sobre conjuntos cerrados de etiquetas.

El checkpoint tiene 752.393.024 parámetros (aproximadamente 0,75 mil millones) y se distribuye en formato safetensors, compatible con Hugging Face Transformers, además de un paquete `.kevala` de 855.225.920 bytes para el runtime Kevala. La licencia del modelo es Apache 2.0, heredada de los pesos base de Qwen, mientras que el código de Bruv es MIT y las fuentes de datos originales tienen términos propios.

Su relevancia radica en que un ajuste LoRA de rango 8 y una sola época sobre menos de mil millones de parámetros elevan la precisión en tareas de decisión desde un 37,7 %–63,7 % (modelo base congelado) hasta un 79,1 %–95,4 % según el conjunto, con un coste de entrenamiento de 4.730 pasos de optimizador ejecutados en 1.879 segundos sobre una única RTX 5070 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, etiqueta `qwen3_5_text`) |
| Parametros totales | 752.393.024 (≈0,75 B) |
| Longitud de contexto | no disponible (entrada máxima de 2.048 tokens durante el entrenamiento) |
| Tipos de cuantizacion | BF16 (pesos originales y fusionados); Q8 (pack Kevala `bruv1-0.8b-q8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos base Qwen); código de Bruv MIT; datasets con términos propios |
| Formato de pesos | safetensors; pack `.kevala` |

## Arquitectura y entrenamiento

Bruv1-0.8B parte de Qwen/Qwen3.5-0.8B, revisión `2fc06364715b967f1860aea9cf38778875588b17`, y se ajusta mediante LoRA de rango 8 y alpha 16 aplicado a todas las proyecciones lineales del transformer. El objetivo de entrenamiento es una entropía cruzada calculada únicamente sobre los logits válidos de las letras A–P en la última posición del prompt de chat no-thinking de Qwen definido por Kevala, sin empaquetado de secuencias. Según el autor, este enfoque se diferencia del recetario Tev1 de Together, que usa la finalización completa y la pérdida EOS en lugar de la pérdida condicional sobre la etiqueta.

Los datos provienen de las 37.840 muestras `new-v1` de entrenamiento del recetario Tev1 (revisión `57399714e6b5ef215c9c821cab35a7d5fbc5482b`), con una época y 4.568 registros de desarrollo. Las fuentes son MultiNLI, BoolQ, Banking77, AG News, SST-5, políticas sintéticas, enrutamiento y clasificación de investigación. Los registros con 24 opciones se redujeron de forma determinista a 16 conservando la respuesta correcta. Se emplearon AdamW con tasa de aprendizaje 5e-5, 3 % de warmup, decaimiento coseno, tamaño de lote efectivo 8 (2 × 4 de acumulación), semilla 42, máximo de 2.048 tokens de entrada y pesos en BF16; los 37.840 registros caben sin truncamiento.

El entrenamiento se ejecutó en una NVIDIA GeForce RTX 5070 Ti de 16 GB: 4.730 pasos de optimizador en 1.879 segundos, con un pico de memoria GPU asignada de 6,74 GiB. El SHA-256 de la entrada de entrenamiento es `81eba531a7e49b7846cf94f386cca6b493de103f5a071676579e985db77697a5`.

## Capacidades

- Decisión de opción múltiple: lee un estado de evidencia, una pregunta y entre 2 y 16 opciones etiquetadas, y puntúa las letras A–P para elegir una respuesta.
- Clasificación de texto sobre conjuntos cerrados de etiquetas (sentimiento, intención, tema, implicación).
- Enrutamiento y aplicación de políticas sintéticas: selecciona una acción o ruta entre opciones.
- Clasificación en tareas de investigación (el conjunto de desafío alcanza un 95,4 % de precisión).
- Carga con Hugging Face Transformers mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Integración con Kevala: pack Q8 nativo y API de decisión tipada.
- Idiomas soportados: no disponibles en la información.
- No se documentan tool calling, uso de agentes, visión ni audio.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: dado un mensaje del usuario como evidencia y un conjunto de intenciones posibles, el modelo puntúa las letras de cada opción y devuelve la intención seleccionada.
- Enrutamiento de tickets de soporte: se introduce el ticket como estado de evidencia y se elige entre las categorías o equipos disponibles, aprovechando el entrenamiento específico en datos de enrutamiento.
- Análisis de sentimiento con etiquetas cerradas: clasificar reseñas o comentarios en las cinco clases de SST-5 u otra taxonomía fija.
- Detección de intención bancaria: con datos tipo Banking77, decidir la intención del cliente entre decenas de opciones etiquetadas.
- Inferencia de implicación textual: con registros tipo MultiNLI, decidir la relación entre premisa e hipótesis entre las opciones disponibles.
- Respuesta a preguntas booleanas: con BoolQ, decidir entre "sí" y "no" a partir de un pasaje de evidencia.
- Clasificación temática de noticias: con AG News, asignar el tema correcto entre las opciones.
- Criba documental en investigación: categorización rápida de documentos dentro de una taxonomía cerrada, donde el modelo reporta un 95,4 % de precisión en el conjunto de desafío.

## Benchmarks y rendimiento

Ambas columnas usan pesos BF16 originales o fusionados, el mismo prompt y el mismo scorer de opción directa. La precisión es la fracción de registros con la letra de opción correcta.

| Conjunto | Registros | Qwen congelado | Bruv1-0.8B |
|---|---:|---:|---:|
| Desarrollo | 4.568 | 43,4 % | 84,9 % |
| Test reservado | 2.800 | 37,7 % | 80,1 % |
| Transferencia de políticas y enrutamiento | 1.800 | 30,3 % | 79,1 % |
| Desafío de clasificación de investigación | 768 | 63,7 % | 95,4 % |

Según el autor, estos conjuntos comparten familias de tareas con la mezcla de entrenamiento y no establecen capacidad de razonamiento general, comportamiento de seguridad ni confianza calibrada. El pack Q8 se evaluó de forma separada con fixtures de paridad: en 12 peticiones de referencia igualó los token IDs y la opción seleccionada del modelo FP32 original, con una diferencia máxima absoluta de probabilidad de opción de 0,011643.

## Requisitos de hardware

- Inferencia con pesos BF16: aproximadamente 1,4–1,5 GB solo para los parámetros (752.393.024 × 2 bytes), más activaciones y caché.
- El repositorio ocupa 3,3 GB, lo que sugiere que incluye también otras precisiones además de BF16.
- El pack Q8 de Kevala ocupa 855.225.920 bytes, en torno a 0,8 GB.
- Cabe con holgura en GPU de consumo: el entrenamiento se completó en una RTX 5070 Ti de 16 GB con un pico de 6,74 GiB y lote efectivo 8 sobre secuencias de hasta 2.048 tokens.
- Despliegue confirmado: Hugging Face Transformers (`AutoModelForCausalLM`) y el runtime Kevala con el pack Q8.
- vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (desarrollo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bruv1-0.8B | 752.393.024 | no disponible | 84,9 % | Apache 2.0 (pesos) / MIT (código) | HuggingFace y Kevala |
| Qwen3.5-0.8B (base congelado) | no disponible | no disponible | 43,4 % | Apache 2.0 | HuggingFace |
| Tev1 (recetario de Together) | no disponible | no disponible | no disponible | no disponible | GitHub (recetario, no pesos) |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de decisión, no de generación libre: la generación de texto ordinaria no es el comportamiento evaluado.
- Los conjuntos de evaluación comparten familias de tareas con la mezcla de entrenamiento; no demuestran razonamiento general, seguridad ni confianza calibrada.
- La selección se limita a conjuntos cerrados de entre 2 y 16 opciones.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Sesgos conocidos: no documentados. Los datasets fuente (MultiNLI, BoolQ, Banking77, AG News, SST-5, políticas sintéticas) pueden introducir sesgos propios.
- Riesgo de alucinación: aplicable en la forma de seleccionar una opción incorrecta, dado que la salida es una elección entre candidatas.
- Contexto limitado a 2.048 tokens de entrada durante el entrenamiento; entradas más largas podrían degradar el rendimiento.
- Licencia: los pesos base son Apache 2.0 y el código de Bruv es MIT, pero los datasets subyacentes tienen términos propios. El autor no afirma que todos los datasets subyacentes permitan redistribución comercial sin restricciones.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- Fecha de creación del repositorio: 24 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bvolpato/bruv1-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Kevala: https://github.com/bvolpato/kevala
- Repositorio de Bruv (código de entrenamiento y recetas): https://github.com/bvolpato/bruv
- Recetario Tev1 de Together: https://github.com/togethercomputer/tev1
- Procedencia de datos de Tev1: https://github.com/togethercomputer/tev1/blob/main/DATA_SOURCES.md
- Benchmark de decisión de Kevala: https://github.com/bvolpato/kevala/blob/main/BENCHMARK.md
