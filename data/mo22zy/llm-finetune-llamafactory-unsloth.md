# mo22zy/LLM-fineTune-LLaMAFactory-UnSloth

## Resumen

El modelo `mo22zy/LLM-fineTune-LLaMAFactory-UnSloth` es un adaptador LoRA (PEFT) creado por mo22zy mediante LLaMAFactory y UnSloth sobre el modelo base `unsloth/Qwen2.5-0.5B-Instruct`. Fine-tuneado en un dataset denominado `news_finetune_train`, del que no se ha publicado ninguna descripción, el modelo busca adaptar un modelo de instrucción pequeño a tareas de generación de texto relacionadas con noticias. Al ser un adaptador, no es un modelo autónomo: debe cargarse junto al modelo base para funcionar.

Su relevancia radica en ser un ejemplo de fine-tuning eficiente con herramientas open source sobre un modelo de tan solo 0.5B de parámetros, lo que permite desplegarlo en hardware modesto. Sin embargo, la publicación carece de documentación, benchmarks y análisis de calidad, por lo que su utilidad práctica debe validarse antes de su uso en producción. Hereda la arquitectura transformer decoder-only y la longitud de contexto de 32768 tokens del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0.5B (modelo base) |
| Longitud de contexto | 32768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0.5B parámetros con atención estándar y ventana de contexto de 32768 tokens. Sobre este modelo se aplica un adaptador LoRA utilizando la librería PEFT. El entrenamiento se realizó con LLaMAFactory y el parche de UnSloth para acelerar el fine-tuning. No se detalla la composición del dataset `news_finetune_train`, ni si se empleó RLHF o DPO.

Los hiperparámetros declarados en la model card son: learning rate 1e-4, batch size de 1 con acumulación de gradientes de 4, optimizador AdamW con betas (0.9, 0.999), scheduler con cosine y warmup del 10%, 3 épocas y precisión mixta nativa (AMP). La pérdida de validación final alcanzada fue de 0.5046 tras 1926 pasos.

## Capacidades

- Generación de texto e instrucciones: heredadas del modelo base, adaptadas al dataset de noticias.
- Conversación multi-turno: puede utilizarse con la plantilla de chat de Qwen, aunque no se ha validado esta capacidad tras el fine-tuning.
- Tool calling: no disponible en la documentación; usar con precaución si se espera esta función.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible, depende del modelo base y del dataset de entrenamiento.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente de redacción periodística: puede generar borradores de titulares o resúmenes a partir de textos de noticias. Su tamaño de 0.5B permite integrarlo en herramientas de edición con baja latencia.
- Clasificación de noticias por temática: mediante prompting en cero disparos, puede etiquetar artículos en categorías como política, economía o deportes, ideal para sistemas de recomendación de contenido.
- Análisis de sentimiento en comentarios o artículos: adecuado para monitorizar opiniones públicas en foros o redes. Se puede ejecutar en CPU para procesar grandes volúmenes a bajo coste.
- Extracción de entidades y datos estructurados: con instrucciones explícitas, puede extraer nombres, fechas y cifras de textos periodísticos; útil para pipelines de parsing en redacciones.
- Chat interno para editores con RAG: combinando el modelo con una base vectorial propia sobre artículos históricos, se puede crear un asistente de consulta para el equipo.
- Enriquecimiento de metadatos en CMS: puede generar keywords, descripciones cortas o etiquetas para artículos, automatizando tareas de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de validación de 0.5046 reportada en la model card, que no es un benchmark estándar y no permite comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo base en fp16 requiere aproximadamente 1 GB de VRAM; sumando el adaptador, el consumo es ligeramente superior. Con cuantización de 4 bits, puede reducirse a unos 0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB, como RTX 3060, T4 o RTX 4050. También puede ejecutarse en CPU, aunque con menor velocidad.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: `transformers` con `PeftModel` para cargar el adaptador, `vLLM` si se fusiona previamente, `llama.cpp` tras convertir el modelo fusionado a GGUF, y `Ollama`.
- Latencia y throughput: no disponible. Al tratarse de un modelo de 0.5B, se espera baja latencia en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mo22zy/LLM-fineTune-LLaMAFactory-UnSloth | 0.5B + adaptador | 32768 | Apache 2.0 | PEFT en HuggingFace |
| Qwen2.5-0.5B-Instruct | 0.5B | 32768 | Apache 2.0 | HuggingFace |
| SmolLM2-360M-Instruct | 360M | 8192 | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Apache 2.0 | HuggingFace |

No se pueden comparar benchmarks debido a la ausencia de métricas publicadas del adaptador. Los otros modelos son instructs generales con fines distintos.

## Limitaciones y advertencias

- Al ser un adaptador PEFT, no es autónomo: requiere el modelo base `Qwen2.5-0.5B-Instruct` para cualquier inferencia.
- No se ha documentado el dataset de entrenamiento, por lo que se desconocen sesgos y riesgos de alucinación específicos.
- La pérdida de validación de 0.5046 se obtuvo sobre un dataset no descrito; no constituye una garantía de calidad en tareas reales.
- Sin benchmarks públicos, el rendimiento declarado no es verificable.
- El tamaño de 0.5B limita la capacidad de razonamiento complejo, matemáticas avanzadas y tareas que exijan contexto muy extenso.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la procedencia y licencia del dataset de noticias si se va a emplear en producción.
- Los idiomas soportados no se especifican; pueden existir fallos en lenguas distintas de las incluidas en el entrenamiento del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/mo22zy/LLM-fineTune-LLaMAFactory-UnSloth
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- LLaMAFactory: https://github.com/hiyouga/LLaMAFactory
- GitHub de LLaMAFactory (fork Harry-yong): https://github.com/Harry-yong/LLaMAFactory
