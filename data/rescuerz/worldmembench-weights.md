# rescuerz/WorldMemBench-weights

## Resumen

WorldMemBench-weights es un repositorio de pesos alojado en Hugging Face por el usuario `rescuerz`, cuyo contenido no es un modelo entrenado por el autor sino un paquete de checkpoints de terceros empleados por la suite de evaluacion WorldMemBench. La model card lo describe explicitamente como un "staging directory" en el que los modelos se almacenan una sola vez bajo `models/` conservando sus nombres originales, mientras que el descargador de WorldMemBench genera enlaces simbolicos relativos bajo `metrics/<metric>/` tras la descarga. El repositorio ocupa 72,0 GB y contiene pesos en formato safetensors y ONNX.

El paquete agrupa checkpoints de licencias dispares: la propia model card advierte de que cada modelo conserva su licencia y terminos de model card de origen, que la licencia MIT del codigo de WorldMemBench no relicencia estos checkpoints y que, en particular, los modelos InsightFace tienen terminos de investigacion no comercial y un checkpoint DA3 seleccionado tiene licencia CC BY-NC 4.0. Tambien menciona componentes como ViPE, cuyos ficheros de snapshot de la cache de Hugging Face deben subirse con sus rutas originales dentro de `models/vipe/huggingface/hub/...`.

Su relevancia es instrumental: sirve para reproducir y ejecutar las metricas de evaluacion de WorldMemBench (por ejemplo `imaging_quality` o el modelo opcional de `dynamic_memory`) sin depender de las fuentes upstream. No se trata, por tanto, de un modelo generativo desplegable, y no se publican en la informacion disponible ni parametros, ni contexto, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el repositorio agrega checkpoints de terceros en formatos ONNX y safetensors, sin una arquitectura unica declarada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (cada checkpoint conserva su licencia upstream; se citan terminos de investigacion no comercial para los modelos InsightFace y CC BY-NC 4.0 para el checkpoint DA3 seleccionado) |
| Formato de pesos | safetensors, ONNX |
| Tamano del repositorio | 72,0 GB |
| Autor | rescuerz |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Estructura interna | modelos bajo `models/` con nombres upstream; enlaces simbolicos generados bajo `metrics/<metric>/` |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni sobre entrenamiento porque el autor no entrena ningun modelo en este repositorio: se limita a empaquetar checkpoints ya existentes. La model card indica que los paquetes de modelo se almacenan una sola vez bajo `models/` manteniendo sus nombres originales, y que el descargador de WorldMemBench crea enlaces simbolicos relativos bajo `metrics/<metric>/` una vez completada la descarga. Los formatos presentes son ONNX y safetensors, y entre los componentes citados aparecen ViPE, modelos InsightFace y un checkpoint DA3.

La model card tambien define reglas de empaquetado: excluir `metrics/**`, `**/.cache/**`, `**/blobs/**` y `*.zip` al subir, y subir los ficheros de snapshot de la cache de Hugging Face de ViPE como su contenido real, respetando las rutas `models/vipe/huggingface/hub/.../snapshots/...` en lugar de duplicar ficheros de cache de blobs. No se detalla informacion sobre datos de entrenamiento, numero de tokens, composicion de dataset ni tecnicas de alineacion (RLHF, DPO) para ninguno de los checkpoints incluidos.

## Capacidades

- Empaquetado y distribucion de pesos de evaluacion: el repositorio permite descargar de una vez los checkpoints necesarios para ejecutar las metricas de WorldMemBench.
- Descarga selectiva por metrica: el script `scripts/download_release.py` acepta el parametro `--metrics` para bajar solo los pesos de una metrica concreta, por ejemplo `imaging_quality`.
- Metrica de memoria dinamica opcional: el modelo de `dynamic_memory` se descarga de forma explicita y opt-in.
- Metricas citadas: en la model card solo se nombran explicitamente `dynamic_memory` e `imaging_quality`; el resto de metricas del benchmark no se detalla.
- Componentes de vision por computador incluidos: checkpoints denominados ViPE, modelos InsightFace y un checkpoint DA3, sin que la model card describa sus capacidades.
- Uso offline: al ser pesos y no un endpoint, el paquete esta pensado para ejecucion local o en infraestructura propia, configurando `WORLDMEMBENCH_DATASETS_DIR`.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni soporte multilingue, ya que no se trata de un modelo de lenguaje.

## Casos de uso

