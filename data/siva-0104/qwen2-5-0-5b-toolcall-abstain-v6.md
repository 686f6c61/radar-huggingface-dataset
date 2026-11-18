# siva-0104/qwen2.5-0.5b-toolcall-abstain-v6

## Resumen

Qwen2.5-0.5B-toolcall-abstain-v6 es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicado por el usuario siva-0104. El modelo está especializado en una tarea muy concreta: el *tool calling* con capacidad de abstención. Dado un mensaje del usuario y un conjunto de esquemas de herramientas en JSON, el modelo emite una llamada a herramienta con el formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, formula una pregunta para solicitar información que falta o declara explícitamente que ninguna de las herramientas disponibles es aplicable. Esta última capacidad, la abstención, es el rasgo diferencial frente a otros modelos afinados para function calling, que tienden a forzar una llamada aunque no haya herramienta adecuada.

El modelo parte de la arquitectura transformer densa de Qwen2.5 con 494.032.768 parámetros totales (aproximadamente 0,5 mil millones) y está pensado para agentes locales pequeños que trabajan con herramientas recuperadas de una biblioteca mayor mediante similitud de embeddings. El ajuste se realizó con QLoRA en 4 bits NF4 (rango 16, alpha 32) sobre un conjunto de datos público de function calling (xLAM, Glaive, Hermes y ToolACE), con un 24 % de filas sin llamada y un 49 % de filas con herramientas distractoras deliberadamente parecidas.

Su relevancia actual reside en que aborda un problema práctico de los agentes basados en modelos pequeños: la sobreactivación de herramientas y la alucinación de llamadas cuando la petición no encaja con ninguna disponible. El autor publica además el pipeline de agente, la evaluación y el código en un repositorio de GitHub, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tuning QLoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento trunca a 1.024 tokens) |
| Tipos de cuantizacion | fp16 (pesos fusionados), 4-bit MLX (carpeta `mlx/`), adaptador LoRA (`adapter/`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers), MLX 4-bit, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2.5, en su variante Instruct de 0,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste supervisado con QLoRA en 4 bits NF4, con rango LoRA 16 y alpha 32, tasa de aprendizaje 2e-4 con decaimiento coseno, batch efectivo de 16 y una sola época. La pérdida se calcula únicamente sobre la respuesta del asistente, no sobre el prompt. El adaptador resultante se fusionó en los pesos finales, y el repositorio incluye tanto el modelo fusionado en fp16 como el adaptador original y una versión MLX en 4 bits para Apple silicon. El entrenamiento se ejecutó en una T4 gratuita de Kaggle (44 minutos para el 0,5B, 100 minutos para el 1,5B y 169 minutos para el 3B).

Los datos de entrenamiento son todos públicos y con control de fuga: xLAM function-calling 60k (CC-BY-4.0, con acceso restringido), Glaive function-calling v2 (Apache-2.0, con respuestas de relleno fusionadas con la llamada siguiente), Hermes function-calling v1 (Apache-2.0) y ToolACE (Apache-2.0), más negativos sintéticos de herramientas no coincidentes. El conjunto final tiene 8.559 filas (8.366 tras el límite de 1.024 tokens), de las cuales el 24 % son filas sin llamada. Aproximadamente el 49 % de las filas de llamada incluyen entre 1 y 4 herramientas distractoras parecidas recuperadas de la biblioteca de entrenamiento. Los splits están separados por nombre de herramienta y el autor declara que `leak_check.py` pasa sin coincidencias de consultas BFCL ni nombres de herramientas de test en entrenamiento, con la salvedad de que 13 de las 9.314 definiciones de funciones de BFCL son idénticas (nombre y descripción) a una herramienta de entrenamiento, aunque con consultas distintas.

## Capacidades

