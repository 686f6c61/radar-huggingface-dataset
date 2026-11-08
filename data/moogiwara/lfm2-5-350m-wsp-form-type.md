# Moogiwara/lfm2.5-350m-wsp-form-type

## Resumen

Moogiwara/lfm2.5-350m-wsp-form-type es un derivado experimental del modelo LiquidAI/LFM2.5-350M en el que se han editado directamente los pesos para mejorar una tarea muy concreta: la selección del tipo de formulario canónico en documentos de reclamaciones de seguros. La edición, denominada weight-space programming (WSP), reutiliza cuatro unidades existentes del último bloque feed-forward (capa 15) y no añade parámetros ni modifica la arquitectura ni el tokenizador. El checkpoint resultante tiene 354.483.968 parámetros en BF16 y se distribuye en formato safetensors para Transformers.

El modelo base, LFM2.5-350M de Liquid AI, es un modelo de texto compacto orientado a dispositivos con recursos limitados, que funciona con menos de 1 GB de memoria y mejora las capacidades de chat, seguimiento de instrucciones y tool calling de LFM2-350M gracias a un preentrenamiento extendido y aprendizaje por refuerzo. Sobre esa base, la edición de Moogiwara actúa como una intervención quirúrgica sobre la representación interna del modelo para sesgar la decisión hacia uno de cuatro tipos de formulario, sin tocar el resto del comportamiento.

Es relevante ahora como artefacto de investigación: demuestra que es posible modificar el comportamiento de un modelo pequeño mediante edición localizada de pesos en lugar de fine-tuning completo, con un manifiesto reproducible (WSP_EDIT.json) y un protocolo de evaluación documentado. No obstante, sus resultados son locales al proyecto, la mejora es específica de un esquema y tarea, y la tasa de validez de esquema JSON en held-out sigue siendo del 4,1 %, por lo que no debe confundirse con una solución de extracción estructurada fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2.5 (modelo base LiquidAI/LFM2.5-350M), con edición de pesos en la capa 15 (feed-forward) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el checkpoint publicado es BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0), con limitación de uso comercial |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-350M, un transformer compacto de Liquid AI diseñado para edge devices, con preentrenamiento extendido y aprendizaje por refuerzo respecto a LFM2-350M. Sobre esa arquitectura, Moogiwara aplica una edición de pesos (weight-space programming) que reutiliza cuatro unidades existentes en `model.layers.15.feed_forward`: las unidades 34, 235, 4572 y 2265. Concretamente, las filas correspondientes de `w1.weight` actúan como puerta de decisión en la posición de decisión, las filas de `w3.weight` leen los cuatro tipos de formulario canónicos y las columnas de `w2.weight` escriben la dirección de la etiqueta seleccionada en el residual stream. La edición no añade parámetros ni altera la arquitectura ni el tokenizador.

No se ha realizado un entrenamiento completo ni un fine-tuning supervisado del modelo: la intervención es puramente localizada sobre pesos existentes. El manifiesto `WSP_EDIT.json` registra los hashes de los parámetros base y editados, y el modelo original corresponde a `LiquidAI/LFM2.5-350M` en la revisión `9921cd4d82c0e3986887aa4b376f9446729ef8a3`. La evaluación del proyecto se realizó con Transformers 5.22.2 y PyTorch 2.7.1+cu128, con inferencia greedy en BF16. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre la composición de datos usada en la edición.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones heredados del modelo base LFM2.5-350M.
- Tool calling y function calling, según las capacidades declaradas del modelo base LFM2.5-350M.
- Selección de tipo de formulario canónico en documentos de reclamaciones de seguros (tarea objetivo de la edición), con cuatro tipos canónicos.
- Extracción estructurada limitada: el modelo sigue siendo débil en cumplimiento de esquema JSON, claves requeridas, fechas y manejo de campos ausentes.
- Razonamiento multi-paso y agentes: no confirmado para este derivado; el modelo base está orientado a edge devices y no se documentan capacidades agénticas específicas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo base es de texto.

## Casos de uso

- Clasificación de tipo de formulario en pipelines de siniestros: el modelo puede usarse como clasificador de `form_type` dentro de un flujo de extracción de documentos de seguros, aprovechando la edición para reducir errores de selección de tipo en textos de reclamaciones. Es adecuado porque la edición está específicamente orientada a esa decisión, aunque requiere revisión posterior.
- Investigación sobre weight-space programming: sirve como caso de estudio reproducible para analizar cómo una edición localizada en cuatro unidades de una capa feed-forward altera una decisión semántica concreta, comparando el checkpoint editado con el original y consultando el manifiesto de hashes.
- Prototipado de extracción estructurada en dominios de seguros: puede integrarse en un prototipo que procese texto de formularios de reclamaciones y devuelva un tipo de formulario, siempre con validación de esquema externa y revisión humana antes de uso operativo.
- Evaluación comparativa de técnicas de edición de pesos: el checkpoint permite reproducir el protocolo del proyecto (FieldBench local, inferencia greedy BF16) y medir el impacto de la edición frente al modelo base en métricas de F1 de campos y controles de coincidencia exacta.
- Docencia y demostración de limitaciones de modelos pequeños: útil para ilustrar que una mejora en una métrica concreta (errores de tipo de formulario de 61/61 a 27/61 en desarrollo) no implica una mejora general de fiabilidad, dado que la tasa de esquema válido en held-out se mantiene en 4,1 %.
- Filtrado previo en sistemas de gestión documental: puede emplearse como primera etapa para etiquetar el tipo de formulario y enrutar el documento a un extractor especializado, con la advertencia de que la precisión en held-out es de 15/30 errores, insuficiente para automatización sin supervisión.

