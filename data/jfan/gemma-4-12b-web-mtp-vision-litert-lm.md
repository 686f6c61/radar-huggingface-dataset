# jfan/gemma-4-12b-web-mtp-vision-litert-lm

## Resumen

Gemma 4 12B Web MTP Vision es una distribución cuantizada del modelo Gemma 4 12B en formato `.litertlm`, empaquetada por el usuario jfan para su ejecución en navegador mediante LiteRT-LM Web y WebGPU. El paquete incluye el decodificador de texto con decodificación especulativa basada en Multi-Token Prediction (MTP), un codificador y adaptador de visión, y un codificador y adaptador de audio basados en Conformer. Está pensado para desplegar inferencia multimodal directamente en el cliente, sin servidor.

La relevancia de esta ficha radica en que demuestra un caso de ejecución local en navegador de un modelo de 12.000 millones de parámetros con capacidades de visión, audio y decodificación especulativa, algo poco habitual en el ecosistema open source. El repositorio ocupa 116,8 GB y contiene cuatro variantes del bundle según las modalidades incluidas.

No se dispone de información sobre la arquitectura interna exacta, el número de tokens de entrenamiento, la composición del dataset ni los resultados de benchmarks. La model card se limita a describir el empaquetado y las variantes disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con decodificador de texto, MTP especulativo, codificador de vision y codificador de audio Conformer; empaquetado LiteRT-LM |
| Parametros totales | 12B (según el nombre del modelo; no se detalla el desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizado (el formato `.litertlm` implica cuantización, pero no se especifican los esquemas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de licencia de Gemma) |
| Formato de pesos | `.litertlm` (bundles LiteRT-LM para WebGPU) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de Gemma 4 12B, un modelo multimodal con decodificador de texto, codificador de visión y codificador de audio. El bundle incorpora Neural Multi-Token Prediction (MTP) para decodificación especulativa, identificado en la model card con el componente `gpu_artisan`. La parte de visión se compone de `vision_encoder`, `vision_adapter` y un token `end_of_vision`, con presupuestos de tokens variables de 70, 140, 280, 560 y 1120. La parte de audio emplea un codificador Conformer (`audio_encoder_hw`), un `audio_adapter` y un token `end_of_audio`.

No se especifican en la información proporcionada los datos de entrenamiento (número de tokens, composición del dataset), el uso de RLHF/DPO ni innovaciones adicionales más allá de la decodificación especulativa MTP y el empaquetado para WebGPU. Tampoco se detalla el proceso de cuantización aplicado ni los esquemas numéricos empleados.

## Capacidades

- Generación de texto y razonamiento con el decodificador de Gemma 4 12B.
- Procesamiento de imágenes mediante codificador de visión con presupuestos de tokens configurables (70, 140, 280, 560, 1120).
- Procesamiento de audio mediante codificador Conformer y adaptador de audio.
- Decodificación especulativa con Multi-Token Prediction (MTP) para acelerar la generación.
- Ejecución en navegador con WebGPU a través de LiteRT-LM Web.
- Soporte multimodal combinado en la variante `vision-audio`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: visión y audio confirmados; modo thinking no disponible.

## Casos de uso

- Asistentes en navegador con privacidad por diseño: el modelo se ejecuta en el cliente vía WebGPU, de modo que las imágenes y el audio del usuario no salen del dispositivo; adecuado para aplicaciones de accesibilidad o asistencia personal.
- Descripción de imágenes en aplicaciones web: la variante `vision` permite generar texto alternativo o descripciones a partir de imágenes subidas por el usuario, con control del coste computacional mediante los presupuestos de tokens de visión.
- Transcripción y comprensión de audio en el navegador: la variante `audio` con codificador Conformer permite procesar notas de voz o reuniones sin enviar el audio a un servidor.
- Demos interactivas y prototipos de investigación: el bundle `vision-audio` sirve para experimentar con interacción multimodal en tiempo real dentro de una página web.
- Evaluación de decodificación especulativa MTP: útil para investigadores que quieran medir la aceleración de la generación con MTP frente a decodificación autoregresiva estándar en WebGPU.
- Aplicaciones educativas offline: al ejecutarse en el navegador, puede desplegarse en entornos con conectividad limitada o requisitos de soberanía de datos.
- Procesamiento por lotes de imágenes o audio en el cliente: para tareas de etiquetado o resumen que se beneficien de no depender de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 116,8 GB, pero cada variante individual es un subconjunto; el tamaño de cada bundle no se detalla en la información proporcionada.
- Requiere un navegador con soporte de WebGPU y una GPU compatible.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución en navegador sobre WebGPU, no a servidores con A100/H100.
- Compatibilidad con GPU de consumo: no confirmada; depende de la memoria de la GPU del cliente y del tamaño del bundle elegido.
- Opciones de despliegue: LiteRT-LM Web con WebGPU (formato `.litertlm`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la decodificación especulativa MTP está pensada para reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros modelos, y este empaquetado LiteRT-LM para WebGPU no tiene equivalentes directos documentados en la información disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de calidad.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- La longitud de contexto no está documentada; no debe asumirse un valor concreto para producción.
- La licencia Gemma impone términos de uso específicos, incluida la política de uso aceptable de Google; es necesario revisarlos antes de un uso comercial.
- El formato `.litertlm` y la dependencia de WebGPU limitan el despliegue a navegadores y hardware compatibles; no es un formato estándar para servidores.
- El repositorio de 116,8 GB contiene varias variantes; descargar el bundle completo puede ser costoso en almacenamiento y ancho de banda.
- Es un empaquetado de terceros (jfan), no una publicación oficial de Google; la integridad y el mantenimiento dependen del autor.
- No hay información sobre tool calling, agentes ni modo thinking, por lo que no deben asumirse estas capacidades en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jfan/gemma-4-12b-web-mtp-vision-litert-lm
- LiteRT-LM: no disponible en la información proporcionada.
- Paper de Gemma 4: no disponible en la información proporcionada.
- Repositorio o demo adicional: no disponible en la información proporcionada.
