# mulligan/sim-square-narrow-r03-baseline-with-c03-rollouts-divl

## Resumen

`mulligan/sim-square-narrow-r03-baseline-with-c03-rollouts-divl` es un punto de control (checkpoint) de un agente de control para robotica entrenado sobre la tarea simulada `sim-square-narrow`, publicado por el proyecto Mulligan dentro de su organizacion de HuggingFace. No es un modelo de lenguaje: se trata de una politica de accion basada en estado (state-based), compuesta por un actor de difusion congelado mas un critico DIVL distribucional, almacenada como `policy.pt` junto con `stats.json`.

El modelo pertenece a la ronda R3 del proyecto y a la rama `baseline-with-c03-rollouts`. Se distribuye en cinco carpetas independientes, una por semilla (seed-1 a seed-5), cada una con su propio config de ejecucion, y todas ellas detenidas en el paso de entrenamiento 150001. El actor congelado procede de un checkpoint hermano de la familia, `sim-square-narrow-r03-baseline-with-c03-rollouts-idql`.

Su relevancia es metodologica dentro del campo del aprendizaje por refuerzo offline aplicado a robotica: el paquete combina un actor de difusion preentrenado con un critico distribucional DIVL, y publica tanto los datos de entrenamiento (teleoperacion, rollouts de politica base y datasets DAgger) como la evaluacion sobre una rejilla de estados iniciales reservada. El repositorio ocupa 1,4 GB, la licencia es MIT y, en la fecha de actualizacion disponible, no registraba descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de politica basado en estado: actor de difusion congelado y critico DIVL distribucional (segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de control por estado, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en punto flotante) |
| Idiomas soportados | no disponible; no aplica, es un agente de robotica sin capacidades linguisticas |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickles de PyTorch) mas `stats.json`; hashes SHA-256 en `release.json` |

## Arquitectura y entrenamiento

Segun la model card, el componente de accion es un actor de difusion heredado y congelado del checkpoint `sim-square-narrow-r03-baseline-with-c03-rollouts-idql`. Sobre esa politica congelada se entrena un critico DIVL distribucional, que es el artefacto que varia respecto al checkpoint padre. El entrenamiento se ejecuta en cinco semillas independientes (1 a 5), cada una con su propio fichero de configuracion dentro de `release/run-configs/`, y todas las corridas se registran hasta el paso 150001.

La receta de datos es incremental y acumulativa, tal y como refleja la lista de conjuntos de entrenamiento: parte de teleoperacion humana (`sim-square-narrow-c00-teleop-baseline`) y va anadiendo, ronda a ronda, rollouts de la politica base (`c01`, `c02`, `c03`) y datos de correccion humana tipo DAgger (`c01-dagger-baseline`, `c02-dagger-baseline`, `c03-dagger-baseline`). No se especifican en la informacion disponible el numero total de tokens, el numero de transiciones efectivas, la composicion exacta del dataset ni si hubo etapas adicionales de ajuste mas alla del esquema descrito.

## Capacidades

- Control de politica para la tarea simulada `sim-square-narrow` (manipulacion de un cuadrado en un entorno estrecho, segun la nomenclatura del proyecto).
- Generacion de acciones a partir de observaciones de estado, sin entrada de imagen en el checkpoint DIVL (la propia model card lo describe como `state-based agent`).
- Evaluacion reproducible sobre una rejilla de estados iniciales reservada, con resultados por semilla publicados.
- Integracion con el ecosistema Mulligan: los configs de ejecucion permiten reentrenar cada checkpoint desde el repositorio de codigo del proyecto.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio, generacion de texto ni multilingueismo. No es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por refuerzo offline: usar los cinco checkpoints como linea base comparable para medir el efecto de cambiar el critico (DIVL frente a IDQL) manteniendo el actor congelado.
- Estudio de criticos distribucionales en robotica: el checkpoint aísla la contribucion del critico DIVL, lo que permite analizar como afecta la estimacion de valor al rendimiento final de la politica.
- Benchmark interno de pipelines DAgger: los datasets `c01`-`c03` de correccion humana y rollouts de politica permiten reproducir el efecto de iteraciones sucesivas de agregacion de datos.
- Generacion de datos sinteticos de manipulacion: la politica puede lanzarse en simulacion para producir nuevos rollouts etiquetados por resultado, utiles para aumentar los datasets del propio proyecto.
- Validacion de infraestructura de simulacion: al ser una tarea estrecha (`narrow`), sirve como caso de prueba exigente para verificar entornos fisicos simulados y sus condiciones de exito.
- Analisis de robustez por semilla: disponer de cinco semillas con la misma configuracion permite estudiar varianza de rendimiento entre inicializaciones, algo poco habitual en checkpoints publicos de robotica.
- Docencia y reproduccion: el tamano contenido del repositorio (1,4 GB en total) y la licencia MIT facilitan su uso en cursos o talleres de RL aplicado a robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo. La model card si publica evaluaciones propias sobre una rejilla de estados iniciales reservada, con 32 estados por semilla:

