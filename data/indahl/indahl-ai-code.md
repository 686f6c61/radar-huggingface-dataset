# indahl/indahl.ai-code

## Resumen

`indahl/indahl.ai-code` es un repositorio de Hugging Face publicado por el usuario `indahl` (Heuremen LLC) que no contiene un modelo de lenguaje entrenado, sino una copia del contenido de la carpeta `code/` del repositorio de GitHub `Heuremen-LLC/indahl.ai`, fijada en el commit `92cd25563`. El autor lo describe explícitamente como "every file as in the repository" y lo separa del repositorio principal `indahl/indahl.ai` porque Hugging Face limita a 20.000 el número de ficheros por repositorio. Por tanto, se trata de un artefacto de distribución de código fuente, no de pesos de un modelo.

El repositorio ocupa 0,2 GB y fue creado el 15 de noviembre de 2026, con una actualización tres minutos posterior. No declara pipeline, idiomas soportados ni parámetros, y su licencia es `other` con un fichero `LICENSE.txt` aparte. Los tags (`source-code`, `indahl`, `heuremen`) confirman la naturaleza del contenido.

La relevancia de esta ficha es fundamentalmente aclaratoria: cualquiera que encuentre el identificador en un índice de modelos debe saber que no hay un LLM aquí, sino código. No se dispone de información sobre arquitectura, entrenamiento, benchmarks ni capacidades de inferencia, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un repositorio de código fuente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `other` (ver `LICENSE.txt` en el repositorio) |
| Formato de pesos | no aplica; el repositorio contiene ficheros de código fuente |
| Tamano del repositorio | 0,2 GB |
| Commit de referencia | `92cd25563` del repositorio `Heuremen-LLC/indahl.ai` |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que describir. El repositorio es un volcado de ficheros de la carpeta `code/` del proyecto `indahl.ai` de Heuremen LLC, publicado en Hugging Face como mecanismo de espejo o distribución. La decisión de separarlo del repositorio principal responde a una limitación de la plataforma (máximo 20.000 ficheros por repositorio), según indica el propio autor en la model card.

No se especifica en la información disponible qué lenguaje o lenguajes de programación contiene la carpeta, ni si incluye dependencias, binarios o artefactos de build. Tampoco se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación técnica asociada, porque el artefacto no es un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código por inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM.
- Su función es servir como espejo/archivo del código fuente del proyecto `indahl.ai` alojado en GitHub.
- Útil para descargar el árbol de código `code/` sin clonar el repositorio completo de GitHub, o para verificar el estado del proyecto en el commit `92cd25563`.

## Casos de uso

- Archivado y preservación del código fuente: descargar el repositorio de Hugging Face para conservar una copia del árbol `code/` en el commit `92cd25563`, independiente de la disponibilidad de GitHub.
- Distribución en entornos con acceso restringido a GitHub: usar el espejo de Hugging Face cuando la red corporativa o de investigación solo permite tráfico hacia dominios de Hugging Face.
- Auditoría de dependencias y licencias: inspeccionar los ficheros del proyecto para revisar cabeceras de licencia, dependencias declaradas y cumplimiento antes de integrar `indahl.ai` en otro producto.
- Reproducibilidad de builds: fijar el commit `92cd25563` como referencia exacta del código para reconstruir un entorno de ejecución o comparar con versiones posteriores del repositorio de GitHub.
- Análisis estático y de seguridad: ejecutar herramientas SAST sobre el árbol de código descargado para detectar vulnerabilidades antes de desplegar el proyecto.
- Documentación interna: enlazar el espejo en la documentación de un equipo que consuma `indahl.ai`, indicando el commit exacto y la ubicación del `LICENSE.txt`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no aplican métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia que ejecutar.
- Almacenamiento: aproximadamente 0,2 GB para el repositorio completo; conviene reservar algo más para la descompresión o el clonado con historial.
- CPU y RAM: suficientes para clonar y navegar el árbol de ficheros; no hay requisitos de cómputo relevantes.
- Opciones de descarga: `git clone https://huggingface.co/indahl/indahl.ai-code`, `huggingface-cli download indahl/indahl.ai-code` o descarga directa desde la web de Hugging Face.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No disponible. No se conocen repositorios comparables en la información proporcionada, y la categoría (espejo de código fuente) no encaja con la de modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo: cualquier intento de cargarlo con `transformers`, `vLLM`, `llama.cpp` u Ollama fallará porque no contiene pesos ni configuración de arquitectura.
- Licencia `other` con fichero aparte: es imprescindible leer `LICENSE.txt` antes de reutilizar, modificar o redistribuir el código; las condiciones comerciales no están resumidas en la model card.
- Sin metadatos de idioma, pipeline ni parámetros: los índices y filtros de Hugging Face pueden clasificarlo erróneamente como modelo.
- Ausencia de documentación sobre el contenido: no se detalla qué lenguaje, framework ni propósito tiene el código de `indahl.ai`, por lo que hay que inspeccionarlo directamente.
- Riesgo de desactualización: el espejo está fijado en el commit `92cd25563`; el repositorio de GitHub puede haber avanzado y no hay garantía de sincronización futura.
- Sin garantías de calidad ni soporte: no hay tests, CI ni issues asociados documentados en la información disponible.
- Fechas de creación y actualización en 2026: conviene verificar la vigencia del proyecto antes de basarse en él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/indahl/indahl.ai-code
- Repositorio principal en Hugging Face: https://huggingface.co/indahl/indahl.ai
- Repositorio en GitHub: https://github.com/Heuremen-LLC/indahl.ai
- Fichero de licencia: https://huggingface.co/indahl/indahl.ai-code/blob/main/LICENSE.txt
- Sitio del proyecto: https://indahl.ai
