# gabogabogoo/argus-lite-onnx

## Resumen

Argus-Lite es un modelo de percepción visual multitarea construido sobre un backbone congelado EUPE-ViT-S (Efficient Universal Perception Encoder) de Meta FAIR. Lo desarrolla el usuario gabogabogoo y se distribuye como un checkpoint de 38,07 millones de parámetros totales, de los cuales 16,5 millones corresponden a las cabezas de tarea. Resuelve cinco tareas de visión por computador con un único modelo: clasificación de imágenes, segmentación semántica, estimación de profundidad, detección de objetos y correspondencia de keypoints.

La propuesta técnica es reutilizar el codificador universal de EUPE-ViT-S congelado y entrenar solo cabezas específicas ligeras, de modo que el modelo resultante mantiene la API y el código de Argus pero con un coste computacional muy inferior. El backbone aporta embeddings de 384 dimensiones y el conjunto cabe en un repositorio de 0,3 GB, lo que lo hace apto para despliegue en entornos con recursos limitados.

Es relevante ahora porque demuestra una vía de adaptación eficiente de encoders de propósito general a pipelines de percepción completos sin reentrenar el backbone. La licencia, sin embargo, es la FAIR Noncommercial Research License heredada de EUPE-ViT-S, lo que restringe su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (EUPE-ViT-S) congelado con cabezas específicas por tarea; decodificador DPT para profundidad, pirámide cofiber con clasificador coseno alineado a texto y decodificación FCOS para detección |
| Parámetros totales | 38.072.168 (38,07 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; resolución de entrada por cabeza: 224 para clasificación y embedding, 512 para segmentación, 416 para profundidad, 768 para detección) |
| Tipos de cuantización | INT8 mediante `quantize_int8()`; exportación ONNX; pesos en safetensors |
| Idiomas soportados | No disponible (modelo de visión; no procesa texto de forma nativa, aunque la detección usa un clasificador alineado a texto) |
| Licencia | FAIR Noncommercial Research License (fair-research-license) |
| Formato de pesos | safetensors, PyTorch, ONNX |

## Arquitectura y entrenamiento

El modelo se compone de un backbone EUPE-ViT-S congelado (Zhu et al., Meta FAIR, arXiv:2603.22387) y cinco cabezas ligeras entrenadas por separado. La clasificación usa una capa lineal softmax sobre el token CLS normalizado en L2, con 1.000 clases de ImageNet. La segmentación emplea BatchNorm y una convolución 1×1 para 150 clases de ADE20K. La profundidad utiliza un decodificador DPT sobre los bloques 2, 5, 8 y 11 con 256 bins espaciados logarítmicamente entre 0,001 y 10 m. La detección combina una pirámide cofiber con un clasificador coseno alineado a texto y decodificación FCOS para 80 clases de COCO. La correspondencia no tiene cabeza entrenada: se basa en el emparejamiento coseno de características de parches.

Los datos de entrenamiento corresponden a los conjuntos indicados en la model card: ImageNet-1k para clasificación, ADE20K (scene_parse_150) para segmentación, NYU Depth V2 para profundidad y COCO 2017 para detección. No se especifica el número de tokens ni el volumen exacto de datos de entrenamiento de las cabezas, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo de visión de este tipo). La innovación principal es la congelación del backbone y el entrenamiento exclusivo de cabezas, lo que reduce drásticamente el coste de adaptación.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet con salida top-k.
- Segmentación semántica densa en 150 clases de ADE20K, con mapas de confianza por píxel opcionales.
- Estimación de profundidad métrica en interiores (hasta 10 m), con desviación estándar por píxel opcional.
- Detección de objetos en 80 clases de COCO con umbral de puntuación configurable.
- Correspondencia de keypoints entre dos imágenes mediante emparejamiento coseno de características de parches.
- Extracción de embeddings CLS normalizados en L2 de 384 dimensiones.
- Percepción combinada (clasificación, segmentación y profundidad) en una sola llamada mediante `perceive()`.
- Procesamiento por lotes: todos los métodos aceptan listas de imágenes.
- Exportación a ONNX, cuantización INT8 y compilación mediante `compile()`.

## Casos de uso

