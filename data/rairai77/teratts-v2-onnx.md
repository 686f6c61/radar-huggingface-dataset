# rairai77/teratts-v2-onnx

## Resumen

TeraTTSv2 ONNX es una conversión del modelo de síntesis de voz TeraTTSv2, desarrollado originalmente por TeraSpace, empaquetada específicamente para su ejecución en el navegador mediante onnxruntime-web. El autor de esta conversión, rairai77, la publica como componente del proyecto CoolLanguageApp, una aplicación de aprendizaje de idiomas que sintetiza voz en ruso directamente en el dispositivo del usuario. El modelo base TeraTTSv2 es un sistema de text-to-speech (TTS) orientado al idioma ruso.

La conversión mantiene intactas las tres piezas principales del pipeline original —el codificador de texto, el predictor de duración, el sampler destilado de 8 pasos y el vocoder— y solo modifica el formato de almacenamiento: los pesos float32 se guardan como float16 y se convierten de nuevo a float32 al cargar la sesión de inferencia. Los estilos de voz rusos se reempaquetan desde archivos `.npy` a binarios crudos little-endian float32, y se eliminan el sampler del modelo profesor, las voces en inglés y los recursos de RUAccent.

El resultado es un paquete ONNX de aproximadamente 0,2 GB, pensado para inferencia en cliente web sin dependencia de servidores de síntesis. La relevancia de esta ficha radica en que documenta una opción de TTS ruso ligero y desplegable en navegador, con una licencia de tipo Open RAIL-M que impone restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS con codificador de texto, predictor de duración, sampler destilado de 8 pasos y vocoder (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos almacenados en float16 con conversión a float32 al cargar; no se documentan otras cuantizaciones (int8, int4) |
| Idiomas soportados | Ruso (las voces en inglés se excluyen de esta conversión) |
| Licencia | terattsv2-openrail-m-commercial-attribution (sujeta además a BigScience Open RAIL-M) |
| Formato de pesos | ONNX (float16 en disco, float32 en sesión); estilos de voz en `.bin` little-endian float32 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base TeraTTSv2 más allá de la estructura del pipeline descrita en la model card: un codificador de texto, un predictor de duración, un sampler destilado de 8 pasos y un vocoder. El sampler destilado de 8 pasos sugiere un proceso de destilación desde un modelo profesor con más pasos de muestreo, lo que reduce el coste computacional de la síntesis. En esta conversión concreta, los pesos del sampler profesor se han eliminado.

Tampoco se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, horas de audio), ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La modificación técnica principal de esta versión es el reempaquetado de pesos a float16 con conversión a float32 en tiempo de carga, y la elevación de los pesos del cuerpo del bucle del sampler al grafo principal, un ajuste necesario para la exportación a ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso a partir de texto de entrada.
- Soporte de estilos de voz rusos, empaquetados como archivos binarios float32 independientes (style_ttl y style_dp).
- Inferencia en navegador mediante onnxruntime-web, sin necesidad de backend servidor.
- Sampler destilado de 8 pasos, orientado a baja latencia en entornos con recursos limitados.
- No incluye voces en inglés ni recursos de RUAccent en esta conversión.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Aprendizaje de idiomas en el navegador: la aplicación CoolLanguageApp usa esta conversión para pronunciar texto en ruso en el dispositivo del alumno, aprovechando la inferencia local con onnxruntime-web y evitando enviar texto a un servidor externo.
- Aplicaciones web offline-first: al ejecutarse íntegramente en el cliente, el modelo permite funcionalidad de TTS en escenarios con conectividad intermitente o requisitos de privacidad estrictos.
- Lectura de contenido en ruso: integración en lectores web o extensiones que conviertan artículos y documentos en audio sin salir del navegador.
- Prototipado rápido de interfaces de voz: el tamaño reducido del paquete (0,2 GB) y el formato ONNX facilitan pruebas de concepto de TTS ruso en entornos web sin infraestructura de servidores GPU.
- Accesibilidad web: síntesis de voz para usuarios con discapacidad visual en sitios en ruso, con la ventaja de que el procesamiento ocurre localmente y no depende de APIs de terceros.
- Aplicaciones educativas multiuso: dado que el modelo base admite estilos de voz, puede emplearse para generar enunciados con distintas entonaciones en ejercicios de comprensión auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El paquete ONNX ocupa aproximadamente 0,2 GB, lo que permite cargarlo en memoria de un navegador moderno sin dificultad.
- Al ejecutarse en onnxruntime-web, la inferencia puede realizarse en CPU del cliente; no se documenta requisito de GPU.
- No se dispone de datos sobre VRAM estimada para despliegue en GPU con otros runtimes (vLLM, TGI, etc.), ya que el formato está orientado a navegador.
- Opciones de despliegue documentadas: onnxruntime-web. No se mencionan llama.cpp, Ollama, vLLM ni TGI.
- No se dispone de cifras de latencia ni throughput publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otros sistemas TTS rusos ni con alternativas de TTS en navegador.

## Limitaciones y advertencias

- Solo se incluyen voces en ruso; las voces en inglés y los recursos de RUAccent se han eliminado de esta conversión.
- No se documentan sesgos conocidos del modelo base ni del proceso de conversión.
- Riesgo de alucinación no aplicable en el sentido habitual de generación de texto, pero sí posible degradación en la pronunciación o entonación de texto fuera del dominio de entrenamiento.
- La licencia terattsv2-openrail-m-commercial-attribution y la BigScience Open RAIL-M imponen restricciones de uso basadas en casos de uso; es necesario revisar los términos antes de un despliegue comercial.
- El uso comercial requiere atribución según el nombre de la licencia.
- Los pesos se almacenan en float16 y se convierten a float32 al cargar, lo que puede introducir diferencias numéricas menores respecto al modelo original.
- No se documentan límites de longitud de texto de entrada ni de contexto.
- La fecha de creación del repositorio (2026-11-24) y la ausencia de descargas y likes indican que se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rairai77/teratts-v2-onnx
- Modelo base TeraTTSv2: https://huggingface.co/TeraSpace/TeraTTSv2
