# jepacpp/lejepa-vits16-pretrain-in1k-GGUF

## Resumen

LeJEPA ViT-S/16 es un codificador de imágenes basado en la arquitectura Joint-Embedding Predictive Architecture (JEPA), desarrollado por el grupo galilai-group y publicado en el artículo arXiv 2511.08544. Este modelo concreto es la conversión a formato GGUF del checkpoint `OK-AI/lejepa-vits16-pretrain-in1k`, realizada por el usuario jepacpp para el motor de inferencia jepa.cpp, una implementación en C/C++ sobre ggml que permite ejecutar el modelo en CPU sin dependencias de Python ni PyTorch.

El modelo tiene 21,7 millones de parámetros, una dimensión de 384, 12 capas, 6 cabezas de atención, parche de 16 píxeles y resolución de entrada de 224x224. Su relevancia radica en que es el modelo más pequeño y rápido de la familia LeJEPA, y su conversión a GGUF permite desplegarlo en entornos de producción ligeros, con un solo binario y un solo archivo de pesos, sin necesidad de GPU. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/16 (Vision Transformer, backbone estilo DINOv2) con objetivo JEPA |
| Parametros totales | 21.665.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de visión, procesa imágenes de 224x224) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (publicados); q4_1, q5_0, q5_1, q5_k, q6_k generables localmente |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base OK-AI/lejepa-vits16-pretrain-in1k) |

## Arquitectura y entrenamiento

LeJEPA se basa en el marco Joint-Embedding Predictive Architecture (JEPA), que aprende representaciones mediante la predicción de representaciones de parches de imagen en un espacio latente, sin necesidad de etiquetas. El backbone es un Vision Transformer de tamaño pequeño (ViT-S/16) con 12 capas, 6 cabezas y dimensión de 384, que procesa imágenes de 224x224 con parches de 16x16. El entrenamiento se realizó de forma autosupervisada sobre ImageNet-1k, utilizando el objetivo SIGReg (por sus siglas en inglés, probablemente relacionado con la regularización de la covarianza o similar, aunque el detalle exacto no se especifica en la información disponible). El modelo base fue publicado por OK-AI y la conversión a GGUF fue realizada por jepacpp, que verificó la paridad numérica con la referencia de PyTorch mediante pruebas de similitud coseno.

## Capacidades

- Extracción de características de imagen: genera embeddings de parches y un token CLS que representa la imagen completa.
- Modos de pooling: `mean`, `cls`, `lewm` (pooling ponderado por LeJEPA) y `none` (mapa completo de tokens).
- Inferencia en CPU pura: el motor jepa.cpp ejecuta el modelo sin GPU, sin Python y sin PyTorch.
- Compatibilidad con cuantización: soporta f32, f16, q8_0, q4_0 y q4_k, con degradación controlada de la calidad según el tipo.
- Integración mediante API C: una única cabecera (`include/jepa.h`) permite incrustar el modelo en aplicaciones C/C++.
- Salida en formato `.npy` para integración con pipelines de NumPy o similares.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Búsqueda de imágenes por similitud: el modelo genera embeddings de imágenes que pueden indexarse en una base de datos vectorial para recuperación por similitud (k-NN). Su tamaño reducido permite desplegarlo en servidores sin GPU.
- Clasificación de imágenes en tiempo real: con el token CLS y un clasificador lineal entrenado encima, puede usarse en sistemas de moderación de contenido o control de calidad visual en líneas de producción.
- Extracción de características para aprendizaje por transferencia: los embeddings congelados sirven como entrada para modelos downstream (regresión, clustering, clasificación) en dominios como imágenes médicas o satelitales, con bajo coste computacional.
- Sistemas de recomendación visual: en plataformas de comercio electrónico, el modelo puede generar representaciones de productos para recomendar artículos similares basándose en la apariencia.
- Aplicaciones embebidas y edge: al ejecutarse en CPU con un consumo de memoria pico de 52 MiB en f16, es viable en dispositivos con recursos limitados, como Raspberry Pi o cámaras inteligentes.
- Investigación en representaciones autosupervisadas: sirve como punto de partida para experimentos con JEPA, permitiendo comparar la calidad de los embeddings con otros métodos (DINOv2, iBOT) sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

