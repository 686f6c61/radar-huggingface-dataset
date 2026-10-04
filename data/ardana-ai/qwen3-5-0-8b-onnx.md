# ardana-ai/qwen3.5-0.8b-ONNX

## Resumen

ardana-ai/qwen3.5-0.8b-ONNX es un export cuantizado en formato ONNX del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario ardana-ai. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original (revisión `2fc06364715b967f1860aea9cf38778875588b17`) a un grafo ONNX con pesos en int8, generado con el model builder de onnxruntime-genai 0.17.1 y dirigido específicamente al execution provider WebGPU. El objetivo declarado es ejecutar el modelo en el navegador a través de onnxruntime-web.

El repositorio ocupa 0,9 GB e incluye el grafo (`model.onnx`), los pesos (`model.onnx.data`), la plantilla de chat, el tokenizador y la licencia heredados sin modificaciones del modelo fuente. Está pensado como la variante "browser" del modelo de librería `qwen3.5-0.8b` de Ardana, lo que lo sitúa en la categoría de modelos pequeños (en torno a 0,8 mil millones de parámetros) orientados a inferencia local en cliente.

Su relevancia actual radica en que permite desplegar un LLM conversacional sin servidor, con la inferencia ejecutándose en la GPU del propio dispositivo mediante WebGPU. Como contrapartida, la model card es mínima: no incluye datos de entrenamiento, longitud de contexto, idiomas soportados ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. El export es un decoder autorregresivo con embeddings atados (embedding compartido con la LM head) y sin cabeza de predicción multi-token |
| Parámetros totales | Aproximadamente 0,8 mil millones, según el nombre del modelo base (no confirmado numéricamente en la model card) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos en int8; entradas y salidas en fp16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |
| Execution provider objetivo | WebGPU (para onnxruntime-web) |
| Herramienta de export | onnxruntime-genai 0.17.1 model builder, vía `cargo xtask onnx convert qwen3.5-0.8b` |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) |
| Autor | ardana-ai |
| Fecha de publicación | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (no se especifica si se trata de un transformer denso, un modelo MoE o una arquitectura híbrida). Lo que sí detalla la model card es la topología del grafo exportado: un decoder autorregresivo en el que la matriz de embeddings está atada a la cabeza de lenguaje, que emite únicamente los logits de la última posición y que no incorpora cabeza de predicción multi-token (MTP). El grafo consume y produce tensores en fp16, mientras que los pesos se almacenan en int8, una combinación habitual para reducir el ancho de banda de memoria sin renunciar a la precisión de activaciones en el execution provider WebGPU.

No hubo entrenamiento adicional por parte de ardana-ai: el proceso fue exclusivamente de conversión y cuantización del checkpoint original, tal y como indica la referencia al comando `cargo xtask onnx convert qwen3.5-0.8b`. En consecuencia, no hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni sobre innovaciones técnicas de entrenamiento. La única innovación relevante de esta publicación es de despliegue: empaquetar un modelo de 0,8B en un grafo ONNX int8 apto para ejecutarse en el navegador mediante WebGPU. La ausencia de cabeza MTP limita la decodificación especulativa en los runtimes que la aprovechan.

## Capacidades

- Generación de texto conversacional en el navegador, con plantilla de chat propia (`chat_template.jinja`) heredada del modelo fuente.
- Inferencia local sin servidor: el cálculo se ejecuta en el dispositivo del usuario a través de onnxruntime-web y el execution provider WebGPU.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 0,8B de parámetros del modelo base.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles. El export no incluye cabeza de predicción multi-token.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones web: el grafo está pensado para onnxruntime-web, de modo que un chatbot puede ejecutarse íntegramente en la pestaña del navegador sin enviar prompts a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Extensiones de navegador con IA local: una extensión puede cargar `model.onnx` y `model.onnx.data` (0,9 GB) y ofrecer resumen o reescritura de texto de la página activa sin coste de API por token.
- Aplicaciones PWA con funcionamiento sin conexión: al no depender de un endpoint remoto, el modelo puede utilizarse cuando el dispositivo no tiene red, siempre que el modelo esté cacheado.
- Demos y prototipos de producto: permite validar una experiencia de usuario conversacional en el navegador sin aprovisionar GPU en servidor, con un coste de integración reducido a la carga del grafo y del tokenizador.
- Procesamiento de texto en el cliente para formularios y CRM: clasificación o normalización de campos de texto libre escrita por el usuario antes de enviarla al backend, reduciendo el volumen de datos personales que viajan a servidor.
- Educación y entornos sandbox: ejercicios de generación de texto donde el alumno ejecuta el modelo en su propio equipo, sin necesidad de cuentas ni claves de API de terceros.
- Aplicaciones de escritorio y Electron: el mismo grafo ONNX puede cargarse fuera del navegador mediante un runtime compatible con ONNX, reutilizando el artefacto ya cuantizado.

