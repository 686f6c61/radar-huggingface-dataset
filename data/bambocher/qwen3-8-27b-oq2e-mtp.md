# bambocher/Qwen3.8-27B-oQ2e-mtp

## Resumen

Qwen3.8-27B-oQ2e-mtp es una cuantización de precisión mixta publicada por el usuario bambocher sobre HuggingFace, generada con la herramienta oQ de oMLX v0.7.1. No es un modelo entrenado desde cero, sino un checkpoint derivado de un modelo base de la familia Qwen (la etiqueta del repositorio indica `qwen3_5`, mientras que el nombre comercial dice "Qwen3.8", una discrepancia que el autor no aclara en la model card). El resultado es un conjunto de pesos de 27.781 millones de parámetros almacenados en 10,834 GiB, con un promedio efectivo de 3,350 bits por peso.

El interés técnico del repositorio está en su estrategia de cuantización mixta: el 82,3 % de los pesos se guarda a 2 bits afines con grupo de 64 (2,50 bits efectivos), mientras que capas seleccionadas se mantienen a 4, 5 y 8 bits, y un 1,86 % permanece en BF16. Además, el checkpoint conserva dos componentes diferenciados: un codificador visual de 0,461B de parámetros y una cabeza MTP (multi-token prediction) de 0,425B, lo que sugiere que el modelo base es multimodal y está preparado para decodificación especulativa.

Es relevante ahora porque permite ejecutar un modelo de ~27,8B en equipos Apple Silicon con memoria unificada moderada (el repositorio completo ocupa 11,6 GB), un escenario inviable con los pesos en BF16. Ahora bien, la información publicada es mínima: no hay datos de contexto, licencia, idiomas ni benchmarks, y las métricas de descargas y likes son cero, lo que indica un artefacto recién creado y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen (etiqueta `qwen3_5`); incluye codificador visual y cabeza MTP. Detalle interno no disponible |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precisión mixta afín con grupo 64: 2, 4, 5 y 8 bits, más tensores en BF16. Promedio efectivo 3,350 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `mlx`) |

Desglose de la cuantización declarado por el autor:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 2 bits, grupo 64 | 22,864B | 82,300 % | 6,654 GiB | 2,50 |
| Afín 4 bits, grupo 64 | 0,372B | 1,341 % | 0,195 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 2,758B | 9,926 % | 1,766 GiB | 5,50 |
| Afín 8 bits, grupo 64 | 1,271B | 4,576 % | 1,258 GiB | 8,50 |
| BF16 | 0,516B | 1,857 % | 0,961 GiB | 16,00 |
| **Total** | **27,781B** | **100 %** | **10,834 GiB** | **3,350** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 10,397 GB / 9,683 GiB |
| Visión | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| **Total** | **27,781B** | **11,633 GB / 10,834 GiB** |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo base: no se indica el número de tokens utilizados, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por refuerzo. La información disponible se limita a la estructura de pesos observable: un tronco de lenguaje de 26,896B parámetros, un módulo de visión de 0,461B y una cabeza de predicción multi-token (MTP) de 0,425B. La presencia de esta última es la innovación más reseñable a nivel de inferencia, ya que las cabezas MTP se emplean habitualmente para decodificación especulativa, prediciendo varios tokens por paso y acelerando la generación sin cambiar el modelo verificador.

