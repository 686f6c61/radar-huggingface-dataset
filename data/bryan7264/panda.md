# bryan7264/PANDA

## Resumen

PANDA (Pan-tissue Adversarial Normalized Domain-invariant Anchored MLP) es un clasificador de identidad celular basado en aprendizaje profundo, desarrollado por Bryan C. (bryan7264) para datos de secuenciación de ARN de célula única (scRNA-seq). El modelo resuelve el problema de la clasificación de tipos celulares a través de múltiples tejidos —piel, sistema hematopoyético y páncreas— mediante un enfoque de anclaje por prototipos que busca ser invariante al dominio y robusto frente a las variaciones técnicas entre experimentos.

Su relevancia radica en que aborda dos desafíos clásicos de la transcriptómica unicelular: la integración de datos procedentes de distintos estudios y plataformas, y la transferencia de anotaciones celulares entre conjuntos de datos. PANDA combina varias técnicas de aprendizaje contrastivo y regularización, incluyendo SupCon, VICReg, InfoNCE con prototipos, un adversario de dominio basado en gradientes invertidos (GRL), decorrelación HSIC y repulsión de prototipos. Se ofrecen dos variantes: PANDA-PCA, que usa componentes principales, y PANDA-Marker, que añade un canal de genes marcadores.

El modelo se distribuye con pesos preentrenados, código, datos de entrenamiento armonizados y el manuscrito asociado, todo bajo licencia MIT. Aunque no es un modelo de lenguaje, su arquitectura y metodología son de interés para la comunidad de biología computacional que busca clasificadores celulares transferibles y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con anclaje por prototipos (prototype-anchored MLP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: vector de expresión génica, PCA o genes marcadores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos biológicos de expresión génica) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

PANDA es un perceptrón multicapa (MLP) que toma como entrada una representación de la expresión génica de una célula —bien los primeros 50 componentes principales (variante PCA), bien un conjunto de genes marcadores (variante Marker)— y produce una clasificación en tipos celulares predefinidos. La arquitectura incorpora un mecanismo de anclaje por prototipos: cada clase está representada por un prototipo aprendido, y la clasificación se basa en la similitud entre la representación de la célula y los prototipos.

El entrenamiento utiliza una función de pérdida compuesta que combina aprendizaje contrastivo supervisado (SupCon), regularización VICReg, una pérdida InfoNCE basada en prototipos, un adversario de dominio con gradientes invertidos (GRL) que penaliza la información sobre el conjunto de datos de origen, decorrelación de características mediante HSIC y una pérdida de repulsión entre prototipos para aumentar la separación entre clases. Esta combinación busca que las representaciones sean invariantes al dominio técnico (plataforma, laboratorio, protocolo) y biológicamente significativas.

Los datos de entrenamiento provienen de corpus armonizados por tejido (piel, hematopoyético, páncreas), con etiquetas externas de estudios originales. El repositorio incluye una réplica independiente del pipeline de Seurat de Dingwall para verificar la reproducibilidad. No se especifica el número total de células ni de tokens de entrenamiento, ni si se usó RLHF o DPO (no aplica a este tipo de modelo).

## Capacidades

- Clasificación de tipos celulares en tejidos de piel, sistema hematopoyético y páncreas a partir de datos de scRNA-seq.
- Transferencia de anotaciones entre conjuntos de datos de distintos estudios gracias al entrenamiento con adversario de dominio.
- Dos variantes de entrada: representación PCA (50 componentes) o canal de genes marcadores (PANDA-Marker).
- Invariencia a dominio técnico mediante GRL y decorrelación HSIC.
- Representaciones de célula aprendidas con propiedades de agrupación por prototipos (adecuadas para visualización y análisis exploratorio).
- Reproducibilidad completa: incluye código, datos armonizados, figuras y manuscrito en el repositorio.
- No es un modelo generativo de texto ni admite tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Anotación automática de tipos celulares en nuevos experimentos de scRNA-seq de piel: un investigador puede cargar su matriz de expresión, proyectarla sobre los componentes principales del corpus de entrenamiento y obtener etiquetas celulares sin necesidad de anotación manual.
- Integración de datos multi-estudio en hematopoyesis: al ser invariante al dominio, permite combinar datos de médula ósea y sangre periférica de diferentes laboratorios y plataformas, manteniendo una taxonomía celular consistente.
- Validación cruzada de anotaciones en páncreas: los prototipos aprendidos pueden compararse con marcadores canónicos para verificar la coherencia biológica de las clases predichas.
- Análisis exploratorio de heterogeneidad celular: las representaciones de PANDA pueden usarse como características de entrada para clustering o visualización UMAP/t-SNE, aprovechando la separación por prototipos.
- Reproducción de pipelines de anotación en entornos regulados: al incluir el código y los datos de entrenamiento, puede auditarse y re-ejecutarse en infraestructuras locales sin depender de servicios externos.
- Formación de modelos específicos de tejido: los pesos preentrenados pueden servir como inicialización para fine-tuning en tejidos adicionales, reduciendo la cantidad de datos etiquetados necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye figuras y análisis de descubrimiento que respaldan las afirmaciones del manuscrito, pero no se proporcionan métricas numéricas estandarizadas (como precisión, F1, o comparación con otros métodos) en la model card. Se recomienda consultar el manuscrito (PAPER.pdf) para obtener los resultados detallados.

## Requisitos de hardware

- Tamaño del repositorio: 19.3 GB (incluye checkpoints, datos y figuras). Los pesos del modelo en sí son pequeños (un MLP), pero los datos de entrenamiento y los checkpoints ocupan espacio.
- VRAM estimada para inferencia: no disponible, pero al ser un MLP con entrada de 50 componentes o unos pocos cientos de genes marcadores, la inferencia es ligera y puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 2 GB de VRAM sería suficiente para inferencia. Para entrenamiento desde cero, se recomienda una GPU con al menos 8 GB (p. ej., RTX 2070 o superior), aunque no se indica explícitamente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna de consumo puede ejecutar la inferencia.
- Opciones de despliegue: el modelo se carga con PyTorch estándar; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles, pero se espera una latencia de milisegundos por célula en CPU y menor en GPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de clasificación de scRNA-seq (como scVI, scANVI, CellTypist o ScType) en la información proporcionada. El manuscrito del repositorio podría incluir comparaciones, pero no están accesibles en la model card. Se recomienda consultar el documento PAPER.pdf para obtener una comparación detallada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para piel, sistema hematopoyético y páncreas; su uso en otros tejidos requiere fine-tuning o reentrenamiento.
- La variante PCA depende de la base de componentes principales calculada sobre el corpus de entrenamiento; los datos nuevos deben proyectarse sobre esa misma base.
- No se han publicado métricas de rendimiento cuantitativas en la model card; la validación debe hacerse con los datos y figuras del repositorio.
- El modelo no es un LLM: no genera texto, no razona ni admite lenguaje natural.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento pueden tener restricciones de uso según los estudios originales; es responsabilidad del usuario verificar las licencias de los datos externos.
- El repositorio es grande (19.3 GB) y la descarga completa puede ser pesada; se ofrecen opciones de descarga parcial.
- No se especifican sesgos conocidos, pero como cualquier modelo entrenado con datos biológicos, puede reflejar sesgos de los estudios originales (p. ej., desequilibrios de clases, poblaciones poco representadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bryan7264/PANDA
- Perfil del autor: https://huggingface.co/bryan7264
- Repositorio de código y manuscrito (PRISM): https://github.com/bryanc5864/PRISM
- Lista de modelos del autor: https://huggingface.co/bryan7264/models
