# anne-voigt/biodata-registry

## Resumen

`biodata-registry` no es un modelo de inteligencia artificial, sino un paquete Python instalable que actúa como registro de manifiestos de datasets para agentes de bioinformática. Desarrollado por Anne Voigt, ingeniera de sistemas de IA, el paquete indexa y valida manifiestos YAML (uno por dataset) en tiempo de importación, y expone un servidor FastMCP para que procesos agente consulten metadatos de datasets de forma estandarizada.

El paquete resuelve un problema concreto de orquestación de datos: los agentes de bioinformática necesitan validar cada `dataset_id` referenciado por el usuario contra un registro de confianza antes de confiar en las URLs de origen de expresión génica. Incluye como primera entrada el dataset de microarrays de PDAC de Moffitt et al. (2015), y su superficie de seguridad se centra en la integridad de datos, no en el ataque en tiempo de ejecución: no ejecuta código de usuario, no realiza conexiones de red y no almacena credenciales.

Su relevancia actual radica en el auge de los agentes de IA aplicados a investigación biomédica, donde la trazabilidad y validación de los datos de origen es un requisito crítico. El registro actúa como ancla de confianza del sistema: los agentes consumidores validan los identificadores contra este registro y luego confían en las URLs que este proporciona.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Tipo | Paquete Python (no es un modelo de ML) |
| Arquitectura | Registro de manifiestos YAML + servidor FastMCP |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (metadatos en ingles) |
| Licencia | No disponible |
| Formato de pesos | No aplica (codigo fuente Python + manifiestos YAML) |
| Dependencias principales | FastMCP, Pydantic (schema tipado) |
| Version | No disponible |
| Repositorio | GitHub: avoigt1121/biodata-registry |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay datos de entrenamiento, tokens ni procesos de RLHF/DPO. La arquitectura del paquete se compone de tres capas:

1. **Registro de manifiestos**: en tiempo de importación, el paquete descubre y valida automáticamente los archivos YAML ubicados en `biodata_registry/manifests/`. Cada manifiesto debe cumplir un esquema tipado (`DatasetManifest`) con vocabularios controlados para campos como `organism` (human, mouse), `modality` (bulk_microarray, bulk_rnaseq, sc_rnaseq, spatial_rnaseq, proteomics), `data_level` (raw_counts, log_expression, log_ratio, normalized, tpm, fpkm, protein_abundance) y `feature_id_type` (probe_id, gene_symbol, ensembl_gene_id, entrez_id, protein_id).

2. **Servidor MCP**: expone cuatro herramientas vía FastMCP: `list_datasets`, `get_manifest`, `get_prohibited_inferences` y `get_contrast_definition`. Esto permite que agentes externos consulten metadatos de datasets mediante el protocolo Model Context Protocol.

3. **Gates de integración**: el módulo `integration.py` implementa `get_integration_plan`, que decide entre `early`, `late`, `concordance` o `refuse`, aplicando compuertas de seguridad sobre confound, misma cohorte y resolución cruzada. Es lógica pura de metadatos, sin ejecución de código arbitrario.

La distribución se realiza mediante URLs de wheel con commit fijado (`git+https://…@<commit>`), lo que permite auditar el conjunto exacto de manifiestos bajo revisión.

## Capacidades

- **Descubrimiento automático de datasets**: indexa manifiestos YAML en tiempo de importación sin necesidad de cambios de código al añadir nuevos datasets.
- **Validación tipada**: valida cada manifiesto contra un esquema Pydantic con vocabularios controlados, rechazando manifiestos malformados.
- **Consulta de metadatos vía MCP**: expone herramientas estándar del protocolo MCP para que agentes consulten listados, manifiestos completos, reglas de inferencia prohibidas y definiciones de contrastes.
- **Gates de integración**: decide automáticamente si un dataset puede integrarse de forma temprana, tardía, en concordancia o si debe rechazarse, basándose en reglas de confound, cohorte y resolución.
- **Seguridad por diseño**: no ejecuta código de usuario, no realiza conexiones de red en importación y no almacena credenciales. Las URLs de datos de expresión apuntan a un dataset privado de HuggingFace que los consumidores autentican.
- **Trazabilidad**: los consumidores fijan un commit específico del paquete, garantizando que el conjunto de manifiestos bajo revisión sea auditable y reproducible.

## Casos de uso

