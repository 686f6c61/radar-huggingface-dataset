# seriintan/smolvla_pt_lang3a_frazier_blade

## Resumen

SmolVLA (`smolvla_pt_lang3a_frazier_blade`) es un modelo visión-lenguaje-acción (VLA) compacto, desarrollado por el usuario seriintan sobre la base `lerobot/smolvla_base` de Hugging Face. Está especializado en tareas de manipulación robótica en un entorno quirúrgico simulado: recoger una sonda de succión Frazier y una hoja de bisturí quirúrgico y depositarlas en una cesta azul. El modelo consume el estado articular del robot y tres cámaras (muñeca y lateral) y produce comandos de acción de seis dimensiones.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, se enmarca en la familia SmolVLA, diseñada para lograr un rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. Este checkpoint concreto es un ajuste fino de imitación (behavior cloning) sobre 120 episodios y 48.454 fotogramas a 30 FPS, entrenado con LeRobot 0.6.2.

Su relevancia es acotada: no es un modelo de propósito general, sino una política robótica específica para un robot `so_follower` y dos tareas concretas. Resulta útil como ejemplo reproducible de ajuste fino de SmolVLA en dominios de precisión (instrumental quirúrgico) y como referencia para quien quiera replicar el pipeline con LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); detalles internos no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La model card no detalla la arquitectura interna (backbone visual, encoder de lenguaje, cabecera de acción) ni el número de tokens de preentrenamiento del modelo base; esa información debe consultarse en el paper asociado (arXiv:2506.01844).

El ajuste fino se realizó por imitación sobre el dataset `seriintan/lang3a_frazier_blade`: 120 episodios, 48.454 fotogramas a 30 FPS, con dos tareas ("Pick up the Frazier Suction Tube and place it in the blue basket" y "Pick up the surgical blade and place it in the blue basket"). La configuración de entrenamiento fue de 50.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. No se indica si hubo RLHF, DPO ni otras fases de alineamiento; se trata de aprendizaje por imitación supervisado.

Las entradas del modelo son `observation.state` (vector de 6 dimensiones) y tres imágenes de 3×256×256 (`observation.images.camera1`, `camera2`, `camera3`); la salida es un vector de acción de 6 dimensiones.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (muñeca y lateral) a 256×256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto en inglés en tiempo de inferencia.
- Ejecución de tareas de pick-and-place de precisión sobre instrumental quirúrgico.
- Despliegue en hardware de consumo, según las características de la familia SmolVLA.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, visión general, audio ni modo thinking; es una política robótica, no un LLM conversacional.

## Casos de uso

- Automatización de pick-and-place en entornos quirúrgicos simulados: el modelo traslada la sonda Frazier o el bisturí a la cesta azul siguiendo la instrucción de texto, adecuado para prototipos de asistencia en quirófano.
- Investigación en imitación visual-motora: sirve como checkpoint de referencia para comparar estrategias de ajuste fino de SmolVLA con datasets pequeños (120 episodios).
- Reproducción de pipelines LeRobot: permite validar el flujo completo `lerobot-train` → `lerobot-rollout` con un caso real de dos tareas.
- Benchmark de manipulación de precisión: al operar con objetos pequeños y delicados, es útil para medir tasas de éxito en tareas de alta exigencia espacial.
- Base para ajuste fino adicional: al derivar de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets manteniendo el mismo esquema de observaciones.
- Docencia y divulgación: ejemplo compacto (0,9 GB) de política VLA que cabe en equipos modestos y facilita demostraciones en aula o laboratorio.
- Evaluación de robustez ante variaciones de iluminación o posición de objetos en un dominio médico acotado, siempre que se documenten los resultados (la model card no los incluye).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión nativa requiere del orden de 1-2 GB de memoria, aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas; la familia SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: probable según la descripción de SmolVLA, pero sin confirmación oficial para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=seriintan/smolvla_pt_lang3a_frazier_blade`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seriintan/smolvla_pt_lang3a_frazier_blade | 450 M | no disponible | 2 tareas quirúrgicas (Frazier, bisturí) | apache-2.0 | Hugging Face |
| seriintan/smolvla_lang3a_frazier_blade | no disponible | no disponible | mismas tareas (variante) | no disponible | Hugging Face |
| seriintan/smolvla_frazier | no disponible | no disponible | tarea Frazier | no disponible | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | modelo base preentrenado | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparación se limita a parámetros y licencia cuando están publicados.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para dos tareas concretas con un robot `so_follower` y una configuración de cámaras específica; no generaliza a otras tareas ni robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de robustez, por lo que no puede validarse su fiabilidad en producción.
- Dependencia del entorno: cambios en iluminación, posición de objetos, tipo de cámara o calibración del robot pueden degradar el rendimiento.
- Instrucciones en inglés: las tareas de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Riesgo de sobreajuste al dataset: 120 episodios y 48.454 fotogramas son un volumen reducido, lo que puede limitar la variabilidad cubierta.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base `lerobot/smolvla_base`.
- Dominio sensible: su aplicación en entornos quirúrgicos reales requiere validación clínica independiente; este checkpoint es un artefacto de investigación.
- Sin información sobre sesgos, alucinación o límites de contexto aplicables a políticas VLA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/smolvla_pt_lang3a_frazier_blade
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/lang3a_frazier_blade
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/lang3a_frazier_blade
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Variante relacionada: https://huggingface.co/seriintan/smolvla_lang3a_frazier_blade
- Variante relacionada: https://huggingface.co/seriintan/smolvla_frazier
