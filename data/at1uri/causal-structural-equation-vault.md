# At1uri/causal-structural-equation-vault

## Resumen

`At1uri/causal-structural-equation-vault` no es un modelo de lenguaje neuronal, sino un repositorio de investigacion criptografico publicado en Hugging Face que contiene implementaciones en Python de algoritmos fundamentales de inferencia causal estructural. Concretamente, incluye un motor de d-separacion sobre DAGs, un identificador de conjuntos de ajuste por criterio backdoor, un solver de ecuaciones estructurales (SCM) con cirugia de grafo para intervenciones y contrafactuales, y un evaluador de efectos de tratamiento (ATE) con ajuste OLS. El autor es Ramprasad Atluri (usuario `At1uri`) y la licencia es MIT.

El repositorio se organiza en torno a la jerarquia causal de Pearl (asociacion, intervencion y contrafactual) y proporciona codigo ejecutable acompanado de un manifiesto de integridad SHA-256 (`MANIFEST.json`) y una suite de verificacion (`eval_causal_invariance.py`). Su relevancia radica en que ofrece implementaciones de referencia verificables para tareas de inferencia causal que habitualmente se dispersan en librerias de mayor tamano, con resultados de benchmark publicados por el autor (resolucion de la paradoja de Simpson, consistencia contrafactual).

No dispone de parametros, pesos, tokenizador ni arquitectura de red neuronal; es codigo fuente Python. Por tanto, no es desplegable como modelo generativo y su evaluacion debe hacerse en terminos de correccion algoritmica, no de benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de codigo Python (no es un modelo neuronal); modulos de grafos causales, SCM y estimadores de efectos |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (documentacion en ingles; el codigo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (codigo fuente Python y `MANIFEST.json`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio implementa tres componentes principales. `src/causal_dag.py` contiene la representacion de grafos aciclicos dirigidos (DAG), el motor de d-separacion (bloqueo de cadenas y forks, desbloqueo de colisionadores) y la identificacion de conjuntos backdoor. `src/scm_engine.py` implementa un solver topologico de SCM con cirugia de grafo para intervenciones `do(X=x)` y resolucion de contrafactuales mediante abduccion-accion-prediccion. `src/treatment_effects.py` calcula el ATE mediante cirugia de grafo y ajuste backdoor por minimos cuadrados ordinarios (OLS).

No existe entrenamiento en el sentido de machine learning: no hay dataset de preentrenamiento, tokens, RLHF ni DPO. La "verificacion" consiste en una suite de tests (`benchmarks/eval_causal_invariance.py`) que comprueba propiedades matematicas: d-separacion en uniones de grafos, recuperacion del ATE verdadero en presencia de paradoja de Simpson y consistencia del axioma contrafactual `Y_{X=x_obs}(u) = y_obs`. La innovacion tecnica destacable es el empaquetado de estos algoritmos con un manifiesto criptografico de integridad SHA-256, orientado a reproducibilidad de investigacion.

## Capacidades

- Representacion de DAGs y calculo de d-separacion condicional entre variables.
- Identificacion de conjuntos de ajuste que satisfacen el criterio backdoor para un par tratamiento-resultado.
- Estimacion de distribuciones interventivas `P(Y | do(X=x))` mediante la formula de ajuste backdoor.
- Cirugia de grafo sobre SCM para simular intervenciones.
- Resolucion de contrafactuales en tres pasos (abduccion, accion, prediccion).
- Calculo de ATE con ajuste OLS sobre variables de confusión.
- Suite de verificacion de invariancia causal (d-separacion, paradoja de Simpson, consistencia).
- No soporta tool calling, agentes, razonamiento en lenguaje natural, vision ni audio.

## Casos de uso

- Docencia de inferencia causal: el repositorio sirve como material ejecutable para ilustrar la jerarquia de Pearl con ejemplos de salario y educacion, permitiendo al alumnado ejecutar `do-calculus` y comparar con asociacion observacional.
- Analisis de experimentos observacionales: dado un DAG definido por el analista, el modulo backdoor identifica que covariables ajustar antes de estimar el efecto de un tratamiento, evitando ajustar por colisionadores o mediadores.
- Deteccion de paradoja de Simpson en datos de negocio: la suite de verificacion reproduce el caso en que la pendiente observacional (-0.6406) difiere del ATE verdadero (+0.8517), util para auditar analisis internos.
- Analisis contrafactual de politicas: el solver SCM permite responder preguntas del tipo "que habria ocurrido si un individuo hubiera recibido otro tratamiento", usando el modelo estructural ajustado.
- Validacion de pipelines causales en produccion: el manifiesto SHA-256 y los tests permiten verificar que las implementaciones no han sido alteradas en un entorno de CI.
- Investigacion metodologica: base para prototipar y comparar estimadores de efectos causales antes de portarlos a librerias como DoWhy o causallearn.

## Benchmarks y rendimiento

El autor publica resultados de la suite de verificacion en la model card:

| Prueba | Resultado reportado |
|---|---|
| d-Separation junctions | Bloquea correctamente cadenas y forks; desbloquea colisionadores |
| Simpson's Paradox resolution | ATE verdadero +0.8517 recuperado frente a pendiente observacional -0.6406 |
| Counterfactual consistency axiom | `Y_{X=x_obs}(u) = y_obs` con error 0.00 x 10^0 (precision de maquina) |

No se han publicado resultados de benchmarks de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a este repositorio.

## Requisitos de hardware

- No requiere GPU: es codigo Python puro orientado a CPU.
- VRAM estimada: 0 GB.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo con Python 3 y dependencias cientificas estandar (numpy, scipy, segun el codigo; no detalladas en la model card).
- Despliegue: ejecucion directa con `python benchmarks/eval_causal_invariance.py`; no soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del tamano del DAG y del numero de muestras.

## Comparativa con modelos similares

| Herramienta | Tipo | Funcionalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| At1uri/causal-structural-equation-vault | Repositorio Python | d-separacion, backdoor, SCM, contrafactuales, ATE | MIT | Hugging Face |
| DoWhy (Microsoft) | Libreria Python | Identificacion causal, estimacion, refutacion | MIT | PyPI/GitHub |
| causallearn | Libreria Python | Descubrimiento causal, d-separacion | MIT | PyPI/GitHub |
| pgmpy | Libreria Python | Redes bayesianas, inferencia, d-separacion | MIT | PyPI/GitHub |

Frente a estas alternativas, el repositorio de At1uri es mucho mas reducido en alcance y superficie de API, pero incorpora un manifiesto criptografico de integridad y una suite de verificacion reproducible que no es habitual en las librerias mayores.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas en lenguaje natural ni procesa documentos.
- Cero descargas y cero likes en el momento de la consulta; sin evidencia de uso o validacion por terceros.
- La correccion de los resultados depende de que el DAG y el SCM especificados por el usuario sean correctos; el repositorio no aprende la estructura causal a partir de datos.
- El ajuste backdoor por OLS asume linealidad y ausencia de variables de confusión no observadas; no cubre identificacion con variables instrumentales ni front-door en la informacion disponible.
- Documentacion unicamente en ingles; no hay soporte multilingue declarado.
- Licencia MIT permite uso comercial, pero al ser codigo de investigacion sin mantenimiento declarado, conviene auditar y fijar version antes de integrarlo en produccion.
- No se especifican dependencias, version de Python ni cobertura de tests mas alla de los tres resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/At1uri/causal-structural-equation-vault
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este repositorio.
