# DenRakEiw/microduck-songkran-duck_7007

## Resumen

`DenRakEiw/microduck-songkran-duck_7007` es una política de control motriz entrenada por refuerzo para el robot bípedo de código abierto Microduck, desarrollado por Pollen Robotics (Hugging Face). No se trata de un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuadores a 50 Hz, empaquetado como un grafo ONNX con la normalización de observaciones integrada. El autor publica el artefacto bajo el identificador `songkran-duck_7007` y lo describe como una política «perpetua» (gait) que se carga en una ranura de política del daemon del robot y se ejecuta de forma continua hasta que se detiene explícitamente.

El modelo se entrenó en simulación con el entorno `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`, partiendo de un checkpoint previo (`hr2-ns1`, modelo 1200) y refinándolo durante 400 iteraciones adicionales con la variante `hr2b-brake` (checkpoint 1425), con 4096 entornos paralelos y una tasa de aprendizaje fija de 3e-4. La model card menciona que el entrenamiento se realizó «con energía solar» y emplea un tono narrativo propio del proyecto, pero los metadatos técnicos de reproducción (commit, semilla, comando) sí son concretos y verificables.

Su relevancia es la de cualquier política de refuerzo transferida a hardware real: demuestra el flujo completo simulación-a-realidad del ecosistema Microduck, un robot de 399 USD pensado como plataforma abierta de investigación en IA física. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB, lo que sugiere un artefacto muy pequeño (coherente con un MLP de control de pocos cientos de miles de parámetros, aunque el dato exacto no está disponible).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor) para control motriz; arquitectura interna no detallada, exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva a 50 Hz, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (artefacto distribuido como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política sigue el patrón habitual de control por refuerzo profundo para robótica: un actor `SprinterActor` (`microduck_challenges.sock_heist_6m.sprinter`) que recibe 61 observaciones crudas y emite 14 acciones, ejecutado a 50 Hz. La normalización de observaciones está horneada dentro de `policy.onnx`, de modo que el consumidor alimenta observaciones sin preprocesar. El entrenamiento se realizó con el stack `mjlab-microduck 0.1.0` (base `1efd853be`), 4096 entornos en paralelo, tasa de aprendizaje fija de 3e-4, coeficiente de entropía 0.0 y guardado cada 25 iteraciones. La política parte de un run anterior (`2026-11-06_07-29-02_hr2-ns1`, checkpoint `model_1200.pt`) y se afina durante 400 iteraciones bajo el nombre de run `hr2b-brake`, terminando en el checkpoint 1425.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla (1) y el mismo `uv.lock` produce una política comparable, no los mismos pesos. La descripción narrativa de la model card («retrained to freeze under the giant's eye, then taught to brake in the giant's turn») sugiere un currículo de dos fases: una de congelación/estabilización y otra de frenado en el giro, aunque no se aportan métricas de recompensa ni curvas de entrenamiento.

## Capacidades

- Locomoción bípeda continua: genera una marcha («perpetual policy») que se ejecuta indefinidamente hasta que el operador la detiene.
- Control reactivo a 50 Hz sobre 14 actuadores a partir de 61 observaciones.
- Frenado y estabilización en giros, según la fase de refinamiento `hr2b-brake`.
- Integración directa con el daemon del robot mediante `robotctl policy load <slot> ...`.
- Autocontenida: normalización de observaciones incluida en el grafo ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo de texto.
- Metadatos de despliegue conformes al esquema 2 del manifiesto de políticas microduck (`docs/policy-manifest.md`).

## Casos de uso

- Investigación en locomoción bípeda: cargar la política en un Microduck físico para estudiar estabilidad y frenado en giros con el checkpoint 1425 como referencia base.
- Comparación de políticas en el mismo robot: al ser una gait de ranura, puede alternarse con otras políticas del ecosistema `microduck-challenges` para evaluar diferencias de comportamiento en hardware idéntico.
- Reproducción de experimentos de RL: el comando de entrenamiento, commit y semilla permiten regenerar una política comparable y analizar la variabilidad entre ejecuciones.
- Docencia y talleres de simulación-a-realidad: el flujo `uv sync` + `uv run train` con 4096 entornos sirve como ejemplo completo de entrenamiento masivamente paralelo para robótica de bajo coste.
- Pruebas de integración del daemon: validar el cargador de políticas, el esquema de manifiesto y el pipeline ONNX en `robotctl` usando un artefacto pequeño y autocontenido.
- Demostraciones de plataforma abierta: el Microduck de 399 USD y sus políticas públicas permiten montar demos de IA física sin infraestructura de GPU dedicada en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye curvas de recompensa, tasas de éxito, métricas de seguimiento de trayectoria ni comparaciones cuantitativas con otras políticas del repositorio `microduck-challenges`.

## Requisitos de hardware

- Inferencia en el propio robot: el artefacto es un ONNX de tamaño de repositorio 0.0 GB y se ejecuta a 50 Hz en el Microduck; no requiere GPU dedicada en el dispositivo.
- VRAM estimada: no disponible con precisión; por el tamaño del repositorio, cabe holgadamente en cualquier GPU consumer, pero el dato exacto de parámetros no se publica.
- GPU recomendadas: no disponible. Para reentrenar, el comando usa 4096 entornos paralelos en `mjlab`, lo que en la práctica exige una GPU de datacenter (A100/H100) o equivalente; no se especifica el hardware usado.
- Despliegue: daemon microduck con `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck_7007`; runtime ONNX. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50 Hz de frecuencia de control declarada; latencia por inferencia no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DenRakEiw/microduck-songkran-duck_7007` | Política RL (ONNX) para Microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras políticas de `pollen-robotics/microduck-challenges` | Políticas RL para Microduck | Depende de la tarea | 50 Hz (entorno) | no disponible en la información | Repositorio de desafíos |
| Políticas base `hr2-ns1` (run previo del mismo autor) | Política RL para Microduck | 61 / 14 | 50 Hz | no disponible | Referenciada como checkpoint de partida |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento simbólico.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Entrenamiento no bit-reproducible: mismos comandos y semilla producen pesos distintos entre máquinas.
- Sin métricas publicadas: no hay evidencia cuantitativa de robustez, tasa de caídas ni generalización a terrenos distintos de los de simulación.
- Riesgo de brecha simulación-realidad: la política se entrenó en `mjlab` y su transferencia al robot físico depende de la fidelidad del modelo y de la calibración del hardware.
- Comportamiento «perpetuo»: la marcha se ejecuta hasta que se detiene explícitamente; requiere supervisión y un mecanismo de parada fiable.
- Artefacto sin adopción: 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Idiomas y sesgos: no aplica en el sentido habitual, pero no hay documentación sobre sesgos de comportamiento (por ejemplo, asimetrías de marcha) ni sobre límites de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7007
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de desafíos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Artículo sobre el lanzamiento de Microduck (The AI Insider): https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Cobertura de TechCrunch sobre Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
