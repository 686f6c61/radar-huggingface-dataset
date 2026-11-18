# siva-0104/qwen2.5-3b-toolcall-abstain-v6

## Resumen

Qwen2.5-3B-ToolCall-Abstain-v6 es un ajuste fino del modelo Qwen2.5-3B-Instruct de Alibaba Qwen, publicado por el usuario siva-0104 en Hugging Face. El modelo está especializado en tool calling (llamada a funciones) con capacidad de abstención: dado un turno de usuario y una lista de esquemas de herramientas en JSON, el modelo emite una o varias llamadas `<tool_call>`, formula una pregunta para solicitar información faltante, o declara que ninguna herramienta de la lista es aplicable. El problema que aborda es el sesgo de los modelos base a invocar herramientas incluso cuando no procede, lo que degrada la fiabilidad de agentes pequeños desplegados localmente.

Arquitectura transformer decoder-only de 3.085.938.688 parámetros (unos 3,09 mil millones), derivada de Qwen2.5-3B-Instruct. El ajuste se realizó con QLoRA en 4 bits NF4 (r=16, alpha=32) sobre 8.366 filas de datos públicos de function calling, y el adaptador se fusionó en los pesos finales. El repositorio incluye el modelo fusionado en fp16, una versión MLX de 4 bits para Apple Silicon y el adaptador LoRA por separado.

Su relevancia actual radica en que demuestra que un modelo de 3B puede alcanzar un 89,7% de exactitud en BFCL simple y un 87,1% de abstención correcta en BFCL irrelevance con un coste de entrenamiento de 169 minutos en una GPU T4 gratuita de Kaggle. Es un caso práctico de ajuste eficiente orientado a agentes locales con recuperación de herramientas y validación de esquemas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento truncó a 1.024 tokens) |
| Tipos de cuantización | fp16 (modelo fusionado), 4-bit NF4 para el entrenamiento QLoRA, 4-bit MLX |
| Idiomas soportados | inglés (en) |
| Licencia | qwen-research (Qwen Research License, solo investigación y evaluación, no comercial) |
| Formato de pesos | safetensors (transformers), MLX 4-bit, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, y se ajusta mediante QLoRA con cuantización 4-bit NF4, rango LoRA 16 y alpha 32. El entrenamiento usa optimizador con tasa de aprendizaje 2e-4 y scheduler coseno, batch efectivo de 16, una sola época y cálculo de pérdida únicamente sobre la respuesta del asistente. El adaptador resultante se fusiona en los pesos base, dando lugar al modelo fp16 publicado en la raíz del repositorio.

Los datos de entrenamiento son exclusivamente públicos y con control de fuga: xLAM function-calling 60k (CC-BY-4.0, con cita a APIGen y xLAM), Glaive function-calling v2 (Apache-2.0), Hermes function-calling v1 (Apache-2.0) y ToolACE (Apache-2.0), más negativos sintéticos de herramientas no coincidentes. El conjunto final consta de 8.366 filas tras aplicar un límite de 1.024 tokens, de las cuales el 24% son filas sin llamada. Aproximadamente el 49% de las filas de llamada incluyen entre 1 y 4 herramientas distractoras de aspecto similar recuperadas de la biblioteca de entrenamiento. No se usaron datos de When2Call ni de BFCL, y los splits están separados por nombre de herramienta con verificación de fuga mediante `leak_check.py` (0 coincidencias de consultas BFCL). El autor declara una superposición informativa: 13 de las 9.314 definiciones de funciones de BFCL son idénticas en nombre y descripción a una herramienta de entrenamiento, aunque con consultas distintas.

## Capacidades

- Generación de llamadas a herramientas en formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, incluyendo varias llamadas en una misma respuesta.
- Abstención explícita: el modelo puede indicar que ninguna herramienta de la lista es aplicable, en lugar de forzar una llamada.
- Solicitud de información faltante mediante preguntas de aclaración, aunque con limitaciones documentadas.
- Razonamiento multi-paso orientado a agentes: el pipeline del autor recupera las 5 herramientas más similares por embedding, valida las llamadas contra el esquema y ejecuta sobre MCP (Model Context Protocol).
- Tool calling y function calling con esquemas JSON en el mensaje de sistema, siguiendo la plantilla de chat de Qwen.
- Decodificación restringida por esquema con lm-format-enforcer (probada en 0.5B y 1.5B, no en 3B por memoria), que garantiza llamadas analizables y válidas contra el esquema.
- Capacidades multilingües: solo inglés.
- No dispone de visión, audio ni modo de pensamiento explícito más allá del razonamiento implícito del modelo base.

