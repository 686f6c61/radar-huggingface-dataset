# Elrond1701/webshop-rl-checkpoints

## Resumen

`Elrond1701/webshop-rl-checkpoints` es un repositorio de checkpoints de entrenamiento por refuerzo (RL) sobre el modelo base Qwen2.5-1.5B-Instruct, orientado a la tarea de compra web (WebShop) sobre un catálogo de 1.000 productos. No se trata de un modelo publicado para inferencia directa, sino de artefactos completos de entrenamiento en formato FSDP de la librería verl: pesos del actor, estado del optimizador, configuración y tokenizer en formato Hugging Face, y estado del dataloader. El autor es Elrond1701 y el repositorio ocupa 38,9 GB.

El interés del repositorio es experimental y de investigación: documenta dos recetas de RL (RegPO y Tree-GRPO) con métricas de validación (256 tareas, decodificación greedy) y permite reproducir o analizar el proceso de entrenamiento. La model card reporta 144/256 victorias para RegPO en el paso 150 y 152/256 para Tree-GRPO en el paso 100, con un pico de 163/256 en el paso 140 de esta última receta antes de un fallo por CUDA OOM en el paso 141.

Dado que el repositorio contiene checkpoints de entrenamiento y no pesos finales empaquetados para despliegue, la información sobre cuantización, idiomas o licencia no está disponible en los datos proporcionados. El modelo subyacente es Qwen2.5-1.5B-Instruct, pero las características finales del checkpoint dependen del proceso de RL aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B-Instruct); checkpoints FSDP de verl |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | FSDP checkpoints de verl (pesos del actor, estado del optimizador, config/tokenizer HF, estado del dataloader) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints completos de entrenamiento por refuerzo generados con verl sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. Los checkpoints se guardan en formato FSDP e incluyen pesos del actor, estado del optimizador, configuración y tokenizer en formato Hugging Face, y estado del dataloader, lo que permite reanudar el entrenamiento o analizar la evolución del policy.

Se documentan dos recetas. La primera, RegPO, combina GiGPO 1.0, Tree-GRPO 1.0 y regret 1.0 con regret posterior y `singleton_intra=raw`, y alcanza 144/256 victorias en el paso 150 (último paso). La segunda, Tree-GRPO con `singleton_intra=raw`, alcanza 152/256 en el paso 100, con un pico de 163/256 en el paso 140 que no pudo guardarse por un CUDA OOM en el paso 141. La receta compartida usa lr 1e-6, gamma 0.95, batch 16 x group 4, pérdida token-mean, entropía 0.001, warmup de árbol de 10 pasos con GRPO y ramificación en los pasos de entorno 0 y 1. El entorno es WebShop con un catálogo de 1.000 productos y validación sobre 256 tareas con decodificación greedy.

## Capacidades

- Entrenamiento por refuerzo de un agente de compra web sobre el entorno WebShop (catálogo de 1.000 productos).
- Checkpoints reanudables: incluyen estado del optimizador y del dataloader para continuar el entrenamiento.
- Pesos del actor en formato compatible con Hugging Face (config y tokenizer incluidos).
- Soporte de dos algoritmos de RL documentados: RegPO (con GiGPO, Tree-GRPO y regret) y Tree-GRPO.
- Capacidades del modelo base Qwen2.5-1.5B-Instruct (generación de texto, razonamiento, código, tool calling) heredadas, aunque no validadas específicamente en esta ficha.
- No se documentan capacidades de visión, audio ni thinking mode en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de RL: los checkpoints permiten reanudar los runs de RegPO y Tree-GRPO con el estado del optimizador y del dataloader intacto, útil para investigación en aprendizaje por refuerzo con verl.
- Análisis de la dinámica de entrenamiento: comparar la evolución de victorias entre pasos (por ejemplo, el pico de 163/256 en Tree-GRPO frente a las 152/256 guardadas) para estudiar inestabilidad y fallos por OOM.
- Estudio de recetas de RL: evaluar el efecto de GiGPO, Tree-GRPO y regret en el rendimiento del agente sobre WebShop con un catálogo controlado de 1.000 productos.
- Punto de partida para fine-tuning adicional: cargar los pesos del actor y continuar el entrenamiento con otras recompensas o entornos, aprovechando el formato HF de config y tokenizer.
- Benchmarking de agentes de compra: usar los checkpoints como referencia para comparar políticas entrenadas con RL frente a las del modelo base en tareas de WebShop.
- Docencia y experimentación con verl: servir como ejemplo práctico de checkpoints FSDP completos con estado de optimizador y dataloader en un pipeline de RL.

## Benchmarks y rendimiento

| Checkpoint | Metodo | Paso | Victorias en validacion (256 tareas, greedy) |
|---|---|---|---|
| `regpo-w111/global_step_150` | RegPO (GiGPO 1.0 / Tree-GRPO 1.0 / regret 1.0, regret posterior, singleton_intra=raw) | 150 | 144 / 256 |
| `tree-grpo/global_step_100` | Tree-GRPO (singleton_intra=raw) | 100 | 152 / 256 |

Nota: el run de Tree-GRPO alcanzó 163/256 en el paso 140, pero sufrió un CUDA OOM en el paso 141 antes de poder guardar el siguiente checkpoint. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen2.5-1.5B-Instruct y de la cuantización elegida.
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento con FSDP y batch 16 x group 4 requiere memoria suficiente para evitar OOM (el run de Tree-GRPO falló por CUDA OOM en el paso 141).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles; los checkpoints son de entrenamiento (FSDP de verl) y no están empaquetados para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Elrond1701/webshop-rl-checkpoints` | 1.500 M (base Qwen2.5-1.5B-Instruct) | no disponible | 144/256 (RegPO) y 152/256 (Tree-GRPO) en WebShop | no disponible | Checkpoints FSDP en HF |
| Qwen2.5-1.5B-Instruct | 1.500 M | no disponible en esta ficha | no disponible | no disponible en esta ficha | Modelo base en HF |
| Alternativas de RL para agentes web | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: son checkpoints de entrenamiento en formato FSDP de verl, no pesos empaquetados para despliegue directo.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no especificados: no se documenta el soporte multilingüe del checkpoint resultante.
- Entrenado específicamente sobre WebShop con un catálogo de 1.000 productos; el rendimiento fuera de ese entorno no está validado.
- El run de Tree-GRPO sufrió un CUDA OOM en el paso 141, lo que indica inestabilidad y requisitos de memoria elevados durante el entrenamiento.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo o alucinación.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- Las capacidades heredadas de Qwen2.5-1.5B-Instruct no han sido verificadas tras el proceso de RL en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Elrond1701/webshop-rl-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería verl: https://github.com/volcengine/verl
- Entorno WebShop: https://github.com/princeton-nlp/WebShop