- Reproduccion de evaluaciones de WorldMemBench: descargar el paquete completo con `python scripts/download_release.py weights --datasets-dir /path/to/datasets` y ejecutar el benchmark con exactamente los mismos checkpoints con los que se publicaron los resultados, evitando divergencias por versiones upstream.
- Comparacion de modelos de memoria y world models: usar la metrica `dynamic_memory` como referencia fija para comparar arquitecturas propias contra la linea base del benchmark, descargandola aparte con `--metrics dynamic_memory`.
- Evaluacion de calidad de imagen o video: emplear los pesos asociados a `imaging_quality` para medir la fidelidad perceptual de salidas generativas dentro de un pipeline de validacion, sin reimplementar las metricas.
- Integracion en CI/CD: invocar `scripts/download_release.py` con el parametro `--metrics` correspondiente para bajar unicamente los checkpoints de la metrica bajo prueba, reduciendo el tiempo de preparacion del entorno frente a la descarga completa de 72,0 GB.
- Verificacion de derechos antes de redistribuir: usar el repositorio como staging interno para auditar que cada checkpoint incluido conserva su licencia upstream y detectar cuales (InsightFace, DA3 con CC BY-NC 4.0) no son aptos para redistribucion comercial.
- Investigacion academica no comercial: proyectos de investigacion que puedan asumir los terminos CC BY-NC 4.0 y no comerciales de InsightFace pueden reutilizar los checkpoints directamente en lugar de reconstruir el entorno desde las fuentes originales.
- Reconstruccion de entornos aislados: en maquinas sin acceso a las fuentes upstream, el paquete permite preparar la cache de ViPE con las rutas `models/vipe/huggingface/hub/.../snapshots/...` exigidas por el Hub y evitar el uso de ficheros de cache de blobs duplicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio contiene pesos de evaluacion, no un modelo evaluado; la model card no incluye tablas de resultados (MMLU, HumanEval, GSM8K ni metricas propias del benchmark) y no se dispone de cifras de latencia o throughput.

## Requisitos de hardware

- Espacio en disco: al menos 72,0 GB para el repositorio completo, mas el espacio adicional de los datasets referenciados por `WORLDMEMBENCH_DATASETS_DIR`.
- VRAM para inferencia: no disponible. La model card no publica requisitos de memoria para ningun checkpoint y el repositorio agrupa modelos heterogeneos, por lo que no es posible dar una cifra unica ni fiable.
- GPU recomendadas: no disponible. Cualquier recomendacion de A100, H100 o RTX 4090 seria una extrapolacion no respaldada por la informacion proporcionada, dado que se desconoce el tamano y la arquitectura de cada checkpoint individual.
- Inferencia en GPU de consumo: no disponible. Solo seria determinable checkpoint a checkpoint, tras inspeccionar los ficheros ONNX o safetensors concretos y su huella de memoria.
- Opciones de despliegue: no declaradas. La model card solo describe el flujo de descarga mediante `scripts/download_release.py` y `scripts/download_weights.py`; no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rescuerz/WorldMemBench-weights | no disponible | no disponible | no disponible | other (mixta por checkpoint) | Hugging Face, 0 descargas |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de modelos comparables en la informacion proporcionada: se trata de un paquete de pesos de evaluacion y no de un modelo con categoria equivalente. Los resultados de busqueda web devueltos no aportan alternativas concretas ni datos utilizables para una comparacion.

## Limitaciones y advertencias

- No es un modelo desplegable: es un directorio de staging de pesos de terceros, por lo que no cabe esperar inferencia directa, API ni pipeline en el Hub.
- Licencias heterogeneas: la licencia `other` agrega checkpoints con condiciones distintas; las condiciones comerciales deben verificarse modelo a modelo antes de cualquier uso productivo.
- Restricciones explicitas de uso comercial: los modelos InsightFace tienen terminos de investigacion no comercial y el checkpoint DA3 seleccionado esta bajo CC BY-NC 4.0. La licencia MIT del codigo de WorldMemBench no relicencia estos checkpoints.
- Falta de documentacion: la model card no detalla parametros, contexto, idiomas, cuantizaciones ni resultados, lo que impide evaluar el rendimiento antes de la descarga.
- Riesgo de empaquetado incorrecto: subir por error `metrics/**`, `**/.cache/**`, `**/blobs/**` o ficheros `*.zip`, o duplicar la cache de ViPE como blobs en lugar de respetar la ruta `snapshots/...`, rompe la estructura esperada por el descargador.
- Sin garantias de mantenimiento: 0 descargas, 0 likes y creacion y ultima actualizacion en la misma fecha (2026-10-08), sin historial de versiones que permita confiar en la estabilidad del paquete.
- Sin datos de sesgo, alucinacion o cobertura idiomatica: no aplicables a un conjunto de pesos de evaluacion y, en cualquier caso, no disponibles.
- Coste de almacenamiento: 72,0 GB minimos de disco mas los datasets, lo que complica su uso en entornos con almacenamiento limitado o en flujos de CI con cache efimera.

## Enlaces

- Hugging Face: https://huggingface.co/rescuerz/WorldMemBench-weights
- Script de descarga de pesos citado en la model card: `scripts/download_release.py` (dentro del repositorio de codigo de WorldMemBench)
- Script de descarga desde fuentes upstream citado en la model card: `scripts/download_weights.py` (dentro del repositorio de codigo de WorldMemBench)
- Variable de entorno requerida: `WORLDMEMBENCH_DATASETS_DIR`
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada. Los resultados de busqueda web recibidos corresponden a portales genericos (huggingface.co, claude.com, explainx.ai, theopenweights.com, lmmarketcap.com) y no aportan enlaces especificos sobre WorldMemBench.
