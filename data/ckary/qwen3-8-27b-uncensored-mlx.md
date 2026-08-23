# Ckary/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es un build del modelo Qwen3.8-27B de Alibaba, desarrollado por Ckary en colaboración con OrcaRouter, en el que se ha aplicado la técnica de *abliteration* para eliminar la dirección de rechazo (*refusal direction*) del flujo residual. El resultado es un modelo que no presenta guardas de seguridad integradas y responde a solicitudes que el modelo base rechazaría. Se distribuye cuantizado en formato MLX para Apple Silicon, con precisiones de 2, 4, 6 y 8 bits, manteniendo la torre de visión, las normas y las capas convolucionales en BF16.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 000 millones de parámetros con atención híbrida: combina 48 capas lineales Gated DeltaNet con 16 capas de atención completa, un total de 64 capas y 5120 dimensiones ocultas. Es un modelo nativo de visión y lenguaje (VLM) con control de pensamiento (*thinking mode*), soporte de *tool calling* y una cabeza de predicción multitoken (MTP). Su ventana de contexto alcanza los 262 000 tokens.

Este build es relevante porque permite a investigadores de seguridad y de interpretabilidad ejecutar en hardware Apple Silicon un modelo de 27B con capacidades multimodales y de razonamiento, sin el sesgo de rechazo del modelo original, para estudiar los mecanismos de refusal, realizar *red-teaming* y evaluar robustez. Sin embargo, su uso en producción sin capas de moderación adicionales es altamente peligroso y queda fuera del alcance previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida: 48 capas Gated DeltaNet (lineal) + 16 capas full attention (64 capas totales, 5120 dims ocultas) |
| Parametros totales | 27B (modelo base); 4.665.462.000 segun safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | MLX affine con group size 64: 2-bit, 4-bit, 6-bit, 8-bit |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); tambien disponible en GGUF y FP8 segun fuentes externas |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que alterna 48 bloques con atención lineal Gated DeltaNet y 16 bloques con atención completa, sumando 64 capas totales con 5120 dimensiones ocultas. Esta combinación reduce el coste computacional del cálculo de atención en secuencias largas sin sacrificar la capacidad de modelado de dependencias de largo alcance. Además, incorpora un modelo de predicción multitoken (MTP) que mejora la eficiencia de la decodificación y soporta control de pensamiento (*thinking mode*) para alternar entre respuestas razonadas y directas.

El proceso de *abliteration* aplicado por los autores elimina la dirección de rechazo del residual stream mediante una proyección ortogonal, de modo que el modelo ya no responde con negativas a solicitudes que el modelo base rechazaría. No se ha publicado información sobre el dataset de entrenamiento adicional ni sobre el proceso de abliteration en detalle. La torus de visión, las normas y las capas convolucionales se mantienen en BF16 y solo se cuantizan los pesos lineales del módulo de lenguaje, incluyendo *embed_tokens* y *lm_head*. El modelo no ha sido entrenado específicamente para mejorar capacidades; hereda las del base, con la diferencia de la eliminación de la capa de seguridad.

## Capacidades

- Generación de texto, razonamiento y matemáticas: mantiene las capacidades del modelo base Qwen3.8-27B en tareas de texto y razonamiento.
- Comprensión de imágenes (multimodal): procesa entradas de imagen y texto, y produce respuestas textuales (image-text-to-text).
- Tool calling / function calling: soporta la invocación de herramientas externas, útil para agentes.
- Modo de razonamiento controlado: el usuario puede activar o desactivar el *thinking mode* para obtener respuestas razonadas o directas.
- Capacidades multilingües: soporta inglés y chino de forma nativa.
- Predicción multitoken (MTP): el modelo MTP acelera la generación al predecir varios tokens por paso.
- Sin guardrails: al estar abliterado, responde a solicitudes que el modelo base rechazaría, incluidas peticiones maliciosas o ilegales.

## Casos de uso

