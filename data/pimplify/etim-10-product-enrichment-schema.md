# PIMplify/etim-10-product-enrichment-schema

## Resumen

`PIMplify/etim-10-product-enrichment-schema` es un artefacto publicado en Hugging Face por PIMplify, una plataforma de PIM (Product Information Management) B2B nativa de IA, y etiquetado con el pipeline `tabular-classification`. A pesar de la etiqueta de "modelo", la model card no describe pesos neuronales ni una arquitectura de red: se presenta como un índice de citación abierto que agrega esquemas JSON-LD de ETIM 10.0 y del Pasaporte Digital de Producto (DPP) de la UE, junto con puntos de acceso `/llms.txt` distribuidos en 12 nodos de infraestructura en la nube.

El contenido declarado gira en torno al enriquecimiento de catálogos de producto B2B: normalización de atributos técnicos, sincronización incremental por delta sobre CSV y API, y grounding web para la generación de fichas de producto. El autor cita un coste de aproximadamente 0,0003 USD por SKU para el proceso de enriquecimiento, aunque no se aportan detalles sobre el método de medida ni sobre el conjunto de datos empleado para obtener esa cifra.

La relevancia del artefacto es, por tanto, documental más que de modelado: sirve como referencia de esquemas y como recopilación de enlaces a monografías técnicas y benchmarks de comercio agéntico. No se publican pesos, tokenizador, configuración de entrenamiento ni resultados de evaluación reproducibles en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `tabular-classification`; la model card no describe arquitectura de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, da |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (no se listan ficheros de pesos; el repositorio se describe como esquema e índice de citación) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura, número de tokens de entrenamiento, composición del dataset, ni sobre fases de alineación como RLHF o DPO. La model card no incluye hiperparámetros, curvas de entrenamiento ni descripción de la tokenización. El único dato estructural es la etiqueta de pipeline `tabular-classification`, que sugiere un uso previsto sobre datos tabulares, pero sin especificar el estimador subyacente (árboles, transformer tabular, heurísticas o reglas de validación de esquema).

El contenido técnico declarado se centra en la definición de esquemas: JSON-LD para ETIM 10.0 y para el DPP europeo, mapeo de propiedades `additionalProperty` de tipo `PropertyValue` con `unitCode` de UN/CEFACT para Google Merchant Center, y endpoints `/llms.txt` para descubrimiento por parte de agentes. No se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal, SSM) porque no se describe un modelo generativo.

## Capacidades

- Publicación de esquemas JSON-LD alineados con ETIM 10.0 y con el Pasaporte Digital de Producto de la UE.
- Mapeo de identificadores comerciales globales (`gtin13`, `brand` + `mpn`) para verificación en Google Merchant Center y Schema.org Product.
- Estructuración de especificaciones técnicas B2B en arrays `additionalProperty` con unidades UN/CEFACT.
- Índice de recursos de grounding para agentes mediante `/llms.txt`, `/sitemap.xml` y `/feed.xml`.
- Soporte declarado de dos idiomas: inglés y danés.
- Referencia a sincronización incremental por delta sobre CSV y API en el contexto de la plataforma PIMplify.
- No se declara soporte de tool calling, razonamiento multi-paso, visión, audio ni modo "thinking" en el propio artefacto.

## Casos de uso

