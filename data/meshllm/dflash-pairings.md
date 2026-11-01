# meshllm/dflash-pairings

## Resumen

DFlash Pairings es un repositorio de índices publicado por meshllm que actúa como capa de configuración para el motor de inferencia mesh-llm. No contiene pesos de un modelo generativo, sino un fichero `index.json` que asocia la identidad GGUF de un modelo objetivo (arquitectura, número de capas ejecutables, anchura, número de expertos y familia opcional) con el modelo borrador de DFlash que mesh-llm utiliza por defecto para decodificación especulativa. Cada emparejamiento queda fijado por revisión de Hugging Face y hash SHA-256, lo que garantiza reproducibilidad entre versiones del motor.

La relevancia del repositorio es operativa: la decodificación especulativa solo aporta aceleración real si el borrador está bien emparejado con el objetivo, y ese emparejamiento depende de la arquitectura concreta del modelo destino. En lugar de que cada usuario elija manualmente un borrador, mesh-llm consume este índice curado y aplica el par que mejor se comportó en las mediciones del autor.

Los emparejamientos se seleccionaron a partir de velocidad de decodificación medida en DGX Spark (CUDA) y en Apple M3 Ultra / M6 (Metal). Un par solo se marca como predeterminado en un backend si superó la decodificación sin especulación en ese hardware. No se publican parámetros, contexto ni datos de entrenamiento porque el artefacto no es un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: índice de configuración para decodificación especulativa (no contiene pesos) |
| Parametros totales | No disponible (no es un modelo de pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los emparejamientos se indexan por identidad GGUF del modelo objetivo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; el artefacto principal es `index.json` (JSON), con referencias a revisiones y SHA-256 de modelos borrador DFlash |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su función es servir de tabla de enrutamiento: `index.json` mapea una clave derivada del GGUF objetivo (arquitectura, número de capas ejecutables, anchura, número de expertos y, opcionalmente, familia) al borrador DFlash correspondiente, junto con la revisión de Hugging Face y el SHA-256 que fijan exactamente qué artefacto se descarga, la tapa de borrador por defecto y los backends en los que ese par es el predeterminado.

El criterio de selección es empírico y específico por backend. Cada par se eligió a partir de velocidad de decodificación medida en DGX Spark (CUDA) y Apple M3 Ultra / M6 (Metal), y solo se promueve a predeterminado en un backend donde batió a la decodificación sin especulación. Existe además un mecanismo de precedencia: los paquetes de capas pueden declarar su propio borrador en `generation.speculative_decoding.proposers` con `kind: dflash`, y esa declaración prevalece sobre el índice. Cada release de mesh-llm confía en una revisión exacta de este repositorio, de modo que la actualización del índice y la del motor están acopladas.

## Capacidades

- Resolución automática del borrador DFlash adecuado para un modelo objetivo GGUF dado, a partir de su arquitectura, capas ejecutables, anchura y número de expertos.
- Fijación criptográfica de artefactos mediante SHA-256 y revisión de Hugging Face, lo que permite descargas verificables y reproducibles.
- Selección de par dependiente del backend: un mismo objetivo puede tener borrador predeterminado distinto en CUDA y en Metal.
- Aplicación de una tapa de borrador por defecto por emparejamiento.
- Mecanismo de anulación por paquete: una declaración explícita en `generation.speculative_decoding.proposers` tiene prioridad sobre el índice.
- Versionado acoplado al motor: cada release de mesh-llm confía en una revisión concreta del índice.
- No ofrece generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües propias; esas capacidades pertenecen al modelo objetivo y al borrador DFlash referenciados.

## Casos de uso

- Despliegue de mesh-llm con decodificación especulativa sin configuración manual: el motor lee `index.json`, identifica el GGUF cargado y descarga el borrador DFlash fijado por revisión y SHA-256, evitando que el operador tenga que buscar y validar el borrador a mano.
- Aceleración de inferencia en DGX Spark: para objetivos con par validado en CUDA, el índice selecciona el borrador que superó la decodificación sin especulación en ese hardware, lo que se traduce en mayor throughput de tokens por segundo en el mismo equipo.
- Aceleración en estaciones Apple Silicon: en M3 Ultra y M6, el índice aplica el par medido en Metal, relevante para equipos de desarrollo y prototipado que ejecutan modelos GGUF localmente sin GPU dedicada.
- Reproducibilidad de resultados en investigación: al fijar revisión y hash del borrador, dos ejecuciones del mismo release de mesh-llm sobre el mismo objetivo cargan exactamente los mismos artefactos, lo que facilita comparar latencias y validar experimentos.
- Auditoría de cadena de suministro de modelos: el SHA-256 por emparejamiento permite verificar que el borrador descargado es el que el índice declara, útil en entornos con requisitos de integridad de artefactos.
- Integración en pipelines internos de despliegue: el formato JSON permite que herramientas propias consulten el índice para decidir qué borrador provisionar junto a cada modelo objetivo en un clúster con backends heterogéneos (CUDA y Metal).
- Personalización controlada: un paquete de capas puede declarar su propio borrador en `generation.speculative_decoding.proposers` cuando el par del índice no encaja, manteniendo el resto de la cadena bajo el índice curado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los emparejamientos se eligieron a partir de velocidad de decodificación medida en DGX Spark (CUDA) y Apple M3 Ultra / M6 (Metal), y que un par solo es predeterminado en un backend donde superó la decodificación sin especulación, pero no se incluyen cifras de tokens por segundo, latencia ni tasas de aceptación del borrador.

## Requisitos de hardware

- El repositorio en sí no requiere GPU: es un fichero JSON de pequeño tamaño que se descarga y se consulta.
- El consumo de VRAM lo determinan el modelo objetivo y el borrador DFlash referenciado, no este índice; no se publican cifras en la información disponible.
- Hardware de referencia en las mediciones citadas: DGX Spark (CUDA) y Apple M3 Ultra / M6 (Metal).
- Despliegue: se consume a través del motor mesh-llm, que fija una revisión concreta del índice por release. No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles como cifras; el criterio declarado es que el par supere la decodificación sin especulación en el backend correspondiente.

## Comparativa con modelos similares

| Aspecto | meshllm/dflash-pairings | Índices de borradores integrados en el motor | Selección manual de borrador por el usuario |
|---|---|---|---|
| Naturaleza | Índice JSON curado y versionado | Lista embebida en el código del motor | Elección ad hoc en tiempo de ejecución |
| Verificación de integridad | Revisión de Hugging Face y SHA-256 por par | Depende de la implementación | Habitualmente ausente |
| Ajuste por backend | Sí (CUDA y Metal medidos por separado) | Variable | Manual, sin medición sistemática |
| Precedencia configurable | Sí, vía `generation.speculative_decoding.proposers` | No aplica | No aplica |
| Actualización | Acoplada al release de mesh-llm | Acoplada al release del motor | A cargo del usuario |
| Licencia | Apache 2.0 | No disponible | No aplica |

No se dispone de información sobre otros repositorios de índices de decodificación especulativa comparables publicados por terceros.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni ofrece ninguna capacidad de inferencia por sí mismo; confundirlo con un modelo lleva a expectativas incorrectas.
- Cobertura limitada a los objetivos GGUF incluidos en `index.json`; un modelo objetivo ausente del índice no obtiene borrador predeterminado.
- Los emparejamientos están validados solo en DGX Spark (CUDA) y Apple M3 Ultra / M6 (Metal); en otros backends o GPUs no hay garantía de que el par supere la decodificación sin especulación.
- La clave de búsqueda depende de la identidad GGUF declarada (arquitectura, capas ejecutables, anchura, expertos, familia); variaciones en esa metadata pueden impedir la resolución del par.
- El índice está acoplado a releases concretos de mesh-llm: usar una versión del motor distinta de la esperada puede provocar desajustes entre índice y binario.
- Sin datos publicados de benchmarks, latencia, throughput ni tasa de aceptación; las afirmaciones de mejora son relativas a la decodificación sin especulación y no cuantificadas en la información disponible.
- Sin información sobre sesgos, alucinación o cobertura idiomática, al no tratarse de un modelo lingüístico.
- Licencia Apache 2.0 permite uso comercial del índice, pero las licencias de los modelos objetivo y de los borradores DFlash referenciados deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/meshllm/dflash-pairings
- Fichero de índice: https://huggingface.co/meshllm/dflash-pairings/blob/main/index.json
- Organización del autor: https://huggingface.co/meshllm
- Motor mesh-llm: no disponible en la información proporcionada
- Paper o blog técnico sobre DFlash: no disponible en la información proporcionada