Los datos de rendimiento se han medido sobre el modelo convertido a GGUF con el motor jepa.cpp, comparando con la referencia de PyTorch. No se han publicado resultados de benchmarks estándar como ImageNet top-1 o MMLU, ya que el modelo es un codificador de visión sin cabezal de clasificación entrenado.

| Prueba | Resultado |
|---|---|
| k-NN top-1 en Imagenette (f32, jepa.cpp) | 94.52 % |
| k-NN top-1 en Imagenette (f16, jepa.cpp) | 94.55 % |
| k-NN top-1 en Imagenette (q8_0, jepa.cpp) | 94.50 % |
| k-NN top-1 en Imagenette (q4_k, jepa.cpp) | 94.22 % |
| k-NN top-1 en Imagenette (PyTorch f32) | 94.45 % |
| Acuerdo con PyTorch (f32) | 99.85 % |
| Acuerdo con PyTorch (q4_k) | 99.08 % |
| Latencia en CPU (AMD Threadripper PRO 7995WX, 32 hilos, f16) | 13 ms por imagen |
| Latencia en GPU (NVIDIA RTX 4500 Ada, f16) | 1.1 ms por imagen |
| Pico de memoria RSS (f16) | 52 MiB |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere VRAM en CPU; en GPU, el modelo f16 ocupa aproximadamente 42 MiB de memoria de video.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, RTX 4500 Ada Generation) para aceleración; también funciona en CPU sin GPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluso en iGPUs, dado su tamaño de 22 M parámetros.
- Opciones de despliegue: jepa.cpp (motor nativo), API C integrable en aplicaciones propias; no compatible con vLLM, Ollama o TGI al ser un modelo de visión sin soporte en esos frameworks.
- Latencia y throughput: 13 ms por imagen en CPU de gama alta (32 hilos) y 1.1 ms en GPU RTX 4500 Ada, lo que permite procesar decenas de imágenes por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LeJEPA ViT-S/16 (este) | 21,7 M | 224x224 | Extracción de características de imagen | Apache 2.0 | GGUF |
| DINOv2 ViT-S/14 | 22 M | 518x518 (variable) | Extracción de características de imagen | Apache 2.0 | PyTorch, ONNX |
| iBOT ViT-S/16 | 22 M | 224x224 | Extracción de características de imagen | Apache 2.0 | PyTorch |

La comparativa se basa en el tamaño de parámetros y la tarea. DINOv2 e iBOT son alternativas establecidas en el campo de representaciones autosupervisadas para visión. LeJEPA se diferencia por su fundamento teórico (JEPA) y por la disponibilidad de una implementación GGUF ligera para CPU. No se dispone de comparativas de rendimiento directas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es exclusivamente un codificador de visión; no genera texto ni responde a instrucciones en lenguaje natural.
- La cuantización q4_k presenta una degradación notable en la calidad de los embeddings (coseno medio 0.970, peor token 0.843) y no alcanza el umbral de calidad para el token CLS derivado; se recomienda usar f16 o q8_0 para aplicaciones que requieran alta fidelidad.
- El modelo fue preentrenado en ImageNet-1k, por lo que puede heredar sesgos presentes en ese dataset (por ejemplo, sesgos geográficos o demográficos en las categorías).
- No se han publicado evaluaciones de sesgo o robustez para este modelo concreto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (OK-AI/lejepa-vits16-pretrain-in1k) debe verificarse para confirmar que no tiene restricciones adicionales.
- El motor jepa.cpp es una implementación relativamente nueva; la documentación y el soporte de la comunidad son limitados en comparación con frameworks establecidos como PyTorch.
- No se dispone de información sobre el rendimiento en tareas de segmentación, detección u otras tareas densas; solo se ha validado la extracción de características globales.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/jepacpp/lejepa-vits16-pretrain-in1k-GGUF
- Modelo base en HuggingFace: https://huggingface.co/OK-AI/lejepa-vits16-pretrain-in1k
- Repositorio del motor jepa.cpp: https://github.com/aselimc/jepa.cpp
- Documentación de jepa.cpp (API C, paridad, cuantización, rendimiento): https://aselimc.github.io/jepa.cpp/
- Repositorio del framework LeJEPA: https://github.com/galilai-group/lejepa
- Artículo arXiv de LeJEPA: https://arxiv.org/abs/2511.08544
- Documentación de arquitectura en DeepWiki: https://deepwiki.com/galilai-group/lejepa/1.2-architecture-overview
