# Sauzze22/zero-packs

## Resumen

ZERO packs no es un modelo de inteligencia artificial, sino un paquete de referencia en formato JSON diseñado para la aplicación ZERO, un asistente privado que funciona en el dispositivo. Lo desarrolla el autor Sauzze22 y se distribuye bajo licencia MIT. El objetivo del paquete es proporcionar explicaciones breves y revisadas que la aplicación puede consultar cuando el usuario pregunta sobre temas de bienestar.

La relevancia de este paquete radica en su enfoque de privacidad: el teléfono lo descarga una sola vez, verifica su tamaño y hash SHA-256, instala las filas en una base de datos SQLite local y elimina el archivo. No hay comunicación posterior con ningún servidor. No se trata de un modelo de aprendizaje automático, no tiene parámetros, arquitectura ni entrenamiento; es simplemente un conjunto de datos estructurados que la aplicación consulta localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de ML; es un archivo JSON estructurado) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | No aplica (formato de datos: JSON en archivo `pack-v1-0.2.0-draft.pack.json`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El paquete es una colección de explicaciones cortas y revisadas, pensadas para ser consultadas por la aplicación cuando el usuario pregunta algo relacionado con bienestar. El archivo se distribuye con un identificador `pack-v1`, versión `0.2.0-draft` y locale `en`. El proceso de instalación descarga el archivo una vez, comprueba su integridad mediante SHA-256, inserta las filas en una base de datos SQLite local y elimina el archivo del almacenamiento.

## Capacidades

- No realiza generación de texto ni razonamiento propio.
- Proporciona contenido de referencia estático que la aplicación puede mostrar cuando el usuario hace una pregunta relacionada con bienestar.
- No soporta tool calling ni capacidades de agente.
- No tiene capacidades multilingües más allá del inglés (`locale: en`).
- No incluye capacidades de visión, audio ni modo de pensamiento.
- No es apto para atención al cliente, generación de código ni ninguna tarea de IA generativa.

## Casos de uso

- Consulta local de información de bienestar en el asistente ZERO: la aplicación puede responder preguntas sobre bienestar extrayendo explicaciones del paquete almacenado en SQLite, sin necesidad de conexión a internet.
- Funcionamiento completamente privado en el dispositivo: al no volver a descargar el archivo, el asistente no depende de servidores externos para esta funcionalidad.
- Material de referencia para desarrolladores que quieran integrar contenido de bienestar en sus propias aplicaciones, gracias a la licencia MIT y al formato JSON abierto.
- Verificación de integridad y actualización controlada: el mecanismo de verificación SHA-256 permite al desarrollador distribuir actualizaciones de contenido de forma segura.
- Base para futuros paquetes de contenido: el diseño con `id`, `version` y `locale` sugiere que se pueden crear paquetes adicionales para otros temas o idiomas.
- Integración con modos seguros: la documentación indica que el manejo de crisis y el modo seguro para niños nunca leen este paquete, lo que lo hace adecuado como contenido no crítico dentro de un sistema de seguridad mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de aprendizaje automático, no tiene sentido aplicar benchmarks de rendimiento de IA (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es un archivo JSON que se procesa en el dispositivo (teléfono móvil).
- Almacenamiento mínimo: el archivo se descarga una vez y se elimina tras su instalación; los datos se guardan en SQLite local.
- No hay requisitos de VRAM, ni de GPU recomendadas, ni opciones de despliegue con vLLM, llama.cpp, Ollama o TGI.
- El único requisito es un dispositivo que pueda ejecutar la aplicación ZERO y tenga espacio para una base de datos SQLite pequeña.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables porque no se trata de un modelo de lenguaje ni de un sistema de IA generativa. Los sistemas comparables serían bases de datos de contenido estático, pero no se dispone de información para comparar.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no responde preguntas abiertas.
- No es consejo médico: la propia documentación indica que no es consejo médico ni un sustituto de una persona.
- Estado de borrador: la versión es `0.2.0-draft`, por lo que no es una versión final ni estable.
- Solo en inglés: el contenido está en inglés (`locale: en`), no hay soporte para otros idiomas.
- Sin garantías de precisión: el contenido se describe como "revisado" pero no se especifica el proceso de revisión ni su fiabilidad.
- No apto para producción sin revisión previa: dado su estado de borrador, no se recomienda su uso en entornos críticos sin validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/Sauzze22/zero-packs
