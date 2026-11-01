# microbiome-informatics/sanntis

## Resumen

SanntiS es un sistema de deteccion de clusters genicos biosinteticos (BGC, biosynthetic gene clusters) en secuencias procariotas y eucariotas. Lo desarrolla el grupo Finn-Lab (microbiome-informatics) y se distribuye como un bundle de modelos dentro de la libreria `sanntis`. No es un modelo de lenguaje: es un pipeline de anotacion biologica que toma anotaciones de dominios proteicos producidas por InterProScan y predice regiones genomicas que codifican metabolitos secundarios, asignando ademas una clase MIBiG y rutas y superclases NPClassifier del producto esperado.

El bundle combina tres componentes: un detector de tokens basado en Conv1D + BiLSTM entrenado con 3 semillas, un post-filtro RandomForest con cabeza de clasificacion MIBiG, y un ensamblado NPClassifier (RandomForest + regresion logistica + kNN). Trabaja sobre un vocabulario de 6422 tokens derivado de 14 bases de datos miembro de InterPro (Pfam, NCBIfam, SFLD, SUPERFAMILY, Gene3D, HAMAP, Coils, CDD, PRINTS, PIRSF, PrositeProfiles, PrositePatterns, MobiDBLite, SMART) con InterProScan 6.0.3.0 e InterPro 107.0.

