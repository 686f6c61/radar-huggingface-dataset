# DecentVLA/flux3_libero_sigmmd8_accord_w1_expert_r50

## Resumen

flux3_libero_sigmmd8_accord_w1_expert_r50 es un ajuste fino completo (full fine-tune) del modelo base FLUX 3 Action de Black Forest Labs, especializado en control robótico de manipulación. Lo desarrolla el proyecto DecentVLA dentro de un esquema de aprendizaje federado, y corresponde a la ronda 50 (server_round_0050.pt) de un entrenamiento distribuido coordinado. El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de escena en acciones motoras para un brazo robótico, evaluado sobre tareas del benchmark LIBERO.

El checkpoint se ha entrenado con la herramienta decent-vla, usando la configuración `examples/flux_libero_sigmmd8_accord_w1_expert.yaml`. Alcanza un éxito medio del 84,00 % (336/400 episodios, 50 por tarea, semilla 42) sobre ocho tareas de LIBERO que abarcan los conjuntos de evaluación `10`, `goal` y `spatial`. El repositorio ocupa 27,6 GB, coherente con un ajuste fino completo de los pesos en fp32 del modelo base.

Es relevante porque documenta un resultado reproducible de un VLA (vision-language-action) construido sobre FLUX 3 Action y entrenado de forma federada, con desglose por tarea que permite identificar fortalezas (tareas de apertura de cajones y encendido de fogones al 100 %) y debilidades claras (empujar el plato, colocar la botella en la estantería). La licencia es FLUX Kommunity License, de uso exclusivamente no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FLUX 3 Action (modelo base de Black Forest Labs); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el checkpoint publicado es fp32) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | `.pt` (checkpoint PyTorch `server_round_0050.pt`) |

## Arquitectura y entrenamiento

El modelo parte de `black-forest-labs/flux-3-action-base` y se somete a un ajuste fino completo (no LoRA ni adaptadores), según indica la model card. El entrenamiento se realiza con la herramienta decent-vla, que implementa un esquema de aprendizaje federado: el checkpoint publicado es el estado agregado en fp32 de la ronda 50 (`server_round_0050.pt`), lo que implica que los pesos resultan de la fusión de actualizaciones de varios clientes en lugar de un único flujo centralizado.

La configuración concreta del run está en `examples/flux_libero_sigmmd8_accord_w1_expert.yaml` y el runbook asociado en `examples/flux/README_table_arms.md`. El nombre del checkpoint sugiere el uso de una pérdida o regularización de tipo MMD (sigmmd8) y una ponderación `w1` sobre el experto, aunque la model card no detalla la función de pérdida, el volumen de datos de entrenamiento ni si hubo etapas de RLHF o DPO. No se especifican innovaciones de decodificación ni mecanismos de atención particulares más allá de lo que aporte el modelo base.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural e imágenes de la escena (política visión-lenguaje-acción).
- Ejecución de tareas de tipo pick-and-place: colocar un cuenco negro en un cajón, mover un libro a un compartimento, depositar un plato sobre la encimera.
- Tareas de articulación de objetos: abrir el cajón central de un armario, encender un fogón.
- Tareas de colocación sobre superficies elevadas: subir una botella de vino sobre el armario o colocarla en una estantería.
- Evaluación integrada en el pipeline de decent-vla mediante el comando `decent-vla eval` y, para RoboCasa, el script `runtime/remote_policy.py`.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, multilingüismo ni modalities adicionales (audio, visión general fuera del contexto robótico).

## Casos de uso