En todos estos escenarios conviene tener presente que el modelo tiene aproximadamente 0,8 mil millones de parámetros: es adecuado para tareas de lenguaje natural de dificultad baja o media, no para razonamiento complejo, matemáticas avanzadas o generación de código extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el modelo base ni para esta variante cuantizada. Tampoco se documenta la degradación de calidad introducida por la cuantización a int8.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,0-1,5 GB para los pesos int8 (el repositorio ocupa 0,9 GB) más el espacio de la caché KV, cuyo tamaño no puede calcularse porque se desconoce la longitud de contexto soportada. Cifra estimada, no publicada por el autor.
- GPU recomendadas: cualquiera con soporte de WebGPU en el navegador (Chrome o Edge 113 o superior en Windows, Chrome en macOS y Linux). No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU integrada o dedicada reciente con WebGPU habilitado, dado el tamaño reducido del modelo.
- Opciones de despliegue: onnxruntime-web con el execution provider WebGPU, generado por onnxruntime-genai 0.17.1. Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están soportados por este artefacto, ya que solo se distribuye el grafo ONNX y no pesos en formato GGUF o safetensors.
- Latencia y throughput estimados: no disponibles. Dependen del dispositivo, del navegador y del soporte de WebGPU del cliente.
- Restricción de formato: al ser un export con entradas y salidas en fp16 y orientado a WebGPU, el funcionamiento en execution providers de CPU pura no está garantizado ni documentado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas de la misma categoría. La comparación factible se limita a los dos artefactos emparentados directamente:

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ardana-ai/qwen3.5-0.8b-ONNX | ~0,8B | No disponible | ONNX, pesos int8, E/S fp16 | Apache-2.0 | Público en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | No especificado en la información disponible | Apache-2.0 | Público en HuggingFace |

Otros modelos comparables de la misma categoría (por ejemplo, alternativas de menos de mil millones de parámetros orientadas a ejecución en cliente) quedan como "no disponible" en esta ficha, porque la información proporcionada no incluye sus especificaciones ni métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a un modelo de 0,8B; la model card no documenta ninguna mitigación ni evaluación de fidelidad factual.
- Capacidad limitada: con aproximadamente 0,8 mil millones de parámetros, el rendimiento en razonamiento multi-paso, matemáticas y generación de código complejo es previsiblemente bajo. No hay datos de benchmarks que lo confirmen o desmientan.
- Degradación por cuantización: los pesos están cuantizados a int8, pero no se publica ninguna comparación de calidad frente al checkpoint original en fp16 o bf16.
- Contexto desconocido: se desconoce la longitud de contexto soportada, un dato crítico para dimensionar la caché KV y para decidir si el modelo sirve en conversaciones de varios turnos.
- Idiomas no documentados: no se especifica qué lenguas soporta ni con qué calidad, por lo que no puede asumirse un buen comportamiento en castellano.
- Compatibilidad restringida: el grafo se exportó para el execution provider WebGPU. No se garantiza su funcionamiento en otros backends de ONNX Runtime ni en runtimes distintos.
- Ausencia de cabeza MTP: no se puede aprovechar decodificación especulativa multi-token con este artefacto.
- Licencia: Apache-2.0, heredada del modelo fuente, lo que en principio permite uso comercial. Aun así, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B en su repositorio original antes de un despliegue en producción.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes, y no tiene pipeline declarado ni datos de evaluación publicados. No hay evidencia de uso en producción.
- Trazabilidad: la conversión está fijada a una revisión concreta del modelo base (`2fc06364715b967f1860aea9cf38778875588b17`); conviene mantener ese pin para reproducibilidad.
- Plantilla de chat y tokenizador: se copian sin cambios del modelo fuente, por lo que cualquier peculiaridad de formato de prompt del Qwen3.5 original se traslada a este export.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ardana-ai/qwen3.5-0.8b-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Repositorio de Ardana: no se proporciona URL en la información disponible
- Documentación de onnxruntime-genai: no se proporciona enlace en la información disponible
- Paper, blog o demo asociados: no disponibles
