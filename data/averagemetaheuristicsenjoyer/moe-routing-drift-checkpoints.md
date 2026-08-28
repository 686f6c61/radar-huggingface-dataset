# AverageMetaheuristicsEnjoyer/moe-routing-drift-checkpoints

## Resumen

Este repositorio no contiene un modelo completo, sino los artefactos de un experimento controlado sobre la **deriva de enrutamiento (routing drift)** en arquitecturas de mezcla de expertos (MoE). El autor, AverageMetaheuristicsEnjoyer, publica los pesos de un diseño factorial 2x2: por un lado, cuatro estrategias de adaptación (ninguna, GEPA, prompt-tuning y prefix-tuning) y, por otro, dos condiciones de reentrenamiento del router (puerta congelada o reentrenada). Todo se aplica sobre dos modelos base MoE: `inclusionAI/Ling-mini-2.0` y `Qwen/Qwen3-30B-A3B-Instruct-2507`.

La relevancia del proyecto radica en que aísla el efecto del router sobre la calidad final: los checkpoints de router solo contienen las matrices de puerta (`gate.weight` y, en Ling, `expert_bias`), que representan el 0,061 % de los parámetros de Ling y el 0,041 % de los de Qwen. Cualquier cambio en el rendimiento se atribuye, por tanto, a qué experto recibe cada token, no a que el modelo aprenda conocimiento nuevo. El repositorio incluye adaptadores PEFT (prompt y prefix tuning) y checkpoints de router por época, junto con un `manifest.json` que documenta configuraciones y hashes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo completo; son adaptadores PEFT (prompt/prefix tuning) y checkpoints parciales del router (solo matrices de gate) sobre bases MoE (`Ling-mini-2.0` y `Qwen3-30B-A3B-Instruct-2507`) |
| Parametros totales | No disponible (el router checkpoint es el 0,061 % de Ling y el 0,041 % de Qwen; el adaptador contiene un tensor `prompt_embeddings` de tamaño `[100, hidden]` o `[100, layers*2*kv_dim]`) |
| Parametros activos | No aplica (no es un modelo MoE completo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores y checkpoints de router) |

## Arquitectura y entrenamiento

El experimento se diseña como un cruce 2x2: **adaptación** (ninguna / GEPA / prompt-tuning / prefix-tuning) × **reentrenamiento del router** (puerta congelada / puerta reentrenada). Los adaptadores PEFT se entrenan con sus recetas originales: Adafactor con tasa 0,3 para prompt-tuning y AdamW con tasa 5e-5 para prefix-tuning, ambos con 100 tokens virtuales. El router se reentrena con AdamW a 3e-5 y solo con pérdida de entropía cruzada, sin pérdida auxiliar de balanceo. La tarea es `civil_comments`, clasificación multi-etiqueta de toxicidad, con 1000 ejemplos de entrenamiento, semilla 42, 11 épocas, batch 4 con acumulación de gradiente 8.

Los checkpoints se guardan en las épocas 1, 2, 3, 4, 5, 7, 9 y 11, y se seleccionan por calidad en validación, no por pérdida de validación (los criterios discreparon en tres ocasiones). Existe una variante `_on-router` que invierte el orden de entrenamiento: primero se calibra la puerta sobre la base y luego se entrena el adaptador con la puerta congelada. El repositorio también incluye una pata adicional con el conjunto AQuA-RAT para razonamiento.

## Capacidades

- **No es un modelo generativo**: no genera texto, código ni respuestas. Es un conjunto de pesos de investigación para estudiar el comportamiento del enrutamiento en MoE.
- **Permite comparar estrategias de adaptación**: prompt-tuning, prefix-tuning y GEPA (un prompt de texto, no pesos) sobre dos bases MoE distintas.
- **Permite aislar el efecto del router**: al cargar solo las matrices de gate, se puede medir cómo cambia la calidad según qué experto recibe cada token.
- **Soporta carga parcial**: los checkpoints de router son state dicts parciales que se pueden cargar de forma no estricta sobre un modelo base o sobre un modelo envuelto con PEFT.
- **Incluye metadatos de reproducibilidad**: `manifest.json` contiene rutas, tamaños, sha256 y configuración de cada ejecución, lo que facilita verificar la integridad de los archivos.
- **Documenta un fallo técnico**: el problema de acumulación de `expert_bias` en bfloat16 (pasos de 1e-4 que se redondean a cero) y su corrección con float32, útil para evitar errores similares.

## Casos de uso

