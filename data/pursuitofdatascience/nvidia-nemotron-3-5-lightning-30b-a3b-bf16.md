# PursuitOfDataScience/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

El modelo **Nemotron 3.5 Lightning 30B A3B (BF16)** es una de-cuantización a precisión bf16 del checkpoint original `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4`, publicado por NVIDIA. Esta versión ha sido generada por el usuario de HuggingFace `PursuitOfDataScience` como un derivado de terceros, sin ningún paso de entrenamiento adicional: solo se han desempaquetado los pesos NVFP4 al formato bf16 y se ha reorganizado el layout de tensores para que sea compatible con `transformers` y con hardware que no soporta NVFP4.

El problema que resuelve es práctico: el formato NVFP4 original solo funciona en GPUs Blackwell (o en versiones muy recientes de vLLM con CUDA 13 y drivers actualizados), y no puede cargarse con `AutoModelForCausalLM` de `transformers`. Muchos clústeres universitarios y de laboratorios nacionales con GPUs Hopper (A100, H100) y drivers CUDA 12, o sistemas Linux empresariales como RHEL 8 con glibc 2.28, no pueden ejecutar el modelo original. Esta versión bf16 permite usar el mismo modelo en esos entornos, a costa de un mayor tamaño (65.8 GB frente a 21 GB) y menor rendimiento en hardware que sí soporta NVFP4.

El modelo pertenece a la familia Nemotron-H de NVIDIA, con una arquitectura híbrida que combina capas Mamba2 (state space model) con mezcla de expertos (MoE). El nombre "30B-A3B" indica aproximadamente 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, aunque el peso real en safetensors es de 32.913.266.240 parámetros. Incluye capas de predicción multi-token (MTP) y soporta razonamiento y tool calling mediante parsers específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida: Mamba2 + Mixture-of-Experts) |
| Parametros totales | 32.913.266.240 (32,9 B) |
| Parametros activos | 3 B (según nomenclatura "A3B"; no confirmado en la documentación) |
| Longitud de contexto | 32.768 tokens (según ejemplo de despliegue con vLLM; no especificado oficialmente) |
| Tipos de cuantizacion | BF16 (original NVFP4, convertido a bf16) |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW License Agreement, versión 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de la familia Nemotron-H de NVIDIA, que combina capas de atención tradicionales con capas Mamba2 (state space models) y utiliza un mecanismo de mezcla de expertos (MoE). El modelo tiene aproximadamente 30 mil millones de parámetros totales (32,9 B según el peso real) y activa solo 3 mil millones por token, lo que lo hace eficiente en inferencia. Incluye capas de predicción multi-token (MTP), que permiten predecir varios tokens futuros simultáneamente, una técnica que mejora la velocidad de decodificación.

No se ha realizado ningún entrenamiento, fine-tuning o merge sobre el checkpoint original. La conversión ha consistido únicamente en: de-cuantizar los expertos enrutados y compartidos de NVFP4 (W4A16) a bf16, convertir las proyecciones Mamba de FP8 a bf16, apilar los tensores 2D por experto en el layout fusionado `[n_experts, out, in]` que espera `transformers`, y renombrar los nombres de los tensores de `backbone.*` a `model.*`. Las capas MTP se han conservado y de-cuantizado igualmente. El proceso está documentado en `dequant_manifest.json` y puede reproducirse con el script `dequantize_nemotron_nvfp4.py` del repositorio `PursuitOfDataScience/manual-api`.

## Capacidades

- Generación de texto conversacional: modelo de lenguaje de propósito general, orientado a diálogo y generación de texto libre.
- Razonamiento: soporta modo de razonamiento explícito mediante el parser `nemotron_v3` (equivalente a `deepseek_r1` en vLLM 0.11.2), que abre un bloque de pensamiento antes de la respuesta final.
- Tool calling / function calling: compatible con el parser `qwen3_coder` y `--enable-auto-tool-choice` en vLLM, lo que permite al modelo invocar herramientas externas de forma autónoma.
- Capacidades de agente: al combinar razonamiento multi-paso y tool calling, puede actuar como agente en flujos de trabajo que requieren planificación y ejecución de acciones.
- Predicción multi-token (MTP): las capas MTP incluidas permiten una decodificación más rápida al predecir varios tokens a la vez.
- Multilingüismo: no especificado en la documentación disponible.

## Casos de uso