- Generación de llamadas a herramientas en formato estructurado `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, incluyendo varias llamadas en una misma respuesta.
- Abstención explícita: el modelo puede indicar que ninguna herramienta del listado es aplicable, en lugar de forzar una llamada.
- Solicitud de información faltante: puede formular preguntas de aclaración cuando los argumentos no están completos, aunque esta capacidad es débil según el propio autor.
- Manejo de herramientas distractoras: entrenado con herramientas parecidas para reducir falsos positivos.
- Integración con MCP (Model Context Protocol) en el pipeline de agente publicado.
- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Capacidad multilingüe limitada al inglés.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes locales pequeños con herramientas recuperadas por embeddings: el modelo recibe las 5 herramientas más similares de una biblioteca mayor y decide si llamar, preguntar o abstenerse; es adecuado por su tamaño reducido y su entrenamiento específico en abstención.
- Automatización de atención al cliente con catálogo de acciones: el modelo puede decidir entre ejecutar una acción (consultar pedido, abrir incidencia) o responder que no dispone de herramienta para la petición, evitando llamadas erróneas.
- Enrutamiento de peticiones en pipelines de agentes: como primer clasificador que determina si una consulta requiere una herramienta y cuál, antes de derivar a un modelo mayor.
- Integración en flujos MCP: el autor publica un agente sobre MCP con 49 consultas y 10 herramientas, con una tasa de éxito de llamada del 80,6 % en el 0,5B, lo que lo hace viable para prototipos de servidores MCP.
- Validación de esquemas en producción: combinado con decodificación restringida por esquema (`lm-format-enforcer`), el autor reporta un 100 % de llamadas parseadas y válidas según esquema en xLAM, BFCL simple y live simple para el 0,5B y el 1,5B (100 elementos por conjunto), aunque advierte que no garantiza que los argumentos sean correctos.
- Despliegue en hardware de consumo: al tener menos de 500 millones de parámetros, puede ejecutarse en CPU o en GPU de gama baja para tareas de agentes embebidos o demostraciones.
- Filtrado de consultas fuera de dominio: su capacidad de abstención (75,8 % en BFCL irrelevance para el 0,5B) permite descartar peticiones que no encajan con el conjunto de herramientas antes de invocar sistemas externos.

## Benchmarks y rendimiento

Los resultados son del scorer propio del autor, no del checker oficial de BFCL, con una sola semilla y con BFCL en modo report-only. Se presentan los del 0,5B junto a los de sus variantes 1,5B y 3B del mismo autor para contexto.

| Metrica | 0.5B | 1.5B | 3B |
|---|---|---|---|
| BFCL simple, exact match | 79,3 | 83,7 | 89,7 |
| BFCL irrelevance, abstenido | 75,8 | 84,2 | 87,1 |
| BFCL live simple / live irrelevance | 44,6 / 71,7 | 56,6 / 77,0 | 66,3 / 77,0 |
| xLAM / Hermes / ToolACE exact (tests sin fuga) | 68,0 / 48,0 / 44,3 | 71,7 / 53,3 / 49,0 | 77,3 / 59,3 / 53,7 |
| Herramientas no coincidentes, abstenido | 99,7 | 99,7 | 100 |
| Agente sobre MCP, 49 consultas, 10 herramientas: exito de llamada | 80,6 % | 93,5 % | 93,5 % |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1 GB para los pesos (494 millones de parámetros); en 4 bits MLX, alrededor de 0,3-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó en una T4 de Kaggle. Para producción con concurrencia, una T4, L4 o RTX 3060 en adelante.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (referencia), MLX (`mlx-lm`) en Apple silicon, y el ecosistema compatible con `text-generation-inference` y endpoints según los tags del repositorio. No se menciona soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siva-0104/qwen2.5-0.5b-toolcall-abstain-v6 | 494 M | No disponible | Tool calling con abstención | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | No disponible | Instrucción general | Apache-2.0 | Hugging Face |
| Variantes 1.5B y 3B del mismo autor | 1,5 B / 3 B | No disponible | Tool calling con abstención | Apache-2.0 | Hugging Face |
| Modelos mayores de function calling (p. ej. familias de 7B en adelante) | 7 B+ | Variable | Function calling general | Variable | Hugging Face |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en tool calling con abstención) no está disponible en la información proporcionada. El propio autor ofrece como referencia interna sus variantes de 1,5B y 3B, que superan al 0,5B en todas las métricas reportadas.

## Limitaciones y advertencias

- Debilidad en información faltante: según el autor, el modelo de 1,5B a menudo llama con un valor inventado en lugar de preguntar (4 de 6 consultas de test; el 3B, 3 de 6). El 0,5B comparte esta familia de fallos.
- Abstención imperfecta: la métrica de BFCL irrelevance se sitúa en el 75,8 % para el 0,5B; una puerta de similitud añade algunos puntos a costa de llamadas válidas.
- Cuello de botella del recuperador con muchas herramientas: con 12.641 herramientas, la herramienta correcta aparece en el top 5 solo en el 70 % de las consultas (94 % con 100 herramientas), y el manejo de "ninguna herramienta encaja" cae del 93-100 % con 10 herramientas al 15-19 % cuando el top 5 proviene de la biblioteca completa (muestra de portátil, n = 100 por condición). Meter 100 herramientas en el prompt empeora el resultado (exact match del 6 % en el 0,5B y del 29 % en el 1,5B).
- La decodificación restringida por esquema (`lm-format-enforcer`) garantiza llamadas parseadas y válidas según esquema, pero no que los argumentos sean correctos.
- La evaluación del agente es pequeña (49 consultas); diferencias inferiores a unos 10 puntos son ruido.
- Solo inglés; no está afinado en seguridad más allá del modelo base.
- Las salidas de las herramientas deben tratarse como no confiables.
- Licencia Apache-2.0, que permite uso comercial, pero los datos de entrenamiento incluyen xLAM bajo CC-BY-4.0, que requiere atribución.
- El modelo fue desarrollado con asistencia de IA (Claude Code) bajo dirección del autor, según declara este.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siva-0104/qwen2.5-0.5b-toolcall-abstain-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de código, evaluación y pipeline de agente: https://github.com/siva-0104/toolcall-slm
- xLAM function-calling 60k (dataset, CC-BY-4.0): no disponible la URL exacta en la informacion proporcionada
- Glaive function-calling v2 (dataset, Apache-2.0): no disponible la URL exacta en la informacion proporcionada
- Hermes function-calling v1 (dataset, Apache-2.0): no disponible la URL exacta en la informacion proporcionada
- ToolACE (dataset, Apache-2.0): no disponible la URL exacta en la informacion proporcionada
