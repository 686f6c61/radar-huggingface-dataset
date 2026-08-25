# Exmanq/ncii-light-guard-v01

## Resumen

NCII-Light-Guard v0.1 es un modelo ligero de clasificación de texto desarrollado por Exmanq (publicado bajo el nombre de organización `hfmlsoc`) para puntuar el riesgo de que una instrucción de edición de imágenes pueda facilitar la creación de **imágenes íntimas no consentidas (NCII, por sus siglas en inglés)**. El modelo aborda un problema emergente: los modelos de edición fotográfica con preservación de identidad son cada vez más capaces, y algunos reguladores como la UE están introduciendo obligaciones para que los desplegadores añadan salvaguardas específicas contra el "nudificado" de personas reales sin su consentimiento.

Técnicamente, es un clasificador binario de texto basado en el encoder `microsoft/harrier-oss-v1-270m` (~270M parámetros), afinado con LoRA de rango 8 y fusionado para despliegue. El modelo final tiene 268.099.456 parámetros y se distribuye en formato `safetensors` (~0.6 GB). Su salida es una etiqueta (`safe` o `ncii`) con una probabilidad asociada. Está pensado para ser un filtro de prompts extremadamente ligero y fácil de integrar, no para ser un sistema de moderación exhaustivo ni una garantía legal de consentimiento.

La relevancia actual del modelo radica en que ofrece una capa de protección computacionalmente eficiente para desplegadores de modelos de edición de imágenes, que pueden integrarlo como un paso previo a la ejecución de cualquier petición de edición. Su licencia MIT permite uso comercial sin restricciones, y su tamaño lo hace viable incluso en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en `microsoft/harrier-oss-v1-270m`) |
| Parametros totales | 268.099.456 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo base en fp32; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | principal: inglés; cierta capacidad multilingüe residual (no evaluada sistemáticamente) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto basado en un **encoder transformer** de ~270M parámetros, derivado del modelo `microsoft/harrier-oss-v1-270m`. Durante el afinamiento se aplicó un LoRA de rango 8 sobre las capas del encoder, y posteriormente se fusionaron los pesos para producir el modelo final desplegable. La tarea es clasificación binaria de texto: `safe` (riesgo bajo) vs `ncii` (riesgo de NCII).

El entrenamiento se realizó sobre un conjunto de datos de prompts de edición de imágenes. Los ejemplos "presumiblemente seguros" provienen de diversos datasets públicos de prompts de edición de imágenes, incluyendo algunos datasets de evaluación (lo que se señala como una posible contaminación de evaluación). Los ejemplos positivos sintéticos fueron generados con Cursor Grok 4.5 (modelo que, según el autor, aceptó la tarea cuando otros modelos de peso abierto la rechazaron), produciendo 1.000 ejemplos de NCII y sus variantes "seguras" para crear ejemplos contrastivos. Además, se incluyeron prompts de CivitAI reformulados como instrucciones de edición y anotados por el mismo modelo.

Después del primer entrenamiento, se realizó una re-anotación manual de ~1.400 ejemplos ambiguos o erróneos. Los splits se crearon con un enfoque de agrupamiento por similitud de prompts, con todos los clústeres de riesgo NCII representados en train. El split final contiene 16.817 ejemplos de train, 781 de validación y 971 de test, con una proporción de positivos (NCII) del 7,1%, 7,2% y 7,2% respectivamente.

## Capacidades

- Clasificación binaria de texto: etiqueta `safe` (riesgo bajo) o `ncii` (riesgo de NCII) con probabilidad asociada.
- Detecta instrucciones de edición de imágenes que podrían implicar desnudar o sexualizar a una persona real en una foto.
- Funciona como un filtro de prompts ligero y de baja latencia, adecuado para integrarse en pipelines de edición de imágenes.
- Soporta entrada de texto simple (prompt) y salida de etiqueta + score.
- Compatible con la API de `transformers` (pipeline `text-classification`) y con `text-embeddings-inference`.
- Capacidad multilingüística residual (el entrenamiento fue principalmente en inglés, pero el pre-training del modelo base le otorga cierta transferencia).
- Integrable como herramienta de moderación en sistemas de edición de imágenes (por ejemplo, en el proyecto FireRed-Image-Edit-1.0-Fast se usa como guarda de seguridad antes de ejecutar la edición).

## Casos de uso