- **Investigación sobre deriva de enrutamiento en MoE**: el repositorio permite reproducir y extender el estudio de cómo el reentrenamiento del router afecta a la calidad en tareas de clasificación de texto, comparando con puertas congeladas.
- **Evaluación de métodos de adaptación eficientes**: los adaptadores prompt y prefix tuning publicados permiten comparar su impacto en el enrutamiento sin tocar los expertos, útil para decidir qué método usar en entornos con recursos limitados.
- **Análisis de estabilidad del entrenamiento**: los checkpoints por época (1, 2, 3, 4, 5, 7, 9, 11) permiten trazar la evolución de la calidad y detectar sobreajuste o inestabilidad en el router.
- **Desarrollo de técnicas de calibración de routers**: los checkpoints `_on-router` (primero calibrar la puerta, luego entrenar el adaptador) sirven como referencia para estudiar el orden óptimo de entrenamiento en MoE.
- **Verificación de integridad de modelos**: el `manifest.json` con hashes sha256 es un ejemplo práctico de cómo auditar pesos descargados, especialmente útil cuando se trabaja con bases grandes y se sospecha de corrupción de shards.
- **Reproducción de experimentos con semillas múltiples**: las celdas base y GEPA se replican con semillas 42, 43 y 44, lo que permite estimar la varianza del efecto del router (dispersión de 0,008 frente a un efecto de 0,13).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que la selección de checkpoints se hace por calidad en validación, pero no se proporcionan métricas numéricas (p. ej., F1, AUC) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- **Para cargar los adaptadores PEFT**: se necesita el modelo base completo. `Qwen3-30B-A3B-Instruct-2507` es un MoE de aproximadamente 30B parámetros totales (por su nombre), lo que requiere al menos 60 GB de VRAM en FP16 o 30 GB en cuantización de 4 bits. `Ling-mini-2.0` es más pequeño, pero no se especifica su tamaño exacto en la información disponible.
- **Para cargar solo los checkpoints de router**: el archivo `router.safetensors` es minúsculo (0,061 % de Ling y 0,041 % de Qwen), por lo que cabe en cualquier GPU, incluso en una de gama baja, siempre que se cargue sobre el modelo base correspondiente.
- **GPU recomendadas**: para el modelo Qwen base, una A100 80 GB o H100 son adecuadas en FP16; para inferencia en consumer, una RTX 4090 (24 GB) con cuantización de 4 bits podría funcionar, aunque no está verificado en la documentación.
- **Opciones de despliegue**: al ser artefactos de investigación, no se proporcionan configuraciones de vLLM, Ollama o TGI. El código de carga usa `peft.PeftModel` y `safetensors.torch.load_file`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de propósito general, sino un conjunto de pesos experimentales para estudiar el routing en MoE. No existen modelos comparables directos en la misma categoría (artefactos de router con adaptadores PEFT sobre dos bases distintas). Se podría comparar con otros estudios sobre routing drift (p. ej., el artículo de arXiv 2506.16419), pero no se dispone de datos cuantitativos para una tabla comparativa.

## Limitaciones y advertencias

- **No es un modelo utilizable directamente**: no se puede usar para generar texto ni para tareas de producción; es material de investigación.
- **Fuerza de adaptación no igualada**: cada brazo (prompt, prefix, GEPA) sigue su propia receta de entrenamiento, por lo que comparar celdas entre brazos mezcla el mecanismo con la intensidad de adaptación. El autor publica todas las épocas para permitir una comparación ajustada por fuerza, pero no la proporciona ya hecha.
- **Una sola semilla por celda PEFT**: las celdas de prompt y prefix tuning no tienen réplicas con otras semillas, lo que limita la estimación de varianza para esos brazos.
- **Tasa de aprendizaje del router no barrida**: el valor 3e-5 no se optimizó; los checkpoints tempranos actúan como salvaguarda, pero no hay garantía de que sea el valor óptimo.
- **Problema conocido en `expert_bias` de Ling**: la acumulación del paso de balanceo estilo DeepSeek se realizó en un buffer bfloat16, donde pasos de 1e-4 se redondean a cero para la mayoría de expertos. Las ejecuciones anteriores a la corrección float32 están marcadas en `manifest.json`; `base_fixedbias_s42` es la re-ejecución corregida.
- **GEPA no es un peso**: es un prompt de texto que vive en el repositorio de resultados, no en este repositorio, por lo que no se puede cargar como un adaptador.
- **Riesgo de corrupción de archivos**: el autor advierte que un shard base corrupto le costó un día de depuración; recomienda verificar los hashes sha256 antes de depurar cualquier comportamiento extraño.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/AverageMetaheuristicsEnjoyer/moe-routing-drift-checkpoints
- Dataset companion con resultados y puntuaciones por ejemplo: https://huggingface.co/datasets/AverageMetaheuristicsEnjoyer/moe-routing-drift-results
- Perfil del autor en HuggingFace: https://huggingface.co/AverageMetaheuristicsEnjoyer
- Perfil del autor en GitHub: https://github.com/AverageMetaheuristicsEnjoyer/
- Artículo relacionado sobre optimización de routers MoE (referencia externa): https://arxiv.org/html/2506.16419v1
