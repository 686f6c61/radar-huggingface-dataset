# game2player/Game2Player-9B-Thinking

## Resumen

Game2Player-9B-Thinking es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario game2player. El modelo está especializado en la generación de "experiencias de juego": recibe entradas de imagen y texto (pipeline `image-text-to-text`) y produce respuestas con bloques de razonamiento explícito (`thinking`), orientadas a la interacción con entornos de juego. El checkpoint publicado corresponde a una única época de entrenamiento sobre ejemplos de juego que contienen bloques de pensamiento no vacíos del asistente.

El entrenamiento combina datos destilados de dos profesores distintos: 14.336 registros de DeepSeek-v4.1-flash y 8.138 de MiniMax-m3.1-flash, que tras el preprocesado dejan 22.425 registros útiles (49 descartados). El resultado no es un modelo exclusivo de DeepSeek, sino una mezcla. Se trata de un fine-tuning completo del modelo de lenguaje con el codificador visual y el alineador congelados, realizado sobre 4 GPU H200 en BF16.

Con 9.409.813.744 parámetros y licencia Apache 2.0, el modelo es relevante para quienes necesitan un modelo de 9B con capacidades multimodales y modo de razonamiento para prototipado de agentes de juego. No obstante, el autor no ha publicado ninguna evaluación en benchmarks downstream, por lo que su rendimiento real está sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con codificador visual y alineador; clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el perfil de rollout del proyecto permite hasta 32.768 tokens de salida con `--thinking` activado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión base `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer multimodal con torre visual y alineador que se mantienen congelados durante el ajuste. El fine-tuning afecta únicamente al modelo de lenguaje: es un entrenamiento completo (no LoRA) en BF16 con ZeRO-2, checkpointing de gradientes, empaquetado de secuencias a 25K, batch global de 48, tasa de aprendizaje 1e-5 con schedule coseno y 3% de warmup, semilla 3407 y AdamW no fusionado. El entrenamiento se ejecutó en 4 GPU H200 y constó de 157 pasos de optimizador, todos ellos superados en las comprobaciones numéricas.

Los datos provienen de una mezcla de ejemplos de juego con bloques de pensamiento del asistente no vacíos, destilados de DeepSeek-v4.1-flash (14.336 registros) y MiniMax-m3.1-flash (8.138 registros), quedando 22.425 registros tras el preprocesado. No se menciona RLHF ni DPO; es exclusivamente SFT. El repositorio incluye los pesos de inferencia, los assets de tokenizer y processor, y assets suplementarios de tokenizer base y vídeo cuando faltaban en el checkpoint; no incluye estados del optimizador, estados RNG, datos de entrenamiento ni imágenes.

## Capacidades

- Generación de texto y razonamiento con modo `thinking`: produce bloques de pensamiento explícitos antes de la respuesta, entrenados específicamente sobre ejemplos con bloques no vacíos.
- Comprensión de imagen y texto: pipeline `image-text-to-text`, con codificador visual heredado de Qwen3.5.
- Interacción orientada a juegos: el proyecto Game2Player describe los modelos como generadores de "experiencias de juego", con formato de acción compatible con Qwen.
- Rollouts con control de presupuesto de salida: hasta 512 tokens con `--thinking` desactivado y hasta 32.768 tokens con `--thinking` activado según los perfiles del proyecto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue a través de la infraestructura de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades de agente multi-paso: no disponible de forma explícita, aunque el modo thinking y el formato de acción apuntan a uso en entornos interactivos.

## Casos de uso

- Agentes de juego por turnos: el modelo consume el estado visual del tablero o de la pantalla y el historial textual, y emite acciones en el formato Qwen. El modo thinking permite razonamientos largos (hasta 32.768 tokens de salida) en fases que requieren planificación.
- Prototipado de NPCs con percepción visual: al ser image-text-to-text, puede recibir capturas del entorno y generar diálogo o decisiones contextualizadas, útil para pruebas rápidas de diseño de personajes.
- Evaluación de modelos en PlayerBench: el proyecto Game2Player publica instrucciones para ejecutar los modelos localmente o contra un servidor de modelos existente, por lo que sirve como baseline reproducible en esa suite.
- Generación de trazas de razonamiento para destilación: al estar entrenado sobre bloques de pensamiento de DeepSeek y MiniMax, puede emplearse para producir cadenas de razonamiento etiquetadas en dominios de juego y alimentar posteriores ajustes.
- Investigación sobre SFT multimodal: el repositorio documenta hiperparámetros, procedencia y `training_summary.json`, lo que facilita reproducir o comparar recetas de fine-tuning completo con visión congelada en modelos de 9B.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` permite servirlo tras una API HTTP para integrarlo en pipelines de aplicaciones interactivas sin gestionar la infraestructura de GPU directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha realizado ninguna evaluación en benchmarks downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto.
- VRAM en cuantización de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia son adecuadas A100 80 GB, H100 y L40S. En consumer, una RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto limitado o en cuantización para contextos mayores.
- Despliegue: la model card solo documenta carga con `transformers` (versión que soporte Qwen3.5; el entorno de entrenamiento usa 5.16.1). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| Game2Player-9B-Thinking | 9,41B | no disponible | imagen-texto-texto | Apache 2.0 | ninguna |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | imagen-texto-texto | no disponible | no disponible |
| Game2Player-9B (variante sin thinking) | ~9B | no disponible | imagen-texto-texto | no disponible | no disponible |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada. La referencia más directa es el modelo base Qwen3.5-9B, del que este checkpoint hereda arquitectura, tokenizer y codificador visual, y la variante Game2Player-9B del mismo autor, que comparte proyecto pero no se detalla en la documentación consultada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks downstream, por lo que no puede afirmarse ninguna ventaja de rendimiento frente al modelo base.
- Riesgo de alucinación: al ser un SFT sobre trazas de razonamiento destiladas, puede reproducir errores de los profesores (DeepSeek-v4.1-flash y MiniMax-m3.1-flash) y generar cadenas de pensamiento plausibles pero incorrectas.
- Sesgos: no documentados; la mezcla de datos de dos profesores y el dominio de juego pueden introducir sesgos específicos no analizados.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento fuera del inglés o de los idiomas presentes en los datos de destilación.
- Contexto: la longitud de contexto no está especificada; el límite de 32.768 tokens de salida con thinking es una configuración del proyecto, no una garantía del checkpoint.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, una sola época de entrenamiento y 157 pasos de optimizador; es un artefacto de investigación, no un modelo validado para producción.
- Repositorio: no incluye datos de entrenamiento ni imágenes, lo que limita la auditoría y la reproducción exacta del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/game2player/Game2Player-9B-Thinking
- Variante sin thinking: https://huggingface.co/game2player/Game2Player-9B
- Repositorio del proyecto: https://github.com/game2player/Game2Player
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