## Casos de uso

- Agentes locales de escritorio: el modelo puede ejecutarse en un portátil con GPU de consumo y decidir entre un conjunto pequeño de herramientas (por ejemplo, abrir aplicaciones, consultar archivos, enviar correos) con una tasa de éxito del 93,5% en la evaluación de agente sobre MCP con 10 herramientas y 49 consultas.
- Automatización de atención al cliente con herramientas acotadas: dado un catálogo de funciones (consultar pedido, tramitar devolución, escalar a humano), el modelo emite la llamada correcta o pregunta por el dato que falta, reduciendo llamadas erróneas frente al modelo base.
- Enrutamiento de consultas en pipelines RAG con function calling: el modelo decide si la consulta requiere una herramienta, si debe aclararse o si no aplica ninguna, lo que permite descartar consultas fuera de dominio antes de ejecutar acciones costosas.
- Validación previa a ejecución en CI/CD: combinado con decodificación restringida por esquema (lm-format-enforcer), genera llamadas con el 100% de validez sintáctica y de esquema en las pruebas del autor, lo que facilita integrarlo en pipelines que validan antes de invocar APIs.
- Prototipado de agentes MCP: al seguir el protocolo MCP en el pipeline de referencia, sirve como base para construir asistentes que descubren herramientas y ejecutan llamadas validadas contra el esquema.
- Investigación sobre abstención y calibración: el modelo es un punto de partida reproducible (entrenamiento en T4 gratuita, datos públicos, script de verificación de fuga) para estudiar cuándo un SLM debe declinar el uso de herramientas.
- Filtrado de herramientas en bibliotecas grandes: con recuperación top-5 por embedding, el modelo puede operar sobre bibliotecas de hasta 12.641 herramientas, aunque con caída documentada de rendimiento cuando la recuperación falla.

## Benchmarks y rendimiento

Resultados del scorer propio del autor (no el verificador oficial de BFCL), una sola semilla, BFCL en modo solo informe:

| Conjunto | 0.5B | 1.5B | 3B |
|---|---|---|---|
| BFCL simple, exact match | 79,3 | 83,7 | 89,7 |
| BFCL irrelevance, abstención correcta | 75,8 | 84,2 | 87,1 |
| BFCL live simple / live irrelevance | 44,6 / 71,7 | 56,6 / 77,0 | 66,3 / 77,0 |
| xLAM / Hermes / ToolACE exact (tests sin fuga) | 68,0 / 48,0 / 44,3 | 71,7 / 53,3 / 49,0 | 77,3 / 59,3 / 53,7 |
| Herramientas no coincidentes, abstención | 99,7 | 99,7 | 100 |
| Agente sobre MCP, 49 consultas, 10 herramientas: éxito de llamada | 80,6% | 93,5% | 93,5% |

Comparación con el modelo base (Qwen2.5-3B-Instruct sin ajustar, mismo prompt y scorer):

| Conjunto | Base 3B → v6 |
|---|---|
| BFCL simple, exact | 90,7 → 89,7 |
| BFCL live simple, exact | 59,3 → 66,3 |
| BFCL irrelevance, abstención | 79,3 → 87,1 |
| BFCL live irrelevance, abstención | 65,3 → 77,0 |
| xLAM, exact | 38,7 → 77,3 |
| Hermes, exact | 41,3 → 59,3 |
| ToolACE, exact | 27,3 → 53,7 |
| Glaive, precisión de decisión | 90,0 → 99,0 |
| Herramientas no coincidentes, abstención | 98,7 → 100,0 |

