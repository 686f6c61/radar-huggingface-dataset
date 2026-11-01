# RUIMA294264/Mol-1

## Resumen

Mol-1 es un modelo de predicción estructural de proteínas desarrollado por Molence, distribuido bajo licencia Apache-2.0 y publicado originalmente en GitHub en la versión v1.0.0 (commit `7480cc41a7c64b5c517709184bdc81c08dbd5fdb`). El repositorio analizado, `RUIMA294264/Mol-1`, es un espejo no oficial byte a byte pensado para acelerar la descarga desde China continental mediante `hf-mirror.com`; no introduce modificaciones sobre los pesos ni sobre los datos de referencia del autor original.

El checkpoint base (`checkpoint/mol-1-base.pt`) ocupa 2.393.615.173 bytes, lo que sitúa al modelo en el orden de los 2.400 millones de parámetros en precisión de 8 bits o en torno a los 1.200 millones en fp16, aunque el dato exacto de parámetros no se especifica en la información disponible. El modelo se acompaña de componentes CCD, datos de referencia de clustering y fechas de release, y una base de secuencias `pdb_seqres_20261001.fasta` para búsqueda de plantillas, lo que indica un pipeline híbrido de búsqueda de homólogos y predicción neuronal.

La relevancia actual de Mol-1 reside en su enfoque de predicción estructural con búsqueda de plantillas sobre PDB, un patrón similar al de AlphaFold2, pero empaquetado como herramienta CLI (`mol pred`) con licencia permisiva y espejo accesible. No se dispone de información sobre benchmarks, idiomas, cuantizaciones ni arquitectura interna detallada en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de predicción estructural de proteínas; pipeline con búsqueda de plantillas sobre PDB) |
| Parametros totales | no disponible (checkpoint base de 2.393.615.173 bytes) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre secuencias de aminoácidos) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), más componentes auxiliares `.cif`, `.pkl`, `.json`, `.fasta`, `.csv` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de atención, módulos de estructura, etc.). Por los artefactos que acompañan al checkpoint se deduce un pipeline de predicción estructural de proteínas que combina: (1) una base de secuencias de referencia `pdb_seqres_20261001.fasta` para búsqueda de plantillas, (2) componentes CCD (`components.cif` y su versión procesada con RDKit `components.cif.rdkit_mol.pkl`), (3) datos de clustering de entidades (`clusters-by-entity-40.txt`) y (4) cachés de fechas de release y mapeos de obsoletos (`release_date_cache.json`, `obsolete_to_successor.json`, `obsolete_release_date.csv`). Este conjunto es característico de modelos tipo AlphaFold2/OpenFold que realizan búsqueda de homólogos contra PDB y aplican recortes por fecha de release para evitar fuga de datos en evaluación.

No se especifican en la documentación el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino por preferencias (poco habituales en modelos de estructura). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El código de referencia está disponible en el archivo `source/mol-1-7480cc41a7c64b5c517709184bdc81c08dbd5fdb.tar.gz` y en el repositorio upstream de GitHub, que es donde debería consultarse cualquier detalle arquitectónico.

## Capacidades

- Predicción de estructura de proteínas a partir de secuencia, mediante el comando `mol pred` o `python -m mol.runner.inference`.
- Búsqueda de plantillas contra la base de secuencias PDB (`pdb_seqres_20261001.fasta`), lo que permite aprovechar estructuras homólogas conocidas.
- Manejo de componentes químicos no estándar a través de los componentes CCD procesados con RDKit.
- Filtrado por fecha de release y gestión de entradas obsoletas de PDB, útil para evaluaciones sin fuga de datos.
- Ejecución local reproducible: el repositorio incluye sumas de verificación (`CHECKSUMS.sha256`) y el código fuente fijado a un commit concreto.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; no es un modelo de propósito general.

## Casos de uso

