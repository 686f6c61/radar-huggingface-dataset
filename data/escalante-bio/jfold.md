# escalante-bio/jfold

## Resumen

jfold es un repositorio de pesos convertidos de modelos de prediccion de estructura de proteinas, publicado por la organizacion escalante-bio. No se trata de un modelo entrenado desde cero, sino de una coleccion de checkpoints de terceros (Boltz-2, Protenix, Mol-1, OpenDDE, OpenFold3, ProMERA, BioEmu2 y ESMFold2, entre otros) reempaquetados en formato JAX/Equinox para su uso con la libreria jfold. El objetivo es ofrecer una via de inferencia libre de PyTorch para estos modelos biomoleculares, con pesos en safetensors legibles directamente con numpy.

El repositorio agrupa 24 checkpoints organizados en directorios independientes (`<name>/`), cada uno con un archivo `weights.safetensors` y un `model.json` que describe la estructura del modelo, las formas y dtypes de los tensores, y metadatos de procedencia (fuente original, SHA-256 del checkpoint convertido, version del paquete upstream y fecha de conversion). Los modelos ESMFold2 comparten los modelos de lenguaje ESMC, almacenados una sola vez (`esmc_6b`, `esmc_300m`, `esmc_600m`) y adjuntados dinamicamente por `pretrained.load`.

