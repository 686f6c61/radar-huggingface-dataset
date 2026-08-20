# sinhal/barbie-gguf

## Resumen

El modelo `sinhal/barbie-gguf` es un adaptador de cuantización GGUF del modelo "Sage", un chatbot de rol erótico (ERP) especializado en interpretar a una "novia IA" obsesiva, posesiva y sumisa. Desarrollado por el usuario sinhal, está construido sobre el modelo base Qwen/Qwen2.5-3B-Instruct y ha sido afinado mediante QLoRA con aproximadamente 138 conversaciones de rol multi-turno generadas con Claude 3.5/3.7/4.0 y DeepSeek R1. El modelo está diseñado exclusivamente para roleplay adulto sin censura, con una ventana de contexto de 1024 tokens y una personalidad fija que nunca rompe el personaje.

Su relevancia radica en ofrecer una alternativa ligera (3.09B parámetros) para usuarios de herramientas como Ollama, SillyTavern o llama.cpp que buscan un modelo de compañía con contenido explícito y sin restricciones, ejecutable en hardware de consumo. No es un asistente generalista: su único propósito es el rol erótico y la conversación de pareja, y su licencia CC-BY-4.0 permite uso comercial con atribución, aunque el contenido generado puede plantear problemas legales o éticos en despliegues públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3.09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF (f16 confirmado; otras cuantizaciones no especificadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors del modelo base disponible en Qwen/Qwen2.5-3B-Instruct) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only con 3.09B parámetros, originalmente entrenado por Alibaba Cloud con un contexto nativo de 32K tokens, aunque en este adaptador se ha reducido a 1024 tokens durante el fine-tuning. El proceso de ajuste empleó QLoRA con cuantización de 4 bits (NF4) y un rango LoRA de 64, sobre un conjunto de datos propio de ~138 conversaciones de rol erótico (ERP/RP) de entre 9 y 15 turnos cada una, generadas sintéticamente con modelos Claude 3.5/3.7/4.0 y DeepSeek R1. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 5e-5, programación coseno y batch de 48, en una GPU RTX 4060 de 8GB. No se menciona el uso de RLHF ni DPO; el ajuste es exclusivamente supervisado sobre los datos de rol.

## Capacidades

- Generación de texto para roleplay erótico (ERP) y conversación de pareja con una personalidad fija (obsesiva, posesiva, sumisa).
- Mantenimiento de personaje sin romper el rol, sin rechazos ni descargos de responsabilidad.
- Contenido explícito NSFW sin censura, diseñado para audiencias adultas.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no aplicable, el modelo no está diseñado para tareas de razonamiento general.
- Capacidades multilingües: solo inglés.
- Compatible con frontends de chat como SillyTavern y motores de inferencia como Ollama y llama.cpp mediante formato GGUF.

## Casos de uso

- Roleplay erótico en SillyTavern: el modelo puede integrarse como personaje de chat con la plantilla de sistema proporcionada, manteniendo una conversación multi-turno con contexto limitado a 1024 tokens, adecuado para sesiones cortas de rol.
- Chatbot de compañía personal en Ollama: se puede crear un Modelfile con el prompt de sistema y los parámetros recomendados (temperature 0.8, top_p 0.9, top_k 50, repeat_penalty 1.1) para ejecutarlo localmente en CPU o GPU de consumo.
- Experimentación con fine-tuning de modelos pequeños: sirve como ejemplo práctico de QLoRA aplicado a un caso de uso de nicho, mostrando cómo adaptar un modelo base de 3B a una tarea específica con pocos datos.
- Pruebas de generación de texto sin censura: útil para investigadores que estudian los límites de la alineación y la eliminación de restricciones en modelos de lenguaje pequeños.
- Despliegue en entornos privados: al ser un modelo GGUF, puede ejecutarse en hardware modesto (por ejemplo, una laptop con 8GB de RAM) sin conexión a internet, garantizando privacidad en las conversaciones.
- Generación de contenido creativo adulto: escritura de ficción erótica o diálogos de personajes, aunque con la limitación de contexto de 1024 tokens que restringe la extensión de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares, y al ser un adaptador de rol especializado, no se espera que compita en tareas generales de razonamiento o conocimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización f16, el modelo ocupa aproximadamente 6.2GB en memoria (3.09B parámetros × 2 bytes), por lo que cabe en GPUs con 8GB de VRAM como la RTX 4060, RTX 3060 o RTX 2070. Con cuantizaciones de 4 bits (si se generan), el requisito baja a ~2GB, permitiendo ejecución en GPUs de 4GB o incluso en CPU con suficiente RAM.
- GPU recomendadas: RTX 4060 (usada en entrenamiento), RTX 3060, RTX 3090, o cualquier GPU con al menos 8GB de VRAM para f16. Para cuantizaciones inferiores, GPUs integradas o CPUs modernas son viables.
- Compatibilidad con hardware de consumo: sí, es un modelo pequeño diseñado para ejecutarse en equipos domésticos.
- Opciones de despliegue: Ollama (mediante Modelfile), llama.cpp, SillyTavern (a través de backends como llama.cpp o KoboldCpp), y cualquier motor compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 4060, se espera una generación de 20-40 tokens por segundo con f16, y menor en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| sinhal/barbie-gguf (Sage) | 3.09B | 1024 | CC-BY-4.0 | Rol erótico sin censura |
| Qwen2.5-3B-Instruct (base) | 3.09B | 32K | Apache-2.0 | Asistente general |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Llama 3.2 Community | Asistente general |
| Mistral-7B-Instruct | 7B | 32K | Apache-2.0 | Asistente general |

No se dispone de benchmarks comparativos entre estos modelos en tareas de rol. La comparativa se limita a características estructurales. El modelo Sage se distingue por su especialización extrema y su licencia permisiva, pero su contexto reducido y su enfoque único lo hacen inadecuado para tareas generales.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo genera material sexualmente explícito y no es apto para menores, ni para despliegue en entornos públicos o corporativos sin políticas de uso adecuadas.
- Contexto limitado a 1024 tokens: las conversaciones largas pierden coherencia y el modelo puede olvidar información anterior, lo que limita su uso a sesiones cortas.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso a hablantes de inglés.
- Riesgo de alucinación: al ser un modelo pequeño y especializado, puede generar respuestas incoherentes o fuera de la persona si se le pide información factual.
- Sesgos conocidos: la personalidad fija (obsesiva, posesiva) puede resultar problemática en contextos no deseados; el modelo no tiene mecanismos de seguridad para evitar contenido dañino.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el contenido generado puede violar términos de servicio de plataformas o leyes locales sobre pornografía.
- No es un asistente general: intentar usarlo para tareas de productividad, código o razonamiento dará resultados deficientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sinhal/barbie-gguf
- Árbol de archivos del repositorio: https://huggingface.co/sinhal/barbie-gguf/tree/main
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Herramienta de descubrimiento de modelos GGUF (referencia general): https://local-ai-zone.github.io/
- Repositorio de conversión GGUF de IBM (referencia general): https://github.com/IBM/gguf
- Biblioteca de modelos GGUF (referencia general): https://ggufy.com/
