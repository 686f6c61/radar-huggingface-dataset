# Jundot/Qwen3.8-27B-oQ6e-mtp

## Resumen

Qwen3.8-27B-oQ6e-mtp es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.781 millones de parámetros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante su herramienta oQ (oMLX v0.7.3), y su propósito es hacer viable la inferencia del modelo original en hardware Apple Silicon reduciendo el peso en disco y en memoria de aproximadamente 55 GB en BF16 a 23,9 GB, manteniendo una media efectiva de 6,872 bits por peso.

El checkpoint incluye los tres componentes del modelo original: el backbone de lenguaje (26.896B parámetros), el codificador de visión (0.461B) y la cabeza de predicción multi-token o MTP (0.425B). Soporta entrada de imagen y vídeo junto con texto, y conserva la ventana de contexto nativa de 262.144 tokens del modelo base. La cuantización no es uniforme: oQ6e asigna bits según la sensibilidad medida de cada capa, de modo que el 88,3 % de los pesos queda en 6 bits afín con grupo de 64, el 9,8 % sube a 8 bits y un 1,9 % permanece en BF16.

Su relevancia es doble. Por un lado, demuestra que un VLM denso de 27B con contexto de 256K puede ejecutarse en un Mac con memoria unificada de gama alta, algo impracticable con los pesos originales. Por otro, la inclusión de la cabeza MTP permite decodificación especulativa nativa, lo que compensa parte del coste de inferencia que introduce la cuantización. La licencia Apache-2.0 heredada del modelo base elimina además las restricciones de uso comercial habituales en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y Gated Attention (Qwen3.5), más codificador de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Mezcla de 6 bits afín grupo 64 (88,345 % de los pesos), 8 bits afín grupo 64 (9,798 %) y BF16 (1,857 %); media efectiva de 6,872 bits/peso en el checkpoint completo y 6,700 en el backbone de lenguaje |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); repo de 23,9 GB, 22,226 GiB de almacenamiento efectivo |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea un layout híbrido que combina capas Gated DeltaNet con capas de Gated Attention, una configuración orientada a reducir el coste de atención en contextos muy largos sin renunciar a la calidad de un transformer convencional. A esto se suma un codificador de visión de 0,461B parámetros que habilita la comprensión conjunta de imagen y vídeo, y una cabeza de predicción multi-token (MTP) de 0,425B parámetros que permite generar varios tokens por paso de verificación mediante decodificación especulativa.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo original. Lo que sí está documentado es el proceso de cuantización: oQ6e mide la sensibilidad de cada capa, asigna la precisión en consecuencia y redondea cada grupo con una matriz de importancia construida a partir de 128 muestras de 512 tokens, seguida de un reajuste por mínimos cuadrados ponderados de la escala y el sesgo del grupo. Esta técnica de refit es la que permite bajar a 6 bits sin el deterioro típico de las cuantizaciones uniformes de 4 o 5 bits.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de 262.144 tokens, suficiente para procesar libros completos o bases de código extensas en una sola pasada.
- Comprensión de imágenes: el pipeline declarado es `image-text-to-text`, con un codificador de visión dedicado de 0,461B parámetros.
- Comprensión de vídeo, según se indica explícitamente en la model card del checkpoint.
- Predicción multi-token (MTP) para decodificación especulativa, que acelera la generación al proponer y verificar varios tokens por paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y razonamiento agéntico multi-paso: no disponible en la información proporcionada para este checkpoint concreto; debe verificarse contra la model card del modelo base Qwen/Qwen3.8-27B.
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes anuales o expedientes completos y responder preguntas sobre ellos sin fragmentación ni recuperación externa, todo en un Mac sin conexión a servicios en la nube.
- Procesamiento de vídeo para catalogación: el codificador de visión y el soporte de vídeo permiten generar descripciones, resúmenes por escenas o metadatos indexables a partir de grabaciones, útil en archivos audiovisuales y medios de comunicación.
- Asistencia sobre capturas y diagramas técnicos: interpretación de diagramas de arquitectura, esquemas eléctricos o pantallazos de errores para generar explicaciones y pasos de resolución, aprovechando la entrada multimodal.
- Investigación en privacidad de datos: al ejecutarse íntegramente en hardware local con MLX, permite trabajar con imágenes médicas, documentos legales o datos personales sin que salgan del dispositivo, lo que simplifica el cumplimiento del RGPD.
- Prototipado rápido en estaciones de trabajo Apple: desarrolladores que necesitan validar un pipeline multimodal antes de comprometerse con infraestructura GPU pueden usar este checkpoint con la librería `mlx` y migrar después al modelo completo o a una cuantización GGUF.
- Generación asistida en edición de contenido: redacción de pies de foto, alt-text accesible y descripciones de producto a partir de imágenes, con la ventaja de que el proceso corre en local y el coste marginal por imagen es cero.
- Evaluación comparativa de cuantizaciones: investigadores que estudien la degradación de calidad en cuantización de precisión mixta pueden usar este checkpoint como referencia de 6,87 bits frente a alternativas de 4 y 8 bits del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 22,2 GiB solo para los pesos; con overhead de contexto y caché KV para 262.144 tokens, se recomienda un mínimo de 32 GB de memoria unificada, y 64 GB o más para explotar contextos muy largos o procesar vídeo.
- El formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3 y M4, en variantes Pro, Max y Ultra). No es ejecutable en GPU NVIDIA o AMD sin reconversión.
- En un Mac con 32 GB de memoria unificada el modelo cabe, pero el contexto disponible quedará limitado; en un Mac Studio o MacBook Pro con 64 GB o 128 GB se puede usar la ventana completa con margen.
- Despliegue: librería `mlx` de Apple y el stack oMLX del mismo autor (https://github.com/jundot/omlx). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan pesos MLX de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP debería mejorar el throughput respecto a una decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ6e-mtp | 27,781B | 262.144 | MLX safetensors, 6,87 bits/peso | Apache-2.0 | Cuantización mixta con MTP y visión; 23,9 GB |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | safetensors BF16 | Apache-2.0 | Modelo original sin cuantizar; requiere aproximadamente el doble de memoria |
| Otras cuantizaciones del mismo base (4 u 8 bits) | 27,781B | 262.144 | MLX o GGUF | Apache-2.0 | No disponible el detalle de autores ni métricas de calidad comparadas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con el modelo base ni con cuantizaciones alternativas.

## Limitaciones y advertencias

- Al tratarse de una cuantización de 6,87 bits/peso, existe una degradación esperada frente al modelo en BF16, especialmente en tareas de razonamiento matemático y generación de código, donde los errores de redondeo se acumulan. No se han publicado métricas que cuantifiquen esa pérdida.
- El checkpoint está atado al ecosistema MLX: no es portable a GPU NVIDIA, AMD ni a servidores x86 sin reconversión, lo que limita su uso en producción convencional.
- El autor advierte de que el modelo se recuantizó el 29 de octubre de 2026 con oMLX 0.7.3; las copias descargadas antes de esa fecha deben volver a descargarse para obtener la versión corregida.
- Riesgo de alucinación inherente a los modelos de lenguaje de 27B, agravado en tareas de OCR o lectura de imágenes de baja resolución o con texto denso.
- Idiomas soportados no documentados en esta ficha: conviene verificar la cobertura real del modelo base antes de desplegarlo en productos dirigidos a mercados no anglófonos.
- La información sobre tool calling, function calling y modo de razonamiento no está confirmada para este checkpoint; debe contrastarse con la documentación del modelo base.
- La licencia Apache-2.0 permite uso comercial sin restricciones de atribución más allá de las habituales, pero dicha licencia se hereda del modelo base y no ha sido verificada de forma independiente en esta ficha.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Pull request de la mejora oQe: https://github.com/jundot/omlx/pull/4930
