# Luigi/minicpm5-1b-cursor-experiments

## Resumen

Este repositorio contiene un conjunto de checkpoints de entrenamiento experimentales de la serie MiniCPM5-1B, publicados por el usuario Luigi en agosto de 2026. Según la model card, se trata de todos los pesos entrenados durante la ronda MiniCPM de 2026 que **no fueron seleccionados para su publicación oficial**, y que se conservan únicamente con fines de reproducibilidad y registro de resultados negativos medidos. El autor advierte explícitamente que **no se debe desplegar ninguno de estos archivos**, ya que cada uno documenta la razón concreta por la que perdió frente a los artefactos publicados en `Luigi/minicpm5-1b-cursor` (versiones p13 y p15d).

El repositorio incluye 11 archivos GGUF en cuantización Q4_K_M, más dos adaptadores LoRA y un verifier basado en Gemma-3-270M. Los fallos documentados incluyen trampas de idioma chino (zh trap), cadenas de razonamiento en inglés que no se sostienen, y cobertura insuficiente en reuniones reales. El modelo base tiene 1.080.632.832 parámetros (aproximadamente 1,08B), pero no se especifica la arquitectura exacta ni el contexto de entrenamiento.

En resumen, este es un repositorio de diagnóstico y reproducibilidad, no un modelo listo para uso. Su valor es exclusivamente académico: permite auditar qué configuraciones fallaron y por qué, en el contexto de un pipeline de entrenamiento iterativo con verificación automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MiniCPM5, no confirmado) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponibles (la model card menciona pruebas con chino e inglés, pero no hay lista oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no presente en el repo) |

## Arquitectura y entrenamiento

No se proporcionan detalles de arquitectura en la información disponible. Por el nombre y el tamaño (1,08B), se infiere que podría tratarse de un modelo transformer denso de la familia MiniCPM, pero esto no está confirmado. La model card menciona que los checkpoints provienen de una ronda de entrenamiento iterativa con datos sintéticos (SYNTH-boost), trampas de idioma chino (zh trap) y dosis de cobertura en inglés. También se menciona un verifier basado en Gemma-3-270M y adaptadores LoRA para un rol de crítico, lo que sugiere un pipeline con verificación automática y corrección de sesgos. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- No se documentan capacidades funcionales específicas para estos checkpoints.
- La model card indica que son **negativos medidos**: fallaron en pruebas de razonamiento encadenado en inglés (en chain FAIL), en trampas de idioma chino (zh trap FAIL) y en cobertura de reuniones reales (ACTIONS vacío).
- El experimento multi-role (crítico) obtuvo solo un 38% de acuerdo, y el verifier de 270M alcanzó un techo del 70% de acuerdo.
- No se menciona soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- **Reproducibilidad de experimentos**: permite auditar qué configuraciones fallaron y por qué, útil para investigadores que quieran entender los límites del pipeline de entrenamiento.
- **Registro de negativos medidos**: sirve como referencia para evitar repetir las mismas configuraciones fallidas en futuras rondas.
- **Análisis de sesgos lingüísticos**: los fallos en trampas de chino e inglés documentan problemas de cobertura multilingüe en modelos pequeños.
- **Evaluación de verifiers**: el verifier Gemma-3-270M y los adaptadores LoRA pueden usarse para estudiar límites de modelos pequeños como críticos automáticos.
- **Estudio de cuantización**: los archivos Q4_K_M permiten comparar el impacto de la cuantización en checkpoints intermedios.
- **No es adecuado para ningún uso en producción**: la model card lo desaconseja explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta fallos cualitativos (trampas de idioma, cadenas de razonamiento rotas, cobertura insuficiente) sin métricas numéricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaño del modelo: ~1,08B parámetros, cuantización Q4_K_M.
- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB para el modelo cuantizado (cálculo orientativo: 1,08B × 4 bits ≈ 540 MB, más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. GTX 1650, RTX 3050) o incluso CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles, pero para un modelo de 1B en Q4 se espera latencia baja en hardware moderno.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (MiniCPM5-1B) ni de alternativas de tamaño similar con las que contrastar. La model card menciona que los checkpoints publicados (p13 y p15d) están en `Luigi/minicpm5-1b-cursor`, pero no se proporcionan sus especificaciones.

## Limitaciones y advertencias

- **No desplegar**: la model card advierte explícitamente que ninguno de estos checkpoints debe usarse en producción.
- **Fallos documentados**: trampas de idioma chino fallidas, cadenas de razonamiento en inglés rotas, cobertura de reuniones reales insuficiente.
- **Negativos medidos**: el experimento multi-role (crítico) solo logró 38% de acuerdo; el verifier de 270M alcanzó un techo del 70%.
- **Sesgos lingüísticos**: los fallos en chino e inglés indican problemas de cobertura multilingüe.
- **Licencia desconocida**: no se especifica licencia, por lo que no se puede garantizar su uso legal.
- **Repositorio sin mantenimiento**: creado y actualizado el mismo día (2026-08-15), con 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luigi/minicpm5-1b-cursor-experiments
- Modelo publicado (referencia): https://huggingface.co/Luigi/minicpm5-1b-cursor (mencionado en la model card, no verificado)
- Verifier publicado (referencia): https://huggingface.co/Luigi/granite-4.0-350m-verifier (mencionado en la model card, no verificado)
