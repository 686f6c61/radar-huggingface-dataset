# AstroTernary/Nogueira-0.0.3

## Resumen

Nogueira 0.0.3 es un modelo de lenguaje de investigación desarrollado por AstroTernary dentro del proyecto abierto "cansei-de-esperar". Se trata de un decoder tipo Llama de apenas ~25,2 millones de parámetros entrenado íntegramente en portugués con pesos ternarios {-1, 0, +1} desde el primer paso del entrenamiento, siguiendo el paradigma BitNet b1.58. El objetivo del proyecto no es competir en conocimiento general, sino demostrar que un modelo minúsculo y ternario puede mantener conversaciones coherentes, recordar datos aportados por el usuario y usar herramientas de forma fiable.

Esta versión 0.0.3 se centra explícitamente en "conversar de verdad": saludar, recordar lo que el usuario ha dicho y corregir al usuario cuando se equivoca, en lugar de llevarle la contraria por defecto. Incorpora un tokenizador BPE de 4.096 tokens con tokens especiales para system, tool_call y tool_result, y amplía el contexto de 512 a 2.048 tokens respecto a la versión anterior.

El modelo es relevante como pieza de investigación sobre cuantización ternaria extrema y sobre cómo un modelo de ~6,3 MB en 2 bits puede resolver tareas conversacionales acotadas con un entrenamiento cuidadosamente diseñado (SFT con datos sintéticos verificables y un modelo profesor abierto). No está pensado para producción general ni para conocimiento del mundo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama con BitNet b1.58 (pesos ternarios), FFN ReLU², RMSNorm, RoPE, Canon layers, QK-norm, zero-init, embedding amarrado |
| Parámetros totales | ~25,2 M (25.2M ternarios, ~6,3 MB en 2 bits) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | Ternaria {-1, 0, +1} con escala por matriz (W = q × scale); pesos latentes FP32 disponibles para continuar entrenamiento |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (`chat_ternary.safetensors` int8 ternario + scale; `chat_latent_fp32.safetensors` FP32) |

Dimensiones internas: d_model 512, 8 capas, 8 cabezas de atención, vocabulario de 4.099 tokens (BPE 4.096 + 3 especiales).

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo Llama con atención multi-cabeza estándar, pero con los pesos de las matrices lineal y de proyección cuantizados a valores ternarios desde la inicialización, usando el estimador straight-through (STE) para propagar gradientes a través de la cuantización durante el entrenamiento en fp16. Incorpora varias innovaciones de estabilidad y eficiencia: RMSNorm, RoPE, QK-norm, inicialización a cero de determinadas proyecciones (zero-init), Canon layers y embedding amarrado entre entrada y salida. La exportación ternaria se realiza como `q × scale / mean(|q|)`, con una escala por matriz.

El entrenamiento se ejecutó en Kaggle con 2× T4 en fp16 más la ruta ternaria vía STE. Esta versión continúa desde el checkpoint de la sprint 004b (0.0.2 + razonamiento) y añade +60 M tokens (40 % prosa, 60 % conversación) más un SFT ligero de 4 M tokens. Los datos conversacionales incluyen 98 mil conversaciones naturales en portugués generadas por un modelo profesor abierto (Apache 2.0) ejecutado en una GPU de Kaggle, con filtro de fuga de información (nombre del profesor y otras variantes, 90 muestras eliminadas). Se complementan con datos sintéticos verificables v3: calculadora, verificación de cuentas comparando antes de decidir, conversación casual, memoria conversacional (nombre, ciudad, gustos), respuestas "no sé" solo para lo que no puede estar en la conversación, e identidad. El bloque de razonamiento cubre información divergente, corrección ("lo más nuevo vale"), cuentas encadenadas y relaciones.

## Capacidades

- Generación de texto conversacional en portugués con turnos multi-ida y vuelta.
- Memoria conversacional a corto plazo dentro de la ventana de 2.048 tokens (recuerda nombre, ciudad y preferencias declaradas por el usuario).
- Uso de herramienta de calculadora mediante tokens especiales `<|tool_call|>` y `<|tool_result|>`, con verificación aritmética antes de responder.
- Corrección del usuario cuando este afirma un resultado erróneo (por ejemplo, detecta que 37×12 no es 450).
- Concordancia con el usuario cuando este tiene razón (mejora de 3 % a 97 % respecto a 0.0.2).
- Respuesta "no sé" ante preguntas imposibles o fuera de la conversación.
- Razonamiento básico: información divergente, corrección con criterio temporal, cuentas encadenadas y relaciones simples.
- Identidad propia del modelo y gestión de saludos.
- Sin capacidades de visión, audio ni tool calling genérico más allá de la calculadora integrada.

## Casos de uso