El autor advierte que las filas del modelo base usan los primeros 150 elementos por conjunto (los del v6 usan hasta 300), por lo que la base es más ruidosa (aproximadamente ±8 puntos). No se pudo repetir la evaluación con el mismo tamaño por agotamiento de la cuota de GPU gratuita.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 6,2 GB solo para pesos (3,09 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 8 GB o más.
- VRAM estimada en 4 bits (MLX o cuantización GGUF equivalente): aproximadamente 1,6-2 GB para pesos, viable en GPUs integradas y en Apple Silicon con memoria unificada.
- GPU recomendadas: cualquier GPU con 8 GB o más para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100). Para 4 bits basta con 4 GB.
- Cabe en GPU de consumo: sí, en todas las mencionadas; el entrenamiento del autor se realizó en una T4 gratuita de Kaggle en 169 minutos para la variante 3B.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (el modelo está etiquetado como compatible con endpoints), vLLM, llama.cpp y Ollama mediante conversión a GGUF, y mlx-lm para Apple Silicon con la versión 4-bit incluida.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo documenta tiempos de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siva-0104/qwen2.5-3b-toolcall-abstain-v6 | 3,09B | no disponible | Tool calling con abstención | qwen-research (no comercial) | Hugging Face, fp16 + MLX 4-bit + adaptador |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (según la ficha oficial de Qwen) | Instrucción general | qwen-research | Hugging Face |
| Qwen2.5-1.5B-Instruct (variante del mismo autor) | 1,5B | no disponible | Tool calling con abstención | qwen-research | Hugging Face |
| Qwen2.5-0.5B-Instruct (variante del mismo autor) | 0,5B | no disponible | Tool calling con abstención | qwen-research | Hugging Face |

Frente al modelo base, el ajuste mejora de forma clara en conjuntos de múltiples llamadas y mixtos (xLAM 38,7 → 77,3; ToolACE 27,3 → 53,7) y en abstención (BFCL irrelevance 79,3 → 87,1), mientras que en BFCL simple queda dentro del ruido (90,7 → 89,7). Las variantes de 0,5B y 1,5B del mismo autor ofrecen un compromiso menor en precisión (89,7 y 83,7 en BFCL simple) a cambio de menor huella de memoria.

## Limitaciones y advertencias

- Debilidad ante información faltante: en las pruebas del autor, el modelo de 1,5B inventa un valor en lugar de preguntar en 4 de 6 consultas; el de 3B, en 3 de 6.
- La abstención es imperfecta: BFCL irrelevance se sitúa entre el 76% y el 84% según la variante, y una puerta de similitud añade algunos puntos a costa de llamadas válidas.
- Con bibliotecas de miles de herramientas el recuperador es el cuello de botella: la herramienta correcta aparece en el top-5 solo en el 70% de las consultas con 12.641 herramientas (94% con 100), y el manejo de "ninguna herramienta encaja" cae del 93-100% con 10 herramientas al 15-19% cuando el top-5 procede de la biblioteca completa (muestra de portátil, n=100 por condición). Incluir 100 herramientas en el prompt empeora aún más el resultado (exact match del 6% en 0,5B y del 29% en 1,5B).
- La decodificación restringida por esquema garantiza llamadas válidas sintácticamente, pero no argumentos correctos; además, no se probó en el modelo de 3B por limitaciones de memoria.
- La evaluación de agente es pequeña (49 consultas); diferencias inferiores a unos 10 puntos son ruido.
- Solo inglés; no hay ajuste de seguridad más allá del modelo base, y las salidas de las herramientas deben tratarse como no confiables.
- Licencia Qwen Research: uso restringido a investigación y evaluación, sin uso comercial.
- El modelo se entrenó con truncamiento a 1.024 tokens, por lo que el rendimiento en contextos más largos no está validado.
- Sesgos conocidos: no se documentan análisis específicos de sesgo en la información proporcionada; al heredar del modelo base, arrastra los sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siva-0104/qwen2.5-3b-toolcall-abstain-v6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio con código, evaluación y pipeline de agente: https://github.com/siva-0104/toolcall-slm
- xLAM function-calling 60k (dataset citado por el autor): no disponible enlace directo en la información proporcionada
- Glaive function-calling v2 (dataset citado por el autor): no disponible enlace directo en la información proporcionada
- Hermes function-calling v1 (dataset citado por el autor): no disponible enlace directo en la información proporcionada
- ToolACE (dataset citado por el autor): no disponible enlace directo en la información proporcionada
- Referencias APIGen / xLAM citadas por el autor: no disponible enlace directo en la información proporcionada