| Semilla | Conjunto de evaluacion | Rejilla (N) | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 7566/8000 | 94,58 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 7655/8000 | 95,69 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 7526/8000 | 94,08 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 7579/8000 | 94,74 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 7632/8000 | 95,40 % |

La model card indica que los resultados por rollout estan en el dataset enlazado. No se proporcionan metricas de comparacion frente a otros agentes dentro de la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se declara el numero de parametros del actor ni del critico.
- Estimacion indirecta: el repositorio completo (cinco semillas, incluidos configs y metadatos) ocupa 1,4 GB, lo que situa cada semilla en el orden de unos cientos de megabytes. Es un dato derivado del tamano del repositorio, no una medicion declarada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del repositorio, es plausible que quepa en GPUs de consumo e incluso en CPU, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: no disponible. Los artefactos son ficheros `policy.pt` y `stats.json` pensados para cargarse con PyTorch; no se mencionan vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor de inferencia, logicamente porque no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables externos en la informacion proporcionada. Si se pueden listar los checkpoints hermanos de la misma familia, que comparten tarea y actor:

| Modelo | Tarea | Actor | Critico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r03-baseline-with-c03-rollouts-divl (este) | sim-square-narrow | difusion congelado | DIVL distribucional | MIT | HuggingFace |
| sim-square-narrow-r03-baseline-with-c03-rollouts-idql | sim-square-narrow | difusion (origen del actor congelado) | no disponible | MIT (segun la familia) | HuggingFace |
| sim-square-narrow-r03-mulligan-idql | sim-square-narrow | no disponible | no disponible | MIT (segun la familia) | HuggingFace |

No se han publicado en la informacion disponible las metricas de evaluacion de los checkpoints hermanos, por lo que no es posible establecer una comparacion cuantitativa entre ellos.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo resuelve una unica tarea simulada, `sim-square-narrow`, y no es transferible a otros entornos sin reentrenamiento.
- Solo estado: no procesa imagenes ni lenguaje; queda excluido de cualquier caso de uso de vision, texto o dialogo.
- Sin validacion en robot real reportada: todas las evaluaciones publicadas son en simulacion, sobre una rejilla de estados iniciales reservada.
- Riesgo de sobreajuste al entorno de evaluacion: la rejilla tiene 32 estados iniciales por semilla, una cobertura limitada frente a la variabilidad del mundo real.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo, y en un agente de control el concepto se traduce en sesgos de politica (por ejemplo, hacia las trayectorias de teleoperacion humana de la ronda `c00`).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de acciones poco fiable fuera de la distribucion de estados vista en entrenamiento.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no se declaran restricciones adicionales.
- Seguridad de los artefactos: la model card advierte explicitamente de que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza, ya que la deserializacion de un pickle no verificado puede ejecutar codigo arbitrario.
- Adopcion nula: cero descargas y cero likes en la fecha consultada, por lo que no existe validacion externa de la comunidad sobre estos checkpoints.
- Ausencia de parametros de despliegue: no se documentan requisitos de hardware, latencias ni recetas de inferencia, lo que dificulta llevar los checkpoints a produccion sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-with-c03-rollouts-divl
- Actor congelado de origen (IDQL): https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-with-c03-rollouts-idql
- Checkpoint hermano de la familia: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica base (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset DAgger (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de rollouts de politica base (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- Dataset DAgger (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Dataset de rollouts de politica base (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-baseline-policy-rollouts
- Dataset DAgger (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-baseline
- Dataset de rollouts de la politica Mulligan (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Pagina del proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Ficha del dataset c03-baseline-policy-rollouts en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-baseline-policy-rollouts
- Ficha del dataset c03-mulligan-policy-rollouts en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-mulligan-policy-rollouts
