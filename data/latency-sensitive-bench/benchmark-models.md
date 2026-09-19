# latency-sensitive-bench/benchmark-models

## Resumen

Latency-Sensitive Bench models no es un modelo de lenguaje, sino un repositorio de artefactos de investigación en robótica y aprendizaje por refuerzo publicado por el usuario `latency-sensitive-bench` en HuggingFace. Contiene checkpoints de inferencia listos para usar ("inference-ready teachers and VLA policies") correspondientes a tareas concretas de benchmark: manipulación tipo intercept-grab y equilibrio de humanoides. El repositorio se organiza en rutas que codifican la sensibilidad a la latencia del escenario (`latency-aware` frente a `zero-latency`), la tarea, el tipo de política (`small-policy` o `vla`) y la versión del checkpoint.

El contenido combina dos familias de artefactos. Por un lado, profesores de RL entrenados desde cero: PPO para la tarea MIKASA intercept-grab-fast y FastTD3 para HumanoidBench balance-simple. Por otro, políticas VLA (vision-language-action) de inferencia: un checkpoint StarVLA QwenOFT de 5k pasos para MIKASA y un bundle oficial GR00T N1.7 de 10k pasos para balance-simple. El único resultado cuantitativo publicado en la model card es una tasa de éxito del 98,83 % (253/256 episodios) en una evaluación independiente de la política PPO entrenada con el perfil temporal QwenOFT RTX 3090.

Su relevancia actual reside en que aborda explícitamente la latencia de inferencia como variable de primer orden en políticas robóticas, un aspecto crítico cuando el control se ejecuta en hardware de gama de consumo (el perfil temporal hace referencia a una RTX 3090). El repositorio ocupa 291,6 GB, no declara parámetros, contexto ni idiomas, y se distribuye bajo una licencia `other` cuyos términos no se detallan. Los artefactos de Extreme Parkour y HAIC se omiten deliberadamente hasta que sus pipelines VLA superen las puertas de validación documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se citan politicas PPO y FastTD3, y modelos VLA StarVLA QwenOFT y GR00T N1.7) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Tamano del repositorio | 291,6 GB |
| Tareas cubiertas | mikasa-intercept-grab-fast, humanoidbench-balance-simple |
| Variantes publicadas | 5 checkpoints (3 de MIKASA, 2 de balance-simple) |
| Hardware de referencia | perfil temporal RTX 3090 (solo para la variante `ppo-qwenoft-rtx3090-v1`) |
| Fecha de creacion | 2026-09-03 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe los artefactos por su metodo de entrenamiento, no por su arquitectura interna. La variante `latency-aware/mikasa-intercept-grab-fast/small-policy/ppo-qwenoft-rtx3090-v1` es una politica pequeña entrenada desde cero con PPO, incorporando lo que la model card denomina "perfil temporal QwenOFT RTX 3090". La variante `zero-latency/mikasa-intercept-grab-fast/small-policy/ppo-v1` se describe como profesor PPO aceptado, acompanado de evaluacion estricta. Para la tarea de equilibrio se publica `zero-latency/humanoidbench-balance-simple/small-policy/fasttd3-v1`, un profesor FastTD3 aceptado junto con configuraciones portables de entrenamiento y evaluacion.

Las politicas VLA se publican como checkpoints de inferencia: `zero-latency/mikasa-intercept-grab-fast/vla/starvla-qwenoft-v1` corresponde a un checkpoint StarVLA QwenOFT de 5k pasos con configuracion portable, estadisticas y evaluacion de latencia cero; `zero-latency/humanoidbench-balance-simple/vla/gr00t-n1.7-10k-v1` es el bundle oficial de inferencia GR00T N1.7 de 10k pasos. No se especifican en la informacion proporcionada el numero de tokens o episodios de entrenamiento, la composicion de los datasets, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas mas alla de la propia distincion entre evaluacion `zero-latency` y `latency-aware`.

Se documentan dos revisiones de repositorios fuente historicos, que se mantienen sin cambios: revision del modelo MIKASA `38327e16f9b33cf5f827b54a606cb4c22d4dfbfc` y revision del modelo Balance `734dcedcafbcbffab7f8665d09de42a9c8416d38`.

## Capacidades

