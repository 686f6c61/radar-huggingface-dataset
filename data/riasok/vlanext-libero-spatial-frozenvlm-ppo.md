# Riasok/vlanext-libero-spatial-frozenvlm-ppo

## Resumen

VLANeXt LIBERO-Spatial PPO (frozen VLM) es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Riasok, que constituye un ajuste fino mediante aprendizaje por refuerzo (PPO) del checkpoint SFT `Riasok/vlanext-libero-spatial-frozenvlm-sft`. El modelo resuelve el problema de generar secuencias de acciones motrices a partir de observaciones visuales e instrucciones en lenguaje natural en el benchmark de manipulación robótica LIBERO-Spatial, y es relevante porque demuestra que el ajuste con RL manteniendo congelado el backbone de visión-lenguaje puede mejorar la política de acción sin degradar los pesos del VLM.

La arquitectura combina un backbone Qwen3-VL-2B, que permanece congelado durante todo el entrenamiento de RL, con una cabeza de acción basada en un transformer de difusión (DiT) que predice chunks de acciones. Solo se actualizan la cabeza DiT, el proyector de acciones y las meta queries, lo que suma 612,4 millones de parámetros entrenables, además de una cabeza de valor MLP independiente que actúa como crítico. El repositorio ocupa 7,3 GB y la licencia es Apache 2.0.

El modelo se entrenó con RLinf sobre 4 GPUs H100 con FSDP, usando PPO actor-crítico con GAE y ruido Flow-SDE para la exploración. La tasa de éxito en los rollouts de entrenamiento alcanzó 0,959 en el paso 1, un pico cercano a 0,98 entre los pasos 41 y 61, y 0,951 en el paso 100. No hay evaluación held-out publicada todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone Qwen3-VL-2B congelado + cabeza de acción DiT + proyector de acciones + meta queries; crítico MLP separado |
| Parametros totales | no disponible (repo de 7,3 GB; 612,4 M entrenables en cabeza DiT, proyector y meta queries) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch: `vlanext_libero_spatial_frozenvlm_ppo_step100.pt` con formato `{step, model_state_dict, config}`; `value_head_step100.pt`; `config.json`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA: un backbone de visión-lenguaje Qwen3-VL-2B procesa las observaciones visuales y la instrucción en lenguaje natural, y una cabeza de acción basada en un transformer de difusión (DiT) genera chunks de acciones. Durante el RL el backbone permanece completamente congelado; los pesos se verificaron tensor a tensor contra el checkpoint SFT. Solo se entrenan la cabeza DiT, el proyector de acciones y las meta queries (612,4 M parámetros). Un MLP de valor independiente actúa como crítico en el esquema actor-crítico.

El entrenamiento de RL se realizó con RLinf usando PPO con GAE (γ 0,99, λ 0,95), clipping de 0,2 y recompensa y log-probabilidad a nivel de chunk. La exploración emplea ruido Flow-SDE con nivel 0,5, 5 pasos de denoising y un chunk de acción de 4 (la cabeza predice 8). Se ejecutaron 64 entornos con 8 épocas de rollout por paso y horizonte 240; la optimización usó lr de actor 5e-6, lr de valor 1e-4, batch global 2048, grad clip 1,0, 100 pasos y semilla 42, sobre 4× H100 con FSDP sin sharding.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (manipulación en LIBERO-Spatial).
- Predicción de chunks de acciones mediante decodificación por difusión (la cabeza predice 8 acciones, se ejecuta un chunk de 4).
- Procesamiento de visión y lenguaje a través del backbone Qwen3-VL-2B (congelado).
- Política entrenada con RL (PPO) sobre un checkpoint SFT, orientada a maximizar la tasa de éxito en tareas espaciales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible (no se documentan modos thinking, audio ni visión más allá del uso del VLM como backbone).

## Casos de uso

- Manipulación robótica en entornos simulados LIBERO-Spatial: el modelo se usaría como política que recibe la imagen del entorno y la instrucción de la tarea y emite chunks de acciones de 4 pasos, adecuado porque está entrenado específicamente en ese benchmark.
- Investigación en aprendizaje por refuerzo para VLA: sirve como referencia de ajuste PPO con backbone congelado, útil para reproducir el pipeline RLinf y comparar variantes de RL sobre el mismo SFT.
- Evaluación de políticas con backbone congelado: permite estudiar cuánto rendimiento se gana entrenando solo la cabeza de acción, sin tocar el VLM, en escenarios de recursos limitados.
- Punto de partida para nuevo ajuste fino: al mantener el mismo formato `{step, model_state_dict, config}` que el checkpoint SFT, es un reemplazo directo en pipelines existentes de entrenamiento o evaluación.
- Baseline en comparativas de RL para robótica: útil para medir la brecha entre rollouts de entrenamiento y evaluación held-out en tareas espaciales.
- Despliegue en simulación con ODE sampling: la evaluación prevista usa muestreo ODE, por lo que el modelo es adecuado para inferencia determinista en entornos simulados de investigación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Success_once (rollout de entrenamiento, paso 1) | 0,959 |
| Success_once (rollout de entrenamiento, pico pasos 41-61) | ~0,98 |
| Success_once (rollout de entrenamiento, paso 100) | 0,951 |
| Evaluación held-out (500 episodios, ODE sampling) | pendiente, no publicada |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las métricas anteriores son tasas de éxito de rollouts de entrenamiento en LIBERO-Spatial.

## Requisitos de hardware

- Entrenamiento realizado en 4× H100 con FSDP (sin sharding).
- VRAM estimada para inferencia: no disponible (el repo pesa 7,3 GB; el backbone Qwen3-VL-2B y la cabeza DiT condicionan el consumo, pero no se documenta).
- GPU recomendadas: no disponible; el único dato es el uso de H100 para el entrenamiento.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; los pesos son `.pt` de PyTorch y el pipeline es RLinf).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLANeXt LIBERO-Spatial PPO (frozen VLM) | no disponible (612,4 M entrenables) | no disponible | success_once 0,951 en paso 100 (rollout de entrenamiento) | Apache 2.0 | Hugging Face |
| Riasok/vlanext-libero-spatial-frozenvlm-sft | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (checkpoint base) |
| Otros modelos VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La evaluación held-out (500 episodios, ODE sampling) está pendiente; las cifras de éxito proceden de rollouts de entrenamiento y pueden no generalizar.
- El modelo está especializado en LIBERO-Spatial; su comportamiento fuera de ese benchmark o en robots reales no está documentado.
- El backbone Qwen3-VL-2B está congelado, por lo que las capacidades de visión-lenguaje no se han adaptado durante el RL.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; al ser un modelo de acción, el riesgo principal es la ejecución de políticas subóptimas en entornos distintos al de entrenamiento.
- No se especifican idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales del autor ni de los datos de entrenamiento.
- El checkpoint incluye una cabeza de valor (`value_head_step100.pt`) que no es necesaria para inferencia; usarla por error en producción no aporta nada.
- No hay información sobre cuantización ni formatos de despliegue optimizados, lo que dificulta el despliegue fuera de PyTorch/RLinf.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riasok/vlanext-libero-spatial-frozenvlm-ppo
- Checkpoint base SFT: https://huggingface.co/Riasok/vlanext-libero-spatial-frozenvlm-sft
- RLinf (framework de RL usado): https://github.com/RLinf/RLinf
