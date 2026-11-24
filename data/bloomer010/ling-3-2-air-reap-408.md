# bloomer010/Ling-3.2-air-REAP-408

## Resumen

Ling-3.2-air-REAP-408 es una variante podada del modelo multimodal inclusionAI/Ling-3.2-air, publicada por el usuario bloomer010 en Hugging Face. Se trata de un artefacto de investigación que aplica REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999) sobre la arquitectura MoE híbrida de Ling-3.2-air, eliminando 104 de los 512 expertos enrutados por capa (un 20 % del total). El resultado pasa de 124B parámetros totales a aproximadamente 100,3B, manteniendo los 5,5B parámetros activos del modelo original.

El modelo conserva la torre de visión intacta y se distribuye en safetensors FP8 nativos, con el bloque NextN/MTP omitido. Está pensado para quienes quieran evaluar el impacto del podado de expertos en un modelo multimodal de gran tamaño sin reentrenamiento ni recuperación posterior: el autor no aplicó fine-tuning tras la poda, lo que lo convierte en una referencia útil para medir la degradación pura del pruning one-shot.

Es relevante ahora porque los modelos MoE de escala media-alta (100B+) con capacidades de visión y vídeo son costosos de desplegar, y técnicas como REAP prometen reducir huella de memoria y coste de inferencia preservando el enrutamiento agrupado top-k. La licencia MIT y el formato FP8 facilitan su experimentación, aunque se trata de un artefacto de investigación sin benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido multimodal (bailing_hybrid / bailingmoe3, clase `BailingMoeV3VL`) |
| Parametros totales | 100.301.128.336 (~100,3B) |
| Parametros activos | ~5,5B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos nativos en FP8; builds GGUF en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), custom_code (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air emplea una arquitectura MoE híbrida con 512 expertos enrutados por capa, organizados en 8 grupos de enrutamiento (`n_group=8`) con enrutamiento top-k agrupado, y 64 expertos por grupo. La variante REAP-408 conserva 408 de esos 512 expertos por capa (51 de 64 por grupo), eliminando uniformemente el 20 % de menor puntuación en cada grupo para preservar la coherencia del enrutamiento agrupado. La torre de visión no se modificó y el bloque NextN/MTP (multi-token prediction) se omitió en esta build.

El proceso de poda es REAP one-shot: cada experto se puntúa como el producto del valor de la puerta del router por la norma L2 de su salida, calculado sobre un conjunto de calibración de 653K tokens (1.024 muestras) con una mezcla del 75 % código, 15 % matemáticas y razonamiento, y 10 % chat general. No hubo fine-tuning ni entrenamiento de recuperación tras la poda, por lo que las capacidades del modelo resultante dependen enteramente de la robustez del pruning. El modelo base original fue entrenado por inclusionAI; esta variante no aporta datos nuevos de entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `image-text-to-text`).
- Comprensión de imágenes y vídeo, al conservar la torre de visión del modelo base.
- Razonamiento y matemáticas, presumiblemente heredados del modelo base (sin benchmarks que lo confirmen en esta variante).
- Generación de código, con sesgo de calibración hacia código (75 % del dataset de poda).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación del impacto del pruning de expertos: usar el modelo como referencia para medir la degradación de calidad frente al Ling-3.2-air original (124B) en tareas de razonamiento y código, dado que no hubo recuperación tras la poda.
- Investigación en eficiencia de MoE: comparar latencia, memoria y throughput de los 408 expertos frente a los 512 originales en el mismo hardware, aislando el efecto del número de expertos.
- Prototipado de asistentes multimodales: desplegar un modelo image-text-to-text de ~100B con licencia MIT para experimentar con descripción de imágenes y vídeo en entornos de investigación.
- Generación de código asistida: aprovechar la calibración orientada a código (75 %) para probar tareas de completado y explicación de código en pipelines internos.
- Fine-tuning posterior a la poda: partir de esta build como inicialización para un entrenamiento de recuperación propio, ya que el autor no lo hizo y la licencia MIT lo permite.
- Estudio de técnicas de compresión: servir como caso de estudio reproducible de REAP aplicado a un modelo multimodal de más de 100B parámetros, con el paper arXiv:2510.13999 como referencia metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8 nativos (~100,3B parámetros), se requiere aproximadamente 100 GB solo para pesos, más overhead de activaciones y caché KV; con cuantización GGUF de 4 bits (repo hermano) podría reducirse a unos 50-55 GB, aunque no se han publicado cifras oficiales.
- GPU recomendadas: para FP8 nativo, GPUs con soporte FP8 como H100 (80 GB) en configuración multi-GPU (2x H100 o superior); A100 de 80 GB requeriría conversión o sharding. Para GGUF cuantizado, posible en 2x RTX 4090 (48 GB) o una RTX 6000 Ada (48 GB) con cuantizaciones agresivas.
- ¿Cabe en consumer GPU? No en FP8 nativo; con GGUF de 4 bits podría caber en configuraciones de 48 GB o en una sola GPU de 64 GB con cuantización más baja, sin datos confirmados.
- Opciones de despliegue: requiere `trust_remote_code=True` por el código custom `BailingMoeV3VL`; el repo hermano GGUF sugiere soporte vía llama.cpp/Ollama, aunque no se confirma en la información disponible. vLLM o TGI no están confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-REAP-408 | ~100,3B | ~5,5B | no disponible | MIT | Variante podada sin recuperación |
| inclusionAI/Ling-3.2-air | 124B | 5,5B | no disponible | no disponible | Modelo base original, 512 expertos |
| Alternativas de ~100B MoE | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación experimental: el propio autor lo etiqueta como "experimental REAP" y no publica benchmarks, por lo que se desconoce la degradación real frente al modelo base.
- Sin fine-tuning de recuperación: la poda one-shot puede haber eliminado expertos relevantes para dominios poco representados en la calibración (el 10 % de chat general y el 15 % de matemáticas frente al 75 % de código sugiere un sesgo hacia código).
- Riesgo de alucinación: no cuantificado en esta variante; el modelo base puede alucinar y la poda podría agravarlo en tareas fuera de la distribución de calibración.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Longitud de contexto no disponible: impide planificar despliegues con ventanas largas.
- Requiere `trust_remote_code=True`: ejecuta código custom del repositorio, lo que implica un riesgo de seguridad en producción y complica la integración con frameworks estándar.
- Bloque NextN/MTP omitido: no se puede usar decodificación especulativa basada en MTP con esta build.
- Licencia MIT: permite uso comercial, pero al derivar de un modelo base cuya licencia no se detalla en la información disponible, conviene verificar los términos del modelo original antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de terceros sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-408
- Repositorio GGUF hermano: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-408-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Paper REAP: https://arxiv.org/abs/2510.13999
