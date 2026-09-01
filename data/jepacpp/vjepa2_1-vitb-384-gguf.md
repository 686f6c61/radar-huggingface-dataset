# jepacpp/vjepa2_1-vitb-384-GGUF

## Resumen

V-JEPA 2.1 ViT-B/16 a 384x384 es un encoder visual desarrollado por Meta AI, destilado desde un ViT-g más grande, y convertido a formato GGUF para el motor jepa.cpp, una implementación en C/C++ basada en ggml que permite ejecutar el modelo en CPU sin Python ni PyTorch. El modelo maneja tanto imágenes estáticas como clips de vídeo mediante dos tokenizadores diferenciados: el tokenizador de imagen para fotos y el tokenizador de tubelets para secuencias de vídeo. Con 110 millones de parámetros, una dimensión de 768, 12 capas y 12 cabezas de atención, ofrece extracción de características visuales de alta calidad con un coste computacional reducido.

La relevancia actual de este modelo radica en su capacidad para ejecutar inferencia de visión por ordenador en hardware modesto, sin dependencias de frameworks pesados, manteniendo una fidelidad numérica casi exacta respecto a la referencia en PyTorch. Su licencia MIT y su formato GGUF lo hacen especialmente atractivo para despliegues en producción, edge computing y aplicaciones embebidas donde el uso de GPU no es viable. Además, al ser un modelo self-supervised, sus características pueden adaptarse a múltiples tareas downstream sin necesidad de reentrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con predictor de latentes enmascarado |
| Parametros totales | 109.709.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (ademas q4_1, q5_0, q5_1, q5_k, q6_k generables localmente) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura V-JEPA 2.1, un Vision Transformer con un predictor de latentes enmascarado. El encoder procesa parches de 16x16 píxeles en imágenes de 384x384, y tubelets de 2 frames para vídeo. La destilación desde un ViT-g más grande permite comprimir el conocimiento en un modelo de 110M parámetros sin pérdida significativa de rendimiento. El entrenamiento es self-supervised, basado en el enmascaramiento de latentes y la predicción de representaciones, sin necesidad de etiquetas humanas. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni la composición del dataset en la documentación proporcionada.

La innovación principal reside en el manejo dual de modalidades: una imagen estática se procesa con el tokenizador de imagen y un vector de modalidad propio, mientras que un clip de vídeo utiliza el tokenizador de tubelets. El predictor de latentes enmascarado permite aprender representaciones densas y temporales, lo que mejora tareas como la estimación de profundidad o la navegación robótica, según el paper de V-JEPA 2.1.

## Capacidades

- Extraccion de características de imagen: genera embeddings de alta dimensión (768) para imágenes individuales, con opciones de pooling mean, cls, lewm o el mapa de tokens completo.
- Extraccion de características de vídeo: procesa clips de hasta 64 frames (medido) y produce representaciones temporales densas.
- Clasificación k-NN sin entrenamiento: permite clasificar acciones o escenas mediante similitud coseno sobre características congeladas, alcanzando 88.57% top-1 en UCF-101 con f32.
- Compatibilidad con múltiples cuantizaciones: f16 y q8_0 mantienen paridad con la referencia PyTorch, mientras que q4_0 y q4_k son configuraciones advisory para despliegues con restricciones de memoria.
- Ejecución en CPU pura: gracias a jepa.cpp, el modelo corre en procesadores x86 sin GPU, con un consumo de memoria de 948 MiB en f16.
- Interfaz C API: proporciona una cabecera única (jepa.h) para integración en aplicaciones C/C++ sin dependencias externas.

## Casos de uso

- Búsqueda de vídeo por similitud: indexar clips de vídeo en una base de datos usando las características extraídas y realizar consultas por similitud coseno. El modelo permite procesar clips de 16 frames en 853 ms en CPU, lo que facilita la indexación de grandes volúmenes de metraje.
- Clasificación de acciones en tiempo real: en sistemas de vigilancia o análisis deportivo, se pueden clasificar acciones humanas mediante k-NN sobre características congeladas, sin necesidad de entrenar un clasificador complejo. El rendimiento de 60 ms por imagen en CPU permite análisis en tiempo casi real.
- Extracción de características para aprendizaje por transferencia: usar el encoder como backbone congelado para tareas downstream como detección de objetos, segmentación semántica o estimación de profundidad, aprovechando las representaciones densas del modelo.
- Análisis de imágenes médicas: en entornos hospitalarios sin GPU, el modelo puede extraer características de radiografías o tomografías para clasificación o detección de anomalías, con la ventaja de la licencia MIT y la ejecución en hardware estándar.
- Sistemas de recomendación visual: generar embeddings de productos o imágenes de catálogo para recomendaciones basadas en similitud visual, procesando imágenes a 4.4 ms en GPU o 60 ms en CPU.
- Monitorización de procesos industriales: analizar secuencias de vídeo de líneas de producción para detectar anomalías o clasificar estados, utilizando el modo de vídeo del modelo con clips de 16 o 64 frames.

