# chengenwu/moe-planner750-fast-plug-charger

## Resumen

`chengenwu/moe-planner750-fast-plug-charger` es una politica de imitacion para robotica basada en una mezcla de expertos (MoE) con siete niveles de resolucion, entrenada para la tarea de manipulacion PlugCharger del entorno ManiSkill. El autor, chengenwu, la entrena con su pipeline propio `vig-dagger` sobre las primeras 750 demostraciones de planificador de movimiento rapido del repositorio de datos `chengenwu/fast-exp-plug-charger`. El modelo resuelve el problema de aprender una politica de control continuo a partir de demostraciones heterogeneas, combinando expertos especializados por resolucion en lugar de una unica red densa.

La relevancia del checkpoint es fundamentalmente metodologica: forma parte de un barrido de umbrales (threshold sweep) que compara DAgger con umbral fijo entre los percentiles p65 y p95 de la metrica VIG (value-of-information guidance), con 800 episodios exitosos por umbral, seguido de una politica densa entrenada sobre las 750 demostraciones mas cada recoleccion. El checkpoint publicado es solo de pesos: sirve para DAgger y evaluacion, pero no permite reanudar el entrenamiento.

El modelo es de nicho y muy reciente (creado el 27 de noviembre de 2026), sin descargas ni likes en el momento de la consulta, y sin model card extendida sobre arquitectura interna, licencia o idiomas. Su valor esta en la reproducibilidad del experimento de barrido de umbrales y en la evaluacion estandarizada sobre 200 escenas de ManiSkill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 7 niveles de resolucion; politica de imitacion para control robotico |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint solo de pesos, sin capacidad de reanudar entrenamiento) |

## Arquitectura y entrenamiento

La politica es una mezcla de expertos con siete niveles de resolucion, entrenada mediante el pipeline `vig-dagger` del autor. El entrenamiento usa las primeras 750 demostraciones de planificador de movimiento rapido del dataset `chengenwu/fast-exp-plug-charger`: los primeros 50 de `raw/planner/` y el resto de `raw/planner_baselines/`, en orden. De esas 750, 735 se usan para entrenamiento y el resto se reservan para validacion, lo que da 92.030 muestras y 86.280 actualizaciones (60 epocas) con semilla de entrenamiento 0.

La innovacion tecnica es el uso de la metrica VIG (value-of-information guidance) para segmentar el entrenamiento por umbrales. El autor calcula percentiles de VIG sobre cada cuarto fotograma de las 750 demostraciones (26.579 fotogramas) y los publica en `base/thresholds.json` y `base/demo_scores.npz`. Los valores de VIG en los percentiles p65, p70, p75, p80, p85, p90 y p95 son 0,02023, 0,02271, 0,02604, 0,03034, 0,03630, 0,04524 y 0,06038 respectivamente. El checkpoint forma parte de la fila de 750 demostraciones del barrido de umbrales: DAgger con umbral fijo de p65 a p95, 800 episodios exitosos por umbral, y despues una politica densa sobre las 750 demostraciones mas cada recoleccion.

## Capacidades

- Control robotico de manipulacion para la tarea PlugCharger en ManiSkill: insercion de un cargador, con politica de accion continua.
- Aprendizaje por imitacion a partir de demostraciones de planificador de movimiento rapido.
- Mezcla de expertos con siete niveles de resolucion, lo que permite especializacion por escala de movimiento.
- Evaluacion estandarizada sobre 200 escenas de ManiSkill desde la semilla 60000 con 400 pasos.
- Integracion en el pipeline DAgger del autor para recoleccion de datos y evaluacion.
- No soporta tool calling, function calling, agentes, multilingue, vision general, audio ni modos de razonamiento: es una politica de control, no un modelo generativo de proposito general.

## Casos de uso

