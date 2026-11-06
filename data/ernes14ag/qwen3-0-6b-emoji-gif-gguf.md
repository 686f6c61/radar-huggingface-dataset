# Ernes14AG/qwen3-0.6b-emoji-gif-GGUF

## Resumen

Qwen3-0.6B Emoji GIF es un ajuste fino del modelo Qwen3-0.6B orientado a una tarea muy concreta: convertir una frase en español que describe un estado de ánimo o una situación en una o varias URLs de GIF animados (emojis animados de Noto Emoji) que expresan esa emoción. Lo desarrolla el usuario de Hugging Face Ernes14AG y se distribuye en formato GGUF, pensado para ejecutarse con Ollama sin dependencias externas ni claves de API.

El modelo parte de la familia Qwen3 en su variante más pequeña, de aproximadamente 596 millones de parámetros, y ha sido especializado mediante ajuste fino supervisado sobre datos sintéticos en español. La tarea es deliberadamente acotada: el modelo no genera texto libre, sino que devuelve directamente la URL del GIF, con variabilidad entre respuestas para que el resultado no sea siempre el mismo.

Su relevancia es práctica: demuestra cómo un modelo de menos de 1 GB puede resolver una tarea de clasificación emocional y recuperación de recursos con una fiabilidad alta en el formato de salida (100 % de URLs válidas en la evaluación del autor), lo que lo hace útil para integrar respuestas visuales en chats, bots o aplicaciones de mensajería sin infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor publica al menos Q8_0 |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); modelo base en formato original no especificado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-0.6B, un transformer decoder-only denso de la familia Qwen3. No se especifican en la información disponible detalles sobre la composición del dataset de ajuste fino más allá de que son datos sintéticos en español, ni el número de tokens de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la longitud de contexto del modelo base en esta ficha.

La innovación principal no es arquitectónica sino de especialización: el ajuste fino enseña al modelo a mapear 46 emociones y situaciones a un catálogo cerrado de 151 GIFs distintos (definidos en `catalogo.json`), devolviendo URLs de los servidores de Google (fonts.gstatic.com). El autor reporta que el modelo base producía un 100 % de URLs inventadas, mientras que el modelo ajustado alcanza un 100 % de URLs válidas, lo que indica que el entrenamiento consiguió anclar la generación a un conjunto cerrado de recursos reales.

## Capacidades

- Generación de URLs de GIF animados a partir de descripciones de emociones o situaciones en español.
- Clasificación implícita de emoción entre 46 categorías predefinidas.
- Variabilidad controlada: distintas respuestas para la misma entrada (media de 1,7 GIFs distintos en 5 respuestas según el autor).
- Respuesta directa sin texto adicional cuando se usa con `--think=false` en Ollama.
- Soporte de conversación multi-turno (tag `conversational`), aunque la tarea está acotada a la emisión de URLs.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido más allá del modo thinking heredado de Qwen3 (que el autor recomienda desactivar).

## Casos de uso

- Integración en bots de mensajería (Slack, Teams, WhatsApp): el modelo devuelve una URL que se puede incrustar directamente en el mensaje para añadir una respuesta visual al estado de ánimo del usuario, sin necesidad de APIs externas de GIFs.
- Atención al cliente con componente emocional: detectar el tono del usuario y responder con un emoji animado adecuado, útil en flujos de soporte donde se quiere humanizar la interacción sin un modelo grande.
- Aplicaciones de diario emocional o bienestar: el usuario escribe cómo se siente y la app muestra un GIF representativo, con la ventaja de que el modelo corre localmente y los datos no salen del dispositivo.
- Prototipado rápido de interfaces conversacionales: al ser un GGUF de 0,6 GB, se puede desplegar en portátiles o entornos con recursos limitados para validar ideas de producto antes de invertir en modelos mayores.
- Generación de respuestas visuales en asistentes de chat internos: añadir reacciones animadas a mensajes de equipo en herramientas corporativas, con la licencia Apache 2.0 permitiendo uso comercial.
- Demostración educativa de ajuste fino: sirve como ejemplo de cómo especializar un modelo pequeño para una tarea de mapeo cerrado y medir la fiabilidad del formato de salida.
- Filtrado y enriquecimiento de contenido: clasificar textos cortos por emoción y asociarles un recurso visual para moderación o etiquetado semiautomático.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 235 mensajes con frases no vistas durante el entrenamiento:

| Métrica | Modelo base | Modelo ajustado |
|---|---|---|
| URLs válidas (temperatura 1) | 0 % | 100 % |
| Emoción correcta (temperatura 1) | 0 % | 58 % |
| URLs inventadas (temperatura 1) | 100 % | 0 % |
| GIFs distintos en 5 respuestas (media) | 0,0 | 1,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantización Q8_0 (el repo completo ocupa 0,6 GB); en Q4 sería aún menor.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Despliegue recomendado: Ollama, con el comando `ollama run hf.co/Ernes14AG/qwen3-0.6b-emoji-gif-GGUF:Q8_0 --think=false "..."`.
- También compatible con llama.cpp y otros runners que acepten GGUF; no se documenta soporte específico para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia muy baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B Emoji GIF (este) | 596 M | no disponible | Texto a URL de GIF emocional | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-0.6B (base) | 596 M | no disponible en esta ficha | Generación de texto general | Apache 2.0 | Hugging Face |
| Modelos de clasificación emocional (p. ej. RoBERTa en español) | 100-500 M | 512 tokens típicamente | Clasificación de emociones | variable | Hugging Face |

La comparación directa con alternativas especializadas en la misma tarea (texto a GIF) no está disponible en la información proporcionada. Frente al Qwen3-0.6B base, la diferencia clave es la fiabilidad del formato de salida (100 % de URLs válidas frente a 0 %), a costa de perder capacidad de generación de texto libre.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea; no es adecuado para generación de texto general, código ni razonamiento.
- La precisión emocional es del 58 % según la evaluación del autor, por lo que aproximadamente 4 de cada 10 respuestas pueden asociar un GIF que no corresponde exactamente a la emoción.
- Solo soporta español; no se ha entrenado ni evaluado en otros idiomas.
- Depende de URLs externas de Google (fonts.gstatic.com); si esos recursos cambian o desaparecen, el modelo devolverá enlaces no funcionales.
- El catálogo está limitado a 46 emociones y 151 GIFs, lo que restringe la expresividad a ese conjunto cerrado.
- Riesgo de alucinación reducido en el formato de URL (0 % de URLs inventadas en la evaluación), pero no se garantiza en entradas fuera de distribución.
- Los datos de entrenamiento son sintéticos y no se documenta ningún proceso de mitigación de sesgos; pueden existir sesgos en la asociación emoción-GIF.
- La licencia Apache 2.0 permite uso comercial, pero la atribución de los emojis animados de Noto Emoji (CC BY 4.0) debe mantenerse.
- No se especifican la longitud de contexto ni el comportamiento en conversaciones largas; el uso previsto son entradas cortas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ernes14AG/qwen3-0.6b-emoji-gif-GGUF
- Modelo base (ajuste fino): https://huggingface.co/Ernes14AG/qwen3-0.6b-emoji-gif
- Noto Emoji Animation (Google, CC BY 4.0): https://googlefonts.github.io/noto-emoji-animation/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Familia Qwen3: no se proporciona enlace específico en la información disponible.
