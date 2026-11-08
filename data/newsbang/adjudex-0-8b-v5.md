# newsbang/adjudex-0.8b-v5

## Resumen

Adjudex 0.8B v5 es un modelo de decisión tipado desarrollado por newsbang, construido como un fine-tuning de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`). No es un modelo generativo al uso: recibe un `state` y un conjunto de `questions` tipadas (selección múltiple con hasta 255 opciones) y devuelve una probabilidad calibrada para cada opción. Se presenta, por tanto, como un "motor de decisión" (decision engine) en lugar de un chatbot o un modelo de instrucciones.

Con 852.985.920 parámetros totales y un repositorio de 1,7 GB, el modelo está pensado para integrarse en pipelines donde se necesita una respuesta categórica con distribución de probabilidad, no texto libre. Su relevancia actual radica en que aborda una tarea poco cubierta por los LLM generalistas: la clasificación estructurada de opciones múltiples con calibración explícita mediante una cabeza de decisión dedicada.

La arquitectura se apoya en un backbone `Qwen3_5Model` modificado con atención no causal en las capas de atención completa y pooling del último token, más una cabeza de decisión BF16 de forma `[255, hidden]`. El modelo se sirve a través de un servidor incluido (`/v1/systemone`), derivado del código de `perplexity-ai/pplx-decider-v1.1-27b`, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en `Qwen3_5Model` con atención no causal en capas de atención completa y pooling de último token; cabeza de decisión lineal `[255, hidden]` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor; solicitudes superiores se rechazan con HTTP 422) |
| Tipos de cuantizacion | BF16 (único formato documentado para el despliegue de referencia); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`readout.safetensors` en BF16) + `decision_config.json`; código de servicio en Python/PyTorch |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Contexto reportado en fuentes externas | 32.768 tokens (según free2aitools; no confirmado en la model card) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y sustituye la cabeza de lenguaje por un mecanismo de decisión: el backbone procesa el `state` y las `questions` con atención no causal en las capas de atención completa, aplica pooling sobre el último token y proyecta mediante una cabeza BF16 de 255 filas (una por opción posible) sobre el espacio oculto. El resultado es una distribución de probabilidad sobre las opciones presentadas, con una temperatura de calibración almacenada en `decision_config.json` junto con los códigos de opción y los hashes de procedencia.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado más allá del fine-tuning sobre el modelo base. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La model card sí especifica la procedencia del código de servicio (Perplexity Decider v1.1, Apache 2.0) y la revisión exacta del checkpoint base, lo que facilita la reproducibilidad.

## Capacidades

- Clasificación de decisión tipada: dado un `state` y preguntas de selección múltiple con hasta 255 opciones, devuelve una probabilidad por opción.
- Salida calibrada: la temperatura de calibración se aplica desde `decision_config.json`, lo que permite umbrales de confianza reproducibles.
- Procesamiento de contexto largo dentro del límite de 8.192 tokens por solicitud.
- Integración vía API HTTP con el servidor `/v1/systemone` incluido en el repositorio.
- Soporte de motores de evaluación externos (el kit de evaluación usa el motor `http` con `base_url` y `model=jev-latest`).
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; el modelo está especializado exclusivamente en la tarea de decisión.

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: dado un estado con la pregunta del usuario y un conjunto de rutas posibles (recuperar, responder directamente, escalar a humano), el modelo devuelve la probabilidad de cada ruta y permite aplicar un umbral de confianza antes de actuar.
- Clasificación de tickets de soporte: con hasta 255 categorías posibles, se puede mapear cada incidencia a una cola o equipo con una distribución de probabilidad que alimente una política de escalado.
- Selección de herramientas en agentes: como "decider" previo a un orquestador, elige entre un conjunto acotado de herramientas o acciones y expone la incertidumbre para que el sistema decida si consulta a un modelo mayor.
- Moderación y etiquetado de contenido: clasificación de textos en categorías predefinidas con probabilidades calibradas, útil para revisiones por umbral y auditoría de decisiones.
- Evaluación automática de respuestas: dado un estado con una respuesta candidata y opciones de veredicto (correcta, parcial, incorrecta, ambigua), el modelo asigna probabilidades que permiten agregar métricas.
- Triage en pipelines de datos: selección entre opciones de normalización o enriquecimiento para cada registro, con la ventaja de que el coste por inferencia es bajo al tratarse de un modelo de 0,85B parámetros.
- Sistemas de recomendación acotada: elegir entre un conjunto finito de ítems o acciones con una distribución explícita, útil cuando se necesita exploración basada en probabilidades.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el suite público Decision Index 0.3 (ejecución completa, 140.620 solicitudes):

| Área | Puntuación |
|---|---:|
| Knowledge | 30,02 |
| Language | 54,55 |
| Retrieval | 66,71 |
| Tools | 79,45 |
| Arts | 49,54 |
| **Decision Index 0.3** | **54,69** (bruto 66,33) |

Notas sobre la ejecución: 345 solicitudes (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) contenían una rama de pregunta que superaba el límite de 8.192 tokens; el servidor las rechazó con HTTP 422 sin truncar y se contabilizaron como incorrectas. No se han publicado comparaciones con otros modelos de decisión en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB para los pesos (852,98 M de parámetros) más overhead de activaciones y del servidor; en la práctica, menos de 8 GB en BF16.
- GPU recomendadas: la ejecución de referencia del Decision Index se realizó con una A800 de 80 GB por proceso de servidor, aunque el tamaño del modelo permite GPUs mucho menores.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante). No se documentan versiones cuantizadas, por lo que no hay cifras oficiales para FP8, INT8 o INT4.
- Opciones de despliegue: servidor incluido `/v1/systemone` (paquete `autojev.server`, arrancado con variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card no publica métricas de latencia ni de solicitudes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 0.8B v5 | 852,99 M | 8.192 tokens (servidor) | Decisión tipada con probabilidades por opción | Apache 2.0 | Hugging Face (newsbang) |
| Perplexity Decider v1.1 27B | 27B (según nombre) | no disponible | Decisión / enrutamiento | Apache 2.0 | Hugging Face (perplexity-ai) |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generación de texto general | no disponible en esta ficha | Hugging Face (Qwen) |

El modelo comparable más directo es el Perplexity Decider v1.1 27B, del que Adjudex reutiliza el código de servicio; Adjudex ofrece una alternativa mucho más pequeña (0,85B frente a 27B) a costa de una capacidad de razonamiento presumiblemente menor, aunque no se dispone de comparación directa de benchmarks. Frente a su modelo base Qwen3.5-0.8B, Adjudex cambia la tarea de generación por clasificación calibrada. No se dispone de datos de rendimiento de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo generativo; no debe esperarse texto libre, código ni razonamiento conversacional.
- Límite estricto de 8.192 tokens por solicitud: las peticiones que lo superan se rechazan con HTTP 422 y, en la evaluación publicada, se contabilizaron como incorrectas. Esto puede penalizar casos con estados largos.
- Rendimiento desigual por área: Knowledge (30,02) y Arts (49,54) son claramente inferiores a Tools (79,45) y Retrieval (66,71); conviene validar el caso de uso concreto antes de producción.
- Riesgo de calibración: la temperatura de calibración depende de `decision_config.json`; alterar o no aplicar ese fichero invalida los umbrales de confianza.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto fuera del inglés sin evaluación previa.
- Sesgos y alucinación: no se documentan análisis de sesgo ni tasas de error específicas; al tratarse de un fine-tuning de un modelo base pequeño, es probable que herede sesgos del mismo, aunque no se cuantifica.
- Dependencia de código de terceros: el servidor proviene de `perplexity-ai/pplx-decider-v1.1-27b` (Apache 2.0); deben respetarse los avisos de NOTICE.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las obligaciones de atribución del código derivado.
- Sin cuantizaciones oficiales: el despliegue en hardware limitado exige validar el comportamiento en BF16 o generar cuantizaciones propias sin garantía de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-0.8b-v5
- Versión anterior en Hugging Face: https://huggingface.co/newsbang/adjudex-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de servicio de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Ficha externa con datos del modelo: https://free2aitools.com/model/newsbang/adjudex-0.8b
