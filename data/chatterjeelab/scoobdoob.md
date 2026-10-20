# ChatterjeeLab/ScooBDoob

## Resumen

ScooBDoob es un repositorio de codigo Python publicado por el laboratorio ChatterjeeLab en HuggingFace. No se trata de un modelo de lenguaje: la model card describe un paquete cientifico (`scoobdoob/`) con funciones de *conditioning*, construccion de modelos de estados de Markov (MSM) y analisis, acompanado de scripts de figura para articulo (`make_*.py`, `paper_figures/`), analisis de sensibilidad (`analysis/`) y comprobaciones de correctitud numerica (`tests/`). El repositorio no contiene pesos, no declara pipeline y ocupa 0,0 GB.

El contenido del README indica que el paquete da soporte a tres estudios concretos: comparativas de muestreo sobre el potencial de Muller-Brown (12 trayectorias de Langevin sobreamortiguado de 250.000 pasos, con paso temporal 0,0002 y temperatura inversa 0,06), robustez de muestreo sobre el peptido Aib9 (trayectoria de aproximadamente 223 ns a 500 K con paso de 2 fs, registrando nueve angulos phi/psi con PLUMED) y analisis de descubrimiento y preferencia de docking para p53 Y220C. El nombre del paquete sugiere una relacion con el *conditioning* de Doob para procesos estocasticos, aunque el README no lo explicita.

Su relevancia es por tanto la de un artefacto de reproducibilidad computacional en quimica teorica y biofisica, no la de un modelo generativo evaluable con benchmarks de lenguaje. Cualquier evaluacion de capacidades, contexto o cuantizacion carece de sentido aqui; lo que se puede evaluar es la calidad del codigo, la disponibilidad de datos y la claridad de la licencia, y en los tres casos la informacion disponible es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de aprendizaje automatico; es un paquete de codigo Python para MSM y analisis de trayectorias) |
| Parametros totales | no disponible (no se declara ningun recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un paquete de analisis) |
| Tipos de cuantizacion | no disponible (el repositorio no contiene pesos ni artefactos cuantizables) |
| Idiomas soportados | no disponible (el codigo y la documentacion estan en ingles) |
| Licencia | no disponible (la model card no indica licencia) |
| Formato de pesos | no disponible (el repositorio no distribuye pesos) |
| Tipo de artefacto | repositorio de codigo fuente y resultados numericos |
| Version de Python requerida | 3.10 o superior |
| Dependencias | `requirements.txt` (contenido no disponible) |
| Suite de pruebas | `pytest tests -q` (comprobaciones de correctitud numerica) |
| Tamano del repositorio | 0,0 GB |
| Datos incluidos | resultados numericos pequenos y puntuaciones de docking; trayectorias MD no distribuidas |
| Entradas externas requeridas | listadas en `INPUTS.tsv` (contenido no disponible) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fechas | creado 2026-07-31, actualizado 2026-10-20 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal que describir. La "arquitectura" del artefacto es la de un paquete Python organizado en modulos: `scoobdoob/` agrupa las funciones de *conditioning*, construccion de MSM y analisis; los scripts de nivel superior (`make_mb_panels.py`, `make_mb_unconditional.py`, `make_aib9_method_figure.py`, `validate_aib9.py`, `aib9_kappa_sweep.py`, `trajectory_cv_tilt.py`, `summarize_trajectory_cv_tilt.py`) implementan las figuras y validaciones del articulo; `analysis/mb_floor_sensitivity/` contiene el barrido de sensibilidad del suelo de densidad; `data/` guarda resultados numericos ya calculados y `tests/` verifica su correctitud.

