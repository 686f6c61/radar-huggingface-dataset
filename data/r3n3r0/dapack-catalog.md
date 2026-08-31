# R3n3r0/dapack-catalog

## Resumen

El repositorio `R3n3r0/dapack-catalog` no contiene un modelo de lenguaje completo, sino el componente de orquestación de un sistema de catálogo de modelos especializados denominado dapack. Desarrollado por R3n3r0, este repositorio actúa como el "pegamento" que une tres modelos GGUF independientes (matemáticas, lenguaje y código) en un único catálogo enrutable. Incluye un manifiesto con detección TF-IDF, centroides de embeddings y hashes de ficheros, además del modelo de embeddings `nomic-embed-text-v1.5` en cuantización Q8 (136,7 millones de parámetros, 140 MB) que alimenta el router denso.

La relevancia actual reside en su enfoque práctico para sistemas multi-modelo: en lugar de un único LLM gigante, se enrutan las consultas al modelo especializado más adecuado según la capacidad medida. El router ofrece tres modos (TF-IDF, embeddings y ensamblado) con una precisión de enrutado del 89% en un conjunto de validación congelado. El proyecto se distribuye bajo licencia MIT e incluye binarios del runtime en GitHub, sin necesidad de compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings transformer (nomic-embed-text-v1.5) + router de catálogo (TF-IDF y centroides) |
| Parametros totales | 136.727.040 (solo el modelo de embeddings) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo de embeddings tiene su propio contexto, no especificado) |
| Tipos de cuantizacion | Q8 (para el modelo de embeddings) |
| Idiomas soportados | no disponible (el manifiesto no especifica idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (embed/nomic-embed.gguf) + manifest.json |

Nota: los parámetros totales corresponden únicamente al modelo de embeddings incluido. El catálogo completo depende de tres modelos GGUF adicionales alojados en repositorios separados (`dapack-math`, `dapack-language`, `dapack-code`).

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo de embeddings, ya que este es un modelo preexistente (`nomic-embed-text-v1.5`) cuantizado a Q8. La innovación principal reside en la capa de enrutamiento: un manifiesto JSON que contiene dominios, manifiestos de capacidades medidos, un detector TF-IDF y centroides de embeddings. El router ensemble combina ambos métodos (TF-IDF y embeddings) con una ponderación 30/70, logrando una precisión de enrutado del 89% en un conjunto de validación congelado, mientras que cada método por separado falla en tipos de consultas distintos.

El sistema incluye una "puerta de capacidades" que evalúa qué pack ha perdido capacidad de forma medible y enruta la solicitud a un pack alternativo, o la rechaza con un motivo explícito. No se proporcionan datos sobre el entrenamiento del router en sí (tamaño del dataset, metodología de medición de capacidades, etc.).

## Capacidades

- Enrutamiento de consultas a modelos especializados (matemáticas, lenguaje, código) mediante tres modos: TF-IDF (sin memoria extra, ~0,1 ms), embeddings (dense, ~145 MB VRAM, ~5 ms por petición) y ensamblado (mezcla 30/70, precisión 89%).
- Detección de capacidades perdidas: el sistema mide qué capacidades ha perdido cada pack y enruta a un pack alternativo o rechaza la solicitud con una razón.
- Integración con el runtime dapack: permite servir el catálogo completo como un endpoint HTTP (`./dapack serve mycatalog.dapack --addr :8080`).
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el catálogo puede exponerse como API compatible con endpoints estándar.
- Extracción de características (feature-extraction) mediante el modelo de embeddings incluido.
- Selección automática de router: el modo `auto` usa el ensemble cuando los ficheros de este repositorio están presentes, y TF-IDF en caso contrario.

## Casos de uso

- Despliegue de un sistema multi-modelo especializado: en lugar de cargar un único LLM gigante, se pueden servir tres modelos GGUF (matemáticas, lenguaje, código) detrás de un único endpoint que enruta automáticamente las consultas al modelo más adecuado según la capacidad medida.
- Filtrado de consultas por dominio: una aplicación que recibe peticiones heterogéneas (cálculo, redacción, programación) puede usar el router TF-IDF para clasificar la petición y dirigirla al pack correspondiente sin coste adicional de memoria.
- Sistema de respaldo ante degradación de modelos: la puerta de capacidades permite detectar cuándo un modelo especializado ha perdido precisión en una tarea concreta y redirigir esas consultas a otro modelo del catálogo, manteniendo la calidad del servicio.
- Evaluación comparativa de routers: el repositorio sirve como referencia para medir la precisión de enrutado entre TF-IDF y embeddings, con un conjunto de validación congelado y una métrica clara (89% ensemble).
- Infraestructura de bajo coste para entornos con recursos limitados: el modo TF-IDF no requiere memoria extra y opera en ~0,1 ms, adecuado para entornos embebidos o de alto rendimiento donde no se puede cargar un modelo de embeddings.
- Catálogo de modelos versionado: el manifest.json incluye hashes de ficheros, permitiendo verificar la integridad de los modelos y gestionar actualizaciones de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo de embeddings (nomic-embed-text-v1.5) en la informacion disponible. El unico dato de rendimiento proporcionado es la precision de enrutado del router ensemble sobre un conjunto de validacion congelado:

| Metodo de router | Precision de enrutado | Memoria adicional | Latencia por peticion |
|---|---|---|---|
| TF-IDF | no especificado | 0 MB | ~0,1 ms |
| Embeddings | no especificado | ~145 MB VRAM | ~5 ms |
| Ensemble (30/70) | 89% | ~145 MB VRAM | ~5 ms |

No se aportan comparaciones con otros sistemas de enrutado ni benchmarks de los modelos subyacentes (math, language, code).

## Requisitos de hardware

- El router TF-IDF no requiere memoria adicional y funciona en CPU con latencia de ~0,1 ms.
- El router por embeddings requiere ~145 MB de VRAM para el modelo Q8 de nomic-embed-text-v1.5, con latencia de ~5 ms por peticion.
- El modelo de embeddings en Q8 (140 MB) puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas modernas o GPUs de gama baja como la NVIDIA GTX 1650 o superior.
- Para el modo ensemble, se necesitan simultaneamente el modelo de embeddings y el detector TF-IDF, por lo que la VRAM requerida es la misma que para el modo embeddings (~145 MB).
- El despliegue se realiza mediante el runtime dapack (binarios precompilados en GitHub), que sirve el catalogo como endpoint HTTP. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la informacion disponible.
- El throughput estimado depende del router elegido: TF-IDF puede gestionar miles de peticiones por segundo en CPU, mientras que el modo embeddings soporta cientos de peticiones por segundo en GPU (dato estimado a partir de la latencia de 5 ms, no medido oficialmente).

## Comparativa con modelos similares

No se dispone de informacion sobre sistemas de enrutado de modelos comparables en la documentacion proporcionada. Este repositorio no es un modelo de lenguaje, sino un componente de orquestacion, por lo que la comparativa con otros LLMs no es pertinente. Se podria comparar con sistemas como el enrutamiento de modelos en plataformas tipo OpenRouter, pero no hay datos objetivos en la informacion disponible para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no incluye los modelos de lenguaje en si mismo; requiere descargar los tres packs adicionales (`dapack-math`, `dapack-language`, `dapack-code`) para funcionar. Sin ellos, el catalogo esta incompleto.
- La precision de enrutado del 89% en el modo ensemble se ha medido sobre un conjunto de validacion congelado, pero no se especifica el tamano ni la composicion de dicho conjunto, por lo que el resultado podria no generalizar a otros dominios.
- El modelo de embeddings (nomic-embed-text-v1.5) tiene limitaciones propias de su arquitectura: no soporta tareas de generacion, solo extraccion de caracteristicas. Su contexto maximo no se indica en la documentacion.
- No se proporcionan datos sobre sesgos del modelo de embeddings ni de los packs subyacentes. La puerta de capacidades podria rechazar solicitudes si ningun pack conserva la capacidad requerida, lo que puede resultar en falsos negativos.
- La licencia MIT cubre este repositorio, pero los modelos GGUF incluidos en los packs podrian tener licencias diferentes; se debe verificar cada repositorio individual antes de un uso comercial.
- El proyecto parece estar en una fase inicial (creado en agosto de 2026, sin descargas ni likes), por lo que la madurez y el soporte de la comunidad son limitados.
- No se documentan requisitos de version de CUDA, drivers ni sistema operativo para el runtime dapack, lo que puede dificultar el despliegue en entornos heterogeneos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/R3n3r0/dapack-catalog
- Repositorio del pack de codigo: https://huggingface.co/R3n3r0/dapack-code
- Runtime y documentacion (GitHub): https://github.com/R3n3r0/dapack
- Discusiones del pack de codigo: https://huggingface.co/R3n3r0/dapack-code/discussions (contiene instrucciones de uso con llama.cpp, aunque no se detallan en la informacion disponible)

No se han encontrado papers academicos, demos web ni otros repositorios relacionados en los resultados de busqueda proporcionados.
