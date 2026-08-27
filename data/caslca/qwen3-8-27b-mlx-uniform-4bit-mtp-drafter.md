# caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter

## Resumen

Este repositorio contiene una extracción independiente del cabezal MTP (multi-token prediction) nativo del modelo Qwen3.8-27B, empaquetado como un drafter servible para decodificación especulativa en stacks MLX. El autor, caslca, lo publica bajo licencia Apache-2.0 con un aviso explícito de que es una versión de prueba ("probe-only") que ha superado una prueba de velocidad pareada pero no una evaluación de calidad OFAT (one-factor-at-a-time). El drafter tiene 110,6 millones de parámetros, está pre-cuantizado en int4 con grupo de tamaño 64 y ocupa aproximadamente 0,3 GB.

El modelo base del que se extrae es Qwen3.8-27B, un modelo denso multimodal de 27B parámetros con atención híbrida (lineal en 48 de 64 capas), torre de visión y ventana de contexto nativa de 262K tokens. Este drafter se usa como modelo auxiliar que predice tokens futuros para acelerar la generación del modelo principal mediante decodificación especulativa. Los resultados medidos por el autor muestran una aceleración de 1,46× a 1,58× en throughput con tasas de aceptación del 68-76%, aunque advierte que no debe usarse para benchmarks ni en producción sin certificar la neutralidad de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (cabezal MTP de 1 capa) |
| Parametros totales | 110.618.112 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | int4 affine, grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El drafter es una extracción del cabezal MTP que ya viene incluido en el modelo Qwen3.8-27B. En el repositorio troncal (`caslca/Qwen3.8-27B-mlx-uniform-4bit`), el cabezal reside en el archivo `optiq/mtp.safetensors` con 29 tensores, fuera del índice de pesos y por tanto inerte durante la carga normal. Este repositorio lo reempaqueta como un directorio drafter cargable con `model_type: qwen3_5_mtp`, una sola capa de cabecera, pre-cuantizado en int4 con grupo de tamaño 64.

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: 48 de sus 64 capas usan atención lineal y las 16 restantes atención completa. Incluye una torre de visión y un cabezal MTP integrado. El drafter no ha sido entrenado de forma independiente; es una extracción del componente ya entrenado del modelo base. El autor indica que el tronco es bit-idéntico a `mlx-community/Qwen3.8-27B-4bit` (2179 de 2180 tensores con md5 idénticos; la diferencia es la torre de visión restaurada), por lo que el drafter es compatible con ambas copias.

## Capacidades

- Decodificación especulativa: genera k=2 tokens candidatos por ronda para acelerar la inferencia del modelo principal.
- Integración con MLX: funciona con stacks MLX que soporten drafter MTP externos mediante las opciones `draft_kind: mtp` y `draft_model`.
- Pre-cuantizado: viene en int4 affine con grupo de 64, listo para cargar sin conversión adicional.
- Compatibilidad con el modelo base: empareja con `caslca/Qwen3.8-27B-mlx-uniform-4bit` o `mlx-community/Qwen3.8-27B-4bit`.
- No es un modelo de generación autónomo: no puede generar texto por sí mismo; solo actúa como acelerador del modelo principal.
- Sin capacidades de vision, tool calling, agentes ni razonamiento multi-paso: estas dependen del modelo base, no del drafter.

## Casos de uso

- Aceleración de inferencia en servidores MLX: el drafter se integra en `mlx_vlm.server` (fork) con `--draft-model` apuntando a este directorio, logrando ratios de 1,46× a 1,58× en throughput con prompts de codificación.
- Despliegue en hardware local con VRAM limitada: al ser solo 0,3 GB, añade una sobrecarga mínima de memoria frente al modelo base de 27B, permitiendo decodificación especulativa en GPUs de consumo.
- Optimización de servicios de chat con contexto largo: el modelo base Qwen3.8-27B soporta 262K tokens de contexto; el drafter reduce la latencia percibida en conversaciones multi-turno largas.
- Generación de código asistida: los prompts de prueba usados por el autor son de codificación (lru_cache, token_bucket), mostrando su idoneidad para entornos de desarrollo con autocompletado.
- Evaluación de decodificación especulativa en MLX: sirve como referencia para investigadores que quieran medir el impacto de MTP en diferentes cargas de trabajo.
- Prototipado de pipelines de inferencia: al ser un componente extraíble, permite experimentar con diferentes configuraciones de drafter sin modificar el modelo base.

