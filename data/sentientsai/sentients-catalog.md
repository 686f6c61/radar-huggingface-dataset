# sentientsai/sentients-catalog

## Resumen

`sentientsai/sentients-catalog` no es un modelo de lenguaje, sino un repositorio de catálogo de modelos asociado al plugin Sentients para Unreal Engine. Contiene un fichero `catalog.json` firmado con Ed25519 (`catalog.json.sig`) que enumera los modelos que ejecuta el plugin, incluyendo para cada uno su núcleo, tipo y configuración, así como el tamaño, SHA-256, runtimes y procedencia de cada fichero, junto con los espejos que los sirven. El plugin verifica la firma contra las claves públicas compiladas en `keys.json` antes de leer un solo byte del catálogo.

Su relevancia es de infraestructura más que de inferencia: actúa como mecanismo de distribución y verificación de integridad para un ecosistema de modelos orientado a Unreal Engine. La versión del catálogo es la 2 y los ficheros de modelo residen en repositorios de la misma organización, uno por carpeta de modelo, cada uno fijado a un commit concreto.

No se dispone de información sobre arquitectura, tamaño, contexto ni capacidades de ningún modelo concreto, ya que la model card únicamente describe el catálogo y su esquema de firma. Cualquier dato de rendimiento o especificación de un modelo individual requeriría consultar los repositorios referenciados, que no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de catálogo, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el catálogo referencia ficheros de modelo con SHA-256 y runtimes, sin detallar formato) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, por lo que no aplica arquitectura de red ni proceso de entrenamiento. Su "arquitectura" es la de un catálogo firmado: un `catalog.json` con estructura versionada (versión 2) que describe, por cada modelo, su núcleo, tipo y configuración, y por cada fichero, su tamaño, hash SHA-256, runtimes compatibles y procedencia, además de los espejos que los sirven.

El mecanismo de confianza se basa en criptografía de clave pública Ed25519: el catálogo se firma (`catalog.json.sig`) y el plugin Sentients para Unreal Engine valida la firma contra las claves públicas en `keys.json`, que están compiladas dentro del propio plugin. La verificación ocurre antes de leer el catálogo, lo que garantiza integridad y autenticidad del índice de modelos. Los ficheros de modelo se alojan en repositorios de la organización, uno por carpeta de modelo, cada uno fijado a un commit, lo que aporta reproducibilidad.

## Capacidades

- Distribución verificada de un índice de modelos para el plugin Sentients de Unreal Engine.
- Firma digital Ed25519 del catálogo (`catalog.json.sig`) con verificación previa a la lectura.
- Listado por modelo de núcleo, tipo y configuración.
- Metadatos por fichero: tamaño, SHA-256, runtimes y procedencia.
- Referencia a espejos que sirven los ficheros de modelo.
- Fijación de cada carpeta de modelo a un commit concreto.
- Versionado del esquema del catálogo (versión 2).

## Casos de uso

- Integración en el plugin Sentients: el plugin lee `catalog.json` tras validar la firma para descubrir qué modelos puede ejecutar y con qué configuración, evitando cargar índices manipulados.
- Verificación de integridad en pipelines de build: un paso de CI puede comprobar el SHA-256 de cada fichero de modelo contra el catálogo antes de empaquetar un build de Unreal Engine.
- Distribución multi-espejo: los espejos declarados en el catálogo permiten al plugin resolver la descarga de un modelo desde varias fuentes manteniendo la misma referencia de integridad.
- Reproducibilidad de entornos: al fijar cada carpeta de modelo a un commit, se puede reconstruir exactamente el conjunto de modelos usado en una versión concreta de una aplicación.
- Auditoría de procedencia: los campos de procedencia y los hashes permiten trazar el origen de cada fichero de modelo en una organización.
- Rotación de claves de confianza: la separación entre `keys.json` (compilado en el plugin) y la firma del catálogo permite gestionar la confianza de forma centralizada en despliegues de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos de modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica inferencia; el consumidor previsto es el plugin Sentients para Unreal Engine.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen repositorios comparables de catálogos firmados para plugins de Unreal Engine en la información proporcionada, y este repositorio no es un modelo de lenguaje, por lo que no procede compararlo con LLM.

## Limitaciones y advertencias

- No es un modelo: no genera texto, código ni realiza inferencia; cualquier expectativa de uso como LLM es incorrecta.
- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin consultar al autor.
- La confianza depende de las claves públicas compiladas en el plugin (`keys.json`); si esas claves se ven comprometidas, la verificación de firma pierde garantías.
- El catálogo solo cubre los modelos publicados en la organización `sentientsai`; no se detalla qué modelos concretos incluye ni sus características.
- Los enlaces a espejos y repositorios de modelos no se enumeran en la información disponible, lo que limita la verificación manual.
- Sin datos de idiomas, sesgos ni alucinación aplicables, al no tratarse de un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/sentientsai/sentients-catalog
- Firma del catálogo: `catalog.json.sig` (referenciada en la model card, sin URL directa disponible)
- Claves públicas: `keys.json` (compilado en el plugin Sentients para Unreal Engine, sin URL directa disponible)
- Repositorios de modelos de la organización: no disponibles en la información proporcionada
