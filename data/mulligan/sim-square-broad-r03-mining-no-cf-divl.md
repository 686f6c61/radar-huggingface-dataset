# mulligan/sim-square-broad-r03-mining-no-cf-divl

## Resumen

`mulligan/sim-square-broad-r03-mining-no-cf-divl` es un agente de control para robótica (no un modelo de lenguaje) publicado por el usuario mulligan dentro del proyecto Mulligan. Se trata de un checkpoint de aprendizaje por refuerzo para la tarea simulada `sim-square-broad`, correspondiente a la ronda R3 y al brazo o variante experimental `mining-no-cf`, entrenado hasta el paso 250001. El modelo combina un actor de difusión congelado, heredado del checkpoint `sim-square-broad-r03-mining-no-cf-idql`, con un crítico DIVL de tipo distribucional; los pesos se distribuyen como ficheros `policy.pt` acompañados de `stats.json`.

El repositorio contiene cinco carpetas, una por semilla (1 a 5), con 1,4 GB de tamano total, y se publica bajo licencia MIT. La evaluacion incluida en la model card reporta tasas de exito de entre el 84,6 % y el 87,3 % sobre una rejilla de estados iniciales retenida, con 30000 rollouts por semilla.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para investigacion en aprendizaje por refuerzo con politicas de difusion y criticos distribucionales, como punto de comparacion dentro del ecosistema Mulligan/Policy Arena y como base para experimentos de destilacion, DAgger y transferencia sim-a-real en manipulacion robotica. No genera texto, no procesa lenguaje natural y no dispone de ventana de contexto, tool calling ni capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (politica de difusion) congelado, heredado de `sim-square-broad-r03-mining-no-cf-idql`, mas critico DIVL distribucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (agente state-based, sin contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`, pickle de PyTorch) mas `stats.json`; un directorio por semilla |

Otros datos tecnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Tarea | `sim-square-broad` |
| Ronda del modelo | R3 |
| Brazo experimental | mining-no-cf |
| Celda de campana | `sq_d1_r3_ours_mining_nocf_human_only` |
| Semillas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Actor congelado procedente de | `mulligan/sim-square-broad-r03-mining-no-cf-idql` |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un agente basado en estado cuyo actor es una politica de difusion congelada (frozen diffusion actor) procedente del checkpoint padre `sim-square-broad-r03-mining-no-cf-idql`, combinada con un critico DIVL de tipo distribucional. La informacion disponible no detalla el numero de parametros, el numero de capas, el espacio de observacion ni el espacio de acciones, ni la arquitectura concreta del critico mas alla de su naturaleza distribucional.

El entrenamiento consta de 250001 pasos por semilla y se apoya en siete conjuntos de datos del proyecto Mulligan: teleoperacion (`sim-square-broad-c00-teleop-sobol`), datos DAgger de varias campanas (`c01`, `c02` y `c03` con `dagger-mining-no-cf`) y rollouts de politica (`c01-sobol-policy-rollouts`, `c02-mulligan-policy-rollouts` y `c03-mulligan-policy-rollouts`). No se especifican en la informacion proporcionada el numero total de transiciones, la composicion exacta del dataset, ni el uso de RLHF o DPO (tecnicas, por otra parte, propias del ajuste de modelos de lenguaje y no aplicables aqui). La model card indica que los ficheros `.pt` son pickles de PyTorch y que el SHA-256 de cada fichero se registra en `release.json`, ademas de remitir al repositorio de codigo de Mulligan para las configuraciones de ejecucion y las recetas de reentrenamiento.

## Capacidades

- Control robotico en simulacion para la tarea `sim-square-broad`, a partir de observaciones basadas en estado (no en imagen ni en lenguaje).
- Generacion de acciones mediante una politica de difusion, tipicamente utilizada para modelar distribuciones multimodales de acciones.
- Estimacion de valor mediante un critico DIVL distribucional, orientado al entrenamiento con aprendizaje por refuerzo offline o con datos mixtos.
- Aprendizaje a partir de datos heterogeneos: teleoperacion, datos DAgger (intervenciones de experto sobre rollouts de politica) y rollouts de la propia politica.
- Evaluacion reproducible sobre una rejilla de estados iniciales retenida, con resultados por semilla publicados.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada; las entradas son de tipo estado, no perceptivas de texto ni audio.

## Casos de uso

- Linea base de comparacion en investigacion de RL: el checkpoint permite medir el efecto de sustituir un critico IDQL por un critico DIVL bajo el mismo actor congelado, ya que existe un modelo hermano (`sim-square-broad-r03-mining-no-cf-idql`) con el que se puede emparejar el resto de variables.
- Recogida de datos DAgger: al disponer de una politica con tasa de exito en torno al 86 % medio, se puede usar como generador de rollouts que un experto corrija, alimentando nuevas rondas de entrenamiento del mismo ecosistema de datos.
- Destilacion a una politica mas ligera: la politica de difusion puede emplearse como profesor para entrenar estudiantes mas rapidos o mas pequenos que consuman menos recursos de inferencia.
- Reproducibilidad de resultados: permite reentrenar o auditar los resultados publicados gracias a las semillas 1 a 5, las configuraciones de ejecucion referenciadas y los hashes SHA-256 en `release.json`.
- Evaluacion estandarizada en Policy Arena: util para situar este brazo experimental frente a otras rondas y variantes del proyecto Mulligan en la misma tarea simulada.
- Estudio de estabilidad entre semillas: los cinco checkpoints permiten cuantificar la varianza de rendimiento (de 84,6 % a 87,3 % de exito en la evaluacion publicada) y analizar su impacto en decisiones de seleccion de modelo.
- Pruebas de transferencia sim-a-real de politicas de difusion: el agente puede servir como punto de partida para experimentos de robustez ante cambios de dinamica, aunque la informacion disponible no documenta validacion en hardware real.
- Ablaciones sobre el uso de intervenciones humanas: la variante se enmarca en una campana etiquetada como `human_only`, lo que facilita comparar configuraciones de datos con y sin correcciones humanas.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre una rejilla de estados iniciales retenida, con los resultados por semilla en el conjunto de datos `sim-square-broad-r00-r03-eval`. Los valores se reproducen tal cual figuran en la informacion proporcionada.

| Dataset | Carpeta | N | Exitos | Tasa de exito |
|---|---|---|---|---|
| sim-square-broad-r00-r03-eval | `seed-1` | 32 | 26194/30000 | 87,31 % |
| sim-square-broad-r00-r03-eval | `seed-2` | 32 | 26110/30000 | 87,03 % |
| sim-square-broad-r00-r03-eval | `seed-3` | 32 | 25564/30000 | 85,21 % |
| sim-square-broad-r00-r03-eval | `seed-4` | 32 | 25392/30000 | 84,64 % |
| sim-square-broad-r00-r03-eval | `seed-5` | 32 | 25772/30000 | 85,91 % |
| Media de las cinco semillas | - | - | 129032/150000 | 86,02 % |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, y no serian aplicables a este tipo de modelo. Tampoco se documentan comparaciones numericas contra otros agentes fuera del propio proyecto Mulligan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El unico dato de tamano es el repositorio completo (1,4 GB para cinco semillas, es decir, aproximadamente 280 MB por semilla incluyendo pesos y `stats.json`); se trata de una cifra orientativa del paquete distribuido, no de memoria de GPU requerida.
- GPU recomendadas: no disponibles. Dado que el agente opera sobre observaciones de estado y el paquete de pesos es de centenares de megabytes por semilla, es razonable esperar que quepa en GPU de consumo, pero la informacion proporcionada no lo confirma ni especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este agente). El formato es PyTorch (`policy.pt`), por lo que el despliegue se realizaria cargando el checkpoint con PyTorch en un entorno de confianza.
- Latencia y throughput estimados: no disponibles.
- Advertencia de seguridad en la carga: la propia model card indica que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en entornos de confianza.

## Comparativa con modelos similares

No se han encontrado en la busqueda web alternativas comparables fuera del propio proyecto Mulligan. La comparacion mas razonable es con los checkpoints hermanos de la misma campana.

| Modelo | Tarea | Ronda | Componente diferenciador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-broad-r03-mining-no-cf-divl (este) | sim-square-broad | R3 | Actor de difusion congelado + critico DIVL distribucional | MIT | HuggingFace, 1,4 GB, 5 semillas |
| sim-square-broad-r03-mining-no-cf-idql | sim-square-broad | R3 | Actor de difusion congelado del que deriva este modelo (critico IDQL) | MIT | HuggingFace |
| sim-square-broad-r02-mining-no-cf-divl | sim-square-broad | R2 | Ronda anterior de la misma variante DIVL | MIT | HuggingFace |
| sim-square-broad-r01-mining-no-cf-idql | sim-square-broad | R1 | Ronda inicial de la variante IDQL | MIT | HuggingFace |

Los resultados de busqueda tambien devolvieron paginas sobre modelos sin relacion con este agente (Jev de TypeSafe AI, un modelo propietario que no genera lenguaje natural, y el catalogo de modelos de SiMa.ai), que no constituyen alternativas comparables para la tarea `sim-square-broad`.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts, no soporta tool calling ni razonamiento multi-paso en lenguaje.
- Especificidad de tarea: el agente esta entrenado exclusivamente para `sim-square-broad`; no se documenta generalizacion a otras tareas, entornos o morfologias.
- Entradas basadas en estado: no se declaran capacidades de vision ni de procesamiento de imagenes, audio u otros modalidades.
- Varianza entre semillas: la tasa de exito publicada oscila entre el 84,64 % y el 87,31 %, una dispersion de casi tres puntos porcentuales que conviene tener en cuenta al seleccionar un checkpoint concreto.
- Interpretacion de la evaluacion: la tabla de la model card indica N=32 y, a la vez, recuentos sobre 30000 episodios; la informacion disponible no aclara la relacion exacta entre ambos valores, por lo que la tasa de exito debe tomarse como el cociente reportado por el autor.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos generativos de lenguaje; en cambio, existe riesgo de fallo silencioso en la ejecucion de la politica sin senal de incertidumbre calibrada publicada.
- Brecha sim-a-real: no se documenta validacion en robot fisico, por lo que el rendimiento en el mundo real es desconocido.
- Licencia MIT: permite uso comercial y modificacion, pero la model card no ofrece garantias; se recomienda conservar el aviso de licencia y la atribucion.
- Seguridad de carga: los ficheros `policy.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse; deben cargarse solo en entornos de confianza y verificando los hashes SHA-256 de `release.json`.
- Idiomas y sesgos: no disponibles, dado que el modelo no procesa lenguaje natural.
- Reproducibilidad dependiente del codigo: las recetas de reentrenamiento y las configuraciones de ejecucion residen en el repositorio de codigo de Mulligan, no en el repositorio de HuggingFace, por lo que la reproduccion completa depende de ese acceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-mining-no-cf-divl
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Checkpoint padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r03-mining-no-cf-idql
- Variante de la ronda anterior (DIVL): https://huggingface.co/mulligan/sim-square-broad-r02-mining-no-cf-divl
- Variante de la ronda inicial (IDQL): https://huggingface.co/mulligan/sim-square-broad-r01-mining-no-cf-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mining-no-cf
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mining-no-cf
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Dataset DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-dagger-mining-no-cf
- Dataset de rollouts c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-mulligan-policy-rollouts