- Predicción estructural en pipelines bioinformáticos: ejecutar `mol pred` sobre secuencias de interés para obtener modelos 3D que alimenten análisis posteriores (docking, anotación funcional, estudio de sitios activos).
- Análisis de variantes y mutaciones: predecir estructuras de proteínas wild-type y mutantes para comparar conformaciones y evaluar posibles impactos estructurales.
- Búsqueda de homólogos estructurales: usar la base `pdb_seqres` incluida para identificar plantillas relacionadas y apoyar la interpretación de proteínas poco caracterizadas.
- Reproducibilidad de experimentos: al fijar el commit y verificar checksums, el modelo es adecuado para trabajos que requieran resultados auditables y repetibles.
- Despliegue en entornos con acceso restringido a HuggingFace: el espejo permite descargar pesos y datos vía `hf-mirror.com` en China continental sin depender de la conectividad a `huggingface.co`.
- Integración en flujos de investigación académica: al ser Apache-2.0, puede incorporarse en proyectos internos y publicaciones sin las restricciones de licencias tipo CC-BY-NC.
- Docencia y formación: el pipeline CLI facilita demostraciones de predicción estructural en cursos de bioinformática computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint base pesa 2,39 GB; en fp32 en memoria podría requerir del orden de 9-10 GB, y en fp16 en torno a 5 GB, sin contar activaciones ni la base de búsqueda de plantillas.
- GPU recomendadas: no disponibles. Por tamaño del checkpoint, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L40S) debería ser suficiente para inferencia, aunque no hay confirmación en la documentación.
- GPU de consumo: plausible en RTX 4090 (24 GB) y posiblemente en GPUs de 12-16 GB, sujeto a la memoria requerida por la búsqueda de plantillas y los componentes auxiliares.
- Opciones de despliegue: ejecución local vía CLI (`mol pred`) o `python -m mol.runner.inference`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mol-1 | no disponible (checkpoint 2,39 GB) | no aplica | Apache-2.0 | HuggingFace (espejo) y GitHub | Predicción estructural con búsqueda de plantillas PDB |
| AlphaFold2 | ~93 M (Evoformer) + estructura | no aplica | CC BY 4.0 (código MIT) | GitHub DeepMind | Referencia en predicción estructural; requiere bases de datos grandes |
| OpenFold | ~93 M | no aplica | Apache-2.0 | GitHub | Reimplementación entrenable de AlphaFold2 |
| ESMFold | ~690 M | no aplica | MIT (código) / MIT (pesos ESM) | HuggingFace | Predicción end-to-end sin búsqueda de plantillas |

Los datos de AlphaFold2, OpenFold y ESMFold se incluyen como referencia de categoría; la información disponible no permite confirmar equivalencias exactas con Mol-1.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor del repositorio en HuggingFace no es Molence, por lo que la responsabilidad de integridad recae en la verificación con `CHECKSUMS.sha256`.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling, agentes ni generación de código.
- No se documentan sesgos, pero al entrenarse sobre PDB puede heredar sesgos de composición del Protein Data Bank (sobrerrepresentación de ciertas familias proteicas y organismos modelo).
- Riesgo de alucinación estructural: como todo modelo de predicción, puede producir conformaciones plausibles pero incorrectas, especialmente en regiones intrínsecamente desordenadas o sin homólogos claros.
- Dependencia de datos auxiliares: el pipeline requiere descargar `common/` y `search_database/`; sin ellos, la inferencia puede fallar o degradarse.
- Fechas de release: la base de datos está fechada en 2026-10-01, lo que limita la evaluación a estructuras anteriores a esa fecha y condiciona la reproducibilidad a largo plazo.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de las bases de datos subyacentes (PDB, CCD) por si imponen condiciones adicionales.
- Ausencia de benchmarks publicados: no es posible comparar su precisión con AlphaFold2 o ESMFold sin ejecutar evaluaciones propias.
- Fecha de creación del repositorio en HuggingFace (2026-10-30) y ausencia de descargas o likes: no hay evidencia de adopción por la comunidad que permita validar su calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RUIMA294264/Mol-1
- Repositorio upstream en GitHub: https://github.com/molence/Mol-1
- Commit fijado: `7480cc41a7c64b5c517709184bdc81c08dbd5fdb` (v1.0.0)
- Bucket oficial de release: `mol-1-release.oss-cn-shanghai.aliyuncs.com`
- Espejo de HuggingFace para China: https://hf-mirror.com
