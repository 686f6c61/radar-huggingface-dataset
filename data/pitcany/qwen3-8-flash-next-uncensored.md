# pitcany/Qwen3.8-Flash-Next-Uncensored

## Resumen

Qwen3.8-Flash-Next-Uncensored es una versión "abliterated" (con la dirección de rechazo eliminada del flujo residual) del modelo Qwen3.8-Flash-Next de Qwen/Alibaba, publicada por el usuario pitcany. Se distribuye en precisión completa BF16 y está pensada como base para fine-tuning, post-entrenamiento y cuantización posterior, conservando la torre de visión y la cabeza MTP del modelo original. El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 180.000 millones de parámetros totales, con arquitectura de atención híbrida y capacidades nativas de visión-lenguaje.

La relevancia de esta ficha radica en que se trata de un modelo de gran tamaño (180B) con licencia Apache 2.0, lo que permite uso comercial, pero con la salvedad crítica de que su alineamiento de seguridad ha sido sustancialmente eliminado. Esto lo hace inadecuado para despliegues en producción orientados a usuarios finales sin capas adicionales de moderación, y lo posiciona como una herramienta de investigación en interpretabilidad, seguridad de IA y red-teaming.

El repositorio ocupa 360 GB y el modelo se distribuye únicamente en formato safetensors BF16, lo que implica requisitos de hardware considerables para su inferencia y fine-tuning. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida, vision-lenguaje nativo y cabeza MTP (multi-token prediction) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | ~6B (según model card; 125B params / ~6B active) |
| Longitud de contexto | 262K tokens (según model card) |
| Tipos de cuantizacion | BF16 (pesos fuente); existen releases derivados FP8 (block-FP8) y MLX (4/6/8-bit) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atención híbrida, diseñado para procesar entradas de imagen, vídeo y texto (pipeline image-text-to-text). Incorpora una cabeza MTP (multi-token prediction) orientada a decodificación especulativa y aceleración de inferencia. La torre de visión y la cabeza MTP se conservan íntegras en esta versión abliterated, lo que la hace apta como base para post-entrenamiento multimodal.

El proceso de abliteración consiste en ortogonalizar la dirección de rechazo del flujo residual, eliminando la tendencia del modelo a negarse a cumplir solicitudes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. El modelo base es Qwen/Qwen3.8-Flash-Next, y esta versión se presenta como fine-tune del mismo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" flexible.
- Comprensión de imagen y vídeo (vision-lenguaje nativo).
- Generación de código y matemáticas (capacidades inferidas del modelo base, no verificadas con benchmarks).
- Soporte de tool calling / function calling.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingües limitadas a inglés y chino.
- Cabeza MTP para decodificación especulativa.
- Cumplimiento de solicitudes dañinas o ilegales (efecto directo de la abliteración).

## Casos de uso

- Investigación en interpretabilidad y mecanismos de rechazo: el modelo permite estudiar cómo se representa la negativa a responder y qué ocurre al eliminar esa dirección del flujo residual, comparándolo con el modelo base alineado.
- Red-teaming y evaluación de robustez: sirve para generar ataques adversariales y prompts dañinos en entornos controlados, midiendo la resistencia de sistemas de moderación.
- Fine-tuning y post-entrenamiento: al ser pesos BF16 completos con torre de visión y MTP preservadas, es la base recomendada para entrenar variantes especializadas antes de cuantizar.
- Cuantización y despliegue: punto de partida para generar versiones FP8 o MLX (4/6/8-bit) destinadas a hardware con menos VRAM.
- Experimentos controlados de seguridad de IA: comparación de comportamientos entre modelo alineado y abliterated bajo condiciones idénticas.
- Procesamiento multimodal en investigación: análisis de imagen y vídeo con contexto largo (262K) en entornos de laboratorio, no en producción con usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 360 GB solo para pesos, más overhead de activaciones y caché KV; inviable en GPUs consumer.
- GPU recomendadas: clústeres multi-GPU con A100 80GB, H100 80GB o similares; se requieren al menos 5-8 GPUs de 80GB para BF16.
- No cabe en GPU consumer (RTX 4090, 24GB) en BF16; sería necesario recurrir a cuantizaciones derivadas (FP8, MLX 4/6/8-bit) para reducir requisitos.
- Opciones de despliegue: vLLM (mencionado en la model card), transformers; no se confirma soporte de llama.cpp u Ollama para este tamaño.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored | ~180B (MoE, ~6B activos) | 262K | Apache 2.0 | HuggingFace | Abliterated, BF16 |
| Qwen3.8-Flash-Next (base) | ~180B (MoE, ~6B activos) | 262K | Apache 2.0 | HuggingFace | Alineado, referencia |
| Qwen3.8-Flash-Next-Uncensored-FP8 | ~180B (MoE) | 262K | Apache 2.0 | HuggingFace | Cuantizado block-FP8 |
| Qwen3.8-Flash-Next-Uncensored-MLX | ~180B (MoE) | 262K | Apache 2.0 | HuggingFace | 4/6/8-bit para Apple Silicon |

## Limitaciones y advertencias

- Alineamiento de seguridad sustancialmente eliminado: cumple solicitudes dañinas, ilegales u ofensivas que el modelo base rechazaría.
- Sin guardrails integrados: no debe desplegarse a usuarios finales ni en producción sin capas propias de moderación y prevención de abuso.
- Riesgo elevado de alucinación y de contenido tóxico; no verificado con benchmarks.
- Idiomas limitados a inglés y chino; no se garantiza calidad en castellano.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal recae íntegramente en el usuario.
- Los autores declinan toda responsabilidad por mal uso; las salidas no reflejan las opiniones de los uploaders ni de Qwen/Alibaba.
- Requisitos de hardware muy elevados en BF16; el despliegue práctico exige cuantización previa.

## Enlaces

- HuggingFace: https://huggingface.co/pitcany/Qwen3.8-Flash-Next-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- OrcaRouter: https://www.orcarouter.ai
- OrcaRouter catálogo: https://www.orcarouter.ai/models
- OrcaCyber Zero 1.5: https://www.orcarouter.ai/models/orca/orcacyber-zero-1.5
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- GitHub: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X: https://x.com/OrcaRouter
