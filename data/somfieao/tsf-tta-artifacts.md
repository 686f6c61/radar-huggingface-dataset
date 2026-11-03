# somfieao/tsf-tta-artifacts

## Resumen

`tsf-tta-artifacts` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos de investigación para un proyecto de adaptación en tiempo de test (test-time adaptation, TTA) aplicada a pronóstico de series temporales (time-series forecasting, TSF). Lo publica el usuario de HuggingFace `somfieao` y contiene datasets, checkpoints y resultados experimentales generados durante el desarrollo de un trabajo de investigación. El repositorio no incluye pesos de un modelo fundacional único ni una model card con especificaciones de inferencia; su propósito es la reproducibilidad de los experimentos.

El contenido se organiza en tres grandes bloques: `datasets/` (14 benchmarks públicos en CSV, cachés de Lorenz-96 y tensores preprocesados para los experimentos híbridos TAFAS), `checkpoints/` (modelos backbone fuente, artefactos de métodos como ResKoop, DirectY, LongF y variantes, ablaciones arquitectónicas y checkpoints de validación de hipótesis) y `results/` (tablas pivote, MASTER.csv y diagnósticos exploratorios). El tamaño del repositorio en HuggingFace es de 6,6 GB, aunque la model card declara un total de aproximadamente 91 GB para el conjunto completo de artefactos, lo que sugiere que la subida está parcialmente completada o que el total incluye material no alojado en el Hub.

La relevancia de este repositorio es acotada: sirve a investigadores que quieran reproducir o extender el pipeline TTA sobre backbones tipo PatchTST en benchmarks estándar de series temporales (ETTh1/h2, ETm1/m2, electricity, traffic, weather, solar, exchange_rate, PEMS03/04/07/08). No es un modelo desplegable para producción ni un artefacto con licencia declarada para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo unico; los checkpoints incluyen backbones tipo PatchTST y metodos TTA (ResKoop, DirectY, LongF, variantes) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la ventana de entrada de cada backbone y dataset) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (series temporales numericas) |
| Licencia | No disponible |
| Formato de pesos | Checkpoints en formato PyTorch (`.pt` / `.npz` segun el arbol del repo); datasets en CSV y `.npz` |
| Tamano del repositorio | 6,6 GB en el Hub; ~91 GB declarados en la model card para el conjunto completo |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura de modelo única, sino un conjunto de artefactos asociados a un pipeline de investigación sobre adaptación en tiempo de test para pronóstico de series temporales. Los checkpoints de `checkpoints/sources/` contienen modelos backbone fuente (nomenclatura `source_patchtST_*` y `fullb_source_{backbone}_*`), lo que indica que PatchTST es uno de los backbones principales. Sobre estos backbones se aplican métodos TTA cuyos artefactos aparecen en `checkpoints/methods/`: `full_benchmark` (artefactos `fullb_{steps,modal,J}_{backbone}_{dataset}_*`), `reskoop` (correcores `reskoop_*` y `longf_reskoop_*`), `directy` (variantes `directy_patchtst_{e2e,y2e,y2y}_*`) y `longf` (`longf_patchtst_*`), además de variantes `modal*`, `steps*` y `nokoop*`.

