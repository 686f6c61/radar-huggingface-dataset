# eye-v/skyle-ai-models

## Resumen

Este repositorio actúa como un espejo público y sin restricciones de acceso de los archivos del modelo Gemma 4 E2B it de Google, tal y como se distribuyen en la organización litert-community de Hugging Face. El autor, eye-v, lo publica para que sus aplicaciones (Skyle Mosaics web y móvil, y Skyle X) puedan descargar estos archivos de forma anónima en tiempo de ejecución, sin necesidad de token, y usarlos para generar sugerencias de frases directamente en el dispositivo.

El modelo está disponible en dos formatos de despliegue: un archivo `.litertlm` de aproximadamente 2,6 GB para iOS, Android y escritorio mediante LiteRT-LM, y un archivo `.task` de unos 1,87 GiB para entornos web a través de MediaPipe con WebGPU. Al ser un mirror de los lanzamientos oficiales de Google, se rige por los Términos de Uso de Gemma y la Política de Uso Prohibido de Gemma.

La relevancia de este repositorio radica en que permite a los desarrolladores integrar un modelo de lenguaje de Google en aplicaciones on-device sin necesidad de autenticación, facilitando la inferencia local y preservando la privacidad de los datos. No obstante, la información técnica detallada del modelo (arquitectura, parámetros, contexto) no se proporciona en la model card, por lo que gran parte de las especificaciones quedan sin determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | LiteRT-LM (.litertlm) y MediaPipe (.task) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados o las técnicas de optimización aplicadas. La model card solo indica que se trata del modelo Gemma 4 E2B it publicado por Google en la organización litert-community, sin aportar detalles adicionales sobre su diseño o metodología de entrenamiento.

Al ser un mirror de los archivos oficiales, se asume que el modelo sigue las características generales de la familia Gemma de Google, pero no se puede confirmar ningún dato concreto sin acceso a la documentación técnica de Google.

## Capacidades

- Generacion de texto para sugerencias de frases (sentence suggestions) en aplicaciones on-device, segun la descripcion del repositorio.
- Inferencia local en dispositivos moviles, de escritorio y web mediante LiteRT-LM y MediaPipe.
- Descarga anonima en tiempo de ejecucion, sin necesidad de token de autenticacion.
- Optimizado para su uso en las aplicaciones Skyle Mosaics (web y movil) y Skyle X de eyeV.
- No se documentan capacidades adicionales como razonamiento, codigo, vision o tool calling en la informacion proporcionada.

## Casos de uso

- Sugerencias de frases en aplicaciones de accesibilidad: Skyle es un sistema de eye tracking para personas con discapacidad motora. El modelo genera sugerencias de texto que el usuario puede seleccionar mediante la mirada, facilitando la comunicacion asistida.
- Autocompletado de texto en movil: la integracion con LiteRT-LM permite ofrecer predicciones de palabras o frases mientras se escribe, sin conexion a internet.
- Asistente de escritura en web: el archivo `.task` para MediaPipe con WebGPU habilita sugerencias en tiempo real en navegadores, aprovechando la GPU para acelerar la inferencia.
- Prototipado rapido de aplicaciones con Gemma: al ser un mirror sin restricciones de acceso, los desarrolladores pueden descargar los archivos directamente para experimentar con Gemma 4 E2B it en entornos locales.
- Despliegue en dispositivos con recursos limitados: los formatos LiteRT-LM y MediaPipe estan disenados para ejecutarse en hardware modesto, lo que permite integrar el modelo en dispositivos IoT o de gama baja.
- Privacidad y datos sensibles: al ejecutarse completamente on-device, el modelo no envia datos a servidores externos, lo que es adecuado para aplicaciones que manejan informacion personal o medica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento, y los resultados de busqueda web no proporcionan datos especificos de este modelo.

## Requisitos de hardware

- Almacenamiento: se requieren aproximadamente 2,6 GB para el archivo `.litertlm` y 1,87 GiB para el archivo `.task`. El dispositivo debe disponer de espacio suficiente.
- Memoria RAM: no se especifica, pero dado el tamano de los archivos, se estima que se necesita al menos 3-4 GB de RAM para cargar el modelo en memoria durante la inferencia.
- GPU: no se indica una GPU concreta. Para el despliegue web con MediaPipe y WebGPU, se recomienda un navegador compatible con WebGPU (Chrome, Edge, Firefox) y una GPU integrada o dedicada con soporte para WebGPU.
- Dispositivos moviles: el formato LiteRT-LM esta pensado para iOS y Android, por lo que deberia funcionar en telefonos y tablets modernos, aunque no se detallan requisitos minimos de SoC o RAM.
- Opciones de despliegue: LiteRT-LM (para aplicaciones nativas) y MediaPipe (para web). No se mencionan otras herramientas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Dado que no se conocen las especificaciones tecnicas del modelo, no es posible establecer una comparativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso comercial y obliga a cumplir la Politica de Uso Prohibido de Gemma de Google. Es necesario revisar estos terminos antes de utilizar el modelo en produccion.
- No se proporcionan datos sobre sesgos, riesgos de alucinacion o limitaciones de idioma. Al ser un modelo de Google, es probable que herede los sesgos tipicos de los modelos de lenguaje grandes, pero no se puede confirmar.
- El modelo esta disenado especificamente para sugerencias de frases; su uso en otras tareas puede ofrecer resultados suboptimos.
- El repositorio es un mirror no oficial; aunque los archivos son copias sin modificar de los lanzamientos de Google, no hay garantia de mantenimiento o actualizaciones.
- No se especifica la longitud de contexto ni el numero de parametros, lo que limita la evaluacion de su idoneidad para tareas que requieran ventanas de contexto amplias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eye-v/skyle-ai-models
- Repositorio fuente en litert-community: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Terminos de Uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de Uso Prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Sitio de eyeV (Skyle Integration Kit): https://www.eyev.de/sik
- Pagina de Skyle para iPad: https://www.eyev.de/skyle-for-ipad