El flujo de datos previsto es: (1) generar o preparar trayectorias de dinamica molecular, (2) construir un MSM sobre caracteristicas derivadas, (3) analizar poblaciones, sensibilidades y preferencias de docking. Para Muller-Brown se incluye un generador propio de trayectorias (`python -m scoobdoob.validation.mb_data`) con los parametros del articulo. Para Aib9 se delega en un workflow externo de OpenMM publicado por Mehdi et al. (2022) y se cargan ficheros `COLVAR_phi` y `COLVAR_psi` con tiempo mas nueve angulos, tomando una de cada cinco muestras para obtener espaciado de 1 ps. Para p53 Y220C los resultados numericos acompanan al repositorio, pero los reajustes de MSM requieren ficheros de caracteristicas y observables de bolsillo que no se distribuyen.

## Capacidades

- Construccion y analisis de modelos de estados de Markov a partir de trayectorias de dinamica molecular.
- Funciones de *conditioning* sobre trayectorias (el README no detalla la formulacion; el nombre del paquete apunta a *conditioning* de Doob, sin confirmacion explicita).
- Generacion de trayectorias de Langevin sobreamortiguado para el potencial de Muller-Brown con los parametros del articulo (12 replicas, 250.000 pasos, dt 0,0002, temperatura inversa 0,06, guardado cada 5 pasos).
- Carga y submuestreo de series temporales de angulos diedros procedentes de PLUMED (formato `COLVAR`, tiempo mas nueve angulos).
- Analisis de robustez y barridos de parametros sobre Aib9 (`validate_aib9.py --robustness`, `aib9_kappa_sweep.py`).
- Analisis de sensibilidad del suelo de densidad en MSM, con semillas 0 a 19 y paso de validacion de modelo finito (`--validate`).
- Analisis de descubrimiento y preferencia de docking para p53 Y220C (`paper_figures/data/`, `paper_figures/plot/`).
- Validacion cruzada reteniendo trayectorias completas, con `k` en {75, 100, 150} y semillas en {0, 1, 2}, y umbrales por observable: `site_drug`/0,5, `site_volume`/300,865, `site_apolar`/55,551.
- Regeneracion de todas las figuras del articulo desde resultados en cache (`run_cached_figures.py`, con filtros `--only mb`, `--only aib9_robustness`, `--only p53`).
- Comprobaciones de correctitud numerica automatizadas mediante `pytest`.
- No soporta generacion de texto, vision, audio, tool calling ni razonamiento en el sentido de un LLM.

## Casos de uso

- Reproduccion de figuras sin re-simular: `run_cached_figures.py` regenera los paneles de Muller-Brown, la comparativa de metodos de Aib9 y los graficos de p53 a partir de los resultados numericos incluidos, lo que permite verificar las conclusiones del articulo en minutos y sin coste de computo de dinamica molecular.
- Auditoria de sensibilidad de un MSM: el barrido `analysis/mb_floor_sensitivity/analyze.py --seed N` para semillas 0 a 19, seguido de `--summarize`, permite comprobar si las conclusiones sobre el potencial de Muller-Brown dependen del suelo de densidad impuesto, un control habitual en revision por pares.
- Validacion de una implementacion propia de MSM: la suite `pytest tests -q` sirve como referencia de correctitud numerica para quien reimplemente la construccion de MSM o las funciones de *conditioning* en otro lenguaje.
- Preparacion de un estudio de Aib9: el README documenta la ruta completa (workflow OpenMM externo de Mehdi et al., 223 ns a 500 K, paso de 2 fs, registro PLUMED cada 0,2 ps) para que un grupo genere sus propios `COLVAR_phi`/`COLVAR_psi` y los analice con el mismo pipeline.
- Analisis de preferencia de ligando en p53 Y220C: los scripts de `paper_figures/` permiten recalcular rankings de preferencia por bolsillo a partir de las puntuaciones de docking suministradas y contrastarlos con las poblaciones del MSM.
- Estimacion de robustez frente a particionado: `trajectory_cv_tilt.py` con `--k` 75, 100 o 150 y semillas 0 a 2, mas `summarize_trajectory_cv_tilt.py`, permite cuantificar cuanto depende un resultado de la asignacion de trayectorias de entrenamiento y prueba.
- Docencia en metodos de muestreo: el ejemplo de Muller-Brown, con parametros fijados y bajo coste, es util como caso de laboratorio para explicar sesgo de muestreo y correccion por *conditioning*.
- Integracion en CI cientifica: `python -m pip install -r requirements.txt && python -m pytest tests -q` encaja en un pipeline de integracion continua que verifique que los resultados numericos siguen siendo consistentes tras cambios en el codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El README menciona `tests/` como "comprobaciones de correctitud numerica", no como benchmark comparativo, y no incluye cifras de precision, speedup ni comparaciones frente a otras herramientas.

