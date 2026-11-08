# game2player/Game2Player-4B-Thinking

## Resumen

Game2Player-4B-Thinking es un modelo multimodal image-text-to-text de 4.539 millones de parámetros (4,54 B) desarrollado por el usuario game2player. Se trata de un fine-tuning supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, orientado a la generación de "thinking blocks" no vacíos en ejemplos de juego, es decir, trazas de razonamiento intermedio que el modelo produce antes de emitir una acción o respuesta final. El modelo forma parte de la familia Game2Player, que incluye también una variante de 9B.

El modelo se entrena con una mezcla de datos procedentes de DeepSeek-v4.1-flash (14.336 registros seleccionados) y MiniMax-m3.1-flash (8.138 registros), quedando 22.425 registros tras el preprocesado. Es relevante porque aborda el ajuste de un modelo compacto de 4B para tareas de razonamiento con modo thinking explícito en entornos de juego, manteniendo las capacidades multimodales del Qwen3.5 original gracias a un congelado del encoder visual y del aligner durante el entrenamiento.

La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación. El repositorio contiene únicamente los pesos de inferencia y los assets de tokenizer/procesador, no los estados del optimizador ni los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), image-text-to-text |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en BF16; safetensors compatibles con cuantización estándar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 del modelo base, un transformer multimodal con encoder visual y aligner que permite la entrada conjunta de imagen y texto (pipeline image-text-to-text). Durante el fine-tuning se realizó un ajuste completo del modelo de lenguaje (full language-model fine-tuning) manteniendo congelados el encoder visual y el aligner, lo que preserva las capacidades de percepción visual del modelo base mientras se especializa el decodificador de texto en la generación de trazas de razonamiento.

El entrenamiento se llevó a cabo durante una época sobre 22.425 registros (tras filtrar 49 de los 22.474 originales), con 157 pasos finales. Se emplearon 4 GPUs H200, precisión BF16, estrategia ZeRO-2, gradient checkpointing, empaquetado de secuencias de 25K tokens, batch global de 48, learning rate de 1e-5 con schedule coseno y 3 % de warmup, semilla 3407. La revisión base es `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. No se registraron advertencias de overflow durante la ejecución.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto y produce respuestas textuales.
- Modo thinking: genera bloques de razonamiento intermedio no vacíos antes de la respuesta final, lo que permite trazas de decisión auditables.
- Razonamiento multi-paso orientado a entornos de juego (Game2Player), con formato de acción compatible con Qwen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: parcialmente implícito por el modo thinking y el formato de acción del ecosistema Game2Player, aunque no se detalla explícitamente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: integración con el harness Game2Player (perfiles `game2player-4b` y `game2player-9b`, flag `--thinking` con hasta 32.768 tokens de salida).

## Casos de uso

- Investigación en razonamiento de agentes de juego: el modelo permite estudiar cómo un modelo de 4B genera trazas de pensamiento antes de actuar, con la posibilidad de activar o desactivar el modo thinking según el presupuesto de tokens (512 sin thinking, 32.768 con thinking).
- Evaluación de modelos compactos en PlayerBench: sirve como baseline reproducible para comparar el rendimiento de modelos de 4B en tareas de juego frente a la variante de 9B y otros modelos del ecosistema.
- Generación de datos sintéticos de razonamiento: los thinking blocks producidos pueden emplearse para destilar trazas de razonamiento en modelos más pequeños o para aumentar datasets de SFT.
- Integración en pipelines de evaluación con servidores de modelo existentes: el harness Game2Player permite ejecutar el modelo localmente o contra un model server ya desplegado, facilitando pruebas A/B.
- Prototipado de asistentes multimodales especializados: al conservar el encoder visual congelado, puede emplearse en tareas donde la imagen aporte contexto (capturas de pantalla, estados de juego) y se requiera una respuesta razonada.
- Fine-tuning posterior (continued SFT): al estar liberado con licencia Apache 2.0 y pesos safetensors, puede servir como punto de partida para ajustes adicionales en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha realizado ninguna evaluación en benchmarks downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits: en torno a 3-4 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 4× H200; para inferencia es suficiente una GPU con al menos 16 GB (RTX 4090, A10, L4) en BF16, o GPUs de menor VRAM con cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16 (RTX 4090, RTX 4080) y en tarjetas de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (versión que soporte Qwen3.5; el entorno de entrenamiento usa Transformers 5.16.1), con posibilidad de servir mediante vLLM, TGI o llama.cpp si existe soporte para la arquitectura Qwen3.5 (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Game2Player-4B-Thinking | 4,54 B | No disponible | image-text-to-text | Apache 2.0 | Hugging Face (repo público) |
| Game2Player-4B | ~5 B (según búsqueda) | No disponible | image-text-to-text | No disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | image-text-to-text | No disponible | Hugging Face |

La comparativa con otros modelos de la misma categoría (por ejemplo, otros fine-tunes de Qwen3.5 para razonamiento) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación en benchmarks downstream, por lo que no existen métricas objetivas de calidad.
- El modelo se entrenó con datos de DeepSeek y MiniMax; puede heredar sesgos y estilos de esos modelos, así como posibles artefactos de destilación.
- Riesgo de alucinación inherente a los modelos de 4B y acentuado en modo thinking con contextos largos (hasta 32.768 tokens de salida).
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no especificada en la model card.
- La model card menciona autenticación con una cuenta autorizada para un repositorio privado, lo que sugiere que el acceso pudo haber estado restringido; verificar la disponibilidad pública antes de integrarlo en producción.
- No se incluyen estados del optimizador, datos de entrenamiento ni imágenes, lo que limita la reproducibilidad exacta del entrenamiento.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias del modelo base Qwen3.5-4B y de los datos de destilación (DeepSeek, MiniMax) antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/game2player/Game2Player-4B-Thinking
- Variante Game2Player-4B: https://huggingface.co/game2player/Game2Player-4B
- Repositorio GitHub del proyecto: https://github.com/game2player/Game2Player
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
