# RobotControlStack/duobench-act-sim-join_blocks

## Resumen

DuoBench ACT (sim) es una política de imitación basada en el algoritmo ACT (Action Chunking Transformer) entrenada por RobotControlStack para la tarea `join_blocks` del benchmark DuoBench, un entorno reproducible de manipulación bimanual con dos brazos FR3. El modelo se ha entrenado exclusivamente con datos de simulación y está pensado como referencia (baseline) para evaluar políticas de manipulación bimanual dentro del citado benchmark, no para su despliegue en robots reales.

Técnicamente es un transformer ligero de aproximadamente 51,7 millones de parámetros que consume tres cámaras (cabeza y dos muñecas a 224x224) junto con un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas) y produce acciones de 16 dimensiones mediante troceado de acciones (action chunking) de horizonte 100. Se entrenó desde cero con LeRobot sobre 50 demostraciones por tarea y 150.000 pasos de optimización.

Su relevancia es metodológica: forma parte de un conjunto de políticas de referencia publicadas junto a DuoBench para permitir comparaciones reproducibles entre simulación y mundo real en manipulación bimanual. El rendimiento reportado en la propia model card es muy bajo (2,3 % de éxito en 300 rollouts), lo que lo convierte en un punto de partida honesto más que en una solución utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; horizonte de action chunk de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual (las tres cámaras `head`, `left_wrist` y `right_wrist` a 224x224) con un transformer que predice un trozo de acciones futuras en lugar de una sola acción, lo que reduce el error de acumulación típico de las políticas paso a paso. La entrada de estado es un vector de 16 dimensiones (7 articulaciones por brazo más 2 pinzas) y la salida es un vector de acción de 16 dimensiones con articulaciones y pinzas. El horizonte de troceado configurado es de 100 pasos.

El entrenamiento se realizó desde cero con LeRobot (commit `c8ce413d`) sobre 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset DuoBench. Hiperparámetros declarados: 150.000 pasos, batch de 64, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona en la información disponible el uso de RLHF, DPO ni ningún otro ajuste posterior; se trata de aprendizaje por imitación supervisado puro sobre datos simulados.

## Capacidades

- Control de manipulación bimanual: genera comandos de articulación y pinza para dos brazos FR3 en la tarea `join_blocks`.
- Percepción multimodal visual: consume simultáneamente vista cenital y las dos vistas de muñeca.
- Predicción de acciones en bloque (action chunking) con horizonte de 100 pasos.
- Política de tarea única: no es un modelo generalista ni soporta instrucciones en lenguaje natural.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de referencia en DuoBench: sirve como baseline ACT para comparar nuevas políticas bimanuales en la tarea `join_blocks` dentro de simulación, usando el código oficial del benchmark para lanzar los rollouts.
- Reproducción de experimentos: al estar fijados commit de LeRobot, semilla e hiperparámetros, permite replicar exactamente el resultado reportado y auditar variaciones del pipeline de entrenamiento.
- Estudio de límites del aprendizaje por imitación con pocos datos: con solo 50 demostraciones simuladas, es útil para analizar cómo escala el rendimiento con el número de demostraciones o con aumentación de datos.
- Desarrollo de pipelines de entrenamiento en LeRobot: sirve de plantilla para configurar políticas ACT bimanuales con múltiples cámaras y vectores de estado de 16 dimensiones.
- Investigación en sim-to-real: aunque no está pensado para el robot real, puede emplearse como punto de partida para estudiar técnicas de transferencia (domain randomization, ajuste fino con datos reales) y medir la brecha sim-real.
- Docencia y divulgación: ejemplo compacto (51,7 M de parámetros, 0,2 GB) de política robótica completa que cabe en cualquier equipo y se puede inspeccionar y modificar con facilidad.

## Benchmarks y rendimiento

Resultados reportados en la model card para la simulación de DuoBench, sobre 300 rollouts por tarea (semillas 0-299) con intervalo de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| join_blocks | 2,3 | [1,1, 4,7] |

No se han publicado en la información disponible resultados comparativos con otras políticas en MMLU, HumanEval, GSM8K ni benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros, ~0,2 GB de pesos); el cuello de botella real es el renderizado del simulador, no la política.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para el simulador; para entrenamiento, una GPU de gama media (RTX 3060/4070 o superior) es suficiente por el tamaño del modelo y el batch de 64.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` mediante `ACTPolicy.from_pretrained`; el entorno de simulación se ejecuta con el código de DuoBench. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de otras políticas ACT o alternativas (Diffusion Policy, VQ-BeT, etc.) sobre la misma tarea `join_blocks` de DuoBench, por lo que la comparación cuantitativa no está disponible. A nivel estructural, este modelo se distingue por ser una política de tarea única, 51,7 M de parámetros, entrenada solo en simulación y publicada con licencia Apache 2.0; cualquier comparación con políticas entrenadas en el mundo real o con modelos multi-tarea requeriría datos que no se han facilitado.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el propio autor indica que no está destinado al robot real.
- Rendimiento muy bajo incluso en simulación: 2,3 % de éxito con IC 95 % de [1,1, 4,7], insuficiente para cualquier aplicación práctica.
- Política de tarea única: no generaliza a otras tareas de DuoBench ni a instrucciones nuevas.
- Requiere una versión concreta de LeRobot (commit `c8ce413d`); versiones posteriores pueden romper la carga del modelo.
- Riesgo de sobreajuste a las 50 demostraciones y a la semilla 1000 del entrenamiento.
- Sin información sobre sesgos demográficos o de otro tipo, al no procesar datos humanos textuales.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su utilidad práctica es nula fuera de investigación y evaluación; conviene revisar la licencia del dataset y del simulador DuoBench por separado.
- No se han publicado variantes cuantizadas ni formatos alternativos de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotControlStack/duobench-act-sim-join_blocks
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto DuoBench: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de referencia): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