- Investigación en interpretabilidad de modelos: estudiar cómo se forma y se elimina la dirección de refusión en modelos de lenguaje, comparando el comportamiento del modelo base con el abliterado.
- Red-teaming y evaluación de robustez: probar técnicas de jailbreak y medir la eficacia de los guardrails del modelo original frente a los de este build.
- Evaluación de mecanismos de seguridad: analizar cómo el modelo genera contenido dañino cuando no existe una capa de rechazo, para diseñar mejores sistemas de moderación.
- Desarrollo de pipelines de moderación: usar el modelo como caso extremo para validar filtros de contenido y sistemas de bloqueo en entornos de producción.
- Experimentos académicos controlados: en laboratorios de seguridad de IA, donde se requiere un modelo sin restricciones para estudiar comportamientos de riesgo.
- Pruebas de rendimiento en Apple Silicon: evaluar el rendimiento de un modelo de 27B multimodal en hardware de consumo mediante cuantizaciones MLX de 4 y 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este build específico en la información disponible. El modelo base Qwen3.8-27B puede tener resultados públicos de Alibaba, pero no se incluyen en esta ficha por falta de datos verificados para la versión abliterada y cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados varían según la precisión:
  - 8-bit: ~27,5 GB, mínimo 32 GB de RAM unificada en Apple Silicon.
  - 6-bit: ~22 GB, mínimo 24–32 GB de RAM.
  - 4-bit: ~15 GB, mínimo 24 GB de RAM.
  - 2-bit: ~8,7 GB, mínimo 16 GB de RAM (calidad severamente degradada, solo para archivo).
- GPU recomendadas: Apple Silicon con memoria unificada (M1/M2/M3/M4/M5 Pro y Max); no está pensado para GPUs NVIDIA/AMD en este formato.
- Compatibilidad con hardware de consumo: sí, en Macs con suficiente RAM unificada; la 4-bit cabe en equipos con 24 GB.
- Opciones de despliegue: MLX (librería nativa), LM Studio, y según fuentes externas también hay versiones GGUF y FP8 para otros backends.
- Latencia y throughput: no se proporcionan datos concretos; el rendimiento depende del chip y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Vision, tool calling, thinking mode, multilingue | Apache 2.0 | safetensors (BF16) |
| Qwen3.8-27B-Uncensored-MLX (este) | 27B | 262K | Igual que base, sin refusals | Apache 2.0 | MLX (2/4/6/8-bit) |
| Qwen3.8-27B-Uncensored (GGUF) | 27B | 262K | Igual, sin refusals | Apache 2.0 | GGUF (Q3_K_M, Q4_K_M) |

La comparativa muestra que el build MLX ofrece las mismas capacidades que el modelo base y que la versión GGUF, pero con cuantizaciones específicas para Apple Silicon. La principal diferencia es el formato de pesos y la optimización para hardware de Apple. No se dispone de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo conserva los sesgos del modelo base Qwen3.8-27B, que pueden incluir estereotipos o contenido ofensivo; además, al eliminar la capa de refusión, puede generar contenido sesgado o falso con autoridad.
- Riesgo de alucinación: alto, como en el modelo base, y agravado por la cuantización de baja precisión (especialmente 2-bit) que puede producir salidas incoherentes o repetitivas.
- Limitaciones de contexto e idioma: contexto de 262K tokens, pero el rendimiento en secuencias largas puede degradarse; soporte nativo solo para inglés y chino.
- Restricciones de licencia: licencia Apache 2.0 permite uso comercial, pero el propio README advierte que el uso fuera de investigación legítima es desaconsejado y que el usuario asume toda responsabilidad legal.
- Riesgo de seguridad: el modelo no tiene guardrails y puede generar instrucciones para malware, exploits, armas, fraude u otras actividades ilegales. No debe desplegarse a usuarios finales sin capas de moderación externas.
- Cuantización 2-bit: la calidad es severamente degradada, con bucles de repetición y salidas incoherentes; solo es válida como archivo de extremo compresión.

## Enlaces

- HuggingFace: https://huggingface.co/Ckary/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub (OrcaRouter build): https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Blog explainx.ai: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- GitHub (variante GGUF): https://github.com/Wassimyounes01/qwen38-uncensored
- HuggingFace Space (demo): https://huggingface.co/spaces/P1723/Qwen3.8-27B-Uncensored-Demo
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-mlx-orcarouter