- Ejecucion de politicas de control para la tarea de manipulacion MIKASA intercept-grab-fast, con un checkpoint PPO y un checkpoint VLA.
- Ejecucion de politicas de control para la tarea de equilibrio humanoide HumanoidBench balance-simple, con un checkpoint FastTD3 y un bundle GR00T N1.7.
- Inferencia en regimen de latencia cero (`zero-latency`), segun la nomenclatura de las rutas del repositorio.
- Inferencia bajo restricciones de latencia explicitas (`latency-aware`), con un perfil temporal asociado a RTX 3090.
- Uso como profesores para destilacion o generacion de datos: las variantes PPO y FastTD3 se etiquetan como "accepted teacher".
- Evaluacion reproducible: se publican configuraciones portables, estadisticas y artefactos de evaluacion estricta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el prefijo VLA implica entrada visual y salida de acciones, pero la model card no lo detalla.

## Casos de uso

- Reproduccion de baselines en investigacion robotica: el repositorio incluye configuraciones portables de entrenamiento y evaluacion, ademas de estadisticas, lo que permite replicar los resultados de las tareas MIKASA intercept-grab-fast y HumanoidBench balance-simple sin reentrenar desde cero.
- Destilacion de profesores a politicas mas ligeras: las variantes marcadas como "accepted teacher" (PPO y FastTD3) sirven como fuente de supervision para entrenar politicas de menor coste computacional.
- Estudio de latencia de inferencia en control robotico: la distincion entre rutas `zero-latency` y `latency-aware`, junto con el perfil temporal RTX 3090, permite medir el impacto del retardo de inferencia en la tasa de exito de la tarea.
- Evaluacion comparativa RL frente a VLA: el repositorio publica, para la misma tarea (mikasa-intercept-grab-fast), una politica pequena PPO y un checkpoint VLA StarVLA QwenOFT, lo que habilita comparaciones directas entre ambos enfoques bajo las mismas condiciones.
- Despliegue en hardware de gama de consumo: la existencia de una variante entrenada con perfil temporal RTX 3090 sugiere un objetivo de ejecucion en GPU consumer, util para prototipos de laboratorio sin acceso a clústeres.
- Validacion de gates de publicacion: la omision deliberada de los artefactos de Extreme Parkour y HAIC hasta superar sus puertas de validacion documentadas ofrece un caso practico de gestion de calidad en pipelines VLA.
- Banco de pruebas para equilibrio de humanoides: el bundle GR00T N1.7 de 10k pasos permite trabajar sobre control de balance sin necesidad de disponer del pipeline de entrenamiento completo.

## Benchmarks y rendimiento

| Tarea / variante | Metrica | Resultado | Notas |
|---|---|---|---|
| mikasa-intercept-grab-fast, `small-policy/ppo-qwenoft-rtx3090-v1` | Tasa de exito final | 98,83 % (253/256) | Evaluacion independiente de 256 episodios; PPO entrenado desde cero con perfil temporal QwenOFT RTX 3090 |
| mikasa-intercept-grab-fast, `small-policy/ppo-v1` | no disponible | no disponible | Se describe como profesor PPO aceptado con evaluacion estricta, sin cifras publicadas |
| mikasa-intercept-grab-fast, `vla/starvla-qwenoft-v1` | no disponible | no disponible | Checkpoint de inferencia de 5k pasos; dispone de evaluacion de latencia cero, sin cifras publicadas |
| humanoidbench-balance-simple, `small-policy/fasttd3-v1` | no disponible | no disponible | Profesor FastTD3 aceptado, sin cifras publicadas |
| humanoidbench-balance-simple, `vla/gr00t-n1.7-10k-v1` | no disponible | no disponible | Bundle oficial GR00T N1.7 de 10k pasos, sin cifras publicadas |

