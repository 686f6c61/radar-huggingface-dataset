# abliterant/Qwen3.5-9B-RANA-abliterated

## Resumen

Qwen3.5-9B-RANA-abliterated es una edición de pesos del modelo Qwen3.5-9B de Alibaba (familia Qwen) en la que se ha eliminado el comportamiento de rechazo mediante RANA (Reasoning-Anchored, Norm-preserving Ablation), una técnica de edición de pesos desarrollada por Abliterant. No se modifica la arquitectura ni se reentrena el modelo: se interviene directamente sobre los pesos para atenuar la representación interna que media en las negativas del modelo base. El resultado es un modelo vision-language de 9.653.104.368 parámetros (9,65 mil millones) que responde a peticiones que el modelo original rechazaría, con una pérdida de capacidades declarada de 0,79 puntos porcentuales de media.

El modelo es multimodal (pipeline image-text-to-text), con decodificación especulativa mediante cabeza MTP (multi-token prediction) y un contexto configurado de 262.144 tokens, aunque la evaluación se realizó con un límite de servicio de 20.480 tokens. Se distribuye en BF16 safetensors (19,3 GB, 4 shards) y en una familia de formatos cuantizados: FP8, GGUF, MLX y AWQ 4-bit.

Su relevancia es doble: por un lado, sirve como material de investigación sobre interpretabilidad y robustez del comportamiento de rechazo en modelos de razonamiento; por otro, ilustra el estado del ecosistema de "abliteración" aplicado ya a modelos multimodales con contexto largo. El autor lo posiciona explícitamente como modelo de investigación y desaconseja su despliegue público sin una capa de moderación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) de la familia Qwen3.5; sin cambios de arquitectura respecto al modelo base |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens configurados; evaluación con límite de servicio de 20.480 tokens |
| Tipos de cuantizacion | BF16 (referencia), FP8 (bloque e4m3), GGUF (Q8_0 a IQ2_M), MLX (4, 5, 6, 8 bits y BF16), AWQ 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, 4 shards, 19,3 GB); FP8, GGUF, MLX y AWQ en repositorios separados |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B base: un transformer multimodal con capacidad de entrada de imagen y texto, cabeza de predicción multi-token (MTP) para decodificación especulativa y modo de razonamiento ("thinking mode") activado por defecto. Abliterant no aporta datos de entrenamiento propios: la intervención RANA es una edición de pesos que elimina la dirección interna asociada al rechazo, siguiendo la línea de trabajos previos de abliteración (Arditi et al., 2024) pero adaptada a modelos de razonamiento y preservando la norma de los pesos. Los detalles completos del dataset de entrenamiento original y del proceso de alineación (RLHF/DPO) del modelo base no están disponibles en la información proporcionada.

La innovación técnica declarada es el propio método RANA, que según el autor logra un equilibrio mejor entre eliminación de rechazos y conservación de capacidades: frente a `bowmanslayer/Qwen3.5-9B-Uncensored`, reporta +14,9 puntos porcentuales de respuestas útiles a peticiones dañinas (67,4 % vs 52,5 %), una pérdida de capacidad 4,2 veces menor (0,79 vs 3,31 pp) y una divergencia KL 2,7 veces menor respecto al modelo base (0,109 vs 0,294). El modelo incluye soporte funcional verificado de entrada de imagen, tool calling multi-turno y decodificación especulativa MTP.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (activado por defecto), con parser de razonamiento `qwen3` en vLLM.
- Comprensión de imágenes (image-text-to-text); la configuración de ejemplo limita a 1 imagen por prompt y desactiva vídeo.
- Generación de código, con ajustes de muestreo específicos para HumanEval (T = 0,6, presence_penalty = 0).
- Tool calling / function calling, con `--enable-auto-tool-choice` y parser `qwen3_coder`.
- Razonamiento multi-paso y uso en agentes, incluyendo tool calling multi-turno verificado.
- Decodificación especulativa mediante cabeza MTP (`num_speculative_tokens: 1`).
- Contexto largo configurado de hasta 262.144 tokens (comportamiento no validado a esa longitud).
- Respuestas a peticiones que el modelo base rechaza, fruto de la ablación de rechazo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad del rechazo: comparar activaciones y respuestas del modelo ablacionado frente al Qwen3.5-9B original para localizar y caracterizar la representación interna que media en las negativas.
- Red-teaming y evaluación de robustez: usar el modelo como generador de respuestas "sin filtro" en pruebas controladas de sistemas de moderación y clasificadores de seguridad.
- Análisis de degradación de capacidades: medir la pérdida de rendimiento (0,79 pp declarados) en tareas de código, matemáticas y razonamiento para estudiar el coste de la abliteración.
- Procesamiento de documentos con imágenes: al ser un modelo vision-language con contexto largo, puede extraer y razonar sobre texto en capturas, formularios o diagramas en entornos de investigación internos.
- Automatización de agentes con tool calling: integrarlo en pipelines de investigación que requieran llamadas a funciones multi-turno, usando el parser `qwen3_coder` de vLLM.
- Evaluación comparativa de métodos de ablación: emplearlo como referencia junto a otras builds abliteradas (por ejemplo, `bowmanslayer/Qwen3.5-9B-Uncensored` o la de huihui-ai) para comparar métricas de rechazo, KL y pérdida de capacidad.
- Pruebas de decodificación especulativa: validar el rendimiento de la cabeza MTP en hardware consumer (RTX 5090) y profesional (A100) dentro de entornos de benchmarking.

