# rooty2020/r2s-baseline-robosimstudio

## Resumen

r2s-baseline-robosimstudio es un repositorio de pesos y artefactos de evaluación publicado por rooty2020 que contiene políticas VLA (vision-language-action) entrenadas como líneas base para un pipeline de real-to-sim-to-real en robótica. El modelo no es una red neuronal única, sino un conjunto de estudiantes destilados a partir de un profesor programático (un programa Python `solve(view) -> Plan` mejorado con un bucle al estilo GaP) sobre escenas simuladas generadas por un simulador afinado con LLM. El objetivo declarado es servir de comparación reproducible frente a métodos propios: los estudiantes son GR00T N1.5 (`nvidia/GR00T-N1.5-3B`) y pi0.5 (openpi), entrenados con 320 demostraciones sintéticas por tarea.

El autor indica explícitamente que se trata de una reimplementación del pipeline descrito en RoboSimStudio (arXiv 2610.18835) dentro de su propio framework, y no del código original; el runtime GaP (graph-as-policy) no se utiliza. La relevancia actual radica en que aborda uno de los cuellos de botella clásicos de la robótica aprendida: la escasez de datos reales, sustituyéndolos por demostraciones generadas en simulación y filtradas por un verificador automático, y midiendo después la transferencia sim2sim con un protocolo de 96 escenas frescas nunca vistas por el método.

El repositorio ocupa 7,6 GB y cubre cinco tareas (straw, banana_basket, chilgyo, towel y air_fryer) con dos estudiantes por tarea. Los resultados publicados están completos solo para algunas combinaciones; varias filas aparecen como "pending" o "running" en la model card. La licencia es Apache 2.0 y el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas VLA: GR00T N1.5 (NVIDIA) y pi0.5 (openpi, Physical Intelligence) |
| Parametros totales | GR00T N1.5: 3B (según el identificador `nvidia/GR00T-N1.5-3B`); pi0.5: no disponible en la información proporcionada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; estructura `pi05/params/`, `pi05/assets/`, `groot/model/` |
| Tamano del repositorio | 7,6 GB |
| Pipeline declarado | robotics |
| Tareas cubiertas | straw, banana_basket, chilgyo, towel, air_fryer |
| Presupuesto de entrenamiento | 320 demos, 30k pasos, batch 64 (15k + 3 x 5k) |
| Hiperparametros | GR00T N1.5: lr 1e-4; pi0.5: lr 1e-5 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: los estudiantes son dos políticas VLA preexistentes. GR00T N1.5 es un modelo de 3B parámetros de NVIDIA orientado a manipulación generalista; pi0.5 es la política de openpi de Physical Intelligence. Ambos se entrenan con el mismo conjunto de 320 demostraciones sintéticas por tarea, generadas por un profesor programático y renderizadas con las cámaras de la tarea. El entrenamiento se limita a una ronda de ajuste fino supervisado (30k pasos, batch 64), sin que la model card mencione RLHF, DPO ni decodificación especulativa.

El pipeline de generación de datos consta de cuatro etapas. Primero, se parte de un simulador base (Sim R0, protocolo 261107, semilla `sim_init` 0) con una perturbación uniforme y se aplica una pasada de ajuste con LLM sobre 16 clips de referencia (12 intentos, pérdida definida como el error de seguimiento de objetos). Después se generan tres variantes físicas (tuned, low, high). El profesor es un programa Python ejecutado sobre 30 layouts x 3 variantes (90 escenas por iteración), con feedback por escena (resultado del verificador y motivo de filtrado de demos), hasta 14 iteraciones y criterio de éxito al 95 %. Las demos finales se producen sobre escenas nuevas (escena i en variante i % 3) y solo se conservan los rollouts que pasan el verificador y el filtro de demos, hasta un máximo de 320. La innovación destacable es el bucle de mejora programática con feedback automático, que sustituye la recolección humana por generación sintética filtrada.

## Capacidades

