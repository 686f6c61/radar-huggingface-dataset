# eifirt/Lunkara

## Resumen

Lunkara es un modelo de lenguaje causal afinado por el usuario eifirt a partir de Meta-Llama-3-8B. Se distribuye en Hugging Face bajo la licencia Llama 3 Community y está etiquetado para generación de texto, código, clima y química, aunque la model card solo documenta uso general de generación e instrucciones en inglés. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una publicación de carácter experimental y sin tracción comunitaria.

El modelo se presenta como un fine-tune de Llama 3 con datos de instrucciones (OpenHermes-2.5 y FineTome-100k-dedup). La model card incluye además ejemplos de entrenamiento con un formato propietario denominado "Continuity Method", que fuerza al asistente a mantener un ancla temática y una marco metafórico a lo largo de la conversación, redirigiendo al usuario cuando se desvía. Este comportamiento sugiere un ajuste orientado a la persistencia de contexto instruccional más que a capacidades nuevas.

La relevancia es limitada: no hay benchmarks publicados, no hay información sobre el proceso de entrenamiento (número de tokens, hiperparámetros, método de alineación) y el autor no documenta evaluación alguna. Es un modelo que debe tratarse como artefacto de investigación personal, no como base para producción sin una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8 mil millones (heredados de Meta-Llama-3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 soporta 8.192 tokens; el fine-tune no documenta cambios) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados en el repositorio) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3 Community License Agreement |
| Formato de pesos | safetensors (formato estándar de transformers; no se detalla en la model card) |

## Arquitectura y entrenamiento

La arquitectura es la de Meta-Llama-3-8B: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU, con 8.192 tokens de contexto nativo. El fine-tune no modifica la arquitectura; solo ajusta los pesos sobre el modelo base.

No se documenta el proceso de entrenamiento: ni el número de tokens, ni la composición exacta del dataset, ni si hubo RLHF, DPO o SFT supervisado. Los únicos indicios son los datasets declarados (teknium/OpenHermes-2.5 y mlabonne/FineTome-100k-dedup) y los ejemplos de la model card, que muestran un formato de system prompt con "Continuity Method", "Primary Anchor" y "Metaphorical Frame". Esto apunta a un SFT sobre conversaciones sintéticas diseñadas para forzar coherencia temática, pero no hay confirmación técnica. No se menciona ninguna innovación en decodificación, atención lineal ni técnicas de eficiencia.

## Capacidades

- Generación de texto causal en inglés con formato conversacional e instrucciones.
- Seguimiento de instrucciones de sistema con un formato propietario de "anclas" temáticas (Continuity Method).
- Redirección controlada cuando el usuario se desvía del tema ancla, con mensajes de "coherence drift detected" y resumen determinista del intento.
- Etiquetado por el autor para código, clima y química, aunque sin evidencia documentada de rendimiento en estas áreas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- **Asistentes con persistencia temática**: el formato Continuity Method permite construir tutores o asistentes que mantengan un hilo conductor (por ejemplo, un plan de estudios) y redirijan al usuario cuando divague. Adecuado por el SFT específico, aunque requiere validar que el comportamiento se mantenga fuera de los ejemplos de la model card.
- **Prototipado de chatbots conversacionales en inglés**: al ser un fine-tune de Llama 3 8B, se puede desplegar con transformers y servir como base para pruebas de UX conversacional en entornos de desarrollo, no en producción sin evaluación.
- **Generación de texto asistida en dominios técnicos etiquetados (código, clima, química)**: el autor declara estas etiquetas, pero al no haber benchmarks, solo es razonable usarlo como generador de borradores que un humano revise, nunca como fuente de verdad.
- **Investigación sobre formatos de system prompt**: útil para estudiar cómo un SFT con instrucciones de anclaje afecta la deriva conversacional en modelos de 8B, comparándolo con el Llama 3 base.
- **Generación de documentación técnica en inglés**: con contexto de 8K tokens (heredado del base) puede resumir o redactar secciones de documentación, siempre con revisión humana por el riesgo de alucinación.
- **Base para nuevos fine-tunes experimentales**: al estar publicado con licencia Llama 3, se puede usar como punto de partida para ajustes posteriores en inglés, respetando los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB para los 8B parámetros más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: alrededor de 8-9 GB; en 4-bit: alrededor de 5-6 GB (estimaciones estándar para un modelo de 8B, no verificadas para este fine-tune concreto).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8-bit.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con contexto limitado, y en RTX 3060 12 GB o superior si se cuantiza a 4-bit (requiere generar los pesos cuantizados, no publicados).
- Opciones de despliegue: transformers (documentado en la model card); vLLM, TGI, llama.cpp u Ollama son viables en teoría para un Llama 3 8B, pero no hay pesos GGUF publicados ni configuración documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eifirt/Lunkara | 8B | no disponible (base 8.192) | Llama 3 Community | Hugging Face, 0 descargas | Fine-tune experimental sin benchmarks |
| meta-llama/Meta-Llama-3-8B | 8B | 8.192 | Llama 3 Community | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |
| teknium/OpenHermes-2.5-Mistral-7B | 7B | 32.768 | Apache 2.0 | Hugging Face | Fine-tune de instrucciones con benchmarks comunitarios |

La comparativa es aproximada: Lunkara no publica métricas, por lo que no se puede afirmar superioridad ni equivalencia con ninguna de las alternativas.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación documentada: no hay evidencia de que supere al Llama 3 base en ninguna tarea.
- Riesgo de alucinación explícitamente reconocido por el autor en la model card.
- El formato Continuity Method puede producir respuestas rígidas o repetitivas que ignoran peticiones legítimas del usuario cuando este cambia de tema.
- Solo inglés documentado; no hay soporte multilingüe verificado.
- Contexto no documentado para el fine-tune; se asume el del base (8.192 tokens) pero no está confirmado.
- Licencia Llama 3 Community: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar antes de cualquier despliegue comercial.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria, sin issues resueltos, sin mantenimiento demostrado.
- Los ejemplos de la model card mezclan código de subida de carpetas (`api.upload_folder`) con datos de entrenamiento, lo que indica una model card poco cuidada y posibles errores en la documentación.
- No hay pesos cuantizados publicados, lo que complica el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/eifirt/Lunkara
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Dataset OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Dataset FineTome-100k-dedup: https://huggingface.co/datasets/mlabonne/FineTome-100k-dedup
- Licencia Llama 3: https://llama.meta.com/llama3/license/
