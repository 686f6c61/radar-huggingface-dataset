# mradermacher/Qwen3.5-9B-RolePlay-Merged-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `DGDGDG12/Qwen3.5-9B-RolePlay-Merged`, un merge orientado a roleplay y conversación basado en la familia Qwen3.5 de Alibaba. La cuantización ha sido realizada por mradermacher, un conocido proveedor de formatos GGUF optimizados para inferencia local. El modelo resultante está pensado para ejecutarse en entornos con recursos limitados, como GPUs de consumo o CPU, manteniendo un equilibrio entre tamaño y calidad.

El archivo principal es una cuantización `i1-Q2_K` de 3,9 GB y una `i1-IQ3_M` de 4,5 GB, ambas con matriz de importancia (imatrix) para mejorar la precisión de los cuantos. El modelo base tiene aproximadamente 8,95 mil millones de parámetros, lo que lo sitúa en la gama de modelos de 9B. Está etiquetado como orientado a conversación y roleplay, con soporte del idioma inglés. No se dispone de información sobre la licencia ni sobre detalles de arquitectura interna en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, heredada de Qwen3.5, pero no confirmado) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (3,9 GB), i1-IQ3_M (4,5 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se proporcionan detalles específicos sobre la arquitectura del modelo base ni sobre su entrenamiento en la información disponible. El modelo original `DGDGDG12/Qwen3.5-9B-RolePlay-Merged` es un merge de pesos, probablemente basado en la arquitectura Qwen3.5-9B de Alibaba, que según documentación externa es un transformer con atención de consultas agrupadas (GQA) y posiblemente otras optimizaciones. Sin embargo, no se confirma en esta ficha.

El proceso de cuantización realizado por mradermacher utiliza la técnica de imatrix (importance matrix) para calibrar los cuantos, lo que mejora la calidad respecto a cuantizaciones estáticas. No hay información sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto conversacional y roleplay, con énfasis en mantener personajes y estilos narrativos.
- Soporte de diálogos multi-turno, aunque la longitud de contexto no está documentada.
- Probablemente hereda capacidades de razonamiento y generación de código de Qwen3.5, pero no se ha verificado en este modelo específico.
- Idioma principal: inglés. No se indica soporte multilingüe.
- No se menciona soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Roleplay interactivo: el modelo está diseñado para mantener conversaciones con personajes ficticios, útil para juegos de rol por texto o narrativas interactivas.
- Chatbots de entretenimiento: integración en aplicaciones de chat para simular personalidades o estilos de conversación.
- Prototipado de asistentes conversacionales: dado su tamaño moderado, se puede desplegar en entornos de desarrollo para probar interacciones antes de escalar a modelos mayores.
- Generación de historias y diálogos creativos: puede usarse como herramienta de escritura asistida para crear guiones o diálogos.
- Fine-tuning posterior: al ser un merge de Qwen3.5, puede servir como punto de partida para ajuste fino en tareas específicas de conversación.
- Inferencia en dispositivos con recursos limitados: las cuantizaciones GGUF permiten ejecutar el modelo en GPUs de consumo (p. ej., RTX 3060, 4060) o incluso en CPU con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada: las cuantizaciones de 3,9 GB y 4,5 GB requieren al menos 4-6 GB de VRAM para inferencia con contexto moderado. Se recomienda 8 GB para mayor comodidad.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o superiores. También puede ejecutarse en CPU con 16 GB de RAM.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, y cualquier runtime que soporte GGUF (vLLM con soporte GGUF, aunque menos común).
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de roleplay de tamaño similar. El modelo base Qwen3.5-9B podría compararse con otros 9B como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento específicos para este merge cuantizado. Se indica "no disponible".

## Limitaciones y advertencias

- Al ser un modelo de roleplay, puede generar contenido inapropiado o sesgado, dependiendo del contexto.
- Riesgo de alucinaciones y respuestas inconsistentes, especialmente en cuantizaciones agresivas como Q2_K.
- Longitud de contexto no documentada; puede degradarse con diálogos muy largos.
- Solo soporta inglés; no se garantiza buen comportamiento en otros idiomas.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Se recomienda contactar con el autor del modelo base.
- El modelo es una cuantización de un merge, por lo que puede heredar limitaciones de los modelos originales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-RolePlay-Merged-i1-GGUF
- Modelo base: https://huggingface.co/DGDGDG12/Qwen3.5-9B-RolePlay-Merged
- Cuantización estática (sin imatrix): https://huggingface.co/mradermacher/Qwen3.5-9B-RolePlay-Merged-GGUF
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Documentación de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5