- **Orquestación de agentes de bioinformática**: un agente que procesa papers de expresión génica puede validar cada `dataset_id` mencionado por el usuario contra el registro antes de descargar los datos, evitando referencias a datasets inexistentes o malformados.
- **Replicación de estudios de microarrays**: el dataset incluido de Moffitt et al. 2015 (PDAC, GSE71729) permite reproducir análisis de expresión diferencial con los contrastes predefinidos en el manifiesto.
- **Automatización de pipelines de análisis de expresión**: los manifiestos especifican `expression_source`, `data_level` y `feature_id_type`, lo que permite a pipelines automatizados seleccionar el preprocesado correcto (log_expression, TPM, etc.) sin intervención manual.
- **Gobernanza de datos en investigación**: el registro actúa como capa de control que impide integrar datasets con conflictos de cohorte o confound, aplicando las compuertas de `get_integration_plan`.
- **Auditoría de reproducibilidad**: al fijar commits del paquete, los equipos pueden auditar exactamente qué manifiestos y reglas se usaron en un análisis determinado.
- **Servicio de metadatos para múltiples agentes**: el servidor FastMCP permite que varios agentes consulten el mismo registro de forma centralizada, con herramientas estandarizadas para listar datasets y obtener manifiestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un paquete de metadatos y no de un modelo de ML, no aplican métricas como MMLU, HumanEval o GSM8K. El rendimiento relevante sería el tiempo de importación y validación de manifiestos, del cual no se han publicado mediciones.

## Requisitos de hardware

- **CPU**: suficiente con cualquier procesador moderno; el paquete solo lee archivos YAML y devuelve diccionarios en importación.
- **GPU**: no requiere GPU. No hay inferencia de modelos neuronales.
- **Memoria RAM**: mínima; el registro carga manifiestos YAML de pequeño tamaño en memoria.
- **Almacenamiento**: el repositorio tiene un tamaño de 0.0 GB según HuggingFace; los manifiestos YAML son archivos de texto de pocos kilobytes.
- **Despliegue**: se instala con `pip install -e .` o desde una URL de wheel con commit fijado. El servidor MCP se lanza con `python -m biodata_registry.server`.
- **Red**: el paquete en sí no realiza conexiones de red en importación; los consumidores autentican contra el dataset privado de HuggingFace para descargar los datos de expresión.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que `biodata-registry` no es un modelo de IA sino una herramienta de orquestación de metadatos. En el ecosistema de agentes de bioinformática, podría compararse con soluciones como `datasets` de HuggingFace o `bioconductor` para gestión de metadatos, pero no se dispone de datos de comparación directa en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: no genera texto, no razona ni procesa lenguaje; es exclusivamente un registro de metadatos. Cualquier expectativa de capacidades de ML es incorrecta.
- **Cobertura limitada de datasets**: actualmente solo incluye un dataset (GSE71729 de Moffitt et al. 2015). Añadir nuevos datasets requiere crear manifiestos YAML manualmente siguiendo el esquema.
- **Vocabularios controlados restringidos**: los campos como `organism`, `modality` y `data_level` solo aceptan valores de listas cerradas; datasets con modalidades no contempladas (p. ej., metilación, ATAC-seq) no pueden registrarse sin ampliar el esquema.
- **Dependencia de un dataset privado**: las URLs de datos de expresión apuntan a un dataset privado de HuggingFace; los consumidores necesitan autenticación para acceder, lo que puede limitar su uso fuera de la organización.
- **Licencia no especificada**: no se indica la licencia del paquete, lo que genera incertidumbre sobre su uso comercial y redistribución.
- **Sin red en importación por diseño**: aunque es una característica de seguridad, implica que el registro no puede actualizarse dinámicamente; los manifiestos deben distribuirse con el paquete.
- **Riesgo de obsolescencia**: al fijar commits para auditoría, los consumidores deben actualizar manualmente el paquete para recibir nuevos manifiestos o correcciones.

## Enlaces

- HuggingFace: https://huggingface.co/anne-voigt/biodata-registry
- GitHub: https://github.com/avoigt1121/biodata-registry
- Codigo fuente del paquete: https://github.com/avoigt1121/biodata-registry/tree/main/biodata_registry
- Perfil de la autora: https://anne-voigt.com/
- Perfil en HuggingFace: https://huggingface.co/anne-voigt/models
