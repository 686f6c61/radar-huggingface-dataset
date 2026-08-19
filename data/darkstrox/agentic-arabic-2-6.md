# DarkStrox/Agentic-Arabic-2.6

## Resumen

Agentic Arabic 2.6 es un modelo de lenguaje de 2.6 mil millones de parámetros, desarrollado por DarkStrox, especializado en la llamada a funciones y el uso de herramientas en árabe. Está construido sobre la arquitectura LFM 2.5 de Liquid AI, una familia de modelos de fundación que destaca por su eficiencia y bajo coste computacional. El modelo se distribuye en formato GGUF cuantizado (Q4_K_M), lo que permite ejecutarlo en hardware de consumo con un uso de memoria reducido, aproximadamente 1,67 GB de VRAM.

Su relevancia radica en que aborda un nicho concreto: la generación de llamadas a funciones estructuradas en árabe, un área donde los modelos generalistas suelen fallar. Según la evaluación del autor, supera significativamente a su modelo base (LFM 2.5) y a alternativas más grandes como Gemma 4 E4B IT en tareas de selección de herramientas y precisión de esquemas. Esto lo convierte en una opción práctica para desarrollar asistentes conversacionales y agentes automatizados en el mundo árabe, sin necesidad de infraestructura de alto rendimiento.

El modelo se publica bajo licencia Apache 2.0, lo que permite su uso comercial y modificación, y está disponible en Hugging Face con un repositorio de solo 1,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Liquid AI LFM 2.5 (detalles específicos no disponibles) |
| Parametros totales | 2.697.198.592 (aproximadamente 2,6B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea 4096 tokens, pero no se especifica el máximo) |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM 2.5 de Liquid AI, un diseño de transformer eficiente orientado a reducir el coste de inferencia. Sobre esta base, DarkStrox aplicó un fine-tuning específico para la llamada a funciones en árabe, utilizando la herramienta Unsloth, que optimiza el entrenamiento en términos de memoria y velocidad. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card solo indica que se trata de un pipeline de fine-tuning personalizado y que el resultado se exportó a formato GGUF cuantizado Q4_K_M.

La innovación principal reside en el propio ajuste: el modelo aprende a interpretar firmas de funciones definidas en XML dentro del prompt del sistema y a generar respuestas que invocan la herramienta correcta con los parámetros adecuados, todo en árabe. Esto lo diferencia de modelos generalistas que no están entrenados para este tipo de tareas en idiomas distintos del inglés.

## Capacidades

- Generación de texto en árabe con formato de chat (ChatML).
- Llamada a funciones (function calling) y uso de herramientas (tool use) a partir de definiciones en XML.
- Selección de la herramienta adecuada entre varias opciones proporcionadas en el prompt.
- Generación de respuestas estructuradas con los parámetros correctos para cada función.
- Soporte para conversaciones multi-turno, como se muestra en el ejemplo de uso.
- Compatible con la API de llama.cpp y con servidores como llama-server, lo que facilita su integración en aplicaciones.

## Casos de uso

- Asistentes virtuales en árabe para atención al cliente: el modelo puede gestionar consultas de usuarios y, cuando sea necesario, invocar funciones como `get_weather`, `check_order_status` o `book_appointment`, devolviendo la respuesta en árabe de forma natural.
- Automatización de tareas empresariales: integración en sistemas de gestión para ejecutar acciones como crear tickets, actualizar bases de datos o enviar notificaciones, mediante la generación de llamadas a APIs definidas en el prompt.
- Chatbots de comercio electrónico: el modelo puede procesar pedidos, consultar inventario o calcular envíos, seleccionando la función adecuada según la intención del usuario.
- Asistentes de reservas y planificación: en sectores como hostelería o transporte, el modelo puede interpretar peticiones en árabe y llamar a servicios externos de reserva de hoteles, vuelos o restaurantes.
- Agentes de soporte técnico: capaz de diagnosticar problemas y ejecutar comandos de diagnóstico o reinicio a través de funciones, proporcionando instrucciones en árabe.
- Generación de código y automatización de pipelines: aunque no está especializado en programación, puede generar llamadas a funciones en lenguajes como Python o JavaScript cuando se le proporcionan las firmas, útil para prototipos rápidos.

