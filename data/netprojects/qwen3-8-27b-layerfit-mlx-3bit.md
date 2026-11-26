# netprojects/Qwen3.8-27B-LayerFit-MLX-3bit

## Resumen

Qwen3.8-27B LayerFit MLX 3-bit es una cuantización de 3 bits del modelo Qwen/Qwen3.8-27B, publicada por NetProjects (Paris Michalas) y optimizada específicamente para Apple Silicon mediante el framework MLX. El modelo base es un transformer multimodal de la familia Qwen3.5 con aproximadamente 28.200 millones de parámetros, capaz de procesar entradas de imagen y texto (pipeline `image-text-to-text`) y con una ventana de contexto de 262.000 tokens. La cuantización emplea la técnica propietaria LayerFit, que asigna un número variable de bits por capa en función de la sensibilidad medida de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) en lugar de aplicar una cuantización uniforme.

El resultado es un artefacto de 13,1 GB en disco que cabe en Macs de 24 GB de memoria unificada, manteniendo la torre de visión en bf16 y el cabezal de predicción multi-token (MTP) del modelo base en 8 bits para acelerar la decodificación. Es relevante porque permite ejecutar un modelo multimodal de casi 28B parámetros en hardware de consumo Apple con pérdida de calidad medida y acotada, algo que las cuantizaciones uniformes de 3 bits no consiguen con la misma fidelidad.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se dispone de información independiente sobre el modelo base Qwen3.8-27B más allá de lo citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), con atención lineal y predicción multi-token (MTP); pesos en formato MLX |
| Parametros totales | 28.206.101.232 (28,2B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantizacion | 3 bits con asignación por capa (LayerFit); torre de visión en bf16; cabezal MTP en 8 bits. La familia incluye variantes 2-bit, 2.5-bit, 4-bit, 6-bit y 8-bit |
| Idiomas soportados | No disponible (la model card menciona pruebas en inglés, otros idiomas, código, tool calls y matemáticas, pero no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (compatible con mlx-lm, mlx-vlm y LM Studio) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de la familia Qwen3.5 que combina bloques de atención estándar con bloques de atención lineal, e incorpora una torre de visión para entradas de imagen. Dispone de un cabezal de predicción multi-token (MTP) que permite decodificación especulativa usando el propio modelo como borrador. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la card del modelo base, no incluida en la documentación proporcionada.

La innovación de esta publicación es la cuantización LayerFit: en lugar de aplicar el mismo número de bits a todas las capas, se mide primero la degradación de cada componente (MLP de cada capa, atención, bloques de atención lineal, embeddings y cabeza de salida) a baja precisión, y después se distribuye un presupuesto fijo de bits allí donde más contribuye a la fidelidad. El resultado, según el autor, es un artefacto del mismo tamaño que una cuantización uniforme pero con mejor calidad: 88,6% de acuerdo Top-1 con bf16 frente a 84,4% de la cuantización uniforme de 3 bits, y una reducción del 38% en la divergencia KL. La receta exacta se publica en `layerfit-recipe.json`. No se especifican los datos de calibración más allá de la descripción del harness (32 pasajes de 512 tokens en inglés, otros idiomas, código, tool calls y matemáticas).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Comprensión de imágenes (pipeline `image-text-to-text`): descripción, respuesta a preguntas visuales y entradas mixtas imagen-texto.
- Razonamiento con modo "thinking" (la model card reporta pruebas de tool calls con thinking 2/2 y sin thinking 3/3).
- Llamada a herramientas y function calling, validado en las pruebas del autor.
- Generación de código, con pruebas de coding 3/3 según el autor.
- Razonamiento matemático (GSM8K-50: 43/50 con thinking desactivado en esta build).
- Decodificación especulativa mediante el cabezal MTP integrado, que eleva el throughput de 41 a 51 tok/s en un M5 Max según el autor.
- Capacidades multilingües: la model card menciona pruebas en "otros idiomas" pero no detalla la cobertura.

## Casos de uso

- Asistente local en Mac de 24 GB: el modelo cabe en memoria unificada con un prompt de 8K tokens consumiendo 15,0 GB de pico, lo que permite mantener conversaciones multi-turno con contexto largo sin conexión a servicios en la nube.
- Análisis de documentos e imágenes en escritorio: la torre de visión en bf16 permite extraer información de capturas, diagramas o fotografías y combinarla con texto en un mismo prompt, útil para herramientas de productividad locales.
- Automatización de tareas con tool calling: el soporte validado de function calling permite integrar el modelo en flujos de agentes que invocan APIs, leen ficheros o ejecutan comandos en un entorno controlado.
- Generación y revisión de código en el editor: con 262K de contexto puede procesar repositorios o ficheros extensos y mantener el hilo de una sesión de programación, integrándose en LM Studio o mediante mlx-lm.
- Procesamiento por lotes en local para investigación: al ejecutarse con mlx-lm y mlx-vlm estándar, se puede usar en scripts de evaluación o generación masiva sin depender de GPUs dedicadas.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como banco de pruebas para pipelines image-text-to-text antes de escalar a hardware de servidor, gracias a su compatibilidad con el ecosistema MLX.
- Razonamiento matemático asistido: útil para tutoring o verificación de cálculos en entornos educativos, con la cautela de que la precisión en GSM8K-50 es de 43/50 y requiere validación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (harness propio, pesos de lenguaje, 32 pasajes × 512 tokens, comparación contra su conversión MLX bf16; GSM8K-50 con thinking desactivado):

| Metrica | 3-bit uniforme | LayerFit 3-bit |
|---|---|---|
| Acuerdo Top-1 con bf16 | 84,4% | 88,6% |
| Error KL | baseline | 38% menor |
| GSM8K-50 | 44/50 | 45/50 |

Métricas adicionales de esta build concreta:

| Metrica | Valor |
|---|---|
| Acuerdo Top-1 con bf16 (12-prompt card check) | 93,5% (KL 0,061) |
| GSM8K-50 (thinking off) | 43/50 |
| Tool calls (coding / thinking) | 3/3 y 2/2 |
| Entrada de imagen | Pasa |
| Memoria pico con prompt de 8K tokens | 15,0 GB |
| Decodificación en M5 Max | 41 tok/s (51 tok/s con MTP) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, etc.) del modelo base ni de esta cuantización; el autor remite a la card de Qwen3.8-27B para los resultados oficiales.

## Requisitos de hardware

- VRAM/memoria unificada: 13,1 GB en disco; pico de 15,0 GB con prompt de 8K tokens. Recomendado para Macs de 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series). El autor reporta pruebas en un M5 Max; no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en Macs de 24 GB o más. Para Macs de 16 GB existe la variante 2-bit (9,1 GB, solo texto) y la 2.5-bit (11,5 GB); para 32 GB, la 4-bit (16,5 GB).
- Opciones de despliegue: mlx-vlm (multimodal), mlx-lm (texto), LM Studio. Compatible con el formato MLX estándar.
- Latencia y throughput: 41 tok/s en decodificación y 51 tok/s con MTP en un M5 Max, según el autor (medición indicativa, máquina no silenciosa).
- Ajuste opcional: para la variante stretch en 16 GB, el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` (persiste hasta reiniciar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B LayerFit MLX 3-bit (este) | 28,2B | 262K | 3-bit por capa, torre de visión bf16, MTP 8-bit | Apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B LayerFit MLX 4-bit | 28,2B | 262K | 4-bit por capa | Apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B LayerFit MLX 2-bit | 28,2B | 262K | 2-bit por capa, solo texto | Apache-2.0 | Hugging Face, MLX |
| Qwen/Qwen3.8-27B (base) | 28,2B | 262K | bf16 | Apache-2.0 | Hugging Face |
| Builds uniformes 6-bit / 8-bit (lmstudio-community, mlx-community) | 28,2B | 262K | 6-bit u 8-bit uniforme | Apache-2.0 | Hugging Face, MLX |

No se dispone de datos de rendimiento comparativo con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits introduce degradación medible: 88,6% de acuerdo Top-1 con bf16 y KL no nula; no es equivalente al modelo en bf16 para tareas sensibles a la precisión.
- GSM8K-50 con thinking desactivado cae a 43/50 en esta build concreta, frente a 45/50 en la medición general de LayerFit; el rendimiento matemático es variable.
- El modelo base puede alucinar y presentar sesgos; la model card no documenta evaluaciones de sesgo ni de seguridad.
- La cobertura de idiomas no está especificada; las pruebas del autor se centran en inglés y "otros idiomas" sin detallar.
- El rendimiento de decodificación reportado (41/51 tok/s) corresponde a un M5 Max y no es extrapolable a otros chips.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Alibaba Cloud ni al equipo de Qwen; LayerFit es una marca registrada de NetProjects.
- El modelo está pensado para Apple Silicon y el ecosistema MLX; no se garantiza su funcionamiento en otras plataformas sin conversión adicional.
- Con 0 descargas y 0 likes en el momento de la consulta, no existe validación comunitaria independiente de las métricas reportadas por el autor.
- El nombre del modelo ("Qwen3.8-27B") y las fechas de creación (2026-11-26) deben tratarse con cautela: no se ha podido verificar de forma independiente la existencia del modelo base.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 2-bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2bit
- Variante 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2.5bit
- Variante 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
