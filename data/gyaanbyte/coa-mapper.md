# gyaanbyte/coa-mapper

## Resumen

COA Mapper es un modelo de embeddings orientado a la tarea de mapeo de planes de cuentas contables (chart-of-accounts mapping). Desarrollado por GyaanByte Labs, especialistas en migración de datos contables, el modelo está diseñado para recibir una cuenta contable procedente de sistemas de escritorio como QuickBooks Desktop o Sage (nombre, tipo y número) y recuperar y clasificar la cuenta de destino correcta en QuickBooks Online.

El modelo se basa en fine-tuning de un modelo de embeddings de tipo sentence-transformers con conciencia jerárquica, inspirado en la arquitectura TopoLedgerBERT (arXiv:2407.05175). Está entrenado sobre el dataset sintético `gyaanbyte/coa-mapping-synthetic` y se plantea como un sistema de recuperación combinado con re-rank de LLM y umbrales de confianza, con una vía de revisión humana para garantizar reconciliación con varianza cero.

En el momento de redactar esta ficha, el modelo está en entrenamiento y no se han publicado pesos ni resultados de evaluación. El repositorio de HuggingFace indica explícitamente que no habrá lanzamiento sin benchmarks previos, por lo que cualquier uso en producción queda condicionado a la publicación de los pesos y de las métricas prometidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de sentence-transformers, jerárquica inspirada en TopoLedgerBERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (modelo en entrenamiento, sin pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura concreta no se ha publicado. La model card indica que se trata de un fine-tuning de un modelo de embeddings de sentence-transformers con consciencia jerárquica, siguiendo el espíritu de TopoLedgerBERT (arXiv:2407.05175). Este enfoque incorpora la estructura jerárquica de los planes de cuentas en el entrenamiento del embedding, lo que debería permitir capturar relaciones padre-hijo entre cuentas contables.

El entrenamiento se realiza sobre el dataset sintético `gyaanbyte/coa-mapping-synthetic`, publicado también por GyaanByte Labs. No se han especificado el número de tokens, la composición exacta del dataset ni si se ha empleado alguna técnica de alineación como RLHF o DPO. El pipeline planeado combina el modelo de embeddings como recuperador con un LLM de re-ranking y umbrales de confianza, más una vía de revisión humana.

## Capacidades

- Generación de embeddings de similitud semántica para cuentas contables.
- Recuperación y ranking de cuentas de destino en QuickBooks Online a partir de cuentas de origen (QuickBooks Desktop o Sage).
- Mapeo jerárquico de planes de cuentas, aprovechando la estructura padre-hijo.
- Integración en pipelines de migración de datos contables con re-ranking de LLM y umbrales de confianza.
- Soporte para revisión humana mediante clasificación de confianza (thresholds).
- Multilingüismo: no disponible; la model card solo indica inglés.

## Casos de uso

- Migración de QuickBooks Desktop a QuickBooks Online: el modelo recibe cuentas del sistema de escritorio y sugiere la cuenta equivalente en la nube, reduciendo el trabajo manual de reconciliación de planes de cuentas.
- Migración entre Sage y QuickBooks Online: permite mapear cuentas entre plataformas con distinta nomenclatura, apoyándose en la estructura jerárquica para mantener coherencia contable.
- Consolidación de planes de cuentas en adquisiciones: al fusionar empresas con contabilidades distintas, el modelo puede proponer un mapeo común de cuentas, con revisión humana para evitar desviaciones.
- Auditoría de mapeos contables existentes: permite detectar errores en mapeos previos comparando cuentas de origen y destino mediante similitud semántica.
- Automatización de reconciliación de libros mayores (GL): el modelo puede clasificar cuentas de un trial balance hacia una jerarquía estándar de cuatro niveles, con puntuaciones de confianza y flags de revisión.
- Asistencia a firmas de contabilidad en migraciones de clientes: cada compromiso puede pasar de 40-80 horas de mapeo manual a menos de 4 horas de revisión, según el caso de uso de HummingAgent (no del modelo de GyaanByte, pero ilustra el contexto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card promete métricas de Accuracy@1, Accuracy@5 y MRR sobre un conjunto de mapeo de validación, comparadas con líneas base de TF-IDF y LLM zero-shot, pero estos números no están disponibles actualmente. El autor declara explícitamente que no se publicarán los pesos hasta que existan benchmarks.

## Requisitos de hardware

No disponibles. Al no haberse publicado los pesos ni el tamaño del modelo, no es posible estimar la VRAM necesaria, las GPUs recomendadas ni la latencia. En general, los modelos de embeddings de tipo sentence-transformers de tamaño medio (300-500M parámetros) pueden ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero esto es especulativo y no debe tomarse como dato confirmado.

## Comparativa con modelos similares

No disponible. No se han publicado pesos ni benchmarks del modelo, por lo que no es posible compararlo con alternativas como modelos de embeddings genéricos (e.g., `all-MiniLM-L6-v2`) o modelos específicos de contabilidad. La model card menciona TopoLedgerBERT como inspiración, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- El modelo está en entrenamiento; no hay pesos públicos ni se puede usar en producción.
- No hay benchmarks publicados; la model card promete métricas antes del release, pero aún no existen.
- Idioma limitado a inglés; no hay soporte multilingüe declarado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está disponible aún.
- La tarea de mapeo contable requiere alta precisión y cero errores de reconciliación; el diseño incluye revisión humana, lo que indica que no se recomienda automatización total sin supervisión.
- El dataset de entrenamiento es sintético; la generalización a datos reales de producción no está verificada.
- Los casos de uso encontrados en la búsqueda web (coa-mapper-mcp, coa-mapper de kotaicode, etc.) corresponden a otros proyectos con el mismo nombre, no al modelo de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gyaanbyte/coa-mapper
- Dataset de entrenamiento: https://huggingface.co/datasets/gyaanbyte/coa-mapping-synthetic
- Paper de inspiración (TopoLedgerBERT): https://arxiv.org/abs/2407.05175
- Web de GyaanByte Labs: https://www.gyaanbytelabs.com
- Repositorio MCP server (proyecto distinto, no oficial): https://github.com/NaimGQKC/coa-mapper-mcp
- App de mapeo (proyecto distinto): https://staging.coa-mapper.kotaicode.solutions/
- Herramienta de mapeo (proyecto distinto): https://jiesen.ai/tools/coa-mapper
- Caso de estudio de mapeo de GL (proyecto distinto): https://hummingagent.ai/case-studies/coa-mapper
