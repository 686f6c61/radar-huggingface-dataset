# sasha-denisov/dash-infinite-run

## Resumen

Dash: Infinite Run — the eyes es un ajuste fino de EmbeddingGemma 2 (440M, torre de texto y visión) desarrollado por sasha-denisov para el juego de ejemplo "Dash: Infinite Run". No es un modelo generativo: es un modelo de embeddings especializado en extraer características de fotogramas de un videojuego para responder tres preguntas concretas de control (zona del escenario, proximidad de obstáculo y dirección de giro). Se distribuye en formato LiteRT-LM (`.litertlm`) para ejecución en CPU y GPU en dispositivos, con pesos int8 e int4.

La relevancia del modelo es fundamentalmente práctica: demuestra un flujo de trabajo completo de ajuste fino de un modelo de embeddings multimodal sobre un dominio muy estrecho (fotogramas de un juego) y su conversión a un runtime on-device, con un presupuesto de tokens de visión fijado en 70 por imagen. La torre de texto se ajusta con una cabeza por pregunta sobre el pooling medio compartido, mientras que la torre de visión y el resto del archivo provienen del modelo base de Google.

El modelo base es `google/embeddinggemma-2` (revisión `914f7f89`), y los archivos de visión y texto sin ajustar proceden de `litert-community/embeddinggemma-2-text-vision-440m-litert-lm` (revisión `e301f74d`). El repositorio ocupa 0,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma 2 (torre de texto + torre de visión), ajuste fino con cabezas lineales por pregunta sobre pooling medio compartido |
| Parametros totales | 440M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 y int4 (archivos LiteRT-LM) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (LiteRT-LM); int8: 523.173.888 bytes; int4: 387.710.976 bytes |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma 2, un modelo de embeddings de 440M parámetros con torre de texto y torre de visión. El ajuste fino añade una cabeza por cada una de las tres preguntas (zones, near, steer) sobre el pooling medio compartido, manteniendo congeladas la torre de visión, la proyección `embed_vision` y los embeddings de tokens. El entrenamiento se realizó con LiteTune (versión 0.9.1) durante tres épocas, con un presupuesto de 70 tokens de visión por imagen. Para la pregunta `steer` se aplicó aumento de datos por espejo horizontal, intercambiando las etiquetas `left` y `right`.

Los conjuntos de datos son fotogramas del juego no publicados: 28.722 filas para zones, 15.383 para near y 6.243 para steer, con la mitad de cada conjunto reservada para validación por grabación (split por run). Las preguntas y opciones son: zones (trail, grass, rock, jump), near (jump, run) y steer (left, right, straight). La aplicación consume el modelo mediante `EmbeddingModel.createDecider` de flutter_edge_ai, que embebe un fotograma y elige la opción cuyo centroide de ejemplos está más próximo.

## Capacidades

- Extracción de características visuales de fotogramas de juego mediante embeddings.
- Clasificación de zona del escenario en cuatro clases (trail, grass, rock, jump).
- Detección de proximidad de obstáculo con dos clases (jump, run).
- Predicción de dirección de giro con tres clases (left, right, straight).
- Decisión por centroide sobre embeddings, sin generación de texto.
- Ejecución on-device en CPU y GPU mediante LiteRT-LM.
- Integración con Flutter a través de flutter_edge_ai.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Control de agente automático en el juego Dash: Infinite Run: el modelo embebe cada fotograma y el decisor elige la acción (saltar, correr, girar) según el centroide más cercano, sustituyendo lógica de visión programática por un clasificador aprendido.
- Prototipado de percepción visual en juegos móviles: sirve como referencia para equipos que quieran ajustar un modelo de embeddings multimodal a un dominio visual concreto y desplegarlo en dispositivo sin conexión.
- Demostración de pipeline LiteTune de extremo a extremo: preparación de tareas, ajuste fino, conversión a int8 e int4 y verificación con LiteRT-LM, útil como caso de estudio reproducible.
- Evaluación de embeddings on-device en Flutter: permite medir latencia y precisión de un modelo de 440M cuantizado en hardware móvil dentro de una app Flutter.
- Clasificación visual de bajo coste con pocas etiquetas: el enfoque de centroides con 10 ejemplos por clase (10-shot) alcanza precisiones altas en este dominio, aplicable a otros problemas de clasificación de imágenes con presupuesto reducido.
- Investigación sobre presupuesto de tokens de visión: el modelo está ajustado a 70 tokens por imagen, lo que permite estudiar el compromiso entre coste computacional y precisión en tareas visuales.

