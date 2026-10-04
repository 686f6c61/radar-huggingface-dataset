# carbon-lab/optical-cupc

## Resumen

`carbon-lab/optical-cupc` no es un modelo de inteligencia artificial, sino un paquete de datos cientificos publicado en HuggingFace Hub como material complementario del articulo "Quantitative and bond-traceable resonant X-ray optical tensors of organic molecules" (arXiv:2509.01734, DOI 10.1103/rfgg-ffyz). Lo firma el WSU Carbon Lab (Victor Murcia, Obaid Alqahtani, Harlan Heilman y Brian A. Collins) y contiene tablas de palos (sticks) de DFT, componentes tensoriales opticos, gaussianas de agrupamiento (clustering), geometrias y ficheros de entrada/salida del codigo StoBe para los 16 centros de carbono no equivalentes de la ftalocianina de cobre (CuPc).

El paquete acompana a la libreria `dft-learn` (release v1.1) y actua como deposito reproducible de los datos que sustentan el analisis de tensores opticos resonantes de rayos X, con espectros NEXAFS/XAS resueltos en angulo. La relevancia es de tipo cientifico y de reproducibilidad: permite recalcular, reajustar y reutilizar los datos sin depender del codigo original.

Al no contener pesos de red neuronal, no procede hablar de arquitectura, parametros, contexto ni cuantizacion; los campos correspondientes de la ficha se marcan como "no aplica". El repositorio declara licencia GPL-2.0 y, en la fecha de consulta, 0 descargas y 0 "likes". La metadata del Hub indica un tamano de repo de 0.0 GB, dato que probablemente esta truncado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (paquete de datos, no red neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no aplica; la documentacion y los metadatos estan en ingles |
| Licencia | GPL-2.0 |
| Formato de pesos | no aplica; formatos de datos: CSV, XYZ, CIF, `.inp`/`.out` (StoBe), `.pxp` (Igor), `.ipf` (Igor), JSON |
| Tipo de artefacto | dataset / companion data pack |
| Autor | carbon-lab (WSU Carbon Lab) |
| Libreria asociada | `dft-learn` v1.1 |
| Pipeline declarado | `other` |
| Tamano del repo | 0.0 GB segun metadata del Hub (valor aparentemente truncado; no disponible el tamano real) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |
| Sistema quimico | CuPc (ftalocianina de cobre) sobre CuI y sobre Si |
| Codigo de calculo | StoBe (DFT para espectroscopia de rayos X) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido es un volcado de resultados de calculos DFT y de su ajuste posterior: tablas de palos (sticks) isotropos y por componentes del tensor, gaussianas de agrupamiento, parametros `pWave1D` en su version inicial y refinada, y espectros NEXAFS resueltos en angulo ya editados. Se incluyen tambien las geometrias de la molecula en XYZ y CIF, junto con un mapa de indices de los centros de excitacion C1 a C16, es decir, los 16 atomos de carbono no equivalentes por simetria en la CuPc.

La parte de calculo electronico se organiza por sitio: `data/dft/sites/c{1..16}/` contiene paquetes StoBe con ficheros `cNgnd.inp`, `XrayT001.out` y `cNxas.out` para cada carbono. El README indica explicitamente que los arboles completos de SCF (`.out`) se han omitido, de modo que el paquete no es autocontenido para reproducir el SCF desde cero. Se anaden CSV de polarizacion del Atlas para las muestras CuPc/CuI en modo TRANS y CuPc/Si en modo TEY, figuras curadas de Igor (`.pxp`) y procedimientos `.ipf` de agrupamiento y filtrado. Un `data/manifest.json` registra ruta, tamano y hash corto de contenido de cada fichero, lo que facilita verificacion de integridad en pipelines.

## Capacidades

- No es un modelo generativo: no produce texto, codigo, imagenes ni predicciones en inferencia.
- Almacena y distribuye resultados DFT de espectroscopia de rayos X (NEXAFS/XAS) para CuPc.
- Proporciona tensores opticos resonantes anisotropos e isotropos en forma de tablas CSV.
- Incluye ajuste de parametros `pWave1D` (valores iniciales y refinados) para comparacion de metodologias.
- Aporta espectros experimentales de referencia enlazados desde Zenodo (CuPc/CuI en TRANS y CuPc/Si en TEY) y desde el Atlas de WSU.
- Incluye utilidades de agrupamiento y filtrado de espectros implementadas como procedimientos de Igor (`.ipf`).
- Proporciona geometria molecular y mapeo de sitios de carbono C1-C16 para trazabilidad enlace a enlace.
- Facilita verificacion de integridad mediante `data/manifest.json` con hashes de contenido.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (son conceptos inaplicables a un paquete de datos).

## Casos de uso

- Validacion de calculos DFT de NEXAFS: cargar `data/csv/cupc_sticks_tensor.csv` y comparar los palos calculados con los espectros experimentales enlazados en Zenodo para CuPc/CuI y CuPc/Si, aislando discrepancias por sitio de carbono.
- Entrenamiento y evaluacion de modelos de machine learning quimico: los CSV de palos, gaussianas y parametros refinados sirven como conjunto de referencia (ground truth) para la libreria `dft-learn` v1.1 o para modelos propios que predigan espectros a partir de estructura.
- Analisis de orientacion molecular: los CSV de polarizacion del Atlas para TRANS y TEY permiten estudiar el empaquetamiento brickstone (CuPc/CuI) frente a herringbone (CuPc/Si) a partir de la dependencia angular de la senal.
- Agrupamiento de espectros por entorno quimico: los procedimientos `.ipf` de clustering permiten agrupar las contribuciones de los 16 sitios de carbono y detectar grupos de entornos electronicamente similares.
- Reproducibilidad y procedencia en publicaciones: el paquete fija versiones de datos con hashes en `manifest.json`, de modo que una publicacion posterior puede citar hashes concretos en lugar de resultados volatiles.
- Docencia y divulgacion de espectroscopia de rayos X: el Space `carbon-lab/cupc-optical-model` y las figuras `.pxp` permiten explorar visualmente la relacion entre estructura local y espectro sin ejecutar calculos DFT.
- Integracion en pipelines de datos cientificos: las URLs estaticas por `resolve/main` permiten descargar CSV y geometrias con `requests` o `curl` sin necesidad del SDK de HuggingFace.
- Benchmarking de codigos de estructura electronica: los ficheros StoBe por sitio (`cNgnd.inp`, `XrayT001.out`, `cNxas.out`) permiten comparar implementaciones alternativas sobre el mismo sistema y el mismo conjunto de sitios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Se trata de un paquete de datos sin metricas de evaluacion asociadas en la model card; no procede comparar con MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- No requiere GPU. No hay inferencia ni pesos que cargar; el cuello de botella es de E/S y de memoria para cargar CSV y ficheros de texto.
- CPU suficiente para el uso previsto: `pandas` y `huggingface_hub` son las unicas dependencias declaradas en el ejemplo de carga.
- VRAM estimada: 0 GB (no aplica).
- GPU recomendadas: no aplica. No hay ninguna GPU recomendada en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: descarga directa por `hf_hub_download`, URLs estaticas `resolve/main`, o clonado del repositorio; no consta soporte de vLLM, llama.cpp, Ollama ni TGI, que son inaplicables.
- Almacenamiento: el Hub declara 0.0 GB, valor no fiable; el tamano real puede consultarse en `data/manifest.json`, que registra tamano por fichero. No disponible en esta ficha.
- Latencia y throughput: no aplica; el tiempo de carga dependera del analisis concreto del usuario.
- Demo accesible sin instalacion local: Space `carbon-lab/cupc-optical-model`.

## Comparativa con modelos similares

No disponible. No hay en la informacion proporcionada otros paquetes de datos comparables (mismo sistema quimico, mismo codigo DFT o mismo tipo de tensores opticos) con los que contrastar parametros, contexto o licencia. Los depositos de Zenodo citados no son alternativas comparables, sino los espectros experimentales de referencia asociados al mismo trabajo.

## Limitaciones y advertencias

- No es un modelo: cualquier uso esperado de generacion, razonamiento o inferencia neural queda fuera de su alcance.
- Los arboles completos de SCF (`.out`) se omiten deliberadamente, por lo que el paquete no permite reproducir el calculo desde el estado inicial sin ejecutar StoBe de nuevo.
- Los resultados DFT dependen del funcional de intercambio y correlacion, de la base y de la configuracion de calculo; la model card no detalla estos parametros en la informacion disponible, lo que limita la comparacion con calculos de terceros.
- Repositorio con 0 descargas y 0 "likes" en la fecha indicada: no hay validacion por parte de la comunidad y tampoco issues publicas conocidas.
- La fecha de creacion registrada (2026-10-03) es coherente con la publicacion del articulo, pero conviene no asumir mantenimiento continuado del repositorio.
- Licencia GPL-2.0: es una licencia copyleft. Reutilizar el contenido en un producto derivado puede obligar a liberar el trabajo derivado bajo los mismos terminos; conviene revisar la compatibilidad antes de integrarlo en software propietario o en pipelines cerrados.
- La metadata del Hub indica un tamano de repo de 0.0 GB; si se planifica un espejo o una copia local, hay que verificar el tamano real a partir del manifiesto.
- Ausencia de resultados de benchmarks y de metricas de error frente a experimento en la informacion disponible: no se puede cuantificar la fidelidad del conjunto sin leer el articulo asociado.
- Riesgo de sesgo: se limita a un unico sistema quimico (CuPc) sobre dos sustratos (CuI y Si) y a un unico codigo DFT; no debe generalizarse a otras moleculas organicas sin validacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/carbon-lab/optical-cupc
- Articulo en arXiv: https://arxiv.org/abs/2509.01734
- Pagina del articulo en HuggingFace Papers: https://huggingface.co/papers/2509.01734
- DOI de PRL: https://doi.org/10.1103/rfgg-ffyz
- Demo interactiva (Space): https://huggingface.co/spaces/carbon-lab/cupc-optical-model
- Libreria `dft-learn`: https://github.com/WSU-Carbon-Lab/dft-learn
- Release v1.1 de `dft-learn`: https://github.com/WSU-Carbon-Lab/dft-learn/releases/tag/v1.1
- Espectro experimental CuPc sobre CuI (TRANS, empaquetamiento brickstone), Atlas: https://xrayatlas.wsu.edu/d/fekpakf0
- Espectro experimental CuPc sobre CuI, Zenodo: https://doi.org/10.5281/zenodo.21299145
- Espectro experimental CuPc sobre Si (TEY, empaquetamiento herringbone), Atlas: https://xrayatlas.wsu.edu/d/4hdtjecp
- Espectro experimental CuPc sobre Si, Zenodo: https://doi.org/10.5281/zenodo.21299147
- Fichero de ejemplo (URL estatica): https://huggingface.co/carbon-lab/optical-cupc/resolve/main/data/csv/cupc_sticks_tensor.csv
- Geometria de ejemplo (URL estatica): https://huggingface.co/carbon-lab/optical-cupc/resolve/main/data/geometry/CuPc.xyz
- Busqueda web: los resultados devueltos corresponden a paginas divulgativas sobre el elemento quimico carbono (Wikipedia, Britannica, Chemistry Learner), a la revista *Carbon* de Elsevier y a un fabricante de paneles solares. Ninguno guarda relacion con este repositorio, por lo que no se incluyen como fuentes.
