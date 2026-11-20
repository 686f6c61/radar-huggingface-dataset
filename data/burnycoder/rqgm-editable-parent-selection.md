# BurnyCoder/rqgm-editable-parent-selection

## Resumen

`BurnyCoder/rqgm-editable-parent-selection` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos asociado a un estudio de investigacion sobre seleccion editable de padres en la Red Queen Gödel Machine (RQGM). El autor, BurnyCoder, publica aqui los espacios de trabajo evolucionados, resultados y material de reproduccion de un experimento que extiende RQGM, un marco evolutivo de auto-mejora recursiva bajo utilidades no estacionarias, con la seleccion editable de padres de expansion descrita en el apendice E.5 de *HyperAgents*. El sistema evoluciona programas ejecutables de escritura, revision, edicion y seleccion de padres alrededor de un modelo Qwen3.5-4B congelado, usando decisiones humanas de aceptacion/rechazo como ancla del revisor.

El problema que aborda es metodologico: comprobar si reescribir la regla de eleccion de padre puede producir revisores de articulos mejores que el muestreo Thompson nativo por subarbol de RQGM. La metrica de resultado es la diferencia pareada en precision de decision sobre un conjunto de test sellado. El repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y fue creado y actualizado el 20 de noviembre de 2026, lo que sugiere que se trata de un artefacto de investigacion reciente, no de un modelo distribuible para uso general.

Es relevante para investigadores en auto-mejora recursiva, busqueda evolutiva y evaluacion de agentes, pero no debe confundirse con un modelo base utilizable: el modelo subyacente es Qwen3.5-4B, y este repositorio contiene el harness experimental y los resultados del estudio, no pesos nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo propio; el estudio se ejecuta sobre un Qwen3.5-4B congelado y evoluciona programas ejecutables (escritor, revisor, editor, selector de padres) |
| Parametros totales | No disponible (el modelo base Qwen3.5-4B no se detalla en la informacion proporcionada) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el harness usa Ollama con un digest local registrado del modelo) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio contiene artefactos de estudio (informes, resultados, espacios de trabajo evolucionados), no pesos en safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-4B |
| Libreria | rqgm-parent-study |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El repositorio no entrena un transformer nuevo. Implementa un marco evolutivo sobre OpenRQGM que mantiene un arbol genealogico de programas de escritura y revision de articulos. El programa valido mas reciente ejecuta una regla que elige una version sobre la que construir (el padre de expansion), posiblemente el mismo; su editor crea un hijo y puede reescribir la regla del hijo para elegir el siguiente padre. El revisor que juzga los borradores permanece fijo dentro de cada epoca de busqueda y puede cambiar en un checkpoint segun su acuerdo con decisiones humanas, lo que constituye la naturaleza no estacionaria del estandar.

El diseno experimental incluye un piloto que compara cuatro brazos de busqueda (editable, Thompson nativo, uniforme fijo y la regla artesanal publicada de HyperAgents) sobre una semilla, una comparacion confirmatoria que empareja ocho semillas editables/nativas con dos controles adicionales en las cinco primeras, una intervencion de mecanismo con intercambio de estado en el punto medio editable, y una replicacion de formula que compara la penalizacion de hijos publicada frente a la del paper sobre evidencia archivada identica. La reproducibilidad se apoya en Python 3.12, uv, Ollama con el digest del modelo local registrado y Ubuntu WSL con bubblewrap.

## Capacidades

- Evolucion de programas ejecutables de escritura, revision, edicion y seleccion de padres alrededor de un modelo base congelado.
- Seleccion editable de padres de expansion: el hijo puede reescribir su propia regla de eleccion del siguiente padre.
- Revision no estacionaria: el juez de borradores puede sustituirse en checkpoints segun su acuerdo con decisiones humanas.
- Anclaje humano: las decisiones de aceptacion/rechazo de personas sirven como evidencia que sobrevive a los cambios de revisor.
- Comparacion controlada de brazos de busqueda: editable, Thompson nativo, uniforme fijo y regla artesanal de HyperAgents.
- Intervencion de mecanismo mediante intercambio de estado en el punto medio para medir el efecto continuado del selector aprendido.
- Replicacion de formula sobre evidencia archivada con la misma extraccion aleatoria.
- Regeneracion de tablas agregadas y del paper procedimental a partir de resultados rastreados.
- CLI unico de estudio con comandos `prepare`, `selftest`, `campaign`, `report` y `serve`, con reanudacion de campana.

## Casos de uso

