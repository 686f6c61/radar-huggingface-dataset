# dlab-cmu/sf-map-Qwen__Qwen3.8-27B

## Resumen

Este repositorio contiene un **SF map (mapa de calidad específico del modelo)** para el modelo **Qwen3.8-27B**, desarrollado por el grupo **dlab-cmu**. Un SF map no es un modelo de lenguaje, sino un artefacto técnico que codifica, de forma compacta y accionable, las medidas de distorsión que produce cada codec de cuantización sobre los pesos densos, los expertos y la caché KV del modelo base. Su propósito es permitir elegir, bajo un presupuesto de memoria dado, qué tensores cuantizar y con qué codec, minimizando el daño predicho en perplejidad.

El mapa sigue el **esquema abstracto SF map 3.0**, que separa la información de calidad (mediciones de KL, varianzas, betas) de los detalles de runtime (velocidad, legalidad de backend, políticas de evicción). Esto lo hace reutilizable en distintos entornos de despliegue. El modelo base, Qwen3.8-27B, es un modelo denso de 27 000 millones de parámetros con atención híbrida (lineal en 48 de 64 capas), torre de visión, cabeza de decodificación especulativa MTP y contexto nativo de 262 000 tokens, extensible a 1 000 000. El SF map aquí presentado es, por tanto, una pieza clave para desplegar ese modelo de forma eficiente en memoria sin degradar excesivamente la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SF map schema 3.0 (mapa de calidad, no modelo generativo) |
| Parametros totales | no aplica (el mapa no contiene pesos del modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (depende del modelo base Qwen3.8-27B: 262K nativo, extensible a 1M) |
| Tipos de cuantizacion | Codecs del catalogo: `ib6p8`, `ib9p4`, `ib16p4` (medidos); interpolacion entre `ib6p8` e `ib16p4` |
| Idiomas soportados | no disponible (el mapa no define idiomas; depende del modelo base) |
| Licencia | no disponible en este repositorio; el repositorio hermano `sf-map-qwen3.8-27b` declara licencia MIT |
| Formato de pesos | JSON/JSONC (esquema abstracto, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El SF map no se entrena; se **mide**. Para cada tensor denso del modelo base, se calcula la divergencia KL directa y plegada (folded) al aplicar cada codec del catálogo. Para los expertos (si los hay), se mide una superficie tridimensional: capa × número de expertos retenidos × codec, registrando el daño logarítmico literal en cada celda. Para la caché KV, se miden varianza, beta y gamma por capa, y se determina el codec de menor distorsión que supera el umbral de calidad. El mapa incluye también un **prior de masa de enrutamiento** (`routing_mass_prior`) que identifica qué expertos son más utilizados durante la calibración, sirviendo como semilla para la retención dinámica.

La innovación técnica clave es la **interpolación de codecs**: a partir de tres anclas medidas (`ib6p8`, `ib9p4`, `ib16p4`), se estima el daño de cualquier otro codec del catálogo mediante una función `phi` calculada sobre las filas densas con mayor rango de distorsión. Esta interpolación está validada con tolerancia `1e-12` y permite ampliar el espacio de decisiones sin necesidad de medir cada codec individualmente. El daño total predicho se combina con la perplejidad de referencia (`sf-reference-v3`) para estimar la perplejidad final mediante `predicted_ppl = reference.ppl * exp(total_damage)`, pudiendo incluso resultar en una perplejidad inferior a la referencia si el daño total es negativo.

## Capacidades

- **Planificacion de cuantizacion por tensor**: permite elegir un codec distinto para cada tensor denso, cada capa de expertos y cada lado de la caché KV, minimizando el daño predicho bajo un presupuesto de memoria.
- **Seleccion de expertos retenidos**: para cada capa MoE, el mapa proporciona 20 niveles de retención (de 256 a 16 expertos) con su daño medido, lo que permite decidir cuántos expertos mantener según la memoria disponible.
- **Actualizacion dinamica de enrutamiento**: cuando las observaciones en vivo cambian qué expertos son más utilizados, el mapa permite actualizar las identidades retenidas sin alterar los conteos ni los precios de codec fijados.
- **Replanificacion ante cambios de memoria**: si la memoria disponible cambia, se pueden recomputar las asignaciones óptimas a partir del mismo mapa fijo, sin necesidad de recalibrar.
- **Estimacion de perplejidad predicha**: combina el daño total con la perplejidad de referencia para predecir el impacto en calidad de cualquier plan de cuantización.
- **Soporte para arquitecturas sin expertos**: el campo `experts` puede ser `null`, lo que permite usar el mapa en modelos densos puros.

## Casos de uso

- **Despliegue de Qwen3.8-27B en GPUs de consumo**: un ingeniero puede usar el SF map para decidir qué capas cuantizar a `ib6p8` y cuántos expertos retener para que el modelo quepa en una RTX 4090 (24 GB) o similar, manteniendo la perplejidad dentro de un umbral aceptable.
- **Optimizacion de memoria en inferencia servida**: en un entorno con vLLM o TGI, el mapa permite configurar la cuantización de la caché KV por capa, reduciendo el uso de memoria en contextos largos (hasta 262K tokens) sin sacrificar calidad en las capas más sensibles.
- **Ajuste fino de la retencion de expertos**: un equipo que sirve el modelo con enrutamiento dinámico puede usar `routing_mass_prior` para precargar los expertos más relevantes y actualizar la retención según el tráfico real, sin recompilar el mapa.
- **Evaluacion de trade-offs calidad-compresion**: investigadores pueden comparar el daño predicho de distintos planes de cuantización (p. ej., cuantizar solo densos vs. solo expertos) usando las métricas de KL y perplejidad del mapa.
- **Integracion en pipelines de CI/CD**: el mapa, al ser un archivo JSON estable, puede versionarse y usarse en pipelines automatizados que generen configuraciones de cuantización para diferentes targets de hardware.
- **Investigacion sobre cuantizacion de modelos hibridos**: el esquema SF map 3.0 es un caso de estudio para modelos con atención lineal y MoE, ya que separa claramente el daño de pesos densos, expertos y KV, algo que los mapas tradicionales no cubren.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de perplejidad medidas del modelo base ni comparaciones con otros mapas de cuantización. La model card describe el formato y la metodología, pero no ofrece números de rendimiento.

## Requisitos de hardware

- **El SF map en sí** es un archivo JSON de tamaño reducido (del orden de kilobytes o pocos megabytes), por lo que no requiere hardware específico para almacenarlo o procesarlo.
- **Para usar el mapa** se necesita un runtime que soporte los codecs del catálogo (`ib6p8`, `ib9p4`, `ib16p4`) y que pueda interpretar el esquema 3.0. No se especifican runtimes concretos en la documentación.
- **El modelo base Qwen3.8-27B** (al que el mapa hace referencia) requiere, según su ficha, al menos 16 GB de VRAM en FP16 para inferencia básica, y más si se usa el contexto completo de 262K tokens. Con cuantización a 4 bits (usando el mapa) podría caber en GPUs de 24 GB como la RTX 4090 o la A10G.
- **Opciones de despliegue**: el mapa no incluye información de backend, pero el modelo base es compatible con vLLM, llama.cpp, Ollama y TGI según su documentación oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `dlab-cmu/sf-map-Qwen__Qwen3.8-27B` (este repo) | SF map schema 3.0 | no aplica | no aplica | no disponible | JSON |
| `dlab-cmu/sf-map-qwen3.8-27b` | SF map (mismo autor) | no aplica | no aplica | MIT | JSON |
| `Qwen/Qwen3.8-27B` (modelo base) | Denso hibrido (lineal + full attention) | 27B | 262K (1M extensible) | Apache 2.0 (segun documentacion) | safetensors, GGUF |

No se dispone de otros SF maps de la misma familia para comparar directamente. La comparativa relevante es entre el modelo base y sus versiones cuantizadas, pero el mapa no proporciona esos datos.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: este repositorio no contiene pesos ni genera texto. Es un artefacto de planificación de cuantización; usarlo como modelo generativo es un error.
- **Dependencia del catalogo de codecs**: las mediciones son válidas solo para los codecs listados (`ib6p8`, `ib9p4`, `ib16p4`). Codecs fuera de ese rango requieren anclas adicionales medidas.
- **Licencia no declarada**: el repositorio no especifica licencia. Aunque el repo hermano usa MIT, no se puede asumir que esta versión tenga la misma licencia sin confirmación del autor.
- **Sin datos de rendimiento**: no se incluyen benchmarks ni perplejidades medidas, lo que limita la validación independiente del mapa.
- **Calibracion dependiente del modelo base**: el mapa se generó para una revisión concreta de Qwen3.8-27B; si el modelo base cambia, el mapa podría quedar desactualizado.
- **Riesgo de daño negativo**: el esquema permite que el daño total sea negativo, lo que implica que la perplejidad predicha puede ser inferior a la referencia. Esto debe interpretarse con cautela, ya que puede deberse a artefactos de medición.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dlab-cmu/sf-map-Qwen__Qwen3.8-27B
- Repositorio hermano (licencia MIT): https://huggingface.co/dlab-cmu/sf-map-qwen3.8-27b
- Modelo base Qwen3.8-27B (vLLM Recipes): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Registro de lanzamientos de agosto 2026 (BenchLM): https://benchlm.ai/model-updates/releases/august-2026