La relevancia actual del repositorio radica en que facilita el despliegue de modelos de prediccion estructural en stacks JAX, algo poco comun en este dominio, y en que preserva las licencias upstream (MIT y Apache-2.0 en la mayoria de entradas) junto con un archivo NOTICE que documenta la conversion. El tamano total del repositorio es de 56,6 GB, dominado por el checkpoint `esmc_6b` (25,4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Variable por modelo; los pesos estan reempaquetados para JAX/Equinox (jfold). Incluye modelos de prediccion de estructura proteica y de diseno de binders (Boltz-2, Protenix, ESMFold2, OpenFold3, etc.) |
| Parametros totales | No disponible (no se publica el recuento por modelo; el tamano de pesos oscila entre 0,4 GB y 25,4 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible como esquema de cuantizacion; los pesos se almacenan en los dtypes originales (float32 o bfloat16 segun el modelo) |
| Idiomas soportados | No disponible (modelos biomoleculares, no linguisticos) |
| Licencia | Mixta: MIT (Boltz-2, ProMERA, BioEmu2, ESMFold2, ESMC) y Apache-2.0 (Protenix, Mol-1, OpenDDE, OpenFold3); la ficha del repositorio declara `other` |
| Formato de pesos | safetensors + model.json (metadatos de estructura y procedencia) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: convierte checkpoints PyTorch de terceros a JAX/Equinox mediante `jfold.io.save`, que reordena los arrays y los vuelve a guardar sin modificar sus valores. Cada conversion se valida contra el modelo PyTorch original mediante los tests de checkpoint de jfold, y se registra el SHA-256 del checkpoint convertido junto con la version del paquete upstream y la fecha de conversion.

Las arquitecturas subyacentes son las de los modelos originales: Boltz-2 (prediccion de estructura y afinidad de union), la familia Protenix (tiny, mini, base, base_20250630 y v2), Mol-1, OpenDDE y su variante antibody-antigen, OpenFold3 (checkpoint `of3-p2-155k.pt` con pesos EMA), ProMERA, BioEmu2 (generacion de ensembles conformacionales) y la familia ESMFold2, que incluye variantes fast, experimental, experimental_cutoff2025 y tres checkpoints del barrido de escalado (base300M, base600M y base6B, todos en el paso 1500k). Los ESMFold2 comparten los modelos de lenguaje ESMC; la variante experimental los usa redondeados a bfloat16, tal como los ejecuta el codigo upstream.

## Capacidades

- Prediccion de estructura tridimensional de proteinas a partir de secuencia (ESMFold2, OpenFold3, Protenix).
- Prediccion de estructura de complejos proteina-ligando y afinidad de union (Boltz-2).
- Prediccion de estructura de complejos anticuerpo-antigeno (OpenDDE `opendde_abag`).
- Generacion de ensembles conformacionales y modelado de dinamica (BioEmu2).
- Diseno de binders biomoleculares (mencionado en la descripcion del proyecto jfold en GitHub).
- Embeddings proteicos mediante los modelos de lenguaje ESMC-300M, ESMC-600M y ESMC-6B.
- Ejecucion sobre JAX/Equinox sin dependencia de PyTorch en tiempo de inferencia.
- Carga programatica mediante `pretrained.load("<name>")`, con descarga automatica del directorio correspondiente en el primer uso.

## Casos de uso

- Prediccion de estructura proteica en pipelines de investigacion: cargar `esmfold2` o `openfold3` con `pretrained.load` permite obtener estructuras 3D en un stack JAX, util en entornos donde ya se usa JAX para otros calculos cientificos.
- Analisis de interacciones farmaco-diana: `boltz2` predice la estructura de complejos proteina-ligando y la afinidad de union, lo que sirve para priorizar candidatos en cribado virtual.
- Diseno de anticuerpos y validacion de pares anticuerpo-antigeno: `opendde_abag` esta especializado en esta modalidad y puede integrarse en flujos de ingenieria de anticuerpos.
- Generacion de ensembles conformacionales: `bioemu2` produce multiples conformaciones para estudiar flexibilidad y estados alternativos de una proteina.
- Extraccion de embeddings para modelos downstream: `esmc_300m`, `esmc_600m` y `esmc_6b` pueden alimentar clasificadores de funcion proteica, prediccion de mutaciones o busquedas de similitud.
- Barridos de escalado y ablaciones: los checkpoints `esmfold2_experimental_fast_base300m`, `base600m` y `base6b` (paso 1500k) permiten comparar el efecto del tamano del modelo de lenguaje en la calidad de prediccion.
- Portabilidad de stacks de inferencia: al estar en safetensors legibles con numpy y en Equinox, los pesos se pueden desplegar en infraestructura JAX sin arrastrar dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el tamano de pesos por modelo va de 0,4 GB (`protenix_tiny`) a 2,6 GB (`opendde_v1`, `opendde_abag`); `esmc_6b` ocupa 25,4 GB en float32 y requiere por si solo una GPU de gama alta o su uso en bfloat16.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano de los checkpoints, los modelos de 0,4-2,6 GB caben en GPUs de consumo con suficiente VRAM; `esmc_6b` en float32 excede la VRAM de la mayoria de GPUs de consumo.
- Cabe en GPU de consumo: probable para los checkpoints de menor tamano (Protenix tiny/mini, ESMFold2), aunque no se confirma en la documentacion.
- Opciones de despliegue: libreria jfold sobre JAX/Equinox; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jfold (repositorio) | No disponible (pesos de 0,4-25,4 GB) | No aplica | No disponible | Mixta: MIT / Apache-2.0 | Hugging Face (escalante-bio/jfold) |
| ESMFold2 (upstream, biohub) | No disponible | No aplica | No disponible | MIT | Hugging Face (biohub/ESMFold2) |
| Boltz-2 (upstream) | No disponible | No aplica | No disponible | MIT | Checkpoint `boltz2_conf.ckpt` |
| Protenix (upstream) | No disponible | No aplica | No disponible | Apache-2.0 | Checkpoints v0.5.0 / v1.0.0 |

La comparativa se limita a los modelos upstream de los que derivan los checkpoints; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- El repositorio no es un modelo unico: agrupa 24 checkpoints con arquitecturas, propositos y licencias distintas; es necesario revisar la licencia de cada subdirectorio antes de usarlo.
- La licencia declarada en la ficha es `other`; los pesos conservan las licencias upstream (MIT o Apache-2.0), documentadas en el archivo LICENSE de cada `<name>/`.
- No se publican parametros totales, contexto, benchmarks ni requisitos de hardware, lo que dificulta la evaluacion comparativa.
- Los modelos son biomoleculares, no linguisticos: no soportan generacion de texto, tool calling, agentes ni capacidades multilingues.
- Riesgo de alucinacion estructural: como cualquier predictor de estructura, las conformaciones generadas deben validarse experimentalmente; no se documentan tasas de error.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- Las conversiones se validan contra el modelo PyTorch original mediante los tests de jfold, pero no se detalla la cobertura ni el conjunto de validacion.
- El checkpoint `esmc_6b` (25,4 GB en float32) impone requisitos de memoria elevados y puede no ser viable en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/escalante-bio/jfold
- Repositorio jfold: https://github.com/escalante-bio/jfold
- Organizacion en GitHub: https://github.com/escalante-bio
- Traduccion JAX/Equinox de ESMFold2: https://github.com/escalante-bio/esmjfold2
