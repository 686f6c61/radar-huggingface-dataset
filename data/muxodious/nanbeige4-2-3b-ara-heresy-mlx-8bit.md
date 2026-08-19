# MuXodious/Nanbeige4.2-3B-ARA-heresy-mlx-8Bit

## Resumen

El modelo MuXodious/Nanbeige4.2-3B-ARA-heresy-mlx-8Bit es una conversión al formato MLX del modelo base MuXodious/Nanbeige4.2-3B-ARA-heresy, realizado por el usuario MuXodious. Se trata de una versión modificada de un modelo de la familia Nanbeige 4.2, orientada a eliminar los mecanismos de rechazo y censura habituales en los asistentes conversacionales. Los tags "heretic", "uncensored", "decensored" y "abliterated" indican que el modelo ha sido sometido a técnicas de abliteración (eliminación de direcciones de rechazo en los pesos) para producir respuestas sin restricciones temáticas.

El modelo está pensado para generación de texto conversacional en inglés y chino, con licencia Apache 2.0, y se distribuye en formato MLX con cuantización de 8 bits. Según los safetensors, el número real de parámetros es de 1.172.855.808 (aproximadamente 1,17 mil millones), aunque el nombre comercial sugiere 3B; esta discrepancia no está explicada por el autor. Es un modelo ligero, adecuado para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, no confirmado) |
| Parametros totales | 1.172.855.808 (según safetensors; el nombre indica 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (según nombre y tags) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Nanbeige4.2-3B-ARA-heresy. Por el nombre, se infiere que pertenece a la familia Nanbeige 4.2, que probablemente usa una arquitectura transformer estándar, pero no hay confirmación oficial en la documentación proporcionada. El proceso de entrenamiento tampoco está documentado; los tags sugieren que se aplicaron técnicas de abliteración para eliminar los rechazos del modelo original, así como posiblemente fine-tuning adicional para eliminar la censura. La conversión a MLX se realizó con mlx-lm versión 0.31.3, que transforma los pesos al formato optimizado para Apple Silicon, manteniendo la cuantización de 8 bits.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Soporte de chat multi-turno mediante plantilla de chat (si está definida en el tokenizador).
- Respuestas sin censura temática (modelo "uncensored" y "abliterated").
- Adecuado para tareas de generación de texto creativo, roleplay o simulación de personajes.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Creación de chatbots para roleplay o ficción interactiva: el modelo puede mantener conversaciones sin restricciones de contenido, lo que permite explorar temáticas adultas o controvertidas que otros asistentes rechazan.
- Generación de contenido creativo sin filtros: escritura de relatos, guiones o diálogos donde se requiere libertad temática.
- Asistente conversacional para pruebas de robustez frente a contenido ofensivo: investigadores pueden evaluar cómo responde un modelo sin mecanismos de seguridad ante prompts malintencionados.
- Prototipado rápido en entornos Apple Silicon: al ser ligero y en formato MLX, se integra fácilmente en aplicaciones macOS o iOS usando mlx-lm.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como base para ajustes en tareas concretas sin grandes requisitos de cómputo.
- Estudio de técnicas de abliteración: el modelo es un ejemplo práctico de cómo se eliminan los rechazos en un LLM, útil para investigación en seguridad y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MLX, está optimizado para Apple Silicon (M1, M2, M3 y superiores).
- Con 1,17 mil millones de parámetros y cuantización de 8 bits, el tamaño en memoria es aproximadamente 1,17 GB, más overhead del runtime. Se recomienda al menos 8 GB de RAM unificada para una experiencia fluida.
- GPU recomendada: integrada en Apple Silicon (GPU unificada). No requiere GPU dedicada de NVIDIA.
- Opciones de despliegue: mediante mlx-lm (Python) o integración en aplicaciones Swift/Objective-C con MLX.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño se espera una generación rápida en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se puede comparar con otros modelos pequeños de la misma categoría (generación de texto sin censura) como:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MuXodious/Nanbeige4.2-3B-ARA-heresy-mlx-8Bit | 1,17B | no disponible | Apache 2.0 | MLX |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Transformers, GGUF, MLX |
| Phi-3-mini-4k-instruct | 3,8B | 4K | MIT | Transformers, GGUF, MLX |

No obstante, estos modelos no están específicamente diseñados para ser "uncensored", por lo que la comparación directa no es posible sin benchmarks.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, ilegal o éticamente cuestionable. No debe usarse en aplicaciones orientadas al público general sin supervisión.
- El número de parámetros real (1,17B) es inferior al indicado en el nombre (3B), lo que puede afectar a la calidad de las respuestas en tareas complejas.
- No se dispone de información sobre la longitud de contexto, por lo que se desconoce si puede manejar conversaciones largas.
- Solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- El modelo es una conversión MLX, por lo que no es directamente compatible con frameworks como Transformers de HuggingFace sin conversión previa.
- No hay datos sobre sesgos, alucinaciones o limitaciones específicas del modelo base Nanbeige 4.2.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones legales según el contexto de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MuXodious/Nanbeige4.2-3B-ARA-heresy-mlx-8Bit
- Modelo base: https://huggingface.co/MuXodious/Nanbeige4.2-3B-ARA-heresy
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
