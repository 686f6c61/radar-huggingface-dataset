# Enwove/flyx-drafters

## Resumen

Flyx-drafters es un repositorio de metadatos publicado por Enwove que no contiene pesos de modelo. Su función es servir como índice de "drafters" (modelos borrador) utilizados por la herramienta de decodificación especulativa flyx, que acelera la inferencia de modelos base sin alterar la salida byte a byte. El repositorio aloja un fichero `drafters.json` que lista pares de modelo base y modelo drafter, junto con el tipo de drafter (`dflash2`, `dspark` o `dspine`).

La relevancia de este repositorio es operativa más que de modelado: permite a flyx descubrir qué drafters existen para un modelo base concreto (por ejemplo, `Qwen/Qwen3-8B` con el drafter `deepseek-ai/dspark_qwen3_8b_block7`) y ordenarlos según la velocidad observada en las ejecuciones del propio usuario. No se publican cifras de rendimiento propias ni benchmarks de ningún tipo.

Al tratarse de un índice sin pesos, no dispone de arquitectura, parámetros, contexto ni idiomas propios. La información disponible se limita al fichero JSON de configuración y a la licencia Apache 2.0. Cualquier dato sobre el modelo subyacente debe consultarse en el repositorio del drafter o del modelo base correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de metadatos, sin pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio declara explicitamente que no contiene pesos) |

## Arquitectura y entrenamiento

No hay arquitectura ni proceso de entrenamiento que describir: el repositorio contiene únicamente un fichero `drafters.json` con estructura `{"version": 1, "drafters": [...]}`. Cada entrada define tres campos: `base` (el modelo base tal como lo nombra su model card, p. ej. `Qwen/Qwen3-8B`), `repo` (el repositorio del drafter en el Hub) y `kind` (el identificador de drafter que flyx reconoce, limitado a `dflash2`, `dspark` o `dspine`).

La innovación técnica asociada no reside en este repositorio sino en flyx: la decodificación especulativa con drafter produce salidas idénticas byte a byte a las de la decodificación normal del modelo base, pero más rápidas. flyx consulta este índice para ofrecer los drafters disponibles de un modelo y los ordena según la velocidad medida en las ejecuciones del usuario, sin publicar métricas propias.

## Capacidades

- Descubrimiento de drafters: flyx lee `drafters.json` y presenta los drafters disponibles para un modelo base dado.
- Ordenación por velocidad observada: el dashboard ordena los drafters según la velocidad de las ejecuciones del propio usuario, no según cifras del autor.
- Selección por tipo de drafter: cada entrada declara un `kind` (`dflash2`, `dspark`, `dspine`) y flyx solo ofrece los tipos que su build es capaz de ejecutar.
- Preservación exacta de la salida: la decodificación especulativa con estos drafters produce la misma salida byte a byte que la decodificación normal.
- No contiene pesos: no ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, capacidades multilingües ni modos de pensamiento por sí mismo.

## Casos de uso

- Acelerar la inferencia de Qwen3-8B en producción: usar el drafter `deepseek-ai/dspark_qwen3_8b_block7` con el modelo base `Qwen/Qwen3-8B` para decodificación especulativa, manteniendo la salida idéntica byte a byte y reduciendo la latencia por token.
- Integración de decodificación especulativa en pipelines existentes: flyx consume el índice para localizar el drafter adecuado sin necesidad de configurar manualmente repositorios del Hub.
- Comparación empírica de drafters: el dashboard ordena los drafters por la velocidad de las ejecuciones del usuario, lo que permite seleccionar el más rápido para el hardware y la carga concretos.
- Despliegue de un servicio de chat con contexto largo: al acelerar la decodificación del modelo base, se reduce el tiempo hasta el primer token completo y el throughput de tokens por segundo en conversaciones multi-turno.
- Generación de código en CI/CD: si el modelo base soporta tool calling, el drafter compatible puede reducir la latencia de las llamadas de generación dentro de pipelines automatizados.
- Investigación sobre decodificación especulativa: usar el índice como catálogo de referencia de drafters por modelo base y tipo (`dflash2`, `dspark`, `dspine`) para experimentos comparativos.
- Selección de drafter por compatibilidad de build: consultar el campo `kind` para elegir solo drafters que la versión de flyx desplegada puede ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explicitamente que flyx no proporciona cifras de velocidad propias; la ordenación se basa en las ejecuciones del usuario.

## Requisitos de hardware

- VRAM estimada: no disponible (el repositorio no contiene pesos; el consumo depende del modelo base y del drafter seleccionado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y del drafter, no de este índice.
- Opciones de despliegue: flyx (herramienta de decodificación especulativa que consume `drafters.json`); otros runners no disponibles.
- Latencia y throughput: no se publican cifras; la ordenación de drafters se realiza con las mediciones del usuario.

## Comparativa con modelos similares

| Repositorio | Tipo | Contiene pesos | Licencia | Funcion |
|---|---|---|---|---|
| Enwove/flyx-drafters | Indice de drafters | No | Apache 2.0 | Catalogo de drafters para flyx |
| deepseek-ai/dspark_qwen3_8b_block7 | Drafter (dspark) | No disponible en la informacion | No disponible | Acelerar Qwen3-8B |
| Qwen/Qwen3-8B | Modelo base | No disponible en la informacion | No disponible | Modelo de lenguaje generativo |

## Limitaciones y advertencias

- No contiene pesos: no puede usarse directamente para inferencia ni para generar texto.
- Dependencia de flyx: el fichero `drafters.json` solo tiene sentido dentro de la herramienta flyx; otros runners no lo consumen.
- Cobertura limitada: solo aparecen los drafters registrados por el autor; modelos base no listados no tienen drafters disponibles a través de este índice.
- Sin métricas propias: no se publican cifras de velocidad ni benchmarks; la ordenación depende de las ejecuciones del usuario y puede variar según hardware y carga.
- Compatibilidad por build: cada entrada declara un `kind` y flyx solo ofrece los tipos que su build ejecuta; drafters de tipos no soportados no estarán disponibles.
- Idiomas: no disponibles; no hay información sobre capacidades multilingües del modelo base ni del drafter.
- Licencia: Apache 2.0 para el repositorio; las licencias de los drafters y modelos base referenciados deben verificarse en sus respectivos repositorios.
- Fecha de creación: el repositorio figura creado el 2026-11-26, fecha futura respecto a la información habitual del Hub; conviene verificar su estado real.
- Sin descargas ni likes registrados: tracción nula en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Enwove/flyx-drafters
- Herramienta flyx: https://github.com/enwove/flyx
- Drafter de ejemplo citado: https://huggingface.co/deepseek-ai/dspark_qwen3_8b_block7
- Modelo base de ejemplo citado: https://huggingface.co/Qwen/Qwen3-8B
