# anerjy/Spark-X2.6-4B-4bit-mlx

## Resumen

Spark-X2.6-4B-4bit-mlx es una redistribución de los pesos cuantizados a 4 bits en formato MLX del modelo XHToken/Spark-X2.6-4B, un modelo de lenguaje compacto de propósito general orientado a despliegue en dispositivo («on-device deployment») desarrollado por XHToken. El repositorio lo publica el usuario anerjy y no introduce ninguna modificación sobre los pesos: según la model card, `model.safetensors` es idéntico (mismo SHA-256) a la conversión comunitaria abenzerps/Spark-X2.6-4B-MLX-4bit, de la que solo se conservan los seis ficheros necesarios para un cargador local.

El modelo base pertenece a la serie Spark-X2.6, sucesora de Spark-X2.5-4B, y según la documentación del proyecto mantiene exactamente la misma arquitectura que la generación anterior. Cuenta con 4.112.079.360 parámetros totales (aproximadamente 4,1 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este repositorio es acotada: no es un modelo nuevo ni una conversión original, sino un paquete mínimo (2,3 GB) pensado para cargar el modelo cuantizado en Apple Silicon mediante MLX. Para evaluar el modelo en sí, la referencia autorizada es el repositorio del modelo base y la documentación del proyecto en GitHub.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la documentación del proyecto indica que mantiene la misma arquitectura que Spark-X2.5-4B, sin especificarla) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 4-bit afín (affine), group size 64; la puerta de atención por cabeza (head-wise attention gate) se mantiene en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX (repositorio de 2,3 GB, seis ficheros) |
| Modelo base | XHToken/Spark-X2.6-4B |
| Conversión de origen | abenzerps/Spark-X2.6-4B-MLX-4bit (pesos sin cambios, SHA-256 verificado) |
| Librería | mlx |
| Pipeline | text-generation (solo texto) |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la información proporcionada. La documentación del proyecto en GitHub describe Spark-X2.6-4B como la última generación de modelos de lenguaje compactos y de propósito general de XHToken para despliegue en dispositivo, e indica que conserva exactamente la misma arquitectura que Spark-X2.5-4B, sin detallar cuál es.

La única innovación técnica documentada en este repositorio es la relativa a la cuantización: se aplica cuantización afín de 4 bits con tamaño de grupo 64 sobre los pesos, pero se preserva la puerta de atención por cabeza en bf16 para limitar la degradación de calidad en ese componente sensible. No hay información pública en el material disponible sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en modo solo texto: el repositorio declara explícitamente «text only» y el pipeline es text-generation.
- Modelo de propósito general para despliegue local, según la descripción del proyecto del modelo base.
- No se documentan en el material disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo «thinking».
- No se especifican capacidades multilingües ni la lista de idiomas soportados.
- La cuantización a 4 bits reduce los requisitos de memoria a costa de una posible pérdida de precisión respecto al modelo en bf16; no se han publicado evaluaciones de esa pérdida.

## Casos de uso

