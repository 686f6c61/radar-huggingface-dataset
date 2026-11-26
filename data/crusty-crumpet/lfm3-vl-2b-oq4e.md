# crusty-crumpet/LFM3-VL-2B-oQ4e

## Resumen

LFM3-VL-2B-oQ4e es una cuantización mixta del modelo multimodal LFM3-VL-2B, publicada por el usuario crusty-crumpet en Hugging Face. El checkpoint original pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) de Liquid AI, un modelo de lenguaje con capacidades de visión de aproximadamente 1.918 millones de parámetros. Esta versión concreta ha sido procesada con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple Silicon.

El resultado es un checkpoint de 1,4 GB con un promedio efectivo de 5,907 bits por peso, que combina capas en 4, 5, 6 y 8 bits con un 9,9% de los pesos mantenidos en BF16. La distribución no es uniforme: el 64% de los pesos lógicos se almacena en 4 bits y el bloque de visión (0,189B parámetros) se conserva íntegramente en BF16, lo que preserva la calidad de la torre visual a costa de algo más de espacio.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras cuantizaciones mixtas publicadas para LFM3-VL-2B en formato MLX, lo que permite ejecutar un modelo visión-lenguaje de ~2B en equipos Apple Silicon con memoria unificada modesta; por otro, ilustra las decisiones de compromiso (bits por capa) que toma oQ y que conviene conocer antes de desplegar el modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal con torre de visión); detalles internos no disponibles |
| Parametros totales | 1.918.181.888 (~1,92B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16; promedio efectivo 5,907 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, `custom_code`), librería `mlx` |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base LFM3-VL-2B. La información disponible no detalla la arquitectura interna del modelo original (número de capas, tipo de atención, composición del dataset de entrenamiento, uso de RLHF/DPO, etc.), por lo que estos datos deben consultarse en la model card del modelo base de Liquid AI. Lo que sí se conoce es la estructura de la cuantización: el bloque de lenguaje concentra 1,729B parámetros en 1,038 GB, mientras que la torre de visión aporta 0,189B parámetros en 0,379 GB.

La innovación técnica de esta publicación es el esquema de precisión mixta de oQ (oMLX v0.7.3). La distribución por almacenamiento es la siguiente: 1,229B pesos lógicos en affine 4-bit grupo 64 (64,079% del total, 0,644 GiB, 4,50 bits/peso efectivos), 0,482B en 5-bit (25,146%, 0,309 GiB, 5,50 bits/peso), 0,017B en 6-bit (0,875%, 0,013 GiB), una cantidad marginal en 8-bit (0,007%) y 0,190B en BF16 (9,893%, 0,353 GiB). El resultado es un checkpoint de 1,319 GiB con 5,907 bits/peso de media, sustancialmente más eficiente que un 8-bit uniforme y con mayor fidelidad que un 4-bit uniforme, especialmente en la parte visual.

## Capacidades

- Generación de texto multimodal: al tratarse de un modelo VL, se espera que procese imágenes junto con instrucciones textuales, aunque la model card no detalla tareas concretas.
- Comprensión de imagen: la torre de visión se conserva en BF16, lo que sugiere que el autor priorizó la calidad de la percepción visual frente a la compresión agresiva.
- Ejecución en Apple Silicon: el formato MLX y la cuantización permiten inferencia local en Macs con memoria unificada.
- Capacidades de tool calling, function calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes visuales en Mac: el checkpoint de 1,4 GB se carga en MLX y permite probar un pipeline imagen-pregunta-respuesta en un MacBook con 16 GB de memoria unificada sin depender de la nube.
- Análisis de capturas y documentos escaneados en escritorio: la torre de visión en BF16 favorece la lectura de texto en imagen; útil para extraer información de facturas o formularios en un flujo local.
- Etiquetado asistido de imágenes en investigación: el modelo puede generar descripciones o responder preguntas sobre lotes de imágenes, y su tamaño reducido permite ejecutarlo en paralelo con otras herramientas en el mismo equipo.
- Evaluación comparativa de cuantizaciones: este checkpoint sirve como referencia para medir la pérdida de calidad frente al modelo base en tareas visuales, dado que conserva la visión en BF16 y comprime el lenguaje.
- Docencia y demostraciones de multimodalidad: el tamaño del repo (1,4 GB) y la librería MLX facilitan su distribución en entornos académicos con hardware Apple.
- Integración en aplicaciones de escritorio macOS: mediante MLX se puede embeber el modelo en una app nativa para tareas de descripción de imágenes o accesibilidad (por ejemplo, lectura de contenido visual para usuarios con discapacidad visual), siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~1,4 GB solo para los pesos; con overhead de ejecución (KV cache, activaciones) conviene reservar al menos 3-4 GB para contexto corto y más si el contexto es largo (longitud de contexto no disponible).
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es un checkpoint pensado para CUDA.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con memoria unificada de 8 GB o más; en el lado NVIDIA no aplica directamente por el formato MLX.
- Opciones de despliegue: `mlx` / `mlx-lm` (con soporte de `custom_code`), y herramientas del ecosistema oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-oQ4e (este) | 1,92B | no disponible | safetensors MLX, cuantización mixta | no disponible | Cuantización comunitaria de oQ |
| LFM3-VL-2B (base) | ~1,92B | no disponible | safetensors | no disponible | Modelo original de Liquid AI; referencia de calidad |
| Otras cuantizaciones 4-bit del mismo base | ~1,92B | no disponible | GGUF / MLX según autor | depende del publicador | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización mixta introduce pérdida de precisión respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El 64% de los pesos lógicos está en 4 bits, lo que puede afectar a tareas de razonamiento o generación de código; la torre de visión en BF16 mitiga el riesgo en tareas visuales, pero no lo elimina.
- La licencia no está indicada en la información disponible; antes de un uso comercial debe verificarse la licencia del modelo base LFM3-VL-2B de Liquid AI.
- Es un checkpoint comunitario (0 descargas, 0 likes en el momento de la consulta) sin validación externa; conviene tratarlo como experimental.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversión.
- No se dispone de información sobre sesgos, idiomas soportados, riesgo de alucinación ni longitud de contexto, por lo que no pueden evaluarse estos aspectos con los datos actuales.
- La model card advierte de que el modelo fue recuantizado el 2026-11-25 con oMLX v0.7.3 y que las copias anteriores deben descargarse de nuevo.

## Enlaces

- Hugging Face: https://huggingface.co/crusty-crumpet/LFM3-VL-2B-oQ4e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Modelo base LFM3-VL-2B de Liquid AI: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
