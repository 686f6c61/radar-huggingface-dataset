# moonbox-dev/LFM3-1.7B-MLX

## Resumen

LFM3-1.7B-MLX es una distribución no oficial del modelo LFM3 1.7B de Liquid AI, publicada por el usuario moonbox-dev en Hugging Face. No se trata de un modelo nuevo: es una reempaquetado del modelo base `LiquidAI/LFM3-1.7B` en formato MLX, con cuantizaciones a 8, 6 y 4 bits, pensado para su ejecución en Macs con Apple Silicon mediante la librería `mlx-vlm`. El autor declara explícitamente que estos archivos no constituyen un lanzamiento oficial de Liquid AI.

El interés de esta ficha radica en que facilita el despliegue local del modelo LFM3 de 1.7B parámetros en hardware Apple, con métricas de degradación por cuantización publicadas (KL divergence, acuerdo top-1 y perplejidad frente al modelo original en bf16). Esto permite a desarrolladores e investigadores evaluar el compromiso entre tamaño en disco y fidelidad de salida antes de integrar el modelo en sus flujos de trabajo.

La información disponible sobre arquitectura, datos de entrenamiento, contexto, idiomas o benchmarks es muy limitada: la model card se centra en el empaquetado MLX y no reproduce las especificaciones del modelo base. Por tanto, varios campos de esta ficha se marcan como "no disponible" y se remite al repositorio original de Liquid AI para completar los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM3 de Liquid AI) |
| Parametros totales | 1.7B (según nombre del modelo) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, 6-bit, 4-bit (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer.json, chat_template.jinja, generation_config.json |
| Tamano del repo | 4.6 GB |
| Libreria | mlx (mlx-vlm) |
| Hardware objetivo | Apple Silicon (Macs) |
| Modelo base | LiquidAI/LFM3-1.7B (relación: quantized) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3-1.7B en la documentación proporcionada. El nombre de la familia (LFM, Liquid Foundation Models) sugiere la línea de modelos de Liquid AI, pero la model card de esta distribución MLX no detalla si se trata de un transformer clásico, un modelo de estado recurrente o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO.

Lo que sí documenta el autor es el proceso de cuantización y su fidelidad respecto al modelo original en bf16. Para la variante de 8 bits se reporta una divergencia KL de 0.0026 nats (p95 0.0059), un acuerdo top-1 del 97.2 % y una perplejidad de 24.88 frente a 24.92 del original. La variante de 6 bits presenta KL 0.012 nats (p95 0.029), acuerdo top-1 del 94.1 % y perplejidad 25.01. La variante de 4 bits (cuantización dinámica) muestra KL 0.034 nats (p95 0.075), acuerdo top-1 del 90.9 % y perplejidad 25.43. Estos datos permiten cuantificar la pérdida de calidad por nivel de compresión.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el uso principal es la generación de lenguaje natural.
- Integración con mlx-vlm: el paquete incluye processor settings y chat template, lo que sugiere soporte para flujos multimodales o al menos compatibilidad con la infraestructura de mlx-vlm (no se confirma visión en la información disponible).
- Conversación multi-turno: incluye `chat_template.jinja`, lo que permite formatear diálogos con roles.
- Ejecución local en Apple Silicon: optimizado para Macs mediante MLX.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado local en Mac: un desarrollador puede clonar la carpeta `8bit/` o `4bit/` y ejecutar el modelo con mlx-vlm en un Mac con Apple Silicon para probar ideas sin depender de la nube, gracias a que los pesos están ya empaquetados con tokenizer y chat template.
- Asistentes conversacionales de escritorio: el chat template incluido permite construir aplicaciones de chat multi-turno que corren íntegramente en local, útil para entornos con requisitos de privacidad.
- Evaluación de cuantización: investigadores pueden comparar las salidas de las variantes 8/6/4 bits frente al modelo bf16 usando las métricas publicadas (KL, top-1, perplejidad) como referencia para estudiar el impacto de la compresión.
- Generación de texto en pipelines de CI para Mac: al ser un paquete MLX autocontenido, se puede integrar en tests automatizados que verifiquen comportamiento de generación en hardware Apple sin GPU dedicada.
- Educación y experimentación: útil en cursos o talleres sobre modelos de lenguaje donde se quiera mostrar el ciclo completo de cuantización y despliegue en hardware de consumo.
- Desarrollo de aplicaciones offline: para escenarios sin conectividad, el modelo de 1.7B en 4 bits ocupa 1.31 GB, lo que permite incluirlo en aplicaciones de escritorio con recursos limitados.
- Benchmarking comparativo de variantes: permite medir latencia y calidad relativa entre 8, 6 y 4 bits en el mismo hardware para elegir el punto de equilibrio adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de fidelidad de cuantización frente al modelo bf16:

| Variante | Tamano pesos | KL (nats) | KL p95 | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|---|
| bf16 (original) | no disponible | — | — | — | 24.92 |
| 8-bit | 1.84 GB | 0.0026 | 0.0059 | 97.2 % | 24.88 |
| 6-bit | 1.41 GB | 0.012 | 0.029 | 94.1 % | 25.01 |
| 4-bit (dynamic) | 1.31 GB | 0.034 | 0.075 | 90.9 % | 25.43 |

## Requisitos de hardware

- VRAM/RAM unificada estimada: al ser MLX sobre Apple Silicon, el modelo usa memoria unificada. Los pesos ocupan 1.84 GB (8-bit), 1.41 GB (6-bit) y 1.31 GB (4-bit); hay que sumar el overhead de activaciones, KV cache y el propio runtime de MLX.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en hardware de consumo? Sí: con 1.3–1.9 GB de pesos, cualquier Mac con al menos 8 GB de memoria unificada debería poder ejecutarlo, aunque se recomienda 16 GB para contextos largos.
- Opciones de despliegue: mlx-vlm (librería indicada por el autor). Otras opciones como llama.cpp, Ollama, vLLM o TGI no están documentadas para este paquete MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa se limita a aspectos de empaquetado y licencia:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX (este) | 1.7B | no disponible | MLX safetensors (8/6/4-bit) | lfm1.0 | Hugging Face (moonbox-dev) |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | safetensors (bf16) | lfm1.0 | Hugging Face (LiquidAI) |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Distribución no oficial: el autor indica explícitamente que estos archivos no son un lanzamiento oficial de Liquid AI; para producción conviene validar contra el modelo base oficial.
- Licencia lfm1.0: es una licencia "other" con nombre lfm1.0; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede imponer restricciones.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad multilingüe.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita el diseño de aplicaciones que dependan de ventanas largas.
- Pérdida por cuantización: la variante 4-bit reduce el acuerdo top-1 al 90.9 % y eleva la perplejidad a 25.43 frente a 24.92; para tareas sensibles a la fidelidad se recomienda 8-bit o el modelo bf16.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos ni tasas de alucinación en la documentación disponible.
- Hardware: al estar en formato MLX, no es portable directamente a GPUs NVIDIA/AMD ni a servidores x86 sin reconversión.
- Madurez del repo: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Sin benchmarks estándar: no se puede comparar su calidad con otros modelos de tamaño similar a partir de datos publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/LFM3-1.7B-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia (archivo en el repo): https://huggingface.co/moonbox-dev/LFM3-1.7B-MLX/blob/main/LICENSE
