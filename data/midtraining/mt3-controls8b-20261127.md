# midtraining/mt3-controls8b-20261127

## Resumen

`mt3-controls8b-20261127` no es un modelo entrenado, sino un paquete de artefactos de investigación publicado por el usuario `midtraining` en Hugging Face. Contiene dos "trabajos de control" (control jobs) diseñados para ejecutarse dentro del *ladder bundle* `midtraining/mt3-ladder-20261113`, junto a los trabajos SCI de `midtraining/mt3-sci-20261120`. El objetivo es aislar el efecto de una variable concreta en el pipeline de *midtraining*: qué información lee el modelo en la vista que transporta una descripción de documento.

Ambos controles parten del mismo trabajo SCI alternado y solo cambian el contenido de esa vista de descripción. En el primer control, la vista lee el nombre de la fuente del documento (`Source: general/nemo_cc_high`); en el segundo, lee un resumen de tres frases del contenido del documento, con la longitud de una descripción de registro. Los identificadores de los trabajos son `L2_qwen3-1.7b_alternating_source_D8B_s2027` y `L2_qwen3-1.7b_alternating_summary_D8B_s2027` respectivamente.

El modelo base sobre el que se ejecutan los controles es Qwen3-1.7B-Base, con un presupuesto de 8.000 millones de tokens y ocho tarjetas gráficas. El paquete incluye scripts de construcción, verificación, anotación (con vLLM y Qwen3-4B), encolado y lectura de resultados, además de sumas de verificación SHA256. La información pública disponible sobre el repositorio es muy limitada: no hay pipeline declarado, ni licencia, ni idiomas, ni descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no define un modelo propio; los trabajos se ejecutan sobre Qwen3-1.7B-Base) |
| Parametros totales | no disponible (modelo base de referencia: Qwen3-1.7B-Base, 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts, JSON de checksums y artefactos de trabajos, no pesos publicados) |

## Arquitectura y entrenamiento

El repositorio no publica un modelo con arquitectura propia. Lo que distribuye es un conjunto de *jobs* de control que se integran en el *ladder bundle* `midtraining/mt3-ladder-20261113`. Cada control es el trabajo SCI alternado con una única modificación: la vista que transporta una descripción lee, bien el nombre de la fuente del documento, bien un resumen de tres frases de su contenido. El entrenamiento se realiza sobre Qwen3-1.7B-Base con un presupuesto de 8.000 millones de tokens y ocho tarjetas.

El flujo de ejecución descrito en la model card incluye la construcción de un *sidecar* de fuentes (`build_source_sidecar.py`), la verificación de controles (`check_controls.py`), la adición de los jobs (`add_control_jobs.py`), una fase de anotación con vLLM usando Qwen/Qwen3-4B sobre las GPUs 0 a 7, la ejecución en cola mediante `tools/run_queue.py` y la lectura de resultados con `read_controls.sh`. Los resultados deben devolverse en `controls8b/results_controls8b.tar.gz` y subirse a `result/` del repositorio, junto con los 18 benchmarks de los dos modelos ajustados ejecutados con `run_bench.sh`. No se detallan en la información disponible innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- No es un modelo desplegable: no ofrece generación de texto, razonamiento, código, matemáticas ni visión por sí mismo.
- Proporciona dos configuraciones de control reproducibles para experimentos de *midtraining* sobre Qwen3-1.7B-Base.
- Incluye scripts de construcción de *sidecar*, verificación, anotación con vLLM, encolado y lectura de resultados.
- Incluye sumas de verificación SHA256 de todos los archivos (`SHA256.json`).
- Documentación de instrucciones en chino (`controls8b/README_CN.md`).
- Define la recogida de resultados: archivo `results_controls8b.tar.gz` y 18 benchmarks por modelo ajustado.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de *midtraining*: el paquete permite reconstruir exactamente los dos controles (nombre de fuente y resumen de contenido) dentro del *ladder bundle*, verificando la integridad con `SHA256.json`.
- Aislamiento de variables en estudios de datos: un investigador puede comparar el efecto de leer el nombre de la fuente frente a leer un resumen de tres frases, manteniendo constante el resto del trabajo SCI alternado.
- Auditoría de pipelines de anotación: los scripts de anotación con vLLM y Qwen3-4B permiten reproducir la fase de etiquetado sobre ocho GPUs y comprobar su consistencia.
- Integración en colas de experimentos: `add_control_jobs.py` y `tools/run_queue.py` permiten encolar los dos trabajos junto a los SCI existentes en un clúster con ocho tarjetas.
- Verificación de resultados de benchmarks: el flujo exige ejecutar `run_bench.sh` sobre los dos modelos ajustados y devolver los 18 benchmarks, lo que facilita la comparación entre filas del *ladder*.
- Formación y revisión metodológica: sirve como ejemplo documentado de diseño de controles en experimentos de *midtraining*, con instrucciones paso a paso y checksums.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo especifica que deben devolverse los 18 benchmarks de los dos modelos ajustados ejecutados con `run_bench.sh`, pero no incluye cifras.

## Requisitos de hardware

- El flujo de ejecución está diseñado para ocho GPUs (índices 0 a 7) en la fase de anotación con vLLM.
- Modelo base de los trabajos: Qwen3-1.7B-Base; modelo de anotación: Qwen/Qwen3-4B.
- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el único requisito explícito es disponer de ocho tarjetas para la anotación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM para la anotación; el resto del flujo usa scripts Python propios (`build_source_sidecar.py`, `check_controls.py`, `add_control_jobs.py`, `run_queue.py`, `read_controls.sh`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `midtraining/mt3-controls8b-20261127` | Paquete de jobs de control | no aplica (base Qwen3-1.7B-Base) | no disponible | no disponible | Hugging Face, 0 descargas |
| `midtraining/mt3-ladder-20261113` | Bundle de experimentos | no aplica | no disponible | no disponible | Hugging Face (referenciado) |
| `midtraining/mt3-sci-20261120` | Jobs SCI | no aplica | no disponible | no disponible | Hugging Face (referenciado) |

No se dispone de información suficiente para comparar rendimiento con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia directa: es un paquete de artefactos y scripts de experimentación.
- La licencia no está declarada, por lo que no puede asumirse uso comercial ni redistribución.
- No se declaran idiomas soportados ni pipeline; la documentación de instrucciones está en chino.
- Depende de repositorios externos (`mt3-ladder-20261113`, `mt3-sci-20261120`) y de un entorno con vLLM y ocho GPUs.
- El repositorio no incluye pesos del modelo; solo scripts, checksums y artefactos de los trabajos.
- No hay descargas ni likes registrados, lo que limita la evidencia de uso o validación por terceros.
- No se han publicado resultados de benchmarks; cualquier afirmación de rendimiento carecería de respaldo en la información disponible.
- Riesgo de alucinación y sesgos: no evaluable, al no tratarse de un modelo generativo desplegable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/midtraining/mt3-controls8b-20261127
- Bundle de referencia: `midtraining/mt3-ladder-20261113` (referenciado en la model card)
- Jobs SCI de referencia: `midtraining/mt3-sci-20261120` (referenciado en la model card)
- Modelo base: Qwen/Qwen3-1.7B-Base (referenciado en la model card)
- Modelo de anotación: Qwen/Qwen3-4B (referenciado en la model card)
- Instrucciones en chino: `controls8b/README_CN.md` (dentro del repositorio)
- Checksums: `SHA256.json` (dentro del repositorio)
