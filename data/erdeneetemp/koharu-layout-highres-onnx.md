# erdeneetemp/koharu-layout-highres-onnx

## Resumen

Koharu Layout HighRes (ONNX) es la conversión a formato ONNX del modelo `mayocream/koharu-layout-highres`, un detector y segmentador de regiones de página de manga basado en RF-DETR Seg 2XL con resolución de entrada de 1920 píxeles. Lo publica el usuario `erdeneetemp` como artefacto derivado, manteniendo los pesos originales sin modificar y convirtiéndolos de safetensors a ONNX (opset 17) mediante `rfdetr` 1.7.0. El objetivo es permitir la inferencia con ONNX Runtime sin dependencia de Python, lo que facilita su integración en herramientas nativas, aplicaciones de escritorio o pipelines de traducción y maquetación de cómic.

El modelo resuelve una tarea concreta de análisis de maquetación: localizar y segmentar cuatro tipos de región en una página de manga (texto, onomatopeya, bocadillo de diálogo y viñeta), devolviendo para cada una una caja delimitadora y una máscara de instancia. Es, por tanto, un modelo de segmentación de instancias con detección integrada, no un modelo generativo de lenguaje. Su relevancia actual radica en que expone esta capacidad en un formato portable y con un consumo de memoria contenido en CPU, lo que lo hace viable en entornos donde no se dispone de GPU o donde no se quiere arrastrar el ecosistema PyTorch completo.

La conversión incorpora una optimización técnica destacable: la self-attention del backbone se exporta en bloques de 1024 filas de query, de modo que nunca se materializa la matriz de scores completa. Según la model card, esto reduce el pico de memoria en CPU de aproximadamente 20 GB a unos 2,8 GB por imagen, manteniendo resultados equivalentes al modelo original (cajas y logits de clase dentro de 4e-3, máscaras coincidentes en el 99,998 % de los píxeles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2XL (detector y segmentador transformer con backbone DETR-like); exportado a ONNX opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 1920×1920) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | ja (japonés; el modelo opera sobre imágenes de página, la etiqueta de idioma se refiere al material de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, 174.648.069 bytes, SHA-256 `b2f8807dfd00adc82233f4456e79a32fdc32d658ddb2a7a0182c523c638e52ea`) |

## Arquitectura y entrenamiento

El modelo subyacente es RF-DETR Seg 2XL, una arquitectura de detección y segmentación de instancias de tipo DETR (transformer con queries aprendidas) desarrollada por Roboflow, en su variante de mayor capacidad de la familia. La entrada es una imagen RGB de 1920×1920 normalizada con media y desviación típica de ImageNet. La salida consta de tres tensores: `dets` con forma `[1, 300, 4]` (cajas en formato centro x, centro y, ancho, alto, normalizadas de 0 a 1), `labels` con forma `[1, 300, 5]` (logits de clase para texto, onomatopeya, bocadillo y viñeta; la quinta posición no se usa) y `masks` con forma `[1, 300, 480, 480]` (logits de máscara sobre la imagen completa, considerándose un píxel interior cuando el logit es mayor que 0).

El checkpoint original fue ajustado (fine-tuning) sobre el dataset `mayocream/manga109-segmentation`, derivado de Manga109, un corpus de páginas de manga japonés anotado. Las páginas se entrenaron con letterboxing: se escala la página hasta que su lado largo mida 1920 píxeles, se coloca en la esquina superior izquierda de un cuadrado blanco de 1920×1920 y se normaliza. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de visión de este tipo). La innovación técnica documentada es la exportación por bloques de la self-attention del backbone, que permite ejecutar el modelo en CPU con un pico de memoria de unos 2,8 GB por imagen en lugar de los aproximadamente 20 GB del grafo completo.

## Capacidades

- Detección de regiones de página de manga con caja delimitadora por instancia.
- Segmentación de instancias con máscara por región (logits a resolución 480×480 sobre la imagen de entrada).
- Clasificación en cuatro categorías: texto, onomatopeya, bocadillo de diálogo y viñeta.
- Procesamiento de páginas a alta resolución (lado largo de 1920 píxeles), adecuado para escaneos de manga.
- Post-proceso según RF-DETR: sigmoide sobre los logits, selección de las 160 mejores parejas query/clase y umbrales recomendados por clase (texto 0,25; onomatopeya 0,3; bocadillo 0,5; viñeta 0,4).
- Ejecución sin Python mediante ONNX Runtime, lo que permite integrarlo en aplicaciones nativas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión para análisis de maquetación.
- No dispone de capacidades multilingües en el sentido de generación; su ámbito es el manga japonés.

## Casos de uso