## Benchmarks y rendimiento

Resultados reportados por el autor en FieldBench con inferencia greedy BF16 (puntuaciones del scorer del proyecto, no del leaderboard de FieldBench):

| Metrica | Modelo original | Modelo editado |
|---|---:|---:|
| Errores de tipo de formulario en test de desarrollo (61 formularios) | 61/61 | 27/61 |
| Errores de tipo de formulario en held-out (30 formularios) | 30/30 | 15/30 |
| Field F1, 200 casos de desarrollo | 0.2786 | 0.3102 |
| Field F1, 49 casos held-out | 0.3547 | 0.3883 |
| Controles de coincidencia exacta no relacionados | 70/100 | 69/100 |
| Array row F1 | 0.5893 | 0.5893 |
| Null-array accuracy | 0/10 | 0/10 |
| Tasa de esquema válido en held-out | 4.1% | 4.1% |

El autor advierte que el conjunto held-out es pequeño y que se evaluaron cinco ediciones candidatas antes de abrirlo, lo que debilita la fuerza confirmatoria. La caída de una respuesta en los controles no relacionados está exactamente en el límite predeclarado de 1 punto porcentual.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base LFM2.5-350M funciona con menos de 1 GB de memoria según Liquid AI; el checkpoint editado en BF16 ocupa aproximadamente 0,7 GB en disco.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe en GPUs consumer con al menos 2 GB de VRAM, aunque no se documentan modelos concretos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 2 GB o más de VRAM, dado el tamaño de 354 M de parámetros; no confirmado por el autor.
- Opciones de despliegue: Transformers (versión compatible, el proyecto usó 5.22.2) con PyTorch 2.7.1+cu128; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Moogiwara/lfm2.5-350m-wsp-form-type | 354.483.968 | no disponible | lfm1.0 (uso comercial limitado) | Hugging Face, checkpoint BF16 | Edición WSP específica para tipo de formulario de seguros |
| LiquidAI/LFM2.5-350M | 350M (aprox.) | no disponible | lfm1.0 | Hugging Face, modelo oficial | Modelo base; menor rendimiento en tipo de formulario según el autor |
| LFM2-350M | 350M (aprox.) | no disponible | no disponible | Hugging Face | Predecesor del base; peor chat, instrucciones y tool calling según Liquid AI |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoría de extracción estructurada.

## Limitaciones y advertencias

- La evaluación cubre únicamente texto de documentos de seguros; no se debe asumir que la mejora se transfiera a otros esquemas, tareas, OCR o diseños de documentos.
- El modelo sigue siendo débil en cumplimiento de esquema JSON, claves requeridas, fechas, manejo de campos ausentes y extracción general; la tasa de esquema válido en held-out es del 4,1 %.
- La edición se dirige solo a `form_type`; no es una corrección general de fiabilidad ni de precisión.
- El conjunto held-out es pequeño (30 formularios) y se evaluaron cinco candidatas antes de abrirlo, lo que reduce la solidez confirmatoria de los resultados.
- La caída de una respuesta en controles no relacionados (70/100 a 69/100) está en el límite predeclarado de 1 punto porcentual, lo que sugiere un posible efecto colateral leve.
- Licencia LFM Open License v1.0 con limitación de uso comercial; es imprescindible revisar los términos antes de cualquier uso en producción.
- No es un modelo oficial de Liquid AI; es un checkpoint redistribuido y editado por un tercero.
- Riesgo de alucinación y sesgos: no documentado específicamente para este derivado; aplican los del modelo base, no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moogiwara/lfm2.5-350m-wsp-form-type
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Documentación de LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Repositorio de reproducibilidad: https://github.com/love-droid/wsp-semantic-mapper
- Registro completo del proyecto: `docs/wsp-full-record.md` (en el repositorio anterior)
- Resumen de resultados: `docs/wsp-results-summary.md` (en el repositorio anterior)
- Manifiesto de la edición: `WSP_EDIT.json` (en el repositorio de Hugging Face)
- Licencia: `LICENSE` (en el repositorio de Hugging Face)
