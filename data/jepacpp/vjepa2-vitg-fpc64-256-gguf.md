# jepacpp/vjepa2-vitg-fpc64-256-GGUF

## Resumen

V-JEPA 2 ViT-g/16 (fpc64, 256) es un modelo de extracción de características de video desarrollado por Meta FAIR, presentado en el paper "V-JEPA 2: Robust Video Models for Visual Representation Learning" (arXiv:2506.09985). Este repositorio contiene la conversión a formato GGUF del encoder original de 1.034.555.264 parámetros, realizada por el usuario jepacpp para su uso con el motor jepa.cpp, una implementación en C/C++ basada en ggml que permite ejecutar el modelo en CPU sin dependencias de Python ni PyTorch.

La relevancia de esta conversión radica en que democratiza el acceso a un modelo de visión de última generación: el encoder ViT-g/16 con 40 capas, 1408 dimensiones ocultas y 22 cabezas de atención, procesa clips de 64 frames a resolución 256×256 mediante tubelets de 2 frames y RoPE 3D. Al estar serializado en GGUF, el modelo puede ejecutarse con un único binario y un único archivo de pesos, lo que simplifica enormemente el despliegue en entornos de producción, edge o investigación sin GPU.

El repositorio incluye cinco cuantizaciones (f32, f16, q8_0, q4_0, q4_k) con métricas de paridad medidas frente a la referencia PyTorch, lo que permite elegir el equilibrio adecuado entre precisión y uso de memoria. La licencia Apache-2.0 del modelo original se mantiene en los archivos GGUF, que incluyen metadatos de licencia y origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-g/16) con tubelets de 2 frames y RoPE 3D |
| Parametros totales | 1.034.555.264 (1.03 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa clips de 64 frames a 256×256) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (GGUF) |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo original V-JEPA 2 ViT-g/16 es un encoder de video basado en Vision Transformer con 40 capas, dimension oculta de 1408, 22 cabezas de atencion y FFN de 6144 dimensiones. Procesa clips de 64 frames (fpc64) a resolucion 256×256, dividiendo el video en tubelets de 2 frames (patch 16, tubelet 2). La atencion utiliza RoPE 3D en un layout "tiled" propio de Meta, y el modelo completo se ejecuta como un unico grafo computacional.

El entrenamiento del modelo original no se detalla en la informacion proporcionada, pero el paper de V-JEPA 2 describe un enfoque de pretraining autoregresivo sobre representaciones latentes, escalando datos y modelo. La conversion a GGUF no modifica los pesos; solo re-serializa los tensores y aplica cuantizacion cuando el nombre del archivo lo indica. El proceso de conversion y cuantizacion esta documentado en el repositorio jepa.cpp, con scripts de verificacion de paridad frente a la referencia PyTorch.

## Capacidades

- Extraccion de caracteristicas de video: genera embeddings por token y por clip completo, con opciones de pooling `mean`, `cls`, `lewm` o `none` (mapa de tokens completo).
- Clasificacion de video: el modelo base puede usarse como backbone para clasificacion de acciones (existen variantes con cabezal clasificador, como el modelo ViT-L/16 SSv2 del mismo autor).
- Ejecucion en CPU: gracias a jepa.cpp, el modelo se ejecuta en CPU sin GPU, con soporte para multiples hilos (`-t 32`).
- Cuantizacion flexible: cinco niveles de precision (f32, f16, q8_0, q4_0, q4_k) para adaptarse a distintos requisitos de memoria y precision.
- Metadatos integrados: el archivo GGUF contiene dimensiones, esquema posicional, receta de preprocesado y licencia, lo que permite inferencia con un solo binario y un solo archivo.
- API C: jepa.cpp ofrece una API C de un solo header (`jepa.h`) para integracion en aplicaciones propias.

## Casos de uso

- Busqueda de video por similitud: extraer embeddings de clips con pooling `mean` y almacenarlos en una base de datos vectorial para recuperacion por similitud semantica. El modelo es adecuado porque produce caracteristicas densas de alta calidad, y la ejecucion en CPU permite procesar grandes volumenes sin coste de GPU.
- Clasificacion de acciones en video: usar el encoder como backbone para un clasificador de acciones (como el modelo SSv2 del mismo autor). La salida de tokens puede alimentar una cabeza lineal o MLP para reconocimiento de actividades en tiempo real o batch.
- Analisis de video en servidores sin GPU: desplegar el modelo en instancias CPU-only para tareas de moderacion de contenido, analisis de video vigilancia o indexacion de archivos multimedia, gracias a la ejecucion eficiente en CPU con jepa.cpp.
- Generacion de descriptores para video retrieval en motores de busqueda: indexar videos de un corpus con embeddings de clip y usar esos descriptores para busqueda por texto o por ejemplo visual. El pooling `lewm` (likely-important-window mean) puede mejorar la robustez frente a variaciones temporales.
- Investigacion en representaciones de video: utilizar el modelo como extractor de caracteristicas para experimentos de few-shot learning, transfer learning o evaluacion de metodos de cuantizacion. La disponibilidad de cuantizaciones con metricas de paridad permite estudiar el impacto de la precision en tareas downstream.
- Pipeline de preprocesado para modelos generativos: usar los embeddings de V-JEPA 2 como condicionamiento para modelos de texto-a-video o video-a-texto, aprovechando la riqueza de las representaciones latentes. La salida `none` (mapa de tokens completo) es util para tareas que requieren informacion espaciotemporal detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de vision y no de lenguaje. En su lugar, el repositorio proporciona metricas de paridad y calidad de cuantizacion medidas frente a la referencia PyTorch:

