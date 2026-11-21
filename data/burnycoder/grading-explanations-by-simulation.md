# BurnyCoder/grading-explanations-by-simulation

## Resumen

`BurnyCoder/grading-explanations-by-simulation` no es un modelo de lenguaje generativo al uso, sino un repositorio de artefactos cientificos publicados en Hugging Face. Contiene los materiales de un estudio sobre evaluacion automatica de explicaciones de interpretabilidad mecanicista, titulado *Grading mechanistic explanations by weights-blind simulation*, realizado por Libor "Burny" Burian y Victor Levoso en el marco de un hackathon de la comunidad mechinterp.com. El objetivo del trabajo es medir la calidad de una explicacion mecanicista de una red neuronal obligando a un agente LLM a reconstruir los pesos de una red de reemplazo a partir de esa explicacion, sin acceso a los pesos originales.

El objeto de estudio es un transformer de una sola capa entrenado para suma modular, siguiendo el trabajo de Nanda et al. (2023, arXiv:2301.05217). El agente simulador (Claude Haiku 5.5 en Claude Code o un modelo Qwen local) lee una explicacion del mecanismo interno del modelo objetivo y escribe los pesos de una red sustituta. Esa red se evalua contra el objetivo mediante divergencia KL sobre las salidas y similitud de estados ocultos con validacion cruzada.

El repositorio tiene 0,4 GB e incluye 32 ejecuciones evaluadas, los pesos de las redes de reemplazo en formato NumPy, transcripciones completas, registros de eventos y de peticiones HTTP, ademas de los modelos objetivo entrenados y estudiantes destilados. Es relevante para investigadores en interpretabilidad mecanicista porque ofrece un protocolo reproducible y datos brutos para auditar la fiabilidad de la evaluacion automatica de explicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único; contiene pesos de redes de reemplazo (transformer de una capa para suma modular) en arrays NumPy float64, junto con checkpoints de modelos objetivo y estudiantes destilados |
| Parametros totales | No disponible (depende del modelo objetivo; no se especifica en la informacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en float64 dentro de archivos `.npz`) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy, 11 arrays float64 en el layout del paper); checkpoints de los modelos objetivo y estudiantes en el repositorio `trained/` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo base entrenado con un corpus textual, sino los artefactos de un experimento de evaluacion. El modelo objetivo es un transformer de una capa que resuelve suma modular, del linaje del trabajo de Nanda et al. sobre grokking y circuitos aritmeticos. Sobre ese objetivo se construyen redes de reemplazo cuyos pesos son generados por un agente LLM a partir de una explicacion en lenguaje natural del mecanismo, sin que el agente vea nunca los pesos del objetivo. La evaluacion compara la red de reemplazo con el objetivo mediante divergencia KL sobre las salidas y similitud de estados ocultos con validacion cruzada.

El repositorio incluye ademas el objetivo retenido `T-new` (receta del paper, semilla 11, 401 checkpoints con curvas y metadatos), un modelo de referencia `planted_T0` compilado a partir de la explicacion E3 con instantaneas tras 100, 1.000 y 10.000 pasos adicionales de entrenamiento, y tres estudiantes destilados sobre los logits completos de T0 (20.000 pasos cada uno). Las ejecuciones se identifican con el patron `stage__target__explanation[-variant]__simulator__temperature__seed`, y los registros sustituyen nombres de usuario y rutas locales por `user`.

## Capacidades

