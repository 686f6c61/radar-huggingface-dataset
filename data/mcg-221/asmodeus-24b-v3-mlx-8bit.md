# McG-221/Asmodeus-24B-v3-mlx-8Bit

## Resumen

Asmodeus-24B-v3-mlx-8Bit es una conversión a formato MLX con cuantización de 8 bits del modelo DarkArtsForge/Asmodeus-24B-v3, realizada por McG-221. El modelo original es un merge creado con mergekit, basado en arquitectura Mistral, orientado a escritura creativa, generación de ficción, roleplay y narración de historias en inglés. Esta versión MLX está pensada para ejecutarse de forma eficiente en dispositivos Apple Silicon mediante la librería mlx-lm.

La relevancia de este modelo radica en su especialización en tareas de escritura narrativa y su disponibilidad en un formato optimizado para hardware de Apple, lo que facilita su uso local en entornos de desarrollo creativo. Aunque el nombre sugiere 24 mil millones de parámetros, el archivo safetensors reporta 6.630.048.000 parámetros, posiblemente debido a una cuantización o a un error en el registro; el tamaño del repositorio es de 25,1 GB, coherente con un modelo de 24B en 8 bits. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (merge con mergekit) |
| Parametros totales | 6.630.048.000 (según safetensors; el nombre indica 24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original. Los tags indican que es un merge basado en Mistral, creado con mergekit, y que el dataset utilizado para el merge es OccultAI/illuminati_imatrix_v1. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La conversión a MLX se realizó con mlx-lm versión 0.31.2, manteniendo los pesos en 8 bits.

## Capacidades

- Generación de texto creativo: ficción, ciencia ficción, romance, terror y otros géneros.
- Escritura de tramas y subtramas, continuación de escenas y narración vívida.
- Roleplay y conversación interactiva con personajes.
- Soporte de plantillas de chat mediante el tokenizador (apply_chat_template).
- No se mencionan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar borradores de capítulos, diálogos y descripciones vívidas, ayudando a autores a superar bloqueos creativos.
- Creación de campañas de rol: permite generar tramas, personajes y escenarios para juegos de rol de mesa o videojuegos.
- Generación de guiones y storyboards: útil para creadores de contenido audiovisual que necesitan ideas de escenas o diálogos.
- Roleplay conversacional: puede mantener conversaciones con personajes ficticios, adecuado para chatbots de entretenimiento.
- Expansión de ideas: a partir de una premisa breve, el modelo desarrolla subtramas y giros argumentales.
- Asistencia en escritura de novelas por entregas: su capacidad para continuar escenas facilita la producción serializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 25,1 GB, por lo que se recomienda al menos 32 GB de memoria unificada en Apple Silicon para cargar el modelo en 8 bits.
- GPU recomendadas: Apple M1 Pro/Max/Ultra o M2/M3 con 32 GB o más de RAM unificada.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño, aunque podría ejecutarse con cuantizaciones más agresivas si se convierte a otro formato.
- Opciones de despliegue: mlx-lm (Python), compatible con entornos Apple Silicon. No se menciona soporte para vLLM, llama.cpp u Ollama en esta versión MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base DarkArtsForge/Asmodeus-24B-v3 no tiene benchmarks públicos en la información proporcionada. Se puede considerar que compite con otros modelos de escritura creativa como Llama-3-8B o Mistral-7B, pero no hay datos objetivos de comparación.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored", lo que implica que puede generar contenido ofensivo, violento o sexualmente explícito sin filtros.
- Riesgo de alucinación: al ser un modelo de generación de texto, puede inventar hechos, nombres o eventos no verídicos.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no está documentada, por lo que puede haber limitaciones en conversaciones o textos muy largos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no especificadas.
- Al ser una conversión MLX, no es compatible directamente con entornos que esperan pesos en formato GGUF o FP16 estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McG-221/Asmodeus-24B-v3-mlx-8Bit
- Modelo base: https://huggingface.co/DarkArtsForge/Asmodeus-24B-v3
- Perfil del autor: https://huggingface.co/McG-221
- Versión v2: https://huggingface.co/McG-221/Asmodeus-24B-v2-mlx-8Bit