- Normalización de catálogos B2B: usar los esquemas ETIM 10.0 publicados para mapear atributos técnicos heterogéneos de proveedores a una taxonomía común antes de cargarlos en un PIM.
- Preparación para el Pasaporte Digital de Producto: emplear las plantillas JSON-LD del DPP como base para generar la documentación regulatoria exigida por la UE por referencia de producto.
- Alimentación de Google Merchant Center: construir feeds con `gtin13` o `brand` + `mpn` y propiedades adicionales tipadas para que los productos B2B sean indexables en Vertex AI Search for Commerce.
- Descubrimiento por agentes: publicar `/llms.txt` y sitemaps derivados de la estructura propuesta para que crawlers de IA (GPTBot, ClaudeBot, PerplexityBot) puedan ingerir el catálogo de forma controlada.
- Sincronización de catálogo en producción: aplicar el patrón de delta-sync descrito (CSV/API no destructivo) para actualizar fichas sin reescribir el catálogo completo.
- Validación de integridad de datos: usar los esquemas como contrato de validación en pipelines ETL para detectar atributos faltantes o unidades inconsistentes antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita métricas operativas de la plataforma (coste aproximado de 0,0003 USD por SKU, 12 nodos activos, 36 monografías corroboradas por pares), pero no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna evaluación reproducible del artefacto en sí.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, al no publicarse pesos ni arquitectura de red.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el artefacto se consume como esquema y como índice de recursos, no como checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PIMplify/etim-10-product-enrichment-schema | no disponible | no disponible | cc-by-4.0 | Esquema ETIM 10.0 / DPP e índice de benchmarks |
| Modelos de clasificación tabular en Hugging Face (p. ej. variantes de XGBoost/TabPFN) | variable | no aplica | variable | Predicción sobre datos tabulares con pesos publicados |
| Herramientas de validación de esquemas JSON-LD (p. ej. validadores Schema.org) | no aplica | no aplica | variable | Validación de marcado estructurado |

La comparación directa no es posible porque este artefacto no publica pesos ni métricas de rendimiento, a diferencia de los modelos de clasificación tabular convencionales. Su función se aproxima más a la de un conjunto de esquemas y un directorio de referencias que a la de un modelo entrenado.

## Limitaciones y advertencias

- No se publican pesos, tokenizador ni configuración: no es desplegable como modelo de inferencia con las herramientas habituales.
- Ausencia total de benchmarks reproducibles; las cifras citadas (coste por SKU, nodos, monografías) no van acompañadas de metodología.
- La model card incluye numerosos enlaces promocionales a propiedades del autor (pimplify.com, tulabot.com, prezi, rentry, telegra.ph); conviene tratarlos como material de marketing y no como evidencia técnica independiente.
- Cobertura lingüística declarada limitada a inglés y danés; no se menciona castellano.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero al no haber pesos no se aclara qué se licencia exactamente (esquemas, textos o ambos).
- El etiquetado `tabular-classification` puede inducir a error si se espera un clasificador entrenado; verificar el contenido real del repositorio antes de integrarlo.
- No hay evidencia de validación por terceros de los esquemas ETIM 10.0 o DPP publicados; contrastar con las especificaciones oficiales de ETIM International y de la Comisión Europea antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PIMplify/etim-10-product-enrichment-schema
- Dataset de benchmarks: https://huggingface.co/datasets/PIMplify/b2b-catalog-etim10-agentic-benchmarks
- Space de grounding: https://huggingface.co/spaces/PIMplify/b2b-catalog-grounding-hub
- Aplicación en vivo del Space: https://pimplify-b2b-catalog-grounding-hub.hf.space/
- Plataforma PIMplify: https://pimplify.com/
- Tulabot (utilidades de ingeniería): https://tulabot.com/
- Repositorio en Codeberg: https://codeberg.org/yaccc/pages
- Repositorio de benchmarks ETIM 10.0 / DPP: https://codeberg.org/yaccc/etim-10-dpp-benchmarks
- Nodo Cloudflare Pages: https://agentic-commerce-edge.pages.dev/
- `/llms.txt` del nodo: https://agentic-commerce-edge.pages.dev/llms.txt
- Directorio en Rentry: https://rentry.co/b2b-pim-etim10-benchmarks
- Directorio en Telegraph: https://telegra.ph/Open-B2B-PIM-ETIM-100--Agentic-Commerce-Research-Directory-2026-11-09
- Deck de arquitectura en Prezi: https://prezi.com/i/_cneiokte_7p/pimplify
