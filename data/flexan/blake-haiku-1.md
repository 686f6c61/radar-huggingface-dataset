# Flexan/Blake-Haiku-1

## Resumen

Blake Haiku 1 es un modelo de lenguaje instructivo de 596 millones de parámetros desarrollado por Flexan, resultado de un fine-tuning con LoRA sobre el modelo base Qwen/Qwen3-0.6B. El objetivo del modelo es generar conversaciones de estilo humano, imitando el formato de mensajes en plataformas de chat tradicionales como Discord, donde cada línea representa un mensaje individual en una conversación.

El modelo fue creado principalmente como prueba de un nuevo entorno de ejecución que permitió a su autor entrenar modelos de mayor tamaño en hardware propio con Windows 11 y CUDA, tras meses de intentos. Por esta razón, el autor advierte explícitamente que el modelo no está diseñado para despliegue en producción, que los datos de entrenamiento fueron mínimos y que no tiene soporte para razonamiento ni tool-calling. La licencia es CC BY-SA 4.0 y soporta únicamente inglés.

A pesar de sus limitaciones, el modelo resulta interesante como caso de estudio de fine-tuning eficiente con LoRA sobre arquitecturas pequeñas de la familia Qwen3, y como demostración de que es posible entrenar modelos de lenguaje en hardware doméstico con Windows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B base) |
| Parametros totales | 596.049.920 |
| Parametros activos | 596.049.920 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen/Qwen3-0.6B, un modelo de 596 millones de parámetros de la serie Qwen3. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base y entrena únicamente matrices de bajo rango, reduciendo significativamente el coste computacional y de memoria. El autor indica que el modelo fue entrenado sin soporte para razonamiento ni tool calling.

El conjunto de datos de entrenamiento es privado y muy reducido: 72 chats con 315 completions, descrito como una versión más pequeña del dataset utilizado para el modelo Blake Sonnet. No se ha publicado información sobre el número de tokens totales, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. El entrenamiento se realizó en hardware propio del autor con Windows 11 y CUDA.

## Capacidades

- Generación de texto conversacional en inglés, con un estilo de chat informal que imita plataformas como Discord.
- Soporta el formato de mensajes ChatML, con tokens de sistema, usuario y asistente.
- El formato de respuesta incluye etiquetas de `thinking` y `response`, aunque siempre aparecen vacías al no estar entrenado con datos de razonamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento ni multi-step reasoning.
- No soporta vision ni audio.
- Capacidad multilingüe limitada: solo inglés.
- El autor recomienda el system prompt "You're Moke, a user chatting with random people on Discord.", aunque el nombre dinámico no está garantizado por el tamaño del modelo y dataset.

## Casos de uso

- **Investigación académica sobre fine-tuning LoRA**: el modelo sirve como caso de estudio para analizar cómo una cantidad mínima de datos de conversación puede alterar el estilo de salida de un modelo base pequeño, sin cambiar sus pesos originales.
- **Pruebas de entorno de entrenamiento**: es útil para verificar que un entorno de entrenamiento con CUDA en Windows funciona correctamente antes de lanzar entrenamientos más grandes y costosos.
- **Experimentación con formatos de chat**: al usar ChatML, permite estudiar cómo el modelo maneja la estructura de conversación multi-turno con mensajes separados por líneas.
- **Generación de texto creativo en inglés**: puede generar respuestas conversacionales en inglés con un tono casual, aunque con calidad limitada por el dataset reducido.
- **Benchmarking de hardware local**: al ser un modelo de solo 0.6B, permite evaluar el rendimiento de GPUs domésticas en tareas de inferencia con pesos safetensors.
- **Enseñanza de arquitecturas de modelos**: sirve como material didáctico para explicar el proceso de fine-tuning con LoRA sobre un modelo base de código abierto, mostrando los componentes de un modelo instructivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 596 millones de parámetros en fp16, el modelo ocupa aproximadamente 1.2 GB en memoria. Con cuantizaciones de 4 bits o 8 bits, el requisito baja a 0.4-0.8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con llama.cpp o similar si se convierte a GGUF.
- Compatibilidad con GPUs de consumo: sí, el modelo es extremadamente ligero y cabe en cualquier GPU moderna, incluso en integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, o mediante la librería transformers directamente. También se puede convertir a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput estimados: en una GPU moderna (RTX 3090 o superior), la generación de tokens debería ser casi instantánea, con latencia inferior a 10 ms por token. En CPU, la latencia podría ser de 50-100 ms por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Blake Haiku 1 | 596 M | no disponible | CC BY-SA 4.0 | Conversación informal |
| Qwen/Qwen3-0.6B | 596 M | 32k (estimado) | Apache 2.0 | Modelo base general |
| TinyLlama-1.1B | 1.1 B | 4k | Apache 2.0 | Modelo base general |

Blake Haiku 1 es un fine-tuning sobre Qwen3-0.6B, por lo que comparte la misma arquitectura y tamaño que su base. La diferencia principal radica en el ajuste conversacional, aunque con un dataset extremadamente pequeño. Comparado con modelos como TinyLlama-1.1B, Blake Haiku 1 es significativamente más pequeño y está especializado en un solo estilo de conversación, mientras que TinyLlama ofrece capacidades generales de generación de texto. La licencia CC BY-SA 4.0 es más restrictiva que la Apache 2.0 de Qwen3, ya que exige compartir derivados bajo la misma licencia.

## Limitaciones y advertencias

- **No apto para producción**: el autor lo advierte explícitamente en la model card; los datos de entrenamiento son mínimos (72 chats, 315 completions) y el modelo no está pensado para uso real.
- **Sin soporte de razonamiento**: las etiquetas `thinking` y `response` del formato de salida siempre están vacías, por lo que no realiza razonamiento intermedio.
- **Sin tool calling**: no puede integrarse en agentes ni pipelines que requieran llamadas a herramientas.
- **Riesgo de alucinación**: por su pequeño tamaño y dataset reducido, puede generar respuestas incoherentes o inventadas con frecuencia.
- **Solo inglés**: no hay soporte para otros idiomas.
- **Restricciones de licencia**: la licencia CC BY-SA 4.0 es copyleft, por lo que cualquier uso comercial o distribución de derivados debe mantener la misma licencia y atribuir al autor.
- **Formato de salida peculiar**: el modelo genera múltiples líneas como mensajes separados, lo que puede no ser compatible con los formatos de chat estándar de la mayoría de aplicaciones.
- **Nombre dinámico no garantizado**: el autor indica que el system prompt recomendado puede no funcionar correctamente con nombres dinámicos debido al tamaño del modelo y dataset.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Flexan/Blake-Haiku-1)
- [Perfil del autor en HuggingFace](https://huggingface.co/Flexan)
- [Modelo base: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
