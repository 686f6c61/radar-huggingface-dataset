# RobotControlStack/duobench-act-sim-pour_marbles

## Resumen

DuoBench ACT (sim) es una política de imitación basada en el algoritmo ACT (Action Chunking with Transformers) desarrollada por RobotControlStack para el benchmark DuoBench, un entorno reproducible de manipulación bimanual con dos brazos FR3. El modelo resuelve una única tarea, `pour_marbles` (verter canicas), en el simulador de DuoBench, y se ha entrenado exclusivamente con datos de simulación: 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset DuoBench.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de lenguaje ni un modelo fundacional de robótica, sino un checkpoint de investigación de 51,7 millones de parámetros entrenado desde cero con LeRobot, pensado para reproducir resultados del benchmark y servir de línea base. Su tasa de éxito reportada es del 0,3 % (IC 95 %: [0,1, 1,9]) sobre 300 rollouts, un resultado muy bajo que refleja la dificultad del benchmark más que la calidad del entrenamiento.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors compatibles con LeRobot en el commit `c8ce413d`, y no está destinado al robot real. Es útil, por tanto, como referencia metodológica y como punto de partida para comparaciones dentro de DuoBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con encoder visual y decoder transformer |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; usa chunk de acciones de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un backbone visual (tres cámaras: `head`, `left_wrist`, `right_wrist`, a 224x224) con un transformer encoder-decoder que predice chunks de acciones de longitud 100. La entrada de estado es un vector de 16 dimensiones (2 x 7 articulaciones más 2 pinzas) y la salida es un vector de acción de 16 dimensiones (articulaciones y pinzas). El modelo se entrenó desde cero, sin inicialización desde un checkpoint previo, lo que implica que toda la representación visual y motora se aprende a partir de las demostraciones.

El entrenamiento usó 50 demostraciones por tarea del dataset DuoBench en simulación, con 150.000 pasos, batch size 64, learning rate 1e-5, action chunk 100 y semilla 1000. La configuración completa está en `train_config.json` y el código de referencia es LeRobot en el commit `c8ce413d`. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste posterior; es imitación supervisada pura sobre datos simulados.

## Capacidades

- Manipulación bimanual en simulación: control de dos brazos FR3 con pinzas en el entorno DuoBench.
- Ejecución de una única tarea: `pour_marbles` (verter canicas), política de tarea única sin generalización a otras tareas.
- Percepción visual multi-cámara: integra tres vistas (cabeza y dos muñecas) para predecir acciones.
- Predicción de chunks de acción de 100 pasos, lo que reduce la frecuencia de replanificación.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Línea base reproducible en DuoBench: sirve para comparar nuevas políticas bimanuales contra un resultado publicado con IC 95 %, usando el mismo protocolo de 300 rollouts y semillas 0-299.
- Estudio de imitación desde cero: permite analizar qué aprende ACT con solo 50 demostraciones y sin preentrenamiento, útil para investigar sample efficiency.
- Depuración de pipelines LeRobot: al estar atado a un commit concreto, se puede usar para validar la integración de `ACTPolicy` y el formato de datos DuoBench.
- Análisis de fallos en manipulación bimanual: la baja tasa de éxito facilita estudiar modos de fallo (agarre, coordinación entre brazos, vertido) en simulación.
- Evaluación de técnicas de aumento de datos o currículos: punto de partida para experimentos que añadan demos, ruido o cambios de cámara y medir su impacto.
- Docencia y divulgación: ejemplo compacto (51,7 M de parámetros, repo de 0,2 GB) de política visuomotora bimanual ejecutable en simulación sin grandes recursos.

## Benchmarks y rendimiento

Resultados publicados por el autor en simulación DuoBench, 300 rollouts por tarea (semillas 0-299), intervalo de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| pour_marbles | 0,3 | [0,1, 1,9] |

No se han publicado en la información disponible resultados comparativos con otras políticas ni métricas adicionales (por ejemplo, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y tres cámaras a 224x224, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no especificadas por el autor; cualquier GPU compatible con PyTorch y LeRobot debería bastar para inferencia.
- Cabe en GPU de consumo: sí, por tamaño de parámetros y repo de 0,2 GB, si bien no hay requisitos oficiales publicados.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` (carga vía `ACTPolicy.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) `pour_marbles` | 51,7 M | chunk de 100 acciones | Tarea única bimanual en simulación | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT de DuoBench | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas fundacionales de robótica (p. ej. RT-2, OpenVLA) | no disponible en esta ficha | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos con alternativas de la misma categoría; la comparativa queda limitada a la ausencia de cifras verificables.

## Limitaciones y advertencias

- Entrenado solo con datos de simulación; el autor indica explícitamente que no está pensado para el robot real.
- Tasa de éxito muy baja (0,3 %) en la propia tarea para la que fue entrenado; no es apto como solución de producción.
- Política de tarea única: no generaliza a otras tareas ni a variaciones del entorno no vistas.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones distintas pueden fallar al cargar.
- Riesgo de sobreajuste a las 50 demostraciones y a las condiciones exactas del simulador.
- No se documentan sesgos, pero al ser un modelo robótico no lingüístico no aplican sesgos de lenguaje; sí pueden aparecer sesgos de distribución de datos simulados.
- Licencia Apache 2.0 permite uso comercial, pero el propio modelo no es funcional fuera de simulación, por lo que la restricción práctica es técnica, no legal.
- No hay información sobre calibración, robustez a cambios de iluminación o variaciones de cámara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-act-sim-pour_marbles
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench: https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de referencia): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
