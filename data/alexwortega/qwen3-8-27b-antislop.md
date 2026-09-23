# AlexWortega/Qwen3.8-27B-antislop

## Resumen

Qwen3.8-27B-antislop es un ajuste fino del modelo Qwen/Qwen3.8-27B (27.356.728.560 parámetros) publicado por AlexWortega bajo licencia Apache 2.0. El objetivo del modelo no es mejorar capacidades de razonamiento o código, sino cambiar el registro de salida: responde en párrafos planos, sin encabezados, listas, negritas ni emojis, sin fórmulas de relleno y con un estilo que imita el habla humana. Se entrenó mediante destilación de prompts: se extrajeron direcciones de activación («format» y «prose») de las capas 29-36 y 48-53 del propio modelo base con EasySteer, se usaron para guiar a un profesor (el modelo base más las reglas del proyecto no-ai-slop) que generó 2.290 respuestas, y con las 2.266 respuestas válidas se entrenó un LoRA de rango 32 sobre todas las capas lineales del modelo de lenguaje (0,79 % de los parámetros), posteriormente fusionado en bf16.

El resultado es un reemplazo directo («drop-in») del modelo base: misma arquitectura Qwen3_5ForConditionalGeneration, mismo tokenizador y misma plantilla de chat, sin necesidad de system prompt. Según la model card, en 44 preguntas retenidas (inglés y ruso, temperatura 0,7) las marcas de markdown por respuesta pasan de 54 a 0 en inglés y de 45 a 0 en ruso, y el léxico típico de chatbot baja de 9,7-11,5 a 1,7 ocurrencias por cada 1.000 palabras.