## Benchmarks y rendimiento

Sondas lineales sobre los embeddings del ajuste fino en float32, ajustadas sobre fotogramas de entrenamiento y evaluadas sobre fotogramas no vistos, comparadas con el modelo base:

| Tarea | Metrica | Base | Ajuste fino |
|---|---|---|---|
| zones | precision con regresion softmax | 0,708 | 0,931 |
| zones | precision con centroide 10-shot | 0,546 | 0,926 |
| near | recall de `jump` al 2% de fotogramas `run` clasificados como `jump` | 0,466 | 0,838 |
| near | precision con centroide 10-shot | 0,715 | 0,961 |
| steer | left contra right | 0,446 | 0,827 |
| steer | precision con centroide 10-shot | 0,549 | 0,900 |

Los tamaños de evaluación fueron: zones 8.195, near 4.791 y steer 1.871. Los resultados corresponden a una sola ejecución, un solo juego y una sola semilla. La verificación con `litetune verify` de los dos archivos LiteRT-LM frente al ajuste fino en float y al archivo de Google estaba en curso en el momento de la publicación.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo int8 ocupa 523 MB y el int4 388 MB; en ejecución hay que sumar el overhead del runtime LiteRT-LM.
- GPU recomendadas: no disponible; el modelo está pensado para CPU y GPU de dispositivos móviles.
- Cabe en GPU de consumo: sí, por tamaño; los archivos están diseñados para ejecución on-device en hardware móvil.
- Opciones de despliegue: LiteRT-LM (runtime principal), con integración en Flutter mediante flutter_edge_ai.
- Latencia y throughput: no disponibles.
- Nota de configuración: el runtime debe configurarse con `LiteRtEmbeddingBackend(visionTokensPerImage: 70)`; el valor por defecto de 140 no coincide con el presupuesto de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dash: Infinite Run — the eyes | 440M | no disponible | LiteRT-LM (int8/int4) | Gemma Terms of Use | Hugging Face |
| google/embeddinggemma-2 (base) | 440M | no disponible | safetensors y otros | Gemma Terms of Use | Hugging Face |
| litert-community/embeddinggemma-2-text-vision-440m-litert-lm | 440M | no disponible | LiteRT-LM | Gemma Terms of Use | Hugging Face |

La comparativa se limita al linaje del modelo base, ya que no se dispone de datos de rendimiento de alternativas en las mismas tareas específicas del juego.

## Limitaciones y advertencias

- Modelo altamente especializado: las cabezas están entrenadas solo para tres preguntas de un único juego; no generaliza a otros dominios visuales sin reentrenamiento.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Los fotogramas de entrenamiento no están publicados, lo que impide reproducir el ajuste fino exacto.
- Los resultados de benchmarks provienen de una sola ejecución, un solo juego y una sola semilla; la varianza no está caracterizada.
- El presupuesto de 70 tokens de visión no está almacenado en el archivo; usar el valor por defecto del runtime (140) degrada el comportamiento esperado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea en fotogramas fuera de distribución.
- Sesgos conocidos: no disponibles.
- Licencia Gemma Terms of Use: revisar las restricciones de uso comercial y las obligaciones de atribución antes de desplegar en producción.
- Idiomas soportados: no disponibles; el modelo no procesa texto libre de usuario en su uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sasha-denisov/dash-infinite-run
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Archivo LiteRT-LM de referencia: https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm
- LiteTune (repositorio): https://github.com/DenisovAV/litetune
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