No se han publicado en la informacion disponible resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, dado que se trata de artefactos de control robotico y no de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica cifras de memoria para ninguno de los cinco checkpoints.
- GPU recomendadas: no disponible, salvo la referencia explicita a una RTX 3090 en el nombre del perfil temporal `ppo-qwenoft-rtx3090-v1`, que indica que esa variante se diseno o evaluo en dicho hardware.
- Compatibilidad con GPU de consumo: no confirmada de forma general; el unico indicio es el perfil RTX 3090 mencionado para la politica pequena de MIKASA.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama, TGI ni motores equivalentes.
- Latencia y throughput estimados: no disponible. El repositorio se centra en latencia, pero no publica valores numericos de latencia ni de frecuencia de inferencia.
- Almacenamiento: el repositorio completo ocupa 291,6 GB, por lo que su descarga requiere planificar el espacio en disco con margen adicional para la descompresion.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos de terceros comparables en la informacion proporcionada. La unica comparacion posible es interna, entre las variantes del propio repositorio:

| Variante | Enfoque | Tarea | Resultado publicado | Licencia |
|---|---|---|---|---|
| `small-policy/ppo-qwenoft-rtx3090-v1` | RL (PPO) con perfil temporal RTX 3090 | mikasa-intercept-grab-fast | 98,83 % (253/256) | other |
| `small-policy/ppo-v1` | RL (PPO), profesor aceptado | mikasa-intercept-grab-fast | no disponible | other |
| `vla/starvla-qwenoft-v1` | VLA (StarVLA QwenOFT, 5k pasos) | mikasa-intercept-grab-fast | no disponible | other |
| `small-policy/fasttd3-v1` | RL (FastTD3), profesor aceptado | humanoidbench-balance-simple | no disponible | other |
| `vla/gr00t-n1.7-10k-v1` | VLA (GR00T N1.7, 10k pasos) | humanoidbench-balance-simple | no disponible | other |

Para comparaciones frente a alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- La licencia se declara como `other`, sin que la model card detalle los terminos concretos. No debe asumirse uso comercial permitido sin verificar la licencia completa en el repositorio.
- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no debe evaluarse con benchmarks de NLP.
- La model card no documenta parametros, contexto, idiomas, cuantizacion ni requisitos de memoria, lo que dificulta planificar un despliegue en produccion.
- Riesgo de alucinacion: no aplicable en el sentido habitual de modelos generativos de texto; en cambio, existe riesgo de fallo de politica en estados fuera de la distribucion de entrenamiento, no cuantificado en la informacion disponible.
- El unico resultado de rendimiento publicado (98,83 %, 253/256) corresponde a una unica tarea, una unica variante y una unica evaluacion independiente; no debe generalizarse a otras tareas ni a otras variantes del repositorio.
- Los artefactos de Extreme Parkour y HAIC no se publican, por lo que esas tareas no son reproducibles con este repositorio en su estado actual.
- El repositorio completo pesa 291,6 GB, lo que supone un coste de almacenamiento y transferencia elevado para su descarga y versionado.
- Las politicas VLA dependen de entradas visuales y de convenciones de observacion concretas; la model card remite a un registro de artefactos para los contratos de tarea y comandos de reproduccion, sin detallarlos aqui.
- Cero descargas y cero likes en el momento de redactar esta ficha: el repositorio no cuenta con validacion externa de la comunidad.
- Las revisiones de los repositorios fuente (MIKASA `38327e16...`, Balance `734dcedc...`) se mantienen sin cambios, por lo que cualquier discrepancia con versiones posteriores debe resolverse contra esas revisiones concretas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/latency-sensitive-bench/benchmark-models
- Repositorio fuente MIKASA (revision `38327e16f9b33cf5f827b54a606cb4c22d4dfbfc`): no disponible como URL en la informacion proporcionada.
- Repositorio fuente Balance (revision `734dcedcafbcbffab7f8665d09de42a9c8416d38`): no disponible como URL en la informacion proporcionada.
- Registro de artefactos del repositorio (mencionado como referencia para contratos de tarea y comandos de reproduccion): no disponible como URL.
- Referencias generales sobre el concepto de latencia recuperadas en la busqueda web, sin relacion directa con este modelo:
  - https://www.cloudflare.com/learning/performance/glossary/what-is-latency/
  - https://en.wikipedia.org/wiki/Latency_%28engineering%29
  - https://www.geeksforgeeks.org/computer-networks/what-is-latency/
  - https://www.ibm.com/think/topics/latency
  - https://www.testmyspeed.com/insights/what-is-latency
- Papers, blogs, demos o repositorios adicionales especificos del modelo: no disponibles.
