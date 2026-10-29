# huihui73/pan-search-code

## Resumen

huihui73/pan-search-code no es un modelo de inteligencia artificial, sino un Space de Hugging Face con SDK Docker que aloja una aplicación web denominada «Pan Search» (búsqueda en la nube + autoguardado, versión de prueba). La herramienta implementa un flujo comunitario de intercambio de recursos de almacenamiento en la nube: los miembros de un grupo buscan recursos, envían peticiones de guardado, un administrador las confirma y la aplicación los transfiere automáticamente a una carpeta de Quark Netdisk (servicio chino de almacenamiento en la nube), eliminando la publicidad de los enlaces y comprobando que los recursos sigan activos.

Tras la confirmación, la aplicación genera enlaces de compartición y conserva el contenido durante 2 días, con limpieza automática al expirar. Para funcionar necesita dos secretos configurados en el Space: `QUARK_COOKIE` (cookie de sesión de Quark) y `ADMIN_KEY` (clave de confirmación del administrador).

Al tratarse de una aplicación y no de un modelo, no existen arquitectura transformer, número de parámetros, ventana de contexto ni pesos descargables. Su interés para desarrolladores es como ejemplo de herramienta comunitaria autoalojada en Spaces, no como modelo de lenguaje. Con 0 descargas y 0 likes, además, carece de cualquier validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una aplicación web en un Space Docker) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no aplica: no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la documentación está escrita en chino) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no incluye pesos; es una aplicación) |
| Tipo de recurso | Space de Hugging Face (aplicación Docker) |
| SDK y puerto | Docker, puerto 7860 |
| Secretos requeridos | `QUARK_COOKIE` y `ADMIN_KEY` |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-29 |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento que describir: el repositorio no contiene pesos ni una model card técnica, sino el README de una aplicación. Por la configuración YAML del Space (`sdk: docker`, `app_port: 7860`), se trata de un contenedor Docker que expone una interfaz web en el puerto 7860.

El flujo de la aplicación, según su README, es el siguiente: un miembro del grupo busca un recurso de netdisk, envía una petición de guardado, un administrador la confirma mediante la `ADMIN_KEY` y la aplicación guarda automáticamente el archivo en la carpeta de autoguardado de Quark, eliminando la publicidad del enlace y verificando que el recurso siga disponible. A continuación genera un enlace de compartición y programa el borrado automático del contenido a los 2 días. No se dispone de información sobre el stack interno (framework web, base de datos, planificador de tareas) ni sobre el código fuente, que no está descrito en la información disponible.

## Capacidades

- Búsqueda de recursos en servicios de almacenamiento en la nube (netdisk), orientada a miembros de una comunidad o grupo.
- Flujo de peticiones con confirmación administrativa: los usuarios envían solicitudes de guardado y un administrador las aprueba mediante una clave secreta (`ADMIN_KEY`).
- Autoguardado en Quark Netdisk en una carpeta dedicada de guardado automático.
- Limpieza de enlaces compartidos (eliminación de publicidad incrustada) y verificación de que el recurso sigue activo antes de guardarlo.
- Generación automática de enlaces de compartición tras el guardado.
- Retención temporal: el contenido se conserva 2 días y se elimina automáticamente al expirar.
- Capacidades de IA (generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, soporte multilingüe): no disponibles; no se trata de un modelo de IA.

## Casos de uso

- **Intercambio de recursos en comunidades:** un grupo (por ejemplo, de Telegram, QQ o Discord) puede desplegar el Space para que sus miembros busquen y soliciten recursos compartidos; la herramienta centraliza las peticiones en lugar de depender de enlaces sueltos en el chat.
- **Moderación centralizada de peticiones:** el administrador revisa y confirma cada solicitud mediante la `ADMIN_KEY`, lo que evita guardados indiscriminados y permite filtrar contenido antes de que entre en la cuenta de Quark.
- **Curación de enlaces con control de calidad:** la verificación de disponibilidad («verificar si sigue activo») y la eliminación de publicidad de los enlaces son útiles para mantenedores de colecciones de recursos que quieren garantizar que lo que comparten funciona y está limpio.
- **Gestión de contenido efímero:** la retención de 2 días con borrado automático mantiene la carpeta de la nube limpia sin mantenimiento manual, adecuado para material temporal o de rotación rápida.
- **Despliegue sin infraestructura propia:** al ejecutarse como Space Docker en Hugging Face, no requiere servidor propio; basta con configurar los dos secretos, lo que lo hace apto como prototipo de bajo coste.
- **Ejemplo de automatización con APIs de netdisk:** el proyecto ilustra cómo integrar automatizaciones basadas en cookie de sesión con Quark (guardado automático, generación de enlaces, limpieza programada), útil como referencia para desarrolladores que construyan herramientas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA, no aplican métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo y no requiere GPU. La aplicación se ejecuta como contenedor Docker en Hugging Face Spaces.
- GPU recomendadas: ninguna. Los requisitos de CPU y RAM del contenedor no están documentados (no disponible).
- Consumer GPU: no aplica.
- Despliegue: Hugging Face Spaces con SDK Docker (puerto 7860). Es imprescindible configurar los secretos `QUARK_COOKIE` y `ADMIN_KEY` en Settings → Variables and secrets. Opciones como vLLM, llama.cpp, Ollama o TGI no aplican, al no haber pesos de modelo que servir.
- Latencia y throughput: no disponibles; dependerán de la API de Quark y del plan de recursos del Space.

## Comparativa con modelos similares

No disponible. Al no ser un modelo de lenguaje, no existen alternativas comparables en las categorías habituales (tamaño de parámetros, contexto, benchmarks). Cabe señalar que la búsqueda devuelve resultados de la organización huihui-ai, dedicada a la publicación de modelos abliterated en Hugging Face, pero no hay confirmación de ninguna relación entre esa organización y la cuenta huihui73 que publica este Space.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni admite inferencia; cualquier expectativa de uso como LLM es errónea.
- Riesgo legal: la búsqueda y redistribución de recursos de terceros en servicios de netdisk puede implicar contenido protegido por derechos de autor; la responsabilidad recae en quien despliegue y opere la herramienta.
- Seguridad de credenciales: `QUARK_COOKIE` otorga acceso a la cuenta de Quark; si el Space se ve comprometido, la cuenta queda expuesta. Además, las cookies de sesión caducan y habrá que renovarlas periódicamente.
- `ADMIN_KEY`: si la clave es débil o se filtra, terceros podrían confirmar peticiones de guardado arbitrarias.
- Licencia no especificada: no consta ninguna licencia, por lo que los derechos de uso, modificación y redistribución del código no están claros.
- Sin validación comunitaria: 0 descargas y 0 likes; el README es la única documentación y no hay información sobre el código, pruebas ni mantenimiento.
- Documentación en chino; no consta soporte para otros idiomas.
- Retención limitada a 2 días con borrado automático, lo que impide usarlo como almacenamiento persistente.
- La similitud del nombre del autor (huihui73) con la organización huihui-ai no confirma ninguna relación entre ambas cuentas.

## Enlaces

- Space en Hugging Face: https://huggingface.co/huihui73/pan-search-code
- Perfil de huihui-ai (relación no confirmada con el autor del Space): https://huggingface.co/huihui-ai
- Modelos de huihui-ai: https://huggingface.co/huihui-ai/models
- GitHub de huihui-support: https://github.com/huihui-support
- Análisis de modelos de huihui-ai (DeepEntre Research): https://deepentresearch.com/en/journal/huihui-ai
- AI Model Index: https://www.modelindex.org/