- Generacion de pesos de una red de reemplazo a partir de una explicacion textual, sin acceso a los pesos del modelo objetivo (simulacion weights-blind).
- Evaluacion cuantitativa de explicaciones mecanicistas mediante divergencia KL de salidas y similitud de estados ocultos con validacion cruzada.
- Ejecucion con dos simuladores distintos: Claude Haiku 5.5 en Claude Code y un modelo Qwen local (qwen3.5-4b).
- Variantes controladas de explicacion: E0 (control), E1, E2, E3, E4, W-freq, W-alg, W-role y W-scramble, que permiten contrastar explicaciones informativas frente a explicaciones degeneradas.
- Variantes de formato y de esfuerzo del simulador: `fmt-code`, `fmt-math`, `noselftest`, `effort-high`, `effort-low`.
- Registro completo y auditable de cada ejecucion: transcripcion, flujo de eventos NDJSON comprimido y cuerpo integro de cada peticion y respuesta entre el sandbox y el modelo.
- Destilacion de estudiantes sobre los logits completos del modelo objetivo T0.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar el protocolo y los artefactos para replicar el estudio de grading por simulacion y comparar explicaciones alternativas de un mismo circuito.
- Evaluacion de agentes LLM como simuladores: los registros de peticiones y respuestas permiten analizar como distintos modelos (Claude Haiku 5.5 frente a Qwen 4B) traducen una explicacion en pesos concretos.
- Auditoria de metodologias de evaluacion automatica: los controles E0 y W-scramble sirven para medir cuanto de la puntuacion se debe a la informacion real de la explicacion y cuanto a artefactos del simulador.
- Docencia y formacion: el conjunto de transcripciones y scripts `build_weights.py` es material didactico para entender como se materializa una explicacion en una red ejecutable.
- Desarrollo de benchmarks de interpretabilidad: las metricas KL_out y HS, junto con el protocolo congelado y la preregistracion, pueden reutilizarse como base de un benchmark estandarizado.
- Estudio de robustez de evaluaciones con modelos como jueces: la comparativa entre variantes de formato y de esfuerzo aporta evidencia sobre la sensibilidad de los evaluadores LLM.

## Benchmarks y rendimiento

Resultados publicados en la model card para el objetivo T0 (una ejecucion por fila salvo donde se indique). La columna KL_out es divergencia KL de salida (menor es mejor) y HS es similitud de estados ocultos (mayor es mejor).

| Etapa | Objetivo | Explicacion | Simulador | Variante | Precision | KL_out | HS |
|---|---|---|---|---|---|---|---|
| main | T0 | E1 | claude-haiku-5-5 | – | 1.000 | 0.000105 | 0.048 |
| main | T0 | E2 | claude-haiku-5-5 | – | 1.000 | 1.2e-05 | 0.899 |
| main | T0 | E3 | claude-haiku-5-5 | – | 1.000 | 0.0229 | 0.939 |
| main | T0 | E4 | claude-haiku-5-5 | – | 0.979 | 0.0872 | 0.912 |
| controls | T0 | E0 | claude-haiku-5-5 | – | 1.000 | 0.00908 | 0.004 |
| controls | T0 | W-freq | claude-haiku-5-5 | – | 1.000 | 0.000931 | 0.055 |
| controls | T0 | W-alg | claude-haiku-5-5 | – | 1.000 | 0.0146 | 0.889 |
| controls | T0 | W-role | claude-haiku-5-5 | – | 1.000 | 0.000109 | 0.168 |
| controls | T0 | W-scramble | claude-haiku-5-5 | – | 1.000 | 0.00283 | 0.918 |
| ablations | T0 | E2 | qwen3.5-4b | – | 0.009 | 4.73 | 0.000 |
| ablations | T0 | E3 | claude-haiku-5-5 | fmt-code | 1.000 | 0.00212 | 0.918 |
| ablations | T0 | E3 | claude-haiku-5-5 | fmt-math | 1.000 | 0.000716 | 0.911 |
| ablations | T0 | E3 | claude-haiku-5-5 | noselftest | 1.000 | 0.00134 | 0.964 |
| hyper | T0 | E3 | claude-haiku-5-5 | effort-high | 1.000 | 0.00152 | 0.923 |
| hyper | T0 | E3 | claude-haiku-5-5 | effort-low | 0.562 | 1.97 | 0.922 |
| hyper | T0 | W-freq | claude-haiku-5-5 | effort-high | 1.000 | 0.00169 | 0.098 |
| hyper | T0 | W-freq | claude-haiku-5-5 | effort-low | 0.770 | 1.03 | 0.114 |

## Requisitos de hardware

