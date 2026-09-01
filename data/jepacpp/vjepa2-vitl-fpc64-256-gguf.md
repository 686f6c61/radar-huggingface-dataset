# jepacpp/vjepa2-vitl-fpc64-256-GGUF

## Resumen

V-JEPA 2 ViT-L/16 es un modelo de visión por computador desarrollado por Meta AI (FAIR) para aprendizaje autosupervisado de representaciones de video. Esta ficha describe la conversión a formato GGUF publicada por el usuario jepacpp, diseñada para el motor jepa.cpp, una implementación en C/C++ basada en ggml que permite ejecutar el modelo en CPU sin Python ni PyTorch. El modelo original, `facebook/vjepa2-vitl-fpc64-256`, tiene 326 millones de parámetros, arquitectura ViT-L/16 con tubelets de dos frames y 3-D RoPE, y procesa clips de 64 frames a resolución 256×256. La conversión GGUF mantiene la paridad con el modelo de referencia en PyTorch y añade cuantizaciones para despliegue ligero en entornos sin GPU.

La relevancia de esta conversión radica en que democratiza el uso de un modelo de video de última generación en hardware modesto: con un solo binario y un archivo GGUF se puede extraer características de video en CPU, algo que antes requería una pila Python completa con PyTorch y GPU. El modelo es útil para tareas de clasificación, recuperación y codificación de video, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/16 (Vision Transformer) con tubelets de 2 frames y 3-D RoPE |
| Parametros totales | 325.971.328 (326 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de video, procesa clips de 64 frames a 256×256) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (tambien q4_1, q5_0, q5_1, q5_k, q6_k generables localmente) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base original) |

## Arquitectura y entrenamiento

V-JEPA 2 es un modelo de la familia JEPA (Joint Embedding Predictive Architecture) desarrollado por Meta AI. A diferencia de los modelos generativos que predicen píxeles, JEPA aprende representaciones predictivas en un espacio latente: el modelo procesa una secuencia de frames de video y predice las representaciones de los tubelets (grupos de 2 frames) enmascarados a partir de los visibles. La arquitectura es un Vision Transformer de 24 capas, 16 cabezas de atención, dimensión de embedding 1024 y patch de 16×16 píxeles. Utiliza 3-D RoPE (rotary position embedding tridimensional) en un layout "tiled" de Meta, donde todo el clip se procesa en un único grafo.

El entrenamiento es completamente autosupervisado, sin etiquetas humanas, sobre grandes corpus de video. El modelo original fue publicado por FAIR con pesos en safetensors; la conversión GGUF de jepacpp reproduce exactamente la arquitectura y los pesos, incluyendo las dimensiones, el esquema posicional, la receta de preprocesado y las etiquetas de clase cuando existen, todo incrustado en el archivo GGUF. No se aplicó ningún ajuste fino adicional en la conversión.

## Capacidades

- Extracción de características de video: genera embeddings por clip, por frame o por token, con opciones de pooling (`mean`, `cls`, `lewm` o `none` para el mapa completo de tokens).
- Clasificación de video: mediante k-NN sobre características congeladas, sin entrenamiento adicional (ver benchmarks UCF-101).
- Recuperación de video (video retrieval): los embeddings aprendidos permiten buscar clips similares por similitud coseno.
- Codificación de video: produce representaciones compactas de clips para almacenamiento o transmisión.
- Procesamiento de clips largos: soporta clips de hasta 64 frames (y más, según la memoria disponible) en una sola pasada.
- Inferencia en CPU: gracias a jepa.cpp, funciona sin GPU ni dependencias de Python, con soporte para múltiples hilos.
- Cuantización: varios niveles de precisión (f32, f16, q8_0, q4_0, q4_k) para ajustar el equilibrio entre exactitud y uso de memoria.

## Casos de uso

- Clasificación de acciones en video: un sistema de videovigilancia puede extraer características de clips de 16 frames con `jepa-embed` y clasificarlas con un clasificador lineal o k-NN, sin necesidad de GPU. El modelo alcanza un 89,52 % de top-1 en UCF-101 con k-NN sobre características congeladas.
- Moderación de contenido en plataformas de video: los embeddings permiten detectar categorías problemáticas (violencia, contenido explícito) comparando similitud coseno con una galería de ejemplos etiquetados, actualizable sin reentrenar el modelo.
- Búsqueda semántica de video: un buscador interno puede indexar miles de clips codificándolos con `--pool mean` y responder consultas por similitud de embeddings, funcionando en servidores CPU económicos.
- Análisis de video deportivo: extraer características de jugadas para agruparlas por tipo (goles, faltas, saques) y alimentar sistemas de análisis táctico, con la ventaja de ejecutarse en hardware local sin costes de API.
- Preprocesado para aprendizaje por transferencia: usar el modelo como extractor de características para entrenar cabezas específicas (clasificación fina, detección de anomalías) sobre datasets pequeños, aprovechando que las características congeladas son de alta calidad.
- Despliegue en edge computing: al ser un único binario C/C++ con GGUF, puede integrarse en dispositivos embebidos o servidores sin runtime de Python, ideal para cámaras inteligentes o sistemas de tiempo real con latencia controlada (821 ms por clip de 16 frames en CPU de gama alta).

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados de clasificación k-NN en UCF-101 (10 clases, 105 clips de consulta, galería de 300, 16 frames por clip, k=20, voto coseno sobre características congeladas) y la velocidad de inferencia medida en el repositorio jepa.cpp.