- Ejecución de políticas de manipulación robótica en las cinco tareas publicadas (straw, banana_basket, chilgyo, towel, air_fryer).
- Control visuomotor a partir de observaciones de cámara y estado del entorno, en el formato de cada estudiante (GR00T N1.5 y pi0.5).
- Generalización a layouts no vistos dentro del mundo simulado del método, medida en el conjunto D de 96 escenas frescas.
- Transferencia sim2sim: evaluación sobre el mundo pseudo-real (Sim R0) como sustituto de realidad.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, diálogo multilingüe, modo thinking, visión general, audio ni generación de texto libre.
- Los artefactos incluyen metadatos de reproducibilidad: `policy.json`, `baseline.json` (registro del método: ajuste del simulador, iteraciones GaP, demos, coste LLM y código fuente del programa final), `world_final.json`, `train_time.json` y `eval/`.

## Casos de uso

- Comparación de líneas base en investigación de real-to-sim-to-real: el repositorio permite reproducir la línea base de RoboSimStudio-style frente a métodos propios con el mismo presupuesto de demos (320) y pasos (30k), lo que hace las comparaciones auditables.
- Generación sintética de datos de manipulación: el pipeline del profesor produce hasta 320 demos filtradas por verificador a partir de una sola demostración teleoperada y la calibración de cámara/escena, reduciendo el coste de recolección humana.
- Evaluación de transferencia sim2sim: el conjunto D de 96 escenas frescas en el mundo pseudo-real sirve como banco de pruebas estandarizado para medir la brecha entre simulación y mundo del método.
- Estudio de la influencia del ajuste del simulador: las tres variantes físicas (tuned, low, high) y las métricas de pérdida de ajuste (por ejemplo, banana_basket 2.377 -> 0.279) permiten aislar el efecto de la fidelidad física en el rendimiento del estudiante.
- Selección de política VLA para una tarea concreta: al publicar ambos estudiantes (GR00T N1.5 y pi0.5) por tarea, el repositorio permite comparar directamente qué familia de políticas se adapta mejor a cada manipulación con el mismo dataset.
- Reproducibilidad de experimentos con LLM en el bucle: `baseline.json` registra el coste LLM por tarea (por ejemplo, 1.76 USD en banana_basket, 8.21 USD en chilgyo, 7.18 USD en air_fryer), lo que facilita estimar el coste computacional de pipelines similares.
- Formación y docencia en robótica aprendida: los artefactos estructurados (`<task>/<student>/`) permiten diseccionar cada etapa del pipeline (simulador, profesor, demos, estudiante) sin necesidad de reentrenar.

## Benchmarks y rendimiento

| Tarea | Estudante | Entrenamiento | Conjunto D (pseudo) | Inicios val (pseudo) | Inicios val (mundo del método) |
|---|---|---|---|---|---|
| banana_basket | groot | 30000 pasos, 2,3 h | 91/96 (94,8 %) | 1/16 (6,2 %) | 0/16 (0,0 %) |
| banana_basket | pi05 | pending | - | - | - |
| chilgyo | groot | - | - | - | - |
| chilgyo | pi05 | - | - | - | - |
| air_fryer | groot | - | - | - | - |
| air_fryer | pi05 | - | - | - | - |
| straw | groot | pending | - | - | - |
| straw | pi05 | pending | - | - | - |
| towel | groot | pending | - | - | - |
| towel | pi05 | pending | - | - | - |

Métricas del pipeline (no del estudiante) por tarea:

