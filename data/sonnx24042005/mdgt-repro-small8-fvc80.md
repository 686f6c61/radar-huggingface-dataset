# SonNX24042005/mdgt-repro-small8-fvc80

## Resumen

`mdgt-repro-small8-fvc80` es una reproducción de la arquitectura MDGT (Minutiae-free Dynamic Graph Transformer) para reconocimiento e identificación de huellas dactilares, publicada por el usuario SonNX24042005 en Hugging Face. El modelo combina un backbone ViT-S/8 preentrenado con DINO, una selección de tokens mediante TRAM en las capas 3, 7 y 10 (192 nodos en total) y un grafo kNN (k=8) procesado por dos capas GAT con codificación posicional relativa, seguido de pooling con 4 semillas y una cabeza MLP que produce embeddings de 256 dimensiones normalizados en L2.

El checkpoint incluido (`last.pt`, 168 MB) contiene los pesos del modelo, una copia EMA (0.9995), la matriz ArcFace de 12.160 clases y los argumentos de entrenamiento, con 6.000 iteraciones completadas. El modelo tiene 20,40 M de parámetros aprendibles (18,12 M en el backbone y 2,28 M en el grafo, pooling y cabeza) y está pensado para extraer representaciones de huellas que se comparan por similitud coseno.

Es relevante para quienes investigan identificación biométrica a gran escala sin minucias, ya que la arquitectura propone un pipeline extremo a extremo sobre imágenes de huella preprocesadas (500 ppi, filtro de Gabor de 8 orientaciones, reescalado a 200 ppi y recorte a 224x224). La información disponible no incluye pipeline declarado, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-S/8 (DINO) + selección de tokens TRAM + grafo kNN con 2 capas GAT y RPE + pooling multi-seed + MLP |
| Parámetros totales | 20.395.918 (20,40 M); backbone 18,12 M, grafo/pooling/head 2,28 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija 1x224x224) |
| Tipos de cuantización | no disponible (checkpoint en FP32; se reporta inferencia FP16 con autocast) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pt`, checkpoint con claves `model`, `model_ema`, `arcface`, `classes`, `args`, `iter`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MDGT descrita en el artículo *Accelerating large-scale fingerprint identification using minutiae-free dynamic graph transformers* (IEEE SPL 2026). El backbone es `vit_small_patch8_224.dino`, un ViT de 10 bloques y 384 dimensiones preentrenado con DINO. Sobre las representaciones del backbone, el módulo TRAM selecciona 192 tokens distribuidos en las capas 3, 7 y 10, que se organizan en un grafo kNN con k=8 y se procesan mediante dos capas GAT con codificación posicional relativa. El pooling con 4 semillas y una MLP final generan un embedding de 256 dimensiones normalizado en L2.

El entrenamiento se realizó con 12.160 etiquetas ArcFace sobre un conjunto compuesto por NIST SD300 (8.880), NIST SD302 (2.000), FVC2000 (440), FVC2004 (440) y FVC2002 (400). El checkpoint conserva el estado tras 6.000 iteraciones con EMA 0.9995. La entrada se preprocesa offline con `src/build_cache.py`: normalización a 500 ppi, filtro de Gabor de 8 orientaciones con kernel 31x31 y mezcla 0.7 Gabor + 0.3 original, reducción a 200 ppi, centrado sobre lienzo de 288x288 y recorte central de 224x224. No se documentan detalles sobre RLHF/DPO ni sobre la composición exacta del dataset más allá del recuento de etiquetas.

## Capacidades

- Extracción de embeddings de huella dactilar de 256 dimensiones normalizados en L2, comparables por similitud coseno.
- Reconocimiento e identificación de huellas (tareas `fingerprint-recognition` y `fingerprint-identification`).
- Procesamiento de imágenes de huella en escala de grises con entrada fija de 1x224x224 en float32 y rango [0, 1].
- Devolución de índices de tokens seleccionados (192 índices) junto con el embedding, lo que permite inspeccionar la selección TRAM.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión especializado, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen de huella.

## Casos de uso

- Identificación biométrica a gran escala: el modelo genera embeddings de 256 dimensiones que pueden indexarse en un motor de búsqueda vectorial para recuperar candidatos por similitud coseno en bases de huellas de miles o millones de entradas.
- Verificación 1:1 en control de acceso: comparar el embedding de una huella capturada con el almacenado para un usuario concreto, usando el umbral de EER reportado como referencia de calibración.
- Deduplicación de registros biométricos: detectar huellas duplicadas en una base de datos comparando embeddings y agrupando por similitud, útil en procesos de limpieza de padrones.
- Investigación forense asistida: ordenar candidatos de una base de huellas latentes o rodadas para revisión humana, aprovechando el pipeline de preprocesado con Gabor para normalizar capturas heterogéneas.
- Evaluación comparativa de arquitecturas sin minucias: servir como referencia reproducible de MDGT para experimentos académicos sobre grafos dinámicos y selección de tokens en biometría.
- Despliegue en estaciones de trabajo con GPU de consumo: con latencias de 2,5 ms en FP16 con CUDA graphs en una RTX 4070, es viable en escenarios de captura en vivo con requisitos de tiempo real.
- Integración en pipelines de control de calidad de captura: usar la distancia entre embeddings de distintas capturas del mismo dedo para detectar muestras de baja calidad o mal preprocesadas.

## Benchmarks y rendimiento

Resultados reportados por el autor con `model_ema` en FP32 sobre RTX 4070 / RTX 2050:

| Conjunto | Métrica | Valor |
|---|---|---|
| FVC2002 Set A (media 4 DB, protocolo estándar) | R1 | 98,54% |
| FVC2002 Set A (solo imágenes pares) | R1 | 96,25% |
| FVC2004 Set A (media 4 DB, protocolo estándar) | R1 / EER | 98,82% / 0,80% |
| FVC2004 Set A (solo imágenes pares) | R1 / EER | 95,92% / 1,69% |
| FVC2002 Set B (4 DB, dedos no vistos en entrenamiento) | R1 / EER | 98,93% / 2,32% |
| FVC2002 Set B (LOO) | R1 | 100,00% |
| SOCOFing Easy | R1 / EER | 91,38% / 1,56% |
| SOCOFing Medium | R1 / EER | 43,67% / 11,61% |
| SOCOFing Hard | R1 / EER | 31,61% / 16,97% |

Latencia en RTX 4070 (batch=1, 1x224x224): 6,12–6,19 ms en FP32 eager y 2,52–2,57 ms en FP16 autocast con CUDA graphs. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint de 168 MB más activaciones de una imagen de 224x224; el modelo completo en FP32 ocupa aproximadamente 82 MB de pesos (20,40 M de parámetros).
- GPU recomendadas: RTX 4070 (mediciones reportadas), RTX 2050 (mediciones reportadas); cualquier GPU con al menos 2 GB de VRAM es suficiente para batch=1.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 2050 en adelante) e incluso en iGPU con suficiente memoria.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `MDGT` de `src/model.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 6,12–6,19 ms por imagen en FP32 eager y 2,52–2,57 ms en FP16 con CUDA graphs en RTX 4070, batch=1.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras arquitecturas de reconocimiento de huellas (por ejemplo, basadas en minucias o en CNN), por lo que no es posible establecer una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- Fuga de datos en FVC Set A: los 800 dedos de FVC2002/2004 Set A (e imágenes 1, 3, 5, 7) están incluidos en las 12.160 etiquetas de entrenamiento, por lo que los resultados en Set A son referencias con fine-tune y no medidas limpias; el conjunto más limpio reportado es FVC2002 Set B.
- Rendimiento muy degradado en SOCOFing Medium y Hard (R1 de 43,67% y 31,61%), lo que sugiere poca robustez ante capturas de baja calidad o resoluciones distintas (~178 ppi estimados frente a los 500 ppi del pipeline).
- Dependencia fuerte del preprocesado offline: el modelo espera imágenes normalizadas a 500 ppi, filtradas con Gabor y recortadas a 224x224; usar otra tubería de preprocesado puede invalidar los embeddings.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Sin información sobre sesgos demográficos (edad, etnia, género) ni sobre tasas de falsos positivos en poblaciones diversas.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de falsos positivos y negativos en la identificación, con EER de hasta 16,97% en condiciones difíciles.
- Modelo de investigación con 6.000 iteraciones de entrenamiento; no se documenta validación externa ni auditoría de seguridad.
- No soporta otros idiomas ni modalidades: es exclusivamente un extractor de embeddings de huellas.

## Enlaces

- Hugging Face: https://huggingface.co/SonNX24042005/mdgt-repro-small8-fvc80
- Artículo de referencia: *Accelerating large-scale fingerprint identification using minutiae-free dynamic graph transformers*, IEEE SPL 2026 (no se proporciona URL directa en la información disponible)
- Backbone DINO ViT-S/8: `vit_small_patch8_224.dino` (no se proporciona URL directa en la información disponible)
