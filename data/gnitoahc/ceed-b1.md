# gnitoahc/ceed-b1

## Resumen

CEED B1 es un fine-tuning LoRA del modelo vision-language `google/gemma-4-e4b-it`, desarrollado por gnitoahc (Chao-Ting, Chen) como parte del estudio CEED (Causal Expert–Evidence Distillation). Este checkpoint corresponde al **grupo de control B1** del estudio: se entrenó únicamente con cross-entropy sobre respuestas doradas, **sin teacher**, para aislar qué parte de la ganancia de los grupos destilados se debe a la destilación y cuál al fine-tuning convencional. El adaptador LoRA (rank 4) se ha fusionado en los pesos base, por lo que se carga como un modelo independiente, sin necesidad de PEFT ni código adicional.

El modelo está especializado en visual question answering (VQA) sobre documentos, gráficos e imágenes naturales, y se entrenó sobre 17.849 ejemplos de los datasets DocVQA, ChartQA y GQA. Con 7.941 millones de parámetros totales, es un VLM de tamaño medio que hereda la arquitectura del modelo base Gemma 4, aunque la documentación disponible no detalla la arquitectura interna (encoder de visión, etc.). Se publica como artefacto de investigación para reproducibilidad, no como producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en `google/gemma-4-e4b-it` (vision-language transformer, detalles no especificados) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un VLM de la familia Gemma 4 con pipeline `image-text-to-text`. Sobre este base se aplicó un adaptador LoRA de rango 4, que posteriormente se fusionó en los pesos del modelo, dando lugar a un checkpoint independiente. El entrenamiento se realizó con cross-entropy sobre las respuestas doradas de los datasets, sin ningún término de destilación (KD term = 0.0). El corpus de entrenamiento combina 2.500 ejemplos de ChartQA, 5.349 de DocVQA y 10.000 de GQA, con un split 80/10/10 por id de ejemplo y 2,69 pasadas sobre el split de entrenamiento. La cross-entropy final fue de 0,5048. No se documentan innovaciones técnicas adicionales más allá del propio diseño experimental del estudio CEED.

## Capacidades

- Visual question answering (VQA) sobre documentos (DocVQA), gráficos (ChartQA) e imágenes naturales (GQA).
- Generación de respuestas cortas a preguntas visuales, con instrucción de respuesta breve en el prompt.
- Fine-tuning LoRA fusionado, lo que permite cargarlo directamente con `AutoModelForImageTextToText` sin infraestructura PEFT.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe más allá del inglés.

## Casos de uso

- Extracción de información de documentos escaneados: el modelo puede responder preguntas concretas sobre el contenido de facturas, formularios o páginas, gracias a su entrenamiento en DocVQA.
- Análisis de gráficos y tablas: permite consultar valores, tendencias o comparativas a partir de imágenes de gráficos, útil en entornos de reporting automatizado.
- QA sobre imágenes naturales: responde preguntas sobre objetos, relaciones o escenas en fotografías, como base para sistemas de asistencia visual.
- Investigación en destilación de conocimiento: sirve como control experimental para comparar el efecto de la destilación frente al fine-tuning clásico en VLM.
- Prototipado de sistemas de VQA: al ser un checkpoint ligero (7,9B parámetros), puede desplegarse en entornos de prueba para validar flujos de pregunta-respuesta visual.
- Evaluación de fine-tuning LoRA en modelos multimodales: útil para estudiar la capacidad de adaptadores de bajo rango en tareas de VQA.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre su propio split de validación (10% de los datos), medidos con el harness CEED (`ceed-direct-1`) y decodificación greedy. **Estos números no son comparables con los leaderboards públicos** de DocVQA, GQA o ChartQA, ya que usan splits, prompts y decodificación diferentes.

| Dataset | Metrica | Score | n |
|---|---|---|---|
| DocVQA | ANLS | 0,8798 | 565 |
| GQA | Exact match | 0,6959 | 1016 |
| ChartQA | Relaxed accuracy | 0,7871 | 249 |

No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en FP16 (7,9B parámetros × 2 bytes), ~8 GB en cuantización de 8 bits, ~4 GB en 4 bits (estimación orientativa, no hay datos oficiales).
- GPUs recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16; GPUs con 8-12 GB pueden usar cuantización.
- No se indica si cabe en GPUs de consumo sin cuantizar; con cuantización 4 bits podría ejecutarse en una RTX 3060 (12 GB) o similar.
- Opciones de despliegue: compatible con la librería `transformers` (carga directa con `AutoModelForImageTextToText`), y potencialmente con vLLM, TGI u Ollama, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El autor no publica comparaciones con VLM de tamaño similar (p. ej., LLaVA, Phi-3-vision, etc.) ni con el modelo base sin fine-tuning. Se recomienda consultar el repositorio CEED para comparaciones internas entre grupos del estudio.

## Limitaciones y advertencias

- **Es un resultado LoRA**: la fusión del adaptador no convierte un LoRA de rango 4 en un fine-tuning completo. La capacidad del adaptador puede ser insuficiente para capturar señales complejas, por lo que cualquier comparación debe interpretarse con cautela.
- **No tiene teacher**: B1 es el grupo de control del estudio CEED, no un resultado de destilación. Su rendimiento refleja únicamente el efecto del fine-tuning supervisado.
- **Dominio limitado**: entrenado solo en VQA en inglés sobre documentos, gráficos e imágenes naturales. El comportamiento fuera de estos dominios no está probado.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en preguntas ambiguas o fuera de distribución.
- **Licencia Gemma**: el uso está sujeto a los términos de la licencia Gemma de Google, que pueden restringir ciertos usos comerciales o de alto riesgo.
- **No es un producto**: es un artefacto de investigación publicado para reproducibilidad; no se recomienda su uso directo en producción sin una evaluación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/gnitoahc/ceed-b1
- Repositorio GitHub del estudio CEED: https://github.com/GNITOAHC/ceed
- Documento de diseño CEED (ceed.md): https://github.com/GNITOAHC/ceed/blob/main/ceed.md
- Modelo derivado en FriendliAI (inferencia gestionada): https://friendli.ai/models/gnitoahc/ceed-b1-gemma4-e4b-it-0729