- Atención al cliente automatizada: con una ventana de contexto de 32K tokens, el modelo puede gestionar conversaciones multi-turno largas, manteniendo el historial completo y generando respuestas coherentes. Su capacidad de tool calling permite integrarlo con sistemas de ticketing o bases de conocimiento para resolver consultas en tiempo real.
- Generación de código en producción: gracias al soporte de tool calling y al parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs. Su tamaño activo de 3B lo hace viable para servir en entornos con GPUs limitadas.
- Razonamiento y análisis de documentos: el modo de razonamiento explícito permite desglosar problemas complejos en pasos intermedios, útil para tareas de análisis financiero, resumen de informes o extracción de conclusiones a partir de grandes volúmenes de texto.
- Agentes autónomos: combinando razonamiento multi-paso y tool calling, puede actuar como agente que planifica, ejecuta llamadas a APIs y verifica resultados, por ejemplo en automatización de operaciones de TI o gestión de incidencias.
- Despliegue en clústeres con hardware legacy: al estar en bf16, puede ejecutarse en GPUs Hopper (A100, H100) con drivers CUDA 12 y en sistemas Linux empresariales con glibc 2.28, donde el formato NVFP4 original falla. Esto lo hace adecuado para entornos académicos o corporativos con infraestructura no actualizada.
- Investigación y fine-tuning: al ser cargable con `transformers` estándar, permite realizar LoRA, fine-tuning, inspección de logits o evaluación rápida con `generate()`, algo imposible con el checkpoint NVFP4 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de rendimiento, sesgos y limitaciones son los de NVIDIA, pero no se proporcionan valores concretos en este repositorio. Se recomienda consultar la model card oficial de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` para obtener datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 65.8 GB (32,9 B parámetros × 2 bytes). Con overhead de activaciones y KV cache, se necesitan al menos 80 GB de VRAM para servir el modelo completo en una sola GPU.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× A100 40GB con tensor parallelism). No cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: compatible con vLLM (con `--max-model-len 32768`, `--reasoning-parser nemotron_v3` y `--tool-call-parser qwen3_coder`), así como con `transformers` para carga directa en Python. También puede servirse mediante el stack completo del repositorio `PursuitOfDataScience/manual-api` (engine, gateway OpenAI-compatible y UI de chat).
- Latencia y throughput: no se han publicado datos específicos. Al ser un MoE con 3B activos, el throughput esperado es superior al de un modelo denso de 30B, pero inferior al del checkpoint NVFP4 en hardware Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B A3B (BF16) | 32,9 B | 3 B | 32K (según ejemplo) | OpenMDW 1.1 | bf16 |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32K | Apache 2.0 | bf16/fp16 |
| Qwen2.5-32B | 32,5 B | 32,5 B (denso) | 128K | Apache 2.0 (Qwen) | bf16/fp16 |
| DeepSeek-V2-Lite | 16 B | 2,4 B | 128K | MIT | bf16/fp16 |

La comparativa es estructural, ya que no se dispone de benchmarks. El Nemotron 3.5 Lightning destaca por su bajo número de parámetros activos (3B), lo que lo hace más eficiente en inferencia que Mixtral 8x7B y Qwen2.5-32B, aunque su licencia OpenMDW 1.1 es más restrictiva que Apache 2.0 o MIT. Su contexto de 32K es inferior al de Qwen2.5-32B (128K) y DeepSeek-V2-Lite (128K), pero suficiente para la mayoría de casos de uso conversacional y de agentes.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de NVIDIA, puede heredar sesgos presentes en sus datos de entrenamiento. La model card original incluye declaraciones de sesgo, explicabilidad, privacidad y seguridad (archivos `bias.md`, `explainability.md`, `privacy.md`, `safety.md` en este repositorio), pero no se detallan aquí.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no cubierta en su entrenamiento.
- Limitaciones de contexto: la ventana de 32K tokens es moderada; para documentos muy largos o conversaciones extremadamente extensas puede ser insuficiente.
- Restricciones de licencia: la licencia OpenMDW 1.1 (de NVIDIA) impone condiciones para la redistribución y el uso comercial. Es necesario revisar el texto completo de la licencia antes de usar el modelo en producción.
- Rendimiento inferior al original: en hardware que soporta NVFP4 (Blackwell), esta versión bf16 es más lenta y ocupa tres veces más espacio. Solo debe usarse cuando el formato NVFP4 no sea viable.
- Derivado de terceros: no es una publicación oficial de NVIDIA; cualquier error en la conversión es responsabilidad del autor del repositorio, no de NVIDIA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PursuitOfDataScience/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base de NVIDIA (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Repositorio de despliegue y script de de-cuantización: https://github.com/PursuitOfDataScience/manual-api
- Documentos de la model card original (en este repo): `bias.md`, `explainability.md`, `privacy.md`, `safety.md`, `LICENSE`
