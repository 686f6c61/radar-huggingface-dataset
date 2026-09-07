# emese-tech/folyo

## Resumen

Emese-Folyó (22B) es un modelo de lenguaje en húngaro desarrollado por emese-tech, la variante flagship de la familia Emese orientada a servidores. Se construye sobre EuroLLM-22B mediante preentrenamiento continuado en húngaro, ajuste por instrucciones y alineación con DPO. Su arquitectura es LLaMA-style con 22.637 millones de parámetros, 54 capas, GQA 48Q/8KV, vocabulario de 128.000 tokens y una ventana de contexto de 32.768 tokens. Resuelve la necesidad de modelos de alta calidad específicos para húngaro en tareas conversacionales y de razonamiento, con licencia Apache-2.0 que facilita su uso en producción. Es relevante porque cubre un idioma infrarrepresentado y su alineación por DPO reduce repeticiones y confabulaciones, aunque su peso y requisitos de hardware limitan su despliegue a equipos potentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA-style (RoPE θ=1.000.000, GQA 48Q/8KV, SwiGLU, RMSNorm) |
| Parámetros totales | 22.637.328.384 (22B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (repo principal), MLX q8 (repo `folyo-mlx`) |
| Idiomas soportados | Húngaro (principal); otros idiomas heredados de EuroLLM-22B |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, estándar HF); MLX q8 en `folyo-mlx` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura LLaMA-style con 54 capas, dimensión oculta 6144, 48 cabezas de consulta y 8 cabezas KV, activación SwiGLU y normalización RMSNorm. El vocabulario es multilingüe SentencePiece de 128.000 tokens, heredado de EuroLLM-22B. El entrenamiento se realizó en tres fases: preentrenamiento continuado (CPT) en húngaro sobre el corpus Emese con aproximadamente 6 millones de tokens y 6.000 iteraciones usando LoRA rank 64, con re-cuantización a q8 tras la fusión; ajuste por instrucciones (SFT) durante 1 época (4.914 iteraciones) sobre el corpus `instruct_v18b`, con LoRA rank 16, dropout 0.1, tasa de aprendizaje 5e-6 y las 14 capas inferiores congeladas, seleccionando el checkpoint de la iteración 3.600 como el mejor; y alineación con DPO-lite durante 120 iteraciones sobre 36 pares de preferencia escritos manualmente, con LoRA rank 16 y tasa de aprendizaje 2e-6. La ventana de contexto nativa se mantiene en 32.768 tokens, sin extensiones posteriores.

## Capacidades

- Generación de texto en húngaro con estilo conversacional mediante plantilla ChatML.
- Razonamiento multi-step: el corpus de SFT incluye tareas de razonamiento en varios pasos, aunque el benchmark muestra debilidad en matemáticas multi-step y puzzles de lógica.
- Soporte de tool calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Capacidades multilingües limitadas: calidad en otros idiomas heredada de EuroLLM-22B; en la práctica el modelo tiende a responder en húngaro incluso cuando el usuario escribe en inglés.
- Escritura y depuración de código: el corpus de entrenamiento incluye tareas de code y code-debug, y el benchmark reporta rendimiento casi perfecto en code-writing.
- Traducción de y hacia húngaro: el benchmark reporta rendimiento casi perfecto en traducción.
- Memoria in-context y roleplay: el benchmark destaca un 10/10 en ambas tareas, el mejor de la familia.
- Anti-confabulación y anti-repetición: entrenado explícitamente para reducir alucinaciones y bucles de repetición.

## Casos de uso