La nomenclatura sugiere componentes de tipo Koopman (por `reskoop` y `koopman_Lorenz96_*`), correcciones de tipo residual y configuraciones end-to-end, year-to-end y year-to-year en DirectY. Los datos de entrenamiento no se detallan en la model card: se listan 14 benchmarks públicos de series temporales, una caché generada de Lorenz-96 y tensores preprocesados para los experimentos híbridos TAFAS (54 GB). No se especifica número de tokens, composición del dataset ni si hubo RLHF/DPO, algo esperable dado que no es un modelo de lenguaje. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Pronóstico de series temporales multivariante y univariante mediante backbones tipo PatchTST entrenados sobre benchmarks estándar.
- Adaptación en tiempo de test: los artefactos de métodos (ResKoop, DirectY, LongF, variantes) permiten evaluar estrategias de adaptación sobre un backbone fuente congelado o parcialmente ajustado.
- Experimentación con dinámicas caóticas: la caché de Lorenz-96 y los checkpoints `koopman_Lorenz96_*` y `reskoop_Lorenz96_*` permiten reproducir experimentos tempranos sobre sistemas dinámicos.
- Evaluación comparativa sobre 14 datasets públicos (weather, ETTh1/h2, ETm1/m2, electricity, traffic, solar, exchange_rate, PEMS03/04/07/08).
- Análisis exploratorio: diagnósticos `cr_lambda_*`, `reskoop_*`, y representaciones t-SNE / ADF-PSD en `.npz`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de TTA en series temporales: descargar el subárbol `results/main` y los checkpoints correspondientes para regenerar las tablas pivote y el `MASTER.csv` del campaña `full_benchmark`, verificando los resultados publicados por el autor.
- Benchmarking de backbones de pronóstico: usar los checkpoints `source_patchtST_*` como modelos fuente sobre los 14 datasets CSV para establecer líneas base antes de aplicar TTA.
- Investigación en correcciones tipo Koopman: emplear los artefactos `reskoop_*` y `longf_reskoop_*` para estudiar cómo las correcciones residuales basadas en operadores de Koopman afectan al error de pronóstico en horizontes largos.
- Estudio de adaptación end-to-end frente a year-to-year: comparar las variantes `directy_patchtst_{e2e,y2e,y2y}_*` sobre los mismos datasets para aislar el efecto del esquema de adaptación.
- Validación de hipótesis sobre sistemas caóticos: reproducir los experimentos `koopman_Lorenz96_*` y `reskoop_Lorenz96_*` para analizar la estabilidad de los métodos TTA en dinámicas caóticas controladas.
- Análisis de representaciones: utilizar los `.npz` de t-SNE y ADF-PSD de `results/experiments/` para estudiar la estructura latente de los backbones adaptados frente a los fuente.
- Ablaciones arquitectónicas: usar `checkpoints/ablations/resablation_*` para evaluar el impacto de componentes individuales del método sobre el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un `MASTER.csv` y tablas pivote en `results/main/`, pero no incluye cifras (MAE, MSE, etc.) ni comparaciones numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del backbone concreto (PatchTST y variantes) y del tamaño de ventana; los checkpoints individuales no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Para entrenamiento de PatchTST sobre los benchmarks listados es habitual una GPU consumer de gama alta o una A100, pero no se confirma en la documentación.
- Cabe en consumer GPU: no disponible con certeza; el repositorio completo (~91 GB declarados) no cabe en una GPU consumer, pero los checkpoints individuales de un backbone PatchTST sí suelen ser manejables.
- Opciones de despliegue: no se documentan. Al ser artefactos de investigación en PyTorch, el despliegue requeriría cargar los checkpoints con el código del proyecto original, que no se incluye en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable a otros modelos de pronóstico de series temporales publicados (como TimesFM, Chronos o Moirai), sino un conjunto de artefactos de investigación sobre TTA con backbones PatchTST. No se dispone de información suficiente para establecer una comparativa de parámetros, contexto, rendimiento o licencia frente a alternativas.

## Limitaciones y advertencias

- No es un modelo desplegable: el repositorio contiene artefactos de investigación (datasets, checkpoints, resultados) sin código de inferencia ni pipeline documentado.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial no está autorizado de forma explícita y debe consultarse con el autor.
- Tamaño declarado inconsistente: la model card indica ~91 GB totales, pero el Hub reporta 6,6 GB; es posible que la subida esté incompleta o que parte del material no se haya publicado.
- Idiomas: no aplica; los artefactos son numéricos y no soportan texto.
- Sesgos: no se documentan sesgos, pero los benchmarks incluidos (electricity, traffic, PEMS, etc.) tienen distribuciones específicas y los resultados no generalizan necesariamente a otros dominios.
- Riesgo de sobreajuste a los benchmarks: al ser experimentos de TTA sobre 14 datasets concretos, las conclusiones pueden no transferirse a series temporales fuera de esa selección.
- Sin garantías de reproducibilidad: no se incluye el código del proyecto, solo los artefactos; reproducir los resultados requiere reconstruir el pipeline a partir de la nomenclatura y los datos.
- Fechas de creación y actualización (2026) posteriores a la fecha actual de consulta; verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/somfieao/tsf-tta-artifacts
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados al proyecto.
