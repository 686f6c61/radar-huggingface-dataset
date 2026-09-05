# Sapolas0730/japanese-gpt2-medium-formal-lora

## Resumen

El modelo `japanese-gpt2-medium-formal-lora` es un adaptador LoRA desarrollado por Sapolas0730 que se basa en el modelo japonés `rinna/japanese-gpt2-medium` (arquitectura GPT-2, 336M parámetros). Su propósito es transformar texto japonés informal en japonés formal mediante instrucciones. El adaptador añade aproximadamente 2,16 millones de parámetros entrenables, lo que representa solo el 0,64% del total del modelo base, y se publica como un adaptador PEFT en formato safetensors.

Este modelo es relevante porque demuestra una técnica de ajuste fino eficiente y ligera: en lugar de realizar un fine-tuning completo, se entrena únicamente un adaptador LoRA sobre un modelo congelado. Esto reduce el coste computacional y de memoria durante el entrenamiento (pico de 3,17GB frente a 6,84GB del fine-tuning completo) y facilita su despliegue. El adaptador fue entrenado con 1.000 ejemplos sintéticos generados mediante la metodología MAGPIE usando el modelo `Qwen/Qwen2.5-7B-Instruct`, y filtrados por criterios de pureza del japonés, formato, proporción de longitud, preservación de preguntas y duplicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) con adaptador LoRA |
| Parámetros totales | 338,16M (336M base + 2,16M adaptador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base `rinna/japanese-gpt2-medium`, que está congelado durante el entrenamiento. La configuración LoRA utilizada es r=8, alpha=16, dropout=0.05, y las capas objetivo son `c_attn` y `c_proj` (las capas Conv1D de GPT-2). Esto resulta en 2.162.688 parámetros entrenables, es decir, el 0,64% del total.

Los datos de entrenamiento consisten en 1.000 ejemplos sintéticos generados con la técnica MAGPIE (arXiv:2406.08464) utilizando `Qwen/Qwen2.5-7B-Instruct`. Después de la generación, se aplicaron filtros para garantizar la pureza del japonés, el formato de las respuestas, la proporción de longitud entre instrucción y respuesta, la preservación de preguntas y la eliminación de duplicados. El entrenamiento se realizó con una tasa de aprendizaje de 1e-4, tamaño de lote 4 y acumulación de gradientes 4 (lote efectivo 16). Se reservó un 10% de los datos como validación y se configuró early stopping con patience=3, aunque no llegó a activarse. La época seleccionada fue la 14.0, con una pérdida de validación (eval_loss) de 1.112, ligeramente superior a la versión de fine-tuning completo (1.021). El pico de memoria GPU fue de 3,17GB.

## Capacidades

- Transformación de estilo: convierte frases japonesas informales en formales siguiendo instrucciones en formato de prompt.
- Generación de texto condicionada por instrucciones: utiliza una plantilla de prompt con `### 指示:` y `### 応答:` para guiar la salida.
- No soporta tool calling, ni visión, ni audio, ni agentes.
- Solo soporta el idioma japonés (ja).

## Casos de uso

- Atención al cliente en japonés: el modelo puede transformar mensajes informales de clientes en respuestas formales para agentes de soporte, mejorando la comunicación empresarial y el tono profesional.
- Redacción de correos electrónicos formales: un usuario escribe un borrador informal y el modelo lo convierte en un texto formal adecuado para comunicaciones laborales o corporativas.
- Normalización de datos de redes sociales: antes de entrenar otros modelos de NLP, se puede usar este adaptador para convertir publicaciones informales de Twitter o foros en japonés formal, facilitando tareas como análisis de sentimiento o clasificación.
- Asistente de escritura para documentos administrativos: transforma notas internas informales en lenguaje formal para informes, presentaciones o comunicados oficiales.
- Traducción de tono en aplicaciones de mensajería: en entornos empresariales, convierte mensajes de chat informales en lenguaje formal para su uso en canales oficiales o documentación.
- Educación de idiomas: ayuda a estudiantes de japonés a practicar la conversión de frases casuales a formales, proporcionando ejemplos corregidos y explicando el registro adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta una pérdida de validación (eval_loss) de 1.112 en la época 14.0, frente a 1.021 de la versión full-FT. No se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El pico de VRAM durante el entrenamiento fue de 3,17GB, por lo que la inferencia debería requerir menos.
- GPU recomendadas: no disponible. Dado que el modelo base tiene 336M parámetros, es compatible con GPUs de consumo.
- Opciones de despliegue: compatible con Transformers y PEFT mediante `AutoPeftModelForCausalLM`. No se documentan otros servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | eval_loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| japanese-gpt2-medium-formal-lora | 338,16M (base + LoRA) | No disponible | 1.112 | MIT | HuggingFace |
| japanese-gpt2-medium-formal-fullft | 338M (full-FT) | No disponible | 1.021 | MIT | HuggingFace |
| rinna/japanese-gpt2-medium | 336M | No disponible | No disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- Datos de entrenamiento limitados a 1.000 ejemplos sintéticos, lo que no cubre la diversidad del japonés real en producción.
- Pérdida de validación ligeramente superior a la versión de fine-tuning completo, lo que puede indicar una calidad ligeramente inferior.
- Con decodificación greedy, tiende a repetir frases; se recomienda usar `repetition_penalty` y `no_repeat_ngram_size`.
- Solo soporta japonés, sin capacidades multilingües.
- No soporta tool calling, visión, audio ni agentes.
- Es un adaptador LoRA, por lo que requiere cargar el modelo base `rinna/japanese-gpt2-medium` para funcionar.

## Enlaces

- HuggingFace: https://huggingface.co/Sapolas0730/japanese-gpt2-medium-formal-lora
- Modelo full-FT: https://huggingface.co/Sapolas0730/japanese-gpt2-medium-formal-fullft
- Artículo de comparación (Zenn): https://zenn.dev/sapolas/articles/0175b65f1e5b8c
- Paper de MAGPIE: https://arxiv.org/abs/2406.08464
- Modelo base: https://huggingface.co/rinna/japanese-gpt2-medium