- Atención al cliente en húngaro: el modelo gestiona conversaciones multi-turno usando la plantilla ChatML y requiere pasar el historial completo, lo que permite mantener el contexto en diálogos largos.
- Generación y depuración de código: el corpus SFT incluye code y code-debug, y el benchmark reporta un rendimiento casi perfecto en code-writing, por lo que es adecuado para asistencia de programación en húngaro.
- Traducción entre húngaro y otros idiomas: el modelo puede traducir documentos y conversaciones, aunque hay que indicar explícitamente el idioma de salida para evitar que responda en húngaro.
- Resumen y análisis de documentos extensos: la ventana de contexto de 32.768 tokens permite procesar textos largos, como informes o artículos, en una sola pasada.
- Sistemas de roleplay o personajes virtuales: el benchmark reporta un 10/10 en roleplay y memoria in-context, lo que lo hace útil para aplicaciones interactivas de personajes.
- Corrección y redacción en húngaro: el corpus incluye refinamiento multi-turno y anti-repetición, por lo que puede asistir en tareas de revisión y mejora de textos.
- Razonamiento con verificación humana: el modelo está entrenado en anti-confabulación y honestidad, pero sus alucinaciones en hechos específicos obligan a revisar cualquier salida crítica.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Ultimate Bench (0-250) | 211/250 (84%) |
| BlindSpot Bench (0-376) | 310/376 (family-best) |
| emese-bench v1 (500 pts, MLX q8) | 410/500 (82%) |

En la comparativa interna de la familia Emese, Folyó queda justo por detrás de Patak (413/500) y muy por delante de Csermely (211/500). El benchmark reporta rendimiento casi perfecto en seguridad, calibración de honestidad, conciencia de persona, lectura, traducción y escritura de código, sin bucles de repetición ni fugas de tokens de parada. Los puntos débiles se concentran en matemáticas multi-step, puzzles de lógica y dos biografías de científicos húngaros fabricadas con confianza.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 42 GB en bf16 y 22 GB en MLX q8.
- VRAM estimada para inferencia: para bf16 se necesita más de 42 GB de VRAM si se carga el modelo completo; para q8, se necesitan al menos 22 GB, por lo que una GPU de 24 GB podría alojarlo con margen muy ajustado.
- GPU recomendadas: para bf16 se recomiendan GPUs de 80 GB como A100 o H100, o el uso de `device_map="auto"` con varias GPUs. Para q8, una RTX 4090 o similar con 24 GB podría servir, pero es necesario verificar la memoria disponible.
- Opciones de despliegue: `transformers` (HF) con carga en bfloat16 y `mlx_lm` para la versión MLX q8. El autor advierte explícitamente que no se debe convertir a GGUF sin re-validar, porque la ruta de inferencia de llama.cpp produce una regresión consistente de 14-27 puntos en Ultimate Bench.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | emese-bench v1 | Licencia |
|---|---|---|---|---|
| Emese-Folyó (22B) | 22.637.328.384 | 32.768 tokens | 410/500 | Apache-2.0 |
| Emese-Patak | No disponible | No disponible | 413/500 | Apache-2.0 |
| Emese-Csermely | No disponible | No disponible | 211/500 | Apache-2.0 |
| EuroLLM-22B (base) | 22B | 32.768 tokens | No disponible | Apache-2.0 |

Patak y Csermely pertenecen a la misma familia Emese y comparten el corpus de SFT, pero sus especificaciones técnicas no se detallan en la información disponible. EuroLLM-22B es el modelo base sobre el que se construye Folyó.

## Limitaciones y advertencias

- Puede alucinar hechos específicos como fechas o atribuciones; es necesario verificar los detalles críticos.
- Es un modelo húngaro-primero: la calidad en otros idiomas se hereda de EuroLLM-22B y puede ser inferior.
- El benchmark detectó que el modelo responde en húngaro incluso cuando el usuario escribe en inglés, lo que limita su uso en conversaciones multilingües sin instrucciones explícitas.
- Es un modelo grande: 42 GB en bf16 o 22 GB en q8, lo que exige una máquina con suficiente RAM o VRAM para un servicio práctico.
- No se recomienda convertir el modelo a GGUF sin re-validar, ya que la ruta de llama.cpp/GGUF provocó una regresión de 14-27 puntos en Ultimate Bench en pruebas de la misma familia.
- Puntos débiles conocidos en matemáticas multi-step, puzzles de lógica y biografías de científicos húngaros, donde puede fabricar datos con confianza.
- Para uso comercial, la licencia Apache-2.0 es permisiva, pero hay que revisar las condiciones de atribución y las limitaciones del modelo base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/emese-tech/folyo
- Organización emese-tech: https://huggingface.co/emese-tech
- Modelo base EuroLLM-22B: https://huggingface.co/utter-project/EuroLLM-22B
- Repo MLX q8 `folyo-mlx`: https://huggingface.co/emese-tech/folyo-mlx
- Web de Emese: https://emese.tech
