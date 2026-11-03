# Faiyaz360/orvene-wake

## Resumen

`Faiyaz360/orvene-wake` es un clasificador de palabra de activación (wake word) empaquetado en formato ONNX, desarrollado por el usuario Faiyaz360 como componente opcional de la aplicación de escritorio Orvene. Su función es detectar la frase "Hey Orvene" de forma local en el dispositivo del usuario, sin enviar audio a ningún servidor externo. El archivo `classifier-1.onnx` ocupa 4.071.442 bytes (aproximadamente 4 MB) y se descarga únicamente cuando el usuario activa manualmente la funcionalidad de wake phrase.

El modelo no es un modelo de lenguaje ni un sistema de reconocimiento de voz general: es un clasificador binario de keyword spotting de propósito muy específico, entrenado exclusivamente con voz sintética. No se han publicado métricas de precisión sobre voces reales, lo que lo sitúa en una fase temprana de validación. La licencia está explícitamente sin resolver, con dos cuestiones abiertas (la procedencia de dos voces TTS usadas para generar el audio de entrenamiento y la licencia de la red de embeddings subyacente).

Por su tamaño reducido y su formato ONNX, está pensado para ejecutarse en CPU o GPU de forma local con latencia baja, integrándose en el flujo de la aplicación Orvene como un filtro previo que decide cuándo activar el asistente. Su relevancia actual es limitada fuera de ese proyecto concreto, dado que no hay benchmarks publicados, cero descargas y una licencia que impide su redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de keyword spotting; red de embeddings upstream no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio, no texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la frase de activación es "Hey Orvene", en inglés) |
| Licencia | other / unresolved (licencia sin resolver; no redistribuir) |
| Formato de pesos | ONNX (`classifier-1.onnx`) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del clasificador en la información proporcionada. La model card indica únicamente que se trata de un clasificador pequeño que opera sobre una red de embeddings upstream cuya licencia está pendiente de aclarar. El artefacto distribuido es un único archivo ONNX de 4.071.442 bytes con SHA-256 `0d95503d1ba1f9132deee0a3f5eb26300f9ecb0ff5d8f9acff50cc54ea6eb1bd`, lo que sugiere un modelo compacto orientado a inferencia en el dispositivo.

El dato más relevante sobre el entrenamiento es que se realizó exclusivamente con voz sintética generada mediante TTS. No se especifica el número de muestras, la composición del dataset ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta ningún proceso de ajuste fino con datos humanos, RLHF o evaluación con hablantes reales. La model card reconoce explícitamente que la precisión sobre voces reales no se ha medido.

## Capacidades

- Detección de la frase de activación "Hey Orvene" en audio local.
- Clasificación binaria de keyword spotting (presencia o ausencia de la frase).
- Inferencia completamente local: no se envía audio a ningún servicio externo.
- Verificación de integridad mediante comprobación de tamaño y SHA-256 antes de ejecutar el modelo.
- Descarga bajo demanda: el archivo solo se obtiene cuando el usuario activa la funcionalidad.
- Ejecución en formato ONNX, compatible con runtimes estándar de inferencia ONNX.
- No soporta tool calling, generación de texto, razonamiento multi-paso, visión ni audio general más allá de la detección de la frase.

## Casos de uso

- Activación por voz de la aplicación Orvene: el clasificador actúa como filtro previo que detecta "Hey Orvene" y dispara la activación del asistente, evitando que el usuario tenga que usar el ratón o el teclado.
- Procesamiento de audio en local por privacidad: al ejecutarse íntegramente en el dispositivo y no enviar audio a ningún servidor, encaja en escenarios donde el usuario no quiere que su voz salga del equipo.
- Integración en aplicaciones de escritorio con ONNX Runtime: cualquier proyecto que ya use ONNX Runtime puede cargar el archivo y reutilizar la lógica de verificación de tamaño y hash descrita en la model card.
- Filtro de activación en asistentes de escritorio personalizados: sirve como ejemplo de wake word de bajo coste computacional para prototipos que necesiten una frase de activación concreta.
- Evaluación de pipelines de wake word basados en voz sintética: útil para estudiar el gap entre entrenamiento con TTS y rendimiento en voces reales, aunque sin métricas publicadas el valor es limitado.
- Pruebas de integridad y despliegue de artefactos ONNX: el patrón de descarga bajo demanda con verificación SHA-256 es reutilizable en otras aplicaciones que distribuyan modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la precisión sobre voces reales no se ha medido.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del archivo (unos 4 MB) es plausible que quepa en memoria de cualquier GPU consumer, pero no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX permite ejecución en CPU, lo que sugiere que no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime (el formato del artefacto es ONNX); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de keyword spotting con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente con voz sintética: no hay evidencia de que funcione con voces reales, acentos diversos ni condiciones acústicas variables.
- Precisión no medida: la model card reconoce que no se ha evaluado el rendimiento sobre hablantes reales.
- Licencia sin resolver: no se permite redistribuir ni construir sobre el archivo hasta que se aclaren la procedencia de las voces TTS y la licencia de la red de embeddings upstream.
- Sin datos de sesgo: no se documenta ningún análisis de sesgo por acento, género, edad o idioma.
- Riesgo de falsos positivos y falsos negativos desconocido: al no haber métricas, no se puede estimar la tasa de activación errónea.
- Ámbito muy restringido: solo detecta una frase concreta en inglés; no es un modelo de propósito general.
- Cero adopción: sin descargas ni likes, no hay evidencia de uso en producción ni reportes de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-03): conviene verificar la coherencia de los metadatos antes de confiar en ellos.

## Enlaces

- HuggingFace: https://huggingface.co/Faiyaz360/orvene-wake
- Repositorio del proyecto: https://github.com/Faiyaz360/orvene
- Model card detallada: https://github.com/Faiyaz360/orvene/blob/main/docs/wake-word.md
