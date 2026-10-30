# PranavJay/scottyrl-a3-p5_textcraft_grpo

## Resumen

`PranavJay/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` (4.000 millones de parámetros) con el framework de entrenamiento por refuerzo scottyrl. Es un artefacto de la Práctica 3 de la asignatura 11-768 (AI Agents) de CMU, entrenado con GRPO (Group Relative Policy Optimization) sobre TextCraft, un entorno agéntico textual de fabricación de objetos usado como benchmark de uso de herramientas, tal como indica el nombre de la ejecución (`p5_textcraft_grpo`).

Su relevancia es principalmente académica: demuestra un pipeline completo de post-entrenamiento por RL de un modelo abierto pequeño para tareas agénticas, con exportación reproducible (commit de git, URI de Tinker `tinker://model_7e48a628/v50_r1`) y un protocolo de evaluación documentado con vLLM sobre las particiones de validación medium y hard de TextCraft-Synth. No es un modelo de propósito general, sino un adaptador especializado de 0,2 GB, sin licencia declarada y sin validación comunitaria (0 descargas y 0 likes en el momento de la ficha).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el transformer Qwen3.5-4B |
| Parámetros totales | Modelo base: 4.000 millones (Qwen3.5-4B); adaptador: 0,2 GB en safetensors, recuento exacto no disponible |
| Parámetros activos | No aplicable (es un adaptador LoRA, no un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B; no se documenta en la ficha) |
| Tipos de cuantización | No disponible (el adaptador se distribuye sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un adaptador LoRA de rango 32 que se aplica sobre el transformer Qwen3.5-4B. Este esquema de PEFT congela los pesos del modelo base y entrena únicamente matrices de bajo rango inyectadas en las capas atendidas, lo que reduce el tamaño del artefacto a 0,2 GB y permite servirlo junto al modelo base mediante servidores con soporte LoRA dinámico.

El entrenamiento se realizó con el framework scottyrl mediante GRPO, un algoritmo de aprendizaje por refuerzo que optimiza la política a partir de ventajas relativas calculadas dentro de grupos de respuestas muestreadas, sin necesidad de modelo de valor. La tarea de entrenamiento es TextCraft (config `configs/p5_textcraft_grpo.yaml`), un entorno agéntico donde el modelo debe planificar y ejecutar secuencias de acciones textuales para fabricar objetos. La etiqueta `tinker` y la URI de exportación (`tinker://model_7e48a628/v50_r1`) indican que el entrenamiento se ejecutó sobre la plataforma Tinker. El número de tokens, la composición del dataset y los hiperparámetros concretos de GRPO no se detallan en la model card; no hubo RLHF ni DPO documentados, ya que el método declarado es GRPO.

## Capacidades

- Resolución de tareas agénticas en TextCraft: planificación multi-paso y ejecución de acciones textuales para completar recetas de fabricación de objetos.
- Mejora esperada del modelo base en las particiones de validación medium y hard de TextCraft-Synth, verificada con el script de evaluación del curso con cuatro muestras por tarea (`--k 4`).
- Uso de herramientas en formato textual dentro del entorno para el que fue entrenado; no hay evidencia documentada de tool calling genérico tipo function calling.
- Compatibilidad con serving de LoRA en vLLM (`--enable-lora`, `--max-lora-rank 32`), lo que permite cargar el adaptador sin modificar el modelo base.
- Conservación teórica de las capacidades generales de Qwen3.5-4B al tratarse de un adaptador, aunque sin evaluación publicada fuera de TextCraft.
- Capacidades de visión, audio o thinking mode: no disponibles ni documentadas.

## Casos de uso

- Docencia de RL para agentes: sirve como material de referencia de la asignatura 11-768 de CMU para estudiar cómo se aplica GRPO a un entorno agéntico concreto, con configuración, commit y URI de exportación públicos.
- Investigación reproducible en post-entrenamiento: el pipeline (adaptador + script de evaluación + particiones TextCraft-Synth medium/hard) permite replicar experimentos y usarlo como baseline al probar otros algoritmos de RL sobre la misma tarea.
- Prototipado de serving de LoRA con vLLM: el README documenta los comandos exactos para servir el adaptador junto al modelo base, lo que lo hace útil como ejemplo de extremo a extremo de despliegue de adaptadores PEFT.
- Punto de partida para fine-tuning adicional: al pesar solo 0,2 GB, puede continuar entrenándose o fusionarse con el modelo base para extender el enfoque a otros entornos agénticos.
- Evaluación de modelos pequeños en uso de herramientas: permite medir cómo un modelo de 4B con un adaptador ligero se comporta frente a tareas agénticas multi-paso sin recurrir a modelos grandes.
- Comparación de métodos de post-entrenamiento: al estar entrenado con GRPO sobre una tarea definida, facilita comparativas contra adaptadores SFT o DPO entrenados sobre el mismo base y la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la metodología de evaluación (servido con vLLM y ejecución de `scripts/evaluate_checkpoint.py` sobre las particiones medium y hard de TextCraft-Synth con `--k 4`), pero no incluye ninguna métrica numérica de rendimiento.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en disco; su huella adicional en VRAM durante la inferencia es marginal (estimación: menos de 0,5 GB con rango 32 activo en vLLM).
- El requisito dominante es el modelo base Qwen3.5-4B: en bf16 requiere aproximadamente 8 GB de VRAM (estimación), más la caché KV según la longitud de contexto utilizada.
- GPUs recomendadas (estimación): una RTX 4090 o RTX 3090 (24 GB) ejecuta el conjunto con holgura; una tarjeta de 12 GB (RTX 4070, RTX 3060 12 GB) debería ser suficiente para el base en bf16 con contexto moderado. No se necesitan A100 ni H100 salvo para evaluaciones masivas en paralelo.
- Sí cabe en GPU de consumo: cualquier tarjeta de 12 GB o más para la ruta documentada; con cuantización a 4 bits del base (estimación: unos 3 GB) sería viable en tarjetas de 8 GB, aunque esta ruta no está documentada en la ficha.
- Despliegue documentado: vLLM con `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=PranavJay/scottyrl-a3-p5_textcraft_grpo`. El uso con llama.cpp, Ollama o TGI no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los resultados de búsqueda muestran varias réplicas del mismo adaptador subidas por otros usuarios (presumiblemente compañeros de curso con la misma práctica), además del modelo base sin adaptador:

| Modelo | Tipo | Base | Rango LoRA | Tamaño del repo | Licencia |
|---|---|---|---|---|---|
| PranavJay/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA (GRPO, TextCraft) | Qwen3.5-4B | 32 | 0,2 GB | No disponible |
| sam4876/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA (GRPO, TextCraft) | Qwen3.5-4B | 32 | No disponible | No disponible |
| hhsee/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA (GRPO, TextCraft) | Qwen3.5-4B | 32 | No disponible | No disponible |
| Marstbowl/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA (GRPO, TextCraft) | Qwen3.5-4B | 32 | No disponible | No disponible |
| Qwen/Qwen3.5-4B (sin adaptador) | Modelo base denso | — | — | No disponible | No disponible |

Las réplicas parecen ser el mismo artefacto re-subido, por lo que no existen diferencias de rendimiento publicables entre ellas; la elección entre una u otra carece de relevancia técnica más allá de la trazabilidad del autor original.

## Limitaciones y advertencias

- Alcance muy estrecho: el adaptador está entrenado para TextCraft y no hay evidencia de que mejore capacidades generales; podría incluso degradar el comportamiento del modelo base fuera de su tarea, y esta degradación no ha sido evaluada.
- Sin licencia declarada: existe incertidumbre legal para cualquier uso comercial; habría que atender además a los términos de licencia del modelo base Qwen3.5-4B, no documentados en esta ficha.
- Artefacto académico sin validación: 0 descargas, 0 likes y una model card mínima; no debe considerarse listo para producción.
- Riesgo de alucinación heredado del modelo base, posiblemente agravado por el sobreajuste de formato típico del RL en tareas estrechas; no hay evaluaciones de veracidad ni de seguridad.
- Longitud de contexto, idiomas soportados y datos de entrenamiento del pipeline no documentados, lo que dificulta evaluar su idoneidad para otros escenarios.
- Dependencia de vLLM con soporte LoRA (`--max-lora-rank 32`): la compatibilidad con otras runtimes de inferencia no está documentada.
- La evaluación publicada se limita a las particiones medium y hard de TextCraft-Synth con cuatro muestras por tarea, sin métricas numéricas públicas, por lo que el rendimiento real es desconocido.

## Enlaces

- Ficha del modelo: https://huggingface.co/PranavJay/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Réplicas detectadas en la búsqueda: https://huggingface.co/sam4876/scottyrl-a3-p5_textcraft_grpo , https://huggingface.co/hhsee/scottyrl-a3-p5_textcraft_grpo , https://huggingface.co/Marstbowl/scottyrl-a3-p5_textcraft_grpo , https://huggingface.co/BrianUppp/scottyrl-a3-p5_textcraft_grpo , https://huggingface.co/grgare/scottyrl-a3-p5_textcraft_grpo
- Paper, blog o demo asociados: no disponible
