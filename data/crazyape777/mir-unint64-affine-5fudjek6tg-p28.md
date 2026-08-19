# crazyape777/mir-unint64-affine-5fudjek6tg-p28

## Resumen

El modelo `crazyape777/mir-unint64-affine-5fudjek6tg-p28` es un checkpoint experimental de razonamiento multimodal basado en la arquitectura `Qwen3_5MoeForConditionalGeneration`, desarrollado por el usuario `crazyape777`. Se trata de un candidato de un pipeline de minería de modelos que compite en un "duelo" SN120 contra el modelo rey `vera6/affine-5g4yy75zuz-t6`. Su propósito principal es mejorar la calidad de razonamiento en tareas de codificación estilo SWE (software engineering), usando un esquema de recompensa GRPO con anclaje a un modelo profesor.

El modelo tiene 34.660.610.512 parámetros (34,7 mil millones) y sigue una arquitectura de mezcla de expertos (MoE) con 256 expertos de los que se activan 8 por token. Su contexto de entrenamiento alcanza los 6144 tokens. La licencia es Apache 2.0 y el pipeline es `image-text-to-text`, lo que implica soporte multimodal (aunque no se detallan las capacidades de visión). Es un modelo experimental, sin descargas ni validación de producción, orientado a la investigación de métodos de optimización mediante GRPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (MoE, 40 capas, hidden 2048, 256 expertos, 8 activos) |
| Parametros totales | 34.660.610.512 (34,7 B) |
| Parametros activos | no disponible (solo se indica que el entrenamiento modifica 8,36 M parámetros, 0,024 % del total) |
| Longitud de contexto | 6144 tokens (máximo en entrenamiento; el contexto nativo del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.5-MoE soporta multilingüe, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sharded: `model-00001-of-00002`, `model-00002-of-00002`, `model.safetensors.index.json`, `model-visual.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un MoE (Mixture of Experts) de la familia Qwen3.5-MoE, con 40 capas transformer y 256 expertos de los que se activan 8 por token. No incluye código de modelado personalizado (`no auto_map`, no ficheros `.py`). El entrenamiento se realiza mediante **HiAlpha-GRPO** con LoRA, un método de optimización de preferencias basado en razonamiento (Reason v4). El esquema de recompensa usa un profesor congelado (`zai-org/GLM-4.5-Air-FP8`) que ancla las referencias, y la señal de recompensa se define como `Reason = τ · log((1/k) · Σ exp(a_i/τ))` con τ=0,03 y k=3 referencias de profesor, más una penalización de longitud para pensamientos `z` con |z|≥220. Se aplica un refuerzo de cola (tail-boost) de 2,0 solo al mejor miembro del grupo.

Los datos de entrenamiento provienen de un corpus público de turnos Affine (SWE-style coding turns), con 871 de 1200 filas seleccionadas (presupuesto de caracteres de 12288). El entrenamiento se realizó en 8×H100 80GB PCIe durante unos 75 minutos (4524 s), con LoRA de rango 16 y alfa 128 sobre los módulos `q,k,v,o,gate,up,down _proj`. El resto de hiperparámetros incluyen: lr 5e-6, group size G=4, 200 pasos, `max_new_tokens` 64, `max_seq` 6144, KL coef 0.0, y dtype bfloat16. Los parámetros entrenables son 8,36 M (0,024 % del total), lo que indica que es un ajuste fino de bajo rango sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, orientado a tareas de codificación y resolución de problemas de ingeniería de software (SWE).
- Soporte multimodal (pipeline `image-text-to-text`), aunque no se detalla la capacidad de visión en la información disponible.
- Uso de un formato de interacción específico: `THOUGHT` + último bloque de bash cerrado, diseñado para agentes de codificación.
- Capacidad de integración con `vLLM` para servir en producción (sin `--trust-remote-code`).
- No se menciona soporte explícito de tool calling, pero la arquitectura Qwen3.5-MoE lo suele incluir; sin embargo, no está confirmado en la documentación.

## Casos de uso

- **Agentes de codificación autónomos**: el modelo está entrenado para producir pensamientos (THOUGHT) seguidos de comandos bash, lo que lo hace adecuado para agentes que resuelven tickets de software, ejecutan tests y aplican parches.
- **Asistencia de desarrollo en tiempo real**: integración en entornos de desarrollo como IDE o CLI para generar código, refactorizar y depurar mediante razonamiento de múltiples pasos.
- **Evaluación de modelos de razonamiento**: puede usarse como candidato en pipelines de minería de modelos (como el duelo SN120) para comparar la calidad de razonamiento frente a otros checkpoints.
- **Generación de código con contexto largo**: con 6144 tokens de contexto, puede manejar archivos de código medianos y conversaciones multi-turno sobre un mismo proyecto.
- **Análisis y revisión de código**: dado su entrenamiento en SWE-style, puede revisar código, identificar errores y proponer soluciones basadas en razonamiento.
- **Investigación en optimización por GRPO**: útil como caso de estudio para técnicas de refuerzo con profesores anclados y recompensas basadas en razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es una simulación local de calidad de razonamiento (Reason v4) comparando este candidato (p28) con el modelo rey `vera6/affine-5g4yy75zuz-t6` en una muestra de 160 ejemplos:

| Métrica | Candidato (p28) | Rey (t6) |
|---|---|---|
| Media de Reason | 0,01184 | 0,00995 |
| Mediana de \|z\| | 144 | 145 |
| B-pass | 0,46 | 0,49 |
| Margen | +0,00189 | - |
| SE | 0,00149 | - |
| z | +1,27 | - |
| win_frac | 0,40 | - |
| p90 Δ | +0,00943 | - |
| Verdicto local | BELOW_BAR | - |

El candidato no supera la barra de corona (margen requerido ≈ 0,0030) en la simulación local, aunque muestra una mejora media positiva frente al rey.

## Requisitos de hardware

- **Entrenamiento**: 8× NVIDIA H100 80GB PCIe (también se usan para la evaluación local con vLLM TP=2).
- **Inferencia**: el modelo se sirve con vLLM en modo tensor-parallel con 2 GPUs (TP=2). El tamaño del repositorio es de 70,2 GB en bf16, por lo que se requiere al menos ~70 GB de VRAM en total (una sola H100 80GB o 2× A100 80GB, etc.).
- **GPU recomendadas**: H100, A100 80GB, o RTX 4090 con suficiente VRAM (no es viable en GPUs de 24 GB sin cuantización, pero no se proporcionan cuantizaciones).
- **Opciones de despliegue**: vLLM (compatible con el formato safetensors), potencialmente Ollama o llama.cpp si se convierte a GGUF, aunque no se ha probado.
- **Latencia/throughput**: no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El modelo base `vera6/affine-5g4yy75zuz-t6` es el rey actual del pipeline, y el profesor `zai-org/GLM-4.5-Air-FP8` se usa como referencia de calidad, pero no hay datos de benchmarks comparables con otros modelos públicos (p.ej., Llama, Mistral, DeepSeek). No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- **Modelo experimental**: es un candidato de un pipeline de minería, con 0 descargas y 0 likes en Hugging Face; no ha sido validado para uso en producción.
- **Sesgos y alucinaciones**: no hay información sobre sesgos conocidos ni tasa de alucinación; al ser un modelo de razonamiento, puede generar razonamientos incorrectos o confabular en tareas de código.
- **Contexto limitado**: aunque la ventana de entrenamiento es de 6144 tokens, no se confirma el contexto máximo nativo del modelo base; para tareas que requieran más contexto, puede fallar.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base Qwen3.5-MoE suele soportar multilingüe, pero no está confirmado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo es un derivado de `vera:4/affine-5g4yyy4zuz-t6` que a su vez puede tener restricciones adicionales; no se documenta el linaje completo.
- **Compatibilidad**: el modelo requiere `transformers` y `vLLM` con la arquitectura Qwen3.5-MoE; no se recomienda usar con `--trust-remote-code` porque no hay código personalizado.

## Enlaces

- [Hugging Face - crazyape777/mir-unint64-affine-5fudjek6tg-p28](https://huggingface.co/crazyape777/mir-unint64-affine-5fudjek6tg-p28)
- Modelo base: `vera6/affine-5g4yy4zuz-t6` (no se proporciona URL directa)
- Profesor: `zai-org/GLM-4.5-Air-FP8` (no se proporciona URL directa)

La búsqueda web no ha devuelto resultados relevantes adicionales (solo páginas genéricas de Hugging Face y ChatGPT).
