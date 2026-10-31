# mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF

## Resumen

Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF es un repositorio de cuantizaciones GGUF con matriz de importancia (imatrix, variantes "i1") del modelo xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled, publicado por el cuantizador mradermacher, conocido por su catálogo extenso de cuantizaciones de modelos de la comunidad. El modelo base es un fine-tuning de destilación de razonamiento sobre una variante de 3B de la familia Ministral de Mistral, entrenado con el dataset saidutta69/qwen3.8-max-distillation-50k-clean, que contiene 50.000 ejemplos limpios destilados de un modelo de la serie Qwen orientado a razonamiento.

El propósito del modelo base es dotar de capacidades de razonamiento paso a paso (chain-of-thought / reasoning) a un modelo pequeño y eficiente, de modo que pueda ejecutarse en hardware modesto manteniendo un comportamiento conversacional con razonamiento explícito. La versión de mradermacher no aporta capacidades nuevas: su valor está en la disponibilidad de más de veinte cuantizaciones que van desde IQ1_S (1,0 GB) hasta niveles altos como Q6_K, permitiendo ajustar el equilibrio entre calidad, tamaño y velocidad según el dispositivo.

Es relevante para desarrolladores que quieren un modelo de razonamiento ligero en formato GGUF, compatible con llama.cpp, Ollama, LM Studio y otros runtimes locales. El modelo base tiene 3.429.006.336 parámetros (dato real de safetensors) y se distribuye bajo licencia Apache 2.0. Según la model card, se trata de un modelo de visión (vision model), por lo que los archivos mmproj correspondientes se encuentran en el repositorio estático asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Ministral de Mistral); detalles concretos no disponibles |
| Parametros totales | 3.429.006.336 (~3,43B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (además del archivo imatrix) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de un Ministral 3B de Mistral, una familia de modelos transformer densos de tamaño pequeño orientados a eficiencia en dispositivos con recursos limitados. Sobre esta base se aplicó una destilación de razonamiento: el dataset de entrenamiento, saidutta69/qwen3.8-max-distillation-50k-clean, contiene 50.000 ejemplos generados (y depurados) a partir de un modelo de la serie Qwen especializado en razonamiento, con el objetivo de transferir patrones de razonamiento explícito al modelo pequeño.

El repositorio de mradermacher no modifica los pesos: aplica cuantización GGUF con matriz de importancia (imatrix), técnica que calcula estadísticas de activación sobre un corpus de calibración para minimizar el error de cuantización en los tensores más sensibles. Esto permite que variantes de bajo bit (IQ1/IQ2/IQ3) conserven más calidad que cuantizaciones estáticas equivalentes. No hay información disponible sobre el número de tokens de preentrenamiento, la composición completa del dataset ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Razonamiento paso a paso: el modelo base fue destilado de un modelo Qwen de razonamiento, por lo que está orientado a generar cadenas de razonamiento antes de la respuesta final.
- Conversación: etiquetado como "conversational" en la model card.
- Comprensión visual: la model card de mradermacher indica que es un modelo de visión; los archivos mmproj para usar esta capacidad con llama.cpp están en el repositorio estático asociado.
- Ejecución local eficiente: gracias al formato GGUF y a la amplia gama de cuantizaciones, puede funcionar desde dispositivos muy modestos (1-2 GB de RAM/VRAM en las variantes más agresivas) hasta GPUs de consumo.
- No hay información disponible sobre soporte de tool calling / function calling, capacidades agénticas ni modo de thinking estructurado.

## Casos de uso

- Razonamiento local en portátiles sin GPU: con la variante i1-Q4_K_S (2,2 GB) o i1-IQ4_XS (2,1 GB) se puede ejecutar en CPU con RAM limitada obteniendo el equilibrio óptimo tamaño/calidad señalado por el cuantizador.
- Asistentes conversacionales ligeros: su etiqueta "conversational" y su tamaño de 3B lo hacen adecuado para chatbots locales de baja latencia en aplicaciones de escritorio o móviles.
- Prototipado de sistemas de razonamiento: al destilar patrones de un modelo Qwen de razonamiento, sirve para experimentar con chain-of-thought sin coste de API ni hardware caro.
- Integración en Ollama o LM Studio: los archivos GGUF son directamente compatibles con estos runtimes, ideal para demos y pruebas rápidas en entornos locales.
- Despliegue masivo con coste mínimo: en variantes IQ2/IQ3 (1,2-1,9 GB) puede servirse en GPUs pequeñas para muchos usuarios concurrentes cuando la calidad reducida es aceptable.
- Tareas de comprensión de imágenes locales: si la capacidad de visión del modelo base funciona correctamente con los mmproj del repositorio estático, puede usarse para descripción de imágenes en local.
- Generación del archivo imatrix propio: el archivo imatrix de 0,1 GB permite a usuarios avanzados crear sus propias cuantizaciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos de rendimiento para el modelo base en la model card, por lo que no es posible comparar su calidad de razonamiento con otros modelos destilados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, según la tabla de cuantizaciones):
  - i1-IQ1_S: ~1,0 GB (desesperada, calidad muy degradada)
  - i1-IQ2_M: ~1,4 GB
  - i1-IQ3_M: ~1,8 GB
  - i1-Q4_K_S: ~2,2 GB (equilibrio óptimo tamaño/velocidad/calidad)
  - Cuantizaciones altas (Q5/Q6): aproximadamente 2,5-3 GB (no disponible el tamaño exacto en el fragmento de model card)
  - Añadir margen para el KV cache, que crece con el contexto (longitud no disponible).