- Asistentes locales en macOS: cargar los pesos con `mlx_lm` en un Mac con Apple Silicon para generar texto sin conexión ni envío de datos a la nube, aprovechando que el paquete ocupa 2,3 GB y cabe en equipos con memoria unificada modesta.
- Prototipado rápido de aplicaciones de escritorio: integrar el modelo mediante mlx-swift en una app nativa de macOS para tareas de redacción, resumen o reescritura de texto, con latencia local y sin coste por token.
- Procesamiento por lotes de documentos en local: ejecutar tareas de extracción o reformateo de texto sobre ficheros sensibles (contratos, informes internos) que no pueden salir de la máquina del usuario.
- Evaluación comparativa de cuantizaciones: usar este repositorio como referencia de la variante 4-bit MLX frente al modelo base en bf16, para medir la degradación introducida por la cuantización en una tarea concreta.
- Generación de texto en entornos con hardware limitado: escenarios de demo o educación donde se necesita un modelo de ~4B parámetros ejecutándose en un portátil, sin GPU dedicada.
- Base para ajuste fino ligero o experimentación con MLX: al estar en formato MLX y licencia Apache 2.0, sirve como punto de partida para pruebas de adaptación (LoRA) en Apple Silicon, siempre que se valide previamente la calidad del modelo base.
- No se recomienda para cargas de producción en servidor con GPU NVIDIA: el formato MLX no es directamente compatible con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio ni los resultados de búsqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni del modelo base ni de esta cuantización.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos en 4 bits ocupan aproximadamente 2,3 GB; con overhead del runtime, tokenizador y caché KV para contextos cortos, es razonable reservar del orden de 3-4 GB de memoria. Para contextos largos, la caché KV crece de forma proporcional a la longitud de contexto (no se dispone de la longitud máxima soportada).
- GPU recomendadas: este repositorio está en formato MLX, por lo que el hardware objetivo es Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada. No es utilizable directamente en A100, H100 ni RTX 4090 sin convertir los pesos a otro formato.
- Cabe en GPU de consumo: en el caso de Apple Silicon, sí; cualquier Mac con 8 GB o más de memoria unificada debería poder cargarlo, aunque se recomienda 16 GB para trabajar con comodidad. En GPUs NVIDIA de consumo requeriría reconvertir los pesos.
- Opciones de despliegue: `mlx_lm` (Python) y mlx-swift para aplicaciones nativas de Apple. El modelo base dispone de una distribución en Ollama bajo el identificador SparkLLM/Spark-X2.6-4B, publicada por el autor original y no equivalente a esta cuantización concreta. Para vLLM, TGI o llama.cpp sería necesario convertir los pesos desde el modelo base a safetensors estándar o GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos alternativos en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo:

| Modelo | Parámetros | Formato / cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anerjy/Spark-X2.6-4B-4bit-mlx (este repositorio) | 4,11 B | MLX safetensors 4-bit afín, group size 64, puerta de atención en bf16 | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| abenzerps/Spark-X2.6-4B-MLX-4bit | 4,11 B | MLX safetensors 4-bit (misma conversión de origen) | no disponible | Apache 2.0 (heredada del base) | Hugging Face |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | safetensors en precisión completa (bf16/fp16, no confirmado) | no disponible | Apache 2.0 | Hugging Face, GitHub, ModelScope, Ollama |
| Spark-X2.5-4B (generación anterior) | no disponible | no disponible | no disponible | no disponible | Referenciado en la documentación del proyecto |

Comparación con otras familias de modelos de ~4B parámetros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es una redistribución, no una conversión original: el autor (anerjy) no ha entrenado ni cuantizado el modelo, y no ofrece garantías propias más allá de la verificación del SHA-256 frente a la conversión de abenzerps.
- El repositorio presenta 0 descargas y 0 «likes», sin historial de uso que permita validar su correcto funcionamiento en producción.
- La etiqueta `custom_code` implica que la carga puede requerir ejecución de código remoto (`trust_remote_code=True`), lo que supone un riesgo de seguridad si no se audita antes el código incluido.
- La cuantización a 4 bits introduce pérdida de precisión respecto al modelo en bf16; no se han publicado evaluaciones que cuantifiquen esa degradación.
- No hay información sobre sesgos, datos de entrenamiento, idiomas soportados ni riesgo de alucinación específico del modelo base; deben asumirse los riesgos habituales de un modelo de lenguaje de 4B parámetros.
- La longitud de contexto no está documentada, lo que impide planificar cargas con ventanas largas.
- El formato MLX limita el despliegue a Apple Silicon; no es portable directamente a servidores con GPU NVIDIA.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentación sobre el modelo base obliga a realizar una evaluación propia antes de utilizarlo en producción.
- Al no haber benchmarks publicados, no es posible comparar su calidad con alternativas de tamaño similar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anerjy/Spark-X2.6-4B-4bit-mlx
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Conversión comunitaria de origen: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-4bit
- Repositorio GitHub del proyecto: https://github.com/XHToken/Spark-X2.6
- Distribución en Ollama del modelo base: https://ollama.com/SparkLLM/Spark-X2.6-4B
- Modelo base en ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.6-4B