El trabajo técnico del autor es exclusivamente de cuantización. oQ (oMLX v0.7.1) asigna precisión de forma no uniforme: concentra los 22,864B de pesos mayoritarios en 2 bits afines con grupo de 64 y reserva 4, 5 y 8 bits para 4,401B de parámetros, presumiblemente capas sensibles (embeddings,normalizaciones o proyecciones críticas). El codificador visual y la cabeza MTP ocupan posiciones intermedias dentro de ese esquema. No se documenta qué criterio de selección se usó para decidir la precisión de cada tensor ni si hubo calibración con datos, un dato relevante porque la calidad final a 2,50 bits efectivos depende fuertemente de esa elección.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen; el alcance exacto no está documentado en la model card.
- Procesamiento de imagen: el checkpoint incluye un módulo de visión de 0,461B de parámetros, por lo que el modelo base es presumiblemente visión-lenguaje, aunque no se detallan tareas soportadas (OCR, VQA, captioning).
- Decodificación especulativa: la cabeza MTP de 0,425B está diseñada para predecir múltiples tokens y acelerar la inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 11,6 GB permite ejecutar un modelo de 27,8B en un Mac con memoria unificada de 24-32 GB usando mlx-lm, algo imposible con los pesos en BF16 (que ocuparían más de 55 GB).
- Prototipado rápido sin GPUs dedicadas: equipos de desarrollo con portátiles Mac pueden validar prompts, plantillas y flujos conversacionales antes de desplegar la versión completa en servidores con A100/H100.
- Pruebas de decodificación especulativa: la cabeza MTP incluida permite medir ganancias de throughput frente a generación autoregresiva estándar en un entorno MLX, útil para investigación sobre técnicas de aceleración.
- Experimentos de cuantización extrema: sirve como referencia para estudiar la degradación de calidad a 2,50 bits efectivos en modelos de ~28B, comparando con cuantizaciones de 4 y 8 bits del mismo base.
- Evaluación multimodal en local: el módulo de visión permite probar tareas de descripción de imágenes o extracción de información de documentos sin enviar datos a servicios en la nube, siempre que se valide la calidad tras la cuantización.
- Docencia y demos offline: al caber en un portátil, facilita talleres y demostraciones sin conectividad ni infraestructura de servidor, con la advertencia de que la licencia no está declarada y el uso comercial es incierto.
- Baseline para pipelines de evaluación internos: útil como punto de comparación de perplejidad y calidad frente a otras cuantizaciones del mismo modelo base antes de fijar una versión de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni métricas de perplejidad, y tampoco se aportan comparaciones con el modelo base en BF16 o con otras cuantizaciones.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 10,834 GiB (11,633 GB). Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto y del número de capas, dato no publicado; en la práctica, reservar al menos 2-4 GB adicionales.
- Plataforma: la librería declarada es `mlx`, que se ejecuta exclusivamente en Apple Silicon (M1/M2/M3/M4). No hay pesos GGUF ni compatibilidad declarada con CUDA.
- Equipos recomendados: Mac con 32 GB de memoria unificada o más (M1/M2/M3/M4 Pro, Max o Ultra) para trabajar con contexto amplio; 24 GB es el mínimo razonable; 16 GB queda muy justo y obliga a contextos cortos.
- GPUs NVIDIA: no aplicable con este formato; para A100/H100 habría que reconvertir los pesos a otro runtime, algo no documentado por el autor.
- Opciones de despliegue: mlx-lm como runtime de referencia y la propia herramienta oQ/oMLX (github.com/jundot/omlx) para inspección y cuantización. No se indica soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la cabeza MTP está pensada para reducir el número de pasos de decodificación, pero no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Peso en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2e-mtp (este) | 27,781B | Mixta, 3,350 bits/peso efectivos | 11,633 GB | No disponible | No disponible | HuggingFace, MLX |
| Modelo base Qwen de ~27B en BF16 | ~27,8B (presumible) | BF16 | No disponible (estimado >50 GB por el recuento de parámetros) | No disponible | No disponible | No identificado en la información |
| Cuantización uniforme de 4 bits del mismo base | No disponible | 4 bits | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de alternativas concretas (nombres de repositorio, parámetros, contexto o licencia) en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación relevante es interna: este checkpoint reduce el almacenamiento a 10,834 GiB frente a los aproximadamente 55,6 GB que ocuparían 27,781B parámetros en BF16, a costa de bajar a 2,50 bits efectivos en el 82,3 % de los pesos.

## Limitaciones y advertencias

- Cuantización agresiva: el 82,3 % de los pesos está a 2 bits (2,50 bits efectivos). Es previsible una degradación notable en razonamiento, matemáticas y código frente al modelo base, aunque no se publican mediciones que lo cuantifiquen.
- Licencia no declarada: sin licencia explícita en la model card, el uso comercial es jurídicamente incierto y depende de la licencia del modelo base, que tampoco se identifica.
- Ambigüedad sobre el modelo base: el nombre indica "Qwen3.8" y la etiqueta `qwen3_5`. No se enlaza el checkpoint original ni la versión exacta, lo que impide verificar la procedencia y los términos de uso.
- Ausencia de datos de entrenamiento y evaluación: no hay información sobre corpus, idiomas, contexto soportado ni resultados de benchmarks, por lo que no puede validarse su calidad de forma objetiva.
- Riesgo de alucinación: no evaluado. La cuantización de 2 bits puede incrementar la generación de contenido incorrecto o incoherente, especialmente en tareas de varios pasos.
- Contexto desconocido: no se declara la longitud máxima; usar ventanas largas sin verificar puede provocar degradación silenciosa o errores de memoria.
- Dependencia de plataforma: MLX limita el uso a Apple Silicon; no hay ruta documentada para NVIDIA, AMD o CPU, lo que restringe el despliegue en producción a infraestructura concreta.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado con dos minutos de diferencia. No hay validación de la comunidad ni pruebas de terceros.
- Sin garantías de soporte: es una cuantización de autor individual, no una publicación oficial del equipo Qwen; los errores de conversión no están cubiertos por nadie.

## Enlaces

- HuggingFace: https://huggingface.co/bambocher/Qwen3.8-27B-oQ2e-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog, demo o repositorio del modelo base: no disponibles en la información proporcionada.
