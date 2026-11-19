# Diveshj/sorghum-kernel-transfer

## Resumen

`sorghum-kernel-transfer` es un repositorio de investigacion publicado en Hugging Face por el usuario Diveshj que acompana a un articulo cientifico sobre clasificacion de defectos en granos de sorgo. No es un modelo generativo ni un LLM, sino un paquete de codigo, checkpoints, predicciones por imagen y tablas de resultados para estudiar como de bien generalizan los clasificadores de defectos de granos de sorgo entrenados en el conjunto de datos GrainSet cuando se aplican a un segundo conjunto, GrainDet, y que tecnicas ayudan a recuperar el rendimiento perdido por el cambio de dominio.

El repositorio incluye 21 modelos clasificadores de imagen evaluados (familias ViT y EfficientNet, entre otras) con una receta de ajuste fino unica, junto con utilidades estadisticas especificas del dominio: intervalos de confianza agrupados por bandeja de captura, test de McNemar y correccion de Holm. La unidad de incertidumbre son las bandejas de fotografias, no los recortes individuales, lo que refleja que las imagenes de una misma bandeja se capturaron juntas.

Es relevante para investigadores en vision por computador aplicada a agricultura y para ingenieros que necesiten reproducir resultados de transferencia de dominio con datos de inspeccion de grano, ya que publica predicciones por imagen que permiten reconstruir todas las tablas del articulo sin reentrenar ni descargar las imagenes originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diversas familias de clasificadores de imagen (ViT small, EfficientNet-B0, entre otras; 21 modelos evaluados en la tabla 5) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (clasificacion de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT (codigo); las imagenes de GrainSet y GrainDet conservan sus terminos originales |
| Formato de pesos | Checkpoints PyTorch (`.pt`), segun `checkpoints/MANIFEST.md` |

## Arquitectura y entrenamiento

El repositorio agrupa varias familias de clasificadores de imagen (ViT small, EfficientNet-B0 y otras hasta 21 modelos) bajo una unica receta de ajuste fino: misma tasa de aprendizaje, mismos epochs y mismo aumento de datos para todos, de modo que las diferencias observadas entre modelos no se atribuyan a diferencias en el entrenamiento. Los modelos se entrenan primero en el lado GrainSet y se evaluan en GrainDet (8.640 recortes de grano individual de 47 bandejas, organizados por clase; la clase "F&S" aparece en la carpeta `FS`).

El repositorio menciona variantes adversariales y de normalizacion de instancia empleadas en el entrenamiento del lado GrainSet, aunque el codigo que las entrena no forma parte de esta release limpia; solo se listan los checkpoints resultantes. La evaluacion estadistica trata las bandejas como unidad de incertidumbre: los intervalos de confianza remuestrean bandejas completas dentro de cada clase, y se aplican test de McNemar y correccion de Holm para comparaciones multiples. El codigo lee la fecha de captura del nombre de fichero para controlar el solapamiento entre clase y sesion de captura (tres clases fotografiadas en fechas propias, cinco que comparten una misma fecha).

## Capacidades

- Clasificacion de imagenes de granos de sorgo en categorias de defecto (clasificacion multiclase por recorte individual).
- Transferencia de dominio entre conjuntos de datos de inspeccion de grano (GrainSet a GrainDet).
- Ajuste fino reproducible con una receta unica para multiples familias de modelos.
- Analisis estadistico con intervalos agrupados por bandeja, test de McNemar y correccion de Holm.
- Reconstruccion de tablas de resultados a partir de predicciones publicadas, sin necesidad de imagenes.
- Auditoria de bandejas y comprobacion de sesion de captura a partir de los nombres de fichero.
- No soporta tool calling, agentes, generacion de texto ni capacidades multilingues.

## Casos de uso

- Reproduccion de resultados cientificos: el script `tests/test_rebuild_numbers.py` reconstruye las cifras principales del articulo a partir de las predicciones publicadas, sin descargar imagenes, lo que permite verificar los numeros sin reentrenar.
- Evaluacion de transferencia de dominio en vision agricola: los 21 checkpoints permiten comparar como degrada cada familia de modelo al pasar de GrainSet a GrainDet y medir el efecto de la adaptacion.
- Inspeccion automatica de grano en linea de procesado: un clasificador ViT small o EfficientNet-B0 ajustado con `scripts/01_finetune.py` puede desplegarse sobre recortes de grano individual para separar lotes por tipo de defecto.
- Auditoria de calidad con incertidumbre realista: el uso de intervalos agrupados por bandeja evita sobreestimar la fiabilidad cuando varias imagenes provienen de la misma captura, algo critico en control de calidad industrial.
- Analisis de sesgo por sesion de captura: el codigo extrae la fecha del nombre de fichero y permite detectar si el rendimiento depende de la sesion de fotografiado, un problema habitual en datasets agricolas.
- Prototipado rapido en CPU: el modo `--smoke` con EfficientNet-B0 permite validar el pipeline de datos y el cableado del modelo en CPU antes de lanzar entrenamientos completos.
- Benchmark interno de modelos de clasificacion: la receta unica y las tablas de resultados sirven como referencia para comparar nuevas arquitecturas bajo condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio remite a las tablas generadas por `scripts/02_rebuild_table5.py` y a los ficheros de `all_results/`, pero los valores concretos no se incluyen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de clasificadores tipo ViT small y EfficientNet-B0, la inferencia cabe holgadamente en GPUs de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modo `--smoke` esta disenado para ejecutarse en CPU.
- Cabe en GPU de consumo: si, para las arquitecturas ligeras mencionadas (ViT small, EfficientNet-B0); el resto de las 21 variantes no se detalla.
- Opciones de despliegue: scripts propios en PyTorch (`scripts/01_finetune.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a clasificacion de imagen.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados numericos ni modelos alternativos comparables de la misma categoria con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso en esos escenarios es inadecuado.
- El repositorio no redistribuye las imagenes de GrainSet ni GrainDet; es necesario obtenerlas de sus fuentes originales (Figshare DOI 10.6084/m9.figshare.22988981.v2 y github.com/hellodfan/GrainDet) y respetar sus terminos.
- El codigo de entrenamiento de las variantes adversariales y de normalizacion de instancia del lado GrainSet no esta incluido en esta release; solo se listan los checkpoints.
- Riesgo de sobreajuste a la sesion de captura: tres clases se fotografiaron en fechas propias y cinco comparten fecha, lo que puede inflar el rendimiento aparente si no se controla por bandeja y sesion.
- Las predicciones y listas de split se derivan de nombres de fichero y etiquetas de GrainDet y se ofrecen unicamente para reproducir los numeros del articulo.
- La licencia MIT cubre solo el codigo del repositorio; las imagenes y los datasets originales conservan sus propias condiciones, que deben revisarse antes de cualquier uso comercial.
- No se han publicado cifras de latencia, throughput ni requisitos de VRAM, por lo que cualquier planificacion de produccion requiere medicion propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Diveshj/sorghum-kernel-transfer
- GrainSet (Fan et al., Scientific Data 2023), parte de sorgo en Figshare: https://doi.org/10.6084/m9.figshare.22988981.v2
- GrainDet (Fan et al., IEEE Robotics and Automation Letters 2024): https://github.com/hellodfan/GrainDet
