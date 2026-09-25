# FluidInference/gliner2-5-decide-coreml

## Resumen
GLiNER2.5-Decide for Core ML es una exportación a Core ML de la ruta de clasificación del modelo fastino/GLiNER2.5-Decide, publicada por FluidInference. El modelo original fue desarrollado por Fastino bajo licencia Apache-2.0 y esta versión es una conversión realizada por la comunidad Fluid Inference, fijada a la revisión `65624f1a0265b3f612bae66a2685a06b94a68a9d` del checkpoint base.

El paquete contiene el encoder DeBERTa-v3-large junto con el clasificador de etiquetas compartido, con 436.022.273 parámetros exportados. No se exportan las cabezas de spans ni de conteo: esta entrega cubre únicamente clasificación. En una sola llamada el modelo puntúa hasta cuatro cabezas de decisión independientes (por ejemplo intención, urgencia y ruta) sobre el mismo texto, devolviendo logits por cabeza.

Su relevancia radica en que permite ejecutar un clasificador de decisiones de 436 millones de parámetros íntegramente en local sobre Apple Silicon (Neural Engine/CPU/GPU vía Core ML), sin cargar pesos de PyTorch ni enviar datos a la nube, con formas fijas de 128, 256 o 512 tokens y latencias p50 de entre 8 y 63 ms según bucket y precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large + clasificador de etiquetas compartido (ruta de clasificación) |
| Parametros totales | 436.022.273 parametros exportados; tamano del repo 1,8 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Formas fijas por bucket: 128, 256 y 512 tokens |
| Tipos de cuantizacion | fp16 (sin comprimir), w8 (compresion lineal de pesos de 8 bits), lut6 (palettizacion LUT de 6 bits por tensor). Variantes rechazadas: LUT4 por tensor y W8 solo embeddings |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`), compilado por el runtime de Core ML; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento
La arquitectura es un encoder DeBERTa-v3-large al que se le acopla un clasificador de etiquetas compartido. El host tokeniza el esquema con el procesador upstream de GLiNER2 y pasa la posición de cada marcador de etiqueta (`[L]`); el paquete devuelve logits por cabeza. Las cabezas de etiqueta única aplican softmax y las cabezas multi-etiqueta aplican sigmoide con `cls_threshold`, replicando el comportamiento de `classify_text` del modelo nativo. Cada llamada admite hasta cuatro cabezas de decisión simultáneas, especificadas como esquema (por ejemplo `intent`, `urgency`, `route`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base. La innovación técnica de esta entrega es la conversión a Core ML con formas fijas y compresión de pesos: `convert-coreml.py` valida el wrapper de exportación contra los logits nativos con un error de 4,8e-7. Las compresiones w8 y lut6 son weight-only: reducen el tamaño de descarga pero no aceleran la inferencia. La palettización agrupada por canales no se probó porque exige un target de despliegue iOS 18.

## Capacidades
- Clasificación de texto schema-driven: hasta cuatro cabezas de decisión por llamada sobre el mismo texto.
- Clasificación de etiqueta única (softmax) y multi-etiqueta (sigmoide con umbral `cls_threshold`).
- Puntuación de decisiones con etiquetas definidas en tiempo de inferencia (por ejemplo intención, urgencia, ruta, sentimiento y aspectos).
- Ejecución local en Apple Silicon mediante Core ML, sin cargar pesos de PyTorch.
- Soporte de tres niveles de compresión de pesos (fp16, w8, lut6) para ajustar el tamaño de descarga.
- Tres buckets de forma fija (128, 256 y 512 tokens) que cubren el 10,7%, el 95,0% y el 100% de las cabezas del dataset Fast Decisions, respectivamente.
- No exporta las cabezas de spans ni de conteo, por lo que no realiza extracción de entidades ni conteo.
- No hay información sobre tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Idiomas soportados: no disponible.

## Casos de uso
- Clasificación de intención en banca y servicios financieros: el modelo puede recibir etiquetas como `transfer_pending`, `transfer_cancel`, `beneficiary_add` o `card_lost` y clasificar la consulta del cliente en una sola llamada, con latencias p50 de 14,7 ms (fp16, L256) en un M5 Pro.
- Enrutado de tickets de soporte: las cuatro cabezas permiten clasificar simultáneamente categoría, urgencia y equipo destino sobre el mismo texto, evitando múltiples pasadas por el modelo.
- Análisis de sentimiento y aspectos en reseñas de producto: con etiquetas multi-etiqueta como `battery`, `keyboard`, `screen` o `price` y un `cls_threshold` configurable, el modelo devuelve los aspectos mencionados y la polaridad en la misma inferencia.
- Detección de urgencia en atención al cliente: una cabeza dedicada con etiquetas `low`, `normal` y `high` permite priorizar la cola de tickets sin coste de API externa.
- Clasificación on-device en apps iOS/macOS: al ejecutarse sobre Core ML y no cargar pesos de PyTorch, los datos del usuario no salen del dispositivo, lo que encaja con casos con requisitos de privacidad.
- Etiquetado por lotes de datasets de decisión offline: el flujo de reproducción con `score-fast-decisions.py` permite reejecutar el protocolo del dataset Fast Decisions (una llamada por cabeza, coincidencia exacta de conjunto, media de las 17 precisiones por dominio).
- Preprocesado en pipelines de agentes: clasificar la consulta entrante antes de decidir la ruta de ejecución, con un coste de milisegundos por llamada.
- Moderación o triaje de contenido local: clasificación binaria o multietiqueta sobre texto entrante en buckets de 128 tokens (8,2 ms p50 en fp16) para filtrado rápido en el dispositivo.

## Benchmarks y rendimiento

Fast Decisions (split de desarrollo, revision `1a33070c`, 17 dominios x 100 filas, 2.900 cabezas; coincidencia exacta de conjunto, media de las 17 precisiones por dominio; bucket L512):

| Paquete (L512) | Tamano | Media | Pooled | Cabezas cambiadas vs nativo |
|---|---:|---:|---:|---:|
| PyTorch nativo | — | 62,93% | 61,38% | — |
| fp16 | 936 MB | 62,93% | 61,38% | 0 |
| w8 | 477 MB | 63,01% | 61,52% | 7 |
| lut6 | 361 MB | 63,03% | 61,52% | 42 |

Variantes rechazadas: W8 solo embeddings (805 MB, 63,00%), que ahorra poco frente a w8, y LUT4 por tensor (246 MB, 62,26%, 236 cabezas cambiadas, −4 puntos en `paper_field`). El 60,2% publicado en la model card del modelo base corresponde al split de test reservado (300 filas por dominio, no público); la propia card pide que las puntuaciones del split de desarrollo no se reporten como benchmark.

Latencia p50 de 100 llamadas a `predict` en Python para una petición de tres cabezas, compute units `ALL`, en un M5 Pro con macOS 27.0 tras 10 calentamientos:

| Bucket | Tokens | Cabezas x etiquetas | Cabezas de Fast Decisions que encajan | fp16 | w8 | lut6 |
|---|---:|---:|---:|---:|---:|---:|
| L128_H4_K8 | 128 | 4 x 8 | 10,7% | 8,2 ms | 10,1 ms | 9,9 ms |
| L256_H4_K32 | 256 | 4 x 32 | 95,0% | 14,7 ms | 20,6 ms | 17,6 ms |
| L512_H4_K32 | 512 | 4 x 32 | 100% | 44,0 ms | 42,9 ms | 62,9 ms |

Con `CPU_AND_NE` el grafo es mucho más lento que con `ALL`: 689 ms frente a 14,7 ms p50 para fp16 L256. Verificación de paquetes en las primeras 20 filas por dominio que caben en cada bucket: fp16 173/173 y 345/345, w8 172/173 y 345/345, lut6 169/173 y 342/345.

## Requisitos de hardware
- Plataforma objetivo: Apple Silicon (probado en un M5 Pro con macOS 27.0); el runtime de Core ML es obligatorio.
- Huella de pesos por paquete (bucket L512): fp16 936 MB, w8 477 MB, lut6 361 MB. El repo completo ocupa 1,8 GB.
- GPU NVIDIA (A100, H100, RTX 4090) y CUDA: no soportadas por este formato.
- GPU de consumo: no aplica en el sentido habitual; está pensado para Neural Engine y GPU integrada de Apple Silicon.
- Opciones de despliegue: Core ML (`coremltools`), con runtime propio (`runtime.py`, `CoreMLDecide`) que carga únicamente el tokenizador y el paquete `.mlpackage`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Compute units recomendadas: `ALL`; usar `CPU_AND_NE` multiplica la latencia (689 ms frente a 14,7 ms p50 en fp16 L256).
- Latencia: entre 8,2 ms (L128 fp16) y 62,9 ms (L512 lut6) p50 en el hardware de referencia.
- Al descargar con `huggingface_hub.snapshot_download` hay que pasar `local_dir=`, porque la compilación de Core ML rechaza los ficheros de pesos enlazados simbólicamente en la caché por defecto del Hub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en Fast Decisions (dev) | Licencia | Formato / plataforma |
|---|---:|---:|---:|---|---|
| FluidInference/gliner2-5-decide-coreml | 436.022.273 exportados | 128/256/512 tokens | 62,93%–63,03% segun precision | Apache-2.0 | Core ML, Apple Silicon |
| fastino/GLiNER2.5-Decide (nativo) | 436.022.273 exportados | No limitado por buckets fijos | 62,93% (PyTorch nativo) | Apache-2.0 | PyTorch / safetensors |
| FluidInference/gliner2-5-multi-coreml | no disponible | no disponible | no disponible | no disponible | Core ML, Apple Silicon |

No se dispone de resultados de benchmarks comparativos con modelos de otras familias ni con alternativas de clasificacion de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias
- Solo cubre la ruta de clasificación: las cabezas de spans y de conteo no están exportadas, por lo que no puede hacer extracción de entidades ni conteo.
- Formas fijas por bucket: cualquier petición que supere la longitud del bucket lanza `ValueError`, lo que obliga a elegir bucket por adelantado o truncar.
- Idiomas soportados: no disponible; no hay confirmación de cobertura multilingüe en esta exportación.
- Dependencia total de Core ML y Apple Silicon: no es desplegable en CUDA, ROCm ni en servidores x86 convencionales.
- Las cifras de Fast Decisions corresponden al split de desarrollo y no deben presentarse como benchmark oficial; el 60,2% de la card se midió sobre un test reservado no público.
- lut6 altera 42 cabezas respecto al nativo y LUT4 por tensor (rechazado) degradaba `paper_field` en 4 puntos: para producción con requisitos estrictos, fp16 o w8 son opciones más conservadoras (0 y 7 cabezas cambiadas respectivamente sobre L512).
- w8 y lut6 son compresión weight-only: reducen el tamaño de descarga, pero no la latencia de inferencia.
- Licencia Apache-2.0: permite uso comercial con atribución; el modelo base es de Fastino y la conversión de FluidInference.
- Riesgo de sesgo y alucinación: no hay información específica publicada en la información disponible; al tratarse de clasificación con etiquetas cerradas, el riesgo de contenido inventado es menor que en generación abierta, pero la calibración de umbrales en cabezas multi-etiqueta requiere validación propia.
- No se publican métricas de throughput, consumo energético ni rendimiento fuera del hardware de referencia (M5 Pro).

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/FluidInference/gliner2-5-decide-coreml
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Variante multi de FluidInference: https://huggingface.co/FluidInference/gliner2-5-multi-coreml
- Perfil de la organización FluidInference: https://huggingface.co/FluidInference
- Catálogo de modelos de Fluid Inference: https://docs.fluidinference.com/reference/models
- Página del modelo GLiNER2.5 en Fastino: https://fastino.ai/models/gliner2-5
- Repositorio GLiNER2 (GitHub): https://github.com/fastino-ai/GLiNER2
- Dataset de evaluación Fast Decisions: https://huggingface.co/datasets/fastino/fast-decisions