Su relevancia actual esta en la deteccion a escala de BGCs en genomas y metagenomas, incluyendo eucariotas (hongos y protistas) donde antiSMASH tiene cobertura mas limitada, y en la posibilidad de ejecutarse sin contenedores si se aportan las anotaciones InterProScan precalculadas. La version del bundle es 1.0.0b1, con licencia Apache 2.0 y un repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Conv1D + BiLSTM (3 semillas) + post-filtro RandomForest con cabeza MIBiG + ensamblado NPClassifier (RandomForest + regresion logistica + kNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre regiones genomicas y sus tokens InterProScan) |
| Tipos de cuantizacion | no aplica; pesos en safetensors, modelos sklearn en skops y referencia kNN en npz disperso |
| Idiomas soportados | no aplica (entrada biologica: FASTA nucleotidico, GenBank, FASTA proteico + GFF3, TSV de InterProScan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (detectores), skops (sklearn), npz disperso (kNN); `manifest.json` con sha256 por fichero |

Otros parametros del bundle: version `sanntis` 1.0.0b1, fit `production`, vocabulario de 6422 tokens (incluye 3 especiales), detector de 3 semillas y 8 epocas (epoca mediana mejor en validacion cruzada), punto de operacion t* = 0.3 con histeresis baja de 0.15 (maximo F2_macro en validacion con precision BGC >= 0.80), post-filtro RF que descarta regiones con P(no-BGC) >= 0.8.

## Arquitectura y entrenamiento

El detector es una red neuronal que procesa la secuencia de tokens InterProScan de cada gen: una pila Conv1D seguida de BiLSTM, entrenada con 3 semillas independientes y 8 epocas. Sobre las predicciones del detector se aplica un post-filtro RandomForest que elimina regiones con probabilidad de no ser BGC superior o igual a 0.8, y una cabeza de clasificacion MIBiG. En paralelo, un ensamblado NPClassifier (RandomForest + regresion logistica + kNN sobre referencia dispersa) predice ruta y superclase del producto. La decision de region se toma con umbral t* = 0.3 y umbral bajo de histeresis 0.15, seleccionado para maximizar F2_macro en validacion manteniendo precision BGC >= 0.80.

Los datos de entrenamiento se publican como `microbiome-informatics/sanntis-training-data` con las etiquetas `mibig-5.0rc1-train`, `negatives-v1` y `npclassifier-v1`. Positivos: 2795 BGCs externos en formato MIBiG, deduplicados con Dice compuesto >= 0.974 (se conserva el mas largo), excluyendo loci de mas de 200 kb y loci sin CDS. Negativos: pool genomico v1 (GTDB r226 y representantes eucariotas de RefSeq, con los BGC nativos eliminados mediante antiSMASH 8.0.1), en forma de fragmentos de longitud equiparable y piezas de fondo libres de BGC. Entidades: 4233 de fondo eucariota, 30077 de fondo procariota, 1608 fragmentos eucariotas, 6447 fragmentos procariotas, 536 positivos eucariotas y 2149 positivos procariotas. El entrenamiento corresponde al objetivo 01 del repositorio `sanntisv1-data-and-analysis`, con informe de validacion out-of-fold en `report/`.

## Capacidades

- Deteccion de clusters genicos biosinteticos en secuencias procariotas (FASTA nucleotidico con llamada de genes via pyrodigal) y eucariotas (GenBank con traducciones CDS, o FASTA proteico con GFF3 de sus CDS).
- Acepta anotaciones InterProScan 5.76+ o 6.x precalculadas en TSV, lo que permite ejecucion sin contenedores.
- Asignacion de clase MIBiG a cada region detectada.
- Prediccion de ruta y superclase NPClassifier del producto, con puntuaciones por region y aviso `npc_pathway_key_domains_unsupported` cuando la ruta llamada carece de los dominios clave en la region.
- Salida en GFF3 con una feature `CLUSTER` por region (campos `bgc_class`, `p_non_bgc`, `npc_pathway`, `npc_superclass`, `npc_pathway_key_domains_unsupported`), puntuaciones por CDS, tabla de regiones y JSON para el sideloader de antiSMASH.
- Integracion programatica via `SanntisModel.from_pretrained(...)` y `Predictor`.
- Verificacion de integridad de todos los ficheros mediante `manifest.json` (sha256) al cargar.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: no es un modelo generativo.

## Casos de uso

- Anotacion de genomas bacterianos completos: se ejecuta `sanntis predict genome.fna --container-engine docker` y se obtiene un GFF3 con las regiones BGC, su clase MIBiG y la ruta NPClassifier, util como primer paso en pipelines de mineria genomica.
- Cribado de metagenomas y MAGs: al trabajar sobre fragmentos y no requerir contexto largo, permite procesar ensamblajes fragmentados y priorizar regiones candidatas antes de validacion experimental.
- Deteccion en hongos y protistas: el modelo incluye negativos eucariotas (fondo eucariota de 4233 entidades) y acepta FASTA proteico con GFF3, lo que cubre un nicho donde antiSMASH tiene menor cobertura.
- Integracion en pipelines HPC sin contenedores: con un TSV de InterProScan precalculado, `sanntis predict assembly.gbk --ips-tsv interproscan.tsv` evita el coste de ejecutar InterProScan 6 y sus 14 bases de datos miembro en cada iteracion.
- Visualizacion en antiSMASH: la salida JSON para el sideloader permite cargar las regiones detectadas por SanntiS en una instancia de antiSMASH y compararlas con las llamadas nativas.
- Curacion de librerias de BGCs: la cabeza MIBiG y las puntuaciones por CDS permiten clasificar y priorizar candidatos para bases de datos internas o para entrenamiento de modelos posteriores.
- Analisis de novedad: la comparacion con MIBiG y el aviso de dominios clave no soportados ayudan a separar BGCs cercanos a lo conocido de candidatos potencialmente novedosos que requieren revision manual.

## Benchmarks y rendimiento

Metricas en espacio ORF. Validacion = predicciones out-of-fold agrupadas sobre los datos de entrenamiento.

| Dataset | Precision_T | Recall_macro_T | F1_macro_T | Precision BGC | Recall macro BGC | F2_macro |
|---|---|---|---|---|---|---|
| Validacion (CV, OOF agrupado) | 0.698 | 0.875 | 0.776 | 0.882 | 0.926 | 0.917 |

El informe completo con intervalos de confianza y figuras esta en `report/report.md` del repositorio `sanntisv1-data-and-analysis`. No se han publicado resultados de benchmarks frente a antiSMASH u otras herramientas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,1 GB, por lo que el bundle de modelos es pequeno y cabe holgadamente en cualquier GPU consumer; el coste dominante es la anotacion InterProScan, no la inferencia.
- GPU recomendadas: no se especifican en la informacion disponible. Para la fase InterProScan se recomienda ejecutar en nodos con CPU suficiente y, opcionalmente, GPU para las busquedas HMM; el detector Conv1D + BiLSTM y los modelos sklearn pueden ejecutarse en CPU.
- Cabe en GPU consumer: si, el bundle de modelos es de 0,1 GB; el cuello de botella es InterProScan 6 con las 14 bases de datos miembro.
- Opciones de despliegue: CLI `sanntis` (con `--container-engine docker` o con TSV precalculado), API Python (`SanntisModel`, `Predictor`), y salida compatible con el sideloader de antiSMASH.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Cobertura eucariota | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SanntiS 1.0.0b1 | Detector supervisado (Conv1D + BiLSTM + RF + NPClassifier) | Tokens InterProScan, requiere anotacion previa | Hongos y protistas (sin plantas) | Apache 2.0 | HuggingFace + GitHub |
| antiSMASH 8.0.1 | Pipeline de reglas + HMM | Reglas especificas por clase de BGC | Limitada en eucariotas | Open source (consultar) | Web + CLI |
| Otros detectores basados en deep learning | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con antiSMASH 8.0.1, usado en la propia construccion de negativos del dataset. No se dispone de datos de benchmarks cruzados entre SanntiS y antiSMASH en la informacion disponible.

## Limitaciones y advertencias

- Dependencia estricta de InterProScan: los tokens provienen de hits de las bases de datos miembro; anotaciones de otras versiones de InterProScan o InterPro provocan deriva en las predicciones (sanntis avisa y reporta QC de cobertura). Los genes sin anotar no aportan senal.
- Los negativos eucariotas cubren solo hongos y protistas, sin plantas; las estimaciones de BGC en plantas son anecdoticas.
- Las familias de BGC con baja similitud a MIBiG se recuperan peor que las casi duplicadas; el analisis de novedad esta en el repositorio `sanntisv1-data-and-analysis`.
- `p_non_bgc` y las puntuaciones NPClassifier son puntuaciones del modelo, no probabilidades calibradas; los niveles de abstencion de NPC apuntan a precision 0.9 / 0.8 en validacion.
- `npc_pathway_key_domains_unsupported` es una pista, no un veredicto: una ruta llamada sin ninguno de sus dominios clave suele ser incorrecta mas a menudo, pero la mayoria de llamadas erroneas si llevan los dominios (hibridos, tailoring). Las rutas con baja cobertura de reglas en CV aparecen como `na`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de InterProScan y de las bases de datos miembro (algunas, como Gene3D o PRINTS, tienen terminos propios) antes de desplegar en produccion.
- Version 1.0.0b1 (beta): el esquema de salida y el punto de operacion pueden cambiar entre revisiones; fijar siempre la revision concreta (`--model <repo>@<revision>`).
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microbiome-informatics/sanntis
- Dataset de entrenamiento: https://huggingface.co/datasets/microbiome-informatics/sanntis-training-data
- Repositorio SanntiS (Finn-Lab): https://github.com/Finn-Lab/SanntiS
- Seccion de datos de entrenamiento del README: https://github.com/Finn-Lab/SanntiS#training-data
- Repositorio de datos y analisis: `sanntisv1-data-and-analysis` (informe en `report/report.md`)
- Articulo: Sanchez et al., "Expansion of novel biosynthetic gene clusters from diverse environments using SanntiS", bioRxiv 2023, doi:10.1101/2023.05.23.540769 — https://doi.org/10.1101/2023.05.23.540769
