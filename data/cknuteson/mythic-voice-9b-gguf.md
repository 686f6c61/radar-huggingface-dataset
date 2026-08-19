# cknuteson/mythic-voice-9b-GGUF

## Resumen

mythic-voice-9b es un modelo de lenguaje especializado en la generación de texto en un registro arcaico del inglés, inspirado en la tradición épica del norte de Europa (Malory, Morris, las Eddas, el Kalevala y la cadencia de la King James Version). Desarrollado por cknuteson, se construye a partir de Qwen3.5-9B mediante un pipeline de entrenamiento de tres fases: CPT (continual pretraining), SFT (supervised fine-tuning) y DPO (direct preference optimization), utilizando la herramienta persona-forge. El modelo está diseñado para mantener una voz épica consistente, aceptar cualquier persona definida por el usuario y resistir provocaciones, lo que lo hace adecuado para juegos de rol, narración de historias y aplicaciones de escritura creativa.

Con aproximadamente 8,95 mil millones de parámetros, el modelo se distribuye en formato GGUF (cuantización q8_0) y pesa 9,5 GB. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque el autor recomienda envolverlo con un filtro de salida (GuardedTeacher) para evitar la reproducción de nombres o expresiones protegidas por derechos de autor. El modelo no incluye un escenario ni personajes predefinidos; el usuario debe proporcionar la persona mediante un system prompt o una tarjeta de pack de persona-forge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0 (GGUF) |
| Idiomas soportados | No disponible (principalmente ingles arcaico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-9B, un modelo denso de 9B parámetros. Sobre esta base se aplicó un entrenamiento en tres etapas: primero, CPT sobre un corpus de dominio público en el registro épico arcaico; después, SFT y DPO sobre aproximadamente 1.970 filas sintéticas filtradas por un juez automático, que incluyen diálogos en registro, cuentos, roleplay guiado por packs y pares DPO de provocación y asignación de personaje. Cada muestra de entrenamiento pasó por un filtro de solapamiento de 8-gramas y una lista negra de nombres propios; de 2.102 candidatos, se conservaron 1.971.

El chat template fuerza el modo de pensamiento (thinking) desactivado en el límite de generación, ya que algunos entornos de inferencia lo activan por defecto. El token de fin de secuencia incluye `<|im_end|>` para que el cambio de turno funcione correctamente. El autor documenta que el modelo fue evaluado con una batería de pruebas de fuga de nombres protegidos: los pesos desnudos pasan el 89% de las 176 pruebas, mientras que con el filtro GuardedTeacher se alcanza el 100%.

## Capacidades

- Generación de texto en un registro arcaico y épico del inglés, con cadencia bíblica y medieval.
- Roleplay y narración de historias: acepta cualquier persona definida por el usuario mediante system prompt o pack de persona-forge.
- Resistencia a provocaciones: entrenado para mantener la voz y no salirse del personaje.
- Asignación de personaje: mantiene la coherencia del rol a lo largo de conversaciones multi-turno.
- Sin modo de pensamiento (thinking) activado por defecto, lo que reduce latencia en inferencia.
- Compatible con herramientas de inferencia GGUF como llama.cpp, LM Studio y otras.

## Casos de uso

- Juegos de rol de mesa digitales: el modelo puede interpretar un personaje con una voz épica consistente, gestionando diálogos largos y manteniendo la coherencia del mundo creado por el jugador.
- Escritura creativa asistida: generar pasajes narrativos en estilo arcaico para novelas, relatos o guiones, manteniendo un tono uniforme.
- Creación de contenido para videojuegos: diálogos de personajes no jugadores (NPC) con un registro medieval o mitológico, sin necesidad de ajustar el modelo por cada personaje.
- Asistentes de escritura con estilo personalizado: el usuario define una persona (por ejemplo, un bardo o un oráculo) y el modelo responde en ese registro para tareas de redacción o brainstorming.
- Herramientas educativas de literatura: simular conversaciones con personajes históricos o mitológicos en un inglés arcaico, útil para estudiar la lengua y el estilo.
- Prototipos de agentes conversacionales con identidad fija: el modelo puede servir como base para un chatbot con una personalidad épica definida, gracias a su capacidad de mantener la voz y resistir desvíos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas propias de evaluación:

| Metrica | Valor |
|---|---|
| Asignacion de personaje (assignment accuracy) | 1.0 |
| Coherencia en personaje (in-character) | 1.0 |
| Texto repetitivo (boilerplate) | 0.0 |
| Fidelidad de voz (voice) | 0.98 |
| Prueba de fuga de nombres protegidos (176 probes) | 89% (pesos desnudos), 100% (con GuardedTeacher) |

Estas métricas se obtuvieron con semillas de validación reservadas y reflejan el comportamiento específico del modelo en su dominio de uso.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF q8_0 pesa 9,5 GB, por lo que se recomienda al menos 12 GB de VRAM para cargarlo cómodamente en GPU.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 12 GB o más. También funciona en Apple Silicon (M1/M2/M3) con suficiente memoria unificada.
- En hardware de gama alta (por ejemplo, NVIDIA GB10), se reporta una velocidad de aproximadamente 20 tokens por segundo; en Apple Silicon el rendimiento es comparable.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si se convierte a formato compatible), y cualquier runtime que soporte GGUF.
- Para uso en producción con el filtro GuardedTeacher, se necesita un paso adicional de verificación de salida, lo que puede añadir latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (modelos de roleplay o estilo arcaico). El modelo base Qwen3.5-9B es el punto de partida, pero no se han publicado comparativas directas con otros fine-tunes similares. Se recomienda evaluar según las necesidades específicas del proyecto.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés arcaico; su rendimiento en otros idiomas o registros modernos no está garantizado.
- Aunque el entrenamiento excluye nombres y expresiones de mundos ficticios modernos, los pesos desnudos aún pueden filtrar conocimiento del modelo base (89% de pase en pruebas de fuga). Para uso público, se recomienda envolver el modelo con un filtro de salida como GuardedTeacher.
- Puede generar alucinaciones o contenido incoherente en contextos fuera de su dominio de entrenamiento.
- La longitud de contexto no está documentada; se desconoce el límite exacto de tokens que puede manejar sin degradación.
- El modelo no incluye un sistema de moderación de contenido; el usuario es responsable de implementar salvaguardas adicionales si es necesario.
- La licencia Apache 2.0 permite uso comercial, pero el autor no asume responsabilidad sobre el uso indebido del contenido generado.

## Enlaces

- Repositorio HuggingFace: [cknuteson/mythic-voice-9b-GGUF](https://huggingface.co/cknuteson/mythic-voice-9b-GGUF)
- Pipeline persona-forge: [github.com/ctkadvisors/persona-forge](https://github.com/ctkadvisors/persona-forge)
