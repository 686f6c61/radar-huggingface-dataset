# RicardoEstep/RPBizkitRemiX-v1-12B

## Resumen

RPBizkitRemiX-v1-12B es un modelo de generación de texto desarrollado por RicardoEstep, creado mediante una fusión (merge) de seis modelos propios de 12B parámetros utilizando la técnica "Model Stock" (arxiv 2403.19522) implementada con Mergekit. El modelo toma como base RPBizkit-v6-12B y combina de forma equitativa todos los modelos previos del autor, buscando estabilidad y coherencia en la generación.

Se trata de un modelo experimental orientado a la generación de texto libre, con una arquitectura basada en Mistral y un tamaño de 12.247.782.400 parámetros. Aunque declara soporte para un contexto de 131072 tokens, el autor recomienda limitarlo a 8192 tokens debido a restricciones de LLaMA 3. El modelo está diseñado para usarse sin plantilla de chat (chat template), recomendándose el formato Alpaca con entradas "RAW", ya que el uso de plantillas provoca una deriva en el comportamiento.

La relevancia de este modelo radica en su enfoque de fusión experimental, que combina múltiples iteraciones de un mismo autor para obtener un comportamiento estable. Sin embargo, al ser un proyecto personal con cero descargas y sin documentación adicional, su utilidad práctica es limitada y debe considerarse como una prueba de concepto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Mistral (no se especifica variante exacta) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131072 tokens (recomendado 8192) |
| Tipos de cuantizacion | no disponible (existe versión GGUF en repo separado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (también GGUF en repo complementario) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión mediante la técnica "Model Stock" (arxiv 2403.19522), que combina los pesos de varios modelos base para obtener un modelo promedio con mejor generalización. Se utilizó Mergekit para realizar la fusión, tomando como base RPBizkit-v6-12B y mezclando de forma equitativa los seis modelos listados. El proceso se ejecutó con 32 GB de RAM, lo que sugiere que la fusión se realizó en el espacio de parámetros sin necesidad de GPU.

La arquitectura subyacente es un transformer basado en Mistral, con un tamaño de embedding y tokenizer de 131072 (128K). No se proporcionan detalles sobre el entrenamiento original de los modelos base, ni sobre el dataset utilizado, ni sobre técnicas como RLHF o DPO. Toda la información disponible se limita a la fusión posterior.

## Capacidades

- Generación de texto libre: el modelo está diseñado para producir texto continuo sin necesidad de plantilla de chat, aceptando entradas "RAW".
- Estabilidad en generación: según el autor, el modelo es "bastante estable" en comparación con la versión V6, lo que sugiere un comportamiento coherente en la generación.
- Soporte de contexto largo: declara soporte para 128K tokens, aunque se recomienda no superar 8K por limitaciones de LLaMA 3.
- No se documentan capacidades específicas como tool calling, razonamiento multi-paso, visión o audio. Tampoco se especifican idiomas soportados.

## Casos de uso

No se han documentado casos de uso específicos por parte del autor. Dado el tamaño del modelo (12B) y su naturaleza de generación de texto, se podrían considerar aplicaciones genéricas como:

- Generación de texto creativo: el modelo puede producir narrativas, diálogos o contenido literario, aunque no hay evidencia de su calidad en este ámbito.
- Prototipado de aplicaciones de chat: al ser un modelo de 12B, podría usarse en entornos de desarrollo para probar interacciones conversacionales, siempre que se respete la recomendación de no usar plantillas de chat.
- Experimentación con fusión de modelos: sirve como ejemplo práctico de la técnica Model Stock aplicada a una familia de modelos, útil para investigadores interesados en merges.
- Generación de contenido para juegos de rol: el tag "not-for-all-audiences" sugiere que puede generar contenido para adultos, aunque no se confirma.
- Fine-tuning posterior: al ser un modelo de 12B, podría servir como punto de partida para ajuste fino en tareas específicas, aunque su licencia no está clara.
- Evaluación de estabilidad en generación larga: su contexto teórico de 128K permite probar la coherencia en textos extensos, aunque con la limitación práctica de 8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: para 12,2B parámetros, en FP16 se necesitan aproximadamente 24,5 GB de VRAM (12,2B × 2 bytes). Con cuantización INT8, unos 12,2 GB; con INT4, unos 6,1 GB. Estas son estimaciones teóricas, no datos oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB o más (RTX 3090/4090, A100, etc.). Para cuantización INT4, una GPU de 8 GB podría ser suficiente (RTX 3060, etc.).
- En consumer GPU: sí, con cuantización adecuada (INT4/INT8) puede ejecutarse en GPUs de gama media-alta.
- Opciones de despliegue: al ser un modelo transformers, puede usarse con vLLM, TGI, llama.cpp (gracias a la versión GGUF) u Ollama si se convierte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de 12B. No se conocen modelos de la misma categoría (fusión de 12B basada en Mistral) con datos públicos comparables. Se podría comparar con Mistral-7B o Llama-3-8B, pero no son equivalentes en tamaño ni en enfoque. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es experimental y no ha sido validado externamente (0 descargas, 0 likes).
- No se recomienda el uso de plantillas de chat, ya que el modelo "deriva" (drift) si se aplica alguna. Esto limita su integración en frameworks que añaden plantillas automáticamente.
- El contexto recomendado es de 8192 tokens, a pesar de declarar 128K, lo que reduce su utilidad para tareas de contexto muy largo.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- El tag "not-for-all-audiences" sugiere que el modelo puede generar contenido inapropiado o para adultos, lo que requiere moderación en despliegues públicos.
- No hay información sobre sesgos, alucinaciones o calidad general del texto generado.
- Al ser una fusión de modelos propios, no se conoce la procedencia de los datos de entrenamiento de los modelos base, lo que añade incertidumbre sobre su comportamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RicardoEstep/RPBizkitRemiX-v1-12B)
- [Versión cuantizada GGUF](https://huggingface.co/RicardoEstep/RPBizkitRemiX-v1-12B-GGUF)
- [Paper Model Stock (arxiv 2403.19522)](https://arxiv.org/abs/2403.19522)
- [Repositorio Mergekit](https://github.com/cg123/mergekit)
