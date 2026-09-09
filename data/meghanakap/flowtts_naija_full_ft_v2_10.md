# MeghanaKap/flowtts_naija_full_ft_v2_10

## Resumen

Este modelo, desarrollado por MeghanaKap, es un modelo de generación de texto basado en la arquitectura Qwen2, con aproximadamente 505,9 millones de parámetros. Aunque el metadata de HuggingFace indica como modelo base YatharthS/MiraTTS (un sistema de síntesis de voz), el pipeline declarado es text-generation y las etiquetas apuntan a una arquitectura Qwen2 finetuneada con Unsloth y TRL. El nombre "flowtts_naija_full_ft" sugiere una relación con FlowTTS y con el inglés nigeriano ("naija"), aunque no hay documentación al respecto en la ficha del modelo.

Se trata de un modelo pequeño, de tamaño similar a Qwen2-0.5B, con licencia Apache-2.0 y soporte declarado del idioma inglés. El repositorio ocupa 2,0 GB en pesos safetensors, lo que corresponde aproximadamente a un almacenamiento en FP32. Al ser un modelo de 0,5B, está orientado a casos de uso de baja latencia y despliegue en hardware modesto, aunque la información disponible no permite validar sus capacidades reales al no haber benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (Transformer decoder-only) |
| Parametros totales | 505.882.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen2, un transformer decoder-only finetuneado mediante Supervised Fine-Tuning (SFT) con las librerías Unsloth y TRL. Según la model card, el entrenamiento se realizó "2x faster" gracias a Unsloth. El metadata indica que el modelo base es YatharthS/MiraTTS, lo que resulta contradictorio: MiraTTS es un sistema de síntesis de voz, mientras que el pipeline del modelo es text-generation. Esta discrepancia puede deberse a un error en los metadatos o a un proceso de fine-tuning en el que se partió de pesos de un modelo Qwen2 y se etiquetó incorrectamente el modelo base. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni la técnica de alineación (RLHF, DPO, etc.) empleada, más allá de SFT.

## Capacidades

- Generación de texto en inglés, según el pipeline text-generation declarado.
- Conversacional, según la etiqueta "conversational" en los metadatos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo inglés declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- El nombre "naija" sugiere posible especialización en inglés nigeriano, pero no está confirmado en la documentación.

## Casos de uso

- Asistente conversacional ligero en inglés: gracias a su tamaño reducido (0,5B), puede ejecutarse en dispositivos con recursos limitados, gestionando conversaciones sencillas en inglés en tiempo real.
- Investigación sobre técnicas de fine-tuning: al estar entrenado con Unsloth y TRL, sirve como caso de estudio para analizar el pipeline de SFT en modelos pequeños y evaluar mejoras de velocidad de entrenamiento.
- Prototipado rápido de sistemas de diálogo: su tamaño permite iteraciones rápidas en entornos de desarrollo sin necesidad de infraestructura de cómputo costosa.
- Generación de texto en inglés para entornos con restricciones de latencia: en aplicaciones donde la velocidad de respuesta es prioritaria sobre la complejidad del razonamiento, este modelo puede ofrecer respuestas rápidas con bajo consumo de VRAM.
- Educación y experimentación académica: para estudiantes e investigadores que necesitan un modelo pequeño que quepa en memoria y sea fácil de analizar, modificar o visualizar sus pesos.
- Posible integración en pipelines de síntesis de voz: dado el nombre "flowtts_naija" y el modelo base declarado (MiraTTS, un sistema TTS), podría haber sido diseñado para generar texto destinado a un sistema de voz en inglés nigeriano, aunque no hay documentación que lo confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16, 0,5 GB en int8 y 0,25 GB en int4, calculado sobre los 505,9 millones de parámetros. El repositorio con pesos en safetensors ocupa 2,0 GB, lo que sugiere que los pesos originales están en FP32.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM, como RTX 2060, RTX 3060, RTX 4090. También es viable ejecutarlo en CPU.
- ¿Cabe en GPU de consumo? Sí, su tamaño permite ejecutarse en GPUs de consumo doméstico e incluso en integradas.
- Opciones de despliegue: transformers, vLLM, TGI y llama.cpp, con conversión a GGUF para Ollama. Los pesos safetensors permiten cargarlos con la API de HuggingFace Transformers o convertirlos a otros formatos.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MeghanaKap/flowtts_naija_full_ft_v2_10 | 505,9M | no disponible | Apache-2.0 | Fine-tune con Unsloth/TRL, inglés |
| Qwen2-0.5B | 494M | no disponible | Apache-2.0 | Modelo base de referencia, arquitectura Qwen2 |
| TinyLlama-1.1B | 1,1B | no disponible | Apache-2.0 | Alternativa pequeña con mayor capacidad de parámetros |

No hay datos de benchmarks disponibles para comparar el rendimiento real entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño (0,5B): capacidades de razonamiento limitadas en comparación con modelos más grandes.
- Solo inglés declarado: no se garantiza soporte para otros idiomas.
- Sin benchmarks publicados: no se puede evaluar su rendimiento real ni compararlo con otros modelos.
- Discrepancia en el metadata: el modelo base indicado (MiraTTS, un sistema TTS) no coincide con la arquitectura Qwen2 del pipeline text-generation. Esto puede indicar errores en la documentación o en la configuración del entrenamiento.
- Composición del dataset de entrenamiento desconocida: no se puede evaluar posibles sesgos ni la calidad de los datos de fine-tuning.
- Riesgo de alucinación inherente a modelos transformer pequeños.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la responsabilidad sobre el uso y las salidas del modelo recae en el usuario.
- El modelo no tiene actividad en HuggingFace (0 descargas, 0 likes), por lo que no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_10
- Modelo base declarado: https://huggingface.co/YatharthS/MiraTTS
- FlowTTS (Tencent-RTC): https://github.com/Tencent-RTC/FlowTTS
- Unsloth: https://github.com/unslothai/unsloth