## Benchmarks y rendimiento

El autor proporciona resultados de una prueba diagnóstica con dos prompts fijos de codificación, usando `mlx_vlm.server` (fork), ruta batched, k=2 tokens por ronda, KV turboquant 4-bit y temperatura 0,6:

| Prompt | ON tok/s | OFF tok/s | Ratio pareado | Aceptacion |
|---|---|---|---|---|
| lru_cache | 50,1 | 31,6 | 1,58× | 75,8% |
| token_bucket | 45,8 | 31,4 | 1,46× | 68,3% |

Estos datos provienen de un diagnóstico de cabezal activado, no de un benchmark formal. El autor advierte que la decodificación especulativa no es bit-exacta en stacks de servicio bf16 y que no se ha realizado una evaluación OFAT de calidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este drafter.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB adicionales al modelo base (el drafter pesa 0,3 GB en int4).
- GPU recomendadas: cualquier GPU capaz de ejecutar el modelo base Qwen3.8-27B en MLX; el drafter añade una carga mínima. En GPUs de consumo como RTX 3090/4090 con 24 GB de VRAM es viable si el modelo base cabe.
- Opciones de despliegue: requiere un stack MLX con soporte para drafter MTP externo (forks de `mlx_vlm.server` con `draft_kind: mtp` y `draft_model`). No es compatible con vLLM, llama.cpp u Ollama directamente.
- Latencia y throughput: los valores medidos son 50,1 y 45,8 tok/s con el drafter activado frente a 31,6 y 31,4 tok/s sin él, en la configuración descrita (hardware no especificado).

## Comparativa con modelos similares

No hay disponibles modelos comparables directos en la información proporcionada. El drafter es un componente auxiliar específico para Qwen3.8-27B en MLX. Como referencia de la familia, el autor menciona un drafter certificado para Qwen3.6-27B-Opus-Distill-OptiQ-4bit con la misma arquitectura `qwen3_5`, pero no se aportan datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- Estado de prueba no certificado: el autor lo marca explícitamente como "probe-only" y "uncertified"; no ha pasado una evaluación de calidad OFAT.
- No usar para benchmarks: la decodificación especulativa no es bit-exacta en stacks bf16; los resultados de velocidad no deben confundirse con calidad de generación.
- Riesgo de degradación de calidad: al ser un drafter no certificado, podría alterar la distribución de salida del modelo base en producción.
- Dependencia del modelo base: solo funciona con Qwen3.8-27B (o su copia bit-idéntica); no es un modelo autónomo.
- Compatibilidad limitada: requiere forks específicos de MLX; no funciona con stacks estándar como vLLM u Ollama.
- Sin datos de sesgos o alucinación: al ser un componente de aceleración, no se han evaluado estos aspectos; dependen del modelo base.
- Fecha de creación futura: el repositorio está fechado en agosto de 2026, lo que sugiere que es un artefacto reciente y posiblemente experimental.

## Enlaces

- Repositorio del drafter: https://huggingface.co/caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter
- Modelo base (troncal): https://huggingface.co/caslca/Qwen3.8-27B-mlx-uniform-4bit
- Copia bit-idéntica del troncal: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Modelo base original: https://huggingface.co/unsloth/Qwen3.8-27B
- Repositorio del modelo Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página de Ollama para Qwen3.8-27B: https://ollama.com/smtek/Qwen3.8-27B
- Metodología y campaña completa: https://github.com/ivan-avramov/mlx_local_stack
- Drafter certificado de la misma familia: https://huggingface.co/caslca/Qwen3.6-27B-Opus-Distill-OptiQ-4bit-mtp-drafter
