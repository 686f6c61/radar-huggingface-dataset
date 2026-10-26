# Mensamayne/dustmap-models

## Resumen

`Mensamayne/dustmap-models` es un repositorio de pesos que agrupa dos paquetes ONNX de apoyo para Dustmap, una herramienta de análisis estático de código escrita en Node.js que genera informes de código muerto, copias y duplicidades. No se trata de un modelo generativo ni de un LLM: son dos artefactos pequeños y especializados —un modelo de embeddings que convierte funciones en vectores y un «pair judge» que decide si dos fragmentos de código realizan el mismo trabajo— que se descargan de forma opcional y solo se usan cuando el usuario activa la capa semántica de la herramienta.

El autor es Mensamayne, mantenedor del proyecto Dustmap, y publica estos paquetes bajo licencia MIT. El codificador base declarado es `microsoft/unixcoder-base` (Apache-2.0), sobre el que se han entrenado los dos cabezales. El repositorio ocupa 1,2 GB en total e incluye, por cada paquete, una carpeta con un `manifest.json` y los ficheros listados en él, verificados mediante SHA-256 antes de su uso. Los paquetes se instalan con `dustmap model pull dustmap-same-meaning` y `dustmap model pull dustmap-pair-judge`.

Su relevancia es acotada y muy específica: cubre el caso de uso de deduplicación semántica de código en pipelines de análisis, donde las heurísticas textuales fallan porque dos funciones pueden ser equivalentes con nombres y estructura distintos. Ahora bien, el repositorio no publica métricas, no declara idiomas soportados, no tiene descargas ni validación externa y fue creado en octubre de 2026, por lo que cualquier evaluación de producción debe hacerse por cuenta del integrador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer exportado a ONNX; codificador base `microsoft/unixcoder-base` |
| Parametros totales | No disponible (no se publica el recuento de parámetros de los paquetes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen ficheros ONNX; no se especifica precisión ni cuantización) |
| Idiomas soportados | No disponible (orientado a código fuente; no se declara cobertura de lenguajes de programación ni naturales) |
| Licencia | MIT para los paquetes; Apache-2.0 para el codificador base `microsoft/unixcoder-base` |
| Formato de pesos | ONNX, organizados en carpetas `<id>/` con `manifest.json` y ficheros verificados por SHA-256 |
| Tamano del repositorio | 1,2 GB |
| Componentes | `dustmap-same-meaning` (embeddings función → vector) y `dustmap-pair-judge` (par de fragmentos → ¿mismo trabajo?) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que ambos paquetes se construyen sobre el codificador `microsoft/unixcoder-base`, un encoder transformer de la familia de los modelos de código, y que se exportan a ONNX para su ejecución local dentro de Dustmap. El paquete `dustmap-same-meaning` produce representaciones vectoriales de funciones; el paquete `dustmap-pair-judge` actúa como clasificador de pares, recibiendo dos fragmentos de código y emitiendo un juicio sobre si realizan la misma tarea. No se detalla si el pair judge es un cross-encoder, un cabezal de clasificación sobre embeddings concatenados o una combinación de ambos.

En cuanto a los datos, el autor indica que los paquetes se entrenaron «para las propias mediciones de Dustmap», incluyendo repositorios privados que el mantenedor acepta publicar como pesos abiertos bajo MIT. No se especifica el número de tokens de entrenamiento, la composición del dataset, los lenguajes de programación cubiertos, ni si hubo fases de ajuste supervisado, contraste o preferencias. Tampoco se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, poda o destilación) más allá de la exportación a ONNX.

## Capacidades

- Generación de embeddings de código: convierte el cuerpo de una función en un vector denso, apto para búsqueda por similitud y agrupamiento.
- Clasificación de equivalencia funcional: el par judge determina si dos fragmentos de código resuelven el mismo trabajo, lo que permite detectar duplicados semánticos que no coinciden textualmente.
- Integración con un pipeline de análisis estático existente (Dustmap), que aporta los detectores textuales y delega en estos modelos la parte semántica.
- Verificación de integridad de los artefactos mediante SHA-256 declarado en `manifest.json` antes de cargarlos.
- Ejecución local: al distribuirse en ONNX, la inferencia no requiere conexión a servicios externos ni claves de API.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo «thinking»: no es un modelo instruccional.
- No se declaran capacidades de visión, audio ni generación de texto libre.
- Cobertura multilingüe de lenguajes de programación: no disponible en la documentación.

## Casos de uso