## Benchmarks y rendimiento

Los resultados de UCF-101 k-NN (10 clases, 105 clips de consulta, galería de 300, 16 frames por clip, k=20) se presentan a continuación:

| Backend | dtype | k-NN top-1 % | centroid top-1 % | k-NN agreement % | centroid agreement % | feature cosine |
|---|---:|---:|---:|---:|---:|
| PyTorch | f32 | 88.57 | 86.67 | — | — | — |
| jepa.cpp | f32 | 88.57 | 86.67 | 100.00 | 100.00 | 1.000000 |
| jepa.cpp | f16 | 89.52 | 86.67 | 99.05 | 100.00 | 1.000000 |
| jepa.cpp | q8_0 | 89.52 | 86.67 | 99.05 | 100.00 | 0.999988 |

En cuanto a velocidad, el encoder a f16 con 32 hilos en un AMD Ryzen Threadripper PRO 7995WX (96 núcleos) tarda 60 ms por imagen frente a 110 ms de PyTorch, 853 ms por clip de 16 frames frente a 908 ms, y 9036 ms por clip de 64 frames. En una NVIDIA RTX 4500 Ada Generation, el mismo procesamiento de imagen tarda 4.4 ms. El pico de RSS a f16 es de 948 MiB.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM si se ejecuta en CPU; en GPU, el modelo f16 ocupa aproximadamente 210 MB de memoria (209.7 MiB), y la versión q4_k unos 62 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para f16 (por ejemplo, RTX 2060, GTX 1660, o integradas modernas). Para máxima velocidad, una RTX 4500 Ada o superior.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en las de gama baja.
- Opciones de despliegue: jepa.cpp (motor principal), con soporte para CPU y GPU. No es compatible con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 60 ms por imagen en CPU (32 hilos), 4.4 ms en GPU RTX 4500 Ada; 853 ms por clip de 16 frames en CPU, 9036 ms por clip de 64 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Modalidades | Formato | Licencia | UCF-101 k-NN top-1 |
|---|---|---|---|---|---|---|
| V-JEPA 2.1 ViT-B/16 (este) | 110M | 384x384 | Imagen y vídeo | GGUF | MIT | 88.57% (f32) |
| V-JEPA 2.1 ViT-B/16 (original PyTorch) | 110M | 384x384 | Imagen y vídeo | PyTorch | CC-BY-NC 4.0 (según repo oficial) | 88.57% |
| V-JEPA 2 ViT-L (referencia) | ~300M | 384x384 | Vídeo | PyTorch | CC-BY-NC 4.0 | no disponible en la información |

La comparativa se limita a la información disponible. El modelo GGUF ofrece el mismo rendimiento que el original PyTorch con la ventaja de la licencia MIT y la ejecución en CPU. No se dispone de datos de otros encoders de vídeo como VideoMAE o TimeSformer en la documentación consultada.

## Limitaciones y advertencias

- No es un modelo generativo: solo extrae características; no puede generar imágenes, vídeo ni texto.
- Sin soporte de texto: no procesa lenguaje natural, por lo que no es adecuado para tareas multimodales que requieran comprensión de texto.
- Sesgos potenciales: al ser entrenado con datos de vídeo de internet, puede presentar sesgos en el reconocimiento de acciones o escenas poco representadas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las características pueden ser poco discriminativas para clases no vistas durante el entrenamiento.
- Cuantizaciones por debajo de 8 bits (q4_0, q4_k) son advisory: no garantizan paridad con la referencia y pueden degradar el rendimiento en tareas que requieren precisión por token.
- Licencia del modelo original: aunque este repo usa MIT, el modelo base de Meta tiene una licencia CC-BY-NC 4.0 (no comercial) en su versión oficial; verificar los términos de uso para aplicaciones comerciales.
- Requiere jepa.cpp: no es compatible con librerías estándar como transformers o timm; la integración se limita al ecosistema jepa.cpp.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jepacpp/vjepa2_1-vitb-384-GGUF
- Motor jepa.cpp (GitHub): https://github.com/aselimc/jepa.cpp
- Documentación de jepa.cpp: https://aselimc.github.io/jepa.cpp/
- Paper V-JEPA 2.1 (arXiv 2506.09985): https://arxiv.org/abs/2506.09985
- Paper V-JEPA 2.1 dense features (arXiv 2603.14482): https://arxiv.org/html/2603.14482v1
- Repositorio oficial V-JEPA 2 (facebookresearch/vjepa2): https://github.com/facebookresearch/vjepa2
- Conversión alternativa en HuggingFace (apiantonio/vjepa2.1-vit-base-384): https://huggingface.co/apiantonio/vjepa2.1-vit-base-384
