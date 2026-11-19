# matrixy/Qwen3.8-27B-opencode-adapted

## Resumen

`matrixy/Qwen3.8-27B-opencode-adapted` es un adaptador LoRA sobre el modelo base Qwen3.8-27B, desarrollado por el usuario matrixy y entrenado con aprendizaje por refuerzo (GRPO asíncrono) para funcionar como el modelo subyacente del agente de programación OpenCode en tareas de ingeniería de software y de terminal. No es un modelo completo: se distribuye como adaptador PEFT en safetensors (0,7 GB) y requiere cargar el modelo base Qwen3.8-27B para su uso.

El adaptador aborda un problema concreto: el modelo base, cuando se le somete a tareas de agente con presupuesto de pasos limitado, tiende a perderse en dependencias o a repetir comandos hasta agotar el presupuesto. El entrenamiento con RL sobre entornos de terminal y repositorios (datasets harness-hub y termgrade) busca reducir el número de turnos y de tokens generados por tarea manteniendo o mejorando la tasa de éxito.

Los resultados publicados por el autor muestran mejoras notables en SWE-bench Pro (hard 51) y Terminal-Bench 2.1 bajo el arnés de OpenCode, con una reducción de 6 a 8 veces en tokens generados por tarea. Es relevante para quienes despliegan agentes de código en producción y priorizan eficiencia de cómputo y coste por tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Qwen3.8-27B); el adaptador en sí es PEFT |
| Parámetros totales | No disponible (adaptador de 0,7 GB); el modelo base Qwen3.8-27B no detalla parámetros en la información disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (existe una versión GGUF publicada en el hub, según la model card) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.8-27B, un modelo multimodal (pipeline `image-text-to-text`), y se distribuye como LoRA. El entrenamiento utiliza GRPO asíncrono (async-grpo) mediante la librería TRL, con recompensas derivadas de entornos de ejecución reales: los datasets citados son `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. El objetivo es que el modelo aprenda a resolver tareas de terminal y de repositorio con menos pasos y menos tokens.

La model card indica que el checkpoint final (step 150) se seleccionó evaluando checkpoints intermedios sobre SWE-bench Pro y un subconjunto de 18 tareas de Terminal-Bench 2.1. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de SFT/DPO previas al RL. La receta completa se anuncia en un blogpost de harness-hub.

## Capacidades

- Generación de código y resolución de tareas de ingeniería de software en repositorios reales (parcheo, escritura de tests, validadores).
- Ejecución de tareas de terminal y línea de comandos dentro de un agente (OpenCode).
- Uso de herramientas (tool calling) como parte del bucle de agente: llamadas a shell, edición de ficheros y ejecución de comandos.
- Razonamiento multi-paso con presupuesto de pasos acotado (hasta 100 pasos por tarea en las evaluaciones).
- Modo thinking opcional (el chat template lo soporta), aunque el autor recomienda desactivarlo para este adaptador.
- Capacidad multimodal heredada del modelo base (image-text-to-text), si bien en las evaluaciones la torre de visión no se sirve y los resultados son solo texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación autónomo en CI/CD: integrado en OpenCode o en un arnés similar, el adaptador puede recibir una issue o un fallo de test y generar el parche, ejecutar los tests y validar el resultado con un presupuesto de pasos acotado, lo que encaja con pipelines que necesitan coste predecible por tarea.
- Resolución de tareas de terminal en entornos aislados: dado que se entrenó sobre entornos tipo Harbor/Terminal-Bench, es adecuado para automatizar operaciones de shell, diagnóstico de dependencias y corrección de configuraciones en contenedores.
- Reducción de coste en agentes de código en producción: al generar 6-8 veces menos tokens por tarea que el modelo base con thinking, permite abaratar el coste por resolución en plataformas que facturan por token.
- Migración de configuraciones y validadores: el ejemplo de la model card (paquete `internal/cue` con esquema embebido y validador) ilustra su uso para tareas de refactorización con validación formal.
- Evaluación comparativa de arneses de agente: sirve como referencia para medir el impacto del RL sobre un modelo base en benchmarks de agente (SWE-bench Pro, Terminal-Bench) bajo condiciones controladas.
- Prototipado de agentes con presupuesto limitado de pasos: útil cuando el entorno impone un límite de turnos (por ejemplo, 100 pasos y 1-2 horas por tarea) y se necesita que el modelo no se quede en bucles de comandos repetidos.

## Benchmarks y rendimiento

Resultados publicados por el autor bajo el arnés OpenCode, un intento por tarea, presupuesto de 100 pasos, thinking desactivado salvo indicación, solo texto, temperatura 0,8 y top-p 1,0.

| Benchmark | Qwen3.8-27B (sin thinking) | Qwen3.8-27B (thinking xhigh) | Adaptador (sin thinking) | Adaptador (thinking xhigh) |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 47,1% | 51,0% | 54,9% |
| Terminal-Bench 2.1 | 47,0% | 55,4% | 53,0% | 56,6% |

Resultados emparejados (step 150 frente al base, thinking off):

| Benchmark | Tareas | Base | Adaptador | Diferencia (puntos) | Nuevas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 35,3% | 51,0% | +15,7 ± 13,9 | 11 / 3 (p = 0,057) |
| Terminal-Bench 2.1 | 84 | 46,4% | 52,4% | +6,0 ± 10,7 | 13 / 8 (p = 0,38) |
| Terminal-Bench 2.1 (66 tareas no usadas para elegir checkpoint) | 66 | 45,5% | 59,1% | +13,6 ± 11,1 | 12 / 3 (p = 0,035) |

Eficiencia: una cuarta parte de los turnos del base en SWE-bench Pro (13 frente a 48) y la mitad en Terminal-Bench 2.1, con 3,5 y 2,6 veces menos tokens generados respectivamente, sobre las tareas que ambos resuelven.

## Requisitos de hardware

- El adaptador LoRA pesa 0,7 GB; el requisito principal es la VRAM del modelo base Qwen3.8-27B, no disponible en la información proporcionada.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del modelo base se requiere, en principio, hardware de clase A100/H100 para servicio en precisión nativa, aunque no se confirma en la información.
- Cabe en GPU de consumo: no disponible; existe una versión GGUF publicada (`harness-hub/Qwen3.8-27B-opencode-adapted-GGUF`) que podría permitir despliegue en GPU de consumo, pero no se detallan requisitos.
- Opciones de despliegue documentadas: vLLM, transformers, llama.cpp y GGUF; también se describe el merge del adaptador con PEFT.
- Latencia y throughput: no disponibles de forma absoluta; el autor reporta reducciones relativas de tokens generados de 6-8 veces por tarea frente al base.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | Modelo completo | No disponible | 35,3% (sin thinking) / 47,1% (thinking) | 47,0% / 55,4% | No disponible | Hugging Face |
| Qwen3.8-27B-opencode-adapted (este) | Adaptador LoRA | No disponible | 51,0% (sin thinking) / 54,9% (thinking) | 53,0% / 56,6% | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros adaptadores o modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3.8-27B y su tokenizador; el adaptador por sí solo no genera texto.
- Los resultados están medidos bajo un arnés concreto (OpenCode), con presupuesto de 100 pasos y sampling específico; no son directamente comparables con los publicados en la model card del modelo base, que usa otros arneses y presupuestos.
- La mejora en SWE-bench Pro tiene un p-valor de 0,057 (no alcanza el umbral convencional de 0,05) y el intervalo de confianza es amplio (±13,9 puntos), por lo que la magnitud del efecto es incierta.
- En Terminal-Bench 2.1 sobre las 84 tareas el p-valor es 0,38; solo el subconjunto de 66 tareas no usadas para seleccionar el checkpoint alcanza significación (p = 0,035), lo que sugiere cierto riesgo de sobreajuste a la selección.
- El modo thinking no aporta mejoras significativas al adaptador según el autor; activarlo puede incrementar el coste sin beneficio claro.
- La torre de visión no se sirve en las evaluaciones; el rendimiento multimodal real del adaptador no está validado.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; como modelo de código, puede generar parches plausibles pero incorrectos.
- Idiomas soportados: no disponibles; el entrenamiento se centró en tareas de código y terminal, predominantemente en inglés técnico.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B, no detallada en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/matrixy/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted-GGUF
- Blogpost de la receta: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- OpenCode: https://opencode.ai
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