- Análisis de escenas interiores para robótica móvil: el modelo combina segmentación semántica y profundidad métrica en una sola pasada, lo que permite a un robot doméstico identificar obstáculos y superficies transitables con un coste de 38 M de parámetros.
- Moderación y etiquetado automático de imágenes: la clasificación top-k sobre ImageNet y los embeddings CLS permiten construir pipelines de filtrado y búsqueda por similitud sin depender de servicios externos.
- Detección de objetos en tiempo casi real en dispositivos de borde: con exportación ONNX y cuantización INT8, el modelo puede desplegarse en GPUs de consumo o aceleradores dedicados para tareas de vigilancia o conteo.
- Reconstrucción 3D aproximada y mapeo: la salida de profundidad densa junto con la correspondencia de parches permite generar nubes de puntos o mapas de disparidad en aplicaciones de fotogrametría ligera.
- Anotación asistida de datasets: la segmentación ADE20K y la detección COCO sirven como preetiquetadores para acelerar el etiquetado humano en proyectos de visión.
- Investigación en percepción multitarea: al compartir API con Argus y permitir cabezas intercambiables vía `config.json`, es útil para estudiar el equilibrio entre tareas y el coste de adaptación de encoders congelados.
- Búsqueda visual y recuperación de imágenes: los embeddings de 384 dimensiones normalizados permiten indexar y recuperar imágenes por similitud semántica.

## Benchmarks y rendimiento

| Tarea | Métrica | Resultado |
|---|---|---|
| Clasificación (ImageNet-1k, val) | Top-1 / Top-5 | 79,13% / 95,53% |
| Segmentación (ADE20K, val) | mIoU | 41,9 |
| Profundidad (NYU Depth V2, split Eigen de 654 imágenes) | RMSE / abs rel / δ<1.25 | 0,321 / 0,103 / 0,898 |
| Detección (COCO 2017 val) | mAP / AP@50 | 27,3 / 49,6 |
| Recuperación agnóstica de clase (RF100-VL, 20 dominios) | AR@100 | 0,266 |

Los desgloses por dominio y por clase están en `rf100vl_results.json`, `cls_val_eval.json` y `coco_val_eval.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo completo (38 M de parámetros); en la práctica, el consumo lo domina la resolución de entrada, especialmente la detección a 768 px.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (exportación mediante `export_onnx()`), cuantización INT8 con `quantize_int8()`, compilación con `compile()`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tareas | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Argus-Lite (este modelo) | 38,07 M (16,5 M en cabezas) | Clasificación, segmentación, profundidad, detección, correspondencia | 224-768 px según cabeza | FAIR Noncommercial Research License | HuggingFace |
| Argus (modelo original) | No disponible | Mismas tareas | No disponible | No disponible | HuggingFace (phanerozoic/argus) |
| EUPE-ViT-S (backbone base) | No disponible | Codificador universal | No disponible | FAIR Noncommercial Research License | HuggingFace (facebook/EUPE-ViT-S) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- La licencia FAIR Noncommercial Research License restringe explícitamente el uso comercial; cualquier despliegue en producción con fines lucrativos requiere autorización adicional de Meta FAIR.
- La cabeza de profundidad está entrenada en escenas de interior y predice como máximo 10 m; no es adecuada para exteriores o escenas lejanas.
- La detección se limita a 80 clases de COCO y alcanza 27,3 mAP, un rendimiento moderado que puede ser insuficiente en dominios especializados.
- La clasificación se limita a las 1.000 clases de ImageNet, con posibles sesgos heredados del dataset.
- La correspondencia de keypoints no tiene cabeza entrenada y depende de la calidad de los parches del backbone; puede degradarse en texturas repetitivas o cambios de iluminación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones erróneas con alta confianza en dominios fuera de distribución.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los benchmarks citados.
- El modelo tiene solo 24 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.
- No se especifican los idiomas soportados ni capacidades de texto más allá del clasificador alineado a texto de la detección.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabogabogoo/argus-lite-onnx
- Modelo original Argus: https://huggingface.co/phanerozoic/argus
- Backbone EUPE-ViT-S: https://huggingface.co/facebook/EUPE-ViT-S
- Licencia EUPE-ViT-S: https://huggingface.co/facebook/EUPE-ViT-S/blob/main/LICENSE
- Paper EUPE: https://arxiv.org/abs/2603.22387