| Backend | dtype | k-NN top-1 % | centroid top-1 % | k-NN agreement % | centroid agreement % | feature cosine |
|---|---:|---:|---:|---:|---:|
| PyTorch | f32 | 88.57 | 95.24 | — | — | — |
| jepa.cpp | f16 | 89.52 | 95.24 | 99.05 | 100.00 | 0.999996 |
| jepa.cpp | q8_0 | 89.52 | 95.24 | 99.05 | 100.00 | 0.999886 |

Velocidad de inferencia (encoder f16, 32 hilos):

- CPU AMD Ryzen Threadripper PRO 7995WX (96 núcleos): 821 ms por clip de 16 frames; 6388 ms por clip de 64 frames.
- GPU NVIDIA RTX 4500 Ada Generation: 46,5 ms por clip de 16 frames.
- Pico de RSS en f16: 1034 MiB.

No se han publicado resultados de benchmarks adicionales (como K400, Something-Something) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el modelo f16 ocupa aproximadamente 622 MiB de memoria, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan (probado en RTX 4500 Ada); para CPU, se recomienda un procesador con al menos 8 núcleos y 4 GB de RAM libre.
- Cabe en GPU de consumo: sí, incluso en tarjetas de gama baja (GTX 1650, RTX 3050) gracias al tamaño reducido.
- Opciones de despliegue: jepa.cpp (motor nativo), con API C en un solo header (`include/jepa.h`); también se puede usar el modelo original en PyTorch para investigación.
- Latencia y throughput: en CPU de gama alta (Threadripper PRO 7995WX) se procesan aproximadamente 1,2 clips de 16 frames por segundo; en GPU RTX 4500 Ada, unos 21,5 clips por segundo. El uso de cuantización q8_0 reduce el uso de memoria sin pérdida significativa de precisión en tareas agrupadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de extracción de características de video (como VideoMAE, TimeSformer o MViT) en la información proporcionada. La comparación más relevante es con el modelo original en PyTorch, que muestra una paridad casi exacta en f16 y q8_0 (feature cosine > 0.9998). La ventaja principal de esta conversión es la portabilidad: el mismo rendimiento en CPU sin dependencias, mientras que las alternativas suelen requerir PyTorch y GPU.

## Limitaciones y advertencias

- Advertencia específica del autor: si se consumen tokens individuales del modelo (no solo el embedding agrupado), se recomienda usar la versión f32. El checkpoint contiene un cluster degenerado de tokens de baja norma que la activación f16 dentro de ggml colapsa, lo que degrada la precisión por token en f16 y q8_0. Las características agrupadas (pooled) no se ven afectadas.
- Sesgos conocidos: al ser un modelo entrenado con datos de video no filtrados, puede reflejar sesgos de los datos de origen (género, etnia, contexto cultural) en las representaciones aprendidas.
- Riesgo de alucinación: no aplica directamente, al ser un modelo de visión sin generación de texto; sin embargo, las características pueden producir falsos positivos en tareas de clasificación si la galería de referencia es pequeña o poco representativa.
- Limitaciones de contexto: el modelo procesa clips de video, no texto; no soporta entradas multimodales (texto + video) en esta conversión.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el modelo base de Meta puede tener términos adicionales (revisar la licencia original de V-JEPA 2).
- Caveat para producción: la cuantización q4_0 y q4_k se considera "advisory" (por debajo de 8 bits por peso) y no garantiza paridad; se recomienda validar la precisión en el caso de uso concreto antes de desplegar.

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/jepacpp/vjepa2-vitl-fpc64-256-GGUF
- Modelo base original: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Repositorio oficial de V-JEPA 2 (PyTorch): https://github.com/facebookresearch/vjepa2
- Repositorio de jepa.cpp: https://github.com/aselimc/jepa.cpp
- Documentación de paridad: https://aselimc.github.io/jepa.cpp/parity/
- Documentación de cuantización: https://aselimc.github.io/jepa.cpp/quantization/
- Documentación de precisión: https://aselimc.github.io/jepa.cpp/accuracy/
- Documentación de rendimiento: https://aselimc.github.io/jepa.cpp/performance/
- API C de jepa.cpp: https://aselimc.github.io/jepa.cpp/api/
- Paper de V-JEPA 2 (arXiv): https://arxiv.org/abs/2506.09985
