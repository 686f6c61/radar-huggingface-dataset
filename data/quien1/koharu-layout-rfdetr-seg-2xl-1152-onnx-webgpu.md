# Quien1/koharu-layout-rfdetr-seg-2xl-1152-onnx-webgpu

## Resumen

koharu-layout-rfdetr-seg-2xl-1152-onnx-webgpu es una exportación ONNX del modelo de detección de layout de manga `mayocream/koharu-layout-rfdetr-seg-2xl-1152`, optimizada específicamente para su ejecución en navegador mediante onnxruntime-web y el backend WebGPU. El modelo detecta y segmenta cuatro tipos de regiones en páginas de cómic japonés: texto, onomatopeyas (SFX), bocadillos y viñetas. Lo publica el usuario Quien1 como artefacto derivado, sin reentrenamiento.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un detector de objetos especializado (familia RF-DETR, arquitectura transformer de detección con cabecera de segmentación) del que solo se distribuye el grafo ONNX. El repositorio ocupa 0,1 GB y no registra descargas ni valoraciones en el momento de la consulta.

La única modificación respecto al export fp32 original de ShiniShiho es la aplicación del optimizador offline de ONNX Runtime 1.31.1 en nivel *basic* (plegado de constantes y eliminación de nodos redundantes), que reduce el grafo de 2040 a 1203 nodos para acelerar la preparación del modelo en WebGPU. Pesos, entradas y salidas permanecen idénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR con cabecera de segmentación (transformer de detección), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1×3×1152×1152) |
| Tipos de cuantizacion | no disponible (el artefacto es el grafo optimizado; el tag `base_model:quantized` apunta al modelo base, pero no se detalla el esquema) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; opera sobre imágenes de manga, predominantemente japonés) |
| Licencia | other (el software RF-DETR es Apache-2.0; las imágenes Manga109 tienen términos de uso académico) |
| Formato de pesos | ONNX (optimizado para onnxruntime-web con WebGPU) |

## Arquitectura y entrenamiento

El modelo subyacente es un RF-DETR, un detector de objetos basado en transformer con cabecera de segmentación, ajustado por mayocream para la tarea de layout de manga. Detecta cuatro clases: texto, onomatopeya/SFX, bocadillo y viñeta. La entrada es un tensor float32 de forma 1×3×1152×1152 y las salidas son `dets` (detecciones), `labels` (clases) y `masks` (máscaras de segmentación).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación (RLHF/DPO), que en un detector de objetos no resultan de aplicación directa. La model card indica que el modelo se ajustó sobre imágenes de Manga109, distribuidas por separado bajo términos de uso académico. La innovación técnica de este repositorio concreto es exclusivamente de despliegue: el paso por el optimizador offline de ONNX Runtime 1.31.1 en nivel basic, que no depende del execution provider y reduce el trabajo de preparación en onnxruntime-web.

## Capacidades

- Detección de regiones de layout en páginas de manga: texto, onomatopeyas/SFX, bocadillos y viñetas.
- Segmentación por instancia mediante la salida `masks`, útil para recortes precisos de cada región.
- Inferencia en navegador mediante onnxruntime-web con backend WebGPU, sin servidor.
- Entrada de imagen de resolución fija 1152×1152, adecuada para páginas de cómic de alta resolución.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente perceptivo de visión.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje, aunque está entrenado sobre manga japonés.

## Casos de uso

- Traducción automática de manga en el navegador: el detector localiza bocadillos y regiones de texto para que un OCR y un traductor posteriores operen solo sobre esas zonas, ejecutándose íntegramente en cliente gracias al backend WebGPU.
- Lector de manga web con recorte inteligente: la segmentación de viñetas permite generar vistas por panel o modo de lectura guiada en una aplicación web sin backend.
- Limpieza y retipografía (scanlation): las máscaras de texto y SFX permiten enmascarar regiones para sustituir el texto original por la traducción manteniendo el arte.
- Catalogación y análisis de archivos de cómic: extracción de estadísticas por página (número de viñetas, densidad de bocadillos, presencia de SFX) para investigación o indexación.
- Herramientas de accesibilidad: generación de descripciones o lectura por regiones ordenadas a partir de las detecciones y máscaras.
- Prototipado rápido sin infraestructura: al ser un ONNX optimizado para onnxruntime-web, permite validar pipelines de layout de manga en una demo estática alojada en cualquier CDN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, lo que sugiere un modelo compacto que cabe holgadamente en memoria de GPU de consumo, pero no se documenta el tamaño exacto de los pesos.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes y dedicadas de gama media y alta); en servidor, se puede ejecutar con ONNX Runtime sobre GPU NVIDIA, aunque no se detallan requisitos.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU con WebGPU, dado el tamaño del artefacto; no se especifica el mínimo exacto.
- Opciones de despliegue: onnxruntime-web con WebGPU (objetivo principal), ONNX Runtime nativo (CPU/GPU) y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; la optimización de grafo (2040 a 1203 nodos) está orientada a reducir el tiempo de carga y preparación en el navegador, no a mejorar la latencia de inferencia por sí misma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quien1/koharu-layout-rfdetr-seg-2xl-1152-onnx-webgpu | no disponible | imagen 1152×1152 | Detección y segmentación de layout de manga | other | ONNX en HF |
| mayocream/koharu-layout-rfdetr-seg-2xl-1152 | no disponible | imagen 1152×1152 | Detección y segmentación de layout de manga | other | Pesos originales en HF |
| ShiniShiho/koharu-layout-rfdetr-seg-2xl-1152-onnx | no disponible | imagen 1152×1152 | Igual, export ONNX fp32 sin optimizar | other | ONNX en HF |

Las tres variantes comparten pesos y arquitectura; las diferencias se limitan al formato y al grado de optimización del grafo. No se dispone de datos de rendimiento comparativo entre ellas ni frente a otros detectores de layout de manga.

## Limitaciones y advertencias

- Es un artefacto derivado sin reentrenamiento: hereda todos los sesgos y limitaciones del modelo base, sobre el que no se documentan evaluaciones en esta información.
- Riesgo de falsos positivos y negativos en páginas con layouts atípicos, dado que el ajuste se realizó sobre Manga109, un corpus con características estilísticas concretas.
- Licencia `other`: el software RF-DETR es Apache-2.0, pero las imágenes Manga109 tienen términos de uso académico; el repositorio no concede derechos sobre imágenes ni contenido de cómic, y el usuario debe cumplir los términos del modelo fuente.
- Uso comercial sujeto a verificación: la licencia `other` exige revisar las condiciones del modelo base antes de cualquier despliegue en producción.
- No procesa texto ni lenguaje: no sustituye a un OCR ni a un traductor; es un componente previo en un pipeline.
- Dependencia de WebGPU: en navegadores o dispositivos sin soporte WebGPU, el rendimiento puede degradarse o requerir fallback a CPU.
- Sin métricas publicadas de precisión (mAP, IoU) en esta información, por lo que no es posible cuantificar su calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Quien1/koharu-layout-rfdetr-seg-2xl-1152-onnx-webgpu
- Modelo base: https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152
- Export ONNX fp32 de referencia: https://huggingface.co/ShiniShiho/koharu-layout-rfdetr-seg-2xl-1152-onnx (revisión `bfbbd4e5ab34a50459865074fa044da496cebb57`)
- ONNX Runtime: https://onnxruntime.ai/
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Dataset Manga109: http://www.manga109.org/
