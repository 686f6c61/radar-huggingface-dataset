# ScriptSmith/tabular-data-workbench-onnx

## Resumen

El repositorio `ScriptSmith/tabular-data-workbench-onnx` no es un modelo unico, sino una coleccion de conversiones ONNX no oficiales de seis modelos fundacionales de datos tabulares y series temporales, empaquetadas para su ejecucion en navegador mediante `onnxruntime-web` sobre WebGPU o WebAssembly. Lo mantiene ScriptSmith, un autor independiente, y los pesos originales pertenecen a terceros: TabICLv2 (equipo Soda, Inria), Kumo Tabular y Kumo Relational y Kumo Anomaly (NVIDIA), y Chronos-2 y Chronos-2 small (Amazon). El proposito es permitir clasificacion, regresion, forecasting de series temporales y deteccion de anomalias directamente en el cliente, sin backend.

La relevancia de este paquete radica en que traslada modelos de aprendizaje en contexto (in-context learning) sobre tablas a un entorno puramente web, con verificacion de integridad por sha256 en cada fichero y cifras de paridad frente a las implementaciones de referencia. Cada grafo se ofrece en dos variantes: `fp32` con los pesos tal cual se publicaron y `f16w`, que almacena como float16 los pesos de 1.024 elementos o mas y los convierte a float32 al cargar, reduciendo a la mitad la descarga y manteniendo el computo en float32.

