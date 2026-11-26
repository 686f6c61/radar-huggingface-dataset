# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s3

## Resumen
Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) obtenido mediante GRPO con OpenRLHF sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Lo desarrolla el usuario agurung y forma parte de una campaña experimental de RL orientada a la generación de código, denominada "cobalt". El checkpoint corresponde al paso global 110 de la ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s3` y se selecciona como el mejor hasta la fecha según la métrica pass@8.

El modelo parte directamente del Qwen3-4B base sin una semilla de SFT previa: el RL se aplica sobre el modelo base. La señal de recompensa es binaria y mide corrección de código (1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario), con penalizaciones específicas para truncamiento y respuestas excesivamente largas.

Por su naturaleza, no es un modelo de propósito general ni un chat listo para producción, sino un artefacto de investigación que refleja un estado intermedio de un proceso de RL sobre una base de 3.973.556.832 parámetros. Es relevante para quienes estudian dinámicas de RL aplicadas a código y para reproducir recetas GRPO con penalizaciones estilo DAPO y ProRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, tag `nemotron_h` en Hugging Face) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repositorio | 8.0 GB |
| Revision principal | `main` (modelo en la raiz del repo) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplica un proceso de RL con el algoritmo GRPO de OpenRLHF, sin semilla de SFT intermedia: el punto de partida es el propio modelo base Qwen3-4B. El entrenamiento se realiza sobre el conjunto "cobalt-train ≤2/64 frontier", compuesto por 1833 problemas de entrenamiento y 112 de validación retenidos, seleccionados porque el modelo base resolvía como máximo 2 de 64 muestras en el escaneo de dificultad iid_canonical@64.

La receta incluye ventajas normalizadas por grupo sin penalización KL, 8 muestras por prompt, tamaño de lote de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con schedule constante. Se incorporan dos mecanismos de forma: una penalización por truncamiento estilo ProRL que asigna recompensa -1.0 a las muestras truncadas, y una penalización DAPO para respuestas largas que aplica un castigo aditivo con rampa hasta -0.25 en los últimos 1024 tokens antes del límite. La señal de recompensa es binaria según corrección de código.

## Capacidades
- Generación de código orientada a resolver problemas de programación con verificación automática mediante tests.
- Razonamiento paso a paso en el contexto de tareas de código.
- Generación de texto general heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (aunque el modelo base Qwen3 lo soporta, no se confirma para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Investigación en RL para código: sirve como punto de comparación intermedio en estudios sobre GRPO, penalizaciones de longitud y truncamiento, permitiendo analizar la evolución de pass@8 a lo largo de la ejecución.
- Reproducción de recetas de entrenamiento: el checkpoint y los logs asociados permiten replicar la configuración de OpenRLHF con recompensa binaria de corrección de código.
- Evaluación de robustez frente a truncamiento: útil para estudiar cómo la penalización ProRL afecta al comportamiento del modelo en problemas largos.
- Generación de soluciones candidatas en pipelines de evaluación automática: puede emplearse para producir múltiples muestras por problema y medir tasas de acierto con tests.
- Análisis de dinámicas de longitud de respuesta: permite estudiar el efecto de la penalización DAPO sobre la distribución de longitudes de salida.
- Base para experimentos de destilación o comparación con el modelo base Qwen3-4B-Instruct-2507, midiendo la ganancia atribuible exclusivamente al RL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el registro de entrenamiento; únicamente se señala que es el mejor checkpoint según pass@8 dentro de la ejecución, sin cifras concretas.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090 o RTX 3090 para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más si se cuantiza; en bf16 completo requiere al menos 16 GB recomendados.
- Opciones de despliegue: vLLM (`vllm serve ... --revision main`), transformers con `AutoModelForCausalLM`, y cualquier framework compatible con safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s3 | 3.973.556.832 | no disponible | RL GRPO sobre código | no disponible | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible | Instruct general | no disponible en esta ficha | Hugging Face |
| Qwen/Qwen3-4B (base) | ~4B | no disponible | Base preentrenado | no disponible en esta ficha | Hugging Face |

La comparación directa con otros checkpoints de RL para código del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Es un checkpoint intermedio de investigación (paso global 110), no un modelo final afinado para producción.
- La señal de recompensa es exclusivamente binaria de corrección de código; el modelo puede degradar capacidades generales o de conversación respecto al base.
- Riesgo de alucinación inherente a modelos de ~4B, especialmente fuera del dominio de código.
- La licencia no está declarada en el repositorio, lo que impide confirmar condiciones de uso comercial; debe verificarse con el autor antes de cualquier despliegue.
- No se declaran idiomas soportados; el comportamiento multilingüe no está garantizado.
- El contexto máximo no está documentado para este checkpoint.
- Las muestras truncadas reciben penalización -1.0 durante el entrenamiento, pero esto no elimina el riesgo de truncamiento en inferencia con límites bajos de tokens.
- Sin métricas de evaluación publicadas, no es posible cuantificar la mejora frente al modelo base.

## Enlaces
- Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF: https://github.com/OpenRLHF/OpenRLHF
- Logs de entrenamiento: Weights & Biases, proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s3` (no se proporciona URL directa)