- Asistente conversacional de dominio acotado en portugués: el modelo puede gestionar diálogos multi-turno de temática limitada (por ejemplo, atención básica o acompañamiento) apoyándose en su memoria conversacional dentro de la ventana de 2.048 tokens y en su capacidad de mantener el hilo de lo dicho.
- Verificación aritmética en flujos de chat: integrado con la calculadora vía tool_call, sirve para comprobar cuentas introducidas por el usuario y señalar discrepancias, un escenario validado con el 97 % de acierto en llamada y respuesta de herramienta.
- Investigación sobre cuantización ternaria: el par de checkpoints (ternario y latente FP32) permite reproducir el pipeline STE y estudiar la degradación entre pesos latentes y ternarios en un modelo de ~25 M de parámetros.
- Docencia y divulgación de BitNet b1.58: el modelo cabe en 6,3 MB en 2 bits y se ejecuta en CPU, lo que lo hace útil para demostraciones en vivo de inferencia ternaria sin GPU.
- Prototipado de sistemas con memoria de usuario: sirve como banco de pruebas para diseñar esquemas de memoria conversacional (nombre, ciudad, gustos) antes de escalar a modelos mayores.
- Evaluación de pipelines de datos sintéticos: los datos verificables v3 (calculadora, corrección, "no sé", identidad) constituyen un conjunto reproducible para medir la calidad de generadores de datos sintéticos en portugués.
- Pruebas de robustez ante corrección: útil para estudiar cómo un modelo pequeño reacciona cuando el usuario afirma algo incorrecto, con métricas publicadas de corrección (77 %) y de concordancia correcta (97 %).

## Benchmarks y rendimiento

Resultados medidos por programa, según la model card del autor:

| Test | 0.0.2 | 0.0.3 | Control sin profesor |
|---|---|---|---|
| Herramienta: llamada / respuesta correcta | 100 % / 100 % | 97 % / 97 % | 95 % / 95 % |
| Concordancia cuando el usuario acierta | 3 % | 97 % | 97 % |
| Corrección cuando el usuario se equivoca | 97 % | 77 % | 70 % |
| "No sé" en preguntas imposibles | 90 % | 80 % | 50 % |
| Rechazo de saludo ("Oi, tudo bem?") | sí | no | no |
| Memoria conversacional (p. ej. "qual é o meu nome?") | 0 % | 100 % | 100 % |
| Pares mínimos: gramática / hechos | 95 % / 85 % | 95 % / 90 % | 95 % / 85 % |
| Razonamiento (divergente, corrección, cuenta, relación) | 3 % | 57,5 % | 55,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la práctica; el checkpoint ternario ocupa ~6,3 MB y los pesos latentes FP32 son del orden de decenas de MB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entrenó en 2× T4 de Kaggle y la inferencia de referencia se ejecuta en CPU.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU sin aceleración.
- Opciones de despliegue: el repositorio incluye `scripts/chat.py` para conversar en terminal en CPU y `bench/model.py` para cargar el modelo con `GPT(vocab=4099, d=512, layers=8, heads=8, T=2048, lin="int8dw", qknorm=True, canon=True, zero_proj=True)`. La exportación ternaria se verifica con `scripts/verify_export.py`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nogueira 0.0.3 | ~25,2 M | 2.048 | Ternaria nativa (BitNet b1.58) | MIT | Hugging Face |
| Nogueira 0.0.2 (mismo proyecto) | ~25 M | 512 | Ternaria nativa | MIT | Hugging Face |
| Modelos de ~25 M en fp16 (genéricos) | ~25 M | variable | FP16/INT8 | variable | variable |

No se dispone en la información proporcionada de comparativas con otros modelos ternarios pequeños de la misma categoría (por ejemplo, variantes BitNet publicadas por otros autores), por lo que la comparación cuantitativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Conocimiento del mundo muy limitado: falla en preguntas de cultura general (fotosíntesis, "frase sobre el mar") y tiende a inventar respuestas.
- Respuestas demasiado cortas en ocasiones, heredadas del estilo del modelo profesor.
- Memoria conversacional parcial: recuerda el nombre, pero a veces afirma "no me lo has dicho" para otros datos que sí se aportaron.
- Razonamiento multi-salto todavía cercano al azar; el autor indica que el canal de lógica que lo resuelve llegará en la versión 0.0.4.
- Solo portugués; no hay soporte multilingüe.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación elevado por el tamaño reducido y la escasez de datos de conocimiento.
- Licencia MIT: permite uso comercial, pero el modelo es de investigación y no está validado para producción.
- El propio autor lo etiqueta como modelo de investigación (~25 M de parámetros) con respuestas sin sentido ocasionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AstroTernary/Nogueira-0.0.3
- Proyecto "cansei-de-esperar": https://github.com/riknog/cansei-de-esperar
- Dataset de entrenamiento citado: https://huggingface.co/datasets/wikimedia/wikipedia
