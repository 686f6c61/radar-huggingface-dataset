# run-saina/saina-helm-2-routing-0.8b

## Resumen

Saina Helm 2 Routing 0.8B es un modelo de clasificación de texto especializado en enrutamiento (routing) de peticiones entre modelos candidatos. Lo desarrolla run-saina y se publica bajo licencia Apache 2.0. No es un modelo generativo: dada una petición, un conjunto de descripciones de capacidades de cada candidato y sus precios estimados, devuelve una probabilidad por opción, lo que permite seleccionar automáticamente el modelo más económico que probablemente alcance un umbral de calidad dado.

El repositorio contiene pesos fusionados autónomos en BF16, la cabeza de decisión y el tokenizador, sin necesidad de adaptadores separados. Con 852.985.920 parámetros (~0,85 B) y un repositorio de 1,7 GB, está pensado para ejecutarse tanto en local (a través del SDK saina) como mediante la API alojada del proveedor. La model card lo describe explícitamente como una versión experimental y recomienda medir la calidad del enrutamiento y el coste total en la carga de trabajo propia antes de depender de él.

Su relevancia actual está en las arquitecturas multi-modelo y en las pasarelas de LLM: el enrutamiento por coste y capacidad es la pieza que permite reducir el gasto por petición sin degradar la calidad. El repositorio incluye la etiqueta qwen3_5 y usa la librería saina, aunque la documentación disponible no detalla la arquitectura interna ni los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; pesos fusionados en BF16 con cabeza de decisión y etiqueta de repositorio qwen3_5 |
| Parámetros totales | 852.985.920 (~0,85 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (la model card indica "text-only" sin lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tarea (pipeline) | text-classification |
| Librería | saina (se requiere `saina[local]>=0.4.0` para uso local) |
| Tamaño del repositorio | 1,7 GB |
| Fecha de publicación (metadatos de Hugging Face) | 16 de octubre de 2026 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de que se trata de una especialización de enrutamiento "text-only" de Saina Helm, con pesos fusionados en BF16 que incluyen una cabeza de decisión y el tokenizador. La etiqueta qwen3_5 del repositorio sugiere una base derivada de la familia Qwen3.5, pero no se confirma en la documentación. Tampoco se especifica si emplea atención estándar, lineal o alguna variante híbrida.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el procedimiento de ajuste de la cabeza de decisión. La model card únicamente describe el contrato de entrada y salida: un campo `state` con la petición del usuario y un conjunto de `questions` de tipo `single_choice`, cada una con opciones descritas por identificador, capacidades y coste estimado. El modelo devuelve una probabilidad por opción en lugar de generar texto. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras).

## Capacidades

- Enrutamiento entre modelos candidatos: devuelve una probabilidad por cada opción definida por la aplicación, en lugar de texto generado.
- Selección con criterio coste/calidad: la consulta de ejemplo pide la opción más barata que alcance una calidad estimada de al menos 0,90; si ninguna puede cumplirlo, prioriza la de mayor calidad y, en empate, el menor coste.
- Clasificación de texto genérica bajo el pipeline text-classification, con decisiones de elección única.
- Decisión binaria o multietiqueta acotada: al aceptar opciones definidas por la aplicación, puede usarse para decisiones como "escalar a revisión humana o no" o "usar herramienta A o herramienta B".
- Entrada basada en descripciones: las capacidades y los precios se introducen como texto libre en las descripciones de cada opción; los identificadores son arbitrarios y no se exigen nombres de modelo.
- Salida probabilística interpretable como confianza en la decisión de enrutamiento.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; su rol es la decisión previa al enrutamiento, no la ejecución.
- Capacidades multilingües: no disponibles, no se documenta lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Pasarela de LLM con control de coste: integrado en un gateway interno, recibe cada petición junto con las descripciones y precios de los modelos disponibles y devuelve la opción más económica que cumpla el umbral de calidad exigido por la aplicación.
- Enrutamiento calidad/coste en producción: sustituye heurísticas fijas por una decisión basada en el contenido de la petición, enviando las consultas simples a modelos baratos y reservando los caros para las que lo requieran.
- Orquestación de agentes multi-modelo: en un pipeline con varios agentes, decide qué modelo atiende cada subtarea en función de la capacidad declarada y del coste estimado, reduciendo el gasto total del flujo.
- Triaje en atención al cliente: permite separar consultas rutinarias (respuestas breves, redacción cotidiana) de consultas complejas sin necesidad de generar texto, con una sola inferencia de 0,85 B de parámetros.
- Selección de modelo para generación de código: si se describen como opciones un modelo pequeño y uno avanzado con su coste por petición, el router elige el candidato adecuado para cada solicitud de código o de refactorización.
- Optimización de presupuesto en pipelines de datos: para tareas masivas de clasificación y enriquecimiento, selecciona el modelo más barato que alcance el umbral, controlando el coste agregado por lote.
- Experimentación A/B y comparación de proveedores: al permitir opciones con identificadores arbitrarios, facilita repartir tráfico entre proveedores con políticas de coste distintas y medir el impacto en calidad y gasto.
- Encaminamiento hacia revisión humana: usado como clasificador de elección única entre "resolver automáticamente" y "escalar a una persona", con la probabilidad como medida de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de evaluación, el modelo acumula 0 descargas y 0 "me gusta" en el momento de la consulta, y la propia model card advierte de que se trata de una versión experimental y pide medir la calidad del enrutamiento y el coste total en la carga de trabajo propia antes de confiar en él.

## Requisitos de hardware

- Pesos BF16 de 852.985.920 parámetros: aproximadamente 1,7 GB en disco, en línea con el tamaño del repositorio.
- VRAM estimada para inferencia: del orden de 2,5 a 3,5 GB en BF16/FP16 contando activaciones y sobrecarga del runtime; en torno a 1,2-1,5 GB con cuantización int8 y 0,8-1 GB en int4. Son estimaciones derivadas del número de parámetros, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en BF16. Cabe en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, L4, A10G, A100 y H100, entre otras. No se documenta ninguna recomendación oficial.
- Inferencia en CPU: viable por el tamaño del modelo, aunque no se documenta soporte de llama.cpp ni de formatos GGUF.
- Opciones de despliegue: SDK saina para inferencia local (`saina[local]>=0.4.0`, cargando el checkpoint con una revisión inmutable del Hub) y API alojada en `https://api.saina.run/v1/ask`. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni de servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye modelos comparables ni resultados de evaluación compartidos que permitan una comparación rigurosa. El repositorio no publica benchmarks propios, por lo que cualquier tabla comparativa con otros routers (clasificadores tipo BERT, routers basados en preferencias u otros modelos de enrutamiento) carecería de base verificable.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saina-helm-2-routing-0.8b | 852.985.920 | No disponible | Sin benchmarks publicados | Apache 2.0 | Hugging Face y API alojada del proveedor |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Versión experimental: la propia model card recomienda medir el rendimiento en la carga de trabajo propia antes de depender del modelo.
- Las probabilidades devueltas describen la decisión de enrutamiento y no garantizan la calidad de la respuesta del modelo finalmente elegido.
- Ausencia de benchmarks publicados y de validación por terceros (0 descargas y 0 "me gusta" en el momento de la consulta): no hay evidencia externa de su precisión.
- Idiomas no documentados: no se puede asumir un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: no se puede planificar su uso con peticiones largas o con muchas opciones candidatas.
- Sesgos conocidos: no documentados. Al depender de descripciones de capacidad y de precios introducidos por la aplicación, puede verse influido por la forma en que se redactan esas descripciones o por la ausencia de información de coste.
- Riesgo de enrutamiento erróneo: elegir un candidato barato que no alcance el umbral de calidad degrada la respuesta final; elegir el candidato caro innecesariamente incrementa el coste. No hay métricas publicadas de precisión de enrutamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto, pero sí puede asignar probabilidades altas a opciones inadecuadas.
- Los precios son estimaciones proporcionadas en las descripciones; el modelo no verifica su exactitud ni consulta tarifas reales.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación de conservar los avisos de licencia y de indicar los cambios realizados. Se distribuye sin garantías.
- Dependencia del SDK y del formato de petición propietario (`state` y `questions` con `single_choice`), lo que puede implicar acoplamiento al ecosistema saina en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/run-saina/saina-helm-2-routing-0.8b
- Repositorio del SDK saina: https://github.com/run-saina/saina
- Documentación de la API: https://saina.run/api/
- Endpoint alojado de consulta: https://api.saina.run/v1/ask
- Registro de modelos de la API: https://api.saina.run/v1/models
- Paper: no disponible
- Búsqueda web: no se han encontrado resultados relevantes sobre el modelo; los resultados devueltos corresponden a un videojuego llamado "Run" y a una tienda de material de running, sin relación con este proyecto.
