# FAIRC/token-averaging-avg_50m_k4

## Resumen

FAIRC/token-averaging-avg_50m_k4 es un checkpoint de investigación publicado por el grupo FAIRC dentro de un proyecto de estudio sobre técnicas de *token averaging* (promediado de tokens) en modelos de lenguaje. Se trata de un dump de pesos en formato PyTorch nativo, no de un modelo listo para usar con `transformers`. El checkpoint corresponde a una ejecución con nombre `avg_50m_k4`, con aproximadamente 50,9 millones de parámetros, una arquitectura transformer decoder de 8 capas con `d_model` 512 y una ventana de contexto de 1024 tokens.

El modelo no está pensado para tareas de producción ni para inferencia directa: es un artefacto experimental para reproducir resultados académicos y comparar variantes de promediado de tokens (con y sin atado de embeddings, con y sin posiciones aprendibles, etc.). Su relevancia radica en que permite a investigadores analizar el comportamiento de esta técnica de regularización/compresión en modelos pequeños, con un coste computacional reducido. No se ha publicado información sobre licencia, idiomas soportados ni benchmarks, por lo que su uso queda restringido al ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con promediado de tokens (`averaging_k=4`) |
| Parametros totales | 50.897.408 (aproximado, según `n_params_approx`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `state_dict` de PyTorch en archivo `.pt` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estándar de 8 capas, con 8 cabezas de atención, dimensión de modelo 512 y embeddings atados (`tie_embeddings: true`). La innovación principal es la técnica de *token averaging*: en lugar de procesar cada token de forma independiente, el modelo promedia bloques de `k=4` tokens consecutivos en alguna etapa del procesamiento, lo que reduce el coste computacional y puede actuar como regularización. El checkpoint incluye variantes con y sin atado de embeddings y con posiciones aprendibles (según los archivos `loss_log_tied.csv`, `loss_log_untied.csv` y `loss_log_4x_ctx.csv`).

El entrenamiento se realizó con una tasa de aprendizaje de 0,0002, 2000 pasos de *warmup* y un objetivo de 4.072 millones de tokens (`target_tokens`). No se especifica la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Los logs de pérdida incluidos (`loss_log.csv`, `loss_log_4x_ctx.csv`, `loss_log_tied.csv`, `loss_log_untied.csv`) permiten reproducir la curva de entrenamiento, pero no se han publicado detalles sobre el corpus utilizado.

## Capacidades

- Generación de texto: no verificada; el modelo es un checkpoint experimental sin evaluación pública.
- Razonamiento, código, matemáticas: no documentado.
- Tool calling / function calling: no soportado (no se menciona en la configuración).
- Soporte de agentes: no aplicable.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: la técnica de promediado de tokens es la única característica distintiva, orientada a investigación de eficiencia y regularización.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint permite replicar los resultados del proyecto *token averaging* y comparar las variantes (`tied`, `untied`, `4x_ctx`) mediante los logs de pérdida incluidos.
- Análisis de técnicas de promediado de tokens: los investigadores pueden estudiar cómo afecta `averaging_k` a la convergencia, la perplejidad y el uso de memoria en modelos de 50M.
- Comparación de arquitecturas en entornos de bajos recursos: al ser un modelo pequeño, puede ejecutarse en CPU o GPU modestas para validar hipótesis sobre eficiencia.
- Desarrollo de nuevas variantes de atención o mezcla de tokens: el código fuente (accesible desde el repositorio del proyecto) permite modificar la arquitectura y reutilizar el checkpoint como punto de partida.
- Evaluación de regularización en modelos pequeños: el promediado de tokens puede compararse con *dropout*, *weight tying* u otras técnicas en tareas de modelado de lenguaje.
- Docencia e investigación formativa: sirve como ejemplo práctico de cómo se estructura un proyecto de investigación de LLMs, incluyendo la gestión de checkpoints y logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo contiene logs de pérdida de entrenamiento, sin evaluaciones en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 50,9M de parámetros en precisión fp32, el checkpoint ocupa aproximadamente 204 MB en memoria. En fp16, unos 102 MB. Cabe en cualquier GPU con 2 GB o más, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente para cargar y ejecutar el modelo. Para entrenar desde cero se necesitaría más memoria, pero el checkpoint ya está entrenado.
- Compatibilidad con consumer GPU: sí, es un modelo muy pequeño, apto para GPUs de gama baja.
- Opciones de despliegue: al no ser un modelo `transformers`, no se puede usar directamente con vLLM, Ollama o TGI. Requiere reconstruir la arquitectura desde `config.json` y cargar el `state_dict` con PyTorch.
- Latencia y throughput: no se han medido, pero en una GPU moderna la generación sería prácticamente instantánea para secuencias de 1024 tokens.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de 50M de parámetros (como GPT-2 small de 124M, aunque es más grande, o modelos tipo Pythia-70M). Al ser un checkpoint de investigación sin benchmarks, no es posible establecer una comparación objetiva de rendimiento.

## Limitaciones y advertencias

- No es un modelo de producción: carece de licencia, documentación de uso y evaluación de seguridad.
- Sin garantías de calidad: no se han publicado resultados de tareas downstream, por lo que su rendimiento real es desconocido.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje entrenado en un corpus no especificado, puede generar contenido incorrecto o sesgado, pero no se ha auditado.
- Formato propietario: los pesos están en un `state_dict` de PyTorch, no en formatos estándar como safetensors, lo que dificulta su uso con herramientas convencionales.
- Contexto limitado: solo 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Sin soporte de tool calling ni agentes: no es adecuado para integraciones complejas.
- Restricciones de licencia: al no especificarse, no se puede asumir ningún permiso de uso comercial o derivado.

## Enlaces

- [HuggingFace: FAIRC/token-averaging-avg_50m_k4](https://huggingface.co/FAIRC/token-averaging-avg_50m_k4)
- [HuggingFace: FAIRC/token-averaging-avg_50m_k4_learnable_pos](https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos) (variante con posiciones aprendibles)
