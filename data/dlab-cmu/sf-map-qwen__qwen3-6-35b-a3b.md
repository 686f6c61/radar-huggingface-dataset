# dlab-cmu/sf-map-Qwen__Qwen3.6-35B-A3B

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un **SF map** (mapa de calidad específico de modelo) en su versión 3.0 para el modelo **Qwen3.6-35B-A3B**. Un SF map es un artefacto de metadatos que codifica, de forma compacta y medible, los valores necesarios para decidir acciones de cuantización sobre pesos densos, expertos y caché KV de un modelo concreto, y para recalcular ese plan cuando la memoria disponible cambia. Lo desarrolla el grupo **dlab-cmu**, asociado al laboratorio de Tim Dettmers, y se publica como un único archivo JSON (`sf-map.json`, 518 kB) junto con un esquema abstracto documentado en la model card.

El SF map no resuelve tareas de NLP directamente; resuelve el problema de **optimizar la compresión de un modelo MoE** (Qwen3.6-35B-A3B) minimizando el daño predicho en perplexidad bajo restricciones de memoria. Su relevancia actual radica en que permite a equipos de despliegue elegir cuantizaciones por capa y por experto con criterios medidos, en lugar de usar recetas genéricas. El repositorio no incluye pesos del modelo, ni licencia, ni idiomas, ni pipeline de inferencia.

## Especificaciones técnicas

El contenido del repositorio es un mapa de calidad, no un modelo. La tabla siguiente describe los campos del SF map según su esquema 3.0:

| Parametro | Valor |
|---|---|
| Tipo de artefacto | SF map (mapa de calidad de modelo) |
| Esquema | 3.0 |
| Modelo de referencia | Qwen3.6-35B-A3B (MoE, 35B totales, 3B activos según nomenclatura) |
| Revisión del catálogo de codecs | Fijada (no se especifica el identificador) |
| Codecs medidos para expertos | ib6p8, ib9p4, ib16p4 |
| Codecs para pesos densos | Según catálogo (no enumerados en la model card) |
| Modo de KV cache | separate_kv y shared_kv (según capa) |
| Interpolación de codecs | phi con valid_between [ib6p8, ib16p4] |
| Referencia de perplexidad | `sf-reference-v3` (valor medido no publicado en el repo) |
| Formato de archivo | JSON (sf-map.json) |
| Licencia | no disponible |
| Idiomas | no disponibles |
| Descargas | 0 |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un **mapa de calidad medido**. El SF map se construye a partir de mediciones sobre el modelo Qwen3.6-35B-A3B: evalúa el daño (en términos de divergencia KL y perplexidad) que introduce cada codec de cuantización en cada tensor denso, en cada experto y en cada capa de KV. El esquema define una referencia normativa (`sf-reference-v3`) que usa expertos con codec `ib10p2`, pesos densos en FP16 y KV en FP16. Sobre esa referencia se calculan daños relativos.

El mapa incluye una superficie de daño para expertos (`cells`) con tres anclas de codec medidos, una interpolación basada en `phi` para codecs intermedios, y un prior de masa de enrutamiento (`routing_mass_prior`) que se usa para decidir qué expertos retener cuando la memoria es limitada. También contiene estadísticas de varianza y beta para la caché KV, con un cálculo de daño conjunto ponderado por `gamma`. No hay datos de entrenamiento, tokens ni fases de RLHF/DPO porque no es un modelo generativo.

## Capacidades

El SF map no genera texto ni ejecuta razonamiento. Sus capacidades son operativas y se centran en la planificación de cuantización:

- **Selección de codec por tensor denso**: permite elegir el codec óptimo para cada tensor según el presupuesto de memoria.
- **Selección de retención de expertos**: dado un número de expertos a mantener por capa, proporciona el daño medido para cada combinación capa × recuento × codec.
- **Interpolación de codecs**: estima el daño para codecs no medidos entre `ib6p8` e `ib16p4` mediante la función `phi`.
- **Planificación de KV cache**: calcula el daño de cuantizar K y V por separado o de forma compartida, usando varianza, beta y gamma.
- **Replanificación dinámica**: cuando cambia la memoria disponible, el mapa permite recalcular las asignaciones sin volver a medir.
- **Adaptación de enrutamiento**: actualiza las identidades de expertos retenidos según observaciones de enrutamiento en vivo, sin cambiar los precios de codec ni los recuentos fijos.

