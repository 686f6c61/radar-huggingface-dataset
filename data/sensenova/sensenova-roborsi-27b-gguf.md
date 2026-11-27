# sensenova/SenseNova-RoboRSI-27B-GGUF

## Resumen

SenseNova-RoboRSI-27B es un modelo multimodal de 27.000 millones de parámetros (26.895.998.464 según los pesos en safetensors) desarrollado por SenseNova, orientado a robótica y razonamiento espacial. Esta ficha cubre la versión GGUF, una cuantización del modelo original publicada por el mismo autor para su ejecución en llama.cpp, lo que permite desplegarlo en hardware de consumo con pérdida controlada de precisión.

El modelo combina entrada de imagen y texto: según la model card, acepta frames de cámara y produce planes de acción y explicaciones de verificación, como se muestra en el ejemplo de colocar una taza sobre un posavasos. Esta capacidad de planificación visual lo sitúa en la categoría de modelos vision-language aplicados a manipulación robótica y razonamiento de sentido común físico.

La relevancia actual del modelo radica en su empaquetado GGUF: el autor ofrece cuatro variantes de cuantización (Q4_K_M, Q5_K_M, Q8_0 y BF16) junto con un proyector visual F16 separado, además de instrucciones reproducibles de compilación y servicio con llama-server. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector visual; detalles internos no publicados) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de servicio de la model card; máximo no especificado |
| Tipos de cuantizacion | Q4_K_M (16,74 GB), Q5_K_M (19,33 GB), Q8_0 (28,60 GB), BF16 sin cuantizar (53,81 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos principales) + proyector visual F16 GGUF (0,93 GB) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la información disponible. La model card únicamente indica que se trata de un modelo con capacidad de entrada de imagen, que requiere emparejar los pesos principales con un proyector visual F16 (`mmproj-SenseNova-RoboRSI-27B-F16.gguf`) para procesar imágenes. El tamaño de 27.000 millones de parámetros y el uso de un proyector visual separado son compatibles con una arquitectura transformer multimodal típica, pero no se confirma ni el tipo de atención, ni si emplea mezcla de expertos, ni la composición del dataset de entrenamiento.

Tampoco hay información sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card de la versión GGUF se limita a documentar el proceso de cuantización, los ficheros disponibles y los pasos de despliegue con llama.cpp (versión b12767), incluyendo el flag `--reasoning off` en el ejemplo de arranque, lo que sugiere que el modelo puede operar en un modo de razonamiento desactivable, aunque no se detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional y razonamiento multimodal combinando imagen y texto.
- Comprensión de imágenes: el ejemplo de la model card muestra análisis de una escena con una taza y un posavasos para planificar su colocación.
- Planificación de acciones robóticas: produce planes breves y explica cómo verificar la estabilidad de un objeto antes de soltarlo.
- Razonamiento espacial y de sentido común físico aplicado a manipulación.
- Servicio compatible con la API de OpenAI a través de llama-server (`/v1/chat/completions`, `/v1/models`, `/health`).
- Modo de razonamiento desactivable mediante el flag `--reasoning off` en llama.cpp.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas explícitamente.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Planificación de manipulación robótica: dado un frame de cámara, el modelo genera un plan de colocación de objetos y criterios de verificación (por ejemplo, comprobar la estabilidad de una taza antes de soltarla), tal como se documenta en el ejemplo oficial.
- Asistencia en laboratorios de robótica: integración en bucles de control donde el modelo interpreta la escena visual y propone la siguiente acción, sirviendo como capa de razonamiento de alto nivel sobre el controlador de bajo nivel.
- Prototipado en hardware de consumo: la variante Q4_K_M (16,74 GB) permite ejecutar el modelo en una GPU consumer de gama alta con llama.cpp, lo que facilita experimentación sin infraestructura de centro de datos.
- Verificación de tareas de pick-and-place: el modelo puede explicar qué comprobaciones realizar antes de liberar un objeto, útil para generar checklists automáticas en pipelines de evaluación de robots.
- Análisis de escenas con instrucciones en lenguaje natural: uso como interfaz conversacional para operadores que describen una tarea y adjuntan una imagen del entorno.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece cuatro variantes del mismo modelo, lo que permite medir el impacto de la cuantización en tareas de razonamiento visual dentro de un mismo pipeline de llama.cpp.
- Servicio local con API compatible con OpenAI: despliegue en un endpoint HTTP local (`127.0.0.1:8000`) para integrarse en aplicaciones existentes que ya usan el SDK de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB para Q4_K_M, 19-20 GB para Q5_K_M, 29 GB para Q8_0 y 54 GB para BF16, a los que hay que sumar la caché KV del contexto configurado y 0,93 GB del proyector visual.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M y Q5_K_M encajan en GPUs consumer de gama alta con 24 GB de VRAM; Q8_0 requiere GPUs de 32 GB o superiores; BF16 requiere 80 GB o reparto entre varias GPU.
- Cabe en GPU consumer: sí, al menos las variantes Q4_K_M y Q5_K_M en tarjetas de 24 GB, siempre que se ajuste el tamaño de contexto y la caché.
- Opciones de despliegue: llama.cpp (versión b12767 o posterior, compilada con `-DGGML_CUDA=ON`), con llama-server como servidor compatible con la API de OpenAI. El ejemplo usa `--gpu-layers 99 --split-mode layer --flash-attn on --ctx-size 32768 --parallel 1`.
- Latencia y throughput: no disponibles. El ejemplo oficial sirve una petición a la vez (`--parallel 1`) con contexto de 32K.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica muy escasa: no se publican detalles de arquitectura, datos de entrenamiento, idiomas soportados ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación: no cuantificado; en tareas de planificación física, una alucinación puede traducirse en un plan de acción incorrecto, por lo que se recomienda validación externa antes de ejecutar acciones en un robot real.
- Sesgos: no documentados.
- Contexto: el ejemplo de servicio usa 32.768 tokens; el máximo real no está especificado y depende de la memoria disponible para la caché KV.
- Idiomas: no se especifica qué lenguas cubre el modelo; el ejemplo de la model card está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantización de un modelo base, conviene verificar la licencia y condiciones del modelo original SenseNova-RoboRSI-27B.
- Repositorio con muy poca tracción (0 descargas, 1 like en el momento de la consulta) y fechas de creación y actualización de noviembre de 2026, lo que sugiere un lanzamiento reciente y poca validación comunitaria.
- El modo de razonamiento se desactiva en el ejemplo oficial (`--reasoning off`); no se detalla el impacto de activarlo en calidad, latencia o consumo de tokens.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B-GGUF
- Modelo original: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- llama.cpp release b12767: https://github.com/ggml-org/llama.cpp/releases/tag/b12767
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
