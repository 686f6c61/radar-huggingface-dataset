# N-Mehdi/nexttrack-retrieval

## Resumen

nexttrack-retrieval es un paquete de recuperación (retrieval bundle) publicado por N-Mehdi dentro del proyecto next-track-rec, orientado a sistemas de recomendación musical. No se trata de un modelo generativo de lenguaje, sino de un artefacto de inferencia que empaqueta un codificador SASRec exportado a ONNX, junto con las embeddings de ítems y las tablas auxiliares (popularidad, conteos, artista y álbum) congeladas al final del día de validación. Su función es transformar el historial reciente de escucha de un usuario en un vector latente que permita recuperar candidatos de la siguiente canción.

El modelo se ha entrenado a partir del dataset yandex/yambda (licencia Apache-2.0) en su variante de 50 millones de eventos, y se distribuye con la etiqueta de configuración `a_d128_e60`, que sugiere una dimensión de embedding de 128 y una longitud de secuencia de 60. El repositorio ocupa 0,7 GB y contiene pesos en formato ONNX, lo que facilita su despliegue en entornos de producción con runtime de ONNX Runtime sin dependencias de frameworks de deep learning completos.

Es relevante ahora porque los sistemas de recomendación de próxima escucha en streaming musical exigen latencias muy bajas y artefactos ligeros que puedan servirse junto a un motor de búsqueda vectorial. Este bundle está pensado precisamente para esa fase de recuperación: genera un vector de usuario a partir de las últimas 200 escuchas de tipo Listen+, y deja la fase de ranking a componentes posteriores del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SASRec (self-attentive sequential recommendation) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 200 eventos de escucha recientes (entrada del codificador); secuencia de entrenamiento configurada como `e60` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; depende de metadatos de ítems) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (codificador) más embeddings y tablas de ítems |

## Arquitectura y entrenamiento

El componente principal es un codificador SASRec, una arquitectura transformer autorregresiva con atención sobre secuencias de ítems que modela dependencias de orden en el historial de escucha. El bundle incluye además las embeddings de ítems y tablas auxiliares de popularidad, conteos, artista y álbum, congeladas al cierre del día de validación para garantizar consistencia entre entrenamiento y servicio. La etiqueta `a_d128_e60` indica una dimensión de embedding de 128 y una longitud de secuencia de 60 en la configuración de entrenamiento.

El entrenamiento se realizó sobre el dataset yandex/yambda en su variante de 50 millones de eventos, un corpus público de interacciones musicales con licencia Apache-2.0. La model card no detalla el número exacto de tokens o eventos efectivos usados en el ajuste, la composición del dataset ni si se aplicaron técnicas de regularización como dropout o negative sampling específicas. Tampoco se documentan innovaciones técnicas adicionales más allá del empaquetado en ONNX y la separación explícita entre fase de recuperación y fase de ranking.

## Capacidades

- Codificación de historial de escucha: convierte las últimas 200 escuchas de tipo Listen+ de un usuario en un vector de usuario para búsqueda por similitud.
- Recuperación de candidatos: permite hacer nearest-neighbor sobre las embeddings de ítems incluidas en el bundle para proponer la siguiente canción.
- Aprovechamiento de señales auxiliares: incorpora tablas de popularidad, conteos, artista y álbum que pueden usarse para filtrado o re-ranking ligero.
- Inferencia en ONNX: compatible con ONNX Runtime y con pipelines de servicio que no requieran PyTorch.
- Reproducibilidad del estado de validación: las tablas están congeladas al final del día de validación, lo que facilita evaluaciones offline consistentes.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto; es un modelo puramente de recomendación.

## Casos de uso

- Recomendación de próxima canción en streaming: el codificador transforma el historial reciente del usuario en un vector y se consulta un índice vectorial de las embeddings de ítems para devolver los candidatos más probables, aprovechando la ventana de 200 eventos para capturar preferencias de sesión.
- Fase de recuperación en pipelines de dos etapas: se usa como primer escalón (retrieval) que alimenta a un modelo de ranking más costoso, reduciendo el espacio de búsqueda de millones de canciones a unos cientos de candidatos.
- Personalización de playlists automáticas: dado el historial de escucha, se generan secuencias candidatas que luego se filtran por reglas de negocio usando las tablas de artista y álbum incluidas.
- Evaluación offline de sistemas de recomendación: al congelar las tablas al cierre del día de validación, el bundle sirve como referencia reproducible para comparar variantes de recuperación sin fugas de información temporal.
- Arranque en frío parcial: las tablas de popularidad y conteos permiten combinar la señal secuencial con un prior global para usuarios con historial escaso, aunque el modelo no está diseñado específicamente para cold start total.
- Servicio de bajo coste en CPU: al estar en ONNX y ocupar 0,7 GB, puede desplegarse en instancias CPU para picos de tráfico o entornos con GPU limitada, reservando la GPU para la fase de ranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,7 GB) se estima que el conjunto de pesos cabe holgadamente en menos de 2 GB en FP32, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas; al ser un modelo pequeño en ONNX, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, y probablemente también CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de memoria libre, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (principal), y potencialmente servidores compatibles con ONNX como Triton Inference Server; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| nexttrack-retrieval | SASRec en ONNX | 200 eventos de escucha | Apache-2.0 | Hugging Face (N-Mehdi) |
| SASRec original (referencia académica) | Transformer autorregresivo | Configurable | Código de investigación | Repositorio académico |
| Alternativas de retrieval musical en producción | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría. La comparación con el SASRec original es únicamente arquitectónica y no se han verificado métricas equivalentes.

## Limitaciones y advertencias

- Es un modelo de recomendación, no un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- La model card no documenta sesgos conocidos; al entrenarse sobre yandex/yambda, puede heredar sesgos de popularidad y de la distribución de usuarios del dataset original.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de recomendaciones irrelevantes o repetitivas si el historial del usuario es atípico o muy corto.
- Las tablas de ítems están congeladas al final del día de validación; cualquier ítem nuevo posterior no estará cubierto y requerirá reindexación.
- No se especifican idiomas soportados ni cobertura geográfica; la calidad puede degradarse fuera de la distribución del dataset de origen.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset yandex/yambda y de las embeddings derivadas antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No hay información sobre cuantizaciones, latencias medidas ni pruebas de carga, por lo que el dimensionamiento de producción debe hacerse con benchmarks propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/N-Mehdi/nexttrack-retrieval
- Repositorio del proyecto: https://github.com/N-Mehdi/next-track-rec
- Dataset de origen: https://huggingface.co/datasets/yandex/yambda
