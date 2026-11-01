# mortsn/handler-d1-v3

## Resumen

Handler-d1-v3 es un ajuste fino (fine-tuning) del modelo LiquidAI/d1-2B, desarrollado por el usuario mortsn, orientado a una tarea muy concreta: interpretar las órdenes habladas dentro de Handler, un videojuego en el que el jugador guía a dos espías a través de una misión mediante diálogo. El modelo no es un asistente general, sino un componente de juego especializado en comprender y procesar instrucciones dictadas por voz.

El artefacto publicado en Hugging Face no contiene los pesos en formato nativo, sino una exportación ONNX cuantizada a q4f16, pensada para ejecutarse íntegramente en el navegador mediante onnxruntime-web sobre WebGPU. El repositorio ocupa 1,6 GB e incluye además un archivo `calibration.json` con la temperatura reajustada para el muestreo del modelo tras el ajuste.

Por su naturaleza, se trata de un modelo de nicho: su relevancia no reside en capacidades generales de razonamiento o generación de código, sino en demostrar un patrón de despliegue de modelos pequeños (2B parámetros) directamente en el cliente web, sin backend, para aplicaciones interactivas. La licencia es la LFM Open License v1.0 de Liquid AI, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-2B; arquitectura concreta no especificada en la informacion) |
| Parametros totales | 2B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (exportacion ONNX cuantizada) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ONNX (onnxruntime-web, WebGPU) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LiquidAI/d1-2B ni sobre el proceso de ajuste fino aplicado por mortsn. La model card unicamente indica que se trata de un fine-tuning del modelo base para leer las ordenes habladas del juego Handler, y que el artefacto publicado es la exportacion ONNX en cuantizacion q4f16 que el juego ejecuta en el navegador.

El unico detalle tecnico adicional documentado es la presencia de `calibration.json`, que contiene la temperatura reajustada (refitted temperature) para el muestreo. No se especifican volumen de datos de entrenamiento, composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO.

## Capacidades

- Interpretacion de ordenes habladas en el contexto especifico del juego Handler (guiar a dos espias en una mision).
- Generacion de texto orientada a la logica de juego, no a proposito general.
- Ejecucion en navegador mediante onnxruntime-web sobre WebGPU.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision, audio).
- No se documentan capacidades de codigo, matematicas o vision.

## Casos de uso

- Integracion en el juego Handler: el modelo procesa las ordenes dictadas por el jugador y las traduce en acciones para los espias, ejecutandose localmente en el navegador.
- Despliegue de IA en cliente sin backend: sirve como referencia para llevar un modelo de 2B cuantizado a WebGPU y evitar costes de servidor y latencia de red.
- Prototipado de interfaces de voz para juegos narrativos: el patron de exportacion ONNX q4f16 puede reutilizarse para otras tareas de comprension de comandos acotadas.
- Demostraciones offline o de privacidad: al ejecutarse en el navegador, los datos del usuario no salen del dispositivo, adecuado para entornos con requisitos de privacidad.
- Evaluacion de cuantizacion q4f16 en WebGPU: util para medir el equilibrio entre calidad y rendimiento en hardware de cliente.
- Base para fine-tunings de dominio acotado: el flujo (fine-tuning sobre un modelo de 2B, exportacion ONNX, calibracion de temperatura) es replicable para otros asistentes de tarea especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 1,6 GB y la cuantizacion es q4f16, por lo que la huella en memoria es del orden de gigabytes, apta para GPUs de consumo.
- GPU recomendadas: no especificadas; el modelo esta pensado para WebGPU, por lo que depende de la GPU del navegador del usuario.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano y la cuantizacion, aunque no se documentan modelos concretos.
- Opciones de despliegue: onnxruntime-web sobre WebGPU (documentado); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables en la misma categoria (fine-tunings de 2B para juegos en navegador) ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: entrenado para las ordenes habladas de un juego concreto; su utilidad fuera de ese contexto es limitada.
- Sin datos publicados sobre sesgos, alucinacion o robustez.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Artefacto unicamente en ONNX q4f16: la cuantizacion puede degradar la calidad respecto a los pesos originales.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- Dependencia de WebGPU: el rendimiento y la compatibilidad varian segun navegador y hardware del cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mortsn/handler-d1-v3
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