- Investigacion en auto-mejora recursiva: el harness permite reproducir el experimento de seleccion editable de padres de RQGM y comparar la precision de decision frente al muestreo Thompson nativo, con semillas emparejadas y test sellado.
- Evaluacion de agentes revisores de articulos: el sistema evoluciona revisores anclados a decisiones humanas, lo que sirve para estudiar como cambia la calidad de revision al variar el criterio del juez en checkpoints.
- Estudio de no estacionariedad en busqueda evolutiva: la sustitucion del revisor por acuerdo con humanos permite medir el impacto de estandares cambiantes sobre la evidencia acumulada.
- Replicacion de resultados de HyperAgents: la replicacion de formula compara la penalizacion de hijos publicada frente a la del paper sobre la misma evidencia archivada, util para auditoria metodologica.
- Desarrollo de harness reproducibles: el CLI y la separacion entre entradas privadas, trazas de inferencia y credenciales sirven de plantilla para campanas experimentales con reanudacion y preflight de GPU.
- Auditoria de sesgos de evaluacion: el diseno con test sellado, intervalos de incertidumbre que remuestrean semillas de busqueda y papers de test compartidos permite estudiar fuga de informacion y solapamiento entre splits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La comparacion editable-nativo sellada esta pendiente y no se han registrado predicciones de endpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base Qwen3.5-4B y de la cuantizacion elegida, no especificada en la informacion.
- GPU recomendadas: no disponibles; el harness hace preflight de residencia en GPU antes de lanzar la campana.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: Ollama con el digest del modelo local registrado; el estudio se ejecuta en Ubuntu WSL con bubblewrap (Linux puede invocar bubblewrap directamente).
- Latencia y throughput: no disponibles; el presupuesto confirmatorio (64, 128 o 256 pasos) se elige a partir del tiempo medido en el piloto, pero no se publican cifras.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rqgm-editable-parent-selection (este repositorio) | No disponible (base Qwen3.5-4B) | No disponible | Estudio evolutivo sobre RQGM con seleccion editable de padres | No disponible | Repositorio HF con 0 descargas |
| RQGM nativo (Thompson por subarbol) | No disponible | No disponible | Brazo de control del mismo estudio | No disponible | Referencia en arXiv 2606.26294 |
| HyperAgents (regla artesanal) | No disponible | No disponible | Brazo de control con regla publicada | No disponible | Referencia en arXiv 2603.19461 |
| OpenRQGM | No disponible | No disponible | Implementacion upstream del marco | No disponible | Repositorio GitHub |

No se dispone de datos de rendimiento comparables entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje distribuible: el repositorio contiene artefactos de estudio y espacios de trabajo evolucionados, no pesos entrenados.
- La comparacion principal editable-nativo esta pendiente; no hay resultados sellados ni predicciones de endpoints registradas.
- El piloto se ejecuta sobre una sola semilla, lo que limita la potencia estadistica de las conclusiones preliminares.
- Cambiar de revisor invalida mediciones previas dependientes del revisor; solo la evidencia anclada a humanos se preserva, lo que restringe la comparabilidad entre epocas.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial ni la redistribucion.
- Los idiomas soportados no estan disponibles; el estudio se centra en evaluacion de articulos y no documenta cobertura multilingue.
- El modelo base Qwen3.5-4B no se detalla en la informacion proporcionada (parametros, contexto, cuantizaciones), lo que impide estimar requisitos de hardware.
- Riesgo de sesgo en las decisiones humanas de aceptacion/rechazo que anclan al revisor: el criterio humano puede introducir sesgos sistematicos en la evolucion.
- Las entradas privadas, trazas completas de inferencia y credenciales de entorno quedan fuera del control de versiones, lo que puede dificultar la reproduccion exacta por terceros.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso independiente ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BurnyCoder/rqgm-editable-parent-selection
- Resultados en vivo y publicados: https://burnycoder.github.io/red-queen-godel-machine-with-evolvable-parent-selection/
- Paper RQGM: https://arxiv.org/abs/2606.26294v3
- RQGM Algorithm 1 (HTML): https://arxiv.org/html/2606.26294v3#A2.SS4
- HyperAgents Appendix E.5: https://arxiv.org/pdf/2603.19461v2#page=60
- HyperAgents Algorithm 5: https://arxiv.org/pdf/2603.19461v2#page=61
- OpenRQGM (GitHub): https://github.com/DreamFallenFlowers/OpenRQGM/tree/feecb32d9fbdd1c60749ade9ecb47f971e12666e
- Preregistration: reports/preregistration.md
- Progreso del estudio: reports/progress.md
- Matriz exacta de ejecuciones: reports/planned-runs.md
- Revision de literatura: reports/literature-review.md
- Auditoria de fuentes y formulas: reports/state-of-the-art-review.md
- Plan: reports/plan.md
- Huellas de splits: results/split-manifest.json
- Documentacion de uso: docs/usage.md
- Revision metodologica: reports/reviews/methods.md
- Resultados de ingenieria: results/engineering.json
- Enmiendas prospectivas: reports/amendments.md