- Deduplicación semántica en monorepos grandes: indexar todas las funciones con `dustmap-same-meaning`, agrupar por similitud de coseno y revisar manualmente los clústeres; el par judge se usa como segunda pasada para confirmar los candidatos y reducir falsos positivos antes de abrir un ticket de refactor.
- Detección de código muerto con criterio funcional: Dustmap genera un informe de código no referenciado; la capa semántica permite distinguir entre una función realmente huérfana y una reimplementación de otra ya existente, que es justo el caso que las heurísticas textuales no resuelven.
- Auditoría previa a una fusión de repositorios: al integrar dos bases de código, ejecutar el par judge sobre los pares más similares entre ambos árboles para localizar funcionalidad duplicada y planificar la consolidación.
- Migraciones y reescrituras de módulos: comparar el código antiguo y el nuevo función a función para verificar que la reescritura cubre el mismo trabajo, usando el par judge como comprobación automatizada en la revisión de la pull request.
- Búsqueda semántica interna de funciones: usar los embeddings para construir un índice vectorial sobre el que un asistente interno responda «¿dónde está la función que hace X?», sin depender de coincidencia exacta de nombres.
- Priorización de revisiones de código: en un pipeline de CI, marcar las pull requests que introducen fragmentos con alta similitud respecto a código ya presente, para dirigir el esfuerzo de revisión a los cambios realmente nuevos.
- Etiquetado de datasets de código: generar pares positivos y negativos (mismo trabajo / distinto trabajo) para entrenar o evaluar otros modelos de análisis, aprovechando el par judge como anotador automático con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación, precisión del par judge, ni comparaciones con otros modelos de embeddings de código, y el repositorio no cuenta con descargas ni evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica el número de parámetros ni la precisión de los ficheros ONNX, por lo que no puede calcularse una cifra fiable.
- Huella en disco: 1,2 GB para el repositorio completo, repartidos entre los dos paquetes (`dustmap-same-meaning` y `dustmap-pair-judge`).
- GPU recomendadas: no disponibles. Al ser un encoder en ONNX con pase forward único, es esperable que se ejecute en CPU, pero no hay datos oficiales de latencia ni de soporte de proveedores de ejecución (CUDA, TensorRT, CoreML).
- Encaje en GPU de consumo: no confirmado. Dado el tamaño del artefacto, es plausible que quepa en tarjetas consumer, pero es una inferencia a partir del tamaño del fichero, no un dato publicado.
- Opciones de despliegue: el mecanismo previsto es la CLI de Dustmap (`dustmap model pull <id>`), que requiere Node 20 o superior; el paquete no está publicado en npm y debe instalarse clonando el repositorio. El runtime ONNX concreto no se especifica.
- Throughput y latencia: no disponibles. El coste real dependerá del número de funciones del repositorio analizado y de si el par judge se aplica a todos los pares candidatos o solo a los más similares.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas evaluadas en las mismas condiciones, por lo que la comparación se limita a aspectos de disponibilidad y licencia.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mensamayne/dustmap-models` | Encoder ONNX para embeddings de código y juicio de pares | No disponible | No disponible | MIT (paquetes) / Apache-2.0 (base) | Hugging Face, 0 descargas, sin npm |
| `microsoft/unixcoder-base` | Encoder de código (modelo base) | No disponible en esta información | No disponible | Apache-2.0 | Hugging Face, público y ampliamente utilizado |
| Modelos de embeddings de código genéricos | Encoder para recuperación de código | No disponible | No disponible | Variable según modelo | Hugging Face y proveedores de inferencia |

No se han encontrado en la búsqueda web alternativas directamente comparables en la categoría de «juez de equivalencia funcional» integrado en una herramienta de análisis estático.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay benchmarks, matriz de confusión ni tasas de falsos positivos publicadas para el par judge, lo que impide calibrar un umbral de decisión con datos.
- Sesgo de dominio: los modelos se entrenaron sobre las mediciones del propio mantenedor, incluyendo repositorios privados no descritos; es previsible un sesgo hacia sus convenciones de estilo, lenguaje y estructura de proyecto.
- Idiomas y lenguajes no declarados: se desconoce qué lenguajes de programación cubre y con qué calidad; el rendimiento fuera de ese conjunto es una incógnita.
- Riesgo de error semántico: dos funciones pueden producir el mismo resultado con contratos distintos (efectos secundarios, complejidad, manejo de errores) y ser clasificadas como «mismo trabajo»; conviene usar el juicio como señal, no como veredicto, en refactors destructivos.
- Naturaleza no generativa: no puede explicar por qué dos fragmentos son equivalentes ni generar parches; solo emite un vector o una etiqueta.
- Dependencia del ecosistema: la vía de uso prevista es Dustmap, que requiere Node 20+, no está en npm y debe instalarse desde el repositorio; el paquete de modelos no tiene sentido de forma aislada.
- Doble licencia: los pesos y el manifiesto son MIT, pero el codificador base es Apache-2.0; en uso comercial conviene conservar los avisos de ambas licencias y revisar los términos de los repositorios privados usados en el entrenamiento.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día (26 de octubre de 2026); no hay evidencia de uso en producción ni de mantenimiento continuado.
- Sin garantías: al distribuirse bajo MIT, el software se ofrece «tal cual», sin garantía de exactitud de los informes generados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mensamayne/dustmap-models
- Repositorio de Dustmap en GitHub: https://github.com/Mensamayne/dustmap
- Codificador base: https://huggingface.co/microsoft/unixcoder-base