- GPUs recomendadas: por su tamaño, cualquier GPU de consumo moderna es suficiente: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, o incluso GPUs integradas con RAM compartida. No se requieren A100 ni H100.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU con 4 GB de VRAM o más usando Q4_K_S o superior; también funciona en CPU pura con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers, aunque no hay confirmación de compatibilidad con vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de ~3B cuantizado, se esperan velocidades altas en CPU moderna y muy altas en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Razonamiento | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled (este) | 3,43B | GGUF (imatrix) | Apache 2.0 | Sí (destilado de Qwen) | Cuantizaciones i1 de mradermacher; visión según model card |
| Qwen3-4B (familia de origen de la destilación) | ~4B | Safetensors, GGUF comunitario | Apache 2.0 | Sí (thinking mode nativo) | Modelo docente con más capacidad validada |
| Ministral 3B oficial de Mistral | ~3B | Safetensors | Restringida (Mistral Research License / comercial) | no disponible | Base original; licencia menos permisiva que esta derivación |

Comparativa orientativa: los datos de rendimiento de los tres modelos no están disponibles en la información proporcionada, por lo que no pueden compararse numéricamente. La ventaja diferencial de esta versión es la licencia Apache 2.0 heredada en el fine-tuning y la granularidad de cuantizaciones disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; no hay soporte declarado para castellano, por lo que el rendimiento en español no está garantizado.
- Cuantizaciones extremas: las variantes IQ1_S/IQ1_M (descritas por el autor como "for the desperate") degradan notablemente la calidad, especialmente en tareas de razonamiento, donde los errores se propagan por cadenas largas.
- Alucinaciones: como todo modelo de 3B, el riesgo de alucinación es alto, especialmente en razonamiento matemático o factual; el entrenamiento de destilación con 50k ejemplos es reducido frente a modelos comerciales.
- Procedencia comunitaria: el modelo base es un fine-tuning de terceros (xtools-at) y el dataset de destilación es de un autor independiente; no hay auditoría de calidad de los datos de entrenamiento.
- Contexto: la longitud de contexto no está documentada; verificarla antes de diseñar aplicaciones con documentos largos.
- Visión: la condición de modelo de visión procede del comentario de mradermacher; la funcionalidad real depende del modelo base y requiere los mmproj del repositorio estático.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original de Mistral, ya que las restricciones del modelo fundacional podrían aplicar según interpretación.
- Sin benchmarks publicados: no hay forma de validar objetivamente la calidad del razonamiento destilado antes de evaluarlo uno mismo.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF
- Modelo base: https://huggingface.co/xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled
- Dataset de destilación: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