- Reproduccion del barrido de umbrales VIG: el checkpoint ocupa la fila de 750 demostraciones en la rama `plugcharger-threshold-sweep` (`configs/threshold_planner750.yaml`, `moe.download`), lo que permite comparar el rendimiento de DAgger con umbral fijo entre p65 y p95 sobre la misma base de demostraciones.
- Investigacion en aprendizaje por imitacion con MoE: sirve como linea base para estudiar si la especializacion por resolucion mejora la cobertura de escenas frente a una politica densa equivalente.
- Evaluacion comparativa en ManiSkill PlugCharger: con 200 escenas fijas desde la semilla 60000 y 400 pasos, permite medir de forma reproducible la tasa de exito de una politica (29,0 % en resolucion completa aislada) frente a variantes.
- Generacion de datos para DAgger: el checkpoint se carga para recoleccion de episodios adicionales, que despues alimentan la politica densa entrenada sobre las 750 demostraciones mas cada recoleccion.
- Estudio de la relacion entre VIG y exito: los percentiles de VIG publicados (de 0,02023 a 0,06038) permiten analizar como el umbral de seleccion de muestras afecta al rendimiento final.
- Docencia y divulgacion en robotica: como ejemplo reproducible de pipeline completo (demostraciones, umbrales, MoE, DAgger y evaluacion) en un entorno de simulacion estandar.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exito en resolucion completa aislada | 58/200 = 29,0 % (semilla 60000, 400 pasos) |
| VIG p65 | 0,02023 |
| VIG p70 | 0,02271 |
| VIG p75 | 0,02604 |
| VIG p80 | 0,03034 |
| VIG p85 | 0,03630 |
| VIG p90 | 0,04524 |
| VIG p95 | 0,06038 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,2 GB, lo que sugiere un checkpoint ligero que probablemente cabe en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio (0,2 GB) es plausible en RTX 3060 o superiores, pero es una inferencia no verificada.
- Opciones de despliegue: no disponible; el autor menciona carga para DAgger y evaluacion en ManiSkill, sin detallar servidores de inferencia (vLLM, llama.cpp, Ollama, TGI no aplican a una politica de control).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moe-planner750-fast-plug-charger | no disponible | no aplica | 29,0 % en 200 escenas | no disponible | Hugging Face |
| Politica densa sobre 750 demos + recolecciones | no disponible | no aplica | no disponible | no disponible | Referenciada en la model card, sin checkpoint publicado |
| Otras filas del barrido de umbrales p65-p95 | no disponible | no disponible | no disponible | no disponible | Referenciadas en la rama `plugcharger-threshold-sweep` |

No se dispone de datos publicados de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es solo de pesos: carga para DAgger y evaluacion, pero no puede reanudar el entrenamiento.
- Rendimiento limitado: 29,0 % de exito en resolucion completa aislada sobre 200 escenas, lo que deja un margen amplio de mejora.
- Especifico de la tarea PlugCharger y del simulador ManiSkill; no es transferible a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, matematicas, vision general ni capacidades multilingues.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Sesgos conocidos: no documentados; al entrenarse con 735 demostraciones de un planificador concreto, hereda las limitaciones de cobertura de ese planificador.
- Riesgo de sobreajuste a la distribucion de las demostraciones de planificador rapido; el autor reserva 15 demostraciones para validacion, pero no publica curvas de validacion.
- Sin descargas ni validacion externa en el momento de la consulta; la reproducibilidad depende del pipeline `vig-dagger` y del dataset `chengenwu/fast-exp-plug-charger`.

## Enlaces

- Hugging Face: https://huggingface.co/chengenwu/moe-planner750-fast-plug-charger
- Dataset de demostraciones: https://huggingface.co/datasets/chengenwu/fast-exp-plug-charger (referenciado en la model card)
- Rama del barrido de umbrales: `plugcharger-threshold-sweep` (referenciada en la model card, sin URL directa)
- Configuracion del experimento: `configs/threshold_planner750.yaml` (referenciada en la model card)
- Percentiles de VIG: `base/thresholds.json` (incluido en el repositorio)
- Puntuaciones por fotograma: `base/demo_scores.npz` (incluido en el repositorio)