| Metrica | f32 | f16 | q8_0 | q4_0 | q4_k |
|---|---|---|---|---|---|
| Coseno medio por token (last_hidden_state) | exacto | 0.99986 (mediana) | no disponible | no disponible | no disponible |
| Peor token (coseno) en clip de 2048 tokens | — | 0.30 | no disponible | no disponible | no disponible |
| Error relativo maximo en CPU f32 | 0.999975 (coseno) | — | — | — | — |

Los archivos f32 y f16 se consideran de "parity" (reproducen la referencia PyTorch dentro de los umbrales establecidos), mientras que q8_0 tambien pasa los umbrales de paridad. Las cuantizaciones q4_0 y q4_k se marcan como "advisory" (por debajo de 8 bits por peso) y sus resultados se reportan pero no se garantiza la paridad. Para consumo de tokens individuales se recomienda f32; para features agrupadas (pooled), f16 es suficiente.

## Requisitos de hardware

- CPU: el modelo se ejecuta en CPU pura mediante jepa.cpp, sin necesidad de GPU. Se recomienda un procesador moderno con soporte para instrucciones vectoriales (AVX2 o similar) y multiples nucleos.
- RAM: el archivo f16 ocupa 1974.9 MiB, q8_0 1056.7 MiB, q4_0/q4_k 564.8 MiB. Se necesita RAM suficiente para cargar el archivo completo mas overhead de ejecucion (aproximadamente 1.5× el tamano del archivo).
- GPU: no requerida. El modelo puede ejecutarse en cualquier hardware con CPU, incluidos servidores sin GPU, laptops o dispositivos edge.
- Opciones de despliegue: jepa.cpp (compilacion con CMake), API C, linea de comandos (`jepa-embed`). No se menciona soporte para vLLM, Ollama o TGI, ya que es un motor especifico para este tipo de modelos.
- Latencia y throughput: no se proporcionan cifras exactas, pero la ejecucion con 32 hilos en CPU es el escenario de referencia en las pruebas de paridad. El rendimiento dependera del numero de nucleos y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Ejecucion |
|---|---|---|---|---|---|
| V-JEPA 2 ViT-g/16 (original) | 1.03 B | 64 frames, 256×256 | Apache-2.0 | PyTorch/safetensors | GPU (PyTorch) |
| V-JEPA 2 ViT-g/16 (GGUF, este repo) | 1.03 B | 64 frames, 256×256 | Apache-2.0 | GGUF | CPU (jepa.cpp) |
| V-JEPA 2 ViT-L/16 (GGUF, mismo autor) | ~300 M (estimado) | 16 frames, 256×256 | MIT (variante SSv2) | GGUF | CPU (jepa.cpp) |

La comparativa directa con otros encoders de video (p.ej. VideoMAE, TimeSformer) no esta disponible en la informacion proporcionada. La principal diferencia frente al modelo original es el formato y la posibilidad de ejecucion en CPU, manteniendo los mismos pesos y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: V-JEPA 2 es un encoder de representaciones, no genera texto ni video. Para tareas de generacion se necesita un decodificador adicional.
- Cuantizaciones por debajo de 8 bits (q4_0, q4_k) se consideran "advisory": pueden degradar la calidad de los embeddings, especialmente en tokens individuales. Para uso en produccion se recomienda f16 o q8_0.
- El peor token en f16 puede presentar un coseno de 0.30 frente a la referencia, lo que indica que tokens aislados pueden ser poco fiables. Se recomienda usar pooling (mean, cls, lewm) para obtener caracteristicas robustas.
- El modelo esta disenado para clips de 64 frames a 256×256; no se garantiza el funcionamiento con otras resoluciones o duraciones sin reentrenamiento o adaptacion.
- No se proporcionan datos sobre sesgos o alucinaciones, al ser un modelo de vision y no linguistico. Sin embargo, como cualquier modelo entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y citar el paper original (arXiv:2506.09985) segun las practicas academicas.
- El repositorio jepa.cpp es un proyecto independiente (codigo MIT) y puede no tener el mismo nivel de soporte o estabilidad que las herramientas oficiales de Meta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jepacpp/vjepa2-vitg-fpc64-256-GGUF
- Modelo original: https://huggingface.co/facebook/vjepa2-vitg-fpc64-256
- Repositorio jepa.cpp: https://github.com/aselimc/jepa.cpp
- Paper V-JEPA 2: https://arxiv.org/abs/2506.09985
- Repositorio oficial V-JEPA 2 (Meta): https://github.com/facebookresearch/vjepa2
- Documentacion de jepa.cpp (paridad, cuantizacion, rendimiento): https://aselimc.github.io/jepa.cpp/