## Casos de uso

- **Despliegue de Qwen3.6-35B-A3B en una GPU con VRAM limitada**: un ingeniero usa el SF map para decidir qué codec aplicar a cada tensor denso y cuántos expertos retener por capa, minimizando el daño predicho en perplexidad bajo el presupuesto de memoria disponible.
- **Ajuste dinámico de memoria en entornos compartidos**: cuando la memoria de una GPU se reduce (por ejemplo, por otros procesos), el mapa permite recomputar el plan de cuantización al instante, sin re-ejecutar mediciones costosas.
- **Comparación de estrategias de cuantización**: un equipo de MLOps evalúa distintas combinaciones de codecs (ib6p8, ib9p4, ib16p4) y recuentos de expertos usando el daño medido, en lugar de probar empíricamente cada configuración.
- **Optimización de caché KV para contexto largo**: el mapa proporciona datos de varianza y beta por capa para decidir si cuantizar K y V por separado o de forma compartida, reduciendo el uso de memoria en inferencia con ventanas de contexto grandes.
- **Investigación sobre compresión de MoE**: investigadores del área de eficiencia de modelos utilizan el SF map como referencia reproducible para estudiar el impacto de la cuantización selectiva de expertos en modelos de la familia Qwen.
- **Integración en runtimes de inferencia**: el mapa puede ser consumido por motores como vLLM o llama.cpp (si implementan el formato) para aplicar automáticamente las decisiones de cuantización al cargar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo Qwen3.6-35B-A3B en la información disponible. El SF map incluye una referencia de perplexidad (`sf-reference-v3`) y daños relativos, pero los valores numéricos concretos no se muestran en la model card ni en los archivos visibles. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

No aplican directamente, ya que el SF map es un archivo de configuración de 518 kB que no requiere GPU para procesarse. Sin embargo, su propósito es guiar el despliegue del modelo Qwen3.6-35B-A3B en hardware específico. Según la nomenclatura del modelo (35B totales, 3B activos), se puede inferir que:

- El modelo base requiere una GPU con al menos 16-24 GB de VRAM en FP16, y menos con cuantización (por ejemplo, 8-12 GB con 4 bits).
- El SF map permite reducir aún más el uso de memoria mediante la retención selectiva de expertos y la cuantización de KV.
- Para ejecutar el mapa en sí, basta con cualquier CPU y un intérprete de JSON.
- El despliegue del modelo subyacente puede hacerse con vLLM, llama.cpp, Ollama o TGI, siempre que soporten el formato de pesos y la lógica de retención de expertos.

## Comparativa con modelos similares

No hay comparativa directa disponible, ya que este repositorio no es un modelo sino un mapa de calidad. Como referencia, el modelo subyacente Qwen3.6-35B-A3B pertenece a la familia Qwen 3.6, que según la búsqueda web incluye también una variante densa de 27B. No se dispone de datos de rendimiento comparativo entre ambas variantes en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: este repositorio no contiene pesos ni puede generar texto. Intentar usarlo como un LLM producirá un error.
- **Específico del modelo**: el SF map solo es válido para Qwen3.6-35B-A3B en la revisión concreta medida. No es transferible a otros modelos.
- **Dependencia de mediciones**: los valores de daño se basan en una calibración concreta; si el modelo cambia (fine-tuning, actualización de pesos), el mapa queda obsoleto.
- **Sin licencia explícita**: la model card no indica licencia, por lo que su uso comercial es incierto. Se recomienda contactar al autor.
- **Sin documentación de soporte**: no hay guía de integración con runtimes específicos; el formato es nuevo y puede no estar implementado en motores populares.
- **Riesgo de daño negativo**: el esquema permite que el daño total sea negativo, lo que implica que la perplexidad predicha puede ser inferior a la referencia. Esto es una propiedad matemática del modelo de daño, no una garantía de mejora real.
- **Sin datos de sesgos o alucinación**: al no ser un modelo generativo, no aplican estas consideraciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dlab-cmu/sf-map-Qwen__Qwen3.6-35B-A3B
- Árbol de archivos: https://huggingface.co/dlab-cmu/sf-map-Qwen__Qwen3.6-35B-A3B/tree/main
- Guía de Qwen 3.6 (contexto del modelo subyacente): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