- El repositorio no contiene un modelo de lenguaje desplegable; los pesos de reemplazo son arrays NumPy de float64 que se cargan con `numpy.load("weights.npz")` en CPU.
- Para reproducir las ejecuciones con el simulador local se necesita hardware capaz de servir qwen3.5-4b; no se especifican requisitos concretos de VRAM en la informacion disponible.
- Las ejecuciones con Claude Haiku 5.5 se realizan contra una API externa, por lo que el coste computacional recae en el proveedor y no en hardware local.
- No se indican opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, ni latencias o throughput estimados.

## Comparativa con modelos similares

| Aspecto | grading-explanations-by-simulation | grokking-modular-addition-runs (mismo autor) | Estudios de interpretabilidad con evaluacion LLM (generico) |
|---|---|---|---|
| Tipo de artefacto | Pesos de reemplazo, transcripciones, registros y modelos objetivo | Modelos objetivo de suma modular con grokking | Principalmente papers y codigo, sin pesos de reemplazo publicos |
| Protocolo reproducible | Si, con preregistracion y protocolo congelado | Parcial (modelos entrenados) | Variable |
| Metricas publicadas | KL_out y HS por ejecucion | No disponible en esta informacion | Variable |
| Licencia | MIT | No disponible en esta informacion | Variable |
| Numero de ejecuciones evaluadas | 32 | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generacion de texto, codigo ni tareas generales; su ambito es exclusivamente la investigacion en interpretabilidad.
- El modelo objetivo es un transformer de una capa para suma modular; los resultados no se generalizan directamente a modelos grandes ni a tareas reales.
- El estudio incluye un control E0 y una explicacion W-scramble con HS alto (0.918) y KL_out bajo (0.00283), lo que evidencia que la similitud de estados ocultos puede no discriminar explicaciones degeneradas; conviene interpretar las metricas en conjunto.
- El simulador local qwen3.5-4b obtiene resultados muy pobres en la ablacion E2 (precision 0.009, KL 4.73), por lo que la eleccion del simulador condiciona fuertemente la viabilidad del protocolo.
- La variante `effort-low` degrada la precision a 0.562 en E3 y 0.770 en W-freq, mostrando sensibilidad al presupuesto de razonamiento del agente.
- Los registros sustituyen nombres de usuario y rutas locales por `user`, pero contienen el cuerpo integro de peticiones y respuestas; revisar antes de redistribuir.
- La licencia MIT permite uso comercial del codigo y artefactos, pero no se especifican condiciones adicionales sobre los datos de las transcripciones.
- No hay informacion sobre sesgos, idiomas ni alucinacion porque el artefacto no es un modelo generativo desplegable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BurnyCoder/grading-explanations-by-simulation
- Modelos objetivo: https://huggingface.co/BurnyCoder/grokking-modular-addition-runs
- Codigo, paper y preregistracion: https://github.com/BurnyCoder/verifiable-mechanistic-interpretability-by-grading-explanations-using-simulations
- Paper de referencia (Nanda et al. 2023): https://arxiv.org/abs/2301.05217
- Comunidad mechinterp.com: https://mechinterp.com/
- Perfil de Victor Levoso en Google Scholar: https://scholar.google.com/citations?user=BBGcEigAAAAJ&hl=en
- Discusion en Lesswrong sobre evaluaciones con modelos como jueces: http://go/v1/Ac6h-PTF49HpawGx8AGvwJXanZdNQ8cKn8o0pCRxgmRy8AwlPwnKQO3CT4IygEIAQE6uEbTOtXF7UKm5U4ImCSEON0nuCJcP3bwYOkX7nEHUB5ca7C5on8Gw1pMOc-qGblHqNKivovKX1KGn-E9GZVSY7XVRxF9efl8F3WBk7MgAy3WLv73L-EQSdejf0k4nRYfGoWiYr-ZtMU0AgWqLpplJl-8iR9yEX_ubOPeqJz3Jx-x3lLt-ywssf18zPkL21SED7Ybn_JXyMokRFDKoksAlyjRjkV2bDg
