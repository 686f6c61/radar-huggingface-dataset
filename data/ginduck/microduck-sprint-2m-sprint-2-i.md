# GinDuck/microduck-sprint-2m-sprint-2-i

## Resumen

sprint-2m-sprint-2-i es un checkpoint de política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicado por el usuario GinDuck en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de una política de aprendizaje por refuerzo entrenada para producir una marcha (gait) que desplaza al robot en línea recta hasta la meta de una carrera. El artefacto desplegable es un fichero ONNX (`policy.onnx`) que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el propio grafo.

El modelo se enmarca en el ecosistema microduck, un robot de bajo coste pensado para docencia e investigación en robótica, y en los retos de carrera organizados por Pollen Robotics (`microduck-challenges`, rama `race-2`). La política es "perpetua": una vez cargada en una ranura de política del demonio `robotctl`, el robot ejecuta la marcha de forma indefinida hasta que se le indique lo contrario. Según la model card, completó la carrera en las cinco pruebas realizadas por el autor.

La relevancia es acotada pero clara para quien trabaja con robótica de refuerzo: es un ejemplo reproducible (semilla, commit, comando de entrenamiento documentados) de un pipeline mjlab + MuJoCo para entrenar políticas de locomoción y desplegarlas en hardware real mediante ONNX. No hay información pública sobre licencia, idiomas ni benchmarks estandarizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (exportación ONNX; el normalizador va embebido) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrenó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`), un framework de aprendizaje por refuerzo sobre MuJoCo orientado a tareas de locomoción. El entorno de entrenamiento es `Mjlab-Sprint2m-MicroDuck`, correspondiente al reto de sprint de 2 metros de la rama `race-2` del repositorio `microduck-challenges`. Se lanzaron 4096 entornos en paralelo durante un máximo de 3000 iteraciones con semilla 1; el checkpoint publicado corresponde a la iteración 1250, es decir, una fase temprana del entrenamiento según el propio autor.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. La interfaz de despliegue es un grafo ONNX que recibe observaciones en crudo (el normalizador está integrado) y devuelve 14 acciones a 50 Hz para el control del robot. No se detalla en la información disponible la topología interna de la red (número de capas, anchura, función de activación) ni el algoritmo de RL empleado (PPO u otro).

## Capacidades

- Locomoción bípeda/cuadrúpeda del microduck: genera una marcha que mantiene al robot erguido y lo desplaza hacia delante.
- Política perpetua: se ejecuta de forma continua hasta que el demonio la detiene o la sustituye.
- Interfaz de observación de 61 dimensiones y 14 acciones a 50 Hz, compatible con el demonio `robotctl`.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración (se alimentan observaciones sin procesar).
- Carga en ranuras de política mediante `robotctl policy load <slot> ...`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Docencia en robótica de refuerzo: cargar la política en un microduck físico para demostrar el ciclo completo entrenamiento en simulación (mjlab/MuJoCo) y despliegue en hardware (ONNX + `robotctl`).
- Reproducción de experimentos: el commit `b44f7ffc9`, la semilla 1 y el comando de entrenamiento documentado permiten recrear una política comparable y estudiar la variabilidad entre ejecuciones.
- Comparación de checkpoints: al ser un checkpoint temprano (iteración 1250) de la misma tanda que otros publicados por el autor, sirve para analizar la evolución de la marcha a lo largo del entrenamiento.
- Pruebas de integración del demonio de control: útil para validar el esquema 2 del manifiesto de políticas y el flujo `robotctl policy load` en pipelines de CI del propio daemon.
- Retos de carrera entre robots: la política completó la meta en las cinco pruebas del autor, por lo que es un candidato directo para participar en carreras microduck.
- Base para fine-tuning o destilación: al estar exportada a ONNX y ser reproducible, puede servir como punto de partida para estudiar sensibilidad a la semilla o para entrenar variantes de marcha.
- Validación de sim-to-real: permite medir la brecha entre el entorno MuJoCo de entrenamiento y el comportamiento en el robot físico con una política concreta y acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo: la política alcanzó la meta en las cinco pruebas de carrera realizadas. No hay métricas de velocidad, consumo, estabilidad ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- El artefacto es un grafo ONNX de política de control; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, aunque no se especifica el número de parámetros.
- Inferencia en CPU es plausible para un modelo de este tamaño a 50 Hz, pero no hay datos confirmados de latencia ni de requisitos mínimos.
- No se especifican GPU recomendadas; para el entrenamiento, el comando documentado usa 4096 entornos paralelos en mjlab, lo que en la práctica requiere una GPU de gama alta, aunque el autor no indica el hardware empleado.
- Despliegue previsto: en el propio robot microduck mediante el demonio `robotctl` y el runtime ONNX; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-sprint-2m-sprint-2-i | Política RL para microduck (ONNX) | no disponible | no aplica (obs. 61-D) | Meta en 5/5 pruebas del autor | no disponible | Hugging Face |
| Otros checkpoints de la misma tanda del autor | Política RL para microduck | no disponible | no aplica | no disponible | no disponible | Hugging Face (mismo autor) |
| Políticas de referencia de `microduck-challenges` | Políticas RL del reto `race-2` | no disponible | no aplica | no disponible | no disponible | Repositorio GitHub de Pollen Robotics |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparación se limita a la categoría y al origen de cada artefacto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval, GSM8K ni métricas similares.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El autor indica que el entrenamiento no es bit-reproducible: los pesos publicados no pueden regenerarse exactamente, solo aproximarse.
- Es un checkpoint temprano (iteración 1250 de un máximo de 3000); su robustez fuera del entorno de entrenamiento no está documentada.
- El rendimiento reportado (5/5 carreras completadas) proviene de pruebas del propio autor, sin protocolo independiente ni métricas publicadas.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no aplican a este tipo de modelo; sí aplica el riesgo de fallo de la política ante perturbaciones no vistas en simulación (sim-to-real gap).
- Depende de la versión del demonio `robotctl` y del esquema 2 del manifiesto de políticas; cambios de esquema pueden romper la carga.
- No hay información sobre el hardware exacto de entrenamiento ni sobre el coste computacional de reproducirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-i
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` dentro del repositorio del demonio