El repositorio ocupa 2,8 GB e incluye `manifest.json` por carpeta con tamanos, hashes, entradas y salidas de los grafos, ajustes de modelo y metricas de paridad. Los grafos contienen solo las redes: el preprocesado, el ensamblado, el muestreo y la decodificacion quedan fuera, implementados en TypeScript dentro de la aplicacion Tabular Data Workbench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales exportadas a grafos ONNX (opset 18, opset 20 para `kumo/`); los modelos subyacentes son modelos fundacionales tabulares y de series temporales con aprendizaje en contexto |
| Parametros totales | no disponible (no se detallan por modelo en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que ninguno de los modelos base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `fp32` (pesos originales) y `f16w` (pesos float32 de 1.024 elementos o mas almacenados como float16 y convertidos a float32 al cargar); `kumo/` solo dispone de `f16w` |
| Idiomas soportados | no disponible (los modelos operan sobre datos tabulares y series temporales, no sobre texto) |
| Licencia | BSD-3-Clause (`tabicl/`), OpenMDW-1.1 (`kumo/` y `rfm/`), Apache-2.0 (`tsfm/`) |
| Formato de pesos | ONNX (variantes `fp32` y `f16w`) |

Desglose por carpeta:

| Carpeta | Modelos incluidos | Upstream | Licencia | Tamano (fp32 + f16w) |
|---|---|---|---|---|
| `tabicl/` | TabICLv2 classifier y regressor | jingang/TabICL (Soda team, Inria) | BSD-3-Clause | 339 MB |
| `kumo/` | Kumo Tabular small, medium y large, classifier y regressor | nvidia/Kumo-Tabular (NVIDIA) | OpenMDW-1.1 | 1,2 GB (solo `f16w`) |
| `rfm/` | Kumo Relational classifier y regressor | nvidia/Kumo-Relational (NVIDIA) | OpenMDW-1.1 | 367 MB |
| `tsfm/` | Chronos-2, Chronos-2 small, Kumo-Anomaly | amazon/chronos-2, autogluon/chronos-2-small (Amazon), nvidia/Kumo-Anomaly (NVIDIA) | Apache-2.0 | 901 MB |

## Arquitectura y entrenamiento

Los grafos ONNX se generaron con PyTorch 2.14 en CPU y el exportador dynamo de `torch.onnx` a opset 18 (opset 20 para `kumo/`), y se validaron con onnxruntime 1.30. Cada exportacion comprueba los grafos contra el paquete de referencia correspondiente (`tabicl`, `structured-data-models`, `chronos-forecasting`) antes de escribir el manifiesto. Los exports eliminan tambien los metadatos de nodo y las docstrings del exportador, que contienen trazas con rutas de la maquina que los ejecuto. Los scripts de exportacion y las referencias en numpy para los pasos externos al grafo viven en la carpeta `models/` del proyecto Tabular Data Workbench, un workspace de `uv`.

No se proporcionan datos sobre el entrenamiento de los modelos subyacentes: numero de tokens, composicion del dataset, ni si hubo RLHF o DPO. Lo que si se documenta es la relacion entre los modelos base: `rfm/` fue afinado a partir de los pesos de TabICLv2 (nota de terceros BSD-3-Clause incluida), y `kumo/` incorpora codigo derivado de TabICLv2 con su aviso BSD-3-Clause correspondiente. La innovacion tecnica de este repositorio es el pipeline de exportacion verificada y la doble variante `fp32`/`f16w` con computo final en float32.

## Capacidades

- Clasificacion tabular en contexto: TabICLv2 classifier, Kumo Tabular (small, medium, large) y Kumo Relational classifier.
- Regresion tabular en contexto: TabICLv2 regressor, Kumo Tabular regressor y Kumo Relational regressor.
- Modelado relacional: Kumo Relational opera sobre tablas relacionadas (multi-tabla), no solo sobre una unica tabla plana.
- Forecasting de series temporales: Chronos-2 y Chronos-2 small.
- Deteccion de anomalias en series temporales: Kumo-Anomaly.
- Ejecucion en navegador: inferencia con `onnxruntime-web` sobre WebGPU o WebAssembly, sin backend.
- Verificacion de integridad: comprobacion de sha256 de cada fichero antes de cachearlo.
- Paridad verificada: cada grafo se contrasta con la implementacion de referencia antes de publicarse.
- Tool calling, agentes, vision, audio, thinking mode y capacidades multilingues de texto: no disponibles; estos modelos no son modelos de lenguaje.

## Casos de uso

- Clasificacion de clientes en el navegador: cargar un CSV de churn y ejecutar TabICLv2 classifier sobre WebGPU sin enviar datos personales a ningun servidor, usando el aprendizaje en contexto para predecir sin reentrenar.
- Scoring de riesgo de credito en el cliente: emplear Kumo Tabular medium o large como regresor para estimar probabilidades a partir de variables financieras, manteniendo los datos dentro de la organizacion.
- Analitica sobre esquemas relacionales: usar Kumo Relational classifier para tareas que requieren cruzar varias tablas (por ejemplo, clientes y transacciones) directamente en la aplicacion web.
- Prevision de demanda: ejecutar Chronos-2 sobre series historicas de ventas en una demo web o un panel interno para obtener forecasts a corto plazo sin infraestructura de servidor.
- Deteccion de anomalias en metricas: aplicar Kumo-Anomaly sobre series de telemetria o sensores en un dashboard de navegador para marcar picos fuera de patron.
- Exploracion interactiva de datasets: prototipos y demos de modelos fundacionales tabulares que se ejecutan localmente, utiles para evaluar calidad antes de montar un pipeline de produccion.
- Validacion de conversiones: servir como referencia para quien quiera verificar la paridad de sus propias exportaciones ONNX usando los manifiestos y las cifras incluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye cifras de paridad de cada grafo frente a su implementacion de referencia, pero no se detallan valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; por carpeta, `tabicl/` ocupa 339 MB, `rfm/` 367 MB, `tsfm/` 901 MB y `kumo/` 1,2 GB en disco (variante `f16w`), lo que orienta sobre la memoria necesaria al cargar cada conjunto.
- GPU recomendadas: no disponible; el diseno apunta a WebGPU en el navegador, por lo que el hardware depende del cliente.
- Compatibilidad con GPU de consumo: no disponible; al ejecutarse via WebGPU o WebAssembly, la viabilidad depende del navegador y la GPU del usuario.
- Opciones de despliegue: `onnxruntime-web` con WebGPU o WebAssembly; los grafos ONNX son compatibles con otros runtimes ONNX, pero la informacion solo documenta el uso en la aplicacion web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabICLv2 (via este repo, `tabicl/`) | no disponible | no disponible | ONNX `fp32`/`f16w` | BSD-3-Clause | Hugging Face |
| Kumo Tabular (via este repo, `kumo/`) | no disponible | no disponible | ONNX `f16w` | OpenMDW-1.1 | Hugging Face |
| Kumo Relational (via este repo, `rfm/`) | no disponible | no disponible | ONNX `fp32`/`f16w` | OpenMDW-1.1 | Hugging Face |
| Chronos-2 (via este repo, `tsfm/`) | no disponible | no disponible | ONNX `fp32`/`f16w` | Apache-2.0 | Hugging Face |

Los modelos de referencia originales (jingang/TabICL, nvidia/Kumo-Tabular, nvidia/Kumo-Relational, amazon/chronos-2, autogluon/chronos-2-small, nvidia/Kumo-Anomaly) estan disponibles en Hugging Face en sus formatos nativos; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Conversiones no oficiales: los autores upstream no han revisado ni respaldado estos grafos ONNX.
- Los grafos contienen solo las redes; el preprocesado, el ensamblado, el muestreo y la decodificacion deben implementarse aparte (la aplicacion lo hace en TypeScript).
- `kumo/` solo ofrece la variante `f16w`, sin `fp32` disponible.
- Licencias heterogeneas por carpeta: BSD-3-Clause, OpenMDW-1.1 y Apache-2.0; al redistribuir hay que conservar los ficheros de licencia y aviso de cada carpeta.
- Restricciones de uso comercial: no disponibles en detalle; deben revisarse las condiciones de OpenMDW-1.1 y las notas de terceros antes de un uso comercial.
- No son modelos de lenguaje: no ofrecen generacion de texto, tool calling ni capacidades multilingues.
- Datos de entrenamiento, sesgos y riesgo de alucinacion: no disponibles en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-29) no permite confirmar madurez ni mantenimiento del paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ScriptSmith/tabular-data-workbench-onnx
- Modelo base TabICL: https://huggingface.co/jingang/TabICL
- Modelo base Kumo Tabular: https://huggingface.co/nvidia/Kumo-Tabular
- Modelo base Kumo Relational: https://huggingface.co/nvidia/Kumo-Relational
- Modelo base Chronos-2: https://huggingface.co/amazon/chronos-2
- Modelo base Chronos-2 small: https://huggingface.co/autogluon/chronos-2-small
- Modelo base Kumo-Anomaly: https://huggingface.co/nvidia/Kumo-Anomaly
- Licencias del repositorio: https://huggingface.co/ScriptSmith/tabular-data-workbench-onnx/blob/main/LICENSE.md
- Detalle de la carpeta TabICL: https://huggingface.co/ScriptSmith/tabular-data-workbench-onnx/blob/main/tabicl/README.md
- Detalle de la carpeta Kumo: https://huggingface.co/ScriptSmith/tabular-data-workbench-onnx/blob/main/kumo/README.md
- Detalle de la carpeta RFM: https://huggingface.co/ScriptSmith/tabular-data-workbench-onnx/blob/main/rfm/README.md
- Detalle de la carpeta TSFM: https://huggingface.co/ScriptSmith/tabular-data-workbench-onnx/blob/main/tsfm/README.md