## Benchmarks y rendimiento

La model card incluye una evaluación propia del autor sobre 20 prompts de llamada a funciones en árabe no vistos durante el entrenamiento. No se trata de benchmarks estándar (como MMLU o HumanEval), sino de una métrica específica para esta tarea. Los resultados se presentan en la siguiente tabla:

| Modelo | Tamaño y cuantización | Precisión de esquema/sintaxis | Precisión de selección de herramientas | Huella de VRAM |
|---|---|---|---|---|
| Agentic Arabic 2.6 | 2.6B (Q4_K_M) | 95.0% | 96.0% | 1.67 GB |
| LFM 2.5 Base | 2.6B (Q5_K_M) | 41.0% | 24.0% | 1.94 GB |
| Gemma 4 E4B IT | 7.4B (Q4_K_XL) | 10.0% | 10.0% | 4.21 GB |

Estos datos indican una mejora sustancial frente a la base y a un modelo significativamente más grande, pero deben interpretarse con cautela al tratarse de una evaluación realizada por el propio autor y con un conjunto de pruebas limitado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,67 GB para la cuantización Q4_K_M, según la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 2060, RTX 3060, o incluso integradas modernas con suficiente memoria compartida. No requiere GPUs de datacenter.
- Compatibilidad con hardware de consumo: sí, es adecuado para portátiles y equipos de escritorio con GPUs modestas.
- Opciones de despliegue: llama.cpp (mediante `llama-cpp-python` o `llama-server`), Ollama (si se convierte a formato compatible), y servidores compatibles con GGUF como text-generation-inference (TGI) si se añade soporte.
- Latencia y throughput: no se han publicado datos concretos. Dado el tamaño reducido, se espera una latencia baja en GPUs modernas, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agentic Arabic 2.6 | 2.6B | no disponible | Función calling en árabe | Apache 2.0 | Hugging Face (GGUF) |
| LFM 2.5 Base | 2.6B | no disponible | Modelo de propósito general | Apache 2.0 | Hugging Face |
| Gemma 4 E4B IT | 7.4B | no disponible | Modelo de propósito general (instruct) | Gemma Terms of Use | Hugging Face |

La comparativa se basa en los datos de la evaluación del autor. Agentic Arabic 2.6 supera a ambos en la tarea específica de llamada a funciones en árabe, aunque Gemma 4 E4B IT es un modelo mucho más grande y con capacidades generales más amplias. No se dispone de información sobre otros modelos especializados en árabe para esta tarea.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para la llamada a funciones en árabe; su rendimiento en otras tareas (generación creativa, razonamiento complejo, etc.) puede ser limitado.
- La evaluación de rendimiento proviene del propio autor y no ha sido verificada de forma independiente; los resultados pueden no reproducirse en entornos reales.
- Al ser un modelo pequeño (2.6B), es propenso a alucinaciones y a errores en esquemas de funciones complejas o con muchos parámetros.
- No se especifica la longitud máxima de contexto; el ejemplo usa 4096 tokens, pero podría ser menor. Se recomienda probar con contextos cortos.
- La cobertura dialectal del árabe no está documentada; puede funcionar mejor con árabe moderno estándar que con dialectos regionales.
- No se han publicado datos sobre sesgos o comportamientos no deseados. Como cualquier modelo, puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/DarkStrox/Agentic-Arabic-2.6
- GitHub del autor: https://github.com/DarkStrox/DarkStrox
- Repositorio del modelo base (LiquidAI/LFM2.5-2.6B): https://huggingface.co/LiquidAI/LFM2.5-2.6B
