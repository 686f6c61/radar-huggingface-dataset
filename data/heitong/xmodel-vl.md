# heitong/xmodel-vl

## Resumen

xmodel-vl es un modelo vision-lenguaje especializado en segmentación temporal de acciones en vídeo en primera persona (egocentric). Desarrollado por el usuario heitong, parte del modelo base Qwen/Qwen3.5-VL-27B y se ajusta mediante LoRA en dos fases para una tarea muy concreta: dada una secuencia de fotogramas muestreados uniformemente de un vídeo egocéntrico, devolver un array JSON con subtareas de acción delimitadas por tiempos de inicio y fin en segundos. El modelo resuelve el problema de la segmentación temporal densa de acciones, una tarea clave en robótica de asistencia, análisis de tareas industriales y datasets de vídeo egocéntrico.

Arquitectura basada en Qwen3.5-VL con atención lineal híbrida (GDN), aproximadamente 27B parámetros en BF16 y capacidad multimodal de imagen y vídeo. El entrenamiento combina SFT sobre 2871 muestras de segmentación alineadas en granularidad (egodemo 1520 + EPIC-KITCHENS-100 1351) y un refinamiento con GRPO usando una recompensa puramente temporal (F1@50 como señal principal más regularización del número de segmentos). Los pesos publicados son el resultado de fusionar el adaptador SFT con el de GRPO, por lo que se cargan directamente sin adaptadores adicionales.

Su relevancia radica en que mejora de forma sustancial las métricas temporales del modelo base en el conjunto de test de egodemo: F1@50 pasa de 0,515 a 0,766, el MAE de fronteras baja de 4,26 s a 2,60 s y la ratio de segmentos se acerca a 1 (1,11 frente a 1,72). Además, la evaluación se apoya solo en métricas temporales duras, sin juez modelo, lo que reduce el riesgo de evaluación circular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-VL con atención lineal híbrida (GDN), multimodal |
| Parametros totales | ~27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers, `AutoModelForImageTextToText`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-VL, un transformer multimodal con atención lineal híbrida (GDN) y unos 27B parámetros en BF16. Sobre esta base se aplica un ajuste LoRA en dos etapas. La primera es un SFT supervisado sobre 2871 muestras de segmentación de vídeo egocéntrico con granularidad alineada: 1520 de egodemo y 1351 de EPIC-KITCHENS-100, donde las acciones de EPIC se fusionan y alinean a segmentos de aproximadamente 15 s para igualar la granularidad de subtarea de egodemo. La segunda etapa es un refinamiento con GRPO inicializado desde el adaptador SFT, usando una recompensa puramente temporal centrada en F1@50 más una regularización del número de segmentos.

La innovación principal es el uso de una recompensa puramente temporal para el refinamiento por RL, sin juez modelo, lo que evita la evaluación circular y empuja directamente la precisión de las fronteras temporales. Los pesos publicados fusionan los adaptadores SFT y GRPO en un modelo completo listo para inferencia. La entrada esperada son fotogramas muestreados uniformemente (se recomiendan 32) con sus marcas de tiempo, y la salida es un array JSON de subtareas con descripción y tiempos.

## Capacidades

- Segmentación temporal de acciones en vídeo egocéntrico, con salida JSON de subtareas (descripción, inicio y fin en segundos).
- Comprensión de imagen y vídeo (pipeline `video-text-to-text`, `image-text-to-text`).
- Razonamiento multimodal sobre secuencias de fotogramas con marcas de tiempo.
- Generación estructurada en JSON siguiendo instrucciones.
- Capacidades multilingües limitadas a chino e inglés.
- Ajuste fino específico para granularidad de subtarea (aprox. 10-25 s por segmento).

## Casos de uso

- Análisis de tareas egocéntricas en investigación: procesar vídeos de egodemo o EPIC-KITCHENS para obtener una segmentación automática de subtareas y acelerar el etiquetado de nuevos datasets.
- Robótica de asistencia: descomponer demostraciones en primera persona en subtareas con tiempos para entrenar políticas de imitación o planificadores jerárquicos.
- Documentación de procesos manuales: grabar tareas de cocina, montaje o empaquetado y generar automáticamente un desglose paso a paso con duraciones.
- Evaluación de calidad de demostraciones: comparar la segmentación predicha con la anotación humana para detectar demostraciones mal ejecutadas o incompletas.
- Análisis de vídeo industrial con wearables: extraer métricas de tiempo por subtarea en líneas de montaje o tareas de mantenimiento grabadas en primera persona.
- Investigación en RL y vídeo: usar las segmentaciones como recompensa o estructura intermedia en pipelines de aprendizaje por refuerzo sobre vídeo.
- Indexación y búsqueda temporal: generar índices de subtareas con marcas de tiempo para recuperar fragmentos concretos de un archivo de vídeo egocéntrico.

## Benchmarks y rendimiento

Resultados publicados en el conjunto de test de egodemo (422 muestras), comparando el modelo base con xmodel-vl:

| Metrica | Base (Qwen3.5-VL-27B) | xmodel-vl |
|---|---|---|
| F1@50 (solapamiento temporal) | 0,515 | 0,766 |
| F1@75 | 0,283 | 0,572 |
| mAP (tIoU 0,1/0,3/0,5/0,75) | 0,494 | 0,768 |
| MAE de fronteras (s, menor es mejor) | 4,26 | 2,60 |
| Ratio de segmentos (predichos/reales) | 1,72 | 1,11 |

En un subconjunto de 60 muestras, el modelo alcanza F1@50 de 0,880 y MAE de fronteras de 1,00 s. No se han publicado resultados en otros benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~27B parámetros en BF16 se requiere aproximadamente 54 GB solo para pesos, más memoria para activaciones y caché.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16.
- En GPU de consumo: 27B en BF16 no cabe en RTX 4090 (24 GB); requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`) con `transformers>=5.2.0` y `trust_remote_code=True`; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heitong/xmodel-vl | ~27B | no disponible | Segmentación temporal egocéntrica | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-VL-27B (base) | ~27B | no disponible | Multimodal general | no disponible | Hugging Face |
| Alternativas especializadas en segmentación temporal | no disponible | no disponible | Segmentación de acciones | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Optimizado para vídeo en primera persona y granularidad de subtarea (aprox. 10-25 s); puede ser demasiado grueso para acciones de menos de 5 s o para narrativa de vídeo largo.
- Las fronteras temporales son estimaciones del modelo y su precisión absoluta depende de la densidad de muestreo de fotogramas.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación en descripciones de acciones y en la estructura JSON si la instrucción no es estricta.
- Sesgos no documentados por el autor.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-VL-27B.
- Requiere `transformers>=5.2.0` y `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/heitong/xmodel-vl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-VL-27B
- Dataset egodemo: no disponible en la información proporcionada
- Dataset EPIC-KITCHENS-100: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
