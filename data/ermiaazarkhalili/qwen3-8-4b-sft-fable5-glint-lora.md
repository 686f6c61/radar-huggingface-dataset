# ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint-LoRA

## Resumen

Este adaptador LoRA, publicado por ermiaazarkhalili, es el resultado de un fine-tuning supervisado con QLoRA en 4 bits sobre el modelo base empero-ai/Qwen3.8-4B, utilizando el dataset Fable-5-Glint-Clean. El adaptador se distribuye en formato safetensors con la librería peft y está diseñado para cargarse sobre el modelo base mediante la API de Transformers. El entrenamiento se realizó con una longitud de secuencia de 4096 tokens, tres épocas y una pérdida final de 0.6078, lo que indica una convergencia razonable sobre el dataset de entrenamiento. Este adaptador resulta útil para desarrolladores que trabajan con modelos de la serie Qwen3.8 de 4B y necesitan una versión especializada en el dominio del dataset mencionado, aunque no se han publicado evaluaciones externas ni datos sobre su alcance real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (seo base: empero-ai/Qwen3.8-4B) |
| Parametros totales | No disponible (adaptador LoRA de 0.1 GB) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 4096 |
| Tipos de cuantizacion | QLoRA 4-bit (entrenamiento), 16-bit (versión mergeada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se obtuvo mediante fine-tuning supervisado con QLoRA en 4 bits sobre el modelo base empero-ai/Qwen3.8-4B. La configuración de LoRA utiliza un rango r=16, alpha=16, dropout=0 y bias=none, con un total de 12 módulos objetivo que incluyen proyecciones de atención (q, k, v, o) y de MLP (gate, up, down), además de proyecciones adicionales (`in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `out_proj`). El entrenamiento se realizó con una longitud de secuencia de 4096 tokens, un batch efectivo de 8, una tasa de aprendizaje de 0.0002 y tres épocas, alcanzando una pérdida de 0.6078. El dataset utilizado es `Fable-5-Glint-Clean`, del que no se aportan detalles de composición ni de tareas específicas. No se han publicado datos sobre la arquitectura del modelo base ni sobre innovaciones técnicas adicionales.

## Capacidades

- El adaptador hereda las capacidades de generación de texto del modelo base empero-ai/Qwen3.8-4B, que es un modelo de lenguaje de la serie Qwen3.8.
- Se especializa en el dominio del dataset `Fable-5-Glint-Clean`, aunque no se especifican las tareas concretas que cubre.
- Soporta contextos de hasta 4096 tokens, lo que permite manejar secuencias de longitud media.
- No se han documentado capacidades específicas de tool calling, agentes, visión o audio; el adaptador se limita a la generación de texto.

## Casos de uso

- Fine-tuning adicional: el adaptador puede servir como punto de partida para nuevos entrenamientos sobre el modelo base, aprovechando la especialización previa en el dataset.
- Evaluación de especialización: permite estudiar cómo el fine-tuning sobre `Fable-5-Glint-Clean` modifica el comportamiento del modelo en tareas de generación de texto.
- Investigación sobre LoRA: útil para analizar el efecto de la elección de r=16 y los módulos objetivo en un modelo de 4B.
- Despliegue con bajo coste: al ser un adaptador de 0.1 GB, se puede cargar sobre el modelo base sin necesidad de duplicar los pesos completos, lo que facilita su integración en sistemas existentes.
- Comparación de variantes: permite comparar con el adaptador de r=64 del mismo autor (`Qwen3.8-4B-Function-Calling-xLAM-Unsloth`) para estudiar la influencia del rango en el rendimiento.
- Reproducibilidad de experimentos: el autor proporciona un notebook de entrenamiento, lo que permite replicar el proceso en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, pero la inferencia requiere cargar el modelo base empero-ai/Qwen3.8-4B.
- Asumiendo que el modelo base tiene aproximadamente 4B parámetros, se estima un uso de VRAM de 8-9 GB en 16-bit, 4-5 GB en 8-bit y 2-3 GB en 4-bit.
- GPUs recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3080, RTX 4090) para 16-bit; tarjetas con 4-6 GB (por ejemplo, RTX 3060, RTX 4060) para cuantización inferior.
- Opciones de despliegue: se puede usar con la librería peft y Transformers, o convertir el modelo mergeado a formatos como GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No disponible. No se conocen modelos directamente comparables con este adaptador, ya que está ligado al modelo base empero-ai/Qwen3.8-4B y no se publican especificaciones de este último.

## Limitaciones y advertencias

- El adaptador se ha entrenado sobre un único dataset (`Fable-5-Glint-Clean`) sin evaluación held-out reportada, por lo que su rendimiento en otros dominios es incierto.
- Hereda las capacidades, sesgos y términos de licencia del modelo base empero-ai/Qwen3.8-4B, cuya licencia no se especifica.
- No se dispone de información sobre sesgos específicos, riesgo de alucinación o limitaciones de idioma del adaptador.
- Para uso en producción, se recomienda validar el modelo en el dominio objetivo y verificar los términos de licencia del modelo base y del adaptador.
- El adaptador no incluye el modelo base; es necesario descargar ambos por separado y cargarlos conjuntamente.

## Enlaces

- [Adaptador LoRA en Hugging Face](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint-LoRA)
- [Modelo base empero-ai/Qwen3.8-4B](https://huggingface.co/empero-ai/Qwen3.8-4B)
- [Dataset Fable-5-Glint-Clean](https://huggingface.co/datasets/ermiaazarkhalili/Fable-5-Glint-Clean)
- [Modelo mergeado 16-bit Qwen3.8-4B-SFT-Fable5-Glint](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint)
- [Repositorio GitHub de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Página del modelo en FriendliAI](https://friendli.ai/models/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint)
- [Información sobre Qwen 3.8-Max en OpenLM.ai](https://openlm.ai/qwen3.8/)