## Requisitos de hardware

- Inferencia: no aplica; no hay modelo que inferir.
- Ejecucion de las figuras en cache: `run_cached_figures.py` opera sobre resultados numericos ya calculados, por lo que se espera un requisito de CPU y memoria muy bajo, aunque el README no declara cifras de RAM ni de tiempo de ejecucion.
- GPU: el README no especifica ningun requisito de GPU para el paquete. Las simulaciones de Aib9 se delegan en un workflow externo de OpenMM, cuyos requisitos no se detallan en la informacion disponible.
- GPU consumer: no disponible; no se puede confirmar ni descartar que el paquete quepa o se beneficie de una GPU de consumo.
- Despliegue: el unico metodo documentado es la ejecucion local con Python 3.10 o superior, `pip install -r requirements.txt` y ejecucion directa de scripts. No se mencionan contenedores, vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Criterio | ScooBDoob | Alternativas comparables |
|---|---|---|
| Categoria | paquete de analisis de trayectorias y MSM | no disponible en la informacion proporcionada |
| Parametros | no aplica | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | repositorio publico en HuggingFace, 0 descargas | no disponible |

No se dispone de informacion sobre herramientas alternativas de la misma categoria en el material proporcionado, por lo que no es posible establecer una comparacion fundamentada.

## Limitaciones y advertencias

- El repositorio ocupa 0,0 GB y no contiene pesos ni artefactos de modelo; no es utilizable como modelo generativo.
- La licencia no esta declarada: no se puede asumir permiso de uso comercial, redistribucion ni creacion de obras derivadas. Es un bloqueo potencial para cualquier adopcion en produccion.
- No se declaran idiomas soportados, pipeline ni etiquetas tematicas relevantes; el unico tag es `region:us`.
- Las trayectorias de dinamica molecular no se distribuyen con el paquete, de modo que la reproducibilidad completa de los resultados requiere regenerar datos con herramientas externas (OpenMM, PLUMED) y parametros que solo se describen parcialmente.
- Los reajustes de MSM para p53 requieren ficheros de caracteristicas y observables de bolsillo que no acompanan al repositorio; solo se incluyen resultados numericos y puntuaciones de docking.
- Varios valores aparecen como constantes sin justificacion en el README (umbrales 0,5, 300,865 y 55,551; temperatura inversa 0,06; dt 0,0002). Su significado fisico y su rango de validez no se explican en el material disponible.
- El contenido de `requirements.txt` y de `INPUTS.tsv` no esta disponible, por lo que no se puede verificar la cadena de dependencias ni su fijacion de versiones.
- Ausencia total de senales de comunidad (0 descargas, 0 likes) y de validacion externa; el codigo no ha sido auditado de forma independiente segun la informacion disponible.
- Riesgo de alucinacion: no aplica al no existir componente generativo. El riesgo equivalente es el de resultados no reproducibles por datos ausentes.
- No se documentan sesgos, pero tampoco se documenta validacion frente a casos fuera de los tres sistemas estudiados (Muller-Brown, Aib9, p53 Y220C); la generalizacion a otros sistemas no esta respaldada.
- Antes de reutilizar el codigo conviene contactar con el autor para aclarar la licencia y solicitar los ficheros de entrada omitidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ChatterjeeLab/ScooBDoob
- Workflow OpenMM de Aib9 (shams-mehdi/aib9_openmm): https://github.com/shams-mehdi/aib9_openmm
- Mehdi et al. (2022), referencia metodologica de Aib9: https://doi.org/10.1021/acs.jctc.2c00058
