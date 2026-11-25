# sergolsub/mlx-clef-flash-9B

## Resumen

sergolsub/mlx-clef-flash-9B es una conversión a 8 bits en formato MLX del modelo Cloudflare/clef-flash, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante `mlx_lm`. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución cuantizada de los pesos originales en bf16, sin reentrenamiento ni cambios de arquitectura, orientada a reducir el espacio en disco y la memoria residente necesaria para inferencia en hardware de Apple.

El modelo base, Cloudflare/clef-flash, es un modelo de aproximadamente 8.950 millones de parámetros (8.953.803.264 según los safetensors) con arquitectura etiquetada como `qwen3_5` y un modo de decisión específico basado en cabezas de clasificación (tipo `noul`, `choice` y `score`). La conversión conserva ese comportamiento y añade el pegamento de inferencia necesario (`clef_mlx.py`, `decision_config.json`, `joint_config.json`, `joint_head.safetensors`) para ejecutar decisiones estructuradas en lugar de generación de texto libre.

Su relevancia es práctica: permite ejecutar un modelo de casi 9B en un Mac mini M4 Pro de 48 GB con un pico de memoria residente de unos 11,5 GB y una latencia mediana de decisión de 737 ms, manteniendo una calidad prácticamente idéntica a la versión bf16 original (KL medio de salida de 2,48e-04). La licencia Apache 2.0 heredada del modelo original facilita su uso comercial, aunque con las cautelas propias de un artefacto derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura etiquetada `qwen3_5`; incluye atención lineal (`linear_attn`) y cabezas de decisión (`joint_head`) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe también una versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Cloudflare/clef-flash) |
| Formato de pesos | safetensors en layout MLX (4 shards), más `joint_head.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo original. Se sabe que la arquitectura se identifica como `qwen3_5`, que el modelo incorpora capas de atención lineal (el tensor con mayor error de cuantización es `model.language_model.layers.0.linear_attn.in_proj_a.weight`) y que dispone de un modo de decisión con una cabeza conjunta (`joint_head`) que produce probabilidades sobre tareas estructuradas. El repositorio incluye `chat_template.jinja`, `generation_config.json` y los ficheros de configuración de decisión, lo que sugiere soporte tanto de chat como de evaluación estructurada.

Esta conversión concreta no implica reentrenamiento ni ajuste fino: es una cuantización a 8 bits de los pesos bf16 originales. El autor documenta una auditoría de cuantización a nivel de tensor (427 tensores comparados, KL medio 3,87e-04, máximo 5,57e-03) y una evaluación de calidad sobre un conjunto propio, con precisión del 83,0 % en 8 bits frente al 81,8 % en bf16, y perplejidad de calibración de 2,349 frente a 2,341. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Evaluación de decisiones estructuradas: el modelo está diseñado para responder con decisiones tipadas (`noul`, `choice`, `score`) sobre un texto de entrada, en lugar de generar texto libre.
- Clasificación binaria y de sí/no mediante el tipo `noul`, con instrucciones en lenguaje natural.
- Selección entre categorías mediante el tipo `choice`, con criterios definidos por el usuario.
- Puntuación ordinal mediante el tipo `score`, con una lista de niveles (por ejemplo, `cosmetic`, `annoying`, `blocks`).
- Procesamiento de texto de hasta 512 tokens en las pruebas publicadas (522 tokens reales), con latencias registradas para cada modalidad.
- Modo de decisión con cabeza conjunta (`joint_head`) y configuración específica de inferencia.
- No se documenta soporte de tool calling, agentes multi-paso, visión, audio ni capacidades multilingües explícitas; de hecho, la model card indica que la entrada de imagen 512x512 y el modo `box` no están soportados en esta conversión.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada incidencia en un equipo responsable (`billing`, `shipping`, etc.) usando el tipo `choice` con criterios definidos, tal como muestra el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: con el tipo `noul` y una instrucción como "¿el cliente quiere un reembolso?", el modelo responde de forma binaria sobre el texto del cliente, adecuado para enrutar automáticamente solicitudes de facturación.
- Priorización de incidencias: mediante el tipo `score` con niveles (`cosmetic`, `annoying`, `blocks`), se puede asignar severidad a errores de plataforma, como un fallo de exportación por cuota de disco.
- Moderación y etiquetado de contenido: la evaluación estructurada permite etiquetar textos según criterios predefinidos sin depender de generación libre, lo que reduce la variabilidad de la salida.
- Automatización de flujos en local: al ejecutarse en Apple Silicon con unos 11,5 GB de memoria residente, encaja en estaciones de trabajo Mac para preprocesar y clasificar datos sin enviar texto a servicios externos.
- Enrutamiento en pipelines de datos: la latencia mediana de 737 ms y las 2,15 decisiones cortas por segundo permiten procesar lotes moderados de registros en una máquina de sobremesa.
- Evaluación de calidad de cuantización: el repositorio incluye scripts y datos (`kl_audit.json`, `output_kl.py`) útiles para investigadores que quieran reproducir la comparación entre bf16, 8 bits y 4 bits.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a una evaluación propia de decisión, no a benchmarks estándar como MMLU, HumanEval o GSM8K.

| Version | Precision | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 81,8 % | 84,6 % | 84,0 % | 75,0 % | 2,341 | referencia | 18,82 GB | 734 ms |
| 8 bits (este repo) | 83,0 % | 87,2 % | 84,0 % | 75,0 % | 2,349 | 2,48e-04 | 10,47 GB | 737 ms |
| 4 bits | 80,7 % | 84,6 % | 76,0 % | 79,2 % | 2,385 | 1,92e-02 | 6,5 GB | 734 ms |

| Par de comparacion | Filas | KL medio | p95 | Maximo |
|---|---|---|---|---|
| original → 8 bits | 97 | 2,48e-04 | 1,19e-03 | 3,39e-03 |
| 8 bits → 4 bits | 97 | 1,82e-02 | 8,33e-02 | 2,13e-01 |
| original → 4 bits | 97 | 1,92e-02 | 8,55e-02 | 2,14e-01 |

Mediciones en Mac mini M4 Pro de 48 GB con MLX 8 bits: carga de 5,17 s, pico de RSS de 11,3 GB, 10,47 GB en disco y Decision Index 0.4.1 de 43,46. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: alrededor de 11,5 GB de pico de memoria residente para la versión de 8 bits, según las mediciones del autor.
- Espacio en disco: 10,47 GB para los pesos de 8 bits; 6,5 GB para la variante de 4 bits y 18,82 GB para el bf16 original.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor valida un Mac mini M4 Pro de 48 GB. No hay datos publicados para GPU NVIDIA (A100, H100, RTX 4090) en esta conversión MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada, aunque el pico medido de 11,5 GB deja poco margen; se recomienda 24 GB o más.
- Opciones de despliegue: `mlx_lm` mediante el cargador `clef_mlx.py` incluido en el repositorio; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: mediana de 737 ms por decisión y 2,15 decisiones cortas por segundo en el hardware indicado; para texto de 512 tokens, entre 1518 ms y 1669 ms según la modalidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-clef-flash-9B (8 bits) | 8,95B | no disponible | safetensors MLX | Apache 2.0 | Conversion 8 bits, 10,47 GB, precision 83,0 % en eval propia |
| sergolsub/clef-flash-9B-MLX-4bit | 8,95B | no disponible | safetensors MLX | Apache 2.0 | Version 4 bits, 6,5 GB, precision 80,7 %, mayor KL |
| Cloudflare/clef-flash (bf16) | 8,95B | no disponible | safetensors | Apache 2.0 | Pesos originales, 18,82 GB, referencia de calidad |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de sesgo; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación no cuantificado: el modelo está orientado a decisiones estructuradas, pero no se han publicado métricas de calibración fuera del conjunto propio del autor.
- El contexto máximo no está documentado; las pruebas se limitan a entradas de 512 tokens, por lo que no se debe asumir una ventana mayor.
- No se declaran idiomas soportados; el uso en castellano no está validado por el autor.
- La entrada de imagen 512x512 y el modo `box` no están soportados en esta conversión.
- Es un artefacto derivado: la licencia Apache 2.0 se hereda del repositorio original y, en caso de conflicto, prevalece la licencia de Cloudflare/clef-flash.
- Requiere el cargador `clef_mlx.py` y los ficheros de configuración de decisión; no es un modelo estándar de `transformers` ni funciona directamente en vLLM o llama.cpp.
- El autor publica checksums SHA-256 de los ficheros, pero la evaluación de calidad es propia y no ha sido replicada de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-clef-flash-9B
- Modelo base original: https://huggingface.co/Cloudflare/clef-flash
- Versión 8 bits del mismo autor: https://huggingface.co/sergolsub/clef-flash-9B-MLX-8bit
- Versión 4 bits del mismo autor: https://huggingface.co/sergolsub/clef-flash-9B-MLX-4bit
