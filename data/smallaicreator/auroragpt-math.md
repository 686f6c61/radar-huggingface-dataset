# SmallAICreator/AuroraGPT-Math

## Resumen

AuroraGPT-Math es un modelo de lenguaje de 707 millones de parámetros desarrollado por UltraLabs, continuación de AuroraGPT-Qwen-Distill. Está especializado en aritmética real y uso de contexto multi-turno, manteniendo las capacidades de chat y tool-calling del modelo original. El modelo se ha entrenado mediante destilación y ajuste fino supervisado (SFT) con un conjunto de datos generado proceduralmente que garantiza respuestas correctas por construcción, lo que mejora significativamente su precisión en operaciones matemáticas básicas.

La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en dispositivos con recursos limitados (on-device), y en su enfoque en la corrección de errores aritméticos comunes en modelos pequeños. Incluye soporte para tool-calling (búsqueda web, calculadora, fetch de URLs) y un formato de chat propio, con una versión GGUF Q8_0 lista para usar con llama.cpp. Está pensado para desarrolladores que necesitan un asistente conversacional ligero con capacidades matemáticas fiables y posibilidad de integración en aplicaciones móviles o de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada oficialmente; los tags indican "llama" y "transformers", probablemente variante de Llama |
| Parametros totales | 707.480.064 (707M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF incluido); otras cuantizaciones no documentadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentacion, pero los tags de HuggingFace indican que se basa en una arquitectura tipo Llama (transformers). El modelo es denso, con 707M de parametros, y utiliza un tokenizador compatible con el formato de chat propio (no ChatML) con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`.

El entrenamiento consistio en un ajuste fino supervisado (SFT) de parametros completos durante 2 epocas con secuencias empaquetadas (sequence-packed). Se anadieron aproximadamente 250.000 ejemplos de matematicas generados proceduralmente y correctos por construccion (cada respuesta se calculo con Python), cubriendo suma, resta, multiplicacion, division, porcentajes, fracciones, orden de operaciones y problemas de palabras. Tambien se incluyeron unas 8.000 conversaciones multi-turno para mejorar el uso de contexto (resumir, explicar de forma mas simple, comparar, recordar preguntas previas, continuar listas, corregir nombres o temas, cambiar de tema y volver). El dataset original de chat, tool-calling y correccion de identidad/saludos se mezclo de nuevo para mantener el equilibrio de habilidades.

## Capacidades

- Generacion de texto conversacional con estilo de chat natural y manejo de identidad.
- Aritmetica basica (suma, resta, multiplicacion, division, porcentajes, fracciones, orden de operaciones) con razonamiento paso a paso (chain-of-thought).
- Uso de contexto multi-turno: puede resumir informacion previa, explicar conceptos de forma mas sencilla, comparar elementos, recordar preguntas anteriores, continuar listas incrementales y corregir nombres o temas.
- Tool-calling: emite llamadas a herramientas como `web_search`, `calculator` y `fetch_url` en un formato estructurado (`<tool_call>` con JSON).
- Capacidad de recibir resultados de herramientas como turnos de usuario y continuar la conversacion.
- Conocimiento cerrado limitado por su tamano; se recomienda combinar con herramientas de busqueda para datos factuales.
- No soporta vision ni audio.

## Casos de uso

- Asistente matematico en dispositivos moviles: el modelo puede resolver operaciones aritmeticas paso a paso y explicar el procedimiento, gracias a su entrenamiento especifico en chain-of-thought. Su tamano reducido y la version GGUF Q8_0 permiten ejecutarlo localmente en smartphones con frameworks como llama.cpp.
- Chatbot de atencion al cliente con calculo integrado: puede gestionar conversaciones multi-turno donde el usuario necesita calcular precios, descuentos o porcentajes, y recurrir a la herramienta `calculator` cuando la precision es critica.
- Tutor de matematicas para educacion: el modelo puede generar explicaciones de problemas aritmeticos, comparar dos metodos de resolucion o recordar el primer problema planteado en una sesion, facilitando un aprendizaje interactivo.
- Agente conversacional con acceso a herramientas: integrable en pipelines que requieren busqueda web o recuperacion de URLs, emitiendo llamadas a herramientas de forma estructurada y procesando las respuestas.
- Asistente de productividad local: para resumir conversaciones, mantener listas de tareas incrementales o corregir informacion erronea en un contexto de chat, sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de IA generativa: gracias a su licencia Apache 2.0 y su compatibilidad con transformers y TGI, se puede desplegar en entornos de desarrollo para validar flujos de tool-calling y razonamiento matematico antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona un benchmark local propio con 16 preguntas de aritmetica de libro cerrado, comparando con el modelo predecesor:

| Tarea | AuroraGPT-Qwen-Distill | AuroraGPT-Math |
|---|---|---|
| Aritmetica (16 preguntas) | 5/16 | 10/16 |
| Tool-calling (3 pruebas) | 3/3 | 3/3 |
| Chat / identidad / instrucciones | sin cambios | sin cambios |

Estos resultados indican una mejora sustancial en aritmetica, aunque el autor advierte que operaciones mas complejas (resta con llevadas de varios digitos, multiplicacion de dos digitos) siguen siendo propensas a errores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en fp16 (707M parametros), menos de 1 GB con cuantizacion Q8_0 (753 MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3050, o incluso CPU sola con llama.cpp.
- Cabe en GPUs de consumo: si, en practicamente todas las GPUs modernas, incluidas las integradas de gama alta.
- Opciones de despliegue: transformers (Python), llama.cpp (GGUF), Ollama (si se convierte), Text Generation Inference (TGI) compatible con endpoints.
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna se espera una generacion de decenas de tokens por segundo, y en CPU con GGUF Q8_0, unos pocos tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| AuroraGPT-Math | 707M | No disponible | Apache 2.0 | Matematicas, tool-calling, on-device |
| Qwen2.5-0.5B | 500M | 32K | Apache 2.0 | Generico, multilingue |
| Llama-3.2-1B | 1.2B | 128K | Llama 3.2 Community | Generico, multilingue |
| TinyLlama-1.1B | 1.1B | 2K | Apache 2.0 | Generico, eficiente |

AuroraGPT-Math se distingue por su enfoque especifico en aritmetica y tool-calling, mientras que las alternativas ofrecen mayor contexto o capacidades multilingues. No se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- Aritmetica compleja fragil: operaciones como resta con llevadas de varios digitos o multiplicacion de dos digitos pueden fallar; se recomienda usar la herramienta `calculator` para resultados exactos.
- Correccion de premisas falsas no mejorada: el modelo puede aceptar mitos populares o afirmaciones incorrectas si se le presentan como hechos.
- Conocimiento cerrado limitado por su tamano: no es adecuado para responder preguntas factuales fuera de su entrenamiento sin apoyo de herramientas de busqueda.
- Idioma: solo soporta ingles; no hay soporte multilingue.
- Formato de chat propietario: no usa ChatML, lo que puede requerir adaptacion en frameworks que esperan plantillas estandar.
- Sin garantias de rendimiento en produccion: los benchmarks son locales y limitados; se recomienda validar en el caso de uso especifico.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/AuroraGPT-Math
- Modelo base (AuroraGPT-Qwen-Distill): https://huggingface.co/SmallAICreator/AuroraGPT-Qwen-Distill
- Repositorio de cuantizaciones (no especifico para este modelo): https://huggingface.co/models?other=base_model:quantized:SmallAICreator/AuroraGPT-700M
