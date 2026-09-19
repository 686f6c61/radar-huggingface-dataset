# awatramani-lab/hmoe-da

## Resumen

hmoe-da es un clasificador de subtipos de neuronas dopaminérgicas (DA) para datos de secuenciación de ARN de célula única y núcleo único (scRNA-seq / snRNA-seq). Lo desarrolla el Awatramani Lab de la Northwestern University (Schonfeld et al., manuscrito en preparación) y asigna cada célula de un conjunto de datos en bruto a uno de 18 subtipos definidos en ratón, agrupados en tres familias: Sox6, Calb1 y Gad2. Es el mismo modelo empleado para etiquetar neuronas DA humanas en el conjunto de datos de Kamath et al. del manuscrito citado.

Técnicamente no es un modelo de lenguaje ni una red neuronal profunda en el sentido habitual: es un modelo jerárquico de mezcla de expertos (HMoE) compuesto por 34 puertas de regresión logística organizadas en un árbol, con un enrutador suave que reparte masa de probabilidad desde la raíz hasta las 18 hojas. Los pesos vienen incluidos en el propio paquete (~315 KB) y la inferencia es exclusivamente con numpy, sin torch y sin GPU.

Su relevancia práctica es doble: por un lado, publica pesos abiertos bajo licencia MIT para una tarea de anotación que normalmente se resuelve con transferencia de etiquetas propietaria o con modelos entrenados ad hoc; por otro, acepta `.h5ad` (AnnData) y Seurat `.rds`, se ejecuta en CPU y reproduce exactamente las predicciones cacheadas del manuscrito sobre el conjunto de Kamath, lo que lo hace auditable y reproducible sin infraestructura especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo jerarquico de mezcla de expertos (HMoE): arbol de 34 puertas de regresion logistica con enrutador suave (softmax por nodo) hasta 18 hojas |
| Parametros totales | no disponible (el bundle contiene 34 puertas logaritmicas; peso total del paquete ~315 KB) |
| Parametros activos | no aplica (no es un modelo MoE de red neuronal densa; todas las puertas del camino se evaluan) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es una matriz de celulas x genes) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (no procesa texto; la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | `child_models.npz` (34 puertas logreg), `meta.json` (arbol y estructura de puertas), `features.json` (eje de alineacion de 21.604 genes), `MANIFEST.json` (checksums sha256) |
| Genoma de referencia de genes | 21.604 genes en el eje de alineacion; simbolos genicos (no Ensembl), coincidencia insensible a mayusculas, fallback de ortologos ZNF -> Zfp |
| Numero de clases de salida | 18 subtipos, 3 familias (Sox6, Calb1, Gad2) |
| Entrada admitida | `.h5ad` (AnnData) y `.rds` de Seurat / SingleCellExperiment |
| Salidas anadidas | `hmoe_subtype`, `hmoe_family`, `hmoe_confidence`, `hmoe_margin`, `hmoe_confident`, `hmoe_gad2_excluded`, matriz `adata.obsm["X_hmoe_P_sub"]` (n x 18) |
| Repositorio | 0,0 GB (los pesos van empaquetados en el wheel de `hmoe-da`) |

## Arquitectura y entrenamiento

El modelo es un enrutador jerarquico suave. En cada nodo del arbol, una puerta de regresion logistica aplica un softmax sobre sus hijos y la masa de probabilidad fluye hacia abajo hasta las 18 hojas. Las puertas superficiales operan sobre recuentos en bruto (raw UMI counts); las puertas profundas operan sobre residuos de Pearson de SCT calculados internamente a partir de los recuentos en bruto con theta = 100. La salida es una matriz de probabilidades normalizada por fila (n x 18) y la etiqueta por celula es su argmax. Los detalles de entrenamiento (numero de celulas, composicion del dataset, si hubo ajuste fino o validacion cruzada) no estan disponibles en la informacion proporcionada; la model card solo indica que las puertas se ajustaron sobre recuentos UMI en bruto y que el modelo fuente del bundle se denomina `v4_improved_unified`.

El aspecto mas destacable en terminos de ingenieria no es la arquitectura sino el empaquetado: `scripts/convert_weights.py` regenera el bundle desde el repositorio del estudio (unico paso que requiere torch) y `scripts/verify_parity.py` verifica que el paquete reproduce las predicciones cacheadas del manuscrito sobre el conjunto de Kamath de forma exacta en etiquetas y con error menor a 1e-5 en P_sub. La inferencia final no depende de torch ni de GPU: solo numpy, scipy, anndata y scikit-learn.

## Capacidades

- Anotacion de subtipos de neuronas dopaminergicas: asigna cada celula a uno de 18 subtipos etiquetados como `Sox6:Vcan`, `Calb1:Sulf1`, etc., e informa de la familia (`Sox6`, `Calb1`, `Gad2`).
- Cuantificacion de la incertidumbre por celula: devuelve `hmoe_confidence` (probabilidad del subtipo ganador), `hmoe_margin` (diferencia top1 - top2) y un flag `hmoe_confident` basado en GMM.
- Matriz de probabilidad completa: expone la distribucion n x 18 en `adata.obsm["X_hmoe_P_sub"]`, lo que permite analisis posteriores (mezclas, dobles asignaciones, umbrales propios).
- Excision de la familia Gad2: con `include_gad2=False`, cualquier celula cuya mejor llamada sea un subtipo Gad2 se reasigna a su mejor subtipo no Gad2 y se marca en `hmoe_gad2_excluded`; util en datos ordenados TH+/SLC6A3+ donde no se espera poblacion GABAergica.
- Compatibilidad interespecie: acepta simbolos genicos en mayusculas (humano) y en formato Title (raton), con coincidencia insensible a mayusculas y fallback de ortologos ZNF -> Zfp.
- Entrada desde dos ecosistemas: lee `.h5ad` directamente y `.rds` de Seurat invocando a R con SeuratObject instalado.
- Uso como CLI y como aplicacion web: `hmoe-da predict entrada.h5ad -o labeled.h5ad --csv labels.csv`, y una interfaz de arrastrar y soltar en Hugging Face Spaces.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, vision, audio ni generacion de texto: es un clasificador supervisado de una unica tarea.

## Casos de uso

- Anotacion de atlas de neuronas DA: dado un `.h5ad` con recuentos en bruto de mesencefalo, el modelo etiqueta cada celula en minutos y en CPU, lo que permite anotar atlas completos sin depender de transferencia de etiquetas manual ni de un cluster GPU.
- Analisis de subpoblaciones en estudios de Parkinson: al separar Sox6, Calb1 y Gad2 se pueden comparar proporciones de subtipos entre donantes sanos y enfermos con una taxonomia fija y reproducible, en lugar de etiquetas derivadas de clustering que cambian entre ejecuciones.
- Control de calidad y filtrado de datos ordenados: en datasets TH+/SLC6A3+ donde no se espera poblacion GABAergica, ejecutar con `--exclude-gad2` y revisar `hmoe_gad2_excluded` sirve para detectar contaminacion o dobletes.
- Reanotacion retrospectiva de datos publicos: como reproduce exactamente las predicciones del manuscrito (parity verificado), se puede aplicar a conjuntos humanos ya publicados y comparar etiquetas con las de la publicacion original.
- Integracion en pipelines de analisis en Python: la funcion `predict(adata)` modifica el objeto AnnData in situ, de modo que `hmoe_subtype` queda disponible para `scanpy` y para agrupaciones posteriores (DE, trayectorias, composicion) sin conversion de formatos.
- Flujo de trabajo en R / Seurat: equipos que trabajan en R pueden invocar la CLI sobre `.rds` (requiere R y SeuratObject en el sistema) y reincorporar el CSV de etiquetas a su objeto Seurat.
- Analisis sin codigo en laboratorio humedo: la aplicacion web del Space permite a personal no bioinformatico arrastrar un `.h5ad` o `.rds` y descargar un CSV etiquetado.
- Validacion cruzada de anotaciones existentes: comparar los subtipos HMoE con los obtenidos por otras vias (marcadores, clustering) para cuantificar discrepancias mediante `hmoe_confidence` y `hmoe_margin`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otras herramientas de anotacion (ni exactitud, ni F1, ni matrices de confusion), y los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo: las unicas entradas devueltas pertenecen a un sitio de recursos educativos en turco, sin ninguna relacion con hmoe-da, con scRNA-seq ni con el Awatramani Lab.

Los unicos datos cuantitativos de rendimiento disponibles en la informacion proporcionada son los siguientes:

| Verificacion | Resultado declarado |
|---|---|
| Paridad de etiquetas con las predicciones cacheadas del manuscrito (conjunto de Kamath) | Exacta |
| Paridad de la matriz de probabilidad P_sub | Error < 1e-5 |
| Eje de alineacion de genes | 21.604 genes |
| Numero de puertas logisticas | 34 |
| Clases de salida | 18 subtipos en 3 familias |
| Tiempo de inferencia | no disponible |
| Throughput (celulas/s) | no disponible |

## Requisitos de hardware

- GPU: no necesaria. La inferencia es unicamente numpy y no usa torch, CUDA ni aceleradores.
- VRAM estimada: 0 GB (no aplica).
- CPU: cualquier procesador moderno es suficiente; el cuello de botella es la memoria, no el computo.
- Memoria RAM: el paso de residuos SCT materializa una matriz densa de celulas x genes, por lo que el pico de memoria crece con el numero de celulas. La model card indica que es manejable para unos pocos miles de celulas y que ~20.000 celulas requieren varios GB. Para 21.604 genes y 20.000 celulas, la matriz densa en float64 rondaria los 3,5 GB solo en esa estructura.
- GPUs consumer: irrelevantes para este modelo; no se beneficia de RTX 4090, A100 ni H100.
- Opciones de despliegue: paquete pip `hmoe-da` (nucleo: numpy, scipy, anndata, scikit-learn); extra `hmoe-da[io]` anade scanpy para la CLI y la lectura de `.h5ad`; aplicacion local con `python app.py`; Hugging Face Space para uso sin codigo. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Dependencia externa: la lectura de `.rds` requiere que el sistema tenga R instalado con SeuratObject; en su defecto hay que convertir a `.h5ad` con `sceasy` o `SeuratDisk`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no menciona alternativas (CellTypist, scANVI, transferencia de etiquetas de Seurat, scmap ni clasificadores especificos de neuronas DA) ni ofrece cifras frente a ellas, y la busqueda web no aporto resultados relacionados con el modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmoe-da | 34 puertas logisticas (bundle ~315 KB) | no aplica | no disponible (solo paridad con el manuscrito) | MIT | Pesos abiertos, pip, Space |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo recuentos en bruto: las puertas superficiales se ajustaron sobre recuentos UMI crudos. Datos normalizados, log-transformados o escalados producen etiquetas silenciosamente erroneas. `predict` rechaza entradas que no sean enteros no negativos salvo que se pase `assume_raw=True`; conviene no forzarlo.
- Taxonomia definida en raton aplicada a humano: los 18 subtipos se definieron en raton. La model card afirma que el modelo se uso para etiquetar neuronas DA humanas, pero no se documenta en la informacion proporcionada una validacion cuantitativa de la transferencia entre especies.
- Nomenclatura de genes: se esperan simbolos genicos, no identificadores Ensembl. Genes ausentes en el panel se rellenan con ceros; la cobertura se reporta en `adata.uns["hmoe_gene_coverage"]` y debe revisarse antes de interpretar resultados. El fallback de ortologos se limita a ZNF -> Zfp.
- Alcance restringido: el modelo solo clasifica neuronas dopaminergicas (y opcionalmente la familia Gad2). No es una herramienta de anotacion general de tipos celulares y no debe aplicarse a otros tejidos o poblaciones sin validacion previa.
- Riesgo de sobreconfianza: las salidas incluyen `hmoe_confidence`, `hmoe_margin` y el flag GMM `hmoe_confident`, pero la informacion disponible no documenta la calibracion de esas probabilidades ni umbrales recomendados. Es prudente tratar las llamadas de baja confianza como inciertas y no como errores.
- Consumo de memoria: el calculo de residuos SCT materializa una matriz densa celulas x genes. Con ~20.000 celulas se necesitan varios GB. La propia model card indica que una version futura podria trocear el calculo por celulas, ya que el residuo es independiente por celula.
- Dependencia de R para `.rds`: sin R y SeuratObject en el sistema, la lectura de ficheros de Seurat falla; la alternativa es convertir a `.h5ad` previamente.
- Madurez: los pesos acompanan a un manuscrito en preparacion (Schonfeld et al.), por lo que no hay todavia articulo con revision por pares que describa el metodo completo. La procedencia es trazable (checksums sha256, manifiesto, paridad verificada), pero la validacion independiente es escasa.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y no se han encontrado referencias externas en la busqueda web.
- Licencia: MIT, permisiva y sin restricciones declaradas para uso comercial. Conviene citar a Schonfeld et al. (Awatramani Lab, Northwestern University) segun lo indicado en la model card.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/awatramani-lab/hmoe-da
- Aplicacion web (Hugging Face Space): https://huggingface.co/spaces/elanschonfeld/hmoe-da
- Paquete en PyPI: https://pypi.org/project/hmoe-da/
- Manuscrito de referencia: Schonfeld et al., en preparacion (Awatramani Lab, Northwestern University); sin enlace disponible.
- Conjunto de datos de validacion citado: Kamath et al.; sin enlace disponible en la informacion proporcionada.
- Articulo con revision por pares, repositorio de codigo del estudio y demo adicional: no disponibles.
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre hmoe-da, scRNA-seq o neurociencia; las entradas devueltas apuntan a webdeogren.com y no guardan relacion con el modelo.
