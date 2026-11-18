# DecentVLA/flux3_libero_sigmmd8_cent_r50

## Resumen

`flux3_libero_sigmmd8_cent_r50` es un fine-tune completo del modelo base `black-forest-labs/flux-3-action-base`, publicado por el usuario DecentVLA dentro de su línea de trabajo en visión-lenguaje-acción (VLA) para robótica. El modelo está entrenado con el framework `decent-vla` y se distribuye como un checkpoint agregado de la ronda 50 de un proceso de entrenamiento federado, identificado internamente como `server_round_0050.pt`. Su propósito es la ejecución de tareas de manipulación robótica descritas en lenguaje natural sobre el benchmark LIBERO.

La relevancia de esta publicación es doble. Por un lado, demuestra la aplicación de un pipeline de aprendizaje federado al ajuste de un modelo generativo de gran tamaño orientado a acciones motoras, algo poco habitual en el ecosistema open source. Por otro, reporta un rendimiento agregado del 95,25 % de éxito (381 de 400 episodios) en tareas de LIBERO, un dato que, de confirmarse de forma independiente, situaría al modelo en la franja alta de los sistemas VLA evaluados sobre ese benchmark.

El repositorio ocupa 27,6 GB e incluye el estado agregado en fp32, los ficheros de resultados de evaluación, la configuración del experimento y los registros de la ejecución. La licencia es la FLUX Kommunity License del modelo base, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune completo de `black-forest-labs/flux-3-action-base`; arquitectura del base no detallada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint distribuido es fp32) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | `.pt` (checkpoint PyTorch, `server_round_0050.pt`) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo (full fine-tune) del modelo base `flux-3-action-base`, un modelo de la familia FLUX orientado a la generación de acciones para robótica. No se detalla en la información disponible la arquitectura interna del base (tipo de transformer, mecanismo de atención, integración de la modalidad visual y de lenguaje, ni el espacio de acciones). El checkpoint publicado corresponde al estado agregado tras 50 rondas de un proceso de entrenamiento federado gestionado con el framework `decent-vla`, bajo la configuración `examples/flux_libero_sigmmd8_cent.yaml` y el runbook `examples/flux/README_table_arms.md`.

El nombre del experimento (`sigmmd8`, `cent`, `aug`) sugiere el uso de una función de agregación basada en Maximum Mean Discrepancy con kernel sigmoide (SigmaMMD) y de una variante centralizada, además de aumento de datos, aunque la información proporcionada no documenta el detalle de estos componentes. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El entrenamiento se realizó sobre tareas de LIBERO, un benchmark de manipulación con variantes de tipo spatial, object, goal y long-horizon (las tareas reportadas pertenecen a las suites `10` y `goal`).

## Capacidades

- Ejecución de tareas de manipulación robótica a partir de instrucciones en lenguaje natural, en el formato del benchmark LIBERO.
- Control de políticas de acción continuas para brazos robóticos en entornos simulados (LIBERO; soporte adicional para RoboCasa mediante `runtime/remote_policy.py`).
- Tareas de largo horizonte con múltiples pasos encadenados (por ejemplo, abrir un cajón, colocar un objeto y cerrarlo).
- Tareas de razonamiento espacial (colocar un objeto en una posición relativa a otro).
- Integración con el pipeline de evaluación `decent-vla eval` para reproducir los resultados reportados.
- Soporte de entrenamiento federado: el checkpoint es un estado agregado de servidor, reutilizable como punto de partida en flujos de `decent-vla`.
- No se documentan en la información disponible capacidades de tool calling, agentes de texto, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación comparativa de políticas VLA en LIBERO: el modelo puede puntuarse directamente con `decent-vla eval --config examples/flux_libero_sigmmd8_cent.yaml --ckpt server_round_0050.pt`, lo que permite reproducir el 95,25 % reportado y compararlo con otras políticas sobre las mismas tareas.
- Investigación en aprendizaje federado para robótica: al ser un estado agregado de la ronda 50, sirve como referencia para estudiar la convergencia del esquema SigmaMMD centralizado y para inicializar nuevas rondas o ablaciones.
- Prototipado de manipulación en simulación: el modelo cubre tareas como abrir cajones, apilar objetos, encender un fogón o colocar botellas en una estantería, útiles para validar pipelines de percepción-acción antes de trasladarlos a hardware.
- Benchmarking de infraestructura de inferencia robótica: el checkpoint fp32 de 27,6 GB permite medir latencia y throughput de políticas VLA en GPUs de datacenter y comparar estrategias de servicio (por ejemplo, `runtime/remote_policy.py` frente a ejecución local).
- Generación de datos sintéticos de trayectorias: las políticas entrenadas con éxito en LIBERO pueden emplearse para producir rollouts etiquetados que alimenten el entrenamiento de modelos más pequeños o de sistemas de imitación.
- Estudio de robustez y generalización: las tareas con menor éxito (por ejemplo, `goal t5` con 39/50) permiten analizar modos de fallo concretos y diseñar aumentos de datos o ajustes finos específicos.
- Base para fine-tuning en dominios propios: al ser un fine-tune completo, puede reajustarse sobre datasets de manipulación propios, siempre que se respete la licencia no comercial.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre LIBERO, 50 episodios por tarea, semilla 42:

| Tarea | Éxitos |
|---|---|
| 10 t3: colocar el cuenco negro en el cajón inferior del armario y cerrarlo | 49/50 |
| 10 t5: coger el libro y colocarlo en el compartimento trasero del organizador | 49/50 |
| goal t0: abrir el cajón central del armario | 50/50 |
| goal t2: colocar la botella de vino encima del armario | 46/50 |
| goal t5: empujar el plato a la parte delantera del fogón | 39/50 |
| goal t7: encender el fogón | 50/50 |
| goal t9: colocar la botella de vino en la estantería | 48/50 |
| spatial t2: coger el cuenco negro del centro de la mesa y colocarlo en el plato | 50/50 |
| **Media** | **95,25 % (381/400)** |

No se han publicado en la información disponible comparaciones con otros modelos ni resultados en benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

## Requisitos de hardware

- El checkpoint distribuido es fp32 y ocupa 27,6 GB en el repositorio; la VRAM necesaria para inferencia será al menos del orden del tamaño de los pesos en ese formato, más el estado de activaciones y del codificador visual, no cuantificado en la información disponible.
- No se dispone de estimaciones de VRAM para cuantizaciones (GGUF, int8, int4) porque el autor no publica versiones cuantizadas.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un checkpoint fp32 de esta magnitud requiere GPUs de datacenter (A100, H100) o, como mínimo, GPUs consumer con 24 GB o más si se aplican técnicas de descarga parcial, extremo no verificado.
- Despliegue: el flujo documentado es `decent-vla eval` para evaluación y `runtime/remote_policy.py` para ejecuciones en RoboCasa. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son directamente aplicables a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DecentVLA/flux3_libero_sigmmd8_cent_r50` | no disponible | no disponible | 95,25 % (381/400) reportado por el autor | FLUX Kommunity (no comercial) | Hugging Face |
| `black-forest-labs/flux-3-action-base` | no disponible | no disponible | no disponible | FLUX Kommunity (no comercial) | Hugging Face |
| Otras políticas VLA (OpenVLA, π0, etc.) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación con alternativas del mismo tamaño o tarea queda pendiente de una evaluación independiente sobre el mismo protocolo.

## Limitaciones y advertencias

- La licencia FLUX Kommunity restringe el uso a fines no comerciales; cualquier despliegue en producción comercial requiere autorización expresa del titular de los pesos base.
- El rendimiento reportado (95,25 %) procede del propio autor y de una única semilla (42); no se ha validado de forma independiente y puede no generalizar a otras semillas, entornos o variaciones de las tareas.
- El modelo está entrenado específicamente sobre tareas de LIBERO; su generalización a escenas, objetos o robots distintos de los del benchmark no está documentada.
- Existe una tarea con rendimiento notablemente inferior (`goal t5`, 39/50), lo que indica modos de fallo concretos que conviene analizar antes de usar el modelo en tareas de empuje similares.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje, ya que el modelo produce acciones motoras y no texto libre; aun así, no hay evaluación de seguridad ni de robustez frente a instrucciones ambiguas.
- El checkpoint es un estado agregado de un proceso federado; no se detalla la composición de los clientes ni posibles sesgos derivados de la agregación.
- El repositorio incluye únicamente pesos en fp32 y ficheros de configuración y logs; no hay versiones cuantizadas ni herramientas de despliegue listas para producción.
- No se especifican los idiomas de las instrucciones soportadas; los resultados se reportan sobre instrucciones en inglés del benchmark LIBERO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/flux3_libero_sigmmd8_cent_r50
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base/blob/main/LICENSE.md