## Benchmarks y rendimiento

Los datos publicados por el autor son comparativos internos, no benchmarks estándar de la comunidad:

| Metrica | Qwen3.5-9B-RANA-abliterated | bowmanslayer/Qwen3.5-9B-Uncensored | Qwen3.5-9B base |
|---|---|---|---|
| Respuestas útiles a peticiones dañinas | 67,4 % | 52,5 % | No disponible |
| Pérdida de capacidad (media) | 0,79 pp | 3,31 pp | Referencia |
| Divergencia KL respecto al base | 0,109 | 0,294 | 0 |
| Rechazos duros | 0,0–0,1 % | No disponible | 55,8 % (medido en un set de prompts anterior) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 19,3 GB solo para pesos; con contexto de 20.480 tokens y caché KV se necesita holgadamente una GPU de 32 GB o más.
- GPU verificadas por el autor: una A100-SXM4-40GB (evaluación) y una RTX 5090 de 32 GB (comprobaciones funcionales), ambas en BF16.
- GPU consumer: cabe en RTX 5090 (32 GB) en BF16; en GPUs de 24 GB (RTX 4090) sería necesario recurrir a FP8 (12,2 GB) o AWQ 4-bit (11,7 GB).
- Cuantizaciones ligeras: GGUF de 3,6 a 9,5 GB por cuantización permite ejecución en llama.cpp con GPUs de 8–12 GB según el nivel elegido; MLX de 6,0 a 18,8 GB para Apple Silicon.
- Despliegue: vLLM 0.30.0 (probado), SGLang (formato FP8), llama.cpp (GGUF), MLX y Transformers. En GPUs Blackwell es necesario `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-RANA-abliterated | 9,65 B | 262.144 configurados (20.480 en evaluación) | Ablación RANA, multimodal | Apache-2.0 | BF16, FP8, GGUF, MLX, AWQ en Hugging Face |
| bowmanslayer/Qwen3.5-9B-Uncensored | ~9 B (derivado de Qwen3.5-9B) | No disponible | Abliteración pública | No disponible | Hugging Face |
| Qwen3.5-9B-abliterated (huihui-ai) | 9 B | No disponible | Ablación de rechazo | No disponible | Transformers, GGUF y MLX |
| Qwen/Qwen3.5-9B (base) | ~9 B | 262.144 configurados | Modelo alineado con rechazos | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: el autor lo restringe a interpretabilidad, red-teaming y evaluación de robustez; no debe desplegarse de cara al público sin una capa de moderación externa.
- El comportamiento de rechazo se ha eliminado en gran medida: cualquier filtrado de seguridad debe implementarse fuera del modelo.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y la ablación no lo mitiga.
- Contexto: aunque la configuración declara 262.144 posiciones, la evaluación solo valida hasta 20.480 tokens; el comportamiento a contexto completo no está establecido.
- Longitud de salida: 8.192 tokens cubren la mayoría de tareas evaluadas, pero las respuestas de código largas pueden requerir más.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá de lo que herede del modelo base.
- Sesgos: no documentados en la información proporcionada; al heredar los del Qwen3.5-9B base, conviene auditarlos antes de cualquier uso.
- Licencia Apache-2.0 permite uso comercial, pero el propio autor desaconseja el despliegue público y la responsabilidad legal del uso recae en el usuario.
- Solo 1 descarga y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated
- Variante FP8: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-FP8
- Variante GGUF: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-GGUF
- Variante MLX: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-MLX
- Variante AWQ 4-bit: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor en Hugging Face: https://huggingface.co/abliterant
- Web de Abliterant: https://abliterant.ai/
- Notas de investigación sobre RANA: https://abliterant.ai/research/rana-refusal-ablation
- Catálogo de modelos de Abliterant: https://abliterant.ai/models
- Demo Abliterant Chat: https://chat.abliterant.ai/
- Modelo comparable (bowmanslayer): https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored
- Índice de modelos abliterados: https://www.abliteratedmodels.org/
- Ficha de la build de huihui-ai: https://www.abliteratedmodels.org/qwen3.5-9b-abliterated/