- **Moderación de prompts en aplicaciones de edición de imágenes**: cualquier servicio que permita a usuarios editar fotos de personas puede integrar este modelo como un filtro previo. Si la probabilidad de `ncii` supera un umbral, se bloquea la solicitud o se muestra un aviso. Es adecuado porque es ligero y puede ejecutarse en tiempo real sin penalizar la experiencia del usuario.
- **Cumplimiento normativo**: plataformas sujetas a regulaciones que exigen medidas de protección contra NCII (como la futura normativa europea) pueden usar este modelo como parte de su estrategia de mitigación, documentando su integración como un control técnico.
- **Guardia en modelos de edición de imágenes de código abierto**: proyectos como FireRed-Image-Edit-1.0-Fast ya integran este modelo como un paso de seguridad antes de ejecutar el modelo de edición. Esto es un caso de uso real y documentado.
- **Filtrado de prompts en demos públicas**: si una empresa publica una demo de edición de imágenes, puede usar este modelo para reducir el riesgo de abuso sin añadir una latencia perceptible.
- **Investigación y desarrollo de medidas de mitigación**: el modelo puede servir como punto de partida para investigar métodos de detección de NCII a nivel de prompt, o para comparar con otros enfoques (por ejemplo, modelos de moderación generalistas).
- **Sistemas de control de contenido en aplicaciones de mensajería**: aunque el modelo está pensado para prompts de edición, podría adaptarse para filtrar instrucciones de manipulación de imágenes en chats de soporte o comunidades de usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que se evaluó el modelo en un test de validación y test, y que el F1 reportado es "in-distribution para el conjunto construido", pero no se proporcionan los valores numéricos. Además, se advierte de que algunos prompts de benchmarks públicos de edición de imágenes se incluyeron en el entrenamiento como negativos "presumiblemente seguros", por lo que los resultados de evaluación podrían estar contaminados y no representar un rendimiento real en datos no vistos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 268M parámetros, lo que en fp32 ocupa ~1.1 GB de memoria. Con cuantización a int8 (con herramientas como `bitsandbytes`), se reduce a ~0.3 GB. En fp16, ocupa ~0.55 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo en fp32 (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4). Para despliegues de alta concurrencia, una T4 o A10 es suficiente.
- **¿Cabe en una GPU de consumo?**: sí, cabe en prácticamente cualquier GPU moderna, incluso en CPUs con un rendimiento aceptable para uso puntual.
- **Opciones de despliegue**: se puede servir con `transformers` (pipeline), con `text-embeddings-inference` (compatible), o convertirlo a ONNX (ya existe una conversión en `prithivMLmods/hfmlsoc_ncii-light-guard-v01-ONNX`). También se puede integrar en vLLM, aunque no es un LLM generativo.
- **Latencia**: se estima una latencia de inferencia de pocos milisegundos en GPU (por debajo de 10 ms) y de ~50-100 ms en CPU para un prompt corto. No hay datos oficiales publicados.

## Comparativa con modelos similares

No hay datos de benchmarks oficiales que permitan una comparación directa con otros modelos de moderación de prompts. Sin embargo, se puede comparar cualitativamente con alternativas de la misma categoría (filtros de prompts para moderación de contenido):

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **NCII-Light-Guard v0.1** | 268M | Clasificación binaria NCII | Texto | MIT | HuggingFace |
| LlamaGuard-2-8B | 8B | Moderación de contenido (prompt/response) | Texto | Llama 2 Community License | HuggingFace |
| OpenAI Moderation API | no disponible | Moderación de texto general | Texto | API propietaria | API |

La comparación con LlamaGuard-2-8B es relevante porque es un modelo de moderación de contenido de uso general, pero es mucho más pesado (8B) y no está específicamente entrenado para NCII. NCII-Light-Guard es mucho más ligero y especializado, pero su cobertura es menor y su capacidad de generalización es limitada. No hay datos cuantitativos que permitan una comparación justa.

## Limitaciones y advertencias

- **Solo texto**: el modelo no ve la imagen; no conoce la identidad ni el contexto de la foto, por lo que su evaluación se basa únicamente en el texto de la instrucción.
- **Idioma**: entrenado principalmente en inglés; su rendimiento en otros idiomas es incierto y no ha sido evaluado sistemáticamente.
- **Sesgos de género**: el autor reconoce que el modelo muestra discrepancias significativas dependientes del género en los ejemplos de prueba, y no ha sido evaluado para otros factores sociales (orientación sexual, tamaño corporal, etc.).
- **No es una garantía legal o de seguridad**: las etiquetas `safe` y `ncii` son heurísticas, no determinan intención, consentimiento ni daño real.
- **Contaminación de evaluación**: algunos prompts de benchmarks públicos de edición se incluyeron en el entrenamiento como negativos "presumidos seguros", por lo que el rendimiento reportado puede ser optimista para esos benchmarks.
- **Sensibilidad a variaciones de estilo**: el autor advierte de que "T2I tag soup", otros idiomas y frases adversarias son más difíciles de detectar. No es un filtro a prueba de jailbreaks.
- **No es un sistema de moderación integral**: es una capa ligera, pensada para reducir el abuso, no para eliminarlo por completo. Debe complementarse con otras medidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Exmanq/ncii-light-guard-v01
- Modelo original del autor: https://huggingface.co/hfmlsoc/ncii-light-guard-v01
- Base model: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Versión ONNX: https://huggingface.co/prithivMLmods/hfmlsoc_ncii-light-guard-v01-ONNX
- Testing Space (proporcionado por el autor): https://huggingface.co/spaces/yjernite/test-ncii-promptguard
- Proyecto FireRed-Image-Edit-1.0-Fast (integración de ejemplo): https://github.com/PRITHIVSAKTHIUR/FireRed-Image-Edit-1.0-Fast/tree/main