- Investigación en aprendizaje federado para robótica: el checkpoint de la ronda 50 sirve como referencia para comparar la convergencia de agregaciones federadas frente a entrenamientos centralizados sobre el mismo conjunto LIBERO.
- Reproducción de resultados en LIBERO: ejecutar `decent-vla eval --config examples/flux_libero_sigmmd8_accord_w1_expert.yaml --ckpt server_round_0050.pt` permite verificar el 84 % de éxito reportado y analizar las tareas con peor rendimiento.
- Automatización de tareas de cocina simulada: las tareas de encender el fogón y empujar el plato hacia la parte delantera de la cocina encajan en entornos simulados de tipo cocina doméstica, donde el modelo ya demuestra un 100 % y un 46 % de éxito respectivamente.
- Manipulación de armarios y almacenamiento: las tareas de abrir el cajón central (98 %) y colocar el cuenco en el cajón inferior (100 %) son adecuadas para prototipos de logística doméstica o de laboratorio en simulación.
- Punto de partida para ajuste fino adicional: al ser un full fine-tune en fp32, puede reutilizarse como inicialización para especializar el modelo en un subconjunto de tareas donde flojea (goal t5, goal t9) con datos adicionales.
- Evaluación comparativa de políticas VLA: usar el desglose por tarea del directorio `eval/` como línea base frente a otras políticas entrenadas sobre LIBERO con el mismo protocolo (50 episodios por tarea, semilla 42).
- Despliegue en RoboCasa: mediante `runtime/remote_policy.py` se puede conectar el checkpoint a un entorno remoto de RoboCasa para pruebas de política en un simulador distinto al de entrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre LIBERO (50 episodios por tarea, semilla 42):

| Tarea | Éxitos |
|---|---|
| 10 t3: poner el cuenco negro en el cajón inferior del armario y cerrarlo | 50/50 |
| 10 t5: coger el libro y colocarlo en el compartimento trasero del organizador | 48/50 |
| goal t0: abrir el cajón central del armario | 49/50 |
| goal t2: poner la botella de vino encima del armario | 44/50 |
| goal t5: empujar el plato hacia la parte delantera de la cocina | 23/50 |
| goal t7: encender el fogón | 50/50 |
| goal t9: poner la botella de vino en la estantería | 25/50 |
| spatial t2: coger el cuenco negro del centro de la mesa y ponerlo en el plato | 47/50 |
| **Media** | **336/400 (84,00 %)** |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- Tamaño del repositorio: 27,6 GB, correspondiente al checkpoint fp32 más configuración, logs y resultados de evaluación.
- VRAM estimada para inferencia: no disponible con precisión; un checkpoint fp32 de este tamaño requiere al menos ~28 GB solo para los pesos, por lo que no cabe en GPUs de consumo de 24 GB sin cuantización.
- GPU recomendadas: no disponible de forma explícita; por volumen de pesos, se necesitan GPUs de 40-80 GB (A100 40/80 GB, H100) para cargar el modelo en fp32.
- Compatibilidad con GPU de consumo: no confirmada; requeriría cuantización o conversión a otro formato, no documentada por el autor.
- Opciones de despliegue: el pipeline oficial es decent-vla (`decent-vla eval`), con soporte para RoboCasa vía `runtime/remote_policy.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux3_libero_sigmmd8_accord_w1_expert_r50 | no disponible | no disponible | 84,00 % medio (8 tareas) | FLUX Kommunity (no comercial) | Hugging Face, 0 descargas |
| FLUX 3 Action base (`black-forest-labs/flux-3-action-base`) | no disponible | no disponible | no disponible | FLUX Kommunity (no comercial) | Hugging Face |
| Otras políticas VLA sobre LIBERO | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparativa se limita al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Licencia FLUX Kommunity: uso exclusivamente no comercial. Cualquier despliegue en producción comercial requiere licencia adicional de Black Forest Labs.
- Rendimiento desigual por tarea: dos tareas de LIBERO quedan por debajo del 50 % (goal t5 con 23/50 y goal t9 con 25/50), lo que indica fragilidad en tareas de empuje y colocación en estantería.
- Evaluación limitada a un único benchmark (LIBERO) y a una sola semilla (42); no hay evidencia de generalización a otros entornos salvo la mención de RoboCasa sin resultados publicados.
- Sin datos sobre sesgos, tasas de alucinación en instrucciones ambiguas ni robustez ante variaciones de iluminación o posiciones de objetos.
- El checkpoint es un estado agregado federado en fp32; no se documenta el proceso de agregación, los clientes participantes ni el volumen de datos, lo que dificulta la auditoría del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente del 84 % reportado.
- No se especifican idiomas soportados ni requisitos de contexto; el uso previsto es exclusivamente robótico y en inglés dentro de las instrucciones de LIBERO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/flux3_libero_sigmmd8_accord_w1_expert_r50
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia FLUX Kommunity: https://huggingface.co/black-forest-labs/flux-3-action-base/blob/main/LICENSE.md
