# es-totaljs/totem-4b-gguf

## Resumen

Totem 4B es un modelo de lenguaje especializado en el framework Total.js 5 y en jComponent 20, desarrollado por es-totaljs. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-4B, orientado a actuar como asistente de programación para el ecosistema Total.js: responde con código corto y funcional, admite inglés y español, y está diseñado para indicar cuando no sabe algo en lugar de inventarlo. La versión publicada es la 0.1.

El modelo se distribuye en dos formatos: pesos completos en precisión original (es-totaljs/totem-4b) y una cuantización GGUF Q4_K_M (es-totaljs/totem-4b-gguf), que es la ficha que nos ocupa. Con 4.205.751.296 parámetros totales y un contexto de 16.384 tokens en el paquete de Ollama, está pensado para ejecutarse en hardware de consumo y para integrarse en la aplicación Totem, una herramienta de línea de comandos que lee y escribe archivos del proyecto del usuario y construye aplicaciones completas tarea a tarea.

Su relevancia radica en la especialización vertical: no compite como modelo generalista, sino como asistente de dominio cerrado para Total.js, con un prompt de sistema propio integrado en la plantilla de chat y respuestas directas sin bloque de razonamiento intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-4B, ajuste LoRA) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (paquete de Ollama) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); pesos completos en el repo base |
| Idiomas soportados | Inglés y español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only denso de aproximadamente 4.200 millones de parámetros, y se ajusta mediante LoRA sobre la biblioteca de Total.js. Los datos de entrenamiento descritos en la model card consisten en pares de preguntas y respuestas sobre Total.js 5 (hasta la versión 0.0.20-4) y jComponent 20, aplicaciones probadas y las tareas que ejecuta la aplicación Totem. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Como innovaciones destacables, el prompt de sistema propio del modelo está integrado en la plantilla de chat: si el usuario envía un mensaje de sistema, este sustituye al integrado. Las respuestas son directas, sin bloque de pensamiento (thinking), lo que reduce la latencia y el consumo de tokens en producción. La temperatura recomendada es 0,2, coherente con un uso de asistencia técnica donde se prioriza la precisión sobre la creatividad.

## Capacidades

- Generación de código para Total.js 5 y jComponent 20, con respuestas breves y funcionales.
- Asistencia conversacional en inglés y español.
- Conocimiento específico de la API y convenciones del framework Total.js en su versión 5 (hasta 0.0.20-4).
- Construcción de aplicaciones completas dentro de la aplicación Totem: servidor, acciones, pantallas y formularios, tarea a tarea.
- Lectura y escritura de archivos del proyecto cuando se ejecuta dentro de la aplicación Totem.
- Respuestas directas sin bloque de razonamiento, con prompt de sistema integrado y sustituible.
- Compatibilidad con APIs compatibles con OpenAI (LM Studio, vLLM, llama.cpp, Ollama), lo que permite conectarlo a la aplicación Totem.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión o audio.

## Casos de uso

- Asistencia en el desarrollo de aplicaciones Total.js: el modelo responde con fragmentos de código para el servidor, acciones y componentes, adecuado por su ajuste específico sobre la biblioteca y por su temperatura recomendada baja (0,2), que favorece respuestas deterministas.
- Generación de pantallas y formularios con jComponent 20: dentro de la aplicación Totem, el modelo crea las vistas de la aplicación tarea a tarea, leyendo y escribiendo los archivos del proyecto.
- Integración en el flujo de trabajo de línea de comandos: mediante `npm install -g totaljs-totem` y el comando `totem`, el modelo actúa como asistente embebido en el entorno de desarrollo del programador.
- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M y sus 4.200 millones de parámetros permiten ejecutarlo en hardware de consumo a través de Ollama, LM Studio o llama.cpp, sin depender de servicios en la nube.
- Servicio de preguntas y respuestas sobre la API de Total.js: al conocer la versión 5 hasta 0.0.20-4, puede resolver dudas concretas sobre el framework y señalar cuándo no dispone de la respuesta, lo que reduce el riesgo de código inventado.
- Integración en pipelines con API compatible con OpenAI: al poder servirse con vLLM o llama.cpp, puede conectarse a herramientas internas que consuman el protocolo de OpenAI para asistencia técnica en castellano e inglés.
- Soporte bilingüe para equipos hispanohablantes: responde en español e inglés, lo que facilita su adopción en equipos mixtos que trabajan con Total.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio GGUF ocupa 2,7 GB, lo que sitúa la cuantización Q4_K_M en un rango manejable para GPUs de consumo, aunque no se detallan cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsible por el tamaño de la cuantización (2,7 GB de repositorio) y los 4.200 millones de parámetros, pero sin cifras oficiales de VRAM ni de GPUs concretas.
- Opciones de despliegue documentadas: Ollama (`ollama run totaljs-es/totem`), LM Studio (búsqueda de `es-totaljs/totem-4b-gguf`), llama.cpp (`llama-server -hf es-totaljs/totem-4b-gguf --jinja`), vLLM (`vllm serve es-totaljs/totem-4b`) y Transformers (`es-totaljs/totem-4b`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Totem 4B (este modelo) | 4.205.751.296 | 16.384 tokens (Ollama) | Total.js 5 y jComponent 20 | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | Aproximadamente 4B (no se detalla cifra exacta en la información disponible) | No disponible | Generalista | No disponible en la información proporcionada | Hugging Face |
| Alternativas generalistas de ~4B | No disponible | No disponible | Generalista | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Ámbito de conocimiento restringido: el modelo está ajustado para Total.js 5 hasta la versión 0.0.20-4 y jComponent 20; su utilidad fuera de ese dominio no está documentada y probablemente sea limitada.
- Idiomas: solo se declaran inglés y español; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación: aunque el modelo está diseñado para decir cuando no sabe algo, no se documentan evaluaciones formales de tasa de alucinación ni de fidelidad del código generado.
- Contexto limitado a 16.384 tokens en el paquete de Ollama; no se especifica si otras vías de despliegue admiten una ventana mayor.
- Versión 0.1: se trata de una primera versión publicada, sin historial de madurez ni resultados de benchmarks.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las obligaciones de atribución y las condiciones del modelo base Qwen/Qwen3.5-4B, cuya licencia no se detalla en la información disponible.
- Dependencia del prompt de sistema integrado: un mensaje de sistema del usuario lo sustituye por completo, lo que puede alterar el comportamiento esperado del asistente.
- Sin soporte documentado de tool calling, agentes multi-paso, visión o audio.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/es-totaljs/totem-4b-gguf
- Repositorio de pesos completos: https://huggingface.co/es-totaljs/totem-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicación Totem (GitHub): https://github.com/totaljs-es/totem