| Tarea | Distancia de mundo (Sim R0 -> método) | Pérdida de ajuste | Profesor | Demos | Coste LLM (USD) |
|---|---|---|---|---|---|
| straw | 0,306 -> 0,344 | 3,914 -> 3,613 | running | - | 0,00 |
| banana_basket | 0,417 -> 0,298 | 2,377 -> 0,279 | GaP 88/90 (4 it, passed) | 320/334 escenas | 1,76 |
| chilgyo | 0,417 -> 0,320 | 0,169 -> 0,055 | GaP 88/90 (12 it, passed) | 320/473 escenas | 8,21 |
| towel | 0,404 -> 0,430 | 4,544 -> 4,010 | running | - | 0,00 |
| air_fryer | 0,398 -> 0,230 | 6,029 -> 1,891 | GaP 85/90 (14 it, not passed) | 320/376 escenas | 7,18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, GR00T N1.5 declara 3B parámetros; el repositorio no publica requisitos de memoria ni cuantizaciones.
- GPU recomendadas: no disponible. No se especifican A100, H100, RTX 4090 ni otras.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni descarta.
- Opciones de despliegue: no disponible. El repositorio incluye pesos safetensors y assets por estudiante, pero no documenta integración con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a políticas VLA).
- Latencia y throughput: no disponible. Solo se publica un tiempo de entrenamiento para un caso (GR00T N1.5 en banana_basket: 30000 pasos en 2,3 h).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r2s-baseline-robosimstudio (GR00T N1.5 student) | 3B | no disponible | 91/96 en set D (banana_basket) | Apache 2.0 | Hugging Face (este repo) |
| r2s-baseline-robosimstudio (pi0.5 student) | no disponible | no disponible | pending en la model card | Apache 2.0 | Hugging Face (este repo) |
| nvidia/GR00T-N1.5-3B (modelo base) | 3B | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| pi0.5 (openpi) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | openpi |

La comparación con alternativas de la misma categoría (otras políticas VLA para manipulación) no puede completarse con los datos disponibles: la model card no incluye métricas de terceros ni resultados de los modelos base sin ajuste.

## Limitaciones y advertencias

- Los resultados están incompletos: varias filas de la tabla aparecen como "pending" o "running" (straw y towel en profesor; pi05 pendiente en banana_basket; chilgyo y air_fryer sin métricas de estudiante), por lo que las conclusiones comparativas son parciales.
- El propio autor advierte que es una reimplementación del pipeline de RoboSimStudio en su framework, no el código original, y que el runtime GaP no se usa; la reproducibilidad exacta frente al paper no está garantizada.
- El profesor es un programa Python mejorado con LLM, no una política neuronal; los estudiantes heredan sus sesgos y errores de filtrado (por ejemplo, air_fryer no alcanzó el criterio de éxito: 85/90 en 14 iteraciones).
- La evaluación sim2sim usa un mundo pseudo-real (Sim R0) como sustituto de realidad; no hay validación en hardware físico, lo que limita las afirmaciones sobre transferencia real.
- Los inicios de validación en el mundo del método son muy bajos (0/16 en banana_basket para GR00T N1.5), lo que sugiere una brecha significativa entre el mundo pseudo y el mundo del método.
- No se declaran idiomas soportados ni sesgos conocidos; al ser un modelo de robótica, los riesgos de sesgo se trasladan a la distribución de escenas y layouts del simulador, no documentada en detalle.
- No hay información sobre cuantizaciones, requisitos de hardware ni latencia, lo que dificulta planificar un despliegue en producción.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de modelos base (GR00T N1.5 de NVIDIA y pi0.5 de openpi) cuyas licencias no se detallan en la información disponible; conviene verificar las condiciones de los modelos originales antes de un uso comercial.
- Riesgo de alucinación en el sentido clásico de LLM no aplica directamente; el riesgo equivalente es la ejecución de planes inválidos en escenas fuera de distribución, mitigado parcialmente por el verificador y el filtro de demos.

## Enlaces

- Hugging Face: https://huggingface.co/rooty2020/r2s-baseline-robosimstudio
- Paper de referencia (RoboSimStudio): https://arxiv.org/abs/2610.18835
- Modelo base GR00T N1.5: https://huggingface.co/nvidia/GR00T-N1.5-3B
- openpi (pi0.5): no disponible en la información proporcionada
- Repositorio de código del método: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