Es relevante ahora porque ataca un problema poco cubierto por los ajustes habituales: el sesgo de formato de los modelos alineados con instrucciones. Frente a la edición directa de pesos (abliteration), que los autores probaron sin éxito, el enfoque de destilación con direcciones de activación sí funciona porque la señal de formato es un desplazamiento residual constante y no un componente variable. El repositorio acaba de publicarse (0 descargas y 0 likes en el momento de la consulta) y no se han publicado benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer; la model card menciona una torre de visión que no fue modificada) |
| Parámetros totales | 27.356.728.560 (27,36 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se documentan; pesos publicados en bf16 (el autor no lista GGUF ni cuantizaciones de terceros) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |
| Modelo base | Qwen/Qwen3.8-27B |
| Método de ajuste | destilación de prompts + LoRA r=32 (0,79 % de parámetros), 2 épocas, lr 1e-4, pérdida solo en tokens de asistente, sin system prompt en la entrada |
| Tamaño del repositorio | 54,7 GB |
| Fecha de publicación | 23 de septiembre de 2026 (según los metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, Qwen3_5ForConditionalGeneration, con la torre de visión intacta y sin cambios en tokenizador ni plantilla de chat. El entrenamiento se hizo en tres fases. Primero se extrajeron direcciones de guiado («steering directions») de las activaciones del propio Qwen3.8-27B mediante diferencias de medias por capa capturadas con EasySteer: una dirección de formato (respuestas por defecto en markdown frente a las respuestas en prosa del propio modelo a las mismas preguntas, capas 29-36) y una dirección de prosa (ficción de Qwen frente a pasajes del Project Gutenberg a partir del mismo brief, capas 48-53). Los controles con direcciones aleatorias no produjeron cambios, lo que indica que la señal efectiva es la dirección y no la magnitud de la perturbación.

En segundo lugar se construyó un profesor combinando el modelo base con esas direcciones restadas en tiempo de decodificación (hook de sglang) y las reglas del proyecto no-ai-slop como system prompt. Ese profesor respondió 2.290 prompts: 1.400 preguntas tipo ELI5 de Reddit, 700 preguntas de Яндекс.Кью, 150 briefs de ficción y 40 tareas genéricas; 2.266 respuestas pasaron los filtros (sin markdown, sin bucles, finalizadas). Por último, se entrenó un LoRA de rango 32 sobre todas las capas lineales del modelo de lenguaje durante 2 épocas con lr 1e-4, calculando la pérdida únicamente sobre los tokens del asistente y sin system prompt en la entrada, y se fusionó el adaptador en bf16. Los autores intentaron antes una edición directa de pesos (abliteration) y no funcionó para esta característica, porque la señal de formato es un desplazamiento residual constante y no un componente variable.

## Capacidades

- Generación de texto en inglés y ruso con registro conversacional y prosa plana (sin encabezados, listas, negritas ni emojis por defecto).
- Respuestas breves y concretas: unas 96 palabras en inglés y 71 en ruso de media en las 44 preguntas de evaluación, frente a 439 y 344 del modelo base.
- Adaptación al registro del usuario («matches the user's register») según la model card.
- Salida con formato cuando se solicita explícitamente: el estilo entrenado es un hábito, no una regla dura, por lo que una petición de tabla o lista sigue produciendo una tabla o una lista.
- Escritura creativa y de ficción: parte del entrenamiento usó 150 briefs de ficción, y la dirección de prosa se derivó de pasajes del Project Gutenberg.
- Funcionamiento sin system prompt: no necesita instrucciones de sistema para mantener el estilo.
- Compatibilidad directa con sglang, vLLM y transformers (misma arquitectura, tokenizador y plantilla de chat).
- Capacidades multimodales: la torre de visión está intacta, pero el uso multimodal no fue evaluado.
- Tool calling / function calling, agentes, razonamiento multi-paso, matemáticas y código: no evaluados; la model card advierte explícitamente de que su comportamiento puede haberse desplazado respecto al modelo base.
- Modo de pensamiento («thinking»): no se usó en el entrenamiento (enable_thinking=False).

## Casos de uso

- Asistentes conversacionales integrados en producto: al responder en prosa y sin markdown, la salida es adecuada para interfaces de chat que renderizan texto plano o que se convierten a voz (TTS), donde los encabezados y asteriscos resultan molestos.
- Atención al cliente en inglés y ruso: gestiona conversaciones multi-turno con respuestas cortas y directas, sin el preámbulo típico de chatbot ni listas numeradas, lo que reduce la longitud de la respuesta y el coste de generación.
- Contenido editorial y blogs de estilo humano: para redactar borradores con párrafos naturales sin postprocesar la salida para eliminar negritas, encabezados o viñetas.
- Escritura creativa y narrativa: el ajuste incluye 150 briefs de ficción y una dirección de prosa derivada de textos literarios, lo que lo hace utilizable para relatos y diálogo en inglés y ruso.
- Generación de datos sintéticos de estilo: puede emplearse como generador de respuestas «humanas» para construir conjuntos de datos de destilación de estilo o para entrenar clasificadores que distingan texto humano de texto de chatbot.
- Q&A de foro y comunidades: los datos de entrenamiento provienen de preguntas ELI5 de Reddit y de Яндекс.Кью, por lo que el modelo está ajustado al formato de pregunta-respuesta de foro, sin listas ni formato.
- Sustitución directa en infraestructura existente: al compartir arquitectura, tokenizador y plantilla de chat con Qwen3.8-27B, se puede desplegar en un servicio sglang o vLLM ya configurado cambiando únicamente la ruta del modelo.
- Módulos de texto dentro de agentes donde el formato markdown rompe el consumidor posterior (por ejemplo, un campo de texto libre que alimenta a otro sistema o a una base de datos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye la siguiente evaluación de estilo sobre 44 preguntas retenidas (inglés y ruso, temperatura 0,7), donde las «marcas de markdown» son encabezados más elementos de lista más pares de negritas por respuesta:

| Métrica (44 preguntas retenidas, temperatura 0,7) | Qwen3.8-27B | Qwen3.8-27B-antislop |
|---|---:|---:|
| Marcas de markdown en inglés | 54 | 0 |
| Bucles en inglés | 0 % | 0 % |
| Palabras por respuesta en inglés | 439 | 96 |
| Marcas de markdown en ruso | 45 | 0 |
| Bucles en ruso | 0 % | 0 % |
| Palabras por respuesta en ruso | 344 | 71 |
| Léxico de «slop» por 1.000 palabras | 9,7–11,5 | 1,7 |

Latencia, throughput y resultados de tareas de razonamiento o código: no disponibles.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan aproximadamente 54,7 GB, a los que hay que sumar caché KV y activaciones; el presupuesto realista de inferencia se sitúa en torno a 64-80 GB según la longitud de contexto (dato de contexto no disponible, por lo que la estimación es conservadora).
- GPU recomendadas en bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes con paralelismo tensorial.
- Con cuantización de 8 bits: unos 28-30 GB de pesos, por lo que cabe en A100 40 GB, RTX 6000 Ada 48 GB o L40S 48 GB.
- Con cuantización de 4 bits: unos 14-18 GB de pesos, lo que permite ejecutarlo en GPUs de consumo como RTX 4090, RTX 3090 o RTX 5090 (24-32 GB). En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue confirmadas por el autor: sglang, vLLM y transformers, sin cambios de arquitectura, tokenizador ni plantilla de chat.
- llama.cpp, Ollama y TGI: no mencionados por el autor; requerirían conversión a GGUF o configuración específica, y no hay confirmación de que existan pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar de forma documentada con el modelo base del que deriva. Los datos de estilo proceden de la model card; el resto de campos marcados como no disponibles no aparecen en el dossier.

| Modelo | Parámetros | Contexto | Licencia | Estilo de salida | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-antislop | 27,36 mil millones | no disponible | Apache 2.0 | Prosa plana, sin markdown, respuestas de ~96 palabras (EN) | Safetensors bf16, 54,7 GB, 0 descargas |
| Qwen3.8-27B (base) | 27,36 mil millones (misma base) | no disponible | Apache 2.0 | Markdown por defecto, respuestas de ~439 palabras (EN) | Safetensors bf16 |
| Otras alternativas de la misma franja (~27-32 mil millones) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros dentro de la información proporcionada, por lo que no se incluye una comparativa cuantitativa con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Las respuestas son cortas, aproximadamente una cuarta parte de la longitud de las del modelo base; si se necesita detalle hay que pedirlo explícitamente.
- El formato plano es un hábito aprendido, no una regla dura: si se solicita una tabla o una lista, el modelo las genera.
- El entrenamiento se hizo solo con prompts de pregunta-respuesta y de ficción; el comportamiento en código, matemáticas y uso de herramientas no fue evaluado y puede haberse desplazado respecto al modelo base.
- El uso multimodal no fue evaluado aunque la torre de visión esté intacta.
- El modo de pensamiento no se utilizó en el entrenamiento (enable_thinking=False), por lo que su activación podría degradar el estilo aprendido.
- Solo se declaran inglés y ruso; no hay evidencia de comportamiento en otras lenguas.
- No hay resultados de benchmarks estándar publicados, por lo que no se puede verificar que las capacidades del modelo base se mantengan.
- El repositorio tiene 0 descargas y 0 likes: no existe validación independiente de la comunidad.
- Riesgo de alucinación: no se ha evaluado ni medido; el modelo hereda el comportamiento del modelo base y no se han publicado pruebas de veracidad.
- Sesgos: los datos de destilación provienen de preguntas ELI5 de Reddit y de Яндекс.Кью, con los sesgos propios de esas comunidades; no se documenta ningún análisis de sesgo.
- Licencia Apache 2.0, por lo que el uso comercial está permitido, pero el autor no ofrece garantías y las condiciones del modelo base deben respetarse.
- Para producción, tener en cuenta que el cambio de estilo afecta a la longitud de salida (menos tokens generados), lo que altera las estimaciones de coste y de latencia respecto al modelo base.
- El pipeline de entrenamiento se documenta en el repositorio `capability-vectors/sep/antislop` (pasos `06_distill_data.py` y `07_lora_train.py`), sin URL pública confirmada en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Reglas de estilo no-ai-slop usadas para construir el profesor: https://github.com/petergyang/no-ai-slop
- Pipeline de extracción de direcciones, barridos y destilación: repositorio `capability-vectors/sep/antislop`, pasos `06_distill_data.py` y `07_lora_train.py` (sin URL proporcionada)
- EasySteer (captura de activaciones): herramienta mencionada en la model card, sin URL proporcionada