- Traducción automática de manga: el modelo localiza bocadillos y regiones de texto en la página, lo que permite recortar cada región y enviarla a un OCR y a un traductor. Es adecuado porque separa texto de onomatopeyas y viñetas, evitando mezclar contenido traducible con elementos gráficos.
- Limpieza y retoque de escaneos: las máscaras de texto y onomatopeya permiten aplicar inpainting o borrado selectivo sobre esas regiones sin dañar el dibujo de la viñeta, gracias a la segmentación por instancia a resolución 1920.
- Maquetación y reflow de cómic: las cajas de viñeta permiten reconstruir el orden de lectura y generar versiones adaptadas a pantallas pequeñas o a formatos verticales, usando la clasificación de panel para ordenar las regiones.
- Indexación y búsqueda de contenido: extraer las regiones de texto y bocadillo de un catálogo de páginas permite construir índices de diálogo para búsqueda o análisis de personajes, aprovechando la salida estructurada de cajas y etiquetas.
- Herramientas de anotación asistida: el modelo puede preanotar páginas de manga para que un humano corrija las detecciones, reduciendo el coste de crear datasets de segmentación; su formato ONNX facilita integrarlo en aplicaciones de escritorio de anotación sin Python.
- Aplicaciones de escritorio o móviles sin GPU: al ejecutarse con ONNX Runtime y requerir un pico de memoria de unos 2,8 GB en CPU por imagen, es viable en portátiles o entornos sin acelerador para procesar páginas de forma batch.
- Análisis editorial y control de calidad: detectar páginas con bocadillos mal recortados, texto fuera de panel o maquetaciones atípicas en un flujo de prepublicación, usando los umbrales por clase para filtrar detecciones dudosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta una verificación de equivalencia frente al modelo original en PyTorch sobre una entrada aleatoria: cajas y logits de clase dentro de 4e-3 y máscaras coincidentes en el 99,998 % de los píxeles. No se aportan métricas de precisión (mAP, IoU) sobre Manga109 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo se ha optimizado para ejecución en CPU con un pico de memoria de aproximadamente 2,8 GB por imagen (frente a unos 20 GB del grafo sin la exportación por bloques). En GPU, el consumo sería inferior al de CPU, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; al ser un modelo ONNX, puede ejecutarse en GPU mediante el provider CUDA de ONNX Runtime, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No se documenta; por el tamaño del artefacto (174,6 MB) y la resolución de entrada, es plausible en GPUs de consumo con suficiente memoria, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime (principal, con o sin Python), y cualquier runtime compatible con ONNX opset 17. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponible. Solo se documenta el pico de memoria en CPU (unos 2,8 GB por imagen) y la estrategia de exportación por bloques de 1024 filas de query.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases de región | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| erdeneetemp/koharu-layout-highres-onnx | RF-DETR Seg 2XL convertido a ONNX | 1920×1920 | texto, onomatopeya, bocadillo, viñeta | Apache 2.0 | ONNX | Hugging Face |
| mayocream/koharu-layout-highres | RF-DETR Seg 2XL (original) | 1920×1920 | texto, onomatopeya, bocadillo, viñeta | Apache 2.0 | safetensors | Hugging Face |
| Otros modelos de layout de manga | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo original en safetensors, del que este artefacto deriva: comparten pesos y arquitectura, y difieren en formato (ONNX frente a safetensors), dependencia de Python (ONNX Runtime frente a PyTorch) y pico de memoria en CPU (aproximadamente 2,8 GB frente a unos 20 GB por imagen). No se dispone de información sobre alternativas comparables de layout de manga para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Modelo especializado en páginas de manga japonés; su rendimiento fuera de ese dominio (cómic occidental, webtoon, documentos) no está documentado y probablemente sea inferior.
- No se han publicado métricas de precisión sobre Manga109 ni sobre otros conjuntos, por lo que no es posible cuantificar su calidad real más allá de la equivalencia con el original.
- Riesgo de detecciones espurias o de fusión de regiones en páginas con maquetación atípica, onomatopeyas integradas en el dibujo o texto fuera de bocadillo; los umbrales por clase son los recomendados por el autor y conviene ajustarlos según el caso.
- El modelo trabaja sobre un cuadrado letterboxed de 1920×1920: las páginas con relación de aspecto extrema requieren remapear las salidas y descartar lo que cae fuera de la página, lo que introduce complejidad en la integración.
- La etiqueta de idioma es `ja` y el entrenamiento se basa en Manga109; no hay evidencia de generalización a otros idiomas o alfabetos.
- Licencia Apache 2.0, que permite uso comercial, pero se mantiene el NOTICE del modelo original y se recuerda que las imágenes de Manga109 no se distribuyen y siguen bajo sus propios términos.
- El autor del artefacto es un tercero (`erdeneetemp`), no el autor del modelo original; la responsabilidad sobre la conversión y su verificación recae en ese tercero, aunque se documenta el proceso y los resultados de equivalencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-19; no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdeneetemp/koharu-layout-highres-onnx
- Modelo original: https://huggingface.co/mayocream/koharu-layout-highres
- Revisión del modelo original usada en la conversión: https://huggingface.co/mayocream/koharu-layout-highres/tree/68077eb09401a46e548190ff2786bd405113ea8b
- Dataset de entrenamiento: https://huggingface.co/datasets/mayocream/manga109-segmentation
- ONNX Runtime: https://onnxruntime.ai/
- RF-DETR (Roboflow): no disponible en la información proporcionada como enlace directo; se menciona la librería `rfdetr` 1.7.0 y RF-DETR Seg 2XL como base arquitectónica.
