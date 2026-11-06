# SanLouis/NeurPRISE

## Resumen

NeurPRISE es un conjunto de modelos y datos asociados al articulo "Learning Scenario Reduction for Two-Stage Robust Optimization with Discrete Uncertainty", presentado en NeurIPS 2026 por el autor SanLouis. No se trata de un modelo de lenguaje generativo, sino de un artefacto de investigacion orientado a la optimizacion robusta de dos etapas: los checkpoints incluidos en el repositorio implementan una politica aprendida (NeurPRISE) que selecciona y reduce escenarios de incertidumbre discreta, sustituyendo heuristicas clasicas de reduccion de escenarios por un enfoque neuronal entrenado.

El repositorio contiene tres tipos de artefactos: los pesos de los modelos en formato PyTorch (`.pt`) bajo `checkpoints/<experiment>/<tag>[_<variant>].pt`, las instancias de test en formato pickle (`data/<problem>/inst_*.pkl`) y las etiquetas PRISE junto con los objetivos exactos `V(Ξ)` y las soluciones optimas `x*` (`data/<problem>/label_prise_*.pkl`). Ademas incluye una cache de objetivos exactos en `eval_regret/full_objs_cache.json` para facilitar la evaluacion del regret.

Su relevancia es metodologica: proporciona un pipeline reproducible (via `scripts/reproduce.sh download` y `scripts/reproduce.sh eval` del repositorio de codigo) para comparar la reduccion de escenarios aprendida frente a metodos exactos en problemas de optimizacion robusta con incertidumbre discreta. El tamano del repositorio es de 1,4 GB y la licencia es Apache 2.0. No hay informacion publica sobre arquitectura, numero de parametros ni contexto, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de optimizacion, no de lenguaje; pesos en PyTorch `.pt`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en precision original PyTorch) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints); datos en `.pkl`; cache en `.json` |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna de NeurPRISE en la model card. Por el contexto del articulo ("Learning Scenario Reduction for Two-Stage Robust Optimization with Discrete Uncertainty"), se trata de un modelo neuronal entrenado para aprender una politica de reduccion de escenarios en problemas de optimizacion robusta de dos etapas con incertidumbre discreta. El entrenamiento se apoya en las etiquetas PRISE (`label_prise_*.pkl`), que contienen los objetivos exactos `V(Ξ)` y las soluciones optimas `x*` de las instancias de test.

El flujo de evaluacion requiere resolver los problemas de optimizacion subyacentes, lo que exige una licencia de Gurobi. Los resultados de reproducibilidad pueden variar segun el hardware, la version del solver y los ajustes de este. No se documentan en la model card el numero de tokens, la composicion del dataset de entrenamiento ni si hubo RLHF/DPO, ya que no aplica al dominio.

## Capacidades

- Reduccion de escenarios para optimizacion robusta de dos etapas con incertidumbre discreta.
- Prediccion de subconjuntos de escenarios representativos a partir de instancias de optimizacion.
- Evaluacion del regret frente a la solucion optima exacta `V(Ξ)` y `x*` sobre instancias de test.
- Integracion con solvers de optimizacion (Gurobi) para la resolucion de los problemas subyacentes.
- Reproducibilidad de los experimentos del articulo NeurIPS 2026 mediante scripts dedicados.
- Soporte de multiples problemas de optimizacion organizados por carpetas (`data/<problem>/`).
- Soporte de variantes de modelo por experimento y tag (`checkpoints/<experiment>/<tag>[_<variant>].pt`).
- No soporta generacion de texto, codigo, vision, audio, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en optimizacion robusta: usar los checkpoints para reproducir los resultados del articulo y comparar la reduccion de escenarios aprendida con heuristicas clasicas, gracias a las etiquetas PRISE y la cache de objetivos exactos incluidas.
- Benchmarking de metodos de reduccion de escenarios: emplear `eval_regret/full_objs_cache.json` para calcular el regret de nuevas propuestas sin recalcular los objetivos exactos de todas las instancias de test.
- Desarrollo de heuristicas aprendidas para problemas de dos etapas: entrenar o ajustar variantes de NeurPRISE sobre las instancias `inst_*.pkl` y validar contra las soluciones optimas `x*` proporcionadas.
- Docencia y formacion en optimizacion: utilizar los problemas de test y las etiquetas como material didactico para ilustrar la diferencia entre la solucion exacta y la solucion obtenida tras reducir escenarios.
- Validacion de pipelines de investigacion reproducibles: ejecutar `scripts/reproduce.sh download` y `scripts/reproduce.sh eval` para verificar la infraestructura de evaluacion en un entorno con Gurobi.
- Extension a nuevos dominios de incertidumbre discreta: reutilizar la estructura de carpetas `data/<problem>/` y el formato de etiquetas para incorporar nuevos problemas de optimizacion y medir la transferibilidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo y al repositorio de codigo para las evaluaciones, pero no incluye tablas de resultados numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 1,4 GB, pero no se detalla el desglose entre checkpoints y datos ni el tamano individual de cada modelo.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica el ecosistema habitual (vLLM, llama.cpp, Ollama, TGI). El despliegue se realiza mediante los scripts del repositorio de codigo (`scripts/reproduce.sh`) y requiere una licencia de Gurobi para la parte de optimizacion.
- Latencia y throughput: no disponibles. Los resultados pueden variar con el hardware, la version del solver y sus ajustes.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (reduccion de escenarios aprendida para optimizacion robusta) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo, vision ni audio; no soporta tool calling ni agentes.
- Requiere una licencia de Gurobi para ejecutar la optimizacion subyacente, lo que limita su uso a entornos con dicha licencia.
- Los resultados de reproduccion pueden variar segun el hardware, la version del solver y los ajustes de este, lo que afecta a la comparabilidad estricta entre ejecuciones.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma porque no aplican al dominio; aun asi, la ausencia de esta informacion impide evaluar riesgos de generalizacion a problemas fuera del conjunto de test.
- La licencia Apache 2.0 permite uso comercial, pero el uso del solver Gurobi esta sujeto a su propia licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia publica de validacion externa independiente.
- La documentacion disponible es minima: la model card remite al repositorio de codigo y a `doc/REPRODUCE.md`, sin detallar arquitectura, hiperparametros ni datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SanLouis/NeurPRISE
- Repositorio de codigo: https://github.com/lintianjue/NeurPRISE
- Documentacion de reproduccion: `doc/REPRODUCE.md` dentro del repositorio de codigo
- Articulo: "Learning Scenario Reduction for Two-Stage Robust Optimization with Discrete Uncertainty" (NeurIPS 2026)
