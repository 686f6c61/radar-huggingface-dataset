# rooty2020/r2s-gap-integration-students

## Resumen

r2s-gap-integration-students es una colección de políticas robóticas (student policies) derivadas de nvidia/GR00T-N1.5-3B mediante fine-tuning, publicada por el usuario rooty2020. El modelo forma parte de un bucle real-to-sim-to-real: una demostración teleoperada se convierte en un simulador, un programa "teacher" genera demostraciones dentro de ese simulador y un student VLA (vision-language-action) se entrena con ellas, revisando el simulador y el teacher en cada ronda. El repositorio recoge todas las rondas finalizadas del experimento 261127_jh_integration, con una rama (arm) por tarea.

Se trata de un modelo de robótica con pipeline "robotics", construido sobre la arquitectura de GR00T N1.5-3B de NVIDIA, del que hereda los términos de licencia. El repositorio ocupa 30,3 GB y contiene pesos en formato safetensors. No es un modelo de lenguaje generalista: su función es producir acciones motoras a partir de observaciones visuales y de estado, en el contexto de manipulación robótica.

La relevancia es acotada y experimental: se publica como material de investigación sobre integración de bucles real-to-sim, con resultados evaluados únicamente en un mundo proxy (sim2sim), no en robot real. El autor advierte explícitamente que las cifras de set D no son resultados de robot real y que una diferencia inferior a unos 12 escenas está dentro del ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de nvidia/GR00T-N1.5-3B; detalles internos no disponibles |
| Parametros totales | 3B (heredados del modelo base GR00T-N1.5-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gr00t-n1.5-base-model-terms (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del VLA nvidia/GR00T-N1.5-3B. La model card no detalla la arquitectura interna (tipos de capas, mecanismos de atención, tokenizador de acciones), por lo que esa información no está disponible. Lo que sí se especifica es el esquema de entrenamiento: la ronda 0 parte de nvidia/GR00T-N1.5-3B y entrena 30k pasos sobre las demostraciones de esa ronda (`<task>/r0`, compartidas por las ramas de la tarea). Cada ronda posterior añade 30k pasos partiendo de la ronda anterior de la misma rama, con batch 64 y learning rate 1e-4. Una ronda cuyo teacher no supera su puerta de validación no entrena nada y no genera carpeta.

El bucle de entrenamiento es la innovación central: real-to-sim-to-real. Una demostración teleoperada se transforma en simulador; un teacher genera demostraciones en ese simulador; el student VLA se entrena con ellas; y cada ronda revisa tanto el simulador como el teacher. El repositorio incluye tres ramas: `ours_gap_deploy_state` (gap harness de 7 capas, búsqueda simulada medida con puerta de resultado y sondas de despliegue, con el teacher continuando desde el estado donde se detuvo el student), `ours_gap_deploy` (el mismo harness sin esa continuación) y `ours_gap_deploy_jh` (harness más el mundo de la freidora de aire construido por los programas sim_builder y grasp_generator como teacher, sin soldadura de asistencia de agarre). La disposición de cámaras, estado y acciones se documenta en `model/groot15_spec.json` de cada student. No se indica en la información disponible si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y de estado, en tareas de manipulación (straw, banana_basket, chilgyo, towel).
- Aprendizaje por imitación desde demostraciones generadas por un teacher en simulador.
- Integración en bucles real-to-sim-to-real con revisión iterativa del simulador y del teacher.
- Soporte de múltiples tareas mediante ramas separadas por tarea.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje).
- Capacidades especiales (thinking mode, visión, audio): no disponibles más allá de la percepción visual implícita en un VLA.

## Casos de uso

- Investigación en real-to-sim-to-real: el modelo sirve como student de referencia en experimentos que convierten una demostración teleoperada en simulador y entrenan políticas con demostraciones sintéticas. Es adecuado porque el repositorio documenta el bucle completo por rondas.
- Estudio de brechas sim-to-real: las ramas con gap harness de 7 capas y sondas de despliegue permiten analizar dónde se rompe la transferencia entre el simulador y el mundo real.
- Comparación de estrategias de teacher: las ramas `ours_gap_deploy` y `ours_gap_deploy_state` permiten comparar el efecto de que el teacher continúe desde el estado donde se detuvo el student.
- Benchmarking de políticas VLA en tareas de manipulación: las tareas straw, banana_basket, chilgyo y towel ofrecen escenarios concretos con resultados en set D proxy.
- Construcción de simuladores a partir de demostraciones: la rama `ours_gap_deploy_jh` emplea los programas sim_builder y grasp_generator para generar un mundo de freidora de aire, útil como caso de estudio de generación automática de entornos.
- Docencia y reproducción de experimentos: el repositorio incluye los ficheros de datos por ronda (`student.json`) y el esquema de cámaras/estado/acciones, lo que facilita reproducir o extender el pipeline.

## Benchmarks y rendimiento

Resultados de set D (proxy), 96 escenas retenidas evaluadas en un simulador proxy bajo protocolo sim2sim. No son resultados de robot real. Una semilla por rama; diferencias inferiores a unas 12 escenas están dentro del ruido.

| Tarea | Rama | Ronda | Set D (proxy) | Pesos |
|---|---|---|---|---|
| straw | todas | r0 | 9/96 | `straw/r0/model` |
| banana_basket | todas | r0 | 84/96 | `banana_basket/r0/model` |
| chilgyo | todas | r0 | 4/96 | `chilgyo/r0/model` |
| towel | todas | r0 | 69/96 | `towel/r0/model` |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo de 3B parámetros en precisión completa requiere del orden de 6 GB solo para pesos, sin contar activaciones ni el codificador visual, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 30,3 GB, lo que condiciona el almacenamiento necesario para descargar todas las rondas y ramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| r2s-gap-integration-students | 3B (heredados) | no disponible | gr00t-n1.5-base-model-terms | Hugging Face (rooty2020) |
| nvidia/GR00T-N1.5-3B | 3B | no disponible | gr00t-n1.5-base-model-terms | Hugging Face (nvidia) |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (VLA para manipulación) con datos verificables de parámetros, contexto o rendimiento. La comparativa con alternativas adicionales no está disponible.

## Limitaciones y advertencias

- Los resultados de set D son evaluaciones en un mundo proxy bajo protocolo sim2sim; no son resultados de robot real.
- Una semilla por rama; diferencias inferiores a unas 12 escenas sobre 96 están dentro del ruido estadístico.
- El rendimiento es muy desigual por tarea: 84/96 en banana_basket frente a 4/96 en chilgyo y 9/96 en straw en la ronda 0.
- Solo se publican resultados de la ronda 0 en la información disponible; las rondas posteriores se añaden cuando terminan.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones incorrectas fuera de la distribución de entrenamiento, no cuantificado en la documentación.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: los pesos se rigen por los términos de nvidia/GR00T-N1.5-3B (gr00t-n1.5-base-model-terms); es necesario revisar dichos términos antes de cualquier uso comercial.
- Caveat para producción: el modelo es material de investigación experimental, no una política validada en robot real; no se recomienda su despliegue en producción sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/rooty2020/r2s-gap-integration-students
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Términos de licencia: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Resultados por escena: `eval/set_D_proxy.json` (dentro del repositorio)
- Esquema de cámaras/estado/acciones: `model/groot15_spec.json` (dentro de cada student)
- Listado de datos por ronda: `student.json` (dentro de cada ronda)
